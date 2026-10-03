# GOV-E8-GATE dispatch brief

- Mission/task: timesheet-software-readiness / GOV-E8-GATE; board package GOV; kind gate;
  attempt 1; depends on GOV-E8-FREEZE.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size S, risk M, novelty no. Records in English.
- Target: the GOV-E8-FREEZE commit (board `GOV-E8-FREEZE.commit_sha`). HEAD must equal it
  and nothing outside handoff/ may differ. Writable: this report and
  handoff/delivery/evidence/GOV-E8-GATE/ only.

## Checks (record command | environment | exit | observed result | log path)

1. `npm run digest` (Node 24) before and after; the two values must be equal.
2. `python handoff/delivery/validate_orchestration.py` and
   `python handoff/delivery/check_recovery.py` (probe total).
3. `python handoff/delivery/validate_package.py --preflight` with the workflow Python
   recorded in handoff/delivery/evidence/orchestration/run-validation.ps1. Expect pairs,
   links and 91 scenarios.
4. `npm run verify` (Node 24). The commit changes a reference fixture.
5. `git diff --check f7b9f8e3f07b68e636da54ba589b286fa59561b8 HEAD`. Then list the
   governance paths changed in that range; the expected result is AGENTS.md and
   AGENTS.vi.md only.
6. Wording check: AGENTS.md and AGENTS.vi.md no longer reference tailwind.config.js, the
   brandkit, or P8000/P9000. They state CSS custom properties, a 4px radius and 300 ms
   ease-out.

Mask user paths in logs; use LF line endings and a single final newline. Decision: PASS /
FAIL / NOT VERIFIED. Return at most 200 words, beginning with your self-reported model.

## Results

(Verifier appends here.)

Verifier results (attempt 1). Decision: FAIL (check 2 probe exits 1; all other checks pass).

- Preconditions: HEAD = 393779ddf62b80246d9c52a0d563086a3ffddcbb. `git status --porcelain=v1 -uall`
  shows nothing outside handoff/ (modified: ORCHESTRATION.json, tasks/GOV-E8-FREEZE.md;
  untracked: evidence/GOV-E8-FREEZE/*.txt).
- Environment: Node v24.21.0 via PATH (first attempt used a Windows-style PATH and silently ran Node
  v26; discarded and rerun, `node-version.txt`); workflow Python from run-validation.ps1.
- 1. `npm run digest` before | exit 0 | 7586ba0821899960e24879ffacb435132edb9ab3e243be5a0a5bfb459290ec2f
  (539 files) | digest-before.txt. After | exit 0 | identical | digest-after.txt. PASS.
- 2a. `validate_orchestration.py` | exit 0 | validate-orchestration.txt. PASS.
- 2b. `check_recovery.py` | exit 1 | ValueError "Running task outside active package" at probe
  "replacement attempt keeps same task ID" | check-recovery.txt. FAIL. Cause: the probe builds
  synthetic tasks with package "WP1" (make_task default) while the live board now has
  active_package "WP2"; the validator rejects a running non-active, non-GOV task. Neither script
  changed in f7b9f8e..HEAD, so this is a probe/board incompatibility, not a defect in the freeze
  commit. The same result occurs with system Python 3.14 and the workflow Python. Not repaired
  (outside scope). The historical evidence/orchestration/check-recovery.py also exits 1 (different
  reason, unfinished dependency WF-IMPL-TOOLING); it is not the brief's command.
- 3. `validate_package.py --preflight` (workflow Python) | exit 0 | scenario_total 91 | preflight.txt. PASS.
- 4. `npm run verify` (Node 24) | exit 0 | typecheck, lint, test, build, smoke; SMOKE PASSED |
  verify.txt. PASS.
- 5. `git diff --check f7b9f8e..HEAD` | exit 0, no output | diff-check.txt. Governance paths
  changed (AGENTS.md, AGENTS.vi.md, CLAUDE.md): AGENTS.md and AGENTS.vi.md only | gov-paths.txt. PASS.
- 6. Wording: grep for tailwind|brandkit|P8000|P9000 in AGENTS.md/AGENTS.vi.md finds no match (grep
  exit 1) | wording-forbidden.txt. Required terms present in both files: src/client/styles.css
  custom properties, 4px radius custom property, `transition: all 300ms ease-out` custom property
  | wording-required.txt. PASS.
- Source digest unchanged before/after; no source edited.
