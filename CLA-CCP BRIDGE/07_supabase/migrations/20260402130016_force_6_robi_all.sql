-- Force: every real user gets exactly 6 ROBI
-- No conditions on date or existing shares — brute force approach

-- 1. Update ALL existing ROBI records for real users to shares=6
UPDATE nft_rewards
SET shares = 6.0
WHERE nft_type = 'ROBI'
  AND user_id IN (SELECT id FROM profiles WHERE COALESCE(is_test_user, false) = false);

-- 2. Insert ROBI for any real user who still doesn't have one
INSERT INTO nft_rewards (user_id, nft_type, name, source, shares)
SELECT p.id, 'ROBI', 'ROBI Launch Gift', 'dapp_launch', 6.0
FROM profiles p
WHERE COALESCE(p.is_test_user, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM nft_rewards n WHERE n.user_id = p.id AND n.nft_type = 'ROBI'
  );

-- Verify (will show in migration log)
DO $$
DECLARE
  cnt integer;
BEGIN
  SELECT count(*) INTO cnt FROM nft_rewards
  WHERE nft_type = 'ROBI' AND shares = 6
    AND user_id IN (SELECT id FROM profiles WHERE COALESCE(is_test_user, false) = false);
  RAISE NOTICE 'Real users with 6 ROBI: %', cnt;
END $$;
