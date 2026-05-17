-- ============================================================================
-- Sprint W4 · Day 5 · Phase 2 dual-write transition (decision #18 LOCKED Skeezu)
-- ============================================================================
-- Patches 6 legacy RPCs to dual-write points_ledger + transactions atomically.
-- Adds NEW admin_grant_aria RPC for future admin grants (replaces manual SQL).
--
-- Per W3 M7 architectural plan:
-- - W3: transactions table created + backfill one-shot · new RPCs write TX-only
-- - W4 (this migration): legacy RPCs dual-write (PL + TX mirror)
-- - W5: cutover · legacy RPCs write TX-only · PL flagged read-only
-- - W5+90gg: DROP TABLE points_ledger
--
-- Atomicity: each CREATE OR REPLACE FUNCTION body = single plpgsql transaction.
-- If either INSERT fails, both roll back (no explicit SAVEPOINT needed).
--
-- Audit-trail: each new TX row carries metadata.dual_write_phase='2' marker.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. claim_faucet() · 100 ARIA daily · idempotent
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.claim_faucet()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_today date := CURRENT_DATE;
  v_already_claimed boolean;
  v_amount integer := 100;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM points_ledger
    WHERE user_id = v_user_id
    AND reason = 'faucet'
    AND created_at::date = v_today
  ) INTO v_already_claimed;

  IF v_already_claimed THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_claimed');
  END IF;

  -- Dual-write: legacy points_ledger
  INSERT INTO points_ledger (user_id, amount, reason)
  VALUES (v_user_id, v_amount, 'faucet');

  -- Dual-write: new transactions ledger (Phase 2 mirror)
  INSERT INTO public.transactions (
    user_id, category, asset_in, asset_in_amount, description, metadata,
    status, triggered_by, completed_at
  ) VALUES (
    v_user_id, 'faucet_aria', 'ARIA', v_amount,
    'Faucet daily +100 ARIA',
    jsonb_build_object('dual_write_phase','2'),
    'completed', v_user_id, NOW()
  );

  UPDATE profiles SET total_points = total_points + v_amount WHERE id = v_user_id;

  RETURN jsonb_build_object('ok', true, 'amount', v_amount);
END;
$function$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. do_checkin(p_user_id) · 1 ARIA daily checkin + 1 ARIA every 7-day streak
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.do_checkin(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - 1;
  v_streak INT;
  v_longest INT;
BEGIN
  IF EXISTS (SELECT 1 FROM checkins WHERE user_id = p_user_id AND checked_at = v_today) THEN
    RETURN jsonb_build_object('success', false, 'reason', 'already_checked_in');
  END IF;

  INSERT INTO checkins (user_id, checked_at) VALUES (p_user_id, v_today);

  IF EXISTS (SELECT 1 FROM checkins WHERE user_id = p_user_id AND checked_at = v_yesterday) THEN
    v_streak := COALESCE((SELECT current_streak FROM profiles WHERE id = p_user_id), 0) + 1;
  ELSE
    v_streak := 1;
  END IF;

  v_longest := GREATEST(v_streak, COALESCE((SELECT longest_streak FROM profiles WHERE id = p_user_id), 0));

  -- Dual-write: legacy points_ledger + new transactions (Phase 2 mirror)
  INSERT INTO points_ledger (user_id, amount, reason) VALUES (p_user_id, 1, 'daily_checkin');

  INSERT INTO public.transactions (
    user_id, category, asset_in, asset_in_amount, description, metadata,
    status, triggered_by, completed_at
  ) VALUES (
    p_user_id, 'checkin_daily_aria', 'ARIA', 1,
    'Check-in giornaliero +1 ARIA',
    jsonb_build_object('dual_write_phase','2','streak_day', v_streak),
    'completed', p_user_id, NOW()
  );

  IF v_streak > 0 AND v_streak % 7 = 0 THEN
    INSERT INTO points_ledger (user_id, amount, reason) VALUES (p_user_id, 1, 'weekly_streak');

    INSERT INTO public.transactions (
      user_id, category, asset_in, asset_in_amount, description, metadata,
      status, triggered_by, completed_at
    ) VALUES (
      p_user_id, 'streak_bonus', 'ARIA', 1,
      'Bonus streak settimanale +1 ARIA · ' || v_streak || ' giorni consecutivi',
      jsonb_build_object('dual_write_phase','2','streak_day', v_streak),
      'completed', p_user_id, NOW()
    );
  END IF;

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
$function$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. daily_checkin_v2() · 50 ARIA per nuovo giorno timbrato · 1 ROBI su 7/7
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.daily_checkin_v2()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_today date := CURRENT_DATE;
  v_week_start date;
  v_day_of_week smallint;
  v_row weekly_checkins%ROWTYPE;
  v_already_today boolean := false;
  v_aria_awarded integer := 0;
  v_robi_awarded numeric := 0;
  v_completed boolean := false;
  v_robi_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  v_week_start := date_trunc('week', v_today)::date;
  v_day_of_week := EXTRACT(ISODOW FROM v_today)::smallint;

  SELECT * INTO v_row
  FROM weekly_checkins
  WHERE user_id = v_user_id AND week_start = v_week_start;

  IF NOT FOUND THEN
    INSERT INTO weekly_checkins (user_id, week_start, days_checked)
    VALUES (v_user_id, v_week_start, ARRAY[v_day_of_week]::smallint[])
    RETURNING * INTO v_row;
    v_aria_awarded := 50;
  ELSE
    IF v_day_of_week = ANY(v_row.days_checked) THEN
      v_already_today := true;
    ELSE
      UPDATE weekly_checkins
      SET days_checked = array_append(days_checked, v_day_of_week)
      WHERE user_id = v_user_id AND week_start = v_week_start
      RETURNING * INTO v_row;
      v_aria_awarded := 50;
    END IF;
  END IF;

  -- Dual-write: legacy points_ledger + new transactions (Phase 2 mirror)
  IF v_aria_awarded > 0 THEN
    INSERT INTO points_ledger (user_id, amount, reason)
    VALUES (v_user_id, v_aria_awarded, 'streak_day');

    INSERT INTO public.transactions (
      user_id, category, asset_in, asset_in_amount, description, metadata,
      status, triggered_by, completed_at
    ) VALUES (
      v_user_id, 'checkin_daily_aria', 'ARIA', v_aria_awarded,
      'Check-in giornaliero +50 ARIA',
      jsonb_build_object('dual_write_phase','2','week_start', v_week_start,'day_of_week', v_day_of_week),
      'completed', v_user_id, NOW()
    );

    UPDATE profiles SET total_points = total_points + v_aria_awarded WHERE id = v_user_id;
  END IF;

  -- ROBI weekly bonus (7/7 complete · no PL write · TX mirror for unified ledger)
  IF array_length(v_row.days_checked, 1) = 7 AND NOT v_row.robi_awarded THEN
    v_robi_awarded := 1;
    v_completed := true;
    UPDATE weekly_checkins
    SET robi_awarded = true
    WHERE user_id = v_user_id AND week_start = v_week_start;

    INSERT INTO nft_rewards (user_id, nft_type, name, source, shares, metadata)
    VALUES (
      v_user_id, 'ROBI', 'Streak settimanale completa', 'streak_week', 1,
      jsonb_build_object('week_start', v_week_start)
    ) RETURNING id INTO v_robi_id;

    INSERT INTO public.transactions (
      user_id, category, asset_in, asset_in_amount, asset_in_id,
      description, metadata, status, triggered_by, completed_at
    ) VALUES (
      v_user_id, 'streak_bonus', 'ROBI', 1, v_robi_id,
      'Bonus 1 ROBI · settimana completa 7/7',
      jsonb_build_object('dual_write_phase','2','week_start', v_week_start,'nft_rewards_id', v_robi_id),
      'completed', v_user_id, NOW()
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'already_today', v_already_today,
    'aria_awarded', v_aria_awarded,
    'robi_awarded', v_robi_awarded,
    'week_complete', v_completed,
    'days_checked', v_row.days_checked,
    'day_of_week', v_day_of_week,
    'week_start', v_week_start
  );
END;
$function$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. claim_welcome_grant(p_user_id) · welcome 100 ARIA + 5 ROBI + ALPHA_LIVE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.claim_welcome_grant(p_user_id uuid DEFAULT NULL::uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id      UUID;
  v_already      BOOLEAN;
  v_user_count   INT;
  v_threshold    INT;
  v_aria_full    INT;
  v_aria_reduced INT;
  v_robi_full    NUMERIC;
  v_robi_reduced NUMERIC;
  v_aria_amount  INT;
  v_robi_amount  NUMERIC;
  v_scale        TEXT;
  v_bypass       TEXT;
  v_phone_verified TIMESTAMPTZ;
  v_robi_id      UUID;
  v_badge_id     UUID;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.points_ledger
     WHERE user_id = v_user_id AND reason = 'alphanet_welcome' AND (archived IS NULL OR archived = false)
  ) INTO v_already;
  IF v_already THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_claimed');
  END IF;

  SELECT COALESCE(value, 'true') INTO v_bypass
    FROM public.airdrop_config WHERE key = 'phone_verify_bypass_enabled';

  IF v_bypass <> 'true' THEN
    SELECT phone_verified_at INTO v_phone_verified FROM public.profiles WHERE id = v_user_id;
    IF v_phone_verified IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'phone_not_verified');
    END IF;
  END IF;

  SELECT COALESCE(value::INT, 100) INTO v_threshold
    FROM public.airdrop_config WHERE key = 'welcome_threshold_users';
  SELECT COALESCE(value::INT, 100) INTO v_aria_full
    FROM public.airdrop_config WHERE key = 'welcome_grant_aria_full';
  SELECT COALESCE(value::INT, 100) INTO v_aria_reduced
    FROM public.airdrop_config WHERE key = 'welcome_grant_aria_reduced';
  SELECT COALESCE(value::NUMERIC, 5) INTO v_robi_full
    FROM public.airdrop_config WHERE key = 'welcome_grant_robi_full';
  SELECT COALESCE(value::NUMERIC, 1) INTO v_robi_reduced
    FROM public.airdrop_config WHERE key = 'welcome_grant_robi_reduced';

  SELECT COUNT(*) INTO v_user_count FROM public.profiles WHERE deleted_at IS NULL;

  IF v_user_count >= v_threshold THEN
    v_aria_amount := v_aria_reduced;
    v_robi_amount := v_robi_reduced;
    v_scale       := 'reduced';
  ELSE
    v_aria_amount := v_aria_full;
    v_robi_amount := v_robi_full;
    v_scale       := 'full';
  END IF;

  -- Dual-write: legacy points_ledger + new transactions (Phase 2 mirror)
  INSERT INTO public.points_ledger (user_id, amount, reason, created_at)
  VALUES (v_user_id, v_aria_amount, 'alphanet_welcome', NOW());

  INSERT INTO public.transactions (
    user_id, category, asset_in, asset_in_amount, description, metadata,
    status, triggered_by, completed_at
  ) VALUES (
    v_user_id, 'welcome_grant', 'ARIA', v_aria_amount,
    'Welcome grant +' || v_aria_amount || ' ARIA · scale=' || v_scale,
    jsonb_build_object('dual_write_phase','2','scale', v_scale,'user_rank', v_user_count + 1),
    'completed', v_user_id, NOW()
  );

  UPDATE public.profiles
     SET total_points = COALESCE(total_points, 0) + v_aria_amount
   WHERE id = v_user_id;

  -- ROBI welcome
  INSERT INTO public.nft_rewards (user_id, nft_type, name, source, shares, metadata, created_at)
  VALUES (v_user_id, 'ROBI', 'Alpha-Net welcome grant', 'alphanet_welcome', v_robi_amount,
          jsonb_build_object('alpha_phase','alphanet_launch','scale', v_scale,
                             'user_rank', v_user_count + 1, 'granted_at', NOW()), NOW())
  RETURNING id INTO v_robi_id;

  INSERT INTO public.transactions (
    user_id, category, asset_in, asset_in_amount, asset_in_id,
    description, metadata, status, triggered_by, completed_at
  ) VALUES (
    v_user_id, 'welcome_grant', 'ROBI', v_robi_amount, v_robi_id,
    'Welcome grant +' || v_robi_amount || ' ROBI · scale=' || v_scale,
    jsonb_build_object('dual_write_phase','2','scale', v_scale,'nft_rewards_id', v_robi_id),
    'completed', v_user_id, NOW()
  );

  -- ALPHA_LIVE badge auto-grant
  INSERT INTO public.nft_rewards (user_id, nft_type, name, source, shares, metadata, created_at)
  VALUES (v_user_id, 'ALPHA_LIVE', 'AIROOBI ALPHA LIVE - stay together', 'alpha_live_badge', 1,
          jsonb_build_object(
            'badge_id', 'alpha_live_stay_together',
            'grant_event', 'alpha_live_signup',
            'icon', 'rocket',
            'description_it', 'Sei dentro dal momento in cui AIROOBI è andato live in Alpha. Stay together.',
            'description_en', 'You are in from the moment AIROOBI went live in Alpha. Stay together.'
          ), NOW())
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_badge_id;

  IF v_badge_id IS NOT NULL THEN
    INSERT INTO public.transactions (
      user_id, category, asset_in, asset_in_amount, asset_in_id,
      description, metadata, status, triggered_by, completed_at
    ) VALUES (
      v_user_id, 'welcome_grant', 'NFT_BADGE', 1, v_badge_id,
      'ALPHA_LIVE badge auto-grant',
      jsonb_build_object('dual_write_phase','2','badge_id','alpha_live_stay_together','nft_rewards_id', v_badge_id),
      'completed', v_user_id, NOW()
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'aria', v_aria_amount,
    'robi', v_robi_amount,
    'badges', jsonb_build_array('alpha_brave', 'alpha_live_stay_together'),
    'scale', v_scale,
    'user_rank', v_user_count + 1,
    'phone_gate', v_bypass <> 'true'
  );
END;
$function$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. confirm_referral(p_referred_id, p_device_hash) · +10/+15 ARIA referral
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.confirm_referral(p_referred_id uuid, p_device_hash text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_referrer_id UUID;
  v_ref_code TEXT;
BEGIN
  IF EXISTS (
    SELECT 1 FROM referral_confirmations
    WHERE referred_id = p_referred_id AND status = 'confirmed'
  ) THEN
    RETURN jsonb_build_object('success', false, 'reason', 'already_confirmed');
  END IF;

  SELECT referred_by INTO v_ref_code
  FROM profiles WHERE id = p_referred_id;

  IF v_ref_code IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no_referrer');
  END IF;

  SELECT id INTO v_referrer_id
  FROM profiles WHERE referral_code = v_ref_code;

  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no_referrer');
  END IF;

  IF (SELECT COUNT(*) FROM referral_confirmations WHERE device_hash = p_device_hash AND status = 'confirmed') >= 3 THEN
    RETURN jsonb_build_object('success', false, 'reason', 'device_limit');
  END IF;

  INSERT INTO referral_confirmations (referrer_id, referred_id, device_hash, status)
  VALUES (v_referrer_id, p_referred_id, p_device_hash, 'confirmed');

  -- Dual-write: legacy points_ledger + new transactions (Phase 2 mirror)
  INSERT INTO points_ledger (user_id, amount, reason)
  VALUES (v_referrer_id, 10, 'referral_bonus');

  INSERT INTO public.transactions (
    user_id, category, asset_in, asset_in_amount, description, metadata,
    status, triggered_by, completed_at
  ) VALUES (
    v_referrer_id, 'referral_bonus', 'ARIA', 10,
    'Referral bonus +10 ARIA (inviter)',
    jsonb_build_object('dual_write_phase','2','referred_id', p_referred_id,'role','inviter'),
    'completed', v_referrer_id, NOW()
  );

  INSERT INTO points_ledger (user_id, amount, reason)
  VALUES (p_referred_id, 15, 'referral_bonus');

  INSERT INTO public.transactions (
    user_id, category, asset_in, asset_in_amount, description, metadata,
    status, triggered_by, completed_at
  ) VALUES (
    p_referred_id, 'referral_bonus', 'ARIA', 15,
    'Referral bonus +15 ARIA (invited)',
    jsonb_build_object('dual_write_phase','2','inviter_id', v_referrer_id,'role','invited'),
    'completed', p_referred_id, NOW()
  );

  UPDATE profiles SET
    total_points = COALESCE(total_points, 0) + 10,
    referral_count = COALESCE(referral_count, 0) + 1
  WHERE id = v_referrer_id;

  UPDATE profiles SET
    total_points = COALESCE(total_points, 0) + 15
  WHERE id = p_referred_id;

  RETURN jsonb_build_object('success', true);
END;
$function$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. reward_video_view(p_user_id, p_duration) · 1 ARIA per view · 5/gg cap
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.reward_video_view(p_user_id uuid, p_duration integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM video_views
  WHERE user_id = p_user_id AND viewed_at >= v_today::TIMESTAMP;

  IF v_count >= 5 THEN
    RETURN jsonb_build_object('success', false, 'reason', 'daily_limit', 'views_today', v_count);
  END IF;

  -- Bonus catch Day 5: original RPC referenced column 'duration' which doesn't exist
  -- in video_views (actual column: duration_seconds). Surgical fix during dual-write.
  INSERT INTO video_views (user_id, duration_seconds, viewed_at) VALUES (p_user_id, p_duration, NOW());

  -- Dual-write: legacy points_ledger + new transactions (Phase 2 mirror)
  INSERT INTO points_ledger (user_id, amount, reason) VALUES (p_user_id, 1, 'video_view');

  INSERT INTO public.transactions (
    user_id, category, asset_in, asset_in_amount, description, metadata,
    status, triggered_by, completed_at
  ) VALUES (
    p_user_id, 'video_reward', 'ARIA', 1,
    'Video view reward +1 ARIA',
    jsonb_build_object('dual_write_phase','2','duration_sec', p_duration,'view_number_today', v_count + 1),
    'completed', p_user_id, NOW()
  );

  UPDATE profiles SET
    total_points = (SELECT COALESCE(SUM(amount), 0) FROM points_ledger WHERE user_id = p_user_id)
  WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true, 'views_today', v_count + 1, 'points_awarded', 1);
END;
$function$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. admin_grant_aria(p_user_id, p_amount, p_reason, p_metadata) · NEW RPC
-- Replaces manual SQL pattern documented in project_aria_grants.md
-- Dual-write atomic · admin/CEO only · positive (grant) or negative (clawback)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_grant_aria(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_admin_id UUID := auth.uid();
  v_new_balance INTEGER;
  v_pl_reason TEXT;
BEGIN
  IF v_admin_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_admin_id AND role = 'admin') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_admin');
  END IF;

  IF p_amount = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'zero_amount');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'profile_not_found');
  END IF;

  v_pl_reason := 'admin_grant:' || COALESCE(p_reason, 'manual');

  -- Dual-write: legacy points_ledger + new transactions (Phase 2 mirror)
  INSERT INTO public.points_ledger (user_id, amount, reason)
  VALUES (p_user_id, p_amount, v_pl_reason);

  IF p_amount > 0 THEN
    INSERT INTO public.transactions (
      user_id, category, asset_in, asset_in_amount, description, metadata,
      status, triggered_by, completed_at
    ) VALUES (
      p_user_id, 'admin_adjustment', 'ARIA', p_amount,
      'Admin grant +' || p_amount || ' ARIA · ' || COALESCE(p_reason,'manual'),
      jsonb_build_object('dual_write_phase','2','admin_id', v_admin_id,'reason_label', p_reason) || p_metadata,
      'completed', v_admin_id, NOW()
    );
  ELSE
    INSERT INTO public.transactions (
      user_id, category, asset_out, asset_out_amount, description, metadata,
      status, triggered_by, completed_at
    ) VALUES (
      p_user_id, 'admin_adjustment', 'ARIA', ABS(p_amount),
      'Admin clawback ' || p_amount || ' ARIA · ' || COALESCE(p_reason,'manual'),
      jsonb_build_object('dual_write_phase','2','admin_id', v_admin_id,'reason_label', p_reason) || p_metadata,
      'completed', v_admin_id, NOW()
    );
  END IF;

  UPDATE public.profiles
  SET total_points = COALESCE(total_points, 0) + p_amount
  WHERE id = p_user_id
  RETURNING total_points INTO v_new_balance;

  RETURN jsonb_build_object(
    'ok', true,
    'user_id', p_user_id,
    'amount', p_amount,
    'reason', v_pl_reason,
    'new_balance', v_new_balance,
    'admin_id', v_admin_id
  );
END;
$function$;


-- ─────────────────────────────────────────────────────────────────────────────
-- GRANTs preserved + new admin_grant_aria authenticated grant (admin gate inside)
-- ─────────────────────────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.claim_faucet() TO authenticated;
GRANT EXECUTE ON FUNCTION public.do_checkin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.daily_checkin_v2() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_welcome_grant(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_referral(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reward_video_view(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_grant_aria(uuid, integer, text, jsonb) TO authenticated;


COMMENT ON FUNCTION public.claim_faucet IS 'Faucet +100 ARIA daily idempotent · Phase 2 dual-write PL+TX';
COMMENT ON FUNCTION public.do_checkin(uuid) IS 'Daily check-in +1 ARIA + streak bonus · Phase 2 dual-write PL+TX';
COMMENT ON FUNCTION public.daily_checkin_v2 IS 'Weekly check-in v2 +50 ARIA + 1 ROBI 7/7 · Phase 2 dual-write PL+TX (ARIA) + nft_rewards mirror to TX (ROBI)';
COMMENT ON FUNCTION public.claim_welcome_grant(uuid) IS 'Welcome grant +100 ARIA + 5 ROBI + ALPHA_LIVE badge · Phase 2 dual-write PL+TX (ARIA) + nft_rewards mirror to TX (ROBI/badge)';
COMMENT ON FUNCTION public.confirm_referral(uuid, text) IS 'Referral confirm +10/+15 ARIA · device limit 3 · Phase 2 dual-write PL+TX';
COMMENT ON FUNCTION public.reward_video_view(uuid, integer) IS 'Video view +1 ARIA · 5/gg cap · Phase 2 dual-write PL+TX';
COMMENT ON FUNCTION public.admin_grant_aria(uuid, integer, text, jsonb) IS 'NEW Phase 2 · admin-only grant/clawback ARIA · dual-write PL+TX · replaces manual SQL pattern';
