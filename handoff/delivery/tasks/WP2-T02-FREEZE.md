# WP2-T02-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP2-T02-FREEZE; package WP2; kind commit;
  attempt 1; depends on WP2-T02.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy), novelty no. Records in English.
- Authority: AGENTS.md rule 12, docs/08 "Commits and pushes", board `owner_decisions`.
- Branch: main (`git.release_declared` false). Expected HEAD = origin/main =
  396b399b2d58ccc7ea90dc78be9e7c2f9a832be2; if either differs, stop and report.
- Purpose: intermediate WP2 freeze of T02 (OT ledger core); push after the commit.

## Expected working-tree set

New: src/server/db/migrations/0002_ot_ledger.ts; src/domain/ledger.ts;
src/server/services/ledger.ts; tests/domain/ledger.fixtures.test.ts;
tests/integration/ledger.test.ts; handoff/delivery/tasks/WP2-T02-FREEZE.md; every file
under handoff/delivery/evidence/WP2-T01-FREEZE/ and WP2-T02/.

Modified: src/server/db/migrations.ts; src/domain/index.ts;
tests/integration/migrations.test.ts; tests/support/fixtures.ts;
tests/integration/timesheet-api.test.ts; handoff/delivery/ORCHESTRATION.json;
handoff/delivery/tasks/{WP2-T01-FREEZE.md, WP2-T02.md}.

Allowed but not staged: your own handoff/delivery/evidence/WP2-T02-FREEZE/ files and the
results you append to this brief after the commit. Any other changed or untracked path:
stop without committing and report it.

## Checks before committing

Profile checks with the Node 24 runtime (record `node --version`): precommit check,
`git diff --cached --check`, JSON parse of ORCHESTRATION.json, orchestration validator,
staged-diff read for personal data (new tests and fixtures especially). Maskable profile
paths in evidence logs: mask, record, rerun. Any other block, including whitespace: do
not commit; report file, line and rule.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add the OT ledger core (WP2-T02)

- feat(ledger): migration 0002 with append-only ot_ledger and versioned ot_leave_requests
- feat(ledger): pure balance and correction functions; idempotent internal posting services
- test(ledger): LG-01/02/08/09 on real SQLite, triggers, WP1 upgrade migration

Task: WP2-T02-FREEZE (intermediate freeze; package-final gate and audits follow T13)

## Push and report

Push per profile. Append results here: pre/post HEAD, commit SHA, pushed, remote SHA,
staged count, masked files, check exits, blockers. Evidence in
handoff/delivery/evidence/WP2-T02-FREEZE/. Return at most 200 words.

## Results

(Committer appends here.)
