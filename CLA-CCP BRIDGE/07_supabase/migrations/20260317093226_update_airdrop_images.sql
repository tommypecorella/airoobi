-- ══════════════════════════════════════════════════
-- AIROOBI — Update remaining airdrop images
-- All 5 airdrops now have product images
-- ══════════════════════════════════════════════════

UPDATE airdrops
SET image_url = '/public/images/airdrop_ps5pro.jpg'
WHERE title LIKE 'PlayStation 5 Pro%';

UPDATE airdrops
SET image_url = '/public/images/airdrop_lv_keepall55.jpg'
WHERE title LIKE 'Louis Vuitton Keepall%';

UPDATE airdrops
SET image_url = '/public/images/airdrop_rolex_datejust36.jpg'
WHERE title LIKE 'Rolex Datejust%';
