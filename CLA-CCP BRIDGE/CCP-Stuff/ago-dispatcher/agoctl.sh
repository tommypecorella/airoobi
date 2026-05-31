#!/usr/bin/env bash
# agoctl — interruttore /ago + stato. Toggle = file locale (spec §1, default OFF).
#   agoctl on        # accende il loop (ma se DRY_RUN=1 logga soltanto)
#   agoctl off       # spegne (costo zero assoluto)
#   agoctl status    # stato toggle + dry-run + cap usati nell'ultima ora
#   agoctl live      # disattiva dry-run NEL .env (spawn reale) — gate finale, chiede conferma
#   agoctl dry       # riattiva dry-run
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -f "$DIR/.env" ] && { set -a; . "$DIR/.env"; set +a; }
STATE_DIR="${AGO_STATE_DIR:-$DIR/state}"; mkdir -p "$STATE_DIR"
TOGGLE_FILE="${AGO_TOGGLE_FILE:-$STATE_DIR/ago.state}"
WAKE_LOG="${AGO_WAKE_LOG:-$STATE_DIR/wakes.log}"
ENV_FILE="$DIR/.env"

case "${1:-status}" in
  on)  echo ON  > "$TOGGLE_FILE"; echo "/ago = ON  (dry_run=${AGO_DRY_RUN:-1})";;
  off) echo OFF > "$TOGGLE_FILE"; echo "/ago = OFF";;
  status)
    s=OFF; [ -f "$TOGGLE_FILE" ] && s="$(cat "$TOGGLE_FILE")"
    now=$(date +%s); used=0; [ -f "$WAKE_LOG" ] && used="$(awk -v c=$((now-3600)) '$1>=c{k++}END{print k+0}' "$WAKE_LOG")"
    echo "toggle   : $s"
    echo "dry_run  : ${AGO_DRY_RUN:-1}  (1=logga, 0=spawn reale)"
    echo "wakes/1h : $used / ${AGO_WAKE_CAP_PER_HOUR:-20}"
    ;;
  live)
    [ -f "$ENV_FILE" ] || { echo "manca $ENV_FILE"; exit 1; }
    read -r -p "Confermi spawn REALE di claude -p (consuma quota Max condivisa)? [scrivi GOLIVE] " a
    [ "$a" = "GOLIVE" ] || { echo "annullato"; exit 1; }
    if grep -q '^AGO_DRY_RUN=' "$ENV_FILE"; then sed -i 's/^AGO_DRY_RUN=.*/AGO_DRY_RUN=0/' "$ENV_FILE"; else echo 'AGO_DRY_RUN=0' >> "$ENV_FILE"; fi
    echo "dry_run = 0 → spawn reale attivo (ricorda: agoctl on)";;
  dry)
    [ -f "$ENV_FILE" ] || { echo "manca $ENV_FILE"; exit 1; }
    if grep -q '^AGO_DRY_RUN=' "$ENV_FILE"; then sed -i 's/^AGO_DRY_RUN=.*/AGO_DRY_RUN=1/' "$ENV_FILE"; else echo 'AGO_DRY_RUN=1' >> "$ENV_FILE"; fi
    echo "dry_run = 1 → logga soltanto";;
  *) echo "uso: agoctl <on|off|status|live|dry>"; exit 1;;
esac
