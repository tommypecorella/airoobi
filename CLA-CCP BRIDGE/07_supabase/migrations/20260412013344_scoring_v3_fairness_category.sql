-- ══════════════════════════════════════════════════════════
--  Scoring v3 — Fairness by Category
--  Formula: score = F1×0.70 + F2×0.30
--  F1 = blocchi airdrop corrente (normalizzato)
--  F2 = ARIA spesi storicamente nella categoria (log, normalizzato)
--       Solo partecipazioni NON cancellate (cancelled_at IS NULL)
--  Rimossa F3 (seniority) — non meritocratica
-- ══════════════════════════════════════════════════════════

-- Aggiorna pesi in airdrop_config
UPDATE airdrop_config SET value = '0.70', description = 'Peso blocchi corrente — v3: fairness by category'
WHERE key = 'score_w1';

UPDATE airdrop_config SET value = '0.30', description = 'Peso fedeltà categoria (ARIA spesi storici) — v3'
WHERE key = 'score_w2';

-- w3 non più usato ma lo teniamo a 0 per safety
UPDATE airdrop_config SET value = '0.00', description = 'Peso seniority — v3: DEPRECATO, non usato'
WHERE key = 'score_w3';

-- Ricrea calculate_winner_score senza F3
CREATE OR REPLACE FUNCTION calculate_winner_score(p_airdrop_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_category     TEXT;
  v_w1           NUMERIC := 0.70;
  v_w2           NUMERIC := 0.30;
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
    (SELECT value::NUMERIC FROM airdrop_config WHERE key = 'score_w1'), 0.70
  ) INTO v_w1;
  SELECT COALESCE(
    (SELECT value::NUMERIC FROM airdrop_config WHERE key = 'score_w2'), 0.30
  ) INTO v_w2;

  -- Conta partecipanti distinti (non cancellati)
  SELECT COUNT(DISTINCT user_id) INTO v_n
  FROM airdrop_participations
  WHERE airdrop_id = p_airdrop_id
    AND cancelled_at IS NULL;

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
      AND cancelled_at IS NULL
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
  -- F2: ARIA spesi storicamente nella stessa categoria
  -- SOLO partecipazioni NON cancellate, ESCLUSO airdrop corrente
  cat_history AS (
    SELECT
      ap.user_id,
      COALESCE(SUM(ap.aria_spent), 0) AS cat_aria
    FROM airdrop_participations ap
    JOIN airdrops a ON a.id = ap.airdrop_id
    WHERE a.category = v_category
      AND ap.airdrop_id <> p_airdrop_id
      AND ap.cancelled_at IS NULL
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
  final_scores AS (
    SELECT
      f1c.user_id,
      f1c.total_blocks,
      f1c.total_aria,
      ROUND(f1c.f1::NUMERIC, 6) AS f1,
      ROUND(f2c.f2::NUMERIC, 6) AS f2,
      ROUND((v_w1 * f1c.f1 + v_w2 * f2c.f2)::NUMERIC, 6) AS score
    FROM f1_calc f1c
    JOIN f2_calc f2c ON f2c.user_id = f1c.user_id
  ),
  ranked AS (
    SELECT
      fs.*,
      ROW_NUMBER() OVER (
        ORDER BY
          fs.score DESC,
          fs.total_aria DESC,
          (SELECT MIN(ab.purchased_at) FROM airdrop_blocks ab
           WHERE ab.airdrop_id = p_airdrop_id AND ab.owner_id = fs.user_id) ASC
      ) AS rank
    FROM final_scores fs
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'user_id', r.user_id,
      'score', r.score,
      'f1', r.f1,
      'f2', r.f2,
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
