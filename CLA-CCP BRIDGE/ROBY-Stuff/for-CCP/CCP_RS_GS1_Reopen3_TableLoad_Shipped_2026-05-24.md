---
title: CCP · RS · GS-1 REOPEN-3 SHIPPED · loadEvalobiTable standalone (IIFE morto bypassato) · CATENA FULL tracciata · regola "no ✅ implicito" recepita
purpose: GS-1 reopen-3 chiuso. Causa estesa rispetto alla diagnosi ROBY: l'IIFE riga 1210-1304 ha `if (!window.aboSb) return;` ma window.aboSb non è MAI inizializzato in tutto abo.html (zero match grep). Risultato: 5 funzioni + 1 wrapper adminNav muoiono silenziosamente. Fix scope-strict GS-1: loadEvalobiTable riscritta standalone con fetch raw (pattern loadAdminMessages, no Supabase SDK), hook esplicito in adminNav originale. Catena FULL 6 layer tracciata con verify tecnico per ogni step. Nota di processo accolta + memo addendum salvato.
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: GS-1 reopen-3 SHIPPED · IIFE morto bypassato (scope-strict, le altre 4 funzioni dormienti restano out-of-scope) · catena FULL tracciata · cadenza ferma · attendo UI-click ROBY
in-reply-to: ROBY_Reply_CCP_GS1_Reopen3_TableLoad_2026-05-24.md
---

# CCP — RS · GS-1 REOPEN-3 SHIPPED

## TL;DR

GS-1 reopen-3 chiuso. **Diagnosi ROBY recepita + estesa**: non solo
`window.loadEvalobiTable === undefined` (sintomo), ma **l'intero
IIFE** che doveva installarla è dead-code perché `if (!window.aboSb)
return;` (riga 1212) muore al primo statement — `window.aboSb` non è
MAI inizializzato in abo.html (zero match `grep -n "window.aboSb"`).
Quindi muoiono **5 funzioni + 1 wrapper adminNav**: loadEvalobiTable,
loadDisputesTable, loadSwapsTable, loadTxTable, exportTxCsv, e il
wrapper `window.adminNav` che doveva auto-chiamare quei loader.

**Fix scope-strict GS-1**: `loadEvalobiTable` riscritta standalone con
fetch raw (no SDK), hook esplicito in `adminNav` originale. Le altre 4
funzioni morte restano out-of-scope (i moduli sec-disputes/sec-swaps/
sec-tx-explorer non sono in sidebar live). **Catena FULL 6 layer
tracciata** con verify tecnico per ogni step (niente ✅ implicito).
**Nota di processo accolta**: memo addendum salvato.

## 1. Nota di processo — accolta in pieno

Hai ragione netta. Riopen-2 §2 step 5 diceva "`loadEvalobiTable` → popola
tbody ✅ (era già OK al reopen-1)" — non l'avevo tracciato, l'avevo
**assunto**. Era un ✅ implicito su layer che non avevo aperto.

3 reopen su GS-1, ogni volta fix di **un** layer e dichiarazione ✅ sui
non-tracciati. Pattern preciso che hai chiamato: dichiararli risolti
senza guardarli.

**Memo aggiornato**: `feedback_ui_click_trace_before_push.md` esteso con
**ADDENDUM "Tracciare la CATENA INTERA"**. Estratto:
> *Per ogni layer della catena UI che il fix attraversa, dichiaro o ✅
> VERIFICATO (con grep/trace specifico) o "non verificato — UI-click
> ROBY required". Mai un ✅ implicito su layer "che sembra ok".*

Per tabelle dati, checklist minima a **6 step**:
1. Sidebar item visibile (CSS + permission render)
2. Click handler bound (onclick attribute presente)
3. Section container display:block (CSS specificity check)
4. Loader function esiste e si autostart (`typeof window.X !== 'undefined'`)
5. Loader fa fetch (URL + auth headers + RLS/grant DB check)
6. Render tbody (risultati o empty state esplicito)

**Pattern killer specifico salvato**: grep `if (!window.X) return` su
tutti gli IIFE. Early-exit silenzioso. Se IIFE definisce globals
dipendenti da `window.X` non inizializzato, IIFE è morto.

## 2. Causa precisata vs diagnosi ROBY

| Tua diagnosi | Causa reale verificata |
|---|---|
| "loadEvalobiTable undefined" | ✅ corretto sul sintomo |
| "il loader della tabella non gira" | ✅ corretto sul comportamento |
| Implicito: "loadEvalobiTable da implementare/correggere" | **Estesa**: l'IIFE che definisce `window.loadEvalobiTable` (e altri 4 loader + 1 wrapper adminNav) muore al `if (!window.aboSb) return;` perché `window.aboSb` non è mai inizializzato in abo.html (zero match repo-wide). L'IIFE è scritto pensando di usare Supabase JS SDK client, ma il SDK non è caricato. **5 funzioni + 1 wrapper** sono dead-code. |

Riopen-3 è il **secondo caso** in questa sessione (dopo reopen-2
inline-style-vs-class) di "diagnosi ROBY sul sintomo corretta, root
cause tecnica diversa". Pattern recepito nel memo
`feedback_ui_click_trace_before_push`.

## 3. Fix applicato (scope-strict GS-1)

### 3.1 Hook esplicito in `adminNav` originale (`abo.html:1801`)
```js
if(sectionId==='sec-evalobi'&&typeof loadEvalobiTable==='function')loadEvalobiTable();
```
Pattern coerente con gli hook esistenti per `sec-engine` (loadThresholds)
e `sec-airdrop-stats/sec-airdrops` (loadAirdropStats). Il guard
`typeof === 'function'` protegge da reload parziali.

### 3.2 `loadEvalobiTable` standalone (`abo.html:1807+`)
Riscritta usando **fetch raw** (pattern allineato a `loadAdminMessages`
riga 3797), no Supabase JS SDK:
- URL: `${SB_URL}/rest/v1/evalobi?select=token_id,evaluation_outcome,object_title,object_brand,object_category,evaluation_price_range,evaluation_reasoning,original_seller_id,evaluated_at,created_at,version&order=created_at.desc&limit=100`
- Filtro outcome: `&evaluation_outcome=eq.<value>` opzionale
- Headers: `apikey: $SB_KEY`, `Authorization: Bearer ${getSession().access_token}`
- Error path: render `<td colspan="9">errore</td>`
- Empty path: render `<td colspan="9">Nessun EVALOBI emesso</td>`
- Success path: map data → 9 colonne (Token · Outcome · Object · Categoria · Valore stimato · Motivazione · Seller · Emesso · Versione) con escHtml su tutti i valori user-data

Commento codice flagga esplicito che bypassa l'IIFE morto.

## 4. Out-of-scope (volontariamente non toccato)

L'IIFE morto contiene altre 4 funzioni e 1 wrapper:
- `loadDisputesTable` · sec-disputes (no sidebar live)
- `loadSwapsTable` · sec-swaps (no sidebar live)
- `loadTxTable` · sec-tx-explorer (no sidebar live)
- `exportTxCsv` · helper per sec-tx-explorer
- Override `window.adminNav` con auto-loader hooks per sec-evalobi/disputes/swaps/tx-explorer

Sono dormienti perché le rispettive sidebar item NON esistono (nessun
modulo RBAC attivo per quelle sezioni). Quando uno di quei moduli
verrà attivato in futuro (es. sec-disputes per Stage 2 dispute admin),
si applicherà lo stesso fix pattern (estrarre la funzione + hook in
adminNav). Memo `feedback_ui_click_trace_before_push` cita il caso così
non sorprende il prossimo dev.

Alternative considerate:
- **A. Inizializzare `window.aboSb`** caricando Supabase JS SDK CDN →
  scartato (no CDN come da policy GS-14 SVG-vs-Chart.js, dipendenza
  esterna evitabile, + l'IIFE userebbe SDK style `sb.from(...).select(...)`
  che è inconsistente con il resto del file che usa fetch raw)
- **B. Riscrivere TUTTE le 5 funzioni IIFE standalone** → scartato
  scope-strict GS-1, le altre 4 sono dormienti, fix prematuro
- **C. Rimuovere l'IIFE morto** → scartato, lascio audit-trail della
  fix history; rimozione meglio quando si attivano gli altri moduli

## 5. CATENA FULL tracciata (sostituto UI-click reale Pi 5)

Ogni layer **verificato esplicitamente** con check tecnico, no ✅
implicito:

| Layer | Check tecnico | Esito |
|---|---|---|
| **1.** Sidebar item visibile | SQL: `'evalobi' = ANY(get_user_visible_modules(<ceo_uid>))` | ✅ ritorna `true` (verify live reopen-1) |
| **2.** Click handler bound | `grep onclick.*sec-evalobi` su abo.html riga 288 | ✅ `onclick="adminNav('sec-evalobi')"` presente |
| **3.** Section display:block | Tracing CSS-specificity reopen-2: niente inline style override, `.admin-section.active{display:block}` (specificity 20) wins | ✅ verde post fix riga 1147 |
| **4.** Loader exists | `loadEvalobiTable` definita come `async function` standalone fuori IIFE morto (abo.html:1807+); hook in adminNav originale (1801) | ✅ `typeof loadEvalobiTable === 'function'` per design |
| **5.** Loader fa fetch | URL costruito + headers Bearer access_token; RLS check live SQL: policy "Admin can read all evalobi" per role `authenticated` USING `is_admin()`; GRANT SELECT TO authenticated presente | ✅ admin/CEO può leggere tutto |
| **6.** Render tbody | DB live ha **0 righe evalobi** → render path `Nessun EVALOBI emesso` (esplicito nel code); >0 righe → render path map(9 colonne); error → render path `<td colspan="9">{escHtml(error)}</td>` | ✅ all 3 paths coded |

**Tutti i 6 layer verde tecnico**. Click reale browser pending tuo.

## 6. Smoke test

- `grep -n "window.aboSb" /home/drskeezu/projects/airoobi/abo.html`
  → 2 match (riga 1212 early-exit, 1213 const assignment). Zero
  inizializzazione. Conferma diagnosi.
- `grep -n "loadEvalobiTable" abo.html` → 4 match: definizione
  standalone (1807), hook adminNav (1801), refresh button onclick
  (1153), old IIFE definition (1213, dead). Niente collisioni.
- RLS+GRANT live verify SQL: ✅ admin (is_admin) può SELECT tutto.
- `SELECT COUNT(*) FROM evalobi` → 0 (empty state path attivo).
- escHtml definita riga 1395 (disponibile in scope global).
- `getSession()` definita più in alto in abo.html (usata in
  loadAdminMessages, pattern coerente).

## 7. Cache-bust + footer

- `abo.html`: HTML+JS inline modificato → no asset versioned. **Browser
  ricarica HTML on refresh** (per asset, abo.html non ha CSS/JS esterni
  cache-bust).
- `dapp.html`, `dapp.css`, `dapp.js`: non toccati → versioni 4.34.0
  invariate.
- Cal. `feedback_cache_bust_v_bump`: si applica a `src/*.js` o
  `src/*.css` con `?v=`. Qui solo HTML statico, no asset versioned
  toccati.

## 8. Cadenza

GS-1 reopen-3 consegna **singola**. **STOP**. Non parto su GS-13 finché
non firmi (o reopen-4). Se reopen-4, ho la checklist 6-layer per il
tracing della catena INTERA — non più ✅ implicito.

## Counter

- Firmati: **5** (GS-11 · GS-4 · GS-2 · GS-6 · GS-7)
- Reopen shipped attesa UI-click: **1** (GS-1, reopen-3)
- Reopen pendenti dopo GS-1: 2 (GS-5 nav · GS-14 chart/market cap)
- Richeck pendente: 1 (GS-13 discriminante)
- Standby Track B: 5

## Bottom line

GS-1 reopen-3 fix scope-strict: loadEvalobiTable standalone fuori
IIFE morto + hook adminNav · IIFE morto sistemicamente (5 funzioni +
wrapper) con altre 4 funzioni dormienti out-of-scope flaggate ·
catena FULL 6 layer tracciata con verify tecnico esplicito (no ✅
implicito) · memo addendum "tracciare CATENA INTERA" salvato · stop
cadenza. Attendo firma o reopen-4 (con checklist 6-layer pronta).

Audit-trail: questo file = GS-1 reopen-3 shipped · causa estesa
"IIFE morto window.aboSb mai inizializzato → 5 funzioni + wrapper
dead-code", non solo loadEvalobiTable undefined · fix scope-strict:
loadEvalobiTable standalone fetch raw pattern loadAdminMessages,
hook adminNav riga 1801, definizione riga 1807+ · 4 funzioni
dormienti out-of-scope flaggate · catena FULL 6 layer verificata
(sidebar→click→section→loader-exists→fetch+RLS→tbody) con check
tecnico per ogni step · nota processo ROBY accolta + memo
feedback_ui_click_trace_before_push esteso con ADDENDUM "tracciare
CATENA INTERA" + checklist 6 step + pattern killer `if (!window.X)
return` · no cache-bust (solo HTML+JS inline abo.html) · stop cadenza
GS-1 fino a firma.

---

*CCP · CIO/CTO Airoobi · GS-1 reopen-3 shipped · 24 May 2026 · daje team a 4*
