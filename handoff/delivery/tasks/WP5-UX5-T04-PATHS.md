# WP5-UX5-T04-PATHS lookup brief (path list for the T04 freeze)

- **Task.** Mission timesheet-software-readiness, auxiliary lookup WP5-UX5-T04-PATHS,
  read-only. It feeds the brief of WP5-UX5-T04-FREEZE.
- **Profile and routing.** timesheet-light (effort low); requested model haiku (a pure
  listing; docs/08 "haiku only for pure listing/probes").
- **Write only** this brief's Results section and files in the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-T04-PATHS`. Change nothing in the repository, its
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
6. Use Glob to look for any `zz-*` file anywhere under `tests/` or `src/` (expected none).

## Results to write

- HEAD and origin/main.
- **Outside `handoff/`**, three lists with exact repository paths, one per line, sorted:
  - modified (unstaged);
  - new (untracked);
  - deleted.

  Give the count of each list.
- **Under `handoff/`**: the same three lists.
- Anything staged.
- Every path outside `src/client/`, `tests/client/`, `tests/e2e/`,
  `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md` and `handoff/`, named
  separately (expected: none).
- Every file outside `handoff/` that is not text source (an image, font, archive or other
  binary), named separately (expected: none).
- Any `zz-*` file found in step 6.

## Runtime

- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO `head` OR `tail`, NO `/dev/null`,
  `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul` (ALSO NOT IN `2>` REDIRECTS), NO
  `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS.**
- If a permission check denies a call, stop and report. Do not retry it another way.
- Finish with "Status: done".

Return at most 60 words, beginning 'Self-reported model: ...', with the counts per list.

## Results

Captures: `D:\.claude-tmp\timesheet\WP5-UX5-T04-PATHS\` (01 to 10 text files). Status: done.

- HEAD: `65def2f61b6cb82e8c23cb01c15e787d2d0b1c14`
- origin/main: `65def2f61b6cb82e8c23cb01c15e787d2d0b1c14` (same as HEAD; no fetch run)
- Staged: none (`git diff --cached --name-status` empty).

### Outside `handoff/`

Modified (unstaged), count 20:
- docs/04_UX_AND_SETTINGS.md
- docs/04_UX_AND_SETTINGS.vi.md
- src/client/TimesheetScreen.tsx
- src/client/components/BarClock.tsx
- src/client/components/ClockProvider.tsx
- src/client/components/PeriodBar.tsx
- src/client/components/ReviewDays.tsx
- src/client/components/ReviewStatus.tsx
- src/client/components/editorLayoutModel.ts
- src/client/components/periodBarModel.ts
- src/client/components/reviewModel.ts
- src/client/styles.css
- tests/client/periodBarModel.test.ts
- tests/client/reviewModel.test.ts
- tests/e2e/controls.spec.ts
- tests/e2e/logo.spec.ts
- tests/e2e/review.spec.ts
- tests/e2e/surfaces.spec.ts
- tests/e2e/timesheet.spec.ts
- tests/e2e/today.spec.ts

New (untracked), count 5 (sizes in bytes: layoutQueries.ts 1492, useMedia.ts 502, layoutQueries.test.ts 5699, periodCard.ts 5978, periodWindow.ts 2913):
- src/client/components/layoutQueries.ts
- src/client/components/useMedia.ts
- tests/client/layoutQueries.test.ts
- tests/e2e/periodCard.ts
- tests/e2e/periodWindow.ts

Deleted, count 0.

### Under `handoff/`

Modified, count 4:
- handoff/delivery/ORCHESTRATION.json
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.vi.md
- handoff/delivery/tasks/WP5-UX5-T03-FREEZE.md

New (untracked), count 28 (8 of them are PNG files):
- handoff/delivery/evidence/WP5-UX5-T03-FREEZE/checks.txt
- handoff/delivery/evidence/WP5-UX5-T03-FREEZE/commit-message.txt
- handoff/delivery/evidence/WP5-UX5-T04/checks-a-build.txt
- handoff/delivery/evidence/WP5-UX5-T04/checks-a-lint.txt
- handoff/delivery/evidence/WP5-UX5-T04/checks-a-typecheck.txt
- handoff/delivery/evidence/WP5-UX5-T04/checks-a-vitest.txt
- handoff/delivery/evidence/WP5-UX5-T04/diffcheck-final.txt
- handoff/delivery/evidence/WP5-UX5-T04/evidence-e2e-discovery-summary.txt
- handoff/delivery/evidence/WP5-UX5-T04/evidence-e2e-final-summary.txt
- handoff/delivery/evidence/WP5-UX5-T04/mutant-m1.txt
- handoff/delivery/evidence/WP5-UX5-T04/mutant-m2.txt
- handoff/delivery/evidence/WP5-UX5-T04/mutant-m3.txt
- handoff/delivery/evidence/WP5-UX5-T04/mutant-m4.txt
- handoff/delivery/evidence/WP5-UX5-T04/mutant-m5.txt
- handoff/delivery/evidence/WP5-UX5-T04/parity-final.txt
- handoff/delivery/evidence/WP5-UX5-T04/period-card-narrow-synthetic.png
- handoff/delivery/evidence/WP5-UX5-T04/period-card-wide-synthetic.png
- handoff/delivery/evidence/WP5-UX5-T04/step0-base.txt
- handoff/delivery/evidence/WP5-UX5-T04/timesheet-1440-synthetic.png
- handoff/delivery/evidence/WP5-UX5-T04/timesheet-320-synthetic.png
- handoff/delivery/evidence/WP5-UX5-T04/timesheet-390-synthetic.png
- handoff/delivery/evidence/WP5-UX5-T04/timesheet-479-synthetic.png
- handoff/delivery/evidence/WP5-UX5-T04/timesheet-600-synthetic.png
- handoff/delivery/evidence/WP5-UX5-T04/timesheet-900-synthetic.png
- handoff/delivery/evidence/WP5-UX5-T04/validate-final.txt
- handoff/delivery/evidence/WP5-UX5-T04/verify-final.txt
- handoff/delivery/tasks/WP5-UX5-T04-PATHS.md
- handoff/delivery/tasks/WP5-UX5-T04.md

Deleted, count 0.

### Checks

- Paths outside `src/client/`, `tests/client/`, `tests/e2e/`, `docs/04_UX_AND_SETTINGS*.md` and `handoff/`: none.
- Non-text files outside `handoff/`: none.
- `zz-*` files under `tests/` or `src/` (Glob): none.
