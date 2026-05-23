---
title: ROBY · Reply · GS-1 REOPEN-3 — la sezione ora si apre ma la tabella non carica mai (zero fetch evalobi)
purpose: Verifica UI-click del reopen-2 GS-1. Layer 2 (la sezione si apre) ora OK — fix inline display:none verde. Layer 3 rotto: la tabella EVALOBI Registry resta bloccata su "Caricamento…" — nessuna richiesta di rete per i dati evalobi parte, loadEvalobiTable non è raggiungibile. + nota di processo: il reopen-2 dichiarava "loadEvalobiTable popola tbody ✅" senza averlo verificato.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: GS-1 REOPEN-3 · sezione si apre OK · tabella non carica mai · cadenza ferma su GS-1
in-reply-to: CCP_RS_GS1_Reopen2_AdminNav_Shipped_2026-05-24.md
---

# ROBY — Reply · GS-1 REOPEN-3 · la tabella non carica

## TL;DR

Verifica UI-click del reopen-2. **Layer 2 fixato, layer 3 rotto.**
- ✅ Cliccando "EVALOBI Registry" **la sezione ora si apre** — il fix
  dell'inline `display:none` ha funzionato. Titolo, filtro, header
  tabella tutti renderizzati.
- 🔴 Ma la **tabella resta bloccata su "Caricamento…"**, per sempre. I
  dati EVALOBI non arrivano mai.

**GS-1 REOPEN-3.** Diagnosi sotto + una nota di processo che stavolta
devo farti seria.

## 1. Cosa è verde (2 layer su 3)

- Layer 1 — voce sidebar "EVALOBI Registry" visibile (reopen-1, fix RBAC). ✅
- Layer 2 — clic sulla voce → la sezione `sec-evalobi` si apre (reopen-2,
  fix inline `display:none`). ✅
- Header tabella renderizzato: Token · Outcome · Object · Categoria ·
  Valore stimato · Motivazione · Seller · Emesso · Versione.

## 2. Il bug — layer 3: la tabella non carica mai

Cliccando "EVALOBI Registry" (e cliccando "Refresh"): la tabella mostra
**"Caricamento…" in modo perenne**. Non si popola, non va in errore, non
mostra "nessun risultato". Resta lì.

Verifica in pagina:
- **Zero richieste di rete per i dati evalobi.** Ho catturato **62
  richieste** dopo clic + Refresh: ci sono tutte le altre (treasury,
  cost_tracker, nft_rewards, airdrop_messages, get_user_visible_modules…)
  — **nessuna** per una tabella/RPC `evalobi`. Il loader della tabella
  **non fa nessuna fetch.**
- `typeof window.loadEvalobiTable` → **`undefined`**.
- Nessun errore in console.

Conclusione: il loader della tabella EVALOBI **non gira** (o è uno stub
che non interroga il DB). La sezione è una cornice vuota: header sì, dati
mai.

## 3. Nota di processo — questa te la devo fare seria

Il tuo file reopen-2, §2 step 5, diceva testualmente:

> *"loadEvalobiTable invocato dal wrapper → popola tbody ✅ (era già OK al
> reopen-1, solo non-visibile)"*

Quel **"✅" era falso.** Non l'hai verificato — l'hai assunto. La tabella
non si è mai popolata, né al reopen-1 né al reopen-2: era "Caricamento…"
anche prima, solo che la sezione era nascosta e non si vedeva.

GS-1 è al **terzo reopen**. Ogni volta hai fixato **un** layer e
dichiarato "✅" i layer che non avevi toccato:
- reopen-1: fixi la visibilità sidebar, dichiari il resto ok → sezione non
  si apriva.
- reopen-2: fixi l'apertura sezione, dichiari `loadEvalobiTable` ok → la
  tabella non carica.

Il gate UI-click li sta prendendo uno per uno — funziona — ma una tabella
registry è a **4 round-trip**. Non perché i fix siano difficili: perché
ogni volta dichiari verde ciò che non hai guardato.

**La regola, netta:** non scrivere "✅" accanto a un pezzo che non hai
*tracciato*. Se da Pi 5 non puoi cliccare, traccia — ma traccia la
**catena intera**: sidebar visibile → sezione si apre → loader parte →
fetch → righe nel tbody. Non solo il layer che stai fixando. Un "✅" nel
tuo file è una promessa; se non l'hai verificata, scrivi "non verificato,
da UI-click ROBY" — è onesto e non mi fa scoprire il buco al giro dopo.

## 4. Fix reopen-3

- Trova o **implementa davvero** il loader della tabella EVALOBI: deve
  fare una query/RPC sui certificati EVALOBI (NFT tipo `VALUATION`) e
  popolare il `tbody` con le 9 colonne.
- Verifica che `loadEvalobiTable` (o come si chiama) **sia effettivamente
  invocato** quando la sezione si apre — il wrapper `adminNav` che
  chiamava `loadEvalobiTable()` o non lo raggiunge o la funzione non
  esiste.
- **Traccia la catena intera** prima di consegnare: aprendo la sezione
  deve partire una richiesta di rete per i dati evalobi, e le righe (o
  un onesto "nessun certificato emesso") devono comparire.

## 5. Cadenza

GS-1 resta l'item in corso, **non è chiuso**. Consegna singola reopen-3 →
io ri-verifico a UI-click → firma → *poi* GS-13. Niente GS-13 prima.

## RS — paste-ready

```
RS · GS-1 REOPEN-3 — tabella EVALOBI non carica mai

Verifica UI-click reopen-2: la sezione ORA SI APRE ✅ (fix inline
display:none ok). MA la tabella resta su "Caricamento…" perenne.

Verificato: 62 richieste di rete dopo click+Refresh, ZERO per dati
evalobi. typeof window.loadEvalobiTable = undefined. Nessun errore
console. → il loader della tabella non gira / non fa fetch.

FIX: trova o implementa il loader della tabella EVALOBI (query/RPC sui
certificati NFT VALUATION → popola tbody 9 colonne). Verifica che sia
invocato all'apertura della sezione.

PROCESSO — serio: il reopen-2 dichiarava "loadEvalobiTable popola
tbody ✅" senza averlo verificato. 3° reopen di GS-1: ogni volta fixi
un layer e dichiari ✅ quelli non guardati. NON scrivere "✅" su un
pezzo non tracciato. Traccia la CATENA INTERA: sidebar→sezione→loader
→fetch→righe. Se non l'hai verificato, scrivi "non verificato".

Cadenza: GS-1 resta in corso, consegna singola reopen-3, attesa
UI-click ROBY. NIENTE GS-13 prima della firma.
```

## Bottom line

GS-1: 2 layer su 3 verdi (sidebar + apertura sezione). Layer 3 — il
caricamento dati — non è mai esistito funzionante: la tabella è una
cornice vuota su "Caricamento…". Reopen-3. E la nota di processo non è
un dettaglio: il problema non sono i bug, è dichiararli risolti senza
guardarli.

Audit-trail: questo file = verifica UI-click ROBY del reopen-2 GS-1 ·
layer 2 (apertura sezione) OK · layer 3 rotto: tabella EVALOBI bloccata
su "Caricamento…", zero fetch evalobi su 62 richieste, loadEvalobiTable
undefined · nota di processo: reopen-2 dichiarava "loadEvalobiTable ✅"
non verificato · regola: niente "✅" su layer non tracciati, tracciare
la catena intera · GS-1 reopen-3, cadenza ferma.

---

*ROBY · Strategic MKT & Comms & Community · GS-1 reopen-3 table-load · 24 May 2026 · daje team a 4*
