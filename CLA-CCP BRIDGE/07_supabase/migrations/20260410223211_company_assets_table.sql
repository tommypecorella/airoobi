-- Company Assets: conto corrente AIROOBI
-- Traccia fiat, crypto e NFT posseduti dall'azienda

CREATE TABLE IF NOT EXISTS company_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('fiat', 'crypto', 'nft')),
  name TEXT NOT NULL,
  symbol TEXT,
  amount NUMERIC(18,6) DEFAULT 0,
  value_eur NUMERIC(18,2) DEFAULT 0,
  wallet_address TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: solo admin
ALTER TABLE company_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_company_assets" ON company_assets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Seed: asset iniziali
INSERT INTO company_assets (category, name, symbol, amount, value_eur, notes) VALUES
  ('fiat', 'Conto corrente EUR', 'EUR', 0, 0, 'Conto principale AIROOBI'),
  ('crypto', 'Kaspa', 'KAS', 0, 0, 'Wallet principale KAS'),
  ('crypto', 'ARIA circolante', 'ARIA', 0, 0, 'ARIA emessi in circolazione (testnet)');
