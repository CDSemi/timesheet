# WP3-DOC-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-DOC-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-DOC.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (canonical business documents in two languages), novelty no. Records in
  English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  632092d730f84bc10b3bee1f7ae61f96edec35eb. If either differs, stop and report.
- Push after the commit.
- Scratch space: make the first shell call a trivial `node --version` (Node 24 by full
  path); if it fails with ENOSPC or "temp filesystem … is full", stop at once and report.
  Use `D:\timesheet-tmp\WP3-DOC-FREEZE` (owner-authorized, outside Dropbox) for TEMP/TMP;
  delete only files you created; never remove folders recursively.

## Governance split (important)

`handoff/prompts/` is a governance path (docs/08). The four modified prompt files
- handoff/prompts/WP3_IMPLEMENT.md and WP3_IMPLEMENT.vi.md,
- handoff/prompts/WP3_REVIEW.md and WP3_REVIEW.vi.md
are expected in the working tree but must **not** be staged in this commit; they are
committed by the separate task GOV-WP3P-FREEZE. Leave them modified and unstaged.

## Expected working-tree set (to stage)

Outside handoff/ (only these):
- modified: docs/01_PRODUCT_REQUIREMENTS.md, docs/02_TIME_AND_OT_RULES.md,
  docs/03_ARCHITECTURE_AND_DATA.md, docs/04_UX_AND_SETTINGS.md,
  docs/05_SUBMISSION_AND_NOTIFICATIONS.md, docs/06_TEST_AND_ACCEPTANCE.md,
  docs/07_DEPLOYMENT_AND_OPERATIONS.md, docs/09_IMPLEMENTATION_ROADMAP.md,
  docs/10_DECISIONS_AND_SOURCES.md and each matching `.vi.md`;
- modified: reference/examples/policy.example.json.

Recompute the digest with Node 24 (`scripts/source-digest.mjs` or `npm run digest`)
immediately before `git add` and record it. The worker reported
4d4c4863cd6b61d63236927d5c77c6ea132edcf8d8d940789ecb61904918078f (the prompt files are
under handoff/ and do not affect it); a different value stops the commit.

Handoff files:
- new: handoff/delivery/tasks/WP3-DOC-FREEZE.md and WP3-T13.md; every file under
  handoff/delivery/evidence/WP3-DOC/;
- modified or new: handoff/delivery/ORCHESTRATION.json;
  handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md;
  handoff/delivery/tasks/: WP3-REC1.md, WP3-DOC.md and WP3-T07B.md; every file under
  handoff/delivery/evidence/WP3-REC1/.

Allowed but not staged: the four prompt files above; your own files in
handoff/delivery/evidence/WP3-DOC-FREEZE/; the results you append to this brief after the
commit.

Any other changed or untracked path stops the commit; report it.

## Checks before committing

Run one command per step with Node 24 (by full path) and record each exit code:
`node --version`; the digest; `git add` with the explicit paths (its own command; never
`git add -A` here, because the prompt files must stay unstaged); `git diff --cached
--name-only` compared with the expected set (no prompt file staged); the precommit check;
`git diff --cached --check`; JSON parse of ORCHESTRATION.json and policy.example.json;
the orchestration validator; check_recovery.py; `validate_package.py --preflight` with
the workflow Python
`C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
(write `<user>` in the evidence).

If `git diff --cached --check` flags only a blank line at EOF in a task record outside
evidence/, you may remove exactly that line and re-stage it; record the file name. If the
precommit check masks a user-profile path in an evidence log, that is allowed. Do not
print diffs through the shell; use the Grep tool with masked output for any extra check.
If any other check fails, do not commit; report the file, line and rule. If any call is
denied by a permission check, stop at once; do not retry, split or rephrase it. Never
write into the repository root; on Windows never redirect to /dev/null or nul from a
POSIX shell. Keep your evidence LF, free of trailing whitespace, single final newline.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Update the canonical rules for the 2026-10-04 owner decisions

- docs: automatic submissions carry no automatic indicator by owner decision (D-09 and
  R-07 reworded): optional editable note line, signature image by an audited
  authorization asked at upload and pre-selected (G-Q1 b), {SignOffStatus} "Submitted"
  (G-Q2 a); empty periods auto-submit with default labels, zero OT and no deficit (F-1);
  pending deficit lifecycle (F-2); the admin sees everything except each person's
  timesheet details, including recipient addresses (F-3, F-Q3); timesheet sharing FR-17 /
  AC-16 with per-item grants (F-Q4, F-Q5); one activation instant (F-4); PDF OT total
  over 14 days (F-5); EN and VI
- docs(10): "Owner decisions - 2026-10-04" section
- chore(example): policy example gains the note fields and a neutral status line
- docs(handoff): WP3-REC1 result, WP3-DOC record and evidence, WP3-T07B answers,
  WP3-T13 brief, board and checkpoint (+ vi)

Task: WP3-DOC-FREEZE (the WP3 prompt files follow in GOV-WP3P-FREEZE)

## Push and report

Push per the profile. Append: pre- and post-HEAD; commit SHA, pushed, remote SHA;
digest, staged count, confirmation that no prompt file is staged; check exits; blockers.
Evidence in handoff/delivery/evidence/WP3-DOC-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)
