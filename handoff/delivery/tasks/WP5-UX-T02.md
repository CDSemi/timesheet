# WP5-UX-T02 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-T02; package WP5; kind implement;
  attempt 1; depends on WP5-UX-T01-FREEZE (done, 3224474).
- Scope: slice 2 of the owner-requested UI redesign: **the Excel-style timesheet sheet**,
  the heart of the owner's request ("the Timesheet page should have a layout like the
  timesheet in the sample Excel file, so people used to the Excel version are not lost").
  Implement plan section F row WP5-UX-T02:
  - a pure `sheetModel.ts` that maps the server's day view to sheet cells (label text
    with holiday name, WFH and leave line; time text; OT cell by the PDF rule; Check
    status). It does no business-minute arithmetic;
  - `TimesheetSheet` (desktop: header block, two Monday-Sunday week bands with the rows
    Day, Date, Label, Time, OT, Check, CSS grid with subgrid, one `[data-day]` per day);
  - `SheetWeekTable` (below 768px: each week as a 4-column table Day | Label | Time | OT,
    one `[data-day]` row per day);
  - "Overtime Total :" from `totals.provisional_credited_minutes`, the pending note, the
    legend, the signature strip from the finalization state (labels and dates only, never
    the signature image), and "Show details" rows (worked on a workday / on a day off);
  - a display-only `formatHoursMinutes` in `src/domain/format.ts`, equal to the PDF's
    (src/server/pdf/layout.ts), so the app and the PDF print the same text. Do not touch
    the PDF code;
  - remove `TimesheetGrid.tsx` and `DayList.tsx`; `TimesheetScreen.tsx` only swaps the
    rendering (period bar, clock and batch stay for T03; the day editor stays for T04;
    keep the existing day-editor and batch entry points working).
- Owner decisions in force (all as recommended, owner chat 2026-10-08): E-1 (a) Excel
  rows plus a Check row, detail rows behind "Show details"; E-2 (a) one tint with fine
  hatching for every non-working day from the server calendar, holiday name in the label
  cell; E-4 US dates "11/23", h:mm durations, 24-hour times, as on the PDF; E-6 (a) the
  empty labelled manager signature line. Label wording keeps the app categories.
- Profile/routing: timesheet-worker-high (effort high), requested model opus,
  `model_override_reason` novelty (an Excel-faithful sheet with subgrid, mobile tables
  and a new display mapping has no in-repo pattern; plan section F; docs/08 rubric).
  Routing: size L, risk M, novelty yes. Task record in English.
- Base: HEAD = origin/main = 32244744ff37835603a1c2685ef2eb4e4d78861f; source digest
  b5cdb2d469506b978847eadf41815b8b9fe72c0e585602b99f81d350cc96a41b. Record both before you
  start. Uncommitted coordinator files under `handoff/` are expected; never touch them.

## Read

- AGENTS.md from disk first, especially "Unified Frontend & UI/UX Standards". Load and
  apply the skills `stitch-design-taste`, `design-taste-frontend` and
  `high-end-visual-design` within the project rules (system fonts, 4px radius, shared
  transition token, layered soft shadows, tokens only).
- `handoff/delivery/tasks/WP5-UX-PLAN.md` Results: section B (Excel layout map: every
  element, its API field, the formulas NOT reproduced), section C (design direction,
  sheet tokens, accessibility, mobile behaviour), section E, section F row T02 and the
  "Stable test hooks" paragraph, section G.
- The mockup `handoff/delivery/design/WP5-UX/mockup.html` (A1 desktop sheet, A2 phone
  tables, A7 day states). Match it; do not copy its synthetic data into the app.
- docs/04_UX_AND_SETTINGS.md, docs/02 (only what the sheet displays), docs/03 (client
  and API boundary), docs/10 (UX decisions, "the client computes no business minutes").
- The current `TimesheetScreen.tsx`, `TimesheetGrid.tsx`, `DayList.tsx`, `DayStatus.tsx`,
  `dayModel.ts`, `format.ts`, `api.ts` types, `styles.css` (T01 tokens), the PDF layout
  `src/server/pdf/layout.ts` (read only), and the e2e specs that use the grid.

## Hard constraints

- No business behaviour change: no server, API, request-body or calculation change; the
  only domain change is the display formatter. The client computes no business minutes:
  every number on the sheet comes from the server payload. Where the Excel form shows a
  value the server does not provide (weekly subtotals, ISO week number), leave it out.
- Never reproduce the Excel formulas listed in plan section B as conflicting (daily OT
  as end-start minus 8.5 h, the Sunday-excluding decimal total, TODAY() dates, seeded
  weekend times).
- R-07: times in the display zone and dates by the saved accounting dates; a device-zone
  change must not regroup days.
- Privacy: no signature image on the Timesheet page; shared view shows only what it shows
  today; owner-only controls stay absent for grantees (AC-16).
- Accessibility: each day is one `[data-day]` element with role group and an accessible
  name; each cell has a visually hidden row name; the visual row-label column is
  aria-hidden; keyboard order Mon..Sun, week 1 then week 2; status never by colour alone;
  44px touch targets below 768px; no horizontal scroll at 390px.
- Keep every stable test hook in plan section F (`[data-day]` exactly 14 per period,
  "Edit {date}" / "View {date}", "Select {date}", `data-grid-status*`, `data-review-link`,
  and the rest). No e2e assertion is removed or weakened; a changed label or selector is
  replaced by its new equivalent.

## Owned paths

- `src/client/components/TimesheetSheet.tsx` (new), `src/client/components/SheetWeekTable.tsx`
  (new), `src/client/components/sheetModel.ts` (new)
- `src/client/components/TimesheetGrid.tsx` and `src/client/components/DayList.tsx`
  (delete: one `rm` per file with its literal path; if a deletion is denied, stop and
  report)
- `src/client/components/DayStatus.tsx`, `src/client/components/dayModel.ts`,
  `src/client/components/format.ts`
- `src/domain/format.ts` (the display formatter only)
- `src/client/TimesheetScreen.tsx` (rendering swap only)
- `src/client/styles.css` (a sheet section using tokens; add tokens to the token block
  only if section C names them)
- `tests/client/sheetModel.test.ts` (new), `tests/client/dayModel.test.ts`,
  `tests/domain/engine.test.ts` (formatter cases next to `formatDuration`)
- `tests/e2e/` spec files (`*.spec.ts`) for selector and label updates caused by the
  sheet, with no weakened assertion. `tests/e2e/fixtures.ts` is NOT owned.
- this brief's Results section
- `handoff/delivery/evidence/WP5-UX-T02/` (masked LF `.txt` only, plus optional
  screenshots whose basenames contain `synthetic`)

If another file must change, stop and report it instead of editing it.

## Checks (in this order; verify and digest are the LAST commands)

1. `node --version` (v24.x) as the first shell call.
2. `npm run typecheck` and `npm run lint` (typescript-eslint `no-deprecated` must pass).
3. `npm test`, including the new `sheetModel` unit tests: every label, OT and Check
   mapping including holiday, WFH, OT leave, running session, incomplete,
   calculation_error and imported days; and the formatter cases.
4. The FULL e2e suite (`npm run test:e2e`, all specs, desktop and mobile). Record
   passed/failed/skipped per project. Expected: 0 failed. The timesheet spec must cover
   14 days, zones, statuses, h:mm, no "none" placeholders, 44px targets and no
   horizontal scroll at 390px.
5. Synthetic screenshots of the new sheet: desktop 1280x800 and phone 390x844, light and
   dark, saved as `sheet-*-synthetic.png` in the evidence folder (e2e screenshots land
   in the OS temp dir: copy only the ones you need).
6. A Grep over your changed files and evidence for user-profile paths and email
   addresses (the precommit reads only staged files; the freeze committer runs it).
7. `npm run verify` with `SMOKE_PORT` in 47820-47829 and `DATA_DIR` and `DATABASE_PATH`
   set inside the task folder.
8. `npm run digest` LAST. If any file changes after it, rerun verify and the digest.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN. NEVER USE A HEREDOC, NOT EVEN
  AN EMPTY ONE.** Earlier agents (including the T01 worker) did this by mistake and left
  or risked looping background tasks. Write any probe to a file in the task folder and
  run that file. Never pipe server or probe output into head or tail.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX-T02`: set TEMP and TMP to it. Raw logs stay
  there; copy only masked logs into the evidence folder (`<user>` for profile paths,
  `<email>` for emails). Never touch `%LOCALAPPDATA%\timesheet-dev` data.
- No Windows user-profile path literals in source or tests.
- Never kill processes by PID. Never redirect to /dev/null or nul. Never remove anything
  recursively. Never write into the repository root.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step. Do not commit or push; do
  not install or change dependencies.

## Return

At most 180 words, beginning with 'Self-reported model: ...': files changed (added,
deleted, modified), unit and full e2e counts per project, typecheck/lint/verify exit
codes, the final digest, background-task confirmation, and any stop, deviation or open
question for the owner.

## Results

Self-reported model: claude-opus-5-5 (profile timesheet-worker-high). Status: done.

### Step 1. Base (2026-10-08)

| Check | Command (Git Bash, Node 24 first on PATH) | Exit | Observed |
|---|---|---|---|
| Node | `node --version` | 0 | v24.21.0 |
| HEAD / origin/main | `git rev-parse HEAD origin/main` | 0 | both 32244744ff37835603a1c2685ef2eb4e4d78861f |
| Status | `git status --short` | 0 | only the expected coordinator files under `handoff/` |
| Digest | `node.exe .../npm-cli.js run digest` | 0 | b5cdb2d469506b978847eadf41815b8b9fe72c0e585602b99f81d350cc96a41b (779 files) |

Skills loaded: stitch-design-taste, design-taste-frontend, high-end-visual-design. Where their landing-page
defaults conflict with the project rules, the project rules win (as in WP5-UX-PLAN section 0): system font stack
(CSP), 4px radius, existing tokens only, the shared `--transition`, no entry or scroll animation. Design read:
redesign of an internal B2B timesheet for people who know the Excel form; variance 3, motion 3, density 8 on the
sheet.

### Step 2. Source change and unit tests

- `rm` of `src/client/components/TimesheetGrid.tsx` and `src/client/components/DayList.tsx` (one literal path
  each): exit 0, exit 0.
- New: `sheetModel.ts` (pure display mapping, h:mm via `formatHoursMinutes`, no minute arithmetic),
  `TimesheetSheet.tsx` (desktop grid with subgrid, form header, Show details, foot, signature strip),
  `SheetWeekTable.tsx` (phone 4-column table per week). `DayStatus.tsx` now holds the shared cell contents and
  `CheckBadge` (the old `PendingOtBadge` with its "none" is gone). `dayModel.ts` loses the week grouping (moved to
  `sheetWeeks`). `src/domain/format.ts` gains the display-only `formatHoursMinutes`. Client `format.ts` gains
  `usDate`/`usShortDate`. `styles.css`: grid/day-list rules removed, a sheet section added (tokens of section C
  only; a few sheet-scoped custom properties such as `--sheet-days: 7`, `--col-day: 30%`).
- `TimesheetScreen.tsx`: the grid/list swap becomes `<TimesheetSheet>`; the footnote sentence moved into the
  sheet foot. One non-rendering line changed: `useGridStatus(...)` is replaced by `usePeriodState(...)` +
  `gridStatus(...)` so the sheet can show the signature lines from the same finalization read (same two GET
  routes, same request count). `useGridStatus` in `SubmissionStatus.tsx` (not owned) is now unused; left in
  place for T03, which owns that file.

| Check | Exit | Observed |
|---|---|---|
| `npm run typecheck` | 0 | clean |
| `npm run lint` | 0 | clean (typescript-eslint `no-deprecated`) |
| `npm test` | 0 | 78 files, 1783 tests passed (new `tests/client/sheetModel.test.ts`; `weekGroups` cases moved there; formatter equality with the PDF's `formatHoursMinutes` for 0..3000 in `tests/domain/engine.test.ts`) |

### Step 3. E2E selector and label updates (no assertion removed or weakened)

| Spec | Old assertion | New equivalent (same or stronger) |
|---|---|---|
| timesheet | `table.grid` 1/0, `.day-list` 0/1 | `[data-sheet="desktop"]` 1/0, `[data-sheet="phone"]` 0/1; plus form header, 2 week bands x 7 `[data-day]`, Overtime Total equal to `formatHoursMinutes(totals.provisional_credited_minutes)` from the API, signature region |
| timesheet | day row contains the ISO period start | the day's accessible name ends with the ISO date, the cell shows `MM/DD`, and the row has the button "Edit {date}" |
| timesheet | `complete`, `8h 00m`, not `pending OT`; `confirm breaks`, `pending OT` | `Complete`; OT value equals the API credited minutes as h:mm; OT cell has no "pending"; "Show details" (aria-pressed) shows the regular detail equal to the API value and literally `8:00` for 14 days; `Confirm breaks`; `[data-ot="pending"]` = `pending` |
| timesheet | (new) | zones: the complete day's time range equals a test-side `Intl` oracle in the display zone and is not the seed's reporting-zone `09:00-18:00`; no `none` on the sheet; light and dark sheet screenshots |
| day-editor 732-742 | `missing record`; `upcoming`; not `missing record`; not `pending OT` | `No times` plus `[data-check="missing"]`; `Upcoming` plus `[data-check="upcoming"]`; neither `No times`, `Missing record` nor `[data-check="missing"]`; no `[data-ot="pending"]` and no `pending` text |
| isolation 107, 187 | not `complete` | not `Complete` and no `[data-check="complete"]` |
| shell 76-77 | `complete`, `8h 00m` | `Complete` plus `[data-check="complete"]`; Show details then regular detail `8:00` |
| history-settings 261-262 | desktop `table.grid caption [data-grid-status="line"]` 1, phone `table.grid` 0 | the status line is inside `[data-sheet=<layout>]` on both projects and the other layout is absent; plus the signature line says "Signed by" and the sheet has no `img` |
| sharing 243, 323 | (kept) | plus no `[data-signature]` or `[data-sheet-review-link]` in shared views (AC-16) |
| import 213 | (kept) | plus no signature lines or sheet review link for an imported period |

### Step 4. Full e2e, first run, and visual review

`E2E_SCREENSHOT_DIR=D:/.claude-tmp/timesheet/WP5-UX-T02/shots npm run test:e2e` (build, then all specs, both
projects): exit 0, 150 tests: 145 passed, 5 skipped (the project-gated tests: 3 mobile-only on desktop, 2
pdf-visual on mobile), 0 failed; desktop 72 passed + 3 skipped, mobile 73 passed + 2 skipped; 4.8 min.

Visual review of the synthetic screenshots found and fixed: the phone OT column broke "pending" into two lines
(columns 30/25/28/17 %, OT text no longer breaks inside a word); the signature-strip link kept the
`.button-link` border (selector specificity); the pressed "Show details" state was too faint (inset accent
ring); the dark screenshot was taken mid-transition after the theme switch (`animations: 'disabled'`).

### Step 5. Full e2e, second run, after the visual fixes

`E2E_SCREENSHOT_DIR=D:/.claude-tmp/timesheet/WP5-UX-T02/shots2 npm run test:e2e`: exit 0, 145 passed, 5 skipped
(same project-gated tests), 0 failed; desktop 72 + mobile 73 passed; 5.8 min. Log:
`D:/.claude-tmp/timesheet/WP5-UX-T02/e2e-2.txt`. `npm run lint`: exit 0 (`lint-2.txt`).

Screenshots re-checked: phone OT "pending" stays on one line; the signature-strip link has no border; the dark
sheet renders fully in dark colours. Known, not fixed: in the phone full-page capture the fixed top bar
("C&D Semi") appears once mid-image, a Playwright full-page stitching artifact of a `position: fixed` header, not
a layout defect.

### Step 6. Evidence, privacy scan, verify, digest

| Check | Command | Exit | Observed |
|---|---|---|---|
| Typecheck (rerun after the last spec edit) | `npm run typecheck` | 0 | clean (`typecheck-2.txt`) |
| Lint | `npm run lint` | 0 | clean (`lint-2.txt`) |
| Unit | `npm test` | 0 | 78 files, 1783 tests passed (`unit.txt`; CSS and e2e-spec edits after it do not affect unit tests; verify reran them with the same counts) |
| Full e2e (2nd run) | `npm run test:e2e` | 0 | desktop 72 passed + 3 skipped, mobile 73 passed + 2 skipped, 0 failed (`e2e-2.txt`) |
| Check 6, privacy Grep | `grep -ciE` for Windows and Git Bash user-profile paths, the profile name, and email addresses over the 19 changed source/test files, this brief and the evidence `.txt` files | 0 | profile paths: 0 hits; emails: 0 in evidence (masked as `<email>`), 3 in tests (`manager-history@`, `payroll-history@`, `payroll-sharing@` on `example.invalid`), all pre-existing at HEAD, none added by this task (the diff's only `@` lines are hunk headers) |
| Check 7, verify | `SMOKE_PORT=47823 DATA_DIR=D:/.claude-tmp/timesheet/WP5-UX-T02/verify-data DATABASE_PATH=.../verify-data/verify.sqlite npm run verify` | 0 | typecheck, lint, 78 files / 1783 tests, build, `SMOKE PASSED` (`verify.txt`) |
| Check 8, digest | `npm run digest` | 1 | DEVIATION: `scripts/source-digest.mjs` (not owned) lists files with `git ls-files --cached`, which still includes the two unstaged deletions, and `git hash-object --stdin-paths` fails on `src/client/components/DayList.tsx` (`digest.txt`). Not fixed (file not owned; staging is the committer's step) |
| Check 8, digest equivalent | `node D:/.claude-tmp/timesheet/WP5-UX-T02/digest-probe.mjs` (same algorithm, also skips `git ls-files --deleted`) | 0 | `1789a8be51e0339ecc96ddc26d3e59c0eabfa8a5ae362feb3144bdbbdd43b434  (781 files, handoff/ excluded)`; 781 = 779 at base - 2 deleted + 4 new. Equals what `npm run digest` prints once the deletions are staged (`digest-probe.txt`, script copy `digest-probe.mjs.txt`). No file outside `handoff/` changed after it |

Evidence (`handoff/delivery/evidence/WP5-UX-T02/`, masked LF text): `typecheck-2.txt`, `lint-2.txt`, `unit.txt`,
`e2e-2.txt`, `verify.txt`, `digest.txt`, `digest-probe.txt`, `digest-probe.mjs.txt`; screenshots from the second
e2e run: `sheet-desktop-light-synthetic.png`, `sheet-desktop-dark-synthetic.png`, `sheet-phone-light-synthetic.png`,
`sheet-phone-dark-synthetic.png` (all four variants exist; the phone ones are the e2e `mobile` project at 390px).

Background tasks: both e2e runs and every other command finished (the last background task exited 0); no
node, Playwright or browser process is running (`ps -ef` count 0).

### Files changed across the whole task

- Added: `src/client/components/TimesheetSheet.tsx`, `src/client/components/SheetWeekTable.tsx`,
  `src/client/components/sheetModel.ts`, `tests/client/sheetModel.test.ts`, the evidence folder above.
- Deleted: `src/client/components/TimesheetGrid.tsx`, `src/client/components/DayList.tsx`.
- Modified: `src/client/TimesheetScreen.tsx`, `src/client/components/DayStatus.tsx`,
  `src/client/components/dayModel.ts`, `src/client/components/format.ts`, `src/client/styles.css`,
  `src/domain/format.ts`, `tests/client/dayModel.test.ts`, `tests/domain/engine.test.ts`,
  `tests/e2e/day-editor.spec.ts`, `tests/e2e/history-settings.spec.ts`, `tests/e2e/import.spec.ts`,
  `tests/e2e/isolation.spec.ts`, `tests/e2e/sharing.spec.ts`, `tests/e2e/shell.spec.ts`,
  `tests/e2e/timesheet.spec.ts`, this brief (Results).
- Not touched by this task (coordinator files already modified before it): `handoff/delivery/ORCHESTRATION.json`,
  `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT*.md`, `handoff/delivery/tasks/WP5-UX-T01-FREEZE.md`,
  `handoff/delivery/evidence/WP5-UX-T01-FREEZE/`.

Next action: freeze commit by timesheet-committer (stage the two deletions with the rest; `npm run digest` then
works and should print the digest above).
