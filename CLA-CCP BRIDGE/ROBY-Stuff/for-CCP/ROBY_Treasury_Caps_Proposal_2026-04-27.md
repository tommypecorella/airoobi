---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: Skeezu (sign-off)
cc: CCP (Claude Code · CIO/CTO · per implementazione post sign-off)
subject: Proposta valori 6 caps Hole #6 Treasury — sign-off pre-migration
date: 2026-04-27
status: draft per Skeezu sign-off · CCP NON committi la migration finché Skeezu firma uno dei 3 set di valori
deadline: Day 4 EOD (29 Apr) per non slittare sprint W1
---

# Proposta valori 6 caps Treasury — Hole #6

Skeezu, Hole #6 introduce i caps di redemption + il bridge financing che proteggono il PEG ≥95% in caso di stress. Sei valori da firmare, ognuno con impatto **strategico + tecnico + comms** distinto. Non sono numeri tecnici puri: alcuni di questi entrano nel pitch a investor (specialmente il bridge financing) e nel framing legale (`min_block_age_days` rinforza la lettura "buono fruttifero" vs "debit instant").

Tempo lettura: 6-8 minuti. Risposta tua: una frase via SSH a CCP che approva uno dei 3 set complessivi (RACCOMANDATO / CAUTO / AGGRESSIVO) oppure customizza i singoli valori.

---

## Riepilogo dei 6 caps in una tabella

| # | Config key | RACCOMANDATO (mio) | CAUTO | AGGRESSIVO | Cosa protegge |
|---|---|---|---|---|---|
| 1 | `robi_redemption_daily_cap_eur` | **€ 5.000** | € 2.500 | € 10.000 | Bank-run sistemico (treasury depletion) |
| 2 | `robi_redemption_per_user_daily_eur` | **€ 500** | € 250 | € 1.000 | Single-whale drain del cap globale |
| 3 | `robi_redemption_min_block_age_days` | **7** | 14 | 3 | Rapid-drain post-mining (attacco coordinato) |
| 4 | `robi_redemption_processing_hours` | **24-48** (target 24, max 48) | 48-72 | 12-24 | Coerenza brand/pitch (claim "≥95% PEG in 24-48h") |
| 5 | `treasury_health_min_ratio` | **1.05** | 1.10 | 1.02 | Soglia alert pre-PEG-violation |
| 6 | `treasury_bridge_financing_eur` | **€ 2.500** | € 1.000 | € 5.000 | Cuscinetto cash 50% del cap giornaliero (skin in the game founder) |

---

## 1. `robi_redemption_daily_cap_eur` — cap globale giornaliero

### Cosa è

Limite massimo aggregato di EUR-equivalent ROBI redenti dall'intera community in un singolo giorno. Sopra questo cap, le richieste finiscono in `queued_capacity` con processing nei giorni successivi.

### Proposta RACCOMANDATA: **€ 5.000**

**Razionale:**
- In Alpha 0 (~7-50 utenti) il treasury è ancora a zero euro reali → cap praticamente non vincolante, ma dichiarato per investor framing.
- In Alpha Brave (1.000 utenti) il cap copre il 100% del worst-case: se ogni utente ritirasse simultaneamente €5 di ROBI, è ancora dentro il cap. Realistic stress test dell'M3.
- In Beta (5.000 utenti) il cap diventa un soft constraint che incentiva redemption distribuita nel tempo, senza bloccare nessuno legittimamente.
- Da Pre-Prod in poi: cap riformulato come `treasury_balance × 5%` (parametro auto-balance, no hardcode).

**Cosa protegge:** un evento mediatico negativo o FUD virale che porta 100+ utenti a richiedere redemption simultanea. Senza cap, il treasury si svuota in ore e il PEG salta. Con cap, le richieste si distribuiscono su giorni e il bridge financing copre il delta.

**Cosa lascia all'utente:** zero blocco percepito in Alpha-Beta normale. Il queue scatta solo in scenario di stress, e l'UX comunica chiaramente "richiesta accodata, processing entro 48h".

**Impatto investor pitch:** "AIROOBI dichiara un cap giornaliero di redemption a tutela del PEG di treasury, scalabile parametrico-auto da Pre-Prod" — è il tipo di disclosure che un investor crypto-tech apprezza. Compare nello slide #11 del pitch deck come voce "Treasury defense".

### Alternative

| Scelta | Razionale |
|---|---|
| **CAUTO € 2.500** | Più protezione, ma in scenario realistico Alpha-Beta forse troppo stretto. Rischio falsi positivi `queued_capacity`. |
| **AGGRESSIVO € 10.000** | Più ampio, riduce friction. Ma in caso di mass redemption, treasury small di fase Alpha può non reggere. |

---

## 2. `robi_redemption_per_user_daily_eur` — cap per user giornaliero

### Cosa è

Limite singolo utente. Garantisce che una whale non monopolizzi il cap globale.

### Proposta RACCOMANDATA: **€ 500**

**Razionale:**
- Rapporto `cap_user / cap_global = 500/5.000 = 10%`: servono **10 utenti contemporanei** per saturare il cap globale. Distribuzione healthy.
- In Alpha-Beta utenti normali hanno < €100 ROBI da redenzionare → cap mai vincolante per loro.
- Per power-user con €1.000+ in ROBI, il cap distribuisce la redemption su 2-3 giorni — UX accettabile, framing "smooth controlled liquidity".

**Cosa protegge:** scenario "1 whale, 9 follower" — un utente con 200 ROBI a €10 (€2.000) prova drain in 1 giorno. Cap blocca a €500/day, lo costringe a 4 giorni. Nel frattempo treasury si rifornisce da nuovi airdrop completati.

**Impatto investor pitch:** "Cap per-user previene whale drain del PEG comunitario" — semplice da spiegare, fa parte della Treasury Backing Methodology v1 §2.

### Alternative

| Scelta | Razionale |
|---|---|
| **CAUTO € 250** | 20 user per saturare. Più anti-whale, ma frustrante per power-user legittimi (3-4gg per redenzionare €1.000). |
| **AGGRESSIVO € 1.000** | 5 user per saturare. UX migliore ma rischio whale-drain più reale. |

---

## 3. `robi_redemption_min_block_age_days` — età minima ROBI

### Cosa è

Un ROBI minato meno di N giorni fa **non è redeembile**. Solo i ROBI maturi possono essere convertiti in KAS.

### Proposta RACCOMANDATA: **7 giorni**

**Razionale strategico (questo è il valore con maggiore impatto comms):**

Sette giorni è il **sweet spot tra protezione tecnica e framing legale**. Tre angoli:

1. **Tecnico:** previene attacco "rapid-drain" — un attaccante compra 1.000 blocchi, mina 50 ROBI, prova redemption istantanea. Con 7gg min, AIROOBI ha una settimana per assorbire la nuova emissione nella treasury via altri airdrop completati. Riduce volatilità PEG.

2. **Legale:** rinforza il framing **"ROBI = buono fruttifero"** (vs "ROBI = debit instant"). Un buono fruttifero matura il diritto di riscossione dopo un periodo definito. Lo Stato italiano usa questo schema per BFP (1 anno minimum). Noi 7 giorni è proporzionato alla nostra fase Alpha-Beta. **Lo studio gaming-law lo apprezzerà**: è un altro pilastro della distinzione "non strumento finanziario speculativo".

3. **UX:** il messaging è "il tuo ROBI matura nei prossimi 7 giorni, dopodiché lo puoi convertire". Non è frustrante perché coerente con la narrativa "asset-backed che cresce nel tempo".

**Cosa protegge:** scenario "1 attaccante, 10 alt account, 1 airdrop massivo, redemption simultanea". Senza min_age, il rapid-drain è possibile entro 24h. Con 7gg, l'attaccante deve aspettare — e nel frattempo il sistema può detect & block via Layer A+B (sybil resistance) + value_threshold check.

### Alternative

| Scelta | Razionale |
|---|---|
| **CAUTO 14** | Più protezione, ma narrativa più "lock-up" che "buono fruttifero". UX peggiore. |
| **AGGRESSIVO 3** | UX migliore, ma rapid-drain meno mitigato. Framing legale più debole. |

**Nota futuro:** in Pre-Prod-Mainnet (treasury maturo) la soglia può scendere a 3 giorni o anche 24h, perché il treasury è più resiliente. Versionamento scriptato in Treasury Methodology v2.0.

---

## 4. `robi_redemption_processing_hours` — target processing hours

### Cosa è

Target temporale dichiarato per processing redemption: tra ricezione richiesta e payout KAS sul wallet.

### Proposta RACCOMANDATA: **24-48h** (target 24, max 48)

**Razionale:**
- **Coerenza con tutto quello che già diciamo nel pitch deck, brand kit, technical companion, FAQ landing.** Il claim "≥95% PEG in 24-48h" è ovunque. Cambiare ora introdurrebbe inconsistency.
- 24h target è realistico per processing manuale fino a Stage 2 (smart contract Kaspa). 48h è buffer per weekend/festivi.
- In Stage 2+ con smart contract on-chain, il target può scendere a "instant on-chain settlement" — ma per ora 24-48h è solid.

### Alternative

| Scelta | Razionale |
|---|---|
| **CAUTO 48-72h** | Più safety operativa, ma rompe coerenza con materiali esistenti. **Da evitare** se non c'è motivo operativo concreto. |
| **AGGRESSIVO 12-24h** | UX migliore, ma stress operativo alto in Alpha (processing manuale 7/7). Rischio missed SLA se Skeezu è in vacanza. |

**Forte raccomandazione:** mantenere 24-48 anche se sembra "come l'attuale". È il sweet spot già vendor.

---

## 5. `treasury_health_min_ratio` — soglia health PEG

### Cosa è

Rapporto minimo `(treasury_balance_eur) / (robi_circulating × eur_per_robi_target)` sotto cui scatta l'allarme green → yellow.

### Proposta RACCOMANDATA: **1.05**

**Razionale:**
- Coerente con Treasury Backing Methodology v1 DRAFT §2 (CCP ha già scritto green ≥ 1.05, yellow 1.00-1.05, red < 1.00). Cambiare ora rompe la coerenza interna di v1.0.
- 1.05 = 5% buffer sopra il PEG 95%. Se scendi sotto, alert founder via SSH dev channel — prima che diventi red.
- 1.00 (red) è la soglia "deve halt redemption" — se treasury < ROBI × target_price, il PEG è formalmente violato. Il bridge financing scatta.

### Alternative

| Scelta | Razionale |
|---|---|
| **CAUTO 1.10** | Allarme prima (10% buffer). Più safety ma più frequenti yellow alerts → fatigue founder. |
| **AGGRESSIVO 1.02** | Allarme tardi (2% buffer). Rischio passaggio diretto green→red senza yellow di preavviso. |

**1.05 sweet spot già in Methodology v1.** Conferma e procedi.

---

## 6. `treasury_bridge_financing_eur` — bridge financing committed

### Cosa è

Importo cash riservato isolato dal treasury operativo, attivato in caso di Red band PEG. Commitment personale founder fino a Series Seed (post-Stage 2 Pre-Prod), poi sostituito da line-of-credit o investor commitment.

### Proposta RACCOMANDATA: **€ 2.500**

**Razionale strategico (questo è il valore con maggiore impatto investor):**

€2.500 in fase pre-seed è una somma **simbolica ma significativa**:

1. **Skin in the game founder.** Un VC che legge il pitch vede *"founder ha messo €2.500 di tasca propria come bridge isolato"*. Non è una somma che muove la nave, ma è il segnale di engagement personale che separa "founder che cerca soldi" da "founder che ha già investito i suoi". Lo metto in slide #14 (Ask) del pitch deck come voce.
2. **Rapporto operativo: 50% del cap globale giornaliero.** €2.500 / €5.000 = 50%. Significa che in caso di Red band, AIROOBI può coprire 1/2 giornata di full redemption col bridge. Sufficiente per processare il queue mentre nuovi airdrop completed riforniscono il treasury.
3. **Conto dedicato isolato.** Tu (Skeezu) lo accantoni in conto separato dal personale e dichiari nel tuo bilancio interno. Audit trail in `treasury_funds` con `tx_type='bridge_commit'`.

### Alternative

| Scelta | Razionale |
|---|---|
| **CAUTO € 1.000** | Meno commitment cash. Ma rapporto bridge/cap = 20% — copre solo 4-5h di full redemption. Debole come safety net. |
| **AGGRESSIVO € 5.000** | Bridge = 100% cap globale. Massima protezione. Ma €5k cash isolato è significativo per pre-seed founder bootstrap. **Solo se hai liquidità personale a disposizione.** |

**Nota strategica:** post round pre-seed (€750k), il bridge va RAISED a €10-15k come riserva strutturale, finanziata dal round stesso (parte dei "use of funds" che già dichiari nel pitch deck §13). Lo includiamo nella v1.1 della Methodology dopo round closure.

---

## Set complessivi pre-confezionati per firma rapida

Tre opzioni di sign-off in blocco:

### Opzione A — RACCOMANDATA (mia raccomandazione)

```
robi_redemption_daily_cap_eur     = 5000
robi_redemption_per_user_daily_eur = 500
robi_redemption_min_block_age_days = 7
robi_redemption_processing_hours   = 48 (target 24)
treasury_health_min_ratio          = 1.05
treasury_bridge_financing_eur      = 2500
```

### Opzione B — CAUTA (se preferisci massima protezione)

```
robi_redemption_daily_cap_eur     = 2500
robi_redemption_per_user_daily_eur = 250
robi_redemption_min_block_age_days = 14
robi_redemption_processing_hours   = 72 (target 48)
treasury_health_min_ratio          = 1.10
treasury_bridge_financing_eur      = 1000
```

### Opzione C — AGGRESSIVA (se vuoi UX massima e accetti rischio)

```
robi_redemption_daily_cap_eur     = 10000
robi_redemption_per_user_daily_eur = 1000
robi_redemption_min_block_age_days = 3
robi_redemption_processing_hours   = 24 (target 12)
treasury_health_min_ratio          = 1.02
treasury_bridge_financing_eur      = 5000
```

### Opzione D — CUSTOM (mix dei valori)

Se preferisci pickare valori da set diversi (es. RACCOMANDATA su tutto eccetto bridge €5.000 perché hai cash disponibile), elenca i 6 valori esatti via SSH a CCP.

---

## Cosa serve da te

Una frase via SSH a CCP:

```
decision treasury_caps A          — RACCOMANDATA (mia preferenza)
decision treasury_caps B          — CAUTA
decision treasury_caps C          — AGGRESSIVA
decision treasury_caps custom <6 valori>  — set personalizzato
decision treasury_caps rivedere   — vuoi parlarne 15 min con me prima
```

Se scegli `rivedere`, fissami una call Cowork oggi pomeriggio. Se scegli A/B/C/custom: CCP procede con la migration `20260427130000_treasury_caps.sql` con i 6 valori firmati + tabella `robi_redemptions` + RPC `request_robi_redemption()` + edge function `process-redemption-queue`.

**Deadline:** Day 4 EOD (29 Apr) per non slittare sprint W1. Senza tua risposta, CCP procede con A in default e ti tagga il commit per review/revoca.

---

## Considerazione finale

Skeezu, leggi soprattutto **§3 (`min_block_age_days = 7`)** e **§6 (`bridge_financing = €2.500`)** prima di firmare. Questi due valori entrano direttamente nel pitch a investor + nel framing legale per studio gaming-law:

- **§3 è il pillar del framing "buono fruttifero"** — opzione cauta o aggressiva cambia la narrativa.
- **§6 è la tua "skin in the game"** che diventa parte dello slide investor.

Se hai dubbi su questi due in particolare, fissami 15 minuti. Gli altri quattro (§1, §2, §4, §5) sono tecnici e l'opzione RACCOMANDATA è il sweet spot operativo.

---

— **ROBY**

*Versione 1.0 · 27 Apr 2026 · canale ROBY→Founder*
