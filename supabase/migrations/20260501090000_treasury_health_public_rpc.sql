-- ════════════════════════════════════════════════════════════════════
-- get_treasury_health() · endpoint pubblico no-auth per landing /treasury
-- LEG-002 Treasury Methodology v1 §4 spec
-- Day 5 · Sprint W1 · 1 Mag 2026
--
-- Returns JSONB con:
--   ts, treasury_balance_eur, robi_circulating, eur_per_robi_target,
--   peg_ratio, band ('green'|'yellow'|'red'|'unknown'),
--   bridge_active, redemption_target_hours, thresholds
--
-- Auth: anon (pubblicamente accessibile via REST)
-- Side effects: nessuno (read-only)
-- Cache: chiamabile direttamente, no CDN cache per ora (costo trascurabile)
-- ════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_treasury_health()
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance     NUMERIC;
  v_circulating NUMERIC;
  v_eur_per_robi_target NUMERIC;
  v_peg_ratio   NUMERIC;
  v_band        TEXT;
  v_bridge_active BOOLEAN := false;
  v_target_hours INT;
  v_min_ratio   NUMERIC;
BEGIN
  SELECT balance_eur, nft_circulating
    INTO v_balance, v_circulating
    FROM treasury_stats ORDER BY created_at DESC LIMIT 1;

  SELECT COALESCE(value::NUMERIC, 1.00) INTO v_eur_per_robi_target
    FROM airdrop_config WHERE key='robi_target_price_eur';
  SELECT COALESCE(value::NUMERIC, 1.05) INTO v_min_ratio
    FROM airdrop_config WHERE key='treasury_health_min_ratio';

  IF v_balance IS NULL OR v_circulating IS NULL OR v_circulating <= 0 THEN
    v_peg_ratio := NULL;
  ELSE
    v_peg_ratio := ROUND((v_balance / (v_circulating * COALESCE(v_eur_per_robi_target, 1.0)))::NUMERIC, 4);
  END IF;

  v_band := CASE
    WHEN v_peg_ratio IS NULL THEN 'unknown'
    WHEN v_peg_ratio >= v_min_ratio THEN 'green'
    WHEN v_peg_ratio >= 1.00 THEN 'yellow'
    ELSE 'red'
  END;

  v_target_hours := CASE v_band
    WHEN 'green' THEN 24
    WHEN 'yellow' THEN 48
    WHEN 'red' THEN NULL
    ELSE NULL
  END;

  RETURN jsonb_build_object(
    'ts', NOW(),
    'treasury_balance_eur', v_balance,
    'robi_circulating', v_circulating,
    'eur_per_robi_target', v_eur_per_robi_target,
    'peg_ratio', v_peg_ratio,
    'band', v_band,
    'bridge_active', v_bridge_active,
    'redemption_target_hours', v_target_hours,
    'thresholds', jsonb_build_object(
      'green_min', v_min_ratio,
      'yellow_min', 1.00,
      'red_below', 1.00
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_treasury_health() TO anon, authenticated, service_role;
