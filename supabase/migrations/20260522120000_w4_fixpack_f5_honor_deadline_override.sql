-- W4 Lifecycle Fix Pack · F5 · publish_airdrop_listing honors admin deadline override
-- UAT finding F5: il campo DEADLINE del modal ABO veniva ignorato — publish_airdrop_listing
-- ricalcolava sempre deadline = NOW() + duration_days, scartando l'override admin.
-- Fix (opzione b · CCP triage 22/05): se l'airdrop ha già una deadline FUTURA, onorala;
-- altrimenti auto-calcola da p_duration_days. Restituisce all'admin la leva di chiusura anticipata.
-- Unica differenza vs 20260516211000_w4_m_atto2_02_publish_listing.sql: blocco deadline + return field.
-- Integration test: vedi UAT steps nel closing report Fix Pack (RPC auth-gated, non testabile in-migration).

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
    'category_match_dispatched', v_dispatched
  );
END;
$$;

GRANT EXECUTE ON FUNCTION publish_airdrop_listing(UUID, BOOLEAN, INTEGER, BOOLEAN) TO authenticated;

COMMENT ON FUNCTION publish_airdrop_listing(UUID, BOOLEAN, INTEGER, BOOLEAN) IS 'Atto 2 admin orchestrator: accettato → presale|sale · derives total_blocks · F5: honors admin deadline override if future, else auto from duration_days · logs T2+T3 push dispatch.';
