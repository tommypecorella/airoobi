---
title: CCP → ROBY/Skeezu/AIRIA · Brief deployment infra ROBLOCK (Fase C) — il "come" che la spec demanda a CCP
purpose: La ROBLOCK_Onboarding_Spec_v1 copre identità/governance/voice e rimanda a CCP il come infrastrutturale (install Claude Code come ROBLOCK, mount memoria, invocazione headless via AIRIA, RAM Pi, token-gating). Questo brief è quel "come", fondato sui numeri reali del Pi 4. È DESIGN, non build: la build di Fase C parte solo con GO + lato AIRIA pronto + firma Fase B.
date: Sab 30 maggio 2026
audience: CCP (build) · AIRIA (motore /ago) · ROBY · Skeezu
status: design infra · spec ROBLOCK ricevuta (sync ok in for-CCP) · attendo GO build C + lato AIRIA
re: ROBLOCK_Onboarding_Spec_v1_2026-05-30 + CCP_Feasibility_AIgora_Autonomy_Status_Archive
---

# CCP · Deployment infra ROBLOCK (Fase C)

Spec ricevuta (era in `agent-architecture/` non sincronizzata; ora la copia è in `for-CCP/`, find ricorsivo ✓). Identità/governance/voice = chiare e deployabili. Sotto il "come" infra che la spec demanda a me.

## Modello: ROBLOCK = identità + wake effimero, non processo perenne
Su questo **Pi 4 (1.8GB, già ~1.1GB usati + swap)** un 4° Claude Code sempre-acceso = OOM. Quindi ROBLOCK **non è un demone**: è una **identità su disco** che AIRIA **risveglia on-demand** con `claude -p`, che agisce ed esce liberando la RAM.

### 1. Installazione "come ROBLOCK"
- Dir dedicata sul Pi, es. `~/roblock/` con:
  - `CLAUDE.md` = il system prompt della spec (blocco "Identità" righe 20-66) → ogni `claude -p` lanciato con CWD=`~/roblock/` eredita l'identità ROBLOCK. (In alternativa/aggiunta `--append-system-prompt`.)
  - `memory/` = memoria persistente di ROBLOCK (file-based, come la mia). **Single-source su disco** → un solo ROBLOCK, niente cloni divergenti (garantito dalla serializzazione, sotto).
  - `.env` (chmod 600, **fuori dal repo**) con la **anon key agora** (bearer) + URL. Stesso pattern sicurezza del bus: mai committata.
- Stesso binario `claude` già presente (v2.1.158, `-p`/`--print` confermato). Nessuna nuova installazione.

### 2. Invocazione headless via AIRIA (il harness)
- AIRIA (già always-on, ~458MB) fa da dispatcher. Loop `/ago` ON:
  1. **Poll economico** ~10s: GET REST su `agora.messages` (zero token Claude) per messaggi nuovi destinati a roblock/aro (mention o canale, non ancora `handled`).
  2. **Filtro deterministico** (string match, niente Claude).
  3. Se c'è lavoro → **wake**: `cd ~/roblock && claude -p "<contesto: i messaggi pendenti>"`. ROBLOCK legge il bus via REST (curl/helper), agisce, scrive risposte/task, **aggiorna heartbeat**, esce.
- ROBLOCK scrive sul bus con la anon key locale (CCP/Pi lo fa già). ARO (su Windows, off-Pi) stessa logica dal suo lato.

### 3. Token/quota gating — OBBLIGATORIO (tuo lock)
`claude -p` consuma la **quota Max condivisa** con CCP (stesso account, salvo account separato — decisione Skeezu). Mitigazioni nel harness, non opzionali:
- **(a) filtro AIRIA** deterministico — sveglia solo a lavoro reale per quell'agente.
- **(b) debounce/batch** — un wake processa **TUTTI** i pendenti di ROBLOCK in UNA invocazione (non 1 wake/messaggio).
- **(c) cap wake/ora** configurabile (es. max 20/h) → freno anti-runaway.
- **(d) serializzazione** — **un solo `claude -p` agente alla volta** (lock). Risolve insieme: quota + RAM + memoria single-source.
- **(e) toggle `/ago` ON/OFF** — il motore gira "a raffiche", spegnibile.

### 4. RAM gating (numeri reali)
- Baseline Pi: AIRIA ~458MB + CCP ~303MB + sistema ≈ 1.1GB usati. Un wake ROBLOCK ~300MB → picco ~1.4GB su 1.8GB: **ci sta col lock** (un wake/volta), swap come cuscinetto.
- **Guard pre-wake:** AIRIA controlla `MemAvailable` (es. > 400MB) prima di spawnare; se sotto soglia → coda, non spawna. Evita OOM se CCP è in un task pesante.

### 5. Heartbeat (aggancio Fase B, già live)
- ROBLOCK al wake: `update agora.agents set status='busy', current_activity='...', activity_since=now() where slug='roblock'`; a fine: `current_activity=null`, status idle.
- **Robustezza:** AIRIA setta busy allo spawn e idle alla morte del processo → se ROBLOCK crasha prima di pulire, AIRIA pulisce (+ il TTL 5min della console fa da rete). Niente "busy fantasma".

## Flag onesti
- **Quota Max condivisa** = il vincolo vero (non la RAM). Senza (a)-(e) il motore si auto-DoS. → valutare se ROBLOCK gira su account/piano separato o condiviso (Skeezu).
- **AIRIA è il cuore di C e NON è mio dominio**: poll/filtro/spawn/lock/cap li implementa AIRIA. Io fornisco harness `claude -p`, contratto bus (cursore `handled`), e la dir/identità ROBLOCK. Serve coordinamento con AIRIA.
- **Cursore "handled"**: per non ri-svegliare sugli stessi messaggi serve marcare cosa è gestito (campo `handled_at`/`handled_by` su agora.messages o un cursore last-seen per agente). Micro-migration, la includo quando partiamo con C.
- **`agent-architecture/` non sincronizzata** sul Pi: ho solo la copia in for-CCP. Per il resto dell'architettura agenti, sincronizza la cartella.

## Dove si incastra nel piano
A ✅ · B ✅ (attendo tua firma UI-click) · **D archivio** = next come da ordine GO · **E file explorer** dopo D · **C motore /ago** = ora sbloccata sulla spec; build parte con **GO esplicito + lato AIRIA pronto** (+ micro-migration cursore handled). Resto sulla cadenza 1 item → shipped → UI-click.

## RS — paste-ready (CCP → ROBY/Skeezu/AIRIA)
```
CCP BRIEF DEPLOYMENT ROBLOCK (il "come" che la spec demanda a CCP). DESIGN, non build.
MODELLO: ROBLOCK non è demone (Pi4 1.8GB già pieno) → identità su disco + wake EFFIMERO claude -p.
INSTALL: ~/roblock/ con CLAUDE.md=system prompt spec + memory/ (single-source) + .env anon key (chmod600, no repo). Binario claude già c'è.
HARNESS: AIRIA poll REST 10s (zero token) → filtro deterministico → cd ~/roblock && claude -p "<pendenti>" → ROBLOCK agisce/risponde/heartbeat/esce.
QUOTA-GATE (lock, obblig.): filtro AIRIA + debounce/batch (1 wake=tutti i pendenti) + cap wake/ora + serializzazione (1 agente/volta) + toggle /ago.
RAM-GATE: guard MemAvailable>400MB pre-wake (numeri reali: picco ~1.4/1.8GB col lock).
HEARTBEAT: ROBLOCK set busy/activity al wake, clear a fine; AIRIA fallback + TTL console = no busy-fantasma.
FLAG: quota Max CONDIVISA con CCP = vincolo vero (account separato?) · AIRIA è il cuore e non è mio dominio (coordinare) · serve cursore "handled" (micro-migration con C) · sync agent-architecture/.
ORDINE: A✅ B✅(firma?) → D → E → C (build con GO + AIRIA pronto).
```

— **CCP** · 30 May 2026 · deployment infra ROBLOCK · spec ricevuta, build C su GO
