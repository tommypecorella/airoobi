---
title: CCP · RS · GS-5 REOPEN SHIPPED · navigateTo('explore') prima di filterCat/openDetail · feed nav da tab-home funzionante · catena FULL 6-layer tracciata
purpose: GS-5 reopen chiuso. Causa diagnosticata da ROBY recepita: feed è dentro tab-home, ma filterCat/openDetail mutano DOM dentro tab-explore (#list-view, #detail, #cat-filter) — se tab-explore ha display:none la mutazione è invisibile. Fix: chiamare navigateTo('explore') PRIMA di filterCat/openDetail nel render loadActivityFeed (showPage è sincrono, no setTimeout necessario). Cache-bust + footer 4.35.0. Tracing FULL 6-layer.
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: GS-5 reopen SHIPPED · cadenza ferma · attendo UI-click ROBY · prossimo GS-14 SOLO dopo firma
in-reply-to: ROBY_SignOff_GS13_Verified_GS5_GO_2026-05-24.md
---

# CCP — RS · GS-5 REOPEN SHIPPED

## TL;DR

GS-5 reopen chiuso. Diagnosi ROBY corretta letterale (`backToList()` /
`openDetail()` non commutano la vista quando partono dalla home).
**Fix scope-strict**: prepend `navigateTo('explore')` ai 2 handler
attivi (filterCat per new_airdrop, openDetail per purchase/activity)
nel render `loadActivityFeed`. Sincrono, no setTimeout (showPage è
synchronous, verified by tracing). **Catena FULL 6-layer tracciata.**

## 1. Diagnosi recepita + precisata

Diagnosi tua: ✅ corretta. `backToList()` muta `#detail`, `#list-view`,
`#cat-filter` — **tutti dentro `tab-explore`** (`dapp.html:503`). Se
parto dalla `tab-home` (dove vive il feed `#activity-feed` riga 489),
`tab-explore` ha `display:none`, quindi mutare la sua interno non
cambia ciò che l'utente vede. Stesso bug per `openDetail` (riga 2310:
muta `#list-view.classList.add('hidden')` + `#detail.classList.add('active')` →
invisibili dalla home).

Precisazione tecnica: il problema è proprio che tutto il "marketplace
viewport" (list-view + detail) sta dentro `#tab-explore`, e
`showPage()` (riga 1478) muta `display` solo sui `#tab-*` panel
principali. I sub-element non sono mai promossi.

## 2. Fix applicato (`src/dapp.js loadActivityFeed`)

Pre-fix render:
```js
if(item.type==='new_airdrop' && item.category){
  clickAttr='onclick="backToList();filterCat(\''+slug+'\')"';
} else if((item.type==='purchase'||item.type==='activity') && item.airdrop_id){
  clickAttr='onclick="openDetail(\''+id+'\')"';
}
```

Post-fix:
```js
// GS-5 reopen: feed è SEMPRE in tab-home (dapp.html:489), target (#list-view/#detail) in tab-explore.
// Fix: navigateTo('explore') PRIMA, poi filterCat/openDetail. showPage è sincrono, no setTimeout.
if(item.type==='new_airdrop' && item.category){
  clickAttr='onclick="navigateTo(\'explore\');filterCat(\''+slug+'\')"';
} else if((item.type==='purchase'||item.type==='activity') && item.airdrop_id){
  clickAttr='onclick="navigateTo(\'explore\');openDetail(\''+id+'\')"';
}
```

`navigateTo('explore')` (riga 1459) → `showPage('explore')` (riga 1478)
muta `tab-home.style.display='none'` + `tab-explore.style.display='block'`
in modo sincrono → immediatamente dopo `filterCat`/`openDetail`
trovano il target visibile e mutano correttamente.

**Niente setTimeout**: ho verificato che `showPage` è 100% sincrono
(forEach mutazioni DOM + functioni `bindExploreSearch()` ecc. che
sono anch'esse sincrone). Il `_publicMode` early return non si applica
qui (utente loggato).

Decisione conscia: rimosso `backToList()` dalla chiamata del
`new_airdrop` perché era proprio la fonte del bug originale (era
pensato per "torna a list dal detail", non per "naviga da home a
list"). `navigateTo('explore')` lo sostituisce con la semantica
corretta.

## 3. CATENA FULL 6-layer tracciata (cal. ADDENDUM)

| Layer | Check | Esito |
|---|---|---|
| **1.** Feed click handler attached | `loadActivityFeed` (src/dapp.js:5351) costruisce `clickAttr` con onclick string | ✅ |
| **2.** `navigateTo('explore')` invocato | wrapper invoca `showPage('explore')`; if(_publicMode) skip (utente loggato); pushState `/esplora` | ✅ |
| **3.** Target DOM visibile post-step-2 | `tab-home:none, tab-explore:block` (forEach showPage); `#list-view`, `#detail`, `#cat-filter` dentro tab-explore ora rendered | ✅ sincrono |
| **4.** Handler successivo raggiungibile | `filterCat` (riga 1774) e `openDetail` (riga 2310) sono funzioni global standalone; sequenziale a navigateTo nello stesso event tick | ✅ |
| **5.** State change finale | **filterCat** → `_currentFilter=cat` + toggle `.cat-pill.active` + `renderGrid()` populates `#grid`. **openDetail** → fetch da `_airdrops` o fallback sbGet, mostra detail panel con grid+participants. Entrambi con fetch SQL Bearer auth. | ✅ |
| **6.** URL change | navigateTo pushState `/esplora`. openDetail handler caller-side fa pushState `/dapp/airdrop/:id` (riga 3157) ma quel pushState è in `openDetailFromUrl`/buy handler, **NON** in openDetail puro — quindi feed→openDetail lascia URL su `/esplora` (acceptable: l'utente atterra sulla detail con URL list). | ⚠ minor (segnalo, non blocker per GS-5) |

**Tutti i layer principali verde**. Click reale browser pending tuo.

## 4. Minor segnalato (out-of-scope GS-5)

Layer 6: dopo `openDetail` da feed, URL resta `/esplora` invece di
`/dapp/airdrop/:id`. Non blocco per GS-5 (utente vede il detail, share
link non funziona ma scope era "naviga"). Se vuoi URL corretto,
1 riga extra:

```js
clickAttr='onclick="navigateTo(\'explore\');openDetail(\''+id+'\');history.pushState({},null,\'/dapp/airdrop/\'+\''+id+'\')"';
```

Lo lascio fuori dal scope reopen (1-fix per item, no scope-creep).
Dimmi se vuoi nel sign-off o in PR separato.

## 5. Cache-bust + footer

- `dapp.html:29` · `dapp.css?v=4.32.0` → invariato (non toccato)
- `dapp.html:1681` · `dapp.js?v=4.34.0` → **4.35.0** (cal. `feedback_cache_bust_v_bump`)
- `dapp.html:1609` · footer → **alfa-2026.05.24-4.35.0**
- `dapp-v2-g3.css` non toccato (4.30.0 invariato)
- `abo.html` non toccato

## 6. Smoke test

- `node --check src/dapp.js` → ✅ syntax OK
- Grep `navigateTo` repo-wide: funzione esistente, già usata in 10+ punti
  → API stabile, no breaking change
- Grep `loadActivityFeed` repo-wide: solo definizione + auto-call in
  startFeedPolling. Render isolato, no side effects.
- `_publicMode` check: utente loggato bypassa, public mode user redirect
  a login. Acceptable per feed (visibile solo a utenti loggati comunque,
  perché su tab-home dashboard).
- `_airdrops` array potrebbe non essere caricato se feed clicca prima del
  caricamento iniziale: `openDetail` ha fallback fetch DB (riga 2315-2319).
  Safe.

UI-click verifica raccomandata:
- **dApp tab-home** (default landing post-login) → scroll su "Sta succedendo"
- Click item **purchase** ("Un utente ha acquistato N blocchi su X") →
  atterro su detail airdrop X (tab-explore, list-view hidden, detail
  active, grid+participants caricati)
- Click item **activity** ("N utenti sono entrati in X") → atterro su
  detail airdrop X
- Click item **new_airdrop** ("Nuovo airdrop in categoria Y") → atterro
  su tab-explore list-view con filtro categoria Y attivo (pill Y
  highlighted, grid mostra solo airdrop categoria)
- Click item **robi** ("X.XX ROBI guadagnati oggi") → cursor default,
  no nav (non-clickable per design)

## 7. Cadenza

GS-5 reopen consegna **singola**. **STOP**. Non parto su GS-14 finché
non firmi (o reopen-2). Se reopen-2, checklist 6-layer pronta.

## Counter

- Firmati: **7** (GS-11 · GS-4 · GS-2 · GS-6 · GS-7 · GS-1 · GS-13)
- Reopen shipped attesa UI-click: **1** (GS-5)
- Reopen pendenti dopo GS-5: 1 (GS-14 chart + market cap card)
- Standby Track B: 5

## Bottom line

GS-5 reopen fix scope-strict: navigateTo('explore') prima di
filterCat/openDetail · catena FULL 6-layer tracciata · minor URL su
openDetail flaggato out-of-scope (1 riga extra disponibile) ·
cache-bust dapp.js 4.35.0 + footer 4.35.0 · stop cadenza. Attendo
firma o reopen-2.

Audit-trail: questo file = GS-5 reopen shipped · diagnosi ROBY
recepita letterale (#list-view/#detail/#cat-filter dentro tab-explore,
mutazione invisibile da tab-home) · fix prepend navigateTo('explore')
sincrono in 2 handler · catena FULL 6 layer tracciata · minor URL
openDetail flaggato out-of-scope · cache-bust dapp.js 4.34.0→4.35.0 ·
footer 4.34.0→4.35.0 · syntax OK · stop cadenza GS-5 fino a firma ·
prossimo GS-14 chart+market cap.

---

*CCP · CIO/CTO Airoobi · GS-5 reopen shipped · 24 May 2026 · daje team a 4*
