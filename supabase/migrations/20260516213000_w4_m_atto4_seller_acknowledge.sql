-- W4 · M_atto4_01 · Atto 4 Estrazione + Settlement · seller acknowledge gate 24h
-- New status `waiting_seller_acknowledge` + acknowledge columns + 3 RPCs + 2 cron schedules
-- Skeezu LOCK v0.4-8: 24h SLA seller decision ACCEPT/ANNULLA/SILENT auto-accept · winner reveal post-acceptance

-- ─────────────────────────────────────────────────────────────
-- valid_status enum extension (additive · preserve existing)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE airdrops DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE airdrops ADD CONSTRAINT valid_status CHECK (
  status = ANY(ARRAY[
    'draft','in_valutazione','valutazione_completata',
    'rifiutato_min500','rifiutato_generico','accettato',
    'presale','sale','dropped','active','closed',
    'waiting_seller_acknowledge', -- NEW v0.4-8
    'pending_seller_decision',    -- legacy preserved
    'completed','annullato'
  ])
);

-- Acknowledge columns
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS end_event_triggered_at TIMESTAMPTZ;
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS end_event_trigger_type TEXT
  CHECK (end_event_trigger_type IS NULL OR end_event_trigger_type IN ('deadline','sold_out','scacco_matto'));
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS seller_acknowledge_sla_deadline TIMESTAMPTZ;
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS seller_acknowledge_decision TEXT
  CHECK (seller_acknowledge_decision IS NULL OR seller_acknowledge_decision IN ('accept','annulla','auto_accept_silent'));
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS seller_acknowledge_decided_at TIMESTAMPTZ;
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS winner_candidate_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_airdrops_waiting_ack ON airdrops(seller_acknowledge_sla_deadline)
  WHERE status = 'waiting_seller_acknowledge';

-- ─────────────────────────────────────────────────────────────
-- detect_airdrop_end_event RPC · cron-callable (5 min stack-fit W3)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION detect_airdrop_end_event(p_airdrop_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_airdrop RECORD;
  v_scoreboard JSONB;
  v_leader JSONB;
  v_trigger TEXT;
  v_processed INT := 0;
  v_results JSONB := '[]'::jsonb;
  v_checkmate JSONB;
BEGIN
  FOR v_airdrop IN
    SELECT * FROM airdrops
    WHERE status = ANY(ARRAY['presale','sale'])
      AND (p_airdrop_id IS NULL OR id = p_airdrop_id)
    FOR UPDATE SKIP LOCKED
  LOOP
    v_trigger := NULL;

    -- 1. Deadline
    IF v_airdrop.deadline IS NOT NULL AND NOW() >= v_airdrop.deadline THEN
      v_trigger := 'deadline';
    -- 2. Sold-out
    ELSIF v_airdrop.blocks_sold >= v_airdrop.total_blocks THEN
      v_trigger := 'sold_out';
    -- 3. Scacco matto: sold_pct >= 85 AND no remaining can overtake leader
    ELSIF v_airdrop.total_blocks > 0
          AND v_airdrop.blocks_sold * 100.0 / v_airdrop.total_blocks >= 85.0 THEN
      v_scoreboard := calculate_winner_score(v_airdrop.id);
      SELECT s INTO v_leader FROM jsonb_array_elements(v_scoreboard) s WHERE (s->>'rank')::INT = 1 LIMIT 1;
      IF v_leader IS NOT NULL THEN
        v_checkmate := compute_checkmate_blocks((v_leader->>'user_id')::UUID, v_airdrop.id);
        IF COALESCE((v_checkmate->>'scacco_matto_active')::BOOLEAN, FALSE) THEN
          v_trigger := 'scacco_matto';
        END IF;
      END IF;
    END IF;

    IF v_trigger IS NOT NULL THEN
      -- Compute winner candidate snapshot
      v_scoreboard := calculate_winner_score(v_airdrop.id);
      SELECT s INTO v_leader FROM jsonb_array_elements(v_scoreboard) s WHERE (s->>'rank')::INT = 1 LIMIT 1;

      UPDATE airdrops SET
        status                          = 'waiting_seller_acknowledge',
        end_event_triggered_at          = NOW(),
        end_event_trigger_type          = v_trigger,
        seller_acknowledge_sla_deadline = NOW() + INTERVAL '24 hours',
        winner_candidate_user_id        = COALESCE((v_leader->>'user_id')::UUID, NULL),
        draw_scores                     = v_scoreboard,
        updated_at                      = NOW()
      WHERE id = v_airdrop.id;

      -- Push T1 seller (in_app · email Postmark deferred)
      INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
      VALUES (
        COALESCE(v_airdrop.submitted_by, v_airdrop.created_by),
        'in_app','T1','seller_acknowledge_required',
        v_airdrop.id,
        jsonb_build_object('trigger', v_trigger, 'sla_hours', 24),
        'sent'
      );

      -- Broadcast push T1 buyers attivi (no winner reveal yet)
      INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
      SELECT DISTINCT ap.user_id, 'in_app','T1','event_ended_waiting_seller',
             v_airdrop.id,
             jsonb_build_object('trigger', v_trigger, 'sla_hours', 24),
             'sent'
      FROM airdrop_participations ap
      WHERE ap.airdrop_id = v_airdrop.id AND ap.cancelled_at IS NULL;

      v_processed := v_processed + 1;
      v_results := v_results || jsonb_build_object(
        'airdrop_id', v_airdrop.id,
        'trigger', v_trigger,
        'winner_candidate_user_id', v_leader->>'user_id'
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object('processed', v_processed, 'events', v_results);
END;
$$;

GRANT EXECUTE ON FUNCTION detect_airdrop_end_event(UUID) TO authenticated;

COMMENT ON FUNCTION detect_airdrop_end_event(UUID) IS 'Atto 4 cron 5min: detect deadline/sold-out/scacco-matto. Transitions to waiting_seller_acknowledge with 24h SLA.';

-- ─────────────────────────────────────────────────────────────
-- seller_acknowledge_airdrop RPC
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION seller_acknowledge_airdrop(
  p_airdrop_id UUID,
  p_decision   TEXT,
  p_service_call BOOLEAN DEFAULT FALSE
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_airdrop RECORD;
  v_draw_result JSONB;
BEGIN
  IF p_decision NOT IN ('accept','annulla','auto_accept_silent') THEN
    RAISE EXCEPTION 'invalid_decision_%', p_decision USING ERRCODE='22023';
  END IF;

  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'airdrop_not_found' USING ERRCODE='P0002'; END IF;

  IF v_airdrop.status <> 'waiting_seller_acknowledge' THEN
    RAISE EXCEPTION 'invalid_status_must_be_waiting_was_%', v_airdrop.status USING ERRCODE='22023';
  END IF;

  -- Auth gate (skip if service_call from cron auto_accept_silent)
  IF NOT p_service_call THEN
    IF COALESCE(v_airdrop.submitted_by, v_airdrop.created_by) <> auth.uid() THEN
      RAISE EXCEPTION 'seller_only' USING ERRCODE='42501';
    END IF;
  END IF;

  UPDATE airdrops SET
    seller_acknowledge_decision   = p_decision,
    seller_acknowledge_decided_at = NOW(),
    updated_at                    = NOW()
  WHERE id = p_airdrop_id;

  IF p_decision IN ('accept','auto_accept_silent') THEN
    v_draw_result := execute_draw(p_airdrop_id, TRUE);
    -- Push T1 winner announcement (post-acceptance only)
    IF v_airdrop.winner_candidate_user_id IS NOT NULL THEN
      INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
      VALUES (
        v_airdrop.winner_candidate_user_id,
        'in_app','T1','winner_announcement',
        p_airdrop_id,
        jsonb_build_object('decision', p_decision),
        'sent'
      );
    END IF;
  ELSIF p_decision = 'annulla' THEN
    v_draw_result := refund_airdrop(p_airdrop_id);
    UPDATE airdrops SET status='annullato', updated_at=NOW() WHERE id=p_airdrop_id;
  END IF;

  -- Push T1 buyers post-decision
  INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
  SELECT DISTINCT ap.user_id, 'in_app','T1',
         CASE p_decision WHEN 'annulla' THEN 'airdrop_annulled' ELSE 'airdrop_finalized' END,
         p_airdrop_id,
         jsonb_build_object('decision', p_decision),
         'sent'
  FROM airdrop_participations ap
  WHERE ap.airdrop_id = p_airdrop_id AND ap.cancelled_at IS NULL;

  RETURN jsonb_build_object(
    'success', true,
    'airdrop_id', p_airdrop_id,
    'decision', p_decision,
    'draw_result', v_draw_result
  );
END;
$$;

GRANT EXECUTE ON FUNCTION seller_acknowledge_airdrop(UUID, TEXT, BOOLEAN) TO authenticated;

COMMENT ON FUNCTION seller_acknowledge_airdrop(UUID, TEXT, BOOLEAN) IS 'Atto 4: seller ACCEPT (executes draw) · ANNULLA (refund) · auto_accept_silent (cron service call).';

-- ─────────────────────────────────────────────────────────────
-- auto_accept_silent_seller · cron service (5 min)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION cron_auto_accept_silent_seller()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_airdrop RECORD;
  v_processed INT := 0;
  v_result JSONB;
BEGIN
  FOR v_airdrop IN
    SELECT id FROM airdrops
    WHERE status = 'waiting_seller_acknowledge'
      AND seller_acknowledge_sla_deadline < NOW()
    FOR UPDATE SKIP LOCKED
  LOOP
    BEGIN
      v_result := seller_acknowledge_airdrop(v_airdrop.id, 'auto_accept_silent', TRUE);
      v_processed := v_processed + 1;
    EXCEPTION WHEN OTHERS THEN
      -- log failure, keep loop
      INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
      VALUES (
        (SELECT COALESCE(submitted_by, created_by) FROM airdrops WHERE id=v_airdrop.id),
        'in_app','T1','auto_accept_silent_failed',
        v_airdrop.id,
        jsonb_build_object('error', SQLERRM),
        'failed'
      );
    END;
  END LOOP;

  RETURN jsonb_build_object('processed', v_processed);
END;
$$;

GRANT EXECUTE ON FUNCTION cron_auto_accept_silent_seller() TO authenticated;

-- pg_cron schedules: 5min detect end event, 5min auto-accept silent
SELECT cron.unschedule('w4_detect_airdrop_end_event') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname='w4_detect_airdrop_end_event');
SELECT cron.schedule('w4_detect_airdrop_end_event', '*/5 * * * *', $$SELECT detect_airdrop_end_event(NULL);$$);

SELECT cron.unschedule('w4_auto_accept_silent_seller') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname='w4_auto_accept_silent_seller');
SELECT cron.schedule('w4_auto_accept_silent_seller', '*/5 * * * *', $$SELECT cron_auto_accept_silent_seller();$$);
