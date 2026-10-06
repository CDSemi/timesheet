# WP4-T07B dispatch brief

- Mission/task: timesheet-software-readiness / WP4-T07B; package WP4; kind implement;
  attempt 1; depends on WP4-DEC-FREEZE.
- Title: the administrator "not set up" flag (F-3) and job-row retention (F-4).
- Owner decisions: F-3 (a) and F-4 (a), 2026-10-05, quoted verbatim in the board's
  `owner_decisions`. WP4-DEC recorded them as canonical rules: docs/03, section "Imports,
  opening balance and retention", and docs/10. Implement exactly those rules.
  - Backup pruning (F-5) is a separate later task, WP4-T05B. Do not implement it here.
- Profile/routing: timesheet-worker-high, requested sonnet, no override. Effort stays at
  the profile's level, high.
  - Routing: size M, risk H, not novel. The risk comes from the exception on the
    immutable `jobs` table and from the admin privacy boundary.
  - Records in English.
- Read AGENTS.md from disk first, including the UI standards:
  - the three taste skills;
  - the E-8 CSS custom properties;
  - the 4px radius, the shared transition token and `--shadow-panel`.
- Then read:
  - [WP4-PLAN](WP4-PLAN.md): observations O8, the task entry "WP4-T07", section C
    (carry item 4 and RBC2 R3) and section D;
  - [WP4-T07](WP4-T07.md): its results; the admin status and the daily sweep already
    exist;
  - docs/03 "Imports, opening balance and retention" and docs/03:34 (the admin
    boundary);
  - docs/05: the H-Q1 (a) rule. Never-configured accounts get no automation and no
    overdue state;
  - docs/07 "Backup, restore and upgrades";
  - `src/server/db/migrations/0004_submission.ts` (`jobs` and `jobs_no_delete`) and
    `src/server/db/migrations.ts`;
  - `src/server/jobs/runner.ts`, `jobStore.ts` and `sweepJob.ts`;
  - `src/server/services/operationsStatus.ts` and `src/server/routes/admin.ts`;
  - `src/client/components/AdminUsers.tsx`, `src/client/adminModel.ts` and
    `src/client/styles.css`.
- Baseline: main at c398cab2ec896999543589c574bd0ac701247a7d. Its source equals
  a923351 (digest fcd8fe1e…, 750 files). The working tree differs only in handoff/.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, PowerShell without `-Command`, or
  any interactive shell. Call Node 24 by its full portable path, or put it first on PATH
  in Git Bash; plain `node` resolves v26. Make the first shell call a trivial
  `node --version`, and stop on ENOSPC.
- Use `D:\.claude-tmp\timesheet\WP4-T07B` for TEMP/TMP, scratch clones and all raw
  output. Put only masked `.txt` copies and `*-synthetic.png` screenshots in evidence.
- Run mutation checks only in a scratch clone.
- Delete only files you created, never inside the repository. Never remove folders
  recursively.
- Never kill processes by PID. Run no docker command. Never write into the repository
  root. Never redirect to /dev/null or nul.
- Keep shell calls in the foreground, and leave no background process.
- Write task records with the Edit tool, not shell heredocs.
- If a permission check denies a call, stop and report. Do not retry or rephrase it.
- Do not commit.

## Required changes

1. **F-3: the "not set up" flag.**
   - The admin user list shows a per-person "not set up" flag for an account whose
     settings were never saved. Use the same condition the H-Q1 (a) automation rule
     uses; do not invent a second definition.
   - The flag is a boolean only. It exposes no settings values, periods, entries or
     dates, per docs/03:34.
   - The exact key allowlist test of the admin JSON must include it.
   - Confirm with a test that a never-configured account still gets no overdue warning
     and no automation. WP3 implemented this, so add a test only if none exists.
2. **F-4: job-row retention.**
   - Add the new migration `0011_job_retention.ts` (the next free number; the schema is
     at 10).
   - It keeps `jobs_no_delete` for every row except succeeded `deadline_scan` and
     `reminder_scan` jobs that finished more than 30 days ago. Rebuild the trigger with
     that narrow exception, and test that every other delete is still refused.
   - Delivery, PDF and send rows, and any row referenced by another table, are never
     deletable.
   - The daily maintenance job deletes the eligible rows and records counts only. Reuse
     the WP4-T07 sweep schedule, or add a sibling job with its own idempotent day key.
   - The 30-day cut-off comes from the injected clock. Tests must not depend on the
     season or on wall time.
   - Migrations stay exclusive and checksummed. Run a fresh 1→11 migration, and an
     upgrade from v10 on a populated DB.
3. **Status.** The admin operations status may show the last retention run's count,
   only if it fits the existing allowlist pattern; counts only.

## Owned (writable) paths

- Server:
  - new `src/server/db/migrations/0011_job_retention.ts`;
  - `src/server/db/migrations.ts`;
  - `src/server/jobs/runner.ts`, `jobStore.ts` and `sweepJob.ts`, or a new
    `src/server/jobs/retentionJob.ts`;
  - `src/server/services/operationsStatus.ts` and `src/server/routes/admin.ts`.
- Client: `src/client/components/AdminUsers.tsx`, `src/client/adminModel.ts`,
  `src/client/api.ts` (types only) and `src/client/styles.css` (tokens only).
- Tests:
  - `tests/integration/operations-status.test.ts`;
  - a new `tests/integration/job-retention.test.ts`;
  - `tests/integration/migrations.test.ts`, `bootstrap.test.ts` and `upgrade.test.ts`,
    for migration-number pins only;
  - `tests/client/adminModel.test.ts`;
  - `tests/e2e/admin-status.spec.ts` or a new `tests/e2e/admin-users.spec.ts`.
- This report and `handoff/delivery/evidence/WP4-T07B/`.

List any other minimal edit as a deviation. Do not touch `.claude/`, docs/ or other
migrations.

## Checks

- Red-first tests, saving the red output:
  - the admin JSON exact key allowlist, including the flag;
  - an eligible scan job older than 30 days is deleted, and one 29 days old is kept;
  - a failed scan job, a send, PDF or delivery job, and a referenced row are never
    deleted. A direct `DELETE` on such a row must still be refused by the trigger;
  - the retention job is idempotent per day.
- Mutation, in a scratch clone: widen the trigger exception to any kind. A test must
  fail.
- e2e: capture `admin-users-not-set-up-desktop-synthetic.png` and
  `admin-users-not-set-up-mobile-synthetic.png` on the installed Edge channel, and view
  them yourself.
- UI standards: grep your CSS diff for hard-coded colours, lengths, durations and
  shadows. There must be none.
- Last commands, after the final edit:
  1. `npm run test:e2e` (both projects);
  2. `npm run verify` (with `--trace-deprecation --pending-deprecation`);
  3. `npm run digest`.

  Rerun them if any file changes afterwards.
- Evidence:
  - masked (`<email>`, `<user>`), LF;
  - run the precommit check over it on a temporary index;
  - synthetic data only; no deprecated APIs.

Return at most 160 words, beginning with your self-reported model:
- the flag definition;
- the trigger exception and the retention job;
- the tests (red→green) and the mutation result;
- the migrations;
- the screenshots you viewed;
- the CSS check;
- the e2e and verify exit codes and the test count;
- the digest;
- every changed path;
- deviations.

## Results

Self-reported model: claude-sonnet-5-5. Status: done, all required checks green; nothing committed.

### F-3 flag
- `GET /api/admin/users` and the create, update, deactivate and reactivate responses carry one new key, `not_set_up`
  (boolean). It is `!hasSavedSettings(db, user.id)`: `hasSavedSettings` in `automation.ts` is the function the deadline
  scan already used to tell `not_configured` from `before_effective` (H-Q1 (a)); it is now exported, so there is one
  definition. No settings value, period, entry or date is exposed.
- The exact key lists that pin the admin account JSON include it: `tests/integration/operations-status.test.ts`
  (new `USER_PATHS`, inside the privacy-boundary test, with forbidden-needle and forbidden-key scans over the users
  response too), and the existing pins in user-admin, isolation, the isolation e2e and the smoke script.
- Never-configured accounts still get no automation and no overdue record: already pinned by
  `tests/integration/deadline.test.ts` ("never automates an account that never saved ..." and "records the overdue
  period for an account that saved auto-submit off, and nothing for one that never saved"); no new test added.
- UI: `AdminUsers.tsx` shows a `badge badge-warn` "Not set up" and a `hint muted` sentence from the new pure
  `setupFlag()` in `src/client/components/adminModel.ts` (the brief named `src/client/adminModel.ts`; the file is under
  `components/`). No CSS change at all: existing `.badge-warn`, `.hint`, `.muted` reuse the E-8 tokens.

### F-4 retention
- Migration `0011_job_retention.ts` (version 11, `job_retention`): rebuilds `jobs_no_delete` as
  `WHEN COALESCE(kind IN (deadline_scan, reminder_scan) AND state = 'succeeded' AND updated_at < as_of - 30 days AND no
  delivery_attempts row AND no reminder_occurrences row, 0) = 0 -> RAISE(ABORT, 'immutable_job')`. A trigger cannot see
  the injected clock, so the instant travels in a new single-row table `job_retention_window(id = 1, as_of)`, NULL
  (closed) except inside the retention job's own transaction; the 30 days and the kinds live only in the trigger. The
  COALESCE matters: a NULL comparison (window closed) would otherwise let the delete through. The migration also adds
  `operations_state.job_retention_last_run_at` and `job_retention_last_deleted` (shape trigger: both or neither).
- `src/server/jobs/retentionJob.ts`: kind `job_retention`, one job per UTC day (`job_retention:<day>`), enqueued by the
  runner next to the sweep for any runner that owns the handler, not an outbound kind (so the pause never holds it back),
  registered in `createJobHandlers` (`onRetention`, counts-only log line when it deleted something). It deletes in chunks
  of 1000, each its own transaction that opens the window, deletes eligible rows and closes the window; referenced rows
  are excluded in its own WHERE so one referenced row never aborts a batch. Exactly 30 days is kept (strictly more than).
- Status: `operations.retention = { last_run_at, last_deleted }` (instant and count only) in the admin operations JSON,
  allowlisted in `OPERATIONS_PATHS`. The `OperationsStatus` type in `api.ts` has it; `OperationsStatus.tsx` is not an owned
  path, so the screen does not display it yet.

### Tests, red to green
- Red first (`evidence/WP4-T07B/red.txt`): 6 failed in operations-status and adminModel; `job-retention.test.ts` failed to
  import the missing module, so its tests did not run red individually (honest note). Then green.
- New `tests/integration/job-retention.test.ts` (18 tests): 31-day scan job deleted and 29-day kept, exactly 30 days
  kept, cut-off follows the injected clock; failed/cancelled/queued scans and send, send_reminder, render_pdf,
  orphan_sweep, job_retention rows never deleted; referenced scan row kept and the job still succeeds; direct DELETE refused
  by the trigger with the window closed, and for every non-eligible row (including a 29-day row and a referenced row) with the
  window open; per-UTC-day idempotency; outbound pause does not hold it; production registration; counts only; window
  single-row; migration fresh 1 to 11 and upgrade from a populated v10 database. Also operations-status tests for the flag
  (cleared on first save, same condition, create response, writes nothing) and for the retention status; adminModel test.
- Mutation (scratch clone, kind condition removed from the trigger): 2 tests fail (`mutation.txt`).
- e2e `tests/e2e/admin-users.spec.ts` (desktop and mobile): only the never-configured account is flagged.

### Migrations
- Fresh 1 to 11 and upgrade of a populated v10 database are tested (job-retention.test.ts); `migrations.test.ts` pins
  updated to 11 (names list, tables incl. `job_retention_window`, operations_state columns); restore.test.ts keeps its
  migration-0010 tests on the 1-to-10 set (`UP_TO_10`).

### Screenshots viewed
`admin-users-not-set-up-desktop-synthetic.png` and `admin-users-not-set-up-mobile-synthetic.png`: the badge sits in the
account head beside Active, the sentence below it, no sideways scroll on mobile; the configured account has no flag.

### CSS check
`git diff src/client/styles.css` is empty: no colour, length, duration or shadow added.

### Last commands (after the final edit)
- `npm run test:e2e`: exit 0, 133 passed, 5 skipped.
- `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify`: exit 0, 71 files, 1613 tests, SMOKE PASSED, no deprecation line.
- `npm run digest`: `7fe65713f54a427b290ba3c67895bedeb4dd0c1d596504d6765aa73fc7ebbfb4` (754 files, handoff/ excluded).
- Precommit check on a temporary index over the changed files and the evidence: `evidence/WP4-T07B/precommit.txt`.

### Changed paths
- New: `src/server/db/migrations/0011_job_retention.ts`, `src/server/jobs/retentionJob.ts`,
  `tests/integration/job-retention.test.ts`, `tests/e2e/admin-users.spec.ts`, `handoff/delivery/evidence/WP4-T07B/`.
- Owned and changed: `src/server/db/migrations.ts`, `src/server/jobs/runner.ts`, `src/server/services/operationsStatus.ts`,
  `src/server/routes/admin.ts`, `src/client/components/AdminUsers.tsx`, `src/client/components/adminModel.ts`,
  `src/client/api.ts`, `tests/integration/operations-status.test.ts`, `tests/integration/migrations.test.ts`,
  `tests/client/adminModel.test.ts`, this brief.
- `jobStore.ts`, `sweepJob.ts`, `src/client/styles.css`, `bootstrap.test.ts`, `upgrade.test.ts`: unchanged (not needed).

### Deviations (minimal edits outside the owned list)
1. `src/server/services/automation.ts`: `hasSavedSettings` exported with a doc comment (one definition of "set up").
2. Pins that the new job and key broke, mechanical: `tests/integration/delivery.test.ts` and `jobs-restart.test.ts`
   (a full-handler pass now also claims the daily retention job: claimed +1), `tests/integration/restore.test.ts`
   (migration-0010 tests use the 1-to-10 set), `tests/integration/user-admin.test.ts` and `isolation.test.ts`
   (`not_set_up` in the account key list), `tests/e2e/isolation.spec.ts` (same), `tests/e2e/automation.spec.ts` (job-count
   caps 1 to 2 and 2 to 4 for sweep plus retention), `scripts/smoke-built-server.mjs` (account field list).
3. The admin router keeps its reviewed import list: `accountJson` types its db as `AppDeps['db']` instead of importing `Db`.
4. `adminModel.ts` is at `src/client/components/adminModel.ts`, not `src/client/adminModel.ts`.
5. `handoff/delivery/tasks/WP4-T05B.md` appeared untracked during the task; it is not mine and was not touched.

Commit description: Add the administrator "not set up" flag and 30-day retention of succeeded scan job rows (migration 0011).
