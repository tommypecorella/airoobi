-- Drift ROBI display · cron snapshot allineato alla formula unica di ABO
-- (treasury_funds.amount_eur × treasury_pct/100) / SUM(shares ROBI+NFT_REWARD).
-- Applicata al DB live via MCP il 14 lug 2026 (snapshot_robi_price_formula_unica_pct).
CREATE OR REPLACE FUNCTION public.snapshot_robi_price()
RETURNS public.robi_price_snapshots
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_treasury NUMERIC;
  v_robi NUMERIC;
  v_price NUMERIC;
  v_row public.robi_price_snapshots;
BEGIN
  SELECT COALESCE(SUM(amount_eur * COALESCE(treasury_pct, 100) / 100.0), 0)
    INTO v_treasury FROM public.treasury_funds;
  SELECT COALESCE(SUM(shares), 0) INTO v_robi
    FROM public.nft_rewards WHERE nft_type IN ('ROBI', 'NFT_REWARD');
  IF v_robi > 0 THEN v_price := v_treasury / v_robi; ELSE v_price := 0; END IF;
  INSERT INTO public.robi_price_snapshots (price_eur, treasury_eur, robi_circulating)
  VALUES (ROUND(v_price, 6), ROUND(v_treasury, 2), ROUND(v_robi, 4))
  RETURNING * INTO v_row;
  RETURN v_row;
END;
$$;
