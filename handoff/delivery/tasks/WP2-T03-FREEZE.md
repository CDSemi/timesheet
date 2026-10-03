# WP2-T03-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP2-T03-FREEZE; package WP2; kind commit;
  attempt 1; depends on WP2-T03.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy), novelty no. Records in English.
- Authority: AGENTS.md rule 12, docs/08 "Commits and pushes", board `owner_decisions`.
- Branch: main (`git.release_declared` false). Expected HEAD = origin/main =
  30be0b152f9cbcf62c517257b76c52c2493b5ca6; if either differs, stop and report.
- Purpose: intermediate WP2 freeze of T03 (OT leave lifecycle); push after the commit.

## Expected working-tree set

New:
- src/server/services/otLeave.ts
- tests/integration/ot-leave.test.ts
- tests/integration/ot-leave-concurrency.test.ts
- tests/support/concurrency.ts
- handoff/delivery/tasks/WP2-T03-FREEZE.md
- handoff/delivery/tasks/WP2-T04.md
- every file under handoff/delivery/evidence/GOV-E8-ACCEPT/
- every file under handoff/delivery/evidence/WP2-T03/

Modified:
- src/domain/ledger.ts
- tests/domain/ledger.fixtures.test.ts
- handoff/delivery/ORCHESTRATION.json
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md
- handoff/delivery/tasks/GOV-E8-ACCEPT.md
- handoff/delivery/tasks/WP2-T03.md

Allowed but not staged: your own handoff/delivery/evidence/WP2-T03-FREEZE/ files, and the
results you append to this brief after the commit.

Any other changed or untracked path: stop without committing and report it.

## Checks before committing

Run the profile checks with the Node 24 runtime, and record `node --version`:
- precommit check;
- `git diff --cached --check`;
- JSON parse of ORCHESTRATION.json;
- orchestration validator;
- check_recovery.py;
- a staged-diff read for personal data, paying particular attention to the new tests and
  the concurrency harness.

Any block other than maskable evidence profile paths, including whitespace, means: do not
commit; report the file, line and rule.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add the OT leave lifecycle (WP2-T03)

- feat(ledger): record permission and reserve atomically; 409 on insufficient balance
- feat(ledger): explicit idempotent record use with partial use; cancel; linked reversal
- test(ledger): worker-thread concurrency harness on one WAL file; LG-03..LG-07, LG-10

Task: WP2-T03-FREEZE (intermediate freeze; package-final gate and audits follow T13)

## Push and report

Push per profile. Append results here: pre/post HEAD, commit SHA, pushed, remote SHA,
staged count, check exits, blockers. Evidence in handoff/delivery/evidence/WP2-T03-FREEZE/.
Return at most 150 words.

## Results

(Committer appends here.)
