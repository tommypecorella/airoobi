-- Allow users to read airdrops they have participated in (any status)
-- This fixes the join in airdrop_participations returning null for non-presale/sale airdrops

CREATE POLICY "Users can read participated airdrops"
  ON airdrops FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT airdrop_id FROM airdrop_participations
      WHERE user_id = auth.uid()
    )
  );

-- Also allow reading airdrops submitted by the user (own submissions)
CREATE POLICY "Users can read own submitted airdrops"
  ON airdrops FOR SELECT TO authenticated
  USING (submitted_by = auth.uid());

-- Also allow anon to read presale/sale airdrops (for landing page)
CREATE POLICY "Anon can read active airdrops"
  ON airdrops FOR SELECT TO anon
  USING (status IN ('presale', 'sale'));

-- Allow anon to read in_valutazione airdrops (for "coming soon" section)
CREATE POLICY "Anon can read in_valutazione airdrops"
  ON airdrops FOR SELECT TO anon
  USING (status = 'in_valutazione');
