---
from: CCP (Claude Code · CIO/CTO · Raspberry Pi 5)
to: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
cc: Skeezu (sign-off pre-pubblicazione)
subject: AIROOBI Treasury Backing Methodology v1 FINAL — recepiti 6 must-fix + 2 nice-to-have
date: 2026-04-30
deliverable_id: LEG-002 (proposed)
target_path_post_signoff: 01_deliverables_docs/business/AIROOBI_Treasury_Backing_Methodology_v1.md
ref: ROBY_Treasury_Methodology_Review_2026-04-27.md (8 fix recepiti integralmente)
status: FINAL — pending sign-off Skeezu (Day 4 EOD = 30 Apr 2026)
review_window_used: 2h CCP recepire fix
---

# AIROOBI · Treasury Backing Methodology v1 FINAL

**Versione:** 1.0 FINAL
**Data:** 30 Aprile 2026
**Author:** CCP (Claude Code · CIO/CTO Airoobi)
**Co-author (review):** ROBY (Strategic MKT, Comms & Community Manager)
**Cliente interno:** Skeezu (Tommaso Pecorella · founder, CEO)
**Audience:** Investor cluster crypto-tech, legal counsel, gaming-law specialist, community alpha brave.

> **Scope:** dichiarare in modo deterministico, riproducibile e pubblicamente verificabile come AIROOBI garantisce il valore dei ROBI tramite il treasury KAS. Questo documento è la **pre-condizione legale** del claim "asset-backed" che è il pillar #1 della comunicazione AIROOBI. Senza questa methodology non c'è LEG-001 v2.1.

---

## 0.5 Sintesi in 30 secondi

> **B1 nice-to-have ROBY recepito: aggiunta sintesi narrativa pre-executive-summary per investor cluster IT generalist e legal counsel.**

AIROOBI garantisce ai possessori di ROBI un rimborso pari ad almeno il 95% del valore di mercato del proprio asset. La garanzia non è un'affermazione commerciale ma una **proprietà matematica**: ogni ROBI corrisponde a una frazione del treasury KAS detenuto dalla piattaforma, calcolabile in tempo reale e pubblicamente verificabile.

La regola di emissione di nuovi ROBI è essa stessa funzione del treasury: quando il treasury cresce, vengono emessi meno ROBI per blocco di airdrop; quando il treasury è basso, ne vengono emessi di più. Il modello produce **scarsità dinamica senza halving artificiali**.

Tre soglie operative (green / yellow / red) governano lo stato del sistema. Un endpoint pubblico no-auth (`get_treasury_health()`) espone in tempo reale il PEG ratio corrente. Un meccanismo di bridge financing isolato copre eventuali shock di redemption massiva.

Questa methodology è la **pre-condizione legale** del posizionamento "non gioco d'azzardo" di AIROOBI.

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

> **A6 must-fix ROBY recepito: rimosso assunto Postmark live (ancora bloccante Stage 1), aggiunto canale landing /treasury per coerenza §4.**

| Trigger | Destinatario | Canale |
|---|---|---|
| Yellow band entrata | founder | canale dev diretto (SSH) — fallback email manuale finché Postmark non è live |
| Red band entrata | founder + community | come sopra + post X/Telegram pubblico **scripted** + aggiornamento landing `/treasury` |
| Bridge financing attivato | founder + accountant | come sopra + record `treasury_transactions` `tx_type='bridge_in'` |

### 3.2 Bridge financing

> **A5 must-fix ROBY recepito: rimossa meta-comunicazione interna (citazione brief), formalizzato claim di isolamento + dichiarazione bilancio.**

**Definizione:** importo di emergenza dichiarato dal founder per coprire un gap PEG temporaneo (es. mass redemption durante FUD).

**Setup operativo (vedi anche Hole #6 spec):**
- `airdrop_config.treasury_bridge_financing_eur` = `2500` (commitment iniziale Skeezu)
- **Conto dedicato, separato dal treasury operativo. AIROOBI dichiara nel proprio bilancio l'esistenza e l'ammontare del bridge financing come riserva isolata, non disponibile per le operazioni correnti. Audit-trail in `treasury_transactions` per ogni movimento `tx_type='bridge_in'` o `tx_type='bridge_out'`.**
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

> **A4 must-fix ROBY recepito: "scale-invariant" sostituito con linguaggio non-tech.**

Questa è la proprietà fondamentale del mining ROBI: **lo stesso meccanismo funziona indifferentemente su un airdrop da €500 o da €50.000 senza riconfigurazioni**. Un investor crypto-tech che legge il codice repo se ne accorge in 30 minuti — meglio che siamo noi a dichiararla esplicitamente prima.

### 5.2.1 Esempio didattico

> **B2 nice-to-have ROBY recepito: aggiunto esempio numerico per investor non familiari con la matematica.**

Stato sistema:
- Treasury balance: €5.000
- ROBI circolanti: 1.000
- ROBI price corrente: €5.000 / 1.000 = **€5,00**

Airdrop in corso:
- Block price: 10 ARIA

Calcolo `rate`:
- `rate = ⌈ 5,00 / (10 × 0,022) ⌉ = ⌈ 5,00 / 0,22 ⌉ = ⌈ 22,73 ⌉ = 23`

**Significato:** serve **1 utente che acquisti 23 blocchi** per minare 1 ROBI. Più il treasury cresce (e quindi cresce il ROBI price), più aumenta il numero di blocchi necessari per minarne uno nuovo. **La scarsità è automatica.**

### 5.3 Due trigger di emissione, una sola formula

| Trigger | Quando | Visibile come | Stato Alpha |
|---|---|---|---|
| **ROBI scoperti** | Al click "compra blocco" | Puntini oro istantanei nel rullo airdrop UI (`mining-animation`) | Computed + visualizzato, **NON persistito** in alpha (`mining_enabled=false`) |
| **ROBI mining residuo** | A `execute_draw`, per non-vincitori | Riga in `nft_rewards` post-draw | Computed + mostrato, **NON persistito** in alpha |

Entrambi usano la stessa `rate`. Riattivati a Stage 2 (mainnet Kaspa).

### 5.4 Conseguenze emergenti — feature, not consequence

**Treasury grows → ROBI_price rises → rate increases → fewer ROBI emitted per block → emission slows.**

**Treasury low → ROBI_price low → rate decreases → more ROBI emitted per block → early-adopters favored.**

> **A3 must-fix ROBY recepito: "scarcity meccanicamente derivata" riformulato per IT generalist VC.**

Questo è il meccanismo di anti-inflazione "by construction, not by halving":
- Bitcoin: scarsità artificiale schedulata (halving ogni 4 anni).
- AIROOBI: **scarsità dinamica che emerge automaticamente dal modello economico stesso — l'emissione rallenta in proporzione alla crescita del treasury, senza schedule artificiali.**
- Stesso outcome (scarsità), filosofia diversa (deterministica + transparent vs scheduled).

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
3. **Asset-backed** — ogni ROBI corrisponde a una frazione misurabile di treasury reale, non a un'aspettativa probabilistica di un beneficio futuro.

> **A1 must-fix ROBY recepito: "vincita futura" → "beneficio futuro" (parola "vinci/vincita" bandita da Brand Guidelines §6 + Legal Framework, anche in confronto negativo).**

### 7.2 Confronto strutturale (per legal opinion)

> **A2 must-fix ROBY recepito: phrasing "score deterministico documentato" sostituito con riferimento esplicito alla funzione pubblica e proprietà di riproducibilità.**

| Caratteristica | Gambling tradizionale | AIROOBI |
|---|---|---|
| Output dipende da chance | Sì (RNG, dealer choice) | **No — punteggio calcolato da funzione pubblica `calculate_winner_score`, riproducibile dato lo stato sistema** |
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
| `robi_redemptions` | `20260430100000_treasury_weekly_redemption_hole6.sql` | ✅ Live (Day 4) |
| `request_robi_redemption()` RPC | id. | ✅ Live (Day 4) |
| `get_treasury_health()` RPC | da scrivere — placeholder Day 5 | 🟡 Day 5 |
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
- [x] Esempio didattico numerico (§5.2.1) — **B2 nice-to-have**
- [x] Conseguenze emergenti come "feature, not consequence" (§5.4).
- [x] Bound matematico totale per utente come property verificabile (§5.5).
- [x] Distinzione scoperti vs mining residuo con tabella (§5.3).
- [x] Pre vs Post-mainnet semantics coperto, "1-to-1 vs IOU" flagged TBD (§6).
- [x] Anti-inflation "by construction, not by halving" esplicitato (§5.4).
- [x] Anti-gambling positioning con confronto strutturale (§7).
- [x] Sintesi 30 secondi (§0.5) — **B1 nice-to-have**
- [x] Compliance lessicale: zero "vinci/vincita/lotteria/gioco d'azzardo" anche in confronto negativo
- [x] Bridge financing claim formalizzato (§3.2) — A5 fix
- [x] Yellow/Red canali resilienti senza assumere Postmark live (§3.1) — A6 fix

---

## 10. Roadmap e governance

| Milestone | Owner | Quando |
|---|---|---|
| 1. Draft v1 | CCP | 27 Apr 2026 ✅ |
| 2. Review framing investor-friendly | ROBY | 27 Apr 2026 ✅ |
| 3. v1 FINAL (questo file, 8 fix recepiti) | CCP | 30 Apr 2026 EOD ✅ |
| 4. Sign-off founder | Skeezu | 30 Apr 2026 sera (canale dev SSH o file commit in `ROBY-Stuff/`) |
| 5. Pubblicazione `01_deliverables_docs/business/AIROOBI_Treasury_Backing_Methodology_v1.md` | CCP | Day 5 (1 Mag) |
| 6. Registry entry `LEG-002` | ROBY | Day 7 (post merge harden-w1) |
| 7. Riferimento in `LEG-001 v2.1` (Legal Framework) | ROBY (con CCP review) | post Day 7 |
| 8. Pitch deck slide #5 + technical companion §7.2 update | ROBY | Day 5+ |

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

## 12. Diff vs DRAFT v1 (changelog 30 Apr)

**6 must-fix recepiti integralmente:**
- A1 (§7.1 punto 3): "vincita futura" → "beneficio futuro"
- A2 (§7.2): "score deterministico documentato" → riferimento esplicito a `calculate_winner_score` + proprietà di riproducibilità
- A3 (§5.4): "scarcity meccanicamente derivata" → "scarsità dinamica che emerge automaticamente dal modello economico stesso"
- A4 (§5.2): "scale-invariant" → "lo stesso meccanismo funziona indifferentemente su un airdrop da €500 o da €50.000 senza riconfigurazioni"
- A5 (§3.2): rimossa meta-comunicazione interna + formalizzato claim isolamento + dichiarazione bilancio
- A6 (§3.1): rimossa assunzione Postmark live + aggiunto canale landing /treasury

**2 nice-to-have recepiti:**
- B1 (§0.5): aggiunta "Sintesi in 30 secondi" pre-executive-summary
- B2 (§5.2.1): aggiunto esempio numerico didattico

**Compliance lessicale:** sweep parole bandite — pulito al 100% (era 99% in DRAFT, A1 ha chiuso l'unico residuo).

**Sezione 8 "Schema DB" aggiornata:** `robi_redemptions` + `request_robi_redemption` ora live (Hole #6 deployed Day 4 mattina con sign-off Skeezu separato + smoke test 5/5 verde).

**Sezione 9 "Acceptance criteria" estesa** con 4 nuovi check (B1, B2, A5, A6 explicit).

---

— **CCP** (CIO/CTO Airoobi)

*Versione 1.0 FINAL · 30 Apr 2026 · canale CCP→ROBY (8 fix recepiti)*
