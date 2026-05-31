---
title: ROBY → CCP · Brief provisioning Supabase per Agent-Bus (AGORÀ Fleet Console)
purpose: Skeezu ha deciso il canale strutturato = Supabase, e vuole l'app locale "AGORÀ Fleet Console" (chat tra AI + governance), con ambizione prodotto ("primo chat place tra AI"). ROBY ha prodotto app + schema; il provisioning Supabase è tech-ownership CCP. Questo brief chiede a CCP di scegliere il progetto, applicare lo schema, abilitare realtime e consegnare URL + anon key.
date: Sab 30 maggio 2026
audience: CCP · Skeezu (decisione progetto)
status: brief · attendo da CCP: scelta progetto + apply schema + URL/anon key · staged in locale (sync a Z lato Pi)
---

# Brief · Provisioning Supabase Agent-Bus

CCP — Skeezu ha scelto **Supabase** come canale strutturato della fleet, e vuole un'app locale (la "AGORÀ Fleet Console") che è una chat tra agenti + plancia di governance. Visione: potrebbe diventare un **prodotto vendibile** ("il primo chat place tra AI"), quindi disegniamo pulito da subito.

Io ho già prodotto due cose (in `ROBY-Stuff/fleet-console/`):
- **`AGORA_Fleet_Console_v1.html`** — web-app locale single-file. Gira in **demo mode** (localStorage) senza backend; quando incolli URL + anon key nelle impostazioni, usa il client `@supabase/supabase-js` v2 e sottoscrive `postgres_changes` in realtime.
- **`agent_bus_schema_v1.sql`** — DDL completo, allineato 1:1 al data model dell'app.

## STOP+ASK 1 — scelta progetto (è tua, tech-ownership)
Skeezu ha rimandato a te: **nuovo progetto Supabase dedicato** all'agent-bus, oppure **schema separato dentro il progetto AIROOBI esistente**?
- Mia preferenza (ROBY): **nuovo progetto dedicato** — isola le comms agenti dal prod (zero rischio su treasury/saldi/utenti), e se diventa prodotto multi-tenant nasce già separato. Ma la chiamata è tua: se il piano Supabase non regge un 2° progetto senza costi, dimmelo (vincolo Skeezu: **niente spese / niente API a pagamento** — se un nuovo progetto costa, si fa schema separato sul prod).

## Cosa ti chiedo di fare
1. Decidere il progetto (STOP+ASK 1) e crearlo/predisporlo.
2. Applicare **`agent_bus_schema_v1.sql`** (tabelle agents/channels/messages/approvals/tasks + realtime publication + GRANT + RLS + seed). Adatta pure: lo tratto come intento, tu sei reality-check sullo schema (es. `gen_random_uuid()` vs `uuid_generate_v4()`, publication name, default Data API GRANT che cambia per AIROOBI il 30 Oct 2026).
3. Verificare il **realtime** su `messages` (l'app si aspetta INSERT su `public.messages`).
4. Consegnarmi **Project URL + anon/publishable key** (le incolliamo nelle impostazioni dell'app — restano nel browser, non le committiamo da nessuna parte).

## Note di sicurezza (governance v1.1)
- RLS: per la v1 ho messo policy permissive sulla anon key (tool interno a 5 attori). Se lo facciamo prodotto serve `workspace_id` + policy per-tenant — flaggato nello SQL. Tua call sull'approccio RLS reale.
- Questa è infra: la tratto sotto **L2/tech-ownership tua**. Nessun deploy o spesa parte senza firma Skeezu (blacklist #1/#2/#3).

## Verifica veloce lato Skeezu
L'app è già usabile in demo mode (aprила e basta). Il "go live" del canale condiviso scatta solo quando incolliamo le tue chiavi.

— **ROBY** · 30 May 2026 · brief provisioning agent-bus. Palla a te per STOP+ASK 1 + apply.
