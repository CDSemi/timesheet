# GOV-E8-FREEZE2 dispatch brief

- Mission/task: timesheet-software-readiness / GOV-E8-FREEZE2; board package GOV; kind
  commit; attempt 1; depends on GOV-E8-FIX2.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy), novelty no. Records in English.
- Authority: AGENTS.md rule 12, docs/08 "Commits and pushes", board `owner_decisions`.
- Branch: main (`git.release_declared` false). Expected HEAD = origin/main =
  393779ddf62b80246d9c52a0d563086a3ffddcbb; if either differs, stop and report.
- Purpose: freeze the check_recovery harness fix (after the GOV-E8-GATE FAIL) together
  with the gate records, so that GOV-E8-GATE2 and the fresh audit run on one SHA. Push
  after the commit.

## Expected working-tree set

Modified: handoff/delivery/check_recovery.py; handoff/delivery/ORCHESTRATION.json;
handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md;
handoff/delivery/tasks/{GOV-E8-FREEZE.md, GOV-E8-GATE.md, GOV-E8-AUDIT.md}.

New: handoff/delivery/tasks/{GOV-E8-FIX2.md, GOV-E8-FREEZE2.md, GOV-E8-GATE2.md}; every
file under handoff/delivery/evidence/GOV-E8-FREEZE/, GOV-E8-GATE/ and GOV-E8-FIX2/.

Allowed but not staged: your own handoff/delivery/evidence/GOV-E8-FREEZE2/ files and the
results you append to this brief after the commit. Any other changed or untracked path:
stop without committing and report it.

## Checks before committing

Run the profile checks with the Node 24 runtime and record `node --version`:
- precommit check;
- `git diff --cached --check`;
- JSON parse of ORCHESTRATION.json;
- orchestration validator;
- `python handoff/delivery/check_recovery.py`, which must exit 0;
- staged-diff read for personal data.

Any block other than maskable evidence profile paths: do not commit; report file, line
and rule.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Make recovery probes independent of the live active package

- fix(workflow): self-contained synthetic boards in check_recovery.py; regression probe
- chore(workflow): GOV-E8 gate FAIL record and evidence

Task: GOV-E8-FREEZE2 (after GOV-E8-GATE FAIL; GOV-E8-GATE2 and audit follow)

## Push and report

Push per profile. Append results here: pre/post HEAD, commit SHA, pushed, remote SHA,
staged count, check exits, blockers. Evidence in handoff/delivery/evidence/GOV-E8-FREEZE2/.
Return at most 150 words.

## Results

(Committer appends here.)
