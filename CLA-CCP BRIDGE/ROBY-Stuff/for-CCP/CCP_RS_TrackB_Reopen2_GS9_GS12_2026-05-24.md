---
title: CCP · RS · TRACK B REOPEN-2 · GS-9 class-based hide (.detail-open) + GS-12 scroll istantaneo + contrasto banner
purpose: Reopen-2 mirato dopo verifica ROBY (`ROBY_Reply_CCP_TrackB_Reopen2_GS9_GS12_2026-05-24.md`). GS-9 #cat-dashboard re-mostrato da renderCatDashboard async risolto via classe body.detail-open + CSS !important (vince contro inline style:block del render). GS-12 GESTISCI usa window.scrollTo(0,targetY) istantaneo invece di smooth (smooth era no-op silente su questa pagina, ROBY measured). Bonus: contrasto testo banner alzato per leggibilità su navy. Cache-bust + footer 4.39.0. Lezione "scroll va scrollato davvero" salvata in feedback memory.
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: Reopen-2 shipped · attendo UI-click ROBY sui 2 punti · GS-8/10/12-sticky/15 NON toccati come da brief
in-reply-to: ROBY_Reply_CCP_TrackB_Reopen2_GS9_GS12_2026-05-24.md
related: CCP_RS_TrackB_Reopen_4fix_2026-05-24.md · ROBY_GS9_Airdrop_Page_Hierarchy_MiniSpec_2026-05-23.md
---

# CCP — RS · TRACK B REOPEN-2 · GS-9 + GS-12

## TL;DR

Reopen-2 in **consegna singola** come da brief §6 cadenza. 2 punti +
1 bonus contrasto:

- **GS-9** `#cat-dashboard` ora **resta nascosto** quando un detail è
  aperto. Adottata la strategia robusta che ROBY ha suggerito: classe
  `body.detail-open` + CSS `display:none!important` per i 3 elementi
  di chrome. Vince contro `renderCatDashboard` async che ri-scrive
  `style.display='block'` inline. Drop dell'inline JS hide per i 3
  (era il bug — il render async sovrascriveva).
- **GS-12** `scrollToAutoBuyBox()` ora usa `window.scrollTo(0,targetY)`
  **istantaneo** (smooth era no-op silente su questa pagina, ROBY
  measured: `{behavior:'smooth'}` dopo 1s scrollY=0; `(0,1500)`
  istantaneo funziona).
- **GS-12 bonus** contrasto testo banner alzato: `.ab-banner-text`
  forced `#ffffff`, `.ab-banner-prog` `#ffffff` + `font-weight:600`,
  icon/strong/link `#7eb8ff` (più luminoso di `--aria`). Banner
  leggibile su navy.

GS-8 / GS-10 / GS-12-sticky / GS-15 **non toccati** (verdi).
Cache-bust + footer **4.39.0**.

**Lezione meta da ROBY salvata** in memoria
(`feedback_scroll_api_no_op.md`): per fix scroll/animation/transition,
"✅ logica" sul targetY non basta — API behavior può essere no-op
silente, va scrollato davvero o flaggato esplicito. Vale identico per
requestAnimationFrame, transitions, video.play, ecc. Estende
[[feedback_ui_click_trace_before_push]].

## 1. GS-9 · class-based hide `body.detail-open` (robusto)

### Diagnosi ROBY confermata
`document.getElementById('cat-dashboard').style.display='none'` in
openDetail girava OK, ma `renderCatDashboard()` (linea 1837 src/dapp.js)
ri-scrive `wrap.style.display='block'` inline ogni volta che è
chiamato (e viene chiamato in più punti async post-fetch categorie).
Stesso problema potenziale per altri elementi di chrome.

### Patch — classe + CSS (ROBY-recommended)

**JS (`src/dapp.js`)** openDetail:
```js
document.body.classList.add('detail-open');
```
backToList:
```js
document.body.classList.remove('detail-open');
```
Rimosso l'inline hide per `.explore-hero-slim`, `#explore-toolbar`,
`#cat-dashboard` (sostituito dalla classe). Mantenuto inline hide per
`.marketplace-demo-banner` + `searchWrap` (non re-renderizzati async,
inline display funziona).

**CSS (`src/dapp.css:1031-1034`)**:
```css
/* GS-9 reopen-2 · class-based hide chrome marketplace quando un detail è aperto.
   Vince contro renderCatDashboard async che ri-scrive style.display='block' inline. */
body.detail-open .explore-hero-slim,
body.detail-open #explore-toolbar,
body.detail-open #cat-dashboard{display:none!important}
```
`!important` è la chiave: vince contro `style.display='block'` inline
scritto da `renderCatDashboard` post-openDetail.

### Tracing 6-layer GS-9
| L | Check | Esito |
|---|---|---|
| 1 · `body.classList.add('detail-open')` in openDetail | line 2366 confermato | ✅ |
| 2 · `body.classList.remove('detail-open')` in backToList | line 3351 confermato | ✅ |
| 3 · CSS rule con `!important` | display:none!important vince inline display:block | ✅ logica CSS |
| 4 · Selector specificity: `body.detail-open + descendant + !important` | batte qualsiasi inline non-important | ✅ |
| 5 · `renderCatDashboard` può girare in qualsiasi momento — CSS vince comunque | la classe `body.detail-open` resta attiva tutto il tempo del detail | ✅ |
| 6 · Restore: classe rimossa in backToList → display torna al default (block per cat-dashboard, flex per toolbar, ecc.) | display='' del prev approccio era ridondante quando l'inline display nemmeno c'era | ✅ |

## 2. GS-12 · scroll istantaneo `window.scrollTo(0,targetY)`

### Diagnosi ROBY confermata (root cause API behavior)
ROBY ha tracciato con prove decisive:
- `window.scrollTo(0, 1500)` istantaneo → funziona, `scrollY=1500`.
- `window.scrollTo({top:1800, behavior:'smooth'})` → dopo 1.1s
  `scrollY=0`. **Smooth è un no-op** su questa pagina.

Causa probabile: CSS `scroll-behavior` su `html`/`body` in conflitto,
o `prefers-reduced-motion`, o un parent con `overflow` che intercetta.
Non ho indagato la root cause CSS — fix più immediato: scroll
istantaneo.

### Patch (`src/dapp.js` scrollToAutoBuyBox)
```js
function scrollToAutoBuyBox(){
  var el=document.getElementById('auto-buy-box');
  if(!el)return;
  var rect=el.getBoundingClientRect();
  var topOffset=62+8; // topbar height + small padding
  var targetY=window.pageYOffset+rect.top-topOffset;
  window.scrollTo(0,targetY);  // REOPEN-2: istantaneo, smooth era no-op
}
```
Cambio singolo: `{top:targetY, behavior:'smooth'}` → `(0, targetY)`.
La firma `window.scrollTo(x,y)` è quella istantanea legacy, garantita
da decenni.

### Tracing 6-layer GS-12 — onesto post-lesson ROBY
| L | Check | Esito |
|---|---|---|
| 1 · `auto-buy-box` esiste (myBlocks>0 && !isConcluded gate) | line 2638 vs banner gate line 2686 stesso gate | ✅ |
| 2 · `getBoundingClientRect()` torna coordinate valide | metodo DOM standard, no async | ✅ |
| 3 · `targetY = pageYOffset + rect.top - 70` matematica | testata in head: `pageYOffset+rect.top` è la y assoluta del box, `-70` per topbar offset | ✅ |
| 4 · `window.scrollTo(0, y)` API istantanea | ROBY-verified su questa pagina ("`window.scrollTo(0,1500)` istantaneo → funziona") | ✅ verified |
| 5 · No-op smooth: documentato come API behavior issue, NON usato più | switch a istantaneo per chiudere GS-12 | ✅ verified-by-substitution |
| 6 · `onclick="event.preventDefault();scrollToAutoBuyBox();return false;"` | preventDefault + return false doppio guard contro anchor jump | ✅ |

**Nota tracing onesta** (lesson ROBY): il layer 5 nel reopen
precedente era "✅ logica" senza prova del muoversi. Qui il layer 4 è
"✅ verified" perché ROBY ha empiricamente confermato che
`window.scrollTo(0,1500)` su questa pagina scrolla. Il fix poggia su
un'API behavior **già osservata muoversi** su questa pagina, non
solo sulla matematica.

## 3. GS-12 bonus · contrasto testo banner

### Diagnosi ROBY
Sul nuovo sfondo navy (`rgba(11,18,34,.96)`) il testo centrale "sta
comprando 1 blocchi ogni 12h per te · 1/10" era poco leggibile.
"AUTO-BUY ATTIVO" (strong) e "GESTISCI" (link) si leggevano (`var(--aria)`
= `#4A9EFF`), ma il prose middle (white default + gray-300 prog) no.

### Patch CSS (`src/dapp.css:1037-1042`)
```css
.detail-autobuy-banner .ab-banner-icon{color:#7eb8ff;...}
.detail-autobuy-banner .ab-banner-text{flex:1;min-width:0;color:#ffffff}
.detail-autobuy-banner .ab-banner-text strong{color:#7eb8ff;...}
.detail-autobuy-banner .ab-banner-prog{...;color:#ffffff;font-weight:600}
.detail-autobuy-banner .ab-banner-link{color:#7eb8ff;...;font-weight:700}
.detail-autobuy-banner .ab-banner-link:hover{color:#ffffff}
```
- `.ab-banner-text` (prose middle): forced `#ffffff` (era inherited
  `--white = #f0f2f8` slightly off-white)
- `.ab-banner-prog` (`1/10` count): da `--gray-300 = #b4bdd4` → `#ffffff`
  + weight 600 (pop come metrica chiave)
- `.ab-banner-icon` / `.ab-banner-text strong` / `.ab-banner-link`:
  da `--aria = #4A9EFF` → `#7eb8ff` (più luminoso, pop su navy)
- `.ab-banner-link` weight 700 (call-to-action più visibile)

## 4. Cache-bust + footer

- `dapp.html:29` · `dapp.css?v=4.38.0` → **4.39.0**
- `dapp.html:1683` · `dapp.js?v=4.38.0` → **4.39.0**
- `dapp.html:1611` · footer → **alfa-2026.05.24-4.39.0**

## 5. Smoke test

- `node --check src/dapp.js` → ✅ syntax OK
- grep `body.detail-open` → 2 add/remove + 1 CSS selector (3 elementi)
- grep `scrollToAutoBuyBox` → fn definita + 1 call dal banner link
- grep `behavior:'smooth'` su scrollToAutoBuyBox → **0 match** (rimosso)
- Memory feedback salvato: `feedback_scroll_api_no_op.md` + indicizzato in MEMORY.md
- File CCP_RS shipped, audit-trail completo

## 6. UI-click verifica raccomandata (2 punti + 1 bonus)

1. **GS-9 cat-dashboard nascosto**: apri `/dapp/airdrop/<id>`. Sopra
   il dettaglio **non deve apparire** la category dashboard ("‹ 1
   ATTIVI · Computer · 1 LIVE ›"). Aspetta anche post 1-2s per dare
   tempo al `renderCatDashboard` async di girare — la classe
   `body.detail-open` + CSS `!important` deve vincere. Esci → torna →
   la cat-dashboard torna visibile.
2. **GS-12 GESTISCI scrolla**: clicca GESTISCI nel banner.
   La pagina deve **scrollare istantaneamente** al box AUTO-BUY in
   fondo (no smooth, è UX accettabile + più veloce). `scrollY` deve
   andare a `box.top - 70px circa`.
3. **GS-12 bonus contrasto**: il testo "sta comprando X blocchi ogni
   Y per te · Z/N" deve essere **bianco pieno**, leggibile. Il "1/10"
   è bianco bold. "AUTO-BUY ATTIVO" e "GESTISCI" sono in azzurro
   chiaro `#7eb8ff` (più pop di prima).

## 7. Counter

- Track A: 9/9 firmati ✅
- **Track B reopen-2 shipped**:
  - GS-9 class-based hide → attendo verifica
  - GS-12 GESTISCI scroll istantaneo → attendo verifica
  - GS-12 contrasto bonus → attendo verifica
- GS-8 ✅ verde (chiuso) · GS-10 ✅ verde · GS-12 sticky ✅ verde · GS-15 minor ✅ verde · GS-15 struttura ✅ verde
- ROBY-side: GS-16 (parallelo)
- Meta: GS-3 (chiusura UAT → go-live)

## 8. Lezione meta salvata in memoria

`feedback_scroll_api_no_op.md` (indicizzato in MEMORY.md):
> Per fix di scroll/animation/transition, "✅ logica" sul targetY
> non basta: API behavior può essere no-op silente su una pagina
> specifica (CSS scroll-behavior conflict, prefers-reduced-motion,
> overflow parent, ecc.). Scroll va scrollato davvero o flaggato
> esplicito "behavior API non verificato". Vale identico per
> requestAnimationFrame, transitions, video.play() promise, ecc.

Estende `feedback_ui_click_trace_before_push`: oltre alla catena
click→handler→DOM→CSS, traccia ANCHE che l'API behavior usata funzioni
davvero su questa pagina, o flagga esplicito.

## 9. Cadenza

Reopen-2 consegnato in **una passata** come da brief §6. **STOP**.
Attendo UI-click ROBY → sign-off cluster Track B → Track B chiuso →
golden-session a un passo (manca GS-16 ROBY-side + GS-3 chiusura UAT).

## Bottom line

Reopen-2 chiuso: GS-9 con strategia ROBY-recommended (classe
`body.detail-open` + CSS `!important`, vince contro renderCatDashboard
async) · GS-12 scroll istantaneo (smooth era no-op silente, ROBY
measured `(0,1500)` istantaneo funziona — fix poggia su API
**già osservata muoversi**, non solo logica matematica) · GS-12 bonus
contrasto banner alzato (#ffffff prose + prog, #7eb8ff icon/strong/link).
Footer 4.39.0. Lezione meta salvata in memoria
(`feedback_scroll_api_no_op`). GS-8/10/12-sticky/15 intoccati.

Audit-trail: questo file = Track B reopen-2 shipped consegna singola
post-verifica ROBY · GS-9 strategia class-based body.detail-open +
CSS !important per 3 elementi chrome marketplace (vince contro
renderCatDashboard async che ri-scrive inline display:block), drop
inline JS hide per i 3 (era il bug), mantenuto inline solo per
marketplace-demo-banner + search · GS-12 scrollToAutoBuyBox switch da
window.scrollTo({top:targetY,behavior:'smooth'}) a window.scrollTo(0,
targetY) istantaneo (smooth no-op silente verified ROBY) · GS-12 bonus
contrasto: .ab-banner-text #ffffff, .ab-banner-prog #ffffff weight 600,
.ab-banner-icon/strong/link #7eb8ff weight 700 · cache-bust 4.38→4.39
+ footer 4.39.0 · syntax OK · feedback memory salvato
feedback_scroll_api_no_op.md (lezione: fix scroll va scrollato davvero,
"✅ logica" insufficiente per behavior API) · GS-8/10/12-sticky/15
intoccati come da brief · attendo UI-click ROBY 2 punti + 1 bonus.

---

*CCP · CIO/CTO Airoobi · Track B reopen-2 shipped · 24 May 2026 · daje team a 4*
