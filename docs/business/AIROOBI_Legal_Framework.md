# AIROOBI — Legal Framework & Non-Gambling Analysis
**LEG-001 · Version 2.0 · 21 Aprile 2026**

> v2.0 (21 Apr 2026): conversione da `.docx` + update complessivo. Terminologia AICO → ARIA/ROBI (AICO deprecato). Aggiunte sezioni scoring v4 anti-gambling, Fairness Guard, One Category Rule, earnings v2 (welcome grant Alpha-Net, sequenza giornaliera). Stato stage aggiornato (Alpha 0 aperto, invitation-only, no KYC ancora applicato in testnet).
> v1.1 (20 Feb 2026): prima emissione (archivio in `business/old/AIROOBI_Legal_v1.1_FINAL.docx`).

> ⚠️ **DISCLAIMER:** Questo documento non costituisce parere legale. È una analisi preliminare interna. Prima di operare in produzione mainnet è **obbligatoria** la consulenza da uno studio legale specializzato in gaming law italiano + EU e in tax law per cripto-attività.

---

## 1. Framework Gioco d'Azzardo — Italia & EU

Il gioco d'azzardo in Italia è regolamentato dal **TULPS (R.D. 773/1931)** e successive modifiche, oltre alle direttive EU. L'autorità competente è l'**Agenzia delle Dogane e dei Monopoli (ADM)**.

Un'attività è considerata gioco d'azzardo se soddisfa **TRE criteri cumulativi**:

| # | Criterio | Descrizione | Test AIROOBI |
|---|---|---|---|
| 1 | **Consideration** (Pagamento) | Il partecipante paga denaro per partecipare | ✓ Presente — l'utente acquista blocchi con ARIA |
| 2 | **Alea** (Chance) | Il risultato dipende principalmente dalla fortuna | ⚡ **MITIGATO** — scoring v4 deterministico su impegno economico (vedi §2) |
| 3 | **Premio** (Prize) | C'è possibilità di ottenere beni di valore | ✓ Presente — oggetto fisico di valore |

**Se TUTTI e tre i criteri sono soddisfatti → gioco d'azzardo (licenza ADM).** La strategia AIROOBI interviene strutturalmente sul **Criterio 1** (acquisto di asset reale con valore garantito, non biglietto) e sul **Criterio 2** (scoring deterministico su merito di partecipazione, non sorteggio).

---

## 2. Perché AIROOBI NON è Gioco d'Azzardo

### 2.1 Criterio 1 — Consideration: Acquisto di Asset, Non Biglietto

**DIFFERENZA STRUTTURALE:** AIROOBI non vende "chance di vincere". L'utente spende ARIA per acquistare **blocchi**, ognuno dei quali genera un **ROBI** (NFT-certificato di resa) con valore Treasury-backed riscuotibile al 95% in KAS.

| Elemento | Lotteria / Riffa | AIROOBI |
|---|---|---|
| Cosa si paga | Biglietto senza valore intrinseco | ARIA → 1 blocco = 1 ROBI (NFT con valore Treasury-backed) |
| Cosa si riceve | Solo chance di vincere. Zero se non vinci | **ROBI sempre** + possibilità di ottenere l'oggetto |
| Natura del pagamento | Pay-per-play puro | Acquisto di asset digitale con utility reale |
| Rischio perdita | 100% — ogni giocata è persa se non si vince | **0% perdita secca** — ROBI mantiene valore ≥95% PEG |
| Selezione vincitore | Sorteggio casuale | **Scoring v4 deterministico** su ARIA impegnata in categoria |

> Il ROBI ha un valore economico autonomo, trasparente e verificabile on-chain. È analogo a un buono fruttifero, non a un gratta e vinci.

### 2.2 Criterio 2 — Alea: Riduzione Strutturale del Rischio

Il meccanismo AIROOBI riduce drasticamente l'elemento aleatorio:

- **Scoring v4 deterministico** (dal 19 Apr 2026): vince chi ha impegnato più ARIA nella categoria dal giorno dell'iscrizione. La logica è trasparente e verificabile, non un sorteggio (vedi `AIROOBI_Airdrop_Engine_v2.md` §4).
- **No sorteggio a caso**: non esiste "numero estratto". Il ranking è calcolato da una funzione pubblica (`calculate_winner_score`).
- **Fairness Guard** (19 Apr 2026): se matematicamente impossibile arrivare 1°, il sistema **blocca** sia l'acquisto manuale sia l'auto-buy → evita spesa inutile, elemento tipico del gambling.
- **One Category Rule**: dopo una vittoria in una categoria, l'ARIA pre-win in quella categoria si azzera → evita la dominanza cumulativa.
- **PEG al 95%**: ogni ROBI garantisce ≥95% del suo valore in KAS → elimina il "rischio perdita totale" centrale nel gambling.

### 2.3 Analogie Legali Favorevoli

AIROOBI si posiziona vicino a:
- **Acquisto quote in fondi comuni** — asset con rendimento garantito + possibilità di extra-rendimento
- **Crowdfunding con reward** — contribuzione + asset + eventuale premio fisico
- **Buoni fruttiferi postali** — capitale protetto + rendimento maturato nel tempo

AIROOBI **non è assimilabile a**: slot machine, roulette, scommesse, lotterie — nessuna perdita totale è possibile, nessun risultato è generato casualmente.

### 2.4 Ancoraggio Comportamentale

**Framing UI tassativo** (regole interne — vedi `AIROOBI_Brand_Guidelines_v3.md`):

- **ZERO gergo gambling:** mai "vinci", "perdi", "lotteria", "gioco d'azzardo", "investimento", "scommetti"
- **Framing utente:** "Realizza il tuo desiderio" — partecipi per ottenere l'oggetto a un prezzo ridicolo
- **Framing venditore:** "Vendi il tuo oggetto di valore (min €500)" — incasso garantito a prezzo di mercato
- **ROBI = buono fruttifero:** valore garantito nel tempo, non "premio vinto"

Queste regole sono **compliance linguistica** — non solo marketing — perché parte del test ADM guarda anche al come il servizio viene presentato agli utenti.

---

## 3. Stato Operativo Attuale (Alpha 0)

| Aspetto | Stato |
|---|---|
| Fase | **Alpha 0 APERTO** dal 11 Mar 2026 (reset ulteriori 28 Mar 2026 e 20 Apr 2026) |
| Accesso | **Invitation-only** (primi 1.000 utenti Alpha Brave) |
| Asset in uso | ARIA in **testnet** (faucet 100/gg, welcome 1.000 ARIA). Zero controvalore EUR mostrato in UI |
| Oggetti fisici | ❌ **Nessun airdrop di oggetti fisici reali ancora eseguito** — testing flow |
| KYC | ❌ Non ancora applicato (da attivare in Stage 1 con primo airdrop reale) |
| Pagamenti reali | ❌ Nessun pagamento reale richiesto (solo fase testnet) |
| Smart contract Kaspa | ❌ Non ancora deployato (da Stage 2 Beta) |

> Nell'attuale fase Alpha 0 **non ci sono transazioni economiche reali** tra utenti e piattaforma. La distinzione gambling/non-gambling diventa materialmente rilevante in Stage 1+ quando verranno eseguiti airdrop con oggetti fisici reali.

---

## 4. Struttura Legale Raccomandata

| Area | Azione richiesta | Priority | Timeline |
|---|---|---|---|
| Forma societaria | S.r.l. o S.p.A. italiana o holding EU (Malta / Estonia) | Alta | Pre-Stage 1 |
| Parere legale gambling | Studio specializzato in gaming law italiano + EU | **CRITICA** | Immediata |
| Terms & Conditions | T&C che esplicitano natura NFT, non-gambling, PEG mechanism, scoring v4 | Alta | Pre-Stage 1 |
| Privacy / GDPR | DPO designato, privacy policy compliant, KYC data retention | Alta | Pre-Stage 1 |
| KYC / AML | Procedura KYC per tutti gli utenti, soglie AML monitorate | Alta | **Obbligatoria** per primo airdrop reale |
| Tax compliance | Regime fiscale NFT + cripto-attività (DL cripto 2023) | Media | Pre-mainnet |
| IP Protection | Trademark "AIROOBI" + logo in IT / EU / US | Media | M1 |
| Charity DAO | Struttura legale per Charity Treasury (1% di ogni airdrop) | Media | Stage 2 |

---

## 5. KYC — Identity Verification

Il KYC (Know Your Customer) sarà obbligatorio per tutti gli utenti AIROOBI **prima di poter acquistare blocchi con valore reale** (dal primo airdrop Stage 1). Serve a tre scopi: compliance AML, fairness (un utente = una identità), protezione piattaforma.

**In Alpha 0 il KYC è sospeso** perché ARIA è in testnet e non ci sono pagamenti reali.

### Livelli KYC pianificati (da Stage 1)

| Livello | Requisiti | Limite operativo | Provider target |
|---|---|---|---|
| **KYC Base** | Email verificata, numero telefono | €50/mese in acquisti equivalenti | Interno |
| **KYC Standard** | Documento identità + selfie | €500/mese | Onfido / Veriff / Jumio |
| **KYC Enhanced** | Documento + prova indirizzo + video call | Illimitato | Provider tier-1 |

---

## 6. GDPR & Privacy

### 6.1 Dati raccolti

| Categoria | Dati | Base legale | Retention |
|---|---|---|---|
| Account | email, password hash, referral_code | Contratto | Durata account + 10 anni |
| Profilo | nome, avatar, display_name | Consenso | Durata account + revoca |
| Wallet | total_points (ARIA), ROBI rewards | Contratto | Durata account + 10 anni |
| Attività | events, checkins, airdrop_participations | Interesse legittimo | 3 anni |
| KYC | documento identità, selfie, prova indirizzo | Obbligo legale (AML) | 10 anni (legge) |
| Marketing | push_subscriptions, user_preferences | Consenso | Durata consenso |

### 6.2 Diritti utente

- **Accesso** e **rettifica**: via area profilo (live) o richiesta a `privacy@airoobi.com`
- **Cancellazione**: RPC `delete_account` (soft delete `deleted_at`) + anonimizzazione KYC dopo retention legale
- **Portabilità**: export JSON dei dati profilo + ledger ARIA + nft_rewards
- **Opposizione al trattamento**: sospensione marketing tramite user_preferences

### 6.3 Storage

- **Supabase (Frankfurt, EU)**: hosting DB, asset static bucket `submissions` (foto oggetti valutazione)
- **Cloudflare (EU POP)**: proxy CDN + analytics (IP anonimizzato)
- **Vercel (EU region)**: hosting statico + edge functions
- **Postmark (US)**: email transazionali — richiede Standard Contractual Clauses (in attesa approvazione)

---

## 7. Anti-Gambling — Conformità Continua

Oltre alla struttura NFT, AIROOBI implementa controlli **tecnologici** pensati specificamente per distinguersi dal gambling:

### 7.1 Scoring v4 (19 Apr 2026)

**Motivazione founder:** *"Soddisfare il prima possibile gli utenti che hanno impegnato più ARIA nella categoria, per evitare che per un oggetto da €500 tu ne abbia già spesi più di €500 in quella categoria. Altrimenti saremmo peggio del gioco d'azzardo."*

Formula:
```
score = ARIA_storico_categoria_post_last_win + ARIA_airdrop_corrente
```

### 7.2 Fairness Guard

Prima di ogni acquisto, il sistema calcola:
```
my_max_reachable = my_score + (remaining_blocks × block_price)
if my_max_reachable < leader_score → BLOCCA
```

→ L'utente non può **mai** spendere ARIA su un airdrop dove è matematicamente impossibile arrivare 1°. Questo è il contrario dello gambling (dove si può sempre spendere di più senza certezza).

### 7.3 One Category Rule

Dopo una vittoria in una categoria, l'ARIA pre-win si azzera per future partecipazioni. L'utente non può dominare ripetutamente la stessa categoria.

### 7.4 No auto-spesa cieca

L'Auto-Buy (`auto_buy_rules`) è soggetto alla stessa Fairness Guard del buy manuale. Un'utente che imposta auto-buy non può "perdere" ARIA su airdrop impossibili.

---

## 8. Opinion d'autore interna

Sulla base dell'analisi §1–2:

> AIROOBI, nella sua struttura attuale post-earnings v2 e scoring v4, **si distingue dal gioco d'azzardo** grazie a: (a) asset reale (ROBI, PEG 95%), (b) scoring deterministico su merito, (c) Fairness Guard che impedisce spesa irrazionale, (d) framing comunicativo non-gambling tassativo. La posizione rimane comunque **da consolidare con parere legale specialistico** prima del primo airdrop reale.

---

## 9. Pendenti Pre-Stage 1

1. **Parere legale formale** di studio gaming law IT/EU
2. **Redazione T&C** che esplicitino: natura NFT, PEG Treasury, scoring v4, Fairness Guard, One Category Rule
3. **Attivazione KYC** almeno livello Base per primo airdrop reale
4. **Costituzione società** (S.r.l. IT o equivalente EU)
5. **Privacy Policy consolidata** con tutti i processori (Supabase, Cloudflare, Vercel, Postmark, provider KYC)
6. **Procedura AML** — soglie monitorate, SOS interno
7. **Trademark** "AIROOBI" e logo in IT/EU

---

## 10. Riferimenti cross-doc

- `AIROOBI_Foundations_v3.md` (v3.5) — Vision, mission, stato stage
- `AIROOBI_Tokenomics_v3.md` (v3.5) — Economia, ARIA/ROBI, earnings v2, Treasury
- `AIROOBI_Airdrop_Engine_v2.md` (v2.5) — Scoring v4, Fairness Guard, draw algorithm
- `AIROOBI_Brand_Guidelines_v3.md` (v3.1) — Framing linguistico tassativo
- `AIROOBI_Sitemap_v2.md` (v2.5) — Struttura DB, RPC, `user_roles`, RLS
- Pagina EDU pubblica: `come-funziona-airdrop.html` — fonte di verità utente

---

**Archivio:** versione precedente in `business/old/AIROOBI_Legal_v1.1_FINAL.docx` (20 Feb 2026, pre-ARIA, pre-scoring v4).
