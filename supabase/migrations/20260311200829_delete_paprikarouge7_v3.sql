DELETE FROM nft_rewards WHERE user_id = '7dcd91a0-5ebd-4137-b552-ff42f24dfd5b';
DELETE FROM points_ledger WHERE user_id = '7dcd91a0-5ebd-4137-b552-ff42f24dfd5b';
DELETE FROM checkins WHERE user_id = '7dcd91a0-5ebd-4137-b552-ff42f24dfd5b';
DELETE FROM video_views WHERE user_id = '7dcd91a0-5ebd-4137-b552-ff42f24dfd5b';
DELETE FROM referral_confirmations WHERE referrer_id = '7dcd91a0-5ebd-4137-b552-ff42f24dfd5b' OR referred_id = '7dcd91a0-5ebd-4137-b552-ff42f24dfd5b';
DELETE FROM waitlist WHERE email = 'paprikarouge7@gmail.com';
DELETE FROM profiles WHERE id = '7dcd91a0-5ebd-4137-b552-ff42f24dfd5b';
DELETE FROM auth.users WHERE id = '7dcd91a0-5ebd-4137-b552-ff42f24dfd5b';
