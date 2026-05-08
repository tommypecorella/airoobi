---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · Pi 5)
cc: Skeezu
subject: MEGA CLOSURE BRIEF — Brand pivot v2.2 fine tuning + Pre-go-live critical bugs · Chrome ext discoveries integrate · 40 issue P0/P1/P2/P3 · execution sequenced
date: 2026-05-09
ref: CCP_BrandPivotV2_LIVE_2026-05-07.md + Chrome ext UIX/funzionalità report 2026-05-09 (loggata utente CEO Alpha Brave) + sessione visual review 7-9 May
status: BRIEF MEGA LOCKED — Skeezu sign-off · batch single round CCP · P0 critical bugs PRIMA, poi brand pivot fine tuning
---

# Mega Closure Brief · Brand Pivot v2.2 Fine Tuning + Pre-Go-Live Critical Bugs

## TL;DR

Brief consolidato che integra:
- **Review prod brand pivot v2.2** (web_fetch .com + .app + 7 screenshot dApp interno) → 15 issue copy/asset/dApp coverage
- **Chrome ext UIX/funzionalità report 9 May** (loggata utente reale CEO Alpha Brave) → 25 issue funzionali/mobile/accessibility che includono **bug bloccanti pre-go-live**

**40 issue totali · 7 P0 critical · 9 P1 high · 14 P2 medium · 10 P3 low.**

**🚨 Decisione strategica Skeezu LOCKED 2026-05-09:** P0 critical bugs vanno fixati **PRIMA** del fine tuning brand pivot v2.2. Logica: il bug `/profilo` logout + mobile-first rotto bloccano la M1·W1 acquisition window (Google Ads su mobile = lead bruciati). Il brand pivot fine tuning può aspettare i bug critical.

**Anomalia da verificare lato CCP:** Chrome ext riporta versione app `alfa-2026.04.26-3.57.0` ma il deploy LIVE 7 May era `alfa-2026.05.07-4.0.0`. Possibile mismatch deploy/cache/asset version.

Brief organizzato per **fase execution + severity**. CCP esegue tutto in batch atomico (Skeezu directive: "fagli fare tutto d'un fiato"). Replica con un solo file `CCP_MEGA_Closure_*.md`.

---

## ✅ Decisioni Skeezu LOCKED (2026-05-09)

1. **ISSUE-02 rephrase "fortuna" → "Un blocco alla volta."** (brand-coining vocab AIROOBI, zero gambling, manifesto rhythm)
2. **ISSUE-08 "Airdroppalo" STAY** (brand-coining nostro, no rephrase, lo prendiamo come quirk del marketplace)
3. **ISSUE-11 sezione blockchain → tieni dove sta + eyebrow header "Per investitori · Tech specs"** (cushion, no perdita prominence)
4. **ISSUE-04 + ISSUE-13 counter → wire RPC `get_user_count_public()` SEMPRE, no hardcode mai.** Anche su `airoobi.com` (rimuovere `993/1000` hardcoded). Counter sempre da DB (verità > teatrino)
5. **Mega brief unico** (single file, single round CCP)
6. **P0 critical bugs prima del brand pivot fine tuning** (logout `/profilo` + mobile-first + stale state PRIMA, poi tutto il resto)
7. **Modalità execution: BATCH single round CCP "tutto d'un fiato"** (no ping-pong intermedio)

---

## 🚨 FASE 1 · P0 CRITICAL BUGS — Pre-Go-Live (PRIMA del fine tuning brand)

### ISSUE-16 · 🚨🚨 BLOCKER · Rotta `/profilo` causa logout + cross-domain redirect [airoobi.app]
**Scope:** SPA routing + auth
**Symptom:** Navigare a `airoobi.app/profilo` reindirizza a `airoobi.com` (landing pubblica) e invalida la sessione. Alla navigazione successiva a `/dashboard` l'utente è non-loggato.
**Causa probabile:** mancanza route handler per `/profilo`; catch-all SPA punta al dominio marketing. Token sessione perso per cambio origin → cookie scadono.
**Impatto:** zero pagina profilo/settings accessibile. No menu profilo, no logout button, no cambio password/email. **Gap funzionale grave + UX-breaking.**
**Fix:**
1. Creare route `/profilo` (o `/account`) nell'SPA airoobi.app con auth guard
2. Aggiungere voce "Profilo" o avatar dropdown nella navbar (link a `/profilo`)
3. Nel route catch-all SPA, **mai** redirect cross-domain. Se path non esiste, redirect a `/dashboard` (auth-aware) o a 404 internal
4. Pagina /profilo minima: email user, nome, settings password, logout button
**Acceptance:** navigare a `airoobi.app/profilo` mostra pagina settings, NON fa logout, NON redirect a airoobi.com.

### ISSUE-17 · 🚨 P0 · `.dash-stats` mobile-first ROTTO [airoobi.app/dashboard]
**Scope:** dashboard top stats (ARIA/ROBI/KAS cards)
**Symptom:** CSS attuale `display: grid; grid-template-columns: repeat(3, 1fr)` SENZA media query. Su mobile <480px le 3 card si stringono a ~110px ciascuna, valore numerico lungo (`999990349`) illeggibile.
**Fix:**
```css
@media (max-width: 480px) {
  .dash-stats { grid-template-columns: 1fr; }
}
```
**Acceptance:** su viewport 375px le 3 card sono in colonna stack singolo, valori leggibili full.

### ISSUE-18 · 🚨 P0 · `.dash-quick-links` (ESPLORA) mobile-first ROTTO [airoobi.app/dashboard]
**Scope:** ESPLORA 4 tile (AIRDROP/+INVITA/WALLET/VENDI)
**Symptom:** CSS `display: grid; grid-template-columns: repeat(4, 1fr)` SENZA media query. Su <480px tile a ~90px, icone sovrapposte, testo troncato.
**Fix:**
```css
@media (max-width: 640px) {
  .dash-quick-links { grid-template-columns: repeat(2, 1fr); }
}
```
**Acceptance:** su viewport 375px → 2 colonne (2x2 grid), testo leggibile.

### ISSUE-19 · 🚨 P0 · `.stats-bar` (IL TUO PERCORSO) mobile-first ROTTO [airoobi.app/dashboard]
**Scope:** sezione percorso (Blocchi acquistati / ARIA investiti / Con noi dal)
**Symptom:** CSS `grid-template-columns: repeat(3, 1fr)` SENZA media query. Stessa problematica di ISSUE-17.
**Fix:**
```css
@media (max-width: 480px) {
  .stats-bar { grid-template-columns: 1fr; }
}
```
**Acceptance:** su viewport 375px → colonna stack singolo.

### ISSUE-20 · 🚨 P0 · Stale state cross-navigation (ROBI/KAS → 0) [airoobi.app SPA]
**Scope:** state management
**Symptom:** dopo navigazione `/dashboard → /portafoglio → back`, dashboard mostra `ROBI: 0` e `KAS: —` invece dei valori corretti (10 e 718.xx). I valori si correggono SOLO al reload manuale.
**Causa probabile:** store (Zustand/React state o vanilla JS equivalent) non re-idratato al cambio route SPA. Fetch dati utente avviene solo al mount iniziale.
**Fix:**
1. Aggiungere re-fetch o subscription reattiva su ogni mount delle route critiche
2. Verificare che `fetch('/api/user')` (o equivalente Supabase) venga chiamato anche dopo navigazioni SPA interne, non solo al primo mount
3. Pattern: usare un context provider o subscription Supabase realtime invece di local state
**Acceptance:** navigazione `/dashboard → /portafoglio → /dashboard` mostra valori corretti senza reload.

### ISSUE-21 · 🚨 P0 · i18n key non tradotta "Bentornato, —Welcome back, —" [airoobi.app/dashboard]
**Scope:** dashboard greeting
**Symptom:** in alcune sessioni il DOM mostra "Bentornato, —Welcome back, —" — sia il nome utente non caricato (stale state ISSUE-20 collegato) sia chiave i18n IT/EN concatenata invece di switch.
**Fix:**
1. Verificare logica i18n: deve essere `lang === 'it' ? 'Bentornato' : 'Welcome back'`, non concatenazione di entrambe
2. Fallback name se user non caricato: "Bentornato!" (no virgola/dash)
**Acceptance:** dashboard greeting mostra una sola lingua + nome utente o fallback pulito.

### ISSUE-22 · 🚨 P0 · Navbar badge ARIA `999990349` non risponde [airoobi.app navbar]
**Scope:** topbar
**Symptom:** click sul badge `A 999990349` (top-right navbar) → nessuna navigazione, nessun tooltip, nessun panel. Element esiste in DOM ma manca event handler.
**Fix:** collegare click a `/portafoglio` (full page) **oppure** aprire mini-panel con saldo dettagliato (preferito per UX).
**Acceptance:** click sul badge ARIA → navigazione a /portafoglio o panel popup.

### ISSUE-40 · ⚠️ ANOMALY · Version mismatch app vs deploy
**Scope:** verifica deployment integrity
**Symptom:** Chrome ext riporta `alfa-2026.04.26-3.57.0` come versione app airoobi.app, ma il deploy LIVE 7 May era `alfa-2026.05.07-4.0.0`.
**Possibili cause:**
- Asset/JS cache vecchio non invalidato post-deploy
- Footer dApp ha versione hardcoded vecchia non aggiornata nel deploy
- Build artifact diverso fra `airoobi.com` (4.0.0) e `airoobi.app` (3.57.0) → deploy parziale?
**Fix:** verifica:
1. Footer airoobi.app cosa mostra → grep template
2. Vercel deploy logs 7 May → quale build hash è stato deployato su airoobi.app subdomain
3. Cache/CDN status → invalidare cache se serve
**Acceptance:** Chrome ext loggata su airoobi.app vede footer version `4.0.0` (o version aggiornata post-fix).

---

## 🟠 FASE 2 · BRAND PIVOT v2.2 FINE TUNING (post-P0)

### Round B — Asset fix airoobi.com (5 min)

#### ISSUE-01 · 🚨 HIGH · Logo footer base64 JPEG con BG nero baked-in [home.html]
**Symptom:** logo footer è base64 JPEG con sfondo nero "cotto", contrasta male su footer light v2 + hard edge
**Fix:** sostituire con `<img src="/logo-black.png" alt="AIROOBI">` (asset già in `06_public_assets/images/`)
**Pattern:** grep `data:image/jpeg;base64` in home.html footer → Edit chirurgico replace src

### Round C — Counter RPC wire (~30-45 min)

#### ISSUE-04 · 🚨 HIGH · Counter live wire RPC su .com + .app
**🔒 LOCKED Skeezu:** wire RPC `get_user_count_public()` Supabase su entrambi siti. Counter sempre da DB, niente hardcoded.
**Fix:**
1. Verifica RPC esistenza con permission `anon` read (se manca → migration)
2. JS lazy fetch helper:
```js
async function fetchUserCount() {
  const r = await fetch('/api/user-count');
  const { count } = await r.json();
  document.querySelector('.alpha-counter-live').textContent = `${count}/1000`;
}
```
3. Stesso helper su `home.html` (.com) + `landing.html` (.app)
4. **Rimuovi hardcoded `993/1000` da home.html**, fallback skeleton `—/1000` durante fetch
5. NB: valore reale DB potrebbe essere < 993, counter "scenderà" (Skeezu accetta verità > teatrino)

### Round A — Institutional copy sweep airoobi.com (~30-45 min)

#### ISSUE-02 · 🚨 HIGH · "fortuna" rephrase
**🔒 LOCKED Skeezu:** "Conta l'impegno, non la fortuna" → **"Un blocco alla volta."**
**Pattern:** Edit chirurgico in home.html + grep cross-repo per "fortuna" residue.

#### ISSUE-03 · 🚨 HIGH · "impegno" sweep
**Symptom:** "impegno" è banned (connotazione fatica, contrario a partecipazione fluida marketplace)
**Fix:** sweep grep `\bimpegno` in repo, rephrase con "partecipazione" / "presenza" / "skill" caso per caso

#### ISSUE-09 · 🟡 MEDIUM · "non comprando" doppia negazione
**Fix:** rephrase positive. Es. "ricevendolo dal marketplace" / "tramite airdrop" / "partecipando al marketplace"

#### ISSUE-10 · 🟡 MEDIUM · "dApp" jargon
**Fix:** "dApp" → "app" o "marketplace" (eccetto URL `airoobi.app` che resta)

#### ISSUE-11 · 🟡 MEDIUM · sezione blockchain crypto-heavy
**🔒 LOCKED Skeezu:** tieni dove sta + aggiungi eyebrow header "Per investitori · Tech specs"
**Fix:**
```html
<div class="section-eyebrow">Per investitori · Tech specs</div>
<h2>...sezione blockchain...</h2>
```
```css
.section-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--airoobi-gold);
  margin-bottom: 0.5rem;
}
```

**ISSUE-08 SKIP** — "Airdroppalo" STAY.

### Round D — dApp coverage extension src/dapp-v2-g3.css (~1.5-2h, IL PEZZO GROSSO)

#### ISSUE-05 · 🚨 HIGH · Dashboard middle/bottom dark mode regression
**Fix:** estendi override per `.reward-card`, `.explore-card`, `.journey-stat`:
```css
.reward-card,
.explore-card,
.journey-stat {
  background: var(--airoobi-bg, #FAFAF7) !important;
  color: var(--airoobi-ink, #1B1814) !important;
  border: 1px solid var(--airoobi-border, rgba(27,24,20,0.08)) !important;
}
.reward-card .label,
.explore-card .label {
  color: var(--airoobi-ink-muted, #5A544E) !important;
}
```

#### ISSUE-06 · 🚨 HIGH · /airdrops index dark
**Fix:** estendi per `.airdrops-grid`, `.airdrop-card`, `.search-bar`, `.filter-pill`. Verifica order import override DOPO legacy CSS.

#### ISSUE-07 · 🚨 HIGH · /airdrops/:id middle/bottom dark
**Fix:** estendi per `.purchase-widget`, `.classifica-section`, `.detail-list`, `.expandable`. Verifica slider blu cyan v1 → cambiare a `var(--airoobi-gold)` se hardcoded.

#### ISSUE-12 · 🟡 MEDIUM · Greeting font Cormorant residue
**Fix:**
```css
.dashboard-greeting,
.welcome-back,
h1.greeting {
  font-family: 'Inter', sans-serif !important;
  font-weight: 600 !important;
  font-style: normal !important;
  color: var(--airoobi-ink) !important;
}
```

---

## 🟡 FASE 3 · P1 HIGH BUGS — Visivi gravi e UX (post fine tuning brand)

#### ISSUE-23 · 🟡 P1 · KAS card testo concatenato senza spazio [/portafoglio]
**Symptom:** `≈ 718.55 KASOn-chain · tuo per sempre` (no whitespace tra `KAS` e `On-chain`)
**Fix:** Edit template:
```html
<span>≈ {value} KAS</span> <span>· On-chain · tuo per sempre</span>
```

#### ISSUE-24 · 🟡 P1 · Leaderboard scoring table CSS grid rotta [/airdrops/:id]
**Symptom:** "Come funziona la classifica" → testo "blocchi", "Moltiplicatore Fedeltà", "Boost di garanzia" sovrapposti. Container `display: block` + `gridTemplateColumns: none` invece che grid attivo.
**Fix:**
```css
.scoring-table {
  display: grid !important;
  grid-template-columns: 1fr auto;
  gap: 8px;
}
```
Verifica nome classe dinamico/typo che impedisce match.

#### ISSUE-25 · 🟡 P1 · Tabella referral senza header [/invita]
**Symptom:** 4 colonne (email/stato/valore/data) ma nessuna riga header. Terza colonna mostra `—` senza spiegazione (ROBI? ARIA?).
**Fix:**
```html
<div class="ref-history-header">
  <span>Email</span>
  <span>Stato</span>
  <span>ROBI guadagnati</span>
  <span>Data</span>
</div>
```
+ CSS coerente con righe sotto.

---

## 🟢 FASE 4 · P2 MEDIUM BUGS — UX cleanup

#### ISSUE-26 · 🟢 P2 · `user-scalable=no` viewport meta WCAG fail
**Symptom:** viola WCAG 1.4.4 (Resize Text). Su Android impedisce zoom utente.
**Fix:**
```html
<!-- Da: -->
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<!-- A: -->
<meta name="viewport" content="width=device-width,initial-scale=1.0">
```

#### ISSUE-27 · 🟢 P2 · Pannello notifiche senza overlay/backdrop
**Symptom:** click campanella → panel apre senza overlay scuro, contenuto sotto resta interagibile, confusione visiva.
**Fix:** aggiungere overlay semitrasparente + dialog pattern:
```css
.notifications-panel-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 999;
}
.notifications-panel { z-index: 1000; }
```

#### ISSUE-28 · 🟢 P2 · ESPLORA quick links contrasto WCAG fail [/dashboard]
**Overlap:** parzialmente coperto da ISSUE-05 fix coverage extension dark mode
**Symptom:** AIRDROP, WALLET, VENDI testo quasi invisibile (`var(--gray-300)` su dark BG). Solo +INVITA visibile.
**Fix:** una volta ISSUE-05 applicato (cards LIGHT), ricalibrare colori testo a `var(--airoobi-ink)` con ratio ≥4.5:1 WCAG.

#### ISSUE-29 · 🟢 P2 · Banner onboarding non persiste dismiss [/dashboard]
**Symptom:** "Valuta. Partecipa. Guadagna." riappare ad ogni visita anche se già chiuso.
**Fix:**
```js
const dismissed = localStorage.getItem('guida-banner-dismissed');
if (!dismissed) showBanner();
document.querySelector('.btn-close').onclick = () => {
  localStorage.setItem('guida-banner-dismissed', '1');
  hideBanner();
};
```

#### ISSUE-30 · 🟢 P2 · Avatar venditore placeholder cuore [/airdrops/:id]
**Fix:** label "Venduto da: [username]" o nascondere avatar se profilo incompleto.

#### ISSUE-31 · 🟢 P2 · Sequenza giornaliera "D" domenica staccata [/dashboard]
**Fix:** uniformare grid/flex weekday riga (D dentro stesso container styling come gli altri 6).

#### ISSUE-32 · 🟢 P2 · `/miei-airdrop` thumbnail mancanti
**Fix:** `<img onerror="this.src='/placeholder-airdrop.png'">` fallback.

#### ISSUE-33 · 🟢 P2 · ARIA quotidiano countdown layout mobile [/dashboard]
**Symptom:** "GIÀ RICEVUTI OGGI" + countdown "Prossimi ARIA tra 1h 27m" si sovrappongono su <640px.
**Fix:**
```css
@media (max-width: 640px) {
  .aria-daily-card { flex-direction: column; gap: 8px; }
  .aria-countdown { font-size: 0.85rem; }
}
```

---

## 🔵 FASE 5 · P3 LOW BUGS — Cleanup minor (opzionale, può andare in W3 backlog)

#### ISSUE-34 · 🔵 P3 · Navbar AIRDROPS active state race condition
**Fix:** verifica logica `.active` class su route change → debounce o cleanup.

#### ISSUE-35 · 🔵 P3 · EDU dropdown background semi-trasparente
**Fix:** `background: var(--airoobi-bg)` + `opacity: 1` esplicita.

#### ISSUE-36 · 🔵 P3 · Slider acquista blocchi no aria-* labels [/airdrops/:id]
**Fix:** aggiungere `aria-label="Numero blocchi"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`.

#### ISSUE-37 · 🔵 P3 · Grafico ROBI no asse Y label esplicito
**Fix:** label "Quantità ROBI" o "ROBI accumulati" come asse Y heading.

#### ISSUE-38 · 🔵 P3 · Footer airoobi.com link no target/warning
**Fix:** `target="_blank"` + `rel="noopener noreferrer"` su link cross-domain.

#### ISSUE-39 · 🔵 P3 · KAS card `—` saldo principale inconsistente
**Symptom:** main saldo `—` ma sub `≈ 718.55 KAS`.
**Fix:** mostra valore stimato come main o usa label "In arrivo · 718.55 stimati".

#### ISSUE-14 · 🔵 P3 · Logo "Oo" in dApp nav verifica
**Fix:** verifica visiva post-other patches.

#### ISSUE-15 · 🔵 P3 · Product description "VR flagship Snapdragon" EN→IT
**Fix:** se DB-driven backlog, se hardcoded translate.

---

## Ordine esecuzione batch (Skeezu directive: tutto d'un fiato)

CCP esegue in **sequenza atomica** dentro un **singolo round**:

1. **FASE 1 — P0 critical bugs** (ISSUE-16, 17, 18, 19, 20, 21, 22, 40 verify)
2. **FASE 2 — Brand pivot fine tuning** (Round B asset → C counter RPC → A copy → D dApp coverage CSS)
3. **FASE 3 — P1 high visivi/UX** (ISSUE-23, 24, 25)
4. **FASE 4 — P2 medium UX** (ISSUE-26, 27, 28, 29, 30, 31, 32, 33)
5. **FASE 5 — P3 low cleanup** (opzionale W3 backlog se ETA esplode)
6. **VERIFICA FINALE — smoke 25+ acceptance criteria** (sezione sotto)

Replica con **un solo file** `CCP_MEGA_Closure_BrandPivot_v2_2_PreGoLive_*.md` con audit-trail completo.

---

## Acceptance criteria mega (verifica finale post-batch)

### Auth + Routing (FASE 1)
1. ✅ `airoobi.app/profilo` mostra pagina settings, NO logout, NO cross-domain redirect
2. ✅ Avatar dropdown / voce profilo accessibile da navbar
3. ✅ Click badge ARIA navbar → naviga a /portafoglio o panel popup

### Mobile-first (FASE 1)
4. ✅ Viewport 375px: `.dash-stats` colonna stack singolo, valori leggibili
5. ✅ Viewport 375px: `.dash-quick-links` 2x2 grid, testo leggibile
6. ✅ Viewport 375px: `.stats-bar` colonna stack singolo
7. ✅ Viewport meta NO `user-scalable=no` (FASE 4)

### State management (FASE 1)
8. ✅ Navigazione `/dashboard → /portafoglio → /dashboard` mostra valori ROBI/KAS corretti senza reload
9. ✅ Greeting una sola lingua, nome utente caricato o fallback pulito (no "—Welcome back, —")

### Brand pivot v2.2 (FASE 2)
10. ✅ `airoobi.com` footer logo = `/logo-black.png` (no base64 JPEG)
11. ✅ Counter Alpha Brave fetched da RPC `get_user_count_public()` su .com + .app (no hardcoded)
12. ✅ `airoobi.com` zero "fortuna" / "impegno" / "azzardo" / "scommessa" / "lottery"
13. ✅ Stringa "Conta l'impegno, non la fortuna" → "Un blocco alla volta."
14. ✅ "Airdroppalo" STAY (no replace)
15. ✅ "non comprando" rephrased positive
16. ✅ "dApp" → "app" / "marketplace" (eccetto URL airoobi.app)
17. ✅ Eyebrow "Per investitori · Tech specs" sopra sezione blockchain

### dApp coverage (FASE 2)
18. ✅ `airoobi.app/dashboard` middle/bottom (reward cards + journey stats + ESPLORA) LIGHT theme
19. ✅ `airoobi.app/airdrops` index intera vista LIGHT theme
20. ✅ `airoobi.app/airdrops/:id` middle/bottom (purchase widget + classifica + dettagli) LIGHT theme
21. ✅ Dashboard greeting font Inter (no Cormorant residue)
22. ✅ Footer airoobi.app version mostra `4.0.0` o version aggiornata post-fix

### Visivi/UX (FASE 3-4)
23. ✅ KAS card portafoglio testo separato correttamente (`KAS` + spazio + `On-chain`)
24. ✅ Leaderboard scoring table grid funzionante (no overlap)
25. ✅ Tabella referral con header colonne
26. ✅ Pannello notifiche con overlay backdrop
27. ✅ ESPLORA quick links contrasto ≥4.5:1 WCAG
28. ✅ Banner onboarding dismiss persistente in localStorage

---

## Pattern operativi CCP (recap)

- **NO sed cascade** (ref `feedback_verify_before_sed.md`) — Edit chirurgici + grep verify pre-patch
- **NO rewrite legacy CSS dApp** (ref `feedback_override_css_pattern.md`) — extend selectors only su `src/dapp-v2-g3.css`
- **Mobile-first additivo** — aggiungere media queries senza toccare default desktop styles
- **State management** — preferire reactive subscription Supabase realtime invece di local state stale
- **Routing fix** — auth guard sempre + catch-all internal-domain (mai cross-domain redirect)
- **Verify build/deploy integrity** post-merge (ISSUE-40) per evitare version mismatch silenti

---

## Files presumibilmente toccati (cumulative scope)

- `airoobi.app` SPA: route handler `/profilo`, navbar component, store/state files
- `airoobi.com` HTML: `home.html` (logo footer + copy sweep + counter wire)
- `airoobi.app` HTML: `landing.html` + dashboard template + airdrops template + airdrop detail template
- `src/dapp-v2-g3.css` — extend selectors massive (FASE 2 Round D)
- `src/home.css` — eventuale aggiunta `.section-eyebrow` (FASE 2 Round A)
- Viewport meta → tutti i template HTML rilevanti
- Supabase migration eventuale per RPC `get_user_count_public()` (FASE 2 Round C)
- localStorage helper banner dismiss (FASE 4)

ETA totale stimato: **6-10 ore** CCP work cumulativo (FASE 1 più pesante per routing/state, FASE 2 pivot già stimato 3-4h, FASE 3-4 ~2h, FASE 5 opzionale 1-2h).

---

## Note operative + escalation

- **Brief redatto post-Chrome ext loggata utente** 2026-05-09 + brief originale fine tuning brand pivot v2.2 LIVE 7 May
- **Scope espanso oltre brand pivot:** include bug funzionali pre-go-live (auth/routing/state/mobile)
- **Razionale priorità Skeezu:** P0 critical bugs PRIMA del brand pivot perché bloccano M1·W1 acquisition window (Google Ads su mobile lead = soldi bruciati su UX rotta)
- **Audit-trail simmetrico atteso:** ROBY firma sign-off ack post `CCP_MEGA_Closure_*.md`
- **Se ETA totale > 10h** → CCP può proporre split MEGA round in 2 sub-round (Phase 1+2 prima, Phase 3+4 dopo) ma report con motivazione

## Reference files

- `CCP_BrandPivotV2_LIVE_2026-05-07.md` (deploy report 10/10 PASS — base partenza)
- `CCP_Phase7_Audit_Apply_Report_2026-05-05.md` (sed sweep history)
- `feedback_voice_principle_04_anti_gambling_strict.md` (sweep policy)
- `feedback_override_css_pattern.md` (override pattern doc)
- `feedback_verify_before_sed.md` (grep before patch policy)
- `reference_cowork_chrome_ext_bridging_limit.md` (Chrome ext review da Skeezu manuale, NO bridging Cowork)

## Closing

Sprint W2 chiusura espansa: brand pivot v2.2 fine tuning + bug critical pre-go-live in un solo round CCP atomico. Post `CCP_MEGA_Closure_*` ROBY firma audit-trail e M1·W1 acquisition apre con UX coerente + funzionante mobile + auth/routing solido.

Daje, chiudiamo.

---

— **ROBY**

*9 May 2026 W2 Day 5 · canale ROBY→CCP (mega closure brief · 40 issue P0/P1/P2/P3 · execution batch atomico · audit-trail simmetrico atteso)*
