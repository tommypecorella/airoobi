-- ══════════════════════════════════════════════════════════
--  CATEGORIES TABLE + CRUD
-- ══════════════════════════════════════════════════════════

-- Tabella categorie — sostituisce le stringhe hardcoded
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_it TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_it TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_all" ON categories
  FOR SELECT USING (true);

CREATE POLICY "categories_insert_admin" ON categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "categories_update_admin" ON categories
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "categories_delete_admin" ON categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Seed categorie esistenti
INSERT INTO categories (slug, name_it, name_en, description_it, description_en, icon, sort_order) VALUES
  ('mobile',       'Mobile & Tech Entry', 'Mobile & Tech Entry', 'Smartphone, tablet, accessori tech', 'Smartphones, tablets, tech accessories', '📱', 1),
  ('tech',         'Tech & Strumenti',    'Tech & Tools',        'Computer, console, droni, strumenti', 'Computers, consoles, drones, tools',    '💻', 2),
  ('luxury',       'Luxury & 2 Ruote',    'Luxury & 2 Wheels',   'Orologi, borse, moto, scooter',      'Watches, bags, motorcycles, scooters',  '⌚', 3),
  ('ultra_luxury', 'Ultra Luxury',        'Ultra Luxury',        'Auto, gioielli, esperienze esclusive','Cars, jewelry, exclusive experiences',   '🏎️', 4)
ON CONFLICT (slug) DO NOTHING;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_categories_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_timestamp();

-- ══════════════════════════════════════════════════════════
--  PULIZIA DATI DI TEST
-- ══════════════════════════════════════════════════════════

-- Blocchi di test user
DELETE FROM airdrop_blocks
  WHERE owner_id IN (SELECT id FROM profiles WHERE is_test_user = true);

-- Partecipazioni di test user
DELETE FROM airdrop_participations
  WHERE user_id IN (SELECT id FROM profiles WHERE is_test_user = true);

-- NFT dei test user
DELETE FROM nft_rewards
  WHERE user_id IN (SELECT id FROM profiles WHERE is_test_user = true);

-- Ledger dei test user
DELETE FROM points_ledger
  WHERE user_id IN (SELECT id FROM profiles WHERE is_test_user = true);

-- Notifiche dei test user
DELETE FROM notifications
  WHERE user_id IN (SELECT id FROM profiles WHERE is_test_user = true);

-- Airdrop di test (draft o titolo con 'test')
DELETE FROM treasury_transactions
  WHERE airdrop_id IN (
    SELECT id FROM airdrops WHERE status IN ('draft') OR lower(title) LIKE '%test%'
  );

DELETE FROM airdrop_blocks
  WHERE airdrop_id IN (
    SELECT id FROM airdrops WHERE status IN ('draft') OR lower(title) LIKE '%test%'
  );

DELETE FROM airdrop_participations
  WHERE airdrop_id IN (
    SELECT id FROM airdrops WHERE status IN ('draft') OR lower(title) LIKE '%test%'
  );

DELETE FROM nft_rewards
  WHERE airdrop_id IN (
    SELECT id FROM airdrops WHERE status IN ('draft') OR lower(title) LIKE '%test%'
  );

DELETE FROM airdrops
  WHERE status IN ('draft') OR lower(title) LIKE '%test%';

-- Reset test users
UPDATE profiles
  SET total_points = 1000, current_streak = 0
  WHERE is_test_user = true;

-- Ricalcola blocks_sold
UPDATE airdrops a
  SET blocks_sold = COALESCE((
    SELECT COUNT(*) FROM airdrop_blocks ab WHERE ab.airdrop_id = a.id
  ), 0);
