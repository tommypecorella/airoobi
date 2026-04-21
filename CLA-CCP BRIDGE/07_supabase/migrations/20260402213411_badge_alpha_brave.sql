-- Badge ALPHA_BRAVE: assegnato ai primi 1000 utenti reali (retroattivo)
-- nft_type = 'ALPHA_BRAVE' (non-REWARD = Badge)

INSERT INTO nft_rewards (user_id, nft_type, name, source, shares)
SELECT p.id, 'ALPHA_BRAVE', 'Alpha Brave Badge', 'alpha_badge', 1.0
FROM profiles p
WHERE COALESCE(p.is_test_user, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM nft_rewards n
    WHERE n.user_id = p.id AND n.nft_type = 'ALPHA_BRAVE'
  )
ORDER BY p.created_at ASC
LIMIT 1000;

-- Verify
DO $$
DECLARE cnt integer;
BEGIN
  SELECT count(*) INTO cnt FROM nft_rewards WHERE nft_type = 'ALPHA_BRAVE';
  RAISE NOTICE 'Alpha Brave badges assigned: %', cnt;
END $$;
