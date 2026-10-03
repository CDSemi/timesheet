# WF-GATE dispatch brief

- Mission/task: timesheet-software-readiness / WF-GATE; board package WP1 (workflow
  revision v2); kind gate; depends on the freeze commit task (board `WF-FREEZE`).
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size M, risk M, novelty no. Records in English.
- Target: the freeze commit SHA recorded on the board (`WF-FREEZE.commit_sha`). At start
  HEAD must equal it and `git status --porcelain=v1 -uall` must show nothing outside
  handoff/ (record any coordinator files under handoff/ that changed afterwards).
- Writable: this report and handoff/delivery/evidence/WF-GATE/ only. No source edits,
  no test repairs, no commits.

## Checks (record command | environment | exit | observed result | log path)

1. `npm run digest` (Node 24) before and after all checks: 64-hex source digest; the
   two values must be equal.
2. `python handoff/delivery/validate_orchestration.py`: PASS.
3. `python handoff/delivery/check_recovery.py`: PASS with probe count.
4. `python handoff/delivery/validate_package.py --preflight` with the Python recorded in
   handoff/delivery/evidence/orchestration/run-validation.ps1 (system Python lacks IANA
   tzdata; record its stop point too).
5. `node scripts/precommit-check.mjs --self-test`: PASS. Then, in a scratch clone of the
   freeze SHA outside Dropbox (under the session scratch/temp drive; use the per-process
   `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=*` override,
   never global config), stage synthetic bad files one rule group at a time (`.env`,
   `signature.png`, fake PDF, private-key header line, literal password assignment,
   non-synthetic email) and expect exit 1; stage a clean doc edit and expect exit 0.
   Delete the scratch clone afterwards.
6. `npm run verify` (Node 24: typecheck, lint, tests, build, smoke) and
   `git diff --check ffbf8f0e1c4289ae4edc78ef9b5d3051f29384ed HEAD`: exit 0.
7. `git diff --stat 1a25275b7c87bcef1e9099d7adba8f2eb763d698 HEAD -- src tests package-lock.json`:
   empty.
8. Profile inventory: nine timesheet-* profiles; frontmatter matches the board
   `coordinator_decisions`; only timesheet-committer grants commit/push.

Node 24: `%LOCALAPPDATA%\timesheet-dev\node-24.21.0\node_modules\node\bin\node.exe`;
npm as `node.exe "%APPDATA%\npm\node_modules\npm\bin\npm-cli.js"`; in Git Bash prepend
`$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin` to PATH.
System Node 26 is refused (engine-strict). Strip ANSI codes and mask user paths in logs.

Decision: PASS / FAIL / NOT VERIFIED with reasons; any unrun check is NOT VERIFIED, not
PASS. Return at most 250 words: decision, digest, HEAD, each check's exit, blockers.

## Results

(Verifier appends here.)

Attempt 1 (verifier, claude-sonnet-5-5). HEAD fd77a8717da9a1b2ea9ce13520d59b9df60f4716;
non-handoff changes: none. Uncommitted under handoff/: ORCHESTRATION.json, tasks/WF-FREEZE.md,
evidence/WF-FREEZE/*. Logs in handoff/delivery/evidence/WF-GATE/ (ANSI stripped, paths masked).

| # | Check | Exit | Result |
|---|-------|------|--------|
| 1 | npm run digest before/after (Node 24.21.0) | 0/0 | 03d4a6f986c93423903ea94ded9f58a7ca127c64dc6bcca1342f38a8b24f491b both, 532 files |
| 2 | validate_orchestration.py | 0 | PASS |
| 3 | check_recovery.py | 0 | status PASS (see check-recovery.txt) |
| 4 | validate_package.py --preflight, workflow Python | 0 | PASS, 91 scenarios; system Python exit 1 at ZoneInfoNotFoundError America/Los_Angeles (preflight-system-python.txt) |
| 5 | precommit --self-test | 0 | 27 path, 24 line samples, 12 rules |
| 5 | scratch clone probes (probes.txt); clone deleted | - | .env, signature.png, fake PDF, private-key header, password literal, non-synthetic email each exit 1; clean README edit exit 0 |
| 6 | npm run verify (Node 24) | 0 | 174 tests passed, build and smoke passed; git diff --check ffbf8f0..HEAD exit 0 |
| 7 | git diff --stat 1a25275..HEAD -- src tests package-lock.json | 0 | empty |
| 8 | profile inventory | - | nine timesheet-* profiles; frontmatter matches coordinator_decisions (auditor/expert opus xhigh, verifier sonnet medium, coordinator inherit); only timesheet-committer mentions commit/push |

Note: a first probe round failed due to my own harness (git clean removed a subdirectory), was
discarded and rerun with top-level files; only the rerun is in probes.txt.
Decision: PASS.
