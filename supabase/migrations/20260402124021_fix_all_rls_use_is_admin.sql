-- Fix: replace all direct user_roles queries in RLS policies with is_admin()
-- to prevent infinite recursion (user_roles RLS triggers itself)

-- Also add is_admin_or_evaluator() for policies that need both roles
CREATE OR REPLACE FUNCTION is_admin_or_evaluator()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'evaluator')
  );
$$;

GRANT EXECUTE ON FUNCTION is_admin_or_evaluator() TO authenticated;

-- ── categories ──
DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
DROP POLICY IF EXISTS "categories_update_admin" ON categories;
DROP POLICY IF EXISTS "categories_delete_admin" ON categories;

CREATE POLICY "categories_insert_admin" ON categories
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "categories_update_admin" ON categories
  FOR UPDATE USING (is_admin());

CREATE POLICY "categories_delete_admin" ON categories
  FOR DELETE USING (is_admin());

-- ── airdrop_messages ──
DROP POLICY IF EXISTS "Admin can read all airdrop messages" ON airdrop_messages;

CREATE POLICY "Admin can read all airdrop messages"
  ON airdrop_messages FOR SELECT TO authenticated
  USING (is_admin_or_evaluator());

-- ── treasury_transactions ──
DROP POLICY IF EXISTS "treasury_tx_read_admin" ON treasury_transactions;

CREATE POLICY "treasury_tx_read_admin" ON treasury_transactions
  FOR SELECT TO authenticated
  USING (is_admin());
