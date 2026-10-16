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
- Base: HEAD = origin/main = 83c32d2fbc57af00ef251a06024b39e641a677ce (the T04 freeze), or
  a later commit that changes only `handoff/`; source digest
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

Self-reported model: claude-sonnet-5-5. Worker timesheet-worker-high, attempt 1.

**Baseline** (evidence `01-baseline-head-status.txt`, `02-digest-before.txt`): Node v24.21.0; HEAD
83c32d2fbc57af00ef251a06024b39e641a677ce; `git status --short` showed only the expected coordinator `handoff/`
changes (ORCHESTRATION.json, WORKFLOW_REVISION_CHECKPOINT*.md, the T04-FREEZE and T05 briefs, the T04-FREEZE evidence
folder); digest before edits 025b46cf3a8b33fa183321c39e9b9c758e2de4171da531637b377004c91b85c4 (827 files).

**Files changed** (source): `src/client/components/sheetModel.ts`, `labelPickerModel.ts`, `TimesheetSheet.tsx`,
`SheetWeekTable.tsx`, `DayStatus.tsx`, `DayFieldsForm.tsx` (label texts), `src/client/DayEditor.tsx` (label texts),
`src/client/styles.css`. `dayModel.ts` is unchanged. Tests: `tests/client/sheetModel.test.ts`,
`tests/client/labelPickerModel.test.ts`, `tests/e2e/timesheet.spec.ts`, `day-editor.spec.ts`, `sharing.spec.ts`,
`hover.spec.ts` (value-only rename, not on the named list), `keyboard-access.spec.ts`. No server, API, domain, schema, PDF
or CSP change; no dependency change; no new file in `src` or `tests`.

**Run rule as implemented.** `liftRuns(lifted: readonly boolean[])` in `sheetModel.ts` takes the lifted flags of ONE week
band in order (lifted = batch-selected or open in the editor) and returns `null` for a day that is not lifted, `single`
for a lifted day with no lifted neighbour, `start` (lifted day after it only), `mid` (both sides), `end` (before only).
`SheetWeekGrid` calls it per band, so a run never spans two bands; the column carries `data-lift`. CSS: every
`[data-lift]` column gets `--lift-y` translate, card background (`--day-nonworking` on a non-working day, `--day-selected`
as the top background layer when selected, hatch kept), `--elev-lift`, `z-index: --layer-lift` (new token, 1); corners
`--radius-lift` on outer corners only (`start` left, `end` right, `single` all, `mid` none; the opaque Day cell is
rounded the same way); `clip-path` with `--lift-clip` cuts the shadow at an inner edge (`start` `inset(-32px 0px -32px
-32px)`, `mid` `inset(-32px 0px)`, `end` `inset(-32px -32px -32px 0px)`, `single` none; none also while a label picker is
open in it, because its list is wider than the column). The editor column: the same, plus a 1px accent inset frame on
`::after` (`border-radius: inherit`, `inset: 0`, so the clip never cuts it) and the Day cell filled with
`--day-editing-head`; the 3px underline, the 2px rails, the `::before` whole-column fill and the 2px batch ring are
gone (the now unused `--day-editing` token is removed from `:root` and both dark sets). The Today bar stays on
`::after` over the fill. Hover on a lifted column adds the `--day-hover` tint only. Phone rows: selected = tint plus the
checked box (no lift); editing = 1px accent inset frame on the row (top and bottom of every cell, left of the first, right
of the last, the 3px Today rail still leads) plus the Day cell filled; hatching stays.

**Contrast minimums** (measured by the e2e test in 4 theme situations x workday and non-working day x both projects,
`07-e2e-full.txt`): accent frame against card, non-working tint, Day-cell fill and amber attention cell: minimum 4.82:1
(Day-cell fill is the worst surface; >= 3:1 needed); text on the worst body surface 5.20:1 (light non-working) to 6.56:1;
`--text` and the phone's muted date on the Day-cell fill are asserted at >= 4.5:1 (they passed).

**Renamed names.** Sheet row label and screen-reader row name "Label" -> "Category" (`SHEET_ROWS.label`); phone column
header "Label" -> "Category"; Day editor section heading "Label and leave" -> "Category and leave" and its field label
"Label" -> "Category" (editable form and read-only facts); the picker names `Category for {date}: {every visible line}`
(`labelPickerName`: label or "not set", then the lines under it, then "Note" when the marker shows) and the list name
`Category for {date}`; "Check" -> "Status" (`SHEET_ROWS.check`, the screen-reader row name `Status:`). API fields, CSS hooks
(`d-label`, `d-check`, `data-cell="check"`, `data-check`), `SHEET_ROWS` keys and data names are unchanged.
"No times": `shape-slashed` (a 2px ring with a diagonal gradient bar, `currentColor`); "Missing record" keeps `square`.
The phone day button now has a real space between its two spans, so its text reads "Mon 09/28" (R-UX2A-4).

**Tests and counts.** `npm run typecheck` 0, `npm run lint` 0, `npm test` 93 files / 2075 tests passed (10 new: 9 in
`sheetModel.test.ts`, 1 in `labelPickerModel.test.ts`; `05-unit-tests.txt`). `npm run build` 0, main chunk
`dist/client/assets/index-D8gF7_wz.js` 452.86 kB (gzip 133.08 kB), no chunk-size advisory (`06-build.txt`). The FULL e2e
suite on the real clock, alone, with its own output folder and `E2E_SCREENSHOT_DIR` in the task folder, run as
`npm run build` followed by `playwright test` (the two commands of `npm run test:e2e`, run separately so the
long run could be started in the background): exit 0, 555 passed, 55 skipped, 0 failed; desktop 275 passed / 30 skipped,
mobile 280 passed / 25 skipped (`07-e2e-full.txt`, `07b-e2e-counts.txt`). No retry was needed (no `ERR_NO_BUFFER_SPACE`).

**Mutation checks** (each alone, rebuilt, then reverted; no `MUTATION` marker remains in `src` or `tests`):
(a) `liftRuns` returns `single` for every lifted day: `sheetModel.test.ts` 5 failed / 34 passed (`08-mutation-a-unit.txt`)
and the e2e "lifted columns form runs" test failed (Monday expected `start`, received `single`;
`09-mutation-a-e2e.txt`). (b) the editor frame drawn as an outer shadow (`0 0 0 1px` instead of `inset`): 3 e2e tests
failed (the one-inset-frame check, the painted left frame over the head, and the frame at the inner edge of the open
middle column of a run; `10-mutation-b-e2e.txt`).

**First-screen budgets at 390x844** (all pass; from `07-e2e-full.txt`): landing without the zone note first row bottom
559.45 against tab bar top 788; with the zone note 658.41; away window 658.41 / 559.45; shared views 710.41 / 611.45 (bar
height 112).

**Changed assertions (file:line, why none is weakened).**
- `tests/e2e/timesheet.spec.ts:796` replaces the layer test (rails, `::before` fill, underline): now the lifted look
  (matrix -3px, `--elev-lift`, z-index 1, clip, radii), no `::before`, a `::after` with no border and one inset 1px accent
  layer, Day cell `--day-editing-head`, no underline; phone: 1px frame sides, no fill layer, only the Day cell filled,
  hatching kept. Every old facet (frame colour, extent of the layer over head and last row, neighbours untouched, hatching
  kept) is still asserted, against the new indicator.
- `:923` replaces the painted rails test: painted pixels, per cell, in 4 appearances x details, for the left and right
  frame edge, the top and bottom edges, the Day-cell fill, no underline, no rail beside the frame, neighbour untouched, no
  body fill. Probes use a pixel window because a 1px edge can land on either side of a fractional box edge.
- `:1003` title only ("selection ring" -> "selection tint"); the assertions are unchanged.
- `:1051` replaces the batch-ring test: lifted, card background, tint layer equal to `--day-selected`, no `::after`, no
  accent pixels at the edges over every cell, tint painted over the card; checked box on both layouts; phone row tint and
  no lift. `:1113` Today test: the bar assertions are unchanged; the ring assertions became "bar alone, no ring", the
  three-state column asserts frame + head fill + bar + checked box; phone assertions use the 1px frame (`0,-1`, `0,1`, `3,0`).
- `:1231` and `:1276` contrast test: the same thresholds on the same surfaces (frame >= 3:1 against card, non-working,
  head, amber; text >= 4.5:1 on bodies and amber), with the frame as the inset layer and the head fill added as a surface.
- New: `:1331` runs (attributes, clips, radii, gap, editor inside a run, frame at inner edges, no neighbour shadow, outside
  shadow present), `:1401` open picker above a lifted neighbour, `:1431` no sideways scroll at 768/1024/1280, `:1451`
  reduced motion, `:1467` names Category/Status and the picker name for every visible line (all 14 days), `:1499` day
  buttons: the name contains the visible text and the phone text has the space (R-UX2A-4).
- `day-editor.spec.ts:569-571` (new: heading "Category and leave", field "Category", no "Label" heading), `:837-847` (new:
  "No times" is `shape-slashed`, not `shape-square`, a ring with a gradient bar), `:1181-1182`, `:1334-1335`, `:1369`
  (value-only `Label for` -> `Category for`). `sharing.spec.ts:244-245` (the view-only share has no `Category for` and
  still no `Label for` picker button), `:339-340` (value-only). `hover.spec.ts:458`, `:579` (value-only selector).
- `keyboard-access.spec.ts` AX-09 rendered-contrast probe (about line 461): the tint is now a gradient layer, so the probe
  adds the column's top gradient colour to the composited backdrops; the token loop (`--day-selected` over every surface) is
  unchanged. This makes the rendered measurement stricter than the old one, not weaker.
- No assertion removed, no `skip`, `fixme` or `.only`; every date comes from the server (`shownPeriod`,
  `displayedPeriodFreeWorkdays`, `today_local`) and the displayed period.

**Privacy and whitespace.** Grep for email addresses and user-profile paths over the changed source, tests, this brief and
the evidence logs: only `example.invalid` addresses remain (the evidence copies were masked by a helper that is not in
evidence). Grep for `[ \t]+$` over `src/client` and `tests`: no match; each changed file ends with exactly one newline
(checked with the last two bytes). Verify: `npm run verify` with `SMOKE_PORT=48681`, `DATA_DIR` and `DATABASE_PATH` inside
the task folder: exit 0 (`11-verify.txt`). Digest LAST: `23b394dd4450fe9365865ca08a127f7d2d874b6a0c767ccc04a2e523e7306b7a`
(827 files, handoff/ excluded; `12-digest-after.txt`). No file under `src` or `tests` was touched after verify.

**Evidence** (`handoff/delivery/evidence/WP5-UX3-T05/`): `01` to `12` masked LF `.txt` logs and eight screenshots
`lift-runs-desktop-light`, `batch-lift-desktop-light`, `editing-column-desktop-light`, `editing-column-desktop-dark`,
`editing-row-phone-light`, `today-bar-batch-desktop-dark`, `sheet-desktop-light`, `sheet-mobile-dark` (all `-synthetic.png`).

**Deviations, conflicts and open points.**
1. axe is not a dependency of the repository and nothing was installed, so R-UX2A-4 is covered by a test that emulates the
   `label-content-name-mismatch` rule (the accessible name contains the visible text, compared without case and
   punctuation) plus the exact visible text `Mon 09/28`; a real axe run on the phone buttons remains for the auditor.
2. The review sheet builds its own Status cells in `reviewModel.ts` (not an owned path) and still gives "No times" a
   square. `CheckBadge` therefore draws the slashed ring from the words (`checkShape`), so both sheets agree; the cleaner
   fix (the shape in `reviewModel.ts` plus its test) is a one-line follow-up for whoever owns that file.
3. Not renamed because not on the list: the batch review wording ("Review label change for {date}", "Recorded work
   conflicts with the new label", "I confirm the label change for these dates") and the docs (docs/04 and its `.vi.md`
   still say "Label" and "Check"); the tests of those dialogs still expect the old words.
4. `labelPickerName` adds the "Note" marker to the name when the cell shows it (visible text in name); the old name never
   had it. The `$="not set"` suffix of an unlabelled day is kept.
5. The e2e harness picks its own free ports for the server it starts (not in 48680-48699); only verify used `SMOKE_PORT`.
6. No background task is left running: the one background run (the full e2e) has exited with code 0, and every helper was a
   foreground script that ended.

Status: done
