#!/usr/bin/env bash
# WF-FIX1: scratch-clone staged-set probes for scripts/precommit-check.mjs (synthetic values only).
# Usage: probes.sh <scratch-clone-dir> <script-name>   (script-name relative to the clone, e.g. scripts/precommit-check.mjs)
# Sensitive-looking values are assembled from fragments so that this file passes the privacy check itself.
set -u
clone="$1"; script="$2"
export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0='*'
cd "$clone" || exit 2
node --version
echo "script: $script"
value="Zq81""probeKx"
acct="jsmith""42"

run_case() { # label, expected-exit, file, content-or-empty
  local label="$1" expected="$2" file="$3" content="$4"
  git reset --quiet
  rm -rf probe-tmp; mkdir -p "$(dirname "$file")"
  if [ -n "$content" ]; then printf '%s\n' "$content" > "$file"; else printf 'synthetic placeholder\n' > "$file"; fi
  git add -- "$file"
  echo "## case: $label (expect exit $expected)  [staged: $file]"
  node "$script"; local code=$?
  echo "exit=$code $( [ "$code" = "$expected" ] && echo OK || echo MISMATCH )"
  git reset --quiet; rm -f -- "$file"
}

run_case "YAML unquoted SMTP_PASSWORD (probe 1)" 1 deploy/probe-compose.yml "SMTP_PASSWORD: $value"
run_case "YAML unquoted api_token (probe 2)" 1 deploy/probe-token.yml "api_token: $value"
run_case "signature image in evidence (probe 3)" 1 handoff/delivery/evidence/WP3/employee-signature.png ""
run_case "PDF in evidence (probe 4)" 1 handoff/delivery/evidence/WP3/timesheet-report.pdf ""
run_case "POSIX drive profile path (probe 5)" 1 docs/probe-path.md "see /c/Users/$acct/x"
run_case "INI unquoted secret" 1 deploy/probe.ini "smtp_password=$value"
run_case "Windows profile path (forward slashes)" 1 docs/probe-path2.md "see C:/Users/$acct/work"
run_case "synthetic-named evidence image allowed" 0 handoff/delivery/evidence/WP3/ui-synthetic.png ""
run_case "synthetic fixture PDF allowed" 0 reference/fixtures/probe-sample.pdf ""
run_case "placeholder profile path allowed" 0 docs/probe-ok.md "see /c/Users/<user>/x and %USERNAME% and \$USER"
run_case "clean change (probe 6: expect pass)" 0 docs/probe-clean.md "Plain documentation text."
git reset --quiet
echo "final status:"; git status --porcelain
