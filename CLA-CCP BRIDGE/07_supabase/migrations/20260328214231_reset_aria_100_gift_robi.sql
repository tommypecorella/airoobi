-- ══════════════════════════════════════════════════════════
--  LAUNCH dApp: Reset ARIA a 100 per tutti + regalo 1 ROBI
--  Rispetta i 7 utenti registrati in Alpha 0
-- ══════════════════════════════════════════════════════════

-- 1. Azzera tutti i punti ARIA e imposta a 100
UPDATE profiles SET total_points = 100;

-- 2. Pulisci il ledger e registra il bonus di lancio
TRUNCATE points_ledger;

INSERT INTO points_ledger (user_id, amount, reason)
SELECT id, 100, 'dapp_launch_bonus'
FROM profiles;

-- 3. Pulisci vecchi NFT e regala 1 ROBI a ogni utente registrato
TRUNCATE nft_rewards CASCADE;

INSERT INTO nft_rewards (user_id, nft_type, name, source, shares)
SELECT id, 'ROBI', 'ROBI Launch Gift', 'dapp_launch', 1.0
FROM profiles;

-- 4. Azzera checkins, video_views, streaks (fresh start)
TRUNCATE checkins;
TRUNCATE video_views;
UPDATE profiles SET current_streak = 0, longest_streak = 0, last_checkin = NULL;

-- 5. Aggiorna treasury_stats
UPDATE treasury_stats SET
  aico_circulating = (SELECT COUNT(*) * 100 FROM profiles),
  nft_circulating = (SELECT COUNT(*) FROM profiles),
  nft_minted = (SELECT COUNT(*) FROM profiles);
