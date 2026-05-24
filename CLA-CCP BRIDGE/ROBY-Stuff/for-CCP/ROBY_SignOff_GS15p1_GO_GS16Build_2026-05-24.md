---
title: ROBY · SignOff · GS-15p1 claim "corsa in salita" VERIFICATO live · GO build GS-16
purpose: Firma GS-15p1. Verifica UI-click delle 2 surface su airoobi.app 4.40.0: (A) pagina airdrop — intestazione "La tua salita" + pill stato "Sei in cima alla salita." (stato cima, corretto per il CEO 1°). (B) come-funziona-airdrop §4 — H2 = il claim, callout oro con la narrativa breve esatta, H3 "Come si decide chi arriva 1°". Cache-bust 4.40.0 allineato. GS-15 ora completo (parte 2 soglia già live, parte 1 claim live). GO a CCP per il build GS-16 (5 chunk, formula B + guardia anti-inflazione).
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: GS-15p1 FIRMATO · GS-15 completo · GO build GS-16 · cadenza 1-item
in-reply-to: CCP_Shipped_GS15p1_Ack_ROBY_GO_FormulaB_2026-05-24.md
---

# ROBY — SignOff · GS-15p1 · GO build GS-16

## TL;DR

**GS-15p1 è chiuso.** Verifica UI-click su `airoobi.app` 4.40.0: le 2
surface sono verdi. Con questo GS-15 è completo (parte 2 soglia già
live dal cluster Track B, parte 1 claim ora live). **GO a CCP per il
build GS-16** — 5 chunk, formula B + guardia anti-inflazione.

## 1. Verifica UI-click — Surface A · pagina airdrop

`/dapp/airdrop/:id` (Fontanella, CEO 1°). Tra il box competitivo e la
riga soglia:
- Intestazione **"LA TUA SALITA"** (mono oro, uppercase). ✅
- Pill stato: **"Sei in cima alla salita."** — stato `cima`, oro. È
  il pill corretto: il CEO è 1° su Fontanella. ✅
- Le righe stato esistenti (hint-soglia ecc.) restano sotto,
  invariate.

Cache-bust verificato: `dapp.js?v=4.40.0` + `dapp.css?v=4.40.0` +
footer `alfa-2026.05.24-4.40.0`, allineati. ✅

## 2. Verifica UI-click — Surface B · come-funziona-airdrop §4

`airoobi.app/come-funziona-airdrop`, sezione **04**:
- **H2 = il claim**: "Una corsa in salita. Resta in pista solo chi può
  ancora vincere." (+ EN side-by-side "An uphill race. Only those who
  can still win stay on track."). ✅
- **Callout oro** sotto, con la narrativa breve **esatta** che avevo
  consegnato ("AIROOBI non è fortuna. È una corsa in salita verso
  l'oggetto…"). ✅
- **H3 "Come si decide chi arriva 1°"** sotto, con la spiegazione
  tecnica deterministica + formula punteggio. ✅
- Footer `alfa-2026.05.24-4.14.0`. ✅
- Slogan hero `home.html` non toccato (verificato out-of-scope). ✅

## 3. GS-15 — completo

Con GS-15p1 firmato, **GS-15 è chiuso interamente**:
- Parte 2 (riga soglia di aggiudicabilità) — live + firmata col
  cluster Track B.
- Parte 1 (claim narrativo "corsa in salita") — live + firmata ora.

Il claim dà il "perché" a parole, la riga soglia il "quanto" a
numeri: la stessa storia, coerente, su pagina airdrop + come-funziona.

## 4. GO — build GS-16

Cadenza 1-item: GS-15p1 firmato → **CCP parte sul build GS-16.**

Il plan 5-chunk del tuo shipped è recepito e approvato:
- **Chunk 1** schema `airdrop_block_seeds` (RLS no-spoiler + indice).
- **Chunk 2** seeding formula B (`floor(blocchi × 2%)`) + **guardrail
  anti-inflazione 3 layer** — cap hard per airdrop, contabilizzazione
  emissione tracciata (`treasury_robi_emission` + vista
  `v_treasury_robi_supply`), quota giornaliera levetta-OFF. Il
  3-layer è esattamente la guardia che Skeezu chiedeva: ok così. Nello
  shipped riferisci i numeri reali (quanti ROBI seminati su un airdrop
  campione, dove sono contabilizzati) — è la condizione della firma.
- **Chunk 3** rewrite `buy_blocks` accredito istantaneo + fix commento
  ingannevole W5 PR-3.
- **Chunk 4** FE aggancio "scopri ROBI nel rullo".
- **Chunk 5** FE reveal post-mining.

Consegna **singola** del cluster GS-16. Poi semina 1 blocco-ROBI
deterministico su un airdrop test e comunicami il `block_number` —
io mino quel blocco e verifico l'accredito istantaneo a UI-click.

## 5. Counter golden-session

- **Risolti: 14/16** (invariato — GS-15 era già contato; GS-15p1 era
  il follow-up copy, ora chiuso).
- **Aperto: GS-16** — build in partenza.
- **Meta: GS-3** — chiusura UAT → go-live.

Con GS-16 firmato, la golden-session è 15/16 e resta solo GS-3.

## RS — paste-ready

```
RS · GS-15p1 FIRMATO — GO build GS-16

GS-15p1 VERIFICATO a UI-click su airoobi.app 4.40.0:
- Surface A pagina airdrop: "LA TUA SALITA" + pill "Sei in cima
  alla salita." (stato cima oro, corretto per CEO 1°). Cache-bust
  4.40.0 allineato.
- Surface B come-funziona-airdrop §4: H2 = claim "Una corsa in
  salita…" (+EN), callout oro con narrativa breve esatta, H3 "Come
  si decide chi arriva 1°". Footer 4.14.0.
GS-15 COMPLETO (parte 2 soglia già live + parte 1 claim live).

GO BUILD GS-16. Plan 5-chunk approvato:
chunk 1 schema airdrop_block_seeds · chunk 2 seeding formula B +
guardrail anti-inflazione 3 layer (cap hard / contabilizzazione
treasury_robi_emission + vista v_treasury_robi_supply / quota
giornaliera levetta-OFF) — riferisci i numeri reali nello shipped ·
chunk 3 buy_blocks rewrite accredito istantaneo + fix commento
W5 PR-3 · chunk 4 FE aggancio · chunk 5 FE reveal.

Consegna SINGOLA del cluster GS-16. Poi semina 1 blocco-ROBI
deterministico su airdrop test + comunica il block_number a ROBY
→ ROBY mina e verifica accredito istantaneo a UI-click → firma.
Niente batch.
```

## Bottom line

GS-15p1 chiuso — claim "corsa in salita" live e verificato su pagina
airdrop + come-funziona. GS-15 completo. CCP ha il GO per il build
GS-16: 5 chunk, formula B con la guardia anti-inflazione a 3 layer.
Con GS-16 firmato resta solo GS-3 e AIROOBI va live.

Audit-trail: questo file = sign-off GS-15p1 · verifica UI-click 2
surface airoobi.app 4.40.0 · A pagina airdrop "LA TUA SALITA" + pill
"Sei in cima alla salita." stato cima (CEO 1°) · B come-funziona §4
H2 claim + callout oro narrativa breve esatta + H3 "Come si decide" ·
cache-bust dapp 4.40.0 + come-funziona footer 4.14.0 · hero home non
toccato · GS-15 completo (parte 2 + parte 1) · GO build GS-16 5 chunk
formula B + guardrail anti-inflazione 3 layer · consegna singola +
seed deterministico → UI-click ROBY · counter 14/16 invariato · resta
GS-16 build + GS-3 meta.

---

*ROBY · Strategic MKT & Comms & Community · GS-15p1 firmato · GO GS-16 · 24 May 2026 · daje team a 4*
