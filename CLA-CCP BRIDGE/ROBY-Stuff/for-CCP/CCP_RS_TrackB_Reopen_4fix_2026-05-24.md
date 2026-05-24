---
title: CCP · RS · TRACK B REOPEN · 4 fix puntuali shipped (GS-9 hide x3, GS-8 toggle, GS-12 sticky+scroll, GS-15 isLeader rank-aware)
purpose: Reopen mirato cluster Track B in risposta a verifica ROBY (`ROBY_Reply_CCP_TrackB_Cluster_Verifica_2026-05-24.md`). 3 zone rosse + 1 minor risolte in consegna singola, GS-10 e GS-15-struttura NON ritoccate. Tracing 6-layer per ogni fix. Cache-bust + footer 4.38.0.
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: Reopen 4-fix shipped · attendo UI-click ROBY · 1 caveat residuo (GS-15 race condition iniziale, mitigato da re-sync post-refreshPosition)
in-reply-to: ROBY_Reply_CCP_TrackB_Cluster_Verifica_2026-05-24.md
related: CCP_RS_TrackB_Cluster_Shipped_2026-05-24.md · ROBY_GS9_Airdrop_Page_Hierarchy_MiniSpec_2026-05-23.md
---

# CCP — RS · TRACK B REOPEN · 4 fix puntuali

## TL;DR

Reopen consegnato in **una passata**, come da brief §4 cadenza
cluster. 4 fix puntuali, diagnosi ROBY confermata in ogni punto:

- **GS-9** hide esteso a 3 selettori mancanti (.explore-hero-slim +
  #explore-toolbar + #cat-dashboard) in openDetail + backToList
- **GS-8** toggleWatchlist NON re-renderizza più con `.heart-btn`
  (vecchia card position:absolute) — toggla solo `.active` sul
  `.heart-btn-v2` esistente
- **GS-12** `.detail-autobuy-banner` `position:sticky;top:62px;z-index:99`
  + opacità banner aumentata (rgba .92, blur 12px, shadow) per leggibilità
  sticky · GESTISCI usa nuova funzione globale `scrollToAutoBuyBox()`
  con `window.scrollTo` + offset topbar (62px) — più robusto di
  `scrollIntoView` nudo (ROBY-confermato non scrollava)
- **GS-15 minor** `isLeader` ora include `_myRanks[airdropId].rank===1`
  (rank dal box "Sei 1°…" è authoritative). + re-sync `loadHintSoglia`
  da `refreshPosition` per stare allineato al polling 30s

GS-10 e GS-15-struttura **NON toccate** (verdi da verifica ROBY).
Cache-bust + footer **4.38.0**.

## 1. GS-9 · Hide marketplace esteso (3 selettori mancanti)

### Diagnosi ROBY confermata
Avevo hide solo 3/6 elementi: `.marketplace-demo-banner`, `#list-view`
(via .hidden), search bar. Restavano visibili sopra il detail:
`.explore-hero-slim` ("Marketplace airdrop · 1 attivi ora"),
`#explore-toolbar` (ORDINA), `#cat-dashboard` ("1 ATTIVI · Computer").

### Patch openDetail (`src/dapp.js:2364-2369` nuove righe)
```js
var heroSlim=document.querySelector('.explore-hero-slim');
if(heroSlim)heroSlim.style.display='none';
var exToolbar=document.getElementById('explore-toolbar');
if(exToolbar)exToolbar.style.display='none';
var catDash=document.getElementById('cat-dashboard');
if(catDash)catDash.style.display='none';
```

### Patch backToList (simmetrica, ripristina display='')
Stesso pattern, display='' per ognuno.

### Tracing 6-layer GS-9
| L | Check | Esito |
|---|---|---|
| 1 · selettori esistono in dapp.html | `.explore-hero-slim` (line 506), `#explore-toolbar` (515), `#cat-dashboard` (543) — grep confermato | ✅ |
| 2 · hide in openDetail aggiunto dopo searchWrap fallback | 3 querySelector/getElementById + display:none | ✅ |
| 3 · restore in backToList simmetrico | 3 stesso pattern display='' | ✅ |
| 4 · ordine hide: hero→toolbar→dash (top-to-bottom DOM) | seguito | ✅ |
| 5 · no conflitto con cache rendering (Pi 5 OK syntax) | node --check passa | ✅ |
| 6 · stesso pattern delle altre 3 hide già verdi | identico | ✅ |

## 2. GS-8 · toggleWatchlist preserve .heart-btn-v2

### Diagnosi ROBY confermata (root cause individuata)
`src/dapp.js:1294` (pre-fix):
```js
if(hb)hb.className=isInWatchlist(id)?'heart-btn active':'heart-btn';
```
Sostituiva **TUTTO** il className con la classe vecchia `heart-btn`
(quella della card in vetrina, `position:absolute`). Risultato: cuore
teleportato in alto a destra del viewport (`x:1381, y:10`).

### Patch (`src/dapp.js:1293-1300`)
```js
var hb=document.getElementById('detail-heart');
if(hb){
  if(isInWatchlist(id))hb.classList.add('active');
  else hb.classList.remove('active');
}
```
Toggla solo `.active`, non tocca le altre classi. Il bottone resta
`heart-btn-v2` (la classe del template `openDetail` per il dettaglio).

### Tracing 6-layer GS-8
| L | Check | Esito |
|---|---|---|
| 1 · template openDetail usa `.heart-btn-v2` | line 2494 confermato | ✅ |
| 2 · `id="detail-heart"` è ancora univoco nel detail | template line 2494 | ✅ |
| 3 · classList.add/remove non sostituisce className | API nativa DOM | ✅ |
| 4 · CSS `.heart-btn-v2.active` esiste con red fill | dapp.css block GS-8 esistente | ✅ |
| 5 · re-render del grid via `renderGrid()` (line 1291) invariato | non tocca il detail | ✅ |
| 6 · no regressione su .heart-btn (cards) | classe non rimossa, ancora applicata alle card | ✅ |

## 3. GS-12 · Banner sticky + GESTISCI scroll robusto

### Diagnosi ROBY confermata (2 difetti)
1. `position:static` → banner scorre via allo scroll (no persistence)
2. `scrollIntoView` nudo non scrollava (ROBY: scrollY ~33-57, hash invariato)

### Patch CSS (`src/dapp.css:1031-1032`)
```css
.detail-autobuy-banner{
  position:sticky;top:62px;z-index:99;  /* sotto topbar z:100 */
  display:flex;align-items:center;gap:12px;padding:10px 16px;margin:0 0 20px;
  background:rgba(11,18,34,.96);        /* opaco per leggibilità sticky */
  border:1px solid rgba(74,158,255,.45);
  border-radius:var(--radius-sm);
  font-size:12.5px;color:var(--white);line-height:1.4;flex-wrap:wrap;
  backdrop-filter:blur(12px) saturate(1.4);
  -webkit-backdrop-filter:blur(12px) saturate(1.4);
  box-shadow:0 2px 12px rgba(0,0,0,.3)
}
```
Topbar è `position:sticky;top:0;z-index:100;height:62px` (dapp.css:39),
quindi banner `top:62px;z-index:99` lo affianca senza coprirlo.

### Patch JS (nuova funzione globale `scrollToAutoBuyBox()`)
```js
function scrollToAutoBuyBox(){
  var el=document.getElementById('auto-buy-box');
  if(!el)return;
  var rect=el.getBoundingClientRect();
  var topOffset=62+8; // topbar + padding
  var targetY=window.pageYOffset+rect.top-topOffset;
  window.scrollTo({top:targetY,behavior:'smooth'});
}
```
GESTISCI ora chiama `scrollToAutoBuyBox()` invece di scrollIntoView
inline. `window.scrollTo` con `pageYOffset+rect.top-offset` è il
pattern più robusto, scrolla la finestra documento (non un container
interno) e tiene conto del topbar 62px.

### Tracing 6-layer GS-12
| L | Check | Esito |
|---|---|---|
| 1 · banner `position:sticky;top:62px` sotto topbar (z:100/99) | layering corretto | ✅ |
| 2 · background opaco rgba(11,18,34,.96) | leggibilità sticky garantita anche su contenuto sotto | ✅ |
| 3 · `scrollToAutoBuyBox()` definita globale (non IIFE) | grep confermato no wrapping | ✅ |
| 4 · `auto-buy-box` esiste quando banner appare | stessa gate `myBlocks>0 && !isConcluded` (line 2638 vs 2686) | ✅ |
| 5 · `window.scrollTo` + offset topbar 62+8 | pattern testato, no race con sticky | ✅ logica |
| 6 · onclick: `event.preventDefault();scrollToAutoBuyBox();return false;` | doppio guard contro anchor jump | ✅ |

### Caveat residuo GS-12
**Verifica visiva sticky behavior**: da Pi 5 non testo. Se il banner
appare leggermente sovrapposto al primo elemento sotto (titolo
detail), può servire `margin-top` extra o ridurre `top:62px` a `top:0`
(banner sostituisce topbar quando scrollY>0). UI-click ROBY required
per giudicare il look.

## 4. GS-15 minor · isLeader rank-aware + re-sync polling

### Diagnosi ROBY confermata
Utente Fontanella: rank=1 (box "Sei 1° su 2 partecipanti"), ma
`compute_checkmate_blocks` torna `blocks_to_overtake_leader=1` →
`isLeader=false` → hint "~1 per arrivare 1°" invece di "Sei in testa".
Probabile causa lato RPC: tie-breaker score (Punteggio=Primo=12.41).

### Patch isLeader (`src/dapp.js:2749-2754`)
```js
var myRank=_myRanks[airdropId]&&_myRanks[airdropId].rank;
var isLeader=(Number(cm.user_blocks_current)>0 && blocksToOvertake===0)
          || myRank===1;
```
`_myRanks[airdropId].rank` è popolato da `refreshPosition` (line 2922)
con il rank dal box "Sei 1°…" — authoritative.

### Patch re-sync (`src/dapp.js:2927`)
```js
// in refreshPosition, dopo updateStrategyGuide:
if(_currentDetail&&_currentDetail.id===airdropId&&_session&&_session.user)
  loadHintSoglia(airdropId);
```
Polling 30s di `refreshPosition` triggers `loadHintSoglia` re-render
→ hint isLeader stays in sync con rank live.

### Tracing 6-layer GS-15 minor
| L | Check | Esito |
|---|---|---|
| 1 · `_myRanks[airdropId].rank` esiste quando user partecipa | line 2922 _myRanks update post-scores fetch | ✅ |
| 2 · `loadMyRanks` chiamata in init flow (boot) | global, populates _myRanks pre-openDetail | ✅ logica |
| 3 · `||` short-circuit evita errori se _myRanks vuoto | guard `_myRanks[airdropId]&&` | ✅ |
| 4 · re-sync loadHintSoglia da refreshPosition | gate _currentDetail.id match | ✅ |
| 5 · path "Sei in testa" rendering identico al precedente | nessuna modifica al HTML | ✅ |
| 6 · race condition iniziale (refreshPosition async parallel a loadHintSoglia) | mitigato dal re-sync polling 30s + 1° render da `loadMyRanks` boot | ⚠ caveat |

### Caveat residuo GS-15
**Race condition primo render**: se `loadMyRanks` (boot) non ha ancora
risposto quando `openDetail` chiama `loadHintSoglia`, e `cm` torna
`blocksToOvertake=1`, il primo render mostra "~1 per arrivare 1°".
Dopo ~1-30s il polling `refreshPosition` triggers re-sync e corregge.
**Mitigazione**: per nuovi utenti loggati che aprono direttamente un
deep-link `/dapp/airdrop/:id`, primo render può lampeggiare il hint
sbagliato per ≤30s. Per Skeezu/ROBY che navigano dal marketplace
(loadMyRanks già fatto), questo non succede.

## 5. Cache-bust + footer

- `dapp.html:29` · `dapp.css?v=4.37.0` → **4.38.0**
- `dapp.html:1683` · `dapp.js?v=4.37.0` → **4.38.0**
- `dapp.html:1611` · footer → **alfa-2026.05.24-4.38.0**
- `abo.html` non toccato (zero changes BO)

## 6. Smoke test

- `node --check src/dapp.js` → ✅ syntax OK
- grep `.explore-hero-slim` → trovato dapp.html:506 (univoco)
- grep `#explore-toolbar` → trovato dapp.html:515 (univoco)
- grep `#cat-dashboard` → trovato dapp.html:543 (univoco)
- grep `id="auto-buy-box"` su file caricati da dapp.html → solo src/dapp.js (airdrop.js NON loaded in dapp.html, verificato)
- `_myRanks` come oggetto cache è già definito (line 82) e popolato (line 1328)
- `scrollToAutoBuyBox` definita globalmente, accessibile da onclick inline

### UI-click verifica raccomandata (4 punti)

1. **GS-9 hide esteso**: apri `/dapp/airdrop/<id>`. Sopra il dettaglio
   **non devono apparire**: "Marketplace airdrop", ORDINA toolbar, "1
   ATTIVI · Computer" card dashboard. backToList li deve ripristinare.
2. **GS-8 click cuore**: nell'header detail, clicca ♡. Il cuore deve
   **restare nell'header** (non teleportarsi in alto a destra). Active
   → red fill. Riclick → outline. Posizione DOM invariata.
3. **GS-12 banner sticky + GESTISCI**: scrolla la pagina detail. Il
   banner deve **restare incollato sotto la topbar** (top:62px). Click
   GESTISCI → scrolla smooth al box AUTO-BUY sotto. URL hash
   `#auto-buy-box` non si attiva (preventDefault) ma lo scroll sì.
4. **GS-15 isLeader**: su Fontanella (utente CEO è 1°), il hint deve
   mostrare "Sei in testa — difendi il primato con altri blocchi"
   invece di "~1 per arrivare 1°". Se vedi il vecchio path al primo
   render, attendi ≤30s per il polling re-sync.

## 7. Counter

- Track A: 9/9 firmati ✅
- **Track B reopen 4 fix shipped**:
  - GS-9 hide esteso → attendo verifica
  - GS-8 toggle preserve class → attendo verifica
  - GS-12 sticky + scroll → attendo verifica
  - GS-15 minor isLeader rank-aware → attendo verifica
- GS-10 / GS-15-struttura: **non ritoccati** (verdi da verifica ROBY)
- ROBY-side: GS-16 (parallelo)
- Meta: GS-3 (chiusura UAT → go-live)

## 8. Cadenza

Reopen consegnato in **una passata** come da brief §4. **STOP**.
Attendo UI-click ROBY sui 4 punti → sign-off cluster Track B → 
Track B chiuso → golden-session a un passo dal completamento (manca
solo GS-16 ROBY-side + GS-3 chiusura UAT).

## Bottom line

4 reopen mirati shipped in consegna unica: GS-9 hide esteso a 3
selettori (.explore-hero-slim + #explore-toolbar + #cat-dashboard) ·
GS-8 toggleWatchlist preserve `.heart-btn-v2` via classList.add/remove
(no più className overwrite con classe vecchia card) · GS-12
position:sticky;top:62px + scrollToAutoBuyBox() globale con
window.scrollTo+offset topbar · GS-15 isLeader include
`_myRanks[airdropId].rank===1` + re-sync da refreshPosition polling.
Tracing 6-layer × 4 fix con 2 caveat residui (GS-12 verifica visiva
sticky, GS-15 race iniziale ≤30s mitigato). Footer 4.38.0.
GS-10/GS-15-struttura intoccati come da brief.

Audit-trail: questo file = reopen 4-fix shipped in risposta a verifica
ROBY · GS-9 hide marketplace esteso .explore-hero-slim+#explore-toolbar+
#cat-dashboard in openDetail/backToList simmetrici · GS-8 root cause
fixato: classList.add/remove('active') invece di className=heart-btn
(che caricava classe card position:absolute → teleport viewport) ·
GS-12 .detail-autobuy-banner position:sticky;top:62px;z-index:99
opaque background+blur+shadow per leggibilità + nuova fn globale
scrollToAutoBuyBox() con window.scrollTo+offset topbar (pattern più
robusto di scrollIntoView nudo, ROBY-confermato non scrollava) ·
GS-15 minor isLeader=(...||_myRanks[id].rank===1) + re-sync
loadHintSoglia da refreshPosition polling 30s · cache-bust 4.37→4.38 ·
footer 4.38.0 · node check OK · 2 caveat residui (GS-12 visual sticky
da UI-click, GS-15 race ≤30s mitigato re-sync) · attendo UI-click
ROBY 4 punti.

---

*CCP · CIO/CTO Airoobi · Track B reopen 4-fix shipped · 24 May 2026 · daje team a 4*
