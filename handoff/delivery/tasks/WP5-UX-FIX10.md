# WP5-UX-FIX10 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-FIX10; package WP5; kind fix;
  attempt 1; addresses audit WP5-UX-AUDIT-AB8 (FIX REQUIRED); depends on WP5-UX-REGATE7
  (PASS).
- Scope: **tests only**. Fix WP5-UX-AB8-01..AB8-04. Read the "Findings" table in
  `handoff/delivery/WP5_UX_REVIEW_AB8.md` and the auditor's evidence
  `handoff/delivery/evidence/WP5-UX-AUDIT-AB8/` (`11-…` to `14-…`).
  - **AB8-01:** `automation.spec.ts:118` and `pdf-visual.spec.ts:187` need a displayed
    period whose due is still ahead. From the due Tuesday about 17:00 to the end of the
    payroll date, they fail. Run the deadline scenario on a period whose due is ahead
    (for example `in_progress` or the next period from `/api/periods`). Keep every
    assertion, and keep the docs/05 line 26 activation rule.
  - **AB8-02:** `shell.spec.ts:67` and `timesheet.spec.ts:189` seed days for the
    worker-shared employee and never release them. On 2026-11-28..11-30 the displayed
    period has only 3 past normal workdays, so `timesheet.spec.ts:403` runs out. Release
    the seeded days (`finally`), or use per-test accounts. Check every spec's per-worker
    demand against the minimum pool.
  - **AB8-03:** `admin.spec.ts:281` imports `${year}-01-01` from the displayed period's
    start on the shared calendar, which another spec finalizes. Use import dates outside
    the displayed period, or a calendar that no other test finalizes. Keep the
    stale-hash and no-change assertions.
  - **AB8-04:** `admin.spec.ts:290` expects "today's year + 1" without a next-year
    warning. The client's `defaultImportYear` (`src/client/components/adminModel.ts:93-95`)
    uses the warning year, else the current year. Compute the expected year with the
    client's rule, or import it. Keep every assertion.
- Coordinator decision (board `coordinator_decisions`, 2026-10-13):
  - Before you return, run the auditor's simulated-clock sweep of the FULL suite.
  - Fix every calendar failure that the sweep shows in the same round, as long as the fix
    is test-only. Do not leave one for the next audit.
  - Make no product change.
- Profile/routing: timesheet-worker-high (effort high), requested model sonnet, no
  override. Routing: size M, risk M (AC-01, automation and PDF evidence depend on these
  specs), novelty no. Task record in English.
- Base: HEAD = origin/main = dc70ba65eb6c93925b3abe821829b76fc7e1f9da (handoff-only after
  3670a6c), or a later commit that changes only handoff/. Source digest:
  58b0deee5d0169f0211740de34953517500576baa2fd914d5a26059d5ba1dffd (795 files). Run the
  digest and record HEAD before you edit. Uncommitted coordinator files under
  `handoff/` are expected; never touch them.

## Simulated clock (test tool, not product)

- The auditor's preload `shiftclock.mjs` (evidence `shiftclock.mjs.txt`) is passed with
  `NODE_OPTIONS=--import`. It shifts `Date` by one constant offset in the Playwright
  runner, its workers, the CLI and the built server. Elapsed time stays real.
- The wrapper is `run-shift.sh.txt`. Its validation is described in the review
  ("The simulated clock and how I validated it") and in `12-sim-controls.txt`.
- Copy both into your task folder, as `.mjs` and `.sh`, and run them from there. Do not
  add them to the repository.
- Sweep instants. Run the full suite on both projects, with one worker if that is how
  the auditor reproduced it:
  - America/Los_Angeles, next periods after today: P-4 (Monday), P-3 13:00, P-3 18:00,
    P (payroll date) and P+1;
  - 2026-11-28 10:00;
  - 2026-12-26 10:00;
  - 2027-01-11 10:00;
  - a due Tuesday in 2027 at 18:00.
  Also run once on the real clock.

## Hard constraints

- No change under `src/`, `docs/`, `scripts/`, `package*.json` or config files. Only
  `tests/` may change.
- In `tests/e2e/fixtures.ts`, you may only add code. Never change the behaviour of an
  existing helper that other specs use.
- No assertion removed or weakened. No new `skip`, `fixme` or `.only`. No test may pass
  vacuously, for example by asserting on an empty set or skipping its precondition. If
  a scenario has no valid period, fail with a clear message.
- Keep the AC-01, AC-06/07/10 and automation evidence meaning of every changed test.
  List each changed `expect` line with a one-line reason.
- Synthetic data only.

## Owned paths

- `tests/`. List each changed file in Results.
- This brief's Results section.
- `handoff/delivery/evidence/WP5-UX-FIX10/` (masked LF `.txt` only).

## Checks (in this order; verify and digest are the LAST commands)

1. Put Node 24 first on PATH (with `cygpath -u`), then `node --version` (v24.x).
2. Reproduce on the base:
   - AB8-01 on the real clock now, if it is still after 17:00 Los Angeles on a due
     Tuesday or within P-3..P. Otherwise reproduce it with the simulated clock at P-3
     18:00.
   - AB8-02..04 with the simulated clock at their instants.
   Record the failures.
3. Fix. Then run `npm run typecheck`, `npm run lint` and `npm test`.
4. Run the full e2e on both projects on the real clock. Then run the simulated-clock
   sweep at every instant above. Every run must have 0 failed. Each run gets its own
   output folder; run them sequentially.
5. Grep your changed files and evidence for email addresses and user-profile paths.
   Only the full synthetic `@example.invalid` form may remain. Mask probe-truncated
   addresses as `<email>`.
6. Run `validate_package.py --preflight` by its script path with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
   (write `<user>` in the evidence).
7. Run `npm run verify` with `SMOKE_PORT` in 48520-48529, and with `DATA_DIR` and
   `DATABASE_PATH` set inside the task folder.
8. Run `npm run digest` LAST. If any file changes after the digest, rerun verify and the
   digest.
9. Copy the masked logs of steps 2-4 and 6-8 into the evidence folder, including a
   sweep summary table (instant, desktop pass/fail/skip, mobile pass/fail/skip).

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -e`, NO `node -` OR
  `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM
  `/dev/null` OR `nul`.**
  - Redirect output to a file in the task folder and read it with the Read tool.
  - Use the Write and Edit tools for files (no sed).
  - Use the Glob and Grep tools to search.
- **Create files only inside the task folder, the evidence folder or your owned paths.**
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX-FIX10`. Set TEMP and TMP to it. Use ports
  48520-48539 for anything you start. Never touch `%LOCALAPPDATA%\timesheet-dev` data.
- No Docker.
- Never stop a process you did not start. Never kill by PID. Never remove anything
  recursively. Never write into the repository root.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push. Do not install or change dependencies.
- In Results, never write a blocked token verbatim: no email address other than the
  full synthetic form, and no profile path.

## Return

At most 180 words, beginning with 'Self-reported model: ...'. Include:
- the fix per finding (one line each);
- any extra calendar failure that the sweep found and you fixed;
- the reproductions;
- the sweep table summary;
- the real-clock full e2e counts per project;
- the unit count;
- the files changed;
- the preflight and verify exit codes;
- the final full 64-hex digest;
- the evidence files;
- the background-task confirmation;
- any stop or deviation.

## Results

Self-reported model: claude-sonnet-5-5 (worker, profile timesheet-worker-high).

Base: HEAD = dc70ba65eb6c93925b3abe821829b76fc7e1f9da; digest before the first edit
58b0deee5d0169f0211740de34953517500576baa2fd914d5a26059d5ba1dffd (795 files). Node v24.21.0.
Evidence: `handoff/delivery/evidence/WP5-UX-FIX10/` (index `00-README.txt`).

### Reproductions on the base (simulated clock, before any edit)

- AB8-01: 2026-10-27 18:00 PDT, automation + pdf-visual: 3 failed (automation:118 both projects, pdf-visual:187 desktop). `repro-ab01.txt`.
- AB8-02: 2026-11-28 10:00 PST, shell + timesheet, one worker: `timesheet.spec.ts:403` fails on both projects (expected >= 1, received 0). `repro-ab02.txt`.
- AB8-03: 2026-12-26 10:00 PST, admin-status + admin, one worker: `admin.spec.ts:281` fails on both projects. `repro-ab03.txt`.
- AB8-04: 2027-01-11 10:00 PST, admin: `admin.spec.ts:281` fails on both projects (expected 2028, received 2027). `repro-ab04.txt`.

### Fix per finding

- AB8-01: the displayed period must be due after the activation (docs/05 line 26 stays). When its due time has passed, the
  admin of the test's private server records a later deadline for that same period (tomorrow 12:00 in the reporting zone)
  through the supported admin payroll exception; the payroll date is unchanged and the shared worker server is never touched.
  New `SeedClient.ensureDeadlineAhead()` (fixtures.ts) with a pure rule `laterDeadlineFor()` (displayedSeed.ts), used by
  `automation.spec.ts:118` and `pdf-visual.spec.ts:187`. I first tried the period in progress, as the brief suggested; it fails
  at the History "Signed" fact because the History window ends at the displayed period (`fix-ab01.txt`), so every original
  assertion would not have been reachable. The displayed period keeps all of them.
- AB8-02: `shell.spec.ts:67` releases its seeded day in a `finally` (`clearSessions`); `timesheet.spec.ts:189` registers both
  seeded days and an `afterEach` releases them, pass or fail. The per-worker demand is now 2 at a time (day-editor) against a
  minimum pool of 3; proved by the 2026-11-28 and 2026-11-30 one-worker full runs.
- AB8-03: the holiday dates are now chosen by `importDatesAfter()`: the nominal 1 January, 4 July and 3 March of the import
  year, moved to the first free days after the displayed period's last day when the period is in the way (a period spanning
  New Year; a date before the effective date would also be dropped as past). No finalized day is touched.
- AB8-04: the expected year is the client's own `defaultImportYear(todayLocal, warnings)`, imported from
  `src/client/components/adminModel.ts` (no copy of the rule).

No further calendar failure appeared in the sweep except one environment flake (below), so no extra fix was needed.

### Changed `expect` lines and the reason

Removed: none. Weakened: none. No skip, fixme or only added. Added or changed:
- `admin.spec.ts` (281): `year` now comes from `defaultImportYear`; a new `expect` that the three import dates start with `${year}-`;
  the old `newYear`, `midYear` and `${year}-03-03` literals became `newYear`, `midYear`, `extraDate` in the same assertions
  (`toContainText`/`toBeVisible` of `[data-diff-date]`, `[data-kept-date]`, `arrayContaining([...])`): same checks, dates outside the
  displayed period. The stale-hash, boundary (2020-01-06), no-change and "next year has dates now" assertions are unchanged.
- `fixtures.ts` `ensureDeadlineAhead`: two new `expect`s (due after the margin; payroll date kept) so a setup that does not give a
  deadline ahead fails with a clear message instead of passing vacuously.
- `automation.spec.ts` (118): only the call `await admin.ensureDeadlineAhead(120_000)` was added; the existing
  `expect(due..., 'the displayed period is not due yet')` and every other assertion are untouched.
- `pdf-visual.spec.ts` (187): `periods.current` is replaced by the returned displayed period (same fields); assertions untouched.
- `shell.spec.ts` (67), `timesheet.spec.ts` (189): body re-indented under `try/finally` (shell) or unchanged with an `afterEach` (timesheet); assertions untouched.
- `tests/domain/e2eSeedSelection.test.ts`: 4 new unit tests (`laterDeadlineFor` over 224 steps of four periods with the production
  period functions, the margin around the due time, `importDatesAfter` x2); the existing 4 tests are untouched.

### Files changed (tests only)

`tests/e2e/displayedSeed.ts` (+47), `tests/e2e/fixtures.ts` (additive; one existing import line widened), `tests/e2e/automation.spec.ts` (+4),
`tests/e2e/pdf-visual.spec.ts`, `tests/e2e/shell.spec.ts`, `tests/e2e/timesheet.spec.ts`, `tests/e2e/admin.spec.ts`,
`tests/domain/e2eSeedSelection.test.ts`. Nothing under `src/`, `docs/`, `scripts/`, `package*.json` or config.

### Results of the checks

- typecheck exit 0; lint exit 0; `npm test` exit 0: 83 files, 1831 tests (1827 before + 4 new).
- Full e2e, both projects, real clock (about 20:40 PDT on 2026-10-13, after the due time): 210 passed, 0 failed, 26 skipped
  (desktop 103/0/15, mobile 107/0/11).
- Simulated sweep, full suite, both projects: P-4 (10-26 10:00), P-3 13:00 and 18:00 (10-27), P (10-30), P+1 (10-31),
  2026-11-28 (also with one worker), 2026-12-26, 2027-01-11, 2027-01-19 18:00, plus extra 2027-01-02 and 2026-11-30 (one worker):
  every run 210 passed, 0 failed, 26 skipped, with one exception: the first 2027-01-19 18:00 run had 1 failure,
  `ot-leave.spec.ts:195` on desktop, `net::ERR_NO_BUFFER_SPACE` (a transient Windows socket-buffer error in the browser, not calendar
  related; that spec is untouched). The rerun of the same instant: 210 passed, 0 failed. Table: `sweep-table.txt`, `00-README.txt`.
- `validate_package.py --preflight` (workflow Python at C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe): PASS, exit 0.
- `npm run verify` (SMOKE_PORT 48521, DATA_DIR and DATABASE_PATH in the task folder): exit 0, SMOKE PASSED.
- `npm run digest`, the last command: 57e2974c35cc104f3c2cb5d930c24d9bb15b89661be395d16a827e64ee4b761d (795 files).

### Observation (not a defect of this task)

The History screen lists a revision of a period after the displayed one without its sign facts (its window ends at the displayed
period). This cannot happen with the real clock (such a revision appears only after its due time, when that period is displayed), so
it is not blocking; it is only why the period-in-progress approach was dropped.

### Deviations and process notes

- One empty heredoc (`cat >> file` with nothing appended) was run by mistake once; it changed nothing. Otherwise no heredoc, no
  stdin-fed node or python, no pipe into head/tail, no null-device redirect, no sed, no Docker, no cmd.exe, no kill.
- Ports: only the OS-assigned loopback ports of the fixtures and SMOKE_PORT 48521. All background tasks finished; none of mine is running.

Status: done
