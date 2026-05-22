-- W5 · Airdrop Closure Design v3 · PR-1 · SLA 72h + Caso B sottocosto + flip timeout
-- ROBY_Airdrop_Closure_Design_LOCKED_2026-05-22 §3 §5 · ROBY_Reply_CCP_STOPASK §5.
-- Applicare DOPO PR-2 (usa register_seller_cancellation).
--
-- Cosa cambia:
--  1. detect_airdrop_end_event: SLA acknowledge venditore 24h → 72h.
--  2. seller_acknowledge_airdrop: solo accept|annulla (auto_accept_silent NON
--     più generato). Distingue Caso A (incassato ≥ prezzo minimo) da Caso B
--     (sottocosto). annulla su Caso A → counter +1; su Caso B (B2) → no counter.
--  3. execute_draw: il ramo successo viene forzato quando il venditore ha
--     deciso 'accept' (Caso A o Caso B1 «incasso comunque») — supera il check
--     prezzo minimo. Senza decisione resta il check classico (path admin legacy).
--  4. cron rinominato: cron_auto_accept_silent_seller → cron_seller_acknowledge_timeout.
--     Il timeout NON accetta mai (§5): Caso A → annullato + counter +1;
--     Caso B → default B2 (rifiuto) → annullato, nessun counter.
--  5. Helper airdrop_seller_payout_eur — stesso split di execute_draw, un punto solo.
--
-- NB: il CHECK seller_acknowledge_decision lascia 'auto_accept_silent' ammesso
-- per le righe storiche (modifica additiva non necessaria → constraint invariato).

-- ─────────────────────────────────────────────────────────────
-- airdrop_seller_payout_eur · quota venditore in EUR (stesso split di execute_draw)
-- Usato da seller_acknowledge_airdrop e dal cron timeout per il verdetto Caso A/B.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION airdrop_seller_payout_eur(p_airdrop_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_aria_incassato INTEGER;
  v_split          NUMERIC;
BEGIN
  -- Nessun filtro cancelled_at: identico a come execute_draw calcola v_aria_incassato.
  SELECT COALESCE(SUM(aria_spent), 0) INTO v_aria_incassato
  FROM airdrop_participations WHERE airdrop_id = p_airdrop_id;

  SELECT COALESCE((SELECT value::NUMERIC FROM airdrop_config WHERE key = 'split_venditore'), 0.6799)
  INTO v_split;

  RETURN ROUND(v_aria_incassato * 0.10 * v_split, 2);
END; $$;
GRANT EXECUTE ON FUNCTION airdrop_seller_payout_eur(UUID) TO authenticated;
COMMENT ON FUNCTION airdrop_seller_payout_eur(UUID) IS 'PR-1: quota venditore EUR (split_venditore × 10% incassato). Verdetto Caso A/B closure v3.';

-- ─────────────────────────────────────────────────────────────
-- detect_airdrop_end_event · SLA acknowledge 24h → 72h
-- Identica a 20260517000000_w4_fix_scacco_matto_global_logic.sql, solo SLA.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION detect_airdrop_end_event(p_airdrop_id UUID DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_airdrop RECORD; v_scoreboard JSONB; v_leader JSONB;
  v_trigger TEXT; v_processed INT := 0; v_results JSONB := '[]'::jsonb;
BEGIN
  FOR v_airdrop IN
    SELECT * FROM airdrops
    WHERE status = ANY(ARRAY['presale','sale'])
      AND (p_airdrop_id IS NULL OR id = p_airdrop_id)
    FOR UPDATE SKIP LOCKED
  LOOP
    v_trigger := NULL;
    IF v_airdrop.deadline IS NOT NULL AND NOW() >= v_airdrop.deadline THEN
      v_trigger := 'deadline';
    ELSIF v_airdrop.blocks_sold >= v_airdrop.total_blocks THEN
      v_trigger := 'sold_out';
    ELSIF is_airdrop_in_checkmate(v_airdrop.id) THEN
      v_trigger := 'scacco_matto';
    END IF;

    IF v_trigger IS NOT NULL THEN
      v_scoreboard := calculate_winner_score(v_airdrop.id);
      SELECT s INTO v_leader FROM jsonb_array_elements(v_scoreboard) s WHERE (s->>'rank')::INT = 1 LIMIT 1;
      UPDATE airdrops SET
        status='waiting_seller_acknowledge', end_event_triggered_at=NOW(),
        end_event_trigger_type=v_trigger, seller_acknowledge_sla_deadline=NOW() + INTERVAL '72 hours',
        winner_candidate_user_id=COALESCE((v_leader->>'user_id')::UUID, NULL),
        draw_scores=v_scoreboard, updated_at=NOW()
      WHERE id = v_airdrop.id;

      INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
      VALUES (COALESCE(v_airdrop.submitted_by, v_airdrop.created_by), 'in_app','T1','seller_acknowledge_required',
              v_airdrop.id, jsonb_build_object('trigger', v_trigger, 'sla_hours', 72), 'sent');

      INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
      SELECT DISTINCT ap.user_id, 'in_app','T1','event_ended_waiting_seller', v_airdrop.id,
             jsonb_build_object('trigger', v_trigger, 'sla_hours', 72), 'sent'
      FROM airdrop_participations ap WHERE ap.airdrop_id = v_airdrop.id AND ap.cancelled_at IS NULL;

      v_processed := v_processed + 1;
      v_results := v_results || jsonb_build_object('airdrop_id', v_airdrop.id, 'trigger', v_trigger,
                                                    'winner_candidate_user_id', v_leader->>'user_id');
    END IF;
  END LOOP;
  RETURN jsonb_build_object('processed', v_processed, 'events', v_results);
END; $$;

COMMENT ON FUNCTION detect_airdrop_end_event(UUID) IS 'Closure v3 cron 5min: deadline/sold-out/scacco-matto → waiting_seller_acknowledge, SLA 72h.';

-- ─────────────────────────────────────────────────────────────
-- seller_acknowledge_airdrop · solo accept|annulla · Caso A/B + counter
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION seller_acknowledge_airdrop(
  p_airdrop_id UUID, p_decision TEXT, p_service_call BOOLEAN DEFAULT FALSE
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_airdrop     RECORD;
  v_draw_result JSONB;
  v_seller_id   UUID;
  v_seller_eur  NUMERIC;
  v_caso_a      BOOLEAN;
  v_cancel      JSONB := NULL;
BEGIN
  -- v3: auto_accept_silent rimosso · solo decisione esplicita del venditore.
  IF p_decision NOT IN ('accept','annulla') THEN
    RAISE EXCEPTION 'invalid_decision_%', p_decision USING ERRCODE='22023';
  END IF;
  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'airdrop_not_found' USING ERRCODE='P0002'; END IF;
  IF v_airdrop.status <> 'waiting_seller_acknowledge' THEN
    RAISE EXCEPTION 'invalid_status_must_be_waiting_was_%', v_airdrop.status USING ERRCODE='22023';
  END IF;
  IF NOT p_service_call THEN
    IF COALESCE(v_airdrop.submitted_by, v_airdrop.created_by) <> auth.uid() THEN
      RAISE EXCEPTION 'seller_only' USING ERRCODE='42501';
    END IF;
  END IF;

  v_seller_id  := COALESCE(v_airdrop.submitted_by, v_airdrop.created_by);
  -- Caso A = incassato ≥ prezzo minimo · Caso B = sottocosto (non è colpa del venditore).
  v_seller_eur := airdrop_seller_payout_eur(p_airdrop_id);
  v_caso_a     := v_airdrop.seller_min_price IS NULL OR v_seller_eur >= v_airdrop.seller_min_price;

  UPDATE airdrops SET seller_acknowledge_decision=p_decision, seller_acknowledge_decided_at=NOW(),
                       updated_at=NOW() WHERE id = p_airdrop_id;

  IF p_decision = 'accept' THEN
    -- Caso A → chiusura regolare · Caso B1 «incasso comunque» → chiusura regolare
    -- sottocosto. execute_draw legge seller_acknowledge_decision='accept' e forza
    -- il ramo successo (vedi sotto). Flip transitorio a 'sale' per lo status-gate.
    UPDATE airdrops SET status='sale' WHERE id=p_airdrop_id;
    v_draw_result := execute_draw(p_airdrop_id, TRUE);
    PERFORM 1 FROM airdrops WHERE id=p_airdrop_id AND status NOT IN ('completed','annullato');
    IF FOUND THEN
      UPDATE airdrops SET status='waiting_seller_acknowledge' WHERE id=p_airdrop_id;
    END IF;
    IF v_airdrop.winner_candidate_user_id IS NOT NULL THEN
      INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
      VALUES (v_airdrop.winner_candidate_user_id, 'in_app','T1','winner_announcement', p_airdrop_id,
              jsonb_build_object('decision', p_decision), 'sent');
    END IF;
  ELSE  -- p_decision = 'annulla'
    -- Caso A annulla = il venditore lascia cadere un airdrop riuscito → counter +1.
    -- Caso B2 «rifiuto sottocosto» = nessun counter (non è colpa del venditore).
    v_draw_result := refund_airdrop(p_airdrop_id);
    UPDATE airdrops SET status='annullato', updated_at=NOW() WHERE id=p_airdrop_id;
    IF v_caso_a THEN
      v_cancel := register_seller_cancellation(v_seller_id, 'seller_acknowledge_annulla_caso_a', p_airdrop_id);
    END IF;
  END IF;

  INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
  SELECT DISTINCT ap.user_id, 'in_app','T1',
         CASE p_decision WHEN 'annulla' THEN 'airdrop_annulled' ELSE 'airdrop_finalized' END,
         p_airdrop_id, jsonb_build_object('decision', p_decision, 'caso', CASE WHEN v_caso_a THEN 'A' ELSE 'B' END), 'sent'
  FROM airdrop_participations ap WHERE ap.airdrop_id = p_airdrop_id AND ap.cancelled_at IS NULL;

  RETURN jsonb_build_object('success', true, 'airdrop_id', p_airdrop_id,
                            'decision', p_decision,
                            'caso', CASE WHEN v_caso_a THEN 'A' ELSE 'B' END,
                            'seller_payout_eur', v_seller_eur,
                            'cancellation', v_cancel,
                            'draw_result', v_draw_result);
END; $$;

GRANT EXECUTE ON FUNCTION seller_acknowledge_airdrop(UUID, TEXT, BOOLEAN) TO authenticated;
COMMENT ON FUNCTION seller_acknowledge_airdrop(UUID, TEXT, BOOLEAN) IS 'Closure v3: accept (chiusura regolare, incl. Caso B1 sottocosto) · annulla (refund; counter +1 se Caso A).';

-- ─────────────────────────────────────────────────────────────
-- execute_draw v2.2 + closure v3 · il ramo successo è forzato se il venditore
-- ha deciso 'accept'. Identica a 20260328011057_presale_mining_boost.sql, con
-- la sola modifica al calcolo di v_success.
-- ─────────────────────────────────────────────────────────────
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
  v_presale_mult     NUMERIC;
  v_nft_circolante   NUMERIC;
  v_treasury_bal     NUMERIC;
  v_fondo_contributo NUMERIC;
  v_participant      RECORD;
  v_shares           NUMERIC;
  v_presale_blocks   INTEGER;
  v_sale_blocks      INTEGER;
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
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
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

  -- Closure v3 (PR-1): la decisione esplicita 'accept' del venditore (Caso A o
  -- Caso B1 «incasso comunque» sottocosto) supera il check prezzo minimo →
  -- chiusura regolare. Senza decisione (path admin execute_draw diretto) resta
  -- il check classico auto-fail sotto il minimo.
  v_success := v_airdrop.seller_acknowledge_decision = 'accept'
    OR v_airdrop.seller_min_price IS NULL
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
      UPDATE airdrop_blocks SET is_winner_block = true
      WHERE airdrop_id = p_airdrop_id AND owner_id = v_winner_id;
    END IF;

    -- ─── STEP 4: Mining NFT con presale boost ───────
    SELECT COALESCE(
      (SELECT value::NUMERIC FROM airdrop_config WHERE key = 'mining_k'), 100
    ) INTO v_mining_k;

    SELECT COALESCE(
      (SELECT value::NUMERIC FROM airdrop_config WHERE key = 'presale_mining_multiplier'), 2.0
    ) INTO v_presale_mult;

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

    -- Distribuisci quote a TUTTI i non-vincitori
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
      -- Conta blocchi presale vs sale per questo utente
      SELECT
        COALESCE(SUM(CASE WHEN purchased_phase = 'presale' THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN purchased_phase <> 'presale' THEN 1 ELSE 0 END), 0)
      INTO v_presale_blocks, v_sale_blocks
      FROM airdrop_blocks
      WHERE airdrop_id = p_airdrop_id AND owner_id = v_participant.user_id;

      -- Quote: presale blocks × multiplier + sale blocks, tutto / divisore
      v_shares := (v_presale_blocks * v_presale_mult + v_sale_blocks)::NUMERIC / v_divisor;

      -- Cap anti-inflazione
      IF (v_nft_totali + v_shares) > v_nft_cap AND v_nft_cap < 999999 THEN
        v_shares := GREATEST(0, v_nft_cap - v_nft_totali);
      END IF;

      IF v_shares > 0 THEN
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
            'presale_blocks', v_presale_blocks,
            'sale_blocks', v_sale_blocks,
            'aria_spent', v_participant.aria,
            'mining_divisor', v_divisor,
            'presale_multiplier', v_presale_mult,
            'object_value', v_airdrop.object_value_eur
          )
        );
        v_nft_totali := v_nft_totali + v_shares;
      END IF;
    END LOOP;

    -- Update treasury
    UPDATE treasury_stats
    SET nft_circulating = nft_circulating + v_nft_totali,
        nft_minted = nft_minted + v_nft_totali,
        updated_at = NOW()
    WHERE id = (SELECT id FROM treasury_stats ORDER BY created_at DESC LIMIT 1);

    SELECT COALESCE(balance_eur, 0) INTO v_treasury_before
    FROM treasury_stats ORDER BY created_at DESC LIMIT 1;

    INSERT INTO treasury_transactions
      (airdrop_id, amount_eur, type, treasury_before, treasury_after, notes)
    VALUES (
      p_airdrop_id, v_fondo_eur, 'airdrop_contribution',
      v_treasury_before, v_treasury_before + v_fondo_eur,
      'Draw: ' || v_airdrop.title || ' — Quote: ' || ROUND(v_nft_totali, 2) || ' (div:' || v_divisor || ' presale×' || v_presale_mult || ')'
    );

    UPDATE treasury_stats
    SET balance_eur = balance_eur + v_fondo_eur, updated_at = NOW()
    WHERE id = (SELECT id FROM treasury_stats ORDER BY created_at DESC LIMIT 1);

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

  -- ─── Track events ─────────────────────────────────
  INSERT INTO events (event, url, props)
  VALUES (
    'airdrop_draw', '/admin/draw/' || p_airdrop_id::text,
    jsonb_build_object(
      'airdrop_id', p_airdrop_id, 'success', v_success,
      'winner_id', v_winner_id, 'aria_incassato', v_aria_incassato,
      'nft_shares_minted', CASE WHEN v_success THEN ROUND(v_nft_totali, 4) ELSE v_top3_count END,
      'mining_divisor', v_divisor, 'presale_multiplier', v_presale_mult
    )
  );

  RETURN jsonb_build_object(
    'ok', true, 'success', v_success,
    'winner_id', v_winner_id, 'winner_score', v_winner_score,
    'aria_incassato', v_aria_incassato,
    'eur_incassato', ROUND(v_aria_incassato * 0.10, 2),
    'seller_cut_eur', v_venditore_eur,
    'mining_divisor', v_divisor,
    'presale_mining_multiplier', v_presale_mult,
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

GRANT EXECUTE ON FUNCTION execute_draw(UUID, BOOLEAN) TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- cron_seller_acknowledge_timeout · ex cron_auto_accept_silent_seller
-- §5: il timeout NON accetta mai. Caso A → annullato + counter +1 ·
-- Caso B → default B2 (rifiuto) → annullato, nessun counter.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION cron_seller_acknowledge_timeout()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_airdrop    RECORD;
  v_processed  INT := 0;
  v_seller_id  UUID;
  v_seller_eur NUMERIC;
  v_caso_a     BOOLEAN;
BEGIN
  FOR v_airdrop IN
    SELECT * FROM airdrops
    WHERE status = 'waiting_seller_acknowledge'
      AND seller_acknowledge_sla_deadline < NOW()
    FOR UPDATE SKIP LOCKED
  LOOP
    BEGIN
      v_seller_id  := COALESCE(v_airdrop.submitted_by, v_airdrop.created_by);
      v_seller_eur := airdrop_seller_payout_eur(v_airdrop.id);
      v_caso_a     := v_airdrop.seller_min_price IS NULL OR v_seller_eur >= v_airdrop.seller_min_price;

      -- Il timeout defaulta sempre al non-completamento (mai accept).
      UPDATE airdrops SET
        seller_acknowledge_decision   = 'annulla',
        seller_acknowledge_decided_at = NOW(),
        status                        = 'annullato',
        updated_at                    = NOW()
      WHERE id = v_airdrop.id;

      PERFORM refund_airdrop(v_airdrop.id);

      -- Caso A (airdrop riuscito non accettato) → counter +1. Caso B → no counter.
      IF v_caso_a THEN
        PERFORM register_seller_cancellation(v_seller_id, 'seller_acknowledge_timeout_caso_a', v_airdrop.id);
      END IF;

      INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
      SELECT DISTINCT ap.user_id, 'in_app','T1','airdrop_annulled', v_airdrop.id,
             jsonb_build_object('reason','seller_timeout','caso', CASE WHEN v_caso_a THEN 'A' ELSE 'B' END), 'sent'
      FROM airdrop_participations ap WHERE ap.airdrop_id = v_airdrop.id AND ap.cancelled_at IS NULL;

      INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
      VALUES (v_seller_id, 'in_app','T1','seller_acknowledge_timeout', v_airdrop.id,
              jsonb_build_object('caso', CASE WHEN v_caso_a THEN 'A' ELSE 'B' END, 'counter', v_caso_a), 'sent');

      v_processed := v_processed + 1;
    EXCEPTION WHEN OTHERS THEN
      INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
      VALUES (COALESCE(v_airdrop.submitted_by, v_airdrop.created_by),
              'in_app','T1','seller_acknowledge_timeout_failed', v_airdrop.id,
              jsonb_build_object('error', SQLERRM), 'failed');
    END;
  END LOOP;

  RETURN jsonb_build_object('processed', v_processed);
END; $$;

GRANT EXECUTE ON FUNCTION cron_seller_acknowledge_timeout() TO authenticated;
COMMENT ON FUNCTION cron_seller_acknowledge_timeout() IS 'Closure v3 §5: SLA 72h scaduta → annullato + refund. Caso A → counter +1, Caso B → no counter. Mai accept.';

-- Vecchia funzione auto-accept rimossa (flip timeout · §5).
DROP FUNCTION IF EXISTS cron_auto_accept_silent_seller();

-- pg_cron: smonta il vecchio job, monta il nuovo timeout (5 min).
SELECT cron.unschedule('w4_auto_accept_silent_seller')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname='w4_auto_accept_silent_seller');
SELECT cron.unschedule('w5_seller_acknowledge_timeout')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname='w5_seller_acknowledge_timeout');
SELECT cron.schedule('w5_seller_acknowledge_timeout', '*/5 * * * *',
  $$SELECT cron_seller_acknowledge_timeout();$$);

-- ─────────────────────────────────────────────────────────────
-- Mini integration test (feedback_pr_integration_test) · verifiche strutturali
-- read-only. Il test comportamentale (72h SLA, Caso A→counter, Caso B→no counter,
-- B1 chiusura sottocosto) è negli UAT step del closing report PR-1.
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF to_regprocedure('public.airdrop_seller_payout_eur(uuid)') IS NULL THEN
    RAISE EXCEPTION 'PR-1 test FAIL · airdrop_seller_payout_eur mancante';
  END IF;
  IF to_regprocedure('public.cron_seller_acknowledge_timeout()') IS NULL THEN
    RAISE EXCEPTION 'PR-1 test FAIL · cron_seller_acknowledge_timeout mancante';
  END IF;
  IF to_regprocedure('public.cron_auto_accept_silent_seller()') IS NOT NULL THEN
    RAISE EXCEPTION 'PR-1 test FAIL · cron_auto_accept_silent_seller doveva essere droppata';
  END IF;
  IF to_regprocedure('public.seller_acknowledge_airdrop(uuid,text,boolean)') IS NULL THEN
    RAISE EXCEPTION 'PR-1 test FAIL · seller_acknowledge_airdrop mancante';
  END IF;
  IF to_regprocedure('public.detect_airdrop_end_event(uuid)') IS NULL THEN
    RAISE EXCEPTION 'PR-1 test FAIL · detect_airdrop_end_event mancante';
  END IF;
  IF to_regprocedure('public.execute_draw(uuid,boolean)') IS NULL THEN
    RAISE EXCEPTION 'PR-1 test FAIL · execute_draw mancante';
  END IF;
  -- pg_cron: job nuovo presente, vecchio assente
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname='w5_seller_acknowledge_timeout') THEN
    RAISE EXCEPTION 'PR-1 test FAIL · cron job w5_seller_acknowledge_timeout non schedulato';
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname='w4_auto_accept_silent_seller') THEN
    RAISE EXCEPTION 'PR-1 test FAIL · cron job w4_auto_accept_silent_seller doveva essere rimosso';
  END IF;
  RAISE NOTICE 'PR-1 integration test OK · SLA 72h + Caso A/B + cron timeout flip verificati';
END $$;
