# for-CCP · manifest di lettura

> **Audience:** CCP (Claude Code · CIO/CTO · Raspberry Pi 5).
> **Cosa contiene:** tutto e solo quello che CCP deve leggere per essere allineato con ROBY e Skeezu.
> **Workflow operativo:** Skeezu fa `git add ROBY-Stuff/for-CCP/` + push. CCP legge da repo. Niente Telegram, niente costi extra.
> **Last sync:** 27 Aprile 2026.

---

## Reading order — priorità decrescente

Quando CCP riceve un nuovo push, legge i file in questo ordine. Le priorità sono:

- **P0 = leggi prima di tutto** (sblocca la giornata)
- **P1 = leggi entro 4h** (necessario per Sprint W1)
- **P2 = reference, leggi quando serve**

| # | Priority | File | Cosa è | Azione attesa |
|---|---|---|---|---|
| 1 | **P0** | `ROBY_Decision_Request_ROBI_Policy_2026-04-27.md` | Decision request a Skeezu — ROBI soulbound vs trasferibili. Sblocca Hole #5 sprint W1. | Attendere `decision robi <A\|B\|C>` da Skeezu via SSH. Default fallback: A. |
| 2 | **P0** | `ROBY_Tech_Note_ROBI_Mining_Coherence_2026-04-27.md` | Nota tecnica: la Treasury Backing Methodology v1 deve dichiarare esplicitamente la coerenza ROBI mining ↔ treasury (formula auto-balancing). 5 acceptance criteria. | Includere sezione "ROBI Emission as Treasury-Coherent Function" nella Methodology v1 in scrittura. |
| 3 | **P0** | `ROBY_Reply_to_CCP_W1_2026-04-27.md` | Risposta integrale ai 5 punti aperti del CCP_Reply originale. 20 task azionabili in tabella finale. | Eseguire come da tabella sintesi azionabile (sezione finale). Hole #2 + Hole #1 + Counter + Quick Win #4 partono in parallelo Day 1-2. |
| 4 | P1 | `AIROOBI_Engine_Hardening_Sprint_W1.pdf` | Spec eseguibile completo dei 6 buchi math/security. **Source of truth è il MD nel repo principale** (`01_deliverables_docs/tech/AIROOBI_Engine_Hardening_Sprint_W1.md`); questo PDF è copia di lettura per founder. | Reference durante implementation. Le SQL migration + RPC vanno scritte come da §1-§7. |
| 5 | P1 | `CCP_Reply_W1_Materials_2026-04-27.md` | File originale di CCP — ack ai materiali ROBY W1, 5 punti aperti. ROBY ha già risposto (#3 sopra). | Reference per memoria del thread. |
| 6 | P2 | `AIROOBI_Brand_Kit_One_Pager.pdf` | Brand kit one-pager (palette, font, voice, do/don't tassativi). Copia da `brand-and-community/`. | Quick Win #1 (Day 5 slack time): brand consistency check su `dapp.html`, `home.html`, `airdrop.html`. Cercare violazioni palette (BLACK/GOLD/WHITE + ARIA/KAS solo per asset). |
| 7 | **P0** | `ROBY_Treasury_Caps_Proposal_2026-04-27.md` | Proposta numerica 6 caps Hole #6 (daily, per-user, min block age, processing hours, health min ratio, bridge financing). Set RACCOMANDATO/CAUTO/AGGRESSIVO + custom. | Skeezu firma via SSH (`decision treasury_caps A\|B\|C\|custom`). CCP committi migration `20260427130000_treasury_caps.sql` solo POST sign-off. Deadline Day 4 EOD (29 Apr). |
| 8 | **P0** | `ROBY_Day1_Code_Review_2026-04-27.md` | Code review Day 1 (4 migration + edge fn signup-guard + diff process-auto-buy + diventa-alpha-brave). APPROVED with revisions: 2 HIGH (di cui 1 falso allarme), 3 MEDIUM (2 chiusi Day 2), 3 LOW. | A2 + B2 chiusi Day 2 ✅. Pre-merge final: B1 (One Cat Rule) come dipendenza Hole #3. Convention nuova: integration test obbligatorio per ogni PR su `harden-w1`. |
| 9 | **P0** | `ROBY_Treasury_Methodology_Review_2026-04-27.md` | Review framing investor del Treasury Backing Methodology DRAFT: 6 must-fix + 2 nice-to-have. APPROVED with revisions per LEG-002 post v1 FINAL. | CCP recepisce fix A1-A6 (e opzionali B1-B2) + re-emette `CCP_Treasury_Backing_Methodology_v1_FINAL.md`. |
| 10 | P1 | `CCP_Treasury_Backing_Methodology_v1_DRAFT.md` | Bozza Methodology v1 con tutti 5 acceptance criteria del Tech Note + bonus §7 anti-gambling positioning. | Recepire fix della review (#9 sopra) → emettere FINAL. |
| 11 | P1 | `CCP_Day1_Artefatti_Per_ROBY_2026-04-27.md` | Diff stat Day 1 + 4 migration SQL integrali + signup-guard + process-auto-buy diff + diventa-alpha-brave diff. | Reference per memoria thread. ROBY ha già fatto review (#8). |
| 12 | P1 | `CCP_Sprint_W1_Status_2026-04-27.md` | Status mid-sprint Day 1: scenario A confermato, branch `harden-w1@191f29f`, 4 hole done + 2 deliverable, 5 blocker dichiarati, 4 unblock pending. | Reference. ROBY ha già processato e risposto via Treasury Caps Proposal + altri RS. |
| 13 | P1 | `CCP_Telegram_Bot_Welcome_Flow_2026-04-27.md` | Quick Win #4 consegnato: welcome IT/EN, 5 FAQ canned, JSON flow per BotFather/n8n. | ROBY usa il flow per setup `@AirooobiIT` lunedì M1·W1. |
| 14 | P2 | `CCP_DB_Migration_Review_2026-04-27.md` | Report CCP del migration repair su DB live (13 pre-applied + 4 Day 1 con timestamp riallineati). | Reference. ROBY trova rassicurazione che DB è clean. |

---

## Pattern di comunicazione — il comando `RS`

**`RS` = "ROBY SAYS"**. Quando Skeezu via SSH scrive `RS <messaggio>` (o semplicemente `RS` da solo dopo un push), CCP esegue tre passi:

1. Rilegge l'intero contenuto di `ROBY-Stuff/for-CCP/` ordinato per priorità (P0 → P1 → P2 secondo questa stessa pagina).
2. Identifica nuovi file `ROBY_*.md` o aggiornamenti rispetto alla scansione precedente (controllo via `git log --since` o stat modification time).
3. Procede secondo l'azione attesa di ognuno (vedi tabella reading order sopra), oppure attende decisione esplicita Skeezu se il file richiede sign-off (es. Decision Request).

Quando CCP completa un task, scrive un `CCP_*.md` di chiusura nella stessa cartella + Skeezu farà push nel commit successivo. Il loop si chiude quando ROBY rilegge.

**Pattern speculare:** se in futuro ROBY introdurrà un comando equivalente per CCP, sarà `CS` (=CCP SAYS). Per ora basta `RS`.

---

## Convenzioni di scambio

### Dove CCP scrive le sue risposte

CCP risponde scrivendo file con prefisso `CCP_*` direttamente in questa cartella `for-CCP/`. Skeezu fa push, ROBY li legge tramite Cowork.

Esempi attesi nei prossimi giorni:

- `CCP_Sprint_Day3_Status_2026-04-29.md` (status checkpoint Day 3 sprint W1)
- `CCP_Treasury_Backing_Methodology_v1_DRAFT.md` (per review ROBY Day 4)
- `CCP_Sprint_W1_Closing_Report_2026-05-03.md` (chiusura sprint con merge harden-w1 → main)

### Read-only mutuale

ROBY non modifica i file `CCP_*`. CCP non modifica i file `ROBY_*`. Se CCP trova un errore in un file ROBY, scrive un nuovo file `CCP_Comment_*` puntando al riferimento. ROBY revisiona e pubblica nuova versione (`ROBY_*_v1_1.md`).

### Versioning

- `v1.0` prima release.
- `v1.1, v1.2` per fix tipografici / aggiornamenti minori.
- `v2.0+` per cambi sostanziali (es. Hardening Sprint W2 sarà `AIROOBI_Engine_Hardening_Sprint_W2.md`, nuovo file).

### Date in nome file

I file di scambio puntuale (decision request, reply, status) portano la data ISO nel nome (`*_2026-04-27.md`). I file evergreen / reference (brief sprint, brand kit) no.

---

## Quick reference — comandi attesi via SSH

Pattern di interazione tra Skeezu e CCP via SSH al Pi 5 (PowerShell desktop):

```
status                          → riepilogo progressi sprint corrente
plan hole <n>                   → CCP genera plan + diff per hole specifico
implement hole <n>              → CCP scrive migration + RPC + diff
review hole <n>                 → CCP mostra diff dei file modificati
test harden_w1                  → CCP esegue Playwright suite sprint W1
commit harden W1 hole <n>       → CCP commit feature-branch + push (post approvazione)
decision robi <A|B|C>           → Skeezu firma policy ROBI (sblocca Hole #5)
```

Tutti i `commit` rimangono in branch feature (`harden-w1/*`) e fondono su `harden-w1` solo dopo review. Merge su `main` solo dopo accettazione completa di tutti e 6 i fix dello sprint.

---

## Cosa CCP NON trova qui (e dove cercarlo)

Per evitare confusione: questi file **non sono in `for-CCP/`** perché non servono a CCP. Vivono altrove:

| Asset | Dove sta | Quando serve a CCP |
|---|---|---|
| Pitch Deck Q2-2026 | `ROBY-Stuff/investor-pack/` | Solo se Skeezu chiede a CCP di lavorare su slide editing — caso eccezionale |
| Technical Companion (per investor) | `ROBY-Stuff/investor-pack/` | Reference se serve cross-check del framing pubblico vs implementation |
| Investor Map & Exit Strategy | `ROBY-Stuff/investor-pack/` | Mai — è territorio ROBY |
| Piano Comunicazione 90gg | `ROBY-Stuff/comms-pack/` | Solo per coordinare Quick Win #4 (Telegram bot) — content cadence |
| Editorial Calendar 90gg | `ROBY-Stuff/comms-pack/` | Mai — è territorio ROBY |
| Alpha Brave Landing HTML | `ROBY-Stuff/brand-and-community/` | Quando deploya il counter Supabase — Hole reply Q4 |
| Brand Kit (master) | `ROBY-Stuff/brand-and-community/` | Quick Win #1 (qui ne ha già copia in `for-CCP/`) |

Se CCP ha bisogno di uno di questi e non lo trova, scrive `CCP_Request_<asset>.md` in `for-CCP/` e ROBY pusha la copia aggiornata.

---

## Closing

Il pattern è: ROBY produce qui, Skeezu fa push, CCP legge, CCP risponde qui, Skeezu fa push, ROBY rilegge. Niente messaggi sparsi, niente dubbi su cosa è la versione corrente. Convergenza per design.

— **ROBY**, 27 Apr 2026
