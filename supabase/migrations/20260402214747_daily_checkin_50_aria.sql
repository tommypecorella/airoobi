-- Daily check-in: +50 ARIA, once per day
CREATE OR REPLACE FUNCTION claim_checkin()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_today date := CURRENT_DATE;
  v_already boolean;
  v_amount integer := 50;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  -- Check if already done today
  SELECT EXISTS(
    SELECT 1 FROM checkins
    WHERE user_id = v_user_id AND checked_at = v_today
  ) INTO v_already;

  IF v_already THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_checked');
  END IF;

  -- Insert checkin record
  INSERT INTO checkins (user_id, checked_at) VALUES (v_user_id, v_today);

  -- Add ARIA to ledger
  INSERT INTO points_ledger (user_id, amount, reason)
  VALUES (v_user_id, v_amount, 'checkin');

  -- Update profile total
  UPDATE profiles SET total_points = total_points + v_amount WHERE id = v_user_id;

  RETURN jsonb_build_object('ok', true, 'amount', v_amount);
END;
$$;

GRANT EXECUTE ON FUNCTION claim_checkin() TO authenticated;
