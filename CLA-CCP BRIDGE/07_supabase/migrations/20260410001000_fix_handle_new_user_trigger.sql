-- ============================================================
-- FIX: handle_new_user trigger su auth.users
--
-- PROBLEMA: il trigger originale (creato dalla Dashboard, non
-- versionato) genera un referral_code che puo' collidere con
-- uno esistente (constraint UNIQUE su profiles.referral_code).
-- Quando succede, l'intero INSERT su auth.users viene rollbackato
-- e l'utente vede "Database error saving new user".
--
-- SOLUZIONE: ricreare il trigger con retry loop sul referral_code.
-- Se il primo tentativo collide, rigenera fino a 5 volte.
-- Usa substr(gen_random_uuid()::text, 1, 8) come prima,
-- ma con gestione collisioni.
--
-- Questo file VERSIONIZZA il trigger che era solo in Dashboard.
-- ============================================================

-- 1. Drop vecchio trigger (qualunque nome abbia)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;

-- 2. Ricrea la funzione con retry
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
      INSERT INTO public.profiles (id, email, referral_code, referred_by, created_at)
      VALUES (
        NEW.id,
        NEW.email,
        v_referral_code,
        NEW.raw_user_meta_data->>'referred_by',
        NOW()
      );
      v_done := true;
    EXCEPTION WHEN unique_violation THEN
      -- referral_code collisione — riprova con un nuovo codice
      IF v_attempts >= v_max_attempts THEN
        -- Fallback: usa UUID completo (32 hex chars, collisione impossibile)
        INSERT INTO public.profiles (id, email, referral_code, referred_by, created_at)
        VALUES (
          NEW.id,
          NEW.email,
          replace(gen_random_uuid()::text, '-', ''),
          NEW.raw_user_meta_data->>'referred_by',
          NOW()
        );
        v_done := true;
      END IF;
    END;
  END LOOP;

  RETURN NEW;
END;
$$;

-- 3. Ricrea il trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
