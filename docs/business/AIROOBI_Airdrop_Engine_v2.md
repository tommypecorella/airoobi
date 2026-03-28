# AIROOBI — Airdrop Engine Specification
**Version 2.0 · 28 Marzo 2026 · DOCUMENTO FONDATIVO**

> Questo documento definisce le regole, gli algoritmi e l'architettura tecnica
> del motore di airdrop di AIROOBI. È la fonte di verità per ogni implementazione.
> Aggiornare questo documento prima di modificare qualsiasi logica di business.
>
> **Changelog da v1.0:**
> - FIX: Success check confronta la quota venditore (non il totale) con seller_min_price
> - FIX: Pesi scoring ribilanciati per fairness (w1: 0.50→0.65, w2: 0.30→0.20, w3: 0.20→0.15)
> - ADD: Formula quotazione corretta per garantire prezzo di mercato al venditore
> - ADD: Analisi fairness completa con stress test (scripts/stress_test_engine.js)
> - ADD: Analisi tempo accumulo ARIA e compenso perdenti
>
> **Changelog 28 Mar 2026:**
> - RESET: Dati airdrop azzerati (TRUNCATE airdrops, airdrop_blocks, airdrop_participations) per testing
> - ADD: `airdrop_messages` — chat tra proponente e valutatore (RPC: send_airdrop_message, get_airdrop_messages)
> - ADD: Multi-foto upload nel form valutazione (Supabase Storage bucket `submissions`, RPC aggiornata con p_image_urls)
> - ADD: Branding "dApp" → "APP" in tutto il codebase

---

## 1. Split Economica per Airdrop

```
100% ARIA incassato (convertito a €0,10/ARIA) =
  67,99% → Venditore P2P       (pagato in KAS, 24-48h dopo draw)
  22,00% → Fondo Comune        (aggiunto a treasury_stats automaticamente al draw)
  10,00% → Fee Piattaforma     (AIROOBI operational revenue)
   0,01% → Charity Pool        (accumulo DAO, causa selezionata dalla community)
```

**Esempio su airdrop da 10.000 ARIA (€1.000 raccolti):**
- Venditore: €679,90
- Fondo Comune: €220,00
- AIROOBI: €100,00
- Charity: €0,10

---

## 2. Pricing Venditore — Formula Quotazione

### 2.1 Il problema (v1)
Se la quotazione AIROOBI = valore oggetto, il venditore riceve solo il 67,99%.
Un oggetto da €1.000 con quotazione €1.000 → venditore incassa solo €679,90.

### 2.2 La soluzione (v2)
La quotazione AIROOBI deve compensare la split:

```
quotazione_airoobi = seller_target_price / 0.6799
```

| Valore oggetto | Quotazione corretta | N° Blocchi (5 AR) | Venditore riceve |
|---|---|---|---|
| €500 | €735,40 | 1.471 | €500,07 ✓ |
| €1.000 | €1.470,80 | 2.942 | €1.000,13 ✓ |
| €2.000 | €2.941,61 | 2.942 (10 AR) | €2.000,27 ✓ |
| €5.000 | €7.354,02 | 4.903 (15 AR) | €5.000,32 ✓ |
| €10.000 | €14.708,05 | 9.806 (15 AR) | €10.000,65 ✓ |

### 2.3 Implicazioni per l'utente
La quotazione gonfiata significa più blocchi disponibili. Questo NON penalizza l'utente:
- Il vincitore paga comunque una frazione del valore dell'oggetto
- Più blocchi = più partecipanti = più NFT distribuiti = più valore nel Fondo
- Il "house edge" apparente (47%) è in realtà distribuito: 22% al Fondo (che torna agli utenti come NFT), 10% alla piattaforma, 0.01% a charity

### 2.4 Meccanismo Tre Prezzi
| Prezzo | Campo DB | Chi lo imposta | Regola v2 |
|---|---|---|---|
| Prezzo desiderato | `seller_desired_price` | Venditore | Riferimento |
| Prezzo minimo accettabile | `seller_min_price` | Venditore | ≥ €500, confrontato con quota venditore |
| Quotazione AIROOBI | `object_value_eur` | Admin | = seller_target / 0.6799 |

---

## 3. Condizioni di Successo / Fallimento Airdrop

### 3.1 Airdrop completato con successo
L'airdrop si chiude con successo se è verificata ALMENO UNA delle seguenti:

**Condizione A — Tutti i blocchi venduti:**
```
blocchi_venduti = total_blocks
```

**Condizione B — Deadline raggiunta + prezzo minimo coperto:**
```
quota_venditore_eur >= seller_min_price
```
dove `quota_venditore_eur = aria_incassato × 0,10 × 0,6799`

> **FIX v2:** La v1 confrontava il totale incassato con seller_min_price.
> La v2 confronta la QUOTA VENDITORE (67,99% del totale) con seller_min_price.
> Questo previene il caso in cui l'airdrop "passa" ma il venditore riceve meno del suo minimo.

### 3.2 Airdrop annullato
Se alla deadline `quota_venditore_eur < seller_min_price`:
- Tutti gli ARIA spesi vengono rimborsati ai partecipanti
- NFT vengono distribuiti SOLO alla top 3 per ARIA spesi nell'airdrop (consolation NFT)
- Il Fondo Comune NON viene aggiornato
- Lo stato diventa `annullato`

### 3.3 Airdrop con blocchi invenduti (ma prezzo minimo raggiunto)
- L'airdrop si chiude ugualmente con successo
- I blocchi invenduti vengono ignorati
- Il calcolo della distribuzione usa solo `aria_incassato` reale

---

## 4. Trigger del Draw

### 4.1 Modalità manuale (default)
Il draw viene attivato dal founder dall'admin panel tramite pulsante
"Esegui Draw" nella gestione airdrop.

### 4.2 Modalità automatica (flag configurabile)
Colonna `auto_draw BOOLEAN DEFAULT false` in tabella `airdrops`.
Se `auto_draw = true`:
- Al raggiungimento del 100% blocchi → draw immediato
- Alla deadline → draw automatico (cron job sul Pi ogni 15 minuti)

### 4.3 Pre-draw checks
Prima di eseguire il draw il sistema verifica:
1. Airdrop in stato `sale` o `presale`
2. Almeno 1 blocco venduto
3. Nessun draw già eseguito (`draw_executed_at IS NULL`)
4. Se deadline: condizione di successo verificata

---

## 5. Algoritmo Selezione Vincitore

### 5.1 Principio
Determinismo puro. Il vincitore è chi ha lo score più alto.
Nessuna estrazione casuale — il risultato è verificabile e riproducibile.

### 5.2 Formula Score

```
score(utente) = (F1 × w1) + (F2 × w2) + (F3 × w3)
```

**F1 — Peso blocchi acquistati (chi partecipa di più):**
```
F1 = blocchi_utente_corrente / max_blocchi_singolo_utente_in_airdrop
```
Normalizzato 0→1. Chi ha il massimo dei blocchi ottiene F1=1.

**F2 — Fedeltà alla categoria (chi ha già speso in quella categoria):**
```
F2 = log(1 + aria_spesi_categoria_storico) /
     log(1 + max_aria_spesi_categoria_tra_tutti_partecipanti)
```
- `aria_spesi_categoria_storico` = totale ARIA spesi in airdrop della stessa categoria,
  ESCLUSO l'airdrop corrente, da tutti i tempi
- Usa logaritmo per evitare che chi ha speso 10.000 ARIA schiacci chi ne ha 100
- Normalizzato 0→1

**F3 — Seniority (chi è entrato prima e ha comprato prima):**
```
F3 = (α × rank_registrazione_norm) + (β × rank_primo_blocco_norm)
α = 0,4 (peso data registrazione)
β = 0,6 (peso data primo blocco nell'airdrop — più recente e rilevante)

rank_norm = 1 - ((rank - 1) / (n_partecipanti - 1))
```
- `rank_registrazione`: posizione dell'utente per data di registrazione (1 = primo)
- `rank_primo_blocco`: posizione per data/ora del primo blocco acquistato nell'airdrop (1 = primo)
- Chi si è registrato prima e ha comprato prima ottiene F3 più alto

### 5.3 Pesi — v2 (fairness rebalance)

```
w1 = 0,65  (partecipazione diretta — aumentato da 0,50)
w2 = 0,20  (fedeltà categoria — ridotto da 0,30)
w3 = 0,15  (seniority — ridotto da 0,20)
```

**Motivazione del rebalance:**
Con i pesi v1 (0.50/0.30/0.20), un utente veterano con massimo F2 e F3 poteva battere
un nuovo utente spendendo solo il **49%** dei blocchi. Questo rendeva il sistema
sistematicamente sbilanciato a favore dei veterani.

Con i pesi v2 (0.65/0.20/0.15), il veterano deve spendere almeno il **74%** dei blocchi
del nuovo utente per batterlo. Questo mantiene il vantaggio della fedeltà come bonus
significativo ma non dominante.

| Scenario | Soglia veterano (v1) | Soglia veterano (v2) |
|---|---|---|
| Nuovo (500 blocchi) vs Veterano (max F2+F3) | 49% (245 blocchi) | 74% (370 blocchi) |
| Stesso blocchi: differenza score | +0.26 a favore vet | +0.11 a favore vet |

> I pesi sono configurabili in `airdrop_config` (chiavi `score_w1`, `score_w2`, `score_w3`).
> Il fondatore può aggiustarli senza deploy.

### 5.4 Gestione parità
In caso di score identico (raro ma possibile):
1. Vince chi ha acquistato il primo blocco prima (timestamp)
2. Se ancora pari: vince chi si è registrato prima

### 5.5 Esempio pratico (con pesi v2)

| Utente | Blocchi | Storico cat. | Registrato | Primo blocco | Score |
|---|---|---|---|---|---|
| Alice (nuova) | 500/2000 | 0 ARIA | #10 | #1 | 0,65×1,0 + 0,20×0 + 0,15×0,6 = **0,74** |
| Bob (veterano) | 375/2000 | 5.000 ARIA | #1 | #2 | 0,65×0,75 + 0,20×1,0 + 0,15×0,4 = **0,75** |
| Carlo (veterano) | 250/2000 | 1.000 ARIA | #2 | #8 | 0,65×0,50 + 0,20×0,8 + 0,15×0,2 = **0,52** |

**Vincitore: Bob** — ma ha dovuto comprare il 75% dei blocchi di Alice.
Con pesi v1 gli sarebbero bastati il 50%.

---

## 6. Distribuzione NFT ai Perdenti (Non-Vincitori)

### 6.1 Principio anti-inflazione
La distribuzione NFT non deve erodere il prezzo unitario del ROBI.

**Vincolo matematico:**
```
prezzo_nft_attuale = treasury_balance / nft_circolante
max_nft_distribuibili = floor(contributo_fondo / prezzo_nft_attuale)
```
Se il numero di NFT calcolati supera `max_nft_distribuibili` → scala proporzionalmente.

### 6.2 Regola a fasi (mining con halvings)

| Fase | NFT per perdente | Condizione minima |
|---|---|---|
| Alpha Brave | 1 NFT ogni 5 blocchi acquistati | Minimo 1 NFT garantito |
| Alpha Wise | 1 NFT ogni 10 blocchi acquistati | Minimo 1 NFT garantito |
| Beta | 1 NFT ogni 20 blocchi acquistati | Minimo 1 se ≥ 5 blocchi |
| Pre-Prod | 1 NFT ogni 50 blocchi acquistati | Solo top 10% per blocchi |
| Mainnet | Solo top 3 per ARIA spesi | 1 NFT ciascuno, nessun altro |

### 6.3 Analisi compenso perdenti per fase di treasury

| Treasury | NFT circ. | Prezzo NFT | Perdente (100 blocchi, €50 spesi) | Loss % |
|---|---|---|---|---|
| €0 (1° airdrop) | 0→380 | €0,58 | 20 NFT × €0,58 = €11,60 | **-77%** |
| €1.000 (5° airdrop) | ~1.500 | €0,67 | 20 NFT × €0,67 = €13,40 | -73% |
| €5.000 (maturo) | ~500 | €10,00 | 20 NFT × €10 = €200 | **+300%** ✓ |

> A regime (treasury matura), i perdenti **guadagnano** tramite i ROBI.
> I primi partecipanti (Alpha Brave) subiscono perdite più alte — questo è compensato dal
> badge BADGE_FONDATORE e dai NFT Alpha Tier 0 che guadagneranno valore nel tempo.

### 6.4 Airdrop annullato
- NFT distribuiti SOLO alla top 3 per ARIA spesi nell'airdrop
- 1 NFT ciascuno (consolation prize)
- Il Fondo Comune NON viene toccato
- ARIA rimborsati al 100%

---

## 7. Processo Draw Completo (Step by Step)

```
STEP 1 — Pre-draw validation
  - Verifica stato airdrop (sale/presale)
  - Verifica draw_executed_at IS NULL
  - Calcola aria_incassato totale
  - Leggi split_venditore da airdrop_config

STEP 2 — Calcola split economica
  - venditore_payout = aria_incassato × 0,10 × split_venditore
  - fondo_contributo = aria_incassato × 0,10 × 0,22
  - airoobi_fee     = aria_incassato × 0,10 × 0,10
  - charity_contrib = aria_incassato × 0,10 × 0,0001

STEP 3 — Determina successo/fallimento
  - v2: venditore_payout >= seller_min_price (NOT totale >= min)

STEP 4 — Seleziona vincitore (se airdrop success)
  - Calcola score per ogni partecipante (sezione 5)
  - Ordina DESC per score
  - Winner = primo della lista

STEP 5 — Distribuisci NFT ai perdenti
  - Leggi fase corrente da airdrop_config
  - Calcola max_nft_distribuibili (sezione 6.1)
  - Per ogni non-vincitore: calcola e inserisci NFT (sezione 6.2)

STEP 6 — Aggiorna treasury
  - UPDATE treasury_stats: balance_eur += fondo_contributo
  - UPDATE treasury_stats: nft_circulating += nft_totali
  - Inserisci record in treasury_transactions (storico)

STEP 7 — Aggiorna airdrop
  - winner_id, winner_score, status = 'completed'
  - Tutti i campi split EUR
  - draw_scores JSONB per audit

STEP 8 — Track events
  - Inserisci eventi in events table per analytics
```

---

## 8. Tempo Accumulo ARIA — Analisi Fattibilità

### 8.1 Earning rate utente

| Azione | ARIA/giorno |
|---|---|
| Login + Check-in + 5 video | 7 ARIA |
| Welcome bonus (una tantum) | 10 ARIA |
| Referral (per invito) | 10 ARIA |

### 8.2 Tempo per partecipazione competitiva

| Scenario | ARIA necessari | Giorni | Mesi |
|---|---|---|---|
| 100 blocchi × 5 AR (piccola) | 500 | 70 | 2,3 |
| 300 blocchi × 5 AR (media) | 1.500 | 213 | 7,1 |
| 500 blocchi × 5 AR (forte, €1K) | 2.500 | 356 | 11,9 |
| 200 blocchi × 15 AR (luxury €5K) | 3.000 | 428 | 14,3 |

### 8.3 Referral impact (per 2.500 ARIA target)

| Referral | Giorni risparmiati | Totale giorni |
|---|---|---|
| 0 | 0 | 356 |
| 10 | 14 | 342 |
| 25 | 36 | 320 |
| 50 | 71 | 285 |

### 8.4 Raccomandazione
Per partecipazioni >€500 il tempo è troppo lungo (>10 mesi) considerando solo daily activity.
Possibili mitigazioni future:
- Blocchi più economici (2-3 ARIA) per categorie entry-level
- Boost events (doppio ARIA per un weekend)
- ARIA acquistabili (post-Alpha)

---

## 9. Mining Model (v2.1 — 28 Marzo 2026)

### 9.1 Principi fondamentali

- **ARIA = stablecoin** — vale sempre €0,10. Si guadagna (daily) o si compra (min €1 = 10 ARIA)
- **ROBI = quota del Fondo Comune** — come un ETF: `valore_quota = treasury / quote_circolanti`
- **Partecipare = minare quote** — tutti i perdenti ricevono quote NFT frazionarie
- **Il treasury cresce SEMPRE** — da airdrop (22%), video ads (50%), sponsor, altre attività
- **Le quote crescono SEMPRE di valore** — il mining è tanto più conveniente quanto prima lo fai

### 9.2 Mining difficulty (basata sul prezzo oggetto)

La difficoltà NON dipende dalla fase della piattaforma. Dipende dal valore dell'oggetto:

```
divisore = ceil(object_value_eur / mining_k)
mining_k = 100 (configurabile in airdrop_config)
```

| Valore oggetto | Divisore | 10 blocchi → | 100 blocchi → |
|---|---|---|---|
| €500 | 5 | 2.0 quote | 20.0 quote |
| €1.000 | 10 | 1.0 quota | 10.0 quote |
| €3.000 | 30 | 0.33 quote | 3.33 quote |
| €5.000 | 50 | 0.20 quote | 2.00 quote |
| €10.000 | 100 | 0.10 quote | 1.00 quota |

Oggetti economici = mining facile (più quote per blocco).
Oggetti costosi = mining hard (quote più rare, ma più valore per quota).

### 9.3 NFT frazionari

Ogni perdente riceve:
```
quote = blocchi_acquistati / divisore
```

Nessun `floor()` — le frazioni sono sempre distribuite. Anche 1 blocco su un
oggetto da €10.000 produce 0.01 quote.

Ogni perdente = 1 riga in `nft_rewards` con campo `shares NUMERIC(12,4)`.

### 9.4 Minimo partecipazione

```
min_aria = ceil(object_value × min_participation_pct / ARIA_EUR)
min_participation_pct = 0.01 (1%, configurabile)
```

| Valore oggetto | Min ARIA | Min EUR |
|---|---|---|
| €500 | 50 ARIA | €5 |
| €1.000 | 100 ARIA | €10 |
| €3.000 | 300 ARIA | €30 |
| €5.000 | 500 ARIA | €50 |

### 9.5 Anti-inflazione (invariato)

Il cap anti-inflazione resta: `max_nuove_quote = contributo_fondo / prezzo_quota_attuale`.
Se le quote calcolate superano il cap, vengono scalate proporzionalmente.

### 9.6 Perché non più fasi (halving)

Le fasi (alpha_brave, alpha_wise, beta, mainnet) definivano il divisore NFT.
Con il mining basato sul prezzo, le fasi non servono più per la distribuzione NFT.

Il concetto di "mining facile all'inizio" resta naturale: i primi airdrop hanno
treasury basso → il cap anti-inflazione è generoso → si minano più quote.
Man mano che il treasury cresce, il cap si stringe automaticamente.

---

## 10. SQL — Funzioni RPC

### 10.1 `execute_draw(p_airdrop_id UUID, p_service_call BOOLEAN DEFAULT false)`
La funzione principale del draw. Transazione atomica.
- **v2:** success check usa `v_venditore_eur >= seller_min_price`
- **v2:** legge `split_venditore` da `airdrop_config`
- **v2.1:** mining difficulty da `object_value_eur / mining_k`
- **v2.1:** tutti i perdenti ricevono quote frazionarie (1 riga per utente)
- **v2.1:** ritorna `mining_divisor` e `nft_shares_minted`
- Migration: `20260328005459_engine_v2_mining_model.sql`

### 9.2 `calculate_winner_score(p_airdrop_id UUID)`
Calcola lo score deterministico per ogni partecipante.
- Legge pesi da `airdrop_config` (w1/w2/w3)
- I pesi v2 vengono applicati automaticamente dopo la migration
- Nessuna modifica al codice della funzione, solo ai dati config

### 9.3 `get_draw_preview(p_airdrop_id UUID)`
Simulazione draw — solo admin.
- **v2 fix:** success check corretto
- **v2 add:** ritorna `seller_cut_eur` per confronto con `seller_min_price`

### 9.4 `refund_airdrop(p_airdrop_id UUID)`
Rimborso ARIA — nessuna modifica in v2.

### 9.5 `check_auto_draw()`
Cron — nessuna modifica diretta, usa `execute_draw` che è stato aggiornato.

---

## 10. Stress Test — Risultati

Lo script `scripts/stress_test_engine.js` simula 10 scenari con confronto v1/v2.

### 10.1 Scenari chiave

**Scenario 3: Nuovo (500 blocchi) vs Veterano (250 blocchi)**
- v1: **Veterano vince** (score 0.643 vs 0.620) — con metà dei blocchi!
- v2: **Nuovo vince** (score 0.740 vs 0.595) — chi partecipa di più viene premiato

**Scenario 5: Estremo — Nuovo (2000 blocchi) vs Veterano (1 blocco)**
- v1: Nuovo vince (0.620 vs 0.380) — ma il margine era sottile
- v2: Nuovo vince (0.740 vs 0.260) — margine molto più chiaro

**Scenario 6: Treasury matura (€5.000, 500 NFT)**
- Perdita media perdenti: **-125,8%** (guadagno!) — il modello è sostenibile a regime

### 10.2 Soglie break-even

| Pesi | Soglia veterano |
|---|---|
| v1 (0.50/0.30/0.20) | 49% dei blocchi del nuovo |
| v2 (0.65/0.20/0.15) | **74%** dei blocchi del nuovo |

### 10.3 Come lanciare il test
```bash
node scripts/stress_test_engine.js           # output sintetico
node scripts/stress_test_engine.js --verbose  # classifica per partecipante
```

---

## 11. Casi Edge

| Caso | Comportamento |
|---|---|
| 1 solo partecipante | Vince automaticamente, NFT non distribuiti |
| Tutti i blocchi a 1 utente | Vince quell'utente, F1=1, altri fattori irrilevanti |
| Nessuno storico categoria | F2=0 per tutti → non influenza il risultato |
| Draw in corso contemporaneo | Lock a livello DB (FOR UPDATE) previene race condition |
| Treasury a 0 al draw | Max NFT distribuibili illimitato (prima distribuzione) |
| Arrotondamenti split | Floor su charity, resto a venditore |
| seller_min_price NULL | Airdrop sempre success (nessun minimo venditore) |

---

## 12. Evoluzione dell'Algoritmo — Decision Log

Questa sezione documenta il **percorso decisionale** che ha portato all'algoritmo attuale.
Ogni decisione è tracciata con: contesto, alternative considerate, scelta finale e motivazione.

### 12.1 v1.0 — Design iniziale (19 Marzo 2026)

**Contesto:** Il motore viene progettato da zero. L'obiettivo è un sistema deterministico
(no lotteria) che premi l'engagement senza trasformarlo in un'asta pura.

**Decisione chiave: tre fattori di scoring**
- F1 (blocchi acquistati) — chi partecipa di più nell'airdrop corrente
- F2 (fedeltà categoria) — chi ha uno storico nella stessa categoria
- F3 (seniority) — chi è arrivato prima sulla piattaforma e ha comprato prima

**Alternative scartate:**
- Random draw (lotteria pura) → scartato perché non incentiva l'engagement e potrebbe
  configurare gioco d'azzardo
- Asta al rialzo → scartato perché il vincitore pagherebbe quasi il prezzo di mercato,
  eliminando il valore aggiunto di AIROOBI
- Primo arrivato → scartato perché favorisce solo la velocità, non la fedeltà

**Pesi scelti: w1=0.50, w2=0.30, w3=0.20**
Ragionamento: equilibrio 50/50 tra partecipazione diretta (F1) e "storia" dell'utente (F2+F3).
L'idea era che i veterani fedeli meritassero un vantaggio significativo.

**Split economica: 67.99% venditore**
La percentuale è stata calcolata per bilanciare: incasso venditore vs sostenibilità Fondo Comune
e revenue piattaforma. Il 22% al Fondo è alto di proposito per accelerare la crescita del
valore dei ROBI nei primi mesi.

**Success check:** `(aria_incassato * 0.10) >= seller_min_price`
Confronto totale incassato vs minimo venditore — sembrava corretto ma nascondeva un bug.

### 12.2 Stress Test — Scoperte (28 Marzo 2026)

**Metodo:** Simulazione di 10 scenari con `scripts/stress_test_engine.js`.
Ogni scenario viene eseguito con pesi v1 e v2 per confronto diretto.

**Scoperta 1 — Veterano dominante (Scenario 3):**
Un veterano con storico e seniority massimi batte un nuovo utente che compra
il DOPPIO dei blocchi. Il veterano spende €125, il nuovo €250, ma il veterano vince
perché F2+F3 (totale 0.50) bilanciano esattamente F1 (max 0.50).

Dati:
```
v1 — Nuovo (500 blocchi): score = 0.50×1.0 + 0.30×0 + 0.20×0.6 = 0.620
v1 — Veterano (250 blocchi): score = 0.50×0.5 + 0.30×1.0 + 0.20×0.47 = 0.643 ← VINCE
```

Soglia: il veterano doveva comprare solo il **49%** dei blocchi del nuovo. Di fatto
il sistema premiava la "storia" più dell'azione concreta.

**Scoperta 2 — Bug success check (Scenario Bug Analysis):**
Il check `totale >= seller_min_price` passava anche quando il venditore avrebbe ricevuto
molto meno del minimo. Esempio concreto:
- seller_min_price = €800
- Totale incassato = €1.000 → check PASS
- Ma venditore riceve solo €1.000 × 67.99% = €679.90 → sotto il minimo!

Il venditore si sarebbe trovato con meno del pattuito senza nessun warning.

**Scoperta 3 — Quotazione non copre il venditore:**
Se `object_value_eur = valore_mercato`, il venditore riceve solo il 67.99%.
Un oggetto da €1.000 con quotazione €1.000 → venditore incassa €679.90.
Per garantire €1.000, la quotazione deve essere €1.000/0.6799 = **€1.470,80**.

**Scoperta 4 — Perdite early adopters:**
Al primo airdrop (treasury a €0), i perdenti subiscono una perdita media del **77%**
sul valore degli ARIA spesi vs NFT ricevuti. Ma al 5° airdrop (treasury matura a €5.000),
i perdenti **guadagnano** (+125%) grazie al valore accumulato nelle Tessere.
Il modello è sostenibile a regime, ma richiede pazienza nei primi mesi.

**Scoperta 5 — Tempo di accumulo proibitivo:**
Un utente che guadagna max 7 ARIA/giorno impiega **356 giorni** (~1 anno) per accumulare
abbastanza ARIA per una partecipazione competitiva su un oggetto da €1.000.
I referral aiutano marginalmente (50 referral → -71 giorni, ancora 285 giorni).

### 12.3 v2.0 — Correzioni (28 Marzo 2026)

**Decisione 1: Nuovi pesi w1=0.65, w2=0.20, w3=0.15**

Alternative considerate:
| Pesi | Soglia veterano | Rischio |
|---|---|---|
| 0.50/0.30/0.20 (v1) | 49% | Veterano domina, nuovo utente frustrato |
| 0.60/0.25/0.15 | 60% | Meglio ma veterano ha ancora troppo vantaggio |
| **0.65/0.20/0.15 (v2)** | **74%** | **Buon equilibrio: vantaggio veterano reale ma non schiacciante** |
| 0.75/0.15/0.10 | 85% | Troppo aggressivo: F2/F3 quasi irrilevanti, diventa quasi un'asta |
| 0.80/0.10/0.10 | 91% | Praticamente un'asta — perde il senso di loyalty |

Scelta: **0.65/0.20/0.15** perché:
- Il veterano mantiene un vantaggio significativo (risparmia il 26% di blocchi)
- Ma deve partecipare attivamente (almeno 74% dei blocchi del top buyer)
- F2 rimane rilevante (20%) — non è un tiebreaker, è un bonus reale
- F3 è ridotto a un "nice to have" (15%) — giusto, la seniority non dovrebbe dominare

Dati post-fix:
```
v2 — Nuovo (500 blocchi): score = 0.65×1.0 + 0.20×0 + 0.15×0.6 = 0.740 ← VINCE
v2 — Veterano (250 blocchi): score = 0.65×0.5 + 0.20×1.0 + 0.15×0.47 = 0.595
```

Il nuovo utente ora vince perché ha investito di più. Il veterano deve salire
ad almeno 370 blocchi (74%) per ribaltare con il suo bonus di fedeltà.

**Decisione 2: Fix success check**
Cambiamento: `v_venditore_eur >= seller_min_price` (confronta la quota, non il totale).
Nessuna alternativa considerata — era un bug puro, la v1 non implementava
correttamente la propria specifica ("viable se il venditore riceve almeno il suo minimo").

**Decisione 3: Formula quotazione**
`object_value_eur = seller_target / 0.6799`
Implementata come suggerimento automatico nel backoffice (`calcSuggestedValues`).
L'admin può sempre sovrascrivere manualmente, ma il bottone "SUGGERISCI" calcola
la quotazione corretta a partire da seller_desired_price e seller_min_price.

**Decisioni rimandate (non implementate in v2):**
- Tempo di accumulo ARIA troppo lungo → richiede decisione business su acquisto ARIA
- Perdite early adopters → accettate come costo dell'alpha, compensate da badge esclusivi
- Divisore NFT (5 blocchi/NFT) → adeguato per alpha, le fasi successive lo ridurranno

### 12.4 Lezioni apprese

1. **Testare i pesi con scenari estremi prima di andare live.** Il caso "veterano con 1 blocco
   vs nuovo con 2000" ha rivelato immediatamente lo sbilanciamento.

2. **La normalizzazione nasconde problemi.** F1=1.0 sembra il massimo, ma se F2+F3 pesano
   quanto F1, il "massimo" non basta. Sempre verificare che la somma dei pesi secondari
   non possa superare il fattore primario.

3. **Ogni percentuale di split va tracciata end-to-end.** Il 67.99% era documentato nella split
   ma non era stato propagato nel success check. La pipeline era: split → check → preview → draw,
   e il bug era nel secondo anello.

4. **Il primo airdrop è sempre il peggiore per i perdenti.** Il Fondo parte da zero, quindi
   le Tessere valgono poco. Ma questo è intenzionale: gli early adopter accettano il rischio
   in cambio di badge esclusivi e del vantaggio F2/F3 sui futuri airdrop.

5. **Uno stress test script è un investimento permanente.** Qualsiasi modifica futura ai pesi
   può essere validata in 2 secondi con `node scripts/stress_test_engine.js`.

### 12.5 v2.1 — Mining Model (28 Marzo 2026)

**Contesto:** Lo stress test D-Day (`dday_simulator.js`) rivela che il modello funziona
ma il recupero perdenti è basso (20% media) con solo 20 utenti. Serve chiarire il modello
economico per comunicarlo correttamente e validare la scalabilità.

**Chiarimento fondamentale del founder:**
- ARIA = stablecoin a €0.10 fisso. Non specula, non oscilla. Si compra (min €1) o si guadagna.
- ROBI = quota del Fondo Comune. Come un ETF: rappresenta una fetta del treasury.
- Partecipare a un airdrop = minare quote. TUTTI i perdenti ricevono quote, proporzionali alla spesa.
- Il treasury cresce sempre (22% airdrop + 50% ads + sponsor). Le quote valgono sempre di più.

**Decisione: mining difficulty basata sul prezzo oggetto**
L'insight del founder: la difficoltà di mining deve dipendere dal VALORE dell'oggetto, non dalla
fase della piattaforma. Oggetti costosi = mining più difficile = quote più rare.

Formula: `divisore = ceil(object_value / 100)`

Alternative scartate:
- Fasi (alpha/beta/mainnet) → troppo rigido, non si adatta al mix di categorie
- Difficoltà fissa → non riflette il valore in gioco
- Logaritmica → meno intuitiva, harder to communicate

**Decisione: NFT frazionari**
Con `floor(blocks/divisor)`, chi compra pochi blocchi riceve 0 NFT. Con frazioni,
TUTTI ricevono qualcosa. 1 blocco su un €10K airdrop = 0.01 quote. Piccolo ma reale.

**Decisione: eliminazione fasi per distribuzione NFT**
Le fasi (alpha_brave → mainnet) definivano il divisore e chi riceveva NFT.
Con il mining basato sul prezzo, le fasi diventano ridondanti:
- La difficoltà è organica (prezzo oggetto)
- L'anti-inflazione è automatica (cap basato su treasury)
- Tutti ricevono sempre (nessun "solo top 3")

**Risultati D-Day simulator (20 utenti, 6 mesi, 18 airdrop):**
- Treasury: €1.408 | Prezzo quota: €2.62
- Vincitori (4): ROI 9-30x (spesa €295-720 → oggetti €3.500-9.750)
- Perdenti alpha: 26-47% recupero (ma ARIA era gratis)
- Perdenti mainnet: 1-10% recupero (treasury giovane)
- Proiezione 10K utenti: prezzo quota €3.87 (+48%)
- Proiezione 50K utenti: prezzo quota €5.49 (+110%)

Il modello è progettato per scalare: chi mina presto mina facile.

---

## 13. Note Evolutive

**Alpha Brave (ora):**
- I pesi v2 sono configurabili ma validati dal stress test
- L'algoritmo è deterministico e auditabile
- Il draw è manuale — il founder controlla tutto
- Perdite alte per early adopters, compensate da badge e NFT esclusivi

**Verso Mainnet:**
- I pesi possono essere votati dalla community (DAO governance)
- Il draw può diventare provably fair on-chain con Kaspa VRF
- La distribuzione NFT segue la regola drastica (solo top 3)
- Ogni draw genera un hash on-chain verificabile
- ARIA acquistabili per ridurre il tempo di accumulo

---

## Appendice — File di Riferimento

| File | Ruolo |
|---|---|
| `docs/business/AIROOBI_Airdrop_Engine_v2.md` | Questo documento — fonte di verità |
| `docs/business/AIROOBI_Airdrop_Engine_v1.md` | Versione precedente (deprecata) |
| `docs/business/AIROOBI_Tokenomics_v3.md` | Prezzi blocchi, earning rate, fasi |
| `scripts/stress_test_engine.js` | Stress test e simulatore fairness |
| `supabase/migrations/20260319221008_airdrop_engine_rpc.sql` | RPC v1 (base) |
| `supabase/migrations/20260327233958_engine_v2_fairness_fixes.sql` | Fix v2: pesi + success check |
| `supabase/migrations/20260328005459_engine_v2_mining_model.sql` | v2.1: mining model + NFT frazionari |
| `supabase/migrations/20260328185020_reset_airdrops_for_testing.sql` | Reset dati airdrop per testing |
| `supabase/migrations/20260328194636_multi_photo_submissions.sql` | Multi-foto + Storage bucket submissions |
| `supabase/migrations/20260328203500_airdrop_chat_messages.sql` | Chat valutazione (airdrop_messages) |
| `scripts/dday_simulator.js` | D-Day simulator (mainnet launch model) |
| `abo.html` | Admin panel — draw preview/execute UI |
| `scripts/auto_draw.js` | Cron script auto-draw |

---

*Documento generato il 28 Marzo 2026*
*Validato con stress_test_engine.js — 10 scenari, confronto v1/v2*
*Da aggiornare ad ogni modifica delle regole di business prima di implementare*
