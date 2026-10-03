#!/usr/bin/env bash
# WF-FIX2 checks. Usage: bash 3-checks.sh <project-dir> <scratch-dir> <workflow-python> <node-bin-dir> <npm-cli.js>
# Prints COMMAND and EXIT for every check; user-profile paths are masked by the caller.
set -u
PROJECT=$1 SCRATCH=$2 PY=$3 NODEBIN=$4 NPMCLI=$5
export PATH="$NODEBIN:$PATH" PYTHONDONTWRITEBYTECODE=1
cd "$PROJECT" || exit 2
step() { echo; echo "COMMAND: $*"; "$@"; echo "EXIT: $?"; }
echo "node $(node --version); python $("$PY" --version 2>&1); HEAD $(git rev-parse HEAD)"
step "$PY" handoff/delivery/validate_orchestration.py
step "$PY" handoff/delivery/check_recovery.py
step "$PY" handoff/delivery/evidence/WF-FIX2/1-repro.py
step node scripts/precommit-check.mjs --self-test
step node "$NPMCLI" run lint
step "$PY" handoff/delivery/validate_package.py --preflight
step git diff --check
# Read-only privacy scans with the new rules: copy uncommitted files into a scratch clone of HEAD,
# stage them there and run the working-tree gate. The real checkout and its index are untouched.
export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0='*'
scan() { # label paths...
  local label=$1; shift
  local clone="$SCRATCH/wffix2-scan"
  rm -rf "$clone"; git clone -q --no-hardlinks "$PROJECT" "$clone" || return 2
  cp scripts/precommit-check.mjs "$clone/scripts/precommit-check.mjs"
  local path
  for path in "$@"; do mkdir -p "$clone/$(dirname "$path")"; cp -r "$path" "$clone/$(dirname "$path")/"; done
  (cd "$clone" && git add -f -- "$@" && echo "COMMAND: node scripts/precommit-check.mjs  # $label" &&
    node scripts/precommit-check.mjs; echo "EXIT: $?")
  rm -rf "$clone"; [ -e "$clone" ] && echo "scan clone not deleted" || echo "scan clone deleted"
}
echo
scan "uncommitted evidence of WF-FREEZE2, WF-GATE2 and WF-AUDIT2" \
  handoff/delivery/evidence/WF-FREEZE2 handoff/delivery/evidence/WF-GATE2 handoff/delivery/evidence/WF-AUDIT2
echo
scan "WF-FIX2 owned changes and evidence" \
  handoff/prompts/ORCHESTRATE.md handoff/prompts/ORCHESTRATE.vi.md handoff/prompts/FIX_FINDINGS.md \
  handoff/prompts/FIX_FINDINGS.vi.md handoff/delivery/validate_orchestration.py handoff/delivery/check_recovery.py \
  scripts/precommit-check.mjs docs/08_AI_WORKFLOW_AND_BUDGET.md docs/08_AI_WORKFLOW_AND_BUDGET.vi.md \
  handoff/delivery/tasks/WF-FIX2.md handoff/delivery/evidence/WF-FIX2
