# WP2-T01-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP2-T01-FREEZE; package WP2; kind commit;
  attempt 1; depends on WP2-T01.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy), novelty no. Records in English.
- Authority: AGENTS.md rule 12, docs/08 "Commits and pushes", board `owner_decisions`.
- Branch: main (`git.release_declared` false). Expected HEAD = origin/main =
  f32978fcc7dec9429f0aa544c4ee4ee26c14f798; if either differs, stop and report.
- Purpose: intermediate WP2 freeze of T01 (no gate per task; the package-final gate and
  audits run after T13); push after the commit.

## Expected working-tree set

Modified: src/server/services/timesheetCommands.ts; src/server/http/schemas.ts;
src/client/TimesheetScreen.tsx; src/client/api.ts;
tests/integration/clock-out-breaks.test.ts; tests/integration/timesheet-api.test.ts;
tests/integration/isolation.test.ts; tests/integration/auth.test.ts;
handoff/delivery/ORCHESTRATION.json; handoff/delivery/STATE.json;
handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md;
handoff/delivery/tasks/WP1-F01-ACCEPT.md.

New: tests/integration/break-contract.test.ts; handoff/delivery/tasks/{WP2-PLAN.md,
WP2-T01.md, WP2-T01-FREEZE.md, WP2-T02.md}; every file under
handoff/delivery/evidence/WP2-PLAN/, WP2-T01/ and WP1-F01-ACCEPT/.

Allowed but not staged: your own handoff/delivery/evidence/WP2-T01-FREEZE/ files and the
results you append to this brief after the commit. Any other changed or untracked path:
stop without committing and report it.

## Checks before committing

Profile checks with the Node 24 runtime (record `node --version`): precommit check,
`git diff --cached --check`, JSON parse of ORCHESTRATION.json and STATE.json,
orchestration validator, staged-diff read for personal data (new tests especially).
Maskable profile paths in evidence logs: mask, record, rerun. Any other block, including
whitespace: do not commit; report file, line and rule.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Harden the Clock out contract (WP2-T01)

- feat(timesheet): Clock out requires expected_version; a present break list replaces saved rows
- feat(timesheet): reject breaks ending after now + 5 minutes on open sessions; typed legacy-row outcome
- test(timesheet): break-contract, rollback-after-delete and zero-row regressions; version in Clock out bodies
- docs(workflow): WP2 package plan and task records

Task: WP2-T01-FREEZE (intermediate freeze; package-final gate and audits follow T13)

## Push and report

Push per profile. Append results here: pre/post HEAD, commit SHA, pushed, remote SHA,
staged count, masked files, check exits, blockers. Evidence in
handoff/delivery/evidence/WP2-T01-FREEZE/. Return at most 200 words.

## Results

(Committer appends here.)
