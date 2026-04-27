-- ════════════════════════════════════════════════════════════════════
-- Hole #1 Layer C — phone-KYC scaffold con BYPASS_PHONE_VERIFY default
-- TECH-HARDEN-001 · Sprint W1 · Day 2 · 27 Apr 2026
--
-- Pre-scaffold mentre Skeezu prepara Twilio account.
-- Schema + RPC update + config flag bypass=true di default → no behavior change live.
-- Quando Twilio secrets arrivano, basta:
--   UPDATE airdrop_config SET value='false' WHERE key='phone_verify_bypass_enabled';
--   supabase functions deploy phone-verify-init phone-verify-confirm
-- ════════════════════════════════════════════════════════════════════

-- ── 1. Schema profiles: phone columns ──────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_e164         TEXT,
  ADD COLUMN IF NOT EXISTS phone_verified_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS phone_country_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_profiles_phone_e164
  ON public.profiles (phone_e164) WHERE phone_e164 IS NOT NULL;

-- ── 2. Config flag bypass + Twilio rate-limit ──────────────────────
INSERT INTO public.airdrop_config (key, value, description) VALUES
  ('phone_verify_bypass_enabled', 'true',
   'Layer C bypass flag: true=skip phone verify (default fino a Twilio account). false=enforce.'),
  ('phone_verify_max_attempts_24h', '3',
   'Max tentativi verify per stesso phone_e164 in 24h (anti-abuse Twilio cost)')
ON CONFLICT (key) DO NOTHING;

-- ── 3. Phone verification attempts table (anti-abuse) ──────────────
CREATE TABLE IF NOT EXISTS public.phone_verification_attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_e164   TEXT NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('pending','approved','rejected','expired')),
  twilio_sid   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_pva_user_time  ON public.phone_verification_attempts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pva_phone_time ON public.phone_verification_attempts (phone_e164, created_at DESC);

ALTER TABLE public.phone_verification_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users see own phone attempts" ON public.phone_verification_attempts;
CREATE POLICY "users see own phone attempts" ON public.phone_verification_attempts
  FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "service role write phone attempts" ON public.phone_verification_attempts;
CREATE POLICY "service role write phone attempts" ON public.phone_verification_attempts
  FOR ALL USING (auth.role() = 'service_role');

-- ── 4. claim_welcome_grant updated con phone gate (rispetta bypass flag) ─
CREATE OR REPLACE FUNCTION public.claim_welcome_grant(p_user_id UUID DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.points_ledger
     WHERE user_id = v_user_id AND reason = 'alphanet_welcome'
  ) INTO v_already;
  IF v_already THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_claimed');
  END IF;

  -- Phone verify gate (rispetta bypass flag)
  SELECT COALESCE(value, 'true') INTO v_bypass
    FROM public.airdrop_config WHERE key = 'phone_verify_bypass_enabled';

  IF v_bypass <> 'true' THEN
    SELECT phone_verified_at INTO v_phone_verified FROM public.profiles WHERE id = v_user_id;
    IF v_phone_verified IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'phone_not_verified');
    END IF;
  END IF;

  SELECT COALESCE(value::INT, 1000) INTO v_threshold
    FROM public.airdrop_config WHERE key = 'welcome_threshold_users';
  SELECT COALESCE(value::INT, 1000) INTO v_aria_full
    FROM public.airdrop_config WHERE key = 'welcome_grant_aria_full';
  SELECT COALESCE(value::INT, 300) INTO v_aria_reduced
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

  INSERT INTO public.points_ledger (user_id, amount, reason, created_at)
  VALUES (v_user_id, v_aria_amount, 'alphanet_welcome', NOW());

  UPDATE public.profiles
     SET total_points = COALESCE(total_points, 0) + v_aria_amount
   WHERE id = v_user_id;

  INSERT INTO public.nft_rewards (user_id, nft_type, name, source, shares, metadata, created_at)
  VALUES (v_user_id, 'ROBI', 'Alpha-Net welcome grant', 'alphanet_welcome', v_robi_amount,
          jsonb_build_object('alpha_phase','alphanet_launch','scale', v_scale,
                             'user_rank', v_user_count + 1, 'granted_at', NOW()), NOW());

  RETURN jsonb_build_object(
    'ok', true,
    'aria', v_aria_amount,
    'robi', v_robi_amount,
    'scale', v_scale,
    'user_rank', v_user_count + 1,
    'phone_gate', v_bypass <> 'true'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_welcome_grant(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_welcome_grant(UUID) TO service_role;
