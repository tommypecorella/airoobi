-- ═══════════════════════════════════════════════════════════════
-- SCORING v4 — Anti-gambling / Fairness cumulativa per categoria
-- 19 Aprile 2026 · F2 close refinement
-- ═══════════════════════════════════════════════════════════════
-- Principio: vince chi ha impegnato più ARIA nella categoria dal
-- giorno dell'iscrizione (escluso ARIA rimborsati, escluso ARIA
-- pre-ultima-vittoria nella stessa categoria).
--
-- Motivazione (Skeezu, 2026-04-19):
--   "Soddisfare il prima possibile gli utenti che, a parità di
--    categoria, dal giorno dell'iscrizione hanno speso + ARIA in
--    quella categoria, anche per evitare che alla fine per ottenere
--    un oggetto da €500 tu ne abbia già spesi più di €500 in quella
--    categoria. Altrimenti saremmo peggio del gioco d'azzardo."
--
-- Differenze da v3:
--   - RIMOSSI F1/F2 e pesi. Un solo punteggio lineare.
--   - score = ARIA_storico_categoria_post_last_win + ARIA_airdrop_corrente
--   - ARIA di airdrop annullati/rimborsati NON contano (cancelled_at IS NULL)
--   - ARIA di airdrop in cui l'utente è stato vincitore nella stessa
--     categoria → contano solo quelli POST ultima vittoria (reset)
--   - Tiebreaker: (1) più blocchi nell'airdrop corrente (2) seniority
--   - Formula matematicamente impossibile = SCORE_based:
--       my_max = my_score + remaining_blocks × block_price
--       if my_max < leader_score → impossible
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION calculate_winner_score(p_airdrop_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_category TEXT;
  v_result JSONB;
  v_n INTEGER;
BEGIN
  SELECT category INTO v_category
  FROM airdrops WHERE id = p_airdrop_id;

  SELECT COUNT(DISTINCT user_id) INTO v_n
  FROM airdrop_participations
  WHERE airdrop_id = p_airdrop_id AND cancelled_at IS NULL;

  IF v_n = 0 THEN
    RETURN '[]'::JSONB;
  END IF;

  WITH
  -- Blocchi + ARIA spesi nell'airdrop corrente (per utente)
  user_current AS (
    SELECT
      user_id,
      SUM(blocks_count) AS total_blocks,
      SUM(aria_spent)    AS current_aria
    FROM airdrop_participations
    WHERE airdrop_id = p_airdrop_id
      AND cancelled_at IS NULL
    GROUP BY user_id
  ),
  -- Ultima vittoria nella stessa categoria per ogni partecipante (One Category Rule)
  last_win AS (
    SELECT
      a.winner_id AS user_id,
      MAX(a.draw_executed_at) AS last_win_at
    FROM airdrops a
    WHERE a.category = v_category
      AND a.winner_id IS NOT NULL
      AND a.winner_id IN (SELECT user_id FROM user_current)
    GROUP BY a.winner_id
  ),
  -- Storico ARIA in categoria (escluso airdrop corrente, escluso cancellati,
  -- escluso pre-ultima-vittoria)
  cat_history AS (
    SELECT
      ap.user_id,
      COALESCE(SUM(ap.aria_spent), 0) AS historic_aria
    FROM airdrop_participations ap
    JOIN airdrops a ON a.id = ap.airdrop_id
    LEFT JOIN last_win lw ON lw.user_id = ap.user_id
    WHERE a.category = v_category
      AND ap.airdrop_id <> p_airdrop_id
      AND ap.cancelled_at IS NULL
      AND a.status <> 'annullato'
      AND ap.user_id IN (SELECT user_id FROM user_current)
      AND (lw.last_win_at IS NULL OR ap.created_at > lw.last_win_at)
    GROUP BY ap.user_id
  ),
  -- Score v4: ARIA totali in categoria (storico + corrente)
  final_scores AS (
    SELECT
      uc.user_id,
      uc.total_blocks,
      uc.current_aria,
      COALESCE(ch.historic_aria, 0)::NUMERIC AS historic_aria,
      (uc.current_aria + COALESCE(ch.historic_aria, 0))::NUMERIC AS score
    FROM user_current uc
    LEFT JOIN cat_history ch ON ch.user_id = uc.user_id
  ),
  -- Classifica
  ranked AS (
    SELECT
      fs.*,
      ROW_NUMBER() OVER (
        ORDER BY
          fs.score DESC,
          -- Tiebreaker 1: più blocchi nell'airdrop corrente
          fs.total_blocks DESC,
          -- Tiebreaker 2: primo blocco comprato prima
          (SELECT MIN(ab.purchased_at) FROM airdrop_blocks ab
           WHERE ab.airdrop_id = p_airdrop_id AND ab.owner_id = fs.user_id) ASC,
          -- Tiebreaker 3 (estrema ratio): registrato prima
          (SELECT p.created_at FROM profiles p WHERE p.id = fs.user_id) ASC
      ) AS rank
    FROM final_scores fs
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'user_id', r.user_id,
      'score', r.score,
      'historic_aria', r.historic_aria,
      'current_aria', r.current_aria,
      -- Compat v3: campi legacy mantenuti per il FE che li consuma
      'f1', r.total_blocks,
      'f2', r.historic_aria,
      'blocks', r.total_blocks,
      'aria_spent', r.current_aria,
      'rank', r.rank
    )
    ORDER BY r.rank
  ) INTO v_result
  FROM ranked r;

  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$;

GRANT EXECUTE ON FUNCTION calculate_winner_score(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_winner_score(UUID) TO anon;

-- ─────────────────────────────────────────────────────────────
-- Helper RPC: my_category_score_snapshot(airdrop_id)
-- Ritorna lo stato dell'utente corrente per la card FE "Come arrivare 1°"
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION my_category_score_snapshot(p_airdrop_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_category TEXT;
  v_block_price INTEGER;
  v_remaining INTEGER;
  v_total_blocks INTEGER;
  v_blocks_sold INTEGER;
  v_my_score NUMERIC := 0;
  v_my_blocks INTEGER := 0;
  v_leader_score NUMERIC := 0;
  v_leader_user UUID;
  v_total_participants INTEGER;
  v_my_historic NUMERIC := 0;
  v_my_current NUMERIC := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT category, block_price_aria, total_blocks, blocks_sold
  INTO v_category, v_block_price, v_total_blocks, v_blocks_sold
  FROM airdrops WHERE id = p_airdrop_id;

  IF v_category IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'airdrop_not_found');
  END IF;

  v_remaining := GREATEST(0, v_total_blocks - v_blocks_sold);

  -- Prendi gli scores via RPC (stessa logica di draw)
  WITH scores_json AS (SELECT calculate_winner_score(p_airdrop_id) AS arr)
  SELECT
    (elem->>'score')::NUMERIC,
    (elem->>'current_aria')::NUMERIC,
    (elem->>'historic_aria')::NUMERIC,
    (elem->>'blocks')::INTEGER
  INTO v_my_score, v_my_current, v_my_historic, v_my_blocks
  FROM scores_json, jsonb_array_elements(arr) elem
  WHERE (elem->>'user_id')::UUID = v_user_id
  LIMIT 1;

  WITH scores_json AS (SELECT calculate_winner_score(p_airdrop_id) AS arr)
  SELECT
    (elem->>'score')::NUMERIC,
    (elem->>'user_id')::UUID
  INTO v_leader_score, v_leader_user
  FROM scores_json, jsonb_array_elements(arr) elem
  WHERE (elem->>'rank')::INTEGER = 1
  LIMIT 1;

  SELECT COUNT(DISTINCT user_id) INTO v_total_participants
  FROM airdrop_participations
  WHERE airdrop_id = p_airdrop_id AND cancelled_at IS NULL;

  RETURN jsonb_build_object(
    'ok', true,
    'my_score', COALESCE(v_my_score, 0),
    'my_blocks', COALESCE(v_my_blocks, 0),
    'my_historic', COALESCE(v_my_historic, 0),
    'my_current', COALESCE(v_my_current, 0),
    'leader_score', COALESCE(v_leader_score, 0),
    'leader_is_me', v_leader_user = v_user_id,
    'remaining_blocks', v_remaining,
    'block_price', v_block_price,
    'max_reachable_score', COALESCE(v_my_score, 0) + (v_remaining * v_block_price),
    'math_impossible',
      CASE
        WHEN v_leader_user = v_user_id THEN false
        WHEN v_leader_score IS NULL THEN false
        ELSE (COALESCE(v_my_score, 0) + (v_remaining * v_block_price)) < v_leader_score
      END,
    'aria_needed_to_lead',
      CASE
        WHEN v_leader_user = v_user_id THEN 0
        ELSE GREATEST(0, COALESCE(v_leader_score, 0) - COALESCE(v_my_score, 0) + 1)
      END,
    'total_participants', v_total_participants,
    'category', v_category
  );
END;
$$;

GRANT EXECUTE ON FUNCTION my_category_score_snapshot(UUID) TO authenticated;
