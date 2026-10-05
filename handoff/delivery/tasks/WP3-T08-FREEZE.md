# WP3-T08-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T08-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-T08.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (job code, crash tests, evidence scripts), novelty no. Records in
  English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  2f8011ac1a8e2eadc031e6654714454efe1126f1. If either differs, stop and report.
- Push after the commit.
- Scratch space: make the first shell call a trivial `node --version` (Node 24 by full
  path); if it fails with ENOSPC or "temp filesystem … is full", stop at once and report.
  Use `D:\timesheet-tmp\WP3-T08-FREEZE` (owner-authorized, outside Dropbox) for TEMP/TMP;
  delete only files you created; never remove folders recursively.

## Expected working-tree set

Source and tests: changed or new paths outside handoff/ may only be among these:
- new: src/server/jobs/jobStore.ts, src/server/jobs/runner.ts,
  src/server/jobs/pdfJob.ts, tests/integration/jobs.test.ts and
  tests/integration/jobs-restart.test.ts;
- modified: src/server/index.ts and src/server/cli.ts.

Recompute the digest with Node 24 (`scripts/source-digest.mjs` or `npm run digest`)
immediately before `git add` and record it. The worker reported
706c1619ef5461428f28bcf80722c2189d85ee0a927d1c7c664eca349cd82467; a different value stops
the commit.

New handoff files:
- handoff/delivery/tasks/: WP3-T08-FREEZE.md and WP3-REQ2.md.
- Every file under handoff/delivery/evidence/WP3-T08/ and
  handoff/delivery/evidence/WP3-REQ2/ (including `*.py.txt` scripts).

Modified or new handoff files:
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/: WP3-T06-FREEZE.md and WP3-T08.md.
- Every file under handoff/delivery/evidence/WP3-T06-FREEZE/.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP3-T08-FREEZE/;
- the results you append to this brief after the commit.

Any other changed or untracked path stops the commit; report it. That includes a file
named `nul`, any `.pdf` or image file, any database or `private-data` content, any `.csv`
file and any other source file.

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

Subject: Add the durable job store, runner and PDF job

- feat(jobs): atomic claim with leases inside BEGIN IMMEDIATE, lease-holder-only
  renew/complete/fail, expired-lease reclaim, retries after 1/5/15/60 minutes then
  intervention, heartbeat in operations_state, error codes only
- feat(jobs): in-process runner and a run-jobs --once --now CLI refused in production;
  the PDF job renders only from the stored snapshot, verifies the signature hash, writes
  temp then renames, records revision_files, posts and sends nothing
- fix(server): index.ts passes the delivery config data directory to createApp
- test: 21 new tests incl. child-process crash recovery; 13 mutations caught
- docs(handoff): WP3-T06 freeze result, WP3-REQ2 addendum, WP3-T08 record and evidence,
  board and checkpoint (+ vi)

Task: WP3-T08-FREEZE

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest, staged count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP3-T08-FREEZE/. Return at most 150 words.

## Results

- Self-reported model: claude-sonnet-5-5
- Pre-HEAD: 2f8011ac1a8e2eadc031e6654714454efe1126f1; post-HEAD: 3d7a17c3a0eecb10726eaf1378fbab537ec67ef5
- Commit: 3d7a17c3a0eecb10726eaf1378fbab537ec67ef5; pushed: yes; remote SHA: 3d7a17c3a0eecb10726eaf1378fbab537ec67ef5
- Digest: 706c1619ef5461428f28bcf80722c2189d85ee0a927d1c7c664eca349cd82467; staged: 25
- Check exits: node 0, digest 0, add 0, precommit 0, diff-check 0, JSON 0, orchestration 0, recovery 0, preflight 0
- Blockers: none; no masking, no unstaging
- Evidence: handoff/delivery/evidence/WP3-T08-FREEZE/
