-- ============================================================
-- FIX: get_draw_preview — add p_service_call bypass for testing
-- and ensure ROUND casts to NUMERIC
-- ============================================================

-- Drop old signature (no p_service_call param)
DROP FUNCTION IF EXISTS get_draw_preview(UUID);

CREATE OR REPLACE FUNCTION get_draw_preview(p_airdrop_id UUID, p_service_call BOOLEAN DEFAULT false)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_airdrop       RECORD;
  v_aria_incassato INTEGER;
  v_success        BOOLEAN;
  v_scores         JSONB;
  v_fondo_eur      NUMERIC;
  v_airoobi_eur    NUMERIC;
  v_charity_eur    NUMERIC;
  v_venditore_eur  NUMERIC;
BEGIN
  -- Verifica admin (skip se service_call)
  IF NOT p_service_call THEN
    IF NOT EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
      RETURN '{"ok":false,"error":"NOT_ADMIN"}'::JSONB;
    END IF;
  END IF;

  -- Carica airdrop
  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN
    RETURN '{"ok":false,"error":"AIRDROP_NOT_FOUND"}'::JSONB;
  END IF;

  -- Calcola ARIA incassato
  SELECT COALESCE(SUM(aria_spent), 0) INTO v_aria_incassato
  FROM airdrop_participations WHERE airdrop_id = p_airdrop_id;

  IF v_aria_incassato = 0 THEN
    RETURN jsonb_build_object(
      'ok', true,
      'warning', 'NO_PARTICIPANTS',
      'aria_incassato', 0
    );
  END IF;

  -- Determina successo
  v_success := v_airdrop.seller_min_price IS NULL
    OR (v_aria_incassato * 0.10) >= v_airdrop.seller_min_price;

  -- Calcola split
  v_fondo_eur     := ROUND((v_aria_incassato * 0.10 * 0.22)::NUMERIC, 2);
  v_airoobi_eur   := ROUND((v_aria_incassato * 0.10 * 0.10)::NUMERIC, 2);
  v_charity_eur   := ROUND((v_aria_incassato * 0.10 * 0.0001)::NUMERIC, 4);
  v_venditore_eur := ROUND((v_aria_incassato * 0.10 * 0.6799)::NUMERIC, 2);

  -- Calcola scores
  v_scores := calculate_winner_score(p_airdrop_id);

  RETURN jsonb_build_object(
    'ok', true,
    'airdrop_id', p_airdrop_id,
    'title', v_airdrop.title,
    'status', v_airdrop.status,
    'aria_incassato', v_aria_incassato,
    'eur_incassato', ROUND((v_aria_incassato * 0.10)::NUMERIC, 2),
    'success', v_success,
    'seller_min_price', v_airdrop.seller_min_price,
    'split', jsonb_build_object(
      'venditore_eur', v_venditore_eur,
      'fondo_eur', v_fondo_eur,
      'airoobi_eur', v_airoobi_eur,
      'charity_eur', v_charity_eur
    ),
    'scores', v_scores,
    'winner_preview', CASE
      WHEN v_success AND v_scores IS NOT NULL AND jsonb_array_length(v_scores) > 0
      THEN v_scores->0
      ELSE NULL
    END,
    'draw_executed', v_airdrop.draw_executed_at IS NOT NULL
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_draw_preview(UUID, BOOLEAN) TO authenticated;
