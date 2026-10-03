# WP1-F01-ACCEPT dispatch brief

- Mission/task: timesheet-software-readiness / WP1-F01-ACCEPT; package WP1; kind commit;
  attempt 1; depends on WP1-F01-AUDIT (PASS).
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy), novelty no. Records in English.
- Authority: AGENTS.md rule 12, docs/08 "Commits and pushes", board `owner_decisions`.
- Branch: main (`git.release_declared` false). Expected HEAD = origin/main =
  68bbb31435543329b6c51f29703d9e2e7a4290bf; if either differs, stop and report.
- Purpose: records-only accept commit for WP1. Every staged path is under handoff/, so
  the accepted source digest c6e24381… stays unchanged.

## Expected working-tree set

Modified: handoff/delivery/ORCHESTRATION.json; handoff/delivery/STATE.json;
handoff/NEXT_ACTION.md and .vi.md; handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and
.vi.md; handoff/delivery/WORKFLOW_HANDOFF.md and .vi.md; handoff/delivery/WP1_HANDOFF.md
and .vi.md; handoff/delivery/tasks/{WP1-F01-FREEZE.md, WP1-F01-GATE.md, WP1-F01-AUDIT.md}.

New: handoff/delivery/WP1_RECHECK.md and .vi.md; handoff/delivery/tasks/WP1-F01-ACCEPT.md;
every file under handoff/delivery/evidence/WP1-F01-FREEZE/, WP1-F01-GATE/ and
WP1-F01-AUDIT/.

Allowed but not staged: your own handoff/delivery/evidence/WP1-F01-ACCEPT/ files and the
results you append to this brief after the commit. Any other changed or untracked path:
stop without committing and report it.

## Checks before committing

Profile checks with the Node 24 runtime (record `node --version`): precommit check,
`git diff --cached --check`, JSON parse of ORCHESTRATION.json and STATE.json,
orchestration validator, staged-diff read for personal data. Maskable profile paths in
evidence logs: mask, record, rerun. Any other block (including whitespace): do not commit;
report file, line and rule.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Accept WP1 after independent F-01 recheck

- docs(handoff): WP1 acceptance record and independent recheck report (EN/VI)
- chore(workflow): board, state, entry prompt and checkpoint for WP1 acceptance
- chore(workflow): F-01 freeze, gate and audit evidence; fix a workflow handoff link

Task: WP1-F01-ACCEPT
Gate: WP1-F01-GATE PASS
Audit: WP1-F01-AUDIT PASS (reviewed commit 68bbb31435543329b6c51f29703d9e2e7a4290bf)
Digest: c6e24381253c02ac74d1690b7b15aa7e6ac5b31bcd7ee8b8b8d19ca7d7d29c59

## Push and report

Push per profile. Append results here: pre/post HEAD, commit SHA, pushed, remote SHA,
staged count, masked files, check exits, blockers. Evidence in
handoff/delivery/evidence/WP1-F01-ACCEPT/. Return at most 200 words.

## Results

(Committer appends here.)

- Pre HEAD 68bbb31435543329b6c51f29703d9e2e7a4290bf; post HEAD and commit f32978fcc7dec9429f0aa544c4ee4ee26c14f798.
- Pushed to origin main; remote SHA f32978fcc7dec9429f0aa544c4ee4ee26c14f798.
- Node v24.21.0. Staged 54 files; masked files none.
- Exits: precommit 0, diff --cached --check 0, JSON parse 0, validator 0. Blockers none.
- Evidence: handoff/delivery/evidence/WP1-F01-ACCEPT/.
