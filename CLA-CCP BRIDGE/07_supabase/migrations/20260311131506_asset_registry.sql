-- Asset Registry: censimento asset ufficiali AIROOBI
-- Tipi: currency (ARIA), nft (NFT_REWARD, NFT_ALPHA_TIER0), badge (BADGE_FONDATORE)

CREATE TABLE IF NOT EXISTS asset_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_code TEXT UNIQUE NOT NULL,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL, -- 'currency', 'nft', 'badge'
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  treasury_backed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: solo admin può modificare, tutti gli autenticati possono leggere
ALTER TABLE asset_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON asset_registry
  FOR SELECT TO authenticated USING (true);

-- Inserimento asset ufficiali
INSERT INTO asset_registry
  (asset_code, asset_name, asset_type, description, treasury_backed)
VALUES
  ('ARIA', 'ARIA Token', 'currency',
   'Valuta di piattaforma. Simbolica fino ad attivazione Treasury.',
   false),
  ('NFT_REWARD', 'NFT Reward', 'nft',
   'Tessera Rendimento. Certificato di resa convertibile in KAS.',
   true),
  ('NFT_ALPHA_TIER0', 'NFT Alpha Tier 0', 'nft',
   'NFT esclusivo Alpha Brave. Prima generazione fondatori.',
   false),
  ('BADGE_FONDATORE', 'Badge Fondatore', 'badge',
   'Badge riservato ai primi 1.000 utenti Alpha Brave.',
   false)
ON CONFLICT (asset_code) DO NOTHING;
