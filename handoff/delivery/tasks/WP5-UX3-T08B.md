# WP5-UX3-T08B dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T08B; package WP5; kind implement;
  attempt 1; depends on WP5-UX3-T08-FREEZE. Slice of UI change round 3: the break-date rule
  of owner answer Q6 (b), break chips with a "Break n" sub-dialog for very narrow widths, the
  phone spacing of the session dialog, and the T08 helper moved into the model.
- **AGENTS.md on disk wins.** Any older injected AGENTS.md copy in your context with the
  section "Unified Frontend & UI/UX Standards (Taste Skills Integration)" is superseded;
  follow the on-disk section "Frontend and UI/UX standards".
- Owner basis (board `owner_decisions`, 2026-10-15):
  - N-1: on narrow screens the "Break n" label sits on the line above, and the pickers, the
    minutes box and the delete button share one row; where even that does not fit, each
    break shows as a text chip that opens a sub-dialog to edit its values.
  - N-2: tidy narrow-screen spacing of the New/Edit session dialog, neither too loose nor
    cramped.
  - Q6 (b): the break date field appears only when the session crosses local midnight;
    otherwise a break's date is the session's date and no date field is shown.
  - Chip times use the 24-hour format.
- Coordinator decisions (board `coordinator_decisions`, 2026-10-15):
  - Q6 (b) applies at every width (desktop and phone): the date field appears only when the
    session's start and end fall on different local dates in the input zone, or the end is
    empty; otherwise each row's date follows the session start date, also after the session
    date or the input zone changes.
  - Chips appear only below the re-measured width where the one-row layout no longer fits;
    chip text is 24-hour, with the date only for an overnight session, for example "Break 1
    · 10:00 → 10:15" or "Break 2 · 10/12/2026 23:40 → 00:10"; the arrow is `aria-hidden`
    with a hidden "to"; the accessible name contains the visible text plus ", edit".
  - Move T08's `suggestionRows` (suggestion rows without the past-day gate, used by "Suggest
    breaks" and "Confirm breaks") into `breakRowsModel.ts` as an additive pure export with
    unit tests; SessionDialog uses it. No existing export changes.
- Design sources (the contract): `handoff/delivery/tasks/WP5-UX3-PLAN2.md` Results items 4
  (chips, sub-dialog, stack, focus and Escape, errors on chips, model reuse; its 382px
  number assumed a date field in every row and is superseded by Q6 b) and 5 (phone dialog
  spacing tokens, which exist since T01) and the item 9 row WP5-UX3-T08B; the T08 record
  `handoff/delivery/tasks/WP5-UX3-T08.md` (SessionDialog, BreakRows, the nested-dialog
  rules, `suggestionRows`); the T06 model and record; the renders
  `handoff/delivery/design/WP5-UX3/mockup-r2-a8-phone-dialog-rows-chips-synthetic.png` and
  `mockup-r2-a9-phone-break-subdialog-synthetic.png` (drawn before Q6 b, so they still show a
  date in every row).
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model sonnet; no override. Routing: size M, risk H (break entry feeds worked minutes; a
  third modal level), novelty no (the dialog patterns exist since T07/T08). Task record in
  English.
- Base: HEAD = origin/main = the WP5-UX3-T08-FREEZE commit (board `commit_sha`), or a later
  commit that changes only `handoff/`; source digest as recorded by that freeze. Record HEAD,
  `git status --short` and the digest before you edit. Uncommitted coordinator files under
  `handoff/` are expected: never touch them.

## Scope

1. **Date field rule (Q6 b)** in `BreakRows.tsx` and `SessionDialog.tsx` as decided above;
   the request built by `buildSessionDialogRequest` must carry the same instants as before
   for the same typed values (the row date equals the session date when hidden).
2. **Layouts by container width**: one line from 42rem (Break n, [date if overnight], start
   time, minutes, "ends hh:mm", "suggested" tag, remove); below it the "Break n" line, then
   [date if overnight], start time, minutes and remove on one row; below the re-measured
   threshold (measure it for both the same-day and the overnight row, with 44px targets and
   the native inputs of the mobile project) chips. Record the thresholds and the measured
   list widths at 430, 390, 375, 360 and 320.
3. **Chips and the sub-dialog**: a full-width 44px chip button per break (text as decided,
   "suggested" tag, chevron); tapping opens the "Break n" sub-dialog (third modal level:
   editor bottom sheet, session dialog, sub-dialog): [date if overnight], start time,
   minutes with "Ends hh:mm ({input zone})" from `breakRowEnd`, the gap/fold prompt inline;
   footer "Remove break" (quiet danger, left), "Cancel", "Done". Done applies the edit to the
   draft with `editBreakRow` (nothing is sent until the session's Save); Remove uses
   `removeBreakRow`; "Add break" on the chip list calls `addBreakRow` and opens the
   sub-dialog for the new row, and Cancel on a new row removes it. Focus: the sub-dialog
   opens on its first field; Escape or Cancel discards its local edits and returns focus to
   its chip; Done returns focus to the updated chip; Remove moves focus to the next chip,
   else the previous, else "Add break". The session dialog and the editor ignore Escape while
   the sub-dialog is open. Errors (`checkBreakRows` and `serverBreakRowError`) mark the chip
   and show the message under it (`aria-describedby`); focus moves to the first marked chip;
   the sub-dialog shows the same message.
4. **Phone spacing (N-2)** below 768px with the T01 tokens (16px side padding, 20px between
   sections, 12px between fields, 8px between breaks, a sticky footer with two 44px buttons
   and safe-area padding); measure a new session with three suggested breaks at 390x844 and
   record whether the dialog fits without scrolling.
5. **Model helpers**: `suggestionRows` moved into `breakRowsModel.ts` (additive); a new
   `breakChipModel.ts` with `breakChipText(row, index, zone, overnight)` and the
   date-visibility predicate (pure, tested).

## Tests

- Unit: `tests/client/breakRowsModel.test.ts` additions for `suggestionRows` (inside and
  outside the session, the DST days, a session crossing midnight) and the date-visibility
  predicate if it lives there; new `tests/client/breakChipModel.test.ts` (chip text same-day
  and overnight, 24-hour, the hidden "to", incomplete rows such as "minutes missing").
- e2e (both projects): a same-day session shows no break date field at 1366 and on phones,
  and its saved breaks keep the session date; an overnight session shows the field; changing
  the session date moves the rows' dates; rows on one line at 1366, the two-line row at 430,
  390, 375 and 360 for a same-day session; chips below the measured threshold (and for an
  overnight session where its row no longer fits); chip names; the sub-dialog Done, Cancel,
  Remove, Add, Escape and focus returns; row and server errors on chips; nothing is sent
  before the session's Save; the request bodies unchanged for the same values; the phone
  spacing fit at 390x844.
- Mutation checks, each alone and reverted: (a) a hidden row date that does not follow a
  changed session date: a test fails; (b) the sub-dialog's Done sends a request at once: an
  e2e request check fails.
- List every changed assertion with file:line and why it is not a weakening; the 390x844
  first-screen budgets still pass; no assertion removed or weakened; no `skip`, `fixme` or
  `.only`; dates only from the server-reported `today_local` and the displayed period.

## Hard constraints

- No server, API, domain, schema or CSP change; the same request shapes as today; existing
  T06 exports unchanged (additive only).
- Never compute an accounting date or "past day" from the device clock or the display zone.
- Tokens only; shared `var(--transition)`; WCAG 2.2 AA (2.4.3, 2.4.7, 2.4.11, 2.5.3, 2.5.8 /
  44px, 1.4.10 no sideways scroll at 320, 3.3.1, 4.1.3).
- Keep AX-01..AX-10, R-12, B-02, B3-01, the T05B floating rule, the T07 panel, the T08
  dialog flows and every earlier behaviour.

## Owned paths

- `src/client/components/BreakRows.tsx`, `src/client/components/SessionDialog.tsx`,
  `src/client/components/BreakChip.tsx` (new), `src/client/components/BreakSubDialog.tsx`
  (new), `src/client/components/breakChipModel.ts` (new),
  `src/client/components/breakRowsModel.ts` (additive exports only), `src/client/styles.css`
- `tests/client/breakRowsModel.test.ts` (additions only), `tests/client/breakChipModel.test.ts`
  (new), `tests/e2e/day-editor.spec.ts`
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX3-T08B/` (masked LF `.txt` only, plus at most eight
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
6. `day-editor.spec.ts` under the FIX10 simulated clock (copy
   `handoff/delivery/evidence/WP5-UX-FIX10/shiftclock.mjs.txt` into your task folder as
   `.mjs`, never into the repository) at `2026-11-01T08:45:00Z` and `2027-03-14T10:30:00Z`,
   each alone with its own output folder.
7. The two mutation checks.
8. Privacy and whitespace: Grep changed files and evidence for email addresses and
   user-profile paths (only the full synthetic example.invalid form may remain); Grep every
   new or changed file for `[ \t]+$` and read its last lines (exactly one final newline).
9. `npm run verify` with `SMOKE_PORT` in 48760-48779 and `DATA_DIR` and `DATABASE_PATH`
   both inside the task folder.
10. `npm run digest` LAST. If any file changes after it, rerun verify and the digest.
11. Copy the masked logs of steps 2-7, 9 and 10 into the evidence folder (logs only).

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`, NOT EVEN TO WRITE A FILE), NO `| node`, NO `| python`, NO
  `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`, NOT EVEN
  FOR A READ-ONLY LISTING. NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout` OR `nul`
  (NOT EVEN `2>/dev/null`). NEVER `rm -r` OR `rm -rf` ANYTHING.** Redirect to a file in the
  task folder and read it with the Read tool; list files with the Glob tool. Use the Write
  and Edit tools for files (no sed, no heredoc).
- **Create files only inside the task folder, the evidence folder or your owned paths.**
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX3-T08B`. Set TEMP and TMP to it. Ports
  48760-48779. Never touch `%LOCALAPPDATA%\timesheet-dev` data or `B:\Temp\claude`. Never
  kill processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. Write no
  markdown links in Results (paths in backticks only).

## Return

At most 180 words, beginning with 'Self-reported model: ...': files changed and added (every
test file with changed assertions), the date rule and layout thresholds as implemented, the
measured list widths, the chip and sub-dialog behaviour, the 390x844 dialog fit, unit and
full e2e counts per project, the simulated-clock results, both mutation results, the budget
numbers, the main chunk size, verify exit code, the final full 64-hex digest and file count,
the evidence files, the background-task confirmation, any stop, conflict or deviation.

## Results
