-- Fix: infinite recursion on user_roles RLS
-- The "Admin can manage roles" policy on user_roles queries user_roles itself,
-- causing infinite recursion when any other table's RLS checks user_roles.
--
-- Solution: SECURITY DEFINER function that bypasses RLS to check admin status.

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Recreate user_roles policies using is_admin() to avoid recursion
DROP POLICY IF EXISTS "Admin can manage roles" ON user_roles;

CREATE POLICY "Admin can manage roles"
  ON user_roles FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Recreate treasury_funds policy using is_admin()
DROP POLICY IF EXISTS "admin_all_treasury_funds" ON treasury_funds;

CREATE POLICY "admin_all_treasury_funds" ON treasury_funds
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
