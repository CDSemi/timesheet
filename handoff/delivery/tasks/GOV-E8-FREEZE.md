# GOV-E8-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / GOV-E8-FREEZE; board package GOV; kind
  commit; attempt 1; depends on GOV-E8-FIX (and freezes WP2-DEC in the same commit).
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy), novelty no. Records in English.
- Authority: AGENTS.md rule 12, docs/08 "Commits and pushes", board `owner_decisions`.
- Branch: main (`git.release_declared` false). Expected HEAD = origin/main =
  f7b9f8e3f07b68e636da54ba589b286fa59561b8; if either differs, stop and report.
- Purpose: one decision commit for owner decisions E-2, E-3 and E-8. It holds the
  canonical docs and fixture (WP2-DEC) plus the AGENTS.md UI section (governance). The
  GOV gate and fresh audit run on this SHA. Push after the commit.

## Expected working-tree set

Modified: AGENTS.md; AGENTS.vi.md; docs/02_TIME_AND_OT_RULES.md and .vi.md;
docs/03_ARCHITECTURE_AND_DATA.md and .vi.md; docs/04_UX_AND_SETTINGS.md and .vi.md;
docs/10_DECISIONS_AND_SOURCES.md and .vi.md; reference/fixtures/ledger_cases.json;
reference/fixtures/README.md and .vi.md; handoff/delivery/ORCHESTRATION.json;
handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md;
handoff/delivery/tasks/WP2-CKPT1.md.

New: handoff/delivery/tasks/{WP2-DEC.md, GOV-E8-FIX.md, GOV-E8-FREEZE.md, GOV-E8-GATE.md,
GOV-E8-AUDIT.md}; every file under handoff/delivery/evidence/WP2-CKPT1/, WP2-DEC/ and
GOV-E8-FIX/.

Allowed but not staged: your own handoff/delivery/evidence/GOV-E8-FREEZE/ files and the
results you append to this brief after the commit. Any other changed or untracked path:
stop without committing and report it.

## Checks before committing

Profile checks with the Node 24 runtime (record `node --version`): precommit check,
`git diff --cached --check`, JSON parse of ORCHESTRATION.json and ledger_cases.json,
orchestration validator, staged-diff read for personal data. Any block other than
maskable evidence profile paths: do not commit; report file, line and rule.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Encode owner decisions E-2, E-3 and E-8

- docs(rules): OT-funded leave uses leave_kind, not a day category; explicit record-use consumption
- docs(ux): record-use action, mismatch warning and plain-CSS visual standard
- docs(agents): UI section uses CSS custom properties, 4px radius and 300 ms ease-out
- test(fixtures): LG-10 uses change_leave_label with leave_kind ot

Task: GOV-E8-FREEZE (decision commit; GOV gate and audit follow)

## Push and report

Push per profile. Append results here: pre/post HEAD, commit SHA, pushed, remote SHA,
staged count, masked files, check exits, blockers. Evidence in
handoff/delivery/evidence/GOV-E8-FREEZE/. Return at most 200 words.

## Results

Self-reported model: claude-sonnet-5-5. Pre HEAD f7b9f8e3f07b68e636da54ba589b286fa59561b8;
post HEAD and commit 393779ddf62b80246d9c52a0d563086a3ffddcbb; pushed to origin main;
remote SHA 393779ddf62b80246d9c52a0d563086a3ffddcbb; staged 34 files; masked files none;
Node v24.21.0; precommit 0, diff --check 0, JSON parse 0, orchestration validator 0;
blockers none. Evidence: handoff/delivery/evidence/GOV-E8-FREEZE/.
