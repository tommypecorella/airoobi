-- Delete user paprikarouge7@gmail.com (ref was lost, will re-register)
DELETE FROM nft_rewards WHERE user_id = '480dba9f-b184-46b7-b67a-8c4fd41a711b';
DELETE FROM points_ledger WHERE user_id = '480dba9f-b184-46b7-b67a-8c4fd41a711b';
DELETE FROM checkins WHERE user_id = '480dba9f-b184-46b7-b67a-8c4fd41a711b';
DELETE FROM video_views WHERE user_id = '480dba9f-b184-46b7-b67a-8c4fd41a711b';
DELETE FROM referral_confirmations WHERE referrer_id = '480dba9f-b184-46b7-b67a-8c4fd41a711b' OR referred_id = '480dba9f-b184-46b7-b67a-8c4fd41a711b';
DELETE FROM events WHERE props->>'user_id' = '480dba9f-b184-46b7-b67a-8c4fd41a711b';
DELETE FROM waitlist WHERE email = 'paprikarouge7@gmail.com';
DELETE FROM profiles WHERE id = '480dba9f-b184-46b7-b67a-8c4fd41a711b';
DELETE FROM auth.users WHERE id = '480dba9f-b184-46b7-b67a-8c4fd41a711b';
