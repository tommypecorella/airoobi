-- ══════════════════════════════════════════════════════════
--  Push notification subscriptions (Web Push API)
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- RPC: salva subscription push
CREATE OR REPLACE FUNCTION save_push_subscription(
  p_endpoint TEXT,
  p_keys_p256dh TEXT,
  p_keys_auth TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO push_subscriptions (user_id, endpoint, keys_p256dh, keys_auth)
  VALUES (auth.uid(), p_endpoint, p_keys_p256dh, p_keys_auth)
  ON CONFLICT (user_id, endpoint) DO UPDATE SET
    keys_p256dh = EXCLUDED.keys_p256dh,
    keys_auth = EXCLUDED.keys_auth;
  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION save_push_subscription(TEXT, TEXT, TEXT) TO authenticated;
