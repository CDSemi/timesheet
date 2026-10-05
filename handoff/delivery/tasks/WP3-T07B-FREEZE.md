# WP3-T07B-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T07B-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-T07B. Also commits the GOV-WP3P gate and audit records.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (PDF and settings code, migration, signature consent, evidence
  scripts), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  da6d0cdd2d20b6ffabb18f4cfaf7d8ad72951c0d. If either differs, stop and report.
- Push after the commit.
- Scratch space: make the first shell call a trivial `node --version` (Node 24 by full
  path); if it fails with ENOSPC or "temp filesystem … is full", stop at once and report.
  Use `D:\timesheet-tmp\WP3-T07B-FREEZE` (owner-authorized, outside Dropbox) for
  TEMP/TMP; delete only files you created; never remove folders recursively.

## Expected working-tree set

Source and tests: changed or new paths outside handoff/ may only be among these:
- new: src/server/db/migrations/0005_automatic_presentation.ts;
- modified: src/server/db/migrations.ts, src/server/services/submissionSettings.ts,
  src/server/routes/settings.ts, src/server/http/schemas.ts, src/domain/snapshot.ts,
  src/domain/emailTemplate.ts, src/server/services/reviewPayload.ts,
  src/server/services/finalization.ts, src/server/pdf/timesheetPdf.ts,
  src/server/pdf/layout.ts, src/server/jobs/pdfJob.ts, src/server/routes/signatures.ts,
  src/server/services/signatures.ts, tests/integration/migrations.test.ts,
  submission-settings.test.ts, review-payload.test.ts, pdf-render.test.ts,
  signatures.test.ts, jobs.test.ts, tests/domain/canonical.test.ts and
  email-template.test.ts.
- No governance path (handoff/prompts/, AGENTS.md, docs/08, .claude/, scripts/precommit,
  validators) may be changed.

Recompute the digest with Node 24 (`scripts/source-digest.mjs` or `npm run digest`)
immediately before `git add` and record it. The worker reported
5e37ab987f5f542a18a1c544f3c0dc538fb77bbe27927650a9b5428e3a609bcf; a different value stops
the commit.

Handoff files:
- new: handoff/delivery/GOV_WP3P_REVIEW.md and .vi.md; handoff/delivery/tasks/
  WP3-T07B-FREEZE.md; every file under handoff/delivery/evidence/: WP3-T07B/,
  GOV-WP3P-GATE/ and GOV-WP3P-AUDIT/ (including `*.py.txt`/`*.mjs.txt` scripts);
- modified or new: handoff/delivery/ORCHESTRATION.json;
  handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md;
  handoff/delivery/tasks/: GOV-WP3P-FREEZE.md, GOV-WP3P-GATE.md, GOV-WP3P-AUDIT.md,
  WP3-T07B.md and WP3-T13.md; every file under handoff/delivery/evidence/GOV-WP3P-FREEZE/.

Allowed but not staged: your own files in handoff/delivery/evidence/WP3-T07B-FREEZE/ and
the results you append to this brief after the commit.

Any other changed or untracked path stops the commit; report it. That includes a file
named `nul`, any `.pdf`, `.eml` or image file, a database, `mail-capture` or
`private-data` content, any `.csv` file and any other source file.

## Checks before committing

Run one command per step with Node 24 (by full path) and record each exit code:
`node --version`; the digest; `git add` with the explicit paths (its own command); the
precommit check; `git diff --cached --check`; JSON parse of ORCHESTRATION.json; the
orchestration validator; check_recovery.py; `validate_package.py --preflight` with the
workflow Python
`C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
(write `<user>` in the evidence).

If `git diff --cached --check` flags only a blank line at EOF in a task record outside
evidence/, you may remove exactly that line and re-stage it; record the file name. If the
precommit check masks a user-profile path in an evidence log, that is allowed; a block in
a source or test file stops the commit. Do not print diffs, test bodies, probe sources,
names or CSV content through the shell; use the Grep tool with masked output for any
extra check. If any other check fails, do not commit; report the file, line and rule. If
any call is denied by a permission check, stop at once; do not retry, split or rephrase
it. Never write into the repository root; on Windows never redirect to /dev/null or nul
from a POSIX shell. Keep your evidence LF, free of trailing whitespace, single final
newline. Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Present automatic submissions without an automatic indicator

- feat(db): migration 0005 adds the automatic note line (enabled flag, default off;
  text, default "Automatic submission", 1-120 characters, one line)
- feat(settings): validated, audited note settings; the signature upload can perform the
  audited auto-image authorization in the same transaction (owner G-Q1 b)
- feat(snapshot): version 2 with the note; {SignOffStatus} is "Submitted", or the note
  text for an automatic submission with the note on (owner G-Q2 a)
- fix(pdf): no banner or origin word; the signature block prints the name and the local
  date; manual PDFs print the stored signer name; the image on automatic submissions only
  when authorized
- test: 19 mutations caught
- docs(handoff): GOV-WP3P gate PASS and audit PASS (GOV_WP3P_REVIEW + vi), WP3-T07B record
  and evidence, WP3-T13 note, board and checkpoint (+ vi)

Task: WP3-T07B-FREEZE

## Push and report

Push per the profile. Append: pre- and post-HEAD; commit SHA, pushed, remote SHA;
digest, staged count; check exits; blockers. Evidence in
handoff/delivery/evidence/WP3-T07B-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)

Committer (attempt 1, Sonnet 5.5): pre-HEAD da6d0cdd2d20b6ffabb18f4cfaf7d8ad72951c0d;
commit 943027b3a328f174ef3de5c45ee4677906af3189; pushed to main; remote SHA
943027b3a328f174ef3de5c45ee4677906af3189. Digest 5e37ab98...a609bcf (matches); 56 staged;
all checks exit 0 (see evidence/WP3-T07B-FREEZE/checks.txt); no masking, no EOF fix, no
blockers.
