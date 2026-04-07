-- ══════════════════════════════════════════════════════════
--  Feed attività anonimizzato
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_activity_feed()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb := '[]'::jsonb;
  v_items jsonb := '[]'::jsonb;
  v_row RECORD;
BEGIN
  -- Ultimi acquisti blocchi (ultimi 60 min, anonimizzati)
  FOR v_row IN
    SELECT ap.blocks_count, a.title, ap.created_at
    FROM airdrop_participations ap
    JOIN airdrops a ON a.id = ap.airdrop_id
    WHERE ap.created_at > NOW() - INTERVAL '60 minutes'
    ORDER BY ap.created_at DESC
    LIMIT 5
  LOOP
    v_items := v_items || jsonb_build_object(
      'type', 'purchase',
      'text_it', 'Un utente ha acquistato ' || v_row.blocks_count || ' blocchi su ' || v_row.title,
      'text_en', 'A user purchased ' || v_row.blocks_count || ' blocks on ' || v_row.title,
      'time', v_row.created_at
    );
  END LOOP;

  -- Nuovi airdrop nelle ultime 24h
  FOR v_row IN
    SELECT title, category, created_at
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
      'time', v_row.created_at
    );
  END LOOP;

  -- Partecipanti nell'ultima ora per airdrop attivi
  FOR v_row IN
    SELECT a.title, COUNT(DISTINCT ap.user_id) AS cnt
    FROM airdrop_participations ap
    JOIN airdrops a ON a.id = ap.airdrop_id
    WHERE ap.created_at > NOW() - INTERVAL '60 minutes'
      AND a.status IN ('presale', 'sale')
    GROUP BY a.title
    HAVING COUNT(DISTINCT ap.user_id) >= 2
    ORDER BY cnt DESC
    LIMIT 3
  LOOP
    v_items := v_items || jsonb_build_object(
      'type', 'activity',
      'text_it', v_row.cnt || ' utenti sono entrati in ' || v_row.title || ' nell''ultima ora',
      'text_en', v_row.cnt || ' users joined ' || v_row.title || ' in the last hour',
      'time', NOW()
    );
  END LOOP;

  -- ROBI guadagnati oggi
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
$$;

GRANT EXECUTE ON FUNCTION get_activity_feed() TO authenticated;
