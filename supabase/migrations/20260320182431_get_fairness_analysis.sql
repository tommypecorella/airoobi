-- ============================================================
-- AIROOBI — get_fairness_analysis(p_airdrop_id UUID)
-- Admin-only RPC. Returns fairness metrics + composite score.
--
-- Composite Fairness Score (0-100):
--   0.25*S_gini + 0.15*S_conc1 + 0.10*S_conc5 + 0.05*S_conc10
--   + 0.20*S_gap12 + 0.15*S_factor_bal + 0.05*S_spread + 0.05*S_diversity
-- ============================================================

CREATE OR REPLACE FUNCTION get_fairness_analysis(p_airdrop_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_airdrop          RECORD;
  v_scores           JSONB;
  v_n                INTEGER;
  v_total_blocks     INTEGER;

  v_gini             NUMERIC;
  v_top1_blocks      NUMERIC;
  v_top5_blocks      NUMERIC;
  v_top10_blocks     NUMERIC;
  v_top1_share       NUMERIC;
  v_top5_share       NUMERIC;
  v_top10_share      NUMERIC;

  v_score_mean       NUMERIC;
  v_score_stddev     NUMERIC;
  v_score_min        NUMERIC;
  v_score_max        NUMERIC;
  v_score_gap12      NUMERIC;

  v_winner_score     NUMERIC;
  v_winner_f1        NUMERIC;
  v_winner_f2        NUMERIC;
  v_winner_f3        NUMERIC;
  v_f1_contrib       NUMERIC;
  v_f2_contrib       NUMERIC;
  v_f3_contrib       NUMERIC;
  v_dom_factor       TEXT;
  v_factor_imbalance NUMERIC;

  v_unique_buyers    INTEGER;

  v_s_gini           NUMERIC;
  v_s_conc1          NUMERIC;
  v_s_conc5          NUMERIC;
  v_s_conc10         NUMERIC;
  v_s_gap12          NUMERIC;
  v_s_factor_bal     NUMERIC;
  v_s_spread         NUMERIC;
  v_s_diversity      NUMERIC;
  v_composite        NUMERIC;
BEGIN
  -- Admin check
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN '{"ok":false,"error":"NOT_ADMIN"}'::JSONB;
  END IF;

  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN
    RETURN '{"ok":false,"error":"AIRDROP_NOT_FOUND"}'::JSONB;
  END IF;

  SELECT COUNT(DISTINCT user_id) INTO v_n
  FROM airdrop_participations WHERE airdrop_id = p_airdrop_id;

  IF v_n = 0 THEN
    RETURN jsonb_build_object(
      'ok', true, 'airdrop_id', p_airdrop_id,
      'warning', 'NO_PARTICIPANTS', 'fairness_score', NULL
    );
  END IF;

  -- Scores: reuse draw_scores if available, else recalculate
  IF v_airdrop.draw_executed_at IS NOT NULL AND v_airdrop.draw_scores IS NOT NULL
     AND jsonb_array_length(v_airdrop.draw_scores) > 0 THEN
    v_scores := v_airdrop.draw_scores;
  ELSE
    v_scores := calculate_winner_score(p_airdrop_id);
  END IF;

  IF v_scores IS NULL OR jsonb_array_length(v_scores) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'SCORE_CALC_FAILED');
  END IF;

  SELECT COALESCE(SUM(blocks_count), 0) INTO v_total_blocks
  FROM airdrop_participations WHERE airdrop_id = p_airdrop_id;
  v_unique_buyers := v_n;

  -- ── Gini coefficient ──
  WITH user_block_totals AS (
    SELECT user_id, SUM(blocks_count)::NUMERIC AS b
    FROM airdrop_participations WHERE airdrop_id = p_airdrop_id
    GROUP BY user_id
  ),
  ranked AS (
    SELECT b, ROW_NUMBER() OVER (ORDER BY b ASC) AS rk FROM user_block_totals
  )
  SELECT CASE WHEN SUM(b) > 0 AND COUNT(*) > 1 THEN
    (2.0 * SUM(rk * b)) / (COUNT(*) * SUM(b)) - (COUNT(*) + 1.0) / COUNT(*)
  ELSE 0 END INTO v_gini FROM ranked;
  v_gini := GREATEST(0, LEAST(1, COALESCE(v_gini, 0)));

  -- ── Concentration ──
  SELECT
    COALESCE(SUM(b) FILTER (WHERE rn <= 1), 0),
    COALESCE(SUM(b) FILTER (WHERE rn <= 5), 0),
    COALESCE(SUM(b) FILTER (WHERE rn <= 10), 0)
  INTO v_top1_blocks, v_top5_blocks, v_top10_blocks
  FROM (
    SELECT (elem->>'blocks')::NUMERIC AS b,
           ROW_NUMBER() OVER (ORDER BY (elem->>'blocks')::NUMERIC DESC) AS rn
    FROM jsonb_array_elements(v_scores) AS elem
  ) sub;

  v_top1_share  := v_top1_blocks / NULLIF(v_total_blocks, 0);
  v_top5_share  := v_top5_blocks / NULLIF(v_total_blocks, 0);
  v_top10_share := v_top10_blocks / NULLIF(v_total_blocks, 0);

  -- ── Score spread ──
  SELECT AVG(s), STDDEV_POP(s), MIN(s), MAX(s)
  INTO v_score_mean, v_score_stddev, v_score_min, v_score_max
  FROM (SELECT (elem->>'score')::NUMERIC AS s FROM jsonb_array_elements(v_scores) AS elem) sub;

  IF jsonb_array_length(v_scores) >= 2 THEN
    v_score_gap12 := (v_scores->0->>'score')::NUMERIC - (v_scores->1->>'score')::NUMERIC;
  ELSE
    v_score_gap12 := 0;
  END IF;

  -- ── Factor balance ──
  v_winner_score := COALESCE((v_scores->0->>'score')::NUMERIC, 0);
  v_winner_f1    := COALESCE((v_scores->0->>'f1')::NUMERIC, 0);
  v_winner_f2    := COALESCE((v_scores->0->>'f2')::NUMERIC, 0);
  v_winner_f3    := COALESCE((v_scores->0->>'f3')::NUMERIC, 0);

  IF v_winner_score > 0 THEN
    v_f1_contrib := ROUND((0.50 * v_winner_f1 / v_winner_score)::NUMERIC, 4);
    v_f2_contrib := ROUND((0.30 * v_winner_f2 / v_winner_score)::NUMERIC, 4);
    v_f3_contrib := ROUND((0.20 * v_winner_f3 / v_winner_score)::NUMERIC, 4);
  ELSE
    v_f1_contrib := 0; v_f2_contrib := 0; v_f3_contrib := 0;
  END IF;

  IF v_f1_contrib >= v_f2_contrib AND v_f1_contrib >= v_f3_contrib THEN
    v_dom_factor := 'F1_blocks';
  ELSIF v_f2_contrib >= v_f1_contrib AND v_f2_contrib >= v_f3_contrib THEN
    v_dom_factor := 'F2_loyalty';
  ELSE
    v_dom_factor := 'F3_seniority';
  END IF;

  v_factor_imbalance := GREATEST(v_f1_contrib, v_f2_contrib, v_f3_contrib) - (1.0/3.0);
  v_factor_imbalance := GREATEST(0, LEAST(1, v_factor_imbalance / (2.0/3.0)));

  -- ── Sub-scores (0-100, higher = fairer) ──
  v_s_gini       := ROUND(((1 - v_gini) * 100)::NUMERIC, 2);
  v_s_conc1      := ROUND(((1 - COALESCE(v_top1_share, 0)) * 100)::NUMERIC, 2);
  v_s_conc5      := ROUND(((1 - COALESCE(v_top5_share, 0)) * 100)::NUMERIC, 2);
  v_s_conc10     := ROUND(((1 - COALESCE(v_top10_share, 0)) * 100)::NUMERIC, 2);
  v_s_gap12      := ROUND(((1 - LEAST(v_score_gap12, 1.0)) * 100)::NUMERIC, 2);
  v_s_factor_bal := ROUND(((1 - v_factor_imbalance) * 100)::NUMERIC, 2);
  v_s_spread     := ROUND(LEAST(COALESCE(v_score_stddev, 0) * 300, 100)::NUMERIC, 2);
  v_s_diversity  := ROUND(LEAST((v_unique_buyers::NUMERIC / GREATEST(v_total_blocks * 0.30, 1)) * 100, 100)::NUMERIC, 2);

  -- ── Composite Fairness Score ──
  v_composite := ROUND((
      0.25 * v_s_gini
    + 0.15 * v_s_conc1
    + 0.10 * v_s_conc5
    + 0.05 * v_s_conc10
    + 0.20 * v_s_gap12
    + 0.15 * v_s_factor_bal
    + 0.05 * v_s_spread
    + 0.05 * v_s_diversity
  )::NUMERIC, 1);

  RETURN jsonb_build_object(
    'ok', true,
    'airdrop_id', p_airdrop_id,
    'title', v_airdrop.title,
    'category', v_airdrop.category,
    'status', v_airdrop.status,
    'participants', v_n,
    'total_blocks_sold', v_total_blocks,

    'gini', jsonb_build_object(
      'value', ROUND(v_gini::NUMERIC, 4),
      'sub_score', v_s_gini,
      'interpretation', CASE
        WHEN v_gini < 0.20 THEN 'Very equal'
        WHEN v_gini < 0.40 THEN 'Moderate inequality'
        WHEN v_gini < 0.60 THEN 'High inequality'
        ELSE 'Extreme whale dominance'
      END
    ),
    'concentration', jsonb_build_object(
      'top1_blocks', v_top1_blocks::INTEGER,
      'top5_blocks', v_top5_blocks::INTEGER,
      'top10_blocks', v_top10_blocks::INTEGER,
      'top1_share', ROUND(COALESCE(v_top1_share, 0)::NUMERIC, 4),
      'top5_share', ROUND(COALESCE(v_top5_share, 0)::NUMERIC, 4),
      'top10_share', ROUND(COALESCE(v_top10_share, 0)::NUMERIC, 4),
      'sub_score_top1', v_s_conc1,
      'sub_score_top5', v_s_conc5,
      'sub_score_top10', v_s_conc10
    ),
    'score_spread', jsonb_build_object(
      'mean', ROUND(COALESCE(v_score_mean, 0)::NUMERIC, 6),
      'std_dev', ROUND(COALESCE(v_score_stddev, 0)::NUMERIC, 6),
      'min', ROUND(COALESCE(v_score_min, 0)::NUMERIC, 6),
      'max', ROUND(COALESCE(v_score_max, 0)::NUMERIC, 6),
      'gap_1st_2nd', ROUND(v_score_gap12::NUMERIC, 6),
      'sub_score', v_s_gap12
    ),
    'factor_balance', jsonb_build_object(
      'winner_f1', ROUND(v_winner_f1::NUMERIC, 4),
      'winner_f2', ROUND(v_winner_f2::NUMERIC, 4),
      'winner_f3', ROUND(v_winner_f3::NUMERIC, 4),
      'f1_pct', ROUND((v_f1_contrib * 100)::NUMERIC, 1),
      'f2_pct', ROUND((v_f2_contrib * 100)::NUMERIC, 1),
      'f3_pct', ROUND((v_f3_contrib * 100)::NUMERIC, 1),
      'dominant', v_dom_factor,
      'imbalance', ROUND(v_factor_imbalance::NUMERIC, 4),
      'sub_score', v_s_factor_bal
    ),
    'diversity', jsonb_build_object(
      'unique_buyers', v_unique_buyers,
      'avg_blocks_per_buyer', ROUND((v_total_blocks::NUMERIC / NULLIF(v_unique_buyers, 0))::NUMERIC, 2),
      'ratio', ROUND((v_unique_buyers::NUMERIC / NULLIF(v_total_blocks, 0))::NUMERIC, 4),
      'sub_score', v_s_diversity
    ),
    'sub_scores', jsonb_build_object(
      'gini', v_s_gini, 'conc_top1', v_s_conc1, 'conc_top5', v_s_conc5,
      'conc_top10', v_s_conc10, 'gap_1_2', v_s_gap12, 'factor_bal', v_s_factor_bal,
      'spread', v_s_spread, 'diversity', v_s_diversity
    ),
    'fairness_score', jsonb_build_object(
      'value', v_composite,
      'grade', CASE
        WHEN v_composite >= 80 THEN 'A'
        WHEN v_composite >= 65 THEN 'B'
        WHEN v_composite >= 50 THEN 'C'
        WHEN v_composite >= 35 THEN 'D'
        ELSE 'F'
      END,
      'label', CASE
        WHEN v_composite >= 80 THEN 'Very Fair'
        WHEN v_composite >= 65 THEN 'Fair'
        WHEN v_composite >= 50 THEN 'Moderate'
        WHEN v_composite >= 35 THEN 'Unfair'
        ELSE 'Severely Unfair'
      END
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_fairness_analysis(UUID) TO authenticated;
