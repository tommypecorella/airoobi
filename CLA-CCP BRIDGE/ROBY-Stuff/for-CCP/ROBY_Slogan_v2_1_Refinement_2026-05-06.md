---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · Pi 5)
cc: Skeezu
subject: Slogan refinement v2.2 — pre-merge harden-w2 → main
date: 2026-05-06
ref: Skeezu visual review preview harden-w2 home.html (6 May)
status: BLOCKING merge harden-w2 → main · sweep slogan + 3 fix visual review da applicare prima
priority: HIGH (deploy gate)
---

# Slogan refinement v2.2 + 3 fix visual review

## 1. Slogan locked v2 → v2.2

**OLD (v2):** *"Il primo marketplace dove pagare e vendere quello che desideri non è uno sconto. È una skill."*

**NEW (v2.2):** *"Il primo marketplace dove vendere e ottenere quello che desideri... è una skill."*

**Razionale:**
- Seller-side first ("vendere e ottenere" invece di "pagare e vendere") — italianate "prima il valore offerto, poi quello acquisito"
- "ottenere" più positivo/aspirazionale di "pagare" (transazionale freddo)
- Ellipsis "..." dà sospensione drammatica
- Eliminata negazione "non è uno sconto" (ridondante — già implicita in "skill")
- Più snello: 2 righe + punch invece di 4 righe + punch

## 2. Sweep replace slogan v2 → v2.2

CCP, applica sed sweep su tutti i file pubblici dove slogan v2 è stato landed (Phase 4 + Phase 7 batch sweep):

### Replacement table (italiano)

| Old | New |
|---|---|
| `Il primo marketplace dove pagare e vendere quello che desideri non è uno sconto. È una skill.` | `Il primo marketplace dove vendere e ottenere quello che desideri... è una skill.` |
| `Il primo marketplace dove pagare e vendere quello che desideri non è uno sconto.` (senza "È una skill" finale) | `Il primo marketplace dove vendere e ottenere quello che desideri...` |
| `pagare e vendere è una skill, non uno sconto` (versione abbreviata in OG/twitter meta) | `vendere e ottenere è una skill` |
| `pagare e vendere è una skill` | `vendere e ottenere è una skill` |
| `Pagare e vendere quello che desideri` | `Vendere e ottenere quello che desideri` |
| `pagare e vendere quello che desideri` | `vendere e ottenere quello che desideri` |
| `non è uno sconto. È una skill` | `... è una skill` (ellipsis prima di "è una skill") |
| `non è uno sconto.` (standalone) | `...` (ellipsis solo, oppure rimuovere riga se isolata) |
| `pay and sell with skill, not discount` (EN abbreviato) | `sell and get with skill` |
| `Pay and sell with skill` | `Sell and get with skill` |
| `Pay and sell what you desire is a skill, not a discount` | `Sell and get what you desire... is a skill` |

### Bash script proposto

```bash
#!/bin/bash
# Slogan refinement v2 → v2.2 sweep
set -e

DIRS=("." "blog")  # adjust to actual repo paths
SKIP_FILES=("dapp.html" "airdrop.html" "abo.html")
SKIP_PATHS=("legacy/")

for dir in "${DIRS[@]}"; do
  for f in "$dir"/*.html; do
    [ -f "$f" ] || continue
    skip=false
    for sf in "${SKIP_FILES[@]}"; do
      [ "$(basename "$f")" = "$sf" ] && skip=true && break
    done
    for sp in "${SKIP_PATHS[@]}"; do
      [[ "$f" == *"$sp"* ]] && skip=true && break
    done
    $skip && continue

    cp "$f" "${f}.pre-slogan-v2-2-bak"

    # Italian — full slogan
    sed -i 's|Il primo marketplace dove pagare e vendere quello che desideri non è uno sconto\. È una skill\.|Il primo marketplace dove vendere e ottenere quello che desideri\.\.\. è una skill\.|g' "$f"
    sed -i 's|Il primo marketplace dove pagare e vendere quello che desideri non è uno sconto\.|Il primo marketplace dove vendere e ottenere quello che desideri\.\.\.|g' "$f"
    
    # Italian — abbreviated forms (OG/twitter meta)
    sed -i 's|pagare e vendere è una skill, non uno sconto|vendere e ottenere è una skill|g' "$f"
    sed -i 's|pagare e vendere è una skill|vendere e ottenere è una skill|g' "$f"
    sed -i 's|Pagare e vendere quello che desideri|Vendere e ottenere quello che desideri|g' "$f"
    sed -i 's|pagare e vendere quello che desideri|vendere e ottenere quello che desideri|g' "$f"

    # Italian — ellipsis + skill construct
    sed -i 's|non è uno sconto\. È una skill|\.\.\. è una skill|g' "$f"
    
    # English (preserve EN content but update equivalent)
    sed -i 's|Pay and sell what you desire is a skill, not a discount|Sell and get what you desire\.\.\. is a skill|g' "$f"
    sed -i 's|pay and sell with skill, not discount|sell and get with skill|g' "$f"
    sed -i 's|Pay and sell with skill|Sell and get with skill|g' "$f"

    # Verify diff
    if ! diff -q "$f" "${f}.pre-slogan-v2-2-bak" > /dev/null; then
      echo "✓ Slogan v2.2 updated: $f"
    fi
  done
done
```

## 3. Fix visual review (da Skeezu screenshot home.html)

Tre regression dal Phase 3 LIGHT batch sweep da applicare PRIMA del merge:

### Fix A — Logo nav top-left non essenziale

**Issue:** dual oO mark (V1 classic) troppo cluttered a 32px nav scale.

**Fix:** sostituire reference SVG con `airoobi-logo-minimal.svg` (V5 minimal) — singolo oO grande + dot gold, pulito a small scale.

**Find/replace:**
```bash
sed -i 's|/public/svg/airoobi-logo-classic\.svg|/public/svg/airoobi-logo-minimal.svg|g' home.html landing.html
```

(Eventualmente solo in nav-logo context, non in body brand mark — verifica con grep -n prima.)

### Fix B — CTA "ENTRA SU AIROOBI.APP" colore blu legacy

**Issue:** background-color `#4A9EFF` (legacy ARIA blue v1, era `--accent` in design system precedente). Phase 3 LIGHT batch sweep ha mancato questo specifico CTA.

**Fix:** cambiare bg a `var(--ink)` (#0F1417) con `color: var(--bg-primary)` (white text).

**Find/replace:**
```bash
# Verifica residui blu legacy
grep -rn "#4A9EFF\|--accent.*4A9EFF" home.html landing.html

# Apply replace (cautious — solo dove background o color, non per saldo ARIA asset-specific)
# Opzione safe: manual review dei find e replace targeted dove serve
```

**Razionale:** è CTA primario neutro "entra in app" → `var(--ink)` è il pattern v2 corretto. Coral #F73659 sarebbe troppo aggressivo (vendor-action only).

### Fix C — Logo footer con BG nero baked-in

**Issue:** PNG con sfondo nero hardcoded (probabilmente `AIROOBI_Logo_White.png` su pagina white BG = quadrato visibile).

**Fix:** sostituire con SVG V1 classic o V2 gold-accent (vector + transparent BG).

**Find/replace:**
```bash
grep -rn "AIROOBI_Logo_White\|AIROOBI_Symbol_White\|logo-white\.png" home.html landing.html

# Apply replace
sed -i 's|/AIROOBI_Logo_White\.png|/public/svg/airoobi-logo-classic.svg|g' home.html landing.html
sed -i 's|/AIROOBI_Symbol_White\.png|/public/svg/airoobi-logo-minimal.svg|g' home.html landing.html
sed -i 's|/logo-white\.png|/public/svg/airoobi-logo-classic.svg|g' home.html landing.html
```

(Adatta path alla struttura reale del repo.)

## 4. Acceptance criteria post-fix

| # | Check | Method |
|---|---|---|
| 1 | Slogan v2.2 visibile su home.html hero | `curl preview-url \| grep "vendere e ottenere"` |
| 2 | Slogan v2.2 visibile su landing.html hero | idem |
| 3 | Slogan v2 obsoleto rimosso | `grep -rn "pagare e vendere\|non è uno sconto" *.html blog/*.html` → 0 risultati (escluso .pre-slogan bak files) |
| 4 | Logo nav top-left = V5 minimal | visual + `grep "airoobi-logo-minimal" home.html landing.html` |
| 5 | CTA "ENTRA SU AIROOBI.APP" non più blu | visual + `grep "#4A9EFF" home.html` → 0 risultati |
| 6 | Logo footer = SVG vector | visual + `grep "AIROOBI_Logo_White\.png\|logo-white\.png" home.html` → 0 risultati |
| 7 | OG meta + twitter:title + twitter:description aggiornati | curl + grep |

## 5. Sequence proposta CCP

1. Apply Fix A + B + C (visual fixes preview): ~10-15 min
2. Apply slogan v2.2 sweep (bash script sopra): ~5-10 min
3. Push harden-w2 + Vercel preview auto-deploy
4. Notify Skeezu + ROBY in chat
5. Skeezu finale visual sign-off su preview aggiornato
6. Merge harden-w2 → main + version bump 4.0.0 + smoke prod 10 acceptance criteria

**ETA totale CCP:** ~25-30 min sweep + fix + push.

## 6. Cleanup post-deploy

Post merge stabilizzato:
- `rm *.pre-slogan-v2-2-bak` su ogni file (cleanup backup files dello sweep)
- Considera rebuild Brand Kit v2.0 PDF + Pitch Deck v1.2 PDF + Technical Companion v1.1 PDF con slogan v2.2 (W3 scope, low priority)

## 7. Closing peer-to-peer

CCP, slogan refinement è blocking pre-merge perché modifica meta/OG (SEO impact) + hero copy (visual). Meglio fare un round unico di fix + slogan sweep + visual sign-off finale invece di 2 round separati.

Brand Kit v2.0 → v2.2 lato mio già aggiornato (5 occorrenze fixed). Memory project_brand_bifurcation aggiornata.

Vai sereno. Quando push completato, Skeezu verifica preview + GO/AGGIUSTAMENTI finale.

---

— **ROBY**

*Versione 1.0 · 6 Mag 2026 W2 Day 2 · canale ROBY→CCP (Slogan v2.2 refinement + 3 fix visual review · pre-merge gate)*
