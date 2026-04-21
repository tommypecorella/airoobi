-- Search user by email (admin only)
CREATE OR REPLACE FUNCTION admin_search_user(p_email text)
RETURNS TABLE(user_id uuid, email text, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'NOT_ADMIN';
  END IF;
  RETURN QUERY
    SELECT p.id, p.email, p.created_at
    FROM profiles p
    WHERE p.email ILIKE '%' || p_email || '%'
      AND COALESCE(p.is_test_user, false) = false
    ORDER BY p.email
    LIMIT 10;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_search_user(text) TO authenticated;

-- List all evaluators with their categories (admin only)
CREATE OR REPLACE FUNCTION admin_list_evaluators()
RETURNS TABLE(role_id uuid, user_id uuid, email text, category text, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'NOT_ADMIN';
  END IF;
  RETURN QUERY
    SELECT ur.id, ur.user_id, p.email, ur.category, ur.created_at
    FROM user_roles ur
    JOIN profiles p ON p.id = ur.user_id
    WHERE ur.role = 'evaluator'
    ORDER BY p.email, ur.category;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_list_evaluators() TO authenticated;

-- Add evaluator role with category (admin only)
CREATE OR REPLACE FUNCTION admin_add_evaluator(p_user_id uuid, p_category text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_ADMIN');
  END IF;

  INSERT INTO user_roles (user_id, role, category, granted_by)
  VALUES (p_user_id, 'evaluator', p_category, auth.uid())
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION admin_add_evaluator(uuid, text) TO authenticated;

-- Remove evaluator role (admin only) — removes by role_id
CREATE OR REPLACE FUNCTION admin_remove_evaluator(p_role_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_ADMIN');
  END IF;

  DELETE FROM user_roles WHERE id = p_role_id AND role = 'evaluator';

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION admin_remove_evaluator(uuid) TO authenticated;
