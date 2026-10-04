# WP2-FIXB dispatch brief

- Mission/task: timesheet-software-readiness / WP2-FIXB; package WP2; kind fix; attempt 1;
  `addresses_audit` WP2-AUDIT-B (FIX REQUIRED: WP2-B-01 and WP2-B-02). It does not depend
  on that audit.
- Profile/routing: timesheet-worker-high, requested sonnet/high, no override. Routing:
  size S, risk H (time-input semantics, AGENTS rule 7), novelty no.
- Read AGENTS.md from disk first (rule 7 and the UI standards section). Then read:
  - handoff/prompts/FIX_FINDINGS.md;
  - [WP2_REVIEW_B](../WP2_REVIEW_B.md), for the findings, their file:line and the related
    observation;
  - its evidence in handoff/delivery/evidence/WP2-AUDIT-B/: the input-zone probe and
    `audit-b-probe.spec.ts.txt`;
  - docs/02 R-07 and docs/04 (manual entry, zones).
- Load the three design skills with the Skill tool before UI edits:
  `stitch-design-taste`, `design-taste-frontend` and `high-end-visual-design`. AGENTS.md
  and E-8 win on conflicts.
- Baseline: main at 8fae685949adb525ec137e5972202f58b408ac24, plus the uncommitted
  WP2-FIXA changes. Those touch holidayImport.ts, HolidayImport.tsx, the preview types in
  api.ts and holiday-import.test.ts. Leave them as they are; one combined freeze follows
  your task.
- Runtime: call the Node 24 portable binary by its full path. The fixture uses
  `process.execPath`.
- Do not commit.

## Required fixes (binding)

1. **WP2-B-01 (Medium).**
   - Manual time entry defaults its input zone to the current display zone, as R-07
     requires, not to the reporting zone. The user can still change it explicitly.
   - Locations: src/client/DayEditor.tsx:75 and src/client/components/SessionForm.tsx:53.
   - Update the e2e at tests/e2e/day-editor.spec.ts:95, which locks in the old behaviour.
   - Add an e2e that runs with a browser zone that differs from the reporting zone (for
     example Asia/Ho_Chi_Minh against America/Los_Angeles). It asserts:
     - the default equals the display zone;
     - a saved session stores the instant the user typed in that zone.
   - Rule-8 guard: if R-07 as written does not require the display-zone default, stop and
     report instead of changing behaviour.
2. **Related observation (same area).** Show the expected finish in the display zone, and
   label it as derived, because it is computed through the shared domain function. Keep
   it display-only.
3. **WP2-B-02 (Low).** Replace the new literal font sizes and layout widths in
   src/client/styles.css (lines 410, 587, 616, 632, 678, 802, 825, 843, 876 and 966 at
   8fae685) with CSS custom properties. Visual output must be identical: same computed
   values, no layout change.

## Owned (writable) paths

- src/client/DayEditor.tsx.
- src/client/components/: SessionForm.tsx, sessionModel.ts and DayFigures.tsx.
- src/client/styles.css.
- tests/e2e/day-editor.spec.ts and tests/client/sessionModel.test.ts.
- This report and handoff/delivery/evidence/WP2-FIXB/.

List any other minimal edit as a deviation. Edit no server code.

## Checks

- Write each regression red-first: run the new e2e and unit assertions against the
  unfixed code first, and save the output.
- Run `npm run verify` and `npm run test:e2e` (both projects); both must exit 0.
- For WP2-B-02, show that computed styles are unchanged. A before/after
  `getComputedStyle` probe on the affected selectors, or a screenshot comparison, is
  enough.
- Run `npm run digest`.
- Screenshots named `*-synthetic.png`. Evidence must be masked, LF and free of trailing
  whitespace. Use synthetic data only, no deprecated APIs and no inline styles.

Return at most 180 words, beginning with your self-reported model: each finding's fix and
test, the guard result, verify and e2e exits, digest and deviations.

## Results

Worker: timesheet-worker-high, self-reported model claude-sonnet-5-5, attempt 1. Evidence: handoff/delivery/evidence/WP2-FIXB/.

- Rule-8 guard: passed. docs/02 R-07 (line 74) says "Manual time entry must show and use its selected input zone, defaulting to the current display zone", so the change implements the canonical rule; no business behaviour or doc was changed.
- WP2-B-01 fix: `inputZoneChoices(displayZone, reportingZone)` in sessionModel.ts returns the display zone first; DayEditor.tsx uses it, SessionForm.tsx still takes `zones[0]` as the default for a new session and keeps `session.input_zone` for an edit. The reporting zone stays in the list; the user can type any zone.
- Related observation fix: `expectedFinishText(sessions, policy, displayZone)` formats in the display zone; DayFigures.tsx labels it "Expected finish (derived)" and adds a note that it is derived and display only (nothing saved).
- Tests: tests/client/sessionModel.test.ts (display-zone finish, `inputZoneChoices`); tests/e2e/day-editor.spec.ts (the old lock-in now asserts the display-zone default and types Los Angeles explicitly; the overnight and DST gap tests set the zone explicitly; new e2e with browser zone Asia/Ho_Chi_Minh against reporting zone America/Los_Angeles: default equals display zone, 22:00-23:30 typed there is stored as 08:00-09:30 Los Angeles on the same accounting date, edit keeps the saved zone, an explicit Los Angeles choice still works; expected finish asserted in the display zone with the derived label).
- Red first: 01-red-unit.txt (4 failed) and 02-red-e2e.txt (4 failed on both projects: expected Asia/Saigon, received America/Los_Angeles) against the unfixed code; green: 03-green-targeted.txt.
- WP2-B-02 fix: custom properties `--font-size-md/-lg/-xl`, `--dialog-width`, `--dialog-width-wide`, `--dialog-fit`, `--dialog-fit-wide`, `--select-min`, `--facts-min`, `--figures-min`, `--counter-min`, `--action-min` replace the ten listed literals (current lines 422, 599, 628, 644, 690, 814, 837, 855, 888, 978); the values are unchanged. Proof: a before/after getComputedStyle probe of 11 selectors (width, min-width, font-size, grid-template-columns) on desktop and mobile is identical (07-computed-diff.txt, probe-before/, probe-after/). The probe spec was temporary and is kept as style-probe.spec.ts.txt. Other pre-existing literals (1.4rem, 1.25rem, 0.7rem, 1rem) were not in the finding and are untouched.
- Gates: `npm run verify` exit 0 (typecheck, lint with no-deprecated, 31 files / 603 tests, build, smoke SMOKE PASSED; no deprecation output with --trace-deprecation --pending-deprecation; 04-verify.txt). `npm run test:e2e` exit 0, both projects, 68 passed, 2 skipped (mobile-only on desktop; 05-e2e.txt). `npm run digest` exit 0: 01110f7500940d976a71c60a43e28168eed057a67f7af91bf5bdebf38654670b (611 files, handoff/ excluded; includes the uncommitted FIXA changes; 06-digest.txt).
- Screenshots: day-editor-display-zone-default-{desktop,mobile}-synthetic.png, day-editor-09-18-breaks-{desktop,mobile}-synthetic.png.
- Deviations: none beyond the owned paths. No server code, ORCHESTRATION.json, STATE.json, NEXT_ACTION or audit report touched; nothing staged or committed; no server or background process left running.
- Observed, not fixed (outside scope): when an existing session is edited and its input zone is changed, the pinned UTC offsets of the start and end fields are kept (draftFromSession), so the zone change is not a clean re-entry. Not reachable from the new default flow; the new e2e avoids it by adding a second session.

### Addendum (coordinator follow-up: zone change of a saved session)

- Defect (the observation above), reproduced first: editing a saved session and typing another input zone kept the offsets pinned in the old zone on the start, end and break fields, so the typed wall times were not re-read in the new zone. Rule: AGENTS rule 7, R-07 "show and use its selected input zone". The server contract can express the fix: a time sent without an offset or fold is resolved in the given zone, and an ambiguous or nonexistent time is answered with the existing 422 codes. No server change.
- Fix: `changeZone(draft, zone)` in sessionModel.ts keeps the typed dates and wall times (start, end, breaks) and drops their pinned offsets and folds; the same zone returns the draft unchanged, so an unchanged edit keeps the saved instants. SessionForm.tsx uses it for the input-zone field and clears an earlier time question (it named the old zone). A repeated or missing local time in the new zone is then asked about again through the existing prompt. Nothing is stored until Save changes.
- Red first: 08-red-zonechange-unit.txt (3 failed: changeZone missing) and 09-red-zonechange-e2e.txt (4 failed on both projects: the saved zone change and the ambiguous Sydney case; the unchanged-edit test passes both before and after, as a guard). Green: 10-green-zonechange.txt (34 unit tests; day-editor e2e 35 passed, 1 skipped).
- Tests: tests/client/sessionModel.test.ts "changing the input zone of a saved session" (offsets dropped and request carries none, same zone keeps instants, ambiguous and gap re-asked); tests/e2e/day-editor.spec.ts: a Los Angeles session with breaks switched to Europe/London stores the typed 09:00, 18:00 and break wall times in London with input_zone London; an unchanged edit keeps zone and instants; 02:30 on 2026-04-05 switched from Los Angeles to Sydney asks for the fold, saves nothing until chosen, then stores the chosen instant.
- Gates, rerun on the final source: `npm run verify` exit 0 (31 files, 606 tests, no deprecation output; 11-verify.txt). `npm run test:e2e` exit 0, both projects, 74 passed, 2 skipped (12-e2e.txt). `npm run digest` exit 0: 4c2bd7eff1079b4825de8791037aafa00b0c36939902c5121584114a0bee3528 (611 files, handoff/ excluded; 13-digest.txt). This supersedes the digest above; 04, 05 and 06 are the earlier runs, kept as history.
- Screenshots: day-editor-zone-change-{desktop,mobile}-synthetic.png.
- Deviations: none; owned paths only (SessionForm.tsx, sessionModel.ts, the two test files, this brief, the evidence folder). No server code touched, nothing staged or committed, no process left running.
