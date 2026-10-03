# WP1-F01-GATE dispatch brief

- Mission/task: timesheet-software-readiness / WP1-F01-GATE; package WP1; kind gate;
  attempt 1; depends on WP1-F01-FREEZE. Package-final snapshot: separate gate required.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size S, risk M, novelty no. Records in English.
- Target: the WP1-F01-FREEZE commit (board `WP1-F01-FREEZE.commit_sha`). At start HEAD
  must equal it and nothing outside handoff/ may differ from it. Writable: this report and
  handoff/delivery/evidence/WP1-F01-GATE/ only. No source edits, no test repairs.
- Prompt: the required WP1 gate in [WP1_REVIEW](../../prompts/WP1_REVIEW.md) and
  docs/06; read AGENTS.md from disk first.

## Checks (record command | environment | exit | observed result | log path)

1. `npm run digest` (Node 24) before and after; record both, they must be equal. Compare
   with the worker's pre-commit digest
   c6e24381253c02ac74d1690b7b15aa7e6ac5b31bcd7ee8b8b8d19ca7d7d29c59 and explain any
   difference.
2. Clean-export verification outside Dropbox: `git archive` of the freeze commit into a
   scratch directory, `npm ci` there, then `npm run verify` (typecheck, lint, tests,
   builds, smoke). Use the Node 24 PATH recipe so nested npm uses Node 24; strip ANSI
   codes and mask paths in logs.
3. The remaining required WP1 gate commands named by WP1_REVIEW and docs/06 that
   `npm run verify` does not cover, with fresh migrated synthetic SQLite.
4. F-01 reproduction against the freeze commit: F-01A and F-01B as described in
   [WP1_REVIEW](../WP1_REVIEW.md), via the new regression tests and an independent
   API-level probe of your own (synthetic data). Expected: both now behave as the review
   requires.
5. `python handoff/delivery/validate_orchestration.py`; `git diff --check
   bfdc1a8bbfd0bcbd06511fd02212e111d300356d HEAD`; changed non-handoff paths since
   bfdc1a8 are exactly src/server/services/timesheetCommands.ts and
   tests/integration/clock-out-breaks.test.ts.

Delete scratch directories afterwards. Decision: PASS / FAIL / NOT VERIFIED; any unrun
required check is NOT VERIFIED. Return at most 250 words, beginning with your
self-reported model: decision, digest, HEAD, check exits, blockers.

## Results

Self-reported model: claude-sonnet-5-5. Decision: **PASS**.

- Target/HEAD: 68bbb31435543329b6c51f29703d9e2e7a4290bf (equals freeze commit). Environment: Node v24.21.0, npm 11.18.0 (portable Node 24 first on PATH). Uncommitted files at start were all under handoff/ (board, WP1-F01-FREEZE brief/evidence, workflow checkpoint edits); nothing outside handoff/. Logs: `handoff/delivery/evidence/WP1-F01-GATE/`.
- Source digest: c6e24381253c02ac74d1690b7b15aa7e6ac5b31bcd7ee8b8b8d19ca7d7d29c59 (533 files), before and after (twice) and equal to the worker's pre-commit digest; no difference.

| # | Command | Exit | Observed | Log |
|---|---|---|---|---|
| 1 | `npm run digest` before/after | 0/0/0 | identical, as above | digest-before/after/after2.txt |
| 2 | `git archive` freeze to scratch; `npm ci`; `npm run verify` | 0; 0; 0 | typecheck, lint, 11 files/180 tests, builds, smoke all pass | export.txt, npm-ci.txt, verify.txt |
| 3 | `npm run test:fixtures`; migrations + isolation tests (fresh migrated SQLite) | 0; 0 | 115/115 fixtures; 18/18 | fixtures.txt, migr-iso.txt |
| 4 | clock-out-breaks regression test file | 0 | 6/6 | regression.txt |
| 4 | own API probe (F-01A..D, synthetic) | 0 (run 2) | A: 200, R=541, credit 60, 1 break; B: 200, R=556, credit 90, 0 breaks; C replace by 11:00-11:30: R=526, credit 60; D invalid break: 422, rollback, session open, old break kept. 144180 oracle checks pass | probe.txt, probe-f01.mjs.txt |
| 5 | validate_orchestration.py | 0 | PASS | validate.txt |
| 5 | `git diff --check bfdc1a8 HEAD` | 0 | clean | diffcheck.txt |
| 5 | non-handoff paths since bfdc1a8 | n/a | exactly src/server/services/timesheetCommands.ts and tests/integration/clock-out-breaks.test.ts | paths.txt |

Note: probe run 1 exited 1 because my own F-01C expectation was wrong (excess 46 gives credit 60, not 30, per the 46 -> 60 rule); retained as probe-run1-expectation-error.txt, expectation corrected, rerun exit 0 on a fresh export. No source edits. Scratch dirs deleted.
