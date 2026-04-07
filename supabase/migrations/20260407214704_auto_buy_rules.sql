-- ══════════════════════════════════════════════════════════
--  Auto-buy rules — acquisto automatico blocchi a intervalli
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS auto_buy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  airdrop_id UUID NOT NULL REFERENCES airdrops(id) ON DELETE CASCADE,
  blocks_per_interval INTEGER NOT NULL DEFAULT 1 CHECK (blocks_per_interval BETWEEN 1 AND 10),
  interval_hours INTEGER NOT NULL DEFAULT 4 CHECK (interval_hours IN (1, 2, 4, 6, 12)),
  max_blocks INTEGER NOT NULL DEFAULT 50 CHECK (max_blocks >= 1),
  active BOOLEAN NOT NULL DEFAULT true,
  last_executed_at TIMESTAMPTZ,
  total_bought INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, airdrop_id)
);

ALTER TABLE auto_buy_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rules" ON auto_buy_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rules" ON auto_buy_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rules" ON auto_buy_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rules" ON auto_buy_rules FOR DELETE USING (auth.uid() = user_id);

-- RPC: crea o aggiorna regola auto-buy
CREATE OR REPLACE FUNCTION upsert_auto_buy(
  p_airdrop_id UUID,
  p_blocks_per_interval INTEGER DEFAULT 1,
  p_interval_hours INTEGER DEFAULT 4,
  p_max_blocks INTEGER DEFAULT 50,
  p_active BOOLEAN DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO auto_buy_rules (user_id, airdrop_id, blocks_per_interval, interval_hours, max_blocks, active)
  VALUES (auth.uid(), p_airdrop_id, p_blocks_per_interval, p_interval_hours, p_max_blocks, p_active)
  ON CONFLICT (user_id, airdrop_id) DO UPDATE SET
    blocks_per_interval = EXCLUDED.blocks_per_interval,
    interval_hours = EXCLUDED.interval_hours,
    max_blocks = EXCLUDED.max_blocks,
    active = EXCLUDED.active;
  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION upsert_auto_buy(UUID, INTEGER, INTEGER, INTEGER, BOOLEAN) TO authenticated;

-- RPC: disattiva regola auto-buy
CREATE OR REPLACE FUNCTION disable_auto_buy(p_airdrop_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE auto_buy_rules SET active = false
  WHERE user_id = auth.uid() AND airdrop_id = p_airdrop_id;
  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION disable_auto_buy(UUID) TO authenticated;
