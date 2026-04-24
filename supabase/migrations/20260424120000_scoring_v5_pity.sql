-- ═══════════════════════════════════════════════════════════════
-- SCORING v5 — Deterministic + Pity System (engagement concavo)
-- 24 Aprile 2026 · Skeezu confirm Option B
-- ═══════════════════════════════════════════════════════════════
-- Motivazione (Skeezu): il v4 mono-fattoriale non garantiva che un
-- utente in competizione con un whale veterano non spendesse >€500
-- per un oggetto da €500. La v5 garantisce matematicamente un
-- bounded cost ≤ 30% del valore oggetto tramite un pity system
-- deterministico (no lotteria, coerente con decisione v1.0).
--
-- Formula:
--   score(u, a) = f_base(u, a) + pity_bonus(L_u, N_pity_u)
--
--   f_base = √blocks_in_a × (1 + log₁₀(1 + storici_cat_u / K))
--
--   L_u       = # airdrop in cat. partecipati senza vittoria post-last-win
--   N_pity_u  = clamp(floor(α × V̄_cat_aria / c_u_avg), N_min, N_max)
--   M         = max(f_base) tra partecipanti correnti
--
--   if L_u < 0.6·N_pity:  pity_bonus = 0
--   elif L_u < N_pity:    pity_bonus = M × (L_u - 0.6·N_pity) / (0.4·N_pity)
--   else:                 pity_bonus = M × (10 + (L_u - N_pity))
--
-- Tiebreaker invariato da v4.1:
--   (1) score DESC (include pity) (2) più blocchi corrente
--   (3) più ARIA lifetime cross-cat (4) primo blocco prima (5) seniority
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 1. Config keys v5 (idempotent)
-- ─────────────────────────────────────────────────────────────
INSERT INTO airdrop_config (key, value, description) VALUES
  ('score_k_starter',        '100',   'K starter: costante di normalizzazione log₁₀ per il moltiplicatore fedeltà'),
  ('pity_alpha',             '0.30',  'Willingness-to-spend ratio: spesa_max_to_win ≤ α × V_cat'),
  ('pity_n_min',             '5',     'Clamp inferiore N_pity (threshold minimo)'),
  ('pity_n_max',             '30',    'Clamp superiore N_pity (threshold massimo)'),
  ('pity_soft_frac',         '0.6',   'Frazione di N_pity oltre la quale scatta soft pity'),
  ('pity_hard_mult',         '10',    'Moltiplicatore di M per hard pity baseline')
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 2. RPC helper: pity config reader
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION _get_pity_config()
RETURNS TABLE(
  k_starter  NUMERIC,
  alpha      NUMERIC,
  n_min      INTEGER,
  n_max      INTEGER,
  soft_frac  NUMERIC,
  hard_mult  NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE((SELECT value::NUMERIC FROM airdrop_config WHERE key='score_k_starter'), 100)::NUMERIC AS k_starter,
    COALESCE((SELECT value::NUMERIC FROM airdrop_config WHERE key='pity_alpha'),      0.30)::NUMERIC AS alpha,
    COALESCE((SELECT value::INTEGER FROM airdrop_config WHERE key='pity_n_min'),      5)::INTEGER  AS n_min,
    COALESCE((SELECT value::INTEGER FROM airdrop_config WHERE key='pity_n_max'),      30)::INTEGER AS n_max,
    COALESCE((SELECT value::NUMERIC FROM airdrop_config WHERE key='pity_soft_frac'),  0.6)::NUMERIC AS soft_frac,
    COALESCE((SELECT value::NUMERIC FROM airdrop_config WHERE key='pity_hard_mult'),  10)::NUMERIC AS hard_mult;
$$;

-- ─────────────────────────────────────────────────────────────
-- 3. RPC principale: calculate_winner_score (v5)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION calculate_winner_score(p_airdrop_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_category    TEXT;
  v_result      JSONB;
  v_n           INTEGER;
  v_cfg         RECORD;
  v_k           NUMERIC;
  v_alpha       NUMERIC;
  v_n_min       INTEGER;
  v_n_max       INTEGER;
  v_soft_frac   NUMERIC;
  v_hard_mult   NUMERIC;
  v_vcat_aria   NUMERIC;
  v_cat_avg     NUMERIC;
BEGIN
  SELECT category INTO v_category
  FROM airdrops WHERE id = p_airdrop_id;

  SELECT COUNT(DISTINCT user_id) INTO v_n
  FROM airdrop_participations
  WHERE airdrop_id = p_airdrop_id AND cancelled_at IS NULL;

  IF v_n = 0 THEN
    RETURN '[]'::JSONB;
  END IF;

  SELECT * INTO v_cfg FROM _get_pity_config();
  v_k         := v_cfg.k_starter;
  v_alpha     := v_cfg.alpha;
  v_n_min     := v_cfg.n_min;
  v_n_max     := v_cfg.n_max;
  v_soft_frac := v_cfg.soft_frac;
  v_hard_mult := v_cfg.hard_mult;

  -- V̄_cat in ARIA (valore medio oggetto × 10, all-time)
  SELECT COALESCE(AVG(a.object_value_eur * 10), 5000)::NUMERIC
  INTO v_vcat_aria
  FROM airdrops a
  WHERE a.category = v_category
    AND a.status IN ('completed', 'closed', 'presale', 'sale', 'accettato', 'pending_seller_decision');

  -- c_cat_avg fallback (ARIA medi per airdrop nella categoria, escluso cancellati/annullati)
  SELECT COALESCE(AVG(ap.aria_spent), 50)::NUMERIC
  INTO v_cat_avg
  FROM airdrop_participations ap
  JOIN airdrops a ON a.id = ap.airdrop_id
  WHERE a.category = v_category
    AND ap.cancelled_at IS NULL
    AND a.status NOT IN ('annullato', 'draft', 'in_valutazione', 'rifiutato_min500', 'rifiutato_generico');

  WITH
  -- Partecipazione corrente per utente
  user_current AS (
    SELECT
      user_id,
      SUM(blocks_count)::INTEGER AS total_blocks,
      SUM(aria_spent)::NUMERIC   AS current_aria
    FROM airdrop_participations
    WHERE airdrop_id = p_airdrop_id
      AND cancelled_at IS NULL
    GROUP BY user_id
  ),
  -- Ultima vittoria in categoria per partecipante (One Category Rule)
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
  -- Storico ARIA in categoria (post-last-win, escluso corrente/cancellati/annullati)
  cat_history AS (
    SELECT
      ap.user_id,
      COALESCE(SUM(ap.aria_spent), 0)::NUMERIC AS historic_aria
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
  -- Lifetime ARIA cross-cat (tiebreaker v4.1)
  lifetime_aria AS (
    SELECT
      ap.user_id,
      COALESCE(SUM(ap.aria_spent), 0)::NUMERIC AS total_aria
    FROM airdrop_participations ap
    JOIN airdrops a ON a.id = ap.airdrop_id
    WHERE ap.cancelled_at IS NULL
      AND a.status <> 'annullato'
      AND ap.user_id IN (SELECT user_id FROM user_current)
    GROUP BY ap.user_id
  ),
  -- Losses count L_u: airdrop completati in categoria senza vittoria post-last-win
  losses_count AS (
    SELECT
      uc.user_id,
      COALESCE((
        SELECT COUNT(DISTINCT ap.airdrop_id)
        FROM airdrop_participations ap
        JOIN airdrops a ON a.id = ap.airdrop_id
        LEFT JOIN last_win lw ON lw.user_id = ap.user_id
        WHERE a.category = v_category
          AND ap.user_id = uc.user_id
          AND ap.airdrop_id <> p_airdrop_id
          AND ap.cancelled_at IS NULL
          AND a.status = 'completed'
          AND a.winner_id IS DISTINCT FROM uc.user_id
          AND (lw.last_win_at IS NULL OR ap.created_at > lw.last_win_at)
      ), 0)::INTEGER AS l_u
    FROM user_current uc
  ),
  -- c_u_avg: media ARIA per airdrop in categoria per ogni utente (fallback c_cat_avg)
  user_avg_spend AS (
    SELECT
      uc.user_id,
      COALESCE((
        SELECT AVG(ap.aria_spent)::NUMERIC
        FROM airdrop_participations ap
        JOIN airdrops a ON a.id = ap.airdrop_id
        WHERE a.category = v_category
          AND ap.user_id = uc.user_id
          AND ap.airdrop_id <> p_airdrop_id
          AND ap.cancelled_at IS NULL
          AND a.status NOT IN ('annullato', 'draft', 'in_valutazione', 'rifiutato_min500', 'rifiutato_generico')
      ), v_cat_avg)::NUMERIC AS c_u
    FROM user_current uc
  ),
  -- f_base: √blocks × (1 + log10(1 + storici/K))
  f_base_calc AS (
    SELECT
      uc.user_id,
      uc.total_blocks,
      uc.current_aria,
      COALESCE(ch.historic_aria, 0)::NUMERIC AS historic_aria,
      COALESCE(la.total_aria, 0)::NUMERIC    AS lifetime_aria,
      lc.l_u,
      uas.c_u,
      (SQRT(GREATEST(uc.total_blocks, 0)::NUMERIC)
        * (1.0 + LOG(10.0, 1.0 + COALESCE(ch.historic_aria, 0) / v_k))
      )::NUMERIC AS f_base
    FROM user_current uc
    LEFT JOIN cat_history ch ON ch.user_id = uc.user_id
    LEFT JOIN lifetime_aria la ON la.user_id = uc.user_id
    JOIN losses_count lc ON lc.user_id = uc.user_id
    JOIN user_avg_spend uas ON uas.user_id = uc.user_id
  ),
  -- M = max(f_base) dinamico
  m_constant AS (
    SELECT GREATEST(MAX(f_base), 0.01)::NUMERIC AS m FROM f_base_calc
  ),
  -- N_pity per utente
  pity_thresholds AS (
    SELECT
      fbc.user_id,
      GREATEST(
        v_n_min,
        LEAST(
          v_n_max,
          FLOOR(v_alpha * v_vcat_aria / GREATEST(fbc.c_u, 1))::INTEGER
        )
      )::INTEGER AS n_pity
    FROM f_base_calc fbc
  ),
  -- Pity bonus
  final_scores AS (
    SELECT
      fbc.user_id,
      fbc.total_blocks,
      fbc.current_aria,
      fbc.historic_aria,
      fbc.lifetime_aria,
      fbc.l_u,
      fbc.c_u,
      fbc.f_base,
      pt.n_pity,
      m.m AS m_const,
      CASE
        WHEN fbc.l_u::NUMERIC < v_soft_frac * pt.n_pity THEN 0::NUMERIC
        WHEN fbc.l_u < pt.n_pity THEN
          m.m * (fbc.l_u::NUMERIC - v_soft_frac * pt.n_pity)
                / ((1 - v_soft_frac) * pt.n_pity)
        ELSE
          m.m * (v_hard_mult + (fbc.l_u - pt.n_pity)::NUMERIC)
      END::NUMERIC AS pity_bonus,
      CASE
        WHEN fbc.l_u::NUMERIC < v_soft_frac * pt.n_pity THEN 'normal'
        WHEN fbc.l_u < pt.n_pity THEN 'soft'
        ELSE 'hard'
      END AS pity_phase,
      -- cumulative ARIA in categoria (storici + corrente) — per value_threshold
      (fbc.current_aria + fbc.historic_aria)::NUMERIC AS cumulative_aria_cat
    FROM f_base_calc fbc
    CROSS JOIN m_constant m
    JOIN pity_thresholds pt ON pt.user_id = fbc.user_id
  ),
  ranked AS (
    SELECT
      fs.*,
      (fs.f_base + fs.pity_bonus)::NUMERIC AS score,
      -- loyalty multiplier (per UI)
      (1.0 + LOG(10.0, 1.0 + fs.historic_aria / v_k))::NUMERIC AS loyalty_mult,
      ROW_NUMBER() OVER (
        ORDER BY
          (fs.f_base + fs.pity_bonus) DESC,
          fs.total_blocks DESC,
          fs.lifetime_aria DESC,
          (SELECT MIN(ab.purchased_at) FROM airdrop_blocks ab
           WHERE ab.airdrop_id = p_airdrop_id AND ab.owner_id = fs.user_id) ASC,
          (SELECT p.created_at FROM profiles p WHERE p.id = fs.user_id) ASC
      ) AS rank
    FROM final_scores fs
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'user_id', r.user_id,
      'score',               r.score,
      'f_base',              r.f_base,
      'pity_bonus',          r.pity_bonus,
      'pity_phase',          r.pity_phase,
      'losses_count',        r.l_u,
      'pity_threshold',      r.n_pity,
      'loyalty_mult',        r.loyalty_mult,
      'cumulative_aria_cat', r.cumulative_aria_cat,
      'historic_aria',       r.historic_aria,
      'current_aria',        r.current_aria,
      'lifetime_aria',       r.lifetime_aria,
      -- Compat v3/v4: campi legacy (deprecati, non usare per nuova logica)
      'f1',          r.total_blocks,
      'f2',          r.historic_aria,
      'blocks',      r.total_blocks,
      'aria_spent',  r.current_aria,
      'rank',        r.rank
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
-- 4. RPC: my_category_score_snapshot (v5 — esposti campi pity)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION my_category_score_snapshot(p_airdrop_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id           UUID := auth.uid();
  v_category          TEXT;
  v_block_price       INTEGER;
  v_remaining         INTEGER;
  v_total_blocks      INTEGER;
  v_blocks_sold       INTEGER;
  v_object_value_eur  NUMERIC;

  -- snapshot values from calculate_winner_score
  v_my_score          NUMERIC := 0;
  v_my_f_base         NUMERIC := 0;
  v_my_pity_bonus     NUMERIC := 0;
  v_my_pity_phase     TEXT;
  v_my_losses         INTEGER := 0;
  v_my_pity_threshold INTEGER := 0;
  v_my_loyalty_mult   NUMERIC := 1;
  v_my_cumulative     NUMERIC := 0;
  v_my_blocks         INTEGER := 0;
  v_my_historic       NUMERIC := 0;
  v_my_current        NUMERIC := 0;

  v_leader_score      NUMERIC := 0;
  v_leader_user       UUID;
  v_leader_cumulative NUMERIC := 0;

  v_total_participants INTEGER;
  v_k                 NUMERIC;
  v_max_reachable     NUMERIC;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT category, block_price_aria, total_blocks, blocks_sold, object_value_eur
  INTO v_category, v_block_price, v_total_blocks, v_blocks_sold, v_object_value_eur
  FROM airdrops WHERE id = p_airdrop_id;

  IF v_category IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'airdrop_not_found');
  END IF;

  v_remaining := GREATEST(0, v_total_blocks - v_blocks_sold);
  SELECT k_starter INTO v_k FROM _get_pity_config();

  -- Snapshot mio
  WITH scores_json AS (SELECT calculate_winner_score(p_airdrop_id) AS arr)
  SELECT
    (elem->>'score')::NUMERIC,
    (elem->>'f_base')::NUMERIC,
    (elem->>'pity_bonus')::NUMERIC,
    (elem->>'pity_phase')::TEXT,
    (elem->>'losses_count')::INTEGER,
    (elem->>'pity_threshold')::INTEGER,
    (elem->>'loyalty_mult')::NUMERIC,
    (elem->>'cumulative_aria_cat')::NUMERIC,
    (elem->>'current_aria')::NUMERIC,
    (elem->>'historic_aria')::NUMERIC,
    (elem->>'blocks')::INTEGER
  INTO
    v_my_score, v_my_f_base, v_my_pity_bonus, v_my_pity_phase,
    v_my_losses, v_my_pity_threshold, v_my_loyalty_mult, v_my_cumulative,
    v_my_current, v_my_historic, v_my_blocks
  FROM scores_json, jsonb_array_elements(arr) elem
  WHERE (elem->>'user_id')::UUID = v_user_id
  LIMIT 1;

  -- Leader
  WITH scores_json AS (SELECT calculate_winner_score(p_airdrop_id) AS arr)
  SELECT
    (elem->>'score')::NUMERIC,
    (elem->>'user_id')::UUID,
    (elem->>'cumulative_aria_cat')::NUMERIC
  INTO v_leader_score, v_leader_user, v_leader_cumulative
  FROM scores_json, jsonb_array_elements(arr) elem
  WHERE (elem->>'rank')::INTEGER = 1
  LIMIT 1;

  SELECT COUNT(DISTINCT user_id) INTO v_total_participants
  FROM airdrop_participations
  WHERE airdrop_id = p_airdrop_id AND cancelled_at IS NULL;

  -- Max reachable v5: f_base_max_potential + my_current_pity_bonus
  -- f_base_max_potential = √(my_blocks + remaining) × loyalty_mult
  v_max_reachable := (
    SQRT(GREATEST(COALESCE(v_my_blocks, 0) + v_remaining, 0)::NUMERIC) * COALESCE(v_my_loyalty_mult, 1)
  ) + COALESCE(v_my_pity_bonus, 0);

  RETURN jsonb_build_object(
    'ok', true,
    -- Nuovi campi v5
    'my_score',              COALESCE(v_my_score, 0),
    'my_f_base',             COALESCE(v_my_f_base, 0),
    'my_pity_bonus',         COALESCE(v_my_pity_bonus, 0),
    'my_pity_phase',         COALESCE(v_my_pity_phase, 'normal'),
    'my_losses_count',       COALESCE(v_my_losses, 0),
    'my_pity_threshold',     COALESCE(v_my_pity_threshold, 0),
    'my_loyalty_mult',       COALESCE(v_my_loyalty_mult, 1),
    'my_cumulative_aria_cat', COALESCE(v_my_cumulative, 0),
    'my_blocks',             COALESCE(v_my_blocks, 0),
    'my_historic',           COALESCE(v_my_historic, 0),
    'my_current',            COALESCE(v_my_current, 0),
    'leader_score',          COALESCE(v_leader_score, 0),
    'leader_cumulative_aria_cat', COALESCE(v_leader_cumulative, 0),
    'leader_is_me',          v_leader_user = v_user_id,
    'remaining_blocks',      v_remaining,
    'block_price',           v_block_price,
    'object_value_eur',      v_object_value_eur,
    'max_reachable_score',   v_max_reachable,
    'math_impossible',
      CASE
        WHEN v_leader_user = v_user_id THEN false
        WHEN v_leader_score IS NULL THEN false
        ELSE v_max_reachable < v_leader_score
      END,
    'total_participants',    v_total_participants,
    'category',              v_category
  );
END;
$$;

GRANT EXECUTE ON FUNCTION my_category_score_snapshot(UUID) TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- 5. check_value_threshold_reached (v5 — JSONB preservato per compat
--    con trigger tf_check_early_close_after_buy, usa cumulative_aria_cat)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_value_threshold_reached(p_airdrop_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_object_value_eur NUMERIC;
  v_status           TEXT;
  v_leader_cumul     NUMERIC := 0;
  v_threshold_aria   NUMERIC;
  v_scores           JSONB;
BEGIN
  SELECT object_value_eur, status INTO v_object_value_eur, v_status
  FROM airdrops WHERE id = p_airdrop_id;

  IF v_object_value_eur IS NULL OR v_object_value_eur <= 0 THEN
    RETURN jsonb_build_object('threshold_reached', false, 'reason', 'no_object_value');
  END IF;

  -- Threshold: object_value_eur × 10 (ARIA_EUR=0.10 → 1 EUR = 10 ARIA)
  v_threshold_aria := v_object_value_eur * 10;

  v_scores := calculate_winner_score(p_airdrop_id);

  -- v5: usa cumulative_aria_cat (storici + corrente) invece di score
  SELECT COALESCE((elem->>'cumulative_aria_cat')::NUMERIC, 0)
  INTO v_leader_cumul
  FROM jsonb_array_elements(v_scores) elem
  WHERE (elem->>'rank')::INTEGER = 1
  LIMIT 1;

  RETURN jsonb_build_object(
    'threshold_reached', COALESCE(v_leader_cumul, 0) >= v_threshold_aria,
    'leader_cumulative_aria_cat', COALESCE(v_leader_cumul, 0),
    'threshold_aria', v_threshold_aria,
    'object_value_eur', v_object_value_eur
  );
END;
$$;

GRANT EXECUTE ON FUNCTION check_value_threshold_reached(UUID) TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- 6. check_fairness_lockdown (v5 — JSONB preservato, max_reachable
--    score-based con pity_bonus non-comprabile)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_fairness_lockdown(p_airdrop_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status         TEXT;
  v_total_blocks   INTEGER;
  v_blocks_sold    INTEGER;
  v_remaining      INTEGER;
  v_scores         JSONB;
  v_leader_score   NUMERIC;
  v_participants   INTEGER;
  v_all_blocked    BOOLEAN;
BEGIN
  SELECT status, total_blocks, blocks_sold
  INTO v_status, v_total_blocks, v_blocks_sold
  FROM airdrops WHERE id = p_airdrop_id;

  IF v_total_blocks IS NULL THEN
    RETURN jsonb_build_object('lockdown', false, 'reason', 'airdrop_not_found');
  END IF;

  IF v_status NOT IN ('presale','sale') THEN
    RETURN jsonb_build_object('lockdown', false, 'reason', 'status_not_open', 'status', v_status);
  END IF;

  v_remaining := GREATEST(0, v_total_blocks - v_blocks_sold);

  v_scores := calculate_winner_score(p_airdrop_id);
  v_participants := jsonb_array_length(v_scores);

  -- Richiede ≥3 partecipanti per scattare lockdown
  IF v_participants < 3 THEN
    RETURN jsonb_build_object('lockdown', false, 'reason', 'below_min_participants', 'participants', v_participants);
  END IF;

  SELECT (elem->>'score')::NUMERIC INTO v_leader_score
  FROM jsonb_array_elements(v_scores) elem
  WHERE (elem->>'rank')::INTEGER = 1
  LIMIT 1;

  IF v_leader_score IS NULL THEN
    RETURN jsonb_build_object('lockdown', false, 'reason', 'no_leader');
  END IF;

  -- v5: max_reachable score-based (√(blocks+remaining) × loyalty_mult) + pity_bonus
  -- pity_bonus è fisso (non comprabile) — dipende da L_u, non dai blocchi futuri
  SELECT COALESCE(bool_and(
    (
      SQRT(GREATEST((elem->>'blocks')::INTEGER + v_remaining, 0)::NUMERIC)
        * (elem->>'loyalty_mult')::NUMERIC
    ) + (elem->>'pity_bonus')::NUMERIC < v_leader_score
  ), false)
  INTO v_all_blocked
  FROM jsonb_array_elements(v_scores) elem
  WHERE (elem->>'rank')::INTEGER > 1;

  RETURN jsonb_build_object(
    'lockdown', v_all_blocked,
    'leader_score', v_leader_score,
    'remaining_blocks', v_remaining,
    'participants', v_participants
  );
END;
$$;

GRANT EXECUTE ON FUNCTION check_fairness_lockdown(UUID) TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- NOTE
--   - `execute_draw` non richiede modifiche: continua a chiamare
--     `calculate_winner_score` e prende `rank = 1`. Il nuovo score
--     (v5) si applica automaticamente.
--   - `early_close_airdrop` e il trigger `tf_check_early_close_after_buy`
--     usano le due RPC `check_*` che sono state aggiornate sopra.
--   - I campi legacy `f1/f2/score` restano nel payload JSONB per
--     compatibilità con frontend vecchi, ma il `score` ora ha unità
--     diverse (√blocks × log). Frontend nuovi devono usare i nuovi
--     campi `f_base`, `pity_bonus`, `pity_phase`, `losses_count`,
--     `pity_threshold`, `loyalty_mult`, `cumulative_aria_cat`.
-- ═══════════════════════════════════════════════════════════════
