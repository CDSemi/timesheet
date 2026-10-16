# WP5-UX3-T05 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T05; package WP5; kind implement;
  attempt 1; depends on WP5-UX3-T04-FREEZE. Fifth slice of UI change round 3: sheet
  selection markers (lifted columns in runs, the editor column frame and Day-cell fill), the
  row names "Category" and "Status", and the "No times" shape.
- **AGENTS.md on disk wins.** Any older injected AGENTS.md copy in your context with the
  section "Unified Frontend & UI/UX Standards (Taste Skills Integration)" is superseded;
  follow the on-disk section "Frontend and UI/UX standards".
- Owner basis (board `owner_decisions`, 2026-10-15): U-13 (the editor column: no thick
  underline under the Day cell, a Day-cell background colour instead; the side rails in
  another colour than the batch selection), U-14 (batch-selected columns raised by a light
  shadow instead of a heavy frame, "floating"; the editor column the same, plus a thin blue
  border for focus), G-1 (b) (selection columns only a 4px radius; adjacent selected columns
  must not cast shadows over each other), U-15 with G-2 (a) ("Category" replaces "Label"),
  U-16 ("Status" replaces "Check"; the row only displays status).
- Design sources (the contract): `handoff/delivery/tasks/WP5-UX3-PLAN.md` Results section
  B5, section F rows U-13/U-14 and U-15/U-16, the "Existing assertions that must change"
  items for `timesheet.spec.ts:594-1136` and the picker names, section H row WP5-UX3-T05,
  section I (R-UX2A-4 and R-UX2A2-3 included); `handoff/delivery/tasks/WP5-UX3-PLAN2.md`
  Results item 3 (square week sheets stay; `--radius-lift` 4px; runs `single`, `start`,
  `mid`, `end` from a pure function; clip-paths with `--lift-clip`; the editor frame inset on
  `::after`) and item 9 row WP5-UX3-T05; the render
  `handoff/delivery/design/WP5-UX3/mockup-r2-a4-sheet-square-runs-1440-synthetic.png`. The
  tokens exist (T01).
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model sonnet; no override. Routing: size M, risk M (WCAG states of the sheet that earlier
  audits closed; z-order with the Today bar and the label picker), novelty yes (lift runs).
  Task record in English.
- Base: HEAD = origin/main = the WP5-UX3-T04-FREEZE commit (board `commit_sha`), or a later
  commit that changes only `handoff/`; source digest
  025b46cf3a8b33fa183321c39e9b9c758e2de4171da531637b377004c91b85c4 (827 files). Record HEAD,
  `git status --short` and the digest before you edit. Uncommitted coordinator files under
  `handoff/` are expected: never touch them.

## Scope

1. **Lift runs**: a pure function in `sheetModel.ts` gives each day of a week band its run
   position among lifted days (batch-selected or open in the editor): `single`, `start`,
   `mid`, `end` (a run never spans two week bands). Lifted columns: `--radius-lift` corners
   on the run's outer corners only, `--elev-lift` shadow clipped at inner edges so a run
   shows one shadow outside the group and none on a neighbour, `--lift-y` translate (static
   under reduced motion), card background, `--day-selected` tint for batch selection; the
   2px batch ring goes; the checked selection box stays the state indicator.
2. **Editor column**: lifted like any lifted column, plus a 1px accent frame on an inset
   `::after` layer (never clipped) and the Day cell filled with `--day-editing-head`; the 3px
   underline, the 2px rails and the whole-column `::before` fill go. A column that is both
   batch-selected and open: tint, lift, frame, head fill and checked box. The 3px Today bar
   stays on the head over the fill. Non-working hatching stays on the cells. Hover: tint only
   (no lift). An open label picker stays above a lifted neighbour.
3. **Phone rows**: selected = tint plus checked box (no lift in a table row); editing = 1px
   accent frame on the row plus the filled Day cell (replaces the 2px frame).
4. **Names (G-2 a, U-16)**: the visible row "Label" becomes "Category" everywhere it names
   the day category on screen: the sheet row, the phone column header, the Day editor field
   label and its section heading, the picker's accessible name ("Category for {date}:
   {visible lines}", including the second label line, R-UX2A2-3). "Check" becomes "Status"
   (row label, screen-reader row name, legend). Keep API fields, CSS hooks and data names
   unchanged. The PDF already says "Category" (no PDF change).
5. **"No times" shape**: a slashed ring (`currentColor`, words unchanged) instead of the
   hollow square, so nothing on the sheet looks like a checkbox; "Missing record" keeps its
   shape.
6. **R-UX2A-4**: the phone day button's accessible name contains its visible text (axe
   `label-content-name-mismatch` clean on the phone day buttons).
7. `aria-current` on the editing day button and the checkbox semantics stay unchanged.

## Tests

- `tests/client/sheetModel.test.ts`: the run function (no lifted day, one, two adjacent,
  three adjacent, a gap, the editor day inside or beside a run, across the week boundary);
  `SHEET_ROWS` names "Category" and "Status"; the "No times" shape key.
- `tests/client/labelPickerModel.test.ts`: the picker name with "Category" and both label
  lines.
- e2e (both projects): rewrite the marker tests (`timesheet.spec.ts:594-1136` area) to the
  new indicators with the same contrast thresholds on the same surfaces: editor column has
  the lift shadow, the inset 1px frame (>= 3:1 on card, day head, non-working and attention
  surfaces) and the Day-cell fill, no underline, no rails; a selected column has lift and
  tint, no ring; a run of three shows clip-paths start/mid/end and computed radius 4px only
  on its outer corners; both states on one column; the Today bar still painted; an open
  picker above a lifted neighbour; no sideways scroll at 768, 1024, 1280 with lifted
  columns; reduced motion: no transition duration. Rename `Label for` selectors to `Category
  for` in `day-editor.spec.ts`, `sharing.spec.ts` and any other spec that uses the old
  name (value-only); the "No times" marker is not a box. Phone: axe check of the day buttons
  (R-UX2A-4).
- List every changed assertion with file:line and why it is not a weakening.
- The 390x844 first-screen budgets still pass; record the numbers.
- No assertion removed or weakened; no `skip`, `fixme` or `.only`; dates only from the
  server-reported `today_local` and the displayed period.

## Hard constraints

- No server, API, domain, schema, PDF or CSP change.
- Tokens only; shared `var(--transition)` with a local `--transition-duration` where needed;
  WCAG 2.2 AA (1.4.11 frame and checkbox >= 3:1, 1.4.1 state not by colour alone, 2.4.7,
  2.4.11, 2.5.3).
- Keep AX-01..AX-10, R-12, the round-2 editing-column semantics (`aria-current`), the
  label-picker keyboard behaviour (B5-02/AX-02 contrast) and every T01-T04 behaviour.

## Owned paths

- `src/client/components/TimesheetSheet.tsx`, `src/client/components/SheetWeekTable.tsx`,
  `src/client/components/sheetModel.ts`, `src/client/components/DayStatus.tsx`,
  `src/client/components/dayModel.ts`, `src/client/components/labelPickerModel.ts`,
  `src/client/components/DayFieldsForm.tsx` (label texts only), `src/client/DayEditor.tsx`
  (label texts only), `src/client/styles.css`
- `tests/client/sheetModel.test.ts`, `tests/client/labelPickerModel.test.ts`,
  `tests/e2e/timesheet.spec.ts`, `tests/e2e/day-editor.spec.ts`, `tests/e2e/sharing.spec.ts`,
  `tests/e2e/keyboard-access.spec.ts`, `tests/e2e/focus-ring.spec.ts`, and value-only
  renames of "Label"/"Check" names in other specs (list them)
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX3-T05/` (masked LF `.txt` only, plus at most eight
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
6. Two mutation checks, each alone and reverted: (a) the run function returns `single` for
   every lifted day (neighbour shadows overlap): a unit test and an e2e run check fail; (b)
   the editor frame drawn as an outer shadow that the clip cuts: an e2e frame check fails.
7. Privacy and whitespace: Grep changed files and evidence for email addresses and
   user-profile paths (only the full synthetic example.invalid form may remain); Grep every
   new or changed file for `[ \t]+$` and read its last lines (exactly one final newline).
8. `npm run verify` with `SMOKE_PORT` in 48680-48699 and `DATA_DIR` and `DATABASE_PATH`
   both inside the task folder.
9. `npm run digest` LAST. If any file changes after it, rerun verify and the digest.
10. Copy the masked logs of steps 2-6, 8 and 9 into the evidence folder (logs only; do not
    copy helper scripts into evidence).

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
- Task folder `D:\.claude-tmp\timesheet\WP5-UX3-T05`. Set TEMP and TMP to it. Ports
  48680-48699. Never touch `%LOCALAPPDATA%\timesheet-dev` data or `B:\Temp\claude`. Never
  kill processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. Write no
  markdown links in Results (paths in backticks only).

## Return

At most 170 words, beginning with 'Self-reported model: ...': files changed (every test file
with changed assertions), the run rule as implemented, the frame and fill contrast minimums,
the renamed names, unit and full e2e counts per project, both mutation results, the budget
numbers, the main chunk size, verify exit code, the final full 64-hex digest and file count,
the evidence files, the background-task confirmation, any stop, conflict or deviation.

## Results
