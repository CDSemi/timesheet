# WP3-T00-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T00-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-T00.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy: evidence and a probe script), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  3ead61edb1316fe926fe969988f595792590cd41. If either differs, stop and report.
- Push after the commit.

## Expected working-tree set

Modified source and tests (and nothing else outside handoff/):
- src/server/services/otEvidence.ts.
- tests/integration/evidence-export.test.ts.
- scripts/smoke-built-server.mjs.

Run `npm run digest` with Node 24 and record it. The worker reported
81567e5370367a07f90ade63f7c41a029d0ec9c677bcafb09365cd0dee1966e2; a different value stops
the commit.

New handoff files:
- handoff/delivery/tasks/: WP3-T00.md, WP3-T00-FREEZE.md and WP3-T01.md.
- Every file under these handoff/delivery/evidence/ directories:
  - WP2-ACCEPT/;
  - WP3-PLAN/;
  - WP3-T00/ (including `probe-hold-ports.mjs.txt`).

Modified handoff files:
- handoff/delivery/ORCHESTRATION.json and handoff/delivery/STATE.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/: WP2-ACCEPT.md and WP3-PLAN.md.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP3-T00-FREEZE/;
- the results you append to this brief after the commit.

Any other changed or untracked path stops the commit; report it. That includes a file
named `nul`, `dist/` content that is not ignored, any `.csv` file and any other source
file.

## Checks before committing

Run one command per step with Node 24 (by full path) and record each exit code:
- `node --version`;
- `npm run digest`;
- `git add` with the explicit paths, as its own command (the listed evidence directories
  are allowed);
- the precommit check;
- `git diff --cached --check`;
- JSON parse of STATE.json and ORCHESTRATION.json;
- the orchestration validator;
- check_recovery.py;
- `validate_package.py --preflight` with the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
  Write `<user>` in the evidence.

If `git diff --cached --check` flags only a blank line at EOF in a task record outside
evidence/, you may remove exactly that line and re-stage it. Record the file name. Change
nothing else.

Privacy hygiene: the precommit script is the privacy scan.
- Do not print diffs, test bodies, probe sources, seeding code or CSV content through
  the shell.
- For any extra check, use the Grep tool and report masked values only.

If any other check fails, do not commit. Report the file, line and rule.

If any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it; report the denial.

Never write into the repository root. On Windows, never redirect to /dev/null or nul from
a POSIX shell. Keep your text evidence LF, free of trailing whitespace and ending in a
single final newline. Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Harden the OT evidence CSV formula guard and make the smoke pick a free port

- fix(export): a cell whose first non-whitespace character is =, +, - or @, or that
  starts with a tab, CR or LF, is neutralized; other cells unchanged (WP2 carry-forward R2)
- fix(smoke): pick a free loopback port when SMOKE_PORT is unset, time-bound the health
  check, print a FAIL line on every non-zero exit (WP2-A4-01)
- docs(handoff): WP2-ACCEPT result, WP3 plan with owner questions F-1..F-5, WP3-T00 and
  T01 briefs, board, STATE and checkpoint (+ vi)

Task: WP3-T00-FREEZE (first WP3 freeze)

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest, staged count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP3-T00-FREEZE/. Return at most 150 words.

## Attempt 2 (coordinator note)

The coordinator added `branch`, `commit_sha` and `pushed: true` to the board task
WP2-ACCEPT (and `branch`/`commit_sha: null`/`pushed: false` plus the attempt-1 history to
this task). Because ORCHESTRATION.json and this brief changed after staging, re-stage the
same expected set (ORCHESTRATION.json and this brief included), then rerun every check
from `git diff --cached --check` on, including the validator, check_recovery and preflight.
Everything else in this brief is unchanged. Your own evidence directory stays unstaged.

## Results

(Committer appends here.)

Attempt 1 (timesheet-committer, claude-sonnet-5-5): NOT committed.
- Pre-HEAD = origin/main = 3ead61edb1316fe926fe969988f595792590cd41; post-HEAD unchanged;
  no commit SHA; not pushed; branch main.
- Digest 81567e53...1966e2 matches; staged count 23 (23 paths staged, still staged).
- Exits: node 24.21.0 ok; digest 0; precommit-check 0; diff --cached --check 0;
  JSON parse 0; validate_orchestration.py 1.
- Blocker: validate_orchestration.py raised "Commit result incomplete: WP2-ACCEPT"
  (validate_commits, line 203): the board task WP2-ACCEPT lacks commit_sha/pushed.
  check_recovery.py and validate_package.py --preflight not run (stopped at first failure).
- Evidence: handoff/delivery/evidence/WP3-T00-FREEZE/ (untracked, unstaged).
