-- ════════════════════════════════════════════════════════════════════
-- Hole #3 · Scoring v5.1 — pity continuous on S_u (ARIA), no L_u count
-- TECH-HARDEN-001 · Sprint W1 · Day 4 · 30 Apr 2026
--
-- CHANGE vs v5 (24 Apr):
--   v5:    pity_bonus = f(L_u, N_pity_count)
--          - L_u = count of completed airdrops in category lost post-last-win
--          - N_pity_count = clamp(floor(α × V̄_cat_aria / c_u_avg), 5, 30) — discrete
--   v5.1:  pity_bonus = f(S_u, N_pity_aria)
--          - S_u = ARIA cumulative spent in category post-last-win (continuous)
--          - N_pity_aria = α × V̄_cat_aria — continuous threshold in ARIA
--
-- WHY:
--   v5 mono-fattoriale era count-based (discrete metric) → granularity grossa
--   per utenti con storici asimmetrici. v5.1 usa lo stesso engagement signal
--   già calcolato per f_base (storici_cat post-last-win) come pity metric.
--   Più granulare, più fair, semanticamente coerente con il resto della formula.
--
-- APPROACH (atomic cutover):
--   1. CREATE calculate_winner_score_v51 (separato)
--   2. CREATE compare_score_v5_vs_v5_1 RPC
--   3. DO block: run compare su tutti gli airdrop completed disponibili
--      → se zero airdrop reali: skip parity check (Alpha 0 condition)
--      → se >=1 airdrop con winner: require winner_match=true su tutti
--   4. CREATE OR REPLACE calculate_winner_score con v5.1 body
--   5. DROP calculate_winner_score_v51
--   6. UPDATE airdrop_config scoring_version='v5.1' + audit log event
--
-- Ref: ROBY_Reply_QuickWins_Brand_Hole3 §B + Engine v2.8 §5.2.1
--    + compare RPC skeleton in supabase/migrations/_drafts/compare_score_v5_vs_v51.sql.draft
-- ════════════════════════════════════════════════════════════════════

-- ── 1. CREATE FUNCTION calculate_winner_score_v51 (separato) ─────────
CREATE OR REPLACE FUNCTION public.calculate_winner_score_v51(p_airdrop_id UUID)
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
  v_soft_frac   NUMERIC;
  v_hard_mult   NUMERIC;
  v_vcat_aria   NUMERIC;
  v_n_pity_aria NUMERIC;  -- v5.1: continuous threshold in ARIA
BEGIN
  SELECT category INTO v_category FROM airdrops WHERE id = p_airdrop_id;

  SELECT COUNT(DISTINCT user_id) INTO v_n
  FROM airdrop_participations
  WHERE airdrop_id = p_airdrop_id AND cancelled_at IS NULL;

  IF v_n = 0 THEN RETURN '[]'::JSONB; END IF;

  SELECT * INTO v_cfg FROM _get_pity_config();
  v_k         := v_cfg.k_starter;
  v_alpha     := v_cfg.alpha;
  v_soft_frac := v_cfg.soft_frac;
  v_hard_mult := v_cfg.hard_mult;

  -- V̄_cat in ARIA (valore medio oggetto × 10, all-time)
  SELECT COALESCE(AVG(a.object_value_eur * 10), 5000)::NUMERIC
  INTO v_vcat_aria
  FROM airdrops a
  WHERE a.category = v_category
    AND a.status IN ('completed', 'closed', 'presale', 'sale', 'accettato', 'pending_seller_decision');

  -- v5.1: N_pity in ARIA continuous (no clamp, no per-user c_u division)
  v_n_pity_aria := v_alpha * v_vcat_aria;

  WITH
  user_current AS (
    SELECT
      user_id,
      SUM(blocks_count)::INTEGER AS total_blocks,
      SUM(aria_spent)::NUMERIC   AS current_aria
    FROM airdrop_participations
    WHERE airdrop_id = p_airdrop_id AND cancelled_at IS NULL
    GROUP BY user_id
  ),
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
  cat_history AS (
    SELECT
      ap.user_id,
      COALESCE(SUM(ap.aria_spent), 0)::NUMERIC AS s_u  -- v5.1: S_u in ARIA
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
  -- f_base invariato vs v5: usa S_u (storici_cat) già post-last-win
  f_base_calc AS (
    SELECT
      uc.user_id,
      uc.total_blocks,
      uc.current_aria,
      COALESCE(ch.s_u, 0)::NUMERIC AS s_u,
      COALESCE(la.total_aria, 0)::NUMERIC AS lifetime_aria,
      (SQRT(GREATEST(uc.total_blocks, 0)::NUMERIC)
        * (1.0 + LOG(10.0, 1.0 + COALESCE(ch.s_u, 0) / v_k))
      )::NUMERIC AS f_base
    FROM user_current uc
    LEFT JOIN cat_history ch ON ch.user_id = uc.user_id
    LEFT JOIN lifetime_aria la ON la.user_id = uc.user_id
  ),
  m_constant AS (
    SELECT GREATEST(MAX(f_base), 0.01)::NUMERIC AS m FROM f_base_calc
  ),
  -- v5.1: pity_bonus calcolato su S_u/N_pity_aria invece di L_u/N_pity_count
  final_scores AS (
    SELECT
      fbc.user_id,
      fbc.total_blocks,
      fbc.current_aria,
      fbc.s_u,
      fbc.lifetime_aria,
      fbc.f_base,
      m.m AS m_const,
      v_n_pity_aria AS n_pity_aria,
      CASE
        WHEN fbc.s_u < v_soft_frac * v_n_pity_aria THEN 0::NUMERIC
        WHEN fbc.s_u < v_n_pity_aria THEN
          m.m * (fbc.s_u - v_soft_frac * v_n_pity_aria)
                / ((1 - v_soft_frac) * v_n_pity_aria)
        ELSE
          m.m * (v_hard_mult + (fbc.s_u - v_n_pity_aria) / v_n_pity_aria)
      END::NUMERIC AS pity_bonus,
      CASE
        WHEN fbc.s_u < v_soft_frac * v_n_pity_aria THEN 'normal'
        WHEN fbc.s_u < v_n_pity_aria THEN 'soft'
        ELSE 'hard'
      END AS pity_phase,
      (fbc.current_aria + fbc.s_u)::NUMERIC AS cumulative_aria_cat
    FROM f_base_calc fbc
    CROSS JOIN m_constant m
  ),
  ranked AS (
    SELECT
      fs.*,
      (fs.f_base + fs.pity_bonus)::NUMERIC AS score,
      (1.0 + LOG(10.0, 1.0 + fs.s_u / v_k))::NUMERIC AS loyalty_mult,
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
      'user_id',             r.user_id,
      'score',               r.score,
      'f_base',              r.f_base,
      'pity_bonus',          r.pity_bonus,
      'pity_phase',          r.pity_phase,
      -- v5.1 fields:
      's_u',                 r.s_u,
      'n_pity_aria',         r.n_pity_aria,
      -- backward-compat (deprecated in v5.1, kept for FE not yet migrated):
      'losses_count',        0,                -- v5 metric, no longer computed
      'pity_threshold',      r.n_pity_aria,    -- alias for backward compat
      'historic_aria',       r.s_u,            -- alias for backward compat
      'loyalty_mult',        r.loyalty_mult,
      'cumulative_aria_cat', r.cumulative_aria_cat,
      'current_aria',        r.current_aria,
      'lifetime_aria',       r.lifetime_aria,
      'f1',                  r.total_blocks,
      'f2',                  r.s_u,
      'blocks',              r.total_blocks,
      'aria_spent',          r.current_aria,
      'rank',                r.rank
    )
    ORDER BY r.rank
  ) INTO v_result
  FROM ranked r;

  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$;

GRANT EXECUTE ON FUNCTION public.calculate_winner_score_v51(UUID) TO authenticated, anon, service_role;

-- ── 2. CREATE compare_score_v5_vs_v5_1 RPC (audit, read-only) ────────
CREATE OR REPLACE FUNCTION public.compare_score_v5_vs_v5_1(p_airdrop_id UUID)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_v5_scores    JSONB;
  v_v51_scores   JSONB;
  v_v5_winner    UUID;
  v_v51_winner   UUID;
  v_winner_match BOOLEAN;
  v_compare      JSONB;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM airdrops WHERE id = p_airdrop_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'airdrop_not_found');
  END IF;

  v_v5_scores  := public.calculate_winner_score(p_airdrop_id);
  v_v51_scores := public.calculate_winner_score_v51(p_airdrop_id);

  SELECT (elem->>'user_id')::UUID INTO v_v5_winner
    FROM jsonb_array_elements(v_v5_scores) elem
   WHERE (elem->>'rank')::INTEGER = 1 LIMIT 1;
  SELECT (elem->>'user_id')::UUID INTO v_v51_winner
    FROM jsonb_array_elements(v_v51_scores) elem
   WHERE (elem->>'rank')::INTEGER = 1 LIMIT 1;

  v_winner_match := (v_v5_winner IS NOT DISTINCT FROM v_v51_winner);

  WITH v5_flat AS (
    SELECT
      (elem->>'user_id')::UUID AS user_id,
      (elem->>'score')::NUMERIC AS score_v5,
      (elem->>'rank')::INT      AS rank_v5,
      (elem->>'historic_aria')::NUMERIC AS historic_aria_v5,
      (elem->>'pity_bonus')::NUMERIC AS pity_v5,
      (elem->>'pity_phase')::TEXT AS phase_v5
    FROM jsonb_array_elements(v_v5_scores) elem
  ),
  v51_flat AS (
    SELECT
      (elem->>'user_id')::UUID AS user_id,
      (elem->>'score')::NUMERIC AS score_v51,
      (elem->>'rank')::INT      AS rank_v51,
      (elem->>'s_u')::NUMERIC AS s_u_v51,
      (elem->>'pity_bonus')::NUMERIC AS pity_v51,
      (elem->>'pity_phase')::TEXT AS phase_v51
    FROM jsonb_array_elements(v_v51_scores) elem
  ),
  joined AS (
    SELECT
      COALESCE(v5.user_id, v51.user_id) AS user_id,
      v5.score_v5, v51.score_v51,
      v5.rank_v5, v51.rank_v51,
      v5.pity_v5, v51.pity_v51,
      v5.phase_v5, v51.phase_v51,
      v5.historic_aria_v5, v51.s_u_v51,
      CASE
        WHEN v5.score_v5 IS NULL OR v5.score_v5 = 0 THEN NULL
        ELSE ROUND(((v51.score_v51 - v5.score_v5) / v5.score_v5 * 100)::NUMERIC, 2)
      END AS score_delta_pct,
      (COALESCE(v51.rank_v51, 0) - COALESCE(v5.rank_v5, 0)) AS rank_shift
    FROM v5_flat v5
    FULL OUTER JOIN v51_flat v51 ON v5.user_id = v51.user_id
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'user_id',          user_id,
      'score_v5',         score_v5,
      'score_v51',        score_v51,
      'score_delta_pct',  score_delta_pct,
      'rank_v5',          rank_v5,
      'rank_v51',         rank_v51,
      'rank_shift',       rank_shift,
      'pity_v5',          pity_v5,
      'pity_v51',         pity_v51,
      'phase_v5',         phase_v5,
      'phase_v51',        phase_v51,
      'historic_v5',      historic_aria_v5,
      's_u_v51',          s_u_v51
    )
    ORDER BY rank_v51 NULLS LAST, rank_v5 NULLS LAST
  ) INTO v_compare
  FROM joined;

  RETURN jsonb_build_object(
    'ok',           true,
    'airdrop_id',   p_airdrop_id,
    'winner_v5',    v_v5_winner,
    'winner_v51',   v_v51_winner,
    'winner_match', v_winner_match,
    'participants', jsonb_array_length(COALESCE(v_compare, '[]'::JSONB)),
    'compare',      COALESCE(v_compare, '[]'::JSONB)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.compare_score_v5_vs_v5_1(UUID) TO service_role;

-- ── 3. PARITY AUDIT — verifica winner_match su tutti gli airdrop completati ─
DO $$
DECLARE
  v_airdrop RECORD;
  v_compare JSONB;
  v_total_checked INT := 0;
  v_winner_mismatches INT := 0;
  v_mismatch_ids UUID[] := '{}';
BEGIN
  FOR v_airdrop IN
    SELECT id FROM airdrops
     WHERE status = 'completed' AND winner_id IS NOT NULL
     ORDER BY created_at DESC
     LIMIT 50
  LOOP
    v_compare := public.compare_score_v5_vs_v5_1(v_airdrop.id);
    v_total_checked := v_total_checked + 1;
    IF NOT (v_compare->>'winner_match')::BOOLEAN THEN
      v_winner_mismatches := v_winner_mismatches + 1;
      v_mismatch_ids := array_append(v_mismatch_ids, v_airdrop.id);
    END IF;
  END LOOP;

  RAISE NOTICE '[Hole #3 parity] checked=% mismatches=%', v_total_checked, v_winner_mismatches;

  IF v_total_checked = 0 THEN
    RAISE NOTICE '[Hole #3 parity] no completed airdrops with winner — Alpha 0 condition, cutover safe';
  ELSIF v_winner_mismatches > 0 THEN
    RAISE EXCEPTION '[Hole #3 parity] STOP cutover: % winner mismatches on % airdrop checked. ids=%',
      v_winner_mismatches, v_total_checked, v_mismatch_ids;
  ELSE
    RAISE NOTICE '[Hole #3 parity] OK · all % winners match between v5 and v5.1', v_total_checked;
  END IF;
END $$;

-- ── 4. CUTOVER atomic — CREATE OR REPLACE calculate_winner_score con v5.1 body ─
CREATE OR REPLACE FUNCTION public.calculate_winner_score(p_airdrop_id UUID)
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
  v_soft_frac   NUMERIC;
  v_hard_mult   NUMERIC;
  v_vcat_aria   NUMERIC;
  v_n_pity_aria NUMERIC;
BEGIN
  SELECT category INTO v_category FROM airdrops WHERE id = p_airdrop_id;

  SELECT COUNT(DISTINCT user_id) INTO v_n
  FROM airdrop_participations
  WHERE airdrop_id = p_airdrop_id AND cancelled_at IS NULL;

  IF v_n = 0 THEN RETURN '[]'::JSONB; END IF;

  SELECT * INTO v_cfg FROM _get_pity_config();
  v_k         := v_cfg.k_starter;
  v_alpha     := v_cfg.alpha;
  v_soft_frac := v_cfg.soft_frac;
  v_hard_mult := v_cfg.hard_mult;

  SELECT COALESCE(AVG(a.object_value_eur * 10), 5000)::NUMERIC
  INTO v_vcat_aria
  FROM airdrops a
  WHERE a.category = v_category
    AND a.status IN ('completed', 'closed', 'presale', 'sale', 'accettato', 'pending_seller_decision');

  v_n_pity_aria := v_alpha * v_vcat_aria;

  WITH
  user_current AS (
    SELECT user_id,
           SUM(blocks_count)::INTEGER AS total_blocks,
           SUM(aria_spent)::NUMERIC   AS current_aria
    FROM airdrop_participations
    WHERE airdrop_id = p_airdrop_id AND cancelled_at IS NULL
    GROUP BY user_id
  ),
  last_win AS (
    SELECT a.winner_id AS user_id, MAX(a.draw_executed_at) AS last_win_at
    FROM airdrops a
    WHERE a.category = v_category AND a.winner_id IS NOT NULL
      AND a.winner_id IN (SELECT user_id FROM user_current)
    GROUP BY a.winner_id
  ),
  cat_history AS (
    SELECT ap.user_id, COALESCE(SUM(ap.aria_spent), 0)::NUMERIC AS s_u
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
  lifetime_aria AS (
    SELECT ap.user_id, COALESCE(SUM(ap.aria_spent), 0)::NUMERIC AS total_aria
    FROM airdrop_participations ap
    JOIN airdrops a ON a.id = ap.airdrop_id
    WHERE ap.cancelled_at IS NULL AND a.status <> 'annullato'
      AND ap.user_id IN (SELECT user_id FROM user_current)
    GROUP BY ap.user_id
  ),
  f_base_calc AS (
    SELECT uc.user_id, uc.total_blocks, uc.current_aria,
           COALESCE(ch.s_u, 0)::NUMERIC AS s_u,
           COALESCE(la.total_aria, 0)::NUMERIC AS lifetime_aria,
           (SQRT(GREATEST(uc.total_blocks, 0)::NUMERIC)
             * (1.0 + LOG(10.0, 1.0 + COALESCE(ch.s_u, 0) / v_k))
           )::NUMERIC AS f_base
    FROM user_current uc
    LEFT JOIN cat_history ch ON ch.user_id = uc.user_id
    LEFT JOIN lifetime_aria la ON la.user_id = uc.user_id
  ),
  m_constant AS (SELECT GREATEST(MAX(f_base), 0.01)::NUMERIC AS m FROM f_base_calc),
  final_scores AS (
    SELECT fbc.user_id, fbc.total_blocks, fbc.current_aria, fbc.s_u, fbc.lifetime_aria,
           fbc.f_base, m.m AS m_const, v_n_pity_aria AS n_pity_aria,
           CASE
             WHEN fbc.s_u < v_soft_frac * v_n_pity_aria THEN 0::NUMERIC
             WHEN fbc.s_u < v_n_pity_aria THEN
               m.m * (fbc.s_u - v_soft_frac * v_n_pity_aria)
                     / ((1 - v_soft_frac) * v_n_pity_aria)
             ELSE
               m.m * (v_hard_mult + (fbc.s_u - v_n_pity_aria) / v_n_pity_aria)
           END::NUMERIC AS pity_bonus,
           CASE
             WHEN fbc.s_u < v_soft_frac * v_n_pity_aria THEN 'normal'
             WHEN fbc.s_u < v_n_pity_aria THEN 'soft'
             ELSE 'hard'
           END AS pity_phase,
           (fbc.current_aria + fbc.s_u)::NUMERIC AS cumulative_aria_cat
    FROM f_base_calc fbc CROSS JOIN m_constant m
  ),
  ranked AS (
    SELECT fs.*, (fs.f_base + fs.pity_bonus)::NUMERIC AS score,
           (1.0 + LOG(10.0, 1.0 + fs.s_u / v_k))::NUMERIC AS loyalty_mult,
           ROW_NUMBER() OVER (
             ORDER BY (fs.f_base + fs.pity_bonus) DESC,
                      fs.total_blocks DESC, fs.lifetime_aria DESC,
                      (SELECT MIN(ab.purchased_at) FROM airdrop_blocks ab
                       WHERE ab.airdrop_id = p_airdrop_id AND ab.owner_id = fs.user_id) ASC,
                      (SELECT p.created_at FROM profiles p WHERE p.id = fs.user_id) ASC
           ) AS rank
    FROM final_scores fs
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'user_id', r.user_id, 'score', r.score, 'f_base', r.f_base,
      'pity_bonus', r.pity_bonus, 'pity_phase', r.pity_phase,
      's_u', r.s_u, 'n_pity_aria', r.n_pity_aria,
      'losses_count', 0, 'pity_threshold', r.n_pity_aria,
      'historic_aria', r.s_u, 'loyalty_mult', r.loyalty_mult,
      'cumulative_aria_cat', r.cumulative_aria_cat,
      'current_aria', r.current_aria, 'lifetime_aria', r.lifetime_aria,
      'f1', r.total_blocks, 'f2', r.s_u,
      'blocks', r.total_blocks, 'aria_spent', r.current_aria,
      'rank', r.rank
    )
    ORDER BY r.rank
  ) INTO v_result
  FROM ranked r;

  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$;

GRANT EXECUTE ON FUNCTION public.calculate_winner_score(UUID) TO authenticated, anon;

-- ── 5. DROP funzione _v51 (cutover atomic completato) ───────────────
DROP FUNCTION IF EXISTS public.calculate_winner_score_v51(UUID);

-- ── 6. UPDATE config + audit log event ───────────────────────────────
INSERT INTO public.airdrop_config (key, value, description) VALUES
  ('scoring_version', 'v5.1', 'Versione attiva del calculate_winner_score: v5.1 = pity continuous on S_u (ARIA)')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;

INSERT INTO public.events (event, props) VALUES
  ('scoring_version_cutover', jsonb_build_object(
    'from', 'v5',
    'to',   'v5.1',
    'cutover_at', NOW(),
    'method', 'atomic_create_or_replace_with_parity_audit',
    'parity_check', 'compare_score_v5_vs_v5_1 RPC (kept for future audits)'
  ));

-- ── 7. Smoke test inline (W1 convention) ─────────────────────────────
DO $$
DECLARE
  v_active_version TEXT;
  v_compare_exists BOOLEAN;
BEGIN
  SELECT value INTO v_active_version FROM airdrop_config WHERE key='scoring_version';
  IF v_active_version <> 'v5.1' THEN
    RAISE EXCEPTION '[Hole #3 smoke] FAIL: scoring_version=% expected v5.1', v_active_version;
  END IF;

  SELECT EXISTS (SELECT 1 FROM pg_proc
    WHERE proname='compare_score_v5_vs_v5_1' AND pronamespace='public'::regnamespace)
   INTO v_compare_exists;
  IF NOT v_compare_exists THEN
    RAISE EXCEPTION '[Hole #3 smoke] FAIL: compare_score_v5_vs_v5_1 RPC missing post-cutover';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc
    WHERE proname='calculate_winner_score_v51' AND pronamespace='public'::regnamespace) THEN
    RAISE EXCEPTION '[Hole #3 smoke] FAIL: calculate_winner_score_v51 should be DROPPED post-cutover';
  END IF;

  RAISE NOTICE '[Hole #3 smoke] OK · scoring_version=v5.1, compare RPC kept, _v51 dropped';
END $$;
