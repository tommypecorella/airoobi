-- ══════════════════════════════════════════════════
-- AIROOBI — User Roles System
-- Unified role system: admin, evaluator
-- Replaces airdrop_manager_permissions
-- ══════════════════════════════════════════════════

-- ── Create user_roles table ──
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL,
  category TEXT,  -- only for evaluator, NULL = all categories
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_roles_role_check CHECK (role IN ('admin', 'evaluator'))
);

CREATE UNIQUE INDEX user_roles_unique_idx ON user_roles (user_id, role, COALESCE(category, '__ALL__'));

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Admin can manage all roles
CREATE POLICY "Admin can manage roles"
  ON user_roles FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Users can read their own roles
CREATE POLICY "Users can read own roles"
  ON user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ── Migrate existing manager permissions to evaluator roles ──
INSERT INTO user_roles (user_id, role, category, granted_by, created_at)
SELECT user_id, 'evaluator', category, granted_by, created_at
FROM airdrop_manager_permissions
ON CONFLICT DO NOTHING;

-- ── Insert CEO as admin ──
INSERT INTO user_roles (user_id, role, granted_by)
SELECT id, 'admin', id
FROM auth.users
WHERE email IN ('tommaso.pecorella+ceo@outlook.com', 'ceo@airoobi.com')
ON CONFLICT DO NOTHING;

-- ── RPC: get_my_roles — returns all roles for current user ──
CREATE OR REPLACE FUNCTION get_my_roles()
RETURNS TABLE(role TEXT, category TEXT)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT ur.role, ur.category
  FROM user_roles ur
  WHERE ur.user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION get_my_roles() TO authenticated;

-- ── Update get_my_manager_permissions to use user_roles ──
CREATE OR REPLACE FUNCTION get_my_manager_permissions()
RETURNS TABLE(category TEXT)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT ur.category
  FROM user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role = 'evaluator';
$$;

-- ── Update get_all_airdrops to use user_roles ──
CREATE OR REPLACE FUNCTION get_all_airdrops()
RETURNS SETOF airdrops
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'evaluator')
  ) THEN
    RAISE EXCEPTION 'NOT_A_MANAGER';
  END IF;
  RETURN QUERY SELECT * FROM airdrops ORDER BY created_at DESC;
END;
$$;

-- ── Update manager_update_airdrop to use user_roles ──
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
  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  END IF;

  -- Admin has full access, evaluator checks category
  SELECT EXISTS(
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND (
        role = 'admin'
        OR (role = 'evaluator' AND (category IS NULL OR category = v_airdrop.category))
      )
  ) INTO v_has_perm;

  IF NOT v_has_perm THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NO_PERMISSION');
  END IF;

  IF p_status NOT IN ('presale', 'sale', 'rifiutato_min500', 'rifiutato_generico', 'dropped', 'closed') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_STATUS');
  END IF;

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
