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

(Verifier appends here.)
