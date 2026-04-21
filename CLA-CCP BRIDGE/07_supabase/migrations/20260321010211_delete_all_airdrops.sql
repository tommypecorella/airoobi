-- ══════════════════════════════════════════════════════════
--  CANCELLA TUTTI GLI AIRDROP E DATI COLLEGATI
--  Ordine: dipendenze prima, poi tabella principale
-- ══════════════════════════════════════════════════════════

DELETE FROM treasury_transactions;
DELETE FROM airdrop_blocks;
DELETE FROM airdrop_participations;
DELETE FROM nft_rewards WHERE airdrop_id IS NOT NULL;
DELETE FROM points_ledger WHERE reason LIKE 'airdrop_%';
DELETE FROM notifications WHERE type = 'airdrop' OR body LIKE '%airdrop%';
DELETE FROM airdrops;
