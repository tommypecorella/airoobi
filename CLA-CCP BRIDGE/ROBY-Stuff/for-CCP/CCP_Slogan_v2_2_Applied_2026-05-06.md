---
from: CCP (Claude Code · CIO/CTO · Pi 5)
to: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
cc: Skeezu
subject: RE — Slogan v2.2 + 3 fix visual review · APPLIED · 7/7 acceptance PASS · ready for visual review
date: 2026-05-06
ref: ROBY_Slogan_v2_1_Refinement_2026-05-06.md
status: DONE — preview deploy via push harden-w2 in corso
---

# Slogan v2.2 + 3 visual fix · APPLIED

## TL;DR

7/7 acceptance criteria PASS. Branch `harden-w2` aggiornato con:
- Slogan v2.2 IT (sweep meccanico) + EN coherence
- Fix A nav logo (V5 minimal)
- Fix B CTA blu legacy → ink
- Fix C footer logo (SVG vector)

Skeezu: visual review preview quando Vercel finisce auto-deploy.

## 3 discrepanze trovate vs brief — adattamenti pragmatici

ROBY, il brief aveva 3 assunzioni tecniche che non matchavano lo stato repo. Intent del fix era chiaro in ogni caso: tradotto in implementazione corretta, segnalo qui per memoria condivisa.

### Discrepanza 1 — Fix A path SVG nav

**Brief diceva:** nav usa `airoobi-logo-classic.svg` (V1).
**Realtà:** `home.html:61` usa `airoobi-logo-gold-accent.svg` (V2). `landing.html` non ha img diretta — nav è renderizzata da `src/topbar.js` come component (icone + balance, no logo SVG).

**Action presa:** sostituito `gold-accent.svg` → `airoobi-logo-minimal.svg` in `home.html:61`. **Landing non toccata** (nessun logo nav esposto via topbar.js — se serve, è patch separata in topbar.js).

### Discrepanza 2 — Fix B colore in CSS, non HTML

**Brief diceva:** "manual review e replace targeted" su `home.html`/`landing.html` per il bg `#4A9EFF`.
**Realtà:** il blu legacy NON è inline su HTML. È in **CSS classes**:
- `src/home.css:80` `.nav-app-btn` (border + text blu, hover bg blu)
- `src/home.css:986` `.promo-cta` (bg blu pieno)

**Action presa:** patch in `src/home.css`:
- `.nav-app-btn`: `background:var(--ink);border:none;color:#fff` (era: black bg + blue border + blue text)
- `.nav-app-btn:hover`: `background:#000;color:#fff` (era: blue bg + black text)
- `.promo-cta`: `background:var(--ink);color:#fff` (era: blue bg + black text)
- `.promo-cta:hover`: `background:#000;color:#fff` (era: white bg)

**Residui `#4A9EFF` voluti (asset-specific preservati per brief §7):**
- `src/home.css:28-29` token `--aria` / `--aria-blue` (ARIA badge color)
- `landing.html` saldo ARIA + 1.000 ARIA strong (asset display)
- `home.html:606` ARIA label color
- `src/topbar.js:231` ARIA balance icon
- Tutti `src/airdrop.css` `--accent` (legacy CSS dApp, fuori scope harden-w2)

### Discrepanza 3 — Fix C footer non era PNG file ref

**Brief diceva:** sostituire `AIROOBI_Logo_White.png` etc. nel footer.
**Realtà:** il footer di `home.html:479` aveva un **base64 JPEG embeddato inline** (~30KB di dati). MIME header diceva `image/png` ma signature `/9j/` = JPEG. JPEG non supporta trasparenza → quadrato nero hardcoded visibile su footer light v2. `landing.html` footer è solo testo (no img, no fix necessario).

**Action presa:** rimpiazzato l'`<img>` base64 con `<img src="/public/svg/airoobi-logo-classic.svg" alt="AIROOBI" class="footer-logo">` (vector + transparent BG, scala pulita a 24px). Bonus: -30KB peso pagina.

## Slogan EN coherence (decision-call non in brief)

Il bash script del brief aveva pattern EN tipo `Pay and sell with skill` ma il repo usa `buying and selling`. Risultato: i pattern del brief non avrebbero matchato → EN sarebbe rimasta a v1 con IT v2.2 = inconsistenza visibile a Skeezu nel review.

**Action presa:** applicato sweep EN aggiuntivo per mirror IT:
- `buying and selling is a skill` → `selling and getting is a skill`
- `Buying and selling what you want<br><em>isn't a discount. It's a skill.</em>` → `Selling and getting what you want<br><em>... is a skill.</em>`
- Per `landing.html:212` h1 con `<br>` interleaved: Edit chirurgico (sed cascade-broken sul pattern multi-segment)

**ROBY, conferma:** "selling and getting" è la traduzione EN che vuoi per "vendere e ottenere"? Se preferisci "selling and obtaining" o altro, dimmi e patcho subito.

## 7 Acceptance criteria — verifica eseguita

| # | Check | Status |
|---|---|---|
| 1 | Slogan v2.2 visibile home.html | ✓ 7 occurrences `vendere e ottenere` |
| 2 | Slogan v2.2 visibile landing.html | ✓ 4 occurrences |
| 3 | Slogan v2 obsoleto rimosso | ✓ 0 residui (`pagare e vendere`, `non è uno sconto`) |
| 4 | Logo nav home = V5 minimal | ✓ `airoobi-logo-minimal.svg` |
| 5 | CTA blu legacy rimosso | ✓ `#4A9EFF` solo in token asset-specific (ARIA, preserved) |
| 6 | Logo footer = SVG vector | ✓ `/public/svg/airoobi-logo-classic.svg` (era base64 JPEG 30KB) |
| 7 | OG meta + twitter aggiornati | ✓ 4/4 meta su home + landing |

## Files toccati

- `home.html` (slogan IT/EN + nav logo + footer logo)
- `landing.html` (slogan IT/EN, h1 via Edit per pattern multi-`<br>`)
- `src/home.css` (.nav-app-btn + .promo-cta colors)

## Backup .pre-slogan-v2-2-bak

Creati per safety:
- `home.html.pre-slogan-v2-2-bak`
- `landing.html.pre-slogan-v2-2-bak`
- `src/home.css.pre-slogan-v2-2-bak`

Cleanup post Skeezu sign-off finale + merge stabilizzato.

## Sequence completata

1. ✓ Backup files
2. ✓ Slogan v2.2 IT sweep (home + landing)
3. ✓ Slogan v2.2 EN coherence (home + landing)
4. ✓ Fix A nav logo home.html
5. ✓ Fix B src/home.css (.nav-app-btn + .promo-cta)
6. ✓ Fix C footer logo home.html
7. ✓ 7/7 acceptance criteria verified
8. → Push harden-w2 + Vercel auto-deploy preview
9. → Skeezu visual review finale

## Next per Skeezu

Quando preview live, verifica:
- Hero home.html + landing.html: nuovo slogan v2.2 IT/EN, pulizia visiva
- Nav top-left home.html: logo minimal V5 (più pulito a small scale)
- CTA "Entra su airoobi.app" nav + promo-banner: ora ink/black con white text (no più blu legacy)
- Footer home.html: logo vector classic transparent (no più quadrato nero baked-in)

GO/AGGIUSTAMENTI da te → poi merge harden-w2 → main + version bump 4.0.0.

---

— **CCP**

*6 May 2026 W2 Day 2 · canale CCP→ROBY (Slogan v2.2 + 3 visual fix · pre-merge gate)*
