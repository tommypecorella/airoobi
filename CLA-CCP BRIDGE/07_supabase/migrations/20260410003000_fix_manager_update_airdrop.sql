-- ============================================================
-- FIX: manager_update_airdrop — aggiunge parametri mancanti
--
-- Il frontend invia p_object_value_eur, p_auto_draw, p_duration_type
-- ma la RPC non li accettava → "GENERIC ERROR".
-- ============================================================

CREATE OR REPLACE FUNCTION public.manager_update_airdrop(
  p_airdrop_id UUID,
  p_status TEXT,
  p_block_price_aria INTEGER DEFAULT NULL,
  p_total_blocks INTEGER DEFAULT NULL,
  p_presale_block_price INTEGER DEFAULT NULL,
  p_deadline TIMESTAMPTZ DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL,
  p_object_value_eur NUMERIC DEFAULT NULL,
  p_auto_draw BOOLEAN DEFAULT NULL,
  p_duration_type TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_airdrop RECORD;
  v_has_perm BOOLEAN;
BEGIN
  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  END IF;

  -- Admin has full access, evaluator checks category
  SELECT EXISTS(
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND (
        role = 'admin'
        OR (role = 'evaluator' AND (category IS NULL OR category = v_airdrop.category))
      )
  ) INTO v_has_perm;

  IF NOT v_has_perm THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NO_PERMISSION');
  END IF;

  IF p_status NOT IN ('presale', 'sale', 'rifiutato_min500', 'rifiutato_generico', 'dropped', 'closed') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_STATUS');
  END IF;

  UPDATE airdrops SET
    status = p_status,
    block_price_aria = COALESCE(p_block_price_aria, block_price_aria),
    total_blocks = COALESCE(p_total_blocks, total_blocks),
    presale_block_price = p_presale_block_price,
    deadline = p_deadline,
    rejection_reason = p_rejection_reason,
    object_value_eur = COALESCE(p_object_value_eur, object_value_eur),
    duration_type = COALESCE(p_duration_type, duration_type),
    updated_at = NOW()
  WHERE id = p_airdrop_id;

  RETURN jsonb_build_object('ok', true, 'status', p_status);
END;
$$;
