-- ══════════════════════════════════════════════════
-- RPC: get_airdrop_participants(airdrop_id)
-- Ritorna partecipanti unici con avatar e n° blocchi
-- Per le bolle flottanti nel donut
-- ══════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_airdrop_participants(p_airdrop_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_agg(jsonb_build_object(
    'public_id', p.public_id,
    'avatar_url', p.avatar_url,
    'blocks', sub.block_count
  ) ORDER BY sub.block_count DESC)
  INTO v_result
  FROM (
    SELECT owner_id, COUNT(*) AS block_count
    FROM airdrop_blocks
    WHERE airdrop_id = p_airdrop_id
    GROUP BY owner_id
  ) sub
  JOIN profiles p ON p.id = sub.owner_id
  WHERE p.deleted_at IS NULL;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION get_airdrop_participants(UUID) TO authenticated;
