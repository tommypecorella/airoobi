-- Fix referral_count desync for ceo@airoobi.com (shows 3, actual confirmed = 2)
UPDATE profiles SET referral_count = (
  SELECT COUNT(*) FROM referral_confirmations
  WHERE referrer_id = profiles.id AND status = 'confirmed'
) WHERE email = 'ceo@airoobi.com';
