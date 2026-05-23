---
title: ROBY · Mini-spec · gerarchia pagina airdrop (GS-9) — competitivo above-the-fold
purpose: Spec di gerarchia per /dapp/airdrop/:id. Definisce cosa va above-the-fold (la parte competitiva e ingaggiante) e cosa scende in seconda importanza. È la spec che sblocca il cluster Track B — GS-8 / GS-10 / GS-12 / GS-15 trovano qui la loro collocazione. DRAFT per revisione Skeezu prima del relay a CCP.
date: Sab 23 maggio 2026
audience: Skeezu (review) → poi CCP
status: FINALIZZATA · revisione Skeezu OK (mobile: competitivo prima dell'immagine) · pronta per CCP
related: GOLDEN-SESSION_2026-05-23.md (GS-8 · GS-9 · GS-10 · GS-12 · GS-15)
---

# Mini-spec · gerarchia pagina airdrop (GS-9)

## 1. Il problema, oggi

La pagina `/dapp/airdrop/:id` (verificata live su Fontanella) ha due
difetti di gerarchia:

1. **Apre sul contesto sbagliato.** Entrando in un airdrop si vede prima
   tutta la *lista* marketplace — header "Marketplace airdrop", ricerca,
   filtro categoria, banner Alpha — e solo *sotto*, dopo un "‹ Tutti gli
   airdrop", comincia il dettaglio. L'utente entra in un airdrop e non
   vede l'airdrop.
2. **La parte competitiva è sepolta.** Quando il dettaglio finalmente
   parte, guida con immagine + descrizione. Fase dell'airdrop, blocchi
   mancanti, posizione dell'utente, "quanti blocchi per il 1°" — tutto
   esiste ma è sparso più in basso. Il dato che dovrebbe agganciare
   ("puoi essere il primo") arriva dopo lo scroll.

GS-9 chiede di ribaltare: **appena entri, in primo piano la parte
competitiva e ingaggiante.** Immagine a sinistra (confermato), tutto il
resto descrittivo in seconda battuta.

## 2. Principio guida

> **Above-the-fold = la corsa.** Sotto = la scheda prodotto.

Chi apre un airdrop deve capire in 3 secondi, senza scrollare: *in che
fase è, quanti blocchi mancano, dove sono io, cosa mi serve per essere
primo, quanto tempo/spazio ho prima che sia troppo tardi.* La descrizione
dell'oggetto, le specifiche, lo storico — sono importanti ma vengono
**dopo**: chi vuole approfondire scrolla.

Correzione del difetto #1: la pagina dettaglio deve **aprirsi sul
dettaglio**. Il "‹ Tutti gli airdrop" come link di ritorno basta — la
lista marketplace completa non va renderizzata sopra.

## 3. Wireframe — desktop (2 colonne)

```
┌──────────────────────────────────────────────────────────────────┐
│  ⚡ AUTO-BUY ATTIVO · sta comprando per te · [gestisci]   (GS-12)  │  ← solo se attivo
├───────────────────────────┬──────────────────────────────────────┤
│                           │  ‹ Tutti gli airdrop                  │
│                           │                                       │
│                           │  AIRDROP · Computer        ♡   ⤴      │  ← GS-8
│                           │  Fontanella smart per animali         │
│         IMMAGINE          │                                       │
│         carosello         │  ● ATTIVO · scade tra 2g 4h           │  ← FASE
│      sempre a sinistra    │                                       │
│         (GS-9 OK)         │  ┌─────────────────────────────────┐  │
│                           │  │ La tua posizione   2°   ▲       │  │  ← COMPETITIVO
│                           │  │ Blocchi venduti    156 / 405    │  │
│                           │  │ Liberi             249          │  │
│                           │  └─────────────────────────────────┘  │
│                           │                                       │
│                           │  ► ~144 blocchi per arrivare 1°        │  ← AGGANCIO
│                           │  ⚠ Tra ~N blocchi venduti ad altri     │  ← GS-15
│                           │     non potrai più aggiudicartelo      │
│                           │                                       │
│                           │  ┌───── ACQUISTA BLOCCHI ──────────┐   │  ← AZIONE
│                           │  │ slider · 1 blocco = 20 ARIA      │   │
│                           │  │ [ ACQUISTA BLOCCHI ]             │   │
│                           │  └──────────────────────────────────┘  │
│                           │                                       │
│                           │  ◎ Come arrivare 1°          [A]  ⌄    │  ← GS-10
│                           │    Tuo punteggio · 2°                  │     A visibile
│                           │    └─ [B · dettaglio scoring] chiuso   │     B collassato
└───────────────────────────┴──────────────────────────────────────┘
   ════════════ fine above-the-fold · sotto = seconda importanza ════
   • Descrizione completa dell'oggetto
   • Specifiche · "Ogni blocco ti fa guadagnare ROBI"
   • LE TUE STATISTICHE (ROBI che guadagni · % blocchi · presale/sale)
   • Storico acquisti
   • AUTO-BUY — configurazione (blocchi · intervallo · max)
   • "Hai un oggetto di valore?" → FAI VALUTARE
```

## 4. Zona per zona

### 4.1 · Banner AUTO-BUY attivo (GS-12)
Striscia sottile **on-top**, piena larghezza, visibile **solo quando
l'auto-buy è attivo** su un airdrop. Ricorda all'utente che qualcosa sta
spendendo ARIA per lui + link rapido a gestirlo/disattivarlo. Il toggle di
attivazione resta dov'è (config in fondo, §4.8) — qui c'è solo lo *stato*.

### 4.2 · Header airdrop — categoria, preferiti, condividi (GS-8)
Riga compatta sopra il titolo: badge `AIRDROP · <categoria>` a sinistra,
e a destra **due icone coerenti con la card in vetrina**:
- **♡ Preferiti** — cuore su sfondo **chiaro** col cuore visibile (oggi è
  un cerchio scuro: sbagliato). Pieno/vuoto a seconda dello stato.
- **⤴ Condividi** — stessa identica grafica del cuore, accanto. Oggi
  manca del tutto sulla pagina dettaglio.

### 4.3 · Titolo + Fase
Titolo dell'oggetto, e subito sotto un **chip di fase** leggibile a colpo
d'occhio:
- `● PRESALE · apre tra …`
- `● ATTIVO · scade tra 2g 4h`
- `● IN CHIUSURA · ultime ore`
- `● CONCLUSO`
Il chip risponde al "non si capisce in che fase siamo" di GS-9.

### 4.4 · Box competitivo — posizione + blocchi
Il cuore di GS-9. Tre dati, grandi e immediati:
- **La tua posizione** — es. `2°`, con **freccia di trend** (sali / scendi
  rispetto all'ultimo controllo).
- **Blocchi venduti** — `156 / 405`.
- **Liberi** — `249`.
Risponde a "quanti blocchi mancano, che posizione hai".

### 4.5 · Aggancio — "blocchi per il 1°" + soglia (GS-15)
Due righe accoppiate, una sopra l'altra:
- **`► ~144 blocchi per arrivare 1°`** — l'hint esistente
  (`airdrop.js:972`, già calcolato sul remaining corretto), promosso
  above-the-fold. È la promessa: "ti dico esattamente cosa ti serve".
- **`⚠ Tra ~N blocchi venduti ad altri non potrai più aggiudicartelo`** —
  GS-15. La soglia: il countdown onesto. Il dato esce da
  `fairness_threshold_remaining()` (la funzione che CCP terrà a GS-15).
Le due righe insieme = la "corsa in salita": vedi quanto ti manca *e*
quanto tempo-spazio hai prima che la salita diventi impossibile.

> *Nota per GS-15 (lato ROBY/CCP):* il box dovrà distinguere
> impossibilità **matematica** ("~N blocchi e sei fuori") da fattibilità
> **economica** ("ti servono ~144 blocchi = ~2.880 ARIA, ne hai 925").
> Sono due informazioni diverse — la mini-spec di GS-15 le dettaglia.
> Qui basta che il posto per entrambe sia previsto.

### 4.6 · Azione — pannello acquisto
Il pannello "METTI DA PARTE I TUOI ARIA" (slider + ACQUISTA BLOCCHI)
**resta above-the-fold**: la pagina serve a competere, e competere = farsi
blocchi. Dopo aver visto posizione e soglia, l'utente ha l'azione subito
sotto, senza scrollare.

### 4.7 · "Come arrivare 1°" — A visibile, B collassabile (GS-10)
- **Blocco A** sempre visibile: header `◎ Come arrivare 1°` + riga `Tuo
  punteggio · 2°`. Da solo è informazione sufficiente.
- **Blocco B** collassato di default: dettaglio scoring (blocchi correnti,
  contributo a radice, moltiplicatore fedeltà, boost di garanzia, stima
  blocchi, nota ROBI del rullo).
- Clic su A → espande B; clic di nuovo su A → richiude. Default: B chiuso.

### 4.8 · Sotto la piega — seconda importanza
In quest'ordine: descrizione completa dell'oggetto · specifiche e nota
"ogni blocco ti fa guadagnare ROBI" · LE TUE STATISTICHE · Storico
acquisti · **AUTO-BUY configurazione** (blocchi/intervallo/max + attiva) ·
CTA "Hai un oggetto di valore? → FAI VALUTARE". Nulla di rimosso —
solo spostato dove va chi vuole approfondire.

## 5. Mobile (colonna singola)

Ordine dall'alto — **tutto il competitivo prima dell'immagine** (direttiva
Skeezu 23 May):

banner auto-buy (se attivo) → categoria + ♡/⤴ → titolo + chip fase → box
competitivo (posizione/blocchi) → aggancio + soglia → **ACQUISTA BLOCCHI** →
"Come arrivare 1°" (A visibile, B chiuso) → **immagine** (carosello) →
tutto il resto §4.8.

Il blocco competitivo non viene **mai** spezzato dall'immagine: sul
telefono l'utente vede prima dove sta, cosa gli serve e l'azione; la foto
dell'oggetto arriva subito dopo, prima della descrizione lunga.

## 6. Cosa NON cambia

- Immagine a sinistra su desktop — confermato da Skeezu, resta.
- Nessun dato rimosso: descrizione, statistiche, storico, auto-buy
  config, CTA valutazione — tutto resta, solo ricollocato.
- Slogan, voce, brand: invariati.
- La logica di scoring/fairness: invariata (GS-11 già chiuso).

## 7. Come sblocca il cluster Track B

Questa gerarchia è la cornice in cui CCP incastra gli altri 4 item in
un'unica passata:
- **GS-8** → §4.2 (♡ + ⤴ nell'header).
- **GS-10** → §4.7 (pannello A/B).
- **GS-12** → §4.1 (banner on-top).
- **GS-15** → §4.5 (riga soglia; il calcolo è la funzione che CCP ha già
  taggato, `fairness_threshold_remaining()`).

Con questa spec approvata, il Track B parte. La copy/claim della "corsa in
salita" (GS-15 parte 1) la consegno a parte come deliverable ROBY.

## 8. RS — per CCP

```
RS · GS-9 mini-spec gerarchia pagina airdrop — Track B sbloccato

Questa è la mini-spec GS-9 che il RS batch 2 dava come gating del
cluster Track B. Con questa, GS-8 / GS-9 / GS-10 / GS-12 / GS-15 si
fanno in UNA passata su /dapp/airdrop/:id.

Principio: above-the-fold = competitivo, sotto = scheda prodotto.

Da fare:
- La pagina dettaglio si apre SUL dettaglio (oggi renderizza la lista
  marketplace sopra — va tolta, basta il link "‹ Tutti gli airdrop").
- Colonna destra above-the-fold, in quest'ordine: categoria + ♡/⤴
  (GS-8) → titolo + chip fase → box competitivo (posizione+trend /
  blocchi venduti / liberi) → "~X blocchi per il 1°" + riga soglia
  (GS-15) → pannello ACQUISTA BLOCCHI → "Come arrivare 1°" A/B (GS-10).
- Immagine a sinistra su desktop (confermato).
- Banner AUTO-BUY attivo on-top (GS-12), solo quando attivo.
- Sotto la piega: descrizione, statistiche, storico, config auto-buy,
  CTA valutazione — niente rimosso, solo ricollocato.
- Mobile: tutto il competitivo (fino ad ACQUISTA + "Come arrivare 1°")
  PRIMA dell'immagine. Il competitivo non si spezza mai.

GS-15 calcolo soglia → fairness_threshold_remaining() come già taggato.
La copy/claim "corsa in salita" (GS-15 parte 1) la consegna ROBY a parte.
Ad ogni consegna ROBY ri-verifica a UI-click.
```

---

*ROBY · Strategic MKT & Comms & Community · Mini-spec gerarchia pagina airdrop (GS-9) · DRAFT · 23 May 2026 · daje team a 4*
