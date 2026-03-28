-- ============================================================
-- AIROOBI Airdrop Engine v2 — Fairness Fixes
-- Ref: docs/business/AIROOBI_Airdrop_Engine_v2.md
-- Ref: scripts/stress_test_engine.js (validazione)
--
-- FIX 1: Success check — confronta quota venditore vs seller_min_price
-- FIX 2: Scoring weights — w1=0.65 w2=0.20 w3=0.15 (fairness)
-- FIX 3: Preview/execute ora mostrano seller_cut_eur
--
-- NON ESEGUIRE senza conferma esplicita del founder
-- ============================================================


-- ──────────────────────────────────────────────────────────────
-- FIX 2: Aggiorna pesi scoring in airdrop_config
-- Motivazione: con v1 (0.50/0.30/0.20), un veterano batte un nuovo
-- utente spendendo solo il 49% dei blocchi. Con v2 serve il 74%.
-- Validato con stress_test_engine.js scenari 3-5.
-- ──────────────────────────────────────────────────────────────

UPDATE airdrop_config SET value = '0.65', description = 'Peso blocchi corrente — v2: aumentato da 0.50 per fairness'
WHERE key = 'score_w1';

UPDATE airdrop_config SET value = '0.20', description = 'Peso fedeltà categoria — v2: ridotto da 0.30 per fairness'
WHERE key = 'score_w2';

UPDATE airdrop_config SET value = '0.15', description = 'Peso seniority — v2: ridotto da 0.20 per fairness'
WHERE key = 'score_w3';


-- ──────────────────────────────────────────────────────────────
-- FIX 1 + 3: Ricrea get_draw_preview con success check corretto
-- Bug v1: confrontava (aria_incassato * 0.10) >= seller_min_price
-- Fix v2: confronta v_venditore_eur >= seller_min_price
-- ──────────────────────────────────────────────────────────────

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
  v_split_venditore NUMERIC;
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

  -- Leggi split venditore da config (default 0.6799)
  SELECT COALESCE(
    (SELECT value::NUMERIC FROM airdrop_config WHERE key = 'split_venditore'),
    0.6799
  ) INTO v_split_venditore;

  -- Calcola split
  v_venditore_eur := ROUND(v_aria_incassato * 0.10 * v_split_venditore, 2);
  v_fondo_eur     := ROUND(v_aria_incassato * 0.10 * 0.22, 2);
  v_airoobi_eur   := ROUND(v_aria_incassato * 0.10 * 0.10, 2);
  v_charity_eur   := ROUND(v_aria_incassato * 0.10 * 0.0001, 4);

  -- FIX v2: Determina successo confrontando la QUOTA VENDITORE (non il totale)
  v_success := v_airdrop.seller_min_price IS NULL
    OR v_venditore_eur >= v_airdrop.seller_min_price;

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
    'seller_cut_eur', v_venditore_eur,
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


-- ──────────────────────────────────────────────────────────────
-- FIX 1 + 3: Ricrea execute_draw con success check corretto
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION execute_draw(p_airdrop_id UUID, p_service_call BOOLEAN DEFAULT false)
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
  v_split_venditore  NUMERIC;
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

  -- Verifica admin (skip se chiamato da service_role via cron)
  IF NOT p_service_call THEN
    IF NOT EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
      RETURN '{"ok":false,"error":"NOT_ADMIN"}'::JSONB;
    END IF;
  END IF;

  -- Calcola totale ARIA incassato
  SELECT COALESCE(SUM(aria_spent), 0) INTO v_aria_incassato
  FROM airdrop_participations WHERE airdrop_id = p_airdrop_id;

  IF v_aria_incassato = 0 THEN
    RETURN '{"ok":false,"error":"NO_BLOCKS_SOLD"}'::JSONB;
  END IF;

  -- ─── STEP 2: Calcola split economica ───────────────
  -- Leggi split venditore da config (default 0.6799)
  SELECT COALESCE(
    (SELECT value::NUMERIC FROM airdrop_config WHERE key = 'split_venditore'),
    0.6799
  ) INTO v_split_venditore;

  v_venditore_eur := ROUND(v_aria_incassato * 0.10 * v_split_venditore, 2);
  v_fondo_eur     := ROUND(v_aria_incassato * 0.10 * 0.22, 2);
  v_airoobi_eur   := ROUND(v_aria_incassato * 0.10 * 0.10, 2);
  v_charity_eur   := ROUND(v_aria_incassato * 0.10 * 0.0001, 4);

  -- FIX v2: Determina successo confrontando la QUOTA VENDITORE (non il totale)
  v_success := v_airdrop.seller_min_price IS NULL
    OR v_venditore_eur >= v_airdrop.seller_min_price;

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
    SELECT COALESCE(
      (SELECT value FROM airdrop_config WHERE key = 'current_phase'),
      'alpha_brave'
    ) INTO v_phase;

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
      v_nft_max := 999999;
    ELSE
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
      v_nft_teorici := FLOOR(v_participant.blocks / v_nft_divisor);

      IF v_phase IN ('alpha_brave', 'alpha_wise') THEN
        v_nft_teorici := GREATEST(v_nft_teorici, 1);
      ELSIF v_phase = 'beta' THEN
        IF v_participant.blocks >= 5 THEN
          v_nft_teorici := GREATEST(v_nft_teorici, 1);
        END IF;
      END IF;

      IF (v_nft_totali + v_nft_teorici) > v_nft_max THEN
        v_nft_teorici := GREATEST(v_nft_max - v_nft_totali, 0);
      END IF;

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
    v_refund_result := refund_airdrop(p_airdrop_id);

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
    'seller_cut_eur', v_venditore_eur,
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

GRANT EXECUTE ON FUNCTION get_draw_preview(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_draw(UUID, BOOLEAN) TO authenticated;
