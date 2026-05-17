-- W4 fix · seller_acknowledge transition to status execute_draw accepts (E2E bug catch)
-- Bug: execute_draw (W3) checks status IN ('sale','presale','active') · waiting_seller_acknowledge rejected
-- Fix: transitorio revert to 'sale' inside seller_acknowledge_airdrop before execute_draw call.
-- execute_draw then sets status='completed' internally.

CREATE OR REPLACE FUNCTION seller_acknowledge_airdrop(
  p_airdrop_id UUID, p_decision TEXT, p_service_call BOOLEAN DEFAULT FALSE
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_airdrop RECORD; v_draw_result JSONB;
BEGIN
  IF p_decision NOT IN ('accept','annulla','auto_accept_silent') THEN
    RAISE EXCEPTION 'invalid_decision_%', p_decision USING ERRCODE='22023';
  END IF;
  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'airdrop_not_found' USING ERRCODE='P0002'; END IF;
  IF v_airdrop.status <> 'waiting_seller_acknowledge' THEN
    RAISE EXCEPTION 'invalid_status_must_be_waiting_was_%', v_airdrop.status USING ERRCODE='22023';
  END IF;
  IF NOT p_service_call THEN
    IF COALESCE(v_airdrop.submitted_by, v_airdrop.created_by) <> auth.uid() THEN
      RAISE EXCEPTION 'seller_only' USING ERRCODE='42501';
    END IF;
  END IF;

  UPDATE airdrops SET seller_acknowledge_decision=p_decision, seller_acknowledge_decided_at=NOW(),
                       updated_at=NOW() WHERE id = p_airdrop_id;

  IF p_decision IN ('accept','auto_accept_silent') THEN
    UPDATE airdrops SET status='sale' WHERE id=p_airdrop_id;
    v_draw_result := execute_draw(p_airdrop_id, TRUE);
    PERFORM 1 FROM airdrops WHERE id=p_airdrop_id AND status NOT IN ('completed','annullato');
    IF FOUND THEN
      UPDATE airdrops SET status='waiting_seller_acknowledge' WHERE id=p_airdrop_id;
    END IF;
    IF v_airdrop.winner_candidate_user_id IS NOT NULL THEN
      INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
      VALUES (v_airdrop.winner_candidate_user_id, 'in_app','T1','winner_announcement', p_airdrop_id,
              jsonb_build_object('decision', p_decision), 'sent');
    END IF;
  ELSIF p_decision = 'annulla' THEN
    UPDATE airdrops SET status='sale' WHERE id=p_airdrop_id;
    v_draw_result := refund_airdrop(p_airdrop_id);
    UPDATE airdrops SET status='annullato', updated_at=NOW() WHERE id=p_airdrop_id;
  END IF;

  INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
  SELECT DISTINCT ap.user_id, 'in_app','T1',
         CASE p_decision WHEN 'annulla' THEN 'airdrop_annulled' ELSE 'airdrop_finalized' END,
         p_airdrop_id, jsonb_build_object('decision', p_decision), 'sent'
  FROM airdrop_participations ap WHERE ap.airdrop_id = p_airdrop_id AND ap.cancelled_at IS NULL;

  RETURN jsonb_build_object('success', true, 'airdrop_id', p_airdrop_id,
                            'decision', p_decision, 'draw_result', v_draw_result);
END; $$;
