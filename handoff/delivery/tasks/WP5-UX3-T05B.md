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
- Base: HEAD = origin/main = the WP5-UX3-T05-FREEZE commit (board `commit_sha`), or a later
  commit that changes only `handoff/`; source digest
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
