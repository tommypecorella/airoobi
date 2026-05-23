-- ══════════════════════════════════════════════════════════════════════════
--  GS-1 REOPEN · Registrazione modulo 'evalobi' nel sistema RBAC
--  Causa originale: sidebar permission-rendered (get_user_visible_modules)
--  non includeva 'evalobi' in v_all_modules → voce HTML statica mai mostrata.
--  Fix: aggiungo 'evalobi' a v_all_modules + seed role_permissions admin.
--  (CEO bypassa via email-allowlist nella RPC, ok by-design.)
-- ══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_user_visible_modules(p_user_id UUID DEFAULT auth.uid())
RETURNS TEXT[]
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email       TEXT;
  v_modules     TEXT[];
  v_all_modules TEXT[] := ARRAY[
    'dashboard','pipeline_airdrop','analisi_fairness','messaggi','utenti',
    'treasury_fondi','conto_aria_piattaforma','patrimonio_aziendale','cost_tracker','aria_robi',
    'collaboratori_permessi','categorie','engine_config','evalobi'
  ];
BEGIN
  IF p_user_id IS NULL THEN RETURN ARRAY[]::TEXT[]; END IF;

  -- CEO bypassa: tutti i moduli (Super User immutabile)
  SELECT email INTO v_email FROM auth.users WHERE id = p_user_id;
  IF v_email IN ('ceo@airoobi.com','tommaso.pecorella+ceo@outlook.com') THEN
    RETURN v_all_modules;
  END IF;

  SELECT ARRAY_AGG(m ORDER BY m) INTO v_modules
  FROM unnest(v_all_modules) AS m
  WHERE user_has_permission(p_user_id, m, 'view');

  RETURN COALESCE(v_modules, ARRAY[]::TEXT[]);
END; $$;

GRANT EXECUTE ON FUNCTION get_user_visible_modules(UUID) TO authenticated;

-- Seed role_permissions per evalobi
--  admin: view + manage (gestione completa registry)
--  evaluator: view (i valutatori devono poter consultare il registry per cross-check)
--  Altri ruoli (community_manager, treasurer, analyst): nessun accesso (registry tecnico)
INSERT INTO role_permissions(role, module, action) VALUES
  ('admin','evalobi','view'),
  ('admin','evalobi','manage'),
  ('evaluator','evalobi','view')
ON CONFLICT (role, module, action) DO NOTHING;

-- Integration test (cal. feedback_pr_integration_test)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM role_permissions WHERE role='admin' AND module='evalobi' AND action='view') THEN
    RAISE EXCEPTION 'GS-1 FAIL · evalobi module not registered for admin';
  END IF;
  IF NOT ('evalobi' = ANY(get_user_visible_modules((SELECT id FROM auth.users WHERE email='ceo@airoobi.com' LIMIT 1)))) THEN
    RAISE EXCEPTION 'GS-1 FAIL · evalobi non ritornato da get_user_visible_modules per CEO';
  END IF;
END $$;
