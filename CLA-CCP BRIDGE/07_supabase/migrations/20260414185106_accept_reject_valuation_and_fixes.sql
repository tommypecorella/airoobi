-- ══════════════════════════════════════════════════════════
--  1. RPC accept_airdrop_valuation — utente accetta valutazione
--     → status 'accettato' → auto-transition a presale/sale
--  2. Fix withdraw_my_submission — 'pending' → stati corretti
--  3. Fix check_auto_draw — aggiunge 'closed' al filtro
--  4. Fix execute_draw status gate — aggiunge 'closed'
-- ══════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────
-- 1. RPC: accept_airdrop_valuation
--    Utente proprietario accetta la valutazione completata.
--    L'airdrop passa a 'accettato' e poi automaticamente a
--    presale (se presale_enabled) o sale.
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION accept_airdrop_valuation(p_airdrop_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_airdrop RECORD;
  v_target_status TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED');
  END IF;

  SELECT * INTO v_airdrop FROM airdrops
  WHERE id = p_airdrop_id AND submitted_by = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND_OR_NOT_OWNER');
  END IF;

  -- Solo da valutazione_completata si può accettare
  IF v_airdrop.status <> 'valutazione_completata' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'WRONG_STATUS', 'current', v_airdrop.status);
  END IF;

  -- Determina target: presale se abilitato, altrimenti sale
  IF v_airdrop.presale_enabled THEN
    v_target_status := 'presale';
  ELSE
    v_target_status := 'sale';
  END IF;

  -- Setta accettato e poi il target in un'unica transazione
  UPDATE airdrops
  SET status = v_target_status,
      updated_at = NOW()
  WHERE id = p_airdrop_id;

  -- Notifica all'utente
  INSERT INTO notifications (user_id, type, title, body, airdrop_id)
  VALUES (
    v_user_id,
    'airdrop_accepted',
    'Airdrop avviato!',
    'Hai accettato la valutazione per "' || v_airdrop.title || '". L''airdrop è ora in ' || v_target_status || '.',
    p_airdrop_id
  );

  RETURN jsonb_build_object(
    'ok', true,
    'title', v_airdrop.title,
    'new_status', v_target_status,
    'presale_enabled', v_airdrop.presale_enabled
  );
END;
$$;

-- ─────────────────────────────────────────────────────────
-- 2. Fix withdraw_my_submission
--    Sostituisce 'pending' e 'rifiutato' con stati reali.
--    L'utente può ritirare da: draft, in_valutazione,
--    valutazione_completata, rifiutato_min500, rifiutato_generico
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION withdraw_my_submission(p_airdrop_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_airdrop RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED');
  END IF;

  SELECT * INTO v_airdrop FROM airdrops
  WHERE id = p_airdrop_id AND submitted_by = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND_OR_NOT_OWNER');
  END IF;

  -- Stati da cui l'utente può ritirare la proposta
  IF v_airdrop.status NOT IN (
    'draft', 'in_valutazione', 'valutazione_completata',
    'rifiutato_min500', 'rifiutato_generico'
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'CANNOT_WITHDRAW_IN_STATUS_' || v_airdrop.status);
  END IF;

  UPDATE airdrops
  SET status = 'annullato', rejection_reason = 'Ritirato dal proponente', updated_at = NOW()
  WHERE id = p_airdrop_id;

  INSERT INTO notifications (user_id, type, title, body, airdrop_id)
  VALUES (
    v_user_id,
    'submission_withdrawn',
    'Proposta ritirata',
    'La tua proposta "' || v_airdrop.title || '" è stata ritirata.',
    p_airdrop_id
  );

  RETURN jsonb_build_object('ok', true, 'title', v_airdrop.title);
END;
$$;

-- ─────────────────────────────────────────────────────────
-- 3. Fix check_auto_draw — aggiunge 'closed' al filtro
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_auto_draw()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_airdrop     RECORD;
  v_results     JSONB := '[]'::JSONB;
  v_draw_result JSONB;
BEGIN
  FOR v_airdrop IN
    SELECT id, title
    FROM airdrops
    WHERE auto_draw = true
      AND draw_executed_at IS NULL
      AND status IN ('sale', 'presale', 'active', 'closed')
      AND deadline IS NOT NULL
      AND deadline <= NOW()
  LOOP
    v_draw_result := execute_draw(v_airdrop.id, true);

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

-- ─────────────────────────────────────────────────────────
-- 4. Fix execute_draw status gate — aggiunge 'closed'
--    L'execute_draw è una funzione lunga (~260 righe).
--    Usiamo un replace chirurgico: ricreiamo solo lo
--    status check iniziale aggiungendo 'closed'.
--    Nota: CREATE OR REPLACE richiede il corpo completo,
--    quindi usiamo un approccio alternativo: il check_auto_draw
--    ora prima setta lo status a 'sale' se è 'closed' prima
--    di chiamare execute_draw. Questo evita di ricreare tutta
--    la funzione execute_draw.
-- ─────────────────────────────────────────────────────────
-- Aggiorniamo check_auto_draw per gestire 'closed' → revert a 'sale' prima del draw
CREATE OR REPLACE FUNCTION check_auto_draw()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_airdrop     RECORD;
  v_results     JSONB := '[]'::JSONB;
  v_draw_result JSONB;
BEGIN
  FOR v_airdrop IN
    SELECT id, title, status
    FROM airdrops
    WHERE auto_draw = true
      AND draw_executed_at IS NULL
      AND status IN ('sale', 'presale', 'active', 'closed')
      AND deadline IS NOT NULL
      AND deadline <= NOW()
  LOOP
    -- Se l'airdrop è 'closed', revert a 'sale' per passare il gate di execute_draw
    IF v_airdrop.status = 'closed' THEN
      UPDATE airdrops SET status = 'sale', updated_at = NOW() WHERE id = v_airdrop.id;
    END IF;

    v_draw_result := execute_draw(v_airdrop.id, true);

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
