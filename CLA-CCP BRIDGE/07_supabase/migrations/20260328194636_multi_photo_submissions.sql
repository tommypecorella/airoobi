-- ═══════════════���══════════════════════════════════════════
--  MULTI-PHOTO SUBMISSIONS: Storage bucket + RPC update
-- ═════════════════════════��════════════════════════════════

-- 1. Create storage bucket for submission photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions', 'submissions', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload to submissions bucket
CREATE POLICY "Users can upload submission photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'submissions');

-- 3. Allow public read access to submission photos
CREATE POLICY "Public can view submission photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'submissions');

-- 4. Allow users to delete their own uploads
CREATE POLICY "Users can delete own submission photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'submissions' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 5. Update RPC to accept multiple image URLs as JSONB array
CREATE OR REPLACE FUNCTION public.submit_object_for_valuation(
  p_title TEXT,
  p_description TEXT,
  p_category TEXT,
  p_image_url TEXT DEFAULT NULL,
  p_seller_desired_price NUMERIC DEFAULT 0,
  p_seller_min_price NUMERIC DEFAULT 0,
  p_image_urls JSONB DEFAULT '[]'::JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_cost INTEGER;
  v_balance INTEGER;
  v_airdrop_id UUID;
  v_main_image TEXT;
  v_extra_images JSONB;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'NOT_AUTHENTICATED');
  END IF;

  SELECT COALESCE(value::INTEGER, 50) INTO v_cost
  FROM airdrop_config WHERE key = 'valuation_cost_aria';
  IF v_cost IS NULL THEN v_cost := 50; END IF;

  SELECT COALESCE(total_points, 0) INTO v_balance
  FROM profiles WHERE id = v_user_id;

  IF v_balance < v_cost THEN
    RETURN json_build_object(
      'success', false,
      'error', 'INSUFFICIENT_ARIA',
      'required', v_cost,
      'available', v_balance
    );
  END IF;

  IF p_seller_desired_price < 500 OR p_seller_min_price < 500 THEN
    RETURN json_build_object('success', false, 'error', 'MIN_PRICE_500');
  END IF;
  IF p_seller_min_price > p_seller_desired_price THEN
    RETURN json_build_object('success', false, 'error', 'MIN_GT_DESIRED');
  END IF;

  -- Use first URL from array as main image, or fallback to p_image_url
  v_main_image := COALESCE(
    NULLIF(p_image_url, ''),
    p_image_urls->>0
  );
  -- Extra images: all URLs from array except the first (if used as main)
  IF p_image_url IS NOT NULL AND p_image_url != '' THEN
    v_extra_images := p_image_urls;
  ELSIF jsonb_array_length(p_image_urls) > 1 THEN
    v_extra_images := p_image_urls - 0;
  ELSE
    v_extra_images := '[]'::JSONB;
  END IF;

  UPDATE profiles
  SET total_points = total_points - v_cost
  WHERE id = v_user_id;

  INSERT INTO points_ledger (user_id, amount, reason)
  VALUES (v_user_id, -v_cost, 'valuation_request');

  INSERT INTO airdrops (
    title, description, category, image_url,
    seller_desired_price, seller_min_price,
    object_value_eur, block_price_aria, total_blocks,
    status, submitted_by, product_info
  ) VALUES (
    p_title, p_description, p_category, v_main_image,
    p_seller_desired_price, p_seller_min_price,
    0, 0, 0,
    'in_valutazione', v_user_id,
    CASE WHEN jsonb_array_length(v_extra_images) > 0
      THEN jsonb_build_object('extra_photos', v_extra_images)
      ELSE NULL
    END
  ) RETURNING id INTO v_airdrop_id;

  RETURN json_build_object(
    'success', true,
    'airdrop_id', v_airdrop_id,
    'aria_spent', v_cost,
    'new_balance', v_balance - v_cost
  );
END;
$$;
