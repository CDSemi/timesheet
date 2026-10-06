# GOV-SKILL-REMOVE-ACCEPT dispatch brief

- Mission/task: timesheet-software-readiness / GOV-SKILL-REMOVE-ACCEPT; package GOV;
  kind commit; attempt 1; depends on GOV-SKILL-REMOVE-AUDIT (PASS).
- Purpose: commit the records that close the readme-md removal, together with the
  WP4-T07B brief:
  - the gate result;
  - the audit result and the bilingual review;
  - the board and the checkpoint.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L (handoff records only), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  a92335184e7dc09b2114ec30a46979ecd02ab92a. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, or any interactive shell.
  - Call Node 24 by its full portable path, and make the first shell call a trivial
    `node --version`. Stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\GOV-SKILL-REMOVE-ACCEPT` for TEMP/TMP and raw output.
  - Never kill processes by PID, and never redirect to /dev/null or nul.
  - Delete only files you created; never remove folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Nothing outside handoff/ may be changed or untracked. If anything is, stop and report.

Recompute the digest with Node 24 immediately before `git add`. It must equal
fcd8fe1e859ca34b63c6b82e2d4f593c8bfd422a2d8b04f24d056f82bb6b194c (750 files).

Handoff files to stage:
- New:
  - `handoff/delivery/GOV_SKILL_REMOVE_REVIEW.md` and `.vi.md`;
  - `handoff/delivery/tasks/GOV-SKILL-REMOVE-GATE.md`,
    `handoff/delivery/tasks/GOV-SKILL-REMOVE-AUDIT.md` and
    `handoff/delivery/tasks/WP4-T07B.md`;
  - this brief, as it stands before you append results;
  - every file under `handoff/delivery/evidence/GOV-SKILL-REMOVE-GATE/`,
    `handoff/delivery/evidence/GOV-SKILL-REMOVE-AUDIT/` and
    `handoff/delivery/evidence/GOV-SKILL-REMOVE-FREEZE/`.
- Modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/NEXT_ACTION.md` and `handoff/NEXT_ACTION.vi.md`;
  - the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/GOV-SKILL-REMOVE-FREEZE.md` (its results).

Your appended results and your evidence in
`handoff/delivery/evidence/GOV-SKILL-REMOVE-ACCEPT/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes a file
named `nul`, and any `.md` file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the output of every step,
masked, in `handoff/delivery/evidence/GOV-SKILL-REMOVE-ACCEPT/checks.txt` (audit note
R2):
1. `node --version`.
2. The digest.
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator.
8. `check_recovery.py`.
9. `validate_package.py --preflight` with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.

Allowed fixes:
- If `git diff --cached --check` flags only a blank line at EOF in a task record outside
  `evidence/`, remove exactly that line and re-stage it.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log, replace it with `<email>` or `<user>` in that file only, then re-stage and rerun.

When to stop:
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs or file bodies. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Record the gate and audit PASS for removing the readme-md skill

- docs(handoff): GOV-SKILL-REMOVE-GATE passed 7 of 7 checks at a923351:
  - exactly three deletions, with no residual reference;
  - clean-export verify with 1589 tests;
  - digest fcd8fe1e, 750 files.
- docs(handoff): GOV-SKILL-REMOVE-AUDIT passed with no findings
  (GOV_SKILL_REMOVE_REVIEW.md + vi). GOV-SKILL-01..04 and N1 are closed. The review
  also records notes for the owner, including that the removed files remain in public
  history.
- docs(handoff): board (current source digest updated), NEXT_ACTION, checkpoint (+ vi),
  and the WP4-T07B brief.

Task: GOV-SKILL-REMOVE-ACCEPT

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest and staged count;
- check exit codes;
- any blockers.

Return at most 120 words, beginning with your self-reported model.

## Results

- Pre-HEAD a92335184e7dc09b2114ec30a46979ecd02ab92a; post-HEAD and commit
  c398cab2ec896999543589c574bd0ac701247a7d; pushed yes; remote SHA the same.
- Digest fcd8fe1e859ca34b63c6b82e2d4f593c8bfd422a2d8b04f24d056f82bb6b194c (750 files);
  staged 27 files.
- Node v24.21.0 by full path (a first call through PATH gave v26, rerun with full path).
- Exit codes, all 0: digest, add, precommit, diff --check, JSON parse, validator,
  check_recovery, validate_package --preflight. Evidence: evidence/GOV-SKILL-REMOVE-ACCEPT/checks.txt.
- No fixes applied; no blockers.
