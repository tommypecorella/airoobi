-- ══════════════════════════════════════════════════
-- AIROOBI — Treasury Stats table
-- Reference snapshot — 21 Aprile 2026
-- Eseguire su Supabase Dashboard → SQL Editor (solo se schema vuoto)
-- ══════════════════════════════════════════════════
--
-- NOTE: La source of truth del DB live è in supabase/migrations/.
-- Questo file è una copia di riferimento per audit/onboarding.
-- RLS aggiornato per usare user_roles (non più hardcoded email singola).
-- ══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS treasury_stats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  balance_eur numeric(12,2) DEFAULT 0,
  nft_minted integer DEFAULT 0,
  nft_circulating integer DEFAULT 0,
  nft_max_supply integer DEFAULT 1000,
  aico_circulating integer DEFAULT 0,        -- LEGACY NAME: rappresenta ARIA circolante
  revenue_ads numeric(12,2) DEFAULT 0,
  revenue_adsense numeric(12,2) DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE treasury_stats ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────
-- RLS — Lettura: tutti gli utenti autenticati
-- ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can read treasury" ON treasury_stats;
CREATE POLICY "Authenticated users can read treasury"
  ON treasury_stats FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ──────────────────────────────────────────────────────
-- RLS — Scrittura: admin via user_roles
-- (non più hardcoded email: funziona per entrambi gli admin
--  ceo@airoobi.com e tommaso.pecorella+ceo@outlook.com)
-- ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin full access on treasury_stats" ON treasury_stats;
CREATE POLICY "Admin full access on treasury_stats"
  ON treasury_stats FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ──────────────────────────────────────────────────────
-- Seed riga iniziale (solo se tabella vuota)
-- ──────────────────────────────────────────────────────
INSERT INTO treasury_stats (balance_eur, nft_minted, nft_circulating, nft_max_supply, aico_circulating, revenue_ads, revenue_adsense)
SELECT 0, 0, 0, 1000, 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM treasury_stats);

-- ══════════════════════════════════════════════════
-- Note operative (21 Apr 2026)
-- ══════════════════════════════════════════════════
-- 1. La colonna `aico_circulating` è un residuo del naming legacy AICO→ARIA.
--    Rinomina pianificata alla prossima migrazione strutturale. Vedi memory
--    entry "TODO: Rinominare AICO → ARIA (residui tecnici)".
--
-- 2. Tabelle Treasury correlate:
--    - treasury_funds       versamenti EUR del Founder nel Fondo Comune
--    - treasury_transactions transazioni split post-draw (fondo/fee/charity/venditore)
--    - company_assets       asset aziendali (fiat, crypto, nft) — admin only
--
-- 3. I ROBI circolanti non sono tracciati qui ma in nft_rewards dove
--    nft_type='ROBI' (somma di shares).
