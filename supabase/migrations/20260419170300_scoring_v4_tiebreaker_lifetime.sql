-- ═══════════════════════════════════════════════════════════════
-- SCORING v4.1 — Tiebreaker power-user (ARIA lifetime)
-- 19 Aprile 2026
-- ═══════════════════════════════════════════════════════════════
-- Skeezu: a parità di Punteggio, premia chi ha impegnato più ARIA
-- totali lifetime su AIROOBI (power-user cross-categoria).
-- Inserito tra "più blocchi airdrop corrente" e "seniority".
--
-- Effetto: in condizioni normali non cambia nulla (pareggi rari).
-- In caso di parità, chi è più attivo in generale vince.
-- Zero impatto anti-gambling: l'algoritmo principale resta
-- mono-fattoriale per categoria.
--
-- Tiebreaker ordine:
--   (1) Score v4 (ARIA cat post-last-win + corrente)
--   (2) Più blocchi nell'airdrop corrente
--   (3) Più ARIA totali lifetime (cross-categoria, escluso cancellati)
--   (4) Primo blocco acquistato prima
--   (5) Seniority (estrema ratio)
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
  -- NEW v4.1: ARIA lifetime cross-categoria (solo airdrop non annullati,
  -- non cancellate) — usato SOLO come tiebreaker, non entra nello score
  lifetime_aria AS (
    SELECT
      ap.user_id,
      COALESCE(SUM(ap.aria_spent), 0) AS total_aria
    FROM airdrop_participations ap
    JOIN airdrops a ON a.id = ap.airdrop_id
    WHERE ap.cancelled_at IS NULL
      AND a.status <> 'annullato'
      AND ap.user_id IN (SELECT user_id FROM user_current)
    GROUP BY ap.user_id
  ),
  final_scores AS (
    SELECT
      uc.user_id,
      uc.total_blocks,
      uc.current_aria,
      COALESCE(ch.historic_aria, 0)::NUMERIC AS historic_aria,
      COALESCE(la.total_aria, 0)::NUMERIC AS lifetime_aria,
      (uc.current_aria + COALESCE(ch.historic_aria, 0))::NUMERIC AS score
    FROM user_current uc
    LEFT JOIN cat_history ch ON ch.user_id = uc.user_id
    LEFT JOIN lifetime_aria la ON la.user_id = uc.user_id
  ),
  ranked AS (
    SELECT
      fs.*,
      ROW_NUMBER() OVER (
        ORDER BY
          fs.score DESC,
          -- Tiebreaker 1: più blocchi nell'airdrop corrente
          fs.total_blocks DESC,
          -- Tiebreaker 2 (v4.1): più ARIA lifetime (power-user cross-cat)
          fs.lifetime_aria DESC,
          -- Tiebreaker 3: primo blocco comprato prima
          (SELECT MIN(ab.purchased_at) FROM airdrop_blocks ab
           WHERE ab.airdrop_id = p_airdrop_id AND ab.owner_id = fs.user_id) ASC,
          -- Tiebreaker 4 (estrema ratio): seniority
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
      'lifetime_aria', r.lifetime_aria,
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
