-- W5 · Airdrop Closure Design v3 · PR-5 (BE) · Disinnesco conflitto sold-out
-- ROBY_Airdrop_Closure_Design_LOCKED_2026-05-22 §7 · triage UAT (F8 invisibile).
--
-- Problema: buy_blocks sul sold-out faceva UPDATE status='closed'. Ma
-- detect_airdrop_end_event processa solo status IN ('presale','sale') → un
-- airdrop andato 'closed' da buy_blocks NON entrava mai nel flusso closure v3
-- (waiting_seller_acknowledge), saltando estrazione + decisione venditore (F8).
--
-- Fix: rimuovo il setter 'closed' da buy_blocks. L'airdrop sold-out resta
-- 'presale'/'sale' e detect_airdrop_end_event (cron 5 min) lo intercetta via
-- il trigger 'sold_out' che già gestisce — portandolo a waiting_seller_acknowledge.
--
-- Identica a 20260427090000_fairness_guard_serverside.sql, con la sola rimozione
-- del blocco auto-close sul sold-out.

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
  v_new_status TEXT := NULL;
  v_buyer_name TEXT;
  v_fair    JSONB;
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

  IF EXISTS (
    SELECT 1 FROM unnest(p_block_numbers) AS bn
    WHERE bn < 1 OR bn > v_airdrop.total_blocks
  ) THEN
    RETURN '{"ok":false,"error":"BLOCK_NUMBER_OUT_OF_RANGE"}'::JSONB;
  END IF;

  SELECT COUNT(*) INTO v_taken
  FROM airdrop_blocks
  WHERE airdrop_id = p_airdrop_id
    AND block_number = ANY(p_block_numbers);

  IF v_taken > 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'BLOCKS_ALREADY_TAKEN', 'taken_count', v_taken);
  END IF;

  -- ══ FAIRNESS GUARD SERVER-SIDE (Hole #2) ══
  v_fair := public.check_fairness_can_buy(p_airdrop_id, v_user_id, v_count);
  IF (v_fair->>'can_buy')::BOOLEAN = false THEN
    RAISE EXCEPTION 'fairness_block:%', (v_fair->>'reason');
  END IF;

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

  UPDATE profiles SET total_points = total_points - v_cost WHERE id = v_user_id;

  INSERT INTO points_ledger (user_id, amount, reason)
  VALUES (v_user_id, -v_cost, 'airdrop_block_purchase:' || p_airdrop_id::text);

  INSERT INTO airdrop_blocks (airdrop_id, block_number, owner_id, purchased_phase)
  SELECT p_airdrop_id, bn, v_user_id, v_phase
  FROM unnest(p_block_numbers) AS bn;

  v_new_sold := v_airdrop.blocks_sold + v_count;
  UPDATE airdrops
  SET blocks_sold = v_new_sold
  WHERE id = p_airdrop_id;

  INSERT INTO airdrop_participations (user_id, airdrop_id, blocks_count, aria_spent)
  VALUES (v_user_id, p_airdrop_id, v_count, v_cost);

  -- ══ NOTIFICHE ══
  SELECT COALESCE(
    NULLIF(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')), ''),
    split_part(email, '@', 1),
    'Qualcuno'
  )
  INTO v_buyer_name
  FROM profiles WHERE id = v_user_id;

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

  IF v_airdrop.status = 'presale' THEN
    v_threshold_key := 'presale_threshold_' || COALESCE(v_airdrop.duration_type, 'standard');
    SELECT value::INTEGER INTO v_threshold FROM airdrop_config WHERE key = v_threshold_key;
    IF v_threshold IS NULL THEN v_threshold := 20; END IF;

    IF v_pct >= v_threshold THEN
      UPDATE airdrops SET status = 'sale', updated_at = NOW() WHERE id = p_airdrop_id;
      v_new_status := 'sale';
    END IF;
  END IF;

  -- Closure v3 (PR-5): NIENTE setter 'closed' sul sold-out. L'airdrop sold-out
  -- resta 'presale'/'sale' e detect_airdrop_end_event (cron 5 min) lo porta a
  -- waiting_seller_acknowledge via il trigger 'sold_out'. Senza questo fix il
  -- sold-out saltava tutto il flusso closure v3 (F8).

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
    'status_changed', v_new_status,
    'sold_out', v_new_sold >= v_airdrop.total_blocks
  );
END;
$$;

GRANT EXECUTE ON FUNCTION buy_blocks(UUID, INTEGER[]) TO authenticated;

COMMENT ON FUNCTION buy_blocks(UUID, INTEGER[]) IS 'Acquisto blocchi · fairness guard server-side · auto presale→sale · PR-5: nessun setter closed sul sold-out (lo gestisce detect_airdrop_end_event).';

-- ─────────────────────────────────────────────────────────────
-- Mini integration test (feedback_pr_integration_test)
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_src TEXT;
BEGIN
  IF to_regprocedure('public.buy_blocks(uuid,integer[])') IS NULL THEN
    RAISE EXCEPTION 'PR-5 test FAIL · buy_blocks mancante';
  END IF;
  SELECT pg_get_functiondef('public.buy_blocks(uuid,integer[])'::regprocedure) INTO v_src;
  -- buy_blocks non deve più portare un airdrop a 'closed'
  IF v_src ILIKE '%status = ''closed''%' OR v_src ILIKE '%status=''closed''%' THEN
    RAISE EXCEPTION 'PR-5 test FAIL · buy_blocks setta ancora status=closed sul sold-out';
  END IF;
  -- la transizione presale→sale deve restare
  IF v_src NOT ILIKE '%status = ''sale''%' THEN
    RAISE EXCEPTION 'PR-5 test FAIL · buy_blocks ha perso la transizione presale→sale';
  END IF;
  RAISE NOTICE 'PR-5 (BE) integration test OK · setter closed rimosso da buy_blocks';
END $$;
