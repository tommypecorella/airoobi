-- Add product_info JSONB for rich product details
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS product_info JSONB DEFAULT '{}'::jsonb;

-- Update test airdrop with product details
UPDATE airdrops
SET product_info = '{
  "brand": "Apple",
  "model": "AirPods Pro 2ª Generazione",
  "condition": "Nuovo, sigillato",
  "images": ["/public/images/airdrop_airpods_pro.png"],
  "highlights": [
    "Chip H2 con cancellazione attiva del rumore 2x",
    "Audio adattivo con rilevamento conversazione",
    "Custodia MagSafe con altoparlante e laccetto",
    "Fino a 6 ore di ascolto, 30 con custodia",
    "Resistenza a polvere, sudore e acqua (IP54)",
    "Audio spaziale personalizzato"
  ],
  "whats_included": [
    "AirPods Pro",
    "Custodia di ricarica MagSafe (USB-C)",
    "4 paia di inserti in silicone (XS, S, M, L)",
    "Cavo USB-C / Lightning"
  ]
}'::jsonb
WHERE title = 'AirPods Pro 2 — Test Airdrop';
