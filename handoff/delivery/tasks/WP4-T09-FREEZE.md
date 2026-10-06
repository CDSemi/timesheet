# WP4-T09-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-T09-FREEZE; package WP4; kind commit;
  attempt 1; depends on WP4-T09.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M (migration, untrusted-input route, ownership), novelty no. Records in
  English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  6fecd88e0328bab3603470ec35b8e9050528fbbc. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, or any interactive shell.
  - Call Node 24 by its full portable path, and make the first shell call a trivial
    `node --version`. Stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP4-T09-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID, and never redirect to /dev/null or nul.
  - Delete only files you created; never remove folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the changed or new paths may only be these:
- New:
  - `src/server/db/migrations/0012_imports.ts`;
  - `src/server/services/workbookImport.ts`;
  - `src/server/routes/imports.ts`;
  - `tests/integration/workbook-import.test.ts`.
- Modified source:
  - `src/server/db/migrations.ts`, `src/server/app.ts` and `src/server/http/schemas.ts`;
  - `src/server/services/finalization.ts` and `src/server/services/timesheetCommands.ts`;
  - `src/server/jobs/sweepJob.ts`.
- Modified tests: `tests/integration/migrations.test.ts`, `job-retention.test.ts`,
  `ot-api.test.ts` and `sharing-matrix.test.ts`.

Any other changed or untracked path outside handoff/ stops the commit. Also confirm,
with `git diff --name-only` and without printing file bodies:
- nothing changed under `.claude/`, docs/, `reference/` or `src/client/`;
- `package.json` and `package-lock.json` are unchanged;
- no `.xlsx` file is untracked or staged.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
65f38459e2058c8070e3cab52b30aaad683372bdbbaa2e7ef4ac8d683edd336c (760 files).

Handoff files to stage:
- New:
  - `handoff/delivery/tasks/WP4-T09.md`, `handoff/delivery/tasks/WP4-T09B.md` and
    `handoff/delivery/tasks/WP4-T10.md`;
  - this brief, as it stands before you append results;
  - every file under `handoff/delivery/evidence/WP4-T09/` and
    `handoff/delivery/evidence/WP4-T05B-FREEZE/`.
- Modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP4-T05B-FREEZE.md` (its results).

Your appended results and your evidence in `handoff/delivery/evidence/WP4-T09-FREEZE/`
stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv` or database file;
- any `.md` file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP4-T09-FREEZE/checks.txt`.
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

Subject: Add owner-only workbook import with preview, conflict decisions and idempotent commit

- feat(import): migration 0012 adds `imports`.
  - It is unique on owner, source SHA-256 and mapping version.
  - Its identity, source and report are immutable, and rows are never deleted.
- feat(import): preview and commit.
  - Preview stores the source privately and reports source cells, findings, rules and
    a conflict plan.
  - Commit writes only imported_unverified timesheets, explicit day entries and owner
    audit rows, in one transaction.
  - Only new, ended, in-calendar periods are importable. Every listed day needs a
    decision.
  - A replay returns the first result, including under concurrency.
- feat(api): `/api/imports` is owner only, with a route-scoped 8 MiB upload limit.
  Others, administrators and share grantees get 404.
- feat(guard): imported periods answer 409 `imported_period` for sign-off, correction
  and edits, and are never automated.
- fix(jobs): the orphan sweep keeps import sources.
- test: 21 tests written red-first; five mutations are caught. The template hash is
  unchanged.
- docs(handoff): WP4-T09 records, the WP4-T09B and WP4-T10 briefs, the WP4-T05B freeze
  result, board and checkpoint (+ vi).

Task: WP4-T09-FREEZE

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

(Committer appends here.)
