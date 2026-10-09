# WP5-UX-PLAN dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-PLAN; package WP5; kind plan;
  attempt 1; no task dependency (WP5 is accepted; this opens an owner-requested UI
  change round before pilot activation).
- Owner request (chat, 2026-10-08, Vietnamese, paraphrased in English): "The current UI
  design is hard to understand and too hard to use. I want a more beautiful and friendly
  design. In particular the Timesheet page should have a layout like the timesheet
  layout in the sample Excel file, so people used to the Excel version are not lost when
  they use the app."
- Baseline: HEAD and origin/main are expected at
  fe67f9400e59ae7c10b9ac8871b4dea10b83860d; the accepted WP5 source is 014bd47 with source
  digest 150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61. Record the
  HEAD, `git status --short` and the digest you observe (`npm run digest` with Node 24).
  Uncommitted files under `handoff/` (board, checkpoint, this brief) are expected and must
  be preserved. Report any other difference; do not stop for it, because this task is
  read-only for source.
- Routing: size L, risk M, novelty yes. Profile timesheet-planner (effort high, fixed by
  the profile); requested model opus, `model_override_reason` novelty (a cross-screen
  visual redesign and an Excel-faithful timesheet grid have no in-repo pattern; the
  design quality of this plan decides the whole round; docs/08 rubric).
- Record in English. Begin your returned result with 'Self-reported model: ...'.

## Hard rules

- No edits to application source, tests, docs, configuration or shared state. Write only
  the owned paths below. No commit, push, install or dependency change.
- NO STDIN SCRIPTS: never feed a script to python or node through stdin (`-`, heredocs,
  pipes). Earlier agents left looping background tasks this way. Write any probe to a
  file in the temp folder and run that file.
- Never use cmd.exe (with or without /c) or an interactive shell. Run npm/node from Git
  Bash with Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
  Record `node --version` (must be v24.x). Never kill processes by PID; never pipe server
  or probe output into head/tail.
- Raw command output goes only to `D:\.claude-tmp\timesheet\WP5-UX-PLAN\` (create it).
  Copy into the repository only masked material: user-profile paths as `<user>`, emails as
  `<email>`.
- Running the app is optional. If you do, use a fresh database under the temp folder with
  BOTH `DATA_DIR` and `DATABASE_PATH` set explicitly there, the documented synthetic
  `npm run seed` path, an unusual free port (for example 4719), local mail capture only,
  and a self-closing script that stops its own server. Screenshots are synthetic only and
  their basenames must contain `synthetic` (the precommit privacy rule).
- The sample workbook `reference/inputs/Timesheet_Rev8_2026.xlsx` is a sanitized template.
  Prefer `reference/inputs/README.md`, the docs and the existing WP4 workbook import code
  to learn its layout. If you must read the .xlsx itself, write a small probe file in the
  temp folder that uses a dependency already in `node_modules` (or the zip/XML parts
  directly) and run it with Node 24. Copy no Excel author or path metadata.

## Read

- AGENTS.md from disk first, especially the "Unified Frontend & UI/UX Standards" section
  (the skills `stitch-design-taste`, `design-taste-frontend`, `high-end-visual-design`:
  load and apply them for the design direction and the mockup).
- docs/04_UX_AND_SETTINGS.md (primary), docs/01, docs/02 (only what the timesheet grid
  displays: day status, sessions, breaks, worked/OT/credit figures), docs/03 (client and
  API boundaries), docs/06 (UI-related acceptance criteria and the e2e gate), docs/10
  (UX decisions already recorded, for example the WP2-T09 grid/mobile list split and
  "the client computes no business minutes").
- reference/inputs/README.md and the workbook template.
- src/client/ (all screens, components, styles.css tokens, api.ts types), and the e2e
  tests under tests/e2e/ that depend on labels, roles and selectors.
- The board (read-only): `owner_decisions`, `coordinator_decisions`, `governance_backlog`
  for prior UI decisions.

## Required output

Write the plan under "Results" below in this file, and the mockup under
`handoff/delivery/design/WP5-UX/`.

A. **Current UI diagnosis.** Inventory each screen/route and its main components. List the
   concrete usability problems you observe (navigation, information hierarchy, wording,
   density, number of steps for daily tasks such as clock in/out, editing a day,
   reviewing and signing a period, OT use). Separate observations (with file:line or
   screenshot evidence) from assumptions.
B. **Excel template layout map.** Describe the workbook's timesheet sheet(s): header block
   (person, period, department/fields), the day-by-day table (each column in order, with
   its meaning), weekend/holiday marking, totals rows, OT/credit summary, notes and the
   signature/approval block. For each element give the app data that would fill it (API
   field and endpoint, or "not available"). Flag every element the client would have to
   compute: the client computes no business minutes, so such values must come from the
   server or stay out. Flag any Excel formula that conflicts with the canonical rules
   (AGENTS rule 8): show the canonical value, never the inherited formula.
C. **Design direction.** Principles, information architecture and navigation, the visual
   system as CSS custom properties extending `src/client/styles.css` (4px radius token,
   layered soft shadows, the shared 300ms ease-out transition token, spacing and type
   scale, colour roles for day states), accessibility (contrast, keyboard, focus), and the
   mobile-first behaviour of the Excel-style grid (what the narrow layout shows).
D. **Mockup.** A self-contained static HTML file
   `handoff/delivery/design/WP5-UX/mockup.html` (inline CSS, no network fonts, scripts
   or CDN; synthetic data only, for example a person named "Example Employee" and
   `@example.invalid` addresses). Show at least: the redesigned Timesheet page in the
   Excel-like layout for one full period (desktop), the same page at a narrow mobile
   width, the editing interaction for one day, and the app shell/navigation. Add other
   screens only if your diagnosis shows they are the main pain points. Keep UI labels in
   the app's current UI language; add a short owner-facing caption per artboard in
   Vietnamese explaining what changed and why (human-facing text). The file must be
   readable when opened directly from disk.
E. **Owner decisions.** The few choices the owner must confirm before implementation
   (for example which Excel columns to keep, colour of weekend/holiday rows, whether
   editing happens inline in the grid or in a side panel), each with options and a
   recommendation.
F. **Implementation slicing.** Bounded tasks (IDs WP5-UX-T01, ...), each with size, risk,
   novelty, profile and model per docs/08, exact owned paths, dependencies, the tests and
   e2e selectors it must update, and its freeze point. One source writer at a time. State
   whether any server/API change is needed (that raises risk; name it). Name the gate the
   round needs before a fresh independent audit (verify, lint `no-deprecated`, e2e flows,
   the AC-13 checks it touches) and what the auditor must re-check because the accepted
   WP5 digest changes.
G. **Risks and constraints.** No business-behaviour change, privacy of personal data in
   the UI, PDF output unaffected, translation of any changed docs, and anything that would
   reopen accepted architecture (do not propose that without flagging it).

## Owned paths

- handoff/delivery/tasks/WP5-UX-PLAN.md (this brief; append results only)
- handoff/delivery/design/WP5-UX/ (mockup and optional synthetic screenshots or masked
  evidence)

Read-only: everything else. Temp folder: `D:\.claude-tmp\timesheet\WP5-UX-PLAN\`.

## Next step

The coordinator shows the mockup and section E to the owner. Implementation starts only
after the owner confirms the design direction.

## Results

Self-reported model: claude-opus-5-5 (profile timesheet-planner). Status: plan delivered (read-only for
source; this file and `handoff/delivery/design/WP5-UX/` are the only repository writes).

### 0. Baseline and method (observed 2026-10-08 America/Los_Angeles)

| Check | Command (Git Bash, Node 24 first on PATH) | Exit | Observed |
|---|---|---|---|
| Node | `node --version` | 0 | v24.21.0 |
| HEAD / origin/main | `git rev-parse HEAD`, `git rev-parse origin/main` | 0 | both fe67f9400e59ae7c10b9ac8871b4dea10b83860d (as expected) |
| Status | `git status --short` | 0 | M ORCHESTRATION.json, WORKFLOW_REVISION_CHECKPOINT(.vi).md, WP5_PILOT_PACKET.vi.md, tasks/GOV-RECOVERY-ACCEPT.md; ?? evidence/GOV-RECOVERY-ACCEPT/, tasks/WP5-UX-PLAN.md. All under `handoff/`, as expected; nothing else differs. |
| Digest | `node.exe .../npm-cli.js run digest` | 0 | 150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61 (779 files, handoff/ excluded), equal to the accepted WP5 digest |
| Workbook layout probe | `node D:/.claude-tmp/timesheet/WP5-UX-PLAN/probe-workbook.mjs` (reads the tracked template through the repo's own `xlsxReader.ts` and `fflate`; no docProps read) | 0 | cell/formula/merge/row dump in the temp folder |
| Workbook style probe | `node D:/.claude-tmp/timesheet/WP5-UX-PLAN/probe-styles.mjs` | 0 | fills, fonts, borders, data validations |
| Current UI capture | `node D:/.claude-tmp/timesheet/WP5-UX-PLAN/capture-current-ui.mjs` (self-closing: fresh DB, `DATA_DIR` and `DATABASE_PATH` both under the temp folder, `dist/` built 2026-10-06 after the last `src/` commit 546cdda, `cli.js seed`, port 4719, `OUTBOUND_MODE=capture`, `JOB_RUNNER=off`, installed Edge through Playwright, server stopped through its child handle) | 0 | seed exit 0, health ok, 14 `[data-day]` on both viewports, screenshots, server stopped (SIGTERM) |

Raw logs stay in `D:\.claude-tmp\timesheet\WP5-UX-PLAN\` (`baseline.txt`, `digest.txt`, `workbook-layout.txt`,
`workbook-styles.txt`, `capture.log`, `shots/`). Copied into the repository (synthetic seed user "Example Employee
Two", no e-mail address visible): `handoff/delivery/design/WP5-UX/current-timesheet-desktop-synthetic.png`,
`current-timesheet-mobile-synthetic.png`, `current-day-editor-desktop-synthetic.png`.

Skills loaded and applied (AGENTS.md "Unified Frontend & UI/UX Standards"): stitch-design-taste,
design-taste-frontend, high-end-visual-design. Where their landing-page defaults conflict with the accepted project
rules, the project rules win and this is stated: 4px radius (E-8, docs/04) instead of large squircles or pill
buttons; system font stack only, because the CSP allows no web fonts (styles.css:85) and the skills' Geist/Satoshi
cannot be loaded; no scroll-reveal or perpetual motion in a data tool (motion dial 3: hover/focus/press feedback
only, all through `--transition`); density dial 8 for the grid (cockpit-dense, mono numbers), 5 elsewhere; variance
dial 3 (the owner asked for the familiar Excel form, so symmetry is the point).

### A. Current UI diagnosis

#### A.1 Inventory (routes from `src/client/components/AppShell.tsx:13-20`, `App.tsx:117-134`)

| Route | Screen | Main components |
|---|---|---|
| (signed out) | Setup / Sign in | `SetupScreen`, `LoginForm` (App.tsx:139) |
| `#/timesheet` | Timesheet | `PeriodHeader` (period nav, badges, five zone/due facts), `ClockBar`, `OpenDay`, `BatchBar`, `TimesheetGrid` (desktop table, days as rows) or `DayList` (below 768px), footnote; dialogs `DayEditor` (`DayFigures`, `SessionForm` + `BreaksEditor` + `LocalTimeField` + `TimeProblemPrompt`, `DayFieldsForm`), `BatchDialog`, `ClockOutDialog` |
| `#/review/{payroll}` | Review and sign off | `ReviewDays` (vertical table), OT proposals, `ReviewDeficits`, evidence acknowledgement, reservations, `ReviewEnvelope`, `ReviewSignoff` |
| `#/ot` | Overtime balance and leave | balances, daily evidence, ledger table, CSV export, leave requests (`ReserveForm`, `LeaveRow`) |
| `#/history` | History | submissions/revisions (`DeliveryHistory`, `DeliveryRevision`, `DeliveryAttempts`), audit events |
| `#/import` | Import and opening balance | upload, preview, decisions, commit, opening balance |
| `#/settings` | Settings | submission settings + signature, sharing, policy versions, new policy version |
| `#/admin` | Administration (admin only) | users, holiday import, operations status, payroll exceptions |
| `#/shared/{owner}[/view]` | Shared timesheet | share bar + `TimesheetScreen` in shared mode, shared OT and revisions |

#### A.2 Observations (evidence: file:line, or the capture at HEAD fe67f94 / digest 150420e7)

Navigation and shell
- O-1 Mobile nav wraps to two lines next to the brand and the user block; the shell alone is about 110px tall at
  390px (current-timesheet-mobile-synthetic.png; `.shell-bar` flex-wrap, styles.css:158-166).
- O-2 One-off tasks sit at the same level as daily work: "Import" is a top-level item (AppShell.tsx:17) although it
  is used once per person; the review has no navigation entry and is reached only through a button in the period
  header (AppShell.tsx:13-20, App.tsx:107-110).

Timesheet page: hierarchy and density
- O-3 The first day appears 666px down on a 1440x1000 desktop and 1149px down on a 390x844 phone (capture.log); the
  phone page is 3939px tall for 14 days. Before the days come: the title and name (TimesheetScreen.tsx:222-227), the
  period header with five fact cells and a hint (PeriodHeader.tsx:47-73), Clock in/out (TimesheetScreen.tsx:232),
  "Open a day" (OpenDay.tsx), and the batch bar (TimesheetScreen.tsx:249-260).
- O-4 The period status is shown twice: badges in the period header (PeriodHeader.tsx:37) and again as "Period
  status" above the grid (TimesheetGrid.tsx:38-42, TimesheetScreen.tsx:276), loaded through two separate requests
  (`usePeriodState` and `useGridStatus` both call `loadPeriodState`).
- O-5 Five technical facts are always visible (Payroll date, Due (zone), Due your time (zone), Reporting zone,
  Display zone) plus the sentence "Dates are accounting dates in the reporting zone..." (PeriodHeader.tsx:47-73),
  even when both zones are identical (desktop screenshot shows America/Los_Angeles four times).
- O-6 The batch bar is permanently open with three disabled buttons and "0 days selected" (BatchBar.tsx:26-50),
  and every row carries a checkbox; batch editing is a rare action but takes the most screen area after the header.
- O-7 The word "none" fills empty cells: an empty day shows "none" five times (format.ts:11 `minutesText`,
  TimesheetGrid.tsx:93-94, 109-111); the eye cannot find the days that matter.
- O-8 Column names are engine vocabulary: "Accounting date", "Regular", "Off-calendar", "Credit*", "Completeness",
  "Pending OT" (TimesheetGrid.tsx:50-57); the mobile list repeats "accounting date, Work day" on every day
  (DayList.tsx:52). Developer text reaches users: "Credits post only when a revision is finalized (WP3)."
  (TimesheetScreen.tsx:289-292), "Figures from the server", "Raw regular (R)" (DayFigures.tsx:25, 38).
- O-9 The layout is the transpose of the familiar form: days are rows, facts are columns (TimesheetGrid.tsx:63-124),
  while the Excel sheet and the app's own PDF put the seven days of a week across and the facts (date, label,
  in/out, OT) down (see B). Users of the Excel form must re-learn where everything is.
- O-10 The Excel day labels are not used: the app says "Off" where the sheet leaves weekends blank, shows the holiday
  name only as a small grey note (TimesheetGrid.tsx:89) instead of in the label cell, and WFH or OT-funded leave is
  invisible in the grid (only inside the editor).

Daily tasks (number of steps, observed in code)
- O-11 Clock in / Clock out: both buttons are always shown at opposite edges (ClockBar.tsx:4-11, screenshot), with no
  running-session indicator; pressing Clock out without a running session answers "No running session found;
  reload the page." (TimesheetScreen.tsx:152). The user cannot see whether they are clocked in.
- O-12 Editing a day: Edit opens a 56rem modal (DayEditor.tsx:135) whose height is 893px desktop / 1299px phone
  (capture.log); it has two independent save buttons ("Save session", SessionForm.tsx:178; "Save day fields",
  DayFieldsForm.tsx:119) for one day, a 7-figure "Figures from the server" block above the sessions, and an "Input
  zone" free-text IANA field on every new session (SessionForm.tsx:118-135). Adding one ordinary 08:00-17:00 day
  takes: Edit, Add session, start date+time, end date+time, choose a breaks outcome, Save session (6+ steps).
- O-13 Partial leave is typed as raw minutes ("Partial leave minutes", DayFieldsForm.tsx:79-89) although docs/04
  says "Use hours/minutes"; the hours appear only as a hint.
- O-14 Reviewing and signing: the review is one long page (2417px desktop, 5711px phone) in a different visual
  language from the timesheet (ReviewDays.tsx: the same vertical table again), and nothing on it looks like the
  PDF the employee is signing, although the PDF has the Excel form (timesheetPdf.ts:174-222).
- O-15 OT use: the period total is a footnote sentence in small text (TimesheetScreen.tsx:289-292) instead of the
  "Overtime Total" box the Excel form and the PDF show; the per-day OT is in a column called "Credit*".
- O-16 Settings is one 3579px page (desktop) mixing submission, signature, sharing and work-policy versions
  (SettingsScreen.tsx:155-196). Secondary to the owner's request; listed for completeness.

Visual system
- O-17 The tokens are sound (styles.css:7-103: 4px radius, layered tinted shadows, one 300 ms ease-out transition,
  dark mode, reduced motion, 44px touch targets) and should be kept. What is missing is hierarchy, not tokens:
  every surface is the same white card, every button is the same blue (primary and secondary differ only by fill),
  there is no colour role for day states beyond `--off` for non-working rows, and type sizes span only 0.8-1.4rem.

#### A.3 Assumptions (not observed; to confirm with the owner or in a later usability check)
- S-1 Most use is daily Clock in/out on a phone and a once-per-period review on a desktop.
- S-2 People who know the Excel form read a week left to right (Mon..Sun) and look for "Overtime Total" at the
  bottom right and the signature lines at the bottom.
- S-3 Editing breaks and input zones is rare; the default display zone equals the reporting zone for the pilot
  (owner-only pilot, D-9).

### B. Excel template layout map (`reference/inputs/Timesheet_Rev8_2026.xlsx`, sheet "Timesheet")

Observed structure: columns A..AC, A is a narrow rotated row-label column, each day takes four merged columns
(B:E Mon, F:I Tue, J:M Wed, N:Q Thu, R:U Fri, V:Y Sat, Z:AC Sun; `src/server/import/templateMapping.ts:13-16`
matches). Portrait page layout view. Two week bands stacked; no notes area; no weekly subtotals.

| Excel element (cells) | Meaning / formula in the template | App data that fills it | Client computes? / conflict |
|---|---|---|---|
| A1 (merged A1:AC1) "C&D Semiconductor Services, Inc.", bold 16pt | company header | constant (same text as the PDF `COMPANY`) | no |
| A3 "TIME SHEET FOR SALARIED EXEMPT EMPLOYEES" | form title | constant (PDF `TITLE`) | no |
| C5 instructions "fill each day with Worked, Sick, Vacation, Holiday, or Shutdown" | label guidance | not needed: the label cell is a picker | no |
| C6 "Please turn in by the Tuesday before the payroll date." | due rule as text | `period.due_local_date`, `due_local_time`, `reporting_zone` (`GET /api/timesheets/:payrollDate`), shown as a real due date | no |
| E8 / I8:O8 "Employee:" + name (script font) | employee name | `user.display_name` (`GET /api/auth/me`); shared view: owner name from the share | no |
| E10 / I10:L10 "Payroll Date:" `=INDEX(Payrolls[Payroll Date],MATCH(TODAY(),...)+1)` | payroll date derived from TODAY() | `period.payroll_date`; current/old/future from `period.relation` (server, R-07, D-12) | CONFLICT: the TODAY() lookup is volatile; the app shows the selected period and the server's relation, never a device-clock derivation |
| (not in Excel; on the PDF) "Period:" start - end | period range | `period.period_start`, `period_end` | no |
| A12:A13, A19:A20 rotated `=ISOWEEKNUM(I10-14)` / `(I10-7)` | ISO week number | not in the API | would be a client derivation from a date (display, not minutes). Recommendation: show "Week 1 / Week 2" and the date range as the PDF does (timesheetPdf.ts:179-180); no new derivation |
| B12..Z12 (and row 19) weekday names, bold, shaded (fill theme 2; Sat/Sun fill theme 9 at 80% tint) | day headers | weekday from `day.work_date` (existing `WEEKDAYS`/`isoWeekday` mapping, dayModel.ts:93) | display only, already in use |
| B13..Z13 (row 20) `=$I$10-18` .. `-5` | dates | `day.work_date` (`GET /api/timesheets/:payrollDate` `days[]`) | no |
| A14 / A21 rotated "WEEK" | row label | static | no |
| B14..Z14 (row 21) tall label cell (69pt, script font), list validation `'Working Infos'!A2:A9`; weekdays `=IFERROR(VLOOKUP(date,'Holiday Dates'!A:B,2,FALSE),"Worked")`; Sat/Sun blank; R21 typed "Worked" | day label: Worked, Work from home, Off Day (Overtime Used), Shutdown, Holiday (or the holiday name), Sick Day, Vacation | `day.category` (+ `category_source` default/explicit), `day.classification.name` (holiday name), `day.wfh`, `day.leave_minutes` + `day.leave_kind` | no. Mapping: holiday name -> category Holiday + name; "Work from home" -> Worked + WFH; "Sick Day" -> Sick; "Off Day (Overtime Used)" -> no category (E-2): leave minutes with kind `ot`, shown as a second line "OT leave 8h 00m"; blank weekend -> "Off" (FR-03). Weekend default "Off" is the canonical value |
| A15:A16 rotated "OT"; B15/D15 (row 22) start and end, 30-minute list `'Working Infos'!C2:C77`, format h:mm AM/PM | one in/out pair per day | `day.sessions[]` (`start_utc`, `end_utc`, `breaks_confirmed`), formatted in the display zone (R-07, docs/04); several sessions per day allowed; running session shows "running" | no. The app is more exact (seconds, breaks, multiple sessions); 24-hour text "08:00-17:00" as on the PDF |
| B16..Z16 (row 23) `=MAX(0,(end-start)/60-8.5)` | daily OT hours | `day.calculation.credited_minutes` in h:mm for complete days; "pending" for `incomplete`/`incomplete_breaks`; blank for no record (same rule as the PDF `otCellText`, timesheetPdf.ts:156-163) | CONFLICT: 8.5 hours, no breaks, no N/M rounding, no off-calendar rule (R-04, docs/10 "Replace the earlier proposal's 8.5-hour calculation"). Show only the server's credited minutes |
| V17, Z17, AB17 / V18, Z18, AB18 near-white text `INDEX(OvertimeData[Hour],MATCH(480|930,...))` when a weekend label is set | hidden helper: default weekend times 8:00 and 15:30 | not shown | CONFLICT: seeding clock values from a schedule (docs/04 "Actual clock values are not seeded from a schedule") |
| Weekend marking: Sat/Sun header and date cells tinted, label cells light grey | non-working days by weekday | `day.classification.day_class === 'nonworking'` (server calendar: weekends, holidays, closures) | no; the client must not infer non-working from Sat/Sun. Holidays on weekdays get the non-working tint too (better than Excel) |
| N24 "Overtime Total :", X24 `=SUM($B$16:$Y$16)+SUM($B$23:$Y$23)`, Z24 "hours" | period OT total in decimal hours | `totals.provisional_credited_minutes` in h:mm, plus `totals.pending_days` note (`GET /api/timesheets/:payrollDate`); equals the PDF total (reviewPayload.ts:266-268, F-5) | CONFLICT: omits Sunday Z16/Z23 (templateMapping.ts:379-389) and uses decimal hours; canonical is h:mm over all 14 days |
| (none in Excel) weekly subtotals | - | not in the API | would be client arithmetic over minutes: keep out (no server change proposed) |
| (none in Excel) worked hours, regular/off-calendar raw minutes, completeness, deficit | - | `calculation.regular_minutes`, `nonworking_minutes`, `status`, `day.deficit_minutes` | no; optional "Details" rows (owner decision E-3) |
| (none in Excel) notes | - | `day.entry.notes` | no; a small "Note" marker in the label cell, full text in the editor |
| B26:I26 signature (script/Rage font), B27 "Employee Signature" | employee signature | review state from `GET /api/timesheets/:payrollDate/finalization`: `signoff.signer_name`, `signoff.signed_at` (manual) or `revision.origin === 'deadline'` with review pending | no. The signature IMAGE is private and stays on the review screen only (privacy, AGENTS rule 4) |
| W26:Z26 `=TODAY()`, W27 "Date" | signature date | `signoff.signed_at` in the reporting zone; automatic: revision `created_at` date in the reporting zone (R-07) | CONFLICT: TODAY() is volatile (templateMapping.ts:392-399); never TODAY() |
| B30 "Manager Signature", W30 "Date" | manager sign-off | not available (future manager portal, docs/01) | no; shown as an empty, labelled line "Manager signature (not used yet)" or omitted (E-6) |

Summary: every value the Excel-style page needs already comes from the server in `GET /api/timesheets/:payrollDate`,
`GET /api/periods/current`, `GET /api/auth/me` and the existing finalization/delivery reads. No business minute is
computed in the client; the only client derivations are the weekday name (already used) and text formatting
(`formatDuration`, zone formatting). Formulas that conflict with canonical rules and are NOT reproduced: the 8.5-hour
daily OT, the Sunday-less total, decimal hours, the TODAY() payroll date, the TODAY() signature date and the hidden
weekend default times.

### C. Design direction

Design read: redesign (preserve brand tokens, overhaul layout) of an internal B2B timesheet for C&D Semi employees who
know the Excel form; an industrial "paper form on an instrument panel" language; plain CSS custom properties, system
fonts, 4px corners. Dials: variance 3, motion 3, density 8 on the sheet and 5 around it.

Principles
1. The form is the page. The Timesheet page shows the same form as the Excel sheet and the PDF: header block, two
   Monday-Sunday week bands with the rows Day, Date, Label, Time, OT, then "Overtime Total :" bottom right and the
   signature lines. One extra row, "Check", carries the per-day status the Excel form never had.
2. One thing per level. Shell (where am I), period bar (which period, when due, its one status, Review & sign off),
   clock panel (am I clocked in, one button), sheet (the record). Everything else is on demand: batch mode, details
   rows, input zone, figures.
3. Plain words, server numbers. Engine terms stay out of ordinary flows (docs/04 "free of DB/job terminology"):
   "Regular" becomes "Worked on a workday", "Off-calendar" becomes "Worked on a day off", "Completeness" becomes
   "Check", "Figures from the server" becomes "Figures (computed by the server)". Empty values are blank cells, never
   "none". The client still computes no business minutes.
4. State is never colour alone: every status keeps text plus a shape (existing rule, DayStatus.tsx:3).

Information architecture and navigation
- Desktop top bar (56px): brand, nav Timesheet, Overtime, History, Settings (+ Admin for administrators), user and
  Sign out. Import moves into Settings (a section link "Import from Excel"); `#/import` keeps working (E-5).
- Mobile: compact top bar (52px) with brand and an account button; bottom tab bar Timesheet, Overtime, History,
  More (Settings, Import, Admin, Sign out). Each tab at least 56x44px.
- The review stays at `#/review/{payroll}` and is reached from the period bar and from the signature line.
- Shared view: unchanged routes; the share bar stays above the period bar; owner-only controls stay absent.

Visual system (extends `src/client/styles.css`; existing tokens keep their names and values)
- Keep: `--radius: 4px`, `--transition: all var(--duration) var(--ease)` with 300ms ease-out, `--shadow-panel`,
  `--shadow-overlay`, `--focus-ring`, spacing `--space-*`, `--tap-min: 44px`, dark mode block, reduced motion.
- Add (light / dark): `--sheet-rule` #cdd5df / #36404d, `--sheet-rule-soft` #e3e8ee / #29313c, `--sheet-rule-strong`
  #8d9aab / #5d6a7b, `--sheet-head` #e9eef5 / #222a35, `--sheet-head-off` #e1e6ee / #283140, `--day-nonworking`
  #f0f2f5 / #1e252f, `--hatch` (135deg 1px hairlines at 4.5% / 4% opacity, a non-colour cue), `--day-hover`,
  `--day-selected` accent at 9% / 14%, `--attention-bg` #fff4dc / #33290f with `--attention-ink` #7a4f00 / #f0c25a,
  `--accent-strong` #184e9e / #8dbbff (primary hover), `--accent-line` (secondary border), `--font-size-2xs` 0.72rem,
  `--font-size-display` 1.5rem, `--font-weight-heavy` 700, `--control-height` 36px, `--editor-width` 400px, sheet
  geometry `--sheet-label-col` 92px and row heights `--row-day` 30px, `--row-date` 30px, `--row-label` 64px (the tall
  Excel label row), `--row-time` 54px, `--row-ot` 34px, `--row-check` 30px.
- Buttons: primary (accent fill), secondary (card + accent border), quiet (accent text, no border); all use
  `--transition`, `translateY(--press-offset)` on active, `--focus-ring` on focus-visible.
- Type: system stack only (the CSP allows no web fonts); numbers, times and OT in the existing mono stack with
  tabular figures. Scale: display 1.5rem period title, 1.05rem OT values, 1rem body, 0.9rem table text, 0.8rem
  hints, 0.72rem row labels.
- Colour roles for day states: workday (card), non-working day from the server calendar (tint + hatch), today
  (3px accent top bar + "Today" tag), needs input (amber cell background on the Time cell + amber text/shape in
  Check), selected (accent tint + 2px inset ring), running (green live dot, static under reduced motion).
- Motion: only feedback (hover, press, focus) through `--transition`, plus the one semantic live indicator of a
  running session; no entrance or scroll animation.

Accessibility
- Contrast: body text and controls keep the current pairs; new pairs to verify in the gate with a contrast probe:
  `--attention-ink` on `--attention-bg` (light #7a4f00 on #fff4dc computes to about 6.5:1, above AA 4.5:1), muted text on `--day-nonworking`,
  accent on `--sheet-head`, both themes.
- Keyboard: each day exposes a date button named "Edit {date}" (the existing accessible name) and, when editable, a
  label picker; Tab order follows Mon..Sun, week 1 then week 2. The side panel moves focus to its heading on open,
  Escape closes it and focus returns to the day's date button. Batch mode checkboxes keep "Select {date}".
- Semantics: a day column is one element `[data-day]` with role group and an accessible name such as "Mon
  2026-11-23"; each cell carries a visually hidden row name ("Label", "Time", "OT"), and the visual row-label column
  is aria-hidden. A screen reader reads the sheet day by day.
- Touch: every control at least 44x44px below 768px or with a coarse pointer (existing rule, styles.css:313-333).

Mobile-first behaviour of the Excel-style grid
- Below 768px each week band becomes a 4-column table (Day | Label | Time | OT); a row is one day (`[data-day]` on the
  row), at least 54px tall, and the whole row opens the day editor. The Check status folds into the Day cell (shape)
  and the Time cell tint. No horizontal scroll at 390px (verified in the mockup render: scrollWidth 390 = clientWidth).
- Order on the phone: period card, clock card (single full-width button), the sheet, Overtime Total, signature card
  with "Review & sign off", bottom tab bar. The first day row appears within the first screen (today: 1149px down).
- The day editor opens as a bottom sheet (`<dialog>` modal) at most 86% of the height.

### D. Mockup

File: `handoff/delivery/design/WP5-UX/mockup.html` (self-contained: inline CSS, no script, no network font or
image; opens from disk; synthetic data "Example Employee", payroll@example.invalid / manager@example.invalid; UI
labels in English as in the app; a Vietnamese caption per artboard). The synthetic period is payroll 2026-12-11
(period 2026-11-23..2026-12-06, due Tue 2026-12-08 17:00) so that Thanksgiving Day and the Floating Holiday show the
holiday styling; credits follow R-04 (07:30-17:45 with 60 min breaks: E=75 -> 1:00; Floating Holiday 10:00-12:30
off-calendar -> 2:30; Sunday 09:00-11:00 -> 2:00; total 5:30 over 14 days including Sunday).

| Artboard | Shows |
|---|---|
| A1 desktop 1280px | app shell, period bar, clock panel, toolbar (Open a day, Show details, Change several days), the full two-week sheet, legend, Overtime Total, signature lines |
| A2 mobile 390px | top bar, period card, clock card, rotated week tables, Overtime Total, signature card, bottom tab bar (scrollable phone frame) |
| A3 desktop | side-panel day editor for a day with unconfirmed breaks (time form with suggested breaks, label and leave in hours+minutes, figures) and the inline Excel-like label picker open on another day |
| A4 mobile | bottom-sheet day editor with one-tap "Confirm suggested breaks" |
| A5 desktop | batch mode ("Change several days"): selection checkboxes in the Day cells, selected columns, sticky batch bar with the existing labels |
| A6 desktop | Review and sign off: the same sheet as "What you sign (same layout as the PDF)" plus a three-step checklist (days that need attention with the acknowledgement, email and PDF, sign) |
| A7 | token board: light and dark swatches, day states, button states, type scale, a dark week band |

Mockup verification (`node D:/.claude-tmp/timesheet/WP5-UX-PLAN/render-mockup.mjs`, installed Edge, file:// URL,
light and dark, exit 0): 0 non-file requests, 0 console errors, no em/en dash in visible text, both phone frames
scrollWidth 390 = clientWidth 390, 0 targets under 44px in A2 after one fix (the account button). Renders copied
(synthetic): `design/WP5-UX/mockup-a1-light-synthetic.png`, `mockup-a1-dark-synthetic.png`,
`mockup-a2-light-synthetic.png`, `mockup-a3-light-synthetic.png`, `mockup-a4-light-synthetic.png`.

### E. Owner decisions (recommendation first)

| ID | Question | Options | Recommendation |
|---|---|---|---|
| E-1 | Which rows does the sheet show? | (a) Excel rows Day, Date, Label, Time, OT plus a "Check" status row; detail rows (worked on a workday / on a day off) behind "Show details" on the Timesheet and always on the Review; (b) Excel rows only, status only as cell tint; (c) always show the detail rows | (a): familiar rows, status visible, numbers available for the review |
| E-2 | Colour of weekend and holiday days | (a) one light tint with fine diagonal hatching for every non-working day from the company calendar (weekends, holidays, closures), holiday name written in the label cell; (b) separate warm tint for holidays; (c) Excel's two header colours only | (a): one rule that matches the server calendar, readable without colour |
| E-3 | Where does editing happen? | (a) side panel on desktop / bottom sheet on phones, label pickable directly in the cell like the Excel dropdown; (b) keep today's modal dialog, restyled; (c) type times directly in the cells like Excel | (a); (c) is not recommended (zones, DST, overnight and breaks do not fit a cell) |
| E-4 | Formats on the sheet | dates US "11/23" (Excel, PDF) or ISO "2026-11-23" (app today); durations "1:30" (PDF) or "1h 30m" (app today); times 24-hour "08:00-17:00" (PDF) or "8:00 AM" (Excel) | US dates, h:mm, 24-hour: the same as the PDF people sign |
| E-5 | Navigation | (a) Timesheet, Overtime, History, Settings (+ Admin), Import moved into Settings and "More"; "OT" renamed "Overtime"; (b) keep the six items, restyled only | (a) |
| E-6 | Manager signature line on the Timesheet page | (a) show the empty labelled line ("Not used yet") as on Excel and the PDF; (b) omit until a manager portal exists | (a) for familiarity |
| E-7 | Scope of this round | (a) shell and tokens, Timesheet, day editor, Review; (b) also restyle Overtime, History and Settings now; (c) Timesheet only | (a); (b) as a later round once (a) is accepted |

Label wording follows the app categories (Worked, Off, Vacation, Sick, Holiday, Shutdown) with "Work from home" as a
picker shortcut for Worked + WFH and the holiday name shown in the cell; Excel's "Sick Day" and "Off Day (Overtime
Used)" are not reintroduced (E-2 of 2026-10-03 keeps OT leave as leave minutes, not a category). Say so if you want the
Excel wording instead.

### F. Implementation slicing

Server/API change: none is needed. Every value comes from existing reads; all writes use existing endpoints and
bodies (`PUT /api/days/:date`, `POST /api/days/:date/sessions`, `PUT /api/sessions/:id`, `DELETE /api/sessions/:id`,
`POST /api/days/batch`, `POST /api/clock/in|out`, the review/finalization routes) and the shared-share requester.
One shared, display-only addition in `src/domain/format.ts` (an `h:mm` formatter equal to the PDF's
`formatHoursMinutes`, src/server/pdf/layout.ts:28) is proposed so client and PDF print the same text; the PDF file
itself is not touched. Not proposed (each would raise risk and need its own task): a `running_session` field on `GET
/api/periods/current` (today the client scans the shown, current and in-progress periods, TimesheetScreen.tsx:123-136),
an atomic day+session save endpoint, weekly subtotals.

Stable test hooks every task keeps (to keep e2e churn small): `[data-day]` exactly 14 per period, accessible names
"Edit {date}" / "View {date}", "Select {date}", dialog/panel name "Day editor", "Category for selected days",
"Preview changes", "Select all", "Clear", "Open a day" / "Open day", "Clock in" / "Clock out", the Clock out dialog
names, the radio names "Breaks not confirmed yet" / "Breaks confirmed as listed" / "No breaks taken", "Start time" /
"End time", "Input zone", "Save session" / "Save changes" / "Save day fields" (or an agreed rename applied to tests in
the same task), `data-grid-status*`, `data-review-link`, `[data-review-day]` (on the review sheet), the review and
sign-off labels.

| Task | Scope | Size / risk / novelty | Profile, model | Owned paths | Depends | Tests and e2e to update | Freeze |
|---|---|---|---|---|---|---|---|
| WP5-UX-T01 | Tokens and shell: new custom properties and button variants in styles.css; desktop nav and mobile bottom tab bar with "More"; "OT" -> "Overtime"; Import reached from Settings and More (route kept) | M / M (shell on every page) / low | timesheet-worker (medium), sonnet | src/client/styles.css, src/client/components/AppShell.tsx, src/client/App.tsx, src/client/SettingsScreen.tsx (Import link only), tests/e2e/shell.spec.ts, tests/e2e/admin.spec.ts (nav lists 393, 401), tests/e2e/import.spec.ts (nav 103, 367), tests/e2e/ot-leave.spec.ts (nav 97) | owner E-5, E-7 | shell, admin, import, ot-leave specs both projects; 44px targets | WP5-UX-T01-FREEZE |
| WP5-UX-T02 | The sheet: pure `sheetModel.ts` (DayView -> sheet day: label text with holiday name / WFH / leave line, times text, OT cell by the PDF rule, check status; no minute arithmetic), `TimesheetSheet` (desktop, CSS grid + subgrid, one `[data-day]` per day) and `SheetWeekTable` (below 768px), form header, Overtime Total from `totals.provisional_credited_minutes`, pending note, legend, signature strip from the finalization state (no image), "Show details" rows; `formatHoursMinutes` in src/domain/format.ts; TimesheetGrid/DayList removed | L / M / yes | timesheet-worker-high (high), opus, override novelty | src/client/components/TimesheetSheet.tsx (new), src/client/components/SheetWeekTable.tsx (new), src/client/components/sheetModel.ts (new), src/client/components/TimesheetGrid.tsx and DayList.tsx (delete), src/client/components/DayStatus.tsx, src/client/components/dayModel.ts, src/client/components/format.ts, src/domain/format.ts, src/client/TimesheetScreen.tsx (render swap only), src/client/styles.css (sheet section), tests/client/sheetModel.test.ts (new), tests/client/dayModel.test.ts, tests/domain/engine.test.ts (formatter cases next to `formatDuration`), tests/e2e/timesheet.spec.ts (14 days, zones, statuses, h:mm, no dash, 44px, no horizontal scroll), tests/e2e/isolation.spec.ts, tests/e2e/day-editor.spec.ts (732-737 status text) | T01 freeze; E-1, E-2, E-4 | unit: every label/OT/check mapping incl. holiday, WFH, OT leave, running, incomplete, calculation_error, imported; e2e both projects | WP5-UX-T02-FREEZE |
| WP5-UX-T03 | Period bar and clock panel: one status group (keeps `data-grid-status*`), due date in words, zone note only when display and reporting zones differ, single state-aware Clock in / Clock out (running session from the loaded periods, as today), toolbar with Open a day, Show details and "Change several days" batch mode (BatchBar shown only in that mode; disabled with the imported reason) | M / M / low | timesheet-worker (medium), sonnet | src/client/components/PeriodHeader.tsx (-> PeriodBar), src/client/components/ClockBar.tsx (-> ClockPanel), src/client/components/OpenDay.tsx, src/client/components/BatchBar.tsx, src/client/components/SubmissionStatus.tsx, src/client/components/ReviewStatus.tsx (link styling only), src/client/TimesheetScreen.tsx, src/client/styles.css, tests/e2e/timesheet.spec.ts (batch tests open batch mode), tests/e2e/history-settings.spec.ts (255-262, 418-419), tests/e2e/import.spec.ts (194-206), tests/e2e/sharing.spec.ts (226-251, 284-321, 466-471), tests/e2e/day-editor.spec.ts (Clock tests) | T02 freeze | timesheet, history-settings, import, sharing, day-editor specs; AC-16 absent controls in shared view-only | WP5-UX-T03-FREEZE |
| WP5-UX-T04 | Day editor as side panel (desktop, non-modal, focus in/out) and bottom sheet (phone, modal `<dialog>`); order: banner, times, label and leave, figures; leave typed as hours + minutes (converted to the same integer `leave_minutes`), one-tap "Confirm suggested breaks" using the existing shared `suggestBreaks` and the same session PUT; inline label picker in the sheet cell implemented as a one-entry `POST /api/days/batch` preview then commit (keeps conflict confirmation and the reason rule, docs/04) | L / M (edit paths, AC-04, AC-16) / yes | timesheet-worker-high (high), opus, override novelty | src/client/DayEditor.tsx, src/client/components/DayFieldsForm.tsx, src/client/components/DayFigures.tsx, src/client/components/SessionForm.tsx, src/client/components/BreaksEditor.tsx, src/client/components/LocalTimeField.tsx, src/client/components/sessionModel.ts (draft helpers only), src/client/components/BatchDialog.tsx (single-day use), src/client/components/TimesheetSheet.tsx and SheetWeekTable.tsx (picker hook-up), src/client/TimesheetScreen.tsx, src/client/styles.css, tests/client/sessionModel.test.ts, tests/e2e/day-editor.spec.ts, tests/e2e/sharing.spec.ts (grantee edit), tests/e2e/ot-leave.spec.ts (leave entry if it types minutes) | T03 freeze; E-3 | day-editor (DST fold/gap, overnight, input zone, stale version, reason), sharing edit and view-only, ot-leave mismatch notice; keyboard focus return | WP5-UX-T04-FREEZE |
| WP5-UX-T05 | Review restyle: the sheet in read-only mode fed by the review payload (`SnapshotDay`, reporting zone as on the PDF) with detail rows always on and `[data-review-day]` kept; checklist column (attention list with the acknowledgement, deficits, reservations, email and PDF, sign) reusing the existing components and texts | M / M (sign-off screen; AC-06, AC-07 wording) / low | timesheet-worker (medium), sonnet | src/client/ReviewScreen.tsx, src/client/components/ReviewDays.tsx (-> sheet adapter), src/client/components/reviewModel.ts (row mapping only), src/client/components/ReviewFindings.tsx, ReviewEnvelope.tsx, ReviewSignoff.tsx (layout only), src/client/styles.css, tests/client/reviewModel.test.ts, tests/e2e/review.spec.ts (131-200 per-day figures), tests/e2e/submission.spec.ts | T04 freeze | review, submission, automation, history-settings specs; payload hash and expected_version unchanged | WP5-UX-T05-FREEZE |
| WP5-UX-T06 | Docs: docs/04 screens table and visual standard (Excel-form layout, mobile tables, new tokens), docs/12 release notes, both with `.vi.md`; optional GLOSSARY entry "sheet" | S / L / low | timesheet-worker (medium), sonnet | docs/04_UX_AND_SETTINGS.md, docs/04_UX_AND_SETTINGS.vi.md, docs/12_RELEASE_NOTES.md, docs/12_RELEASE_NOTES.vi.md | T05 freeze (text must match the shipped UI) | link check, translation parity | WP5-UX-T06-FREEZE |

One source writer at a time: T01 -> T02 -> T03 -> T04 -> T05 -> T06, each followed by its committer freeze. Each worker
runs `npm run verify` and the e2e specs it touched as its last commands, then the digest.

Gate (WP5-UX-GATE, timesheet-verifier, sonnet) on the T06 freeze in a clean export: `npm run verify` (typecheck,
lint with typescript-eslint `no-deprecated`, unit tests, build, smoke), `npm run test:e2e` on both projects (all
specs, not only touched ones), `git diff 014bd47..<freeze> --stat -- src/server src/domain` showing only the
`src/domain/format.ts` formatter, `pdf-visual.spec.ts` unchanged and passing, a contrast probe for the new token
pairs in both themes, synthetic screenshots of the redesigned Timesheet (desktop, mobile), day editor, batch mode and
review, the AC-13 flows that touch the UI (two-week scenario, historical correction with reason, partial OT leave,
overdue case) through the e2e specs, and the new digest.

Fresh independent audit (timesheet-auditor, xhigh, opus: never weaker than the opus authors of T02/T04) on the gate's
freeze commit. Because the accepted WP5 digest 150420e7 is superseded, the auditor must re-check: (1) no business
behaviour change (same request bodies, no server diff beyond the formatter, client computes no minutes: review
`sheetModel.ts` and the leave hours+minutes conversion); (2) R-07 (times in the display zone, dates and due time in
the reporting zone, review times in the reporting zone, zone note correctness); (3) AC-04 reason prompts on every new
edit path (inline picker, quick break confirmation); (4) AC-16 and AC-01 in the new UI (view-only shares show no edit
or batch control; owner-only clock/review absent; admin unchanged); (5) privacy (no signature image outside the
review, synthetic evidence only); (6) PDF unaffected (AC-10); (7) every changed e2e assertion keeps an equivalent check
(no weakened test); (8) accessibility (keyboard, focus return, 44px, contrast, reduced motion); (9) docs/04 and
docs/12 EN/VI parity. The pilot packet's release identity (commit and digest) must be refreshed after the accept
commit; earlier WP5 PASS audits stay as history at digest 150420e7.

### G. Risks and constraints

- Business behaviour: unchanged by design. The only new write path is the inline label picker, routed through the
  existing batch preview so conflicts with recorded work are confirmed and old periods still ask for a reason
  (docs/04, AC-04). Quick break confirmation sends the same session body as today's form.
- Client computes no business minutes: OT, worked and deficit values are server fields; the Overtime Total is
  `totals.provisional_credited_minutes`; the only conversions are display formatting and the leave hours+minutes
  input to the same integer minutes the form sends today. Weekly subtotals stay out.
- Privacy: the Timesheet page shows the signer name and date status only, never the signature image; the shared view
  keeps its share bar and owner-only absences; screenshots and mockup are synthetic.
- PDF output: no change to `src/server/pdf`; `pdf-visual.spec.ts` must pass unchanged.
- Translation: docs/04 and docs/12 change in EN and VI (T06); AGENTS.vi.md has an existing translation gap noted in
  the governance backlog (GOV-E8-AUDIT R2), not part of this round.
- Architecture: nothing reopened. Hash routes, plain CSS custom properties (E-8), React components and the one
  calculation engine stay. No new dependency (the taste skills' icon libraries are not added; text and CSS shapes are
  used). CSS subgrid needs Chromium 117+/Safari 16+/Firefox 71+, which the e2e browser (Edge) and current browsers
  meet.
- Test churn: many e2e selectors depend on today's layout; the stable-hook list in F limits it, and a weakened
  assertion is an audit finding.
- Schedule: the round supersedes the accepted WP5 snapshot (014bd47 / 150420e7); pilot activation waits for the new
  gate and audit. STATE keeps WP5 accepted at 014bd47 until then (coordinator decision of 2026-10-08).
- Uncertainties: S-1..S-3 are assumptions; no usability test with real users was run. A forgotten running session
  older than the current and in-progress periods is still not shown by the clock panel (same as today).

### Closing check

After all writes: `git status --short` shows only the expected `handoff/` changes plus the new
`handoff/delivery/design/` folder and this file; `npm run digest` (exit 0) still gives
150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61 (no source change). No commit, push, install or
shared-state edit. The temporary server of the capture script stopped (SIGTERM through its own handle).

Next step: the coordinator shows `handoff/delivery/design/WP5-UX/mockup.html` and section E to the owner; WP5-UX-T01
starts only after the owner confirms the direction (E-1..E-7).
