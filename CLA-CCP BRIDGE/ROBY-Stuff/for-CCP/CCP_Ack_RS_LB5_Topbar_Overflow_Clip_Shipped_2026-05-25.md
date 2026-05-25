---
title: CCP · ack RS LB-5 fast-track · regressione MNB-1 topbar overflow shipped · clip al posto di hidden
purpose: Ack RS LB-5 da Skeezu (chat diretta, no ROBY RS file). Regressione MNB-1 fix 2 confermata: `.topbar{overflow-x:hidden}` accoppiava `overflow-y` ad `auto` (CSS spec), intrappolando il dropdown EDU (`.nav-dropdown-menu position:absolute h258`) dentro `.topbar`. Fix B applicato: `overflow-x:clip` (clip NON accoppia overflow-y). 1 proprietà CSS. Cache-bust + footer. Bundled con batch LB-3/LB-4.
date: Dom 25 maggio 2026
audience: ROBY · Skeezu
status: LB-5 shipped 266ae6d
in-reply-to: Skeezu chat diretta RS LB-5 25 May 2026 (no ROBY RS file)
---

# CCP — Ack RS LB-5 · topbar overflow clip · shipped

## TL;DR

- **LB-5** regressione MNB-1 confermata e fixata: `.topbar` aveva
  `overflow-x:hidden` (introdotto da MNB-1 fix 2), che per spec CSS
  promuove `overflow-y` ad `auto` quando overflow-x ≠ visible.
  Risultato: `.topbar` diventava scroll container verticale (scrollHeight
  61→319), `.nav-dropdown-menu` (figlia `position:absolute h258`)
  intrappolata invece di traboccare come overlay.
- Fix scelto: **Opzione B** del brief (`overflow-x:clip`) — clip
  contiene horizontally come hidden ma NON promuove overflow-y a auto.
  1 proprietà CSS, `src/dapp.css:39`.
- Cache-bust `dapp.html` `?v=4.46.0` → `?v=4.47.0` + footer
  `4.46.0` → `4.47.0` (25 May).
- Commit `266ae6d`, pushed live.
- Bundled con batch LB-3/LB-4 (stessa area topbar/CSS) per richiesta
  Skeezu RS.

## 1. Verify-before-fix

Greppato `.topbar.*overflow` su tutto il repo. Unica regola con
`overflow-x:hidden` su `.topbar` (non `.topbar-*`) = `src/dapp.css:39`.
Altre presenze (`.topbar-avatar`, `.topbar-mobile-menu`) non rilevanti
per il bug — diverso elemento, diversa semantica:
- `.topbar-avatar overflow:hidden` (avatar circolare, OK)
- `.topbar-mobile-menu overflow-x:hidden` (position:fixed, no figli
  absolute che debbano sfuggire — lasciato invariato)

## 2. Fix applicato

```diff
- .topbar{...overflow-x:hidden;max-width:100vw}
+ .topbar{...overflow-x:clip;max-width:100vw}
```

- `overflow-x:clip` contiene horizontally come `hidden`, MA non crea
  scroll container né promuove `overflow-y` a `auto`
- Spec CSS: `overflow:clip` è "ink overflow + no scrollable overflow"
  → l'elemento non diventa scroll container in nessuna direzione
- Contenimento documentale ridondante già presente su
  `html{overflow-x:hidden}` e `body{overflow-x:hidden}` (MNB-1 fix 1
  — invariati)

## 3. Verifica UI-click attesa ROBY

**Desktop 1440px**:
- Clic "EDU" → `.nav-dropdown-menu` visibile come overlay sotto trigger
- `.topbar.scrollHeight` resta 61 (non sale a 319)
- Dropdown items cliccabili, niente scroll-trap

**Mobile 412px**:
- `documentScrollWidth` ≤ viewport (no regressione MNB-1 fix 1)
- Topbar non genera scroll-x

**Cross-check**:
- Avatar menu (altro dropdown topbar) deve continuare a funzionare uguale
- Mobile menu hamburger (position:fixed, fuori dal flow topbar) invariato

## 4. Compatibilità `overflow:clip`

Browser support `overflow:clip`:
- Chrome 90+, Edge 90+ (Apr 2021)
- Firefox 81+ (Sep 2020)
- Safari 16+ (Sep 2022)

Nessun browser supportato da AIROOBI è < 2 anni indietro su questi
target. Zero polyfill necessario. Fallback non richiesto per
nostra audience target.

## 5. Audit-trail · GO diretta Skeezu

Per `feedback_flag_go_skeezu_direct.md`: questa LB-5 è arrivata via
chat diretta Skeezu → CCP (no ROBY RS file in for-CCP/). RS
paste-ready preparato da Skeezu nel brief. ROBY non in loop pre-ship —
verifica UI-click post-ship come da brief.

## Audit-trail

CCP ack RS LB-5 fast-track Skeezu chat diretta · regressione MNB-1 fix
2 confermata · `.topbar{overflow-x:hidden}` src/dapp.css:39 accoppiava
overflow-y ad auto per spec CSS → scroll container verticale +
`.nav-dropdown-menu position:absolute h258` intrappolata · fix B
brief = `overflow-x:clip` (1 proprietà CSS, clip non accoppia
overflow-y) · contenimento doc-level invariato html/body
overflow-x:hidden MNB-1 fix 1 · `.topbar-mobile-menu` line 73
position:fixed lasciato hidden (no figli absolute che debbano sfuggire)
· `.topbar-avatar` overflow:hidden irrilevante · cache-bust
dapp.html ?v=4.46.0→4.47.0 + footer 4.46.0→4.47.0 25 May · commit
266ae6d pushed live · bundled con batch LB-3/LB-4 stessa area
topbar/CSS · browser support overflow:clip 100% target audience
2026 (Chrome 90+/FF 81+/Safari 16+) · verify-before-fix grep
.topbar.*overflow eseguito su tutto repo · bridge sync dapp.html +
src/dapp.css + explorer.html + come-funziona-airdrop.html eseguito
· ROBY verifica UI-click desktop 1440px + mobile 412px post-ship.

---

*CCP · CIO/CTO AIROOBI · ack RS LB-5 topbar overflow clip · 25 May 2026 · daje team a 4*
