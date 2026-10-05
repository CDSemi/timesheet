# WP3-T13B-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T13B-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-T13B.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (authorization code for sharing, migration, evidence scripts), novelty
  no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  5b90d30d7e4b5410770b01d04bd9ff8ee2663149. If either differs, stop and report.
- Push after the commit.
- Scratch space: make the first shell call a trivial `node --version` (Node 24 by full
  path); if it fails with ENOSPC or "temp filesystem … is full", stop at once and report.
  Use `D:\timesheet-tmp\WP3-T13B-FREEZE` (owner-authorized, outside Dropbox) for
  TEMP/TMP; delete only files you created; never remove folders recursively.

## Expected working-tree set

Source and tests: changed or new paths outside handoff/ may only be among these:
- new: src/server/db/migrations/0006_timesheet_shares.ts, src/server/services/shares.ts,
  src/server/routes/shares.ts, tests/integration/sharing.test.ts and
  tests/integration/sharing-matrix.test.ts;
- modified: src/server/db/migrations.ts, src/server/app.ts, src/server/http/auth.ts,
  src/server/services/history.ts, src/server/services/users.ts,
  src/server/routes/admin.ts, src/server/routes/api.ts, src/server/routes/ot.ts,
  src/server/routes/submission.ts, tests/integration/history.test.ts,
  tests/integration/isolation.test.ts, tests/integration/migrations.test.ts, and the
  reported deviation tests/integration/ot-api.test.ts.

Recompute the digest with Node 24 (`scripts/source-digest.mjs` or `npm run digest`)
immediately before `git add` and record it. The worker reported
f3df3b86f5d0008f838f593aafd26631e93b3a476831744e3f9fad56809548ab; a different value stops
the commit.

Handoff files:
- new: handoff/delivery/tasks/WP3-T13B-FREEZE.md, WP3-T13C.md and WP3-T14.md; every file
  under handoff/delivery/evidence/WP3-T13B/ (including `*.py.txt` scripts);
- modified or new: handoff/delivery/ORCHESTRATION.json;
  handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md;
  handoff/delivery/tasks/: WP3-T13-FREEZE.md and WP3-T13B.md; every file under
  handoff/delivery/evidence/WP3-T13-FREEZE/.

Allowed but not staged: your own files in handoff/delivery/evidence/WP3-T13B-FREEZE/ and
the results you append to this brief after the commit.

Any other changed or untracked path stops the commit; report it. That includes a file
named `nul`, any `.pdf`, `.eml` or image file, a database, `mail-capture` or
`private-data` content, any `.csv` file and any other source file.

## Checks before committing

Run one command per step with Node 24 (by full path) and record each exit code:
`node --version`; the digest; `git add` with the explicit paths (its own command); the
precommit check; `git diff --cached --check`; JSON parse of ORCHESTRATION.json; the
orchestration validator; check_recovery.py; `validate_package.py --preflight` with the
workflow Python
`C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
(write `<user>` in the evidence).

If `git diff --cached --check` flags only a blank line at EOF in a task record outside
evidence/, you may remove exactly that line and re-stage it; record the file name. If the
precommit check masks a user-profile path in an evidence log, that is allowed; a block in
a source or test file stops the commit. Do not print diffs, test bodies, probe sources,
names, addresses or CSV content through the shell; use the Grep tool with masked output
for any extra check. If any other check fails, do not commit; report the file, line and
rule. If any call is denied by a permission check, stop at once; do not retry, split or
rephrase it. Never write into the repository root; on Windows never redirect to
/dev/null or nul from a POSIX shell. Keep your evidence LF, free of trailing whitespace,
single final newline. Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add owner-granted timesheet sharing with live per-item access

- feat(db): migration 0006 timesheet_shares with per-item columns (timesheets
  none/view/edit, OT read-only, final PDF download), one active share per pair, no
  deletes, revoke once
- feat(api): /api/shares to grant, change, revoke and leave (audited; generic 422 for an
  unknown grantee, rate-limited); admin list and revoke, never create
- feat(auth): allowlisted /api/shared/:ownerId mount over 17 routes with a live share
  check on every request and a re-check inside each write transaction; never-shared
  actions stay unreachable; grantee PDF downloads audited
- feat(api): owner-only GET /api/revisions (status fields only); history names the
  grantee for events under a share
- test: route-inventory matrix (11 item sets x 17 routes plus 31 never-shared paths),
  revocation race, 10 mutations caught
- docs(handoff): WP3-T13 freeze result, WP3-T13B record and evidence, WP3-T13C and
  WP3-T14 briefs, board and checkpoint (+ vi)

Task: WP3-T13B-FREEZE

## Attempt 2 (coordinator note)

Attempt 1 stopped: the precommit check blocked an email address in
handoff/delivery/evidence/WP3-T13B/02-red.txt line 655 (an evidence log, not source).

- You are authorized to mask email addresses in the files under
  handoff/delivery/evidence/WP3-T13B/ only: replace each email-address token with
  `<email>` and change nothing else in those files. First count the matches with the
  Grep tool (report counts and file:line only, never the addresses), then edit, then
  confirm with the Grep tool that none remain.
- Do not touch any source or test file; if a source or test file holds a blocked
  address, stop and report it.
- Then re-stage the whole expected set (explicit paths, one command) and rerun every
  check from the digest on in the listed order. Record the masking (files, line numbers,
  count) in your evidence.

## Push and report

Push per the profile. Append: pre- and post-HEAD; commit SHA, pushed, remote SHA;
digest, staged count; check exits; blockers. Evidence in
handoff/delivery/evidence/WP3-T13B-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)

Attempt 1 (committer, claude-sonnet-5-5): NOT COMMITTED. HEAD = origin/main = 5b90d30 (unchanged).
Node v24.21.0; digest f3df3b86... matched; 38 paths staged (git add exit 0).
precommit-check exit 1: BLOCK email, evidence/WP3-T13B/02-red.txt line 655 (email-like
address, 19 chars). Not a profile-path finding, so the masking exception does not apply.
git diff --cached --check exit 0. Remaining checks not run. Staged set left in the index.
