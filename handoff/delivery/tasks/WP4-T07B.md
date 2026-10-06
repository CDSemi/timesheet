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
- Baseline: main at a92335184e7dc09b2114ec30a46979ecd02ab92a. The working tree differs
  only in handoff/.

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

(Worker appends here.)
