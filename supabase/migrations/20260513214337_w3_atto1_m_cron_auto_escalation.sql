-- ============================================================================
-- Sprint W3 · Atto 1 · Cron auto-escalation + expired swaps cleanup
-- ============================================================================
-- Decision #15: Auto-escalation 24h post-SLA admin reminder + 72h+ courtesy refund 50 ARIA
--
-- 2 cron jobs:
-- 1. auto_escalate_evaluation_requests() · hourly · admin reminder + courtesy refund
-- 2. cleanup_expired_token_swaps() · every 2 min · mark expired pending swaps
--
-- pg_cron 1.6.4 confirmed installed (CCP verified 13 May 2026 night).
-- ============================================================================

-- ============================================================================
-- 1. auto_escalate_evaluation_requests · scans pending requests · escalates per decision #15
-- ============================================================================
CREATE OR REPLACE FUNCTION public.auto_escalate_evaluation_requests()
RETURNS TABLE (reminded_count INTEGER, refunded_count INTEGER, refunded_aria_total INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reminded_count INTEGER := 0;
  v_refunded_count INTEGER := 0;
  v_refunded_aria_total INTEGER := 0;
  v_courtesy_refund_aria INTEGER := 50;
  r RECORD;
BEGIN
  -- Pass 1: 24h post-SLA reminder
  FOR r IN
    SELECT id, seller_id, sla_deadline
    FROM public.evaluation_requests
    WHERE status IN ('submitted','under_review')
      AND escalation_status = 'none'
      AND NOW() > sla_deadline + INTERVAL '24 hours'
    FOR UPDATE
  LOOP
    UPDATE public.evaluation_requests
    SET escalation_status = 'reminded_24h', reminded_at = NOW()
    WHERE id = r.id;

    -- Log notification (admin in-app · email tier critico TBD when Postmark configured)
    INSERT INTO public.notifications (user_id, type, title, body, data)
    SELECT
      p.id, 'admin_evaluation_reminder',
      'Valutazione in ritardo',
      'Valutazione ' || r.id || ' · SLA scaduta da 24h',
      jsonb_build_object('evaluation_request_id', r.id, 'seller_id', r.seller_id, 'sla_deadline', r.sla_deadline)
    FROM public.profiles p
    WHERE EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin');

    v_reminded_count := v_reminded_count + 1;
  END LOOP;

  -- Pass 2: 72h post-SLA courtesy refund 50 ARIA
  FOR r IN
    SELECT id, seller_id, sla_deadline
    FROM public.evaluation_requests
    WHERE status IN ('submitted','under_review')
      AND escalation_status = 'reminded_24h'
      AND NOW() > sla_deadline + INTERVAL '72 hours'
    FOR UPDATE
  LOOP
    -- Mark refund processed
    UPDATE public.evaluation_requests
    SET
      escalation_status = 'refunded_72h',
      refunded_courtesy_at = NOW(),
      refunded_courtesy_aria = v_courtesy_refund_aria,
      payment_status = 'refunded_courtesy'
    WHERE id = r.id;

    -- Credit 50 ARIA back to seller (transactions + profiles.total_points)
    UPDATE public.profiles
    SET total_points = total_points + v_courtesy_refund_aria
    WHERE id = r.seller_id;

    INSERT INTO public.transactions (
      user_id, category, asset_in, asset_in_amount,
      related_evaluation_request_id,
      description, metadata, status, triggered_by, completed_at
    ) VALUES (
      r.seller_id, 'evaluation_courtesy_refund', 'ARIA', v_courtesy_refund_aria,
      r.id,
      'Refund di cortesia 50 ARIA · SLA superata di 72h · valutazione ' || r.id,
      jsonb_build_object(
        'sla_deadline', r.sla_deadline,
        'refunded_at', NOW(),
        'reason', 'sla_breach_72h_courtesy'
      ),
      'completed', NULL, NOW()
    );

    -- Notify seller
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      r.seller_id, 'evaluation_courtesy_refund',
      '50 ARIA di cortesia accreditati',
      'La tua valutazione è in ritardo · ti accreditiamo 50 ARIA di cortesia · grazie per la pazienza',
      jsonb_build_object('evaluation_request_id', r.id, 'refunded_aria', v_courtesy_refund_aria)
    );

    v_refunded_count := v_refunded_count + 1;
    v_refunded_aria_total := v_refunded_aria_total + v_courtesy_refund_aria;
  END LOOP;

  RETURN QUERY SELECT v_reminded_count, v_refunded_count, v_refunded_aria_total;
END;
$$;

COMMENT ON FUNCTION public.auto_escalate_evaluation_requests IS 'Hourly cron job · scans pending evaluation_requests · escalates per decision #15 · 24h reminder admin + 72h courtesy refund 50 ARIA seller.';

-- ============================================================================
-- 2. cleanup_expired_token_swaps · scans pending swaps · marks expired
-- ============================================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_token_swaps()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  UPDATE public.token_swaps
  SET status = 'expired', cancelled_reason = 'expired_no_execute'
  WHERE status = 'pending'
    AND NOW() >= expires_at;

  GET DIAGNOSTICS v_expired_count = ROW_COUNT;

  RETURN v_expired_count;
END;
$$;

COMMENT ON FUNCTION public.cleanup_expired_token_swaps IS '2-min cron job · marks pending swaps past expires_at as expired · prevents stale UI display.';

-- ============================================================================
-- 3. pg_cron schedules
-- ============================================================================
-- Hourly evaluation escalation (at minute 5 of every hour)
SELECT cron.schedule(
  'w3-atto1-evaluation-escalation',
  '5 * * * *',
  $$SELECT public.auto_escalate_evaluation_requests();$$
);

-- Expired swap cleanup every 2 minutes
SELECT cron.schedule(
  'w3-atto1-cleanup-expired-swaps',
  '*/2 * * * *',
  $$SELECT public.cleanup_expired_token_swaps();$$
);
