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
