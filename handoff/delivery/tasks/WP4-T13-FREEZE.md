# WP4-T13-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-T13-FREEZE; package WP4; kind commit;
  attempt 1; depends on WP4-T13.
- This is the **package freeze for WP4-GATE**: the gate and the two audits review this
  commit.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M (canonical docs, root docs, the package freeze), novelty no. Records in
  English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  0f6abdf77c313f2dcb45bf624ee56294e5976c78. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, or any interactive shell.
  - Call Node 24 by its full portable path, and make the first shell call a trivial
    `node --version`. Stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP4-T13-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID, and never redirect to /dev/null or nul.
  - Delete only files you created; never remove folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the changed or new paths may only be these:
- new: `docs/11_OPERATIONS_RUNBOOK.md` and `docs/11_OPERATIONS_RUNBOOK.vi.md`;
- modified: `docs/03_ARCHITECTURE_AND_DATA.md` and `.vi.md`, `DEVELOPMENT.md` and
  `DEVELOPMENT.vi.md`, and `README.md` and `README.vi.md`.

Any other changed or untracked path outside handoff/ stops the commit. Also confirm,
with `git diff --name-only`, that nothing changed under `src/`, `tests/`, `scripts/`,
`.claude/`, `reference/`, AGENTS.md, CLAUDE.md or `package.json`.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
1ed67f55fb20c5bed64926c54ce635211f09c44ce33d50a2f88c8354577addfe (774 files).

Handoff files to stage:
- New:
  - `handoff/delivery/WP4_HANDOFF.md` and `handoff/delivery/WP4_HANDOFF.vi.md`;
  - `handoff/delivery/tasks/WP4-GATE.md`, `WP4-AUDIT-A.md` and `WP4-AUDIT-B.md`;
  - this brief, as it stands before you append results;
  - every file under `handoff/delivery/evidence/WP4-T13/` and
    `handoff/delivery/evidence/WP4-T12-FREEZE/`.
- Modified:
  - `handoff/delivery/tasks/WP4-T13.md` (its results);
  - `handoff/delivery/tasks/WP4-T12-FREEZE.md` (its results);
  - `handoff/delivery/ORCHESTRATION.json`;
  - the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in `handoff/delivery/evidence/WP4-T13-FREEZE/`
stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv` or database file;
- any `.md` file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP4-T13-FREEZE/checks.txt`.
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
- A block in a docs or root file stops the commit.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs or file bodies. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add the operations runbook, WP4 developer docs and the WP4 handoff

- docs(ops): new docs/11 operations runbook (+ vi), covering:
  - install on Synology, NAS checks and the first bootstrap;
  - scheduled backups with pruning, restore and reconciliation;
  - upgrade and rollback, image digest refresh, import and opening balance;
  - host alerts and admin status.
  Every command maps to a drill stage or is labelled an owner NAS step.
- docs: DEVELOPMENT and README (+ vi) gain the drill flags, the generator, the test
  files, migrations up to 0013 and the runbook link. docs/03 (+ vi) names the import
  and opening-balance routes.
- docs(handoff): the WP4 HANDOFF (+ vi) records tasks, coverage, decisions, open owner
  questions I-1..I-4, known limits and the audit focus. Also included: the WP4-GATE and
  WP4 audit briefs, the WP4-T12 freeze result, the board and the checkpoint (+ vi).

Task: WP4-T13-FREEZE

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest and staged count;
- the scope checks;
- check exit codes;
- any blockers.

Return at most 150 words, beginning with your self-reported model.

## Results

- Model: claude-sonnet-5-5. Node v24.21.0.
- Pre-HEAD 0f6abdf77c313f2dcb45bf624ee56294e5976c78; post-HEAD/commit
  13a258db86b2f0b6388830e584e2cca5303f1f6c; pushed yes; remote SHA the same.
- Digest 1ed67f55...addfe (774 files); staged 26.
- Scope checks: working-tree set matched; no change under src/tests/scripts/.claude/
  reference/AGENTS/CLAUDE/package.json.
- Check exit codes: all 0 (see evidence/WP4-T13-FREEZE/checks.txt). No fixes needed.
- Blockers: none.
