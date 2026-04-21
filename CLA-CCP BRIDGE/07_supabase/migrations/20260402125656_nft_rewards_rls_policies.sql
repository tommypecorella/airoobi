-- nft_rewards: RLS is enabled but had NO policies
-- Users could not see their own NFTs, admin could not see all

-- Users can read their own NFTs
CREATE POLICY "Users can read own nft_rewards" ON nft_rewards
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admin can read all NFTs (uses is_admin() to avoid recursion)
CREATE POLICY "Admin can read all nft_rewards" ON nft_rewards
  FOR SELECT TO authenticated
  USING (is_admin());

-- Admin can insert/update/delete NFTs
CREATE POLICY "Admin can manage nft_rewards" ON nft_rewards
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
