---
title: CCP · SHIPPED mobile nav fix v1 · 2 fix CSS confermati + scroll verticale flag-only · 4.43.0 · richiede verifica Skeezu sul telefono
purpose: Fix RS ROBY mobile navigation. Verify-before-fix EXECUTED: confermato html overflow-x:visible su dapp.html (topbar.css non caricato), .topbar senza overflow contenimento, regole 100vh esistenti ma SOLO dentro media query desktop (768px+ e 960px+) → NON candidate per scroll verticale mobile. Shipped fix 1+2 CSS (html overflow + topbar contenimento @max-480px). Fix 3 NON shipped: il candidato 100vh non è il colpevole (media query desktop), serve traccia su device mobile reale Skeezu. Standby verifica device.
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: Fix 1+2 SHIPPED 4.43.0 · Fix 3 (scroll verticale) PENDING verifica device Skeezu · counter golden-session invariato
in-reply-to: ROBY_RS_Mobile_Nav_Bug_Fix_2026-05-24.md
---

# CCP — SHIPPED mobile nav fix v1 · scroll laterale risolto · verticale pending device

## TL;DR

- **Fix 1 + 2 SHIPPED** ✅ — `airoobi.app` 4.43.0. Scroll laterale
  dovrebbe sparire (root cause confermati).
- **Fix 3 NON shipped** ⚠️ — il candidato `100vh` di ROBY è fuori
  campo (le 2 regole esistenti sono dentro media query `min-width:768px`
  e `min-width:960px` — non scattano su mobile). Serve traccia su
  device mobile reale Skeezu per identificare il vero colpevole prima
  di ipotizzare fix.
- **Standby verifica Skeezu sul telefono**: scroll laterale sparito sì/no?
  Scroll verticale ancora pianta sì/no?

## 1. Verify-before-fix · cosa è stato confermato live

### Confermato fix 1 (scroll laterale pagina)
Repo state verificato:
- `src/topbar.css:2` HA `html,body{overflow-x:hidden}` (regola corretta)
- **MA** `dapp.html` NON carica `topbar.css` (solo
  `tokens.css + dapp.css + dapp-v2-g3.css`)
- In `dapp.css`: html riga 27 NON aveva `overflow-x` → default visible
- Body riga 28 HA `overflow-x:hidden` MA non basta a fermare html

Root cause ROBY confermato al 100%. Fix:
```css
/* src/dapp.css:27 */
html{background:var(--black);-webkit-tap-highlight-color:transparent;color-scheme:dark;overflow-x:hidden}
```

### Confermato fix 2 (topbar contenuta)
Repo state verificato:
- `.topbar` (dapp.css:39) NON aveva `overflow-x` né `max-width`
- `.topbar-nav` collassa già a hamburger @max-width:768px
- `.topbar-right` rimane visibile con pill ARIA/ROBI/avatar + price pill
  GS-6 + eventuali cr-btn
- @max-width:640px esiste già regola: `.topbar-robi-price font-size:10px
  + .topbar-robi-trend display:none` — cura parziale come ROBY notava
- Niente a @max-width:480px → su iPhone (~390px) tutto il cluster sfora

Fix:
```css
/* .topbar */
.topbar{...overflow-x:hidden;max-width:100vw}

/* nuovo media query · contenimento @max-width:480px */
@media(max-width:480px){
  .topbar{padding:0 12px;gap:6px}
  .topbar-right{gap:6px}
  .topbar-bal{font-size:11px;padding:4px 9px;gap:4px}
  .topbar-bal svg{width:14px;height:14px}
  .topbar-robi-price{display:none !important}
  .topbar-avatar{width:30px;height:30px;font-size:12px}
  .topbar-cr-btn{display:none !important}
}
```

A 480px:
- Topbar padding ridotto (12px laterali)
- ARIA/ROBI pill compatti (font 11, padding 4/9, icon 14)
- ROBI price pill (GS-6) nascosto integralmente
- Avatar ridotto a 30px
- `.topbar-cr-btn` (CEO admin button) nascosto

Lascia visibili: burger + nav left + pill ARIA + pill ROBI + bell? + avatar.
Lascia spazio attorno ai 60-80px nel worst case.

### NON confermato fix 3 (scroll verticale)
ROBY ipotizzava candidate "1 regola CSS 100vh/100dvh". Verify live:
- `body` riga 28: `min-height:100vh; min-height:100dvh` → **già fallback
  dvh** OK
- `dapp.html:1616` splash tour: `min-height:100vh` inline (è
  min-height, no clipping, OK)
- `dapp.css:335`: `.detail-gallery{...height:calc(100vh - 100px)...}`
  → dentro `@media(min-width:768px)` = **solo desktop**, no impatto mobile
- `dapp.css:1055`: `.detail-gallery-v2{...height:calc(100vh - 100px)...}`
  → dentro `@media(min-width:960px)` = **solo desktop**, no impatto mobile
- `topbar.css:54` (non caricato su dapp.html): `.topbar-mobile-menu
  max-height:calc(100vh - 60px)` → ininfluente perché non caricato

Risultato verify: **il candidato 100vh di ROBY non è il colpevole**
sul mobile dapp.html. Le regole esistono ma non scattano sotto 768px.

Possibili veri colpevoli da verificare a device mobile reale:
- Qualche `overflow:hidden` su contenitore intermedio con altezza non
  scrollabile
- Posizionamento sticky/fixed che intrappola lo scroll
- iOS Safari quirk specifico (es. `position:fixed` su `body` accidentale
  durante apertura detail)
- Toggle scroll-lock JS in apertura modal/detail non rilasciato

**Non shippo fix 3 ipotetico.** Per `feedback_verify_route_not_sole_host`
+ `feedback_ui_click_trace_before_push`: non posso marcare ✅ senza
traccia reale (Skeezu telefono). Lascio aperto come PENDING.

## 2. Cosa serve da Skeezu sul telefono

Test sul telefono dopo 4.43.0 deploy:

1. **Scroll laterale**: aprire dapp.html, provare swipe sinistro-destro
   sulla pagina. → ATTESO: niente movimento orizzontale.
   - Se OK → fix 1+2 chiusi.
   - Se ancora sfora → ispezione: quale elemento sfora? Topbar o altro?
     Screenshot a 390px.

2. **Topbar a 390px**: aprire dApp loggato come CEO, controllare che
   tutti gli elementi della topbar entrino nel viewport, niente clipping
   degli avatar o pill saldi. → ATTESO: tutto contenuto.

3. **Scroll verticale che si pianta**: riprodurre la sequenza che causa
   il blocco (Skeezu sa quando succede). Quando si pianta:
   - In quale pagina/route? (Explore, detail airdrop, wallet, ABO, …)
   - Quale operazione l'ha preceduto? (apertura detail, chiusura modal,
     swipe gallery, ecc.)
   - Funziona pull-down browser refresh dopo? O serve restart browser?
   → Mi serve la sequenza esatta per traccirla in fix 3 v2.

## 3. Scope rispettato

- ✅ Solo frontend (1 ALTER css `dapp.css` + 1 bump cache)
- ✅ Nessuna logica toccata
- ✅ Nessun breakpoint cambiato (aggiunti solo nuovi `@max-width:480px`)
- ✅ Niente GS toccato (GS-15 reopen 4.42.0 + GS-16 rullo 4.41.0 + earlier intatti)
- ⚠️ 34 media query / 11 breakpoint incoerenti **non toccati** (out of
  scope, redesign post go-live)

## 4. Pre-vs-post go-live

ROBY raccomanda pre go-live. CCP concorda **se Skeezu conferma sul
telefono che 4.43.0 risolve almeno fix 1+2**. Fix 3 da tracciare e
shippare prima di go-live ufficiale: un marketplace mobile che si pianta
nello scroll verticale non è da lanciare.

Cadenza proposta:
1. ✅ Shipped 4.43.0 fix 1+2 + flag fix 3 pending
2. **→ ATTESA Skeezu telefono verify** + descrizione bug verticale
3. CCP traccia fix 3 v2 con device-mode + ship
4. Skeezu re-verify
5. Counter golden-session invariato (questo bug è UAT-found, non era
   nei 16 golden — è un blocker go-live a parte)

## 5. Counter aggiornato

Golden-session resta 14/16 (GS-15 reopen pending firma).

Mobile nav bug = nuovo item UAT post-GS-16, non-golden-session-numerato.
Lo tracciamo come **MNB-1** (Mobile Nav Bug #1) per riferimento futuro.

## RS — paste-ready

```
RS · MOBILE NAV FIX v1 SHIPPED · 4.43.0 · verifica Skeezu device

VERIFY-BEFORE-FIX EXECUTED:
- Fix 1 ROBY CONFERMATO: dapp.html NON carica topbar.css → html
  overflow-x default visible. body overflow-x:hidden non bastava.
- Fix 2 ROBY CONFERMATO: .topbar senza overflow né max-width, niente
  contenimento @max-480px (solo @max-640px parziale).
- Fix 3 ROBY candidato 100vh NON applicabile mobile: le 2 regole
  esistenti sono dentro media query min-width 768px e 960px (solo
  desktop). Body ha già min-height fallback dvh. Splash tour usa
  min-height non height (OK).

SHIPPED (CSS-only · dapp.css):
- html { overflow-x:hidden }
- .topbar { overflow-x:hidden; max-width:100vw }
- @media(max-width:480px): topbar padding 12px, gap 6px,
  topbar-bal compatto, topbar-robi-price + topbar-cr-btn nascosti,
  avatar 30px

NON SHIPPED fix 3 (scroll verticale): il candidato ROBY non è il
colpevole; serve traccia su device mobile reale Skeezu per
identificare la vera root cause. Non marco ✅ senza trace.

SERVE DA SKEEZU sul telefono dopo deploy 4.43.0:
1. Scroll laterale sparito sì/no?
2. Topbar 390px tutto contenuto sì/no?
3. Scroll verticale che si pianta: in quale pagina/route?
   quale azione l'ha causato? si sblocca con refresh?

Non ho toccato: logica, breakpoint esistenti, GS-* live (15 reopen
4.42.0 + 16 rullo 4.41.0 intatti), 34 media query / 11 breakpoint
incoerenti (out of scope · redesign post go-live).

Cadenza: ship 4.43.0 → Skeezu verify telefono → CCP traccia fix 3
v2 con info Skeezu → ship → re-verify. Counter golden-session
invariato (14/16, GS-15 reopen pending firma). Tracciamo questo
come MNB-1 (Mobile Nav Bug #1), separato dai golden numerati.

Raccomandato pre go-live anche fix 3.
```

## Bottom line

Fix 1 e 2 shipped, confermati per costruzione (root cause repo-verified
prima di toccare codice). Fix 3 non shipped perché il candidato ROBY è
fuori campo — serve traccia su device mobile Skeezu per evitare patch
ciecata. Standby device verify + descrizione bug verticale.

Audit-trail: questo file = CCP shipped mobile nav fix v1 RS ROBY 24 May ·
verify-before-fix executed · fix 1 + 2 confermati e shippati (html
overflow-x:hidden + .topbar contenimento + @max-480px compatto) · fix
3 candidato 100vh NON applicabile mobile (2 regole esistenti dentro
media query desktop 768/960px · body min-height già fallback dvh ·
splash min-height non height) · NON shipped per evitare patch cieca,
serve traccia device Skeezu · footer 4.43.0 · bridge sync · 34 media
query out of scope · counter golden-session invariato 14/16 · MNB-1
nuovo item UAT separato.

---

*CCP · CIO/CTO Airoobi · shipped mobile nav fix v1 · 24 May 2026 · daje team a 4*
