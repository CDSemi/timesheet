# WP5-UX3-T07 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T07; package WP5; kind implement;
  attempt 1; depends on WP5-UX3-T05B-FREEZE and WP5-UX3-T06-FREEZE. Slice of UI change
  round 3: the Day editor panel (header and chips, session cards with break tables, the
  "Confirm breaks" entry point), the delete confirmation dialog, WFH on the Category row,
  and two rename/shape remnants from T05.
- **AGENTS.md on disk wins.** Any older injected AGENTS.md copy in your context with the
  section "Unified Frontend & UI/UX Standards (Taste Skills Integration)" is superseded;
  follow the on-disk section "Frontend and UI/UX standards".
- Owner basis (board `owner_decisions`, 2026-10-15): U-19 (the long accounting-date note is
  too long: short or none), U-20 (a panel header that stands out from the body), U-21 (the
  panel shows only the chosen times and breaks; the break list is a table with start date,
  start time and break minutes; editing moves to a separate dialog, which is slice T08),
  U-22 (deleting a time needs a clear confirmation message, not the "Delete" -> "Confirm
  delete" button swap), U-27 (the "Worked from home (WFH)" checkbox on the same row as the
  Category combo box).
- Design sources (the contract): `handoff/delivery/tasks/WP5-UX3-PLAN.md` Results sections
  B7 (header, chips; the long sentence goes; rule 7 stays visible), B8 "Panel (read-only
  list)" and the "Delete (U-22)" and "Reason (old periods)" bullets, B9 (WFH row), B10, the
  section F rows U-19/U-20, U-22 and U-27, the "Existing assertions that must change" items
  for `day-editor.spec.ts:788-806` and the one-tap tests, section H row WP5-UX3-T07; the
  mockup artboards A4 and A5b and the renders `mockup-a4-sheet-and-editor-1280-synthetic.png`
  and `mockup-a5b-confirmations-synthetic.png`. The T06 model
  `src/client/components/breakRowsModel.ts` (frozen at 5c8355d) provides `savedBreakMinutes`
  and `rowsFromSession` for the break table.
- Coordinator decisions (board `coordinator_decisions`, 2026-10-15):
  - The session dialog itself is slice T08. In this slice the panel's Edit, Add session and
    "Confirm breaks" keep using the existing session form as the editing surface; "Confirm
    breaks" opens that form for the session with its saved rows or, when it has none, the
    suggested breaks inside the session (the old one-tap rule), so its request body equals
    today's one-tap body. The one-tap buttons "Confirm suggested breaks"/"No breaks taken"
    are replaced by this entry point.
  - Fold in from T05: the Review model's "No times" glyph becomes the same slashed ring
    (`reviewModel.ts`), and the batch-review wording "label change" becomes "category
    change".
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model sonnet; no override. Routing: size M, risk M (edit and delete paths of time records,
  reason for old periods, nested-dialog Escape and focus, B3-01), novelty yes (new dialog
  component). Task record in English.
- Base: HEAD = origin/main = 5c0dad8e41fddc25306e8f2ff28424f815af32ef (the T05B freeze), or
  a later commit that changes only `handoff/`; source digest
  a17a0ce82faac6f99e3fc0e53bdb02289784776efce6e969966bcf5dcb14aeb9 (827 files). Record HEAD,
  `git status --short` and the digest before you edit. Uncommitted coordinator files under
  `handoff/` are expected: never touch them.

## Scope

1. **Header (U-19, U-20)**: on `--panel-head` with a `--line` bottom border; title "Mon
   10/12/2026" (h2) with a hidden "Day editor " prefix and hidden ISO date, so the dialog
   name stays "Day editor Mon 10/12/2026 (2026-10-12)"; Close as a 38px icon button (44px on
   touch) named "Close". Chips under the title: the period pill (the T04 pill function and
   colours, including "in progress"), "Times in {display zone}", and only when the display
   zone differs from the reporting zone "Day in {reporting zone}"; a view-only share adds
   "View only". The long sentence goes; the input-zone explanation moves next to the "Input
   zone" field of the session form. `--editor-head-size` keeps measuring the header (AX-01).
2. **Session cards (U-21 panel part)**: "Times" heading with "Add session" at its right; one
   card per session: the range in the display zone (`+1` when the end is on a later local
   day), a state pill ("Breaks confirmed", "No breaks taken", "Breaks not confirmed" amber,
   "Running" with a live dot), a source line ("Entered by hand in {input zone}" or "Checked
   in and out"), then the break table (caption "Breaks of {range}", columns Break, Date
   (MM/DD), Start (HH:MM), Minutes; times in the display zone; minutes from
   `savedBreakMinutes`). Empty states: confirmed none "No breaks taken"; unconfirmed an
   attention strip "OT stays pending until breaks are confirmed." with a primary "Confirm
   breaks" button; running "Running since 08:12" without a table. Actions per session: Edit,
   Delete.
3. **Delete confirmation (U-22)**: a new reusable `ConfirmDialog` (modal `alertdialog`;
   T08 reuses it for the save and discard prompts): "Delete this session?" listing Day,
   Time, Breaks and "The session and its breaks are deleted. Worked time and OT of the day
   are calculated again."; "Cancel" (initial focus) and "Delete session" (`--danger`); in an
   old or finalized period it shows the reason field bound to the editor's one reason state.
   The request is today's DELETE with the version (and the reason). Nested-dialog rules
   (B3-01 lesson): at most one modal on top; the dialog handles its own `cancel` event and
   stops propagation; the editor ignores Escape whose target is inside another dialog; focus
   returns to the Delete button on Cancel and to the "Times" heading after a delete.
4. **WFH on the Category row (U-27)**: `.label-row` flex-wrap with the select `flex: 1 1
   8rem` and the checkbox label `flex: none`; the "Calendar default" hint below; the label
   text "Worked from home (WFH)" unchanged.
5. **T05 remnants**: `reviewModel.ts` "No times" uses the slashed ring like the sheet; the
   batch-review wording says "category change".

## Tests

- `tests/client/dayEditorModel.test.ts` (or a new small model test): the chip list from the
  relation and zones (zone chip only when zones differ; "View only" for a view share); the
  session-card state from a session (confirmed, none, unconfirmed, running).
- e2e (both projects): dialog name unchanged; the head surface differs from the body; AX-01
  scroll padding still clears the head; session cards with break tables (times in the
  display zone; an overnight session shows `+1`); "Confirm breaks" sends the same request
  body as the old one-tap tests asserted (version, reason, rows); Delete opens the
  alertdialog with day and time, Cancel has initial focus, Escape cancels and returns focus
  to Delete, "Delete session" sends the version (and the reason in an old period);
  `sharing.spec.ts` view-only has no "Delete session"; WFH and the select share a row at 1366
  (panel), at 1280 (floating panel) and at 390 (bottom sheet) and wrap without overflow at
  320; Review shows the slashed ring; the batch review says "category change".
- Replace the assertions the plan lists (`day-editor.spec.ts:788-806` "Confirm delete", the
  one-tap tests at `1043-1145` become "Confirm breaks" tests with the same request-body
  assertions, `sharing.spec.ts:264`, `import.spec.ts:233` if it uses the old note or button
  names); list each changed assertion with file:line and why it is not a weakening.
- The 390x844 first-screen budgets still pass; record the numbers.
- No assertion removed or weakened; no `skip`, `fixme` or `.only`; dates only from the
  server-reported `today_local` and the displayed period.

## Hard constraints

- No server, API, domain, schema or CSP change; the same request shapes as today.
- Never compute an accounting date from the device clock or the display zone (AGENTS rule 7).
- Tokens only; shared `var(--transition)`; WCAG 2.2 AA (2.4.3 focus order in nested dialogs,
  2.4.7, 2.4.11, 2.5.3, 2.5.8 / 44px below 768px, 1.4.11, 1.4.1, 4.1.3 for status text).
- Keep AX-01..AX-10, R-12, B-02, B3-01, the T05B floating rule and every earlier behaviour.

## Owned paths

- `src/client/DayEditor.tsx`, `src/client/components/DayFieldsForm.tsx`,
  `src/client/components/ConfirmDialog.tsx` (new), `src/client/components/SessionList.tsx`
  (new), `src/client/components/dayEditorModel.ts` (additions only),
  `src/client/components/SessionForm.tsx` (the input-zone hint and the "Confirm breaks"
  entry only), `src/client/components/reviewModel.ts` (the "No times" shape), the
  batch-review component that holds the "label change" wording (find it; wording only),
  `src/client/styles.css`
- `tests/client/dayEditorModel.test.ts`, a new model test if needed,
  `tests/client/reviewModel.test.ts` (if it pins the glyph), `tests/e2e/day-editor.spec.ts`,
  `tests/e2e/sharing.spec.ts`, `tests/e2e/import.spec.ts`, `tests/e2e/review.spec.ts` (glyph
  and wording only), `tests/e2e/keyboard-access.spec.ts`
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX3-T07/` (masked LF `.txt` only, plus at most eight
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
6. Two mutation checks, each alone and reverted: (a) the delete dialog's Escape propagates to
   the editor (the editor closes too): an e2e check fails; (b) "Delete session" sends without
   the version: an e2e request-body check fails.
7. Privacy and whitespace: Grep changed files and evidence for email addresses and
   user-profile paths (only the full synthetic example.invalid form may remain); Grep every
   new or changed file for `[ \t]+$` and read its last lines (exactly one final newline).
8. `npm run verify` with `SMOKE_PORT` in 48720-48739 and `DATA_DIR` and `DATABASE_PATH`
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
- Task folder `D:\.claude-tmp\timesheet\WP5-UX3-T07`. Set TEMP and TMP to it. Ports
  48720-48739. Never touch `%LOCALAPPDATA%\timesheet-dev` data or `B:\Temp\claude`. Never
  kill processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. Write no
  markdown links in Results (paths in backticks only).

## Return

At most 170 words, beginning with 'Self-reported model: ...': files changed (every test file
with changed assertions), the header and chips, the session-card states, the delete dialog
and its focus rules, unit and full e2e counts per project, both mutation results, the budget
numbers, the main chunk size, verify exit code, the final full 64-hex digest and file count,
the evidence files, the background-task confirmation, any stop, conflict or deviation.

## Results

Model: `claude-sonnet-5-5` (profile timesheet-worker-high, effort high). Node `v24.21.0` (`evidence/WP5-UX3-T07/01-node-head-status.txt`).

**Baseline (before any edit).** HEAD `5c0dad8e41fddc25306e8f2ff28424f815af32ef`; `git status --short` showed only the coordinator files under `handoff/`;
`npm run digest` gave `a17a0ce82faac6f99e3fc0e53bdb02289784776efce6e969966bcf5dcb14aeb9` (827 files).

**Files changed (all inside the owned paths).** Source: `src/client/DayEditor.tsx`, `src/client/components/ConfirmDialog.tsx` (new),
`src/client/components/SessionList.tsx` (new), `src/client/components/dayEditorModel.ts` (additions only), `src/client/components/SessionForm.tsx`
(input-zone hint, optional `initialDraft` and `displayZone`), `src/client/components/DayFieldsForm.tsx`, `src/client/components/reviewModel.ts`,
`src/client/components/BatchDialog.tsx` (status words only), `src/client/styles.css`. Tests: `tests/client/dayEditorModel.test.ts`,
`tests/client/reviewModel.test.ts`, `tests/e2e/day-editor.spec.ts`, `tests/e2e/sharing.spec.ts`, `tests/e2e/import.spec.ts`, `tests/e2e/review.spec.ts`.
`keyboard-access.spec.ts` needed no change. No server, API, domain, schema or CSP file was touched; every request has today's shape.

**What was built.**
- Header (U-19, U-20): the head is on `--panel-head` with a 1px `--line` rule; the long accounting-date note is gone. The h2 reads `Mon 10/12/2026`
  with a hidden `Day editor ` prefix and a hidden ISO date, so the dialog is named `Day editor Mon 10/12/2026 (2026-10-12)` (`Day ...` when read-only).
  Close is a 38px icon button named "Close" (44px on touch through the control rule). Chips under the title come from `editorChips` in
  `dayEditorModel.ts`: the period (`current period`, `old period`, `future period`, `in progress`), `Times in {display zone}`, `Day in {reporting zone}`
  only when the zones differ, and `View only` for a read-only editor. The input-zone explanation moved next to the "Input zone" field of the session
  form (`... they are shown in {display zone} elsewhere`). `--editor-head-size` still measures the head (test: equals the rendered head, scroll padding
  = head + focus clearance); head 106.8px with three wrapped chips at 400px (it was 123.5px with the long note).
- Session cards (U-21): `SessionList.tsx` and `sessionCardOf` in the model. "Times" heading with "Add session" (plus icon) at its right; per session the
  range in the display zone (`+1` on a later local day, the start date `MM/DD` when it differs from the accounting date), a state pill, a source line
  (`Entered by hand in {zone}` or `Checked in and out`), and the break table (caption `Breaks of {range}`, columns Break, Date, Start, Minutes; times in the
  display zone; minutes from `savedBreakMinutes`). States: confirmed ("Breaks confirmed" green), none ("No breaks taken" green plus the empty text),
  unconfirmed ("Breaks not confirmed" amber, attention strip "OT stays pending until breaks are confirmed." and the primary "Confirm breaks"), running
  ("Running" with the live dot, "Running since 08:12", no table). Edit and Delete per session; none of it in a read-only editor.
- "Confirm breaks": `confirmBreaksDraft` opens the existing session form for the session with its saved rows or the suggested breaks inside it (the old
  `quickBreaksOf` rule) selected as "Breaks confirmed as listed", or "No breaks taken" when nothing fits; Save sends the one-tap body (unit test: equal to
  `quickBreaksRequest`; e2e: version, rows, reason). After that save, focus goes to the Times heading. The one-tap buttons are gone.
- Delete confirmation (U-22): the reusable `ConfirmDialog` (modal `alertdialog`, `aria-labelledby` title, `aria-describedby` sentence). "Delete this session?"
  lists Day, Time (with zone) and Breaks, the sentence "The session and its breaks are deleted. Worked time and OT of the day are calculated again.",
  "Cancel" (initial focus) and "Delete session" (`button.danger`, new `--danger-strong` in both dark sets). In an old or finalized period it shows the
  editor's one reason field and the button waits for it. The request is today's DELETE with `expected_version` (and `reason`). Focus and Escape: it is a
  modal nested in the editor `<dialog>`; its own `cancel` handler prevents the default, stops propagation and closes only it; its Escape keydown stops
  propagation; the editor's key handler ignores an Escape whose target lies in another dialog; on Cancel or Escape focus returns to the Delete button
  (unmount cleanup, only if the button still exists); after a delete focus goes to the "Times" heading once the page has settled (`focusTimes` effect).
- WFH (U-27): `.label-row` flex-wrap, select `flex: 1 1 var(--label-select-basis)` (8rem), checkbox `flex: none`; the "Calendar default" hint is a paragraph
  below the row. Measured: 1366 and 1280 select 148px + WFH 208px on one row; 390 select 138px + WFH 208px on one row; 320 select 288px, WFH wrapped
  below, no horizontal overflow.
- T05 remnants: `reviewModel.ts` gives "No times" the `slashed` shape (`NO_TIMES_TEXT`, "Missing record" keeps its square); the batch preview words are
  now "new category" and "category change".

**Changed assertions (file:line in the final files; none removed or weakened, no `skip`, `fixme` or `.only`).**
- `day-editor.spec.ts:114-115` (was `Accounting date ... in the reporting zone`): the long note is gone; now the title text (`Day editor Mon ... {ISO}`) and the chip
  `Day in America/Los_Angeles`. `:199-206` (was `in the reporting zone` and `they are shown in {zone}` in the panel): the chips `Day in`/`Times in`, and the input-zone
  sentence is asserted in the form where it moved. `:219` (was `entered in {zone}`): `Entered by hand in {zone}`. `:290` and `:836` (`.session-item` count): `.session-card` count.
  `:737` (was `Period: old.`): the chip `old period`. `:1339` and `:1356` (heading text ended with the ISO date): the same, now with the displayed date before it.
- Delete (was `:788-806` "Confirm delete"): replaced by `:823` (alertdialog with day, time, breaks; Cancel first and focused; Escape and Cancel return focus to Delete and send nothing;
  "Delete session" sends exactly `{expected_version}`; focus to Times), `:892` (old period: reason shown, button disabled until typed, body has version and reason) and `:934`
  (Escape closes only the confirmation, then the editor; default window and 1440px). The version assertion stays and is stronger (whole body compared).
- One-tap tests (was `:1043-1145`): `:1753` ("Confirm breaks": no one-tap buttons, form opens with the suggested breaks selected, nothing sent until Save, the same PUT: path, version,
  input zone, start, end, three break rows, no reason; the chip list became the break table in the display zone), `:1843` (old period: Save disabled until the reason, then the same
  body), `:1887` (no suggestion fits: "No breaks taken" selected, empty confirmed list). The request-body assertions are the old ones plus more fields.
- `sharing.spec.ts:255-263` (was `Add session`, `Save day fields`, `Confirm delete` absent): `Delete session` replaces `Confirm delete`, `Confirm breaks` and the alertdialog are asserted
  absent, and the "View only" chip is asserted. `import.spec.ts:229-233`: the chip, and no Edit/Delete session or Confirm breaks (the old `Add session` assertion stays).
  `review.spec.ts:220-228`: every visible "No times" Status has the slashed ring and no square.
- Day-editor spec `:1991-1992`: the batch preview says "category change" and not "label change".
- New tests: `dayEditorModel.test.ts` (chips, title, session cards in four states, +1 and display-zone breaks, source line, start date, delete facts, `confirmBreaksDraft` equals the one-tap
  body for listed, suggested and none), `reviewModel.test.ts` (slashed ring vs square), e2e head (`:1072`), cards (`:1148`, overnight `+1` and running `:1222`), WFH rows (`:1281`).

**Commands and results (in order; masked logs in `handoff/delivery/evidence/WP5-UX3-T07/`).**
1. `export PATH=".../timesheet-dev/node-24.21.0/..."`; `node --version`: `v24.21.0` (01).
2. `git rev-parse HEAD`, `git status --short`, `npm run digest` before editing: see Baseline (01, 02).
3. `npm run typecheck`: exit 0 (03). `npm run lint`: exit 0 (04). `npm test`: 93 files, 2091 tests passed (05).
4. `npm run build`: exit 0; main chunk `index-CV3E81LO.js` 458.49 kB (gzip 134.75 kB); no chunk-size advisory (06).
5. `npm run test:e2e` (build, then the full suite on both projects, alone, real clock, `E2E_SCREENSHOT_DIR` and the Playwright output folder (via TEMP) inside the task folder): 0 failed;
   576 passed (desktop 289, mobile 287), 62 skipped (desktop 30, mobile 32, the project-specific layouts), 15.1 minutes; no `ERR_NO_BUFFER_SPACE`, no `ECONNRESET` (07).
   The e2e harness picks its own free ports for its server (not in 48720-48739); only verify used `SMOKE_PORT=48721`.
6. Mutations, each alone, reverted afterwards, each with a rebuild and `playwright test tests/e2e/day-editor.spec.ts -g "delete"`:
   (a) the delete dialog's Escape propagates to the editor (the `stopPropagation` of the dialog's key handler and the editor's "target is in another dialog" guard both removed):
   5 failed ("the first Escape did not close the editor"; the first delete test also failed) (08). Note: the two protections are redundant by design, so the mutation removes both;
   (b) "Delete session" sends without the version (`body = {}`): 4 failed, the server refuses (422) and the body assertions differ (09).
   After both reverts the same filter gives 7 passed (10).
7. Privacy and whitespace: Grep of `src/client` and `tests` for emails and user-profile paths: only `example.invalid` addresses (pre-existing); Grep for `[ \t]+$` over `src/client`
   and `tests`: no match; multiline Grep for a blank last line or a missing final newline over both: none. The evidence logs were masked by a helper script kept outside the evidence
   (CR and colour codes removed, trailing spaces stripped, addresses other than `example.invalid` and user-profile paths masked); Grep of the evidence: only `example.invalid`.
8. `npm run verify` with `SMOKE_PORT=48721`, `DATA_DIR` and `DATABASE_PATH` inside the task folder: exit 0, "SMOKE PASSED" (11).
9. `npm run digest` LAST: `a3cbc3f460d20c0f56736ce09a6b09ab7a7815cb738323ddd8f358a20ec540f0` (829 files, handoff/ excluded; 12). No file under `src` or `tests` changed after verify.

**390x844 first-screen budgets (all four states, the round-2 tests, still pass).** Landing without the zone note: first day row bottom 559.45 of tab bar top 788 (shell bar 60px); with the
zone note 658.41; received share without the note 611.45 and with it 710.41 (shell bar 112px); away state with the zone note 658.41. No first-screen markup changed in this slice.

**Evidence** (`handoff/delivery/evidence/WP5-UX3-T07/`): `01` to `12` masked LF `.txt` logs and eight screenshots `editor-head-desktop`, `editor-head-mobile`, `editor-session-card-desktop`,
`editor-session-card-mobile`, `editor-session-card-unconfirmed-desktop`, `editor-session-card-unconfirmed-mobile`, `delete-confirm-desktop`, `delete-confirm-mobile` (all `-synthetic.png`).

**Deviations, conflicts and open points for the coordinator.**
1. "In progress" chip not wired: `TimesheetScreen.tsx` (not an owned path) does not pass the period pill to `DayEditor`. `DayEditor` takes an optional `periodPill` (the T04 `periodPillKind`
   result) and `editorChips` renders it, including "in progress" (unit-tested), but until `TimesheetScreen.tsx` passes `periodPill={periodPillKind(view.period, periods)}` the chip shows the day's own
   server relation (`current`, `old` or `future` period). One line for whoever owns that file next (T08 owns `DayEditor.tsx` only).
2. Batch review wording: only the preview status words ("new category", "category change") changed. `Review label change for {date}` is built in `TimesheetScreen.tsx` (not owned), and
   "Recorded work conflicts with the new label" and "I confirm the label change for these dates" are asserted by `timesheet.spec.ts:403,408` (not owned), so they were left as they are.
3. The heading text ends with the ISO date although the dialog name reads `(2026-10-12)`: the brackets are generated content (`.iso-date::before/::after`). Reason: the non-owned
   `timesheet.spec.ts:699,703` match `{ISO}$` on the heading text; the accessible name in Chromium and Playwright includes the generated brackets (tested with an exact dialog name).
4. The dialog name changed from `Day editor Mon 2026-10-12` to the name the plan and brief state (`Day editor Mon 10/12/2026 (2026-10-12)`); every test used a `/Day editor/` pattern or the ISO date.
5. The editor's `Add session` and "Confirm breaks" still open the old session form; T08 replaces it. `quickBreaksRequest` stays exported (unit-tested as the oracle of the new draft) although the app no longer calls it.
6. The e2e harness ports (point 5 above).
7. No background task is left running: the full e2e run, the wait loops and every helper have exited (the only long command, the full e2e, ended with exit 0).

Status: done
