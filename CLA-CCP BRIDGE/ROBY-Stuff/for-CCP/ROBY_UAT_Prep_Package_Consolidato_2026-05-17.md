---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: Skeezu (Founder) · CCP (CIO/CTO Pi 5 standby) · AIRIA (System Guardian Pi 5)
subject: 🎯 UAT Prep Package CONSOLIDATO Day 13 · script atomic ROBY+Skeezu + bug list template + AIRIA Obs request + setup checklist · ready Gio 21/05 mattina
date: Dom 17 maggio 2026 sera (ROBY async tour de force)
output-files-companion: ROBY_UAT_Day5_Script_2026-05-18.md (base script · this consolidates + finalizes)
status: READY · UAT FINALE joint Gio 21/05 mattina · 4 giorni prep window Lun-Mer
---

# 🎯 UAT Prep Package CONSOLIDATO · Day 13 Gio 21/05

## TL;DR

Package consolidato pre-UAT FINALE joint ROBY+Skeezu Gio 21/05 mattina: timeline LOCKED · setup checklist · script atomic 17 ROBY buyer + 10 Skeezu seller + 5 joint + NEW Item J6 dynamic OG · bug list template P0/P1/P2/P3 · AIRIA Obs request 5 cross-check items.

## Timeline UAT FINALE LOCKED · Gio 21/05

| Window | Action | Owner |
|---|---|---|
| 07:50-08:00 | Wake-up · coffee · psychological prep · stretch | Skeezu |
| 08:00-08:15 | Pre-UAT setup (browsers · devtools · AIRIA SysReport Pre-Day13 CRITICAL) | Skeezu + AIRIA |
| 08:15-09:30 | UAT giro atomic (Skeezu seller + ROBY buyer · 2 browsers parallelo) | ROBY+Skeezu joint |
| 09:30-10:00 | Bug list compilation · `ROBY_UAT_Final_BugList_2026-05-21.md` (P0/P1/P2/P3 categorized) | ROBY+Skeezu joint |
| 10:00 | Paste RS Day 13 fix lampo a CCP | Skeezu |
| 10:00-15:00 | CCP fire P0+P1 fix aggressive · context bonus ~76% available | CCP autonomous |
| 15:00-16:00 | Re-validate post-fix · production smoke test final | ROBY+Skeezu joint |
| 16:00-17:00 | CCP closing Day 13 file · sign-off ROBY · prep Day 14 GO-LIVE | All |
| 17:00+ | Riposo · Skeezu prep soft launch comms Ven mattina | Skeezu |

## Pre-UAT setup checklist (Skeezu · 15 min)

### Browser setup
- [ ] Chrome browser principale · login dapp.html con account CEO (admin role) · `tommaso.pecorella+ceo@outlook.com`
- [ ] Chrome incognito o secondo profilo · 2° utente per simulazione buyer parallelo (Alpha Brave)
- [ ] DevTools aperti · tab Console + Network + Application (LocalStorage check)
- [ ] Tab pre-aperti:
  - airoobi.com (institutional)
  - airoobi.app/dashboard (dApp logged)
  - airoobi.app/proponi (seller flow start)
  - airoobi.com/abo (admin)
  - airoobi.app/venditore (seller dashboard)
  - airoobi.app/airdrops (public listing)
  - airoobi.com/storie-vincitori (Atto 6 archive)
  - airoobi.com/sla (SLA dashboard public)

### AIRIA coordination
- [ ] Skeezu ping AIRIA · request `AIRIA_SysReport_Pre_Day13_2026-05-21.md`
- [ ] AIRIA expected deliverable: Pi 5 RAM/disk/CPU temp · services health · 12 cron last run + success rate 24h · process-auto-buy stable post Day 8 fix verify
- [ ] AIRIA standby for `AIRIA_Obs_*` during UAT (cross-check items below)

### Test data prep (Skeezu side · Supabase Studio)
- [ ] Verify CEO ARIA balance sufficient (>500 ARIA per simulazione seller flow 200 ARIA paying)
- [ ] Verify CEO profile has Alpha Brave badge active (per buy_blocks participation simulation)
- [ ] Optional: insert test airdrop status=completed + winner_id=ceo (per simulazione winner reveal + claim modal flow)

### Recording (optional · for retrospective)
- [ ] Loom desktop app ready · session recording UAT giro (per CCP review post-fix · for memoria archive)
- [ ] OR screen recording via QuickTime/OBS (alternative free)

## 🛒 ROBY UAT Script · Buyer Flow + Live Evento UX (17 items detailed)

| # | Step | Pass criteria | Bug class if fail |
|---|---|---|---|
| 1 | Login dapp.html con second user (incognito) | Auth OK · profile loaded · Alpha Brave badge visible | P0 blocker |
| 2 | Navigate `/airdrops` listing public (non-loggato test simultaneous?) | Listing renders · grid airdrop cards · categoria filter dropdown | P0 blocker |
| 3 | Filter categoria dropdown applica | Filter applies · counter risultati updates · zero broken state | P1 high |
| 4 | Click airdrop detail · `/airdrops/:id` SSR | Page loads · OG meta visible (view-source) · Schema.org Product JSON-LD valid | P1 high |
| 5 | Live Evento UX scoreboard rendering top-10 | Scoreboard live · my position highlighted · esclusi/attivi counter Italian naming visible | P0 blocker |
| 6 | Scacco matto metric display | "Per superare leader: +X blocchi" · "Per scacco matto: +Y blocchi" · costo ARIA totale visible | P0 blocker |
| 7 | Italian naming Voice 04 BANNED smoke pre-check | "Esclusi · Attivi · scacco matto · Evento" visible · ZERO "maratona/race/agonismo/runner/champion" residue | P1 high |
| 8 | Countdown timer color shift | Gold default · orange ultime 24h · red ultima 1h | P2 medium |
| 9 | Buy 1 block · 15 ARIA debit | ARIA balance decrements visible · scoreboard update real-time (10s polling) | P0 blocker |
| 10 | Buy 5 blocks · 75 ARIA debit | Multi-buy works · participation row inserted in DB | P0 blocker |
| 11 | Check push T1 notification "sei stato superato" | Toast in-app appears · notifications table row inserted | P1 high |
| 12 | Check fairness guard (provocare lockdown · buy oltre limite) | P0001 error friendly message "Acquisto bloccato per fairness" · NOT raw JSON | P1 high |
| 13 | Navigate `/profilo/storico` | Transaction history table renders · my buy_blocks event visible · filter 24 categories functional | P1 high |
| 14 | Navigate `/profilo/preferenze` | Categoria toggle 10 cat + notify_all switch · save UPDATE profiles successful | P1 high |
| 15 | Save preferenze + reload page | Settings persist · category_preferences JSONB array saved · reload preserves state | P2 medium |
| 16 | Mobile responsive (Chrome DevTools mobile emulation 380px viewport) | Layout responsive · Live Evento UX visible · scoreboard scrollable · CTA buttons tappable | P2 medium |
| 17 | Cross-page navigation flow | dapp → /airdrops → :id → /profilo → back · zero broken links · breadcrumb coherent | P1 high |

## 🏪 Skeezu UAT Script · Seller Flow + Admin (10 items detailed)

| # | Step | Pass criteria | Bug class if fail |
|---|---|---|---|
| S1 | Submit proposta valutazione `/proponi` | Form 6+ fields submit · 4 photos upload · payment 200 ARIA debit + evaluation_request row inserted | P0 blocker |
| S2 | Admin `/abo` sec-valutazioni filter + sort | Filter categoria works · sort options (Data ↓ Data ↑ Quotazione ↓ ↑ Titolo A→Z) · counter risultati live | P1 high |
| S3 | Admin evaluate GO outcome | Click GO button · trigger admin_evaluate_request RPC · EVALOBI mint + ROBI bonus + notification inserted | P0 blocker |
| S4 | Admin evaluate NO_GO outcome | Click NO_GO button · EVALOBI mint con outcome flag · ZERO refund · ZERO ROBI bonus · public_url accessible (pollution layer) | P0 blocker |
| S5 | Seller venditore.html · EVALOBI library | Cards render with brand · model · condition · outcome badge · token_id · price range · evaluation date · public_url link share-friendly | P1 high |
| S6 | Admin publish airdrop · `/abo` sec-airdrops Pubblica button (Day 9 wire) | airdrops row insert via publish_airdrop_listing RPC · status → presale/sale · total_blocks computed via ceil(value × 1.333) | P0 blocker |
| S7 | Seller venditore.html · Payouts (Day 4 wire) | Live data render quota seller (67.99%) + treasury fondo + AIROOBI fee + ARIA raccolto + status badge | P1 high |
| S8 | Simulazione fine evento (cron detect_end_event trigger via SQL Studio backdate deadline) | Status transition `sale → waiting_seller_acknowledge` · push T1 seller notification | P0 blocker |
| S9 | Seller venditore.html · acknowledge tab ACCEPT button (24h SLA countdown visible) | seller_acknowledge_airdrop(accept) · execute_draw chain · status → completed · winner public reveal · payment split visible | P0 blocker |
| S10 | Buyer claim address modal flow (Day 10 wire) | Form shipping address apre modal · submit · airdrop_claims row inserted · push T1 seller "Vincitore ha richiesto consegna" | P1 high |

## 🤝 Joint Check (Both · 5 items + NEW J6)

| # | Step | Pass criteria | Bug class if fail |
|---|---|---|---|
| J1 | OG image rendering social share | Share URL su WhatsApp/Telegram · OG image preview rich con airdrop details · brand AIROOBI dominant | P1 high |
| J2 | Italian naming Voice 04 cross-check | Pre-commit smoke grep BANNED ("maratona/race/agonismo/runner/champion/vinci/perdi/lotteria") · LOCKED ("Evento/esclusi/attivi/scacco matto") | P1 high |
| J3 | Brand v2 visual consistency | Light theme · Inter font · Renaissance gold #B8893D · slogan "Un blocco alla volta" · NO regressions | P2 medium |
| J4 | Cross-canale navigation flow consistency | dapp ↔ venditore ↔ /abo (se admin) · zero broken links · breadcrumb coherent | P1 high |
| J5 | EVALOBI pollution layer URL accessible | airoobi.com/evalobi/{token_id} SSR public · indexable Google · QR code embedded · PDF link working | P2 medium |
| **J6 NEW (Day 12.5)** | Dynamic OG share preview check post-completed airdrop · `/api/og-story?id={real-id}` rendering preview unique con titolo + valore + categoria + slogan "Un blocco alla volta" | Vercel function log shows 200 PNG · preview rich su WhatsApp/Telegram/X share · NOT static fallback og-image.png | P1 high |

## Bug List Template `ROBY_UAT_Final_BugList_2026-05-21.md`

```markdown
---
from: ROBY + Skeezu (UAT joint compilation)
to: CCP fire fix aggressive Day 13 pomeriggio
date: 2026-05-21 W3 Day 6 Gio mattina (post UAT joint 08:15-09:30)
status: P0 X · P1 Y · P2 Z · P3 W identified · CCP fix priority order
---

# UAT Day 13 FINALE · Bug List · P0/P1/P2/P3 categorized

## P0 blocker (prevent FASE A go-live Ven 22/05 · MUST FIX prima paste RS · escalate Skeezu real-time se emerge)

### Bug #P0-1 · {title}
- **Step reproduce:** {steps numbered}
- **Expected:** {expected behavior}
- **Actual:** {actual behavior}
- **Screenshot/log:** {link Loom timestamp o screenshot file}
- **Console error (if any):** {JS error}
- **Network call (if relevant):** {RPC failed · status code · response body}
- **Suggested fix (if obvious):** {hint}
- **Effort estimate:** {ETA CCP fire}

## P1 high (degrades UX significantly · SHOULD FIX Day 13 pomeriggio)
[same template]

## P2 medium (noticeable but not blocker · NICE-TO-FIX se context budget)
[same template]

## P3 low (polish iteration W5+ · DEFER OK post-go-live)
[same template]

## UX/Copy/Perceived Value catches (NOT tech bugs · UX feedback)
[per ognuno: pagina/sezione · issue description · suggestion]

### UX-1 · {pagina/sezione}
- **Issue:** {what user perceives}
- **Suggestion:** {ROBY copy/Skeezu visual suggestion}
- **Priority:** {nice-to-have W5+ o blocker pre-go-live}

## Suggestions improvement non-blocker (W5+ iteration)
[per ognuno: feature suggestion · razionale · priority]

## Italian Voice 04 BANNED smoke residue findings
- File: {file_name} line {line_number} · term "{banned_term}" · context: {snippet}

## AIRIA cross-check findings (paste from AIRIA_Obs_* during UAT)
[paste reference]

## Production smoke test final (Skeezu+ROBY validate post-fix · 15 endpoint critical)
- [ ] `/` (home) · 200 ✅
- [ ] `/storie-vincitori` · 200 ✅
- [ ] `/sla` · 200 ✅
- [ ] `/api/winner-story-ssr` · 200 ✅
- [ ] `/api/sla-ssr` · 200 ✅
- [ ] `/api/og-story?id={real-id}` · 200 PNG ✅
- [ ] `/airdrops` (public listing) · 200 ✅
- [ ] `/profilo` (logged) · 200 ✅
- [ ] `/profilo/storico` · 200 ✅
- [ ] `/profilo/preferenze` · 200 ✅
- [ ] `/venditore` (logged seller) · 200 ✅
- [ ] `/abo` (admin) · 200 ✅
- [ ] mobile 380px responsive · OK ✅
- [ ] Italian Voice 04 BANNED smoke · zero hits ✅
- [ ] Brand v2 visual consistency · OK ✅

## CCP fire plan Day 13 pomeriggio (post bug list ROBY)
- P0 atomic fix prima (deve essere zero pre-go-live)
- P1 high aggressive (target 100% fix Day 13)
- P2 medium se context budget (target 50%+ Day 13 · rimanenti W5+)
- P3 low deferred W5+ (OK post-go-live polish)
- Re-validate post-fix · 15 endpoint smoke
- CCP closing Day 13 file · ROBY sign-off

## Day 14 GO-LIVE Ven 22/05 ready check
- [ ] Zero P0 outstanding
- [ ] P1 fixed or accepted with mitigation
- [ ] P2 fixed if budget · documented if deferred
- [ ] P3 documented W5+ backlog
- [ ] AIRIA SysReport Pre-Go-Live · Pi 5 stable
- [ ] Soft launch comms ready (share message template · pollution layer pages ready · social posts queued)
- [ ] Skeezu coffee pre-launch ☕
```

## AIRIA Obs Request · 5 cross-check items during UAT

@AIRIA · puoi durante UAT live giro Gio 21/05 mattina (parallel a Skeezu+ROBY hands-on):

### `AIRIA_SysReport_Pre_Day13_2026-05-21.md` (pre-UAT 08:00)
- Pi 5 RAM/disk/CPU temp/swap status
- Services health (OpenClaw gateway · Supabase REST · Vercel deploy)
- Cron 12/12 last run + success rate 24h (process-auto-buy stable post Day 8 fix verify)

### `AIRIA_Obs_BANNED_Terms_Audit_2026-05-21.md` (post-UAT 09:45)
- Grep BANNED terms ("maratona/race/agonismo/runner/champion") residue in:
  - venditore.html · abo.html · dapp.html · airdrop.html · home.html
  - src/live-evento.js · src/dapp.js
  - api/*-ssr.js · api/og-story.js
- Report any hits with file + line + context (ROBY refactor if found)

### `AIRIA_Obs_Italian_Voice_LOCKED_2026-05-21.md` (post-UAT 09:50)
- Verify LOCKED terms ("Evento · esclusi · attivi · scacco matto") used consistently UI
- Check brand v2 visual (light theme · Renaissance gold #B8893D · slogan "Un blocco alla volta")
- Report inconsistencies (page → element → expected → actual)

### `AIRIA_Obs_Production_SSR_Health_2026-05-21.md` (during UAT 08:30)
- Curl 7 SSR endpoint prod (home · storie-vincitori · sla · api/winner-story-ssr · api/sla-ssr · api/evalobi-ssr · api/airdrop-ssr)
- Response time + status code
- HTML render verify (Schema.org JSON-LD present)

### `AIRIA_Alert_*` real-time se Pi 5 RAM scende critical threshold during UAT
- Threshold: RAM free < 50 MB OR swap > 1.5 GB
- Notify ROBY + Skeezu immediato per pause UAT + Pi recovery action

## Pattern operativi UAT preserved

- ✅ Real-time bug capture (screenshot + console log immediato · zero "ricordo dopo")
- ✅ Categorize as found (P0/P1/P2/P3 sticker per ogni bug)
- ✅ STOP UAT se P0 emerge (escalate Skeezu immediato · CCP fix preemptive prima continuare)
- ✅ Cross-check Italian Voice + brand v2 visual consistency in ogni sezione
- ✅ Notes per UX/copy/perceived value (NOT just tech bugs)
- ✅ AIRIA real-time cross-check parallel (zero overhead UAT main flow)
- ✅ Loom recording (optional) per retrospective post-fix

## Closing

UAT prep package CONSOLIDATO ready · Skeezu+ROBY hands-on Gio mattina · AIRIA cross-check coordination · CCP standby ready fire post bug list signed · 4 giorni cuscinetto Lun-Mer prep window.

— **ROBY** · Dom 17 maggio 2026 sera · tour de force production async · UAT prep package consolidato

*UAT Day 13 FINALE prep package CONSOLIDATO · timeline LOCKED 07:50-17:00+ · setup checklist Skeezu · 17 ROBY buyer + 10 Skeezu seller + 5+1 joint check items · bug list template P0/P1/P2/P3 detailed · AIRIA Obs request 5 cross-check items · CCP standby ready · 4 giorni cuscinetto prep · GO-LIVE Ven 22/05 + Kaspa Foundation alignment giugno preserved · daje team a 4 🚀*
