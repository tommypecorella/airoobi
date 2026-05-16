-- W4 fix · scacco_matto detection global logic (E2E bug catch)
-- Bug: detect_airdrop_end_event used compute_checkmate_blocks(leader_id) → returns 1 block (overtake self)
-- so scacco_matto_active was always FALSE in real-world data.
-- Fix: dedicated is_airdrop_in_checkmate() helper with proper "leader unreachable by second-place" math.

CREATE OR REPLACE FUNCTION is_airdrop_in_checkmate(p_airdrop_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total INT; v_sold INT; v_remaining INT; v_pct NUMERIC;
  v_scoreboard JSONB; v_leader JSONB; v_second JSONB;
  v_leader_score NUMERIC; v_second_loyalty NUMERIC; v_second_pity NUMERIC;
  v_second_blocks INT; v_second_max_possible NUMERIC;
  v_threshold NUMERIC := 85.0;
BEGIN
  SELECT total_blocks, blocks_sold INTO v_total, v_sold FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND OR v_total = 0 THEN RETURN FALSE; END IF;
  v_remaining := GREATEST(v_total - v_sold, 0);
  v_pct := v_sold * 100.0 / v_total;
  IF v_pct < v_threshold THEN RETURN FALSE; END IF;

  v_scoreboard := calculate_winner_score(p_airdrop_id);
  SELECT s INTO v_leader FROM jsonb_array_elements(v_scoreboard) s WHERE (s->>'rank')::INT = 1 LIMIT 1;
  SELECT s INTO v_second FROM jsonb_array_elements(v_scoreboard) s WHERE (s->>'rank')::INT = 2 LIMIT 1;

  IF v_second IS NULL OR v_leader IS NULL THEN RETURN TRUE; END IF;

  v_leader_score    := (v_leader->>'score')::NUMERIC;
  v_second_blocks   := (v_second->>'blocks')::INT;
  v_second_loyalty  := COALESCE((v_second->>'loyalty_mult')::NUMERIC, 1.0);
  v_second_pity     := COALESCE((v_second->>'pity_bonus')::NUMERIC, 0);

  v_second_max_possible := SQRT(GREATEST(v_second_blocks + v_remaining, 0)::NUMERIC)
                          * v_second_loyalty + v_second_pity;

  RETURN v_second_max_possible < v_leader_score;
END;
$$;

GRANT EXECUTE ON FUNCTION is_airdrop_in_checkmate(UUID) TO authenticated, anon;

COMMENT ON FUNCTION is_airdrop_in_checkmate(UUID) IS 'Global scacco matto: leader unreachable by second-place even buying all remaining blocks. Used by detect_airdrop_end_event.';

CREATE OR REPLACE FUNCTION detect_airdrop_end_event(p_airdrop_id UUID DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_airdrop RECORD; v_scoreboard JSONB; v_leader JSONB;
  v_trigger TEXT; v_processed INT := 0; v_results JSONB := '[]'::jsonb;
BEGIN
  FOR v_airdrop IN
    SELECT * FROM airdrops
    WHERE status = ANY(ARRAY['presale','sale'])
      AND (p_airdrop_id IS NULL OR id = p_airdrop_id)
    FOR UPDATE SKIP LOCKED
  LOOP
    v_trigger := NULL;
    IF v_airdrop.deadline IS NOT NULL AND NOW() >= v_airdrop.deadline THEN
      v_trigger := 'deadline';
    ELSIF v_airdrop.blocks_sold >= v_airdrop.total_blocks THEN
      v_trigger := 'sold_out';
    ELSIF is_airdrop_in_checkmate(v_airdrop.id) THEN
      v_trigger := 'scacco_matto';
    END IF;

    IF v_trigger IS NOT NULL THEN
      v_scoreboard := calculate_winner_score(v_airdrop.id);
      SELECT s INTO v_leader FROM jsonb_array_elements(v_scoreboard) s WHERE (s->>'rank')::INT = 1 LIMIT 1;
      UPDATE airdrops SET
        status='waiting_seller_acknowledge', end_event_triggered_at=NOW(),
        end_event_trigger_type=v_trigger, seller_acknowledge_sla_deadline=NOW() + INTERVAL '24 hours',
        winner_candidate_user_id=COALESCE((v_leader->>'user_id')::UUID, NULL),
        draw_scores=v_scoreboard, updated_at=NOW()
      WHERE id = v_airdrop.id;

      INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
      VALUES (COALESCE(v_airdrop.submitted_by, v_airdrop.created_by), 'in_app','T1','seller_acknowledge_required',
              v_airdrop.id, jsonb_build_object('trigger', v_trigger, 'sla_hours', 24), 'sent');

      INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
      SELECT DISTINCT ap.user_id, 'in_app','T1','event_ended_waiting_seller', v_airdrop.id,
             jsonb_build_object('trigger', v_trigger, 'sla_hours', 24), 'sent'
      FROM airdrop_participations ap WHERE ap.airdrop_id = v_airdrop.id AND ap.cancelled_at IS NULL;

      v_processed := v_processed + 1;
      v_results := v_results || jsonb_build_object('airdrop_id', v_airdrop.id, 'trigger', v_trigger,
                                                    'winner_candidate_user_id', v_leader->>'user_id');
    END IF;
  END LOOP;
  RETURN jsonb_build_object('processed', v_processed, 'events', v_results);
END; $$;
