#!/usr/bin/env bash
# WF-AUDIT3: precommit self-test and staged-set probes in a scratch clone of the freeze commit.
# Usage: bash 4-precommit-probes.sh <project-dir> <scratch-dir> <expected-sha>
#   Clones <project-dir> into <scratch-dir>/wfa3 (outside Dropbox), checks HEAD = <expected-sha> and that
#   scripts/precommit-check.mjs equals the checkout copy, runs the self-test, then stages one synthetic file
#   per case and runs the staged-set gate. Node 24 must be first on PATH. git runs with a per-process
#   safe.directory override (no global config change). The clone is deleted afterwards.
# Synthetic values are assembled at run time so that this file and its log do not contain the spaced layout.
set -u
export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0='*'
PROJECT=$1
CLONE=$2/wfa3
EXPECTED=$3
rm -rf "$CLONE"
git clone -q --no-hardlinks "$PROJECT" "$CLONE" || exit 2
cd "$CLONE" || exit 2
echo "node $(node --version); clone HEAD $(git rev-parse HEAD); expected $EXPECTED"
[ "$(git rev-parse HEAD)" = "$EXPECTED" ] || { echo "clone HEAD differs"; exit 2; }
cmp -s scripts/precommit-check.mjs "$PROJECT/scripts/precommit-check.mjs" && echo "precommit script identical to checkout" || echo "precommit script differs from checkout"
echo "COMMAND: node scripts/precommit-check.mjs --self-test (clone)"
node scripts/precommit-check.mjs --self-test; echo "EXIT: $?"

A=qwer; B=tyui; C=opas; D=dfgh
V="$A $B $C $D"
VU=$(printf '%s' "$V" | tr '[:lower:]' '[:upper:]')
DIG="1234 5678 9012 3456"
X4=xxxx; VX="$X4 $X4 $X4 $X4"
V2="$A  $B  $C  $D"
VT=$(printf '%s\t%s\t%s\t%s' "$A" "$B" "$C" "$D")
U="k9Xq27""MzVb41"
FAILED=0
show() { printf '%s' "$1" | sed -e "s/$V/<4x4 synthetic>/g" -e "s/$VU/<4x4 synthetic upper>/g" -e "s/$DIG/<4x4 synthetic digits>/g" \
  -e "s/$V2/<4x4 synthetic double-spaced>/g" -e "s/$VT/<4x4 synthetic tab-separated>/g" -e "s/$U/<12-char synthetic>/g" | tr '\r' '~'; }
run() { # expected-exit label line [crlf]
  mkdir -p config
  if [ "${4:-}" = crlf ]; then printf '%s\r\n' "$3" > config/mail.yml; else printf '%s\n' "$3" > config/mail.yml; fi
  git add -f -- config/mail.yml
  out=$(node scripts/precommit-check.mjs 2>&1); code=$?
  git rm -q --cached -f -- config/mail.yml; rm -f config/mail.yml
  leak=no; for value in "$V" "$VU" "$DIG" "$U"; do case "$out" in *"$value"*) leak=yes;; esac; done
  verdict=$([ "$code" = "$1" ] && [ "$leak" = no ] && echo ok || echo BAD)
  printf '%s | %s | expected exit %s | exit %s | plaintext in output: %s | line: %s | %s\n' "$verdict" "$2" "$1" "$code" "$leak" \
    "$(show "$3")" "$(printf '%s' "$out" | tail -1)"
  [ "$verdict" = ok ] || FAILED=1
}
echo
echo "# S. WF-AUDIT2 5b forms, verbatim (expect exit 1; were exit 0 at c219d79 except the unspaced control)"
run 1 S1 "smtp_password: $V"
run 1 S2 "SMTP_PASSWORD: \"$V\""
run 1 S3 "smtp_password = '$V'"
run 1 S4 "SMTP_PASS=\"$V\""
run 1 S5 "export SMTP_PASSWORD=\"$V\""
run 1 S6 '{"smtp_password": "'"$V"'"}'
run 1 S7 "smtp_password: $A$B$C$D"
echo "# N. Auditor's own spaced forms (expect exit 1)"
run 1 N1 "SMTP_PASSWORD=\"$VU\""
run 1 N2 "smtp_password = \"$V\""
run 1 N3 "  smtpPassword: '$V',"
run 1 N4 "smtp_pass = $V"
run 1 N5 "app_password: $DIG"
run 1 N6 '{"smtp_password":"'"$V"'"}'
run 1 N7 "smtp_password: $V" crlf
run 1 N8 "SMTP_PASSWORD=$V   "
run 1 N9 "      - SMTP_PASSWORD=$V"
run 1 N10 "SMTP_PASSWORD: \"$V\"  # mail app password"
run 1 N11 "mail_app_password: $V # prod"
echo "# P. Prose and placeholder controls (expect exit 0)"
run 0 P1 'password: "two words here"'
run 0 P2 'smtp_password: see the vault entry'
run 0 P3 "SMTP_PASSWORD=\"$VX\""
run 0 P4 'SMTP_PASSWORD: ${SMTP_PASSWORD}'
run 0 P5 "note: $V"
run 0 P6 'password = "four word long phrase"'
run 0 P7 'token: "rotate every ninety days"'
echo "# L. Documented limits of the heuristic (outcome recorded; not part of WF-R-02's required forms)"
run 0 L1 "smtp_password: $V2"
run 0 L2 "smtp_password: $VT"
run 0 L3 "  auth: { user: 'mailer', pass: '$V' },"
run 0 L4 "  auth: { user: 'mailer', pass: '$U' },"
run 0 L5 "      - \"SMTP_PASSWORD=$V\""
run 0 L6 "      - \"SMTP_PASSWORD=$U\""
run 1 L7 'smtp_password: when user logs into'
echo "# M. Multi-file staged set: one spaced leak among clean files (expect exit 1, value masked)"
mkdir -p config docs
printf '%s\n' "smtp_host: smtp.example.com" "smtp_password: $V" > config/mail.yml
printf '%s\n' "Use the vault entry for the password; never commit it." > docs/mail-note.md
printf '\n%s\n' "Synthetic README line." >> README.md
git add -f -- config/mail.yml docs/mail-note.md README.md
out=$(node scripts/precommit-check.mjs 2>&1); code=$?
leak=no; case "$out" in *"$V"*) leak=yes;; esac
printf '%s | M1 three staged files | expected exit 1 | exit %s | plaintext in output: %s\n' \
  "$([ "$code" = 1 ] && [ "$leak" = no ] && echo ok || echo BAD)" "$code" "$leak"
printf '%s\n' "$out" | sed -e "s/$V/<4x4 synthetic>/g"
[ "$code" = 1 ] && [ "$leak" = no ] || FAILED=1
git rm -q --cached -f -- config/mail.yml docs/mail-note.md; git restore --staged -- README.md; git checkout -q -- README.md
rm -f config/mail.yml docs/mail-note.md
echo "clone status after probes (expect empty):"; git status --short
cd / && rm -rf "$CLONE"
[ -e "$CLONE" ] && echo "clone not deleted" || echo "clone deleted"
echo "probe result: $([ "$FAILED" = 0 ] && echo all as expected || echo mismatch)"
exit "$FAILED"
