-- 20 lug 2026 (GO Skeezu, design v4): +100 ARIA una tantum al completamento del learning path.
CREATE OR REPLACE FUNCTION public.claim_learning_reward() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'login_required');
  END IF;
  IF EXISTS (SELECT 1 FROM points_ledger WHERE user_id = v_user AND reason = 'learning_path') THEN
    RETURN jsonb_build_object('ok', true, 'granted', false);
  END IF;
  INSERT INTO points_ledger(user_id, amount, reason) VALUES (v_user, 100, 'learning_path');
  UPDATE profiles SET total_points = COALESCE(total_points, 0) + 100 WHERE id = v_user;
  RETURN jsonb_build_object('ok', true, 'granted', true);
END $$;
REVOKE EXECUTE ON FUNCTION public.claim_learning_reward() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_learning_reward() TO authenticated;
