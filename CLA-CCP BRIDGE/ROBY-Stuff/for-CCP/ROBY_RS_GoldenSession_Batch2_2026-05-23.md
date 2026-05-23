---
title: ROBY · RS · GOLDEN-SESSION batch 2 — GS-5…GS-15 (11 item UAT CEO)
purpose: Secondo blocco della golden-session UAT CEO. 11 item azionabili da GS-5 a GS-15. GS-11 è un bug funzionale bloccante (P0) → in testa. Gli altri sono UX refinement + 1 pagina nuova. Cluster pagina airdrop separato perché attende mini-spec ROBY.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: RS golden-session batch 2 · 11 item · RS paste-ready
related: GOLDEN-SESSION_2026-05-23.md · ROBY_RS_GoldenSession_Batch1_2026-05-23.md
---

# ROBY — RS · GOLDEN-SESSION batch 2

## TL;DR

Batch 1 (GS-1 · GS-2 · GS-4) è già in `for-CCP/`. Questo è il **batch 2**:
11 item, da GS-5 a GS-15. **GS-11 è un bug funzionale bloccante** — comprare un
blocco fallisce — quindi va per primo, isolato. Il resto sono raffinamenti UX
+ una pagina nuova (ROBI Explorer). Cinque item insistono sulla **stessa
pagina** (`/dapp/airdrop/:id`): li raggruppo in un cluster e CCP li fa in una
passata, ma quel cluster **attende la mini-spec ROBY di GS-9** (gerarchia
pagina airdrop) — la consegno subito dopo questo file.

**Ordine consigliato:** GS-11 (P0) → Track A (item indipendenti, partono
subito) → Track B (cluster pagina airdrop, dopo mini-spec ROBY).

---

## P0 · GS-11 — Acquisto blocchi fallisce

**Cosa:** sulla pagina airdrop (`/dapp/airdrop/:id`), pannello "ACQUISTA
BLOCCHI", comprare anche **1 solo blocco** ritorna:

```
HTTP_400
{"code":"P0001","details":null,"hint":null,
 "message":"fairness_block:math_impossible"}
```

Riprodotto da Skeezu sull'airdrop **Fontanella** (smart per animali).

`P0001` = `RAISE EXCEPTION` Postgres: la RPC di acquisto blocco solleva
**volontariamente** `fairness_block:math_impossible`. Non è un crash — è un
guard di coerenza fairness/scoring che scatta e blocca la transazione.

CCP-actionable:
- Identificare la **RPC di acquisto blocco** e la **riga del `RAISE`** che
  emette `fairness_block:math_impossible`.
- Diagnosticare **quale condizione** lo fa scattare: parametri dell'airdrop
  (blocchi totali / venduti / prezzo), stato del fairness guard, o un
  caso-limite matematico (divisione per zero, blocchi residui = 0,
  arrotondamento).
- Fix: un acquisto blocco legittimo deve **andare a buon fine**. Se la
  condizione del guard è corretta ma scatta troppo presto / sul caso sbagliato,
  correggere la soglia; se è un dato d'airdrop incoerente, capire come ci è
  arrivato.
- Riportare nel §RS / audit-trail: nome funzione + riga raise + causa radice.

*NB collegamento con GS-15:* questo stesso guard matematico è il concetto che
GS-15 vuole esporre all'utente in modo gentile ("tra X blocchi non potrai più
aggiudicarti l'oggetto"). Tenere la diagnosi di GS-11 a portata: serve di nuovo
in GS-15.

---

## Track A — item indipendenti (partono subito)

### GS-5 · "STA SUCCEDENDO" — item del feed cliccabili
**Cosa:** nella dashboard dApp (`airoobi.app/dashboard`) gli item del feed
"STA SUCCEDENDO" (es. "Nuovo airdrop disponibile in categoria computer") sono
testo statico.
CCP-actionable: renderli cliccabili — ogni item linka alla risorsa pertinente
(la pagina dell'airdrop o della categoria). Obiettivo: navigazione più
semplice.

### GS-6 · Indicatore valore ROBI (€) nel topbar dApp
**Cosa:** il contatore ROBI nel topbar mostra solo la quantità (es. "R 26").
CCP-actionable: affiancare il **valore corrente di 1 ROBI in €** + una
**freccia di trend** (su / giù). Il valore esiste già — "Valore nominale ROBI"
in ABO = Treasury ÷ ROBI in circolazione (riscontro: in Portafoglio 26 ROBI =
€ 23,33 → ~€0,90/ROBI). Per la freccia serve un **valore di riferimento
precedente**: salvare uno snapshot periodico del valore nominale e confrontare.

### GS-7 · Impaginazione banner rosa "fase Alpha" su /airdrops
**Cosa:** il banner rosa "Marketplace in fase Alpha · prodotti dimostrativi"
su `airoobi.app/airdrops` è impaginato male.
CCP-actionable: compattare l'**altezza**; portarlo a **larghezza piena**,
layout **adaptive**; rendere il **grassetto inline** nel flusso del paragrafo
(oggi gli span bold vanno a capo da soli e spezzano il testo, ", costruisci la
tua posizione." resta orfano).

### GS-13 · Layout messaggi — bolle dx/sx, due colori (dApp + ABO)
**Cosa:** la vista messaggi non distingue mittente e destinatario.
CCP-actionable: disporre i messaggi a chat — **i miei a destra** (un colore),
**quelli di chi mi scrive a sinistra** (colore diverso). Applicare in
**entrambi** i posti: la vista messaggi nella **dApp** e quella in **ABO**.

### GS-14 · ROBI Explorer — pagina nuova con grafico prezzo + market cap
**Cosa:** in Portafoglio (`airoobi.app/portafoglio`) c'è il bottone "ARIA
EXPLORER", manca l'equivalente ROBI.
CCP-actionable: aggiungere un bottone **"ROBI EXPLORER"** accanto e una pagina
dedicata. Gerarchia proposta da ROBY (sufficiente per partire, affino se serve):
- **Hero**: grafico andamento prezzo ROBI in € (range selezionabile) + prezzo
  corrente grande + freccia trend.
- **Sotto**: market cap, ROBI in circolazione, Treasury / valore nominale,
  volume.
Stesso dato-prezzo di GS-6 → calcolarlo una volta, riusarlo in topbar + pagina.

---

## Track B — cluster pagina airdrop `/dapp/airdrop/:id`

Cinque item insistono sulla stessa pagina. GS-9 è il **rework di gerarchia**
dell'intera pagina; GS-8 / GS-10 / GS-12 / GS-15 sono componenti dentro quel
layout. Conviene farli **in una passata**, dopo che ROBY consegna la
**mini-spec gerarchia GS-9** (in arrivo subito dopo questo file). CCP può
intanto fare il P0 e tutto il Track A.

### GS-8 · Preferiti (cuore chiaro) + CTA condividi
Pulsante preferiti: quando l'airdrop NON è preferito si vede un cerchio scuro →
deve essere **chiaro col cuore visibile**, coerente con la card in vetrina.
Aggiungere accanto una **CTA condividi**, stessa grafica del cuore (le card in
vetrina hanno già share + cuore, la pagina dettaglio no).

### GS-9 · Gerarchia pagina airdrop — competitivo in primo piano
Appena si entra: in primo piano la **parte competitiva** (fase dell'airdrop,
blocchi mancanti, la tua posizione). Immagine a sinistra (confermato).
Descrizioni → seconda importanza. **Attende mini-spec ROBY.**

### GS-10 · Pannello "Come arrivare 1°" — A visibile, B collassabile
Blocco **A** (header "◎ Come arrivare 1°" + riga "Tuo Punteggio · primo") →
sempre visibile. Blocco **B** (dettaglio scoring) → collassato di default.
Clic su A espande B; clic di nuovo richiude.

### GS-12 · Banner autobuy attivo
Quando l'autobuy è attivo, mostrare un **banner sottile sempre visibile in
cima** (on-top, persistente) che lo ricordi. Il toggle resta a fondo pagina —
ma lo stato "sta spendendo ARIA per me" deve essere sempre sotto gli occhi.
Tema di trasparenza/fiducia.

### GS-15 · Indicatore "soglia di aggiudicabilità"
Oltre a "compra X blocchi per diventare 1°", mostrare l'informazione simmetrica:
"**tra X blocchi non potrai più aggiudicarti l'oggetto**" — la soglia oltre cui
vincere diventa matematicamente impossibile per quell'utente.
CCP-actionable: calcolare la soglia "blocchi residui all'aggiudicabilità" e
mostrarla in pagina. È la **versione user-facing dello stesso math di GS-11** —
mostrare il countdown *prima* invece di far sbattere l'utente contro il
`fairness_block:math_impossible` a fine acquisto.
(La riformulazione del claim/narrativa — analogia "corsa in salita" — è
ROBY-side, la consegno a parte.)

---

## RS — paste-ready

```
RS · GOLDEN-SESSION batch 2 (UAT CEO pre-go-live) · 11 item · GS-5…GS-15
Ordine: P0 GS-11 → Track A → Track B (cluster pagina airdrop).

── P0 · GS-11 · Acquisto blocchi fallisce ──────────────────────
Comprare un blocco su /dapp/airdrop/:id (riprodotto su airdrop
Fontanella) ritorna HTTP_400 / P0001 / "fairness_block:math_impossible".
È un RAISE EXCEPTION volontario nella RPC di acquisto blocco.
- Trovare la RPC + la riga del RAISE.
- Diagnosticare quale condizione lo fa scattare (parametri airdrop,
  fairness guard, caso-limite math: div/0, blocchi residui 0,
  arrotondamento).
- Fix: un acquisto blocco legittimo deve riuscire.
- Riportare: nome funzione + riga raise + causa radice.
Lo stesso math serve di nuovo in GS-15 — tenere la diagnosi a portata.

── Track A · item indipendenti, partono subito ─────────────────
GS-5  Dashboard dApp, feed "STA SUCCEDENDO": rendere gli item
      cliccabili → linkano alla pagina airdrop / categoria.
GS-6  Topbar dApp: accanto al contatore ROBI, valore di 1 ROBI in €
      + freccia trend. Valore = Treasury ÷ ROBI in circolazione
      ("Valore nominale ROBI" già in ABO). Per la freccia serve uno
      snapshot periodico del valore precedente.
GS-7  /airdrops, banner rosa "fase Alpha": compattare altezza,
      larghezza piena, adaptive, grassetto inline (oggi gli span
      bold spezzano il paragrafo).
GS-13 Vista messaggi: bolle a chat — i miei a destra (un colore),
      chi mi scrive a sinistra (colore diverso). In dApp E in ABO.
GS-14 Portafoglio: bottone "ROBI EXPLORER" accanto a "ARIA EXPLORER"
      + pagina nuova. Hero = grafico prezzo ROBI € + prezzo corrente
      + trend; sotto = market cap, ROBI circolante, Treasury/valore
      nominale, volume. Stesso dato-prezzo di GS-6: calcolarlo una
      volta, riusarlo.

── Track B · cluster pagina airdrop /dapp/airdrop/:id ──────────
ATTENDE la mini-spec ROBY di GS-9 (gerarchia) — arriva subito dopo.
Fare i 5 item in una passata sul layout nuovo:
GS-8  Preferiti: cerchio scuro → chiaro col cuore visibile (coerente
      con la card in vetrina). Aggiungere CTA condividi accanto,
      stessa grafica del cuore.
GS-9  Gerarchia: appena entrati, parte competitiva in primo piano
      (fase airdrop, blocchi mancanti, tua posizione). Immagine a
      sinistra. Descrizioni → seconda importanza. [mini-spec ROBY]
GS-10 Pannello "Come arrivare 1°": blocco A (header + "Tuo Punteggio
      · primo") sempre visibile; blocco B (dettaglio scoring)
      collassato di default. Clic su A espande/richiude B.
GS-12 Autobuy: quando attivo, banner sottile sempre visibile in cima
      (on-top). Toggle resta a fondo pagina. Trasparenza spesa ARIA.
GS-15 Indicatore "soglia di aggiudicabilità": oltre a "compra X
      blocchi per diventare 1°", mostrare "tra X blocchi non potrai
      più aggiudicarti l'oggetto". È la versione user-facing del
      math di GS-11 — mostrare il countdown prima del muro.

Ad ogni consegna ROBY ri-verifica a UI-click. Batch 1 (GS-1/2/4)
resta da relayare. La golden-session chiude → go-live quando tutti
gli item sono risolti.
```

## Nota

GS-3 è la voce di stato (gate go-live), non un'azione. Item ROBY-side ancora
in carico a ROBY e non a CCP: copy guida/blog GS-1, riformula §7 GS-4,
mini-spec gerarchia GS-9, claim "corsa in salita" GS-15. Li consegno a parte.

Ad ogni consegna CCP, ROBY ri-verifica a UI-click prima del sign-off
(`feedback_verify_ccp_fe_fix_ui_click`). La golden-session è il gate del
go-live ufficiale: si chiude quando tutti gli item — batch 1 + batch 2 +
eventuali successivi — sono risolti. Target: oggi.

---

*ROBY · Strategic MKT & Comms & Community · RS GOLDEN-SESSION batch 2 · 23 May 2026 · daje team a 4*
