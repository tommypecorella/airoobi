-- ══════════════════════════════════════════════════════════════════════════
--  GS-15 · fairness_threshold_remaining(p_airdrop_id, p_user_id)
--  Ritorna INT: blocchi che possono essere ancora venduti AD ALTRI (worst
--  case = al leader corrente) prima che vincere diventi matematicamente
--  impossibile per p_user_id (cioè leader_score_after_N >= my_max_after_N).
--  - my_max_after = sqrt(my_blocks + remaining - N) * my_loyalty + my_pity
--  - leader_after = sqrt(leader_blocks + N) * leader_loyalty + leader_pity
--  - Loop incrementale 1..remaining, return N-1 (N = primo passo impossibile)
--  Edge cases:
--  - utente leader o non-partecipante → return remaining (mai impossibile)
--  - remaining=0 → return 0
--  - mai impossibile entro remaining → return remaining
-- ══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.fairness_threshold_remaining(p_airdrop_id UUID, p_user_id UUID)
RETURNS INT
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_scoreboard JSONB;
  v_user_row JSONB; v_leader_row JSONB;
  v_my_blocks INT; v_my_loyalty NUMERIC; v_my_pity NUMERIC; v_my_rank INT;
  v_leader_blocks INT; v_leader_loyalty NUMERIC; v_leader_pity NUMERIC;
  v_remaining INT; v_total INT; v_sold INT;
  v_my_max_after NUMERIC; v_leader_after NUMERIC;
  N INT;
BEGIN
  SELECT total_blocks, blocks_sold INTO v_total, v_sold FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN RETURN 0; END IF;
  v_remaining := GREATEST(v_total - v_sold, 0);
  IF v_remaining = 0 THEN RETURN 0; END IF;

  v_scoreboard := calculate_winner_score(p_airdrop_id);
  IF v_scoreboard IS NULL OR jsonb_array_length(v_scoreboard) = 0 THEN RETURN v_remaining; END IF;

  SELECT s INTO v_user_row FROM jsonb_array_elements(v_scoreboard) s WHERE (s->>'user_id')::UUID = p_user_id LIMIT 1;
  SELECT s INTO v_leader_row FROM jsonb_array_elements(v_scoreboard) s WHERE (s->>'rank')::INT = 1 LIMIT 1;

  IF v_user_row IS NULL THEN
    RETURN v_remaining;
  END IF;

  v_my_blocks   := COALESCE((v_user_row->>'blocks')::INT, 0);
  v_my_loyalty  := COALESCE((v_user_row->>'loyalty_mult')::NUMERIC, 1.0);
  v_my_pity     := COALESCE((v_user_row->>'pity_bonus')::NUMERIC, 0);
  v_my_rank     := COALESCE((v_user_row->>'rank')::INT, 999);

  IF v_my_rank = 1 OR v_leader_row IS NULL THEN
    RETURN v_remaining;
  END IF;

  v_leader_blocks   := COALESCE((v_leader_row->>'blocks')::INT, 0);
  v_leader_loyalty  := COALESCE((v_leader_row->>'loyalty_mult')::NUMERIC, 1.0);
  v_leader_pity     := COALESCE((v_leader_row->>'pity_bonus')::NUMERIC, 0);

  FOR N IN 1..LEAST(v_remaining, 10000) LOOP
    v_my_max_after := SQRT(GREATEST(v_my_blocks + v_remaining - N, 0)::NUMERIC) * v_my_loyalty + v_my_pity;
    v_leader_after := SQRT(GREATEST(v_leader_blocks + N, 0)::NUMERIC) * v_leader_loyalty + v_leader_pity;
    IF v_leader_after >= v_my_max_after THEN
      RETURN GREATEST(N - 1, 0);
    END IF;
  END LOOP;

  RETURN v_remaining;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fairness_threshold_remaining(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION public.fairness_threshold_remaining(UUID, UUID) IS
  'GS-15 · Threshold blocchi residui prima che vincere diventi matematicamente impossibile per p_user_id (worst-case leader buys all). Return -1 not used; remaining se utente leader o non-partecipante; 0 se già impossibile o no remaining.';
