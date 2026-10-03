# WP2-T09B dispatch brief

- Mission/task: timesheet-software-readiness / WP2-T09B; package WP2; kind implement;
  attempt 1; depends on WP2-T09A-FREEZE. This is the second half of the plan's T09, which
  the coordinator split per WP2-T09-PREP.
- Profile/routing: timesheet-worker, requested sonnet/medium, no override. Routing:
  size M, risk M, novelty no (the harness exists).
- Read AGENTS.md from disk first, especially the Unified Frontend & UI/UX Standards
  section. Then read:
  - the Results of [WP2-T09-PREP](WP2-T09-PREP.md), sections A and D, which are binding,
    and E;
  - the Results of [WP2-T09A](WP2-T09A.md): the harness, `SeedClient`, the tokens and the
    skill-conflict resolutions;
  - [WP2-PLAN](WP2-PLAN.md) task T09;
  - docs/04 lines 7, 14 and 38;
  - src/client/* and tests/e2e/*.

  Records in English.
- Load the three design skills with the Skill tool before UI edits:
  `stitch-design-taste`, `design-taste-frontend` and `high-end-visual-design`. Follow the
  T09A resolutions: AGENTS.md and E-8 win.
- Baseline: main at 717db3ee30057089298a8852438f16d46aa4dc89 (the WP2-T09A-FREEZE commit).
  The working tree differs only in handoff/.
- Runtime: call the Node 24 portable binary by its full path. The fixture already uses
  `process.execPath`.
- Do not commit.

## Required content

- **Desktop two-week grid** (TimesheetGrid). For each day it shows:
  - category;
  - time;
  - completeness (from the server's `calculation.status` and `attendance_expected`);
  - pending OT.
  It also shows the period due date and the relation. Hours and minutes only.
- **Mobile day list** (DayList). Exactly one of the grid and the list renders, chosen by
  `matchMedia('(min-width: 768px)')`.
- **Both zones and the accounting date are visible**: the reporting zone and the display
  zone, with "your time" for the due date.
- **Status display** (DayStatus): text plus shape, never colour only. The review and
  delivery status shows only what the server provides (draft or finalized). Invent no WP3
  values.
- **Display logic** (dayModel.ts): pure presentation (week groups, display states). It
  maps server fields and computes no business minutes.
- **Batch category edit** (BatchBar and BatchDialog, a native `<dialog>`):
  - select days, preview, then commit with per-date `expected_version`;
  - a conflict dialog lists the conflicting sessions by joining `sessions[]` on
    `work_date`, and requires confirmation;
  - a reason prompt appears when the server requires a reason (old dates);
  - a 409 stale-version reload message names the affected dates, using `error.details`.
- Replace the em-dash placeholders and the period-range dash in the grid with
  skill-compliant text.

Covers FR-03, FR-04, docs/04:7,14,38 and the gate item "core browser flows".

## Owned (writable) paths

- src/client/TimesheetScreen.tsx and src/client/styles.css.
- src/client/api.ts, for types only.
- New files under src/client/components/: PeriodHeader, ClockBar (extracted), TimesheetGrid,
  DayList, DayStatus, BatchBar, BatchDialog, format.ts and dayModel.ts.
- tests/client/dayModel.test.ts (new). It must run under the existing vitest include; if
  it does not, report this as a deviation rather than changing the config silently.
- tests/e2e/timesheet.spec.ts (new) and tests/e2e/fixtures.ts (seed helpers only).
- This report and handoff/delivery/evidence/WP2-T09B/.

List any other minimal edit as a deviation.

## Checks (e2e on both projects)

- Desktop:
  - the grid shows the 14 days with due date, completeness and pending OT;
  - a seeded complete day shows complete and 8h 00m;
  - a seeded day with unconfirmed breaks shows pending OT.
- Mobile:
  - the list replaces the table;
  - `scrollWidth <= innerWidth`;
  - every control is at least 44px;
  - the zones and accounting dates are visible.
- Batch:
  - a preview, then the conflict dialog for a clock-session day, then a confirmed commit;
    the sessions are unchanged afterwards (check through the API);
  - a reason prompt for a day in the previous period, then a commit with the reason;
  - a stale 409: change one day through the API between preview and commit, then expect
    the reload message.
- Unit tests for dayModel.
- Run `npm run verify` and `npm run test:e2e`; both must exit 0.
- Run `npm run digest`.
- Screenshots named `*-synthetic.png`, copied to the evidence directory.
- Evidence must be masked, LF and free of trailing whitespace. Use synthetic data only,
  no deprecated APIs and no inline styles.

Return at most 200 words, beginning with your self-reported model: files changed, the
flows covered, verify and e2e exits, digest and deviations.

## Results

Self-reported model: claude-sonnet-5-5 (timesheet-worker, attempt 1). Baseline main 717db3e.
Nothing was staged, committed or pushed; no shared state was edited. Evidence:
`handoff/delivery/evidence/WP2-T09B/` (`commands.txt`, six `*-synthetic.png`).

### Files

- Source: `src/client/TimesheetScreen.tsx` (container: period, selection, batch flow, matchMedia
  768px choice), `src/client/styles.css`; new `src/client/components/` `PeriodHeader.tsx`,
  `ClockBar.tsx`, `TimesheetGrid.tsx`, `DayList.tsx`, `DayStatus.tsx`, `BatchBar.tsx`,
  `BatchDialog.tsx` (native `<dialog>`, `showModal()`), `format.ts`, `dayModel.ts` (pure).
  `src/client/api.ts` needed no change (T09A already added the types and `error.details`).
- Tests: `tests/client/dayModel.test.ts` (new, 17 tests; runs under the existing vitest include
  `tests/**/*.test.ts`, no config change), `tests/e2e/timesheet.spec.ts` (new),
  `tests/e2e/fixtures.ts` (seed helpers only: `today`, `displayedPeriodFreeWorkdays`, `dayView`,
  `seedClockSessionToday`, `commitCategory`).

### Flows covered (both projects; list reporter, Edge, Playwright 1.63.0)

- Grid (desktop) or list (mobile), exactly one rendered; 14 days; due date in the reporting zone and
  "your time"; reporting and display zones (display zone is Asia/Saigon vs America/Los_Angeles);
  accounting dates; Draft from `timesheet.finalized` only; a complete day shows `complete` and
  `8h 00m`; unconfirmed breaks show `confirm breaks` and `pending OT`; shapes next to text; no en or
  em dash in the screen text; mobile `scrollWidth <= innerWidth` and every button, link, select, text
  input, pick label and inline label at least 44x44.
- Batch: preview (nothing saved), conflict step for a clock session with the joined session text, the
  confirm checkbox gate, commit; the sessions read back through the API are identical afterwards and
  the category is Vacation. Previous (old) period: reason prompt, commit disabled until a reason,
  commit with it. Stale 409: one day changed through the API between preview and commit, the alert
  names the date and says nothing was saved, "Reload period" shows the new label.
- Two clean repeats of the full e2e run passed before the final run.

### Checks (actual; `commands.txt`)

- `npm run verify`: exit 0 (typecheck, lint with `no-deprecated`, vitest 27 files and 541 tests,
  build, smoke SMOKE PASSED; node v24.21.0).
- `npm run test:e2e`: exit 0; 15 passed, 1 skipped (the mobile-only shell test on `desktop`).
- `npm run digest`: exit 0, `4d242ea9105936a4bc95a1593c809f56b142b399d1c393a3863ab53e34eb159b`
  (577 files, handoff/ excluded).

### Design notes

- T09A conflict resolutions applied: AGENTS.md and E-8 win (4px radius, tokens only, one transition
  property, tinted shadows, no pills or double bezel). One new token `--scrim` (dialog backdrop).
  Status shapes (circle, diamond, square, triangle, bar) are CSS shapes next to words; they are
  semantic, not decoration. Em-dash placeholders became `none` or `unclassified`; the period range
  and session ranges use "to".
- The client maps server fields only: pending OT mirrors how the server counts `totals.pending_days`
  (open session or unconfirmed breaks); an expected day with no record is `missing record`.

### Deviations and observations

1. `tests/e2e/shell.spec.ts` (T09A file, outside the owned list) was edited in two lines: the
   third test counted `getByRole('row')` (15) and filtered a row by text; the mobile list has no rows,
   so it now counts `[data-day]` (14) and selects `[data-day="<date>"]`.
2. Observation: future days in the displayed period show `missing record` because the server reports
   `attendance_expected` and `no_records` for them; the client does not compute "future". A server
   field (or a per-day relation to today) would let the view say "not yet" instead (WP3 or T10 decision).
3. Observation: e2e seeds need past free workdays in the displayed (current payroll) period; the specs
   fail with an explicit message if fewer than two exist (possible only near the start of a period).
4. No background process of mine remains; the fixture removes its temp directories.
