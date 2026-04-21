# AIROOBI — Airdrop Engine Specification
**Version 2.7 · 19 Aprile 2026 · DOCUMENTO FONDATIVO**

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
>
> **Changelog 7 Apr 2026 (v2.1) — Stage 1 Engagement Engine:**
> - ADD: Durata airdrop configurabile (`duration_type`: flash 6h, standard 24h, extended 72h)
> - ADD: Auto-transizione presale→sale basata su % blocchi venduti (soglie per tipo durata)
> - ADD: Auto-close + draw al 100% blocchi venduti (configurabile)
> - ADD: Countdown live su card e dettaglio airdrop (pulse gold a <2h)
> - ADD: Posizione live "Sei X° su Y" con polling 30s + shake quando superato
> - ADD: Watchlist/preferiti (tabella `airdrop_watchlist`, RPC `toggle_watchlist`)
> - ADD: Alert categorie (tabella `user_preferences`, RPC `save_category_alerts`)
> - ADD: Push notifications Web Push (tabella `push_subscriptions`, Edge Function `send-push`)
> - ADD: Cron deadline_2h (Edge Function `check-deadlines`, pg_cron ogni 15 min)
> - ADD: Trigger DB per push su publish e draw
> - ADD: Soglie configurabili in ABO (Engine Config → Soglie Auto-Transizione)
>
> **Changelog 11 Apr 2026 (v2.2) — Workflow Operativo Airdrop:**
> - ADD: Nuovo stato `accettato` — staff accetta valutazione, utente conferma partenza
> - ADD: Colonna `presale_enabled` — staff decide in ABO se attivare presale
> - ADD: Colonna `launch_fee_paid` — fee % pagata dall'utente per avvio airdrop
> - CHANGE: Annullamento solo da parte dell'utente (non più admin), perde ARIA pagati
> - ADD: Badge valutazione — ogni airdrop valutato genera un badge, winner riceve lo stesso badge
> - ADD: Workflow completo documentato (Sezione 0)
>
> **Changelog 16 Apr 2026 (v2.3) — Scoring v3 Deployato:**
> - DEPLOY: Formula v3 attiva nel DB — `calculate_winner_score` usa solo F1 (70%) + F2 (30%)
> - REMOVE: F3 (seniority) rimosso dallo scoring. Seniority resta solo come tiebreaker finale
> - FIX: F2 ora rispetta la One Category Rule — conta ARIA spesi solo DOPO l'ultima vittoria nella categoria
> - FIX: F2 esclude partecipazioni cancellate (`cancelled_at IS NULL`)
> - CHANGE: Config DB aggiornata — rimossi `score_w3`, `score_alpha_f3`, `score_beta_f3`
> - UI: Legenda F1/F2 aggiunta in Control Room, ABO Draw Preview, ABO Analisi
> - UI: Linguaggio semplificato nella strategy guide ("Blocchi" e "Esperienza" invece di F1/F2)
> - UI: Dettagli prodotto spostati sotto il titolo (non più in accordion)
> - FIX: F2 denominatore ora è il totale globale ARIA nella categoria (non max singolo partecipante)
>   Questo stabilizza F2 quando un utente si azzera dopo vittoria (One Category Rule)
>
> **Changelog 19 Apr 2026 (v2.7.1) — Tiebreaker power-user:**
> - ADD: Nuovo tiebreaker `lifetime_aria` (ARIA totali cross-cat, escluso cancellati/annullati) inserito tra "più blocchi airdrop corrente" e "primo blocco prima".
> - RATIONALE: premia i power-user (attività generale su AIROOBI) SOLO in caso di pareggio Punteggio. Non altera il principio mono-fattoriale anti-gambling (Skeezu confirm "prova del 9").
> - Ordine completo: (1) score v4 (2) più blocchi corrente (3) più ARIA lifetime (4) primo blocco prima (5) seniority.
> - Migrazione: `20260419170300_scoring_v4_tiebreaker_lifetime.sql`.
>
> **Changelog 19 Apr 2026 (v2.7) — Scoring v4 anti-gambling + Early close lockdown:**
> - REWRITE: `calculate_winner_score` torna mono-fattoriale. **Punteggio = SUM(ARIA spesi in categoria post-ultima-vittoria, escluso airdrop annullati) + ARIA airdrop corrente**. Niente più F1/F2/pesi, niente normalizzazione.
> - RATIONALE (Skeezu): evitare che per ottenere un oggetto €500 tu ne abbia già spesi > €500 in categoria. Principio: "vince chi dal primo giorno ha impegnato più ARIA in categoria". Anti-gambling by design.
> - ADD: RPC `my_category_score_snapshot(airdrop_id)` per FE — ritorna my_score, leader_score, max_reachable, math_impossible, aria_needed_to_lead.
> - CHANGE: Tiebreaker aggiornato (1) più blocchi nell'airdrop corrente (2) primo blocco prima (3) seniority come estrema ratio.
> - ADD: Stato nuovo `pending_seller_decision` in constraint `valid_status`.
> - ADD: Colonne `airdrops.early_close_reason` (`fairness_lockdown`|`value_threshold`) e `original_total_blocks` (backup prima del burn).
> - ADD: RPC `check_fairness_lockdown(airdrop_id)` — tutti i non-primi hanno `score + remaining × block_price < leader_score`? (richiede ≥3 partecipanti).
> - ADD: RPC `check_value_threshold_reached(airdrop_id)` — `leader_score ≥ object_value_eur × 10` (conversione ARIA_EUR=0.10).
> - ADD: RPC `early_close_airdrop(airdrop_id, reason)` — burn blocchi (`total_blocks ← blocks_sold`), status → `pending_seller_decision`, notifica seller.
> - ADD: Trigger `tf_check_early_close_after_buy` su `airdrop_blocks` AFTER INSERT — verifica threshold+lockdown dopo ogni acquisto e auto-closed se necessario.
> - ADD: RPC `complete_airdrop_seller_accept(airdrop_id)` — seller conferma payout ridotto, status → `closed` → `completed` via `execute_draw`.
> - ADD: Seller flow FE in "I miei airdrop": bottone **COMPLETA** al posto di RITIRA quando `pending_seller_decision`. Modal con riepilogo (blocchi venduti/bruciati, revenue, quota stimata vs min/desiderato). Se rifiuta → `withdraw_my_submission` → annullato (fee non rimborsata).
> - UI: Card "Come arrivare 1°" semplificata a 1 progress bar ("Impegno in categoria"). Pos-breakdown ora mostra "Tuoi ARIA cat.", "Primo", "Ti servono". Rimossi blocchi tecnici Vantaggio/Impegno/Punteggio decimali.
> - Pagina EDU `/come-funziona-airdrop` §4 riscritta come mono-fattoriale + §6 arricchita con Chiusura anticipata (2 trigger + decisione venditore).
> - Migrations: `20260419170000_scoring_v4_anti_gambling.sql`, `20260419170100_early_close_lockdown.sql`, `20260419170200_get_my_submissions_v2.sql`.
>
> **Changelog 19 Apr 2026 (v2.6) — Earnings v2 (chiusura F2):**
> - REWRITE: Policy earnings semplificata. Eliminate tutte le vecchie task (check-in +1 stand-alone, video, streak bonus 7gg in ARIA).
> - KEEP: Faucet `claim_faucet` invariato (+100 ARIA/gg).
> - ADD: Tabella `weekly_checkins(user_id, week_start, days_checked smallint[], robi_awarded bool)`.
> - ADD: RPC `daily_checkin_v2()` — timbra il giorno corrente (ISO dow 1=Mon..7=Sun), +50 ARIA al primo timbro del giorno, +1 ROBI quando `array_length(days_checked)=7`.
> - ADD: RPC `get_my_weekly_streak()` — snapshot calendario settimana corrente per UI.
> - ADD: RPC `confirm_referral()` — chiamata silente al primo login: +5 ROBI inviter + +5 ROBI new user, incrementa `profiles.referral_count`. Idempotente via `referral_confirmations`.
> - ADD: Trigger `tf_airdrop_accepted_robi` su airdrops: status → `accettato` ⇒ +1 ROBI al `submitted_by` (source='submission_accepted', deduplicato per airdrop_id).
> - ADD: Trigger `tf_airdrop_completed_robi` su airdrops: status → `completed` ⇒ +5 ROBI seller (source='airdrop_completed_seller') + +5 ROBI winner (source='airdrop_won') se `winner_id NOT NULL`.
> - ADD: Colonna `airdrop_config.mining_enabled boolean DEFAULT false` — flag per attivazione futura. In alpha: `execute_draw` continua a funzionare ma i ROBI Mining (NFT_REWARD type, source='airdrop_draw') sono **mostrati nell'UI come info** e non vengono prodotti perché nessun airdrop reale viene concluso (DB alpha resettato).
> - DEPRECATED: `claim_checkin` ora wrapper di `daily_checkin_v2` (back-compat).
> - UI: Sezione "Guadagni" nel dapp.home ridisegnata: Faucet + Streak (calendario lun-dom con timbri + pulsante "TIMBRA OGGI") + Referral. Vecchie daily-task rimosse.
> - UI: Pagina EDU `/come-funziona-airdrop` §10 nuova sezione "Come si guadagna" con policy completa.
> - TEST: Playwright deliverable Alpha Brave in preparazione per chiusura F2 (fase 2 roadmap interna Skeezu).
>
> **Changelog 19 Apr 2026 (v2.5) — Fasi progetto allineate a airoobi.com/#roadmap:**
> - CHANGE: Le fasi progetto passano da 3 (Alpha/Beta/Mainnet) a **4**: **Alpha · Beta · Pre-Prod · Mainnet** (allineamento con la roadmap pubblica su airoobi.com/#roadmap).
> - ADD: **Criterio CORE di avanzamento** = soglia utenti registrati.
>   * **Alpha**: 0→1.000 utenti (Alpha Brave + Alpha Wise, in quest'ordine)
>   * **Beta**: 1.000→5.000 utenti — dApp navigabile con dati simulati, primi airdrop di test
>   * **Pre-Prod**: 5.000→10.000 utenti — test reali community ristretta, pagamenti, KYC, stress test
>   * **Mainnet**: da 10.000 utenti in poi — blockchain live Kaspa, primo airdrop reale, ARIA/ROBI/KAS operativi
> - IMPACT: I parametri GIFT_PCT (ROBI scoperti) pianificati per v2.4 si espandono da 3 a 4 valori: Alpha 15% · Beta 10% · Pre-Prod 7% · Mainnet 5% (valori indicativi, da tarare coi feedback alpha).
> - UI: Pagina EDU `/come-funziona-airdrop` §10 aggiornata con 4 fasi + soglie esplicite.
>
> **Changelog 19 Apr 2026 (v2.4) — Fairness Guard + UI Refinement:**
> - ADD: Fairness Guard completa — blocca acquisto blocchi quando matematicamente impossibile arrivare 1° (`blocchi_necessari > blocchi_rimanenti`). Mai restituisce ARIA al sicuro.
> - ADD: Fairness Guard estesa all'AUTO-BUY — non attivabile se bloccato; se già attivo al momento in cui scatta, viene disattivato server-side via `disable_auto_buy` (una sola volta, con toast).
> - UI: KPI user-facing ridenominati — F1/F2/S → **Vantaggio / Impegno / Punteggio**. "Leader" → "primo in classifica". Formula `F1×0.7 + F2×0.3` rimossa dall'UI utente. Control Room (admin) mantiene la notazione tecnica F1/F2/S.
> - UI: Card "Come arrivare 1°" ridisegnata in stile coach (tip azionabile sotto ogni fattore: "Acquista più blocchi per colmare il distacco" / "Partecipa spesso agli airdrop di questa categoria").
> - UI: Tutte le emoji colorate sostituite con SVG inline monocromatici Lucide-style (target, trophy, gem, bulb, ban, star, zap, alert, up). Regola di design: icone flat/stilizzate/monocromatiche con `currentColor`, mai emoji.
> - UI: Topbar pagina airdrop arricchita con avatar utente + dropdown menu (Home, Esplora, I miei airdrop, Portafoglio, Vendi, Invita, Logout). Carica `profiles.avatar_url` con fallback all'iniziale dell'email.
> - CLEANUP: Rimosso banner A-ADS dalla dApp (`dapp.html` tra airdrop attivi e "In arrivo").

---

## 0. Workflow Operativo — Ciclo di Vita Airdrop

```
DRAFT → IN_VALUTAZIONE → ACCETTATO → PRESALE/SALE → CLOSED → COMPLETED
                       ↘ rifiutato_min500 / rifiutato_generico
(qualsiasi momento)    → ANNULLATO (solo utente, perde ARIA)
```

### 0.1 Stati e Transizioni

| Stato | Chi agisce | Cosa succede |
|---|---|---|
| `draft` | Utente (dApp) | Crea e salva l'airdrop. Può averne quanti vuole in draft. Solo lui li vede. |
| `in_valutazione` | Utente (dApp) | Azione esplicita "Manda in valutazione" + pagamento ARIA (a AIROOBI). |
| `rifiutato_min500` | Staff (ABO) | Rifiutato: valore sotto €500. Motivazione scritta (`rejection_reason`). |
| `rifiutato_generico` | Staff (ABO) | Rifiutato: altro motivo. Motivazione scritta (`rejection_reason`). |
| `accettato` | Staff (ABO) | Staff accetta e decide se presale o sale (`presale_enabled` flag in ABO). |
| → partenza | Utente (dApp) | Vede "ACCETTATO" in I miei airdrop. Clicca "Accetta" + paga fee % ARIA (`launch_fee_paid`). |
| `presale` | Automatico | Blocchi presale in vendita a prezzo speciale. Tutti venduti → `sale`. |
| `sale` | Automatico | Blocchi sale in vendita a prezzo pieno. Tutti venduti → `closed`. |
| `closed` | Automatico | Attesa minima 15 min, poi draw automatico. |
| `completed` | Automatico | Winner estratto, ROBI distribuiti a tutti i partecipanti. |
| `annullato` | Utente (dApp) | Può annullare in qualsiasi momento. ARIA pagati NON restituiti. |

### 0.2 Regole di Business

1. **Draft illimitati** — l'utente può creare e salvare quanti draft vuole
2. **Costo valutazione** — pagamento in ARIA all'invio in valutazione (va a AIROOBI)
3. **Staff decide presale/sale** — flag `presale_enabled` impostato in ABO
4. **Conferma partenza utente** — dopo ACCETTATO, l'utente deve accettare e pagare fee %
5. **Transizione presale→sale** — automatica quando blocchi presale esauriti
6. **Transizione sale→closed** — automatica quando TUTTI i blocchi venduti
7. **Draw dopo closed** — automatico dopo almeno 15 minuti
8. **Annullamento** — solo l'utente, in qualsiasi stato, perde ARIA pagati

### 0.3 Badge

- Ogni airdrop che supera la valutazione genera un **badge** (NFT collezionabile)
- Il **venditore** riceve il badge come riconoscimento
- Il **winner** dell'airdrop riceve lo stesso badge del venditore
- Entrambi lo possiedono permanentemente

### 0.4 Colonne DB Correlate

| Colonna | Tipo | Descrizione |
|---|---|---|
| `status` | text | Stato corrente (constraint `valid_status`) |
| `presale_enabled` | boolean | Staff decide se attivare presale |
| `rejection_reason` | text | Motivazione rifiuto scritta da staff |
| `launch_fee_paid` | numeric | Fee % pagata dall'utente per avvio |

---

## 1. Split Economica per Airdrop

```
100% ARIA incassato =
  67,99% → Venditore P2P       (pagato in KAS, 24-48h dopo draw)
  22,00% → Fondo Comune        (aggiunto a treasury_stats automaticamente al draw)
  10,00% → Fee Piattaforma     (AIROOBI operational revenue)
   0,01% → Charity Pool        (accumulo DAO, causa selezionata dalla community)
```

**Esempio su airdrop da 10.000 ARIA:**
- Venditore: 6.799 ARIA → KAS
- Fondo Comune: 2.200 ARIA → treasury
- AIROOBI: 1.000 ARIA
- Charity: 1 ARIA

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
- Al raggiungimento del 100% blocchi → auto-close + draw (se `auto_close_on_sellout = true`)
- Alla deadline → draw automatico (cron job `check_auto_draw` ogni 15 minuti)

---

## 4A. Durata Airdrop e Auto-Transizione (v2.1)

### 4A.1 Tipi di durata
Colonna `duration_type TEXT DEFAULT 'standard'` in tabella `airdrops`.

| Tipo | Durata | Badge UI | Uso tipico |
|------|--------|----------|------------|
| `flash` | 6 ore | ⚡ FLASH (rosso) | Oggetti < €1.000, alta urgenza |
| `standard` | 24 ore | 24H (blu) | Default, oggetti €500-€5.000 |
| `extended` | 72 ore | 72H (gold) | Oggetti > €5.000, più tempo per raccogliere |

La durata è selezionata dall'admin in fase di approvazione (ABO).

### 4A.2 Auto-transizione presale → sale
Quando la percentuale di blocchi venduti in fase presale raggiunge la soglia configurata,
lo status cambia automaticamente da `presale` a `sale`.

**Soglie configurabili in `airdrop_config`:**

| Config key | Default | Descrizione |
|-----------|---------|-------------|
| `presale_threshold_flash` | 30% | Flash: presale→sale al 30% venduto |
| `presale_threshold_standard` | 20% | Standard: presale→sale al 20% venduto |
| `presale_threshold_extended` | 15% | Extended: presale→sale al 15% venduto |
| `auto_close_on_sellout` | true | 100% venduto → close + draw automatico |

La logica è implementata nella RPC `buy_blocks` (v3): dopo ogni acquisto si controlla
`(blocks_sold / total_blocks) >= soglia%` e si aggiorna lo status.

### 4A.3 Auto-close al 100%
Quando tutti i blocchi sono venduti e `auto_close_on_sellout = true`:
1. Status cambia a `closed`
2. Il cron `check_auto_draw` (esistente, ogni 15 min) esegue il draw
3. Push notification a vincitore e partecipanti

### 4A.4 Ciclo di vita completo

```
in_valutazione → [admin approva] → presale
                                      ↓
                        [soglia % blocchi venduti]
                                      ↓
                                    sale
                                      ↓
                    [100% venduto] ──→ closed → draw automatico
                    [deadline]    ──→ closed → draw automatico
                                      ↓
                              completed / annullato
```

### 4A.5 Configurazione da ABO
Le soglie sono modificabili dalla sezione "Engine Config" → "Soglie Auto-Transizione"
nel pannello admin (abo.html). Ogni modifica viene salvata in `airdrop_config` e ha
effetto immediato su tutti i futuri acquisti blocchi.

---

## 4B. Engagement Engine (v2.1)

### 4B.1 Countdown live
- Ogni card airdrop mostra un countdown in tempo reale verso la deadline
- Formato: `3h 24m 12s alla chiusura` — aggiornamento ogni secondo
- Quando mancano < 2 ore: countdown diventa gold e pulsa (CSS animation)
- Implementato client-side con `setInterval(1000)` su `data-deadline`

### 4B.2 Posizione live
- Nella pagina dettaglio airdrop: "Sei X° su Y partecipanti"
- Polling ogni 30 secondi via RPC `get_airdrop_participants`
- Se la posizione peggiora: animazione shake + toast + push notification `position_lost`
- Se non sei ancora entrato: "Entra ora — X partecipanti attivi"

### 4B.3 Watchlist / Preferiti
- Bottone cuore ♡ su ogni card e nella pagina dettaglio
- Toggle via RPC `toggle_watchlist` → tabella `airdrop_watchlist`
- Tab "Preferiti" nel filtro categorie della pagina Airdrops
- Usata dal cron `check-deadlines` per notificare a 2h dalla chiusura

### 4B.4 Alert categorie
- Nel portafoglio: checkbox per categoria con salvataggio preferenze
- RPC `save_category_alerts` → tabella `user_preferences`
- Quando un airdrop viene pubblicato, il trigger DB invia push notification
  a tutti gli utenti con alert attivo per quella categoria

### 4B.5 Push Notifications
5 tipi di notifica push implementati via Web Push API:

| Tipo | Trigger | Destinatari |
|------|---------|-------------|
| `new_airdrop` | Airdrop pubblicato (presale/sale) | Utenti con alert categoria |
| `deadline_2h` | 2h prima della chiusura | Watchlist + partecipanti |
| `position_lost` | Superato in classifica | Utente superato |
| `draw_winner` | Draw eseguito | Vincitore |
| `draw_robi` | Draw eseguito | Tutti i partecipanti non vincitori |

**Stack tecnico:**
- Service Worker: `/sw.js` — riceve push e mostra notifica nativa
- Subscription: client-side in `dapp.js`, salva in `push_subscriptions`
- Invio: Edge Function `send-push` (Supabase, VAPID)
- Trigger: DB trigger su `airdrops` UPDATE + cron `check-deadlines` ogni 15 min

## 4C. Fairness Guard (v2.4 — 19 Aprile 2026)

### 4C.1 Principio
Non devi poter spendere ARIA per un airdrop che non puoi più vincere. Se il
distacco dal primo in classifica è superiore al numero di blocchi rimanenti,
raggiungere il 1° posto è **matematicamente impossibile** — la guard blocca
l'acquisto per non far sprecare ARIA all'utente.

### 4C.2 Condizione
```
blocksToFirst = leaderBlocks − myBlocks + 1   (minimo superare il leader)
remainingBlocks = total_blocks − blocks_sold
mathImpossible = pos > 1 AND blocksToFirst > remainingBlocks
```

Nota: `pos > 1` è necessario. Chi è già 1° non è mai bloccato (sta vincendo).

### 4C.3 Monotonicità
La condizione `mathImpossible` è **monotona**: una volta vera, resta vera fino
a chiusura airdrop. Questo perché `blocksToFirst` non decresce (il leader può
solo acquistare più blocchi) e `remainingBlocks` decresce. Quindi una volta
bloccato, l'utente NON viene mai ri-abilitato in questo airdrop.

### 4C.4 Effetti UI (client-side)
Quando `mathImpossible` scatta in `applyFairnessBlock()`:

| Elemento | Stato dopo guard |
|---|---|
| Bottone `buy-btn` | `disabled`, label "Fairness: impossibile arrivare 1°" + icona ban |
| `buy-slider` | `disabled` |
| `.buy-preset` | `disabled`, opacity 40% |
| `buy-msg` | Banner rosso: "Ti servono N blocchi ma ne restano solo M. Acquisto bloccato per non farti sprecare ARIA." |
| `.buy-box` | Classe `.fair-blocked` applicata |
| **Auto-Buy box** | `disabled`, opacity 55%, bordo rosso tenue, messaggio "Non puoi più raggiungere il 1° posto — auto-buy bloccato" |
| Toggle auto-buy | `disabled`, label "Disabilitato per fairness" |

### 4C.5 Auto-Buy attivo al momento del blocco
Se l'utente aveva già una regola `auto_buy_rules.active=true` quando scatta la
guard, il client chiama **una sola volta** `disable_auto_buy(p_airdrop_id)` e
mostra un toast: "Auto-buy disattivato: arrivo al 1° non più possibile".

Flag client-side: `_fairnessBlocked` (resettato a ogni cambio di airdrop).

### 4C.6 Guard anche sul toggle
`toggleAutoBuy()` ha un controllo preventivo: se `_fairnessBlocked` o
`.buy-box.fair-blocked` è presente, rifiuta l'attivazione con toast esplicativo.
Questo protegge contro race condition tra click utente e update async.

### 4C.7 Backend (TODO)
La guard è attualmente **client-side only**. Per chiusura loop: la RPC
`process_auto_buys` (cron) deve validare fairness prima di eseguire ogni
acquisto programmato, altrimenti un attaccante con ARIA sufficiente potrebbe
aggirare la guard via API diretta. Tracciata come follow-up Stage 1.

## 4D. Auto-Buy (v2.1)

### 4D.1 Principio
Utente configura: N blocchi ogni X ore, fino a max M blocchi totali. Il cron
server esegue gli acquisti in base alla regola.

### 4D.2 Tabella DB
```sql
auto_buy_rules (
  user_id uuid,
  airdrop_id uuid,
  blocks_per_interval int,
  interval_hours int,
  max_blocks int,
  total_bought int,
  active boolean,
  last_run_at timestamptz,
  PRIMARY KEY (user_id, airdrop_id)
)
```

### 4D.3 RPC
- `upsert_auto_buy(p_airdrop_id, p_blocks_per_interval, p_interval_hours, p_max_blocks, p_active)` — crea/aggiorna regola
- `disable_auto_buy(p_airdrop_id)` — disattiva regola
- `process_auto_buys()` — cron, esegue acquisti dovuti

### 4D.4 Condizioni di blocco
Auto-buy NON esegue se:
- `active = false`
- `total_bought >= max_blocks`
- Tempo trascorso da `last_run_at` < `interval_hours`
- Airdrop non più in `presale`/`sale`
- **Fairness Guard attiva per quell'utente** (vedi 4C — da implementare server-side)

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

### 5.2 Formula Score (v3 — deployata 16 Aprile 2026)

> Formula v3 ATTIVA nel DB. La v2 con 3 fattori (F1/F2/F3) è deprecata.
> Semplificato a 2 fattori con pesi 70/30, rimuovendo la seniority (F3).
> La seniority resta come tiebreaker finale, non influisce sullo score.
>
> **Naming (v2.4 · 19 Apr 2026):** In UI user-facing i fattori sono chiamati
> **Vantaggio** (F1) e **Impegno** (F2), e lo score è **Punteggio**.
> In Control Room, ABO e in questo documento tecnico continuiamo a usare
> F1/F2/S per compattezza.

```
score(utente) = (F1 × 0.70) + (F2 × 0.30)
```

**F1 — Blocchi nell'airdrop corrente · user-facing "Vantaggio" (70%):**
```
F1 = blocchi_utente_corrente / max_blocchi_singolo_utente_in_airdrop
```
Normalizzato 0→1. Chi ha il massimo dei blocchi ottiene F1=1.
Intuizione per l'utente: quanto sei vicino al primo in classifica.

**F2 — ARIA spesi nella categoria · user-facing "Impegno" (30%):**
```
F2 = log(1 + aria_spesi_utente_post_vittoria) /
     log(1 + totale_aria_spesi_nella_categoria_da_tutti)
```
- **Numeratore**: ARIA spesi dall'utente nella stessa categoria, ESCLUSO l'airdrop corrente
- **Denominatore**: somma di TUTTI gli ARIA spesi da TUTTI gli utenti nella categoria
  (globale, non solo tra i partecipanti correnti)
- **Solo partecipazioni NON cancellate** (`cancelled_at IS NULL`)
- **Reset su vittoria**: il numeratore conta SOLO gli ARIA spesi DOPO l'ultima vittoria
  nella stessa categoria. Se hai vinto un airdrop "Tech", il tuo storico Tech riparte
  da zero. Questo è la **One Category Rule** applicata allo scoring.
- Il denominatore globale NON si resetta — resta stabile. Quando un singolo utente
  si azzera dopo una vittoria, il denominatore non cambia e il peso relativo degli
  altri partecipanti resta corretto.
- Se l'utente non ha mai vinto nella categoria, conta tutto lo storico
- Usa logaritmo per smorzare i gap estremi
- Normalizzato 0→1

### 5.3 Pesi — v3 (fairness by category)

```
w1 = 0,70  (partecipazione diretta)
w2 = 0,30  (fedeltà categoria)
```

> I pesi sono configurabili in `airdrop_config` (chiavi `score_w1`, `score_w2`).
> Il fondatore può aggiustarli senza deploy.

**Perché 70/30:**
- Il 70% assicura che chi compra più blocchi in QUESTO airdrop è favorito
- Il 30% premia chi ha investito storicamente nella categoria — fairness
- La seniority NON entra nello score — conta solo quanto hai speso. Usata solo come tiebreaker finale (§5.4)

**Scenari di esempio:**

| Scenario | Utente A (nuovo) | Utente B (veterano) | Vincitore |
|---|---|---|---|
| A: 100 bl, 0 ARIA storici / B: 80 bl, 500 ARIA storici | 0.70 | 0.56 + 0.30 = 0.86 | **B** |
| A: 100 bl, 0 ARIA storici / B: 60 bl, 500 ARIA storici | 0.70 | 0.42 + 0.30 = 0.72 | **B** (di poco) |
| A: 100 bl, 0 ARIA storici / B: 50 bl, 500 ARIA storici | 0.70 | 0.35 + 0.30 = 0.65 | **A** |
| A: 100 bl, 200 ARIA / B: 100 bl, 500 ARIA storici | 0.70+0.19 | 0.70+0.30 = 1.00 | **B** |

Il veterano con massimo F2 (0.30) deve avere almeno il **57%** dei blocchi del nuovo
utente per batterlo (0.57×0.70 + 0.30 = 0.70). Questo è un bonus significativo ma non
permette di vincere con metà dei blocchi.

**Regola ARIA spesi:**
Contano SOLO gli ARIA che sono stati effettivamente transati — cioè spesi in
partecipazioni non cancellate. Se un utente ritira la partecipazione, quegli ARIA
non contano più nello storico.

### 5.4 Gestione parità (tiebreaker v3.1)
In caso di score identico (raro ma possibile), l'ordinamento è deterministico:
1. **Score DESC** — chi ha lo score più alto
2. **ARIA spesi DESC** — chi ha speso di più in questo airdrop
3. **Data iscrizione ASC** — chi si è iscritto prima (seniority come spareggio finale)

> La seniority NON è un fattore di scoring (non alza il tuo score), ma serve
> come spareggio deterministico per evitare ambiguità. Non è possibile un pareggio.

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

- **ARIA = valuta AIROOBI** — si guadagna (daily) o si compra
- **ROBI = quota del Fondo Comune** — come un ETF: `valore_quota = treasury / quote_circolanti`
- **Partecipare = minare quote** — tutti i perdenti ricevono quote NFT frazionarie
- **Il treasury cresce SEMPRE** — da airdrop (22%), video ads (50%), sponsor, altre attività
- **Le quote crescono SEMPRE di valore** — il mining è tanto più conveniente quanto prima lo fai

### 9.2 Mining difficulty (basata sul treasury — v2.2, 12 Aprile 2026)

> **DEPRECATA la formula precedente** `ceil(object_value / mining_k)`.
> La nuova formula lega il mining direttamente al treasury, evitando inflazione.

La difficoltà di mining dipende da due fattori:
- **Prezzo ROBI corrente** = `(treasury_gestito × 0.999) / robi_circolanti`
- **Prezzo del blocco** (in ARIA)

Lo 0.1% di sconto sul treasury è un micro-buffer per gestire assestamenti.

#### Formula

```
rate = ceil(prezzo_ROBI / (block_price × ARIA_EUR × SPLIT_FONDO))
     = ceil(prezzo_ROBI / (block_price × 0.022))
```

Dove:
- `ARIA_EUR = 0.10` (tasso interno 1 ARIA = €0.10)
- `SPLIT_FONDO = 0.22` (22% di ogni blocco va al Fondo Comune)
- `0.022 = 0.10 × 0.22` = contributo treasury per ARIA

#### Proprietà fondamentale

Il `total_blocks` e il `object_value_eur` si cancellano nella semplificazione.
Il mining rate dipende **SOLO** dal prezzo ROBI e dal prezzo blocco.
Questo rende il sistema elegante e auto-regolante.

#### Derivazione

```
treasury_previsto = total_blocks × block_price × ARIA_EUR × SPLIT_FONDO
max_robi = treasury_previsto / prezzo_ROBI
rate = ceil(total_blocks / max_robi)
     = ceil(total_blocks × prezzo_ROBI / treasury_previsto)
     = ceil(prezzo_ROBI / (block_price × 0.022))      ← total_blocks si cancella
```

#### Tabella Mining Rate (blocchi necessari per 1 ROBI)

| Prezzo ROBI | 5 ARIA/bl | 10 ARIA/bl | 20 ARIA/bl | 50 ARIA/bl | 100 ARIA/bl |
|---|---|---|---|---|---|
| **€0.50** | 5 | 3 | 2 | 1 | 1 |
| **€1.00** | 10 | 5 | 3 | 1 | 1 |
| **€2.09** (apr 2026) | 19 | 10 | 5 | 2 | 1 |
| **€5.00** | 46 | 23 | 12 | 5 | 3 |
| **€10.00** | 91 | 46 | 23 | 10 | 5 |
| **€20.00** | 182 | 91 | 46 | 19 | 10 |
| **€50.00** | 455 | 228 | 114 | 46 | 23 |

#### ROBI emessi per airdrop completo (100% fill, esempi)

**Oggetto €1.000** (block_price=20 ARIA, ~550 blocchi, treasury previsto ≈ €242):

| Prezzo ROBI | Max ROBI emessi | Blocchi/ROBI |
|---|---|---|
| €0.50 | 484 | 2 |
| €2.09 | 116 | 5 |
| €5.00 | 48 | 12 |
| €10.00 | 24 | 23 |
| €50.00 | 5 | 114 |

**Oggetto €10.000** (block_price=20 ARIA, ~5.500 blocchi, treasury ≈ €2.420):

| Prezzo ROBI | Max ROBI emessi | Blocchi/ROBI |
|---|---|---|
| €0.50 | 4.840 | 2 |
| €2.09 | 1.158 | 5 |
| €5.00 | 484 | 12 |
| €10.00 | 242 | 23 |
| €50.00 | 48 | 114 |

**Oggetto estremo €50.000** (block_price=50 ARIA, ~16.200 blocchi, treasury ≈ €17.820):

| Prezzo ROBI | Max ROBI emessi | Blocchi/ROBI |
|---|---|---|
| €0.50 | 35.640 | 1 |
| €2.09 | 8.526 | 2 |
| €5.00 | 3.564 | 5 |
| €10.00 | 1.782 | 10 |
| €50.00 | 356 | 46 |

#### Comportamento anti-inflazionistico

1. **Auto-regolazione**: man mano che il treasury cresce, il prezzo ROBI sale, servono più blocchi per 1 ROBI → meno emissione → meno inflazione
2. **Block price alto = mining generoso**: blocchi costosi contribuiscono più treasury per blocco, quindi i ROBI arrivano prima
3. **Early adopter advantage**: con prezzo ROBI basso (inizio piattaforma), il mining è facile. Chi arriva dopo mina di meno ma ogni ROBI vale di più
4. **Cap engine**: il cap anti-inflazione nell'engine (`max_nuove_quote = contributo_fondo / prezzo_quota`) resta come secondo livello di protezione al momento del draw

#### Dati sorgente

- **Treasury gestito**: tabella `treasury_funds` (importi con % treasury). Gestita manualmente dal CEO.
- **ROBI circolanti**: somma `shares` da `nft_rewards` (via RPC `admin_get_all_robi`)
- **Prezzo ROBI display**: `(treasury × 0.999) / robi_circolanti`
- **Prezzo ROBI engine** (al draw): `treasury_stats.balance_eur / treasury_stats.nft_circulating`

#### Piano di emissione ROBI per fase (12 Aprile 2026)

> La formula è auto-regolante, ma il **block_price** è la leva manuale che controlla
> quanti ROBI escono. Block price BASSO = rate ALTO = mining difficile = pochi ROBI.
> Block price ALTO = rate BASSO = mining facile = più ROBI.
>
> **Strategia**: durante test e alpha, tenere block_price bassi per limitare l'emissione.
> Man mano che il treasury cresce con soldi veri, il prezzo ROBI sale e la formula
> auto-regola. Il block_price può salire gradualmente.

| Fase | Block Price | ROBI Price previsto | Rate (bl/ROBI) | ROBI per 500 bl | Note |
|---|---|---|---|---|---|
| **Alpha 0 Test** (apr 2026) | 5 ARIA | €2 | ~19 | ~26 | Conservativo. Molti test, pochi ROBI emessi |
| **Alpha Brave** (Q2 2026) | 5-10 ARIA | €3-4 | 14-28 | ~18-36 | Early adopter vantaggiato ma controllato |
| **Stage 1** (Q3 2026) | 10-20 ARIA | €5-8 | 12-19 | ~26-42 | Treasury reale, crescita organica |
| **Beta** (Q4 2026) | 15-30 ARIA | €8-15 | 13-31 | ~16-38 | Mining più selettivo, ROBI vale di più |
| **Mainnet** (2027) | 20-50 ARIA | €15-50+ | 14-114 | ~4-36 | Formula auto-regola completamente |

**Principi chiave:**

1. **Alpha 0**: block_price=5. Con rate ~19, un airdrop da 500 blocchi emette ~26 ROBI.
   10 airdrop di test = ~260 ROBI. Con treasury che cresce lentamente, l'impatto è gestibile.

2. **Non esagerare in alpha**: anche se vogliamo premiare i primi utenti, ogni ROBI emesso
   ora diluisce il treasury futuro. Meglio pochi ROBI ma ad un prezzo che tiene.

3. **Halving naturale**: NON serve un halving artificiale. Il prezzo ROBI sale man mano che
   il treasury cresce → il rate sale automaticamente → meno ROBI emessi per airdrop.

4. **Rischio mainnet con halving basso**: se emettiamo troppi ROBI in alpha/beta, il prezzo
   ROBI sarà basso al mainnet (treasury/moltiROBI = poco valore per ROBI). Meglio arrivare
   con pochi ROBI ad alto valore.

5. **Block price come leva**: se in un momento il rate è troppo basso (troppo generoso),
   basta abbassare il block_price per alzare il rate. Viceversa se è troppo restrittivo.

### 9.3 NFT frazionari

Ogni perdente riceve:
```
quote = blocchi_acquistati / divisore
```

Dove il divisore è calcolato dalla formula treasury-based (sezione 9.2).
Presale: i blocchi presale contano doppio (`presale_blocks × 2 + sale_blocks`).

Nessun `floor()` — le frazioni sono sempre distribuite. Anche 1 blocco
produce una quota frazionaria.

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

### 9.5 Anti-inflazione (secondo livello)

Il cap anti-inflazione nell'engine resta: `max_nuove_quote = contributo_fondo / prezzo_quota_attuale`.
Se le quote calcolate superano il cap, vengono scalate proporzionalmente.

Questo è un **secondo livello** di protezione. Il primo livello è la formula treasury-based
stessa (sezione 9.2), che limita strutturalmente il rate di mining.

### 9.6 Perché non più fasi (halving)

Le fasi (alpha_brave, alpha_wise, beta, mainnet) definivano il divisore NFT.
Con il mining basato sul treasury, le fasi non servono più per la distribuzione NFT.

Il concetto di "mining facile all'inizio" è **naturale e automatico**: il prezzo ROBI
parte basso → il rate è basso (pochi blocchi per 1 ROBI) → mining generoso.
Man mano che il treasury cresce, il prezzo sale, il rate cresce, il mining rallenta.
Nessun halving artificiale necessario.

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
- ARIA = valuta AIROOBI. Si compra o si guadagna.
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
