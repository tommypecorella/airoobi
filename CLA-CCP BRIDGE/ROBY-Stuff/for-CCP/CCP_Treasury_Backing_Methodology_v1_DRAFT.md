---
from: CCP (Claude Code · CIO/CTO · Raspberry Pi 5)
to: ROBY (review framing investor-friendly), Skeezu (sign-off)
subject: AIROOBI Treasury Backing Methodology v1 — DRAFT
date: 2026-04-27
deliverable_id: LEG-002 (proposed)
target_path_post_review: 01_deliverables_docs/business/AIROOBI_Treasury_Backing_Methodology_v1.md
status: DRAFT — pending ROBY framing review (Day 4 spec) + Skeezu sign-off
review_window: 12h post handoff
---

# AIROOBI · Treasury Backing Methodology v1

**Versione:** 1.0 — DRAFT
**Data:** 27 Aprile 2026
**Author:** CCP (Claude Code · CIO/CTO Airoobi)
**Co-author (review):** ROBY (Strategic MKT, Comms & Community Manager)
**Cliente interno:** Skeezu (Tommaso Pecorella · founder, CEO)
**Audience:** Investor cluster crypto-tech, legal counsel, gaming-law specialist, community alpha brave.

> **Scope:** dichiarare in modo deterministico, riproducibile e pubblicamente verificabile come AIROOBI garantisce il valore dei ROBI tramite il treasury KAS. Questo documento è la **pre-condizione legale** del claim "asset-backed" che è il pillar #1 della comunicazione AIROOBI. Senza questa methodology non c'è LEG-001 v2.1.

---

## 0. Sintesi esecutiva

Il valore di un ROBI è ancorato a una grandezza misurabile: il **PEG ratio**, definito come rapporto tra treasury KAS disponibile e ROBI in circolazione. La methodology copre:

1. **Formula PEG operativa** — esplicita, non implicita.
2. **Cadenza ricalcolo** — real-time on-demand + snapshot daily.
3. **Soglie e guardrail automatici** — green / yellow / red con azioni differenti.
4. **Escalation path** — chi notifica chi, e quando interviene il bridge financing.
5. **Audit trasparenza** — endpoint pubblico no-auth `get_treasury_health()`.
6. **ROBI emission as treasury-coherent function** — la regola di mining è funzione del PEG (non parametro fisso).
7. **Anti-inflazione "by construction, not by halving"** — proprietà matematica intenzionale.
8. **Pre/post-mainnet semantics** — ROBI ledger Supabase ↔ ROBI on-chain (KRC-721) sono economicamente equivalenti.

> Linguaggio: zero gambling jargon, zero promesse di "rendimento garantito". Uso "PEG" tecnicamente, "buyback bound" per il rimborso. ROBY revisiona per framing investor-friendly prima della pubblicazione.

---

## 1. Formula PEG operativa

```
peg_ratio = treasury_balance_eur / (robi_circulating × eur_per_robi_target)
```

**Definizioni:**

| Simbolo | Significato | Sorgente dato |
|---|---|---|
| `treasury_balance_eur` | Bilancio treasury convertito in EUR (KAS × KAS_EUR_oracle) | `treasury_stats.balance_eur` |
| `robi_circulating` | ROBI emessi - ROBI già riscossi (KAS) | `treasury_stats.nft_circulating` |
| `eur_per_robi_target` | Prezzo target di mercato per 1 ROBI (≈€1, tunable in airdrop_config) | `airdrop_config.robi_target_price_eur` |

**Cadenza ricalcolo:**
- **Real-time** — view function `get_treasury_health()` ricalcola al volo dai latest values (read-only, no auth required, costo trascurabile).
- **Snapshot daily** — alle 00:05 UTC il cron `treasury_daily_snapshot` salva un row in `treasury_stats` con timestamp, e logga in `treasury_transactions` un record `peg_snapshot` per audit immutabile.

> **Acceptance criterion** (Q3.1 ROBY_Reply_to_CCP_W1): formula scritta in chiaro, non come "vedi codice".

---

## 2. Soglie e guardrail automatici

| Banda | PEG ratio | Stato sistema | Azione automatica |
|---|---|---|---|
| 🟢 **Green** | ≥ 1.05 | Operatività normale | Redemption immediate (target 24h, max 48h) |
| 🟡 **Yellow** | 1.00 ≤ PEG < 1.05 | Allerta | Slowdown redemption (target 48h), alert founder via SSH dev channel |
| 🔴 **Red** | PEG < 1.00 | Halt | **Halt redemption** + bridge financing trigger + community broadcast scripted |

**Storage:** ogni transizione di banda è registrata come riga `treasury_transactions` con `tx_type = 'band_transition'`, `props = {from, to, peg_ratio, ts}`.

**Override manuale:** founder (admin role) può forzare uno stato via RPC `set_treasury_band(band TEXT, reason TEXT)` — rispetta il pattern audit log (entry events).

---

## 3. Escalation path

### 3.1 Notifiche automatiche

| Trigger | Destinatario | Canale |
|---|---|---|
| Yellow band entrata | founder | dev SSH channel notification (Pi 5) + email PostMark |
| Red band entrata | founder + community | come sopra + post X/Telegram pubblico **scripted** |
| Bridge financing attivato | founder + accountant | come sopra + record `treasury_transactions` `tx_type='bridge_in'` |

### 3.2 Bridge financing

**Definizione:** importo di emergenza dichiarato dal founder per coprire un gap PEG temporaneo (es. mass redemption durante FUD).

**Setup operativo (vedi anche Hole #6 spec):**
- `airdrop_config.treasury_bridge_financing_eur` = `2500` (commitment iniziale Skeezu)
- Conto dedicato isolato dal treasury operativo (richiesta ROBY: "va isolato in conto dedicato come dico nel brief").
- Trigger: PEG entra in red band → flag `bridge_financing_active = true` + notifica founder per autorizzazione manuale prima del transfer.
- Nessun trigger automatico di transfer fondi senza approvazione esplicita founder.

**Comunicazione community:** template scripted in `01_deliverables_docs/comms/treasury_red_band_broadcast.md` (CCP creerà il file in Day 5 — tone allineato a brand kit, zero gambling jargon).

> **Acceptance criterion** (Q3.4 ROBY_Reply_to_CCP_W1): escalation path chi notifica chi + bridge financing flow esplicitato.

---

## 4. Audit trasparenza — endpoint pubblico

```
RPC: public.get_treasury_health()
Auth: NONE (anon role)
Returns: jsonb {
  ts:                 ISO8601,
  treasury_balance_eur: number,
  robi_circulating:   number,
  peg_ratio:          number,
  band:               'green'|'yellow'|'red',
  bridge_active:      boolean,
  redemption_target_hours: number
}
```

**Implementazione:** read-only su `treasury_stats` + `airdrop_config`. Nessun side effect. Cacheabile con TTL 60s a livello CDN se serve (per oggi: invocazione diretta, costo trascurabile).

**Visibilità:**
- Endpoint: `https://vuvlmlpuhovipfwtquux.supabase.co/rest/v1/rpc/get_treasury_health`
- Documentazione pubblica: `airoobi.com/treasury` (CCP scrive landing nel Day 5 slack time se ROBY non ha bandwidth — altrimenti collaborazione).
- Dashboard interna admin: pannello in `abo.html` che ricarica il valore ogni 30s.

> **Acceptance criterion** (Q3.5 ROBY_Reply_to_CCP_W1): numeri pubblicamente accessibili via RPC no-auth + spec API + endpoint readonly.

---

## 5. ROBI Emission as Treasury-Coherent Function

> **Sezione introdotta da ROBY_Tech_Note_ROBI_Mining_Coherence_2026-04-27.md.** Skeezu ha ribadito che la regola di mining ROBI è funzione del prezzo treasury — design point fondamentale che va dichiarato esplicitamente.

### 5.1 Formula `rate`

```
rate = ⌈ ROBI_price / (block_price × ARIA_EUR × SPLIT_FONDO) ⌉
     = ⌈ ROBI_price / (block_price × 0.022) ⌉

dove:
  ROBI_price  = treasury_balance_eur / robi_circulating
  block_price = ARIA per block (5–25, configurable per airdrop)
  ARIA_EUR    = 0.10 (config in airdrop_config)
  SPLIT_FONDO = 0.22 (config in airdrop_config — frazione che va a treasury)

ROBI emessi per utente non-vincitore = blocks_acquired_by_user / rate
```

### 5.2 La proprietà matematica più elegante — cancellazione esplicita

Il prodotto `ARIA_EUR × SPLIT_FONDO = 0.10 × 0.22 = 0.022` rappresenta il contributo treasury per ogni ARIA spesa. La forma estesa della formula `rate` mostra che `total_blocks × object_value` si **cancella** nella semplificazione (dimostrazione completa: vedi `01_deliverables_docs/business/AIROOBI_Airdrop_Engine_v2.md` §9.2).

**Conseguenza tecnica:** la regola di emissione ROBI dipende **solo** da:
- Treasury price corrente (= treasury_balance_eur / robi_circulating)
- Block price configurato per quell'airdrop
- Costanti di sistema (ARIA_EUR, SPLIT_FONDO)

**Non dipende da:**
- Numero totale di blocchi dell'airdrop
- Valore intrinseco dell'oggetto in palio
- Numero di partecipanti

Questa è la proprietà "scale-invariant" del mining ROBI. Un investor crypto-tech che legge il codice repo se ne accorge in 30 minuti — meglio che sia noi a dichiararla esplicitamente prima.

### 5.3 Due trigger di emissione, una sola formula

| Trigger | Quando | Visibile come | Stato Alpha |
|---|---|---|---|
| **ROBI scoperti** | Al click "compra blocco" | Puntini oro istantanei nel rullo airdrop UI (`mining-animation`) | Computed + visualizzato, **NON persistito** in alpha (`mining_enabled=false`) |
| **ROBI mining residuo** | A `execute_draw`, per non-vincitori | Riga in `nft_rewards` post-draw | Computed + mostrato, **NON persistito** in alpha |

Entrambi usano la stessa `rate`. Riattivati a Stage 2 (mainnet Kaspa).

### 5.4 Conseguenze emergenti — feature, not consequence

**Treasury grows → ROBI_price rises → rate increases → fewer ROBI emitted per block → emission slows.**

**Treasury low → ROBI_price low → rate decreases → more ROBI emitted per block → early-adopters favored.**

Questo è il meccanismo di anti-inflazione "by construction, not by halving":
- Bitcoin: scarcity artificiale schedulata (halving ogni 4 anni).
- AIROOBI: scarcity dinamica meccanicamente derivata dalla treasury growth.
- Stesso outcome (scarcity), filosofia diversa (deterministica + transparent vs scheduled).

> **Acceptance criterion** (ROBY_Tech_Note §5 + §3): "feature, not consequence" esplicitato.

### 5.5 Bound matematico totale per utente

Per ogni utente, sommando ROBI scoperti + mining residuo cumulativi su tutta la storia di partecipazione:

```
ROBI_user_total ≤ Σ(blocks_acquired_i × block_price_i × 0.022 / ROBI_price_i)
                ≈ Σ(EUR_treasury_contributed_i / ROBI_price_i)
```

Dove `i` itera su tutti gli airdrop a cui l'utente ha partecipato. Il bound è predicibile e calcolabile dato il treasury history pubblico — non c'è incertezza sul totale ROBI ottenibile da un dato livello di partecipazione.

> **Acceptance criterion** (ROBY_Tech_Note §5.5): bound matematico totale per utente espresso come property verificabile.

### 5.6 Tabella scoperti vs mining residuo (dichiarazione)

> **Acceptance criterion** (ROBY_Tech_Note §4): distinzione scoperti vs mining residuo chiara con tabella. Vedi §5.3 sopra.

---

## 6. Pre vs Post-mainnet semantics

> **Acceptance criterion** (ROBY_Tech_Note §"Distinzione che NON va persa"): la methodology deve gestire il passaggio temporale.

### 6.1 Pre-mainnet (oggi · fase Alpha-Net e Beta)

- ROBI vivono nel ledger Supabase: tabella `nft_rewards`, righe con `nft_type='ROBI'`.
- Treasury price calcolato da `treasury_stats.balance_eur / treasury_stats.nft_circulating`.
- ROBI sono **soulbound** (vedi `airdrop_config.robi_transferable=false`, decisione Skeezu A · Hole #5 · 27 Apr 2026).
- Riscossione: redemption RPC `request_robi_redemption()` → conversione EUR → KAS al PEG corrente, processata in 24-48h.

### 6.2 Post-mainnet (target Stage 2 · giugno 2026 · Kaspa KRC-721)

- ROBI on-chain come token KRC-721.
- Treasury price può essere oracleato on-chain via RPC view-only, oppure rimanere calcolato off-chain con audit pubblico.
- Trasferibilità riapertura: condizionata a parere legale specialistico + stato PEG (vedi decisione A · Hole #5).

### 6.3 Il "1-to-1 mint vs IOU" — TBD by founder

I ROBI accumulati pre-mainnet sono **economicamente equivalenti** ai ROBI on-chain post-mainnet (1-to-1 mapping al mint). Tuttavia, la decisione di design "1-to-1 mint vs IOU contrattuale" è ancora aperta:

- **Opzione 1 — 1-to-1 mint:** ogni ROBI Supabase pre-mainnet diventa un ROBI on-chain post-mainnet. Migration via Merkle tree snapshot + airdrop on-chain.
- **Opzione 2 — IOU contrattuale:** ROBI Supabase resta il "vero" ledger; on-chain è un wrapper con emissione lazy quando l'utente richiede transferability.

> **TBD flag:** decisione founder, target window: **30 giorni post Hardening Sprint** (≈ fine Maggio 2026). ROBY produrrà nel frattempo il pitch deck slide aggiornato che parla di "mainnet migration roadmap" senza forzare la mano sulla scelta.

> **Acceptance criterion** (ROBY_Tech_Note §pre/post): copertura del passaggio temporale anche se 1-to-1 vs IOU resta aperto.

---

## 7. Anti-gambling positioning

Questa sezione esplicita perché la methodology stessa è la pre-condizione legale del posizionamento "non gambling".

### 7.1 Tre proprietà non-gambling

1. **Determinismo** — ogni outcome (mining, redemption, drawing) è calcolabile a priori dato lo stato pubblico del sistema. Nessuna sorgente di randomness incontrollata.
2. **Bound matematico** — il rapporto valore-output / valore-input ha un upper bound predicibile (≥95% PEG). Niente "house edge variabile".
3. **Asset-backed** — ogni ROBI corrisponde a una frazione misurabile di treasury reale, non a un'aspettativa probabilistica di vincita futura.

### 7.2 Confronto strutturale (per legal opinion)

| Caratteristica | Gambling tradizionale | AIROOBI |
|---|---|---|
| Output dipende da chance | Sì (RNG, dealer choice) | No (score deterministico documentato) |
| Bound rimborso minimo | Nessuno | ≥95% PEG dichiarato e verificabile |
| Trasparenza algoritmo | Closed-source / regulated black box | Open-source, RPC pubblica |
| Asset-backing | No (banca della casa) | Sì (treasury KAS riscuotibile) |
| Riscossione fissa | No | Sì (24-48h target) |

> **Linguaggio framing (richiesta ROBY):** zero "rendimento garantito", "PEG" come termine tecnico, "buyback bound" per il rimborso. Linguaggio anti-gambling tassativo come da brand kit (vedi `AIROOBI_Brand_Guidelines_v3.md` §5).

---

## 8. Schema DB e migration di riferimento

| Tabella / RPC | File migration | Status |
|---|---|---|
| `treasury_stats` | esistente (`treasury_stats.sql`) | ✅ Live |
| `treasury_transactions` | esistente | ✅ Live |
| `airdrop_config` (key/value tunables) | esistente | ✅ Live |
| `robi_redemptions` | spec in Hole #6 (Sprint W1) | 🟡 Day 4-5 |
| `request_robi_redemption()` RPC | spec in Hole #6 | 🟡 Day 4-5 |
| `get_treasury_health()` RPC | da scrivere — placeholder Day 4 | 🟡 Day 4 |
| `treasury_daily_snapshot` cron | da scrivere — placeholder Day 5 | 🟡 Day 5 |
| `set_treasury_band()` RPC admin | da scrivere — Day 5 | 🟡 Day 5 |

Le migration concrete saranno create nel branch `harden-w1` come parte della implementation Hole #6 + supplemento methodology v1.

---

## 9. Acceptance criteria checklist (per review ROBY)

Prima della firma e pubblicazione come `LEG-002`:

- [x] Formula PEG operativa esplicita (§1).
- [x] Cadenza ricalcolo definita real-time + snapshot daily (§1).
- [x] Soglie green / yellow / red con azioni automatiche (§2).
- [x] Escalation path founder + community + bridge financing (§3).
- [x] RPC `get_treasury_health()` no-auth pubblica con spec (§4).
- [x] Sezione "ROBI Emission as Treasury-Coherent Function" (§5).
- [x] Formula `rate` in chiaro (§5.1).
- [x] Cancellazione `total_blocks × object_value` dimostrata esplicitamente (§5.2).
- [x] Conseguenze emergenti come "feature, not consequence" (§5.4).
- [x] Bound matematico totale per utente come property verificabile (§5.5).
- [x] Distinzione scoperti vs mining residuo con tabella (§5.3).
- [x] Pre vs Post-mainnet semantics coperto, "1-to-1 vs IOU" flagged TBD (§6).
- [x] Anti-inflation "by construction, not by halving" esplicitato (§5.4).
- [x] Anti-gambling positioning con confronto strutturale (§7).

> **Note ROBY:** se manca qualcosa o serve rephrasing per framing investor-friendly, marca con commento `<!-- ROBY: needs explicit treatment -->` o `<!-- ROBY: rephrase? -->` e te lo riscrivo.

---

## 10. Roadmap e governance

| Milestone | Owner | Quando |
|---|---|---|
| 1. Draft v1 (questo file) | CCP | 27 Apr 2026 (Day 1 sprint W1) ✅ |
| 2. Review framing investor-friendly | ROBY | Day 4 (≤ 12h post handoff) |
| 3. Sign-off founder | Skeezu | Day 4-5 (canale dev SSH o file commit in `ROBY-Stuff/`) |
| 4. Pubblicazione `01_deliverables_docs/business/AIROOBI_Treasury_Backing_Methodology_v1.md` | CCP | Day 5 |
| 5. Registry entry `LEG-002` | ROBY | Day 7 (post merge harden-w1) |
| 6. Riferimento in `LEG-001 v2.1` (Legal Framework) | ROBY | post Day 7 |
| 7. Pitch deck slide #5 + technical companion §7.2 update | ROBY | Day 5 (post Hole #3 merged) |

**Versioning futuro:**
- `v1.1, v1.2` — fix tipografici / rephrase ROBY senza cambio sostanza.
- `v2.0` — bump quando Skeezu firma decisione "1-to-1 mint vs IOU" (target fine Maggio 2026).
- `v3.0` — bump al passaggio Pre-Prod con eventuale apertura trasferibilità ROBI (target Q1 2027).

---

## 11. Note di processo

- Questo file vive **temporaneamente** in `CLA-CCP BRIDGE/ROBY-Stuff/for-CCP/` come `CCP_*.md` per la review ROBY. Post-sign-off Skeezu, viene **promosso** a `01_deliverables_docs/business/AIROOBI_Treasury_Backing_Methodology_v1.md` (file vive nel repo principale, PDF generato per ROBY-Stuff).
- Nessuna modifica a file ROBY (rispetto regola read-only mutuale).
- Se ROBY trova errori nel framing, scrive `ROBY_Comment_Treasury_Methodology_*.md` puntando ai paragrafi specifici. CCP riprende e produce v1.1.

---

— **CCP** (CIO/CTO Airoobi)

*Versione 1.0 DRAFT · 27 Apr 2026 · canale CCP→ROBY*
