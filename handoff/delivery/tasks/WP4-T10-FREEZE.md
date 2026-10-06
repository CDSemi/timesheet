# WP4-T10-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-T10-FREEZE; package WP4; kind commit;
  attempt 1; depends on WP4-T10.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M (a ledger table rebuild and a migration-runner change), novelty no.
  Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  1b4d81722023f085752b85d1646e6fe928919d76. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, or any interactive shell.
  - Call Node 24 by its full portable path, and make the first shell call a trivial
    `node --version`. Stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP4-T10-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID, and never redirect to /dev/null or nul.
  - Delete only files you created; never remove folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the changed or new paths may only be these:
- New: `src/server/db/migrations/0013_ot_opening_balance.ts` and
  `tests/integration/opening-balance.test.ts`.
- Modified source: `src/server/db/migrations.ts`, `src/server/services/ledger.ts`,
  `src/server/services/otLeave.ts`, `src/server/services/otEvidence.ts`,
  `src/server/routes/ot.ts` and `src/server/http/schemas.ts`.
- Modified tests: `tests/integration/ledger.test.ts`, `migrations.test.ts`,
  `evidence-export.test.ts`, `ot-api.test.ts`, `job-retention.test.ts`,
  `workbook-import.test.ts`, `restore.test.ts` and `sharing-matrix.test.ts`.

A listed path that is unchanged is fine; report it. Any changed or untracked path
outside handoff/ that is not listed stops the commit.

Also confirm with `git diff --name-only`, without printing file bodies:
- nothing changed under `.claude/`, docs/, `reference/` or `src/client/`;
- `package.json` and `package-lock.json` are unchanged.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
260ca3636646398e9fe49f40515517bb395ef848c7ac1b4562024823f51ad460 (762 files).

Handoff files to stage:
- New:
  - `handoff/delivery/tasks/WP4-T11.md`;
  - this brief, as it stands before you append results;
  - every file under `handoff/delivery/evidence/WP4-T10/` and
    `handoff/delivery/evidence/WP4-T09B-FREEZE/`.
- Modified:
  - `handoff/delivery/tasks/WP4-T10.md` (its results);
  - `handoff/delivery/tasks/WP4-T09B-FREEZE.md` (its results);
  - `handoff/delivery/ORCHESTRATION.json`;
  - the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in `handoff/delivery/evidence/WP4-T10-FREEZE/`
stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv` or database file;
- any `.md` file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP4-T10-FREEZE/checks.txt`.
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

Subject: Add the explicit opening OT balance and refuse OT leave use in imported periods

- feat(ledger): migration 0013 rebuilds `ot_ledger` by SQLite's 12-step procedure with
  entry type `opening_balance`.
  - Rows, rowids, indexes and append-only triggers are preserved.
  - New columns: `as_of_date` and `evidence_ref`.
  - A partial unique index allows one opening balance per user.
- fix(db): `migrate()` turns foreign keys off around the exclusive migration and runs
  `foreign_key_check` before COMMIT, rolling back on a violation. `defer_foreign_keys`
  alone fails a table rebuild.
- feat(api): `GET`, `POST` and `PUT /api/ot/opening-balance` are owner only.
  - Posting needs signed non-zero minutes, an as-of date, a reason and evidence. The
    same content is a no-op.
  - A correction posts one reasoned entry.
  - The evidence export labels the new type.
- fix(ot): recording OT leave use inside an imported period answers 409
  `imported_period`.
- test: tests were red first (26 failures). The trigger-drop mutation fails 4 tests.
  The R4 stale-review test is added.
- docs(handoff): WP4-T10 records, the WP4-T11 brief, the WP4-T09B freeze result, board
  and checkpoint (+ vi).

Task: WP4-T10-FREEZE

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
- Pre-HEAD 1b4d81722023f085752b85d1646e6fe928919d76; post-HEAD aff904a89c6a85b3963616eddf676cef0979370b.
- Commit aff904a; pushed yes; remote SHA aff904a89c6a85b3963616eddf676cef0979370b (main).
- Digest 260ca363...ad460 (762 files); staged 34.
- Scope checks: working tree matched the brief; nothing under .claude/, docs/, reference/, src/client/, package files.
- Check exit codes: all 0 (see evidence/WP4-T10-FREEZE/checks.txt).
- Blockers: none. No fixes, no unstaging, no masking needed.
