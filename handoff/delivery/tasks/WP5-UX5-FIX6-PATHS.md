# WP5-UX5-FIX6-PATHS lookup brief (state before the freeze of FIX4 to FIX6)

- **Task.** Mission timesheet-software-readiness, auxiliary lookup WP5-UX5-FIX6-PATHS,
  read-only. Its results feed the final brief of WP5-UX5-FIX6-FREEZE.
- **Profile and routing.** timesheet-light (effort low); requested model haiku (a listing
  with git ancestry checks).
- **Why.** One commit will freeze:
  - WP5-UX5-FIX4: `package.json` and `package-lock.json`;
  - WP5-UX5-FIX5: `tests/e2e/timesheet.spec.ts`, `tests/e2e/review.spec.ts` and
    `tests/e2e/fixtures.ts`;
  - WP5-UX5-FIX6: `vitest.config.ts`, `scripts/smoke-built-server.mjs`,
    `scripts/container-drill.mjs` and `tests/e2e/fixtures.ts`;
  - the coordinator records since 5b8b718.

  Before that commit, the coordinator needs the exact dirty paths, whether origin/main has
  moved, and any blocker.
- **Write only** this brief's Results section, **kept short**, and the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-FIX6-PATHS`. Put long lists in files there. Change
  nothing in the repository, its index, its branches, its worktrees, the git configuration,
  or Docker. `git fetch origin` is allowed.

## Steps

Use Git Bash. Save each output to a file in the task folder, and read it with Read.

1. `git rev-parse HEAD` (expected 5b8b7184692fff683c4083c9fc5610acd47bece1), then
   `git fetch origin`, then `git rev-parse origin/main`.
2. **If origin/main differs from HEAD:**
   - Run `git rev-list --left-right --count HEAD...origin/main` and
     `git merge-base --is-ancestor HEAD origin/main` (record the exit code).
   - List the commits in `HEAD..origin/main` (SHA, date, subject) and the files they
     change, grouped as:
     - governance paths (`AGENTS.md`, `CLAUDE.md`, `.claude/`, `docs/08`,
       `handoff/prompts/`, `handoff/templates/`, `handoff/delivery/validate_*.py`,
       `check_recovery.py`);
     - `src/`, `tests/`, `scripts/`, `assets/`, the root configuration files, the package
       files and `Dockerfile`;
     - the mission records: the board, STATE, the checkpoint pair, `handoff/NEXT_ACTION*`,
       and `handoff/delivery/tasks/WP5-*` or `evidence/WP5-*`;
     - everything else, as a count.
   - Run `git merge-tree --write-tree HEAD origin/main`. It writes no ref. Record the exit
     code and any conflicting paths.
3. `git status --short --untracked-files=all`, saved to a file. Report:
   - **outside `handoff/`:** each path, by name. Expected exactly these eight:
     `package.json`, `package-lock.json`, `tests/e2e/timesheet.spec.ts`,
     `tests/e2e/review.spec.ts`, `tests/e2e/fixtures.ts`, `vitest.config.ts`,
     `scripts/smoke-built-server.mjs`, `scripts/container-drill.mjs`. Name any extra or
     missing path.
   - **under `handoff/`:** the counts (modified, untracked). Name individually every path
     that is not one of:
     - `handoff/delivery/ORCHESTRATION.json`, `handoff/delivery/STATE.json`;
     - the pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
     - `handoff/NEXT_ACTION.md` and `.vi.md`;
     - `handoff/delivery/tasks/WP5-UX5-*.md`;
     - `handoff/delivery/evidence/WP5-UX5-*/`.
   - **the WP5-UX5 task and evidence entries,** with a count of files per evidence folder.
     Save the full list to a file.
4. **Commit blockers among the dirty `handoff/` paths:**
   - basenames that contain "signature" (any case) but not "synthetic";
   - files ending in `.js`, `.mjs`, `.cjs`, `.ts`, `.mts` or `.cts`, which `npm run lint`
     would parse;
   - files over 1 MB.

   List each one.
5. **Overlap.** If origin/main moved: does any path changed in `HEAD..origin/main` match a
   dirty path from step 3? Name each one.
6. `git diff --cached --name-status`. Expected empty.
7. **Host leftovers, read-only.** Stop nothing.
   - `docker ps -a --filter label=com.docker.compose.project=fix6-drill --format "{{.Names}} {{.Status}}"`,
     then `docker volume ls --filter label=com.docker.compose.project=fix6-drill`.
   - `powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='bash.exe'\" | Where-Object { $_.CommandLine -like '*waitfor.sh*' } | Select-Object ProcessId, CreationDate"`,
     with the output redirected to a file in the task folder.
   - `git config --global --get-all safe.directory`. Report only the entries whose value
     contains `.claude-tmp`.

## Results to write (short)

- HEAD and origin/main; whether they are equal; if not, the ahead/behind counts, the
  ancestry exit code, the governance and source paths of the new commits, and the
  merge-tree result.
- The paths outside `handoff/` (expected the eight).
- The handoff counts, and every path that is not a mission path, by name.
- Any blocker from step 4 or overlap from step 5.
- The staged diff (expected empty).
- The leftovers: drill containers and volumes, `waitfor.sh` processes (PID and creation
  time), and the `.claude-tmp` `safe.directory` entries.

## Runtime

- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO `head`, `tail` OR `cat`, NO
  `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul` (ALSO NOT IN `2>`), NO
  `rm -r`, NO PID KILLS, NO `Stop-Process`, NO INTERACTIVE SHELLS.**
- No email address in the evidence.
- If a permission check denies a call, stop and report.
- Run nothing in the background.
- Finish with "Status: done".

Return at most 120 words, beginning 'Self-reported model: ...'.

## Results

- HEAD 5b8b7184 = origin/main after fetch (equal, 0 ahead/0 behind; no new commits; merge-tree exit 0, tree 4c8ada4). Evidence: `D:\.claude-tmp\timesheet\WP5-UX5-FIX6-PATHS\01-head.txt` to `08-mergetree.txt`.
- Outside `handoff/`: exactly the eight expected paths; no extra or missing path.
- Handoff dirty paths: no non-mission path. WP5-UX5 counts: DEPS1 3, DIAG2 6, DIAG3 6, FIX3-FREEZE 2, FIX4 12, FIX5 1, FIX6 1, REGATE3 107; tasks modified AUDIT-A, AUDIT-B, FIX3-FREEZE; untracked DEPS1, DIAG2, DIAG3, FIX4-6, FIX6-PATHS, REGATE3.
- Blockers: `handoff/delivery/evidence/WP5-UX5-DIAG2/20-B-signature-image.txt` (signature, not synthetic); `handoff/delivery/ORCHESTRATION.json` (over 1 MB). No code-suffix files.
- Overlap: none (origin unchanged).
- Staged diff: empty.
- Leftovers: no fix6-drill containers or volumes; waitfor.sh bash PIDs 22240 (10/26/2026 12:29:55 PM), 55052, 9100, 103064 (6:25 PM); safe.directory `.claude-tmp` entries: `D:/.claude-tmp/timesheet/WP5-UX5-FIX6/exp2`.

Status: done
