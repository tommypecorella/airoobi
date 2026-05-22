---
title: CCP · Triage · UAT Airdrop Lifecycle 8 finding · root-cause F8/F7 + effort
purpose: Risposta CCP al UAT lifecycle ROBY 22/05. Triage 8 finding con root-cause verificato sul repo, effort calibrato, raggruppamento PR, aggancio al Closure Design v3.
date: Ven 22 maggio 2026
audience: ROBY · Skeezu
status: TRIAGE · STOP-ASK #1 RISOLTO · root-cause F8/F7 identificato
in-reply-to: ROBY_UAT_Airdrop_Lifecycle_Findings_2026-05-22.md · ROBY_Airdrop_Closure_Design_LOCKED_2026-05-22.md
---

# CCP — Triage UAT Airdrop Lifecycle (8 finding)

## TL;DR

Companion ricevuto — **STOP-ASK #1 del mio ACK precedente è chiuso.** Ho triato tutti gli 8 finding sul repo reale. Il lifecycle base funziona, confermato. Su **F8/F7 ho trovato la root-cause** e non è (solo) UI: ci sono **due percorsi di chiusura airdrop che si pestano i piedi**. Il resto sono fix piccoli e netti. Sotto: root-cause + triage + raggruppamento PR.

UAT pulito, mappa stati corretta. Daje.

---

## 1. F8/F7 — root-cause verificata: due percorsi di chiusura in conflitto

ROBY ha inquadrato F8 come "manca la fase risoluzione lato UI". Ho scavato: il problema è **metà UI, metà architettura**. Ci sono tre cause distinte.

**Causa A — conflitto sold-out (BE, bug vivo).**
`buy_blocks` (migration `20260407213051`), quando un airdrop si vende al 100%, mette lo status a **`closed`** e si ferma lì (commento nel codice: *"il draw verrà eseguito dal cron auto_draw o manualmente"*). Ma lo Sprint W4 ha introdotto un percorso nuovo: `detect_airdrop_end_event` (atto4) intercetta sold-out/deadline/scacco-matto e porta ad `waiting_seller_acknowledge` → decisione venditore → `execute_draw`. **I due non si parlano:** `buy_blocks` scrive `closed` *in sincrono all'acquisto*, e `detect_airdrop_end_event` guarda solo gli status `presale`/`sale` — quindi un airdrop andato sold-out finisce in `closed` e **il flusso atto4 non lo raccoglie mai**. Niente acknowledge, niente draw, niente vincitore. È un airdrop bloccato.

**Causa B — legacy.** Gli airdrop "CHIUSO" che ROBY ha visto in archivio sono **pre-atto4** (atto4 è del 16/05). Sono stati chiusi col vecchio flusso e non avranno mai un vincitore. Dato di test, DB resettabile — non li sistemo, li lascio o li archivio.

**Causa C — UI (F7).** La pagina di dettaglio non renderizza gli airdrop conclusi (`completed`/`closed`/`annullato`) → fallback al marketplace. Il dato del vincitore *esiste già* per gli airdrop `completed` (`execute_draw` scrive `winner_id`, `draw_scores`, payout) — è solo la UI che non lo mostra.

**Conseguenza pratica:** F8/F7 si risolvono insieme al Closure Design v3, ma con un pezzo in più non previsto nel design: **disinnescare il setter `closed` dentro `buy_blocks`** e lasciare che sia `detect_airdrop_end_event` a gestire anche il sold-out (cosa che già sa fare). Senza questo, il sold-out continua a saltare tutta la chiusura v3.

---

## 2. Triage 8 finding

| # | Sev | Tipo | Fix | Effort | Dove |
|---|---|---|---|---|---|
| **F8** | 🔴 | BE+FE | Stato post-chiusura visibile + disinnesco conflitto sold-out (§1) | ~3–4h | `buy_blocks` + UI dettaglio · = **PR-5 Closure v3, allargato** |
| **F7** | 🔴 | FE | Render pagina recap airdrop chiuso (no fallback marketplace) | incluso in F8 | `src/airdrop.js` |
| **F1** | 🟠 | FE | Pannello acquisto + popup conferma mostrano prezzo BASE, addebito è PRESALE. Allineare anche "ARIA investiti" | ~1h | `src/airdrop.js` / `src/dapp.js` |
| **F4** | 🟠 | FE(+RPC) | Submit valutazione passa con 0 foto — bloccare se manca il minimo foto tecniche | ~1–1.5h | form "Valuta il tuo oggetto" + guard RPC |
| **F5** | 🟡 | FE(+BE) | Deadline ABO editabile ma ignorata — **decisione richiesta**, vedi sotto | 15min o ~1h | modal approvazione ABO |
| **F6** | 🟡 | Config | `/venditore` → login. Route legacy, `venditore.html` orfano | ~10min | `vercel.json` (redirect → `/miei-airdrop`) |
| **F2** | 🟡 | FE | "1 blocchi minati" → "1 blocco minato" (pluralizzazione) | ~15min | toast post-acquisto |
| **F3** | 🟢 | FE | Counter "Sei 1° su N" da 12px → più prominente | ~30min | card airdrop |

**F5 — serve una decisione (è un punto, non un bug puro):** il campo DEADLINE "(auto)" nel modal ABO è editabile ma la deadline viene ricalcolata all'accettazione (24h auto). Due opzioni:
- **(a)** campo **read-only** — la deadline è sempre auto. 15 min. Pulito ma toglie all'admin la leva di chiusura anticipata.
- **(b)** **onorare l'override** — se l'admin scrive una deadline, quella vince. ~1h. Restituisce la leva "forza chiusura anticipata" (che oggi *non esiste* da nessuna parte).

Raccomando **(b)**: ci serve davvero un modo per forzare la chiusura — anche solo per testare il flusso v3 (oggi non si riesce a far scadere un airdrop in UAT, ed è proprio il motivo per cui F8 è rimasto invisibile finora). F5 è di fatto un **test-blocker del Closure Design v3**.

---

## 3. Raggruppamento PR

Due tronconi. Il primo è il Closure Design v3 (5 PR già stimati nel mio ACK precedente). Il secondo raccoglie i finding UAT minori.

**Troncone A — Closure Design v3** (~2 gg, vedi `CCP_Ack_ROBY_Airdrop_Closure_Design_LOCKED_2026-05-22.md`)
PR-5 si **allarga** per includere F8+F7 e il disinnesco del conflitto sold-out (Causa A).

**Troncone B — "Lifecycle Fix Pack"** (~mezza giornata, ~4–5h) — PR unica, indipendente dal Closure Design:
- F1 prezzo presale · F4 validazione foto · F5 deadline (opzione b) · F6 redirect route · F2 plurale · F3 counter.
- Mini integration test incluso (focus F1: assert prezzo mostrato == prezzo addebitato; F4: submit con 0 foto deve fallire).

Il Lifecycle Fix Pack **può partire subito** — non dipende da nessuno STOP-ASK. Se vuoi te lo consegno prima del Closure Design v3, così l'UAT successivo gira su una base più pulita (specie F5, che sblocca il test della scadenza).

---

## 4. Stato STOP-ASK

Dal mio ACK precedente:
- ✅ **#1** (file companion mancante) — **RISOLTO**, è questo file.
- ⏳ **#2** consolazione premium/base vs codice reale · **#3** "ROBI rullo" su annullamento · **#4** split gate-fee/payout-Stage-2 — **ancora aperti.** PR-3/4 del Closure Design restano gated finché non ho un vostro OK su questi tre.

PR-1, PR-2 (Closure v3) e l'intero Lifecycle Fix Pack non dipendono da nulla: **via libera appena dite "vai".**

---

## 5. Bottom line

- F8/F7 non era solo UI: c'è un conflitto sold-out reale da disinnescare — buona pesca del UAT.
- 6 finding minori = mezza giornata, una PR, zero blocchi.
- F5 sbloccherebbe il test della chiusura naturale — consiglio di farlo per primo.
- Aspetto: (a) OK per partire col Lifecycle Fix Pack · (b) risposte STOP-ASK #2/#3/#4 per sbloccare il resto del Closure Design.

Daje — il lifecycle airdrop lo chiudiamo tondo.

---

*CCP · CIO/CTO Airoobi · Triage UAT Airdrop Lifecycle · 22 May 2026 · daje team a 4*
