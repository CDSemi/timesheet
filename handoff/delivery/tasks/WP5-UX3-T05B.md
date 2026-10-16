# WP5-UX3-T05B dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T05B; package WP5; kind implement;
  attempt 1; depends on WP5-UX3-T05-FREEZE. Slice of UI change round 3: the floating Day
  editor rule (no squeezed sheet columns beside the panel).
- **AGENTS.md on disk wins.** Any older injected AGENTS.md copy in your context with the
  section "Unified Frontend & UI/UX Standards (Taste Skills Integration)" is superseded;
  follow the on-disk section "Frontend and UI/UX standards".
- Owner basis (board `owner_decisions`, 2026-10-15, answer G-1 b): "In the mockup, to show
  the time editor panel, the columns are squeezed so much that their content overlaps; if
  the real app does that, I do not want it. If the screen lacks room to show the week sheets
  and the panel at the same time, make the panel floating."
- Design sources (the contract): `handoff/delivery/tasks/WP5-UX3-PLAN2.md` Results items 1
  (the measured squeeze: 89.4px columns, mid-word breaks, no element overlap) and 2 (the
  floating panel rule), the item 9 row WP5-UX3-T05B and the section F deltas for items 1/2;
  the render `handoff/delivery/design/WP5-UX3/mockup-r2-a4b-floating-panel-1280-synthetic.png`.
  Tokens `--sheet-col-min`, `--page-max-editor` and `--scrim-side` exist (T01).
- Coordinator decision (board, 2026-10-15): "floating" = the existing modal side panel below
  1360px (keeps the Escape order, focus return, AX-01 and B3-01); a non-modal overlay would
  hide focusable cells.
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model sonnet; no override. Routing: size M, risk M (focus and Escape regressions across the
  mode switch, B3-01), novelty yes. Task record in English.
- Base: HEAD = origin/main = 699b1b304390ae556c89c6d3a9ee652a00da5182 (the T05 freeze), or
  a later commit that changes only `handoff/`; source digest
  23b394dd4450fe9365865ca08a127f7d2d874b6a0c767ccc04a2e523e7306b7a (827 files). Record HEAD,
  `git status --short` and the digest before you edit. Uncommitted coordinator files under
  `handoff/` are expected: never touch them.

## Scope

1. **Readable columns**: the sheet grid columns become `minmax(var(--sheet-col-min), 1fr)`
   (108px: the widest routine word "22:00-02:30+1" plus cell padding; long holiday words
   such as "Independence" fit).
2. **Breakpoint 1360px**: the non-modal side panel beside the sheet only from 1360px
   (`WIDE_QUERY` and the CSS media query; today 1200px). From 1360px, while the editor is
   open, the page cap lifts to `--page-max-editor` (1600px).
3. **Floating below 1360px** (down to 768px): the existing modal side panel, with a lighter
   backdrop `--scrim-side`, docked on the side away from the edited column (`data-side`
   left when the column's centre is right of the viewport centre, for example Sat or Sun),
   the edited column scrolled into view before showing (`block: 'nearest'`), width
   `min(var(--editor-width), 100vw - 24px)`, `--elev-3`, `--radius-lg`. Phones keep the
   bottom sheet.
4. Unchanged behaviour: Escape order, focus moves to the heading and returns to the day
   button, AX-01 scroll padding inside the panel, the B3-01 deferred mode switch (now across
   1360px), the editing column marker and `aria-current`.

## Tests

- e2e (desktop project; per PLAN2 item 2 tests): at 1280 and 1359 the editor is `:modal`,
  the sheet keeps its full width and every word fits its cell (with the item-1 data: the
  longest seeded holiday name, an overnight session, two sessions on one day); at 1360,
  1366, 1440 and 1920 the editor is non-modal beside the sheet, every column >= 108px and no
  word is wider than its content box; the panel docks left for a Sat or Sun column and right
  for a Mon column, and the edited column's box does not intersect the panel's box; Escape
  and focus return as before; the B3-01 test crosses 1360 instead of 1200.
- Existing assertions that change, with reasons: `day-editor.spec.ts` "at 1280px the panel
  stays beside the sheet" becomes "at 1280 it floats (modal), at 1366 it stays beside" (the
  same behaviour moved to the measured threshold, plus the no-squeeze check); the B3-01
  crossing moves from 1200 to 1360; desktop-project tests that act on the sheet while the
  editor is open (marker, label picker, Today-with-editor tests) set the viewport to 1440
  with `test.use` or a per-test viewport (no assertion removed). List each changed
  assertion with file:line and why it is not a weakening.
- AX-01 in the floating panel: no focused control hidden (keyboard walk at 1280).
- The 390x844 first-screen budgets still pass; record the numbers.
- No assertion removed or weakened; no `skip`, `fixme` or `.only`; dates only from the
  server-reported `today_local` and the displayed period.

## Hard constraints

- No server, API, domain, schema or CSP change.
- Tokens only (literal 1360px allowed in the media query and `WIDE_QUERY` with a comment);
  shared `var(--transition)`; WCAG 2.2 AA (2.4.3, 2.4.7, 2.4.11, 1.4.10).
- Keep AX-01..AX-10, R-12, B-02, B3-01 and every T01-T05 behaviour.

## Owned paths

- `src/client/TimesheetScreen.tsx` (breakpoint, dock side, scroll into view),
  `src/client/DayEditor.tsx` (side attribute and the mode-switch threshold only),
  `src/client/styles.css` (grid `minmax`, page width while editing, floating panel and
  backdrop)
- `tests/e2e/day-editor.spec.ts`, `tests/e2e/timesheet.spec.ts`, `tests/e2e/today.spec.ts`,
  `tests/e2e/keyboard-access.spec.ts`, `tests/e2e/focus-ring.spec.ts` (viewport only),
  `tests/e2e/sharing.spec.ts` (viewport only)
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX3-T05B/` (masked LF `.txt` only, plus at most six
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
6. One mutation check: set the breakpoint back to 1200px; show that the 1280/1359 floating
   checks and the no-squeeze check fail; revert.
7. Privacy and whitespace: Grep changed files and evidence for email addresses and
   user-profile paths (only the full synthetic example.invalid form may remain); Grep every
   new or changed file for `[ \t]+$` and read its last lines (exactly one final newline).
8. `npm run verify` with `SMOKE_PORT` in 48700-48719 and `DATA_DIR` and `DATABASE_PATH`
   both inside the task folder.
9. `npm run digest` LAST. If any file changes after it, rerun verify and the digest.
10. Copy the masked logs of steps 2-6, 8 and 9 into the evidence folder (logs only).

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
- Task folder `D:\.claude-tmp\timesheet\WP5-UX3-T05B`. Set TEMP and TMP to it. Ports
  48700-48719. Never touch `%LOCALAPPDATA%\timesheet-dev` data or `B:\Temp\claude`. Never
  kill processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. Write no
  markdown links in Results (paths in backticks only).

## Return

At most 170 words, beginning with 'Self-reported model: ...': files changed (every test file
with changed assertions), the breakpoint and dock rule as implemented, column widths at 1360,
1366 and 1920, unit and full e2e counts per project, the mutation result, the budget numbers,
the main chunk size, verify exit code, the final full 64-hex digest and file count, the
evidence files, the background-task confirmation, any stop, conflict or deviation.

## Results

Self-reported model: claude-sonnet-5-5 (timesheet-worker-high, effort high). Attempt 1.

### Baseline (before the first edit)

HEAD 699b1b304390ae556c89c6d3a9ee652a00da5182; `git status --short` showed only the coordinator's
`handoff/` files; digest 23b394dd4450fe9365865ca08a127f7d2d874b6a0c767ccc04a2e523e7306b7a (827 files);
Node v24.21.0. Evidence `baseline.txt`, `digest-before.txt`.

### Implementation

- `src/client/styles.css`: `.week-grid` columns `minmax(var(--sheet-col-min), var(--track))` (108px token);
  the side-by-side media query moved from 1200px to 1360px (literal, with a comment) and now also holds
  `.page:has(.sheet-area.with-editor) { max-width: var(--page-max-editor) }`; the floating side panel
  `.day-panel-side` keeps `--elev-3`, `--radius-lg` and `min(var(--editor-width), 100vw - 24px)`, its backdrop is
  `--scrim-side`, and `.day-panel-side[data-side='left']` docks it at the left edge; the section comment is updated.
- `src/client/TimesheetScreen.tsx`: `WIDE_QUERY` is `(min-width: 1360px)`; `dockAwayFrom(workDate)` scrolls the
  edited column into view (`scrollIntoView({ block: 'nearest' })`) and returns `left` when the column's centre is
  right of the viewport centre, else `right`; a layout effect (it runs before the editor's own effect shows the
  dialog) stores it while the editor floats (desktop-width and not wide); `DayEditor` receives `dockSide`.
- `src/client/DayEditor.tsx`: optional `dockSide` prop and `data-side` on the modal side panel only (not on the
  panel beside the sheet nor the bottom sheet); comments say 1360px. The mode-switch code is unchanged (the
  `modal` prop carries the threshold), so the B3-01 deferred switch, Escape order, focus move and return, AX-01
  scroll padding and the editing marker and `aria-current` are untouched.
- Rule as implemented: from 1360px the editor is non-modal beside the sheet and the page cap lifts to 1600px;
  from 768 to 1359px it is the modal side panel floating over `--scrim-side`, docked away from the edited column,
  column scrolled into view; below 768px the bottom sheet as before.
- Deviation (needed, small): `.sheet-week { overflow-x: auto }` from 768 to 899px only. Seven 108px columns plus the
  label column need 850px and the page padding 32px, so from 768 to about 881px the grid would overflow the page; the
  existing tests "no sideways scroll" at 768 and 820 (`timesheet.spec.ts` meta line tests) would fail. The week card
  scrolls sideways inside itself there instead of breaking words. The lift shadows of a column are clipped by that
  scroll box in that range only.

### Tests

Changed assertions and why none is weakened (all line numbers are in the final files):

- `tests/e2e/day-editor.spec.ts:920` "the day editor is a side panel on a desktop ..." sets the window to 1440x800 on
  the desktop project: the same non-modal and beside-the-sheet assertions, now at a width where that is the rule
  (the project's 1280px window floats the panel). Assertions unchanged.
- `day-editor.spec.ts:1003` B-02 keyboard walk (AX-01) list `[768, 1024]` became `[768, 1024, 1280, 1359]`: added
  widths, nothing removed; this is the AX-01 walk in the floating panel at 1280.
- `day-editor.spec.ts:1038-1075` "at 1280px the panel stays beside the sheet and Escape closes it" became two cases:
  1280 (modal, floats) and 1366 (non-modal, beside). The beside case keeps every old assertion (focus on another
  sheet control, Show details focus and the Escape closes / focus returns steps, the latter now also asserted); the
  modal case keeps Escape closes and focus returns, and skips only the "focus() on an inert sheet control" steps that
  cannot apply while the page is inert.
- `day-editor.spec.ts:1581-1643` B3-01: the crossing moved from 1200 to 1360 (start 1440; paths "1440 to 1280" and
  "1280 back to 1440"; `width >= 1360` at 1625; comments; the screenshot names `fix5-review-on-top-w1280/w1440`).
  Every assertion of the old paths is kept.
- New `day-editor.spec.ts:1078-1380` describe "WP5-UX3-T05B" (3 tests, desktop project): floating at 1280 and 1359
  (modal, `.sheet-area` without `with-editor`, grid width equals the closed width, no column changes, every word fits
  its cell, 400px panel, Escape and focus return); dock side for Monday (right), Saturday and Sunday (left), column
  box does not meet the panel box, column scrolled into view from an off-screen position, backdrop equals
  `--scrim-side`; beside at 1360, 1366, 1440, 1920 (non-modal, every column >= 108px, no word wider than its cell,
  no sideways scroll, page 1600px at 1920, panel right of the sheet, Escape from a sheet control and focus return).
  Data on a private server: the longest holiday "Observed Independence Day", an overnight session 22:00 to 02:30,
  two sessions on one day; dates from the server's displayed period (no fixed date, no clock).
- `tests/e2e/timesheet.spec.ts:37` (constant `EDITOR_BESIDE_SHEET`, 1445x800) and the per-test
  `setViewportSize` at 609, 660, 814, 942, 1039, 1134, 1298, 1354, 1420 (marker, Show details with the editor, lifted
  and framed editing column, pixel frame, picker in the editing column, Today bar with editing marker, contrast on the
  editing day, lifted runs, picker over a lifted neighbour): viewport only; they act on the sheet while the editor is
  open, which needs it beside the sheet. 1445 rather than 1440: columns are then exactly 129px, so the pixel probes of
  the 1px inset frame (cut by the run's clip-path) read whole pixels; at 1440 (128.29px columns) the unchanged test
  "lifted columns form runs" failed 3 of 3 times at "frame at the left inner edge" (a sub-pixel softening that exists
  at any fractional column edge, also before this task; not changed here).
- `tests/e2e/today.spec.ts:241`: viewport 1440x800 on the desktop project for "Today moves an open Day editor":
  viewport only.
- No `skip`, `fixme` or `.only` added; no assertion removed.
- `keyboard-access.spec.ts`, `focus-ring.spec.ts`, `sharing.spec.ts`: unchanged, they passed unchanged.

### Checks (actual results; evidence in `handoff/delivery/evidence/WP5-UX3-T05B/`)

- Step 1/2: Node v24.21.0; HEAD and digest above.
- Reproduction before the test edits: desktop project, 14 failed / 261 passed / 30 skipped
  (`e2e-desktop-before-test-changes.txt`): `day-editor.spec.ts` (4), `timesheet.spec.ts` (9), `today.spec.ts` (1), all
  because the editor now floats (modal) at the project's 1280px window.
- Step 3: `npm run typecheck` exit 0, `npm run lint` exit 0, `npm test` exit 0: 93 files, 2075 tests passed.
- Step 4: `npm run build` exit 0; main chunk `index-BWG5g5tI.js` 453.27 kB (gzip 133.22 kB), CSS 69.02 kB; no
  chunk-size advisory.
- Step 5: `npm run test:e2e` (build, then both projects), alone, `E2E_SCREENSHOT_DIR` and the output folder in the task
  folder, real clock: 622 tests, 0 failed, 561 passed, 61 skipped (the project guards that already existed).
  desktop: 281 passed, 30 skipped; mobile: 280 passed, 31 skipped. This is the final tree (the full suite was run once
  before and once after the last test edit; both 561 passed).
- Column widths with the editor open (the new test, light): 1360 -> 116.8px; 1366 -> 117.7px; 1440 -> 128.3px;
  1920 -> 151.1px (page 1600px); floating at 1280 and 1359 the sheet keeps its 1168px grid and 153.4px columns.
  Dock (1280): Monday right (panel x 868-1268, column x 149-302); Saturday left (panel x 12-412, column x 916-1070);
  Sunday left (column x 1070-1223).
- 390x844 first-screen budgets (unchanged tests, passed): first day row bottom 658.4px with the zone note and
  559.5px without, 710.4px / 611.5px with a received share, tab bar top 788px, shell bar 60px (112px with a share).
- Step 6 mutation: `WIDE_QUERY` and the CSS media query set back to 1200px, rebuilt, desktop run of the T05B, B-02 and
  B3-01 tests: 5 failed, 6 passed (`e2e-mutation-breakpoint-1200.txt`). Failed: "at 1280px the panel floats (modal)",
  the 1280/1359 floating test (soft checks report "the editor is modal" false, `with-editor` present, and the
  no-squeeze check: grid expected 1168, received 832, i.e. columns under 108px), the dock test (not modal, no
  `data-side`), and both B3-01 paths. Reverted (both edits), then rebuilt by the later full run and `verify`.
- Step 7: Grep of the changed files and the test diff for emails and user-profile paths: none; the evidence logs hold
  only `timesheet@0.1.0` and `employee2@example.invalid`; `[ \t]+$` in the six changed files: none; `git diff --check`
  exit 0; each file ends with exactly one newline.
- Step 8: `npm run verify` (SMOKE_PORT 48705, DATA_DIR and DATABASE_PATH in the task folder) exit 0: typecheck, lint,
  93 files / 2075 tests, build, "SMOKE PASSED".
- Step 9 (last command): `npm run digest`:
  a17a0ce82faac6f99e3fc0e53bdb02289784776efce6e969966bcf5dcb14aeb9  (827 files, handoff/ excluded), exit 0.
- Evidence files: `baseline.txt`, `digest-before.txt`, `typecheck.txt`, `lint.txt`, `unit-tests.txt`,
  `e2e-desktop-before-test-changes.txt`, `e2e-full-final.txt`, `e2e-mutation-breakpoint-1200.txt`, `verify.txt`,
  `digest-after.txt`, and six screenshots `editor-floating-w1280`, `editor-floating-docked-left-w1280`,
  `editor-beside-w1366`, `editor-beside-w1920`, `editor-w1359`, `fix5-review-on-top-w1280` (all `-synthetic.png`).

### Notes for the coordinator

- Not committed or pushed. No install, no server, API, domain, schema or CSP change.
- Conflict/observation: the `.sheet-day[data-lift]` pixel probes of the editing frame are sensitive to fractional column
  edges (pre-existing); the test window is 1445px for that reason.
- No background task of mine is still running.

Status: done
