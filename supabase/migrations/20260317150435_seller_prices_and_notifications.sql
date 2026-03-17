-- ══════════════════════════════════════════════════
-- AIROOBI — Seller Prices & Notifications
-- 1. airdrops: seller_desired_price, seller_min_price
-- 2. notifications: tabella + RLS + RPC
-- 3. manager_update_airdrop: nuovi parametri prezzi
-- ══════════════════════════════════════════════════

-- ── 1. Nuove colonne airdrops + relax valid_value per submissions ──
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS seller_desired_price NUMERIC(10,2);
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS seller_min_price NUMERIC(10,2);

-- Allow object_value_eur = 0 for user submissions (admin sets real value later)
ALTER TABLE airdrops DROP CONSTRAINT IF EXISTS valid_value;
ALTER TABLE airdrops ADD CONSTRAINT valid_value CHECK (object_value_eur >= 0);

-- ── 2. Tabella notifications ──
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'info',          -- info, success, warning, error
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User legge solo le proprie
CREATE POLICY "Users read own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- User può marcare come lette
CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Insert via RPC (SECURITY DEFINER) — policy permissiva, controllo nel codice
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (TRUE);

-- ── 3. RPC: insert_notification (SECURITY DEFINER) ──
CREATE OR REPLACE FUNCTION insert_notification(
  p_user_id UUID,
  p_title TEXT,
  p_body TEXT DEFAULT NULL,
  p_type TEXT DEFAULT 'info'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, body, type)
  VALUES (p_user_id, p_title, p_body, p_type)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION insert_notification TO authenticated;

-- ── 4. Aggiornare manager_update_airdrop con seller prices + object_value_eur ──
CREATE OR REPLACE FUNCTION manager_update_airdrop(
  p_airdrop_id UUID,
  p_status TEXT,
  p_block_price_aria INTEGER DEFAULT NULL,
  p_total_blocks INTEGER DEFAULT NULL,
  p_presale_block_price INTEGER DEFAULT NULL,
  p_deadline TIMESTAMPTZ DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL,
  p_seller_desired_price NUMERIC DEFAULT NULL,
  p_seller_min_price NUMERIC DEFAULT NULL,
  p_object_value_eur NUMERIC DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_airdrop RECORD;
  v_has_perm BOOLEAN;
BEGIN
  -- Get airdrop
  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  END IF;

  -- Check permission: user must have NULL category (all) or matching category
  SELECT EXISTS(
    SELECT 1 FROM airdrop_manager_permissions
    WHERE user_id = auth.uid()
      AND (category IS NULL OR category = v_airdrop.category)
  ) INTO v_has_perm;

  IF NOT v_has_perm THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NO_PERMISSION');
  END IF;

  -- Validate status transition
  IF p_status NOT IN ('in_valutazione', 'presale', 'sale', 'rifiutato_min500', 'rifiutato_generico', 'dropped', 'closed') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_STATUS');
  END IF;

  -- Update
  UPDATE airdrops SET
    status = p_status,
    block_price_aria = COALESCE(p_block_price_aria, block_price_aria),
    total_blocks = COALESCE(p_total_blocks, total_blocks),
    presale_block_price = p_presale_block_price,
    deadline = p_deadline,
    rejection_reason = p_rejection_reason,
    seller_desired_price = COALESCE(p_seller_desired_price, seller_desired_price),
    seller_min_price = COALESCE(p_seller_min_price, seller_min_price),
    object_value_eur = COALESCE(p_object_value_eur, object_value_eur),
    updated_at = NOW()
  WHERE id = p_airdrop_id;

  RETURN jsonb_build_object('ok', true, 'status', p_status);
END;
$$;

GRANT EXECUTE ON FUNCTION manager_update_airdrop TO authenticated;
