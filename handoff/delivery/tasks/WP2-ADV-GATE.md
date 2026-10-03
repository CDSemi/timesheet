# WP2-ADV-GATE dispatch brief

- Mission/task: timesheet-software-readiness / WP2-ADV-GATE; package WP2; kind gate;
  attempt 1; depends on WP2-T04-FREEZE. Advisory (non-accepting). This is the first
  clean-export check of WP2 code (T01–T04).
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size M, risk M, novelty no. Records in English.
- Target: commit e92add0b4c26e203dc5b06841f5a3f5a6bf9eb96 (board
  `WP2-T04-FREEZE.commit_sha`). HEAD must equal it, and nothing outside handoff/ may
  differ. Writable: this report and handoff/delivery/evidence/WP2-ADV-GATE/ only. No
  source edits.

## Checks (record command | environment | exit | observed result | log path)

1. `npm run digest` (Node 24) before and after; the two digests must be equal.
2. Clean export outside Dropbox: `git archive` the commit into a scratch directory, then
   run `npm ci` and `npm run verify` there with Node 24 first on PATH. Use the
   per-process safe.directory override if git refuses the scratch drive.
3. In the export, run `npm run test:fixtures` and the migration and isolation tests.
4. In the export, run the concurrency file
   `npx vitest run tests/integration/ot-leave-concurrency.test.ts` 5 times in a row.
   Record each run's exit code and the per-race round results.
5. `python handoff/delivery/validate_orchestration.py` and
   `python handoff/delivery/check_recovery.py`, both with the workflow Python.
6. List the non-handoff paths changed in `f32978fcc7dec9429f0aa544c4ee4ee26c14f798..HEAD`
   (the WP2 source scope so far).

Delete scratch directories afterwards. Logs must be masked and LF. Decision: PASS / FAIL
/ NOT VERIFIED. Return at most 200 words, beginning with your self-reported model:
decision, digest, check exits, concurrency stability, blockers.

## Results

(Verifier appends here.)

### Attempt 1 (verifier, claude-sonnet-5-5) - advisory, non-accepting

Target e92add0b4c26e203dc5b06841f5a3f5a6bf9eb96; HEAD equal. `git status -uall` showed only
handoff/ paths (ORCHESTRATION.json, WP2-T04-FREEZE.md, WP2-T04-FREEZE evidence, ADV briefs).
Node v24.21.0 first on PATH (note: bash first attempt used a bad PATH and ran Node 26; discarded
and redone; nested npm run through `node <npm-cli.js>` because the npm.cmd shim picks Node 26).
Logs: handoff/delivery/evidence/WP2-ADV-GATE/ (masked, LF).

| # | Check | Exit | Observed | Log |
|---|-------|------|----------|-----|
| 1 | npm run digest before / after | 0 / 0 | both 491312dd38382198bc4fae1fcb3352ab349c25e6ada187a46de819031913d945 (550 files); HEAD and status unchanged | digest-before/after.txt |
| 2 | clean export (git archive, B:\Temp) npm ci | 0 | 0 vulnerabilities | npm-ci.txt |
| 2 | npm run verify (typecheck, lint, test, build, smoke) | 0 | 19 files / 335 tests passed; SMOKE PASSED | verify.txt |
| 3 | npm run test:fixtures | 0 | 5 files / 139 tests | fixtures.txt |
| 3 | migrations + isolation tests | 0 | 2 files / 23 tests | migration-isolation.txt |
| 4 | ot-leave-concurrency x5 | 0,0,0,0,0 | 8/8 tests each; every race overlapping windows 20/20 (25/25 for LG-07); outcomes always one winner, expected shape; cancel-vs-use split varied across runs (use wins 11,9,19,5,16 of 20), invariants held | concurrency-1..5.txt |
| 5 | validate_orchestration.py | 0 | ok | validate-orchestration.txt |
| 5 | check_recovery.py | 0 | ok | check-recovery.txt |
| 6 | non-handoff paths changed since f32978f | n/a | 44 paths (docs, reference/fixtures, src/client, src/domain, src/server, tests) | changed-paths.txt |

Scratch dir deleted. Decision: PASS (advisory). Blockers: none.
