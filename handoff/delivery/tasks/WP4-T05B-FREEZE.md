# WP4-T05B-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-T05B-FREEZE; package WP4; kind commit;
  attempt 1; depends on WP4-T05B.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (host folder deletion code), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  641ca109d9c9fca9bba020ae45e6f089c3f4c6ee. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, or any interactive shell.
  - Call Node 24 by its full portable path, and make the first shell call a trivial
    `node --version`. Stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP4-T05B-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID, and never redirect to /dev/null or nul.
  - Delete only files you created; never remove folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the changed or new paths may only be these:
- `src/server/ops/prune.ts` (new) and `tests/integration/backup-prune.test.ts` (new);
- `src/server/cli.ts`, `src/server/ops/backup.ts` and
  `tests/integration/backup.test.ts`.

Any other changed or untracked path outside handoff/ stops the commit. Also confirm,
with `git diff --name-only`, that nothing changed under `.claude/`, docs/, `reference/`,
`src/client/` or the migrations, and that `package.json` is unchanged.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
57be84423792186c4bd8d8de9bcbd7e22d12e41b27e1d983fd90834e3c84b7ed (756 files).

Handoff files to stage:
- New:
  - `handoff/delivery/tasks/WP4-T05B.md` and `handoff/delivery/tasks/WP4-T09.md`;
  - this brief, as it stands before you append results;
  - every file under `handoff/delivery/evidence/WP4-T05B/` and
    `handoff/delivery/evidence/WP4-T07B-FREEZE/`.
- Modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP4-T07B-FREEZE.md` (its results).

Your appended results and your evidence in `handoff/delivery/evidence/WP4-T05B-FREEZE/`
stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any backup folder, `manifest.json`, `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv` or
  database file;
- any `.md` file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP4-T05B-FREEZE/checks.txt`.
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
- A block in a source or test file stops the commit.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs or file bodies. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add backup pruning with the 7 daily, 4 weekly and 6 monthly policy

- feat(ops): `backup --to <dir> --prune` prunes only after a verified backup, and
  `backup prune --in <dir> --dry-run` shows the counts.
  - A backup is kept if it is the newest of one of the last 7 UTC days, 4 ISO weeks or
    6 UTC months, and the newest overall is always kept.
  - Only real direct-child folders with the tool name and a matching tool manifest are
    candidates. Everything else is counted, never removed.
  - Any target escape refuses the whole run. Output is counts only.
- test(ops): 21 tests written red-first. The mutation that drops the manifest check
  fails a test.
- docs(handoff): WP4-T05B records, the WP4-T09 brief, the WP4-T07B freeze result, board
  and checkpoint (+ vi).

Task: WP4-T05B-FREEZE

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
- Pre-HEAD 641ca109d9c9fca9bba020ae45e6f089c3f4c6ee (= origin/main); post-HEAD
  6fecd88e0328bab3603470ec35b8e9050528fbbc.
- Commit 6fecd88e0328bab3603470ec35b8e9050528fbbc, pushed: yes, remote SHA the same.
- Digest 57be8442...b7ed (756 files); staged count 20.
- Scope checks: working tree matched the expected set; no change under .claude/, docs/,
  reference/, src/client/, migrations or package.json.
- Check exit codes: all nine steps exit 0 (see evidence/WP4-T05B-FREEZE/checks.txt).
- Blockers: none.
