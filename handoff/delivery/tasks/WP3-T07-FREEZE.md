# WP3-T07-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T07-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-T07.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (new dependencies and lockfile; PDF tests with synthetic names and
  images), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  b89f8a8122781b0e8c7cf1a0086089b96713b17b. If either differs, stop and report.
- Push after the commit.
- The B: scratch drive is nearly full. Keep temporary output small; if a write fails for
  lack of space, stop and report.

## Expected working-tree set

Source and tests: changed or new paths outside handoff/ may only be among these:
- modified: package.json and package-lock.json;
- new: src/server/pdf/timesheetPdf.ts, src/server/pdf/layout.ts,
  src/server/pdf/fonts.ts, tests/integration/pdf-render.test.ts and
  tests/support/pdfText.ts.

Lockfile check (Grep tool, masked output): the package.json dependency changes are only
`pdf-lib`, `@pdf-lib/fontkit` and `dejavu-fonts-ttf` (runtime) and `pdfjs-dist` (dev). The
worker reported that the lockfile adds 20 packages and removes none; record the count you
see. Any removed or downgraded package stops the commit.

Compute the digest with Node 24 (`scripts/source-digest.mjs` or `npm run digest`) and
record it. The worker reported
971e7843469a9829e45fc608232daf56bbab64e66904809c7de52d800037b8aa; a different value stops
the commit.

New handoff files:
- handoff/delivery/tasks/: WP3-T07.md and WP3-T07-FREEZE.md.
- Every file under handoff/delivery/evidence/WP3-T07/ (including the `*.py.txt`
  scripts).

Modified or new handoff files:
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/WP3-T04-FREEZE.md.
- Every file under handoff/delivery/evidence/WP3-T04-FREEZE/.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP3-T07-FREEZE/;
- the results you append to this brief after the commit.

Any other changed or untracked path stops the commit; report it. That includes a file
named `nul`, any `.pdf`, image or font file, any database or `private-data` content, any
`.csv` file and any other source file.

## Checks before committing

Run one command per step with Node 24 (by full path) and record each exit code:
- `node --version`;
- the digest;
- `git add` with the explicit paths, as its own command (the listed evidence directories
  are allowed);
- the precommit check;
- `git diff --cached --check`;
- JSON parse of ORCHESTRATION.json and package.json;
- the orchestration validator;
- check_recovery.py;
- `validate_package.py --preflight` with the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
  Write `<user>` in the evidence.

If `git diff --cached --check` flags only a blank line at EOF in a task record outside
evidence/, you may remove exactly that line and re-stage it. Record the file name. Change
nothing else. If the precommit check masks a user-profile path in an evidence log, that
is allowed; a block in a source or test file stops the commit.

Privacy hygiene: the precommit script is the privacy and secret scan.
- Do not print diffs, test bodies, probe sources, names or CSV content through the shell.
- For any extra check, use the Grep tool and report masked values only.

If any other check fails, do not commit. Report the file, line and rule.

If any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it; report the denial.

Never write into the repository root. On Windows, never redirect to /dev/null or nul from
a POSIX shell. Keep your text evidence LF, free of trailing whitespace and ending in a
single final newline. Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add the deterministic pdf-lib timesheet renderer

- feat(pdf): pure renderer from the review snapshot: US Letter, 14 dates in two
  Monday-Sunday blocks, h:mm values, OT total including both Sundays, Show OT toggle,
  embedded Unicode font, bounded signature, pending banner on automatic revisions,
  deterministic bytes
- build(deps): pdf-lib 1.17.1, @pdf-lib/fontkit 1.1.1, dejavu-fonts-ttf 2.37.3; dev
  pdfjs-dist 6.4.299 (none deprecated)
- test: 28 new tests; 14 mutations caught
- docs(handoff): WP3-T04 freeze result, WP3-T07 brief, record and evidence, board and
  checkpoint (+ vi)

Task: WP3-T07-FREEZE

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest, staged count, lockfile package count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP3-T07-FREEZE/. Return at most 150 words.

## Attempt 2 (coordinator note)

Attempt 1 stopped on a digest mismatch. WP3-T07-RECON (verifier) found the worker's
971e7843 stale (a test edited after it) and confirmed the current tree: digest
3f4a016d0834437005cb40566a06b7d030dd6ae2bc072f5629f74984a33b9da6 stable, changed paths
exactly the T07 set, verify exit 0 with 906 tests, precommit on a temporary index clean.

- The expected digest is now
  3f4a016d0834437005cb40566a06b7d030dd6ae2bc072f5629f74984a33b9da6; recompute it
  immediately before `git add`; a different value stops the commit.
- The expected set additionally includes handoff/delivery/tasks/WP3-T07-RECON.md and every
  file under handoff/delivery/evidence/WP3-T07-RECON/ (new), and your attempt-1 files in
  handoff/delivery/evidence/WP3-T07-FREEZE/ (stage them).
- Run every check in the listed order, including the lockfile check. Everything else in
  this brief is unchanged.

## Results

(Committer appends here.)

Self-reported model: claude-sonnet-5-5. Attempt 1: STOPPED, no commit, no push.
- Pre-HEAD = origin/main-expected b89f8a8122781b0e8c7cf1a0086089b96713b17b; branch main; working-tree set matched the brief exactly; nothing staged.
- node --version: v24.21.0 (exit 0).
- Digest (scripts/source-digest.mjs, exit 0): 3f4a016d0834437005cb40566a06b7d030dd6ae2bc072f5629f74984a33b9da6 (637 files); expected 971e7843469a9829e45fc608232daf56bbab64e66904809c7de52d800037b8aa. Mismatch stops the commit per the brief.
- Not run: git add, precommit, diff check, JSON parse, validators, push.
- Evidence: handoff/delivery/evidence/WP3-T07-FREEZE/01-node-version.txt, 02-digest.txt.
