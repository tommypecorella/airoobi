-- ══════════════════════════════════════════════════════════
--  Aggiunge airdrop_id alla tabella notifications
--  Permette link diretto "Vai all'airdrop" nel pannello notifiche
-- ══════════════════════════════════════════════════════════

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS airdrop_id UUID REFERENCES airdrops(id);

-- Index per query future su notifiche per airdrop
CREATE INDEX IF NOT EXISTS idx_notifications_airdrop ON notifications(airdrop_id) WHERE airdrop_id IS NOT NULL;

-- ── Aggiorna insert_notification per supportare airdrop_id opzionale ──
DROP FUNCTION IF EXISTS insert_notification(UUID, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION insert_notification(
  p_user_id UUID,
  p_title TEXT,
  p_body TEXT DEFAULT NULL,
  p_type TEXT DEFAULT 'info',
  p_airdrop_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, body, type, airdrop_id)
  VALUES (p_user_id, p_title, p_body, p_type, p_airdrop_id)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION insert_notification(UUID, TEXT, TEXT, TEXT, UUID) TO authenticated;

-- ── Aggiorna cancel_my_participation → include airdrop_id ──
CREATE OR REPLACE FUNCTION cancel_my_participation(p_airdrop_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_airdrop RECORD;
  v_total_blocks INTEGER;
  v_total_aria INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED');
  END IF;

  SELECT * INTO v_airdrop
  FROM airdrops WHERE id = p_airdrop_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'AIRDROP_NOT_FOUND');
  END IF;

  SELECT COALESCE(SUM(blocks_count), 0), COALESCE(SUM(aria_spent), 0)
  INTO v_total_blocks, v_total_aria
  FROM airdrop_participations
  WHERE user_id = v_user_id AND airdrop_id = p_airdrop_id AND cancelled_at IS NULL;

  IF v_total_blocks = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NO_PARTICIPATION');
  END IF;

  UPDATE airdrop_participations
  SET cancelled_at = NOW()
  WHERE user_id = v_user_id AND airdrop_id = p_airdrop_id AND cancelled_at IS NULL;

  DELETE FROM airdrop_blocks
  WHERE airdrop_id = p_airdrop_id AND owner_id = v_user_id;

  UPDATE airdrops
  SET blocks_sold = GREATEST(0, blocks_sold - v_total_blocks)
  WHERE id = p_airdrop_id;

  INSERT INTO points_ledger (user_id, amount, reason)
  VALUES (v_user_id, 0, 'participation_cancelled:' || p_airdrop_id::text || ':lost_aria:' || v_total_aria);

  INSERT INTO notifications (user_id, type, title, body, airdrop_id)
  VALUES (
    v_user_id,
    'participation_cancelled',
    'Partecipazione ritirata',
    'Hai ritirato la tua partecipazione da "' || v_airdrop.title || '". ' || v_total_blocks || ' blocchi rilasciati. ' || v_total_aria || ' ARIA non rimborsati.',
    p_airdrop_id
  );

  RETURN jsonb_build_object('ok', true, 'blocks_released', v_total_blocks, 'aria_lost', v_total_aria);
END;
$$;

-- ── Aggiorna withdraw_my_submission → include airdrop_id ──
CREATE OR REPLACE FUNCTION withdraw_my_submission(p_airdrop_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_airdrop RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED');
  END IF;

  SELECT * INTO v_airdrop FROM airdrops
  WHERE id = p_airdrop_id AND submitted_by = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND_OR_NOT_OWNER');
  END IF;

  IF v_airdrop.status NOT IN ('draft','pending','rifiutato') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'CANNOT_WITHDRAW_IN_STATUS_' || v_airdrop.status);
  END IF;

  UPDATE airdrops
  SET status = 'annullato', rejection_reason = 'Ritirato dal proponente', updated_at = NOW()
  WHERE id = p_airdrop_id;

  INSERT INTO notifications (user_id, type, title, body, airdrop_id)
  VALUES (
    v_user_id,
    'submission_withdrawn',
    'Proposta ritirata',
    'La tua proposta "' || v_airdrop.title || '" è stata ritirata.',
    p_airdrop_id
  );

  RETURN jsonb_build_object('ok', true, 'title', v_airdrop.title);
END;
$$;

-- ── Aggiorna send_airdrop_message → include airdrop_id ──
CREATE OR REPLACE FUNCTION public.send_airdrop_message(
  p_airdrop_id UUID,
  p_body TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_is_admin BOOLEAN;
  v_submitted_by UUID;
  v_airdrop_title TEXT;
  v_is_participant BOOLEAN;
  v_msg_id UUID;
  v_notif_title TEXT;
  v_notif_body TEXT;
  v_recipient RECORD;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'NOT_AUTHENTICATED');
  END IF;

  IF p_body IS NULL OR trim(p_body) = '' THEN
    RETURN json_build_object('success', false, 'error', 'EMPTY_MESSAGE');
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM user_roles WHERE user_id = v_uid AND role IN ('admin','evaluator')
  ) INTO v_is_admin;

  SELECT submitted_by, title INTO v_submitted_by, v_airdrop_title
  FROM airdrops WHERE id = p_airdrop_id;

  IF v_submitted_by IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'AIRDROP_NOT_FOUND');
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM airdrop_participations WHERE airdrop_id = p_airdrop_id AND user_id = v_uid
  ) INTO v_is_participant;

  IF NOT v_is_admin AND v_submitted_by != v_uid AND NOT v_is_participant THEN
    RETURN json_build_object('success', false, 'error', 'NOT_AUTHORIZED');
  END IF;

  INSERT INTO airdrop_messages (airdrop_id, sender_id, body, is_admin)
  VALUES (p_airdrop_id, v_uid, trim(p_body), v_is_admin)
  RETURNING id INTO v_msg_id;

  v_notif_title := 'Nuovo messaggio — ' || COALESCE(v_airdrop_title, 'Airdrop');
  v_notif_body := left(trim(p_body), 120);

  IF v_is_admin THEN
    IF v_submitted_by != v_uid THEN
      INSERT INTO notifications (user_id, title, body, type, airdrop_id)
      VALUES (v_submitted_by, v_notif_title, v_notif_body, 'message', p_airdrop_id);
    END IF;
    FOR v_recipient IN
      SELECT DISTINCT user_id FROM airdrop_participations
      WHERE airdrop_id = p_airdrop_id
        AND cancelled_at IS NULL
        AND user_id != v_uid
        AND user_id != v_submitted_by
    LOOP
      INSERT INTO notifications (user_id, title, body, type, airdrop_id)
      VALUES (v_recipient.user_id, v_notif_title, v_notif_body, 'message', p_airdrop_id);
    END LOOP;
  ELSE
    INSERT INTO notifications (user_id, title, body, type, airdrop_id)
    SELECT user_id, v_notif_title, v_notif_body, 'message', p_airdrop_id
    FROM user_roles WHERE role = 'admin' AND user_id != v_uid
    LIMIT 1;
  END IF;

  RETURN json_build_object('success', true, 'message_id', v_msg_id);
END;
$$;
