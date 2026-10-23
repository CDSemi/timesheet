# WP5-UX5-FIX3-PATHS lookup brief (state before the FIX3 freeze)

- **Task.** Mission timesheet-software-readiness, auxiliary lookup WP5-UX5-FIX3-PATHS,
  read-only. It feeds the final brief of WP5-UX5-FIX3-FREEZE.
- **Profile and routing.** timesheet-light (effort low); requested model haiku (a listing
  with git ancestry checks).
- **Why.** The owner relayed a request from the Ingat side: the next mission commit uses
  `git merge --ff-only origin/main`. A fast-forward works only if origin/main already
  contains the mission's local commit 7aafa21. The Ingat session shares this repository
  through its worktree, so it may have integrated 7aafa21.
- **Write only** this brief's Results section, **kept short**, and the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-FIX3-PATHS`; put long lists in files there. Change
  nothing in the repository, its index, its branches or its worktrees. `git fetch origin`
  is allowed.

## Steps (Git Bash; each output to a file in the task folder, read with Read)

1. `git rev-parse HEAD`, then `git fetch origin`, then `git rev-parse origin/main`.
2. Can HEAD fast-forward to origin/main?
   - Run `git merge-base --is-ancestor HEAD origin/main` and record the exit code: 0 means
     yes.
   - Run `git rev-list --left-right --count HEAD...origin/main`.
3. **If it can fast-forward,** list the commits in `HEAD..origin/main` (SHA, date,
   subject). For each, say whether it touches a mission path:
   - `src/`, `tests/`, `docs/04`, `docs/12`;
   - `handoff/delivery/ORCHESTRATION.json`, `STATE.json`, the checkpoint pair,
     `handoff/NEXT_ACTION*`;
   - any `handoff/delivery/tasks/WP5-*` or `evidence/WP5-*`.

   Also list the files they change under `src/`, `tests/`, `scripts/`, the root config
   files and the package files.
4. `git status --short --untracked-files=all`, saved to a file. Report:
   - **outside `handoff/`:** each path, by name. Expected: `tests/e2e/controls.spec.ts`
     and `tests/e2e/fixtures.ts` only;
   - **under `handoff/`:** the counts, and every path whose name does not start with
     `handoff/delivery/tasks/WP5-`, `handoff/delivery/evidence/WP5-`, the board, STATE,
     the checkpoint pair or `handoff/NEXT_ACTION`. Name those paths individually: they
     are not the mission's;
   - whether `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md` and `.vi.md` are still modified,
     and whether `INGAT_MANIFEST_DESIGN_REVIEW.md` or `evidence/INGAT-*` are still
     untracked.
5. **Overlap.** Does any path changed in `HEAD..origin/main` match a path in step 4's
   status? Such a path would block a fast-forward.
6. `git diff --cached --name-status` (expected empty).

## Results to write (short)

- HEAD, origin/main, whether a fast-forward is possible, and the ahead/behind counts.
- The commits in `HEAD..origin/main` that touch mission paths (expected: none).
- The paths outside `handoff/`.
- The non-mission paths under `handoff/` still dirty or untracked.
- Any overlap that would block the fast-forward.

## Runtime

- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO `head` OR `tail`, NO `/dev/null`,
  `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul` (ALSO NOT IN `2>`), NO `rm -r`, NO PID
  KILLS, NO INTERACTIVE SHELLS.**
- No email address in the evidence.
- If a permission check denies a call, stop and report.
- Finish with "Status: done".

Return at most 100 words, beginning 'Self-reported model: ...'.

## Results

- HEAD 7aafa21 (as expected); origin/main 01c4cdcb. Fast-forward NOT possible (is-ancestor exit 1); HEAD...origin/main is 1 ahead, 2 behind (diverged).
- HEAD..origin/main: 782cdda (GHCR cleanup feat) and 01c4cdc (handoff record). They touch tests/integration/ghcr-cleanup.test.ts, scripts/ghcr-cleanup.ts, tsconfig.json, tsconfig.test.json, docs/07, docs/11, docs/adr, INGAT_GC tasks/evidence, and the INGAT_T0_T8 checkpoint pair. No WP5 paths, ORCHESTRATION.json or NEXT_ACTION.
- Outside handoff/: tests/e2e/controls.spec.ts and tests/e2e/fixtures.ts (M) only.
- Under handoff/: 175 entries (9 M, 166 untracked). Non-mission: INGAT_T0_T8_CHECKPOINT.md/.vi.md (M); untracked INGAT_MANIFEST_DESIGN_REVIEW.md/.vi.md, INGAT_TOML_REVIEW.md/.vi.md, tasks/INGAT-MANIFEST-DESIGN.md, tasks/INGAT-TOML-AUDIT.md, evidence/INGAT-MANIFEST-DESIGN/, evidence/INGAT-TOML-AUDIT/.
- Overlap blocking a fast-forward or merge: INGAT_T0_T8_CHECKPOINT.md and .vi.md are dirty locally and changed in HEAD..origin/main.
- Staged diff: empty.
- Status: done.
