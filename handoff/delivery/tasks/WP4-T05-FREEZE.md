# WP4-T05-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-T05-FREEZE; package WP4; kind commit;
  attempt 1; depends on WP4-T05.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M (backup source and migration), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  3b2ddf2468fec9b04c0aeee526ae3c1bad6d0cf7. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Call Node 24 by its full portable path; plain `node` resolves v26 here.
  - Make the first shell call a trivial `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP4-T05-FREEZE` for TEMP/TMP and raw output.
  - Delete only files you created; never remove folders recursively.
  - Never open an interactive shell; never kill processes by PID. Run no docker
    command.
- The coordinator writes no file while you run.

## Expected working-tree set

Changed or new paths outside handoff/ may only be among these:
- `src/server/ops/backup.ts` and `src/server/ops/manifest.ts` (new);
- `src/server/db/migrations/0009_operations_backup.ts` (new);
- `src/server/cli.ts`, `src/server/db/migrations.ts` and
  `src/server/services/operationsStatus.ts`;
- `tests/integration/backup.test.ts` (new), `tests/integration/migrations.test.ts` and
  `tests/integration/bootstrap.test.ts`;
- `tests/support/concurrency.ts`;
- `scripts/container-drill.mjs`.

There must be no change under the client, `.claude/`, docs/, `package.json` or the lock
file.

Recompute the digest with Node 24 (`npm run digest`) immediately before `git add`. It
must equal 724d5cd8343fd276a3ad3d7708cd06d91c1b1901befab211990800b80d6f9d2e.

Handoff files to stage:
- New:
  - `handoff/delivery/tasks/WP4-T05.md`;
  - this brief, as it stands before you append results;
  - every file under `handoff/delivery/evidence/WP4-T04-FREEZE/` and `WP4-T05/`.
- Modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - the checkpoint pair;
  - `handoff/delivery/tasks/WP4-T04-FREEZE.md` (its results).

Leave your appended results and your evidence in
`handoff/delivery/evidence/WP4-T05-FREEZE/` unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw` file;
- any `.md` file under `evidence/`;
- any `.pdf`, `.eml`, `.csv` or database file;
- a backup folder or `manifest.json`;
- `mail-capture` or `private-data` content.

## Checks before committing

Run one command per step with Node 24 (by full path), and record each exit code:
1. `node --version`.
2. The digest.
3. `git add` with the explicit paths, as its own command.
4. The precommit check.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator.
8. check_recovery.py.
9. `validate_package.py --preflight` with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.

If `git diff --cached --check` flags only a blank line at EOF in a task record outside
`evidence/`, remove exactly that line and re-stage it.

If the precommit check blocks an email address or the Windows user name in an evidence
log, replace it with `<email>` or `<user>` in that file only, then re-stage and rerun.
A block in a source or test file stops the commit.

If any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it.

Never write into the repository root, and never redirect to /dev/null or nul. Do not
print diffs or file bodies. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add a consistent online backup with a hashed manifest and backup status

- feat(ops): `cli.js backup --to <dir>` is allowed in production and refuses a target
  inside DATA_DIR. It takes one SQLite online-backup step from its own read-only
  connection, so the copy is a single point-in-time read that includes the WAL. It then
  checks the integrity and foreign keys of the copy, copies every referenced file and
  verifies its SHA-256 and size.
- feat(ops): the manifest holds the app and schema versions, the UTC instant, the
  integrity result and the per-file and DB hashes, and no personal data. The backup is
  staged in a temporary folder and renamed into place.
- feat(db): migration 0009 records the backup status in operations_state.
- test(backup): a backup during a concurrent writer loop restores consistently. The
  no-WAL and no-hash mutations fail. Drill stage 2 runs inside the container.
- docs(handoff): the WP4-T04 freeze result, the WP4-T05 records, the board and the
  checkpoint (+ vi).

Task: WP4-T05-FREEZE

## Push and report

Push per the profile. Append to this brief:
- the pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- the digest and the staged count;
- the check exit codes;
- any blockers.

Write evidence to `handoff/delivery/evidence/WP4-T05-FREEZE/`, as `.txt` files only.
Return at most 150 words.

## Results

(Committer appends here.)
