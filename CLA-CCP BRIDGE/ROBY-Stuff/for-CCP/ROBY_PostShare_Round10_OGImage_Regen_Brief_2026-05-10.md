---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · Pi 5)
cc: Skeezu
subject: Round 10 URGENT · OG image regen · 2 Voice Principle violations critical (vinc* + Tessera) visibili share preview Telegram · share campagna LIVE
date: 2026-05-10
ref: Skeezu screenshot Telegram share preview airoobi.app · Voice Principle 04 STRICT cluster vinc* + naming deprecated "Tessera" (Round 2 D.2 LOCKED)
status: BRIEF READY URGENT · Skeezu sta sharing referral link ORA · ETA calibrato 15-25 min CCP · v4.13.0
---

# Round 10 URGENT · OG Image Regen

## TL;DR

Skeezu ha lanciato share campagna referral. Telegram preview rivela **2 Voice Principle 04 STRICT violations critical su OG image asset PNG**:
1. **"Chi ne ha di più vince"** — `vinc*` cluster soft-banned (extension W2 Day 5)
2. **"Tessera garantita sempre"** — "Tessera" deprecated naming (Round 2 D.2 LOCKED Skeezu "no più tessere di rendimento")

**Asset PNG `og-image.png` NON è stato regenerato post MEGA closure brand pivot v2.2 + Voice Principle 04 STRICT sweep.** Sweep era HTML/CSS/JS only, asset PNG/SVG passati attraverso le maglie.

**URGENT:** ogni share del referral link MOSTRA Voice violations cross-platform (Telegram, WhatsApp, Twitter, Email link unfurl). Ogni minuto che passa = ulteriore exposure violation.

ETA stima 15-25 min CCP atomic (asset regeneration + path verify + cache invalidation).

---

## Issue 1 · "Chi ne ha di più vince" → fix

**Stringa attuale OG image:** *"Guadagni ARIA ogni giorno. Chi ne ha di più vince. Tutti gli altri incassano."*

**Voice violation:** `vince` = cluster `vinc*` soft-banned in copy user-facing (Voice Principle 04 STRICT extension Round 2 H2 Discovery + W2 Day 5).

**Fix proposto:**
- IT: *"Guadagni ARIA ogni giorno. Chi ne accumula di più riceve l'oggetto. Tutti gli altri guadagnano ROBI."*

Replace pattern:
- "Chi ne ha di più vince" → "Chi ne accumula di più riceve l'oggetto"
- "Tutti gli altri incassano" → "Tutti gli altri guadagnano ROBI"

## Issue 2 · "Tessera garantita sempre" → fix

**Stringa attuale OG image (3° bullet):** *"Tessera garantita sempre"*

**Voice violation:** "Tessera" naming deprecated (Round 2 D.2 LOCKED Skeezu "no più tessere di rendimento", "asset digitali del portafoglio AIROOBI" preferito).

**Fix proposto:**
- IT: *"ROBI garantito sempre"* o *"Garanzia sempre"* o *"Asset garantito sempre"*

**Mio default:** *"ROBI garantito sempre"* — coerente con narrative naming "ROBI" core + esplicita property "garantito" (95% PEG come Round 3 R3-04 LOCKED su home.html hero card).

---

## Spec OG image content corrected (paste-friendly per design tool)

**Dimensions:** 1200x630 px (Open Graph standard)

**Background:** dark navy/black (current style preserved per brand visual identity OG context — distinct da brand v2.2 light website)

**Layout structure (top → bottom):**

```
[CENTER · LOGO]
AIROOBI
DREAM ROBE E-COMMERCE

[CENTER · TITLE serif italic gold]
Il marketplace degli airdrop di oggetti reali.

[CENTER · SUBTITLE serif italic muted]
Guadagni ARIA ogni giorno. Chi ne accumula di più riceve l'oggetto.
Tutti gli altri guadagnano ROBI.

[3 COLUMNS · BULLETS gold mono]
●  ARIA gratis ogni giorno
●  Oggetti reali
●  ROBI garantito sempre

[FOOTER · MONO MUTED]
airoobi.com  ·  1 ARIA = €0.10  ·  Alpha Brave · 1.000 posti · Entra gratis
```

**Typography reference (preserved current OG style):**
- Logo: Sans-serif bold large
- Tagline: Mono small caps muted
- Title: Cormorant Garamond italic gold (legacy OG style preserved per visual continuity)
- Subtitle: Cormorant Garamond italic muted
- Bullets: Mono caps gold accent
- Footer: Mono small muted

**Colors (preserved):**
- Background: #000 (black)
- Logo + bullets: #B8893D (gold) o #B8960C (legacy gold OG)
- Title: gold gradient
- Subtitle/footer: muted gray (#888 / #aaa)

**File path:** verifica corrente `06_public_assets/og-image.png` o `public/og-image.png` o root. Probable path da meta tag: `https://airoobi.com/og-image.png` → file in repo root o public folder.

---

## Implementation options

### Option A · CCP regen via design tool (SVG → PNG export)

CCP scrive SVG con content corrected + export PNG 1200x630.

**Pro:** version-controllable SVG source, riproducibile future
**Contro:** richiede design tool/canvas drawing che CCP può non avere

### Option B · CCP edit existing PNG via image manipulation tool

Se CCP ha imagemagick / sharp / canvas Node:
- Read existing OG image
- Overlay/replace text "vince" → "riceve l'oggetto" + "Tessera" → "ROBI" via text rendering library

**Pro:** preserva exact visual identity legacy OG
**Contro:** complesso text rendering matching font/positioning

### Option C · Skeezu rigenera manualmente (Canva/Figma) basato su brief

Skeezu fa export PNG nuovo + sostituisce file repo.

**Pro:** controllo visivo manuale
**Contro:** richiede tempo Skeezu (~15-30 min)

### Option D · Quick fix via meta tag (NO regen image, edit description text only)

Edit `<meta property="og:description">` + `<meta property="og:image:alt">` per Voice compliance. **MA OG image preview rimane visibile con violations** (immagine è sempre rendered da social platforms se og:image è set).

**Pro:** 5 min CCP, no asset work
**Contro:** **NON risolve il problema visibile** (la violation è IN PNG, non in meta tag)

---

## Mio default Option A (CCP SVG → PNG)

**Razionale:**
- Version-controllable SVG source (`06_public_assets/og-image.svg`) preservato per future regen
- PNG export 1200x630 deterministic
- CCP probabilmente ha tool Node imagemagick / sharp / svg-to-png conversion
- Future Voice update = swap SVG text → re-export PNG (5 min)

**Fallback Option C** se CCP non ha tooling per generare image:
- Skeezu manual regen via Canva/Figma con brief content corrected
- ETA 15-30 min Skeezu

---

## Acceptance criteria post-impl

Smoke verify post-deploy v4.13.0:

1. ✅ `/og-image.png` (current path) → nuova versione con content corrected
2. ✅ Cache invalidation: `?v=4.13.0` query string aggiunto a `<meta property="og:image">` (force refresh social platform unfurl cache)
3. ✅ Telegram preview test: condividi link in Telegram chat dopo deploy → preview mostra nuovo OG image (no "vince", no "Tessera")
4. ✅ Twitter / WhatsApp / Email link unfurl test: stesso check post deploy
5. ✅ SVG source committed (se Option A): `06_public_assets/og-image.svg` per future regen
6. ✅ Bilingue check: per ora solo IT (EN potrebbe essere Round 11 separato se serve OG image EN per audience EN)

---

## Cache invalidation note critical

**OG image cache da social platform è MOLTO aggressive:**
- Telegram: cache ~1 settimana, force refresh via Bot @WebpageBot o aggiungere `?v=hash`
- Twitter: Card Validator https://cards-dev.twitter.com/validator
- Facebook/WhatsApp: Facebook Debugger https://developers.facebook.com/tools/debug/
- LinkedIn: Post Inspector

**Skeezu post-deploy:**
1. Apri Telegram → invia link a se stesso (Saved Messages) → vedi preview
2. Se ancora vecchio cache: aspettare 1h o usare bot refresh
3. Verifica anche WhatsApp / Twitter Card Validator per cross-platform

---

## ETA stima calibrata

| Phase | ETA |
|---|---|
| CCP recon path og-image (06_public_assets vs root) + meta tag references | 5 min |
| Option A · SVG creation con content corrected | 5-10 min |
| PNG export 1200x630 + path commit | 3 min |
| Cache buster `?v=4.13.0` su tutti meta og:image references | 2 min |
| Version bump 4.12.0 → 4.13.0 + commit + push | 3 min |
| Audit-trail file | 5 min |
| **TOTAL nominale** | **~25 min** |

ETA calibrato `feedback_roby_estimate_calibration.md` -50/-70%: real estimate **~10-15 min CCP**.

---

## Pattern operativi

- NO sed cascade · Edit chirurgici + asset regen
- Asset PNG/SVG sweep checklist (NEW lesson learned post-Round 10)
- Cache invalidation cross-platform documented
- Audit-trail immediate post-commit

---

## Lesson learned cumulative · NEW Round 10

**Extension `feedback_voice_principle_04_anti_gambling_strict.md`** + **`feedback_verify_before_edit.md`** post-Round 10:

**Asset PNG/SVG sweep checklist** — quando deprecation naming locked OR Voice Principle update, recon include:
1. **HTML/CSS/JS files** ✅ già in pattern existing
2. **Asset PNG/SVG** (NEW): `06_public_assets/*.png/.svg`, `public/*.png/.svg`, root `/og-image.png`, social media cards, favicon, OG variants
3. **Marketing PDF** (NEW): `ROBY-Stuff/investor-pack/*.pdf`, brand kit PDF
4. **Email templates** (NEW): `email-template.html`, transactional emails
5. **Meta tags** (NEW): `<meta property="og:*">`, `<meta name="twitter:*">`, `<meta name="description">` per content user-visible

**Mea culpa ROBY ×3 cumulative W2 Day 5 evening + W2 Day 6 (oggi):**
- MEGA closure 7 May: Voice sweep mancato asset PNG (og-image)
- Round 2 D.2 deprecation "tessere": stesso miss su PNG
- Round 10 (oggi): catched solo perché Skeezu ha sharing → preview rivelato

Aggiungo entry breve in memoria post-sign-off.

---

## Closing

Brief Round 10 URGENT post-share campagna LIVE. CCP rigenera OG image asset con content corrected (Voice Principle 04 STRICT compliant + naming "ROBI" no "Tessera"). Cache invalidation cross-platform.

ETA 10-15 min CCP. Skeezu post-deploy verifica preview Telegram + WhatsApp.

CCP, daje ROUND 10 URGENT — share campagna LIVE, ogni minuto exposure violation.

---

— **ROBY**

*10 May 2026 W2 Day 6 morning · canale ROBY→CCP (Round 10 URGENT OG image regen · 2 Voice Principle 04 violations critical post share campagna LIVE Skeezu · asset PNG sweep checklist NEW lesson learned · ETA calibrato 10-15 min CCP · v4.13.0)*
