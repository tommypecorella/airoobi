---
from: CCP (CIO/CTO Airoobi · Pi 5)
to: ROBY · Skeezu
subject: Sprint W3 · Day 1 · Migration M1 EVALOBI table applied
date: 2026-05-13 W2 Day 9 night
branch: sprint-w3
status: M1 APPLIED · smoke test PASS · zero blocker
---

# Sprint W3 · Day 1 · M1 EVALOBI applied

Audit-trail post-commit per migration M1 (Area 1 · EVALOBI table + history + RLS + GRANT).

## Cosa è stato fatto

**Migration:** `20260513210519_w3_atto1_m1_evalobi_table.sql`
**Branch:** `sprint-w3` (creato today, tracking remote)
**Apply method:** MCP `apply_migration` su `vuvlmlpuhovipfwtquux`

### Schema applicato

**Table `public.evalobi`** · 22 colonne · 6 RLS policies · 5 indexes + 2 unique
- UUID PK + `token_id BIGINT IDENTITY UNIQUE` (Stage 2 on-chain mapping ready · approved Skeezu decisione #6)
- FK profile dual: `current_owner_id` (RESTRICT) + `original_seller_id` (RESTRICT) per historical
- Object metadata Livello B: title, brand, model, condition CHECK, year, category, photo_hashes JSONB
- Outcome: `evaluation_outcome` CHECK in (`GO`,`NO_GO`,`NEEDS_REVIEW`) · NO_GO architectural LOCKED decisione #10 (EVALOBI minted on all outcomes per pollution layer)
- Re-evaluation chain: `version INT DEFAULT 1` + `supersedes_evalobi_id` self-FK SET NULL
- Privacy controls: `public_visible BOOL DEFAULT TRUE`, `photo_blur_enabled BOOL DEFAULT FALSE`, `owner_redacted BOOL DEFAULT TRUE` (Area 6 pollution layer opt-out granular)

**Table `public.evalobi_history`** · 8 colonne · 3 RLS policies · 2 indexes + 1 unique
- Append-only event log per lifecycle (`minted`/`transferred`/`re_evaluated`/`superseded`/`airdrop_listed`/`airdrop_settled`)
- ON DELETE CASCADE da `evalobi` per cleanup atomico
- INSERT ONLY via SECURITY DEFINER RPCs (M2 next)

### RLS policies (9 totali)

| Tabella | Policy | Role | Logic |
|---|---|---|---|
| evalobi | Owner can read own | authenticated | `current_owner_id = auth.uid()` |
| evalobi | Original seller historical | authenticated | `original_seller_id = auth.uid()` |
| evalobi | Anon public visible | anon | `public_visible=TRUE AND outcome NOT NULL` |
| evalobi | Auth public visible | authenticated | `public_visible=TRUE AND outcome NOT NULL` |
| evalobi | Admin all | authenticated | `is_admin()` |
| evalobi | Owner update privacy | authenticated | `current_owner_id = auth.uid()` (only flags) |
| evalobi_history | Users own evalobi | authenticated | EXISTS owner/seller match |
| evalobi_history | Anon public evalobi | anon | EXISTS public_visible match |
| evalobi_history | Admin all | authenticated | `is_admin()` |

### GRANTs · Supabase Data API exposure

```sql
GRANT SELECT ON TABLE public.evalobi TO authenticated;
GRANT SELECT ON TABLE public.evalobi TO anon;
GRANT UPDATE (public_visible, photo_blur_enabled, owner_redacted) ON TABLE public.evalobi TO authenticated;
GRANT SELECT ON TABLE public.evalobi_history TO authenticated;
GRANT SELECT ON TABLE public.evalobi_history TO anon;
```

Compliance con Supabase default flip 30 Oct 2026 (memoria operativa `feedback_supabase_grant_on_create_table.md` rispettata).

## Smoke test PASS

Query verifica post-apply:
- `evalobi_exists`: 1 ✅
- `history_exists`: 1 ✅
- `evalobi_policies`: 6 ✅
- `history_policies`: 3 ✅
- `index_count`: 10 ✅
- `evalobi_auth_grant`: true ✅
- `evalobi_anon_grant`: true ✅

## Decisioni LOCKED applicate · M1 scope

- ✅ #6 Lifecycle permanente · trasferibile · re-evaluable (versioning columns)
- ✅ #10 NO_GO EVALOBI minted comunque (CHECK constraint accepts all outcomes)
- ✅ #17 Stack Vercel SSR canonical path · public_url generation deferred a M8 (Area 6 trigger ALTER)
- ✅ token_id BIGINT IDENTITY (Skeezu approved)

## Decisioni pending da M1 a M2 next

- M2 RPCs: `mint_evalobi(p_evaluation_request_id, p_outcome, p_price_range, p_reasoning, p_admin_id)` · `transfer_evalobi(p_evalobi_id, p_new_owner_id)` · `re_evaluate_evalobi(p_evalobi_id)`
- M2 inserisce in `evalobi_history` via SECURITY DEFINER (event_type='minted')
- M2 atomic: 200 ARIA debit + ROBI bonus mint + EVALOBI insert + history insert in single transaction

## Concerns / blockers

Nessuno. Schema applicato pulito, zero RLS conflict con tabelle esistenti, helper `is_admin()` riutilizzato (pattern consistent).

## Day 1 chunk 2 · M2 RPCs applied

**Migration:** `20260513211244_w3_atto1_m2_evalobi_rpcs.sql`
**Skeezu decision:** opzione A · continuato tonight

### M2 RPCs applicate (scope ridotto strategico)

- ✅ `mint_evalobi(p_seller_id, p_object_×7, p_outcome, p_price_range, p_reasoning, p_admin_id, p_evaluation_request_id?, p_supersedes_evalobi_id?)` → `RETURNS (evalobi_id UUID, token_id BIGINT)` · SECURITY DEFINER · admin-only via `is_admin()` · supersession chain auto-version
- ✅ `transfer_evalobi(p_evalobi_id, p_new_owner_id)` → `RETURNS UUID` · SECURITY DEFINER · current_owner OR admin · `FOR UPDATE` row lock
- ⏸ `re_evaluate_evalobi` · deferred a M4 (orchestratore evaluation_requests M3)

### Smoke tests M2

- ✅ Structural: pg_proc record DEFINER security_type · return types corretti (record / uuid)
- ✅ Negative auth (postgres role no JWT): `42501` raised correttamente · mensage `mint_evalobi: caller is not admin (auth.uid=<NULL>)`
- ⏸ Positive auth (CEO admin JWT): deferred a integration test Area 2/M4 frontend

### Atomicità garantita

- `mint_evalobi` · INSERT evalobi → INSERT history `minted` → (if supersession) INSERT history `superseded` sul vecchio · tutto in single transaction
- `transfer_evalobi` · FOR UPDATE lock → UPDATE owner → INSERT history `transferred`

## Sprint W3 Day 1 · totale prodotto

- 2 migrations applicate (M1 schema, M2 RPCs)
- 9 RLS policies attive
- 10 indexes
- 2 SECURITY DEFINER functions
- Branch sprint-w3 con 2 commits
- Zero blocker outstanding

## Next session (Day 2)

- M3 `evaluation_requests` table + RLS + GRANT
- M4 `submit_evaluation_request` + `admin_evaluate_request` + `re_evaluate_evalobi` orchestrators
- Email notification edge function (tier critico)
- Auto-escalation 24h post-SLA cron

— CCP · 13 May 2026 W2 Day 9 night
