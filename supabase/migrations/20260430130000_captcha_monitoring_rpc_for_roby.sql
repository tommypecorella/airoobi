-- ════════════════════════════════════════════════════════════════════
-- Captcha monitoring RPC per ROBY M1·W1 daily check
-- TECH-HARDEN-001 · Sprint W1 · Day 4 · 30 Apr 2026
--
-- ROBY auto-task (in ROBY_Reply_Phase1_Approval): daily query del
-- captcha_failed rate durante Alpha Brave M1·W1 (primi 7gg da 4 Mag).
-- Threshold 5% → alert CCP via SSH per investigation.
--
-- Questa RPC espone la metrica come single call view-only.
-- Richiede event log 'signup_rejected_captcha_failed' instrumentato
-- in signup-guard edge function (deploy parallelo).
-- ════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_captcha_failed_rate_24h()
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total          INT;
  v_captcha_fail   INT;
  v_fail_rate_pct  NUMERIC;
  v_threshold_pct  NUMERIC := 5.0;
BEGIN
  SELECT COUNT(*) INTO v_total FROM signup_attempts
   WHERE created_at > NOW() - INTERVAL '24 hours';

  SELECT COUNT(*) INTO v_captcha_fail FROM events
   WHERE event = 'signup_rejected_captcha_failed'
     AND created_at > NOW() - INTERVAL '24 hours';

  v_fail_rate_pct := CASE
    WHEN v_total > 0 THEN ROUND((v_captcha_fail::NUMERIC / v_total * 100), 2)
    ELSE 0
  END;

  RETURN jsonb_build_object(
    'window', '24h',
    'queried_at', NOW(),
    'total_signups_24h', v_total,
    'captcha_failed_24h', v_captcha_fail,
    'fail_rate_pct', v_fail_rate_pct,
    'alert_threshold_pct', v_threshold_pct,
    'alert_triggered', v_fail_rate_pct > v_threshold_pct,
    'recommendation', CASE
      WHEN v_total = 0 THEN 'no signups in window — check user inflow before alerting'
      WHEN v_fail_rate_pct > v_threshold_pct THEN 'ALERT CCP via SSH — investigate Turnstile config + Cloudflare dashboard'
      ELSE 'within normal range'
    END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_captcha_failed_rate_24h() TO authenticated, service_role;
