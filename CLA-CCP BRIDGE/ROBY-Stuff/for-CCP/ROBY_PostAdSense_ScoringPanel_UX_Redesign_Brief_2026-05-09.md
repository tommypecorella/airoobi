---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · Pi 5)
cc: Skeezu
subject: Brief separato · Scoring Panel UX Redesign · `/airdrops/:id` "Stai vincendo" panel comprensibilità · post-AdSense scope · DRAFT priority MEDIUM
date: 2026-05-09
ref: visual review Skeezu unica post Round 3 (Issue #2 — "scoring panel incomprensibile") + screenshot allegato
status: FINAL BRIEF · Skeezu sign-off (a)+(d)+(a) LOCKED 9 May 2026 evening · CCP impl scope ROUND 5 (escalata da post-AdSense a NOW per UX critical Alpha Brave acquisition) · ETA calibrato 1.5-2.5h CCP
---

# Scoring Panel UX Redesign · Brief draft

## TL;DR

Skeezu visual review unica ha flaggato il scoring breakdown panel su `/airdrops/:id` loggato come **incomprensibile**. Panel attuale densità informativa eccessiva + linguaggio matematico exposed + zero visual hierarchy + hint+CTA mescolati.

**Scope:** redesign UX content + visual hierarchy del panel. NO blocker AdSense (loggato). Post-AdSense scope.

**ROBY work:** ~2-3h (analisi + content rewrite + wireframe sketch + brief CCP impl)
**CCP work successivo:** ~2-4h (HTML structure + CSS + JS interaction se progressive disclosure)

**Status DRAFT:** brief è skeleton, attesa Skeezu sign-off su design direction (semplificare vs mantenere tutti i dettagli) prima di finalizzare content + wireframe.

---

## Stato attuale (analisi screenshot Skeezu)

```
☆ Stai vincendo
Tuo Punteggio: 1.00

🏆 Blocchi correnti                     1 · √=1.00
   Contributo a radice quadrata: 100 blocchi valgono 10, non 100.

💎 Moltiplicatore Fedeltà               ×1.00
                                        0 ARIA
   Cresce con gli ARIA spesi in categoria (curva logaritmica).

⚡ Boost di garanzia                    0/19725
                                        +0.00
   11835 partecipazioni in categoria al prossimo Boost.

☆ Sei in testa! Compra altri blocchi e partecipa spesso in
   categoria per difendere il primato.

⚡ Approfitta della presale: prezzo ridotto e 2x ROBI dal mining.
```

## Diagnosi UX (brutal-honest)

### Cosa funziona
- Status header chiaro ("Stai vincendo" + "Punteggio: 1.00")
- Icone visivamente differenziate per ogni metrica
- Hint text below ogni metrica (intent educational)

### Cosa NON funziona

1. **Densità informativa eccessiva**: 3 metriche tecniche + 3 hint text + 2 CTA in panel singolo = cognitive overload
2. **Linguaggio matematico exposed**: `√=1.00`, `×1.00`, `0/19725`, `curva logaritmica` — gergo per ingegneri, non per utenti generalist
3. **Zero visual hierarchy**: tutti gli elementi stessa importance grafica (stesso font size, weight, color tone)
4. **Hint text + CTA mescolati**: "Sei in testa! Compra..." + "Approfitta della presale..." mixed sotto le metriche senza separation
5. **No progressive disclosure**: tutti i dettagli sempre visibili = no breath room
6. **Numeri raw senza contesto**: `0/19725` cosa significa? Quale è il goal? Quanto manca? Linguaggio "11835 partecipazioni in categoria al prossimo Boost" è impenetrabile
7. **Rapporti unclear**: come si lega "Blocchi" con "Moltiplicatore" con "Boost" nel scoring totale? Dipendenze tra metriche non chiare

## Redesign principles proposti (ROBY)

### Principle 1 · Progressive Disclosure
**Default state (compatto):** status + score + 1 next action chiara
**Expanded state (on tap "Dettagli"):** breakdown completo metriche + hint educational

### Principle 2 · Linguaggio user-first
- Eliminare matematica exposed (`√=1.00`, `×1.00`, `+0.00`) dal default state
- Hint text in linguaggio benefit-driven ("Più blocchi = più chance di vincere") non formula-driven ("contributo a radice quadrata")
- Numbers contextualizzati ("Sei a 11835 partecipazioni dal prossimo bonus" vs "0/19725")

### Principle 3 · Visual hierarchy 3 livelli
- **Livello 1 (prominent):** status + score + next action (default visible)
- **Livello 2 (intermediate):** 3 metriche key con valore corrente + delta visualizzato
- **Livello 3 (deep):** hint educational + matematica exposed (only on expand)

### Principle 4 · CTA prominenti separati
- "Compra altri blocchi" → button grande gold prominent (separato da hint)
- "Approfitta presale 2x ROBI" → badge/banner separato (separato da hint)

---

## Wireframe proposto (default compatto state)

```
┌─────────────────────────────────────────┐
│  ⭐ Stai vincendo                        │
│                                         │
│      1.00                               │
│      Tuo punteggio                      │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  💪 Difendi il primato:          │    │
│  │  +1 blocco aumenta il tuo score │    │
│  │                                  │    │
│  │  [ COMPRA ALTRO BLOCCO ]        │    │
│  └─────────────────────────────────┘    │
│                                         │
│  🔥 Presale 2x ROBI · Approfitta ora    │
│                                         │
│  [+ Vedi dettagli scoring]              │
└─────────────────────────────────────────┘
```

## Wireframe proposto (expanded state · on tap "Vedi dettagli")

```
┌─────────────────────────────────────────────┐
│  ⭐ Stai vincendo · Punteggio 1.00           │
│                                             │
│  📊 Breakdown del tuo punteggio:            │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  🏆 Blocchi (peso 50%)               │   │
│  │  1 blocco · contributo 1.00          │   │
│  │  💡 Più blocchi = più chance di      │   │
│  │     vincere (con limite anti-spam)   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  💎 Fedeltà categoria (peso 30%)    │   │
│  │  Moltiplicatore ×1.00                │   │
│  │  ARIA spesi: 0                       │   │
│  │  💡 Partecipa più volte nella stessa │   │
│  │     categoria per crescere il        │   │
│  │     moltiplicatore                   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  ⚡ Boost garanzia                   │   │
│  │  Manca: 11.835 partecipazioni       │   │
│  │  Bonus al raggiungimento: +1.00     │   │
│  │  💡 Boost si attiva automaticamente  │   │
│  │     ogni N partecipazioni in        │   │
│  │     categoria — pity reward         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [- Nascondi dettagli]                     │
└─────────────────────────────────────────────┘
```

## Content rewrite proposto (default compact)

| Element | Current | Proposed |
|---|---|---|
| Header | "Stai vincendo / Tuo Punteggio: 1.00" | "⭐ Stai vincendo · Punteggio 1.00" |
| Next action | "Sei in testa! Compra altri blocchi e partecipa spesso in categoria per difendere il primato." | "Difendi il primato: +1 blocco aumenta il tuo score" + button "COMPRA ALTRO BLOCCO" |
| Presale CTA | "Approfitta della presale: prezzo ridotto e 2x ROBI dal mining." | "🔥 Presale 2x ROBI · Approfitta ora" (badge banner separato) |
| Expand toggle | (not present) | "[+ Vedi dettagli scoring]" / "[- Nascondi dettagli]" |

## Content rewrite proposto (expanded state)

| Metrica | Current | Proposed |
|---|---|---|
| Blocchi | "Blocchi correnti · 1 · √=1.00 · Contributo a radice quadrata: 100 blocchi valgono 10, non 100." | "🏆 **Blocchi (peso 50%)** · 1 blocco · contributo 1.00 · 💡 Più blocchi = più chance di vincere (con limite anti-spam)" |
| Moltiplicatore | "Moltiplicatore Fedeltà · ×1.00 · 0 ARIA · Cresce con gli ARIA spesi in categoria (curva logaritmica)." | "💎 **Fedeltà categoria (peso 30%)** · Moltiplicatore ×1.00 · ARIA spesi: 0 · 💡 Partecipa più volte nella stessa categoria per crescere il moltiplicatore" |
| Boost | "Boost di garanzia · 0/19725 · +0.00 · 11835 partecipazioni in categoria al prossimo Boost." | "⚡ **Boost garanzia** · Manca: 11.835 partecipazioni · Bonus al raggiungimento: +1.00 · 💡 Boost si attiva automaticamente ogni N partecipazioni in categoria — pity reward" |

---

## ✅ Decisioni Skeezu LOCKED 9 May 2026 evening

| # | Decisione | Lock |
|---|---|---|
| 1 | Direzione design — approve wireframes proposti (compact default + expanded on-tap) | (a) ✅ LOCKED |
| 2 | Naming "Boost garanzia" → **"Bonus partecipazione"** (semplificato, allineato pity filosofia) | (d) ✅ LOCKED |
| 3 | Progress bar Boost — sì + ETA stima visualizzata | (a) ✅ LOCKED |

**Status:** brief escalato da post-AdSense scope a **ROUND 5 NOW** per UX critical Alpha Brave acquisition retention. Parallel a Skeezu Path A (re-submission AdSense in corso/done).

---

## HTML/CSS Spec for CCP impl (paste-friendly)

### A · HTML structure target

CCP recon: identifica component scoring panel attuale in `airdrop.html` o JS dynamic render in `airdrop.js`. Replace con struttura sotto.

```html
<!-- Scoring Panel Redesign · default compact state -->
<div class="scoring-panel" data-state="compact">

  <!-- A.1 Header status -->
  <div class="scoring-header">
    <span class="scoring-status-icon">⭐</span>
    <span class="scoring-status-label">
      <span class="it" lang="it">Stai vincendo</span>
      <span class="en" lang="en">You're winning</span>
    </span>
  </div>

  <!-- A.2 Score prominent -->
  <div class="scoring-score">
    <div class="scoring-score-value">7.14</div>
    <div class="scoring-score-label">
      <span class="it" lang="it">Tuo punteggio</span>
      <span class="en" lang="en">Your score</span>
    </div>
  </div>

  <!-- A.3 Next action box -->
  <div class="scoring-action-box">
    <div class="scoring-action-hint">
      <span class="it" lang="it">💪 Difendi il primato: +1 blocco aumenta il tuo score</span>
      <span class="en" lang="en">💪 Defend the lead: +1 block raises your score</span>
    </div>
    <button class="scoring-action-cta" onclick="scrollToBuyBlocks()">
      <span class="it" lang="it">COMPRA ALTRO BLOCCO</span>
      <span class="en" lang="en">BUY ANOTHER BLOCK</span>
    </button>
  </div>

  <!-- A.4 Presale banner -->
  <div class="scoring-presale-banner">
    <span class="it" lang="it">🔥 Presale 2x ROBI · Approfitta ora</span>
    <span class="en" lang="en">🔥 Presale 2x ROBI · Take advantage now</span>
  </div>

  <!-- A.5 Expand toggle -->
  <button class="scoring-expand-toggle" onclick="toggleScoringDetails(this)">
    <span class="scoring-expand-icon">+</span>
    <span class="scoring-expand-label-collapsed">
      <span class="it" lang="it">Vedi dettagli scoring</span>
      <span class="en" lang="en">View scoring details</span>
    </span>
    <span class="scoring-expand-label-expanded" style="display:none">
      <span class="it" lang="it">Nascondi dettagli</span>
      <span class="en" lang="en">Hide details</span>
    </span>
  </button>

  <!-- A.6 Expanded breakdown (default hidden) -->
  <div class="scoring-breakdown" style="display:none">

    <h4 class="scoring-breakdown-title">
      <span class="it" lang="it">📊 Breakdown del tuo punteggio</span>
      <span class="en" lang="en">📊 Your score breakdown</span>
    </h4>

    <!-- Metric 1 · Blocchi -->
    <div class="scoring-metric scoring-metric-blocks">
      <div class="scoring-metric-header">
        <span class="scoring-metric-icon">🏆</span>
        <span class="scoring-metric-name">
          <span class="it" lang="it">Blocchi (peso 50%)</span>
          <span class="en" lang="en">Blocks (50% weight)</span>
        </span>
      </div>
      <div class="scoring-metric-value">
        <span class="it" lang="it">{{N}} blocchi · contributo {{value}}</span>
        <span class="en" lang="en">{{N}} blocks · contribution {{value}}</span>
      </div>
      <div class="scoring-metric-hint">
        <span class="it" lang="it">💡 Più blocchi = più chance di vincere (con limite anti-spam)</span>
        <span class="en" lang="en">💡 More blocks = more chance to win (with anti-spam limit)</span>
      </div>
    </div>

    <!-- Metric 2 · Fedeltà -->
    <div class="scoring-metric scoring-metric-loyalty">
      <div class="scoring-metric-header">
        <span class="scoring-metric-icon">💎</span>
        <span class="scoring-metric-name">
          <span class="it" lang="it">Fedeltà categoria (peso 30%)</span>
          <span class="en" lang="en">Category loyalty (30% weight)</span>
        </span>
      </div>
      <div class="scoring-metric-value">
        <span class="it" lang="it">Moltiplicatore {{multiplier}}x · ARIA spesi: {{aria_spent}}</span>
        <span class="en" lang="en">Multiplier {{multiplier}}x · ARIA spent: {{aria_spent}}</span>
      </div>
      <div class="scoring-metric-hint">
        <span class="it" lang="it">💡 Partecipa più volte nella stessa categoria per crescere il moltiplicatore</span>
        <span class="en" lang="en">💡 Participate more often in the same category to grow the multiplier</span>
      </div>
    </div>

    <!-- Metric 3 · Bonus partecipazione -->
    <div class="scoring-metric scoring-metric-bonus">
      <div class="scoring-metric-header">
        <span class="scoring-metric-icon">⚡</span>
        <span class="scoring-metric-name">
          <span class="it" lang="it">Bonus partecipazione</span>
          <span class="en" lang="en">Participation bonus</span>
        </span>
      </div>
      <div class="scoring-metric-value">
        <span class="it" lang="it">Manca: {{remaining}} partecipazioni · Bonus al raggiungimento: +{{bonus}}</span>
        <span class="en" lang="en">Missing: {{remaining}} participations · Bonus on reach: +{{bonus}}</span>
      </div>
      <!-- Progress bar -->
      <div class="scoring-metric-progress">
        <div class="scoring-metric-progress-bar" style="width:{{percent}}%"></div>
      </div>
      <div class="scoring-metric-progress-eta">
        <span class="it" lang="it">{{percent}}% · stima ~{{eta_months}} mesi al bonus</span>
        <span class="en" lang="en">{{percent}}% · estimated ~{{eta_months}} months to bonus</span>
      </div>
      <div class="scoring-metric-hint">
        <span class="it" lang="it">💡 Bonus si attiva automaticamente ogni N partecipazioni — nessuno esce a mani vuote</span>
        <span class="en" lang="en">💡 Bonus activates automatically every N participations — no one leaves empty-handed</span>
      </div>
    </div>

  </div>

</div>
```

**Note placeholder `{{...}}`:** sostituire con valori dinamici JS (current implementation passa già questi valori al rendering — replace con nuovi field name nel template).

### B · CSS spec (extension `dapp-v2-g3.css` Round 5 section)

```css
/* ============================================
   ROUND 5 · Scoring Panel UX Redesign
   ============================================ */

.scoring-panel {
  background: var(--airoobi-bg-soft, #FAFAF7);
  border: 1px solid var(--airoobi-border, rgba(15,20,23,0.08));
  border-radius: 8px;
  padding: 24px;
  margin: 16px 0;
  font-family: 'Inter', sans-serif;
}

/* Header status */
.scoring-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.scoring-status-icon { font-size: 1.25rem; }
.scoring-status-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--airoobi-ink, #1B1814);
  letter-spacing: 0.02em;
}

/* Score prominent (HERO) */
.scoring-score {
  text-align: center;
  margin: 24px 0 32px;
}
.scoring-score-value {
  font-family: 'Inter', sans-serif;
  font-size: clamp(3rem, 8vw, 4rem);
  font-weight: 300;
  color: var(--airoobi-gold, #B8893D);
  line-height: 1;
  letter-spacing: -0.02em;
}
.scoring-score-label {
  font-size: 0.85rem;
  color: var(--airoobi-ink-muted, #5A544E);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 4px;
}

/* Action box (CTA isolato) */
.scoring-action-box {
  background: var(--airoobi-bg, #FFFFFF);
  border: 1px solid var(--airoobi-gold, #B8893D);
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 16px;
  text-align: center;
}
.scoring-action-hint {
  font-size: 0.95rem;
  color: var(--airoobi-ink, #1B1814);
  margin-bottom: 16px;
  line-height: 1.5;
}
.scoring-action-cta {
  background: var(--airoobi-gold, #B8893D);
  color: #FFF;
  border: none;
  padding: 14px 32px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}
.scoring-action-cta:hover {
  background: #A07930;
}

/* Presale banner separato */
.scoring-presale-banner {
  background: rgba(247,54,89,0.08);
  border-left: 3px solid var(--airoobi-coral, #F73659);
  padding: 12px 16px;
  font-size: 0.85rem;
  color: var(--airoobi-ink, #1B1814);
  margin-bottom: 16px;
  border-radius: 0 4px 4px 0;
}

/* Expand toggle */
.scoring-expand-toggle {
  background: transparent;
  border: none;
  color: var(--airoobi-gold, #B8893D);
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: underline;
  text-underline-offset: 4px;
}
.scoring-expand-toggle:hover {
  color: #A07930;
}
.scoring-expand-icon {
  font-size: 1.1rem;
  font-weight: 700;
}

/* Breakdown expanded */
.scoring-breakdown {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--airoobi-border, rgba(15,20,23,0.08));
}
.scoring-breakdown-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--airoobi-ink, #1B1814);
  margin: 0 0 16px;
}

/* Metric box */
.scoring-metric {
  background: var(--airoobi-bg, #FFFFFF);
  border: 1px solid var(--airoobi-border, rgba(15,20,23,0.08));
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;
}
.scoring-metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.scoring-metric-icon { font-size: 1.1rem; }
.scoring-metric-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--airoobi-ink, #1B1814);
}
.scoring-metric-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  color: var(--airoobi-ink, #1B1814);
  margin-bottom: 8px;
}
.scoring-metric-hint {
  font-size: 0.8rem;
  color: var(--airoobi-ink-muted, #5A544E);
  font-style: italic;
  line-height: 1.5;
}

/* Progress bar */
.scoring-metric-progress {
  height: 6px;
  background: rgba(15,20,23,0.06);
  border-radius: 3px;
  overflow: hidden;
  margin: 12px 0 4px;
}
.scoring-metric-progress-bar {
  height: 100%;
  background: var(--airoobi-gold, #B8893D);
  border-radius: 3px;
  transition: width 0.3s ease;
}
.scoring-metric-progress-eta {
  font-size: 0.75rem;
  color: var(--airoobi-ink-muted, #5A544E);
  font-family: 'JetBrains Mono', monospace;
  margin-bottom: 8px;
}

/* Mobile responsive */
@media (max-width: 480px) {
  .scoring-panel { padding: 16px; }
  .scoring-action-cta { padding: 12px 20px; font-size: 0.85rem; }
}
```

### C · JS interaction spec

```javascript
// Toggle expand/collapse breakdown
function toggleScoringDetails(toggleBtn) {
  const panel = toggleBtn.closest('.scoring-panel');
  const breakdown = panel.querySelector('.scoring-breakdown');
  const collapsedLabel = toggleBtn.querySelector('.scoring-expand-label-collapsed');
  const expandedLabel = toggleBtn.querySelector('.scoring-expand-label-expanded');
  const icon = toggleBtn.querySelector('.scoring-expand-icon');

  const isExpanded = breakdown.style.display !== 'none';

  if (isExpanded) {
    breakdown.style.display = 'none';
    collapsedLabel.style.display = 'inline';
    expandedLabel.style.display = 'none';
    icon.textContent = '+';
    panel.dataset.state = 'compact';
  } else {
    breakdown.style.display = 'block';
    collapsedLabel.style.display = 'none';
    expandedLabel.style.display = 'inline';
    icon.textContent = '−';
    panel.dataset.state = 'expanded';
  }
}

// Smooth scroll to buy blocks section (for action CTA)
function scrollToBuyBlocks() {
  const buyBlocks = document.querySelector('.buy-box') || document.querySelector('#buy-blocks');
  if (buyBlocks) {
    buyBlocks.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Calculate ETA stima months (for Bonus partecipazione progress bar)
// ETA = remaining_participations / avg_user_participations_per_month
// Default avg ~120 partecipazioni/mese (configurable threshold)
function calculateBonusETA(remaining, avgPerMonth = 120) {
  const months = Math.ceil(remaining / avgPerMonth);
  return months;
}
```

**Note CCP recon necessario:**
- Identifica current scoring panel render code (probabile in `airdrop.js` template literal o React-style component)
- Verifica current data fields disponibili: blocks_current, contribution_value, multiplier, aria_spent_category, bonus_remaining, bonus_value
- Replace HTML con struttura nuova + JS toggle + ETA calculation
- Cache busters version bump 4.6.0 → 4.7.0

---

## Acceptance criteria post-impl

Smoke verify post-deploy v4.7.0:

1. ✅ Default state compact: status icon + score prominent + action box CTA + presale banner + expand toggle visible
2. ✅ Score value rendered prominent (3-4rem font, gold color, centered)
3. ✅ Click "Vedi dettagli scoring" → breakdown expanded smooth + toggle label change
4. ✅ Breakdown 3 metric box (Blocchi, Fedeltà categoria, Bonus partecipazione) con icon + name + value + hint educational
5. ✅ Bonus partecipazione progress bar visualizzata + ETA stima months
6. ✅ Click "Nascondi dettagli" → breakdown collapsed + toggle label change
7. ✅ Action CTA "COMPRA ALTRO BLOCCO" → smooth scroll a buy blocks section
8. ✅ Mobile responsive <480px: padding ridotto + CTA size ridotto
9. ✅ Brand v2.2 coerent: Inter + Renaissance gold + ink + bg light
10. ✅ Bilingue inline IT+EN preservato pattern

---

## ETA stima calibrata

| Phase | ETA |
|---|---|
| CCP recon component esistente (airdrop.js scoring panel) | 10-15 min |
| HTML structure replace | 30-45 min |
| CSS extension dapp-v2-g3.css Round 5 section | 30 min |
| JS interaction (toggle + scroll + ETA calc) | 20 min |
| Version bump 4.6.0 → 4.7.0 cross-files | 5 min |
| Smoke local + audit-trail file | 15-20 min |
| **TOTAL** | **~2-2.5h CCP** |

ETA calibrato `feedback_roby_estimate_calibration.md` -50/-70%: real estimate **~1-1.5h CCP**.

---

## ETA stima

| Phase | ETA |
|---|---|
| Skeezu sign-off decisioni #1+#2+#3 | 5-15 min |
| ROBY brief finalization (HTML/CSS spec + content fine-tuning) | 1-2h |
| CCP recon component esistente + impl HTML structure | 1-2h |
| CCP CSS styling + visual hierarchy | 1-1.5h |
| CCP JS interaction (expand/collapse + progress bar) | 1h |
| Smoke testing + audit-trail | 30 min |
| **TOTAL CCP work** | **3.5-5h** |

ETA stima nominale calibrato `feedback_roby_estimate_calibration.md` -50/-70%: real estimate **~1.5-2.5h CCP**.

**Scope:** post-AdSense (no urgency). Pianificare W3 quando CCP ha bandwidth.

---

## Closing · Brief FINAL ready per CCP Round 5 impl

Brief escalato da DRAFT post-AdSense scope a FINAL Round 5 NOW per UX critical Alpha Brave acquisition retention. Skeezu decisioni LOCKED (a+d+a). HTML/CSS/JS spec paste-friendly pronto.

CCP, daje Round 5 — full UX redesign scoring panel, parallel a Skeezu Path A AdSense re-submission.

Pattern operativi (recap):
- NO sed cascade (Edit chirurgici + grep verify pre-patch)
- NO rewrite legacy (extend + replace component scoring panel surgical)
- Bilingue inline IT+EN preservato
- §A Discoveries documented if 3+
- Audit-trail immediate post-commit (file CCP_FixLampo_Round5_*.md generato CONTESTUALMENTE)

ETA calibrato 1-1.5h CCP. Daje, ultimo round per UX scoring panel comprensibile.

---

— **ROBY**

*9 May 2026 W2 Day 5 evening · canale ROBY→CCP (Brief draft Scoring Panel UX redesign · post-AdSense scope · DRAFT attesa Skeezu sign-off · 3 decisioni pending)*
