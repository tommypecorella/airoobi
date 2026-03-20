-- ============================================================
-- FIX: get_leaderboard(p_user_id) — exclude test users
-- The parameterized version was not filtering is_test_user.
-- Also drop the parameterless overload (unused, causes ambiguity).
-- ============================================================

DROP FUNCTION IF EXISTS get_leaderboard();

CREATE OR REPLACE FUNCTION get_leaderboard(p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_top100 jsonb;
  v_user_entry jsonb;
BEGIN
  SELECT jsonb_agg(to_jsonb(t))
  INTO v_top100
  FROM (
    SELECT
      p.public_id,
      p.total_points,
      p.current_streak,
      p.avatar_url,
      p.created_at,
      ROW_NUMBER() OVER (ORDER BY p.total_points DESC, p.created_at ASC) AS rank
    FROM profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE p.deleted_at IS NULL
      AND p.is_test_user IS NOT TRUE
      AND u.email NOT IN ('ceo@airoobi.com', 'tommaso.pecorella+ceo@outlook.com')
    ORDER BY p.total_points DESC, p.created_at ASC
    LIMIT 100
  ) t;

  IF v_top100 IS NULL THEN
    v_top100 := '[]'::jsonb;
  END IF;

  IF p_user_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'public_id', p.public_id,
      'total_points', p.total_points,
      'current_streak', p.current_streak,
      'avatar_url', p.avatar_url,
      'created_at', p.created_at,
      'rank', sub.rank
    )
    INTO v_user_entry
    FROM profiles p
    JOIN (
      SELECT
        pr.id,
        ROW_NUMBER() OVER (ORDER BY pr.total_points DESC, pr.created_at ASC) AS rank
      FROM profiles pr
      JOIN auth.users au ON au.id = pr.id
      WHERE pr.deleted_at IS NULL
        AND pr.is_test_user IS NOT TRUE
        AND au.email NOT IN ('ceo@airoobi.com', 'tommaso.pecorella+ceo@outlook.com')
    ) sub ON sub.id = p.id
    WHERE p.id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'top100', v_top100,
    'user_entry', COALESCE(v_user_entry, 'null'::jsonb)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_leaderboard(uuid) TO authenticated;
