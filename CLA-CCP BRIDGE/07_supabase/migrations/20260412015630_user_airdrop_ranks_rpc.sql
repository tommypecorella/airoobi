-- ══════════════════════════════════════════════════════════
--  RPC: get_my_airdrop_ranks()
--  Ritorna la posizione dell'utente corrente in ogni airdrop
--  attivo dove partecipa. Usa calculate_winner_score per
--  ottenere il rank reale (con F1, F2, tiebreaker).
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_my_airdrop_ranks()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_result  jsonb := '[]'::jsonb;
  v_airdrop RECORD;
  v_scores  jsonb;
  v_total   int;
  v_entry   jsonb;
  v_rank    int;
  i         int;
BEGIN
  IF v_user_id IS NULL THEN RETURN '[]'::jsonb; END IF;

  FOR v_airdrop IN
    SELECT DISTINCT ap.airdrop_id
    FROM airdrop_participations ap
    JOIN airdrops a ON a.id = ap.airdrop_id
    WHERE ap.user_id = v_user_id
      AND ap.cancelled_at IS NULL
      AND a.status IN ('presale', 'sale')
  LOOP
    v_scores := calculate_winner_score(v_airdrop.airdrop_id);
    v_total  := jsonb_array_length(v_scores);
    v_rank   := NULL;
    v_entry  := NULL;

    FOR i IN 0..v_total - 1 LOOP
      v_entry := v_scores->i;
      IF (v_entry->>'user_id')::UUID = v_user_id THEN
        v_rank := (v_entry->>'rank')::int;
        EXIT;
      END IF;
    END LOOP;

    IF v_rank IS NOT NULL THEN
      v_result := v_result || jsonb_build_object(
        'airdrop_id', v_airdrop.airdrop_id,
        'rank',       v_rank,
        'total',      v_total,
        'score',      (v_entry->>'score')::numeric
      );
    END IF;
  END LOOP;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_my_airdrop_ranks() TO authenticated;
