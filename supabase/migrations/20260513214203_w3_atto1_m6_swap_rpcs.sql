-- ============================================================================
-- Sprint W3 · Atto 1 · Migration M6
-- 4 swap prepare RPCs + 1 swap_execute RPC + ALTER profiles kas_balance + ALTER nft_rewards burned
-- ============================================================================
-- Decision #7: KAS↔ARIA · ROBI→ARIA · ROBI→KAS (ROBI non-comprabile)
-- Decision #19: snapshot + 60s lock (2-phase prepare/execute pattern)
--
-- Pattern:
-- 1. User UI calls swap_prepare_*() → snapshot rate · INSERT pending swap · return preview
-- 2. User reviews · clicks confirm within 60s
-- 3. UI calls swap_execute(swap_id) → debit from + credit to + audit + complete
-- 4. Expired pending swaps auto-marked at execute attempt
--
-- KAS rate must be set (treasury_stats.kas_eur_rate) for KAS swaps to work.
-- ROBI burned via nft_rewards.burned flag (ALTER added here).
-- ARIA price fixed €0.10 (decisione lockata da tempo nella tokenomics)
-- ============================================================================

-- 1. ALTER profiles: add kas_balance
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS kas_balance NUMERIC(20,8) NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.profiles.kas_balance IS 'AIROOBI proxy wallet KAS balance · Stage 1 alpha DB-tracked · Stage 2 on-chain Kaspa mapped 1:1 via wallet bridge.';

-- 2. ALTER nft_rewards: add burned flag for ROBI burn semantics
ALTER TABLE public.nft_rewards
  ADD COLUMN IF NOT EXISTS burned BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS burned_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_nft_rewards_user_active ON public.nft_rewards(user_id, nft_type) WHERE burned = FALSE;

COMMENT ON COLUMN public.nft_rewards.burned IS 'Soft-delete flag for ROBI consumed via swap_execute · keeps history while removing from active balance.';

-- 3. Helper: current ROBI balance (count non-burned REWARD rows)
CREATE OR REPLACE FUNCTION public.get_user_robi_balance(p_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.nft_rewards
  WHERE user_id = p_user_id
    AND nft_type = 'REWARD'
    AND burned = FALSE;
$$;

COMMENT ON FUNCTION public.get_user_robi_balance IS 'Returns active (non-burned) ROBI count for user · used by swap prepare RPCs balance check.';

GRANT EXECUTE ON FUNCTION public.get_user_robi_balance(UUID) TO authenticated;

-- 4. Constant: ARIA_EUR_RATE = 0.10 (treasury-fixed)
-- Inlined in RPCs since it's a hardcoded peg, not an oracle.

-- ============================================================================
-- 5. swap_prepare_kas_to_aria
-- ============================================================================
CREATE OR REPLACE FUNCTION public.swap_prepare_kas_to_aria(p_kas_amount NUMERIC)
RETURNS TABLE (swap_id UUID, exchange_rate NUMERIC, to_amount NUMERIC, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_kas_balance NUMERIC;
  v_kas_rate NUMERIC;
  v_aria_amount NUMERIC;
  v_swap_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'swap_prepare_kas_to_aria: not authenticated' USING ERRCODE = '42501';
  END IF;

  IF p_kas_amount <= 0 THEN
    RAISE EXCEPTION 'swap_prepare_kas_to_aria: amount must be > 0' USING ERRCODE = '22023';
  END IF;

  SELECT kas_balance INTO v_kas_balance FROM public.profiles WHERE id = v_user_id FOR UPDATE;
  IF v_kas_balance < p_kas_amount THEN
    RAISE EXCEPTION 'swap_prepare_kas_to_aria: insufficient KAS · have %, need %', v_kas_balance, p_kas_amount USING ERRCODE = '22023';
  END IF;

  v_kas_rate := public.get_kas_eur_rate();
  IF v_kas_rate IS NULL OR v_kas_rate <= 0 THEN
    RAISE EXCEPTION 'swap_prepare_kas_to_aria: KAS rate not configured · admin must set treasury_stats.kas_eur_rate' USING ERRCODE = '22023';
  END IF;

  -- ARIA price fixed €0.10 → aria = (kas * kas_eur_rate) / 0.10 = kas * kas_eur_rate * 10
  v_aria_amount := (p_kas_amount * v_kas_rate) / 0.10;
  v_expires_at := NOW() + INTERVAL '60 seconds';

  INSERT INTO public.token_swaps (
    user_id, from_token, to_token, from_amount, to_amount, exchange_rate, expires_at
  ) VALUES (
    v_user_id, 'KAS', 'ARIA', p_kas_amount, v_aria_amount, v_kas_rate, v_expires_at
  ) RETURNING id INTO v_swap_id;

  RETURN QUERY SELECT v_swap_id, v_kas_rate, v_aria_amount, v_expires_at;
END;
$$;

COMMENT ON FUNCTION public.swap_prepare_kas_to_aria IS 'Phase 1: snapshot KAS→ARIA rate + 60s lock · INSERT pending swap. Phase 2 via swap_execute(swap_id).';

-- ============================================================================
-- 6. swap_prepare_aria_to_kas
-- ============================================================================
CREATE OR REPLACE FUNCTION public.swap_prepare_aria_to_kas(p_aria_amount INTEGER)
RETURNS TABLE (swap_id UUID, exchange_rate NUMERIC, to_amount NUMERIC, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_aria_balance INTEGER;
  v_kas_rate NUMERIC;
  v_kas_amount NUMERIC;
  v_swap_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'swap_prepare_aria_to_kas: not authenticated' USING ERRCODE = '42501';
  END IF;

  IF p_aria_amount <= 0 THEN
    RAISE EXCEPTION 'swap_prepare_aria_to_kas: amount must be > 0' USING ERRCODE = '22023';
  END IF;

  SELECT total_points INTO v_aria_balance FROM public.profiles WHERE id = v_user_id FOR UPDATE;
  IF v_aria_balance < p_aria_amount THEN
    RAISE EXCEPTION 'swap_prepare_aria_to_kas: insufficient ARIA · have %, need %', v_aria_balance, p_aria_amount USING ERRCODE = '22023';
  END IF;

  v_kas_rate := public.get_kas_eur_rate();
  IF v_kas_rate IS NULL OR v_kas_rate <= 0 THEN
    RAISE EXCEPTION 'swap_prepare_aria_to_kas: KAS rate not configured' USING ERRCODE = '22023';
  END IF;

  -- kas = (aria * 0.10) / kas_eur_rate
  v_kas_amount := (p_aria_amount::NUMERIC * 0.10) / v_kas_rate;
  v_expires_at := NOW() + INTERVAL '60 seconds';

  INSERT INTO public.token_swaps (
    user_id, from_token, to_token, from_amount, to_amount, exchange_rate, expires_at
  ) VALUES (
    v_user_id, 'ARIA', 'KAS', p_aria_amount, v_kas_amount, v_kas_rate, v_expires_at
  ) RETURNING id INTO v_swap_id;

  RETURN QUERY SELECT v_swap_id, v_kas_rate, v_kas_amount, v_expires_at;
END;
$$;

COMMENT ON FUNCTION public.swap_prepare_aria_to_kas IS 'Phase 1: snapshot ARIA→KAS rate + 60s lock.';

-- ============================================================================
-- 7. swap_prepare_robi_to_aria
-- ============================================================================
CREATE OR REPLACE FUNCTION public.swap_prepare_robi_to_aria(p_robi_amount INTEGER)
RETURNS TABLE (swap_id UUID, exchange_rate NUMERIC, to_amount NUMERIC, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_robi_balance INTEGER;
  v_robi_rate NUMERIC;
  v_aria_amount NUMERIC;
  v_swap_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'swap_prepare_robi_to_aria: not authenticated' USING ERRCODE = '42501';
  END IF;

  IF p_robi_amount <= 0 THEN
    RAISE EXCEPTION 'swap_prepare_robi_to_aria: amount must be > 0' USING ERRCODE = '22023';
  END IF;

  v_robi_balance := public.get_user_robi_balance(v_user_id);
  IF v_robi_balance < p_robi_amount THEN
    RAISE EXCEPTION 'swap_prepare_robi_to_aria: insufficient ROBI · have %, need %', v_robi_balance, p_robi_amount USING ERRCODE = '22023';
  END IF;

  v_robi_rate := public.get_robi_rate_eur();
  IF v_robi_rate <= 0 THEN
    RAISE EXCEPTION 'swap_prepare_robi_to_aria: ROBI rate is 0 · treasury insufficient' USING ERRCODE = '22023';
  END IF;

  -- aria = (robi * robi_eur_rate) / 0.10
  v_aria_amount := (p_robi_amount::NUMERIC * v_robi_rate) / 0.10;
  v_expires_at := NOW() + INTERVAL '60 seconds';

  INSERT INTO public.token_swaps (
    user_id, from_token, to_token, from_amount, to_amount, exchange_rate, expires_at
  ) VALUES (
    v_user_id, 'ROBI', 'ARIA', p_robi_amount, v_aria_amount, v_robi_rate, v_expires_at
  ) RETURNING id INTO v_swap_id;

  RETURN QUERY SELECT v_swap_id, v_robi_rate, v_aria_amount, v_expires_at;
END;
$$;

COMMENT ON FUNCTION public.swap_prepare_robi_to_aria IS 'Phase 1: snapshot ROBI→ARIA rate + 60s lock. ROBI rate from treasury_stats (decision Skeezu 13 May).';

-- ============================================================================
-- 8. swap_prepare_robi_to_kas
-- ============================================================================
CREATE OR REPLACE FUNCTION public.swap_prepare_robi_to_kas(p_robi_amount INTEGER)
RETURNS TABLE (swap_id UUID, exchange_rate NUMERIC, to_amount NUMERIC, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_robi_balance INTEGER;
  v_robi_rate NUMERIC;
  v_kas_rate NUMERIC;
  v_kas_amount NUMERIC;
  v_composite_rate NUMERIC;
  v_swap_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'swap_prepare_robi_to_kas: not authenticated' USING ERRCODE = '42501';
  END IF;

  IF p_robi_amount <= 0 THEN
    RAISE EXCEPTION 'swap_prepare_robi_to_kas: amount must be > 0' USING ERRCODE = '22023';
  END IF;

  v_robi_balance := public.get_user_robi_balance(v_user_id);
  IF v_robi_balance < p_robi_amount THEN
    RAISE EXCEPTION 'swap_prepare_robi_to_kas: insufficient ROBI · have %, need %', v_robi_balance, p_robi_amount USING ERRCODE = '22023';
  END IF;

  v_robi_rate := public.get_robi_rate_eur();
  v_kas_rate := public.get_kas_eur_rate();
  IF v_robi_rate <= 0 THEN
    RAISE EXCEPTION 'swap_prepare_robi_to_kas: ROBI rate is 0' USING ERRCODE = '22023';
  END IF;
  IF v_kas_rate IS NULL OR v_kas_rate <= 0 THEN
    RAISE EXCEPTION 'swap_prepare_robi_to_kas: KAS rate not configured' USING ERRCODE = '22023';
  END IF;

  -- kas = (robi * robi_eur_rate) / kas_eur_rate
  v_kas_amount := (p_robi_amount::NUMERIC * v_robi_rate) / v_kas_rate;
  -- Composite rate stored for audit (ROBI/KAS effective)
  v_composite_rate := v_robi_rate / v_kas_rate;
  v_expires_at := NOW() + INTERVAL '60 seconds';

  INSERT INTO public.token_swaps (
    user_id, from_token, to_token, from_amount, to_amount, exchange_rate, expires_at
  ) VALUES (
    v_user_id, 'ROBI', 'KAS', p_robi_amount, v_kas_amount, v_composite_rate, v_expires_at
  ) RETURNING id INTO v_swap_id;

  RETURN QUERY SELECT v_swap_id, v_composite_rate, v_kas_amount, v_expires_at;
END;
$$;

COMMENT ON FUNCTION public.swap_prepare_robi_to_kas IS 'Phase 1: snapshot ROBI→KAS composite rate (robi_eur/kas_eur) + 60s lock.';

-- ============================================================================
-- 9. swap_execute · phase 2 · debit from_token + credit to_token + audit
-- ============================================================================
CREATE OR REPLACE FUNCTION public.swap_execute(p_swap_id UUID)
RETURNS TABLE (status TEXT, from_token TEXT, to_token TEXT, from_amount NUMERIC, to_amount NUMERIC, settled_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_swap RECORD;
  v_burn_count INTEGER;
  v_settled_at TIMESTAMPTZ;
  v_tx_category TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'swap_execute: not authenticated' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_swap FROM public.token_swaps WHERE id = p_swap_id FOR UPDATE;

  IF v_swap.id IS NULL THEN
    RAISE EXCEPTION 'swap_execute: swap % not found', p_swap_id USING ERRCODE = '23503';
  END IF;

  IF v_swap.user_id != v_user_id THEN
    RAISE EXCEPTION 'swap_execute: caller does not own swap %', p_swap_id USING ERRCODE = '42501';
  END IF;

  IF v_swap.status != 'pending' THEN
    RAISE EXCEPTION 'swap_execute: swap status is %, expected pending', v_swap.status USING ERRCODE = '22023';
  END IF;

  IF NOW() >= v_swap.expires_at THEN
    UPDATE public.token_swaps SET status = 'expired', cancelled_reason = 'execute_past_expires' WHERE id = p_swap_id;
    RAISE EXCEPTION 'swap_execute: swap expired (%, NOW=%)', v_swap.expires_at, NOW() USING ERRCODE = '22023';
  END IF;

  v_settled_at := NOW();
  v_tx_category := 'swap_' || LOWER(v_swap.from_token) || '_to_' || LOWER(v_swap.to_token);

  -- DEBIT from_token
  CASE v_swap.from_token
    WHEN 'KAS' THEN
      UPDATE public.profiles SET kas_balance = kas_balance - v_swap.from_amount WHERE id = v_user_id;
    WHEN 'ARIA' THEN
      UPDATE public.profiles SET total_points = total_points - v_swap.from_amount::INTEGER WHERE id = v_user_id;
    WHEN 'ROBI' THEN
      -- Burn N oldest non-burned REWARD nft_rewards rows
      WITH to_burn AS (
        SELECT id FROM public.nft_rewards
        WHERE user_id = v_user_id AND nft_type = 'REWARD' AND burned = FALSE
        ORDER BY created_at ASC
        LIMIT v_swap.from_amount::INTEGER
        FOR UPDATE
      )
      UPDATE public.nft_rewards SET burned = TRUE, burned_at = v_settled_at
      WHERE id IN (SELECT id FROM to_burn);
      GET DIAGNOSTICS v_burn_count = ROW_COUNT;
      IF v_burn_count != v_swap.from_amount::INTEGER THEN
        RAISE EXCEPTION 'swap_execute: ROBI burn mismatch · expected %, burned %', v_swap.from_amount::INTEGER, v_burn_count USING ERRCODE = '22023';
      END IF;
  END CASE;

  -- CREDIT to_token
  CASE v_swap.to_token
    WHEN 'KAS' THEN
      UPDATE public.profiles SET kas_balance = kas_balance + v_swap.to_amount WHERE id = v_user_id;
    WHEN 'ARIA' THEN
      UPDATE public.profiles SET total_points = total_points + v_swap.to_amount::INTEGER WHERE id = v_user_id;
  END CASE;

  -- Audit transaction row
  INSERT INTO public.transactions (
    user_id, category, asset_out, asset_out_amount, asset_in, asset_in_amount,
    related_swap_id,
    description, metadata, status, triggered_by, completed_at
  ) VALUES (
    v_user_id, v_tx_category::TEXT,
    v_swap.from_token, v_swap.from_amount,
    v_swap.to_token, v_swap.to_amount,
    p_swap_id,
    'Swap ' || v_swap.from_token || ' → ' || v_swap.to_token,
    jsonb_build_object(
      'exchange_rate', v_swap.exchange_rate,
      'snapshot_at', v_swap.created_at,
      'expired_at', v_swap.expires_at,
      'executed_at', v_settled_at
    ),
    'completed', v_user_id, v_settled_at
  );

  -- Mark swap completed
  UPDATE public.token_swaps SET status = 'completed', completed_at = v_settled_at WHERE id = p_swap_id;

  RETURN QUERY SELECT 'completed'::TEXT, v_swap.from_token, v_swap.to_token, v_swap.from_amount, v_swap.to_amount, v_settled_at;
END;
$$;

COMMENT ON FUNCTION public.swap_execute IS 'Phase 2: validate pending swap + debit from_token + credit to_token + audit transactions + complete. Atomic via FOR UPDATE row lock · ROBI burn via nft_rewards.burned flag oldest-first FIFO.';

-- ============================================================================
-- 10. GRANTs
-- ============================================================================
GRANT EXECUTE ON FUNCTION public.swap_prepare_kas_to_aria(NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.swap_prepare_aria_to_kas(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.swap_prepare_robi_to_aria(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.swap_prepare_robi_to_kas(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.swap_execute(UUID) TO authenticated;
