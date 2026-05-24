---
title: CCP · SHIPPED GS-16 cluster IL RULLO ROBI · 5 chunk live · formula B + guardrail anti-inflazione 3 layer · 2 airdrop test live + block_numbers comunicati · standby UI-click ROBY
purpose: Consegna singola GS-16 post-firma ROBY GS-15p1 + GO formula B. 3 migration BE applicate live su Supabase (Chunk 1+2+3) · FE 2 chunk live su airoobi.app 4.41.0 (Chunk 4+5). Guardrail anti-inflazione ROBI 3 layer riferito esplicitamente (condizione firma Skeezu). 2 airdrop test seminati: (1) formula B naturale 100 blocchi → 2 ROBI su [13, 23] · (2) deterministico 10 blocchi → tutti ROBI nascosti. Comunico airdrop_id + block_numbers a ROBY per UI-click verify accredito istantaneo + reveal animation + flash topbar. Standby firma. Knock-on Closure v3 PR-3 chiuso (commento ingannevole sistemato in Chunk 3).
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: GS-16 5 chunk SHIPPED · BE 3 migration live + FE 2 chunk live 4.41.0 · 2 airdrop test seminati · standby UI-click ROBY · counter potenziale 15/16
in-reply-to: ROBY_SignOff_GS15p1_GO_GS16Build_2026-05-24.md
---

# CCP — SHIPPED GS-16 cluster · IL RULLO ROBI live · standby UI-click ROBY

## TL;DR

- **GS-16 cluster SHIPPED** ✅ — commit `238f63a` push main · Vercel
  deploy live · footer **alfa-2026.05.24-4.41.0**.
- **5 chunk completi** (3 BE migration applicate live su Supabase + 2 FE
  in dapp.js/dapp.css).
- **Guardrail anti-inflazione ROBI 3 layer** wired e riferito esplicito
  (condizione firma Skeezu).
- **2 airdrop test seminati live** per UI-click ROBY (vedi §4):
  - Test #1 (formula B verify): 100 blocchi, 2 ROBI su `[13, 23]`
  - Test #2 (reveal flow E2E): 10 blocchi, tutti con ROBI
- **Standby UI-click ROBY** → firma → GS-16 chiuso → golden-session 15/16,
  resta solo GS-3 meta.

## 1. Backend live · 3 migration applicate

Verificato post-apply:

| Check | Risultato |
|---|---|
| Tabella `airdrop_block_seeds` esiste | ✅ |
| Trigger `trg_airdrop_seed_rullo` attivo | ✅ |
| Colonne `treasury_stats.robi_rullo_seeded/redeemed` | ✅ |
| 4 config key `robi_seeding_*` presenti | ✅ |
| `buy_blocks` v6 contiene logica revealed_robi + seeds | ✅ |
| Vista `v_treasury_robi_supply` esposta a service_role | ✅ |
| RPC `get_airdrop_rullo_count` esposta a authenticated+anon | ✅ |
| Treasury baseline post-seed test: seeded=12, redeemed=0 | ✅ |

Integration test passed per tutti e 3 i Chunk (vedi NOTICE nelle migration).

### Chunk 1 · schema (commit deliverable)
- Tabella `airdrop_block_seeds` con PK `(airdrop_id, block_number)` ·
  RLS `seeds_select_found_only` (no-spoiler) · 2 indici condizionati
  (unfound + found_by) · GRANT a authenticated.
- Colonne `treasury_stats.robi_rullo_seeded` + `robi_rullo_redeemed`
  NUMERIC(12,4) DEFAULT 0 (guardrail LAYER 2 contabilizzazione tracciata).
- 4 `airdrop_config` keys (formula B + 3 guardrail).
- Vista `v_treasury_robi_supply` admin-only con `robi_circulating`,
  rullo breakdown (seeded/redeemed/outstanding), peso %, eur_per_robi
  implicito.
- RPC pubblica `get_airdrop_rullo_count(airdrop_id)` ritorna
  `{total, redeemed, outstanding}` (no posizioni).

### Chunk 2 · trigger seeding formula B + guardrail
- `tf_airdrop_seed_rullo` AFTER UPDATE OF status su airdrops.
- Fires SOLO su transizione: `accettato → presale|sale` (apertura
  acquisti, prima volta). Skip se OLD.status era già aperto/chiuso.
- Idempotent: skip se `airdrop_block_seeds` già ha righe per quell'airdrop.
- **Formula B**: `N_target = floor(total_blocks × robi_seeding_pct)`
  (default 2%).
- **Guardrail LAYER 1**: cap hard per airdrop `N_capped =
  min(N_target, robi_seeding_max_per_airdrop)` default 50.
- **Guardrail LAYER 3**: quota giornaliera (default OFF). Se
  `robi_seeding_daily_cap_total > 0`, conta seeds del giorno e clippa
  o salta.
- **Posizioni**: random uniforme `[1, total_blocks]` no-rep via
  `generate_series ORDER BY random() LIMIT N` · salvate at-creation
  (decisione i · audit-friendly).
- **Guardrail LAYER 2 (in linea)**: UPDATE `treasury_stats.robi_rullo_seeded`
  += N_final · contabilizzazione emissione tracciata.

### Chunk 3 · buy_blocks rewrite + fix commento W5 PR-3
- Riprende latest `buy_blocks` (W5 PR-5 fix anti-sold-out-closed
  preservato).
- **Logica RULLO post-INSERT** in `airdrop_blocks`:
  ```sql
  FOR v_seed IN
    UPDATE airdrop_block_seeds
    SET found_at = NOW(), found_by = v_user_id
    WHERE airdrop_id = p_airdrop_id
      AND block_number = ANY(p_block_numbers)
      AND found_at IS NULL
    RETURNING block_number, robi_amount
  LOOP
    INSERT INTO nft_rewards (..., source='gs16_rullo_block', shares, metadata)
    v_revealed_robi := array_append(v_revealed_robi, v_seed.block_number);
    v_robi_total += v_seed.robi_amount;
  END LOOP;
  ```
- **Accredito istantaneo** (requisito HARD): treasury aggiornato
  (`robi_rullo_redeemed`, `nft_circulating`, `nft_minted`) +
  notification `rullo_robi_found`.
- **JSON di ritorno** ora include:
  - `revealed_robi: [block_numbers]` (array)
  - `revealed_robi_total: N` (somma shares)
- **Fix commento ingannevole W5 PR-3**: nota inline nella nuova `buy_blocks`
  che documenta: *"pre-GS-16 era falso · post-GS-16 i ROBI rullo SONO
  accreditati istantaneo qui sopra"*. La premessa di
  `process_seller_acknowledge` PR-3 ora è coerente.

## 2. Frontend live · 2 chunk wired su 4.41.0

### Chunk 4 · aggancio "Il rullo ROBI" pagina airdrop
- File `src/dapp.js` · funzione `loadRulloHook(airdropId)` chiamata da
  `showAirdropDetail()` (sotto `loadHintSoglia()`).
- Stub `<div class="detail-rullo-hook" id="detail-rullo-hook"></div>`
  posizionato dopo `buyBoxHtml`, prima di `detail-strategy` (GS-10).
- Popolato via RPC `get_airdrop_rullo_count` con:
  - Intestazione `Il rullo ROBI / The ROBI reel` (gem icon, gold)
  - **Copy ROBY (verbatim)**: *"Alcuni blocchi nascondono un ROBI.
    Minali e scopri quali — il ROBI trovato è subito tuo, sul wallet."*
    (+ EN traduzione speculare)
  - Counter: *"**N** ROBI ancora nel rullo / ROBI still in the reel"*
    quando `outstanding > 0`; oppure *"Tutti i ROBI del rullo sono stati
    trovati"* quando `outstanding = 0`.
- Se total = 0 (airdrop senza rullo) → el vuoto, `:empty{display:none}`.
- **NON mostra MAI le posizioni** (RLS no-spoiler + RPC restituisce
  solo counter).

### Chunk 5 · reveal animation post-mining
- File `src/dapp.js` · in `confirmBuy()` dopo `data.ok`:
- Se `data.revealed_robi_total > 0`:
  - **Toast distinto** (800ms dopo toast acquisto, per non sovrapporsi):
    *"◆ +N ROBI · trovato nel rullo! Subito sul wallet."* (gold) ·
    *"◆ +N ROBI · found in the reel! Instant on your wallet."*
  - **Refresh topbar ROBI delta-style**: legge valore corrente in
    `#tb-robi-val`, somma `revealed_robi_total`, scrive.
  - **Flash animation** sul wrap `.topbar-bal`: classe `.robi-flash`
    attivata per 2.4s · keyframes `robi-flash-pulse` (2 cicli).

### CSS · `src/dapp.css`
- `.detail-rullo-hook` callout gold sotto buy box (gradient + border-left).
- `.detail-rullo-hook .rullo-hook-head/copy/count`
- `@keyframes robi-flash-pulse` + `.topbar-bal.robi-flash` (box-shadow + bg).

### Cache-bust + footer
- `dapp.html` script `dapp.js?v=4.41.0` · style `dapp.css?v=4.41.0` ·
  footer `alfa-2026.05.24-4.41.0`.

## 3. Guardrail anti-inflazione ROBI · 3 layer · riferito esplicito

(Condizione firma Skeezu — *"attenzione all'inflazione dei ROBI"* —
parole dei sue reply 24 May).

### LAYER 1 · cap hard per airdrop
- `airdrop_config.robi_seeding_max_per_airdrop` (default `50`).
- Applicato in `tf_airdrop_seed_rullo` come
  `LEAST(N_target, max_per_airdrop)`.
- **Effetto**: nessun singolo airdrop può seminare più di 50 ROBI,
  indipendentemente da total_blocks.
- **Esempio**: airdrop 5000 blocchi → `floor(5000 × 0.02) = 100` →
  clip a 50. Airdrop Fontanella 405 → `floor(405 × 0.02) = 8` (sotto cap,
  nessun clip).

### LAYER 2 · contabilizzazione emissione tracciata (NO conio a vuoto)
- Colonne `treasury_stats.robi_rullo_seeded` / `robi_rullo_redeemed`.
- Update transazionale:
  - **At-seed** (Chunk 2): `+robi_rullo_seeded`.
  - **At-mining** (Chunk 3): `+robi_rullo_redeemed` AND
    `+nft_circulating` AND `+nft_minted`.
- **Vista `v_treasury_robi_supply`** espone real-time:
  - `robi_circulating` (totale ROBI in giro)
  - `robi_rullo_seeded` / `redeemed` / `outstanding`
  - `robi_rullo_pct_of_circulating` (peso rullo nel pool)
  - `eur_per_robi_implied` (rate implicito treasury/circulating)
- **Stato attuale (post-2 test seed)**:
  - seeded = `12` (2 dal test #1 + 10 dal test #2)
  - redeemed = `0` (ancora niente mining)
  - outstanding = `12`
  - pct = `0%` (zero impatto su circulating pre-mining)

### LAYER 3 · quota giornaliera levetta (default OFF · Skeezu-attivabile)
- `airdrop_config.robi_seeding_daily_cap_total` (default `0` = OFF).
- Se > 0, in `tf_airdrop_seed_rullo` calcola `seeded_today` dalla
  somma `robi_amount` su `created_at::DATE = CURRENT_DATE` e clippa
  N_final al `daily_remain`.
- Se cap raggiunto, l'airdrop **parte senza rullo** (NOTICE log).
- **Stato**: OFF. Skeezu può attivarla con un UPDATE singolo:
  ```sql
  UPDATE airdrop_config SET value = '20' WHERE key = 'robi_seeding_daily_cap_total';
  ```
- **Quando attivare**: Beta/Pre-Prod se `v_treasury_robi_supply` mostra
  `robi_rullo_pct_of_circulating` > soglia (decidibile col tempo).

### Coerenza con `project_robi_mining_coherence`
- I ROBI seminati non sono coniati a vuoto (LAYER 2).
- Hanno un upper bound certo per airdrop (LAYER 1) e potenziale cap
  cross-airdrop (LAYER 3 levetta).
- `eur_per_robi_implied` permette di vedere l'effetto del rullo sul
  rate ROBI/EUR in tempo reale.

## 4. Seed deterministico per UI-click ROBY · 2 airdrop test live

### Test #1 · formula B naturale (verifica trigger)
- **airdrop_id**: `17bf0c89-86a7-40b3-8229-bb18297cb282`
- **URL**: `https://airoobi.app/dapp/airdrop/17bf0c89-86a7-40b3-8229-bb18297cb282`
- **Titolo**: `GS-16 TEST · Il rullo ROBI · UI-click ROBY`
- **Total blocks**: 100 · **Price**: 20 ARIA/blocco
- **Seeding via trigger formula B**: `floor(100 × 0.02) = 2 ROBI`
- **Block numbers con ROBI nascosto**: `[13, 23]` (random salvati at-creation)
- **Cosa verificare a UI-click**:
  1. L'aggancio "Il rullo ROBI" mostra **"2 ROBI ancora nel rullo"** (counter live)
  2. Acquisto random non garantisce reveal (2/100 = 2% per blocco)

### Test #2 · seed deterministico (reveal flow E2E)
- **airdrop_id**: `0dac01af-ec75-4fd3-910a-20af6d1a446b`
- **URL**: `https://airoobi.app/dapp/airdrop/0dac01af-ec75-4fd3-910a-20af6d1a446b`
- **Titolo**: `GS-16 TEST DET · Rullo deterministico · UI-click ROBY`
- **Total blocks**: 10 · **Price**: 20 ARIA/blocco
- **Seeding manuale**: TUTTI i 10 block_number hanno 1 ROBI nascosto
  (`[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`)
- **Cosa verificare a UI-click**:
  1. L'aggancio mostra **"10 ROBI ancora nel rullo"**
  2. Acquisto **qualsiasi numero di blocchi** → **GARANTITO ROBI trovato**
  3. Toast distinto gold *"◆ +N ROBI · trovato nel rullo!"* compare ~800ms
     dopo il toast acquisto
  4. Topbar ROBI si aggiorna con +N istantaneo + **flash gold animation**
     2 cicli
  5. Voce nello storico ROBI con `source='gs16_rullo_block'` (verifica via
     Portafoglio se hai un viewer · oppure direct query)
  6. Counter aggancio decrementa: dopo acquisto di 3 blocchi mostra
     **"7 ROBI ancora nel rullo"**

**Suggerimento**: parti dal test #2 (più rapido) · poi prova test #1 per
verificare counter "2 ROBI" e tentare 5-10 acquisti casuali.

## 5. Knock-on Closure v3 PR-3 · chiuso

Commento ingannevole W5 PR-3 (`20260522150000_w5_closure_pr3_cleanup_
consolazione.sql:7`):
> *"I ROBI del rullo sono già accreditati all'acquisto del blocco"*

**Pre-GS-16**: era FALSO (buy_blocks non accreditava).
**Post-GS-16 (questo Chunk 3)**: è VERO (logica RULLO accredita istantaneo).

Sistemato con comment inline esplicativo nel nuovo `buy_blocks` (vedi
Chunk 3 SQL: *"GS-16 fix commento ingannevole W5 PR-3"*). La premessa
di `process_seller_acknowledge` PR-3 è ora coerente: la consolazione
non-vincitori (ROBI del rullo accumulati durante la corsa) è
effettivamente nel wallet.

## 6. Cadenza · stato attuale

1. ✅ Skeezu GO formula B + guardia anti-inflazione
2. ✅ CCP ship GS-15p1 → ROBY firma (precedente)
3. ✅ **CCP build GS-16 cluster** — 5 chunk · 3 BE migration applicate +
     2 FE chunk live · 4.41.0
4. ✅ CCP seed deterministico — 2 airdrop test live, block_numbers
     comunicati sopra §4
5. **→ ATTESA ROBY UI-click verifica GS-16 → firma** (siamo qui)

Counter golden-session potenziale post-firma: **15/16**. Resta solo
GS-3 meta (chiusura UAT → go-live).

## RS — paste-ready

```
RS · GS-16 CLUSTER SHIPPED · standby UI-click ROBY

GS-16 5 chunk LIVE su airoobi.app 4.41.0 (commit 238f63a):

BE (3 migration applicate live Supabase):
- Chunk 1: airdrop_block_seeds + treasury_stats robi_rullo_seeded/
  redeemed + 4 airdrop_config + v_treasury_robi_supply +
  get_airdrop_rullo_count RPC
- Chunk 2: trg_airdrop_seed_rullo (formula B 2% + guardrail 3 layer)
- Chunk 3: buy_blocks rewrite accredito istantaneo ROBI rullo +
  revealed_robi nel JSON + fix commento W5 PR-3

FE (2 chunk):
- Chunk 4: aggancio "Il rullo ROBI" pagina airdrop (loadRulloHook)
  con copy ROBY verbatim · mostra QUANTI, mai DOVE
- Chunk 5: reveal post-mining (toast gold +800ms · flash topbar 2x ·
  refresh ROBI delta-style)

GUARDRAIL ANTI-INFLAZIONE ROBI 3 LAYER (condizione firma Skeezu):
- L1 cap hard per airdrop 50 (config robi_seeding_max_per_airdrop)
- L2 contabilizzazione emissione tracciata (treasury_stats colonne +
  vista v_treasury_robi_supply real-time)
- L3 quota giornaliera levetta OFF default (config
  robi_seeding_daily_cap_total=0, Skeezu-attivabile)

2 AIRDROP TEST LIVE PER UI-CLICK ROBY:

Test #1 (formula B verify):
  airdrop_id=17bf0c89-86a7-40b3-8229-bb18297cb282
  URL=airoobi.app/dapp/airdrop/17bf0c89-86a7-40b3-8229-bb18297cb282
  100 blocchi · 2 ROBI naturali su [13, 23]
  Verifica: aggancio "2 ROBI ancora nel rullo"

Test #2 (reveal E2E DETERMINISTIC):
  airdrop_id=0dac01af-ec75-4fd3-910a-20af6d1a446b
  URL=airoobi.app/dapp/airdrop/0dac01af-ec75-4fd3-910a-20af6d1a446b
  10 blocchi · TUTTI con ROBI (seed manuale)
  Verifica: qualsiasi acquisto → +N ROBI istantaneo, toast gold,
  flash topbar, storico, counter decrementa

KNOCK-ON: commento ingannevole W5 PR-3 sistemato in Chunk 3 ·
Closure v3 consolazione non-vincitori = ROBI rullo accumulati durante
corsa, ora effettivamente nel wallet.

Standby firma. Counter potenziale 15/16, resta GS-3 meta go-live.
```

## Bottom line

GS-16 cluster live · 5 chunk completi (BE 3 migration + FE 2 chunk) ·
guardrail anti-inflazione 3 layer wired e documentato (condizione firma
Skeezu) · 2 airdrop test seminati con block_numbers comunicati sopra
per UI-click ROBY. Standby firma. Con GS-16 firmato golden-session 15/16,
resta solo GS-3 meta. AIROOBI a un passo dal go-live.

Audit-trail: questo file = CCP shipped GS-16 cluster post-GO ROBY · 5
chunk delivered consegna singola · commit 238f63a push main Vercel
deploy 4.41.0 · BE 3 migration applicate live Supabase
(20260524130000_gs16_rullo_chunk1_schema · 20260524130001_chunk2_seeding ·
20260524130002_chunk3_buy_blocks) · FE 2 chunk live dapp.js loadRulloHook
+ confirmBuy reveal + dapp.css rullo-hook + robi-flash · guardrail
anti-inflazione 3 layer riferito esplicito (L1 cap 50 per airdrop · L2
contabilizzazione emissione tracciata treasury_stats + vista
v_treasury_robi_supply real-time · L3 quota giornaliera levetta OFF
Skeezu-attivabile) condizione firma Skeezu rispettata · 2 airdrop test
live: #1 formula B 100 blocchi 2 ROBI su [13,23] id=17bf0c89-...82 ·
#2 deterministic 10 blocchi tutti ROBI id=0dac01af-...46b · knock-on
Closure v3 PR-3 chiuso (commento ingannevole sistemato Chunk 3) ·
cadenza 1-item standby UI-click ROBY → firma → 15/16 counter potenziale
restante GS-3 meta.

---

*CCP · CIO/CTO Airoobi · shipped GS-16 cluster IL RULLO ROBI · 5 chunk live + 2 airdrop test · 24 May 2026 · daje team a 4*
