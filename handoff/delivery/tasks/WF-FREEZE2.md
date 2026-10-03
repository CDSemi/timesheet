# WF-FREEZE2 dispatch brief

- Mission/task: timesheet-software-readiness / WF-FREEZE2; board package GOV; kind commit;
  attempt 1; depends on WF-FIX1.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy), novelty no. Records in English.
- Authority: AGENTS.md rule 12, docs/08 "Commits and pushes", board `owner_decisions`.
- Branch: main (`git.release_declared` false). Expected HEAD = origin/main =
  fd77a8717da9a1b2ea9ce13520d59b9df60f4716; if either differs, stop and report.
- Purpose: freeze commit of WF-FIX1 plus the WF-FREEZE/WF-GATE/WF-AUDIT records so
  WF-GATE2 and WF-AUDIT2 run on a fixed SHA; push after the commit.

## Expected working-tree set

Modified: .claude/agents/timesheet-{auditor,committer,expert,light,planner,verifier,
worker,worker-high}.md; docs/08_AI_WORKFLOW_AND_BUDGET.md and .vi.md;
docs/10_DECISIONS_AND_SOURCES.md and .vi.md; handoff/prompts/RESUME.md and .vi.md;
handoff/delivery/validate_orchestration.py; handoff/delivery/check_recovery.py;
scripts/precommit-check.mjs; handoff/delivery/ORCHESTRATION.json;
handoff/delivery/STATE.json; handoff/NEXT_ACTION.md and .vi.md;
handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md;
handoff/delivery/tasks/{WF-FREEZE.md, WF-GATE.md, WF-AUDIT.md}.

New: handoff/delivery/WORKFLOW_REVIEW.md and .vi.md;
handoff/delivery/tasks/{WF-FIX1.md, WF-FREEZE2.md, WF-GATE2.md, WF-AUDIT2.md}; every
file under handoff/delivery/evidence/WF-FREEZE/, WF-GATE/, WF-AUDIT/ and WF-FIX1/.

Allowed but not staged: your own handoff/delivery/evidence/WF-FREEZE2/ files and the
results you append to this brief after the commit.

A listed path without changes is fine (record it). Any other changed or untracked path:
stop without committing and report it.

## Checks before committing

Profile checks with the Node 24 runtime (record `node --version`): `node
scripts/precommit-check.mjs`, `git diff --cached --check`, JSON parse of
ORCHESTRATION.json and STATE.json, `python handoff/delivery/validate_orchestration.py`,
and a read of the staged diff for personal data. If the precommit check blocks only on
concrete user-profile paths inside evidence logs, mask the account segment as `<user>`
in those lines, record each masked file, and rerun all checks. Any other block: do not
commit; report file, line and rule.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Fix workflow audit findings WF-A-01 to WF-A-10

- fix(workflow): single audit-strength rule, GOV governance scope, wider author detection, no max effort
- fix(workflow): precommit blocks unquoted secrets, unmarked media and real profile paths; allows the attribution address
- docs(workflow): governance paths, package-final snapshot, stale-context note, committer runtime
- chore(workflow): workflow audit report, gate/audit evidence, board, state and checkpoint

Task: WF-FREEZE2 (freeze of WF-FIX1 before WF-GATE2/WF-AUDIT2)

## Push and report

Push per profile. Append results here: pre/post HEAD, commit SHA, pushed, remote SHA,
staged count, masked files, check exits, blockers. Evidence in
handoff/delivery/evidence/WF-FREEZE2/. Return at most 200 words.

## Results

(Committer appends here.)

- Pre HEAD fd77a8717da9a1b2ea9ce13520d59b9df60f4716; post HEAD c219d79a2c202861b719473cdffb0efb59f14290 (pushed to origin/main).
- Staged 79 files, none masked. Node v24.21.0. Exits: precommit 0, diff --check 0, JSON parse 0, validate_orchestration 0. Blockers: none.
- Evidence: handoff/delivery/evidence/WF-FREEZE2/.
