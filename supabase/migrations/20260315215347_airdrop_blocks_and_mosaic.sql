-- ══════════════════════════════════════════════════
-- AIROOBI — Airdrop Blocks (mosaic grid)
-- Ogni blocco ha un numero e un owner. Insert-on-purchase.
-- ══════════════════════════════════════════════════

CREATE TABLE airdrop_blocks (
  airdrop_id UUID NOT NULL REFERENCES airdrops(id),
  block_number INTEGER NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (airdrop_id, block_number)
);

CREATE INDEX idx_airdrop_blocks_airdrop ON airdrop_blocks(airdrop_id);
CREATE INDEX idx_airdrop_blocks_owner ON airdrop_blocks(owner_id);

-- RLS
ALTER TABLE airdrop_blocks ENABLE ROW LEVEL SECURITY;

-- Tutti gli autenticati possono leggere i blocchi (necessario per la griglia)
CREATE POLICY "Authenticated can read blocks"
  ON airdrop_blocks FOR SELECT TO authenticated
  USING (true);

-- Admin can read all
CREATE POLICY "Admin can read all blocks"
  ON airdrop_blocks FOR SELECT
  USING (auth.jwt() ->> 'email' IN ('tommaso.pecorella+ceo@outlook.com', 'ceo@airoobi.com'));

-- No direct INSERT — solo via RPC

-- ══════════════════════════════════════════════════
-- RPC: get_airdrop_grid(airdrop_id)
-- Ritorna tutti i blocchi con owner info per disegnare la griglia
-- ══════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_airdrop_grid(p_airdrop_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_blocks jsonb;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  SELECT jsonb_agg(jsonb_build_object(
    'block_number', ab.block_number,
    'is_mine', (ab.owner_id = v_user_id)
  ) ORDER BY ab.block_number)
  INTO v_blocks
  FROM airdrop_blocks ab
  WHERE ab.airdrop_id = p_airdrop_id;

  RETURN COALESCE(v_blocks, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION get_airdrop_grid(UUID) TO authenticated;

-- ══════════════════════════════════════════════════
-- RPC: buy_blocks V3 — accetta array di numeri blocco
-- ══════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION buy_blocks(
  p_airdrop_id UUID,
  p_block_numbers INTEGER[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_airdrop RECORD;
  v_count INTEGER;
  v_cost INTEGER;
  v_balance INTEGER;
  v_taken INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED');
  END IF;

  v_count := array_length(p_block_numbers, 1);
  IF v_count IS NULL OR v_count = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NO_BLOCKS_SELECTED');
  END IF;

  -- Lock airdrop
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

  -- Validate block numbers are within range
  IF EXISTS (
    SELECT 1 FROM unnest(p_block_numbers) AS bn
    WHERE bn < 1 OR bn > v_airdrop.total_blocks
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_BLOCK_NUMBER');
  END IF;

  -- Check none of the blocks are already taken
  SELECT COUNT(*) INTO v_taken
  FROM airdrop_blocks
  WHERE airdrop_id = p_airdrop_id
    AND block_number = ANY(p_block_numbers);

  IF v_taken > 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'BLOCKS_ALREADY_TAKEN', 'taken_count', v_taken);
  END IF;

  -- Calcolo costo
  v_cost := v_airdrop.block_price_aria * v_count;

  -- Check balance
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

  -- Sottraggo ARIA
  UPDATE profiles
  SET total_points = total_points - v_cost
  WHERE id = v_user_id;

  -- Registro nel ledger
  INSERT INTO points_ledger (user_id, amount, reason)
  VALUES (v_user_id, -v_cost, 'airdrop_block_purchase:' || p_airdrop_id::text);

  -- Inserisco i blocchi
  INSERT INTO airdrop_blocks (airdrop_id, block_number, owner_id)
  SELECT p_airdrop_id, bn, v_user_id
  FROM unnest(p_block_numbers) AS bn;

  -- Aggiorno blocks_sold
  UPDATE airdrops
  SET blocks_sold = blocks_sold + v_count
  WHERE id = p_airdrop_id;

  -- Partecipazione (aggregata)
  INSERT INTO airdrop_participations (user_id, airdrop_id, blocks_count, aria_spent)
  VALUES (v_user_id, p_airdrop_id, v_count, v_cost);

  RETURN jsonb_build_object(
    'ok', true,
    'blocks_bought', v_count,
    'aria_spent', v_cost,
    'new_balance', v_balance - v_cost,
    'blocks_remaining', v_airdrop.total_blocks - v_airdrop.blocks_sold - v_count
  );
END;
$$;

-- Manteniamo anche la vecchia signature (integer) per backward compat
-- ma la nuova è quella con array
GRANT EXECUTE ON FUNCTION buy_blocks(UUID, INTEGER[]) TO authenticated;
