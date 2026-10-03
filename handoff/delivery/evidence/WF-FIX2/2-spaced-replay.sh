#!/usr/bin/env bash
# WF-FIX2: replay of the WF-AUDIT2 5b spaced-secret forms plus prose controls against the staged-set gate.
# Usage: bash 2-spaced-replay.sh <project-dir> <scratch-dir>
#   Clones HEAD of <project-dir> into <scratch-dir>/wffix2 (outside Dropbox), copies the working-tree
#   scripts/precommit-check.mjs into the clone, stages one synthetic file per case, runs the gate and
#   prints the exit code. Node 24 must be first on PATH. git runs with a per-process safe.directory
#   override; no global config change. The clone is deleted afterwards.
# The synthetic value is assembled at run time so that this file does not contain the spaced layout.
set -u
export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0='*'
PROJECT=$1
CLONE=$2/wffix2
rm -rf "$CLONE"
git clone -q --no-hardlinks "$PROJECT" "$CLONE" || exit 2
cp "$PROJECT/scripts/precommit-check.mjs" "$CLONE/scripts/precommit-check.mjs"
cd "$CLONE" || exit 2
G1=qwer; G2=tyui; G3=opas; G4=dfgh
V="$G1 $G2 $G3 $G4"
MIXED="Ab12 cd34 EF56 gh78"
run() { # expected-exit line
  mkdir -p config
  printf '%s\n' "$2" > config/mail.yml
  git add -f -- config/mail.yml
  out=$(node scripts/precommit-check.mjs 2>&1); code=$?
  git rm -q --cached -f -- config/mail.yml; rm -f config/mail.yml
  shown=$(printf '%s' "$2" | sed -e "s/$V/<4x4 synthetic letters>/" -e "s/$MIXED/<4x4 synthetic mixed>/")
  verdict=$([ "$code" = "$1" ] && echo ok || echo BAD)
  printf '%s | expected exit %s | exit %s | line: %s | %s\n' "$verdict" "$1" "$code" "$shown" "$(printf '%s' "$out" | tail -1)"
  [ "$code" = "$1" ] || FAILED=1
}
FAILED=0
echo "# spaced app-password layout (expect exit 1)"
run 1 "smtp_password: $V"
run 1 "SMTP_PASSWORD: \"$V\""
run 1 "smtp_password = '$V'"
run 1 "SMTP_PASS=\"$V\""
run 1 "export SMTP_PASSWORD=\"$V\""
run 1 '{"smtp_password": "'"$V"'"}'
run 1 "  - app_password: $MIXED # prod"
run 1 "smtp_password: qwertyuiopasdfgh"
echo "# prose values with spaces and placeholders (expect exit 0)"
run 0 'password: "two words here"'
run 0 'smtp_password: see the vault entry'
run 0 'token: "use the one from the vault"'
run 0 'password = "four word long phrase"'
run 0 'SMTP_PASSWORD: ${SMTP_PASSWORD}'
cd / && rm -rf "$CLONE"
[ -e "$CLONE" ] && echo "clone not deleted" || echo "clone deleted"
echo "replay result: $([ "$FAILED" = 0 ] && echo all as expected || echo mismatch)"
exit "$FAILED"
