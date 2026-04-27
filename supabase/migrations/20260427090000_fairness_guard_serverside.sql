-- ════════════════════════════════════════════════════════════════════
-- Hole #2 · Server-side fairness guard
-- TECH-HARDEN-001 · Sprint W1 · 27 Apr 2026
--
-- Problema: la fairness guard era client-side only (airdrop.js).
-- Un utente con accesso API diretto può aggirare la guard via curl
-- POST /rest/v1/rpc/buy_blocks. Questa migration:
--   1. Crea helper public.check_fairness_can_buy() — pure read-only
--   2. Aggiunge gatekeeping in buy_blocks() prima di eseguire l'acquisto
--   3. Edge function process-auto-buy chiamerà lo stesso helper
--      (e disabiliterà la regola via disable_auto_buy + log su events)
-- ════════════════════════════════════════════════════════════════════

-- ── 1. Helper riusabile ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.check_fairness_can_buy(
  p_airdrop_id UUID,
  p_user_id    UUID,
  p_extra_blocks INT DEFAULT 1
) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_my_score      NUMERIC;
  v_leader_score  NUMERIC;
  v_my_max_score  NUMERIC;
  v_pos           INT;
  v_remaining     INT;
  v_my_pity       NUMERIC;
  v_storici       NUMERIC;
  v_K             NUMERIC;
  v_my_blocks     INT;
  v_snapshot      jsonb;
BEGIN
  -- Pull snapshot via RPC esistente (impersonando l'utente target).
  -- Il chiamante deve essere autorizzato (SECURITY DEFINER bypassa RLS,
  -- ma noi rispondiamo can_buy=true se manca lo snapshot per quell'utente).
  SELECT jsonb_build_object(
    'my_score', m.my_score,
    'leader_score', m.leader_score,
    'position', m.position,
    'my_pity_bonus_current', m.my_pity_bonus_current,
    'storici_cat', m.storici_cat,
    'k_current', m.k_current,
    'my_blocks_current', m.my_blocks_current
  )
  INTO v_snapshot
  FROM public.my_category_score_snapshot_for(p_airdrop_id, p_user_id) m;

  IF v_snapshot IS NULL THEN
    -- Fallback: nessun dato di scoring → non bloccare (utente nuovo / no participants)
    RETURN jsonb_build_object('can_buy', true, 'reason', 'no_score_data');
  END IF;

  v_my_score     := COALESCE((v_snapshot->>'my_score')::NUMERIC, 0);
  v_leader_score := COALESCE((v_snapshot->>'leader_score')::NUMERIC, 0);
  v_pos          := COALESCE((v_snapshot->>'position')::INT, 1);
  v_my_pity      := COALESCE((v_snapshot->>'my_pity_bonus_current')::NUMERIC, 0);
  v_storici      := COALESCE((v_snapshot->>'storici_cat')::NUMERIC, 0);
  v_K            := GREATEST(COALESCE((v_snapshot->>'k_current')::NUMERIC, 100), 1);
  v_my_blocks    := COALESCE((v_snapshot->>'my_blocks_current')::INT, 0);

  -- Remaining blocks dell'airdrop
  SELECT (total_blocks - blocks_sold) INTO v_remaining
    FROM public.airdrops WHERE id = p_airdrop_id;

  IF v_remaining IS NULL THEN
    RETURN jsonb_build_object('can_buy', false, 'reason', 'airdrop_not_found');
  END IF;

  -- Se utente è già 1° o non ci sono dati di leader → buy ammesso
  IF v_pos = 1 OR v_leader_score = 0 THEN
    RETURN jsonb_build_object('can_buy', true, 'reason', 'leader_or_no_data');
  END IF;

  -- Recompute max f_base achievable se compra TUTTI i blocchi residui + p_extra
  v_my_max_score := SQRT(v_my_blocks + LEAST(p_extra_blocks, v_remaining))
                  * (1 + LOG(10, 1 + v_storici / v_K))
                  + v_my_pity;

  IF v_my_max_score < v_leader_score THEN
    RETURN jsonb_build_object(
      'can_buy', false,
      'reason', 'math_impossible',
      'my_max_score', v_my_max_score,
      'leader_score', v_leader_score,
      'remaining', v_remaining
    );
  END IF;

  RETURN jsonb_build_object('can_buy', true, 'reason', 'ok');
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_fairness_can_buy(UUID, UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_fairness_can_buy(UUID, UUID, INT) TO service_role;

-- ── 2. Wrapper SECURITY DEFINER per snapshot impersonato ────────────
-- my_category_score_snapshot() usa auth.uid() — qui ne creiamo una
-- variante che accetta p_user_id esplicito, riusabile da check_fairness
-- e da edge function (service_role). Riproduce la logica della v5 pity.
CREATE OR REPLACE FUNCTION public.my_category_score_snapshot_for(
  p_airdrop_id UUID,
  p_user_id    UUID
) RETURNS TABLE(
  my_score              NUMERIC,
  leader_score          NUMERIC,
  position              INT,
  my_pity_bonus_current NUMERIC,
  storici_cat           NUMERIC,
  k_current             NUMERIC,
  my_blocks_current     INT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_category_id UUID;
BEGIN
  SELECT category_id INTO v_category_id FROM public.airdrops WHERE id = p_airdrop_id;
  IF v_category_id IS NULL THEN RETURN; END IF;

  RETURN QUERY
  WITH scored AS (
    SELECT * FROM public.calculate_winner_score(p_airdrop_id)
  ),
  ranked AS (
    SELECT s.*, ROW_NUMBER() OVER (ORDER BY s.score DESC) AS pos
    FROM scored s
  ),
  me AS (
    SELECT * FROM ranked WHERE user_id = p_user_id
  ),
  leader AS (
    SELECT score AS leader_score FROM ranked WHERE pos = 1
  )
  SELECT
    COALESCE(me.score, 0)                 AS my_score,
    COALESCE(leader.leader_score, 0)      AS leader_score,
    COALESCE(me.pos, 1)::INT              AS position,
    COALESCE(me.pity_bonus, 0)            AS my_pity_bonus_current,
    COALESCE((SELECT SUM(ap.aria_spent)
                FROM public.airdrop_participations ap
                JOIN public.airdrops a ON a.id = ap.airdrop_id
               WHERE ap.user_id = p_user_id
                 AND a.category_id = v_category_id
                 AND ap.cancelled_at IS NULL
                 AND a.id <> p_airdrop_id), 0) AS storici_cat,
    GREATEST(COALESCE(public.get_category_k(v_category_id), 100), 100) AS k_current,
    COALESCE((SELECT COUNT(*) FROM public.airdrop_blocks
               WHERE airdrop_id = p_airdrop_id AND owner_id = p_user_id), 0)::INT
                                          AS my_blocks_current
  FROM (SELECT 1) dummy
  LEFT JOIN me ON true
  LEFT JOIN leader ON true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.my_category_score_snapshot_for(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_category_score_snapshot_for(UUID, UUID) TO service_role;

-- NOTA: get_category_k() viene da Hole #4 migration (20260427110100).
-- Per non bloccare questa migration la helper qui sopra usa GREATEST
-- per evitare null/NaN; se Hole #4 non è ancora deployato il valore 100
-- di default è safe.

-- ── 3. Gatekeeping in buy_blocks ────────────────────────────────────
-- Re-creo buy_blocks aggiungendo il check fairness all'inizio del flow,
-- subito dopo le validation di base ma PRIMA del deduct ARIA.
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

GRANT EXECUTE ON FUNCTION buy_blocks(UUID, INTEGER[]) TO authenticated;
