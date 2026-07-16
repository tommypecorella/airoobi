-- Nielsen audit 16 lug 2026 (CCP): get_robi_market_data sommava amount_eur SENZA
-- il peso treasury_pct → topbar/explorer mostravano €1.11 mentre snapshot/ABO/portafoglio
-- dicevano €0.75. Allineata alla FORMULA UNICA (GO Skeezu).
-- (Applicata sul live il 16 lug 2026 via MCP apply_migration.)
CREATE OR REPLACE FUNCTION public.get_robi_market_data()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_treasury NUMERIC;
  v_robi NUMERIC;
  v_price_now NUMERIC;
  v_price_24h_ago NUMERIC;
  v_trend_pct NUMERIC;
  v_snapshot_count INT;
  v_first_snapshot TIMESTAMPTZ;
BEGIN
  -- FORMULA UNICA: quota ROBI di ogni fondo = amount_eur * treasury_pct / 100
  SELECT COALESCE(SUM(amount_eur * treasury_pct / 100.0), 0) INTO v_treasury FROM public.treasury_funds;
  SELECT COALESCE(SUM(shares), 0) INTO v_robi
    FROM public.nft_rewards WHERE nft_type IN ('ROBI', 'NFT_REWARD');

  IF v_robi > 0 THEN
    v_price_now := ROUND(v_treasury / v_robi, 6);
  ELSE
    v_price_now := 0;
  END IF;

  SELECT COUNT(*), MIN(taken_at) INTO v_snapshot_count, v_first_snapshot
    FROM public.robi_price_snapshots;

  SELECT price_eur INTO v_price_24h_ago
    FROM public.robi_price_snapshots
    WHERE taken_at <= NOW() - INTERVAL '24 hours'
    ORDER BY taken_at DESC
    LIMIT 1;

  IF v_price_24h_ago IS NOT NULL AND v_price_24h_ago > 0 THEN
    v_trend_pct := ROUND(((v_price_now - v_price_24h_ago) / v_price_24h_ago) * 100, 2);
  ELSE
    v_trend_pct := NULL;
  END IF;

  RETURN jsonb_build_object(
    'price_eur', v_price_now,
    'treasury_eur', ROUND(v_treasury, 2),
    'robi_circulating', ROUND(v_robi, 4),
    'trend_24h_pct', v_trend_pct,
    'snapshot_count', v_snapshot_count,
    'first_snapshot_at', v_first_snapshot,
    'collecting_data', v_snapshot_count < 24
  );
END;
$function$;
