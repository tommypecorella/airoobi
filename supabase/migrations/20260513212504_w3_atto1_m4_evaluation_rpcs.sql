-- ============================================================================
-- Sprint W3 · Atto 1 · Migration M4
-- 3 evaluation flow RPCs · submit + admin_evaluate + re_evaluate
-- ============================================================================
-- All RPCs SECURITY DEFINER with internal authorization:
--   submit_evaluation_request · authenticated seller (own debit)
--   admin_evaluate_request · admin/evaluator only (is_admin_or_evaluator)
--   re_evaluate_evalobi · current_owner of prior_evalobi (own debit)
--
-- Phased dual-write (W3 phase 1):
--   - Write to public.transactions (NEW source of truth)
--   - Update profiles.total_points (cached balance, kept in sync)
--   - DO NOT write to points_ledger (legacy, frozen for new flows)
--
-- ROBI bonus (decision #5 GO outcome only):
--   - Insert row in nft_rewards (nft_type='REWARD', source='evaluation_bonus')
--   - Insert audit row in transactions (asset_in='ROBI', amount=1)
-- ============================================================================

-- ============================================================================
-- 1. submit_evaluation_request · seller submit + auto-debit 200 ARIA
-- ============================================================================
CREATE OR REPLACE FUNCTION public.submit_evaluation_request(
  p_object_title TEXT,
  p_object_brand TEXT,
  p_object_model TEXT,
  p_object_condition TEXT,
  p_object_year INTEGER,
  p_object_category TEXT,
  p_object_photos JSONB,
  p_seller_price_estimate_eur INTEGER,
  p_seller_notes TEXT DEFAULT NULL,
  p_prior_evalobi_id UUID DEFAULT NULL
)
RETURNS TABLE (request_id UUID, paid_aria INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seller_id UUID;
  v_current_balance INTEGER;
  v_request_id UUID;
  v_payment_aria INTEGER := 200;
BEGIN
  v_seller_id := auth.uid();

  IF v_seller_id IS NULL THEN
    RAISE EXCEPTION 'submit_evaluation_request: not authenticated'
      USING ERRCODE = '42501';
  END IF;

  -- Lock profile row + check balance
  SELECT total_points INTO v_current_balance
  FROM public.profiles
  WHERE id = v_seller_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'submit_evaluation_request: profile not found for %', v_seller_id
      USING ERRCODE = '23503';
  END IF;

  IF v_current_balance < v_payment_aria THEN
    RAISE EXCEPTION 'submit_evaluation_request: insufficient ARIA balance · have %, need %', v_current_balance, v_payment_aria
      USING ERRCODE = '22023';
  END IF;

  -- Validate floor €500
  IF p_seller_price_estimate_eur < 500 THEN
    RAISE EXCEPTION 'submit_evaluation_request: floor violation · seller_price_estimate_eur=% min=500', p_seller_price_estimate_eur
      USING ERRCODE = '22023';
  END IF;

  -- If re-eval, validate caller owns prior evalobi
  IF p_prior_evalobi_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.evalobi
      WHERE id = p_prior_evalobi_id AND current_owner_id = v_seller_id
    ) THEN
      RAISE EXCEPTION 'submit_evaluation_request: caller does not own prior_evalobi %', p_prior_evalobi_id
        USING ERRCODE = '42501';
    END IF;
  END IF;

  -- Insert evaluation_request (status submitted, payment_status pending until balance debited)
  INSERT INTO public.evaluation_requests (
    seller_id, object_title, object_brand, object_model, object_condition,
    object_year, object_category, object_photos,
    seller_price_estimate_eur, seller_notes, prior_evalobi_id,
    payment_aria, payment_status, paid_at, status
  ) VALUES (
    v_seller_id, p_object_title, p_object_brand, p_object_model, p_object_condition,
    p_object_year, p_object_category, p_object_photos,
    p_seller_price_estimate_eur, p_seller_notes, p_prior_evalobi_id,
    v_payment_aria, 'paid', NOW(), 'submitted'
  ) RETURNING id INTO v_request_id;

  -- Debit ARIA from cached balance
  UPDATE public.profiles
  SET total_points = total_points - v_payment_aria
  WHERE id = v_seller_id;

  -- Insert transaction row (NEW source of truth)
  INSERT INTO public.transactions (
    user_id, category,
    asset_out, asset_out_amount,
    related_evaluation_request_id,
    description, metadata, status, triggered_by, completed_at
  ) VALUES (
    v_seller_id, 'evaluation_payment',
    'ARIA', v_payment_aria,
    v_request_id,
    'Pagamento valutazione 200 ARIA · oggetto ' || p_object_title,
    jsonb_build_object(
      'seller_price_estimate_eur', p_seller_price_estimate_eur,
      'object_category', p_object_category,
      'is_re_evaluation', (p_prior_evalobi_id IS NOT NULL),
      'prior_evalobi_id', p_prior_evalobi_id
    ),
    'completed', v_seller_id, NOW()
  );

  RETURN QUERY SELECT v_request_id, v_payment_aria;
END;
$$;

COMMENT ON FUNCTION public.submit_evaluation_request IS 'Seller submits object + auto-debit 200 ARIA. Atomic: balance check → insert request → debit profiles.total_points → insert transactions row. Decision #1 (floor €500), #4 (200 ARIA), #20 (re-eval libero via prior_evalobi_id).';

-- ============================================================================
-- 2. admin_evaluate_request · admin decision → mint EVALOBI + optional ROBI bonus
-- ============================================================================
CREATE OR REPLACE FUNCTION public.admin_evaluate_request(
  p_request_id UUID,
  p_outcome TEXT,
  p_price_range JSONB,
  p_reasoning TEXT
)
RETURNS TABLE (evalobi_id UUID, token_id BIGINT, robi_minted BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
  v_req RECORD;
  v_evalobi_id UUID;
  v_token_id BIGINT;
  v_robi_id UUID;
  v_robi_minted BOOLEAN := FALSE;
  v_supersedes_evalobi_id UUID;
BEGIN
  v_admin_id := auth.uid();

  IF NOT public.is_admin_or_evaluator() THEN
    RAISE EXCEPTION 'admin_evaluate_request: caller is not admin or evaluator (auth.uid=%)', v_admin_id
      USING ERRCODE = '42501';
  END IF;

  IF p_outcome NOT IN ('GO','NO_GO','NEEDS_REVIEW') THEN
    RAISE EXCEPTION 'admin_evaluate_request: invalid outcome %', p_outcome
      USING ERRCODE = '22023';
  END IF;

  -- Lock request row
  SELECT * INTO v_req
  FROM public.evaluation_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF v_req.id IS NULL THEN
    RAISE EXCEPTION 'admin_evaluate_request: request % not found', p_request_id
      USING ERRCODE = '23503';
  END IF;

  IF v_req.status NOT IN ('submitted','under_review') THEN
    RAISE EXCEPTION 'admin_evaluate_request: request status % cannot be evaluated (must be submitted/under_review)', v_req.status
      USING ERRCODE = '22023';
  END IF;

  -- If re-eval, prior_evalobi_id supersession chain
  v_supersedes_evalobi_id := v_req.prior_evalobi_id;

  -- Mint EVALOBI (always · decision #10 NO_GO mint comunque)
  SELECT m.evalobi_id, m.token_id
  INTO v_evalobi_id, v_token_id
  FROM public.mint_evalobi(
    p_seller_id := v_req.seller_id,
    p_object_title := v_req.object_title,
    p_object_brand := v_req.object_brand,
    p_object_model := v_req.object_model,
    p_object_condition := v_req.object_condition,
    p_object_year := v_req.object_year,
    p_object_category := v_req.object_category,
    p_object_photo_hashes := v_req.object_photos,
    p_outcome := p_outcome,
    p_price_range := p_price_range,
    p_reasoning := p_reasoning,
    p_admin_id := v_admin_id,
    p_evaluation_request_id := p_request_id,
    p_supersedes_evalobi_id := v_supersedes_evalobi_id
  ) AS m;

  -- Insert evalobi_mint audit row
  INSERT INTO public.transactions (
    user_id, category, asset_in, asset_in_amount, asset_in_id,
    related_evaluation_request_id, related_evalobi_id,
    description, metadata, status, triggered_by, completed_at
  ) VALUES (
    v_req.seller_id, 'evalobi_mint', 'EVALOBI', 1, v_evalobi_id,
    p_request_id, v_evalobi_id,
    'EVALOBI mint · outcome=' || p_outcome,
    jsonb_build_object(
      'token_id', v_token_id,
      'outcome', p_outcome,
      'admin_id', v_admin_id,
      'supersedes_evalobi_id', v_supersedes_evalobi_id
    ),
    'completed', v_admin_id, NOW()
  );

  -- ROBI bonus only on GO (decision #5 LOCKED, decision #11 NO_GO no bonus)
  IF p_outcome = 'GO' THEN
    INSERT INTO public.nft_rewards (
      user_id, nft_type, name, source, airdrop_id, metadata, shares
    ) VALUES (
      v_req.seller_id, 'REWARD', 'EVALOBI Bonus ROBI', 'evaluation_bonus', NULL,
      jsonb_build_object(
        'evaluation_request_id', p_request_id,
        'evalobi_id', v_evalobi_id,
        'evalobi_token_id', v_token_id,
        'soft_launch_flag', TRUE
      ),
      1.0
    ) RETURNING id INTO v_robi_id;

    -- Insert ROBI bonus transaction row
    INSERT INTO public.transactions (
      user_id, category, asset_in, asset_in_amount, asset_in_id,
      related_evaluation_request_id, related_evalobi_id,
      description, metadata, status, triggered_by, completed_at
    ) VALUES (
      v_req.seller_id, 'evaluation_robi_bonus', 'ROBI', 1, v_robi_id,
      p_request_id, v_evalobi_id,
      'Bonus 1 ROBI · valutazione GO oggetto ' || v_req.object_title,
      jsonb_build_object(
        'nft_rewards_id', v_robi_id,
        'evalobi_token_id', v_token_id
      ),
      'completed', v_admin_id, NOW()
    );

    v_robi_minted := TRUE;
  END IF;

  -- Update evaluation_request with admin decision + output references
  UPDATE public.evaluation_requests
  SET
    status = 'evaluated',
    admin_id = v_admin_id,
    admin_decision_outcome = p_outcome,
    admin_decision_price_range = p_price_range,
    admin_decision_reasoning = p_reasoning,
    decided_at = NOW(),
    evalobi_id = v_evalobi_id,
    robi_bonus_granted = CASE WHEN v_robi_minted THEN 1 ELSE 0 END
  WHERE id = p_request_id;

  RETURN QUERY SELECT v_evalobi_id, v_token_id, v_robi_minted;
END;
$$;

COMMENT ON FUNCTION public.admin_evaluate_request IS 'Admin/evaluator decision orchestrator · mint EVALOBI (always, decision #10) + optional 1 ROBI bonus on GO (decision #5/#11). Atomic via FOR UPDATE lock on request. Re-eval supersession chain via prior_evalobi_id.';

-- ============================================================================
-- 3. re_evaluate_evalobi · wrapper: create new evaluation_request linked to prior
-- ============================================================================
CREATE OR REPLACE FUNCTION public.re_evaluate_evalobi(
  p_evalobi_id UUID,
  p_seller_notes TEXT DEFAULT NULL
)
RETURNS TABLE (request_id UUID, paid_aria INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_prior RECORD;
  v_result RECORD;
BEGIN
  v_caller_id := auth.uid();

  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 're_evaluate_evalobi: not authenticated'
      USING ERRCODE = '42501';
  END IF;

  -- Fetch + validate ownership
  SELECT * INTO v_prior
  FROM public.evalobi
  WHERE id = p_evalobi_id AND current_owner_id = v_caller_id;

  IF v_prior.id IS NULL THEN
    RAISE EXCEPTION 're_evaluate_evalobi: evalobi % not found or not owned by caller', p_evalobi_id
      USING ERRCODE = '42501';
  END IF;

  -- Forward to submit_evaluation_request with copied form data + prior pointer
  SELECT s.request_id, s.paid_aria
  INTO v_result
  FROM public.submit_evaluation_request(
    p_object_title := v_prior.object_title,
    p_object_brand := v_prior.object_brand,
    p_object_model := v_prior.object_model,
    p_object_condition := v_prior.object_condition,
    p_object_year := v_prior.object_year,
    p_object_category := v_prior.object_category,
    p_object_photos := COALESCE(v_prior.object_photo_hashes, '[]'::jsonb),
    p_seller_price_estimate_eur := COALESCE(
      (v_prior.evaluation_price_range->>'suggested_eur')::INTEGER,
      500
    ),
    p_seller_notes := COALESCE(p_seller_notes, 'Re-valutazione di EVALOBI token #' || v_prior.token_id),
    p_prior_evalobi_id := p_evalobi_id
  ) AS s;

  RETURN QUERY SELECT v_result.request_id, v_result.paid_aria;
END;
$$;

COMMENT ON FUNCTION public.re_evaluate_evalobi IS 'Caller re-submits an owned EVALOBI for new evaluation. Wraps submit_evaluation_request with prior_evalobi_id pointer · debits 200 ARIA again (decision #20 re-submit libero, no cooldown). Admin processes via standard admin_evaluate_request flow.';

-- ============================================================================
-- GRANTs · authenticated executor (internal auth via SECURITY DEFINER)
-- ============================================================================
GRANT EXECUTE ON FUNCTION public.submit_evaluation_request(TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, JSONB, INTEGER, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_evaluate_request(UUID, TEXT, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.re_evaluate_evalobi(UUID, TEXT) TO authenticated;
