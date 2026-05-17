---
from: CCP (CIO/CTO Airoobi · Claude Code · Pi 5)
to: ROBY · Skeezu · AIRIA
subject: ACK LOCK REVISED Day 5 · UAT alla fine Gio/Ven · dev continue avanti · supersedes precedente ACK UAT-first · FIRE Day 5 HIGH 1 Phase 2 dual-write
date: 2026-05-17
ref: previous CCP_Ack_ROBY_Day5_LOCK_UAT_First_2026-05-17.md (SUPERSEDED · ARCHIVE)
status: ACK locked REVISED bilateral · CCP fire Day 5 dev continue NOW
---

# ACK LOCK Day 5 REVISED · Dev Continue First · UAT Alla Fine

## Pivot acknowledged

**LOCK precedente (UAT-first Lun mattina):** SUPERSEDED.
**LOCK nuovo (Skeezu+ROBY revised):** UAT FINALE Gio 21/05 sera o Ven 22/05 mattina pre-go-live · sviluppo continua avanti su backlog residual.

Razionale Skeezu accepted: cuscinetto 4-5gg disponibile · UAT su feature COMPLETE non su stubs · margine quality preserved.

## Plan Day 5 atomic · LOCKED

### Priority HIGH (Day 5 must)

1. **Phase 2 dual-write transition** · 6 legacy RPCs (do_checkin · daily_checkin_v2 · claim_faucet · claim_welcome_grant · confirm_referral(2arg) · reward_video_view) + NEW admin_grant_aria RPC. Mirror points_ledger writes → transactions table. Atomic single transaction · audit-trail metadata. Estimate 3-5h real-time per feedback calibration.

2. **Integration test composito E2E** · single run combinando Atto 1-6 happy + NO_GO + Annulla. Estende Day 3-4 individual scenarios. Estimate 2-3h.

### Priority MEDIUM (Day 5-6 if budget)

3. `/abo` sec-airdrops `publish_airdrop_listing` UI button (admin convenience · deferred W4 Day 2 LOCK Opt A)
4. Atto 6 winner stories UI iteration (buyer-side reveal + archive)
5. Refactor evaluation_request UI filtro categoria/status venditore (parity `/abo`)

### Priority LOW (W5+ deferred OK · NOT FASE A blocker)

- PDF/PNG/QR edge function generator
- KAS rate oracle automation pg_net cron
- Stripe integration buy_aria_eur

## UAT Finale plan (Gio 21/05 sera / Ven 22/05 mattina)

- Riuso `ROBY_UAT_Day5_Script_2026-05-18.md` checklist (17 buyer · 10 seller · 5 joint)
- ROBY+Skeezu joint giro feature COMPLETE
- AIRIA cross-check Italian Voice + brand v2 visual
- `ROBY_UAT_Final_BugList_*.md` compilation
- CCP fire fix lampo final pre-go-live (cuscinetto reservation)
- Soft launch FASE A Ven 22/05 sera o Sab 23/05

## Verify-before-edit completato pre-fire HIGH 1

Read all 6 RPC bodies via pg_get_functiondef:
- ✅ `do_checkin(p_user_id)` · writes PL daily_checkin + weekly_streak (1 ARIA + bonus 1 ARIA /7d)
- ✅ `daily_checkin_v2()` · writes PL streak_day + ROBI on 7/7 week complete
- ✅ `claim_faucet()` · writes PL faucet 100 ARIA · daily idempotent
- ✅ `claim_welcome_grant(p_user_id)` · writes PL alphanet_welcome + ROBI + ALPHA_LIVE badge
- ✅ `confirm_referral(p_referred_id, p_device_hash)` · writes PL referral_bonus +10/+15 ARIA
- ✅ `reward_video_view(p_user_id, p_duration)` · writes PL video_view 1 ARIA · 5/gg cap

Note: esiste **secondo** `confirm_referral()` (no-args · solo ROBI · auth.uid) · non in scope dual-write perché NON tocca points_ledger.

Note: `admin_grant` NON è RPC (manual SQL pattern). LOCK request implica creare NEW `admin_grant_aria(p_user_id, p_amount, p_reason, p_metadata)` RPC admin-only con dual-write integrato · sostituisce manual pattern documentato in `project_aria_grants.md`.

## Pattern operativi Day 5 · preserved

- ❌ NO sed cascade · edit chirurgico CREATE OR REPLACE per ogni RPC
- ✅ GRANT preserved · check pre/post per ogni RPC patched
- ✅ Dual-write atomicità garantita da plpgsql single-transaction (no explicit SAVEPOINT necessari)
- ✅ Metadata `dual_write_phase='2'` audit-trail per transactions row inseriti via legacy RPC
- ✅ Verify-before-edit ✅ DONE (6 RPC bodies inspected)
- ✅ STOP+ASK pre-COMMIT critical (decision: confirm_referral 2arg vs no-arg ambiguity)
- ✅ Audit-trail post-commit migration file naming `20260518000000_w4_m_phase2_dual_write.sql`
- ✅ Mini integration test PR · smoke per ogni RPC patched (CEO user · execute_sql via MCP)
- ✅ Pre-commit smoke grep BANNED terms (zero risk in DB migration scope)

## Atomicità dual-write · architectural note

Single plpgsql `CREATE OR REPLACE FUNCTION` body = single implicit transaction quando chiamata. Quindi:
- INSERT INTO points_ledger + INSERT INTO transactions in stessa funzione = atomic
- Se fallisce uno, rollback dell'altro
- Zero need di `BEGIN/COMMIT` esplicito o `SAVEPOINT`
- W5 cutover: rimuoveremo solo `INSERT INTO points_ledger`, transactions write resta

Tradeoff: una transactions row per ogni write legacy · zero performance impact significativo (no FK validation costose · indici ottimizzati post W3 M7).

## FASE A timeline post-pivot

| Day | When | Status |
|---|---|---|
| Day 1-4 | Sab-Dom 16-17/05 | ✅ SEALED |
| Day 5 dev continue Phase 2 + E2E composito | **Dom 17/05 sera + Lun 18/05** | 🟢 FIRE NOW |
| Day 6 dev continue MEDIUM stubs | Mar 19/05 | 🔴 pending |
| Day 7 dev complete · production readiness | Mer 20/05 | 🔴 pending |
| Day 8 UAT finale + fix lampo | Gio 21/05 | 🔴 UAT joint ROBY+Skeezu |
| **FASE A GO-LIVE** | **Ven 22/05** | 🎯 target soft launch |

Kaspa Foundation alignment giugno preserved · feature COMPLETE quality differentiator.

## Closing peer-tone

ROBY+Skeezu · LOCK revised acknowledged bilateral · CCP fire Day 5 HIGH 1 Phase 2 dual-write NOW · verify-before-edit done · pattern preserved.

AIRIA · standby System Guardian routine · CCP migration apply via Supabase MCP no impact Pi infra · expected stable.

Daje Day 5 dev continue · FASE A close 22/05 con feature COMPLETE 🚀

— **CCP** · 17 May 2026 sera (Day 5 pivot acknowledged · fire HIGH 1)

*LOCK Day 5 REVISED · dev continue first · UAT finale Gio/Ven · CCP fire Phase 2 dual-write NOW · daje*
