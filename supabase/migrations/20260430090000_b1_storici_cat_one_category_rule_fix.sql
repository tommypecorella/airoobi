-- ════════════════════════════════════════════════════════════════════
-- B1 fix · my_category_score_snapshot_for storici_cat one-category-rule
-- Sprint W1 · Hole #3 PRE-FIX (separato dalla riscrittura calculate_winner_score)
-- 30 Apr 2026
--
-- BUG (B1 ROBY code review Day 1):
--   my_category_score_snapshot_for ritorna `storici_cat` calcolato
--   indipendentemente da calculate_winner_score, SENZA filtro
--   `WHERE created_at > last_win_at_in_category` — quindi non rispetta
--   la One Category Rule. Bug di display UI (snapshot per-utente),
--   NON di scoring (calculate_winner_score già filtra correttamente
--   alle lines 137-162 di 20260424120000_scoring_v5_pity.sql).
--
-- IMPATTO ATTUALE:
--   Alpha 0 con 7 utenti + 0 airdrop completati con winner_id reale
--   → utenti con last_win_at = NULL → fallback al ramo "no last win"
--   → identico al pre-fix → nessun damage live.
--   Diventa critico al primo airdrop completed con winner_id reale
--   nello stesso category dove l'utente partecipa di nuovo.
--
-- FIX:
--   Aggiungo CTE `last_win` mirror di calculate_winner_score lines
--   137-146, applico filtro nel SELECT di storici_cat.
--   Convention W1: smoke test inline post-fix.
-- ════════════════════════════════════════════════════════════════════

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
  v_category    TEXT;
  v_last_win_at TIMESTAMPTZ;
BEGIN
  SELECT category INTO v_category FROM public.airdrops WHERE id = p_airdrop_id;
  IF v_category IS NULL THEN RETURN; END IF;

  -- One Category Rule: data dell'ultima vittoria di p_user_id in v_category
  -- Mirror della logica in calculate_winner_score CTE last_win (file
  -- 20260424120000_scoring_v5_pity.sql lines 137-146).
  -- Se NULL → l'utente non ha mai vinto in categoria → storici_cat = lifetime.
  SELECT MAX(a.draw_executed_at)
    INTO v_last_win_at
    FROM public.airdrops a
   WHERE a.category = v_category
     AND a.winner_id = p_user_id;

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
    -- B1 FIX: storici_cat post-last-win (One Category Rule)
    -- v_last_win_at = NULL → ramo "no last win" → comportamento pre-fix
    -- v_last_win_at = TIMESTAMPTZ → filtra ap.created_at > v_last_win_at
    COALESCE((SELECT SUM(ap.aria_spent)::NUMERIC
                FROM public.airdrop_participations ap
                JOIN public.airdrops a ON a.id = ap.airdrop_id
               WHERE ap.user_id = p_user_id
                 AND a.category = v_category
                 AND ap.cancelled_at IS NULL
                 AND a.id <> p_airdrop_id
                 AND (v_last_win_at IS NULL OR ap.created_at > v_last_win_at)
                 ), 0)::NUMERIC AS storici_cat,
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

-- ── Smoke test inline (convention W1) ───────────────────────────────
-- Verifica che la funzione compili e sia callable (no exception).
-- In Alpha 0 con utenti reali ma zero airdrop completati con winner_id,
-- v_last_win_at sarà sempre NULL → ramo identico al pre-fix.
-- Il vero test parity vs pre-fix verrà incluso in compare_score_v5_vs_v51
-- skeleton (Day 4, Hole #3 finale).
DO $$
DECLARE
  v_test_airdrop UUID;
  v_test_user    UUID;
  v_result       RECORD;
BEGIN
  -- Pick a real airdrop + user se esistono; altrimenti smoke test schema-only
  SELECT id INTO v_test_airdrop FROM public.airdrops LIMIT 1;
  SELECT id INTO v_test_user FROM public.profiles LIMIT 1;

  IF v_test_airdrop IS NULL OR v_test_user IS NULL THEN
    RAISE NOTICE '[B1 smoke] DB vuoto, skip live call. Function compiled OK.';
    RETURN;
  END IF;

  SELECT * INTO v_result
    FROM public.my_category_score_snapshot_for(v_test_airdrop, v_test_user)
    LIMIT 1;

  RAISE NOTICE '[B1 smoke] OK · airdrop=% user=% storici_cat=% my_position=%',
    v_test_airdrop, v_test_user, v_result.storici_cat, v_result.my_position;
END $$;
