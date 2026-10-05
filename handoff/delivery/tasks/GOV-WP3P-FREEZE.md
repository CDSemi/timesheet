# GOV-WP3P-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / GOV-WP3P-FREEZE; package GOV; kind commit;
  attempt 1; depends on WP3-DOC-FREEZE. The governance freeze for the WP3 prompt gate
  lines that WP3-DOC edited (docs/08: `handoff/prompts/` is a governance path).
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (governance prompts), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  cb9800e4cfef57786c2e69bb4fd78d245ab5c817. If either differs, stop and report.
- Push after the commit.
- Scratch space: make the first shell call a trivial `node --version` (Node 24 by full
  path); if it fails with ENOSPC or "temp filesystem … is full", stop at once and report.
  Use `D:\timesheet-tmp\GOV-WP3P-FREEZE` (owner-authorized, outside Dropbox) for
  TEMP/TMP; delete only files you created; never remove folders recursively.

## Expected working-tree set

Nothing outside handoff/ may be changed or untracked; the source digest must still equal
4d4c4863cd6b61d63236927d5c77c6ea132edcf8d8d940789ecb61904918078f (compute and record it).

- Governance files (modified): handoff/prompts/WP3_IMPLEMENT.md,
  handoff/prompts/WP3_IMPLEMENT.vi.md, handoff/prompts/WP3_REVIEW.md,
  handoff/prompts/WP3_REVIEW.vi.md.
- New: handoff/delivery/tasks/GOV-WP3P-FREEZE.md, GOV-WP3P-GATE.md and GOV-WP3P-AUDIT.md.
- Modified or new: handoff/delivery/ORCHESTRATION.json;
  handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md;
  handoff/delivery/tasks/WP3-DOC-FREEZE.md; every file under
  handoff/delivery/evidence/WP3-DOC-FREEZE/.

Allowed but not staged: your own files in handoff/delivery/evidence/GOV-WP3P-FREEZE/ and
the results you append to this brief after the commit.

Any other changed or untracked path stops the commit; report it.

## Checks before committing

Run one command per step with Node 24 (by full path) and record each exit code:
`node --version`; the digest; `git add` with the explicit paths (its own command); the
precommit check; `git diff --cached --check`; JSON parse of ORCHESTRATION.json; the
orchestration validator; check_recovery.py; `validate_package.py --preflight` with the
workflow Python
`C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
(write `<user>` in the evidence).

If `git diff --cached --check` flags only a blank line at EOF in a task record outside
evidence/, you may remove exactly that line and re-stage it; record the file name. Change
nothing in the prompt files. Do not print diffs through the shell; use the Grep tool with
masked output for any extra check. If any other check fails, do not commit; report the
file, line and rule. If any call is denied by a permission check, stop at once; do not
retry, split or rephrase it. Never write into the repository root; on Windows never
redirect to /dev/null or nul from a POSIX shell. Keep your evidence LF, free of trailing
whitespace, single final newline.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Mirror the updated WP3 scope and gate in the WP3 prompts

- docs(prompts): WP3_IMPLEMENT scope and gate sentences and the WP3_REVIEW gate sentence
  mirror docs/09 after the 2026-10-04 owner decisions (automatic-submission
  presentation, empty-period submission, admin boundary, timesheet sharing AC-16), EN and
  VI (governance change; GOV-WP3P gate and fresh audit follow)
- docs(handoff): WP3-DOC-FREEZE result; GOV-WP3P briefs; board and checkpoint (+ vi)

Task: GOV-WP3P-FREEZE

## Push and report

Push per the profile. Append: pre- and post-HEAD; commit SHA, pushed, remote SHA;
digest, staged count; check exits; blockers. Evidence in
handoff/delivery/evidence/GOV-WP3P-FREEZE/. Return at most 120 words.

## Results

(Committer appends here.)
