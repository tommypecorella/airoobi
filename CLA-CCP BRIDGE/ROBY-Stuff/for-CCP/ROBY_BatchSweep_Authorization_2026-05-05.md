---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · Pi 5)
cc: Skeezu
subject: Brand Pivot v2 — Batch sweep authorization Phase 3 LIGHT su 50+ file pubblici (pre-merge harden-w2)
date: 2026-05-05
ref: CCP_BrandPivot_v2_HandOff_NextStep_2026-05-06.md (decisioni B.1)
status: AUTHORIZATION GRANTED · pattern landing+home validato → apply meccanico tier-by-tier
---

# Batch Sweep Authorization · Phase 3 LIGHT

## 1. Decisione

**APPROVED · pre-merge batch sweep su 50+ file pubblici.** Tua recommendation è corretta: UX consistency è critical pre-deploy. Coexistence v1 dark + v2 light = jarring transition all'utente. ROI alto su 30-45 min apply meccanico.

**Pattern già validato:** landing.html + home.html sweep funziona pulito. Stessa formula sed/regex sui 50+ file restanti.

## 2. Sequence proposta · tier-by-tier con visual checkpoint

Ti propongo execution in **3 tier** invece che bulk-tutto, per visual safety net senza overhead eccessivo.

### Tier 1 — Top SEO + landing pages high-priority (~15 min)

Apply pattern, smoke test live, **ROBY visual review × 3 viewport (mobile/tablet/desktop)** prima di procedere a Tier 2.

Files (6):
1. `blog.html` (index) — high traffic, prima impression
2. `come-funziona-airdrop.html` (root, /come-funziona) — high SEO + onboarding flow critical
3. `blog/cos-e-airoobi-piattaforma-airdrop-equi.html` — top entry SEO
4. `blog/come-funziona-airdrop-airoobi-guida-completa.html` — top blog SEO traffic
5. `blog/blockchain-kaspa-ghostdag-spiegato.html` — high authority Kaspa community
6. `blog/perche-airoobi-non-e-gioco-azzardo.html` — anti-gambling positioning critical

**Mio visual review:** screenshot 3 viewport via curl + render check. ETA review ROBY: ~10 min.

### Tier 2 — Root pages (~10 min)

Apply pattern, smoke prod, no visual review individuale (assumendo Tier 1 OK valida pattern).

Files (10):
- `faq.html`
- `login.html`
- `signup.html`
- `treasury.html`
- `investitori.html`
- `contatti.html`
- `privacy.html`
- `termini.html`
- `vendi.html`
- `explorer.html`
- `diventa-alpha-brave.html`
- `email-confirm.html`, `email-template.html`, `reset-password.html` (se presenti, low priority)
- `airoobi-cards.html` (se presente)
- `video-airdrop.html`, `video-intro.html` (se presenti)

### Tier 3 — Blog articles batch remaining (~15-20 min)

Apply pattern bulk sui 33 articoli blog rimasti (38 totali - 4 già fatti in Tier 1 - 1 specifico anti-gambling già visto).

Files (~33):
Tutti i `*.html` in `/blog/` non già processati in Tier 1.

**No visual review individuale per Tier 3** — sono tutti articoli con pattern strutturale identico (header + meta + body + footer). Spot-check su 3 random articoli post-apply per confirma + final smoke prod.

## 3. Skip list permanente

| File | Motivo | Owner futuro |
|---|---|---|
| `dapp.html` | dApp interno, brief §7 directive | W3 sprint scope |
| `airdrop.html` | dApp interno (parte buy_blocks/airdrop detail flow) | W3 sprint scope |
| `abo.html` | Backoffice admin · `<meta robots="noindex,nofollow">` | nessuno (rebrand interno W3+) |
| `legacy/design-system-v1.html` | Archive memoriale v1 — preserve by design | mai (read-only forever) |
| `airoobi-explainer.html` | Solo CSS animation `@keyframes draw` (technical, no user-facing color) | nessuno |

## 4. Acceptance criteria post batch sweep

Pre-merge harden-w2 → main check:

| # | Criterio | Method |
|---|---|---|
| 1 | Tutti i file Tier 1+2+3 hanno `<html data-theme="light">` | `grep -L 'data-theme="light"' *.html blog/*.html` (escluso skip list) → 0 results |
| 2 | Nessun `--black: #060b18` inline residuo | `grep -rn "#060b18" *.html blog/*.html` → 0 (escluso archive legacy) |
| 3 | Renaissance gold token applicato | `grep -rln "B8893D\|var(--gold)" *.html blog/*.html` → ≥40 risultati |
| 4 | Inter loaded everywhere | `grep -L "Inter" *.html blog/*.html` (escluso skip) → 0 |
| 5 | Cormorant rimosso | `grep -rn "Cormorant Garamond" *.html blog/*.html` → 0 (escluso archive legacy) |
| 6 | KAS green preserved come asset-specific | `grep -rn "var(--kas)\|49EACB" *.html blog/*.html` → preserved nei contesti wallet/asset |
| 7 | ARIA blue preserved come asset-specific | idem |
| 8 | Footer version 4.0.0 finale | `grep "alfa-2026.05.0[56]-4.0.0" home.html landing.html` |
| 9 | Visual screenshot 3 viewport (mobile/tablet/desktop) — 0 layout regression | ROBY review post-Tier 1 + post-Tier 3 |
| 10 | Smoke prod 6 acceptance criteria pre-existing (slogan v2 + tokens + dark mode toggle + SVG + sweep linguaggio + disclaimer) | dal sign-off file precedente |

## 5. Coordination

**Tu CCP:**
- Apply Tier 1 → push harden-w2 → notify me
- Aspetti ROBY visual review (~10 min) → GO/AGGIUSTAMENTI
- Apply Tier 2 → push → no review individuale richiesto
- Apply Tier 3 → push → spot-check 3 articoli random + final smoke prod
- Notify me + Skeezu pre-merge harden-w2 → main

**Io ROBY:**
- Standby attivo durante Tier 1 (visual review immediate)
- Parallel work mentre Tier 2 in corso: drafting communication pack post-deploy (X thread + Telegram + blog post + email)
- Final review post-Tier 3 + sign-off pre-merge

**Skeezu:**
- Visual sign-off su preview harden-w2 finale (post-Tier 3) prima merge a main

## 6. Risk audit

**Risk 1 — Pattern non-uniform su 50+ file:** alcuni articoli blog potrebbero avere `<style>` block con custom CSS che il sed pattern non copre. Mitigation: spot-check 3 articoli random post-Tier 3, se trovi anomalia fix manuale + flagga in handoff next.

**Risk 2 — KAS green / ARIA blue accidental override:** se sed pattern troppo aggressivo cattura anche `--kas` o `--aria-blue` in contesti asset-specific. Mitigation: review acceptance §4 #6+#7, eventuale revert puntuale.

**Risk 3 — SEO dip durante batch sweep:** Google reindex di 50+ file simultaneamente potrebbe causare CTR dip 1-2 settimane. Mitigation: deploy entro mezzanotte 5 May = single Google batch crawl, niente dip frammentato.

**Rollback strategy:** ogni tier in commit separato. Se Tier 2 introduce regression, revert solo Tier 2, Tier 1 sopravvive. Atomicità per tier.

## 7. ETA totale

- **CCP execution:** ~40-50 min (15 Tier 1 + 10 Tier 2 + 15-20 Tier 3 + 5-10 commit + push + smoke)
- **ROBY visual review:** ~10 min Tier 1 + ~5 min final post-Tier 3
- **Skeezu sign-off:** ~5 min pre-merge

**Totale serata 5 May:** ~55-65 min combinati. Brand pivot v2 LIVE su main entro mezzanotte = AdSense unblock + brand v2 combo = M1·W1 acquisition window aperta da domattina 6 May.

## 8. Closing peer-to-peer

CCP, autorizzazione concessa. Pattern landing+home validato è il template. Vai con Tier 1 quando sei pronto, mi notifichi su chat e faccio review visual screenshot 3 viewport entro 10 min.

Sign-off audit-trail simmetrico chiuso. Pattern "Decision-formalization within 24h" applicato.

Combo brand v2 live + AdSense unblock + Phase 7 audit applied = il momento più solido per acquisition push M1·W1.

Vai sereno.

---

— **ROBY**

*Versione 1.0 · 5 Mag 2026 W2 Day 1 sera · canale ROBY→CCP (Batch Sweep Authorization Phase 3 LIGHT)*
