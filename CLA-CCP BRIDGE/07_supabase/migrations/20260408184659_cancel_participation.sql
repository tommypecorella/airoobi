-- ══════════════════════════════════════════════════
-- AIROOBI — Cancel participation (logical delete)
-- L'utente può ritirare la propria partecipazione da un airdrop.
-- I blocchi vengono rilasciati, ma gli ARIA spesi NON vengono rimborsati
-- (restano ad AIROOBI come costo valutazione/utilizzo piattaforma).
-- La partecipazione resta visibile in archivio.
-- ══════════════════════════════════════════════════

-- 1. Aggiungi colonna cancelled_at a airdrop_participations
ALTER TABLE airdrop_participations
ADD COLUMN cancelled_at TIMESTAMPTZ DEFAULT NULL;

-- 2. RPC: cancel_my_participation
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

  -- Solo airdrop attivi (presale/sale) possono essere cancellati
  IF v_airdrop.status NOT IN ('presale', 'sale') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'AIRDROP_NOT_ACTIVE');
  END IF;

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
  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (
    v_user_id,
    'participation_cancelled',
    'Partecipazione ritirata',
    'Hai ritirato la tua partecipazione da "' || v_airdrop.title || '". ' || v_total_blocks || ' blocchi rilasciati. ' || v_total_aria || ' ARIA non rimborsati.',
    jsonb_build_object('airdrop_id', p_airdrop_id, 'blocks', v_total_blocks, 'aria_lost', v_total_aria)
  );

  RETURN jsonb_build_object(
    'ok', true,
    'blocks_released', v_total_blocks,
    'aria_lost', v_total_aria
  );
END;
$$;

GRANT EXECUTE ON FUNCTION cancel_my_participation(UUID) TO authenticated;
