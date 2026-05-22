-- W5 · Airdrop Closure Design v3 · PR-4 · Gate fee upfront
-- ROBY_Airdrop_Closure_Design_LOCKED_2026-05-22 §5 · ROBY_Reply_CCP_STOPASK #4.
--
-- Solo il gate: lo status non passa a presale/sale senza launch_fee_paid.
-- La meccanica di addebito fee + payout venditore «100% a conferma ricezione»
-- slitta a Stage 2 (rail KAS) — è l'unico momento in cui il rail esiste.
--
-- DECISIONE TECNICA (per sign-off ROBY/Skeezu):
-- launch_fee_paid (airdrops) ha DEFAULT 0 e in Alpha NESSUN flusso lo valorizza
-- (l'addebito è Stage 2). Un gate hard «launch_fee_paid > 0» bloccherebbe OGNI
-- pubblicazione in Alpha → nessun airdrop testabile. Quindi il gate è SHIPPATO
-- ORA ma DORMIENTE, controllato da airdrop_config.enforce_launch_fee_gate
-- (default 'false'). A Stage 2, con il rail KAS attivo: flip della config a
-- 'true' e il gate entra in vigore. La regola «100% a confirm» resta registrata
-- nello spec come override del 50/50.

-- Config flag · gate dormiente fino a Stage 2
INSERT INTO airdrop_config (key, value, description) VALUES
  ('enforce_launch_fee_gate', 'false',
   'PR-4 Closure v3: se true, publish_airdrop_listing richiede launch_fee_paid>0. Flip a true a Stage 2 (rail KAS).')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION publish_airdrop_listing(
  p_airdrop_id      UUID,
  p_is_demo         BOOLEAN DEFAULT FALSE,
  p_duration_days   INTEGER DEFAULT 7,
  p_presale_enabled BOOLEAN DEFAULT FALSE
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_airdrop RECORD;
  v_target_status TEXT;
  v_total_blocks INTEGER;
  v_deadline TIMESTAMPTZ;
  v_deadline_source TEXT;
  v_dispatched INTEGER := 0;
  v_fee_gate TEXT;
BEGIN
  -- Admin gate
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'admin_only' USING ERRCODE = '42501';
  END IF;

  -- Duration sanity (Skeezu LOCK v0.4-2: 7gg base · 10gg mid · 14gg premium · override OK)
  IF p_duration_days NOT BETWEEN 1 AND 60 THEN
    RAISE EXCEPTION 'invalid_duration_days_%', p_duration_days USING ERRCODE = '22023';
  END IF;

  -- Load airdrop (lock row · prevent concurrent publish)
  SELECT * INTO v_airdrop FROM airdrops WHERE id = p_airdrop_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'airdrop_not_found' USING ERRCODE = 'P0002';
  END IF;

  -- Status precondition: post-Atto 1 review approve
  IF v_airdrop.status <> 'accettato' THEN
    RAISE EXCEPTION 'invalid_status_must_be_accettato_was_%', v_airdrop.status USING ERRCODE = '22023';
  END IF;

  -- PR-4 · gate fee upfront. L'airdrop va live solo se la fee piattaforma è
  -- depositata. Gate dormiente in Alpha (rail fee = Stage 2): controllato da
  -- airdrop_config.enforce_launch_fee_gate, default 'false'. Flip a 'true' a
  -- Stage 2 quando il deposito fee è operativo.
  SELECT COALESCE((SELECT value FROM airdrop_config WHERE key = 'enforce_launch_fee_gate'), 'false')
    INTO v_fee_gate;
  IF v_fee_gate = 'true' AND COALESCE(v_airdrop.launch_fee_paid, 0) <= 0 THEN
    RAISE EXCEPTION 'launch_fee_not_paid' USING ERRCODE = '42501';
  END IF;

  -- Derive total_blocks (Skeezu LOCK v0.4-6)
  v_total_blocks := airdrop_total_blocks_derive(v_airdrop.object_value_eur, v_airdrop.block_price_aria);

  -- F5: onora l'override admin se la deadline è già impostata ed è ancora futura;
  -- altrimenti auto-calcola da duration_days (comportamento storico, fallback robusto
  -- anche per override stale/in-the-past).
  IF v_airdrop.deadline IS NOT NULL AND v_airdrop.deadline > NOW() THEN
    v_deadline := v_airdrop.deadline;
    v_deadline_source := 'admin_override';
  ELSE
    v_deadline := NOW() + (p_duration_days || ' days')::INTERVAL;
    v_deadline_source := 'auto_duration';
  END IF;

  v_target_status := CASE WHEN p_presale_enabled THEN 'presale' ELSE 'sale' END;

  -- Update airdrop
  UPDATE airdrops SET
    status               = v_target_status,
    is_demo              = p_is_demo,
    duration_days        = p_duration_days,
    deadline             = v_deadline,
    total_blocks         = v_total_blocks,
    presale_enabled      = p_presale_enabled,
    listing_published_at = NOW(),
    updated_at           = NOW()
  WHERE id = p_airdrop_id;

  -- T2 categoria-match (only LIVE; DEMO is alpha-only context already)
  IF NOT p_is_demo THEN
    INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
    SELECT
      p.id,
      'in_app',
      'T2',
      'airdrop_live_category_match',
      p_airdrop_id,
      jsonb_build_object('category', v_airdrop.category, 'object_value_eur', v_airdrop.object_value_eur),
      'sent'
    FROM profiles p
    WHERE p.deleted_at IS NULL
      AND is_alpha_brave(p.id)
      AND (p.category_preferences ? v_airdrop.category);
    GET DIAGNOSTICS v_dispatched = ROW_COUNT;
  END IF;

  -- T3 broadcast (LIVE only, not presale)
  IF NOT p_is_demo AND v_target_status = 'sale' THEN
    INSERT INTO notification_dispatch_log (user_id, channel, tier, template, airdrop_id, metadata, send_status)
    SELECT
      p.id,
      'in_app',
      'T3',
      'airdrop_live_broadcast',
      p_airdrop_id,
      jsonb_build_object('category', v_airdrop.category, 'object_value_eur', v_airdrop.object_value_eur),
      'sent'
    FROM profiles p
    WHERE p.deleted_at IS NULL
      AND COALESCE(p.notify_all, TRUE) = TRUE
      AND is_alpha_brave(p.id)
      AND NOT (p.category_preferences ? v_airdrop.category);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'airdrop_id', p_airdrop_id,
    'status', v_target_status,
    'is_demo', p_is_demo,
    'duration_days', p_duration_days,
    'total_blocks', v_total_blocks,
    'deadline', v_deadline,
    'deadline_source', v_deadline_source,
    'launch_fee_gate', v_fee_gate,
    'category_match_dispatched', v_dispatched
  );
END;
$$;

GRANT EXECUTE ON FUNCTION publish_airdrop_listing(UUID, BOOLEAN, INTEGER, BOOLEAN) TO authenticated;

COMMENT ON FUNCTION publish_airdrop_listing(UUID, BOOLEAN, INTEGER, BOOLEAN) IS 'Atto 2 admin orchestrator: accettato → presale|sale · derives total_blocks · F5 deadline override · PR-4 gate fee upfront (dormiente via enforce_launch_fee_gate) · logs T2+T3.';

-- ─────────────────────────────────────────────────────────────
-- Mini integration test (feedback_pr_integration_test)
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_src TEXT;
  v_flag TEXT;
BEGIN
  IF to_regprocedure('public.publish_airdrop_listing(uuid,boolean,integer,boolean)') IS NULL THEN
    RAISE EXCEPTION 'PR-4 test FAIL · publish_airdrop_listing mancante';
  END IF;
  -- Config flag presente e dormiente in Alpha
  SELECT value INTO v_flag FROM airdrop_config WHERE key = 'enforce_launch_fee_gate';
  IF v_flag IS NULL THEN
    RAISE EXCEPTION 'PR-4 test FAIL · config enforce_launch_fee_gate mancante';
  END IF;
  IF v_flag <> 'false' THEN
    RAISE WARNING 'PR-4 nota · enforce_launch_fee_gate = % (atteso false in Alpha)', v_flag;
  END IF;
  -- Il gate deve essere nel source della funzione
  SELECT pg_get_functiondef('public.publish_airdrop_listing(uuid,boolean,integer,boolean)'::regprocedure) INTO v_src;
  IF v_src NOT ILIKE '%launch_fee_not_paid%'
     OR v_src NOT ILIKE '%enforce_launch_fee_gate%' THEN
    RAISE EXCEPTION 'PR-4 test FAIL · gate fee upfront non presente in publish_airdrop_listing';
  END IF;
  RAISE NOTICE 'PR-4 integration test OK · gate fee upfront shippato (dormiente, flip a Stage 2)';
END $$;
