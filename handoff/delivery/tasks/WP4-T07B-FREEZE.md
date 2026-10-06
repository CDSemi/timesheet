# WP4-T07B-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-T07B-FREEZE; package WP4; kind commit;
  attempt 1; depends on WP4-T07B.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M (a migration and an exception on an immutable table), novelty no.
  Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  c398cab2ec896999543589c574bd0ac701247a7d. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, or any interactive shell.
  - Call Node 24 by its full portable path, and make the first shell call a trivial
    `node --version`. Stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP4-T07B-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID, and never redirect to /dev/null or nul.
  - Delete only files you created; never remove folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the changed or new paths may only be these.

New:
- `src/server/db/migrations/0011_job_retention.ts`;
- `src/server/jobs/retentionJob.ts`;
- `tests/integration/job-retention.test.ts`;
- `tests/e2e/admin-users.spec.ts`.

Modified:
- `src/server/db/migrations.ts`, `src/server/jobs/runner.ts`,
  `src/server/services/operationsStatus.ts`, `src/server/services/automation.ts` and
  `src/server/routes/admin.ts`;
- `src/client/components/AdminUsers.tsx`, `src/client/components/adminModel.ts` and
  `src/client/api.ts`;
- `tests/integration/operations-status.test.ts`, `migrations.test.ts`,
  `delivery.test.ts`, `jobs-restart.test.ts`, `restore.test.ts`, `user-admin.test.ts`
  and `isolation.test.ts`;
- `tests/client/adminModel.test.ts`;
- `tests/e2e/isolation.spec.ts` and `tests/e2e/automation.spec.ts`;
- `scripts/smoke-built-server.mjs`.

A listed path that is unchanged is fine; report it. Any changed or untracked path
outside handoff/ that is not listed stops the commit. Also confirm, with `git diff
--name-only`, that nothing changed under `.claude/`, docs/, `reference/` or
`src/client/styles.css`, and that `package.json` and `package-lock.json` are unchanged.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
7fe65713f54a427b290ba3c67895bedeb4dd0c1d596504d6765aa73fc7ebbfb4 (754 files).

Handoff files to stage:
- New:
  - `handoff/delivery/tasks/WP4-T07B.md` and `handoff/delivery/tasks/WP4-T05B.md`;
  - this brief, as it stands before you append results;
  - every file under `handoff/delivery/evidence/WP4-T07B/` (including the two
    `*-synthetic.png` screenshots) and `handoff/delivery/evidence/GOV-SKILL-REMOVE-ACCEPT/`.
- Modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/GOV-SKILL-REMOVE-ACCEPT.md` (its results).

Your appended results and your evidence in `handoff/delivery/evidence/WP4-T07B-FREEZE/`
stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv` or database file;
- any `.md` file under `evidence/`;
- a `.png` that is not one of the two named screenshots.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP4-T07B-FREEZE/checks.txt`.
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
- A block in a source, test or script file stops the commit.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs or file bodies. Keep evidence LF and `.txt` (screenshots excepted).

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add the administrator "not set up" flag and 30-day retention of scan job rows

- feat(admin): the account JSON and the user list show `not_set_up`, a boolean.
  - It reuses the H-Q1 (a) `hasSavedSettings` condition, now exported.
  - No settings values are exposed.
  - The UI shows a "Not set up" badge using existing tokens.
- feat(jobs): migration 0011 rebuilds `jobs_no_delete` with a narrow exception.
  - Only succeeded `deadline_scan` and `reminder_scan` rows qualify. They must be older
    than 30 days relative to a single-row retention window that is open only inside the
    retention job's transaction, and must not be referenced by delivery attempts or
    reminder occurrences.
  - A daily `job_retention` job deletes them in chunks and records counts only. The
    admin operations status reports the last run.
- test: 18 retention tests, the flag and allowlist tests, and an e2e on desktop and
  mobile. The mutation that drops the kind condition fails 2 tests. Count and key pins
  are updated for the new daily job and the new key.
- docs(handoff): WP4-T07B records, the WP4-T05B brief, the GOV-SKILL-REMOVE-ACCEPT
  result, board and checkpoint (+ vi).

Task: WP4-T07B-FREEZE

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
