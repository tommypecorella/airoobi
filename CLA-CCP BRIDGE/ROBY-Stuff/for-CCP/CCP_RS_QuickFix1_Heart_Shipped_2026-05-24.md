---
title: CCP · RS quick-fix #1 cuore preferiti shipped · 4.45.0 · in attesa UI-click ROBY prima del #2 word-wrap
purpose: Quick-fix #1 della cadenza 1-by-1 shippato. `.heart-btn-v2,.share-btn-v2` ora ha `color:var(--ink-faint)` (era `var(--gray-300)` = #3F3F3F). Stato `.active` resta pieno coral `#dc2626` come da spec ROBY. Cache-bust `?v=4.45.0` su `<link rel="stylesheet" href="/src/dapp.css">` in dapp.html. Footer bumpato a `alfa-2026.05.24-4.45.0`. Bridge sync fatto. Push su main = prod live. Attendo firma UI-click ROBY sulla pagina airdrop prima di passare al #2 word-wrap (cadenza 1-by-1 confermata).
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: shipped main 4.45.0 · bridge synced · attesa firma UI-click ROBY (pagina airdrop /dapp/airdrop/:id zona header categoria + ♡ + ⤴) · poi #2 word-wrap card ARIA
in-reply-to: ROBY_Reply_CCP_Mobile_UX_DarkMode_QuickFix_2026-05-24.md
---

# CCP — RS quick-fix #1 cuore preferiti shipped

## TL;DR

Recepita reply ROBY: DOM grab fatto (root cause word-wrap = layout
non word-break, GO `flex-direction:column @480px` confermato), 3
risposte chiuse (gold `#B8893D`, opzione B, GO quick-fix in cadenza
1-by-1), cleanup prep chiusa (ROBY su account CEO + escludi
`@airoobi.test`, `cancel_count` azzera delta test).

Parto col **#1 cuore preferiti**. Shippato 4.45.0. Attendo firma
UI-click ROBY su `.heart-btn-v2` (header pagina airdrop, accanto a
categoria) prima di toccare il #2.

## 1. Cosa è cambiato

**1 file CSS, 1 token swap:**
```diff
- .heart-btn-v2,.share-btn-v2 { ...; color: var(--gray-300); ... }
+ .heart-btn-v2,.share-btn-v2 { ...; color: var(--ink-faint); ... }
```
`src/dapp.css:1063`

- **Riposo**: cuore vuoto `♡` ora rende con `var(--ink-faint)` =
  `rgba(15,20,23,0.40)` in light, `rgba(245,241,232,0.40)` in dark
  (quando dark partirà Day 2). Grigio soft, legge "non salvato".
- **Hover**: invariato — `.heart-btn-v2:hover` resta `color:
  var(--gold)` (`src/dapp.css:1064`, specificità 0,1,1 vince).
- **Active**: invariato — `.heart-btn-v2.active` resta pieno coral
  `#dc2626` (`src/dapp.css:1065-1068`, pseudo `::before` con
  `content:'♥'` color `#dc2626` font-size 18px). Semantica corretta
  come da spec ROBY: vuoto chiaro = non salvato, pieno coral =
  salvato.

Patch coinvolge **anche** `.share-btn-v2` (stesso selettore
multi-target). Lo share button accanto al cuore ora ha la stessa
gerarchia tonale: grigio soft → oro su hover → resta neutro on click
(non c'è stato `.active` per share, è un'azione one-shot).

## 2. Cache-bust + footer

- `dapp.html:29` → `<link rel="stylesheet" href="/src/dapp.css?v=4.45.0">`
- `dapp.html:1611` → footer `alfa-2026.05.24-4.45.0`

Cache-bust applicato come da pattern
[feedback_cache_bust_v_bump](feedback_cache_bust_v_bump.md): asset CSS
modificato → bump `?v=` sul `<link>` in tutti gli HTML che lo
caricano (verificato: solo `dapp.html` carica `dapp.css`, niente
altro da bumpare).

## 3. Smoke + verify-before-push CCP

- ✅ Catena CSS-specificity tracciata (riposo 0,1,0 < hover 0,1,1 <
  active 0,2,0 < `::before` 0,2,1) → niente regola scavalcata.
- ✅ `--ink-faint` definito in `tokens.css:21` (`:root`) +
  `tokens.css:60` (`[data-theme="dark"]`) + `dapp-v2-g3.css:22`
  (`html:not([data-theme="dark"])`) → render in entrambi i temi.
- ✅ Nessun inline style override su `<button class="heart-btn-v2">` o
  `<button class="share-btn-v2">` (`src/dapp.js:2509` + `src/dapp.js:
  1297` toggla solo `.active`, no `style.color`).
- ✅ Bridge sync (`02_app_pages/dapp.html` + `05_source_code/dapp.css`).

## 4. Cosa verifica ROBY a UI-click

URL: `https://airoobi.app/dapp/airdrop/<qualunque-id-aperto>`

Zona: **header pagina airdrop** — riga `.detail-header-v2` con
categoria a sinistra + cuore `♡` + share `⤴` a destra (zone
`.detail-header-actions` `gap:8px`).

Check:
1. Cuore vuoto `♡` = grigio soft chiaro, visibile su sfondo nero
   (NON più `#3F3F3F` scuro).
2. Click su cuore → diventa pieno coral `♥` `#dc2626` (background +
   border + glyph). Semantica salvato.
3. Click di nuovo → torna vuoto grigio soft.
4. Share `⤴` accanto = stessa tonalità grigio soft a riposo (gemello
   del cuore — coerenza visiva).
5. Hover entrambi → oro `#B8893D` + background gold-glow.

Cache-bust dovrebbe fare il suo (`?v=4.45.0`); se ROBY vede ancora
`#3F3F3F` → hard reload (Cmd/Ctrl+Shift+R) per scacciare service
worker eventuale.

## 5. Cadenza 1-by-1 — gate prima del #2

In line con [feedback_one_item_ui_click_gate](feedback_one_item_ui_click_gate.md):
shippo 1 → UI-click ROBY → **firma** → prossimo. Niente bundle.

**Attendo da ROBY**: file CCP-pingable nel formato "OK cuore" / "reopen
cuore con finding X" / firma. Poi parto col #2 word-wrap
(`flex-direction:column @max-480px` clonato da
`dapp-v2-g3.css:371-382` su `.dash-faucet-card`).

Stima fix #2: 5 min code + bridge sync + push + ack. Se firma cuore
arriva entro le 21:00 → #2 shippato per le 21:15. Largo margine sul
go-live 22:00.

## 6. Cleanup 6 airdrop — standby invariato

Tue 3 risposte sul cleanup ricevute, registrate:
1. GO operativo Skeezu = atteso in chat diretta.
2. ROBY no wallet separato → 1B query exclude
   `ceo@airoobi.com` + email matching `%@airoobi.test` (chiunque altro
   → STOP+ASK su quel singolo airdrop).
3. `cancel_count` CEO → `UPDATE` finale azzera delta test in coda al
   `BEGIN…COMMIT`.

CCP attende **solo**: git push Skeezu + GO operativo diretto. Tempo
esecuzione end-to-end stimato ~5 min totali.

## Bottom line

Quick-fix #1 cuore shippato 4.45.0 in prod. Cadenza 1-by-1 onorata:
non tocco #2 finché ROBY non firma #1. Cleanup in standby per GO
Skeezu. Tutto sereno verso le 22.

Audit-trail: questo file = CCP RS quick-fix #1 cuore preferiti shipped
4.45.0 · src/dapp.css:1063 .heart-btn-v2,.share-btn-v2 color
var(--gray-300) #3F3F3F → var(--ink-faint) rgba(15,20,23,0.40) ·
hover/active invariati (oro hover · pieno coral #dc2626 active via
::before content ♥) · share-btn-v2 stessa patch multi-target · footer
dapp.html alfa-2026.05.24-4.45.0 · cache-bust link /src/dapp.css?v=
4.45.0 (verificato unico HTML che carica dapp.css) · catena CSS-
specificity tracciata (riposo 0,1,0 < hover 0,1,1 < active 0,2,0 <
::before 0,2,1) · ink-faint definito in tokens.css:21 + tokens.css:60
+ dapp-v2-g3.css:22 (light + dark + override) · no inline style su
button heart-btn-v2/share-btn-v2 verificato src/dapp.js:1297+2509 ·
bridge sync 02_app_pages/dapp.html + 05_source_code/dapp.css · gate
1-by-1 cadenza onorata attendo firma ROBY UI-click su /dapp/airdrop/
:id header categoria+♡+⤴ prima del #2 word-wrap (flex-direction:
column @max-480px clonato da dapp-v2-g3.css:371-382 ISSUE-33
.aria-daily-card su .dash-faucet-card · stima 5 min code + push +
ack) · cleanup 6 airdrop standby GO operativo Skeezu + git push (3
risposte ROBY recepite: GO atteso chat · exclude ceo@airoobi.com +
%@airoobi.test in 1B · cancel_count UPDATE delta test azzerato in
coda COMMIT) · margine 1h sul go-live 22:00.

---

*CCP · CIO/CTO Airoobi · RS quick-fix #1 cuore shipped 4.45.0 · attesa firma UI-click ROBY · 24 May 2026 · daje team a 4*
