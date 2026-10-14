# WP5 UI redesign, independent combined recheck of areas A and B (AB8) after WP5-UX-FIX9

[Tiếng Việt](WP5_UX_REVIEW_AB8.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5 owner-requested UI change round, task WP5-UX-AUDIT-AB8, attempt 1,
  2026-10-14 02:03Z to about 03:18Z (2026-10-13 19:03 to 20:18 in America/Los_Angeles). Reviewer self-reported model `claude-opus-5-5`,
  profile timesheet-auditor (effort set by the profile, not observable from inside). One combined delta recheck of area A and
  area B. The earlier reviews A to A7 and B to B7 are preserved unchanged.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** commit
  `3670a6c3c22ddcf75138927ed60f4cd9bf02078d` (the WP5-UX-REGATE7 freeze). HEAD = origin/main = `dc70ba6` before and after; it differs
  from 3670a6c only under `handoff/` (empty non-handoff diff). Digest `58b0deee5d0169f0211740de34953517500576baa2fd914d5a26059d5ba1dffd`,
  795 files, `handoff/` excluded, recorded first (02:04:02Z, right after `node --version`) and last (03:10:50Z), each time in three
  equal forms: `scripts/source-digest.mjs`, `git ls-tree` at 3670a6c and at HEAD. A clean `git archive` export of 3670a6c holds exactly
  the 795 paths and blobs of the tree (cmp 0, before and after every run). Source complete: `npm ci` exit 0 in the export.
- **Decision: FIX REQUIRED.**
  - **WP5-UX-B7-01 = WP5-UX-A7-01 is closed.** FIX9 changes only tests. The isolation and shell specs pass inside the failing window
    on the real clock (2026-10-13, after the 17:00 due time), and every isolation assertion is reached and passes on both projects.
    The unchanged 255ba17 specs still fail at the same moment.
  - **The product is unchanged since 255ba17:** `dist/` is byte-identical (230 files: 180 server, 46 domain, 4 client). The area-A
    and area-B conclusions of A7 and B7 carry forward.
  - Test strength holds: `fixtures.ts` is additive only, and the spec changes only replace the seed source. No assertion is removed
    or weakened, and no skip, fixme or only is added. The edge case fails clearly.
  - The seed rule is correct. I derived it independently, and the new deterministic test fails on the old choice.
  - **The mandatory full e2e does not pass:** exit 1, 207 passed, 3 failed, 26 skipped. The three failures are a pre-existing
    calendar-window defect in two deadline tests, **WP5-UX-AB8-01**: after the due time of the displayed period, the tests can no
    longer set up a deadline that is still ahead. They fail the same way on 255ba17. This is the class of defect that B7-01 was, so it
    blocks under the same rule.
  - To report every blocking defect in this pass, I swept the suite under a simulated clock. The method is validated against the real
    clock (see below). The sweep found three more defects of the same class, each test-only and older than FIX9:
    - **AB8-02:** the free-day pool runs out on 2026-11-28 to 11-30;
    - **AB8-03:** the holiday import collides with a finalized timesheet on 2026-12-26 to 12-31;
    - **AB8-04:** the default import year differs from 1 January to 30 September, so the test fails every day from 2027-01-01.
  - Typecheck, lint, `npm test` (83 files, 1827 tests) and AC-13 pass.

## Scope actually inspected and executed

1. **Delta and product.** I read the diff `255ba17..3670a6c` outside `handoff/` in full. I made clean exports of 255ba17 and 3670a6c,
   ran `npm ci` and `npm run build` in each, and compared `dist/` file by file. I rebuilt 3670a6c and compared it again before the full e2e.
2. **Test strength.** Numstat, the removed and added spec lines, a skip/fixme/only scan of the added lines and of the whole `tests/`
   tree, and the `test(` and `expect(` counts.
3. **Seed rule.**
   - My own date arithmetic over 2026-2027 (730 days) against `currentPayPeriod`, `payPeriodContaining` and the shared helper.
   - The seeded schedule and the synthetic holidays read from `reference/examples/`.
   - The due Tuesday at 16:59, 17:00 and 23:59, and midnight before and after the payroll date, through `zones.ts`.
   - Seven mutations of the test or the helper, in a scratch copy only.
   - Where the client opens: `TimesheetScreen.tsx:157-160` opens `periods.current`, and the server computes it with
     `currentPayPeriod` (`api.ts:103-111`).
4. **AC-01** on the real clock inside the window. A step reporter recorded every assertion step with its spec line. The 255ba17 specs
   ran at the same time.
5. **Mandatory checks** at 3670a6c: typecheck, lint, `npm test`, the FULL e2e on both projects (deprecation tracing on) and AC-13 once.
6. **Failure follow-up.**
   - I reran the two failing specs on 3670a6c and 255ba17 and read docs/05 line 26 on activation.
   - A simulated-clock sweep of the full suite ran at seven instants, plus one-worker reproductions.
7. **Carried items:** R-B7-1 to R-B7-4, A7 R1/R5/N5/N6/N7, B6 R-10, R-11, R-13, R-14 and R-16 to R-20.

**The simulated clock and how I validated it.** A preload, `shiftclock.mjs`, is passed through `NODE_OPTIONS=--import`. The fixtures
spawn the CLI and the built server with `...process.env`, so the preload reaches the Playwright runner, its workers, the CLI and
the server. Each of these processes shifts `Date` by one constant offset that the wrapper computes once. Elapsed time stays real.

The browser is not shifted. `src/client` never reads the browser clock: a grep for `Date.now`, `new Date(`, `Date()`, `.format()`,
`performance.now` and `setInterval` finds 0 lines. The page therefore shows only server dates. No source, test or config file
changed for this method.

The controls reproduce the real-clock behaviour on both sides of a due time:
- at 2026-10-27 13:00 PDT the two deadline specs pass;
- at 18:00 PDT the same three tests fail as on the real clock today;
- the full suite at 13:00 gives 210 passed, 0 failed, the REGATE7 count.

The server reported the simulated `today_local` in every run.

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX-AUDIT-AB8/` (index `00-README.txt`).

| Command | Result / exit | Evidence |
|---|---|---|
| digest, three forms, first and last; HEAD; non-handoff diff 3670a6c..dc70ba6 | `58b0deee…1dffd`, 795 files every time; HEAD = origin/main = dc70ba6; the diff is empty outside `handoff/`; the export is unchanged after all runs | `01-…`, `02-…`, `90-…` |
| `git diff --numstat 255ba17 3670a6c` outside `handoff/` | exactly 5 test paths: `e2eSeedSelection.test.ts` 133/0, `displayedSeed.ts` 37/0, `fixtures.ts` 12/0, `isolation.spec.ts` 2/3, `shell.spec.ts` 2/3; 0 bytes of diff under `src/`, `docs/`, `scripts/`, the package or config files | `02-…`, `03-…` |
| `npm ci` + `npm run build`, both exports; byte comparison | exit 0 for each; `dist/` 230 files; per-file sha256 lists equal (cmp 0); `diff -r` exit 0 for all of `dist/`, `dist/server` and `dist/client`; client `index-ZRY_mcb_.js` 483030 bytes (sha256 `74d87ee4…`), CSS `index-B6Rp4E3V.css`; the same again after the rebuild | `04-…` |
| `npm run typecheck` / `npm run lint` (`no-deprecated`) | exit 0 / exit 0 | `05-…` |
| `npm test` | exit 0; 83 files, 1827 tests | `05-…` |
| seed test, verbose | 4/4 passed | `05-…` |
| own derivation (`derive.ts.txt`) | 0 mismatches between the production period functions and my arithmetic over 730 days. Displayed != in-progress on exactly P-4..P (Mon-Fri). The old choice lands outside the displayed period on P-3..P (4 days per period). The helper equals my rule on 730 days and never throws with the seeded calendar (fewest past normal workdays: 3, on 2026-11-28) | `06-…` |
| scratch mutations | M1 (old choice through the helper) 2 of 4 fail, the first at 2026-09-15; M1b (old `legacySeed`) 3 of 4 fail; M2 oldest first, M3 today allowed, M4 silent instead of throw, M5 day class ignored: each caught; **M6 sessions ignored: survives** (R-AB8-1) | `07-…` |
| AC-01: `isolation.spec.ts` + `shell.spec.ts`, both projects, 2026-10-13 19:12 PDT | exit 0, 13 passed, 1 skipped (mobile-only test on desktop); seed day 2026-10-09 in the displayed period 09/28-10/11; 0 failed assertion steps | `08-…` |
| the same specs at 255ba17, 19:13 PDT | exit 1, 6 failed at `[data-day="2026-10-12"]`, so the old choice fails after 17:00 too | `09-…` |
| FULL e2e, both projects, 19:14-19:20 PDT | **exit 1: 207 passed, 3 failed, 26 skipped** (desktop 101/2/15, mobile 106/1/11). Failures: `automation.spec.ts:118` on both projects, "the displayed period is not due yet"; `pdf-visual.spec.ts:187` (desktop), `finalized.revision` null at `:117`. 0 deprecation lines | `10-…` |
| the two deadline specs again at 3670a6c and at 255ba17 | 3 failed / 3 failed, the same way: pre-existing, not from FIX9 | `11-…` |
| AC-13 `tests/integration/ac13-two-week.test.ts` once | exit 0, 1/1 | `05-…` |
| `npm audit --omit=dev` / `npm audit` | 0 vulnerabilities / 1 high (`source-map-js`, dev-only, GHSA-68fv-2mgg-jv7q): R1 unchanged | `05-…` |
| simulated controls (2026-10-27 13:00 and 18:00 PDT; full suite at 13:00) | pass / the same 3 failures / 210 passed, 0 failed | `12-…` |
| simulated full suite: 10-17 Sat, 10-26 Mon (P-4), 11-02 Mon (DST period) | 210 passed, 0 failed each | `13-…` |
| simulated full suite: 2026-11-28 Sat | 2 failed: `timesheet.spec.ts:403` on both projects, "past free workdays in the displayed period: expected >= 1, received 0" (AB8-02) | `13-…`, `14-…` |
| simulated full suite: 2026-12-26 Sat | 1 failed: `admin.spec.ts:281` on mobile, `[data-preview-can-commit="true"]` missing; the page says "The change would alter days of a finalized timesheet: 2027-01-01" (AB8-03) | `13-…`, `14-…` |
| simulated full suite: 2027-01-11 Mon | 2 failed: `admin.spec.ts:281` on both projects, "Year of the dates" expected 2028, received 2027 (AB8-04) | `13-…`, `14-…` |
| one-worker reproductions | shell + timesheet on 11-28: `:403` fails on 3670a6c and on 255ba17, timesheet alone passes; admin-status + admin on 12-26: `:281` fails on both projects, admin alone passes | `14-…` |
| isolation and `shell.spec.ts:67` across the real run, the real full run and all 7 simulated full runs | 6/6 isolation tests and 2/2 shell:67 pass in each, with 0 failed isolation assertion steps (today 10-13, 10-17, 10-26, 10-27, 11-02, 11-28, 12-26, 2027-01-11) | `08-…` |

## Product unchanged (scope 1)

The diff outside `handoff/` touches only `tests/`. Both exports build the same `dist/`, byte for byte, twice. So the product behaviour
of 255ba17 is the product behaviour of 3670a6c. In particular, these carry forward:
- B7's area-B results (B6-01 closed, the switcher, the targets, the contrast, the token scan);
- A7's area-A results (endpoints and bodies, A-01, AC-04, R-07, AC-16/AC-01, privacy, PDF).

## Test strength (scope 2)

- `tests/e2e/fixtures.ts` +12/-0: one import of `displayedPeriodSeedDay` and the new method `displayedSeedDay()`. No existing helper
  line changed.
- Each spec removes the same 3 lines:
  - the old `pastFreeWorkdays()` call;
  - its precondition `expect(workDate, …).toBeDefined()`;
  - the `undefined` guard. In `shell.spec.ts` that guard was a `return`, dead code after a failing non-soft `expect`.

  Each spec adds one comment line and `const workDate = await ….displayedSeedDay();`. The precondition moved into the helper, which
  throws a named error. So the only `expect(` that disappears (46→45 and 30→29) is that precondition, now enforced by the throw.
- Every isolation and shell assertion is untouched. The added lines contain no `skip`, `fixme` or `only`. The `tests/` tree still has
  12 skip lines and 0 only/fixme, as at 255ba17.
- **Edge case:** `displayedPeriodSeedDay` throws "The displayed period (payroll X) has no past normal workday without a session on D;
  …". Both call sites await it outside any try/catch (`isolation.spec.ts:53`, before the `try`; `shell.spec.ts:69`), so the test fails
  and is never skipped. The unit test asserts the message, and mutation M4 (return silently) is caught.

## Seed rule (scope 3)

- **Rule, derived from `currentPayPeriod` (`periods.ts:149-164`):**
  - The page opens on the period with the earliest payroll date on or after the reporting-zone today. This depends on the date
    only; the due time plays no part.
  - For the seeded schedule (anchor 2026-10-02, cycle 14, period P-18..P-5, due P-3 17:00 America/Los_Angeles), that period differs
    from the period containing today on P-4..P: Monday to the payroll Friday, 5 days.
  - The old `pastFreeWorkdays()[0]` lies outside the page on P-3..P (4 days; on P-4 the new period has no past day yet). In this
    cycle that is 2026-10-13 to 10-16, at any hour. B7's "before 17:00" was imprecise: the 255ba17 specs still failed at 19:13 PDT.
- **The deterministic test** `tests/domain/e2eSeedSelection.test.ts`:
  - It steps 56 days from 2026-09-14 (four whole periods) at 00:30, 16:59, 17:00 and 23:59 Los Angeles time.
  - This includes the due Tuesdays and the payroll dates.
  - It checks the 20-day window with the production functions and that the seed always lies in the displayed period and before
    today. It also checks the 16-day negative control and the holiday and no-workday cases.
  - It fails when the old choice is restored (M1, M1b).
- **One helper, no drift:** the specs reach `displayedPeriodSeedDay` through `SeedClient.displayedSeedDay()`, which imports it from
  `tests/e2e/displayedSeed.ts`. That is the module the unit test imports. The period the fixture reads is `/api/periods/current`
  `current.payroll_date`, the field the client opens first, computed by the same `currentPayPeriod`.
  - A pre-existing copy of the same filter remains in `displayedPeriodFreeWorkdays()` (`fixtures.ts:419-427`), which other specs use.
    FIX9 had to stay additive, so this is optional (R-AB8-2).

## AC-01 evidence (scope 4)

The run was **inside the window** on the real clock: 2026-10-13 19:12 PDT (today 2026-10-13, displayed period 09/28-10/11 with
payroll 10/16, in-progress 10/12-10/25), after the due time. Both projects: 13 passed, 1 skipped, exit 0. Per project, the step report
shows these assertion lines reached and passed:
- **second employee** (`:93`): `:101`, `:105-108` (the row is visible, no Complete, no complete check, no note);
- **hash swap**: `:113` ×4, `:114` ×4, `:116`;
- **id swap**: `:79`, `:89`, `:90` (GET/PUT/DELETE 404) and `:121`, `:123`, `:124`;
- admin routes 403: `:127-131`;
- employee 1 intact: `:136-138`;
- **admin screens** (`:144`): `:153-161`, `:168-169`, `:179` ×5, `:79`/`:89`/`:90`, `:185-188` and `:191-192`.

Also `:198` (`:202-209`) and `shell.spec.ts:67` (seed 2026-10-09).

A run outside the window on the real clock was not possible today. The simulated full runs at 10-17, 10-26, 11-02, 11-28, 12-26 and
2027-01-11 pass all 6 isolation tests and both `shell.spec.ts:67` runs.

## Findings

| ID | Severity | File / function | Reproduction | Expected / actual | Rule / AC | Bounded fix |
|---|---|---|---|---|---|---|
| WP5-UX-AB8-01 | Low (tests only, older than FIX9; blocks because the mandatory full e2e fails) | `tests/e2e/automation.spec.ts:149-151` (test `:118`) requires `periods.current.due_at_utc > Date.now() + 120 s`. `tests/e2e/pdf-visual.spec.ts:219-221` (test `:187`) records the activation at `Date.now() + 60 s` and drains jobs at `current.due_at_utc + 5 min` | Real clock, 2026-10-13 19:14 PDT, after the 17:00 due of the displayed period: the full e2e has 3 failures (`10-…`). Rerun at 3670a6c and at 255ba17: the same 3 (`11-…`). Simulated 2026-10-27: 13:00 passes, 18:00 fails the same 3 (`12-…`) | Expected: the required suite passes on any day. Actual: from about 16:58 on each due Tuesday (P-3) to the end of the payroll date P, about 3 days 7 hours of every 14, automation stops at its precondition. pdf-visual gets no automatic revision, because docs/05 line 26 rightly makes a period eligible only when its due is on or after the activation | AGENTS.md rule 5; docs/06 line 30 (deterministic clocks, "simulate deadlines instead of waiting days"); this audit's mandatory full e2e | Run the deadline scenario on a period whose due is still ahead: when `current` is due within the margin or past it, use `in_progress` or the next period from `/api/periods`, seed it and assert on it. Or use a test-only injectable clock. Keep every assertion. Prove it at P-3 13:00, P-3 18:00, P and P+1 (for example with this audit's simulated-clock wrapper) |
| WP5-UX-AB8-02 | Low (tests only, older than FIX9; blocks on those dates) | `tests/e2e/shell.spec.ts:67-70` and `tests/e2e/timesheet.spec.ts:189-201` seed days for the worker-shared employee (one complete day; one complete day plus one with unconfirmed breaks) and never remove them. `timesheet.spec.ts:403-408` then needs one more free day of the displayed period | Simulated 2026-11-28 10:00 PST, full suite: `timesheet.spec.ts:403` fails on both projects with "expected >= 1, received 0". One worker, shell + timesheet: it fails on 3670a6c and on 255ba17; timesheet alone passes (`13-…`, `14-…`) | Expected: the suite passes on any day. Actual: on 2026-11-28 to 11-30 the displayed period 11/23-12/06 has only 3 past normal workdays (the synthetic holidays 11-26 and 11-27), and the worker's specs use 4 | AGENTS.md rule 5; docs/06 line 30 | Release every seeded day (`clearSessions` in `finally`) in `shell.spec.ts:67` and `timesheet.spec.ts:189`, or seed on per-test accounts (`newPerson`). Then check the per-worker demand against the minimum pool (3) |
| WP5-UX-AB8-03 | Low (tests only; blocks on those dates) | `tests/e2e/admin.spec.ts:281` (holiday CSV) imports `${year}-01-01` effective from `periods.current.period_start` on the worker's shared calendar | Simulated 2026-12-26, full suite: `:281` fails on mobile at `:338`, and the page says "The change would alter days of a finalized timesheet: 2027-01-01". `admin-status.spec.ts` had finalized a timesheet of that period on the same server. One worker, admin-status + admin: both projects fail; admin alone passes (`13-…`, `14-…`) | Expected: the suite passes on any day. Actual: while the displayed period spans New Year (2026-12-26 to 12-31: period 12/21-01/03), the import touches a finalized day, and the product correctly refuses it | AGENTS.md rule 5; docs/06 line 30 | Use import dates outside the displayed period, or a calendar no other test finalizes (`seedSecondCalendar`). Keep the stale-hash and no-change assertions |
| WP5-UX-AB8-04 | Low (tests only; first fails on 2027-01-01) | `tests/e2e/admin.spec.ts:290` falls back to "today's year + 1" when there is no next-year warning. The client's `defaultImportYear` (`src/client/components/adminModel.ts:93-95`) falls back to today's year. The server warns only from 1 October (`calendars.ts`, E-12) | Simulated 2027-01-11, full suite: `:281` fails on both projects at `:304`, "Year of the dates" expected 2028, received 2027 (`13-…`) | Expected: the test follows the shipped default; docs/04 sets no default year. Actual: it fails every day from 1 January to 30 September, starting 2027-01-01 | AGENTS.md rule 5; docs/06 line 30 | Compute the expected year with the client's rule (the warning year, else the current year) or import `defaultImportYear`. Keep every assertion. A next-year default would be a product change for the owner |

## Risks and optional improvements (not defects)

- **R-AB8-1:** the seed unit test never puts a session on a day, so a helper that ignored existing sessions (mutation M6) would still
  pass it. The e2e would then fail loudly on an overlapping session, not silently. Optional fix: add a case where the newest past
  workday already has a session.
- **R-AB8-2:** `displayedPeriodFreeWorkdays()` (`fixtures.ts:419-427`, pre-existing, used by 12 spec files) keeps its own copy of the
  helper's filter. Optional fix: let it call `freeWorkdaysOfDisplayedPeriod`.
- **R-AB8-3:** a run that crosses local midnight reads "today" at different moments: the seed, then the page. This is a flake risk,
  not observed.
- **R-AB8-4:** the sweep covered 7 instants of the seeded calendar. Other years, payroll exceptions and other holiday sets were not
  run.
- **Carried unchanged and non-blocking:**
  - R-B7-1 to R-B7-4. The product is byte-identical, and `sharing.spec.ts` is unchanged, so R-B7-2 stands.
  - A7's R1 (`npm audit --omit=dev` 0; one dev-only high), R5, N5, N6 and N7.
  - B6's R-10, R-11, R-13, R-14 and R-16 to R-20.

  They stay as backlog for the pilot fix round.

## Required gates unrun or blocked, and why

- None unrun. The full e2e ran on both projects and failed only through AB8-01, which I reproduced on both snapshots and traced.
- AC-01 ran inside the window on the real clock. Outside the window it ran only under the simulated clock, because the real date
  cannot be changed.
- AB8-02 to AB8-04 are reproduced under the simulated clock, which the controls validate. They are not reproduced on the real clock.

## Disposition of previous findings

- **WP5-UX-B7-01 = WP5-UX-A7-01: closed.**
- WP5-UX-B6-01 stays closed (B7), carried by the byte-identical product.
- WP5-UX-AB8-01 to AB8-04 are new and open.
- This audit does not pass, so it supersedes neither WP5-UX-AUDIT-A6 nor any older audit.

## Software readiness, owner permission and pilot result

- **Software readiness:** not yet. The only reason is WP5-UX-AB8-01 to AB8-04, all test-only Low defects in the e2e suite's
  dependence on the calendar. The product behaviour of both areas passes, unchanged since 255ba17.
- **Owner permission:** none requested or given. No deployment, no real mail, synthetic data only.
- **Pilot result:** none; no pilot has run.

## One next action

Coordinator: open one tests-only fix task for WP5-UX-AB8-01 to AB8-04:
- choose the deadline period;
- release the seeded days or use per-test accounts;
- use holiday-import dates outside the displayed period;
- use the client's default-year rule.

Then run a freeze and a gate with the full e2e on the real clock plus a simulated-clock sweep at P-4, P-3 13:00, P-3 18:00, P, P+1,
2026-11-28, 2026-12-26 and 2027-01-11. Then run a combined A+B recheck of that delta.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:** WP5-UX-AUDIT-AB8, attempt 1.
  - Reviewer: self-reported `claude-opus-5-5`; a fresh subagent, whose agent ID is not visible from inside.
  - Reviewed authors: WP5-UX-FIX9 (`claude-sonnet-5-5`); the FIX9 freeze (committer) and WP5-UX-REGATE7 (verifier,
    `claude-sonnet-5-5`); the earlier round authors, the strongest of which is `claude-opus-5-5`. My model is not weaker than the
    strongest author.
- **Fresh context; reviewer did not author changes:** confirmed. I authored none of the reviewed changes and ran no gate, fix or
  earlier audit of this round. I edited no source, test, doc, board or STATE file.
  - Exports, builds, scratch mutations and every run lived in the task folder.
  - Process notes are in `00-README.txt`: one stray listing file was written next to the task folder and removed at once; one log
    was read with `tail` on a file (no pipe); one masking pass was redone.
- **Source digest before/after; gate evidence for that snapshot:** `58b0deee…1dffd` before and after, three forms (`01-…`, `90-…`).
  It equals the WP5-UX-REGATE7 digest of record (REGATE7 PASS, attempt 3).
- **New report path preserving previous review history:** `handoff/delivery/WP5_UX_REVIEW_AB8.md` and `.vi.md`, both new files;
  every earlier review is untouched.
- **Finding dispositions and next coordinator fix/recheck task:** B7-01 = A7-01 is closed, and AB8-01 to AB8-04 are open. Next: the
  tests-only fix above, then a freeze, a gate with the simulated-clock sweep, and a combined A+B recheck.
