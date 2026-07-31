-- AIRDROP B2C — fondazione aziende + Brand Manager (31 lug 2026, GO Skeezu). Applicata live via MCP
-- (migration b2c_companies_brand_manager_foundation). Additiva, dormiente (manca il frontend + il
-- gate in fase di creazione airdrop). Test end-to-end (DO block auto-annullato):
--   A crea azienda -> brand_manager; B chiede -> pending; A approva -> approved; admin verifica;
--   can_airdrop_for_company: B false->true (dopo approvazione+verifica), C (non membro) false. OK.
--
-- REGOLE (Skeezu): solo profili associati (approvati) a un'azienda VERIFICATA possono proporre
-- AIRDROP B2C. Un utente registra un'azienda -> ne diventa Brand Manager; altri si associano su
-- richiesta approvata dal Brand Manager. Il motore airdrop attuale (Salita/Step), per le aziende,
-- e' il prodotto "PRODUCT HYPE" (b2c_product); altri prodotti B2C verranno.
-- DECISIONE APERTA: companies.verified default false -> AIROOBI verifica prima (anti-impersonazione
-- brand). Se si vuole self-service, cambiare il default / il gate can_airdrop_for_company.

CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  brand_manager_id uuid NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='companies' AND policyname='companies_read_all') THEN
    CREATE POLICY companies_read_all ON public.companies FOR SELECT USING (true);
  END IF;
END $$;
REVOKE INSERT, UPDATE, DELETE ON public.companies FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('brand_manager','member')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  decided_by uuid,
  UNIQUE (company_id, user_id)
);
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE ON public.company_members FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_brand_manager(p_company_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM company_members WHERE company_id=p_company_id AND user_id=auth.uid() AND role='brand_manager' AND status='approved');
$$;
GRANT EXECUTE ON FUNCTION public.is_brand_manager(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.can_airdrop_for_company(p_company_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM company_members WHERE company_id=p_company_id AND user_id=auth.uid() AND status='approved')
     AND EXISTS (SELECT 1 FROM companies WHERE id=p_company_id AND verified=true AND status='active');
$$;
GRANT EXECUTE ON FUNCTION public.can_airdrop_for_company(uuid) TO authenticated;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='company_members' AND policyname='cm_read_own') THEN
    CREATE POLICY cm_read_own ON public.company_members FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='company_members' AND policyname='cm_read_bm') THEN
    CREATE POLICY cm_read_bm ON public.company_members FOR SELECT USING (public.is_brand_manager(company_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='company_members' AND policyname='cm_read_admin') THEN
    CREATE POLICY cm_read_admin ON public.company_members FOR SELECT USING (public.is_admin());
  END IF;
END $$;

ALTER TABLE public.airdrops ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id);
ALTER TABLE public.airdrops ADD COLUMN IF NOT EXISTS b2c_product text;

CREATE OR REPLACE FUNCTION public.create_company(p_name text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE v_uid uuid := auth.uid(); v_id uuid; v_slug text;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok',false,'error','NOT_AUTHENTICATED'); END IF;
  IF p_name IS NULL OR length(trim(p_name)) < 2 THEN RETURN jsonb_build_object('ok',false,'error','BAD_NAME'); END IF;
  v_slug := lower(regexp_replace(trim(p_name),'[^a-zA-Z0-9]+','-','g')) || '-' || substr(replace(gen_random_uuid()::text,'-',''),1,6);
  INSERT INTO companies(name,slug,brand_manager_id) VALUES (trim(p_name), v_slug, v_uid) RETURNING id INTO v_id;
  INSERT INTO company_members(company_id,user_id,role,status,decided_at,decided_by)
    VALUES (v_id,v_uid,'brand_manager','approved',now(),v_uid);
  RETURN jsonb_build_object('ok',true,'company_id',v_id,'verified',false);
END;$fn$;
REVOKE ALL ON FUNCTION public.create_company(text) FROM public;
GRANT EXECUTE ON FUNCTION public.create_company(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.request_join_company(p_company_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE v_uid uuid := auth.uid(); v_bm uuid; v_name text;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok',false,'error','NOT_AUTHENTICATED'); END IF;
  SELECT brand_manager_id, name INTO v_bm, v_name FROM companies WHERE id=p_company_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','NOT_FOUND'); END IF;
  IF EXISTS (SELECT 1 FROM company_members WHERE company_id=p_company_id AND user_id=v_uid) THEN
     RETURN jsonb_build_object('ok',false,'error','ALREADY_MEMBER_OR_PENDING'); END IF;
  INSERT INTO company_members(company_id,user_id,role,status) VALUES (p_company_id,v_uid,'member','pending');
  INSERT INTO notifications(user_id,type,title,body)
    VALUES (v_bm,'company_join_request','Richiesta di adesione','Un utente ha chiesto di unirsi a "'||v_name||'". Approva o rifiuta dalla gestione azienda.');
  RETURN jsonb_build_object('ok',true,'status','pending');
END;$fn$;
REVOKE ALL ON FUNCTION public.request_join_company(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.request_join_company(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.decide_company_membership(p_membership_id uuid, p_approve boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE v_uid uuid := auth.uid(); v_m RECORD; v_cname text;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok',false,'error','NOT_AUTHENTICATED'); END IF;
  SELECT * INTO v_m FROM company_members WHERE id=p_membership_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','NOT_FOUND'); END IF;
  IF NOT (public.is_brand_manager(v_m.company_id) OR public.is_admin()) THEN
     RETURN jsonb_build_object('ok',false,'error','NOT_BRAND_MANAGER'); END IF;
  IF v_m.status <> 'pending' THEN RETURN jsonb_build_object('ok',false,'error','NOT_PENDING'); END IF;
  IF v_m.role = 'brand_manager' THEN RETURN jsonb_build_object('ok',false,'error','CANNOT_DECIDE_BM'); END IF;
  UPDATE company_members SET status=CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END, decided_at=now(), decided_by=v_uid
    WHERE id=p_membership_id;
  SELECT name INTO v_cname FROM companies WHERE id=v_m.company_id;
  INSERT INTO notifications(user_id,type,title,body)
    VALUES (v_m.user_id,'company_decision',
      CASE WHEN p_approve THEN 'Adesione approvata' ELSE 'Adesione rifiutata' END,
      'La tua richiesta per "'||v_cname||'" e'' stata '||CASE WHEN p_approve THEN 'approvata: ora puoi gestire gli airdrop B2C.' ELSE 'rifiutata.' END);
  RETURN jsonb_build_object('ok',true,'status',CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END);
END;$fn$;
REVOKE ALL ON FUNCTION public.decide_company_membership(uuid,boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.decide_company_membership(uuid,boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_verify_company(p_company_id uuid, p_verified boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
BEGIN
  IF NOT public.is_admin() THEN RETURN jsonb_build_object('ok',false,'error','NOT_ADMIN'); END IF;
  UPDATE companies SET verified=p_verified WHERE id=p_company_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','NOT_FOUND'); END IF;
  RETURN jsonb_build_object('ok',true,'company_id',p_company_id,'verified',p_verified);
END;$fn$;
REVOKE ALL ON FUNCTION public.admin_verify_company(uuid,boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_verify_company(uuid,boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_my_companies()
RETURNS TABLE(company_id uuid, name text, role text, verified boolean) LANGUAGE sql SECURITY DEFINER STABLE SET search_path=public AS $fn$
  SELECT c.id, c.name, m.role, c.verified
  FROM company_members m JOIN companies c ON c.id=m.company_id
  WHERE m.user_id=auth.uid() AND m.status='approved' AND c.status='active';
$fn$;
GRANT EXECUTE ON FUNCTION public.get_my_companies() TO authenticated;
