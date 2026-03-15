-- Fix: row_to_jsonb does not exist, use to_jsonb instead
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
