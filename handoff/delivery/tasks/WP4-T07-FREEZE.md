# WP4-T07-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-T07-FREEZE; package WP4; kind commit;
  attempt 1; depends on WP4-T07.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M (admin status source, UI, synthetic screenshots), novelty no. Records in
  English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  72ab2ed134c26656643eb00542e54a94bb07a4c7. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Call Node 24 by its full portable path; plain `node` resolves v26 here.
  - Make the first shell call a trivial `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP4-T07-FREEZE` for TEMP/TMP and raw output.
  - Delete only files you created; never remove folders recursively.
  - Never open an interactive shell; never kill processes by PID.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, changed or new paths may only be among these:
- `src/server/jobs/sweepJob.ts` (new), `src/server/services/operationsStatus.ts`,
  `src/server/routes/admin.ts`, `src/server/jobs/runner.ts`;
- `src/client/components/OperationsStatus.tsx`, `src/client/components/adminModel.ts`,
  `src/client/styles.css`, `src/client/api.ts`;
- `tests/integration/jobs-sweep.test.ts` (new), `tests/integration/operations-status.test.ts`,
  `tests/integration/delivery.test.ts`, `tests/integration/jobs-restart.test.ts`;
- `tests/client/adminModel.test.ts`;
- `tests/e2e/admin-status.spec.ts`, `tests/e2e/automation.spec.ts`.

No change may touch `.claude/`, docs/, migrations, `package.json` or the lock file.

Recompute the digest with Node 24 (`npm run digest`) immediately before `git add`. It
must equal cc86af8ac8ab66689f0f4bd870475f1e9460fa3e2036e5885036307837dbb9d3.

Handoff files to stage:
- New:
  - `handoff/delivery/tasks/WP4-T07.md`;
  - this brief, as it stands before you append results;
  - every file under `handoff/delivery/evidence/WP4-T06-FREEZE/` and `WP4-T07/`,
    including the two `*-synthetic.png` screenshots.
- Modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - the checkpoint pair;
  - `handoff/delivery/tasks/WP4-T06-FREEZE.md` (its results).

Your appended results and your evidence in `handoff/delivery/evidence/WP4-T07-FREEZE/`
stay unstaged.

Any other changed or untracked path stops the commit; report it. This includes:
- a file named `nul`;
- any `.raw` file;
- any `.md` file under `evidence/`;
- any `.pdf`, `.eml`, `.csv` or database file;
- `mail-capture` or `private-data` content.

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
9. `validate_package.py --preflight` with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.

View the two screenshots with the Read tool. They must show synthetic data only.

Allowed fixes:
- If `git diff --cached --check` flags only a blank line at EOF in a task record outside
  `evidence/`, remove exactly that line and re-stage it.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log, replace it with `<email>` or `<user>` in that file only, then re-stage and rerun.

A block in a source or test file stops the commit. If any call is denied by a permission
check, stop at once. Do not retry, split or rephrase it.

Never write into the repository root, and never redirect to /dev/null or nul. Do not
print diffs or file bodies. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Show backup, disk and outbound pause status to admins and schedule the orphan sweep

- feat(admin): the operations status reports the last backup's outcome and age, the data
  volume's free and total space, and the outbound mode and pause with held, queued and
  awaiting counts. It holds counts only, under an exact key allowlist.
- feat(jobs): a daily orphan sweep keyed by UTC day removes only unreferenced files
  older than 24 h. It reports counts and is not held by the outbound pause.
- feat(client): the status panel gains a backup-age warning, disk space and a pause
  banner (E-8 tokens), with synthetic desktop and mobile screenshots.
- test: sweep and status tests. The job-claim expectations in the delivery,
  jobs-restart and automation tests now include the sweep.
- docs(handoff): WP4-T06 freeze result, WP4-T07 records, board and checkpoint (+ vi).

Task: WP4-T07-FREEZE

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- the digest and the staged count;
- the screenshot check;
- the check exit codes;
- any blockers.

Write evidence to `handoff/delivery/evidence/WP4-T07-FREEZE/` as `.txt` files only.
Return at most 150 words.

## Results

- Pre-HEAD 72ab2ed134c26656643eb00542e54a94bb07a4c7; post-HEAD e1d97bd298949020d2c7aadb9733a1a8acc98ebb.
- Pushed to origin main; remote SHA e1d97bd298949020d2c7aadb9733a1a8acc98ebb.
- Digest cc86af8ac8ab66689f0f4bd870475f1e9460fa3e2036e5885036307837dbb9d3 (matches); staged 31 files.
- Screenshots: both viewed, synthetic data only.
- Exit codes (Node v24.21.0): precommit 0, diff --check 0, JSON 0, orchestration validator 0, check_recovery 0, preflight 0.
- Blockers: none. Evidence: evidence/WP4-T07-FREEZE/.
