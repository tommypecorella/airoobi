-- ─────────────────────────────────────────────────────────
-- withdraw_my_submission v2
-- Venditore ritira la proposta → status = annullato
-- Rimborso automatico ARIA a TUTTI i partecipanti attivi
-- I 50 ARIA di valutazione NON vengono rimborsati
-- Nessun ROBI generato
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION withdraw_my_submission(p_airdrop_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id     UUID;
  v_airdrop     RECORD;
  v_part        RECORD;
  v_refunded    INT := 0;
  v_users_count INT := 0;
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

  -- Stati da cui il venditore può ritirare
  -- closed/completed/annullato bloccati (draw già eseguito o già annullato)
  IF v_airdrop.status IN ('closed', 'completed', 'annullato') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'CANNOT_WITHDRAW_IN_STATUS_' || v_airdrop.status);
  END IF;

  -- ── 1. Rimborsa ARIA a tutti i partecipanti attivi ──
  FOR v_part IN
    SELECT user_id, SUM(aria_spent) AS total_spent, SUM(blocks_count) AS total_blocks
    FROM airdrop_participations
    WHERE airdrop_id = p_airdrop_id AND cancelled_at IS NULL
    GROUP BY user_id
  LOOP
    -- Accredita ARIA
    UPDATE profiles
    SET total_points = total_points + v_part.total_spent
    WHERE id = v_part.user_id;

    -- Ledger entry tracciabile
    INSERT INTO points_ledger (user_id, amount, reason)
    VALUES (
      v_part.user_id,
      v_part.total_spent,
      'airdrop_annullato_refund:' || p_airdrop_id
    );

    -- Notifica al partecipante
    INSERT INTO notifications (user_id, type, title, body, airdrop_id)
    VALUES (
      v_part.user_id,
      'airdrop_cancelled_refund',
      'Airdrop annullato — ARIA rimborsati',
      'L''airdrop "' || v_airdrop.title || '" è stato annullato dal venditore. ' ||
      v_part.total_spent || ' ARIA sono stati rimborsati.',
      p_airdrop_id
    );

    v_refunded := v_refunded + v_part.total_spent;
    v_users_count := v_users_count + 1;
  END LOOP;

  -- ── 2. Annulla tutte le partecipazioni ──
  UPDATE airdrop_participations
  SET cancelled_at = NOW()
  WHERE airdrop_id = p_airdrop_id AND cancelled_at IS NULL;

  -- ── 3. Rimuovi blocchi assegnati ──
  DELETE FROM airdrop_blocks
  WHERE airdrop_id = p_airdrop_id;

  -- ── 4. Azzera blocks_sold ──
  UPDATE airdrops
  SET blocks_sold = 0
  WHERE id = p_airdrop_id;

  -- ── 5. Status → annullato ──
  UPDATE airdrops
  SET status = 'annullato',
      rejection_reason = 'Ritirato dal proponente',
      updated_at = NOW()
  WHERE id = p_airdrop_id;

  -- ── 6. Notifica al venditore ──
  INSERT INTO notifications (user_id, type, title, body, airdrop_id)
  VALUES (
    v_user_id,
    'submission_withdrawn',
    'Proposta ritirata',
    'La tua proposta "' || v_airdrop.title || '" è stata ritirata. ' ||
    CASE WHEN v_refunded > 0
      THEN v_refunded || ' ARIA rimborsati a ' || v_users_count || ' partecipante/i.'
      ELSE 'Nessun partecipante da rimborsare.'
    END,
    p_airdrop_id
  );

  RETURN jsonb_build_object(
    'ok', true,
    'title', v_airdrop.title,
    'aria_refunded', v_refunded,
    'users_refunded', v_users_count
  );
END;
$$;
