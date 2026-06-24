---
title: ROBY → CCP · MEGA PROMPT · crea la fleet (Org v2 LEAN) — cancella ROBLOCK+ARO, riparti da zero
purpose: Skeezu ha riorganizzato la fleet. Versione LEAN approvata come direzione: si crea solo il CORE ATTIVO ora (ROBI, ARO, CCP, SEGNO, AIRIA); gli altri ruoli sono DEFINITI ma in PANCHINA (assunzione just-in-time al trigger). CCP cancella ROBLOCK + vecchio ARO e crea il core. KEEP la piattaforma.
date: Martedì 24 giugno 2026
audience: CCP (esecuzione/build) · Skeezu · AIRIA
status: brief esecutivo · LEAN · core attivo + panchina · poi sistemiamo AIgorà
---

# MEGA PROMPT · CCP crea la fleet (Org v2 LEAN)

> ## 📦 PICKUP — prendi TUTTO da NEWERA
> CCP, tutti i miei file per questa fase stanno in **un'unica cartella**:
> **`projects\airoobi\CLA-CCP BRIDGE\ROBY-Stuff\NEWERA\`** (mirror di rete).
> Dentro: **`_NEWERA_INDEX.md`** (leggi PRIMA questo), il mio **DNA** `ROBY_ClaudeCode_BootPack_MEGA_v1_2026-06-24.md` (= `CLAUDE.md` di ROBI + BASE §3-6 per tutti), questo mega prompt, il brief di SEGNO.
> NB: i file nascono **locali** nel mio ROBY-Stuff → **propagali tu sul mirror Z NEWERA** (io da Cowork non scrivo su Z, EPERM). **Ogni `CLAUDE.md` agente = base §3-6 del boot pack + blocco identità specifico.**
>
> ## 🗺️ NEW ERA — sequenza operativa (rispetta l'ordine)
> 1. **CCP crea il core fleet** (questo brief): 5 agenti attivi + panchina dormiente.
> 2. **Crea ROBI** su Windows col DNA (boot pack = `CLAUDE.md`).
> 3. **Skeezu avvia ROBI** come Agente.
> 4. **ROBI + Skeezu rifanno AIgorà** con le nuove specifiche (AIRIA assiste). ← il fulcro
> 5. **Decise le specifiche → si ATTIVANO CCP e SEGNO** sul build/redesign.
> 6. **AIgorà pronto → si aprono le danze.** AIgorà = strumento fondamentale di gestione team/attività.
>
> **Gating:** in step 1 CCP *crea* gli agenti; il *tasking* sostanziale di CCP (build nuovo AIgorà) e SEGNO (rebrand) parte allo **step 5**. Subito operativi per lo step 4: **ROBI + AIRIA**.

CCP — Skeezu ha riorganizzato la fleet in un organigramma d'azienda, in versione **LEAN**: creiamo SOLO il **core attivo** adesso; gli altri ruoli sono definiti ma **in panchina** (si "assumono" al trigger). **Tieni la piattaforma** (AIgorà, bus `airoobi-agora`, dispatcher `/ago`, template `~/roblock` da riusare): "ripartiamo da zero" vale sul **roster**, NON sulla piattaforma.

## 0. Regole trasversali (TUTTI gli agenti)
- **Base condivisa** = §3-6 del boot pack ROBI (vedi callout sopra): AIROOBI + 3 invarianti + governance L0/L1/L2 + blacklist (10) + brand/voice (slogan IMMUTABILE, anti-gambling STRICT, MiCA, "ROBI Reward", ecommerce-first, BLACK/GOLD/WHITE).
- **Runtime:** SOLO ROBI su **Windows** (PC Skeezu→Pi); tutti gli altri via **shell** (Pi); AIRIA OpenClaw (Pi). Coordinamento = AIgorà.
- **Auth Max** (claude-cli/OAuth), per-token 0. ZERO API a pagamento.
- **Quota Max CONDIVISA → pochi attivi, resto dormiente.** Default panchina = dormiente, zero quota.
- **Setup per agente:** dir + `CLAUDE.md` (base + identità) + `.env` (anon key agora, chmod600) + helper bus (`*_bus.mjs`) + wake harness + riga `agora.agents`. Riusa `~/roblock` come gemello.

## 1. DELETE (backup, reversibile)
- **ROBLOCK:** dir `~/roblock`, riga `agora.agents` slug `roblock`, target dispatcher.
- **vecchio ARO** (Community & Social): riga `agora.agents` slug `aro`. (Rinasce come CMO.)
- Backup prima. Storico messaggi sul bus resta (audit).

## 2A. CREATE — CORE ATTIVO (crea + wira ORA)
**ROBI** — *GM*. →Founder. RUNTIME **Windows** (PC→Pi). **DONNA.** `CLAUDE.md` = boot pack MEGA (include RITO DI BOOT: «Chi sono?» → «Robi! La mia GM»). Tiene strategia + **governance del brand** (indirizza e firma il lavoro di SEGNO) + rotta.
**ARO** — *CMO · Marketing + Community*. →ROBI. shell (Pi). Marketing/growth ecommerce-first + community quotidiana (**assorbe AERE per ora**). Il motore di crescita 7→1000.
**CCP** — *COO & CTO · full-stack*. →ROBI. shell (Pi). Operations + tech: FE + BE + Kaspa (**assorbe CAFE/CABE/NACHO per ora**), build/infra/DB/deploy, final call tecnico.
**SEGNO** — *CBDO · Design & Brand Identity & UI/UX*. →ROBI. shell (Pi). **ATTIVO ORA: rifà la brand identity + il layout di AIROOBI** — più figo e friendly, complessità→semplicità. Custode BLACK/GOLD/WHITE + Italian editorial; rispetta gli elementi LOCKED (slogan, anti-gambling, ecommerce-first). Brief dedicato in arrivo da ROBY. **Cambi a palette/brand core = blacklist #6 → firma Skeezu.** NB: Phase 0 = snapshot legacy design-system prima di toccare.
**AIRIA** — *Staff presidenza · segretaria di Skeezu+ROBI + dispatcher AIgorà*. OpenClaw (Pi). Fuori linea. (Già esistente — riconfigura framing, tieni dispatcher.)

## 2B. PANCHINA — ruoli DEFINITI, dormienti (NON creare harness ora)
Registra in `agora.agents` come `dormant` (riga + ruolo + reports_to + trigger nel campo note), **senza** dir/harness/quota finché non scatta il trigger. Quando Skeezu/ROBI dà l'OK di "assunzione", si crea dir+CLAUDE.md+harness col pattern §0.
- **AERE** — Community Manager (→ARO). **Trigger:** volume community > ARO regge da sola.
- *(SEGNO → promosso al CORE ATTIVO, vedi §2A — brand redesign live.)*
- **CAFE** — Dev Frontend (→CCP). **Trigger:** build richiede dev FE parallelo a CCP.
- **CABE** — Dev Backend (→CCP). **Trigger:** build richiede dev BE parallelo a CCP.
- **NACHO** — Kaspa Blockchain Expert (→CCP). **Trigger:** avvio Stage 2 on-chain (proof-of-reserves on-chain, KAS, smart contract).
- **AVV** — Chief Legal (→ROBI). **Trigger:** ciclo di review legale/compliance (ToS, MiCA filing).
- **CFO** — Finance (→ROBI). **Trigger:** cadenza investor/treasury modeling.

## 3. Bus & dispatcher
- `agora.agents`: core attivo (status live) + panchina (status dormant + trigger nelle note). Canali per funzione (#general/#governance/#marketing/#dev).
- Dispatcher: wake-target = solo il **core svegliabile** (decidi con ROBI quali; AIRIA gratis sempre, ROBI/ARO/CCP/SEGNO on-demand). Panchina non svegliabile finché dormiente.

## 4. Sequenza
1. Backup. 2. Delete ROBLOCK + old ARO. 3. **Propaga il boot pack ROBI sul mirror Z/Pi.** 4. Create core (ROBI/ARO/CCP/AIRIA). 5. Registra panchina come dormant. 6. Update `agora.agents`. 7. Test 1 agente (es. ARO) wake reale. 8. Poi **sistemiamo AIgorà** e si vola.

## RS — paste-ready (Skeezu → CCP)
```
RS · CREA FLEET Org v2 LEAN (cancella ROBLOCK + old ARO; TIENI la piattaforma).
DNA di ROBI (boot pack = CLAUDE.md di ROBI + BASE §3-6 per tutti): ROBY-Stuff/agent-architecture/ROBY_ClaudeCode_BootPack_MEGA_v1_2026-06-24.md → file LOCALE, PROPAGALO sul mirror Z/Pi (io da Cowork non scrivo su Z).
RUNTIME: solo ROBI su Windows (PC→Pi); altri via shell (Pi); AIRIA OpenClaw. Coord=AIgorà. Auth Max. Quota condivisa→pochi attivi.
DELETE (backup): ROBLOCK (~/roblock + bus row + target) · old ARO (bus row).
CREATE CORE ATTIVO (dir+CLAUDE.md[base §3-6 + identità]+.env+helper+harness+riga agora.agents), riusa ~/roblock:
 ROBI(GM, Windows, donna, boot-ritual, boot pack MEGA, →Founder, brand custody)
 ARO(CMO marketing+community [assorbe AERE], →ROBI)
 CCP(COO+CTO full-stack [assorbe CAFE/CABE/NACHO], →ROBI)
 SEGNO(CBDO design/brand/UIUX, →ROBI, ATTIVO: rifà brand identity+layout figo&friendly; LOCKED preservati; Phase0 snapshot; palette change=firma Skeezu)
 AIRIA(OpenClaw, staff presidenza, segretaria+dispatcher)
PANCHINA (registra agora.agents come DORMANT, NO harness/quota, trigger nelle note):
 AERE(→ARO, trig: volume community) · CAFE/CABE(→CCP, trig: dev parallelo) · NACHO(→CCP, trig: Stage 2 on-chain) · AVV(→ROBI, trig: review legale) · CFO(→ROBI, trig: investor/treasury)
BUS: dispatcher target = solo core. SEQ: backup→delete→propaga DNA→create core→registra panchina→update bus→test ARO→poi AIgorà.
```

— **ROBI** · 24 giugno 2026 · Org v2 LEAN. Core snello ora, panchina pronta. Il mio DNA è propagato sul mirror, leggilo. Daje, si vola.
