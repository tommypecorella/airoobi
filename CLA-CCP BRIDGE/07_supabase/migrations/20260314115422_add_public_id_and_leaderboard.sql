-- ═══════════════════════════════════════════════════════════
-- 1. Add public_id (UUID v4) to profiles
-- ═══════════════════════════════════════════════════════════
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS public_id uuid DEFAULT gen_random_uuid() NOT NULL;

-- Backfill existing rows that might have NULL
UPDATE profiles SET public_id = gen_random_uuid() WHERE public_id IS NULL;

-- Unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_public_id ON profiles(public_id);

-- ═══════════════════════════════════════════════════════════
-- 2. Leaderboard RPC — top 100 + caller position
-- Returns JSON: { top100: [...], user_entry: {...} | null }
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_leaderboard(p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_top100 jsonb;
  v_user_entry jsonb;
BEGIN
  -- Top 100 by total_points DESC, then created_at ASC (earlier = higher)
  SELECT jsonb_agg(to_jsonb(t))
  INTO v_top100
  FROM (
    SELECT
      public_id,
      total_points,
      current_streak,
      avatar_url,
      ROW_NUMBER() OVER (ORDER BY total_points DESC, created_at ASC) AS rank
    FROM profiles
    WHERE deleted_at IS NULL
    ORDER BY total_points DESC, created_at ASC
    LIMIT 100
  ) t;

  IF v_top100 IS NULL THEN
    v_top100 := '[]'::jsonb;
  END IF;

  -- Caller's entry with rank (even if outside top 100)
  IF p_user_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'public_id', p.public_id,
      'total_points', p.total_points,
      'current_streak', p.current_streak,
      'avatar_url', p.avatar_url,
      'rank', sub.rank
    )
    INTO v_user_entry
    FROM profiles p
    JOIN (
      SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY total_points DESC, created_at ASC) AS rank
      FROM profiles
      WHERE deleted_at IS NULL
    ) sub ON sub.id = p.id
    WHERE p.id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'top100', v_top100,
    'user_entry', COALESCE(v_user_entry, 'null'::jsonb)
  );
END;
$$;

-- Grant execute to authenticated + anon (leaderboard is public)
GRANT EXECUTE ON FUNCTION get_leaderboard(uuid) TO authenticated, anon;
