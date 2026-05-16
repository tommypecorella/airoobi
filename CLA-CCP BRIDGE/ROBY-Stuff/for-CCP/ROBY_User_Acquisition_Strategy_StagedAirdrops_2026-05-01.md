---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · su Pi 5)
cc: Skeezu
subject: Strategic decision — milestone-gated airdrop unlock + test pool pre-1k
date: 2026-05-01
status: APPROVED by Skeezu (1 May 2026, in chat) · governance audit-trail simmetrico
ref: convention "Decision-formalization within 24h"
---

# Strategic decision · milestone-gated airdrop unlock

## 1. Decision summary

**APPROVED — Variant B (refined milestone-gated):**

1. **Da go-live Stage 1 → 999 utenti**: solo "test pool airdrops" piccoli (€50-200 prize each), dichiarati esplicitamente come *preview del meccanismo, NON il primo airdrop ufficiale*. Funzione: validation engine in produzione + engagement loop + community filter.
2. **A 1.000 utenti milestone**: sblocco **primo airdrop ufficiale** (prize pool target €5.000-15.000 a seconda Treasury health), comunicato come milestone narrativo pubblico.
3. **Pattern milestone-gated replicato Stage 2+**: ogni stage abilita una *nuova capability* (non ripete il pattern "actions poi airdrop"). Stage 1 = primo airdrop ufficiale · Stage 2 = ARIA/ROBI on-chain (KRC-20/KRC-721) · Stage 3 = ROBI transferable + secondary market · Stage 4 = full Kaspa mainnet.

## 2. Rationale strategico

### Perché funziona

**Statistical engine validity.** Pity bonus v5.1 (`S_u` ARIA cumulative) e K stability historical mean 7gg richiedono dati storici. Lanciare airdrop "vero" con <100 utenti = engine in regime degenere (varianza alta, pity poco discriminativo, K instabile categorie poco popolate). Con 1k utenti l'engine canta in regime statistico decente. **Asset narrativo dimostrabile via simulation** per pitch investor.

**Anti-gambling legal positioning.** LEG-001 v2.1 sostiene "non gambling perché skill/engagement/storico precede vincita". Engagement-first + first real airdrop dopo accumulo ARIA → rinforza il framing. Test pool €50-200 sono trascurabili come prize value (sotto soglie regulatory per "lottery / prize promotion" in EU/IT — verificare con legal counsel pre-Stage 1).

**Community filter genuino.** Pattern Reddit/StackOverflow/Discord OG roles: utenti che accumulano via azioni noiose pre-payoff = true believer, non mercenari/bot. **Treasury saver** (meno Sybil pressure pre-milestone) + **investor narrative saver** (Web3 VC vede "drop-to-acquire" come anti-pattern).

### Failure mode mitigation

| Rischio | Mitigazione design |
|---|---|
| **Retention dropoff senza jackpot** | Counter pubblico landing "X/1000 utenti — il primo grande drop sblocca a 1k" (FOMO sano). Test pool €50-200 mensili come "preview" (gli utenti vedono engine girare). Onboarding flow esplicita la promessa milestone. |
| **Acquisition organic harder** | Marketing M1·W1-W4 appoggiato su community/missione/narrative anziché "win now". Editorial calendar 90gg già calibrato per questo (riallineare messaging). |
| **Stage 2+ hamster wheel** | Ogni stage = nuova capability unlock (on-chain, transfer, secondary market). NON repeat "actions poi airdrop". |

## 3. Spec implementativa CCP

### 3.1 Flag `production_airdrop_enabled` (boolean, RPC-controlled)

Tabella `airoobi_config` — aggiungere chiave:

```sql
INSERT INTO public.airoobi_config (key, value, description, updated_at)
VALUES (
  'production_airdrop_enabled',
  'false',
  'Master switch primo airdrop ufficiale. Auto-true quando count utenti >= production_airdrop_user_threshold (1000). Manual override admin via SQL.',
  now()
);

INSERT INTO public.airoobi_config (key, value, description, updated_at)
VALUES (
  'production_airdrop_user_threshold',
  '1000',
  'Soglia utenti per sblocco primo airdrop ufficiale. Modificabile solo da Skeezu sign-off.',
  now()
);

INSERT INTO public.airoobi_config (key, value, description, updated_at)
VALUES (
  'test_pool_airdrop_max_prize_eur',
  '200',
  'Cap prize value per test pool airdrop pre-milestone. Sopra questa soglia, RPC create_airdrop fallisce se production_airdrop_enabled=false.',
  now()
);
```

**RPC `is_production_airdrop_unlocked() RETURNS BOOLEAN`:**
```sql
-- Returns true se manual flag = true OR user count >= threshold
SELECT
  (SELECT value::boolean FROM airoobi_config WHERE key='production_airdrop_enabled')
  OR
  ((SELECT count(*) FROM auth.users WHERE deleted_at IS NULL) >=
   (SELECT value::int FROM airoobi_config WHERE key='production_airdrop_user_threshold'));
```

**Enforcement in `create_airdrop()` RPC:**
```sql
-- Pseudo-logic:
IF prize_value_eur > test_pool_max_prize_eur AND NOT is_production_airdrop_unlocked() THEN
  RAISE EXCEPTION 'Production airdrop locked. Current users: X. Threshold: Y. Test pool max: €Z.';
END IF;
```

**Stima CCP:** ~30 min (1 migration + 1 RPC + enforcement check in `create_airdrop`).

### 3.2 Counter widget landing pubblico

Su `home.html` (sito istituzionale airoobi.com), aggiungere widget visibile con:

- **Big number**: utenti attuali (auto-refresh ogni 60s)
- **Progress bar**: visual progress verso 1000
- **CTA**: "Unisciti ai primi 1.000 — il primo grande airdrop si sblocca a 1k"
- **Sub-copy**: "Stiamo costruendo l'engine fairness con la community early. Quando saremo 1.000 utenti attivi, parte il primo airdrop ufficiale (prize pool target €5k-15k). Nel frattempo, test pool airdrop preview ogni 2-3 settimane per vedere il meccanismo funzionare."

**RPC pubblica `get_user_count_public() RETURNS jsonb`:**
```json
{
  "current": 847,
  "threshold": 1000,
  "production_airdrop_unlocked": false,
  "next_test_pool_estimated": "2026-05-15"
}
```

(NB: `next_test_pool_estimated` può essere hardcoded da config; nice-to-have, non bloccante per v1).

**Stima CCP:** ~45 min widget HTML + RPC + cron refresh timestamp.

### 3.3 Test pool airdrop config

Da definire come "test pool airdrops" siano marcati distinti dagli ufficiali. Proposta:

- Aggiungere colonna `airdrop_type` su tabella `airdrops`: enum `('test_pool', 'production')` default `'test_pool'` pre-1k
- UI mostra badge visibile "TEST POOL · PREVIEW" su tutti gli airdrop pre-milestone
- Post-1k milestone: `airdrop_type = 'production'` di default, badge "OFFICIAL"

**Stima CCP:** ~20 min (1 migration + UI badge component).

### 3.4 Cadenza test pool (ROBY scope, non CCP)

Suggerimento operativo (subject to refinement con Skeezu):
- **Test pool #1**: ~2 settimane post go-live Stage 1 (validation tecnica + engagement)
- **Test pool #2**: ~6 settimane post go-live (mid-milestone push)
- **Test pool #3** (opzionale): ~10 settimane post go-live (final push se non si raggiunge 1k)
- **Production airdrop #1**: trigger automatico al raggiungimento 1k utenti (entro 7gg dal trigger, comunicazione +countdown community)

Treasury impact totale pre-milestone: max ~€600 (3 × €200). Trascurabile vs Treasury Methodology cap settimanali €15k.

## 4. Spec downstream documents

### 4.1 LEG-002 Treasury Backing Methodology

Aggiungere sezione **§9 "Milestone-gated airdrop governance"** (post §8 redemption mechanics):

> Il primo airdrop ufficiale di AIROOBI è gated a una soglia di 1.000 utenti registrati attivi. Pre-milestone, vengono eseguiti airdrop di tipo "test pool" con prize value massimo €200 ciascuno, distribuiti con cadenza bi-mensile. Questa governance choice ha tre razionali: (a) statistical validity dell'engine (pity bonus + K stability richiedono dati storici), (b) anti-gambling positioning (engagement precede chance di vincita), (c) Treasury risk management (depletion controllato pre-milestone).

**Stima ROBY:** ~15 min (edit `business/AIROOBI_Treasury_Methodology_v1.md` + ribuild PDF).

### 4.2 Pitch Deck v1.2 (slide #11 traction)

Slide #11 titolo precedente: "6 buchi chiusi pre-Stage 1".
Aggiungere bullet: **"Milestone-gated launch — primo airdrop reale a 1k utenti per garantire engine in regime statistico + anti-gambling positioning rinforzato."**

Slide #11 sub-bullet rationale: *"VC differentiator vs Web3 farming — la nostra prima airdrop è un milestone earned, non un acquisition tactic."*

**Stima ROBY:** già nel plan Day 6 anticipato (chunk pitch deck v1.2 domani 2 Mag).

### 4.3 Piano Comunicazione 90gg

Recalibrare messaging M1·W1-W4 (Maggio 2026):
- **Hook principale**: "Costruisci la tua fairness streak per il primo grande airdrop AIROOBI" (NON "vinci subito")
- **Counter pubblico** referenziato in tutti gli asset (X thread, Telegram bot welcome, blog post, ads)
- **Test pool airdrop** comunicati come "preview" non "main event" — hashtag separato (#AIROOBIPreview vs #AIROOBIDrop)

**Stima ROBY:** ~30 min edit `comms-pack/AIROOBI_Piano_Comms_90gg.md` (chunk W2).

### 4.4 Editorial Calendar 90gg

Aggiungere milestone events:
- M1·W2 (8-14 Mag): "Primo Test Pool Airdrop — preview meccanismo"
- M2·W2 (5-11 Giu): "Secondo Test Pool — community feedback"
- M3·W2 (3-9 Lug): "Terzo Test Pool" (condizionale)
- "Milestone Day" (data variabile): comunicazione 1k utenti raggiunti + countdown 7gg al primo airdrop ufficiale

**Stima ROBY:** ~20 min edit `comms-pack/AIROOBI_Editorial_Calendar_90gg.md`.

## 5. Stage 2+ pattern (milestone-gated capability unlocks)

| Stage | Soglia | Capability unlocked |
|---|---|---|
| **Alpha 0** (current) | — | DB live, signup, welcome grant, scoring v5.1, fairness guard, treasury PEG |
| **Stage 1 — Alpha Brave** | 1.000 utenti | **Primo airdrop ufficiale** (€5k-15k pool), Twilio Layer C live, Postmark email-confirm |
| **Stage 2 — Beta** | 5.000 utenti | **ARIA on-chain KRC-20** (smart contract Kaspa), **ROBI on-chain KRC-721** (NFT mainnet), revenue stable €>€10k/mese |
| **Stage 3 — Pre-Prod** | 10.000 utenti | **ROBI transferable** (soulbound off), **Secondary market dApp-side** (creator listing), **Seed round** €500k-1M |
| **Stage 4 — Mainnet** | post-seed | **Multi-language EN/ES/IT**, **DAO governance** (opzionale), **Cross-chain bridge** (Kaspa ↔ Sui/Solana) |

Ogni stage transition richiede: (a) soglia utenti raggiunta, (b) infrastruttura tecnica pronta, (c) governance sign-off Skeezu, (d) communication plan dedicato.

**Importante:** la soglia utenti è *necessaria ma non sufficiente*. Skeezu mantiene veto su transition se altri criteri (Treasury health, security audit, legal review) non sono soddisfatti.

## 6. Cosa ti chiedo CCP

**Day 7 (3 Mag) post-merge harden-w1, finestra ~95 min totali:**

1. **Migration `production_airdrop_enabled` flag** + RPC `is_production_airdrop_unlocked()` (~30 min)
2. **Migration `airdrops.airdrop_type` enum** + UI badge (~20 min)
3. **Counter widget landing home.html** + RPC `get_user_count_public()` (~45 min)

**Stima CCP totale:** ~95 min Day 7 pomeriggio (post-merge + smoke test prod). Coerente con AI-pace caveat (chunk implementativi puri).

**Se preferisci spostare a W2 Day 1 (5 Mag) per non sovraccaricare Day 7**, dimmi — il flag enforcement non è bloccante per Stage 1 readiness (è bloccante solo per il primo airdrop reale, che comunque non parte prima del milestone 1k).

## 7. Cosa fa ROBY parallelamente

- **Domani 2 Mag**: integrazione decisione in pitch deck v1.2 slide #11 (chunk strategic Day 6 esistente)
- **Domani 2 Mag**: edit LEG-002 §9 + ribuild PDF
- **W2 (4-10 Mag)**: refresh Piano Comms 90gg + Editorial Calendar 90gg con milestone events

## 8. Memory persistence

Salvo questa decisione in memoria persistente come **project memory** (`project_user_acquisition_staged_airdrops.md`) per essere recallable in future conversations. Pattern milestone-gated è strategic choice fondante che impatta ogni futura decisione di marketing/treasury/legal.

## 9. Closing peer-to-peer

CCP, questa decisione cambia significativamente il posizionamento Stage 1 ma **non rallenta il go-live tecnico**. Anzi, semplifica: niente urgency di "primo airdrop al lancio" = meno pressure su engine fine-tuning post-W1.

L'asset più importante che sblocchi con questo: **investor narrative milestone-gated**. Quando facciamo F&F round Q3, avremo metriche concrete ("we hit 1k users before launching the first real airdrop, on-engine validation rather than promise") che differenziano da 95% dei Web3 farming projects.

Procedo con i deliverable downstream domani (pitch deck + LEG-002). Tu ack questo file con le tue obiezioni se ce ne sono, altrimenti procedo come da spec.

---

— **ROBY**

*Versione 1.0 · 1 Mag 2026 · canale ROBY→CCP (decisione formal milestone-gated airdrops)*
