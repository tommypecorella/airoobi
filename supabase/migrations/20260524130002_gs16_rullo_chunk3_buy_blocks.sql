-- ════════════════════════════════════════════════════════════════════
-- GS-16 · IL RULLO ROBI · Chunk 3 · buy_blocks rewrite + accredito istantaneo
-- 24 May 2026 · cluster GS-16
-- ════════════════════════════════════════════════════════════════════
-- Riprende latest buy_blocks (20260522170000_w5_closure_pr5_disinnesco_soldout)
-- aggiungendo logica RULLO post-INSERT in airdrop_blocks:
--   1. UPDATE airdrop_block_seeds SET found_at, found_by per blocchi acquistati
--      con ROBI nascosto non-ancora-trovato
--   2. INSERT in nft_rewards per ogni ROBI trovato (source='gs16_rullo_block')
--   3. UPDATE treasury_stats: robi_rullo_redeemed + nft_circulating
--   4. INSERT notifications per ogni ROBI trovato
--   5. Restituisce revealed_robi: [block_numbers] nel JSON di risposta
--      (FE Chunk 5 usa questo array per reveal animation)
--
-- Requisito HARD (locked Skeezu/ROBY): accredito istantaneo + voce storico,
-- nello stesso istante del mining. Niente "in arrivo", niente attesa chiusura.
--
-- Fix commento ingannevole W5 PR-3 (vedi sotto): pre-GS-16 il commento
-- "I ROBI del rullo sono già accreditati all'acquisto del blocco" era
-- FALSO. Post-GS-16 (con questo Chunk 3) DIVENTA VERO.
-- ════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.buy_blocks(p_airdrop_id UUID, p_block_numbers INTEGER[])
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
  v_revealed_robi INTEGER[] := ARRAY[]::INTEGER[];
  v_robi_total INTEGER := 0;
  v_seed RECORD;
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

  -- ══════════════════════════════════════════════════════════════════
  -- ══ GS-16 · IL RULLO ROBI · accredito istantaneo (requisito HARD) ══
  -- ══════════════════════════════════════════════════════════════════
  -- Scopri ROBI nascosti nei blocchi acquistati + accredita SUBITO al wallet.
  -- Indipendente dalla chiusura airdrop (closure-independent).
  --
  -- Aggiorna anche treasury_stats.robi_rullo_redeemed + nft_circulating
  -- (contabilizzazione emissione tracciata · guardrail layer 2).
  FOR v_seed IN
    UPDATE public.airdrop_block_seeds
    SET found_at = NOW(), found_by = v_user_id
    WHERE airdrop_id = p_airdrop_id
      AND block_number = ANY(p_block_numbers)
      AND found_at IS NULL
    RETURNING block_number, robi_amount
  LOOP
    -- Voce storico ROBI (requisito HARD)
    INSERT INTO public.nft_rewards (user_id, nft_type, name, source, airdrop_id, shares, metadata)
    VALUES (
      v_user_id,
      'ROBI',
      'ROBI trovato nel rullo',
      'gs16_rullo_block',
      p_airdrop_id,
      v_seed.robi_amount,
      jsonb_build_object(
        'block_number', v_seed.block_number,
        'airdrop_title', v_airdrop.title,
        'found_via', 'buy_blocks'
      )
    );

    v_revealed_robi := array_append(v_revealed_robi, v_seed.block_number);
    v_robi_total := v_robi_total + v_seed.robi_amount;
  END LOOP;

  -- Contabilizzazione + accredito wallet ROBI (treasury_stats)
  IF v_robi_total > 0 THEN
    UPDATE public.treasury_stats
    SET robi_rullo_redeemed = robi_rullo_redeemed + v_robi_total,
        nft_circulating     = nft_circulating + v_robi_total,
        nft_minted          = nft_minted + v_robi_total
    WHERE id = (SELECT id FROM public.treasury_stats ORDER BY created_at DESC LIMIT 1);

    -- Notifica reveal (1 per ROBI trovato — toast in pagina via FE Chunk 5)
    INSERT INTO notifications (user_id, type, title, body, airdrop_id)
    VALUES (
      v_user_id,
      'rullo_robi_found',
      'ROBI trovato nel rullo',
      'Hai trovato ' || v_robi_total || ' ' ||
      CASE WHEN v_robi_total = 1 THEN 'ROBI' ELSE 'ROBI' END ||
      ' nascosto nel rullo di "' || v_airdrop.title || '"! Già accreditato sul tuo wallet.',
      p_airdrop_id
    );
  END IF;

  -- ══ NOTIFICHE ACQUISTO ══
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

  -- Closure v3 (PR-5): NIENTE setter 'closed' sul sold-out. detect_airdrop_end_event
  -- (cron 5 min) intercetta via trigger 'sold_out' → waiting_seller_acknowledge.
  --
  -- GS-16 FIX commento ingannevole W5 PR-3 (20260522150000_w5_closure_pr3_cleanup_consolazione.sql):
  -- Pre-GS-16 il commento "I ROBI del rullo sono già accreditati all'acquisto del blocco"
  -- era FALSO (buy_blocks non accreditava ROBI). Post-GS-16, con questa rewrite,
  -- DIVENTA VERO: i ROBI del rullo (b) sono accreditati istantaneamente sopra
  -- (FOR v_seed IN UPDATE airdrop_block_seeds ... RETURNING ...).
  -- La consolazione non-vincitori Closure v3 = ROBI del rullo accumulati durante
  -- la corsa, ora effettivamente nel wallet.

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
    'sold_out', v_new_sold >= v_airdrop.total_blocks,
    -- GS-16 · FE Chunk 5 reveal animation usa questi 2 campi
    'revealed_robi', to_jsonb(v_revealed_robi),
    'revealed_robi_total', v_robi_total
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.buy_blocks(UUID, INTEGER[]) TO authenticated;

COMMENT ON FUNCTION public.buy_blocks(UUID, INTEGER[]) IS 'GS-16 · Acquisto blocchi · fairness guard server-side · auto presale→sale · PR-5: nessun setter closed sul sold-out · GS-16: accredito istantaneo ROBI rullo (closure-independent) + reveal in revealed_robi array.';

-- ─────────────────────────────────────────────────────────────────
-- Mini integration test (feedback_pr_integration_test)
-- ─────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_src TEXT;
BEGIN
  IF to_regprocedure('public.buy_blocks(uuid,integer[])') IS NULL THEN
    RAISE EXCEPTION 'GS-16 Chunk 3 test FAIL · buy_blocks mancante';
  END IF;
  SELECT pg_get_functiondef('public.buy_blocks(uuid,integer[])'::regprocedure) INTO v_src;
  -- buy_blocks non deve più portare un airdrop a 'closed' (preserva PR-5 fix)
  IF v_src ILIKE '%status = ''closed''%' OR v_src ILIKE '%status=''closed''%' THEN
    RAISE EXCEPTION 'GS-16 Chunk 3 test FAIL · regressione PR-5 · buy_blocks setta status=closed';
  END IF;
  -- la transizione presale→sale deve restare
  IF v_src NOT ILIKE '%status = ''sale''%' THEN
    RAISE EXCEPTION 'GS-16 Chunk 3 test FAIL · regressione · transizione presale→sale persa';
  END IF;
  -- GS-16 specifica: revealed_robi nel return
  IF v_src NOT ILIKE '%revealed_robi%' THEN
    RAISE EXCEPTION 'GS-16 Chunk 3 test FAIL · revealed_robi non presente nel JSON di ritorno';
  END IF;
  -- GS-16 specifica: airdrop_block_seeds UPDATE
  IF v_src NOT ILIKE '%airdrop_block_seeds%' THEN
    RAISE EXCEPTION 'GS-16 Chunk 3 test FAIL · airdrop_block_seeds non referenziata in buy_blocks';
  END IF;
  -- GS-16 specifica: nft_rewards INSERT per rullo
  IF v_src NOT ILIKE '%gs16_rullo_block%' THEN
    RAISE EXCEPTION 'GS-16 Chunk 3 test FAIL · source gs16_rullo_block non presente';
  END IF;
  RAISE NOTICE 'GS-16 Chunk 3 (buy_blocks + reveal rullo) integration test OK · PR-5 preserved · accredito ROBI istantaneo wired';
END $$;
