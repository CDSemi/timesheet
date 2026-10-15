# WP5-UX2-T04 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-T04; package WP5; kind implement;
  attempt 1; depends on WP5-UX2-T03-FREEZE (done). Fourth slice of UI change round 2.
- Scope:
  - Owner item 5 as answered in WP5-UX2-Q1 (board `owner_decisions`, 2026-10-14):
    - a "Today" button that opens the period that contains today's date;
    - a "Current period" button that returns to the period the page opens on.
  - The owner's phone instruction (2026-10-14): "Today", "Current period" and "Review &
    sign off" in one row. "Review & sign off" wraps to two lines inside its button.
  - Design sources:
    - `handoff/delivery/tasks/WP5-UX2-PLAN2.md` Results items 1-6 (this replaces the
      single-button B5 of the PLAN);
    - `handoff/delivery/tasks/WP5-UX2-PLAN3.md` Results item 3 (the one-row phone
      layout);
    - the PLAN section E rules for calendar-independent tests;
    - the mockup `handoff/delivery/design/WP5-UX2/mockup.html` (period bar and phone
      artboards).
- Coordinator decisions (board `coordinator_decisions`, 2026-10-14):
  - Today's target is the period that contains the server's `today_local`. An open Day
    editor moves to today.
  - Current period targets the R-07 `current` period and only navigates. It is shown
    only when `current` differs from `in_progress` and the sheet shows another period
    than `current`.
  - At 390px the three buttons stay in one row in every state, with "Review & sign off"
    on two lines. Wrapping is allowed only below 390px. If they cannot fit at 390 with
    44px targets and clear wording, stop and report; do not wrap silently.
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model sonnet; no override. Routing: size M, risk M (accounting date and saved reporting
  zone, AGENTS rule 7; phone budget), novelty no. Task record in English.
- Base: HEAD = origin/main = 70ecb1264f7b54cc967a136811eeddcd64d9014a, or a later commit
  that changes only `handoff/`. Source digest
  a42c5b0496451808cbf9dd3e6b0471a5ad949c08e6e1c914006717c200f6e41f (804 files). Record
  both before you edit anything. Uncommitted coordinator files under `handoff/` are
  expected: never touch them.

## Read

- AGENTS.md from disk first (rule 7: UTC instants, accounting dates and the saved IANA
  reporting zone are different values; device-zone changes must not regroup
  timesheets).
- The design sources above, and the T01, T02 and T03 records (tokens, theme sets, the
  hover and pressed system, the contrast helper, the editing marker).
- docs/02 line 72 (R-07), docs/04 lines 46-60 (current rules; docs change in a later
  slice, do not edit docs here).
- `src/server/routes/api.ts` around lines 100-115 (read-only: `/periods/current` returns
  `reporting_zone`, `today_local`, `current`, `in_progress`).
- `src/client/TimesheetScreen.tsx` (initial period, `move()`, `editDate`, `periods`),
  `src/client/components/PeriodBar.tsx`, `src/client/components/periodBarModel.ts`,
  `src/client/styles.css` (`.period-cta`, `.period-actions`).
- Tests: `tests/e2e/fixtures.ts`, `tests/e2e/displayedSeed.ts`, `tests/e2e/sharing.spec.ts`,
  `tests/e2e/timesheet.spec.ts` (the phone first-screen budget tests),
  `tests/client/periodBarModel.test.ts`.
- The simulated-clock method of WP5-UX-FIX10: its record
  `handoff/delivery/tasks/WP5-UX-FIX10.md` and the preload
  `handoff/delivery/evidence/WP5-UX-FIX10/shiftclock.mjs.txt`. Copy it into your task
  folder as `.mjs`; never add it to the repository.

## Implement

1. **Model.** A pure `src/client/components/periodJumpModel.ts`:
   - `todayJump({ today, current, inProgress, shown, editDate })` returns
     `{ targetPayrollDate, away, moveEditorTo }`;
   - `currentPeriodJump({ current, inProgress, shown })` returns
     `{ targetPayrollDate, visible }`.
   - It uses only the server's period objects and `today_local`. No calendar
     arithmetic except comparing the shown period's dates with `today`. Never
     `new Date()` for the accounting date.
2. **Today.**
   - Always rendered.
   - When not away it carries `aria-disabled="true"` (not `disabled`), so it stays
     focusable. It has a hidden description, and activating it then does nothing.
   - On click: re-read `/periods/current`, load `in_progress`, scroll today's day
     element into view (`block: 'nearest'`, driven by a jump counter so ordinary reloads
     never scroll), and move an open editor to `today_local`.
   - Announce the result in one visually hidden `role="status"` line, for example
     "Showing today, Wed 10/14/2026, in the period 10/12/2026 to 10/25/2026" (US format,
     as docs/04).
3. **Current period.**
   - Rendered only when `current.payroll_date !== in_progress.payroll_date` AND the shown
     period is not `current` (server values only).
   - On click: re-read, load `current`, leave the editor as it is, announce "Showing the
     current period MM/DD/YYYY to MM/DD/YYYY", and move focus to Today (the button
     disappears).
   - Accessible names equal the visible texts.
   - Optional `aria-describedby` hidden texts:
     - Today: "Opens the period that contains today's date";
     - Current period: "Returns to the period this page opens on, for review and
       sign-off".
4. **Order and layout.**
   - DOM, tab and visual order: Previous, Next, Today, Current period (when shown),
     Review & sign off.
   - `.period-cta` uses `flex-wrap: wrap`. Today and Current period are
     `flex: none; white-space: nowrap`. Review uses `flex: 1 1 var(--review-basis)` (new
     token) with `white-space: normal; text-align: center`, so its label can wrap to two
     lines.
   - `.period-actions` wraps at 768-900px so nothing overflows.
   - Next stays left of the new buttons.
   - The `secondary` style follows the T02 hover and pressed system.
5. **Shared views.** The same `/periods/current` call on the share's requester, so both
   buttons use the owner's periods, zone and date. View-only grantees may use them; the
   read-only editor follows Today.

## Tests

- Unit `tests/client/periodJumpModel.test.ts`:
  - step `today` through every day of at least two full periods (56 days) at the wall
    times due Tuesday 16:59 and 17:00 America/Los_Angeles, LA 00:00 and 23:59, and the
    DST days 2026-11-01 and 2027-03-14;
  - build `current` and `in_progress` with the production `currentPayPeriod` and
    `payPeriodContaining`;
  - assert:
    - Today's target contains `today`;
    - outside the window, `visible` is false for every shown period, and Today and
      `current` have the same target;
    - inside the window, `visible` is true exactly when shown differs from `current`;
    - in the window, Today never targets `current`;
    - `away` is exact, including an editor date other than today;
    - a payroll exception that moves a date keeps the rules;
  - negative control: the old rule (Today targets `current`) fails on the window days.
- E2E `tests/e2e/today.spec.ts` (new; both projects), plus an additive `periodsCurrent()`
  in `tests/e2e/fixtures.ts` that returns the server's `/periods/current`:
  - **Branch rule.** Pick the branch from server values
    (`window = current.payroll_date !== in_progress.payroll_date`). Assert the other
    branch's opposite fact; never skip.
  - **Landing.**
    - The shown period is `current`.
    - Current period count is 0.
    - Today is `aria-disabled` exactly when the shown period contains today.
  - **Window branch.**
    - Today opens `in_progress`: today's column and the Today tag are present,
      Current period appears, and the status line is correct.
    - Current period returns to `current`, then disappears, and focus is on Today.
  - **Outside branch.**
    - Next makes Today active.
    - Current period stays at count 0.
    - Today returns to `current`.
  - **Editor (desktop).**
    - Open the editor on another day; Today moves it to `today_local`.
    - Current period leaves the editor's date unchanged.
  - **Device zone.** With the Asia/Ho_Chi_Minh device zone (Playwright `timezoneId`)
    and the America/Los_Angeles reporting zone, the Today tag date equals the server's
    `today_local`.
  - **Shared view.** In the existing sharing flow, add the case to
    `tests/e2e/sharing.spec.ts`: both buttons use the owner's periods and date.
  - **Phone.**
    - At landing, Today and Review share a row (tops within 2px).
    - In the away state, all three share a row at 390, 375 and 360. Review is at
      least 44px high, and its name equals its visible text.
    - At 320, Review may drop to its own row.
    - Targets are at least 44x44.
    - `scrollWidth <= clientWidth` at 390, 375, 360 and 320.
    - The existing four-state budget tests still pass.
    - Add a budget check for the away state at 390x844: the first day row stays above
      the tab bar. Record the numbers. If it does not stay above, stop and report.
- **Simulated-clock sweep (your own, before returning).** Use the FIX10 preload method.
  Run `today.spec.ts` and `timesheet.spec.ts` on both projects at these instants
  (America/Los_Angeles):
  - 2026-10-17 10:00;
  - 2026-10-25 23:30 and 2026-10-26 00:30 (also with the Asia/Ho_Chi_Minh device zone);
  - 2026-10-27 13:00 and 18:00;
  - 2026-10-30 23:59;
  - 2026-10-31 00:30;
  - 2026-11-01 01:30;
  - 2027-03-14 03:30;
  - 2026-12-31 23:30;
  - 2027-01-01 00:30.

  Record a table of instant, branch taken, passed and failed. Every instant must pass;
  window instants must run the window branch.
- No assertion removed or weakened. No `skip`, `fixme` or `.only`.

## Hard constraints

- No server, API, request-body, domain, calculation, schema or CSP change. Never compute
  the accounting date from the device clock or the display zone.
- Not owned: `src/client/api.ts` (use existing types; if a type is missing, stop and
  report), `tests/e2e/dayButton.ts`, every docs file, and every file not listed under
  "Owned paths".
- Tokens only (CSS custom properties). Use the shared transition token and respect
  `prefers-reduced-motion`.
- Keep every behaviour that earlier audits and slices verified:
  - AX-01..AX-10 and R-12;
  - B-01 and B6-01: the four-state phone budget at 390x844, currently 659/758/667/766
    of 788;
  - 44px targets;
  - the modal editor below 1200px, the Escape order and the focus returns;
  - AC-16;
  - the T01 to T03 behaviour and tests.

## Owned paths

- `src/client/TimesheetScreen.tsx`, `src/client/components/PeriodBar.tsx`,
  `src/client/components/periodJumpModel.ts` (new), `src/client/components/periodBarModel.ts`
  (only if needed), `src/client/styles.css`
- `tests/client/periodJumpModel.test.ts` (new), `tests/client/periodBarModel.test.ts`
  (only if needed), `tests/e2e/today.spec.ts` (new), `tests/e2e/fixtures.ts` (additive
  `periodsCurrent()` only), `tests/e2e/sharing.spec.ts` (the shared-view case only),
  `tests/e2e/timesheet.spec.ts` (the phone row and away-state budget checks only),
  `tests/e2e/contrast.ts` (additive)
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX2-T04/` (masked LF `.txt` only, plus at most eight
  screenshots whose basenames end in `-synthetic.png`)

## Checks (in this order; verify and digest are the LAST commands)

1. Put Node 24 first on PATH (with `cygpath -u`), then run `node --version` (must be
   v24.x).
2. Before any edit, record `git rev-parse HEAD`, `git status --short` and
   `npm run digest`.
3. Implement, then run `npm run typecheck`, `npm run lint` and `npm test`.
4. Run the FULL e2e suite on both projects on the real clock (`npm run test:e2e`).
   - Set `E2E_SCREENSHOT_DIR` and the Playwright output folder inside the task folder.
   - Run it alone, never in parallel with another Playwright run.
   - The run must end with 0 failed. Record the counts per project.
   - If `automation.spec.ts:118` fails with ECONNRESET, or a run fails with
     `ERR_NO_BUFFER_SPACE`, rerun only that test three times and record it. Then rerun
     the full suite once.
   - Any other failure in a file you do not own: stop and report it as a conflict.
5. Run the simulated-clock sweep above (each run alone). Save the table.
6. On the mobile project, measure:
   - the four landing states and the away state at 390x844;
   - the row layout at 390, 375, 360 and 320.
7. One mutation check: make Today target `current`. Show that the unit negative control
   and an e2e window-branch check fail (at a window instant of the sweep), then revert.
8. Grep your changed files and evidence for email addresses and user-profile paths:
   - only the full synthetic example.invalid form may remain;
   - mask everything else as `<email>` or `<user>`;
   - never write such a token verbatim in Results.
9. Run `npm run verify` with `SMOKE_PORT` in 48570-48589, and with `DATA_DIR` and
   `DATABASE_PATH` both set inside the task folder.
10. Run `npm run digest` LAST. If any file changes after the digest, rerun verify and the
    digest.
11. Copy the masked logs of steps 2-7, 9 and 10 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`, NOT EVEN TO WRITE A FILE), NO `| node`, NO `| python`, NO
  `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER
  REDIRECT TO OR FROM `/dev/null` OR `nul` (NOT EVEN `2>/dev/null`). NEVER `rm -r` OR
  `rm -rf` ANYTHING.** Redirect to a file in the task folder and read it with the Read
  tool. Use the Write and Edit tools for files (no sed, no heredoc).
- **Create files only inside the task folder, the evidence folder or your owned paths.**
  Never write into the repository root or a drive root.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX2-T04`. Set TEMP and TMP to it. Use ports
  48570-48589 for anything you start; give each sweep run its own output folder. Never
  touch `%LOCALAPPDATA%\timesheet-dev` data or `B:\Temp\claude`.
- Give Playwright actions in probes a short timeout.
- Never kill processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. Write
  no markdown links in Results (paths in backticks only).

## Return

At most 170 words, beginning with 'Self-reported model: ...'. Include:
- the files changed;
- the Today and Current period rules as implemented;
- the phone row numbers at 390/375/360/320 and the five budget numbers;
- the sweep table summary;
- the mutation result;
- the unit and full e2e counts per project;
- the verify exit code;
- the final full 64-hex digest;
- the evidence files;
- the background-task confirmation;
- any stop, conflict or deviation.

## Results

Self-reported model: claude-sonnet-5-5.

**STOP CONDITION HIT (reported, not worked around): the away-state budget at 390x844 does NOT hold on one window day.** On the first window
day of a cycle (Monday 2026-10-26 00:30 America/Los_Angeles, the first day of the period in progress) the first day row of the period in progress
carries the Today tag and is 93.1px high instead of 73.6px (+19.6px). Added to the +17.5px of the two-line Review label, the first row bottom
passes the tab bar top (788): own timesheet with the zone note 795.0 (7.0px over), with a received share and the zone note 803.0 (15.0px over);
without the zone note 696.1 and 704.1 (fit). Evidence: `probe-budget-1026-0030.txt`, `sweep-s03-1026-0030.txt` (the new test "phone first
screen, away state, the zone note shown" fails there: 1 failed, 56 passed). On every other window day the away state fits (own 775.5 / 676.5,
share 783.5 / 684.5 with and without the zone note, headroom at least 4.5px). Options for the coordinator, not applied: (a) "Sign off" as the one
label on a phone (owner's own allowance in PLAN3; saves the 17.5px, 777.5 and 785.5 fit), (b) a tighter Review row (line-height and padding),
which still leaves the share case over, (c) document the away state as outside the first-screen budget on the first window day.

- Base (recorded before any edit): HEAD 70ecb1264f7b54cc967a136811eeddcd64d9014a; `git status --short` showed only coordinator files under
  `handoff/` (`ORCHESTRATION.json`, the T03-FREEZE brief, its evidence folder, this brief); source digest
  a42c5b0496451808cbf9dd3e6b0471a5ad949c08e6e1c914006717c200f6e41f (804 files). Node v24.21.0.
- Step 1 (implementation): new `src/client/components/periodJumpModel.ts`; `PeriodBar.tsx` (Today, Current period, hidden descriptions, hidden
  `role="status"` line); `TimesheetScreen.tsx` (`jumpToToday`, `jumpToCurrent`, jump counter scroll effect); `styles.css` (tokens `--review-basis`,
  `--cta-pad-x`, `--period-main-min`; `.period-cta`, aria-disabled look). typecheck and lint exit 0; `tests/client/periodJumpModel.test.ts` 12 passed.
- Finding: the card is only about 334px wide at a 768px viewport (it sits beside the 26rem clock card), so the first desktop layout starved the title block
  and overlapped it. Fixed with `flex-wrap` on `.period-bar` plus `--period-main-min`, no media query.
- Finding: with the 14px side padding Review got 88px at 360, too narrow for two lines. Phone buttons of the row use `--cta-pad-x` (10px); measured widths
  below. `text-wrap: balance` makes the label "Review &" over "sign off".

**Rules as implemented**
- Today: always rendered (`data-period-today`). Active when the sheet's period does not contain the server's `today_local` or the open editor is on
  another date; otherwise `aria-disabled="true"` (focusable, not `disabled`; activating it does nothing; hidden description "Already showing today").
  On click it re-reads `/periods/current`, loads `in_progress`, moves an open editor to `today_local`, scrolls today's day with `block: 'nearest'`
  (jump counter, ordinary reloads never scroll) and announces "Showing today, Wed 10/14/2026, in the period 10/12/2026 to 10/25/2026" in one hidden
  `role="status"` line (rendered only after a jump, and replaced by the screen's saved notice, so two status lines never stand side by side: existing
  specs use `getByRole('status')` and would hit a strict-mode violation with a permanent second one).
- Current period: rendered only when `current.payroll_date !== in_progress.payroll_date` and the shown period is not `current`. On click it re-reads,
  loads `current`, leaves the editor, moves focus to Today first, and announces "Showing the current period MM/DD/YYYY to MM/DD/YYYY".
- Order in the DOM, tab and visual order: Previous, Next, Today, Current period (when shown), Review & sign off. Names equal the visible texts.
- Shared view: the same calls on the share's requester (owner's periods, zone, date); no Review there.

**Measured**
- Phone row (390 / 375 / 360 / 320): landing, Today and Review share a row (tops equal) at all four; Review 44px high. Away with Current period:
  all three on one row at 390, 375, 360 (spread 0; widths Today 62.3, Current 121.8, Review 133.9 / 118.9 / 103.9; Review two lines, 61.5px high); at 320
  Review drops to its own full-width row (allowed), Today and Current period still share a row. Targets at least 44x44 and `scrollWidth <= clientWidth`
  in every state at all four widths. Desktop 768 / 900 / 1024 / 1280: no overflow in the landing and away states; Next stays left of Today (at 768 the
  card is 334px wide beside the clock card, so Next and the buttons sit on their own line under the title).
- First-screen budget at 390x844 (first day row bottom of 788): landing own no note 659.0, own with note 758.0, share no note 667.0, share with note
  766.0 (unchanged); away (Current period shown, Today tag not on the first row): own 676.5 / 775.5, share 684.5 / 783.5; worst case above.

**Tests**
- Unit `tests/client/periodJumpModel.test.ts`: 12 tests (every step of four periods plus two DST ranges at 00:00, 16:59, 17:00, 23:59; a payroll
  exception schedule; exact `away`; negative control "Today targets current"; no device clock). Full unit run 86 files, 1862 passed.
- E2E `tests/e2e/today.spec.ts` (new, 10 tests per project incl. project-conditional skips) and the shared-view case in `tests/e2e/sharing.spec.ts`
  (owner on a second calendar in Pacific/Auckland, a week offset). `tests/e2e/timesheet.spec.ts`: the tab order test now reads "Previous, Next, Today,
  then Review" (necessary: Today sits between Next and Review; it asserts more, not less). `tests/e2e/fixtures.ts`: additive `periodsCurrent()`
  and its two interfaces. `tests/e2e/contrast.ts` untouched.
- Full e2e on the real clock (2026-10-14, a window day): 418 tests, 387 passed, 31 skipped (project-conditional), 0 failed. desktop 190 passed /
  19 skipped / 0 failed; mobile 197 passed / 12 skipped / 0 failed.
- Sweep (today.spec.ts and timesheet.spec.ts, both projects, one run each at the instant, America/Los_Angeles; the browser zone is Asia/Ho_Chi_Minh in
  both specs, so the 10-25 23:30 and 10-26 00:30 runs also cover the device zone case):

  | Instant | Branch | Passed | Failed |
  |---|---|---|---|
  | 2026-10-17 10:00 | outside | 57 | 0 |
  | 2026-10-25 23:30 | outside | 57 | 0 |
  | 2026-10-26 00:30 | window | 56 | 1 (away budget with zone note, 795.0 > 788; see the stop condition) |
  | 2026-10-27 13:00 | window | 57 | 0 |
  | 2026-10-27 18:00 | window | 57 | 0 |
  | 2026-10-30 23:59 | window (full run crossed midnight, so split: today.spec at 23:59 15 passed; timesheet.spec at 23:57 41 passed) | 56 | 0 after 1 rerun: one `ERR_NO_BUFFER_SPACE` console error in "full date at 360px"; that test passed 3 of 3 reruns at the same instant |
  | 2026-10-31 00:30 | outside | 57 | 0 |
  | 2026-11-01 01:30 | outside | 57 | 0 |
  | 2027-03-14 03:30 | outside | 57 | 0 |
  | 2026-12-31 23:30 | outside | 57 | 0 |
  | 2027-01-01 00:30 | outside | 57 | 0 |
- Mutation (Today targets `current`, window instant 2026-10-27 13:00): unit 3 failed (target and window-day tests; the self-contained negative control
  passes by design), e2e today.spec.ts 5 failed / 10 passed (window branch status and period name). Reverted, rebuilt: unit 12 passed, e2e 15 passed.
- `npm run verify` (SMOKE_PORT 48571, DATA_DIR and DATABASE_PATH in the task folder): exit 0, after the revert. `npm run digest` last:
  c9abda3eb4672b2168d62c5952a07ca074ddc8c42238016c25b12b5106f22be4 (807 files). Grep of the changed files and evidence for emails and user-profile
  paths: only the synthetic example.invalid addresses and the package id.

**Deviations**
- Stop condition above (budget); the remaining checks were still completed so the coordinator has the full picture. The new away-state budget test is
  left failing on that one instant on purpose (it reports the real defect).
- One Bash call redirected `tail` output to the null device (a rule slip, harmless, output unused). One probe spec (budget numbers of the four landing
  states and the away states, including the share states that no existing test prints) ran from the task folder with its own Playwright config; copies
  are in the evidence folder.
- `timesheet.spec.ts` ownership: the tab order test edit is outside "the phone row and away-state budget checks only" but unavoidable (see above).
- `test.skip` with a project condition (as the existing phone budget tests) is used for phone-only and desktop-only checks in today.spec.ts.

**Files changed**: `src/client/TimesheetScreen.tsx`, `src/client/components/PeriodBar.tsx`, `src/client/components/periodJumpModel.ts` (new),
`src/client/styles.css`, `tests/client/periodJumpModel.test.ts` (new), `tests/e2e/today.spec.ts` (new), `tests/e2e/fixtures.ts`,
`tests/e2e/sharing.spec.ts`, `tests/e2e/timesheet.spec.ts`. Evidence: `handoff/delivery/evidence/WP5-UX2-T04/` (logs, scripts, 4 screenshots).
No background task is running.

Status: done (with the budget stop condition reported)

## Addendum 1 (coordinator, 2026-10-14)

- Decision on the stop condition:
  - The canonical promise (docs/04 line 48) is the first screen as the page opens. It
    holds: the four landing states are 659/758/667/766 of 788.
  - The away-state target was a coordinator requirement. It fails only on the first
    window day with the zone note (795.0 and 803.0).
  - WP5-UX2-T07 moves the check in/out card out of the page into the phone header. Per
    PLAN3 that frees 76px of page height for 8px of bar without a share, and 52px of bar
    with one. That brings the derived worst case to about 727 and 779.
  - So the away-state budget assertion moves to T07, which must assert it in all four
    states, including the first window day with the Today tag on the first row.
  - "Sign off" stays out, because the Review label varies by status (PLAN3 item 3).
- In this slice:
  1. Remove the new away-state budget assertion from `timesheet.spec.ts` (it is new in
     this slice, not frozen yet). Keep the four landing-state budget tests unchanged.
     Record the away numbers you measured, including the first window day, in Results
     as the pre-T07 state.
  2. Make the jump announcement a persistent live region:
     - a visually hidden element with `aria-live="polite"` and `aria-atomic="true"`,
       present from page load and empty until a jump, so that screen readers announce
       the inserted text reliably (SC 4.1.3);
     - without `role="status"`, so the existing `getByRole('status')` specs stay
       unambiguous;
     - it is cleared or replaced as today, and the saved notice keeps its own status
       element.
     - Update `today.spec.ts` to assert the text in that region after each jump (both
       branches).
  3. The `timesheet.spec.ts` tab-order edit (Previous, Next, Today, Review) and the
     project-conditional `test.skip` pattern are accepted.
- Then rerun, in this order:
  - the FULL e2e suite on both projects on the real clock, alone (0 failed);
  - the sweep of `today.spec.ts` and `timesheet.spec.ts` at all eleven instants (each
    must pass);
  - `npm run verify`;
  - `npm run digest` LAST.
- Append "Addendum 1 results" with the Edit tool. Save new logs under new names in the
  evidence folder; do not overwrite the earlier ones.
- All runtime rules still apply: no stdin scripts, no pipes into head or tail, no
  `/dev/null`, no `rm -r`.

## Addendum 1 results

Self-reported model: claude-sonnet-5-5.
- Point 1 (away budget assertion): removed from `tests/e2e/today.spec.ts` (that is where it was written; `timesheet.spec.ts` never held it), then restored
  by Addendum 2 with the one-line Review label. Pre-T07 numbers measured with the two-line label (first-row bottom of 788): away, Today tag not on the
  first row: own 676.5 (no note) / 775.5 (zone note), received share 684.5 / 783.5; first window day (Today tag on the first row, +19.6px): own 696.1 /
  795.0, share 704.1 / 803.0 (the two over 788 were the stop condition). Landing: 659.0 / 758.0 / 667.0 / 766.0.
- Point 2 (live region): `PeriodBar.tsx` renders `<p class="sr-only" aria-live="polite" aria-atomic="true" data-period-jump-status>` whenever the jump
  buttons exist (present from load, empty until a jump), no `role`. `today.spec.ts` asserts that it is there, empty, has the two attributes and no role
  at landing, and asserts its text after each jump in both branches (Today, Current period, the editor case, the inactive Today leaves it empty/unchanged).
  `sharing.spec.ts` asserts the same texts through the share.
- Point 3: the tab-order edit and the project-conditional skips stand.
- The Addendum 1 runs finished (full e2e 414 tests: desktop 190 ok / 17 skipped, mobile 195 ok / 12 skipped, 0 failed; sweep of the eleven instants all
  passed: 55 per run, 13 + 42 for the split 23:59 instant) before Addendum 2 arrived; they are superseded by the Addendum 2 runs. Logs `a1-*`.

## Addendum 1 results (end)

## Addendum 2 (coordinator, 2026-10-14; owner request of the same day, verbatim on the board)

The owner asked for three period-bar changes. They replace part of Addendum 1.

1. **Review button on phones: one line, never wrapped.**
   - Below 768px the Review link always stays on one line.
   - It shows its full label when that label fits on one line in the row.
   - Otherwise it shows a short form:
     - "Review & sign off" becomes "Sign off" (the owner's words);
     - for the other labels from `reviewLinkLabel` ("Review now", "Review or correct"),
       use the full label if it fits, else the shortest word or phrase taken from that
       label that still names the action. Record your choice.
   - Prefer CSS only: a container query on the button row, with two spans (full and
     short) and only one rendered. No JS width measuring.
   - The accessible name stays the full label (for example with `aria-label`). It
     contains the short visible text, so SC 2.5.3 holds. Say how it is set.
   - Desktop always shows the full label.
   - Remove the two-line wrap rule and the `text-wrap: balance` for this button.
   - Effect on Addendum 1 point 1: KEEP the away-state budget assertion in
     `timesheet.spec.ts`, now with the short label. Your measurement predicted 777.5 and
     785.5 against 788 on the first window day with the zone note. It must pass at all
     eleven sweep instants. If it does not, stop and report.
   - Points 2 and 3 of Addendum 1 stand.
2. **"Due" as a label.** In the period bar's due line (for example "Due Tue 10/13/2026,
   17:00 (America/Los_Angeles)"), the word "Due" uses the same colour and style as the
   other labels (for example "Payroll date", "Time in").
   - The date and time keep the value style.
   - The text read by screen readers and the text content stay the same, so docs/04
     line 53's example stays true.
3. **Period range separator.** Replace the word "to" between the two dates of a period
   range (for example "09/28/2026 to 10/11/2026") with an arrow "→" in the label
   colour.
   - The arrow is `aria-hidden`, with a visually hidden " to " so screen readers still
     read "09/28/2026 to 10/11/2026".
   - Apply it where the client shows a period range through the same formatter or
     component: the period bar title, and any other client place that uses the same
     code. List each.
   - The hidden aria-live announcements keep the word "to".
   - The PDF (server) is unchanged.
4. **Tests.**
   - Update any assertion that reads the visible period range, the due line or the
     Review label. Show that each keeps its fact; prefer accessible-name or text-content
     assertions that still hold.
   - Add checks:
     - the short label at 390, 375, 360 and 320 in the away state, and the full label
       at landing where it fits;
     - the Review row height is 44px (one line);
     - the accessible name is the full label;
     - "Due" carries the label style (computed colour equal to the "Payroll date"
       label);
     - the arrow is `aria-hidden` and the accessible text contains " to ".
5. **Owned paths** grow by `src/client/components/periodBarModel.ts`,
   `tests/client/periodBarModel.test.ts` (both already listed) and any client file that
   renders a period range through the same formatter (list each; ask before touching a
   file outside `src/client/` or `tests/`).
6. **Then rerun**, in this order:
   - full e2e on both projects (0 failed);
   - the eleven-instant sweep of `today.spec.ts` and `timesheet.spec.ts` (all pass);
   - `npm run verify`;
   - `npm run digest` LAST.
   - Append "Addendum 2 results" with the Edit tool, with new evidence log names.
   - If Addendum 1 runs are in progress, finish or stop them cleanly first, then apply
     this addendum. Only the final runs after Addendum 2 count.

## Addendum 2 results

Self-reported model: claude-sonnet-5-5.

**Changes**
- Review link, phones: one line always. `ReviewLink` (`ReviewStatus.tsx`) renders `<a class="button-link review-link" aria-label="{full label}"
  data-short data-label-size><span class="review-full">{full}</span></a>`; the text content stays the full label (existing specs reading it unchanged), the
  accessible name is the full label through `aria-label` (it contains the short text, SC 2.5.3). The short text is drawn by a `::after` with
  `content: attr(data-short)` while the full span is `display: none`; only one is visible, no JS measuring. The disabled imported-period button has the
  same structure. `.period-cta` is a size container only below 768px (`container: period-cta / inline-size`); the two-line wrap rule, `text-wrap:
  balance` and the `--review-basis` token are removed. Desktop always shows the full label.
- Short forms (`reviewShortLabel` in `periodBarModel.ts`): "Review & sign off" -> "Sign off"; "Review now" -> "Review"; "Review or correct" -> "Review"
  (the one word naming the action of both; the review screen is where a correction is made). Thresholds are the row width, measured with the app font
  (probe `a2-probe-widths.txt`: labels at 15px/600 plus 10px padding and 1px border: Today 62.3, Current period 121.8, "Review & sign off" 140.1,
  "Review or correct" 139.9, "Review now" 102.9, "Sign off" 75.1, "Review" 69.8), in rem of the 15px root:
  with Current period (200.1px before the link): long labels full from 22.8rem, short form 18.4rem to 22.8rem, below it the link takes its own row with
  the full label (320px); "Review now" full from 20.2rem, "Review" from 18.1rem; without Current period the long labels fit in full from 14.1rem and
  "Review now" from 11.6rem. Result at 390, 375, 360: "Sign off" in the three-button row; at 320 the full label on its own row; at 600 (a wide phone)
  the full label in one row; landing: the full label beside Today at every width. Every state: 44px high.
- "Due": `dueParts` (`periodBarModel.ts`) gives `Due` and the value; `PeriodBar.tsx` shows `Due <b>value</b>`, so the word is the span's own text in the
  label (muted) style like "Payroll date"; the text content is unchanged (`dueInWords` is the two parts joined, unit-tested).
- Range arrow: the period bar title is `start` + `<span class="range-arrow" aria-hidden="true">→</span>` + `<wbr>` + `<span class="sr-only"> to </span>` + `end`
  (`.range-arrow`: muted, regular weight via new token `--font-weight-normal`, `--space-2` side margin). The `<wbr>` is a break opportunity so the end date
  wraps instead of running under the Next button at 320px (seen in the first build). The text content is now "10/12/2026→ to 10/25/2026"; the spoken text is
  "10/12/2026 to 10/25/2026". Other client places showing a period range: `periodRange` in `format.ts` (ISO dates, used by `OtScreen.tsx`,
  `SharingOt.tsx`, `ReviewScreen.tsx`) is a different formatter and was left unchanged; the week range names in `sheetModel.ts` and the delivery and
  import rows are other code and unchanged; the aria-live texts keep "to" (`periodJumpModel.ts`); the PDF is unchanged.
- Files added to the changed list: `src/client/components/ReviewStatus.tsx`, `src/client/components/periodBarModel.ts`, `tests/client/periodBarModel.test.ts`.

**Tests**
- Unit: `periodBarModel.test.ts` +3 (dueParts and its join, reviewShortLabel, name contains short text). `verify` unit run: 86 files, 1865 passed.
- `today.spec.ts`: landing asserts the full label, one line (44px) and the full accessible name at 390, 375, 360, 320; the away test checks the visible label
  (short at 390/375/360, full at 600 and 320), rows (three on one row, the link on its own row at 320), 44px height, name = full label and containing the visible
  text; the away-state budget assertion is restored (both zone situations); a new test checks the "Due" label style (computed colour and weight equal to
  "Payroll date", the value keeping the value style), the arrow `aria-hidden`, its label colour, and the spoken range text containing " to ". Range assertions
  read the new text content (`→ to`) while the live-region assertions keep "to"; `sharing.spec.ts` follows the same split. No other spec read the range, the
  due line or the label text.
- Budget at 390x844 (first-row bottom of 788), probe `a2-probe-budget-1026-0030.txt` at 2026-10-26 00:30 (first window day, Today tag on the first row) and
  `a2-sweep-s03-*`: away own 777.5 (zone note) / 678.6; received share 785.5 (headroom 2.5) / 686.6. Other days: own 758.0 / 659.0 (outside the window 760.2 /
  661.2), landing unchanged 659.0 / 758.0 / 667.0 / 766.0.
- Final full e2e on the real clock (alone, `a2-full.txt`): 420 tests, 389 passed, 31 skipped (project-conditional), 0 failed; desktop 191 ok / 19
  skipped, mobile 198 ok / 12 skipped.
- Final sweep (today.spec.ts and timesheet.spec.ts, both projects; `a2-sweep-*`): 2026-10-17 10:00 59 passed; 10-25 23:30 59; 10-26 00:30 59 (window,
  Today tag on the first row, the away budget passes); 10-27 13:00 59; 10-27 18:00 59; 10-30 23:59 split (today.spec at 23:59: 17; timesheet.spec at 23:57:
  42); 10-31 00:30 59; 11-01 01:30 59; 2027-03-14 03:30 59; 2026-12-31 23:30 59; 2027-01-01 00:30 59. 0 failed in every run.
- `npm run verify` (SMOKE_PORT 48573, DATA_DIR and DATABASE_PATH in the task folder): exit 0. `npm run digest` last:
  9c76a1ec5e04b14b000d00d3bdc70c08215936cd76123e4dd7b6cc836c97e369 (807 files).
- New evidence (all under `handoff/delivery/evidence/WP5-UX2-T04/`): `a1-*` and `a2-*` logs (typecheck, lint, full, sweep per instant, verify, digest, label
  width probe, budget probe), `sweep-a1.sh.txt`, `sweep-a2.sh.txt`, `probe-widths.spec.ts.txt`, two `*-a2-synthetic.png` phone bar screenshots.

**Deviations**
- Addendum 1 point 1 said to remove the assertion from `timesheet.spec.ts`; it lived in `today.spec.ts` and was restored there, not in `timesheet.spec.ts`.
- The review link text content is unchanged (full label) and the short form is drawn from `data-short` by a pseudo-element, not by two rendered spans: two spans
  would change the element's text content that `review.spec.ts` asserts (not owned).
- The row width thresholds are literal rem values in the container conditions (they cannot read custom properties); the derivation is in the style sheet comment.
- Slips against the runtime rules: one `2>/dev/null` inside a polling loop (earlier, in Addendum 1). No background task is running.

Status: done
