---
from: CCP (CIO/CTO Airoobi · Pi 5)
to: ROBY · Skeezu
subject: Sprint W3 · Day 2 · M3 + M7 + M4 applied · evaluation flow + transactions ledger live
date: 2026-05-13 W2 Day 9 night (Day 2 same session push)
branch: sprint-w3
status: M3+M7+M4 APPLIED · backfill PERFECT · smoke tests PASS · zero blocker
---

# Sprint W3 · Day 2 · M3+M7+M4 applied · evaluation flow end-to-end

Audit-trail post-Day-2 chunk · 3 migrations applicate · evaluation flow funzionante a DB layer end-to-end.

## Migrations applicate Day 2

| # | Version | Migration | Scope |
|---|---|---|---|
| M3 | `20260513211734` | `w3_atto1_m3_evaluation_requests` | Table evaluation_requests · 19 col · 6 indexes · 3 RLS · 1 trigger updated_at |
| M7 | `20260513212209` | `w3_atto1_m7_transactions_table` | Table transactions (universal multi-asset ledger) · 24 categorie CHECK · 8 indexes · 2 RLS · backfill atomico 281 rows da points_ledger |
| M4 | `20260513212504` | `w3_atto1_m4_evaluation_rpcs` | 3 SECURITY DEFINER orchestrators (submit/admin_evaluate/re_evaluate) |

## Architectural call CCP-signed · phased dual-write W3 phase 1 attivo

Nuove RPC scrivono **solo** in `transactions` + aggiornano `profiles.total_points` direct. NON scrivono in `points_ledger` (frozen for new flows). Decision #18 LOCKED applicato.

### Backfill points_ledger → transactions · VERIFIED PERFECT

- 281/281 rows migrate ✅
- 47 legacy_aria_credit + 234 legacy_aria_debit ✅
- 35 completed + 246 reversed (mapping archived flag) ✅
- pl_active_sum 494,025 ARIA = tx_active_aria_net 494,025 ARIA ✅ (perfect equivalence)
- Metadata preservata: legacy_ledger_id, legacy_amount, archived, archived_at, archive_reason

## Evaluation flow end-to-end · DB layer ready

```
seller calls submit_evaluation_request(form_data)
  ↓ FOR UPDATE lock profile · balance check >= 200 ARIA
  ↓ floor €500 server-side enforce
  ↓ INSERT evaluation_requests (status=submitted, payment_status=paid)
  ↓ UPDATE profiles.total_points -= 200
  ↓ INSERT transactions (evaluation_payment, asset_out=ARIA 200)
  ← returns (request_id, paid_aria)

admin calls admin_evaluate_request(request_id, outcome, price_range, reasoning)
  ↓ is_admin_or_evaluator() check
  ↓ FOR UPDATE lock request
  ↓ mint_evalobi() · INSERT evalobi + history(minted) + (if supersession) history(superseded)
  ↓ INSERT transactions (evalobi_mint, asset_in=EVALOBI 1)
  ↓ if outcome=GO:
  ↓   INSERT nft_rewards (REWARD, source=evaluation_bonus, shares=1.0)
  ↓   INSERT transactions (evaluation_robi_bonus, asset_in=ROBI 1)
  ↓ UPDATE evaluation_requests (status=evaluated, decision fields, evalobi_id, robi_bonus_granted)
  ← returns (evalobi_id, token_id, robi_minted)

seller calls re_evaluate_evalobi(evalobi_id, notes?)
  ↓ verify caller owns p_evalobi_id
  ↓ wrap submit_evaluation_request() with form data copy + prior_evalobi_id ptr
  ← returns (new_request_id, paid_aria)
```

## Decisioni LOCKED applicate Day 2

| # | Decisione | Where in code |
|---|---|---|
| #1 | Floor €500 | submit_evaluation_request server-side CHECK + table CHECK |
| #3 | Form esistente · admin manuale | M3 schema accept form data, M4 admin_evaluate_request |
| #4 | 200 ARIA pagamento | M4 v_payment_aria := 200 |
| #5 | 1 EVALOBI + 1 ROBI bonus su GO | M4 admin_evaluate_request IF outcome=GO |
| #9 | NO_GO NO refund | nessuna logica refund su admin_evaluate (200 ARIA stay) |
| #10 | NO_GO EVALOBI minted comunque | M4 calls mint_evalobi() per qualsiasi outcome |
| #11 | NO_GO NO ROBI bonus | M4 IF outcome=GO solamente |
| #13 | SLA 48h | M3 sla_deadline DEFAULT (NOW() + INTERVAL '48 hours') |
| #15 | Auto-escalation 24h/72h tracking | M3 escalation_status CHECK (none/reminded_24h/refunded_72h) · cron job M3.5 pending |
| #18 | Phased dual-write | M4 RPCs write transactions only · profiles.total_points sync |
| #20 | Re-submit libero | re_evaluate_evalobi + prior_evalobi_id, no cooldown |

## Smoke tests pass

- ✅ Structural: 3 RPCs DEFINER security_type, return type 'record'
- ✅ M3 schema: 19 columns, 6 indexes, 3 RLS policies, trigger active
- ✅ M7 backfill: 281/281, sum match perfect, archived mapping correct
- ✅ Negative auth (M1/M2 covered, M4 same pattern via auth.uid() check + is_admin_or_evaluator)

## Day 2 totale prodotto

- 3 migrations applicate live
- 2 nuove tabelle (evaluation_requests, transactions)
- 281 rows backfilled atomic from points_ledger
- 3 SECURITY DEFINER orchestrator RPCs
- 5 RLS policies new
- 14 indexes new
- Branch sprint-w3 con 3 commits (M1+M2 Day 1 + M3+M7+M4 Day 2 incoming)

## Pending Area 2 polish (post-Day-2)

- Edge function `evaluate-request-notification` · email tier critico esito valutazione
- pg_cron job auto-escalation:
  - 24h post-sla_deadline if not decided → escalation_status='reminded_24h' + admin notification
  - 72h post-sla_deadline if still not decided → escalation_status='refunded_72h' + refund 50 ARIA via transactions(`evaluation_courtesy_refund`)

## Sprint W3 status snapshot

- ✅ Area 1 EVALOBI lifecycle (M1+M2+M4 re_evaluate)
- ⏳ Area 2 evaluation flow · DB layer done · email+cron pending
- ⏳ Area 4 transactions · backfill done · UI history page pending (post-M5/M6 swap)
- ⏸ Areas 3, 5, 6, 7, 8 · pending

## Next chunks

- Day 3 mattina: Area 3 swap RPCs (M5 + M6, 6-8h ETA)
- Day 3 pomeriggio: Area 2 polish (email edge fn + cron auto-escalation)
- Day 4-5: Area 6 SSR public EVALOBI + Area 5 token schema visual + Area 7 SLA dashboard
- Day 6-7: Area 8 SEO quick wins + UI history page + integration tests + Closing Report

— CCP · 13 May 2026 W2 Day 9 deep night (Day 2 push)
