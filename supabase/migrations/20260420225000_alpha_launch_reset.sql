-- ============================================================
-- ALPHA LAUNCH RESET (2026-04-20)
-- Reset completo per avvio Alpha-Net: elimina tutti gli utenti
-- di test, ripristina i 7 utenti reali con welcome grant
-- (1000 ARIA + 5 ROBI), wipa airdrop + participations.
--
-- Una-tantum: applicato via MCP il 2026-04-20. Questo file
-- è la versione storicizzata per reference.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email LIKE 'test_user_%@airoobi.test') THEN
    RAISE NOTICE 'Reset già applicato — skip.';
    RETURN;
  END IF;

  CREATE TEMP TABLE _test_users AS
  SELECT id FROM auth.users
  WHERE email LIKE 'test_user_%@airoobi.test'
     OR email IN ('ceo+1@gmail.com','ceo+2@airoobi.com','playwright-test@airoobi.app');

  UPDATE airdrops SET winner_id=NULL WHERE winner_id IN (SELECT id FROM _test_users);

  DELETE FROM treasury_transactions WHERE airdrop_id IN (SELECT id FROM airdrops WHERE submitted_by IN (SELECT id FROM _test_users));
  DELETE FROM airdrop_blocks WHERE airdrop_id IN (SELECT id FROM airdrops WHERE submitted_by IN (SELECT id FROM _test_users));
  DELETE FROM airdrop_participations WHERE airdrop_id IN (SELECT id FROM airdrops WHERE submitted_by IN (SELECT id FROM _test_users));
  DELETE FROM airdrop_messages WHERE airdrop_id IN (SELECT id FROM airdrops WHERE submitted_by IN (SELECT id FROM _test_users));
  DELETE FROM airdrop_watchlist WHERE airdrop_id IN (SELECT id FROM airdrops WHERE submitted_by IN (SELECT id FROM _test_users));
  DELETE FROM notifications WHERE airdrop_id IN (SELECT id FROM airdrops WHERE submitted_by IN (SELECT id FROM _test_users));
  DELETE FROM nft_rewards WHERE airdrop_id IN (SELECT id FROM airdrops WHERE submitted_by IN (SELECT id FROM _test_users));
  DELETE FROM airdrops WHERE submitted_by IN (SELECT id FROM _test_users);

  DELETE FROM airdrop_blocks WHERE owner_id IN (SELECT id FROM _test_users);
  DELETE FROM airdrop_participations WHERE user_id IN (SELECT id FROM _test_users);
  DELETE FROM nft_rewards WHERE user_id IN (SELECT id FROM _test_users);
  DELETE FROM weekly_checkins WHERE user_id IN (SELECT id FROM _test_users);
  DELETE FROM airdrop_watchlist WHERE user_id IN (SELECT id FROM _test_users);
  DELETE FROM user_preferences WHERE user_id IN (SELECT id FROM _test_users);
  DELETE FROM push_subscriptions WHERE user_id IN (SELECT id FROM _test_users);
  DELETE FROM notifications WHERE user_id IN (SELECT id FROM _test_users);
  DELETE FROM airdrop_messages WHERE sender_id IN (SELECT id FROM _test_users);
  DELETE FROM auto_buy_rules WHERE user_id IN (SELECT id FROM _test_users);
  DELETE FROM wishlist_alerts WHERE user_id IN (SELECT id FROM _test_users);
  DELETE FROM user_roles WHERE user_id IN (SELECT id FROM _test_users);
  DELETE FROM airdrop_manager_permissions WHERE user_id IN (SELECT id FROM _test_users);

  DELETE FROM profiles WHERE id IN (SELECT id FROM _test_users);
  DELETE FROM auth.users WHERE id IN (SELECT id FROM _test_users);

  DROP TABLE _test_users;

  -- Reset residuo utenti reali rimanenti + welcome grant
  DELETE FROM points_ledger;
  DELETE FROM nft_rewards WHERE nft_type IN ('ROBI','NFT_REWARD','NFT_EARN','VALUATION');
  DELETE FROM weekly_checkins;
  DELETE FROM checkins;
  DELETE FROM referral_confirmations;
  DELETE FROM airdrop_participations;
  DELETE FROM airdrop_blocks;
  DELETE FROM airdrop_messages;
  DELETE FROM airdrop_watchlist;
  DELETE FROM auto_buy_rules;
  DELETE FROM wishlist_alerts;
  DELETE FROM notifications;
  DELETE FROM treasury_transactions;
  DELETE FROM airdrops;

  UPDATE profiles SET total_points = 1000;

  INSERT INTO points_ledger (user_id, amount, reason, created_at)
  SELECT id, 1000, 'alphanet_welcome', NOW() FROM profiles;

  INSERT INTO nft_rewards (user_id, nft_type, name, source, shares, metadata, created_at)
  SELECT id, 'ROBI', 'Alpha-Net welcome grant', 'alphanet_welcome', 5,
         jsonb_build_object('alpha_phase','alphanet_launch','granted_at', NOW()), NOW()
  FROM profiles;
END $$;
