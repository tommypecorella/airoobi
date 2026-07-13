-- Draw · Cap anti-inflazione PROPORZIONALE + rename canone ROBI Reward
-- Test massivo CCP 14 lug 2026 (delega Skeezu, lista compiti chat diretta).
--
-- Finding dal test E2E x10: il cap anti-inflazione era applicato in modo greedy
-- (ORDER BY aria_spent DESC): il primo perdente assorbiva l'intero cap, tutti gli
-- altri ricevevano 0 ROBI. Il commento storico diceva "proporzionale" — ora lo e'.
-- Ogni perdente riceve quota_raw × (cap / totale_raw). La collateralizzazione
-- totale resta identica (somma quote = cap): il design MiCA non cambia.
--
-- Canone: 'Tessera Rendimento' e' lessico VIETATO (MiCA) → 'ROBI Reward',
-- anche retroattivo sulle righe esistenti.

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
  v_raw_total        NUMERIC := 0;
  v_cap_factor       NUMERIC := 1;
  v_refund_result    JSONB;
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

    -- Cap anti-inflazione PROPORZIONALE (fix 14 lug 2026, test massivo CCP):
    -- prima si calcola il totale raw delle quote, poi un unico fattore di scala
    -- cap/totale applicato a TUTTI i perdenti. Prima il cap era greedy: il primo
    -- perdente (ordinato per ARIA spesi) assorbiva l'intero cap, gli altri zero.
    SELECT COALESCE(SUM(
      (COALESCE(pb.presale_ct,0) * v_presale_mult + COALESCE(pb.sale_ct,0))::NUMERIC / v_divisor
    ), 0) INTO v_raw_total
    FROM (
      SELECT ab.owner_id,
        SUM(CASE WHEN ab.purchased_phase = 'presale' THEN 1 ELSE 0 END) AS presale_ct,
        SUM(CASE WHEN ab.purchased_phase <> 'presale' THEN 1 ELSE 0 END) AS sale_ct
      FROM airdrop_blocks ab
      WHERE ab.airdrop_id = p_airdrop_id AND ab.owner_id <> v_winner_id
      GROUP BY ab.owner_id
    ) pb;

    IF v_nft_cap < 999999 AND v_raw_total > v_nft_cap AND v_raw_total > 0 THEN
      v_cap_factor := v_nft_cap / v_raw_total;
    ELSE
      v_cap_factor := 1;
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

      -- Quote: presale blocks × multiplier + sale blocks, tutto / divisore,
      -- scalato dal fattore proporzionale del cap anti-inflazione
      v_shares := ((v_presale_blocks * v_presale_mult + v_sale_blocks)::NUMERIC / v_divisor) * v_cap_factor;

      IF v_shares > 0 THEN
        INSERT INTO nft_rewards (user_id, nft_type, name, source, airdrop_id, shares, metadata)
        VALUES (
          v_participant.user_id,
          'NFT_REWARD',
          'ROBI Reward — ' || v_airdrop.title,
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
            'object_value', v_airdrop.object_value_eur,
            'cap_factor', ROUND(v_cap_factor, 6)
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
    -- Closure v3 (PR-3): rimossa la distribuzione NFT di consolazione top-3.
    -- I ROBI del rullo sono già accreditati all'acquisto del blocco
    -- (STOP-ASK #3, opzione a): su annullamento non si minano e non si
    -- stornano → ramo annullamento invariato per i ROBI. Unica ricompensa
    -- che esiste = ROBI del rullo, sempre del partecipante.
    v_refund_result := refund_airdrop(p_airdrop_id);

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
      'nft_shares_minted', CASE WHEN v_success THEN ROUND(v_nft_totali, 4) ELSE 0 END,
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
    'nft_shares_minted', CASE WHEN v_success THEN ROUND(v_nft_totali, 4) ELSE 0 END,
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

-- Canone retroattivo sui nomi esistenti
UPDATE nft_rewards SET name = REPLACE(name, 'Tessera Rendimento', 'ROBI Reward')
WHERE name LIKE '%Tessera Rendimento%';

-- ─────────────────────────────────────────────────────────────
-- Mini integration test (feedback_pr_integration_test)
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_src TEXT;
BEGIN
  SELECT pg_get_functiondef('public.execute_draw(uuid,boolean)'::regprocedure) INTO v_src;
  IF v_src NOT ILIKE '%v_cap_factor%' THEN
    RAISE EXCEPTION 'test FAIL · execute_draw senza cap proporzionale';
  END IF;
  IF v_src ILIKE '%Tessera Rendimento%' THEN
    RAISE EXCEPTION 'test FAIL · lessico vietato ancora presente in execute_draw';
  END IF;
  IF EXISTS (SELECT 1 FROM nft_rewards WHERE name LIKE '%Tessera Rendimento%') THEN
    RAISE EXCEPTION 'test FAIL · nft_rewards contiene ancora Tessera Rendimento';
  END IF;
  RAISE NOTICE 'integration test OK · cap proporzionale + canone ROBI Reward';
END $$;
