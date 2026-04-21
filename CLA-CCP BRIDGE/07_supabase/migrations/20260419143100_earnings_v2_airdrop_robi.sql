-- ═══════════════════════════════════════════════════════════════
-- EARNINGS v2 — ROBI on airdrop milestones (close F2)
-- 19 Aprile 2026
-- ═══════════════════════════════════════════════════════════════
-- Trigger sui cambi di status in airdrops:
--   status → 'accettato'  ⇒ +1 ROBI al seller (submission accettata)
--   status → 'completed'  ⇒ +5 ROBI al seller  (airdrop concluso OK)
--                        + +5 ROBI al winner (se NOT NULL)
--
-- Nota: in alpha-net i ROBI Mining (NFT_REWARD) vengono visualizzati
-- ma NON distribuiti. execute_draw continua a funzionare; per ora non
-- ci sono airdrop reali conclusi. Quando in Stage 1 il mining verrà
-- attivato, servirà una RPC o flag engine_config.mining_enabled letta
-- da execute_draw.
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- Trigger: airdrop accepted → +1 ROBI seller
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION tf_airdrop_accepted_robi()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Solo alla transizione in_valutazione → accettato (prima volta)
  IF NEW.status = 'accettato'
     AND (OLD.status IS NULL OR OLD.status <> 'accettato')
     AND NEW.submitted_by IS NOT NULL
  THEN
    -- Evita duplicati (in caso di ri-accettazione)
    IF NOT EXISTS (
      SELECT 1 FROM nft_rewards
      WHERE user_id = NEW.submitted_by
        AND source = 'submission_accepted'
        AND airdrop_id = NEW.id
    ) THEN
      INSERT INTO nft_rewards (user_id, nft_type, name, source, airdrop_id, shares, metadata)
      VALUES (
        NEW.submitted_by,
        'ROBI',
        'Oggetto accettato per airdrop',
        'submission_accepted',
        NEW.id,
        1,
        jsonb_build_object('airdrop_title', NEW.title)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_airdrop_accepted_robi ON airdrops;
CREATE TRIGGER trg_airdrop_accepted_robi
  AFTER UPDATE OF status ON airdrops
  FOR EACH ROW
  EXECUTE FUNCTION tf_airdrop_accepted_robi();

-- ─────────────────────────────────────────────────────────────
-- Trigger: airdrop completed → +5 ROBI seller + +5 ROBI winner
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION tf_airdrop_completed_robi()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed'
     AND (OLD.status IS NULL OR OLD.status <> 'completed')
  THEN
    -- Seller bonus (+5 ROBI) se l'airdrop è andato a buon fine
    IF NEW.submitted_by IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM nft_rewards
         WHERE user_id = NEW.submitted_by
           AND source = 'airdrop_completed_seller'
           AND airdrop_id = NEW.id
       )
    THEN
      INSERT INTO nft_rewards (user_id, nft_type, name, source, airdrop_id, shares, metadata)
      VALUES (
        NEW.submitted_by,
        'ROBI',
        'Airdrop completato con successo',
        'airdrop_completed_seller',
        NEW.id,
        5,
        jsonb_build_object('airdrop_title', NEW.title)
      );
    END IF;

    -- Winner bonus (+5 ROBI) se c'è un vincitore
    IF NEW.winner_id IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM nft_rewards
         WHERE user_id = NEW.winner_id
           AND source = 'airdrop_won'
           AND airdrop_id = NEW.id
       )
    THEN
      INSERT INTO nft_rewards (user_id, nft_type, name, source, airdrop_id, shares, metadata)
      VALUES (
        NEW.winner_id,
        'ROBI',
        'Airdrop vinto',
        'airdrop_won',
        NEW.id,
        5,
        jsonb_build_object('airdrop_title', NEW.title)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_airdrop_completed_robi ON airdrops;
CREATE TRIGGER trg_airdrop_completed_robi
  AFTER UPDATE OF status ON airdrops
  FOR EACH ROW
  EXECUTE FUNCTION tf_airdrop_completed_robi();

-- ─────────────────────────────────────────────────────────────
-- Flag config (per future attivazione mining)
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'airdrop_config') THEN
    -- Aggiungi colonna mining_enabled se non esiste
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'airdrop_config' AND column_name = 'mining_enabled'
    ) THEN
      ALTER TABLE airdrop_config ADD COLUMN mining_enabled boolean NOT NULL DEFAULT false;
      COMMENT ON COLUMN airdrop_config.mining_enabled IS
        'ALPHA: default false (mining sospeso). Stage 1: true = execute_draw distribuisce NFT_REWARD (ROBI Mining)';
    END IF;
  END IF;
END $$;
