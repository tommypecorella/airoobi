-- ─────────────────────────────────────────────────────────
-- buy_blocks v4: aggiunge notifiche acquirente + venditore
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION buy_blocks(p_airdrop_id UUID, p_block_numbers INTEGER[])
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_airdrop RECORD;
  v_count   INTEGER;
  v_taken   INTEGER;
  v_price   INTEGER;
  v_cost    INTEGER;
  v_balance INTEGER;
  v_phase   TEXT;
  v_new_sold INTEGER;
  v_pct     NUMERIC;
  v_threshold INTEGER;
  v_threshold_key TEXT;
  v_auto_close TEXT;
  v_new_status TEXT := NULL;
  v_buyer_name TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN '{"ok":false,"error":"NOT_AUTHENTICATED"}'::JSONB;
  END IF;

  v_count := array_length(p_block_numbers, 1);
  IF v_count IS NULL OR v_count = 0 THEN
    RETURN '{"ok":false,"error":"NO_BLOCKS_SELECTED"}'::JSONB;
  END IF;

  -- Lock airdrop
  SELECT * INTO v_airdrop FROM airdrops
  WHERE id = p_airdrop_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN '{"ok":false,"error":"AIRDROP_NOT_FOUND"}'::JSONB;
  END IF;

  IF v_airdrop.status NOT IN ('presale', 'sale') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'AIRDROP_NOT_OPEN', 'status', v_airdrop.status);
  END IF;

  -- Validate block numbers in range
  IF EXISTS (
    SELECT 1 FROM unnest(p_block_numbers) AS bn
    WHERE bn < 1 OR bn > v_airdrop.total_blocks
  ) THEN
    RETURN '{"ok":false,"error":"BLOCK_NUMBER_OUT_OF_RANGE"}'::JSONB;
  END IF;

  -- Check for already taken blocks
  SELECT COUNT(*) INTO v_taken
  FROM airdrop_blocks
  WHERE airdrop_id = p_airdrop_id
    AND block_number = ANY(p_block_numbers);

  IF v_taken > 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'BLOCKS_ALREADY_TAKEN', 'taken_count', v_taken);
  END IF;

  -- Determina fase e prezzo
  v_phase := v_airdrop.status;
  IF v_phase = 'presale' AND v_airdrop.presale_block_price IS NOT NULL THEN
    v_price := v_airdrop.presale_block_price;
  ELSE
    v_price := v_airdrop.block_price_aria;
  END IF;

  v_cost := v_price * v_count;

  SELECT total_points INTO v_balance FROM profiles WHERE id = v_user_id;
  IF NOT FOUND THEN
    RETURN '{"ok":false,"error":"PROFILE_NOT_FOUND"}'::JSONB;
  END IF;

  IF v_balance < v_cost THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INSUFFICIENT_ARIA', 'balance', v_balance, 'cost', v_cost);
  END IF;

  -- Deduct ARIA
  UPDATE profiles SET total_points = total_points - v_cost WHERE id = v_user_id;

  -- Ledger
  INSERT INTO points_ledger (user_id, amount, reason)
  VALUES (v_user_id, -v_cost, 'airdrop_block_purchase:' || p_airdrop_id::text);

  -- Insert blocks con fase di acquisto
  INSERT INTO airdrop_blocks (airdrop_id, block_number, owner_id, purchased_phase)
  SELECT p_airdrop_id, bn, v_user_id, v_phase
  FROM unnest(p_block_numbers) AS bn;

  -- Update blocks_sold
  v_new_sold := v_airdrop.blocks_sold + v_count;
  UPDATE airdrops
  SET blocks_sold = v_new_sold
  WHERE id = p_airdrop_id;

  -- Participation record
  INSERT INTO airdrop_participations (user_id, airdrop_id, blocks_count, aria_spent)
  VALUES (v_user_id, p_airdrop_id, v_count, v_cost);

  -- ══ NOTIFICHE ══

  -- Nome acquirente per la notifica al venditore
  SELECT COALESCE(display_name, split_part(email, '@', 1), 'Qualcuno')
  INTO v_buyer_name
  FROM profiles WHERE id = v_user_id;

  -- Notifica all'acquirente
  INSERT INTO notifications (user_id, type, title, body, airdrop_id)
  VALUES (
    v_user_id,
    'blocks_purchased',
    'Blocchi acquisiti',
    'Hai acquisito ' || v_count || ' ' ||
    CASE WHEN v_count = 1 THEN 'blocco' ELSE 'blocchi' END ||
    ' in "' || v_airdrop.title || '" per ' || v_cost || ' ARIA.',
    p_airdrop_id
  );

  -- Notifica al venditore (se diverso dall'acquirente)
  IF v_airdrop.submitted_by IS NOT NULL AND v_airdrop.submitted_by <> v_user_id THEN
    INSERT INTO notifications (user_id, type, title, body, airdrop_id)
    VALUES (
      v_airdrop.submitted_by,
      'blocks_sold',
      'Nuova partecipazione',
      v_buyer_name || ' ha acquisito ' || v_count || ' ' ||
      CASE WHEN v_count = 1 THEN 'blocco' ELSE 'blocchi' END ||
      ' in "' || v_airdrop.title || '" (' || v_new_sold || '/' || v_airdrop.total_blocks || ').',
      p_airdrop_id
    );
  END IF;

  -- ══ AUTO STATE TRANSITIONS ══

  v_pct := (v_new_sold::NUMERIC / v_airdrop.total_blocks) * 100;

  -- 1) presale → sale: se supera soglia configurata per duration_type
  IF v_airdrop.status = 'presale' THEN
    v_threshold_key := 'presale_threshold_' || COALESCE(v_airdrop.duration_type, 'standard');
    SELECT value::INTEGER INTO v_threshold FROM airdrop_config WHERE key = v_threshold_key;
    IF v_threshold IS NULL THEN v_threshold := 20; END IF;

    IF v_pct >= v_threshold THEN
      UPDATE airdrops SET status = 'sale', updated_at = NOW() WHERE id = p_airdrop_id;
      v_new_status := 'sale';
    END IF;
  END IF;

  -- 2) 100% venduto → auto-close + auto-draw
  IF v_new_sold >= v_airdrop.total_blocks THEN
    SELECT value INTO v_auto_close FROM airdrop_config WHERE key = 'auto_close_on_sellout';
    IF v_auto_close = 'true' AND v_airdrop.auto_draw THEN
      UPDATE airdrops SET status = 'closed', updated_at = NOW() WHERE id = p_airdrop_id;
      v_new_status := 'closed';
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'blocks_purchased', v_count,
    'blocks_bought', v_count,
    'aria_spent', v_cost,
    'price_per_block', v_price,
    'phase', v_phase,
    'new_balance', v_balance - v_cost,
    'balance_after', v_balance - v_cost,
    'fill_pct', ROUND(v_pct, 1),
    'status_changed', v_new_status
  );
END;
$$;
