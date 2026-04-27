-- ════════════════════════════════════════════════════════════════════
-- Hole #1 · Sybil resistance — Layer D (welcome scaling 1k threshold)
-- + B2 (review ROBY): cleanup cron signup_attempts
-- TECH-HARDEN-001 · Sprint W1 · Day 2 · 27 Apr 2026
--
-- (1) Welcome scaling: full grant per i primi 1000 utenti (Alpha Brave),
--     poi reduced grant. Anti-Sybil: dopo soglia, attaccante guadagna meno.
-- (2) RPC claim_welcome_grant() — idempotente, atomic, scalata.
-- (3) Update handle_new_user per chiamare la RPC (sostituendo welcome inline).
--     A2 review ROBY: welcome NON più inline nel trigger → in RPC dedicata.
--     Layer C poi aggiungerà check phone_verified_at IS NOT NULL nella RPC.
-- (4) B2 review ROBY: cron weekly cleanup signup_attempts (retention 30gg).
-- ════════════════════════════════════════════════════════════════════

-- ── 1. Config keys per scaling ────────────────────────────────────
INSERT INTO public.airdrop_config (key, value, description) VALUES
  ('welcome_grant_aria_full',    '1000', 'Welcome ARIA per i primi welcome_threshold_users'),
  ('welcome_grant_aria_reduced', '300',  'Welcome ARIA dopo welcome_threshold_users (anti-Sybil scaling)'),
  ('welcome_grant_robi_full',    '5',    'Welcome ROBI per i primi welcome_threshold_users'),
  ('welcome_grant_robi_reduced', '1',    'Welcome ROBI dopo welcome_threshold_users (anti-Sybil scaling)'),
  ('welcome_threshold_users',    '1000', 'Soglia utenti per Alpha Brave full welcome')
ON CONFLICT (key) DO NOTHING;

-- ── 2. RPC claim_welcome_grant ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.claim_welcome_grant(p_user_id UUID DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id      UUID;
  v_already      BOOLEAN;
  v_user_count   INT;
  v_threshold    INT;
  v_aria_full    INT;
  v_aria_reduced INT;
  v_robi_full    NUMERIC;
  v_robi_reduced NUMERIC;
  v_aria_amount  INT;
  v_robi_amount  NUMERIC;
  v_scale        TEXT;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.points_ledger
     WHERE user_id = v_user_id AND reason = 'alphanet_welcome'
  ) INTO v_already;
  IF v_already THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_claimed');
  END IF;

  -- (Layer C placeholder) phone_verified gate — attivo solo se la colonna esiste
  -- e BYPASS_PHONE_VERIFY non è 'true' nel config. Per ora no-op (Layer C la attiva).

  SELECT COALESCE(value::INT, 1000) INTO v_threshold
    FROM public.airdrop_config WHERE key = 'welcome_threshold_users';
  SELECT COALESCE(value::INT, 1000) INTO v_aria_full
    FROM public.airdrop_config WHERE key = 'welcome_grant_aria_full';
  SELECT COALESCE(value::INT, 300) INTO v_aria_reduced
    FROM public.airdrop_config WHERE key = 'welcome_grant_aria_reduced';
  SELECT COALESCE(value::NUMERIC, 5) INTO v_robi_full
    FROM public.airdrop_config WHERE key = 'welcome_grant_robi_full';
  SELECT COALESCE(value::NUMERIC, 1) INTO v_robi_reduced
    FROM public.airdrop_config WHERE key = 'welcome_grant_robi_reduced';

  SELECT COUNT(*) INTO v_user_count FROM public.profiles WHERE deleted_at IS NULL;

  IF v_user_count >= v_threshold THEN
    v_aria_amount := v_aria_reduced;
    v_robi_amount := v_robi_reduced;
    v_scale       := 'reduced';
  ELSE
    v_aria_amount := v_aria_full;
    v_robi_amount := v_robi_full;
    v_scale       := 'full';
  END IF;

  INSERT INTO public.points_ledger (user_id, amount, reason, created_at)
  VALUES (v_user_id, v_aria_amount, 'alphanet_welcome', NOW());

  UPDATE public.profiles
     SET total_points = COALESCE(total_points, 0) + v_aria_amount
   WHERE id = v_user_id;

  INSERT INTO public.nft_rewards (user_id, nft_type, name, source, shares, metadata, created_at)
  VALUES (v_user_id, 'ROBI', 'Alpha-Net welcome grant', 'alphanet_welcome', v_robi_amount,
          jsonb_build_object('alpha_phase','alphanet_launch','scale', v_scale,
                             'user_rank', v_user_count + 1, 'granted_at', NOW()), NOW());

  RETURN jsonb_build_object(
    'ok', true,
    'aria', v_aria_amount,
    'robi', v_robi_amount,
    'scale', v_scale,
    'user_rank', v_user_count + 1
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_welcome_grant(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_welcome_grant(UUID) TO service_role;

-- ── 3. handle_new_user: rimuove welcome inline, chiama claim_welcome_grant ─
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_referral_code TEXT;
  v_attempts INTEGER := 0;
  v_max_attempts INTEGER := 5;
  v_done BOOLEAN := false;
  v_signup_source TEXT;
BEGIN
  v_signup_source := NEW.raw_user_meta_data->>'signup_source';

  WHILE NOT v_done AND v_attempts < v_max_attempts LOOP
    v_referral_code := substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
    v_attempts := v_attempts + 1;
    BEGIN
      INSERT INTO public.profiles (id, email, referral_code, referred_by, total_points, signup_source, created_at)
      VALUES (NEW.id, NEW.email, v_referral_code, NEW.raw_user_meta_data->>'referred_by',
              0, v_signup_source, NOW());
      v_done := true;
    EXCEPTION WHEN unique_violation THEN
      IF v_attempts >= v_max_attempts THEN
        INSERT INTO public.profiles (id, email, referral_code, referred_by, total_points, signup_source, created_at)
        VALUES (NEW.id, NEW.email, replace(gen_random_uuid()::text, '-', ''),
                NEW.raw_user_meta_data->>'referred_by', 0, v_signup_source, NOW());
        v_done := true;
      END IF;
    END;
  END LOOP;

  PERFORM public.claim_welcome_grant(NEW.id);

  RETURN NEW;
END;
$$;

-- ── 4. B2 cleanup cron settimanale signup_attempts (retention 30gg) ─
CREATE OR REPLACE FUNCTION public.cleanup_signup_attempts()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_deleted INT;
BEGIN
  DELETE FROM public.signup_attempts WHERE created_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN jsonb_build_object('ok', true, 'deleted', v_deleted);
END;
$$;

GRANT EXECUTE ON FUNCTION public.cleanup_signup_attempts() TO service_role;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname='cleanup_signup_attempts') THEN
    PERFORM cron.unschedule('cleanup_signup_attempts');
  END IF;
END $$;

SELECT cron.schedule('cleanup_signup_attempts', '0 3 * * 0', $$SELECT public.cleanup_signup_attempts()$$);
