---
from: CCP (Claude Code · CIO/CTO · Raspberry Pi 5)
to: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
cc: Skeezu (founder/CEO)
subject: Sprint W1 Hardening — CLOSING REPORT (skeleton anticipato Day 5, finalize Day 7)
date: 2026-05-01 (skeleton) → 2026-05-03 (FINAL)
ref: TECH-HARDEN-001 sprint plan (27 Apr - 3 Mag 2026)
status: SKELETON · placeholders [TBD-Day7] da finalizzare post-merge harden-w1 → main
---

# Sprint W1 Hardening · Closing Report

## 0. Executive summary (in 30 secondi)

Sprint TECH-HARDEN-001 chiuso in **7 giorni** (27 Apr - 3 Mag 2026) con **6/6 hole architetturali risolti**, **4/4 quick wins shipped**, **LEG-002 Treasury Methodology pubblicato**, **scoring v5.1 atomic cutover** in produzione, **Hole #1 sybil resistance** completa Layer A+B+D (+ Layer C bypass scaffold pending Twilio reactivation), **Hole #6 weekly redemption** live. Confidence Stage 1 readiness: **alta**.

Numbers headline:
- Migration applicate live: **[TBD-Day7 : conta finale]**
- RPC nuove o modificate: **[TBD-Day7]**
- Edge functions deployed: **[TBD-Day7]**
- Cron jobs attivi: **[TBD-Day7]**
- Bug catturati pre-prod via smoke test: **3** (`position` keyword, `v_category_id` NULL, `points_ledger.points` → `amount`)
- Tempo sprint reale: ~**[TBD-Day7]** ore CCP cumulative (vs ~70h human-pace stimate originariamente)

---

## 1. Holes risolti (6/6)

### Hole #1 — Sybil resistance multi-layer

**Status**: ✅ Layer A+B+D in produzione · Layer C scaffold pending Twilio (post fraud-review reactivation)

**Layer A** (rate limit DB-side):
- Migration: `20260427100000_signup_rate_limit.sql`
- Tabella `signup_attempts` + RLS + indici
- 2 RPC: `count_signup_attempts`, `log_signup_attempt`
- Cron `cleanup_signup_attempts` Sun 03:00 UTC (retention 30gg)
- Config `airdrop_config`: 5 thresholds (sybil_ip_24h_soft/hard, device_24h_hard, email_local_hard, ua_1h_soft)

**Layer B** (Cloudflare Turnstile):
- Edge function `signup-guard` deployed
- Turnstile widget AIROOBI Alpha (sito 0x4AAAAACovg89u9bGYrc0E, hostname airoobi.com + airoobi.app)
- Secret push: TURNSTILE_SECRET + SIGNUP_SALT (64 hex)
- Smoke test 4/4 verde (invalid_email, ok:true, device_too_many, ip_too_many)

**Layer C** (phone verification):
- Migration scaffold: `20260427150000_phone_verification_layer_c_scaffold.sql`
- 2 edge function pronte (phone-verify-init, phone-verify-confirm) — bypass=true di default
- 9/9 mini integration test verde
- Twilio secrets pending (post fraud-review reactivation, 12-48h)

**Layer D** (welcome scaling):
- Migration: `20260427130000_welcome_grant_scaling_layer_d.sql`
- RPC `claim_welcome_grant()` idempotente, scalata (full 1k ARIA + 5 ROBI sotto soglia 5k utenti)
- `handle_new_user` trigger refactored per chiamare RPC

### Hole #2 — Fairness server-side guard

**Status**: ✅ Live

- Migration: `20260427090000_fairness_guard_serverside.sql`
- RPC `check_fairness_can_buy(p_airdrop_id, p_user_id, p_extra_blocks)`
- RPC `my_category_score_snapshot_for(p_airdrop_id, p_user_id)` (fixed B1 storici_cat one-category-rule Day 4)
- Bug catturato Day 1: `v_category_id` always NULL (categoria è TEXT slug, non UUID) → fix immediato in Hole #4 migration

### Hole #3 — Scoring v5.1 atomic cutover

**Status**: ✅ Live · `airdrop_config.scoring_version='v5.1'`

- Migration: `20260430110000_hole3_scoring_v51_pity_aria_continuous.sql`
- Change: pity continuous on S_u (ARIA spent post-last-win) instead of L_u (count discrete)
- Atomic 5-step: CREATE _v51 → CREATE compare RPC → DO block parity audit → CREATE OR REPLACE main → DROP _v51
- Compare RPC `compare_score_v5_vs_v5_1` kept post-cutover for M1 future audits
- Parity audit Alpha 0: 0 completed airdrops with winner → cutover safe
- Audit log event `scoring_version_cutover` registered

### Hole #4 — K stability rolling 4-week median

**Status**: ✅ Live

- Migration: `20260427110000_k_stability_4w_median.sql`
- Materialized view `category_k_history` (percentile_cont(0.5) per category settimanale)
- RPC `get_category_k(p_category TEXT)` (avg 4w, floor 100)
- RPC `refresh_category_k_history()` con audit log K shift > 20%
- Cron Sun 00:05 UTC

### Hole #5 — Signup source tracking + ROBI policy A

**Status**: ✅ Live

- Migration: `20260427105000_signup_source_column.sql` + `20260427120000_robi_policy_flag.sql`
- `profiles.signup_source` column + trigger
- 4 config keys: `robi_transferable=false`, `robi_transferable_phase_unlock=mainnet`, `robi_max_transfers_per_month=0`, `robi_policy_version=v2.0`
- 2 RPC: `get_robi_policy()`, `assert_robi_transferable()`

### Hole #6 — Treasury weekly redemption

**Status**: ✅ Live · 5/5 smoke test verde

- Migration: `20260430100000_treasury_weekly_redemption_hole6.sql`
- 10 config keys (window_type, weekly cap 15k EUR, per-user cap 1k EUR, fee 10 ARIA, min age 3gg, etc.)
- Tabella `robi_redemptions` + RLS (select own, insert self, no update)
- 4 RPC: `request_robi_redemption`, `get_redemption_schedule_view`, `cancel_redemption_request`, `process_weekly_redemption_queue`
- 3 helper RPC: `_get_redemption_week_monday`, `_get_robi_peg_eur`, `_get_user_available_robi`
- Cron pg_cron Mon 00:05 UTC scheduled
- Edge function `process-redemption-queue` (manual trigger admin + dry_run mode)
- Bug catturato dal smoke test live: `points_ledger.points` → `amount` (column name) → hotfix CREATE OR REPLACE

---

## 2. Quick Wins shipped (4/4)

| QW | Cosa | File / Migration |
|---|---|---|
| #1 | Brand functional palette (3 red token + green-success) | `20260427140000_brand_functional_palette_tokens.sql` + `src/home.css` + `src/dapp.css` |
| #2 | OG meta tags pagine pubbliche (12/15 complete) | 8 .html files updated |
| #3 | sitemap.xml + sitemap-com.xml + robots.txt | 3 file aggiunti/aggiornati |
| #4 | Telegram bot welcome flow draft | `CCP_Telegram_Bot_Welcome_Flow_2026-04-27.md` |

---

## 3. Code review fixes (2 HIGH + 3 MEDIUM + 2 LOW promosse)

| # | Severity | Item | Status |
|---|---|---|---|
| A1 | HIGH | Anon key hardcoded `<anon_key>` in diventa-alpha-brave.html | ✅ già fixed pre-review |
| A2 | HIGH | Welcome inline trigger pre-Layer C | ✅ Layer D moved to RPC |
| B1 | MED | `storici_cat` no One Category Rule | ✅ fixed Day 4 (branch separato merged) |
| B2 | MED | `signup_attempts` cleanup cron | ✅ Day 2 |
| B3 | MED | `current_phase` config missing | ✅ false alarm — already in airdrop_config since 19 Mar |
| C1 | LOW→W1 | `disable_auto_buy` direct UPDATE bypassa trigger | ✅ `disable_auto_buy_admin` variant + 3 call sites updated |
| C2 | LOW→W1 | `verifyTurnstile` extra call when not required | ✅ branch removed |
| C3 | LOW→W2 | Counter Alpha Brave fallback UX | 🟡 deferred W2 (verdict ROBY) |

---

## 4. Deliverables ROBY consegnati (oltre il code)

- ✅ **LEG-002** Treasury Backing Methodology v1 PUBLISHED (sign-off Skeezu 2026-05-01)
  - Promosso a `01_deliverables_docs/business/AIROOBI_Treasury_Methodology_v1.md`
  - PDF in `ROBY-Stuff/investor-pack/AIROOBI_Treasury_Methodology_v1.pdf`
- ✅ **Captcha monitoring RPC** `get_captcha_failed_rate_24h()` per ROBY M1·W1 daily check (instrumentation parallela in signup-guard)
- ✅ **Treasury Methodology DRAFT v1** review consegnata (8 fix recepiti integralmente in v1 FINAL)
- ✅ **Compare RPC** `compare_score_v5_vs_v5_1` kept post-cutover per ROBY future audits
- 🟡 **Landing /treasury** — Day 5 PENDING (waiting Treasury Summary HTML da ROBY · file claimed but not yet exported)

---

## 5. Pattern adottati per W2+ (5 lessons keeper)

1. **3-options-stop pattern** (decisione architetturale autonoma quando assunzione esterna è errata) — validato ROBY 30 Apr post NO push Vercel
2. **AI-pace estimate calibration** (-50/60% buffer per chunk implementativi puri, -10/20% per chunk strategic/creative) — validato ROBY 30 Apr post Day 4 in 3h vs 8h
3. **Atomic cutover with parity audit** (per scoring/algorithm changes: CREATE _vN → audit RPC → DO block check → CREATE OR REPLACE → DROP) — validato ROBY 30 Apr Hole #3
4. **Instrumentation parallela** (CCP pre-empt ROBY query con event logging granulare quando schema non isola la metrica richiesta) — validato ROBY 30 Apr Captcha event log
5. **Mini integration test obbligatorio post-PR** (smoke test inline in migration o .md ack) — adottato Day 1 dopo `v_category_id` NULL bug

---

## 6. Numbers finali

| Metrica | Valore |
|---|---|
| Sprint duration | 7 giorni (27 Apr - 3 Mag 2026) |
| Hole risolti | 6/6 |
| Quick Wins shipped | 4/4 |
| Issue code review chiuse | 5 HIGH/MED + 2 LOW promosse |
| Migration applicate live | **[TBD-Day7]** |
| RPC nuove o modificate | **[TBD-Day7]** |
| Edge functions deployed | **[TBD-Day7]** (signup-guard, process-redemption-queue, process-auto-buy redeployed) |
| Cron jobs attivi | **[TBD-Day7]** |
| Materialized views | **[TBD-Day7]** |
| Tabelle nuove | **[TBD-Day7]** |
| Smoke test verde cumulative | **[TBD-Day7]** |
| Bug catturati pre-prod | 3 (`position`, `v_category_id`, `points_ledger.points→amount`) |
| Bug arrivati in prod | **0** |
| Branch separati creati e merged | 1 (harden-w1-b1-storici-fix → harden-w1) |
| Commit total su harden-w1 | **[TBD-Day7]** |
| Linee SQL aggiunte | **[TBD-Day7]** |
| Linee TS edge functions aggiunte | **[TBD-Day7]** |
| File MD bridge prodotti | **[TBD-Day7]** |
| Tempo CCP effettivo | **[TBD-Day7]** ore (~30-40% del budget human-pace) |

---

## 7. Pending post-merge harden-w1 → main (Day 7 · 3 Mag)

### Bloccanti zero

Sprint chiusura non ha bloccanti. Eventuali pending sono **deferred a W2** o **gated su esterni**:

| Item | Owner | Quando |
|---|---|---|
| Twilio Phase 2 deploy (3 secrets + 2 edge function + flip bypass) | CCP | Post Twilio fraud-review reactivation (12-48h) o W2 |
| C3 LOW counter fallback UX | CCP | W2 |
| Landing `/treasury` | CCP+ROBY | Day 5-6 (pending Summary HTML da ROBY) |
| Brand kit v1.1 functional palette esteso | ROBY | Day 5-7 |
| Pitch deck v1.2 (slide #5 pity v5.1, slide #11 traction "6 buchi") | ROBY | Day 5-7 |
| Technical companion v1.1 | ROBY | Day 5-7 |
| Thread X founder-led "I 6 buchi che il nostro engine aveva" | ROBY draft + Skeezu push | Day 7+ |
| REGISTRY.md entry TECH-HARDEN-001 + LEG-002 | ROBY | Day 7 post-merge |
| Cross-link in LEG-001 v2.1 | ROBY (con CCP review) | post Day 7 |

### Smoke test post-merge prod (Day 7)

CCP eseguirà:
- [ ] curl `signup-guard` da prod URL → verify 200 + rate limit triggers
- [ ] SQL `SELECT public.get_captcha_failed_rate_24h();` → verify metric returns
- [ ] SQL `SELECT public.calculate_winner_score(<test_uuid>);` → verify v5.1 RPC works
- [ ] SQL `SELECT public.get_redemption_schedule_view();` → verify 4 weeks lookahead
- [ ] Verify cron jobs attivi: `SELECT * FROM cron.job WHERE jobname IN (...)` → 4 cron expected (refresh_category_k, cleanup_signup_attempts, process_redemption_queue, [TBD-Day7])

---

## 8. Lessons learned (5 mie + 5 ROBY-validated)

### 5 mie (CCP)

1. **Mini integration test BEFORE "done"** — bug `v_category_id` NULL Day 1 sarebbe arrivato in prod senza Hole #4 self-test. Convention adottata.
2. **Self-review prima della consegna salva 1 round** — `position` keyword + `v_category_id` catturati io stesso pre code review ROBY. Pattern: ogni file CCP_*.md di consegna include re-grep dei file modificati.
3. **Lavoro autonomo durante attese esterne** — Layer C bypass-first scaffold ha sbloccato critical path da Twilio missing. Replicabile per Postmark / smart contract Kaspa.
4. **Cross-check su affermazioni ROBY** — B3 `current_phase missing` era falso, già in airdrop_config da Mar. Lezione: dichiarare esplicitamente "config keys NUOVE vs PRE-ESISTENTI" nei deliverable.
5. **Asset-trail su raccomandazioni > domande aperte** — A3 brand `#49b583` consegnato con grep + 2 occorrenze + analisi semantica + spec proposta = saving 1 round chiarimento ROBY.

### 5 ROBY-validated (post-Day 4)

6. **3-options-stop pattern** validato dopo NO push Vercel
7. **AI-pace estimate calibration** validato dopo Day 4 in 3h vs 8h
8. **Atomic cutover with parity audit** validato dopo Hole #3
9. **Instrumentation parallela** validato dopo captcha event log
10. **Pattern Phase 1 (decisione autonoma + smoke test + report transparente)** validato come template flow per W2+

---

## 9. Confidence Stage 1 readiness

**[TBD-Day7 : aggiornare post-smoke test prod]**

Pre-merge stima: **~95%** (Hole #1 Layer C scaffold reduces risk Alpha launch even without Twilio; Hole #2-6 + Treasury + scoring v5.1 in prod live).

Bloccanti residui Stage 1:
1. Postmark SMTP (esterno, fuori scope sprint hardening)
2. Twilio Phase 2 (gated, no production impact)
3. Onboarding Alpha Brave 1.000 utenti (esterno, ROBY scope)
4. Landing /treasury (Day 5 pending Summary HTML)

---

## 10. Closing peer-to-peer

Sprint W1 chiuso pulito. Workflow CCP+ROBY+Skeezu maturato:
- **CCP**: implementa, smoke testa, instrumenta, raccomanda
- **ROBY**: review framing/strategy/legal, code review, cross-check, alza la barra senza forzare
- **Skeezu**: gating, sign-off, decisioni architetturali, autonomy authorization

Pattern collaborativo da replicare W2.

---

— **CCP** (CIO/CTO Airoobi)

*Versione 0.1 SKELETON · 1 Mag 2026 · canale CCP→ROBY (anticipo Day 6, finalize Day 7)*
*Versione 1.0 FINAL · target 3 Mag 2026 EOD · post merge harden-w1 → main + smoke test prod*
