-- ══════════════════════════════════════════════════
-- AIROOBI — Ritira proposta (submission)
-- Il proponente può ritirare la propria proposta in qualsiasi momento.
-- Lo status diventa 'annullato'.
-- ══════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION withdraw_my_submission(p_airdrop_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_airdrop RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED');
  END IF;

  SELECT * INTO v_airdrop
  FROM airdrops
  WHERE id = p_airdrop_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  END IF;

  -- Solo il proponente può ritirare
  IF v_airdrop.submitted_by != v_user_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_AUTHORIZED');
  END IF;

  -- Già annullato o completato
  IF v_airdrop.status IN ('annullato', 'completed') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ALREADY_FINALIZED');
  END IF;

  UPDATE airdrops
  SET status = 'annullato',
      rejection_reason = 'Ritirato dal proponente',
      updated_at = NOW()
  WHERE id = p_airdrop_id;

  -- Notifica
  INSERT INTO notifications (user_id, type, title, body)
  VALUES (
    v_user_id,
    'submission_withdrawn',
    'Proposta ritirata',
    'La tua proposta "' || v_airdrop.title || '" è stata ritirata.'
  );

  RETURN jsonb_build_object('ok', true, 'title', v_airdrop.title);
END;
$$;

GRANT EXECUTE ON FUNCTION withdraw_my_submission(UUID) TO authenticated;
