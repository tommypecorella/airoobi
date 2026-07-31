-- Overload di submit_object_for_valuation con modalita' di vendita + azienda B2C (1 ago 2026).
-- Applicata live via MCP. Riusa la versione collaudata (8 arg) e poi applica sale_mode/company_id/
-- b2c_product, con GATE: airdrop B2C solo se can_airdrop_for_company (brand manager + azienda verificata).
CREATE OR REPLACE FUNCTION public.submit_object_for_valuation(
  p_title text, p_description text, p_category text, p_image_url text,
  p_seller_desired_price numeric, p_seller_min_price numeric, p_image_urls jsonb,
  p_duration_type text, p_sale_mode text, p_company_id uuid, p_b2c_product text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $fn$
DECLARE v_res json; v_mode text; v_aid uuid;
BEGIN
  v_mode := COALESCE(NULLIF(p_sale_mode,''),'airdrop');
  IF v_mode NOT IN ('airdrop','proposta') THEN
    RETURN json_build_object('success', false, 'error', 'BAD_SALE_MODE');
  END IF;
  IF p_company_id IS NOT NULL AND NOT public.can_airdrop_for_company(p_company_id) THEN
    RETURN json_build_object('success', false, 'error', 'NOT_BRAND_MANAGER');
  END IF;
  v_res := public.submit_object_for_valuation(
    p_title, p_description, p_category, p_image_url,
    p_seller_desired_price, p_seller_min_price, p_image_urls, p_duration_type);
  IF COALESCE((v_res->>'success')::boolean,false) THEN
    v_aid := (v_res->>'airdrop_id')::uuid;
    UPDATE airdrops SET sale_mode = v_mode,
                        company_id = p_company_id,
                        b2c_product = CASE WHEN p_company_id IS NOT NULL
                                           THEN COALESCE(NULLIF(p_b2c_product,''),'product_hype') END
    WHERE id = v_aid;
  END IF;
  RETURN v_res;
END;$fn$;
REVOKE ALL ON FUNCTION public.submit_object_for_valuation(text,text,text,text,numeric,numeric,jsonb,text,text,uuid,text) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_object_for_valuation(text,text,text,text,numeric,numeric,jsonb,text,text,uuid,text) TO authenticated;
