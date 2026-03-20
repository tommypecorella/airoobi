-- ============================================================
-- FIX: ROUND(double precision, integer) → ROUND(numeric, integer)
-- PostgreSQL non supporta ROUND con 2 args su double precision.
-- Ricreiamo calculate_winner_score con cast espliciti.
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_winner_score(p_airdrop_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_category     TEXT;
  v_w1           NUMERIC := 0.50;
  v_w2           NUMERIC := 0.30;
  v_w3           NUMERIC := 0.20;
  v_alpha_f3     NUMERIC := 0.40;
  v_beta_f3      NUMERIC := 0.60;
  v_n            INTEGER;
  v_result       JSONB;
BEGIN
  -- Leggi categoria dell'airdrop corrente
  SELECT category INTO v_category FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN
    RETURN '[]'::JSONB;
  END IF;

  -- Leggi pesi da airdrop_config (override se presenti)
  SELECT COALESCE(
    (SELECT value::NUMERIC FROM airdrop_config WHERE key = 'score_w1'), 0.50
  ) INTO v_w1;
  SELECT COALESCE(
    (SELECT value::NUMERIC FROM airdrop_config WHERE key = 'score_w2'), 0.30
  ) INTO v_w2;
  SELECT COALESCE(
    (SELECT value::NUMERIC FROM airdrop_config WHERE key = 'score_w3'), 0.20
  ) INTO v_w3;
  SELECT COALESCE(
    (SELECT value::NUMERIC FROM airdrop_config WHERE key = 'score_alpha_f3'), 0.40
  ) INTO v_alpha_f3;
  SELECT COALESCE(
    (SELECT value::NUMERIC FROM airdrop_config WHERE key = 'score_beta_f3'), 0.60
  ) INTO v_beta_f3;

  -- Conta partecipanti distinti
  SELECT COUNT(DISTINCT user_id) INTO v_n
  FROM airdrop_participations
  WHERE airdrop_id = p_airdrop_id;

  IF v_n = 0 THEN
    RETURN '[]'::JSONB;
  END IF;

  -- Calcola score per ogni partecipante
  WITH
  user_blocks AS (
    SELECT
      user_id,
      SUM(blocks_count) AS total_blocks,
      SUM(aria_spent)    AS total_aria
    FROM airdrop_participations
    WHERE airdrop_id = p_airdrop_id
    GROUP BY user_id
  ),
  max_blocks AS (
    SELECT MAX(total_blocks) AS val FROM user_blocks
  ),
  f1_calc AS (
    SELECT
      ub.user_id,
      ub.total_blocks,
      ub.total_aria,
      CASE WHEN mb.val > 0
        THEN ub.total_blocks::NUMERIC / mb.val
        ELSE 0::NUMERIC
      END AS f1
    FROM user_blocks ub, max_blocks mb
  ),
  cat_history AS (
    SELECT
      ap.user_id,
      COALESCE(SUM(ap.aria_spent), 0) AS cat_aria
    FROM airdrop_participations ap
    JOIN airdrops a ON a.id = ap.airdrop_id
    WHERE a.category = v_category
      AND ap.airdrop_id <> p_airdrop_id
      AND ap.user_id IN (SELECT user_id FROM user_blocks)
    GROUP BY ap.user_id
  ),
  max_cat AS (
    SELECT COALESCE(MAX(cat_aria), 0) AS val FROM cat_history
  ),
  f2_calc AS (
    SELECT
      f1c.user_id,
      CASE WHEN mc.val > 0
        THEN (LN(1 + COALESCE(ch.cat_aria, 0)) / LN(1 + mc.val))::NUMERIC
        ELSE 0::NUMERIC
      END AS f2
    FROM f1_calc f1c
    LEFT JOIN cat_history ch ON ch.user_id = f1c.user_id
    CROSS JOIN max_cat mc
  ),
  first_block AS (
    SELECT
      ab.owner_id AS user_id,
      MIN(ab.purchased_at) AS first_purchased_at
    FROM airdrop_blocks ab
    WHERE ab.airdrop_id = p_airdrop_id
    GROUP BY ab.owner_id
  ),
  seniority AS (
    SELECT
      f1c.user_id,
      ROW_NUMBER() OVER (ORDER BY p.created_at ASC) AS rank_reg,
      ROW_NUMBER() OVER (ORDER BY fb.first_purchased_at ASC NULLS LAST) AS rank_block
    FROM f1_calc f1c
    JOIN profiles p ON p.id = f1c.user_id
    LEFT JOIN first_block fb ON fb.user_id = f1c.user_id
  ),
  f3_calc AS (
    SELECT
      s.user_id,
      CASE WHEN v_n = 1 THEN 1.0::NUMERIC
        ELSE
          (v_alpha_f3 * (1.0 - (s.rank_reg - 1)::NUMERIC / (v_n - 1))
          + v_beta_f3 * (1.0 - (s.rank_block - 1)::NUMERIC / (v_n - 1)))::NUMERIC
      END AS f3
    FROM seniority s
  ),
  final_scores AS (
    SELECT
      f1c.user_id,
      f1c.total_blocks,
      f1c.total_aria,
      ROUND(f1c.f1::NUMERIC, 6) AS f1,
      ROUND(f2c.f2::NUMERIC, 6) AS f2,
      ROUND(f3c.f3::NUMERIC, 6) AS f3,
      ROUND((v_w1 * f1c.f1 + v_w2 * f2c.f2 + v_w3 * f3c.f3)::NUMERIC, 6) AS score
    FROM f1_calc f1c
    JOIN f2_calc f2c ON f2c.user_id = f1c.user_id
    JOIN f3_calc f3c ON f3c.user_id = f1c.user_id
  ),
  ranked AS (
    SELECT
      fs.*,
      ROW_NUMBER() OVER (
        ORDER BY
          fs.score DESC,
          (SELECT MIN(ab.purchased_at) FROM airdrop_blocks ab
           WHERE ab.airdrop_id = p_airdrop_id AND ab.owner_id = fs.user_id) ASC,
          (SELECT p.created_at FROM profiles p WHERE p.id = fs.user_id) ASC
      ) AS rank
    FROM final_scores fs
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'user_id', r.user_id,
      'score', r.score,
      'f1', r.f1,
      'f2', r.f2,
      'f3', r.f3,
      'blocks', r.total_blocks,
      'aria_spent', r.total_aria,
      'rank', r.rank
    ) ORDER BY r.rank ASC
  )
  INTO v_result
  FROM ranked r;

  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$;


-- ============================================================
-- FIX: get_draw_preview — add p_service_call bypass for testing
-- and cast ROUND arguments to NUMERIC for safety
-- ============================================================

-- Drop old signature (no p_service_call param)
DROP FUNCTION IF EXISTS get_draw_preview(UUID);

CREATE OR REPLACE FUNCTION get_draw_preview(p_airdrop_id UUID, p_service_call BOOLEAN DEFAULT false)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_airdrop       RECORD;
  v_aria_incassato INTEGER;
  v_success        BOOLEAN;
  v_scores         JSONB;
  v_fondo_eur      NUMERIC;
  v_airoobi_eur    NUMERIC;
  v_charity_eur    NUMERIC;
  v_venditore_eur  NUMERIC;
BEGIN
  -- Verifica admin (skip se service_call)
  IF NOT p_service_call THEN
    IF NOT EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
      RETURN '{"ok":false,"error":"NOT_ADMIN"}'::JSONB;
    END IF;
  END IF;

  -- Carica airdrop
  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN
    RETURN '{"ok":false,"error":"AIRDROP_NOT_FOUND"}'::JSONB;
  END IF;

  -- Calcola ARIA incassato
  SELECT COALESCE(SUM(aria_spent), 0) INTO v_aria_incassato
  FROM airdrop_participations WHERE airdrop_id = p_airdrop_id;

  IF v_aria_incassato = 0 THEN
    RETURN jsonb_build_object(
      'ok', true,
      'warning', 'NO_PARTICIPANTS',
      'aria_incassato', 0
    );
  END IF;

  -- Determina successo
  v_success := v_airdrop.seller_min_price IS NULL
    OR (v_aria_incassato * 0.10) >= v_airdrop.seller_min_price;

  -- Calcola split (cast to NUMERIC for ROUND safety)
  v_fondo_eur     := ROUND((v_aria_incassato * 0.10 * 0.22)::NUMERIC, 2);
  v_airoobi_eur   := ROUND((v_aria_incassato * 0.10 * 0.10)::NUMERIC, 2);
  v_charity_eur   := ROUND((v_aria_incassato * 0.10 * 0.0001)::NUMERIC, 4);
  v_venditore_eur := ROUND((v_aria_incassato * 0.10 * 0.6799)::NUMERIC, 2);

  -- Calcola scores
  v_scores := calculate_winner_score(p_airdrop_id);

  RETURN jsonb_build_object(
    'ok', true,
    'airdrop_id', p_airdrop_id,
    'title', v_airdrop.title,
    'status', v_airdrop.status,
    'aria_incassato', v_aria_incassato,
    'eur_incassato', ROUND((v_aria_incassato * 0.10)::NUMERIC, 2),
    'success', v_success,
    'seller_min_price', v_airdrop.seller_min_price,
    'split', jsonb_build_object(
      'venditore_eur', v_venditore_eur,
      'fondo_eur', v_fondo_eur,
      'airoobi_eur', v_airoobi_eur,
      'charity_eur', v_charity_eur
    ),
    'scores', v_scores,
    'winner_preview', CASE
      WHEN v_success AND v_scores IS NOT NULL AND jsonb_array_length(v_scores) > 0
      THEN v_scores->0
      ELSE NULL
    END,
    'draw_executed', v_airdrop.draw_executed_at IS NOT NULL
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_draw_preview(UUID, BOOLEAN) TO authenticated;
