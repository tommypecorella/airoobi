-- ════════════════════════════════════════════════════════════════════
-- Hole #1 · Sybil resistance — Layer A (rate limit IP/device/email-alias)
-- TECH-HARDEN-001 · Sprint W1 · 27 Apr 2026
--
-- Tabella signup_attempts: traccia tentativi di registrazione per
-- IP-hash, device fingerprint, email_local (anti Gmail-alias), UA-hash.
-- Usata dall'edge function signup-guard per applicare le soglie:
--   - same ip_hash 24h > 3      → soft (captcha mandatory)
--   - same ip_hash 24h > 5      → hard (rifiuto)
--   - same device_fp 24h > 2    → hard
--   - same email_local > 1      → hard (Gmail-alias trick)
--   - same ua_hash 1h > 3       → soft (captcha)
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.signup_attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash      TEXT NOT NULL,
  device_fp    TEXT,
  email_hash   TEXT NOT NULL,
  email_local  TEXT,
  ua_hash      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status       TEXT NOT NULL CHECK (status IN ('attempted','completed','rejected'))
);

CREATE INDEX IF NOT EXISTS idx_sa_ip_time     ON public.signup_attempts (ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sa_device_time ON public.signup_attempts (device_fp, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sa_email_local ON public.signup_attempts (email_local);
CREATE INDEX IF NOT EXISTS idx_sa_ua_time     ON public.signup_attempts (ua_hash, created_at DESC);

ALTER TABLE public.signup_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service role only" ON public.signup_attempts;
CREATE POLICY "service role only" ON public.signup_attempts FOR ALL USING (false);

-- ── Helper RPC: count_signup_attempts ───────────────────────────────
-- Restituisce i 5 conteggi che servono all'edge function.
CREATE OR REPLACE FUNCTION public.count_signup_attempts(
  p_ip_hash      TEXT,
  p_device_fp    TEXT,
  p_email_local  TEXT,
  p_ua_hash      TEXT
) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_ip_24h        INT;
  v_device_24h    INT;
  v_email_local_seen INT;
  v_ua_1h         INT;
BEGIN
  SELECT COUNT(*) INTO v_ip_24h
    FROM public.signup_attempts
   WHERE ip_hash = p_ip_hash
     AND created_at > NOW() - INTERVAL '24 hours';

  SELECT COUNT(*) INTO v_device_24h
    FROM public.signup_attempts
   WHERE p_device_fp IS NOT NULL
     AND device_fp = p_device_fp
     AND created_at > NOW() - INTERVAL '24 hours';

  SELECT COUNT(*) INTO v_email_local_seen
    FROM public.signup_attempts
   WHERE p_email_local IS NOT NULL
     AND email_local = p_email_local
     AND status IN ('completed','attempted');

  SELECT COUNT(*) INTO v_ua_1h
    FROM public.signup_attempts
   WHERE p_ua_hash IS NOT NULL
     AND ua_hash = p_ua_hash
     AND created_at > NOW() - INTERVAL '1 hour';

  RETURN jsonb_build_object(
    'ip_24h', v_ip_24h,
    'device_24h', v_device_24h,
    'email_local_seen', v_email_local_seen,
    'ua_1h', v_ua_1h
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.count_signup_attempts(TEXT, TEXT, TEXT, TEXT) TO service_role;

-- ── Helper RPC: log_signup_attempt ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.log_signup_attempt(
  p_ip_hash      TEXT,
  p_device_fp    TEXT,
  p_email_hash   TEXT,
  p_email_local  TEXT,
  p_ua_hash      TEXT,
  p_status       TEXT
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF p_status NOT IN ('attempted','completed','rejected') THEN
    p_status := 'attempted';
  END IF;
  INSERT INTO public.signup_attempts (ip_hash, device_fp, email_hash, email_local, ua_hash, status)
  VALUES (p_ip_hash, p_device_fp, p_email_hash, p_email_local, p_ua_hash, p_status)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_signup_attempt(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;

-- ── Threshold config (in airdrop_config per coerenza con altri tunable) ──
INSERT INTO public.airdrop_config (key, value, description) VALUES
  ('sybil_ip_24h_soft',     '3', 'Sybil Layer A: ip_hash 24h soft threshold (captcha)'),
  ('sybil_ip_24h_hard',     '5', 'Sybil Layer A: ip_hash 24h hard threshold (reject)'),
  ('sybil_device_24h_hard', '2', 'Sybil Layer A: device_fp 24h hard threshold'),
  ('sybil_email_local_hard','1', 'Sybil Layer A: email_local repeat hard threshold (Gmail alias)'),
  ('sybil_ua_1h_soft',      '3', 'Sybil Layer A: ua_hash 1h soft threshold (captcha)')
ON CONFLICT (key) DO NOTHING;
