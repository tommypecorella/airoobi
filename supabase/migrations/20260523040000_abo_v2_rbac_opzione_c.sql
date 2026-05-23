-- ABO v2 · FASE 3 · PR-C1 · RBAC Opzione C (Hybrid template + per-user overrides)
-- ROBY review §4.2-§4.3 + mockup · Skeezu sign-off Opzione C 23 May 2026.
--
-- Cosa cambia:
--  1. user_roles CHECK esteso da {admin,evaluator} a {admin,evaluator,
--     community_manager,treasurer,analyst,custom}.
--  2. role_permissions(role,module,action) · template di ruolo (matrice di base).
--  3. user_permission_overrides(user_id,module,action,granted) · cella per cella
--     per utente (granted=TRUE grant esplicito · granted=FALSE revoke esplicito).
--  4. RPC user_has_permission(uuid,text,text) RETURNS BOOLEAN · check unico
--     con precedence CEO email > override > template.
--  5. RPC get_user_visible_modules(uuid) RETURNS TEXT[] · per sidebar
--     permission-rendered.
--  6. Seed dei 5 template (admin, evaluator, community_manager, treasurer,
--     analyst) · CEO Super User gestito via email hardcoded nelle RPC.
--
-- I 13 moduli (review §4.2): dashboard · pipeline_airdrop · analisi_fairness ·
-- messaggi · utenti · treasury_fondi · conto_aria_piattaforma ·
-- patrimonio_aziendale · cost_tracker · aria_robi · collaboratori_permessi ·
-- categorie · engine_config.
--
-- Le 6 azioni: view · edit · approve · draw · reply · manage. view è
-- prerequisito implicito (get_user_visible_modules filtra su view).
-- Lo scoping per `category` del Valutatore resta su user_roles.category — non
-- è in conflitto con il modello permessi.

-- ─────────────────────────────────────────────────────────────
-- 1. user_roles · CHECK esteso a 6 ruoli
-- ─────────────────────────────────────────────────────────────
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('admin','evaluator','community_manager','treasurer','analyst','custom'));

-- ─────────────────────────────────────────────────────────────
-- 2. role_permissions · template di ruolo (matrice di base)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS role_permissions (
  role        TEXT NOT NULL CHECK (role IN ('admin','evaluator','community_manager','treasurer','analyst')),
  module      TEXT NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('view','edit','approve','draw','reply','manage')),
  PRIMARY KEY (role, module, action)
);

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Solo admin scrive; tutti gli autenticati possono leggere (per future UI lookup).
-- Path principale di lettura = RPC SECURITY DEFINER.
DROP POLICY IF EXISTS "role_permissions_admin_write" ON role_permissions;
CREATE POLICY "role_permissions_admin_write" ON role_permissions FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "role_permissions_authenticated_read" ON role_permissions;
CREATE POLICY "role_permissions_authenticated_read" ON role_permissions FOR SELECT TO authenticated
  USING (TRUE);

-- GRANT esplicito (feedback_supabase_grant_on_create_table)
GRANT SELECT ON role_permissions TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- 3. user_permission_overrides · per-utente cella per cella ("Personalizzato")
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_permission_overrides (
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module      TEXT NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('view','edit','approve','draw','reply','manage')),
  granted     BOOLEAN NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, module, action)
);

ALTER TABLE user_permission_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "upo_admin_write" ON user_permission_overrides;
CREATE POLICY "upo_admin_write" ON user_permission_overrides FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- Self-read: un utente vede i propri override. Admin vede tutto.
DROP POLICY IF EXISTS "upo_self_read" ON user_permission_overrides;
CREATE POLICY "upo_self_read" ON user_permission_overrides FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

GRANT SELECT ON user_permission_overrides TO authenticated;

CREATE INDEX IF NOT EXISTS idx_upo_user_module ON user_permission_overrides(user_id, module);

-- ─────────────────────────────────────────────────────────────
-- 4. RPC user_has_permission · check unico (path FE per gating azioni)
-- ─────────────────────────────────────────────────────────────
-- Precedence (review §4.3):
--   (1) CEO email hardcoded → TRUE (immutabile, Super User).
--   (2) Override esplicito (granted=TRUE/FALSE) → ritorna granted (vince).
--   (3) Template ruolo via JOIN user_roles × role_permissions.
--   (4) Default → FALSE.
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID, p_module TEXT, p_action TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email      TEXT;
  v_granted    BOOLEAN;
BEGIN
  IF p_user_id IS NULL THEN RETURN FALSE; END IF;

  -- (1) CEO Super User · allineato a is_admin() esistente
  SELECT email INTO v_email FROM auth.users WHERE id = p_user_id;
  IF v_email IN ('ceo@airoobi.com','tommaso.pecorella+ceo@outlook.com') THEN
    RETURN TRUE;
  END IF;

  -- (2) Override esplicito (vince sul template)
  SELECT granted INTO v_granted FROM user_permission_overrides
    WHERE user_id = p_user_id AND module = p_module AND action = p_action;
  IF FOUND THEN RETURN v_granted; END IF;

  -- (3) Template ruolo via JOIN (user può avere più ruoli → OR)
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = p_user_id
      AND rp.module = p_module
      AND rp.action = p_action
  );
END; $$;

GRANT EXECUTE ON FUNCTION user_has_permission(UUID, TEXT, TEXT) TO authenticated;
COMMENT ON FUNCTION user_has_permission(UUID, TEXT, TEXT) IS
  'Closure RBAC Opzione C · precedence: CEO email > user_permission_overrides > role_permissions × user_roles.';

-- ─────────────────────────────────────────────────────────────
-- 5. RPC get_user_visible_modules · sidebar permission-rendered + "Vedi come"
-- ─────────────────────────────────────────────────────────────
-- Restituisce la lista dei moduli (max 13) su cui l'utente ha 'view' permission.
-- Usato da abo.html per renderizzare solo le voci di sidebar concesse, e dal
-- simulatore "Vedi come" passando un p_user_id arbitrario.
CREATE OR REPLACE FUNCTION get_user_visible_modules(p_user_id UUID DEFAULT auth.uid())
RETURNS TEXT[]
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email       TEXT;
  v_modules     TEXT[];
  v_all_modules TEXT[] := ARRAY[
    'dashboard','pipeline_airdrop','analisi_fairness','messaggi','utenti',
    'treasury_fondi','conto_aria_piattaforma','patrimonio_aziendale','cost_tracker','aria_robi',
    'collaboratori_permessi','categorie','engine_config'
  ];
BEGIN
  IF p_user_id IS NULL THEN RETURN ARRAY[]::TEXT[]; END IF;

  -- CEO: tutti i 13 moduli (Super User immutabile)
  SELECT email INTO v_email FROM auth.users WHERE id = p_user_id;
  IF v_email IN ('ceo@airoobi.com','tommaso.pecorella+ceo@outlook.com') THEN
    RETURN v_all_modules;
  END IF;

  -- Altrimenti: moduli dove user_has_permission(view) ritorna TRUE
  SELECT ARRAY_AGG(m ORDER BY m) INTO v_modules
  FROM unnest(v_all_modules) AS m
  WHERE user_has_permission(p_user_id, m, 'view');

  RETURN COALESCE(v_modules, ARRAY[]::TEXT[]);
END; $$;

GRANT EXECUTE ON FUNCTION get_user_visible_modules(UUID) TO authenticated;
COMMENT ON FUNCTION get_user_visible_modules(UUID) IS
  'Closure RBAC · array dei moduli con view permission per il p_user_id (CEO=tutti).';

-- ─────────────────────────────────────────────────────────────
-- 6. Seed dei 5 template di ruolo · review §4.3
-- ─────────────────────────────────────────────────────────────
-- view è prerequisito implicito: get_user_visible_modules filtra su view. Per
-- chiarezza la includo dove ci sono altre azioni.
INSERT INTO role_permissions(role, module, action) VALUES
  -- ── ADMIN · accesso totale (catch-all per future admin extra; il CEO bypassa via email) ──
  ('admin','dashboard','view'),
  ('admin','pipeline_airdrop','view'),('admin','pipeline_airdrop','edit'),('admin','pipeline_airdrop','approve'),('admin','pipeline_airdrop','draw'),
  ('admin','analisi_fairness','view'),
  ('admin','messaggi','view'),('admin','messaggi','reply'),
  ('admin','utenti','view'),('admin','utenti','manage'),
  ('admin','treasury_fondi','view'),('admin','treasury_fondi','edit'),('admin','treasury_fondi','manage'),
  ('admin','conto_aria_piattaforma','view'),('admin','conto_aria_piattaforma','manage'),
  ('admin','patrimonio_aziendale','view'),('admin','patrimonio_aziendale','edit'),('admin','patrimonio_aziendale','manage'),
  ('admin','cost_tracker','view'),('admin','cost_tracker','edit'),('admin','cost_tracker','manage'),
  ('admin','aria_robi','view'),
  ('admin','collaboratori_permessi','view'),('admin','collaboratori_permessi','manage'),
  ('admin','categorie','view'),('admin','categorie','manage'),
  ('admin','engine_config','view'),('admin','engine_config','edit'),('admin','engine_config','manage'),

  -- ── EVALUATOR (Valutatore) · Pipeline + Analisi + Messaggi + Dashboard ──
  -- Scoping per categoria resta su user_roles.category (esistente).
  ('evaluator','dashboard','view'),
  ('evaluator','pipeline_airdrop','view'),('evaluator','pipeline_airdrop','edit'),('evaluator','pipeline_airdrop','approve'),
  ('evaluator','analisi_fairness','view'),
  ('evaluator','messaggi','view'),('evaluator','messaggi','reply'),

  -- ── COMMUNITY MANAGER · Messaggi + Utenti + Dashboard + Analisi ──
  ('community_manager','dashboard','view'),
  ('community_manager','messaggi','view'),('community_manager','messaggi','reply'),
  ('community_manager','utenti','view'),('community_manager','utenti','manage'),
  ('community_manager','analisi_fairness','view'),

  -- ── TREASURER · tutta Tesoreria + Dashboard ──
  ('treasurer','dashboard','view'),
  ('treasurer','treasury_fondi','view'),('treasurer','treasury_fondi','edit'),('treasurer','treasury_fondi','manage'),
  ('treasurer','conto_aria_piattaforma','view'),('treasurer','conto_aria_piattaforma','manage'),
  ('treasurer','patrimonio_aziendale','view'),('treasurer','patrimonio_aziendale','edit'),('treasurer','patrimonio_aziendale','manage'),
  ('treasurer','cost_tracker','view'),('treasurer','cost_tracker','edit'),('treasurer','cost_tracker','manage'),
  ('treasurer','aria_robi','view'),

  -- ── ANALYST (sola lettura) · Dashboard + Analisi + ARIA&ROBI + Utenti + Pipeline (read) ──
  ('analyst','dashboard','view'),
  ('analyst','pipeline_airdrop','view'),
  ('analyst','analisi_fairness','view'),
  ('analyst','aria_robi','view'),
  ('analyst','utenti','view')
ON CONFLICT (role, module, action) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 7. Integration test · feedback_pr_integration_test
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_role_count    INTEGER;
  v_total_count   INTEGER;
BEGIN
  -- Tabelle presenti
  IF to_regclass('public.role_permissions') IS NULL THEN
    RAISE EXCEPTION 'PR-C1 FAIL · role_permissions table mancante';
  END IF;
  IF to_regclass('public.user_permission_overrides') IS NULL THEN
    RAISE EXCEPTION 'PR-C1 FAIL · user_permission_overrides table mancante';
  END IF;

  -- RLS attiva su entrambe
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public'
                 AND tablename='role_permissions' AND rowsecurity) THEN
    RAISE EXCEPTION 'PR-C1 FAIL · RLS non attiva su role_permissions';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public'
                 AND tablename='user_permission_overrides' AND rowsecurity) THEN
    RAISE EXCEPTION 'PR-C1 FAIL · RLS non attiva su user_permission_overrides';
  END IF;

  -- RPC presenti
  IF to_regprocedure('public.user_has_permission(uuid,text,text)') IS NULL THEN
    RAISE EXCEPTION 'PR-C1 FAIL · user_has_permission mancante';
  END IF;
  IF to_regprocedure('public.get_user_visible_modules(uuid)') IS NULL THEN
    RAISE EXCEPTION 'PR-C1 FAIL · get_user_visible_modules mancante';
  END IF;

  -- Seed: 5 ruoli distinti minimo
  SELECT COUNT(DISTINCT role) INTO v_role_count FROM role_permissions;
  IF v_role_count < 5 THEN
    RAISE EXCEPTION 'PR-C1 FAIL · seed incompleto (ruoli distinti: %)', v_role_count;
  END IF;

  -- Sanity: ogni ruolo non-admin ha almeno una view permission
  IF EXISTS (
    SELECT 1 FROM (VALUES ('evaluator'),('community_manager'),('treasurer'),('analyst')) AS r(role)
    WHERE NOT EXISTS (
      SELECT 1 FROM role_permissions rp WHERE rp.role=r.role AND rp.action='view'
    )
  ) THEN
    RAISE EXCEPTION 'PR-C1 FAIL · un ruolo non-admin manca di view permission';
  END IF;

  SELECT COUNT(*) INTO v_total_count FROM role_permissions;
  RAISE NOTICE 'PR-C1 integration test OK · % righe role_permissions su % ruoli', v_total_count, v_role_count;
END $$;
