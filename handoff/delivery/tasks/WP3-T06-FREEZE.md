# WP3-T06-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T06-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-T06.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (ledger code, correction tests with synthetic data, evidence scripts),
  novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  72f1920fce178b95a9d51e665d69af3fd05117f4. If either differs, stop and report.
- Push after the commit.
- The B: scratch drive is nearly full. Keep temporary output small; if a write fails for
  lack of space, stop and report.

## Expected working-tree set

Source and tests: changed or new paths outside handoff/ may only be among these:
- new: tests/integration/corrections.test.ts;
- modified: src/server/services/finalization.ts, src/server/services/revisionLedger.ts,
  src/server/services/ledger.ts, src/server/routes/submission.ts,
  src/server/http/schemas.ts, tests/integration/ledger.test.ts and
  tests/integration/ot-api.test.ts (a reported deviation: three route-inventory lines).

Recompute the digest with Node 24 (`scripts/source-digest.mjs` or `npm run digest`)
immediately before `git add` and record it. The worker reported
b47d30daad1f89b00a06818d6294a20fbaf5dcddaa948701b17ce58775b1f57a; a different value stops
the commit.

New handoff files:
- handoff/delivery/tasks/: WP3-T06-FREEZE.md and WP3-T08.md.
- Every file under handoff/delivery/evidence/WP3-T06/ (including `*.py.txt` scripts).

Modified or new handoff files:
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/: WP3-T05-FREEZE.md and WP3-T06.md.
- Every file under handoff/delivery/evidence/WP3-T05-FREEZE/.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP3-T06-FREEZE/;
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

Subject: Add correction revisions, late review and same-revision resend

- feat(submission): correction revisions need a reason and post only differences: a
  revision-specific correction key for days with a posted original, a first credit or
  debit for days without one; pending increases recorded (F-2)
- fix(ledger): the correction duplicate check compares sourceRef (WP2 carry-forward R1)
- feat(submission): late review of an automatic revision signs with zero ledger delta and
  an explicit send choice; resend creates a new attempt on the same revision without
  ledger movement and is refused while a send is open or the envelope changed
- test: 57 tests in the touched suites; 19 mutations caught
- docs(handoff): WP3-T05 freeze result, WP3-T06 record and evidence, WP3-T08 brief, board
  and checkpoint (+ vi)

Task: WP3-T06-FREEZE

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest, staged count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP3-T06-FREEZE/. Return at most 150 words.

## Attempt 2 (coordinator note)

Attempt 1 stopped because the first shell call failed with ENOSPC (the B: drive holding
Claude Code's task output was full). Nothing was staged.

- Make the first shell call a trivial one (`node --version` with Node 24 by full path). If
  it fails with ENOSPC or "temp filesystem … is full", stop at once and report; do not
  retry.
- The owner authorized a temporary work folder on D: outside Dropbox. Use
  `D:\timesheet-tmp\WP3-T06-FREEZE` for TEMP/TMP and any temporary file you need (create
  it, remove it afterwards). Never use a folder under D:\Dropbox for temporary files.
- The expected set additionally includes your attempt-1 note if you wrote one (none was
  written). Everything else in this brief is unchanged; recompute the digest immediately
  before `git add`.

## Results

(Committer appends here.)
