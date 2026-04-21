-- ══════════════════════════════════════════════════════════
--  Fix: ripristina notifiche su send_airdrop_message
--  La migrazione 20260411211902 (participant RLS) aveva
--  sovrascritto la funzione perdendo la logica notifiche
--  aggiunta in 20260410230722.
--  Questa versione unisce: partecipanti + notifiche.
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
  v_recipient_id UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'NOT_AUTHENTICATED');
  END IF;

  IF p_body IS NULL OR trim(p_body) = '' THEN
    RETURN json_build_object('success', false, 'error', 'EMPTY_MESSAGE');
  END IF;

  -- Check if user is admin/evaluator
  SELECT EXISTS(
    SELECT 1 FROM user_roles WHERE user_id = v_uid AND role IN ('admin','evaluator')
  ) INTO v_is_admin;

  -- Get airdrop info
  SELECT submitted_by, title INTO v_submitted_by, v_airdrop_title
  FROM airdrops WHERE id = p_airdrop_id;

  IF v_submitted_by IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'AIRDROP_NOT_FOUND');
  END IF;

  -- Check if user is participant
  SELECT EXISTS(
    SELECT 1 FROM airdrop_participations WHERE airdrop_id = p_airdrop_id AND user_id = v_uid
  ) INTO v_is_participant;

  -- Authorization: admin, submitter, or participant
  IF NOT v_is_admin AND v_submitted_by != v_uid AND NOT v_is_participant THEN
    RETURN json_build_object('success', false, 'error', 'NOT_AUTHORIZED');
  END IF;

  -- Insert message
  INSERT INTO airdrop_messages (airdrop_id, sender_id, body, is_admin)
  VALUES (p_airdrop_id, v_uid, trim(p_body), v_is_admin)
  RETURNING id INTO v_msg_id;

  -- ── Notifications ──
  IF v_is_admin THEN
    -- Admin scrive → notifica al submitter
    v_recipient_id := v_submitted_by;
  ELSE
    -- Utente/partecipante scrive → notifica al primo admin
    SELECT user_id INTO v_recipient_id
    FROM user_roles WHERE role = 'admin' LIMIT 1;
  END IF;

  IF v_recipient_id IS NOT NULL AND v_recipient_id != v_uid THEN
    INSERT INTO notifications (user_id, title, body, type)
    VALUES (
      v_recipient_id,
      'Nuovo messaggio — ' || COALESCE(v_airdrop_title, 'Airdrop'),
      left(trim(p_body), 120),
      'message'
    );
  END IF;

  RETURN json_build_object('success', true, 'message_id', v_msg_id);
END;
$$;
