-- ═══════════════════════════════════════════════════════════════
-- Scoring v3.1 — F2 normalizzato su totale globale categoria
-- ═══════════════════════════════════════════════════════════════
-- Cambia il denominatore di F2 da MAX(storico singolo partecipante)
-- a SOMMA(ARIA spesi nella categoria da TUTTI gli utenti).
--
-- Perché: quando un utente si azzera dopo una vittoria (One Category Rule),
-- il denominatore globale resta stabile e pondera correttamente
-- il peso relativo di ogni partecipante nella categoria.
--
-- Formula F2:
--   f2 = ln(1 + aria_spesi_utente_post_vittoria) / ln(1 + totale_aria_categoria)

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
  -- Storico PER UTENTE: ARIA spesi nella categoria, post-vittoria, escluso airdrop corrente
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
  -- TOTALE GLOBALE: somma di TUTTI gli ARIA spesi nella categoria da TUTTI gli utenti
  -- (non solo partecipanti, ma chiunque abbia mai partecipato in questa categoria)
  global_cat_total AS (
    SELECT COALESCE(SUM(ap.aria_spent), 0) AS val
    FROM airdrop_participations ap
    JOIN airdrops a ON a.id = ap.airdrop_id
    WHERE a.category = v_category
      AND ap.airdrop_id <> p_airdrop_id
      AND ap.cancelled_at IS NULL
  ),
  -- F2: fedeltà categoria (log-normalizzato su totale globale, 0→1)
  f2_calc AS (
    SELECT
      f1c.user_id,
      CASE WHEN gct.val > 0
        THEN LN(1 + COALESCE(ch.cat_aria, 0)) / LN(1 + gct.val)
        ELSE 0
      END AS f2
    FROM f1_calc f1c
    LEFT JOIN cat_history ch ON ch.user_id = f1c.user_id
    CROSS JOIN global_cat_total gct
  ),
  -- Score finale (v3.1: F1 + F2, F2 normalizzato su globale)
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
