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
- Baseline: main at the WP2-T09A-FREEZE commit. The coordinator gives the SHA at dispatch.
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

(Worker appends here.)
