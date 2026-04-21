-- ARIA Faucet: 100 ARIA per day, once per day
CREATE OR REPLACE FUNCTION claim_faucet()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_today date := CURRENT_DATE;
  v_already_claimed boolean;
  v_amount integer := 100;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  -- Check if already claimed today
  SELECT EXISTS(
    SELECT 1 FROM points_ledger
    WHERE user_id = v_user_id
    AND reason = 'faucet'
    AND created_at::date = v_today
  ) INTO v_already_claimed;

  IF v_already_claimed THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_claimed');
  END IF;

  -- Add to ledger
  INSERT INTO points_ledger (user_id, amount, reason)
  VALUES (v_user_id, v_amount, 'faucet');

  -- Update profile total
  UPDATE profiles SET total_points = total_points + v_amount WHERE id = v_user_id;

  RETURN jsonb_build_object('ok', true, 'amount', v_amount);
END;
$$;

-- Public explorer data (no auth required)
CREATE OR REPLACE FUNCTION get_aria_explorer()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_aria bigint;
  v_holders integer;
  v_tx_today integer;
  v_top_holders jsonb;
  v_recent_tx jsonb;
BEGIN
  -- Total ARIA (non-test users)
  SELECT COALESCE(SUM(total_points), 0) INTO v_total_aria
  FROM profiles WHERE is_test_user IS NOT TRUE;

  -- Holders count
  SELECT COUNT(*) INTO v_holders
  FROM profiles WHERE total_points > 0 AND is_test_user IS NOT TRUE;

  -- Transactions today
  SELECT COUNT(*) INTO v_tx_today
  FROM points_ledger WHERE created_at::date = CURRENT_DATE;

  -- Top 20 holders
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO v_top_holders
  FROM (
    SELECT public_id, total_points,
           ROUND(total_points * 100.0 / NULLIF((SELECT SUM(total_points) FROM profiles WHERE is_test_user IS NOT TRUE), 0), 2) as pct
    FROM profiles
    WHERE total_points > 0 AND is_test_user IS NOT TRUE
    ORDER BY total_points DESC
    LIMIT 20
  ) t;

  -- Recent 50 transactions
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO v_recent_tx
  FROM (
    SELECT pl.amount, pl.reason, pl.created_at, p.public_id
    FROM points_ledger pl
    JOIN profiles p ON p.id = pl.user_id
    WHERE p.is_test_user IS NOT TRUE
    ORDER BY pl.created_at DESC
    LIMIT 50
  ) t;

  RETURN jsonb_build_object(
    'total_aria', v_total_aria,
    'holders', v_holders,
    'tx_today', v_tx_today,
    'top_holders', v_top_holders,
    'recent_tx', v_recent_tx
  );
END;
$$;

-- Allow anon to call explorer (public data)
GRANT EXECUTE ON FUNCTION get_aria_explorer() TO anon;
