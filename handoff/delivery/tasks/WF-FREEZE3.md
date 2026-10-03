# WF-FREEZE3 dispatch brief

- Mission/task: timesheet-software-readiness / WF-FREEZE3; board package GOV; kind commit;
  attempt 1; depends on WF-FIX2.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy), novelty no. Records in English.
- Authority: AGENTS.md rule 12, docs/08 "Commits and pushes", board `owner_decisions`.
- Branch: main (`git.release_declared` false). Expected HEAD = origin/main =
  c219d79a2c202861b719473cdffb0efb59f14290; if either differs, stop and report.
- Purpose: freeze commit of WF-FIX2 plus WF-FREEZE2/WF-GATE2/WF-AUDIT2 records so WF-GATE3
  and WF-AUDIT3 run on a fixed SHA; push after the commit.

## Expected working-tree set

Modified: handoff/prompts/ORCHESTRATE.md and .vi.md; handoff/prompts/FIX_FINDINGS.md
and .vi.md; handoff/delivery/validate_orchestration.py; handoff/delivery/check_recovery.py;
scripts/precommit-check.mjs; docs/08_AI_WORKFLOW_AND_BUDGET.md and .vi.md;
handoff/delivery/ORCHESTRATION.json; handoff/NEXT_ACTION.md and .vi.md;
handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md;
handoff/delivery/tasks/{WF-FREEZE2.md, WF-GATE2.md, WF-AUDIT2.md}. STATE.json only if
it shows a change (record it).

New: handoff/delivery/WORKFLOW_RECHECK.md and .vi.md;
handoff/delivery/tasks/{WF-FIX2.md, WF-FREEZE3.md, WF-GATE3.md, WF-AUDIT3.md}; every
file under handoff/delivery/evidence/WF-FREEZE2/, WF-GATE2/, WF-AUDIT2/ and WF-FIX2/.

Allowed but not staged: your own handoff/delivery/evidence/WF-FREEZE3/ files and the
results you append to this brief after the commit.

Any other changed or untracked path: stop without committing and report it.

## Checks before committing

Profile checks with the Node 24 runtime (record `node --version`): precommit check,
`git diff --cached --check`, JSON parse of ORCHESTRATION.json (and STATE.json if
staged), orchestration validator, staged-diff read for personal data. Known item:
handoff/delivery/evidence/WF-GATE2/preflight-system-python.txt contains concrete
user-profile paths; mask the account segment as `<user>` in those lines (allowed for
staged evidence logs), record it, and rerun all checks. Any other block: do not commit;
report file, line and rule.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Close workflow recheck findings WF-A-10, WF-R-01 and WF-R-02

- fix(workflow): gate_included only for intermediate S-size fixes in ORCHESTRATE/FIX_FINDINGS
- fix(workflow): bind GOV audits to their gate commit; validate addresses_audit
- fix(workflow): precommit blocks spaced app-password secret values
- docs(workflow): addresses_audit, commit binding, governance paths add .agents/ and docs/agents/
- chore(workflow): recheck report, gate/audit evidence, board, entry prompt and checkpoint

Task: WF-FREEZE3 (freeze of WF-FIX2 before WF-GATE3/WF-AUDIT3)

## Push and report

Push per profile. Append results here: pre/post HEAD, commit SHA, pushed, remote SHA,
staged count, masked files, check exits, blockers. Evidence in
handoff/delivery/evidence/WF-FREEZE3/. Return at most 200 words.

## Results

- Pre HEAD c219d79a2c202861b719473cdffb0efb59f14290; post HEAD = commit SHA = remote SHA 6578df8f81e8c0ead5ec09444b7bd8fa081d1ff7; pushed to origin main.
- Node v24.21.0; staged 69 (STATE.json unchanged); masked: handoff/delivery/evidence/WF-GATE2/preflight-system-python.txt (7 lines).
- Checks: precommit 1 then 0 after masking; diff --check 0; JSON parse 0; validator 0; staged-diff read clean. Blockers: none.
