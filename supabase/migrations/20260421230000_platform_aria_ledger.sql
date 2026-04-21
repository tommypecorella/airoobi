-- ═══════════════════════════════════════════════════════════════
-- PLATFORM ARIA LEDGER — Conto AIROOBI
-- 21 Apr 2026
-- ═══════════════════════════════════════════════════════════════
-- Traccia tutti i movimenti ARIA del conto AIROOBI:
--   - Incasso: valuation fee (50 ARIA), fee airdrop (future), refund negative
--   - Uscita: admin adjust, rimborsi, ecc.
--
-- Admin-only: RLS usa is_admin() (helper esistente via user_roles).
-- Visibile in ABO via get_platform_aria_balance() e get_platform_aria_ledger(...).
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS platform_aria_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount integer NOT NULL,
  reason text NOT NULL,
  related_airdrop_id uuid REFERENCES airdrops(id) ON DELETE SET NULL,
  related_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_aria_ledger_created_at ON platform_aria_ledger(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_aria_ledger_reason ON platform_aria_ledger(reason);

ALTER TABLE platform_aria_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS platform_ledger_admin_read ON platform_aria_ledger;
CREATE POLICY platform_ledger_admin_read ON platform_aria_ledger
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- submit_object_for_valuation — accredita 50 ARIA al conto AIROOBI
-- Due overload (senza / con p_duration_type)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.submit_object_for_valuation(
  p_title text,
  p_description text,
  p_category text,
  p_image_url text DEFAULT NULL,
  p_seller_desired_price numeric DEFAULT 0,
  p_seller_min_price numeric DEFAULT 0,
  p_image_urls jsonb DEFAULT '[]'::jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
      'success', false, 'error', 'INSUFFICIENT_ARIA',
      'required', v_cost, 'available', v_balance
    );
  END IF;

  IF p_seller_desired_price < 500 OR p_seller_min_price < 500 THEN
    RETURN json_build_object('success', false, 'error', 'MIN_PRICE_500');
  END IF;
  IF p_seller_min_price > p_seller_desired_price THEN
    RETURN json_build_object('success', false, 'error', 'MIN_GT_DESIRED');
  END IF;

  v_main_image := COALESCE(NULLIF(p_image_url, ''), p_image_urls->>0);
  IF p_image_url IS NOT NULL AND p_image_url != '' THEN
    v_extra_images := p_image_urls;
  ELSIF jsonb_array_length(p_image_urls) > 1 THEN
    v_extra_images := p_image_urls - 0;
  ELSE
    v_extra_images := '[]'::JSONB;
  END IF;

  UPDATE profiles SET total_points = total_points - v_cost WHERE id = v_user_id;

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

  -- Accredita ARIA al conto AIROOBI
  INSERT INTO platform_aria_ledger (amount, reason, related_airdrop_id, related_user_id, metadata)
  VALUES (v_cost, 'valuation_fee', v_airdrop_id, v_user_id, jsonb_build_object('title', p_title, 'category', p_category));

  RETURN json_build_object(
    'success', true,
    'airdrop_id', v_airdrop_id,
    'aria_spent', v_cost,
    'new_balance', v_balance - v_cost
  );
END;
$function$;


CREATE OR REPLACE FUNCTION public.submit_object_for_valuation(
  p_title text,
  p_description text,
  p_category text,
  p_image_url text DEFAULT NULL,
  p_seller_desired_price numeric DEFAULT 0,
  p_seller_min_price numeric DEFAULT 0,
  p_image_urls jsonb DEFAULT '[]'::jsonb,
  p_duration_type text DEFAULT 'standard'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_user_id UUID;
  v_cost INTEGER;
  v_balance INTEGER;
  v_airdrop_id UUID;
  v_main_image TEXT;
  v_extra_images JSONB;
  v_dur TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'NOT_AUTHENTICATED');
  END IF;

  v_dur := COALESCE(NULLIF(p_duration_type, ''), 'standard');
  IF v_dur NOT IN ('flash', 'standard', 'extended') THEN
    v_dur := 'standard';
  END IF;

  SELECT COALESCE(value::INTEGER, 50) INTO v_cost
  FROM airdrop_config WHERE key = 'valuation_cost_aria';
  IF v_cost IS NULL THEN v_cost := 50; END IF;

  SELECT COALESCE(total_points, 0) INTO v_balance
  FROM profiles WHERE id = v_user_id;

  IF v_balance < v_cost THEN
    RETURN json_build_object(
      'success', false, 'error', 'INSUFFICIENT_ARIA',
      'required', v_cost, 'available', v_balance
    );
  END IF;

  IF p_seller_desired_price < 500 OR p_seller_min_price < 500 THEN
    RETURN json_build_object('success', false, 'error', 'MIN_PRICE_500');
  END IF;
  IF p_seller_min_price > p_seller_desired_price THEN
    RETURN json_build_object('success', false, 'error', 'MIN_GT_DESIRED');
  END IF;

  v_main_image := COALESCE(NULLIF(p_image_url, ''), p_image_urls->>0);
  IF p_image_url IS NOT NULL AND p_image_url != '' THEN
    v_extra_images := p_image_urls;
  ELSIF jsonb_array_length(p_image_urls) > 1 THEN
    v_extra_images := p_image_urls - 0;
  ELSE
    v_extra_images := '[]'::JSONB;
  END IF;

  UPDATE profiles SET total_points = total_points - v_cost WHERE id = v_user_id;

  INSERT INTO points_ledger (user_id, amount, reason)
  VALUES (v_user_id, -v_cost, 'valuation_request');

  INSERT INTO airdrops (
    title, description, category, image_url,
    seller_desired_price, seller_min_price,
    object_value_eur, block_price_aria, total_blocks,
    status, submitted_by, duration_type, product_info
  ) VALUES (
    p_title, p_description, p_category, v_main_image,
    p_seller_desired_price, p_seller_min_price,
    0, 0, 0,
    'in_valutazione', v_user_id, v_dur,
    CASE WHEN jsonb_array_length(v_extra_images) > 0
      THEN jsonb_build_object('extra_photos', v_extra_images)
      ELSE NULL
    END
  ) RETURNING id INTO v_airdrop_id;

  -- Accredita ARIA al conto AIROOBI
  INSERT INTO platform_aria_ledger (amount, reason, related_airdrop_id, related_user_id, metadata)
  VALUES (v_cost, 'valuation_fee', v_airdrop_id, v_user_id, jsonb_build_object('title', p_title, 'category', p_category, 'duration_type', v_dur));

  RETURN json_build_object(
    'success', true,
    'airdrop_id', v_airdrop_id,
    'aria_spent', v_cost,
    'new_balance', v_balance - v_cost
  );
END;
$function$;


-- ─────────────────────────────────────────────────────────────
-- RPC admin: saldo + lista transazioni conto AIROOBI
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_platform_aria_balance()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_total bigint;
  v_count integer;
  v_in bigint;
  v_out bigint;
BEGIN
  SELECT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  INTO v_is_admin;
  IF NOT v_is_admin THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_admin');
  END IF;

  SELECT COALESCE(SUM(amount), 0), COUNT(*) INTO v_total, v_count FROM platform_aria_ledger;
  SELECT COALESCE(SUM(amount), 0) INTO v_in FROM platform_aria_ledger WHERE amount > 0;
  SELECT COALESCE(SUM(amount), 0) INTO v_out FROM platform_aria_ledger WHERE amount < 0;

  RETURN jsonb_build_object(
    'ok', true,
    'balance', v_total,
    'total_in', v_in,
    'total_out', v_out,
    'tx_count', v_count
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_platform_aria_balance() TO authenticated;


CREATE OR REPLACE FUNCTION get_platform_aria_ledger(
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_result jsonb;
BEGIN
  SELECT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  INTO v_is_admin;
  IF NOT v_is_admin THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_admin');
  END IF;

  SELECT jsonb_agg(r ORDER BY created_at DESC)
  FROM (
    SELECT
      pal.id,
      pal.amount,
      pal.reason,
      pal.related_airdrop_id,
      pal.related_user_id,
      pal.metadata,
      pal.created_at,
      p.email AS related_user_email,
      a.title AS related_airdrop_title
    FROM platform_aria_ledger pal
    LEFT JOIN profiles p ON p.id = pal.related_user_id
    LEFT JOIN airdrops a ON a.id = pal.related_airdrop_id
    ORDER BY pal.created_at DESC
    LIMIT p_limit OFFSET p_offset
  ) r
  INTO v_result;

  RETURN jsonb_build_object('ok', true, 'rows', COALESCE(v_result, '[]'::jsonb));
END;
$$;

GRANT EXECUTE ON FUNCTION get_platform_aria_ledger(integer, integer) TO authenticated;


-- ─────────────────────────────────────────────────────────────
-- BACKFILL: retroattivamente accredita tutte le submission esistenti
-- che hanno pagato valuation_request e non hanno già un record in
-- platform_aria_ledger
-- ─────────────────────────────────────────────────────────────
INSERT INTO platform_aria_ledger (amount, reason, related_airdrop_id, related_user_id, metadata, created_at)
SELECT
  50,
  'valuation_fee',
  a.id,
  a.submitted_by,
  jsonb_build_object('title', a.title, 'category', a.category, 'backfilled', true),
  a.created_at
FROM airdrops a
WHERE a.submitted_by IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM platform_aria_ledger pal
    WHERE pal.related_airdrop_id = a.id AND pal.reason = 'valuation_fee'
  );
