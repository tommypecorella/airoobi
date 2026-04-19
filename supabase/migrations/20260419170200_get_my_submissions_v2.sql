-- ═══════════════════════════════════════════════════════════════
-- get_my_submissions v2 — include campi early-close per seller UI
-- 19 Aprile 2026
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_my_submissions()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_result JSON;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN '[]'::JSON;
  END IF;

  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::JSON) INTO v_result
  FROM (
    SELECT
      id,
      title,
      description,
      category,
      image_url,
      seller_desired_price,
      seller_min_price,
      object_value_eur,
      status,
      rejection_reason,
      created_at,
      updated_at,
      -- Campi early-close (NULL per airdrop non interessati)
      early_close_reason,
      blocks_sold,
      total_blocks,
      original_total_blocks,
      block_price_aria
    FROM airdrops
    WHERE submitted_by = v_user_id
    ORDER BY created_at DESC
  ) t;

  RETURN v_result;
END;
$$;
