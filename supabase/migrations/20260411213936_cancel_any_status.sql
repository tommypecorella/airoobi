-- ══════════════════════════════════════════════════
-- AIROOBI — Ritiro partecipazione senza vincolo di stato
-- L'utente può ritirare in qualsiasi momento e qualsiasi stato.
-- Fix: rimosso vincolo presale/sale + rimossa colonna 'data'
-- inesistente nella INSERT su notifications.
-- ══════════════════════════════════════════════════

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

  -- Lock airdrop
  SELECT * INTO v_airdrop
  FROM airdrops
  WHERE id = p_airdrop_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'AIRDROP_NOT_FOUND');
  END IF;

  -- Nessun vincolo di stato: l'utente può ritirare in qualsiasi momento

  -- Conta blocchi e ARIA da questa partecipazione (solo non-cancellati)
  SELECT COALESCE(SUM(blocks_count), 0), COALESCE(SUM(aria_spent), 0)
  INTO v_total_blocks, v_total_aria
  FROM airdrop_participations
  WHERE user_id = v_user_id
    AND airdrop_id = p_airdrop_id
    AND cancelled_at IS NULL;

  IF v_total_blocks = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NO_PARTICIPATION');
  END IF;

  -- Marca le partecipazioni come cancellate
  UPDATE airdrop_participations
  SET cancelled_at = NOW()
  WHERE user_id = v_user_id
    AND airdrop_id = p_airdrop_id
    AND cancelled_at IS NULL;

  -- Rilascia i blocchi dalla griglia
  DELETE FROM airdrop_blocks
  WHERE airdrop_id = p_airdrop_id
    AND owner_id = v_user_id;

  -- Decrementa blocks_sold sull'airdrop
  UPDATE airdrops
  SET blocks_sold = GREATEST(0, blocks_sold - v_total_blocks)
  WHERE id = p_airdrop_id;

  -- Registra nel ledger (ARIA NON rimborsati — nota informativa)
  INSERT INTO points_ledger (user_id, amount, reason)
  VALUES (v_user_id, 0, 'participation_cancelled:' || p_airdrop_id::text || ':lost_aria:' || v_total_aria);

  -- Notifica
  INSERT INTO notifications (user_id, type, title, body)
  VALUES (
    v_user_id,
    'participation_cancelled',
    'Partecipazione ritirata',
    'Hai ritirato la tua partecipazione da "' || v_airdrop.title || '". ' || v_total_blocks || ' blocchi rilasciati. ' || v_total_aria || ' ARIA non rimborsati.'
  );

  RETURN jsonb_build_object(
    'ok', true,
    'blocks_released', v_total_blocks,
    'aria_lost', v_total_aria
  );
END;
$$;
