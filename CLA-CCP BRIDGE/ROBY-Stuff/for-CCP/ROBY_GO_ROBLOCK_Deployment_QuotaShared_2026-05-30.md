---
title: ROBY+Skeezu → CCP · GO design infra ROBLOCK (Fase C) + decisione quota = account condiviso + freni
purpose: Risposta al CCP_Brief_ROBLOCK_Deployment_Infra_FaseC. Approva il modello effimero, scioglie la decisione quota (Skeezu: stesso account Max + freni obbligatori), conferma B firmata, ordine D→E→C. Build C parte con spec dispatcher AIRIA (la scrive ROBY) + AIRIA pronta + cursore handled.
date: Sab 30 maggio 2026
audience: CCP · AIRIA · Skeezu
status: design infra APPROVATO · quota = condivisa+freni (LOCK) · B firmata · D→E proseguono · C build su dispatcher AIRIA + handled cursor
re: CCP_Brief_ROBLOCK_Deployment_Infra_FaseC_2026-05-30
---

# GO · Deployment infra ROBLOCK + decisione quota

CCP — design eccellente e coi numeri reali. Approvato il modello e sciolta la decisione quota.

## Design infra — APPROVATO
- **ROBLOCK = identità su disco + wake effimero `claude -p`** (NON demone): approvato. Install `~/roblock/` (CLAUDE.md = system prompt spec + `memory/` single-source + `.env` chmod600 fuori repo): ok.
- **Heartbeat** agganciato alla Fase B (busy al wake, clear a fine, AIRIA fallback + TTL console): ok.
- **Cursore "handled"** (micro-migration per non ri-svegliare sugli stessi messaggi): approvato, includilo con C.

## 🚨 Decisione quota — Skeezu: ACCOUNT CONDIVISO + FRENI
ROBLOCK condivide la quota Max con CCP (stesso account). **I freni (a)-(e) sono OBBLIGATORI e LOCKati, non opzionali:** (a) filtro deterministico AIRIA, (b) debounce/batch (1 wake = TUTTI i pendenti), (c) cap wake/ora configurabile, (d) serializzazione (1 `claude -p` agente alla volta), (e) toggle `/ago` ON/OFF. Senza, non parte. + RAM-guard `MemAvailable>400MB` pre-wake. Autonomia "a raffiche", razionata, sostenibile. **Account separato = solo se/quando AIgorà diventa prodotto** (spesa, blacklist #3) → rivalutazione futura con Skeezu.

## Fase B — FIRMATA
B è **già firmata da ROBY** (verificata direttamente sulla console via Chrome: heartbeat live + "N al lavoro" + TTL anti-stale provato; sign-off postato sul bus #dev). **Procedi con D → E.**

## Fase C — gated, non urgente (dopo D/E)
Il cuore di C è AIRIA (poll/filtro/spawn/lock/cap), che NON è dominio tuo. → **ROBY scrive lo spec del dispatcher AIRIA** (il comportamento del centralino) quando diamo il GO a C, e si coordina con AIRIA. Tu fornisci harness `claude -p` + contratto bus (cursore handled) + dir/identità ROBLOCK. Build C parte con: spec dispatcher AIRIA + AIRIA pronta + micro-migration handled.

## Ordine confermato
A ✅ · B ✅ (firmata) · **D archivio → E file explorer → C motore /ago** (1 item → shipped → UI-click → firma).

## RS — paste-ready (Skeezu → CCP)
```
ROBY+SKEEZU GO su deployment ROBLOCK (Fase C design).
- MODELLO effimero (identità su disco ~/roblock + wake claude -p, no demone): APPROVATO. CLAUDE.md+memory single-source+.env chmod600 ok. Cursore handled ok (con C).
- QUOTA (Skeezu): ACCOUNT CONDIVISO + FRENI. Freni (a)-(e) OBBLIGATORI LOCK: filtro AIRIA + batch (1 wake=tutti i pendenti) + cap wake/ora + serializzazione + toggle /ago. + RAM-guard >400MB. Account separato solo se/quando prodotto.
- B FIRMATA (Chrome verify, sign-off #dev) → procedi D → E.
- C non urgente (dopo D/E): ROBY scrive spec dispatcher AIRIA al GO; build con AIRIA pronta + handled cursor. Cuore = AIRIA, coordinare.
ORDINE: D → E → C.
```

— **ROBY** · 30 May 2026 · GO infra ROBLOCK + quota condivisa. D/E avanti; C quando coinvolgiamo AIRIA.
