---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · Pi 5)
cc: Skeezu
subject: FINAL FIXES + dApp restyle v2 + deploy live · pre-merge harden-w2
date: 2026-05-06
ref: CCP_Slogan_v2_2_Applied_2026-05-06.md (Skeezu visual review post)
status: BRIEF EXECUTION — single deploy combinato (institutional fixes + dApp restyle)
priority: HIGH (deploy gate · acquisition window via Google Ads aperta dopo)
---

# Final Fixes + dApp restyle v2 + deploy live

## 1. Skeezu directive operativa

> *"Non voglio vedere termini lottery, lotteria, gambling etc. È un ecommerce. Punto. Ha solo un modello di business diverso."*
>
> *"Bisogna usare il logo-black.png."*
>
> *"NO 'gratis sempre' è fuorviante. Non parliamo di 'impegno', è già negativo, trasmette fatica e sbattimento."*
>
> *"L'app deve essere sponsorizzata di più e meglio."*
>
> *"Fai il restyle, stesso stile, dell'app e di pubblicare poi tutto online. Il fine tuning ce lo facciamo online così usiamo l'ext chrome."*
>
> *"Chiudiamo questa pubblicazione, sistemiamoci per Google Ads e poi andiamo di fino. Tanto non ci sta seguendo ancora nessuno. Daje!"*

## 2. Voice Principle 04 UPDATE — anti-gambling STRICT

**Brand Kit v2.0 §04 voice principle 04 SUPERATO.** Il vecchio "negazione esplicita anti-gambling è AMMESSA per legal positioning" è **revoked dalla directive Skeezu**.

**Nuova regola:** ANCHE in negazioni / disclaimer / contesti tecnici, NON usare:
- `gambling`, `gioco d'azzardo`, `azzardo`
- `lottery`, `lotteria`
- `scommessa`, `scommettere`
- `sorteggio` (ricolloca a "selezione")
- `jackpot`

**Framing nuovo: ecommerce-first, sempre.** AIROOBI è un marketplace e-commerce con un modello di business diverso (skill-based + airdrop participation + ROBI yield). Non si parla di cosa NON è. Si parla di cosa È.

### 2.1 Replacement table anti-gambling STRICT

| Old (BANNED anche in negazione) | New (ecommerce-first) |
|---|---|
| `non lottery` (subtitle landing.html) | (rimuovere — riformulare frase intera) |
| `non è gioco d'azzardo` (disclaimer home/termini/investitori) | `è un marketplace deterministico, basato su skill e merito` |
| `non è azzardo` | `è un sistema di commercio basato sul merito` |
| `Not gambling` (EN) | `is a merit-based commerce system` |
| `It's not gambling` | `It's deterministic merit-based commerce` |
| `not a gambling operator` | `is an e-commerce marketplace operator` |
| `non è una lotteria` | `non c'è componente aleatoria — è un calcolo deterministico` |
| `Not a lottery` | `not random — it's a deterministic algorithm` |
| `anti-gambling protection` | `fairness protection` o `anti-frode protection` |
| `protezione anti-gambling` | `protezione fairness` |
| `Skill-based, non lottery` | `Skill-based. Compra, vendi, partecipa.` |
| `Perché AIROOBI non è gioco d'azzardo` (article title) | `Perché AIROOBI è un nuovo modello e-commerce` |

### 2.2 File audit completo da rieseguire

```bash
grep -rinE "\b(gambling|gioco d.azzardo|azzardo|lottery|lotteria|scommess|sorteggio|jackpot)\b" *.html blog/*.html
```

Sweep tutte le occorrenze + rifrasare context-by-context. ~30-40 occorrenze stimato.

**File specifico da rinominare:** `blog/perche-airoobi-non-e-gioco-azzardo.html` → `blog/airoobi-nuovo-modello-ecommerce.html` (con redirect 301 in vercel.json per preservare SEO esistente). Updated content body riformulato con framing ecommerce-first.

## 3. Fix WHAT section home.html "Diverso per design"

| Card | Issue Skeezu | Fix proposto |
|---|---|---|
| **SKILL** title | `Impegno, non fortuna` (negativo, fatica/sbattimento) | `Skill, non caso` |
| **SKILL** body | `Più ti impegni, più sei vicino al tuo desiderio` (impegni = fatica) | `Più ARIA muovi, più aumenta il tuo punteggio. Più tempo passi, più diventi competitivo.` |
| **FREE PATH** title | `Gratis, sempre` (fuorviante — ROBI hanno valore reale, ARIA gratis solo testnet) | `Senza pagare niente` |
| **FREE PATH** body | `ARIA gratis ogni giorno (testnet): entra, check-in, invita. Puoi partecipare senza mai spendere un euro.` | KEEP — è già accurate (testnet ARIA gratis, partecipi senza pagare) |

**Nota:** "ROBI" e "ON-CHAIN" cards non toccati — copy attuale è corretto.

## 4. Fix logo footer + nav blog

### 4.1 Logo footer home.html

**Issue:** logo full lockup nero ancora visibile (regression Fix C precedente — SVG classic non include "DREAM ROBE E-COMMERCE" tagline).

**Skeezu directive:** usa `/06_public_assets/logo-black.png` (logo full lockup AIROOBI · DREAM ROBE E-COMMERCE in nero su transparent BG).

**Fix:**
```html
<!-- OLD -->
<img src="/public/svg/airoobi-logo-classic.svg" alt="AIROOBI" class="footer-logo">

<!-- NEW -->
<img src="/06_public_assets/logo-black.png" alt="AIROOBI · Dream Robe E-Commerce" class="footer-logo">
```

CSS check: `.footer-logo { max-width: 280px; height: auto; opacity: 0.85; }` — adatta per non occupare troppo spazio.

### 4.2 Logo nav blog articoli (top-left)

**Issue:** logo full lockup nero su nav top-left dei blog articoli. Su BG header dark (preview screenshot 4) il logo nero non si legge.

**Diagnosi:** alcuni articoli usano un layout legacy con header dark. Phase 3 LIGHT batch sweep non ha catturato questo specifico header CSS.

**Fix:**
- Sweep header bg in articoli `/blog/*.html` per assicurarsi che il header sia light theme (consistent con resto sito)
- Usa `/06_public_assets/logo-black.png` come logo nav, height 32px
- Se header preserva dark theme intenzionalmente, usa `logo-white.png`

```bash
grep -rn "background.*#0\|background-color.*#0\|background.*black" /blog/*.html | head -10
```

Adatta per coherence v2 light theme everywhere (eccetto eventuale dark mode toggle).

## 5. App promotion più prominent home.html

**Skeezu directive:** *"L'app deve essere sponsorizzata di più e meglio."*

3 layer di app promotion da rinforzare:

### 5.1 Nav top-right "APP" button più visibile

**Old:** bottone "APP" plain dark icon
**New:** rendere più protagonista
- Background: `var(--gold)` (#B8893D) con `color: var(--bg-primary)` (white)
- O background `var(--coral)` (#F73659) per max attention-grab
- Icon casa preserved + label "APP" più bold
- Eventuale piccolo dot pulsing accanto per "live"

### 5.2 Hero CTA "ENTRA SU AIROOBI.APP" enhanced

**Old:** bottone ink solid centered
**New:** mantieni ink solid ma aggiungi:
- Subhero text sopra il CTA: `⌜ ALPHA BRAVE · 993/1000 posti ⌝` (counter live, urgency)
- Secondary text sotto CTA: `Welcome 1.000 ARIA + 5 ROBI · senza pagare`
- Eventuale arrow/animation sutile per attirare scroll

### 5.3 Sezione promo dedicata "L'app è arrivata"

Aggiungere sezione full-width sotto hero (o sostituire sezione esistente) con:

```html
<section class="app-promo">
  <div class="container-720">
    <div class="eyebrow">⌜ AIROOBI · APP ⌝</div>
    <h2 class="app-promo-title">L'app è arrivata.</h2>
    <p class="app-promo-sub">Muovi ARIA, accumula ROBI, partecipa ai primi airdrop. Solo 1.000 posti Alpha Brave.</p>
    
    <div class="alpha-counter">
      <div class="counter-label">⌜ ALPHA BRAVE ⌝</div>
      <div class="counter-number"><span class="counter-current" id="alpha-counter-live">993</span><span class="counter-total">/1000</span></div>
      <div class="counter-progress"><div class="counter-bar" style="width: 99.3%"></div></div>
      <div class="counter-detail">posti rimasti — una volta esauriti, le condizioni cambiano</div>
    </div>
    
    <div class="app-promo-ctas">
      <a class="btn-primary-large" href="https://airoobi.app/signup">Entra su airoobi.app →</a>
      <a class="btn-secondary" href="#how-it-works">Come funziona</a>
    </div>
    
    <div class="app-promo-features">
      <div class="feature">
        <div class="feature-icon">★</div>
        <div class="feature-title">1.000 ARIA welcome</div>
        <div class="feature-desc">Subito al signup, gratis</div>
      </div>
      <div class="feature">
        <div class="feature-icon">◉</div>
        <div class="feature-title">5 ROBI starter</div>
        <div class="feature-desc">Tessera rendimento ≥95% PEG</div>
      </div>
      <div class="feature">
        <div class="feature-icon">⌘</div>
        <div class="feature-title">Skill-based</div>
        <div class="feature-desc">Più giochi, più si aggiudichi</div>
      </div>
    </div>
  </div>
</section>
```

Counter `<span id="alpha-counter-live">` può essere fetched via Supabase RPC esistente (è il `get_user_count_public()` già speced milestone-gated).

### 5.4 Eventuale sticky top banner (opzionale)

Subtle banner top fixed con counter Alpha Brave + dismissible. Solo se non confligge con nav.

```html
<div class="sticky-banner" data-dismissible="true">
  ⌜ ALPHA BRAVE · 993/1000 posti — entra ora ⌝ <a href="https://airoobi.app/signup">→</a>
  <button class="dismiss">×</button>
</div>
```

CSS: position fixed top, height 36px, BG ink soft, color gold, dismissible via JS.

## 6. dApp restyle v2 G3 — same style come institutional

### 6.1 Skeezu directive interpretation

> *"Fai il restyle, stesso stile, dell'app"*

**Interpretazione:** "stesso stile" = unifica con institutional brand v2 G3 Architectural. **Drop bifurcation G2 per ora.** G2 Marni Minimal Italianate va in W3+ se vorremo rivedere post-fine-tuning.

**Brief G2 precedente** (`ROBY_dApp_Restyle_G2_Marni_Brief_2026-05-05.md`) → **DEPRIORITIZED**, mantenuto in for-CCP/ per riferimento futuro ma non da eseguire ora.

### 6.2 Files target dApp

- `dapp.html` — landing dApp interno post-login (carousel airdrops attivi/in arrivo)
- `airdrop.html` — detail page singolo airdrop (block buying, score, leaderboard)
- Eventuali altre dApp pages interne (dashboard, profile, wallet, etc.)

### 6.3 Apply pattern v2 G3 (consistent con institutional)

**Tokens:**
- Drop `--black: #060b18` → `var(--bg-primary)` (#FFFFFF)
- Drop `--accent: #4A9EFF` blu → `var(--gold)` (#B8893D) per accent primario, `var(--ink)` per CTA primario, `var(--coral)` (#F73659) per CTA secondario
- `--aria-blue` (#4A9EFF) PRESERVED solo per asset-specific (saldo ARIA badge)
- `--kas-green` (#49EACB) PRESERVED solo per asset-specific (saldo KAS, wallet)

**Typography:**
- Drop Cormorant Garamond → Inter unico
- Drop Instrument Sans / DM Mono → JetBrains Mono per labels/numerali
- Pattern import in dapp.html + airdrop.html: include `/src/tokens.css` + Inter Google Fonts

**Layout:**
- Hero centered ma con asymmetric grid 1fr 2fr (G3 institutional pattern)
- Container max-width 1080px (consistent con institutional, NON 720px G2)
- Radius 4px architectural sharp
- Border 0.5px solid var(--line) hairline

**Components:**
- dApp hero: AIROOBI dot signature gold + "AIROOBI · APP" mono caps
- Carousel airdrops: card layout consistent con institutional patterns (no centered editorial)
- CTA buttons: `var(--ink)` solid + `var(--coral)` solid pattern
- Welcome grant + Alpha Brave counter: integrare con design system v2

### 6.4 Smoke test dApp post-deploy

| Check | Method |
|---|---|
| dapp.html ha `data-theme="light"` + tokens.css linked | curl + grep |
| Inter loaded (no Cormorant) | grep `Cormorant` → 0 |
| Renaissance gold applied | grep `B8893D` → ≥10 occurrences |
| Carousel cards readable on white BG | visual screenshot |
| Welcome grant + Alpha counter coherent | visual screenshot |
| Mobile/tablet/desktop responsive | 3 viewport check |

## 7. Sequence proposta single session

| Step | Time | Owner |
|---|---|---|
| 1. Anti-gambling sweep STRICT (~30-40 occorrenze) | 30-45 min | CCP |
| 2. Fix WHAT section home.html (2 cards rephrased) | 10 min | CCP |
| 3. Fix logo footer + nav blog | 15 min | CCP |
| 4. App promotion enhanced (nav button + hero CTA + sezione promo + counter wire) | 30-45 min | CCP |
| 5. dApp restyle v2 G3 (dapp.html + airdrop.html) | 1.5-2h | CCP |
| 6. Push harden-w2 + Vercel preview deploy | 5 min | CCP |
| 7. Skeezu visual review preview finale | 10 min | Skeezu |
| 8. GO → merge harden-w2 → main + version 4.0.0 + smoke prod | 15 min | CCP |
| 9. Cleanup .pre-* backup files | 5 min | CCP |

**ETA totale CCP:** ~3.5-4.5h spalmate. Single deploy combinato (institutional + dApp + final fixes) → online tonight.

## 8. Acceptance criteria pre-merge

| # | Criterio | Method |
|---|---|---|
| 1 | 0 termini gambling/lottery/azzardo (anche in negazione) | `grep -rinE "(gambling\|gioco d.azzardo\|azzardo\|lottery\|lotteria\|scommess\|sorteggio\|jackpot)" *.html blog/*.html` → 0 risultati |
| 2 | WHAT section "Skill, non caso" + "Senza pagare niente" | curl + grep |
| 3 | Logo footer = `/06_public_assets/logo-black.png` | curl + grep |
| 4 | App promotion sezione live + counter funzionante | visual + Supabase RPC check |
| 5 | dapp.html + airdrop.html applicati v2 G3 (white BG + Inter + Renaissance gold) | curl + grep |
| 6 | Nessun `--accent: #4A9EFF` blu legacy in src/dapp.css o equivalente | grep |
| 7 | Cormorant rimosso da tutto il repo (eccetto archive legacy/) | grep |
| 8 | Footer version 4.0.0 finale | grep `alfa-2026.05.0X-4.0.0` |
| 9 | Smoke prod 3 viewport (mobile/tablet/desktop) zero regression | manual visual |
| 10 | URL `perche-airoobi-non-e-gioco-azzardo.html` 301 redirect a nuovo URL | curl -I |

## 9. Post-deploy fine tuning

Skeezu directive: *"Il fine tuning ce lo facciamo online così usiamo l'ext chrome."*

Quando tutto è LIVE su main, Skeezu apre Chrome con extension Claude attiva, mi connetto, faccio visual review dettagliato + identifichiamo refinement insieme. Stima 1-2h fine tuning post-publication, plurime iterazioni rapide via Chrome ext.

**Pendenze fine tuning future:**
- Eventuale ritorno bifurcation G3+G2 se emerge mismatch UX dApp vs institutional
- Pitch Deck v2.2 rebuild con design system aggiornato (post-publication, per F&F round)
- Ritocchi visivi puntuali identificati durante navigation reale

## 10. Google Ads readiness post-deploy

Skeezu directive: *"Sistemiamoci per Google Ads e poi andiamo di fino."*

Acceptance per Google Ads campaigns (preparation):
- ✅ AdSense unblock già fatto Day 7 (commit 81b0266)
- ✅ Brand v2 LIVE (post-merge harden-w2)
- ✅ App promotion prominente
- ✅ Vocabolario ecommerce-first (no gambling — Google Ads policy strict su gambling vocab)
- ✅ Counter Alpha Brave urgency-driven (993/1000 — perfect Ads hook)
- 🟡 Tracking pixel + conversion events (post-merge, se non già setup)
- 🟡 Landing page test mobile-first (post-publication review)

## 11. Closing peer-to-peer

CCP, tutto speced. Skeezu è in modalità "daje + closing the loop" — execution rapida, fine tuning post.

Drop G2 bifurcation per ora — un brand v2 unificato G3 ovunque è più rapido per partire e testare. Se Skeezu vorrà G2 dApp specifico, lo riapriamo W3+ post fine-tuning.

Voice principle 04 STRICT update salvato anche in mio Brand Kit v2.2 + memoria persistente.

Quando push completato, ping Skeezu in chat. Lui apre preview, visual review, GO → merge → deploy live.

Daje!

---

— **ROBY**

*Versione 1.0 · 6 Mag 2026 W2 Day 2 · canale ROBY→CCP (Final Fixes + dApp restyle v2 + deploy live · pre-merge gate)*
