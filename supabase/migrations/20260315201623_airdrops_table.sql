-- ══════════════════════════════════════════════════
-- AIROOBI — Airdrops table
-- Core table for the airdrop marketplace
-- ══════════════════════════════════════════════════

CREATE TABLE airdrops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,                -- es. 'mobile', 'tech', 'luxury', 'ultra_luxury'
  image_url TEXT,
  object_value_eur NUMERIC(10,2) NOT NULL,  -- valore oggetto in EUR (admin only)
  block_price_aria INTEGER NOT NULL,     -- costo per blocco in ARIA
  total_blocks INTEGER NOT NULL,         -- blocchi totali disponibili
  blocks_sold INTEGER DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'draft' NOT NULL,  -- draft → active → closed → completed
  deadline TIMESTAMPTZ,                  -- scadenza opzionale
  winner_id UUID REFERENCES profiles(id),
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('draft', 'active', 'closed', 'completed')),
  CONSTRAINT valid_blocks CHECK (total_blocks > 0 AND blocks_sold >= 0 AND blocks_sold <= total_blocks),
  CONSTRAINT valid_price CHECK (block_price_aria > 0),
  CONSTRAINT valid_value CHECK (object_value_eur > 0)
);

-- Index per query frequenti
CREATE INDEX idx_airdrops_status ON airdrops(status);
CREATE INDEX idx_airdrops_category ON airdrops(category);

-- ──────────────────────────────────────────────────
-- RLS
-- ──────────────────────────────────────────────────
ALTER TABLE airdrops ENABLE ROW LEVEL SECURITY;

-- Tutti gli autenticati possono vedere airdrop attivi
CREATE POLICY "Authenticated can read active airdrops"
  ON airdrops FOR SELECT TO authenticated
  USING (status = 'active');

-- Admin può leggere tutti gli airdrop (qualsiasi stato)
CREATE POLICY "Admin can read all airdrops"
  ON airdrops FOR SELECT
  USING (auth.jwt() ->> 'email' IN ('tommaso.pecorella+ceo@outlook.com', 'ceo@airoobi.com'));

-- Admin può creare airdrop
CREATE POLICY "Admin can insert airdrops"
  ON airdrops FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' IN ('tommaso.pecorella+ceo@outlook.com', 'ceo@airoobi.com'));

-- Admin può aggiornare airdrop
CREATE POLICY "Admin can update airdrops"
  ON airdrops FOR UPDATE
  USING (auth.jwt() ->> 'email' IN ('tommaso.pecorella+ceo@outlook.com', 'ceo@airoobi.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('tommaso.pecorella+ceo@outlook.com', 'ceo@airoobi.com'));

-- Admin può eliminare airdrop (solo draft)
CREATE POLICY "Admin can delete draft airdrops"
  ON airdrops FOR DELETE
  USING (
    auth.jwt() ->> 'email' IN ('tommaso.pecorella+ceo@outlook.com', 'ceo@airoobi.com')
    AND status = 'draft'
  );

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION update_airdrops_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_airdrops_updated_at
  BEFORE UPDATE ON airdrops
  FOR EACH ROW
  EXECUTE FUNCTION update_airdrops_updated_at();
