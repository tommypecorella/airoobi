-- W4 · M_atto6_01 · Atto 6 Pollution post-completed · winner stories
-- ALTER airdrops add story fields + get_winner_story_public RPC for SSR

ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS story_public_visible BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS story_winner_redacted BOOLEAN NOT NULL DEFAULT TRUE;

-- GENERATED column for public URL (Vercel SSR at airoobi.com/storie-vincitori/:id)
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS story_public_url TEXT
  GENERATED ALWAYS AS ('https://www.airoobi.com/storie-vincitori/' || id::text) STORED;

COMMENT ON COLUMN airdrops.story_public_visible IS 'Seller toggle to hide winner story from public archive (default TRUE).';
COMMENT ON COLUMN airdrops.story_winner_redacted IS 'Hide winner username in public story (default TRUE for privacy).';

CREATE INDEX IF NOT EXISTS idx_airdrops_story_archive
  ON airdrops(draw_executed_at DESC)
  WHERE status = 'completed' AND story_public_visible = TRUE;

-- ─────────────────────────────────────────────────────────────
-- get_winner_story_public RPC · used by SSR /storie-vincitori/:id
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_winner_story_public(p_airdrop_id UUID)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_airdrop RECORD; v_winner_username TEXT; v_total_participants INT;
BEGIN
  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('error','not_found'); END IF;
  IF v_airdrop.status <> 'completed' OR NOT v_airdrop.story_public_visible THEN
    RETURN jsonb_build_object('error','not_visible');
  END IF;

  IF NOT v_airdrop.story_winner_redacted AND v_airdrop.winner_id IS NOT NULL THEN
    SELECT username INTO v_winner_username FROM profiles WHERE id = v_airdrop.winner_id;
  END IF;

  SELECT COUNT(DISTINCT user_id) INTO v_total_participants
  FROM airdrop_participations WHERE airdrop_id = p_airdrop_id AND cancelled_at IS NULL;

  RETURN jsonb_build_object(
    'airdrop_id',      v_airdrop.id,
    'title',           v_airdrop.title,
    'category',        v_airdrop.category,
    'image_url',       v_airdrop.image_url,
    'object_value_eur', v_airdrop.object_value_eur,
    'total_blocks',    v_airdrop.total_blocks,
    'blocks_sold',     v_airdrop.blocks_sold,
    'aria_incassato',  v_airdrop.aria_incassato,
    'venditore_payout_eur', v_airdrop.venditore_payout_eur,
    'draw_executed_at', v_airdrop.draw_executed_at,
    'total_participants', v_total_participants,
    'winner_username', v_winner_username,
    'winner_redacted', v_airdrop.story_winner_redacted,
    'story_public_url', v_airdrop.story_public_url
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_winner_story_public(UUID) TO authenticated, anon;

-- ─────────────────────────────────────────────────────────────
-- get_winner_stories_archive · paginated list for /storie-vincitori
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_winner_stories_archive(
  p_category TEXT DEFAULT NULL, p_limit INT DEFAULT 20, p_offset INT DEFAULT 0
) RETURNS TABLE (
  airdrop_id UUID, title TEXT, category TEXT, image_url TEXT,
  object_value_eur NUMERIC, draw_executed_at TIMESTAMPTZ,
  total_blocks INTEGER, blocks_sold INTEGER, story_public_url TEXT
)
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.id, a.title, a.category, a.image_url,
         a.object_value_eur, a.draw_executed_at,
         a.total_blocks, a.blocks_sold, a.story_public_url
  FROM airdrops a
  WHERE a.status = 'completed' AND a.story_public_visible = TRUE
    AND (p_category IS NULL OR a.category = p_category)
  ORDER BY a.draw_executed_at DESC NULLS LAST
  LIMIT p_limit OFFSET p_offset;
$$;

GRANT EXECUTE ON FUNCTION get_winner_stories_archive(TEXT, INT, INT) TO authenticated, anon;
