---
title: CCP · RS · GS-1 REOPEN-2 SHIPPED · rimosso inline style:display:none da sec-evalobi · root cause precisata (CSS specificity, non lista adminNav) · memo lezione salvata
purpose: GS-1 reopen-2 chiuso. Diagnosi ROBY corretta sul sintomo (click apre vuoto) ma root cause tecnica era CSS-specificity inline-vs-class, non "sec-evalobi fuori dalla lista adminNav". adminNav già itera correttamente .admin-section (sec-evalobi è in quella class). Bug vero: inline style="display:none" (riga 1147) vince per specificity 1000 contro .admin-section.active{display:block} (~20) aggiunto da adminNav. Fix 1 riga. Tracing manuale eseguito al posto del click reale (Pi 5 senza GUI). Memo lezione salvata: tracing CSS-specificity prima di shippare fix FE.
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: GS-1 reopen-2 SHIPPED · cadenza ferma · attendo UI-click ROBY finale prima di GS-13
in-reply-to: ROBY_Reply_CCP_GS1_Reopen2_AdminNav_2026-05-24.md
---

# CCP — RS · GS-1 REOPEN-2 SHIPPED

## TL;DR

GS-1 reopen-2 chiuso, fix 1-riga, **tracing manuale CSS-specificity
verde**. Da Pi 5 senza GUI non posso fare click reale browser — il
UI-tester finale resti tu. Memo persistente salvata
(`feedback_ui_click_trace_before_push.md`) per evitare ricaduta sul
prossimo fix FE. Cadenza ferma: **stop su GS-1, attendo tua firma**.

## 1. Diagnosi precisata (recepita + raffinata)

Diagnosi tua: ✅ sul **sintomo** (click → area vuota) e ✅ sulla
**direzione** (visibility sidebar vs adminNav sono meccanismi
separati). 

Ma la causa tecnica esatta che ho trovato durante il tracing è
**diversa**:

| Tua diagnosi | Realtà tracing |
|---|---|
| "sec-evalobi non è nella lista interna di adminNav" | `adminNav` itera `querySelectorAll('.admin-section')` — e `sec-evalobi` **è** nella class `.admin-section` (riga 1147), quindi è nella lista |
| "fix: aggiungere `'sec-evalobi'` alla lista di adminNav" | Lista già lo contiene. Vero bug: **inline `style="display:none"`** (riga 1147 originale) vince per CSS-specificity (inline = 1000) contro la `.admin-section.active{display:block}` (specificity ~20) che adminNav aggiunge via `classList.add('active')`. Il `.active` viene aggiunto correttamente ma il browser computa `display:none` perché inline wins. |

Sintomo identico, fix completamente diverso (1 attributo HTML invece
di JS array push). Tua diagnosi visibile + direzionale è oro per
sbloccare, ma poi devo tracciare io la root cause prima di fixare.
Salvato come prassi nel memo `feedback_ui_click_trace_before_push.md`
(citazione esplicita del caso "ROBY ha detto X, root reale era Y").

## 2. Tracing manuale step-by-step (sostituto del click reale)

Da Pi 5 / OpenClaw / headless **non ho browser GUI** per fare click
reale. Tracing = sostituto manuale:

1. **Click target**: `abo.html:288` `<div class="admin-sidebar-item"
   onclick="adminNav('sec-evalobi')">EVALOBI Registry</div>` →
   invoca `adminNav` (è wrapper, vedi sotto)
2. **Wrapper chain** (`abo.html:1296-1304`):
   ```js
   const _origNav = window.adminNav;  // ref originale
   window.adminNav = function(secId){
     _origNav(secId);
     if (secId === 'sec-evalobi') loadEvalobiTable();
   };
   ```
   → wrapper chiama originale prima, poi `loadEvalobiTable()` se match.
3. **adminNav originale** (`abo.html:1789-1805`):
   ```js
   document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
   document.getElementById(sectionId).classList.add('active');
   ```
   → `sec-evalobi` (ha class `admin-section`) prende `.active` ✅
4. **CSS resolution post-mutation**:
   - `.admin-section{display:none}` (riga 60, default · specificity 10)
   - `.admin-section.active{display:block}` (riga 61, override · specificity 20)
   - **Pre-fix**: inline `style="display:none"` (riga 1147 originale ·
     specificity 1000) → wins → sec-evalobi `display:none` ❌
   - **Post-fix**: niente inline style → `.admin-section.active{display:block}`
     wins → sec-evalobi `display:block` ✅
5. **loadEvalobiTable** invocato dal wrapper → popola tbody ✅ (era
   già OK al reopen-1, solo non-visibile)

**Tracing verde**. Resta a te il click reale browser.

## 3. Fix applicato

`abo.html:1146-1147`:
```html
<!-- PRIMA -->
<!-- ═══ W4 · sec-evalobi · EVALOBI registry admin view ═══ -->
<div class="admin-section" id="sec-evalobi" style="display:none">

<!-- DOPO (commento esplicito sul fix) -->
<!-- ═══ W4 · sec-evalobi · EVALOBI registry admin view (GS-1 reopen-2: rimosso inline style:display:none che bloccava .active da adminNav) ═══ -->
<div class="admin-section" id="sec-evalobi">
```

Diff: 1 attributo rimosso. Pattern coerente con le admin-section
**già live** (sec-overview, sec-airdrops, sec-treasury, ecc.) che
hanno solo `class="admin-section"` senza inline style → la `.active`
class funziona come da CSS design.

## 4. Out-of-scope (volontariamente non toccato)

Stessa anomalia inline `style="display:none"` su 3 altre sezioni
"dormienti":
- `sec-disputes` (riga 1160)
- `sec-swaps` (riga 1173)
- `sec-tx-explorer` (riga 1188)

**Non le ho toccate** perché out-of-scope GS-1 (no sidebar item che
le chiami al momento). Se vuoi le sblocchi insieme in un PR separato
quando uno di quei moduli diventa attivo. Flag per audit-trail: la
stessa lezione (`feedback_ui_click_trace_before_push`) si applicherà
identica quando uno di loro verrà attivato.

## 5. Memo lezione salvata

`feedback_ui_click_trace_before_push.md` salvata + indicizzata in
MEMORY.md. Contiene:
- Regola: tracing manuale CSS-specificity prima di shippare fix FE
- Checklist veloce: grep inline `style="display`, grep `!important`,
  read handler + classlist mutation, check `_origNav`-style wrapper
- Caso concreto GS-1 reopen-2 con citazione esplicita "ROBY ha detto
  X, root reale era Y" → recepire sintomo+direzione ma verificare
  root cause io
- Da Pi 5 senza GUI: tracing manuale = sostituto del click. ROBY
  resta UI-tester finale. Flaggare esplicito nella shipped.
- Link a [[feedback-one-item-ui-click-gate]] (cadenza),
  [[feedback-cache-bust-v-bump]] (altro fix FE-only che richiede
  browser refresh), [[feedback-verify-fe-replicate-call]] (verifica
  fix FE = replicare chiamata FE, non SQL).

## 6. Nota di processo accolta

Hai ragione: il bug si vedeva al primo click. Non ho cliccato perché
non posso (no GUI), ma **non ho neanche fatto tracing manuale** —
quello SÌ era nel mio reach. Memo creata per non ripetere. La
prossima fix FE: tracing prima di node --check.

## 7. Cache-bust + footer

- `abo.html` modificato (HTML inline · niente asset esterni nuovi) →
  niente cache-bust. Il browser ricarica HTML on refresh.
- `dapp.html` non toccato → footer resta `alfa-2026.05.24-4.34.0`
- `dapp.css` / `dapp.js` non toccati → versioni 4.34.0 invariate

(Cal. `feedback_cache_bust_v_bump`: solo se tocco `src/*.js` o
`src/*.css`. Qui solo HTML statico, no asset versioned.)

## 8. Cadenza

GS-1 reopen-2 shippato singolo. **STOP**. Non parto su GS-13 finché
non firmi. Se reopen-3, lo recepisco con stesso pattern (sintomo →
tracing root reale → fix mirato → memo se serve).

## Counter

- Firmati: **5** (GS-11 · GS-4 · GS-2 · GS-6 · GS-7)
- Reopen shipped attesa UI-click: **1** (GS-1, reopen-2 di seguito)
- Reopen pendenti dopo GS-1: 2 (GS-5 nav · GS-14 chart/market cap)
- Richeck pendente: 1 (GS-13 discriminante)
- Standby Track B: 5

## Bottom line

GS-1 reopen-2 fix 1-riga (inline display:none rimosso) · diagnosi
tua sintomo+direzione recepita, root cause precisata (CSS specificity
non lista adminNav) · tracing manuale al posto del click reale (Pi 5
no GUI) · memo `feedback_ui_click_trace_before_push.md` salvata ·
stop cadenza · GS-13 NON iniziato. Attendo firma o reopen-3.

Audit-trail: questo file = GS-1 reopen-2 shipped · root cause
precisata vs diagnosi ROBY (CSS-specificity inline-vs-class, non
"lista adminNav") · fix 1 attributo HTML rimosso da abo.html:1147 ·
tracing manuale step-by-step (5 layer) sostituto click reale Pi 5 ·
3 altre sezioni dormienti con stesso bug flaggate out-of-scope ·
memo `feedback_ui_click_trace_before_push.md` salvata + MEMORY.md
aggiornato · no cache-bust (solo HTML statico) · stop cadenza GS-1
fino a firma ROBY.

---

*CCP · CIO/CTO Airoobi · GS-1 reopen-2 shipped · 24 May 2026 · daje team a 4*
