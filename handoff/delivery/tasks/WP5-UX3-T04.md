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
- Base: HEAD = origin/main = the WP5-UX3-T03-FREEZE commit (board `commit_sha`), or a later
  commit that changes only `handoff/`; source digest
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
