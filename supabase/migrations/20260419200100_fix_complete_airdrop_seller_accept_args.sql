-- ═══════════════════════════════════════════════════════════════
-- FIX — complete_airdrop_seller_accept chiamata execute_draw (args)
-- 19 Aprile 2026 pm
-- ═══════════════════════════════════════════════════════════════
-- Bug: la migration 20260419170100_early_close_lockdown.sql definiva
-- complete_airdrop_seller_accept con chiamata:
--   PERFORM execute_draw(p_airdrop_id);
-- ma la firma reale di execute_draw è:
--   execute_draw(p_airdrop_id UUID, p_service_call BOOLEAN DEFAULT false)
-- con 2 argomenti. La chiamata con 1 solo produceva:
--   "function execute_draw(uuid) does not exist" → HTTP 400
--
-- Osservato live quando paprikarouge7 ha cliccato "ACCETTA E COMPLETA"
-- sul Poltrona 3in1 (airdrop in pending_seller_decision).
--
-- Fix:
-- 1. Passaggio esplicito p_service_call=true (backend/service call)
-- 2. Cattura risultato draw nel jsonb di ritorno per debug/visibilità
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

  UPDATE airdrops SET status = 'closed', updated_at = NOW() WHERE id = p_airdrop_id;

  v_draw_result := execute_draw(p_airdrop_id, true);

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
