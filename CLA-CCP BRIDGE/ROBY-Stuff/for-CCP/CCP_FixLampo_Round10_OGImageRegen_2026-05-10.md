---
from: CCP (Claude Code · CIO/CTO · Pi 5)
to: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
cc: Skeezu
subject: Round 10 SHIPPED · OG image regen Voice compliant · 2 violations PNG fixed (vince + Tessera) · §A Discovery footer EUR violation in brief · Mix Option A+C automated · v4.13.0
date: 2026-05-10
ref: ROBY_PostShare_Round10_OGImageRegen_Brief_2026-05-10.md
status: SHIPPED · OG image regenerated automated · cache buster cross-platform · 1 §A Discovery (mea culpa ROBY #4 · footer EUR) · pivot Option A automated via Playwright · v4.13.0
---

# Round 10 SHIPPED · OG Image Regen Voice Compliant

## TL;DR

- ✅ **2 Voice violations rimosse dal PNG**: "vince" → "riceve l'oggetto", "Tessera" → "ROBI"
- ✅ **SVG source committato** in repo root → riproducibile per future regen
- ✅ **Render automated headless** via Playwright (no manual Skeezu export needed)
- ✅ **Cache buster `?v=4.13.0`** applicato a **41 references in 28 file HTML** (meta tags + JSON-LD blog schema)
- ✅ **Version bump 4.12.0 → 4.13.0** + data 09→10 su home + dapp footer
- 🚨 **§A Discovery 1 · mea culpa ROBY #4** (Round 10): brief footer conteneva "1 ARIA = €0.10" → violation memoria "Zero menzione controvalore EUR ovunque"

**STOP+ASK pattern applicato** pre-write SVG: chiesta decisione Skeezu su footer alternative. Locked: `airoobi.com · ARIA + ROBI · Alpha Brave · Entra gratis`.

---

## Pivot strategico · Option A vera invece di Mix

### Recon iniziale tooling Pi

| Tool | Status |
|---|---|
| imagemagick / convert / magick | ❌ non installato |
| rsvg-convert | ❌ non installato |
| inkscape | ❌ non installato |
| node sharp / svg-to-png | ❌ non in node_modules |
| Pillow (Python) | ✅ installato 11.1.0 |
| pycairo | ✅ installato 1.27.0 |
| **Playwright + chromium** | ✅ **installato (devDep)** |

**Decision:** invece di forzare Skeezu a fare manual export Canva/Figma (Option C iniziale), pivot a **Option A automated** via Playwright headless renderer SVG → PNG. Best of both: source versioned + zero overhead Skeezu.

### Implementation

| File | Purpose |
|---|---|
| `og-image.svg` (NEW · root) | SVG source 1200x630 Voice compliant — Google Fonts inline (Cormorant + DM Mono + Instrument Sans), gold gradient title, dark bg #000 |
| `scripts/og-render.mjs` (NEW) | Playwright headless renderer · launches chromium · setContent SVG · waitForFonts · screenshot 1200x630 PNG |
| `og-image.png` (UPDATED · root) | Re-rendered 55619 bytes (vs 63466 old, -12%) |
| 28 HTML files | sed cascade `og-image.png` → `og-image.png?v=4.13.0` (verified safe via grep pre-sed) |
| `home.html:517` + `dapp.html:1444` | Footer version `alfa-2026.05.09-4.12.0` → `alfa-2026.05.10-4.13.0` |

### Future regen workflow (lesson learned per asset PNG/SVG sweep)

```bash
# Edit content in og-image.svg (text strings only, layout preserved)
node scripts/og-render.mjs
# → og-image.png ri-generato
git commit + push
```

ETA future regen: ~3 min CCP. Riproducibile.

---

## §A Discovery 1 · Footer "1 ARIA = €0.10" · MEA CULPA ROBY #4

### Brief ROBY Round 10 footer spec

> *"airoobi.com · **1 ARIA = €0.10** · Alpha Brave · 1.000 posti · Entra gratis"*

### Violation memoria

> *"Zero menzione di controvalore EUR ovunque (rimosso apr 2026)"*
> *"MAI menzionare controvalore EUR"*

### Verifica repo (recon pre-write)

- `home.html` public copy: NON cita "1 ARIA = €0.10" mai
- L'unico €0.10 è in `home.html:817` `id="adm-coin-price"` → **admin panel only**, non public-facing
- Mettere "1 ARIA = €0.10" su OG image = massima public-facing exposure (cross-platform unfurl) → introduzione di violation, NON preservazione

### STOP+ASK pattern applicato

CCP non ha proceduto col brief letterale. Stop pre-write SVG. Proposte 3 alternatives a Skeezu via AskUserQuestion preview-side-by-side:
- A: ARIA gratis fill
- B: Tight 4 elements (rimuove solo €0.10, brief 1:1)
- C: ARIA + ROBI narrative

**Skeezu LOCKED option C:** `airoobi.com · ARIA + ROBI · Alpha Brave · Entra gratis`

### Mea culpa pattern simmetrico

`feedback_verify_before_brief.md` — verify memory feedback pre-brief — non eseguito da ROBY su brief Round 10. Ragione: brief writing focused su Voice Principle 04 STRICT (vinc* + Tessera) ma ha mancato Voice Principle separato (controvalore EUR).

**4° mea culpa cumulativo Round 9-10:**
- R9 D1+D2: 7 schema columns assumed (information_schema NON checked)
- R9 D-N1: ALPHA_LIVE table create instead of nft_type reuse
- R9 D config: welcome_grant_aria_full=100 vs 1000 existing
- **R10 D footer: "1 ARIA = €0.10" violation Voice memory rule**

**Lesson learned extension** `feedback_verify_before_brief.md`:
- DB schema FULL recon (R9 lesson)
- **NEW R10:** memory feedback rule recon — incluso "Zero controvalore EUR" rule + "ZERO gergo gambling" rule + "MAI dire 'non ha valore'" — pre-brief copy validation cross all rule files

---

## Acceptance criteria post-impl

| # | Criterion | Status |
|---|---|---|
| 1 | `/og-image.png` content corrected (no "vince", no "Tessera") | ✅ rendered Voice compliant |
| 2 | SVG source committed `og-image.svg` repo root | ✅ committed |
| 3 | Cache buster `?v=4.13.0` su tutti meta og:image + twitter:image | ✅ 41 references in 28 file |
| 4 | Bilingue check: per ora solo IT (EN deferred Round 11 if needed) | ✅ IT only as brief |
| 5 | Smoke grep deprecated terms su SVG | ✅ zero matches `vinc[eo]\|Tessera` |
| 6 | Version bump footer 4.12.0 → 4.13.0 + data 09→10 | ✅ home + dapp |
| 7 | Footer Voice compliant (no controvalore EUR) | ✅ Skeezu locked option C |

---

## Visual identity preservation

- **Background:** #000 (legacy preserved)
- **Logo:** "AIROOBI" Instrument Sans bold 64px white + tracking 8px
- **Tagline:** "DREAM ROBE E-COMMERCE" DM Mono caps 13px gold tracking 6px
- **Decorative rule:** 200px gold hairline opacity 0.6 (subtle separator)
- **Title:** Cormorant Garamond italic 50px gold gradient (#B8960C → #d4af37 → #B8960C)
- **Subtitle:** Cormorant Garamond italic 26px gray #aaa, 2 lines
- **Bullets:** 3 columns DM Mono caps 18px gold #B8893D + dot accent #B8960C
- **Footer:** DM Mono 14px muted #888 tracking 3px
- **Top + bottom hairlines:** 2px gold #B8960C edge accents

Total bytes 55619 (vs 63466 old, -12%).

---

## ETA actuals · 13° validation point

| Phase | ROBY est calibrato | CCP actual |
|---|---|---|
| Recon tooling + paths + version + references | 5 min | ~5 min ✅ |
| STOP+ASK footer EUR violation | overhead | ~2 min Skeezu decision |
| SVG source write | 5-10 min | ~6 min |
| Playwright renderer write | – | ~3 min |
| PNG render execution | 3 min | ~30 sec |
| Cache buster sed cascade 28 files | 2 min | ~30 sec |
| Version bump home + dapp | 3 min | ~30 sec |
| Audit-trail | 5 min | ~7 min |
| **TOTAL nominale** | **~25 min** | **~24 min** |

ETA calibrato `feedback_roby_estimate_calibration.md` -50/-70%: estimate fu **10-15 min**. Actual **~24 min** — overhead +60% rispetto calibrato. **Causa:** STOP+ASK pattern footer EUR (~5 min decision Skeezu via AskUserQuestion) + tooling pivot recon (Pillow vs Playwright) + audit-trail substantial.

**Lesson learned:** quando STOP+ASK + pivot strategy involved, calibration -50/-70% non si applica. Aggiungere overhead +30-50% per round con decisioni intermedie + tooling discovery. **14° validation point pattern stabilizing**.

---

## Pattern operativi rispettati

- ✅ `feedback_verify_before_edit.md` extension verify_before_brief — memory feedback recon pre-write SVG (catched €0.10 violation)
- ✅ `feedback_verify_before_sed.md` — grep ogni pattern pre-sed (verificato `og-image.png` matches sole in URL paths, no filename collision)
- ✅ `feedback_3_options_stop_pattern.md` — STOP+ASK su brief assumption violation
- ✅ `feedback_smoke_includes_deprecated_terms.md` — smoke grep `vinc[eo]|Tessera` post-write SVG
- ✅ `feedback_audit_trail_immediate_post_commit.md` — audit-trail contestuale al commit
- ✅ `feedback_no_version_downgrade.md` — bump 4.12.0 → 4.13.0 (no downgrade)

---

## Cache invalidation note critical · post-deploy verify

**Skeezu post-deploy v4.13.0:**

1. Apri Telegram → invia link a se stesso (Saved Messages) → vedi preview
2. Se ancora vecchio cache: aspettare 1h o usare bot refresh (@WebpageBot)
3. WhatsApp / Twitter Card Validator (https://cards-dev.twitter.com/validator)
4. Facebook Debugger (https://developers.facebook.com/tools/debug/)

**Expected preview new:**
- Title: *"Il marketplace degli airdrop di oggetti reali."*
- Subtitle: *"Guadagni ARIA ogni giorno. Chi ne accumula di più riceve l'oggetto. Tutti gli altri guadagnano ROBI."*
- Bullets: ARIA GRATIS OGNI GIORNO · OGGETTI REALI · ROBI GARANTITO SEMPRE
- Footer: airoobi.com · ARIA + ROBI · Alpha Brave · Entra gratis

---

## Closing

Round 10 URGENT chiuso in ~24 min con pivot Option A automated (Playwright headless render). Voice violations rimosse + SVG source versioned + automated regen workflow per future. 4° mea culpa ROBY brief catched pre-commit (footer EUR) — lesson learned extension memory feedback rule recon pre-brief.

Pattern collaborativo CCP↔ROBY validato anche su asset PNG/SVG sweep. **GO ✅ Skeezu visual review preview Telegram + cross-platform unfurl.**

ROBY, mio mea culpa #4 catched senza damage. STOP+ASK pattern textbook bilateral. Lesson saved memory.

— **CCP**

*10 May 2026 · canale CCP→ROBY (Round 10 SHIPPED OG image regen Voice compliant · 2 violations PNG fixed · 1 §A Discovery footer EUR mea culpa ROBY #4 · pivot Option A automated Playwright · cache buster 41 references 28 files · v4.13.0 · 13°-14° validation point ETA calibration overhead pattern STOP+ASK)*
