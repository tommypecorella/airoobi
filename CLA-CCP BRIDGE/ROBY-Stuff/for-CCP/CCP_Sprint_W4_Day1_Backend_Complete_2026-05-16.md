---
from: CCP (CIO/CTO Airoobi · Pi 5)
to: ROBY · Skeezu
subject: Sprint W4 Day 1 · BACKEND COMPLETE · 6 migrations + 18 RPCs + 4 cron + 2 SSR + 1 helper · STOP+ASK pre-UI
date: 2026-05-16 W3 Day 1 evening (sprint W4 kickoff fire)
branch: sprint-w4 (built from sprint-w3 head · PR #1 W3 still OPEN at main)
status: Day 1 backend layer SEALED · UI layer pending Skeezu direction
version: alfa-2026.05.16-4.15.0
---

# Sprint W4 · Day 1 Backend Layer Complete

## TL;DR

**6 migrations live · 18 W4 RPCs deployed · 4 cron scheduled · 2 Vercel SSR · 1 helper fn.** Full DB layer Atti 2-6 + cross-atto push routing sealed. **STOP+ASK Skeezu pre-UI work** (tactical clause): UI 4 aree è genuine separate quality-quantum (~10-15h focused real-time stima · 2-3x scope DB layer · best done as Day 2 atomic session).

## Migrations applied (in order)

| # | File | Scope |
|---|---|---|
| 1 | `20260516210000_w4_m_atto2_prep_push_routing.sql` | profiles.category_preferences JSONB · profiles.notify_all · notification_dispatch_log table · **is_alpha_brave() helper (4th schema gap fix)** |
| 2 | `20260516210500_w4_m_atto2_01_airdrops_listing_fields.sql` | airdrops: is_demo · duration_days · listing_published_at · RLS DEMO/LIVE scope |
| 3 | `20260516211000_w4_m_atto2_02_publish_listing.sql` | airdrop_total_blocks_derive · publish_airdrop_listing RPC · T2+T3 dispatch log |
| 4 | `20260516212000_w4_m_atto3_checkmate_and_scoreboard.sql` | **compute_checkmate_blocks** (closed-form math da scoring v5 reale, not brief pseudocode) · get_airdrop_scoreboard_live · get_airdrop_active_excluded_counts |
| 5 | `20260516213000_w4_m_atto4_seller_acknowledge.sql` | valid_status extension · 6 acknowledge cols · detect_airdrop_end_event · seller_acknowledge_airdrop · cron_auto_accept_silent_seller · 2 cron 5min |
| 6 | `20260516214000_w4_m_atto5_claims_disputes.sql` | airdrop_claims + airdrop_disputes tables · 5 RPCs (claim/dispatch/receive/dispute open/resolve) · 2 cron daily 04:00/04:15 |
| 7 | `20260516215000_w4_m_atto6_winner_stories.sql` | airdrops story fields + GENERATED url · get_winner_story_public · get_winner_stories_archive |

## RPCs deployed (18 new W4)

**Atto 2 (3):** is_alpha_brave · airdrop_total_blocks_derive · publish_airdrop_listing
**Atto 3 (3):** compute_checkmate_blocks · get_airdrop_scoreboard_live · get_airdrop_active_excluded_counts
**Atto 4 (3):** detect_airdrop_end_event · seller_acknowledge_airdrop · cron_auto_accept_silent_seller
**Atto 5 (7):** claim_airdrop_prize · confirm_airdrop_dispatched · confirm_airdrop_received · open_airdrop_dispute · resolve_airdrop_dispute · cron_check_dispatch_timeout · cron_check_dispute_window_close
**Atto 6 (2):** get_winner_story_public · get_winner_stories_archive

## Cron schedules (4 new W4)

| Job | Schedule | Purpose |
|---|---|---|
| w4_detect_airdrop_end_event | `*/5 * * * *` | Atto 4 trigger detection (deadline/sold-out/scacco-matto) |
| w4_auto_accept_silent_seller | `*/5 * * * *` | Atto 4 24h SLA expired → auto-accept |
| w4_dispatch_timeout | `0 4 * * *` | Atto 5 dispatch 14d timeout → auto-dispute |
| w4_dispute_window_close | `15 4 * * *` | Atto 5 30d post-received → finalize claim |

## Vercel SSR (2 new W4)

- `api/winner-story-ssr.js` · single story + archive list paginated · Schema.org Article + CollectionPage · OG meta · cache 1h/15min edge
- `vercel.json` rewrite: `airoobi.com/storie-vincitori` + `/storie-vincitori/:id` → SSR

## 4 schema gaps caught verify-before-brief

| # | Gap brief assumption | CCP fix |
|---|---|---|
| 1 | `profiles.category_preferences` missing | ✅ added M_atto2_prep_00 |
| 2 | `profiles.notify_all` missing | ✅ added M_atto2_prep_00 |
| 3 | `notification_dispatch_log` table missing | ✅ created M_atto2_prep_00 |
| 4 | `profiles.alpha_brave` (not a column · is badge in nft_rewards) | ✅ created `is_alpha_brave()` helper STABLE SECURITY DEFINER for clean RLS + RPC use |

## Skeezu LOCK decisions applied

| LOCK # | Decision | Applied where |
|---|---|---|
| v0.4-1 | V durata Atto 1 form + admin valida Atto 2 | publish_airdrop_listing p_duration_days input |
| v0.4-2 | 7gg base · 10gg mid · 14gg premium · override OK | publish_airdrop_listing accepts any 1-60 days |
| v0.4-3 | Italian naming "Evento/esclusi/attivi" · BANNED maratona | get_airdrop_active_excluded_counts function naming |
| v0.4-6 | total_blocks = ceil(value × 1.333) · 2x sold-out | airdrop_total_blocks_derive · math verified €500→667, €700→934, €1000→1334, €2500→3334 |
| v0.4-7 | scacco matto hard floor 85% sold | compute_checkmate_blocks threshold · detect_airdrop_end_event check |
| v0.4-8 | 24h seller acknowledge SLA · ACCEPT/ANNULLA/SILENT auto-accept | detect_airdrop_end_event sets sla_deadline · cron_auto_accept_silent_seller fires post-24h |
| v0.3-2 | Atto 5 in-platform tracking | airdrop_claims + dispatch/receive flow |
| v0.3-3 | CEO manual dispute fino Stage 2 | resolve_airdrop_dispute is_admin() gate |
| #16 LOCK push tier | T2 categoria-match + T3 broadcast | notification_dispatch_log populated by publish_airdrop_listing |
| #17 LOCK Vercel SSR | Atto 6 winner stories via Vercel | api/winner-story-ssr.js |

## Tech notes (CCP ownership)

1. **compute_checkmate_blocks** derived from REAL scoring v5 (`f_base = sqrt(blocks) × loyalty_mult + pity_bonus`). Loyalty_mult + pity_bonus costanti per airdrop (s_u = historic, current_aria non entra in f_base). Closed-form inverse: `blocks_target = ((score_target - pity_bonus) / loyalty_mult)^2`. Math più ricca del brief pseudocode (che assumeva `score = sqrt(blocks) × multiplier` semplice).

2. **"Esclusi/attivi" classification:** "escluso" = max possible score (current_blocks + remaining) < leader_score · "attivo" = altrimenti. Definizione math chiara, allineata Italian Voice v0.4-3.

3. **valid_status enum:** mantenuto sia `waiting_seller_acknowledge` (nuovo Atto 4) che `pending_seller_decision` (legacy preserved) per zero impatto data existing.

4. **`is_alpha_brave()` helper:** STABLE SECURITY DEFINER · usato in RLS airdrops + publish_airdrop_listing dispatch logic · GRANT a authenticated+anon per RLS subquery zero leak.

5. **Cron pattern stack-fit W3 preserved:** 5min Atto 4 detection · 5min auto-accept silent · daily 04:00 Atto 5 dispatch timeout · daily 04:15 Atto 5 dispute window close.

## Smoke test (Day 1)

```
new_w4_rpcs_count: 18 ✅
new_tables: 3 ✅ (notification_dispatch_log + airdrop_claims + airdrop_disputes)
new_crons: 4 ✅
new_airdrop_cols: 8 ✅
airdrop_total_blocks_derive math: €500→667, €700→934, €1000→1334, €2500→3334 ✅
is_alpha_brave smoke (non-existent UUID): FALSE ✅
```

## 🔴 STOP+ASK Skeezu · UI layer direction request

Per tactical clause LOCK #4 W4 ("STOP+ASK Skeezu real-time se pressure emerge"):

**Backend layer SEALED · UI layer è genuine separate quality-quantum.** 4 aree UI:
1. `/abo` extension (2 sezioni estendere + 4 nuove) · realistic ~3-4h focused
2. `/venditore` NEW seller dashboard 7 pages · realistic ~4-5h focused
3. `/airdrops/:id` Live Evento UX components estensione · realistic ~2-3h focused
4. `/profilo/preferenze` minimal (push T2/T3 settings) · realistic ~1h focused

**Total UI realistic ~10-13h focused.** In single autonomous push session si fa shallow/broken work · proper UI atomic atto per atto è Day 2 session ideale.

**3 opzioni propongo Skeezu LOCK:**

| Opt | Scope Day 2 | Velocity | Trade-off |
|---|---|---|---|
| **A** (recommended) | Tutte e 4 UI aree atomic Day 2 single push autonomous | 10-13h focused → 4-5h real-time | FASE A target Ven 22/05 ancora raggiungibile · 5 giorni cuscinetto E2E + bug fixing |
| **B** | Solo UI core (1+3 abo seller dashboard atomic acknowledge UI Atto 4) + defer remaining UI W5 | 6-8h focused → 2-3h real-time | FASE A close airdrop life-cycle online minimal (admin manage + seller acknowledge gate funzionante) · ABO 4 new sezioni defer |
| **C** | Continue fire NOW autonomous push tutto W4 single session | shallow risk · code quality drop atteso | Velocity ad oltranza preserved · qualità sacrificata · debt tecnico Day 3 |

ROBY/Skeezu LOCK richiesto. CCP recommendation **Opt A** · Day 2 dedicato UI atomic atto per atto.

## Pre-deploy verifications W3 preserved ✅

- pg_cron 1.6.4 · pg_net 0.19.5 · pgmq 1.5.1 · treasury_stats schema · Vercel stack
- 4/4 condizioni autonomous push lit (W3 done · brief sealed · tech CCP-signed · Skeezu authorize)

## Action items finali Day 1

- ✅ 7 migrations applied
- ✅ 18 W4 RPCs deployed
- ✅ 4 cron scheduled
- ✅ 2 SSR + vercel.json rewrite
- ✅ Footer version bumped 4.14.0 → 4.15.0 (4 files: home + signup + dapp · + audit pending other HTML)
- 🔴 Pending Skeezu LOCK UI direction (Opt A/B/C)
- 🔴 Pending Day 2 UI atomic push (post-LOCK)

## Closing peer-tone

Day 1 backend layer SEALED · velocity sopra calibration · 4 schema gaps caught + risolti chirurgicamente · math closed-form derivata da real scoring v5 (non brief pseudocode) · zero ego friction · 19° validation point pattern healthy.

STOP+ASK Skeezu adesso · 3 opzioni Day 2 propose · CCP reco Opt A. Riposo CCP fino Skeezu LOCK arriva · monitoring W3+W4 cron passive.

— **CCP** · 16 May 2026 W3 Day 1 evening (sprint W4 kickoff fire complete Day 1)

*Sprint W4 Day 1 backend layer SEALED · 6 migrations + 18 RPCs + 4 cron + 2 SSR + 1 helper · 4 schema gaps fixed · Skeezu LOCK 9/9 applied · STOP+ASK pre-UI tactical clause · Opt A recommended · FASE A Ven 22/05 raggiungibile · daje 🚀*
