# WP3-T12-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T12-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-T12.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (UI code, synthetic screenshots, evidence scripts), novelty no. Records
  in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  c3d32b9f72ebaa1bb0e96e35c7f4f61ad9ab40ce. If either differs, stop and report.
- Push after the commit.
- Scratch space: make the first shell call a trivial `node --version` (Node 24 by full
  path); if it fails with ENOSPC or "temp filesystem … is full", stop at once and report.
  Use `D:\timesheet-tmp\WP3-T12-FREEZE` (owner-authorized, outside Dropbox) for TEMP/TMP;
  delete only files you created; never remove folders recursively.

## Expected working-tree set

Source and tests: changed or new paths outside handoff/ may only be among these:
- new: src/client/ReviewScreen.tsx, src/client/components/ReviewDays.tsx,
  ReviewFindings.tsx, ReviewEnvelope.tsx, ReviewSignoff.tsx, ReviewStatus.tsx,
  src/client/components/reviewModel.ts, tests/client/reviewModel.test.ts and
  tests/e2e/review.spec.ts;
- modified: src/client/App.tsx, src/client/api.ts, src/client/styles.css,
  src/client/components/AppShell.tsx, src/client/components/PeriodHeader.tsx, and the
  reported deviation tests/e2e/timesheet.spec.ts.

Recompute the digest with Node 24 (`scripts/source-digest.mjs` or `npm run digest`)
immediately before `git add` and record it. The worker reported
160bb78cc502facd8b4c9d2b27415a8225cf841124ae8a9bd52d9064ad2f510e; a different value stops
the commit.

New handoff files:
- handoff/delivery/tasks/: WP3-T12-FREEZE.md, WP3-DOC.md and WP3-T07B.md.
- Every file under handoff/delivery/evidence/WP3-T12/, including the 12
  `review-*-synthetic.png` screenshots and the `*.mjs.txt`/`*.py.txt` scripts.

Modified or new handoff files:
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/: WP3-T11-FREEZE.md and WP3-T12.md.
- Every file under handoff/delivery/evidence/WP3-T11-FREEZE/.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP3-T12-FREEZE/;
- the results you append to this brief after the commit.

Any other changed or untracked path stops the commit; report it. That includes a file
named `nul`, any Playwright output outside the evidence directory, any `.pdf`, `.eml`, a
database, `mail-capture` or `private-data` content, any `.csv` file and any other source
file.

## Checks before committing

Run one command per step with Node 24 (by full path) and record each exit code:
- `node --version`;
- the digest;
- `git add` with the explicit paths, as its own command (the listed evidence directories
  are allowed);
- the precommit check;
- `git diff --cached --check`;
- JSON parse of ORCHESTRATION.json;
- the orchestration validator;
- check_recovery.py;
- `validate_package.py --preflight` with the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
  Write `<user>` in the evidence.

View at least six of the new screenshots with the Read tool (desktop and mobile) and
record how many; they must show synthetic data only.

If `git diff --cached --check` flags only a blank line at EOF in a task record outside
evidence/, you may remove exactly that line and re-stage it. Record the file name. Change
nothing else. If the precommit check masks a user-profile path in an evidence log, that
is allowed; a block in a source or test file stops the commit.

Privacy hygiene: the precommit script is the privacy and secret scan.
- Do not print diffs, test bodies, probe sources, names, addresses or CSV content through
  the shell.
- For any extra check, use the Grep tool and report masked values only.

If any other check fails, do not commit. Report the file, line and rule.

If any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it; report the denial.

Never write into the repository root. On Windows, never redirect to /dev/null or nul from
a POSIX shell. Keep your text evidence LF, free of trailing whitespace and ending in a
single final newline. Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add the review and sign-off screen with stale-review handling and status badges

- feat(ui): #/review/{payrollDate} shows the server's review content (14 days, OT
  proposals, deficit choices, missing evidence, reservations, recipients and email
  preview, signature) and posts sign-off with the expected version and reviewed hash;
  late review and correction entry points
- feat(ui): a 409 reloads a fresh review, a 422 names the field; the deep link survives
  login without a token; review and delivery badges in the period header
- style(ui): four new custom properties, no raw literals
- test: 40 unit tests (8 mutations caught) and review e2e on desktop and mobile (93
  passed, 3 skipped); a pre-existing e2e shared-state flake fixed
- docs(handoff): WP3-T11 freeze result, WP3-T12 record, evidence and screenshots,
  WP3-DOC and WP3-T07B briefs, board and checkpoint (+ vi)

Task: WP3-T12-FREEZE

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest, staged count, screenshots viewed;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP3-T12-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)
