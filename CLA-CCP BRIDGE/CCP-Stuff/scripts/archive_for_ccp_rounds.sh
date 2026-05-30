#!/usr/bin/env bash
# =====================================================================
# CCP · archive_for_ccp_rounds.sh — folder-tree cleanup (LB-7/AIgorà brief §3)
# PREPARED per ROBY GO 30 May 2026 — REVERSIBLE + BACKUP. NON eseguito.
# Blacklist #8 (spostamenti massivi): NON parte finché Skeezu non dà "vai".
#
# Default = DRY-RUN (mostra cosa farebbe, non muove nulla).
#   ./archive_for_ccp_rounds.sh            # dry-run
#   ./archive_for_ccp_rounds.sh --apply    # esegue: backup + move + undo manifest
#   ./archive_for_ccp_rounds.sh --undo     # ripristina dall'ultimo manifest
#
# Sicurezze:
#  - tar.gz di backup dell'intera for-CCP/ PRIMA di toccare nulla
#  - undo manifest (file→destinazione) per reverse 1:1
#  - NON archivia i file con la data ODIERNA (thread aperti restano flat)
#  - usa `git mv` se in repo git (storia preservata), altrimenti `mv`
#  - maxdepth 1: il watcher globba ROBY_*.md a maxdepth 1 → archiviare in
#    sottocartelle è SICURO (esce dal radar) e de-noise i ~26 falsi positivi
# =====================================================================
set -euo pipefail

BRIDGE="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"   # CLA-CCP BRIDGE/
SRC="$BRIDGE/ROBY-Stuff/for-CCP"
ARCHIVE="$SRC/_archive"
TODAY="$(date +%Y-%m-%d)"
STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP="$BRIDGE/CCP-Stuff/_backups/for-CCP_$STAMP.tar.gz"
MANIFEST="$BRIDGE/CCP-Stuff/_backups/undo_$STAMP.tsv"
LAST_MANIFEST="$BRIDGE/CCP-Stuff/_backups/undo_LAST.tsv"

MODE="${1:---dry-run}"

# bucket(filename) -> echoes destination bucket name, or nothing if not closeable
bucket() {
  case "$1" in
    *Sprint_W*)                 echo "sprints" ;;
    *GS1[0-9]*|*GS[1-9]_*|*_GS[1-9]*) echo "golden-session" ;;
    *LB[3-7]_*|*_LB[3-7]*)      echo "lb-sweeps" ;;
    *Round[0-9]*)               echo "rounds" ;;
    *Closure*)                  echo "closure" ;;
    *Brand*)                    echo "brand" ;;
    *Tokenomics*|*_T0_*)        echo "tokenomics" ;;
    *)                          echo "" ;;
  esac
}

do_undo() {
  [ -f "$LAST_MANIFEST" ] || { echo "no undo manifest found"; exit 1; }
  echo "Undo from $LAST_MANIFEST"
  while IFS=$'\t' read -r from to; do
    [ -f "$to" ] && mv "$to" "$from" && echo "restored $(basename "$from")"
  done < "$LAST_MANIFEST"
  echo "Undo complete."
  exit 0
}

[ "$MODE" = "--undo" ] && do_undo

echo "BRIDGE   = $BRIDGE"
echo "SRC      = $SRC"
echo "MODE     = $MODE   (today=$TODAY kept flat)"
echo "-------------------------------------------------------------"

declare -i n=0 skip_today=0
PLAN=()
while IFS= read -r -d '' f; do
  base="$(basename "$f")"
  case "$base" in *"$TODAY"*) skip_today+=1; continue ;; esac   # keep today's open threads flat
  b="$(bucket "$base")"
  [ -z "$b" ] && continue
  PLAN+=("$f"$'\t'"$ARCHIVE/$b/$base")
  n+=1
done < <(find "$SRC" -maxdepth 1 -type f -name '*.md' -print0 2>/dev/null)

echo "would archive: $n files   (skipped today: $skip_today)   buckets under $ARCHIVE/"
printf '%s\n' "${PLAN[@]}" | awk -F'\t' '{split($2,a,"/_archive/"); split(a[2],b,"/"); print "  ["b[1]"]  "substr($1,length("'"$SRC"'/")+1)}' | sort | head -40
[ "$n" -gt 40 ] && echo "  ... (+$((n-40)) more)"

if [ "$MODE" != "--apply" ]; then
  echo "-------------------------------------------------------------"
  echo "DRY-RUN. Nothing moved. Re-run with --apply (after Skeezu 'vai')."
  exit 0
fi

# ---- APPLY (only reached with explicit --apply) ----
mkdir -p "$(dirname "$BACKUP")"
echo "backup → $BACKUP"
tar -czf "$BACKUP" -C "$(dirname "$SRC")" "$(basename "$SRC")"
: > "$MANIFEST"
for entry in "${PLAN[@]}"; do
  from="${entry%%$'\t'*}"; to="${entry##*$'\t'}"
  mkdir -p "$(dirname "$to")"
  if git -C "$BRIDGE" rev-parse >/dev/null 2>&1; then git -C "$BRIDGE" mv "$from" "$to" 2>/dev/null || mv "$from" "$to"; else mv "$from" "$to"; fi
  printf '%s\t%s\n' "$from" "$to" >> "$MANIFEST"
done
cp "$MANIFEST" "$LAST_MANIFEST"
echo "moved $n files. backup=$BACKUP  undo=$LAST_MANIFEST"
echo "reverse anytime: ./archive_for_ccp_rounds.sh --undo"
