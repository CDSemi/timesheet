#!/usr/bin/env bash
# WF-AUDIT2 staged-set probes for scripts/precommit-check.mjs in a scratch clone at the freeze commit.
# Usage: bash 5-precommit-probes.sh <scratch-clone-dir>
# Requires Node 24 first on PATH and the per-process safe.directory override in the environment.
# Each probe stages exactly one synthetic change, runs the check, records the exit and unstages/deletes it.
# Synthetic account names only; the real account probe prints the exit code, never the detail line.
set -u
cd "$1" || exit 2
# The synthetic account and addresses are assembled at run time so that this file itself passes the privacy check.
ACC="ali""cew"; AT="@"
total=0; bad=0
probe() { # name expected_exit path content [mode]
  local name=$1 expected=$2 path=$3 content=$4 mode=${5:-new}
  mkdir -p "$(dirname "$path")"
  if [ "$mode" = append ]; then printf '%s\n' "$content" >> "$path"; else printf '%s\n' "$content" > "$path"; fi
  git add -f -- "$path"
  local out; out=$(node scripts/precommit-check.mjs 2>&1); local code=$?
  if [ "$mode" = append ]; then git restore --staged --worktree -- "$path"; else git rm -q --cached -f -- "$path"; rm -f -- "$path"; fi
  total=$((total+1))
  local verdict=ok; [ "$code" = "$expected" ] || { verdict=BAD; bad=$((bad+1)); }
  if [ "${QUIET_DETAIL:-0}" = 1 ]; then out=$(printf '%s\n' "$out" | tail -1); fi
  printf '%s | %s | expected exit %s | got %s | %s\n' "$verdict" "$name" "$expected" "$code" "$(printf '%s' "$out" | tr '\n' ' ')"
}
echo "# original WF-A-03 probes (must block)"
probe "P1 unquoted YAML SMTP_PASSWORD" 1 config/app.yml 'SMTP_PASSWORD: Zq81probeKx'
probe "P2 unquoted YAML api_token" 1 config/app.yml 'api_token: Zq81probeKx'
probe "P3 signature PNG under evidence" 1 handoff/delivery/evidence/WP3/employee-signature.png 'PNGDATA'
probe "P4 PDF under evidence" 1 handoff/delivery/evidence/WP3/timesheet.pdf '%PDF-1.7 synthetic body'
probe "P5 POSIX drive profile path" 1 notes.md "log at /c/Users/${ACC}/project/out.txt"
echo "# own probes"
probe "P6 Windows profile path" 1 notes.md "C:\\Users\\${ACC}\\AppData\\Local"
probe "P7 YAML list-item secret" 1 deploy/compose.yml '  - password: Zq81probeKx'
probe "P8 long letters-only secret (12+)" 1 config/app.yml 'client_secret: abcdefghijklmnop'
probe "P9 profile path inside TypeScript source" 1 src/server/probeHome.ts "const cache = '/home/${ACC}/.cache';"
probe "P10 non-attribution address at anthropic.com" 1 notes.md "contact support${AT}anthropic.com"
probe "P11 attribution address with extra domain suffix" 1 notes.md "reply noreply${AT}anthropic.com.evil.io"
probe "P12 .env file forced into the index" 1 .env 'SMTP_PASS=Zq81probeKx'
probe "P13 attribution trailer (exact allowlist)" 0 handoff/delivery/evidence/WFX/commit-message.txt 'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>'
probe "P14 placeholders <user> and \$USER" 0 notes.md 'see C:\Users\<user>\AppData and /home/$USER/.cache'
probe "P15 synthetic-named PDF under evidence" 0 handoff/delivery/evidence/WP3/synthetic-timesheet.pdf '%PDF-1.7 synthetic'
probe "P16 YAML type word (no secret)" 0 config/app.yml 'password: required'
probe "P17 clean README edit" 0 README.md 'Synthetic audit line.' append
echo "# heuristic limits (documented, expected to pass the check)"
probe "L1 letters-only YAML password of 8 chars" 0 config/app.yml 'smtp_password: Sunshine'
probe "L2 letters-only YAML api_key of 11 chars" 0 config/app.yml 'api_key: abcdefghijk'
probe "L3 YAML secret containing a colon" 0 config/app.yml 'db_password: p@ss:word99'
probe "L4 mangled profile path in a project-folder name" 0 notes.md "C--Users-${ACC}-work-repo"
echo "# real account (detail suppressed; only the summary line is kept)"
QUIET_DETAIL=1 probe "R1 real Windows account path" 1 notes.md "C:\\Users\\${USERNAME}\\AppData"
echo "# $((total-bad))/$total probes behaved as expected"
[ "$bad" = 0 ]
