-- ═══════════════════════════════════════════════════════════════
-- Scoring v3 — Two factors (F1 70%, F2 30%), no seniority
-- ═══════════════════════════════════════════════════════════════
-- Changes:
-- 1. Remove F3 (seniority) entirely
-- 2. F2 now respects One Category Rule: counts ARIA spent AFTER last win in category
-- 3. F2 excludes cancelled participations (cancelled_at IS NULL)
-- 4. Update airdrop_config weights: w1=0.70, w2=0.30
-- 5. Remove unused config keys (score_w3, score_alpha_f3, score_beta_f3)

-- ─── 1. Update config weights ────────────────────────────────

UPDATE airdrop_config SET value = '0.70' WHERE key = 'score_w1';
UPDATE airdrop_config SET value = '0.30' WHERE key = 'score_w2';
DELETE FROM airdrop_config WHERE key IN ('score_w3', 'score_alpha_f3', 'score_beta_f3');

-- Insert if not exists (safety)
INSERT INTO airdrop_config (key, value, description)
VALUES ('score_w1', '0.70', 'Peso F1 — blocchi acquistati (v3)')
ON CONFLICT (key) DO UPDATE SET value = '0.70', description = 'Peso F1 — blocchi acquistati (v3)';

INSERT INTO airdrop_config (key, value, description)
VALUES ('score_w2', '0.30', 'Peso F2 — fedeltà categoria (v3)')
ON CONFLICT (key) DO UPDATE SET value = '0.30', description = 'Peso F2 — fedeltà categoria (v3)';


-- ─── 2. calculate_winner_score v3 ────────────────────────────

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

  -- Conta partecipanti distinti
  SELECT COUNT(DISTINCT user_id) INTO v_n
  FROM airdrop_participations
  WHERE airdrop_id = p_airdrop_id;

  IF v_n = 0 THEN
    RETURN '[]'::JSONB;
  END IF;

  -- Calcola score per ogni partecipante
  WITH
  -- Blocchi totali per utente in questo airdrop
  user_blocks AS (
    SELECT
      user_id,
      SUM(blocks_count) AS total_blocks,
      SUM(aria_spent)    AS total_aria
    FROM airdrop_participations
    WHERE airdrop_id = p_airdrop_id
    GROUP BY user_id
  ),
  -- Max blocchi tra tutti i partecipanti (per normalizzare F1)
  max_blocks AS (
    SELECT MAX(total_blocks) AS val FROM user_blocks
  ),
  -- F1: peso blocchi acquistati (normalizzato 0→1)
  f1_calc AS (
    SELECT
      ub.user_id,
      ub.total_blocks,
      ub.total_aria,
      CASE WHEN mb.val > 0
        THEN ub.total_blocks::NUMERIC / mb.val
        ELSE 0
      END AS f1
    FROM user_blocks ub, max_blocks mb
  ),
  -- Ultima vittoria nella stessa categoria per ogni partecipante (One Category Rule)
  last_win AS (
    SELECT
      a.winner_id AS user_id,
      MAX(a.draw_executed_at) AS last_win_at
    FROM airdrops a
    WHERE a.category = v_category
      AND a.winner_id IS NOT NULL
      AND a.winner_id IN (SELECT user_id FROM user_blocks)
    GROUP BY a.winner_id
  ),
  -- Storico categoria: ARIA spesi nella stessa categoria, ESCLUSO airdrop corrente
  -- Solo partecipazioni NON cancellate
  -- Reset su vittoria: conta solo ARIA spesi DOPO ultima vittoria nella categoria
  cat_history AS (
    SELECT
      ap.user_id,
      COALESCE(SUM(ap.aria_spent), 0) AS cat_aria
    FROM airdrop_participations ap
    JOIN airdrops a ON a.id = ap.airdrop_id
    LEFT JOIN last_win lw ON lw.user_id = ap.user_id
    WHERE a.category = v_category
      AND ap.airdrop_id <> p_airdrop_id
      AND ap.cancelled_at IS NULL
      AND ap.user_id IN (SELECT user_id FROM user_blocks)
      AND (lw.last_win_at IS NULL OR ap.created_at > lw.last_win_at)
    GROUP BY ap.user_id
  ),
  -- Max storico tra partecipanti (per normalizzare F2)
  max_cat AS (
    SELECT COALESCE(MAX(cat_aria), 0) AS val FROM cat_history
  ),
  -- F2: fedeltà categoria (log-normalizzato 0→1)
  f2_calc AS (
    SELECT
      f1c.user_id,
      CASE WHEN mc.val > 0
        THEN LN(1 + COALESCE(ch.cat_aria, 0)) / LN(1 + mc.val)
        ELSE 0
      END AS f2
    FROM f1_calc f1c
    LEFT JOIN cat_history ch ON ch.user_id = f1c.user_id
    CROSS JOIN max_cat mc
  ),
  -- Score finale (v3: solo F1 + F2, senza F3)
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
  -- Classifica con tiebreaker
  ranked AS (
    SELECT
      fs.*,
      ROW_NUMBER() OVER (
        ORDER BY
          fs.score DESC,
          -- Tiebreaker 1: primo blocco prima
          (SELECT MIN(ab.purchased_at) FROM airdrop_blocks ab
           WHERE ab.airdrop_id = p_airdrop_id AND ab.owner_id = fs.user_id) ASC,
          -- Tiebreaker 2: registrato prima (seniority come tiebreaker, non fattore)
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
