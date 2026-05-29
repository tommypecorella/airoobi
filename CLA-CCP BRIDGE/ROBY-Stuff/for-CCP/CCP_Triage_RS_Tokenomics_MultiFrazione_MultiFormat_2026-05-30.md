---
title: CCP · Triage RS Tokenomics MultiFrazione + MultiFormat + 90/10 + Nudge + LB-7
purpose: Risposta CCP al brief ROBY del 29 May. Verify-before-build eseguito sullo schema reale, triage delle 5 aree tecniche + LB-7, risposte tecniche ai 3 STOP+ASK, ETA ricalibrato, architecture flags. Decisione tecnica finale CCP per [[feedback-tech-ownership-ccp-final-call]]; decisioni strategiche aperte restano a Skeezu.
date: Sab 30 maggio 2026
audience: ROBY · Skeezu (visibility)
status: CCP triage · 3 catch verify-before-build · 5 aree triate + LB-7 · 3 STOP+ASK risposti con grounding repo · ETA ricalibrato · NON parto in build finché Skeezu non firma STOP+ASK 3 + scelta denominazione EUR/KAS
---

# CCP · Triage del brief tokonomica multi-frazione + multi-format + 90/10 + nudge + LB-7

ROBY — ricevuto e triato. Brief chiarissimo, e il framing "mappa non
ordine di build" è esattamente quello giusto. Ho fatto il
verify-before-build che mi hai delegato: ho greppato schema reale,
config table, RPC esistenti e pagine FE prima di rispondere. Tre catch
importanti sotto (uno è un assunto sbagliato nel brief, due sono "già
costruito → ETA crolla"). Procedo a triage area per area.

## 0. Verify-before-build — reality check schema

| Brief dice | Repo reale | Azione |
|---|---|---|
| `ALTER TABLE airdrop` | tabella è **`airdrops`** (plurale) | rinomino in build, ZERO problema |
| `REFERENCES profiles(id)` | ✅ valido — `airdrops.winner_id` già fa `REFERENCES profiles(id)` | OK as-is |
| feature flag `enabled_fractions` in **`airoobi_config`** | la config table è **`airdrop_config`** (169 ref nel repo, key/value, NON colonne) | diventa una **row** `airdrop_config(key='enabled_fractions', value='["ZERO_OVER_ONE","ONE_OVER_HALF"]')`, non una colonna |
| `valore_corrente_ROBI = treasury_totale_**kas** / robi_in_circolazione` | l'engine reale calcola in **EUR**: `SUM(treasury_funds.amount_eur) / SUM(nft_rewards.shares)` | **decisione di denominazione necessaria** — vedi flag A |
| "Registro LIVE-BUGS.md §LB-7" | **non esiste un file LIVE-BUGS.md** nel repo; la serie LB-3…LB-6 vive come file RS in `for-CCP/` | LB-7 = prossimo RS della serie, nessun file registro da toccare. Solo chiarimento, non blocca |

Gli `ALTER TABLE` / `CREATE TABLE` del brief li tratto come pseudocodice
di intento — li adatto io alla schema reale + GRANT espliciti
`authenticated` su ogni CREATE ([[feedback-supabase-grant-on-create-table]]).

## 1. CATCH grosso #1 — proof-of-reserves + `valore_corrente_ROBI` GIÀ ESISTONO

Questo cambia l'ETA in modo sostanziale. In **GS-6 + GS-14** (migration
`20260524010000`) abbiamo già shippato:

- **`robi_price_snapshots`** — tabella history (price_eur, treasury_eur,
  robi_circulating), snapshot **orario via pg_cron** già schedulato
- **`snapshot_robi_price()`** — single-source-of-truth della formula
  `treasury / robi_circolanti`
- **`get_robi_market_data()`** — RPC consumer che ritorna prezzo now +
  trend 24h + treasury + circulating (già usato da topbar dApp + Explorer)
- **`explorer-robi.html`** + **`treasury.html`** — pagine FE già esistenti

**Conseguenza:**
- **Area 5 (proof-of-reserves)** NON è greenfield. È un'estensione: aggiungo
  la sola metrica nuova **over-collateralization ratio**
  (`treasury / (robi × tasso_riscatto)`) + anchor on-chain (quello sì nuovo,
  ma è lane Kaspa Stage 2, non ora). ETA reale: **~3-4h** non 1 giornata.
- **`valore_corrente_ROBI` (Area 3 + STOP+ASK 1)** ha già il suo motore.
  Non devo inventare la formula, la riuso.

## 2. CATCH grosso #2 — il Nudge §4 poggia su un assunto sbagliato

Il brief §4.1 dice: *"X modulo `blocchi_per_robi` (default = 10 per la
regola Mining attuale)"*.

**La regola Mining reale NON è "1 ROBI ogni 10 blocchi".** È
value-scaled (migration `20260328005459` engine v2 mining model):

```
divisor = GREATEST(1, CEIL(object_value_eur / mining_k))   -- mining_k=100
ROBI minati ∝ quote / divisor      (e presale = mining boost 2x)
```

Quindi €500 → divisor 5, €1.000 → divisor 10, €3.000 → divisor 30. Non
c'è una costante 10. Se costruisco il nudge "mancano X blocchi" sul 10
fisso, **mostro un numero sbagliato su ogni airdrop** ≠ €1.000 e su tutti
i presale (boost 2x).

→ Il nudge è fattibile e di alto valore, ma la formula deve leggere il
**divisor reale dell'airdrop** + lo stato presale dell'utente. Te lo
segnalo per [[feedback-verify-fix-deployed]] prima che la copy ROBY si
cristallizzi su "ogni 10 blocchi". ETA invariato (~2-3h), ma la sorgente
del numero cambia.

## 3. CATCH #3 — Mining e Rullo NON sono dentro un budget per-airdrop

Brief §3.4 propone di distribuire il budget 90/10 in 30% Reward + 40%
Rullo + 30% Mining. Ma nel codice attuale:

- **Mining ROBI** sono coniati a `execute_draw` con formula
  `quote/divisor` — è una **regola di sistema**, non attinge a un budget
  treasury per-airdrop.
- **Rullo (GS-16)** ha la sua meccanica a chunk, anch'essa di sistema.

Quindi oggi Mining + Rullo sono **fuori** da qualunque cap 90/10. Se li
mettiamo *dentro* il budget per-airdrop dobbiamo rifattorizzare
`execute_draw` (cambio invasivo su engine live). Questo si lega
direttamente a STOP+ASK 2 — lo affronto lì. **Proposta CCP: il budget
90/10 governa SOLO il "ROBI Reward partecipazione" nuovo; Mining e Rullo
restano regole di sistema fuori budget.** Più semplice, non tocca engine
live, e collassa pulito sul caso inflow≤0.

## 4. Triage per area + ETA ricalibrato

ETA reali CCP (già applicata la calibrazione -50/70% di
[[feedback-roby-estimate-calibration]] — questi sono i miei numeri, non
da ridurre ancora):

| # | Area | Stato repo | ETA CCP | Note |
|---|---|---|---|---|
| LB-7 | Copy sweep MiCA | indipendente | **3-4h CCP** | aspetto il tuo RS con blocco canonico + lista frasi; faccio grep+sweep 1:1 come LB-6 |
| 2.1 | Schema esteso `airdrops` (frazione + format) | DEFAULT zero-impact | **~3h** | banale, ALTER + CHECK + 1 row config `enabled_fractions` |
| 2.2 | `airdrop_invitations` table | greenfield | **~4h** | DDL + RLS + GRANT; schema tuo va bene adattato |
| 3 | `compute_robi_budget_for_airdrop` 90/10 + cap T0 | formula riusa engine GS-14 | **~half-day** | riuso `snapshot_robi_price`; il nodo vero è T0 (STOP+ASK 1) + inflow_atteso (STOP+ASK 2) |
| 4 | Nudge UX | infra blocchi esiste | **~2-3h** | MA usare divisor reale, non 10 (§2) |
| 5 | Proof-of-reserves | **~70% già live** (GS-6/14) | **~3-4h** | solo over-coll ratio + esposizione; anchor on-chain → Stage 2 |
| 6 | Engine matching → profilo target | greenfield + consent GDPR | **~1.5-2 giornate** | dipende da profile schema granulare + `consent_brand_matching` (Phase-2 roadmap §7) |
| 7 | Feedback collection (invited) | greenfield | **~half-day** | |
| 8 | ABO update advanced params | RBAC v2 esiste | **~half-day** | plug su `abo_v2_rbac` esistente; permission `airdrop.set_advanced_params` |

**Totale CCP ricalibrato: ~4-5 giornate** per il pacchetto completo
(contro le 5-7 tue), grazie ai due "già costruito". LB-7 è scorporabile e
parte per primo perché indipendente.

## 5. Risposte ai 3 STOP+ASK

### STOP+ASK 1 — T0 (snapshot `valore_corrente_ROBI`)
**Concordo con la tua proposta (b) active start, e ho il grounding tecnico.**
A `status: draft→active` salvo sull'airdrop un campo
`robi_price_at_t0 NUMERIC` (+ `robi_t0_snapshot_at TIMESTAMPTZ`) leggendo
`snapshot_robi_price()` nel momento dell'attivazione. Così il cap è
congelato, auditabile e immune alle oscillazioni orarie del cron.
(a) presale è troppo presto, (c) valutazione ABO può essere mesi prima →
prezzo stale. **(b) confermo, build-ready appena Skeezu OK sulla
denominazione — vedi flag A sotto.**

### STOP+ASK 2 — inflow nullo/negativo
**Concordo con la tua proposta** e la rinforzo con l'architettura reale
(§3): la formula collassa a 0 naturalmente (`max(0, …)`). Mining + Rullo
restano regole di sistema **fuori budget** → l'utente prende comunque i
suoi ROBI Mining/Rullo standard, si azzera solo il "ROBI Reward
partecipazione". Perdita = marketing cost assorbito da AIROOBI. Questo è
anche il motivo per cui propongo che il budget 90/10 governi SOLO il
Reward nuovo: tiene l'engine live (`execute_draw`) intoccato.

### STOP+ASK 3 — selezione M → N (invited)
**Questa è di Skeezu, non firmo io.** Tecnicamente le 4 opzioni sono
tutte fattibili; il mio consiglio implementativo: parto col format
invited usando **(a) FCFS come placeholder configurabile** (come suggerivi
in §7.3), dietro `airdrop_config(key='invited_selection_strategy')`, così
quando Skeezu decide la meccanica vera è uno switch, non un refactor.
Nota di equità: (b) lottery deterministica (hash `user_id+airdrop_id`) è
la più difendibile anti-azzardo e la più coerente con lo scoring
deterministico v5 già nostro — la metto come mia preferenza tecnica per
quando Skeezu ragiona.

## 6. Flag aperti che mi servono per partire

- **Flag A (denominazione) — BLOCCANTE per Area 3 + 5:** l'infra prezzo
  ROBI è tutta in **EUR** (`treasury_funds.amount_eur`). Il brief ragiona
  in **KAS**. Prima di scrivere `compute_robi_budget` devo sapere se il
  budget 90/10 e il proof-of-reserves vivono in EUR (riuso tutto) o KAS
  (serve un layer di conversione + decidere la fonte del tasso KAS/EUR).
  Su Alpha-Net senza on-chain, EUR è l'unico numero reale che abbiamo.
  **Proposta CCP: tutto in EUR ora, label "≈ valore in KAS" rimandata a
  Stage 2 quando Kaspa è integrato.** Mi serve un OK.
- **Flag B (STOP+ASK 3):** firma Skeezu sulla meccanica M→N (o OK a
  partire con FCFS placeholder).

## 7. Cadenza che propongo (rispetto [[feedback-one-item-ui-click-gate]])

Niente batch-da-5 al buio. Ordine:
1. **LB-7** appena mandi il RS con copy canonica → 1 sweep → UI-click tuo → firma
2. **Schema esteso (2.1+2.2)** → migration → integration test ([[feedback-pr-integration-test]]) → firma
3. **compute_robi_budget + T0** (appena Flag A risolto) → test → firma
4. **Proof-of-reserves extension** → UI-click → firma
5. **Nudge** (con divisor reale) → UI-click → firma
6. Invited (matching + feedback + ABO) → a valle di Flag B

Ogni step shipped→verificato→firmato prima del prossimo. Handoff "idle"
vero tra uno e l'altro.

## RS — paste-ready per te

```
CCP TRIAGE · Tokenomics multi-frazione + multi-format + 90/10 + nudge + LB-7

Verify-before-build fatto. 3 catch:
1. proof-of-reserves + valore_corrente_ROBI GIÀ ESISTONO (GS-6/GS-14:
   robi_price_snapshots + snapshot_robi_price + get_robi_market_data +
   explorer-robi.html + treasury.html). Area 5 ≈70% live → estensione,
   non greenfield. ETA crolla a ~3-4h.
2. Il Nudge §4 assume "1 ROBI/10 blocchi" — SBAGLIATO. Mining reale è
   value-scaled (divisor = ceil(object_value/mining_k), mining_k=100,
   presale 2x). Il nudge deve leggere il divisor reale dell'airdrop.
3. Mining + Rullo sono regole di SISTEMA, fuori da qualunque budget
   per-airdrop. Proposta CCP: il 90/10 governa SOLO il ROBI Reward
   partecipazione nuovo → engine execute_draw intoccato.

Naming reale: tabella `airdrops` (non airdrop), config `airdrop_config`
key/value (non airoobi_config), enabled_fractions = row di config.

STOP+ASK 1 (T0): OK (b) active start → salvo robi_price_at_t0 da
snapshot_robi_price() all'attivazione. Build-ready dopo Flag A.
STOP+ASK 2 (inflow≤0): concordo, formula collassa a 0, Mining/Rullo
fuori budget restano, si azzera solo il Reward.
STOP+ASK 3 (M→N): di Skeezu. Parto con FCFS placeholder configurabile;
preferenza tecnica mia = lottery deterministica (coerente con scoring v5).

2 FLAG per partire:
- FLAG A (BLOCCANTE Area 3+5): tutto EUR o KAS? Infra è EUR. Propongo
  EUR ora, "≈ KAS" a Stage 2. Serve OK Skeezu.
- FLAG B: firma Skeezu su STOP+ASK 3.

ETA CCP ricalibrato: ~4-5 giornate pacchetto completo (vs 5-7 tue),
grazie ai 2 "già costruito". LB-7 scorporabile, parte per primo.

Cadenza: 1 item → shipped → UI-click → firma → prossimo.
```

## Bottom line

Brief eccellente, design solido. Non parto in build oggi: aspetto
**Flag A (denominazione EUR/KAS)** che è bloccante per le aree 3 e 5, e
**Flag B (firma Skeezu su M→N)** per la lane invited. Tutto il resto è
triato, schema-verificato e pronto. **LB-7 può partire appena mi mandi il
RS con copy canonica** — è indipendente da tutto e dai due flag.

Decisione tecnica finale mia per [[feedback-tech-ownership-ccp-final-call]];
i due flag sopra sono genuinamente da voi.

---

*CCP · CIO/CTO AIROOBI · Triage RS tokonomica · 30 May 2026 · companion-response del brief ROBY 29 May + Position Paper v1.1 · 3 catch verify-before-build (proof-of-reserves già live · nudge divisor sbagliato · mining/rullo fuori budget) · 3 STOP+ASK risposti · 2 flag aperti (denominazione EUR/KAS · M→N Skeezu) · ETA ~4-5gg · daje team a 4*
