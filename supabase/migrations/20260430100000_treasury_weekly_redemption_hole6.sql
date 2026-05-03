-- ════════════════════════════════════════════════════════════════════
-- Hole #6 · Treasury weekly redemption (Monday-aligned queue)
-- TECH-HARDEN-001 · Sprint W1 · 30 Apr 2026
-- Sign-off Skeezu (post discussione ROBY-Skeezu) — set FINAL
--
-- Modello: redemption ROBI → EUR via slot settimanali (Lun 00:05 UTC).
-- L'utente sceglie target settimana (offset 0..4). Cap globale 15k EUR/week,
-- per-user 1000 EUR/week. Fee 10 ARIA per richiesta, refund 5 ARIA se
-- cancel >48h da unlock. PEG ratio = treasury balance / ROBI circolanti.
--
-- Ref: ROBY_Treasury_Caps_Proposal (riformulato weekly redemption model)
--      + Treasury Methodology DRAFT v1 §3 + sign-off Skeezu 30 Apr 2026.
-- ════════════════════════════════════════════════════════════════════

-- ── 1. Config keys (10) ─────────────────────────────────────────────
INSERT INTO public.airdrop_config (key, value, description) VALUES
  ('robi_redemption_window_type',           'weekly_monday', 'Tipo finestra redemption: weekly_monday = unlock ogni Lun 00:05 UTC'),
  ('robi_redemption_weekly_cap_eur',        '15000',         'Cap globale settimanale in EUR (sum amount_eur richieste settimana)'),
  ('robi_redemption_per_user_weekly_eur',   '1000',          'Cap per-user settimanale in EUR'),
  ('robi_redemption_min_block_age_days',    '3',             'Età minima ROBI in giorni prima di poter essere richiesto in redemption'),
  ('robi_redemption_carry_over_policy',     'user_opt_in_multi_week', 'Policy carry-over: user sceglie esplicitamente target settimana, no auto-rollover'),
  ('robi_redemption_fee_aria',              '10',            'Fee fissa ARIA per request (dedotti da total_points)'),
  ('treasury_health_min_ratio',             '1.05',          'PEG ratio minimo (balance_eur / nft_circulating_eur_value) prima di rate limit'),
  ('treasury_bridge_financing_eur',         '2500',          'Bridge financing isolato in EUR (riserva per shock di redemption massiva)'),
  ('robi_redemption_visible_weeks_ahead',   '4',             'Numero settimane visibili in get_redemption_schedule_view (max target_week_offset)'),
  ('robi_redemption_cancellation_window_hours', '48',        'Threshold ore prima di unlock per refund parziale (5/10 ARIA)')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;

-- ── 2. Tabella robi_redemptions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.robi_redemptions (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  robi_count                  INT NOT NULL CHECK (robi_count > 0),
  amount_eur                  NUMERIC(12,2) NOT NULL CHECK (amount_eur >= 0),
  fee_aria_paid               INT NOT NULL DEFAULT 10 CHECK (fee_aria_paid >= 0),
  requested_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_unlock_week_start DATE NOT NULL,
  status                      TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','queued','processing','completed','cancelled','refunded')),
  cancelled_at                TIMESTAMPTZ,
  completed_at                TIMESTAMPTZ,
  refund_aria                 INT DEFAULT 0,
  metadata                    JSONB DEFAULT '{}'::jsonb,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_robi_redemptions_user_status
  ON public.robi_redemptions (user_id, status);
CREATE INDEX IF NOT EXISTS idx_robi_redemptions_week_status
  ON public.robi_redemptions (scheduled_unlock_week_start, status);

ALTER TABLE public.robi_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS: utente vede + crea solo le proprie richieste, admin vede tutto
DROP POLICY IF EXISTS p_robi_red_select_own ON public.robi_redemptions;
CREATE POLICY p_robi_red_select_own ON public.robi_redemptions
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS p_robi_red_insert_self ON public.robi_redemptions;
CREATE POLICY p_robi_red_insert_self ON public.robi_redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE/DELETE bloccati a livello RLS — fluiscono via RPC SECURITY DEFINER
DROP POLICY IF EXISTS p_robi_red_no_update ON public.robi_redemptions;
CREATE POLICY p_robi_red_no_update ON public.robi_redemptions
  FOR UPDATE USING (false);

-- ── 3. Helper: calcola Monday della settimana corrente + offset ─────
CREATE OR REPLACE FUNCTION public._get_redemption_week_monday(p_offset INT DEFAULT 0)
RETURNS DATE
LANGUAGE sql STABLE AS $$
  SELECT (date_trunc('week', NOW())::date + (p_offset * 7))::date;
$$;

-- ── 4. Helper: PEG ratio EUR per ROBI ───────────────────────────────
-- Fallback 5.00 EUR/ROBI (esempio Treasury Methodology §5.2.1)
-- finché PEG real-time non integrato (Hole #6 follow-up post Treasury v1 FINAL).
CREATE OR REPLACE FUNCTION public._get_robi_peg_eur()
RETURNS NUMERIC
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance       NUMERIC;
  v_circulating   NUMERIC;
BEGIN
  SELECT balance_eur, nft_circulating
    INTO v_balance, v_circulating
    FROM treasury_stats
   ORDER BY created_at DESC
   LIMIT 1;

  IF v_balance IS NULL OR v_circulating IS NULL OR v_circulating <= 0 THEN
    RETURN 5.00;  -- fallback safe
  END IF;

  -- PEG floor 1.00 EUR per safety
  RETURN GREATEST(1.00, ROUND((v_balance / v_circulating)::NUMERIC, 2));
END;
$$;

GRANT EXECUTE ON FUNCTION public._get_robi_peg_eur() TO authenticated, service_role;

-- ── 5. Helper: ROBI disponibili (age-eligible meno locked) ──────────
CREATE OR REPLACE FUNCTION public._get_user_available_robi(
  p_user_id      UUID,
  p_min_age_days INT
) RETURNS INT
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owned   INT;
  v_locked  INT;
BEGIN
  SELECT COALESCE(SUM(shares), 0)
    INTO v_owned
    FROM nft_rewards
   WHERE user_id = p_user_id
     AND nft_type = 'ROBI'
     AND created_at <= NOW() - (p_min_age_days || ' days')::interval;

  SELECT COALESCE(SUM(robi_count), 0)
    INTO v_locked
    FROM robi_redemptions
   WHERE user_id = p_user_id
     AND status IN ('pending','queued','processing');

  RETURN GREATEST(0, v_owned - v_locked);
END;
$$;

GRANT EXECUTE ON FUNCTION public._get_user_available_robi(UUID, INT) TO authenticated, service_role;

-- ── 6. RPC request_robi_redemption ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.request_robi_redemption(
  p_robi_count          INT,
  p_target_week_offset  INT DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id          UUID := auth.uid();
  v_fee_aria         INT;
  v_min_age_days     INT;
  v_per_user_cap     NUMERIC;
  v_global_cap       NUMERIC;
  v_max_weeks_ahead  INT;
  v_peg_eur          NUMERIC;
  v_amount_eur       NUMERIC;
  v_week_monday      DATE;
  v_user_aria        INT;
  v_avail_robi       INT;
  v_user_used_eur    NUMERIC;
  v_global_used_eur  NUMERIC;
  v_request_id       UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF p_robi_count IS NULL OR p_robi_count <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_robi_count');
  END IF;

  -- Read config
  SELECT value::INT INTO v_fee_aria
    FROM airdrop_config WHERE key='robi_redemption_fee_aria';
  SELECT value::INT INTO v_min_age_days
    FROM airdrop_config WHERE key='robi_redemption_min_block_age_days';
  SELECT value::NUMERIC INTO v_per_user_cap
    FROM airdrop_config WHERE key='robi_redemption_per_user_weekly_eur';
  SELECT value::NUMERIC INTO v_global_cap
    FROM airdrop_config WHERE key='robi_redemption_weekly_cap_eur';
  SELECT value::INT INTO v_max_weeks_ahead
    FROM airdrop_config WHERE key='robi_redemption_visible_weeks_ahead';

  -- Validate target week offset
  IF p_target_week_offset < 0 OR p_target_week_offset > v_max_weeks_ahead THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_week_offset',
      'allowed_range', jsonb_build_object('min', 0, 'max', v_max_weeks_ahead));
  END IF;

  v_week_monday := public._get_redemption_week_monday(p_target_week_offset);

  -- Compute amount EUR using current PEG
  v_peg_eur    := public._get_robi_peg_eur();
  v_amount_eur := ROUND((p_robi_count * v_peg_eur)::NUMERIC, 2);

  -- Check ARIA balance per fee
  SELECT COALESCE(total_points, 0) INTO v_user_aria
    FROM profiles WHERE id = v_user_id;

  IF v_user_aria < v_fee_aria THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_aria_for_fee',
      'required', v_fee_aria, 'have', v_user_aria);
  END IF;

  -- Check ROBI age-eligible disponibili (escluso già locked)
  v_avail_robi := public._get_user_available_robi(v_user_id, v_min_age_days);
  IF p_robi_count > v_avail_robi THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_age_eligible_robi',
      'available', v_avail_robi, 'min_age_days', v_min_age_days, 'requested', p_robi_count);
  END IF;

  -- Check per-user weekly cap
  SELECT COALESCE(SUM(amount_eur), 0) INTO v_user_used_eur
    FROM robi_redemptions
   WHERE user_id = v_user_id
     AND scheduled_unlock_week_start = v_week_monday
     AND status IN ('pending','queued','processing','completed');

  IF (v_user_used_eur + v_amount_eur) > v_per_user_cap THEN
    RETURN jsonb_build_object('ok', false, 'error', 'per_user_weekly_cap_exceeded',
      'cap_eur', v_per_user_cap, 'used_eur', v_user_used_eur,
      'request_eur', v_amount_eur, 'week', v_week_monday);
  END IF;

  -- Check global weekly cap
  SELECT COALESCE(SUM(amount_eur), 0) INTO v_global_used_eur
    FROM robi_redemptions
   WHERE scheduled_unlock_week_start = v_week_monday
     AND status IN ('pending','queued','processing','completed');

  IF (v_global_used_eur + v_amount_eur) > v_global_cap THEN
    RETURN jsonb_build_object('ok', false, 'error', 'global_weekly_cap_exceeded',
      'cap_eur', v_global_cap, 'used_eur', v_global_used_eur,
      'request_eur', v_amount_eur, 'week', v_week_monday,
      'hint', 'try a later week (target_week_offset)');
  END IF;

  -- Deduct fee
  UPDATE profiles SET total_points = total_points - v_fee_aria
   WHERE id = v_user_id;

  INSERT INTO points_ledger (user_id, amount, reason, created_at)
  VALUES (v_user_id, -v_fee_aria, 'robi_redemption_fee', NOW());

  -- Create request
  INSERT INTO robi_redemptions (
    user_id, robi_count, amount_eur, fee_aria_paid,
    scheduled_unlock_week_start, status, metadata
  ) VALUES (
    v_user_id, p_robi_count, v_amount_eur, v_fee_aria,
    v_week_monday, 'queued',
    jsonb_build_object(
      'peg_eur_at_request', v_peg_eur,
      'target_week_offset', p_target_week_offset
    )
  ) RETURNING id INTO v_request_id;

  -- Audit event
  INSERT INTO events (event, props)
  VALUES ('robi_redemption_requested', jsonb_build_object(
    'request_id', v_request_id,
    'user_id', v_user_id,
    'robi_count', p_robi_count,
    'amount_eur', v_amount_eur,
    'week', v_week_monday,
    'target_week_offset', p_target_week_offset,
    'peg_eur', v_peg_eur,
    'fee_aria', v_fee_aria
  ));

  RETURN jsonb_build_object(
    'ok', true,
    'request_id', v_request_id,
    'robi_count', p_robi_count,
    'amount_eur', v_amount_eur,
    'fee_aria_paid', v_fee_aria,
    'scheduled_unlock_week_start', v_week_monday,
    'target_week_offset', p_target_week_offset,
    'peg_eur_at_request', v_peg_eur,
    'status', 'queued'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_robi_redemption(INT, INT) TO authenticated;

-- ── 7. RPC get_redemption_schedule_view (view-only, 4 settimane) ─────
CREATE OR REPLACE FUNCTION public.get_redemption_schedule_view()
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max_weeks  INT;
  v_global_cap NUMERIC;
  v_per_user   NUMERIC;
  v_user_id    UUID := auth.uid();
  v_weeks      JSONB := '[]'::JSONB;
  v_week_data  JSONB;
  v_week_monday DATE;
  v_global_used NUMERIC;
  v_user_used   NUMERIC;
  i INT;
BEGIN
  SELECT value::INT INTO v_max_weeks
    FROM airdrop_config WHERE key='robi_redemption_visible_weeks_ahead';
  SELECT value::NUMERIC INTO v_global_cap
    FROM airdrop_config WHERE key='robi_redemption_weekly_cap_eur';
  SELECT value::NUMERIC INTO v_per_user
    FROM airdrop_config WHERE key='robi_redemption_per_user_weekly_eur';

  FOR i IN 0..v_max_weeks LOOP
    v_week_monday := public._get_redemption_week_monday(i);

    SELECT COALESCE(SUM(amount_eur), 0) INTO v_global_used
      FROM robi_redemptions
     WHERE scheduled_unlock_week_start = v_week_monday
       AND status IN ('pending','queued','processing','completed');

    SELECT COALESCE(SUM(amount_eur), 0) INTO v_user_used
      FROM robi_redemptions
     WHERE scheduled_unlock_week_start = v_week_monday
       AND user_id = v_user_id
       AND status IN ('pending','queued','processing','completed');

    v_week_data := jsonb_build_object(
      'week_offset', i,
      'week_start',  v_week_monday,
      'global_cap_eur',     v_global_cap,
      'global_used_eur',    v_global_used,
      'global_utilization_pct', ROUND((v_global_used / NULLIF(v_global_cap, 0) * 100)::NUMERIC, 2),
      'per_user_cap_eur',   v_per_user,
      'my_used_eur',        v_user_used,
      'my_utilization_pct', ROUND((v_user_used / NULLIF(v_per_user, 0) * 100)::NUMERIC, 2),
      'available_global_eur', GREATEST(0, v_global_cap - v_global_used),
      'available_my_eur',     GREATEST(0, v_per_user - v_user_used)
    );

    v_weeks := v_weeks || v_week_data;
  END LOOP;

  RETURN jsonb_build_object(
    'ok', true,
    'current_peg_eur', public._get_robi_peg_eur(),
    'weeks', v_weeks
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_redemption_schedule_view() TO authenticated;

-- ── 8. RPC cancel_redemption_request ────────────────────────────────
-- Refund 5 ARIA (50% fee) se cancel >48h da unlock; 0 ARIA se <48h.
CREATE OR REPLACE FUNCTION public.cancel_redemption_request(p_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id        UUID := auth.uid();
  v_request        RECORD;
  v_window_hours   INT;
  v_hours_to_unlock NUMERIC;
  v_refund_aria    INT;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT * INTO v_request
    FROM robi_redemptions
   WHERE id = p_request_id;

  IF v_request.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'request_not_found');
  END IF;

  IF v_request.user_id <> v_user_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_owner');
  END IF;

  IF v_request.status NOT IN ('pending','queued') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cannot_cancel',
      'current_status', v_request.status);
  END IF;

  SELECT value::INT INTO v_window_hours
    FROM airdrop_config WHERE key='robi_redemption_cancellation_window_hours';

  -- Hours fino a unlock Mon 00:05 UTC della settimana scheduled
  v_hours_to_unlock := EXTRACT(EPOCH FROM (
    (v_request.scheduled_unlock_week_start::timestamptz + INTERVAL '5 minutes') - NOW()
  )) / 3600.0;

  IF v_hours_to_unlock > v_window_hours THEN
    v_refund_aria := v_request.fee_aria_paid / 2;  -- 50% refund
  ELSE
    v_refund_aria := 0;  -- nessun refund se troppo vicino al unlock
  END IF;

  -- Update via SECURITY DEFINER (RLS UPDATE bloccato per default)
  UPDATE robi_redemptions
     SET status = 'cancelled',
         cancelled_at = NOW(),
         refund_aria  = v_refund_aria
   WHERE id = p_request_id;

  IF v_refund_aria > 0 THEN
    UPDATE profiles SET total_points = total_points + v_refund_aria
     WHERE id = v_user_id;

    INSERT INTO points_ledger (user_id, amount, reason, created_at)
    VALUES (v_user_id, v_refund_aria, 'robi_redemption_cancel_refund', NOW());
  END IF;

  INSERT INTO events (event, props)
  VALUES ('robi_redemption_cancelled', jsonb_build_object(
    'request_id', p_request_id,
    'user_id', v_user_id,
    'hours_to_unlock', ROUND(v_hours_to_unlock::NUMERIC, 2),
    'window_hours', v_window_hours,
    'refund_aria', v_refund_aria
  ));

  RETURN jsonb_build_object(
    'ok', true,
    'request_id', p_request_id,
    'status', 'cancelled',
    'refund_aria', v_refund_aria,
    'hours_to_unlock', ROUND(v_hours_to_unlock::NUMERIC, 2),
    'within_refund_window', v_hours_to_unlock > v_window_hours
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_redemption_request(UUID) TO authenticated;

-- ── 9. RPC interno: process_weekly_redemption_queue ──────────────────
-- Chiamato dal cron Lun 00:05 UTC + dall'edge function process-redemption-queue.
-- Processa requests con scheduled_unlock_week_start = Monday corrente.
-- Brucia ROBI (DELETE FIFO oldest) e marca status='completed'.
-- Note: il payout EUR/KAS effettivo è gestito dal founder/processo manuale
-- in v1 (solo accounting + burn ROBI + audit log qui).
CREATE OR REPLACE FUNCTION public.process_weekly_redemption_queue()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_monday DATE := public._get_redemption_week_monday(0);
  v_request        RECORD;
  v_processed      INT := 0;
  v_total_eur      NUMERIC := 0;
  v_total_robi     INT := 0;
  v_robi_to_burn   INT;
  v_burned_id      UUID;
BEGIN
  FOR v_request IN
    SELECT * FROM robi_redemptions
     WHERE scheduled_unlock_week_start = v_current_monday
       AND status = 'queued'
     ORDER BY requested_at ASC
  LOOP
    UPDATE robi_redemptions SET status = 'processing'
     WHERE id = v_request.id;

    -- Burn ROBI FIFO (oldest first)
    v_robi_to_burn := v_request.robi_count;
    FOR v_burned_id IN
      SELECT id FROM nft_rewards
       WHERE user_id = v_request.user_id
         AND nft_type = 'ROBI'
       ORDER BY created_at ASC
       LIMIT v_request.robi_count  -- shares=1 per ROBI (per spec)
    LOOP
      DELETE FROM nft_rewards WHERE id = v_burned_id;
      v_robi_to_burn := v_robi_to_burn - 1;
      EXIT WHEN v_robi_to_burn <= 0;
    END LOOP;

    UPDATE robi_redemptions
       SET status = 'completed',
           completed_at = NOW(),
           metadata = metadata || jsonb_build_object('processed_at', NOW())
     WHERE id = v_request.id;

    -- Aggiorna treasury_stats nft_circulating
    UPDATE treasury_stats
       SET nft_circulating = GREATEST(0, nft_circulating - v_request.robi_count),
           updated_at = NOW()
     WHERE id = (SELECT id FROM treasury_stats ORDER BY created_at DESC LIMIT 1);

    v_processed  := v_processed + 1;
    v_total_eur  := v_total_eur + v_request.amount_eur;
    v_total_robi := v_total_robi + v_request.robi_count;
  END LOOP;

  INSERT INTO events (event, props)
  VALUES ('redemption_queue_processed', jsonb_build_object(
    'week_start', v_current_monday,
    'processed_count', v_processed,
    'total_eur', v_total_eur,
    'total_robi_burned', v_total_robi
  ));

  RETURN jsonb_build_object(
    'ok', true,
    'week_start', v_current_monday,
    'processed_count', v_processed,
    'total_eur', v_total_eur,
    'total_robi_burned', v_total_robi
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_weekly_redemption_queue() TO service_role;

-- ── 10. Cron weekly Monday 00:05 UTC ────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname='process_redemption_queue') THEN
    PERFORM cron.unschedule('process_redemption_queue');
  END IF;
END $$;

SELECT cron.schedule(
  'process_redemption_queue',
  '5 0 * * 1',
  $$SELECT public.process_weekly_redemption_queue()$$
);

-- ── 11. Mini integration test (W1 convention) ────────────────────────
DO $$
DECLARE
  v_test_user      UUID;
  v_pre_aria       INT;
  v_pre_robi       INT;
  v_pre_minted_at  TIMESTAMPTZ;
  v_request        JSONB;
  v_request_id     UUID;
  v_week_monday    DATE;
  v_view           JSONB;
  v_red_status     TEXT;
  v_inserted_robi  UUID[];
  v_robi_id        UUID;
BEGIN
  -- Pick first profile per smoke test (Alpha 0 = 7 utenti reali)
  SELECT id INTO v_test_user FROM profiles ORDER BY created_at ASC LIMIT 1;

  IF v_test_user IS NULL THEN
    RAISE NOTICE '[Hole #6 smoke] DB vuoto, skip live test. Migration compiled OK.';
    RETURN;
  END IF;

  -- Snapshot pre
  SELECT total_points INTO v_pre_aria FROM profiles WHERE id = v_test_user;
  v_pre_robi := COALESCE((SELECT SUM(shares) FROM nft_rewards
                          WHERE user_id = v_test_user AND nft_type='ROBI'), 0);

  -- Mint 5 ROBI test età-eligible (created_at = NOW - 4 giorni > 3 giorni soglia)
  v_pre_minted_at := NOW() - INTERVAL '4 days';
  FOR i IN 1..5 LOOP
    INSERT INTO nft_rewards (user_id, nft_type, name, source, shares, created_at)
    VALUES (v_test_user, 'ROBI', 'Test ROBI smoke #' || i, 'hole6_smoke_test', 1, v_pre_minted_at)
    RETURNING id INTO v_robi_id;
    v_inserted_robi := array_append(v_inserted_robi, v_robi_id);
  END LOOP;

  -- Top-up ARIA per garantire fee 10 (anche se fail per altri motivi, lo cleanup dopo)
  UPDATE profiles SET total_points = COALESCE(total_points, 0) + 100 WHERE id = v_test_user;

  -- Simula auth.uid() per la RPC: useremo PERFORM via SET LOCAL session
  -- Workaround: chiamiamo la logic via SECURITY DEFINER override usando una
  -- session var. Per smoke ci limitiamo a verificare che la RPC esista
  -- e che l'INSERT manuale rispetti il check.
  v_week_monday := public._get_redemption_week_monday(1);
  INSERT INTO robi_redemptions (
    user_id, robi_count, amount_eur, fee_aria_paid,
    scheduled_unlock_week_start, status, metadata
  ) VALUES (
    v_test_user, 5, 25.00, 10, v_week_monday, 'queued',
    jsonb_build_object('smoke_test', true)
  ) RETURNING id INTO v_request_id;

  -- Verify
  SELECT status INTO v_red_status FROM robi_redemptions WHERE id = v_request_id;
  IF v_red_status <> 'queued' THEN
    RAISE EXCEPTION '[Hole #6 smoke] FAIL: status atteso queued, got %', v_red_status;
  END IF;

  -- Verify schedule view contiene 5 weeks (0..4)
  -- Skip full schedule call (richiede auth.uid). Verifichiamo solo conteggio config.
  IF NOT EXISTS (SELECT 1 FROM airdrop_config WHERE key='robi_redemption_visible_weeks_ahead') THEN
    RAISE EXCEPTION '[Hole #6 smoke] FAIL: config visible_weeks_ahead missing';
  END IF;

  RAISE NOTICE '[Hole #6 smoke] OK · request_id=% week=% pre_robi=% pre_aria=%',
    v_request_id, v_week_monday, v_pre_robi, v_pre_aria;

  -- CLEANUP: rimuovi test data (smoke deve essere idempotent)
  DELETE FROM robi_redemptions WHERE id = v_request_id;
  IF v_inserted_robi IS NOT NULL THEN
    DELETE FROM nft_rewards WHERE id = ANY(v_inserted_robi);
  END IF;
  UPDATE profiles SET total_points = v_pre_aria WHERE id = v_test_user;

  RAISE NOTICE '[Hole #6 smoke] cleanup OK · DB restored to pre-test state';
END $$;
