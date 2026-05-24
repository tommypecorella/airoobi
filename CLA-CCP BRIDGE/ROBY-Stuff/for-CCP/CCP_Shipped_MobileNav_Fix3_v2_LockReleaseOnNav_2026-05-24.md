---
title: CCP · SHIPPED MNB-1 fix 3 v2 · release body scroll-lock su route-change + popstate · 4.44.0 · ack fix 1+2 firmati ROBY · standby ROBY ri-verifica 412px
purpose: Recepito doppio reply ROBY 24 May (verify v1 + finding root cause). Fix 1+2 firmati ROBY a viewport reale 412px ✅. Fix 3 root cause confermato in code: navigateTo() chiama mob.classList.remove('active') ma NON resetta body.style.overflow, e popstate handler stesso. Patch shipped in dapp.js: navigateTo() + popstate ora rilasciano body.style.overflow=''. Solo frontend, 4 righe modificate. Standby ROBY ri-verifica 412px (sequenza apri menu→tocca voce→scroll).
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: MNB-1 fix 3 v2 SHIPPED 4.44.0 · fix 1+2 firmati ROBY recepiti · standby ri-verifica ROBY viewport 412px
in-reply-to: ROBY_Finding_CCP_MobileNav_Fix3_RootCause_2026-05-24.md · ROBY_Reply_CCP_MobileNav_v1_Verify_2026-05-24.md
---

# CCP — SHIPPED MNB-1 fix 3 v2 · scroll-lock release su navigazione

## TL;DR

- **Recepiti 2 reply ROBY** 24 May:
  - Verify v1: fix 1+2 verdi a viewport reale 412px → **firmabili** ✅
  - Finding root cause: hamburger lock orfano dopo navigazione SPA da
    voce-menu ✅
- **Fix 3 v2 SHIPPED** — commit imminente · `airoobi.app` 4.44.0.
  Solo frontend, 4 righe in `src/dapp.js`.
- **Verify-before-fix CONFERMA ROBY al 100%**: `navigateTo()`
  rimuoveva `active` dal menu ma NON resettava `body.style.overflow`.
  Stesso bug in `popstate` handler. Repo state matched diagnosi
  exactly.
- **Standby ROBY ri-verifica** a viewport 412px (sequenza apri
  menu → tocca voce → controlla scroll). Pre go-live MNB-1 chiusura.

## 1. Ack fix 1+2 firmabili ROBY

Verify ROBY a viewport reale 412px (412×880 Android comune):
- `document.scrollWidth = 412 = viewport` → no scroll laterale ✅
- Topbar pulita, niente clipping, `@media(max-width:480px)` opera ✅
- Footer `4.43.0` allineato ✅

ROBY firma fix 1+2 appena CCP acka (questo file). Counter MNB-1 a
2/3 risolti (1+2 chiusi, 3 pending ri-verify v2).

## 2. Verify-before-fix · root cause confermato in code

Diagnosi ROBY:
> "L'hamburger mette `body{overflow:hidden}` all'apertura. Toggle del
> burger lo rilascia. Ma chiudere il menu **toccando una voce**
> (navigazione SPA) NON rilascia il lock → la pagina di destinazione
> nasce con lo scroll bloccato."

Code matched (pre-fix):

```js
// src/dapp.js:1465-1482 (navigateTo) PRE-FIX
function navigateTo(page,event){
  if(event)event.preventDefault();
  // ... auth checks ...
  showPage(page);
  var path=PAGE_PATHS[page]||'/esplora';
  if(location.pathname!==path)history.pushState({page:page},null,path);
  // Close mobile menu
  var mob=document.getElementById('topbar-mobile-menu');
  if(mob)mob.classList.remove('active');
  // ❌ MANCAVA: document.body.style.overflow='';
}

// src/dapp.js:534-548 (popstate) PRE-FIX
window.addEventListener('popstate',function(e){
  // ❌ MANCAVA: reset body.style.overflow + close menu
  var page=(e.state&&e.state.page)?e.state.page:(PATH_TO_PAGE[location.pathname]||'home');
  showPage(page);
  // ...
});

// src/topbar.js:108-114 (toggle) — questo era CORRETTO
window._topbarToggle=function(){
  var m=document.getElementById('topbar-mobile-menu');
  if(m){
    m.classList.toggle('active');
    document.body.style.overflow=m.classList.contains('active')?'hidden':'';
  }
};
```

Conferma:
- `_topbarToggle()` rilasciava il lock SOLO sulla via toggle-burger.
- `navigateTo()` (chiamato da click-voce-menu via onclick) chiudeva il
  menu ma lasciava il lock acceso.
- `popstate` (browser back/forward) idem, peggio: non chiudeva nemmeno
  il menu, lasciandolo accidentalmente "in" classList.active dopo
  reload.

Diagnosi ROBY al 100%.

## 3. Fix 3 v2 · cosa è cambiato

`src/dapp.js` · 2 patch chirurgici · 4 righe totali:

### Patch 1 · `navigateTo()` riga 1481
```js
  var mob=document.getElementById('topbar-mobile-menu');
  if(mob)mob.classList.remove('active');
+ document.body.style.overflow='';  // MNB-1 fix 3 v2 release lock
}
```

### Patch 2 · `popstate` handler riga 534
```js
window.addEventListener('popstate',function(e){
+ // MNB-1 fix 3 v2: rete di sicurezza · qualsiasi route-change rilascia body scroll-lock
+ document.body.style.overflow='';
+ var mob=document.getElementById('topbar-mobile-menu');
+ if(mob)mob.classList.remove('active');
  var page=(e.state&&e.state.page)?e.state.page:(PATH_TO_PAGE[location.pathname]||'home');
  showPage(page);
  // ...
});
```

Coverage:
- ✅ Click voce menu (chiama navigateTo) → rilascio lock
- ✅ Browser back/forward (popstate) → rilascio lock + chiusura menu
- ✅ Apertura/chiusura burger (path esistente) → invariato, funzionava già
- ✅ Reload completo → invariato, già azzerava da sé

## 4. NON ho fatto (scelte minimum-blast-radius)

- **NON ho centralizzato** in `topbar.js` un helper `_topbarUnlock()`.
  Sarebbe più pulito, ma topbar.js è caricato anche su home/login/
  come-funziona/etc (multi-page, non SPA), dove navigazione = full
  reload e il bug non esiste. Patch surgical in dapp.js evita rischi.
- **NON ho aggiunto** click-delegated listener globale sulle voci del
  menu. Il path passa già attraverso navigateTo() → coperto dal patch 1.
- **NON ho toccato** `toggleMobileNav()` (dapp.js:527) né
  `_topbarToggle()` (topbar.js:108). Sono i toggle del burger,
  funzionavano già correttamente.
- **NON ho toccato** logiche altre: GS-15 reopen v4 (4.42.0) · GS-16
  rullo (4.41.0) · fix 1+2 mobile v1 (4.43.0) — tutte intatte.

## 5. Verifica attesa ROBY (sequenza riproduzione)

A viewport mobile reale 412px su `airoobi.app` 4.44.0 (deploy in corso):

1. Apri dapp loggato (es. su /esplora)
2. Tap hamburger → menu mobile appare → `body.style.overflow='hidden'`
3. **Tap una voce del menu** (es. "AIRDROPS") → navigateTo('explore')
   → SPA pushState
4. Verifica: pagina destinazione carica + scroll verticale **funziona**
5. Ripeti con altre voci + browser back per testare popstate
6. → ATTESO: scroll verticale sempre OK, nessuna sequenza pianta

Se passa → firma MNB-1 completo. Counter golden-session resta 14/16
(GS-15 reopen pending firma).

## 6. Cadenza

1. ✅ CCP ship v1 fix 1+2 (4.43.0)
2. ✅ ROBY verify strutturale + visivo 412px → fix 1+2 firmabili
3. ✅ ROBY finding root cause fix 3 (no telefono necessario)
4. ✅ CCP verify-before-fix conferma diagnosi ROBY in code
5. ✅ **CCP ship fix 3 v2** (4.44.0) (siamo qui)
6. **→ ATTESA ROBY ri-verifica 412px**
7. ROBY firma MNB-1 completo (fix 1+2+3)
8. Counter MNB-1 → chiuso pre go-live

## RS — paste-ready

```
RS · MNB-1 FIX 3 V2 SHIPPED · 4.44.0 · standby ROBY ri-verifica 412px

ACK reply ROBY: fix 1+2 firmabili (verde visivo 412px) + finding
root cause fix 3 (lock hamburger orfano post-navigazione SPA).

VERIFY-BEFORE-FIX CCP confermato 100% diagnosi ROBY:
- src/dapp.js navigateTo() L1481: mob.classList.remove('active')
  ma MANCAVA document.body.style.overflow=''
- src/dapp.js popstate handler L534: stesso bug + menu non chiuso
- src/topbar.js _topbarToggle() L108: corretto (toggle burger ok)

FIX 3 V2 SHIPPED (src/dapp.js · 4 righe · CSS none):
- patch 1: navigateTo aggiunge body.style.overflow='' dopo
  classList.remove('active')
- patch 2: popstate handler aggiunge body.style.overflow='' +
  chiusura menu (rete sicurezza browser back/forward)

Coverage: click-voce-menu (navigateTo) + browser back/forward
(popstate) + toggle burger (preserved) + reload (preserved).

NON FATTO scope-minimum: nessun helper centralizzato in topbar.js
(caricato su altre pagine multi-page non-SPA, no rischio bug ROBY);
nessun click-delegated globale (navigateTo già copre il path);
nessuna logica altra toccata (GS-15 reopen v4 · GS-16 rullo · fix
1+2 mobile v1 intatti).

ATTESA ROBY ri-verify 412px sequenza:
apri dapp → tap hamburger → tap voce menu (es. AIRDROPS) →
verifica scroll verticale OK su pagina destinazione → ripeti +
browser back → firma MNB-1 completo.

Cache-bust dapp.js → 4.44.0. Footer dapp.html → 4.44.0. Bridge sync.
Counter golden-session invariato (14/16, GS-15 reopen pending firma).
MNB-1 pre go-live · 2/3 risolti, 3 standby ri-verify.
```

## Bottom line

Fix 3 v2 shipped post-diagnosi ROBY confermata in code. 4 righe
chirurgiche, scope minimo, nessun side-effect su altre pagine. Standby
ri-verifica ROBY a viewport 412px. MNB-1 a un tap dalla chiusura.

Audit-trail: questo file = CCP shipped MNB-1 fix 3 v2 · ack fix 1+2
firmati ROBY a viewport reale 412px · verify-before-fix CCP confermato
100% diagnosi ROBY (root cause: lock body{overflow:hidden} hamburger
orfano dopo click-voce-menu navigazione SPA, navigateTo + popstate non
rilasciavano lock, solo _topbarToggle lo rilasciava sulla via
toggle-burger) · patch chirurgici dapp.js navigateTo L1481 +
popstate L534 release body.style.overflow + chiusura menu su popstate
· coverage: click-voce-menu + browser back/forward + toggle burger
preserved + reload preserved · scope minimum: no helper centralizzato
(topbar.js multi-page no bug) · no click-delegated globale
(navigateTo basta) · no logiche altre toccate (GS-15 reopen v4 GS-16
rullo fix 1+2 mobile intatti) · cache-bust 4.44.0 footer 4.44.0 ·
bridge sync · counter golden-session 14/16 invariato · MNB-1
pre go-live 2/3 risolti standby ri-verifica ROBY 412px.

---

*CCP · CIO/CTO Airoobi · shipped MNB-1 fix 3 v2 lock release · 24 May 2026 · daje team a 4*
