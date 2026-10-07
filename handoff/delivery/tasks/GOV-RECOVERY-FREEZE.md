# GOV-RECOVERY-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / GOV-RECOVERY-FREEZE; package GOV; kind
  commit; attempt 1; depends on GOV-RECOVERY-FIX.
- This commit freezes the governance fix to `handoff/delivery/check_recovery.py`
  (GOV-E8-AUDIT R1). It also carries the WP5-ACCEPT results and the GOV-RECOVERY
  briefs.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  dd0c7d1a9ddde1db1af46bc33a446f0e8c17e4fc. If either differs, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **Never feed anything to python or node through stdin. Never use a heredoc.**
    Never pipe into head or tail.
  - Call Node 24 by its full portable path; make the first shell call a trivial
    `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\GOV-RECOVERY-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Nothing outside handoff/ may be changed, staged or untracked. Inside handoff/, the
only non-record change is `handoff/delivery/check_recovery.py`. If anything is already
staged before you start, report it first.

The source digest (`node scripts/source-digest.mjs`, which excludes handoff/) must
equal 150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61.

## Files to stage

- Modified: `handoff/delivery/check_recovery.py`.
- New:
  - `handoff/delivery/tasks/GOV-RECOVERY-FIX.md`, `GOV-RECOVERY-GATE.md` and
    `GOV-RECOVERY-AUDIT.md`;
  - this brief, as it stands before you append results;
  - every file in `handoff/delivery/evidence/WP5-ACCEPT/` and
    `handoff/delivery/evidence/GOV-RECOVERY-FIX/`.
- Modified:
  - `handoff/delivery/tasks/WP5-ACCEPT.md`;
  - `handoff/delivery/ORCHESTRATION.json`;
  - the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/GOV-RECOVERY-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/GOV-RECOVERY-FREEZE/checks.txt`.
1. `node --version`.
2. The source digest.
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check. Record its file count.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json and STATE.json.
7. The orchestration validator.
8. `check_recovery.py`. Record the probe count; it should be 87.
9. `validate_package.py --preflight`.

Run each Python script by its path with the workflow Python
`C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
Write `<user>` in the evidence.

When to stop: if any check fails, do not commit; report the file, line and rule. If
any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it.

Do not print diffs or file bodies. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Make recovery probes independent of the live mission status

- chore(gov) (GOV-E8-AUDIT R1):
  - every synthetic board in `check_recovery.py` sets its own mission status;
  - five `software_ready` probes are added: one accepted, and rejections for a running
    task, a pending task, a set `next_task_id` and a package that is not passed;
  - optional `CHECK_RECOVERY_BOARD` and `CHECK_RECOVERY_STATE` overrides default to
    the real files;
  - 87 probes.
- docs(handoff): the WP5-ACCEPT results, the GOV-RECOVERY briefs, and the board and
  checkpoint (+ vi).

Task: GOV-RECOVERY-FREEZE

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest and staged count;
- the probe count;
- check exit codes;
- any blockers.

Return at most 120 words, beginning with your self-reported model.

## Results

- Self-reported model: claude-sonnet-5-5.
- Pre-HEAD dd0c7d1a9ddde1db1af46bc33a446f0e8c17e4fc; post-HEAD and commit
  7f750e9e5127eef23b96f18b37d4caee83baa414; pushed to main; remote SHA equal.
- Digest 150420e7...6533e61 (779 files); staged count 12; probes 87.
- Exit codes: all checks 0. Node v24.21.0. No blockers, no masking needed.
