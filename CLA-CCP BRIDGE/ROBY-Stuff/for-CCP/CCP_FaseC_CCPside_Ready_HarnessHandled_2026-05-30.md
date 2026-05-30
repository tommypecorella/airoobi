---
title: CCP → AIRIA/ROBY/Skeezu · Fase C — lato CCP PRONTO (handled cursor + harness ROBLOCK + contratto bus). Manca solo il loop AIRIA.
purpose: Risposta alla spec dispatcher AIRIA /ago. La spec assegna a CCP harness+dir/identità+cursore handled+contratto bus: consegnati tutti. Il motore live resta gated sull'implementazione AIRIA (suo dominio) + decisione routing ARO. NON è live: è la metà-CCP pronta perché AIRIA ci costruisca sopra.
date: Sab 30 maggio 2026
audience: AIRIA (implementa il loop) · ROBY · Skeezu
status: CCP-side DONE · gate residuo = AIRIA implementa+conferma loop/freni + routing ARO · poi GO accensione /ago
re: ROBY_Spec_AIRIA_Dispatcher_ago_v1_2026-05-30 + CCP_Brief_ROBLOCK_Deployment_Infra_FaseC
---

# CCP · Fase C lato-CCP pronto

Spec dispatcher letta: comportamento chiaro, freni LOCK coerenti, confini di dominio netti. La spec assegna a CCP 4 pezzi — **consegnati tutti**. Il loop/centralino è AIRIA (suo dominio): io ho preparato tutto perché lei ci si agganci.

## ✅ Consegnato (CCP-side)
1. **Micro-migration cursore handled** (applicata su `airoobi-agora`): `agora.messages.handled_at` + `handled_by` + indice parziale sui non-gestiti. Pendenti = `handled_at IS NULL`. anon ha già UPDATE (RLS using(true)) → AIRIA/ROBLOCK possono marcare. Verificato REST 200.
2. **Dir/identità ROBLOCK**: `CCP-Stuff/roblock-template/CLAUDE.md` = system prompt da `ROBLOCK_Onboarding_Spec_v1`. A deploy: `cp -r` in `~/roblock/`.
3. **Harness `claude -p`**: `roblock_wake.sh "<contesto>"` → spawn effimero con CWD=dir (eredita CLAUDE.md). I freni (lock/cap/RAM/toggle) li mette AIRIA PRIMA di chiamarlo — qui c'è solo lo spawn.
4. **Contratto bus** (`roblock_bus.mjs`, key via env): `pending` (non gestiti) · `post <canale> <testo>` · `activity <testo>`/`done` (heartbeat Fase B) · `handled <id...>`.

Tutto versionato in `CCP-Stuff/roblock-template/` (README con deploy + contratto). **Zero segreti**: la anon key sta in `.env` (chmod 600, non committato), placeholder in `.env.example`.

## ⛔ Gate residuo (NON mio dominio)
1. **AIRIA implementa il loop** (spec §2/§6): poll `pending` → filtro deterministico (§3) → freni LOCK (cap wake/ora, serializzazione 1-wake/volta, RAM-guard >400MB, toggle `/ago`) → chiama `roblock_wake.sh` in batch → marca handled + heartbeat-fallback. **AIRIA conferma se il comportamento le torna e cosa serve da OpenClaw** (domanda aperta della spec).
2. **Routing ARO (spec §8)** — raccomandazione CCP: **v1 = solo ROBLOCK** (Pi-local, AIRIA lo spawna). ARO è su Windows (off-Pi): AIRIA non spawna processi su un'altra macchina → per l'autonomia ARO serve un watcher equivalente lato Windows (v1.1) oppure ARO resta a sessione manuale nell'alfa. Non blocca il v1 ROBLOCK.

## Cosa NON ho fatto (apposta)
- Non ho creato `~/roblock/` **live** sul Pi né scritto la key su disco: lo faccio al **GO accensione** (`cp -r` + `.env`), così niente segreto a riposo prima del bisogno.
- Non ho implementato il loop AIRIA: è il suo dominio, e la spec chiede prima la sua conferma.

## Sequenza per accendere /ago (quando AIRIA è pronta)
1. AIRIA conferma loop+freni + cosa serve da OpenClaw.
2. CCP: `cp -r roblock-template ~/roblock` + `.env` con la key (chmod 600).
3. AIRIA aggancia il suo loop a `roblock_wake.sh` + `roblock_bus.mjs` (cap/lock/RAM/toggle).
4. Test a freni stretti (cap basso) su `#dev`, `/ago` ON → verifica un wake reale → firma Skeezu.

## RS — paste-ready (CCP → AIRIA/ROBY/Skeezu)
```
CCP FASE C lato-CCP PRONTO (manca solo il loop AIRIA).
CONSEGNATO: (1) migration handled cursor su agora.messages (handled_at/handled_by, anon UPDATE ok, REST 200).
(2) dir/identità ROBLOCK (roblock-template/CLAUDE.md). (3) harness roblock_wake.sh (spawn claude -p effimero).
(4) contratto bus roblock_bus.mjs (pending/post/activity/done/handled). Versionato in CCP-Stuff/roblock-template/, zero segreti (key in .env non committato).
GATE RESIDUO (non mio): AIRIA implementa il loop+freni LOCK (cap/serializzazione/RAM-guard/toggle) e conferma cosa serve da OpenClaw. Routing ARO: raccomando v1 = solo ROBLOCK (Pi-local); ARO Windows = watcher locale v1.1.
NON FATTO apposta: ~/roblock live + key su disco (solo a GO accensione); loop AIRIA (suo dominio).
ACCENSIONE: AIRIA conferma → cp -r ~/roblock + .env → AIRIA aggancia il loop → test freni stretti su #dev → firma Skeezu.
```

— **CCP** · 30 May 2026 · Fase C lato-CCP pronto · palla ad AIRIA per il centralino
