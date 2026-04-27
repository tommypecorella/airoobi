-- ════════════════════════════════════════════════════════════════════
-- Hole #4 · K stability rolling 4-week median + fix snapshot_for
-- TECH-HARDEN-001 · Sprint W1 · 27 Apr 2026
--
-- (1) Fix bug Hole #2: airdrops.category è TEXT (slug), non category_id UUID.
--     Riscrivo my_category_score_snapshot_for con TEXT come chiave.
-- (2) Materialized view category_k_history: percentile_cont(0.5) su storici_cat
--     per category, settimanale.
-- (3) RPC get_category_k(p_category TEXT) → AVG K ultime 4 settimane (floor 100).
-- (4) Cron weekly Sunday 00:05 → REFRESH MATERIALIZED VIEW + audit log K shift > 20%.
-- (5) NOTA: integration in public.calculate_winner_score viene da Hole #3 (Day 4)
--     che riscrive calculate_winner_score per pity v5.1 + S_u normalization.
-- ════════════════════════════════════════════════════════════════════

-- ── 1. Fix snapshot_for con category TEXT + cast NUMERIC esplicito ─
DROP FUNCTION IF EXISTS public.my_category_score_snapshot_for(UUID, UUID);

CREATE OR REPLACE FUNCTION public.my_category_score_snapshot_for(
  p_airdrop_id UUID,
  p_user_id    UUID
) RETURNS TABLE(
  my_score              NUMERIC,
  leader_score          NUMERIC,
  my_position           INT,
  my_pity_bonus_current NUMERIC,
  storici_cat           NUMERIC,
  k_current             NUMERIC,
  my_blocks_current     INT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_category TEXT;
BEGIN
  SELECT category INTO v_category FROM public.airdrops WHERE id = p_airdrop_id;
  IF v_category IS NULL THEN RETURN; END IF;

  RETURN QUERY
  WITH scored AS (
    SELECT * FROM jsonb_array_elements(public.calculate_winner_score(p_airdrop_id))
  ),
  parsed AS (
    SELECT
      (s.value->>'user_id')::UUID AS user_id,
      (s.value->>'score')::NUMERIC AS score,
      COALESCE((s.value->>'pity_bonus')::NUMERIC, 0) AS pity_bonus
    FROM scored s
  ),
  ranked AS (
    SELECT p.*, ROW_NUMBER() OVER (ORDER BY p.score DESC) AS pos FROM parsed p
  ),
  me AS (SELECT * FROM ranked WHERE user_id = p_user_id),
  leader AS (SELECT score AS leader_score FROM ranked WHERE pos = 1)
  SELECT
    COALESCE(me.score, 0)::NUMERIC                 AS my_score,
    COALESCE(leader.leader_score, 0)::NUMERIC      AS leader_score,
    COALESCE(me.pos, 1)::INT                       AS my_position,
    COALESCE(me.pity_bonus, 0)::NUMERIC            AS my_pity_bonus_current,
    COALESCE((SELECT SUM(ap.aria_spent)::NUMERIC
                FROM public.airdrop_participations ap
                JOIN public.airdrops a ON a.id = ap.airdrop_id
               WHERE ap.user_id = p_user_id
                 AND a.category = v_category
                 AND ap.cancelled_at IS NULL
                 AND a.id <> p_airdrop_id), 0)::NUMERIC AS storici_cat,
    GREATEST(COALESCE(public.get_category_k(v_category), 100), 100)::NUMERIC AS k_current,
    COALESCE((SELECT COUNT(*) FROM public.airdrop_blocks
               WHERE airdrop_id = p_airdrop_id AND owner_id = p_user_id), 0)::INT
                                                   AS my_blocks_current
  FROM (SELECT 1) dummy
  LEFT JOIN me ON true
  LEFT JOIN leader ON true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.my_category_score_snapshot_for(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_category_score_snapshot_for(UUID, UUID) TO service_role;

-- ── 2. Materialized view: K weekly per category ─────────────────────
DROP MATERIALIZED VIEW IF EXISTS public.category_k_history;

CREATE MATERIALIZED VIEW public.category_k_history AS
WITH user_storici AS (
  SELECT
    a.category,
    date_trunc('week', NOW())::date AS week_start,
    ap.user_id,
    SUM(ap.aria_spent)::NUMERIC AS storici_cat
  FROM public.airdrop_participations ap
  JOIN public.airdrops a ON a.id = ap.airdrop_id
  WHERE ap.cancelled_at IS NULL
    AND a.category IS NOT NULL
  GROUP BY a.category, ap.user_id
)
SELECT
  category,
  week_start,
  GREATEST(
    100,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY storici_cat)
  )::NUMERIC AS k_value
FROM user_storici
GROUP BY category, week_start;

CREATE UNIQUE INDEX IF NOT EXISTS uq_ckh_cat_week
  ON public.category_k_history (category, week_start);

-- ── 3. RPC get_category_k ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_category_k(p_category TEXT)
RETURNS NUMERIC
LANGUAGE sql STABLE AS $$
  SELECT GREATEST(100, COALESCE(AVG(k_value), 100))
    FROM public.category_k_history
   WHERE category = p_category
     AND week_start >= (NOW() - INTERVAL '4 weeks')::date;
$$;

GRANT EXECUTE ON FUNCTION public.get_category_k(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_category_k(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_category_k(TEXT) TO anon;

-- ── 4. Cron weekly refresh + audit log >20% shift ───────────────────
CREATE OR REPLACE FUNCTION public.refresh_category_k_history()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  CREATE TEMP TABLE _k_pre AS
    SELECT category, k_value AS old_k
      FROM public.category_k_history
     WHERE week_start = (
       SELECT MAX(week_start) FROM public.category_k_history
     );

  REFRESH MATERIALIZED VIEW public.category_k_history;

  INSERT INTO public.events (event, props)
  SELECT
    'category_k_shift',
    jsonb_build_object(
      'category', new_k.category,
      'old_k', pre.old_k,
      'new_k', new_k.k_value,
      'shift_pct', ROUND(((new_k.k_value - pre.old_k) / NULLIF(pre.old_k, 0) * 100)::numeric, 2)
    )
  FROM public.category_k_history new_k
  JOIN _k_pre pre ON pre.category = new_k.category
  WHERE new_k.week_start = (SELECT MAX(week_start) FROM public.category_k_history)
    AND ABS((new_k.k_value - pre.old_k) / NULLIF(pre.old_k, 0)) > 0.20;

  DROP TABLE _k_pre;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refresh_category_k_history() TO service_role;

-- Cron Sunday 00:05 UTC
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname='refresh_category_k') THEN
    PERFORM cron.unschedule('refresh_category_k');
  END IF;
END $$;

SELECT cron.schedule('refresh_category_k', '5 0 * * 0', $$SELECT public.refresh_category_k_history()$$);

-- ── 5. Refresh iniziale per popolare la view ────────────────────────
SELECT public.refresh_category_k_history();
