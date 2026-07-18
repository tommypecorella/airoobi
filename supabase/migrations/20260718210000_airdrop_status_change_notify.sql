-- SPECCHIO (applicata al live 18 lug 2026 via MCP, in due passi:
-- 'airdrop_status_change_notify' + 'edge_invoke_key_vault_fix_push_triggers').
-- Questo file riflette lo stato FINALE.
--
-- Richiesta Skeezu: a OGNI cambio di stato dell'airdrop deve arrivare una notifica
-- al venditore e a tutti gli utenti con almeno 1 Step in quell'airdrop.
--
-- Design:
--  * trg_airdrop_status_notify (AFTER UPDATE OF status, WHEN cambiato):
--    - campanella (tabella notifications) scritta DENTRO la transazione → garantita;
--    - testi a canone per stato, varianti venditore/partecipante;
--    - partecipanti = airdrop_participations con cancelled_at IS NULL, escluso il venditore;
--    - push web via send-push v5 (tipo 'airdrop_status', user_ids espliciti, skip_db=true
--      perché le righe in-app le ha già scritte il trigger) — best-effort in blocco EXCEPTION.
--  * FIX STORICO: il vault non ha mai contenuto 'service_role_key' → il vecchio trigger
--    notify_airdrop_published (push pubblicazione/esito corsa) usciva in silenzio DA APRILE.
--    La edge function richiede solo un JWT valido (verify_jwt): registrata nel vault la
--    anon key PUBBLICA (la stessa di dapp.js) come 'edge_invoke_key' e aggiornati entrambi
--    i trigger a leggerla.

DO $mig$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name='edge_invoke_key') THEN
    PERFORM vault.create_secret(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dmxtbHB1aG92aXBmd3RxdXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjM0MjEsImV4cCI6MjA4ODIzOTQyMX0.5iEqns2F7N6h1VVxLJjqu3Rm4doOVDs5hpD8sNaL6co',
      'edge_invoke_key',
      'Anon key (pubblica, la stessa di dapp.js) per invocare le edge functions dai trigger DB'
    );
  END IF;
END $mig$;

CREATE OR REPLACE FUNCTION public.tf_airdrop_status_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_seller uuid := COALESCE(NEW.submitted_by, NEW.created_by);
  v_ref text;
  s_title text; s_body text;   -- variante venditore
  p_title text; p_body text;   -- variante partecipante (NULL = stato solo-venditore)
  v_part_ids uuid[];
  v_url text; v_key text;
BEGIN
  v_ref := '«' || COALESCE(NULLIF(NEW.title,''), 'il tuo oggetto') || '»'
        || CASE WHEN COALESCE(NEW.code,'') <> '' THEN ' (#'||NEW.code||')' ELSE '' END;

  CASE NEW.status
    WHEN 'in_valutazione' THEN
      s_title := 'Proposta in valutazione';
      s_body  := 'La tua proposta '||v_ref||' è ora in valutazione. Ti aggiorniamo a ogni passo.';
    WHEN 'valutazione_completata' THEN
      s_title := 'Valutazione completata';
      s_body  := 'La valutazione di '||v_ref||' è completata: entra e guarda l''esito.';
    WHEN 'rifiutato_min500' THEN
      s_title := 'Valutazione conclusa';
      s_body  := 'La valutazione di '||v_ref||' si è chiusa: il valore stimato è sotto la soglia minima per un airdrop.';
    WHEN 'rifiutato_generico' THEN
      s_title := 'Valutazione conclusa';
      s_body  := 'La valutazione di '||v_ref||' si è chiusa senza idoneità. Trovi i dettagli nella tua area.';
    WHEN 'accettato' THEN
      s_title := 'Valutazione accettata';
      s_body  := 'Valutazione di '||v_ref||' accettata: l''airdrop si prepara al via.';
    WHEN 'presale' THEN
      s_title := 'Airdrop in anteprima';
      s_body  := 'Il tuo airdrop '||v_ref||' è in anteprima: la corsa sta per aprirsi.';
      p_title := 'Corsa in anteprima';
      p_body  := 'L''airdrop '||v_ref||' è in anteprima: la corsa sta per aprirsi a tutti.';
    WHEN 'sale','active' THEN
      s_title := 'La corsa è aperta';
      s_body  := 'Il tuo airdrop '||v_ref||' è aperto a tutti: la corsa è in cammino.';
      p_title := 'La corsa è aperta';
      p_body  := 'La corsa per '||v_ref||' è aperta: fai i tuoi Step e punta alla vetta.';
    WHEN 'closed' THEN
      s_title := 'Raccolta completata';
      s_body  := 'La raccolta per '||v_ref||' è completa: la corsa è chiusa.';
      p_title := 'Corsa chiusa';
      p_body  := 'La corsa per '||v_ref||' è chiusa: si decide chi è arrivato in vetta. Ti aggiorniamo qui.';
    WHEN 'waiting_seller_acknowledge','pending_seller_decision' THEN
      s_title := 'Serve la tua decisione';
      s_body  := 'La corsa per '||v_ref||' è arrivata in fondo: entra e conferma la tua decisione entro la scadenza.';
      p_title := 'Corsa in dirittura d''arrivo';
      p_body  := 'La corsa per '||v_ref||' è conclusa: attendiamo la conferma del venditore. Ti avvisiamo all''esito.';
    WHEN 'completed' THEN
      s_title := 'Airdrop concluso';
      s_body  := 'Il tuo airdrop '||v_ref||' si è concluso. Grazie per averlo airdroppato su AIROOBI.';
      p_title := 'Airdrop concluso';
      p_body  := 'L''airdrop '||v_ref||' è arrivato in fondo: guarda l''esito e i tuoi ROBI nel portafoglio.';
    WHEN 'annullato' THEN
      s_title := 'Airdrop annullato';
      s_body  := 'Il tuo airdrop '||v_ref||' è stato annullato. Trovi i dettagli nella tua area.';
      p_title := 'Airdrop annullato';
      p_body  := 'L''airdrop '||v_ref||' è stato annullato: trovi i dettagli nel tuo conto.';
    ELSE
      s_title := 'Novità sul tuo airdrop';
      s_body  := 'C''è un aggiornamento su '||v_ref||': entra per i dettagli.';
      p_title := 'Novità sulla corsa';
      p_body  := 'C''è un aggiornamento sull''airdrop '||v_ref||': entra per i dettagli.';
  END CASE;

  -- campanella venditore (transazionale, garantita)
  IF v_seller IS NOT NULL THEN
    INSERT INTO notifications(user_id, title, body, type, airdrop_id, data)
    VALUES (v_seller, s_title, s_body, 'airdrop_status', NEW.id,
            jsonb_build_object('from', OLD.status, 'to', NEW.status, 'audience', 'seller'));
  END IF;

  -- campanella partecipanti: chiunque abbia >=1 Step attivo (partecipazione non annullata)
  IF p_title IS NOT NULL THEN
    SELECT array_agg(DISTINCT user_id) INTO v_part_ids
    FROM airdrop_participations
    WHERE airdrop_id = NEW.id
      AND cancelled_at IS NULL
      AND user_id IS NOT NULL
      AND user_id IS DISTINCT FROM v_seller;

    IF v_part_ids IS NOT NULL THEN
      INSERT INTO notifications(user_id, title, body, type, airdrop_id, data)
      SELECT uid, p_title, p_body, 'airdrop_status', NEW.id,
             jsonb_build_object('from', OLD.status, 'to', NEW.status, 'audience', 'participant')
      FROM unnest(v_part_ids) AS uid;
    END IF;
  END IF;

  -- push best-effort: mai bloccare il cambio di stato se il push fallisce
  BEGIN
    SELECT decrypted_secret INTO v_url FROM vault.decrypted_secrets WHERE name = 'supabase_url' LIMIT 1;
    SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name = 'edge_invoke_key' LIMIT 1;
    IF v_url IS NOT NULL AND v_key IS NOT NULL THEN
      IF v_seller IS NOT NULL THEN
        PERFORM net.http_post(
          url := v_url || '/functions/v1/send-push',
          headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||v_key),
          body := jsonb_build_object('type','airdrop_status','airdrop_id',NEW.id,
                    'user_ids', jsonb_build_array(v_seller),
                    'body_text', s_title||' — '||s_body, 'skip_db', true));
      END IF;
      IF v_part_ids IS NOT NULL THEN
        PERFORM net.http_post(
          url := v_url || '/functions/v1/send-push',
          headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||v_key),
          body := jsonb_build_object('type','airdrop_status','airdrop_id',NEW.id,
                    'user_ids', to_jsonb(v_part_ids),
                    'body_text', p_title||' — '||p_body, 'skip_db', true));
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_airdrop_status_notify ON public.airdrops;
CREATE TRIGGER trg_airdrop_status_notify
AFTER UPDATE OF status ON public.airdrops
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.tf_airdrop_status_notify();

-- notify_airdrop_published: identica alla versione precedente, ma legge 'edge_invoke_key'
-- (prima leggeva 'service_role_key' che non è mai esistito nel vault → push mai partiti)
CREATE OR REPLACE FUNCTION public.notify_airdrop_published()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_url TEXT;
  v_key TEXT;
BEGIN
  SELECT decrypted_secret INTO v_url FROM vault.decrypted_secrets WHERE name = 'supabase_url' LIMIT 1;
  SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name = 'edge_invoke_key' LIMIT 1;

  IF v_url IS NULL OR v_key IS NULL THEN
    RETURN NEW;
  END IF;

  IF (OLD.status NOT IN ('presale', 'sale') AND NEW.status IN ('presale', 'sale')) THEN
    PERFORM net.http_post(
      url := v_url || '/functions/v1/send-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_key
      ),
      body := jsonb_build_object(
        'type', 'new_airdrop',
        'airdrop_id', NEW.id,
        'title', NEW.title,
        'category', NEW.category
      )
    );
  END IF;

  IF (OLD.draw_executed_at IS NULL AND NEW.draw_executed_at IS NOT NULL) THEN
    IF NEW.winner_id IS NOT NULL THEN
      PERFORM net.http_post(
        url := v_url || '/functions/v1/send-push',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_key
        ),
        body := jsonb_build_object(
          'type', 'draw_winner',
          'airdrop_id', NEW.id,
          'user_id', NEW.winner_id,
          'title', NEW.title
        )
      );
    END IF;
    PERFORM net.http_post(
      url := v_url || '/functions/v1/send-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_key
      ),
      body := jsonb_build_object(
        'type', 'draw_robi',
        'airdrop_id', NEW.id,
        'title', NEW.title
      )
    );
  END IF;

  RETURN NEW;
END;
$function$;
