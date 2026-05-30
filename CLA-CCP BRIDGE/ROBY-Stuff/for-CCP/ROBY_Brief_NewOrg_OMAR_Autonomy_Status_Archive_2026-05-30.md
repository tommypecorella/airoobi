---
title: ROBY → CCP · Nuova struttura (ROBLOCK braccio destro) + autonomia via ROBLOCK + status + archivio — VERSIONE AGGIORNATA
purpose: AGGIORNA e SUPERA i due brief autonomia precedenti (ancora NON dati a CCP). Skeezu 30 May 2026 ha rivisto l'org: ROBY resta strategico su Cowork (non triggerato); si crea ROBLOCK (Operative Marketing Manager) su Claude Code = l'esecutore always-on a cui ROBY delega il lavoro operativo; ARO ora riporta a ROBLOCK. L'autonomia (AIRIA /ago linux-trigger) sveglia ROBLOCK e ARO, NON ROBY. + msg di status + archivio .md su AIgorà invariati. Vincolo: zero budget/API. Visione bundle: SD Pi + web app (web3 secondario).
date: Sab 30 maggio 2026
audience: CCP (implementazione) · AIRIA (motore) · Skeezu
status: brief AGGIORNATO · supera ROBY_Brief_Autonomy_ROBYClaudeCode_AIRIADispatcher + ROBY_Brief_AIgora_AutonomyEngine_Status_Archive · attendo feasibility + piano CCP
---

# Brief AGGIORNATO · Nuova struttura + autonomia via ROBLOCK + status + archivio

CCP — **importante: questo supera i due brief autonomia precedenti** (non ancora consegnati). Skeezu ha rivisto l'organigramma e cambia CHI diventa Claude Code. **Vincolo: zero budget/API.** Visione prodotto: bundle **SD per Pi già configurata + web app** (web3 secondario, non impattante) → modulare/portabile.

## 1. Nuova struttura (org)
```
Skeezu (CEO)
├─ ROBY  — GM & Strategy/MKT/Comms · Cowork · session-based, STRATEGICO ("scollegato" come Skeezu, non triggerato)
│   └─ ROBLOCK — Operative Marketing Manager · Claude Code · ALWAYS-ON/triggerabile (NUOVO, braccio destro di ROBY)
│        └─ ARO — Community & Social · Claude Code · ora riporta a ROBLOCK
├─ CCP   — CIO/CTO · Claude Code · Pi
└─ AIRIA — System Guardian / dispatcher · OpenClaw · Pi
```
**Cambio chiave:** NON si converte ROBY in Claude Code. ROBY resta su Cowork e fa strategia con Skeezu; il malloppone operativo lo passa a **ROBLOCK**. ROBLOCK è l'agente always-on. ARO **riporta a ROBLOCK** (non più a ROBY). Spec identità: `agent-architecture/ROBLOCK_Onboarding_Spec_v1_2026-05-30.md`. (La vecchia `ROBY_as_ClaudeCode_Spec` è SUPERATA → vale per ROBLOCK, non per ROBY.)

## 2. Motore di autonomia — `/ago` sveglia ROBLOCK e ARO (non ROBY)
Identico trick, target diverso: **AIRIA lancia `claude -p`** per svegliare **ROBLOCK/ARO** quando sul bus arriva lavoro per loro.
- `/ago` = modalità AIRIA ON/OFF.
- Se ON: loop ~10s ma **poll ECONOMICO** (query REST su `agora.messages`, ZERO token Claude); invoca `claude -p` **solo** a messaggio nuovo per ROBLOCK/ARO → Claude svegliato a comando, non ogni 10s (costo ~0).
- **ROBY non è nel loop**: resta Cowork, legge/partecipa quando Skeezu glielo dice. Quando ROBY ha deciso una cosa, la scrive come task per ROBLOCK sul bus; ROBLOCK la prende al risveglio.
- Verifica tua: OpenClaw di AIRIA API-free come poll/trigger? RAM Pi regge ROBLOCK (Claude Code) accanto a CCP+AIRIA? memoria di ROBLOCK.

## 3. Messaggio di status / heartbeat (invariato)
`agora.agents.status` + `current_activity` (o tabella `agora.activity`: agent, action, started_at). Console: "ROBLOCK sta preparando la campagna X" nel pannello Squadra + pallino attività. Rende il bundle "vivo" e vendibile.

## 4. Archivio .md su AIgorà (invariato)
Ingest TUTTI i ~364 `for-CCP/*.md` in `agora.archive` (parse frontmatter title/date/audience/status + body) + tab "Archivio" con ricerca in console. Read-only, costo 0. Si lega ad `archive_for_ccp_rounds.sh`. Spostamento fisico = blacklist #8 separato.

## 5. File explorer in AIgorà — vedere e aprire i file creati dalle AI (REQUISITO FERMO Skeezu)
Skeezu, a prescindere da tutto il resto: AIgorà deve permettere di **vedere e aprire i file che gli agenti creano** (doc, spec, HTML, deliverable, ecc.) — non solo i .md del canale: **tutto l'output della fleet**.
- Proposta: tabella `agora.files` (path, title, author_agent, type, created_at, url/storage_ref) che gli agenti popolano quando creano un file; in console una vista **"File"** filtrabile per agente/tipo/data, con azione **apri**.
- Apertura: testo/md/html → **render inline** nella console (costo 0); binari (docx/pdf/pptx/xlsx/png) → ospitati su **Supabase Storage (free tier)** o committati nel deploy + link "apri/scarica".
- Flag onesto (tuo): la console deployata NON legge il file system locale → i file vanno spinti su storage/bus per essere apribili fuori-LAN. Per i file solo-locali, almeno esporre metadati + path.
- Si lega all'archivio (§4): l'archivio .md è un sottoinsieme; questo è il **file explorer generale** della fleet. Costo 0 (Supabase free).
- **Requisito Skeezu fermo: implementalo.** Rende anche il bundle molto più vendibile (vedi e apri ciò che gli agenti producono).

## Cosa ti chiedo
Feasibility + piano (passi, effort calibrato, costo 0) per: deploy **ROBLOCK** (Claude Code wired al bus, triggerato da AIRIA), motore `/ago`, status, archivio. Flag onesti infra. Bundle in mente. Rispondi in `for-CCP/` o sul bus #dev → review ROBY+Skeezu.

## RS — paste-ready (Skeezu → CCP)
```
AGGIORNAMENTO ORG + AUTONOMIA (supera i 2 brief autonomia precedenti). Vincolo: zero budget/API. Bundle: SD Pi + web app.

NUOVA STRUTTURA: ROBY resta Cowork/strategico (NON convertito, non triggerato). NUOVO agente ROBLOCK
(Operative Marketing Manager, Claude Code, always-on) = braccio destro di ROBY a cui delega il lavoro operativo.
ARO ora riporta a ROBLOCK. Spec: agent-architecture/ROBLOCK_Onboarding_Spec_v1. (ROBY_as_ClaudeCode_Spec = superata, vale per ROBLOCK.)

1) AUTONOMIA /ago: AIRIA lancia `claude -p` per svegliare ROBLOCK e ARO (NON ROBY). Modalità ON/OFF; se ON loop ~10s
   ma POLL ECONOMICO (REST agora.messages, zero token); `claude -p` solo a msg nuovo → sveglia a comando, costo ~0.
   ROBY fuori dal loop (Cowork); quando decide, scrive un task per ROBLOCK sul bus. Verifica: OpenClaw API-free? RAM Pi per ROBLOCK? memoria ROBLOCK?
2) STATUS/HEARTBEAT: agents.status + agora.activity → "ROBLOCK sta facendo X" in console.
3) ARCHIVIO: ingest ~364 for-CCP/*.md in agora.archive + tab "Archivio" con ricerca.
4) FILE EXPLORER (REQUISITO FERMO Skeezu): vedere + APRIRE tutti i file creati dagli agenti in AIgorà.
   Tabella agora.files (path,title,author,type,created_at,url) + vista "File" con apri. Testo/md/html render
   inline; binari via Supabase Storage/link. Flag: console non legge FS locale → push su storage/bus.

CHIEDO: feasibility + piano (passi/effort/costo 0) + flag. Rispondi for-CCP o bus #dev.
```

— **ROBY** · 30 May 2026 · nuova struttura ROBLOCK + autonomia aggiornata. Questo è il doc CCP buono; gli altri due autonomia sono superati.
