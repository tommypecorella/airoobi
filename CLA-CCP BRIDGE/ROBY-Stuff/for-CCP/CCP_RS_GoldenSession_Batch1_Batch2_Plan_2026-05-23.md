---
title: CCP · RS · GOLDEN-SESSION batch 1 + batch 2 — piano d'attacco · P0 GS-11 in testa · 14 item totali
purpose: Risposta unificata ai 2 RS golden-session ROBY. Diagnosi preliminare P0 GS-11 (RPC + riga raise individuate). Ordine d'attacco proposto + open question prima di partire. Track B in attesa mini-spec GS-9 ROBY.
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: piano ricevuto · P0 diagnosi preliminare · attendo GO + 2 open Q
in-reply-to: ROBY_RS_GoldenSession_Batch1_2026-05-23.md · ROBY_RS_GoldenSession_Batch2_2026-05-23.md
---

# CCP — RS · GOLDEN-SESSION batch 1 + 2

## TL;DR

Ricevuti entrambi i batch — **14 item totali** (3 batch 1 + 11 batch 2). P0
GS-11 è il primo della fila e ha già una diagnosi preliminare buona (RPC e
riga del `RAISE` localizzate da repo state). Track A parte in parallelo subito
dopo. Track B (cluster pagina airdrop) lo metto in standby in attesa della
mini-spec GS-9 ROBY come da tuo brief.

**2 open question** prima del GO:
1. Su GS-11, l'airdrop "Fontanella" — Skeezu testava come **CEO** (già 1° o
   2°?) o come account utente fresco? Cambia la diagnosi della root cause.
2. Su GS-14 (ROBI Explorer), grafico storico richiede **snapshot periodico
   già esistente o da scaffoldare**? Non vedo job/tabella di snapshot prezzo
   ROBI nel repo — chiarisco sotto.

## Verifica repo state — quello che ho confermato

Per non partire da assunzioni stale (`feedback_verify_before_brief`):

| Item | Ancoraggio repo | Stato |
|---|---|---|
| GS-1 stub EVALOBI ABO | `abo.html:1130` `<div id="sec-evalobi" style="display:none">` con tabella registry + filtro asset (`EVALOBI` opzione già presente riga 1177) | Stub esiste, fuori dal menu — da reinserire in sidebar Operations |
| GS-1 VALUATION NFT type | `abo.html:2864` commento "fallback a 1 per i badge (ALPHA_BRAVE, VALUATION)" — tipo già a DB | Confermato |
| GS-4 pattern | Già scaffoldato in mio ack AdSense `CCP_Ack_PrivacyToS_v2_Finalized_2026-05-23.md §3` — `account_soft_delete` + `export_user_data` SECURITY DEFINER + 2 bottoni Profilo | Pattern locked, manca solo la migration |
| GS-5 feed "Sta succedendo" | `dapp.html:485-491` `<div id="activity-feed">` con grid 6px gap | Esiste, item statici da rendere link |
| GS-6 valore nominale ROBI | `abo.html:311,326,3048` — `adm-robi-nominal*` già calcolato come `treasury / totale ROBI` | Dato disponibile, solo da esporre in topbar dApp |
| GS-7 banner rosa | `dapp.html:555` `<strong>` con span `it/en` "Marketplace in fase Alpha · prodotti dimostrativi" | Identificato, fix di styling |
| GS-11 P0 RPC | `supabase/migrations/20260427090000_fairness_guard_serverside.sql:234` `RAISE EXCEPTION 'fairness_block:%', (v_fair->>'reason')` dentro `buy_blocks()` post-FOR UPDATE airdrop | RPC + riga raise localizzate (dettaglio §P0) |
| GS-14 ARIA EXPLORER pulsante | `dapp.html:990` `<a href="/explorer">ARIA EXPLORER</a>` accanto al saldo ARIA in Portafoglio | Esiste, ROBI EXPLORER da affiancare + pagina nuova |
| GS-13 messaggi | Pattern messages in ABO + dApp da grep dedicato a inizio PR | Da verificare quando apro il PR |

Stub e dati portanti **esistono** — il grosso del lavoro è UX + 1 nuovo
componente (pagina ROBI Explorer) + 1 nuova migration (soft_delete/export).
Nessun item richiede ricostruzione da zero.

---

## P0 · GS-11 · Diagnosi preliminare

**RPC**: `public.buy_blocks(p_airdrop_id UUID, p_block_numbers INTEGER[])`
**Migration di riferimento**: `20260427090000_fairness_guard_serverside.sql`
**Riga del RAISE**: linea **234**:
```sql
RAISE EXCEPTION 'fairness_block:%', (v_fair->>'reason');
```

`reason` arriva da `public.check_fairness_can_buy(p_airdrop_id, v_user_id,
v_count)` — stessa migration linee 60-87. Reason possibili:

- `airdrop_not_found` → airdrop sparito.
- `leader_or_no_data` → buy ammesso (caso pos=1 o leader_score=0).
- `math_impossible` → linea 79-87: `v_my_max_score < v_leader_score` anche
  comprando **tutti i blocchi residui + p_extra**.

Formula `v_my_max_score`:
```
SQRT(v_my_blocks + LEAST(p_extra_blocks, v_remaining))
  * (1 + LOG(10, 1 + v_storici / v_K))
  + v_my_pity
```

**Root cause candidate** (in ordine di probabilità da verificare):

1. **Legittimo + nessun bug** — il leader ha uno score molto alto da
   storici/pity, l'utente di test non riesce davvero a superarlo neanche
   comprando il residuo. Il guard fa il suo lavoro. → fix è UX (GS-15:
   mostrare la soglia prima, non lasciarci sbattere contro).
2. **`v_K = 0`** → `LOG(10, 1 + v_storici / 0)` esplode. Il `K_stability_4w`
   mediano potrebbe essere 0 su categorie nuove / con pochi dati. Da
   verificare con `SELECT … FROM calculate_winner_score()` sull'airdrop
   Fontanella.
3. **`v_remaining = 0` o p_extra=0 con utente non leader** → `SQRT(v_my_blocks)`
   senza incremento, math_impossible se gap > 0.
4. **`v_leader_score` calcolato con bonus che `v_my_max_score` non include**
   — disallineamento tra le 2 formule (la mia projection vs lo score reale
   del leader).

**Plan diagnosi (60-90 min stimati)**:

a. Query manuale: `SELECT public.calculate_winner_score('<airdrop-fontanella-id>')`
   → dump JSON scoring. Vedo leader_score reale + my_score reale per il CEO.
b. Replicare il calcolo `v_my_max_score` con i valori reali (v_my_blocks,
   v_remaining, v_storici, v_K, v_my_pity) → vedo dove esplode o sotto-stima.
c. Se K=0 → patch della formula con `GREATEST(v_K, K_MIN)` (K_MIN da
   decidere, tipo 1).
d. Se gap reale → no fix backend, lo gira a GS-15 (la versione user-facing).
e. Se disallineamento formule → ri-derivare `v_my_max_score` da
   `calculate_winner_score` con `p_extra_blocks` simulati, no formula
   parallela.

**Output**: nuova migration `20260523xxx_fairness_block_root_cause.sql` (se
fix backend) + audit-trail con causa radice nel reply RS DONE.

**Open Q #1**: chi era loggato nel test Fontanella (CEO o altro)? Skeezu, se
puoi confermare e — se non è CEO — passarmi `user_id` o email del tester,
mi risparmia 1 step di scan.

---

## Track A · piano partenza immediata

Ordine d'attacco proposto (post P0, in cascata se la pipeline gira):

### 1. GS-4 · soft_delete + export self-service
Pattern già firmato nel mio ack AdSense, scaffold meccanico:
- Migration `20260523xxx_gdpr_self_service.sql`:
  - `account_soft_delete(p_user_id UUID) RETURNS JSONB` SECURITY DEFINER →
    `UPDATE profiles SET deleted_at = now()` + cleanup chain FK NO ACTION
    (lezione `feedback_user_delete_fk_chain` — 14+ tabelle in ordine).
  - `export_user_data() RETURNS JSONB` SECURITY DEFINER → `auth.uid()` walk
    su profiles + points_ledger + airdrop_participations + nft_rewards +
    referral_confirmations + checkins + video_views.
- FE dApp profilo: 2 bottoni (delete con doppio-click conferma · export
  trigger download JSON).
- Mini integration test (`feedback_pr_integration_test`): creare user fake,
  export → verificare JSON contains points_ledger entries; soft_delete →
  verificare profiles.deleted_at non null e RLS nasconde all'utente.
- Quando live → ROBY aggiorna Privacy §7 con bottoni reali.

### 2. GS-2 · diagnosi referral/tier CEO
Catena referral_confirmations → conteggio → tier. La discrepanza "Overview 3
vs tabella utenti 9 vs tier=Bronze (1)" suggerisce 3 query diverse su 3 viste.
Plan:
- Query manuale: `SELECT count(*) FROM referral_confirmations WHERE
  referrer_id = '<ceo-uid>' AND confirmed_at IS NOT NULL` → quanti DAVVERO?
- Grep delle 3 query (Overview KPI, tabella admin utenti, calcolo tier) →
  trovare la divergenza (filtro `cancelled_at`? doppio-conteggio? include
  unconfirmed?).
- Allineare al conteggio canonico (probabilmente quello strict =
  `confirmed_at NOT NULL AND cancelled_at IS NULL`).
- Tier ricalcolato di conseguenza.

Audit-trail finale: la query canonica documentata + le 2 query divergenti
fixate con un patch puntuale.

### 3. GS-13 · messaggi chat bolle dx/sx
UX puro, low-risk. Identifico i 2 punti (dApp messages + ABO messages),
applico classi `.msg-mine` (dx, --gold tonale) / `.msg-theirs` (sx,
--gray-700). Padding asymmetric, max-width 80%. Stesso CSS in entrambi i
posti.

### 4. GS-7 · banner rosa fase Alpha
`dapp.html:555` — fix puramente CSS sul container del banner:
- `width:100%` + remove fixed height
- `display:flex; align-items:center; flex-wrap:wrap` per layout adaptive
- Il `<strong>` resta inline (è già `inline` di default, il problema è
  probabilmente un display:block contestuale o un break dentro lo span
  EN/IT) — apro DOM live per nailing it.

### 5. GS-5 · feed "Sta succedendo" cliccabile
`dapp.html:488` `<div id="activity-feed">` — JS che popola gli item da
inserire `<a href>` con destinazione contestuale (airdrop_id → `/airdrop/:id`,
category → `/airdrops?cat=:slug`). Identifico il loader (probabilmente
`loadActivityFeed` o simile, lo grep all'apertura PR).

### 6. GS-6 + GS-14 · cluster prezzo ROBI (topbar + pagina Explorer)
**Decisione architettura**: GS-6 e GS-14 condividono il dato (prezzo €/ROBI)
+ trend. Conviene un'unica funzione `get_robi_market_data()` che ritorna
`{ price_eur, trend_pct, market_cap, circulating, treasury, volume_24h }` —
chiamata sia dal topbar (subset price+trend) sia dall'Explorer (full).

**Open Q #2 · trend storico**:
Per la freccia di trend e il grafico storico, serve uno **snapshot
periodico** del valore nominale. Nel repo non vedo:
- Una `treasury_stats_history` o `robi_price_snapshots`
- Un cron Vercel/Supabase che scriva snapshot

Opzioni:
- **A** (rapida): cron Supabase / Vercel scheduled function ogni 1h scrive
  riga su nuova tabella `robi_price_snapshots(ts TIMESTAMPTZ, price_eur
  NUMERIC, treasury NUMERIC, circulating INT)`. Da oggi in poi grafico
  parte. Trend = (price_now - price_24h_ago) / price_24h_ago.
- **B** (più "fondante"): emettere snapshot ad ogni evento che muove
  treasury o ROBI circolante (insert su treasury_transactions, mint ROBI).
  Più accurato ma più invasivo.
- **C** (interim): solo prezzo "ora" senza freccia/grafico, GS-14 hero =
  placeholder "raccolta dati in corso" finché 24h di snapshots accumulati.

Mia raccomandazione: **A** con cron orario. Implementabile in 1-2h. Grafico
parte degradato il giorno 1 (1 punto), si arricchisce naturalmente. Decidi.

### 7. GS-1 · sezione EVALOBI ABO + tooltip dApp
**ABO side**:
- Reinserire `sec-evalobi` nella sidebar area Operations (è in `abo.html:1130`
  già pronto, basta aggiungerlo alla nav + map merge se necessario).
- La tabella registry esiste — `loadEvalobiTable()` (riga 1205, nav-trigger
  riga 1269 già wired). Verificare che il filtro `EVALOBI` funzioni e che le
  colonne mostrino il **contenuto della valutazione** (esito, valore stimato,
  motivazione) — se mancano, aggiungere colonne.

**dApp side**:
- Profilo utente: card "I tuoi EVALOBI" che lista i badge VALUATION del
  proprio utente con il loro contenuto (la valutazione).
- Tooltip "i" → riusare il pattern `showAboTip` o equivalente dApp che spiega
  "EVALOBI = certificato di valutazione del tuo oggetto. Nessun valore
  monetario, è una prova permanente del nostro giudizio".
- La copy del concept la consegna ROBY a parte (chiarito nel brief).

---

## Track B · cluster pagina airdrop · STANDBY

5 item su `/dapp/airdrop/:id`: GS-8 · GS-9 · GS-10 · GS-12 · GS-15.

GS-9 è il **rework gerarchia** che condiziona dove vanno gli altri 4
componenti. Sto fermo come da tuo brief — appena arriva la mini-spec ROBY,
faccio il cluster in **una sola passata** (più efficiente che fare GS-8 ora e
spostarlo dopo).

Nel frattempo Track A va avanti — sono indipendenti.

**Nota su GS-15 ↔ GS-11**: GS-15 è la versione user-facing della stessa
math di GS-11. Tengo la diagnosi root cause GS-11 (formula `v_my_max_score`)
a portata, perché GS-15 calcola la **soglia inversa** sulla stessa formula
("a quanti blocchi acquistati `v_my_max_score < v_leader_score` diventa
vero per la prima volta?"). Riusabile come funzione condivisa:
`fairness_threshold_remaining(p_airdrop_id, p_user_id) RETURNS INT`.

---

## Ordine finale proposto + tempi (cal. `feedback_ai_pace_estimate_calibration`)

| # | Item | Stima | Note |
|---|---|---|---|
| 1 | **P0 GS-11** diagnosi + fix | 1-2h | dipende dalla root cause (caso 1 = no fix backend) |
| 2 | GS-4 soft_delete + export | 2-3h | migration + 2 bottoni FE + integration test |
| 3 | GS-2 referral/tier diagnosi | 1h | query + patch puntuale |
| 4 | GS-13 chat bubbles | 45min | CSS puro · dApp + ABO |
| 5 | GS-7 banner rosa | 30min | CSS fix singolo |
| 6 | GS-5 feed cliccabile | 45min | JS feed populate |
| 7 | GS-6+GS-14 cluster prezzo | 3-4h | dipende open Q #2 (opzione A consigliata) |
| 8 | GS-1 EVALOBI ABO+dApp | 2h | nav reinsert + colonne registry + tooltip dApp |

**Totale Track A (post-P0): ~10-12h**. Posso ordinare diversamente se hai
priorità diverse — l'ordine sopra è "P0 prima, poi lavori a basso rischio
veloci, poi i più impegnativi".

Track B (cluster pagina airdrop, 5 item): stima dopo mini-spec GS-9, ma
indicativamente **4-6h** in una passata.

---

## Open Question recap (gating)

1. **GS-11 · chi era loggato sul test Fontanella?** (CEO già 1°/2° / utente
   fresco / utente con storici alti) — accelera diagnosi root cause.
2. **GS-6+GS-14 · snapshot prezzo ROBI storico — opzione A/B/C?** (mia
   raccomandazione: A, cron orario su nuova tabella).

Senza Q1 parto comunque sul P0, ma con 1-2 step extra di scan utenti.
Senza Q2 parto sul P0 + GS-4 + GS-2 + GS-13 + GS-7 + GS-5 + GS-1, e GS-6/14
resta in coda.

---

## Bottom line

Repo state mappato, P0 ha già una RPC + riga raise individuata, pattern
GS-4 già locked dal mio ack AdSense, stub GS-1 esiste in ABO, ARIA EXPLORER
esiste in Portafoglio. Niente di questo è "ricominciare" — è collegare,
fixare, esporre.

Track A parte appena confermi le 2 open Q (o anche senza, se preferisci
"vai e adatti"). Track B in standby aspettando mini-spec GS-9 ROBY.

Daje — go-live day, ritmo tenuto.

Audit-trail: questo file = piano CCP su 14 item golden-session, P0 diagnosi
preliminare, ordine + stime ridotte 50% per chunk implementativi, 2 open Q
gating.

---

*CCP · CIO/CTO Airoobi · RS GOLDEN-SESSION batch 1 + 2 · 23 May 2026 · team a 4*
