-- ══════════════════════════════════════════════════
-- ABO v2 · PR-C2b HOTFIX · matrix collaborators dropdown
-- ══════════════════════════════════════════════════
-- Bug: loadPermissionMatrixUsers() used REST embed
--   GET user_roles?select=user_id,role,category,profiles!inner(email)
-- but user_roles.user_id has FK only to auth.users(id), NOT to
-- public.profiles(id). PostgREST cannot resolve the embed → empty result
-- (silently caught in try/catch, no UI error).
--
-- Fix: SECURITY DEFINER RPC that does the JOIN explicitly, in line with
-- the existing admin_list_evaluators() pattern but covering ALL roles
-- (admin/evaluator/community_manager/treasurer/analyst), not just evaluator.
-- ══════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION admin_list_role_holders()
RETURNS TABLE(user_id uuid, email text, role text, category text, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'NOT_ADMIN';
  END IF;
  RETURN QUERY
    SELECT ur.user_id, p.email, ur.role, ur.category, ur.created_at
    FROM user_roles ur
    JOIN profiles p ON p.id = ur.user_id
    ORDER BY ur.role, p.email, ur.category NULLS FIRST;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_list_role_holders() TO authenticated;
