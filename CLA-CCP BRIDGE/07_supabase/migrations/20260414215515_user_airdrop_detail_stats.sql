-- ══════════════════════════════════════════════════════════
--  RPC: get_my_airdrop_detail_stats(p_airdrop_id)
--  Ritorna stats dettagliate dell'utente per un singolo airdrop:
--  - presale_blocks / sale_blocks (per proiezione ROBI)
--  - storico acquisti (da airdrop_participations)
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_my_airdrop_detail_stats(p_airdrop_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_presale_blocks INT;
  v_sale_blocks INT;
  v_history jsonb;
BEGIN
  IF v_user_id IS NULL THEN RETURN '{}'::jsonb; END IF;

  -- Count presale vs sale blocks
  SELECT
    COALESCE(SUM(CASE WHEN purchased_phase = 'presale' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN purchased_phase <> 'presale' THEN 1 ELSE 0 END), 0)
  INTO v_presale_blocks, v_sale_blocks
  FROM airdrop_blocks
  WHERE airdrop_id = p_airdrop_id AND owner_id = v_user_id;

  -- Purchase history (non-cancelled)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'blocks', ap.blocks_count,
      'aria',   ap.aria_spent,
      'date',   ap.created_at
    ) ORDER BY ap.created_at DESC
  ), '[]'::jsonb)
  INTO v_history
  FROM airdrop_participations ap
  WHERE ap.airdrop_id = p_airdrop_id
    AND ap.user_id = v_user_id
    AND ap.cancelled_at IS NULL;

  RETURN jsonb_build_object(
    'presale_blocks', v_presale_blocks,
    'sale_blocks',    v_sale_blocks,
    'history',        v_history
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_my_airdrop_detail_stats(UUID) TO authenticated;
