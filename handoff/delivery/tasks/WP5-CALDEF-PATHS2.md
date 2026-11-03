# WP5-CALDEF-PATHS2 lookup brief (read-only path census before the second freeze)

- **Lookup.** Mission timesheet-software-readiness, auxiliary lookup WP5-CALDEF-PATHS2, before
  WP5-CALDEF-FIX2-FREEZE. Read-only: you change no repository file except this brief's Results
  (short) and your task folder `D:\.claude-tmp\timesheet\WP5-CALDEF-PATHS2` (outside the
  repository).
- **Profile and routing.** timesheet-light, requested haiku (docs/08: a pure listing).
- **Rules.** Read-only git only (`git fetch origin` allowed). No heredocs, no command that
  waits on stdin, no pipes into `head`/`tail`/`cat`, no bare `cat`, no redirects to or from
  `/dev/null` or `nul`, no `rm -r`, no PID kills, never change git configuration, never stage.
  Never touch `.claude/worktrees/`. If a permission check denies a call, stop and report.

## Check and report

1. `git fetch origin`; HEAD and origin/main. Expected: both
   300d61f055a859857aa8eb3845ed21f4560e82fa, no new commits.
2. `git diff --cached --name-status`: expected empty.
3. **Outside `handoff/`:** `git status --short --untracked-files=all`. Expected exactly one
   path, modified: `tests/e2e/classic-scrollbar.spec.ts`. Nothing else (no `export/`, `.tmp`,
   stray or untracked file). List any difference.
4. **Under `handoff/`:** every modified path and every untracked path (with
   `--untracked-files=all`), grouped:
   - (a) mission records: the board, STATE, NEXT_ACTION and the checkpoint pairs;
   - (b) task briefs;
   - (c) evidence files, counted per folder.

   Expected groups: the briefs `WP5-CALDEF-FREEZE.md` (Results added), `WP5-CALDEF-GATE.md`,
   `WP5-CALDEF-AUDIT.md`, `WP5-CALDEF-DIAG1.md`, `WP5-CALDEF-FIX2.md`, `WP5-CALDEF-REGATE.md`
   and this brief; the evidence folders `WP5-CALDEF-FREEZE`, `WP5-CALDEF-GATE` (about 327
   files), `WP5-CALDEF-DIAG1` and `WP5-CALDEF-FIX2`; plus four known untracked leftovers
   (`evidence/WP5-UX5-DIAG6/new-proc-detail.txt`, `evidence/WP5-UX5-REGATE7/10-census-sample1.txt`,
   `evidence/WP5-UX5-REGATE8/log-chain1.log`, `evidence/WP5-UX5-REGATE8/log-master.log`). Name
   every path outside those groups.
5. **Commit blockers** among the changed and untracked paths of steps 3 and 4 (leftovers
   excluded):
   - basenames containing "signature" without "synthetic";
   - `.png` files not ending in `-synthetic.png`;
   - evidence files not ending in `.txt`;
   - files over 5 MB;
   - `.mjs`, `.js` or `.ts` files inside `handoff/` that ESLint would parse;
   - CRLF line endings in any changed or untracked text file (name each);
   - a text file that does not end in exactly one newline (name each).
6. **Process files.** List (names only, do not quote contents) the evidence files of the four
   folders whose names contain `census`, `proc`, `priority`, `leftover`, `process` or `load`,
   so the freeze can read them for owner command lines.
7. Write the full lists to your task folder; put only counts, the outside-`handoff/` result,
   the paths outside the expected groups, the blockers and the process-file count into this
   brief's Results.

Return at most 80 words, beginning 'Self-reported model: ...'.

## Results

- Step 1: HEAD and origin/main both 300d61f055a859857aa8eb3845ed21f4560e82fa; no new commits. Step 2: staged list empty.
- Step 3 (outside `handoff/`): one path, `M tests/e2e/classic-scrollbar.spec.ts`. Nothing else.
- Step 4 counts: mission records 3 modified (ORCHESTRATION.json, WORKFLOW_REVISION_CHECKPOINT.md and .vi.md); briefs 7 (FREEZE modified; AUDIT, DIAG1, FIX2, GATE, PATHS2, REGATE untracked); evidence DIAG1 34, FIX2 29, FREEZE 2, GATE 327; leftovers 4.
- Outside expected groups: `handoff/delivery/tasks/WP5-CALDEF-FIX2-FREEZE.md` (untracked, not in the expected list).
- Step 5 blockers: 2, both newline-end: `evidence/WP5-CALDEF-FIX2/out-lint.txt`, `evidence/WP5-CALDEF-FIX2/out-typecheck.txt`. No CRLF, signature, PNG, size or script blockers.
- Step 6 process files: 48 (DIAG1 4, GATE 44).
- Full lists: `D:\.claude-tmp\timesheet\WP5-CALDEF-PATHS2\full-lists.txt`
