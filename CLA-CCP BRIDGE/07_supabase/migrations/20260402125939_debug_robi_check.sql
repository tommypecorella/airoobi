-- Debug: check ROBI state for all real users (admin only)
CREATE OR REPLACE FUNCTION debug_robi_check()
RETURNS TABLE(email text, user_id uuid, nft_type text, shares numeric, is_test boolean)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT p.email, p.id, n.nft_type, n.shares, p.is_test_user
  FROM profiles p
  LEFT JOIN nft_rewards n ON n.user_id = p.id AND n.nft_type IN ('ROBI','NFT_REWARD')
  WHERE p.is_test_user IS NOT TRUE
  ORDER BY p.email;
$$;

GRANT EXECUTE ON FUNCTION debug_robi_check() TO authenticated;
