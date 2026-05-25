---
title: ROBY · RS fast-track · LB-5 menu EDU rotto su desktop — REGRESSIONE del fix mobile MNB-1 · .topbar overflow-x:hidden accoppia overflow-y ad auto e intrappola il dropdown
purpose: Bug live segnalato da Skeezu, triagiato P1 regressione, riprodotto e root-caused a UI-click. Cliccare "EDU" nella topbar desktop non apre il dropdown come overlay: la .topbar diventa una scatola scrollabile verticale che intrappola il menu. Causa: .topbar computa overflow-y:auto come effetto-accoppiamento dell'overflow-x:hidden aggiunto da MNB-1 fix 2. L'ipotesi di Skeezu (regressione post fix mobile) è confermata. Fix: 1 proprietà CSS.
date: Lun 25 maggio 2026
audience: CCP · Skeezu
status: LB-5 P1 regressione · riprodotta + root cause confermato a UI-click · CCP fixa (bundle con LB-3/LB-4)
in-reply-to: Skeezu · segnalazione bug menu EDU 25 May 2026
---

# ROBY — RS fast-track · LB-5 menu EDU rotto (regressione MNB-1)

## TL;DR

**LB-5 · P1 · regressione.** Cliccare "EDU" nella topbar desktop non
apre il dropdown come overlay: la `.topbar` stessa diventa una
**scatola scrollabile verticale** alta ~61px che **intrappola** il
menu. Riprodotto e root-caused a UI-click. Causa: `.topbar` computa
`overflow-y:auto` — effetto-accoppiamento di `overflow-x:hidden`
aggiunto dal **fix mobile MNB-1 (fix 2)**. **L'ipotesi di Skeezu è
confermata: è una regressione.** Fix = 1 proprietà CSS.

## 1. Repro (Chrome, viewport desktop 1440px)

`airoobi.app/dashboard`, topbar nav visibile, click sulla voce "EDU"
(`nav-dropdown-trigger`, `onclick=toggleDiscoverMenu`):

| Misura | Prima del click | Dopo il click |
|---|---|---|
| `.topbar` `clientHeight` | 61 | 61 |
| `.topbar` `scrollHeight` | 61 | **319** |
| `.topbar` scrollabile? | no | **sì** |

- `.nav-dropdown-menu` (il menu EDU: Come funziona / Impara / Blog /
  FAQ) → `display:block`, `position:absolute`, **altezza 258px**,
  `top:61`, **figlia di `.topbar`** (`insideTopbar:true`).
- 61 (topbar) + 258 (dropdown) = 319 = `scrollHeight` della topbar.

Il dropdown — che dovrebbe comparire **sotto** la topbar come overlay
— resta **dentro** la topbar alta 61px, che diventa scrollabile per
contenerlo. È esattamente ciò che Skeezu descrive: "l'header diventa
scorrevole verticalmente e mostra le voci di menu".

## 2. Root cause — è una regressione di MNB-1

`.topbar` computa: `overflow-x: hidden` + **`overflow-y: auto`**.

`overflow-y:auto` rende la topbar uno scroll container verticale. Una
figlia `position:absolute` (il dropdown) che sfora i 61px della
topbar viene quindi **intrappolata e resa scrollabile dentro la
topbar**, invece di traboccare visibilmente sotto.

Perché `overflow-y` è `auto` se nessuno l'ha scritto? **Regola CSS**:
quando `overflow-x` è impostato a un valore non-`visible` (`hidden`) e
`overflow-y` è lasciato a `visible` (default), il valore usato di
`overflow-y` diventa **`auto`**. È una coppia non rappresentabile, il
browser promuove `visible` ad `auto`.

L'`overflow-x:hidden` su `.topbar` è stato aggiunto dal **fix mobile
MNB-1 (fix 2, "topbar contenuta")** per contenere la topbar
orizzontalmente. Effetto collaterale silenzioso: `overflow-y` →
`auto` → la topbar è diventata uno scroll container → qualsiasi
dropdown `position:absolute` ancorato dentro la topbar viene
intrappolato. Verificato `overflow-x:hidden`+`overflow-y:auto` su
`.topbar` **sia a 412px sia a 1440px** → la regola non è
media-scoped, colpisce anche il desktop.

**Ipotesi di Skeezu confermata: regressione post-fix-mobile.**

(Su mobile il bug non si vede perché il menu mobile `.topbar-mobile-menu`
è `position:fixed` fuori dalla topbar, e la voce EDU è appiattita nei
4 item Come funziona/Impara/Blog/FAQ. Il dropdown `.nav-dropdown-menu`
si manifesta solo dove la nav desktop `.topbar-nav` è visibile.)

## 3. Fix

`.topbar` non deve essere uno scroll container verticale — il
dropdown deve poter traboccare fuori. Due strade, CCP sceglie con
verify-before-fix (grep della regola `.topbar` overflow e del perché
fu messo `overflow-x:hidden`):

- **Opzione A — rimuovere `overflow-x:hidden` da `.topbar`.** Il
  contenimento orizzontale di pagina è già garantito da
  `html{overflow-x:hidden}` (MNB-1 fix 1); quello sulla topbar era
  ridondante. Rimosso → `.topbar` torna `overflow:visible` → il
  dropdown trabocca correttamente.
- **Opzione B — sostituire con `overflow-x:clip`.** Se la topbar
  serve davvero contenuta orizzontalmente, `overflow-x:clip` NON
  accoppia `overflow-y` ad `auto` (`clip` + `visible` è una coppia
  legale): contiene in orizzontale e lascia il dropdown traboccare in
  verticale.

`overflow-y:visible` esplicito da solo **non basta** — con
`overflow-x:hidden` verrebbe ri-promosso ad `auto`. Va tolto/cambiato
l'`overflow-x`.

Frontend-only, 1 proprietà CSS. Cache-bust `?v=` + footer bump.

ROBY verifica a UI-click su desktop: clic EDU → dropdown overlay
sotto la topbar, `.topbar` `scrollHeight == clientHeight` (non
scrollabile).

## 4. Severità & cadenza

**P1 · regressione.** Non è P0 (non blocca login/acquisto/FAI
VALUTARE/treasury), ma è una nav del header rotta su desktop ed è una
regressione introdotta da noi. **Bundle con la batch LB-3/LB-4** che
CCP sta già eseguendo — stessa area (topbar/CSS), stesso giro di
cache-bust.

## RS — paste-ready

```
RS · FAST-TRACK LB-5 — MENU EDU ROTTO (REGRESSIONE MNB-1) · P1

Repro confermata (Chrome desktop 1440px): clic su "EDU" nella topbar
→ .topbar scrollHeight 61→319, diventa scroll container verticale, e
intrappola .nav-dropdown-menu (position:absolute, h258, figlia di
.topbar). Il dropdown non trabocca come overlay: resta dentro la
topbar 61px che si fa scrollabile. = sintomo Skeezu "l'header
diventa scorrevole e mostra le voci di menu".

ROOT CAUSE: .topbar computa overflow-y:auto. È l'effetto-accoppiamento
CSS di overflow-x:hidden (overflow-x non-visible + overflow-y visible
→ overflow-y promosso ad auto). L'overflow-x:hidden su .topbar fu
aggiunto da MNB-1 fix 2 ("topbar contenuta"). REGRESSIONE confermata.
Verificato overflow-x:hidden+overflow-y:auto su .topbar a 412px E a
1440px → non media-scoped, colpisce desktop.

FIX (1 proprietà CSS, verify-before-fix grep .topbar overflow):
- Opzione A: rimuovere overflow-x:hidden da .topbar (il contenimento
  orizzontale è già su html{overflow-x:hidden}, MNB-1 fix 1).
- Opzione B: sostituire con overflow-x:clip (clip non accoppia
  overflow-y ad auto).
overflow-y:visible esplicito da solo NON basta (verrebbe ri-promosso
ad auto da overflow-x:hidden).
Cache-bust ?v= + footer. ROBY verifica UI-click desktop (clic EDU →
dropdown overlay, .topbar non scrollabile).

P1 regressione → BUNDLE con la batch LB-3/LB-4 (stessa area topbar/
CSS, stesso cache-bust).
```

## Bottom line

Menu EDU rotto su desktop = regressione del fix mobile MNB-1.
`.topbar` è diventata uno scroll container per via dell'accoppiamento
`overflow-x:hidden` → `overflow-y:auto`, e intrappola il dropdown.
Fix di 1 proprietà CSS, da bundlare con LB-3/LB-4. Ipotesi Skeezu
confermata.

Audit-trail: questo file = RS ROBY fast-track LB-5 menu EDU rotto
desktop · repro UI-click Chrome 1440px (clic EDU `nav-dropdown-trigger`
toggleDiscoverMenu → `.topbar` scrollHeight 61→319 scrollable true ·
`.nav-dropdown-menu` Come funziona/Impara/Blog/FAQ position:absolute
h258 figlia di `.topbar`) · root cause `.topbar` overflow-y:auto =
effetto-accoppiamento CSS di overflow-x:hidden (overflow-x non-visible
+ overflow-y visible → overflow-y promosso auto) · `overflow-x:hidden`
su `.topbar` aggiunto da MNB-1 fix 2 → REGRESSIONE confermata (ipotesi
Skeezu corretta) · verificato overflow-x:hidden+overflow-y:auto su
`.topbar` a 412px e 1440px non media-scoped colpisce desktop · su
mobile non si vede (`.topbar-mobile-menu` position:fixed fuori topbar
+ EDU appiattito) · fix 1 proprietà CSS: Opzione A rimuovere
overflow-x:hidden da `.topbar` (contenimento già su html{overflow-x:
hidden} MNB-1 fix 1) · Opzione B overflow-x:clip (non accoppia) ·
overflow-y:visible da solo non basta · cache-bust+footer · ROBY
verifica UI-click desktop · P1 regressione bundle con batch LB-3/LB-4.

---

*ROBY · Strategic MKT & Comms & Community · RS fast-track LB-5 menu EDU regressione · 25 May 2026 · daje team a 4*
