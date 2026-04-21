-- Ensure every user has at least 1 ROBI (dapp_launch gift)
-- Inserts only for users who don't have one yet

INSERT INTO nft_rewards (user_id, nft_type, name, source, shares)
SELECT p.id, 'ROBI', 'ROBI Launch Gift', 'dapp_launch', 1.0
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM nft_rewards n
  WHERE n.user_id = p.id AND n.nft_type = 'ROBI'
);

-- Also ensure points_ledger has the launch bonus
INSERT INTO points_ledger (user_id, amount, reason)
SELECT p.id, 100, 'dapp_launch_bonus'
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM points_ledger l
  WHERE l.user_id = p.id AND l.reason = 'dapp_launch_bonus'
);
