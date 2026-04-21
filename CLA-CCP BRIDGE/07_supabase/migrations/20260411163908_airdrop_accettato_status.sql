-- ══════════════════════════════════════════════════════════
--  Aggiunge stato 'accettato' al ciclo di vita airdrop
--
--  Workflow completo:
--  DRAFT → IN_VALUTAZIONE → ACCETTATO → PRESALE/SALE → CLOSED → COMPLETED
--                         ↘ rifiutato_min500 / rifiutato_generico
--  (qualsiasi momento)    → ANNULLATO (solo utente, perde ARIA)
-- ══════════════════════════════════════════════════════════

-- Aggiorna constraint status con nuovo stato 'accettato'
ALTER TABLE airdrops DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE airdrops ADD CONSTRAINT valid_status CHECK (
  status IN (
    'draft', 'in_valutazione',
    'rifiutato_min500', 'rifiutato_generico',
    'accettato',
    'presale', 'sale',
    'dropped', 'active',
    'closed', 'completed', 'annullato'
  )
);

-- Colonna per flag presale (staff decide in ABO se attivare presale)
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS presale_enabled boolean DEFAULT false;

-- Colonna per motivazione rifiuto (staff scrive in ABO)
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Colonna per fee pagata dall'utente per avvio airdrop (% in ARIA)
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS launch_fee_paid numeric DEFAULT 0;
