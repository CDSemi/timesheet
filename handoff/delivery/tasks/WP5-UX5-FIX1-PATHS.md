# WP5-UX5-FIX1-PATHS lookup brief (path list for the FIX1 freeze)

- **Task.** Mission timesheet-software-readiness, auxiliary lookup WP5-UX5-FIX1-PATHS,
  read-only. It feeds the brief of WP5-UX5-FIX1-FREEZE.
- **Profile and routing.** timesheet-light (effort low); requested model haiku (a pure
  listing; docs/08 "haiku only for pure listing/probes").
- **Write only** this brief's Results section and files in the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-FIX1-PATHS`. Change nothing in the repository, its
  index or its history. No `git add`, `git rm`, `git restore`, `git stash`, `git checkout`
  or `git reset`.

## Steps

Run from the repository root in Git Bash. Redirect each output to a file in the task folder
and read it with Read.

1. `git rev-parse HEAD` and `git rev-parse origin/main` (no fetch).
2. `git status --short --untracked-files=all`.
3. `git diff --cached --name-status` (expected empty).
4. `git diff --name-status` (unstaged changes to tracked files).
5. For every untracked file outside `handoff/`, its size in bytes (`wc -c <file>`, one
   file per command).
6. Use Glob to look for any `zz-*` file anywhere under `tests/`, `src/`, `scripts/` or
   `docs/` (expected none).

## Results to write

- HEAD and origin/main.
- **Outside `handoff/`**, three lists with exact repository paths, one per line, sorted:
  - modified (unstaged);
  - new (untracked);
  - deleted.

  Give the count of each list.
- **Under `handoff/`**: the same three lists, with every file named. Do not collapse a
  folder into one entry.
- Anything staged.
- **Every path outside the allowed set**, named separately (expected: none). The allowed
  set is:
  - `scripts/container-drill.mjs`;
  - `tests/e2e/`;
  - `src/client/`;
  - the docs/04 pair;
  - `handoff/`.

  Name any path under `src/server/` or `src/domain/` separately as well.
- Every file outside `handoff/` that is not text (expected: none).
- Every non-text file under `handoff/` whose name does not end in `-synthetic.png`
  (expected: none).
- Any `zz-*` file found in step 6.

## Runtime

- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO `head` OR `tail`, NO `/dev/null`,
  `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul` (ALSO NOT IN `2>` REDIRECTS), NO
  `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS.**
- If a permission check denies a call, stop and report. Do not retry it another way.
- Finish with "Status: done".

Return at most 60 words, beginning 'Self-reported model: ...', with the counts per list.

## Results
