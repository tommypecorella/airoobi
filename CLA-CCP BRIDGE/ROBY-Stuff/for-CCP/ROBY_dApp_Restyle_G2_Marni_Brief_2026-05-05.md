---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · Pi 5)
cc: Skeezu
subject: dApp internal restyle — G2 Marni Minimal Italianate · W3 sprint scope
date: 2026-05-05
ref: AIROOBI_Brand_Kit_v2_0.html (G3 Architectural per institutional) ·
     CCP_BrandPivot_v2_HandOff_NextStep_2026-05-06.md (dapp.html + airdrop.html dichiarati W3 scope)
status: BRIEF — dApp restyle scope W3 sprint (post brand pivot v2 institutional close)
priority: MEDIUM (post-merge harden-w2 + smoke prod stabilizzato)
---

# dApp Restyle · G2 Marni Minimal Italianate

## 1. Visual reference

**Screenshot fornito da Skeezu (5 May sera):**

```
┌─────────────────────────────────────────────────────────────────┐
│  G2 · MARNI MINIMAL ITALIANATE   warm white · serif display ·  │
│                                  editorial                       │
│                                                                 │
│                                                                 │
│                       ⌜ AIROOBI ⌝                              │
│                                                                 │
│                                                                 │
│        Il primo marketplace dove pagare e                      │
│         vendere quello che desideri                            │
│            non è uno sconto.                                   │
│                                                                 │
│                                                                 │
│              È una skill.                                       │
│              ─────────                                          │
│              (coral italic)                                     │
│                                                                 │
│                                                                 │
│                ┌─────────┐  ┌─────────┐                        │
│                │ COMPRA  │  │  VENDI  │                        │
│                │  (ink)  │  │(outline)│                        │
│                └─────────┘  └─────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

**Cifra distintiva G2:**
- Background: warm white `#FAFAF7` (più caldo del bianco puro brand v2 institutional)
- Tipografia display: **Cormorant Garamond serif** (high-contrast italianate editorial)
- Layout: **centered editorial** (no asymmetric grid)
- Header: corner brackets `⌜ AIROOBI ⌝` mono caps small (no dot signature gold)
- Slogan: stesso v2 ("Il primo marketplace... È una skill.")
- "È una skill." finale: coral italic (`#F73659`) — stessa accent del brand v2
- CTAs: "COMPRA" ink solid + "VENDI" outline — centered, mono caps small
- Spaziature: generose, editorial magazine vibe (max-width ~720-800px container)

## 2. Scope · cosa restyling

**Files target W3 sprint** (dApp internal — branded come "marketplace participation experience"):

| File | Current state | Restyle target G2 |
|---|---|---|
| `dapp.html` | v1 dark crypto-tech (skipped in brand v2 institutional pivot) | G2 Marni Minimal Italianate centered editorial |
| `airdrop.html` | v1 dark | G2 + airdrop-specific UI (block buying flow, score visible, leaderboard) |

**Rationale brand bifurcation:** institutional vs dApp = audience diversa, vibe diversa.

| Dominio | Brand variant | Audience | Aesthetic |
|---|---|---|---|
| airoobi.com (institutional) | **v2 G3 Architectural** + Inter + asymmetric grid + sharp 4px radius | discovery + investor + crypto-curious | tech-aware editorial bold |
| airoobi.app dApp internal | **v2-dapp G2 Marni Minimal** + Cormorant serif + centered editorial | partecipanti attivi + alpha brave + buyer/seller | premium italianate slow ceremony |

**Pattern conceptual:** New Yorker (institutional, Inter-style sharp) vs The Atlantic (dApp, Cormorant serif editorial reverence). Both same brand, different aesthetic per touchpoint. Riconoscibile perché entrambe usano **slogan v2 + coral accent + AIROOBI mono caps** come continuum.

## 3. Design system v2-dapp · tokens delta vs institutional

```css
/* /src/tokens-dapp.css — extends tokens.css per dApp variant */

[data-variant="dapp"] {
  /* Background warmer */
  --bg-primary: #FAFAF7;        /* vs institutional #FFFFFF */
  --bg-alt: #F5F1E8;            /* vs institutional #FAFAF7 */
  
  /* Ink warmer */
  --ink: #1A1410;               /* vs institutional #0F1417 */
  --ink-soft: rgba(26,20,16,0.55);
  
  /* Coral preserved (continuum with institutional) */
  --coral: #F73659;
  
  /* Gold preserved (continuum) */
  --gold: #B8893D;
  
  /* Typography pivot per dApp */
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body: 'Inter', system-ui, sans-serif;  /* body resta Inter per leggibilità UI */
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Radius più rounded per editorial feel */
  --radius: 8px;                /* vs institutional 4px sharp */
  
  /* Container width più stretto */
  --container-max: 720px;       /* vs institutional 1080px */
}
```

**Import order in `dapp.html`:**

```html
<link rel="stylesheet" href="/src/tokens.css">
<link rel="stylesheet" href="/src/tokens-dapp.css">
<html data-theme="light" data-variant="dapp">
```

## 4. Layout pattern G2 · components

### Hero (entry per ogni dApp page)

```html
<section class="dapp-hero">
  <div class="dapp-eyebrow">⌜ AIROOBI ⌝</div>
  <h1 class="dapp-display">
    Il primo marketplace dove pagare e<br>
    vendere quello che desideri<br>
    <span class="ink-soft">non è uno sconto.</span>
  </h1>
  <h1 class="dapp-display dapp-coral-italic">
    È una skill.
  </h1>
  <div class="dapp-ctas">
    <a class="btn-ink">COMPRA</a>
    <a class="btn-outline">VENDI</a>
  </div>
</section>
```

```css
.dapp-hero { 
  text-align: center; 
  max-width: 720px; 
  margin: 0 auto; 
  padding: clamp(80px, 14vh, 140px) 24px; 
}
.dapp-eyebrow { 
  font-family: var(--font-mono); 
  font-size: 11px; 
  letter-spacing: 0.18em; 
  color: var(--ink); 
  font-weight: 500;
  text-transform: uppercase;
  margin-bottom: 32px;
}
.dapp-display { 
  font-family: var(--font-display); 
  font-size: clamp(32px, 5.5vw, 52px); 
  font-weight: 500; 
  line-height: 1.18; 
  letter-spacing: -0.01em; 
  color: var(--ink);
  margin-bottom: 8px;
}
.dapp-display.dapp-coral-italic {
  color: var(--coral);
  font-style: italic;
  font-weight: 600;
  font-size: clamp(48px, 9vw, 88px);
  line-height: 1;
  margin-top: 24px;
}
.dapp-ctas { 
  display: flex; 
  gap: 16px; 
  justify-content: center; 
  margin-top: 48px; 
}
.btn-ink { 
  background: var(--ink); 
  color: #fff; 
  padding: 14px 32px; 
  font-family: var(--font-mono); 
  font-size: 11px; 
  letter-spacing: 0.14em; 
  text-transform: uppercase; 
  border-radius: var(--radius);
}
.btn-outline { 
  background: transparent; 
  border: 1px solid var(--ink); 
  color: var(--ink); 
  padding: 13px 32px; 
  font-family: var(--font-mono); 
  font-size: 11px; 
  letter-spacing: 0.14em; 
  text-transform: uppercase; 
  border-radius: var(--radius);
}
```

### Airdrop card (centered editorial within G2 grid)

Per `airdrop.html` (singolo airdrop detail page):

```html
<article class="dapp-airdrop-detail">
  <header class="dapp-airdrop-header">
    <div class="dapp-airdrop-category">⌜ TECH · iPhone 16 Pro ⌝</div>
    <h1 class="dapp-display">iPhone 16 Pro Max — 256 GB</h1>
    <p class="dapp-airdrop-target">Valore di mercato · €1.499</p>
  </header>
  
  <div class="dapp-airdrop-image">
    <img src="..." alt="iPhone 16 Pro Max">
  </div>
  
  <div class="dapp-airdrop-stats">
    <div class="stat">
      <div class="stat-label">— BLOCCHI</div>
      <div class="stat-value">24 / 60</div>
    </div>
    <div class="stat">
      <div class="stat-label">— PARTECIPANTI</div>
      <div class="stat-value">12</div>
    </div>
    <div class="stat">
      <div class="stat-label">— DEADLINE</div>
      <div class="stat-value">3 giorni</div>
    </div>
  </div>
  
  <div class="dapp-airdrop-cta">
    <a class="btn-ink">PARTECIPA — 5 ARIA / blocco</a>
  </div>
</article>
```

### Layout principles G2 dApp

1. **Centered everything by default** — eccetto liste/tabelle (che restano left-aligned per scan-ability)
2. **Generous vertical spacing** — `clamp(64px, 10vh, 120px)` tra section
3. **Max-width 720px container** — editorial reading rhythm
4. **Hairline dividers** — `0.5px solid rgba(0,0,0,0.1)` invece di solid borders
5. **Minimal shadow** — niente glow, solo `box-shadow: 0 1px 0 var(--line-soft)` per separator
6. **Numerali mono** — sempre JetBrains Mono per cifre e timestamps
7. **Display serif solo per headings + slogan** — body resta Inter per UI readability

## 5. Phases proposte W3

| Phase | Scope | ETA CCP |
|---|---|---|
| W3-Phase 1 | tokens-dapp.css + dapp.html hero migration G2 | ~1h |
| W3-Phase 2 | dapp.html sections (carousels airdrop attivi → centered editorial cards stack) | ~1.5h |
| W3-Phase 3 | airdrop.html detail page G2 redesign (header + stats + CTA) | ~1.5h |
| W3-Phase 4 | dApp navigation/topbar adaptation (bracket lockup invece di gold dot) | ~30 min |
| W3-Phase 5 | Visual checkpoint Skeezu + iteration | ~1h |
| W3-Phase 6 | Smoke prod + version bump alfa-2026.05.XX-4.1.0 (minor bump per dApp variant) | ~30 min |

**Totale W3 stima:** 5-6h spalmate. Coordinato con altri W3 tasks (PDF rebrand, email templates, top 5 SEO articles refresh) per single-batch deploy.

## 6. Visual reference assets per CCP

CCP, per esecuzione hai bisogno di:

1. **Brand Kit v2.0 HTML** già in `brand-and-community/AIROOBI_Brand_Kit_v2_0.html` — palette + tokens + voice principles condivisi
2. **Screenshot Skeezu** del G2 layout (allegato nel chat session 5 May, da archiviare)
3. **Tokens-dapp.css spec** sopra in §3 (copy-paste-ready)
4. **Layout HTML pattern** sopra in §4 (hero + airdrop card)

**Archive screenshot G2:** suggerisco salvare lo screenshot come `ROBY-Stuff/brand-and-community/G2_Marni_Minimal_dApp_Reference.png` per asset-trail (analogo al pattern "Brand-evolution archive").

## 7. Acceptance criteria

Pre-merge harden-w3 → main:

| # | Criterio | Method |
|---|---|---|
| 1 | dapp.html serve `data-variant="dapp"` | curl + grep |
| 2 | tokens-dapp.css linked + applicato | curl + grep `--bg-primary: #FAFAF7` (specifico dApp) |
| 3 | Cormorant Garamond loaded (body Inter resta) | network tab + grep |
| 4 | Hero centered editorial layout (no asymmetric grid) | visual screenshot |
| 5 | "È una skill." coral italic 88px (size scaled per dApp) | visual screenshot |
| 6 | CTAs centrati COMPRA + VENDI | visual screenshot |
| 7 | Bracket lockup `⌜ AIROOBI ⌝` invece di gold dot | grep `'⌜'` |
| 8 | Container max-width 720px | computed style check |
| 9 | Airdrop card layout centered editorial | visual screenshot |
| 10 | Smoke prod nessuna regressione institutional G3 | curl home.html + landing.html unchanged |

Skeezu visual sign-off finale richiesto prima di merge.

## 8. Risk audit

**Risk 1 — Brand bifurcation confusion:** utente vede home.com (G3 sharp) → click "App" → entra dApp G2 (warm serif centered). Transition = "wow effect" se intenzionale, "broken" se accidentale.

Mitigation: documentare brand bifurcation in Brand Kit v2.0 nuova sezione "§08 Brand variants — institutional G3 vs dApp G2" con visual side-by-side.

**Risk 2 — Cormorant resurrection:** brand v2 institutional aveva DROPPED Cormorant. dApp lo riprende. Coherence brand?

Mitigation: framing "Cormorant è la voce italiana riservata al dApp" (territorio sacro della partecipazione). Inter è la voce institutional/discovery. Bifurcation by audience type, non randomness.

**Risk 3 — Maintenance overhead 2 design system:** 2 set di tokens, 2 typography systems = 2x overhead future updates.

Mitigation: tokens.css base + tokens-dapp.css extension (delta layer). 90% shared, 10% override. Single source of truth + variant. Manageable.

## 9. ⚠️ DOMANDA CRITICA per Skeezu (prima di iniziare W3)

CCP, **NON iniziare W3 fino a Skeezu sign-off** sui seguenti 2 punti:

### A — Conferma scope dApp-only o ESTENSIONE a institutional?

Skeezu ha mostrato G2 e detto: *"il restyle va fatto anche per l'app, soprattutto"*. "Soprattutto" può significare:

**Opzione A1 (mia interpretazione default):** dApp G2 + institutional resta G3 (brand bifurcation intenzionale)
- Pro: preserva CCP W2 Day 1+2 work (3.5h già investiti)
- Pro: brand più ricco, audience-aware
- Con: 2 design system to maintain

**Opzione A2:** **TUTTO** in G2 (institutional + dApp), ROLLBACK del brand v2 G3 attuale
- Pro: brand unificato G2 ovunque
- Con: rifare CCP W2 Day 1+2 work
- Implicazione: rollback `harden-w2` branch, restart Phase 3 LIGHT con G2 layout invece di G3

### B — Cormorant Garamond resurrection conferma?

Brand v2 institutional aveva esplicitamente DROPPED Cormorant per Inter unique. Riprenderlo per dApp G2 = brand kit v2.0 update richiesto (§02 Typography).

Skeezu firma: ✅ Cormorant per dApp / ❌ usa solo Inter anche per dApp G2 (testo serif simulato via weight 200 light + letter-spacing tight)?

---

## 10. Closing peer-to-peer

CCP, brief consegnato. Brand bifurcation è governance choice — non default. Aspetto Skeezu sign-off su scope (A1 vs A2) + Cormorant decision.

Una volta confermato, W3 scope dApp parte post brand pivot v2 institutional merge harden-w2 → main + smoke prod stabilizzato.

Asset-trail simmetrico: archiviare screenshot G2 fornito da Skeezu in brand-and-community/ per memoria visiva governance.

Vai sereno.

---

— **ROBY**

*Versione 1.0 · 5 Mag 2026 W2 Day 1 sera · canale ROBY→CCP (dApp Restyle G2 Marni Minimal Brief — W3 scope)*
