---
title: CCP · AIgorà Alpha — M1 bus live + console online (build-log sessione interattiva Skeezu)
purpose: Build-log della sessione interattiva con Skeezu (30 May 2026). Eseguito il provisioning gated: 2° progetto Supabase FREE creato, schema dedicato agora.* applicato/esposto/verificato end-to-end, console rinominata AIgorà wired sullo schema agora e DEPLOYATA online su Vercel (progetto separato, isolato dal prodotto) per accesso fuori-LAN di Skeezu. Nessun segreto committato. Restano M2 (task-create FE) e M4-M5 (wiring runtime agenti ROBY/ARO).
date: Sab 30 maggio 2026
audience: ROBY · Skeezu · ARO/AIRIA (visibility)
status: M1 DONE (bus live + esposto + verificato) · console online DONE (aigora-console.vercel.app) · accesso fuori-LAN Skeezu DONE · pending UI-click Skeezu · M2 task-FE + M4-M5 agent-wiring next
re: ROBY_Addendum_AIgora_FEwrite_ParallelProduct + GO provisioning + direttiva Skeezu accesso online
---

# CCP · AIgorà Alpha — M1 bus live + console online

Skeezu al terminale → sciolti i gate. Build eseguito. Stato sotto.

## ✅ Fatto in questa sessione

**1. Infra (blacklist #3 — free-tier confermato a $0/mese prima di creare):**
- Creato **2° progetto Supabase FREE** `airoobi-agora` (org Airoobi, eu-west-1, isolato dal DB AIROOBI). Costo verificato $0 prima della creazione.
- Applicato schema dedicato **`agora.*`** (decisione naming: opzione B — schema namespaced, per portabilità/self-host come da Addendum "prototipo prodotto parallelo"). Tabelle `agents/channels/messages/approvals/tasks` + indici + realtime publication + grant + RLS + seed (5 agenti, 4 canali).
- Esposto lo schema `agora` alla Data API (`pgrst.db_schemas` + reload).
- **Verificato end-to-end con la anon key** (non solo SQL): READ 200, INSERT message 201, INSERT task 201, READ-back 200. Il path `tasks` scrive a livello API ✓.

**2. Console (rinominata AIgorà, come da brief):**
- Copia CCP-owned in `CCP-Stuff/fleet-console/AIgora_Fleet_Console_v1.html`, wired:
  - `createClient(...,{db:{schema:'agora'}})` → tutte le `.from()` su agora.*
  - realtime `postgres_changes` portato da `schema:'public'` → `schema:'agora'` su messages/approvals
  - **aggiunta** la subscription mancante su `tasks` (+ `refreshTasks`) — prima non c'era
  - JS syntax-check OK
- **Deployata ONLINE** su Vercel, **progetto separato** `aigora-console` (NON tocca airoobi.com/.app): **https://aigora-console.vercel.app** — sempre-on, HTTPS, pubblica (200, nessun auth-wall), apribile da qualsiasi device fuori-LAN. → soddisfa la direttiva Skeezu "accesso online, non solo locale".

**3. Sicurezza (mia flag, gestita):**
- **Zero segreti committati / deployati.** Repo pubblico + RLS `using(true)` → la anon key è un **bearer secret**: chi ce l'ha legge/scrive il bus. Perciò la key NON è nel file: Skeezu la incolla una volta via ⚙ (resta in localStorage del device). Endpoint progetto noto, ma il **gate è la key**.
- "io e solo io fuori-LAN" = solo chi ha la key (Skeezu + i 3 agenti). Hardening vero (auth reale Supabase, author-only, per-identità) = estensione multi-tenant **documentata, non costruita** (zero-budget, decisione futura).

## ⏳ Pending / next

- **UI-click Skeezu**: apri https://aigora-console.vercel.app → ⚙ → incolla URL+key (te le passo io diretto) → connesso. Verifica realtime con un messaggio in #dev. (cadenza 1-item→shipped→UI-click→firma)
- **M2 — FE-write task** (direttiva Addendum #1): la console scrive già messaggi + approva/rifiuta + identità, MA il composer "crea/aggiorna task" non c'è ancora (tab tasks era solo render; ho già aggiunto la subscription, manca la UI di scrittura). Lo chiudo in un giro dedicato con UI-click.
- **M4-M5 — wiring runtime agenti**: perché Skeezu interagisca con **ROBY e ARO** dal bus, i loro runtime (Claude Cowork / Claude Code Windows) devono leggere/scrivere `agora.*` via REST. CCP (Pi) può già farlo. ROBY/ARO = prossimo step (poll+post). Lo coordino con voi.

## RS — paste-ready
```
CCP BUILD AIgorà — M1 LIVE + console ONLINE (sessione interattiva)

INFRA: 2° progetto Supabase FREE airoobi-agora creato ($0 verificato), schema
agora.* applicato+esposto+verificato (READ/INSERT msg/INSERT task/READ tutti OK).
Naming: opzione B schema dedicato (portabilità Addendum).

CONSOLE: AIgorà wired su agora (createClient db.schema + realtime public→agora +
subscription tasks aggiunta). DEPLOYATA online su Vercel progetto SEPARATO:
https://aigora-console.vercel.app (sempre-on, HTTPS, no auth-wall, fuori-LAN ok).
→ soddisfa "accesso online per Skeezu".

SICUREZZA: zero segreti in repo/deploy. RLS using(true)+repo pubblico → anon key =
bearer secret, NON committata, Skeezu la incolla via ⚙. Hardening (auth reale) =
estensione futura documentata, non ora.

PENDING: UI-click Skeezu (connetti+test realtime) · M2 composer task FE (manca la
UI di scrittura task) · M4-M5 wiring runtime ROBY/ARO al bus (poll+post REST).
```

## Bottom line
M1 (bus) e console-online (accesso fuori-LAN di Skeezu) sono **live e verificati end-to-end**. Scelta naming = schema dedicato `agora.*` (portabilità). Sicurezza tenuta: nessun segreto in un repo pubblico, la anon key resta privata di Skeezu (bearer). Mancano: il composer task lato FE (M2) e il wiring dei runtime di ROBY/ARO al bus (M4-M5) perché la chat AI↔AI↔umano sia piena. Te le porto come item separati con UI-click. Daje, AIgorà respira. Team a 5.

Audit-trail: build-log sessione interattiva Skeezu 30 May 2026 · gate sciolti (blacklist #3 free-tier verificato $0 pre-creazione · provisioning eseguito senza brief mancante, parametri org/region/nome confermati live) · progetto Supabase free airoobi-agora eu-west-1 · schema naming = opzione B agora.* (scelta Skeezu via AskUserQuestion, ribalta "as-is" per obiettivo portabilità Addendum) · schema applicato (apply_migration) + esposto (pgrst.db_schemas role GUC + reload config/schema) + verificato end-to-end con anon key (REST 200/201) · console AIgorà wired (db.schema agora + realtime agora + tasks subscription) syntax-OK · deploy Vercel progetto separato aigora-console (scope tommypecorellas-projects) → alias aigora-console.vercel.app READY 200 no-auth-wall · ZERO anon key/publishable committati o deployati (verificato con grep guard pre-commit e su pagina live) · direttiva accesso-online Skeezu = opzione Vercel progetto separato (scelta via AskUserQuestion) soddisfatta · pending: UI-click Skeezu, M2 task-FE composer, M4-M5 wiring runtime ROBY/ARO REST · decisione GO + accesso-online arrivate via chat diretta Skeezu→CCP (flag audit: non via ROBY RS).

---

*CCP · CIO/CTO AIROOBI · AIgorà Alpha M1 build-log · 30 May 2026 · bus live + console online · daje team a 5*
