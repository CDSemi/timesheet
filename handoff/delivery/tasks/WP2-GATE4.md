# WP2-GATE4 dispatch brief

- Mission/task: timesheet-software-readiness / WP2-GATE4; package WP2; kind gate;
  attempt 1; depends on WP2-FIXB3-FREEZE. This is the package-final gate after the third
  fix round (CSS tokens and a test-helper fix only).
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size M, risk M, novelty no. Records in English.
- Read AGENTS.md from disk first. Then read [WP2-GATE](WP2-GATE.md) (steps 1–8 and the
  flow map), [WP2-GATE3](WP2-GATE3.md) and the WP2-FIXB3 result.
- Target: `freeze_commit` = 5fafeaee72509c6110a907458643bf7582dad81a (WP2-FIXB3-FREEZE). The worker claim for the tree was e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df. Record HEAD,
  origin/main and the source digest before and after. Your digest is the identity of
  record.
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
- Additionally:
  - confirm that the diff against a3d1b6555c352afa68b3d61ddc67f0c596742698 touches only
    src/client/styles.css, tests/client/zoneOracle.ts and
    tests/client/zoneOracle.test.ts outside handoff/;
  - confirm that the earlier fix regressions still pass.
- Screenshots `*-synthetic.png` and the CSV sample go in
  handoff/delivery/evidence/WP2-GATE4/.

## Verdict

PASS only if every step passes; otherwise FAIL or NOT VERIFIED, with the step and the
evidence.

Append the results here. Evidence goes in handoff/delivery/evidence/WP2-GATE4/ (masked,
LF, free of trailing whitespace, single final newline).

Return at most 200 words, beginning with your self-reported model:
- freeze commit and digest;
- each step's exit and counts;
- the diff scope;
- the verdict.

## Results

(Verifier appends here.)

### Verifier result (attempt 1)

Self-reported model: claude-sonnet-5-5. Evidence: `handoff/delivery/evidence/WP2-GATE4/` (`00-commands.txt`).

- Freeze: HEAD = origin/main = 5fafeaee72509c6110a907458643bf7582dad81a before and after. Source digest before
  and after: e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df (613 files); the `git ls-tree`
  cross-check gives the same value. Equals the worker claim. Working-tree changes were under handoff/ only.
- Environment: `git archive` export on C: (TEMP/TMP on C:); Node v24.21.0 by full path; Edge channel, no download;
  B:\Temp\claude and the repository root untouched; export, WP1 export and temp databases deleted afterwards.
- Step 1: `npm ci` exit 0; `verify` with --trace-deprecation --pending-deprecation exit 0, 0 deprecation lines.
- Step 2: `npm test -- --reporter=verbose` exit 0, 32 files / 613 tests, 0 failures. LG-01..LG-10 and
  DF-01..DF-16 each present and passing (`lg-df.txt`, `vitest-per-file-counts.txt`).
- Step 3: ot-leave-concurrency run 20 times, every run exit 0, 8/8 passed.
- Step 4: fresh DB applied [1,2,3]; WP1 DB (f32978f: seed, login, Clock in) upgraded with [2,3]; WP1 row counts
  unchanged, integrity_check ok, foreign_key_check 0 rows.
- Step 5: `npm run test:e2e` exit 0, 74 passed, 2 skipped (mobile-only on desktop). All twelve flows pass on
  both projects with the same spec and test names as WP2-GATE3 (`flowmap.txt`).
- Step 6: 25 desktop `*-synthetic.png` plus `evidence-export-synthetic.csv.txt`; 0 "@" in the CSV.
- Step 7: digest and ls-tree as above.
- Step 8 (workflow Python, `C:\Users\<user>\.cache\codex-runtimes\...`): validate_orchestration exit 0 (PASS),
  check_recovery exit 0 (PASS), preflight exit 0 (PASS); run in the export.
- Diff vs a3d1b6555c352afa68b3d61ddc67f0c596742698 outside handoff/: only src/client/styles.css,
  tests/client/zoneOracle.test.ts, tests/client/zoneOracle.ts (`diff-scope.txt`).
- Earlier fix regressions pass (`regr.txt`): zoneOracle tests (5 listed, including the fold refusal), R-07 e2e,
  DST fold, zone-change and DST gap e2e on both projects, payroll-exception differential test, holiday-import
  WP2-A-01 and date-only signal, sessionModel display-zone and input-zone tests.
- F1 carried: the insufficient-balance spec writes no screenshot (test passes both projects).

Verdict: PASS (steps 1-8 pass; F1 evidence-only note carried).
