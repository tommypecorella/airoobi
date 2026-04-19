-- ═══════════════════════════════════════════════════════════════
-- EARLY-CLOSE LOCKDOWN — 19 Aprile 2026 (close F2)
-- ═══════════════════════════════════════════════════════════════
-- Due meccanismi di chiusura anticipata:
--
--   A) FAIRNESS LOCKDOWN
--      Tutti i non-primi sono matematicamente impossibilitati a
--      superare il leader (Score v4). L'airdrop si ferma, i blocchi
--      invenduti vengono "bruciati" (total_blocks ← blocks_sold).
--
--   B) VALUE THRESHOLD (anti-gambling assoluto)
--      Il leader ha già impegnato in categoria tanti ARIA quanti
--      il valore EUR dell'oggetto × 10 (conversione ARIA_EUR=0.10).
--      Raggiunta soglia, airdrop si chiude immediatamente per
--      evitare che qualcuno spenda > del valore dell'oggetto.
--
-- Flusso post early-close:
--   1. status airdrops = 'pending_seller_decision' (nuovo)
--   2. Notifica al venditore
--   3. Venditore vede CTA "COMPLETA" nel pannello "I miei airdrop"
--   4. Accetta → complete_airdrop_seller_accept() → status=completed
--   5. Rifiuta → withdraw_submission() → status=annullato + rimborso
--
-- ARIA_EUR = 0.10 (10 ARIA = 1 EUR)
-- ═══════════════════════════════════════════════════════════════

-- Ora aggiungiamo lo stato 'pending_seller_decision'
ALTER TABLE airdrops DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE airdrops ADD CONSTRAINT valid_status CHECK (
  status IN (
    'draft', 'in_valutazione',
    'valutazione_completata',
    'rifiutato_min500', 'rifiutato_generico',
    'accettato',
    'presale', 'sale',
    'dropped', 'active',
    'closed', 'completed', 'annullato',
    'pending_seller_decision'
  )
);

-- Colonna per tracciare il motivo della chiusura anticipata
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS early_close_reason TEXT;
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS original_total_blocks INTEGER;
COMMENT ON COLUMN airdrops.early_close_reason IS
  'Motivo early close: fairness_lockdown | value_threshold | NULL';
COMMENT ON COLUMN airdrops.original_total_blocks IS
  'Valore di total_blocks prima del burn in early-close (per audit)';

-- ─────────────────────────────────────────────────────────────
-- RPC check_fairness_lockdown: tutti i non-primi impossibili?
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_fairness_lockdown(p_airdrop_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_block_price INTEGER;
  v_total_blocks INTEGER;
  v_blocks_sold INTEGER;
  v_remaining INTEGER;
  v_scores JSONB;
  v_leader_score NUMERIC;
  v_participants INTEGER;
  v_all_blocked BOOLEAN;
BEGIN
  SELECT block_price_aria, total_blocks, blocks_sold
  INTO v_block_price, v_total_blocks, v_blocks_sold
  FROM airdrops WHERE id = p_airdrop_id;

  IF v_total_blocks IS NULL THEN
    RETURN jsonb_build_object('lockdown', false, 'reason', 'airdrop_not_found');
  END IF;

  v_remaining := GREATEST(0, v_total_blocks - v_blocks_sold);

  v_scores := calculate_winner_score(p_airdrop_id);
  v_participants := jsonb_array_length(v_scores);

  -- Lockdown richiede ≥ 3 partecipanti (con 2 è legittimo tentare un ribaltone)
  IF v_participants < 3 THEN
    RETURN jsonb_build_object('lockdown', false, 'reason', 'below_min_participants', 'participants', v_participants);
  END IF;

  -- Score del leader (rank=1)
  SELECT (elem->>'score')::NUMERIC INTO v_leader_score
  FROM jsonb_array_elements(v_scores) elem
  WHERE (elem->>'rank')::INTEGER = 1
  LIMIT 1;

  -- Tutti i non-primi hanno (score + remaining*price) < leader_score?
  SELECT COALESCE(bool_and(
    ((elem->>'score')::NUMERIC + (v_remaining * v_block_price)) < v_leader_score
  ), false)
  INTO v_all_blocked
  FROM jsonb_array_elements(v_scores) elem
  WHERE (elem->>'rank')::INTEGER > 1;

  RETURN jsonb_build_object(
    'lockdown', v_all_blocked,
    'leader_score', v_leader_score,
    'remaining_blocks', v_remaining,
    'block_price', v_block_price,
    'participants', v_participants
  );
END;
$$;

GRANT EXECUTE ON FUNCTION check_fairness_lockdown(UUID) TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- RPC check_value_threshold_reached: leader ha raggiunto valore oggetto?
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_value_threshold_reached(p_airdrop_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_object_value_eur NUMERIC;
  v_threshold_aria NUMERIC;
  v_scores JSONB;
  v_leader_score NUMERIC;
  v_aria_eur NUMERIC := 10;  -- 10 ARIA = 1 EUR (ARIA_EUR=0.10)
BEGIN
  SELECT object_value_eur INTO v_object_value_eur
  FROM airdrops WHERE id = p_airdrop_id;

  IF v_object_value_eur IS NULL OR v_object_value_eur <= 0 THEN
    RETURN jsonb_build_object('threshold_reached', false, 'reason', 'no_object_value');
  END IF;

  -- Soglia: ARIA = object_value_eur × 10
  v_threshold_aria := v_object_value_eur * v_aria_eur;

  v_scores := calculate_winner_score(p_airdrop_id);
  SELECT (elem->>'score')::NUMERIC INTO v_leader_score
  FROM jsonb_array_elements(v_scores) elem
  WHERE (elem->>'rank')::INTEGER = 1
  LIMIT 1;

  RETURN jsonb_build_object(
    'threshold_reached', COALESCE(v_leader_score, 0) >= v_threshold_aria,
    'leader_score', COALESCE(v_leader_score, 0),
    'threshold_aria', v_threshold_aria,
    'object_value_eur', v_object_value_eur
  );
END;
$$;

GRANT EXECUTE ON FUNCTION check_value_threshold_reached(UUID) TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- RPC early_close_airdrop: esegue chiusura anticipata
-- Chiamata dal trigger after buy_blocks quando lockdown/threshold attivo
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION early_close_airdrop(p_airdrop_id UUID, p_reason TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_airdrop RECORD;
BEGIN
  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  -- Solo se in status attivo (presale/sale) e non già early-closed
  IF v_airdrop.status NOT IN ('presale', 'sale') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'wrong_status', 'status', v_airdrop.status);
  END IF;

  -- Burn blocchi: total_blocks ← blocks_sold, salva original in backup
  UPDATE airdrops SET
    status = 'pending_seller_decision',
    early_close_reason = p_reason,
    original_total_blocks = total_blocks,
    total_blocks = blocks_sold,
    updated_at = NOW()
  WHERE id = p_airdrop_id;

  -- Notifica al venditore
  IF v_airdrop.submitted_by IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, airdrop_id, data, created_at)
    VALUES (
      v_airdrop.submitted_by,
      'airdrop_pending_seller_decision',
      p_airdrop_id,
      jsonb_build_object(
        'airdrop_title', v_airdrop.title,
        'reason', p_reason,
        'blocks_sold', v_airdrop.blocks_sold,
        'original_total_blocks', v_airdrop.total_blocks
      ),
      NOW()
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'status', 'pending_seller_decision',
    'reason', p_reason,
    'blocks_sold', v_airdrop.blocks_sold,
    'blocks_burned', v_airdrop.total_blocks - v_airdrop.blocks_sold
  );
END;
$$;

GRANT EXECUTE ON FUNCTION early_close_airdrop(UUID, TEXT) TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- Trigger: dopo ogni acquisto blocchi, verifica lockdown/threshold
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION tf_check_early_close_after_buy()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_airdrop_id UUID := NEW.airdrop_id;
  v_status TEXT;
  v_threshold JSONB;
  v_lockdown JSONB;
BEGIN
  SELECT status INTO v_status FROM airdrops WHERE id = v_airdrop_id;
  IF v_status NOT IN ('presale', 'sale') THEN
    RETURN NEW;
  END IF;

  -- 1) Soglia valore oggetto: priorità massima (anti-gambling assoluto)
  v_threshold := check_value_threshold_reached(v_airdrop_id);
  IF (v_threshold->>'threshold_reached')::BOOLEAN THEN
    PERFORM early_close_airdrop(v_airdrop_id, 'value_threshold');
    RETURN NEW;
  END IF;

  -- 2) Fairness lockdown: tutti i non-primi bloccati
  v_lockdown := check_fairness_lockdown(v_airdrop_id);
  IF (v_lockdown->>'lockdown')::BOOLEAN THEN
    PERFORM early_close_airdrop(v_airdrop_id, 'fairness_lockdown');
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_early_close_after_buy ON airdrop_blocks;
CREATE TRIGGER trg_check_early_close_after_buy
  AFTER INSERT ON airdrop_blocks
  FOR EACH ROW
  EXECUTE FUNCTION tf_check_early_close_after_buy();

-- ─────────────────────────────────────────────────────────────
-- RPC complete_airdrop_seller_accept: venditore accetta payout ridotto
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION complete_airdrop_seller_accept(p_airdrop_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_airdrop RECORD;
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  IF v_airdrop.submitted_by <> v_user_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_owner');
  END IF;

  IF v_airdrop.status <> 'pending_seller_decision' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'wrong_status');
  END IF;

  -- Passa a 'closed' per far partire il draw automatico con execute_draw
  UPDATE airdrops SET
    status = 'closed',
    updated_at = NOW()
  WHERE id = p_airdrop_id;

  -- Esegui draw (se la pipeline include già auto-draw su status=closed, verrà eseguito)
  -- Altrimenti qui si può chiamare direttamente execute_draw(p_airdrop_id)
  PERFORM execute_draw(p_airdrop_id);

  RETURN jsonb_build_object(
    'ok', true,
    'status', 'completed',
    'blocks_sold', v_airdrop.blocks_sold,
    'revenue_aria', v_airdrop.blocks_sold * v_airdrop.block_price_aria
  );
END;
$$;

GRANT EXECUTE ON FUNCTION complete_airdrop_seller_accept(UUID) TO authenticated;
