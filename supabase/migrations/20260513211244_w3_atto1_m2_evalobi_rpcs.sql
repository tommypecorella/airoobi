-- ============================================================================
-- Sprint W3 · Atto 1 · Migration M2 (partial scope tonight)
-- EVALOBI RPCs · mint_evalobi + transfer_evalobi
-- ============================================================================
-- Scope tonight: mint + transfer (standalone DB ops)
-- Deferred to M4: re_evaluate_evalobi (orchestrator depends on evaluation_requests M3)
--
-- All RPCs SECURITY DEFINER with internal authorization check:
--   - mint_evalobi: caller must be admin (is_admin())
--   - transfer_evalobi: caller must be current_owner OR admin
-- ============================================================================

-- 1. mint_evalobi · admin-only · atomic insert evalobi + history event
CREATE OR REPLACE FUNCTION public.mint_evalobi(
  p_seller_id UUID,
  p_object_title TEXT,
  p_object_brand TEXT,
  p_object_model TEXT,
  p_object_condition TEXT,
  p_object_year INTEGER,
  p_object_category TEXT,
  p_object_photo_hashes JSONB,
  p_outcome TEXT,
  p_price_range JSONB,
  p_reasoning TEXT,
  p_admin_id UUID,
  p_evaluation_request_id UUID DEFAULT NULL,
  p_supersedes_evalobi_id UUID DEFAULT NULL
)
RETURNS TABLE (evalobi_id UUID, token_id BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_evalobi_id UUID;
  v_token_id BIGINT;
  v_caller_id UUID;
  v_version INTEGER := 1;
BEGIN
  v_caller_id := auth.uid();

  -- Auth: only admin can mint
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'mint_evalobi: caller is not admin (auth.uid=%)', v_caller_id
      USING ERRCODE = '42501';
  END IF;

  -- Validate seller exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_seller_id) THEN
    RAISE EXCEPTION 'mint_evalobi: seller % does not exist', p_seller_id
      USING ERRCODE = '23503';
  END IF;

  -- Validate outcome
  IF p_outcome NOT IN ('GO','NO_GO','NEEDS_REVIEW') THEN
    RAISE EXCEPTION 'mint_evalobi: invalid outcome %', p_outcome
      USING ERRCODE = '22023';
  END IF;

  -- Validate condition
  IF p_object_condition NOT IN ('nuovo','come_nuovo','usato_eccellente') THEN
    RAISE EXCEPTION 'mint_evalobi: invalid condition %', p_object_condition
      USING ERRCODE = '22023';
  END IF;

  -- If supersedes another EVALOBI, validate ownership chain + bump version
  IF p_supersedes_evalobi_id IS NOT NULL THEN
    SELECT COALESCE(MAX(version), 0) + 1 INTO v_version
    FROM public.evalobi
    WHERE id = p_supersedes_evalobi_id
       OR supersedes_evalobi_id = p_supersedes_evalobi_id;
  END IF;

  -- Insert EVALOBI
  INSERT INTO public.evalobi (
    current_owner_id,
    original_seller_id,
    object_title,
    object_brand,
    object_model,
    object_condition,
    object_year,
    object_category,
    object_photo_hashes,
    evaluation_outcome,
    evaluation_price_range,
    evaluation_reasoning,
    evaluation_admin_id,
    version,
    supersedes_evalobi_id
  ) VALUES (
    p_seller_id,
    p_seller_id,
    p_object_title,
    p_object_brand,
    p_object_model,
    p_object_condition,
    p_object_year,
    p_object_category,
    p_object_photo_hashes,
    p_outcome,
    p_price_range,
    p_reasoning,
    p_admin_id,
    v_version,
    p_supersedes_evalobi_id
  )
  RETURNING id, evalobi.token_id INTO v_evalobi_id, v_token_id;

  -- Insert history event 'minted'
  INSERT INTO public.evalobi_history (
    evalobi_id,
    event_type,
    event_metadata,
    new_owner_id,
    triggered_by
  ) VALUES (
    v_evalobi_id,
    'minted',
    jsonb_build_object(
      'outcome', p_outcome,
      'admin_id', p_admin_id,
      'evaluation_request_id', p_evaluation_request_id,
      'version', v_version,
      'token_id', v_token_id
    ),
    p_seller_id,
    p_admin_id
  );

  -- If supersession, mark old EVALOBI history event
  IF p_supersedes_evalobi_id IS NOT NULL THEN
    INSERT INTO public.evalobi_history (
      evalobi_id,
      event_type,
      event_metadata,
      triggered_by
    ) VALUES (
      p_supersedes_evalobi_id,
      'superseded',
      jsonb_build_object(
        'superseded_by_evalobi_id', v_evalobi_id,
        'superseded_by_token_id', v_token_id,
        'new_version', v_version
      ),
      p_admin_id
    );
  END IF;

  RETURN QUERY SELECT v_evalobi_id, v_token_id;
END;
$$;

COMMENT ON FUNCTION public.mint_evalobi IS 'Admin-only · atomic insert evalobi + history event. Returns (evalobi_id, token_id). Decision #10 LOCKED: outcome=NO_GO comunque emette EVALOBI per pollution layer. Supersession chain via p_supersedes_evalobi_id auto-bumps version.';

-- 2. transfer_evalobi · current owner or admin · atomic update + history event
CREATE OR REPLACE FUNCTION public.transfer_evalobi(
  p_evalobi_id UUID,
  p_new_owner_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_current_owner UUID;
  v_token_id BIGINT;
BEGIN
  v_caller_id := auth.uid();

  -- Validate evalobi exists and lock row
  SELECT current_owner_id, token_id INTO v_current_owner, v_token_id
  FROM public.evalobi
  WHERE id = p_evalobi_id
  FOR UPDATE;

  IF v_current_owner IS NULL THEN
    RAISE EXCEPTION 'transfer_evalobi: evalobi % not found', p_evalobi_id
      USING ERRCODE = '23503';
  END IF;

  -- Auth: caller must be current owner OR admin
  IF v_caller_id != v_current_owner AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'transfer_evalobi: caller % is not owner or admin (current_owner=%)', v_caller_id, v_current_owner
      USING ERRCODE = '42501';
  END IF;

  -- Validate new owner exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_new_owner_id) THEN
    RAISE EXCEPTION 'transfer_evalobi: new owner % does not exist', p_new_owner_id
      USING ERRCODE = '23503';
  END IF;

  -- No-op guard
  IF v_current_owner = p_new_owner_id THEN
    RAISE EXCEPTION 'transfer_evalobi: new owner same as current owner'
      USING ERRCODE = '23514';
  END IF;

  -- Update owner
  UPDATE public.evalobi
  SET current_owner_id = p_new_owner_id
  WHERE id = p_evalobi_id;

  -- Insert history event 'transferred'
  INSERT INTO public.evalobi_history (
    evalobi_id,
    event_type,
    event_metadata,
    prev_owner_id,
    new_owner_id,
    triggered_by
  ) VALUES (
    p_evalobi_id,
    'transferred',
    jsonb_build_object(
      'token_id', v_token_id,
      'caller_is_admin', public.is_admin()
    ),
    v_current_owner,
    p_new_owner_id,
    v_caller_id
  );

  RETURN p_evalobi_id;
END;
$$;

COMMENT ON FUNCTION public.transfer_evalobi IS 'Current owner or admin · atomic UPDATE evalobi.current_owner_id + history event. FOR UPDATE row lock prevents concurrent transfer. Decision #6 LOCKED: EVALOBI trasferibile lifecycle.';

-- 3. Function GRANTs · authenticated only (RPCs are SECURITY DEFINER so internal auth)
GRANT EXECUTE ON FUNCTION public.mint_evalobi(UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, JSONB, TEXT, JSONB, TEXT, UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.transfer_evalobi(UUID, UUID) TO authenticated;
