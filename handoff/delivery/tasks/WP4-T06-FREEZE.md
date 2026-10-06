# WP4-T06-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-T06-FREEZE; package WP4; kind commit;
  attempt 1; depends on WP4-T06.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M (restore source and migration), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  0c58130217eb0babd2b870b61a1457d7109d1a15. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Call Node 24 by its full portable path; plain `node` resolves v26 here.
  - Make the first shell call a trivial `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP4-T06-FREEZE` for TEMP/TMP and raw output.
  - Delete only files you created; never remove folders recursively.
  - Never open an interactive shell; never kill processes by PID. Run no docker
    command.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the changed or new paths may only be these:
- `src/server/ops/restore.ts` and `src/server/db/migrations/0010_outbound_pause.ts`
  (new);
- `src/server/cli.ts`, `src/server/db/migrations.ts`, `src/server/jobs/jobStore.ts`,
  `src/server/jobs/runner.ts`, `src/server/index.ts` and
  `src/server/services/operationsStatus.ts`;
- `tests/integration/restore.test.ts` (new);
- `tests/integration/jobs-restart.test.ts`, `tests/integration/migrations.test.ts` and
  `tests/integration/backup.test.ts`;
- `scripts/container-drill.mjs`.

Nothing may change under the client, `.claude/`, docs/, `package.json` or the lock file.

Recompute the digest with Node 24 (`npm run digest`) immediately before `git add`. It
must equal 15b7422e17de30a746945f64d6c98d5f6e24f792a37fadb3f0165c7f6f43b781.

Handoff files to stage:
- new:
  - `handoff/delivery/tasks/WP4-T06.md`;
  - this brief, as it stands before you append results;
  - every file under `handoff/delivery/evidence/WP4-T05-FREEZE/` and `WP4-T06/`;
- modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - the checkpoint pair;
  - `handoff/delivery/tasks/WP4-T05-FREEZE.md` (its results).

Your appended results and your evidence in `handoff/delivery/evidence/WP4-T06-FREEZE/`
stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw` file;
- any `.md` file under evidence/;
- any `.pdf`, `.eml`, `.csv` or database file;
- a backup or restore folder, or a `manifest.json`;
- `mail-capture` or `private-data` content.

## Checks before committing

Run one command per step with Node 24 by its full path, and record each exit code:
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

Allowed fixes:
- If `git diff --cached --check` flags only a blank line at EOF in a task record outside
  evidence/, remove exactly that line and re-stage it.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log, replace it with `<email>` or `<user>` in that file only, then re-stage and rerun.

A block in a source or test file stops the commit. If any call is denied by a
permission check, stop at once. Do not retry, split or rephrase it.

Never write into the repository root, and never redirect to /dev/null or nul. Do not
print diffs or file bodies. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add an outbound pause and an isolated restore that holds backed-up sends

- feat(jobs): migration 0010 persists the outbound pause. While it is set, the runner
  claims no send_email or send_reminder job, so nothing is sent and no attempt is spent.
  PDF rendering and scans continue.
- feat(ops): `cli.js restore --from --to`:
  - verifies the manifest hashes, the integrity and the schema, and refuses a newer
    schema, the live DATA_DIR and a non-empty target;
  - copies the database and the files, migrates them and sets the pause with the reason
    `restored`;
  - marks sending and preparing attempts uncertain;
  - holds every queued or leased send from the backup for reconciliation.
- feat(ops): `outbound release --job|--all --confirm` and `outbound drop` (reminders
  only). A run without `--confirm` only previews. Both are audited and refused while an
  attempt is uncertain or open. `outbound resume --confirm` is refused while any
  decision is pending.
- test(restore): restore and pause tests and AC-08 regressions; drill stage 3 includes a
  second-generation restore.
- docs(handoff): the WP4-T05 freeze result, the WP4-T06 records, the board and the
  checkpoint (+ vi).

Task: WP4-T06-FREEZE

## Push and report

Push per the profile. Append to this brief:
- the pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- the digest and the staged count;
- the check exit codes;
- any blockers.

Write evidence to `handoff/delivery/evidence/WP4-T06-FREEZE/` as `.txt` only. Return at
most 150 words.

## Results

(Committer appends here.)

Attempt 1 (timesheet-committer, Sonnet 5.5):
- Pre-HEAD 0c58130217eb0babd2b870b61a1457d7109d1a15; post-HEAD and commit
  72ab2ed134c26656643eb00542e54a94bb07a4c7; pushed yes; remote SHA the same.
- Digest 15b7422e17de30a746945f64d6c98d5f6e24f792a37fadb3f0165c7f6f43b781 (match);
  staged 39; Node v24.21.0.
- Exit codes: precommit 0, diff --check 0, JSON parse 0, orchestration validator 0,
  check_recovery 0, preflight 0.
- Blockers: none. Evidence: handoff/delivery/evidence/WP4-T06-FREEZE/ (unstaged).
