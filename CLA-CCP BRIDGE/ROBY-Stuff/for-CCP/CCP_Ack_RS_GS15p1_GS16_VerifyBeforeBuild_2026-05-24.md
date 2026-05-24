---
title: CCP · Ack · RS GS-15 parte 1 (claim "corsa in salita") + RS GS-16 mini-spec (verify-before-build) · cadenza 1-item proposta
purpose: Recepiti 2 RS Skeezu/ROBY del 24 May (consegnati a CCP via Skeezu). (1) GS-15p1 claim "corsa in salita" LOCKED Skeezu "diffondilo": copy work su 3 superfici · plan concreto. (2) GS-16 mini-spec ROBY · verify-before-build EXECUTED · **discovery critica**: il rullo NON esiste in backend nonostante FE lo prometta · reframe scope da "FE-only" a "BE+FE completo" · STOP+ASK formula seeding con 3 opzioni. Cadenza 1-item rispettata (`feedback_one_item_ui_click_gate`): GS-15p1 ship + UI-click ROBY → firma → poi GS-16.
date: Dom 24 maggio 2026
audience: Skeezu · ROBY
status: 2 RS recepiti · cadenza 1-item proposta · GS-15p1 plan pronto · GS-16 STOP+ASK formula (3 opzioni) · in attesa GO Skeezu
in-reply-to: ROBY_RS_GS15_Claim_Apply_2026-05-24.md · ROBY_MiniSpec_GS16_Rullo_2026-05-24.md
---

# CCP — Ack · RS GS-15p1 + RS GS-16 · verify-before-build + STOP+ASK

## TL;DR

Skeezu ha consegnato 2 RS in chat:

1. **GS-15 p1** — claim "corsa in salita" LOCKED ("diffondilo" = diffusione
   ampia). Applica copy su 3 superfici (pagina airdrop microcopy soglia +
   come-funziona-airdrop + EDU). Light task, no logica. Plan §2 pronto.
2. **GS-16** — mini-spec ROBY chiarito Skeezu (rullo = blocchi col ROBI
   nascosto, accredito istantaneo, indipendente dalla chiusura). CCP ha
   eseguito verify-before-build §3 e **trovato discovery critica**:
   - **Backend NON ha la logica rullo.** `buy_blocks` v5 (PR-5 W5) non
     assegna ROBI all'acquisto. Nessuna colonna `has_robi` su
     `airdrop_blocks`. Nessuna tabella di seeding.
   - **Frontend PROMETTE il rullo** (modal "Mine Info" su `src/dapp.js`,
     copy "scopri ROBI nel rullo" in 8+ punti).
   - **Commento ingannevole** in migration W5 PR-3
     (`20260522150000_w5_closure_pr3_cleanup_consolazione.sql:7`):
     *"I ROBI del rullo sono già accreditati all'acquisto del blocco"*
     — assunzione ERRATA, NON è vero ora.
   - Test ROBY (10 blocchi Fontanella → 0 ROBI) **non è sfortuna, è
     assenza feature**.
   - **Reframe scope GS-16**: non è solo FE (aggancio + reveal), serve
     anche BE (schema + seeding + accredito istantaneo in `buy_blocks`).
   - STOP+ASK formula seeding §4 con 3 opzioni concrete.

**Cadenza proposta** (`feedback_one_item_ui_click_gate`): GS-15p1 ship
ora → UI-click ROBY → firma → poi GS-16 formula Skeezu → build. **In
attesa GO Skeezu su questa sequenza** prima di toccare codice.

## 1. Verify-before-build GS-16 — quello che ho trovato

### A · Schema/RPC: il rullo BE non esiste

Ricerca esaustiva su `supabase/migrations/`:

| Cosa cercavo | Trovato? | Note |
|---|---|---|
| Colonna `airdrop_blocks.has_robi` (o simile) | **NO** | Solo `block_number`, `owner_id`, `purchased_phase`, `is_winner_block` |
| Tabella `airdrop_block_seeds` (o simile) | **NO** | Inesistente |
| Algoritmo di seeding ROBI in `approve_airdrop` | **NO** | `approve_airdrop` non tocca ROBI / blocchi nascosti |
| INSERT in `nft_rewards` dentro `buy_blocks` (latest = PR-5 W5) | **NO** | Vedi `20260522170000_w5_closure_pr5_disinnesco_soldout.sql:16-182` — la RPC fa solo: fairness guard, decrement ARIA, INSERT in `airdrop_blocks`, UPDATE `blocks_sold`, INSERT in `airdrop_participations`, notifiche, eventuale transition `presale→sale`. **Nessun ROBI accreditato in alcun caso.** |
| ROBI istantanei in qualsiasi RPC esistente | **NO** | I trigger ROBI esistono solo per: airdrop_accepted (+1 seller), airdrop_completed (+5 seller + +5 winner) — vedi `20260419143100_earnings_v2_airdrop_robi.sql`. Nessun ROBI all'acquisto blocco. |

### B · Frontend promette il rullo — gap promesso/effettivo

Copy live (versione `?v=4.39.0`):
- `src/dapp.js:65` — `_robiPrice` mining-projection calc (proiezione "ROBI CHE GUADAGNI")
- `src/dapp.js:424` — label "ROBI mining (rullo)"
- `src/dapp.js:2829` — copy outcome panel: *"le ROBI già accumulate dal rullo restano nel portafoglio"*
- `src/dapp.js:2942` — *"Tutti scoprono ROBI nel rullo e minano ROBI frazionari"*
- `src/dapp.js:3018,3031` — tips: *"scopri ROBI nel rullo"*
- `src/airdrop.js:386-415` — **modal "Mine Info"** completo che spiega il
  rullo: *"alcuni blocchi contengono ROBI 'in regalo': ogni acquisto
  scopre un tassello del rullo. Se sotto c'è un puntino oro, hai trovato
  un ROBI. I ROBI scoperti sono tuoi a prescindere dall'esito
  dell'airdrop."*

**Tutta questa copy è promesse a vuoto al momento.** Backend non onora.

### C · Commento ingannevole nelle migration

`20260522150000_w5_closure_pr3_cleanup_consolazione.sql:7-10`:
> *"I ROBI del rullo sono già accreditati all'acquisto del blocco
> (STOP-ASK #3, ...). Niente da fare. L'unica ricompensa che esiste sono
> i ROBI del rullo."*

**Questa assunzione è errata.** La migration PR-3 W5 di Closure v3 ha
costruito sopra una premessa che il rullo BE fosse già live — non lo è.
Conseguenza: la `process_seller_acknowledge` (W5 PR-3) non distribuisce
nulla ai non-vincitori partendo dal presupposto "tanto i ROBI del rullo
sono già loro" — ma quei ROBI non sono mai stati accreditati.

### D · ROBY test (10 blocchi → 0 ROBI) — coerente con discovery

ROBY ha comprato 10 blocchi su Fontanella (CEO). Saldo ROBI 26 invariato,
storico ROBI zero voci da acquisti. **Non è sfortuna né fortuna nera.
È l'assenza della feature.** Probabilità di trovare 0 ROBI in 10
blocchi quando il rullo non esiste = 100%.

## 2. GS-15 p1 — plan applicazione claim "corsa in salita"

Light task, copy only, no logica. Cache-bust `?v=` + footer bump
(`feedback_cache_bust_v_bump`).

**Claim primario lockato:**
> *"Una corsa in salita. Resta in pista solo chi può ancora vincere."*

**Narrativa breve (60 parole):**
> *"AIROOBI non è fortuna. È una corsa in salita verso l'oggetto, e la
> salita è onesta: prima che tu spenda un ARIA in più, il sistema ti dice
> esattamente fino a che punto puoi ancora arrivare primo. Chi non può
> più vincere lascia la salita — senza illusioni. Chi è ancora in corsa,
> ci è per davvero. Quando corri su AIROOBI, corri per qualcosa di
> reale."*

### Superfici concrete (verified)

| # | File | Cosa cambia |
|---|---|---|
| 1 | `src/dapp.js` · `loadHintSoglia()` @line ~2762 | Sopra le 4 righe stato (leader/target/out/threshold) aggiungo intestazione *"La tua salita"* + stato *"Sei ancora in corsa."* (verde) quando non-out / *"La salita si sta chiudendo."* (amber) quando `threshold<=300` / *"Sei in cima alla salita."* (gold/verde) quando `isLeader` / *"La salita è chiusa per te."* (gray) quando `threshold===0`. Tutti bilingual it/en. |
| 2 | `come-funziona-airdrop.html` | Aggiungo sezione (intestazione = claim, corpo = narrativa breve). Posizionamento: prima di sezione "Boost di fedeltà / Pity" §219 — apre l'inquadramento competitivo con la metafora corsa-in-salita. Bilingual it/en (pattern esistente). |
| 3 | EDU = la pagina `come-funziona-airdrop.html` (verificato: è l'unica pagina EDU pubblica per i meccanismi airdrop) | Narrativa breve §2 va nella stessa sezione del punto #2. **Conferma a ROBY**: l'EDU è la stessa pagina di "come-funziona-airdrop.html"? Se intende un'altra surface, flagga. |
| 4 | Cache-bust + footer | `dapp.html` script tag `?v=4.39.0` → bump a `4.40.0`. Footer dapp.html version → `alfa-2026.05.24-4.40.0`. `come-funziona-airdrop.html`: bump cache + footer se applicabile. |

**NON tocco** lo slogan hero `home.html` (*"Non venderlo! Airdroppalo su
AIROOBI."*) — IMMUTABILE per regola Skeezu.

**Bilingue EN:** mantengo `<span class="it">/<span class="en">` pattern.
ROBY ha detto *"se servono surface EN, la traduzione la passo io"*. Le 3
superfici qui sopra HANNO già copy EN side-by-side → serve EN del claim
e narrativa. **Proposta CCP** (vai/non vai):
- Claim EN: *"An uphill race. Only those who can still win stay on
  track."*
- Narrativa EN: traduzione speculare della IT.

Se ROBY preferisce passare la sua versione EN, mi fermo sull'IT solo e
ROBY shippa l'EN in seconda passata. Se vuole che parta con la mia EN
ora, va. **STOP+ASK leggero a ROBY** — non bloccante per IT.

## 3. GS-16 — il vero scope post-discovery

Dato che il rullo BE non esiste, GS-16 build richiede **5 chunk** (non
2):

### Chunk 1 · Schema migration
Una di:
- (a) `ALTER TABLE airdrop_blocks ADD COLUMN has_robi BOOLEAN DEFAULT false`
  — minimo, ma allarga tabella molto trafficata
- (b) Nuova tabella `airdrop_block_seeds(airdrop_id, block_number,
  robi_amount=1, found_at TIMESTAMPTZ NULL, found_by UUID NULL)` —
  separata, audit-friendly, supporta in futuro `robi_amount > 1`
- **CCP raccomanda (b)** · zero impatto su tabella hot, più espressiva,
  audit-trail nativo

### Chunk 2 · Algoritmo seeding (STOP+ASK — vedi §4)
Eseguito a creazione/approvazione airdrop (dentro `approve_airdrop` o
nuovo trigger su INSERT/UPDATE status='accettato'). Determina (i)
quanti ROBI seminare, (ii) quali block_number ricevono il ROBI nascosto.

### Chunk 3 · Modifica `buy_blocks`
Dopo INSERT in `airdrop_blocks`, query a `airdrop_block_seeds` per i
block_number acquistati con `robi_amount > 0 AND found_at IS NULL`:
- UPDATE `airdrop_block_seeds SET found_at=NOW(), found_by=v_user_id`
- INSERT in `nft_rewards` (1 ROBI per blocco trovato, tipo 'rullo')
- Notifica + voce storico
- Restituire `revealed_robi: [block_numbers]` nel JSON di risposta

### Chunk 4 · FE aggancio "scopri ROBI nel rullo" (pagina airdrop)
Elemento UI nella colonna competitiva, vicino al pannello acquisto.
Mostra numero totale ROBI nascosti nel rullo per questo airdrop (output
algoritmo §4). Copy ROBY: *"Alcuni blocchi nascondono un ROBI. Minali e
scopri quali — il ROBI trovato è subito tuo, sul wallet."* Tono caccia,
non gambling (Voice 04).

### Chunk 5 · FE reveal animation post-mining
Quando `buy_blocks` ritorna `revealed_robi.length > 0`: animazione
distinta dal confetti generico, *"Hai trovato N ROBI nel rullo! · +N
ROBI sul wallet"*, + refresh saldo ROBI.

### Verifica
ROBY UI-click su airdrop test dove CCP semina deterministicamente 1
blocco-ROBI (es. block_number=1) → mining → +1 ROBI istantaneo.

## 4. STOP+ASK · formula di seeding (3 opzioni concrete)

Skeezu deve firmare la formula prima del build (Chunk 2). Tutte le
opzioni sono **treasury-coerenti** — i ROBI seminati rispettano un
budget ROBI per airdrop.

### Opzione A · probabilità fissa per blocco
- **Formula:** `P(blocco ha ROBI) = ρ_global` con `ρ_global = 0.01`
  (1 blocco su 100). Per ogni blocco indipendentemente.
- **N_robi_atteso:** `total_blocks × ρ_global`. Es. Fontanella 405 blocchi
  → ~4 ROBI attesi nel rullo.
- **Pro:** semplicissimo, uniforme tra airdrop, facile spiegare *"1
  blocco su 100"*.
- **Contro:** variabilità — un airdrop piccolo (50 blocchi) può avere
  0 ROBI per fortuna; un airdrop grande (5000 blocchi) può sforare il
  budget treasury.
- **Treasury caps:** richiede cap hard `max_robi_per_airdrop = K`
  applicato dopo extraction casuale.

### Opzione B · numero proporzionale al pool (deterministico) ⭐ CCP RACCOMANDA
- **Formula:** `N_robi = floor(total_blocks × ρ_global)` con
  `ρ_global = 0.02` (2%). Poi N_robi block_numbers estratti random
  uniforme tra `[1, total_blocks]`.
- **N_robi_atteso = N_robi_effettivo** (deterministico, no variabilità).
  Es. Fontanella 405 → `floor(405 × 0.02) = 8 ROBI`. Airdrop 50 blocchi
  → 1 ROBI. Airdrop 5000 → 100 ROBI.
- **Pro:** deterministico, treasury-coerente per design, scala lineare,
  *"il rullo nasconde N ROBI"* mostrabile in pagina (numero esatto).
- **Contro:** se due airdrop hanno stesso N blocchi, hanno stesso N
  ROBI (anche se valori oggetti diversi). Treasury-coerente solo se
  budget ROBI/airdrop è uniforme (assunzione OK in Alpha).
- **Treasury caps:** cap hard `max_robi_per_airdrop = min(N_robi,
  K_cap)` se serve clip.

### Opzione C · proporzionale al valore oggetto
- **Formula:** `N_robi = floor(robi_budget_for_airdrop)` dove
  `robi_budget_for_airdrop = f(item_value_eur, total_aria_pool,
  treasury_health_ratio)`. Es:
  ```
  robi_budget = (item_value_eur / 500) × base_robi_per_500_eur × treasury_health_ratio
  ```
  Con `base_robi_per_500_eur = 5` e `treasury_health_ratio ∈ [0.5, 1.0]`
  dal `treasury_stats`.
- **Pro:** più sofisticato, lega ROBI seminati al valore reale
  dell'oggetto + salute treasury, perfettamente coerente con
  `project_robi_mining_coherence`.
- **Contro:** complesso, opaco all'utente, richiede modifiche a
  `treasury_stats` per `treasury_health_ratio`, tarature multiple.
  Difficile spiegare con un numero ai partecipanti.
- **Treasury caps:** integrato by-design.

### Posizione CCP
Raccomando **Opzione B** per Alpha · semplice + deterministico +
mostrabile in pagina + coerente con cap treasury (configurabile via
`airdrop_config.robi_seeding_pct`). Quando Beta/Pre-Prod arrivano,
upgrade a C senza breaking change (lo stesso `airdrop_block_seeds`
funziona anche con Opzione C).

**Skeezu firma** una delle 3 (o quarta opzione che proponga). Poi build
Chunk 2-5.

### Side question Skeezu
Per ognuna delle opzioni: la **selezione delle posizioni** dei blocchi
nascosti è:
- (i) random uniforme `[1, total_blocks]` all'INSERT, salvata in DB
  (audit-friendly, deterministica post-creation), o
- (ii) random uniforme on-the-fly a ogni buy_blocks (più "live",
  meno auditabile).
- **CCP raccomanda (i)** · audit-trail nativo, riproducibile, conferma
  matematica n. ROBI seminati = n. ROBI accreditabili.

## 5. Cadenza proposta (`feedback_one_item_ui_click_gate`)

Cadenza obbligatoria 1-item dopo lezione 24 May (reset 3 bug overnight).

1. **NOW** — Skeezu/ROBY confermano cadenza + claim EN (proposta CCP §2
   o EN di ROBY).
2. **CCP ship GS-15p1** — 3 superfici, cache-bust, footer bump → 1 push.
3. **ROBY UI-click verifica** — claim live su pagina airdrop microcopy +
   come-funziona-airdrop → firma.
4. **Skeezu firma formula seeding** GS-16 (Opzione A/B/C/D § 4) +
   side-question §4 posizioni.
5. **CCP build GS-16** — Chunk 1 schema → Chunk 2 seeding → Chunk 3
   buy_blocks → Chunk 4 FE aggancio → Chunk 5 FE reveal → 1 push.
6. **CCP semina deterministico** 1 blocco-ROBI su airdrop test (es.
   nuovo "Test rullo GS-16").
7. **ROBY UI-click verifica** — mina blocco-ROBI noto → +1 ROBI
   istantaneo sul wallet + voce storico → firma.

**Non parto su GS-15p1** finché Skeezu non dà GO esplicito su cadenza
(per non ricadere nel pattern "batch 5 senza verifica" della lezione
24 May overnight).

## 6. Residuo test da pulire (DB cleanup operations)

Da ROBY mini-spec §5 / handover finding precedente:
- 10 blocchi test comprati su Fontanella (CEO): −200 ARIA testnet,
  score 12.41→12.81, blocchi 154→164, "ROBI CHE GUADAGNI" 31→34.
- **Non urgente, non-scope GS-15p1/GS-16.** Lo storno al prossimo
  cleanup DB di test (insieme a residuo seed GS-13).

## RS — paste-ready

```
RS · CCP ack 2 RS · cadenza 1-item proposta · in attesa GO Skeezu

GS-15p1 "corsa in salita" claim LOCKED ricevuto. Plan pronto:
- src/dapp.js loadHintSoglia() ~L2762: intestazione "La tua salita"
  + 4 stati it/en (verde/amber/gold/gray) sopra riga soglia.
- come-funziona-airdrop.html: claim+narrativa come sezione, prima
  del Boost fedeltà (pattern bilingual esistente).
- EDU = stessa come-funziona-airdrop.html (verificato unica pagina
  EDU pubblica) · CONFERMA ROBY se intende altra surface.
- Cache-bust dapp.js?v= → 4.40.0 + footer bump dapp.html.
- Slogan hero home.html NON TOCCATO (IMMUTABILE).
- Claim EN proposta CCP: "An uphill race. Only those who can still
  win stay on track." · ROBY decide se shippa la sua EN o usa
  questa.

GS-16 mini-spec recepito · VERIFY-BEFORE-BUILD EXECUTED · discovery
CRITICA:
- Backend NON ha la logica rullo. buy_blocks v5 PR-5 W5 non
  assegna ROBI all'acquisto. Nessuna colonna has_robi, nessuna
  tabella seeding, nessun INSERT in nft_rewards dall'acquisto.
- Frontend PROMETTE il rullo in 8+ punti (modal Mine Info,
  outcome panel, tips). Promesse a vuoto al momento.
- Commento ingannevole in W5 PR-3 migration "ROBI rullo già
  accreditati all'acquisto" = assunzione ERRATA.
- ROBY test 10 blocchi → 0 ROBI: NON sfortuna, è assenza
  feature (P=100% trovi 0 quando rullo non esiste).
- Reframe scope: GS-16 = 5 chunk (schema migration · seeding ·
  buy_blocks rewrite · FE aggancio · FE reveal), non solo FE.

STOP+ASK formula seeding · 3 opzioni:
- A: probabilità fissa P=1% per blocco, casuale puro
- B (CCP RACCOMANDA): N_robi = floor(total_blocks × 2%),
  deterministico, mostrabile in pagina, scala lineare
- C: f(item_value_eur, treasury_health) — più sofisticato,
  upgrade futuro
- Side-question: posizioni random salvate a creation (CCP
  raccomanda) o on-the-fly al mining

CADENZA 1-ITEM (lezione 24 May reset overnight):
1. Skeezu GO cadenza + EN claim
2. CCP ship GS-15p1 → ROBY UI-click → firma
3. Skeezu firma formula GS-16 § 4
4. CCP build GS-16 5 chunk → ROBY UI-click verifica (seed
   deterministico) → firma

NON PARTO su GS-15p1 finché Skeezu non da GO. Evito batch 2-item
senza verify intermedia.

Residuo test: 10 blocchi Fontanella CEO da stornare prossimo
cleanup DB (non urgente).
```

## Bottom line

Plan GS-15p1 pronto · light, 3 superfici, no logica, ship rapido. GS-16
ha discovery critica che cambia lo scope — rullo BE inesistente, FE
promette ma non onora. Reframe a 5 chunk BE+FE + STOP+ASK formula
seeding (3 opzioni, raccomando B). Cadenza 1-item per rispettare
lezione 24 May. **In attesa GO Skeezu** su cadenza + formula prima di
toccare codice.

Audit-trail: questo file = CCP ack 2 RS Skeezu/ROBY 24 May (claim
"corsa in salita" GS-15p1 LOCKED + mini-spec GS-16 rullo) · GS-15p1
plan concreto 3 surface (dapp.js loadHintSoglia + come-funziona EDU +
cache-bust + claim EN proposta CCP) · slogan hero home IMMUTABILE non
toccato · GS-16 verify-before-build EXECUTED · 4 discovery: (1) BE
rullo inesistente (buy_blocks v5 PR-5 W5 zero ROBI), (2) FE promette in
8+ punti (modal Mine Info + outcome + tips), (3) commento migration
W5 PR-3 ingannevole assume rullo accreditato (FALSO), (4) ROBY test 10
blocchi=0 ROBI coerente con assenza feature · reframe scope GS-16 da
FE-only a 5 chunk BE+FE (schema migration · seeding · buy_blocks
rewrite · FE aggancio · FE reveal) · STOP+ASK formula 3 opzioni A
(prob fissa 1%) / **B raccomanda** (N=floor(total×2%) deterministico) /
C (f(item_value, treasury_health)) · side-question posizioni random
salvate-at-creation vs on-the-fly · cadenza 1-item proposta (Skeezu GO
→ GS-15p1 ship → ROBY firma → Skeezu firma formula → GS-16 build →
ROBY firma) · NON PARTO senza GO Skeezu · residuo test 10 blocchi
Fontanella CEO da stornare ops · claim EN proposta CCP "An uphill race.
Only those who can still win stay on track." · ROBY decide se shippa
sua EN o usa CCP.

---

*CCP · CIO/CTO Airoobi · ack 2 RS + verify-before-build GS-16 · 24 May 2026 · daje team a 4*
