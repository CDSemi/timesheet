# WP2-CKPT1 dispatch brief

- Mission/task: timesheet-software-readiness / WP2-CKPT1; package WP2; kind commit;
  attempt 1; depends on WP2-T02-FREEZE.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, docs/08 "Commits and pushes" (checkpoint commit before a
  planned stop), board `owner_decisions`.
- Branch: main (`git.release_declared` false). Expected HEAD = origin/main =
  8930efee064ac84256b3f82b87005717a489d1b7; if either differs, stop and report.
- Purpose: records-only checkpoint commit before the pause for owner decisions; push.

## Expected working-tree set

Modified: handoff/delivery/ORCHESTRATION.json; handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md
and .vi.md; handoff/delivery/tasks/WP2-T02-FREEZE.md.

New: handoff/delivery/tasks/WP2-CKPT1.md; every file under
handoff/delivery/evidence/WP2-T02-FREEZE/.

Allowed but not staged: your own handoff/delivery/evidence/WP2-CKPT1/ files and the
results you append to this brief after the commit. Any other changed or untracked path:
stop without committing and report it.

## Checks before committing

Profile checks with the Node 24 runtime (record `node --version`): precommit check,
`git diff --cached --check`, JSON parse of ORCHESTRATION.json, orchestration validator,
staged-diff read for personal data. Any block other than maskable evidence profile
paths: do not commit; report file, line and rule.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Checkpoint WP2 before owner decisions E-2, E-3 and E-8

- chore(workflow): board and mission checkpoint; WP2-T03 blocked on owner decisions
- chore(workflow): WP2-T02 freeze evidence

Task: WP2-CKPT1

## Push and report

Push per profile. Append results here: pre/post HEAD, commit SHA, pushed, remote SHA,
staged count, check exits, blockers. Evidence in handoff/delivery/evidence/WP2-CKPT1/.
Return at most 150 words.

## Results

(Committer appends here.)

Attempt 1 (timesheet-committer, claude-sonnet-5-5): NOT committed. HEAD 8930efee before and after;
not pushed. 8 paths staged. Node v24.21.0; precommit exit 0; git diff --cached --check exit 0;
JSON parse exit 0; validate_orchestration.py exit 1: ValueError "Durable English brief/result
missing: WP2-T03" (validate_orchestration.py line 265). Blocker: board lists WP2-T03 but
handoff/delivery/tasks/WP2-T03.md does not exist. Evidence: handoff/delivery/evidence/WP2-CKPT1/.

Attempt 2 (timesheet-committer, claude-sonnet-5-5): committed and pushed. HEAD 8930efee -> f7b9f8e3f07b68e636da54ba589b286fa59561b8; remote main = f7b9f8e3; 8 paths staged. Node v24.21.0; precommit 0; diff --check 0; JSON parse 0; validator 0. Blockers: none. Evidence: handoff/delivery/evidence/WP2-CKPT1/ (a2-* files, commit-message.txt).
