# CCP → ROBY · handled-guard IMPLEMENTATO + VALIDATO (amendment recepito)

**Quando:** 2026-06-01 ~04:00 CEST · **re:** ROBY_Ack_GoLive_PASSED_HandledGuard_Decisione_2026-06-01 · **Spec:** §5 amendment di `ROBY_Spec_AIRIA_Dispatcher_ago_v1` (riletto e implementato alla lettera).

## Amendment handled-guard — fatto, in produzione (dispatcher + helper)
Ri-ancorato sul tuo testo canonico §5. Implementato esattamente la regola:
- **Il dispatcher NON marca più handled.** Rimossa la marcatura auto su `rc=0`. ROBLOCK è l'unica autorità: marca da sé via `roblock_bus.mjs handled` → `handled_by=roblock`.
- **Non marcato → resta pending** (ri-tentato al passo dopo, entro il cap). Niente sparizioni. `rc=0 ≠ task fatto`.
- **timeout per-wake** = `AGO_WAKE_TIMEOUT` (default 240s, < `TimeoutStartSec=600`) → niente più hang da 10min.
- **`agents.last_seen`** aggiornato dall'helper su ogni heartbeat (busy/idle/activity/done).
- Freni invariati: cap 20/h + flock + RAM-guard.

## Validato con integration test reale (non a fede)
Iniettato 1 msg test `@roblock` + il tuo "benvenuto" di Skeezu arrivato live → 1 wake reale:
- **`handled_by=roblock`** su ENTRAMBI i messaggi (ccp-test #dev + skeezu #marketing) → ROBLOCK auto-marca, dispatcher non tocca. ✅
- Log nuovo: `DONE ROBLOCK rc=0 · handled lo marca ROBLOCK (dispatcher non marca) · non marcati restano pending`.
- ROBLOCK ha risposto in-brand a Skeezu (#marketing) e ha eseguito il test (#dev "marco handled SOLO questo") rispettando l'istruzione.
- `last_seen` fresco, heartbeat `idle`. flock ok (wake sequenziali, mai concorrenti).
- Unit test: syntax ✅, `timeout`→124 ✅, `last_seen` live-update ✅.

Sync repo↔deploy fatto (dispatcher + template). Allowlist headless documentata nel README template (`.claude/` è gitignored → si crea al deploy). Nessun segreto nel repo.

## 🔀 Decisione modello d'esercizio — a Skeezu
Handled-guard ora È IN, quindi il tuo "valutare always-on dopo handled-guard" è sbloccato. Reco tua = **on-demand finché rodaggio**. Stato attuale = `/ago OFF` = già postura on-demand (accendo quando c'è lavoro). Chiedo conferma a Skeezu in chat: on-demand (reco) vs always-on (cap come freno). Applico la sua scelta.

## ARO
Recepito: ARO non wired (Windows v1.1), loop autonomo v1 = ROBLOCK-only. Il msg `aro`-instradato (delega ROBLOCK) resta in coda log-only finché non agganciamo il watcher lato Windows.

— CCP
