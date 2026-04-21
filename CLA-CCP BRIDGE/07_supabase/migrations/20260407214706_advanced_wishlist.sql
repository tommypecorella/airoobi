-- ══════════════════════════════════════════════════════════
--  Wishlist avanzata — keyword alerts + soglia prezzo
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS wishlist_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keywords TEXT, -- ricerca per parole chiave su titolo airdrop
  max_block_price INTEGER, -- avvisami se prezzo blocco <= X
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE wishlist_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts" ON wishlist_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alerts" ON wishlist_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON wishlist_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own alerts" ON wishlist_alerts FOR DELETE USING (auth.uid() = user_id);

-- RPC: salva alert wishlist
CREATE OR REPLACE FUNCTION upsert_wishlist_alert(
  p_keywords TEXT DEFAULT NULL,
  p_max_block_price INTEGER DEFAULT NULL,
  p_active BOOLEAN DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO wishlist_alerts (user_id, keywords, max_block_price, active)
  VALUES (auth.uid(), p_keywords, p_max_block_price, p_active)
  RETURNING id INTO v_id;
  RETURN jsonb_build_object('ok', true, 'id', v_id);
END;
$$;

GRANT EXECUTE ON FUNCTION upsert_wishlist_alert(TEXT, INTEGER, BOOLEAN) TO authenticated;

-- RPC: elimina alert wishlist
CREATE OR REPLACE FUNCTION delete_wishlist_alert(p_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM wishlist_alerts WHERE id = p_id AND user_id = auth.uid();
  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION delete_wishlist_alert(UUID) TO authenticated;

-- RPC: controlla match wishlist per un airdrop (usata dal trigger)
CREATE OR REPLACE FUNCTION check_wishlist_matches(p_airdrop_id UUID)
RETURNS TABLE(user_id UUID, alert_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_airdrop RECORD;
BEGIN
  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN RETURN; END IF;

  RETURN QUERY
  SELECT wa.user_id, wa.id AS alert_id
  FROM wishlist_alerts wa
  WHERE wa.active = true
    AND (
      -- Keyword match (case-insensitive, any word)
      (wa.keywords IS NOT NULL AND v_airdrop.title ILIKE '%' || wa.keywords || '%')
      OR
      -- Price threshold match
      (wa.max_block_price IS NOT NULL AND v_airdrop.block_price_aria <= wa.max_block_price)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION check_wishlist_matches(UUID) TO service_role;
