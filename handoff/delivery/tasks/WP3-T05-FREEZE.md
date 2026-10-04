# WP3-T05-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T05-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-T05.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (finalization and ledger code; synthetic names and signatures in tests;
  evidence scripts), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  c289375a8d80c78ea9f3a9e54ff55a795f99ec7b. If either differs, stop and report.
- Push after the commit.
- The B: scratch drive is nearly full. Keep temporary output small; if a write fails for
  lack of space, stop and report.

## Expected working-tree set

Source and tests: changed or new paths outside handoff/ may only be among these:
- new: src/server/services/finalization.ts, src/server/services/revisionLedger.ts,
  tests/integration/finalization.test.ts and
  tests/integration/finalization-concurrency.test.ts;
- modified: src/server/routes/submission.ts, src/server/http/schemas.ts,
  tests/support/concurrency.ts and tests/integration/ot-api.test.ts (a reported deviation:
  one route-inventory line).

Recompute the digest with Node 24 (`scripts/source-digest.mjs` or `npm run digest`)
immediately before `git add` and record it. The worker reported
c380f3025d8bf4e8ee85fd9280118c5913fa58baf51e6d75e18dcc356602f57e; a different value stops
the commit.

New handoff files:
- handoff/delivery/tasks/: WP3-T05.md, WP3-T05-FREEZE.md, WP3-T06.md and WP3-REQ.md.
- Every file under handoff/delivery/evidence/WP3-T05/ and
  handoff/delivery/evidence/WP3-REQ/ (including `*.py.txt` scripts).

Modified or new handoff files:
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/WP3-T07-FREEZE.md.
- Every file under handoff/delivery/evidence/WP3-T07-FREEZE/.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP3-T05-FREEZE/;
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

Subject: Add the atomic manual sign-off finalization with persisted ledger outcomes

- feat(submission): POST /api/timesheets/:payrollDate/signoff runs one IMMEDIATE
  transaction: review hash and version check (409), name/signature/acknowledgement checks
  (422), signed revision with the real signed_at, ledger posting only through ledger.ts
  with revision-independent day keys, every outcome in revision_ledger_lines (pending
  debits persisted, F-2), finalized_revision_no, PDF and send job rows, audit; identical
  retries replay
- feat(api): finalization and pending-line read routes for the owner
- test: 24 new tests; a 20-round sign-off race (one winner each round); 13 mutations
  caught
- docs(handoff): WP3-T07 freeze result, WP3-REQ impact plan and owner questions, WP3-T05
  record and evidence, WP3-T06 brief, board and checkpoint (+ vi)

Task: WP3-T05-FREEZE

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest, staged count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP3-T05-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)
