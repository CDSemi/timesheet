# WP5-UX3-FIX2 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-FIX2; package WP5; kind fix;
  attempt 1; depends on WP5-UX3-FIX1-FREEZE. Second fix task of the round-3 fix round: the
  findings of the read-only sweep WP5-UX3-SWEEP (record
  `handoff/delivery/tasks/WP5-UX3-SWEEP.md`, section "Findings", evidence
  `handoff/delivery/evidence/WP5-UX3-SWEEP/`).
- **AGENTS.md on disk wins.** Any older injected AGENTS.md copy in your context with the
  section "Unified Frontend & UI/UX Standards (Taste Skills Integration)" is superseded.
- Coordinator decision (board `coordinator_decisions`, 2026-10-16) fixes the scope below;
  finding 12 is accepted as documented E-1 behaviour and is not changed here.
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model sonnet; no override. Routing: size M, risk M, novelty no. Task record in English.
- Base: HEAD = origin/main = the WP5-UX3-FIX1-FREEZE commit
  9187f31bee9c092041887d3ab034c492e33da0b5, or a later commit that changes only `handoff/`;
  source digest e4659145c15f07915d05d831df0478b3026bbedb0d3ec5dc8382b3db03bfd833 (833 files). Record HEAD,
  `git status --short` and the digest before you edit. Uncommitted coordinator files under
  `handoff/` are expected: never touch them.

## Items (sweep finding numbers; reproduce each first, then fix)

1. **Focus after an account-menu entry** (Medium): choosing Profile, Settings or
   Administration by keyboard closes the panel and leaves focus on `<body>`. On a route
   change move focus to the new page's main heading (`h1`, made focusable with
   `tabindex="-1"` if needed, without a visible change for mouse users); when the route does
   not change, return focus to the identity button. The phone More panel follows the same
   rule. Extend `tests/e2e/shell.spec.ts` (the keyboard test near line 588) for desktop and
   phone.
2. **Device-date mutant M18 survives** (Medium): make the past-day pre-fill test fail for a
   device-clock rule at any hour: choose the device zone (or a fixed browser clock with
   `page.clock`) from the server's `today_local` so the device date differs from the
   reporting-zone date during the test, and assert both branches (a past day gets suggested
   breaks; the server's today gets none). Prove it: apply M18 (`SessionDialog.tsx` using
   `new Date().toLocaleDateString('en-CA')` for the rule) and show the test fails; revert.
3. **Editor chip for an in-progress day** (Low): the Day editor's period chip must say "in
   progress" for every day of the in-progress period during the window days, however the day
   was opened (sheet, Open a day, Today), decided by the day's own period from the server's
   periods; add the Open-a-day path to `tests/e2e/today.spec.ts` under the simulated clock at
   2026-10-26T16:00:00Z.
4. **Wording** (Low): `BatchDialog.tsx` "Only the day label changes." becomes "Only the day's
   category changes."; user-visible "label" wording for the day category in `OtScreen.tsx`
   ("Day label and recorded use differ") and `HolidayImport.tsx` ("Days whose default label
   changes") becomes "category"; `ImportPreview.tsx` "Label as read" stays (it names the
   workbook's own column). Update the assertions that pin these strings (value-only).
5. **docs/12** (Low): `docs/12_RELEASE_NOTES.md:71` and the VI line: a refused Check out is
   resolved in the Check out dialog (its break rows or "Confirm no breaks taken"); "Confirm
   breaks" on a session card applies to ended sessions.
6. **docs/10** (Low): the main chunk figure at `docs/10_DECISIONS_AND_SOURCES.md:240` (VI
   :241) becomes the frozen build's figure after FIX1 and FIX2 (record it) or "under the 500
   kB advisory"; 9. the section reference at docs/10:226 (VI :227): the old sentence was
   docs/04 line 16, the paragraph after the Screens table.
7. **Profile in a different device zone** (Low): run the Profile assertion of
   `tests/e2e/settings-routes.spec.ts` with a device zone that differs from the reporting
   zone (for example Asia/Tokyo) so mutant M21 (device zone shown) fails; prove it; revert.
8. **Discard question at Check out** (Low, U-26): the Check out dialog asks "Discard your
   changes?" (Keep editing first, Discard) on Cancel, the X or Escape when its rows or the
   box changed; it closes at once when nothing changed; still no G-4 notice and no final
   confirmation there (Check out is its own explicit act). Tests in `day-editor.spec.ts`.
10. **Unused helpers** (Info): remove `quickBreaksRequest` and `confirmBreaksDraft` from
    `dayEditorModel.ts` if only tests use them, moving any oracle assertion that still
    proves something into the T06 model tests; or keep them clearly marked test-only and
    correct the comment that says "when nothing fits, for none". Say which.
11. **Ungated hover** (Info): put `.sheet-day[data-lift]:hover` and its pre-existing sibling
    `.sheet-day:hover` under `@media (hover: hover)` (AGENTS UI rule 3; docs/04 hover rule);
    keep the hover checks green.
13. **Hint link** (Info): link the "Calendar default ..." hint to the Category select with
    `aria-describedby` (`DayFieldsForm.tsx`).

## Checks (in this order; verify and the digest are the LAST commands)

1. Node 24 first on PATH (with `cygpath -u`), then `node --version` (v24.x).
2. Before any edit: `git rev-parse HEAD`, `git status --short`, `npm run digest`.
3. Reproduce items 1, 2, 3, 7 and 8 and record them.
4. Implement, then `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` (no
   chunk-size advisory; record the main chunk size).
5. The FULL e2e suite on both projects on the real clock, alone, with its own output folder:
   0 failed; counts per project. Then `today.spec.ts` and `day-editor.spec.ts` under the
   FIX10 simulated clock at 2026-10-26T16:00:00Z and 2026-10-20T17:00:00Z (copy the preload
   into your task folder only).
6. The mutant proofs of items 2 and 7, each applied alone and reverted.
7. EN/VI parity of the two docs pairs; `validate_package.py --preflight` with the workflow
   Python (`<user>` in evidence).
8. Privacy and whitespace: Grep changed files and evidence for email addresses (only the full
   synthetic example.invalid form) and user-profile paths; Grep every new or changed file for
   `[ \t]+$` and read its last lines (exactly one final newline).
9. `npm run verify` with `SMOKE_PORT` in 49000-49019 and `DATA_DIR` and `DATABASE_PATH` inside
   the task folder.
10. `npm run digest` LAST. If any file changes after it, rerun verify and the digest.
11. Copy the masked logs into the evidence folder (logs only, no helper scripts).

List every changed assertion with file:line and why it is not a weakening; no assertion
removed or weakened; no `skip`, `fixme` or `.only`. No server, API, domain, schema or CSP
change. Tokens only; WCAG 2.2 AA; keep every earlier behaviour including the FIX1 fixes.

## Owned paths

- `src/client/components/AccountMenu.tsx`, `src/client/components/AppShell.tsx`,
  `src/client/App.tsx` (route focus only), `src/client/SettingsScreen.tsx`,
  `src/client/ProfileScreen.tsx`, `src/client/AdminScreen.tsx` (heading focus only),
  `src/client/TimesheetScreen.tsx`, `src/client/DayEditor.tsx`,
  `src/client/components/dayEditorModel.ts`, `src/client/components/BatchDialog.tsx`,
  `src/client/OtScreen.tsx`, `src/client/components/HolidayImport.tsx`,
  `src/client/components/ClockOutDialog.tsx`, `src/client/components/DayFieldsForm.tsx`,
  `src/client/styles.css`
- `tests/client/dayEditorModel.test.ts`, `tests/client/breakRowsModel.test.ts` (moved oracle
  assertions only), `tests/e2e/shell.spec.ts`, `tests/e2e/day-editor.spec.ts`,
  `tests/e2e/today.spec.ts`, `tests/e2e/settings-routes.spec.ts`, `tests/e2e/timesheet.spec.ts`
  (string assertions only), `tests/e2e/import.spec.ts` and `tests/e2e/ot-leave.spec.ts`
  (string assertions only), `tests/e2e/hover.spec.ts`
- `docs/10_DECISIONS_AND_SOURCES.md` and `.vi.md`, `docs/12_RELEASE_NOTES.md` and `.vi.md`
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX3-FIX2/` (masked LF `.txt` only, plus at most six
  screenshots whose basenames end in `-synthetic.png`)

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`, NOT EVEN TO WRITE A FILE), NO `| node`, NO `| python`, NO
  `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`, NOT EVEN
  FOR A READ-ONLY LISTING. NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout` OR `nul`.
  NEVER `rm -r` OR `rm -rf` ANYTHING.** Redirect to a file in the task folder and read it
  with the Read tool; list files with the Glob tool. Use the Write and Edit tools for files.
- **Create files only inside the task folder, the evidence folder or your owned paths.**
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX3-FIX2`. Set TEMP and TMP to it. Ports
  49000-49019. Never touch `%LOCALAPPDATA%\timesheet-dev` data or `B:\Temp\claude`. Never
  kill processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. Write no
  markdown links in Results (paths in backticks only).

## Return

At most 200 words, beginning with 'Self-reported model: ...': per item the cause and the fix,
files changed, every changed assertion, unit and full e2e counts per project, the
simulated-clock results, the mutant proofs, parity and preflight, the main chunk size, verify
exit code, the final full 64-hex digest and file count, the evidence files, the
background-task confirmation, any stop, conflict or deviation.

## Addendum 1 (coordinator, 2026-10-16)

Your hand-back left the canonical UX document behind the new behaviour. The coordinator
extends your owned paths for exactly `docs/04_UX_AND_SETTINGS.md` and
`docs/04_UX_AND_SETTINGS.vi.md`:

1. Check out dialog (about line 70, and the VI line): add one sentence. When its rows or
   the "Confirm no breaks taken" box changed, Cancel or Escape asks "Discard your changes?"
   (Keep editing, Discard); with no change it closes at once; Check out itself shows no
   notice and no final confirmation.
2. Account menu (where docs/04 describes the identity block, the avatar menu or the phone
   More panel): add the focus rule. After an entry is chosen, focus moves to the new page's
   main heading; when the page does not change, it returns to the identity button (on
   phones, More). The heading shows the focus ring only to keyboard users.

Keep EN as the authority and the VI translation matching (same tokens and numbers); change
nothing else in docs/04. Then rerun the EN/VI parity of the docs/04 pair,
`validate_package.py --preflight` with the workflow Python (`<user>` in evidence), `npm test`,
the privacy and whitespace check of the two files, `npm run verify` (SMOKE_PORT in
49000-49019, DATA_DIR and DATABASE_PATH inside the task folder) and `npm run digest` LAST.
Same runtime rules as the brief. Append "Addendum 1 results" (the two docs/04 line numbers
EN/VI, parity, preflight, unit count, verify exit code, the new full digest and file count,
the evidence files) and finish with "Status: done".

## Results

### Checkpoint 1 (2026-10-16, about 14:30 UTC; worker, attempt 1)

- Base recorded before any edit: HEAD 9187f31bee9c092041887d3ab034c492e33da0b5; `git status --short` showed only the
  expected coordinator files under `handoff/`; `npm run digest` e4659145c15f07915d05d831df0478b3026bbedb0d3ec5dc8382b3db03bfd833
  (833 files); Node v24.21.0 (task folder `01-setup.txt`).
- Reproductions on the base build (`dist/` of the FIX1 freeze, `index-CZ6-3L9A.js`), real clock Fri 2026-10-16 about 07:07
  America/Los_Angeles (a window day: current period 09/28-10/11, in progress 10/12-10/25), new tests only, no source edit in
  effect for the browser: item 1 fails (focus is `inactive` on the Profile heading after Enter on the menu entry, desktop and phone
  More panel, 8 of 8); item 3 fails (`2026-10-12` through Open a day: chip "future period", expected "in progress"); item 8 fails
  (Cancel with an added break shows no "Discard your changes?"). 12 failed, 2 passed (the pre-existing Check in then Check out
  test): `evidence/WP5-UX3-FIX2/10-repro-base.txt`.
- Items 2 and 7 are mutant survivals (M18, M21), measured by the sweep on cecfceb; their proofs are in the mutant step below.
- Implemented: items 1, 3, 4, 5, 6, 9, 8, 10, 11, 13 and the tests; typecheck 0, lint 0, `npm test` 94 files 2131 tests passed,
  build 0 with no advisory (main chunk `index-4YHzamSq.js` 487.17 kB). Next: full e2e on both projects, simulated clocks, mutants,
  parity, preflight, privacy, verify, digest.
- Full e2e on the real clock (Fri 2026-10-16 07:16-07:32 America/Los_Angeles, alone, own output folder, 2 workers): 694 tests,
  0 failed, 627 passed, 67 skipped by their own project conditions (desktop 317 passed + 30 skipped, mobile 310 passed + 37
  skipped; the skips are the existing `test.skip` of phone-only and desktop-only specs, none added): `evidence/WP5-UX3-FIX2/30-full-real.txt`.

### Result (attempt 1, done 2026-10-16 about 14:55 UTC)

Self-reported model: claude-sonnet-5-5 (timesheet-worker-high, attempt 1). Evidence folder `handoff/delivery/evidence/WP5-UX3-FIX2/`
(25 masked LF `.txt`, no screenshots; the task folder `D:\.claude-tmp\timesheet\WP5-UX3-FIX2` holds the raw output, the copied
FIX10 clock preload `shiftclock.mjs` and the helper scripts, none in the repository). Base: HEAD 9187f31bee9c092041887d3ab034c492e33da0b5,
digest e4659145c15f07915d05d831df0478b3026bbedb0d3ec5dc8382b3db03bfd833 (833 files), Node v24.21.0.

#### Per item (cause, fix)

1. Focus after an account entry. Cause: the panel unmounts with the focused link and nothing moved focus (no route focus in
   `App.tsx` or `AppShell.tsx`). Fix: `AccountContent` reports the entry's address; `AppShell.tsx` `useRouteHeadingFocus` returns
   focus to the opener (identity button, or More) when the address does not change, else the next route's `h1` takes focus
   (`tabindex="-1"` on the three Settings-area headings, set from the shell for any other heading such as Import's; waits up to 5 s for
   a screen that loads on demand and gives up if the person has already moved focus). No CSS: the heading shows the shared ring only to
   a keyboard user, and none after a pointer press (asserted).
2. Device-date mutant M18. Cause: the only past-day test used the fixed device zone Asia/Ho_Chi_Minh, whose date equals the Los
   Angeles date from 07:00 to 17:00 UTC. Fix: a new test fixes the browser clock with `page.clock.setFixedTime` three days ahead and
   a year behind the server's `today_local` and asserts both branches (a past day: `data-prefill="hours-breaks"` and 3 suggested
   breaks; the server's today: `hours`, no break), at any hour. The old test stays as it was.
3. Editor chip. Cause: `TimesheetScreen.tsx` passed the period pill only for a day inside the shown period, so a day of the period
   in progress opened through Open a day fell back to the server relation ("future period"). Fix: `dayPeriodPill` (in
   `dayEditorModel.ts`) decides by the day's own period: the shown period if it holds the day, else the server's `in_progress`, else
   `current` (same `periodPillKind` rule as the bar), else nothing (the day's server relation).
4. Wording: "Only the day's category changes." (`BatchDialog.tsx`), "Day category and recorded use differ" (`OtScreen.tsx`), "Days whose
   default category changes" and its hint "Explicit categories ... default categories" (`HolidayImport.tsx`); "Label as read" kept. No
   existing assertion pinned these strings (Grep); three pins added (below).
5. docs/12 line 71 (EN, VI): a refused Check out is resolved in the Check out dialog (its rows or "Confirm no breaks taken"); "Confirm
   breaks" applies to ended sessions.
6. docs/10 line 240 (VI 241): main chunk "487 kB in the build after WP5-UX3-FIX2, under the 500 kB advisory" (built `index-4YHzamSq.js`
   487.17 kB); 9. line 226 (VI 227) now names the paragraph after the Screens table, line 16 before round 3. Also docs/10 line 238 (VI
   239) records the Check out discard question (item 8).
7. Profile in another device zone. Cause: the Profile test ran in the reporting zone. Fix: it runs in a `test.describe` with
   `timezoneId: 'Asia/Tokyo'` and asserts the reporting zone differs, the page's device zone is Asia/Tokyo, and the shown zone is the
   saved one and not Asia/Tokyo.
8. Check out discard. Cause: Cancel/Escape called `dialog.close()` at once. Fix: `ClockOutDialog.tsx` asks "Discard your changes?"
   (Keep editing first, Discard) through `ConfirmDialog` when `sessionDialogIsDirty(starting, draft)` (rows or box), on Cancel, Escape
   and the browser's close request, and closes at once otherwise; the dialog has no X; still no notice and no final confirmation at
   Check out.
10. Unused helpers: removed `quickBreaksRequest` and `confirmBreaksDraft` (only tests used them) and corrected the file comment; the
    oracle assertions that still prove something moved to `breakRowsModel.test.ts` (below).
11. Hover: `.sheet-day:hover` and `.sheet-day[data-lift]:hover` are under `@media (hover: hover)`; the same Grep-style scan also found
    `.sheet-day:hover .sheet-date` (with `.sheet .sheet-date:hover`) and `.sheet .sheet-day-button:hover`, ungated since before round
    3, so those two were gated as well (same file, same rule); the read-only sheet's two reset rules stay.
13. Hint link: the "Calendar default ..." paragraph has an id and the Category select `aria-describedby` it (only while the day's
    category source is the default).

#### Files changed

`src/client/AdminScreen.tsx`, `OtScreen.tsx`, `ProfileScreen.tsx`, `SettingsScreen.tsx`, `TimesheetScreen.tsx`, `styles.css`,
`src/client/components/AccountMenu.tsx`, `AppShell.tsx`, `BatchDialog.tsx`, `ClockOutDialog.tsx`, `DayFieldsForm.tsx`,
`HolidayImport.tsx`, `dayEditorModel.ts`; `tests/client/breakRowsModel.test.ts`, `dayEditorModel.test.ts`; `tests/e2e/day-editor.spec.ts`,
`hover.spec.ts`, `ot-leave.spec.ts`, `settings-routes.spec.ts`, `shell.spec.ts`, `today.spec.ts`; `docs/10_DECISIONS_AND_SOURCES.md`
and `.vi.md`, `docs/12_RELEASE_NOTES.md` and `.vi.md`; this brief; the evidence folder. No server, API, domain, schema or CSP change.
`SessionDialog.tsx` and `ProfileScreen.tsx` were mutated for the mutant proofs and restored (the final build hash equals the pre-mutant one).

#### Changed or added assertions (file:line; none removed except the five moved unit tests; no `skip`, `fixme`, `.only`)

- `tests/e2e/settings-routes.spec.ts:119-153`: the Profile test is unchanged in every assertion and now runs under `timezoneId:
  'Asia/Tokyo'`; added: reporting zone not Tokyo (:128), page zone is Tokyo (:132), shown zone not Tokyo (:138). Strengthening only.
- `tests/e2e/shell.spec.ts:660-704` (keyboard test, both roles, desktop and phone projects): added the entry-by-keyboard focus
  assertions (Profile, Settings, Administration lazy), the same-address return to the identity button, and the pointer case with no
  `:focus-visible`; `:708-754` new More-panel test (both roles): headings focused, then More focused for the page already shown.
  Existing assertions untouched.
- `tests/e2e/day-editor.spec.ts:705-750` new (item 2, both orientations of the device clock); `:2052-2142` new Check out discard test
  (closes at once unchanged; asks on Cancel and Escape; Keep editing keeps rows and returns focus; Escape in the question keeps editing;
  Discard sends nothing; the box counts; an undone change is no change; Check out still sends at once with no dialog);
  `:2252` Category description (item 13); `:3826-3827` the batch conflict step says "Only the day's category changes." and holds no "day
  label" (item 4).
- `tests/e2e/today.spec.ts:825-873` new: the chip for a day opened through Open a day in old, current, in-progress (first, last, today) and
  future periods, then through the sheet after Today and Open a day while that period is shown; both window and non-window branches.
- `tests/e2e/hover.spec.ts:552-594` new: every `.sheet-day` hover rule that paints is inside `@media (hover: hover)` (both projects) and,
  where the device can hover, a plain day column tints and returns to rest.
- `tests/e2e/ot-leave.spec.ts:121` the warning heading reads "Day category and recorded use differ" (item 4).
- `tests/client/dayEditorModel.test.ts:147-190` new `dayPeriodPill` tests (4). Removed (function removed): 'sends exactly the body of the
  form flow...', 'confirms no breaks with an empty, confirmed list...', and the describe of three tests 'the "Confirm breaks" entry opens
  the form with the one-tap choice selected'. Changed in place `:103-108` ('offers the rows already listed...'): the
  `quickBreaksRequest(...).breaks` value check became a check of `quick.rows` (12:00 to 12:20).
- `tests/client/breakRowsModel.test.ts:179-221` (moved oracles, 2 tests): the dialog request of "Confirm breaks" with suggested rows equals
  byte for byte the old form body (`buildSessionRequest` with `suggestedRows`, reason ` late entry ` trimmed) and keeps the same value pins
  (09:00 and 18:30 with -07:00, input zone, confirmed, version 4, break locals 11:00, 13:00, 15:30); the listed row (12:00-12:20, -07:00)
  and the ticked box (empty confirmed list, no reason key, equal to the old `none` body). Not carried over: the removed
  `confirmBreaksDraft` internals (`draft.mode`), because the function is gone; the dialog request and the e2e "Confirm breaks" tests cover
  the behaviour.

#### Checks

- `npm run typecheck` 0; `npm run lint` 0; `npm test` 94 files, 2131 tests passed; `npm run build` 0, no chunk advisory, main chunk
  `index-4YHzamSq.js` 487.17 kB (Administration 31.57, Import 23.82, CSS 78.62 kB).
- Full e2e, real clock, both projects: 694 tests, 0 failed, 627 passed (desktop 317, mobile 310), 67 skipped by existing project
  conditions (desktop 30, mobile 37) - `30-full-real.txt`.
- FIX10 clock preload (copy in the task folder), `today.spec.ts` + `day-editor.spec.ts`, both projects: 2026-10-26T16:00:00Z (a window day;
  Mon 09:00 America/Los_Angeles): 168 tests, 145 passed, 23 skipped, 0 failed (desktop 79 passed, 5 skipped; mobile 66 passed, 18 skipped);
  2026-10-20T17:00:00Z (mid-period; Tue 10:00): the same 145 passed, 23 skipped, 0 failed - `31-sim-2026-10-26T16.txt`, `32-sim-2026-10-20T17.txt`.
- Mutant proofs (each applied alone, rebuilt client, reverted): M18 (`SessionDialog.tsx`, `todayLocal` replaced by
  `new Date().toLocaleDateString('en-CA')`): the old test `day-editor.spec.ts:593` still passes on both projects (survives, the item 2
  reproduction) and the new test fails on both ("three days ahead: the server's today is pre-filled with hours only", received
  `hours-breaks`) - `61-m18-run.txt`. M21 (`ProfileScreen.tsx`, device zone instead of `periods.reporting_zone`): the new Profile test fails on
  both projects (expected America/Los_Angeles, received Asia/Tokyo) - `64-m21-run.txt`; the old test's survival is the sweep's measurement
  (its `test.use` zone was the reporting zone, `settings-routes.spec.ts:10` at the base) - I could not run the old file without adding
  a file outside my paths. Extra: un-gating `.sheet-day:hover` fails the new hover test on both projects - `67-m11-run.txt`.
- EN/VI parity: docs/12 pair 108 and 108 lines, 3 pre-existing token differences at lines 28, 76 and 82, none at the changed line 71;
  docs/10 pair has a pre-existing 1-line offset (the VI translation note), so the three changed paragraphs were compared as pairs (EN 226/VI
  227, 238/239, 240/241): same numeric and code tokens - `40-parity-docs10.txt`, `41-parity-docs12.txt`. `validate_package.py --preflight`
  (workflow Python `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`): PASS, exit 0, 112
  translation pairs - `71-preflight.txt`.
- Privacy and whitespace: no trailing blank in any changed file or evidence file, `git diff --check` 0, only the synthetic
  `example.invalid` addresses (two pre-existing lines in `shell.spec.ts`, and the verify output), no user-profile path - `90-privacy-whitespace.txt`.
- `npm run verify` (SMOKE_PORT 49005, DATA_DIR and DATABASE_PATH in the task folder): exit 0 - `80-verify.txt`. `npm run digest` last:
  65a2296e6e31b552b42e837f383037b271c18a95ef9b8f6bcfe8954573b43abd (833 files) - `81-digest.txt`. Nothing under `src`, `tests` or
  `docs` was changed after it.

#### Notes, deviations and open points

- Not owned, so not edited: `docs/04_UX_AND_SETTINGS.md` line 70 (and VI) describes the Check out dialog and should gain one sentence for
  the discard question (the decision is recorded in docs/10 line 238); docs/04 may also name the new focus rule of the account menu.
- Browser ports of the e2e fixtures are ephemeral loopback ports chosen by the fixture (`fixtures.ts` is not in my paths), not 49000-49019;
  only the smoke server used SMOKE_PORT 49005.
- Three shell-rule slips, all harmless read-only output: one command had a `/dev/null` redirect after the typecheck/lint run, one
  preflight display was piped into `head -c`, and one last-bytes check of this brief was piped into `tail`. No stdin script, no
  heredoc, no recursive delete, no process killed.
- Finding 12 untouched, as instructed. Real clock was inside a window day for the first runs (Fri 2026-10-16 07:xx America/Los_Angeles).
- No background task of mine is running (the three background jobs finished and notified).

Status: done

### Addendum 1 results (2026-10-16)

Self-reported model: claude-sonnet-5-5. Only `docs/04_UX_AND_SETTINGS.md` and `.vi.md` changed (no other file).

- Check out discard sentence: EN line 70 and VI line 70 (appended after the sentence on the notice not used at Check out).
- Account-menu focus rule: EN line 7 and VI line 7 (the App shell row, after the sentence on Escape, page change and Tab past Sign out
  closing the menu): after an entry is chosen, focus moves to the new page's main heading, or back to the identity button (on phones,
  More) when the page does not change; the heading shows the focus ring only to keyboard users.
- docs/04 parity (`a1-40-parity-docs04.txt`): one difference, at VI line 108, the pre-existing translation note with no English line
  (VI has 109 lines, EN 107); lines 7 and 70 have the same numeric and code tokens.
- `validate_package.py --preflight` (workflow Python, `<user>` masked): PASS, exit 0, 112 translation pairs (`a1-41-preflight.txt`).
- `npm test`: 94 files, 2131 tests passed (`a1-42-test.txt`).
- Privacy and whitespace of the two files: 0 trailing blanks, 0 email addresses, 0 user-profile paths; evidence files clean.
- `npm run verify` (SMOKE_PORT 49006, DATA_DIR and DATABASE_PATH in the task folder): exit 0 (`a1-43-verify.txt`).
- `npm run digest` last: 262138e0c94c90dc0287e6de87e69f2aabfa68d3bd7bdb6262322c1e2b8f0191 (833 files) (`a1-44-digest.txt`).
- Evidence added in `handoff/delivery/evidence/WP5-UX3-FIX2/`: `a1-40-parity-docs04.txt`, `a1-41-preflight.txt`, `a1-42-test.txt`,
  `a1-43-verify.txt`, `a1-44-digest.txt`. No background task running; no rule slip in this addendum.

Status: done
