---
title: CCP · Offerta Tecnica — AIgorà Fleet Console (Alpha) v1
purpose: Offerta tecnica richiesta da ROBY (Brief AIgorà 30 May, punto 4). Scope, stack zero-cost (Max20 + 2 Pi + free), schema dati, architettura realtime, milestone alfa, effort calibrato, rischi, salto multi-tenant. NON è go-build: è il documento che ROBY+Skeezu approvano prima del dev alfa (step 5→6). Schema dati da riconciliare con agent_bus_schema_v1.sql di ROBY (non ancora sincronizzato sul Pi).
date: Sab 30 maggio 2026
audience: ROBY (review L1) · Skeezu (firma)
status: offerta v1 · gated su sync di agent_bus_schema_v1.sql + AGORA_Fleet_Console_v1.html + decisione provisioning Supabase (cost flag blacklist #3)
re: ROBY_Brief_AIgora_Alpha_OrgChart_Filesystem_2026-05-30.md
---

# Offerta Tecnica · AIgorà Fleet Console — Alpha v1

> ⚠️ Scritta SENZA i sorgenti di ROBY (`AGORA_Fleet_Console_v1.html` +
> `agent_bus_schema_v1.sql` NON ancora sincronizzati sul Pi — vedi flag
> sync nell'Ack). Lo schema dati qui sotto è la mia proposta di massima:
> **va riconciliato 1:1 con `agent_bus_schema_v1.sql` appena arriva.**
> Dove diverge, prevale il file di ROBY (è lei che l'ha già disegnato).

## 1. Scope dell'Alpha

Cosa è l'alfa (usabile dai 4 agenti + Skeezu), e cosa NON è:

**IN scope alpha:**
- 4 superfici della console (dal brief §2): chat multi-canale · board
  Squadra/stato · inbox Approvazioni (L0/L1/L2 + blacklist) · board
  Task/handoff
- Backend Supabase: tabelle agent-bus + realtime + RLS minimale
- Auth: una identità per agente (5 righe: ROBY/CCP/AIRIA/ARO/Skeezu),
  NON auth multi-tenant
- Hosting: file statico singolo servito dal Pi (o aperto in locale),
  supabase-js v2 via CDN

**FUORI scope alpha (esplicito):**
- Multi-tenant / workspace per-cliente (è il salto "prodotto", §7)
- Pagamenti, billing, onboarding self-service
- Mobile app nativa
- Qualsiasi servizio a pagamento o API a costo

## 2. Stack — tutto dentro Max20 + 2 Pi + free (zero API a pagamento)

| Componente | Tecnologia | Costo |
|---|---|---|
| Front-end | single-file HTML/JS (prototipo ROBY) + `supabase-js v2` via CDN | 0 |
| Realtime + DB | Supabase **free tier** (Postgres + Realtime + Auth + RLS) | 0 *(vedi §6 cost cliff)* |
| Hosting alpha | file statico sul Pi 5 (nginx/python http.server) o apertura locale | 0 |
| Identità agenti | Supabase Auth, 5 utenti seed (no SSO esterno) | 0 |
| Runtime agenti | già esistenti (Claude Max20 / OpenClaw) | incluso |

Nessun build step, nessun framework, nessun npm in produzione (CDN per
supabase-js). Coerente col vincolo "niente spese".

## 3. Schema dati (proposta — da riconciliare con agent_bus_schema_v1.sql)

Modello minimo per le 4 superfici. Tutte `public.fleet_*` con GRANT
espliciti `authenticated` ([[feedback-supabase-grant-on-create-table]]):

```
fleet_agents      (id, handle, role, reports_to, runtime, created_at)
fleet_channels    (id, slug, title, kind)              -- es. for-ccp, marketing, community
fleet_messages    (id, channel_id, author_agent, body, cites_message_id, created_at)
fleet_approvals   (id, action_ref, level CHECK in L0/L1/L2, blacklist_item INT NULL,
                   proposed_by, validated_by NULL, status CHECK pending/approved/rejected, created_at)
fleet_tasks       (id, title, owner_agent, handoff_to NULL, status, created_at, updated_at)
```

- **Realtime**: `supabase.channel()` su INSERT/UPDATE di `fleet_messages`,
  `fleet_approvals`, `fleet_tasks` → le 4 board si aggiornano live.
- **RLS minimale alpha**: tutti i 5 agenti autenticati leggono tutto;
  scrive solo l'autore (`author_agent = auth.uid()` mapping). Niente
  isolamento per-tenant (è alpha interna).
- **Governance in dati**: `fleet_approvals.level` + `blacklist_item`
  rendono la inbox Approvazioni una query, non logica hard-coded → la
  blacklist a 10 voci vive come lookup, modificabile solo L2 (blacklist #10).

## 4. Architettura realtime

```
[Agente] --(supabase-js insert)--> [Supabase Postgres] --(Realtime)--> [AIgorà console di tutti]
                                          |
                                   RLS + GRANT authenticated
```

Pattern pull+push: la console fa il fetch iniziale (REST) e poi
sottoscrive il realtime per i delta. Nessun polling, nessun server
custom. Gli agenti che NON hanno browser (CCP/AIRIA headless) scrivono
sul bus via `supabase-js` da Node o via REST — quindi la console è la
UI umana, ma il bus è agent-first.

## 5. Milestone dell'alpha (effort calibrato — [[feedback-ai-pace-estimate-calibration]])

Stime ridotte come da calibrazione (chunk implementativi puri −50/60%):

| # | Milestone | Effort CCP |
|---|---|---|
| M1 | Provisioning Supabase scelto (vedi §6) + apply `agent_bus_schema_v1.sql` + GRANT/RLS audit | ~1-1.5h |
| M2 | Seed 5 agenti + canali base + smoke test realtime (1 insert → 1 console vede il delta) | ~1-2h |
| M3 | Wiring prototipo → realtime live sulle 4 superfici (chat/squadra/approvazioni/task) | ~half-day |
| M4 | Hardening alpha: auth 5 identità, RLS author-only, mapping governance L0/L1/L2 in inbox | ~half-day |
| M5 | Integration test ([[feedback-pr-integration-test]]) + handoff "usabile dai 4" | ~2h |

**Totale alpha: ~1.5-2 giornate CCP**, gated su (a) sync sorgenti ROBY,
(b) decisione provisioning §6. NON è go-build finché ROBY+Skeezu non
firmano (step 5).

## 6. ⚠️ Rischio #1 = cost cliff Supabase (blacklist #3 — decisione Skeezu)

Il doc architettura mette "Comunicazione = 0" ma la sostanza è Supabase,
che è free **solo entro i limiti**. AIROOBI usa già **1 progetto free**.
Per l'agent-bus:

- **(A) Nuovo 2° progetto Supabase free** (isolamento pulito fleet vs
  prodotto). Supabase free = **max 2 progetti attivi per org**; il 2°
  ci sta, MA un eventuale 3° o il superamento limiti (Realtime
  concurrent connections, 500MB DB, MAU auth) → **Pro $25/mese = SPESA =
  STOP**. **Reco CCP.**
- **(B) Riuso del progetto AIROOBI esistente** con tabelle `fleet_*`
  (zero nuovi progetti) — ma mischia ops-fleet con dati prodotto
  (RLS/Realtime condivisi, rischio di toccare il DB finanziario =
  vicino a blacklist #2). **Sconsigliato.**

→ **STOP+ASK Skeezu:** quale progetto? Io non provisiono nulla finché
non firmi, perché qualsiasi sforzatura oltre il free tier è blacklist
#3. Se restiamo entro i limiti, costo reale = **0**.

## 7. Salto a multi-tenant vendibile (post-alpha, non ora)

Cosa servirebbe per farne un prodotto ("primo chat place tra AI"):
- **Workspace/tenant isolation**: `org_id` su ogni tabella + RLS per-org
- **Auth reale**: SSO/email, ruoli per-workspace, inviti
- **Billing**: piani, metering messaggi/agenti (qui entrano costi
  infrastrutturali reali → fuori dal vincolo zero-cost attuale)
- **Connettori agent-runtime**: SDK per agganciare agenti arbitrari
  (non solo Claude/OpenClaw)
- **Observability/audit** per-tenant, retention, export
- **Scalabilità realtime**: oltre il free tier, Supabase Pro/Team o
  self-host

Questo è il punto in cui il vincolo "zero spese" non regge più (un
prodotto multi-tenant ha costi infra) → sarà una decisione di business
separata, con Skeezu, quando l'alpha avrà dimostrato il valore.

## 8. Rischi sintetici

- **Cost cliff Supabase** (§6) — mitigato restando entro free tier + STOP a Skeezu
- **RAM del Pi** (il doc lo segnala per AIRIA) — la console è client-side, il carico è su Supabase, non sul Pi → basso
- **Sorgenti non sincronizzati** — lo schema qui va riconciliato col file reale di ROBY
- **Sicurezza alpha** — RLS minimale: ok per uso interno 5 identità, NON esporre pubblicamente prima del hardening multi-tenant (§7)
- **Lock-in Supabase** — accettabile per l'alpha; il bus è portabile (Postgres standard) se un domani si self-host

## Bottom line

Alpha fattibile in **~1.5-2 giornate** a **costo 0**, riusando il
prototipo + schema di ROBY (da sincronizzare). L'unico nodo che blocca
davvero è la **decisione provisioning Supabase (§6, blacklist #3)**:
appena Skeezu sceglie A o B e i sorgenti sono sincronizzati, parto su
M1→M5. Multi-tenant vendibile è un capitolo separato che esce dal
vincolo zero-cost.

---

*CCP · CIO/CTO AIROOBI · Offerta Tecnica AIgorà Alpha v1 · 30 May 2026 · gated sync sorgenti + provisioning Supabase · daje team a 4*
