-- SPECCHIO (applicata al live 18 lug 2026 via MCP: 'activity_feed_lessico_step').
-- Lessico STEP nel feed «STA SUCCEDENDO» (screenshot Skeezu):
-- «Un utente ha acquistato N blocchi su X» → «Un utente ha percorso N Step su X»
-- (blocco/acquisto VIETATI in UI; di rimbalzo sistemato anche «1 blocchi»).
-- EN: «A user purchased N blocks» → «A user took N Step(s)».
-- Unica differenza rispetto alla versione precedente di get_activity_feed:
-- le due righe text_it/text_en del loop 'purchase'; il resto è invariato.
CREATE OR REPLACE FUNCTION public.get_activity_feed()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_items jsonb := '[]'::jsonb;
  v_row RECORD;
BEGIN
  FOR v_row IN
    SELECT ap.blocks_count, a.id AS airdrop_id, a.title, ap.created_at
    FROM airdrop_participations ap
    JOIN airdrops a ON a.id = ap.airdrop_id
    WHERE ap.created_at > NOW() - INTERVAL '60 minutes'
    ORDER BY ap.created_at DESC
    LIMIT 5
  LOOP
    v_items := v_items || jsonb_build_object(
      'type', 'purchase',
      'text_it', 'Un utente ha percorso ' || v_row.blocks_count || ' Step su ' || v_row.title,
      'text_en', 'A user took ' || v_row.blocks_count || ' Step' || CASE WHEN v_row.blocks_count = 1 THEN '' ELSE 's' END || ' on ' || v_row.title,
      'time', v_row.created_at,
      'airdrop_id', v_row.airdrop_id
    );
  END LOOP;

  FOR v_row IN
    SELECT id AS airdrop_id, title, category, created_at
    FROM airdrops
    WHERE status IN ('presale', 'sale')
      AND updated_at > NOW() - INTERVAL '24 hours'
    ORDER BY updated_at DESC
    LIMIT 3
  LOOP
    v_items := v_items || jsonb_build_object(
      'type', 'new_airdrop',
      'text_it', 'Nuovo airdrop disponibile in categoria ' || COALESCE(v_row.category, '—'),
      'text_en', 'New airdrop available in category ' || COALESCE(v_row.category, '—'),
      'time', v_row.created_at,
      'airdrop_id', v_row.airdrop_id,
      'category', v_row.category
    );
  END LOOP;

  FOR v_row IN
    SELECT a.id AS airdrop_id, a.title, COUNT(DISTINCT ap.user_id) AS cnt
    FROM airdrop_participations ap
    JOIN airdrops a ON a.id = ap.airdrop_id
    WHERE ap.created_at > NOW() - INTERVAL '60 minutes'
      AND a.status IN ('presale', 'sale')
    GROUP BY a.id, a.title
    HAVING COUNT(DISTINCT ap.user_id) >= 2
    ORDER BY cnt DESC
    LIMIT 3
  LOOP
    v_items := v_items || jsonb_build_object(
      'type', 'activity',
      'text_it', v_row.cnt || ' utenti sono entrati in ' || v_row.title || ' nell''ultima ora',
      'text_en', v_row.cnt || ' users joined ' || v_row.title || ' in the last hour',
      'time', NOW(),
      'airdrop_id', v_row.airdrop_id
    );
  END LOOP;

  FOR v_row IN
    SELECT COALESCE(SUM(shares), 0) AS total_robi
    FROM nft_rewards
    WHERE created_at >= CURRENT_DATE
      AND nft_type IN ('ROBI', 'NFT_REWARD')
  LOOP
    IF v_row.total_robi > 0 THEN
      v_items := v_items || jsonb_build_object(
        'type', 'robi',
        'text_it', ROUND(v_row.total_robi::numeric, 2) || ' ROBI guadagnati oggi sulla piattaforma',
        'text_en', ROUND(v_row.total_robi::numeric, 2) || ' ROBI earned today on the platform',
        'time', NOW()
      );
    END IF;
  END LOOP;

  RETURN v_items;
END;
$function$;
