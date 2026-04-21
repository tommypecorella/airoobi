-- ============================================================
-- DROP TEST INFRASTRUCTURE (alpha launch cleanup)
-- Rimuove tutto il codice DB legato al test pool / simulation.
-- La waitlist resta in schema ma non più consultata dal FE.
-- ============================================================

-- 1. Drop test RPCs
DROP FUNCTION IF EXISTS public.create_test_pool();
DROP FUNCTION IF EXISTS public.simulate_airdrop_participation(UUID, NUMERIC, BOOLEAN);

-- 2. Aggiorna get_leaderboard: niente più filtro is_test_user
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(row_to_json(sub)::JSONB ORDER BY sub.total_points DESC), '[]'::JSONB)
    FROM (
      SELECT
        p.public_id,
        p.total_points,
        p.current_streak,
        p.avatar_url,
        p.created_at
      FROM public.profiles p
      JOIN auth.users au ON au.id = p.id
      WHERE p.deleted_at IS NULL
        AND au.email NOT IN ('ceo@airoobi.com', 'tommaso.pecorella+ceo@outlook.com')
      ORDER BY p.total_points DESC
      LIMIT 50
    ) sub
  );
END;
$$;

-- 3. Drop is_test_user column + relativo index
DROP INDEX IF EXISTS idx_profiles_is_test_user;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_test_user;
