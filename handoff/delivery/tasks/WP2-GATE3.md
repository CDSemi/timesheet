# WP2-GATE3 dispatch brief

- Mission/task: timesheet-software-readiness / WP2-GATE3; package WP2; kind gate;
  attempt 1; depends on WP2-FIXB2-FREEZE. This is the package-final gate after the second
  fix round.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size M, risk M, novelty no. Records in English.
- Read AGENTS.md from disk first. Then read [WP2-GATE](WP2-GATE.md) (steps 1–8 and the
  flow map), [WP2-GATE2](WP2-GATE2.md) and the WP2-FIXB2 result.
- Target: `freeze_commit` = a3d1b6555c352afa68b3d61ddc67f0c596742698 (WP2-FIXB2-FREEZE). Record HEAD,
  origin/main and the source digest before and after. The worker's digest claim for the
  uncommitted tree was
  5b370621e7d3b9f292e8facebb1f0f6e9307a40cbda3a9f87b7dd61924298581. Your digest is the
  identity of record.
- Do not edit source, commit or push.

## Steps

- Repeat WP2-GATE steps 1–8 exactly, with the same environment rules:
  - a clean `git archive` export outside Dropbox, on C:;
  - Node 24 by full path;
  - the Edge channel, with no download;
  - privacy hygiene;
  - never touch B:\Temp\claude, and never write into the repository root;
  - delete your export afterwards.
  The preflight uses the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
- Additionally confirm that the WP2-FIXB2 regression tests are present and pass:
  - tests/client/zoneOracle.test.ts;
  - the R-07 e2e in tests/e2e/day-editor.spec.ts;
  - the payroll-exception differential test.
  Also confirm the earlier FIXA and FIXB regressions.
- Screenshots `*-synthetic.png` and the CSV sample go in
  handoff/delivery/evidence/WP2-GATE3/.

## Verdict

PASS only if every step passes; otherwise FAIL or NOT VERIFIED, with the step and the
evidence.

Append the results here. Evidence goes in handoff/delivery/evidence/WP2-GATE3/ (masked,
LF, free of trailing whitespace, single final newline).

Return at most 220 words, beginning with your self-reported model:
- freeze commit and digest;
- each step's exit and counts;
- the regression tests found;
- the verdict.

## Results

(Verifier appends here.)

### Verifier result (attempt 1)

Self-reported model: claude-sonnet-5-5. Evidence: `handoff/delivery/evidence/WP2-GATE3/` (`00-commands.txt`).

- Freeze: HEAD = origin/main = a3d1b6555c352afa68b3d61ddc67f0c596742698 before and after. Source digest before
  and after: 5b370621e7d3b9f292e8facebb1f0f6e9307a40cbda3a9f87b7dd61924298581 (613 files); the `git ls-tree`
  cross-check gives the same value. Working-tree changes were under handoff/ only. Equals the worker claim.
- Environment: `git archive` export on C: (TEMP/TMP on C:); Node v24.21.0 by full path; Edge channel, no download;
  nothing deleted except my own export, WP1 clone and temp databases; B:\Temp\claude untouched.
- Step 1: `npm ci` exit 0; `verify` with --trace-deprecation --pending-deprecation exit 0, 0 deprecation lines,
  32 files / 611 tests, smoke passed.
- Step 2: `npm test -- --reporter=verbose` exit 0, 32 files / 611 tests, 0 failures. LG-01..LG-10 and DF-01..DF-16
  each present and passing (LG-09 zero-delta present).
- Step 3: ot-leave-concurrency run 20 times, every run exit 0, 8/8 passed.
- Step 4: fresh DB applied [1,2,3]; WP1 DB (f32978f: seed, login, Clock in) upgraded with [2,3]; row counts of
  all WP1 tables unchanged, integrity_check ok, foreign_key_check 0 rows.
- Step 5: `npm run test:e2e` exit 0, 74 passed, 2 skipped (mobile-only tests on desktop); desktop 36, mobile 38.
  All twelve flows pass on both projects with the same spec and test names as WP2-GATE (`flowmap.txt`).
- Step 6: 25 desktop `*-synthetic.png` plus `evidence-export-synthetic.csv.txt`; 0 "@" in the CSV.
- Step 7: digest and ls-tree as above.
- Step 8 (workflow Python under C:\Users\<user>\.cache\codex-runtimes\...): validate_orchestration exit 0 (PASS),
  check_recovery exit 0 (PASS), preflight exit 0 (PASS); run in the export, so the committed board.
- FIXB2 regressions present and passing: tests/client/zoneOracle.test.ts (4 tests); the R-07 e2e "manual entry
  defaults its input zone to the display zone ... (R-07)" in day-editor.spec.ts (desktop and mobile); payroll-
  exceptions.test.ts "answers the same success body whether or not employees have timesheets in the period
  (WP2-A2-02)".
- FIXA/FIXB regressions passing: holiday-import.test.ts WP2-A-01 and "date-only signal"; sessionModel.test.ts
  display-zone finish and `input zone choices`; day-editor.spec zone-change, DST fold, DST re-ask and DST gap
  tests, both projects (`e2e-regr.txt`).
- F1 carried: the insufficient-balance spec writes no screenshot (test passes both projects).
- Note: one `curl -o /dev/null` was used in the WP1 population step (Git Bash, no file created).

Verdict: PASS (steps 1-8 pass; F1 evidence-only note carried).
