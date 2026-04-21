-- ══════════════════════════════════════════════════════════
--  Partecipanti possono leggere e inviare messaggi
--  per gli airdrop a cui hanno partecipato
-- ══════════════════════════════════════════════════════════

-- RLS: partecipanti possono leggere i messaggi dei propri airdrop
CREATE POLICY "Participant can read airdrop messages"
ON airdrop_messages FOR SELECT
TO authenticated
USING (
  airdrop_id IN (
    SELECT airdrop_id FROM airdrop_participations WHERE user_id = auth.uid()
  )
);

-- Aggiorna RPC send_airdrop_message per permettere anche ai partecipanti di inviare
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
  v_is_participant BOOLEAN;
  v_msg_id UUID;
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

  -- Check if user is submitter
  SELECT submitted_by INTO v_submitted_by
  FROM airdrops WHERE id = p_airdrop_id;

  IF v_submitted_by IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'AIRDROP_NOT_FOUND');
  END IF;

  -- Check if user is participant
  SELECT EXISTS(
    SELECT 1 FROM airdrop_participations WHERE airdrop_id = p_airdrop_id AND user_id = v_uid
  ) INTO v_is_participant;

  IF NOT v_is_admin AND v_submitted_by != v_uid AND NOT v_is_participant THEN
    RETURN json_build_object('success', false, 'error', 'NOT_AUTHORIZED');
  END IF;

  INSERT INTO airdrop_messages (airdrop_id, sender_id, body, is_admin)
  VALUES (p_airdrop_id, v_uid, trim(p_body), v_is_admin)
  RETURNING id INTO v_msg_id;

  RETURN json_build_object('success', true, 'message_id', v_msg_id);
END;
$$;
