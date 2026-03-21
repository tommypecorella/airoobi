-- ══════════════════════════════════════════════════════════
--  COSTO VALUTAZIONE IN ARIA + RPC SUBMIT ATOMICA
-- ══════════════════════════════════════════════════════════

-- Config: costo valutazione (default 50 ARIA = €10)
INSERT INTO airdrop_config (key, value, description)
VALUES ('valuation_cost_aria', '50', 'Costo in ARIA per richiedere la valutazione di un oggetto')
ON CONFLICT (key) DO NOTHING;

-- RPC atomica: submit oggetto con deduzione ARIA
CREATE OR REPLACE FUNCTION public.submit_object_for_valuation(
  p_title TEXT,
  p_description TEXT,
  p_category TEXT,
  p_image_url TEXT,
  p_seller_desired_price NUMERIC,
  p_seller_min_price NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_cost INTEGER;
  v_balance INTEGER;
  v_airdrop_id UUID;
BEGIN
  -- 1. Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'NOT_AUTHENTICATED');
  END IF;

  -- 2. Get valuation cost from config
  SELECT COALESCE(value::INTEGER, 50) INTO v_cost
  FROM airdrop_config WHERE key = 'valuation_cost_aria';
  IF v_cost IS NULL THEN v_cost := 50; END IF;

  -- 3. Check ARIA balance
  SELECT COALESCE(total_points, 0) INTO v_balance
  FROM profiles WHERE id = v_user_id;

  IF v_balance < v_cost THEN
    RETURN json_build_object(
      'success', false,
      'error', 'INSUFFICIENT_ARIA',
      'required', v_cost,
      'available', v_balance
    );
  END IF;

  -- 4. Validate prices
  IF p_seller_desired_price < 500 OR p_seller_min_price < 500 THEN
    RETURN json_build_object('success', false, 'error', 'MIN_PRICE_500');
  END IF;
  IF p_seller_min_price > p_seller_desired_price THEN
    RETURN json_build_object('success', false, 'error', 'MIN_GT_DESIRED');
  END IF;

  -- 5. Deduct ARIA from profile
  UPDATE profiles
  SET total_points = total_points - v_cost
  WHERE id = v_user_id;

  -- 6. Record in ledger
  INSERT INTO points_ledger (user_id, amount, reason)
  VALUES (v_user_id, -v_cost, 'valuation_request');

  -- 7. Create airdrop entry
  INSERT INTO airdrops (
    title, description, category, image_url,
    seller_desired_price, seller_min_price,
    object_value_eur, block_price_aria, total_blocks,
    status, submitted_by
  ) VALUES (
    p_title, p_description, p_category, p_image_url,
    p_seller_desired_price, p_seller_min_price,
    0, 0, 0,
    'in_valutazione', v_user_id
  ) RETURNING id INTO v_airdrop_id;

  -- 8. Return success
  RETURN json_build_object(
    'success', true,
    'airdrop_id', v_airdrop_id,
    'aria_spent', v_cost,
    'new_balance', v_balance - v_cost
  );
END;
$$;

-- RPC: get my submissions (oggetti proposti dall'utente)
CREATE OR REPLACE FUNCTION public.get_my_submissions()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_result JSON;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN '[]'::JSON;
  END IF;

  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::JSON) INTO v_result
  FROM (
    SELECT
      id,
      title,
      description,
      category,
      image_url,
      seller_desired_price,
      seller_min_price,
      object_value_eur,
      status,
      rejection_reason,
      created_at,
      updated_at
    FROM airdrops
    WHERE submitted_by = v_user_id
    ORDER BY created_at DESC
  ) t;

  RETURN v_result;
END;
$$;

-- RPC: get valuation cost
CREATE OR REPLACE FUNCTION public.get_valuation_cost()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cost INTEGER;
BEGIN
  SELECT COALESCE(value::INTEGER, 50) INTO v_cost
  FROM airdrop_config WHERE key = 'valuation_cost_aria';
  RETURN COALESCE(v_cost, 50);
END;
$$;
