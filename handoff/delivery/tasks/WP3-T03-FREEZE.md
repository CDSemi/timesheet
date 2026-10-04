# WP3-T03-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T03-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-T03.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy: recipient handling, synthetic addresses in tests, evidence
  scripts), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  b060d330960bddaa2b98a80444775e67c55eac01. If either differs, stop and report.
- Push after the commit.

## Expected working-tree set

Source and tests: changed or new paths outside handoff/ may only be among these:
- new: src/domain/emailTemplate.ts, src/server/services/submissionSettings.ts,
  src/server/routes/settings.ts, tests/domain/email-template.test.ts and
  tests/integration/submission-settings.test.ts;
- modified: src/server/http/schemas.ts, src/server/app.ts and
  tests/integration/ot-api.test.ts (a reported deviation: the route allowlist).

Compute the digest with Node 24 (`scripts/source-digest.mjs` or `npm run digest`) and
record it. The worker reported
22acf6c41a10b84cc4564ee3ca290210f642ccc933609508f1a54f56babf54bd; a different value stops
the commit.

New handoff files:
- handoff/delivery/tasks/: WP3-T03-FREEZE.md and WP3-T04.md.
- Every file under handoff/delivery/evidence/WP3-T03/ (including the `*.py.txt`
  scripts).

Modified or new handoff files:
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/: WP3-T02-FREEZE.md and WP3-T03.md.
- Every file under handoff/delivery/evidence/WP3-T02-FREEZE/.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP3-T03-FREEZE/;
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
- Do not print diffs, test bodies, probe sources, addresses or CSV content through the
  shell.
- For any extra check, use the Grep tool and report masked values only.

If any other check fails, do not commit. Report the file, line and rule.

If any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it; report the denial.

Never write into the repository root. On Windows, never redirect to /dev/null or nul from
a POSIX shell. Keep your text evidence LF, free of trailing whitespace and ending in a
single final newline. Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add per-user submission settings, a safe email template engine and validated
recipients

- feat(domain): email template engine with a closed variable set, 422 on an unknown
  variable, HTML escaping and single-line subject values; validated, de-duplicated
  recipients
- feat(api): owner-only /api/settings/submission routes: append-only versions with a
  stale check, per-user auto-submit effective instant, audited auto-image authorize and
  revoke on an own signature, write-free preview
- test: 110 new tests; 18 mutations caught
- docs(handoff): WP3-T02 freeze result, WP3-T03 record and evidence, WP3-T04 brief, board
  and checkpoint (+ vi)

Task: WP3-T03-FREEZE

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest, staged count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP3-T03-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)
