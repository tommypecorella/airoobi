-- ═══════════════════════════════════════════════════════════════
-- EARNINGS v2 — 19 Aprile 2026 (close F2)
-- ═══════════════════════════════════════════════════════════════
-- Policy earnings semplificata per Alpha Brave:
--
-- ARIA:
--   - Faucet 100/gg (già esistente, conservato)
--   - Streak giornaliero: +50 ARIA per ogni giorno timbrato (lun-dom).
--     Ogni settimana lun→dom completata → bonus +1 ROBI.
--
-- ROBI:
--   - Streak weekly complete → +1 ROBI
--   - Referral confirmed → +5 ROBI inviter + +5 ROBI new user
--   - Submission accettata → +1 ROBI (gestita in T2b)
--   - Airdrop completato (no fail/cancel) → +5 ROBI seller (T2b)
--   - Airdrop won → +5 ROBI winner (T2b)
--   - ROBI Scoperti nel rullo (al momento dell'acquisto) — TODO
--   - ROBI Mining (distribuzione a fine airdrop) → SOSPESI per ora
--
-- Rimosse: video claim, check-in +1 stand-alone, bonus streak 7gg ARIA
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 1. Tabella weekly_checkins (streak settimanale)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weekly_checkins (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start date NOT NULL,                             -- Monday of that week
  days_checked smallint[] NOT NULL DEFAULT ARRAY[]::smallint[],  -- ISO dow: 1=Mon .. 7=Sun
  robi_awarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, week_start)
);

ALTER TABLE weekly_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wc_read_own ON weekly_checkins;
CREATE POLICY wc_read_own ON weekly_checkins
  FOR SELECT USING (auth.uid() = user_id);

-- Admin può leggere tutto (per ABO)
DROP POLICY IF EXISTS wc_admin_read ON weekly_checkins;
CREATE POLICY wc_admin_read ON weekly_checkins
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- 2. RPC daily_checkin_v2()
--    Timbra il giorno corrente. +50 ARIA al primo timbro del giorno.
--    +1 ROBI al completamento della settimana (7/7).
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION daily_checkin_v2()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_today date := CURRENT_DATE;
  v_week_start date;
  v_day_of_week smallint;
  v_row weekly_checkins%ROWTYPE;
  v_already_today boolean := false;
  v_aria_awarded integer := 0;
  v_robi_awarded numeric := 0;
  v_completed boolean := false;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  -- Week start: Monday. Postgres date_trunc('week', ts) returns Monday-based.
  v_week_start := date_trunc('week', v_today)::date;
  v_day_of_week := EXTRACT(ISODOW FROM v_today)::smallint;  -- 1=Mon, 7=Sun

  SELECT * INTO v_row
  FROM weekly_checkins
  WHERE user_id = v_user_id AND week_start = v_week_start;

  IF NOT FOUND THEN
    INSERT INTO weekly_checkins (user_id, week_start, days_checked)
    VALUES (v_user_id, v_week_start, ARRAY[v_day_of_week]::smallint[])
    RETURNING * INTO v_row;
    v_aria_awarded := 50;
  ELSE
    IF v_day_of_week = ANY(v_row.days_checked) THEN
      v_already_today := true;
    ELSE
      UPDATE weekly_checkins
      SET days_checked = array_append(days_checked, v_day_of_week)
      WHERE user_id = v_user_id AND week_start = v_week_start
      RETURNING * INTO v_row;
      v_aria_awarded := 50;
    END IF;
  END IF;

  -- Award ARIA (50) se nuovo giorno timbrato
  IF v_aria_awarded > 0 THEN
    INSERT INTO points_ledger (user_id, amount, reason)
    VALUES (v_user_id, v_aria_awarded, 'streak_day');
    UPDATE profiles SET total_points = total_points + v_aria_awarded WHERE id = v_user_id;
  END IF;

  -- Award ROBI se settimana completata (7/7) e non già assegnato
  IF array_length(v_row.days_checked, 1) = 7 AND NOT v_row.robi_awarded THEN
    v_robi_awarded := 1;
    v_completed := true;
    UPDATE weekly_checkins
    SET robi_awarded = true
    WHERE user_id = v_user_id AND week_start = v_week_start;

    INSERT INTO nft_rewards (user_id, nft_type, name, source, shares, metadata)
    VALUES (
      v_user_id,
      'ROBI',
      'Streak settimanale completa',
      'streak_week',
      1,
      jsonb_build_object('week_start', v_week_start)
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'already_today', v_already_today,
    'aria_awarded', v_aria_awarded,
    'robi_awarded', v_robi_awarded,
    'week_complete', v_completed,
    'days_checked', v_row.days_checked,
    'day_of_week', v_day_of_week,
    'week_start', v_week_start
  );
END;
$$;

GRANT EXECUTE ON FUNCTION daily_checkin_v2() TO authenticated;

-- Deprecate old claim_checkin: ora rimanda al v2 per back-compat
CREATE OR REPLACE FUNCTION claim_checkin()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN daily_checkin_v2();
END;
$$;

COMMENT ON FUNCTION claim_checkin IS 'DEPRECATED 2026-04-19: wraps daily_checkin_v2. Use daily_checkin_v2 directly.';

-- ─────────────────────────────────────────────────────────────
-- 3. RPC confirm_referral()
--    Chiamata al primo login del nuovo utente (o a signup).
--    Award +5 ROBI inviter + +5 ROBI nuovo utente.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION confirm_referral()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_referred_by text;
  v_inviter_id uuid;
  v_already boolean;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT referred_by INTO v_referred_by FROM profiles WHERE id = v_user_id;
  IF v_referred_by IS NULL OR v_referred_by = '' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_referral_code');
  END IF;

  SELECT id INTO v_inviter_id FROM profiles WHERE referral_code = v_referred_by;
  IF v_inviter_id IS NULL OR v_inviter_id = v_user_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'inviter_not_found');
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM referral_confirmations
    WHERE referrer_id = v_inviter_id
      AND referred_id = v_user_id
      AND status = 'confirmed'
  ) INTO v_already;

  IF v_already THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_confirmed');
  END IF;

  INSERT INTO referral_confirmations (referrer_id, referred_id, status, confirmed_at)
  VALUES (v_inviter_id, v_user_id, 'confirmed', now());

  INSERT INTO nft_rewards (user_id, nft_type, name, source, shares, metadata)
  VALUES (
    v_inviter_id,
    'ROBI',
    'Referral — nuovo utente confermato',
    'referral_inviter',
    5,
    jsonb_build_object('referred_id', v_user_id)
  );

  INSERT INTO nft_rewards (user_id, nft_type, name, source, shares, metadata)
  VALUES (
    v_user_id,
    'ROBI',
    'Referral — benvenuto su AIROOBI',
    'referral_welcome',
    5,
    jsonb_build_object('inviter_id', v_inviter_id)
  );

  -- Update counter (se esiste)
  UPDATE profiles
  SET referral_count = COALESCE(referral_count, 0) + 1
  WHERE id = v_inviter_id;

  RETURN jsonb_build_object(
    'ok', true,
    'robi_inviter', 5,
    'robi_referred', 5,
    'inviter_id', v_inviter_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION confirm_referral() TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- 4. Helper: get my weekly streak snapshot (per UI)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_my_weekly_streak()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_week_start date := date_trunc('week', CURRENT_DATE)::date;
  v_row weekly_checkins%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false);
  END IF;

  SELECT * INTO v_row
  FROM weekly_checkins
  WHERE user_id = v_user_id AND week_start = v_week_start;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', true,
      'week_start', v_week_start,
      'days_checked', ARRAY[]::smallint[],
      'robi_awarded', false,
      'days_count', 0
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'week_start', v_row.week_start,
    'days_checked', v_row.days_checked,
    'robi_awarded', v_row.robi_awarded,
    'days_count', COALESCE(array_length(v_row.days_checked, 1), 0)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_my_weekly_streak() TO authenticated;
