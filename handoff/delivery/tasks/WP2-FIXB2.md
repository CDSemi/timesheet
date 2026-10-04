# WP2-FIXB2 dispatch brief

- Mission/task: timesheet-software-readiness / WP2-FIXB2; package WP2; kind fix; attempt 1.
  - It addresses WP2-AUDIT-B2 (`addresses_audit`; FIX REQUIRED: WP2-B2-01 and
    WP2-B2-02) and does not depend on that audit.
  - It also folds in two WP2-AUDIT-A2 observations: WP2-A2-01 (Info) and WP2-A2-02 (Low).
    The final area rechecks review them.
- Profile/routing: timesheet-worker-high, requested sonnet/high, no override. Routing:
  size S, risk H (privacy hardening, time-dependent tests), novelty no.
- Read AGENTS.md from disk first (rules 4 and 7, and the UI standards section). Then read:
  - handoff/prompts/FIX_FINDINGS.md;
  - [WP2_RECHECK_B](../WP2_RECHECK_B.md), with its evidence in
    handoff/delivery/evidence/WP2-AUDIT-B2/ (season-window, tz-dependence, css-substitute);
  - [WP2_RECHECK_A](../WP2_RECHECK_A.md), for WP2-A2-01 and WP2-A2-02;
  - docs/01 "Initial boundary" and docs/03 "Records".
- Baseline: main at f79413b77e7f745e1eff383f1ad748e7667533da. The working tree differs
  only in handoff/.
- Runtime: call the Node 24 portable binary by its full path. The fixture uses
  `process.execPath`.
- Do not commit.

## Required fixes (binding)

1. **WP2-B2-01 (Medium).** tests/e2e/day-editor.spec.ts:222-223 (comment at 209)
   hard-codes 08:00/09:30 Los Angeles for 22:00/23:30 typed at +07:00. That is valid
   only under PDT, but the date comes from the real clock, so the test fails in winter.
   - Derive the expected wall times from the actual date with `Intl`, or pin the test to
     a fixed date that the harness supports.
   - Prove the fix with a check that simulates both seasons. For example, run the
     expectation helper for a summer and a winter date in a unit test, or run the spec
     under both dates if the harness allows.
   - Production code gets no clock override.
2. **WP2-B2-02 (Low).** src/client/styles.css still has WP2-introduced literals outside
   the B-02 list: lines 241-242 (`1.25rem`), 473-474 (`0.7rem`), 629 (`90dvh`), and 706,
   884 and 1000 (`font-size: 1rem`). Replace them with CSS custom properties.
   - Computed values must be identical. Prove it with a before/after `getComputedStyle`
     probe on the affected selectors, desktop and mobile.
3. **WP2-A2-02 (Low, privacy hardening).** The payroll-exception response field
   `refreshed_pay_period` (src/server/routes/admin.ts:169; set in
   src/server/services/calendars.ts) tells the admin, per pay period, whether a stored
   pay-period row existed, and so whether anyone on the calendar had a timesheet.
   - Remove the field or make it non-revealing. The admin response must be identical
     whether or not employees have timesheets in that period.
   - Keep the refusal for finalized periods (409 `period_finalized`) as E-10 requires.
   - Update tests/integration/payroll-exceptions.test.ts, and add a differential test:
     the same request gives the same success response body with and without employee
     timesheets.
   - Update the admin UI and types only if they use the field.
   - Rule-8 guard: if a canonical text requires showing the refresh, stop and report.
4. **WP2-A2-01 (Info).** Correct the stale "aggregate counts" comments at
   src/server/routes/admin.ts:48-50 and tests/integration/isolation.test.ts:280. These
   are comment changes only. The WP2_HANDOFF.md:41 wording is fixed in the acceptance
   step, not here.

## Owned (writable) paths

- tests/e2e/day-editor.spec.ts, and tests/e2e/fixtures.ts only if a date helper
  requires it.
- tests/client/ (a unit test for the expectation helper if you add one).
- src/client/styles.css.
- src/server/routes/admin.ts and src/server/services/calendars.ts (WP2-A2-02 and
  WP2-A2-01 only).
- tests/integration/payroll-exceptions.test.ts and tests/integration/isolation.test.ts
  (the comment at line 280 only).
- src/client/components/PayrollExceptions.tsx and src/client/api.ts, only if they use
  `refreshed_pay_period`.
- This report and handoff/delivery/evidence/WP2-FIXB2/.

List any other minimal edit as a deviation.

## Checks

- Write each regression red-first and save the output against the unfixed code. For
  WP2-B2-01, show the winter failure of the old expectation.
- Run `npm run verify` and `npm run test:e2e` (both projects); both must exit 0.
- Run `npm run digest`.
- Evidence must be masked, LF and free of trailing whitespace. Use synthetic data only, no
  deprecated APIs and no inline styles.

Return at most 180 words, beginning with your self-reported model: each item's fix and
test, the guard result, verify and e2e exits, digest and deviations.

## Results

(Worker appends here.)

Worker: timesheet-worker-high, self-reported model claude-sonnet-5-5, attempt 1. Baseline f79413b; nothing
committed or staged. Evidence: handoff/delivery/evidence/WP2-FIXB2/ (00-commands.txt lists every command and exit).

1. WP2-B2-01 fixed (test only).
   - New tests/client/zoneOracle.ts: Intl-only helpers dateTimeIn, instantOfWallTime, wallTimeIn. The R-07
     e2e in tests/e2e/day-editor.spec.ts now derives the stored instant and the Los Angeles wall time
     (07:00/08:30 under PST, 08:00/09:30 under PDT) from the real date, and checks the accounting date is
     unchanged. The local dateTimeIn copy moved into the helper. Comment fixed.
   - Regression tests/client/zoneOracle.test.ts proves summer and winter dates, both DST-change days and
     every day of 2026. Red: the same test against a stand-in with the old hard-coded PDT arithmetic fails
     (2 of 4; 01). The old expectation replayed on 2026-11-03 and 2027-01-14 fails, and passes in summer (03).
     Green: 4 passed (02). The e2e harness has no clock override (and production gets none), so the winter
     case is proved by the unit test on the same helper the spec calls, not by running the spec in winter.
     The e2e R-07 test passes on desktop and mobile today (PDT).
2. WP2-B2-02 fixed. Four tokens in :root of src/client/styles.css: --control-check-size (1.25rem),
   --shape-size (0.7rem), --dialog-max-height (90dvh), --font-size-base (1rem). All 8 literal declarations
   (the 241-242, 473-474, 629, 706, 884, 1000 lines) now use var(). A before/after getComputedStyle probe
   (static page with the affected selectors; desktop 1280 and mobile 390, light and dark; 10 elements x 12
   properties = 480 values per side) shows 0 differing values (05); a mutant token changing 0.7rem to
   0.75rem is detected (05b). Diff in 07. The full e2e suite also passes (both projects, with the existing
   overflow and 44 px checks).
3. WP2-A2-02 fixed. POST /api/admin/payroll-exceptions now answers 201 with { payroll_exception } only;
   createPayrollException returns { exception }. The refreshed flag stays in the audit event (the admin has
   no route to read it). The 409 period_finalized refusal (E-10) is unchanged and still tested. Tests in
   tests/integration/payroll-exceptions.test.ts: the three old refreshed_pay_period assertions now assert
   the body keys are exactly ['payroll_exception'], and a new differential test runs the same request on a
   fresh database with no timesheets and on one where two users have edited the period (stored row refreshed
   in the second) and requires equal response bodies. Red against the unfixed server: 4 failed (04), all on
   the extra field. Rule-8 guard: no canonical text requires showing the refresh (docs/10 E-10 says rows are
   refreshed and finalized rows refused; docs/01 and docs/03 are silent; grep over docs and handoff prompts
   found only audit and recheck mentions). The admin UI (PayrollExceptions.tsx) and api.ts never used the
   field, so they are untouched. No stop-and-report needed.
4. WP2-A2-01 fixed (comments only): src/server/routes/admin.ts header and tests/integration/isolation.test.ts
   line 280 now say calendar-only fields and no employee-derived counts. WP2_HANDOFF.md is left for the
   acceptance step as briefed.

Checks: npm run verify exit 0 (32 files, 611 tests, lint no-deprecated, build, smoke passed; 0 deprecation
lines with --trace-deprecation --pending-deprecation). npm run test:e2e exit 0 (74 passed, 2 skipped, both
projects). npm run digest exit 0: 5b370621e7d3b9f292e8facebb1f0f6e9307a40cbda3a9f87b7dd61924298581 (613 files,
handoff/ excluded; includes the two new untracked test files).

Deviations: one new file outside the named list, tests/client/zoneOracle.ts, placed under the owned tests/client/
directory (a non-test helper shared by the e2e spec and its unit test, so fixtures.ts was not changed and
vitest does not import Playwright). Nothing else outside the owned paths. The CSS probe ran on a static page
built from the stylesheet, not on live screens (the audit's real-screen comparison remains valid for the
rest). Probe scripts are saved as .mjs.txt (lint trap). No server or background process left running.
