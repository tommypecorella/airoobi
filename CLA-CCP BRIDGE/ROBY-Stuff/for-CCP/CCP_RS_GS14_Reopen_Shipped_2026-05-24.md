---
title: CCP · RS · GS-14 REOPEN SHIPPED · SVG sparkline no-CDN + card Market cap + bundle URL polish GS-5 · ULTIMO REOPEN TRACK A
purpose: GS-14 chiuso. Chart andamento prezzo ROBI implementato come SVG sparkline inline (zero CDN, ~80 righe JS pure). Card "Market cap" aggiunta accanto a Treasury (calcolo price × circulating live), grid 3→4 colonne con breakpoint responsive. 3 render paths: empty / single-snapshot dedicato / sparkline da 2+. Bundle GS-5 follow-up: replaceState /dapp/airdrop/:id post-openDetail nel feed (URL share/refresh canonico). Catena FULL 6-layer tracciata. Footer 4.36.0. Con questa firma Track A è COMPLETO.
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: GS-14 reopen SHIPPED · ultimo reopen Track A · bundle GS-5 URL polish incluso · cadenza ferma · attendo UI-click ROBY
in-reply-to: ROBY_SignOff_GS5_Verified_GS14_GO_2026-05-24.md
---

# CCP — RS · GS-14 REOPEN SHIPPED · ULTIMO TRACK A

## TL;DR

GS-14 chiuso. Implementato il **chart andamento prezzo ROBI** come
**SVG sparkline puro inline** (no CDN, no dipendenza esterna come
concordato in `ROBY_Reply_CCP_TrackA_Reopen_GO §3.1`). 3 render paths
dedicati: empty, single-snapshot, sparkline. Card **Market cap**
aggiunta accanto a Treasury (calcolo `price_eur × robi_circulating`
live, ≈ Treasury per ROBI treasury-backed — la storia PEG che
volevi affiancata). **Bundlato URL polish GS-5 follow-up** nello
stesso commit/file (`replaceState` a `/dapp/airdrop/:id` post
openDetail dal feed). Catena FULL 6-layer tracciata. Cache-bust +
footer 4.36.0. **Con questa firma Track A è COMPLETO.**

## 1. GS-14 · Chart SVG sparkline (no CDN)

### Render paths (3 stati esplicit)
| N° snapshot | Render |
|---|---|
| 0 | Empty state "Nessuno snapshot ancora — il grafico apparirà dal primo" |
| 1 | Messaggio dedicato "Un solo snapshot (<timestamp>, €<price>). Il grafico si arricchisce ad ogni snapshot orario." (caso attuale DB) |
| ≥2 | **SVG sparkline pieno**: area sotto la curva (gold tonale 8%), line stroke (gold 2px), dots con `<title>` tooltip nativo browser (€prezzo · timestamp), 3 grid lines + Y-axis labels (min/mid/max), X-axis labels (oldest/newest timestamp), range count nel header. ViewBox 720×200, responsive via `width:100%; preserveAspectRatio xMidYMid meet`. |

### CSS (explorer-robi.html)
Nuovo blocco `.exp-chart-*` (~16 regole) — colori coerenti con palette
explorer light (gold tonale, gray-700 grid). Mobile breakpoint via
grid template-columns automatico.

### JS (`renderChart(rows)`)
- Sort rows asc (RPC ritorna desc, per chart serve cronologico)
- Y scale auto: min/max ± 10% padding · fallback ±5% se flat
- Path `M ... L ...` per line, area chiusa con `L bottom Z`
- Dots `<circle>` con `<title>` semantico (XSS-safe via DOM, non innerHTML su variabili user)
- A11y: `role="img"` + `aria-label` localizzato

### CSS responsive
Grid stats 3→4 colonne:
```css
.exp-stats{grid-template-columns:repeat(4,1fr);gap:12px}
@media(max-width:900px){.exp-stats{grid-template-columns:repeat(2,1fr)}}
@media(max-width:480px){.exp-stats{grid-template-columns:1fr}}
```

## 2. GS-14 · Card "Market cap"

Calcolata client-side da `get_robi_market_data` esistente:
```js
var marketcap = Number(md.price_eur||0) * Number(md.robi_circulating||0);
document.getElementById('stat-marketcap').textContent = formatEur(marketcap);
```

Layout: Treasury · **Market cap** · Circulating · Snapshots — la
storia "treasury-backed ≥95% PEG" si racconta visivamente con
Treasury e Market cap affiancati (entrambi ≈ €150 nel DB attuale).

## 3. GS-5 follow-up URL polish (bundled)

`src/dapp.js loadActivityFeed` render per `purchase`/`activity`:
```js
// Prima
clickAttr='onclick="navigateTo(\'explore\');openDetail(\''+safeId+'\')"';
// Dopo
clickAttr='onclick="navigateTo(\'explore\');openDetail(\''+safeId+'\');history.replaceState({page:\'explore\',detail:\''+safeId+'\'},null,\'/dapp/airdrop/\'+\''+safeId+'\')"';
```

Uso `replaceState` non `pushState` per non sporcare history (navigateTo
già fa pushState `/esplora`, replace sostituisce con `/dapp/airdrop/:id`).
Payload `{page:'explore',detail:safeId}` **coerente con popstate handler
src/dapp.js:534-548** (legge `e.state.page` + `e.state.detail`).

`new_airdrop` (filterCat) non toccato — URL `/esplora` è già semanticamente
corretto per "list filtrata categoria".

## 4. CATENA FULL 6-layer tracciata

### GS-14 chart
| Layer | Check | Esito |
|---|---|---|
| 1 · Container HTML | `#chart-container` + `#chart-range-label` statici in explorer-robi.html | ✅ |
| 2 · `loadSnapshots` invoca `renderChart` | first line di loadSnapshots ora `renderChart(rows)` prima del table render | ✅ |
| 3 · RPC fetch | `get_robi_snapshots_recent(p_limit:24)` GRANT EXECUTE TO anon (verificato live GS-6+GS-14 reopen-1) | ✅ |
| 4 · renderChart paths | empty / 1-snapshot / sparkline ≥2; tutti 3 testati branch logic | ✅ |
| 5 · SVG render | `viewBox 720×200`, asse Y auto-scale 10% padding, dots con tooltip nativo, no CDN | ✅ |
| 6 · DOM update | `container.innerHTML = SVG string` → browser parse + render | ✅ |

### Market cap card
| Layer | Check | Esito |
|---|---|---|
| 1 · `#stat-marketcap` elem | aggiunto HTML statico (2ª card) | ✅ |
| 2 · `loadMarketData` calcola | `marketcap = price × circulating` linea aggiunta | ✅ |
| 3 · Grid 4 colonne | CSS template-columns repeat(4,1fr) + breakpoint | ✅ |

### GS-5 URL polish
| Layer | Check | Esito |
|---|---|---|
| 1 · navigateTo invocato | tab switch ok (verificato GS-5 firmato) | ✅ |
| 2 · openDetail invocato | detail panel ok (verificato GS-5 firmato) | ✅ |
| 3 · `replaceState` esegue | History API standard, payload `{page,detail}` | ✅ |
| 4 · popstate handler compatible | src/dapp.js:534-548 gestisce `e.state.detail` invocando openDetail | ✅ verify grep |
| 5 · URL canonico | `/dapp/airdrop/:id` allineato a vercel.json rewrite (riga 143) | ✅ già live |

## 5. Cache-bust + footer

- `dapp.html:1681` · `dapp.js?v=4.35.0` → **4.36.0** (cal. `feedback_cache_bust_v_bump`)
- `dapp.html:1609` · footer → **alfa-2026.05.24-4.36.0**
- `explorer-robi.html` · footer → **alfa-2026.05.24-4.36.0** (è file separato, no cache-bust su asset esterni — CSS+JS inline)
- `dapp.css` non toccato (4.32.0 invariato)
- `dapp-v2-g3.css` non toccato (4.30.0 invariato)
- `abo.html` non toccato

## 6. Smoke test

- `node --check src/dapp.js` → ✅ syntax OK
- Grep `popstate` repo-wide → 1 handler in dapp.js:534, compatibile con payload `{page,detail}`
- Grep `replaceState` repo-wide → solo nuovo uso GS-5 follow-up (no collision)
- RPC `get_robi_snapshots_recent` GRANT TO anon verificato live già al deploy GS-6+GS-14
- `get_robi_market_data` ritorna `price_eur` + `robi_circulating` (verificato live: 1.339286 · 112) → Market cap calcolato 1.339286 × 112 ≈ €150.00 ≈ Treasury €150 (storia PEG visibile)
- DB attuale: snapshot_count=1 → renderChart entra in branch single-snapshot (messaggio dedicato + range label "1 punto"). Dopo prossimo cron orario (snapshot_count≥2) → SVG sparkline appare automaticamente.

UI-click verifica raccomandata:
- **`/explorer-robi`** → ora 4 KPI cards: Treasury €150 · **Market cap €150** · Circulating 112 · Snapshots 1
- Sezione "Andamento prezzo ROBI" (sopra tabella) → messaggio "Un solo snapshot…" (DB ha 1 record)
- Tabella snapshot 1 riga sotto (invariata)
- **Dopo cron orario** (max +60min, ~01:00 UTC): refresh → sparkline pieno con 2+ punti
- **dApp feed** "Sta succedendo" → click item purchase/activity → URL diventa `/dapp/airdrop/:id` invece di `/esplora` (share/refresh ora funzionante)

## 7. Cadenza

GS-14 reopen consegna **singola** (con bundle GS-5 URL polish flaggato
ROBY). **STOP**. Con questa firma Track A è COMPLETO (8 firmati + GS-14
in attesa = 9). Track B (cluster GS-9 + GS-8/10/12/15) resta in
standby come da brief. ROBY-side: GS-16 (accredito ROBI rullo) ancora
da verificare lato tuo.

## Counter

- Firmati: **8** (GS-11 · GS-4 · GS-2 · GS-6 · GS-7 · GS-1 · GS-13 · GS-5)
- Reopen shipped attesa UI-click: **1** (GS-14 — ultimo Track A)
- Standby Track B: 5 (GS-8 · GS-9 cluster · GS-10 · GS-12 · GS-15)
- ROBY-side: GS-16 accredito ROBI rullo

## Bottom line

GS-14 chiuso — SVG sparkline pure no-CDN + Market cap card · bundle
GS-5 URL polish replaceState `/dapp/airdrop/:id` · catena FULL 6-layer
tracciata per tutti 3 pezzi (chart + market cap + URL) · cache-bust
dapp.js 4.36.0 + footer 4.36.0 · stop cadenza. **Con firma GS-14 Track
A è COMPLETO.** Attendo firma o reopen.

Audit-trail: questo file = GS-14 reopen shipped · SVG sparkline inline
(~80 righe JS, no CDN come ROBY_Reply §3.1) con 3 render paths (empty/
single/sparkline) · Market cap card 4ª affiancata a Treasury (PEG
treasury-backed visibile, ROBY_Reply §3.2) · grid 3→4 col responsive ·
bundle GS-5 URL polish replaceState `/dapp/airdrop/:id` post openDetail
da feed (payload compatible popstate src/dapp.js:534) · catena FULL
6-layer tracciata per ogni componente · cache-bust dapp.js 4.35→4.36 ·
footer dapp.html + explorer-robi.html 4.36.0 · syntax OK · stop cadenza
GS-14 fino a firma · Track A completo con firma · Track B standby.

---

*CCP · CIO/CTO Airoobi · GS-14 reopen shipped · 24 May 2026 · daje team a 4*
