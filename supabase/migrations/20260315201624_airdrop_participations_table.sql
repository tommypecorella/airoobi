-- ══════════════════════════════════════════════════
-- AIROOBI — Airdrop Participations table
-- Traccia i blocchi acquistati da ogni utente per airdrop
-- ══════════════════════════════════════════════════

CREATE TABLE airdrop_participations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  airdrop_id UUID NOT NULL REFERENCES airdrops(id),
  blocks_count INTEGER NOT NULL,
  aria_spent INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_blocks CHECK (blocks_count > 0),
  CONSTRAINT valid_aria CHECK (aria_spent > 0)
);

-- Index per query frequenti
CREATE INDEX idx_participations_user ON airdrop_participations(user_id);
CREATE INDEX idx_participations_airdrop ON airdrop_participations(airdrop_id);
CREATE INDEX idx_participations_user_airdrop ON airdrop_participations(user_id, airdrop_id);

-- ──────────────────────────────────────────────────
-- RLS
-- ──────────────────────────────────────────────────
ALTER TABLE airdrop_participations ENABLE ROW LEVEL SECURITY;

-- Utente vede le proprie partecipazioni
CREATE POLICY "Users can read own participations"
  ON airdrop_participations FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT solo via RPC buy_blocks (SECURITY DEFINER) — nessun insert diretto

-- Admin può leggere tutte le partecipazioni
CREATE POLICY "Admin can read all participations"
  ON airdrop_participations FOR SELECT
  USING (auth.jwt() ->> 'email' IN ('tommaso.pecorella+ceo@outlook.com', 'ceo@airoobi.com'));
