# WF-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WF-FREEZE; board package WP1 (workflow
  revision v2); kind commit; attempt 1; depends on WF-IMPL-TOOLING and WF-IMPL-DOCS.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy), novelty no. Records in English.
- Authority: AGENTS.md rule 12 and docs/08 "Commits and pushes"; owner decisions in
  the board `owner_decisions` (verbatim owner confirmation included).
- Branch: main (board `git.release_declared` false). Expected HEAD = origin/main =
  ffbf8f0e1c4289ae4edc78ef9b5d3051f29384ed. If either differs, stop and report.
- Purpose: freeze commit of revision v2 so WF-GATE and WF-AUDIT run on a fixed SHA;
  push after the commit.

## Expected working-tree set

Modified: .claude/agents/timesheet-{auditor,coordinator,expert,light,planner,verifier,
worker,worker-high}.md; AGENTS.md; AGENTS.vi.md; docs/08_AI_WORKFLOW_AND_BUDGET.md
and .vi.md; docs/10_DECISIONS_AND_SOURCES.md and .vi.md; handoff/NEXT_ACTION.md and
.vi.md; handoff/delivery/ORCHESTRATION.json; handoff/delivery/STATE.json;
handoff/delivery/validate_orchestration.py; handoff/delivery/validate_package.py;
handoff/prompts/{ORCHESTRATE,RESUME,FIX_FINDINGS}.md and .vi.md;
handoff/templates/{TASK,CHECKPOINT,HANDOFF,REVIEW}.md and .vi.md; package.json.

New: .claude/agents/timesheet-committer.md; handoff/delivery/check_recovery.py;
scripts/precommit-check.mjs; handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and
.vi.md; handoff/delivery/tasks/{WF-REVIEW.md, WF-REVIEW.vi.md, WF-IMPL-TOOLING.md,
WF-IMPL-DOCS.md, WF-GATE.md, WF-AUDIT.md, WF-FREEZE.md}; every file under
handoff/delivery/evidence/WF-IMPL-TOOLING/ and handoff/delivery/evidence/WF-IMPL-DOCS/.

Remove: handoff/delivery/ORCHESTRATION.previous.json (`git rm`; retired by decision).

Allowed but not staged: your own handoff/delivery/evidence/WF-FREEZE/ files and your
results appended to this brief after the commit (they go into the next commit).

A listed path that shows no change is fine (record it). Any other changed or untracked
path: stop without committing and report it.

## Checks before committing

Run the profile's checks: `node scripts/precommit-check.mjs` (Node 24), `git diff
--cached --check`, JSON parse of ORCHESTRATION.json, STATE.json and package.json,
`python handoff/delivery/validate_orchestration.py` (board staged), and read the staged
diff for personal data (evidence logs and docs especially). If the precommit check
blocks, even on synthetic test evidence, do not commit; report file, line and rule.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Revise orchestration workflow: adaptive routing and committer role

- feat(workflow): add timesheet-committer profile and precommit privacy check
- feat(workflow): validate per-dispatch model overrides, audit strength and commit tasks
- docs(workflow): model/effort rubric, commit/push policy, English-only task records
- chore(workflow): board, state, entry prompt and checkpoint for revision v2
- chore(workflow): retire ORCHESTRATION.previous.json

Task: WF-FREEZE (freeze of WF-IMPL-TOOLING and WF-IMPL-DOCS before WF-GATE/WF-AUDIT)

## Push and report

Push per profile (fetch, dry run, push origin main). Append results here: pre/post HEAD,
commit SHA, pushed, remote SHA, staged list, check exits, blockers. Evidence in
handoff/delivery/evidence/WF-FREEZE/. Return at most 200 words.

## Results

(Committer appends here.)
