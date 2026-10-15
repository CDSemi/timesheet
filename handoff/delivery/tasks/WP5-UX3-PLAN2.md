# WP5-UX3-PLAN2 dispatch brief (addendum to WP5-UX3-PLAN)

- Mission/task: timesheet-software-readiness / WP5-UX3-PLAN2; package WP5; kind plan;
  attempt 1; depends on WP5-UX3-PLAN (done). The same planner agent is resumed, so the
  plan's context is available; read this brief and the owner's reply first.
- Routing: size M, risk M, novelty yes (a floating panel rule, a third dialog level).
  Profile timesheet-planner (effort high); model opus (the resumed agent); override reason
  novelty. Record in English (mockup captions in Vietnamese). Begin your returned result
  with 'Self-reported model: ...'.
- Base: HEAD = origin/main = 5c8355df8d60fdeb85b551eb0e5a09e8f18a6334 (the T06 freeze),
  source digest 0ef75a1533d9831057f42f3a7b45e0a9386792caa47b4f2c98e091d1040b7499 (817
  files). A governance worker (WP5-UX3-GOV) edits `AGENTS.md` and `AGENTS.vi.md` in
  parallel; those two files are inside the digest, so the digest may change for that
  reason only. Record `git status --short` at start and end and explain any change.

## Owner reply (chat, 2026-10-15; verbatim in the board `owner_decisions`, last entry)

English translation:

- N-1 On narrow screens (for example phones), in the "New/Edit session" window, put the
  labels "Break 1", "Break 2", ... on the line above (above the date picker); the date and
  time pickers, the minutes box and the delete button must be on one row. If there is not
  enough room, show each break only as a text chip/pill like today's "Break 1" (for
  example "( Break 1 : 10/12/2026 - 10:00 AM → 10:15 AM )"); clicking it opens a
  sub-dialog to edit these three values.
- N-2 On narrow screens, rework the spacing of the New/Edit session dialog so it is tidy:
  neither too loose nor cramped.
- G-1 (b): approved, but: no rounded corners on the week sheets; the selection columns get
  only a slight 4px radius; adjacent selected columns must not cast shadows over each
  other. "In the mockup, to show the time editor panel, the columns are squeezed so much
  that their content overlaps; I do not know whether the real app does that. If it does, I
  do not want the overlap. If the screen lacks room to show the week sheets and the panel
  at the same time, make the panel floating."
- G-2 (a) "Category". G-3 (a) automatic pre-fill with the rule rewrite of section C.
- G-4 (owner variant): if there are no breaks yet and "Confirm no breaks taken" is not
  ticked, show a notice dialog that lets the person choose: confirm no breaks, leave the
  breaks unconfirmed for now, or cancel to go back and add breaks. After this notice, if
  saving continues, the final save confirmation is still shown before saving.
- G-5 (b): "in progress" for the period that contains today during the five window days.

## Coordinator decisions (board `coordinator_decisions`, 2026-10-15)

- G-4 triggers when Save is pressed with no break listed and the box unticked. With rows
  listed, Save confirms them (U-25) and the notice is not shown.
- The break chip uses the app's 24-hour display format (E-4), for example
  "Break 1 · 10/12/2026 10:00 → 10:15"; the owner may still ask for AM/PM.
- The AGENTS wording (B2) is unchanged by G-1; the G-1 changes are document 04 and token
  values.

## Hard rules

Same as `handoff/delivery/tasks/WP5-UX3-PLAN.md` "Hard rules", with these differences:
temp folder `D:\.claude-tmp\timesheet\WP5-UX3-PLAN2\`; ports 48550-48559 only. In
particular: NO STDIN SCRIPTS (no heredocs, no `node -e`, no `| node`), never pipe into head
or tail, never redirect to /dev/null, never `rm -rf`, never cmd.exe, never kill by PID; a
fresh database under the temp folder with BOTH `DATA_DIR` and `DATABASE_PATH`; a
self-closing probe; synthetic data and `-synthetic.png` basenames only. Do not edit
`AGENTS.md` or `AGENTS.vi.md` (the GOV worker owns them now) or any source, test, doc or
state file.

## Required output (append under "Results" in this file)

1. **Measured overlap on the real app.** On the built app (rebuild into the temp folder
   only if `dist/` is older than the last client change), open the Day editor side panel
   and measure the week sheet at viewport widths 1200, 1280, 1366, 1440, 1536, 1600 and
   1920 (desktop project, both themes where layout differs): each day column's width, the
   widest content in each row (Day, Date, Category with a long holiday name, Time, OT,
   Status, detail rows when shown), and whether any text clips, overflows or overlaps.
   Say whether the owner's concern holds today and from which width it starts. Do the same
   for the mockup at 1280 and say what caused the overlap there.
2. **Floating panel rule.** A minimum readable column width (derived from item 1) and the
   rule: side by side only when sheet minimum width + panel width + gaps fit; otherwise
   the panel floats over the page (non-modal or modal: recommend one, with reasons), keeps
   the editor column visible (scroll it into view, not under the panel), and keeps the
   current behaviours: Escape order, focus return, AX-01 focus not obscured, B3-01
   deferred mode switch, the modal below 1200px. Say how it differs from today's modal
   editor and whether the two collapse into one mode. Measured thresholds, tokens, tests.
3. **Sheet shapes (G-1).** Square week-sheet corners (and what still has the radius
   scale); the 4px radius of lifted columns; adjacent lifted columns as one group whose
   shadow never falls on a neighbour (for example one shadow for a contiguous run, inner
   edges without shadow, or the shadow only below and outside the run); the editor column
   inside or beside a batch run; both themes; reduced motion; the contrast numbers that
   change.
4. **Phone break rows (N-1).** The row layout: a "Break n" line, then date, time,
   minutes and delete on one row; the measured width it needs (390, 375, 360, 320 and the
   modal dialog widths) with 44px targets; the threshold below which rows become chips; the
   chip content and accessible name; the sub-dialog (title "Break n", date, start time,
   minutes, Save/Cancel or Done, delete?), its place in the dialog stack (editor bottom
   sheet -> session dialog -> break sub-dialog -> possible gap/fold prompt or
   confirmation), focus and Escape at each level, how row errors and server `break_index`
   errors show on a chip, and how the T06 model (`editBreakRow`, `checkBreakRows`,
   `breaksSummary`) is reused unchanged. Say whether the desktop dialog also uses chips at
   narrow modal widths.
5. **Phone dialog spacing (N-2).** Concrete spacing tokens for the session dialog below
   768px (section gaps, field gaps, row gaps, padding, header and footer) with measured
   heights at 390x844 for a new session with three suggested breaks.
6. **G-4 notice.** Title, text, the three buttons ("Confirm no breaks", "Leave
   unconfirmed for now", "Go back"; refine the wording), initial focus, Escape (= Go back),
   then the final "Save this session?" confirmation with the matching summary; the mapping
   onto the T06 model (`setNoBreaks`, `allowUnconfirmed: true`); focus after "Go back"
   (Add break). Tests.
7. **G-5 pill.** "in progress" pill colours in both themes, distinct from "current",
   "old", "future" (pink) and "Draft", with computed ratios; which period gets it (server
   values only: the period that contains `today_local` while it is not the R-07 current
   period); docs/04 and docs/05 wording; tests across the window days.
8. **Mockup.** Update `handoff/delivery/design/WP5-UX3/mockup.html` in place for items
   2-7 (light and dark), and add renders with basenames `mockup-r2-<artboard>-synthetic.png`
   for the changed artboards (keep the earlier renders).
9. **Deltas.** The changes to the plan's sections E (docs), F (tests) and H (slice rows,
   owned paths, sizes, models) caused by the answers and items 1-7, as a list of replacements
   so the coordinator can brief the slices from PLAN plus PLAN2.

## Owned paths

- `handoff/delivery/tasks/WP5-UX3-PLAN2.md` (this file; append Results only)
- `handoff/delivery/design/WP5-UX3/` (update `mockup.html`, add `mockup-r2-*-synthetic.png`)
- Temp folder `D:\.claude-tmp\timesheet\WP5-UX3-PLAN2\` (outside the repository)

## Acceptance for this task

- Items 1-9 present; measurements from actual runs with the commands and files named;
  contrast computed with the stated formula.
- Privacy scan of your new or changed files recorded (only example.invalid addresses and
  synthetic names; no user-profile path).
- `git status --short` at the end equals the start plus your own files and the GOV
  worker's two files; nothing else changed.
- Nothing left running; no listener on ports 48550-48559.

## Results

(append below)

### Step 0 (2026-10-15)

Git Bash, portable Node first on PATH; raw output in `D:\.claude-tmp\timesheet\WP5-UX3-PLAN2\`
(`step0.txt`, `status-start.txt`, `digest-start.txt`, `dist.txt`), all exit 0.

- `node --version` v24.21.0; HEAD 5c8355df8d60fdeb85b551eb0e5a09e8f18a6334; `## main...origin/main`.
- `git status --short` at start (9 entries, all under `handoff/`): modified `handoff/NEXT_ACTION.md`,
  `.vi.md`, `handoff/delivery/ORCHESTRATION.json`, the two `WORKFLOW_REVISION_CHECKPOINT` files,
  `handoff/delivery/tasks/WP5-UX3-T06-FREEZE.md`; untracked
  `handoff/delivery/evidence/WP5-UX3-T06-FREEZE/`, `handoff/delivery/tasks/WP5-UX3-GOV.md`, this brief.
  AGENTS.md and AGENTS.vi.md were not yet modified at that moment.
- `npm run digest`: 0ef75a1533d9831057f42f3a7b45e0a9386792caa47b4f2c98e091d1040b7499 (817 files),
  equal to the T06 freeze.
- `dist/` was built 2026-10-15 16:25; the last client source change before it was the T06 model
  (no UI change; `styles.css` 01:43, `DayEditor.tsx` 2026-10-14), so the built UI equals the
  source UI and no rebuild was needed.
- The T06 model API was read (`src/client/components/breakRowsModel.ts`, 624 lines): `editBreakRow`,
  `addBreakRow`, `removeBreakRow`, `setNoBreaks`, `resolveBreakRow`, `breakRowEnd`, `checkBreakRows`,
  `breaksPayload` (`allowUnconfirmed`), `buildSessionDialogRequest`, `buildCheckOutDialogRequest`,
  `serverBreakRowError`, `breaksSummary`, `sessionDialogIsDirty`, `breakLabel`.

### 1. Measured overlap on the real app

Command: `node D:\.claude-tmp\timesheet\WP5-UX3-PLAN2\probe\probe-overlap.mjs <repo> <temp>\run1`
(exit 0; fresh database under `run1\data` with `DATA_DIR` and `DATABASE_PATH`, seed, own server on
port 48551 stopped through its child handle, `signal SIGTERM`). Output `run1\probe-overlap.json`,
log, screenshots `run1\shots\real-sheet-panel-{1200,1280,1366}-light-synthetic.png`.

Data: employee2, old period 06/22-07/05/2026, written through the API with a reason: two sessions
on 06/29 (08:00-12:00 and 13:00-23:30), an overnight session 06/30 22:00-07/01 02:30, 07/02 Worked
with WFH, 4h vacation leave and a note; 07/03 is the seeded holiday "Observed Independence Day" (the
longest holiday name). Show details on; measured with batch mode on and off; Day editor open on
06/30 (side panel, non-modal, 400px). Method per cell: column box, content box (width minus
padding), the widest single word of every text element measured with the element's computed font
(canvas `measureText`), any element outside its cell, and cell scroll overflow. Layout is the same
in both themes (no width depends on colour), so light only.

| Viewport | Sheet card / grid | Day column | Content box | Widest words (row) | Result |
|---|---|---|---|---|---|
| 1200, 1280, 1366, 1440, 1536, 1600, 1920 (editor open) | 752 / 720px | 89.4px | 72.4px | "22:00-02:30+1" 91.4 (Time), "Independence" 87.0 (Category), "08:00-12:00" 77.3 (Time), "pending" 49.2 (OT) | no element outside its cell, no scroll overflow, no overlap with a neighbour; but words wider than the cell are broken inside the word (`overflow-wrap: anywhere`): "Independe/nce", "22:00-02:30+/1"; times of two sessions wrap at the hyphen; "Confirm breaks" wraps under its diamond |
| 1200 (editor closed) | 1168 / 1136px | about 149px | | | no problem |

- The column width does not grow with the viewport: `.page` is capped at `--page-max: 1200px`
  (`styles.css:86, 693-697`), so from 1200px up the sheet beside the 400px panel is always 720px
  wide and every day column 89.4px. Below 1200px the editor is already a modal overlay and the
  sheet keeps its full width.
- So the owner's concern holds in part today: nothing overlaps another element in the real app,
  but at every side-by-side width (1200px and wider) long content is squeezed and broken inside
  words. The day head in batch mode wraps its selection box below the weekday (flex-wrap), which
  costs height but does not overlap.
- Mockup at 1280 (same probe, artboard A4 of the PLAN mockup): grid 816px, columns 102.3px. The
  overlap the owner saw had two causes in the mockup's own CSS: (a) the day head was a one-line
  centred flex row without wrapping, so "Thu" + "Today" tag + selection box (about 105px) overflowed
  the 90px content box on both sides and "Thu" ran over the column edge; (b) the lifted Mon, Tue and
  Wed columns each cast their full shadow, so neighbours shadowed each other. (The first PLAN render
  also had a class-name clash, `.sh.bar` against the top bar's `.bar`, that drew a grey block over
  Fri; it was fixed before the PLAN renders were saved.) Both are corrected in the PLAN2 mockup:
  0 problems at 1440 (columns 125.1px) and in the floating artboard at 1280 (columns 161.7px).

### 2. Floating panel rule

- Minimum readable column: `--sheet-col-min: 7.2rem` (108px at the 15px root). Derivation: widest
  routine word 91.4px ("22:00-02:30+1", Time row) + 16px cell padding = 107.4px; the longest
  seeded holiday word "Independence" (87px) and "Confirm breaks" also fit. Grid columns become
  `minmax(var(--sheet-col-min), 1fr)`.
- Width needed side by side: label column 92 + 7 x 108 + 2 (grid border) = 850px grid; + 32 card
  padding = 882px sheet; + 16 `--editor-gap` + 400 panel = 1298px; + 32 page padding = 1330px;
  + 17px for a classic scrollbar = 1347px. Breakpoint: **1360px** (literal in the media query and
  in `WIDE_QUERY`, which today is 1200px). From 1360px the page cap is lifted while the editor is
  open: `.page:has(.sheet-area.with-editor) { max-width: var(--page-max-editor) }` with
  `--page-max-editor: 1600px`, so at 1366 the columns are about 110.7px and at 1920 about 150px.
- Below 1360px (and down to 768px) the panel floats over the page. Recommendation: **modal** (the
  existing `showModal` side panel), not non-modal. Reasons: a non-modal panel lying over the sheet
  would hide focusable cells and buttons (WCAG 2.4.11, the reason WP5-UX-B-02 made the editor modal
  below 1200px); a modal panel keeps today's Escape order, focus move to the heading and focus
  return to the day button, AX-01 scroll padding inside the panel, and the B3-01 deferred mode
  switch unchanged; only the breakpoint moves from 1200 to 1360.
- Changes to the floating mode: a lighter backdrop `--scrim-side` (light `rgb(18 22 28 / 0.18)`,
  dark `rgb(0 0 0 / 0.38)`; the page is inert, so no contrast requirement, and the edited column
  stays readable for orientation); the panel docks on the side away from the edited column
  (`data-side="left"` when the column's centre is right of the viewport centre, for example Sat or
  Sun), so the column is never under the panel; before showing, the column is scrolled into view
  vertically (`scrollIntoView({ block: 'nearest' })`); the panel keeps `--elev-3` and
  `--radius-lg`, width `min(var(--editor-width), 100vw - 24px)`.
- One mode or two: below 1360px there is now exactly one desktop mode (the floating modal side
  panel, as today from 768 to 1199px); from 1360px the non-modal column. Phones keep the bottom
  sheet. So the old "modal below 1200px" and the requested floating panel collapse into one mode
  with a measured threshold.
- Tests: at 1280 and 1359 the editor is `:modal`, the sheet grid keeps its full width and every word
  fits its cell; at 1360, 1366, 1440 and 1920 the editor is non-modal beside the sheet, every column
  >= 108px and no word wider than its content box (the probe's check, with the holiday and the
  overnight session data from item 1); the panel docks left for a Sat/Sun column and right for a
  Mon column, and the edited column's box does not intersect the panel's box; Escape and focus
  return as today; the B3-01 test crosses 1360 instead of 1200. Desktop-project tests that keep
  using the sheet while the editor is open (marker, label picker, Today-with-editor tests) set the
  viewport to 1440 (`test.use`), because at the project's 1280 the editor is now modal.

### 3. Sheet shapes (G-1 b)

- Week sheets: `--radius-sheet: 0` on every week card (square corners; the `--elev-2` shadow stays).
  The radius scale stays everywhere else (buttons 8px, inputs and chips 6px, cards, period bar,
  editor panel, dialogs and menus 12px, pills and avatar round).
- Lifted columns: `--radius-lift: 4px`. "Lifted" = batch-selected or open in the editor.
- Runs: a pure model function (in `sheetModel.ts`) gives every day of a week its run position
  among lifted days: `single`, `start`, `mid` or `end` (consecutive days of the same week band; a
  run never spans the two weeks). CSS: `start` rounds only its outer corners and clips its shadow at
  the inner edge (`clip-path: inset(-32px 0 -32px -32px)`), `mid` has no radius and clips both
  sides (`inset(-32px 0)`), `end` mirrors `start`; `--lift-clip: 32px` covers the deepest shadow
  layer. The run then shows one shadow outside the group and none on a neighbour, also in dark,
  where the 1px accent ring of `--elev-lift` becomes one outline around the run (rendered: the
  Mon-Wed run in `mockup-r2-a4-sheet-square-runs-1440-synthetic.png`; computed clip-paths
  `inset(-32px 0px -32px -32px)`, `inset(-32px 0px)`, `inset(-32px -32px -32px 0px)`).
- The editor column inside or beside a run takes the run position like any lifted column; its
  1px accent frame moves to an inset layer on `::after` (`box-shadow: inset 0 0 0 1px accent`,
  `border-radius: inherit`), so the clipping never cuts it; the Day-cell fill and `aria-current`
  stay.
- Reduced motion: the lift is static, the 3px translate is not animated (duration 0.01ms).
- Contrast: unchanged text ratios; the frame is now inset, so it sits on the column's own surfaces:
  accent on card 6.09/6.79, on the day head 5.31/6.00, on non-working 5.53/6.40, on attention
  5.58/5.94, on the Day-cell fill 4.82/4.82 (all >= 3:1). The 4px radius and the clipped shadows
  are decorative.

### 4. Phone break rows (N-1)

- Measured native inputs (Edge headless, phone emulation 390x844, 15px font, 8px padding, 1px
  border, 44px high; `probe-inputs.mjs`, `inputs.json`; en-US and vi-VN gave the same widths):
  default `type=date` 153px, `type=time` 123px; minutes field with the placeholder "total mins"
  83.8px; "Break 3" label 43px. A row at default widths needs 153 + 123 + 84 + 44 (remove) + 3 x 8
  = 428px.
- Row layout (owner's N-1): line 1 "Break n" chip, the computed end ("ends 10:15") and the
  "suggested" tag; line 2 date, start time, minutes and remove on one row with fixed widths
  `--break-date-w: 7.6rem` (114px), `--break-time-w: 6.8rem` (102px), `--break-min-w: 5.6rem`
  (84px) and a 44px remove button: 114 + 102 + 84 + 44 + 24 = 368px, + 14px row padding and border
  = 382px. All targets 44px.
- Threshold: the break list is a size container; rows from **25.5rem (382px)**, chips below.
  List widths with 16px dialog padding: measured in the mockup 430px phone 398px (rows, line 2 on
  one row: `rowFieldsOneLine: true`), 390 358px and 320 288px (chips); computed 375 343px and 360
  328px (chips). The desktop session
  dialog (720px, list 680px) keeps the one-line row of PLAN B8 from 42rem; between 25.5 and 42rem the
  two-line row; below 25.5rem chips, whatever the device (a narrow modal at 200% zoom gets chips too).
- Chip: a full-width 44px button "Break 1 · 10/12/2026 10:00 → 10:15" (24-hour, coordinator
  decision; the arrow is `aria-hidden` with a hidden "to"), a "suggested" tag while untouched, a
  chevron; accessible name "Break 1, 10/12/2026 10:00 to 10:15, edit" (contains the visible text).
  An incomplete row reads "Break 3 · 10/12/2026 14:30, minutes missing". Chips wrap their value to
  a second line at 320px (55.8px high).
- Sub-dialog (third modal level): title "Break n"; Date, Start time, Minutes (with "Ends 12:30
  ({input zone})" computed by `breakRowEnd`), the gap/fold prompt inline when the start needs it
  (not a fourth dialog); footer "Remove break" (quiet, danger colour, left), "Cancel", "Done".
  Done applies the edit to the session draft with `editBreakRow` (nothing is sent to the server
  until the session's Save); Remove calls `removeBreakRow`; "Add break" on the chip list calls
  `addBreakRow` and opens the sub-dialog for the new row, and Cancel on a new row removes it.
  Stack on a phone: editor bottom sheet -> session dialog -> break sub-dialog; at Save the
  sub-dialog is closed, then G-4 notice and final confirmation (one at a time).
- Focus and Escape per level: sub-dialog opens with focus on Date; Escape or Cancel closes it,
  discards its local edits and returns focus to its chip; Done returns focus to the (updated) chip;
  Remove moves focus to the next chip, else the previous, else "Add break". Session dialog: Escape =
  Cancel path (discard prompt when dirty). The editor ignores Escape while any nested modal is open.
- Errors: after a refused Save, `checkBreakRows` row errors and server errors mapped by
  `serverBreakRowError` (by `break_index` -> row key) mark the chip (amber left rule and border) and
  show the message under it, linked by `aria-describedby`; focus moves to the first marked chip;
  opening it shows the same message in the sub-dialog.
- Model reuse: no change to the T06 exports; a small display helper `breakChipText(row, index,
  zone)` (new, in a UI model file) builds the chip text from `breakLabel`, the row's start field and
  `breakRowEnd`; the Save summary still comes from `breaksSummary`.

### 5. Phone dialog spacing (N-2)

Tokens below 768px: `--dialog-pad-phone: 16px` (head, body and foot side padding), head 12px
vertical with a 56px minimum, `--dialog-section-gap-phone: 20px` (between the prefill note, Time and
Breaks), `--dialog-field-gap-phone: 12px` (fields inside a section), `--break-row-gap: 8px` (rows or
chips), footer 12px with two equal 44px buttons, sticky at the bottom (safe-area padding added).
Measured on the mockup at 390x844 (`render-final.json`, artboard A8r2), new session with three
suggested breaks: head 73.4px, body 701.6px visible for 702px of content (prefill 59.7, Time 271.6,
Breaks 298.3, plus gaps and padding), foot 69px: the whole dialog fits the screen within 1px. At
430px (two-line rows) the body content is 826px (scrolls 124px with the footer fixed); at 320px
(chips wrap) 805px (scrolls 103px). No horizontal overflow at any width.

### 6. G-4 notice

- Trigger (coordinator decision): Save pressed with no break listed and the box unticked. With rows,
  Save confirms them and no notice appears.
- `alertdialog` "No breaks listed": "This session has no breaks listed, and "Confirm no breaks
  taken" is not ticked. What do you want to do?"; buttons stacked full width: "Confirm no breaks
  taken" (primary), "Leave breaks unconfirmed for now" (secondary), "Go back and add breaks"
  (secondary, initial focus); hint "Unconfirmed breaks keep OT for this day pending until you
  confirm them." Escape = Go back.
- Mapping: "Confirm no breaks taken" -> `setNoBreaks(draft, true)` (the box is ticked in the draft,
  visible after Back), then `buildSessionDialogRequest(draft, { allowUnconfirmed: false })` and the
  final confirmation with `breaksSummary(rows, true)` = "No breaks taken" plus the sentence "Saving
  confirms these breaks as the breaks you took."; "Leave breaks unconfirmed for now" ->
  `buildSessionDialogRequest(draft, { allowUnconfirmed: true })` and the final confirmation with
  "Breaks not confirmed: OT for this day stays pending" (no confirming sentence); "Go back" closes
  the notice and focuses "Add break" (on a phone with chips, the same button). The final "Save this
  session?" keeps Back (returns to the session dialog) and Save.
- Check out keeps E-1 and its explicit submit labels; the notice is not used there.
- Tests: unit (draft after each choice, request `breaks: []` with `breaks_confirmed` true or false);
  e2e: notice only with an empty unticked list; each choice reaches the final confirmation with the
  right summary and sends the right body; Escape and "Go back" return to the dialog with focus on
  "Add break"; with rows listed, Save goes straight to the final confirmation.

### 7. G-5 "in progress" pill

- Rule (server values only): in the period bar, show "in progress" for the shown period when its
  payroll date equals `periods.in_progress.payroll_date` (the period that contains `today_local`)
  and `periods.current.payroll_date` differs (the five window days); otherwise the server relation
  (old, current, future). Shared views use the owner's periods (their requester). The editor chip
  uses the same function for its day's period. Edit-reason rules are unchanged (the server relation
  stays "future" for that period).
- Colours (computed, `contrast-r2.json`): light fill #e3eefc, ink #174a9c, line #9dbdf0: ink 7.17:1
  on the fill, fill 1.17:1 on the card; dark fill #1b2d4a, ink #a9c8ff, line #3f6fb3: ink 8.15:1,
  fill 1.19:1. Distinct (CIE76 delta E) from current/old/future/Draft: light fills 13.3/23.2/12.1/
  5.9 and inks 79.5/94.9/63.2/43.1; dark fills 31.7/41.3/23.2/11.8 and inks 61.4/87.6/39.4/23.2; the
  word differs in every case.
- Docs: docs/04 line 53 "(... and a current, past or future badge)" becomes "(... a current, past
  or future badge, or 'in progress' for the period that contains today while the period before it
  is still the current one)". docs/05 has no badge wording (only "future functionality" and
  "future periods"), so it needs no change; R-07 in docs/02 is unchanged.
- Tests: unit (`periodBarModel`: window day and normal day, own and shared periods); e2e under the
  simulated clock: at `2026-10-26T16:00:00Z` Today opens 10/26-11/08 with "in progress" and Current
  period shows 10/12-10/25 "current"; at `2026-10-20T17:00:00Z` no "in progress" anywhere and the
  next period is "future"; ink >= 4.5:1 on the fill in four theme situations.

### 8. Mockup

`handoff/delivery/design/WP5-UX3/mockup.html` updated in place (light and dark): new tokens
(`--radius-sheet`, `--radius-lift`, `--lift-clip`, `--sheet-col-min`, `--scrim-side`, the progress
pill, the phone dialog spacing and break widths); A3/A3b/A7/A4 pills ("in progress" in the window
days); A4 at 1440 with square week sheets, a Mon-Wed run as one lifted group and a single column
that is both; new A4b (1280 floating modal panel, docked right for Mon and left for Sat); new A5c
(G-4 notice and final confirmation); A8 kept and marked as superseded; new A8r2 (430 rows, 390 and
320 chips with an error chip, dark 430 rows); new A9 (break sub-dialog, light and dark). Captions in
Vietnamese. New renders (offline, 0 blocked requests; script `probe\render-r2.mjs`):
`mockup-r2-a3-page-header-pills-synthetic.png`, `mockup-r2-a3b-meta-in-progress-synthetic.png`,
`mockup-r2-a4-sheet-square-runs-1440-synthetic.png`, `mockup-r2-a4b-floating-panel-1280-synthetic.png`,
`mockup-r2-a5c-no-breaks-notice-synthetic.png`, `mockup-r2-a7-phones-in-progress-synthetic.png`,
`mockup-r2-a8-phone-dialog-rows-chips-synthetic.png`, `mockup-r2-a9-phone-break-subdialog-synthetic.png`.
The earlier renders are kept.

### 9. Deltas to WP5-UX3-PLAN sections E, F and H

Section E (docs), add or replace:

- docs/04 line 9 and lines 62: the Day editor is a non-modal column from **1360px** (was 1200px)
  and a floating modal side panel from 768 to 1359px, docked away from the edited column, with a
  light backdrop; minimum day column 108px; the page widens up to 1600px while the editor is open.
- docs/04 line 46 (marker): square week sheets; lifted columns with 4px corners; consecutive lifted
  days form one group with one outer shadow; the editor column's 1px frame is inside the column.
- docs/04 line 53: the "in progress" wording of item 7.
- docs/04 lines 62-66 and 70: the G-4 notice (three choices, then the final confirmation); on
  narrow dialogs the two-line break rows and, below 25.5rem, chips with the "Break n" sub-dialog.
- docs/04 lines 76-87: the new tokens of item 8; the radius exception for week sheets.
- docs/10 (round 3 owner decisions): G-1 (b) with the three shape conditions and the floating rule,
  G-2 (a), G-3 (a) with the rule rewrite, G-4 owner variant, G-5 (b), N-1, N-2, and the coordinator
  decisions of 2026-10-15 (G-4 trigger, 24-hour chip, AGENTS wording unchanged).
- docs/12 round-3 bullets: floating editor, square sheets, phone break chips, "in progress".
- docs/05: no change (item 7).

Section F (tests), add:

- Item 1/2 checks (floating vs side by side at 1280, 1359, 1360, 1366, 1440, 1920; no word wider
  than its cell with the item-1 data; dock side; B3-01 at 1360), item 3 checks (computed radius 0 on
  week cards, 4px on lifted columns, run positions from the model and the clip-paths, the frame on
  `::after`), item 4 checks (rows at 430, chips at 390/375/360/320; chip names; sub-dialog Done,
  Cancel, Remove, Add, Escape and focus returns; row and server errors on chips), item 5 (390x844 new
  session with three suggestions: the footer stays visible and the body scrolls only at 320/430),
  item 6 and item 7 tests above.
- Existing assertions that change, with reasons: `day-editor.spec.ts:1019` ("at 1280px the panel
  stays beside the sheet") becomes "at 1280 it floats (modal), at 1366 it stays beside": the same
  behaviour moved to the measured threshold, plus a new no-squeeze check; the B3-01 crossing moves
  from 1200 to 1360; desktop tests that act on the sheet with the editor open move to a 1440
  viewport (no assertion removed).

Section H (slices), replacements:

| Task | Change |
|---|---|
| WP5-UX3-T01 | Also the PLAN2 tokens: `--radius-sheet`, `--radius-lift`, `--lift-clip`, `--sheet-col-min`, `--page-max-editor`, `--scrim-side`, the progress pill (both dark sets), the phone dialog spacing and break width tokens; week cards square. Size M (unchanged). |
| WP5-UX3-T04 | G-5 is now in scope (answer b): `periodBarModel` pill function from `CurrentPeriods`; owned paths unchanged plus `tests/e2e/today.spec.ts` window-day checks. |
| WP5-UX3-T05 | Adds lift runs: `sheetModel.ts` run function and its unit tests, run CSS with clip-paths, the inset editor frame; the Category rename is confirmed (G-2 a). Size M. |
| WP5-UX3-T05B (new, after T05, before T07) | Floating editor rule: `src/client/TimesheetScreen.tsx` (`WIDE_QUERY` 1360, dock side, scroll the column into view), `src/client/DayEditor.tsx` (side attribute only), `src/client/styles.css` (grid `minmax`, page width while editing, floating panel and backdrop); tests `tests/e2e/day-editor.spec.ts` (B-02 and B3-01 blocks, 1280/1366), `tests/e2e/timesheet.spec.ts` and `tests/e2e/today.spec.ts` (viewport 1440 where the sheet is used with the editor open), `tests/e2e/keyboard-access.spec.ts` (AX-01 in the floating panel). Size M, risk M (focus/Escape regressions), novelty yes; worker-high, sonnet. |
| WP5-UX3-T08 | Adds the G-4 notice and final-confirmation flow (`allowUnconfirmed` per choice); keeps the desktop one-line and two-line rows. Size M-L, risk H; worker-high, opus (unchanged). |
| WP5-UX3-T08B (new, after T08) | Phone break chips and the "Break n" sub-dialog, `breakChipText` helper, phone dialog spacing: `src/client/components/BreakChip.tsx` (new), `src/client/components/BreakSubDialog.tsx` (new), `src/client/components/breakChipModel.ts` (new), `src/client/components/BreakRows.tsx`, `src/client/components/SessionDialog.tsx`, `src/client/styles.css`; tests `tests/client/breakChipModel.test.ts` (new), `tests/e2e/day-editor.spec.ts` (mobile project dialog flows). Size M, risk M-H (a third dialog level), novelty yes; worker-high, sonnet. |
| WP5-UX3-T09 | The Check out dialog reuses the rows and chips (BreakRows), with E-1 semantics and no G-4 notice. Depends on T08B. |
| WP5-UX3-T10 | Adds the docs deltas above. |
| Gate | Adds the 1280/1359/1360/1366 floating-versus-side checks with the no-squeeze probe, and the 430/390/320 phone dialog checks. |
| Audits | Area A also re-checks the floating rule, the run shadows and the "in progress" pill; area B also the G-4 notice outcomes, the break sub-dialog stack (Escape and focus at each level) and that chip edits reach the same requests as rows. |

Order of the single writer after T06: GOV chain -> T01 -> T02 -> T03 -> T04 -> T05 -> T05B -> T07 ->
T08 -> T08B -> T09 -> T10 -> gate -> audits.

### Final checks

- Privacy scan (`privacy.txt`): in this brief and `mockup.html` the only at-sign token outside
  `example.invalid` addresses is the CSS `@container`; no user-profile path; synthetic "Example ..."
  names only; every PNG basename contains `synthetic`.
- `git status --short` at the end (`status-end.txt`) = the start plus: my files (modified
  `handoff/delivery/design/WP5-UX3/mockup.html`, eight new `mockup-r2-*-synthetic.png`, this brief's
  Results), the GOV worker's `AGENTS.md` and `AGENTS.vi.md` (14+/18-), and coordinator or GOV
  records created meanwhile that I did not touch (`handoff/delivery/evidence/WP5-UX3-GOV/`,
  `handoff/delivery/tasks/WP5-UX3-GOV-GATE.md`, `handoff/delivery/tasks/WP5-UX3-GOV-AUDIT.md`).
  No source, test, doc, governance or state file was edited by this task.
- `npm run digest` at the end: a682f15323b7204010060b9619cc38b29cc5afd331c01f7c7622d8be06408d8b
  (817 files), different from 0ef75a15 only because of the GOV worker's two AGENTS files (my
  files are under `handoff/`, which the digest excludes).
- Processes: both probes stopped their own server or browser; `netstat -ano` shows no socket on
  48550-48559 (`port-count.txt`: 0). No background task was started.
- Deviations: none from the runtime rules. Notes: the A8r2 artboard draws dark only at 320px and in
  a 430px break-list frame (light at 430 and 390); the container query in the mockup is written in
  px (382px) because the mockup's root is 16px, the app uses 25.5rem at its 15px root.

Status: done.
