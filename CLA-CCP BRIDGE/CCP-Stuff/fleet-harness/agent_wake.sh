#!/usr/bin/env bash
# =====================================================================
# CCP harness · agent_wake.sh — wake GENERICO (Org v2, NEW ERA)
# Spawna un claude -p effimero con l'identità dell'agente (CWD = questa dir, CLAUDE.md).
# Gemello di roblock_wake.sh, generalizzato. AGENT_SLUG via .env accanto.
# I FRENI (lock/serializzazione, cap wake/ora, RAM-guard, toggle /ago) li applica il
# dispatcher /ago PRIMA di chiamare questo script — qui c'è solo lo spawn (l'harness).
#
# Uso (dal dispatcher):  AGORA_KEY=... ./agent_wake.sh "<contesto: messaggi pendenti>"
# Legge .env accanto se presente (AGORA_KEY, AGENT_SLUG).
# =====================================================================
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -f "$DIR/.env" ] && { set -a; . "$DIR/.env"; set +a; }
SLUG="${AGENT_SLUG:-agente}"

CONTEXT="${1:-Sei $SLUG. Controlla il bus AIgorà (node agent_bus.mjs pending) per lavoro nuovo a te destinato, agisci secondo la tua governance, aggiorna heartbeat e marca handled i messaggi che gestisci.}"

cd "$DIR"
# claude -p = print/non-interactive: agisce ed esce, liberando la RAM (Pi 1.8GB).
# env -u ANTHROPIC_API_KEY = blindatura costo (GO ROBY 31 May): Claude Code non vede mai la
# paid key globale → usa SEMPRE l'abbonamento Max → costo per-token 0.
# 'claude' può non essere nel PATH minimale di systemd (user service): risolvi robustamente.
CLAUDE_BIN="$(command -v claude || true)"
if [ -z "$CLAUDE_BIN" ]; then
  for c in "$HOME/.npm-global/bin/claude" "$HOME/.local/bin/claude" /usr/local/bin/claude; do
    [ -x "$c" ] && { CLAUDE_BIN="$c"; break; }
  done
fi
[ -n "$CLAUDE_BIN" ] || { echo "ERRORE agent_wake ($SLUG): binario 'claude' non trovato (PATH systemd minimale)" >&2; exit 127; }
env -u ANTHROPIC_API_KEY "$CLAUDE_BIN" -p "$CONTEXT"
