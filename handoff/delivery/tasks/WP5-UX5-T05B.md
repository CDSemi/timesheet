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

(written by the coordinator before dispatch)

## Results
