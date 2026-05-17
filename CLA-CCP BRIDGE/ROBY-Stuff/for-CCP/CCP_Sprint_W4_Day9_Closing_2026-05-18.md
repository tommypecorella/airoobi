---
from: CCP (CIO/CTO Airoobi · Claude Code · Pi 5)
to: ROBY · Skeezu · AIRIA
subject: Sprint W4 Day 9 CLOSING · LOW polish + MEDIUM 1+2 done · 4 items chiusi · v4.21.0
date: 2026-05-18 mattina (Lun · Day 9 anticipato post Day 8)
branch: sprint-w4 → main MERGE FIRED
status: Day 9 SEALED · F1 OG cache-buster sweep · F3 alt text consistency · MEDIUM 1 story toggle UI · MEDIUM 2 ROBI bonus column · cuscinetto 3-4gg pre go-live preserved
---

# Sprint W4 · Day 9 CLOSING

## ACK (preambolo · ACK file separato omesso · Day 9 polish compact)

LOCK Skeezu+ROBY Day 9 recepito · priority order locked: LOW items polish FIRST (F1 cache-buster + F3 alt text) · MEDIUM 1+2 SECOND (story toggle + ROBI column). Standard STOP+ASK pattern attivo (blanket auth Day 8 spirato · re-enable solo se Skeezu autorizza esplicitamente).

Pre-fire recon:
- F1 scope reale = **21 file** (brief 7) · grep ha intercettato 5 file aggiuntivi con `v=4.13.5` (api/airdrop-ssr, api/evalobi-ssr, api/sla-ssr, tokens.html, vendi.html)
- F3 scope = 5 file (login + airdrop REPLACE inglese · dapp + signup INSERT alt · come-funziona-airdrop ADD full og:image block + alt)
- M1 RPC `update_airdrop_story_visibility` NON esisteva → migration nuova autorizzata dal brief MEDIUM 1
- M2 EVALOBI↔ROBI link FK assente · fallback match by title.lowercase (fragile · documentato)

## F1 · OG Cache-Buster Sweep (DONE)

Sweep `?v=4.13.0` e `?v=4.13.5` → `?v=4.20.0` su **21 file** (16 HTML con .0 + 2 HTML con .5 + 3 SSR con .5 + 1 retry treasury).

### Files updated
HTML (.0): airdrop, airdrops-public, blog, come-funziona-airdrop, contatti, dapp, diventa-alpha-brave, explorer, faq, home, investitori, landing, login, privacy, signup, treasury
HTML (.5): tokens, vendi
SSR (.5): api/airdrop-ssr.js, api/evalobi-ssr.js, api/sla-ssr.js

Edit chirurgico replace_all per file · zero sed cascade · post-sweep grep zero residue `v=4.13.*` su og-image URLs. CSS/JS cache-buster `?v=4.13.3` su altri asset NON toccati (out of F1 scope · OG only).

## F3 · OG image:alt Text Consistency (DONE)

Standardize on home.html canonical: `AIROOBI — Il primo marketplace dove vendere e ottenere è una skill.`

| File | Action |
|---|---|
| login.html | REPLACE inglese "Fair Airdrop Marketplace" → italiano canonical |
| airdrop.html | REPLACE inglese "Fair Airdrop Marketplace" → italiano canonical |
| dapp.html | INSERT og:image:alt after og:image:height |
| signup.html | INSERT og:image:alt after og:image:height |
| come-funziona-airdrop.html | ADD full og:image block (image + width + height + alt + locale + site_name) — file mancava og:image entirely |

Page-specific alts preserved (explorer.html "AIROOBI ARIA Explorer", venditore.html "AIROOBI · Dashboard Venditore", termini "AIROOBI · Termini e Condizioni", airoobi-cards "AIROOBI · Brand Cards", airoobi-explainer "AIROOBI · Come funziona") · non sovrascritti perché legittimo page-specific descriptor.

## MEDIUM 1 · Story Toggle UI Seller-Side (DONE)

### Backend (migration nuova · autorizzata da MEDIUM 1 brief)
File: `supabase/migrations/20260518100000_w4_day9_story_visibility_rpc.sql` (applied via MCP)

```sql
CREATE OR REPLACE FUNCTION public.update_airdrop_story_visibility(p_airdrop_id uuid, p_visible boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$ ... $$;

GRANT EXECUTE ON FUNCTION public.update_airdrop_story_visibility(uuid, boolean) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.update_airdrop_story_visibility(uuid, boolean) FROM anon;
```

Auth check: `auth.uid()` deve essere `submitted_by` o `created_by` dell'airdrop. Status check: solo `completed` o `annullato` (story esiste solo dopo finalizzazione/annullamento).

REVOKE anon esplicito per security pattern (feedback_supabase_grant_on_create_table) · function richiede auth.uid() comunque ma defensive.

### Frontend (venditore.html sec-airdrops)
- `loadAirdrops()` SELECT esteso con `story_public_visible, story_public_url`
- Nuova `renderAirdropAction(a)` decide cell content per status:
  - `waiting_seller_acknowledge` → link "→ Conferma" (preserved Day 4)
  - `completed`/`annullato` → toggle button "Storia ON/OFF" (gold/gray badge) + optional "→ vedi" link a story_public_url
  - other status → empty
- Nuova `toggleStoryVisibility(airdropId, currentVisible, btn)` chiama RPC + reload list

## MEDIUM 2 · ROBI Bonus Column venditore sec-evalobi (DONE)

### Schema check
- nft_rewards source='object_valuation' nft_type='VALUATION' shares (ROBI bonus)
- evalobi table HAS NO direct FK to nft_rewards
- Match strategy: title.lowercase fallback (metadata->>'title' su nft_rewards · object_title su evalobi)
- Fragile ma funzionale fino a W5 quando aggiungeremo `evalobi_id` a nft_rewards.metadata (TODO documented)

### Frontend (venditore.html sec-evalobi)
- `loadEvalobi()` esteso · parallel `Promise.all([evalobi fetch, nft_rewards source=object_valuation fetch])`
- Build `_evalobiRobiByTitle` map: aggregate shares per title.lowercase.trim
- `applyEvalobiFilter()` card render extended · nuova cella "ROBI bonus" mostra `+X.XX` (gold) se match · `—` (gray) altrimenti
- Title-match in JS (non DB-side · nft_rewards metadata struct already optimal per W4 pattern)

## Pattern operativi Day 9 · preserved

- ❌ NO sed cascade · 26+ edit chirurgici (21 F1 + 5 F3 + 4 M1+M2)
- ✅ GRANT preserved · 1 migration NUOVA · GRANT authenticated + REVOKE anon esplicito
- ✅ Verify-before-edit · 14 file Read pre-edit · schema check su evalobi + nft_rewards + airdrops.story_*
- ✅ STOP+ASK semi-triggered M1 (migration nuova) ma autorizzato dal brief MEDIUM 1 esplicito
- ✅ Audit-trail post-commit `CCP_Sprint_W4_Day9_*.md`
- ✅ Mini integration test · syntax check venditore.html inline JS OK · grep post-sweep zero residue · RPC GRANT verify
- ✅ Tech ownership · enhance existing functions (loadAirdrops + loadEvalobi) · zero rebuild
- ✅ Pre-commit BANNED terms smoke · zero hits ("maratona/race/agonismo/runner/champion")
- ✅ Footer bump alfa-2026.05.**18**-**4.21.0** (home.html + dapp.html · data bumped a Lun 18/05 per Day 9)

## Context budget Day 9 actual

| Window | Estimate | Actual |
|---|---|---|
| ACK preamble + tasks setup + recon | 5% | 5% |
| F1 OG cache-buster sweep 21 file | 15% | 8% (parallel Edits) |
| F3 alt text 5 file | 8% | 5% |
| M1 RPC migration + UI venditore sec-airdrops | 25% | 18% |
| M2 ROBI column venditore sec-evalobi | 20% | 12% |
| Closing + commit + merge + push | 10% | ~7% |
| **Cushion residue** | 17% | **~45%** |

Day 9 efficiency: -33% context vs estimate · parallel batch Edits + MCP apply_migration in-session + zero rework.

## FASE A timeline post-Day 9

| Day | When | Status |
|---|---|---|
| Day 1-8 | Sab-Dom 16-17/05 | ✅ SEALED |
| Day 9 LOW polish + MEDIUM 1+2 | **Lun 18/05 mattina (anticipato)** | ✅ **SEALED** |
| Day 10 emergent fix + UAT prep | Mar 19/05 | 🔴 buffer |
| UAT prep finale | Mer 20/05 | 🔴 prep |
| **UAT finale joint** | **Gio 21/05** | 🔴 ROBY + Skeezu joint (UAT script Day 5 riuso) |
| **FASE A GO-LIVE** | **Ven 22/05** | 🎯 soft launch target |

**Cuscinetto 3-4gg preserved** · 4 deliverable Day 9 atomic · F1+F3 cleanup pre-UAT + MEDIUM 1+2 feature seller-side ready · zero rush forced.

## Numeri operativi Day 9

| Metric | Value |
|---|---|
| Items completati Day 9 | 4 (F1 + F3 + M1 + M2) |
| Files edited | 26+ (21 F1 + 5 F3 + venditore.html 4 edits M1+M2 + home.html footer + dapp.html footer + 1 migration NEW) |
| Lines changed | ~120 (F1 21 line-replacements · F3 ~15 lines · M1 ~50 lines · M2 ~25 lines · footer 2 lines) |
| Migrations applied | 2 (story_visibility_rpc + revoke_anon defensive) |
| RPCs added | 1 (update_airdrop_story_visibility) |
| Schema lookups verify-before-edit | 4 (airdrops.story_*, nft_rewards source DISTINCT, evalobi schema, function privilege check) |
| Syntax checks post-edit | 1/1 OK (venditore.html inline JS) |
| Shallow code introduced | 0 |
| Skeezu LOCK violated | 0 |
| BANNED terms smoke hits | 0 |
| **Validation point** | **27°** |

## Concerns Day 9 → Day 10

### Day 10 buffer candidates (LOW · NOT FASE A blocker)

1. /storie-vincitori pagination jump-to-page (oltre prev/next existing)
2. Schema.org ItemList breadcrumb /storie-vincitori → /storie-vincitori/{category}
3. Claim address modal flow (currently CTA only · no modal yet)
4. Atto 6 share preview OG image dynamic per /storie-vincitori/:id (currently fallback og-image.png · richiede edge function generator)

### TODO W5+ documented

- Add `evalobi_id` to nft_rewards.metadata at issuance time → enable clean per-row ROBI bonus match in venditore sec-evalobi (M2 currently uses title.lowercase fallback · fragile su edge cases es. evalobi v2 superseding · OK Alpha 0)
- F7 process-auto-buy auth model consolidation · attualmente `--no-verify-jwt` workaround Day 8 · pulizia: aggiungere `service_role_key` a vault.secrets oppure refactor a per-function key

### Out-of-scope Day 9 (preserved)

- W5 cutover dual-write (PL drop) · post FASE A
- Stripe `buy_aria_eur` · W5+
- KAS rate oracle pg_net cron · W5+
- 380px runtime UAT validation (Gio 21/05)

## Closing peer-tone

ROBY · Day 9 LOW polish + MEDIUM atomic Lun mattina · 4 deliverable chiusi in single session (F1 cache-buster 21 file · F3 alt text 5 file · M1 story toggle UI con RPC + GRANT/REVOKE · M2 ROBI bonus column con title-match fallback documentato W5). Pre-UAT Gio 21/05 prod allineata su tutti i fronti polish + seller-side feature complete. Cuscinetto 3-4gg preserved · Day 10 Mar libero per emergent fix + UAT prep + LOW Day 10 candidates se budget.

Skeezu · `sprint-w4` v4.21.0 bumped (footer data Lun 18/05) · merge to main fired stessa session · Vercel Production deploy aligned. Migration 20260518100000 applied DB + file local source-of-truth. Story toggle UI live · seller può opt-out story_public_visible per privacy (completed/annullato airdrops). ROBI bonus column shows per-EVALOBI bonus con fallback match by title · TODO W5 evalobi_id linkage documented.

AIRIA · `AIRIA_SysReport_Pre_Day10_*.md` Mar mattina suggested · Pi health post 9gg consecutivi sprint W4 fire (Sab 16 → Lun 18 inclusive) · cron + edge function cycle observation post-Day-8-fixes (process-auto-buy now active, monitorare 15-min firing succ rate).

Daje Day 9 SEALED · 4 items + 1 RPC nuova · cuscinetto preserved · UAT Gio + GO-LIVE Ven 22/05 con feature COMPLETE + production audit clean + brand pollution share viral layer complete + seller-side privacy control 🚀

— **CCP** · 18 May 2026 mattina (Sprint W4 Day 9 SEALED · v4.21.0 · 4 items + RPC migration nuova)

*Day 9 anticipato + SEALED · LOW polish + MEDIUM 1+2 atomic · 27° validation · cuscinetto 3-4gg preserved · daje*
