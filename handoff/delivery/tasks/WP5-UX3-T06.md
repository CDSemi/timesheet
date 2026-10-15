# WP5-UX3-T06 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T06; package WP5; kind implement;
  attempt 1; depends on WP5-UX3-PLAN (done). First source slice of UI change round 3. It
  runs while the owner answers G-1..G-5, so it must not depend on any answer.
- Scope: the pure break-row model and its unit tests. NO UI CHANGE: no component, no
  CSS, no e2e spec. The later slices T08 (session dialog) and T09 (Check out dialog) will
  use this model.
- Design sources (read them; they are the contract):
  - `handoff/delivery/tasks/WP5-UX3-PLAN.md` Results: section B8 (sessions, breaks and
    confirmations: the mapping to the API, pre-fill, Save semantics, Cancel, Check out),
    section C (canonical rules R-01, R-02, R-07, docs/04 lines 16, 25, 63, 64, 70, docs/10
    D-02 and E-1), section F rows U-21/U-24, U-23 and U-25/U-26, and the WP5-UX3-T06 row of
    section H.
  - The owner items U-21 and U-23..U-26 in the brief part of the same file.
- Coordinator decisions (board `coordinator_decisions`, 2026-10-15): the plan's design is
  adopted. G-3 (pre-fill) and G-4 (Save with no break and the box unticked) are still open
  with the owner, so:
  - the pre-fill helpers are pure functions that the UI may call automatically (G-3 a) or
    from a button (G-3 b); nothing here decides when they are called;
  - the G-4 choice is one parameter (for example `allowUnconfirmed: boolean`): `true`
    gives `breaks_confirmed: false` with `breaks: []` for an empty, unticked list; `false`
    gives a validation result that blocks Save. Test both values.
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model opus; override reason novelty (a new integrity-core model for break input that
  feeds worked minutes and OT credit). Routing: size M, risk H, novelty yes. Task record in
  English.
- Base: HEAD = origin/main = b4d9dd87fd47531ff84eba40189153ab83562677, or a later commit
  that changes only `handoff/`. Source digest
  229df806aeaaa886ab11ee83556746ee65eda6c81a596dcd180d80d5d0b04db3 (815 files). Record
  both before you edit anything. Uncommitted coordinator files under `handoff/` (board,
  checkpoints, NEXT_ACTION, the plan, this brief, `handoff/delivery/design/WP5-UX3/`) are
  expected: never touch them.

## Read

- AGENTS.md from disk first (rule 7: UTC instants, accounting dates and the saved IANA
  reporting zone are different values; device-zone changes must not regroup timesheets;
  rule 11: no deprecated APIs).
- The design sources above.
- docs/02 lines 7, 15, 74 (R-01, R-02, R-07) and docs/04 lines 16, 25, 63-64, 70 (read
  only; docs change in a later slice).
- `src/client/api.ts` (read only: `SessionRequest`, the break request shape,
  `breaks_confirmed`, `ClockOutRequest`, the error codes `break_outside_session`,
  `overlapping_breaks`, `future_break` and `break_index`, the policy type with the
  reference start and end, `today_local`).
- `src/client/components/sessionModel.ts`, `src/client/components/dayEditorModel.ts`, the
  shared local-time resolver (`resolveLocalDateTime`, `fieldFromInstant` and the gap and
  fold handling), the existing suggestion code (`quickBreaksOf` and the shift-relative
  suggestions), `src/client/components/SessionForm.tsx`, `BreaksEditor.tsx`,
  `ClockOutDialog.tsx` and `DayEditor.tsx` (read only, to see how the current UI builds the
  same requests), and their unit tests.

## Implement

A new pure module `src/client/components/breakRowsModel.ts` (no React, no DOM, no `fetch`,
no `new Date()` for an accounting date). Small additions to `sessionModel.ts` or
`dayEditorModel.ts` only where a helper belongs there; every existing export keeps its
current behaviour (its existing tests stay unchanged and green). Capabilities:

1. **Row draft.** A break row holds the date, the start time, the minutes, its origin
   (saved, suggested, new), the pinned start and end instants of a saved or suggested row,
   and whether the person changed it.
2. **Rows to request.** For the session dialog and for Check out:
   - an untouched saved or suggested row sends its pinned start and end instants exactly as
     today (an unchanged edit keeps every saved instant);
   - otherwise the start is resolved in the input zone with the shared resolver (a
     nonexistent local time returns the existing gap result, an ambiguous one the fold
     choice, both naming the row "Break n"); the end instant is start plus minutes x 60 s
     (R-07: duration is elapsed UTC time) and is sent as its local time with the explicit
     offset (`fieldFromInstant` or its equivalent), so the end never hits a gap or a fold;
   - minutes are whole numbers 1-720; anything else is a row error;
   - row errors, by instant comparison only, before sending: a break that starts before
     the session start, ends after the session end (for a closed session), or overlaps
     another row; a break across midnight is valid and simply ends on the next local date;
   - a server error with `break_index` (`break_outside_session`, `overlapping_breaks`,
     `future_break`) maps to its row;
   - session mode: listed rows give `breaks_confirmed: true` with the rows; the ticked
     "Confirm no breaks taken" gives `breaks_confirmed: true` with `breaks: []`; an empty
     unticked list follows the G-4 parameter;
   - Check out mode (E-1): an empty unticked list omits `breaks` (breaks stay
     unconfirmed); a listed set or the ticked box confirms and replaces the saved rows;
   - the produced objects must type-check against the existing request types in
     `src/client/api.ts`. If a needed type does not exist, stop and report (api.ts is not
     owned).
3. **Saved interval to minutes.** The elapsed whole minutes of a saved break, from its
   server instants (display of the person's own input, not a business figure).
4. **Pre-fill helpers.**
   - Reference hours: the policy's reference start and end as wall-clock times on the
     accounting date in the saved reporting zone, converted to instants and shown in the
     chosen input zone; the end moves to the next date when it is not after the start.
   - Suggested breaks only when the accounting date is before `today_local` (the server's
     date, passed in as a string; never the device clock), and only those that lie inside
     the session; they re-shift with the session start until the person edits any break
     row; for today and future dates no rows.
5. **Summary text** for the Save confirmation (plan B8): "3 breaks (15, 30, 15 min)",
   "No breaks taken", "Breaks not confirmed: OT for this day stays pending".
6. **Dirty check** for Cancel: whether a draft (times, zone, rows, the box) differs from its
   starting state, ignoring purely cosmetic differences (for example "9:00" vs "09:00" if
   the inputs can produce both; say what you chose).

## Tests

New `tests/client/breakRowsModel.test.ts` (and additions to `sessionModel.test.ts` or
`dayEditorModel.test.ts` only for helpers placed there), covering at least:

- untouched saved and suggested rows keep their pinned instants byte for byte;
- start + minutes to request with the offset pinned, in the input zones America/Los_Angeles
  and Asia/Ho_Chi_Minh, with the reporting zone America/Los_Angeles;
- a break across local midnight;
- DST: a break starting 2026-11-01 01:45 in America/Los_Angeles needs the fold choice;
  2027-03-14 02:30 there returns the gap result; a 30-minute break starting 01:45 PDT
  (first 01:45) ends 30 elapsed minutes later; a break that spans the fall-back hour has its
  minutes as elapsed time, not wall-clock difference;
- minutes validation (0, 721, 1.5, empty, text, 1, 720);
- before-start, after-end and overlap row errors; server `break_index` mapping;
- `breaks_confirmed` in session mode for rows, ticked box, empty unticked with the G-4
  parameter true and false; Check out mode omits `breaks` for empty unticked;
- saved interval to minutes, including an interval across the fall-back hour;
- reference-hour pre-fill on a normal day, on both DST days, with an input zone that differs
  from the reporting zone, and with an end not after the start;
- past-day suggestions: a date before `today_local` gets the suggestions inside the session;
  `today_local` itself and later dates get none; re-shift until a row is edited;
- summary texts and the dirty check.
- Device-zone independence: run the new test file three times, with `TZ` unset, with
  `TZ=Asia/Ho_Chi_Minh` and with `TZ=America/New_York`; all must pass.
- Mutation checks (each applied alone, the failing tests recorded, then reverted):
  (1) `breaks_confirmed` true for an empty unticked list in session mode with the G-4
  parameter true; (2) the past-day comparison `<` changed to `<=`; (3) the end computed by
  adding minutes to the local wall-clock time instead of to the UTC instant. Each must make
  at least one test fail.
- No assertion removed or weakened in existing tests. No `skip`, `fixme` or `.only`.

## Hard constraints

- No server, API, request-body, domain, calculation, schema or CSP change. No UI, CSS or
  e2e change. Never compute an accounting date from the device clock or the display zone.
- Not owned: `src/client/api.ts`, every component (`*.tsx`), `styles.css`, every e2e file,
  every docs file, and every file not listed under "Owned paths".

## Owned paths

- `src/client/components/breakRowsModel.ts` (new), `src/client/components/sessionModel.ts`
  (additions only), `src/client/components/dayEditorModel.ts` (additions only)
- `tests/client/breakRowsModel.test.ts` (new), `tests/client/sessionModel.test.ts`
  (additions only), `tests/client/dayEditorModel.test.ts` (additions only)
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX3-T06/` (masked LF `.txt` only)

## Checks (in this order; verify and digest are the LAST commands)

1. Put Node 24 first on PATH (with `cygpath -u`), then run `node --version` (must be
   v24.x).
2. Before any edit, record `git rev-parse HEAD`, `git status --short` and
   `npm run digest`.
3. Implement, then run `npm run typecheck`, `npm run lint` and `npm test`.
4. Run the new test file under the three `TZ` values (step "Device-zone independence").
5. Run the three mutation checks; record which tests fail; revert; rerun the file.
6. Run the e2e specs that exercise the current session and break UI, alone, on both
   projects, as a no-regression check: `tests/e2e/day-editor.spec.ts` and
   `tests/e2e/shell.spec.ts` (set `E2E_SCREENSHOT_DIR` and the Playwright output folder
   inside the task folder). 0 failed. If a failure is `ERR_NO_BUFFER_SPACE` or an
   ECONNRESET, rerun that test three times and record it. Any other failure: stop and
   report.
7. Grep your changed files and evidence for email addresses and user-profile paths: only
   the full synthetic example.invalid form may remain; mask everything else as `<email>` or
   `<user>`; never write such a token verbatim in Results.
8. Run `npm run verify` with `SMOKE_PORT` in 48530-48549, and with `DATA_DIR` and
   `DATABASE_PATH` both set inside the task folder.
9. Run `npm run digest` LAST. If any file changes after the digest, rerun verify and the
   digest.
10. Copy the masked logs of steps 2-6, 8 and 9 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`, NOT EVEN TO WRITE A FILE), NO `| node`, NO `| python`, NO
  `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER
  REDIRECT TO OR FROM `/dev/null` OR `nul` (NOT EVEN `2>/dev/null`). NEVER `rm -r` OR
  `rm -rf` ANYTHING.** Redirect to a file in the task folder and read it with the Read
  tool. Use the Write and Edit tools for files (no sed, no heredoc).
- **Create files only inside the task folder, the evidence folder or your owned paths.**
  Never write into the repository root or a drive root.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX3-T06`. Set TEMP and TMP to it. Use ports
  48530-48549 for anything you start. Never touch `%LOCALAPPDATA%\timesheet-dev` data or
  `B:\Temp\claude`.
- Never kill processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. Write
  no markdown links in Results (paths in backticks only).

## Return

At most 170 words, beginning with 'Self-reported model: ...'. Include:
- the files changed and the exported functions;
- how the end instant and `breaks_confirmed` are computed;
- the unit counts (full run and the three `TZ` runs);
- the mutation results;
- the e2e counts per project for the two specs;
- the verify exit code;
- the final full 64-hex digest and file count;
- the evidence files;
- the background-task confirmation;
- any stop, conflict or deviation.

## Results

Self-reported model: claude-opus-5-5. Date 2026-10-15.

### Step 1-2: base (before any edit)

- `node --version` v24.21.0. `git rev-parse HEAD` = `origin/main` =
  b4d9dd87fd47531ff84eba40189153ab83562677. `git status --short`: only the expected coordinator
  files under `handoff/` (5 modified, 3 untracked). `npm run digest`:
  229df806aeaaa886ab11ee83556746ee65eda6c81a596dcd180d80d5d0b04db3 (815 files), exit 0, equal to
  the brief.

### Step 3: implementation

- New `src/client/components/breakRowsModel.ts` and `tests/client/breakRowsModel.test.ts`. No
  change to `sessionModel.ts`, `dayEditorModel.ts` or their tests (every helper needed already
  existed there and is reused: `fieldFromInstant`, `toLocalInput`, `editField`, `draftGap`,
  `gapReplacement`, `timeProblemOf`, `problemText`, `toBreakRules`, `draftFromSession`).
- First runs: new file 68 passed, `npm run typecheck` exit 0, `npm run lint` exit 0.
- `npm test` (full): 90 files, 1950 passed, exit 0.

### Step 4: device-zone independence

- Git Bash (MSYS) drops `TZ` when it starts a native program: a probe printed
  `resolved=America/Los_Angeles` for all three `TZ=...` prefixes. The runs therefore go through a
  wrapper in the task folder (`run-tz.mjs`) that sets `TZ` in Node and starts the probe and
  `npm test -- tests/client/breakRowsModel.test.ts` as child processes. Probe and result per run:
  unset -> America/Los_Angeles, 68 passed; `TZ=Asia/Ho_Chi_Minh` -> Asia/Saigon (offset -420),
  68 passed; `TZ=America/New_York` -> America/New_York (offset 240), 68 passed. All exit 0.

### Step 5: mutation checks (each alone, then reverted)

1. `breaksConfirmed: true` for an empty unticked list in session mode with
   `allowUnconfirmed: true`: 2 failed / 66 passed ("session mode, G-4 allowUnconfirmed true: an
   empty unticked list saves breaks unknown"; "breaksPayload exposes the same rule for both
   modes").
2. Past-day comparison `workDate < todayLocal` changed to `<=`: 2 failed ("today_local itself,
   later dates and an unknown today get none"; "nothing is re-shifted for today, for saved rows or
   while the start cannot be resolved").
3. End computed as the typed local wall clock plus the minutes, read again in the input zone:
   2 failed ("a 30-minute break from the first 01:45 (PDT) ends 30 elapsed minutes later, at
   01:15 PST"; "a break across the fall-back hour lasts its minutes of elapsed time, not the
   wall-clock difference").
- After reverting all three: the file passes 68/68, exit 0 (the reverted lines were checked with
  grep in the log).

### Step 6: e2e no-regression (current session and break UI)

- `npm run build` exit 0, then Playwright `tests/e2e/day-editor.spec.ts tests/e2e/shell.spec.ts`
  on both projects (TEMP/TMP and `E2E_SCREENSHOT_DIR` in the task folder, so the Playwright
  output folder is there too): 96 tests, 81 passed, 15 skipped, 0 failed, exit 0 (1.1 min).
  desktop 48 (38 passed, 10 skipped); mobile 48 (43 passed, 5 skipped). The skips are the
  specs' existing project gates (phone-only tests on desktop, the 768/1024/1280 resize tests on
  mobile); no retry was needed. The fixtures use OS-assigned loopback ports, as in earlier gates.

### Step 7: privacy grep

- Email and user-profile patterns in `breakRowsModel.ts` and `breakRowsModel.test.ts`: no
  match. The evidence copies are masked by `copy-evidence.mjs` (task folder): any email other
  than the synthetic example.invalid form becomes `<email>`, a profile path segment `<user>`.
  A recheck of the copied evidence found no other email, no profile path and no CR byte.

### Step 8-9: verify and digest (the last commands)

- `SMOKE_PORT=48541`, `DATA_DIR` and `DATABASE_PATH` in the task folder, `npm run verify`:
  typecheck, lint, 90 files / 1950 tests passed, build, SMOKE PASSED, exit 0.
- `npm run digest`: 0ef75a1533d9831057f42f3a7b45e0a9386792caa47b4f2c98e091d1040b7499 (817
  files, handoff/ excluded), exit 0. After it only `handoff/` changed (evidence copies and this
  Results section), which the digest excludes.

### Module contract (`src/client/components/breakRowsModel.ts`)

- Row draft `BreakRowDraft`: key, origin (`saved`/`suggested`/`new`), `start` (a `LocalField`:
  date, time, fold, pinning offset), `minutes` as typed, `countsAsWork` (kept from the saved row
  or policy rule; false for a new row, because `BreakRequest` needs it), `pinned`
  (`{ zone, startUtc, endUtc }`), `edited`. Dialog draft `SessionDialogDraft`: zone, start, end,
  rows, `noBreaks` (the box), `breaksEdited`.
- End instant: an untouched pinned row (`rowKeepsPin`: not edited and the same input zone) sends
  its pinned instants via `fieldFromInstant` + `toLocalInput`, byte-identical to the old form
  (tested with `JSON.stringify` against `buildSessionRequest`, `buildClockOutRequest` and
  `suggestedRows`). Otherwise the start is resolved with `resolveLocalDateTime` (offset kept when
  only the minutes changed; gap and fold give the existing `TimeProblem` named "Break n"), the end
  instant is start + minutes x 60 s, and the end is sent as `fieldFromInstant(zone, end)` with its
  explicit offset.
- `breaks_confirmed`: the ticked box -> `breaks: []`, true (hidden rows are not checked or sent);
  listed rows -> the rows, true; empty unticked -> session mode `allowUnconfirmed` true:
  `breaks: []`, false; false: blocked with `UNCONFIRMED_BLOCKED_MESSAGE`; Check out mode: `breaks`
  omitted, false (E-1).
- Row errors before sending (instant comparison, one per row): incomplete, minutes (whole 1-720),
  gap, ambiguous, invalid time, before the session start, after a closed session end, overlap
  with an earlier listed row ("Break 4 overlaps Break 3."). Server `break_index` (codes
  `future_break`, `break_outside_session`, `overlapping_breaks`) maps to the sent row; nothing is
  mapped while the box is ticked. Note: today only `future_break` carries `break_index`
  (`timesheetCommands.ts:195`); the other two codes have no index yet, so they stay form-level
  messages until the server adds one (no server change here).
- Pre-fill: `referenceHours` resolves the reference times as configured schedule times
  (`resolveLocalDateTimeCompatible`: a repeated time takes the earlier instant, a missing one
  moves forward) on the accounting date in the reporting zone, end on the next date when its
  clock time is not after the start's, shown in the input zone pinned by offset.
  `pastDaySuggestedRows` uses the shared `suggestBreaks`, only when `workDate < todayLocal` (the
  server date passed in) and only rows lying inside the session; `reshiftSuggestions` re-places
  them until a row is added, removed or changed. Nothing decides when they are called (G-3).
- Dirty check `sessionDialogIsDirty`: compares zone, start, end (date, time, fold), the box and
  the rows in order (date, time, fold, minutes, counts as work). Chosen as cosmetic and ignored:
  `9:00`/`09:00`/`09:00:00`, `015`/`15`, surrounding spaces, row keys and origins, a dropped pin of
  an unchanged wall time, and hidden rows while the box is ticked in both states.
- Exports: `MIN_BREAK_MINUTES`, `MAX_BREAK_MINUTES`, `UNCONFIRMED_BLOCKED_MESSAGE`, `breakLabel`,
  `savedBreakMinutes`, `rowsFromSession`, `newBreakRow`, `rowKeepsPin`, `newSessionDialogDraft`,
  `sessionDialogDraftFromSession`, `editBreakRow`, `chooseBreakRowFold`, `replaceBreakRowGap`,
  `addBreakRow`, `removeBreakRow`, `setNoBreaks`, `changeDialogZone`, `parseBreakMinutes`,
  `resolveBreakRow`, `breakRowEnd`, `checkBreakRows`, `breaksPayload`,
  `buildSessionDialogRequest`, `buildCheckOutDialogRequest`, `serverBreakRowError`,
  `referenceHours`, `pastDaySuggestedRows`, `reshiftSuggestions`, `applyReferenceHours`,
  `breaksSummary`, `sessionDialogIsDirty`, plus their types.

### Evidence, deviations, process

- Evidence (masked LF): `handoff/delivery/evidence/WP5-UX3-T06/` step2-base, step2-digest,
  step3-typecheck, step3-lint, step3-test, step4-tz, step5-mutation1..3, step5-reverted,
  step6-e2e, step8-verify, step9-digest (`.txt`).
- Deviations: the `TZ` wrapper of step 4 (MSYS drops `TZ`); e2e fixture ports are OS-assigned
  (the fixture chooses them; verify used `SMOKE_PORT=48541`). No server, API, domain, UI, CSS,
  e2e or docs change; no commit, push or install. My single background task (build + e2e)
  completed with exit 0; none of mine is running.

Status: done
