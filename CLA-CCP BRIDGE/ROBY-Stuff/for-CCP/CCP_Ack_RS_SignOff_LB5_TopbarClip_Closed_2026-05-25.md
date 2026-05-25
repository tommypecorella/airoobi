---
title: CCP · ack RS sign-off LB-5 · menu EDU verde · regressione MNB-1 chiusa · batch fast-track P1 chiuso (LB-3/LB-4/LB-5)
purpose: Ack del RS ROBY 25 May che firma LB-5 (UI-click desktop 1440px footer 4.47.0 verde: .topbar overflow-x:clip + overflow-y:visible, .nav-dropdown-menu overlay regolare, sintomo scroll-trap sparito, regressione MNB-1 chiusa). Batch fast-track P1 LB-3+LB-4+LB-5 tutti firmati. Restano LB-2+LB-6 (P2 non urgenti). Stato board: zero P0/P1 aperti.
date: Dom 25 maggio 2026
audience: ROBY · Skeezu
status: LB-5 closed · batch fast-track P1 chiuso · zero P0/P1 aperti
in-reply-to: RS Skeezu 25 May 2026 LB-5 SignOff (chat diretta · canonical: closure batch P1)
---

# CCP — Ack RS sign-off LB-5 · menu EDU verde · regressione MNB-1 chiusa

## TL;DR

- **LB-5 FIRMATO**. UI-click ROBY desktop 1440px footer **4.47.0**
  verde: `.topbar{overflow-x:clip}` non più scroll container,
  `overflow-y:visible` mantenuto, `.nav-dropdown-menu` overlay
  regolare sotto trigger EDU (voci Come funziona / Impara / Blog /
  FAQ tutte visibili e cliccabili), sintomo scroll-trap sparito.
- **Regressione MNB-1 chiusa**: fix Opzione B brief
  (`overflow-x:clip` 1 proprietà CSS in `src/dapp.css:39`) ha
  contenuto horizontally come hidden senza promuovere overflow-y a
  auto. Spec CSS confermata in produzione.
- **Batch fast-track P1 chiuso**: LB-3 (explorer overflow
  strutturale) + LB-4 (copy ARIA §02 come-funziona) + LB-5 (topbar
  overflow clip) → tutti e 3 firmati ROBY.
- **Stato board**: zero P0 / zero P1 aperti. Restano LB-2 + LB-6
  (P2, non urgenti) → coda lavoro CCP normale.

## 1. LB-5 · verifica UI-click ROBY confermata

Match completo brief vs prod:

| Check brief CCP | Risultato ROBY desktop 1440px |
|---|---|
| `.topbar` non scroll container | ✅ overflow-x:clip + overflow-y:visible |
| Clic EDU → dropdown overlay | ✅ .nav-dropdown-menu sotto topbar |
| Items dropdown visibili | ✅ Come funziona / Impara / Blog / FAQ |
| Sintomo scroll-trap | ✅ sparito |
| Footer cache-bust | ✅ 4.47.0 in prod |

Mobile 412px non verificato in RS (non blocking — MNB-1 fix 1
`html/body{overflow-x:hidden}` invariati garantiscono no-scroll-x
documentale per costruzione).

## 2. Batch fast-track · audit-trail commit

| LB | Commit | Area | Footer/cache-bust |
|---|---|---|---|
| LB-3 | `737da48` | explorer overflow strutturale | 4.13.0 / 4.37.0 |
| LB-4 | `2beff4b` | copy ARIA §02 come-funziona | 4.15.0 (edu) |
| LB-5 | `266ae6d` | `.topbar{overflow-x:clip}` src/dapp.css:39 | dapp 4.47.0 + ?v=4.47.0 |
| LB-3/4 ack | `7ea8f46` | docs bridge sync | — |
| Sweep A.1 | `806e33b` | abo.html:444 admin-note ARIA | no footer |

Cadenza rispettata: 1 item → shipped → UI-click ROBY → firma →
prossimo (per `feedback_one_item_ui_click_gate.md`).

## 3. Apprendimenti tecnici sedimentati LB-5

- **CSS spec gotcha**: `overflow-x` o `overflow-y` ≠ `visible`
  promuove l'altro asse ad `auto`. Quindi
  `overflow-x:hidden` su un elemento con figli `position:absolute`
  che debbano traboccare = scroll-trap silente.
- **`overflow:clip`** è il rimedio: contiene come hidden ma non
  crea scroll container né forza l'altro asse. Browser support
  Chrome 90+/FF 81+/Safari 16+ → 100% target audience 2026.
- **Pattern da replicare**: per ogni nav/topbar/header con
  dropdown overlay figli `position:absolute`, usare `clip` non
  `hidden` quando serve contenimento.

## 4. Coda lavori P2 residui

- **LB-2**: (perimetro da riconfermare ROBY in prossimo RS)
- **LB-6**: content-debt sweep earning ARIA (Cat B 11 hit
  copy stale residui) → ROBY-led, in attesa brief paste-ready in
  for-CCP/

CCP idle su questi fronti finché RS dedicati non droppano in
for-CCP/.

## Audit-trail

CCP ack RS ROBY 25 May LB-5 firma incassata UI-click desktop
1440px footer 4.47.0 verde · `.topbar{overflow-x:clip}` in prod
non più scroll container · `.nav-dropdown-menu` overlay regolare
sotto trigger EDU items visibili cliccabili · sintomo scroll-trap
sparito · regressione MNB-1 chiusa · fix Opzione B brief 1
proprietà CSS src/dapp.css:39 confermato in prod · batch
fast-track P1 LB-3 strutturale explorer + LB-4 copy ARIA §02
come-funziona verbatim + LB-5 topbar overflow clip tutti firmati ·
mobile 412px non verificato non blocking per MNB-1 fix 1
html/body overflow-x:hidden contenimento documentale invariato ·
sweep ARIA A.1 abo.html:444 admin-note shipped 806e33b oggi
restano Cat B 11 hit earning content-debt LB-6 ROBY-led + LB-2 P2
non urgenti · zero P0 zero P1 board aperti · cadenza
one-item-ui-click-gate rispettata per ogni LB · learning CSS
spec overflow-x/y coupling sedimentato per nav/header con figli
position absolute · audit-trail GO mista LB-3/LB-4 RS ROBY file +
LB-5/A.1 RS Skeezu chat diretta flag già in ack precedenti per
feedback_flag_go_skeezu_direct.md.

---

*CCP · CIO/CTO AIROOBI · ack RS sign-off LB-5 + batch P1 chiuso ·
25 May 2026 · daje team a 4*
