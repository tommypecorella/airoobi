-- ============================================================
-- AIROOBI Airdrop Engine v1 — Schema Migration
-- Ref: docs/AIROOBI_Airdrop_Engine_v1.md
-- NON ESEGUIRE senza conferma esplicita del founder
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 7.1 — Tabella airdrop_config (nuova)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS airdrop_config (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key             TEXT UNIQUE NOT NULL,
  value           TEXT NOT NULL,
  description     TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO airdrop_config (key, value, description) VALUES
  ('current_phase',           'alpha_brave', 'Fase attuale piattaforma'),
  ('score_w1',                '0.50',        'Peso blocchi corrente nell algoritmo vincitore'),
  ('score_w2',                '0.30',        'Peso fedeltà categoria'),
  ('score_w3',                '0.20',        'Peso seniority'),
  ('score_alpha_f3',          '0.40',        'Peso registrazione in F3'),
  ('score_beta_f3',           '0.60',        'Peso primo blocco in F3'),
  ('split_fondo',             '0.22',        'Percentuale Fondo Comune'),
  ('split_airoobi',           '0.10',        'Percentuale fee piattaforma'),
  ('split_charity',           '0.0001',      'Percentuale charity pool'),
  ('split_venditore',         '0.6799',      'Percentuale venditore P2P'),
  ('nft_divisor_alpha_brave', '5',           'Blocchi per NFT in Alpha Brave'),
  ('nft_divisor_alpha_wise',  '10',          'Blocchi per NFT in Alpha Wise'),
  ('nft_divisor_beta',        '20',          'Blocchi per NFT in Beta'),
  ('nft_divisor_preprod',     '50',          'Blocchi per NFT in Pre-Prod'),
  ('auto_draw_cron_minutes',  '15',          'Frequenza check cron auto-draw (minuti)')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE airdrop_config ENABLE ROW LEVEL SECURITY;

-- Authenticated può leggere la config
CREATE POLICY "config_read" ON airdrop_config
  FOR SELECT TO authenticated USING (true);

-- Solo service_role può scrivere (admin via API)
CREATE POLICY "config_write" ON airdrop_config
  FOR ALL TO service_role USING (true);

-- ──────────────────────────────────────────────────────────────
-- 7.2 — Modifiche tabella airdrops
-- NOTA: winner_id esiste già, non lo ri-aggiungiamo
-- ──────────────────────────────────────────────────────────────
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS auto_draw           BOOLEAN DEFAULT false;
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS draw_executed_at    TIMESTAMPTZ;
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS winner_score        NUMERIC(10,6);
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS venditore_payout_eur NUMERIC(10,2);
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS airoobi_fee_eur     NUMERIC(10,2);
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS charity_contrib_eur NUMERIC(10,4);
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS fondo_contributo_eur NUMERIC(10,2);
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS aria_incassato      INTEGER DEFAULT 0;
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS draw_scores         JSONB;
-- draw_scores: array [{user_id, score, f1, f2, f3, blocks, rank}] per audit

-- Aggiungi 'annullato' alla lista stati validi
ALTER TABLE airdrops DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE airdrops ADD CONSTRAINT valid_status CHECK (
  status IN (
    'draft', 'in_valutazione', 'rifiutato_min500', 'rifiutato_generico',
    'presale', 'sale', 'dropped', 'active', 'closed', 'completed', 'annullato'
  )
);

-- ──────────────────────────────────────────────────────────────
-- 7.3 — Tabella treasury_transactions (nuova)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS treasury_transactions (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  airdrop_id        UUID REFERENCES airdrops(id),
  amount_eur        NUMERIC(10,2) NOT NULL,
  type              TEXT NOT NULL,  -- 'airdrop_contribution' | 'buyback' | 'manual'
  treasury_before   NUMERIC(10,2),
  treasury_after    NUMERIC(10,2),
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE treasury_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "treasury_tx_read_admin" ON treasury_transactions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- ──────────────────────────────────────────────────────────────
-- 7.4 — Modifiche tabella airdrop_blocks
-- ──────────────────────────────────────────────────────────────
ALTER TABLE airdrop_blocks ADD COLUMN IF NOT EXISTS is_winner_block BOOLEAN DEFAULT false;

-- ──────────────────────────────────────────────────────────────
-- 7.5 — Modifiche tabella nft_rewards
-- ──────────────────────────────────────────────────────────────
ALTER TABLE nft_rewards ADD COLUMN IF NOT EXISTS airdrop_id UUID REFERENCES airdrops(id);
ALTER TABLE nft_rewards ADD COLUMN IF NOT EXISTS metadata   JSONB;
-- metadata: {airdrop_title, draw_date, blocks_owned, score, rank}
