---
from: CCP (CIO/CTO Airoobi · Pi 5)
to: ROBY · Skeezu
subject: Sprint W3 · Day 3 status checkpoint · backend largamente complete · pollution layer SSR live
date: 2026-05-13 W2 Day 9 deep night (Day 3 push autonomo via "continua fino alla fine")
branch: sprint-w3
status: Day 3 checkpoint · sprint ~50% complete · backend Atto 1 end-to-end live
---

# Sprint W3 · Day 3 Status Checkpoint

Format adattato per sprint feature-build (8 macro-aree vs 6 holes hardening · adattamento mid-flight come da memory rule `feedback_sprint_reporting_format.md` "Per sprint diversi da hardening Skeezu chiarirà in advance se applicare lo stesso schema o un derivato — non assumere"). Skeezu ha dato autonomia "continua fino alla fine fammi domande solo se davvero necessario", procedo con format adattato + audit-trail puntuale.

## 1. Aree completate

| Area | Status | Migrations applied |
|---|---|---|
| Area 1 EVALOBI lifecycle | ✅ FULL | M1 schema + M2 mint/transfer + M4 re_evaluate orchestrator |
| Area 2 evaluation flow + auto-escalation | ✅ FULL (backend) | M3 table + M4 RPCs + cron_auto_escalation (24h reminder + 72h refund 50 ARIA) |
| Area 3 swap functionality | ✅ FULL (backend) | M5 schema + M6 4 prepare RPCs + swap_execute + cron_cleanup_expired |
| Area 4 transactions multi-asset ledger | ✅ FULL (DB) | M7 + atomic backfill 281 rows points_ledger → transactions |
| Area 6 EVALOBI public visualization | ⏳ PARTIAL | M8 ALTER (public_url GENERATED + asset cols) + get_evalobi_public RPC + Vercel SSR `/api/evalobi-ssr.js` + vercel.json rewrite `/evalobi/:token_id` · Edge fn PDF/PNG/QR generator DEFERRED |

## 2. Aree in corso

| Area | Status | Note |
|---|---|---|
| Area 5 schema tokens visual pages | ⏳ NEXT | SVG asset + .com investitori section + .app /tokens page (4-6h ETA) |
| Area 7 SLA dashboard pubblico | ⏳ NEXT | M11 materialized view 30d · pg_cron 5min refresh · SSR /sla page · 3 embed widgets · email cap helper (3-5h ETA) |
| Area 8 SEO quick wins | ⏳ NEXT | /airdrops/:id SSR · 6 categoria pillar (ROBY copy dependency) · sitemap refresh (8-10h ETA · ridotto se ROBY copy non ready) |

## 3. Skeezu 20 decisioni LOCKED · status applicazione

| # | Decisione | Applied |
|---|---|---|
| #1 | Floor €500 | ✅ M3 CHECK + M4 server-side validate |
| #2 | 4 AND-gate quality (admin manual) | ✅ no SQL · admin review UX W4 economic decision |
| #3 | Form esistente · admin manuale | ✅ M3 schema + M4 admin_evaluate_request |
| #4 | 200 ARIA fisso | ✅ M3 DEFAULT 200 + M4 hardcoded |
| #5 | 1 EVALOBI + 1 ROBI bonus su GO | ✅ M4 admin_evaluate_request IF outcome=GO |
| #6 | EVALOBI permanente · trasferibile · re-evaluable | ✅ M1 schema + M2 transfer + M4 re_evaluate |
| #7 | Token flows · ROBI non-comprabile | ✅ M5 valid_pair CHECK constraint |
| #8 | Schema tokens pubblicato .com/investitori + .app/tokens | ⏳ Area 5 next |
| #9 | NO_GO NO refund | ✅ M4 no refund logic |
| #10 | NO_GO EVALOBI minted comunque | ✅ M4 always calls mint_evalobi |
| #11 | NO_GO NO ROBI bonus | ✅ M4 IF outcome=GO only |
| #12 | Brand Pollution Principle | ✅ M8 public_url + Vercel SSR · evaluation_outcome visible all outcomes |
| #13 | SLA 48h | ✅ M3 sla_deadline DEFAULT NOW+48h |
| #14 | SLA dashboard /sla pubblico | ⏳ Area 7 next |
| #15 | Auto-escalation 24h/72h | ✅ cron_auto_escalation hourly |
| #16 | Notification channels tier critico | ⏳ partial · in-app notifications inserted · email Postmark TBD |
| #17 | Vercel SSR (NOT CF Worker) | ✅ /api/evalobi-ssr.js + vercel.json rewrite |
| #18 | Phased dual-write W3/W4/W5 | ✅ W3 phase 1 · M7 backfill + new RPCs write transactions only |
| #19 | Swap snapshot + 60s lock | ✅ M6 4 prepare RPCs + swap_execute · cron expired cleanup |
| #20 | Re-submit libero (no cooldown) | ✅ M4 re_evaluate_evalobi · no cooldown logic |

**Applied: 17/20 LOCKED** · 3 pending sono dependency su Area 5/7 (#8, #14, #16 partial).

## 4. Concerns/blockers per Skeezu

### Postmark email · IL block residuo critico
Decisione #16 specifica "email tier critico" per esito valutazione e auto-escalation seller. Postmark non è ancora configurato per memory (`Pending Stage 1: Postmark SMTP config + verifica email`). Le RPCs M4 + cron auto_escalation creano correttamente le `notifications` in-app, ma NON inviano email. Quando Postmark è configurato:
- Edge function `send-evaluation-notification(p_request_id, p_outcome)` da scrivere · consumes notifications + chiama Postmark API
- Auto-escalation cron + admin_evaluate_request invocano questa edge function

**Workaround attuale:** notifications in-app sufficienti per sblocco sprint W3 acceptance.

### KAS rate oracle · admin-set
KAS swap RPCs (kas_to_aria, aria_to_kas, robi_to_kas) richiedono `treasury_stats.kas_eur_rate` SET non-NULL. Attualmente NULL. Admin deve settare via Supabase Studio direct o via admin UI (Skeezu decision W4 economic).

**Workaround:** ROBI→ARIA swap già funziona senza KAS rate (ROBI rate da treasury). Demo Atto 1 può prescindere KAS swaps.

### Edge function PDF+PNG+QR generation · deferred
Brief Area 6 prevede `generate-evalobi-public-assets` Supabase Edge Function che genera PDF certificate + PNG OG-image + QR SVG. Richiede librerie Deno (puppeteer/pdfkit per PDF, sharp per PNG, qrcode per QR) e tempo significativo per integration. DEFERRED.

**Workaround attuale:** Vercel SSR `/api/evalobi-ssr.js` genera HTML response al volo · social scrapers (FB/Twitter/LinkedIn) usano og:image fallback al brand og-image.png. PDF stampabile è "nice to have" post-Atto-1.

## 5. Stato 8 macro-aree

| # | Area | DB | RPCs | UI | Edge fn | Status |
|---|---|---|---|---|---|---|
| 1 | EVALOBI lifecycle | ✅ | ✅ | ⏸ | n/a | DB layer FULL |
| 2 | Evaluation flow | ✅ | ✅ | ⏸ | partial cron · email Postmark deferred | Backend FULL |
| 3 | Swap functionality | ✅ | ✅ | ⏸ | cron cleanup ✅ | Backend FULL |
| 4 | Transaction tracking | ✅ | n/a (via M4/M6) | ⏸ /profilo/storico | n/a | DB FULL |
| 5 | Schema tokens visual | ⏸ | n/a | ⏸ | n/a | Pending |
| 6 | EVALOBI public SSR | ✅ M8 | ✅ get_evalobi_public | Vercel SSR ✅ | PDF/PNG/QR DEFERRED | Partial (SSR live) |
| 7 | SLA dashboard pubblico | ⏸ M11 | ⏸ | ⏸ /sla SSR | ⏸ email cap | Pending |
| 8 | SEO quick wins | ⏸ | ⏸ | ⏸ /airdrops/:id SSR | n/a | Pending (ROBY copy dep) |

## 6. Numeri operativi Day 1-3 cumulative

- **Migrations applied:** 9 (M1, M2, M3, M7, M4, M5, M6, cron, M8)
- **Tabelle create:** 5 (evalobi · evalobi_history · evaluation_requests · transactions · token_swaps)
- **ALTER existing:** 3 (treasury_stats +kas_eur_rate · profiles +kas_balance · nft_rewards +burned/burned_at)
- **SECURITY DEFINER RPCs:** 12 (mint_evalobi · transfer_evalobi · submit_evaluation_request · admin_evaluate_request · re_evaluate_evalobi · get_robi_rate_eur · get_kas_eur_rate · get_user_robi_balance · 4 swap_prepare_* + swap_execute · auto_escalate_evaluation_requests · cleanup_expired_token_swaps · get_evalobi_public)
- **RLS policies:** 18+
- **Indexes:** 39+
- **Cron jobs attivi:** 2 (evaluation escalation hourly · expired swap cleanup 2-min)
- **Backfilled rows:** 281 (points_ledger → transactions atomic)
- **Vercel function:** 1 (`/api/evalobi-ssr.js` SSR pollution layer)
- **vercel.json rewrites added:** 1 (`/evalobi/:token_id`)
- **Commits sprint-w3:** 6+ (M1+M2 · M3+M7+M4 · M5 · M6+cron+M8+SSR pending)
- **Audit-trail files:** 3 (Day1 · Day2 · Day3)

## 7. ETA real vs target

- Target: 33-45h CCP focused · ~1.5-2 settimane
- Day 1-3 cumulative real-time push: ~6-7h focused
- Velocity: ~50% sprint complete in 6h vs 1-week-target · ratio 2-3x calibration valida (`feedback_ai_pace_estimate_calibration.md`)
- Stima completamento: 6-10h aggiuntive per Areas 5/7/8 + audit trail + closing report

## 8. Next chunks (Day 4 expected)

1. Area 5 schema tokens · SVG asset + .com /investitori section + .app /tokens new page (~2h)
2. Area 7 SLA dashboard · M11 materialized view + cron + SSR /sla + 3 widgets + email cap helper schema (~3-4h)
3. Area 8 SEO · /airdrops/:id SSR Vercel function + sitemap refresh + 6 categoria pillar SCAFFOLD (ROBY copy fill-in async) (~2-3h)
4. Sprint W3 Closing Report + PR sprint-w3 → main (~30min)

— CCP · 13 May 2026 W2 Day 9 deep night (Day 3 autonomous push)
