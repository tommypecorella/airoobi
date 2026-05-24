-- ════════════════════════════════════════════════════════════════════
-- GS-15 REOPEN · fairness_threshold_remaining v3 · sentinel -1 + 4 stati
-- 24 May 2026 · finding UAT Skeezu airdrop test #1 (17bf0c89)
-- ════════════════════════════════════════════════════════════════════
-- ROBY_Reply_CCP_GS15_Reopen_Soglia_Contraddittoria_2026-05-24
--
-- Bug originale: la funzione v1 (20260524040000) usava modello
-- SIMULAZIONE BILANCIATA (leader proiettato) → su airdrop fresh con
-- loyalty disparate ritornava sempre 0 "matematicamente fuori".
-- Contraddiceva il guard (check_fairness_can_buy con can_buy=true) e
-- compute_checkmate_blocks (overtake in 25 blocchi).
--
-- Iter 1 v1: snapshot model basato su calculate_winner_score
-- (loyalty_mult derivato da historic_aria). Test FAIL: derivazione
-- diversa dal guard (guard usa my_category_score_snapshot_for con
-- storici_cat cross-airdrop categoria) → contraddizione persistente.
--
-- Iter 2 v2: uso my_category_score_snapshot_for + stessa formula
-- loyalty del guard (1 + LOG10(1 + storici/K)). Test FAIL: matematica
-- corretta, ma GREATEST(k-1, 0) collassa 2 casi distinti in 0:
--   (a) guard blocca (k=0 fail) → semantica "fuori"
--   (b) guard ok ma tolleranza zero (k=0 ok, k=1 fail) → semantica
--       "al limite, compra tutti i restanti per garantirti"
-- Conseguenza: caso ROBY (26 blocchi + loyalty 1.30 vs leader 50
-- stessa loyalty, 24 residui) my_max_at_k0 = sqrt(50)*1.30 = 9.1996...,
-- leader_score = 9.1996...05 → guard.can_buy=true MA k=1 fail (sqrt(49))
-- → return GREATEST(0,0)=0 → FE mostra "Matematicamente fuori".
-- Contraddizione.
--
-- v3 (questa migration): sentinel -1 per guard-block, distinto da 0
-- (tolleranza zero ma guard ok). Semantica FE 4 stati:
--   threshold = -1    → "Matematicamente fuori" (guard blocca)
--   threshold = 0     → "Al limite — compra tutti i restanti"
--   threshold = 1-300 → "Tra ~N blocchi venduti ad altri..."
--   threshold > 300   → nessun messaggio (situazione neutra)
--
-- Invariante hard: threshold = -1 ↔ guard.can_buy = false.
-- Coerenza con check_fairness_can_buy garantita per costruzione
-- (stessa fonte snapshot + stessa formula loyalty + check k=0 esplicito).
--
-- GS-15 parte 1 (claim "corsa in salita") NON toccata: resta verde.
-- ════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.fairness_threshold_remaining(p_airdrop_id UUID, p_user_id UUID)
RETURNS INT
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
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
  SELECT total_blocks, blocks_sold INTO v_total, v_sold FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN RETURN 0; END IF;
  v_remaining := GREATEST(v_total - v_sold, 0);
  IF v_remaining = 0 THEN RETURN 0; END IF;

  SELECT * INTO v_snapshot FROM public.my_category_score_snapshot_for(p_airdrop_id, p_user_id);
  IF v_snapshot IS NULL OR v_snapshot.leader_score IS NULL OR v_snapshot.leader_score = 0 THEN
    RETURN v_remaining;
  END IF;
  IF v_snapshot.my_position = 1 THEN
    RETURN v_remaining;
  END IF;

  -- Formula loyalty IDENTICA a check_fairness_can_buy (P0 GS-11 fix L96-97)
  v_loyalty := 1 + LOG(10, 1 + COALESCE(v_snapshot.storici_cat, 0) / GREATEST(COALESCE(v_snapshot.k_current, 100), 1));

  -- ═══ CHECK k=0 ESPLICITO = STESSO PREDICATO DEL GUARD ═══
  v_my_max_at_k0 := SQRT(GREATEST(v_snapshot.my_blocks_current + v_remaining, 0)::NUMERIC)
                  * v_loyalty
                  + COALESCE(v_snapshot.my_pity_bonus_current, 0);
  IF v_my_max_at_k0 < v_snapshot.leader_score THEN
    RETURN -1;  -- guard blocca · FE mostra "Matematicamente fuori"
  END IF;

  -- Da qui guard.can_buy=true. Trova tolleranza k >= 1.
  FOR k IN 1..LEAST(v_remaining, 10000) LOOP
    v_my_max_after := SQRT(GREATEST(v_snapshot.my_blocks_current + (v_remaining - k), 0)::NUMERIC)
                    * v_loyalty
                    + COALESCE(v_snapshot.my_pity_bonus_current, 0);
    IF v_my_max_after < v_snapshot.leader_score THEN
      RETURN k - 1;  -- k>=1 quindi return >= 0
    END IF;
  END LOOP;

  RETURN v_remaining;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fairness_threshold_remaining(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION public.fairness_threshold_remaining(UUID, UUID) IS
  'GS-15 reopen v3 · sentinel -1 = guard.can_buy=false ("fuori"). 0 = guard ok ma tolleranza zero ("al limite"). 1-300 = warning "tra ~N venduti". >300 = neutro. Invariante hard: threshold=-1 ↔ guard.can_buy=false. Stessa fonte snapshot + formula loyalty del guard.';

-- Integration test
DO $$
DECLARE
  v_ceo UUID;
  v_test1 UUID := '17bf0c89-86a7-40b3-8229-bb18297cb282'::UUID;
  v_thr INT;
  v_guard JSONB;
  v_can_buy BOOLEAN;
BEGIN
  SELECT id INTO v_ceo FROM auth.users WHERE email='ceo@airoobi.com' LIMIT 1;
  IF v_ceo IS NULL THEN RAISE NOTICE 'SKIPPED · CEO not found'; RETURN; END IF;
  IF NOT EXISTS (SELECT 1 FROM airdrops WHERE id = v_test1) THEN
    RAISE NOTICE 'SKIPPED · airdrop #1 not found'; RETURN;
  END IF;

  v_thr := fairness_threshold_remaining(v_test1, v_ceo);
  v_guard := check_fairness_can_buy(v_test1, v_ceo, 1);
  v_can_buy := (v_guard->>'can_buy')::BOOLEAN;

  IF v_can_buy AND v_thr = -1 THEN
    RAISE EXCEPTION 'GS-15 v3 FAIL · contraddizione: guard.can_buy=true ma threshold=-1';
  END IF;
  IF NOT v_can_buy AND v_thr <> -1 THEN
    RAISE EXCEPTION 'GS-15 v3 FAIL · contraddizione inversa: guard.can_buy=false ma threshold=%', v_thr;
  END IF;

  RAISE NOTICE 'GS-15 reopen v3 OK · airdrop #1 · threshold=% · guard=% · invariante rispettata', v_thr, v_can_buy;
END $$;
