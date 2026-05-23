-- ════════════════════════════════════════════════════════════════
-- P0 GS-11 · fairness guard intent fix
-- ════════════════════════════════════════════════════════════════
-- Bug: check_fairness_can_buy() proiettava lo score "max raggiungibile"
-- usando solo i blocchi del singolo acquisto richiesto:
--     SQRT(v_my_blocks + LEAST(p_extra_blocks, v_remaining))
-- Mentre il commento sopra la formula dichiara l'intent:
--     "max f_base achievable se compra TUTTI i blocchi residui + p_extra"
--
-- Conseguenza: chiunque fosse indietro in classifica e cercasse di
-- scalare comprando 1 blocco alla volta veniva respinto con
-- `fairness_block:math_impossible`, anche quando — comprando in teoria
-- tutti i blocchi residui — avrebbe potuto superare il leader.
--
-- Riprodotto live su account CEO + airdrop "Fontanella smart per
-- animali" (5857e29d-5e1b-4d4e-a35d-dd4a51045c47):
--   my_blocks=6, leader_score=12.247 (SQRT 150), remaining=249.
--   Code attuale: SQRT(6+1) = 2.6458 < 12.247 → math_impossible
--   Intent:       SQRT(6+249) = 15.97 > 12.247 → can_buy=true
--
-- Coerenza repo:
--   - FE src/airdrop.js:972 calcola myMaxFBase con (myBlocks+remainingBlocks) — CORRETTO
--   - SQL my_category_score_snapshot (scoring_v5_pity.sql:421) usa (v_my_blocks + v_remaining) — CORRETTO
--   - SQL check_fairness_lockdown (scoring_v5_pity.sql:561) usa (blocks + v_remaining) — CORRETTO
--   - SQL check_fairness_can_buy (fairness_guard_serverside.sql:75) usa LEAST(p_extra, v_remaining) — BUG (unico)
--
-- Fix: allineare la riga al comment intent. 1 carattere semantico:
--   LEAST(p_extra_blocks, v_remaining) → v_remaining
--
-- p_extra_blocks resta in firma per compat (chiamato da buy_blocks con
-- array length); diventa ignorato nella proiezione (è corretto: il
-- guard testa "potresti mai vincere", non "questa specifica mossa
-- basta").
--
-- Decision trail:
--   - Diagnosi: CCP_RS_GoldenSession_P0_GS11_Diagnosis_2026-05-23.md
--   - GO Skeezu Opzione A: ROBY_Reply_CCP_GS11_Diagnosis_GO_2026-05-23.md
--   - Grep RPC sorelle: clean (nessuna altra RPC con la stessa logica)
-- ════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.check_fairness_can_buy(
  p_airdrop_id    UUID,
  p_user_id       UUID,
  p_extra_blocks  INT DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_my_score      NUMERIC;
  v_leader_score  NUMERIC;
  v_my_max_score  NUMERIC;
  v_pos           INT;
  v_remaining     INT;
  v_my_pity       NUMERIC;
  v_storici       NUMERIC;
  v_K             NUMERIC;
  v_my_blocks     INT;
  v_snapshot      jsonb;
BEGIN
  SELECT jsonb_build_object(
    'my_score', m.my_score,
    'leader_score', m.leader_score,
    'my_position', m.my_position,
    'my_pity_bonus_current', m.my_pity_bonus_current,
    'storici_cat', m.storici_cat,
    'k_current', m.k_current,
    'my_blocks_current', m.my_blocks_current
  )
  INTO v_snapshot
  FROM public.my_category_score_snapshot_for(p_airdrop_id, p_user_id) m;

  IF v_snapshot IS NULL THEN
    RETURN jsonb_build_object('can_buy', true, 'reason', 'no_score_data');
  END IF;

  v_my_score     := COALESCE((v_snapshot->>'my_score')::NUMERIC, 0);
  v_leader_score := COALESCE((v_snapshot->>'leader_score')::NUMERIC, 0);
  v_pos          := COALESCE((v_snapshot->>'my_position')::INT, 1);
  v_my_pity      := COALESCE((v_snapshot->>'my_pity_bonus_current')::NUMERIC, 0);
  v_storici      := COALESCE((v_snapshot->>'storici_cat')::NUMERIC, 0);
  v_K            := GREATEST(COALESCE((v_snapshot->>'k_current')::NUMERIC, 100), 1);
  v_my_blocks    := COALESCE((v_snapshot->>'my_blocks_current')::INT, 0);

  SELECT (total_blocks - blocks_sold) INTO v_remaining
    FROM public.airdrops WHERE id = p_airdrop_id;

  IF v_remaining IS NULL THEN
    RETURN jsonb_build_object('can_buy', false, 'reason', 'airdrop_not_found');
  END IF;

  IF v_pos = 1 OR v_leader_score = 0 THEN
    RETURN jsonb_build_object('can_buy', true, 'reason', 'leader_or_no_data');
  END IF;

  -- Max f_base achievable se compra TUTTI i blocchi residui (intent allineato)
  v_my_max_score := SQRT(v_my_blocks + v_remaining)
                  * (1 + LOG(10, 1 + v_storici / v_K))
                  + v_my_pity;

  IF v_my_max_score < v_leader_score THEN
    RETURN jsonb_build_object(
      'can_buy', false,
      'reason', 'math_impossible',
      'my_max_score', v_my_max_score,
      'leader_score', v_leader_score,
      'remaining', v_remaining
    );
  END IF;

  RETURN jsonb_build_object('can_buy', true, 'reason', 'ok');
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_fairness_can_buy(UUID, UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_fairness_can_buy(UUID, UUID, INT) TO service_role;

-- ════════════════════════════════════════════════════════════════
-- Integration test (in-transaction, BEGIN ... ROLLBACK)
-- Documentazione del comportamento atteso post-fix. Eseguibile a mano
-- via psql con `\i` se serve verifica successiva (non viene applicato
-- automaticamente alla migration — è documentazione).
-- ════════════════════════════════════════════════════════════════
-- Test 2 (regressione GS-11): repro live · CEO su Fontanella
--   SELECT public.check_fairness_can_buy(
--     '5857e29d-5e1b-4d4e-a35d-dd4a51045c47',  -- airdrop Fontanella
--     '3da461f0-98e3-4877-b9db-a91e1dd4e6b7',  -- ceo@airoobi.com
--     1                                          -- 1 blocco
--   );
-- Expected post-fix: {"can_buy": true, "reason": "ok"}
-- Pre-fix: {"can_buy": false, "reason": "math_impossible"}
