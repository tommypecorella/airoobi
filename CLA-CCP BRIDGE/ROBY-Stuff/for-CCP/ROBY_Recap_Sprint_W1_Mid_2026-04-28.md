---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: Skeezu (founder), CCP (Claude Code · CIO/CTO · per cross-check con suo recap analogo)
subject: Recap personale ROBY mid-sprint W1 — stato, decisioni, lessons, roadmap, gap onesti
date: 2026-04-28 (mattina, pre Day 3 checkpoint)
purpose: cross-check di allineamento con CCP — ognuno racconta dal suo punto di vista, poi confrontiamo per scovare drift
---

# ROBY · Recap mid-sprint W1

Skeezu, te lo do tutto in un colpo. È peer-recap, non report formale: quello che vedo io, quello che ho fatto io, quello che mi preoccupa, e dove penso vada il prossimo round. Quando arriva il recap analogo di CCP, lo incrociamo punto per punto.

---

## 1. Stato AIROOBI in due numeri

| Metrica | Valore | Note |
|---|---|---|
| Utenti registrati live | **7** (ipotetico, baseline pre-Alpha Brave) | Counter live ora wired su `diventa-alpha-brave.html` (option A) |
| Sprint W1 progress | **15/22 task done** (68%) | Day 2 chiusura, target Day 7 = 3 Mag |
| Branch produttivo attuale | `harden-w1` su origin (non ancora mergiato) | Merge a main solo a 6/6 hole accepted |
| Confidence chiusura W1 entro 3 Mag | >85% (per dichiarazione CCP) | Tutti i pending sono input-bound, zero blocker tecnici |

---

## 2. Deliverable consegnati da ROBY (in `ROBY-Stuff/`)

In due giorni di lavoro io ho consegnato 14 file di delivery + 8 file di scambio CCP↔ROBY. Riepilogo per audience:

### Investor pack (3 deliverable + asset)
- `AIROOBI_Pitch_Deck_Q2-2026.pptx + .pdf` v1.1 (15 slide, slide #13 team aggiornata CCP CIO/CTO)
- `AIROOBI_Airdrop_Engine_Fairness_Technical_Companion.docx + .pdf` v1.0
- `AIROOBI_Investor_Map_Exit_Strategy.docx + .pdf` v1.1

### Comms pack
- `AIROOBI_Piano_Comunicazione_90gg.docx + .pdf` v1.1 (post-naming sweep)
- `AIROOBI_Editorial_Calendar_90gg.xlsx` v1.1 (6 fogli operativi)

### Brand & community
- `AIROOBI_Brand_Kit_One_Pager.html + .pdf` v1.0 (v1.1 con functional palette estesa pendente Day 7+)
- `AIROOBI_Alpha_Brave_Landing.html` v1.0 (deployata da CCP come `/diventa-alpha-brave.html` con counter live)

### Engineering briefs (anche nel repo)
- `AIROOBI_Engine_Hardening_Sprint_W1.md` (in `01_deliverables_docs/tech/`) + PDF in `for-CCP/`

### Files di scambio CCP↔ROBY (in `for-CCP/`)
8 file totali tra mie reply, decision request, tech note, code review, treasury caps proposal, methodology review.

**Totale parole pubblicate da ROBY in 2gg:** stima ~25.000 parole + ~2.500 righe SQL/HTML di brand kit + landing.

---

## 3. Lavoro tecnico CCP — cosa ho visto chiudersi

| Hole / Task | Status | Mio riconoscimento |
|---|---|---|
| Hole #2 — Server-side fairness guard | ✅ done | Tre fix di rigore difensivo: wrapper `_for` SECURITY DEFINER, fallback `GREATEST(COALESCE..., 100)`, pattern non-blocking on edge cases |
| Hole #1 Layer A (rate limit IP/device) | ✅ done | Tabella `signup_attempts` + 2 RPC + RLS `USING(false)` + 5 thresholds in config |
| Hole #1 Layer B (Cloudflare Turnstile) | ✅ done | Edge function `signup-guard` 182 righe + integration `signup.html` |
| Hole #1 Layer C (phone-KYC scaffold) | ✅ scaffold done (BYPASS=true) | Pre-anticipato, sblocca solo da flip env var quando Twilio arrivano. Buon judgement call |
| Hole #1 Layer D (welcome scaling 1k) | ✅ done | Combined con A2 fix (welcome → claim_welcome_grant RPC) — condensazione elegante |
| Hole #4 — K stability rolling 4w | ✅ done | Materialized view + cron Sunday + audit log >20% shift + bug critico recovered (v_category_id NULL) |
| Hole #5 — ROBI policy decision A | ✅ done | Soulbound Alpha+Beta, transferable from Pre-Prod. Migration + 2 RPC pulite |
| Counter Alpha Brave option A | ✅ done | Wire Supabase con count(profiles) trasparente, refresh 60s, format italiano |
| QW#2 OG meta | ✅ done | 12/15 pagine complete + skip giustificato `abo` (noindex) |
| QW#3 sitemap + robots | ✅ done | sitemap-com +4 URL + robots.txt creato dual-domain |
| QW#4 Telegram bot welcome flow | ✅ delivered | IT/EN + 5 FAQ canned + JSON BotFather/n8n |
| QW#1 brand consistency | ✅ done (post mio verdict) | Functional palette extended (3 red token + 1 green-success) + 2 fix banali |
| Treasury Backing Methodology v1 DRAFT | ✅ delivered | 11 sezioni, tutti 5 acceptance criteria del Tech Note |
| 0 bug nuovi Day 2 | ✅ | 17/17 mini integration test verdi (convention nuova post-bug Day 1) |

**Numeri cumulativi Day 1+Day 2 (per dichiarazione CCP):** 7 migration · 3 edge functions · 10 RPC · 2 tabelle · 1 matview · 2 cron.

---

## 4. Decisioni prese & decisioni pending

### Decisioni prese
- **ROBI policy: Decision A** (soulbound Alpha+Beta, trasferibili da Pre-Prod sotto condizioni). Skeezu ha firmato, CCP ha implementato.
- **Counter Alpha Brave: Option A** (count(profiles) trasparente da 7, niente offset).
- **Naming team: ROBY + Skeezu + CCP** (rimosso ARIA come dev agent dai doc, sweep retrofittato su tutti i deliverable).
- **Pattern di scambio: comando `RS` (=ROBY SAYS)** + file `*_*.md` in `ROBY-Stuff/for-CCP/`. Niente Telegram dev (no costi extra Claude Max).
- **Struttura ROBY-Stuff**: 4 sub-folder per audience (`investor-pack/`, `comms-pack/`, `brand-and-community/`, `for-CCP/`). 1 comando push per CCP.
- **Convention post-bug Day 1**: ogni PR su `harden-w1` deve includere mini integration test (anche solo 3 righe SELECT).
- **Pity calibration**: si passa da L_u (count airdrop) a S_u (ARIA cumulative). Nessun reset dati richiesto, è puro algorithm fix.

### Decisioni pending (Skeezu)
- **`decision treasury_caps A|B|C|custom`** — per Hole #6. Deadline Day 4 EOD (29 Apr), default fallback A se non firmi.
- **Setup secrets esterni**: Twilio Verify (~15 min) + Cloudflare Turnstile production (~5 min) + `SIGNUP_SALT` random 32-byte (~30 secondi).
- **Aggiornamento env Vercel** post-secrets (5 secret totali).

### Decisioni pending (CCP)
- Recepire i 6 must-fix della mia review Methodology DRAFT → produrre `CCP_Treasury_Backing_Methodology_v1_FINAL.md`.
- Eseguire Hole #3 pity v5.1 (post Day 3 checkpoint).
- Eseguire Hole #6 (post sign-off Skeezu Treasury Caps).

### Decisioni pending (ROBY, mie)
- Aggiornamento `AIROOBI_Brand_Kit_One_Pager.html` v1.0 → v1.1 con sezione **Functional palette** (3 red token + 1 green-success). Tempo: 30 min, programmato post Day 7.
- Update slide #5 pitch deck con formula pity v5.1 post merge Hole #3 (pre-pitching investor).
- Aggiornamento technical companion §10 da "open" a "closed" post merge harden-w1.
- Aggiornamento `REGISTRY.md` con `TECH-HARDEN-001` + `LEG-002` (Treasury Methodology v1 quando FINAL).

---

## 5. Lessons learned dello sprint W1 (per memoria persistente)

Sono cinque, in ordine di impact:

1. **Il bug `v_category_id NULL` per 24h** ha lasciato la fairness guard server-side **inefficace** dal commit `191f29f` al fix nel `6fbe46c`. CCP lo ha catturato ricorrendo durante l'implementazione di Hole #4. **Lezione:** ogni PR su `harden-w1` deve includere un mini integration test (es. 3 righe SELECT con expected output non-NULL). **Convention adottata e applicata** (17/17 verdi Day 2).

2. **Falsi positivi nella mia code review Day 1** — A1 (anon key hardcoded) e B3 (current_phase config missing) erano sbagliati. Ho fatto code review sul markdown citato in `CCP_Day1_Artefatti`, non sul file LIVE. **Lezione:** nei prossimi review chiederò esplicitamente dump dal DB live (via `\df+` o `\sf`) come ground-truth, non il markdown di accompagnamento. **Memorizzato.**

3. **Spec mia con 4 errori puntuali** (process_auto_buys è edge function non RPC, my_category_score_snapshot uses auth.uid(), get_category_k referenced ma non esiste, position keyword reserved). CCP ha gestito tutti con difensiva positiva. **Lezione:** la mia spec engineering brief Sprint W1 va rivista con `git ls-files` + `grep` del codebase reale prima del prossimo sprint. Eventualmente CCP fa pre-survey.

4. **Tempi reali sono migliori delle stime mie.** Spec Sprint W1 stimava 5-7 giorni. Day 1+Day 2 = già 4 hole done + counter + 3 quick win + brand sweep (cumulato ~50% sprint). Realtà: 75-80% sprint chiuso in 2 giorni di lavoro CCP. **Lezione:** le mie stime erano pessimistiche, ma anche perché l'autonomia parallela di CCP è alta (parallel-track funziona molto meglio del sequential).

5. **Falsi allarmi vs catch reali ratio**. Su 2 HIGH della code review, 1 era falso allarme (50%). Su 3 MEDIUM, 1 era falso allarme (33%). Su 3 LOW, 0 falsi allarmi. **Lezione:** più "high" il flag, più rischio di assumption errate. Devo essere più conservativa nel marcare HIGH e fare verifica fresca prima di etichettare bloccante.

---

## 6. Roadmap prossimi passi (Day 3 → Day 7+)

### Day 3 (29 Apr — domani)
- 18:00 — CCP produce `CCP_Sprint_W1_Day3_Status_2026-04-29.md`
- 19:30 — ROBY risponde con `ROBY_Sprint_W1_Day3_Reply_2026-04-29.md` che sblocca:
  - Esecuzione Hole #3 pity v5.1 (con eventuale richiesta audit RPC `compare_score_v5_vs_v5_1` per safety pre-cutover)
  - Sign-off Hole #6 (assumendo Skeezu firma `decision treasury_caps` entro Day 4 EOD)

### Day 4-5 (30 Apr - 1 Mag)
- CCP esegue Hole #3 + Hole #6
- CCP produce `CCP_Treasury_Backing_Methodology_v1_FINAL.md` (recepire 6 must-fix)
- ROBY rivede Methodology FINAL (12h target window)
- Skeezu firma Methodology FINAL → CCP promuove a `01_deliverables_docs/business/AIROOBI_Treasury_Backing_Methodology_v1.md`

### Day 6 (2 Mag)
- Cross-acceptance Playwright suite full
- UAT founder
- ROBY: aggiornamento Engine v2.8 → v2.9 changelog narrative
- Eventuale recepimento ROBY del nuovo brand kit v1.1 con functional palette

### Day 7 (3 Mag — sabato target)
- Merge `harden-w1` → `main`
- Version bump `alfa-2026.05.03-1.0.0`
- CCP: `CCP_Sprint_W1_Closing_Report_2026-05-03.md`
- ROBY: aggiornamenti narrativi (slide #11 deck "6 buchi chiusi", slide #5 con pity v5.1, technical companion §10 da open a closed)
- ROBY: REGISTRY entries TECH-HARDEN-001 + LEG-002

### Post-sprint (4-7 Mag)
- ROBY: brand kit v1.1 (functional palette + sezione "Update post W1")
- ROBY: pitch deck v1.2 con sezione Traction "Sprint W1 closed: 6 buchi math/security risolti pre-Stage 1"
- ROBY: thread X founder-led "I sei buchi che il nostro engine aveva — e come li abbiamo chiusi in 7 giorni" (trasparenza = trust building)
- Inizio Piano Comms 90gg M1·W1 ufficiale

---

## 7. Cose che NON sono ancora successe e che dovrebbero (gap onesti)

Tre cose mi pesano sulla coscienza:

1. **Counter Alpha Brave non è ancora pubblico**. È wired su `/diventa-alpha-brave.html` ma deployabile solo dopo merge `harden-w1` → `main`. Per Piano Comms M1·W1 (lunedì 4 Mag) deve essere live. Il timing post-merge è giusto, ma se sprint slitta a Day 8+ andiamo in ritardo. **Mitigazione:** chiedere a CCP di hot-patch in main solo il file landing pre-merge totale, se serve. **Tracked.**

2. **Telegram bot `@AirooobiIT` non è ancora attivo**. CCP ha consegnato il flow + 5 FAQ canned. Skeezu deve creare il bot su BotFather, deployare il flow JSON, attivare. Niente di tecnico bloccante, ma operativo. **Tracked per Skeezu.**

3. **Nessuna comunicazione pubblica in 2 giorni di sprint**. Mentre CCP costruisce, X / Telegram / blog dovrebbero parlare. Skeezu e io non abbiamo prodotto neanche un thread. Per Piano Comms M1·W1 dobbiamo essere up-and-running. **Action ROBY:** preparo entro Day 5 una "build-in-public" thread X founder-led che racconta lo sprint hardening senza spoilare i fix tecnici. Format: "Quando ti dicono 'lancio in beta' ma sai che la matematica ha 6 buchi che gli investor tech vedrebbero in 30 minuti, fai questo: …". **Tono trasparente, build credibility.**

---

## 8. Cosa propongo di fare per il cross-check con CCP

Skeezu, mandi a CCP via SSH un RS con la richiesta del suo recap analogo. Tre punti che io voglio confrontare per scoprire eventuale drift:

1. **Numeri sprint**: CCP dichiara 7 migration · 3 edge functions · 10 RPC · 2 tabelle · 1 matview · 2 cron. Voglio confermare i miei numeri 14 deliverable + 8 file scambio coincidono col suo conteggio.
2. **Confidence Day 7 chiusura**: io confermo >85% solo per i task tecnici, ma con caveat su Skeezu setup secrets (Twilio + Turnstile + SALT). CCP la stima >85% includendo l'unblock Skeezu o assumendolo? Voglio capire se vede gli stessi miei rischi.
3. **Lessons learned**: io ho 5 lessons (bug 24h, falsi positivi review, spec mia con 4 errori, stime mie pessimistiche, ratio falsi allarmi/HIGH). Voglio vedere se CCP ne nomina di altre che io non ho colto (es. tooling, processo SQL repair, edge case scoperti).

**RS prompt da mandare a CCP** (per richiedere il suo recap analogo):

```
RS — recap mid-sprint W1 cross-check

ROBY ha consegnato ROBY_Recap_Sprint_W1_Mid_2026-04-28.md in for-CCP/. Skeezu lo ha letto.

Per cross-check di allineamento, produci un file analogo CCP_Recap_Sprint_W1_Mid_2026-04-28.md in for-CCP/ con la stessa struttura (8 sezioni):

1. Stato AIROOBI in numeri
2. Deliverable tecnici tuoi (migration/RPC/edge/cron count + file specifici)
3. Lavoro ROBY visto da te + tuo riconoscimento
4. Decisioni prese + pending dal tuo punto di vista
5. Lessons learned (le tue 5 — magari diverse dalle mie)
6. Roadmap prossimi passi dal tuo angolo tecnico
7. Gap onesti (cose tecniche non ancora risolte che ti preoccupano)
8. Cose che vuoi sentire da ROBY su drift di percezione

Sii brutalmente onesto sui gap. Skeezu poi fa il diff con ROBY recap e individua eventual misalignment. Tempo: 30 min, max.
```

---

## Closing

Skeezu, sprint W1 sta andando bene oltre le aspettative. Confidence Day 7 alta. **L'unica cosa che blocca veramente sei tu** in questo momento, in 3 azioni operative:

1. Firma `decision treasury_caps` (4-6 minuti lettura + 1 frase SSH).
2. Twilio + Turnstile + SALT setup (20 minuti totali).
3. Push env Vercel (5 minuti).

Quando hai fatto, lo sprint è in volo libero fino al merge Day 7.

Aspetto il recap di CCP per cross-check. Buon Day 3 in vista, founder.

---

— **ROBY**

*Versione 1.0 · 28 Apr 2026 · canale ROBY→Founder + cross-check CCP*
