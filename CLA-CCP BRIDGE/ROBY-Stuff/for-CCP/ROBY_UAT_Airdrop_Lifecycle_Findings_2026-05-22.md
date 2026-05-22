---
title: ROBY · UAT Airdrop Lifecycle end-to-end · Findings + RS per CCP
purpose: Test end-to-end del lifecycle airdrop via Chrome ext (submit → valutazione → approvazione ABO → accettazione → presale → acquisto blocchi → chiusura/scadenza). Mappa stati + 8 finding priorizzati + RS paste-ready. Focus su chiusura e scadenza.
date: Ven 22 maggio 2026
audience: CCP · Skeezu briefing parallel
status: UAT COMPLETO · 8 finding · lifecycle mappato · il buco è la chiusura naturale (scadenza)
priority: F8 chiusura naturale senza esito = punto aperto principale
---

# ROBY · UAT Airdrop Lifecycle — Findings

## TL;DR

Test end-to-end live: ho creato un airdrop da zero ("Cuffie Bluetooth over-ear (TEST ROBY)", audio), submesso, approvato/valutato da ABO, accettato come venditore, portato in presale e comprato blocchi. Più verifica del comportamento di chiusura sugli airdrop già conclusi in archivio.

**Il lifecycle base funziona.** Il buco vero è dove sospettavi tu: **la chiusura naturale (scadenza)**. Un airdrop annullato dal venditore si chiude pulito (rimborso + ROBI consolazione); un airdrop che scade normalmente (CHIUSO) **non mostra alcun esito** al partecipante — niente vincitore, niente consegna, niente consolazione — e la sua pagina di dettaglio non si apre più.

8 finding sotto, priorizzati. F8 è il principale.

## Mappa stati lifecycle (verificata live)

```
1. IN VALUTAZIONE        submit + 50 ARIA pagati · in attesa valutazione admin
2. VAL. COMPLETATA       admin ha fissato quotazione/blocchi · "in attesa accettazione utente"
3. PRE-VENDITA (presale) venditore ha ACCETTATO · 2x ROBI mining · soglia "ogni 4 blocchi"
4. SALE                  raggiunta soglia presale · "ogni 8 blocchi"
5a. CHIUSO               scadenza naturale → ⚠️ esito non mostrato (vedi F8)
5b. ANNULLATO            ritirato dal venditore → rimborso completo + ROBI consolazione (OK)
5c. RIFIUTATI            valutazione respinta da admin
```

Le tab di ABO → Valutazioni rispecchiano la macchina a stati: IN VALUTAZIONE / VAL. COMPLETATA / PRESALE / SALE / RIFIUTATI.

## "Quando scade cosa succede?" — risposta

Non sono riuscita a far scadere un airdrop in diretta (vedi F5 — l'override della deadline è ignorato), ma dagli airdrop già conclusi in archivio:

- **Annullato dal venditore** → percorso pulito e ben comunicato: *"Evento annullato dal venditore. Hai ricevuto il rimborso completo: 119 ARIA tornati nel saldo"* + *"+1 ROBI di consolazione · top-3 partecipanti (rank 1)"*. Funziona.
- **Scadenza naturale (CHIUSO)** → il partecipante vede solo il badge "CHIUSO" e "25 blocchi · 100 ARIA". **Nessun esito**: nessun vincitore indicato, nessun "hai vinto / non hai vinto", nessuna consegna, nessuna consolazione. E la pagina di dettaglio dell'airdrop chiuso non si apre (redirect al marketplace).

**Conclusione:** il tuo sospetto è confermato. La chiusura per annullamento è completa; la chiusura per scadenza naturale è il punto aperto — manca tutta la fase di risoluzione visibile (vincitore, distribuzione ROBI, consolazione, consegna oggetto).

## Finding priorizzati

### 🔴 F8 · Chiusura naturale senza esito (il punto aperto principale)
Un airdrop CHIUSO per scadenza non mostra risoluzione al partecipante: né vincitore, né consegna, né consolazione ROBI. Manca la fase "Atto risoluzione" lato UI/UX. Confronto: l'annullamento mostra rimborso + ROBI consolazione + rank. La scadenza naturale no.
**Serve:** definire e implementare lo stato post-scadenza visibile — chi vince, cosa ricevono gli altri (ROBI consolazione + eventuale rank), stato consegna oggetto. Decisione di prodotto + impl.

### 🔴 F7 · Pagina dettaglio airdrop chiuso non si apre
Navigare a `/dapp/airdrop/:id` di un airdrop CHIUSO fa fallback al marketplace. Un airdrop concluso non ha pagina di recap consultabile. Va insieme a F8.

### 🟠 F1 · Prezzo presale: mostrato ≠ addebitato
Quando l'airdrop ha un prezzo presale diverso dal base, il pannello d'acquisto e il popup di conferma mostrano il prezzo BASE, ma addebitano il prezzo PRESALE scontato. Esempio Fontanella: popup "20 ARIA", addebito reale 10 ARIA. La card invece mostra giusto ("10", con 20 barrato). Sull'airdrop Cuffie (nessun prezzo presale separato) è coerente 5/5 → conferma che il bug è nel display del prezzo presale. Anche il contatore "ARIA investiti" usa il prezzo base (es. "120 investiti" per 6 blocchi a 20, vs ~60 realmente spesi).
**Serve:** pannello acquisto + popup conferma devono mostrare il prezzo presale effettivo; allineare "ARIA investiti".

### 🟠 F4 · Submit valutazione passa con ZERO foto
Il form "Valuta il tuo oggetto" marca 6 foto tecniche come obbligatorie (badge "!"), ma "ACQUISTA VALUTAZIONE" (50 ARIA) va a buon fine con 0 foto caricate. L'evaluator non avrebbe nulla da valutare.
**Serve:** validazione che blocca il submit se mancano le foto tecniche minime (definire il minimo).

### 🟡 F5 · Deadline editabile ma ignorata (ABO approva)
Nel modal di approvazione ABO il campo DEADLINE "(auto)" è editabile. L'ho sovrascritto (impostato 01:20, readback confermato), ho approvato — ma l'airdrop live ha preso la deadline auto (24h dall'accettazione, ~23/05 02:00). L'override non ha effetto.
**Serve:** o rendere il campo read-only (se la deadline è sempre auto), o onorare l'override. Ora è un campo fuorviante. Nota: questo impedisce anche all'admin di forzare una chiusura anticipata da qui.

### 🟡 F6 · /venditore (SSR) rimanda al login — funzioni venditore in dApp
Navigare a `/venditore` rimbalza al login SSR (`/login.html`) — famiglia auth-split. Le funzioni venditore (accetta valutazione, ritira, messaggi) vivono in realtà nella dApp `/miei-airdrop`. La route `/venditore` sembra orfana/legacy.
**Serve:** redirect `/venditore` → `/miei-airdrop`, oppure rimuovere la route.

### 🟡 F2 · Concordanza singolare/plurale
Toast post-acquisto: "1 blocchi minati!" → deve essere "1 blocco minato". Pluralizzazione non gestita.

### 🟢 F3 · Conteggio partecipanti presente ma poco prominente
Il numero di partecipanti c'è ed è inquadrato come ranking competitivo — "Sei 1° su 1 partecipanti" — buono per la competizione. Ma è a 12px, poco prominente. Suggerimento: renderlo un elemento più visibile (è leva di competizione, come dicevi).

## Cosa funziona (non toccare)

- Scoring v5 deterministico: √blocchi verificato live (√5=2.24, √6=2.45) ✓
- Moltiplicatore Fedeltà ×1.00 con 0 ARIA storici ✓ · Boost di garanzia 0/1500 ✓
- 2x ROBI mining in presale ✓ · soglia presale "ogni 4" vs sale "ogni 8" ✓
- Flusso submit → valutazione → accettazione → presale: end-to-end funzionante ✓
- Modal valutazione ABO: calcola quotazione, payout split (Venditore 67.99% · Fondo 22% · Fee AIROOBI 10%) ✓
- Chiusura per annullamento: rimborso completo ARIA + ROBI consolazione top-3 ✓
- Ranking partecipanti ("Sei 1° su N") ✓

## RS paste-ready per CCP

```
RS · AIRDROP LIFECYCLE · 8 finding da UAT end-to-end ROBY (22/05)

PRIORITARIO — chiusura naturale:
F8. Airdrop CHIUSO per scadenza non mostra esito al partecipante (niente
    vincitore / consegna / consolazione). L'annullamento sì, la scadenza no.
    → definire + implementare lo stato post-scadenza visibile (vincitore,
      ROBI consolazione + rank, stato consegna oggetto).
F7. Pagina /dapp/airdrop/:id di un airdrop chiuso fa fallback al marketplace.
    → render pagina recap per airdrop conclusi (insieme a F8).

ALTI:
F1. Prezzo presale: pannello acquisto + popup conferma mostrano il prezzo
    BASE, addebitano il prezzo PRESALE. (Fontanella: popup 20, addebito 10.)
    Allineare anche "ARIA investiti" (usa il prezzo base).
F4. Form "Valuta il tuo oggetto": submit (ACQUISTA VALUTAZIONE, 50 ARIA) va a
    buon fine con 0 foto, nonostante 6 foto tecniche marcate obbligatorie.
    → validazione che blocca senza il minimo di foto.

MEDI:
F5. Modal approvazione ABO: campo DEADLINE "(auto)" editabile ma l'override è
    ignorato (deadline ricalcolata all'accettazione). → read-only OPPURE
    onorare l'override. Serve anche per forzare chiusura anticipata.
F6. /venditore (SSR) rimbalza al login — funzioni venditore sono in dApp
    /miei-airdrop. → redirect /venditore → /miei-airdrop o rimuovere la route.
F2. Toast "1 blocchi minati!" → "1 blocco minato" (pluralizzazione).

BASSO:
F3. Conteggio partecipanti "Sei 1° su N" presente ma 12px — renderlo più
    prominente (leva di competizione).

Smoke OK (non toccare): scoring v5 √blocchi, moltiplicatore fedeltà, boost
garanzia, 2x mining presale, soglie presale/sale, flusso submit→accept→presale,
split payout ABO, chiusura per annullamento (rimborso + ROBI consolazione).
```

## Note operative

- L'airdrop di test **"Cuffie Bluetooth over-ear (TEST ROBY)"** è ora LIVE in presale sul marketplace (deadline ~23/05 02:00, 1 blocco comprato da me). Da ritirare/archiviare a fine test — il "RITIRA" testerebbe anche il percorso annullamento. Decisione Skeezu.
- Tutto il giro è stato fatto come CEO con autorizzazione esplicita di Skeezu a spendere ARIA per testare. ARIA spesi nel test: 50 (valutazione) + 25 (blocchi Fontanella+Cuffie). Saldo attuale 635.

Audit-trail: questo file = UAT lifecycle airdrop ROBY del 22/05.

---

*ROBY · Strategic MKT & Comms & Community · UAT Airdrop Lifecycle · 22 May 2026 · daje team a 4*
