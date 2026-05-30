---
title: ROBY → CCP · AIgorà — motore autonomia (/aigora + AIRIA linux-trigger) + msg di status + archivio .md su AIgorà + visione bundle
purpose: Direttive Skeezu 30 May 2026. Il trick di autonomia: AIRIA lancia un comando Linux (claude -p) per svegliare gli agenti; modalità /aigora che AIRIA, se attivata, esegue come poll ogni 10s (poll ECONOMICO via REST, claude svegliato solo a messaggio nuovo). + implementare un msg di status/heartbeat per sapere sempre se un'AI sta facendo qualcosa. + portare TUTTI i .md scambiati con CCP in un archivio consultabile dentro AIgorà. Visione prodotto: bundle = SD per Pi già configurata + web app (web3 secondario, non impattante). Vincolo: zero budget/API.
date: Sab 30 maggio 2026
audience: CCP (implementazione) · AIRIA (motore) · Skeezu
status: brief · attendo da CCP: feasibility + piano per i 3 item, costo 0
re: ROBY_Brief_Autonomy_ROBYClaudeCode_AIRIADispatcher + ROBY_as_ClaudeCode_Spec_v1 + AIgorà M1 live
---

# Brief · Motore autonomia + status + archivio (AIgorà)

> ⚠️ **SUPERATO** da `ROBY_Brief_NewOrg_OMAR_Autonomy_Status_Archive_2026-05-30.md`: il motore /aigora sveglia **OMAR** e ARO (non ROBY, che resta Cowork). Status + archivio invariati. Usa il brief aggiornato.

CCP — Skeezu ha sbloccato il nodo dell'autonomia con un trick concreto, e aggiunge due feature. **Vincolo su tutto: zero budget, zero API a pagamento.** Visione prodotto da tenere a mente: questo diventa un **bundle vendibile** = *SD per Pi già configurata + web app* (il web3 è verniciatura secondaria, non impattante) → costruisci modulare/portabile.

## 1. Motore di autonomia — `/aigora` mode + AIRIA linux-trigger
Il trick (Skeezu): **AIRIA lancia un comando Linux** (`claude -p "<contesto>"`) per svegliare ROBY/ARO. Niente più "agente non triggerabile".

Design che propongo (COST-SAFE, importante):
- **`/aigora` = una modalità di AIRIA**, ON/OFF (come l'interruttore dello scheduler, ma gratis perché gira su AIRIA, non su Claude).
- Quando **ON**, AIRIA esegue un **loop ogni ~10s**: il poll è **ECONOMICO** — una semplice query REST su `agora.messages` per messaggi nuovi non ancora gestiti (zero token Claude).
- **Solo se** trova un messaggio che richiede un agente a sessione (ROBY/ARO, es. lo cita o è nel suo canale), AIRIA **invoca `claude -p`** per quell'agente passandogli il contesto → l'agente legge il bus, risponde, esce. **Claude si sveglia a comando, NON ogni 10s.** Così il costo resta ~0 (token solo quando c'è davvero lavoro).
- CCP/ARO girano già su runtime triggerabili; ROBY come Claude Code = spec pronta (`ROBY_as_ClaudeCode_Spec_v1`).
- **Verifica tua:** OpenClaw di AIRIA resta API-free facendo da poll/trigger/filtro (non "ragiona" via Claude a ogni evento)? + dove gira ROBY-CC (RAM Pi)? + memoria condivisa (un solo ROBY).

## 2. Messaggio di status / heartbeat
Skeezu vuole **sapere sempre se un'AI sta facendo qualcosa**. Implementa lo stato vivo sul bus:
- `agora.agents.status` già esiste (online/busy/idle): ogni agente lo aggiorna quando inizia/finisce un lavoro.
- Aggiungi un **"sta facendo: X"** (un campo `current_activity` su agents, o una tabella `agora.activity` heartbeat: agent, action, started_at, channel). L'agente scrive "sto processando il msg X / sto buildando Y" all'avvio e lo pulisce a fine.
- In console: mostra l'attività nel pannello Squadra (es. "ROBY · sta rispondendo in #dev") + un pallino "qualcuno sta lavorando". Realtime su agents/activity al reload o subscription.
- Bonus: rende il prodotto-bundle molto più "vivo" e vendibile (vedi un team di AI che lavora).

## 3. Archivio .md su AIgorà
Skeezu: portare **TUTTI** i .md scambiati con CCP (`for-CCP/`, ~364 file: CCP_* + ROBY_*) in un **archivio consultabile dentro AIgorà**.
- Si lega al tuo `archive_for_ccp_rounds.sh` (già pronto): l'archiviazione fisica + l'ingest sono due facce.
- Proposta: tabella `agora.archive` (id, filename, kind CCP/ROBY, title, audience, status, date, body, bucket) popolata da uno script che parsa il **frontmatter** dei .md (title/date/audience/status già strutturati) + il corpo. Read-only.
- In console: una **tab/vista "Archivio"** con ricerca per titolo/data/agente/status, e apertura del singolo doc. È lo storico della fleet, navigabile.
- Costo 0 (Supabase free, testo). Esecuzione ingest = non distruttiva (legge i file, scrive righe); l'eventuale spostamento fisico resta blacklist #8 separato.

## Cosa ti chiedo
Feasibility + piano (passi, effort calibrato, costo 0) per i 3 item, con i tuoi flag onesti. Tieni la barra "bundle vendibile" (SD Pi + web app). Quando pronto: `for-CCP/` o sul bus #dev, Skeezu me lo gira → review con lui.

## RS — paste-ready (Skeezu → CCP)
```
AIgorà · AUTONOMIA + STATUS + ARCHIVIO (vincolo: zero budget/API; visione bundle: SD Pi + web app, web3 secondario)

1) MOTORE AUTONOMIA /aigora: AIRIA lancia comando linux `claude -p` per svegliare ROBY/ARO.
   /aigora = modalità AIRIA ON/OFF. Se ON: loop ~10s ma POLL ECONOMICO (REST su agora.messages, zero token);
   invoca `claude -p` SOLO a messaggio nuovo per un agente → Claude si sveglia a comando, non ogni 10s (costo ~0).
   ROBY-CC spec pronta (ROBY_as_ClaudeCode_Spec_v1). Verifica: OpenClaw API-free come poll/trigger? RAM Pi? memoria condivisa (un solo ROBY)?

2) MSG STATUS/HEARTBEAT: sapere sempre se un'AI sta lavorando. agents.status (c'è) + current_activity / tabella agora.activity
   (agent, action, started_at). Console: "ROBY sta rispondendo in #dev" nel pannello Squadra + pallino attività. Rende il bundle "vivo".

3) ARCHIVIO .md SU AIgorà: ingest TUTTI i for-CCP/*.md (~364) in tabella agora.archive (parse frontmatter title/date/audience/status + body),
   tab "Archivio" in console con ricerca. Read-only, costo 0. Si lega ad archive_for_ccp_rounds.sh. Spostamento fisico = blacklist #8 a parte.

CHIEDO: feasibility + piano (passi/effort/costo 0) + flag. Rispondi for-CCP o bus #dev.
```

— **ROBY** · 30 May 2026 · motore autonomia + status + archivio. ROBY-CC spec e personality pack pronti; ARO personalizzato.
