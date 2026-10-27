# WP5-UX5-FIX9-PATHS lookup brief (state before the freeze of FIX7 to FIX9)

- **Task.** Mission timesheet-software-readiness, auxiliary lookup WP5-UX5-FIX9-PATHS,
  read-only. Its results feed the final brief of WP5-UX5-FIX9-FREEZE.
- **Profile and routing.** timesheet-light (effort low); requested model haiku (a listing
  with git ancestry checks).
- **Why.** One commit will freeze:
  - WP5-UX5-FIX7: area B, server, tests, drill and docs;
  - WP5-UX5-FIX8: area A, client, e2e and docs;
  - WP5-UX5-FIX9: keyboard access to read-only week cards;
  - the coordinator records since f4049aa.

  FIX9's `handoff/delivery/evidence/WP5-UX5-FIX9/end-diffstat.txt` lists 27 changed files
  outside `handoff/`. FIX8 once wrote a stray `export/` folder into the repository and
  reported removing it.
- **Write only** this brief's Results section, **kept short**, and the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-FIX9-PATHS`. Put long lists in files there. Change
  nothing in the repository, its index, its branches, its worktrees, the git
  configuration, or Docker. `git fetch origin` is allowed.

## Steps

Use Git Bash. Save each output to a file in the task folder, and read it with Read.

1. `git rev-parse HEAD` (expected f4049aa7905e22f1467dfcae4208675cb2fc8e80), then
   `git fetch origin`, then `git rev-parse origin/main`.
2. **If origin/main differs from HEAD:**
   - Run `git rev-list --left-right --count HEAD...origin/main` and
     `git merge-base --is-ancestor HEAD origin/main` (record the exit code).
   - List the commits in `HEAD..origin/main` (SHA, date, subject) and their files, grouped
     as in `handoff/delivery/tasks/WP5-UX5-FIX6-PATHS.md` step 2.
   - Run `git merge-tree --write-tree HEAD origin/main`. Record the exit code and any
     conflicting paths.
3. `git status --short --untracked-files=all`, saved to a file. Report:
   - **outside `handoff/`:** every path, by name, with its status letter. Compare them with
     the 27 paths of FIX9's `end-diffstat.txt`, and name any extra or missing path.
     **Flag especially:**
     - anything under `export/`;
     - any untracked file outside `handoff/`;
     - any `*.tmp*` file.
   - **under `handoff/`:** the counts (modified, untracked). Name individually every path
     that is not one of:
     - the board, STATE, the checkpoint pair and `handoff/NEXT_ACTION*`;
     - `handoff/delivery/tasks/WP5-UX5-*.md`;
     - `handoff/delivery/evidence/WP5-UX5-*/`;
     - `handoff/delivery/WP5_UX5_REVIEW_A*.md` and `WP5_UX5_REVIEW_B*.md`.
   - **The WP5-UX5 task and evidence entries,** with a count of files per evidence folder.
     Save the full list to a file.
4. **Commit blockers among all dirty paths:**
   - basenames that contain "signature" (any case) but not "synthetic";
   - files ending in `.js`, `.mjs`, `.cjs`, `.ts`, `.mts` or `.cts` under `handoff/`, which
     `npm run lint` would parse;
   - files over 5 MB;
   - `.png` files whose basename does not end in `-synthetic.png`.

   List each one.
5. **Line endings.** Run `git diff --stat` and `git ls-files --eol` for the changed
   tracked files outside `handoff/`. Report any whose working-tree line ending is CRLF
   (`w/crlf`), or mixed, where the index has LF.
6. **Overlap.** If origin/main moved: does any path changed in `HEAD..origin/main` match a
   dirty path? Name each one.
7. `git diff --cached --name-status`. Expected empty.
8. **Host leftovers, read-only.** Stop nothing.
   - `docker ps -a --format "{{.Names}} {{.Status}}"`. Report the names that start with
     `ts-` or contain `fix7` or `drill`.
   - `git config --global --get-all safe.directory`. Report the entries that contain
     `.claude-tmp`.

## Results to write (short)

- HEAD and origin/main; whether they are equal; if not, the counts, the ancestry exit code,
  the governance and source paths of the new commits, and the merge-tree result.
- The paths outside `handoff/`, against FIX9's 27, and any extra, missing, stray or
  untracked one.
- The handoff counts, and the non-mission paths, by name.
- Any blocker from steps 4 or 5, or any overlap from step 6.
- The staged diff (expected empty).
- The leftovers.

## Runtime

- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO `head`, `tail` OR `cat`, NO
  `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul` (ALSO NOT IN `2>`), NO
  `rm -r`, NO PID KILLS, NO `Stop-Process`, NO INTERACTIVE SHELLS.**
- A PowerShell query must not contain the text it searches for in a way that matches its
  own shell. Prefer `git` and `docker` here.
- No email address in the evidence.
- If a permission check denies a call, stop and report.
- Run nothing in the background.
- Finish with "Status: done".

Return at most 120 words, beginning 'Self-reported model: ...'.

## Results

- HEAD and origin/main are both f4049aa7905e22f1467dfcae4208675cb2fc8e80 (fetch exit 0). No new commits, so steps 2 and 6 do not apply.
- Outside `handoff/`: 27 modified (M) paths, identical to FIX9 `end-diffstat.txt` (docs 10, scripts 1, src 8, tests 8). No extra, missing, untracked, `export/` or `*.tmp*` path.
- `handoff/`: 9 modified, 566 untracked. Non-mission paths: none. WP5-UX5 evidence files: AUDIT-A 143, AUDIT-B 76, FIX6-FREEZE 2, FIX7 65, FIX8 40, FIX9 17, PLAN-FIX7 36, PLAN-FIX7A 37, REGATE4 139.
- Commit blockers (step 4): none. Line endings (step 5): every changed tracked file is `i/lf w/lf`, no CRLF.
- Staged diff: empty.
- Leftovers: Docker has no `ts-*`, `fix7` or `drill` container (partflow, agentmemory, homey only). Global safe.directory has one `.claude-tmp` entry: `D:/.claude-tmp/timesheet/WP5-UX5-FIX6/exp2`.
- Deviation: one early no-op command carried a stray `/dev/null` text. It had no repository effect and its output was unused.
- Evidence: `D:\.claude-tmp\timesheet\WP5-UX5-FIX9-PATHS` (status-all.txt, evidence-counts.txt, eol-tracked.txt).

Status: done
