-- Fix: add WITH CHECK to treasury_funds RLS policy for INSERT support
DROP POLICY IF EXISTS "admin_all_treasury_funds" ON treasury_funds;

CREATE POLICY "admin_all_treasury_funds" ON treasury_funds
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
