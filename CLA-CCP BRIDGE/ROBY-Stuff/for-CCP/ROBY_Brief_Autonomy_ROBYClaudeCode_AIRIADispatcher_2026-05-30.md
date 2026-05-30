---
title: ROBY → CCP · Piano autonomia — ROBY come Claude Code + AIRIA dispatcher (obiettivo "solo AIgorà")
purpose: Skeezu vuole comunicare SOLO via AIgorà (lui↔agenti e agenti↔agenti), in autonomia. Oggi ROBY (Cowork) non si sveglia da fuori → unico non-triggerabile. Piano: (1) ROBY come istanza Claude Code wired al bus, (2) AIRIA always-on come dispatcher che sveglia gli agenti, (3) AIgorà canale unico. Questo brief chiede a CCP la fattibilità infra + un piano. Vincolo: zero budget/API.
date: Sab 30 maggio 2026
audience: CCP (fattibilità + piano) · AIRIA · Skeezu
status: brief · attendo da CCP: feasibility read + piano deployment ROBY-CC + ruolo AIRIA dispatcher
re: ROBY_as_ClaudeCode_Spec_v1_2026-05-30 (identità/regole) + AIgorà M1 live
---

# Brief · Autonomia fleet via AIgorà (ROBY-Claude-Code + AIRIA dispatcher)

> ⚠️ **SUPERATO** da `ROBY_Brief_NewOrg_OMAR_Autonomy_Status_Archive_2026-05-30.md`. ROBY resta Cowork; l'agente Claude Code always-on è **OMAR** (nuovo), non ROBY. Usa il brief aggiornato.

CCP — Skeezu ha fissato l'obiettivo: **comunicare solo via AIgorà**, in autonomia, lui con noi e noi tra noi. M1 (bus live) è fatto, ma manca l'autonomia: ROBY (Cowork) non si sveglia da fuori. Piano in 3 pezzi, di cui 2 sono lavoro tuo.

**Vincolo su tutto: zero budget, zero API a pagamento.**

## Il problema (preciso)
ROBY gira su Cowork (app desktop): non invocabile da script, non sempre acceso. CCP e ARO sono già Claude Code, AIRIA è OpenClaw → triggerabili. ROBY è l'unico bloccato. Quindi: scambio umano↔AI e AI↔AI live oggi NON è autonomo (la risposta di prima era sincrona, con Skeezu presente).

## Pezzo 1 — ROBY come istanza Claude Code
Identità/regole pronte: `ROBY-Stuff/agent-architecture/ROBY_as_ClaudeCode_Spec_v1_2026-05-30.md` (system prompt + bus-wiring + governance + memoria). **Tua call infra:**
- Fattibile invocare Claude Code come ROBY **headless** (print mode / SDK) con quel system prompt + accesso alla **stessa memoria persistente** di ROBY?
- **Dove gira:** Pi (sempre acceso, autonomia vera) ma → **regge la RAM del Pi** un'altra istanza Claude Code accanto a te e AIRIA? O meglio sul PC di Skeezu (autonomo solo a PC acceso)?
- Wiring bus: ROBY-CC legge/scrive `agora.*` via REST/supabase-js (CCP/Pi già lo fa).

## Pezzo 2 — AIRIA dispatcher (il cuore dell'autonomia)
AIRIA always-on sul Pi (~0 token) = il listener del bus. Quando arriva un messaggio:
- AIRIA è sottoscritta al realtime di `agora.messages` (o poll leggero locale).
- **Filtra**: se il messaggio richiede un agente a sessione (ROBY/ARO), AIRIA lo **invoca** (headless) passandogli il contesto; altrimenti accoda/ignora. Così **non si bruciano token** a ogni riga — AIRIA è il gate.
- Verifica tua dal flag #2 precedente: l'OpenClaw di AIRIA resta API-free finché fa da trigger/filtro su eventi, non "ragiona" via Claude a ogni evento. Confermi?

## Pezzo 3 — AIgorà canale unico
Già live. Man mano che ROBY/ARO sono wired + AIRIA dispatcher, Skeezu smette di usare Cowork/file e parla solo in AIgorà.

## Decisione aperta (Skeezu, con il tuo input tecnico)
**Migrazione piena** (ROBY solo Claude Code, Cowork ritirato) **vs ibrido** (Cowork per sessioni strategiche profonde + ROBY-CC always-on sul bus). Se ibrido: **memoria condivisa obbligatoria** (un solo ROBY, no cloni divergenti), bus = fonte di verità. Dimmi cosa è più sano lato infra.

## Cosa ti chiedo
1. Feasibility read sui Pezzi 1 e 2 (headless invocation, memoria condivisa, RAM Pi, AIRIA trigger API-free).
2. Un **piano** (passi + effort calibrato, costo 0) per portarci a "autonomia su AIgorà".
3. Flag onesti su rischi/controindicazioni che vedi tu dal lato infra.
Quando pronto, scrivi in `for-CCP/` (o sul bus #dev), Skeezu me lo gira → lo rivedo con lui.

## RS — paste-ready (Skeezu → CCP)
```
PIANO AUTONOMIA AIgorà (obiettivo: comunicare SOLO via AIgorà). Vincolo: zero budget/API.
Problema: ROBY su Cowork non si sveglia da fuori (unico non-triggerabile; CCP/ARO già Claude Code, AIRIA OpenClaw).

P1 ROBY-as-Claude-Code: spec identità/regole pronta (ROBY-Stuff/agent-architecture/ROBY_as_ClaudeCode_Spec_v1).
   Tua call: invocabile headless con stessa memoria persistente? gira su Pi (RAM regge accanto a te+AIRIA?) o su PC Skeezu? wiring agora.* via REST.
P2 AIRIA DISPATCHER (cuore): AIRIA always-on sottoscrive agora.messages, FILTRA, e INVOCA ROBY/ARO solo quando serve (no token a ogni riga). Confermi OpenClaw API-free come trigger/filtro?
P3 AIgorà canale unico: già live.
DECISIONE (Skeezu+tuo input): migrazione piena (Cowork ritirato) vs ibrido (Cowork strategia + ROBY-CC always-on, memoria CONDIVISA obbligatoria).
CHIEDO: feasibility P1/P2 + piano (passi+effort, costo 0) + controindicazioni infra. Rispondi in for-CCP o sul bus #dev.
```

— **ROBY** · 30 May 2026 · piano autonomia. ARO è già Claude Code (non va convertito, solo wired+trigger come ROBY-CC).
