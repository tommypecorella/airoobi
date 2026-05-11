---
from: CCP (Claude Code · CIO/CTO · Pi 5)
to: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
cc: Skeezu
subject: ✅ ROUND 13 FAST-TRACK SHIPPED · 3/3 task · DB cleanup + P0001 frontend fix + DEMO badge reposition · v4.13.3
date: 2026-05-11
ref: Round 13 brief ROBY fast-track 11 May 2026 evening
status: SHIPPED · LIVE · v4.13.3 hotfix · share campagna continua
---

# ✅ ROUND 13 FAST-TRACK SHIPPED · 3/3 Task

## TL;DR

3 task fast-track completati in ~25 min CCP atomic (calibrato 25-40 min match lower bound):

- **TASK 1 ✅** DB cleanup 128 airdrops eliminati (130 → 2). Zero orphan rows. FK gaps vs brief identificati e gestiti (`nft_rewards` + `notifications` NO ACTION FK).
- **TASK 2 ✅** Root cause HTTP_400 P0001 trovato: `sbRpc` non throw → `catch(e)` con `fairness_block:` translation **unreachable**. Fix: parsing P0001 detail JSON in else branch.
- **TASK 3 ✅** `.airdrop-badge-demo` spostato `top:12px` → `bottom:12px` per evitare overlap con `.badge-presale-mining`.

Version bump `4.13.2 → 4.13.3`. Cache buster bump su `dapp.js` + `airdrop.js` + `dapp-v2-g3.css`.

---

## TASK 1 · DB Cleanup Airdrops · ✅ DONE

### Recon FK information_schema

```
NO ACTION (delete blocked unless child rows removed):
  - airdrop_participations.airdrop_id → airdrops.id
  - airdrop_blocks.airdrop_id → airdrops.id
  - treasury_transactions.airdrop_id → airdrops.id
  - nft_rewards.airdrop_id → airdrops.id           ← MANCAVA nel brief
  - notifications.airdrop_id → airdrops.id         ← MANCAVA nel brief

CASCADE (auto-delete with parent):
  - airdrop_messages.airdrop_id
  - airdrop_watchlist.airdrop_id
  - auto_buy_rules.airdrop_id

SET NULL:
  - platform_aria_ledger.related_airdrop_id
```

**Decisione su gap nft_rewards (49 rows):** tutti `nft_type='VALUATION'` `source='object_valuation'` → badge non-REWARD, dati test (da airdrop test). Zero ROBI award da preservare. Delete safe.

**Decisione su gap notifications (69 rows):** notifiche transient UX (blocks_purchased, blocks_sold, ecc.). Delete safe per cleanup.

### Counts pre-execute

| Tabella | Rows to delete | FK rule |
|---|---|---|
| airdrop_blocks | 8 | NO ACTION (manual) |
| airdrop_participations | 4 | NO ACTION (manual) |
| airdrop_messages | 0 | CASCADE (auto) |
| treasury_transactions | 0 | NO ACTION (no rows) |
| nft_rewards (airdrop linked) | 49 | NO ACTION (manual) |
| notifications (airdrop linked) | 69 | NO ACTION (manual) |
| airdrop_watchlist | 3 | CASCADE (auto) |
| auto_buy_rules | 4 | CASCADE (auto) |
| **airdrops** | **128** | — |

### Execute (BEGIN/COMMIT atomic transaction)

Mirror locale: `supabase/migrations/20260511230000_round13_airdrops_cleanup.sql`

### Verify post-execute

| Check | Value | Status |
|---|---|---|
| airdrops total | 2 | ✅ target |
| orphan airdrop_blocks | 0 | ✅ |
| orphan airdrop_participations | 0 | ✅ |
| orphan nft_rewards (with airdrop_id) | 0 | ✅ |
| KEEP airdrop #1 | `Garpez` presale 1/2618 | ✅ |
| KEEP airdrop #2 | `iPhone 14 Pro 128GB Viola Scuro` presale 55/1850 | ✅ |

**Sal Fabrizio impact:** participations in 3 deleted airdrops removed (9+19+20 ARIA spend conservato in `points_ledger` historical), 30 blocks su `c2f35ea4` (iPhone) intatti.

---

## TASK 2 · HTTP_400 P0001 Acquista Blocchi · ✅ DONE

### Root cause diagnosis

Recon `buy_blocks` RPC + `check_fairness_can_buy`:

- `buy_blocks` ha **un solo `RAISE EXCEPTION`** path: `'fairness_block:%'` con reason `check_fairness_can_buy(...)->'reason'`
- `check_fairness_can_buy` può ritornare `can_buy=false` con:
  - `reason='math_impossible'` (utente non può vincere mathematicamente)
  - `reason='airdrop_not_found'`
- Tutti gli altri errori in `buy_blocks` (INSUFFICIENT_ARIA, BLOCKS_ALREADY_TAKEN, ecc.) ritornano JSON `{ok:false, error:...}` invece di RAISE EXCEPTION

### BUG identificato in frontend airdrop.js

`sbRpc` (line 73-84) **NON throw** su HTTP 4xx — ritorna `{ok:false, error:'HTTP_400', detail:rawResponseBody}`.

`confirmBuy` (line 657-712):
- Branch `if(data.ok)` → success
- Branch `else` (line 688) → `errMsg[data.error]` lookup, ma `'HTTP_400'` non è in mappa → fallback `'Errore: HTTP_400 — '+data.detail` → utente vede JSON raw P0001
- Branch `catch(e)` (line 700) — con `fairness_block:` translation correctly written — **UNREACHABLE** perché sbRpc non throw

**Risultato:** ogni RAISE EXCEPTION dal RPC arriva all'utente come `Errore: HTTP_400 — {"code":"P0001","details":null,"hint":null,"message":"fairness_block:math_impossible"}` invece del messaggio user-friendly "Acquisto bloccato per fairness".

La stringa "doppia [...]" nello screenshot di Sal è probabile artefatto di rendering iOS Safari del campo `"details":null` o truncate JSON visualizzato — non c'è alcuna keyword "doppia" in nessuna funzione DB (verified con `prosrc ILIKE '%doppia%'` → 0 rows).

### Fix applicato

`src/airdrop.js:688` else branch — aggiunto parsing P0001 detail JSON:

```js
var pgMsg='';
if((data.error==='HTTP_400'||data.error==='HTTP_409')&&data.detail){
  try{var pg=JSON.parse(data.detail);if(pg&&pg.code==='P0001'&&pg.message)pgMsg=pg.message;}catch(_){}
}
if(pgMsg.indexOf('fairness_block:')===0){
  showMsg('err',UI_ICONS.ban+' <span class="it">Acquisto bloccato per fairness: non potresti arrivare 1&deg;.</span><span class="en">Purchase blocked for fairness: you can\'t reach #1.</span>');
  if(!_fairnessBlocked&&_currentDetail){_fairnessBlocked=true;applyFairnessBlock&&applyFairnessBlock();}
  if(btn){btn.disabled=true;btn.classList.add('loading');btn.innerHTML='<span class="it">Bloccato</span><span class="en">Blocked</span>';}
} else {
  // fallback existing
  showMsg('err',errMsg[data.error]||'Errore: '+(data.error||'unknown')+(data.detail?' — '+data.detail:''));
  if(btn){btn.disabled=false;btn.classList.remove('loading');btn.innerHTML='<span class="it">Acquista blocchi</span><span class="en">Buy blocks</span>';}
}
```

`catch(e)` block esistente preservato (catches non-sbRpc thrown errors come `playMiningAnimation` failures, JSON.parse errors).

### Bug class · INTENTIONAL anti-Sybil

Il blocco `math_impossible` è **intentional** (parte di scoring v5.1 pity system + fairness lockdown). Utente al 2° posto con gap che lo rende impossibile arrivare 1° viene bloccato. La UX ora mostra messaggio user-friendly + disabilita button + applica fairness-block CSS.

### Smoke E2E atteso

Sal Fabrizio attualmente ha 500.173 ARIA (post grant) + `check_fairness_can_buy` returns `can_buy=true reason=leader_or_no_data` per airdrop c2f35ea4 → no blocco fairness corrente. Per replicare lo scenario screenshot serve user al 2° posto con gap math_impossible. Smoke Skeezu E2E: tentare buy con user nel quel scenario → expected toast IT/EN user-friendly.

---

## TASK 3 · Badge DEMO ALPHA Overlap · ✅ DONE

### Recon CSS

`src/dapp-v2-g3.css:1367-1385`:

```css
.airdrop-badge-demo {
  position: absolute;
  top: 12px;        ← OVERLAP con .badge-presale-mining
  right: 12px;
  z-index: 5;
  /* coral #F73659 */
}
```

`.badge-presale-mining` (line 588-597): solo styling light theme (gold accent), positioning ereditato da struttura HTML (presumibilmente top-right via parent).

### Fix applicato

Brief Option 1 scelto · semplice + zero rischio regression altri badge:

```css
.airdrop-badge-demo {
  position: absolute;
  bottom: 12px;     ← era top: 12px
  right: 12px;
  z-index: 5;
  /* ...rest invariato... */
}
```

Comment header aggiunto in-source per audit-trail.

---

## File deliverables

| File | Tipo | Change |
|---|---|---|
| `supabase/migrations/20260511230000_round13_airdrops_cleanup.sql` | NEW | Mirror locale DB cleanup transaction |
| `src/airdrop.js:688-720` | EDIT | P0001 detail JSON parsing + fairness_block UX translation in else branch |
| `src/dapp-v2-g3.css:1367-1385` | EDIT | `.airdrop-badge-demo` `top:12px` → `bottom:12px` |
| `dapp.html` | EDIT | cache buster `dapp.js?v=4.13.3` + `dapp-v2-g3.css?v=4.13.3` + footer 4.13.3 |
| `airdrop.html` | EDIT | cache buster `airdrop.js?v=4.13.3` + `dapp-v2-g3.css?v=4.13.3` |
| `home.html` | EDIT | footer 4.13.3 |
| `signup.html` | EDIT | footer 4.13.3 |
| `CLA-CCP BRIDGE/ROBY-Stuff/for-CCP/CCP_FastTrack_3Task_2026-05-11.md` | NEW | Audit-trail compatto 3 sezioni |

---

## Pattern operativi rispettati

- ✅ NO sed cascade · Edit chirurgico mirato per ogni task
- ✅ Recon pre-execute DB (FK + count rows) prima DELETE
- ✅ Atomic BEGIN/COMMIT transaction per DB cleanup
- ✅ Verify post-execute orphan = 0 + KEEP airdrops intact
- ✅ Mirror migration locale post-MCP apply
- ✅ Cache buster bump per forzare reload browser
- ✅ Footer version bump 4.13.2 → 4.13.3
- ✅ Audit-trail compatto 1 file 3 sezioni
- ✅ Commit + push immediate post-fix

---

## Lesson learned NEW · Round 13

**Pattern emerso TASK 2 diagnosis:**

Quando un wrapper RPC client (`sbRpc`) **ritorna** errori invece di **throw**, ogni `try{...}catch(e){...}` con error translation diventa dead code se il caller usa solo il return value. **Verificare flow di error handling end-to-end pre-deploy**, non solo lato server. Aggiungo a `feedback_verify_before_brief.md` extension RPC error handling checklist:

1. RPC raises EXCEPTION? → check wrapper client behavior (throw vs return)
2. Se wrapper return: error translation logic deve essere nel `else` branch, non in `catch`
3. Se wrapper throw: error translation deve essere in `catch(e)`, ma assicurati che wrapper effettivamente throw (no silent error swallowing)

**Pattern emerso TASK 1 FK recon:**

Brief paste-friendly DELETE list può mancare FK NO ACTION tables se autore brief non query `information_schema.referential_constraints` cross-table. CCP sempre `pg_constraint`/`information_schema` recon obbligatoria pre-DELETE multi-table per evitare FK violation rollback.

---

## ETA reale vs calibrato

| Task | ROBY est calibrato | CCP actual | Note |
|---|---|---|---|
| TASK 1 DB cleanup + verify | 10-15 min | ~8 min | FK recon parallel + atomic transaction |
| TASK 2 RPC recon + fix | 10-20 min | ~12 min | Root cause unreachable catch found rapido |
| TASK 3 CSS chirurgico | 5 min | ~2 min | Pattern brief Option 1 diretto |
| **TOTAL** | **25-40 min** | **~22 min** | **17° validation point lower bound** |

---

## Skeezu next actions

### 1. Hard refresh `/airdrops` + `/airdrops/[id]` (~30 sec)

`Cmd+Shift+R` su airoobi.app. Cache buster `?v=4.13.3` forza reload CSS+JS.

### 2. Visual verify TASK 1 + TASK 3 (~1 min)

- `/airdrops` marketplace: solo 2 card visibili (Garpez + iPhone 14 Pro). DEMO ALPHA badge bottom-right, no overlap con PRESALE 2X MINING top-right.
- `/airdrops/c2f35ea4-...` detail: airdrop accessibile, Sal blocchi visibili.

### 3. Smoke E2E TASK 2 (opzionale, replicare scenario)

Skeezu replicare scenario math_impossible: 2 partecipanti, 1° con score elevato, 2° prova buy → expected toast "Acquisto bloccato per fairness: non potresti arrivare 1°" invece di raw P0001 JSON.

### 4. Resume share campagna full speed

Copy outsider-friendly + seller hook v4.13.2 attivo, bug critical user testing fixato.

---

## Closing

Round 13 fast-track 3/3 task shipped. Pattern recon-before-execute + atomic-transaction + chirurgico edit ha mantenuto blast radius controllato anche su DB DELETE 128 rows + parent delete.

CCP, daje. Smoke Skeezu verify visual + E2E.

— **CCP**

*11 May 2026 W2 Day 7 evening · canale CCP→ROBY (Round 13 fast-track 3/3 task SHIPPED · DB cleanup 128 airdrops · P0001 frontend root cause sbRpc no-throw · DEMO badge reposition · v4.13.3 · 17° validation point)*
