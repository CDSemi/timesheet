# WF-FIX2 dispatch brief

- Mission/task: timesheet-software-readiness / WF-FIX2; board package GOV; kind fix;
  attempt 1; addresses WF-AUDIT2 (FIX REQUIRED, Low items only).
- Profile/routing: timesheet-worker-high with model override opus, reason
  `escalation` (second fix round on this governance package; per the docs/08 caps a
  further FIX REQUIRED becomes an owner blocker). Effort stays the profile's high.
  Routing: size S, risk H (validator integrity, privacy gate), novelty no.
- Baseline: HEAD c219d79a2c202861b719473cdffb0efb59f14290 (= origin/main). Findings:
  handoff/delivery/WORKFLOW_RECHECK.md (WF-A-10 residual, WF-R-01, WF-R-02) and evidence
  in handoff/delivery/evidence/WF-AUDIT2/ (notably 5b-spaced-secret-probes.* and the
  probe D9 in 3-probes.py). Records in English.
- Already done by the coordinator (do not edit): NEXT_ACTION (+vi) F-01 route wording;
  board decision marked superseded.

## Owned (writable) paths

handoff/prompts/ORCHESTRATE.md and .vi.md; handoff/prompts/FIX_FINDINGS.md and .vi.md;
handoff/delivery/validate_orchestration.py; handoff/delivery/check_recovery.py;
scripts/precommit-check.mjs; docs/08_AI_WORKFLOW_AND_BUDGET.md and .vi.md; this report;
handoff/delivery/evidence/WF-FIX2/. Everything else read-only.

## Required changes (binding)

1. WF-A-10 residual: ORCHESTRATE (+vi) and FIX_FINDINGS (+vi) restrict `gate_included`
   to intermediate S-size fixes and state that package-final snapshots, including FIX
   REQUIRED rechecks that unlock the next package, keep a separate verifier gate. Use
   wording consistent with docs/08 (the package-final definition).
2. WF-R-01: the validator binds a done GOV audit to a gate dependency whose
   `freeze_commit` is 40-hex and equals the audit's `reviewed_commit`. For any audit
   in any package, when both values are present, they must be equal. Add check_recovery
   probes for a mismatch (rejected) and a match (accepted). The real board's WF-AUDIT and
   WF-AUDIT2 already match their gates.
3. `addresses_audit` (optional on fix tasks): when present, it must name an existing
   audit task whose decision is FIX REQUIRED or NOT VERIFIED, and the fix task must not
   also depend on that audit. Document it in docs/08 (+vi) and add probes.
4. WF-R-02: precommit blocks secret-named assignments whose value has the spaced
   app-password layout: four groups of four letters or digits separated by single
   spaces. This applies in unquoted YAML, single- or double-quoted, env, `export` and
   JSON forms. Ordinary prose values containing spaces (for example "two words here")
   must still pass. Add self-test cases for each form. Assemble synthetic strings at run
   time so that the script's own source and logs do not trip the rule.
5. docs/08 (+vi): add `.agents/` and `docs/agents/` to the governance-path list.

## Checks (record actual exits in your evidence dir; mask user paths)

- `python handoff/delivery/validate_orchestration.py` on the real board. WF-FIX2 runs
  with an opus override and reason escalation; it must PASS.
- `python handoff/delivery/check_recovery.py` with the new total.
- `node scripts/precommit-check.mjs --self-test` with Node 24.
- A scratch-clone replay of the WF-AUDIT2 5b spaced forms (expect exit 1) and a prose
  value (expect exit 0). Run it outside Dropbox with the per-process safe.directory
  override, and delete the clone afterwards.
- `npm run lint` with Node 24.
- `validate_package.py --preflight` with the workflow Python.
- `git diff --check`.
- A read-only scan, with the new rules, of the uncommitted evidence of WF-FREEZE2,
  WF-GATE2 and WF-AUDIT2. List files that would block; the known item is
  WF-GATE2/preflight-system-python.txt profile paths, which the committer masks.

Return at most 250 words, beginning with your self-reported model: files changed, checks
with exits, files that would block, deviations.

## Results

(Worker appends here.)

### Step 1 - reproduction (2026-10-03 UTC, before any edit)

- Validator probes `evidence/WF-FIX2/1-repro.py` on the working-tree board: 4/14 as expected,
  exit 1. Reproduced: R3 (= WF-AUDIT2 D9), R4, R5 and R6 (gate `freeze_commit` and audit
  `reviewed_commit` not bound) and A1-A5, A7 (`addresses_audit` unvalidated). Log:
  `evidence/WF-FIX2/1-repro-before.txt`.
- Scratch-clone replay `evidence/WF-FIX2/2-spaced-replay.sh` (outside Dropbox, per-process
  safe.directory, Node v24.21.0): all seven spaced app-password forms exit 0 (defect), the
  unspaced control exits 1, five prose/placeholder controls exit 0; clone deleted. Log:
  `evidence/WF-FIX2/2-spaced-replay-before.txt`.

### Step 2 - validator, check_recovery and precommit changes

- `validate_orchestration.py`: `validate_audits` now checks, for every audit in any package,
  that each gate dependency's `freeze_commit` equals the audit's `reviewed_commit` when both are
  present, and requires a done GOV audit to have a gate dependency whose 40-hex `freeze_commit`
  equals `reviewed_commit` (so a done GOV audit can no longer rely on `gate_included`). New
  `validate_addresses`: `addresses_audit` is allowed only on fix tasks, must name an existing
  audit task that is done with FIX REQUIRED or NOT VERIFIED, and must not also be a dependency.
- `check_recovery.py`: the GOV acceptance probe now records the gate `freeze_commit`; 14 new
  probes (commit mismatch, missing gate commit, GOV `gate_included` without gate, WP mismatch
  and match, WP audit without `reviewed_commit`; `addresses_audit` FIX REQUIRED and NOT VERIFIED
  accepted, dangling, gate, PASS, unfinished, dependency and non-fix rejected). Total 81, exit 0.
- `1-repro.py` after the fix: 14/14 as expected.
- `precommit-check.mjs`: new `SECRET_SPACED` rule (quoted, or unquoted up to end of line or a
  trailing comment) for the four-groups-of-four layout; a spaced all-`x` placeholder is judged on
  its compact form. 15 new self-test line samples built at run time (8 block, 7 pass); the
  unmasked-output check covers the spaced samples. Self-test: 35 path and 74 line samples, exit 0.
- Replay after the fix: all 8 spaced/unspaced secret forms exit 1, all 5 prose/placeholder
  controls exit 0; clone deleted (`2-spaced-replay-after.txt`).

### Step 3 - wording (EN authoritative, VI pairs updated together)

- ORCHESTRATE step 4 and FIX_FINDINGS (+vi): only an intermediate S-size fix audit may include
  the gate; package-final snapshots, including a FIX REQUIRED recheck that unlocks the next
  package, and GOV audits keep a separate verifier gate (document 08).
- docs/08 (+vi): `reviewed_commit`/`freeze_commit` equality for any package; done GOV audit needs
  a gate dependency with matching `freeze_commit` (so no `gate_included`); governance paths add
  `.agents/` and `docs/agents/`; `addresses_audit` documented in the FIX REQUIRED paragraph; the
  evidence-masking bullet names the spaced app-password rule.

### Step 4 - checks (2026-10-03 UTC; log `evidence/WF-FIX2/3-checks-output.txt`, script `3-checks.sh`)

Node v24.21.0, workflow Python from run-validation.ps1, HEAD c219d79 plus working-tree changes.

| Check | Exit |
|---|---|
| `validate_orchestration.py` on the real board (WF-FIX2 running, opus override, reason escalation) | 0 PASS (9 profiles, 20 tasks) |
| `check_recovery.py` | 0 PASS, 81 checks (was 67) |
| `evidence/WF-FIX2/1-repro.py` | 0, 14/14 as expected (before the fix: 1, 4/14) |
| `node scripts/precommit-check.mjs --self-test` | 0, 35 path and 74 line samples, 12 rules |
| Scratch-clone replay `2-spaced-replay.sh` (outside Dropbox, per-process safe.directory, clone deleted) | gate exit 1 for all 8 secret forms, 0 for all 5 prose/placeholder controls; script 0 |
| `npm run lint` | 0 |
| `validate_package.py --preflight` | 0 PASS |
| `git diff --check` | 0 |
| Read-only scan (scratch clone, new rules) of uncommitted WF-FREEZE2, WF-GATE2, WF-AUDIT2 evidence (38 files) | 1: 7 `profile-path` blocks, all in `evidence/WF-GATE2/preflight-system-python.txt` (lines 2, 5, 7, 10, 13, 16, 43), the known item the committer masks. No spaced-secret or other finding |
| Same scan of the WF-FIX2 owned changes and evidence (16 files) | 0 |

Deviations: none from the binding list. Additions within owned paths: GOV audits now cannot
rely on `gate_included` (implied by the required gate binding; prompts and docs/08 say so);
`addresses_audit` must name a *done* audit and is rejected on non-fix tasks; a spaced all-`x`
placeholder passes; docs/08 masking bullet names the new rule. Not changed: NEXT_ACTION, STATE,
board, checkpoints, other task records, review files, src/, tests/, lock files, permissions.

### Step 5 - final scan and hand-back

- Final read-only scan of all 17 owned files (including this report and every WF-FIX2 log) in a
  scratch clone with the new rules: precommit 0 findings, exit 0; `git diff --cached --check`
  exit 0; clone deleted (`evidence/WF-FIX2/4-final-scan.txt`). One evidence log had CRLF from a
  Windows Python redirect and was converted to LF.
- Files that would block an accept commit: only `evidence/WF-GATE2/preflight-system-python.txt`
  (7 profile-path lines; committer masks the account segment).
- Next action: coordinator reconciles, then WF-FREEZE3 commits the owned set for WF-GATE3 and a
  fresh WF-AUDIT3. Not independent acceptance.
