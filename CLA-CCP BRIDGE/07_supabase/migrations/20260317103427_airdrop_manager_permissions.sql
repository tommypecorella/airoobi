-- ══════════════════════════════════════════════════
-- AIROOBI — Airdrop Manager Permissions
-- Per-category permissions for airdrop management
-- category = NULL → all categories
-- ══════════════════════════════════════════════════

CREATE TABLE airdrop_manager_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category TEXT,  -- NULL = all categories
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

ALTER TABLE airdrop_manager_permissions ENABLE ROW LEVEL SECURITY;

-- Admin can manage permissions
CREATE POLICY "Admin can manage permissions"
  ON airdrop_manager_permissions FOR ALL
  USING (auth.jwt() ->> 'email' IN ('tommaso.pecorella+ceo@outlook.com', 'ceo@airoobi.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('tommaso.pecorella+ceo@outlook.com', 'ceo@airoobi.com'));

-- Users can read their own permissions
CREATE POLICY "Users can read own permissions"
  ON airdrop_manager_permissions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- RPC: check if current user is airdrop manager (returns categories or null)
CREATE OR REPLACE FUNCTION get_my_manager_permissions()
RETURNS TABLE(category TEXT)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT amp.category
  FROM airdrop_manager_permissions amp
  WHERE amp.user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION get_my_manager_permissions() TO authenticated;

-- RPC: get all airdrops (for managers — bypasses RLS)
CREATE OR REPLACE FUNCTION get_all_airdrops()
RETURNS SETOF airdrops
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Check if caller is a manager
  IF NOT EXISTS (
    SELECT 1 FROM airdrop_manager_permissions WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'NOT_A_MANAGER';
  END IF;

  RETURN QUERY SELECT * FROM airdrops ORDER BY created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_all_airdrops() TO authenticated;

-- RPC: manager update airdrop (approve/reject — checks category permission)
CREATE OR REPLACE FUNCTION manager_update_airdrop(
  p_airdrop_id UUID,
  p_status TEXT,
  p_block_price_aria INTEGER DEFAULT NULL,
  p_total_blocks INTEGER DEFAULT NULL,
  p_presale_block_price INTEGER DEFAULT NULL,
  p_deadline TIMESTAMPTZ DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
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
  IF p_status NOT IN ('presale', 'sale', 'rifiutato_min500', 'rifiutato_generico', 'dropped', 'closed') THEN
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
    updated_at = NOW()
  WHERE id = p_airdrop_id;

  RETURN jsonb_build_object('ok', true, 'status', p_status);
END;
$$;

GRANT EXECUTE ON FUNCTION manager_update_airdrop TO authenticated;

-- ── Insert CEO as manager for all categories ──
INSERT INTO airdrop_manager_permissions (user_id, category, granted_by)
SELECT id, NULL, id
FROM auth.users
WHERE email IN ('tommaso.pecorella+ceo@outlook.com', 'ceo@airoobi.com')
ON CONFLICT DO NOTHING;
