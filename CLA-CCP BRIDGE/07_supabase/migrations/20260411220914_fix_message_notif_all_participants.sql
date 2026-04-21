-- ══════════════════════════════════════════════════════════
--  Fix: notifica messaggio a TUTTI i partecipanti + submitter
--  Prima andava solo al submitter. Ora notifica chiunque sia
--  coinvolto nell'airdrop (submitter + tutti i partecipanti),
--  escluso il mittente stesso.
-- ══════════════════════════════════════════════════════════

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

  -- Insert message
  INSERT INTO airdrop_messages (airdrop_id, sender_id, body, is_admin)
  VALUES (p_airdrop_id, v_uid, trim(p_body), v_is_admin)
  RETURNING id INTO v_msg_id;

  -- ── Notifications ──
  v_notif_title := 'Nuovo messaggio — ' || COALESCE(v_airdrop_title, 'Airdrop');
  v_notif_body := left(trim(p_body), 120);

  IF v_is_admin THEN
    -- Admin scrive → notifica al submitter + tutti i partecipanti (escluso se stesso)
    -- Submitter
    IF v_submitted_by != v_uid THEN
      INSERT INTO notifications (user_id, title, body, type)
      VALUES (v_submitted_by, v_notif_title, v_notif_body, 'message');
    END IF;
    -- Tutti i partecipanti (distinct, escluso mittente e submitter già notificato)
    FOR v_recipient IN
      SELECT DISTINCT user_id FROM airdrop_participations
      WHERE airdrop_id = p_airdrop_id
        AND cancelled_at IS NULL
        AND user_id != v_uid
        AND user_id != v_submitted_by
    LOOP
      INSERT INTO notifications (user_id, title, body, type)
      VALUES (v_recipient.user_id, v_notif_title, v_notif_body, 'message');
    END LOOP;
  ELSE
    -- Utente scrive → notifica al primo admin
    INSERT INTO notifications (user_id, title, body, type)
    SELECT user_id, v_notif_title, v_notif_body, 'message'
    FROM user_roles WHERE role = 'admin' AND user_id != v_uid
    LIMIT 1;
  END IF;

  RETURN json_build_object('success', true, 'message_id', v_msg_id);
END;
$$;
