-- Reset Alpha 0: pulizia completa dati utente per re-iscrizione founder
-- Mantiene: treasury_stats, cost_tracker, asset_registry

TRUNCATE TABLE referral_confirmations CASCADE;
TRUNCATE TABLE video_views CASCADE;
TRUNCATE TABLE checkins CASCADE;
TRUNCATE TABLE points_ledger CASCADE;
TRUNCATE TABLE nft_rewards CASCADE;
TRUNCATE TABLE investor_leads CASCADE;
TRUNCATE TABLE waitlist CASCADE;
TRUNCATE TABLE events CASCADE;
TRUNCATE TABLE profiles CASCADE;

-- Rimuove tutti gli utenti da auth (necessario per re-iscrizione)
DELETE FROM auth.users;
