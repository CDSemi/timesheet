# WP2-T06-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP2-T06-FREEZE; package WP2; kind commit;
  attempt 1; depends on WP2-T06.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  a8a5890a75361c44ff7730d54bbaadab56c40f3a. If either differs, stop and report.
- Purpose: an intermediate WP2 freeze of T06 (the personal policy preview). It also
  carries the WP2-T05 reconciliation records and the T07 brief. Push after the commit.

## Expected working-tree set

New:
- tests/integration/policy-preview.test.ts.
- handoff/delivery/tasks/: WP2-T05-RECON2.md, WP2-T06-FREEZE.md and WP2-T07.md.
- Every file under handoff/delivery/evidence/WP2-T05-RECON2/ and WP2-T06/.

Modified:
- src/server/services/policies.ts, src/server/services/timesheets.ts and
  src/server/routes/api.ts.
- tests/integration/ot-api.test.ts (one allowlist line).
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/WP2-T06.md.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP2-T06-FREEZE/;
- the results you append to this brief after the commit.

Any other changed or untracked path: stop without committing and report it.

## Checks before committing

Run one command per check with Node 24 and record each exit code:
- `node --version`;
- the precommit check;
- `git diff --cached --check`;
- JSON parse of ORCHESTRATION.json;
- the orchestration validator;
- check_recovery.py;
- a read of the staged diff for personal data.

If a check fails, do not commit. Report the file, line and rule. The one exception is a
profile path in evidence, which you may mask.

If any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it; report the denial.

Keep your evidence LF, free of trailing whitespace and ending in a single final newline.
Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add the personal policy preview from the single engine (WP2-T06)

- feat(api): POST /api/policies/preview; same body and validation as creation, writes
  nothing
- refactor(timesheets): calculateDay hook extracted from buildDayView, unchanged
- test(api): preview equals post-creation day views; no writes; refusals match creation;
  isolation
- chore(handoff): WP2-T05 reconciliation records, T07 brief, board and checkpoint

Task: WP2-T06-FREEZE (intermediate freeze; package-final gate and audits follow)

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- staged count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP2-T06-FREEZE/. Return at most 150 words.

## Results

- Pre-HEAD a8a5890a75361c44ff7730d54bbaadab56c40f3a; post-HEAD and commit
  197053699d9b5c125fa0c3e8ccb8acf0f421011f; pushed to origin main; remote SHA equal.
- Staged count 17. Node v24.21.0.
- Check exits: precommit 0, diff --cached --check 0, JSON parse 0, validator 0,
  check_recovery 0, personal-data read clean.
- Blockers: none. Evidence: handoff/delivery/evidence/WP2-T06-FREEZE/.
