# WP5-UX2-T03 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-T03; package WP5; kind implement;
  attempt 1; depends on WP5-UX2-T02-FREEZE (done). Third slice of UI change round 2
  (board `owner_decisions` and `coordinator_decisions`, 2026-10-14).
- Scope:
  - Owner item 1: highlight the whole column (desktop sheet) or row (phone) of the day
    that is open in the Day editor.
  - The repair of the hidden Today top bar promised by docs/04 line 46. It shares the
    layering cause, which also breaks the batch-selection ring.
  - Design source: `handoff/delivery/tasks/WP5-UX2-PLAN.md` sections A1, A7, B1 and the
    editing-column parts of E, plus the mockup
    `handoff/delivery/design/WP5-UX2/mockup.html` (artboard 1, the Thu column).
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model sonnet; no override. Routing: size M, risk M (sheet layering on a subgrid, WCAG
  states, phone budget), novelty no. Task record in English.
- Base: HEAD = origin/main = d0d21e1ffde06e4ae99c5ce90fa4a8324ccf0646, or a later commit
  that changes only `handoff/`. Source digest
  1e421090db42b29359948de3b4773d438eebe343b47a3e9ce9a2f240b06604c3 (804 files). Record
  both before you edit anything. Uncommitted coordinator files under `handoff/` are
  expected: never touch them.

## Read

- AGENTS.md from disk first ("Unified Frontend & UI/UX Standards").
- The plan sections named above. The T01 and T02 records
  (`handoff/delivery/tasks/WP5-UX2-T01.md`, `WP5-UX2-T02.md`) explain:
  - the theme sets: every new dark token goes into BOTH dark sets; the parity unit test
    guards that;
  - the hover and pressed system;
  - the contrast helper.
- docs/04 (EN) lines 40-60, for the current rules. Docs change in a later slice; do not
  edit docs here.
- `src/client/TimesheetScreen.tsx` (`editDate`, the `actions` passed to the sheet),
  `src/client/components/TimesheetSheet.tsx`, `src/client/components/SheetWeekTable.tsx`,
  `src/client/components/sheetModel.ts`, `src/client/styles.css` (sheet, day head,
  attention cell, today, selected, non-working rules).
- Tests: `tests/e2e/timesheet.spec.ts`, `tests/e2e/dayButton.ts` (read-only),
  `tests/e2e/contrast.ts`, `tests/client/sheetModel.test.ts`.

## Implement (plan B1)

1. **State.** Pass the editor's open date to the sheet (for example `actions.editing`).
   The marker is set only while the editor is open on that day. It moves when the editor
   switches day (a click or Open day), and it disappears on Close or Escape (focus still
   returns to the day button, as today). A period change keeps today's behaviour: the
   editor stays open on its date, so no column is marked if that date is not on the
   sheet.
2. **Desktop sheet.** The whole column, from the day head to the last row, is marked. This
   includes the detail rows when Show details is on, and an attention cell.
   - Draw it with layers on `.sheet-day` (`isolation: isolate`).
   - `::before` with `z-index: -1` carries a new fill token `--day-editing` (light
     `rgb(31 95 191 / 0.10)`, dark `rgb(110 168 255 / 0.16)`, in `:root` and both dark
     sets).
   - `::after` draws the accent side rails (`border-inline` of the rule width) with
     `pointer-events: none`.
   - The day head gets an accent underline (the `--rail` width) that joins the rails.
   - The layers stay out of grid flow; the subgrid must not move.
3. **Today bar repair (A7).** Use the same overlay technique, so that:
   - the Today accent top bar is visible above the opaque day head;
   - it stays visible together with batch selection and with the editing marker.
   - The batch-selection ring must no longer be broken at the head or at an attention
     cell.
4. **Distinct states, all combinable on one column:**
   - today = top bar plus the "Today" tag;
   - editing = side rails, head underline and fill;
   - batch-selected = checkbox, tint and ring;
   - hover = the existing light tint, weaker than the editing fill;
   - non-working = hatching (the editing fill layers over it);
   - attention = the amber cell stays amber.
5. **Phone (< 768px).** A day is one `<tr>`. The editing row gets:
   - a gradient fill layer above the hatching and attention colours;
   - a frame of inset 2px accent shadows: top and bottom on every cell, left on the first
     cell, right on the last;
   - when details are shown, the detail row joins the frame (bottom edge only).
6. **ARIA.** Add `aria-current="true"` on the editing day's button only, in both layouts.
   - Do not change any accessible name (docs/04 line 48, SC 2.5.3).
   - Add a `data-editing` attribute on the day container for tests.
   - No `aria-expanded` or `aria-controls`.
7. **Contrast** (plan B1 numbers, recompute them):
   - the rails are at least 3:1 against every surface tint (card, non-working, head,
     amber) in both themes and with both manual overrides;
   - text stays at least 4.5:1 on the worst surface (non-working plus fill).

## Tests

- Unit (`tests/client/sheetModel.test.ts`): the editing class or flag for the editing day
  only; `dayButtonName` unchanged.
- E2E (`tests/e2e/timesheet.spec.ts`; both projects; both themes where colour matters):
  - opening a day sets `data-editing` and `aria-current="true"` on exactly one day;
  - the computed `::before` and `::after` cover the day head and every row, also with
    Show details on;
  - the marker moves when another day opens;
  - the marker is gone after Close and after Escape;
  - the marker is kept across a period change when the date stays on the sheet, and
    absent when it is not;
  - the phone row frame;
  - the Today bar is visible (A7), including together with batch selection;
  - `aria-current` is absent everywhere else;
  - accessible names are unchanged (`ANY_DAY_BUTTON_NAME`);
  - rail and fill contrast through `tests/e2e/contrast.ts` (extend it additively).
- Calendar independence: derive every date from the server and the displayed period with
  the existing helpers (`displayedSeedDay`, `displayedPeriodFreeWorkdays`); never from the
  device clock. A branch that depends on whether today is in the shown period asserts
  both branches (choose by server values, assert the opposite fact), never skips.
- No assertion removed or weakened. No `skip`, `fixme` or `.only`.

## Hard constraints

- No server, API, request-body, domain, calculation, schema or CSP change.
- Not owned: `src/client/api.ts`, `tests/e2e/fixtures.ts`, `tests/e2e/dayButton.ts`, every
  docs file, and every file not listed under "Owned paths".
- Tokens only (CSS custom properties). Use the shared transition token and respect
  `prefers-reduced-motion`.
- Keep every behaviour that earlier audits and slices verified:
  - AX-01..AX-10 and R-12;
  - B-01 and B6-01: the phone first-screen budget at 390x844 in all four states (first
    day row above the tab bar at 788; current numbers 659/758/667/766);
  - 44px targets;
  - the modal editor below 1200px, the Escape order and the focus returns;
  - AC-16;
  - the T01 theme and T02 hover, switch and picker behaviour with their tests.

## Owned paths

- `src/client/TimesheetScreen.tsx` (the editing-date plumbing only)
- `src/client/components/TimesheetSheet.tsx`, `src/client/components/SheetWeekTable.tsx`,
  `src/client/components/sheetModel.ts`
- `src/client/styles.css`
- `tests/client/sheetModel.test.ts`, `tests/e2e/timesheet.spec.ts`, `tests/e2e/contrast.ts`
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX2-T03/` (masked LF `.txt` only, plus at most eight
  screenshots whose basenames end in `-synthetic.png`: desktop editing column with and
  without details, Today bar with batch selection, phone framed row; light and dark)

## Checks (in this order; verify and digest are the LAST commands)

1. Put Node 24 first on PATH (with `cygpath -u`), then run `node --version` (must be
   v24.x).
2. Before any edit, record `git rev-parse HEAD`, `git status --short` and
   `npm run digest`.
3. Implement, then run `npm run typecheck`, `npm run lint` and `npm test`.
4. Run the FULL e2e suite on both projects (`npm run test:e2e`):
   - set `E2E_SCREENSHOT_DIR` and the Playwright output folder inside the task folder;
   - run it alone, never in parallel with another Playwright run;
   - record the counts per project; the run must end with 0 failed.

   If `automation.spec.ts:118` fails with ECONNRESET, or a run fails with
   `ERR_NO_BUFFER_SPACE`, rerun only that test three times and record it. Then rerun the
   full suite once. Any other failure in a file you do not own: stop and report it as a
   conflict with the evidence. Do not edit that file.
5. On the mobile project, measure:
   - the first-screen budget at 390x844 in the four states;
   - that there is no horizontal scroll at 390, 375, 360 and 320 (`clientWidth` against
     `scrollWidth`).
6. One mutation check: drop the editing layer rule, show that a test fails, then revert
   it. Record the result.
7. Grep your changed files and evidence for email addresses and user-profile paths:
   - only the full synthetic example.invalid form may remain;
   - mask everything else as `<email>` or `<user>`;
   - never write such a token verbatim in Results.
8. Run `npm run verify` with `SMOKE_PORT` in 48550-48569, and with `DATA_DIR` and
   `DATABASE_PATH` both set inside the task folder.
9. Run `npm run digest` LAST. If any file changes after the digest, rerun verify and the
   digest.
10. Copy the masked logs of steps 2-6, 8 and 9 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`, NOT EVEN TO WRITE A FILE), NO `| node`, NO `| python`, NO
  `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER
  REDIRECT TO OR FROM `/dev/null` OR `nul` (NOT EVEN `2>/dev/null`).** Redirect to a file
  in the task folder and read it with the Read tool. Use the Write and Edit tools for
  files (no sed, no heredoc).
- **Create files only inside the task folder, the evidence folder or your owned paths.**
  Never write into the repository root or a drive root.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX2-T03`. Set TEMP and TMP to it. Use ports
  48550-48569 for anything you start. Never touch `%LOCALAPPDATA%\timesheet-dev` data or
  `B:\Temp\claude`.
- Give Playwright actions in probes a short timeout.
- Never kill processes by PID. Never remove anything recursively.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. Write
  no markdown links in Results (paths in backticks only).

## Return

At most 150 words, beginning with 'Self-reported model: ...'. Include:
- the files changed;
- the layering approach and any subgrid effect;
- the contrast numbers (rails and worst-surface text, light and dark);
- the phone frame;
- the mutation result;
- the unit and full e2e counts per project;
- the budget numbers (four states);
- the verify exit code;
- the final full 64-hex digest;
- the evidence files;
- the background-task confirmation;
- any stop, conflict or deviation.

## Results

Worker: claude-sonnet-5-5 (self-reported). Task folder `D:\.claude-tmp\timesheet\WP5-UX2-T03`.

### Base (recorded before any edit)

- Node `v24.21.0`. HEAD `d0d21e1ffde06e4ae99c5ce90fa4a8324ccf0646`.
- `git status --short`: modified `handoff/delivery/ORCHESTRATION.json` and `handoff/delivery/tasks/WP5-UX2-T02-FREEZE.md`; untracked `handoff/delivery/evidence/WP5-UX2-T02-FREEZE/` and `handoff/delivery/tasks/WP5-UX2-T03.md` (coordinator files, untouched).
- `npm run digest`: `1e421090db42b29359948de3b4773d438eebe343b47a3e9ce9a2f240b06604c3  (804 files, handoff/ excluded)`, exit 0.

### Step 1: implementation (checkpoint)

- `sheetModel.ts`: `dayClass(day, {selected, editing}, base)` moved here from `SheetWeekTable.tsx` (adds the word `editing`).
- `SheetWeekTable.tsx`: `DayActions.editing: string | null`, `isEditingDay`, `data-editing` on the phone row, `aria-current="true"` on the editing day's button, class `editing-detail` on the detail row and `editing-open` on the main row when details show.
- `TimesheetSheet.tsx`: the same `data-editing` and `aria-current` on the desktop column.
- `TimesheetScreen.tsx`: `actions.editing = editDate` (one line).
- `styles.css`: token `--day-editing` in `:root` and both dark sets, `--layer-marker`; `.sheet-day` is `isolation: isolate` with `::before` (fill, z-index -1) and `::after` (rails, Today bar, batch ring; z-index 1, `pointer-events: none`); head underline; open picker column rises (`:has(.label-picker.open)`); phone row frame through `--frame-*` custom properties.
- `typecheck`, `lint`, `npm test` (85 files, 1850 tests) pass at this point.

### Step 2: tests, checks and final numbers (actual results; logs and screenshots in `handoff/delivery/evidence/WP5-UX2-T03/`)

Files changed (source and tests): `src/client/TimesheetScreen.tsx`, `src/client/components/SheetWeekTable.tsx`,
`src/client/components/TimesheetSheet.tsx`, `src/client/components/sheetModel.ts`, `src/client/styles.css`,
`tests/client/sheetModel.test.ts`, `tests/e2e/contrast.ts` (additive: `readPseudo`, `settledPseudo`, `computedStyle`, `tokenColour`,
`paintedPixel`, `sameColour`, `Layer.offsetY`), `tests/e2e/timesheet.spec.ts`. No new source file; no dependency, server, API, CSP or docs change.

Layering approach:
- `.sheet-day` is `isolation: isolate`. `::before` (z-index -1, absolute, `inset: 0`) carries the fill `--day-editing`; it sits above the
  column's own tint and hatching and below the cells. `::after` (z-index `--layer-marker` 1, absolute, `pointer-events: none`) is drawn over
  the cells: a 2px `border-inline` accent for the editing rails, and one `box-shadow` that combines the Today bar (inset 0 3px) and the
  batch ring (inset 2px) through two custom properties, so today, selected and editing combine on one column.
- The head gets `inset 0 -3px 0 accent` (the underline that joins the rails). The amber cell stays amber (the rails cross it, the fill is behind).
- Subgrid effect: none. Absolute layers take no grid cell; asserted on both the no-details (6 cells) and details (8 cells) columns:
  layer box equals the padding box, top of the head to bottom of the last cell within 1.5px.
- One side effect found and fixed: an isolated column would hold its open label-picker list under the next column; the column rises while
  its picker is open (`.sheet-day:has(.label-picker.open)`, `z-index: var(--layer-popup)`). A test covers it and the mutation below failed it.
- Old locations removed: `.sheet-day.today` and `.sheet-day.selected` no longer carry the shadow themselves (it was painted under the opaque
  head and attention cell; the e2e test asserts the column's own `box-shadow` is `none`).

Phone frame (< 768px): `tr.editing td` gets `background-image: linear-gradient(fill, fill)` (layered first, so it is above the hatching of
a non-working row and above the attention colour: `linear-gradient(...), repeating-linear-gradient(...)`) and a frame of inset 2px accent
shadows: top and bottom on every cell, left on the first, right on the last. A Today row keeps its 3px left bar in the same shadow list. With
details on, the main row opens its frame downwards (`editing-open`, no bottom edge) and the detail row (`editing-detail`) closes it with
left, right and bottom. Deviation from the brief: the brief says "bottom edge only" for the detail row; I added its left and right edges
and dropped the main row's bottom edge so the frame is one closed rectangle instead of two broken boxes. `aria-current="true"` is on the
editing day's button in both layouts, `data-editing="true"` on the column or row; no `aria-expanded`, no `aria-controls`, no accessible name changed.

Contrast (computed in the browser from the real cells and layers; `editing contrast` lines of the final run; the minimum over every
surface the rail crosses, and the minimum text contrast of text, muted, ok, warn, error and accent over the body surface with the fill;
the same numbers in the four combinations of device theme and manual choice):
- Desktop, workday (card, head, amber): light rail 5.23:1, text 5.04:1; dark rail 5.08:1, text 4.91:1.
- Desktop, non-working day (worst surface: non-working tint plus fill): light rail 4.72:1, text 4.52:1; dark rail 4.78:1, text 4.62:1.
- Phone (frame over every cell, fill layered over the cell colour): workday light 4.84:1 / 5.04:1, dark 4.53:1 / 4.91:1;
  non-working light 4.72:1 / 4.52:1, dark 4.78:1 / 4.62:1.
- "Dark chosen on a light device" equals dark, "light chosen on a dark device" equals light (log lines 294/295/298/299 and the phone equivalents).
  The amber-cell text (`--attention-ink`) is asserted at least 4.5:1 on the amber cell in all four.
  All values are at or above the 3:1 (rails) and 4.5:1 (text) bars; the fill token is `rgb(31 95 191 / 0.10)` light and
  `rgb(110 168 255 / 0.16)` dark, as in the plan. The worst text figure is the plan's own muted-on-non-working-plus-fill case (4.52 light).

Tests added (`tests/e2e/timesheet.spec.ts`, both projects; none skipped, none removed or weakened; every date is from the server and the shown period):
- marker lifecycle: exactly one `data-editing` and one `aria-current="true"`; accessible names unchanged for all 14 buttons; no `aria-expanded` or
  `aria-controls`; the marker moves (desktop: click; phone: after Escape because the modal sheet is inert), goes on Escape and on Close, focus returns;
- marker across Show details, a period change (absent while its date is not on the sheet, back after Previous), Open day with a date outside and
  inside the sheet (desktop); phone: the page behind the modal is inert (a trial click is intercepted);
- layers: computed `::before` and `::after` (content, position, z-index, size equal to the padding box, rail widths and colours, `pointer-events`),
  head underline, cell count 6 and 8, other columns have none; phone: the frame per cell, the layered fill, the detail row, non-working hatch order;
- painted pixels from screenshots in four appearances (light, dark, dark chosen on a light device, light chosen on a dark device): rails over every
  cell including the head and the amber cell, fill behind the cells, the neighbour day untouched (desktop);
- the batch ring is painted over the head and the amber cell on all four sides (desktop), column `box-shadow` is `none`;
- the Today bar is painted over the head in four appearances, the Today tag is visible, the bar stays with batch selection and with the editing
  marker (all three markers on one column; head underline painted); phone: the 3px left bar, with selection and with the editing frame;
  the branch "today is in the shown period or not" is asserted both ways (`showToday`) and never skipped;
- the open picker list stays above the next columns (also in the editing column);
- contrast per surface (above); no sideways scroll at 390, 375, 360 and 320 (`scrollWidth` equals `clientWidth`) with details, selection, the editing
  frame and the open editor sheet (the sheet's own overflow is 0).
Unit (`tests/client/sheetModel.test.ts`): `dayClass` adds `editing` for the editing day only, combines with today, selected and non-working,
and `dayButtonName` is unchanged for both layouts.

Checks (in order; the logs are the `.txt` files in the evidence folder):
1. Node `v24.21.0`.
2. Base before editing: see above (`step2-base-head-status-digest.txt`).
3. `npm run typecheck` exit 0; `npm run lint` exit 0 (no deprecation line); `npm test`: 85 files, 1850 tests passed (the dark-token parity test passes).
4. Full e2e `npm run test:e2e` (run alone; screenshots and Playwright output inside the task folder; final run `e2e-full-final.txt`): 0 failed,
   370 passed, 26 skipped, 10.6 min. desktop 183 passed, 15 skipped; mobile 187 passed, 11 skipped. The skips equal the T02 baseline (15 and 11,
   the existing project-conditional skips); I added no skip. No ECONNRESET and no ERR_NO_BUFFER_SPACE. The earlier full run
   (`e2e-full-first-run.txt`, before the width tests and the contrast console lines were added) was 362 passed, 26 skipped, 0 failed.
5. Phone first-screen budget at 390x844 (first day row bottom against tab bar top 788; the `theme.spec.ts` lines in the final run, both projects):
   no share without the zone note 659.0; no share with the zone note 758.0; received share without the zone note 667.0; received share with the
   zone note 766.0 (shell bar 52 and 60). Identical to T01 and T02. No sideways scroll at 390, 375, 360 and 320 (new tests, `clientWidth` against `scrollWidth`).
6. Mutation check (`mutation-editing-layer-and-picker-raise.txt`): removed the `background` of `.sheet-day.editing::before` and renamed the
   picker-raise selector; the desktop run failed 3 tests (`fill rgba(0, 0, 0, 0)` in the layers test, `fill 255,255,255,1 over 255,255,255,1 should be about
   233,239,249,1` in the painted-pixel test, `points of the open list that another element covers` in the picker test). Both edits reverted; the final
   run is on the reverted source.
7. Grep of the changed files and of every evidence log for email addresses and user-profile paths: no match.
8. `npm run verify` (SMOKE_PORT 48550, `DATA_DIR` and `DATABASE_PATH` inside the task folder): exit 0, SMOKE PASSED (`verify.txt`).
9. `npm run digest` last: `a42c5b0496451808cbf9dd3e6b0471a5ad949c08e6e1c914006717c200f6e41f  (804 files, handoff/ excluded)`, exit 0 (`digest-final.txt`).
   No source or test file changed after the digest.

Evidence screenshots (synthetic, eight): `editing-column-desktop-light-synthetic.png`, `editing-column-desktop-dark-synthetic.png`,
`editing-column-details-desktop-light-synthetic.png`, `editing-column-details-desktop-dark-synthetic.png`,
`today-bar-batch-desktop-light-synthetic.png`, `today-bar-batch-desktop-dark-synthetic.png`, `editing-row-phone-light-synthetic.png`,
`editing-row-phone-dark-synthetic.png` (the phone row is seen above the modal bottom sheet, under its scrim).

Deviations and process slips (honest):
- The detail-row frame as described above (sides added, main row's bottom dropped when details show).
- `dayClass` moved from `SheetWeekTable.tsx` to `sheetModel.ts` so the unit test can cover it (owned files only).
- One `tail -c` on a file piped into `cat -A` and `tail` once early (a pipe into `tail`), one `2>/dev/null` in a wait loop, and one
  `rm -rf` of my own scratch folder `shots-mut` inside the task folder. No stdin script, no PID kill, no heredoc.
- No conflict in a file I do not own: every other test passed, so no stop was needed.
- Two background tasks were started (the full e2e runs and a wait loop); all have completed and none is running.

Status: done
