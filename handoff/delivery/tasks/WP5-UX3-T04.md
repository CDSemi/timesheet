# WP5-UX3-T04 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T04; package WP5; kind implement;
  attempt 1; depends on WP5-UX3-T03-FREEZE. Fourth slice of UI change round 3: the page
  header and the period bar.
- **AGENTS.md on disk wins.** Any older injected AGENTS.md copy in your context with the
  section "Unified Frontend & UI/UX Standards (Taste Skills Integration)" is superseded;
  follow the on-disk section "Frontend and UI/UX standards".
- Owner basis (board `owner_decisions`, 2026-10-15): U-07 (Check in/out and its "checked in
  since" time on the page-title row, right-aligned, large screens), U-08 (no user name under
  the page title), U-09 (pills: "old" and "current" keep their current hue but must be easy
  to see in light mode; "future" pink, distinct in both modes), U-10 (payroll date, due and
  "Times in" on one row when there is room, wrapping otherwise), U-11 ("Open a day" title on
  the same row as its date picker), U-12 (space between "Show details" and "Change several
  days"), U-17 (narrow screens: "Current" when "Today", "Current period" and "Sign off" still
  do not fit), U-18 (hide the "Open a day" text when title, picker and "Open day" do not fit
  on one row), and G-5 (b): "in progress" on the period that contains today during the five
  window days.
- Design sources (the contract): `handoff/delivery/tasks/WP5-UX3-PLAN.md` Results sections
  B4 (except the wordmark bullet, done in T02) and B6, section F rows U-07/U-08, U-09,
  U-10/U-11/U-12, U-17/U-18 and the "Existing assertions that must change" items for
  `today.spec.ts` and the `.badge` selectors, section H row WP5-UX3-T04, section I
  (R-UX2A-3 and R-UX2A2-1 included); `handoff/delivery/tasks/WP5-UX3-PLAN2.md` Results item 7
  (the "in progress" rule, colours and tests); the mockup artboards A3, A3b and A7 and the
  renders `mockup-r2-a3-page-header-pills-synthetic.png`,
  `mockup-r2-a3b-meta-in-progress-synthetic.png` and
  `mockup-r2-a7-phones-in-progress-synthetic.png`. The pill and progress tokens already exist
  (T01).
- Coordinator decisions (board): G-5 (b) uses server values only (`periods.in_progress` and
  `periods.current`; never the device clock); edit-reason rules are unchanged (the server
  relation stays "future" for that period).
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model sonnet; no override. Routing: size M, risk M (first-screen budgets; accounting-date
  semantics of G-5, AGENTS rule 7), novelty no. Task record in English.
- Base: HEAD = origin/main = 7cd8c592ba57d7f4a12013bacced948de0fb8c42 (the T03 freeze), or
  a later commit that changes only `handoff/`; source digest
  e5b3faf96c7856fdf5e8c3c85072270e3b7112f100ba364efe2a5331bb367564 (827 files). Record HEAD,
  `git status --short` and the digest before you edit. Uncommitted coordinator files under
  `handoff/` are expected: never touch them.

## Scope

1. **Title row (U-07, >= 768px)**: `.page-head` becomes a wrapping flex row: h1 left, the
   check in/out group right (the existing `ClockStatus` and `ClockButton` in a compact
   variant: status words right-aligned over the date line, button 38px, 44px on touch). The
   separate clock card leaves the work bar, so the period card is full width. Phones keep
   the round-2 top-bar clock and the visually hidden page head. Shared view: no check in/out
   (as now).
2. **U-08**: remove the line under the h1 in the own and the shared view (the shared h1 still
   says "{owner}'s timesheet").
3. **Pills (U-09, G-5)**: filled and outlined, `--radius-pill`: old (amber), current
   (green), future (pink), neutral status words such as "Draft" (grey), and "in progress"
   (blue, PLAN2 item 7) for the displayed period when its payroll date equals
   `in_progress.payroll_date` while `current.payroll_date` differs. One pure function in
   `periodBarModel.ts` returns the pill kind from the server's periods (own and shared
   views; the shared view uses the owner's periods). Words stay (not colour alone).
4. **Meta row (U-10)**: the period card becomes a two-row grid: row 1 previous, title and
   pill, next, Today, Current period, Review; row 2 the meta line (payroll date, due, "Times
   in") across the full width under a hairline, wrapping (gap per B4).
5. **Open a day (U-11, U-18)**: text, field and button on one row at every width; below
   21rem container width the words "Open a day" are visually hidden while the `<label>`
   still names the field "Open a day".
6. **Toolbar (U-12)**: `--toolbar-group-gap` with a 1px `--line` separator between Show
   details and Change several days; "Change several days" becomes an outlined secondary
   button; pressed stays the solid accent.
7. **Narrow period buttons (U-17)**: "Current period" gets the visible short form "Current"
   below its threshold (B6: from 22.8rem the review link is full; 18.4-22.8rem "Sign off";
   below 18.4rem "Current" plus "Sign off" on one row down to 15.4rem, with a few rem of
   margin for system-font differences, R-UX2A-3), accessible names "Current period" and
   "Review & sign off" (SC 2.5.3).
8. **R-UX2A2-1**: the inactive Today differs by more than hue (for example a dashed or no
   border while inactive), the focus ring unchanged.

## Tests

- `tests/client/periodBarModel.test.ts`: the pill function for old, current, future,
  neutral and "in progress" (a window day and a normal day; own and shared periods).
- e2e (both projects) per plan section F rows and PLAN2 item 7:
  - `shell.spec.ts`/`timesheet.spec.ts`: on >= 768px the check in/out group sits in the
    title row right of the h1 (same row box), no clock card; phone unchanged; shared view has
    none; no name line under the h1 (own and shared);
  - pills: each ink >= 4.5:1 on its fill in four theme situations; the fills differ;
  - meta row: one row at 1280, wrapped at 820; Open a day text, field and button share one
    row at >= 768px and on phones (text hidden below the threshold; field still named "Open a
    day"); the toolbar gap equals the token;
  - `today.spec.ts`: at 320 in the away state Today, "Current" and "Sign off" on one 44px
    row with full accessible names; "Current period" in full at 360-390;
  - G-5 under the simulated clock (the WP5-UX-FIX10 preload: copy
    `handoff/delivery/evidence/WP5-UX-FIX10/shiftclock.mjs.txt` into your task folder as
    `.mjs`, never into the repository): at `2026-10-26T16:00:00Z` Today opens 10/26-11/08 with
    "in progress" and Current period shows 10/12-10/25 "current"; at `2026-10-20T17:00:00Z`
    no "in progress" anywhere and the next period is "future"; also run the new and changed
    specs on the real clock;
  - the 390x844 first-screen budgets in every state the round-2 tests assert (landing and
    away, own and with a share, with and without the zone note): record the numbers.
- Replace the assertions the plan lists (`today.spec.ts:389-470` 320px review row,
  `.badge.old`/`.badge.current` selectors if the class names change) and any clock-card
  assertion; list each with file:line and why it is not a weakening.
- No assertion removed or weakened; no `skip`, `fixme` or `.only`; dates only from the
  server-reported `today_local` and the displayed period.

## Hard constraints

- No server, API, domain, schema or CSP change. Never compute the accounting date or the
  period relation from the device clock or the display zone.
- Tokens only; shared `var(--transition)`; WCAG 2.2 AA (1.4.3, 1.4.11, 1.4.1, 2.5.3, 2.5.8 /
  44px below 768px, 1.4.10 no horizontal scroll at 320).
- Keep AX-01..AX-10, R-12, the round-2 Today/Current period behaviour and every T01-T03
  behaviour.

## Owned paths

- `src/client/TimesheetScreen.tsx`, `src/client/SharedTimesheetScreen.tsx` (header line
  only), `src/client/components/ClockPanel.tsx`, `src/client/components/PeriodBar.tsx`,
  `src/client/components/periodBarModel.ts`, `src/client/components/OpenDay.tsx`,
  `src/client/styles.css`
- `tests/client/periodBarModel.test.ts`, `tests/e2e/timesheet.spec.ts`,
  `tests/e2e/today.spec.ts`, `tests/e2e/shell.spec.ts` (clock and header assertions),
  `tests/e2e/sharing.spec.ts` (shared header), `tests/e2e/keyboard-access.spec.ts` (tab
  order of the moved clock group), `tests/e2e/theme.spec.ts` (budget assertions only, if
  their numbers move)
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX3-T04/` (masked LF `.txt` only, plus at most eight
  screenshots whose basenames end in `-synthetic.png`)

## Checks (in this order; verify and digest are the LAST commands)

1. Node 24 first on PATH (with `cygpath -u`), then `node --version` (v24.x).
2. Before any edit: `git rev-parse HEAD`, `git status --short`, `npm run digest`.
3. Implement, then `npm run typecheck`, `npm run lint`, `npm test`.
4. `npm run build`: record the main chunk size; no chunk-size advisory.
5. The FULL e2e suite on both projects on the real clock (`npm run test:e2e`), alone, with
   `E2E_SCREENSHOT_DIR` and the Playwright output folder inside the task folder. 0 failed;
   counts per project. `ERR_NO_BUFFER_SPACE` or an ECONNRESET in `automation.spec.ts`: rerun
   that test three times, then the full suite once. Any other failure in a file you do not
   own: stop and report it.
6. The simulated-clock runs of `today.spec.ts` and `timesheet.spec.ts` on both projects at
   2026-10-20T17:00:00Z, 2026-10-26T16:00:00Z and 2026-10-30T23:00:00Z (each run alone, own
   output folder); a table of instant, branch, passed, failed.
7. One mutation check: make the pill function ignore `current` (always "in progress" for the
   period with today); show that a unit test and the 2026-10-20 e2e check fail; revert.
8. Privacy and whitespace: Grep changed files and evidence for email addresses and
   user-profile paths (only the full synthetic example.invalid form may remain); Grep every
   new or changed file for `[ \t]+$` and read its last lines (exactly one final newline).
9. `npm run verify` with `SMOKE_PORT` in 48660-48679 and `DATA_DIR` and `DATABASE_PATH`
   both inside the task folder.
10. `npm run digest` LAST. If any file changes after it, rerun verify and the digest.
11. Copy the masked logs of steps 2-7, 9 and 10 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`, NOT EVEN TO WRITE A FILE), NO `| node`, NO `| python`, NO
  `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`, NOT EVEN
  FOR A READ-ONLY LISTING. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul` (NOT EVEN
  `2>/dev/null`). NEVER `rm -r` OR `rm -rf` ANYTHING.** Redirect to a file in the task
  folder and read it with the Read tool; list files with the Glob tool. Use the Write and
  Edit tools for files (no sed, no heredoc).
- **Create files only inside the task folder, the evidence folder or your owned paths.**
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX3-T04`. Set TEMP and TMP to it. Ports
  48660-48679. Never touch `%LOCALAPPDATA%\timesheet-dev` data or `B:\Temp\claude`. Never
  kill processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. Write no
  markdown links in Results (paths in backticks only).

## Return

At most 170 words, beginning with 'Self-reported model: ...': files changed (every test file
with changed assertions), the pill rule and colours as implemented, the narrow thresholds,
unit and full e2e counts per project, the simulated-clock table summary, the mutation result,
the budget numbers, the main chunk size, verify exit code, the final full 64-hex digest and
file count, the evidence files, the background-task confirmation, any stop, conflict or
deviation.

## Results

Self-reported model: claude-sonnet-5-5 (timesheet-worker-high, effort high). Evidence: `handoff/delivery/evidence/WP5-UX3-T04/`
(masked LF `.txt` plus eight `-synthetic.png`); live logs in `D:\.claude-tmp\timesheet\WP5-UX3-T04`.

### Base (step 2, before any edit)

- HEAD 7cd8c592ba57d7f4a12013bacced948de0fb8c42; `git status --short` showed only the coordinator's uncommitted `handoff/` files; digest
  e5b3faf96c7856fdf5e8c3c85072270e3b7112f100ba364efe2a5331bb367564 (827 files). Node v24.21.0 (`step1-2.txt`).

### What was implemented

- `src/client/components/periodBarModel.ts`: the one pure pill function `periodPillKind(period, periods)` and `PERIOD_PILL_WORDS`.
  Rule (server values only): the period whose payroll date equals `periods.in_progress.payroll_date` while `periods.current.payroll_date`
  differs is `in-progress` (word "in progress"); otherwise the server relation (`old`, `current`, `future`); no relation is `neutral`.
  Own and shared views pass the periods read through their requester (the owner's in a shared view). Edit-reason rules are untouched
  (the server relation stays `future`).
- `PeriodBar.tsx`: relation pill from that function (class `badge <kind>`, kinds `old`, `current`, `future`, `in-progress`; nothing is
  drawn for `neutral`); the "Current period" button is `aria-label="Current period"` with `data-short="Current"` and a `.jump-full` span;
  new optional `periods` prop. `TimesheetScreen.tsx`: `.page-head` holds the h1 and (own view, >= 768px) the check in/out group; the
  `<p>` under the h1 is gone in both views; the `.workbar` holds only the period card; "Change several days" is `secondary`.
  `ClockPanel.tsx`: the card is now `.clock-group` (no card class, status words right-aligned over the date line, 38px button, 44px
  coarse pointer). `OpenDay.tsx`: the words are `<span class="open-day-text">` inside the label.
- `styles.css`, tokens only: pills (`--pill-*`, `--radius-pill`; `:where(.period-title) .badge` is the neutral grey pill so the tone classes
  `badge-ok/warn/error` still win; `.badge.current/.old/.future/.in-progress` are global, which also gives the Admin "Active/Deactivated"
  badges the pill look); two-row period card from 768px (grid; row 2 the meta line under a hairline, gap `--period-meta-gap` = 4px 28px);
  "Open a day" one row at every width in a size container (`.open-day`, words hidden below 21rem); `.tools-right` gap
  `--toolbar-group-gap` from 768px with a 1px `--line` separator centred in it (pseudo-element of the second button); inactive Today has a
  dashed border (R-UX2A2-1; the ring is unchanged). New tokens `--open-day-max` 26rem, `--open-day-basis` 22rem, `--period-meta-gap`;
  `--clock-button-height` is now 38px; removed the unused `--clock-width` and `--open-day-label-min`. No colour token was added.
- Narrow period buttons (container `period-cta`, phone only; accessible names unchanged): with Current period shown and the long review
  labels, "Sign off" from 15.4rem up to 22.8rem (full from 22.8rem) and "Current" from 15.4rem up to 18.4rem; for the short label
  "Review now" the short forms start at 15.1rem (Review below 20.2rem, "Current" below 18.1rem); below 15.4rem / 15.1rem the review
  link takes its own row with the full label. Worst row: Today 62.3 + Current 73.2 + Sign off 75.1 + 2 x 8 = 226.6px against 231px (4px room, R-UX2A-3).
- No server, API, domain, schema or CSP change (`git diff --stat` shows only `src/client` and `tests`).

### Tests added or changed (file, why it is not a weakening)

- `tests/client/periodBarModel.test.ts`: 6 new tests for `periodPillKind` (old, current, future, neutral, "in progress" on a window day and
  a normal day, own and shared periods, relation-independent). 18 tests in the file.
- `tests/e2e/shell.spec.ts:253` (`.clock-panel` card locator becomes `.clock-group`, plus `.clock-panel` must have count 0) and
  `:352` (`.clock-panel, .bar-clock` count 0 becomes `.clock-panel, .clock-group, .bar-clock`): the same checks on the renamed element, the second one wider.
  New `:369` (title row: group right of the h1 in the same row box at 768/1024/1280/1440, right-aligned, no card shadow or fill, 38px button, period card full
  width, status words right-aligned over the date line, phone head hidden, no name line, no "Signed in as") and `:459` (shared view: no group, no name line).
- `tests/e2e/today.spec.ts:401-435` (the 320px away test): the old expectation "at 320 the review link takes its own row" (`today.spec.ts:389-470` of
  the plan) is replaced by "Today, Current and the short review label share one row at 320" and every row is still 44px; the accessible names stay
  "Current period" and the full review label, "Current period" is full at 360-600 and "Current" at 320. Stricter: one row fewer, the same names and 44px.
  New `:726` (G-5 pill under the real or the simulated clock, both branches from server values, four theme situations for the in-progress ink), `:784`
  (inactive Today dashed, same focus ring), `:819` (shared view pill from the owner's periods).
- `tests/e2e/timesheet.spec.ts:1188` (pills: ink >= 4.5:1 on fill for old, current, future, in progress and neutral in four theme situations,
  five fills differ, displayed pills carry their words and equal their probe), `:1254` and `:1306` (meta row: one row at 1280; at 820 and 768 it wraps exactly
  when its parts need more than the card gives, and with a long display zone name it wraps deterministically), `:1344` ("Open a day" one row, words hidden
  below 21rem, field still named), `:1401` (toolbar gap equals the token, separator, outlined until pressed). The existing `.badge.current` and
  `.badge.old` selectors (`:300`, `:417`) keep working unchanged because the class names are kept.
- `tests/e2e/keyboard-access.spec.ts:237`: the moved group is one tab stop between the top bar and the period card.
- No assertion removed or weakened; no `skip`, `fixme` or `.only` added; dates only from `today_local` and the displayed period.

### Checks (steps 3-10)

- `npm run typecheck` 0; `npm run lint` 0; `npm test`: 93 files, 2065 tests passed; `npm run build`: main chunk `index-*.js` 452.40 kB (gzip 132.84 kB),
  no chunk-size advisory (`step4-build.txt`).
- Full e2e on the real clock (`npm run test:e2e`, own output and screenshot folders, run alone): 541 passed, 53 skipped, 0 failed, 13.3 min
  (`step5-full1.txt`). Desktop 267 passed / 30 skipped, mobile 274 passed / 23 skipped (skips are the by-project skips). The real date during the run was
  2026-10-15 (a window day: current 09/28-10/11, in progress 10/12-10/25). No `ERR_NO_BUFFER_SPACE`.
- Simulated clock (`shiftclock.mjs` copied from the FIX10 evidence into the task folder, not the repository; `today.spec.ts` + `timesheet.spec.ts`, both projects, each run alone):

  | instant (UTC) | branch (server values) | passed | failed |
  |---|---|---|---|
  | 2026-10-20T17:00:00Z | not window: current = in progress = 10/12-10/25 | 78 | 0 |
  | 2026-10-26T16:00:00Z | window: current 10/12-10/25, in progress 10/26-11/08 | 78 | 0 |
  | 2026-10-30T23:00:00Z | window, last window day | 78 | 0 |

  Each run also had 14 by-project skips. The new and changed specs also ran on the real clock (full suite and `target1`, `target3`).
- Mutation (step 7): `periodPillKind` made to ignore `current` (always `in-progress` for the period with today). Unit: 2 of 18 failed
  ("keeps the server relation on a normal day": expected `current`, received `in-progress`; the neutral/fallback test). e2e at 2026-10-20T17:00:00Z: 6 failed
  (the G-5 pill test, the shared-view pill test and the timesheet pills test on both projects, "expected current, received in progress"); 2 unrelated tests passed.
  Reverted (`step7-revert-unit.txt`: 18 passed); verify rebuilt the client afterwards.
- First-screen budgets at 390x844 (tab bar top 788; first day row bottom), unchanged from the T01/T02 numbers: own, no zone note 559.45 (shell bar 60px);
  own, zone note 658.41; with a received share, no zone note 611.45 (bar 112px); with a share and zone note 710.41; away state 559.45 / 658.41.
  All asserted by `timesheet.spec.ts`, `today.spec.ts`, `sharing.spec.ts` and `theme.spec.ts` in the full run.
- Privacy and whitespace (step 8): no email address or profile path in the changed files or the evidence except `*@example.invalid`; no trailing whitespace, no CR and
  exactly one final newline in every changed file (`step8-whitespace.txt`).
- `npm run verify` with `SMOKE_PORT=48661`, `DATA_DIR` and `DATABASE_PATH` in the task folder: exit 0 (unit 2065 tests, SMOKE PASSED; `step9-verify.txt`).
- `npm run digest` last: 025b46cf3a8b33fa183321c39e9b9c758e2de4171da531637b377004c91b85c4 (827 files, handoff/ excluded; `step10-digest.txt`).

### Deviations, conflicts and notes (honest)

1. Meta row at 820: with the system font here the three parts need 650.7px, so on the default Asia/Saigon display zone they fit one row down to 768px (card inner 704px). The
   "wrapped at 820" case is therefore tested with a long display zone name (`America/North_Dakota/New_Salem`, 790px needed): one row at 1280, two rows at 820 and 768,
   inside the card. The default-zone test asserts "wrap exactly when the parts do not fit".
2. "Open a day" words: B6 assumed a 304px row at 360 (card padding). Since T01 the sheet area has no card padding, so the row is 328px at 360 (358 at 390) and the words
   stay; they hide at 320 (288px) and anywhere the row is under 21rem. The test derives the threshold and also asserts 390 and 360 shown, 320 hidden.
3. The group gap `--toolbar-group-gap` and the separator apply from 768px; the phone keeps its 8px gap and no separator (the two controls often wrap there and a separator
   would appear at the start of the wrapped row; the budget stays unchanged).
4. The e2e harness picks its own free loopback port per worker (existing fixture, not a fixed range); only `SMOKE_PORT` was set (48661).
5. Process slips: one read-only command used a pipe into `tail` (`od -c | tail`, output to a file, no effect on files). No stdin script, heredoc, `/dev/null`, `rm -r` or process kill.
6. Docs impact for T10 (not edited here): docs/04 period bar wording (title row, pills, "in progress", "Current"), U-17/U-18 thresholds, the removed clock card.

No background task of mine is still running (the full run finished and its completion was reported; every other run was in the foreground).

Status: done
