# WP5-UX3-T08 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T08; package WP5; kind implement;
  attempt 1; depends on WP5-UX3-T07-FREEZE. Slice of UI change round 3: the session dialog
  (new and edit), break rows, "Confirm no breaks taken", Suggest and Add break, automatic
  pre-fill, the G-4 notice, the save and discard confirmations, nested-dialog rules.
- **AGENTS.md on disk wins.** Any older injected AGENTS.md copy in your context with the
  section "Unified Frontend & UI/UX Standards (Taste Skills Integration)" is superseded;
  follow the on-disk section "Frontend and UI/UX standards".
- Owner basis (board `owner_decisions`, 2026-10-15): U-21 (new/edit time session in a
  separate dialog; breaks as start date, start time and minutes, no end needed), U-23
  (pre-fill the Settings default start/end times, and suggested breaks when the day is in
  the past), U-24 (a simpler break area: one "Confirm no breaks taken" checkbox, the break
  list, "Suggest breaks", "Add break"; one row per break such as "Break 1 [date] [time]
  [total mins] [X]", wrapping only when needed, rows easy to tell apart), U-25 (Save also
  counts as confirming), U-26 (always a confirmation before Save, and on Cancel with
  modified data); answers G-3 (a) (automatic pre-fill with the rule rewrite) and G-4 (owner
  variant: with no break listed and the box unticked, a notice offers "confirm no breaks",
  "leave the breaks unconfirmed for now" or "go back and add breaks"; if saving continues,
  the final save confirmation still follows).
- Design sources (the contract):
  - `handoff/delivery/tasks/WP5-UX3-PLAN.md` Results section B8 "Session dialog" bullets
    (structure, breaks, mapping to the API, pre-fill, Save, Cancel, reason, nested dialogs,
    time entry format), section C (canonical rules R-01, R-02, R-07, docs/04 lines 16, 25,
    63, 64, 70; the U-23 rule rewrite, which the docs slice T10 writes into docs/04 and
    docs/10), section F rows U-21/U-24, U-23 and U-25/U-26 and the "Existing assertions that
    must change" items for the session-form and one-tap tests, section H row WP5-UX3-T08;
  - `handoff/delivery/tasks/WP5-UX3-PLAN2.md` Results item 6 (the G-4 notice: title "No
    breaks listed", text, three buttons, initial focus "Go back and add breaks", Escape = Go
    back, the mapping onto the T06 model, focus to "Add break" after Go back) and item 9 row
    WP5-UX3-T08; item 4 for the desktop one-line row (from 42rem) and the two-line row
    (25.5-42rem); the chips below 25.5rem are slice T08B;
  - the T06 model `src/client/components/breakRowsModel.ts` and its record
    `handoff/delivery/tasks/WP5-UX3-T06.md` (exports: `newSessionDialogDraft`,
    `sessionDialogDraftFromSession`, `editBreakRow`, `addBreakRow`, `removeBreakRow`,
    `setNoBreaks`, `changeDialogZone`, `checkBreakRows`, `buildSessionDialogRequest` with
    `allowUnconfirmed`, `serverBreakRowError`, `referenceHours`, `applyReferenceHours`,
    `pastDaySuggestedRows`, `reshiftSuggestions`, `breaksSummary`, `sessionDialogIsDirty`,
    `breakRowEnd`); use it unchanged; if a gap is found, stop and report rather than
    changing its contract silently;
  - the T07 record (the `ConfirmDialog` component, the session cards and the "Confirm
    breaks" entry point, which now opens this dialog);
  - the mockup artboards A5, A5b and A5c and the renders
    `mockup-a5-session-dialog-synthetic.png`, `mockup-a5b-confirmations-synthetic.png` and
    `mockup-r2-a5c-no-breaks-notice-synthetic.png`.
- Coordinator decisions (board `coordinator_decisions`, 2026-10-15): the G-4 notice appears
  only when Save is pressed with no break listed and the box unticked; with rows listed,
  Save confirms them and goes straight to the final confirmation; displayed times stay
  24-hour (E-4) while the native date and time inputs follow the browser locale; only
  `future_break` carries `break_index` today (other server break errors stay form-level).
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model opus; override reason size_risk (break entry feeds worked minutes and OT credit,
  risk H; nested-dialog regressions of the B3-01 kind; size M-L). Task record in English.
- Base: HEAD = origin/main = f8117a48cd856ee09494e54c64d6f09dbc20b234 (the T07 freeze), or
  a later commit that changes only `handoff/`; source digest
  a3cbc3f460d20c0f56736ce09a6b09ab7a7815cb738323ddd8f358a20ec540f0 (829 files). Record HEAD,
  `git status --short` and the digest before you edit. Uncommitted coordinator files under
  `handoff/` are expected: never touch them.

## Scope

1. **Session dialog** (`SessionDialog.tsx`, modal `<dialog>`, 720px on desktop, full screen
   below 768px): title "New session" / "Edit session", subtitle "{weekday} {MM/DD/YYYY} ·
   accounting date in {reporting zone}"; section "Time" (start date and time, end date and
   time, the overnight note as today, "Input zone" with its explanation moved here from the
   old note); section "Breaks" (below). It replaces the inline session form: Add session,
   Edit and "Confirm breaks" (T07 entry point) open it; "Confirm breaks" opens it with the
   saved rows or, when there are none, the suggested breaks inside the session.
2. **Break rows** (`BreakRows.tsx`): one checkbox "Confirm no breaks taken"; the list; the
   buttons "Suggest breaks" and "Add break". One row per break: a "Break n" chip, date,
   start time, minutes (number input, placeholder "total mins", whole minutes 1-720), the
   computed end ("ends 10:15") as text, a "suggested" tag while a pre-filled suggestion is
   untouched, and a remove button named "Remove break n" (36px, 44px on touch). Rows are
   tinted strips with a 1px boundary, 8px apart. Layout by container width: one line from
   42rem; two lines from 25.5rem ("Break n" line, then date, time, minutes and remove on one
   row); below 25.5rem keep the two-line row for now (T08B adds chips). Ticking the checkbox
   hides and disables the rows (kept in memory, restored when unticked).
3. **Pre-fill (G-3 a)**, new sessions only, when the policy effective on the date exists:
   start and end from the reference hours (`referenceHours`/`applyReferenceHours`); suggested
   breaks only when the accounting date is before the server's `today_local` (passed in as
   today; never the device clock), and only those inside the session; they re-shift with the
   start until a break row is edited. A note "Pre-filled from your reference hours ({start}-
   {end}) and suggested breaks. Change them to the times you worked." and the "suggested"
   tags mark the values.
4. **Save (U-25, U-26, G-4)**: Save validates (`checkBreakRows`, time problems through the
   existing gap and fold prompt, naming "Break n"); with no break listed and the box
   unticked it first opens the G-4 notice (`alertdialog` "No breaks listed", three stacked
   buttons, "Go back and add breaks" with initial focus, Escape = Go back; "Confirm no breaks
   taken" ticks the box in the draft; "Leave breaks unconfirmed for now" keeps it unticked);
   then always the final `ConfirmDialog` "Save this session?" listing Day, Time (with zone)
   and Breaks (`breaksSummary`), with the sentence "Saving confirms these breaks as the
   breaks you took." except in the unconfirmed case; buttons "Back" (returns to the dialog
   with values kept) and "Save". What is sent: `buildSessionDialogRequest` with
   `allowUnconfirmed: true` only for "Leave breaks unconfirmed for now"; the same
   `SessionRequest` shape as today. Server errors: `serverBreakRowError` marks the row;
   other errors show at form level.
5. **Cancel (U-26)**: Cancel, Escape and the X: when `sessionDialogIsDirty` is true, the
   `ConfirmDialog` "Discard your changes?" with "Keep editing" (initial focus) and "Discard"
   (danger); otherwise close at once.
6. **Reason**: in an old or finalized period the dialog shows the reason field bound to the
   editor's one reason state (as the delete dialog of T07).
7. **Nested dialogs (B3-01 lesson)**: at most one modal on top (editor: modal below 1360px,
   non-modal above; session dialog; notice or confirmation). Each dialog handles its own
   `cancel` event (preventDefault plus its own close) and stops propagation; the editor's
   Escape handlers ignore events whose target is inside another dialog; the editor's
   re-show on crossing 1360px waits while another modal is open. Focus returns: a
   confirmation to the button that opened it; the session dialog to its opener (Add session,
   Edit or Confirm breaks), or after a save to the "Times" heading.
9. **T07 open point (coordinator decision)**: pass the period pill to the editor from
   `TimesheetScreen.tsx` (`periodPill={periodPillKind(view.period, periods)}`; one prop, no
   other change in that file) so the editor's period chip reads "in progress" in the window
   days; add an e2e check under the simulated clock at `2026-10-26T16:00:00Z` (Today opens
   the period with today; the editor chip says "in progress"). `quickBreaksRequest` (kept by
   T07 as a test oracle) may be removed once nothing but tests uses it; keep the oracle
   tests meaningful.
8. Remove the inline session form and the one-tap block; delete a replaced file only when
   nothing imports it any more (the Check out dialog may still use the old break editor until
   T09; leave such a file in place). Note: `npm run digest` exits 1 while a tracked file's
   deletion is unstaged; if you delete a file, record a probe digest computed as the docs of
   `scripts/source-digest.mjs` allow and say so; the freeze recomputes it after staging.

## Tests

- e2e (both projects; per plan section F rows U-21/U-24, U-23, U-25/U-26 and PLAN2 item 6):
  rewrite the session flows (`day-editor.spec.ts` lines about 85-470 and 761-786) to the
  dialog ("New session"/"Edit session", "Break n" rows, "Save"); the four DST and zone
  tests keep their assertions on stored instants; the one-tap tests (now "Confirm breaks")
  keep their request-body assertions plus the confirmation step; pre-fill: a past workday
  (derived from `today_local` minus N days inside the displayed or previous period) opens
  "New session" with the reference hours and the suggested rows, today's date with times but
  no rows, and an Asia/Ho_Chi_Minh device zone does not change which day counts as past;
  Save always opens "Save this session?"; Back keeps the values; a saved day shows "Breaks
  confirmed" and the server's OT and status; the G-4 notice only for an empty unticked list;
  each of its choices reaches the final confirmation with the right summary and sends the
  right body (`breaks: []` with `breaks_confirmed` true or false); Escape and "Go back"
  return to the dialog with focus on "Add break"; with rows listed Save goes straight to the
  final confirmation; Cancel after a change asks "Discard your changes?", Keep editing keeps
  values, Discard closes; Cancel without a change closes at once; nested Escape closes only
  the top dialog at 1366 (non-modal editor) and at 1280 (floating modal editor) and while the
  window crosses 1360px; the row layouts one-line at the 720px dialog and two-line at a 430px
  phone; the reason field in an old period.
- Calendar independence: every new check derives its dates from `/api/periods/current` and
  the displayed period (existing helpers); also run `day-editor.spec.ts` under the FIX10
  simulated clock (copy `handoff/delivery/evidence/WP5-UX-FIX10/shiftclock.mjs.txt` into your
  task folder as `.mjs`, never into the repository) at `2026-11-01T08:45:00Z` (fall-back fold:
  a manual break started at 01:45 needs the fold choice), `2027-03-14T10:30:00Z`
  (spring-forward: 02:30 does not exist) and `2026-10-27T06:58:30Z` (90 s before the
  reporting-zone midnight), each run alone with its own output folder.
- List every changed assertion with file:line and why it is not a weakening.
- The 390x844 first-screen budgets still pass; record the numbers.
- No assertion removed or weakened; no `skip`, `fixme` or `.only`.

## Hard constraints

- No server, API, domain, schema or CSP change; the same request shapes as today; no
  change to the T06 model's contract.
- Never compute an accounting date or "past day" from the device clock or the display zone
  (AGENTS rule 7). Durations are elapsed UTC time (R-07).
- Tokens only; shared `var(--transition)`; WCAG 2.2 AA (2.4.3 focus order in nested
  dialogs, 2.4.7, 2.4.11, 2.5.3, 2.5.8 / 44px below 768px, 1.4.11, 1.4.1, 3.3.1 and 3.3.3
  error identification and suggestion, 4.1.3 status messages).
- Keep AX-01..AX-10, R-12, B-02, B3-01, the T05B floating rule, the T07 panel and every
  earlier behaviour.

## Owned paths

- `src/client/components/SessionDialog.tsx` (new), `src/client/components/BreakRows.tsx`
  (new), `src/client/components/SessionForm.tsx` (removed or reduced),
  `src/client/components/BreaksEditor.tsx` (removed only if unused),
  `src/client/components/LocalTimeField.tsx`, `src/client/components/TimeProblemPrompt.tsx`,
  `src/client/components/SessionList.tsx` (entry points only), `src/client/DayEditor.tsx`,
  `src/client/TimesheetScreen.tsx` (the `periodPill` prop only),
  `src/client/components/dayEditorModel.ts` (removing `quickBreaksRequest` only if unused),
  `src/client/styles.css`, `tests/client/dayEditorModel.test.ts` (oracle tests only),
  `tests/e2e/today.spec.ts` (the editor "in progress" chip check only)
- `tests/e2e/day-editor.spec.ts`, `tests/e2e/sharing.spec.ts` (view-only dialog checks only),
  `tests/e2e/keyboard-access.spec.ts` (dialog tab order only), a new
  `tests/client/sessionDialog.test.ts` if a pure helper is added
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX3-T08/` (masked LF `.txt` only, plus at most eight
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
6. The three simulated-clock runs of `day-editor.spec.ts` (both projects); a table of
   instant, passed, failed.
7. Three mutation checks, each alone and reverted: (a) "Leave breaks unconfirmed for now"
   sends `breaks_confirmed: true`: an e2e request-body check fails; (b) suggested breaks
   pre-filled for today's date (`<=`): an e2e pre-fill check fails; (c) the final
   confirmation's Escape propagates to the session dialog (both close): an e2e nested-Escape
   check fails.
8. Privacy and whitespace: Grep changed files and evidence for email addresses and
   user-profile paths (only the full synthetic example.invalid form may remain); Grep every
   new or changed file for `[ \t]+$` and read its last lines (exactly one final newline).
9. `npm run verify` with `SMOKE_PORT` in 48740-48759 and `DATA_DIR` and `DATABASE_PATH`
   both inside the task folder.
10. `npm run digest` LAST (or the probe digest if a tracked file was deleted, see Scope 8).
    If any file changes after it, rerun verify and the digest.
11. Copy the masked logs of steps 2-7, 9 and 10 into the evidence folder (logs only).

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`, NOT EVEN TO WRITE A FILE), NO `| node`, NO `| python`, NO
  `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`, NOT EVEN
  FOR A READ-ONLY LISTING. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul` (NOT EVEN
  `2>/dev/null`). NEVER `rm -r` OR `rm -rf` ANYTHING.** Redirect to a file in the task
  folder and read it with the Read tool; list files with the Glob tool. Use the Write and
  Edit tools for files (no sed, no heredoc). To delete a single replaced source file, do
  not use `git rm` (it stages); use a plain `rm` with that one literal path. If a permission
  check denies it, leave the file, stop using it, and report.
- **Create files only inside the task folder, the evidence folder or your owned paths.**
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX3-T08`. Set TEMP and TMP to it. Ports
  48740-48759. Never touch `%LOCALAPPDATA%\timesheet-dev` data or `B:\Temp\claude`. Never
  kill processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. Write no
  markdown links in Results (paths in backticks only).

## Return

At most 200 words, beginning with 'Self-reported model: ...': files changed, added and
deleted (every test file with changed assertions), the Save/notice/confirmation flow as
implemented, the pre-fill rule, the nested-dialog rules, unit and full e2e counts per
project, the simulated-clock table, the three mutation results, the budget numbers, the main
chunk size, verify exit code, the final full 64-hex digest (or probe digest) and file count,
the evidence files, the background-task confirmation, any stop, conflict or deviation.

## Results

**Baseline (2026-10-15, before any edit; log `step2-pre-edit.log` in the task folder).** Node `v24.21.0`; HEAD
`f8117a48cd856ee09494e54c64d6f09dbc20b234`; `git status --short`: only the coordinator files under `handoff/` (ORCHESTRATION.json,
WORKFLOW_REVISION_CHECKPOINT.md and .vi.md, tasks/WP5-UX3-T07-FREEZE.md, tasks/WP5-UX3-T08.md, evidence/WP5-UX3-T07-FREEZE/);
`npm run digest`: `a3cbc3f460d20c0f56736ce09a6b09ab7a7815cb738323ddd8f358a20ec540f0` (829 files), exit 0. Matches the brief.

Step 1 (reading) done: brief, PLAN B8/C/F/H, PLAN2 items 4, 6 and 9, T06 model, T07 record, mockup A5/A5b/A5c, the current
DayEditor, SessionForm, BreaksEditor, SessionList, ConfirmDialog, TimeProblemPrompt, LocalTimeField and the e2e spec.

Checkpoint 2 (implementation and first e2e pass): `SessionDialog.tsx` and `BreakRows.tsx` added, `SessionForm.tsx`
deleted (plain `rm`; nothing imported it), `DayEditor.tsx`, `SessionList.tsx`, `TimeProblemPrompt.tsx`, `styles.css`,
`TimesheetScreen.tsx` (periodPill only) changed; `day-editor.spec.ts` and `today.spec.ts` rewritten/extended. Typecheck exit 0;
`day-editor.spec.ts` alone on both projects: 98 passed after fixing one wrong assertion of my own new crossing test
(nested dialogs are DOM-nested, so "contains the hit point" is true for the session dialog under the confirmation).

Checkpoint 3 (gate steps 3-7 done): typecheck 0, lint 0, unit 93 files / 2091 tests passed, build 0 (main chunk 477.22 kB),
full e2e 590 passed (desktop 298, mobile 292), 66 skipped, 0 failed; three simulated-clock runs of day-editor.spec.ts 83 passed /
17 skipped / 0 failed each; today.spec.ts at 2026-10-26T16:00:00Z 31 passed; mutations (a) 4 failed, (b) 2 failed, (c) 4 failed,
each reverted; after the reverts day-editor.spec.ts 83 passed. Remaining: privacy/whitespace checks, verify, digest, evidence.

### Final result

**Files.** Added `src/client/components/SessionDialog.tsx`, `src/client/components/BreakRows.tsx`. Deleted
`src/client/components/SessionForm.tsx` (plain `rm`, unstaged). Changed `src/client/DayEditor.tsx`,
`src/client/components/SessionList.tsx` (entry points pass the pressed button; the `canConfirm` prop is gone because the dialog
is modal), `src/client/components/TimeProblemPrompt.tsx` (takes `chosen` and an optional `label` such as "Break 1" instead of
the old form draft; unique radio group name), `src/client/TimesheetScreen.tsx` (the `periodPill` prop and its import only),
`src/client/styles.css` (session dialog, break rows, G-4 choices, two new tokens `--session-dialog-width` and `--dialog-pad`),
`tests/e2e/day-editor.spec.ts`, `tests/e2e/today.spec.ts`. Unchanged: `breakRowsModel.ts` (T06 contract), `ConfirmDialog.tsx`,
`BreaksEditor.tsx` and `LocalTimeField.tsx` (the Check out dialog still uses them until T09), `dayEditorModel.ts`
(`quickBreaksRequest` kept as the unit-test oracle), `tests/client/dayEditorModel.test.ts`, `sharing.spec.ts`,
`keyboard-access.spec.ts` (no change needed). No server, API, domain, schema or CSP change; request shapes unchanged.

**Flow as implemented.** Add session, Edit and "Confirm breaks" open the modal session dialog (720px, full screen below 768px;
title "New session"/"Edit session", described by "{weekday} {MM/DD/YYYY} · accounting date in {reporting zone}"; sections Time
and Breaks; the input-zone explanation sits under the field; the old-period reason field is bound to the editor's one reason
state). Save: `buildSessionDialogRequest` validates first (session gap/fold prompt, or row messages with the gap/fold prompt
inside the row naming "Break n"; nothing opens and nothing is sent while a problem remains). With no break listed and the box
unticked it opens the `alertdialog` "No breaks listed" (three stacked buttons, "Go back and add breaks" focused, Escape = Go
back, focus then on "Add break"); "Confirm no breaks taken" ticks the box in the draft (`setNoBreaks`) and builds with
`allowUnconfirmed: false`; "Leave breaks unconfirmed for now" builds with `allowUnconfirmed: true`. Then always the
`ConfirmDialog` "Save this session?" with Day, Time (`08:00-17:00 (zone)`, `+1` for a later end date) and Breaks
(`breaksSummary`), the sentence "Saving confirms these breaks as the breaks you took." (unconfirmed case: "Unconfirmed breaks keep
OT for this day pending until you confirm them."), buttons Back (focus returns to Save, values kept) and Save (POST or PUT with
today's body). Server errors: `serverBreakRowError` marks the row; a time problem shows the prompt; others are a form alert;
a stale version closes the dialog and shows the editor's stale notice. Cancel, Close (X) and Escape: `sessionDialogIsDirty`
true opens "Discard your changes?" (Keep editing focused, Discard danger); otherwise the dialog closes at once.

**Pre-fill (G-3 a).** New sessions only, when `policyOn` finds a policy: `referenceHours(policy, workDate, reportingZone,
inputZone)` then `applyReferenceHours`; suggested rows through `reshiftSuggestions`/`pastDaySuggestedRows` with the server's
`todayLocal` (only before it, only inside the session), re-shifted on every start or end change until a row is changed (the
model's `breaksEdited`). While no time was typed, a new input zone shows the same reference hours in that zone. Note:
"Pre-filled from your reference hours (08:00-17:00[ in {reporting zone} when the input zone differs])[ and suggested breaks].
Change them to the times you worked."; untouched suggestions carry a "suggested" tag.

**Nested dialogs.** One modal on top at a time (editor, session dialog, notice or confirmation, all DOM-nested in the editor).
The session dialog handles its own `cancel` (preventDefault, stopPropagation, its close path) and its Escape keydown (ignored
when the target is inside a nested dialog); the notice and the confirmations stop their Escape; the editor ignores Escape from
other dialogs and its re-show on crossing 1360px waits while another modal is open (existing B3-01 code). Focus: confirmation
to its opener; session dialog to Add session / Edit / Confirm breaks after Cancel or Discard, to the "Times" heading after a
save (and after a stale answer).

**Commands and results** (masked logs in `handoff/delivery/evidence/WP5-UX3-T08/`): 01 baseline (above). 02 `npm run typecheck`
exit 0. 03 `npm run lint` exit 0. 04 `npm test` 93 files, 2091 tests passed, exit 0. 05 `npm run build` exit 0, main chunk
`index-BMEYhCm0.js` 477.22 kB (gzip 140.05 kB; T07 had 458.49 kB), no chunk-size advisory. 06 `npm run test:e2e` alone, TEMP
and `E2E_SCREENSHOT_DIR` in the task folder: 590 passed (desktop 298, mobile 292), 66 skipped (desktop 30, mobile 36,
project-specific layouts), 0 failed, 14.6 min, exit 0; no `ERR_NO_BUFFER_SPACE`, no ECONNRESET. 07-09 simulated clock
(FIX10 `shiftclock.mjs` copied to the task folder only), `day-editor.spec.ts` on both projects, each alone with its own output:

| Simulated start (UTC) | Passed | Failed | Skipped |
|---|---|---|---|
| 2026-11-01T08:45:00Z (fall-back fold) | 83 | 0 | 17 |
| 2027-03-14T10:30:00Z (spring-forward gap) | 83 | 0 | 17 |
| 2026-10-27T06:58:30Z (90 s before reporting-zone midnight) | 83 | 0 | 17 |

14 `today.spec.ts` at 2026-10-26T16:00:00Z (window day, the "in progress" chip branch): 31 passed, 5 skipped, 0 failed.
10-12 mutations, each alone, rebuilt, reverted: (a) "Leave breaks unconfirmed for now" sends `breaks_confirmed: true`: 4 failed
(day-editor `:146` and `:694`, both projects, POST body); (b) `pastDaySuggestedRows` `<=` (temporarily in breakRowsModel.ts:547):
2 failed (`:593` today's dialog has rows); (c) the final confirmation's cancel (Escape) also runs the session dialog's close
(both close): 4 failed (`:2627` x2, `:2693` x2). 13 after the reverts (`git status` shows breakRowsModel.ts unchanged):
day-editor.spec.ts 83 passed, 0 failed. 15 `npm run verify` (SMOKE_PORT 48741, DATA_DIR and DATABASE_PATH in the task folder):
exit 0, "SMOKE PASSED". 16 `npm run digest` exit 1 (the unstaged deletion of SessionForm.tsx; git hash-object cannot read it),
then the probe (same algorithm over the files present, i.e. the digest once the deletion is staged):
`da580f1ec4df94fc438fc3594892657d41ded922e978519b7b9a4471e83f31d4` (830 files, handoff/ excluded). Nothing under src or tests
changed after verify.

**Privacy and whitespace.** Grep of the changed files and the evidence: only `example.invalid` addresses, no user-profile
path; every changed or new file: no trailing whitespace, no CR, exactly one final newline (helper check in the task folder).

**First-screen budgets 390x844 (unchanged):** landing 559.45 (no zone note) / 658.41 (zone note) of tab bar 788; received share
611.45 / 710.41; away 658.41 / 559.45.

**Changed assertions (final file:line; none removed or weakened; no skip, fixme or .only added).**
`day-editor.spec.ts:146`: the radios and "Suggest/Confirm suggested breaks" became the pre-filled rows (start time, minutes,
"ends", tag) shifted to 11:00/13:00/15:30, the unknown save goes through the notice and its POST body is asserted
(`breaks: []`, `breaks_confirmed: false`), the confirmed save through Suggest breaks and the confirmation; the figure and
stored-instant assertions are unchanged, the "Breaks confirmed" card pill is added. `:258`: the end date is typed because the
pre-filled end lies on the next date in the display zone (an explicit input, the stored-instant assertions unchanged); Cancel
now asserts the dialog closes at once; the reference hours following the input zone are added. `:337`, `:380`, `:434`, `:476`,
`:500`, `:546`: the form became the dialog and Save goes through the confirmation; prompts, radios and stored instants
unchanged; added: no confirmation before a time prompt, the dialog's reason field, rows not following a saved session's start.
`:1208`: the stale check asserts the dialog is gone. `:1464`: adds the full-screen and no-sideways-scroll checks of the dialog.
`:2193` ("Confirm breaks"): the radios became the listed rows; the PUT path, version, zone, start, end, three rows and no
reason are the same; added Cancel without change closes and returns focus, and the confirmation summary. `:2297`: the "No
breaks taken" radio became the box; Save disabled until the reason, typed in the dialog's field and seen in the panel; same
body. `:2346`: the pre-ticked "No breaks taken" radio is replaced by an empty unticked list and the notice's "Confirm no breaks
taken"; the body assertion (`breaks: []`, `breaks_confirmed: true`, version, zone) is the same. New: `:593` pre-fill, today
without rows, Discard/Keep editing; `:694` G-4 notice; `:790` break fold and gap prompts; `:860` row layouts at 720 and 430;
`:2620` nested Escape at 1366 and 1280 and while crossing 1360px; `today.spec.ts:787` the editor chip.

**Deviations and open points for the coordinator.**
1. T06 gap: there is no model function for suggestion rows without the past-day rule, which "Suggest breaks" (any day) and
   "Confirm breaks" (today's ended session) need. `SessionDialog.tsx` builds them (`suggestionRows`) from the shared
   `suggestBreaks` and the exported `BreakRowDraft` type; the T06 contract is unchanged. It has no unit test (tests cannot import
   `.tsx` and no new `.ts` file is an owned path); e2e `:146` and `:2193` cover it. A later model slice could move it.
2. "Confirm breaks" with no fitting suggestion no longer pre-ticks "No breaks taken": the list is empty and unticked and Save
   asks through the notice (the person decides; same body).
3. `periodPill` is passed only while the editor's date lies in the shown period (otherwise the day's own relation), because
   "Current period" can show another period while the editor stays on today; the brief's literal prop would then mislabel it.
4. The X button is named "Close" (the mockup says "Cancel"), so the dialog has one "Cancel" button.
5. Below 25.5rem the fields line of a row wraps (remove on its own line at 390px) to keep no sideways scroll until T08B's chips;
   the time field takes free room and break inputs have narrower side padding, so en-US dates and 12-hour times are not clipped.
6. `confirmBreaksDraft` in `dayEditorModel.ts` is no longer used by the app (removal is not in my owned scope); docs/04 lines
   16, 25, 63, 64 and 70 still describe the old form (slice T10).
7. Runtime-rule slips (read-only, no effect on results): one grep piped into `head`, one `tail -c` redirected to a file, and the
   mutation (a) command piped the client build into `grep -c` through `> /dev/stdout`. No other rule was broken.
8. No background task is left running (the full e2e run ended with exit 0; every later command ran in the foreground).

Status: done
