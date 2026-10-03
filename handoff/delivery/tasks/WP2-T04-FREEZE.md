# WP2-T04-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP2-T04-FREEZE; package WP2; kind commit;
  attempt 1; depends on WP2-T04.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy), novelty no. Records in English.
- Authority: AGENTS.md rule 12, docs/08 "Commits and pushes", board `owner_decisions`.
- Branch: main (`git.release_declared` false). Expected HEAD = origin/main =
  67c7e7a6e10779163647f88b84ebd91fcea390d6; if either differs, stop and report.
- Purpose: intermediate WP2 freeze of T04 (OT, leave, history and evidence-export API).
  The advisory ledger gate and audit run on this SHA. Push after the commit.

## Expected working-tree set

New:
- src/server/routes/ot.ts and src/server/routes/history.ts.
- src/server/services/otEvidence.ts and src/server/services/history.ts.
- tests/integration/ot-api.test.ts, tests/integration/evidence-export.test.ts and
  tests/integration/history.test.ts.
- handoff/delivery/tasks/WP2-T04-FREEZE.md.
- handoff/delivery/tasks/WP2-INFRA1.md (attempt 2 addition).
- Every file under handoff/delivery/evidence/WP2-T03-FREEZE/, WP2-T04/ and WP2-INFRA1/.

Modified:
- src/server/app.ts and src/server/http/schemas.ts.
- .gitattributes (attempt 2 addition: `handoff/delivery/evidence/** -whitespace`, WP2-INFRA1).
- tests/integration/isolation.test.ts.
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/{WP2-T03-FREEZE.md, WP2-T04.md}.

Allowed but not staged: your own handoff/delivery/evidence/WP2-T04-FREEZE/ files, and the
results you append to this brief after the commit.

Any other changed or untracked path: stop without committing and report it.

## Checks before committing

Run the profile checks with Node 24 and record `node --version`:
- precommit check;
- `git diff --cached --check`;
- JSON parse of ORCHESTRATION.json;
- orchestration validator;
- check_recovery.py;
- a staged-diff read for personal data. Look closely at the new tests and the synthetic
  CSV sample.

If a check fails, do not commit; report the file, line and rule. Maskable evidence
profile paths are the one exception.

If you save the output of a failing check as evidence, strip trailing whitespace from the
saved log. Keep all your evidence LF, free of trailing whitespace, and ending in a single
final newline.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add the OT, leave, history and evidence-export API (WP2-T04)

- feat(api): OT summary, ledger, leave reserve/record-use/cancel/reverse with expected_version
- feat(api): owner-only evidence CSV with formula neutralization; own history with versions
- test(api): ID-swap 404s, admin isolation, CSV injection, CSRF, no credit/debit route

Task: WP2-T04-FREEZE (intermediate freeze; advisory ledger audit and package-final gate follow)

## Push and report

Push per profile. Append these results here: pre/post HEAD, commit SHA, pushed, remote
SHA, staged count, check exits, blockers. Evidence goes in
handoff/delivery/evidence/WP2-T04-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)
