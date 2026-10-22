# WP5-UX5-T05B dispatch brief (the Day editor)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-T05B, package WP5, kind
  implement, attempt 1. It depends on WP5-UX5-T05A-FREEZE.
- **Why this is a separate slice.** Plan slice UX5-T05 was split (coordinator decision
  2026-10-22). T05A did the week sheets, the toolbar and the shared controls. This slice
  does the Day editor behaviour, U5-23 to U5-26.
- **Profile and routing.** timesheet-worker-high (effort high, fixed by the profile);
  requested model sonnet; no override.
  - Routing: size M, risk H, novelty no. It changes how a person enters and keeps day data:
    - the discard guard on an outside press;
    - a partial-leave draft written from a sub-dialog and saved with the day fields;
    - the reason field;
    - focus return;
    - a fixed Save on the phone.

    It follows the session dialog and `BreakSubDialog` patterns. docs/08 row "High-risk
    fix/slice with an existing pattern".
  - Write the task record in English.
- **Sources (read them in full):**
  - the plan `handoff/delivery/tasks/WP5-UX5-PLAN.md`:
    - section A, U5-23 to U5-26 (about lines 668-708);
    - F-7;
    - Addendum 1, "B5 'Notes' (checked in the code)" (about lines 1144-1149).
  - the mockups `handoff/delivery/design/WP5-UX5/mockup.html` and the renders B5 and B6
    (`mockup-r5-b5-editor-synthetic.png`, `mockup-r5-b6-phone-editor-synthetic.png`).
  - the owner's words on the board (`owner_decisions` 2026-10-21, the round-5 request,
    "3. Detail panel"; the answers F-7 a and B5).
  - `handoff/delivery/tasks/WP5-UX5-T04.md` and `WP5-UX5-T05A.md`, Results: the two layout
    queries (`SHELL_QUERY` 768px, `SHEET_QUERY` 480px), the 36px sub-buttons with their
    44px hit areas, and the icons. Build on them; do not undo them.
- **AGENTS.md on disk wins.** Rule 7, rule 8, rule 11, and the "Frontend and UI/UX
  standards" section. **The Day editor's drawer and bottom sheet stay switched at 768px
  (F-6 a).**
- **Base.** The WP5-UX5-T05A-FREEZE commit on origin/main, with its digest. The
  coordinator writes both under "Base at dispatch" below before dispatch. Before you edit,
  record HEAD, `git status --short` and the digest.

## Owner decisions that shape this slice

1. **U5-23, no corners.** The desktop drawer has `border-radius: 0`. The phone bottom
   sheet keeps its top corners: the owner's "detail panel" is the desktop drawer (plan
   assumption A; note it in Results). This reverses round-4 U4-06 by the owner's new words.
2. **U5-24 with F-7 a, a press outside closes the editor.**
   - **Desktop:** while the drawer is open, a `pointerdown` on the document calls the
     existing `requestClose` (with the "Discard your changes?" guard when the editor is
     dirty), unless the target is inside one of these:
     - a day column (`[data-day]`);
     - the drawer;
     - any dialog;
     - an interactive control (button, link, input, select, label, `[role=switch]`).

     Controls keep their own action, so Today still moves an open editor (docs/04).
     Another day column switches the day, as today.
   - **Phone:** a tap on the bottom sheet's backdrop (the `dialog` element itself, outside
     its box) calls `requestClose`.
   - Focus returns to the day button.
3. **U5-25, Partial leave in its own sub-dialog.**
   - The day fields show a summary row, "Partial leave  2:00 vacation" (or "None"), with
     "Change" or "Add".
   - The modal sub-dialog "Partial leave" holds hours, minutes, kind and the hint, with
     Remove leave, Cancel and Done. Follow the `ConfirmDialog` / `BreakSubDialog` pattern.
     Reuse `LeaveRow.tsx` and `leaveInputModel.ts`.
   - **Done writes only the day-fields draft.** Nothing reaches the server until "Save day
     fields", so the dirty guard and the reason field keep working.
   - Validation errors show in the sub-dialog. Cancel restores the earlier draft. Escape
     closes only the sub-dialog. Focus returns to Change or Add.
   - **B5:** the Notes field is the day's own note (`day_entries.notes`), not part of
     Partial leave. It stays in the Day editor.
4. **U5-26, the phone Day editor** (below 768px, the bottom sheet).
   - The sheet is a grid: head, body (scrolls), foot.
   - "Day figures" is not rendered on the phone. The server values remain on the desktop
     drawer.
   - The foot holds "Save day fields": full width, 44px, as the session dialog's foot.

## First: inventory, then stop if a path is missing

Before editing, list:
- the open, close and dirty-guard paths of the Day editor (`TimesheetScreen.tsx`
  `askBeforeDropping` and `requestClose`, `DayEditor.tsx`, `useEditorLayout.ts`), and every
  existing outside-press or backdrop handler;
- where Partial leave lives today (`DayFieldsForm.tsx`) and how its values reach the save
  request and the reason field;
- the tests that assert the drawer radius, the leave fieldset, the Figures section on the
  phone, the Save button position, or that an outside press does nothing;
- the docs/04 lines for the Day editor (the plan names :65, :67, :69, :77 and :101; find
  the current lines).

If a needed path is not in "Owned paths", stop and report before editing.

## Scope

1. **U5-23.** AC: the drawer's computed radius is 0 in both themes; the phone sheet keeps
   its top corners.
2. **U5-24.** AC:
   - A press on any of these closes the editor: the page background, the title, the
     period-card text, the paper margin, the legend.
   - With unsaved changes, "Discard your changes?" asks first, and Keep editing leaves
     everything as before.
   - A press on another day column switches the day.
   - A press on a button performs its own action.
   - A tap on the phone backdrop closes the sheet.
   - Focus returns to the day button.
3. **U5-25.** AC:
   - Done without Save changes nothing on the server.
   - Done then Save stores the leave, as today, with the reason when one is required.
   - Cancel restores the earlier draft.
   - Focus returns to Change or Add.
   - Escape closes only the sub-dialog.
   - Validation errors appear in the sub-dialog.
   - The summary row shows the draft value.
4. **U5-26.** AC at 390x844:
   - "Save day fields" is fully visible without scrolling, and stays at the same y after
     the body scrolls;
   - there is no "Day figures" section below 768px;
   - the foot's button is 44px and full width.
5. **Style.** Reuse the tokens. A new value is a CSS custom property, and a colour also in
   both dark sets. Each new control has every state, in both themes.

## Tests

- **Update** the tests the inventory found. List every changed assertion with file:line
  and its reason; weaken nothing.
- **New:** the AC above, in `day-editor.spec.ts`, desktop and mobile projects; the leave
  draft helpers in `leaveInputModel.test.ts` if they change.
- **Evidence:** synthetic renders of the drawer at 1440, the Partial leave sub-dialog, and
  the phone sheet at 390x844, scrolled and not scrolled (`-synthetic.png`, at most five).
- **Mutants** (each must fail a test):
  1. the outside press closes without the discard guard;
  2. a press on Today closes the editor instead of moving it;
  3. Done in the sub-dialog saves to the server;
  4. Escape in the sub-dialog closes the Day editor too;
  5. the phone Save scrolls with the body.

## Docs (EN and VI)

- `docs/04_UX_AND_SETTINGS.md` and `.vi.md`: only the Day editor lines these items make
  false. docs/12 and the pilot packet are UX5-T06's.

## Checks (in order; verify and the digest are the LAST commands)

1. Put Node 24 first on PATH; run `node --version`. Before any edit: HEAD,
   `git status --short`, `npm run digest`.
2. The inventory. Stop if needed.
3. Implement. Then run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`.
   The build must show no chunk advisory.
4. Run the e2e files you changed, each once.
5. Run the FULL e2e on both projects on the real clock, alone, after the last change, with
   0 failed. Only a network or buffer error may be rerun, once, and both runs are recorded.
   A worker crash is a failure.
6. The mutants.
7. Parity of the docs pair, then `validate_package.py --preflight` with the workflow
   Python. Write `<user>` in the evidence.
8. Privacy and whitespace checks (`git diff --check`). Synthetic data only.
9. `npm run verify` with `SMOKE_PORT` in 49780-49799, and `DATA_DIR` / `DATABASE_PATH` in
   the task folder.
10. `npm run digest` LAST. If you deleted a file and the digest script fails while that file
    is still in the index, run `git rm --cached` on exactly that file and report it. Change
    the index in no other way.

**Rules:** no `skip`, `fixme` or `.only`; no npm dependency change. Probe files in
`tests/e2e/` are not allowed; put probes in the task folder.

## Owned paths

- `src/client/`: `DayEditor.tsx`, `DayFieldsForm.tsx`, a new `LeaveDialog.tsx`,
  `LeaveRow.tsx`, `leaveInputModel.ts`, `TimesheetScreen.tsx` (the outside press only),
  `useEditorLayout.ts`, `dayEditorModel.ts`, `styles.css` (the Day editor block), and
  listed call-site follow-ups.
- `src/server/`: **none.** A needed server change is a stop.
- `tests/client/` and `tests/e2e/`, limited to these items.
- `docs/04_UX_AND_SETTINGS.md` and `.vi.md`, as limited above.
- this brief's Results section.
- `handoff/delivery/evidence/WP5-UX5-T05B/`.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-T05B`. Ports 49780-49799.
- Set TEMP, TMP, `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`, NO `node -`, NO
  `python -`), NO PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`,
  `/dev/zero` OR `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`, NO PID KILLS, NO
  INTERACTIVE SHELLS.**
  - Use the Write and Edit tools for files, and Glob and Grep for searches.
  - Redirect output to files in the task folder and read them with Read.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
- The workflow Python:
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- Never touch the data in `%LOCALAPPDATA%\timesheet-dev`. Do not install or change npm
  dependencies. Do not stage, unstage or commit anything, except the `git rm --cached` case
  in check 10.
- Mail goes only to local capture or the loopback test sink.
- Before returning, confirm that no background task is still running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done".

Return at most 120 words, beginning 'Self-reported model: ...'.

## Base at dispatch

- HEAD = origin/main = 70f7800b9c1582cffee453ac0bc8c741418f6f99 (WP5-UX5-T05A-FREEZE), or
  a later commit that changes only `handoff/`.
- Digest 665748778f55cb2240f350097892e03cbed8931bd7f0f56f6b1ed3250a892c24 (867 files).

## Results

Status: done (worker timesheet-worker-high, attempt 1; not independently audited)

Commands and outputs are in `D:\.claude-tmp\timesheet\WP5-UX5-T05B\` (`<user>` stands for the Windows account name). Node 24.21.0,
Git Bash, `TEMP`, `TMP`, `DATA_DIR` and `DATABASE_PATH` inside that folder, `SMOKE_PORT=49782`. Nothing was staged, unstaged or
committed; no file was deleted, so no `git rm --cached` was needed. Mail: none was sent (the e2e harness uses the capture sink).

- Before the first edit: node v24.21.0, HEAD 70f7800b9c1582cffee453ac0bc8c741418f6f99, `git status --short` as at dispatch (only
  `handoff/` paths), `npm run digest` = 665748778f55cb2240f350097892e03cbed8931bd7f0f56f6b1ed3250a892c24 (867 files). Evidence:
  `D:\.claude-tmp\timesheet\WP5-UX5-T05B\base.txt`, `digest0.txt`.
- Inventory done; every needed path is inside "Owned paths" (the client files live in `src/client/` and `src/client/components/`).
  Note: `LeaveRow.tsx` is the OT leave-request row (Record use / Cancel / Reverse), not the day's partial leave, so it is not reused;
  `leaveInputModel.ts` is, with one new pure helper `leaveSummary`.
- Inventory (before editing):
  - Open, close and guard: `TimesheetScreen.tsx` `askBeforeDropping` (a dirty editor asks "Discard your changes?"), `requestClose`
    (Close and Escape), `closeEditor`, `openEditor`, `unselectEditor`; `DayEditor.tsx` `keyDown` (Escape), the desktop document
    `keydown` listener, `onCancel`; `useEditorLayout.ts` (beside or floating; needed no change). Outside-press or backdrop handlers
    that existed: none for the editor (only the account menu and the shell menu close on a `pointerdown`).
  - Partial leave lived in `DayFieldsForm.tsx` (a fieldset: hours, minutes, kind, hint, refusal beside the fields); the draft
    (`DayFieldsDraft.leave`, `leaveKind`) went through `buildDayEntryRequest` with the page's reason into `PUT /api/days/:date`.
  - Tests that asserted the old behaviour: the drawer radius (`day-editor.spec.ts` U4-06 describe), the leave fields
    (`day-editor.spec.ts` leave tests, `controls.spec.ts` control scan), the Figures section on the phone (`openEditor` helper,
    several figure assertions, `controls.spec.ts` sub-button test), the Save button inside the form (`day-editor.spec.ts`), the
    keyboard stop of the scrolling dialog (`focus-ring.spec.ts`). None asserted that an outside press does nothing.
  - docs/04 lines (EN; the VI file is one line lower): :67 drawer corners and the sheet, :69 switching and the discard guard, :71
    order and the Save button, :79 leave, :103 radius scale.
- Assumption A (plan): the owner's "detail panel" is the desktop drawer, so the phone sheet keeps its top corners. This reverses the
  round-4 U4-06 corners by the owner's new words (U5-23).
- Implemented:
  - U5-23: `styles.css` `.day-panel-side` `border-radius: 0` (both docks).
  - U5-24: `TimesheetScreen.tsx` document `pointerdown` while the drawer is open (`OUTSIDE_PRESS_KEEPS`: `[data-day]`, `dialog`,
    `button`, `a`, `input`, `select`, `textarea`, `label`, `summary`, `[role=switch|button|option|menuitem|tab]`; primary button only;
    not on the window scrollbar) calling `requestClose`; `DayEditor.tsx` `backdropPress` for the phone (the dialog element itself,
    outside its box). Both call `event.preventDefault()` on the press they use: without it the browser's mousedown moved focus to the
    page after the editor (or the discard question) had taken it, and focus did not return to the day button.
  - U5-25: new `LeaveDialog.tsx` (modal on the `BreakSubDialog` pattern: hours, minutes, kind, hint, Remove leave, Cancel, Done; the
    refusal is shown in the dialog with `aria-invalid` and `aria-describedby`; Escape and Cancel close only it; focus returns to
    the opener); `DayFieldsForm.tsx` shows the summary row ("Partial leave  2:00 vacation" or "None", Change or Add) and Done
    writes only the draft (canonical hours and minutes; the kind is dropped without leave); `leaveInputModel.ts` `leaveSummary`.
    `LeaveRow.tsx` was not reused: it is the OT leave-request row (Record use, Cancel remaining, Reverse use), not the day's
    partial leave. The server still answers `leave_kind_required` on Save, shown under the fields as before. Notes stay in the
    Day editor (B5).
  - U5-26: below 768px `.day-panel-sheet[open]` is a grid (handle, head, body that scrolls, foot); `DayEditor.tsx` renders the
    `<footer data-editor-foot>` and no `DayFigures`; `DayFieldsForm.tsx` draws "Save day fields" into that foot through a portal
    (`footSlot`) with `form=` pointing at its form, so it still submits it; from 768px it ends the form as before. The foot button is
    44px and full width; the safe-area inset moved from the dialog into the foot. New tokens: none (existing custom properties
    only), so no dark-set work.
- Files (all inside "Owned paths"): `src/client/DayEditor.tsx`, `src/client/TimesheetScreen.tsx`,
  `src/client/components/DayFieldsForm.tsx`, new `src/client/components/LeaveDialog.tsx`,
  `src/client/components/leaveInputModel.ts`, `src/client/styles.css`; `tests/client/leaveInputModel.test.ts`,
  `tests/e2e/day-editor.spec.ts`, `tests/e2e/controls.spec.ts`, `tests/e2e/focus-ring.spec.ts`; `docs/04_UX_AND_SETTINGS.md` and
  `.vi.md`; `handoff/delivery/evidence/WP5-UX5-T05B/`. No `src/server` file, no dependency change. `.editor-actions` and the
  `.leave-fields` rules (the fieldset) were removed or narrowed because nothing renders them any more.
- Changed assertions in existing tests (nothing weakened; each reason is the item named):
  - `day-editor.spec.ts:118-125` `openEditor` waits for the "Figures" heading on a desktop and for the "Times" heading below
    768px (U5-26: no figures on the phone); new helper `figuresShown`.
  - `day-editor.spec.ts:278-296`, `:316-322`, `:925-926`, `:2943-2945`, `:4032-4034`: the figure assertions (status, credited,
    regular, eligible, expected finish, upcoming, complete) run where the figures exist (from 768px); on the phone the same tests
    assert that no Figures heading or `[data-figure]` exists, and the card state or the stored day carries the fact (U5-26).
  - `day-editor.spec.ts:2437-2503` (partial leave 240): the leave fields are now read and typed in the "Partial leave" dialog
    (`Add`, `Done`, the refusal as an alert in the dialog, the summary text), and "Done sends nothing" is asserted; the server's
    `leave_kind_required` refusal and the stored 240 / vacation / WFH result are unchanged (U5-25).
  - `day-editor.spec.ts:2514-2605` (malformed leave): the seven refusals, the aria markers and "nothing is sent" run in the
    dialog; valid 2h 30m and "empty fields save 0" go through Done then Save day fields (U5-25).
  - `day-editor.spec.ts:2620`, `:2650-2654`, `:2673`: "Save day fields" is found in the editor, not inside the form (U5-26: it is
    in the sheet foot on a phone).
  - `day-editor.spec.ts:2990`: the 44px-target scan treats `.leave-summary > button` as a sub-button (U5-25).
  - `day-editor.spec.ts:5034-5063` (was "the corners toward the sheet are round, the two on the edge are square"): now all four
    computed radii are `0px`, in the light theme, the dark system setting and the chosen dark theme (U5-23). The phone-sheet test
    (`:5080`, top corners 12px, bottom 0px) is unchanged.
  - `controls.spec.ts:466-472`: the Day editor scan expects one select (Category) and a new scan of the open Partial leave dialog
    expects the kind select as the second (U5-25). `:743-770` (sub-button test): Figures only from 768px and absent below; the
    partial leave's Add is checked as a 36px sub-button with its 44px hit area; "Save day fields" is a 36px sub-button from 768px
    and, below it, the 44px full-width button of the foot (U5-26). Title updated.
  - `focus-ring.spec.ts:279-318`: on the phone the scroller is the sheet body, which holds controls and so is no keyboard stop in
    Edge (observed: Tab from Close lands on "Add session"); the test asserts that first control shows the shared ring (and the
    inset ring if the body is a stop); the desktop path is unchanged. `styles.css` also gives the body the dialog's inset ring
    where a browser does make it a stop.
- New tests: `leaveInputModel.test.ts` `leaveSummary` (None, clock and kind words, 0:05, 24:00, unreadable text, all 1440 values);
  `day-editor.spec.ts` (both projects unless stated; project scoping uses the file's `test.skip(isMobile, reason)` convention, no
  unconditional skip, no `.only`, no `fixme`): outside press at 1280 and 1440 on the page background, title, period card text,
  paper margin and legend with focus back on the day button; the discard guard and Keep editing (focus back on the field);
  buttons, switch, drawer, a dialog backdrop and another column; phone backdrop tap with the guard; the Partial leave dialog
  (Done without Save, Cancel restores, Escape only the dialog, focus back on Change or Add, Remove leave, the guard sees the
  draft, Notes not in the dialog); Done then Save with the old-period reason (PUT body checked); Figures and an inline Save from
  768px; at 390x844 no Figures, Save fully visible, 44px, full width, same y after the body scrolled, the sheet itself not
  scrolling, and the foot's Save stores the fields.
- Checks (final state; every one run and completed):
  - `npm run typecheck` exit 0; `npm run lint` exit 0; `npm test` exit 0 (100 files, 2345 tests); `npm run build` exit 0, no chunk
    advisory (largest chunk 490.38 kB).
  - e2e on the changed files, once each, then the FULL e2e on both projects alone on the real clock: the first full run had 6
    failures, all from my own tests that the change made false (`controls.spec.ts` x4 select count, `focus-ring.spec.ts` mobile x2
    scrolling dialog) and fixed as listed above; it also showed the two focus bugs found earlier by the new tests (fixed with
    `preventDefault`). Final full run after the last change: 984 tests, 859 passed, 125 skipped (the project-scoped skips, as
    before the change), 0 failed, no rerun, exit 0 (`e2e-full2.txt`).
  - Mutants (each built, run and reverted; `grep MUTANT src` is empty afterwards): (1) outside press closes without the guard:
    killed by the "with unsaved edits a press outside asks" test; (2) a press on a button, Today included, closes the editor:
    killed by `today.spec.ts` "Today moves an open Day editor" and by the "press on a control keeps its own action" test; (3) Done
    saves to the server: killed by "Done sends nothing" in two tests; (4) Escape in the sub-dialog also closes the Day editor (both
    `stopPropagation` and the editor's nested-dialog guard removed): killed by the Escape step of the Partial leave test; (5) the
    phone Save scrolls with the body (no grid, the sheet scrolls): killed by the 390x844 test ("Save is fully visible").
  - `validate_package.py --preflight` with the workflow Python: PASS (122 translation pairs, 2337 local links, 91 scenarios;
    `application_tests_executed` false). The docs pair: the same five bullets are edited in both files, no heading added;
    the files already differ in length by three lines before this change.
  - `git diff --check` exit 0 and no trailing whitespace in the new file; no real name, address or secret in the new file or the
    evidence (the screenshots show "Example Employee" and `example.invalid`).
  - `npm run verify` with `SMOKE_PORT=49782` exit 0 (typecheck, lint, 2345 tests, build, "SMOKE PASSED").
- Evidence (`handoff/delivery/evidence/WP5-UX5-T05B/`, four synthetic renders): `u5-23-drawer-square-corners-w1440-synthetic.png`,
  `u5-25-partial-leave-dialog-w1440-synthetic.png`, `u5-26-phone-sheet-390x844-synthetic.png`,
  `u5-26-phone-sheet-scrolled-390x844-synthetic.png`.
- Docs (EN and VI): `docs/04_UX_AND_SETTINGS.md` :67, :69, :71, :79, :103 and the same bullets of `.vi.md`. docs/12 and the pilot
  packet are UX5-T06's and were not touched.
- Notes for the auditor and the coordinator:
  - A press on a phone-width window between 480 and 767px is the sheet's backdrop case; the desktop listener is off below 768px.
  - The outside press ignores a press on a link, so the wordmark and menus keep their action; a press on a bare part of the top
    bar closes the drawer.
  - The Save button in the phone foot is outside the `Day fields` form in the DOM (a portal with `form=`); any test or tool that
    looked for it inside the form must look in the dialog.
  - Not done and not asked: no change to `src/server`; the notice "Day fields saved." is at the top of the sheet body, so after a
    save from the foot with the body scrolled down it is announced (`role="status"`) but not in view.
- Nothing is staged (`git diff --cached --name-only` is empty). Untracked by this task: `src/client/components/LeaveDialog.tsx` and
  `handoff/delivery/evidence/WP5-UX5-T05B/`.
- Digest after the change (the last command): `a5dcb5a6e575b8ceae9fb79cc453b33898eb1202bdece5a5d9cbce03ad25b2db` (868 files, one
  more than at dispatch: `LeaveDialog.tsx`).
