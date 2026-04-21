-- ══════════════════════════════════════════════════
-- AIROOBI — Treasury Stats table
-- Eseguire su Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS treasury_stats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  balance_eur numeric(12,2) DEFAULT 0,
  nft_minted integer DEFAULT 0,
  nft_circulating integer DEFAULT 0,
  nft_max_supply integer DEFAULT 1000,
  aico_circulating integer DEFAULT 0,
  revenue_ads numeric(12,2) DEFAULT 0,
  revenue_adsense numeric(12,2) DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE treasury_stats ENABLE ROW LEVEL SECURITY;

-- Utenti autenticati possono leggere (per il tab Tessere)
CREATE POLICY "Authenticated users can read treasury"
  ON treasury_stats FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Solo admin può modificare
CREATE POLICY "Admin full access on treasury_stats"
  ON treasury_stats FOR ALL
  USING (auth.jwt() ->> 'email' = 'tommaso.pecorella+ceo@outlook.com');

-- Inserisci riga iniziale
INSERT INTO treasury_stats (balance_eur, nft_minted, nft_circulating, nft_max_supply, aico_circulating, revenue_ads, revenue_adsense)
VALUES (0, 0, 0, 1000, 0, 0, 0);
