# WP4-T02-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-T02-FREEZE; package WP4; kind commit;
  attempt 1; depends on WP4-T02.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M (migration and audit attribution source), novelty no. Records in
  English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  a1dc01b98f3c8be7478384adf73d9c194bf9a105. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Call Node 24 by its full portable path; plain `node` resolves v26 here.
  - Make the first shell call a trivial `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP4-T02-FREEZE` for TEMP/TMP and raw output.
  - Delete only files you created; never remove folders recursively.
  - Never open an interactive shell; never kill processes by PID.

## Expected working-tree set

Changed or new paths outside handoff/ may only be among these:
- `src/server/db/migrations/0007_audit_access.ts` (new), `src/server/db/migrations.ts`;
- `src/server/http/auth.ts`, `src/server/routes/api.ts`, `src/server/routes/shares.ts`;
- `src/server/services/`: `audit.ts`, `history.ts`, `sharedActs.ts`, `shares.ts`,
  `timesheetCommands.ts`;
- `src/server/types.ts`;
- `tests/integration/audit-access.test.ts` (new);
- `tests/integration/`: `actor-subject.test.ts`, `history.test.ts`,
  `migrations.test.ts`, `pdf-download.test.ts`, `review-grantee-changes.test.ts`,
  `sharing-matrix.test.ts`.

There must be no change under `.claude/`, docs/, the client, `package.json` or the lock
file.

Recompute the digest with Node 24 (`npm run digest`) immediately before `git add`. It
must equal d6f223a719e06baf1ee24ef630a90af91301d65b53eb727581eb7b6c3dbdfd06.

Handoff files to stage:
- New: handoff/delivery/tasks/WP4-T02.md; this brief (as it stands before you append
  results); every file under handoff/delivery/evidence/WP4-T01-FREEZE/ and WP4-T02/.
- Modified: handoff/delivery/ORCHESTRATION.json; the checkpoint pair;
  handoff/delivery/tasks/WP4-T01-FREEZE.md (its results).

Your appended results and your evidence in handoff/delivery/evidence/WP4-T02-FREEZE/
stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes a file
named `nul`, any `.raw` file, any `.md` under evidence/, any `.pdf`, `.eml` or `.csv`
file, a database, and `mail-capture` or `private-data` content.

## Checks before committing

Run one command per step with Node 24 (by full path), and record each exit code:
1. `node --version`.
2. The digest.
3. `git add` with the explicit paths, as its own command.
4. The precommit check.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator.
8. check_recovery.py.
9. `validate_package.py --preflight`, run with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.

Allowed fixes:
- If `git diff --cached --check` flags only a blank line at EOF in a task record outside
  evidence/, remove exactly that line and re-stage it.
- If the precommit check blocks an email address or the Windows user name in an
  evidence log, replace it with `<email>` or `<user>` in that file only, then re-stage
  and rerun.

When to stop:
- A block in a source or test file stops the commit.
- If any call is denied by a permission check, stop at once; do not retry, split or
  rephrase it.

Never write into the repository root, and never redirect to /dev/null or nul. Do not
print diffs or file bodies. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Record the share marker on audit rows and stop HEAD download audits

- feat(db): migration 0007 adds a nullable audit_events.via_share_id (FK to
  timesheet_shares) with a trigger that rejects a marker whose share does not run
  owner to actor
- feat(sharing): every write through /api/shared and the shared PDF audit record the
  marker; History and the review hint read it, and the legacy operation-code inference
  applies only to unmarked rows before 0007
- fix(sharing): HEAD on the shared PDF returns headers and writes no download audit
- docs(handoff): WP4-T01 freeze result, WP4-T02 records, board and checkpoint (+ vi)

Task: WP4-T02-FREEZE

## Push and report

Push per the profile. Append the following results:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- the digest and the staged count;
- the check exit codes;
- any blockers.

Write evidence to handoff/delivery/evidence/WP4-T02-FREEZE/ as `.txt` only. Return at
most 150 words.

## Attempt 2 (coordinator note)

Attempt 1 stopped correctly with no commit, after a permission check denied a bundled
command that included `git add` of `handoff/delivery/tasks/WP4-T03.md`. The coordinator
had added that file in the middle of the run and asked for it to be staged. That was the
coordinator's mistake.

Do not stage `WP4-T03.md` and do not retry that call. It stays untracked, as a known
coordinator file that the next freeze commits. The 33 paths already staged are exactly
this brief's original set, and every check passed on them in attempt 1.

For attempt 2:
1. Confirm that HEAD and origin/main are still a1dc01b.
2. Confirm that the staged set is the brief's set, with `WP4-T03.md` unstaged.
3. Rerun each check as its own command: the digest, the precommit check,
   `git diff --cached --check`, JSON parse, the orchestration validator,
   check_recovery.py and the preflight. The board, the checkpoint pair and this brief
   changed after attempt 1. Re-stage exactly those paths by explicit path, in their own
   `git add` command:
   - handoff/delivery/ORCHESTRATION.json;
   - handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md;
   - handoff/delivery/tasks/WP4-T02-FREEZE.md.
4. Commit and push.

If any call is denied, stop and report.

## Results

(Committer appends here.)

Attempt 2 results: pre-HEAD a1dc01b; commit 37f1be240f6f8931105cb9af0ae6fa56f2dfb333;
pushed to origin main, remote SHA 37f1be2 (same). Digest d6f223a7...dfd06; staged 33;
WP4-T03.md left untracked. Exit codes: precommit 0, diff --check 0, JSON 0, validator 0,
check_recovery 0, preflight 0. Blockers: none. Evidence: evidence/WP4-T02-FREEZE/.
