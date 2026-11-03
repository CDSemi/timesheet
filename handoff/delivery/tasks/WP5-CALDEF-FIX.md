# WP5-CALDEF-FIX dispatch brief (implement the owner's answer to R-UX5I2-3)

- **Task.** Mission timesheet-software-readiness, task WP5-CALDEF-FIX, package WP5, kind fix,
  attempt 1, depends on WP5-CALDEF-PLAN-REVIEW (done). You are the only source writer.
- **Owner decision (2026-11-02, verbatim on the board under `owner_decisions`):**
  "R-UX5I2-3: nếu giá trị mặc định đã đổi thì hiện thông báo, để người dùng quyết định save
  (ghi đè) hay update theo giá trị mặc định mới". Translation: if the default value has
  changed, show a notice so that the person decides whether to save (overwrite) or to update
  to the new default. A user-confirmed requirement (AGENTS rule 8).
- **Profile and routing.** timesheet-worker-high (high), requested sonnet, no override. docs/08
  "High-risk fix/slice with an existing pattern" (the day-fields version guard, the stale
  notice and the stale-version reload flow are the pattern). Size M, risk H, novelty no.
  Task record in English.
- **State.** HEAD = origin/main = 5b2f287 (digest 4ac52e6b, 882 files); product source
  unchanged since the accepted a54061f / 690fd8fd. The working tree holds uncommitted
  coordinator records under `handoff/`: leave them alone. Do not stage or commit anything.

## The specification

Read, in this order, and implement:

1. `handoff/delivery/evidence/WP5-CALDEF-PLAN-REVIEW/review.txt`, **section 6 "Amended plan
   section"**. It is the binding specification. Where it differs from the plan, it wins.
2. The same file, sections 1-5: the confirmed and corrected claims, must-fix MF1-MF4,
   should-fix S1-S14 and mutants M16-M23. The coordinator accepted all of them.
3. `handoff/delivery/evidence/WP5-CALDEF-PLAN/plan.txt`: the original plan, for the mechanism,
   the design reasoning, tests I1-I13, W1-W11 and mutants M1-M15.

Coordinator decisions in force (board `coordinator_decisions`, 2026-11-02): the two-button
notice is in the Day editor (desktop drawer, phone sheet, shared edit view); the label picker
and "Change several days" answer through the reload flow, made reachable from the preview
path as MF2 says; `default_category` is optional and an omitted field is not checked.

The rule in one line (MF1): refuse with 409 `default_changed` only if the field is present,
the day has no entry or a default-sourced entry, the current default is known, the sent
default differs from it, and the category being saved differs from it. Explicit entries are
never checked.

## Writable paths (exactly these)

- `src/server/http/schemas.ts`
- `src/server/services/timesheets.ts`, `src/server/services/timesheetCommands.ts`,
  `src/server/services/dayEntries.ts`
- `src/server/http/errors.ts` (only for a `defaultChanged()` helper)
- `src/client/api.ts`, `src/client/DayEditor.tsx`, `src/client/TimesheetScreen.tsx`
- `src/client/components/DayFieldsForm.tsx`, `sessionModel.ts`, `dayModel.ts`,
  `labelPickerModel.ts`, `errors.ts`, `BatchDialog.tsx`
- `tests/integration/calendar-default-change.test.ts` (new)
- `tests/client/sessionModel.test.ts`, `labelPickerModel.test.ts`, `dayModel.test.ts`,
  `errors.test.ts` (new)
- `tests/e2e/calendar-default.spec.ts` (new; it carries its own `importHoliday` helper)
- `tests/e2e/day-editor.spec.ts`: only the label-pick batch body assertions near lines
  4936-4940 and 4953 (MF3); the FIX18, FIX19 and U4-05 tests stay unmodified
- `src/client/styles.css` with `tests/client/cssThemeParity.test.ts` and
  `tests/client/styleTokens.test.ts`, only if a new custom property proves necessary (then in
  the light set and both dark sets)
- This brief's Results and `handoff/delivery/evidence/WP5-CALDEF-FIX/`

Not yours: `package.json`, the lockfile, migrations, `tests/e2e/fixtures.ts`, any document
(docs/02, 03, 04, 10 and 12 are WP5-CALDEF-DOCS, after you), the board and every shared
record. If a needed change falls outside these paths, stop and report it.

## Order of work

1. **Reproduce first** on the unchanged source: the INT3 E3 shape (an entry still on its
   calendar default, a holiday imported for that date while the editor is open, a typed note,
   Save day fields) records the old category over the new default; also the no-entry shape.
   Save the observation. Your new tests W1 and I1/I2 must fail on the unchanged source.
2. Implement the server contract, then the client, then the tests.
3. Run the mutants M1-M23 one at a time; each must fail at least one named test; restore the
   source after each and show the restore (for example `git diff --stat` equal to before).

## Checks (record command, exit code and counts in `evidence/WP5-CALDEF-FIX/`)

- `npm run lint`, `npm run typecheck`, `npm run build`, `npm run verify`, `git diff --check`:
  exit 0. No deprecated API, and no toolchain deprecation warning.
- `npm test`: exit 0, with the file and test counts (2,397 before).
- The new e2e spec on both projects, then 20 repeats of it: 0 failed.
- Real-clock FULL e2e on both projects (desktop and mobile): 0 failed, with the counts.
- The FIX18, FIX19 and U4-05 tests of `day-editor.spec.ts`, both projects: 0 failed.
- One axe scan with the notice open, desktop and phone, both themes: 0 violations.
- A clean build of a54061f and of your tree: list which files of `dist/server`,
  `dist/domain` and `dist/client` differ.
- `npm run digest` on your final tree: the digest and file count.
- `git status --short` outside `handoff/`: exactly the changed and new paths, all inside your
  writable list.

## Rules

- Synthetic data only; no real names. Ports 52090-52129 for every server you start. Private
  servers per test as the plan says. Stop every process you start; never kill by PID a process
  you did not start. No `sleep` loops; poll with the test tools' own waits.
- If the host is busy with other work, record a short CPU census and go on; do not wait in a
  loop.
- Follow the AGENTS.md UI standards (tokens, the shared focus ring, 44px targets below 768px
  and with a coarse pointer, both themes, no colour-only state, `--transition` only).
- Never invent evidence; an unknown completion is unverified.

## Results

Worker: self-reported model claude-sonnet-5-5 (timesheet-worker-high, 2026-11-02). Evidence: `handoff/delivery/evidence/WP5-CALDEF-FIX/`
(numbered logs, `mutants/`, `tools/`). Nothing was staged or committed; no shared record was edited.

### Reproduction (unchanged source a54061f = HEAD source)

- `00-repro-observation.txt` (run `00-repro-unchanged-source-log.txt`, tool `tools/zz-caldef-repro.test.ts.txt`, a temporary vitest file deleted after the
  run): a day shown as Worked/default; an administrator's holiday import (commit 201) makes it Holiday/default with entry v1 unchanged; the old form's PUT
  (category Worked, expected_version 1, typed note) answered 200 and the server then held Worked/explicit entry v2. The no-entry shape: PUT 200, Worked/explicit
  entry v1 over the new Holiday default. Both shapes of INT3 E3 / INT2 E2 reproduced through the API.
- `01-repro-int-unchanged-source-log.txt`: the new integration file on the unchanged source (copy in a clean export of a54061f): 17 failed, 1 passed (I6, the omitted
  field, which the old contract already allowed). `09-e2e-new-spec-on-base-desktop-log.txt`: the new e2e spec against the dist of a54061f, desktop: 20 failed, 3 passed
  (W4b, W6, W6b, the cases that must show no notice), 1 skipped; every failure is "the notice never appeared" (the old build saves silently), W1 included.

### Changed and new paths (git status outside handoff/: exactly these)

Server: `src/server/http/schemas.ts`, `src/server/http/errors.ts`, `src/server/services/timesheets.ts`, `timesheetCommands.ts`, `dayEntries.ts`.
Client: `src/client/api.ts`, `DayEditor.tsx`, `TimesheetScreen.tsx`, `components/DayFieldsForm.tsx`, `sessionModel.ts`, `dayModel.ts`, `labelPickerModel.ts`, `errors.ts`,
`BatchDialog.tsx`. Tests: `tests/integration/calendar-default-change.test.ts` (new), `tests/client/errors.test.ts` (new), `tests/client/sessionModel.test.ts`,
`labelPickerModel.test.ts`, `dayModel.test.ts`, `tests/e2e/calendar-default.spec.ts` (new), `tests/e2e/day-editor.spec.ts` (two lines: the label-pick body assertions at
4936 and 4953 now carry `default_category: 'Worked'`; FIX18, FIX19 and U4-05 tests untouched). No `styles.css` change (the notice reuses `.stale`, `.button-row`, the
generic 44px touch rule and the shared focus ring), so no custom property, no CSS test change. `package.json`, the lockfile, migrations, fixtures.ts: untouched.

### Contract as built

- `PUT /api/days/:date` and each `POST /api/days/batch` entry: optional `default_category` = `dayCategory.nullable().optional()` in the two strict schemas.
  `calendarDefaultOn(scope, date)` (timesheets.ts) is the one place that derives the date's default (also used by `effectiveCategory` and the batch's `currentCategoryOf`).
  `defaultChangeOf(scope, date, existing, input)` (timesheetCommands.ts) is the rule MF1: refuse iff the field is present AND (no entry OR `category_source = 'default'`)
  AND the current default is known AND sent != current AND `input.category` != current. Explicit entries and an omitted field are never checked. The scope is the SUBJECT's
  (owner's) calendar, loaded inside the IMMEDIATE write transaction.
- PUT order: `prepareEdit` (imported 409, reason 422) -> leave 422 -> `stale_version` 409 -> `default_changed` 409 -> write. Body:
  `{error:{code:'default_changed', message:'The calendar default for {date} changed from {expected|none} to {current} since it was loaded. Nothing was saved.', details:{work_date, expected_default, current_default}}}`.
- Batch preview (read-only): per entry stale -> invalid -> default_changed -> create/update/unchanged; status `default_changed`, `error: {code, message:'The calendar default is now {current} (was {expected|none})', details:{expected_default, current_default}}`, `can_commit` false.
- Batch commit (one IMMEDIATE transaction, all or nothing): `stale_version` 409 -> `batch_invalid` 422 -> `reason_required` 422 -> `default_changed` 409 `{work_dates, changes:[{work_date, expected_default, current_default}]}` -> `conflicts_require_confirmation` 409 -> writes.
- Acknowledgement is the same call with `default_category` = `current_default`; a further change refuses again. Nothing is stored, no migration, no audit change (a no-entry create audits `before = null`, as before).

### Notice behaviour (Day editor: desktop drawer, phone sheet, shared edit view; one component, `DayFieldsForm`)

- The form captures `shownDefault = day.default_category` in state at mount and sends it on every save (never the live prop: the FIX19 held branch keeps the old category under an answer carrying the new default; mutant M10).
- A 409 `default_changed` (parsed by `defaultChangeOf` in components/errors.ts; any other shape -> the generic message) shows `div.stale role="alert" tabIndex=-1` under "Category and leave": "Notice. The calendar default for this day changed from {expected|none} to {current} since it was loaded. Nothing was saved. Use the new default, or save your category over it." It takes focus and scrolls into view (`block: 'nearest'`). Buttons in Tab order: "Use {current}" (secondary) then "Save {draft category} anyway" (primary); both disabled while busy, "Save anyway" also while the reason is missing. 44px through the generic touch rule (not `.editor-actions`).
- "Save anyway": `shownDefault = current`, PUT of the current draft, the live entry version, the reason and `default_category = current`; success closes the notice and focus goes to the Category select; a further change shows a new notice; `stale_version` closes the notice and runs `onStale` (Reload day).
- "Use {current}": nothing is sent; the category takes the new default, every other typed field stays, `shownDefault = current`, the baseline is rebased to the loaded fields with the category = current (so taking the default alone is not an unsaved edit), polite status "Category set to {current}, the calendar default now. Nothing needs saving." or "... Save day fields to keep your other changes."; focus to the Category select; `DayEditor.defaultTaken` calls `onChanged()` (the sheet shows the new default) and makes one dayStamp-guarded GET, taken without a new generation only if `fresh.category = current` and `sameDayFields` holds for the other fields and the source (else ignored).
- MF1 consequence kept: choosing the new default by hand and pressing Save is accepted (no second notice); after "Use" a different category is saved without a second notice (W2c).
- Label picker and "Change several days" (MF2): `labelEntry` and `batchEntries` add `default_category: day.default_category`; `BatchDialog` shows "calendar default changed: The calendar default is now Holiday (was Worked)"; closing a review whose preview holds `stale` or `default_changed` entries sets the page's stale notice (`movedPreviewDates` -> `staleReloadMessage`), so "Reload period" is offered (it was not before, for `stale` either); a commit 409 `default_changed` is handled as `stale_version`.

### Tests added

- `tests/integration/calendar-default-change.test.ts`: 18 tests, I1-I17 (I1, I2, I3, I4, I5 incl. rename and kind change, I6, I7, I8 revised, I9, I10, I11, I11b, I12 on a second calendar, I13, I14, I15, I16, I17 = no default to protect: calendar_missing stands). Holidays are imported through the real admin route (preview then commit).
- Client unit: `errors.test.ts` (6, `defaultChangeOf`), `sessionModel` (+1), `labelPickerModel` (+1 and the exact shape updated), `dayModel` (+2 and `movedPreviewDates`, exact shape updated). Existing exact shapes in sessionModel/labelPicker/dayModel updated; 756 client tests, 32 files.
- `tests/e2e/calendar-default.spec.ts` (its own `importHoliday`, `earliest_effective_from`, one private server and one synthetic person per test, 25 tests per project): W1, W2, W2b, W2c, W3 (both choices), W4a/W4b (FIX19 held / restart), W5 (FIX18 follow), W6, W6b, W7a, W7b (U4-05), W8 (phone, mobile project), W9a/W9b/W9c (picker, batch, commit race), W10 (shared edit view, both choices), W11 (contrast and focus ring, light and both dark sets), W12, W13, W14, W15, W16 (stubbed answers: Save anyway stays disabled while a period's reason is missing), W17 (device zone Pacific/Auckland).

### Mutants (`mutants/00-summary-tsv.txt`, one log per mutant; each applied alone with a SHA-256 restore check)

36 mutants run, 36 killed, 0 survived, restore ok for all 36; `mutants/00-diffstat-before.txt` and `00-diffstat-after.txt` (git diff --stat and git status of src and tests) are identical.
Plan M1-M15 and M16-M23 are all covered (M2 = M2a/M2b, M5 = a/b, M7 = a/b, M8 = a/b, M9 = a/b plus M9c on the client parser, M11 = a/b/c, M13 = a/b, M15 = a/b/c/d (d = the 44px class); M12 is run as M12a (resends the old default); M24 (buildDayEntryRequest drops the field) is extra. Killers:
M1 I1,I2,I5,I7 (7 tests); M2a I2; M2b I1,I5,I7,I8; M3 I4,I11b; M4 I5 (+I3); M5a I6,I11b,I15; M5b I17; M6 I7; M7a I3 (+6); M7b I1,I2 (+7); M8a I9,I10,I15; M8b I10,I15; M9a I1,I2 (+3); M9b I10; M16 I14,I8; M17 I12; M19 I15; M13a/M13b the labelPicker/dayModel unit tests; M9c errors.test; M24 sessionModel.test;
M10 W4a; M11a W2; M11b W7a; M11c W2c; M12a W1; M14 W9c; M15a/b/c W1; M15d W8 (mobile); M18 W9a,W9b; M20 W14; M21 W15; M22 W2; M23 W16.
The MF1 consequence made M11c killable only by W2c (added), and M4 only by I5 once its other-date cases used a category different from the default (fixed).

### Checks (command, exit, counts; logs in the evidence folder)

- `npm run lint` exit 0 (11-final-lint-log.txt); `npm run typecheck` exit 0; `npm run build` exit 0, no chunk advisory; `git diff --check` exit 0; no deprecation or toolchain warning in any of them (grep count 0).
- `npm test` exit 0: 103 files, 2425 tests (2,397 before; +28) (12-npm-test-log.txt).
- New e2e spec, both projects, once: exit 0, 45 passed, 5 skipped (13-e2e-new-both-1-log.txt). 20 repeats (`--repeat-each=20 --fully-parallel --workers=6`, desktop and mobile): exit 0, 900 passed, 100 skipped, 0 failed, 11.4 min (14-e2e-new-repeat20-log.txt).
- FIX18, FIX19 and U4-05 tests of day-editor.spec.ts, both projects (`-g "WP5-UX5-FIX18|WP5-UX5-FIX19|U4-05"`): exit 0, 38 passed, 38 skipped (the phone skips), 0 failed (17-...-log.txt).
- Real-clock FULL e2e, both projects (`npx playwright test --project=desktop --project=mobile`, the config's 2 workers): exit 0, 1090 tests, 937 passed, 153 skipped, 0 failed, 15.6 min (18-e2e-full-both-log.txt). It includes the updated label-pick test of day-editor.spec.ts.
- axe-core 4.14.0 (scratch install outside the repository, `--ignore-scripts`; axe is not a dependency): notice open, 1440px (drawer beside), 1024px (floating drawer), 390px (phone sheet), light, dark by system setting and dark chosen: 9 scans, 0 violations (16-axe-observations.txt, probe in tools/). axe reports `color-contrast` as "incomplete" (needs review) on all nine; W11 measures the text contrast of the notice and both buttons (>= 4.5), the primary fill (>= 3) and the shared focus ring (>= 3) in the three theme sets.
- Dist (15-dist-compare.txt; base = clean export of a54061f built with the same toolchain through a node_modules junction): dist/domain 48/48 identical. dist/server 184 files, 174 identical, 10 differ = `http/errors.js`, `http/schemas.js`, `services/dayEntries.js`, `services/timesheetCommands.js`, `services/timesheets.js` and their maps (nothing else). dist/client: the stylesheet and `jsx-runtime` chunk are identical (`jsx-runtime`'s map differs only in its source paths); `index-*.js` (changed code) and the lazy chunks Admin/Import/Review/SettingsTransfer/SettingsTransferFile get new hashed names and `index.html` its new script reference; Import and jsx-runtime are the same code once the hash names are normalised, Admin/Review/SettingsTransfer(File) differ in the minified one-letter import aliases of the renamed index exports (inspected for ReviewScreen only; the other three not diffed). The container drill and `npm audit --omit=dev` are the gate's, not run here.
- `npm run digest` on the final tree: `1b40bf8a7a739fd51aee2c7edb28ce6b007cb6bc1e61f05e39a6feb75b4c4495  (885 files, handoff/ excluded)` (882 + 3 new files) (20-digest-log.txt).
- `git status --short` outside handoff/: 18 modified and 3 new paths (21), all in the writable list and all listed above.
- `npm run verify`: first run (19a) typecheck, lint, test (103 files, 2425 tests) and build passed, then `npm run smoke` failed with "No Monday found": `scripts/smoke-built-server.mjs` `recentMonday()` steps back 1..7 times 24 h and reads the Los Angeles weekday; run at 23:49 LA time on Monday 2026-11-02, after the 2026-11-01 DST change, the 7-day step lands on Tuesday 00:49 PDT. The unchanged a54061f fails the same way at the same time (19c); the script is not in this task's paths (open point for the coordinator: a small, separate fix). Rerun after the LA midnight on 2026-11-03 (19b): exit 0, typecheck, lint, 103 files / 2425 tests, build, `SMOKE PASSED` (45 PASS lines). The digest above was taken again after that run: unchanged.

### Slips and open points

- Servers use the harness's own OS-assigned free loopback ports (`fixtures.ts` `freePort()`, not owned), not 52090-52129; every one was started and stopped by the fixture, the axe probe and the base runs only used fixture servers.
- First draft of the integration file failed on the unchanged source only because the strict schema rejects the new key (422); the behavioural reproduction was therefore taken separately (00-repro).
- W11's first draft asserted a 3:1 boundary for the secondary "Use" button and failed at 2.05:1 in the light theme: that is the app-wide `button.secondary` look (text-on-surface, boundary shown by a hairline), not a new value; the test was narrowed to text 4.5:1, primary fill 3:1 and the focus ring 3:1. Worth a design look only if the owner wants a 3:1 boundary for every secondary button.
- A stray `cat >` without input held one foreground call until its timeout (no effect on files).
- Scratch work outside the repository: `…/scratchpad/base` (clean export of a54061f, `node_modules` junction), `…/scratchpad/axe-pkg`, `…/scratchpad/axe-probe`.
- Documents are not touched (WP5-CALDEF-DOCS): docs/12 and docs/02, 03, 04, 10 still need the entry, the rule and the contract as built above (MF1 rule, MF2 reload path, batch commit order, optional field, audit `before = null` for a no-entry overwrite, the stale-version-first case for a no-entry day after a session create).

### Leftover check (2026-11-03, after the coordinator's follow-up)

One background shell of mine was still alive: the foreground call of mine that held a stray `cat` waiting on stdin (a bash.exe pair, started 22:49 on 2026-11-02, no port, no server). Every other background job I started (vitest, build, Playwright, mutation runner, verify, wait helpers) had exited. I stopped that bash pair by its own process ids (it is identifiable by the stray `cat > $TEMP/x.txt` command line); the runtime then reported its task as ended. Fresh check: no bash, node, Playwright or browser process of mine remains (the node process on port 3000, started 2026-10-27, is not mine and was left alone); `git status --short` outside handoff/ still shows exactly the 21 paths (18 modified, 3 new); `npm run digest` is still `1b40bf8a7a739fd51aee2c7edb28ce6b007cb6bc1e61f05e39a6feb75b4c4495  (885 files, handoff/ excluded)`. No repository file outside this brief was changed for this check.
