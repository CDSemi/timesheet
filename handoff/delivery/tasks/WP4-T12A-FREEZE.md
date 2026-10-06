# WP4-T12A-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-T12A-FREEZE; package WP4; kind commit;
  attempt 1; depends on WP4-T12A.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M (restore safety and CLI source), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  dd1422fbd8de53791e6fa9d6b8d8741f1f484488. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Call Node 24 by its full portable path; plain `node` resolves v26.
  - Make the first shell call a trivial `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP4-T12A-FREEZE` for TEMP/TMP and raw output.
  - Delete only files you created; never remove folders recursively.
  - Never open an interactive shell, and never kill processes by PID.
  - Never redirect to /dev/null or nul, including after `git add`.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the changed or new paths may only be these:
- `scripts/container-drill.mjs`;
- `src/server/ops/restore.ts` and `src/server/cli.ts`;
- `tests/integration/restore.test.ts`;
- `tests/integration/upgrade.test.ts` (new);
- `tests/support/schemaV6.ts` (new).

Also confirm the following, using the Grep tool or `git diff --name-only` and printing
no file bodies:
- nothing changed under `reference/`, `.claude/`, docs/ or `src/client/`;
- no migration file changed;
- `package.json` and `package-lock.json` are unchanged.

Recompute the digest with Node 24 (`npm run digest`) immediately before `git add`. It
must equal e6bb47fde0ad7960b9bf7fab5a02fc169f399224eb38a61d6b9ce7866d746bdd.

Handoff files to stage:
- New:
  - `handoff/delivery/tasks/WP4-T12A.md`;
  - this brief, as it stands before you append results;
  - every file under `handoff/delivery/evidence/WP4-T12A/` and
    `handoff/delivery/evidence/WP4-T08-FREEZE/`.
- Modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP4-T08-FREEZE.md` (its results).

Your appended results and your evidence in `handoff/delivery/evidence/WP4-T12A-FREEZE/`
stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.db`, `.sqlite` or other database file;
- any `.md` file under `evidence/`;
- `mail-capture`, `private-data` or drill work-folder content.

## Checks before committing

Run one command per step with Node 24 (by full path), and record each exit code:
1. `node --version`.
2. The digest.
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator.
8. `check_recovery.py`.
9. `validate_package.py --preflight` with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.

Allowed fixes:
- If `git diff --cached --check` flags only a blank line at EOF in a task record outside
  `evidence/`, remove exactly that line and re-stage it.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log, replace it with `<email>` or `<user>` in that file only, then re-stage and rerun.

When to stop:
- A block in a source, test or script file stops the commit.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Never write into the repository root. Do not print diffs or file bodies. Keep evidence
LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add upgrade and rollback drill stages, a rollback restore mode and an upgrade test

- feat(ops): drill stage 4 builds a schema-6 database with the accepted WP3 build
  (`--wp3 <dir>`).
  - It takes the paired backup with the unchanged backup tool, then upgrades in the
    current image to the latest schema, read from `/api/ready`.
  - The migrations apply once; a restart and `migrate` apply nothing.
  - Integrity, FKs, rows, balances and revisions are unchanged.
- feat(ops): drill stage 5 covers the rollback.
  - The WP3 build's `migrate` refuses the upgraded DB.
  - `cli.js restore --keep-schema` restores the paired backup without migrating. It
    refuses without `--confirm` on a schema that has no outbound pause.
  - It holds queued and leased sends and marks sending attempts uncertain, writes an
    audit event, and warns to start the old build with `JOB_RUNNER=off`.
  - The WP3 server on the restored data makes no send attempt; a control copy without
    the hold does send.
- test(ops): upgrade.test.ts (10 tests) and 6 restore tests, written red-first. Three
  mutations are killed. A shared schema-6 fixture is added.
- docs(handoff): WP4-T08 freeze result, WP4-T12A records, board and checkpoint (+ vi).

Task: WP4-T12A-FREEZE

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest and staged count;
- the scope checks;
- check exit codes;
- any blockers.

Write evidence to `handoff/delivery/evidence/WP4-T12A-FREEZE/` as `.txt` files only.
Return at most 150 words, beginning with your self-reported model.

## Results

(Committer appends here.)
