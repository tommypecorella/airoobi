-- Insert test airdrop to validate the full participation flow
INSERT INTO airdrops (
  title,
  description,
  category,
  object_value_eur,
  block_price_aria,
  total_blocks,
  blocks_sold,
  status,
  deadline,
  image_url,
  created_by
) VALUES (
  'AirPods Pro 2 — Test Airdrop',
  'Apple AirPods Pro di seconda generazione con chip H2, cancellazione attiva del rumore e audio adattivo. Custodia MagSafe inclusa. Questo è un airdrop di test per validare il flusso completo.',
  'tech',
  279.00,
  5,
  50,
  0,
  'active',
  NULL,
  NULL,
  NULL
);
