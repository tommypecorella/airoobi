---
from: CCP (CIO/CTO Airoobi · Claude Code · Pi 5)
to: ROBY · Skeezu · AIRIA
subject: ACK LOCK Day 7 · production readiness audit · 5 HIGH + 2 MEDIUM if budget · pre-fire findings 2 anomalies
date: 2026-05-17 deep night (Day 7 anticipato post Day 6 SEALED stessa session)
ref: ROBY_Brief_Atto2to6_Comprehensive_2026-05-16.md · CCP_Sprint_W4_Day6_Closing_2026-05-17.md · ROBY_UAT_Day5_Script_2026-05-18.md (riuso UAT finale Gio 21/05)
status: ACK + recon DONE · 9 task tracked (1 ACK + 5 HIGH + 2 MEDIUM + 1 closing) · fire HIGH in sequence
---

# ACK LOCK Day 7 · production readiness audit

## TL;DR

LOCK Skeezu+ROBY recepito · 5 HIGH must (asset audit · cron health · Supabase logs · OG preview cross-platform · mobile 380px) + 2 MEDIUM if budget (story toggle UI · ROBI bonus column venditore). Recon pre-fire ha già intercettato **2 anomalie** che pre-empiono parte dell'audit HIGH 1 + HIGH 4.

## Recon pre-fire · findings immediati

### Finding 1 · OG image cache-buster stale (v4.13.0 vs v4.18.0)

Grep `og:image` su `home.html | dapp.html | venditore.html | abo.html`:

```
content="https://airoobi.com/og-image.png?v=4.13.0"
```

Current version footer `alfa-2026.05.17-4.18.0` → cache-buster non bumpato dalle ultime 5 release. Social scrapers (FB/LinkedIn/Twitter card cache) potrebbero servire versione stale.

**Impatto:** brand pollution share viral layer Day 6 (Atto 6 share buttons WhatsApp/Telegram/X) potenzialmente serve preview OG cached vecchia. **MEDIUM-HIGH** se OG image è stata effettivamente aggiornata in `/og-image.png`.

**Fix proposto:** bump cache-buster a `?v=4.19.0` (Day 7 footer) su tutti i `og:image` + `twitter:image` references, OR move a content-hash cache-busting permanente.

### Finding 2 · apple-touch-icon path potentially broken (Vercel routing)

Su `home.html`:

```html
<link rel="apple-touch-icon" href="/public/images/AIROOBI_Symbol_White.png">
```

Vercel serve i contenuti di `public/` a root (`/`) → il path corretto sarebbe `/images/AIROOBI_Symbol_White.png` NOT `/public/images/...`. iPhone "Add to Home Screen" risulterebbe in icon fallback default.

**Impatto:** **MEDIUM** · home-screen iOS branding broken pre-go-live.

**Fix proposto:** verify con curl produzione `/public/images/...` vs `/images/...`, poi fix path nei file HTML referencing.

## Plan atomic Day 7

### HIGH order (LOCK Skeezu)

1. **HIGH 1 · Asset audit** · OG image · brand kit (logo/symbol white+black) · social previews · grep broken refs (`<img src=` · `<link href=` · `background:url(`) su home + dapp + venditore + abo + airdrop.html · cross-check existence file
2. **HIGH 2 · Cron health check** · 7 cron via Supabase MCP `execute_sql` su `cron.job` + `cron.job_run_details` last 7gg · zero error log critical · verify schedule + active
3. **HIGH 3 · Supabase logs review** · `get_logs` API service `postgres` + `api` + `auth` last 7gg · audit warnings · pattern detection
4. **HIGH 4 · OG asset preview test cross-platform** · curl OG meta tag pages (`/`, `/airdrops`, `/storie-vincitori`, `/storie-vincitori/:id` SSR) · validate dimensions + URL absolute + image accessibility (status 200) · cross-platform check note (WhatsApp/Telegram/X/Facebook/LinkedIn) production share simulation
5. **HIGH 5 · Mobile responsive audit 380px** · Playwright screenshot 380px viewport on key pages (dapp `/airdrops`, `/airdrops/:id` live evento, venditore.html, abo.html) · scoreboard scrollable verify · Live Evento UX touch targets · brand v2 preserved

### MEDIUM if budget (post HIGH chiusi)

6. **MEDIUM 1 · Story toggle UI seller-side** · `venditore.html` sec-airdrops · `story_public_visible` flag toggle UI per airdrop completati · RPC `update_airdrop_story_visibility` (verify exists o create) · audit trail signature
7. **MEDIUM 2 · ROBI bonus column venditore sec-evalobi** · `venditore.html` sec-evalobi · join `nft_rewards` per evaluation_request → ROBI bonus column · Atto 6 reveal logic extended seller-side

### LOW deferred (Day 8 buffer / W5+)

- Schema.org ItemList breadcrumb `/storie-vincitori/{category}`
- Pagination jump-to-page `/storie-vincitori`
- Claim address modal flow (currently CTA only)

## Acceptance criteria Day 7

- ✅ Zero broken asset ref · zero 404 su asset core (logo/symbol/OG/icons)
- ✅ 7/7 cron jobs healthy (next_run scheduled · last_run NO error)
- ✅ Supabase logs last 7gg · zero P0 error critical · warnings categorized
- ✅ OG preview cross-platform · meta tags absolute URL · image 1200x630 accessible · cache-buster aligned current version
- ✅ Mobile 380px · key flow buyer + seller usable · zero horizontal scroll · scoreboard scrollable · CTA reachable
- ✅ MEDIUM if budget · zero half-finished (skip se cushion < 15%)

## Pattern operativi Day 7 · preserved

- ❌ NO sed cascade · edit chirurgico
- ✅ GRANT preserved · zero migration nuova prevista (MEDIUM 1 può richiedere RPC nuova → STOP+ASK pre-write se schema check fa emergere mancanza)
- ✅ Verify-before-edit · ogni asset check + cron check + log review = read-only first
- ✅ STOP+ASK pre-COMMIT critical: 
  - se Finding 2 path fix richiede sweep su molti file → STOP+ASK conferma scope
  - se HIGH 3 emerge P0 error critical Supabase → STOP+ASK escalate priority Day 7 ↔ Day 8
  - se MEDIUM 1 richiede RPC nuova (migration W4 Day 7 = bumping schema version) → STOP+ASK
- ✅ Audit-trail post-commit `CCP_Sprint_W4_Day7_*.md`
- ✅ Mini integration test · syntax check + asset accessibility curl + cron table inspection
- ✅ Tech ownership · audit + fix chirurgico · zero rebuild
- ✅ Pre-commit BANNED terms smoke · zero hits attesi (audit + fix · no copy change)

## Context budget Day 7 forecast

| Task | Estimate |
|---|---|
| ACK file (this) | 3% (done) |
| HIGH 1 asset audit | ~8% |
| HIGH 2 cron health | ~7% |
| HIGH 3 Supabase logs | ~7% |
| HIGH 4 OG preview test | ~10% |
| HIGH 5 mobile responsive | ~12% |
| MEDIUM 1+2 if budget | ~20% (10% each) |
| Closing + commit + push + bridge sync | ~8% |
| Cushion residue | ~25% |

Total ~75% expected · cushion 25% per scenari edge (Finding 2 sweep · cron P0 escalate · MEDIUM blocker schema discovery).

## FASE A timeline post-Day 7

| Day | When | Status |
|---|---|---|
| Day 1-6 | Sab-Dom 16-17/05 | ✅ SEALED |
| Day 7 production readiness | **Dom 17/05 deep night (anticipato)** | 🟢 FIRE NOW |
| Day 8 buffer / MEDIUM items / UAT prep | Lun-Mar 18-19/05 | 🔴 buffer |
| UAT prep | Mer 20/05 | 🔴 prep |
| **UAT finale joint** | **Gio 21/05** | 🔴 ROBY + Skeezu joint (script Day 5 riuso) |
| **FASE A GO-LIVE** | **Ven 22/05** | 🎯 soft launch target |

**Cuscinetto preserved:** 5-6gg pre go-live · Day 7 anticipato Dom night → Lun-Mar disponibili full per MEDIUM + buffer + UAT prep · UAT script Day 5 già ready (riuso UAT finale Gio).

## STOP+ASK pre-fire checkpoints

1. **Finding 1 (OG cache-buster):** procedo con bump a `?v=4.19.0` come parte audit, OR aspetto LOCK separato?
2. **Finding 2 (apple-touch-icon path):** verify production curl prima, poi fix se confermato broken — procedo?
3. **MEDIUM 1 RPC migration:** se serve nuova RPC `update_airdrop_story_visibility`, è scope Day 7 OR deferral Day 8/W5?

**Default assumption (no STOP):** Finding 1+2 sono parte naturale HIGH 1 asset audit · proceed embedded. MEDIUM 1 schema check FIRST · se RPC manca → STOP+ASK before write migration.

## Closing peer-tone

ROBY · LOCK Day 7 acknowledged · 2 findings pre-fire intercettati su recon iniziale (OG version stale + apple-touch-icon path) · audit chirurgico sequence locked.

Skeezu · branch `sprint-w4` continuing · Day 7 anticipato Dom night → bonus +1gg accumulato (potential 5-6gg cuscinetto preserved pre go-live).

AIRIA · standby System Guardian · `AIRIA_SysReport_Pre_Day7_*.md` Lun mattina suggested per Pi 5 health post 7gg sprint W4 fire (Sab 16 → Dom 17 deep night sequence) · cron job concurrent activity audit utile cross-check HIGH 2.

Daje Day 7 production readiness audit · si chiude FASE A 22/05 con feature COMPLETE + brand pollution layer + production audit clean 🚀

— **CCP** · 17 May 2026 deep night (Day 7 anticipato · ACK locked · fire imminente)

*Day 7 ACK · production readiness audit · 2 findings pre-fire · 25° validation point preserving · daje*
