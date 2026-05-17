---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · Pi 5)
cc: Skeezu
subject: Round 4 Fix Lampo · 3 issue chirurgici loggato post visual review unica · subito · NON blocker AdSense (parallel a re-submission Skeezu)
date: 2026-05-09
ref: visual review Skeezu unique post Round 3 (5 issue totali, 3 chirurgici qui + 2 brief separati Issue 2 UX + Issue 4 Feature)
status: BRIEF READY · CCP fix lampo round atteso · ETA stima calibrata 30-45 min · parallel a Skeezu re-submission AdSense (Path A approvato)
---

# Round 4 Fix Lampo · 3 issue chirurgici loggato

## TL;DR

Skeezu visual review unica post Round 3 ha trovato 5 issue tutte sulle routes LOGGATE dApp. **NESSUNA blocker AdSense** (Googlebot non vede loggato). Skeezu ha approvato Path A+B+C parallel:
- **Path A:** click "Richiedi revisione" AdSense subito (task Skeezu, in corso)
- **Path B:** Round 4 fix lampo per 3 issue chirurgici (questo brief)
- **Path C:** brief separati Issue 2 (UX scoring panel redesign) + Issue 4 (Username feature) — post AdSense scope

**3 issue Round 4 (CCP scope, ~30-45 min ETA calibrato):**
- R4-01: `/airdrops` search bar bg blu legacy residue (missed corner Round 2 A.8)
- R4-02: `/airdrops` foto controls bg scuro togliere
- R4-03: `/airdrops/:id` icona SHARE non visibile (recon CCP necessario)

Sequenziale post Round 3, NO race condition con AdSense submission Skeezu.

---

## R4-01 · 🟡 LOW · /airdrops search bar bg blu legacy

**Symptom (visual review Skeezu screenshot):** sull'`/airdrops` loggato, l'input "Cerca airdrop..." nel header marketplace ha ancora bg blu legacy invece di v2.2 light.

**Root cause:** Round 2 A.8 sweep coverava `.cat-filter/.cat-nav-btn/.cat-fade` + (via ISSUE-06 MEGA closure) `.airdrop-card/.cat-pill/.search-bar/.filter-pill`. Search input bg specifico è missed corner — probabile classe diversa (es. `.search-input`, `.marketplace-search-input`, o pseudo-element del wrapper).

**Recon CCP necessario:**
- Inspecta `airoobi.app/airdrops` loggato in DevTools: identify exact classe input search
- Grep classe trovata in `dapp.css`/`dapp-v2-g3.css` per current bg color
- Override in `dapp-v2-g3.css` con BG light + ink + border subtle (pattern coerente Round 2 sweep)

**Fix pattern:**
```css
.search-input,  /* o classe vera identificata */
.marketplace-search input[type="text"],
input[type="search"] {
  background: var(--airoobi-bg, #FFF) !important;
  color: var(--airoobi-ink, #1B1814) !important;
  border: 1px solid var(--airoobi-border, rgba(27,24,20,0.08)) !important;
}
.search-input::placeholder {
  color: var(--airoobi-ink-muted, #6B6B6B) !important;
}
```

**ETA stima:** 5-10 min (recon + override singolo).

---

## R4-02 · 🟡 LOW · /airdrops foto controls bg scuro

**Symptom (visual review Skeezu):** sull'`/airdrops` loggato, i controlli delle foto (presumibilmente carousel pagination dots, prev/next arrows, o lightbox controls) hanno bg scuro invece di trasparent/light. "Togliere" il bg.

**Recon CCP necessario:**
- Identificare component foto controls: probabili candidati `.photo-controls`, `.carousel-controls`, `.gallery-pagination`, `.swiper-pagination`, `.product-image-controls`
- Verificare se bg scuro è da legacy CSS legacy (`background: rgba(0,0,0,0.7)` o variant) o da iframe embed
- Override CSS per remove bg + apply gold accent per visibility on light bg

**Fix pattern:**
```css
.photo-controls,
.carousel-controls,
.gallery-pagination,
.swiper-pagination-bullet {
  background: transparent !important;
}
.photo-controls > *,
.carousel-controls > * {
  background: rgba(255,255,255,0.85) !important;  /* semi-trasparente light per visibility on photo */
  color: var(--airoobi-ink) !important;
}
```

**Note:** se controls sono SU foto (overlay), trasparente puro può perdere visibility. Suggerito semi-trasparente light (rgba 0.85) per coerenza brand v2.2 + leggibilità.

**ETA stima:** 5-10 min (recon + override).

---

## R4-03 · 🟡 MEDIUM · /airdrops/:id icona SHARE non visibile

**Symptom (visual review Skeezu):** sul singolo airdrop detail page, l'icona SHARE non si vede.

**Recon CCP necessario (3 candidati cause):**
1. **Component missing del tutto** — verifica se `.share-button` / `.share-icon` esiste in HTML render
2. **Display none o opacity 0** — verifica se CSS legacy lo nasconde (potrebbe essere stato hidden durante MEGA closure dApp restyle)
3. **Color stesso BG = invisibile** — icona presente ma colore (es. white/#FFF) su BG light v2.2 → contrast fail

**Fix in base a cause:**
1. Se missing: aggiungere `<button class="share-button">` (icona share standard, integrazione Web Share API o copy URL fallback)
2. Se display none: CSS override `display: inline-flex !important;` + verifica `aria-hidden` semantic
3. Se color contrast: override `color: var(--airoobi-ink)` o `var(--airoobi-gold)` per visibility on light bg

**Note Skeezu directive (Round 2 A.9 era /airdrops/:id detail + Oo simbolo restored):** simbolo Oo è stato restored, share icon era out of scope esplicito. Round 4 lo aggiunge.

**ETA stima:** 10-20 min (recon + impl in base a cause + verifica funzionalità share).

---

## Acceptance criteria

Smoke verify post-fix v4.6.0:

1. ✅ `/airdrops` loggato search input bg light + ink visible + placeholder ink-muted
2. ✅ `/airdrops` loggato foto controls bg trasparente o light (no scuro)
3. ✅ `/airdrops/:id` loggato icona SHARE visibile + clickable + funzionalità share OK (Web Share API o copy URL)
4. ✅ Smoke verify: spot check 3 viewport (desktop 1440 / tablet 768 / mobile 375)

---

## Pattern operativi (recap)

- **NO sed cascade** — Edit chirurgici + grep verify pre-patch
- **Pattern verify_before_edit** ovunque (recon classi pre-edit, candidate hypothesis 3 cause per R4-03)
- **Pattern token cascade fix** se applicable (es. se share icon color è var-driven token, override token base)
- **Audit-trail immediate post-commit** — file `CCP_FixLampo_Round4_*.md` generato CONTESTUALMENTE
- **§A Discoveries** se 3+ stale findings durante execution

---

## Trigger sequenza

1. Skeezu lancia RS prompt CCP Round 4 (preparato sotto, immediate)
2. CCP recon T26-T28 parallel + execution chirurgica
3. CCP shippa Round 4 + audit-trail file `CCP_FixLampo_Round4_*.md`
4. ROBY firma sign-off ack Round 4
5. Skeezu visual review v4.6.0 spot check 3 issue (~5-10 min)
6. Decision Round 5 lampo se issue residue, oppure done

**Parallel a:** Skeezu click "Richiedi revisione" AdSense (Path A) — non blocca, AdSense reviewer non vede loggato.

---

## Brief separati Issue 2 + Issue 4 (post-AdSense scope)

ROBY scrive parallel a Round 4:
- `ROBY_PostAdSense_ScoringPanel_UX_Redesign_Brief_2026-05-09.md` (Issue 2 — UX scoring panel rifare comprensibile, ~2-3h ROBY content + 2-4h CCP impl)
- `ROBY_PostAdSense_Profilo_Username_Feature_Brief_2026-05-09.md` (Issue 4 — DB migration username UNIQUE + form edit + API + UX, ~1-2h ROBY brief + 4-6h CCP impl)

Brief separati pronti per W3+ scope post-AdSense approval (no urgency, no blocker).

---

## Closing

Round 4 piccolo + chirurgico, scope ristretto a 3 issue residue post visual review unica. Pre-AdSense readiness 9/9 raggiunta in Round 3, parallel work qui = finalizzare UX dApp loggato per Alpha Brave acquisition retention.

CCP, daje, dopo Round 4 il sprint AdSense unblock W2 Day 5 evening è effettivamente chiuso end-to-end (Round 1+2+3+4 = 4 commits CCP + audit-trail simmetrico tutti SEALED).

---

— **ROBY**

*9 May 2026 W2 Day 5 evening · canale ROBY→CCP (Round 4 fix lampo brief · 3 issue chirurgici loggato · parallel a Skeezu re-submission AdSense Path A · ETA 30-45 min calibrato · brief separati Issue 2+4 in queue post-AdSense)*
