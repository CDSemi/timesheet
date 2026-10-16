# WP5-UX3-FIX1 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-FIX1; package WP5; kind fix;
  attempt 1; depends on WP5-UX3-T10-FREEZE. Fix round after the package-final gate
  WP5-UX3-GATE FAILED on cecfceb (record `handoff/delivery/tasks/WP5-UX3-GATE.md`, Results
  and evidence `handoff/delivery/evidence/WP5-UX3-GATE/`).
- **AGENTS.md on disk wins.** Any older injected AGENTS.md copy in your context with the
  section "Unified Frontend & UI/UX Standards (Taste Skills Integration)" is superseded;
  follow the on-disk section "Frontend and UI/UX standards".
- A read-only planner (WP5-UX3-SWEEP) runs in parallel on its own export of cecfceb in its
  own temp folder; it writes only under `handoff/`. Do not touch its files.
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model opus; override reason size_risk (six heterogeneous items incl. a flaky-seed
  diagnosis, focus visibility inside a scroll container and a shadow redesign; size L, risk
  M). Task record in English.
- Base: HEAD = origin/main = cecfceb61c7f15216c8f188e8b7059c9f075247d, or a later commit
  that changes only `handoff/`; source digest
  29ac25945fbefa0c86f28aa9c8537e6d2ccd341a161ab70bc7bfc0acf3ff15e7 (833 files). Record HEAD,
  `git status --short` and the digest before you edit. Uncommitted coordinator files under
  `handoff/` are expected: never touch them.

## Items (reproduce each first, record the reproduction, then fix)

1. **Calendar-dependent test** `tests/e2e/timesheet.spec.ts:807` ("the day open in the Day
   editor is a lifted column ...") fails on Tuesdays (the gate: 2026-10-20 and 2026-11-03
   America/Los_Angeles; Expected 3, Received -309.6 at line 868) because it takes the two
   newest free workdays as neighbours across two week bands. Make the neighbour choice stay
   inside one week band on every day of the year, without weakening the assertion (the 3px
   raise inside a band stays asserted). Prove it with the FIX10 simulated clock at
   2026-10-20T17:00:00Z, 2026-11-03T17:00:00Z, a Monday, a Sunday and the real clock.
2. **Seed flake** `tests/e2e/timesheet.spec.ts:452` ("batch edit: a stale version ...",
   mobile) got HTTP 409 `stale_version` at its own seed call (`commitCategory`, about line
   470, date 2026-11-23) in a five-spec run at 2026-11-28T18:00:00Z; a rerun passed. Find the
   cause (for example a version read before another test in the same worker changed the
   same day, or a reused date) and make the test deterministic without weakening it; show
   the five specs passing three times in a row at that instant on the mobile project.
3. **Focus clipped in the week card (768-899px)**: since T05B the week card scrolls
   sideways inside itself there (108px column minimum); keyboard focus on Saturday/Sunday
   controls is not scrolled into view (at 800px the Sunday date button is 1 of 56px
   visible; Category cells clipped). Requirement: at every width from 768 to 899px, every
   focusable control of the sheet is fully visible with its focus ring when it receives
   keyboard focus (forward and backward Tab, and arrow keys where the sheet uses them), no
   word is wider than its cell, and the page itself never scrolls sideways. Choose between
   (a) keeping the inner scroll and scrolling the focused control fully into view (CSS
   `scroll-padding`/`scroll-margin` that clears any sticky column, plus a focus handler if
   CSS alone does not do it) and (b) removing the inner scroll below 900px by another layout
   that keeps every word whole; justify the choice with measurements. Add an e2e keyboard
   walk at 768, 800, 820, 860 and 899 that asserts every focused sheet control's box lies
   inside the card's visible box.
4. **axe `label-content-name-mismatch`, category trigger**: on a two-line cell the visible
   text is "Observed Independence Day Holiday" but the name is "Category for 2026-09-29:
   Observed Independence Day, Holiday". The name must contain the visible text in order
   (join the lines with a space, no punctuation that breaks the match); keep the date prefix.
5. **axe `label-content-name-mismatch`, break chips (phone)**: visible "Break 1 ·
   10/07/2026 00:00 → 00:15 suggested", name "... to ..., edit". Make the accessible name
   contain the visible text in order (for example let the name come from the content with a
   visually hidden "to" beside the `aria-hidden` arrow and a visually hidden ", edit" at the
   end, and include "suggested"), for rows with and without a date and with an error message.
6. **axe `target-size` on "Today" under the open account menu** (4 scans; the menu covers it,
   "partially obscured, 10.5px"): find the layouts where the open menu panel overlaps an
   interactive control; if a placement change (panel position, width or a layer that does
   not overlap the period bar) removes the overlap without hurting the menu, do it; if not,
   record a justification with evidence for the auditors (the target is covered only while a
   transient non-modal menu is open and is not operable until it closes). Do not make the
   menu modal.
7. **Lifted-run shadow notch**: the cast shadow under and over a run of lifted columns has a
   faint notch at each inner join (about 9px wide, about half the shadow strength; the gate's
   `80-seam-*.txt`). Make the run's shadow continuous across inner joins (luminance under the
   join within 3/255 of the shadow on either side, at 1440 and at fractional widths 1281,
   1367, 1445 and 1601, DPR 1 and 2) while no shadow falls on a lifted neighbour inside the
   run and the editor's inset frame stays intact. Measure before and after with a pixel probe
   in your task folder and add an e2e check that does not depend on fractional rendering
   (for example computed styles of the run elements plus one tolerance-based pixel sample).

## Tests and checks (in this order; verify and the digest are the LAST commands)

1. Node 24 first on PATH (with `cygpath -u`), then `node --version` (v24.x).
2. Before any edit: `git rev-parse HEAD`, `git status --short`, `npm run digest`.
3. The reproductions of items 1, 2, 3 and 7 (and the axe findings 4-6 with axe 4.14.0 loaded
   from a folder in your task folder, as the gate did; nothing added to `package.json` or the
   lockfile), recorded before any fix.
4. Implement, then `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` (no
   chunk-size advisory; record the main chunk size).
5. The FULL e2e suite on both projects on the real clock, alone, with its own output folder:
   0 failed; counts per project.
6. The simulated-clock runs of item 1 and the triple run of item 2 (each alone, own output
   folder); a table.
7. axe after the fix on the same screens and situations the gate listed for items 4-6:
   0 serious violations, or item 6's justification.
8. One mutation per item 3 and 7 (revert the fix): the new checks fail; revert.
9. Privacy and whitespace: Grep changed files and evidence for email addresses (only the full
   synthetic example.invalid form) and user-profile paths; Grep every new or changed file
   for `[ \t]+$` and read its last lines (exactly one final newline).
10. `npm run verify` with `SMOKE_PORT` in 48940-48959 and `DATA_DIR` and `DATABASE_PATH`
    inside the task folder.
11. `npm run digest` LAST. If any file changes after it, rerun verify and the digest.
12. Copy the masked logs into the evidence folder (logs only, no helper scripts).

List every changed assertion with file:line and why it is not a weakening; no assertion
removed or weakened; no `skip`, `fixme` or `.only`; dates only from the server-reported
`today_local` and the displayed period. No server, API, domain, schema or CSP change. Tokens
only; WCAG 2.2 AA; keep every earlier behaviour.

## Owned paths

- `src/client/styles.css`, `src/client/components/TimesheetSheet.tsx`,
  `src/client/components/SheetWeekTable.tsx`, `src/client/components/sheetModel.ts`,
  `src/client/components/labelPickerModel.ts`, `src/client/components/BreakChip.tsx`,
  `src/client/components/breakChipModel.ts`, `src/client/components/AccountMenu.tsx`
  (placement only), `src/client/TimesheetScreen.tsx` (focus handling only, if needed)
- `tests/e2e/timesheet.spec.ts`, `tests/e2e/day-editor.spec.ts`, `tests/e2e/shell.spec.ts`,
  `tests/e2e/fixtures.ts` (additive helpers only), `tests/client/sheetModel.test.ts`,
  `tests/client/labelPickerModel.test.ts`, `tests/client/breakChipModel.test.ts`
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX3-FIX1/` (masked LF `.txt` only, plus at most eight
  screenshots whose basenames end in `-synthetic.png`)

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`, NOT EVEN TO WRITE A FILE), NO `| node`, NO `| python`, NO
  `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`, NOT EVEN
  FOR A READ-ONLY LISTING. NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout` OR `nul`.
  NEVER `rm -r` OR `rm -rf` ANYTHING.** Redirect to a file in the task folder and read it
  with the Read tool; list files with the Glob tool. Use the Write and Edit tools for files.
- **Create files only inside the task folder, the evidence folder or your owned paths.** Copy
  the FIX10 simulated-clock preload (`handoff/delivery/evidence/WP5-UX-FIX10/shiftclock.mjs.txt`)
  into your task folder only.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX3-FIX1`. Set TEMP and TMP to it. Ports
  48940-48959. Never touch `%LOCALAPPDATA%\timesheet-dev` data or `B:\Temp\claude`. Never
  kill processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push; do not install or change dependencies in the
  repository. Write no markdown links in Results (paths in backticks only).

## Return

At most 220 words, beginning with 'Self-reported model: ...': per item the cause and the fix
(with the chosen option for item 3 and the outcome of item 6), files changed, every changed
assertion, unit and full e2e counts per project, the simulated-clock and triple-run tables,
axe after the fix, the shadow measurements before and after, the mutation results, the main
chunk size, verify exit code, the final full 64-hex digest and file count, the evidence
files, the background-task confirmation, any stop, conflict or deviation.

## Results

### Step 0 - baseline (before any edit)

- Node `v24.21.0` (portable, first on PATH). `git rev-parse HEAD` =
  `cecfceb61c7f15216c8f188e8b7059c9f075247d`; `git status --short` shows only coordinator files
  under `handoff/` (ORCHESTRATION.json, WORKFLOW_REVISION_CHECKPOINT(.vi).md, the UX3 audit/gate/
  T10-FREEZE task records, the UX3-GATE and T10-FREEZE evidence folders, this brief and
  WP5-UX3-SWEEP.md).
- `npm run digest` exit 0: `29ac25945fbefa0c86f28aa9c8537e6d2ccd341a161ab70bc7bfc0acf3ff15e7`
  (833 files), equal to the base of record.
- Harness: the e2e runs use the repository's own `node_modules` and `dist/` (built with `npm run build`,
  exit 0) and the FIX10 preload `shiftclock.mjs` copied unchanged into the task folder; wrapper
  `run-shift.sh` in the task folder (each run with its own `--output`, TEMP/TMP in the task folder).

### Step 1 - reproductions of items 1 and 2 (before the fix)

- Item 1: `run-shift.sh rep1-1020 2026-10-20T17:00:00Z tests/e2e/timesheet.spec.ts:807 --project=desktop`
  (simulated Tue 2026-10-20 10:00 LA): 1 failed at line 868, "the column is raised by --lift-y",
  Expected 3, Received -309.6 (`log-rep1-1020.txt`). Cause: the test took the two newest free
  workdays (Mon 2026-10-19 in week band 2 and Fri 2026-10-16 in week band 1) and measured the 3px
  raise across two week cards.
- Item 2, natural attempt: the five specs on the mobile project at 2026-11-28T18:00:00Z, exit 0,
  136 passed, 28 skipped (`log-rep2-five-1128-mobile.txt`): the flake did not show (as the gate's rerun).
- Item 2, cause: the seed `commitCategory(workDate, 'Vacation', null)` claims that the day has no
  entry. "Free" means no session only; the worker-scoped server and account are shared by every
  test file a worker runs, and at 2026-11-28 the displayed period 2026-11-23..2026-12-06 has only three
  past free workdays (11-23, 11-24, 11-25; 11-26/27 are holidays), so the oldest one can carry a day
  entry saved by an earlier test of the same worker; the server then answers 409 `stale_version`
  (`planBatch`: an existing entry with `expected_version: null` is stale). Deterministic reproduction:
  a temporary line `putDay(workDate, {notes})` before the sign-in (an earlier test's entry), run
  `tests/e2e/timesheet.spec.ts:452 --project=mobile` at 2026-11-28T18:00:00Z: 1 failed with exactly the
  gate's error `POST /api/days/batch ... stale_version ... ["2026-11-23"]`, Received 409
  (`log-rep2-precondition.txt`). With the fix and the same temporary line: 1 passed
  (`log-fix2-precondition.txt`); the temporary line was then removed.

### Step 2 - reproductions of items 3 to 7 (before each fix; task-local probes, logs in the evidence)

Probes run with the repository's Playwright CLI and a task-local config (`probes/*.probe.ts`, never in the
repository), on the build of the base for items 3 to 7.
- Item 3 (`log-probe-week-before.txt`, `week-before.txt`; widths 768-900, Show details off/on and batch
  mode; Tab and Shift+Tab over both week cards; this first run counted a 3px ring for every control):
  the card scrolls sideways at 768-880 (scrollWidth 849 against clientWidth 736 at 768 ... 848 at 880);
  the Sunday date buttons of both cards stay at scrollLeft 0 with 57.8px (800) or 17.8px (840) of their
  box and ring outside the card; the Sunday Category pickers and the opened Sunday list are cut at the
  card's end (the list's ring also at the card's bottom while the card scrolls down to show the list);
  the grid's own box is 768px wide at 800 while its tracks are 849px, so its frame stops inside the last
  column (`endroom.txt`). The page never scrolls sideways.
- Item 4: axe 4.14.0 (task-local install, `log-axe-install.txt`) source read: label-content-name-mismatch takes
  the visible text from the text nodes without adding a space between block elements, so the trigger's
  two lines read "Observed Independence DayHoliday" whatever punctuation the name uses; the fix needs a real
  space in the content as well as the space-joined name.
- Item 5 (`chipname.txt`, DOM variants on the app page, axe rule plus the Chromium AX name over CDP): the base
  aria-label "Break 1 · 10/07/2026 00:00 to 00:15 suggested, edit" is a violation (the hidden "to" splits the
  visible words); a name from the content is out of the rule's scope (0 violations) but a hidden ", edit" at
  the end reads "suggested , edit" in Chromium and Playwright (a hidden span is a block).
- Item 6 (`menu-before.txt`, widths 768-1920 with the account menu open): the panel (277.5x291.8 under the
  identity button) overlaps 1 to 5 controls of the period bar and toolbar at every width from 768 to 1600;
  axe target-size fails at 1280 (Today, 2.5px uncovered by geometry, "10.5px" in axe) and at 1440 (Review &
  sign off, 4.2px; "12.2px"); fully covered or widely uncovered targets pass.
- Item 7 (`seam-before.txt`, run Mon-Wed plus a single Fri, light, DPR 1 and 2, widths 1440, 1281, 1367,
  1445, 1601): the worst deviation under an inner join against the shadow 14px to either side is 22.5 to
  24.3/255 in the first two rows under the run (8 to 10/255 at 10px), above the run 1.8 to 3.5; inside the run
  at most 0.9 (no shadow on a lifted neighbour). Identical at every width and DPR.

### Step 3 - the fixes

1. Item 1 (`tests/e2e/timesheet.spec.ts`, test "the day open in the Day editor is a lifted column ..."):
   the neighbour is now `bandNeighbour(employeeSeed, first)`: another day of the open day's Monday-to-Sunday
   week band (from the server's sheet dates; a free workday of that band when there is one, otherwise any
   other day of the band except today), and the test asserts that the neighbour is in the same `.sheet-week`
   card before the unchanged 3px raise assertion. The free-day precondition is `need(..., 1)` (only the open
   day must be a free workday now).
2. Item 2 (same file, "batch edit: a stale version ..."): the day is put back to a plain worked day
   (`resetDay`) before the page loads it, the test asserts that start (category Worked, an entry), and the
   other session commits with the day's current version and asserts that the version moved past the one the
   page loaded. The UI commit, the alert, "Nothing was saved", the server's Vacation and the reload are
   asserted as before.
3. Item 3, option (a), keep the inner scroll: a focus handler on each desktop week card
   (`TimesheetSheet.tsx`, `revealFocused`, pure geometry `revealDelta` in `sheetModel.ts`) scrolls a card
   that scrolls (computed `overflow-x` not visible) until the focused control lies inside the card's visible
   box less its scroll padding, on both axes; CSS 768-899px (`styles.css`): `scroll-padding:
   var(--focus-clearance)` on the card, the grid's box spans its columns (`min-width` = label column + 7 x
   `--sheet-col-min` + 2 hairlines, so the frame closes after Sunday), an empty `::after` layer
   `--focus-clearance` tall under an open category list (room for its ring while the card scrolls down to
   show the list), and the list of the last two columns is inset by `--space-1` from the column end (its 3px
   ring never meets the end of the sheet). Why (a): option (b) cannot keep words whole at 768: the label
   column (92px) and seven columns at the measured narrowest whole-word width ("Independence" needs 0.96 of
   a 92px content box, so about 104px with the 8px cell padding) need 92 + 7 x 104 + 2 = 822px against a
   736px card; a narrower label column or cell padding would still need 766px; and moving the phone table
   up to 899px would change the documented layout from 768px and every 768-899 behaviour. With (a) the words
   keep their 108px columns (widest word 0.96 of its box) and the page never scrolls sideways.
4. Item 4 (`labelPickerModel.ts`, `SheetWeekTable.tsx`): the picker name joins the visible lines with a space
   ("Category for 2026-09-29: Observed Independence Day Holiday"; "not set" kept for an empty label), and the
   trigger draws its lines with a real space text node between them (`PickerLines`, same classes as
   `LabelContent`; no visual change, the lines are blocks).
5. Item 5 (`BreakChip.tsx`): no `aria-label`; the name comes from the content: a hidden "Edit", the visible
   words, the hidden "to" beside the `aria-hidden` arrow, "suggested" (e.g. "Edit Break 1 · 10/09/2026 00:00
   to 00:15 suggested"; an error row "Edit Break 1 · 10/09/2026 00:00, minutes missing"; the message stays the
   description). The action leads, like the day buttons ("Edit 10/04 ..."), because a hidden ", edit" at the
   end reads "suggested , edit" (step 2). Deviation from the brief's example, recorded here.
6. Item 6: no change (see step 5 below for the measurements and the justification).
7. Item 7 (`styles.css`): a run's columns cast no `box-shadow` themselves; each has a `::before` layer
   (`z-index: var(--layer-under)`, new token `--layer-under: -1`, behind the cells inside the column's
   isolated stacking context, transparent, no pointer events) that casts `--elev-lift` from a box reaching
   `--lift-reach` (twice `--lift-clip`, 64px) past each inner edge; the column's unchanged clip cuts it at that
   edge. A single lifted column keeps its own shadow. A first try with `--lift-clip` (32px) left 3.6 to 4.1/255
   at the joins (the deepest layer's 28px blur still fades within 32px), hence the doubled reach.

### Step 4 - checks of the fixes (probes and targeted e2e on the build of the fix)

- Item 3 (`week-after2.txt` at 768, 800, 860, 899 and `week-after1.txt` at 768-900; ring reach read per
  control from its computed style): 0 controls not fully visible in every mode (Details off/on, batch) and
  direction (Tab, Shift+Tab; 28 stops each); the Sunday list (Enter, ArrowDown) inside the card with 2px to
  the side and 5.2px under its ring; card 850 against 736 (768) ... 828 (860), 867/867 at 899; widest word
  0.96 of its box; page never wider than the window. New e2e test (day-editor.spec.ts, "Tab, Shift+Tab and
  the picker arrows at 768, 800, 820, 860 and 899 ...") passed in 13.9s (`log-fix3-walk.txt`).
- Items 4 and 5: axe after the fix on the gate's screens and four situations (`a11y-after.txt`, 12 tests per
  project, 0 failed): 0 `label-content-name-mismatch` violations (picker on the two-line holiday cell; phone
  chips with a date, the error chip "Edit Break 1 · 10/09/2026 00:00, minutes missing"); the only serious
  violation left is item 6's `target-size` on "Today" with the account menu open at 1280 (4 scans).
  Same-day sessions never show chips at 320px and wider (rows there), so a chip without a date is covered by
  the unit tests of `breakChipText` and the e2e names, not by axe.
- Item 7 (`seam-after2.txt`): worst deviation under an inner join 2.1 to 2.8/255 (DPR 1 and 2, all five
  widths), above 0.8 to 1.2, inside the run 0.0 to 0.9 (no shadow on a lifted neighbour); the open middle
  column's frame is still painted at both inner edges (existing e2e "lifted columns form runs").
- Mutations (each reverted afterwards; the rebuild after the last revert gave the same asset hashes as before
  the mutations, `index-CZ6-3L9A.js` and `index-Bd3D83N0.css`):
  - item 3 (focus handler, card scroll padding, grid min-width, list layer and inset removed): the new
    keyboard-walk test fails at 768px, "Category for 2026-10-03: Off ... room r -4.0, scrollLeft 0"
    (`log-mut3.txt`);
  - item 7 (the run's column shadow and layer rules disabled): "lifted columns form runs" fails at "Monday
    (run start): the column itself casts no shadow in a run" (`log-mut7.txt`); with the computed-style checks
    skipped for one run (temporary line, removed), its pixel sample fails too: "under the join at x 238.00:
    200.7 against 185.1 beside it" (`log-mut7-pixel.txt`); the probe reads 23.5/255 again (`seam-mut7.txt`).

### Step 5 - item 6 outcome: justification, no placement change

- Measurement (`menu-sweep.txt`, summary `menu-summary.txt`; the panel open at 73 widths from 768 to 1920 in
  16px steps, axe at each): the panel (277.5x291.8, right-aligned under the identity button, the only place
  that keeps it attached to its button and clear of the bar, SC 2.4.11) overlaps 2 to 5 interactive controls
  at 62 of 73 widths (the period bar's Next period, Today, Review & sign off, the title row's Check in and
  the toolbar's Change several days lie directly under it); at 39 widths a covered control keeps an uncovered
  sliver under 24px; axe 4.14.0 flags `target-size` at 2 of them (1280: Today; 1440: Review & sign off), its
  spacing test passing the others. The sliver moves continuously across the controls as the window width
  changes, so any other width, right offset or alignment of the panel only moves the widths where it occurs;
  a panel that never overlaps the bar's controls would have to open away from its button (below the period
  bar or beside the page), which the account-menu design (U-04) and SC 2.4.11 placement rule out. Hence no
  placement change in `AccountMenu.tsx` or the CSS.
- Justification for the auditors: the covered target exists only while the user-opened, non-modal account
  menu is open; the page behind it is not inert (measured); a press on the uncovered sliver (1296px, Today
  992.0-1062.3, panel from 1002.5) closes the menu on pointerdown and the click reaches the control (focus
  on "Today", menu closed); Escape closes the menu and returns focus to the identity button
  (`menu-sliver.txt`). With the menu closed every control is its full size (44px high, 70.3px for Today), and
  the other 84 of the 88 scans after the fix have no violation at all (`a11y-after.txt`). The menu stays
  non-modal.

### Step 6 - static checks, unit tests, build and the full e2e suite (on the fix)

- `npm run typecheck` exit 0; `npm run lint` exit 0; `npm test` exit 0: 94 files, 2130 tests (2126 before;
  4 new `revealDelta` tests); no deprecation line in any of them (`log-typecheck.txt`, `log-lint.txt`,
  `log-npmtest.txt`).
- `npm run build` exit 0, no chunk-size advisory; main chunk `index-CZ6-3L9A.js` 485.28 kB (gzip 142.61 kB;
  base 484.26 kB), CSS 78.54 kB, lazy AdminScreen 31.54 kB and ImportScreen 23.82 kB (`log-build-5.txt`).
- FULL e2e on both projects, real clock, alone (`run-shift.sh full-real real`, own output folder; Los Angeles
  Fri 2026-10-16 06:18 to 06:34): exit 0, 615 passed, 67 skipped, 0 failed in 16.4 min; desktop 311 ok / 30
  skipped / 0 failed, mobile 304 ok / 37 skipped / 0 failed (682 tests: the gate's 680 plus the new
  desktop-only keyboard walk, skipped on mobile); 0 deprecation lines (`log-full-real.txt`,
  `full-real-counts.txt`).

### Step 7 - simulated clock (FIX10 preload unchanged), each run alone with its own output folder

A control run before every simulated instant (task-local `control.probe.ts`, both projects) shows that the
server reports the simulated `today_local` (`log-ctl-*.txt`).

Item 1, `tests/e2e/timesheet.spec.ts:878` (the lifted-column test, now at line 878) on both projects
(`log-item1-*.txt`, summary `sim-item1-summary.txt`):

| Instant (UTC) | Los Angeles | today_local / displayed period | desktop | mobile |
|---|---|---|---|---|
| 2026-10-20T17:00:00Z | Tue 10:00 | 2026-10-20 / 2026-10-12..10-25 | ok | ok |
| 2026-11-03T17:00:00Z | Tue 09:00 | 2026-11-03 / 2026-10-26..11-08 | ok | ok |
| 2026-10-13T17:00:00Z | Tue 10:00 (week 1, window) | 2026-10-13 / 2026-09-28..10-11 | ok | ok |
| 2026-10-19T17:00:00Z | Mon 10:00 | 2026-10-19 / 2026-10-12..10-25 | ok | ok |
| 2026-10-25T17:00:00Z | Sun 10:00 | 2026-10-25 / 2026-10-12..10-25 | ok | ok |
| real | Fri 2026-10-16 06:37 | 2026-10-16 / 2026-09-28..10-11 | ok | ok |

Every run: 2 passed, exit 0. Before the fix the first two instants failed with -309.6 (gate) and the first
was reproduced here (step 1).

Item 2, the five specs (today, timesheet, day-editor, shell, sharing) on the mobile project at
2026-11-28T18:00:00Z (Sat 10:00 LA; today_local 2026-11-28, displayed 2026-11-23..2026-12-06), three runs
in a row (`log-item2-five-1128-{1,2,3}.txt`, summary `sim-item2-summary.txt`):

| Run | passed | skipped | failed | `timesheet.spec.ts:452` |
|---|---|---|---|---|
| 1 | 136 | 29 | 0 | ok (1.2s) |
| 2 | 136 | 29 | 0 | ok (1.4s) |
| 3 | 136 | 29 | 0 | ok (1.1s) |

(29 skipped = the gate's 28 plus the new desktop-only keyboard walk.)

### Step 8 - extra observation (dark theme, item 7)

Not asked by the brief (its item 7 numbers are met in the light theme): the same seam probe in the dark theme
(`seam-dark.txt`, `seam-dark-rows.txt`; 1440 and 1367): DPR 1 worst 2.8 to 3.7/255; at DPR 2 one device pixel
at each join in the row of the 1px hairline ring (the first `--elev-lift` layer, bright blue at 0.28 in the
dark set) reads 6 to 7/255 darker (47 against 53; above the run 70 against 73) where the two columns' clip
edges meet at a fractional x; every other row of the dark DPR 2 profile is within 2.1/255. This is a one
device-pixel antialiasing line at the shared clip edge, not the 9px half-strength notch, and is left as a
recorded residual for the auditors.

### Step 9 - changed files, changed assertions, privacy and whitespace

Changed (all within the owned paths): `src/client/styles.css`, `src/client/components/TimesheetSheet.tsx`,
`src/client/components/SheetWeekTable.tsx`, `src/client/components/sheetModel.ts`,
`src/client/components/labelPickerModel.ts`, `src/client/components/BreakChip.tsx`,
`src/client/components/breakChipModel.ts` (comment only), `tests/e2e/timesheet.spec.ts`,
`tests/e2e/day-editor.spec.ts`, `tests/client/sheetModel.test.ts`, `tests/client/labelPickerModel.test.ts`,
this brief, and `handoff/delivery/evidence/WP5-UX3-FIX1/`. Not changed: `AccountMenu.tsx`,
`TimesheetScreen.tsx`, `fixtures.ts`, `shell.spec.ts`, `breakChipModel.test.ts`; no server, API, domain,
schema, CSP, dependency or lockfile change.

Changed assertions (none removed without an equal or stronger replacement; no `skip`, `fixme` or `.only`
added except the project-conditional `test.skip(isMobile)` of the new desktop-only describe, like the T05B
describe beside it):
- `tests/client/labelPickerModel.test.ts:63-72`: the exact picker names now use spaces ("... Synthetic Holiday
  Holiday", "... Off Work from home Leave 2:30 Note"), plus a new exact name for "Observed Independence Day
  Holiday" and a new check that no comma is left between the lines. Same exactness, new contract (item 4).
- `tests/e2e/timesheet.spec.ts:1606`: exact name with `parts.join(' ')` instead of `', '`; new checks at
  1607-1608 that the trigger's text is the lines joined by a space and is contained in the name (stronger).
- `tests/e2e/day-editor.spec.ts:630`, `:951` (`chipName`, used by eight assertions) and `:1551`: exact chip
  names "Edit Break n · ... to ... [suggested]" instead of "Break n · ... to ... [suggested], edit"; new check
  at 632 that the chip has no `aria-label` (item 5). Same exactness.
- `tests/e2e/timesheet.spec.ts:811-842` (`expectLifted`): for a lone column the column's `box-shadow` is still
  exactly `--elev-lift` and it has no `::before` layer (new); for start/mid/end the column's own `box-shadow`
  is now asserted `none` and the `::before` layer is asserted exactly (content, `--elev-lift`, absolute,
  z-index -1, no pointer events, top/bottom 0, left/right 0 or twice `--lift-clip` by run position). New pixel
  checks at 1490-1504 (the join against 14px to either side within 6/255, and darker than the gap day's row).
- `tests/e2e/timesheet.spec.ts:886` (item 1): precondition `need(..., 1)` instead of `need(..., 2)` (the second
  free workday is no longer used); the neighbour comes from `bandNeighbour` (new helper at 850-871) with a new
  same-card assertion; the 3px raise assertion is unchanged.
- `tests/e2e/timesheet.spec.ts:452-482` (item 2): new assertions on the reset start and on the moved version;
  the seed passes the day's current version instead of `null`; every earlier assertion unchanged.
- New: `tests/client/sheetModel.test.ts` (4 `revealDelta` tests), `tests/e2e/day-editor.spec.ts` describe
  "WP5-UX3-FIX1: from 768 to 899px ..." (keyboard walk).

Privacy: Grep of the changed files and of the evidence folder for e-mail addresses and user-profile paths
(`Users\`, `AppData`, the account name): none; the evidence logs keep only repository-relative paths and
`<task>`/`<repo>` placeholders (`mask-copy` reported 0 non-synthetic addresses). Whitespace: Grep `[ \t]+$`
over the changed files: 0; final newline, CR and trailing whitespace check of the 12 changed files: 0
problems (`eof-check-1.txt`); the evidence logs are LF with trailing whitespace stripped by the copy.

Deviations and slips: (1) one Bash command contained a stray `| head -c 0` inside a summary loop (a no-op
that discarded nothing needed), which breaks the "never pipe into head" rule; nothing else was piped into
head or tail; one `tail -n 30 <file> > <file>` read a file directly (no pipe). (2) Item 5's name leads with
"Edit" instead of ending with ", edit" (step 3). (3) Item 6 is a recorded justification, not a fix (step 5).
(4) axe-core 4.14.0 was installed with `npm install --no-save --prefix <task>/axe` into the task folder
(network), nothing in the repository. (5) The Playwright harness gives each server an OS-assigned loopback
port, as in the earlier gates; `SMOKE_PORT` for verify is in 48940-48959. (6) The task-local probes
(`probes/*.probe.ts`) import the repository's fixtures by relative path and run with a config in the task
folder; they never entered the repository. (7) After `npm run verify` the masked verify log was copied into
the evidence folder (under `handoff/`, outside the digest) before `npm run digest`, which was the last command.

### Step 10 - verify and digest (the last commands)

- `npm run verify` with `SMOKE_PORT=48941`, `DATA_DIR` and `DATABASE_PATH` inside the task folder: exit 0;
  typecheck, lint, 94 test files / 2130 tests, build (main chunk `index-CZ6-3L9A.js` 485.28 kB, no chunk-size
  advisory), SMOKE PASSED (`log-verify.txt`, `log-verify-exit.txt`).
- `npm run digest` exit 0: `e4659145c15f07915d05d831df0478b3026bbedb0d3ec5dc8382b3db03bfd833` (833 files,
  handoff/ excluded) (`log-digest-after.txt`). Only this brief's Results and the evidence folder (both under
  `handoff/`) were written after it, with the Edit tool; no command ran after the digest.
- Evidence: `handoff/delivery/evidence/WP5-UX3-FIX1/` (74 masked LF `.txt` files and one screenshot,
  `fix1-lift-runs-desktop-light-synthetic.png`, the e2e record of the lifted run after the fix).
- No background task of mine is left running; no server, browser or process started by me remains.

Status: done
