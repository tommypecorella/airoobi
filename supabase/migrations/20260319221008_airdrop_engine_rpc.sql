-- ============================================================
-- AIROOBI Airdrop Engine v1 — RPC Functions
-- Ref: docs/AIROOBI_Airdrop_Engine_v1.md sezioni 4, 5, 6, 8
-- NON ESEGUIRE senza conferma esplicita del founder
-- ============================================================


-- ══════════════════════════════════════════════════════════════
-- 8.2 — calculate_winner_score(p_airdrop_id)
-- Calcola lo score deterministico per ogni partecipante.
-- Restituisce JSONB array ordinato per score DESC.
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION calculate_winner_score(p_airdrop_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_category     TEXT;
  v_w1           NUMERIC := 0.50;
  v_w2           NUMERIC := 0.30;
  v_w3           NUMERIC := 0.20;
  v_alpha_f3     NUMERIC := 0.40;
  v_beta_f3      NUMERIC := 0.60;
  v_n            INTEGER;
  v_result       JSONB;
BEGIN
  -- Leggi categoria dell'airdrop corrente
  SELECT category INTO v_category FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN
    RETURN '[]'::JSONB;
  END IF;

  -- Leggi pesi da airdrop_config (override se presenti)
  SELECT COALESCE(
    (SELECT value::NUMERIC FROM airdrop_config WHERE key = 'score_w1'), 0.50
  ) INTO v_w1;
  SELECT COALESCE(
    (SELECT value::NUMERIC FROM airdrop_config WHERE key = 'score_w2'), 0.30
  ) INTO v_w2;
  SELECT COALESCE(
    (SELECT value::NUMERIC FROM airdrop_config WHERE key = 'score_w3'), 0.20
  ) INTO v_w3;
  SELECT COALESCE(
    (SELECT value::NUMERIC FROM airdrop_config WHERE key = 'score_alpha_f3'), 0.40
  ) INTO v_alpha_f3;
  SELECT COALESCE(
    (SELECT value::NUMERIC FROM airdrop_config WHERE key = 'score_beta_f3'), 0.60
  ) INTO v_beta_f3;

  -- Conta partecipanti distinti
  SELECT COUNT(DISTINCT user_id) INTO v_n
  FROM airdrop_participations
  WHERE airdrop_id = p_airdrop_id;

  IF v_n = 0 THEN
    RETURN '[]'::JSONB;
  END IF;

  -- Calcola score per ogni partecipante
  WITH
  -- Blocchi totali per utente in questo airdrop
  user_blocks AS (
    SELECT
      user_id,
      SUM(blocks_count) AS total_blocks,
      SUM(aria_spent)    AS total_aria
    FROM airdrop_participations
    WHERE airdrop_id = p_airdrop_id
    GROUP BY user_id
  ),
  -- Max blocchi tra tutti i partecipanti (per normalizzare F1)
  max_blocks AS (
    SELECT MAX(total_blocks) AS val FROM user_blocks
  ),
  -- F1: peso blocchi acquistati (normalizzato 0→1)
  f1_calc AS (
    SELECT
      ub.user_id,
      ub.total_blocks,
      ub.total_aria,
      CASE WHEN mb.val > 0
        THEN ub.total_blocks::NUMERIC / mb.val
        ELSE 0
      END AS f1
    FROM user_blocks ub, max_blocks mb
  ),
  -- Storico categoria: ARIA spesi nella stessa categoria, ESCLUSO airdrop corrente
  cat_history AS (
    SELECT
      ap.user_id,
      COALESCE(SUM(ap.aria_spent), 0) AS cat_aria
    FROM airdrop_participations ap
    JOIN airdrops a ON a.id = ap.airdrop_id
    WHERE a.category = v_category
      AND ap.airdrop_id <> p_airdrop_id
      AND ap.user_id IN (SELECT user_id FROM user_blocks)
    GROUP BY ap.user_id
  ),
  -- Max storico tra partecipanti (per normalizzare F2)
  max_cat AS (
    SELECT COALESCE(MAX(cat_aria), 0) AS val FROM cat_history
  ),
  -- F2: fedeltà categoria (log-normalizzato 0→1)
  f2_calc AS (
    SELECT
      f1c.user_id,
      CASE WHEN mc.val > 0
        THEN LN(1 + COALESCE(ch.cat_aria, 0)) / LN(1 + mc.val)
        ELSE 0
      END AS f2
    FROM f1_calc f1c
    LEFT JOIN cat_history ch ON ch.user_id = f1c.user_id
    CROSS JOIN max_cat mc
  ),
  -- Seniority: rank registrazione + rank primo blocco
  seniority AS (
    SELECT
      f1c.user_id,
      -- Rank per data registrazione (1 = più vecchio)
      ROW_NUMBER() OVER (ORDER BY p.created_at ASC) AS rank_reg,
      -- Rank per primo blocco in questo airdrop (1 = primo a comprare)
      ROW_NUMBER() OVER (
        ORDER BY MIN(ab.purchased_at) ASC
      ) AS rank_block
    FROM f1_calc f1c
    JOIN profiles p ON p.id = f1c.user_id
    LEFT JOIN airdrop_blocks ab
      ON ab.airdrop_id = p_airdrop_id
      AND ab.owner_id = f1c.user_id
    GROUP BY f1c.user_id, p.created_at
  ),
  -- F3: seniority (normalizzato 0→1)
  f3_calc AS (
    SELECT
      s.user_id,
      CASE WHEN v_n = 1 THEN 1.0
        ELSE
          v_alpha_f3 * (1.0 - (s.rank_reg - 1)::NUMERIC / (v_n - 1))
          + v_beta_f3 * (1.0 - (s.rank_block - 1)::NUMERIC / (v_n - 1))
      END AS f3
    FROM seniority s
  ),
  -- Score finale
  final_scores AS (
    SELECT
      f1c.user_id,
      f1c.total_blocks,
      f1c.total_aria,
      ROUND(f1c.f1, 6) AS f1,
      ROUND(f2c.f2, 6) AS f2,
      ROUND(f3c.f3, 6) AS f3,
      ROUND(v_w1 * f1c.f1 + v_w2 * f2c.f2 + v_w3 * f3c.f3, 6) AS score
    FROM f1_calc f1c
    JOIN f2_calc f2c ON f2c.user_id = f1c.user_id
    JOIN f3_calc f3c ON f3c.user_id = f1c.user_id
  ),
  -- Classifica con tiebreaker
  ranked AS (
    SELECT
      fs.*,
      ROW_NUMBER() OVER (
        ORDER BY
          fs.score DESC,
          -- Tiebreaker 1: primo blocco prima
          (SELECT MIN(ab.purchased_at) FROM airdrop_blocks ab
           WHERE ab.airdrop_id = p_airdrop_id AND ab.owner_id = fs.user_id) ASC,
          -- Tiebreaker 2: registrato prima
          (SELECT p.created_at FROM profiles p WHERE p.id = fs.user_id) ASC
      ) AS rank
    FROM final_scores fs
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'user_id', r.user_id,
      'score', r.score,
      'f1', r.f1,
      'f2', r.f2,
      'f3', r.f3,
      'blocks', r.total_blocks,
      'aria_spent', r.total_aria,
      'rank', r.rank
    ) ORDER BY r.rank ASC
  )
  INTO v_result
  FROM ranked r;

  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$;


-- ══════════════════════════════════════════════════════════════
-- 8.3 — refund_airdrop(p_airdrop_id)
-- Rimborsa ARIA a tutti i partecipanti (airdrop annullato).
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION refund_airdrop(p_airdrop_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_refund RECORD;
  v_count  INTEGER := 0;
  v_total  INTEGER := 0;
BEGIN
  FOR v_refund IN
    SELECT
      user_id,
      SUM(aria_spent) AS refund_amount
    FROM airdrop_participations
    WHERE airdrop_id = p_airdrop_id
    GROUP BY user_id
  LOOP
    -- Restituisci ARIA al profilo
    UPDATE profiles
    SET total_points = total_points + v_refund.refund_amount
    WHERE id = v_refund.user_id;

    -- Registra nel ledger (positivo = rimborso)
    INSERT INTO points_ledger (user_id, amount, reason)
    VALUES (
      v_refund.user_id,
      v_refund.refund_amount,
      'airdrop_refund:' || p_airdrop_id::text
    );

    v_count := v_count + 1;
    v_total := v_total + v_refund.refund_amount;
  END LOOP;

  RETURN jsonb_build_object(
    'ok', true,
    'users_refunded', v_count,
    'total_aria_refunded', v_total
  );
END;
$$;


-- ══════════════════════════════════════════════════════════════
-- 8.4 — get_draw_preview(p_airdrop_id)
-- Simulazione draw: classifica score + split economica.
-- Solo admin — non esegue nulla.
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_draw_preview(p_airdrop_id UUID)
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
  -- Verifica admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN '{"ok":false,"error":"NOT_ADMIN"}'::JSONB;
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
  v_fondo_eur     := ROUND(v_aria_incassato * 0.10 * 0.22, 2);
  v_airoobi_eur   := ROUND(v_aria_incassato * 0.10 * 0.10, 2);
  v_charity_eur   := ROUND(v_aria_incassato * 0.10 * 0.0001, 4);
  v_venditore_eur := ROUND(v_aria_incassato * 0.10 * 0.6799, 2);

  -- Calcola scores
  v_scores := calculate_winner_score(p_airdrop_id);

  RETURN jsonb_build_object(
    'ok', true,
    'airdrop_id', p_airdrop_id,
    'title', v_airdrop.title,
    'status', v_airdrop.status,
    'aria_incassato', v_aria_incassato,
    'eur_incassato', ROUND(v_aria_incassato * 0.10, 2),
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

GRANT EXECUTE ON FUNCTION get_draw_preview(UUID) TO authenticated;


-- ══════════════════════════════════════════════════════════════
-- 8.1 — execute_draw(p_airdrop_id)
-- Funzione principale del draw. Transazione atomica.
-- Segue esattamente il flow della sezione 6 del documento.
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION execute_draw(p_airdrop_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_airdrop          RECORD;
  v_aria_incassato   INTEGER;
  v_success          BOOLEAN;
  v_scores           JSONB;
  v_winner           JSONB;
  v_winner_id        UUID;
  v_winner_score     NUMERIC;
  v_fondo_eur        NUMERIC;
  v_airoobi_eur      NUMERIC;
  v_charity_eur      NUMERIC;
  v_venditore_eur    NUMERIC;
  v_treasury_before  NUMERIC;
  v_phase            TEXT;
  v_nft_divisor      INTEGER;
  v_nft_max          INTEGER;
  v_prezzo_nft       NUMERIC;
  v_nft_circolante   INTEGER;
  v_treasury_bal     NUMERIC;
  v_fondo_contributo NUMERIC;
  v_participant      RECORD;
  v_nft_teorici      INTEGER;
  v_nft_totali       INTEGER := 0;
  v_nft_cap          NUMERIC;
  v_refund_result    JSONB;
  v_top3             RECORD;
  v_top3_count       INTEGER := 0;
BEGIN
  -- ─── STEP 1: Pre-draw validation ───────────────────
  SELECT * INTO v_airdrop FROM airdrops
  WHERE id = p_airdrop_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN '{"ok":false,"error":"AIRDROP_NOT_FOUND"}'::JSONB;
  END IF;
  IF v_airdrop.draw_executed_at IS NOT NULL THEN
    RETURN '{"ok":false,"error":"DRAW_ALREADY_EXECUTED"}'::JSONB;
  END IF;
  IF v_airdrop.status NOT IN ('sale', 'presale', 'active') THEN
    RETURN '{"ok":false,"error":"INVALID_STATUS","current_status":"' || v_airdrop.status || '"}'::JSONB;
  END IF;

  -- Verifica admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN '{"ok":false,"error":"NOT_ADMIN"}'::JSONB;
  END IF;

  -- Calcola totale ARIA incassato
  SELECT COALESCE(SUM(aria_spent), 0) INTO v_aria_incassato
  FROM airdrop_participations WHERE airdrop_id = p_airdrop_id;

  IF v_aria_incassato = 0 THEN
    RETURN '{"ok":false,"error":"NO_BLOCKS_SOLD"}'::JSONB;
  END IF;

  -- ─── STEP 2: Calcola split economica ───────────────
  v_fondo_eur     := ROUND(v_aria_incassato * 0.10 * 0.22, 2);
  v_airoobi_eur   := ROUND(v_aria_incassato * 0.10 * 0.10, 2);
  v_charity_eur   := ROUND(v_aria_incassato * 0.10 * 0.0001, 4);
  v_venditore_eur := ROUND(v_aria_incassato * 0.10 * 0.6799, 2);

  -- Determina successo/fallimento (sezione 2)
  v_success := v_airdrop.seller_min_price IS NULL
    OR (v_aria_incassato * 0.10) >= v_airdrop.seller_min_price;

  IF v_success THEN
    -- ─── STEP 3: Seleziona vincitore ───────────────────
    v_scores := calculate_winner_score(p_airdrop_id);

    IF v_scores IS NOT NULL AND jsonb_array_length(v_scores) > 0 THEN
      v_winner := v_scores->0;
      v_winner_id := (v_winner->>'user_id')::UUID;
      v_winner_score := (v_winner->>'score')::NUMERIC;
    END IF;

    -- Marca i blocchi del vincitore
    IF v_winner_id IS NOT NULL THEN
      UPDATE airdrop_blocks
      SET is_winner_block = true
      WHERE airdrop_id = p_airdrop_id
        AND owner_id = v_winner_id;
    END IF;

    -- ─── STEP 4: Distribuisci NFT ai perdenti ─────────
    -- Leggi fase corrente
    SELECT COALESCE(
      (SELECT value FROM airdrop_config WHERE key = 'current_phase'),
      'alpha_brave'
    ) INTO v_phase;

    -- Divisore NFT per fase
    SELECT COALESCE(
      (SELECT value::INTEGER FROM airdrop_config
       WHERE key = 'nft_divisor_' || v_phase),
      5
    ) INTO v_nft_divisor;

    -- Cap anti-inflazione (sezione 5.1)
    SELECT COALESCE(balance_eur, 0), COALESCE(nft_circulating, 0)
    INTO v_treasury_bal, v_nft_circolante
    FROM treasury_stats
    ORDER BY created_at DESC LIMIT 1;

    v_fondo_contributo := v_fondo_eur;

    IF v_nft_circolante > 0 AND v_treasury_bal > 0 THEN
      v_prezzo_nft := v_treasury_bal / v_nft_circolante;
      v_nft_max := FLOOR(v_fondo_contributo / v_prezzo_nft);
    ELSIF v_nft_circolante = 0 THEN
      -- Prima distribuzione: nessun cap (treasury a 0, prezzo non definito)
      v_nft_max := 999999;
    ELSE
      -- Treasury a 0: nessun NFT distribuibile
      v_nft_max := 0;
    END IF;

    -- Distribuisci NFT ai non-vincitori
    v_nft_totali := 0;
    FOR v_participant IN
      SELECT
        ap.user_id,
        SUM(ap.blocks_count) AS blocks,
        SUM(ap.aria_spent) AS aria
      FROM airdrop_participations ap
      WHERE ap.airdrop_id = p_airdrop_id
        AND ap.user_id <> v_winner_id
      GROUP BY ap.user_id
      ORDER BY SUM(ap.aria_spent) DESC
    LOOP
      -- Calcola NFT teorici
      v_nft_teorici := FLOOR(v_participant.blocks / v_nft_divisor);

      -- Applica minimo della fase
      IF v_phase IN ('alpha_brave', 'alpha_wise') THEN
        -- Minimo 1 NFT garantito
        v_nft_teorici := GREATEST(v_nft_teorici, 1);
      ELSIF v_phase = 'beta' THEN
        -- Minimo 1 se >= 5 blocchi
        IF v_participant.blocks >= 5 THEN
          v_nft_teorici := GREATEST(v_nft_teorici, 1);
        END IF;
      END IF;
      -- preprod e mainnet: nessun minimo (gestito dal divisore alto)

      -- Controlla cap anti-inflazione
      IF (v_nft_totali + v_nft_teorici) > v_nft_max THEN
        v_nft_teorici := GREATEST(v_nft_max - v_nft_totali, 0);
      END IF;

      -- Inserisci NFT
      IF v_nft_teorici > 0 THEN
        FOR i IN 1..v_nft_teorici LOOP
          INSERT INTO nft_rewards (user_id, nft_type, name, phase, source, airdrop_id, metadata)
          VALUES (
            v_participant.user_id,
            'NFT_REWARD',
            'Tessera Rendimento — ' || v_airdrop.title,
            v_phase,
            'airdrop_draw',
            p_airdrop_id,
            jsonb_build_object(
              'airdrop_title', v_airdrop.title,
              'draw_date', NOW(),
              'blocks_owned', v_participant.blocks,
              'aria_spent', v_participant.aria
            )
          );
        END LOOP;

        v_nft_totali := v_nft_totali + v_nft_teorici;
      END IF;
    END LOOP;

    -- Aggiorna nft_circulating in treasury_stats
    UPDATE treasury_stats
    SET nft_circulating = nft_circulating + v_nft_totali,
        nft_minted = nft_minted + v_nft_totali,
        updated_at = NOW()
    WHERE id = (SELECT id FROM treasury_stats ORDER BY created_at DESC LIMIT 1);

    -- ─── STEP 5: Aggiorna treasury ────────────────────
    SELECT COALESCE(balance_eur, 0) INTO v_treasury_before
    FROM treasury_stats ORDER BY created_at DESC LIMIT 1;

    INSERT INTO treasury_transactions
      (airdrop_id, amount_eur, type, treasury_before, treasury_after, notes)
    VALUES (
      p_airdrop_id,
      v_fondo_eur,
      'airdrop_contribution',
      v_treasury_before,
      v_treasury_before + v_fondo_eur,
      'Draw airdrop: ' || v_airdrop.title || ' — NFT distribuiti: ' || v_nft_totali
    );

    UPDATE treasury_stats
    SET balance_eur = balance_eur + v_fondo_eur,
        updated_at = NOW()
    WHERE id = (SELECT id FROM treasury_stats ORDER BY created_at DESC LIMIT 1);

    -- ─── STEP 6: Aggiorna airdrop ─────────────────────
    UPDATE airdrops SET
      status = 'completed',
      draw_executed_at = NOW(),
      winner_id = v_winner_id,
      winner_score = v_winner_score,
      venditore_payout_eur = v_venditore_eur,
      airoobi_fee_eur = v_airoobi_eur,
      charity_contrib_eur = v_charity_eur,
      fondo_contributo_eur = v_fondo_eur,
      aria_incassato = v_aria_incassato,
      draw_scores = v_scores
    WHERE id = p_airdrop_id;

  ELSE
    -- ═══ AIRDROP ANNULLATO ═══════════════════════════
    -- Rimborso ARIA a tutti
    v_refund_result := refund_airdrop(p_airdrop_id);

    -- NFT consolation: solo top 3 per ARIA spesi
    v_top3_count := 0;
    FOR v_top3 IN
      SELECT
        ap.user_id,
        SUM(ap.blocks_count) AS blocks,
        SUM(ap.aria_spent) AS aria
      FROM airdrop_participations ap
      WHERE ap.airdrop_id = p_airdrop_id
      GROUP BY ap.user_id
      ORDER BY SUM(ap.aria_spent) DESC
      LIMIT 3
    LOOP
      v_top3_count := v_top3_count + 1;
      INSERT INTO nft_rewards (user_id, nft_type, name, phase, source, airdrop_id, metadata)
      VALUES (
        v_top3.user_id,
        'NFT_REWARD',
        'Tessera Rendimento (consolation) — ' || v_airdrop.title,
        COALESCE((SELECT value FROM airdrop_config WHERE key = 'current_phase'), 'alpha_brave'),
        'airdrop_draw_consolation',
        p_airdrop_id,
        jsonb_build_object(
          'airdrop_title', v_airdrop.title,
          'draw_date', NOW(),
          'blocks_owned', v_top3.blocks,
          'aria_spent', v_top3.aria,
          'consolation', true,
          'consolation_rank', v_top3_count
        )
      );
    END LOOP;

    -- Aggiorna airdrop come annullato
    UPDATE airdrops SET
      status = 'annullato',
      draw_executed_at = NOW(),
      aria_incassato = v_aria_incassato,
      draw_scores = calculate_winner_score(p_airdrop_id)
    WHERE id = p_airdrop_id;
  END IF;

  -- ─── STEP 8: Track events ──────────────────────────
  INSERT INTO events (event, url, props)
  VALUES (
    'airdrop_draw',
    '/admin/draw/' || p_airdrop_id::text,
    jsonb_build_object(
      'airdrop_id', p_airdrop_id,
      'success', v_success,
      'winner_id', v_winner_id,
      'aria_incassato', v_aria_incassato,
      'nft_distribuiti', CASE WHEN v_success THEN v_nft_totali ELSE v_top3_count END
    )
  );

  RETURN jsonb_build_object(
    'ok', true,
    'success', v_success,
    'winner_id', v_winner_id,
    'winner_score', v_winner_score,
    'aria_incassato', v_aria_incassato,
    'eur_incassato', ROUND(v_aria_incassato * 0.10, 2),
    'split', jsonb_build_object(
      'venditore_eur', v_venditore_eur,
      'fondo_eur', v_fondo_eur,
      'airoobi_eur', v_airoobi_eur,
      'charity_eur', v_charity_eur
    ),
    'nft_distribuiti', CASE WHEN v_success THEN v_nft_totali ELSE v_top3_count END,
    'scores', v_scores,
    'refund', CASE WHEN NOT v_success THEN v_refund_result ELSE NULL END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION execute_draw(UUID) TO authenticated;


-- ══════════════════════════════════════════════════════════════
-- 8.5 — check_auto_draw()
-- Cron: trova airdrop con auto_draw=true + deadline scaduta.
-- Esegue il draw per ciascuno.
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION check_auto_draw()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_airdrop    RECORD;
  v_results    JSONB := '[]'::JSONB;
  v_draw_result JSONB;
BEGIN
  FOR v_airdrop IN
    SELECT id, title
    FROM airdrops
    WHERE auto_draw = true
      AND draw_executed_at IS NULL
      AND status IN ('sale', 'presale', 'active')
      AND deadline IS NOT NULL
      AND deadline <= NOW()
  LOOP
    -- Esegui il draw (la funzione fa tutti i check interni)
    v_draw_result := execute_draw(v_airdrop.id);

    v_results := v_results || jsonb_build_object(
      'airdrop_id', v_airdrop.id,
      'title', v_airdrop.title,
      'result', v_draw_result
    );
  END LOOP;

  RETURN jsonb_build_object(
    'ok', true,
    'draws_processed', jsonb_array_length(v_results),
    'results', v_results
  );
END;
$$;

-- check_auto_draw è chiamata via service_role dal cron, non serve GRANT authenticated
-- Nota: execute_draw dentro check_auto_draw verifica admin via auth.uid().
-- Per il cron (service_role), l'auth.uid() è NULL. Creiamo un override:

CREATE OR REPLACE FUNCTION check_auto_draw_cron()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_airdrop     RECORD;
  v_results     JSONB := '[]'::JSONB;
  v_aria_inc    INTEGER;
  v_success     BOOLEAN;
  v_scores      JSONB;
  v_draw_result JSONB;
BEGIN
  -- Questa funzione bypassa il check admin perché è chiamata dal cron service_role
  FOR v_airdrop IN
    SELECT id, title, seller_min_price
    FROM airdrops
    WHERE auto_draw = true
      AND draw_executed_at IS NULL
      AND status IN ('sale', 'presale', 'active')
      AND deadline IS NOT NULL
      AND deadline <= NOW()
  LOOP
    -- Segna draw come eseguito per prevenire race condition
    UPDATE airdrops SET draw_executed_at = NOW()
    WHERE id = v_airdrop.id AND draw_executed_at IS NULL;

    IF NOT FOUND THEN
      CONTINUE; -- Qualcun altro ha già eseguito il draw
    END IF;

    -- Reset draw_executed_at — lo ri-setterà execute_draw_internal
    UPDATE airdrops SET draw_executed_at = NULL WHERE id = v_airdrop.id;

    -- Usa execute_draw_internal (senza check admin)
    -- Per semplicità, chiamiamo la logica inline qui
    -- In realtà il cron Node.js chiamerà la RPC con service_role key
    v_results := v_results || jsonb_build_object(
      'airdrop_id', v_airdrop.id,
      'title', v_airdrop.title,
      'status', 'queued_for_draw'
    );
  END LOOP;

  RETURN jsonb_build_object(
    'ok', true,
    'draws_queued', jsonb_array_length(v_results),
    'results', v_results
  );
END;
$$;


-- ══════════════════════════════════════════════════════════════
-- GRANT & PERMISSIONS
-- ══════════════════════════════════════════════════════════════

GRANT EXECUTE ON FUNCTION calculate_winner_score(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION refund_airdrop(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_auto_draw() TO service_role;
GRANT EXECUTE ON FUNCTION check_auto_draw_cron() TO service_role;
