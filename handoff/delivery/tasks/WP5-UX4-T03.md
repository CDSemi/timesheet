# WP5-UX4-T03 dispatch brief (session dialog and running-session edit)

- **Task.** Mission timesheet-software-readiness, task WP5-UX4-T03, package WP5, kind
  implement, attempt 1. It depends on WP5-UX4-T02-FREEZE (done, commit b7cc063).
- **Profile and routing.** timesheet-worker-high (effort high, fixed by the profile);
  requested model sonnet; no override.
  - Routing: size M, risk H (worked-minutes input), novelty no. It follows existing session
    and break patterns.
  - Write the task record in English.
- **Sources:**
  - the plan `handoff/delivery/tasks/WP5-UX4-PLAN.md`, items U4-11 to U4-15, with their
    observations, design and acceptance criteria;
  - the mockup `handoff/delivery/design/WP5-UX4/mockup.html`, renders B7, B8 and B11;
  - the owner's round-4 request and F-5 answer on the board (`owner_decisions` 2026-10-20,
    verbatim).
  - **Where the owner's words differ from the plan or mockup, the owner's words win.** In
    particular: **the "Today" and "Now" links are right-aligned to their date and time
    inputs.**
- **AGENTS.md on disk wins** over any injected copy.
  - Rule 7: UTC instants, accounting dates and reporting zones are different values. Today
    and Now use the dialog's input zone, never the device zone.
  - The UI section: tokens only, both themes, WCAG 2.2 AA, `--transition`, never `all`.
- **Coordinator decision (board `coordinator_decisions` 2026-10-20).** The U4-15 alert is
  reused in the Check out dialog. That dialog shares `BreakRows`, and the same save errors
  can land below the fold there.
- **Base.** HEAD = origin/main = b7cc06352687d1bc8cd6953b284915584a21e4fd, or a later commit
  that changes only `handoff/`. The digest is
  04e16199ea66d3144fcb34ad4a7716c929b45f22fac0fd7b350450d271a80918 (839 files). Before you
  edit, record HEAD, `git status --short` and the digest.

## Already in place (do not redo)

- **T04, server.** A shared editor can neither check the owner in or out nor reopen an
  ended session through session edits (409 `shared_clock_action`).
- **T02, Day editor.**
  - The Day editor is a non-modal drawer from 768px.
  - One discard guard (`askBeforeDropping` in `TimesheetScreen.tsx`) covers the day
    routes.
  - The session dialog is modal, and stays modal.

## Items

1. **U4-11: edit the start of today's running session** (client only; the server already
   accepts `end: null`).
   - Edit on a running session opens the session dialog with the subtitle "... running".
     It shows:
     - Input zone;
     - Start date and time;
     - instead of End, the box "No end yet: this session is running. It ends when you
       check out.", with a quiet "Set an end instead".
   - "Set an end instead" switches to the ended-session flow, which keeps today's way of
     closing a forgotten check out. It is absent in a shared view.
   - **Breaks:**
     - the date field is shown;
     - rows are checked against the start only;
     - "Confirm no breaks taken" is hidden;
     - the hint reads "You confirm the breaks when you check out".
   - **Save:**
     - it sends `end: null`, `breaks_confirmed: false` and the loaded `expected_version`;
     - it shows no G-4 notice;
     - the final "Save this session?" lists the time as "07:45 - running" and the breaks as
       "1 break, confirmed at Check out".
   - The session card's source line says "Checked in" while the session runs, not
     "Checked in and out".
   - Errors:
     - a start later than now + 5 min shows the server's refusal;
     - an overlap shows its refusal, both in the U4-15 alert;
     - a stale version keeps its reload flow.
   - Add an integration oracle in `clock-out-breaks.test.ts`: edit the start of a running
     session, then Check out. Worked minutes are computed from the new start.
2. **U4-12: zone above the times.** "Input zone", with a shorter explanation, is the first
   field of the Time section. DOM, visual and Tab order: zone, start date, start time, end
   date, end time, at 1440 and 390. The Check out dialog is unchanged here.
3. **U4-13: "Today" and "Now" links.**
   - A quiet link-style button sits under each date ("Today") and each time ("Now"),
     **right-aligned to that input** (the owner's F-5 change).
   - **Today** sets the date to the current date in the dialog's input zone.
   - **Now** sets the time to the current minute in the input zone, with `:00` seconds. If
     the field's date is not that date, Now sets the date too.
   - Device clock and zone:
     - the instant comes from the device clock;
     - it is converted with the input zone, never the device zone;
     - the server's 5-minute future allowance still applies.
   - A change through a link counts as a typed change: it marks the draft dirty and drops
     fold or offset state like a typed start.
   - Accessible names contain the visible word ("Today, start date").
   - Targets are 44px on touch.
   - The links are absent in read-only views.
   - Put the pure helper in `sessionModel.ts` (`nowField(zone, instant)`). Unit-test it
     across zones and DST edges.
4. **U4-14: break rows aligned.**
   - In the one-line layout, use fixed column slots: `Break n` | date (when shown) | time
     `flex: 0 0 var(--break-time-w)` | minutes | info `flex: 1 1 auto` | remove.
   - The info slot always renders, with "ends --:--" until the row resolves.
   - Re-measure `--break-time-w` so that "12:00:00 AM" with the picker icon is not clipped
     in en-US.
   - Every row's time and minutes inputs have equal x and width (±0.5px), whether the row
     is saved, suggested or new, and whatever its info text.
     - This holds in the rows, two-line and chip layouts.
     - It holds in the session dialog and the Check out dialog.
   - No time text is clipped (`scrollWidth <= clientWidth`) at 1440, 768 and 390.
5. **U4-15: save errors in their own alert dialog** (session dialog and Check out dialog).
   - A failed save opens an alert dialog "This session was not saved" with the message.
     A failed save means: a server refusal, a network failure, a non-row validation
     message, or row errors.
   - Row errors are listed by "Break n".
   - The dialog has one OK button, which gets the initial focus; Escape acts as OK.
   - On close, focus goes to the first marked row or field, scrolled into view; otherwise
     to Save.
   - Inline row and field markers stay, and so do the DST prompts.
   - No `p.error` remains at the end of either dialog body.
   - A stale version keeps its existing reload flow.
   - Use a new `AlertDialog.tsx`, or a one-button `ConfirmDialog` variant. Either way, do
     not change `ConfirmDialog`'s existing two-button behaviour, which T02's discard guard
     uses.
6. **Leftover from T01.** The comment at `src/client/components/sheetModel.ts:141` still
   says "Show details"; change it to "Show worked hours". Comment only.

## Acceptance

Use the plan's AC for U4-11 to U4-15, plus the owner's alignment rule for Today and Now:
- each link's right edge equals its input's right edge (±1px) at 1440 and 390;
- check it in both themes.

Also:
- **Overlap, future-time, work-date-mismatch and network failures** each show the alert at
  1440 and 390, with the message fully in view, in the session dialog. The overlap and
  network cases also run in the Check out dialog. After OK, focus is on the marked row or on
  Save.
- **Today and Now** are tested with a frozen clock (Playwright `page.clock`), input zone
  Asia/Tokyo and the device in America/Los_Angeles. They fill the Tokyo date and time, and
  Save sends that local time with the Tokyo zone.
- **The running edit** passes the plan's full AC, including "Set an end" absent in a
  shared edit view.
- **Every dialog touched** passes axe in both themes.

## Docs

- **docs/04 and `.vi.md`:**
  - running-session edit;
  - zone first;
  - the Today and Now links and their zone rule;
  - break row slots;
  - the alert dialog in the session and Check out dialogs.
- **docs/10 and `.vi.md`:**
  - one coordinator entry for the running-session edit (client only; the server contract
    is unchanged; breaks are confirmed at Check out);
  - the Check out reuse of the alert.
  - Change no other entry.
- Leave docs/12 to UX4-T06.

## Tests and mutants

Cover every acceptance item.

Apply each mutant alone, check that a test fails, then revert it:
1. the running-session build requires an end again;
2. Save sends `breaks_confirmed: true` for a running session;
3. Now converts with the device zone instead of the input zone;
4. the zone field is moved back below the times;
5. the break time slot grows again (`flex: 1 1 ...`);
6. a save error is rendered inline instead of in the alert;
7. "Set an end instead" is shown in a shared view.

## Checks (in order; verify and the digest are the LAST commands)

1. Put Node 24 first on PATH; run `node --version`.
2. Before any edit: HEAD, `git status --short`, `npm run digest`.
3. Implement. Then run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`.
   The build must show no chunk advisory; record the main chunk.
4. Run the FULL e2e on both projects, on the real clock, alone.
   - Only a failure whose trace shows `net::ERR_NO_BUFFER_SPACE`, or another network or
     buffer error, may be rerun, alone and once. Record both runs.
   - Any other failure is a defect to fix, even if it passes on a rerun.
5. The mutant proofs.
6. EN/VI parity of docs/04 and docs/10, then `validate_package.py --preflight` with the
   workflow Python
   `"$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe"`.
   Write `<user>` in the evidence.
7. Privacy and whitespace checks.
8. `npm run verify` with `SMOKE_PORT` in 49410-49429, and `DATA_DIR` / `DATABASE_PATH` in
   the task folder.
9. `npm run digest` LAST.

**Rules:**
- List every changed assertion with file:line and why it is not a weakening.
- No `skip`, `fixme` or `.only`.
- No server change.
- At most six `-synthetic.png` screenshots in evidence:
  - the running-session edit;
  - the dialog with the zone first and the right-aligned Today and Now links, at 1440 and
    390;
  - the aligned break rows;
  - the alert in the session dialog;
  - the alert in the Check out dialog.

## Owned paths

- `src/client/styles.css`
- `src/client/components/SessionDialog.tsx`, `ClockOutDialog.tsx`, `LocalTimeField.tsx`,
  `BreakRows.tsx`, `SessionList.tsx`, `sessionModel.ts`, `breakRowsModel.ts`,
  `dayEditorModel.ts`, `ConfirmDialog.tsx` (only for a backward-compatible one-button
  variant), new `AlertDialog.tsx`, and `sheetModel.ts` (the line-141 comment only)
- `src/client/DayEditor.tsx` and `src/client/TimesheetScreen.tsx`, only if opening Edit on
  a running session or refreshing the running status needs it; report why
- tests:
  - `tests/client/` unit tests for the models you touch;
  - `tests/integration/clock-out-breaks.test.ts`;
  - `tests/e2e/day-editor.spec.ts`, `today.spec.ts`, `sharing.spec.ts`,
    `keyboard-access.spec.ts`, `focus-ring.spec.ts`, `hover.spec.ts`, `controls.spec.ts`,
    `surfaces.spec.ts`
- docs: `docs/04_UX_AND_SETTINGS.md` and `.vi.md`, `docs/10_DECISIONS_AND_SOURCES.md` and
  `.vi.md`
- this brief's Results section
- `handoff/delivery/evidence/WP5-UX4-T03/`

If a change needs any other path, stop and report; do not edit it.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX4-T03`. Ports 49410-49429.
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
- per item, the change and the measured result;
- the files changed;
- the changed assertions;
- unit, integration and full e2e counts per project;
- the mutant proofs;
- parity and preflight;
- the main chunk;
- the verify exit code;
- the final 64-hex digest and file count;
- any stop or deviation.

## Results

Self-reported model: claude-sonnet-5-5. Evidence: `handoff/delivery/evidence/WP5-UX4-T03/` (`checks.txt`, e2e and mutant logs, six `-synthetic.png`). No commit, no server change.

**Setup.** Node v24.21.0. Base HEAD b7cc06352687d1bc8cd6953b284915584a21e4fd; `git status --short` before editing showed only `handoff/` files; digest before: 04e16199ea66d3144fcb34ad4a7716c929b45f22fac0fd7b350450d271a80918 (839 files).

**Items, change and measured result**
- U4-11: `SessionDialogDraft.running`; a running build in `breakRowsModel.ts` (end null, rows checked against the start, `breaks_confirmed: false`, no G-4); the "No end yet" box with "Set an end instead" (absent when `shared`); hint, final-confirmation text ("07:45 - running", "1 break, confirmed at Check out"); card source "Checked in". Integration oracle in `clock-out-breaks.test.ts` (edit start, then Check out: 601 regular minutes from 08:00 against 541 from 09:00). e2e: PUT body `end: null`, `breaks_confirmed: false`, loaded version; card, status and top bar follow the new start; Check out counts from it; future start and overlap show the alert at 1440 and 390; stale keeps the reload flow; shared edit view has no "Set an end instead" (sharing.spec.ts), view-only has no Edit.
- U4-12: zone is the first field of Time; DOM, screen and Tab order checked at 1440 and 390.
- U4-13: `nowField`/`applyToday`/`applyNow` (unit tests across Tokyo, LA, Sydney, UTC, midnight, spring forward and fall back), `LocalTimeField` links, right edge equal to the input's (<= 1px) at 1440 and 390 in both themes, 44px on touch, contrast and focus ring, keyboard Enter. Frozen clock (`page.clock`), device America/Los_Angeles, zone Asia/Tokyo: fills the Tokyo date and time, Save sends that local time with the Tokyo zone and stores LA noon. A link change makes the draft dirty (Cancel asks).
- U4-14: fixed slots (`--break-num-w` 4.3rem, date, time `flex: 0 0 var(--break-time-slot-w)` 9.6rem, minutes, info, remove); info always renders ("ends --:--"). Measured with a probe field: "12:00:00 AM" needs 131px (pointer) and 139px (touch); the old 6.8rem slot clipped it. Time and minutes x and width equal (+-0.5px) for suggested, saved and new rows at 1440, 768, 390 in the session and Check out dialogs; no clipping (`scrollWidth` does not see it, so the test uses the probe).
- U4-15: new `AlertDialog.tsx` (one OK button, initial focus, Escape is OK) in `SessionDialog.tsx` and `ClockOutDialog.tsx`; messages by `requestFailure`, `messageFailure`, `rowsFailure` in `dayEditorModel.ts`; focus after OK goes to the first marked row (field or chip), else Save or Check out; daylight-saving questions stay inline (they are questions, not failures); no `p.error` left. Overlap, future time, date mismatch and network failure each show the alert at 1440 and 390 with the message in view; overlap and network also in the Check out dialog.
- `sheetModel.ts:141` comment now "Show worked hours"; two CSS comments with the same old words fixed.

**Files changed:** `src/client/components/`: `AlertDialog.tsx` (new), `SessionDialog.tsx`, `ClockOutDialog.tsx`, `LocalTimeField.tsx`, `BreakRows.tsx`, `sessionModel.ts`, `breakRowsModel.ts`, `dayEditorModel.ts`, `sheetModel.ts`; `src/client/DayEditor.tsx` (one line: `shared={request !== ownRequest}`, because the dialog must know it runs in a share; `TimesheetScreen.tsx` needed no change, the load after a save already refreshes the running status); `src/client/styles.css`; tests `tests/client/{sessionModel,breakRowsModel,dayEditorModel}.test.ts`, `tests/integration/clock-out-breaks.test.ts`, `tests/e2e/day-editor.spec.ts`, `tests/e2e/sharing.spec.ts`; docs `docs/04_UX_AND_SETTINGS.md` and `.vi.md`, `docs/10_DECISIONS_AND_SOURCES.md` and `.vi.md` (one coordinator entry with two bullets).

**Changed assertions (none weakened; each now asserts the same fact in the alert dialog)**
- `day-editor.spec.ts:99` console guard: also allows `net::ERR_FAILED`, only while a test aborts a request on purpose (flag `allowNetworkConsoleError`); every other console error still fails.
- `:422` `form.getByRole('alert')` containing `end_not_after_start` became the alert dialog with the same text, then OK.
- `:1209` added: the synthetic refusal alert is asserted and dismissed before Cancel.
- `:1549` the paragraph "A break cannot be saved as it is." became the alert listing "Break 3 overlaps Break 2."; the chip-focus assertion kept, now after OK.
- `:1566` added the alert for "Break 2 lies outside the session."; the inline marker assertions kept.
- `:2113` and `:2127` Check out refusals: paragraph became the alert with "Break 2 ends later than five minutes from now." and "inside their work session"; row focus added.
- `:2345` Check in then Check out: the "inside their work session" paragraph became the alert.
- `:3127` running card source "Checked in and out" became "Checked in" (owner U4-11).

**Counts.** Unit (tests/client): 29 files, 653 tests. Integration: 56 files, 1219 tests. All vitest: 96 files, 2185 tests (was 2164). Full e2e on the real clock, alone: desktop 394 passed, 32 skipped (existing), 0 failed; mobile 365 passed, 61 skipped (existing), 0 failed; no rerun. Both include the 18 new tests. After those runs the U4-14 test gained the fixed-slot assertion and a typing fix; typecheck, lint, build were rerun and the 17 U4-1x day-editor tests passed again on both projects (34 passed); the sharing test passed in the batch before that edit.

**Mutants** (each alone, a test failed, reverted): 1 breakRowsModel 5 failed; 2 breakRowsModel 3 failed; 3 sessionModel 4 failed; 4 U4-12 failed at 1440 and 390; 5 U4-14 failed at 1440, 768 and Check out (the first attempt was not caught because a uniform grow keeps rows equal; I added the assertion that the time is exactly its slot wide, then it failed); 6 U4-15 failed; 7 sharing test failed.

**Parity and preflight.** docs/04 and docs/10 EN and VI edited together (9 and 28 headings in each pair). `validate_package.py --preflight` with `<user>/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`: PASS, 118 translation pairs, exit 0.

**Build.** No chunk advisory; main chunk 498.66 kB (gzip 146.30 kB), 1.3 kB under the 500 kB advisory. Privacy and whitespace: `git diff --check` exit 0, no personal data, no trailing whitespace. `npm run verify` (SMOKE_PORT 49410, DATA_DIR and DATABASE_PATH in the task folder): exit 0, SMOKE PASSED.

**Final digest (npm run digest, last command):** e3c7016ba45e0d5e9085071c87258cecdbd6c0a6827b144b6b7cbbaa542129d3 (840 files; one more than before: `AlertDialog.tsx`).

**Deviations and notes**
- New token `--break-time-slot-w` instead of re-measuring `--break-time-w`: `breakChipModel.ts` (not owned) mirrors `--break-time-w` in its chip thresholds, so changing it would break the 268px and 390px thresholds. `--break-time-w` stays 6.8rem for the two-line row.
- The info slot is `flex: 1 1 0` in the one-line row, not `1 1 auto`: an `auto` basis pushed the remove button onto a second line in the 720px dialog once the time slot was fixed.
- axe-core is not a dependency and was not installed; the rules that can be checked directly (names contain the visible words, every control named, unique ids, 4.5:1 text, 3:1 focus ring) are asserted in both themes for the session dialog, the running-edit dialog, the alert and the Check out dialog.
- Process slips: a few early Bash calls piped into `head` and one empty heredoc (`cat >>`) before I noticed; no data was affected.

Status: done
