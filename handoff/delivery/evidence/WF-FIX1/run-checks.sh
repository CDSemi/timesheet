#!/usr/bin/env bash
# WF-FIX1 check runner (Git Bash). Logs go to this directory with the Windows account name masked as <user>.
set -u
REPO=/d/Dropbox/Work.CDSemi/timesheet
EV=$REPO/handoff/delivery/evidence/WF-FIX1
SCRATCH=/b/Temp/claude/D--Dropbox-Work-CDSemi-timesheet/44e3451e-da20-4a12-94bb-6b94fc5f531e/scratchpad/wf-fix1
PY="$(cygpath -m "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe"  # workflow Python recorded in evidence/orchestration/run-validation.ps1
export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"
export PYTHONDONTWRITEBYTECODE=1
ACCOUNT="$(basename "$USERPROFILE")"
mask() { sed -e "s#$ACCOUNT#<user>#g" -e 's#\(/c/Users/\)[A-Za-z0-9_.-]*#\1<user>#g'; }
cd "$REPO"
log() { # name, command...
  local name="$1"; shift
  { echo "COMMAND: $*"; echo "date_utc: $(date -u +%FT%TZ); node $(node --version)"; "$@" 2>&1; echo "EXIT: $?"; } | mask > "$EV/$name.txt"
  tail -1 "$EV/$name.txt" | sed "s/^/$name /"
}
log 1a-validate-orchestration-real-board "$PY" -B handoff/delivery/validate_orchestration.py
log 1b-validate-orchestration-real-board-baseline-HEAD "$PY" -B "$EV/helper_validate_variants.py" baseline
log 1c-validate-orchestration-real-board-dependency-blanked "$PY" -B "$EV/helper_validate_variants.py" dependency-blanked
log 2a-check-recovery-real-board "$PY" -B handoff/delivery/check_recovery.py
log 2c-check-recovery-real-board-dependency-blanked "$PY" -B "$EV/helper_recovery_dependency_blanked.py"
log 2b-new-probes-vs-baseline-validator "$PY" -B "$EV/helper_probes_vs_baseline.py"
log 3-precommit-self-test node scripts/precommit-check.mjs --self-test

# Scratch clone at HEAD outside Dropbox, per-process safe.directory override, deleted afterwards.
export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0='*'
rm -rf "$SCRATCH/clone"; mkdir -p "$SCRATCH"
git clone --quiet "$REPO" "$SCRATCH/clone" 2>&1 | mask
cp scripts/precommit-check.mjs "$SCRATCH/clone/scripts/precommit-check.mjs"
git show HEAD:scripts/precommit-check.mjs > "$SCRATCH/clone/scripts/precommit-check.baseline.mjs"
log 4a-probes-new-script bash "$EV/probes.sh" "$SCRATCH/clone" scripts/precommit-check.mjs
log 4b-probes-baseline-script bash "$EV/probes.sh" "$SCRATCH/clone" scripts/precommit-check.baseline.mjs

# Read-only scan of the uncommitted WF-FREEZE / WF-GATE / WF-AUDIT evidence with the new rules (copies in the scratch clone).
cd "$SCRATCH/clone"; git reset --quiet
for d in WF-FREEZE WF-GATE WF-AUDIT; do
  mkdir -p "handoff/delivery/evidence/$d"; cp -r "$REPO/handoff/delivery/evidence/$d/." "handoff/delivery/evidence/$d/"
done
git add -- handoff/delivery/evidence/WF-FREEZE handoff/delivery/evidence/WF-GATE handoff/delivery/evidence/WF-AUDIT
log 5-scan-uncommitted-evidence-new-rules node scripts/precommit-check.mjs
log 5b-scan-uncommitted-evidence-baseline-rules node scripts/precommit-check.baseline.mjs

# Scan of this task's own changes (copies in a fresh scratch clone, staged by explicit path) with the new rules.
git reset --quiet
OWN="handoff/delivery/validate_orchestration.py handoff/delivery/check_recovery.py scripts/precommit-check.mjs .claude/agents docs/08_AI_WORKFLOW_AND_BUDGET.md docs/08_AI_WORKFLOW_AND_BUDGET.vi.md docs/10_DECISIONS_AND_SOURCES.md docs/10_DECISIONS_AND_SOURCES.vi.md handoff/prompts/RESUME.md handoff/prompts/RESUME.vi.md handoff/delivery/tasks/WF-FIX1.md handoff/delivery/evidence/WF-FIX1"
for path in $OWN; do mkdir -p "$(dirname "$path")"; rm -rf "$path"; cp -r "$REPO/$path" "$path"; done
git add -- $OWN
log 6-scan-own-changes-new-rules node scripts/precommit-check.mjs
cd "$REPO"; rm -rf "$SCRATCH/clone"
unset GIT_CONFIG_COUNT GIT_CONFIG_KEY_0 GIT_CONFIG_VALUE_0

log 7-lint bash -c 'node --trace-deprecation --pending-deprecation "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run lint'
log 8-preflight "$PY" -B handoff/delivery/validate_package.py --preflight
log 9-git-diff-check git diff --check
