-- ══════════════════════════════════════════════════════════
--  AIRDROP CHAT: messaggi tra proponente e valutatore
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.airdrop_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airdrop_id UUID NOT NULL REFERENCES airdrops(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  body TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_airdrop_messages_airdrop ON airdrop_messages(airdrop_id, created_at);

ALTER TABLE airdrop_messages ENABLE ROW LEVEL SECURITY;

-- Proponente vede solo i messaggi dei propri airdrop
CREATE POLICY "Submitter can read own airdrop messages"
ON airdrop_messages FOR SELECT
TO authenticated
USING (
  airdrop_id IN (SELECT id FROM airdrops WHERE submitted_by = auth.uid())
);

-- Admin/evaluator possono leggere tutti i messaggi
CREATE POLICY "Admin can read all airdrop messages"
ON airdrop_messages FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','evaluator'))
);

-- RPC: invia messaggio (controlla che sia il proponente o un admin/evaluator)
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

  IF NOT v_is_admin AND v_submitted_by != v_uid THEN
    RETURN json_build_object('success', false, 'error', 'NOT_AUTHORIZED');
  END IF;

  INSERT INTO airdrop_messages (airdrop_id, sender_id, body, is_admin)
  VALUES (p_airdrop_id, v_uid, trim(p_body), v_is_admin)
  RETURNING id INTO v_msg_id;

  RETURN json_build_object('success', true, 'message_id', v_msg_id);
END;
$$;

-- RPC: leggi messaggi di un airdrop
CREATE OR REPLACE FUNCTION public.get_airdrop_messages(p_airdrop_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_is_admin BOOLEAN;
  v_submitted_by UUID;
  v_result JSON;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN RETURN '[]'::JSON; END IF;

  SELECT submitted_by INTO v_submitted_by
  FROM airdrops WHERE id = p_airdrop_id;

  SELECT EXISTS(
    SELECT 1 FROM user_roles WHERE user_id = v_uid AND role IN ('admin','evaluator')
  ) INTO v_is_admin;

  IF NOT v_is_admin AND v_submitted_by != v_uid THEN
    RETURN '[]'::JSON;
  END IF;

  SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.created_at ASC), '[]'::JSON)
  INTO v_result
  FROM (
    SELECT
      m.id,
      m.body,
      m.is_admin,
      m.created_at,
      m.sender_id,
      COALESCE(NULLIF(TRIM(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')), ''), split_part(u.email, '@', 1)) AS sender_name
    FROM airdrop_messages m
    JOIN auth.users u ON u.id = m.sender_id
    LEFT JOIN profiles p ON p.id = m.sender_id
    WHERE m.airdrop_id = p_airdrop_id
  ) t;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_airdrop_message(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_airdrop_messages(UUID) TO authenticated;
