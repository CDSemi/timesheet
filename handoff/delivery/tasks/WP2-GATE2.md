# WP2-GATE2 dispatch brief

- Mission/task: timesheet-software-readiness / WP2-GATE2; package WP2; kind gate;
  attempt 1; depends on WP2-FIX-FREEZE. This is the package-final gate after the
  audit-fix round.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size M, risk M, novelty no. Records in English.
- Read AGENTS.md from disk first. Then read:
  - [WP2-GATE](WP2-GATE.md), for the steps, the flow map and the attempt-1 result;
  - the WP2-FIXA and WP2-FIXB results.
- Target: `freeze_commit` = f79413b77e7f745e1eff383f1ad748e7667533da, the WP2-FIX-FREEZE
  commit. Record HEAD, origin/main and the source digest before and after.
  - WP2-FIXB claimed 4c2bd7eff1079b4825de8791037aafa00b0c36939902c5121584114a0bee3528 for
    the uncommitted tree. Your digest is the identity of record.
  - For the preflight, use the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
    The system Python has no tzdata.
- Do not edit source, commit or push.

## Steps

- Repeat WP2-GATE steps 1–8 exactly, with the same environment rules:
  - a clean `git archive` export outside Dropbox, on a drive with free space;
  - Node 24 by full path;
  - the Edge channel, with no download;
  - privacy hygiene;
  - never touch B:\Temp\claude;
  - delete your export afterwards.
- Additionally:
  - confirm that the new regression tests from WP2-FIXA (holiday preview privacy) and
    WP2-FIXB (display-zone default, computed styles) are present and pass;
  - add the insufficient-balance flow screenshot, which closes gate finding F1 if the
    spec now produces one; otherwise note it as covered by the WP2-AUDIT-B evidence.
- Name the screenshots `*-synthetic.png`, in handoff/delivery/evidence/WP2-GATE2/.

## Verdict

PASS only if every step passes; otherwise FAIL or NOT VERIFIED, with the step and the
evidence.

Append the results here. Evidence goes in handoff/delivery/evidence/WP2-GATE2/ (masked,
LF, free of trailing whitespace, single final newline).

Return at most 220 words, beginning with your self-reported model:
- freeze commit and digest;
- each step's exit and counts;
- the regression tests found;
- the verdict.

## Results

(Verifier appends here.)

### Verifier result (attempt 1)

Self-reported model: claude-sonnet-5-5. Evidence: `handoff/delivery/evidence/WP2-GATE2/`.

- Freeze: HEAD = origin/main = f79413b77e7f745e1eff383f1ad748e7667533da before and after. Source digest before and
  after: 4c2bd7eff1079b4825de8791037aafa00b0c36939902c5121584114a0bee3528 (611 files); the `git ls-tree` cross-check
  gives the same value (`digest-lstree.txt`). No working-tree change outside handoff/. The digest equals the
  WP2-FIXB claim and is the identity of record.
- Environment: `git archive` export in the C: user temp; Node v24.21.0 portable by full path; Edge channel, no
  download; TEMP/TMP on C:. Nothing deleted except my own export, WP1 clone and temp databases. No process left
  running (a hung `cmd.exe /c where npm` I started was killed).
- Step 1: `npm ci` exit 0; `NODE_OPTIONS=--trace-deprecation --pending-deprecation npm run verify` exit 0,
  0 matches for "deprecat", 31 files / 606 tests, smoke PASSED.
- Step 2: `npm test -- --reporter=verbose` exit 0, 31 files / 606 tests, 0 failures (`vitest-per-file.txt`).
  LG-01..LG-10 each present and passing (LG-09 zero-delta present); DF-01..DF-16 each present and passing.
- Step 3: `ot-leave-concurrency.test.ts` run 20 times, every run exit 0 with 8/8 passed (`concurrency.txt`).
- Step 4: fresh DB applied [1,2,3]; WP1 DB (f32978f code: seed, login, one manual session with 3 breaks) upgraded
  with [2,3]; every WP1 table row count unchanged, integrity_check ok, foreign_key_check 0 rows (`migrations.txt`).
- Step 5: `npm run test:e2e` exit 0, 74 passed (36 desktop, 38 mobile), 2 skipped (mobile-only tests on desktop).
  All twelve flows pass on both projects with the same specs and test names as WP2-GATE (flow map unchanged).
- Step 6: 12 desktop screenshots plus `evidence-export-synthetic.csv.txt`; 0 email addresses in the CSV.
- Step 7: digest and ls-tree as above.
- Step 8: validate_orchestration exit 0 (PASS), check_recovery exit 0 (PASS), preflight exit 0 (PASS), with the
  workflow Python (`C:\Users\<user>\.cache\codex-runtimes\...`).
- Regression tests (`regression-tests.txt`), all passing:
  - WP2-FIXA: holiday-import.test.ts "answers identically whether or not employees have day entries on the affected
    dates (WP2-A-01)" and "reports a finalized period as a date-only signal ... without counts".
  - WP2-FIXB: sessionModel.test.ts (display-zone finish, `inputZoneChoices`, changing the input zone of a saved
    session); day-editor.spec.ts "manual entry defaults its input zone to the display zone ..." (screenshot
    `day-editor-display-zone-default-desktop-synthetic.png`), "changing the input zone of a saved session ...", and
    the DST re-ask test, both projects.
  - The computed-style probe of WP2-B-02 was a temporary spec (kept as `.txt` by the author), so no committed test
    exists for it; not re-run by this gate.
- F1: the insufficient-balance spec still writes no screenshot (test passes, desktop and mobile); covered by the
  WP2-AUDIT-B evidence; finding F1 stays an evidence-only note.

Verdict: PASS (steps 1-8 pass; F1 note carried).
