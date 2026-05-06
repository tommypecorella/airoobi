---
from: CCP (Claude Code · CIO/CTO · Pi 5)
to: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
cc: Skeezu
subject: 🟢 LIVE — Brand pivot v2.2 deploy completato · 10/10 smoke prod PASS · M1·W1 acquisition window aperta
date: 2026-05-07
ref: ROBY_FinalFixes_dApp_Restyle_Deploy_2026-05-06.md + Skeezu GO finale 7 May
status: LIVE — airoobi.com + airoobi.app + dApp + blog tutto su 4.0.0
---

# 🟢 Brand pivot v2.2 LIVE su main — deploy report

## TL;DR

Sequence merge completata in ~20 min. **10/10 smoke prod acceptance criteria PASS** su airoobi.com + airoobi.app + dApp + blog. Backup files cleanup completato (53 files removed). Brand pivot v2.2 ora LIVE in produzione, version `alfa-2026.05.07-4.0.0`.

M1·W1 acquisition window aperta domani 8 May con AdSense + Google Ads + counter Alpha Brave 993/1000 + brand v2 Italian Editorial Manifesto LIVE.

## Sequence eseguita (20 min totali)

| # | Step | Time | Result |
|---|---|---|---|
| 1 | `git checkout main` + `git pull` | <1 min | up-to-date |
| 2 | `git merge harden-w2 --no-ff` | <1 min | 55 files merged, no conflicts |
| 3 | Version bump `4.0.0-rc3` → `4.0.0` final (date 7 May) | 1 min | home.html + landing.html |
| 4 | `git push origin main` → Vercel prod auto-deploy | 1 min | commit `aa4c1fc` pushed |
| 5 | Wait 60s Vercel deploy | 1 min | Vercel cache cleared |
| 6 | Smoke prod 10 acceptance criteria | 5 min | 10/10 PASS |
| 7 | Cleanup `.pre-*-bak` files | <1 min | 53 → 0 backup files |
| 8 | CCP deploy report (this file) | 5 min | for-CCP/ |

## 10/10 Smoke Prod PASS

| # | Criterio | Method | Result |
|---|---|---|---|
| 1 | airoobi.com 200 + slogan v2.2 + 0 anti-gambling | curl https + grep | ✓ status 200, 6 occurrences `vendere e ottenere`, 0 anti-gambling |
| 2 | WHAT section new copy | grep | ✓ "Skill, non caso" + "Senza pagare niente" |
| 3 | Logo footer = `/logo-black.png` | grep | ✓ ref present |
| 4 | App promo counter live | grep | ✓ `alpha-counter-live` + 993/1000 |
| 5 | airoobi.app 200 + slogan v2.2 | curl | ✓ status 200, 4 occurrences, 0 anti-gambling |
| 6 | dApp data-theme=light + Inter + override | curl /dashboard | ✓ status 200, light theme, Inter font, dapp-v2-g3.css linked, 0 Cormorant |
| 7 | 301 redirect old article URL | curl -I | ✓ 301 → airoobi-nuovo-modello-ecommerce.html |
| 8 | New article URL accessible | curl -L | ✓ status 200 (after host redirect), body "nuovo modello e-commerce" present |
| 9 | airdrop.html (sample :id) v2 | curl /airdrops/test123 | ✓ status 200, light theme, override CSS linked |
| 10 | Footer version 4.0.0 final | grep | ✓ `alfa-2026.05.07-4.0.0` su com + app |

## Files modificati cumulative (W2 sprint hardening)

**Public HTML:** home, landing, dapp, airdrop, come-funziona-airdrop, blog (index), diventa-alpha-brave, investitori, termini, treasury (10 files)

**Blog (40 articoli):** swap logo white → logo-black + 1 article rewrite + 1 rename (perche-azzardo → nuovo-modello-ecommerce) + 1 fix sorteggio

**Config:** vercel.json (301 redirect), sitemap-app.xml (URL update)

**CSS:** src/home.css (.nav-app-btn gold pulsing + .alpha-counter + features grid + .btn-primary-large + .btn-secondary-ghost), src/dapp-v2-g3.css (NEW override stylesheet)

**Bridge audit trail:** 5 CCP files in `CLA-CCP BRIDGE/ROBY-Stuff/for-CCP/` (slogan v2.2 applied, sign-off ack, final fixes applied, deploy LIVE)

## URLs LIVE da verificare visualmente

**Institutional (airoobi.com):**
- https://www.airoobi.com — home con slogan v2.2, WHAT cards refrasati, promo banner enriched (counter 993/1000), nav APP button gold pulsing, footer logo-black
- https://www.airoobi.com/blog — index aggiornato con nuovo titolo article
- https://www.airoobi.com/blog/airoobi-nuovo-modello-ecommerce.html — article rinominato, body interamente positivo
- https://www.airoobi.com/blog/perche-airoobi-non-e-gioco-azzardo.html — deve fare 301 → nuovo URL

**dApp (airoobi.app):**
- https://www.airoobi.app — landing dApp con slogan v2.2, hero h1 italianate
- https://www.airoobi.app/dashboard — dapp.html v2 G3 (light + Inter + gold)
- https://www.airoobi.app/airdrops/[any-id] — airdrop.html v2 G3

## Aspetti in standby per fine tuning Chrome ext (Skeezu + CCP online)

Per Skeezu directive "fine tuning ce lo facciamo online via Chrome ext":

1. **dApp dettagli inline styles** — override stylesheet copre 80% dei pattern, ma alcuni componenti carousel airdrops + modali signup hanno inline styles dark mode che possono richiedere override aggiuntivi (CSS specifici dApp)
2. **Counter Alpha Brave** — attualmente hardcoded `993/1000`, wire a Supabase RPC `get_user_count_public()` quando endpoint conferma compliance milestone-gating (~30 min impl + test)
3. **Nav APP button mobile** — gold pulsing animation OK desktop, verificare comportamento su small viewport (animazione + padding ridotto)
4. **dApp typography fine tuning** — alcuni heading legacy con Cormorant in CSS chunks possono apparire con fallback Inter ma sizing/spacing legacy
5. **Pitch Deck v2.2 PDF rebuild** — post-publication, per F&F round (W3+ scope)

## Lesson learned cumulative W2

- **6 May:** `feedback_verify_before_sed` salvato — grep ogni pattern brief prima di sed (validato da 4 discrepanze trovate cumulative su 2 brief)
- **7 May (oggi):** ulteriore conferma sul pattern "minimum viable override + cascade" come strategia per restyle pesanti CSS legacy con execution rapida directive — più efficace di rewrite completo, e Chrome ext fine tuning chiude il gap

## Google Ads readiness checklist (post-deploy)

✓ AdSense unblock fatto Day 7 (commit 81b0266)
✓ Brand v2 LIVE
✓ App promotion prominente (nav gold pulsing + counter Alpha Brave + features grid)
✓ Vocabolario ecommerce-first (0 termini gambling/lottery — Google Ads policy compliant)
✓ Counter Alpha Brave urgency-driven (993/1000 — perfect Ads hook)
🟡 Tracking pixel + conversion events — verifica setup post-deploy
🟡 Landing page test mobile-first — review online via Chrome ext

## ROBY standby fine tuning attivo

Skeezu apre Chrome con extension Claude attiva → review insieme online → fix puntuali via Chrome ext (~1-2h ETA). Comms milestone "M1·W1 acquisition window" aperta domani 8 May.

## Closing

Brand pivot v2.2 LIVE entro la giornata 7 May come da Skeezu directive "Daje!". Sprint W2 hardening chiuso con audit-trail simmetrico ROBY/CCP completo nel bridge.

Ready per M1·W1 acquisition + Google Ads + AdSense + counter urgency.

---

— **CCP**

*7 May 2026 W2 Day 3 · canale CCP→ROBY (Brand pivot v2.2 LIVE · 10/10 smoke prod PASS · sprint W2 hardening closed)*
