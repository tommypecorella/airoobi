---
title: CCP · RS · Closure v3 UAT · decisione venditore FE — root-cause + step 2/3/7 backend verdi
purpose: Risposta all'RS "UI decisione venditore non raggiungibile". Il pulsante ESISTE ed è cablato — l'ho reso orfano io col fix F6. Root-cause su 3 layer, step 2/3/7 verificati backend-side (verdi), 3 opzioni di fix.
date: Ven 22 maggio 2026
audience: ROBY · Skeezu
status: ROOT-CAUSE TROVATA · step 2/3/7 backend VERDI · serve decisione (3 opzioni) · B2 non coperto
in-reply-to: RS Skeezu/ROBY "FINDING: UI decisione venditore non raggiungibile"
---

# CCP — RS Closure v3 UAT · decisione venditore

## TL;DR

Il pulsante decisione venditore **esiste ed è cablato correttamente** su
`seller_acknowledge_airdrop`. Sta in `venditore.html`, sezione **"Conferme
attese"**. Non è raggiungibile perché **l'ho reso orfano io**: il fix **F6** del
Lifecycle Fix Pack (commit `a9a8315`, oggi in prod) ha trasformato `/venditore`
in un **redirect 301 → `/miei-airdrop`**. La pagina è viva ma murata.

Ipotesi ROBY: **(a)** "non wired in FE" → **falsa**, è wired da W4 Day 2.
**(b)** "mis-buckettato" → **vera a metà**: lo *stato DB* è corretto, ma la
dApp `/miei-airdrop` butta i `waiting_seller_acknowledge` nel tab **Archivio**
(zero pulsanti azione) → da lì il "solo ENTRA + MESSAGGI" che hai visto.

Step 2/3/7 li ho verificati backend-side: **tutti verdi**. B2 (Caso B annulla)
**non coperto** — serve un 5° airdrop di test. Dettagli + 3 opzioni sotto.

---

## 1. Dov'è il pulsante — e perché non si vede

**Esiste.** `venditore.html` → sidebar **"Conferme attese"** (`#sec-acknowledge`).
`loadAcknowledge()` filtra `status='waiting_seller_acknowledge'` e per ogni
airdrop disegna una card con due bottoni:

- **✓ ACCETTA · FINALIZZA AIRDROP**
- **✕ ANNULLA · RIMBORSO TUTTI**

`ackSubmit()` chiama `sb.rpc('seller_acknowledge_airdrop', { p_airdrop_id,
p_decision, p_service_call:false })`. È esattamente la UI Atto 4 / Closure v3,
costruita il 16/05 (W4 Day 2, commit `88ccf1b`) — **precede PR-1**, che ha solo
portato il backend RPC corrispondente. Quindi ipotesi (a) cade: non manca, è lì.

**Non si vede** per tre muri sovrapposti:

| # | Layer | Cosa succede | Dove |
|---|---|---|---|
| 1 | **Routing** | `/venditore` → **301** → `/miei-airdrop`. `venditore.html` irraggiungibile in prod. | `vercel.json` righe 88-89 |
| 2 | **dApp /miei-airdrop** | `_isSubActive()` **non include** `waiting_seller_acknowledge` → l'airdrop finisce nel tab **Archivio** → `_renderSubsHtml(…, isArchive=true)` salta tutto il blocco azioni → restano **solo ENTRA + MESSAGGI**. | `src/dapp.js` `_isSubActive` (4178) · `_renderSubsHtml` (4292) |
| 3 | **dApp /dapp/airdrop/:id** | per `waiting_seller_acknowledge` mostra il pannello buyer read-only "In attesa del venditore" **a tutti, venditore incluso** — nessun ramo seller. | `src/dapp.js` 2585 |

Il muro #1 è quello che ha tagliato la testa al flusso. I muri #2/#3 spiegano
perché la dApp — bersaglio del redirect — non offre un'alternativa.

## 2. Timeline — come ci siamo arrivati (mea culpa)

1. **16/05** `88ccf1b` — nasce `venditore.html` con la UI Atto 4 ACCETTA/ANNULLA
   + rewrite `/venditore` → `/venditore.html`. Tutto raggiungibile.
2. **22/05** UAT lifecycle ROBY → finding **F6**: "/venditore rimbalza al login,
   route legacy → redirect a /miei-airdrop o rimuovere".
3. **22/05** mio triage → ho classificato `venditore.html` **"orfano/legacy,
   ~10 min"**. **Errore mio**: non ho verificato che fosse l'**unico** host della
   UI di acknowledge. Le funzioni venditore *valutazione/ritiro/messaggi* vivono
   sì nella dApp — ma la decisione di **chiusura** Closure v3 no.
4. **22/05 18:27** `a9a8315` (Lifecycle Fix Pack) — applico F6: rewrite → 301
   redirect. **Il fix F6 ha decapitato il flusso Closure v3.**
5. **Oggi** — PR-1..5 in prod, RPC pronto, UI murata. L'UAT trova il buco.

Lezione che mi porto a casa: una route etichettata "legacy/orfana" va greppata
per le RPC di cui è **sola** depositaria, prima di redirezionarla via.

## 3. Step 2/3/7 — verifica backend-side (tutti VERDI)

Eseguiti via `seller_acknowledge_airdrop(..., p_service_call:=true)` sugli
airdrop UAT `is_demo`. Come per lo step 4.

| Step | Airdrop | Esito | Verifica |
|---|---|---|---|
| **2 · Caso A accept** | `41c32596` | → **`completed`** | winner `e9992dae`, payout **20,40 €**, 1 ROBI al non-vincitore (`airdrop_draw` 0,2084 — capata anti-inflazione), 0 consolazione, counter CEO **invariato (1)** ✓ |
| **3 · Caso B1 accept** | `2eb0ea24` | → **`completed`** | chiusura **sottocosto**: `accept` forza il ramo successo malgrado 20,40 € < 500 €. winner `e9992dae`, payout 20,40 €, counter **invariato (1)** ✓ |
| **7 · Sold-out** | `ceb5dc29` | `sale` → **NO `closed`** → `detect` → `waiting_seller_acknowledge` (trigger `sold_out`, SLA 72h) → accept → **`completed`** | PR-5 confermato: `buy_blocks` live **non** ha più il setter `closed`. Counter invariato ✓ |

**PR-5 disinnesco sold-out**: verificato sia strutturalmente (la def. live di
`buy_blocks` non contiene `status='closed'`, conserva `presale→sale`) sia
funzionalmente (l'airdrop sold-out è rimasto `sale` e `detect_airdrop_end_event`
l'ha raccolto — prima sarebbe morto in `closed`, F8 Causa A).

Nota step 7: i 5 acquisti di blocco li ho **simulati** lato DB (inserito
blocchi+partecipazioni+addebito ARIA fedele a `buy_blocks`, status lasciato
`sale`) — `execute_sql` non ha contesto auth per chiamare `buy_blocks` come 5
buyer. Se vuoi un E2E 100% fedele, l'acquisto lato buyer in dApp **funziona**
(il bug è solo la UI venditore): puoi comprarli tu da FE su un airdrop fresco.

## 4. Quello che NON è coperto — B2

`seller_acknowledge_airdrop` su `annulla` ramo **Caso B** (sottocosto →
`annullato` + refund + **nessun** counter) **non è stato testato**: c'era un
solo airdrop Caso B e su tua indicazione ("accept → completed") ho fatto **B1**.
Il ramo `annulla`+counter è dimostrato solo per **Caso A** (step 4 timeout →
counter +1). Per chiudere B2 serve un 5° airdrop `[UAT v3] Caso B-bis`: lo creo
in un colpo appena dici, poi `annulla` backend-side → atteso `annullato`,
refund 300 ARIA, **counter fermo a 1**.

## 5. Fix — 3 opzioni (serve una decisione)

**Opzione A — Sblocco UAT veloce (~15 min).** `vercel.json` righe 88-89: il
redirect 301 torna rewrite `/venditore` → `/venditore.html`. La UI di
acknowledge ridiventa raggiungibile. *Limite*: `venditore.html` non ha link in
ingresso dalla dApp — per l'UAT digiti `/venditore` a mano; reintroduce in
parte il sintomo F6 (pagina SPA non integrata) per gli utenti veri.

**Opzione B — Port nativo in dApp (~2-3h).** La decisione vive dove ROBY si
aspettava (`/miei-airdrop` + `/dapp/airdrop/:id`). Tre tocchi: `_isSubActive`/
`_needsAction` includono `waiting_seller_acknowledge`; `_renderSubsHtml` ottiene
il caso con modale ACCETTA/ANNULLA (pattern `openCompleteEarlyClose`, già
collaudato); il dettaglio mostra il ramo seller se `viewer===venditore`. È ciò
che F6 **avrebbe dovuto** essere. Dopo, `venditore.html` si ritira pulito.

**Opzione C — Ibrido (raccomandata).** Adesso Opzione A per sbloccarti l'UAT
oggi; Opzione B come follow-up Closure v3 (PR dedicata, mezza giornata). Così
l'UAT v3 non resta fermo e la soluzione vera entra ordinata.

➡️ **Raccomando C.** L'Opzione A è una modifica di routing in prod e ribalta in
parte un fix F6 che era farina del sacco ROBY — per questo **non l'ho già
pushata**: dammi **RS GO** e la spedisco subito (footer bump + smoke, ≤15 min).

## 6. Stato airdrop UAT + cleanup

Dopo questa verifica i 4 `[UAT v3]` sono: Caso A `completed` · Caso B
`completed` · Timeout `annullato` · Sold-out `completed`. Balance toccati dalla
simulazione step 7: `e9992dae` −30 (→270), `b5fd7bd9` −20 (→180). Tutti
`is_demo` — a UAT chiuso pulizia in un colpo (airdrop + partecipazioni + blocchi
+ NFT + counter CEO + refund di test), come da mio file "stati pronti" §5.

## Bottom line

- Pulsante c'è, cablato bene, in `venditore.html`. L'ho murato io col redirect F6.
- 3 layer da sistemare; il #1 (routing) è il blocco vero.
- Step 2/3/7 backend **verdi**. B2 da fare con un 5° airdrop.
- Aspetto: **RS GO** per Opzione A (sblocco oggi) + ok a Opzione B come follow-up
  · e se vuoi creo subito `Caso B-bis` per chiudere B2.

Daje — ultimo metro, lo chiudiamo tondo.

Audit-trail: questo file = risposta CCP all'RS sul finding "UI decisione
venditore non raggiungibile" · root-cause FE + verifica backend step 2/3/7.

---

*CCP · CIO/CTO Airoobi · RS Closure v3 UAT decisione venditore · 22 May 2026 · daje team a 4*
