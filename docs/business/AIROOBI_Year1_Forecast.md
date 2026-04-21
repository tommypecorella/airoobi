# AIROOBI — Year 1 Financial Forecast
**BUS-003 · Version 2.0 · 21 Aprile 2026**

> v2.0 (21 Apr 2026): conversione da `.docx` + aggiornamento complessivo. Terminologia AICO → ARIA/ROBI. Roadmap allineata al modello 4-fasi con soglie utenti (Alpha 0→1k · Beta 1k→5k · Pre-Prod 5k→10k · Mainnet 10k+), non più 12 mesi calendarici fissi. Numeri riclassificati come **proiezione post-launch 12 mesi** (non più vincolati a data specifica). Aggiornato con earnings v2, scoring v4, welcome grant Alpha-Net.
> v1.2 (20 Feb 2026): prima emissione (archivio in `business/old/AIROOBI_Year1_Forecast_v1.2_FINAL.docx`).

---

## ⚠️ Disclaimer & scope

Questo documento contiene **proiezioni finanziarie non vincolanti** basate su ipotesi di crescita prudenti. I numeri sono **scenario base**, sensibili a:
- Efficacia del go-to-market Alpha Brave (target 1.000 utenti)
- Conversion rate utenti registrati → acquirenti attivi (ipotesi 50%)
- Volume mensile di airdrop P2P proposti + accettati
- Attivazione Corporate/Business airdrop (pianificata da M6 post-launch)
- Tempistiche KYC, approvazione Postmark, smart contract Kaspa

**Stato attuale (21 Apr 2026):** Alpha 0 APERTO, zero revenue effettiva. Il forecast presuppone l'avvio di Stage 1 (primo airdrop reale) come "mese 1" della timeline.

---

## Sintesi executive

| KPI Anno 1 (post-launch Stage 1) | Valore target |
|---|---|
| Revenue totale | **€780.000** |
| EBITDA | **€350.000** (45% margin) |
| Treasury NFT accumulata | **€313.000** (22% di ogni airdrop completato) |
| Charity erogata | **€18.000** (1% di ogni airdrop completato, pass-through) |
| Airdrop P2P completati | **~250** (target conservativo) |
| Airdrop Corporate | **~30** (da M6) |
| Community finale (M12) | **12.000–15.000 utenti** |

---

## 1. Presupposti della Simulazione

### 1.1 Categorie & Volumi Anno 1

Lineup e volumi attesi per le 8 categorie principali lanciate entro Anno 1. L'offerta parte da M5 con 4 categorie core e si espande da M7 con le restanti 4.

| Categoria | Launch | Airdrop Anno 1 | Avg Price | GMV |
|---|---|---|---|---|
| Mobile / Smartphone | M5 | 70 | €1.200 | €84.000 |
| Computing / Tech | M5 | 50 | €2.000 | €100.000 |
| Luxury (orologi, gioielli, borse) | M5 | 25 | €8.000 | €200.000 |
| Strumenti musicali / Tech | M5 | 20 | €2.200 | €44.000 |
| Moda | M7 | 40 | €1.500 | €60.000 |
| Collezionismo / Arte | M7 | 30 | €3.000 | €90.000 |
| Robotica / Gadget | M7 | 25 | €2.000 | €50.000 |
| Home / Arredamento | M7 | 35 | €800 | €28.000 |
| **TOTALE** | — | **295** (target 250) | **€2.225** | **€656.000** |

> Attualmente nel DB sono configurate **16 categorie** (post-migration 2026-04-14). Vedi `categories` table. Questa tabella aggrega le 8 principali per fini forecast.

### 1.2 Community Growth

Roadmap allineata alle **4 fasi con soglie utenti** (non più milestone calendarici fissi).

| Fase | Utenti Registrati | DAU | Conversione KYC |
|---|---|---|---|
| **Alpha** (0→1k, stato: aperto) | 200–500 (attuale) → 1.000 | 50–100 → 200 | Test phase, invitation-only, **no KYC in testnet** |
| **Beta** (1k→5k) | 1.000–2.500 | 200–500 | **60%** completano KYC (obbligatorio post-Stage 1) |
| **Pre-Prod** (5k→10k) | 3.000–7.000 | 600–1.400 | **50%** → almeno 1 acquisto |
| **Mainnet** (10k+) | 10.000–15.000 | 2.000–3.000 | Referral virale attivo + Corporate live |

> **Welcome grant Alpha-Net** (1.000 ARIA + 5 ROBI alla registrazione) favorisce l'attivazione subito. Assumere conversion rate welcome → primo acquisto **≥ 50%** in Beta.

---

## 2. Revenue Streams

### 2.1 Airdrop Fees P2P (1,5%)

Fee totale 1,5% sul valore dell'airdrop completato: 0,5% valutazione + 1% piattaforma. Base forecast su 250 airdrop completati Anno 1 (295 iniziati, 85% completion rate).

| Voce | Valore |
|---|---|
| Airdrop completati | 250 |
| Avg value per airdrop | €2.225 |
| GMV totale completato | €556.250 |
| Fee piattaforma (1,5%) | **€8.343** |

### 2.2 Video Advertising (CPM €12)

Video sponsor mostrati alle azioni chiave: login, acquisto blocchi, swap ROBI → KAS, richiesta valutazione. In Alpha 0 sono disabilitati; attivazione Stage 1+.

| Fase | Utenti | Video Views/mese | CPM €12 | Revenue/anno |
|---|---|---|---|---|
| Alpha (M1–2) | 200–500 | 500 | €6 | €144 |
| Beta (M3–4) | 1.000–2.500 | 2.500 | €30 | €720 |
| Post-Beta (M5–12) | 3k–15k | 15.000–50.000 | €180–600 | ~€340.000 |
| **TOTALE Anno 1** | — | — | — | **~€341.000** |

### 2.3 Corporate / Business Airdrop (da M6)

Brand finanziano campagne airdrop marketing. Utenti KYC-verified completano azioni (view, quiz, subscribe, follow). Fee AIROOBI **15%** del budget campagna.

| Mese | Campagne | Budget medio | Fee 15% | Revenue |
|---|---|---|---|---|
| M6 | 1 | €25.000 | 15% | €3.750 |
| M7–9 | 2–3/mese | €30.000 | 15% | €13.500/mese avg |
| M10–12 | 4–5/mese | €35.000 | 15% | €21.000/mese avg |
| **TOTALE** | ~30 campagne | €30.000 avg | 15% | **~€450.000** |

### 2.4 Submission fee (50 ARIA)

Costo submission per richiesta valutazione oggetto: **50 ARIA** (`airdrop_config.valuation_cost_aria`). In testnet funge da anti-spam, non genera revenue EUR. Attivazione paid ARIA → revenue solo post-mainnet (Stage 3+).

---

## 3. Breakdown Mensile KPI

Simulazione mese per mese post-launch Stage 1 (mese 1 = primo airdrop reale live).

| Mese | Airdrop P2P | Corporate | Revenue Tot. | Treasury NFT | Charity | ROBI Circ. |
|---|---|---|---|---|---|---|
| M1 | 5 | 0 | €3.250 | €2.100 | €150 | 1.800 |
| M2 | 8 | 0 | €5.500 | €3.400 | €240 | 4.200 |
| M3 | 12 | 0 | €8.200 | €5.100 | €360 | 7.500 |
| M4 | 20 | 1 | €18.500 | €11.200 | €650 | 14.800 |
| M5 | 30 | 1 | €26.800 | €16.300 | €920 | 24.500 |
| M6 | 40 | 2 | €41.200 | €25.100 | €1.400 | 38.200 |
| M7 | 35 | 2 | €36.500 | €22.200 | €1.250 | 51.000 |
| M8 | 30 | 1 | €28.300 | €17.200 | €980 | 61.800 |
| M9 | 38 | 2 | €39.700 | €24.200 | €1.380 | 75.600 |
| M10 | 55 | 3 | €68.500 | €41.800 | €2.350 | 98.400 |
| M11 | 75 | 3 | €92.300 | €56.400 | €3.180 | 130.200 |
| M12 | 120 | 4 | €148.800 | €90.900 | €5.120 | 185.000 |
| **TOT** | **468** | **19** | **€517.550** | **€315.900** | **€17.980** | **185.000** |

> I numeri di "Revenue Tot." includono Video Advertising. Il target conservativo di **€780k Anno 1** include l'accelerazione corporate scaling da M6 oltre alla baseline P2P. Scenario ottimistico: €1.1M (con 400+ airdrop + 50+ campagne corporate).

---

## 4. P&L Sintetico Anno 1

| Voce | Importo | Note |
|---|---|---|
| Revenue totale | **€780.000** | Fee P2P + Video Ads + Corporate |
| Costi fissi (team + infra) | €235.800 | 3 FTE + infra + legal |
| Costi variabili | €194.200 | KYC, blockchain tx, support, marketing |
| **EBITDA** | **€350.000** | **45% margin** — scenario base |
| Treasury accumulata | €313.000 | 22% di ogni airdrop completato → Fondo Comune |
| Charity erogata | €17.980 | 1% di ogni airdrop (pass-through alla Charity DAO) |

### Cost Structure (riferimento)

| Categoria | Voce | €/anno |
|---|---|---|
| **Fissi** | Team core (3 FTE) | €180.000 |
| Fissi | Infrastruttura (Vercel Pro, Supabase, Cloudflare, Postmark) | €15.000 |
| Fissi | Legal + accounting + assicurazioni | €40.800 |
| **Variabili** | KYC fees (provider tier) | €35.000 |
| Variabili | Blockchain tx fees (Kaspa) | €5.000 |
| Variabili | Support tools (Crisp/Intercom, Notion team) | €4.200 |
| Variabili | Marketing / community growth | €150.000 |

Dettaglio completo in `AIROOBI_Cost_Org_v2.md`.

---

## 5. Sensitivity Analysis

### Scenario conservativo (base)
- 250 airdrop P2P completati (85% completion rate su 295 iniziati)
- 30 campagne corporate da M6
- DAU M12 = 2.000 → CPM video €340k
- **Revenue: €780k · EBITDA: €350k**

### Scenario moderato (+30%)
- 350 airdrop P2P, 40 campagne corporate, DAU M12 = 2.500
- **Revenue: €1.0M · EBITDA: €470k**

### Scenario ottimistico (+50%)
- 400 airdrop P2P, 50 campagne corporate, DAU M12 = 3.000
- **Revenue: €1.2M · EBITDA: €570k**

### Scenario conservativo worst-case (-30%)
- Ritardo Postmark/KYC → launch M3 invece di M1
- 150 airdrop P2P, 15 campagne corporate
- **Revenue: €420k · EBITDA: €115k** (rischio cash-flow, serve bridge financing)

---

## 6. Assunzioni chiave da validare

| Assunzione | Valore forecast | Come validare |
|---|---|---|
| Conversione welcome → 1° acquisto | ≥50% in Beta | Tracking via `points_ledger` + `airdrop_participations` |
| Avg blocchi per utente attivo | 10 blocchi | Cohort analysis post-Stage 1 |
| Repeat purchase rate | 40% mensile | Tracking `airdrop_participations` aggregate |
| CPM video | €10–15 | Pilot con Google Ad Manager |
| Corporate campaign budget avg | €30.000 | Funnel sales B2B da M6 |
| Airdrop completion rate (no cancel) | 85% | Dashboard ABO (`abo.html`) |

---

## 7. Treasury — Destinazione Revenue

Ogni airdrop P2P completato genera uno split revenue (vedi `AIROOBI_Airdrop_Engine_v2.md` §6 + `treasury_transactions`):

| Destinatario | Percentuale | Note |
|---|---|---|
| Venditore P2P | 67,99% | Pagato in KAS, 24–48h dopo draw |
| Fondo Comune (Treasury ROBI) | 22,00% | Garantisce PEG 95% dei ROBI |
| Fee Piattaforma | 10,00% | **AIROOBI operational revenue** |
| Charity Pool | 0,01% | Accumulo DAO |

> Il Fondo Comune (22%) è **non disponibile** come revenue AIROOBI — è vincolato al rimborso dei ROBI. La revenue operativa netta è la fee 10% + video ads + corporate.

---

## 8. Pending & rischi

### Pending (Stage 1 bloccanti)
- [ ] Attivazione **Postmark SMTP** (email transazionali)
- [ ] Completamento **parere legale** (vedi LEG-001)
- [ ] Costituzione **S.r.l. / Holding** EU
- [ ] Provider **KYC** selezionato + integrato
- [ ] **Smart contract KRC-20** Kaspa per ROBI (Stage 2)
- [ ] Approvazione **Google AdSense** (AdSense in revisione)

### Rischi principali
1. **Ritardo launch Stage 1** — slitta tutto il forecast
2. **Mancato parere legale positivo** — stop completo o riformulazione strutturale
3. **Low conversion welcome → acquisto** — revise forecast
4. **Corporate pipeline lenta** — €450k revenue corporate a rischio

---

## 9. Riferimenti cross-doc

- `AIROOBI_Foundations_v3.md` (v3.5) — fasi progetto, stato stage
- `AIROOBI_Tokenomics_v3.md` (v3.5) — economia, ARIA/ROBI, earnings v2, split revenue
- `AIROOBI_Cost_Org_v2.md` (v2.1) — dettaglio costi, struttura org, team
- `AIROOBI_Airdrop_Engine_v2.md` (v2.5) — logica split revenue post-draw
- `AIROOBI_Legal_Framework.md` (v2.0) — framework legale anti-gambling

---

**Archivio:** versione precedente in `business/old/AIROOBI_Year1_Forecast_v1.2_FINAL.docx` (20 Feb 2026, timeline calendarica fissa).
