# WP5-UX5-T03-PATHS lookup brief (path list for the T03 freeze)

- **Task.** Mission timesheet-software-readiness, auxiliary lookup WP5-UX5-T03-PATHS,
  read-only. It feeds the brief of WP5-UX5-T03-FREEZE.
- **Profile and routing.** timesheet-light (effort low); requested model haiku (a pure
  listing; docs/08 "haiku only for pure listing/probes").
- **Write only** this brief's Results section and files in the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-T03-PATHS`. Change nothing in the repository, its
  index or its history. No `git add`, `git rm`, `git restore`, `git stash`, `git checkout`
  or `git reset`.

## Steps

Run from the repository root in Git Bash. Redirect each output to a file in the task folder
and read it with Read.

1. `git rev-parse HEAD` and `git rev-parse origin/main` (no fetch).
2. `git status --short --untracked-files=all`.
3. `git diff --cached --name-status` (the index; the T03 worker staged two deletions).
4. `git diff --name-status` (unstaged changes to tracked files).
5. For every untracked file outside `handoff/`, its size in bytes (`wc -c <file>`, one
   file per command).

## Results to write

- HEAD and origin/main.
- **Outside `handoff/`**, three lists with exact repository paths, one per line, sorted:
  - modified (unstaged);
  - new (untracked);
  - deleted, and whether each deletion is staged.
  Give the count of each list.
- **Under `handoff/`**: the same three lists.
- Anything staged other than the two deletions.
- Every path outside `src/client/`, `tests/client/`, `tests/e2e/`,
  `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md` and `handoff/`, named
  separately (expected: none).
- Every file outside `handoff/` that is not text source (an image, font, archive or other
  binary), named separately (expected: none).

## Runtime

- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO `head` OR `tail`, NO `/dev/null`,
  `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul`, NO `rm -r`, NO PID KILLS, NO
  INTERACTIVE SHELLS.**
- If a permission check denies a call, stop and report. Do not retry it another way.
- Finish with "Status: done".

Return at most 60 words, beginning 'Self-reported model: ...', with the counts per list.

## Results

Evidence: `D:\.claude-tmp\timesheet\WP5-UX5-T03-PATHS\` (01_head.txt, 01b_origin.txt, 02_status.txt, 03_cached.txt, 04_unstaged.txt, 05_size_*.txt). Commands ran with exit 0; no repository state was changed.

- HEAD: `b4c500456a69158571799f8f0d90f035fd7a0fa5`
- origin/main: `b4c500456a69158571799f8f0d90f035fd7a0fa5` (equal to HEAD)

### Outside `handoff/`

- Modified (unstaged), 28 paths:
  - docs/04_UX_AND_SETTINGS.md
  - docs/04_UX_AND_SETTINGS.vi.md
  - src/client/App.tsx, src/client/ReviewScreen.tsx, src/client/api.ts, src/client/styles.css
  - src/client/components/DeliveryHistory.tsx, OperationsStatus.tsx, ReviewDays.tsx, ReviewStatus.tsx, SubmissionSettingsForm.tsx, TimesheetSheet.tsx, deliveryModel.ts, otModel.ts, reviewModel.ts, settingsFileModel.ts, settingsModel.ts
  - tests/client/deliveryModel.test.ts, otModel.test.ts, reviewModel.test.ts, settingsFileModel.test.ts, settingsModel.test.ts
  - tests/e2e/controls.spec.ts, history-settings.spec.ts, review.spec.ts, settings-transfer.spec.ts, sharing.spec.ts, submission.spec.ts
- New (untracked), 2 paths:
  - src/client/components/SendCard.tsx (15327 bytes)
  - src/client/components/SignoffDialog.tsx (8542 bytes)
- Deleted, 2 paths, both staged:
  - src/client/components/ReviewEnvelope.tsx (staged)
  - src/client/components/ReviewSignoff.tsx (staged)

### Under `handoff/`

- Modified (unstaged), 4 paths:
  - handoff/delivery/ORCHESTRATION.json
  - handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md
  - handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.vi.md
  - handoff/delivery/tasks/WP5-UX5-T02-FREEZE.md
- New (untracked), 19 paths:
  - handoff/delivery/evidence/WP5-UX5-T02-FREEZE/checks.txt, commit-message.txt
  - handoff/delivery/evidence/WP5-UX5-T03/ 00-base.txt, 20-build.txt, 20-lint.txt, 20-typecheck.txt, 20-vitest.txt, 21-e2e-full.txt, 40-parity.txt, 41-validate.txt, 50-verify.txt, 60-digest.txt, review-1440-synthetic.png, review-390-synthetic.png, review-signed-1440-synthetic.png, send-card-reason-dialog-synthetic.png, signoff-dialog-1440-synthetic.png (15 paths)
  - handoff/delivery/tasks/WP5-UX5-T03-PATHS.md, handoff/delivery/tasks/WP5-UX5-T03.md
- Deleted: none.

### Checks

- Staged (index): only the two deletions above. Nothing else staged.
- Paths outside `src/client/`, `tests/client/`, `tests/e2e/`, the two `docs/04_UX_AND_SETTINGS` files and `handoff/`: none.
- Non-text files outside `handoff/`: none.
- Counts: outside handoff modified 28, new 2, deleted 2 (staged); under handoff modified 4, new 19, deleted 0.
- Note: the five PNG files under `handoff/delivery/evidence/WP5-UX5-T03/` are binary, but they are inside `handoff/`, so they are outside this check's scope.

Status: done
