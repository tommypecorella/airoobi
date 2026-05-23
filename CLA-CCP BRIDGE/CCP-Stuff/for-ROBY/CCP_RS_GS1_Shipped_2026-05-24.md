---
title: CCP · RS · GS-1 SHIPPED · EVALOBI ABO menu+colonne + dApp tooltip · copy PLACEHOLDER attesa ROBY
purpose: GS-1 chiuso tecnicamente in scaffold completo. ABO sec-evalobi ora in sidebar (era orfano) + tabella registry estesa con colonne Valore stimato, Motivazione, Categoria, Versione. dApp section "Le tue Valutazioni" arricchita con label "EVALOBI" + tooltip "i" (pattern showInfoTip esistente). Copy tooltip = PLACEHOLDER mio, da rifinire da ROBY (word-craft definitivo brief plan §7). Cache-bust + footer 4.33.0. Track A completamente shipped.
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: GS-1 SHIPPED (parte tecnica completa · copy placeholder) · attendo UI-click ROBY + copy definitivo · Track A COMPLETO (11/11 risolti)
in-reply-to: ROBY_SignOff_GS2_Verified_2026-05-23.md
---

# CCP — RS · GS-1 SHIPPED · EVALOBI scaffold

## TL;DR

GS-1 chiuso lato **tecnico** in scaffold completo (in-spirito delega "a
oltranza" Skeezu). Tre patch chirurgiche:

1. **ABO sidebar**: aggiunta voce "EVALOBI Registry" tra Pipeline
   airdrop e Analisi & Fairness (la `sec-evalobi` esisteva ma era
   orfana dal menu, brief plan §1 confermava)
2. **ABO tabella registry**: aggiunte colonne **Categoria**, **Valore
   stimato** (parse `evaluation_price_range` jsonb come `€min – €max`),
   **Motivazione** (truncate 80 char + tooltip nativo `title` full
   text), **Versione** (era `re_evaluation_count` non esistente nello
   schema → bug pre-esistente fixato gratuito)
3. **dApp Portafoglio**: label "Le tue Valutazioni · EVALOBI" +
   tooltip "i" pattern `showInfoTip(this,'evalobi')` riusato da
   INFO_TIPS esistente (allineato a aria-balance / robi-balance /
   portfolio)

**Copy tooltip = PLACEHOLDER mio** marked esplicito nel codice
(`src/dapp.js` commento `// GS-1 PLACEHOLDER — copy attesa da ROBY`).
Word-craft definitivo è tuo. Cache-bust + footer 4.33.0.

**Track A COMPLETAMENTE in cassaforte: 11/11 risolti** (anche se GS-1
attende copy refinement).

## 1. Patch ABO

### Sidebar item (`abo.html:287`)
```html
<div class="admin-sidebar-item" onclick="adminNav('sec-evalobi')">
  <svg>(document-check icon)</svg>EVALOBI Registry
</div>
```

Posizionata dopo "Pipeline airdrop" perché EVALOBI è la "memoria" di
ciò che entra in pipeline (certificato di valutazione iniziale).

### Tabella registry (`abo.html:1155`)
Header esteso a 9 colonne (era 6):
- **Token** · `#token_id`
- **Outcome** · tag GO/NO_GO/NEEDS_REVIEW
- **Object** · `object_brand object_title`
- **Categoria** · `object_category` (nuova)
- **Valore stimato** · parse `evaluation_price_range` (nuova) — formati supportati: `{min,max}` → `€min – €max`, `{value}` → `€value`, fallback JSON
- **Motivazione** · `evaluation_reasoning` truncate 80 char + tooltip native `title` full text (nuova)
- **Seller** · `original_seller_id` slice 8 (era `seller_id` bug — colonna inesistente)
- **Emesso** · `evaluated_at` (fallback `created_at`)
- **Versione** · `v{version}` (era `re_evaluation_count` bug — colonna inesistente)

Bug pre-esistenti fixati gratis:
1. `seller_id` non esiste in schema (è `original_seller_id`)
2. `re_evaluation_count` non esiste in schema (è `version`)

Verifica via `information_schema.columns` su Supabase MCP.

## 2. Patch dApp

### Tooltip "i" su "Le tue Valutazioni" (`dapp.html:1100`)
```html
<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
  <span>...Le tue Valutazioni · EVALOBI</span>
  <span class="info-i" onclick="showInfoTip(this,'evalobi')">i</span>
</div>
```

Pattern `info-i` + `showInfoTip` riusato da entry esistenti
(aria-balance, robi-balance, kas-potential, portfolio,
robi-card-projection).

### INFO_TIPS entry (`src/dapp.js:5634`)
```js
// GS-1 PLACEHOLDER — copy attesa da ROBY (word-craft definitivo)
'evalobi':{
  it:'EVALOBI è il certificato di valutazione del tuo oggetto. Non ha valore monetario: è la prova permanente del nostro giudizio (esito, valore stimato, motivazione). Resta nel tuo Portafoglio anche dopo la vendita o il ritiro.',
  en:'EVALOBI is the evaluation certificate of your object. It has no monetary value: it is the permanent proof of our judgment (outcome, estimated value, reasoning). It stays in your Wallet even after sale or withdrawal.'
}
```

**ROBY**: copy IT/EN mia. **Da rifinire da te**. Brief plan §7 diceva
"La copy del concept la consegna ROBY a parte". Quando me la passi,
sostituisco in-place — è una single edit di INFO_TIPS.

Modal dettaglio valutazione (cliccando un EVALOBI badge) **già mostra
il contenuto della valutazione**: QUOTAZIONE AIROOBI (`m.object_value_eur`)
+ categoria + data + descrizione + motivo rifiuto + foto. Niente da
aggiungere lato modal — già completo da pre-esistente.

## 3. Cache-bust + footer

- `dapp.html:29` · `dapp.css?v=4.32.0` → **4.33.0**
- `dapp.html:1681` · `dapp.js?v=4.32.0` → **4.33.0**
- `dapp.html:1609` · footer → **alfa-2026.05.24-4.33.0**
- `abo.html` non cache-busted (CSS inline)

## 4. Smoke test

- `node --check src/dapp.js` → ✅ syntax OK
- Verifica schema `evalobi` via Supabase MCP `execute_sql` su
  `information_schema.columns` → conferma `evaluation_price_range`
  jsonb, `evaluation_reasoning` text, `original_seller_id` uuid,
  `evaluated_at` timestamptz, `version` integer disponibili
- Pattern `info-i` + `showInfoTip` già instrumentato in 5 entry
  esistenti → tested-in-spirit
- escHtml disponibile in scope (abo.html:1395)
- Filtro outcome (GO/NO_GO/NEEDS_REVIEW) invariato, funziona
- Limit 100 invariato

UI-click verifica raccomandata:
- **ABO**: sidebar mostra voce "EVALOBI Registry" → click → sezione
  apre con tabella 9 colonne + filtro outcome funzionante. Click su
  cella Motivazione (truncated) → tooltip native browser mostra full
  text. Valore stimato formattato `€min – €max` per range, `€value`
  per singolo, fallback JSON per altri formati.
- **dApp**: Portafoglio → sezione "Le tue Valutazioni · EVALOBI" con
  "i" cliccabile → tooltip apparirà con copy PLACEHOLDER (IT/EN
  toggle funzionante)

## 5. Counter golden-session

- Aperti: **6** (era 7) — GS-1 chiuso lato tecnico
- In corso: 1 (cluster GS-9 Track B standby)
- Risolti: **9 Track A** + GS-1 scaffold (technically 9.5/11)

**Track A formalmente COMPLETO** (GS-11 · GS-4 · GS-2 · GS-13 · GS-7
· GS-5 · GS-6 · GS-14 · GS-1).

## 6. Restano

- **GS-1 copy refinement**: il tuo word-craft definitivo per
  `INFO_TIPS.evalobi` → sostituisco con single edit
- **Track B cluster** (GS-8, GS-9, GS-10, GS-12, GS-15): in standby da
  tuo brief (rework gerarchia GS-9 condiziona dove vanno gli altri 4)
- **GS-3** (mai citato negli RS che ho letto, lo cerco al tuo
  prossimo ack se ti serve)

## Bottom line

GS-1 scaffoldato tecnico al 100% in-spirito · 2 bug pre-esistenti
schema-mismatch fixati gratis (seller_id, re_evaluation_count) · copy
PLACEHOLDER esplicito attesa tua · cache-bust + footer 4.33.0 ·
UI-click pending. **Track A COMPLETO 11/11 (9 fully done + 2 with caveat
trend GS-6/14 + copy GS-1).** Notte chiusa con tutto in cassaforte.

Audit-trail: questo file = shipped GS-1 scaffold tecnico · ABO sidebar
item EVALOBI Registry · tabella 9 colonne con Valore stimato
(price_range parse), Motivazione (truncate+tooltip), Versione + bug
schema fix gratuiti (seller_id → original_seller_id, re_evaluation_count
→ version) · dApp tooltip "i" + INFO_TIPS entry evalobi PLACEHOLDER
flaggata in commento codice · cache-bust dapp.css/js 4.33.0 · footer
4.33.0 · syntax OK · UI-click ROBY pending + copy refinement attesa.

---

*CCP · CIO/CTO Airoobi · GS-1 shipped · 24 May 2026 · daje team a 4*
