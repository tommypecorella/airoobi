# /ago dispatcher — il "centralino" cost-safe della fleet (Fase C)

Sveglia gli agenti a sessione (ROBLOCK in v1) quando sul bus AIgorà arriva lavoro per loro,
**senza prosciugare la quota Max condivisa**. Spec comportamento: ROBY
`ROBY_Spec_AIRIA_Dispatcher_ago_v1`. Harness/infra: CCP.

## Perché è cost-safe (il punto chiave)
- Il **loop è un servizio di SISTEMA in shell** (systemd user timer), **zero LLM**: poll REST su
  `agora.messages` + filtro a regole di stringa. Nessun token Claude per pollare/filtrare.
- **MAI un cron-agente di OpenClaw.** Verificato (CCP, 31 May): OpenClaw/AIRIA gira su **paid API key**
  → un cron-agente costerebbe a ogni giro. Il loop qui non tocca OpenClaw.
- Claude gira **solo** dentro l'agente svegliato, via **`env -u ANTHROPIC_API_KEY claude -p`** →
  runtime Claude Code/abbonamento **Max** → costo per-token **0** (blindato: Claude Code non vede
  mai la paid key). Resta il tetto **quota Max condivisa** → per questo i FRENI.

## I 6 freni (LOCK)
| # | freno | dove |
|---|-------|------|
| a | filtro deterministico (sveglia solo a lavoro reale) | `ago_bus.mjs route` §3 |
| b | batch: 1 wake = TUTTI i pendenti dell'agente | `ago_dispatcher.sh` |
| c | cap wake/ora (default 20) | `AGO_WAKE_CAP_PER_HOUR` |
| d | serializzazione: un solo `claude -p` alla volta | `flock` |
| e | RAM-guard (default >400MB liberi) | `AGO_RAM_MIN_MB` |
| f | toggle `/ago` ON/OFF (default OFF) | `agoctl on|off` |

**Due gate da aprire per spawnare davvero:** `/ago = ON` **e** `AGO_DRY_RUN = 0`.
Di default `/ago = OFF` e `dry_run = 1` (logga, non spawna) → costo zero finché non decidi tu.

## File
- `ago_dispatcher.sh` — un passo del loop (idempotente, sotto flock). Il timer lo richiama ~ogni 15s.
- `ago_bus.mjs` — contratto bus deterministico: `pending` · `route` · `busy/idle <slug>` · `handled <id...>`.
- `agoctl.sh` — interruttore: `on|off|status|live|dry`.
- `ago-dispatcher.{service,timer}` — systemd user (motore di sistema).
- `.env.example` — copia in `.env` (chmod 600), incolla la anon key agora. **Nessun segreto committato.**

## Install (sul Pi)
```bash
./install.sh                 # copia in ~/ago-dispatcher, installa+abilita il timer (gate chiusi)
nano ~/ago-dispatcher/.env   # incolla AGORA_KEY
~/ago-dispatcher/agoctl.sh on        # loop ON, ma dry-run → logga soltanto
journalctl --user -u ago-dispatcher.service -f   # osserva il routing a costo zero
# quando convinto del comportamento:
~/ago-dispatcher/agoctl.sh live && ~/ago-dispatcher/agoctl.sh on   # spawn reale (chiede conferma GOLIVE)
```

## Routing (§3) — chi viene svegliato
Un messaggio entra in coda di risveglio per l'agente X solo se: **menziona** X (`@x` o nome, word-boundary)
**oppure** è in un **canale di competenza** di X (`AGO_CH_*`); **e** non è `handled`; **e** non l'ha scritto X stesso.
Conservativo: nel dubbio NON sveglia. `system`/chiacchiere/umani → ignorati.
- **ROBLOCK** (Pi-local): svegliato via `~/roblock/roblock_wake.sh`. ✅ v1.
- **ARO** (Windows, off-Pi): instradato e **loggato**, non spawnabile dal Pi → lo aggancia il watcher locale di ARO (v2). §8.

## Cursore "handled" (anti ri-risveglio)
Migration già applicata su `airoobi-agora`: `agora.messages.handled_at` + `handled_by` (anon UPDATE ok).
Pendenti = `handled_at IS NULL`. Il dispatcher marca handled **solo dopo un wake andato a buon fine** (rc=0);
se `claude -p` fallisce, NON marca → retry al passo dopo. In dry-run non tocca il bus.

## Heartbeat (§7)
Allo spawn: `agents.status=busy` + `current_activity`. A fine processo: `idle` + clear (sempre, anche se l'agente
crasha). Seconda rete = TTL 5min della console. Niente "busy fantasma".
