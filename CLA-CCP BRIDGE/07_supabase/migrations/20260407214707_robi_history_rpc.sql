-- ══════════════════════════════════════════════════════════
--  ROBI history — storico dettagliato frazioni ROBI
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_robi_history()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_items jsonb := '[]'::jsonb;
  v_row RECORD;
  v_unit_val NUMERIC := 0;
  v_kas_price NUMERIC := 0;
BEGIN
  -- Calcola valore unitario ROBI
  DECLARE
    v_treasury NUMERIC := 0;
    v_total_robi NUMERIC := 0;
  BEGIN
    SELECT COALESCE(SUM(amount_eur * (COALESCE(treasury_pct, 100)::numeric / 100)), 0)
    INTO v_treasury FROM treasury_funds;

    SELECT COALESCE(SUM(shares), 0) INTO v_total_robi
    FROM nft_rewards WHERE nft_type IN ('ROBI', 'NFT_REWARD');

    IF v_total_robi > 0 THEN
      v_unit_val := v_treasury / v_total_robi;
    END IF;
  END;

  -- Storico ROBI per utente corrente
  FOR v_row IN
    SELECT
      nr.id,
      nr.shares,
      nr.created_at,
      nr.airdrop_id,
      nr.nft_type,
      nr.source,
      COALESCE(a.title, nr.name) AS airdrop_title,
      nr.metadata
    FROM nft_rewards nr
    LEFT JOIN airdrops a ON a.id = nr.airdrop_id
    WHERE nr.user_id = auth.uid()
      AND nr.nft_type IN ('ROBI', 'NFT_REWARD', 'NFT_EARN')
    ORDER BY nr.created_at DESC
  LOOP
    v_items := v_items || jsonb_build_object(
      'id', v_row.id,
      'shares', v_row.shares,
      'date', v_row.created_at,
      'airdrop_title', v_row.airdrop_title,
      'airdrop_id', v_row.airdrop_id,
      'source', v_row.source,
      'type', v_row.nft_type,
      'value_eur', ROUND((v_row.shares * v_unit_val)::numeric, 4),
      'metadata', v_row.metadata
    );
  END LOOP;

  RETURN jsonb_build_object(
    'items', v_items,
    'unit_value_eur', ROUND(v_unit_val::numeric, 4),
    'count', jsonb_array_length(v_items)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_robi_history() TO authenticated;
