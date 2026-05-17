---
status: WIP Day 7 audit · scratch · NOT for ROBY sync (delete post closing)
date: 2026-05-17 deep night
---

# Day 7 Production Readiness Audit · Findings (WIP)

## HIGH 1 · Asset Audit (DONE)

### Finding 1 · OG cache-buster stale (CONFIRMED · LOW-MEDIUM)
- All `og:image` + `twitter:image` references use `?v=4.13.0`
- Current version: 4.18.0 (Day 6) → Day 7 will bump to 4.19.0
- File `og-image.png` last modified 2026-05-10 · unchanged since
- Etag identical regardless of cache-buster (Vercel CDN ignores query in cache key)
- **Risk:** social scrapers cached `v=4.13.0` keep serving cached image even after we change it; bumping ensures fresh fetch on next deploy
- **Files affected (7):** home.html (L19,L31) · dapp.html (L13,L21) · login.html (L14,L24) · signup.html (L13,L17) · airdrop.html (L13,L24) · come-funziona-airdrop.html (L18)
- **Fix:** sweep `?v=4.13.0` → `?v=4.19.0` (atomic with footer bump)

### Finding 2 · apple-touch-icon path (DEPRECATED · FALSE ALARM)
- Initial concern: `/public/images/AIROOBI_Symbol_White.png` looked wrong for Vercel
- Production curl: returns **200 OK** ✅
- Root cause: `vercel.json` uses `outputDirectory: "."` → `public/` is regular subdirectory, not Vercel's special static dir
- **No fix needed**

### Finding 3 · OG image alt text inconsistent (CONFIRMED · LOW)
- `home.html`: "AIROOBI — Il primo marketplace dove vendere e ottenere è una skill."
- `login.html` + `airdrop.html`: "AIROOBI — Fair Airdrop Marketplace" (English, brand voice mismatch)
- `dapp.html` + `signup.html` + `come-funziona-airdrop.html`: no `og:image:alt` at all
- **Risk:** brand voice inconsistency · accessibility · LinkedIn share preview alt
- **Fix:** STOP+ASK Skeezu — which alt text standardize on? Italian + brand v2 voice ("Un blocco alla volta" era) suggests home.html version

### Finding 4 · OG image MISSING on seller/legal/brand pages (CONFIRMED · MEDIUM)
- Pages WITHOUT `og:image`: venditore.html · termini.html · airoobi-cards.html · airoobi-explainer.html · faq.html (need verify) · vendi.html
- **Risk:** when users share /venditore or /termini or /faq URL on social → no preview image · brand pollution layer broken on those surfaces
- **Fix:** add full OG block (image + dimensions + alt + url + type + title + description) per page — STOP+ASK if scope expands beyond 4 files
- Cross-check: HAVE OG: airdrop, airdrops-public, come-funziona-airdrop, home, blog, login, dapp, signup, contatti, explorer, diventa-alpha-brave, vendi, faq, privacy, investitori, tokens, landing, treasury

### Finding 5 · treasury.html favicon broken (CONFIRMED · MEDIUM · 404 prod)
- `treasury.html` L30-31 reference `/favicon.png` → **HTTP 404** on prod
- File doesn't exist at root (only `/favicon.ico` exists)
- **Fix:** replace `/favicon.png` → `/favicon.ico` in treasury.html (2 occurrences)

## HIGH 2 · Cron Health (DONE)

### Inventory · 12 cron active (brief expected 7 · +5 maintenance found)

**7 sprint W3+W4 (brief):**
- `w4_detect_airdrop_end_event` `*/5 * * * *` · last 02:10 UTC · 75 succ / 0 fail 7gg
- `w4_auto_accept_silent_seller` `*/5 * * * *` · last 02:10 UTC · 75 succ / 0 fail 7gg
- `w4_dispatch_timeout` `0 4 * * *` · last_run NULL · **first run pending Dom 06:00 CET (deploy Sab 22:01 CET)** · manual SELECT test → `{auto_disputes_opened: 0}` clean ✅
- `w4_dispute_window_close` `15 4 * * *` · last_run NULL · **first run pending Dom 06:15 CET** · manual SELECT test → `{finalized: 0}` clean ✅
- `w3-atto1-evaluation-escalation` `5 * * * *` · last 02:05 UTC · 77 succ / 0 fail 7gg
- `w3-atto1-cleanup-expired-swaps` `*/2 * * * *` · last 02:10 UTC · 2294 succ / 0 fail 7gg
- `w3-atto1-refresh-sla-metrics` `*/5 * * * *` · last 02:10 UTC · 916 succ / 0 fail 7gg

**5 maintenance (out of brief but tracked):**
- `check-airdrop-deadlines` `*/15 * * * *` · 672 succ / 0 fail (legacy edge function · likely pre-W3)
- `process-auto-buy` `*/15 * * * *` · 672 succ / 0 fail (legacy auto_buy_rules)
- `cleanup_signup_attempts` `0 3 * * 0` (weekly Sun 03:00 UTC) · last Sat 2026-05-10 · next ~50min
- `process_redemption_queue` `5 0 * * 1` (weekly Mon 00:05 UTC) · last 2026-05-11 · next tomorrow Mon
- `refresh_category_k` `5 0 * * 0` (weekly Sun 00:05 UTC) · last today 00:05 ✅

### Findings cron

- **Zero failure 7gg** across all 12 jobs ✅
- **Zero other-status** (timed-out / pending) ✅
- 2 W4 cron pending first-run validated manually OK
- **No action required**

## HIGH 3 · Supabase Logs (DONE · last 24h MCP limit)

### Postgres logs
- ZERO production ERROR (1 ERROR found = my own test query `column "executed_at" does not exist`, not prod)
- LOG-only entries · auth/cron/connection healthy patterns
- pg_cron job firings visible every 5/15 min as scheduled ✅

### API (PostgREST) logs
- 100% status 200 patterns observed
- RPCs healthy: get_platform_aria_ledger, get_all_airdrops, get_platform_aria_balance, get_activity_feed, admin_get_all_robi
- REST table queries: profiles, treasury_funds, nft_rewards, notifications, weekly_checkins, checkins, points_ledger, video_views all 200
- Zero 4xx/5xx noticed in window

### Auth logs
- All login/token_refresh/token_revoked: 200
- Active users: ceo@airoobi.com (Skeezu) + sal.fabrizio@gmail.com (Alpha Brave tester)
- Token cycle healthy · refresh durations 145-500ms · normal

### Edge function logs · **FINDING 7 CRITICAL**

- `check-deadlines` · status **200** on every invocation (cron 15 min) ✅
- `process-auto-buy` · **HTTP 401 on EVERY invocation** ultime 24h+ (cron 15 min)
- pg_cron reports `succ_7d = 672` but it's only tracking HTTP completion, not status code → masked production failure
- **Auto_buy_rules feature 100% BROKEN in prod** silently for at least 24h (likely longer)
- **Probable cause:** vault `service_role_key` mismatch OR function deployed with different JWT verify settings vs check-deadlines (which works)
- **Impact pre-go-live:** users con auto_buy_rules attivi (likely zero in Alpha 0) non vedono regole eseguite · feature dead

### Action required Day 7
- Investigate `process-auto-buy` edge function source · compare auth pattern vs check-deadlines (which works) · check vault `service_role_key` validity
- **STOP+ASK Skeezu pre-fix:** è production stable failure (no user impact Alpha 0) ma feature core post-go-live. Skip Day 7 (document + escalate) o fire fix as P1 deliverable?

## HIGH 4 · OG Preview Cross-Platform (DONE)

### OG meta completeness (home.html prod)
- ✅ og:type, og:url, og:title, og:description, og:image, og:image:width=1200, og:image:height=630, og:image:alt, og:locale=it_IT, og:site_name=AIROOBI
- ✅ twitter:card=summary_large_image, twitter:site=@airoobi_com, twitter:title, twitter:description, twitter:image
- ✅ OG image file: 1200x630 RGB PNG 55KB (within all platform limits)

### Per-platform requirements check
- ✅ **WhatsApp:** og:image + og:title + og:description present · image >300x300 · <600KB ✅
- ✅ **Telegram:** og:image + og:title + og:description present · image >200x200 ✅
- ✅ **X (Twitter):** twitter:card=summary_large_image + twitter:title + twitter:image + twitter:description ✅
- ✅ **Facebook:** og:image + og:title + og:description + og:type + og:url ✅
- ✅ **LinkedIn:** OG protocol same as FB ✅ (image >1200x627 = 1200x630 OK)

### **FINDING 8 P0 (RIQUALIFICATA · expected sprint-merge state)**

Test `/storie-vincitori`, `/api/winner-story-ssr`, `/api/evalobi-ssr`, `/api/sla-ssr`, `/api/airdrop-ssr` on production:
- ALL return **HTTP 404** in produzione (www.airoobi.com)

**Root cause:**
- Latest Vercel **Production** deploy: 3 days ago (likely v4.14.0 W3 close)
- Current branch `sprint-w4` is 15 commits ahead of `main`
- 4 SSR files (`api/*-ssr.js`) NEW on sprint-w4 · NOT in main → not in production build
- W4 Day 1-6 work (Atti 2-6, Atto 6 stories, eval filter venditore, dual-write, share buttons) all PREVIEW-ONLY
- DB Supabase already migrated (all W4 migrations applied) → DB+code MISALIGNED in production

**Confirmation:** preview deploy `airoobi-4kwmamxrx-tommypecorellas-projects.vercel.app/api/*-ssr` → returns 401 (Vercel Deployment Protection, NOT 404) → SSR functions DO exist in preview build

**Action required pre-go-live Ven 22/05:**
- Merge `sprint-w4` → `main` after UAT Gio 21/05 (per FASE A timeline)
- OR earlier if Skeezu wants production audit on live code
- Without merge: share buttons Day 6 → 404, EVALOBI pollution → 404, SLA dashboard → 404

## HIGH 5 · Mobile 380px (DONE static · UAT runtime needed)

### Static check
- viewport meta `width=device-width, initial-scale=1.0` present in 6/6 main pages ✅
- @media (max-width: Npx) count per page:
  - home.html: 0 (likely uses CSS custom props + flex/grid responsive senza @media)
  - dapp.html: 0
  - landing.html: 0
  - airdrops-public.html: 1
  - venditore.html: 1
  - abo.html: 3
- Zero media query non significa broken mobile · modern CSS può adattare senza breakpoint esplicito · ma è un'anomalia per audit deep

### Limitation
- 380px viewport runtime validation richiede browser (Playwright / Chrome DevTools) · non disponibile TTY headless
- **Defer 380px runtime audit a UAT Gio 21/05 joint ROBY+Skeezu** (UAT script item #16 already covers this)
- Manuale Day 7: zero broken pattern statico identified

## Fix Batch decisions

### Apply Day 7 (zero-ambiguity, low risk)
- [F5] treasury.html: `/favicon.png` → `/favicon.ico` (1 file, fixes prod 404)

### STOP+ASK Skeezu pre-apply
- [F1] OG cache-buster `?v=4.13.0` → `?v=4.19.0` sweep (7 files · low risk · part of footer bump cycle)
- [F4] Add OG block to venditore, termini, airoobi-cards, airoobi-explainer (4 files · medium scope · needs copy decision per page)
- [F3] OG image:alt text consistency standardize (copy decision)
- [F7] process-auto-buy edge function 401 silent failure (investigation + fix scope · pre go-live Ven OK or defer post W5?)
- [F8 = NOT FIX] Merge sprint-w4 → main timing decision: pre-UAT Gio? post-UAT Gio? Skeezu LOCK

### Skip Day 7 (defer)
- MEDIUM 1 story toggle UI seller-side · MEDIUM 2 ROBI bonus column venditore · scope LOW priority vs P0 Finding 8
