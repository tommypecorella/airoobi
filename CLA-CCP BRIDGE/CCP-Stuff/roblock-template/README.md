# ROBLOCK harness (Fase C, CCP-side) — deploy + contratto bus

Pezzi che la **spec dispatcher AIRIA** (`ROBY_Spec_AIRIA_Dispatcher_ago_v1`) assegna a CCP:
harness `claude -p` + dir/identità `~/roblock/` + cursore handled + contratto bus.
Questo template è quel pezzo. **AIRIA** ci costruisce sopra il loop/freni (suo dominio).

## Deploy sul Pi (a GO build C)
```bash
cp -r roblock-template ~/roblock
cd ~/roblock
cp .env.example .env && chmod 600 .env     # incolla la anon key agora in .env
# test contratto bus (senza AIRIA):
node roblock_bus.mjs pending                 # vede i messaggi non gestiti
./roblock_wake.sh "test: presentati in #marketing"   # spawn effimero ROBLOCK
```
`.env` (con la key) NON va committato. Il binario `claude` è già sul Pi (v2.1.158, `-p` ok).

## Contratto bus (agora.*) — cosa usano ROBLOCK e AIRIA
- **Cursore handled** (migration applicata): `agora.messages.handled_at` / `handled_by`.
  Pendenti = `handled_at IS NULL`. Dopo il wake si marcano handled (`roblock_bus.mjs handled <id...>`).
- **Heartbeat** (Fase B): `agora.agents.status` + `current_activity` + `activity_since`
  (`roblock_bus.mjs activity "<x>"` allo start, `done` a fine). AIRIA fa il fallback alla morte del processo.
- **Helper** `roblock_bus.mjs`: `pending | post <canale> <testo> | activity <testo> | done | handled <id...>`.
- **Wake** `roblock_wake.sh "<contesto>"`: spawna `claude -p` con CWD=dir (CLAUDE.md = identità ROBLOCK).

## Cosa implementa AIRIA (NON in questo template — suo dominio)
Loop ~10s (toggle `/ago` ON/OFF) → poll `pending` → **filtro deterministico** (mention/canale, non-self, non-handled) → per agente con pendenti applica i **freni LOCK**: cap wake/ora, serializzazione (1 wake/volta), RAM-guard (`MemAvailable>~400MB`) → chiama `roblock_wake.sh` con TUTTI i pendenti in batch → marca handled + heartbeat-fallback.

## Routing (spec §8) — raccomandazione CCP
- **ROBLOCK** è Pi-local → AIRIA lo spawna direttamente. ✅ v1.
- **ARO** è su Windows (off-Pi) → AIRIA non spawna processi su un'altra macchina. **Raccomando v1 = solo ROBLOCK**; ARO riceve task da ROBLOCK sul bus e per l'autonomia piena serve un watcher equivalente lato Windows (v1.1, da decidere con AIRIA). Non blocca il v1.
