-- ════════════════════════════════════════════════════════════════════
-- profiles.signup_source — colonna opzionale per tracking marketing
-- TECH-HARDEN-001 · Sprint W1 · 27 Apr 2026
--
-- Aggiunta colonna su profiles per tracciare il canale di provenienza
-- del signup. Default null. La landing /diventa-alpha-brave imposta
-- 'alpha-brave'. Counter Option A (vedi ROBY_Reply_to_CCP_W1) usa
-- count(profiles) totale, non filtrato — questa colonna serve solo per
-- analytics post-hoc.
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS signup_source TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_signup_source
  ON public.profiles (signup_source) WHERE signup_source IS NOT NULL;

-- Estende handle_new_user per leggere signup_source da raw_user_meta_data.
-- Mantiene tutto il resto del trigger (welcome grant 1000 ARIA + 5 ROBI).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
      VALUES (
        NEW.id,
        NEW.email,
        v_referral_code,
        NEW.raw_user_meta_data->>'referred_by',
        1000,
        v_signup_source,
        NOW()
      );
      v_done := true;
    EXCEPTION WHEN unique_violation THEN
      IF v_attempts >= v_max_attempts THEN
        INSERT INTO public.profiles (id, email, referral_code, referred_by, total_points, signup_source, created_at)
        VALUES (
          NEW.id,
          NEW.email,
          replace(gen_random_uuid()::text, '-', ''),
          NEW.raw_user_meta_data->>'referred_by',
          1000,
          v_signup_source,
          NOW()
        );
        v_done := true;
      END IF;
    END;
  END LOOP;

  INSERT INTO public.points_ledger (user_id, amount, reason, created_at)
  VALUES (NEW.id, 1000, 'alphanet_welcome', NOW());

  INSERT INTO public.nft_rewards (user_id, nft_type, name, source, shares, metadata, created_at)
  VALUES (
    NEW.id,
    'ROBI',
    'Alpha-Net welcome grant',
    'alphanet_welcome',
    5,
    jsonb_build_object('alpha_phase','alphanet_launch','granted_at', NOW()),
    NOW()
  );

  RETURN NEW;
END;
$$;
