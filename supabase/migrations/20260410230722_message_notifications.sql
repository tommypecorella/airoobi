-- Aggiorna send_airdrop_message per creare notifiche automatiche
-- Destinatario riceve notifica, mittente riceve conferma invio

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

  SELECT EXISTS(
    SELECT 1 FROM user_roles WHERE user_id = v_uid AND role IN ('admin','evaluator')
  ) INTO v_is_admin;

  SELECT submitted_by, title INTO v_submitted_by, v_airdrop_title
  FROM airdrops WHERE id = p_airdrop_id;

  IF v_submitted_by IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'AIRDROP_NOT_FOUND');
  END IF;

  IF NOT v_is_admin AND v_submitted_by != v_uid THEN
    RETURN json_build_object('success', false, 'error', 'NOT_AUTHORIZED');
  END IF;

  -- Insert message
  INSERT INTO airdrop_messages (airdrop_id, sender_id, body, is_admin)
  VALUES (p_airdrop_id, v_uid, trim(p_body), v_is_admin)
  RETURNING id INTO v_msg_id;

  -- Determine recipient
  IF v_is_admin THEN
    v_recipient_id := v_submitted_by;  -- admin writes to user
  ELSE
    -- user writes: notify first admin
    SELECT user_id INTO v_recipient_id
    FROM user_roles WHERE role = 'admin' LIMIT 1;
  END IF;

  -- Notification to recipient
  IF v_recipient_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, body, type)
    VALUES (
      v_recipient_id,
      'Nuovo messaggio — ' || COALESCE(v_airdrop_title, 'Airdrop'),
      left(trim(p_body), 120),
      'message'
    );
  END IF;

  -- Confirmation notification to sender
  INSERT INTO notifications (user_id, title, body, type)
  VALUES (
    v_uid,
    'Messaggio inviato',
    'Il tuo messaggio per "' || COALESCE(v_airdrop_title, 'Airdrop') || '" è stato inviato.',
    'message_sent'
  );

  RETURN json_build_object('success', true, 'message_id', v_msg_id);
END;
$$;
