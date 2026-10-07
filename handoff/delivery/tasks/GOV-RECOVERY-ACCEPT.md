# GOV-RECOVERY-ACCEPT dispatch brief

- Mission/task: timesheet-software-readiness / GOV-RECOVERY-ACCEPT; package GOV; kind
  commit; attempt 1; depends on GOV-RECOVERY-AUDIT (PASS).
- This commit records the GOV-RECOVERY gate and audit. It is the closing commit of the
  WP1–WP5 software-readiness mission. It changes no source, and it changes no
  governance file beyond what is already committed at 7f750e9.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  7f750e9e5127eef23b96f18b37d4caee83baa414. If either differs, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **Never feed anything to python or node through stdin. Never use a heredoc.**
    Never pipe into head or tail.
  - Call Node 24 by its full portable path; make the first shell call a trivial
    `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\GOV-RECOVERY-ACCEPT` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set (handoff/ records only)

Nothing outside handoff/ may be changed, staged or untracked. `check_recovery.py` must
be unchanged against HEAD. If anything is already staged before you start, report it
first.

The source digest must equal
150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61.

## Files to stage

Stage these paths explicitly. Each may be new or modified; report which.
- `handoff/delivery/GOV_RECOVERY_REVIEW.md` and `.vi.md`;
- `handoff/delivery/tasks/`: `GOV-RECOVERY-FREEZE.md`, `GOV-RECOVERY-GATE.md`,
  `GOV-RECOVERY-AUDIT.md`, and this brief as it stands before you append results;
- every file in these folders under `handoff/delivery/evidence/`:
  `GOV-RECOVERY-FREEZE/`, `GOV-RECOVERY-GATE/` and `GOV-RECOVERY-AUDIT/`;
- `handoff/delivery/ORCHESTRATION.json` and `handoff/delivery/STATE.json`;
- `handoff/NEXT_ACTION.md` and `.vi.md`;
- `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/GOV-RECOVERY-ACCEPT/` stay unstaged.

Any other changed or untracked path stops the commit; report it. Use the Grep tool on
the staged evidence for unmasked password, token or secret values. Record the count
only.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/GOV-RECOVERY-ACCEPT/checks.txt`.
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

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Close the software-readiness mission: GOV-RECOVERY gate and audit pass

- docs(handoff):
  - GOV-RECOVERY-GATE PASS and GOV-RECOVERY-AUDIT PASS on 7f750e9, closing
    GOV-E8-AUDIT R1. The recovery probes are independent of the live mission status
    (87 probes), with GOV_RECOVERY_REVIEW (+ vi) and evidence;
  - STATE, NEXT_ACTION (+ vi) and the checkpoint (+ vi) mark WP1–WP5 software
    readiness complete. The pilot packet waits for the owner's review and answers to
    D-1..D-15; real sending and activation stay owner-controlled.

Task: GOV-RECOVERY-ACCEPT

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest and staged count;
- new versus modified paths;
- the probe count and the secrets Grep count;
- check exit codes;
- any blockers.

Return at most 120 words, beginning with your self-reported model.

## Results

(Committer appends here.)
