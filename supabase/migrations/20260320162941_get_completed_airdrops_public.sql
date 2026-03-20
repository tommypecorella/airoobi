-- ============================================================
-- PUBLIC RPC: get_completed_airdrops
-- Returns completed airdrops for the public landing page.
-- Only exposes non-sensitive fields. Accessible by anon role.
-- ============================================================

CREATE OR REPLACE FUNCTION get_completed_airdrops()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN COALESCE((
    SELECT jsonb_agg(sub ORDER BY sub.draw_executed_at DESC)
    FROM (
      SELECT
        a.id,
        a.title,
        a.category,
        a.image_url,
        a.total_blocks,
        a.blocks_sold,
        a.draw_executed_at,
        a.deadline,
        ROUND((COALESCE(
          (SELECT SUM(ap.aria_spent) FROM airdrop_participations ap WHERE ap.airdrop_id = a.id),
          0
        ) * 0.10)::NUMERIC, 2) AS eur_raccolti,
        (SELECT COUNT(DISTINCT ap.user_id) FROM airdrop_participations ap WHERE ap.airdrop_id = a.id) AS partecipanti,
        p.public_id AS winner_public_id
      FROM airdrops a
      LEFT JOIN profiles p ON p.id = a.winner_id
      WHERE a.status = 'completed'
        AND a.draw_executed_at IS NOT NULL
      ORDER BY a.draw_executed_at DESC
      LIMIT 20
    ) sub
  ), '[]'::JSONB);
END;
$$;

GRANT EXECUTE ON FUNCTION get_completed_airdrops() TO anon;
GRANT EXECUTE ON FUNCTION get_completed_airdrops() TO authenticated;
