-- ════════════════════════════════════════════════════════════════════
-- Round 11 URGENT · handle_new_user username default generation
-- 10 May 2026 · primo signup post-share BLOCCATO (Sal Fabrizio)
--
-- Round 6 ha aggiunto profiles.username TEXT UNIQUE NOT NULL +
-- backfill 7 existing users. handle_new_user trigger NON popolava
-- username per future signup → NOT NULL violation al primo signup.
--
-- Fix: genera username default mirror Round 6 backfill pattern PRIMA
-- di INSERT in profiles. Preserva referral_code logic + signup_source
-- + claim_welcome_grant chain.
--
-- Pattern: LOWER(email_prefix) sanitized || '_' || 4-char id suffix.
-- Collision resolver WHILE LOOP 4→12 char suffix increment + UUID fallback.
-- Length > 30 truncate. Constraint format ~^[a-z0-9_]{3,30}$.
-- ════════════════════════════════════════════════════════════════════

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
  v_email_prefix TEXT;
  v_id_clean TEXT;
  v_username TEXT;
  v_suffix_len INT := 4;
BEGIN
  v_signup_source := NEW.raw_user_meta_data->>'signup_source';

  -- ── Username default generation (Round 11 fix) ──────────────────
  -- Mirror Round 6 backfill: sanitize email prefix + 4-char id suffix.
  v_email_prefix := LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9_]', '_', 'g'));
  v_id_clean := REPLACE(NEW.id::text, '-', '');

  -- Guard: if email_prefix vuoto, fallback su 'user'.
  IF v_email_prefix IS NULL OR LENGTH(v_email_prefix) < 1 THEN
    v_email_prefix := 'user';
  END IF;

  v_username := v_email_prefix || '_' || SUBSTRING(v_id_clean, 1, v_suffix_len);

  -- Truncate se > 30 char (constraint format_check max 30).
  IF LENGTH(v_username) > 30 THEN
    v_email_prefix := SUBSTRING(v_email_prefix, 1, 30 - 1 - v_suffix_len);
    v_username := v_email_prefix || '_' || SUBSTRING(v_id_clean, 1, v_suffix_len);
  END IF;

  -- Collision resolver: increment suffix length 5→12, then UUID full fallback.
  WHILE EXISTS(SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(v_username)) LOOP
    v_suffix_len := v_suffix_len + 1;
    IF v_suffix_len > 12 THEN
      v_username := SUBSTRING('user_' || v_id_clean, 1, 30);
      EXIT;
    END IF;
    v_username := v_email_prefix || '_' || SUBSTRING(v_id_clean, 1, v_suffix_len);
    IF LENGTH(v_username) > 30 THEN
      v_email_prefix := SUBSTRING(v_email_prefix, 1, 30 - 1 - v_suffix_len);
      v_username := v_email_prefix || '_' || SUBSTRING(v_id_clean, 1, v_suffix_len);
    END IF;
  END LOOP;

  -- ── Profile INSERT con username default + referral_code retry ──
  WHILE NOT v_done AND v_attempts < v_max_attempts LOOP
    v_referral_code := substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
    v_attempts := v_attempts + 1;

    BEGIN
      INSERT INTO public.profiles (id, email, username, referral_code, referred_by, total_points, signup_source, created_at)
      VALUES (NEW.id, NEW.email, v_username, v_referral_code, NEW.raw_user_meta_data->>'referred_by',
              0, v_signup_source, NOW());
      v_done := true;
    EXCEPTION WHEN unique_violation THEN
      IF v_attempts >= v_max_attempts THEN
        INSERT INTO public.profiles (id, email, username, referral_code, referred_by, total_points, signup_source, created_at)
        VALUES (NEW.id, NEW.email, v_username, replace(gen_random_uuid()::text, '-', ''),
                NEW.raw_user_meta_data->>'referred_by', 0, v_signup_source, NOW());
        v_done := true;
      END IF;
    END;
  END LOOP;

  -- Welcome via RPC scaled (preserved chain).
  PERFORM public.claim_welcome_grant(NEW.id);

  RETURN NEW;
END;
$$;
