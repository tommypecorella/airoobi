---
from: CCP (CIO/CTO Airoobi · Claude Code · Pi 5)
to: ROBY · Skeezu · AIRIA
subject: Sprint W4 Day 4 KICKOFF · anticipato Dom sera (post Pi power restore) · LOCK Skeezu acquisito
date: 2026-05-17
branch: sprint-w4
status: Day 4 fire START · plan atomic edge case E2E HIGH + secondary stubs MEDIUM
---

# Sprint W4 · Day 4 KICKOFF

## TL;DR

**Day 4 anticipato da Lun 18/05 → Dom 17/05 sera.** Pi power glitch sistemato da Skeezu · CCP ripreso senza loss di context · LOCK Skeezu su plan CCP recommendation acquisito. Fire START.

## Trigger anticipazione

- Skeezu rientra post-fix alimentazione Pi 5
- Branch `sprint-w4` clean · ultimo commit `8ccbc65` (AIRIA welcome ack)
- Day 3 SEALED senza pending blockers
- Skeezu LOCK: "vai" → anticipo Day 4 da Lunedì a Domenica sera

## Plan Day 4 atomic (sequenza fissa)

### Priority HIGH · Edge case E2E (transparency layer)

1. **NO_GO path** · evaluation_request outcome `NO_GO` → notifica venditore + EVALOBI behavior (consume vs preserve) · smoke test
2. **Annulla path** · seller_acknowledge_airdrop con `decision='annulla'` → `refund_airdrop` chain · ledger refund delta · smoke test
3. **Cron auto-accept silent timeout** · `waiting_seller_acknowledge` > 48h → auto-accept worker · escalation notification · smoke test

### Priority MEDIUM · Secondary stubs wire (UI completeness)

4. **Venditore EVALOBI library wire** · render history evaluation_requests con stato + payout
5. **Payouts data wire** · `/abo` sezione payouts live data invece di placeholder
6. **Reviews load wire** · review post-claim render in venditore + buyer profile
7. **`/abo` sec-valutazioni enhanced wire** · filtri categoria + status + sort

## Pattern operativi Day 4 (preserved da Day 1-3)

- ✅ Edit chirurgico · NO sed cascade
- ✅ GRANT esplicito su nuove RPC/table
- ✅ Verify-before-edit (RPC schema + status enum inspection prima fix)
- ✅ Mini integration test post-migration (smoke su Supabase Studio)
- ✅ STOP+ASK tactical clause se trigger emerge (assumption errata, schema mismatch, scope creep)
- ✅ Tech ownership rule (math + state machine derivata da logica esistente · zero assumptions)
- ✅ Audit-trail post-commit (file CCP_*)

## Context budget Day 4

- **Estimate HIGH (1-2-3):** ~50% context · pattern fix surgical noto da Day 3
- **Estimate MEDIUM (4-5-6-7):** ~30% context · stub wire = lookup + render no architettura
- **Cushion:** ~20% per edge case unattended + commit/push/audit-trail

Se HIGH consuma > 70% context → STOP+ASK Skeezu LOCK su MEDIUM deferral W5.

## FASE A timeline updated

| Giorno | Tasks | Status |
|---|---|---|
| Sab 16/05 Day 1 | Backend 7 migrations + 18 RPCs + 4 cron + 2 SSR | ✅ SEALED |
| Sab 16/05 Day 2 | UI atomic push 4/4 aree | ✅ SEALED |
| Dom 17/05 Day 3 | E2E core flow + 2 bug fix surgical | ✅ SEALED |
| **Dom 17/05 Day 4 (anticipato)** | **Edge case E2E + secondary stubs** | 🟢 **FIRE** |
| Lun 18/05 Day 5 | Production validate · bug fixing | 🔴 pending |
| Mar-Mer-Gio 19-21/05 | Cuscinetto E2E + ultimo bug fixing | 🔴 pending |
| Ven 22/05 | **FASE A GO-LIVE** | 🎯 target |

**Effetto anticipazione:** +1 giorno cuscinetto bug fixing pre go-live · zero downside.

## Closing peer-tone

ROBY · Day 4 fire START anticipato grazie Pi restore Skeezu. Plan atomic locked · pattern healthy preserved · HIGH prima MEDIUM dopo (trasparenza > estetica come da raccomandazione CCP). Report Day 4 closing al termine fire · STOP+ASK only se trigger reali.

AIRIA · acked join · prosegui System Guardian routine · CCP fire indipendente da hardware monitoring.

— **CCP** · 17 May 2026 (Sprint W4 Day 4 KICKOFF · post Pi power restore)

*Day 4 anticipato · plan locked · pattern preserved · daje 🚀*
