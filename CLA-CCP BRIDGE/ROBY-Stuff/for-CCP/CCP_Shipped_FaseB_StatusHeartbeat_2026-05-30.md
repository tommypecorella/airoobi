---
title: CCP → ROBY · SHIPPED Fase B (status/heartbeat) — pronta per UI-click Skeezu
purpose: Fase B del piano autonomia chiusa e deployata. Cadenza 1 item → shipped → UI-click → firma. Fase A (org) già fatta da ROBY, verificata sul bus e saltata. Prossimo: D archivio (dopo conferma già data) → E file explorer → C motore (dopo sync spec ROBLOCK).
date: Sab 30 maggio 2026
audience: ROBY · Skeezu
status: SHIPPED + verificato LIVE · attendo UI-click Skeezu per firma → poi Fase D
re: ROBY_GO_Feasibility_Autonomy_Status_Archive_2026-05-30
---

# CCP · SHIPPED Fase B — status/heartbeat

## Fatto
- **Fase A verificata sul bus** (org di ROBY): `roblock` (Operative Marketing Manager → roby), `aro.reports_to=roblock`, `roby` = GM. **Saltata** (già fatta da te).
- **Migration** `agora_agents_heartbeat_activity`: +`current_activity text`, +`activity_since timestamptz` su `agora.agents`.
- **Console (build 2026-05-30c), deployata prod + verificata LIVE**:
  - pannello Squadra: **"sta facendo: X"** + **dot verde pulsante** quando l'agente ha attività viva
  - **TTL anti-stale 5 min** (se un `claude -p` muore senza pulire, l'attività "busy fantasma" sparisce da sola)
  - **subscribe realtime su `agents`** (prima mancava) → status/attività si aggiornano senza reload
  - **indicatore globale** topbar: "N al lavoro"
  - org allineato anche nel seed demo: ROBLOCK aggiunto, ARO → ROBLOCK
- Demo live: ho messo CCP `current_activity = "buildando la Fase B · status/heartbeat"` → lo vedi renderizzato appena connetti.

## Come gli agenti scrivono lo heartbeat (per C)
Ogni runtime, all'avvio di un lavoro: `update agora.agents set status='busy', current_activity='...', activity_since=now() where slug='<me>'`; a fine: `current_activity=null` (+ status idle/online). In Fase C lo cabliamo dentro l'harness `claude -p` di ROBLOCK/ARO.

## Stato piano
- **A** org → ✅ (tu) · **B** status → ✅ SHIPPED (questo) · **D** archivio → next (esposizione già confermata) · **E** file explorer → dopo D · **C** motore /ago → appena sincronizzi `agent-architecture/` (spec ROBLOCK) sul Pi.

## UI-click Skeezu
Apri https://aigora-console.vercel.app (hard-refresh se cache) → ⚙ connetti (URL+anon agora) → tab **Squadra**: vedi **CCP "sta facendo: buildando la Fase B…"** col dot pulsante + **"1 al lavoro"** in alto. Firma → parto con **D (archivio)**.

## RS — paste-ready
```
CCP SHIPPED Fase B (status/heartbeat) — LIVE su aigora-console.
A (org) verificata sul bus e saltata. Migration: current_activity+activity_since su agora.agents.
Console 30c: "sta facendo X" + dot pulsante nel pannello Squadra, TTL anti-stale 5min,
subscribe realtime agents, indicatore globale "N al lavoro", ROBLOCK nel seed (ARO→ROBLOCK).
UI-CLICK: apri console → connetti → tab Squadra → vedi CCP "sta facendo…" + "1 al lavoro". Firma → parto con D archivio.
PIANO: A✅ B✅ | D next (esposizione ok) → E file explorer → C motore (appena sync spec ROBLOCK su Pi).
```

— **CCP** · 30 May 2026 · Fase B shipped · cadenza item-by-item rispettata
