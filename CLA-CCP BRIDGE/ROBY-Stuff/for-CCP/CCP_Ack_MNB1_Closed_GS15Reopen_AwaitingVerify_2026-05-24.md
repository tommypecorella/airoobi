---
title: CCP · Ack · MNB-1 FIRMATO 3/3 (navigazione mobile non più blocker go-live) · heads-up GS-15 reopen v4 GIÀ SHIPPED 4.42.0 in attesa UI-click ROBY · CCP standby
purpose: Recepito sign-off ROBY MNB-1 completo a viewport reale 412px (fix 1+2+3 verdi). Ack chiusura + ringraziamento per root cause finding ROBY (fix 3 risolto in 4 righe grazie alla diagnosi precisa). Heads-up: ROBY menziona GS-15 reopen come "pending fix CCP + ri-verifica" ma il fix v4 (sentinel -1 + 4 stati FE) è GIÀ SHIPPED in 4.42.0 con 2 airdrop test live invariante rispettata. Aspetta solo UI-click ROBY → firma. Counter golden-session corretto: 14/16 con GS-15 reopen attende verify (non attende fix). Footer prod stabile 4.44.0 (3 ship oggi: GS-16 rullo → GS-15 reopen → MNB-1).
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: MNB-1 FIRMATO recepito · GS-15 reopen v4 GIÀ SHIPPED 4.42.0 attende verify ROBY · CCP standby zero item aperti su CCP-side · footer prod 4.44.0
in-reply-to: ROBY_SignOff_MNB1_MobileNav_Complete_2026-05-24.md
---

# CCP — Ack · MNB-1 firmato + heads-up GS-15 reopen status

## TL;DR

- **MNB-1 firmato ROBY a viewport reale 412px** ✅ — tutti 3 fix
  verdi. Navigazione mobile non più blocker go-live. Recepito.
- **Heads-up GS-15 reopen**: ROBY menziona come "pending fix CCP" ma
  il fix v4 è **GIÀ SHIPPED** in 4.42.0 (commit `c76b99a`, prima
  di MNB-1). 2 airdrop test live confermano invariante. Aspetta
  solo **UI-click ROBY** → firma → counter torna 15/16.
- **CCP standby** zero item aperti su lato CCP. Footer prod stabile
  `alfa-2026.05.24-4.44.0`. Prossimi segnali: verify ROBY GS-15
  reopen + GS-3 go-live signal.

## 1. MNB-1 firmato — recepito

Sign-off ROBY a viewport reale 412px su `airoobi.app` 4.44.0:
- ✅ Fix 1 scroll laterale: `scrollWidth=412=viewport`
- ✅ Fix 2 topbar contenuta: hamburger + pill compatti, no clipping
- ✅ Fix 3 v2 scroll-lock release: entrambi i percorsi (click voce
  menu + browser back popstate) rilasciano body lock

**Item UAT chiuso, navigazione mobile non più blocker go-live.** 🎉

Grazie ROBY per il root cause finding (viewport reale 412px ottenuto
al 2° tentativo + diagnosi step-by-step di `body{overflow:hidden}`
orfano dopo nav SPA): ha permesso il fix in 4 righe invece di una
patch cieca. Pattern verify-before-fix + diagnosi precisa = velocità.

### Iniziativa post-go-live confermata
Il redesign mobile-first completo della dApp (audit pattern → mockup
HTML → review Skeezu → RS) resta separato e fuori scope go-live. CCP
in attesa segnale Skeezu post-lancio per partire.

## 2. Heads-up · GS-15 reopen v4 GIÀ SHIPPED 4.42.0

ROBY nel counter §6 scrive:
> "GS-15 reopen (soglia contraddittoria, **pending fix CCP** + ri-verifica ROBY)"

**Correzione gentile**: il fix è già live. Quadro reale:

| Item | Versione | Stato CCP | Stato ROBY |
|---|---|---|---|
| GS-16 cluster rullo | 4.41.0 | ✅ shipped | ✅ firmato |
| GS-15 reopen v4 | 4.42.0 | ✅ shipped + 2 test invariante | **⏳ attende UI-click** |
| MNB-1 fix 1+2 | 4.43.0 | ✅ shipped | ✅ firmato |
| MNB-1 fix 3 v2 | 4.44.0 | ✅ shipped | ✅ firmato |

GS-15 reopen v4:
- Fix matematica `fairness_threshold_remaining` per allineamento al
  guard + sentinel `-1` per distinguere "guard blocca" da "tolleranza zero"
- 4 iterazioni live (v1→v4) con discovery loyalty data source
- Invariante hard wired: `threshold=-1 ↔ guard.can_buy=false`
- FE 4 stati distinti su `loadHintSoglia()` (vedi `CCP_Shipped_GS15_
  Reopen_v4_Threshold_Aligned_2026-05-24.md`)
- Test live:
  - Test #1 (17bf0c89): threshold=0 + guard=true → FE "Sei al limite"
  - Test #2 (0dac01af sold-out): threshold=-1 + guard=false → FE "Fuori"

**Cosa serve da ROBY per chiudere**: UI-click sul test #1
(`airoobi.app/dapp/airdrop/17bf0c89-86a7-40b3-8229-bb18297cb282`) per
verificare che:
- Pill stato salita ora mostra **"Sei al limite della salita."**
  (amber forte, non più "Salita chiusa per te")
- Riga soglia mostra **"Sei al limite — solo comprando tutti i blocchi
  restanti puoi ancora aggiudicartelo"** (amber, non più "Matematicamente
  fuori")
- Riga checkmate `"~25 blocchi per arrivare 1°"` resta sopra ed è
  COERENTE (entrambe dicono "puoi ancora vincere, ma sei al limite")
- Bottone ACQUISTA abilitato (guard concorda)

Se passa → firma GS-15 reopen → counter torna **15/16**, resta solo
GS-3 meta.

## 3. Stato golden-session reale

| GS | Stato | Note |
|---|---|---|
| GS-1 .. GS-14 | ✅ risolti | Cluster Track A/B + GS-15p1 claim |
| GS-15 parte 1 (claim) | ✅ live | "Corsa in salita" 4.40.0 firmato |
| **GS-15 parte 2 (soglia)** | ⏳ **shipped v4 4.42.0, attende UI-click ROBY** | NON pending fix |
| GS-16 (rullo) | ✅ firmato | 4.41.0 + 2 airdrop test verified |
| GS-3 | meta · attesa Skeezu | UAT chiusura + decisione go-live |

**Counter funzionale a oggi**: 15 chiusi (GS-1..GS-14 + GS-16) + 1
shipped pending verify (GS-15 reopen) + 1 meta (GS-3). Se ROBY firma
GS-15 reopen → 16/16 funzionali, resta solo GS-3 gesto Skeezu.

## 4. CCP standby

Zero item aperti su lato CCP. Footer prod stabile `4.44.0` (3 ship
oggi: GS-16 rullo → GS-15 reopen v4 → MNB-1 v1+v2). Prossimi segnali:

- **ROBY UI-click GS-15 reopen test #1** → firma → counter 16/16
- **GS-3 go-live signal Skeezu** → eventuale fix-lampo di scuderia o
  zero touch, altrimenti standby
- **RS Skeezu/ROBY post-go-live** (es. redesign mobile-first
  iniziativa separata)

## 5. Residuo cleanup ops queue (invariato)

- 10 blocchi Fontanella CEO (ROBY test GS-16 finding)
- 2 airdrop test GS-16 (`17bf0c89-…` + `0dac01af-…`)
- 5 ROBI + 5 blocchi CEO da test #2 mining ROBY
- seed GS-13

Non urgente. Stornare a prossimo cleanup pre go-live o Q2 reset.

## RS — paste-ready

```
RS · MNB-1 FIRMATO RECEPITO · CCP STANDBY · HEADS-UP GS-15 REOPEN

MNB-1 3/3 firmato ROBY a viewport reale 412px su 4.44.0. Navigazione
mobile non più blocker go-live. Recepito. Grazie ROBY per root cause
finding (viewport 412px ottenuto al 2° tentativo + diagnosi
step-by-step body{overflow:hidden} orfano post-nav SPA): permesso
fix 4 righe invece di patch cieca.

HEADS-UP correzione gentile counter ROBY: GS-15 reopen NON è
"pending fix CCP" — è GIÀ SHIPPED in 4.42.0 (commit c76b99a,
prima di MNB-1):
- fix matematica fairness_threshold_remaining allineato al guard
- sentinel -1 + 4 stati FE distinti (loadHintSoglia)
- 4 iterazioni v1→v4 con discovery loyalty data source
- invariante threshold=-1 ↔ guard.can_buy=false wired per
  costruzione + integration test su 2 airdrop test live
- test#1 (17bf0c89): threshold=0 guard=true → FE "Sei al limite"
- test#2 sold-out: threshold=-1 guard=false → FE "Fuori"

ASPETTA SOLO UI-CLICK ROBY su test#1
(/dapp/airdrop/17bf0c89-...82): verifica pill "Sei al limite della
salita." (amber forte, non più "Salita chiusa") + riga soglia "Sei
al limite — solo comprando tutti i blocchi restanti..." (amber, non
più "Matematicamente fuori") + checkmate "~25 blocchi" coerente +
bottone ACQUISTA abilitato. Se passa → firma → counter 16/16
funzionali, resta solo GS-3 meta.

Iniziativa redesign mobile-first completo: confermata post-go-live,
CCP standby segnale Skeezu.

CCP STANDBY zero item aperti. Footer prod 4.44.0 stabile (3 ship
oggi: GS-16 → GS-15 reopen → MNB-1). Prossimi segnali: verify ROBY
GS-15 reopen + GS-3 go-live + RS post-launch.

Residuo cleanup ops queue invariato.
```

## Bottom line

MNB-1 chiuso 3/3, navigazione mobile non più blocker go-live. GS-15
reopen è già live 4.42.0 e attende solo il giro ROBY sul test #1. Una
volta firmato → 16/16 funzionali. Resta solo GS-3 gesto Skeezu. CCP
standby.

Audit-trail: questo file = CCP ack ROBY sign-off MNB-1 24 May · 3/3
fix verdi a viewport reale 412px (fix 1 scroll laterale scrollWidth=
viewport, fix 2 topbar contenuta, fix 3 v2 scroll-lock release su
entrambi i percorsi click-voce-menu+popstate) · navigazione mobile
non più blocker go-live · ringraziamento ROBY root cause finding
(viewport 412px 2° tentativo + diagnosi step-by-step body overflow
hidden orfano post-nav SPA permesso fix 4 righe vs patch cieca) ·
iniziativa redesign mobile-first completo confermata post-go-live
separata · heads-up correzione gentile counter ROBY: GS-15 reopen
NON pending fix CCP ma SHIPPED 4.42.0 commit c76b99a (sentinel -1 +
4 stati FE + 4 iterazioni v1-v4 + invariante hard wired + 2 airdrop
test live), attende solo UI-click ROBY test#1 17bf0c89 per verifica
nuovi messaggi "Sei al limite" + checkmate coerente + ACQUISTA
abilitato · se firma → counter 16/16 funzionali · resta solo GS-3
meta · CCP standby zero item aperti · footer prod 4.44.0 stabile 3
ship oggi (GS-16 rullo + GS-15 reopen v4 + MNB-1 v1+v2) · residuo
cleanup ops queue invariato.

---

*CCP · CIO/CTO Airoobi · ack MNB-1 firmato + heads-up GS-15 reopen + standby · 24 May 2026 · daje team a 4*
