# WP5-UX2-T09 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-T09; package WP5; kind implement;
  attempt 1; depends on WP5-UX2-T08-FREEZE (done). Ninth slice of UI change round 2.
- Owner request (2026-10-14, verbatim on the board; English translation): "On the phone
  screen: move the Clock in/out part into the header bar at the top (the part that now
  shows 'C&D CDsemi')." The wording is now "Check in/out" (T08), and the bar now shows
  the logo (T05).
- Design: `handoff/delivery/tasks/WP5-UX2-PLAN3.md` Results item 2, with the
  architecture, the pages, shared views, fit with the switcher, desktop, and the budget
  table. Coordinator decisions (board, 2026-10-14):
  - below 768px the check in/out status and button move into the top bar on every one of
    the person's own screens;
  - shared views (`#/shared/...`) show no check in/out at all, on any width (F-Q5: never
    act or appear to act on the owner's behalf);
  - desktop (768px and wider) keeps the card in the Timesheet page, unchanged;
  - one state source (a `ClockProvider`) and one check-out dialog, never two controls at
    once;
  - the away-state budget assertion of T04 (in `today.spec.ts`) stays and must pass.
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model sonnet; no override. Routing: size M, risk M (cross-screen state, sharing
  context, AX-01 with a taller bar), novelty no. Task record in English.
- Base: HEAD = origin/main = 608572f6e8ea53e1567568ac85ca49190b5d45cf, or a later commit
  that changes only `handoff/`. Source digest
  d3c1f7cac3ddf8f7da5c64ab1a9387c8664b955bcc1bbe246cd57e202c78d4ab (812 files). Record
  both before you edit anything. Uncommitted coordinator files under `handoff/` are
  expected: never touch them.

## Read

- AGENTS.md from disk first.
- PLAN3 Results item 2, and the earlier slice records for context: T04 (budget, the
  away state, today.spec), T05 and T06 (bar and brand), T07 (theme control in the More
  panel), T08 (wording).
- `src/client/components/ClockPanel.tsx`, `src/client/components/ClockOutDialog.tsx`,
  `src/client/TimesheetScreen.tsx` (running session, `clockIn`, dialog `onDone`, notices,
  reload), `src/client/components/AppShell.tsx` (bar, `useMedia`, `useBlockSizeProperty`,
  `--shell-bar-size`), `src/client/App.tsx` (routes, shared mount; read-only unless the
  provider must wrap there; say so), `src/client/styles.css`.
- Tests: `day-editor.spec.ts`, `shell.spec.ts`, `sharing.spec.ts`, `isolation.spec.ts`,
  `timesheet.spec.ts`, `today.spec.ts`, `keyboard-access.spec.ts`, `focus-ring.spec.ts`.

## Implement

1. **State.** A `ClockProvider` (React context), rendered for the person's own screens
   only. It owns:
   - the running session (found as today: shown period, else `current` and
     `in_progress`);
   - `checkIn()` and the check-out dialog with its stale handling;
   - a `version` counter.

   It refreshes on mount, on route change within the own screens, after each action, and
   when the tab becomes visible. No refresh and no clock request in shared views. No
   more than the existing GETs per refresh. `TimesheetScreen` reads `version` to reload
   its period after an action, and may pass its loaded view so the provider does not
   fetch twice.
2. **Phone bar (< 768px).**
   - The bar holds: logo; the check in/out group (status text and the button) aligned
     right; and the "Shared with me" switcher, which wraps to a second row when present,
     as PLAN3 measured.
   - Status texts as T08: "Checking your status", "Checked out", "Checked in since
     HH:MM" plus the date line if it fits, else in the accessible name or description.
   - Button "Check in" or "Check out". "Check out" opens the existing dialog; focus
     returns to the bar button when it closes.
   - 44px targets. The bar height is still measured (`--shell-bar-size`), so the AX-01
     scroll padding follows.
   - At 320 the status text may wrap; there must be no horizontal scroll.
3. **Desktop (>= 768px).** The `ClockPanel` card stays in the Timesheet page, reading the
   same provider. The bar shows no check in/out. Never render both.
4. **Page.** On phones the Timesheet page no longer shows the clock card.
5. **Shared views.** No check in/out control anywhere, phone and desktop, for owner and
   grantee flows.

## Tests

- E2E, both projects:
  - phone bar: the status text and button are present; check in works from `#/ot` and
    `#/history`; the check-out dialog opens from the bar and focus returns to the bar
    button;
  - on a phone, `.clock-panel` is absent from the page; on desktop it is present and the
    bar has no check in/out;
  - no Check in or Check out control in shared views on either project. The forbidden
    lists keep the old and new names;
  - `--shell-bar-size` equals the measured bar height, with and without a share;
  - the four landing budget states at 390x844, with the new numbers recorded (PLAN3
    derived 591/690/643/742 against 788);
  - the T04 away-state assertion (first window day, Today tag) still passes; record the
    numbers;
  - `keyboard-access.spec.ts` AX-01 holds at 390, 375, 360 and 320 with the taller bar;
  - no horizontal scroll at those widths; 44px targets.
- Update existing tests that locate `.clock-panel` on phones or the clock card in the
  page. Show for each that it keeps its fact.
- Calendar independence: use the existing server-derived helpers.
- Run the simulated-clock sweep of `today.spec.ts` and `timesheet.spec.ts` (the FIX10
  preload method, as in T04) at these instants, America/Los_Angeles:
  - 2026-10-26 00:30 (first window day), with the Asia/Ho_Chi_Minh device zone;
  - 2026-10-27 13:00;
  - 2026-10-17 10:00.

  Record a table. Every instant must pass.
- No assertion removed or weakened. No new `skip`, `fixme` or `.only` beyond the existing
  project-conditional pattern.

## Hard constraints

- No server, API, request-body, domain, calculation, schema or CSP change.
  `dist/server` stays as frozen in 608572f.
- Not owned: `src/client/api.ts`, every docs file, and every file not listed under
  "Owned paths".
- Tokens only for new CSS values; every new dark token goes into BOTH dark sets.
- Keep every behaviour that earlier audits and slices verified:
  - AX-01..AX-10 and R-12;
  - 44px targets;
  - the modal editor, the Escape order and focus returns;
  - AC-16 and F-Q5;
  - the T01 to T08 behaviour and tests.

## Owned paths

- `src/client/components/ClockProvider.tsx` (new), `src/client/components/BarClock.tsx`
  (new), `src/client/components/ClockPanel.tsx`, `src/client/components/ClockOutDialog.tsx`,
  `src/client/TimesheetScreen.tsx`, `src/client/components/AppShell.tsx`,
  `src/client/App.tsx` (only to place the provider, if needed), `src/client/styles.css`
- `tests/e2e/day-editor.spec.ts`, `tests/e2e/shell.spec.ts`, `tests/e2e/sharing.spec.ts`,
  `tests/e2e/isolation.spec.ts`, `tests/e2e/timesheet.spec.ts`, `tests/e2e/today.spec.ts`,
  `tests/e2e/keyboard-access.spec.ts`, `tests/e2e/focus-ring.spec.ts`, and new unit tests
  under `tests/client/` for any pure model you add
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX2-T09/` (masked LF `.txt` only, plus at most eight
  screenshots whose basenames end in `-synthetic.png`: phone bar states light and dark,
  with a share, the dialog, desktop unchanged)

## Checks (in this order; verify and digest are the LAST commands)

1. Put Node 24 first on PATH (with `cygpath -u`), then run `node --version` (must be
   v24.x).
2. Before any edit, record `git rev-parse HEAD`, `git status --short` and
   `npm run digest`.
3. Implement, then run `npm run typecheck`, `npm run lint` and `npm test`.
4. Run the FULL e2e suite on both projects on the real clock (`npm run test:e2e`):
   - set `E2E_SCREENSHOT_DIR` and the Playwright output folder inside the task folder;
   - run it alone, never in parallel with another Playwright run;
   - record the counts per project; the run must end with 0 failed.

   If `automation.spec.ts:118` fails with ECONNRESET, or a run fails with
   `ERR_NO_BUFFER_SPACE`, rerun only that test three times and record it. Then rerun the
   full suite once. Any other failure in a file you do not own: stop and report.
5. Run the three-instant sweep above (each run alone, its own output folder).
6. Measure the budgets (four landing states and the away state) and the bar heights at
   390, 375, 360 and 320.
7. Grep your changed files and evidence for email addresses and user-profile paths:
   - only the full synthetic example.invalid form may remain;
   - mask everything else as `<email>` or `<user>`;
   - never write such a token verbatim in Results.
8. Run `npm run verify` with `SMOKE_PORT` in 48670-48689, and with `DATA_DIR` and
   `DATABASE_PATH` both set inside the task folder.
9. Run `npm run digest` LAST. If any file changes after the digest, rerun verify and the
   digest.
10. Copy the masked logs of steps 2-6, 8 and 9 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell. Never use PowerShell to create links or junctions.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`, NOT EVEN TO WRITE A FILE), NO `| node`, NO `| python`, NO
  `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER
  REDIRECT TO OR FROM `/dev/null` OR `nul` (NOT EVEN `2>/dev/null`). NEVER `rm -r` OR
  `rm -rf` ANYTHING.** Redirect to a file in the task folder and read it with the Read
  tool. Use the Write and Edit tools for files (no sed, no heredoc).
- **Create files only inside the task folder, the evidence folder or your owned paths.**
  Never write into the repository root or a drive root. Create the task folder first.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX2-T09`. Set TEMP and TMP to it. Use ports
  48670-48689 for anything you start. Never touch `%LOCALAPPDATA%\timesheet-dev` data or
  `B:\Temp\claude`.
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
- the provider design (refresh triggers, request count, shared-view behaviour);
- the phone bar layout with and without a share;
- the budget numbers (four landing states and the away state);
- the AX-01 result;
- the sweep table summary;
- the unit and full e2e counts per project;
- the verify exit code;
- the final full 64-hex digest;
- the evidence files;
- the background-task confirmation;
- any stop or deviation.

## Addendum 1 (coordinator, 2026-10-14)

- Decision on the stop: both failures are the intended bar change of PLAN3 item 2. That
  change was adopted by the coordinator decision of 2026-10-14: a 60px phone bar
  without a share, and two rows (112px) with a share. They are not product defects.
- Owned paths grow by exactly two assertions:
  - `tests/e2e/theme.spec.ts` about line 532 (`expectBudget`). Replace the single
    "one row, at most 60px" bound with the PLAN3 facts:
    - without a received share, the bar is one row and at most 60px;
    - with a share, the bar is at most 112.5px (two rows: the check in/out row and the
      switcher row);
    - in both cases the bar height equals the measured `--shell-bar-size`.
    - Keep the first-day-row assertion unchanged.
  - `tests/e2e/logo.spec.ts` about line 150: the phone bar height 52 becomes 60 (8 + 44
    + 8). Keep the desktop 56px assertion.
  - Record in Results why each is the same kind of fact with the new designed values.
- Then finish the remaining checks, in this order:
  - `npm test`;
  - the FULL e2e suite on both projects, alone (0 failed);
  - the three-instant sweep;
  - the budget and bar measurements;
  - the privacy grep;
  - `npm run verify`;
  - `npm run digest` LAST.
- Copy the masked logs into the evidence folder. Append "Addendum 1 results" with the Edit
  tool.
- Runtime rules still apply: NO HEREDOCS AT ALL (you used two empty ones), no stdin
  scripts, no pipes into head or tail, no `/dev/null`, no `rm -r`, no links or junctions,
  no cmd.exe.

## Results

Self-reported model: claude-sonnet-5-5. Status: STOPPED at step 4 (blocker below). Not done: sweep, verify, final digest.

**Base (recorded before any edit).** HEAD 608572f6e8ea53e1567568ac85ca49190b5d45cf; `git status --short` listed only handoff files (ORCHESTRATION.json,
WP5-UX2-T08-FREEZE.md, the T08 evidence folder, this brief); digest d3c1f7cac3ddf8f7da5c64ab1a9387c8664b955bcc1bbe246cd57e202c78d4ab (812 files); Node v24.21.0.

**Blocker (stop rule: a test in a file I do not own fails).** The full real-clock run has 5 failures, all in files outside the owned paths and all caused by the
intended design change (the bar now holds Check in/out):
- `tests/e2e/theme.spec.ts:532` (`expectBudget`, 4 failures: both projects, "received share" with and without the zone note): `expect(shellBar.height).toBeLessThanOrEqual(60)`,
  "the compact shell bar is one row"; now 112 (clock row 60 plus the switcher row 52, PLAN3 item 2). The first-day-row assertion on the line above it passes.
- `tests/e2e/logo.spec.ts:150` (mobile, 1 failure): `expect(barHeight).toBe(52)` on the phone; now 60 (8 + 44 + 8, the 44px Check in/out target).
Proposed minimal edits for the next owner of those files (the same change I made to `sharing.spec.ts`): theme.spec.ts line 532 bound 60 to 112.5 with the reason; logo.spec.ts
line 150 expected phone height 52 to 60. No other failure: all other tests pass.

**Files changed (source).** New `src/client/components/ClockProvider.tsx`, `src/client/components/BarClock.tsx`. Edited `src/client/components/ClockPanel.tsx` (now `ClockStatus`,
`ClockButton`, `clockPhase` plus the desktop card reading the provider), `src/client/components/AppShell.tsx` (wraps its tree in `ClockProvider enabled={route !== 'shared'}` and renders
`BarClock` after the brand), `src/client/TimesheetScreen.tsx` (no local clock state, dialog or `findRunningSession`; reports its loaded view, reloads on the provider's `version`, shows the
provider's notice; the card renders only `own && desktop`), `src/client/styles.css` (`.bar-clock`, `.clock-error`; the phone-only `.clock-panel` rule removed). `ClockOutDialog.tsx`,
`App.tsx` and `api.ts` unchanged (the provider sits inside `AppShell`, so `App.tsx` is not touched). No server, API, CSP or docs change; no new token (existing tokens only), so no dark-set edit.

**Provider design.** `ClockProvider({ enabled })` is always in the tree (a stable tree keeps the AppShell bar ref and its `--shell-bar-size` observer valid); `enabled` is false in a shared
view, where the context is null: no state, no dialog, no request, no control. It owns `running`, `checkIn()`, `openCheckOut()` (the one `ClockOutDialog` with stale handling), `version`,
`error`, `notice` and `reportView(view)`. Refresh triggers: mount and each `hashchange` on the own screens except the Timesheet page (which reports its own period) and shared addresses;
the Timesheet page's loaded view (`reportView`, as before); after each action (the page reloads itself through `version`; elsewhere the provider reads); `visibilitychange` to visible
(reload through `version` when the page is mounted). One refresh is the old one: `GET /api/periods/current` plus at most the two timesheets (the shown period is skipped when reported).
A sequence guard lets only the newest lookup set state. The check-out dialog saves the opener and restores focus to it when it is gone (the bar button on a phone, the card button on a desktop).
The bar and the card use the 768px `useMedia` (now exported from `ClockProvider.tsx` with `DESKTOP_QUERY`; `TimesheetScreen` imports it): never both. Errors show in the bar group or the card.

**Phone bar layout (measured, mobile project).** Group: logo, then the status words and the button right-aligned; group max-width is the room left beside the logo, so it never wraps below it and
the status text wraps inside it at narrow widths (grid `minmax(0, 1fr) auto`). Below 360px the date line is visually hidden (still in the live region); "Checked in since HH:MM" stays.
Without a share: one row, 60px at 390, 375, 360 and 320. With a share: the switcher wraps to a second 44px row, 112px at all four widths. `--shell-bar-size` equals the bar height in all eight
cases (60 / 112); button 87.4 x 44; group 252.3 wide at 390, 375 and 360 (240 at 320); no horizontal scroll.

**Budgets at 390x844 (first day row bottom vs tab bar top 788; real clock, Asia/Ho_Chi_Minh and America/Los_Angeles).** Landing: no share, no zone note 571.5; no share, zone note 670.4;
share, no note 623.5; share, zone note 722.4 (headroom 216.5 / 117.6 / 164.5 / 65.6). PLAN3 derived 591 / 690 / 643 / 742 (that estimate assumed a wrapped Review label; the shipped T04 row is one line).
Away state (T04 assertion, `today.spec.ts`, Today tag test unchanged and passing): 571.5 (no zone note) and 670.4 (zone note). AX-01: `keyboard-access.spec.ts` mobile walks now run at 390, 375, 360
and 320 (375 and 360 added) and all passed.

**Tests.** `shell.spec.ts` (new): phone bar flow on both projects (check in from `#/ot`, state follows to `#/history`, dialog opens from the bar, Cancel and Check out return focus to the bar
button, check in again from History, `.clock-panel` absent on a phone; desktop: bar has none, card present in the Timesheet page); shared views `""`, `/timesheet`, `/ot`, `/revisions` (no Check in/out
control or region, no own clock or period request, control back on return); eight bar measurements (390/375/360/320, with and without a share). A first version of the shared-view test failed and found
a real defect (a clock read on the hashchange into a shared address); fixed in the provider. `sharing.spec.ts`: the "bar is one row (<= 60)" assertion became "<= 112.5, the clock row plus the switcher
row" (design change; the first-row-above-tab-bar assertion is unchanged and logs the number). `keyboard-access.spec.ts`: 375 and 360 added. `timesheet.spec.ts`: budget helper logs the number; comment updated.
Existing clock tests (`day-editor.spec.ts`, `isolation.spec.ts`, `review.spec.ts`, `focus-ring.spec.ts`) pass unchanged (names and the region name "Check in and out" are the same in the bar and the card).
Nothing removed, skipped or weakened beyond that one design-driven bound.

**Runs.** `npm run typecheck` exit 0; `npm run lint` exit 0 (before the last CSS-only edit; no TypeScript change after it). Full real-clock e2e (before the last CSS-only polish): 429 passed, 42 skipped, 5 failed
(above); desktop 207 passed / 29 skipped / 2 failed; mobile 222 passed / 13 skipped / 3 failed. After the polish `shell.spec.ts` alone: 31 passed. Unit tests (`npm test`), the three-instant sweep, verify and the
final digest were NOT run (stopped).

**Deviation.** Two empty or trivial heredoc writes (`note.txt`, `x.txt` in the task folder) before I caught the rule; no node or python stdin, no pipe into head or tail.

**Evidence** (`handoff/delivery/evidence/WP5-UX2-T09/`): `step2-base-head-status.txt`, `step2-base-digest.txt`, `typecheck.txt`, `lint.txt`, `e2e-full-realclock-1.txt`, `e2e-shell-bar.txt`, and five
light-theme synthetic screenshots (phone bar 390, with a share 390, with a share 320, dialog, desktop unchanged). Dark-theme screenshots not taken.

Next action: widen ownership to `tests/e2e/theme.spec.ts` (line 532) and `tests/e2e/logo.spec.ts` (line 150), then rerun typecheck, lint, `npm test`, the full e2e, the sweep, verify and digest.

## Addendum 1 results

Self-reported model: claude-sonnet-5-5. Status: done.

**The two assertions (why each keeps its kind of fact).**
- `tests/e2e/theme.spec.ts` `expectBudget` (now takes `share`): it still measures the rendered phone bar and bounds its height. Without a share: one row, at most 60px (the 44px
  Check in/out target plus 8px padding each side). With a share: at most 112.5px (the clock row plus the switcher row, two 44px rows). New in both cases, still the same kind of fact:
  the measured `--shell-bar-size` equals the rendered bar (`toBeCloseTo`, 1 decimal), which is the AX-01 contract. The first-day-row-above-tab-bar assertion, `scrollY`, and the
  no-theme-control-in-the-bar assertion are unchanged. The bound was loosened only by the designed second row (PLAN3 item 2); a bar that grows past its designed rows still fails.
- `tests/e2e/logo.spec.ts`: it still asserts the exact bar height, not a range: phone 60 (was 52), desktop 56 unchanged. The comment says why: the 36px logo alone would keep 52, the
  44px Check in/out target (8 + 44 + 8) sets 60. An unexpected change of either bar height still fails.

**Counts.** `npm test`: 88 files, 1878 tests passed (0 failed). Full e2e on the real clock (alone, `npm run test:e2e`): 434 passed, 42 skipped (project-conditional), 0 failed; desktop 209 passed /
29 skipped, mobile 225 passed / 13 skipped. No ERR_NO_BUFFER_SPACE or ECONNRESET occurred; no rerun was needed.

**Sweep** (`today.spec.ts` and `timesheet.spec.ts`, both projects, simulated clock by the FIX10 preload `shiftclock.mjs`, America/Los_Angeles, each run alone with its own output folder; the specs'
device zone is Asia/Ho_Chi_Minh):

| Instant | Branch | Passed | Skipped | Failed |
|---|---|---|---|---|
| 2026-10-26 00:30 (first window day) | window | 59 | 11 | 0 |
| 2026-10-27 13:00 | window | 59 | 11 | 0 |
| 2026-10-17 10:00 | outside | 59 | 11 | 0 |

**Budgets at 390x844** (first day row bottom; tab bar top 788; both device zones). Landing: no share, no zone note 571.5; no share, zone note 670.4; share, no note 623.5; share, zone note 722.4.
Away state (T04 assertion, first window day, Today tag): 571.5 / 670.4, assertion passes. All above the tab bar.

**Bar measurements** (mobile project; bar height = `--shell-bar-size`): at 390, 375, 360 and 320 the bar is 60px without a share and 112px with a share; the Check out button is 87.4 x 44; the group
is 252.3 wide (240 at 320); no horizontal scroll. The desktop bar is 56px, the logo test passes (phone 60). AX-01 (`keyboard-access.spec.ts`): hidden stops 0 at 1280, 768, 390, 375, 360 and 320.

**Checks.** `npm run typecheck`, `npm run lint` exit 0. Privacy grep over the changed source, tests, evidence and this brief: only the full synthetic `example.invalid` form (the pre-existing `sharing.spec.ts`
constant and the seed lines of the smoke log). `npm run verify` (SMOKE_PORT 48672, DATA_DIR and DATABASE_PATH in the task folder): exit 0 (unit 1878 passed, build, smoke all PASS).
`npm run digest` last: 29ea76dface73cbdece89705c76e34a69c6e56a22e3988c06c9a5a127f3d43f6 (814 files, handoff/ excluded). No file under source or tests changed after it (only handoff files, which the digest excludes).

**Evidence** (`handoff/delivery/evidence/WP5-UX2-T09/`): `a1-typecheck.txt`, `a1-lint.txt`, `a1-unit.txt`, `a1-full-e2e-realclock.txt`, `a1-sweep-1026-0030.txt`, `a1-sweep-1027-1300.txt`,
`a1-sweep-1017-1000.txt`, `a1-verify.txt`, `a1-digest.txt`, `env.sh.txt`, `run-shift.sh.txt`, `sweep.sh.txt`, plus the earlier files (the first full run with its 5 failures is `e2e-full-realclock-1.txt`)
and five light-theme synthetic screenshots. Dark screenshots were not taken.

**Deviations.** No heredoc and no stdin script in the addendum work; the two empty heredocs of the first pass stand as recorded. No background task is still running.

Status: done
