-- Rename debug_robi_check → admin_get_all_robi (production name)
CREATE OR REPLACE FUNCTION admin_get_all_robi()
RETURNS TABLE(email text, user_id uuid, nft_type text, shares numeric, is_test boolean)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT p.email, p.id, n.nft_type, n.shares, p.is_test_user
  FROM profiles p
  LEFT JOIN nft_rewards n ON n.user_id = p.id AND n.nft_type IN ('ROBI','NFT_REWARD')
  WHERE COALESCE(p.is_test_user, false) = false
  ORDER BY p.email;
$$;

GRANT EXECUTE ON FUNCTION admin_get_all_robi() TO authenticated;

-- Keep old name as alias for backwards compat during deploy
CREATE OR REPLACE FUNCTION debug_robi_check()
RETURNS TABLE(email text, user_id uuid, nft_type text, shares numeric, is_test boolean)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT * FROM admin_get_all_robi();
$$;
