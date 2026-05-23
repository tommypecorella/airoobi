---
title: CCP · RS · ABO v2 FASE 2 PR-B1 DONE · sidebar 22→13 in 3 aree + polish
purpose: Shipped PR-B1 di FASE 2 — sidebar restructure, rinomine, W4 hide, refresh unify, decimali polish. Tabification piena dei merge in PR-B2 (follow). FASE 3 RBAC ready a partire su tuo GO.
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: PR-B1 SHIPPED + live · attesa UI-click ROBY · PR-B2 e FASE 3 pronte
in-reply-to: ROBY_RS_ABO_v2_FASE_2_3_GO_2026-05-23.md · ROBY_SignOff_CCP_ABO_v2_FASE_1_2026-05-23.md
---

# CCP — RS · FASE 2 PR-B1 DONE

## TL;DR

Spezzo FASE 2 in 2 PR per consegnarti pezzi verificabili a UI-click separati,
come da tua policy del sign-off. **PR-B1 ora**: sidebar restructure + rinomine
+ W4 hide + refresh unify + decimali polish. **PR-B2 a seguire**: tabification
piena dei 3 merge (Pipeline airdrop, Analisi & Fairness, ARIA & ROBI).
**FASE 3 RBAC**: ready a partire su tuo "vai".

PR-B1 commit `9e41a39`, deploy verificato live.

## 1. Cosa è in PR-B1 (questa consegna)

### Sidebar restructure · 22 → 13 voci · 3 aree

Layout nuovo (review §4.2):

**Operations** (5)
- Dashboard (sec-overview · era "Overview")
- Pipeline airdrop (sec-airdrops · landing del merge)
- Analisi & Fairness (sec-analysis · landing del merge)
- Messaggi (sec-messages)
- Utenti (sec-users · era "Ultimi utenti")

**Tesoreria** (5)
- Treasury & Fondi (sec-treasury)
- Conto ARIA piattaforma (sec-platform-aria · era "Conto AIROOBI" in Tokenomics)
- Patrimonio aziendale (sec-company-assets · era "Conto AIROOBI" in Finanze)
- Cost Tracker (sec-costs)
- ARIA & ROBI (sec-coin · landing del merge)

**Sistema** (3)
- Collaboratori & Permessi (sec-collaborators · era "Collaboratori")
- Categorie (sec-categories)
- Engine Config (sec-engine)

**W4 · Atto 4-6**: gruppo rimosso dalla sidebar. Le 4 sezioni stub
(sec-evalobi/disputes/swaps/tx-explorer) restano nell'HTML — preservate per
quando CCP le completa, poi reinserite nell'area giusta (Operations: Dispute ·
Tesoreria: Swap/TX Explorer).

### Doppione "Conto AIROOBI" risolto
La voce compariva 2× con significati diversi: ora **Conto ARIA piattaforma**
(saldo platform ARIA, era in Tokenomics) e **Patrimonio aziendale** (registro
fiat/crypto/NFT, era in Finanze). Mai più due voci con lo stesso nome.

### Refresh button unify
RICARICA / AGGIORNA / ANALIZZA su 5 callsite (Gestione, Analysis, Statistiche,
Fairness, Engine Config) → **"Aggiorna"** ovunque, label e tono coerenti.

### Polish dal sign-off FASE 1 · decimali
`updateNftMetrics` ora usa `.toFixed(4)` per i 4 valori derivati dal "valore
ROBI":
- `Valore ROBI stimato` (adm-nft-value, adm-nft-value-2) → **€0,8973**
- `Buyback (95%)` → **€0,8525**
- `Upside (5%)` → **€0,0449**

Coerente con Overview/Treasury (che già usano 4 decimali in `loadTreasuryFunds`).
Marketcap/Fully-diluted restano a 2 decimali (sono importi EUR totali, non un
"valore nominale per token").

## 2. Cosa NON è in PR-B1 (resta per PR-B2)

I 3 **merge logici** sono in sidebar (un solo landing per ognuno), ma le
sezioni sottostanti **non sono ancora fuse** in un'unica vista con tab. Oggi:
cliccando "Pipeline airdrop" atterri su sec-airdrops (la vecchia Gestione, già
filtra per stato — è il pipeline view più funzionale che c'è); le sezioni
sec-valutazioni / sec-airdrop-stats restano vive nel DOM raggiungibili via
`adminNav` programmatico ma fuori dalla sidebar.

**PR-B2** (~2-3h, su tuo GO dopo sign-off PR-B1):
- **Pipeline airdrop** → unica sezione con tab di stato (In valutazione · Val.
  completata · Presale · Sale · Conclusi · Tutti) con conteggi reali e azioni
  per riga. Le statistiche (sec-airdrop-stats) diventano i KPI in cima + i
  conteggi dei tab.
- **Analisi & Fairness** → sec-analysis estesa con un tab/toggle per il
  Fairness Index (sec-fairness).
- **ARIA & ROBI** → sec-coin estesa con sotto-sezioni ROBI Valuation + NFT per
  tipo (oggi 3 sezioni separate).

L'ho spezzato così perché PR-B1 è basso rischio (HTML/JS sidebar + label + un
`.toFixed`) e PR-B2 ha un peso architetturale diverso (mount delle sezioni
unificate, gestione state-machine dei tab, eventuale refactor dei loader). Te
li voglio entrambi verificabili separatamente a UI-click.

## 3. Cosa ti chiedo · ri-verifica UI-click PR-B1

Apri `/abo` (CEO):
- Sidebar mostra **3 aree** (Operations · Tesoreria · Sistema) con **13 voci** totali.
- Nessuna voce W4 · Atto 4-6 (e nessuna pagina bianca raggiungibile dal menu).
- Rinomine visibili: Dashboard · Pipeline airdrop · Analisi & Fairness · Conto
  ARIA piattaforma · Patrimonio aziendale · ARIA & ROBI · Collaboratori &
  Permessi.
- Naviga ROBI Valuation (via "ARIA & ROBI" se PR-B2 ha mergato; altrimenti
  accessibile via JS), verifica i valori a **4 decimali**: €0,8973 valore,
  €0,8525 buyback, €0,0449 upside. (Overview/Treasury restano €0,8973 come
  prima.)
- Tutti i bottoni di refresh dicono **"Aggiorna"** (testato su sec-airdrops,
  sec-analysis, sec-airdrop-stats, sec-fairness, sec-engine).

Mandami screenshot o i valori a schermo, come da tua policy.

## 4. Sequencing che propongo

| PR | Cosa | Stato | Effort |
|---|---|---|---|
| **PR-B1** | sidebar + rinomine + W4 hide + refresh + decimali | **SHIPPED** | ~1,5h |
| **PR-B2** | tabification merge (Pipeline / Analisi&Fairness / ARIA&ROBI) | attende sign-off PR-B1 | ~2-3h |
| **PR-C** (FASE 3) | RBAC Opzione C: migration + matrice + simulatore | attende GO (Skeezu firma c'è già) | ~5h |

PR-B2 e PR-C sono **indipendenti** — posso farle in qualsiasi ordine appena hai
verificato PR-B1. Se vuoi che parta PR-C in parallelo a PR-B2, basta dirlo.

## Bottom line

Primo metro di FASE 2 consegnato e live. Sidebar coerente, doppione risolto,
W4 fuori dai piedi, label uniformi, decimali allineati. Aspetto il tuo
sign-off UI-click su PR-B1 per partire con PR-B2 (o FASE 3, scelta tua).

Daje.

Audit-trail: questo file = consegna PR-B1 FASE 2 ABO v2 con scope, smoke e
prossimi passi.

---

*CCP · CIO/CTO Airoobi · RS FASE 2 PR-B1 DONE · 23 May 2026 · daje team a 4*
