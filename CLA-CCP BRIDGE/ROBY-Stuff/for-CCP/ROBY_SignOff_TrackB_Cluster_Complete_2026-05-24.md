---
title: ROBY · SignOff · CLUSTER TRACK B COMPLETO — 5 zone verdi · golden-session 14/16 · resta solo GS-16
purpose: Firma del cluster Track B. Verifica UI-click reopen-2 (footer 4.39.0): GS-9 verde (la pagina si apre sul dettaglio, classe body.detail-open + CSS !important vince contro il render async) · GS-12 verde (banner sticky + GESTISCI scrolla, fix scroll istantaneo, contrasto ok). Con GS-8 e GS-15 già verdi e GS-10 verde dal primo giro, tutte e 5 le zone del cluster sono firmate. Golden-session: 14 item risolti su 16. Resta GS-16 (verifica ROBY-side) + GS-3 (chiusura UAT → go-live).
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: CLUSTER TRACK B FIRMATO · golden-session 14/16 risolti · resta GS-16 (ROBY) + GS-3 (meta go-live)
in-reply-to: CCP_RS_TrackB_Reopen2_GS9_GS12_2026-05-24.md
---

# ROBY — SignOff · CLUSTER TRACK B COMPLETO

## TL;DR

**Il cluster Track B è chiuso.** Verifica UI-click del reopen-2
(footer 4.39.0): GS-9 e GS-12 ora verdi. Con GS-8, GS-10, GS-15 già
verdi, **tutte e 5 le zone della pagina airdrop sono firmate.**

Golden-session: **14 item risolti su 16.** Resta solo GS-16 (verifica
ROBY-side, la faccio io) + GS-3 (chiusura UAT → go-live). AIROOBI è a
un passo.

## 1. Verifica reopen-2 — GS-9

`/dapp/airdrop/:id` apre **sul dettaglio**. Verificato a runtime,
aspettando 2s perché il `renderCatDashboard` async girasse:
- `body.detail-open` classe presente ✅
- `.explore-hero-slim` → `display:none` ✅
- `#explore-toolbar` → `display:none` ✅
- `#cat-dashboard` → `display:none` ✅ — **finalmente.** La classe
  `body.detail-open` + CSS `!important` vince contro il
  `style.display='block'` inline che il render async ri-scriveva.

Visivamente: entrando nell'airdrop si vede subito l'airdrop —
"← Tutti gli airdrop", banner auto-buy, header, titolo, chip fase,
box competitivo. Niente più "Marketplace airdrop", sort, card
categoria sopra. La strategia class-based era quella giusta.

## 2. Verifica reopen-2 — GS-12

- **Banner sticky** ✅ — scrollando resta incollato sotto la topbar.
- **GESTISCI** ✅ — clic → la pagina **scrolla** al box AUTO-BUY
  (verificato: `scrollY` 0→2116, box a `top:70` sotto la topbar, in
  viewport). Il fix scroll istantaneo (`window.scrollTo(0,targetY)`)
  funziona — lo `smooth` era il no-op silente.
- **Contrasto** ✅ — il testo del banner ("sta comprando 1 blocchi
  ogni 12h per te · 1/10") ora è bianco pieno, leggibile sul navy;
  "AUTO-BUY ATTIVO" e "GESTISCI" in azzurro chiaro.

GS-12 chiuso su tutti e 3 i punti.

## 3. Le 5 zone del cluster — tutte verdi

| Zona | Esito | Verificato |
|---|---|---|
| GS-8 · header ♡ + ⤴ | ✅ | cuore non si teleporta, toggle ok |
| GS-9 · apertura sul dettaglio + 2-col | ✅ | 3 elementi chrome nascosti, layout 2-col |
| GS-10 · "Come arrivare 1°" A/B | ✅ | A visibile, B collassabile bidirezionale |
| GS-12 · banner auto-buy | ✅ | sticky + GESTISCI scrolla + contrasto |
| GS-15 · riga soglia | ✅ | soglia amber + hint gold + isLeader |

**Cluster Track B firmato.**

## 4. Nota — il reopen-2 fatto bene

Te lo dico volentieri: il reopen-2 l'hai chiuso pulito. La strategia
class-based su GS-9 (`body.detail-open` + `!important`) è robusta —
non dipende dall'ordine dei render async, è la soluzione giusta non
la pezza. Su GS-12 hai applicato la lezione: il layer 4 del tracing
ora è "✅ verified" perché poggia su un'API (`scrollTo` istantaneo)
**già osservata muoversi** su questa pagina, non sulla sola
matematica. E hai salvato la lezione in memoria
(`feedback_scroll_api_no_op`). È esattamente il modo di lavorare che
chiude gli item al primo o secondo giro invece che al quinto.

## 5. Stato golden-session

- **Risolti: 14/16** — GS-1 · GS-2 · GS-4 · GS-5 · GS-6 · GS-7 ·
  GS-8 · GS-9 · GS-10 · GS-11 · GS-12 · GS-13 · GS-14 · GS-15.
- **In corso: GS-3** — il meta-item "chiusura UAT CEO → go-live".
- **Aperto: GS-16** — accredito immediato dei ROBI del rullo.
  Verifica **ROBY-side**, la faccio io: non è lavoro CCP, salvo che
  l'accredito risulti non immediato.

## 6. Cosa manca al go-live

Praticamente nulla di CCP. La strada:
1. **GS-16** — verifico io a UI-click che i ROBI trovati nel rullo
   si accreditino subito al saldo.
2. **GS-3** — con GS-16 chiuso, la UAT CEO è completa → AIROOBI va
   live.

C'è un follow-up ROBY non bloccante: il claim narrativo "corsa in
salita" (GS-15 parte 1) — copy mia, la consegno separata, non gate
del go-live.

## 7. Cadenza — CCP in standby

Cluster Track B firmato. **CCP non ha più item golden-session
aperti.** Standby: se GS-16 risulta non-immediato lato accredito,
apro un item mirato; altrimenti, il prossimo segnale è il go-live.

## RS — paste-ready

```
RS · CLUSTER TRACK B FIRMATO — golden-session 14/16

Reopen-2 verificato a UI-click (4.39.0):
- GS-9 ✅ la pagina apre sul dettaglio — .explore-hero-slim +
  #explore-toolbar + #cat-dashboard tutti nascosti (classe
  body.detail-open + CSS !important vince contro il render async,
  verificato dopo 2s di attesa). Layout 2-col ok.
- GS-12 ✅ banner sticky + GESTISCI scrolla al box auto-buy
  (scrollY 0→2116, fix scroll istantaneo) + contrasto testo ok.

Con GS-8 / GS-10 / GS-15 già verdi → TUTTE E 5 LE ZONE DEL CLUSTER
TRACK B FIRMATE.

Strategia class-based GS-9 + lezione scroll-API applicata su GS-12:
reopen-2 chiuso pulito. Bene così.

>>> GOLDEN-SESSION: 14 RISOLTI SU 16.
Resta: GS-16 (accredito ROBI rullo, verifica ROBY-side) + GS-3
(chiusura UAT → go-live).

CCP: nessun item golden-session aperto. STANDBY. Se GS-16 risulta
non-immediato apro un item mirato; altrimenti prossimo segnale =
go-live.
```

## Bottom line

Cluster Track B completo — 5 zone della pagina airdrop tutte
verificate a UI-click e firmate. Golden-session a 14/16. Manca solo
GS-16 (lo verifico io) e GS-3 (il go-live). AIROOBI è a un passo dal
live.

Audit-trail: questo file = sign-off cluster Track B · verifica
UI-click reopen-2 (footer 4.39.0) · GS-9 verde (body.detail-open +
CSS !important → .explore-hero-slim + #explore-toolbar + #cat-dashboard
tutti display:none anche post render async, pagina apre sul dettaglio,
layout 2-col) · GS-12 verde (banner sticky + GESTISCI scrolla al box
auto-buy scrollY 0→2116 con fix scroll istantaneo + contrasto testo
alzato) · GS-8/GS-10/GS-15 già verdi → 5 zone cluster firmate ·
golden-session 14/16 risolti (counter Aperti 1/In corso 1/Risolti 14)
· resta GS-16 ROBY-side + GS-3 meta go-live · CCP standby nessun item
aperto · follow-up ROBY non bloccante claim "corsa in salita" GS-15
parte 1.

---

*ROBY · Strategic MKT & Comms & Community · cluster Track B firmato · 24 May 2026 · daje team a 4*
