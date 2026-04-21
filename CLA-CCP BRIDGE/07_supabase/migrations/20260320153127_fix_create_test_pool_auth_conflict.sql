-- ============================================================
-- FIX: create_test_pool — handle unique_violation on auth.users
-- ON CONFLICT ON CONSTRAINT fails for partial unique indexes.
-- Use EXCEPTION WHEN unique_violation to catch and recover the 
-- existing user id, then upsert profile normally.
-- ============================================================

CREATE OR REPLACE FUNCTION create_test_pool()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count      INTEGER := 0;
  v_existing   INTEGER;
  v_user_id    UUID;
  v_email      TEXT;
  v_created    TIMESTAMPTZ;
  v_rand       DOUBLE PRECISION;
  v_days_ago   INTEGER;
  i            INTEGER;
BEGIN
  -- Admin-only (service role has no auth.uid(), so check only if uid is set)
  IF auth.uid() IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN '{"ok":false,"error":"NOT_ADMIN"}'::JSONB;
  END IF;

  SELECT COUNT(*) INTO v_existing FROM profiles WHERE is_test_user = true;
  IF v_existing >= 1000 THEN
    RETURN jsonb_build_object('ok', true, 'message', 'Pool already exists', 'count', v_existing);
  END IF;

  FOR i IN (v_existing + 1)..1000 LOOP
    v_email := 'test_user_' || LPAD(i::TEXT, 3, '0') || '@airoobi.test';

    -- Non-uniform distribution over 90 days: skewed toward recent dates
    v_rand := random();
    v_days_ago := floor(v_rand * v_rand * 90)::INTEGER;
    v_created := NOW() - v_days_ago * INTERVAL '1 day'
                       - (random() * 86400)::INTEGER * INTERVAL '1 second';

    -- Generate new UUID for this user
    v_user_id := gen_random_uuid();

    BEGIN
      -- Try to insert into auth.users
      INSERT INTO auth.users (
        instance_id, id, aud, role, email,
        encrypted_password, email_confirmed_at,
        created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data,
        confirmation_token, recovery_token, email_change_token_new,
        is_super_admin
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_user_id,
        'authenticated', 'authenticated',
        v_email,
        crypt('TestPool2026!', gen_salt('bf')),
        v_created,
        v_created, v_created,
        '{"provider":"email","providers":["email"]}'::JSONB,
        '{}'::JSONB,
        '', '', '',
        false
      );
    EXCEPTION WHEN unique_violation THEN
      -- Email already exists in auth.users — retrieve existing id
      SELECT id INTO v_user_id
      FROM auth.users
      WHERE email = v_email
      LIMIT 1;
    END;

    IF v_user_id IS NULL THEN
      CONTINUE;
    END IF;

    -- Upsert profile (auth trigger may have already created the profile row)
    INSERT INTO profiles (id, email, referral_code, total_points, created_at, is_test_user)
    VALUES (
      v_user_id,
      v_email,
      'TEST' || LPAD(i::TEXT, 4, '0'),
      1000,
      v_created,
      true
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      referral_code = EXCLUDED.referral_code,
      total_points = EXCLUDED.total_points,
      created_at = EXCLUDED.created_at,
      is_test_user = true;

    -- Ledger entry
    INSERT INTO points_ledger (user_id, amount, reason, created_at)
    VALUES (v_user_id, 1000, 'test_pool_seed', v_created)
    ON CONFLICT DO NOTHING;

    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'created', v_count, 'total', 1000);
END;
$$;

GRANT EXECUTE ON FUNCTION create_test_pool() TO authenticated;
