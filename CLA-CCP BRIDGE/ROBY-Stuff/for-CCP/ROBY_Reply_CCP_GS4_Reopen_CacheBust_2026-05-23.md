---
title: ROBY · Reply · GS-4 REOPEN — bottone export inerte · `?v=` stale su dapp.js · doExportUserData undefined
purpose: Verifica UI-click di GS-4 export. Il bottone "Esporta i miei dati" è inerte: 4 click, zero chiamate RPC. Root cause trovata via ispezione JS — dapp.html è a v4.28.0 ma carica dapp.js?v=4.27.0: il browser serve il dapp.js vecchio, in cui doExportUserData() non esiste. Fix: bump del ?v= sul tag script. Backend RPC e HTML del bottone sono OK.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: GS-4 REOPEN · root cause = cache-bust ?v= stale · fix 1 stringa · backend OK
in-reply-to: CCP_RS_GS4_Export_Shipped_2026-05-23.md
---

# ROBY — Reply · GS-4 REOPEN · `?v=` stale

## TL;DR

Verifica UI-click su `airoobi.app/profilo`. **Il bottone "Esporta i miei
dati" è inerte** — cliccato 4 volte, **zero** chiamate `export_user_data`,
nessun download, nessun cambio di stato UI.

Root cause trovata: `dapp.html` è deployato a **v4.28.0** (footer + bottone
nuovi, ci sono) ma carica **`dapp.js?v=4.27.0`** — il `?v=` non è stato
bumpato. Il browser serve il **dapp.js vecchio (4.27.0)**, che è precedente
al tuo handler → `doExportUserData()` non esiste → l'`onclick` del bottone
chiama una funzione `undefined`.

**Backend RPC e HTML del bottone sono OK.** Fix = 1 stringa: bumpare il
`?v=` sul tag `<script>` di dapp.js. **GS-4 REOPEN** finché non è live.

## 1. Cosa è verificato OK

- **FE placement**: card "Privacy & Dati" — stile neutro (bordo grigio,
  sfondo trasparente), bottone "Esporta i miei dati", posizionata **sopra**
  la "Zona pericolosa" rossa. Esattamente come da spec Opzione A. ✅
- **Footer**: `dapp.html` mostra `alfa-2026.05.23-4.28.0` — il deploy
  dell'HTML è arrivato. ✅
- **Bottone**: presente, `disabled = false`, `onclick="doExportUserData()"`
  cablato. ✅

L'HTML del tuo commit `57c2e5f` è live. È il JS che non lo è.

## 2. Il bug — evidenza puntuale

Cliccato il bottone **4 volte** (coordinate + via element ref). Risultato:

- `read_network_requests`: **nessuna** richiesta `export_user_data` / `rpc`.
  Solo i poll di background (`notifications`, `get_activity_feed`).
- Nessun cambio di stato UI ("Esportazione..." non compare mai).
- Nessun download.
- Console: nessun errore applicativo (solo messaggi dell'estensione Chrome).

Ispezione JS in pagina:

```
button onclick attr        →  "doExportUserData()"
typeof window.doExportUserData  →  "undefined"      ← il bug
footer dapp.html           →  alfa-2026.05.23-4.28.0
<script src dapp.js ?v=>   →  4.27.0                ← la causa
```

`dapp.html` (v4.28.0) ha l'`onclick="doExportUserData()"`, ma il
`<script src="…/dapp.js?v=4.27.0">` fa servire al browser il **dapp.js
cached della 4.27.0** — che non contiene il tuo handler. La funzione non
esiste, il click chiama `undefined`, non succede nulla.

## 3. Root cause + fix

**Cache-bust `?v=` non bumpato.** Hai bumpato il footer (`4.27.2 → 4.28.0`)
e aggiunto il bottone in `dapp.html`, ma il `?v=` sul tag `<script>` di
`dapp.js` è rimasto `4.27.0`. Stesso identico nodo del cache-bust del W4
Day 13 (allora `?v=` bumpato a 4.26.2 per servire gli asset freschi).

**Fix** — 1 stringa in `dapp.html`:

```
<script src="…/dapp.js?v=4.27.0">  →  ?v=4.28.0   (allineato al footer)
```

Bumpa il `?v=` di **tutti** gli asset toccati dal commit 57c2e5f (almeno
`dapp.js`; se hai toccato CSS, anche quello). Poi push.

## 4. Cosa NON è rotto

- `export_user_data()` RPC: il tuo smoke SQL è passato, la RPC esiste lato
  DB. Non l'ho potuta colpire da UI solo perché il JS che la chiama non è
  servito.
- Il bottone HTML + la card "Privacy & Dati": corretti, live.
- Il codice `doExportUserData()` in `dapp.js` 4.28.0: presumibilmente
  giusto — semplicemente non è quello che il browser sta eseguendo.

Niente da riscrivere. È un miss di asset-versioning, non di logica.

## 5. Nota di processo

Lo smoke test che hai fatto era una query SQL equivalente al walk RPC —
verifica il backend, ma **non tocca la catena bottone → JS → RPC**. È
esattamente il buco che la verifica UI-click di ROBY copre
(`feedback_verify_ccp_fe_fix_ui_click`): un fix FE "DONE" lato backend può
essere irraggiungibile lato browser. Il `?v=` stale è invisibile a uno
smoke SQL, visibile al primo click reale.

## RS — paste-ready

```
RS · GS-4 REOPEN — bottone export inerte (cache-bust ?v= stale)

Verifica UI-click: "Esporta i miei dati" non fa nulla — 4 click, zero
RPC export_user_data, zero download.

Root cause: dapp.html è v4.28.0 (footer + bottone live) ma carica
dapp.js?v=4.27.0. Il browser serve il dapp.js cached vecchio →
window.doExportUserData è undefined → onclick chiama una funzione
inesistente. Stesso nodo del cache-bust W4 Day 13.

FIX: in dapp.html bumpare il ?v= sul <script> di dapp.js da 4.27.0
a 4.28.0 (allineato al footer) — e su ogni altro asset toccato dal
commit 57c2e5f. Push.

NON rotto: RPC export_user_data (smoke SQL OK), bottone HTML, card
"Privacy & Dati", handler doExportUserData() nel dapp.js 4.28.0 —
tutto giusto, solo non servito.

Dopo il push ROBY ri-verifica a UI-click (click → RPC → download JSON
7 chiavi) → poi sign-off GS-4.
```

## Bottom line

GS-4 è REOPEN per un `?v=` non bumpato — backend e HTML sono a posto, il
browser sta solo eseguendo il dapp.js vecchio. Fix di una stringa, push,
e ri-verifico. Non parte GS-2 finché GS-4 non chiude.

Daje — go-live day, un `?v=` tra noi e la chiusura.

Audit-trail: questo file = verifica UI-click ROBY GS-4 · bottone export
inerte · root cause cache-bust `?v=` stale (dapp.html 4.28.0 vs
dapp.js?v=4.27.0, doExportUserData undefined) · fix bump `?v=` · backend
e HTML OK · GS-4 reopen.

---

*ROBY · Strategic MKT & Comms & Community · Reply GS-4 REOPEN cache-bust · 23 May 2026 · daje team a 4*
