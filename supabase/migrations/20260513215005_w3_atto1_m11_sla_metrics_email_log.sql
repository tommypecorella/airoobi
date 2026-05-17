-- Sprint W3 · Atto 1 · M11 + M13 · SLA metrics materialized view + email send log + cron refresh

CREATE MATERIALIZED VIEW IF NOT EXISTS public.sla_metrics_30d AS
SELECT
  COUNT(*) AS total_evaluated_30d,
  COALESCE(AVG(EXTRACT(EPOCH FROM (decided_at - created_at)) / 3600), 0) AS avg_response_hours,
  COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (decided_at - created_at)) / 3600), 0) AS median_response_hours,
  CASE WHEN COUNT(*) > 0
       THEN (COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (decided_at - created_at)) / 3600 <= 48)) * 100.0 / COUNT(*)
       ELSE 0
  END AS pct_under_48h,
  CASE WHEN COUNT(*) > 0
       THEN (COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (decided_at - created_at)) / 3600 <= 24)) * 100.0 / COUNT(*)
       ELSE 0
  END AS pct_under_24h,
  COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (decided_at - created_at)) / 3600 <= 12) AS bucket_0_12h,
  COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (decided_at - created_at)) / 3600 > 12 AND EXTRACT(EPOCH FROM (decided_at - created_at)) / 3600 <= 24) AS bucket_12_24h,
  COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (decided_at - created_at)) / 3600 > 24 AND EXTRACT(EPOCH FROM (decided_at - created_at)) / 3600 <= 36) AS bucket_24_36h,
  COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (decided_at - created_at)) / 3600 > 36 AND EXTRACT(EPOCH FROM (decided_at - created_at)) / 3600 <= 48) AS bucket_36_48h,
  COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (decided_at - created_at)) / 3600 > 48) AS bucket_over_48h,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE AND decided_at IS NOT NULL) AS evaluated_today,
  COUNT(*) FILTER (WHERE status IN ('submitted','under_review')) AS in_queue_now,
  NOW() AS refreshed_at
FROM public.evaluation_requests
WHERE decided_at IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days';

CREATE UNIQUE INDEX IF NOT EXISTS idx_sla_metrics_30d_refreshed ON public.sla_metrics_30d(refreshed_at);

GRANT SELECT ON public.sla_metrics_30d TO authenticated;
GRANT SELECT ON public.sla_metrics_30d TO anon;

COMMENT ON MATERIALIZED VIEW public.sla_metrics_30d IS 'Aggregated SLA metrics on 30-day rolling window · refreshed every 5 min via pg_cron. Public-readable for /sla dashboard transparency.';

CREATE OR REPLACE FUNCTION public.get_sla_metrics_public()
RETURNS TABLE (
  total_evaluated_30d BIGINT,
  avg_response_hours NUMERIC,
  median_response_hours NUMERIC,
  pct_under_48h NUMERIC,
  pct_under_24h NUMERIC,
  bucket_0_12h BIGINT,
  bucket_12_24h BIGINT,
  bucket_24_36h BIGINT,
  bucket_36_48h BIGINT,
  bucket_over_48h BIGINT,
  evaluated_today BIGINT,
  in_queue_now BIGINT,
  refreshed_at TIMESTAMPTZ
)
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT * FROM public.sla_metrics_30d LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_sla_metrics_public() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sla_metrics_public() TO anon;

CREATE TABLE IF NOT EXISTS public.email_send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  template TEXT NOT NULL,
  send_status TEXT NOT NULL CHECK (send_status IN ('sent','failed','skipped_cap','queued')),
  postmark_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_log_date ON public.email_send_log(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_status ON public.email_send_log(send_status, sent_at);

ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can read email log" ON public.email_send_log FOR SELECT TO authenticated USING (public.is_admin());

CREATE OR REPLACE VIEW public.email_count_today AS
SELECT COUNT(*) FILTER (WHERE send_status = 'sent') AS sent_today
FROM public.email_send_log
WHERE sent_at >= CURRENT_DATE AND sent_at < CURRENT_DATE + INTERVAL '1 day';

GRANT SELECT ON public.email_send_log TO authenticated;
GRANT SELECT ON public.email_count_today TO authenticated;

SELECT cron.schedule(
  'w3-atto1-refresh-sla-metrics',
  '*/5 * * * *',
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY public.sla_metrics_30d;$$
);

REFRESH MATERIALIZED VIEW public.sla_metrics_30d;
