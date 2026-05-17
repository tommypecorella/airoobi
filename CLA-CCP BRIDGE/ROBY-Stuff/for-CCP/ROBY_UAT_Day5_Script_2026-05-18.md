---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: Skeezu (Founder) · CCP · AIRIA
subject: 📋 UAT Script Day 5 · checklist atomic ROBY (buyer flow + Live Evento UX) + Skeezu (seller flow + admin) · bug list template incluso
date: 2026-05-18 W3 Day 3 mattina early prep (Dom 17/05 deep night ROBY async)
status: READY · UAT giro Lun 18/05 mattina · post-UAT compile ROBY_UAT_Day5_BugList_2026-05-18.md
---

# 📋 UAT Day 5 · Script Atomic + Bug List Template

## TL;DR

Checklist completa UAT live giro Day 5 mattina · 17 items ROBY (buyer flow + Live Evento UX) + 10 items Skeezu (seller flow + admin) · 5 items joint check (cross-page nav + naming + responsive) · bug list template P0/P1/P2/P3.

## Pre-UAT setup (Skeezu · ~5 min mattina)

1. ✅ Browser Chrome · login dapp.html con account Alpha Brave
2. ✅ Browser secondario (incognito o altro Chrome profile) per simulare 2° utente buyer
3. ✅ Console DevTools aperta · catch errori JS console
4. ✅ Network tab aperta · monitor Supabase RPC calls
5. ✅ AIRIA `AIRIA_SysReport_*` cross-check Pi 5 RAM/disco/services pre-UAT

## 🛒 ROBY UAT Script · Buyer Flow + Live Evento UX (17 items)

| # | Step | Pass criteria | Bug class if fail |
|---|---|---|---|
| 1 | Login dapp.html | Auth OK · Alpha Brave badge visibile | P0 blocker |
| 2 | Navigate `/airdrops` | Listing public renders · grid airdrop cards | P0 blocker |
| 3 | Filter categoria dropdown | Filter applies · counter risultati updates | P1 high |
| 4 | Click airdrop detail | `/airdrops/:id` SSR loads · OG meta visible (view-source) | P1 high |
| 5 | Verify Live Evento UX scoreboard | Top-10 rendered · my position highlighted | P0 blocker |
| 6 | Verify scacco matto display | "Per superare leader: +X blocchi" · "Per scacco matto: +Y blocchi" · costo ARIA visible | P0 blocker |
| 7 | Verify esclusi/attivi counter | "X esclusi · Y attivi" Italian naming · NO "maratona/race/agonismo" residue | P1 high |
| 8 | Verify countdown timer | Color gold default · orange ultime 24h · red ultima 1h | P2 medium |
| 9 | Buy 1 block · 15 ARIA debit | ARIA balance decrements · scoreboard update real-time (10s polling) | P0 blocker |
| 10 | Buy 5 blocks · 75 ARIA debit | Multi-buy works · participation row inserted | P0 blocker |
| 11 | Check push T1 notification (sei stato superato) | Toast in-app appears · notifications table row inserted | P1 high |
| 12 | Check fairness guard (provocare lockdown · buy oltre limite) | P0001 error friendly message "Acquisto bloccato per fairness" | P1 high |
| 13 | Navigate `/profilo/storico` | Transaction history table renders · my buy_blocks event visible · 24 categories filter | P1 high |
| 14 | Navigate `/profilo/preferenze` | Categoria toggle 10 cat + notify_all switch · save UPDATE profiles | P1 high |
| 15 | Save preferenze + reload page | Settings persist · category_preferences JSONB array saved | P2 medium |
| 16 | Mobile responsive (Chrome DevTools mobile emulation 380px) | Layout responsive · Live Evento UX visible · scoreboard scrollable | P2 medium |
| 17 | Cross-page navigation flow | Navigate dapp → /airdrops → :id → /profilo → back · zero broken links | P1 high |

## 🏪 Skeezu UAT Script · Seller Flow + Admin (10 items)

| # | Step | Pass criteria | Bug class if fail |
|---|---|---|---|
| S1 | Submit proposta valutazione `/proponi` | Form 6+ fields submit · 4 photos upload · payment 200 ARIA debit + evaluation_request row inserted | P0 blocker |
| S2 | Admin `/abo` sec-valutazioni filter + sort | Filter categoria works · sort options (Data ↓ Data ↑ Quotazione ↓ ↑ Titolo A→Z) · counter risultati live | P1 high |
| S3 | Admin evaluate GO outcome | Click GO button · trigger admin_evaluate_request · EVALOBI mint + ROBI bonus + notification | P0 blocker |
| S4 | Admin evaluate NO_GO outcome | Click NO_GO button · EVALOBI mint con outcome flag · ZERO refund · ZERO ROBI bonus · public_url accessible (pollution layer) | P0 blocker |
| S5 | Seller venditore.html · EVALOBI library | Cards render with brand · model · condition · outcome badge · token_id · price range · evaluation date · public_url link | P1 high |
| S6 | Admin publish airdrop (Supabase Studio fallback) | airdrops row insert via publish_airdrop_listing RPC · status → presale/sale · total_blocks computed via ceil(value × 1.333) | P0 blocker |
| S7 | Seller venditore.html · Payouts | Live data render quota seller (67.99%) + treasury fondo + AIROOBI fee + ARIA raccolto + status badge | P1 high |
| S8 | Simulazione fine evento (cron detect_end_event trigger via SQL Studio o aspettare 5 min) | Status transition `sale → waiting_seller_acknowledge` · push T1 seller notification | P0 blocker |
| S9 | Seller venditore.html · acknowledge tab ACCEPT button | seller_acknowledge_airdrop(accept) · execute_draw chain · status → completed · winner public reveal · payment split visible | P0 blocker |
| S10 | Buyer claim address `/profilo/airdrops/:id/claim` (se vincitore) | Form shipping address submit · airdrop_claims row inserted · push T1 seller "Vincitore ha richiesto consegna" | P1 high |

## 🤝 Joint Check (Both · 5 items)

| # | Step | Pass criteria | Bug class if fail |
|---|---|---|---|
| J1 | OG image rendering social share | Share URL su WhatsApp/Telegram · OG image preview rich con airdrop details · brand AIROOBI dominant | P1 high |
| J2 | Italian naming Voice 04 cross-check | Pre-commit smoke grep BANNED ("maratona/race/agonismo/runner/champion/vinci/perdi/lotteria") · LOCKED ("Evento/esclusi/attivi/scacco matto") | P1 high |
| J3 | Brand v2 visual consistency | Light theme · Inter font · Renaissance gold #B8893D · slogan "Un blocco alla volta" · NO regressions | P2 medium |
| J4 | Cross-canale navigation flow consistency | dapp ↔ venditore ↔ /abo (se admin) · zero broken links · breadcrumb coherent | P1 high |
| J5 | EVALOBI pollution layer URL accessible | airoobi.com/evalobi/{token_id} SSR public · indexable Google · QR code embedded | P2 medium |

## Bug List Template post-UAT

File template `ROBY_UAT_Day5_BugList_2026-05-18.md`:

```markdown
---
from: ROBY + Skeezu (UAT joint compilation)
to: CCP fire fix aggressive
date: 2026-05-18 W3 Day 3
status: P0 X · P1 Y · P2 Z · P3 W identified · CCP fix priority order
---

# UAT Day 5 Bug List · P0/P1/P2/P3 categorized

## P0 blocker (prevent FASE A go-live · MUST FIX)

### Bug #P0-1 · {title}
- **Step reproduce:** {steps}
- **Expected:** {expected behavior}
- **Actual:** {actual behavior}
- **Screenshot/log:** {link}
- **Suggested fix:** {hint if obvious}
- **Effort estimate:** {ETA CCP}

## P1 high (degrades UX significantly · SHOULD FIX)
[same template]

## P2 medium (noticeable but not blocker · NICE-TO-FIX)
[same template]

## P3 low (polish iteration W5+ · DEFER OK)
[same template]

## UX/Copy/Perceived Value catches (NOT tech bugs · UX feedback)
[per ognuno: pagina/sezione · issue description · suggestion]

## Suggestions improvement non-blocker
[per ognuno: feature suggestion · razionale · priority]
```

## AIRIA Obs request · cross-check during UAT

@AIRIA · puoi durante UAT live giro Lun mattina:
1. **`AIRIA_SysReport_Pre_Day5_UAT_*.md`** pre-UAT (Pi 5 RAM/disco/services health) per CCP pre-fire context
2. **`AIRIA_Obs_BANNED_Terms_Audit_*.md`** post-UAT · grep BANNED terms ("maratona/race/agonismo/runner/champion") residue in venditore.html + abo.html + live-evento.js + dapp.html
3. **`AIRIA_Obs_Italian_Voice_LOCKED_*.md`** post-UAT · verify LOCKED terms ("Evento/esclusi/attivi/scacco matto") used consistently UI
4. **`AIRIA_Alert_*.md`** real-time se Pi 5 RAM scende sotto threshold critical durante UAT

## Pattern operativi UAT preserved

- ✅ Real-time bug capture (screenshot + console log immediato · zero "ricordo dopo")
- ✅ Categorize as found (P0/P1/P2/P3 sticker per ogni bug)
- ✅ STOP UAT se P0 emerge (escalate Skeezu immediato · CCP fix preemptive prima continuare)
- ✅ Cross-check Italian Voice + brand v2 visual consistency in ogni sezione
- ✅ Notes per UX/copy/perceived value (NOT just tech bugs)

## Timeline UAT mattina Lun 18/05

| Window | Action |
|---|---|
| 08:00-08:15 | Pre-UAT setup (Skeezu browser+devtools · AIRIA SysReport) |
| 08:15-09:30 | UAT giro atomic (Skeezu seller + ROBY buyer in parallelo · 2 browsers) |
| 09:30-10:00 | Bug list compilation joint `ROBY_UAT_Day5_BugList_2026-05-18.md` |
| 10:00 | Skeezu paste RS prompt Day 5 a CCP · CCP fire fix aggressive |
| Pomeriggio | CCP P0+P1 aggressive fix · Re-validate · CCP Closing Day 5 |

## Closing

UAT script atomic + bug list template ready · Skeezu+ROBY hands-on Lun mattina · AIRIA cross-check coordination · CCP standby ready fire post bug list signed.

22° validation point pattern healthy preserved · FASE A target Ven 22/05 + 4-5gg cuscinetto preserved · daje Day 5 UAT 🚀

— **ROBY** · 17 May 2026 W3 Day 2 deep night · UAT prep Day 5

*UAT Day 5 script atomic ready · 17 ROBY buyer + 10 Skeezu seller + 5 joint check · bug list template P0/P1/P2/P3 · AIRIA Obs request 4 items · timeline mattina 08:00-10:00 UAT + 10:00 fire fix start · FASE A target Ven 22/05 + cuscinetto preserved · daje 🚀*
