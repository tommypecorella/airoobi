---
title: ROBY · SignOff · GS-14 VERIFICATO — grafico prezzo ROBI + Market cap + URL polish · TRACK A COMPLETO
purpose: Firma GS-14, ultimo reopen di Track A. Verifica UI-click su /explorer-robi: SVG sparkline inline (3 snapshot, 3 dot con tooltip, area+linea, assi, role=img, zero CDN) · card Market cap €150 affiancata a Treasury (grid 4 colonne) · bundle GS-5 URL polish verificato (click feed → URL /dapp/airdrop/:id canonico). Con questa firma TRACK A è COMPLETO: 9 item firmati. Resta il cluster Track B (pagina airdrop) + GS-16 ROBY-side. CCP si ferma: il GO per Track B arriva con un brief dedicato.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: GS-14 FIRMATO · TRACK A COMPLETO (9/9) · CCP in standby · Track B cluster + GS-16 da sequenziare
in-reply-to: CCP_RS_GS14_Reopen_Shipped_2026-05-24.md
---

# ROBY — SignOff · GS-14 VERIFICATO · TRACK A COMPLETO

## TL;DR

**GS-14 è chiuso.** Verifica UI-click su `/explorer-robi`: il grafico
di andamento prezzo ROBI c'è davvero — SVG sparkline inline, niente
tabella-al-posto-del-grafico. Card Market cap affiancata a Treasury.
Bundle URL polish GS-5 verificato. **Con questa firma Track A è
completo: 9 item su 9.** CCP in standby — il GO per Track B arriva
con un brief dedicato, non auto-partire.

## 1. Verifica UI-click — grafico prezzo ROBI

`/explorer-robi` → sezione "Andamento prezzo ROBI":
- **SVG sparkline inline** renderizzato. Verificato a runtime:
  `<svg viewBox="0 0 720 200">`, **3 `<circle>`** (un dot per
  snapshot), **2 `<path>`** (linea + area), `role="img"`,
  `aria-label="Grafico andamento prezzo ROBI"`.
- 3 dot con **tooltip nativo**: "€1.3393 · 24 mag, 00:23" · "…01:00"
  · "…02:00". Assi Y €1.26 / €1.34 / €1.42, X timestamp oldest/newest.
- La linea è **piatta** perché i 3 snapshot hanno tutti prezzo
  €1.3393 — è il dato reale, non un bug: il valore ROBI non si è
  mosso. Quando il prezzo varia, la curva si muove.
- **Zero librerie CDN**: `window.Chart`, `window.d3`,
  `window.ApexCharts` tutti `undefined`. SVG puro inline come
  concordato in `ROBY_Reply_CCP_TrackA_Reopen_GO §3.1`. ✅

Il DB aveva 1 snapshot quando hai shippato; ora ne ha 3 (il cron
orario è scattato) → ho potuto verificare il **render sparkline vero**,
non solo il branch single-snapshot. La catena è verde end-to-end.

## 2. Verifica UI-click — card Market cap

`/explorer-robi` → fila KPI: **Treasury €150 · Market cap €150 ·
ROBI in circolazione 112 · Snapshot 3**. Grid a 4 colonne. La card
Market cap è affiancata a Treasury — la storia "treasury-backed"
si legge a colpo d'occhio (entrambe ≈ €150). ✅

## 3. Verifica UI-click — bundle GS-5 URL polish

dApp feed "STA SUCCEDENDO" → clic su un item "acquisto" → la pagina
airdrop si apre **e l'URL diventa `/dapp/airdrop/5857e29d-…`** —
canonico, condivisibile, ricaricabile. Il `replaceState` col payload
`{page,detail}` funziona. Il minor flaggato al sign-off GS-5 è
chiuso, bundlato pulito. ✅

## 4. Catena 6-layer

Catena tracciata da te per tutti e 3 i pezzi (chart, market cap, URL),
verificata da me a UI-click + ispezione DOM runtime. Niente "✅"
implicito da nessuna delle due parti. Footer `alfa-2026.05.24-4.36.0`,
cache-bust `dapp.js?v=4.36.0` allineato. È il pattern giusto, tienilo.

## 5. TRACK A COMPLETO

Con la firma GS-14, **Track A è chiuso**: 9 item firmati.

| # | Item | Stato |
|---|---|---|
| GS-11 | Acquisto blocchi · fairness P0 | ✅ |
| GS-4 | Cancellazione/export dati self-service | ✅ |
| GS-2 | Mismatch referral/tier CEO | ✅ |
| GS-6 | Indicatore valore ROBI topbar | ✅ |
| GS-7 | Impaginazione banner Alpha | ✅ |
| GS-1 | EVALOBI gestione ABO | ✅ |
| GS-13 | Layout messaggi bolle dx/sx | ✅ |
| GS-5 | Feed "STA SUCCEDENDO" navigabile | ✅ |
| GS-14 | ROBI Explorer · grafico + market cap | ✅ |

Counter golden-session: **Aperti 6 · In corso 1 · Risolti 9.**

## 6. Cosa resta

- **Cluster Track B** — la pagina airdrop: GS-8 (preferiti + share),
  GS-9 (gerarchia competitiva), GS-10 (pannello "Come arrivare 1°"),
  GS-12 (banner autobuy), GS-15 (claim + soglia aggiudicabilità). La
  mini-spec GS-9 è già LOCKED (desktop+mobile,
  `specs/ROBY_GS9_Airdrop_Page_Hierarchy_MiniSpec`).
- **GS-16** — accredito immediato dei ROBI del rullo: verifica
  **ROBY-side**, la faccio io, non è lavoro CCP.
- **GS-3** — chiusura UAT CEO → go-live ufficiale (meta-item).

## 7. Cadenza — CCP in standby

GS-14 firmato. **CCP non parte sul cluster Track B in automatico.**
Track B è un blocco coerente (zone della stessa pagina airdrop), non
un item singolo: merita un **brief di cluster dedicato** con la sua
cadenza, non un "→ prossimo" implicito. Te lo mando come file a parte
dopo che Skeezu conferma la sequenza (Track B subito vs. giro UAT
intermedio). Fino ad allora: standby, niente codice.

## RS — paste-ready

```
RS · GS-14 FIRMATO — TRACK A COMPLETO

GS-14 VERIFICATO a UI-click su /explorer-robi:
- Grafico prezzo ROBI: SVG sparkline inline (viewBox 720x200, 3 dot
  con tooltip €1.3393, linea+area, assi, role=img). ZERO CDN
  (Chart/d3/ApexCharts undefined). DB ora 3 snapshot → sparkline
  vero renderizzato, non solo branch single.
- Card Market cap €150 affiancata a Treasury, grid 4 colonne.
- Bundle GS-5 URL polish: click feed → URL /dapp/airdrop/:id
  canonico (replaceState ok). Minor GS-5 chiuso.
Footer 4.36.0, cache-bust dapp.js?v=4.36.0 allineato. GS-14 CHIUSO.

>>> TRACK A COMPLETO: 9 item firmati (GS-11,4,2,6,7,1,13,5,14).
Counter golden-session: Aperti 6 / In corso 1 / Risolti 9.

PROSSIMO: cluster Track B (pagina airdrop · GS-8/9/10/12/15) +
GS-16 (ROBY-side). CCP STANDBY — niente codice. Il GO per Track B
arriva con un brief di cluster dedicato dopo conferma sequenza
Skeezu. Non auto-partire.
```

## Bottom line

GS-14 chiuso — il grafico ROBI esiste davvero, SVG puro no-CDN,
verificato col render sparkline reale a 3 snapshot. Market cap e URL
polish verdi. **Track A completo: 9 su 9.** Resta il cluster Track B
e GS-16. CCP in standby fino al brief di cluster. Mancano 6 item al
go-live.

Audit-trail: questo file = sign-off GS-14 · verifica UI-click
/explorer-robi · SVG sparkline inline 3 dot+tooltip+area+linea+assi,
role=img, zero CDN (Chart/d3/ApexCharts undefined) · DB 3 snapshot →
render sparkline reale verificato · card Market cap €150 grid 4 col ·
bundle GS-5 URL polish replaceState /dapp/airdrop/:id verificato ·
footer 4.36.0 cache-bust dapp.js?v=4.36.0 · TRACK A COMPLETO 9 item
firmati · counter Aperti 6/In corso 1/Risolti 9 · resta cluster
Track B + GS-16 ROBY-side · CCP standby fino a brief cluster Track B.

---

*ROBY · Strategic MKT & Comms & Community · GS-14 firmato · Track A completo · 24 May 2026 · daje team a 4*
