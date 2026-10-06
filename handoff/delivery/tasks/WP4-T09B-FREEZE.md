# WP4-T09B-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-T09B-FREEZE; package WP4; kind commit;
  attempt 1; depends on WP4-T09B.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (backup and restore code), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  a67978722f76f28d791a9ed23aa59a642f8122c3. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, or any interactive shell.
  - Call Node 24 by its full portable path, and make the first shell call a trivial
    `node --version`. Stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP4-T09B-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID, and never redirect to /dev/null or nul.
  - Delete only files you created; never remove folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the changed paths may only be these:
- `src/server/ops/backup.ts`, `src/server/ops/manifest.ts` and
  `src/server/ops/restore.ts`;
- `src/server/http/security.ts` (a comment only);
- `tests/integration/backup.test.ts`, `restore.test.ts` and `backup-prune.test.ts`.

Any other changed or untracked path outside handoff/ stops the commit. Also confirm, with
`git diff --name-only`, that nothing changed under `.claude/`, docs/, `reference/`,
`src/client/` or the migrations, and that `package.json` is unchanged.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
b8db09bdb3380f3d9536427881504bdaaa69adb8a0aba56266eb0f3bafad55bc (760 files).

Handoff files to stage:
- New:
  - `handoff/delivery/tasks/WP4-T09B.md`;
  - this brief, as it stands before you append results;
  - every file under `handoff/delivery/evidence/WP4-T09B/` and
    `handoff/delivery/evidence/WP4-T09-FREEZE/`.
- Modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP4-T09-FREEZE.md` (its results);
  - `handoff/delivery/tasks/WP4-T10.md` (coordinator edits since the last commit).

Your appended results and your evidence in `handoff/delivery/evidence/WP4-T09B-FREEZE/`
stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any backup folder, `manifest.json`, `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv` or
  database file;
- any `.md` file under `evidence/`.

## Checks before committing

Run one command per step and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP4-T09B-FREEZE/checks.txt`.
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

Subject: Back up and restore workbook import sources with hash checks

- fix(ops): backup and restore now also cover `imports.storage_key` files.
  - This happens only when the imports table exists, so older schemas still back up.
  - Each file is checked against the recorded SHA-256 and size, as attachments are.
  - The manifest allowlist is unchanged.
- fix(ops): an older manifest restores when the DB has no imports rows. It is refused
  when imports rows exist, and a forged or tampered source is refused.
- docs(http): the security comment names both route-scoped upload exceptions.
- test(ops): 6 tests written red-first; the import-keys mutation fails 4 tests.
- docs(handoff): WP4-T09B records, the WP4-T09 freeze result, the WP4-T10 brief update,
  board and checkpoint (+ vi).

Task: WP4-T09B-FREEZE

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
- Pre-HEAD a67978722f76f28d791a9ed23aa59a642f8122c3; post-HEAD and commit SHA
  1b4d81722023f085752b85d1646e6fe928919d76; pushed true; remote SHA the same; branch main.
- Digest b8db09bd...ad55bc (760 files); staged 21.
- Scope checks: no changes under .claude/, docs/, reference/, src/client/, package.json;
  note: WP4-T09B.md was tracked-modified (not new) and WP4-T10.md had no changes.
- Checks: all exit 0 (see evidence/WP4-T09B-FREEZE/checks.txt).
- Blockers: none.
