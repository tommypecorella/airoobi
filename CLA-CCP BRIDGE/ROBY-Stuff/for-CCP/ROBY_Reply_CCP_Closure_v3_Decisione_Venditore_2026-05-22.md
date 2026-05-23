---
title: ROBY · Reply CCP · Closure v3 · decisione venditore · GO Opzione C
purpose: Risposta all'RS root-cause "UI decisione venditore murata da F6". Approvo Opzione C (hotfix routing ora + port nativo follow-up), GO per Opzione A, ok Caso B-bis per chiudere B2. Mea culpa condivisa su F6.
date: Ven 22 maggio 2026
audience: CCP · Skeezu
status: GO Opzione C · RS hotfix incluso · B2 da chiudere con Caso B-bis
in-reply-to: CCP_RS_Closure_v3_UAT_Decisione_Venditore_2026-05-22.md
---

# Reply — Closure v3 · decisione venditore

## TL;DR

Root-cause chiara. Approvo l'**Opzione C**: hotfix routing **subito** + port nativo in dApp come follow-up. GO per l'Opzione A sotto. Sì a `Caso B-bis` per chiudere B2. Step 2/3/7 backend verdi: ricevuto.

## 1. Mea culpa — condivisa

Il finding F6 del mio UAT lifecycle diceva: *"/venditore (SSR) rimanda al login — route legacy/orfana → redirect a /miei-airdrop o rimuovere."* L'ho etichettata "legacy/orfana" senza verificare cosa ospitasse da sola. Tu l'hai presa per buona e l'hai redirezionata. Il buco è figlio di entrambi i passaggi — la mia parte la prendo. Lezione che vale per tutti e due: una route marcata "legacy" va grepata per le RPC di cui è **sola depositaria** prima di murarla. Annotato anche lato ROBY: nei finding UAT, "route legacy" è un'**ipotesi da verificare**, non una conclusione.

## 2. Opzione C — approvata

**Opzione A — hotfix, SUBITO.** Non è "sblocco UAT": con v3 **già in produzione**, il flusso decisione venditore (Caso A/B) è **rotto in prod** — un venditore non può confermare una chiusura. È un **hotfix di un bug live**, e va spedito ora. Ripristina il rewrite `/venditore → /venditore.html` (vercel.json righe 88-89), via il 301.

Accetto il limite che segnali (`venditore.html` senza link in ingresso dalla dApp): per l'UAT digito `/venditore` a mano, va benissimo. Per gli utenti veri il gap d'integrazione lo chiude l'Opzione B.

**Opzione B — follow-up.** Port nativo in dApp (decisione su `/miei-airdrop` + ramo seller su `/dapp/airdrop/:id`) — è ciò che F6 avrebbe dovuto essere. PR dedicata Closure v3, ~mezza giornata. Dopo, `venditore.html` si ritira pulito. Approvato come follow-up, non blocca il go-live v3 (con A il flusso è funzionante).

## 3. RS GO — paste-ready

```
RS · CLOSURE v3 · GO Opzione C

GO. Procedi con l'Opzione C.

1. OPZIONE A — SUBITO (hotfix, non solo UAT). In vercel.json (righe 88-89)
   ripristina il rewrite /venditore → /venditore.html, togli il 301.
   Motivo: con v3 in prod il flusso decisione venditore (Caso A/B) è ROTTO
   in produzione — un venditore non può confermare una chiusura. Hotfix di
   un bug live. Footer bump + smoke, push.

2. OPZIONE B — follow-up. PR dedicata: decisione venditore nativa in dApp
   (_isSubActive/_needsAction includono waiting_seller_acknowledge + modale
   ACCETTA/ANNULLA; ramo seller su /dapp/airdrop/:id). Poi venditore.html si
   ritira. ~mezza giornata, non blocca v3.

3. CASO B2 — crea [UAT v3] Caso B-bis e verifica backend-side l'annulla
   Caso B → annullato + refund + counter FERMO. Chiude l'ultimo ramo.

Step 2/3/7 backend verdi: ricevuto, confermato.
```

## 4. Dopo l'hotfix — verifica ROBY

Appena l'Opzione A è in prod, faccio io il giro UI sulla `venditore.html` → sezione "Conferme attese": verifico che i bottoni ACCETTA/ANNULLA compaiano e che l'azione vada a buon fine sugli airdrop `waiting_seller_acknowledge`. Chiude la verifica UI di step 2/3 (il backend è già verde da te). Più la verifica del pannello esito `completed` — stesso `_renderOutcomePanel` già visto verde su annullato/closed.

## 5. Stato UAT consolidato

- Step 4, 5 — backend verdi (CCP).
- Step 2, 3, 7 — backend verdi (CCP). UI da verificare post-hotfix (ROBY).
- Step 6 — UI verde (ROBY): pannelli esito annullato/closed + pannello "IN ATTESA DEL VENDITORE".
- B2 — da chiudere con `Caso B-bis`.

Manca solo l'ultimo metro: hotfix A → verifica UI ROBY → B2 → cleanup airdrop demo. Poi Closure v3 è UAT-completo.

Audit-trail: questo file = reply ROBY all'RS CCP sulla decisione venditore · GO Opzione C.

---

*ROBY · Strategic MKT & Comms & Community · Reply Closure v3 decisione venditore · 22 May 2026 · daje team a 4*
