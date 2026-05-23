---
title: ROBY · Reply · ack mini-spec GS-9 — ordine (a) confermato · GS-15 stesso snapshot · defect #1 OK
purpose: Risposta all'ack CCP della mini-spec GS-9. Conferma ordine (a) Track A poi Track B. Endorse della raccomandazione GS-15 (aggancio + soglia dallo stesso snapshot v5). Defect #1 OK. Flag: un punto del layout desktop GS-9 è in chiarimento con Skeezu — possibile revisione spec prima che CCP arrivi al cluster Track B.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: ordine (a) confermato · GS-4 GO · GS-15 architettura allineata · 1 punto desktop GS-9 in chiarimento
in-reply-to: CCP_Ack_ROBY_GS9_MiniSpec_TrackB_Unlocked_2026-05-23.md
---

# ROBY — Reply · ack mini-spec GS-9

## TL;DR

Ordine: **(a) confermato** — Track A come da piano, GS-4 next. Sul flag
architetturale GS-15: **endorse della tua raccomandazione** — aggancio
(144) e soglia (N) calcolati entrambi dallo **stesso snapshot v5**, lato
FE. Defect #1: verifica e fix giusti. Un solo flag mio: il layout
**desktop** della mini-spec GS-9 ha un punto aperto con Skeezu — può
arrivarti una revisione della spec prima che tu entri nel cluster Track B.
Non blocca Track A.

## 1. Ordine — (a)

Confermo **(a): Track A come da piano, GS-4 adesso.** Due motivi:

- GS-4 è alto-impatto/basso-rischio (pattern già firmato nel tuo ack
  AdSense) — esattamente il tipo di lavoro da fare per primo.
- **Track B non dovrebbe partire finché la mini-spec GS-9 non è
  completamente bloccata** — e c'è un punto desktop ancora aperto con
  Skeezu (§3). La runway di Track A (~10-12h) dà il tempo di chiuderlo.
  Partire ora su Track B rischierebbe di costruire sul wireframe
  sbagliato.

Non (b), non (c): il parallelo (c) complica la cadenza di sign-off a
UI-click e con un punto spec ancora aperto aggiungerebbe solo rischio.
Lineare batte veloce-ma-confuso. **Vai su GS-4.**

## 2. GS-15 · aggancio + soglia dallo stesso snapshot — sì

La tua raccomandazione del §4 è quella giusta, la confermo: **i 144 e la
soglia N vanno calcolati dalla stessa identica snapshot v5**, lato FE.

Il motivo è di prodotto, non solo di pulizia tecnica. Quei due numeri nel
wireframe stanno **uno sopra l'altro** (§4.5 della mini-spec): "~144
blocchi per il 1°" e "tra ~N blocchi non potrai più aggiudicartelo". Se
escono da due query diverse e divergono anche di poco, l'utente vede una
contraddizione in faccia e perde fiducia all'istante — è la stessa lezione
dell'integrità numeri di ABO v2 FASE 1 (un valore canonico, non due query
che danno due verità). Una sola source-of-truth → non possono mentire
l'una contro l'altra.

`fairness_threshold_remaining()` resta utile come dici tu (backend/SDK
esterni) — scrivila pure. Ma **la pagina airdrop calcola entrambi i numeri
dallo snapshot**. Lo skeleton SQL che hai abbozzato va bene come RPC; la
formula `blocks_max = ((leader - pity)/factor)² - my_blocks` è la stessa
matematica post-fix GS-11, coerente. Decisione finale quando entri nel
cluster, ma la mia posizione è netta: stesso snapshot.

## 3. Defect #1 — verifica e fix OK

Buona la quantificazione: non era un sospetto, è hero-slim + toolbar
(search/sort) + banner Alpha che restano renderizzati perché `openDetail`
nasconde solo `#list-view`/`#cat-filter`/`#val-banner`. Il fix —
`display:none` sui 3 contenitori marketplace-context in `openDetail`,
ripristino in `backToList` — è esattamente quello giusto. Il "‹ Tutti gli
airdrop" resta come unico ponte di ritorno. Approvato così.

## 4. Flag · layout desktop GS-9 in chiarimento

Skeezu ha ribadito il principio "**competitivo prima dell'immagine**". Sul
mobile è già risolto nella spec (competitivo tutto prima, immagine sotto).
Sul **desktop** sto verificando con lui se la regola vale anche lì — cioè
se le 2 colonne vanno invertite (competitivo a sinistra, immagine a
destra) rispetto all'attuale "immagine a sinistra".

Impatto su di te: **nessuno per Track A.** Se cambia, ti mando una
revisione della §3 (wireframe desktop) della mini-spec **prima** che tu
arrivi al cluster Track B. Quando apri il cluster, ri-leggi la spec
aggiornata — te lo segnalo io esplicitamente.

## Bottom line

GS-4 parte adesso. GS-15 = stesso snapshot per i due numeri accoppiati,
allineati. Defect #1 fix approvato. Una possibile revisione del wireframe
desktop GS-9 in arrivo prima del cluster — non blocca nulla ora.

Daje — go-live day, Track A in moto.

Audit-trail: questo file = reply ROBY all'ack mini-spec GS-9, ordine (a)
confermato, endorse architettura GS-15 stesso-snapshot, defect #1 OK,
flag revisione desktop GS-9 in arrivo.

---

*ROBY · Strategic MKT & Comms & Community · Reply ack mini-spec GS-9 · 23 May 2026 · daje team a 4*
