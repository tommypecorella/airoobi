-- ══════════════════════════════════════════════════
-- AIROOBI — Add images + AirPods Pro 2 airdrop (sale)
-- Covers all lifecycle cases: 2 presale + 3 sale
-- ══════════════════════════════════════════════════

-- ── Update existing airdrops with images ──
UPDATE airdrops
SET image_url = '/public/images/airdrop_iphone16promax.jpg'
WHERE title LIKE 'iPhone 16 Pro Max%';

-- ── 5. Apple AirPods Pro 2 USB-C (SALE) ──
-- Valore: €279 | 200 blocchi × 10 ARIA = €400 revenue (+43%)
INSERT INTO airdrops (
  title, description, category, object_value_eur,
  block_price_aria, total_blocks, blocks_sold,
  status, image_url, product_info
) VALUES (
  'Apple AirPods Pro 2 USB-C — MagSafe',
  'Apple AirPods Pro di seconda generazione con chip H2, cancellazione attiva del rumore 2x, audio adattivo e porta USB-C. Custodia MagSafe con altoparlante e Precision Finding. Nuovi, sigillati.',
  'mobile',
  279.00,
  10, 200, 0,
  'sale',
  '/public/images/airdrop_airpods_pro.png',
  '{
    "brand": "Apple",
    "model": "AirPods Pro 2 (USB-C)",
    "condition": "Nuovi, sigillati",
    "highlights": [
      "Chip H2 — cancellazione attiva del rumore 2x più efficace",
      "Audio adattivo con rilevamento conversazione",
      "Audio spaziale personalizzato con head tracking",
      "Custodia MagSafe USB-C con altoparlante integrato",
      "Precision Finding per ritrovare la custodia",
      "Fino a 6 ore di ascolto con ANC attivo"
    ],
    "whats_included": [
      "AirPods Pro 2",
      "Custodia MagSafe USB-C",
      "4 paia di inserti in silicone (XS, S, M, L)",
      "Cavo USB-C",
      "Documentazione"
    ],
    "market_price_eur": 279,
    "aria_per_block": 10,
    "eur_per_block": 2.00
  }'::jsonb
);
