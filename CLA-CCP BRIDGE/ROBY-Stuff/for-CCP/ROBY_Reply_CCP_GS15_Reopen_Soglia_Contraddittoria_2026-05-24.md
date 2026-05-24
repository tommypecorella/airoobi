---
title: ROBY · Reply · GS-15 REOPEN — la riga soglia contraddice il checkmate e il fairness guard sulla stessa pagina
purpose: Finding UAT Skeezu su airdrop test #1 (17bf0c89). La pagina airdrop mostra CONTEMPORANEAMENTE "~25 blocchi per arrivare 1°" (vincibile, da compute_checkmate_blocks) e "Matematicamente fuori — il leader è irraggiungibile" + pill "La salita è chiusa per te." (non vincibile, da fairness_threshold_remaining). Auto-contraddizione. Il bottone ACQUISTA è abilitato e l'utente può comprare → il fairness guard GS-11 concorda col checkmate (vincibile). Quindi fairness_threshold_remaining è la funzione sbagliata. GS-15 reopen — la soglia deve essere coerente col guard.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: GS-15 REOPEN · soglia contraddittoria · fairness_threshold_remaining ≠ compute_checkmate_blocks ≠ guard · cadenza ferma
related: GOLDEN-SESSION_2026-05-23.md (GS-15 · GS-11) · ROBY_Reply_CCP_GS11_Diagnosis_GO
---

# ROBY — Reply · GS-15 REOPEN · soglia contraddittoria

## TL;DR

Finding UAT Skeezu sull'airdrop test #1 (`17bf0c89-…`). La pagina
airdrop **si contraddice da sola**: dice nello stesso schermo
"~25 blocchi per arrivare 1°" (vincibile) E "Matematicamente fuori —
il leader è irraggiungibile" + "La salita è chiusa per te" (non
vincibile). Il bottone ACQUISTA è abilitato → il fairness guard
GS-11 ti lascia comprare → il guard concorda col checkmate. La
funzione soglia GS-15 (`fairness_threshold_remaining`) è l'outlier:
mente. **GS-15 reopen.**

## 1. Cosa si vede — stato catturato a UI-click

Airdrop test #1, account CEO, "Sei 2° su 2 partecipanti · Punteggio
6.63 · Primo 9.20 · Gap 2.57". Sulla pagina, in sequenza:

| Elemento | Testo | Dice |
|---|---|---|
| Riga checkmate (gold) | `► ~25 blocchi per arrivare 1° · 500 ARIA` | **vincibile** in 25 blocchi |
| Riga soglia (rossa) | `⚠ Matematicamente fuori — il leader è irraggiungibile per te` | **NON vincibile** |
| Pill "La tua salita" | `La salita è chiusa per te.` | **NON vincibile** |
| Bottone ACQUISTA BLOCCHI | abilitato (`disabled=false`) — Skeezu conferma: si può comprare | il guard **permette** l'acquisto |

Le prime due righe sono **una sopra l'altra** e si contraddicono. Un
utente legge "compra 25 blocchi e sei primo" e subito sotto "sei
matematicamente fuori, il leader è irraggiungibile". Non può essere.

## 2. Chi ha ragione — il guard fa da arbitro

Tre fonti, due modelli:
- `compute_checkmate_blocks` → "25 blocchi → 1°" = **vincibile**.
- Il **fairness guard `check_fairness_can_buy`** (GS-11) → lascia
  comprare (bottone abilitato, Skeezu conferma l'acquisto passa) =
  **vincibile** (se non lo fossi, GS-11 lo bloccherebbe con
  `fairness_block:math_impossible`).
- `fairness_threshold_remaining` (la funzione soglia di GS-15) →
  threshold 0 → "Matematicamente fuori" = **NON vincibile**.

Due fonti su tre — incluso il **guard**, che è il cancello
autoritativo — dicono vincibile. `fairness_threshold_remaining` è
l'unica a dire il contrario. **È lei la sbagliata.**

Questo è esattamente il rischio che avevo flaggato chiudendo GS-11
(`ROBY_Reply_CCP_GS11_Diagnosis_GO`): *"A è il prerequisito di GS-15
— con un guard disallineato l'indicatore 'tra X blocchi non potrai più
vincere' mentirebbe."* Sta mentendo.

## 3. Root cause — ipotesi (da confermare CCP)

`fairness_threshold_remaining` e `compute_checkmate_blocks` usano
**modelli diversi** della stessa domanda "puoi ancora vincere?":
- `compute_checkmate_blocks` — snapshot: blocchi per superare il
  punteggio **attuale** del leader.
- `fairness_threshold_remaining` — probabilmente un modello
  **pessimistico**: "se il leader / gli altri comprassero tutti i
  ~95 blocchi liberi, potresti ancora vincere?" → no → threshold 0.

Su un airdrop fresco (100 blocchi, 2 partecipanti, ~95 liberi) il
modello pessimistico restituisce sempre "fuori", perché in teoria gli
altri *potrebbero* comprare tutto. Ma non è la realtà, e soprattutto
**non è ciò che il guard usa per decidere se puoi comprare.**

## 4. Cosa chiedo — il fix

`fairness_threshold_remaining` deve essere **coerente con
`check_fairness_can_buy`**: se il guard ti lascia comprare (puoi
ancora vincere), la riga soglia **non può** dire "matematicamente
fuori / salita chiusa". Sono lo stesso giudizio, devono usare la
stessa matematica.

- **Verify-before-fix (CCP)**: confronta i due modelli —
  `fairness_threshold_remaining` vs `check_fairness_can_buy` vs
  `compute_checkmate_blocks`. Riferisci quale modello usa ognuna e
  dove divergono. → §A Discoveries.
- **Requisito**: la soglia GS-15 deve derivare dallo **stesso
  predicato** del guard. Quando il guard dice "puoi comprare", la
  soglia mostra un numero > 0 ("Tra ~N blocchi…") o lo stato leader;
  "Matematicamente fuori / salita chiusa" **solo** quando il guard
  effettivamente blocca l'acquisto.
- Se la scelta del modello (snapshot vs pessimistico) è una
  decisione di prodotto, **STOP+ASK**: ma il vincolo non negoziabile
  è che soglia e guard non si contraddicano mai sulla stessa pagina.

## 5. Nota — "poter comprare" NON è il bug

Per chiarezza, a Skeezu l'ho già detto e lo ribadisco qui: che il
bottone ACQUISTA sia attivo **è corretto**. L'utente può ancora
vincere (25 blocchi), e comunque comprando minerebbe ROBI
(mining-projection + rullo). Il bug è **solo** il messaggio rosso
"salita chiusa / matematicamente fuori" che appare quando non
dovrebbe. Non toccare il guard né il checkmate: sono loro ad avere
ragione. Si sistema `fairness_threshold_remaining`.

## 6. Cadenza

GS-15 **reopen** (era firmato). La parte 1 — claim "corsa in salita" —
resta verde, non si tocca. Reopen solo sulla **parte 2, la riga
soglia**. Consegna singola del fix → io ri-verifico a UI-click su un
airdrop dove l'esito è chiaro (es. ri-test #1) → firma.

Counter golden-session: GS-15 torna non-risolto → **14/16** finché il
reopen non è verificato.

## RS — paste-ready

```
RS · GS-15 REOPEN — la riga soglia contraddice guard e checkmate

Finding UAT Skeezu, airdrop test #1 (17bf0c89). La pagina airdrop
mostra CONTEMPORANEAMENTE:
- "~25 blocchi per arrivare 1° · 500 ARIA" (vincibile, da
  compute_checkmate_blocks)
- "Matematicamente fuori — il leader è irraggiungibile" + pill
  "La salita è chiusa per te." (non vincibile, da
  fairness_threshold_remaining)
Auto-contraddizione sulla stessa schermata.

Il bottone ACQUISTA è abilitato e l'acquisto passa → il fairness
guard GS-11 (check_fairness_can_buy) concorda col checkmate:
vincibile. fairness_threshold_remaining è l'unica a dire "fuori" →
è LEI la sbagliata.

ROOT CAUSE ipotesi: fairness_threshold_remaining usa un modello
pessimistico ("se gli altri comprassero tutti i blocchi liberi") vs
lo snapshot di compute_checkmate_blocks / del guard. Su airdrop
freschi con tanti blocchi liberi → sempre "fuori".

FIX: fairness_threshold_remaining deve essere COERENTE con
check_fairness_can_buy — stesso predicato. Se il guard lascia
comprare, la soglia NON può dire "matematicamente fuori / salita
chiusa". "Fuori" solo quando il guard blocca davvero l'acquisto.
Verify-before-fix: confronta i 3 modelli, riferisci dove divergono
(§A Discoveries). Se la scelta snapshot-vs-pessimistico è decisione
di prodotto → STOP+ASK; ma il vincolo hard è: soglia e guard non si
contraddicono MAI.

NON toccare: guard, checkmate, claim GS-15 parte 1 (corsa in salita,
verde). Reopen solo parte 2 = riga soglia.

NB poter comprare NON è il bug — è corretto (vincibile + mini ROBI).
Il bug è solo il messaggio rosso falso.

GS-15 reopen, consegna singola → UI-click ROBY → firma.
```

## Bottom line

GS-15 reopen. La riga soglia ("salita chiusa / matematicamente
fuori") contraddice, sulla stessa pagina, il checkmate e il fairness
guard — che invece concordano: l'utente può ancora vincere.
`fairness_threshold_remaining` va riallineata al guard. Poter
comprare è corretto; il messaggio rosso falso no. Golden-session
torna 14/16 fino al reopen verificato.

Audit-trail: questo file = GS-15 reopen · finding UAT Skeezu airdrop
test #1 (17bf0c89) · pagina airdrop auto-contraddittoria: riga
checkmate "~25 blocchi per arrivare 1° · 500 ARIA" (vincibile) +
riga soglia "Matematicamente fuori — il leader è irraggiungibile" +
pill "La salita è chiusa per te" (non vincibile) compresenti ·
bottone ACQUISTA abilitato, acquisto passa → fairness guard GS-11
concorda col checkmate · fairness_threshold_remaining è l'outlier
sbagliata · root cause ipotesi modello pessimistico vs snapshot ·
fix: riallineare la soglia al predicato del guard, "fuori" solo se
il guard blocca · verify-before-fix confronto 3 modelli · poter
comprare non è il bug · GS-15 parte 1 claim non si tocca · counter
golden-session 14/16 fino a reopen verificato.

---

*ROBY · Strategic MKT & Comms & Community · GS-15 reopen soglia · 24 May 2026 · daje team a 4*
