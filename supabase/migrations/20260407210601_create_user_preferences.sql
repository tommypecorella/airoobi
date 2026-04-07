-- ══════════════════════════════════════════════════════════
--  Preferenze utente — alert per categoria airdrop
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_slug TEXT NOT NULL,
  alert_on BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_slug)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- RPC: salva preferenze alert (array di slug attivi)
CREATE OR REPLACE FUNCTION save_category_alerts(p_slugs TEXT[])
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM user_preferences WHERE user_id = auth.uid();
  INSERT INTO user_preferences (user_id, category_slug, alert_on)
  SELECT auth.uid(), unnest(p_slugs), true;
  RETURN jsonb_build_object('ok', true, 'count', array_length(p_slugs, 1));
END;
$$;

GRANT EXECUTE ON FUNCTION save_category_alerts(TEXT[]) TO authenticated;
