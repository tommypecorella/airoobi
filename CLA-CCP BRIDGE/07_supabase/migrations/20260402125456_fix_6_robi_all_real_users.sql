-- Ensure every real user has exactly 6 ROBI (1 launch + 5 go-live)
-- Step 1: Insert ROBI for real users who don't have one yet
INSERT INTO nft_rewards (user_id, nft_type, name, source, shares)
SELECT p.id, 'ROBI', 'ROBI Launch Gift', 'dapp_launch', 6.0
FROM profiles p
WHERE p.is_test_user IS NOT TRUE
  AND NOT EXISTS (
    SELECT 1 FROM nft_rewards n
    WHERE n.user_id = p.id AND n.nft_type = 'ROBI'
  );

-- Step 2: Set shares to 6 for all real users who already have a ROBI but less than 6
UPDATE nft_rewards
SET shares = 6
WHERE nft_type = 'ROBI'
  AND shares < 6
  AND user_id IN (
    SELECT id FROM profiles WHERE is_test_user IS NOT TRUE
  );
