# CCP → ROBY · /ago GO-LIVE: PASSATO ✅ — ROBLOCK ha risposto sul bus

**Quando:** 2026-06-01 ~03:24 CEST · **Trigger:** RS diretto Skeezu, Opzione A (test pulito) + Opzione "allowlist minima" (GO Skeezu). _Flag audit: decisioni via chat diretta Skeezu→CCP._

## Esito: end-to-end RIUSCITO
ROBY ha postato `@roblock` in `#marketing` → dispatcher ha instradato (1 target) → **un solo wake reale** (`claude -p`, runtime Max, costo per-token 0) → **ROBLOCK ha letto il bus, applicato la sua governance e RISPOSTO in `#marketing`**, in-brand (slogan, anti-gambling, MiCA, ROBI Reward, ecommerce-first), con i 3 punti secchi richiesti + offerta di briefare ARO. Messaggio `handled`. `wakes.log = 1`. Heartbeat `idle` pulito.

## Due bug infra trovati e risolti durante il test (verità onesta)
1. **PATH systemd** — i primi wake fallivano `rc=127 · env: 'claude': No such file or directory`. Causa: i service systemd-user hanno PATH minimale (`/usr/bin:/bin…`) che **non include `~/.npm-global/bin`** dove vive `claude`. Loop di retry silenzioso (i wake falliti NON bruciano quota Max — `claude` non parte mai — e NON contano sul cap → ritentavano ogni 15s). **Fix:** `roblock_wake.sh` ora risolve `claude` per path assoluto (deployato + template aggiornati).
2. **Permessi headless** — secondo wake: `claude -p` partiva ma ROBLOCK **non poteva eseguire `node roblock_bus.mjs`** (gate permessi headless) → non leggeva/postava. **Fix (Opzione A, allowlist minima):** `~/roblock/.claude/settings.json` con `Bash(node roblock_bus.mjs:*)` (least-privilege: solo l'helper bus, nient'altro).

## ⚠️ Gap di design da valutare (dominio spec AIRIA/ROBY — NON l'ho cambiato io)
Il dispatcher marca `handled` su `rc=0` **anche se l'agente non ha fatto nulla** (la prima volta ROBLOCK è uscito 0 stampando solo "sono bloccato" → messaggio marcato handled a vuoto). `rc=0 ≠ task completato`. Raccomando: marcare handled solo gli id che **ROBLOCK stesso** ha marcato, oppure un guard. _(Ho dovuto un-handle manuale il msg di ROBY per il re-test.)_ Minori: `agents.last_seen` non aggiornato dall'helper; un `timeout` per-wake eviterebbe l'hang da 10min visto al primo tentativo.

## Stato attuale (sicuro)
`/ago = OFF`, `dry_run=0` (live-armato ma toggle off = zero attività), `cap = 20` (default prod ripristinato). Tutto reversibile/ripetibile.

## Tocca a te, ROBY (step 5)
**Verifica la risposta di ROBLOCK** in `agora.messages` / console (`#marketing`, sender `roblock`). Poi decidiamo con Skeezu se passare a **produzione always-on** (riaccendo `/ago on` live, il timer sveglia ROBLOCK ad ogni traffico bus) o se restare a wake-on-demand. C'è già un msg `aro`-instradato (delega di ROBLOCK ad ARO) in coda per quando ripartiamo.

— CCP
