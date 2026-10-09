# WP5-UX-T04 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-T04; package WP5; kind implement;
  attempt 1; depends on WP5-UX-T03-FREEZE (done, b6324b7).
- Scope: slice 4 of the owner-requested UI redesign: **the day editor**. Implement plan
  section F row WP5-UX-T04:
  - desktop: a non-modal side panel (`--editor-width`) beside the sheet; it moves focus
    to its heading on open; Escape closes it; focus returns to the day's "Edit {date}"
    button;
  - phone (below 768px): a modal bottom sheet (`<dialog>`) at most 86% of the height;
  - order inside: banner, times (sessions and breaks), label and leave, figures (computed
    by the server);
  - leave typed as hours + minutes, converted to the same integer `leave_minutes` the
    API takes today (input conversion only; no business calculation);
  - one-tap "Confirm suggested breaks" that uses the existing shared `suggestBreaks` and
    the same session PUT as today;
  - an inline label picker in the sheet cell, like the Excel dropdown, implemented as a
    one-entry `POST /api/days/batch` preview followed by its commit, so the existing
    conflict confirmation and the reason rule (docs/04, AC-04) still apply.
- Owner decision E-3 (a), owner chat 2026-10-08: side panel on desktop, bottom sheet on
  phones, label pickable directly in the cell; typing times into cells is NOT wanted.
  Match the mockup artboards A3 (side panel and in-cell picker) and A4 (phone bottom
  sheet with "Confirm suggested breaks").
- Profile/routing: timesheet-worker-high (effort high), requested model opus,
  `model_override_reason` novelty (a non-modal panel plus a modal sheet over the same
  edit paths, with DST, overnight, input-zone, stale-version and reason handling, has no
  in-repo pattern; plan section F). Routing: size L, risk M (edit paths, AC-04, AC-16),
  novelty yes. Task record in English.
- Base: HEAD = origin/main = b6324b7cd0cca0d44b18f82b835387a8846bb0b1; source digest
  80bffa7ef2c6c140a7531c8e0b4cff1c4237fc6c314cf069de36a9789aa6b650. Record both before you
  start. Uncommitted coordinator files under `handoff/` are expected; never touch them.

## Read

- AGENTS.md from disk first, especially "Unified Frontend & UI/UX Standards". Load and
  apply the skills `stitch-design-taste`, `design-taste-frontend` and
  `high-end-visual-design` within the project rules (system fonts, 4px radius, the shared
  transition token, layered soft shadows, tokens only).
- `handoff/delivery/tasks/WP5-UX-PLAN.md` Results: sections A.2 (day-editor
  observations), C (accessibility: side panel focus rules, bottom sheet), E, F row T04
  and "Stable test hooks", G.
- The T02 and T03 results in `handoff/delivery/tasks/WP5-UX-T02.md` and `WP5-UX-T03.md`
  (what the sheet and toolbar now render).
- The mockup `handoff/delivery/design/WP5-UX/mockup.html` (A3, A4).
- docs/04_UX_AND_SETTINGS.md (editing, reasons, breaks, input zone), docs/02 (sessions,
  breaks, leave, DST and overnight rules), docs/10 (UX decisions, "the client computes
  no business minutes").
- The current `DayEditor.tsx`, `DayFieldsForm.tsx`, `DayFigures.tsx`, `SessionForm.tsx`,
  `BreaksEditor.tsx`, `LocalTimeField.tsx`, `sessionModel.ts`, `BatchDialog.tsx`,
  `ClockOutDialog.tsx` (read only), `TimeProblemPrompt.tsx` (read only), `api.ts`, and the
  e2e specs that drive the editor.

## Hard constraints

- No business behaviour change: no server, API or request-body change. Every save uses
  today's endpoints and bodies (`PUT /api/days/:date`, `POST /api/days/:date/sessions`,
  `PUT /api/sessions/:id`, `DELETE /api/sessions/:id`, `POST /api/days/batch`) with the
  same `expected_version`, the same reason prompts (AC-04), the same conflict
  confirmation and the same DST fold/gap and overnight prompts. The client computes no
  business minutes; the hours + minutes leave input is only converted to the integer
  minutes the API already takes, and is validated as today.
- R-07: times entered in the input zone; a device-zone change must not regroup days.
- Shared views (AC-16): a grantee with edit rights edits through the shared requester as
  today; a view-only grantee gets "View {date}" with no editing controls.
- Imported periods stay read-only with the existing reason.
- Accessibility: the panel is labelled "Day editor"; focus moves to its heading on open
  and back to the day's button on close; Escape closes; the bottom sheet traps focus as
  a modal dialog; 44px targets below 768px; no horizontal scroll at 390px.
- Keep every stable test hook in plan section F, including "Edit {date}" / "View {date}",
  the "Day editor" name, the Clock out dialog names, the radio names "Breaks not
  confirmed yet" / "Breaks confirmed as listed" / "No breaks taken", "Start time" /
  "End time", "Input zone", and "Save session" / "Save changes" / "Save day fields" (a
  rename is allowed only if applied to every test in this task). No e2e assertion is
  removed or weakened.

## Owned paths

- `src/client/DayEditor.tsx`
- `src/client/components/DayFieldsForm.tsx`, `src/client/components/DayFigures.tsx`,
  `src/client/components/SessionForm.tsx`, `src/client/components/BreaksEditor.tsx`,
  `src/client/components/LocalTimeField.tsx`
- `src/client/components/sessionModel.ts` (draft helpers only)
- `src/client/components/BatchDialog.tsx` (single-day use)
- `src/client/components/TimesheetSheet.tsx` and `src/client/components/SheetWeekTable.tsx`
  (picker hook-up only)
- `src/client/TimesheetScreen.tsx`
- `src/client/styles.css` (tokens only)
- optional new pure helper modules under `src/client/components/` for this editor (for
  example a label-picker or leave-input model); list each one you create in Results
- `tests/client/` unit tests
- `tests/e2e/` spec files (`*.spec.ts`); `tests/e2e/fixtures.ts` is NOT owned
- this brief's Results section
- `handoff/delivery/evidence/WP5-UX-T04/` (masked LF `.txt` only, plus screenshots whose
  basenames contain `synthetic`)

If another file must change (for example `ClockOutDialog.tsx`, `TimeProblemPrompt.tsx`,
`api.ts` or any server file), stop and report it instead of editing it.

## Checks (in this order; verify and digest are the LAST commands)

1. `node --version` (v24.x) as the first shell call.
2. `npm run typecheck` and `npm run lint` (typescript-eslint `no-deprecated` must pass).
3. `npm test` (unit tests for any new pure helper, including the hours + minutes leave
   conversion and its validation limits).
4. The FULL e2e suite (`npm run test:e2e`, all specs, desktop and mobile), with
   `E2E_SCREENSHOT_DIR` inside the task folder. Record passed/failed/skipped per project.
   Expected: 0 failed. The day-editor spec must still cover DST fold and gap, overnight,
   input zone, stale version and the reason prompt; sharing must cover the grantee edit
   and view-only; ot-leave must cover the leave mismatch notice; add a check that focus
   returns to the day's button after Escape.
5. Synthetic screenshots: the desktop side panel open, the in-cell label picker open,
   and the phone bottom sheet with "Confirm suggested breaks"; light mode; save them as
   `editor-*-synthetic.png` in the evidence folder (at most four). Look at them and fix
   any visual defect before the final run.
6. A Grep over your changed files and evidence for user-profile paths and email
   addresses; record the counts.
7. `npm run verify` with `SMOKE_PORT` in 47840-47849 and `DATA_DIR` and `DATABASE_PATH`
   set inside the task folder.
8. `npm run digest` LAST. If you deleted a tracked file, `npm run digest` exits 1 while
   the deletion is unstaged: then copy
   `handoff/delivery/evidence/WP5-UX-T02/digest-probe.mjs.txt` to the task folder as
   `digest-probe.mjs`, run that file with Node 24, and report its value as the probe
   digest. If any file changes after the digest, rerun verify and the digest.
9. Copy masked logs of steps 2-4, 7 and 8 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES), NO `| node`, NO `| python`, NO `node -` OR `python -`.** Six agents in this
  mission slipped on this. Write any probe to a file in the task folder and run that
  file. Never pipe server or probe output into head or tail.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX-T04`: set TEMP and TMP to it. Raw logs stay
  there; copy only masked logs into the evidence folder (`<user>` for profile paths,
  `<email>` for emails). Never touch `%LOCALAPPDATA%\timesheet-dev` data.
- No Windows user-profile path literals in source or tests.
- Never kill processes by PID. Never redirect to /dev/null or nul. Never remove anything
  recursively. Never write into the repository root.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. The
  next step is a freeze commit; the gate and independent audit come later.

## Return

At most 180 words, beginning with 'Self-reported model: ...': files added, deleted and
modified (complete list), unit and full e2e counts per project, typecheck, lint and
verify exit codes, the final (or probe) digest, the evidence files, the background-task
confirmation, and any stop, deviation or open owner question.

## Results

Self-reported model: claude-opus-5-5 (profile timesheet-worker-high).

### Step 1. Base (2026-10-08)

| Check | Command (Git Bash, Node 24 first on PATH) | Exit | Observed |
|---|---|---|---|
| Node | `node --version` | 0 | v24.21.0 |
| HEAD / origin/main | `git rev-parse HEAD origin/main` | 0 | both b6324b7cd0cca0d44b18f82b835387a8846bb0b1 |
| Status | `git status --short` | 0 | only the expected coordinator files under `handoff/` (ORCHESTRATION.json, WORKFLOW_REVISION_CHECKPOINT(.vi).md, tasks/WP5-UX-T03-FREEZE.md, evidence/WP5-UX-T03-FREEZE/, this brief) |
| Digest | `node.exe .../npm-cli.js run digest` | 0 | 80bffa7ef2c6c140a7531c8e0b4cff1c4237fc6c314cf069de36a9789aa6b650 (783 files), equal to the brief |

Skills loaded: stitch-design-taste, design-taste-frontend, high-end-visual-design. Where their landing-page
defaults conflict with the project rules, the project rules win (as in WP5-UX-PLAN section 0): system font
stack (CSP), 4px radius, existing tokens plus new custom properties only, the shared `--transition`, layered
soft shadows, no entrance or scroll animation, no icon library. Design read: redesign of an internal B2B
timesheet editor for people who know the Excel form; variance 3, motion 3, density 7 in the panel.

Reading done: plan sections A.2, C, E, F (row T04, stable hooks), G; T02/T03 results; mockup A3/A4
(PNG renders and HTML); docs/02 R-01..R-07, docs/04 editing and leave; the editor components, BatchDialog,
ClockOutDialog and TimeProblemPrompt (read only), api.ts batch contract, the server batch merge rule
(`dayEntries.ts`: an omitted batch field keeps the stored value), and the e2e specs that drive the editor.

### Step 2. Source change (checkpoint)

- `DayEditor.tsx`: one native `<dialog>` named by its heading ("Day editor {weekday date}"; read-only stays
  "Day ..."). `modal=false` (from 768px): `show()`, a non-modal side panel beside the sheet (sticky in a
  2-column `.sheet-area` grid from 1200px, fixed at the right edge between 768 and 1199px). `modal=true`
  (below 768px): `showModal()`, a bottom sheet of at most 86dvh (native focus trap, inert page). Focus moves
  to the heading on open; Escape (keydown, plus the native cancel) and Close call `onClose`; the page then
  returns focus to the day's "Edit/View {date}" button (or to the opener when the day is not on the sheet).
  Order: banner (from `calculation.status` / `calculation_error`), stale/notice/error, reason, Times
  (sessions, Edit/Delete, one-tap breaks, Add session, the unchanged SessionForm), Label and leave, Figures.
  One-tap: "Confirm suggested breaks" (or "Confirm breaks as listed" for saved pending rows) and "No breaks
  taken" send `PUT /api/sessions/:id` with exactly the body the form sends after Suggest/Confirm/Save
  (start/end pinned by offset, the loaded `expected_version`, the reason); disabled until a required reason
  is typed. A `refresh` prop reloads the day after a label/batch commit changed it behind the panel.
- `DayFieldsForm.tsx`: "Label" select, WFH, partial leave as "Leave hours" + "Leave minutes" + "Leave kind",
  notes, "Save day fields"; `noValidate`, so the page's own message (role alert) explains a refused value.
- `DayFigures.tsx`: heading "Figures (computed by the server)", plain-word labels (Check, Worked on a
  workday, Worked on a day off, Eligible for OT, OT credit, Deficit); the pending/error lines moved to the
  banner. Values and `data-figure` hooks unchanged.
- `sessionModel.ts` (draft helpers only): `DayFieldsDraft.leave` (hours/minutes) replaces `leaveMinutes`;
  `buildDayEntryRequest` converts through `parseLeaveInput` to the same integer `leave_minutes` (0..1440);
  `leaveHint` takes the two fields.
- New pure helpers: `components/leaveInputModel.ts` (hours+minutes <-> integer minutes, limits 0..24 h,
  0..59 min, total <= 1440, whole numbers only), `components/dayEditorModel.ts` (`dayBanner`,
  `quickBreaksOf` with the shared `suggestBreaks`/`suggestedRows`, an instant-only check that every
  suggestion lies inside the session, `quickBreaksRequest` = `buildSessionRequest` of the confirmed draft),
  `components/labelPickerModel.ts` (choices Worked..Shutdown + "Work from home" = Worked + `wfh: true`,
  `labelEntry` = one `DayBatchEntry` with the loaded version, `labelPreviewOutcome`).
- `SheetWeekTable.tsx` / `TimesheetSheet.tsx` (picker hook-up): `DayActions.label`, `labelPickerOf`, and the
  `LabelPicker` component (button "Label for {date}: {label}", `aria-haspopup=listbox`, listbox with
  options, keyboard Enter/Space/Arrows/Home/End/Escape/Tab, click does not open the editor). Absent in
  view-only shares, imported periods and batch mode.
- `TimesheetScreen.tsx`: `.sheet-area` wrapper with the editor beside the sheet; `pickLabel` = one-entry
  `POST /days/batch` preview, then either the commit of the same entry (current day, no conflict) or the
  existing `BatchDialog` (reason and/or conflict confirmation, or a refusal); the batch-bar path is unchanged
  (entries still rebuilt from the selection at commit); focus returns to the day button / picker.
- `BatchDialog.tsx`: optional `title` (single-day use: "Review label change for {date}").
- `styles.css`: new custom properties (`--editor-gap`, `--editor-sheet-max-height: 86dvh`, `--layer-panel`,
  `--layer-popup`, `--sheet-handle-*`, `--picker-min`, `--caret-size`), the panel,
  sheet, banner, quick-breaks, leave grid and picker rules; phone column split 28/27/28/17 % so a label
  and its caret fit without breaking a word.
- Not changed: `ClockOutDialog.tsx`, `TimeProblemPrompt.tsx`, `api.ts`, every server file,
  `tests/e2e/fixtures.ts`, `SessionForm.tsx`, `BreaksEditor.tsx`, `LocalTimeField.tsx`.

### Step 3. Tests (no e2e assertion removed or weakened)

Unit: `tests/client/leaveInputModel.test.ts` (conversion, empty fields, limits 0 and 1440, refusals above
1440 / minutes >= 60 / hours > 24, non-whole input, exact round trip 0..1440), `dayEditorModel.test.ts`
(suggestions shifted by arrival and shown in the display zone, the one-tap body equals the form-flow body,
"no breaks", listed rows, short session / no policy, running or confirmed sessions, banner),
`labelPickerModel.test.ts` (choices, current choice, entry with version, WFH only for Worked / Work from
home, outcome rules incl. reason and conflicts); `sessionModel.test.ts` day-field cases moved to hours +
minutes (240 and 90 minutes, invalid inputs).

| Spec | Old assertion | New equivalent (same or stronger) |
|---|---|---|
| day-editor `openEditor` | heading "Figures from the server" | heading "Figures (computed by the server)" (plan C rename) |
| day-editor partial leave | fill "Partial leave minutes" 240, hint "Leave 4h 00m." | fill "Leave hours" 4 / "Leave minutes" 0, both start at 0, the same hint, the same stored 240 + vacation + WFH; plus 60 minutes refused in the page with nothing saved |
| day-editor (new) | | side panel non-modal beside the sheet, no sideways scroll, another day opens in it, focus on the heading, Escape and Close return focus to the day button; phone: `:modal`, bottom edge, full width, <= 86% height, no overflow, Tab never leaves the sheet, Escape returns focus |
| day-editor (new) | | one-tap "Confirm suggested breaks": banner, chips in the display zone, exactly one `PUT /api/sessions/:id` with the loaded version, same start/end, breaks 11:00/13:00/15:30 LA, status complete |
| day-editor (new) | | old period: one-tap buttons disabled until the reason; "No breaks taken" sends `breaks: []`, confirmed, with the reason |
| day-editor (new) | | picker (fresh synthetic person): exact preview + commit bodies, no dialog for a free current day, keyboard End/Enter = Work from home (Worked + wfh, version sent), Escape changes nothing, conflict day opens "Review label change for {date}" and needs the confirmation, old period asks the reason |
| sharing view-only | (kept) | plus no `[data-label-picker]` and no "Label for" button |
| sharing edit | (kept, incl. History "first" item and the review hint "1 day") | plus a picker pick on the same day through `/api/shared/:ownerId/days/batch` (preview + commit), before the notes edit; focus back on "Edit {date}" after Close |
| import | (kept) | plus no label picker in an imported period |

All other DST fold/gap, overnight, input-zone, stale-version, reason, mismatch-notice and upcoming
assertions are unchanged and pass.

### Step 4. Checks

| Check | Command | Exit | Observed |
|---|---|---|---|
| Typecheck | `npm run typecheck` | 0 | clean (`typecheck.txt`) |
| Lint | `npm run lint` | 0 | clean, typescript-eslint `no-deprecated` (`lint.txt`) |
| Unit | `npm test` | 0 | 82 files, 1808 tests passed (`unit.txt`) |
| Full e2e, run 1 | `E2E_SCREENSHOT_DIR=.../shots2 npm run test:e2e` | 0 | 153 passed, 5 skipped |
| Full e2e, run 2 | `.../shots3` | 0 | 153 passed, 5 skipped; screenshot review found "Confirm suggested breaks" wrapping to two lines in the desktop panel |
| Full e2e, final (after the fix) | `E2E_SCREENSHOT_DIR=D:/.claude-tmp/timesheet/WP5-UX-T04/shots4 npm run test:e2e` | 0 | desktop 76 passed + 3 skipped, mobile 77 passed + 2 skipped, 0 failed (the same project-gated skips as T02/T03), 5.1 min (`e2e.txt`) |
| Privacy Grep | `grep -ciE` for user-profile paths and an e-mail regex over the 19 changed/new source and test files, this brief and the evidence `.txt` | 0 | profile paths 0; e-mails: 0 added (`git diff` adds none); 1 pre-existing `payroll-sharing@example.invalid` in sharing.spec; evidence 0 |
| Verify | `SMOKE_PORT=47840 DATA_DIR=D:/.claude-tmp/timesheet/WP5-UX-T04/verify-data DATABASE_PATH=.../verify.sqlite npm run verify` | 0 | typecheck, lint, 82 files / 1808 tests, build, `SMOKE PASSED` (`verify.txt`) |
| Digest (last) | `npm run digest` | 0 | 6f362af9f9a2d09995d2c3f48d732abfce43772ae352efa40c00bf7825ffa538 (789 files = 783 + 6 new, handoff/ excluded); no file was deleted, so no probe was needed; nothing outside `handoff/` changed after it |

Visual review fixes before the final run: phone label cell broke "Worked" inside the word (caret now wraps,
no in-word break, columns 28/27/28/17 %); the bottom-sheet Close button shrank under its text (now
`flex: none`); the sheet's form header squeezed the company name beside the panel (stacked from 1200px with
the panel open); session line font reduced; one-tap actions keep one-line labels.

Evidence (`handoff/delivery/evidence/WP5-UX-T04/`, masked LF text): `typecheck.txt`, `lint.txt`, `unit.txt`,
`e2e.txt`, `verify.txt`, `digest.txt`; screenshots (light, synthetic data): `editor-panel-desktop-synthetic.png`
(side panel with banner and one-tap breaks), `editor-label-picker-desktop-synthetic.png` (in-cell picker open),
`editor-sheet-mobile-synthetic.png` (bottom sheet with "Confirm suggested breaks"),
`editor-label-picker-mobile-synthetic.png`.

### Deviations and notes

- One shell call contained an empty `cat > file <<'EOF'` heredoc (nothing fed to Node or Python; it only
  created an empty scratch file `ts-edit.mjs` in the task folder, never run). No other effect.
- New helper modules (pure, under `src/client/components/` as the brief allows): `leaveInputModel.ts`,
  `dayEditorModel.ts`, `labelPickerModel.ts`. The `LabelPicker` component lives in the owned
  `SheetWeekTable.tsx` next to `SelectBox`, used by both sheet layouts.
- Behaviour notes for the auditor: the picker's "Worked" sends `wfh: false` and "Work from home" sends
  `category: Worked, wfh: true` in the existing batch entry contract (other labels send only the category;
  the server keeps omitted fields). A label pick commits straight after its preview only when the preview
  needs no reason, no conflict confirmation and can commit; otherwise the existing BatchDialog opens. The
  one-tap button is offered only when every suggested break lies inside the saved session (an instant
  comparison, no minutes); otherwise only "No breaks taken" and Edit. `DayFieldsForm` is `noValidate`, so
  an out-of-range leave value shows the page message instead of the browser bubble. Read-only partial
  leave now reads `4h 00m (vacation)` instead of `240 min (vacation)`.
- Open owner question: none. The mockup's "Ends the next day" checkbox, "Change zone" link and
  "Save time" / "Save day" labels were not adopted: the explicit end date (docs/04), the visible
  "Input zone" field and the stable save-button names are kept.

### Files changed across the whole task

- Added: `src/client/components/leaveInputModel.ts`, `src/client/components/dayEditorModel.ts`,
  `src/client/components/labelPickerModel.ts`, `tests/client/leaveInputModel.test.ts`,
  `tests/client/dayEditorModel.test.ts`, `tests/client/labelPickerModel.test.ts`, the evidence folder above.
- Deleted: none.
- Modified: `src/client/DayEditor.tsx`, `src/client/TimesheetScreen.tsx`,
  `src/client/components/BatchDialog.tsx`, `src/client/components/DayFieldsForm.tsx`,
  `src/client/components/DayFigures.tsx`, `src/client/components/SheetWeekTable.tsx`,
  `src/client/components/TimesheetSheet.tsx`, `src/client/components/sessionModel.ts`,
  `src/client/styles.css`, `tests/client/sessionModel.test.ts`, `tests/e2e/day-editor.spec.ts`,
  `tests/e2e/import.spec.ts`, `tests/e2e/sharing.spec.ts`, this brief (Results).
- Not touched (coordinator files already modified): `handoff/delivery/ORCHESTRATION.json`,
  `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT*.md`, `handoff/delivery/tasks/WP5-UX-T03-FREEZE.md`,
  `handoff/delivery/evidence/WP5-UX-T03-FREEZE/`.

Background tasks: none were started (every command ran in the foreground and exited); `ps -ef` shows no
node, Playwright or browser process. No commit, push, install or dependency change.

Next action: freeze commit by timesheet-committer (WP5-UX-T04-FREEZE); `npm run digest` should print the
digest above.

Status: done
