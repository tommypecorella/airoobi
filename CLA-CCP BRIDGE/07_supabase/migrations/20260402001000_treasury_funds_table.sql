CREATE TABLE IF NOT EXISTS treasury_funds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount_eur numeric(10,2) NOT NULL,
  description text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE treasury_funds ENABLE ROW LEVEL SECURITY;

-- Admin only
CREATE POLICY "admin_all_treasury_funds" ON treasury_funds
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
