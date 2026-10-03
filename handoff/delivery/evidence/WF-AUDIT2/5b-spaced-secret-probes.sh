#!/usr/bin/env bash
# WF-AUDIT2: secret values containing spaces (Gmail-style app-password layout "xxxx xxxx xxxx xxxx", synthetic letters).
# Usage: bash 5b-spaced-secret-probes.sh <scratch-clone-dir>   (Node 24 first on PATH; per-process safe.directory)
set -u
cd "$1" || exit 2
V='qwer tyui opas dfgh'
for line in "smtp_password: $V" "SMTP_PASSWORD: \"$V\"" "smtp_password = '$V'" "SMTP_PASS=\"$V\"" "export SMTP_PASSWORD=\"$V\"" '{"smtp_password": "'"$V"'"}' "smtp_password: qwertyuiopasdfgh"; do
  printf '%s\n' "$line" > config/mail.yml 2>/dev/null || { mkdir -p config; printf '%s\n' "$line" > config/mail.yml; }
  git add -f -- config/mail.yml
  out=$(node scripts/precommit-check.mjs 2>&1); code=$?
  git rm -q --cached -f -- config/mail.yml; rm -f config/mail.yml
  printf 'exit %s | line: %s | %s\n' "$code" "$(printf '%s' "$line" | sed "s/$V/<4x4 synthetic letters>/")" "$(printf '%s' "$out" | tail -1)"
done
