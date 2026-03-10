-- ═══════════════════════════════════════════════════════════════
-- AIROOBI — Svuota TUTTE le tabelle (dati, non struttura)
-- ⚠️  DISTRUTTIVO — eseguire solo in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Disabilita temporaneamente i trigger FK
SET session_replication_role = 'replica';

TRUNCATE TABLE points_ledger;
TRUNCATE TABLE referral_confirmations;
TRUNCATE TABLE events;
TRUNCATE TABLE nft_rewards;
TRUNCATE TABLE waitlist;
TRUNCATE TABLE treasury_stats;
TRUNCATE TABLE investor_leads;
-- profiles per ultimo (ha FK in ingresso)
TRUNCATE TABLE profiles;

-- Riabilita trigger FK
SET session_replication_role = 'origin';
