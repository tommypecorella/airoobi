---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (CIO/CTO · Pi 5)
cc: Skeezu (Founder)
subject: 🚀 FINAL BRIEF · Atto 1 Valutazione + EVALOBI + Swap + TX Tracking · SEALED · GO sprint W3
date: 2026-05-13 W2 Day 9 night
status: **SEALED · GO** · sigillo Skeezu LOCKED 20 decisioni · pre-deploy verifications CCP done · brief paste-ready
ref-source-of-truth: `ROBY_PendingBrief_CCP_Atto1_WIP_2026-05-13.md` (long-form journey audit-trail)
ref-tech-review: `CCP_Reply_ROBY_PendingBrief_Atto1_WIP_TechClarifications_2026-05-13.md` (6 corrections accolte)
ref-ack: `ROBY_Ack_CCP_TechClarifications_Atto1_2026-05-13.md`
---

# 🚀 BRIEF FINAL · Atto 1 Valutazione + EVALOBI + Swap + TX Tracking

**Status:** SEALED · GO sprint W3 · ETA target 33-45h CCP focused · ~2 settimane · 8 aree (Area 8 SEO quick wins added Skeezu LOCK 13 May late)

**Source of truth dettagliato:** Tutti i dettagli di Migration M1-M14, RPC, RLS, acceptance criteria, payload examples · in WIP brief file (linked sopra). Questo FINAL è executive paste-ready summary per ricap rapido prima di sprint start.

---

## 20 decisioni LOCKED (Skeezu + ROBY + CCP signed)

| # | Decisione | Owner sign-off |
|---|---|---|
| 1 | Floor prezzo oggetto: **€500 EUR** minimum | Skeezu |
| 2 | Quality criteria: **4 AND-gate** (condizione · brand+modello · liquidability · verifiability) | Skeezu+ROBY |
| 3 | Combo intake: **form esistente** · admin manuale · no AI screening | Skeezu |
| 4 | Pagamento valutazione: **200 ARIA fisso** (= €20 stable) | Skeezu |
| 5 | Output GO: **1 EVALOBI Livello B + 1 ROBI bonus** (soft-launch flag) | Skeezu |
| 6 | EVALOBI lifecycle: **permanente eterno · trasferibile · re-evaluable opzionale** | Skeezu |
| 7 | Tokens conversion flow: **KAS↔ARIA · ROBI→ARIA · ROBI→KAS** (ROBI non-comprabile) | Skeezu |
| 8 | Schema tokens pubblicato `airoobi.com/investitori.html` + `airoobi.app/tokens` | Skeezu |
| 9 | NO_GO refund: **NO refund** · 200 ARIA garantiti AIROOBI | Skeezu |
| 10 | NO_GO EVALOBI: **emesso COMUNQUE** con `evaluation_outcome=NO_GO` (pollution layer) | Skeezu · CCP-signed architetturalmente |
| 11 | NO_GO ROBI bonus: **NO bonus** · solo su GO | Skeezu · CCP appoggia |
| 12 | Brand Pollution Principle (doppio trick) · LOCKED brand-level · pattern extension futuro | Skeezu |
| 13 | SLA response: **48h** target | Skeezu |
| 14 | SLA dashboard pubblico: `airoobi.com/sla` SSR + 3 metriche + distribution chart + embed widgets | Skeezu+ROBY |
| 15 | Auto-escalation: **24h post-SLA** admin reminder + 72h+ courtesy refund **50 ARIA** | Skeezu |
| 16 | Notification channels: **email + in-app tier critico** · in-app only tier engagement · email cap helper 100/giorno | Skeezu |
| 17 | Stack SSR EVALOBI public page: **Vercel Serverless Function** `/api/evalobi-ssr.js` (NOT CF Worker) | CCP-signed |
| 18 | `points_ledger` migration: **phased dual-write W3/W4/W5** (NO big-bang) | CCP-signed |
| 19 | Swap ROBI rate behavior: **snapshot at confirm + 60s lock** | Skeezu (CCP propose) |
| 20 | Re-submit policy NO_GO: **LIBERO · basta che paghi** · 200 ARIA × N · revenue-friendly | Skeezu (admin mitigation template repeat) |

## 1 sola decisione residua · NON-blocker sprint W3

- Admin review UI scope (Supabase Studio direct fino X req/giorno · admin queue page minimal · può aspettare W4 economic decision)

---

## 8 macro-aree implementation · ETA 33-48h CCP focused target

| # | Area | ETA CCP | Note chiave |
|---|---|---|---|
| 1 | EVALOBI table + lifecycle (mint · transfer · re-evaluate · history) | 4-6h | Migration M1+M2 · 3 RPC · RLS · storico chain append-only |
| 2 | Valutazione request flow + auto-escalation 24h post-SLA | 2-3h | Migration M3 · 2 RPC · edge fn email tier critico |
| 3 | Swap functionality (4 RPC: KAS↔ARIA · ROBI→ARIA/KAS) | 6-8h | Migration M5 · `get_robi_rate_eur()` RPC · snapshot+lock 60s · KAS oracle (CoinGecko/CMC) |
| 4 | Transaction tracking + UI history `/profilo/storico` + phased dual-write backfill | 3-5h | Migration M7 · trigger atomic insert · Realtime channel · one-shot backfill points_ledger |
| 5 | Schema tokens visual pages (.com investitori + .app tokens) | 1-2h | SVG asset reusable · 1 .com edit + 1 .app new page |
| 6 | EVALOBI public visualization (pollution layer · Vercel SSR) | 4-6h | Edge fn generate PDF+PNG+QR · Vercel function `/api/evalobi-ssr.js` · vercel.json rewrite · caption template UI dApp |
| 7 | Reattività Dashboard `/sla` pubblico + email cap helper | 3-5h | Migration M11 (materialized view 30d) · pg_cron 5min refresh · SSR page · 3 widget embed · email send helper con cap+fallback |
| 8 | **SEO Quick Wins · sitemap surface 2x** (NEW) | 8-13h | QW1: `/airdrops/:id` SSR public + Schema.org Product + sitemap dynamic (4-6h) · QW2: `/categoria/:slug` 6 pillar pages (3-5h CCP + ROBY copy) · QW3: `/treasury` + `/explorer` in sitemap + Schema.org Organization (1-2h) |

**TOTALE:** **31-48h** (target 33-45h focused) · sprint W3 ~2 settimane

---

## Pre-deploy verifications CCP (13 May 2026 night)

- ✅ `pg_cron 1.6.4` installed Supabase AIROOBI (`vuvlmlpuhovipfwtquux`) · materialized view refresh ok
- ✅ `pg_net 0.19.5` installed · async HTTP from SQL ok
- ✅ `pgmq 1.5.1` available · queue Postgres-native future
- ✅ `treasury_stats` table source of truth confirmed · campi: `balance_eur` · `nft_circulating` · `nft_minted` · `updated_at`
- ✅ Zero blocker tecnici outstanding

---

## Pattern operativi obbligatori (CCP-signed allineamento)

- ❌ NO sed cascade · edit chirurgico
- ❌ NO commit senza audit-trail file
- ✅ Pre-commit smoke grep deprecated terms
- ✅ STOP+ASK pre-COMMIT critical DB ops
- ✅ Migration include `GRANT [op] ON TABLE foo TO authenticated;` per ogni nuova public table (Supabase default flip 30 Oct 2026)
- ✅ Audit-trail post-commit `CCP_*.md` immediato
- ✅ Verify-before-edit grep stack files pre-write (Vercel/Supabase/HTML structure)
- ✅ Verify extension installed before use in migration (estensione pattern emergente 13 May)

---

## Hand-off · cosa CCP riceve da ROBY ora

1. **Questo brief FINAL** · executive paste-ready
2. **WIP brief long-form** · dettagli M1-M14 schemas, RPC signatures, RLS policies, acceptance criteria per area
3. **6 tech corrections** già integrate (Vercel SSR · phased dual-write · `get_robi_rate_eur()` · pg_cron verified · NO_GO architectural lock · token_id approved)
4. **20 decisioni LOCKED** Skeezu sealed
5. **Zero ambiguity outstanding** sprint W3

## Hand-off · cosa ROBY fa async durante sprint W3

- Spec Atto 2 (Listing & Activation) + Atto 3 (Partecipazione) draft
- Spec Atto 4 (Estrazione + Settlement) + Atto 5 (Consegna + Chiusura) draft
- Aggiornamento canonical spec `AIROOBI_Airdrop_Lifecycle_Canonical_2026-05-13.md` v2 post-Atto-1-locked
- Investor pitch v1.2 update (slide "Pollution layer · we monetize the no's too" + slide token economy schema)
- Blog SEO post candidates (token economy explanation + EVALOBI NO_GO use case)

---

## RS Prompt one-shot for CCP (paste-ready)

```
RS · GO sprint W3 Atto 1 + SEO quick wins · valutazione + EVALOBI + swap + tx tracking + sitemap surface 2x

Brief sigillato:
- FINAL: ROBY-Stuff/for-CCP/ROBY_Brief_Atto1_FINAL_2026-05-13.md
- WIP long-form: ROBY-Stuff/for-CCP/ROBY_PendingBrief_CCP_Atto1_WIP_2026-05-13.md
- Ack tua tech review 6/6 accolte: ROBY-Stuff/for-CCP/ROBY_Ack_CCP_TechClarifications_Atto1_2026-05-13.md

Status: 20 decisioni Skeezu LOCKED · 1 sola residua non-blocker (admin UI W4 economic decision) · 8 macro-aree implementation (7 + Area 8 SEO quick wins added) · ETA target 33-45h CCP focused sprint W3 ~2 settimane.

Tutte le tue 6 correzioni tech (Vercel SSR · phased dual-write · get_robi_rate_eur RPC · pg_cron verified · NO_GO architectural lock · token_id approved) sono integrate nel brief FINAL.

Skeezu LOCKED stasera:
- Re-submit policy NO_GO = libero "basta che paghi" (no cooldown · revenue-friendly · admin template repeat mitigates time waste)
- Swap rate behavior = snapshot at confirm + 60s lock (tua proposal accolta)
- Add Area 8 SEO quick wins: /airdrops/:id SSR public + 6 categoria pillar pages + /treasury+/explorer in sitemap · stack-fit Vercel pattern già LOCKED Area 6

Sprint W3 può partire. Apri il FINAL brief + WIP per dettagli M1-M14 schema/RPC/RLS · procedi atomic edit chirurgico · audit-trail post-commit obbligatorio · STOP+ASK pre-COMMIT critical DB ops.

ROBY async produce Atto 2-6 spec + 6 categoria copy 300-500 parole brand-coherent in parallelo.

Buon sprint W3 CCP · daje.
```

---

— **ROBY** · 13 May 2026 W2 Day 9 night · canale ROBY→CCP

*Brief Atto 1 SEALED · GO sprint W3 · 20 decisioni LOCKED · 6 tech corrections integrate · 0 blocker outstanding · ETA 25-32h target focused · sprint partire next session CCP.*
