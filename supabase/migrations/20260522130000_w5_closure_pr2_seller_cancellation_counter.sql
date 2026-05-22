-- W5 · Airdrop Closure Design v3 · PR-2 · Sistema counter annullamenti + ban venditore
-- ROBY_Airdrop_Closure_Design_LOCKED_2026-05-22 §6.
-- Counter per venditore su anno solare · 3 annullamenti → ban vendita 1 mese ·
-- sblocco anticipato 1000 ARIA · reset 1° gennaio (lazy, via counter_year).
-- Applicare PRIMA di PR-1 (PR-1 chiama register_seller_cancellation).

-- ─────────────────────────────────────────────────────────────
-- Tabella seller_cancellation_counter · una riga per venditore
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seller_cancellation_counter (
  seller_id            UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  counter              INTEGER NOT NULL DEFAULT 0,
  counter_year         INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::INT,
  ban_until            TIMESTAMPTZ,
  last_cancellation_at TIMESTAMPTZ,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_cancel_ban ON seller_cancellation_counter(ban_until)
  WHERE ban_until IS NOT NULL;

ALTER TABLE seller_cancellation_counter ENABLE ROW LEVEL SECURITY;

-- Il venditore vede solo la propria riga; gli admin tutto. Scritture solo via RPC SECURITY DEFINER.
DROP POLICY IF EXISTS "seller_read_own_counter" ON seller_cancellation_counter;
CREATE POLICY "seller_read_own_counter" ON seller_cancellation_counter FOR SELECT TO authenticated
  USING (seller_id = auth.uid() OR is_admin());

-- GRANT esplicito (default Supabase in evoluzione · feedback_supabase_grant_on_create_table)
GRANT SELECT ON seller_cancellation_counter TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- register_seller_cancellation · helper interno (NO grant authenticated)
-- Chiamato solo da altre funzioni SECURITY DEFINER (withdraw, seller_acknowledge, cron timeout).
-- Incrementa il counter dell'anno corrente · reset lazy se l'anno è cambiato ·
-- a counter >= 3 arma/ri-arma un ban di 1 mese.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION register_seller_cancellation(
  p_seller_id  UUID,
  p_reason     TEXT,
  p_airdrop_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_year      INT := EXTRACT(YEAR FROM NOW())::INT;
  v_counter   INT;
  v_ban_until TIMESTAMPTZ := NULL;
  v_banned    BOOLEAN := FALSE;
BEGIN
  IF p_seller_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'null_seller');
  END IF;

  -- Upsert con reset lazy dell'anno solare
  INSERT INTO seller_cancellation_counter (seller_id, counter, counter_year, last_cancellation_at, updated_at)
  VALUES (p_seller_id, 1, v_year, NOW(), NOW())
  ON CONFLICT (seller_id) DO UPDATE SET
    counter = CASE WHEN seller_cancellation_counter.counter_year = v_year
                   THEN seller_cancellation_counter.counter + 1
                   ELSE 1 END,
    counter_year = v_year,
    last_cancellation_at = NOW(),
    updated_at = NOW()
  RETURNING counter INTO v_counter;

  -- 3+ annullamenti nell'anno → ban (ri-armato a ogni annullamento oltre il 3°)
  IF v_counter >= 3 THEN
    v_ban_until := NOW() + INTERVAL '1 month';
    v_banned := TRUE;
    UPDATE seller_cancellation_counter
      SET ban_until = v_ban_until, updated_at = NOW()
    WHERE seller_id = p_seller_id;
  END IF;

  -- Notifica al venditore
  INSERT INTO notifications (user_id, type, title, body, airdrop_id)
  VALUES (
    p_seller_id,
    CASE WHEN v_banned THEN 'seller_banned' ELSE 'seller_cancellation_registered' END,
    CASE WHEN v_banned THEN 'Sospensione vendita attiva'
         ELSE 'Annullamento registrato' END,
    CASE WHEN v_banned
      THEN 'Hai raggiunto ' || v_counter || ' annullamenti quest''anno. Vendita sospesa fino al '
           || to_char(v_ban_until, 'DD/MM/YYYY') || '. Puoi sbloccarti subito con 1000 ARIA.'
      ELSE 'Annullamento registrato (' || v_counter || '/3 nell''anno solare). Al 3° scatta una sospensione vendita di 1 mese.'
    END,
    p_airdrop_id
  );

  RETURN jsonb_build_object('ok', true, 'counter', v_counter, 'banned', v_banned, 'ban_until', v_ban_until);
END; $$;

-- Funzione interna: REVOKE EXECUTE da tutti i ruoli pubblici per impedire chiamate
-- dirette via API. Senza, un authenticated qualsiasi potrebbe incrementare il counter
-- / bannare un altro venditore (la funzione si fida di p_seller_id, nessun auth.uid()
-- gate). NB: Supabase concede EXECUTE di default ad anon+authenticated via ALTER
-- DEFAULT PRIVILEGES → il REVOKE deve nominarli esplicitamente, FROM PUBLIC non basta.
-- Le chiamanti (withdraw, seller_acknowledge, cron timeout) sono SECURITY DEFINER
-- → girano come owner e mantengono EXECUTE anche dopo il REVOKE.
REVOKE EXECUTE ON FUNCTION register_seller_cancellation(UUID, TEXT, UUID) FROM PUBLIC, anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- is_seller_banned · helper read-only (grant authenticated)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_seller_banned(p_seller_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM seller_cancellation_counter
    WHERE seller_id = p_seller_id
      AND ban_until IS NOT NULL
      AND ban_until > NOW()
  );
$$;
GRANT EXECUTE ON FUNCTION is_seller_banned(UUID) TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- get_seller_cancellation_status · standing del venditore corrente (FE)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_seller_cancellation_status()
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid  UUID := auth.uid();
  v_row  RECORD;
  v_year INT := EXTRACT(YEAR FROM NOW())::INT;
  v_eff  INT;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED');
  END IF;
  SELECT * INTO v_row FROM seller_cancellation_counter WHERE seller_id = v_uid;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', true, 'counter', 0, 'counter_year', v_year,
                              'banned', false, 'ban_until', NULL);
  END IF;
  -- counter effettivo: 0 se l'anno è cambiato (reset lazy non ancora materializzato)
  v_eff := CASE WHEN v_row.counter_year = v_year THEN v_row.counter ELSE 0 END;
  RETURN jsonb_build_object(
    'ok', true,
    'counter', v_eff,
    'counter_year', v_year,
    'banned', (v_row.ban_until IS NOT NULL AND v_row.ban_until > NOW()),
    'ban_until', v_row.ban_until
  );
END; $$;
GRANT EXECUTE ON FUNCTION get_seller_cancellation_status() TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- unlock_seller_ban · sblocco anticipato 1000 ARIA · solo durante ban attivo
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION unlock_seller_ban()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid     UUID := auth.uid();
  v_row     RECORD;
  v_balance INT;
  v_cost    INT := 1000;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED');
  END IF;

  SELECT * INTO v_row FROM seller_cancellation_counter WHERE seller_id = v_uid FOR UPDATE;
  IF NOT FOUND OR v_row.ban_until IS NULL OR v_row.ban_until <= NOW() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NO_ACTIVE_BAN');
  END IF;

  SELECT COALESCE(total_points, 0) INTO v_balance FROM profiles WHERE id = v_uid;
  IF v_balance < v_cost THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INSUFFICIENT_ARIA',
                              'required', v_cost, 'available', v_balance);
  END IF;

  -- Addebito 1000 ARIA (pattern points_ledger + profiles.total_points · no trigger)
  UPDATE profiles SET total_points = total_points - v_cost WHERE id = v_uid;
  INSERT INTO points_ledger (user_id, amount, reason)
  VALUES (v_uid, -v_cost, 'seller_ban_unlock');

  -- Accredito al conto AIROOBI
  INSERT INTO platform_aria_ledger (amount, reason, related_user_id, metadata)
  VALUES (v_cost, 'seller_ban_unlock', v_uid,
          jsonb_build_object('previous_ban_until', v_row.ban_until));

  -- Sblocco: azzera counter + rimuove ban
  UPDATE seller_cancellation_counter
    SET counter = 0, counter_year = EXTRACT(YEAR FROM NOW())::INT,
        ban_until = NULL, updated_at = NOW()
  WHERE seller_id = v_uid;

  INSERT INTO notifications (user_id, type, title, body)
  VALUES (v_uid, 'seller_ban_unlocked', 'Sospensione rimossa',
          'Hai sbloccato la vendita con 1000 ARIA. Counter annullamenti azzerato.');

  RETURN jsonb_build_object('ok', true, 'aria_spent', v_cost, 'new_balance', v_balance - v_cost);
END; $$;
GRANT EXECUTE ON FUNCTION unlock_seller_ban() TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- withdraw_my_submission v3 · invariata + counter su ritiro mid-flight
-- Il counter scatta solo se l'airdrop era LIVE (presale|sale) al momento del ritiro.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION withdraw_my_submission(p_airdrop_id UUID)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id     UUID;
  v_airdrop     RECORD;
  v_part        RECORD;
  v_refunded    INT := 0;
  v_users_count INT := 0;
  v_was_live    BOOLEAN := FALSE;
  v_cancel      JSONB := NULL;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED');
  END IF;

  SELECT * INTO v_airdrop FROM airdrops
  WHERE id = p_airdrop_id AND submitted_by = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND_OR_NOT_OWNER');
  END IF;

  IF v_airdrop.status IN ('closed', 'completed', 'annullato') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'CANNOT_WITHDRAW_IN_STATUS_' || v_airdrop.status);
  END IF;

  -- Mid-flight = airdrop già live con partecipanti potenziali
  v_was_live := v_airdrop.status IN ('presale', 'sale');

  -- ── 1. Rimborsa ARIA a tutti i partecipanti attivi ──
  FOR v_part IN
    SELECT user_id, SUM(aria_spent) AS total_spent, SUM(blocks_count) AS total_blocks
    FROM airdrop_participations
    WHERE airdrop_id = p_airdrop_id AND cancelled_at IS NULL
    GROUP BY user_id
  LOOP
    UPDATE profiles SET total_points = total_points + v_part.total_spent
    WHERE id = v_part.user_id;

    INSERT INTO points_ledger (user_id, amount, reason)
    VALUES (v_part.user_id, v_part.total_spent, 'airdrop_annullato_refund:' || p_airdrop_id);

    INSERT INTO notifications (user_id, type, title, body, airdrop_id)
    VALUES (
      v_part.user_id, 'airdrop_cancelled_refund',
      'Airdrop annullato — ARIA rimborsati',
      'L''airdrop "' || v_airdrop.title || '" è stato annullato dal venditore. ' ||
      v_part.total_spent || ' ARIA sono stati rimborsati.',
      p_airdrop_id
    );

    v_refunded := v_refunded + v_part.total_spent;
    v_users_count := v_users_count + 1;
  END LOOP;

  -- ── 2-5. Annulla partecipazioni, blocchi, status ──
  UPDATE airdrop_participations SET cancelled_at = NOW()
  WHERE airdrop_id = p_airdrop_id AND cancelled_at IS NULL;

  DELETE FROM airdrop_blocks WHERE airdrop_id = p_airdrop_id;

  UPDATE airdrops SET blocks_sold = 0 WHERE id = p_airdrop_id;

  UPDATE airdrops
  SET status = 'annullato', rejection_reason = 'Ritirato dal proponente', updated_at = NOW()
  WHERE id = p_airdrop_id;

  -- ── 6. Counter annullamenti (solo se mid-flight) ──
  IF v_was_live THEN
    v_cancel := register_seller_cancellation(v_user_id, 'seller_withdraw_midflight', p_airdrop_id);
  END IF;

  -- ── 7. Notifica al venditore ──
  INSERT INTO notifications (user_id, type, title, body, airdrop_id)
  VALUES (
    v_user_id, 'submission_withdrawn', 'Proposta ritirata',
    'La tua proposta "' || v_airdrop.title || '" è stata ritirata. ' ||
    CASE WHEN v_refunded > 0
      THEN v_refunded || ' ARIA rimborsati a ' || v_users_count || ' partecipante/i.'
      ELSE 'Nessun partecipante da rimborsare.'
    END,
    p_airdrop_id
  );

  RETURN jsonb_build_object(
    'ok', true,
    'title', v_airdrop.title,
    'aria_refunded', v_refunded,
    'users_refunded', v_users_count,
    'cancellation', v_cancel
  );
END; $$;

-- ─────────────────────────────────────────────────────────────
-- submit_object_for_valuation (8-arg · overload live) + gate ban venditore
-- Identica a 20260421230000_platform_aria_ledger.sql, con il solo gate ban in testa.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.submit_object_for_valuation(
  p_title text,
  p_description text,
  p_category text,
  p_image_url text DEFAULT NULL,
  p_seller_desired_price numeric DEFAULT 0,
  p_seller_min_price numeric DEFAULT 0,
  p_image_urls jsonb DEFAULT '[]'::jsonb,
  p_duration_type text DEFAULT 'standard'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_user_id UUID;
  v_cost INTEGER;
  v_balance INTEGER;
  v_airdrop_id UUID;
  v_main_image TEXT;
  v_extra_images JSONB;
  v_dur TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'NOT_AUTHENTICATED');
  END IF;

  -- PR-2: gate ban venditore · un venditore sospeso non può avviare nuove vendite
  IF is_seller_banned(v_user_id) THEN
    RETURN json_build_object(
      'success', false, 'error', 'SELLER_BANNED',
      'ban_until', (SELECT ban_until FROM seller_cancellation_counter WHERE seller_id = v_user_id)
    );
  END IF;

  v_dur := COALESCE(NULLIF(p_duration_type, ''), 'standard');
  IF v_dur NOT IN ('flash', 'standard', 'extended') THEN
    v_dur := 'standard';
  END IF;

  SELECT COALESCE(value::INTEGER, 50) INTO v_cost
  FROM airdrop_config WHERE key = 'valuation_cost_aria';
  IF v_cost IS NULL THEN v_cost := 50; END IF;

  SELECT COALESCE(total_points, 0) INTO v_balance
  FROM profiles WHERE id = v_user_id;

  IF v_balance < v_cost THEN
    RETURN json_build_object(
      'success', false, 'error', 'INSUFFICIENT_ARIA',
      'required', v_cost, 'available', v_balance
    );
  END IF;

  IF p_seller_desired_price < 500 OR p_seller_min_price < 500 THEN
    RETURN json_build_object('success', false, 'error', 'MIN_PRICE_500');
  END IF;
  IF p_seller_min_price > p_seller_desired_price THEN
    RETURN json_build_object('success', false, 'error', 'MIN_GT_DESIRED');
  END IF;

  v_main_image := COALESCE(NULLIF(p_image_url, ''), p_image_urls->>0);
  IF p_image_url IS NOT NULL AND p_image_url != '' THEN
    v_extra_images := p_image_urls;
  ELSIF jsonb_array_length(p_image_urls) > 1 THEN
    v_extra_images := p_image_urls - 0;
  ELSE
    v_extra_images := '[]'::JSONB;
  END IF;

  UPDATE profiles SET total_points = total_points - v_cost WHERE id = v_user_id;

  INSERT INTO points_ledger (user_id, amount, reason)
  VALUES (v_user_id, -v_cost, 'valuation_request');

  INSERT INTO airdrops (
    title, description, category, image_url,
    seller_desired_price, seller_min_price,
    object_value_eur, block_price_aria, total_blocks,
    status, submitted_by, duration_type, product_info
  ) VALUES (
    p_title, p_description, p_category, v_main_image,
    p_seller_desired_price, p_seller_min_price,
    0, 0, 0,
    'in_valutazione', v_user_id, v_dur,
    CASE WHEN jsonb_array_length(v_extra_images) > 0
      THEN jsonb_build_object('extra_photos', v_extra_images)
      ELSE NULL
    END
  ) RETURNING id INTO v_airdrop_id;

  INSERT INTO platform_aria_ledger (amount, reason, related_airdrop_id, related_user_id, metadata)
  VALUES (v_cost, 'valuation_fee', v_airdrop_id, v_user_id, jsonb_build_object('title', p_title, 'category', p_category, 'duration_type', v_dur));

  RETURN json_build_object(
    'success', true,
    'airdrop_id', v_airdrop_id,
    'aria_spent', v_cost,
    'new_balance', v_balance - v_cost
  );
END;
$function$;

-- ─────────────────────────────────────────────────────────────
-- submit_object_for_valuation (7-arg · overload legacy) → delega all'8-arg
-- Senza FE noto che lo chiami, ma è callabile via API diretta: lo rendo un
-- thin wrapper sull'8-arg così il gate ban PR-2 (e ogni logica futura) vive
-- in un punto solo. Nessun bypass possibile da questo path.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.submit_object_for_valuation(
  p_title text,
  p_description text,
  p_category text,
  p_image_url text DEFAULT NULL,
  p_seller_desired_price numeric DEFAULT 0,
  p_seller_min_price numeric DEFAULT 0,
  p_image_urls jsonb DEFAULT '[]'::jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN public.submit_object_for_valuation(
    p_title, p_description, p_category, p_image_url,
    p_seller_desired_price, p_seller_min_price, p_image_urls, 'standard'
  );
END;
$function$;

-- ─────────────────────────────────────────────────────────────
-- Mini integration test (feedback_pr_integration_test) · verifiche strutturali
-- read-only. Le RPC sono auth-gated o mutanti → il test comportamentale completo
-- (3 annullamenti → ban, sblocco 1000 ARIA, reset anno solare) è negli UAT step
-- del closing report PR-2. Qui blocco la migration se lo schema non è coerente.
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  -- Tabella + colonna reset lazy
  IF to_regclass('public.seller_cancellation_counter') IS NULL THEN
    RAISE EXCEPTION 'PR-2 test FAIL · tabella seller_cancellation_counter mancante';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='seller_cancellation_counter'
                   AND column_name='counter_year') THEN
    RAISE EXCEPTION 'PR-2 test FAIL · colonna counter_year mancante (reset anno solare)';
  END IF;
  -- RLS attiva + policy SELECT own
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public'
                   AND tablename='seller_cancellation_counter' AND rowsecurity) THEN
    RAISE EXCEPTION 'PR-2 test FAIL · RLS non attiva su seller_cancellation_counter';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public'
                   AND tablename='seller_cancellation_counter'
                   AND policyname='seller_read_own_counter') THEN
    RAISE EXCEPTION 'PR-2 test FAIL · policy seller_read_own_counter mancante';
  END IF;
  -- Le 4 RPC del counter/ban + le 2 RPC ritoccate
  IF to_regprocedure('public.register_seller_cancellation(uuid,text,uuid)') IS NULL THEN
    RAISE EXCEPTION 'PR-2 test FAIL · register_seller_cancellation mancante';
  END IF;
  IF to_regprocedure('public.is_seller_banned(uuid)') IS NULL THEN
    RAISE EXCEPTION 'PR-2 test FAIL · is_seller_banned mancante';
  END IF;
  IF to_regprocedure('public.get_seller_cancellation_status()') IS NULL THEN
    RAISE EXCEPTION 'PR-2 test FAIL · get_seller_cancellation_status mancante';
  END IF;
  IF to_regprocedure('public.unlock_seller_ban()') IS NULL THEN
    RAISE EXCEPTION 'PR-2 test FAIL · unlock_seller_ban mancante';
  END IF;
  IF to_regprocedure('public.withdraw_my_submission(uuid)') IS NULL THEN
    RAISE EXCEPTION 'PR-2 test FAIL · withdraw_my_submission mancante';
  END IF;
  IF to_regprocedure('public.submit_object_for_valuation(text,text,text,text,numeric,numeric,jsonb,text)') IS NULL THEN
    RAISE EXCEPTION 'PR-2 test FAIL · submit_object_for_valuation 8-arg mancante';
  END IF;
  IF to_regprocedure('public.submit_object_for_valuation(text,text,text,text,numeric,numeric,jsonb)') IS NULL THEN
    RAISE EXCEPTION 'PR-2 test FAIL · submit_object_for_valuation 7-arg mancante';
  END IF;
  -- register_seller_cancellation NON deve essere eseguibile da authenticated/anon
  IF EXISTS (SELECT 1 FROM information_schema.routine_privileges
             WHERE routine_schema='public' AND routine_name='register_seller_cancellation'
               AND grantee IN ('authenticated','anon','PUBLIC')) THEN
    RAISE EXCEPTION 'PR-2 test FAIL · register_seller_cancellation eseguibile da ruolo pubblico (atteso REVOKE)';
  END IF;
  RAISE NOTICE 'PR-2 integration test OK · schema counter/ban + 4 RPC + gate submit (7/8-arg) + REVOKE verificati';
END $$;
