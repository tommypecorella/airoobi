DELETE FROM nft_rewards WHERE user_id = '79a8c18c-a28a-4789-9ff3-903ac23a2b85';
DELETE FROM points_ledger WHERE user_id = '79a8c18c-a28a-4789-9ff3-903ac23a2b85';
DELETE FROM checkins WHERE user_id = '79a8c18c-a28a-4789-9ff3-903ac23a2b85';
DELETE FROM video_views WHERE user_id = '79a8c18c-a28a-4789-9ff3-903ac23a2b85';
DELETE FROM referral_confirmations WHERE referrer_id = '79a8c18c-a28a-4789-9ff3-903ac23a2b85' OR referred_id = '79a8c18c-a28a-4789-9ff3-903ac23a2b85';
DELETE FROM waitlist WHERE email = 'paprikarouge7@gmail.com';
DELETE FROM profiles WHERE id = '79a8c18c-a28a-4789-9ff3-903ac23a2b85';
DELETE FROM auth.users WHERE id = '79a8c18c-a28a-4789-9ff3-903ac23a2b85';
