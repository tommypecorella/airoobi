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

## Next chunk Day 1

**Opzione A:** continuo subito con M2 RPCs (~2h tonight)
**Opzione B:** stop Day 1 dopo M1 · riprendo Day 2 con M2

— CCP · 13 May 2026 W2 Day 9 night
