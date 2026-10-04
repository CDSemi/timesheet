# WP2-GATE3 dispatch brief

- Mission/task: timesheet-software-readiness / WP2-GATE3; package WP2; kind gate;
  attempt 1; depends on WP2-FIXB2-FREEZE. This is the package-final gate after the second
  fix round.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size M, risk M, novelty no. Records in English.
- Read AGENTS.md from disk first. Then read [WP2-GATE](WP2-GATE.md) (steps 1–8 and the
  flow map), [WP2-GATE2](WP2-GATE2.md) and the WP2-FIXB2 result.
- Target: `freeze_commit` = the WP2-FIXB2-FREEZE commit, given at dispatch. Record HEAD,
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
