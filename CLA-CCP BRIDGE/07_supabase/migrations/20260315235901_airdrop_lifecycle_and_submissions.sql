-- ══════════════════════════════════════════════════
-- AIROOBI — Airdrop Lifecycle & Submissions
-- Status flow: in_valutazione → presale → sale → dropped
--              in_valutazione → rifiutato_min500 | rifiutato_generico
-- ══════════════════════════════════════════════════

-- 1. Drop old constraint, add new one with all statuses
ALTER TABLE airdrops DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE airdrops ADD CONSTRAINT valid_status CHECK (
  status IN ('draft', 'in_valutazione', 'rifiutato_min500', 'rifiutato_generico', 'presale', 'sale', 'dropped', 'active', 'closed', 'completed')
);

-- 2. New columns
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS presale_block_price INTEGER;
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id);
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 3. Migrate existing 'active' airdrops to 'sale'
UPDATE airdrops SET status = 'sale' WHERE status = 'active';

-- 4. Update RLS: authenticated users see presale + sale (not just active)
DROP POLICY IF EXISTS "Authenticated can read active airdrops" ON airdrops;
CREATE POLICY "Authenticated can read visible airdrops"
  ON airdrops FOR SELECT TO authenticated
  USING (status IN ('presale', 'sale'));

-- 5. Users can submit (insert) their own airdrops as in_valutazione
CREATE POLICY "Users can submit airdrops"
  ON airdrops FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = submitted_by
    AND status = 'in_valutazione'
  );

-- 6. RPC: count of items in valuation (public info)
CREATE OR REPLACE FUNCTION get_valuation_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER FROM airdrops WHERE status = 'in_valutazione';
$$;

GRANT EXECUTE ON FUNCTION get_valuation_count() TO authenticated;

-- 7. Update buy_blocks to accept both presale and sale
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
  v_price INTEGER;
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

  SELECT * INTO v_airdrop
  FROM airdrops
  WHERE id = p_airdrop_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'AIRDROP_NOT_FOUND');
  END IF;

  -- Accept both presale and sale
  IF v_airdrop.status NOT IN ('presale', 'sale') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'AIRDROP_NOT_ACTIVE');
  END IF;

  IF v_airdrop.deadline IS NOT NULL AND v_airdrop.deadline < NOW() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'AIRDROP_EXPIRED');
  END IF;

  IF EXISTS (
    SELECT 1 FROM unnest(p_block_numbers) AS bn
    WHERE bn < 1 OR bn > v_airdrop.total_blocks
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_BLOCK_NUMBER');
  END IF;

  SELECT COUNT(*) INTO v_taken
  FROM airdrop_blocks
  WHERE airdrop_id = p_airdrop_id
    AND block_number = ANY(p_block_numbers);

  IF v_taken > 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'BLOCKS_ALREADY_TAKEN', 'taken_count', v_taken);
  END IF;

  -- Use presale price if in presale, otherwise sale price
  IF v_airdrop.status = 'presale' AND v_airdrop.presale_block_price IS NOT NULL THEN
    v_price := v_airdrop.presale_block_price;
  ELSE
    v_price := v_airdrop.block_price_aria;
  END IF;

  v_cost := v_price * v_count;

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

  UPDATE profiles
  SET total_points = total_points - v_cost
  WHERE id = v_user_id;

  INSERT INTO points_ledger (user_id, amount, reason)
  VALUES (v_user_id, -v_cost, 'airdrop_block_purchase:' || p_airdrop_id::text);

  INSERT INTO airdrop_blocks (airdrop_id, block_number, owner_id)
  SELECT p_airdrop_id, bn, v_user_id
  FROM unnest(p_block_numbers) AS bn;

  UPDATE airdrops
  SET blocks_sold = blocks_sold + v_count
  WHERE id = p_airdrop_id;

  INSERT INTO airdrop_participations (user_id, airdrop_id, blocks_count, aria_spent)
  VALUES (v_user_id, p_airdrop_id, v_count, v_cost);

  RETURN jsonb_build_object(
    'ok', true,
    'blocks_bought', v_count,
    'aria_spent', v_cost,
    'price_per_block', v_price,
    'new_balance', v_balance - v_cost,
    'blocks_remaining', v_airdrop.total_blocks - v_airdrop.blocks_sold - v_count
  );
END;
$$;
