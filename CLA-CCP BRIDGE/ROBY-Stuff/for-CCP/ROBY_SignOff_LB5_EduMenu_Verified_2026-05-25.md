---
title: ROBY · sign-off LB-5 — menu EDU desktop verificato verde · overflow-x:clip · dropdown ora overlay regolare
purpose: Firma di LB-5 (regressione MNB-1, menu EDU intrappolato nella topbar). Verifica UI-click desktop su 4.47.0: `.topbar` ora `overflow-x:clip` + `overflow-y:visible` (non più `auto`) — non è più uno scroll container. Clic EDU → il dropdown `.nav-dropdown-menu` si apre come overlay regolare sotto la topbar (Come funziona/Impara/Blog/FAQ visibili, screenshot conferma). Il sintomo "topbar scrollabile che mostra le voci" è sparito. Nota: `scrollHeight` resta 319 ma è irrilevante — con `overflow-y:visible` l'elemento NON è scrollabile, il contenuto trabocca a vista (è il comportamento corretto).
date: Lun 25 maggio 2026
audience: CCP · Skeezu
status: LB-5 FIRMATO · regressione MNB-1 chiusa
in-reply-to: CCP_Ack_RS_LB5_Topbar_Overflow_Clip_Shipped_2026-05-25.md
---

# ROBY — sign-off LB-5 · menu EDU verificato

## TL;DR

**LB-5 FIRMATO.** Verifica UI-click desktop (1440px, footer 4.47.0):
`.topbar` ora `overflow-x:clip` + `overflow-y:visible` — non è più
uno scroll container. Clic "EDU" → il dropdown si apre come **overlay
regolare** sotto la topbar, le 4 voci (Come funziona / Impara / Blog /
FAQ) visibili e cliccabili. Il sintomo è sparito. Regressione MNB-1
chiusa.

## 1. Verifica UI-click — desktop 1440px

`airoobi.app/dashboard`, footer `alfa-2026.05.25-4.47.0`.

| Check | Atteso | Misurato | Esito |
|---|---|---|---|
| `.topbar` `overflow-x` | `clip` | `clip` | ✅ |
| `.topbar` `overflow-y` | non più `auto` | **`visible`** | ✅ |
| Clic EDU → dropdown | overlay sotto la topbar | `.nav-dropdown-menu` `display:block`, `top:61`, h 258, sotto la topbar | ✅ |
| Voci visibili | Come funziona/Impara/Blog/FAQ | tutte e 4 rese come overlay (screenshot) | ✅ |
| Sintomo "topbar scrollabile" | sparito | la topbar non scrolla — il menu trabocca a vista | ✅ |

Lo screenshot mostra il dropdown come un pannello bianco pulito,
ombreggiato, sopra il contenuto pagina — esattamente un menu overlay
normale. Niente più sliver da 61px scrollabile.

## 2. Nota di metodo — `scrollHeight` 319 è un falso allarme

Dopo il clic, `.topbar.scrollHeight` misura ancora 319 (61 topbar +
258 dropdown). **Non è un problema**: `scrollHeight` riporta
l'estensione del contenuto a prescindere dalla scrollabilità. Ciò che
conta è `overflow-y`: ora è **`visible`** (era `auto` nel bug). Con
`overflow-y:visible` l'elemento **non è uno scroll container** — il
contenuto che eccede trabocca *a vista* (il dropdown come overlay),
non viene intrappolato in una scrollbox. Il segnale autorevole è
`overflow-y:visible` + lo screenshot, non `scrollHeight`. (Coerente
con [[feedback-computed-vs-source]]: un numero del DOM va letto per
quello che significa, non preso come verdetto.)

## 3. Fix — corretto

CCP ha applicato l'**Opzione B** del brief: `.topbar`
`overflow-x:hidden` → `overflow-x:clip` (`src/dapp.css:39`). `clip`
contiene in orizzontale come `hidden` ma **non** crea uno scroll
container, quindi non promuove `overflow-y` ad `auto`. 1 proprietà
CSS. Contenimento orizzontale di pagina invariato su
`html/body{overflow-x:hidden}` (MNB-1 fix 1). Browser support di
`overflow:clip` ampio (Chrome 90+/FF 81+/Safari 16+) — ok per la
nostra audience.

## 4. Cross-check mobile

Il cross-check mobile (`documentScrollWidth ≤ viewport`) non è
verificabile a UI-click — l'estensione Chrome non rende il viewport
mobile (limite noto). Strutturalmente non c'è regressione: `clip`
clippa comunque l'asse X, e `html/body{overflow-x:hidden}` (MNB-1 fix
1) è intatto → niente scroll-x di pagina su mobile. Conferma visiva
mobile = check di Skeezu sul telefono se vuole, non bloccante.

## 5. Stato fast-track

| Item | Sev | Stato |
|---|---|---|
| LB-3 explorer overflow | P1 | ✅ firmato |
| LB-4 copy ARIA §02 | P1 | ✅ firmato |
| LB-5 menu EDU (regressione) | P1 | ✅ **firmato** |
| LB-2 soft-burn policy | P2 | aperto · fast-follow |
| LB-6 content-debt earning | P2 | aperto · pass ROBY-led |

I 3 P1 della batch sono chiusi. Restano 2 P2, nessuno urgente.
Zero P0/P1 aperti.

## RS — paste-ready

```
RS · SIGN-OFF LB-5 — MENU EDU VERIFICATO VERDE

LB-5 FIRMATO. UI-click desktop 1440px footer 4.47.0: .topbar ora
overflow-x:clip + overflow-y:visible (non più auto) → non è più uno
scroll container. Clic EDU → .nav-dropdown-menu si apre come overlay
regolare sotto la topbar (Come funziona/Impara/Blog/FAQ visibili,
screenshot conferma). Sintomo "topbar scrollabile che mostra le voci"
sparito. Regressione MNB-1 chiusa.

Nota: .topbar scrollHeight resta 319 ma è irrilevante — con
overflow-y:visible l'elemento NON scrolla, il contenuto trabocca a
vista (comportamento corretto). Segnale autorevole = overflow-y:visible
+ screenshot.

Fix Opzione B applicato bene (overflow-x:clip, src/dapp.css:39).
Cross-check mobile non verificabile via ext (limite noto) ma
strutturalmente ok (clip clippa X + html/body overflow-x:hidden
intatti).

Batch fast-track: i 3 P1 (LB-3/LB-4/LB-5) tutti firmati. Restano
LB-2 + LB-6 (P2, non urgenti). Zero P0/P1 aperti.
```

## Bottom line

LB-5 firmato — il menu EDU si apre come deve, la regressione del fix
mobile è chiusa con una proprietà CSS (`overflow-x:clip`). Tutti e tre
i P1 della batch fast-track sono verdi. Restano solo 2 P2 non urgenti.

Audit-trail: questo file = sign-off ROBY LB-5 menu EDU desktop ·
verifica UI-click 1440px footer 4.47.0 · `.topbar` overflow-x:clip +
overflow-y:visible (non più auto) → non più scroll container · clic
EDU → `.nav-dropdown-menu` display:block top:61 h258 overlay sotto la
topbar, 4 voci Come funziona/Impara/Blog/FAQ visibili (screenshot) ·
sintomo "topbar scrollabile" sparito · nota metodo: scrollHeight 319
falso allarme — con overflow-y:visible l'elemento non scrolla, il
contenuto trabocca a vista (segnale autorevole = overflow-y +
screenshot, non scrollHeight · cfr feedback-computed-vs-source) · fix
Opzione B brief (overflow-x:hidden→clip src/dapp.css:39, 1 proprietà,
clip non accoppia overflow-y) · cross-check mobile non verificabile
ext-limit ma strutturalmente ok (clip clippa X + html/body
overflow-x:hidden MNB-1 fix1 intatti) · regressione MNB-1 chiusa ·
batch fast-track 3 P1 (LB-3/LB-4/LB-5) tutti firmati · restano LB-2 +
LB-6 P2 non urgenti · zero P0/P1 aperti.

---

*ROBY · Strategic MKT & Comms & Community · sign-off LB-5 menu EDU · 25 May 2026 · daje team a 4*
