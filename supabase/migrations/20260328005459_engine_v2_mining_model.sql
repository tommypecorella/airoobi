-- ============================================================
-- AIROOBI Airdrop Engine v2.1 — Mining Model
-- Ref: docs/business/AIROOBI_Airdrop_Engine_v2.md §12.5
-- Ref: scripts/dday_simulator.js (validazione)
--
-- CAMBIAMENTI:
-- 1. NFT frazionari: colonna `shares` in nft_rewards
-- 2. Mining difficulty basata sul prezzo oggetto (non sulla fase)
-- 3. TUTTI i perdenti ricevono quote (nessuna esclusione per fase)
-- 4. treasury_stats.nft_circulating → NUMERIC (supporta frazioni)
-- 5. Config: mining_k, min_participation_pct
--
-- NON ESEGUIRE senza conferma esplicita del founder
-- ============================================================


-- ──────────────────────────────────────────────────────────────
-- 1. Schema: NFT frazionari
-- ──────────────────────────────────────────────────────────────

-- Colonna shares: quante quote NFT rappresenta questa riga
ALTER TABLE nft_rewards ADD COLUMN IF NOT EXISTS shares NUMERIC(12,4) DEFAULT 1.0;

-- nft_circulating e nft_minted devono supportare frazioni
ALTER TABLE treasury_stats ALTER COLUMN nft_circulating TYPE NUMERIC(12,4);
ALTER TABLE treasury_stats ALTER COLUMN nft_minted TYPE NUMERIC(12,4);


-- ──────────────────────────────────────────────────────────────
-- 2. Config: mining_k e min_participation_pct
-- ──────────────────────────────────────────────────────────────

INSERT INTO airdrop_config (key, value, description) VALUES
  ('mining_k', '100', 'Divisore mining = ceil(object_value / mining_k). €500→div5, €1K→div10, €3K→div30'),
  ('min_participation_pct', '0.01', 'Minimo ARIA per partecipare = object_value × pct / 0.10')
ON CONFLICT (key) DO NOTHING;


-- ──────────────────────────────────────────────────────────────
-- 3. execute_draw v2.1 — mining model
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
  v_mining_k         NUMERIC;
  v_divisor          INTEGER;
  v_nft_circolante   NUMERIC;
  v_treasury_bal     NUMERIC;
  v_fondo_contributo NUMERIC;
  v_participant      RECORD;
  v_shares           NUMERIC;
  v_nft_totali       NUMERIC := 0;
  v_nft_cap          NUMERIC;
  v_prezzo_nft       NUMERIC;
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

  IF NOT p_service_call THEN
    IF NOT EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
      RETURN '{"ok":false,"error":"NOT_ADMIN"}'::JSONB;
    END IF;
  END IF;

  SELECT COALESCE(SUM(aria_spent), 0) INTO v_aria_incassato
  FROM airdrop_participations WHERE airdrop_id = p_airdrop_id;

  IF v_aria_incassato = 0 THEN
    RETURN '{"ok":false,"error":"NO_BLOCKS_SOLD"}'::JSONB;
  END IF;

  -- ─── STEP 2: Split economica ───────────────────────
  SELECT COALESCE(
    (SELECT value::NUMERIC FROM airdrop_config WHERE key = 'split_venditore'), 0.6799
  ) INTO v_split_venditore;

  v_venditore_eur := ROUND(v_aria_incassato * 0.10 * v_split_venditore, 2);
  v_fondo_eur     := ROUND(v_aria_incassato * 0.10 * 0.22, 2);
  v_airoobi_eur   := ROUND(v_aria_incassato * 0.10 * 0.10, 2);
  v_charity_eur   := ROUND(v_aria_incassato * 0.10 * 0.0001, 4);

  -- Success check v2: quota venditore vs seller_min_price
  v_success := v_airdrop.seller_min_price IS NULL
    OR v_venditore_eur >= v_airdrop.seller_min_price;

  IF v_success THEN
    -- ─── STEP 3: Vincitore ───────────────────────────
    v_scores := calculate_winner_score(p_airdrop_id);

    IF v_scores IS NOT NULL AND jsonb_array_length(v_scores) > 0 THEN
      v_winner := v_scores->0;
      v_winner_id := (v_winner->>'user_id')::UUID;
      v_winner_score := (v_winner->>'score')::NUMERIC;
    END IF;

    IF v_winner_id IS NOT NULL THEN
      UPDATE airdrop_blocks
      SET is_winner_block = true
      WHERE airdrop_id = p_airdrop_id AND owner_id = v_winner_id;
    END IF;

    -- ─── STEP 4: Mining NFT — TUTTI i perdenti ──────
    -- Mining difficulty basata sul prezzo oggetto
    SELECT COALESCE(
      (SELECT value::NUMERIC FROM airdrop_config WHERE key = 'mining_k'), 100
    ) INTO v_mining_k;

    v_divisor := GREATEST(1, CEIL(COALESCE(v_airdrop.object_value_eur, 500) / v_mining_k));

    -- Cap anti-inflazione
    SELECT COALESCE(balance_eur, 0), COALESCE(nft_circulating, 0)
    INTO v_treasury_bal, v_nft_circolante
    FROM treasury_stats ORDER BY created_at DESC LIMIT 1;

    v_fondo_contributo := v_fondo_eur;

    IF v_nft_circolante > 0 AND v_treasury_bal > 0 THEN
      v_prezzo_nft := v_treasury_bal / v_nft_circolante;
      v_nft_cap := v_fondo_contributo / v_prezzo_nft;
    ELSE
      v_nft_cap := 999999;
    END IF;

    -- Distribuisci quote frazionarie a TUTTI i non-vincitori
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
      -- Quote frazionarie: blocks / divisor (NO floor)
      v_shares := v_participant.blocks::NUMERIC / v_divisor;

      -- Cap anti-inflazione proporzionale
      IF (v_nft_totali + v_shares) > v_nft_cap AND v_nft_cap < 999999 THEN
        v_shares := GREATEST(0, v_nft_cap - v_nft_totali);
      END IF;

      IF v_shares > 0 THEN
        -- Una sola riga per utente per airdrop (con shares frazionari)
        INSERT INTO nft_rewards (user_id, nft_type, name, source, airdrop_id, shares, metadata)
        VALUES (
          v_participant.user_id,
          'NFT_REWARD',
          'Tessera Rendimento — ' || v_airdrop.title,
          'airdrop_draw',
          p_airdrop_id,
          ROUND(v_shares, 4),
          jsonb_build_object(
            'airdrop_title', v_airdrop.title,
            'draw_date', NOW(),
            'blocks_owned', v_participant.blocks,
            'aria_spent', v_participant.aria,
            'mining_divisor', v_divisor,
            'object_value', v_airdrop.object_value_eur
          )
        );
        v_nft_totali := v_nft_totali + v_shares;
      END IF;
    END LOOP;

    -- Aggiorna treasury
    UPDATE treasury_stats
    SET nft_circulating = nft_circulating + v_nft_totali,
        nft_minted = nft_minted + v_nft_totali,
        updated_at = NOW()
    WHERE id = (SELECT id FROM treasury_stats ORDER BY created_at DESC LIMIT 1);

    -- ─── STEP 5: Aggiorna treasury balance ───────────
    SELECT COALESCE(balance_eur, 0) INTO v_treasury_before
    FROM treasury_stats ORDER BY created_at DESC LIMIT 1;

    INSERT INTO treasury_transactions
      (airdrop_id, amount_eur, type, treasury_before, treasury_after, notes)
    VALUES (
      p_airdrop_id, v_fondo_eur, 'airdrop_contribution',
      v_treasury_before, v_treasury_before + v_fondo_eur,
      'Draw: ' || v_airdrop.title || ' — Quote minate: ' || ROUND(v_nft_totali, 2) || ' — Divisore: ' || v_divisor
    );

    UPDATE treasury_stats
    SET balance_eur = balance_eur + v_fondo_eur, updated_at = NOW()
    WHERE id = (SELECT id FROM treasury_stats ORDER BY created_at DESC LIMIT 1);

    -- ─── STEP 6: Aggiorna airdrop ────────────────────
    UPDATE airdrops SET
      status = 'completed', draw_executed_at = NOW(),
      winner_id = v_winner_id, winner_score = v_winner_score,
      venditore_payout_eur = v_venditore_eur, airoobi_fee_eur = v_airoobi_eur,
      charity_contrib_eur = v_charity_eur, fondo_contributo_eur = v_fondo_eur,
      aria_incassato = v_aria_incassato, draw_scores = v_scores
    WHERE id = p_airdrop_id;

  ELSE
    -- ═══ AIRDROP ANNULLATO ═══════════════════════════
    v_refund_result := refund_airdrop(p_airdrop_id);

    -- Consolation: top 3 ricevono 1 quota ciascuno
    v_top3_count := 0;
    FOR v_top3 IN
      SELECT ap.user_id, SUM(ap.blocks_count) AS blocks, SUM(ap.aria_spent) AS aria
      FROM airdrop_participations ap
      WHERE ap.airdrop_id = p_airdrop_id
      GROUP BY ap.user_id ORDER BY SUM(ap.aria_spent) DESC LIMIT 3
    LOOP
      v_top3_count := v_top3_count + 1;
      INSERT INTO nft_rewards (user_id, nft_type, name, source, airdrop_id, shares, metadata)
      VALUES (
        v_top3.user_id, 'NFT_REWARD',
        'Tessera Rendimento (consolation) — ' || v_airdrop.title,
        'airdrop_draw_consolation', p_airdrop_id, 1.0,
        jsonb_build_object(
          'airdrop_title', v_airdrop.title, 'draw_date', NOW(),
          'blocks_owned', v_top3.blocks, 'aria_spent', v_top3.aria,
          'consolation', true, 'consolation_rank', v_top3_count
        )
      );
    END LOOP;

    UPDATE airdrops SET
      status = 'annullato', draw_executed_at = NOW(),
      aria_incassato = v_aria_incassato,
      draw_scores = calculate_winner_score(p_airdrop_id)
    WHERE id = p_airdrop_id;
  END IF;

  -- ─── STEP 8: Track events ─────────────────────────
  INSERT INTO events (event, url, props)
  VALUES (
    'airdrop_draw', '/admin/draw/' || p_airdrop_id::text,
    jsonb_build_object(
      'airdrop_id', p_airdrop_id, 'success', v_success,
      'winner_id', v_winner_id, 'aria_incassato', v_aria_incassato,
      'nft_shares_minted', CASE WHEN v_success THEN ROUND(v_nft_totali, 4) ELSE v_top3_count END,
      'mining_divisor', v_divisor
    )
  );

  RETURN jsonb_build_object(
    'ok', true, 'success', v_success,
    'winner_id', v_winner_id, 'winner_score', v_winner_score,
    'aria_incassato', v_aria_incassato,
    'eur_incassato', ROUND(v_aria_incassato * 0.10, 2),
    'seller_cut_eur', v_venditore_eur,
    'mining_divisor', v_divisor,
    'nft_shares_minted', CASE WHEN v_success THEN ROUND(v_nft_totali, 4) ELSE v_top3_count END,
    'split', jsonb_build_object(
      'venditore_eur', v_venditore_eur, 'fondo_eur', v_fondo_eur,
      'airoobi_eur', v_airoobi_eur, 'charity_eur', v_charity_eur
    ),
    'scores', v_scores,
    'refund', CASE WHEN NOT v_success THEN v_refund_result ELSE NULL END
  );
END;
$$;


-- ──────────────────────────────────────────────────────────────
-- 4. get_draw_preview v2.1 — mining model
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
  v_mining_k       NUMERIC;
  v_divisor        INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN '{"ok":false,"error":"NOT_ADMIN"}'::JSONB;
  END IF;

  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id;
  IF NOT FOUND THEN RETURN '{"ok":false,"error":"AIRDROP_NOT_FOUND"}'::JSONB; END IF;

  SELECT COALESCE(SUM(aria_spent), 0) INTO v_aria_incassato
  FROM airdrop_participations WHERE airdrop_id = p_airdrop_id;

  IF v_aria_incassato = 0 THEN
    RETURN jsonb_build_object('ok', true, 'warning', 'NO_PARTICIPANTS', 'aria_incassato', 0);
  END IF;

  SELECT COALESCE(
    (SELECT value::NUMERIC FROM airdrop_config WHERE key = 'split_venditore'), 0.6799
  ) INTO v_split_venditore;

  SELECT COALESCE(
    (SELECT value::NUMERIC FROM airdrop_config WHERE key = 'mining_k'), 100
  ) INTO v_mining_k;

  v_venditore_eur := ROUND(v_aria_incassato * 0.10 * v_split_venditore, 2);
  v_fondo_eur     := ROUND(v_aria_incassato * 0.10 * 0.22, 2);
  v_airoobi_eur   := ROUND(v_aria_incassato * 0.10 * 0.10, 2);
  v_charity_eur   := ROUND(v_aria_incassato * 0.10 * 0.0001, 4);

  v_success := v_airdrop.seller_min_price IS NULL
    OR v_venditore_eur >= v_airdrop.seller_min_price;

  v_divisor := GREATEST(1, CEIL(COALESCE(v_airdrop.object_value_eur, 500) / v_mining_k));

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
    'mining_divisor', v_divisor,
    'mining_k', v_mining_k,
    'split', jsonb_build_object(
      'venditore_eur', v_venditore_eur, 'fondo_eur', v_fondo_eur,
      'airoobi_eur', v_airoobi_eur, 'charity_eur', v_charity_eur
    ),
    'scores', v_scores,
    'winner_preview', CASE
      WHEN v_success AND v_scores IS NOT NULL AND jsonb_array_length(v_scores) > 0
      THEN v_scores->0 ELSE NULL
    END,
    'draw_executed', v_airdrop.draw_executed_at IS NOT NULL
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_draw_preview(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_draw(UUID, BOOLEAN) TO authenticated;
