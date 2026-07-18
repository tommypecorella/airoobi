-- SPECCHIO (applicata al live 18 lug 2026 via MCP: 'rbac_register_notifiche').
-- Registrazione RBAC modulo 'notifiche' (gotcha: TRE posti — role_permissions,
-- lista cablata get_user_visible_modules, mappe FE in abo.html)

INSERT INTO role_permissions (role, module, action)
VALUES ('admin','notifiche','view'),('admin','notifiche','edit'),('admin','notifiche','manage')
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.get_user_visible_modules(p_user_id uuid DEFAULT auth.uid())
 RETURNS text[]
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_email       TEXT;
  v_modules     TEXT[];
  v_all_modules TEXT[] := ARRAY[
    'dashboard','pipeline_airdrop','analisi_fairness','messaggi','utenti',
    'treasury_fondi','conto_aria_piattaforma','patrimonio_aziendale','cost_tracker','aria_robi',
    'collaboratori_permessi','categorie','engine_config','evalobi','segnalazioni','notifiche'
  ];
BEGIN
  IF p_user_id IS NULL THEN RETURN ARRAY[]::TEXT[]; END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = p_user_id;
  IF v_email IN ('ceo@airoobi.com','tommaso.pecorella+ceo@outlook.com') THEN
    RETURN v_all_modules;
  END IF;

  SELECT ARRAY_AGG(m ORDER BY m) INTO v_modules
  FROM unnest(v_all_modules) AS m
  WHERE user_has_permission(p_user_id, m, 'view');

  RETURN COALESCE(v_modules, ARRAY[]::TEXT[]);
END; $function$;
