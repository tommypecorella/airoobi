-- SPECCHIO (applicata al live 18 lug 2026 via MCP in due passi:
-- 'notification_catalog_prefs_admin_alerts' + 'fix_admin_new_report_page_col').
-- Questo file riflette lo stato FINALE.
--
-- CENSIMENTO NOTIFICHE (Skeezu 18 lug): catalogo cosa-notifica-chi con testo/link,
-- interruttori globali (ABO) + preferenze per utente (profilo). Le notifiche di
-- sistema sono OBBLIGATORIE: non spegnibili né globalmente né per utente.
-- Enforcement push in send-push v6 (interruttore globale + prefs per utente).
-- In più: notifiche al TEAM su nuova segnalazione e nuova richiesta di valutazione.

CREATE TABLE IF NOT EXISTS public.notification_catalog (
  key text PRIMARY KEY,                    -- = notifications.type
  event_label text NOT NULL,
  audience text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('campanella','push','campanella+push')),
  sample_text text NOT NULL,
  link text,
  emitter text NOT NULL,
  is_system boolean NOT NULL DEFAULT true, -- obbligatoria
  enabled boolean NOT NULL DEFAULT true,   -- interruttore globale (effettivo solo su non-system)
  audience_admin boolean NOT NULL DEFAULT false,
  sort int NOT NULL DEFAULT 100
);
ALTER TABLE public.notification_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS nc_read ON public.notification_catalog;
CREATE POLICY nc_read ON public.notification_catalog FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS nc_admin_write ON public.notification_catalog;
CREATE POLICY nc_admin_write ON public.notification_catalog FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

INSERT INTO public.notification_catalog (key, event_label, audience, channel, sample_text, link, emitter, is_system, audience_admin, sort) VALUES
 ('airdrop_status','Cambio di stato airdrop (ogni passaggio)','Venditore + tutti con ≥1 Step','campanella+push','«La corsa per [oggetto] (#codice) è aperta: fai i tuoi Step e punta alla vetta» — testo dedicato per ognuno dei 15 stati, variante venditore/partecipante','/airdrops','trigger trg_airdrop_status_notify',true,false,10),
 ('new_airdrop','Nuovo airdrop pubblicato','Utenti con alert sulla categoria','campanella+push','«Nuovo airdrop in [categoria]! Hai ARIA pronti.»','/airdrops','trigger notify_airdrop_published → send-push',false,false,20),
 ('deadline_2h','Ultime 2 ore della corsa','Utenti con l''airdrop nei preferiti','push','«Mancano 2 ore alla chiusura di [oggetto]. Sei N°.»','/airdrops','edge check-deadlines → send-push',false,false,30),
 ('position_lost','Superato in corsa','Utente che perde la posizione','push','«Sei stato superato in [oggetto]. Fai altri Step per risalire.»','/airdrops','dapp → send-push',false,false,40),
 ('draw_winner','Vetta raggiunta','1° classificato','campanella+push','«[oggetto] è tuo! Sei arrivato in vetta.»','/portafoglio','trigger notify_airdrop_published → send-push',true,false,50),
 ('draw_robi','Esito corsa — ROBI','Partecipanti non in vetta','campanella+push','«Airdrop concluso! Hai guadagnato N ROBI.»','/portafoglio','trigger notify_airdrop_published → send-push',true,false,60),
 ('blocks_purchased','Ricevuta Step percorsi','Chi fa lo Step','campanella','«Hai percorso N Step in [oggetto] per N ARIA.»','/airdrops','RPC buy_blocks',true,false,70),
 ('rullo_robi_found','Fiore ROBI sulla salita','Chi lo raccoglie','campanella','«Hai raccolto N fiori ROBI lungo la salita di [oggetto]! Già nel tuo portafoglio.»','/portafoglio','RPC buy_blocks',true,false,80),
 ('blocks_sold','Nuova partecipazione al tuo airdrop','Venditore','campanella','«[utente] ha percorso N Step in [oggetto] (N/tot).»','/venditore','RPC buy_blocks',true,false,90),
 ('alpha_reward','Premi Regole Alpha Brave 1000','Utente premiato','campanella','«🌸 +1 ROBI — hai chiesto una valutazione. Regola Alpha Brave 1000.»','/portafoglio','RPC submit/accept + trigger vetta',true,false,100),
 ('airdrop_accepted','Valutazione accettata — airdrop avviato','Venditore','campanella','«Hai accettato la valutazione per [oggetto]. L''airdrop è ora in [fase].»','/venditore','RPC accept_airdrop_valuation',true,false,110),
 ('airdrop_pending_seller_decision','Serve la decisione del venditore','Venditore','campanella','«[oggetto]: raccolta conclusa, conferma la tua decisione entro la scadenza.»','/venditore','RPC early_close_airdrop',true,false,120),
 ('airdrop_extended','Corsa estesa','Venditore','campanella','«Hai esteso [oggetto] di N ore (N ARIA, di cui €N al Fondo Comune). Estensione N di 5.»','/venditore','RPC extend_airdrop_deadline',true,false,130),
 ('participation_cancelled','Partecipazione ritirata','Utente che si ritira','campanella','«Hai ritirato la tua partecipazione da [oggetto]. N Step rilasciati. N ARIA non rimborsati.»','/airdrops','RPC cancel_my_participation',true,false,140),
 ('airdrop_cancelled_refund','Airdrop annullato — rimborso','Partecipanti','campanella','«L''airdrop [oggetto] è stato annullato dal venditore. N ARIA sono stati rimborsati.»','/portafoglio','RPC withdraw_my_submission',true,false,150),
 ('submission_withdrawn','Proposta ritirata','Venditore','campanella','«La tua proposta [oggetto] è stata ritirata. N ARIA rimborsati a N partecipante/i.»','/venditore','RPC withdraw_my_submission',true,false,160),
 ('seller_cancellation_registered','Annullamento registrato','Venditore','campanella','«Annullamento registrato. Contatore annullamenti: N.»','/venditore','RPC register_seller_cancellation',true,false,170),
 ('seller_banned','Sospensione vendita attiva','Venditore','campanella','«Hai raggiunto N annullamenti quest''anno. Vendita sospesa.»','/venditore','RPC register_seller_cancellation',true,false,180),
 ('seller_ban_unlocked','Sospensione rimossa','Venditore','campanella','«Hai sbloccato la vendita con 1000 ARIA. Contatore annullamenti azzerato.»','/venditore','RPC unlock_seller_ban',true,false,190),
 ('message','Messaggio sull''airdrop','Venditore / partecipanti / team','campanella','Testo libero del mittente sull''airdrop.','/dapp','RPC send_airdrop_message',true,false,200),
 ('report_reward','Premio segnalazione','Chi ha segnalato','campanella','«🌸 +N ROBI — grazie della tua segnalazione: ci aiuta a costruire meglio.»','/portafoglio','RPC admin_resolve_report',true,false,210),
 ('evaluation_courtesy_refund','50 ARIA di cortesia (valutazione in ritardo)','Venditore','campanella','«La tua valutazione è in ritardo · ti accreditiamo 50 ARIA di cortesia · grazie per la pazienza»','/venditore','cron auto_escalate_evaluation_requests',true,false,220),
 ('admin_evaluation_reminder','SLA valutazione scaduta da 24h','Team AIROOBI (admin)','campanella','«Valutazione [id] · SLA scaduta da 24h»','/abo/pipeline-airdrop.html','cron auto_escalate_evaluation_requests',true,true,230),
 ('admin_new_valuation','Nuova richiesta di valutazione','Team AIROOBI (admin)','campanella+push','«Nuova proposta da valutare: [oggetto] (#codice)»','/abo/pipeline-airdrop.html','trigger trg_admin_new_valuation',true,true,240),
 ('admin_new_report','Nuova segnalazione utente','Team AIROOBI (admin)','campanella+push','«Nuova segnalazione da [utente] su [pagina]»','/abo/segnalazioni.html','trigger trg_admin_new_report',true,true,250)
ON CONFLICT (key) DO UPDATE SET event_label=EXCLUDED.event_label, audience=EXCLUDED.audience, channel=EXCLUDED.channel, sample_text=EXCLUDED.sample_text, link=EXCLUDED.link, emitter=EXCLUDED.emitter, is_system=EXCLUDED.is_system, audience_admin=EXCLUDED.audience_admin, sort=EXCLUDED.sort;

CREATE TABLE IF NOT EXISTS public.user_notification_prefs (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key text NOT NULL REFERENCES public.notification_catalog(key) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, key)
);
ALTER TABLE public.user_notification_prefs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS unp_self ON public.user_notification_prefs;
CREATE POLICY unp_self ON public.user_notification_prefs FOR ALL TO authenticated
  USING (user_id = auth.uid() OR is_admin()) WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE OR REPLACE FUNCTION public.set_notification_pref(p_key text, p_enabled boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $f$
DECLARE v_sys boolean;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok',false,'error','not_authenticated'); END IF;
  SELECT is_system INTO v_sys FROM notification_catalog WHERE key=p_key;
  IF v_sys IS NULL THEN RETURN jsonb_build_object('ok',false,'error','unknown_key'); END IF;
  IF v_sys THEN RETURN jsonb_build_object('ok',false,'error','system_notification_mandatory'); END IF;
  INSERT INTO user_notification_prefs(user_id,key,enabled) VALUES (auth.uid(),p_key,p_enabled)
  ON CONFLICT (user_id,key) DO UPDATE SET enabled=EXCLUDED.enabled, updated_at=now();
  RETURN jsonb_build_object('ok',true,'key',p_key,'enabled',p_enabled);
END; $f$;
GRANT EXECUTE ON FUNCTION public.set_notification_pref(text,boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_my_notification_settings()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $f$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'key',c.key,'event_label',c.event_label,'audience',c.audience,'channel',c.channel,
    'sample_text',c.sample_text,'link',c.link,'is_system',c.is_system,
    'enabled_global',c.enabled,'enabled_user',COALESCE(p.enabled,true),'sort',c.sort
  ) ORDER BY c.sort), '[]'::jsonb)
  FROM notification_catalog c
  LEFT JOIN user_notification_prefs p ON p.key=c.key AND p.user_id=auth.uid()
  WHERE (NOT c.audience_admin) OR is_admin();
$f$;
GRANT EXECUTE ON FUNCTION public.get_my_notification_settings() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_catalog_enabled(p_key text, p_enabled boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $f$
DECLARE v_sys boolean;
BEGIN
  IF NOT is_admin() THEN RETURN jsonb_build_object('ok',false,'error','not_admin'); END IF;
  SELECT is_system INTO v_sys FROM notification_catalog WHERE key=p_key;
  IF v_sys IS NULL THEN RETURN jsonb_build_object('ok',false,'error','unknown_key'); END IF;
  IF v_sys THEN RETURN jsonb_build_object('ok',false,'error','system_notification_mandatory'); END IF;
  UPDATE notification_catalog SET enabled=p_enabled WHERE key=p_key;
  RETURN jsonb_build_object('ok',true,'key',p_key,'enabled',p_enabled);
END; $f$;
GRANT EXECUTE ON FUNCTION public.admin_set_catalog_enabled(text,boolean) TO authenticated;

-- Notifiche al TEAM: nuova segnalazione (colonna user_reports.page) + nuova valutazione
CREATE OR REPLACE FUNCTION public.tf_admin_new_report()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $f$
DECLARE v_admins uuid[]; v_who text; v_body text; v_url text; v_key text;
BEGIN
  SELECT array_agg(user_id) INTO v_admins FROM user_roles WHERE role='admin';
  IF v_admins IS NULL THEN RETURN NEW; END IF;
  SELECT COALESCE(email, 'utente anonimo') INTO v_who FROM profiles WHERE id=NEW.user_id;
  v_who := COALESCE(v_who,'utente anonimo');
  v_body := 'Nuova segnalazione da '||v_who||' su '||COALESCE(NEW.page,'?')||': «'||left(NEW.message,120)||'»';
  INSERT INTO notifications(user_id,title,body,type,data)
  SELECT uid, 'Nuova segnalazione', v_body, 'admin_new_report', jsonb_build_object('report_id',NEW.id)
  FROM unnest(v_admins) uid;
  BEGIN
    SELECT decrypted_secret INTO v_url FROM vault.decrypted_secrets WHERE name='supabase_url' LIMIT 1;
    SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name='edge_invoke_key' LIMIT 1;
    IF v_url IS NOT NULL AND v_key IS NOT NULL THEN
      PERFORM net.http_post(url:=v_url||'/functions/v1/send-push',
        headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||v_key),
        body:=jsonb_build_object('type','airdrop_status','user_ids',to_jsonb(v_admins),
              'body_text','Nuova segnalazione — '||v_body,'skip_db',true));
    END IF;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  RETURN NEW;
END; $f$;
DROP TRIGGER IF EXISTS trg_admin_new_report ON public.user_reports;
CREATE TRIGGER trg_admin_new_report AFTER INSERT ON public.user_reports
FOR EACH ROW EXECUTE FUNCTION public.tf_admin_new_report();

CREATE OR REPLACE FUNCTION public.tf_admin_new_valuation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $f$
DECLARE v_admins uuid[]; v_body text; v_url text; v_key text;
BEGIN
  IF TG_OP='UPDATE' AND OLD.status IS NOT DISTINCT FROM NEW.status THEN RETURN NEW; END IF;
  IF NEW.status <> 'in_valutazione' THEN RETURN NEW; END IF;
  SELECT array_agg(user_id) INTO v_admins FROM user_roles WHERE role='admin';
  IF v_admins IS NULL THEN RETURN NEW; END IF;
  v_body := 'Nuova proposta da valutare: «'||COALESCE(NULLIF(NEW.title,''),'senza titolo')||'»'
         || CASE WHEN COALESCE(NEW.code,'')<>'' THEN ' (#'||NEW.code||')' ELSE '' END;
  INSERT INTO notifications(user_id,title,body,type,airdrop_id)
  SELECT uid, 'Nuova richiesta di valutazione', v_body, 'admin_new_valuation', NEW.id
  FROM unnest(v_admins) uid;
  BEGIN
    SELECT decrypted_secret INTO v_url FROM vault.decrypted_secrets WHERE name='supabase_url' LIMIT 1;
    SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name='edge_invoke_key' LIMIT 1;
    IF v_url IS NOT NULL AND v_key IS NOT NULL THEN
      PERFORM net.http_post(url:=v_url||'/functions/v1/send-push',
        headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||v_key),
        body:=jsonb_build_object('type','airdrop_status','airdrop_id',NEW.id,'user_ids',to_jsonb(v_admins),
              'body_text',v_body,'skip_db',true));
    END IF;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  RETURN NEW;
END; $f$;
DROP TRIGGER IF EXISTS trg_admin_new_valuation ON public.airdrops;
CREATE TRIGGER trg_admin_new_valuation AFTER INSERT OR UPDATE OF status ON public.airdrops
FOR EACH ROW EXECUTE FUNCTION public.tf_admin_new_valuation();
