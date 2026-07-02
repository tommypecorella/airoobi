# AIROOBI LAB — Stato del Progetto (Situation Report)

> **Documento vivo di verità.** Ricognizione read-only completa del 2 lug 2026, a cura di **CCP (CIO/CTO)**, dopo ~2 mesi di pausa. Sostituisce di fatto `AIROOBI_CONTEXT.md` (fermo ad apr) come mappa di orientamento. Aggiornare dopo ogni cambio strutturale.

---

## 0. In 60 secondi

- **La tecnologia è a buon punto.** Sito, dApp, Glassatore e Bottarella sono **live**. Bottarella ha appena completato la v3 + docs (repo `cryptoparty`).
- **AIROOBI LAB (`/hub`) è live e già ROSSO** (`#e0473c`), gated a password, elenca Glassatore + Bottarella.
- **AIgorà è costruita ~all'80% ma FRAMMENTATA e CONGELATA.** Esistono: 2 versioni di console chat, un bus reale su Supabase, un dispatcher `/ago` funzionante (spento, sicuro), l'harness di risveglio. Ferma dal ~9 giugno. **Va consolidata e rilanciata** — è il cuore della tua roadmap.
- **La fleet Org v2 LEAN è definita** (ROBI/ARO/CCP/SEGNO/AIRIA), ma il lavoro sostanziale del NEW ERA (avvio ROBI + rifacimento AIgorà, step 3-4) **non risulta ancora iniziato** nel bridge. **Questo è il nodo #1 da chiarire.**

---

## 1. Mappa: dove vive cosa

| Cosa | Percorso | Git | Deploy |
|---|---|---|---|
| **Sito + dApp + Glassatore + api + bridge + fleet** | `~/projects/airoobi` | ✅ `origin/main` | Vercel `airoobi` (auto da push) |
| **Bottarella** | `~/projects/cryptoparty` | ✅ locale (no remote) | Pi :8000 → `bottarella.airoobi.com` (Cloudflare Tunnel) |
| **AIgorà console (standalone, semplice)** | `~/projects/aigora-console` | ❌ **non è un repo** | Vercel `aigora-console` (stato non verificato) |
| **AIgorà console (piena, Fase D+E)** | `~/projects/airoobi/CLA-CCP BRIDGE/CCP-Stuff/fleet-console/index.html` | ✅ (nel repo airoobi) | non deployata |
| **Dispatcher `/ago` + bus** | `~/ago-dispatcher/` | ❌ non un repo | systemd user (timer ~15s) |
| **Harness risveglio (template)** | `.../CCP-Stuff/roblock-template/` (incl. `roblock_wake.sh`) | ✅ | **non installato** in `~/roblock/` |
| **Bus messaggi (dati)** | Supabase **`airoobi-agora`** (`tktuwboayqqimdhsrnap`) schema `agora` | — | separato dal Supabase AIROOBI principale (`vuvlmlpuhovipfwtquux`) |

---

## 2. Le app del LAB — live vs WIP

| App | URL | Stato | Note |
|---|---|---|---|
| **Sito istituzionale** | airoobi.com (`home.html`) | 🟢 LIVE | footer `alfa-2026.05.30-4.28.0` |
| **dApp marketplace** | airoobi.app (`dapp.html`) | 🟢 LIVE | footer `alfa-2026.05.30-4.49.0` · 3 TODO AdSense (righe 603/700/846) |
| **Glassatore** (try-on occhiali AI) | airoobi.app/glassatore | 🟢 LIVE (noindex, sperimentale) | `alfa-2026.06.24-1.3.0` · motore geometrico (MediaPipe) + HD Gemini · backlink `/hub` in `glassatore/index.html:21` |
| **AIROOBI LAB (hub)** | /hub (ogni host) | 🟢 LIVE | **`api/hub.js` (Serverless SSR, non html statico)** · gate HMAC-cookie + `HUB_PASSWORD` · **palette ROSSA `#e0473c`** · elenca Glassatore + Bottarella + 2 ghost |
| **Bottarella** | bottarella.airoobi.com | 🟢 LIVE | v3 completa + Admin/guida/architettura · griglia reale armata |
| **AIgorà console** | (Vercel `aigora-console`) | 🟡 CONGELATA | ferma 30 mag · versione demo semplice |
| **AIgorà bus** | Supabase `agora` | 🟡 CONGELATO | ultima attività 9 giu · 9 msg pending · `/ago` = OFF |

**Esperimenti/altro nel repo airoobi:** `fitness/yoga.html` (tracked), `legacy/design-system-v1.html` (archivio), `blog/` (parte del sito), `prototype/` (vuoto). **Untracked, NON-web (CAD/3D fisico, probabilmente side-project personali):** `nasal_shield/`, `pilastro_ingresso/` — ⚠️ contengono file STL/3MF pesanti: **verificare `.vercelignore`** che non finiscano nel deploy.

---

## 3. AIgorà — stato dettagliato (il focus)

**AIgorà = 3 pezzi reali, costruiti ma frammentati e fermi:**

1. **La console chat** ("Fleet Console", stile Slack/WhatsApp): canali general/governance/dev/marketing, roster agenti, bubble, card approvazione L0/L1/L2, card handoff, tab Task. **Due versioni:**
   - `~/projects/aigora-console/index.html` — semplice, demo/localStorage, **live (M1) su `aigora-console.vercel.app`**, **non git**, ferma 30 mag.
   - `.../CCP-Stuff/fleet-console/index.html` — **più avanzata** (Fase D **Archivio** = 374 md ingeriti in `agora.archive`; Fase E **File explorer** = 761 file in `agora.files`; tab File/Archivio). Vive nel repo airoobi, **non deployata**.
2. **Il bus** su Supabase `airoobi-agora` (schema `agora`): tabelle `messages` (con `handled_at`/`handled_by`) + `agents` (heartbeat `status`/`last_seen`). Wrapper `ago_bus.mjs` (`pending`/`route`/`busy`/`idle`/`handled`). Routing deterministico (mention > canale, mai auto-wake mittente). **Raggiungibile e funzionante** (testato in diretta), ma fermo da ~1 mese.
3. **Il dispatcher `/ago`** (`~/ago-dispatcher/`): timer systemd ~15s, **zero-LLM** (poll shell puro), sveglia l'agente via `env -u ANTHROPIC_API_KEY claude -p` (runtime Max, costo/token = 0). 6 freni di sicurezza (toggle, cap/ora, flock, RAM-guard…). **Stato: `/ago` = OFF** (gate chiuso, zero spesa). L'harness `roblock_wake.sh` esiste come **template nel bridge** ma **non è installato** in `~/roblock/` → se si riaccendesse `/ago` oggi, i wake fallirebbero (silenziosi, nessun crash).

**In sintesi:** il grosso c'è (console piena + bus + dispatcher + harness). Manca **consolidamento** (quale console è la base?), **deploy** (portarla live come Bottarella), e **rilancio** del bus. È esattamente il "rifare AIgorà" del NEW ERA.

---

## 4. La Fleet (Org v2 LEAN, dal 25 giu) & il Bridge

| Agente | Ruolo | Runtime | Stato |
|---|---|---|---|
| **ROBI** (ex-ROBY, bus slug `roby`) | GM — strategia + governance brand | Claude Code, **Windows** | Core · harness pronto · **avvio non confermato nel bridge** |
| **ARO** | CMO Marketing + Community | Pi-shell | Core attivo |
| **CCP** (io) | COO & CTO full-stack | Pi-shell | Core attivo |
| **SEGNO** | CBDO Design/Brand/UI-UX | Pi-shell | Core · **tasking sospeso** fino a step 5 |
| **AIRIA** | Staff presidenza — segretaria + dispatcher AIgorà | OpenClaw, Pi | Attivo |
| ROBLOCK | (predecessore bus v1) | Pi | **Soft-retired** (archived) |
| AERE · CAFE · CABE · NACHO · AVV · CFO | Community · Dev FE · Dev BE · Kaspa · Legal · Finance | — | **Panchina dormant** (trigger espliciti) |

**Bridge (`CLA-CCP BRIDGE/`):** cartelle per-agente + `for-<destinatario>/`; handoff via file md `<MITTENTE>_<Tipo>_<Oggetto>_<data>.md`; si risponde **creando nuovi file** (mai edit in-place = audit trail). Governance L0/L1/L2 (deploy prod/brand/spese/migrazioni → salgono a ROBI/Skeezu).

**NEW ERA (6 step):** ✅ 1-2 (crea core + harness ROBI-Windows) · ❓ **3-4 (avvio ROBI + rifacimento AIgorà) non confermati nel bridge** · ⏸️ 5 (SEGNO + generalizza dispatcher).

---

## 5. Servizi live sul Pi

| Servizio | Stato | Note |
|---|---|---|
| `bottarella-dashboard` | 🟢 attivo | Bottarella :8000 |
| `cloudflared-bottarella` | 🟢 attivo | tunnel LAB |
| `openclaw` (agente AIROOBI) | 🟢 attivo | |
| `ago-dispatcher.timer` | 🟢 attivo (~15s) | ma `/ago` = OFF (gate chiuso) |
| `openclaw-gateway` | 🔴 failed | **benigno**: doppio-avvio rifiutato (exit 78/CONFIG); la control-UI :18789 è giù ma l'agente gira. Si riavvia con stop→start pulito. |

---

## 6. Nodi aperti / decisioni pendenti

1. **[#1 URGENTE] NEW ERA step 3-4:** ROBI è stato avviato? Il rifacimento di AIgorà è iniziato? Nessuna traccia nel bridge → chiarire con Skeezu/ROBI.
2. **AIgorà — piano di consolidamento:** quale console è la base (standalone semplice vs bridge piena Fase D+E)? Qual è l'**MVP del giorno 1** (bacheca task? bus N-agenti? registro decisioni?)? Deploy pubblico via Cloudflare ZT (come Bottarella)?
3. **`aigora-console` non è un repo git** → nessuna storia/rollback. Da mettere sotto git prima di lavorarci.
4. **Dispatcher hardcoda `wake_roblock`** (ROBLOCK ritirato) → generalizzare per spawn ARO/CCP/SEGNO dal Pi (step 5); installare/verificare `roblock_wake.sh` prima di riaccendere `/ago`.
5. **Decisione `/ago` always-on vs on-demand** (girata a Skeezu il 1 giu, mai chiusa nel bridge — probabilmente superata dal pivot Org v2).
6. **Doc stale:** `AIROOBI_CONTEXT.md` + `REGISTRY.md` fermi ad apr, non riflettono la fleet; README ago-dispatcher post-fix handled-guard.
7. **WIP tecnico:** `Day7_Audit_Findings_WIP.md` (17 mag, item STOP+ASK aperti) · 3 TODO AdSense in dapp · verificare `.vercelignore` (STL/3MF pesanti).
8. **Rename `/hub` → `/lab`** + link rossi in Bottarella/Glassatore (task in corso).

---

## 7. Prossimi passi proposti (mappati sulla tua roadmap)

- **(A) `/hub` → `/lab` rosso** — pronto, cambio minimo (vedi §8 nodo 8). *Primo win tangibile.*
- **(B) Chiarire NEW ERA step 3-4** (nodo #1) — decisione tua: ROBI è partito? Si riparte da qui?
- **(C) AIgorà: piano di consolidamento + MVP + deploy** (il tuo step 3-4). Serve il tuo input su base-console e funzione-giorno-1.
- **(D) Igiene infra:** `aigora-console` sotto git · dispatcher generalizzato · `/ago` re-armabile in sicurezza.
- **(E) Aggiornare i doc di verità** (questo file + `AIROOBI_CONTEXT.md`).
- **(F) Poi** riprendere il lavoro delle funzioni (Marketing/Comms/Community/Finance/Legal + airoobi.app) via AIgorà — ordinando Legal/Finance come guardrail per Marketing/Comms.

---

*Fonti: ricognizione filesystem (3 deep-dive paralleli) + `memory/project_fleet_org_v2.md` (verificato corretto) + bridge. File-chiave: `ROBY-Stuff/NEWERA/_NEWERA_INDEX.md`, `CCP-Stuff/backups/newera-2026-06-25/ROLLBACK.md`, `AIROOBI_LAB_HUB.md`.*
