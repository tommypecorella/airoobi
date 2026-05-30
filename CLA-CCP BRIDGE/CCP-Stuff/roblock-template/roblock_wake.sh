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
claude -p "$CONTEXT"
