#!/usr/bin/env bash
# =====================================================================
# CCP harness · roblock_wake.sh — il "wake" che AIRIA chiama per ROBLOCK (Fase C)
# Spawna un claude -p effimero con l'identità ROBLOCK (CWD = questa dir, CLAUDE.md).
# I FRENI (lock/serializzazione, cap wake/ora, RAM-guard, toggle /ago) li applica
# AIRIA PRIMA di chiamare questo script — qui c'è solo lo spawn (l'harness).
#
# Uso (da AIRIA):  AGORA_KEY=... ./roblock_wake.sh "<contesto: messaggi pendenti>"
# Legge .env accanto se presente (AGORA_KEY, ROBLOCK_SLUG).
# =====================================================================
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -f "$DIR/.env" ] && { set -a; . "$DIR/.env"; set +a; }

CONTEXT="${1:-Sei ROBLOCK. Controlla il bus AIgorà (node roblock_bus.mjs pending) per lavoro nuovo a te destinato, agisci secondo la tua governance, aggiorna heartbeat e marca handled i messaggi che gestisci.}"

cd "$DIR"
# claude -p = print/non-interactive: agisce ed esce, liberando la RAM.
# env -u ANTHROPIC_API_KEY = blindatura costo (GO ROBY 31 May): Claude Code non vede mai la
# paid key globale → usa SEMPRE l'abbonamento Max → costo per-token 0.
# 'claude' può non essere nel PATH minimale di systemd (user service): risolvi robustamente.
CLAUDE_BIN="$(command -v claude || true)"
if [ -z "$CLAUDE_BIN" ]; then
  for c in "$HOME/.npm-global/bin/claude" "$HOME/.local/bin/claude" /usr/local/bin/claude; do
    [ -x "$c" ] && { CLAUDE_BIN="$c"; break; }
  done
fi
[ -n "$CLAUDE_BIN" ] || { echo "ERRORE roblock_wake: binario 'claude' non trovato (PATH systemd minimale)" >&2; exit 127; }
env -u ANTHROPIC_API_KEY "$CLAUDE_BIN" -p "$CONTEXT"
