# WP3-T13A-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T13A-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-T13A.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (ownership plumbing, evidence scripts), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  19723b6e77b75c972cf416229d05b3b5203c8480. If either differs, stop and report.
- Push after the commit.
- Scratch space: make the first shell call a trivial `node --version` (Node 24 by full
  path); if it fails with ENOSPC or "temp filesystem … is full", stop at once and report.
  Use `D:\timesheet-tmp\WP3-T13A-FREEZE` (owner-authorized, outside Dropbox) for
  TEMP/TMP; delete only files you created; never remove folders recursively.

## Expected working-tree set

Source and tests: changed or new paths outside handoff/ may only be among these:
- new: tests/integration/actor-subject.test.ts;
- modified: src/server/types.ts, src/server/http/auth.ts, src/server/app.ts,
  src/server/index.ts, src/server/cli.ts, src/server/services/timesheetCommands.ts,
  src/server/services/dayEntries.ts, src/server/services/operationsStatus.ts,
  src/server/routes/api.ts, src/server/routes/ot.ts, src/server/routes/submission.ts,
  tests/integration/operations-status.test.ts, and the reported deviation
  src/server/routes/admin.ts. (edit-rules.test.ts and day-entries-batch.test.ts were
  owned but reported unchanged.)

Recompute the digest with Node 24 (`scripts/source-digest.mjs` or `npm run digest`)
immediately before `git add` and record it. The worker reported
0edefc94a01eef88b0c7df32d7c71f328703ee08f58876a2c9297d6b8ed03299; a different value stops
the commit.

New handoff files:
- handoff/delivery/tasks/: WP3-T13A-FREEZE.md and WP3-E2E-RECHECK.md.
- Every file under handoff/delivery/evidence/WP3-T13A/ (including `*.mjs.txt` and
  `*.py.txt` scripts).

Modified or new handoff files:
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/: WP3-T13D-FREEZE.md and WP3-T13A.md.
- Every file under handoff/delivery/evidence/WP3-T13D-FREEZE/.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP3-T13A-FREEZE/;
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

Subject: Separate the acting user from the timesheet owner without behaviour change

- refactor(server): the request context carries actor and subject (both the session
  user today); personal routers become factories that read the subject from the context;
  mounts and the 63-route inventory unchanged
- refactor(audit): commands record actor and owner separately
- refactor(server): the delivery configuration is passed through AppDeps; the admin
  status no longer reads process.env
- test: 14 new tests incl. a source scan for direct session-user ownership reads; 6
  mutations caught
- docs(handoff): WP3-T13D freeze result, WP3-T13A record and evidence, WP3-E2E-RECHECK
  brief, board and checkpoint (+ vi)

Task: WP3-T13A-FREEZE

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest, staged count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP3-T13A-FREEZE/. Return at most 150 words.

## Results

- Self-reported model: claude-sonnet-5-5. Node v24.21.0.
- Pre-HEAD 19723b6e77b75c972cf416229d05b3b5203c8480; post-HEAD and commit SHA
  c1e4bb2c161561cfa3827028837a087303352718; pushed to main; remote SHA equal.
- Digest 0edefc94a01eef88b0c7df32d7c71f328703ee08f58876a2c9297d6b8ed03299 (matches).
  Staged count 34. No masking, no EOF fix, no unstaged extras.
- Check exits (all 0): digest, git add, precommit (0 findings), diff --check, JSON
  parse, validate_orchestration, check_recovery, validate_package --preflight.
- Blockers: none.
