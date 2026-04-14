-- ─────────────────────────────────────────────────────────
-- 16 categorie (no passaggio proprietà legale)
-- Disattiva vecchie 4 generiche, inserisce 16 nuove
-- Riassegna airdrop esistenti
-- ─────────────────────────────────────────────────────────

-- Disattiva vecchie categorie
UPDATE categories SET is_active = false, updated_at = NOW()
WHERE slug IN ('mobile', 'tech', 'luxury', 'ultra_luxury');

-- Inserisci 16 nuove categorie
INSERT INTO categories (id, slug, name_it, name_en, description_it, description_en, icon, sort_order, is_active) VALUES
  (gen_random_uuid(), 'smartphone', 'Smartphone', 'Smartphones', 'Smartphone di valore', 'Premium smartphones', '📱', 1, true),
  (gen_random_uuid(), 'tablet', 'Tablet', 'Tablets', 'Tablet di valore', 'Premium tablets', '📲', 2, true),
  (gen_random_uuid(), 'computer', 'Computer', 'Computers', 'Computer e portatili di valore', 'Premium computers and laptops', '💻', 3, true),
  (gen_random_uuid(), 'gaming', 'Gaming', 'Gaming', 'Console e accessori gaming', 'Gaming consoles and accessories', '🎮', 4, true),
  (gen_random_uuid(), 'audio', 'Audio', 'Audio', 'Cuffie, speaker e dispositivi audio', 'Headphones, speakers and audio devices', '🎧', 5, true),
  (gen_random_uuid(), 'fotografia', 'Fotografia', 'Photography', 'Fotocamere, obiettivi e droni', 'Cameras, lenses and drones', '📷', 6, true),
  (gen_random_uuid(), 'orologi', 'Orologi', 'Watches', 'Orologi di valore', 'Premium watches', '⌚', 7, true),
  (gen_random_uuid(), 'gioielli', 'Gioielli', 'Jewelry', 'Gioielli e pietre preziose', 'Jewelry and precious stones', '💎', 8, true),
  (gen_random_uuid(), 'borse', 'Borse & Accessori', 'Bags & Accessories', 'Borse e accessori di lusso', 'Luxury bags and accessories', '👜', 9, true),
  (gen_random_uuid(), 'moda', 'Moda & Abbigliamento', 'Fashion & Clothing', 'Abbigliamento e calzature di valore', 'Premium clothing and footwear', '👗', 10, true),
  (gen_random_uuid(), 'biciclette', 'Biciclette & E-Bike', 'Bicycles & E-Bikes', 'Biciclette ed e-bike di valore', 'Premium bicycles and e-bikes', '🚲', 11, true),
  (gen_random_uuid(), 'arredamento', 'Arredamento & Casa', 'Home & Furniture', 'Mobili e oggetti di design', 'Furniture and design items', '🏠', 12, true),
  (gen_random_uuid(), 'sport', 'Sport & Outdoor', 'Sports & Outdoor', 'Attrezzatura sportiva e outdoor', 'Sports and outdoor equipment', '⚽', 13, true),
  (gen_random_uuid(), 'strumenti', 'Strumenti Musicali', 'Musical Instruments', 'Strumenti musicali di valore', 'Premium musical instruments', '🎸', 14, true),
  (gen_random_uuid(), 'arte', 'Arte & Collezionismo', 'Art & Collectibles', 'Opere d''arte e oggetti da collezione', 'Artworks and collectibles', '🎨', 15, true),
  (gen_random_uuid(), 'vino', 'Vini & Spirits', 'Wine & Spirits', 'Vini pregiati e distillati', 'Fine wines and spirits', '🍷', 16, true)
ON CONFLICT (slug) DO NOTHING;

-- Riassegna airdrop esistenti
UPDATE airdrops SET category = 'strumenti' WHERE id = '8ca6265d-1ec0-434d-828f-064fda968971';
UPDATE airdrops SET category = 'arredamento' WHERE id = '4219b39a-ab83-407d-8dc0-3723b04288bd';
