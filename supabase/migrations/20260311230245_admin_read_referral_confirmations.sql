-- Admin can read all referral confirmations
CREATE POLICY "Admin can read all referral confirmations"
  ON referral_confirmations FOR SELECT
  USING (auth.jwt() ->> 'email' IN ('tommaso.pecorella+ceo@outlook.com', 'ceo@airoobi.com'));
