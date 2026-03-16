-- ══════════════════════════════════════════════════
-- AIROOBI — Realistic Airdrops (ARIA = €0.20)
-- 4 items across all categories, presale + sale mix
-- ══════════════════════════════════════════════════

-- Remove old test airdrop
DELETE FROM airdrop_blocks WHERE airdrop_id IN (SELECT id FROM airdrops WHERE title LIKE '%Test Airdrop%');
DELETE FROM airdrop_participations WHERE airdrop_id IN (SELECT id FROM airdrops WHERE title LIKE '%Test Airdrop%');
DELETE FROM airdrops WHERE title LIKE '%Test Airdrop%';

-- ── 1. iPhone 16 Pro Max 256GB (PRESALE) ──
-- Valore: €1,399 | 500 blocchi × 20 ARIA = €2,000 revenue (+43%)
-- Presale: 16 ARIA/blocco (€3.20) → €1,600 revenue
INSERT INTO airdrops (
  title, description, category, object_value_eur,
  block_price_aria, presale_block_price, total_blocks, blocks_sold,
  status, image_url, product_info
) VALUES (
  'iPhone 16 Pro Max 256GB — Titanio Nero',
  'Apple iPhone 16 Pro Max con chip A18 Pro, display Super Retina XDR da 6.9", fotocamera da 48MP con zoom ottico 5x. Colore Titanio Nero, 256GB. Nuovo, sigillato con garanzia Apple Italia.',
  'mobile',
  1399.00,
  20, 16, 500, 0,
  'presale',
  NULL,
  '{
    "brand": "Apple",
    "model": "iPhone 16 Pro Max 256GB",
    "condition": "Nuovo, sigillato",
    "color": "Titanio Nero",
    "highlights": [
      "Chip A18 Pro — il più potente di sempre",
      "Display Super Retina XDR 6.9\" Always-On",
      "Fotocamera 48MP con zoom ottico 5x",
      "Controllo Fotocamera dedicato",
      "USB-C con USB 3, fino a 20x più veloce",
      "Batteria fino a 33 ore di riproduzione video"
    ],
    "whats_included": [
      "iPhone 16 Pro Max",
      "Cavo USB-C",
      "Documentazione"
    ],
    "market_price_eur": 1399,
    "aria_per_block": 20,
    "eur_per_block": 4.00,
    "presale_aria_per_block": 16,
    "presale_eur_per_block": 3.20
  }'::jsonb
);

-- ── 2. Sony PlayStation 5 Pro + 2 Giochi (SALE) ──
-- Valore: €800 | 400 blocchi × 15 ARIA = €1,200 revenue (+50%)
INSERT INTO airdrops (
  title, description, category, object_value_eur,
  block_price_aria, total_blocks, blocks_sold,
  status, image_url, product_info
) VALUES (
  'PlayStation 5 Pro + GTA VI + FC 25',
  'Sony PlayStation 5 Pro con SSD da 2TB, ray tracing avanzato e Wi-Fi 7. Bundle include GTA VI e EA Sports FC 25 in versione disco. Nuova, sigillata.',
  'tech',
  800.00,
  15, 400, 0,
  'sale',
  NULL,
  '{
    "brand": "Sony",
    "model": "PlayStation 5 Pro",
    "condition": "Nuova, sigillata",
    "highlights": [
      "GPU potenziata con ray tracing avanzato",
      "SSD ultra-veloce da 2TB",
      "Wi-Fi 7 per gaming online senza lag",
      "Compatibilità completa PS5 e PS VR2",
      "GTA VI — Day One Edition incluso",
      "EA Sports FC 25 incluso"
    ],
    "whats_included": [
      "PlayStation 5 Pro (con lettore disco)",
      "Controller DualSense",
      "GTA VI (disco)",
      "EA Sports FC 25 (disco)",
      "Cavo HDMI 2.1, alimentatore, base"
    ],
    "market_price_eur": 800,
    "aria_per_block": 15,
    "eur_per_block": 3.00
  }'::jsonb
);

-- ── 3. Louis Vuitton Keepall 55 Bandoulière (PRESALE) ──
-- Valore: €2,100 | 600 blocchi × 25 ARIA = €3,000 revenue (+43%)
-- Presale: 20 ARIA/blocco (€4.00) → €2,400 revenue
INSERT INTO airdrops (
  title, description, category, object_value_eur,
  block_price_aria, presale_block_price, total_blocks, blocks_sold,
  status, image_url, product_info
) VALUES (
  'Louis Vuitton Keepall 55 Bandoulière Monogram',
  'Iconico borsone da viaggio Louis Vuitton in tela Monogram con tracolla rimovibile. Dimensioni 55×31×26 cm, perfetto come bagaglio a mano. Nuovo, con dust bag e certificato di autenticità.',
  'luxury',
  2100.00,
  25, 20, 600, 0,
  'presale',
  NULL,
  '{
    "brand": "Louis Vuitton",
    "model": "Keepall 55 Bandoulière",
    "condition": "Nuovo, con certificato",
    "highlights": [
      "Tela Monogram iconica con finiture in pelle",
      "Dimensioni 55×31×26 cm — bagaglio a mano",
      "Tracolla rimovibile e regolabile",
      "Doppia cerniera con lucchetto LV",
      "Certificato di autenticità Louis Vuitton",
      "Investimento: valore stabile nel tempo"
    ],
    "whats_included": [
      "Keepall 55 Bandoulière",
      "Tracolla in pelle",
      "Lucchetto e chiavi LV",
      "Dust bag originale",
      "Certificato di autenticità"
    ],
    "market_price_eur": 2100,
    "aria_per_block": 25,
    "eur_per_block": 5.00,
    "presale_aria_per_block": 20,
    "presale_eur_per_block": 4.00
  }'::jsonb
);

-- ── 4. Rolex Datejust 36 (SALE) ──
-- Valore: €8,500 | 1,000 blocchi × 60 ARIA = €12,000 revenue (+41%)
INSERT INTO airdrops (
  title, description, category, object_value_eur,
  block_price_aria, total_blocks, blocks_sold,
  status, image_url, product_info
) VALUES (
  'Rolex Datejust 36 — Acciaio Oystersteel, Quadrante Azzurro',
  'Rolex Datejust 36mm in acciaio Oystersteel con bracciale Jubilee e quadrante azzurro con indici a bastone. Movimento automatico Calibro 3235. Nuovo, con garanzia internazionale Rolex 5 anni.',
  'ultra_luxury',
  8500.00,
  60, 1000, 0,
  'sale',
  NULL,
  '{
    "brand": "Rolex",
    "model": "Datejust 36 ref. 126200",
    "condition": "Nuovo, con garanzia Rolex",
    "highlights": [
      "Cassa 36mm Oystersteel — impermeabile 100m",
      "Calibro 3235 — riserva di carica 70 ore",
      "Quadrante azzurro sunburst con indici a bastone",
      "Bracciale Jubilee a 5 maglie con chiusura Oysterclasp",
      "Vetro zaffiro antigraffio con lente Cyclops",
      "Garanzia internazionale Rolex 5 anni"
    ],
    "whats_included": [
      "Rolex Datejust 36",
      "Scatola Rolex originale",
      "Garanzia internazionale",
      "Libretto istruzioni",
      "Tag e sigilli"
    ],
    "market_price_eur": 8500,
    "aria_per_block": 60,
    "eur_per_block": 12.00
  }'::jsonb
);
