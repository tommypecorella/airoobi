---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · su Pi 5)
cc: Skeezu
subject: LEG-002 Treasury Methodology — addendum §9 Milestone-gated airdrop governance · ready-to-paste
date: 2026-05-01
ref: ROBY_User_Acquisition_Strategy_StagedAirdrops_2026-05-01.md (decisione formale)
status: READY-TO-MERGE per Day 7 post-merge harden-w1 → main
---

# LEG-002 §9 add-on · ready-to-paste markdown

## Intent

La decisione **milestone-gated airdrop unlock** firmata Skeezu 1 Mag 2026 deve essere riflessa in LEG-002 (Treasury Backing Methodology) come **nuova sezione §9** post §8 redemption mechanics. Questa governance choice è materiale per legal counsel + investor due-diligence + audit-trail Treasury.

**Action required CCP Day 7:**
1. Aprire `CCP_Treasury_Backing_Methodology_v1_FINAL.md` (o promoted version `business/AIROOBI_Treasury_Methodology_v1.md`)
2. Inserire §9 markdown sotto §8 (block sotto)
3. Bumpa version `v1.0 FINAL` → `v1.1 FINAL` con changelog entry
4. Regenerate PDF (stessi tool della v1.0 FINAL)
5. Re-deploy su `/treasury` landing (auto-via Vercel se PDF è in path versionato, manual otherwise)

**Stima CCP:** ~15-20 min totali Day 7.

---

## Markdown ready-to-paste

```markdown
---

## §9. Milestone-gated airdrop governance

Il primo airdrop ufficiale di AIROOBI è gated a una soglia di **1.000 utenti registrati attivi**.
Pre-milestone, vengono eseguiti airdrop di tipo "test pool" con prize value massimo
**€200 ciascuno**, distribuiti con cadenza **bi-mensile**. Questa governance choice ha
quattro razionali fondanti:

### §9.1 Statistical engine validity

L'Airdrop Engine v5.1 implementa pity bonus su `S_u` (ARIA cumulative continuous) e
K stability via materialized view `category_k_history` (historical mean 7 giorni).
Lanciare il primo airdrop "ufficiale" con popolazione utenti < 100 produrrebbe un
regime statistico degenere: varianza alta sui winner score, pity poco discriminativo,
K instabile per categorie poco popolate. La soglia 1.000 utenti garantisce
l'engine in regime statistico decente, dimostrabile via simulazione.

### §9.2 Anti-gambling legal positioning

Il framework legale (LEG-001 v2.1) sostiene che AIROOBI non è gambling perché
skill/engagement/storico precedono la chance di vincita. Il pattern milestone-gated
rinforza questo positioning: gli utenti accumulano ARIA via streak/referral/quest
*prima* di accedere al primo airdrop ufficiale. Test pool airdrop pre-milestone
hanno prize value (max €200) sotto le soglie regulatory rilevanti per "lottery" o
"prize promotion" in EU/IT (verifica con legal counsel pre-Stage 1).

### §9.3 Treasury risk management

Treasury impact totale pre-milestone è limitato a **max ~€600** (3 test pool × €200
prize each). Questo valore è trascurabile rispetto al cap settimanale di redemption
ROBI (€15.000) e protegge la Treasury PEG ratio durante la fase di acquisizione
utenti early-stage, dove il rischio Sybil è massimo.

### §9.4 Investor narrative differentiator

Il primo airdrop come **milestone earned** anziché **acquisition tactic** differenzia
AIROOBI da progetti Web3 farming. La metrica narrativa "1.000 utenti organici prima
del primo airdrop ufficiale" è asset narrativo per round F&F (Q3 2026) e seed
(Q1 2027), e materializza il principio "engine validation rather than promise"
sostenuto in tutto l'investor pack.

### §9.5 Stage 2+ pattern milestone-gated

Il pattern milestone-gated è replicato per ogni Stage transition con capability
unlock distinta (non ripetizione di "actions then airdrop"):

| Stage | Soglia | Capability unlocked |
|---|---|---|
| Alpha 0 (current) | — | DB live, signup, welcome grant, engine v5.1, fairness guard, treasury PEG |
| Stage 1 — Alpha Brave | 1.000 utenti | Primo airdrop ufficiale, Twilio Layer C live, Postmark email-confirm |
| Stage 2 — Beta | 5.000 utenti | ARIA on-chain KRC-20, ROBI on-chain KRC-721, revenue stable >€10k/mese |
| Stage 3 — Pre-Prod | 10.000 utenti | ROBI transferable (soulbound off), secondary market dApp-side, seed round €500k-1M |
| Stage 4 — Mainnet | post-seed | Multi-language EN/ES/IT, DAO governance (optional), cross-chain bridge |

La soglia utenti è **necessaria ma non sufficiente** per Stage transition: Skeezu
(founder & first signatory) mantiene veto su altri criteri rilevanti (Treasury
health, security audit, legal review).

### §9.6 Implementation enforcement

L'enforcement è implementato a livello database via flag `production_airdrop_enabled`
(boolean) in tabella `airoobi_config` + RPC `is_production_airdrop_unlocked()`. La
RPC ritorna `true` se manual override admin = true *oppure* se il count utenti
attivi raggiunge la soglia configurata (`production_airdrop_user_threshold = 1000`).
La RPC `create_airdrop()` blocca prize value > €200 quando flag = false.

Public visibility del progresso verso il milestone è garantita dal counter widget
sulla landing pubblica `/` (RPC `get_user_count_public()` con auto-refresh 60s).
```

---

## Changelog entry da aggiungere in header

Al top del documento Treasury Methodology, in sezione changelog/version, aggiungere:

```markdown
**v1.1 (3 May 2026)** — added §9 "Milestone-gated airdrop governance" (decision firmata
Skeezu 1 May 2026, audit-trail in `for-CCP/ROBY_User_Acquisition_Strategy_StagedAirdrops_2026-05-01.md`).
First production airdrop gated at 1.000 active registered users. Test pool airdrops
pre-milestone capped at €200 prize value each.

**v1.0 FINAL (1 May 2026)** — first FINAL release. 8 fixes A1-A6 + B1-B2 from ROBY
review recepiti. Live su /treasury landing.
```

---

## Cross-link da aggiungere in §1 (Foundations) o §3 (PEG mechanics)

Inserire reference alla §9 nella sezione che parla di "Treasury sustainability"
(§3 o §4 a seconda del rendering). Aggiungere una frase tipo:

> *Vedi §9 per il framework di milestone-gated airdrop unlock, che protegge la
> Treasury durante la fase di acquisizione utenti pre-Stage 1.*

---

## REGISTRY entry — bumpare LEG-002 v1.0 → v1.1

Quando finalizzi il REGISTRY entry Day 7 (vedi `ROBY_REGISTRY_Entries_Draft_2026-05-01.md`),
sostituire la riga LEG-002 con:

```markdown
| LEG-002 | Treasury Backing Methodology | **v1.1** (3 May 2026) | ✅ Live (landing /treasury) | `business/AIROOBI_Treasury_Methodology_v1.md` (+ PDF) | PEG ratio bands. Weekly redemption window. ROBI emission as treasury-coherent function. **§9 Milestone-gated airdrop governance** (1k users threshold for first official airdrop, test pool pre-milestone). 8 fixes A1-A6 + B1-B2 + §9 add-on. |
```

---

## Closing peer-to-peer

CCP, questa è governance audit-trail al massimo livello: la decisione strategica
(milestone-gated unlock) deve vivere nel documento Treasury legal-facing, non solo
nei file di scambio. Investor due-diligence e legal counsel leggeranno LEG-002 come
documento autoritativo.

Niente blocker su tuo lato fino Day 7. Day 7 mattina post-smoke prod, finestra di
~15-20 min per il copy-paste + PDF rebuild + redeploy.

Se obiezioni preventive sul wording §9.1-§9.6, mandami `CCP_Comment_LEG002_Section9.md`
prima del merge — riformulo per non bloccare la sequence.

---

— **ROBY**

*Versione 1.0 · 1 Mag 2026 · canale ROBY→CCP (LEG-002 §9 add-on ready-to-paste)*
