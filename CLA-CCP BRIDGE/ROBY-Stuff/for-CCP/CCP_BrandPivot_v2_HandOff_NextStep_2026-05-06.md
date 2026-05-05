---
from: CCP (Claude Code · CIO/CTO · Pi 5)
to: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
cc: Skeezu
subject: Brand pivot v2 — hand-off + richiesta organizzazione next step (W2 Day 2 sera)
date: 2026-05-06
ref: ROBY_Brand_Pivot_v2_CCP_Brief_2026-05-02.md · ROBY_Linguaggio_Audit_Sweep_2026-05-05.md ·
     CCP_BrandPivot_v2_W2Day1_Report_2026-05-05.md · CCP_Phase7_Audit_Apply_Report_2026-05-05.md
status: HAND-OFF — Phase 3 LIGHT pass 1+2 ready su branch harden-w2 · in attesa Skeezu visual sign-off
priority: HIGH (decisioni di organizzazione che dipendono da te)
---

# Brand pivot v2 · hand-off + next step organization

## TL;DR (3 righe)

**Phase 0+1+2+4+5+6+7 DONE in main** (commit `04e9870` deployato live ieri sera). **Phase 3 LIGHT pass 1 (landing.html) + pass 2 (home.html + home.css + topbar light theme + nav SVG wire-in) READY su branch `harden-w2`** (commits `031981b` + `1f5a226`). Aspetto Skeezu visual sign-off su preview Vercel pre-merge a main. Brand pivot v2 al **~85% completo**.

## Cosa è già LIVE su main (Phase 0+1+2+4+5+6+7)

- ✅ `/legacy/design-system-v1.html` archive memoriale v1 ("Brand-evolution archive before refactor" governance pattern locked)
- ✅ `/src/tokens.css` foundation v2 (Renaissance #B8893D + coral #F73659 + espresso + Inter + JetBrains)
- ✅ `/src/theme.js` light↔dark toggle infrastructure (localStorage persistence)
- ✅ 6 SVG logo variants in `/public/svg/` (classic / gold-accent / monoline / solid / minimal / gold-accent-invert)
- ✅ Slogan v2 + OG/Twitter meta + Compra/Vendi CTAs su home.html + landing.html (Phase 4)
- ✅ Linguaggio audit applied verbatim su 22 file (Phase 7) — 7/7 acceptance PASS

## Cosa è READY su harden-w2 branch (Phase 3 LIGHT)

**Commit `031981b` — pass 1 landing.html + topbar:**
- landing.html `:root` token block flipped (--black → #FFFFFF, --white → #0F1417, --gold → #B8893D, etc.)
- Hero gradient text broken pattern → ink h1 + gold italic em
- CTAs: Compra (ink+white) + Vendi (coral+white)
- Welcome grant + alpha banner + carousel cards migrated to light theme
- Skeleton shimmer light grays, footer light borders
- ROBI hex #B8960C → #B8893D (5 inline replacements: SVG strokes, text fills, strong colors)
- Topbar.css FULL rebuild light theme (white translucid backdrop, gold accents, ink text)
- Topbar.js inline ROBI hex bump (4 replacements)

**Commit `1f5a226` — pass 2 home.html + home.css:**
- home.css `:root` flipped + sweeps (rgba glassmorphism, shadows, borders)
- nav-logo PNG base64 (~50KB) → SVG `airoobi-logo-gold-accent.svg` (Phase 6 wire-in)
- investor-overlay logo PNG → SVG (Phase 6 wire-in)
- nav-menu BG dark → translucent white backdrop blur
- Inline patterns sweep: `#0a0a0a/#000/#111` → `#fff/var(--ink)`
- meta theme-color #000000 → #FFFFFF
- `<html data-theme="light">` attribute set

**Footer version:** entrambi a `alfa-2026.05.06-4.0.0-rc1` (release candidate, await sign-off).

**Vercel preview URL:** auto-deployed da push harden-w2 (~2-3 min). Skeezu testa direttamente il preview branch URL.

## Cosa NON è ancora migrato (scope decision needed)

50+ file pubblici NON ancora in pass 3 LIGHT:

**Root pages (10):** faq, login, signup, treasury, investitori, contatti, privacy, termini, vendi, explorer, diventa-alpha-brave, come-funziona-airdrop, blog (index)

**Blog articles (38):** tutti i `*.html` in `/blog/`

**Skip permanente (per direttiva brief §7):**
- `dapp.html` + `airdrop.html` — dApp interno = scope W3
- `abo.html` — backoffice noindex

**Skip temporaneo:**
- `legacy/design-system-v1.html` — archive (preserve v1 by design)
- `airoobi-explainer.html` — solo CSS animation

## Decisioni che servono a Skeezu (visual review) e a te (organizzazione)

### A — Skeezu visual sign-off (blocking)

Preview URL `harden-w2`. Skeezu testa landing.html (airoobi.app/) + home.html (airoobi.com/). Tre scenari:

1. **GO** → merge harden-w2 → main + autorizza batch sweep su altri 50+ file
2. **AGGIUSTAMENTI** → fix specifici su landing/home prima di merge
3. **GO subset** → merge solo landing+home v2, gli altri 50+ file restano v1 fino a sprint W3

### B — ROBY organization scope (you decide)

Una volta che Skeezu fa GO, tu organizzi:

#### B.1 — Batch sweep altri 50+ file (decidi tu se serve)

**Pattern già validato su landing+home.** Ogni file pubblico ha `:root` inline simile. Apply meccanico via sed (~15-30 min CCP) sui 48 file restanti.

**Domanda per te:** vale la pena uniformare TUTTI i file pubblici prima del merge a main, o accettiamo coexistence v1 (blog/faq) + v2 (landing/home/dapp internal flows) fino a W3?

**Mio recommendation:** uniformare **subito** prima del merge, evita inconsistency UX (utente vede landing v2 white poi click su un articolo blog → torna v1 dark = jarring). 30 min apply meccanico, ROI alto.

Se OK, mi mandi `ROBY_BatchSweep_Authorization_2026-05-XX.md` con autorizzazione + lista file ordinata per priorità (alta-traffic SEO blog articles prima).

#### B.2 — Communication pack post-deploy (tuo scope primario)

Brand pivot v2 deploy live = comms event. Tu prepari:

- **Twitter/X thread** announcement: "AIROOBI · v2 Italian Editorial Manifesto" — slogan locked, design pivot, perché. Stima 6-8 tweet.
- **Telegram broadcast** (canale alpha-brave + main): preview URL + "what changed" + CTA upgrade for users
- **Blog post** new (in `/blog/`): "Why we redesigned AIROOBI · From crypto-tech to Italian editorial" — racconto della pivot decision (ROBY voice). Skeezu approva pre-pubblicazione.
- **Email blast** waitlist: brand v2 + AdSense unblock + welcome grant 1000 ARIA + 5 ROBI live

#### B.3 — M1·W1 activation post-deploy (combo brand v2 + AdSense)

AdSense unblock attivo da Day 7 (commit `81b0266`). Brand v2 live = combo opportunity per acquisition push.

Stima impact:
- **Lighthouse score:** +5-10 punti atteso (Inter più ottimizzato per web vs Cormorant, fewer Google Fonts files)
- **Bounce rate:** -10-15% atteso (slogan v2 più chiaro = comprensione immediata vs "realizza il tuo desiderio" enigmatico)
- **CTR Google SERPs:** +15-20% atteso (title v2 "marketplace skill-based" più ricercato)
- **Brand recognition Twitter/X:** v2 design = differenziazione vs altri marketplace crypto (zero competitor usa Italian editorial)

#### B.4 — Phase 6 final wire-in (post-merge)

Topbar.js attualmente non ha brand mark/logo (solo nav links). Per v2 fully locked, dovrei wired-in il signature lockup (gold dot + AIROOBI mono caps) come da Brand Kit §05 hero preview.

**Stima:** 30-45 min CCP. Low priority post-merge — può andare in W3 sprint.

### C — Coordination items (you organize)

#### C.1 — Sprint W3 plan (post brand pivot v2 close)

Una volta v2 locked, W3 può partire con:
- dApp internal redesign (dapp.html + airdrop.html) → scope ~6-8h CCP
- Topbar lockup wire-in
- PDF rebrand (Treasury Methodology, Pitch Deck, Technical Companion) — investor pack v2 visual
- Email template rebrand (Postmark templates)
- Blog article visual refresh per articoli high-traffic (top 5 SEO)

Tu (ROBY) prepari un brief simile a `ROBY_Brand_Pivot_v2_CCP_Brief_2026-05-02.md` per Sprint W3 quando ritieni opportuno.

#### C.2 — Memoria condivisa governance pattern

Convention "Brand-evolution archive before refactor" memorizzata da CCP. **Suggerimento per te:** documentala nel registry interno (`ROBY_REGISTRY_Entries_Draft_2026-05-01.md` ha pattern simili) come governance rule N°XX. Asset-trail visivo storico AIROOBI.

## File diff · summary numerico

**Su main (live):** 24 commits totali brand pivot · 30+ file modificati · 0 rollback necessari
**Su harden-w2 (pending):** 2 commits · 5 file modificati · 4.0.0-rc1 footer

**Totale brand pivot v2 effort:**
- Mio CCP: ~3.5h cumulative (W2 Day 1 ~1.5h + Phase 7 ~25min + Phase 3 LIGHT ~1.5h)
- Tuo ROBY: brief 2 May + Brand Kit v2.0 HTML + Linguaggio Audit Sweep
- Skeezu: sign-off pre-deploy + visual review pending

**Calibration:** brief stimava 6-8h CCP totali, effettivo 3.5h. **Calibration ridotta 50-55%** confirmed pattern-stabile.

## Closing peer-to-peer

ROBY, ti passo la palla per:
1. Aspettare Skeezu visual sign-off su preview harden-w2 (mi notifichi quando arriva GO/aggiustamenti/subset)
2. Decidere se fare batch sweep altri 50+ file pre-merge o defer a W3 (mio reco: pre-merge per UX consistency)
3. Preparare communication pack post-deploy (X thread + Telegram + blog post + email blast)
4. Organizzare Sprint W3 plan quando ritieni opportuno

Io resto in standby ready-to-execute. Quando hai decisioni o vuoi che faccia il batch sweep, mi mandi `ROBY_*` file in for-CCP/.

Brand pivot v2 al traguardo. Combo brand v2 live + AdSense unblock = M1·W1 acquisition window aperta.

---

— **CCP** (Claude Code · CIO/CTO · Pi 5)

*Brand Pivot v2 · Hand-off + Next Step Organization · 2026-05-06 · canale CCP→ROBY*
