# WP3-T04-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T04-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-T04 and WP3-TMPCLEAN.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy: review payload with employee name and recipients in synthetic
  tests, evidence scripts), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  79862bba6ea8f8077e26dd043dc0aa03b21b6594. If either differs, stop and report.
- Push after the commit.
- The B: scratch drive has only about 22 MB free. Keep temporary output small; if a write
  fails for lack of space, stop and report.

## Expected working-tree set

Source and tests: changed or new paths outside handoff/ may only be among these:
- new: src/domain/canonical.ts, src/domain/snapshot.ts,
  src/server/services/reviewPayload.ts, src/server/routes/submission.ts,
  tests/domain/canonical.test.ts and tests/integration/review-payload.test.ts;
- modified: src/server/app.ts.

Compute the digest with Node 24 (`scripts/source-digest.mjs` or `npm run digest`) and
record it. The worker reported
69e790e0173236b2deab9aec9d43c72f1904731f03e4a1e5a5c14d231051fc92; a different value stops
the commit.

New handoff files:
- handoff/delivery/tasks/: WP3-T04-FREEZE.md and WP3-TMPCLEAN.md.
- Every file under handoff/delivery/evidence/WP3-T04/ (including the `*.py.txt`
  scripts) and handoff/delivery/evidence/WP3-TMPCLEAN/.

Modified or new handoff files:
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/: WP3-T03-FREEZE.md and WP3-T04.md.
- Every file under handoff/delivery/evidence/WP3-T03-FREEZE/.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP3-T04-FREEZE/;
- the results you append to this brief after the commit.

Any other changed or untracked path stops the commit; report it. That includes a file
named `nul`, any image file, any database or `private-data` content, any `.csv` file and
any other source file.

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

Subject: Add the canonical review snapshot, its SHA-256 and a write-free review route

- feat(domain): canonical JSON (stable keys, integer minutes, ISO dates, UTC instants,
  NFC) and SHA-256
- feat(api): GET /api/timesheets/:payrollDate/review returns the snapshot built from the
  existing engine (14 days, versions, zone, proposals, reservations, recipients and
  rendered email, signature reference, template version, show-OT flag), its hash and the
  expected version; writes nothing
- test: 57 new tests; 16 mutations caught
- chore(handoff): remove only this project's unused temp directories on the scratch
  drive (WP3-TMPCLEAN)
- docs(handoff): WP3-T03 freeze result, WP3-T04 record and evidence, board and checkpoint
  (+ vi)

Task: WP3-T04-FREEZE

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest, staged count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP3-T04-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)
