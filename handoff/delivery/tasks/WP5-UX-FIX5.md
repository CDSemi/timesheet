# WP5-UX-FIX5 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-FIX5; package WP5; kind fix;
  attempt 1; addresses audit WP5-UX-AUDIT-B3 (FIX REQUIRED); depends on WP5-UX-REGATE2
  (PASS).
- Findings in `handoff/delivery/WP5_UX_REVIEW_B3.md` (section "Findings"; evidence in
  `handoff/delivery/evidence/WP5-UX-AUDIT-B3/`, especially the `46-…`, `51-…`, `61-…` and
  `30-…` files and the `a2ea7a4-pc6-*-synthetic.png` screenshots):
  - **WP5-UX-B3-01 (Low):** `src/client/DayEditor.tsx` around lines 83-95 (the
    mode-switch effect: `element.close()` then `showModal()` and `heading.focus()`) with
    97-109. At 1280px with the modal "Review label change for {date}" open over the
    non-modal editor, resizing to 1024px re-shows the editor as a modal above the review
    and moves focus into it; the first Escape closes the editor, not the review; focus
    then sits on BODY while the review stays open. Nothing is saved. docs/04 line 59 says
    a nested dialog takes Escape first and focus returns to the day's date button (WCAG
    2.2 SC 2.4.3). Required: when the editor must switch mode while another modal dialog
    is open, keep that dialog on top and focused (defer the switch until it closes, or
    re-show it after the editor). Add a desktop e2e test: 1280 to 1024 with the review
    open: the review stays on top and focused; the first Escape closes only the review
    (nothing saved) with the editor still open and focus inside it; the next Escape
    closes the editor and focus returns to the day's button. Also cover the reverse
    (1024 to 1280 with the review open).
  - **WP5-UX-B3-02 (Low, docs):** docs/04 line 55 (EN and VI) says "Open a day" accepts
    "any date of the period"; it opens any accounting date, also outside the displayed
    period. Fix the wording in both files (for example: any date, also outside the
    displayed period). Do not change the control.
- Optional items from the same review, included in this task:
  - **O-5:** the FIX4 sub-assertion in `tests/e2e/timesheet.spec.ts` around line 142
    ("the date value is not clipped", `scrollWidth <= clientWidth`) cannot fail for a
    Chromium date input. Replace it with a check that can fail (for example the field's
    width is at least the measured width the full formatted date needs); never weaken
    the width assertion.
  - **R-7:** `--date-field-min` (9.5rem, 142.5px) is about 11px wider than the full date
    needs, so the "Open a day" row wraps below about 388px and the first row ends below
    the tab bar at 375x844 with the zone note (827.4) and at 320x844 (791.2). Tune the two
    tokens to the measured need so the field still shows the full date at 390, 375, 360
    and 320px, and record the first-row bottom at 390, 375, 360 and 320 (with and without
    the zone note). The rule only promises 390x844; do not trade the 390 result for the
    narrower widths.
- Profile/routing: timesheet-worker-high (effort high), requested model **opus**,
  `model_override_reason` **escalation** (the third consecutive FIX REQUIRED in area B;
  dialog stacking and focus management need a careful fix that does not open a new
  edge case; docs/08 escalation rule). Routing: size S, risk M (edit-surface focus
  logic), novelty no. Task record in English.
- Base: HEAD = origin/main (record it; the coordinator may have committed records since
  a2ea7a4) with source digest
  0b8428fdbfc40598ba0c468486b4aa62367434727709ce62461a8984f130b77d (frozen at a2ea7a4).
  Record both before you start. Uncommitted coordinator files under `handoff/` are
  expected; never touch them.

## Read

- AGENTS.md from disk first.
- `handoff/delivery/WP5_UX_REVIEW_B3.md` (findings, O-5, R-7, R-1..R-6) and its evidence.
- `handoff/delivery/WP5_UX_REVIEW_A3.md` and `WP5_UX_REVIEW_A2.md` (R2: the same
  scenario seen from area A; nothing must be written or bypassed).
- The Results of WP5-UX-T04, FIX3 and FIX4 (how the side panel, the modal editor below
  1200px, the in-cell picker review and the phone "Open a day" row were built).
- docs/04 lines 40-70 (EN and VI).

## Hard constraints

- No server, API, request-body or calculation change; the review dialog keeps its
  confirmation and reason behaviour (AC-04); nothing is saved by Escape.
- Keep every existing behaviour the earlier audits verified: modal editor below 1200px
  with inert page and focus trap, non-modal side panel from 1200px, Escape closing the
  editor from anywhere when no nested dialog is open, focus return to the day's button,
  the phone first-screen budget at 390x844, the FIX2 leave validation and the FIX1 zone
  text. No e2e assertion removed or weakened.
- **Self-check before returning** (the area-B auditors probe these edges): resize
  1280 → 1024 → 768 → 1280 with (a) only the editor open, (b) the label-change review
  open, (c) the leave validation alert showing; Escape order and focus location after
  each step; phone 390/375/360/320 with the "Open a day" field filled. Record the
  observations in Results.

## Owned paths

- `src/client/DayEditor.tsx`
- `src/client/components/TimesheetSheet.tsx`, `src/client/components/SheetWeekTable.tsx`,
  `src/client/components/labelPickerModel.ts`, `src/client/components/BatchDialog.tsx`
  (only if the nested-dialog fix needs them; list each one you change)
- `src/client/styles.css` (tokens only)
- `tests/e2e/` spec files (`*.spec.ts`); `tests/e2e/fixtures.ts` is NOT owned
- `tests/client/` unit tests
- `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md`
- this brief's Results section
- `handoff/delivery/evidence/WP5-UX-FIX5/` (masked LF `.txt` only, plus screenshots whose
  basenames contain `synthetic`)

If another file must change, stop and report it instead of editing it.

## Checks (in this order; verify and digest are the LAST commands)

1. Put Node 24 first on PATH, then `node --version` (v24.x).
2. Reproduce B3-01 at the base with the new e2e test failing; record the failing run.
3. Fix; `npm run typecheck`, `npm run lint`, `npm test`.
4. The FULL e2e suite on both projects (with `E2E_SCREENSHOT_DIR` inside the task
   folder). Record counts.
5. The self-check above; synthetic screenshots (at most four) named
   `fix5-*-synthetic.png`.
6. EN/VI parity of the docs/04 change; `validate_package.py --preflight` by its script
   path with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
   (write `<user>` in the evidence).
7. A Grep over your changed files and evidence for user-profile paths and email
   addresses; record the counts.
8. `npm run verify` with `SMOKE_PORT` in 48100-48109 and `DATA_DIR` and `DATABASE_PATH`
   set inside the task folder.
9. `npm run digest` LAST. If any file changes after it, rerun verify and the digest.
10. Copy masked logs of steps 2-4, 6, 8 and 9 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -e`, NO `node -` OR
  `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM
  `/dev/null` OR `nul`.** Redirect to a file in the task folder and read it with the
  Read tool. Use the Write and Edit tools for files.
- **Create files only inside the task folder, the evidence folder or your owned paths;
  never anywhere else (two stray files were left at the D: drive root this round).**
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX-FIX5`: set TEMP and TMP to it. Never touch
  `%LOCALAPPDATA%\timesheet-dev` data.
- Never kill processes by PID. Never remove anything recursively. Never write into the
  repository root.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool and finish with "Status: done". Do not commit or
  push.

## Return

At most 160 words, beginning with 'Self-reported model: ...': the reproduction, the fix
per item and why, the self-check observations, files changed, unit and full e2e counts
per project, preflight and verify exit codes, the final full 64-hex digest, the evidence
files, the background-task confirmation, and any stop or deviation.

## Results

- Worker: self-reported model `claude-opus-5-5`, attempt 1, 2026-10-09 (UTC 10:17Z to 10:38Z). Not committed.
- Base recorded first: HEAD = origin/main = `a2ea7a48ca7dbb275f5d1f7c3a3003b1658080cb`; digest
  `0b8428fdbfc40598ba0c468486b4aa62367434727709ce62461a8984f130b77d` (789 files), Node v24.21.0
  (`00-base-node-head-digest.txt`).
- **Reproduction (B3-01):** the two new desktop e2e tests run on the base client (fresh build): 2 failed; at
  1024px the review was `modal: true` but `focus: false`, `onTop: false` (`02-repro-B3-01-failing-at-base.txt`).
- **B3-01 fix (`src/client/DayEditor.tsx`):** the mode-switch effect no longer re-shows the editor while another
  modal dialog is open (`otherModalOpen`: any `dialog:modal` other than the editor). It defers the switch with a
  `MutationObserver` on `document.body` (child list and the `open` attribute) and applies it once no other modal
  dialog is left; the effect cleanup disconnects it (a resize back, or unmount). Why: the review and the
  clock-out dialog close by unmounting as well as by `close()`, so a `close` event alone is not reliable; the open
  dialog keeps the top layer, focus and Escape; the editor never stacks above it. Nothing else changed: the
  switch itself, `heading.focus()`, the Escape handlers, focus return and every server call are as before.
  New tests in `tests/e2e/day-editor.spec.ts` ("WP5-UX-B3-01 ...", desktop only): 1280 to 1024, and 1280 to 1024
  to 1280, with the review open: the review stays modal, focused and on top (centre and Cancel hit tests), the
  editor does not hold focus; the first Escape closes only the review (only the preview request was sent, the
  day stays Worked) with the editor still open (at 1024 it is now `:modal` and holds focus; at 1280 non-modal and
  focus is back on the picker); the next Escape closes the editor and focus returns to the day's button.
- **B3-02 (docs/04 line 55):** EN "(any date, also outside the displayed period)", VI "(mọi ngày, kể cả ngoài kỳ
  đang hiển thị)"; no control change (`06-docs-parity.txt`).
- **R-7 (tokens only, `src/client/styles.css`):** measured in Edge at 15px root font: the date glyphs are 76.39px
  (tabular digits, any date), "mm/dd/yyyy" 84.23px; the narrowest field showing the text whole is 118px for a
  date (117 clipped) and 126px for the empty field's "mm/dd/yyyy" (125 clipped). `--date-field-min` 9.5rem to
  **8.5rem** (127.5px, covers both), `--open-day-label-min` 15.25rem to **14.25rem** (same 5.75rem label share).
  First day row bottom, field empty, tab bar top 788 (`05a-…`, README table): zone equal 390 659.0 (unchanged),
  375 676.4 (was 728.4), 360 728.4, 320 791.2; zone note 390 758.0 (unchanged), 375 775.4 (was 827.4), 360
  827.4, 320 924.9. The row now wraps below about 373px instead of 388px; 360 and 320 are unchanged and stay
  outside the 390x844 rule. With 2026-10-09 typed the field is 146.2 / 131.2 / 220.0 / 180.0px at
  390/375/360/320, the date whole in every screenshot, no sideways scroll.
- **O-5 (`tests/e2e/timesheet.spec.ts`):** the vacuous `scrollWidth <= clientWidth` sub-assertion is replaced by
  measured needs: glyph width of the shown value (and of "mm/dd/yyyy" for the empty field) in the field's own
  font + padding + borders + `DATE_FIELD_CHROME` 23.5px (the inner field padding and calendar icon, derived from
  the thresholds above). New checks: the empty field >= its placeholder need; the token >= both needs (this
  replaces the fixed proxy `>= 135`, which the tuned token is below; the guard now fails whenever the token is
  under the measured need); the filled field >= the value need. Kept unchanged: `box.width >= minimum - 0.5`,
  no sideways scroll, the annotation and screenshot. Width 375 added to the loop. A mutation probe (589bcff-like
  rules through the CSSOM) shows the old check passing everywhere while the new ones FAIL at 360 (placeholder
  124.2 < 125.7) and 320 (value 104.75 < 117.9; screenshot `fix5-o5-mutation-clipped-w320-synthetic.png`).
- **Self-check (`05-selfcheck-resize-desktop.txt`, fresh synthetic person each):** 1280 to 1024 to 768 to 1280,
  ending at each step. (a) Editor alone: modal at 1024 and 768, non-modal at 1280, focus on its heading after
  every switch; one Escape closes it and focus is on "Edit {date}". (b) Review open: the review stays modal, on
  top and focused at 1024, 768 and back at 1280 (the editor stays non-modal behind it, deferred); first Escape
  closes the review: at 1024/768 the editor becomes modal with focus on its heading, at 1280 focus is on the
  label picker; second Escape closes the editor, focus on "Edit {date}". (c) Leave alert ("2-" in Leave hours,
  Save refused): the alert stays through every switch; focus moves from the leave field to the heading on a
  switch (pre-existing switch behaviour, unchanged); one Escape closes the editor, focus on "Edit {date}". In all
  nine runs: no POST/PUT/DELETE other than the label preview, the worked day stays Worked, leave stays 0.
  Phone 390/375/360/320 with the field filled: see R-7.
- **Checks:** typecheck 0, lint 0, `npm test` 0 (82 files, 1820 tests). Full `npm run test:e2e` exit 0: 186
  tests, 170 passed, 16 skipped, 0 failed; desktop 84 passed + 9 skipped, mobile 86 passed + 7 skipped (all skips
  project-scoped; +2 desktop B3-01 tests, +1 phone 375 test) (`04-…`, `04d-…`, `04e-…`). Preflight PASS, exit 0
  (`C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`, `06a-…`).
  Sensitive grep: 0 user-profile paths and 0 e-mail addresses in the 7 changed files and every evidence text
  (`07-…`). `npm run verify` exit 0 (SMOKE_PORT 48104, DATA_DIR/DATABASE_PATH in the task folder; `08-…`).
- **Final digest (run last over the source):** `b7bbcbc0a5bbb097a5547b441d1228f20963445e86b0429169cb7ab47980a873`
  (789 files, handoff/ excluded; `09-digest-final.txt`). Only this Results section and the evidence README under
  `handoff/` were written after it (excluded from the digest).
- **Files changed:** `src/client/DayEditor.tsx`, `src/client/styles.css` (two token values),
  `tests/e2e/day-editor.spec.ts`, `tests/e2e/timesheet.spec.ts`, `docs/04_UX_AND_SETTINGS.md`,
  `docs/04_UX_AND_SETTINGS.vi.md`, this Results section, `handoff/delivery/evidence/WP5-UX-FIX5/`. Not changed:
  `TimesheetSheet.tsx`, `SheetWeekTable.tsx`, `labelPickerModel.ts`, `BatchDialog.tsx`, `tests/e2e/fixtures.ts`,
  server, API, calculation. No unit test added (`tests/client` holds DOM-free models; the fix is DOM focus logic
  covered by the e2e tests).
- **Deviations:** a temporary probe spec `tests/e2e/fix5-probe.spec.ts` (owned path) was used for measurements and
  the self-check, archived as `05e-fix5-probe.spec.ts.txt` and deleted before typecheck, lint and the full suite.
  The first typecheck failed (DOM globals in two new test callbacks; the test tsconfig has no DOM lib) and was
  fixed with `:focus-within` and string evaluations before the recorded full run. No background task running.
- **Remaining:** freeze, gate and a fresh area-B recheck. Observation for the auditor: a mode switch still moves
  focus to the editor heading (by design since T04), also from a field inside the editor.

Status: done
