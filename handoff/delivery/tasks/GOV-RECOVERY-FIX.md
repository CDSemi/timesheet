# GOV-RECOVERY-FIX dispatch brief

- Mission/task: timesheet-software-readiness / GOV-RECOVERY-FIX; package GOV; kind
  fix; attempt 1; no dependency. It answers governance backlog item GOV-E8-AUDIT R1.
- Scope: make the synthetic boards in `handoff/delivery/check_recovery.py` independent
  of the live mission status. When the live board is set to `software_ready` at
  mission completion, `check_recovery.py` must still pass. Today the synthetic probes
  inherit the live status, so the suite would fail.
- Profile/routing: timesheet-worker, requested sonnet, no override. Routing: size S,
  risk M (recovery tooling that gates every commit), novelty no. The task record is in
  English.
- Base: HEAD = origin/main = dd0c7d1a9ddde1db1af46bc33a446f0e8c17e4fc (WP5-ACCEPT).
  Record HEAD before you start. The source digest excludes handoff/, so it must stay
  150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61. Record it before
  and after.

## Read

- AGENTS.md from disk first; docs/08 (governance paths and checks).
- `handoff/delivery/GOV_E8_REVIEW.md`, risk R1, and the GOV-E8-AUDIT notes on the board
  (read-only).
- `handoff/delivery/check_recovery.py` and `handoff/delivery/validate_orchestration.py`
  (read the `software_ready` rules).

## Required change

1. In `check_recovery.py`, build every synthetic board with its own explicit mission
   status. Use one that matches what that probe tests, normally `running`. No probe
   may read the status from the live board. Keep every existing probe and its
   expected outcome.
2. Add probes for the `software_ready` rules of the validator:
   - accepted: no running task, `next_task_id` null, every task done or cancelled, and
     every package independently passed;
   - rejected: a running task remains;
   - rejected: a required task is still pending;
   - rejected: `next_task_id` is set.
3. Prove the fix against a status change of the live board. Copy ORCHESTRATION.json and
   STATE.json into the task folder, and set the copy to `software_ready` there. Run
   the suite against that copy, without touching the real board.
   - If `check_recovery.py` can only read the real path, add a small optional argument
     or environment variable that points it at another board and state. The default
     must stay the real path.
   - Record which approach you used.
4. Change no other file. Do not edit `validate_orchestration.py`, unless a real
   contradiction makes it unavoidable; then stop and report instead.

## Checks

- `check_recovery.py` on the real board: exit 0, and record the probe count before and
  after.
- `check_recovery.py` against the `software_ready` copy: exit 0.
- `validate_orchestration.py` on the real board: exit 0.
- `validate_package.py --preflight`: exit 0.
- The precommit check over the changed file.
- The source digest before and after: unchanged.
- Run every Python script by its path with the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER feed anything to python or node through stdin. Never use a heredoc.** Never
  pipe into head or tail. Call python only as the workflow Python running a script
  file by path.
- Call Node 24.21.0 by its full path; make the first shell call a trivial
  `node --version`.
- Use the task folder `D:\.claude-tmp\timesheet\GOV-RECOVERY-FIX` for the board copies
  and raw output.
- Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
  anything recursively. Never write into the repository root.
- If a permission check denies a call, stop and report.
- Owned paths:
  - `handoff/delivery/check_recovery.py`;
  - this brief's Results section;
  - `handoff/delivery/evidence/GOV-RECOVERY-FIX/`, with masked LF `.txt` only.

  Do not edit the real board, STATE, NEXT_ACTION or the checkpoint. Do not commit.

Return at most 120 words, beginning with your self-reported model: what changed, the
probe counts, the `software_ready` copy result, the exit codes, and the digest before
and after.

## Attempt 2 (coordinator note)

Attempt 1 added three `software_ready` rejection probes: a running task, a pending
task, and a set `next_task_id`. The validator has a fourth `software_ready` rule:
"Software readiness requires every package audit". It requires every package in
STATE to have `independent_review: passed`. Add one rejection probe for it, using a
synthetic state where one package is not passed. Then rerun the same checks: the
real board, the `software_ready` copy, the validator, preflight and the digest. Append
"### Attempt 2 results".

## Results

- Changed only `handoff/delivery/check_recovery.py`: `synthetic()` sets `status="running"`
  explicitly; 4 `software_ready` probes (accepted; running task, pending task and
  `next_task_id` set rejected) with their own all-passed synthetic state; `rejects()` takes
  an optional state.
- Approach for the copy: optional env vars `CHECK_RECOVERY_BOARD` and `CHECK_RECOVERY_STATE`
  (defaults stay the real paths); copies built by a helper in the task folder.
- Probe count 82 before, 86 after. Exit codes: real board 0; software_ready copy 0;
  validate_orchestration 0; validate_package --preflight 0; precommit-check 0 (0 staged files).
- Source digest before and after: 150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61.
- Evidence: `handoff/delivery/evidence/GOV-RECOVERY-FIX/results.txt`. Real board/STATE untouched.

### Attempt 2 results

- Added one probe to `check_recovery.py`: a valid software_ready board with a state whose
  last package (WP5) has `independent_review: not_started` is rejected with "Software
  readiness requires every package audit".
- Probe count 86 before, 87 after (real board and software_ready copy).
- Exit codes: real board 0; software_ready copy 0; validate_orchestration 0; preflight 0.
- Source digest unchanged: 150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61.
