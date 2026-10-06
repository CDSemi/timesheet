# WP4-DEC-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-DEC-FREEZE; package WP4; kind commit;
  attempt 1; depends on WP4-DEC.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L (canonical docs only), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  0f989e4499867ed05c0da5f73cb39db80634c663. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Call Node 24 by its full portable path; plain `node` resolves v26.
  - Make the first shell call a trivial `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP4-DEC-FREEZE` for TEMP/TMP and raw output.
  - Never use `cmd.exe` (with or without `/c`) or any interactive shell.
  - Never kill processes by PID.
  - Never redirect to /dev/null or nul.
  - Delete only files you created; never remove folders recursively.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the changed paths may only be these six:
- `docs/03_ARCHITECTURE_AND_DATA.md` and `.vi.md`;
- `docs/07_DEPLOYMENT_AND_OPERATIONS.md` and `.vi.md`;
- `docs/10_DECISIONS_AND_SOURCES.md` and `.vi.md`.

Also confirm, using `git diff --name-only` and printing no file bodies, that nothing
changed under `src/`, `tests/`, `scripts/`, `reference/` or `.claude/`, and that
`package.json` is unchanged. The skill `.claude/skills/readme-md/` must still be
present and unchanged; its removal is a later GOV task.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs` or `npm run digest`
run from Git Bash, never through cmd.exe) immediately before `git add`. It must equal
65247d70f5569f09dda4d328b455a4e39836223f81de5227a3f19a83bd64c23c.

Handoff files to stage:
- New:
  - `handoff/delivery/tasks/WP4-DEC.md`;
  - this brief, as it stands before you append results;
  - `handoff/delivery/evidence/WP4-DEC/checks.txt`;
  - every file under `handoff/delivery/evidence/WP4-T12A-FREEZE/`.
- Modified:
  - `handoff/delivery/ORCHESTRATION.json` and `handoff/delivery/STATE.json`;
  - `handoff/NEXT_ACTION.md` and `handoff/NEXT_ACTION.vi.md`;
  - the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP4-T12A-FREEZE.md` (its results).

Your appended results and your evidence in `handoff/delivery/evidence/WP4-DEC-FREEZE/`
stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv` or database file;
- any `.md` file under `evidence/`.

## Checks before committing

Run one command per step with Node 24 (by full path), and record each exit code:
1. `node --version`.
2. The digest.
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json and STATE.json.
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
- A block in a docs file stops the commit.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Never write into the repository root. Do not print diffs or file bodies. Keep evidence
LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Record the owner's WP4 decisions on import, opening balance and retention

- docs(architecture): add the section "Imports, opening balance and retention" to
  docs/03 (+ vi).
  - Each person imports only their own workbook.
  - Imported periods post no ledger events and cannot be signed or submitted.
  - The opening balance is signed non-zero minutes, one per user, as a new ledger
    entry type.
  - Never-configured accounts show a "not set up" flag.
  - Succeeded scan job rows are deleted after 30 days.
  - The API route list no longer suggests administrator import.
- docs(operations): docs/07 (+ vi) now says:
  - no application session secret (line 9);
  - backup retention of 7 daily, 4 weekly and 6 monthly in tool-created folders
    (line 26);
  - sends from a backup are held after a restore, and a rollback runs the old build with
    `JOB_RUNNER=off` until reconciled (line 32);
  - the import rules (line 46).
- docs(decisions): docs/10 (+ vi) records the owner's F-1..F-6 decisions and the
  coordinator decisions on held sends and the rollback restore.
- docs(handoff): WP4-T12A freeze result, WP4-DEC records, board, STATE, NEXT_ACTION and
  checkpoint (+ vi).

Task: WP4-DEC-FREEZE

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest and staged count;
- the scope checks;
- check exit codes;
- any blockers.

Write evidence to `handoff/delivery/evidence/WP4-DEC-FREEZE/` as `.txt` files only.
Return at most 150 words, beginning with your self-reported model.

## Results

(Committer appends here.)
