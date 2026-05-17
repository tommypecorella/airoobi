-- W4 · M_atto5_01 + M_atto5_02 · Atto 5 Consegna + Disputes
-- airdrop_claims · airdrop_disputes · 5 RPCs · 2 cron schedules
-- In-platform tracking (Skeezu v0.3-2) · CEO manual dispute (Skeezu v0.3-3)

-- ─────────────────────────────────────────────────────────────
-- airdrop_claims · winner ships address · seller dispatches · winner confirms receipt
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS airdrop_claims (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airdrop_id       UUID NOT NULL REFERENCES airdrops(id) ON DELETE CASCADE,
  winner_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shipping_address JSONB NOT NULL,
  shipping_phone   TEXT,
  shipping_notes   TEXT,
  claimed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dispatched_at    TIMESTAMPTZ,
  tracking_number  TEXT,
  courier          TEXT,
  received_at      TIMESTAMPTZ,
  rating           INTEGER CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  rating_notes     TEXT,
  finalized_at     TIMESTAMPTZ -- after dispute window closes
);

CREATE INDEX IF NOT EXISTS idx_claims_airdrop ON airdrop_claims(airdrop_id);
CREATE INDEX IF NOT EXISTS idx_claims_winner  ON airdrop_claims(winner_id);
CREATE INDEX IF NOT EXISTS idx_claims_pending_dispatch ON airdrop_claims(claimed_at) WHERE dispatched_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_claims_pending_finalize ON airdrop_claims(received_at) WHERE finalized_at IS NULL AND received_at IS NOT NULL;

ALTER TABLE airdrop_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "winner_read_own_claim" ON airdrop_claims;
CREATE POLICY "winner_read_own_claim" ON airdrop_claims FOR SELECT TO authenticated
  USING (winner_id = auth.uid());

DROP POLICY IF EXISTS "seller_read_own_claim" ON airdrop_claims;
CREATE POLICY "seller_read_own_claim" ON airdrop_claims FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM airdrops a WHERE a.id = airdrop_claims.airdrop_id
                  AND COALESCE(a.submitted_by, a.created_by) = auth.uid()));

DROP POLICY IF EXISTS "admin_all_claims" ON airdrop_claims;
CREATE POLICY "admin_all_claims" ON airdrop_claims FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

GRANT SELECT ON airdrop_claims TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- airdrop_disputes
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS airdrop_disputes (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airdrop_id         UUID NOT NULL REFERENCES airdrops(id) ON DELETE CASCADE,
  claim_id           UUID REFERENCES airdrop_claims(id) ON DELETE SET NULL,
  opener_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  opener_role        TEXT NOT NULL CHECK (opener_role IN ('winner','seller')),
  reason             TEXT NOT NULL,
  evidence_urls      JSONB,
  status             TEXT NOT NULL CHECK (status IN ('pending_review','resolved')) DEFAULT 'pending_review',
  resolution_admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolution_notes   TEXT,
  refund_seller_pct  NUMERIC,
  refund_buyer_pct   NUMERIC,
  opened_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_disputes_airdrop ON airdrop_disputes(airdrop_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status  ON airdrop_disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_opener  ON airdrop_disputes(opener_id);

ALTER TABLE airdrop_disputes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "involved_read_dispute" ON airdrop_disputes;
CREATE POLICY "involved_read_dispute" ON airdrop_disputes FOR SELECT TO authenticated
  USING (
    opener_id = auth.uid()
    OR EXISTS (SELECT 1 FROM airdrops a WHERE a.id = airdrop_disputes.airdrop_id
                AND (a.winner_id = auth.uid() OR COALESCE(a.submitted_by, a.created_by) = auth.uid()))
  );

DROP POLICY IF EXISTS "involved_open_dispute" ON airdrop_disputes;
CREATE POLICY "involved_open_dispute" ON airdrop_disputes FOR INSERT TO authenticated
  WITH CHECK (opener_id = auth.uid());

DROP POLICY IF EXISTS "admin_all_disputes" ON airdrop_disputes;
CREATE POLICY "admin_all_disputes" ON airdrop_disputes FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

GRANT SELECT, INSERT ON airdrop_disputes TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- RPC: claim_airdrop_prize · winner submits address
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION claim_airdrop_prize(
  p_airdrop_id     UUID,
  p_shipping_address JSONB,
  p_shipping_phone TEXT DEFAULT NULL,
  p_shipping_notes TEXT DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_airdrop RECORD; v_claim_id UUID;
BEGIN
  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'airdrop_not_found' USING ERRCODE='P0002'; END IF;
  IF v_airdrop.winner_id IS NULL OR v_airdrop.winner_id <> auth.uid() THEN
    RAISE EXCEPTION 'not_winner' USING ERRCODE='42501';
  END IF;
  IF v_airdrop.status <> 'completed' THEN
    RAISE EXCEPTION 'invalid_status_must_be_completed_was_%', v_airdrop.status USING ERRCODE='22023';
  END IF;
  IF EXISTS (SELECT 1 FROM airdrop_claims WHERE airdrop_id = p_airdrop_id) THEN
    RAISE EXCEPTION 'claim_already_exists' USING ERRCODE='23505';
  END IF;

  INSERT INTO airdrop_claims (airdrop_id, winner_id, shipping_address, shipping_phone, shipping_notes)
  VALUES (p_airdrop_id, auth.uid(), p_shipping_address, p_shipping_phone, p_shipping_notes)
  RETURNING id INTO v_claim_id;

  INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
  VALUES (
    COALESCE(v_airdrop.submitted_by, v_airdrop.created_by),
    'in_app','T1','winner_claimed_address', p_airdrop_id,
    jsonb_build_object('claim_id', v_claim_id), 'sent'
  );

  RETURN jsonb_build_object('success', true, 'claim_id', v_claim_id);
END; $$;
GRANT EXECUTE ON FUNCTION claim_airdrop_prize(UUID, JSONB, TEXT, TEXT) TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- RPC: confirm_airdrop_dispatched · seller adds tracking
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION confirm_airdrop_dispatched(
  p_airdrop_id UUID, p_tracking_number TEXT, p_courier TEXT
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_airdrop RECORD; v_claim RECORD;
BEGIN
  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'airdrop_not_found' USING ERRCODE='P0002'; END IF;
  IF COALESCE(v_airdrop.submitted_by, v_airdrop.created_by) <> auth.uid() THEN
    RAISE EXCEPTION 'seller_only' USING ERRCODE='42501';
  END IF;
  SELECT * INTO v_claim FROM airdrop_claims WHERE airdrop_id = p_airdrop_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'claim_not_found' USING ERRCODE='P0002'; END IF;
  IF v_claim.dispatched_at IS NOT NULL THEN
    RAISE EXCEPTION 'already_dispatched' USING ERRCODE='22023';
  END IF;

  UPDATE airdrop_claims SET
    dispatched_at = NOW(), tracking_number = p_tracking_number, courier = p_courier
  WHERE id = v_claim.id;

  INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
  VALUES (v_claim.winner_id, 'in_app','T1','dispatched', p_airdrop_id,
          jsonb_build_object('tracking', p_tracking_number, 'courier', p_courier), 'sent');

  RETURN jsonb_build_object('success', true);
END; $$;
GRANT EXECUTE ON FUNCTION confirm_airdrop_dispatched(UUID, TEXT, TEXT) TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- RPC: confirm_airdrop_received · winner rates
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION confirm_airdrop_received(
  p_airdrop_id UUID, p_rating INTEGER, p_rating_notes TEXT DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_claim RECORD;
BEGIN
  SELECT * INTO v_claim FROM airdrop_claims WHERE airdrop_id = p_airdrop_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'claim_not_found' USING ERRCODE='P0002'; END IF;
  IF v_claim.winner_id <> auth.uid() THEN RAISE EXCEPTION 'winner_only' USING ERRCODE='42501'; END IF;
  IF v_claim.dispatched_at IS NULL THEN RAISE EXCEPTION 'not_yet_dispatched' USING ERRCODE='22023'; END IF;
  IF v_claim.received_at IS NOT NULL THEN RAISE EXCEPTION 'already_received' USING ERRCODE='22023'; END IF;
  IF p_rating NOT BETWEEN 1 AND 5 THEN RAISE EXCEPTION 'invalid_rating_%', p_rating USING ERRCODE='22023'; END IF;

  UPDATE airdrop_claims SET received_at = NOW(), rating = p_rating, rating_notes = p_rating_notes
  WHERE id = v_claim.id;

  INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
  SELECT COALESCE(submitted_by, created_by), 'in_app','T1','received_rated', p_airdrop_id,
         jsonb_build_object('rating', p_rating), 'sent'
  FROM airdrops WHERE id = p_airdrop_id;

  RETURN jsonb_build_object('success', true);
END; $$;
GRANT EXECUTE ON FUNCTION confirm_airdrop_received(UUID, INTEGER, TEXT) TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- RPC: open_airdrop_dispute
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION open_airdrop_dispute(
  p_airdrop_id UUID, p_reason TEXT, p_evidence_urls JSONB DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_airdrop RECORD; v_claim RECORD; v_role TEXT; v_dispute_id UUID;
BEGIN
  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'airdrop_not_found' USING ERRCODE='P0002'; END IF;
  SELECT * INTO v_claim FROM airdrop_claims WHERE airdrop_id = p_airdrop_id;

  IF v_airdrop.winner_id = auth.uid() THEN v_role := 'winner';
  ELSIF COALESCE(v_airdrop.submitted_by, v_airdrop.created_by) = auth.uid() THEN v_role := 'seller';
  ELSE RAISE EXCEPTION 'not_involved_party' USING ERRCODE='42501'; END IF;

  -- 30gg dispute window post-received
  IF v_claim.received_at IS NOT NULL AND NOW() > v_claim.received_at + INTERVAL '30 days' THEN
    RAISE EXCEPTION 'dispute_window_closed' USING ERRCODE='22023';
  END IF;
  IF v_claim.finalized_at IS NOT NULL THEN RAISE EXCEPTION 'already_finalized' USING ERRCODE='22023'; END IF;

  INSERT INTO airdrop_disputes (airdrop_id, claim_id, opener_id, opener_role, reason, evidence_urls)
  VALUES (p_airdrop_id, v_claim.id, auth.uid(), v_role, p_reason, p_evidence_urls)
  RETURNING id INTO v_dispute_id;

  -- Notify admin (CEO manual fino Stage 2) + altra parte
  INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
  SELECT id, 'in_app','T1','dispute_opened_admin_review', p_airdrop_id,
         jsonb_build_object('dispute_id', v_dispute_id, 'opener_role', v_role), 'sent'
  FROM profiles WHERE email IN ('tommaso.pecorella+ceo@outlook.com','ceo@airoobi.com');

  INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
  VALUES (
    CASE v_role WHEN 'winner' THEN COALESCE(v_airdrop.submitted_by, v_airdrop.created_by) ELSE v_airdrop.winner_id END,
    'in_app','T1','dispute_opened_counterparty', p_airdrop_id,
    jsonb_build_object('dispute_id', v_dispute_id, 'opener_role', v_role), 'sent'
  );

  RETURN jsonb_build_object('success', true, 'dispute_id', v_dispute_id, 'role', v_role);
END; $$;
GRANT EXECUTE ON FUNCTION open_airdrop_dispute(UUID, TEXT, JSONB) TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- RPC: resolve_airdrop_dispute · admin only
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION resolve_airdrop_dispute(
  p_dispute_id UUID, p_resolution_notes TEXT,
  p_refund_seller_pct NUMERIC DEFAULT 0,
  p_refund_buyer_pct  NUMERIC DEFAULT 0
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_dispute RECORD;
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'admin_only' USING ERRCODE='42501'; END IF;
  SELECT * INTO v_dispute FROM airdrop_disputes WHERE id = p_dispute_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'dispute_not_found' USING ERRCODE='P0002'; END IF;
  IF v_dispute.status <> 'pending_review' THEN RAISE EXCEPTION 'already_resolved' USING ERRCODE='22023'; END IF;
  IF p_refund_seller_pct NOT BETWEEN 0 AND 100 OR p_refund_buyer_pct NOT BETWEEN 0 AND 100 THEN
    RAISE EXCEPTION 'invalid_pct' USING ERRCODE='22023';
  END IF;

  UPDATE airdrop_disputes SET
    status='resolved', resolution_admin_id=auth.uid(), resolution_notes=p_resolution_notes,
    refund_seller_pct=p_refund_seller_pct, refund_buyer_pct=p_refund_buyer_pct, resolved_at=NOW()
  WHERE id = p_dispute_id;

  -- Notify both parties
  INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
  SELECT a.winner_id, 'in_app','T1','dispute_resolved', v_dispute.airdrop_id,
         jsonb_build_object('dispute_id', p_dispute_id, 'refund_buyer_pct', p_refund_buyer_pct), 'sent'
  FROM airdrops a WHERE a.id = v_dispute.airdrop_id;

  INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
  SELECT COALESCE(a.submitted_by, a.created_by), 'in_app','T1','dispute_resolved', v_dispute.airdrop_id,
         jsonb_build_object('dispute_id', p_dispute_id, 'refund_seller_pct', p_refund_seller_pct), 'sent'
  FROM airdrops a WHERE a.id = v_dispute.airdrop_id;

  RETURN jsonb_build_object('success', true, 'dispute_id', p_dispute_id);
END; $$;
GRANT EXECUTE ON FUNCTION resolve_airdrop_dispute(UUID, TEXT, NUMERIC, NUMERIC) TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- Cron: cron_check_dispatch_timeout (14 days no dispatch → auto-dispute)
-- Cron: cron_check_dispute_window_close (30 days post-received → finalize)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION cron_check_dispatch_timeout()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_claim RECORD; v_processed INT := 0;
BEGIN
  FOR v_claim IN
    SELECT c.id, c.airdrop_id, c.winner_id
    FROM airdrop_claims c
    WHERE c.dispatched_at IS NULL
      AND c.claimed_at < NOW() - INTERVAL '14 days'
      AND NOT EXISTS (SELECT 1 FROM airdrop_disputes d WHERE d.claim_id = c.id)
  LOOP
    INSERT INTO airdrop_disputes (airdrop_id, claim_id, opener_id, opener_role, reason)
    VALUES (v_claim.airdrop_id, v_claim.id, v_claim.winner_id, 'winner', 'dispatch_timeout_14d_auto');
    v_processed := v_processed + 1;
  END LOOP;
  RETURN jsonb_build_object('auto_disputes_opened', v_processed);
END; $$;
GRANT EXECUTE ON FUNCTION cron_check_dispatch_timeout() TO authenticated;

CREATE OR REPLACE FUNCTION cron_check_dispute_window_close()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_processed INT := 0;
BEGIN
  WITH finalizable AS (
    SELECT c.id FROM airdrop_claims c
    WHERE c.received_at IS NOT NULL
      AND c.received_at < NOW() - INTERVAL '30 days'
      AND c.finalized_at IS NULL
      AND NOT EXISTS (SELECT 1 FROM airdrop_disputes d WHERE d.claim_id = c.id AND d.status = 'pending_review')
  ),
  upd AS (
    UPDATE airdrop_claims SET finalized_at = NOW()
    WHERE id IN (SELECT id FROM finalizable)
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_processed FROM upd;
  RETURN jsonb_build_object('finalized', v_processed);
END; $$;
GRANT EXECUTE ON FUNCTION cron_check_dispute_window_close() TO authenticated;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname='w4_dispatch_timeout') THEN
    PERFORM cron.unschedule('w4_dispatch_timeout');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname='w4_dispute_window_close') THEN
    PERFORM cron.unschedule('w4_dispute_window_close');
  END IF;
END $$;

-- Daily 04:00 UTC (low-traffic window)
SELECT cron.schedule('w4_dispatch_timeout', '0 4 * * *', $$SELECT cron_check_dispatch_timeout();$$);
SELECT cron.schedule('w4_dispute_window_close', '15 4 * * *', $$SELECT cron_check_dispute_window_close();$$);
