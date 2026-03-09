-- ═══════════════════════════════════════════════════════════════
-- AIROOBI v0.8.0 — New reward economy
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── 1. confirm_referral: remove 24h/checkin gates, new amounts (+10 referrer, +15 invited) ──
CREATE OR REPLACE FUNCTION confirm_referral(p_referred_id UUID, p_device_hash TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referrer_id UUID;
  v_ref_code TEXT;
BEGIN
  -- Check already confirmed
  IF EXISTS (
    SELECT 1 FROM referral_confirmations
    WHERE referred_id = p_referred_id AND status = 'confirmed'
  ) THEN
    RETURN jsonb_build_object('success', false, 'reason', 'already_confirmed');
  END IF;

  -- Get referrer from profile
  SELECT referred_by INTO v_ref_code
  FROM profiles WHERE id = p_referred_id;

  IF v_ref_code IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no_referrer');
  END IF;

  -- Resolve referrer user ID
  SELECT id INTO v_referrer_id
  FROM profiles WHERE referral_code = v_ref_code;

  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no_referrer');
  END IF;

  -- Device limit (max 3 referrals from same device)
  IF (SELECT COUNT(*) FROM referral_confirmations WHERE device_hash = p_device_hash AND status = 'confirmed') >= 3 THEN
    RETURN jsonb_build_object('success', false, 'reason', 'device_limit');
  END IF;

  -- Insert confirmation
  INSERT INTO referral_confirmations (referrer_id, referred_id, device_hash, status)
  VALUES (v_referrer_id, p_referred_id, p_device_hash, 'confirmed');

  -- Award +10 ARIA to referrer
  INSERT INTO points_ledger (user_id, amount, reason)
  VALUES (v_referrer_id, 10, 'referral_bonus');

  -- Award +15 ARIA to invited
  INSERT INTO points_ledger (user_id, amount, reason)
  VALUES (p_referred_id, 15, 'referral_bonus');

  -- Update referrer profile totals
  UPDATE profiles SET
    total_points = COALESCE(total_points, 0) + 10,
    referral_count = COALESCE(referral_count, 0) + 1
  WHERE id = v_referrer_id;

  -- Update invited profile totals
  UPDATE profiles SET
    total_points = COALESCE(total_points, 0) + 15
  WHERE id = p_referred_id;

  RETURN jsonb_build_object('success', true);
END;
$$;


-- ── 2. do_checkin: award 1 ARIA (was 10) ──
CREATE OR REPLACE FUNCTION do_checkin(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - 1;
  v_streak INT;
  v_longest INT;
BEGIN
  -- Already checked in today?
  IF EXISTS (SELECT 1 FROM checkins WHERE user_id = p_user_id AND checked_at = v_today) THEN
    RETURN jsonb_build_object('success', false, 'reason', 'already_checked_in');
  END IF;

  -- Insert checkin
  INSERT INTO checkins (user_id, checked_at) VALUES (p_user_id, v_today);

  -- Calculate streak
  IF EXISTS (SELECT 1 FROM checkins WHERE user_id = p_user_id AND checked_at = v_yesterday) THEN
    v_streak := COALESCE((SELECT current_streak FROM profiles WHERE id = p_user_id), 0) + 1;
  ELSE
    v_streak := 1;
  END IF;

  v_longest := GREATEST(v_streak, COALESCE((SELECT longest_streak FROM profiles WHERE id = p_user_id), 0));

  -- Award 1 ARIA for checkin
  INSERT INTO points_ledger (user_id, amount, reason) VALUES (p_user_id, 1, 'daily_checkin');

  -- Weekly streak bonus: +1 ARIA every 7 consecutive days
  IF v_streak > 0 AND v_streak % 7 = 0 THEN
    INSERT INTO points_ledger (user_id, amount, reason) VALUES (p_user_id, 1, 'weekly_streak');
  END IF;

  -- Recalc total from ledger
  UPDATE profiles SET
    current_streak = v_streak,
    longest_streak = v_longest,
    total_points = (SELECT COALESCE(SUM(amount), 0) FROM points_ledger WHERE user_id = p_user_id)
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'streak', v_streak,
    'longest', v_longest,
    'points_awarded', CASE WHEN v_streak % 7 = 0 THEN 2 ELSE 1 END
  );
END;
$$;


-- ── 3. reward_video_view: award 1 ARIA (was 10), keep 5/day limit ──
CREATE OR REPLACE FUNCTION reward_video_view(p_user_id UUID, p_duration INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_count INT;
BEGIN
  -- Count today's views
  SELECT COUNT(*) INTO v_count
  FROM video_views
  WHERE user_id = p_user_id AND viewed_at >= v_today::TIMESTAMP;

  IF v_count >= 5 THEN
    RETURN jsonb_build_object('success', false, 'reason', 'daily_limit', 'views_today', v_count);
  END IF;

  -- Insert view
  INSERT INTO video_views (user_id, duration, viewed_at) VALUES (p_user_id, p_duration, NOW());

  -- Award 1 ARIA
  INSERT INTO points_ledger (user_id, amount, reason) VALUES (p_user_id, 1, 'video_view');

  -- Recalc total
  UPDATE profiles SET
    total_points = (SELECT COALESCE(SUM(amount), 0) FROM points_ledger WHERE user_id = p_user_id)
  WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true, 'views_today', v_count + 1, 'points_awarded', 1);
END;
$$;
