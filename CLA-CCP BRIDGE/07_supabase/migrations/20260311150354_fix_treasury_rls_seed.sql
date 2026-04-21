-- Fix treasury_stats: RLS per entrambi gli admin + seed row dopo reset

-- Drop old admin policy (single email)
DROP POLICY IF EXISTS "Admin full access on treasury_stats" ON treasury_stats;

-- New admin policy: both admin emails
CREATE POLICY "Admin full access on treasury_stats" ON treasury_stats
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      'tommaso.pecorella+ceo@outlook.com',
      'ceo@airoobi.com'
    )
  );

-- Seed initial row if table is empty
INSERT INTO treasury_stats (balance_eur, nft_minted, nft_circulating, nft_max_supply, aico_circulating, revenue_ads, revenue_adsense)
SELECT 0, 0, 0, 1000, 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM treasury_stats LIMIT 1);
