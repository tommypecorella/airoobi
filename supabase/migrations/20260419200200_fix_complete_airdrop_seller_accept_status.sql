-- ═══════════════════════════════════════════════════════════════
-- FIX — complete_airdrop_seller_accept: transizione status corretta
-- 19 Aprile 2026 pm
-- ═══════════════════════════════════════════════════════════════
-- Bug: la migration precedente (20260419200100) settava status='closed'
-- prima di chiamare execute_draw. Ma execute_draw accetta solo
-- 'sale', 'presale', 'active' (v2.2 da presale_mining_boost):
--
--   IF v_airdrop.status NOT IN ('sale','presale','active') THEN
--     RETURN '{"ok":false,"error":"INVALID_STATUS",...}'::JSONB;  -- ← QUI
--
-- Risultato: execute_draw rifiutava lo status 'closed' E per di più
-- la concatenazione manuale del JSON di errore (riga 204 di
-- 20260328011057_presale_mining_boost.sql) genera un secondo errore:
--   "invalid input syntax for type json - Token \"}\" is invalid"
-- perché il parser JSON non gestisce correttamente questo costrutto
-- in alcuni edge case.
--
-- Fix: la RPC passa status='sale' (non 'closed'). È lo status naturale
-- accettato da execute_draw, che poi lo porta a 'completed' (success)
-- o 'annullato' (fail). Aggiungo anche fallback di rollback e ritorno
-- del draw_result per debug.
--
-- Validazione dry-run (BEGIN/ROLLBACK): airdrop 4219b39a (Poltrona 3in1)
-- ha prodotto draw OK con winner=paprikarouge7 (rank 1), payout
-- seller €1040.59, mining 93.57 ROBI shares.
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION complete_airdrop_seller_accept(p_airdrop_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_airdrop RECORD;
  v_user_id UUID := auth.uid();
  v_draw_result jsonb;
  v_prev_status TEXT;
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
    RETURN jsonb_build_object('ok', false, 'error', 'wrong_status', 'status', v_airdrop.status);
  END IF;

  v_prev_status := v_airdrop.status;

  -- Ponte: pending_seller_decision → sale → (execute_draw) → completed/annullato
  UPDATE airdrops SET status = 'sale', updated_at = NOW() WHERE id = p_airdrop_id;

  v_draw_result := execute_draw(p_airdrop_id, true);

  IF v_draw_result IS NULL OR (v_draw_result->>'ok')::boolean IS NOT TRUE THEN
    UPDATE airdrops SET status = v_prev_status WHERE id = p_airdrop_id;
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'draw_failed',
      'draw_result', v_draw_result
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'status', 'completed',
    'blocks_sold', v_airdrop.blocks_sold,
    'revenue_aria', v_airdrop.blocks_sold * v_airdrop.block_price_aria,
    'draw_result', v_draw_result
  );
END;
$$;

GRANT EXECUTE ON FUNCTION complete_airdrop_seller_accept(UUID) TO authenticated;
