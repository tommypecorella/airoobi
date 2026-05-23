-- ══════════════════════════════════════════════════════════════════════════
--  GS-14 · RPC anon per snapshots recenti (consumer: explorer-robi.html)
--  explorer-robi.html è pubblica (anon key), evita di esporre la tabella raw
--  con policy anon: la RPC ritorna solo i campi necessari + limita rows.
-- ══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_robi_snapshots_recent(p_limit INT DEFAULT 24)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF p_limit IS NULL OR p_limit < 1 THEN p_limit := 24; END IF;
  IF p_limit > 200 THEN p_limit := 200; END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO v_result FROM (
    SELECT taken_at, price_eur, treasury_eur, robi_circulating
    FROM public.robi_price_snapshots
    ORDER BY taken_at DESC
    LIMIT p_limit
  ) t;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_robi_snapshots_recent(INT) TO authenticated, anon;
