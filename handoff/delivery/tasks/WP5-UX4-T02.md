# WP5-UX4-T02 dispatch brief (edge drawer, non-modal floating panel, content-based rule)

- **Task.** Mission timesheet-software-readiness, task WP5-UX4-T02, package WP5, kind
  implement, attempt 1. It depends on WP5-UX4-T01-FREEZE (done, commit 213bbdc).
- **Profile and routing.** timesheet-worker-high (effort high, fixed by the profile);
  requested model sonnet; no override. Routing: size M, risk M (accessibility and an
  unsaved-edit guard), novelty no. Write the task record in English.
- **Sources:**
  - the plan `handoff/delivery/tasks/WP5-UX4-PLAN.md`, items U4-05 (design a), U4-06 and
    U4-07, with their observations, design and acceptance criteria;
  - the mockup `handoff/delivery/design/WP5-UX4/mockup.html`, renders B5 and B6;
  - the owner's round-4 request and F-5 answer on the board (`owner_decisions` 2026-10-20,
    verbatim). The owner approved the mockup "mostly as drawn"; none of the named changes
    concerns these three items. **Where the owner's words differ from the plan or mockup,
    the owner's words win.**
- **AGENTS.md on disk wins** over any injected copy. Its UI section applies: tokens only,
  both themes, WCAG 2.2 AA, `--transition`, never `all`, no entrance or looping animation.
- **Base.** HEAD = origin/main = 213bbdc8a013c96e7144d59dd5802e467572779d, or a later commit
  that changes only `handoff/`. The digest is 1921c36f444c8161a963e5c36e1857d682080255b44a5539dc899b60730160e6
  (836 files). Before you edit, record HEAD, `git status --short` and the digest.

## What T01 changed that you build on

- **The paper.**
  - `[data-paper]` / `.paper` wraps the toolbar, both weeks and the footer, with the
    tokens `--paper-surface`, `--elev-paper`, `--paper-pad` (16px) and `--paper-gap`.
  - The week-card scroll window moved to 768-929px.
  - `day-editor.spec.ts:3604-3616` pins the scroll threshold at 913px.
  - `timesheet.spec.ts:33-38` pins `EDITOR_BESIDE_SHEET` at 1449px.
- **Review.** It now switches to two columns at 1330px, and uses `--page-max-editor` for
  the page beside its checklist.
  - U4-06 replaces the `--page-max-editor` widening of the Timesheet editor with a
    reservation.
  - **Keep the Review page's behaviour unchanged.** If the token must be split, give
    Review its own token and say so.

## Items

1. **U4-05: change or unselect a column while the panel is open** (plan design a).
   - **Opening.** At every desktop width (768px and up), the Day editor opens with
     `show()`: no backdrop, no `inert`, no `aria-modal`. The panel must not match `:modal`.
     Phones (below 768px) keep the modal bottom sheet.
   - **Switching and unselecting.**
     - A press on another column's day button, or anywhere on that column, switches the
       panel to that day.
     - A press (or Enter) on the open day's own button closes the panel. Focus stays on
       that button, and a polite status says "Day editor closed".
   - **Focus.**
     - The panel follows the sheet in the DOM: Tab goes from the sheet to the panel, and
       Shift+Tab leaves the panel.
     - Opening moves focus to the panel heading, as today.
     - Escape closes the panel wherever focus is; nested modals handle Escape first.
     - SC 2.4.11: when a control behind a floating panel receives focus and its box is
       wholly covered, the panel re-docks to the other side (`dockAwayFrom` on `focusin`).
       A focused control is never entirely hidden.
   - **Discard guard.**
     - If the Day fields form or the reason has unsaved edits, switching or unselecting
       first asks "Discard your changes?" through the existing `ConfirmDialog`, with
       "Keep editing" and "Discard".
     - Keep editing leaves the panel and its edits exactly as they were.
     - Today `DayEditor` is keyed by date, so a switch silently drops edits. Fix this for
       both beside and floating.
     - The session dialog is modal, so no switch can happen while it is open. Keep it so.
2. **U4-06: panel corners and edge drawer.**
   - In every desktop mode, the panel is a drawer flush with one window edge, from under
     the top bar to the bottom of the viewport.
   - Docked right, its radius is `--radius-lg 0 0 --radius-lg`; docked left, the mirror.
   - Beside mode becomes "push": the drawer is fixed at the edge, and the page reserves
     `--editor-width + --editor-gap` on that side.
   - Beside and floating share one geometry and differ only in whether the page is pushed.
   - The phone bottom sheet keeps its square bottom corners.
   - The editor column lift and the frame of at least 3:1 stay in both themes.
     docs/04's note that the frame is "claimed only beside the sheet" goes, because there
     is no side backdrop any more.
3. **U4-07: float only when the columns would overlap.**
   - **The model.** Add a pure `editorLayout({ viewportWidth, pagePadding, editorWidth,
     gap, sheetMinWidth })` in a new `src/client/components/editorLayoutModel.ts`.
     - It returns `bottom-sheet` below 768px.
     - It returns `beside` when `viewportWidth - pagePadding - editorWidth - gap >=
       sheetMinWidth`, otherwise `floating`.
     - `viewportWidth` is `document.documentElement.clientWidth`, so a classic scrollbar
       counts.
     - Every other input is read in px from CSS tokens. Add `--sheet-min-width` built from
       the label column, 7 x `--sheet-col-min`, the hairlines and 2 x `--paper-pad`.
   - **The hook.** A small hook re-evaluates the layout on resize. It may live in the model
     file or a new `src/client/components/useEditorLayout.ts`.
   - **CSS.** CSS keys on an attribute or class set by the hook. Remove the 1360 literal
     from both `TimesheetScreen.tsx` (`WIDE_QUERY`) and `styles.css`.
   - **Stability.** The decision depends only on the viewport, never on the current mode,
     so it cannot flap.
   - **Expected switch.** With 16px of paper padding it should land near 1330px with
     overlay scrollbars and near 1345px with a classic one. Report the measured value.

## Acceptance (from the plan, adjusted for T01)

- **U4-05:**
  - At 768-1920 with the panel open, a click on another day opens that day without
    closing first; `data-day-editor` changes.
  - A click or Enter on the open day's button closes the panel, and focus stays on that
    button.
  - No page element has `inert`, and the panel does not match `:modal`.
  - With unsaved day fields, a switch and an unselect both show the discard prompt. Keep
    editing keeps the values; Discard switches.
  - Tab order goes sheet, then panel. Escape closes the panel from a sheet control.
  - At every width from 768 to the switch point minus 1, a keyboard walk of the sheet
    never focuses a control whose box is fully under the panel (scan).
  - axe is clean.
- **U4-06:**
  - In each mode and on each side, the two corners on the edge side compute 0 and the two
    toward the sheet compute 12px.
  - The edge-side gap and the bottom gap to the window are 0.
  - In beside mode, the sheet is never under the drawer: the pushed content's right edge
    is at or left of the drawer's left edge minus 16px.
- **U4-07:**
  - Unit tests of `editorLayout` at need-1, need and need+1, for both scrollbar kinds.
  - An e2e sweep at the in-page computed need-1, need and need+1, and at 1024, 1280, 1440
    and 1920.
    - In beside mode: every day column is at least `--sheet-col-min`, the week card has
      `scrollWidth <= clientWidth`, and no cell overflows.
    - In floating mode: the model's available width is below the need.
  - The mode changes once per crossing.
  - `grep -n 1360` in `src/` finds no layout literal.
- Existing tests that pin the old modal floating panel, the 1360 switch or the
  `EDITOR_BESIDE_SHEET` width must follow the new rule. Recompute those widths from the
  model; do not hard-code a new magic number where the model can supply it.

## Docs

- **docs/04 and `.vi.md`** (the same numbers): the editor modes (drawer, push or float by
  the rule, non-modal), the switch and unselect behaviour, the discard prompt, the corners,
  the 2.4.11 re-dock, and "from 1360px" replaced by the rule with its measured value.
- **docs/10 and `.vi.md`.** Add a coordinator entry that supersedes the 2026-10-15 modal
  floating-panel decision (around docs/10:239). It cites the owner's round-4 request and
  the F-5 mockup approval, and states the 2.4.11 handling. Change no other docs/10 entry.

## Tests and mutants

Cover every acceptance item above.

Apply each mutant alone, check that a test fails, then revert it:
1. the floating panel opens with `showModal()` again;
2. the unselect toggle is removed (the open day's button no longer closes the panel);
3. the discard guard is removed;
4. `editorLayout` returns `beside` 1px early (`>` turned into `>=` on the wrong side, or
   the need minus 1);
5. the `focusin` re-dock is removed;
6. an edge-side corner radius becomes 12px.

## Checks (in order; verify and the digest are the LAST commands)

1. Put Node 24 first on PATH; run `node --version`.
2. Before any edit: HEAD, `git status --short`, `npm run digest`.
3. Implement. Then run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`.
   The build must show no chunk advisory; record the main chunk.
4. Run the FULL e2e on both projects, on the real clock, alone.
   - A failure whose trace shows `net::ERR_NO_BUFFER_SPACE`, or another network or buffer
     error, may be rerun alone once. Record both runs.
5. The mutant proofs.
6. EN/VI parity of docs/04 and docs/10, then `validate_package.py --preflight` with the
   workflow Python
   `"$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe"`
   (it has tzdata). Write `<user>` in the evidence.
7. Privacy and whitespace checks.
8. `npm run verify` with `SMOKE_PORT` in 49390-49409, and `DATA_DIR` / `DATABASE_PATH` in
   the task folder.
9. `npm run digest` LAST.

**Rules:**
- List every changed assertion with file:line and why it is not a weakening.
- No `skip`, `fixme` or `.only`.
- No server change.
- At most six `-synthetic.png` screenshots in evidence: drawer beside and floating, the
  left-docked drawer, the discard prompt, the unselected sheet, and the rule sweep.

## Owned paths

- `src/client/styles.css`
- `src/client/TimesheetScreen.tsx`
- `src/client/components/DayEditor.tsx`, `TimesheetSheet.tsx`, `SheetWeekTable.tsx`,
  `DayFieldsForm.tsx`
- new: `src/client/components/editorLayoutModel.ts`, `src/client/components/useEditorLayout.ts`
- tests:
  - `tests/client/editorLayoutModel.test.ts` (new), and unit tests for any model you touch;
  - `tests/e2e/day-editor.spec.ts`, `keyboard-access.spec.ts`, `timesheet.spec.ts`,
    `surfaces.spec.ts`, `focus-ring.spec.ts`, `hover.spec.ts`, `sharing.spec.ts`,
    `theme.spec.ts`, `shell.spec.ts`, `controls.spec.ts`
- docs: `docs/04_UX_AND_SETTINGS.md` and `.vi.md`, `docs/10_DECISIONS_AND_SOURCES.md` and
  `.vi.md`
- this brief's Results section
- `handoff/delivery/evidence/WP5-UX4-T02/`

`ConfirmDialog.tsx` is reused, not edited. If a change needs any path not listed here,
stop and report; do not edit it.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX4-T02`. Ports 49390-49409.
- Set TEMP, TMP, `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
  `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stderr` OR `nul`, NO `rm -r`, NO PID
  KILLS, NO INTERACTIVE SHELLS.**
  - Use the Write and Edit tools for files, and Glob for listings.
  - Redirect output to files in the task folder and read them with Read.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Run npm through that Node, never through the Program Files shim.
- Never touch the data in `%LOCALAPPDATA%\timesheet-dev`. Do not install or change
  dependencies.
- Before returning, confirm that no background task is still running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit.

## Return

At most 200 words, beginning 'Self-reported model: ...'. Include:
- per item, the change and the measured result, including the switch width;
- the files changed;
- the changed assertions;
- unit and full e2e counts per project;
- the mutant proofs;
- parity and preflight;
- the main chunk;
- the verify exit code;
- the final 64-hex digest and file count;
- any stop or deviation.

## Addendum 1 (coordinator, after the first hand-back)

**Path fix.** The brief's `src/client/components/DayEditor.tsx` was a coordinator error. The
owned file is `src/client/DayEditor.tsx`; the board now says so. Your edit there stands.

**Owned paths added:** `tests/e2e/today.spec.ts` (comment text only, item 3) and
`src/client/components/ConfirmDialog.tsx` (read-only unless item 1 truly needs a change;
report it if so).

1. **Close the discard-guard gap.** Your Results say a switch through the "Today" button
   still moves an open editor without asking. That is the silent loss of edits U4-05 was meant
   to fix.
   - With unsaved day fields or a typed unused reason, every action that would change the
     open day to another date, or close the editor, first asks "Discard your changes?"
     ("Keep editing" / "Discard"). This covers:
     - Today;
     - previous and next period;
     - any period or date picker;
     - Open a day;
     - a day button or column (already done);
     - unselect (already done);
     - the editor's close button;
     - Escape.
   - Keep editing changes nothing; this includes the period shown. Discard goes ahead.
   - Inventory every such route in `TimesheetScreen.tsx` and the components. List them in
     Results with how each one is guarded.
   - If a route already asks through another dialog, keep that dialog; do not ask twice.
   - Nested modals keep Escape first. With no unsaved edit, nothing asks.
   - Update the docs/10 entry and docs/04 (+ vi) so they no longer describe the Today gap.
2. **The time-dependent failure at `day-editor.spec.ts:3994`.** It expected "11:31:00" and
   got "11:31". The rerun rule covers only network or buffer errors, so a pass on rerun does
   not settle it.
   - Find the cause.
     - **If it is the test:** make the expectation follow the product's own rule
       deterministically. Either pin the clock for that test with the existing simulated-clock
       helper, or derive the expected format from the value the product holds. Do not loosen
       the check to a pattern that would also accept a wrong time.
     - **If it is the product** (the same instant shown in two formats), stop and report it
       with the evidence. Do not change the product for it; T03 owns the session and break
       fields.
   - Prove the fix: force the whole-minute case and the non-whole-minute case (for example
     with the simulated clock) and show that both pass.
3. **Stale comments.** `tests/e2e/today.spec.ts` lines 240 and 792 say "modal panel below
   1360px". Correct them to the new rule, as comments only. Leave `docs/12` to UX4-T06; it is
   recorded.
4. **Tests and mutants.**
   - Add a test for each newly guarded route: at least Today, a period change and Escape.
     Each covers both Keep editing and Discard, plus one test with no edit that shows no
     prompt.
   - Mutant 7: remove the guard from the Today route; a test must fail.
5. **Checks.** Rerun from step 3 of "Checks":
   - typecheck, lint, unit tests and build;
   - the FULL e2e on both projects, alone. Only a network or buffer error may be rerun;
   - mutant 7, plus a recheck that mutants 1-6 still fail. One quick run each is enough;
   - parity and preflight;
   - privacy and whitespace;
   - `npm run verify`, then `npm run digest` LAST.
6. **Results.** Write them under "### Addendum 1". Give the final counts and the digest.
   Keep the earlier sections as history.

## Results

Self-reported model: claude-sonnet-5-5 (timesheet-worker-high).

Status: done (one deviation and two follow-ups below).

### Base and runtime

- Before any edit: HEAD 213bbdc8a013c96e7144d59dd5802e467572779d; `git status --short` showed only the coordinator's handoff/ files and this
  brief; `npm run digest` 1921c36f444c8161a963e5c36e1857d682080255b44a5539dc899b60730160e6 (836 files). Node 24.21.0 first on PATH.
  Task folder `D:\.claude-tmp\timesheet\WP5-UX4-T02`; ports: SMOKE_PORT 49391 (Playwright picks free ports itself).
- Evidence: `handoff/delivery/evidence/WP5-UX4-T02/` (full e2e logs of both projects, the first desktop run, the rerun, mutants, verify,
  digests, preflight, privacy and whitespace checks, six `-synthetic.png` screenshots).

### Deviation (path)

The brief lists `src/client/components/DayEditor.tsx`, which does not exist. The Day editor is `src/client/DayEditor.tsx` (the plan
names it `DayEditor.tsx`). I treated that file as the owned one and edited it. No other path outside the owned list was touched.

### Changes per item

- **U4-05.** From 768px the editor always opens with `show()` (no backdrop, no `inert`, no `aria-modal`, not `:modal`); only the phone
  bottom sheet stays modal (`DayEditor.tsx`: `modal = bottomSheet`; the old `modal` prop is gone).
  - A press on another column's day button, or anywhere on that column (`openOnClick`), switches the drawer; a press or Enter on the open
    day's button closes it (`pressDay` in `SheetWeekTable.tsx`, `onUnselect` in `DayActions`), focus stays on that button and a polite
    live region `[data-editor-status]` says "Day editor closed". The drawer follows the paper in the DOM.
  - Discard guard: `DayFieldsForm` reports `dirty` (values differing from the day as loaded or last saved; typing and undoing is no edit),
    `DayEditor` adds a typed reason that no write has used yet, `TimesheetScreen` asks "Discard your changes?" with the existing
    `ConfirmDialog` ("Keep editing" / "Discard") before a switch (also through "Open a day") or an unselect. Keep editing changes nothing;
    Discard goes ahead. Opening the already open day changes nothing and asks nothing. The session dialog is still modal.
  - SC 2.4.11: on `focusin` while floating, a focused control outside any dialog whose box lies wholly under the drawer docks the drawer
    to the other edge (read after the frame, when the browser has scrolled the control into view). The keyboard-walk scan at 768, 800, 913,
    914, 1024, 1100, 1200, 1280 and 1329px found 13 to 17 such re-docks per walk and never a control that stayed entirely hidden.
- **U4-06.** One drawer geometry for beside and floating: `position: fixed`, from under the shell and share bars to the bottom of the
  window, flush right, radius `--radius-lg 0 0 --radius-lg`; `data-side='left'` mirrors it. Beside mode pushes: `.page` reserves
  `--editor-reserve` (`--editor-width + --editor-gap`) in its end padding and its cap grows by the same, so the sheet keeps the width it
  has without the drawer on wide windows. Measured in each mode and side: edge corners `0px`, sheet-side corners `12px`, gap to the edge
  and to the bottom `0`, top equal to the bar's bottom; beside, the paper's right edge is 31px left of the drawer (16px or more required).
  The phone bottom sheet keeps `12px 12px 0 0` (tested on the mobile project). `--page-max-editor` stays for the Review page only; its
  behaviour is unchanged (no token split was needed).
- **U4-07.** New pure `editorLayout` / `besideNeed` / `sheetRoomBeside` in `editorLayoutModel.ts`; the hook `useEditorLayout.ts` measures
  `--page-pad` (2x), `--editor-width`, `--editor-gap` and the new `--sheet-min-width` (label column + 7 x `--sheet-col-min` + 2 hairlines + 2 x
  `--paper-pad`, with `--sheet-days` moved to `:root`) through a hidden probe and re-evaluates on resize and on a width change of the root
  element. `TimesheetScreen` puts `data-editor-layout` on `.sheet-area` and the class `with-editor` while the editor is open beside the sheet.
  The media query, not the model, decides the phone (a classic scrollbar makes the model's width up to 15px narrower), so that sliver reads
  as floating. `grep -n 1360 src/` finds nothing (also asserted by a unit test).
  **Measured switch: 1330px** of window width with overlay scrollbars (scrollbar 0px in the test browser; room 881 of 882 at 1329px, 882
  at 1330px; columns 108.0px at 1330px). With a classic 15px scrollbar the model puts it at a window width of 1345px (unit test; a classic
  scrollbar cannot be shown in the headless test browser). One layout change per crossing, up and down, with the drawer open throughout.

### Files changed

Source: `src/client/DayEditor.tsx`, `src/client/TimesheetScreen.tsx`, `src/client/styles.css`, `src/client/components/DayFieldsForm.tsx`,
`SheetWeekTable.tsx`, `TimesheetSheet.tsx`; new `src/client/components/editorLayoutModel.ts`, `useEditorLayout.ts`.
Tests: new `tests/client/editorLayoutModel.test.ts`; `tests/e2e/day-editor.spec.ts`, `tests/e2e/timesheet.spec.ts`.
Docs: `docs/04_UX_AND_SETTINGS.md` and `.vi.md`, `docs/10_DECISIONS_AND_SOURCES.md` and `.vi.md`. No server change. No dependency change.
`controls.spec.ts` needed no edit (the status line stands before the paper so its "nothing after the paper" assertion still holds).

### Changed assertions (file:line in the final files, and why none is a weakening)

All in `tests/e2e/day-editor.spec.ts` unless noted. Each followed the owner decision that the drawer is never modal from 768px and that the
switch is the model's rule, not 1360px.
- 2771: the Escape-order test expected a modal editor below 1360px; it now expects non-modal on desktop and modal on the phone (an exact
  equality on `isMobile`, so the phone check is stronger).
- 3248-3330: the B-02 walk. The old test walked inside a modal panel that trapped focus, so its "not hidden" check held trivially there;
  now the page is not inert and the walk covers nine floating widths up to 1329px, rechecks after the re-dock, and fails if a control stays
  wholly under the drawer (mutant 5 proves it). The 1280/1366 test no longer skips the focus assertions that only a non-modal panel allowed.
- 3311, 3475, 3522, 3562, 4254, 4288, 4326, 4392, 4420, 4484: `:modal` expectations `true` to `false` for the desktop drawer.
- 3464 (1359 to the model's last floating width 1329), 3553 (1360 to the model's 1330) and `setClientWidth` instead of a literal viewport:
  the widths come from `besideNeed`; a test measures the page's own tokens and fails if the constants drift.
- 3500-3531: the floating-drawer test dropped the `::backdrop` colour check (no backdrop exists any more) and asserts that nothing is inert.
- 3564-3575: beside mode now asserts `data-editor-layout='beside'`, `data-side='right'`, a page within the cap plus 416px, and the drawer
  at least 16px clear of the paper (it asserted the old 1600px cap and a drawer merely right of the card).
- 4263, 4402: `settleAfterResize` uses `BESIDE_NEED`; 4287-4289 and 4419-4421: after the review or the session dialog closes, both widths now
  assert the same non-modal drawer and the focused opener (the old floating branch asserted a modal panel holding focus).
- `tests/e2e/timesheet.spec.ts:42` `EDITOR_BESIDE_SHEET`: 1449 is now `besideNeed(...) + 7 x (125 - 108)` = 1449 (same value, derived from
  the model; whole-pixel columns kept).
- The text of `today.spec.ts` comments (lines 240 and 792) still says "modal panel below 1360px"; the file is not owned and its tests pass
  (they run at 1440px). It needs a comment fix by its owner.

### New tests (`day-editor.spec.ts`, `editorLayoutModel.test.ts`)

U4-05: switch, cell press, unselect with focus and status (mouse and Enter) at 768, 1024, 1280, 1440 and 1920px, with no `inert`, not
`:modal`, no `aria-modal`; Tab sheet to drawer and Shift+Tab out (1280, 1440); the re-dock on focus of a covered control; the discard
prompt on a switch and an unselect (Keep editing keeps the value, Discard goes ahead, a saved day asks nothing, 1280 and 1440); a typed
reason through "Open a day". U4-06: corners, gaps and the bar offset for floating-right, floating-left and beside, and the phone sheet.
U4-07: unit tests at need-1, need and need+1 for both scrollbar kinds, the switch point of each, one change per crossing, no 1360 literal;
an e2e sweep at need-1, need, need+1, 1024, 1280, 1440 and 1920px (beside: columns at least 108px, no week card or cell overflow, no
word wider than its cell; floating: the room beside the drawer is below the minimum sheet) and a one-change-per-crossing sweep both ways.

### Counts

- `npm test`: 96 files, 2164 tests passed (before this task: 95 files; the new file adds 9 tests).
- Full e2e on the real clock, alone. Desktop run 1 (before the last source change): 370 passed, 32 skipped, 2 failed
  (`controls.spec.ts:95` light and dark: my live region stood after the paper and broke its "nothing after the paper" assertion; fixed by
  moving the region before the paper, no assertion changed). Desktop final: 371 passed, 32 skipped, 1 failed:
  `day-editor.spec.ts:3994` ("Confirm breaks" ... lists the suggested break) expected "11:31:00" and the time input showed "11:31", a
  whole-minute start (the test's own seconds format depends on the clock second); it passed alone on rerun (1 passed). Not related to
  this change; no network or buffer error occurred. Mobile final: 345 passed, 59 skipped, 0 failed.
- `npm run typecheck`, `npm run lint` (no deprecation warning), `npm run build`: exit 0. Main chunk 493.45 kB, no chunk advisory.

### Mutants (each applied alone, a test failed, then reverted; the source diff after the last revert is the tested one)

1. floating drawer opens modal again (`bottomSheet={!desktop || floating}`): 9 of the 15 new U4 tests failed.
2. unselect toggle removed (`pressDay` always opens): 7 failed.
3. discard guard removed (dirty never reported): 3 failed.
4. `editorLayout` 1px early (`sheetRoomBeside + 1 >= sheetMinWidth`): 3 unit tests and the U4-07 e2e failed.
5. `focusin` re-dock removed: 9 scan tests and the re-dock test failed.
6. edge-side corner radius 12px: the right-docked floating and beside tests failed (the left-docked rule overrides it, as expected).

### Parity, preflight, privacy

- EN/VI parity of docs/04 and docs/10: same headings, bullet and table counts (04: 8/42/26, 10: 26/102/31); the new Day editor text is
  three bullets in each language, the docs/10 entry is one section of four bullets in each.
- `validate_package.py --preflight` with the workflow Python (`C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`):
  PASS, 118 translation pairs, 2319 local links, application tests not executed by it.
- Privacy and whitespace: `git diff --check` exit 0; no trailing whitespace or tabs in the new files; no email, profile path or secret-like
  assignment in the added lines.

### Verify and digest

- `npm run verify` (typecheck, lint, test, build, smoke) with SMOKE_PORT 49391 and DATA_DIR and DATABASE_PATH in the task folder: exit 0,
  SMOKE PASSED.
- `npm run digest` last: a56b26fd0a49cb56cea32c6b26860e0b1ce30e2259a02d1a5c658f9633d80bc9 (839 files: the 836 plus the three new files).
- No background task is still running. Nothing was committed or staged.

### Follow-ups for the coordinator

- Fix the two stale comments in `tests/e2e/today.spec.ts` (not owned) and `docs/12_RELEASE_NOTES*.md` line 39 ("from 1360px"), which this
  task did not own.
- A switch through the "Today" button still moves an open editor without asking (the brief names a switch by day button and an unselect);
  document 10 says so.

Commit description: Day editor becomes a non-modal edge drawer: switch and unselect by day button with a discard guard, square edge corners and a content-based beside/floating rule (1330px) replacing the 1360px literal.

### Addendum 1

Status: done. The two follow-ups of the first hand-back are closed. Evidence files carry the prefix `a1-` in `handoff/delivery/evidence/WP5-UX4-T02/`.

**1. Discard-guard gap closed.** One guard, `askBeforeDropping(proceed, keep?)` in `TimesheetScreen.tsx`: it runs `proceed` at once unless the open
editor reports unsaved day fields or an unused reason, and then opens the existing `ConfirmDialog` ("Discard your changes?", "Keep editing" /
"Discard"). Keep editing changes nothing (an action that touched hidden state first puts it back); Discard drops the edits and goes ahead. A
period step or "Current period" with Discard leaves the editor open and remounts it from the saved day (`editorEpoch` in its key). No second dialog
exists for any route, and no edit to `ConfirmDialog.tsx` was needed. Route inventory:
- day button or column: `openEditor`, guarded (first hand-back);
- the open day's button (unselect): `unselectEditor`, guarded (first hand-back);
- "Open a day": goes through `openEditor`, guarded;
- "Today": `jumpToToday` fetches the server's periods first (a read), then asks before it moves the sheet or the editor, and only when the jump is
  active; Keep editing restores the hidden announcement and leaves the period shown;
- "Previous period" and "Next period": `move`, guarded before the request;
- "Current period": `jumpToCurrent`, guarded before the request (the button still moves focus to Today before it runs, because `PeriodBar.tsx` is not
  owned; Keep editing therefore returns focus to the Today button);
- the editor's Close button and Escape: `DayEditor`'s `onClose` is now `requestClose`, guarded on the desktop drawer and the phone sheet alike; a nested
  modal keeps Escape first, so Escape on the question is Keep editing;
- there is no other period or date picker on the page.
Not guarded, with the reason: a link that leaves the Timesheet page (top bar, "Review & sign off", sign out) unmounts the screen; and the editor's
reload after a label or batch commit changed that very day (the form must follow the saved day). Docs: docs/04 and docs/10 (EN and VI) now list the
routes and no longer describe the Today gap.
Tests (`day-editor.spec.ts`, "addendum 1"): Today (period shown included), Next period, and Escape plus Close (desktop and phone), each with Keep
editing, Discard and a no-edit case that shows no prompt; the "Open a day" and day-switch routes keep their tests from the first hand-back.

**2. `day-editor.spec.ts` "Confirm breaks ... ended earlier today" ("11:31:00" vs "11:31").** Cause: the test. The browser's time input holds the shortest
valid time string, "HH:MM" when the seconds are 0 and "HH:MM:SS" otherwise; the test seeded the session at the server's own clock second and
always expected "HH:MM:SS", so it failed one run in sixty. The product holds one value, shown in the input's own format. Fix: the start's second is
pinned, the test is split into two cases (whole minute at 0 s, 17 s past the minute) and the expected value follows the input's rule exactly (the
whole minute expects "HH:MM", the other "HH:MM:SS"); nothing is loosened to a pattern. Proof: both cases pass (`a1-targeted-new-tests.txt`), and with the
old expectation forced back the whole-minute case fails deterministically with Expected "11:59:00", Received "11:59" while the 17 s case passes
(`a1-confirm-breaks-old-expectation-fails.txt`). No product change; no simulated clock was needed.

**3. Comments.** `tests/e2e/today.spec.ts` lines 240 and 792 now describe the non-modal drawer and the 1330px rule; comment text only. `docs/12` untouched.

**4. Checks (all after the last source change).**
- `npm run typecheck`, `npm run lint`: exit 0. `npm test`: 96 files, 2164 tests passed. `npm run build`: exit 0, main chunk 493.65 kB, no advisory.
- Full e2e, alone, real clock: desktop 376 passed, 32 skipped, 0 failed; mobile 347 passed, 61 skipped, 0 failed. No rerun was needed and no network or
  buffer error occurred.
- Mutant 7 (the Today guard removed): the Today test failed (1 failed; Next period and Escape/Close still passed, as they should). Mutants 1 to 6 rechecked, one run
  each, all still fail: 1 six U4-05 tests; 2 seven; 3 six (including the new addendum tests); 4 three unit tests and the U4-07 e2e; 5 ten; 6 two. Every mutant was
  reverted and the source checked clean (`a1-mutants.txt`).
- Parity EN/VI of docs/04 and docs/10: same headings, bullets and table rows (04: 8/42/26, 10: 26/102/31). Preflight with the workflow Python
  (`C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`): PASS. Privacy and whitespace checks clean.
- `npm run verify` (SMOKE_PORT 49392, DATA_DIR and DATABASE_PATH in the task folder): exit 0, SMOKE PASSED.
- `npm run digest` last: 04e16199ea66d3144fcb34ad4a7716c929b45f22fac0fd7b350450d271a80918 (839 files).
- No background task is still running. Nothing was committed or staged.

Commit description: Guard every route that moves or closes the open Day editor (Today, period steps, Close, Escape) with the discard question; make the Confirm breaks test deterministic for whole-minute starts.
