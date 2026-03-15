-- Fix buy_blocks RPC: column is "amount" not "points" in points_ledger

CREATE OR REPLACE FUNCTION buy_blocks(
  p_airdrop_id UUID,
  p_blocks INTEGER
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_airdrop RECORD;
  v_cost INTEGER;
  v_balance INTEGER;
  v_participation_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED');
  END IF;

  IF p_blocks <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_BLOCKS');
  END IF;

  SELECT * INTO v_airdrop
  FROM airdrops
  WHERE id = p_airdrop_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'AIRDROP_NOT_FOUND');
  END IF;

  IF v_airdrop.status <> 'active' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'AIRDROP_NOT_ACTIVE');
  END IF;

  IF v_airdrop.deadline IS NOT NULL AND v_airdrop.deadline < NOW() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'AIRDROP_EXPIRED');
  END IF;

  IF (v_airdrop.blocks_sold + p_blocks) > v_airdrop.total_blocks THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'NOT_ENOUGH_BLOCKS',
      'available', v_airdrop.total_blocks - v_airdrop.blocks_sold
    );
  END IF;

  v_cost := v_airdrop.block_price_aria * p_blocks;

  SELECT total_points INTO v_balance
  FROM profiles
  WHERE id = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PROFILE_NOT_FOUND');
  END IF;

  IF v_balance < v_cost THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'INSUFFICIENT_ARIA',
      'balance', v_balance,
      'cost', v_cost
    );
  END IF;

  -- Sottraggo ARIA dal profilo
  UPDATE profiles
  SET total_points = total_points - v_cost
  WHERE id = v_user_id;

  -- Registro nel points_ledger (colonna = amount, non points)
  INSERT INTO points_ledger (user_id, amount, reason)
  VALUES (v_user_id, -v_cost, 'airdrop_block_purchase:' || p_airdrop_id::text);

  -- Creo la partecipazione
  INSERT INTO airdrop_participations (user_id, airdrop_id, blocks_count, aria_spent)
  VALUES (v_user_id, p_airdrop_id, p_blocks, v_cost)
  RETURNING id INTO v_participation_id;

  -- Aggiorno blocks_sold
  UPDATE airdrops
  SET blocks_sold = blocks_sold + p_blocks
  WHERE id = p_airdrop_id;

  RETURN jsonb_build_object(
    'ok', true,
    'participation_id', v_participation_id,
    'blocks_bought', p_blocks,
    'aria_spent', v_cost,
    'new_balance', v_balance - v_cost,
    'blocks_remaining', v_airdrop.total_blocks - v_airdrop.blocks_sold - p_blocks
  );
END;
$$;
