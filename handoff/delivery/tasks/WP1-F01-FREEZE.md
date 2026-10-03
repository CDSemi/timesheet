# WP1-F01-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP1-F01-FREEZE; package WP1; kind commit;
  attempt 1; depends on WP1-F01-FIX.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy), novelty no. Records in English.
- Authority: AGENTS.md rule 12, docs/08 "Commits and pushes", board `owner_decisions`.
- Branch: main (`git.release_declared` false). Expected HEAD = origin/main =
  bfdc1a8bbfd0bcbd06511fd02212e111d300356d; if either differs, stop and report.
- Purpose: freeze commit of the F-01 fix so the separate WP1 gate and the fresh recheck
  audit run on a fixed SHA; push after the commit.

## Expected working-tree set

Modified: src/server/services/timesheetCommands.ts; handoff/delivery/WP1_HANDOFF.md and
.vi.md; handoff/delivery/ORCHESTRATION.json; handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md
and .vi.md; handoff/delivery/tasks/{WF-ACCEPT.md, WP1-F01-FIX.md}.

New: tests/integration/clock-out-breaks.test.ts; handoff/delivery/tasks/{WP1-F01-FREEZE.md,
WP1-F01-GATE.md, WP1-F01-AUDIT.md}; every file under handoff/delivery/evidence/WP1-F01-FIX/
and handoff/delivery/evidence/WF-ACCEPT/.

Allowed but not staged: your own handoff/delivery/evidence/WP1-F01-FREEZE/ files and the
results you append to this brief after the commit. Any other changed or untracked path:
stop without committing and report it.

## Checks before committing

Profile checks with the Node 24 runtime (record `node --version`): precommit check,
`git diff --cached --check`, JSON parse of ORCHESTRATION.json, orchestration validator,
staged-diff read for personal data (the new test file and evidence especially). Any
block other than maskable profile paths in evidence logs: do not commit; report file,
line and rule.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Fix F-01: Clock out replaces the saved break set when confirmed

- fix(timesheet): confirmed Clock out replaces saved breaks inside the IMMEDIATE transaction
- test(timesheet): F-01A/F-01B, replace-not-append, audit and rollback regressions
- docs(handoff): WP1 handoff fix section (EN/VI)
- chore(workflow): board, checkpoint and governance accept evidence

Task: WP1-F01-FREEZE (freeze of WP1-F01-FIX before WP1-F01-GATE/WP1-F01-AUDIT)

## Push and report

Push per profile. Append results here: pre/post HEAD, commit SHA, pushed, remote SHA,
staged count, masked files, check exits, blockers. Evidence in
handoff/delivery/evidence/WP1-F01-FREEZE/. Return at most 200 words.

## Results

(Committer appends here.)

Attempt 1 stopped, no commit. HEAD unchanged bfdc1a8. precommit PASS (exit 0), node v24.21.0, JSON ok, validator ok. BLOCK: git diff --cached --check exit 2: new blank line at EOF in handoff/delivery/evidence/WP1-F01-FIX/green-after-fix.txt:11 and red-before-fix.txt:156 (whitespace rule; not maskable). 21 paths remain staged.

Attempt 2: committed 68bbb31435543329b6c51f29703d9e2e7a4290bf and pushed to origin/main (remote SHA equal). Pre HEAD bfdc1a8, 21 staged paths. Node v24.21.0; precommit 0, diff --check 0, JSON 0, validator 0. No masking, no blockers. Evidence: evidence/WP1-F01-FREEZE/*-2.txt, commit-message.txt.
