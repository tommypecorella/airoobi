-- ============================================================
-- ALPHA-NET WELCOME GRANT
-- Ogni nuovo utente riceve 1000 ARIA + 5 ROBI alla registrazione.
-- Policy Skeezu 2026-04-19 (project_alphanet_initial_grant.md).
--
-- Questa migrazione estende handle_new_user per:
-- 1. Assegnare 1000 ARIA a total_points
-- 2. Inserire ledger alphanet_welcome +1000
-- 3. Inserire nft_rewards ROBI shares=5 source=alphanet_welcome
-- ============================================================

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
BEGIN
  WHILE NOT v_done AND v_attempts < v_max_attempts LOOP
    v_referral_code := substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
    v_attempts := v_attempts + 1;

    BEGIN
      INSERT INTO public.profiles (id, email, referral_code, referred_by, total_points, created_at)
      VALUES (
        NEW.id,
        NEW.email,
        v_referral_code,
        NEW.raw_user_meta_data->>'referred_by',
        1000,
        NOW()
      );
      v_done := true;
    EXCEPTION WHEN unique_violation THEN
      IF v_attempts >= v_max_attempts THEN
        INSERT INTO public.profiles (id, email, referral_code, referred_by, total_points, created_at)
        VALUES (
          NEW.id,
          NEW.email,
          replace(gen_random_uuid()::text, '-', ''),
          NEW.raw_user_meta_data->>'referred_by',
          1000,
          NOW()
        );
        v_done := true;
      END IF;
    END;
  END LOOP;

  -- Welcome grant: 1000 ARIA ledger row
  INSERT INTO public.points_ledger (user_id, amount, reason, created_at)
  VALUES (NEW.id, 1000, 'alphanet_welcome', NOW());

  -- Welcome grant: 5 ROBI nft_rewards row
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
