---
title: CCP · AIgorà follow-up — fix "falso Connesso" + redeploy console + sorgente unica
purpose: Follow-up alla sessione M1. Sciolto bug badge "Connesso·realtime" fasullo (root cause client, non DB), patch "badge onesto" deployata in prod, console resa sorgente-unica, ROBY role aggiornato. Tutto verificato LIVE.
date: Sab 30 maggio 2026 (follow-up sera)
audience: ROBY · Skeezu · ARO/AIRIA (visibility)
status: SHIPPED + verificato LIVE su aigora-console.vercel.app · GO deploy = Skeezu diretto via chat
re: CCP_Build_AIgora_Alpha_M1_BusLive_ConsoleOnline_2026-05-30 (segue)
---

# CCP · AIgorà follow-up — console badge-fix + redeploy

Skeezu ha aperto la console online e ha visto un **bug**: badge verde "Connesso · realtime" MA in chat i messaggi DEMO, mentre `agora.messages` a DB aveva 2 righe reali (mie 11:33 + ROBY 15:23) che non comparivano.

## 🔎 Diagnosi (root cause: CLIENT, non DB)

**Lato DB / Data API = tutto corretto** (verificato, non assunto):
- REST replica esatta FE (`Accept-Profile: agora` + anon key) → **HTTP 200 + le 2 righe**.
- Schema `agora` esposto in `pgrst.db_schemas` (`public, graphql_public, agora`) · `USAGE` anon ✓ · grant anon `SELECT` su tutte le tabelle ✓ · RLS `agora_all_*` `using(true)` ✓ · publication `supabase_realtime` include `agora.messages` ✓.

**Il bug era nel codice console** (`connectSupabase`):
```js
if(ms.data) state.messages = ms.data.map(...)   // sostituisce solo se data c'è
...
state.connected = true;                          // ← settato SEMPRE, ignora ms.error
```
`state.connected=true` era **fuori** dalle guardie `if(x.data)`. Le query supabase-js non lanciano: ritornano `{data:null, error}`. Quindi a fetch fallita i seed demo restavano MA il flag verde scattava lo stesso → "Connesso" che mente sui dati demo.

## 🛠️ Patch "badge onesto" (build 2026-05-30b) — SHIPPED
- `connected` ora gated su `!ms.error` (la SELECT su `messages` è la prova-bus).
- Su errore: resta **"Demo mode"** con il messaggio d'errore visibile (hint + alert) invece del verde fasullo.
- Su successo: i seed sono sostituiti dal bus **anche se vuoto**.
- JS syntax-OK (`node --check`).

## 📦 Sorgente unica + redeploy
- Rename `AIgora_Fleet_Console_v1.html` → **`index.html`** + `.vercelignore` (esclude `*.sql`/`*.md`/`.vercel`). → `CLA-CCP BRIDGE/CCP-Stuff/fleet-console/` è la **sorgente unica** deployabile della console.
- Redeploy prod via Vercel CLI: `vercel link --project aigora-console` + `vercel deploy --prod` (scope `tommypecorellas-projects`, progetto `prj_hQSXm1ORhwOu8ZQ4I51UhuFiSOWy`).
- **Verificato LIVE** su https://aigora-console.vercel.app: marker patch presenti (`build 2026-05-30b`, gate `ms.error`, `lastError`×5), SQL DDL non esposta (404).

## 👤 Org-chart
- **ROBY role** → `GM & Strategy · MKT · Comms` (DB `agora.agents` + seed demo console). NB: la console non sottoscrive il realtime su `agents` → il nuovo ruolo appare al reload/riconnessione.

## RS — paste-ready
```
CCP FOLLOW-UP AIgorà — fix "falso Connesso" + redeploy (verificato LIVE)

BUG (Skeezu): badge "Connesso·realtime" coi messaggi DEMO mentre agora.messages
aveva 2 righe reali. Root cause = CLIENT: state.connected=true settato sempre,
ignorando ms.error → fetch fallita lasciava i seed ma accendeva il verde.
DB/Data API tutto ok (REST con Accept-Profile:agora + anon → 200 + 2 righe;
schema esposto; grant anon SELECT; RLS using(true); realtime publication ok).

PATCH "badge onesto" (build 2026-05-30b) SHIPPED: connected = !ms.error; su errore
resta "Demo mode" con errore visibile; su successo i seed cedono al bus.

DEPLOY: rename → index.html + .vercelignore (no sql/md). fleet-console/ = sorgente
unica. Redeploy prod su aigora-console via Vercel CLI. Verificato LIVE: marker patch
presenti, SQL non esposta (404). GO deploy = Skeezu diretto via chat (flag audit:
non via ROBY RS).

ORG: ROBY role → "GM & Strategy · MKT · Comms" (DB + seed). Appare al reload console.

PENDING invariati: M2 composer task FE · M4-M5 wiring runtime ROBY/ARO al bus.
```

## Bottom line
Bug chiuso alla radice (badge non mentirà più: errore visibile invece del verde finto). Console resa sorgente-unica e ridepleyata, ROBY rititolato GM. Tutto verificato sul live, niente segreti toccati. Restano M2 (task FE) e M4-M5 (wiring ROBY/ARO).

---

*CCP · CIO/CTO AIROOBI · AIgorà follow-up · 30 May 2026 · badge onesto + redeploy · daje team a 5*
