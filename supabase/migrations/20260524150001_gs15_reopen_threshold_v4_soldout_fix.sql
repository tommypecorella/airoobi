-- GS-15 v4 (fix sold-out edge case)
-- v3 (20260524150000) faceva early-return su v_remaining=0 PRIMA del check
-- k=0 → su airdrop sold-out con utente non-vincibile (es. test #2 0dac01af)
-- ritornava 0 invece di -1, violando invariante con guard.can_buy=false.
-- Fix: spostare check k=0 prima dell'early return remaining=0.

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
    RETURN -1;  -- guard blocca · FE "Matematicamente fuori"
  END IF;

  IF v_remaining = 0 THEN RETURN 0; END IF;

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
$$;

GRANT EXECUTE ON FUNCTION public.fairness_threshold_remaining(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION public.fairness_threshold_remaining(UUID, UUID) IS
  'GS-15 reopen v4 · sentinel -1 = guard.can_buy=false. 0 = tolleranza zero (al limite). 1-300 = warning. >300 = neutro. Stessa fonte snapshot + formula loyalty del guard. Edge case sold-out: check k=0 prima di early return.';

-- Integration test invariante esteso (entrambi i test airdrop GS-16)
DO $$
DECLARE
  v_ceo UUID;
  v_aid UUID;
  v_thr INT;
  v_guard JSONB;
  v_can_buy BOOLEAN;
BEGIN
  SELECT id INTO v_ceo FROM auth.users WHERE email='ceo@airoobi.com' LIMIT 1;
  IF v_ceo IS NULL THEN RETURN; END IF;

  FOREACH v_aid IN ARRAY ARRAY[
    '17bf0c89-86a7-40b3-8229-bb18297cb282'::UUID,
    '0dac01af-ec75-4fd3-910a-20af6d1a446b'::UUID
  ] LOOP
    IF NOT EXISTS (SELECT 1 FROM airdrops WHERE id = v_aid) THEN CONTINUE; END IF;
    v_thr := fairness_threshold_remaining(v_aid, v_ceo);
    v_guard := check_fairness_can_buy(v_aid, v_ceo, 1);
    v_can_buy := (v_guard->>'can_buy')::BOOLEAN;
    IF v_can_buy AND v_thr = -1 THEN
      RAISE EXCEPTION 'v4 FAIL airdrop % · guard=true threshold=-1', v_aid;
    END IF;
    IF NOT v_can_buy AND v_thr <> -1 THEN
      RAISE EXCEPTION 'v4 FAIL airdrop % · guard=false threshold=%', v_aid, v_thr;
    END IF;
    RAISE NOTICE 'v4 OK · airdrop % · threshold=% · guard=%', v_aid, v_thr, v_can_buy;
  END LOOP;
END $$;
