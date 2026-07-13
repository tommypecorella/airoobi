-- ABO · get_draw_preview allineata alla realtà (test massivo CCP 14 lug 2026)
-- Bug: il preview mostrava "ANNULLAMENTO" su airdrop realmente completed.
-- Fix 1: draw già eseguito -> esito REALE (status/winner effettivi), non ricalcolato.
-- Fix 2: predizione allineata a execute_draw PR-1: considera seller_acknowledge_decision
--        e confronta il TAGLIO VENDITORE (split config) col prezzo minimo, non il lordo.

CREATE OR REPLACE FUNCTION public.get_draw_preview(p_airdrop_id uuid, p_service_call boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_airdrop        RECORD;
  v_aria_incassato INTEGER;
  v_success        BOOLEAN;
  v_scores         JSONB;
  v_fondo_eur      NUMERIC;
  v_airoobi_eur    NUMERIC;
  v_charity_eur    NUMERIC;
  v_venditore_eur  NUMERIC;
  v_split_venditore NUMERIC;
  v_executed       BOOLEAN;
BEGIN
  IF NOT p_service_call THEN
    IF NOT EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
      RETURN '{"ok":false,"error":"NOT_ADMIN"}'::JSONB;
    END IF;
  END IF;

  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN
    RETURN '{"ok":false,"error":"AIRDROP_NOT_FOUND"}'::JSONB;
  END IF;

  SELECT COALESCE(SUM(aria_spent), 0) INTO v_aria_incassato
  FROM airdrop_participations WHERE airdrop_id = p_airdrop_id;

  IF v_aria_incassato = 0 THEN
    RETURN jsonb_build_object('ok', true, 'warning', 'NO_PARTICIPANTS', 'aria_incassato', 0);
  END IF;

  SELECT COALESCE(
    (SELECT value::NUMERIC FROM airdrop_config WHERE key = 'split_venditore'), 0.6799
  ) INTO v_split_venditore;

  v_venditore_eur := ROUND((v_aria_incassato * 0.10 * v_split_venditore)::NUMERIC, 2);
  v_fondo_eur     := ROUND((v_aria_incassato * 0.10 * 0.22)::NUMERIC, 2);
  v_airoobi_eur   := ROUND((v_aria_incassato * 0.10 * 0.10)::NUMERIC, 2);
  v_charity_eur   := ROUND((v_aria_incassato * 0.10 * 0.0001)::NUMERIC, 4);

  v_executed := v_airdrop.draw_executed_at IS NOT NULL;

  IF v_executed THEN
    v_success := (v_airdrop.status = 'completed');
    v_scores  := COALESCE(v_airdrop.draw_scores, calculate_winner_score(p_airdrop_id));
  ELSE
    v_success := v_airdrop.seller_acknowledge_decision = 'accept'
      OR v_airdrop.seller_min_price IS NULL
      OR v_venditore_eur >= v_airdrop.seller_min_price;
    v_scores := calculate_winner_score(p_airdrop_id);
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'airdrop_id', p_airdrop_id,
    'title', v_airdrop.title,
    'status', v_airdrop.status,
    'aria_incassato', v_aria_incassato,
    'eur_incassato', ROUND((v_aria_incassato * 0.10)::NUMERIC, 2),
    'success', v_success,
    'seller_min_price', v_airdrop.seller_min_price,
    'seller_cut_eur', v_venditore_eur,
    'split', jsonb_build_object(
      'venditore_eur', v_venditore_eur,
      'fondo_eur', v_fondo_eur,
      'airoobi_eur', v_airoobi_eur,
      'charity_eur', v_charity_eur
    ),
    'scores', v_scores,
    'winner_preview', CASE
      WHEN v_executed AND v_airdrop.winner_id IS NOT NULL THEN
        jsonb_build_object('user_id', v_airdrop.winner_id, 'score', v_airdrop.winner_score)
      WHEN NOT v_executed AND v_success AND v_scores IS NOT NULL AND jsonb_array_length(v_scores) > 0 THEN
        v_scores->0
      ELSE NULL
    END,
    'draw_executed', v_executed
  );
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_draw_preview(uuid, boolean) TO authenticated;

DO $$
DECLARE v_src TEXT;
BEGIN
  SELECT pg_get_functiondef('public.get_draw_preview(uuid,boolean)'::regprocedure) INTO v_src;
  IF v_src NOT ILIKE '%seller_acknowledge_decision%' THEN
    RAISE EXCEPTION 'test FAIL · preview senza logica PR-1';
  END IF;
  IF v_src NOT ILIKE '%v_executed%' THEN
    RAISE EXCEPTION 'test FAIL · preview senza esito reale';
  END IF;
  RAISE NOTICE 'integration test OK · get_draw_preview allineata';
END $$;
