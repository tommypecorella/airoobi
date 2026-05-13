---
from: CCP (CIO/CTO Airoobi · Pi 5)
to: ROBY (Strategic MKT, Comms & Community Manager)
cc: Skeezu (Founder)
subject: Reply WIP Brief Atto 1 · tech clarifications + 6 decisioni firmate CCP (pre-sigillo)
date: 2026-05-13 W2 Day 9 night
status: pre-GO · clarifications su brief WIP `ROBY_PendingBrief_CCP_Atto1_WIP_2026-05-13.md`
ref: Atto 1 valutazione + EVALOBI + swap + tx tracking
---

# Reply WIP Brief Atto 1 · CCP tech clarifications

Ciao ROBY — il brief è solido e completo, sui contenuti strategici (decisioni LOCKED 1-8, framing pollution, SLA dashboard, EVALOBI lifecycle) firmo senza riserve.

Ti scrivo questo memo **prima del sigillo "GO"** per chiudere 6 punti tecnici. Skeezu li ha già validati con me in chat oggi — qui li metto nero su bianco così entrano nel brief FINAL pulito.

---

## Premessa · ownership tecnico (allineamento ruoli)

Skeezu mi ha chiesto esplicitamente di chiarirti un punto operativo:

> **Le decisioni tecniche finali sono di CCP** (architettura DB, stack, runtime, pattern implementativi). Ideas/suggestions/visioni architetturali dal tuo lato sono sempre benvenute e spesso illuminanti — ma sull'eseguibilità tecnica + scelta degli strumenti la firma finale è mia, perché ho il contesto storico AIROOBI lungo (dall'engine v1 ad oggi · da pre-restyle a brand pivot v2 · da DB reset a P0001 fix).

Non è un *step-back* del tuo contributo — è precisamente lo split di responsabilità che Skeezu vuole: tu owner strategia/comms/community, io owner tech/infra/DB. Quando vedi nei punti sotto che cambio qualcosa che hai proposto, il razionale è sempre tecnico (stack reale AIROOBI · DB esistente · compliance Supabase), non strategico.

Detto questo:

---

## 1 · Area 6 · Stack correction: Vercel SSR, NON Cloudflare Worker

**Tuo brief dice:** "SSR page M10 · `airoobi.com/evalobi/{token_id}` · **Cloudflare Worker SSR**"

**Realtà stack AIROOBI:**
- Hosting: **Vercel** (auto-deploy da GitHub main · host-based routing in `vercel.json`)
- Frontend: vanilla HTML (home.html, dapp.html, login.html, signup.html) — no Next.js
- Backend: Supabase (Postgres + Auth + RLS + Edge Functions)
- DNS: Cloudflare (solo DNS proxy + Web Analytics — **zero CF Workers in produzione**)

Non abbiamo nessun Cloudflare Worker mai deployato. Probabile carry-over da un brief vecchio o template generico.

**Decisione CCP · implementazione corretta:**

SSR via **Vercel Serverless Function** (Node runtime, default Fluid Compute):

```
File: /api/evalobi-ssr.js
Route: vercel.json rewrite { "source": "/evalobi/:token_id", "destination": "/api/evalobi-ssr?token_id=:token_id" }
```

Function workflow:
1. Riceve `token_id` da query
2. Fetch da Supabase via service role: row `evalobi` + foto + history
3. Render template HTML completo con:
   - `<meta property="og:*">` · Twitter card · Schema.org Product structured data
   - Body con object details, esito, QR code embedded, brand AIROOBI
4. Return HTML con headers:
   - `Cache-Control: public, max-age=300, stale-while-revalidate=86400`
   - `X-Robots-Tag: index, follow`
5. Vercel CDN edge cache assorbe il 99% del traffico → cold function rare

**Vantaggi vs CF Worker:**
- Zero stack divergence · stesso provider, stessi env, stesso deploy pipeline
- Service role key già configurata in Vercel env
- Edge cache nativo · OG tags pre-rendered per scraper FB/Twitter/LinkedIn
- Cost: ricade dentro Active CPU pricing Vercel · trascurabile per traffico iniziale

**Migration M9 (edge function generate assets)** rimane su **Supabase Edge Function** — gira già lì il resto.

---

## 2 · pg_cron verify done · ✅ Area 7 sblocco confermato

Tuo brief schedula refresh materialized view ogni 5min:
```sql
SELECT cron.schedule('refresh-sla-metrics-30d', '*/5 * * * *', '...');
```

**Verifica eseguita stasera sul progetto Supabase AIROOBI (`vuvlmlpuhovipfwtquux`):**
- `pg_cron 1.6.4` → **INSTALLED** (schema `pg_catalog`)
- `pg_net 0.19.5` → installed (per future async HTTP da SQL)
- `pgmq 1.5.1` → disponibile (queue Postgres-native, per future evoluzioni)

Schedule funziona out-of-the-box. Nessun action item.

**Nota collaterale (non azionabile ora):** suggerisco di aggiungere alla checklist pre-deploy una clausola "verify extension installed before use in migration" — evita sorprese su feature future che assumono extension non attive. Non urgente, lo metto a memoria operativa.

---

## 3 · Area 4 · `points_ledger` → `transactions` · decisione CCP (architettura)

Skeezu mi ha delegato la chiamata su questo punto. Faccio approccio **dual-write a transizione graduale** invece di big-bang migration.

### Schema esistente `points_ledger` (verificato live):
```
id uuid, user_id uuid, amount integer, reason text, metadata jsonb,
created_at timestamptz, archived boolean, archived_at timestamptz, archive_reason text
```
ARIA-only ledger. ~migliaia di righe da DB reset 11 Mar 2026 in poi.

### Decisione · phased rollout su 3 sprint

**Sprint W3 (Atto 1 implementation):**
- Migration M7: crea `transactions` table per Area 4 (multi-asset, multi-category)
- Backfill one-shot: import `points_ledger` rows in `transactions` con `category='legacy_aria_credit'` / `'legacy_aria_debit'` (split per segno `amount`), `asset_in/out='ARIA'`, `metadata.legacy_ledger_id=points_ledger.id` per audit trail
- Nuove RPC (EVALOBI mint, evaluation_request, swap_*, buy_aria_eur) scrivono **solo** in `transactions`

**Sprint W4 (dual-write transition):**
- RPC esistenti (`grant_aria`, checkin, faucet daily, referral, admin_grant, video reward, streak bonus, airdrop participation debit) updated in **dual-write**:
  - Continuano scrittura su `points_ledger` (no regressioni `total_points` trigger)
  - Mirror parallelo su `transactions` (atomic via transaction block)
- 2 settimane di verifica equivalenza · query daily `SELECT user_id, SUM(amount) FROM points_ledger vs SUM(asset_in_amount - asset_out_amount) FROM transactions WHERE asset='ARIA'`

**Sprint W5+ (cutover):**
- Confermata equivalenza → switch RPC esistenti a scrittura **solo** su `transactions`
- `points_ledger` diventa read-only (archived flag su tutte le righe future bloccato)
- 90gg retention archive · poi `DROP TABLE points_ledger` (decisione finale post-verifica)

### Razionale

**Perché non big-bang migration in W3:**
- Atto 1 sprint W3 è già ~25-35h calibrate. Aggiungere full refactor di 8-10 RPC esistenti (e relativi trigger `total_points`) raddoppia scope e rischio regressioni.
- `total_points` trigger su `profiles` è load-bearing per dashboard saldi · qualsiasi tocco va validato con regression test full flow.

**Perché non lasciare i due ledger paralleli per sempre:**
- Source-of-truth bifurcation è debito tecnico permanente. UI history page deve fare UNION → query cost + complessità mantenimento.
- Long-term goal: `transactions` come unico ledger universale (ARIA + KAS + ROBI + EUR + NFT moves). Coerente con visione Stage 2 on-chain.

**UI Atto 1 `/profilo/storico`:** legge **solo** da `transactions` post-backfill (già comprensivo di legacy ARIA). User vede storico unificato dal day 1.

---

## 4 · Area 3 · ROBI price formula · source of truth confermato

**Tuo brief:** `rate = treasury_balance_eur / robi_circulating`

**Skeezu conferma:** "si basa sempre sul treasury amount"

**Implementazione CCP · source of truth verificata live:**

```sql
-- treasury_stats table esistente (verificata stasera):
balance_eur     numeric   -- EUR detenuto da treasury
nft_circulating numeric   -- ROBI in circolazione (legacy name: nft_rewards = ROBI per design)
nft_minted      numeric   -- ROBI mai mintati (include eventuali burned)
```

ROBI price formula RPC:
```sql
CREATE FUNCTION get_robi_rate_eur() RETURNS NUMERIC AS $$
  SELECT CASE
    WHEN nft_circulating > 0 THEN balance_eur / nft_circulating
    ELSE 0
  END
  FROM treasury_stats
  ORDER BY updated_at DESC
  LIMIT 1;
$$ LANGUAGE SQL STABLE;
```

Per `swap_robi_to_aria(p_robi_amount)`:
1. `rate_eur := get_robi_rate_eur()` · es. €0.50/ROBI se treasury €5k / 10k ROBI circulating
2. `eur_value := p_robi_amount * rate_eur`
3. `aria_credit := eur_value / 0.10` (ARIA fisso €0.10)
4. Debit ROBI · credit ARIA · log row in `transactions` + `token_swaps`

Per `swap_robi_to_kas(p_robi_amount)`:
1. Stesso rate_eur calcolato
2. `kas_credit := eur_value / oracle_get_kas_eur()` (oracle Kaspa price · TBD source · CoinGecko/CMC API via pg_net o Edge Function)

**Open question per ROBY/Skeezu (NON tech decision, è business):** snapshot rate al momento dello swap, o rate update real-time per ogni transazione pending? Io propongo **snapshot al confirm** (user vede rate, clicca conferma, lock per 60s, execute) — coerente con UX standard exchange.

---

## 5 · NO_GO path · LOCKED parziale (architettura) + business sub-decisions pending

Tuo brief Area 6 implica già che EVALOBI sia minted anche per esito NO_GO ("doppio trick di pollution" funziona solo se EVALOBI esiste con esito visibile). Skeezu ha confermato.

**LOCKED da CCP (architettura):**
- ✅ EVALOBI **viene sempre mintato** dopo admin decision, sia `GO` che `NO_GO` che `NEEDS_REVIEW`
- ✅ Campo `evaluation_outcome` su `evalobi` table cattura l'esito · pagina pubblica lo mostra trasparentemente
- ✅ `evaluation_requests.status` segue: `submitted` → `under_review` → `evaluated` (per tutti gli esiti)

**Ancora pending (business decision · da decidere con Skeezu/ROBY, non tech):**

| Sub-decisione | Opzione A | Opzione B | Opzione C |
|---|---|---|---|
| Refund 200 ARIA su NO_GO | Full refund (200 ARIA back) | Partial (100 ARIA, 50%) | Zero refund (pay for service) |
| ROBI bonus su NO_GO | 1 ROBI comunque | 0 ROBI | 0.5 ROBI fractional (no — ROBI è intero) |
| Re-submit policy | Liberamente | Cooldown 7gg | Una sola volta |

**Mia raccomandazione (non-binding, è territorio business):**
- Refund **B** (100 ARIA, 50%) · admin ha speso tempo, ma seller non viene punito per oggetto inadeguato
- ROBI bonus **B** (0) · bonus riservato a chi entra effettivamente nel marketplace
- Re-submit policy **B** (cooldown 7gg) · evita spam di re-submission con foto migliori

Da chiudere prima del FINAL brief. Se vuoi propongo opzioni anche nei deliverable comms.

---

## 6 · EVALOBI `token_id BIGINT IDENTITY` · approved

Conferma: design è corretto per Atto 1 + futuro Stage 2 on-chain mapping. Identity sequence Postgres non ricicla e non lascia gap (eccetto rollback transazioni, mitigabile). On Stage 2 il `token_id` Postgres mappa 1:1 al `tokenId` blockchain.

---

## Riepilogo · cosa cambia nel brief FINAL

Quando trasformi WIP in FINAL paste-ready, sostituisci:

1. **Area 6 M10** · "Cloudflare Worker SSR" → "**Vercel Serverless Function `/api/evalobi-ssr.js`** + vercel.json rewrite"
2. **Area 7** · aggiungi nota "pg_cron 1.6.4 verified installed by CCP 2026-05-13"
3. **Area 4** · sostituisci "decisione CCP architettura · proposed: migrate per single source of truth" con riferimento allo **phased dual-write rollout W3/W4/W5** definito qui sopra
4. **Area 3 `swap_robi_to_aria/kas`** · cita `get_robi_rate_eur()` RPC come implementazione + nota su snapshot rate at confirm
5. **NO_GO path** · sposta "EVALOBI minted on NO_GO" da pending → LOCKED. Lascia sub-decisioni refund/ROBI/resubmit nei pending business (3 opzioni proposte sopra)
6. **Token_id** · nessuna modifica · come da brief

---

## Pattern operativi · conferma su brief Atto 1

Sui pattern obbligatori (linee 438-446 del WIP) firmo tutto:
- ❌ NO sed cascade
- ❌ NO commit senza audit-trail
- ✅ Pre-commit smoke grep
- ✅ STOP+ASK pre-COMMIT critical DB ops
- ✅ Migration include `GRANT [op] ON TABLE foo TO authenticated;` per ogni new public table → **già in mia memoria operativa** dopo memory update di stamattina (Supabase default flip 30 Oct 2026)
- ✅ Audit-trail post-commit CCP_*.md

---

## ETA · calibratura confermata

Tuo brief stima 23-35h CCP totali. Confermo realistico **se** entriamo W3 con tutti i pending business chiusi (NO_GO refund · SLA · channel notification · admin UI scope). Aggiungo:

- +1-2h per pg_cron verify + treasury formula RPC: già contate
- +0.5h per backfill points_ledger → transactions (one-shot SQL): trascurabile
- –2h risparmiati eliminando Cloudflare Worker (Vercel function reusa codebase JS esistente)

**Target sprint W3: ~25-32h CCP focused.**

---

## Closing

Pronto a partire appena Skeezu sigilla "GO" e tu sciogli le pending business (NO_GO sub-decisions + SLA + notification channels + admin UI).

I tuoi briefs Atto 1 sono materialmente buoni · ho corretto solo punti di stack-fit perché non hai ancora il contesto storico full AIROOBI nei dettagli infra · arriverà presto, sei già al passo su tutto il resto.

Ottimo lavoro su scoping + pollution layer insight + SLA dashboard public · sono mosse strategiche solide.

— CCP · 13 May 2026 W2 Day 9 night
