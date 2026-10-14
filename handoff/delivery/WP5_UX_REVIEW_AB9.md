# WP5 UI redesign, independent combined recheck of areas A and B (AB9) after WP5-UX-FIX10

[Tiếng Việt](WP5_UX_REVIEW_AB9.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5 owner-requested UI change round, task WP5-UX-AUDIT-AB9, attempt 1,
  2026-10-14 06:20Z to about 08:00Z (2026-10-13 23:20 to 2026-10-14 01:00 in America/Los_Angeles). Reviewer self-reported model `claude-opus-5-5`,
  profile timesheet-auditor (effort set by the profile, not observable from inside). One combined delta recheck of area A and area B.
  The earlier reviews A to A7, B to B7 and AB8 are preserved unchanged.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** commit
  `90b98efc395c3894a21a909b6d361eadc6fc2bd9` (the WP5-UX-FIX10 freeze, the WP5-UX-REGATE8 `freeze_commit`). HEAD = origin/main = 90b98ef
  before and after; no unpushed commit. Digest `57e2974c35cc104f3c2cb5d930c24d9bb15b89661be395d16a827e64ee4b761d`, 795 files, `handoff/`
  excluded. I recorded it first (06:20:41Z, right after `node --version`) and last (07:54:27Z), each time in three equal forms:
  `scripts/source-digest.mjs`, `git ls-tree` at 90b98ef and at HEAD. A clean `git archive` export of 90b98ef holds exactly the 795 paths and
  blobs of the tree (its list equals the `ls-tree` list), before and after all runs. Source complete: `npm ci` exit 0 in the export.
- **Decision: PASS.**
  - **The product is unchanged since 255ba17.** The delta 3670a6c..90b98ef touches only the 8 test paths, and the clean exports of 3670a6c,
    90b98ef and 255ba17 build the same `dist/` byte for byte (230 files). The area-A conclusions of A7, the area-B conclusions of B7 and the
    AB8 conclusions carry forward.
  - **Test strength holds.** No assertion is removed or weakened; `fixtures.ts` only widens one import line and adds a method; no skip,
    fixme or only is added; nothing passes vacuously; the edge cases fail with named messages (mutations M1-M5 and M7).
  - **AB8-01 semantics are preserved.** The later deadline is recorded for the displayed period itself, through the shipped admin
    payroll-exception route, and only when the natural due is not more than 120 s ahead. The setup asserts its own preconditions. The tests
    still prove the deadline automation, the docs/05 line 26 activation rule and the automatic revision with its PDF, and they hide no
    product defect.
  - **AB8-02 to AB8-04 are closed** (releases on every path; import dates after the displayed period; the client's default-year rule). My
    derivation over 2026-10-01..2028-12-31, the mutations and the sweep confirm each.
  - **My simulated-clock sweep passes:** eight new instants, the FULL suite on both projects, every run 210 passed, 0 failed, 26 skipped.
    Two extra one-worker runs (2027-09-14 18:30 and 2027-03-15 10:00) also give 210 / 0 / 26.
  - **The mandatory checks pass:** typecheck 0, lint 0, `npm test` 83 files / 1831 tests, the FULL e2e on the real clock (inside the
    AB8-01 window) 210 passed / 0 failed / 26 skipped, AC-13 1/1, AC-01 with every isolation group reached on both projects.
  - No blocking defect. Six optional risks (R-AB9-1 to R-AB9-6) are listed below. R-AB9-6 is a pre-existing product behaviour from WP3; I
    re-assessed it from the FIX10 Results and judge it non-blocking for the reason given there.
  - This PASS accepts WP5 in both areas and supersedes WP5-UX-AUDIT-A6 and the older audits that point to A6.

## Scope actually inspected and executed

1. **Product unchanged (scope 1).** I read the whole diff `3670a6c..90b98ef` outside `handoff/` (8 test paths, 234/26 lines). I made clean
   exports of 3670a6c, 90b98ef and also 255ba17, ran `npm ci` and `npm run build` in each, and compared `dist/` file by file.
2. **Test strength (scope 2).** Numstat, every removed line, the `expect(` and `test(`/`it(` counts per file, a skip/fixme/only/fail/slow/soft
   scan of the added lines and of the whole `tests/` tree at both commits, and a whitespace-insensitive diff of `shell.spec.ts`.
3. **AB8-01 semantics (scope 3).** I read `automation.spec.ts:118`, `pdf-visual.spec.ts:187`, the new `SeedClient.ensureDeadlineAhead`
   (`fixtures.ts:447-472`) and `laterDeadlineFor` (`displayedSeed.ts:54-57`). I also read the product route `POST /api/admin/payroll-exceptions`
   (`admin.ts:230-249`, `calendars.ts:275-348`, `validatePayrollExceptions` and `payPeriodAt` in `periods.ts:66-113`), its schema
   (`schemas.ts:274-282`), docs/05 line 26 and the product's integration test `tests/integration/payroll-exceptions.test.ts`.
4. **AB8-02..04 (scope 4).** I read every seeding call on the worker-shared employee (55 call sites) and the release paths. My own
   derivations (`derive9.ts.txt`, `derive9fine.ts.txt`, `pool.ts.txt`) cover every day from 2026-10-01 to 2028-12-31. I ran six unit
   mutations and two e2e mutations in a separate scratch export.
5. **Simulated-clock sweep (scope 5).** I used the AB8 preload unchanged (byte-equal to the AB8 evidence copy; the FIX10 and REGATE8 copies
   differ only in the first comment line). I ran a validation control first, then the FULL suite on both projects at eight instants of my
   own, then two one-worker runs.
6. **Mandatory checks (scope 6)** at 90b98ef in the clean export: typecheck, lint, `npm test`, the FULL e2e on the real clock, AC-13 once,
   AC-01 with a step reporter, `npm audit`.
7. **Carried items (scope 7):** R-AB8-1 to R-AB8-4, R-B7-1 to R-B7-4, A7 R1/R5/N5/N6/N7, B6 R-10, R-11, R-13, R-14 and R-16 to R-20.
8. **The FIX10 History observation**, re-assessed with a task-local probe (R-AB9-6).

**Validation of the simulated clock.** The preload `shiftclock.mjs` reaches the Playwright runner, its workers, the CLI and the built
server through `NODE_OPTIONS=--import`. Each process shifts `Date` by one constant, so elapsed time stays real. `src/client` still has no
browser-clock read (a grep for `Date.now`, `new Date(`, `Date()`, `performance.now`, `setInterval` and `Temporal.Now` finds 0 lines), and the
product is byte-identical, so the page only shows server dates. Controls on Tue 2026-11-24 (`08-…`):
- a task-local control spec, copied into the scratch export for one run and removed: the built server reports `today_local=2026-11-24`, the
  displayed period 11/09-11/22 (payroll 11/27) and the due `2026-11-25T01:00:00Z`, on both projects;
- the unchanged 3670a6c deadline specs pass at 13:00 PST and fail at 18:30 PST with exactly the three AB8-01 failures
  (`automation.spec.ts:118` on both projects, "the displayed period is not due yet"; `pdf-visual.spec.ts:187` on desktop, revision null);
- the 90b98ef specs pass at 18:30 PST (6 passed, 2 skipped by design).

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX-AUDIT-AB9/` (index `00-README.txt`).

| Command | Result / exit | Evidence |
|---|---|---|
| digest, three forms, first and last; HEAD; export | `57e2974c…4b761d`, 795 files every time; HEAD = origin/main = 90b98ef; the export list equals the `ls-tree` list, before and after | `01-…`, `90-…` |
| `git diff --numstat 3670a6c 90b98ef` outside `handoff/` | exactly the 8 test paths: `e2eSeedSelection.test.ts` 101/2, `admin.spec.ts` 15/9, `automation.spec.ts` 4/0, `displayedSeed.ts` 47/0, `fixtures.ts` 35/1, `pdf-visual.spec.ts` 5/3, `shell.spec.ts` 16/11, `timesheet.spec.ts` 11/0 | `02-…` |
| test-strength scan | removed lines listed per file; `fixtures.ts` removes only its import line; 0 skip/fixme/only/fail/slow/soft added; the tree has 12 skip, 0 only and 0 fixme lines at both commits | `03-…` |
| `npm ci` + `npm run build` of 3670a6c, 90b98ef and 255ba17; byte comparison | exit 0 each; `dist/` 230 files (180 server, 46 domain, 4 client); sha lists equal (cmp 0); `diff -r` exit 0 for `dist/`, `dist/server` and `dist/client`; client `index-ZRY_mcb_.js` 483030 bytes (`74d87ee4…`); no diff under `src`, `scripts`, `docs`, the package files or config | `04-…` |
| `npm run typecheck` / `npm run lint` (`no-deprecated`) | exit 0 / exit 0 | `05-…` |
| `npm test` | exit 0; 83 files, 1831 tests | `05-…` |
| AC-13 `tests/integration/ac13-two-week.test.ts` once | exit 0, 1/1 | `05-…` |
| `npm audit --omit=dev` / `npm audit` | 0 / 1 high (dev-only `source-map-js`, GHSA-68fv-2mgg-jv7q): A7 R1 unchanged | `05-…` |
| own derivations (`derive9`, `derive9fine`, `pool`, `instants`) | `laterDeadlineFor`: 0 mismatches on 8230 instants (natural 6122, moved 2108 on 234 days) and on 83115 quarter-hour instants (natural 63483, moved 19632); import year and dates on 823 days: 0 problems; the smallest free-day pool is 3, on 2026-11-28..30 only | `06-…` |
| unit and e2e mutations in a separate scratch export | M1-M5 caught; M6 survives (R-AB9-1); M7 fails clearly; M8 brings AB8-02 back (2 failed) and its control passes (25 passed) | `07-…` |
| simulated-clock validation (Tue 2026-11-24) | control: the server reports `today_local=2026-11-24`; the 3670a6c deadline specs: 6 passed at 13:00 PST, the 3 AB8-01 failures at 18:30 PST; 90b98ef at 18:30 PST: 6 passed | `08-…` |
| FULL e2e, both projects, REAL clock, 2026-10-13 23:36-23:42 PDT (moved-deadline path) | **exit 0: 210 passed, 0 failed, 26 skipped** (desktop 103/0/15, mobile 107/0/11); 0 deprecation lines; the 203 failed expect steps are all `expect.poll` iterations in four unchanged specs | `09-…` |
| AC-01: `isolation.spec.ts` + `shell.spec.ts`, real clock, 23:43 PDT | exit 0, 13 passed, 1 skipped (a mobile-only test on desktop); every isolation assertion line reached and passed on both projects, also in the full run | `10-…` |
| FULL suite under the simulated clock, 8 instants plus 2 one-worker runs (table below) | every run exit 0, 210 passed, 0 failed, 26 skipped; no rerun was needed | `11-…` |
| History probe after an early manual sign-off (task-local, scratch export) | at 2026-11-24 18:30 PST the sign-off of the period in progress is accepted and History shows it as a non-current row; at 2026-11-28 the same row is complete (R-AB9-6) | `12-…` |

## Product unchanged (scope 1)

`git diff 3670a6c..90b98ef` outside `handoff/` touches exactly the 8 test paths that the brief names, and `git diff --stat` over `src`,
`scripts`, `docs`, the package files and every config file is empty. `git diff 255ba17..90b98ef` outside `handoff/` and `tests/` is empty as
well. The three clean exports build the same `dist/` byte for byte: 230 files (180 server, 46 domain, 4 client), equal per-file sha256 lists
(cmp 0) and `diff -r` exit 0 for all of `dist/`, `dist/server` and `dist/client`. The client bundle is `index-ZRY_mcb_.js` (483030 bytes,
sha256 `74d87ee4…`) with `index-B6Rp4E3V.css` (`17b217c2…`), as AB8 and REGATE8 recorded. So the product of 90b98ef is the product of
255ba17, and the area-A and area-B conclusions of A7, B7 and AB8 carry forward.

## Test strength (scope 2)

- `fixtures.ts` +35/-1: the only removed line is the import, widened to add `type DeadlinePeriodFacts` and `laterDeadlineFor`. The rest is
  the new method `ensureDeadlineAhead`. No existing helper changed (`displayedPeriodFreeWorkdays`, `clearSessions` and the others are
  byte-identical).
- `displayedSeed.ts` +47/-0, `automation.spec.ts` +4/-0 and `timesheet.spec.ts` +11/-0 are additive.
- `shell.spec.ts` +16/-11: with whitespace ignored, the only change is `try {` / `} finally { await employeeSeed.clearSessions(workDate); }`
  and one comment. All 7 assertions of `:67` are kept.
- `pdf-visual.spec.ts` +5/-3: the `periods` read is replaced by the period that `ensureDeadlineAhead` returns (the same `period_start` and
  `due_at_utc` fields); every assertion is kept.
- `admin.spec.ts` +15/-9: two interface types are widened; `year` now comes from the client's `defaultImportYear`; `newYear`, `midYear` and
  the `${year}-03-03` literal became `importDatesAfter` values used in the same assertions (`[data-diff-date]`, `[data-kept-date]`,
  `arrayContaining`); one new `expect` checks that the three dates lie in the import year. The stale-hash, boundary, no-change,
  warning-banner and "next year has dates now" assertions are unchanged.
- `e2eSeedSelection.test.ts` +101/-2: two import lines are widened; the four FIX9 tests are unchanged; four tests are added.
- Counts: `expect(` 87→88 (admin), 5→7 (fixtures), 18→35 (unit), unchanged in the other specs; `test(`/`it(` unchanged in every spec, 4→8 in
  the unit file. The added lines contain no `skip`, `fixme`, `.only`, `test.fail`, `.slow`, `expect.soft` or retries. The `tests/` tree has 12
  skip lines, 0 only and 0 fixme at both commits.
- **No vacuous pass, and the edge cases fail clearly:**
  - `ensureDeadlineAhead` posts with `call(…, 201)`, which asserts the status and prints the response body. It then asserts that the due is
    more than the margin ahead and that the payroll date is unchanged. Mutation M7 (the exception is never recorded) fails at 18:30 on a due
    Tuesday with "the displayed period (payroll 2026-11-27) is due after 120 s from now", in all three deadline tests.
  - `automation.spec.ts:155` keeps its own check, on the employee's view of the period, after the seeding.
  - `admin.spec.ts:299` names the three dates when one of them leaves the import year.
  - Unit mutations: M1 (never move), M2 (today at noon), M3 (margin ignored), M4 (nominal dates kept) and M5 (no de-duplication) each fail
    the new unit tests. M6 (a date equal to the period's last day allowed) survives (R-AB9-1).

## AB8-01 semantics (scope 3)

- **A supported admin path.** `POST /api/admin/payroll-exceptions` is a shipped admin route. Its schema takes `due_local_date` and
  `due_local_time`, and `payPeriodAt` resolves the period's due from them. The product's own integration test `payroll-exceptions.test.ts`
  records the same shape (payroll 10/16, due 10/14 12:00). docs/01 line 29 makes payroll-date exceptions explicit, and E-10 refreshes an
  unfinalized stored period. The seed creates no payroll exception, and each deadline test runs on its own fresh private server, so the 409
  `payroll_exception_exists` and `period_finalized` cases cannot occur there. The shared worker server is never touched.
- **Same period, same assertions.** The exception keeps the nominal and the actual payroll date, so `currentPayPeriod` still opens the same
  period. My derivation found 0 mismatches over 8230 instants (ten wall times a day) and over 83115 quarter-hour instants: the helper moves the
  deadline exactly when the natural due is not more than 120 s ahead; the exception always passes `validatePayrollExceptions`; the period, its
  14 days and its payroll date are kept; and the recorded due (tomorrow 12:00 Los Angeles time) is at least 12 h ahead and after the
  activation instant. The step reports show the exception POST in every run on the moved path (3 per run) and in none on the natural path.
- **The deadline automation is still what is tested.** The activation is recorded a minute ahead. The CLI runs the jobs at due + 1 min, where
  nothing happens without the activation, and from due + 5 min. The period is finalized only because its recorded due is on or after the
  activation, as docs/05 line 26 requires; if the automation used the natural due, the period would be ineligible and the test would fail. The
  PDF date (`printedDate`/`submissionDate`) comes from the due that the server reports, so the automatic submission date of AC-10 is still
  checked. All assertions on origin `deadline`, review pending, no sign-off, the note and image matrix, the capture, the notices, the History
  facts and the administrator view are unchanged.
- **Nothing hidden.** Outside the window the natural deadline still runs: 6122 of my 8230 instants, and the sweep runs s3, s4 and s5. Inside
  the window the natural scenario cannot be built at all, because the page shows a period whose due has passed. The canonical fixtures TM-23
  and TM-24 and `deadline.test.ts` also cover the product's natural-due arithmetic. The docs/05 bounds on account creation and saved
  settings hold on both paths: the accounts and their settings exist before the recorded due.
- Verdict: the setup is a supported admin path; it asserts its own preconditions; the original meaning of both tests (automatic submission at
  the deadline after the activation, AC-07, and AC-10 on the automatic PDF) is preserved; it hides no product defect.

## AB8-02..04 (scope 4)

- **AB8-02.** `shell.spec.ts:67` releases its day in `finally`. `timesheet.spec.ts:199` registers both days before seeding them, and a
  file-level `afterEach` releases them on pass and on failure. `admin.spec.ts:90` and the seeding day-editor tests already release in
  `finally`. `timesheet.spec.ts:414` takes the oldest free day and leaves it without a session (it changes only the category), so it does not
  shrink the pool. The smallest pool is 3 past workdays (2026-11-28 to 11-30, Thanksgiving), and the largest demand at one time is 2. Mutation
  M8 (both releases removed) brings AB8-02 back on 2026-11-30 with one worker ("expected >= 1, received 0" at `timesheet.spec.ts:414`, both
  projects); the unmutated files pass at the same instant. Sweep run s3 (2026-11-30) passes.
- **AB8-03.** `importDatesAfter` keeps a nominal date only when it lies after the displayed period's last day; otherwise it moves the date to
  the first free day after that day, and it keeps the three dates distinct. The specs that finalize on the shared server (`admin-status`,
  `history-settings`, `review`, `sharing`, `submission`) sign only the displayed period (`Person.payrollDate`). So no import date can touch a
  finalized day, and none lies before the effective date (the period start). My derivation over 823 days found 0 problems.
- **AB8-04.** The expected year is the client's own `defaultImportYear(today, warnings)`, which the admin form uses
  (`AdminScreen.tsx:75,110`). My own rule (October to December: next year, because the seed holds only 2026 dates; otherwise this year)
  equals it on every day from 2026-10-01 to 2028-12-31, and the three dates always start with that year.

## Simulated-clock sweep (scope 5)

FULL suite, both projects, sequential, each run with its own output folder, in the clean 90b98ef export; default workers (2) unless the run
says one worker. Instants are America/Los_Angeles wall times. "Path" is the deadline path that the step report shows (3 recorded
payroll-exception POSTs = moved, 0 = natural). In every run below: exit 0, 0 deprecation lines, and every isolation and `shell.spec.ts:67`
assertion line reached and passed on both projects.

| Run | Instant (LA) | Why this instant | Path | Import dates (admin.spec) | desktop ok/fail/skip | mobile ok/fail/skip |
|---|---|---|---|---|---|---|
| real | Tue 2026-10-13 23:36 (real clock) | due Tuesday after the due (mandatory check) | moved | 2027-01-01, 07-04, 03-03 | 103/0/15 | 107/0/11 |
| s1 | Tue 2026-11-24 18:30 PST | due Tuesday after 18:00; payroll 11-27 is a holiday | moved | 2027-01-01, 07-04, 03-03 | 103/0/15 | 107/0/11 |
| s2 | Fri 2026-12-11 16:00 PST | payroll date P; later due on P+1 | moved | 2027-01-01, 07-04, 03-03 | 103/0/15 | 107/0/11 |
| s3 | Mon 2026-11-30 15:00 PST | 2026-11-30; free-day pool 3 (the minimum) | natural | 2027-01-01, 07-04, 03-03 | 103/0/15 | 107/0/11 |
| s4 | Thu 2026-12-31 18:00 PST | 2026-12-31; New Year inside the period | natural | 2027-01-04, 07-04, 03-03 | 103/0/15 | 107/0/11 |
| s5 | Mon 2027-03-15 10:00 PDT | new 2027 date; P-4 the day after the DST change; an import date is today | natural | 2027-03-15, 07-04, 03-16 | 103/0/15 | 107/0/11 |
| s6 | Tue 2027-09-14 18:30 PDT | due Tuesday after 18:00 in 2027; all three dates moved, one is today | moved | 2027-09-13, 09-14, 09-15 | 103/0/15 | 107/0/11 |
| s7 | Fri 2027-10-01 10:00 PDT | payroll date in 2027 and the first day of the 2028 warning | moved | 2028-01-01, 07-04, 03-03 | 103/0/15 | 107/0/11 |
| s8 | Tue 2028-02-29 18:30 PST | leap-day due Tuesday after 18:00 | moved | 2028-02-28, 07-04, 03-03 | 103/0/15 | 107/0/11 |
| w1-s6 | as s6, `--workers=1` | every spec of a project on the server that admin.spec changed (R-AB9-3) | moved | 2027-09-13, 09-14, 09-15 | 103/0/15 | 107/0/11 |
| w1-s5 | as s5, `--workers=1` | the same for P-4 | natural | 2027-03-15, 07-04, 03-16 | 103/0/15 | 107/0/11 |

No network or buffer error occurred, so no rerun was needed.

## Findings

None. I found no blocking defect in the delta, in its test strength, in the AB8-01 semantics, in AB8-02 to AB8-04, in the mandatory checks
or in the sweep. (ID, severity, file:line, evidence and required fix: not applicable.)

## Risks and optional improvements (not defects)

- **R-AB9-1:** the unit test of `importDatesAfter` (`displayedSeed.ts:64-72`) has no case where a nominal date equals the period's last day.
  Mutation M6 (`>=` instead of `>`) survives it. Such a date would be a Sunday inside the displayed period, which a finalized timesheet covers,
  for example 2027-07-04, the last day of the period paid on 2027-07-09. The shipped helper is correct on every day I derived. Optional fix:
  add that case.
- **R-AB9-2:** `automation.spec.ts:268` ("not submitted while the activation instant is not recorded", unchanged by FIX10) proves less inside
  the window. There the displayed period's due passed before the test's account existed, so the docs/05 account-creation bound alone already
  forbids a submission. The test still passes, but on those days it does not isolate the activation rule. `deadline.test.ts:271`, `:293`,
  `:305` and `:961` cover the rule deterministically. Optional fix: call `ensureDeadlineAhead` there too.
- **R-AB9-3:** `admin.spec.ts:281` commits its holiday import on the worker-shared calendar, effective from the displayed period's start,
  with dates right after that period. So one of the dates is today on 86 days of 2027-2028: on P-4 from January to September, on P-3 from
  mid-March and on P-2 from July. On 159 days a past day of the period in progress becomes a synthetic holiday for the specs that run later on
  the same worker. The sweep runs at such instants pass (s5 and s6, and both one-worker runs, where every later spec of a project
  shares that server). Optional fix: import on a calendar that no other spec uses (`seedSecondCalendar`), or choose dates after the period
  in progress.
- **R-AB9-4:** the AB8-04 expectation calls the client's own `defaultImportYear`, so it checks the wiring of the form, not an independently
  specified year (docs/06 prefers independent expectations). AB8 allowed this, docs/04 sets no default year, and my derivation checks the rule
  independently for every day of 2026-10-01..2028-12-31. Optional: assert the literal rule as well.
- **R-AB9-5:** `ensureDeadlineAhead` checks the 120 s margin before the four days are seeded, and `automation.spec.ts:155` checks it again
  afterwards. If the natural due is only just over 120 s ahead at the first check, the second check can fail. The window is about the seeding
  time (well under a few seconds) once per cycle, at 16:57-16:58 on due Tuesdays. Optional: use a larger margin in the helper than in the
  recheck.
- **R-AB9-6 (pre-existing product behaviour, WP3, outside this delta):** the FIX10 Results say that History lists a revision of a period after
  the displayed one without its sign facts, and that this "cannot happen with the real clock". My probe shows that it can, through an early
  manual sign-off. At 2026-11-24 18:30 PST (P-3) the server accepts the sign-off of the period in progress (11/23-12/06, payroll 12/11).
  History then shows that period's current revision as a non-current row: the heading reads "Payroll date 2026-12-11", and the row has no
  Signed fact, no delivery badge, no "Resend email" and no "Correct this period". The cause is `historyWindow`/`buildRevisionRows` in
  `src/client/components/deliveryModel.ts`: the windows end at the displayed period's end. On 2026-11-28 (P+1) the same row is complete.
  - **Why non-blocking:** the revision, its origin, its PDF, its recipients and its attempts stay visible. The missing History actions
    return no later than P+1, ten days before that period's own due time. The code is unchanged since WP3 (5b90d30, 8ad2e4f) and lies
    outside this tests-only delta.
  - **Optional fix for the pilot backlog:** extend the last window to the end of the period in progress when it follows the displayed one.
  - The coordinator may re-classify this against docs/04 (History: "reasoned correction and explicit resend").
- **Carried unchanged and non-blocking** (the product is byte-identical, and FIX10 does not touch the files they concern):
  - R-AB8-1: the seed unit test has no case with an existing session; the FIX9 tests are unchanged.
  - R-AB8-2: `displayedPeriodFreeWorkdays` (`fixtures.ts:419-427`) still keeps its own filter.
  - R-AB8-3: a run that crosses local midnight; not observed.
  - R-AB8-4: sweep coverage. This audit adds eight instants in 2026-2028, a leap day and a DST week, but still only the seeded schedule and
    holiday set.
  - R-B7-1 to R-B7-4. `sharing.spec.ts` and the other sideways checks are unchanged, so R-B7-2 stands.
  - A7's R1 (`npm audit --omit=dev` 0; `npm audit` 1 high, the dev-only `source-map-js`, GHSA-68fv-2mgg-jv7q), R5, N5, N6 and N7.
  - B6's R-10, R-11, R-13, R-14 and R-16 to R-20.

  They stay as backlog for the pilot fix round.

## Required gates unrun or blocked, and why

- None unrun. The full e2e ran on the real clock on both projects inside the AB8-01 window (2026-10-13 23:36-23:42 PDT, after the 17:00 due
  of the displayed period), so the moved-deadline path ran on the real clock. The natural path ran in the sweep (s3, s4 and s5).
- Every other calendar instant ran only under the simulated clock, validated as described above; the real date cannot be changed.
- I ran no `npm run verify`, smoke or Docker drill: the brief does not ask for them, and REGATE8 ran them on this digest.
- The e2e fixtures bind their servers to OS-assigned loopback ports by design, as in every earlier gate. I started no server of my own, so I
  used no port of 48560-48579.

## Disposition of previous findings

- **WP5-UX-AB8-01: closed.** The real clock inside the window gives 210 passed. The sweep instants on the moved path (s1, s2, s6, s7 and s8)
  and on the natural path pass. The 3670a6c specs fail at 18:30 on a due Tuesday, and the 90b98ef specs pass at the same instant.
- **WP5-UX-AB8-02: closed.** The days are released on every path; M8 brings the failure back and the fix removes it; s3 (2026-11-30, pool 3)
  passes.
- **WP5-UX-AB8-03: closed.** The dates lie after the displayed period; 0 problems over 823 days; s4 (2026-12-31, New Year inside the period)
  passes.
- **WP5-UX-AB8-04: closed.** The client's rule equals my rule on every day; s5 to s8 (2027-2028) pass.
- WP5-UX-B7-01 = WP5-UX-A7-01 stays closed (AB8), and WP5-UX-B6-01 stays closed (B7), carried by the byte-identical product.
- This PASS supersedes WP5-UX-AUDIT-A6 and the older audits that point to A6.

## Software readiness, owner permission and pilot result

- **Software readiness:** WP5 passes in both areas on 90b98ef (digest `57e2974c…`), on the strength of this audit, REGATE8 and the
  byte-identical product behind A7, B7 and AB8. Six optional risks (R-AB9-1 to R-AB9-6) and the carried backlog stay for the pilot fix round.
- **Owner permission:** none requested or given. No deployment, no real mail, synthetic data only.
- **Pilot result:** none; no pilot has run.

## One next action

Coordinator:
- record WP5-UX-AUDIT-AB9 PASS for areas A and B;
- set `superseded_by` on WP5-UX-AUDIT-A6 and the older audits that point to it;
- add R-AB9-1 to R-AB9-6 to the pilot fix-round backlog;
- continue the mission with the pilot packet identity refresh (REGATE8 drill image `sha256:dec7b485…`).

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:** WP5-UX-AUDIT-AB9, attempt 1.
  - Reviewer: self-reported `claude-opus-5-5`; a fresh subagent, whose agent ID is not visible from inside.
  - Reviewed authors: WP5-UX-FIX10 (`claude-sonnet-5-5`); the FIX10 freeze (committer) and WP5-UX-REGATE8 (verifier, `claude-sonnet-5-5`);
    the earlier round authors, the strongest of which is `claude-opus-5-5`. My model is not weaker than the strongest author.
- **Fresh context; reviewer did not author changes:** confirmed. I authored none of the reviewed changes and ran no gate, fix or earlier audit
  of this round. I edited no source, test, doc, board or STATE file. The exports, builds, scratch mutations, the control and probe specs and
  every run lived in the task folder. Process notes are in `00-README.txt`.
- **Source digest before/after; gate evidence for that snapshot:** `57e2974c…4b761d` before and after, in three forms (`01-…`, `90-…`). It
  equals the WP5-UX-REGATE8 digest of record (REGATE8 PASS; its NAS items NOT VERIFIED).
- **New report path preserving previous review history:** `handoff/delivery/WP5_UX_REVIEW_AB9.md` and `.vi.md`, both new files; every
  earlier review is untouched.
- **Finding dispositions and next coordinator fix/recheck task:** AB8-01 to AB8-04 are closed; there is no new finding. Next: record the PASS
  and the backlog, as above.
