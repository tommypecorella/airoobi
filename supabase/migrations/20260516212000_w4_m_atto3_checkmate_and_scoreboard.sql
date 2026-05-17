-- W4 · M_atto3_01 + M_atto3_02 · Atto 3 Live Evento UX backend
-- compute_checkmate_blocks · derived from real scoring v5 (not brief pseudocode)
-- get_airdrop_scoreboard_live · top-N with active vs escluso classification

-- ─────────────────────────────────────────────────────────────
-- compute_checkmate_blocks · closed-form math from scoring v5
-- ─────────────────────────────────────────────────────────────
-- Score formula v5: score = sqrt(blocks) * loyalty_mult + pity_bonus
-- loyalty_mult and pity_bonus are constant for current airdrop (s_u = historic, not current).
-- Inversion: blocks_target = ((score_target - pity_bonus) / loyalty_mult)^2

CREATE OR REPLACE FUNCTION compute_checkmate_blocks(
  p_user_id    UUID,
  p_airdrop_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_scoreboard JSONB;
  v_user_row   JSONB;
  v_leader_row JSONB;
  v_total_blocks INT; v_blocks_sold INT; v_remaining INT;
  v_sold_pct NUMERIC; v_block_price INT;
  v_user_score NUMERIC; v_user_blocks INT;
  v_user_loyalty NUMERIC; v_user_pity NUMERIC;
  v_leader_score NUMERIC; v_leader_blocks INT;
  v_leader_loyalty NUMERIC; v_leader_pity NUMERIC;
  v_to_overtake INT; v_to_checkmate INT; v_leader_self_cm INT;
  v_threshold NUMERIC := 85.0;
  v_leader_max_if_buys_all NUMERIC;
BEGIN
  SELECT total_blocks, blocks_sold, block_price_aria
    INTO v_total_blocks, v_blocks_sold, v_block_price
  FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'airdrop_not_found' USING ERRCODE='P0002'; END IF;

  v_remaining := GREATEST(v_total_blocks - v_blocks_sold, 0);
  v_sold_pct  := CASE WHEN v_total_blocks > 0 THEN v_blocks_sold * 100.0 / v_total_blocks ELSE 0 END;

  -- Snapshot scoreboard via W3 calculate_winner_score
  v_scoreboard := calculate_winner_score(p_airdrop_id);

  SELECT s INTO v_user_row   FROM jsonb_array_elements(v_scoreboard) s WHERE (s->>'user_id')::UUID = p_user_id LIMIT 1;
  SELECT s INTO v_leader_row FROM jsonb_array_elements(v_scoreboard) s WHERE (s->>'rank')::INT = 1 LIMIT 1;

  v_user_score    := COALESCE((v_user_row->>'score')::NUMERIC, 0);
  v_user_blocks   := COALESCE((v_user_row->>'blocks')::INT, 0);
  v_user_loyalty  := COALESCE((v_user_row->>'loyalty_mult')::NUMERIC, 1.0);
  v_user_pity     := COALESCE((v_user_row->>'pity_bonus')::NUMERIC, 0);

  v_leader_score   := COALESCE((v_leader_row->>'score')::NUMERIC, 0);
  v_leader_blocks  := COALESCE((v_leader_row->>'blocks')::INT, 0);
  v_leader_loyalty := COALESCE((v_leader_row->>'loyalty_mult')::NUMERIC, 1.0);
  v_leader_pity    := COALESCE((v_leader_row->>'pity_bonus')::NUMERIC, 0);

  -- Overtake leader: blocks_user_new = ((leader_score - user_pity) / user_loyalty)^2
  IF v_user_loyalty > 0 THEN
    v_to_overtake := GREATEST(
      CEIL(POWER(GREATEST(v_leader_score + 0.0001 - v_user_pity, 0) / v_user_loyalty, 2))::INT - v_user_blocks,
      0
    );
  ELSE v_to_overtake := 0; END IF;

  -- Checkmate field: must beat leader even if leader buys all remaining
  -- leader_max = sqrt(leader_blocks + remaining) * leader_loyalty + leader_pity
  v_leader_max_if_buys_all := SQRT(GREATEST(v_leader_blocks + v_remaining, 0)::NUMERIC) * v_leader_loyalty + v_leader_pity;
  IF v_user_loyalty > 0 THEN
    v_to_checkmate := GREATEST(
      CEIL(POWER(GREATEST(v_leader_max_if_buys_all + 0.0001 - v_user_pity, 0) / v_user_loyalty, 2))::INT - v_user_blocks,
      0
    );
  ELSE v_to_checkmate := 0; END IF;

  -- Leader self-checkmate: enough blocks to reach 85% sold AND make own_score unreachable
  v_leader_self_cm := GREATEST(
    CEIL(v_total_blocks * v_threshold / 100.0)::INT - v_blocks_sold,
    0
  );

  RETURN jsonb_build_object(
    'user_score_current',          v_user_score,
    'user_blocks_current',         v_user_blocks,
    'user_loyalty_mult',           v_user_loyalty,
    'user_pity_bonus',             v_user_pity,
    'leader_user_id',              v_leader_row->>'user_id',
    'leader_score_current',        v_leader_score,
    'leader_blocks_current',       v_leader_blocks,
    'blocks_to_overtake_leader',   v_to_overtake,
    'aria_cost_to_overtake',       v_to_overtake * v_block_price,
    'blocks_to_checkmate_field',   v_to_checkmate,
    'aria_cost_to_checkmate',      v_to_checkmate * v_block_price,
    'leader_blocks_to_self_checkmate', v_leader_self_cm,
    'blocks_remaining',            v_remaining,
    'current_sold_pct',            ROUND(v_sold_pct, 2),
    'scacco_matto_threshold_sold_pct', v_threshold,
    'scacco_matto_active',         (v_sold_pct >= v_threshold AND v_to_overtake > v_remaining)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION compute_checkmate_blocks(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION compute_checkmate_blocks(UUID, UUID) IS 'Atto 3 Live Evento UX: closed-form blocks_to_overtake_leader + blocks_to_checkmate_field. Derived from real scoring v5.';

-- ─────────────────────────────────────────────────────────────
-- get_airdrop_scoreboard_live · top-N + escluso/attivo classification
-- ─────────────────────────────────────────────────────────────
-- "escluso" (fairness-locked) = max possible score (user_blocks + remaining)
--   even buying all remaining blocks < leader_score. User cannot win.
-- "attivo" = otherwise.

CREATE OR REPLACE FUNCTION get_airdrop_scoreboard_live(
  p_airdrop_id UUID,
  p_top_n      INT DEFAULT 10
) RETURNS TABLE (
  user_id        UUID,
  username       TEXT,
  score          NUMERIC,
  blocks_count   INT,
  rank           INT,
  loyalty_mult   NUMERIC,
  pity_bonus     NUMERIC,
  pity_phase     TEXT,
  is_attivo      BOOLEAN,
  is_leader      BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_scoreboard JSONB;
  v_total_blocks INT;
  v_blocks_sold INT;
  v_remaining INT;
  v_leader_score NUMERIC;
BEGIN
  SELECT total_blocks, blocks_sold INTO v_total_blocks, v_blocks_sold
  FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'airdrop_not_found' USING ERRCODE='P0002'; END IF;
  v_remaining := GREATEST(v_total_blocks - v_blocks_sold, 0);

  v_scoreboard := calculate_winner_score(p_airdrop_id);
  SELECT COALESCE(MAX((s->>'score')::NUMERIC), 0) INTO v_leader_score
  FROM jsonb_array_elements(v_scoreboard) s;

  RETURN QUERY
  SELECT
    (s->>'user_id')::UUID                          AS user_id,
    COALESCE(p.username, 'user_' || SUBSTRING((s->>'user_id')::TEXT FROM 1 FOR 8)) AS username,
    (s->>'score')::NUMERIC                         AS score,
    (s->>'blocks')::INT                            AS blocks_count,
    (s->>'rank')::INT                              AS rank,
    (s->>'loyalty_mult')::NUMERIC                  AS loyalty_mult,
    (s->>'pity_bonus')::NUMERIC                    AS pity_bonus,
    (s->>'pity_phase')                             AS pity_phase,
    -- attivo: max possible (current + remaining) >= leader_score
    (SQRT((s->>'blocks')::NUMERIC + v_remaining) * (s->>'loyalty_mult')::NUMERIC + (s->>'pity_bonus')::NUMERIC) >= v_leader_score AS is_attivo,
    ((s->>'rank')::INT = 1)                        AS is_leader
  FROM jsonb_array_elements(v_scoreboard) s
  LEFT JOIN profiles p ON p.id = (s->>'user_id')::UUID
  ORDER BY (s->>'rank')::INT
  LIMIT p_top_n;
END;
$$;

GRANT EXECUTE ON FUNCTION get_airdrop_scoreboard_live(UUID, INT) TO authenticated, anon;

COMMENT ON FUNCTION get_airdrop_scoreboard_live(UUID, INT) IS 'Atto 3 scoreboard live top-N + escluso/attivo math.';

-- ─────────────────────────────────────────────────────────────
-- get_airdrop_active_excluded_counts · counter quick (esclusi vs attivi)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_airdrop_active_excluded_counts(p_airdrop_id UUID)
RETURNS TABLE (attivi INT, esclusi INT, total INT)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_scoreboard JSONB; v_total_blocks INT; v_blocks_sold INT;
  v_remaining INT; v_leader_score NUMERIC;
BEGIN
  SELECT total_blocks, blocks_sold INTO v_total_blocks, v_blocks_sold
  FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN RETURN; END IF;
  v_remaining := GREATEST(v_total_blocks - v_blocks_sold, 0);

  v_scoreboard := calculate_winner_score(p_airdrop_id);
  SELECT COALESCE(MAX((s->>'score')::NUMERIC), 0) INTO v_leader_score
  FROM jsonb_array_elements(v_scoreboard) s;

  RETURN QUERY
  SELECT
    COUNT(*) FILTER (
      WHERE (SQRT((s->>'blocks')::NUMERIC + v_remaining) * (s->>'loyalty_mult')::NUMERIC + (s->>'pity_bonus')::NUMERIC) >= v_leader_score
    )::INT AS attivi,
    COUNT(*) FILTER (
      WHERE (SQRT((s->>'blocks')::NUMERIC + v_remaining) * (s->>'loyalty_mult')::NUMERIC + (s->>'pity_bonus')::NUMERIC) <  v_leader_score
    )::INT AS esclusi,
    COUNT(*)::INT AS total
  FROM jsonb_array_elements(v_scoreboard) s;
END;
$$;

GRANT EXECUTE ON FUNCTION get_airdrop_active_excluded_counts(UUID) TO authenticated, anon;

COMMENT ON FUNCTION get_airdrop_active_excluded_counts(UUID) IS 'Atto 3 UI counter quick attivi vs esclusi (Italian naming LOCKED v0.4-3).';
