-- Gift +5 ROBI to all real users registered before go-live (2026-04-02)
-- Each user already has 1 ROBI from launch gift → total becomes 6 ROBI
-- Excludes test pool users (is_test_user = true)

UPDATE nft_rewards
SET shares = shares + 5
WHERE nft_type = 'ROBI'
  AND user_id IN (
    SELECT id FROM profiles
    WHERE is_test_user IS NOT TRUE
      AND created_at < '2026-04-02T06:00:00+00:00'
  );
