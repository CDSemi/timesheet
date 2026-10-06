# WP4-T12-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-T12-FREEZE; package WP4; kind commit;
  attempt 1; depends on WP4-T12.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L (the drill script and a test), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  61bf524a53368ac1373ec9fe41f6cc550dc6c68b. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, or any interactive shell.
  - Call Node 24 by its full portable path, and make the first shell call a trivial
    `node --version`. Stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP4-T12-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID, and never redirect to /dev/null or nul.
  - Delete only files you created; never remove folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the only changed paths may be `scripts/container-drill.mjs` and
`tests/integration/upgrade.test.ts`. Any other changed or untracked path outside
handoff/ stops the commit.

Also confirm with `git diff --name-only`:
- nothing changed under `src/`, `.claude/`, docs/, `reference/` or `tests/support/`;
- `package.json` is unchanged;
- no `.xlsx` file is untracked or staged.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
de0e215be7594852bf0c26b22438ead5afcacb529187100549047b1ab408f41b (772 files).

Handoff files to stage:
- New:
  - `handoff/delivery/tasks/WP4-T13.md`;
  - this brief, as it stands before you append results;
  - every file under `handoff/delivery/evidence/WP4-T12/` and
    `handoff/delivery/evidence/WP4-T11-FREEZE/`.
- Modified:
  - `handoff/delivery/tasks/WP4-T12.md` (its results);
  - `handoff/delivery/tasks/WP4-T11-FREEZE.md` (its results);
  - `handoff/delivery/ORCHESTRATION.json`;
  - the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in `handoff/delivery/evidence/WP4-T12-FREEZE/`
stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any drill work folder, backup folder, `manifest.json`, `.raw`, `.xlsx`, `.pdf`,
  `.eml`, `.csv` or database file;
- any `.md` file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP4-T12-FREEZE/checks.txt`.
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

Do not print diffs or file bodies. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Run the full operations drill with workbook import, opening balance and import-source backups

- test(ops): drill stage 6 runs inside the container.
  - A synthetic workbook is previewed, decided and committed. The identical commit is
    a no-op across eight tables.
  - The opening balance posts once, an imported period refuses sign-off, and another
    user gets 404.
- test(ops): stages 2–4 now check the following:
  - import sources are in the backup and the restore;
  - `backup prune --dry-run` removes nothing;
  - the restored instance stays paused;
  - the upgrade from WP3 schema 6 reaches 13.
- test(ops): stages 1–6 pass with 205 checks; `upgrade.test.ts` gains 3 tests for
  migrations 0011–0013.
- docs(handoff): WP4-T12 records, the WP4-T13 brief, the WP4-T11 freeze result, board
  and checkpoint (+ vi).

Task: WP4-T12-FREEZE

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest and staged count;
- the scope checks;
- check exit codes;
- any blockers.

Return at most 150 words, beginning with your self-reported model.

## Results

- Pre-HEAD 61bf524a53368ac1373ec9fe41f6cc550dc6c68b (= origin/main); post-HEAD and commit SHA 0f6abdf77c313f2dcb45bf624ee56294e5976c78 on main; pushed: yes; remote SHA 0f6abdf77c313f2dcb45bf624ee56294e5976c78.
- Digest de0e215be7594852bf0c26b22438ead5afcacb529187100549047b1ab408f41b (772 files); staged 17.
- Scope: only scripts/container-drill.mjs and tests/integration/upgrade.test.ts changed outside handoff/; nothing under src/, .claude/, docs/, reference/, tests/support/; package.json unchanged; no .xlsx.
- Node: bare PATH node was v26.10.0; all checks used the full portable path (v24.21.0).
- Check exit codes: digest 0, add 0, precommit 0, diff --check 0, JSON parse 0, validate_orchestration 0, check_recovery 0, validate_package --preflight 0. Evidence: evidence/WP4-T12-FREEZE/checks.txt.
- Blockers: none. No masking or other fixes needed.
