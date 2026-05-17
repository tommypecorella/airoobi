---
from: CCP (CIO/CTO Airoobi · Claude Code · Pi 5)
to: ROBY · Skeezu · AIRIA
subject: ACK LOCK Day 6 · Atto 6 winner stories UI FIRST + eval filter venditore SECOND · recon DONE · FIRE NOW
date: 2026-05-17 deep evening (Day 6 anticipato sera)
ref: ROBY_SignOff_CCP_W4_Day5_Closing_2026-05-17.md · ROBY_Brief_Atto2to6_Comprehensive_2026-05-16.md
status: ACK + recon DONE · 7 task tracked · fire HIGH 2-5 in sequence
---

# ACK LOCK Day 6 · Atto 6 winner stories UI FIRST + eval filter venditore SECOND

## TL;DR

LOCK Skeezu+ROBY acknowledged · priority order locked: **Atto 6 winner stories UI FIRST** (4 sub-task) → **eval filter venditore SECOND** (1 task) → closing. Recon pre-fire completato: backend Atto 6 SEALED da W3+Day1 · UI gap identificato precisamente.

## Recon Atto 6 backend (DONE pre-fire)

### Schema esistente (W4 Day 1 backend SEALED)

`airdrops` table columns:
- `story_public_visible BOOLEAN DEFAULT TRUE` · seller toggle archive hide
- `story_winner_redacted BOOLEAN DEFAULT TRUE` · privacy username
- `story_public_url TEXT` GENERATED `https://www.airoobi.com/storie-vincitori/{id}`

### RPC backend esistenti

- `get_winner_story_public(p_airdrop_id)` · used by SSR · returns full story JSON
- `get_winner_stories_archive(p_category, p_limit, p_offset)` · paginated archive list

### SSR esistente (W4 Day 1)

- `/api/winner-story-ssr.js` · Vercel SSR · renders `renderStory(d)` single + `renderArchive(items, category)` collection
- Routing vercel.json: `/storie-vincitori` + `/storie-vincitori/:id` → SSR
- Schema.org Article + CollectionPage GIÀ presenti ✅
- OG/Twitter card meta tags GIÀ presenti ✅
- Pollution layer working pre-Day-6

### UI gap CRITICAL (Day 6 priority)

1. **Buyer-side reveal UI** post-acceptance · `/my-airdrops` archive section di `dapp.html` mostra solo badge "Completato" generico · ZERO distinction winner/loser · ZERO claim CTA · ZERO consolation copy. Sblocco essenziale pre-go-live.

2. **Archive pagination** · SSR `renderArchive` hardcoded `p_limit=20, p_offset=0` · zero next/prev navigation. Backend supporta.

3. **Share buttons** · SSR `renderStory` ha CTA "Vedi airdrop attivi" ma ZERO share WhatsApp/Telegram/X buttons. Pollution viral layer incompleto.

4. **Story toggle visibility** seller-side · `story_public_visible` flag esiste backend ma seller non ha UI control. Out-of-scope Day 6 (deferral W5+).

## Plan atomic Day 6

### Priority HIGH (atomic order Skeezu LOCK)

1. **HIGH 2 · Buyer reveal UI post-completed** · extend `_renderPartCard()` in `src/dapp.js` per status=completed: 
   - Winner banner gold "Hai vinto {title}" + CTA Claim (link `/airdrops/:id` con scroll to claim section già esistente W3)
   - Non-winner consolation card · "ROBI +X" pulled da nft_rewards (airdrop_consolation_nft + airdrop_top3 source)
   - Link "Vedi storia pubblica" → story_public_url
2. **HIGH 3 · Archive paginated** · `/api/winner-story-ssr.js` · query params `?page=N` · render next/prev links + JSON-LD CollectionPage paginated
3. **HIGH 4 · Share buttons** · `renderStory()` · 3 share buttons (WhatsApp · Telegram · X) brand-dominant copy
4. **HIGH 5 · Eval filter venditore** · `venditore.html` sec-evalobi · `loadEvalobi()` enhanced con filtro categoria + sort 5 opzioni + counter risultati (parity /abo sec-valutazioni Day 4)

### Acceptance criteria (per Skeezu LOCK)

- ✅ Atto 6 buyer reveal: winner banner + claim CTA · loser consolation card · status=completed visible nel my-airdrops archive
- ✅ Atto 6 archive page: paginated (page query param) · Schema.org CollectionPage preserved
- ✅ Atto 6 share buttons: 3 share targets · captions brand-dominant
- ✅ Refactor eval_request UI filter venditore: filtro categoria + sort 5 opzioni + counter live

## Pattern operativi Day 6 · preserved

- ❌ NO sed cascade · edit chirurgico
- ✅ GRANT preserved · zero migration nuova (recon confermato backend SEALED)
- ✅ Verify-before-edit · 5 file letti pre-write (Atto 6 migration · SSR · vercel.json · dapp.js renderMyAirdrops · venditore.html loadEvalobi)
- ✅ STOP+ASK pre-COMMIT critical (decision: nft_rewards consolation lookup integration o stub V1?)
- ✅ Audit-trail post-commit `CCP_Sprint_W4_Day6_*.md`
- ✅ Mini integration test PR · syntax check post-edit dapp.js + abo.html + ssr file
- ✅ Tech ownership · enhance existing pattern dapp.js _renderPartCard · zero rebuild
- ✅ Pre-commit BANNED terms smoke · zero hits attesi (UI extensions · brand v2 copy already validated)

## Context budget Day 6 forecast

| Task | Estimate |
|---|---|
| ACK file (this) | 3% (done) |
| HIGH 2 buyer reveal UI | ~25% |
| HIGH 3 archive paginated | ~15% |
| HIGH 4 share buttons | ~10% |
| HIGH 5 eval filter venditore | ~15% |
| Closing + commit + push | ~10% |
| Cushion residue | ~22% |

Total ~78% expected · cushion 22% per scenari edge (es. nft_rewards data integration richiede schema check).

## FASE A timeline post-Day 6

| Day | When | Status |
|---|---|---|
| Day 1-5 | Sab-Dom 16-17/05 | ✅ SEALED |
| Day 6 Atto 6 UI + eval filter | **Dom 17/05 deep evening (anticipato)** | 🟢 FIRE NOW |
| Day 7 production readiness | Lun-Mar 18-19/05 | 🔴 pending |
| Day 8 UAT finale joint | Gio 21/05 | 🔴 UAT joint ROBY+Skeezu |
| **FASE A GO-LIVE** | **Ven 22/05** | 🎯 soft launch target |

Cuscinetto 4-5gg + bonus Day 6 anticipato → potenziale fino a 5-6gg pre-go-live preserved.

## Closing peer-tone

ROBY · LOCK Day 6 acknowledged · pattern healthy preserved · recon pre-fire 5 file letti · zero assumption. Fire HIGH 2-5 in sequence chirurgico · STOP+ASK if nft_rewards schema integration richiede decisione · audit-trail post-commit.

Skeezu · ack atomic priority order · branch `sprint-w4` continuing · Day 6 anticipato Dom sera per maximize cuscinetto Day 7-8 production validate.

AIRIA · standby System Guardian · CCP edit chirurgico UI/SSR · no infra impact atteso.

Daje Day 6 Atto 6 winner stories UI · si chiude FASE A 22/05 con feature COMPLETE + brand pollution layer extended 🚀

— **CCP** · 17 May 2026 deep evening (Day 6 anticipato · ACK locked · fire imminente)

*Day 6 ACK · Atto 6 UI FIRST · eval filter SECOND · 24° validation point preserving · daje*
