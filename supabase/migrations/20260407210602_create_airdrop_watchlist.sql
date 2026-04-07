-- ══════════════════════════════════════════════════════════
--  Watchlist / Preferiti airdrop
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS airdrop_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  airdrop_id UUID NOT NULL REFERENCES airdrops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, airdrop_id)
);

ALTER TABLE airdrop_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watchlist"
  ON airdrop_watchlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist"
  ON airdrop_watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist"
  ON airdrop_watchlist FOR DELETE
  USING (auth.uid() = user_id);

-- RPC toggle (insert or delete)
CREATE OR REPLACE FUNCTION toggle_watchlist(p_airdrop_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM airdrop_watchlist
    WHERE user_id = auth.uid() AND airdrop_id = p_airdrop_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM airdrop_watchlist
    WHERE user_id = auth.uid() AND airdrop_id = p_airdrop_id;
    RETURN jsonb_build_object('ok', true, 'action', 'removed');
  ELSE
    INSERT INTO airdrop_watchlist (user_id, airdrop_id)
    VALUES (auth.uid(), p_airdrop_id);
    RETURN jsonb_build_object('ok', true, 'action', 'added');
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION toggle_watchlist(UUID) TO authenticated;
