-- Re-seed treasury_stats after DB reset
INSERT INTO treasury_stats (balance_eur, nft_minted, nft_circulating, nft_max_supply, aico_circulating, revenue_ads, revenue_adsense)
SELECT 0, 0, 0, 1000, 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM treasury_stats LIMIT 1);
