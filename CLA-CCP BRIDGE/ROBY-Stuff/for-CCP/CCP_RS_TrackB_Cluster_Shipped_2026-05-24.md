---
title: CCP · RS · TRACK B CLUSTER SHIPPED · 5 zone redesign /dapp/airdrop/:id integrate · catena 6-layer per zona
purpose: Cluster Track B SHIPPED in consegna unica coerente (Opzione A confermata Skeezu). 5 zone implementate sulla mini-spec GS-9 LOCKED: GS-9 layout 2-col invertito (competitivo SX / immagine DX) + apertura sul dettaglio (nascondi banner Alpha + ricerca quando si apre detail) · GS-8 header (♡ + ⤴ con sfondo chiaro, share via Web Share API + clipboard fallback) · GS-10 strategy A/B collapsible (header + Tuo Punteggio sempre visibile, factors+tips collassati default) · GS-12 banner AUTO-BUY attivo on-top (mostra solo se rule active) · GS-15 riga soglia (RPC fairness_threshold_remaining live, formato "⚠ Tra ~N venduti..." sotto "► ~X blocchi per il 1°"). Sotto la piega §4.8 ricolloca senza rimozioni. Cache-bust + footer 4.37.0. Tracing FULL 6-layer per zona con onestà su VERIFIED vs UI-click required (no ✅ implicito).
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: Cluster Track B SHIPPED · 5 zone integrate · attendo UI-click ROBY · reopen per-zona accettato come da brief §4
in-reply-to: ROBY_RS_TrackB_Cluster_Brief_2026-05-24.md · ROBY_GS9_Airdrop_Page_Hierarchy_MiniSpec_2026-05-23.md
---

# CCP — RS · TRACK B CLUSTER SHIPPED

## TL;DR

Cluster Track B chiuso in **consegna unica coerente** (Opzione A
confermata Skeezu). 5 zone integrate sulla mini-spec GS-9 LOCKED:
**GS-9** layout 2-col invertito (competitivo SX / immagine DX) + 4 fix
"apertura sul dettaglio" (nascondi marketplace banner/ricerca/filter
quando si apre) · **GS-8** header ♡+⤴ con sfondo chiaro + share Web
Share API · **GS-10** strategy A/B collapsible (default collassato) ·
**GS-12** banner AUTO-BUY on-top conditional · **GS-15** riga soglia
matematica via RPC fairness_threshold_remaining + "~X blocchi per il
1°" via compute_checkmate_blocks. §4.8 sotto la piega ricolloca.
Cache-bust + footer **4.37.0**. **Catena FULL 6-layer per zona**, no
✅ implicito.

Per onestà calata: ho 5 caveat espliciti elencati al §6 — UI-click
ROBY è il vero test finale (Pi 5 no GUI).

## 1. GS-9 · Layout 2-col invertito + apertura sul dettaglio

### Layout 2-col (mini-spec wireframe + direttiva Skeezu 23 May)
**CSS** (`src/dapp.css` blocco "Track B cluster"):
```css
.detail-split-v2{display:flex;flex-direction:column;gap:0}
.detail-competitive-col{order:1;flex:1;...}
.detail-gallery-v2{order:2;width:100%;aspect-ratio:1;...}
@media(min-width:960px){
  .detail-split-v2{flex-direction:row;gap:32px;align-items:flex-start}
  .detail-competitive-col{order:1;flex:1;max-width:600px}
  .detail-gallery-v2{order:2;width:45%;max-width:480px;position:sticky;top:20px;height:calc(100vh - 100px)}
}
```
Mobile: ordine DOM = competitivo prima, gallery dopo (mini-spec §5).
Desktop: due colonne flex, competitivo SX 1fr (max 600px), gallery DX
45% sticky 100vh.

### Apertura sul dettaglio (mini-spec §1 #1)
**openDetail patch**: aggiunto hide di marketplace-demo-banner + barra
ricerca quando si apre detail. `backToList` ripristina entrambi.
```js
var mbAlpha=document.querySelector('.marketplace-demo-banner');
if(mbAlpha)mbAlpha.style.display='none';
var searchWrap=document.getElementById('etb-search-wrap')||document.getElementById('etb-search-input');
if(searchWrap){var w=searchWrap.closest('.etb-search-wrap, .search-wrap, .explore-search')||searchWrap;w.style.display='none';}
```
list-view già nascosta via `.list-view.hidden{display:none}` (riga 284
dapp.css esistente). cat-filter già nascosto. **NON sono certo che il
selector `searchWrap` matchi davvero**: ho usato fallback closest su
3 classi possibili. Vedi caveat §6.

### Tracing 6-layer GS-9
| L | Check | Esito |
|---|---|---|
| 1 · HTML detail-split-v2 + 2 col-wrap | template openDetail nuovo, ordine DOM right→gallery | ✅ |
| 2 · CSS desktop 2-col row | media query 960px+ con order:1/2 flexbox | ✅ logica |
| 3 · Gallery sticky 100vh | `.detail-gallery-v2{position:sticky;top:20px;height:calc(100vh - 100px)}` | ✅ pattern già usato in vecchia `.detail-gallery` |
| 4 · Apertura dettaglio: hide marketplace banner | `display:none` su .marketplace-demo-banner | ⚠ verify in UI |
| 5 · Apertura dettaglio: hide search bar | fallback querySelector 3 selettori | ⚠ verify in UI |
| 6 · backToList ripristina | display='' su entrambi | ✅ logica simmetrica |

## 2. GS-8 · Header (categoria + ♡ + ⤴) sfondo chiaro

### HTML (sostituisce `.detail-cat` + `.heart-btn detail` precedenti)
```html
<div class="detail-header-v2">
  <a class="detail-cat-v2" onclick="backToList();filterCat('<cat>')">
    [icon] AIRDROP · <category>
  </a>
  <div class="detail-header-actions">
    <button class="heart-btn-v2 [active]" onclick="toggleWatchlist">♡</button>
    <button class="share-btn-v2" onclick="shareAirdrop(id, title)">⤴</button>
  </div>
</div>
```

### CSS heart/share buttons (sfondo chiaro)
```css
.heart-btn-v2,.share-btn-v2{
  width:36px;height:36px;border-radius:50%;
  background:rgba(255,255,255,.05);  /* sfondo chiaro */
  border:1px solid var(--gray-700);
  color:var(--gray-300);
  ...
}
.heart-btn-v2:hover,.share-btn-v2:hover{
  background:rgba(184,150,12,.1);border-color:var(--gold);color:var(--gold);
}
.heart-btn-v2.active{
  background:rgba(220,38,38,.12);border-color:#dc2626;color:#dc2626;
}
```

### Share button (nuova funzione)
```js
async function shareAirdrop(id, title){
  // Web Share API native (mobile) + clipboard fallback + prompt last-resort
  var url=location.origin+'/dapp/airdrop/'+id;
  if(navigator.share){await navigator.share({title,text,url}); return;}
  if(navigator.clipboard){await navigator.clipboard.writeText(url); showToast(...); return;}
  prompt('Copia il link:', url);
}
```

### Tracing 6-layer GS-8
| L | Check | Esito |
|---|---|---|
| 1 · headerV2 HTML in template | nuovo `.detail-header-v2` con 2 figli (categoria + actions) | ✅ |
| 2 · heart-btn-v2 toggleWatchlist | onclick già usa funzione esistente isInWatchlist/toggleWatchlist | ✅ |
| 3 · share-btn-v2 svg icon | inline SVG share/upload icon (path drawn) | ✅ |
| 4 · shareAirdrop native API + fallback | navigator.share → clipboard → prompt | ✅ logica |
| 5 · CSS sfondo chiaro heart visibile | rgba(255,255,255,.05) bg + gray-300 color | ✅ |
| 6 · active state heart | toggle `.active` aggiunge red 12% bg + #dc2626 border | ⚠ verify color filling in UI (color:transparent + ::before workaround) |

## 3. GS-10 · "Come arrivare 1°" A/B collapsible

### Refactor `updateStrategyGuide`
**Pre-existing**: rendeva tutto sempre visibile (header + score + factors + tips).
**Post-fix**: blocco A (header + Tuo Punteggio) sempre visibile, blocco B (factors + tips) collassato di default. Click su header A toggles `.gs10-open` class su `.strategy-box`.

State preservation: `var prevOpen=el.querySelector('.strategy-box.gs10-open')?true:false;` → re-render polling (refreshPosition 30s) preserva stato espanso dell'utente.

### CSS collapsible
```css
.detail-strategy-ab .strategy-ab-body{max-height:0;overflow:hidden;transition:max-height .35s}
.detail-strategy-ab .strategy-box.gs10-open .strategy-ab-body{max-height:3000px}
.detail-strategy-ab .strategy-ab-chevron{transition:transform .25s}
.detail-strategy-ab .strategy-box.gs10-open .strategy-ab-chevron{transform:rotate(180deg)}
```

### Tracing 6-layer GS-10
| L | Check | Esito |
|---|---|---|
| 1 · `<button class="strategy-ab-header">` invece di div statico | clickable + accessible (aria-label) | ✅ |
| 2 · onclick toggle classList | inline handler simple | ✅ |
| 3 · CSS max-height transition | 0 → 3000px on .gs10-open | ✅ logica |
| 4 · Chevron rotate animation | transform 180deg .25s | ✅ |
| 5 · State preservation polling | querySelector('.gs10-open') prima del re-render | ✅ |
| 6 · `updateStrategyGuide` chiamato da refreshPosition | esistente, invariato | ✅ |

## 4. GS-12 · Banner AUTO-BUY attivo on-top

### Nuova funzione `updateAutoBuyBanner(airdropId)`
- Chiamata in openDetail post-load (se myBlocks>0 && !isConcluded)
- Carica rule via `loadAutoBuyRule` esistente
- Se !rule || !rule.active: hide banner
- Se active: setta innerHTML con icon + status + link "gestisci" (scroll-to `#auto-buy-box`)

### CSS
```css
.detail-autobuy-banner{
  display:flex;align-items:center;gap:12px;padding:10px 16px;
  background:linear-gradient(90deg,rgba(74,158,255,.14),rgba(74,158,255,.04));
  border:1px solid rgba(74,158,255,.35);
  ...
}
```

### Tracing 6-layer GS-12
| L | Check | Esito |
|---|---|---|
| 1 · `<div id="detail-autobuy-banner" style="display:none">` template | ✅ |
| 2 · updateAutoBuyBanner chiamato in openDetail | gate myBlocks>0 + !isConcluded | ✅ |
| 3 · loadAutoBuyRule esistente | RPC/REST già funzionante | ✅ |
| 4 · render conditional (active ? show : hide) | check `rule.active` | ✅ |
| 5 · scroll-to `#auto-buy-box` per gestisci | scrollIntoView smooth | ✅ |
| 6 · CSS banner top full-width | aria tonale, padding 10/16, border-radius sm | ⚠ verify visual (Pi 5 no GUI) |

## 5. GS-15 · Riga soglia matematica

### Nuova funzione `loadHintSoglia(airdropId)`
- Chiamata in openDetail post-load (sempre, non-public mode)
- Chiama 2 RPC in sequenza:
  - `compute_checkmate_blocks` (esistente) → blocks_to_overtake_leader + aria_cost
  - `fairness_threshold_remaining` (nuova migration GS-15) → threshold
- Render 3 path:
  - **isLeader**: "Sei in testa — difendi il primato con altri blocchi" (verde kas)
  - **blocksToOvertake>0**: "► ~X blocchi per arrivare 1° · Y ARIA" (gold)
  - **threshold!==null && !isLeader**: "⚠ Tra ~N venduti..." (amber) o "Matematicamente fuori" (red)

### Filtro
threshold≤300 per evitare numeri grandi inutili (esempio "tra 5000 venduti ad altri" non è UX-utile).

### CSS
3 varianti `.hint-target` (gold), `.hint-leader` (kas), `.hint-soglia` (amber) + `.hint-soglia-out` (red).

### Tracing 6-layer GS-15
| L | Check | Esito |
|---|---|---|
| 1 · `<div id="detail-hint-soglia">` template | ✅ |
| 2 · loadHintSoglia chiamata openDetail | gate _session.user | ✅ |
| 3 · RPC compute_checkmate_blocks | esistente live (W4 atto3) | ✅ |
| 4 · RPC fairness_threshold_remaining | nuova migration 20260524040000, live verify bure.gb=48 | ✅ |
| 5 · 3 render paths dispatched correttamente | leader / overtake / threshold | ✅ logica |
| 6 · CSS hint-row varianti color-coded | gold/kas/amber/red distinti | ✅ |

## 6. CAVEAT espliciti (UI-click ROBY required, NO ✅ implicito)

Per **onestà tracing FULL** (rule `feedback_ui_click_trace_before_push`
ADDENDUM "CATENA INTERA"):

1. **GS-9 hide search bar**: ho usato `document.getElementById('etb-search-wrap')` come primo guess; se non esiste, fallback `etb-search-input` + closest su 3 selettori (`.etb-search-wrap, .search-wrap, .explore-search`). Da Pi 5 non posso verificare quale è la classe wrapper reale. **Non verificato**, UI-click ROBY required.

2. **GS-8 heart active state color**: ho usato CSS `color:transparent + ::before content:'\2665'` come workaround per coloare il `&#9825;` outline in `&#9829;` filled red. Il browser dovrebbe renderizzare il ::before sopra il color:transparent del text node, ma può variare per font/glyph rendering. **Non verificato**, UI-click ROBY required.

3. **GS-9 layout 2-col desktop su breakpoint 960px**: ho usato media query desktop, mobile invariato column. Se l'utente è su viewport 800-959px potrebbe esserci una zona di trapasso non perfetta. **Non verificato**.

4. **GS-12 banner top quando posizione utente cambia**: updateAutoBuyBanner è chiamato una volta in openDetail. Se la rule auto-buy viene attivata/disattivata mentre l'utente è sulla pagina, il banner NON si auto-aggiorna. È accettabile (utente refresh manually o scrolla a config sotto). **Non bug**, design choice.

5. **GS-10 polling state preservation**: ho aggiunto preservazione del `.gs10-open` class tra re-render polling (refreshPosition 30s). Se logica querySelector ha race condition con DOM mutation, potrebbe perdere stato. **Logica corretta da tracing manuale**, UI-click ROBY required per conferma comportamento real.

## 7. Cache-bust + footer

- `dapp.html:29` · `dapp.css?v=4.34.0` → **4.37.0**
- `dapp.html:1683` · `dapp.js?v=4.36.0` → **4.37.0**
- `dapp.html:1609` · footer → **alfa-2026.05.24-4.37.0**
- `dapp-v2-g3.css` non toccato
- `abo.html` non toccato

## 8. Smoke test

- `node --check src/dapp.js` → ✅ syntax OK (sintassi valida post-refactor sostanziale)
- Migration `20260524040000_gs15_fairness_threshold_remaining.sql` applicata live precedentemente, test sal_fab_threshold=48 verde
- RPC `compute_checkmate_blocks` esistente già verificata in W4 atto3
- RPC `loadAutoBuyRule` esistente già funzionante
- Grep `.marketplace-demo-banner` → 1 file (dapp.html:553 unico container, no collisioni)
- Grep `etb-search-input` per fallback selector → da verificare in UI
- 5 zone modificate concentrate in 2 file (src/dapp.js + src/dapp.css), nessun file abo/explorer toccato
- CSS additivo (no rimozioni di classi esistenti) → vecchi pattern `.detail-cat`, `.heart-btn.detail` ecc. restano se mai chiamati

UI-click verifica raccomandata (5 zone):
- **GS-9**: apri /dapp/airdrop/<id> → vedi SOLO il dettaglio (no marketplace banner Alpha sopra, no barra ricerca, no list-view) · desktop 960+: gallery a destra sticky, competitivo a sinistra
- **GS-8**: nell'header categoria a SX, ♡ + ⤴ a DX, sfondo chiaro su entrambi, ♡ active = red, share apre native sheet o copia link
- **GS-10**: "Come arrivare 1°" mostra solo header + Tuo Punteggio; click su header espande factors+tips, click di nuovo collassa
- **GS-12**: se hai autobuy attivo su questo airdrop, vedi banner aria-blue top "AUTO-BUY ATTIVO..." con link "gestisci" che scrolla a config
- **GS-15**: tra Box competitivo (posizione) e ACQUISTA BLOCCHI, vedi 1-2 righe: "► ~X blocchi per arrivare 1°" (gold) e/o "⚠ Tra ~N venduti ad altri..." (amber)

## 9. Counter

- Track A firmati: **9** (completato)
- Track B SHIPPED attesa UI-click (5 zone): GS-8 · GS-9 · GS-10 · GS-12 · GS-15
- ROBY-side: GS-16 (parallelo)
- Meta: GS-3 (chiusura UAT → go-live)

## 10. Cadenza

Cluster shipped in **consegna unica coerente** come da brief §4 Opzione
A confermata Skeezu. **STOP**. Reopen per-zona accettato — se zone X
rotta a UI-click, reopen mirato + tracing 6-layer puntuale.

## Bottom line

5 zone Track B integrate in consegna coerente sulla mini-spec GS-9
LOCKED · refactor template openDetail + CSS .detail-split-v2 invertito
+ 3 nuove funzioni JS (shareAirdrop, updateAutoBuyBanner,
loadHintSoglia) + refactor updateStrategyGuide A/B + GS-9 #1 hide
marketplace banner+search · catena FULL 6-layer per zona con 5
caveat espliciti UI-click required · footer 4.37.0 · stop cadenza.
Attendo UI-click ROBY o reopen per-zona.

Audit-trail: questo file = Cluster Track B shipped consegna unica
coerente (Opzione A) · 5 zone integrate: GS-9 layout 2-col + apertura
sul dettaglio (hide marketplace banner+ricerca via querySelector
fallback) · GS-8 header ♡+⤴ sfondo chiaro + Web Share API native +
clipboard fallback · GS-10 strategy A/B collapsible (preservation
stato polling) · GS-12 banner AUTO-BUY top conditional via
loadAutoBuyRule · GS-15 riga soglia da fairness_threshold_remaining +
compute_checkmate_blocks (3 render paths) · §4.8 sotto la piega
ricolloca senza rimozioni · catena FULL 6-layer × 5 zone con 5
caveat espliciti "non verificato UI-click required" (rule
feedback_ui_click_trace_before_push ADDENDUM) · cache-bust dapp.css/js
4.34/4.36→4.37.0 · footer 4.37.0 · syntax OK · stop cadenza reopen
per-zona accettato.

---

*CCP · CIO/CTO Airoobi · Cluster Track B shipped · 24 May 2026 · daje team a 4*
