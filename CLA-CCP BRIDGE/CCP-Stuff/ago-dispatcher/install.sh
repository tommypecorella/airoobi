#!/usr/bin/env bash
# install.sh — installa il dispatcher /ago come servizio di SISTEMA (systemd user) sul Pi.
# Idempotente. NON tocca .env esistente. Gate di sicurezza restano (default OFF + dry-run).
set -euo pipefail
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${AGO_DEST:-$HOME/ago-dispatcher}"
UNITS="$HOME/.config/systemd/user"

echo "→ installo in $DEST"
mkdir -p "$DEST/state" "$UNITS"
for f in ago_bus.mjs ago_dispatcher.sh agoctl.sh README.md .env.example; do cp -f "$SRC/$f" "$DEST/"; done
chmod +x "$DEST/ago_dispatcher.sh" "$DEST/agoctl.sh"
[ -f "$DEST/.env" ] || { cp "$SRC/.env.example" "$DEST/.env"; chmod 600 "$DEST/.env"; echo "  creato $DEST/.env (chmod 600) — INCOLLA la anon key agora"; }
echo OFF > "$DEST/state/ago.state"   # default OFF

cp -f "$SRC/ago-dispatcher.service" "$SRC/ago-dispatcher.timer" "$UNITS/"
systemctl --user daemon-reload
systemctl --user enable --now ago-dispatcher.timer
echo
echo "✓ timer attivo (tick ~15s). Stato: $(systemctl --user is-active ago-dispatcher.timer)"
echo "  Gate: /ago = OFF, dry_run = 1 → NESSUNO spawn finché non apri entrambi."
echo
echo "PROSSIMI PASSI:"
echo "  1) nano $DEST/.env        # incolla AGORA_KEY"
echo "  2) $DEST/agoctl.sh on      # accende il loop (in dry-run logga soltanto)"
echo "  3) journalctl --user -u ago-dispatcher.service -f   # osserva il routing (zero costo)"
echo "  4) quando convinto:  $DEST/agoctl.sh live && $DEST/agoctl.sh on   # spawn reale"
