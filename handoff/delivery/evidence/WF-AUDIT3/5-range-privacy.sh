#!/usr/bin/env bash
# WF-AUDIT3: read-only privacy scans with the freeze-commit rules, in scratch clones outside Dropbox.
# Usage: bash 5-range-privacy.sh <project-dir> <scratch-dir> <freeze-sha> <base-sha>... [-- <uncommitted-path>...]
#   For each base: clone, check out the base, stage the freeze tree on top (`git checkout <freeze> -- .`) and run
#   the freeze commit's scripts/precommit-check.mjs on that staged range. After `--`: copy the listed uncommitted
#   files from the checkout into a clone of the freeze commit, stage them and run the gate (pre-accept check).
#   Per-process safe.directory override; each clone is deleted. The real checkout and its index are untouched.
set -u
export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0='*'
PROJECT=$1 SCRATCH=$2 FREEZE=$3; shift 3
CLONE=$SCRATCH/wfa3-scan
summary() { # count blocking findings per rule and per file
  grep -E '^(BLOCK|WARN) ' | awk '{print $2, $3}' | sed -E 's/:\+[0-9]+$//' | sort | uniq -c
}
bases=()
while [ $# -gt 0 ] && [ "$1" != "--" ]; do bases+=("$1"); shift; done
[ "${1:-}" = "--" ] && shift
for base in "${bases[@]}"; do
  rm -rf "$CLONE"; git clone -q --no-hardlinks "$PROJECT" "$CLONE" || exit 2
  ( cd "$CLONE" && git checkout -q --detach "$base" && git checkout -q "$FREEZE" -- . &&
    echo "COMMAND: node scripts/precommit-check.mjs  # staged range $base..$FREEZE ($(git diff --cached --name-only | wc -l) files)" &&
    out=$(node scripts/precommit-check.mjs 2>&1); code=$?; printf '%s\n' "$out" | tail -1; echo "EXIT: $code";
    echo "findings per rule and file:"; printf '%s\n' "$out" | summary )
  rm -rf "$CLONE"; [ -e "$CLONE" ] && echo "scan clone not deleted" || echo "scan clone deleted"
  echo
done
if [ $# -gt 0 ]; then
  rm -rf "$CLONE"; git clone -q --no-hardlinks "$PROJECT" "$CLONE" || exit 2
  for path in "$@"; do mkdir -p "$CLONE/$(dirname "$path")"; cp -r "$PROJECT/$path" "$CLONE/$(dirname "$path")/"; done
  ( cd "$CLONE" && git add -f -- "$@" &&
    echo "COMMAND: node scripts/precommit-check.mjs  # uncommitted files ($(git diff --cached --name-only | wc -l) staged in the clone)" &&
    out=$(node scripts/precommit-check.mjs 2>&1); code=$?; printf '%s\n' "$out" | tail -1; echo "EXIT: $code";
    echo "findings per rule and file:"; printf '%s\n' "$out" | summary;
    echo "COMMAND: git diff --cached --check"; git diff --cached --check; echo "EXIT: $?" )
  rm -rf "$CLONE"; [ -e "$CLONE" ] && echo "scan clone not deleted" || echo "scan clone deleted"
fi
