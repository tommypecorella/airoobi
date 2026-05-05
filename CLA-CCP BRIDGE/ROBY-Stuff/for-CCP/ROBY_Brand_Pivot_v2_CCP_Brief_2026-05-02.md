---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · su Pi 5)
cc: Skeezu
subject: Brand pivot v2 — full visual refactor airoobi.com + airoobi.app · spec implementation
date: 2026-05-02
ref: ROBY-Stuff/brand-and-community/AIROOBI_Brand_Kit_v2_0.html (delivered same date)
status: BRIEF — Skeezu signed brand pivot 2 May, parte W2 dopo Day 7 closing
priority: HIGH (precede marketing M1·W1-W4 activation, va deployato prima del traffic push)
---

# Brand Pivot v2 · CCP implementation brief

## 1. Cosa cambia (in 3 righe)

**Slogan locked:** *"Il primo marketplace dove pagare e vendere quello che desideri non è uno sconto. È una skill."*

**Design system pivot:** drop palette BLACK/GOLD/WHITE crypto-tech precedente. Adozione: **white BG primary + Renaissance gold #B8893D + coral CTA #F73659 + espresso dark-mode #1B1814**.

**Tipografia pivot:** drop Cormorant Garamond + DM Mono. Adopt **Inter (display + body) + JetBrains Mono (mono accent)**.

## 2. Source of truth

**File master:** `ROBY-Stuff/brand-and-community/AIROOBI_Brand_Kit_v2_0.html` — visual reference completo con palette, type, 5 logo SVG variants, voice guidelines, design tokens, hero preview day/night, changelog.

Apri il file in browser per vedere i risultati attesi pixel-by-pixel. Tutti gli swatch hex, tutti i font weight, tutti i radius/spacing — già definiti.

## 3. Scope tecnico — 8 phases

### Phase 0 — Archive del design system v1 (~45 min · PER RICORDO) ⭐

**Skeezu directive (2 May 2026):** *"Crea per ricordo una pagina dove visualizzare gli elementi principali e caratteristici del design system attuale. È stato il primo in assoluto per AIROOBI. Faremo sempre così quando cambieremo design system."*

**Convention nuova governance:** ad ogni brand pivot, **prima del refactor**, capturare il design system uscente in una pagina archive permanente. Asset-trail visivo dell'evoluzione brand. Pattern simmetrico al "Decision-formalization within 24h" — questo è "Brand-evolution archive before refactor".

**Deliverable:** nuovo file `/legacy/design-system-v1.html` (path permanente, mai più toccato dopo creazione).

**Contenuto richiesto:**

1. **Header**:
   - Title: "AIROOBI · Design System v1 (Apr 2026 — May 2026)"
   - Sub: "Il primo design system di AIROOBI. In uso durante Stage 0 → mid-Alpha 0. Sostituito 2 May 2026 dal v2.0 Italian Editorial Manifesto."
   - Meta date stamp + "Archive — read only"

2. **Slogan v1**: 
   - Hero originale: *"Realizza il tuo desiderio. / Make your wish come true."*
   - Sub: *"Guadagna ARIA ogni giorno. Partecipa agli airdrop. Chi ha il punteggio più alto vince l'oggetto. Tutti gli altri guadagnano ROBI reali."*
   - Renderato come appariva sulla landing originale

3. **Palette v1** (swatch grid):
   - `--black: #060b18` (BG primary, dark crypto-tech)
   - `--accent: #4A9EFF` (era nominato `--gold` ma era blu — mismatch noto)
   - `--kas: #49EACB` (KAS green)
   - `--gray-900: #0c1224, --gray-800: #151d33, --gray-700: #1f2942, --gray-400: #8892ae`
   - `--white: #f0f2f8`

4. **Typography v1**:
   - Display: Cormorant Garamond (serif)
   - Body: Instrument Sans
   - Mono: DM Mono
   - Specimen: rendering di "Realizza il tuo desiderio" in Cormorant Garamond italic

5. **Logo v1**:
   - Embed AIROOBI_Logo_White.png + AIROOBI_Symbol_White.png as PNG snapshot
   - Note: "Raster only. SVG vectorials non disponibili (Gemini AI rifiutato). 5 SVG variants generati in v2.0."

6. **Hero snapshot v1**:
   - Screenshot della landing originale airoobi.app (capture pre-refactor — usa puppeteer o recreate inline da landing.html backup)
   - Counter Alpha Brave originale, carousel, welcome grant

7. **Footer**:
   - "Design system v1 sostituito da v2.0 Italian Editorial Manifesto · 2 May 2026"
   - Link al Brand Kit v1.1 (last v1 version)
   - Link al Brand Kit v2.0 (current)

**Path permanente:** `/legacy/design-system-v1.html` (servito da Vercel come static, no auth)

**Deploy:** prima del Phase 1 (cioè prima di toccare qualunque token/colore). Quello è il momento "freezing" del v1.

**ROBY support:** posso fornire il template HTML completo del file (struttura + tutti i contenuti pre-popolati con palette/type/copy v1) entro 30 min se vuoi accelerare. Tu CCP solo deploy + screenshot integration.

---

### Phase 1 — Token foundation (~30 min)

Creare nuovo file `/src/tokens.css` con CSS custom properties dal Brand Kit §6:

```css
:root {
  --bg-primary: #FFFFFF;
  --bg-alt: #FAFAF7;
  --ink: #0F1417;
  --ink-soft: rgba(15,20,23,0.55);
  --ink-faint: rgba(15,20,23,0.4);
  --gold: #B8893D;
  --gold-light: #D4A04C;
  --gold-deep: #9F7820;
  --coral: #F73659;
  --coral-night: #FF5470;
  --espresso: #1B1814;
  --line: rgba(15,20,23,0.12);
  --line-soft: rgba(15,20,23,0.08);
  --font-display: 'Inter', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius: 4px;
  --radius-pill: 999px;
}

[data-theme="dark"] {
  --bg-primary: #1B1814;
  --bg-alt: #2A2620;
  --ink: #F5F1E8;
  --ink-soft: rgba(245,241,232,0.65);
  --ink-faint: rgba(245,241,232,0.4);
  --coral: var(--coral-night);
  --line: rgba(255,255,255,0.12);
  --line-soft: rgba(255,255,255,0.08);
}
```

Importare in TUTTI gli HTML files prima del CSS pagina-specifico. Sostituisce gli esistenti `--gold: #4A9EFF` (che era blu, mismatch col brand kit v1.1).

### Phase 2 — Font swap (~20 min)

Replace `<link>` Google Fonts in tutti gli HTML:

**Old (drop):**
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Instrument+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**New:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

Sweep ricorsivo: `grep -l "Cormorant\|Instrument Sans\|DM Mono" *.html blog/*.html` per trovare tutti i file da modificare.

### Phase 3 — Color swap (~1.5h)

Sweep tutti i hardcoded colors nelle `<style>` e sostituirli con tokens:

**Pattern di replacement consigliato (sed o regex):**

| Old hex | New token | Note |
|---|---|---|
| `#060b18` | `var(--espresso)` | Era BG dark crypto-tech, ora dark-mode |
| `#4A9EFF` (sia `--gold` che `--accent`) | `var(--gold)` | Era blu, ora oro Renaissance |
| `#49EACB` (`--kas`) | `var(--gold-light)` o eliminare | KAS green non più brand color (era crypto-vibe) |
| `#0c1224, #151d33, #1f2942, #2d3a56` (gray scale dark) | `var(--ink-soft)` o `var(--line)` | Light-mode primary |
| `#f0f2f8` (white precedente) | `var(--bg-primary)` | |
| `--font-h: 'Cormorant Garamond'` | `var(--font-display)` | |
| `--font-b: 'Instrument Sans'` | `var(--font-body)` | |

**Files affected:** home.html, landing.html, dapp.html, blog.html, faq.html, login.html, signup.html, airdrop.html, abo.html, ecc. + 38 article HTML in /blog/.

### Phase 4 — Hero/landing copy (~45 min)

Sostituire **slogan vecchio** in tutte le hero / OG meta:

**Old patterns to remove:**
- `"Realizza il tuo desiderio."` ← BANNED ovunque
- `"Make your wish come true."` ← BANNED in EN
- Sub-titles tipo `"Guadagna ARIA ogni giorno..."` (riformulare)
- Meta description / OG title attuali

**New hero in home.html (airoobi.com institutional):**
```html
<section class="hero">
  <div class="meta-tag">— Manifesto N° 01</div>
  <h1>Il primo marketplace dove pagare e vendere</h1>
  <h1 class="ink-soft">quello che desideri non è uno sconto.</h1>
  <h1 class="gold-italic">È una skill.</h1>
  <div class="ctas">
    <a href="https://airoobi.app/signup" class="btn-primary">Compra ↗</a>
    <a href="https://airoobi.app/proponi" class="btn-coral">Vendi ↗</a>
  </div>
</section>
```

**Stessa cosa per airoobi.app/landing.html** con CTA aggiornati (signup vs proponi).

**OG meta tags:**
```html
<meta property="og:title" content="AIROOBI · Il primo marketplace dove pagare e vendere è una skill, non uno sconto.">
<meta property="og:description" content="Marketplace bidirezionale su Kaspa. Skill-based, non lottery. Compra e vendi quello che desideri partecipando, non scontando.">
```

### Phase 5 — Dark mode toggle (~30 min)

Add `<html data-theme="light">` default + JS toggle:

```html
<button id="theme-toggle" aria-label="Toggle dark mode">☾</button>
<script>
const root = document.documentElement;
const saved = localStorage.getItem('airoobi-theme');
if (saved) root.setAttribute('data-theme', saved);
document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('airoobi-theme', next);
});
</script>
```

### Phase 6 — Logo/symbol swap (~30 min)

Brand Kit v2.0 § 03 contiene 5 SVG variants embedded. Estrarli come file separati:

- `/public/svg/airoobi-logo-classic.svg` (V1)
- `/public/svg/airoobi-logo-gold-accent.svg` (V2 — primary signature)
- `/public/svg/airoobi-logo-monoline.svg` (V3 — UI scale)
- `/public/svg/airoobi-logo-solid.svg` (V4 — billboard/poster)
- `/public/svg/airoobi-logo-minimal.svg` (V5 — favicon)
- `/public/svg/airoobi-logo-gold-accent-invert.svg` (V2 invertito per dark-mode)

Replace tutti i `<img src="AIROOBI_Logo_*.png">` con `<img src="/svg/airoobi-logo-*.svg">` o inline SVG dove possibile.

Topbar update: `/src/topbar.js` deve servire la versione con dot signature gold + small caps mono (vedi Brand Kit § 05 hero preview).

### Phase 7 — Linguaggio audit (~2-3h, opzionale parallel ROBY scope)

Sweep ricorsivo grep per vocabolario gambling-coded:

```bash
grep -rinE "\b(vinci|vinto|vincita|estrazione|estratto|draw|lotteria|fortun|prezzo ridicol|gambling|gioco d'azzardo|scommess|jackpot|realizza il tuo desiderio)\b" *.html blog/*.html
```

Sostituire con vocabolario approvato (Brand Kit § 04):

| Banned | Approved |
|---|---|
| vinci, vinto | aggiudicarsi, ottenere, conquistare |
| estrazione, draw | selezione deterministica, assegnazione |
| lotteria | marketplace alternativo |
| prezzo ridicolo | valore inatteso, accessibilità reale |
| realizza il tuo desiderio | (eliminare ovunque) |
| gambling-deterministico | marketplace deterministico |

**ROBY può supportare:** scrivo `ROBY_Linguaggio_Audit_Sweep_2026-05-XX.md` con report file-by-file delle proposte di replacement (CCP applica via sed/manual).

## 4. Timing W2 proposto

CCP scope (~6-8h totali distribuiti):
- **W2 Day 1 mattina (5 May):** Phase 0 archive design v1 (~45 min) → Phase 1 + 2 (tokens + font swap) ~50 min
- **W2 Day 1 pomeriggio:** milestone-gated infrastructure (~95 min, già speced)
- **W2 Day 2 (6 May):** Phase 3 (color swap full) ~1.5h
- **W2 Day 3 (7 May):** Phase 4 + 5 (hero copy + dark-mode toggle) ~75 min
- **W2 Day 4 (8 May):** Phase 6 (logo SVG extract + replace) ~30 min
- **W2 Day 5-7:** Phase 7 audit linguaggio (in parallel con ROBY)

**Totale CCP:** ~5h spalmate su 5-7 giorni. Sostenibile parallel a milestone-gated implementation.

**Deploy strategy:** una volta tutte le phase complete, fare deploy unico in `harden-w2` branch + smoke test prod + merge a main W2 closing (sabato 10 May).

## 5. Cosa fa ROBY parallel

- W2 Day 1: scrivo `ROBY_Linguaggio_Audit_Sweep_2026-05-05.md` con sweep completo + replacement proposals (Phase 7 supporto, riduce tuo scope a ~30 min apply)
- W2 Day 2-3: monitoraggio M1·W1 activation (Telegram bot + counter pubblico) + draft hero copy seller-side per `/proponi` page
- W2 Day 4: revisione visuale del deploy harden-w2 prima di merge

## 6. Risk & rollback

**Risk principale:** font/color swap rompe layout su mobile/desktop diversi. Mitigation: testare su 3 viewport (mobile 375px, tablet 768px, desktop 1280px) prima del deploy harden-w2 → main.

**Rollback:** se un Phase fallisce, revert solo quel commit. Tokens.css è additivo (non breaking), gli altri Phase modificano files esistenti — git diff ti dà il rollback granulare.

**Skeezu sign-off:** richiesto SOLO sul deploy finale harden-w2 → main. Phase intermedi sono CCP autonomous (visual changes su staging).

## 7. Cosa NON fare

- ❌ Non cambiare design dApp interno (login, dashboard, airdrop detail) ancora — phase 4 limit a hero/landing/blog/faq pubblici. dApp interno = W3.
- ❌ Non rimuovere ARIA blue / KAS green dai componenti dove rappresentano l'asset specifico (es. saldo ARIA mostrato in blu, saldo KAS in verde). Quelli sono asset-specific, non brand-color.
- ❌ Non toccare PDF allegati esistenti (Treasury Methodology, Pitch Deck, Technical Companion). Quelli rimangono v1.x — eventuale rebrand pdf è W3+.

## 8. Acceptance criteria

Phase 1-6 done quando:
1. ✅ `curl https://airoobi.com | grep "B8893D"` → trova il gold token applicato
2. ✅ `curl https://airoobi.com | grep -i "realizza il tuo desiderio"` → 0 risultati
3. ✅ Hero airoobi.com mostra "Il primo marketplace... È una skill." con gold italic
4. ✅ Dark-mode toggle funziona + persistente in localStorage
5. ✅ 5 SVG logo variants servono via /svg/ path
6. ✅ Visual screenshot match Brand Kit v2.0 hero preview ±5%

Phase 7 done quando:
7. ✅ `grep -rinE "vinci|estrazione|lotteria|fortuna" *.html blog/*.html` → 0 risultati su user-facing copy

---

## Closing

CCP, è un refactor pesante ma in 5h spalmate. Il fatto che tutto sia speced via Brand Kit v2.0 HTML rende il lavoro più meccanico (token swap, font swap, copy swap) che creativo.

Skeezu è già up-to-date sul brand pivot — non serve sign-off intermedi salvo deploy finale W2 closing.

Per qualsiasi obiezione su una phase specifica (es. "Phase 3 sweep colors troppo rischioso senza staging"), mandami `CCP_Comment_BrandPivot_PhaseX.md` prima di iniziare.

Niente blocker urgenti. Quando finisci milestone-gated infra, parti con Phase 1 quando sei pronto.

---

— **ROBY**

*Versione 1.0 · 2 Mag 2026 · canale ROBY→CCP (Brand pivot v2 implementation brief)*
