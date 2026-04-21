# AIROOBI — Tokenomics & Economic Model
**TECH-001 · Version 3.5 · Final · 21 Aprile 2026**

> v3.5 (21 Apr 2026): **Earnings v2 consolidato** (daily streak 50 ARIA + 1 ROBI settimanale, referral 5+5 ROBI). **Welcome grant Alpha-Net** (1.000 ARIA + 5 ROBI per ogni nuovo utente via `handle_new_user` trigger). Aggiunte sezioni costo submission (50 ARIA), scoring v4, airdrop_config parametri. Mining ROBI sospeso in Alpha. UI: "Streak" → "Sequenza giornaliera" (IT).
> v3.4 (19 Apr 2026): Fairness Guard applicata anche all'Auto-Buy (ARIA non spesa quando è matematicamente impossibile arrivare 1°). Naming UI: F1/F2/S → Vantaggio/Impegno/Punteggio. Vedi Airdrop_Engine_v2 §4C-4D.
> v3.3: DB reset 28 Mar 2026. Multi-foto upload nel form valutazione (Supabase Storage bucket `submissions`). Riferimenti engine aggiornati a v2.
> Alpha 0 APERTO. Questo documento riflette il sistema in produzione su airoobi.com e airoobi.app.

---

## 1. Overview del Sistema

Il modello economico di AIROOBI si basa su tre asset distinti:
- **ARIA** — valuta di piattaforma (fase testnet), guadagnata dagli utenti via attività
- **ROBI** — NFT certificato di resa, unico reward "reale" riscuotibile in KAS
- **Fondo Comune** — pool trasparente che garantisce il valore dei ROBI (≥95% rimborso in KAS)

**Principio:** ARIA si guadagna gratis (welcome, faucet, sequenza, referral) · ARIA si usa per comprare blocchi · 1 Blocco acquistato = 1 ROBI (NFT)

---

## 2. ARIA — La Valuta di Piattaforma

| Attributo | Valore | Note |
|---|---|---|
| Ticker | ARIA | Valuta interna AIROOBI |
| Fase corrente | **Testnet** (Alpha 0) | Nessun controvalore EUR nell'UI |
| Blockchain target | Kaspa (KRC-20) | Smart contract nativo da Stage 2 |
| Scadenza | Nessuna | ARIA non scade mai |
| Come si ottiene | Welcome grant, faucet, sequenza giornaliera, referral | NON si compra direttamente in area utente |
| Utilizzi | Acquisto blocchi airdrop + submission fee valutazione | Unici utilizzi — non speculativo |

### 2.1 Come si guadagna ARIA (Earnings v2, 19 Apr 2026)

| Azione | ARIA guadagnati | Limite | Fonte (DB) |
|---|---|---|---|
| **Welcome grant Alpha-Net** | **+1.000 ARIA** | Una tantum, alla registrazione | `handle_new_user` trigger, `points_ledger` reason=`alphanet_welcome` |
| **Faucet giornaliero** | **+100 ARIA** | 1 al giorno, senza limiti di giorni | RPC `claim_faucet()` |
| **Sequenza giornaliera** (ex streak) | **+50 ARIA** per giorno timbrato | 1 timbro/giorno (lun→dom per settimana) | RPC `daily_checkin_v2()`, tabella `weekly_checkins` |
| **Referral** (vecchia policy) | ARIA non più in earnings v2 | Reward switchati a ROBI | — |

> **Nota:** la vecchia policy (login +1, check-in +1, video +1×5, streak settimanale +1) è stata **rimossa con earnings v2**. Ora solo faucet daily (100) + sequenza daily (50) + welcome (1.000). Semplificazione voluta per Alpha Brave.

> ⚠️ **REGOLA TASSATIVA:** Il controvalore EUR di ARIA NON viene mai mostrato — né in area utente né in admin. Il meccanismo di conversione ARIA → KAS è TBD e non va mai affermato nell'UI.

### 2.2 Come si spende ARIA

| Azione | Costo | Sorgente config |
|---|---|---|
| Acquisto blocco airdrop | Variabile (5, 10, 15, 20, 25 ARIA) | `airdrops.block_price_aria` per singolo airdrop |
| Submission oggetto per valutazione | **50 ARIA** | `airdrop_config.valuation_cost_aria` |

---

## 3. ROBI — NFT Reward (valore reale)

Il **ROBI** è l'asset con valore reale del sistema AIROOBI. È un NFT emesso on-chain (da Stage 2) con garanzia ≥95% del valore in KAS tramite il Fondo Comune.

### 3.1 Come si ottengono ROBI (Earnings v2)

| Fonte | ROBI | Condizione |
|---|---|---|
| Welcome grant Alpha-Net | +5 | Alla registrazione (una tantum) |
| Sequenza settimanale completa (7/7 gg) | +1 | Lun→Dom tutti timbrati |
| Referral (inviter) | +5 | Primo login dell'invitato |
| Referral (invitato) | +5 | Benvenuto al primo login |
| Submission accettata | +1 | AIROOBI accetta la proposta di valutazione |
| Airdrop completato con successo | +5 | Al venditore (no cancel/fallimento) |
| Vittoria airdrop | +5 | Al vincitore |
| ROBI Scoperti nel rullo | Variabile | Puntini oro istantanei visibili nel rullo airdrop al momento dell'acquisto (tuoi anche se airdrop fallisce) |
| ROBI Mining | **Sospesi in Alpha** | Distribuzione proporzionale a fine airdrop — visibile come info, non distribuiti per evitare inflazione |

### 3.2 Come si riscuotono ROBI

- **Buyback on-demand:** l'utente richiede la conversione, elaborazione 24-48h
- **Rimborso garantito:** ≥95% del valore in KAS
- **Apprezzamento naturale:** man mano che il Fondo cresce, il valore dei ROBI può aumentare

### 3.3 ROBI vs altri NFT

| Tipo NFT | DB Key (`nft_type`) | Cosa rappresenta | Riscuotibile? |
|---|---|---|---|
| **ROBI** | `ROBI` | Certificato resa, valore KAS garantito 95% | ✅ Sì |
| NFT Alpha Tier 0 | `NFT_ALPHA_TIER0` | NFT esclusivo prima generazione | ❌ No (collezione) |
| Badge Fondatore | `BADGE_FONDATORE` | Badge Early Adopter (non trasferibile) | ❌ No (riconoscimento) |
| Badge Alpha Brave | `BADGE_ALPHA_BRAVE` | Primo milestone Alpha | ❌ No (riconoscimento) |

---

## 4. Le Tessere — Proxy Wallet

Le Tessere sono carte ricaricabili (proxy wallet) che mostrano il totale delle transazioni. Non si converte la Tessera stessa, ma parte o tutto l'importo che mostrano.

| Tessera | Colore | Tipo | Cosa mostra | Azione |
|---|---|---|---|---|
| Tessera Coin | #4A9EFF (blu) | Proxy wallet ARIA | Saldo ARIA accumulato | Usa per comprare blocchi |
| ROBI | #B8960C (oro) | NFT certificato resa | Valore KAS riscuotibile | Converti in KAS reale (≥95%, 24-48h) |
| Tessera Kaspa | #49EACB (verde) | Proxy wallet KAS | KAS ricevuti da conversioni | Sposta on-chain (da mainnet) |

**CSS vars:** `--aria: #4A9EFF` · `--gold: #B8960C` · `--kas: #49EACB`

---

## 5. Asset Registry

Tutti gli asset ufficiali sono censiti nella tabella `asset_registry` su Supabase.

| Tipo | `id` | `type` | Cosa rappresenta |
|---|---|---|---|
| ARIA | `ARIA` | `currency` | Valuta di piattaforma |
| ROBI | `ROBI` | `nft` | Certificato resa, 95% garantito in KAS |
| NFT Alpha Tier 0 | `NFT_ALPHA_TIER0` | `nft` | NFT esclusivo fondatori |
| Badge Fondatore | `BADGE_FONDATORE` | `badge` | Early Adopter, non trasferibile |
| Badge Alpha Brave | `BADGE_ALPHA_BRAVE` | `badge` | Primi 1.000 utenti Alpha |
| Badge Valutazione | `BADGE_VALUATION` | `badge` | Utente con submission accettate |

---

## 6. Prezzi Blocchi — Variabili per Airdrop

| Categoria | Range Valore | Prezzo Blocco | N° Blocchi tipico |
|---|---|---|---|
| Mobile / Tech entry | €500 – €1.500 | 5 ARIA | 1.000 – 3.000 |
| Tech / Strumenti | €1.500 – €3.000 | 10 ARIA | 1.500 – 3.000 |
| Luxury / 2 Ruote | €3.000 – €15.000 | 15–20 ARIA | 2.000 – 8.000 |
| Ultra Luxury | €15.000+ | 25+ ARIA | 6.000 – 20.000 |

### 6.1 Meccanismo Tre Prezzi Venditore

Quando un venditore sottomette un oggetto, il sistema gestisce tre livelli di prezzo:

| Prezzo | Campo DB | Chi lo imposta | Descrizione |
|---|---|---|---|
| Prezzo desiderato | `seller_desired_price` | Venditore | Quanto il venditore vorrebbe ottenere |
| Prezzo minimo accettabile | `seller_min_price` | Venditore | Il minimo che il venditore accetterebbe (≥ €500) |
| Quotazione AIROOBI | `object_value_eur` | AIROOBI (admin) | Il prezzo finale proposto dalla piattaforma dopo valutazione |

**Formula calcolo blocchi:**
```
N° Blocchi = ceil(quotazione_airoobi / (prezzo_blocco_aria × 0.10))
```

---

## 7. Scoring v4 — Selezione Vincitore

> Dettagli completi in `AIROOBI_Airdrop_Engine_v2.md` §4.

**Principio (19 Apr 2026):** vince chi ha impegnato **più ARIA in quella categoria dal giorno dell'iscrizione**, escluso ARIA rimborsati e ARIA pre-ultima-vittoria nella stessa categoria (reset after win).

```
score = ARIA_storico_categoria_post_last_win + ARIA_airdrop_corrente
```

**Tiebreaker:** (1) più blocchi nell'airdrop corrente, (2) primo blocco comprato prima, (3) seniority profilo.

**Fairness Guard:** `my_max_reachable_score = my_score + remaining_blocks × block_price`. Se `my_max < leader_score`, l'acquisto ulteriore è matematicamente inutile → blocco manual/auto-buy.

**One Category Rule:** dopo una vittoria, l'ARIA pre-win nella stessa categoria non conta più per future partecipazioni (reset a 0). Non puoi dominare la stessa categoria ripetutamente.

---

## 8. Airdrop Config (parametri engine)

Tabella `airdrop_config` (key-value):

| Key | Default | Descrizione |
|---|---|---|
| `valuation_cost_aria` | 50 | Costo in ARIA per richiedere valutazione |
| `presale_duration_hours` | 24 | Durata presale (prezzo scontato) |
| `sale_duration_hours` | 168 (7gg) | Durata sale standard |
| `mining_enabled` | false | ROBI Mining sospeso in Alpha |

Modificabili da admin (ruolo `admin` in `user_roles`).

---

## 9. Distribuzione Revenue per Airdrop

> Split definitiva — vedi `AIROOBI_Airdrop_Engine_v2.md` per dettagli implementativi.

| Destinatario | Percentuale | Su €1.000 (10.000 ARIA) | Note |
|---|---|---|---|
| Venditore P2P | 67,99% | €679,90 | Pagato in KAS, 24-48h dopo draw |
| Fondo Comune | 22,00% | €220,00 | Sostiene il valore dei ROBI |
| Fee Piattaforma | 10,00% | €100,00 | AIROOBI operational revenue |
| Charity Pool | 0,01% | — | Accumulo DAO, causa selezionata dalla community |

Implementazione: `execute_draw` RPC aggiorna `airdrops.venditore_payout_eur`, `airoobi_fee_eur`, `fondo_contributo_eur`, `charity_contrib_eur` e inserisce righe in `treasury_transactions`.

---

## 10. Fondo Comune — Meccanismo di Garanzia

- **Rimborso garantito:** ogni ROBI vale almeno il 95% del suo importo in KAS
- **Buyback on-demand:** l'utente converte parte o tutto l'importo (elaborazione 24-48h)
- **Apprezzamento naturale:** man mano che il Fondo cresce, il valore dei ROBI può aumentare
- **Trasparenza on-chain:** il Fondo è pubblico e verificabile in tempo reale
- **Treasury Funds:** tabella `treasury_funds` traccia versamenti EUR dal founder nel Fondo

> La sezione Fondo Comune nell'UI mostra solo statistiche grezze (Fondo attuale, ROBI emessi). La formula "Ogni ROBI vale: Fondo ÷ ROBI emessi" NON è esposta nell'UI per evitare speculazione.

---

## 11. Video Advertising Revenue

| Trigger Video | CPM stimato | Split ops/fondo |
|---|---|---|
| Login | €10–15 per 1.000 view | 50% / 50% |
| Acquisto blocchi | €10–15 per 1.000 view | 50% / 50% |
| Swap ROBI → KAS | €10–15 per 1.000 view | 50% / 50% |
| Richiesta valutazione oggetto | €10–15 per 1.000 view | 50% / 50% |

> In Alpha 0 i video sono disabilitati (UX semplificata). Saranno riattivati in Stage 1+.

---

## 12. Treasury — Strutture DB

| Tabella | Ruolo |
|---|---|
| `treasury_stats` | Stato aggregato: balance_eur, nft_minted/circulating, aico_circulating (legacy = ARIA), revenue_ads, revenue_adsense |
| `treasury_funds` | Versamenti Founder nel Fondo Comune (amount_eur, description, created_by) |
| `treasury_transactions` | Transazioni per airdrop (split revenue automatico post-draw) |
| `company_assets` | Asset aziendali (fiat, crypto, nft) — admin only |

---

## 13. Fasi di Lancio

| Fase | Stato | Obiettivo | Target utenti |
|---|---|---|---|
| **Alpha** (0→1k) | ✅ ATTIVA (Alpha 0 aperto dal 11 Mar 2026) | Primi 1.000 utenti Alpha Brave, invitation-only | 0→1.000 |
| **Beta** (1k→5k) | ⏳ Prossimo | Apertura graduale, referral attivo, KAS integration | 1.000→5.000 |
| **Pre-Prod** (5k→10k) | ⏳ Futuro | Community bootstrap, NFT reveal event, ROBI mining riattivato | 5.000→10.000 |
| **Mainnet** (10k+) | ⏳ Futuro | Launch pubblico, smart contract on-chain KRC-20 attivo | 10.000+ |

> **Criterio CORE di avanzamento:** soglia utenti. Il tempo è secondario. Vedi memory `project_phases_thresholds.md`.
