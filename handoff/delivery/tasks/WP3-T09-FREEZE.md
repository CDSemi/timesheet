# WP3-T09-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T09-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-T09.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (mail transport code, synthetic SMTP credentials in tests, new
  dependencies and lockfile, evidence scripts), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  3d7a17c3a0eecb10726eaf1378fbab537ec67ef5. If either differs, stop and report.
- Push after the commit.
- Scratch space: make the first shell call a trivial `node --version` (Node 24 by full
  path); if it fails with ENOSPC or "temp filesystem … is full", stop at once and report.
  Use `D:\timesheet-tmp\WP3-T09-FREEZE` (owner-authorized, outside Dropbox) for TEMP/TMP;
  delete only files you created; never remove folders recursively.

## Expected working-tree set

Source and tests: changed or new paths outside handoff/ may only be among these:
- modified: package.json and package-lock.json;
- new: src/server/mail/outbound.ts, src/server/mail/message.ts,
  src/server/mail/captureAdapter.ts, src/server/mail/smtpAdapter.ts,
  src/server/jobs/sendJob.ts, src/server/services/deliveries.ts,
  tests/integration/delivery.test.ts, tests/integration/delivery-crash.test.ts and
  tests/support/smtpSink.ts;
- modified: src/server/jobs/runner.ts, src/server/routes/submission.ts, and the reported
  deviations src/server/index.ts, src/server/cli.ts, tests/integration/ot-api.test.ts and
  tests/integration/jobs-restart.test.ts.

Lockfile check (Grep tool, masked output): the package.json dependency changes are only
`nodemailer` (runtime) and `smtp-server` and `@types/smtp-server` (dev). The worker
reported that the lockfile only adds entries (including `@types/nodemailer`,
`punycode.js` and `ipv6-normalize`); any removed or downgraded package stops the commit.

Secret check: the precommit script must report no finding in the new tests (the synthetic
SMTP credentials are built at run time). A precommit block in a source or test file
stops the commit.

Recompute the digest with Node 24 (`scripts/source-digest.mjs` or `npm run digest`)
immediately before `git add` and record it. The worker reported
5e7e6b40f2e33885136b5560741fb361a4d6b260d255427ea585b66f3fd87e8d; a different value stops
the commit.

New handoff files:
- handoff/delivery/tasks/: WP3-T09.md and WP3-T09-FREEZE.md.
- Every file under handoff/delivery/evidence/WP3-T09/ (including `*.py.txt` scripts).

Modified or new handoff files:
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/WP3-T08-FREEZE.md.
- Every file under handoff/delivery/evidence/WP3-T08-FREEZE/.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP3-T09-FREEZE/;
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
- JSON parse of ORCHESTRATION.json and package.json;
- the orchestration validator;
- check_recovery.py;
- `validate_package.py --preflight` with the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
  Write `<user>` in the evidence.

If `git diff --cached --check` flags only a blank line at EOF in a task record outside
evidence/, you may remove exactly that line and re-stage it. Record the file name. Change
nothing else. If the precommit check masks a user-profile path in an evidence log, that
is allowed.

Privacy hygiene: the precommit script is the privacy and secret scan.
- Do not print diffs, test bodies, probe sources, credentials, addresses or CSV content
  through the shell.
- For any extra check, use the Grep tool and report masked values only.

If any other check fails, do not commit. Report the file, line and rule.

If any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it; report the denial.

Never write into the repository root. On Windows, never redirect to /dev/null or nul from
a POSIX shell. Keep your text evidence LF, free of trailing whitespace and ending in a
single final newline. Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add capture and SMTP adapters, the send job and uncertain-delivery decisions

- feat(mail): deterministic message from the frozen snapshot and the stored PDF (hash
  re-checked); capture adapter by default; SMTP adapter only with OUTBOUND_MODE=smtp and
  the owner-only production flag, TLS required, credentials never logged
- feat(jobs): send job commits `sending` before the network call and classifies
  outcomes (temporary retried, permanent and uncertain to intervention, uncertain never
  retried automatically); recovery of interrupted sends
- feat(api): owner-only delivery history and POST /api/deliveries/:id/decision
  (mark delivered or resend through the same-revision resend)
- build(deps): nodemailer 10.0.14; dev smtp-server 3.19.17 and @types/smtp-server 3.5.13
- test: 25 new tests with a loopback SMTP sink and child-process crash cases; 4
  mutations caught; jobs-restart assertions updated for the registered send job
- docs(handoff): WP3-T08 freeze result, WP3-T09 brief, record and evidence, board and
  checkpoint (+ vi)

Task: WP3-T09-FREEZE

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest, staged count, lockfile package count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP3-T09-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)
