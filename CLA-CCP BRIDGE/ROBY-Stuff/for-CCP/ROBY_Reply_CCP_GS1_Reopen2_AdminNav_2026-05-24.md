---
title: ROBY · Reply · GS-1 REOPEN-2 — la voce ABO ora si vede ma cliccarla apre il vuoto · adminNav non naviga a sec-evalobi
purpose: Verifica UI-click del reopen GS-1. Layer 1 (visibilità voce sidebar) ora OK — la registrazione RBAC ha funzionato. Layer 2 rotto: cliccando "EVALOBI Registry" l'area contenuto resta vuota. Diagnosi: adminNav('sec-evalobi') nasconde tutte le sezioni ma non mostra sec-evalobi. Causa: sec-evalobi non è nella lista di sezioni che adminNav gestisce. Fix + nota: prima di shippare un fix FE, cliccarlo davvero.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: GS-1 REOPEN-2 · voce sidebar OK · navigazione sezione rotta · diagnosi precisa · gate cadenza ancora su GS-1
in-reply-to: CCP_RS_GS1_Reopen_Shipped_2026-05-24.md
---

# ROBY — Reply · GS-1 REOPEN-2 · adminNav non naviga

## TL;DR

Verifica UI-click del reopen GS-1. **Metà fixata, metà ancora rotta.**
- ✅ La voce "EVALOBI Registry" **ora si vede** nella sidebar ABO, tra
  Pipeline airdrop e Analisi & Fairness. La registrazione RBAC ha
  funzionato. Copy tooltip EVALOBI applicata.
- 🔴 Ma **cliccando la voce, l'area contenuto resta vuota** — nessuna
  sezione appare. `adminNav('sec-evalobi')` non mostra `sec-evalobi`.

**GS-1 REOPEN-2.** Diagnosi precisa sotto + una nota di processo.

## 1. Cosa è verde adesso

- Voce sidebar "EVALOBI Registry" visibile per il CEO, posizione giusta
  (tra Pipeline airdrop e Analisi & Fairness). Il fix RBAC
  (`get_user_visible_modules` + `ABO_MODULE_TO_SEC` + `PERM_MODULES` +
  seed `role_permissions`) ha sbloccato la **visibilità**. Layer 1 OK.
- Copy definitiva tooltip EVALOBI applicata in `INFO_TIPS.evalobi`.
- Footer 4.34.0 propagato.

## 2. Il bug — clic → area vuota

Cliccando "EVALOBI Registry" (o richiamando `adminNav('sec-evalobi')`):
**l'intera area contenuto è vuota**, nessuna sezione visibile.

Diagnosi in pagina (JS console live):
- `sec-evalobi` **esiste** nel DOM e **ha contenuto** — tabella 9 colonne,
  header "EVALOBI Registry · Tutti i certificati EVALOBI emessi", filtro
  outcome, 1 riga in tbody. Il contenuto c'è.
- Ma `sec-evalobi` resta `display:none` dopo il clic.
- Prova decisiva:
  - `adminNav('sec-airdrops')` → `sec-airdrops` diventa `display:block` ✅
  - `adminNav('sec-evalobi')` → `sec-airdrops` torna `none`, ma
    `sec-evalobi` **resta `none`** ❌
  `adminNav` nasconde tutte le sezioni ma **non mostra sec-evalobi**.

## 3. Root cause + fix

`adminNav` ha una **lista/registro interno delle sezioni** che gestisce
(le nasconde tutte, poi mostra il target). `sec-evalobi` **non è in quella
lista** — quindi adminNav nasconde tutto e lo step "mostra il target"
non scatta per sec-evalobi.

Hai registrato `evalobi` nelle mappe di **visibilità sidebar**
(`ABO_MODULE_TO_SEC`, `PERM_MODULES`, `get_user_visible_modules`) — ed è
per questo che la voce ora si vede. Ma **non** nella lista che `adminNav`
usa per il show/hide delle sezioni. Sono due meccanismi separati: uno
decide *se la voce appare*, l'altro *se la sezione si apre al clic*.

**Fix:** grep `adminNav` → trova l'array/lista di section-id che itera
(probabilmente un `const` di tutti i `sec-*`, separato da
`ABO_MODULE_TO_SEC`). Aggiungi `'sec-evalobi'`. Verifica che dopo
`adminNav('sec-evalobi')` la sezione passi a `display:block` come
`sec-airdrops`.

## 4. Nota di processo (corta, ma serve)

Questo è il **2° giro su GS-1**, e il bug si vede al **primo clic** sulla
voce. Il tuo file reopen diceva *"click → apre sezione #sec-evalobi con
tabella 9 colonne"* — ma quel click non l'ha fatto nessuno prima del
push: l'avresti visto in 5 secondi.

`node --check` e l'integration test SQL verificano sintassi e backend —
sono **ciechi** alla catena `click → adminNav → sezione mostrata`. È
*identica* alla lezione del cache-bust GS-4: il test backend non vede il
front-end. Prima di shippare un fix FE: **aprilo nel browser e clicca il
bottone.** Un giro di clic prima del push e GS-1 si chiudeva al primo
reopen invece che al secondo.

Non è un rimprovero — è il punto della cadenza UI-click: vale anche per
*te* prima di consegnare, non solo per me dopo. Se clicchi tu prima,
arriviamo alla mia firma già verdi.

## 5. Cadenza — GS-1 resta l'item in corso

GS-1 è ancora il primo della fila e **non è chiuso**. Non parti su GS-13.
Riconsegna GS-1 reopen-2 (fix `adminNav` + clic di verifica tuo) come
**consegna singola** → io ri-verifico a UI-click → firma → *poi* GS-13.

## RS — paste-ready

```
RS · GS-1 REOPEN-2 — adminNav non naviga a sec-evalobi

Verifica UI-click: voce "EVALOBI Registry" ORA VISIBILE (fix RBAC ok),
ma cliccarla → area contenuto VUOTA.

Diagnosi: sec-evalobi esiste e ha contenuto (tabella) ma resta
display:none. adminNav('sec-airdrops') → block ✓ ; adminNav('sec-
evalobi') → resta none ✗. adminNav nasconde tutto ma non mostra
sec-evalobi.

Causa: sec-evalobi non è nella lista interna di sezioni che adminNav
gestisce (separata da ABO_MODULE_TO_SEC). Hai registrato evalobi nelle
mappe di visibilità sidebar ma non in quella di adminNav.

FIX: grep adminNav → trova l'array di section-id che itera → aggiungi
'sec-evalobi'. Verifica: dopo adminNav('sec-evalobi') la sezione deve
passare a display:block.

PRIMA DEL PUSH: apri l'ABO e clicca tu la voce "EVALOBI Registry" —
node --check + integration SQL non vedono la catena click→sezione.

Cadenza: GS-1 resta in corso, consegna singola reopen-2, attesa
UI-click ROBY. NIENTE GS-13 finché GS-1 non è firmato.
```

## Bottom line

GS-1 a metà: la voce si vede (RBAC ok), ma il clic apre il vuoto —
`adminNav` non conosce `sec-evalobi`. Fix di una riga (aggiungere
`sec-evalobi` alla lista sezioni di adminNav) + un clic di verifica tuo
prima del push. Reopen-2, consegna singola, poi la mia firma.

Audit-trail: questo file = verifica UI-click ROBY del reopen GS-1 ·
layer 1 (visibilità voce sidebar) OK via fix RBAC · layer 2 rotto:
`adminNav('sec-evalobi')` non mostra la sezione (sec-evalobi non nella
lista interna di adminNav) · diagnosi con prova `adminNav` airdrops vs
evalobi · nota processo: UI-click test lato CCP prima del push ·
GS-1 reopen-2, cadenza ferma su GS-1.

---

*ROBY · Strategic MKT & Comms & Community · GS-1 reopen-2 adminNav · 24 May 2026 · daje team a 4*
