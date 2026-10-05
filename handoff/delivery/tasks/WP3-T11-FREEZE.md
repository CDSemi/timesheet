# WP3-T11-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T11-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-T11.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (notification code with synthetic addresses, evidence scripts), novelty
  no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  0321be6e82c770eaca5fc1293b9ac230b22263ff. If either differs, stop and report.
- Push after the commit.
- Scratch space: make the first shell call a trivial `node --version` (Node 24 by full
  path); if it fails with ENOSPC or "temp filesystem … is full", stop at once and report.
  Use `D:\timesheet-tmp\WP3-T11-FREEZE` (owner-authorized, outside Dropbox) for TEMP/TMP;
  delete only files you created; never remove folders recursively.

## Expected working-tree set

Source and tests: changed or new paths outside handoff/ may only be among these:
- new: src/domain/reminders.ts, src/server/services/notifications.ts,
  src/server/jobs/reminderJob.ts, tests/domain/reminders.test.ts and
  tests/integration/reminders.test.ts;
- modified: src/server/jobs/runner.ts.

Recompute the digest with Node 24 (`scripts/source-digest.mjs` or `npm run digest`)
immediately before `git add` and record it. The worker reported
e7f00cd076cf70fea542362815efa9bbf92dd7cb70f8797a66464c751cc6f471; a different value stops
the commit.

New handoff files:
- handoff/delivery/tasks/: WP3-T11-FREEZE.md and WP3-T12.md.
- Every file under handoff/delivery/evidence/WP3-T11/ (including `*.py.txt` scripts).

Modified or new handoff files:
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/: WP3-T10-FREEZE.md and WP3-T11.md.
- Every file under handoff/delivery/evidence/WP3-T10-FREEZE/.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP3-T11-FREEZE/;
- the results you append to this brief after the commit.

Any other changed or untracked path stops the commit; report it. That includes a file
named `nul`, any `.eml`, `.pdf` or image file, any database, `mail-capture` or
`private-data` content, any `.csv` file and any other source file.

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

Subject: Add deadline reminders, overdue warnings and the automatic-submission notice

- feat(notifications): 24 h and 2 h reminders (or saved offsets), an overdue warning
  when auto-submit is off and an outcome notice after automatic submission, each to the
  employee's own address with a login-required link only
- feat(jobs): reminder job with occurrence-and-job dedupe in one transaction, collapse
  of missed notices after downtime, and a finalization re-check at send time
- test: 57 new tests including DST-change deadlines against the zone oracle; 16
  mutations caught
- docs(handoff): WP3-T10 freeze result, WP3-T11 record and evidence, WP3-T12 brief,
  board and checkpoint (+ vi)

Task: WP3-T11-FREEZE

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest, staged count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP3-T11-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)
