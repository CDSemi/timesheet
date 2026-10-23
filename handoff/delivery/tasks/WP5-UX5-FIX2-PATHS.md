# WP5-UX5-FIX2-PATHS lookup brief (path list for the FIX2 freeze)

- **Task.** Mission timesheet-software-readiness, auxiliary lookup WP5-UX5-FIX2-PATHS,
  read-only. It feeds the brief of WP5-UX5-FIX2-FREEZE.
- **Profile and routing.** timesheet-light (effort low); requested model haiku (a pure
  listing).
- **Write only** this brief's Results section, **kept short** (counts, the paths outside
  `handoff/`, exceptions), and the task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX2-PATHS`.
  The full per-file `handoff/` listing goes to a file in the task folder, not into this
  brief. Change nothing in the repository, its index or its history.

## Steps (Git Bash; redirect each output to a file in the task folder and read it with Read)

1. `git rev-parse HEAD` and `git rev-parse origin/main` (no fetch). Expected: HEAD 2bce0ab,
   origin/main 70dce2a.
2. `git status --short --untracked-files=all`, saved to the task folder.
3. `git diff --cached --name-status` (expected empty).
4. `git diff --name-status` (unstaged changes to tracked files).
5. The paths changed in `HEAD..origin/main`. For the overlap check, list any that are also
   in step 2 (expected: none).
6. Use Glob to look for any `zz-*` file under `tests/`, `src/`, `scripts/` or `docs/`
   (expected none).

## Results to write (short)

- HEAD and origin/main.
- **Outside `handoff/`:** every modified, new and deleted path, by name, with the counts.
- **Under `handoff/`:** only the counts of modified, new and deleted paths, and the folders
  that hold the new files. The full list goes to `handoff-list.txt` in the task folder.
- Anything staged.
- Any path outside `handoff/` that is not one of:
  - `tests/e2e/theme.spec.ts`;
  - `tests/e2e/shell.spec.ts`;
  - `tests/client/wordmarkAsset.test.ts`.

  Expected: none.
- Any overlap with `HEAD..origin/main`.
- Any binary under `handoff/` whose name does not end in `-synthetic.png`, and any
  basename containing "signature" without "synthetic".
- Any `zz-*` file found in step 6.

## Runtime

- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO `head` OR `tail`, NO `/dev/null`,
  `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul` (ALSO NOT IN `2>` REDIRECTS), NO
  `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS.**
- If a permission check denies a call, stop and report. Do not retry it another way.
- Finish with "Status: done".

Return at most 80 words, beginning 'Self-reported model: ...', with the counts and any
exception.

## Results
