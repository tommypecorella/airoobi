-- 30 lug 2026 — Fix regressione post-pentest 28 lug.
-- Il pentest aveva REVOCATO EXECUTE (anon+authenticated) da fairness_threshold_remaining e
-- compute_checkmate_blocks perché il p_user_id lato client era un vettore IDOR (leggere la
-- posizione/fairness di un ALTRO utente). Effetto collaterale: 403 per gli utenti normali sulla
-- propria HUD della Salita (funzioni chiamate solo dal frontend, sempre col PROPRIO id).
--
-- Fix IDOR-safe, DB-only (nessun cambio frontend): guardia auth.uid() nel corpo che blocca SOLO il
-- caso IDOR reale (utente autenticato che chiede i dati di un altro) e re-grant a authenticated.
-- Verificato: nessun chiamante interno (le due funzioni non sono referenziate da altre funzioni),
-- quindi la guardia non rompe flussi interni. service_role/postgres (auth.uid() NULL) passano.
-- Applicata live via MCP (migration: refix_salita_idor_guard_regrant_authenticated). Test:
--   self-call → OK · cross-user call → 42501 forbidden.

CREATE OR REPLACE FUNCTION public.fairness_threshold_remaining(p_airdrop_id uuid, p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_snapshot     RECORD;
  v_remaining    INT;
  v_total        INT;
  v_sold         INT;
  v_loyalty      NUMERIC;
  v_my_max_at_k0 NUMERIC;
  v_my_max_after NUMERIC;
  k              INT;
BEGIN
  IF auth.uid() IS NOT NULL AND p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  SELECT total_blocks, blocks_sold INTO v_total, v_sold FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN RETURN 0; END IF;
  v_remaining := GREATEST(v_total - v_sold, 0);

  SELECT * INTO v_snapshot FROM public.my_category_score_snapshot_for(p_airdrop_id, p_user_id);
  IF v_snapshot IS NULL OR v_snapshot.leader_score IS NULL OR v_snapshot.leader_score = 0 THEN
    RETURN v_remaining;
  END IF;
  IF v_snapshot.my_position = 1 THEN
    RETURN v_remaining;
  END IF;

  v_loyalty := 1 + LOG(10, 1 + COALESCE(v_snapshot.storici_cat, 0) / GREATEST(COALESCE(v_snapshot.k_current, 100), 1));

  v_my_max_at_k0 := SQRT(GREATEST(v_snapshot.my_blocks_current + v_remaining, 0)::NUMERIC)
                  * v_loyalty
                  + COALESCE(v_snapshot.my_pity_bonus_current, 0);
  IF v_my_max_at_k0 < v_snapshot.leader_score THEN
    RETURN -1;
  END IF;

  IF v_remaining = 0 THEN
    RETURN 0;
  END IF;

  FOR k IN 1..LEAST(v_remaining, 10000) LOOP
    v_my_max_after := SQRT(GREATEST(v_snapshot.my_blocks_current + (v_remaining - k), 0)::NUMERIC)
                    * v_loyalty
                    + COALESCE(v_snapshot.my_pity_bonus_current, 0);
    IF v_my_max_after < v_snapshot.leader_score THEN
      RETURN k - 1;
    END IF;
  END LOOP;

  RETURN v_remaining;
END;
$function$;

CREATE OR REPLACE FUNCTION public.compute_checkmate_blocks(p_user_id uuid, p_airdrop_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_scoreboard JSONB; v_user_row JSONB; v_leader_row JSONB;
  v_total_blocks INT; v_blocks_sold INT; v_remaining INT;
  v_sold_pct NUMERIC; v_block_price INT;
  v_user_score NUMERIC; v_user_blocks INT;
  v_user_loyalty NUMERIC; v_user_pity NUMERIC;
  v_leader_score NUMERIC; v_leader_blocks INT;
  v_leader_loyalty NUMERIC; v_leader_pity NUMERIC;
  v_to_overtake INT; v_to_checkmate INT; v_leader_self_cm INT;
  v_threshold NUMERIC := 85.0;
  v_leader_max_if_buys_all NUMERIC;
BEGIN
  IF auth.uid() IS NOT NULL AND p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  SELECT total_blocks, blocks_sold, block_price_aria
    INTO v_total_blocks, v_blocks_sold, v_block_price
  FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'airdrop_not_found' USING ERRCODE='P0002'; END IF;

  v_remaining := GREATEST(v_total_blocks - v_blocks_sold, 0);
  v_sold_pct := CASE WHEN v_total_blocks > 0 THEN v_blocks_sold * 100.0 / v_total_blocks ELSE 0 END;
  v_scoreboard := calculate_winner_score(p_airdrop_id);

  SELECT s INTO v_user_row   FROM jsonb_array_elements(v_scoreboard) s WHERE (s->>'user_id')::UUID = p_user_id LIMIT 1;
  SELECT s INTO v_leader_row FROM jsonb_array_elements(v_scoreboard) s WHERE (s->>'rank')::INT = 1 LIMIT 1;

  v_user_score   := COALESCE((v_user_row->>'score')::NUMERIC, 0);
  v_user_blocks  := COALESCE((v_user_row->>'blocks')::INT, 0);
  v_user_loyalty := COALESCE((v_user_row->>'loyalty_mult')::NUMERIC, 1.0);
  v_user_pity    := COALESCE((v_user_row->>'pity_bonus')::NUMERIC, 0);

  v_leader_score   := COALESCE((v_leader_row->>'score')::NUMERIC, 0);
  v_leader_blocks  := COALESCE((v_leader_row->>'blocks')::INT, 0);
  v_leader_loyalty := COALESCE((v_leader_row->>'loyalty_mult')::NUMERIC, 1.0);
  v_leader_pity    := COALESCE((v_leader_row->>'pity_bonus')::NUMERIC, 0);

  IF v_user_loyalty > 0 THEN
    v_to_overtake := GREATEST(
      CEIL(POWER(GREATEST(v_leader_score + 0.0001 - v_user_pity, 0) / v_user_loyalty, 2))::INT - v_user_blocks,
      0
    );
  ELSE v_to_overtake := 0; END IF;

  v_leader_max_if_buys_all := SQRT(GREATEST(v_leader_blocks + v_remaining, 0)::NUMERIC) * v_leader_loyalty + v_leader_pity;
  IF v_user_loyalty > 0 THEN
    v_to_checkmate := GREATEST(
      CEIL(POWER(GREATEST(v_leader_max_if_buys_all + 0.0001 - v_user_pity, 0) / v_user_loyalty, 2))::INT - v_user_blocks,
      0
    );
  ELSE v_to_checkmate := 0; END IF;

  v_leader_self_cm := GREATEST(
    CEIL(v_total_blocks * v_threshold / 100.0)::INT - v_blocks_sold, 0
  );

  RETURN jsonb_build_object(
    'user_score_current', v_user_score,
    'user_blocks_current', v_user_blocks,
    'user_loyalty_mult', v_user_loyalty,
    'user_pity_bonus', v_user_pity,
    'leader_user_id', v_leader_row->>'user_id',
    'leader_score_current', v_leader_score,
    'leader_blocks_current', v_leader_blocks,
    'blocks_to_overtake_leader', v_to_overtake,
    'aria_cost_to_overtake', v_to_overtake * v_block_price,
    'blocks_to_checkmate_field', v_to_checkmate,
    'aria_cost_to_checkmate', v_to_checkmate * v_block_price,
    'leader_blocks_to_self_checkmate', v_leader_self_cm,
    'blocks_remaining', v_remaining,
    'current_sold_pct', ROUND(v_sold_pct, 2),
    'scacco_matto_threshold_sold_pct', v_threshold,
    'scacco_matto_active', (v_sold_pct >= v_threshold AND v_to_overtake > v_remaining)
  );
END;
$function$;

GRANT EXECUTE ON FUNCTION public.fairness_threshold_remaining(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.compute_checkmate_blocks(uuid, uuid) TO authenticated;
