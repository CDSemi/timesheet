# WP5-UX5-T05B-PATHS lookup brief (path list for the T05B freeze)

- **Task.** Mission timesheet-software-readiness, auxiliary lookup WP5-UX5-T05B-PATHS,
  read-only. It feeds the brief of WP5-UX5-T05B-FREEZE.
- **Profile and routing.** timesheet-light (effort low); requested model haiku (a pure
  listing; docs/08 "haiku only for pure listing/probes").
- **Write only** this brief's Results section and files in the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-T05B-PATHS`. Change nothing in the repository, its
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

- HEAD: 70f7800b9c1582cffee453ac0bc8c741418f6f99
- origin/main: 70f7800b9c1582cffee453ac0bc8c741418f6f99 (same as HEAD)
- Staged (`git diff --cached --name-status`): none

### Outside `handoff/`

- Modified (unstaged), count 11:
  - docs/04_UX_AND_SETTINGS.md
  - docs/04_UX_AND_SETTINGS.vi.md
  - src/client/DayEditor.tsx
  - src/client/TimesheetScreen.tsx
  - src/client/components/DayFieldsForm.tsx
  - src/client/components/leaveInputModel.ts
  - src/client/styles.css
  - tests/client/leaveInputModel.test.ts
  - tests/e2e/controls.spec.ts
  - tests/e2e/day-editor.spec.ts
  - tests/e2e/focus-ring.spec.ts
- New (untracked), count 1:
  - src/client/components/LeaveDialog.tsx (8052 bytes)
- Deleted, count 0.

### Under `handoff/`

- Modified (unstaged), count 5:
  - handoff/delivery/ORCHESTRATION.json
  - handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md
  - handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.vi.md
  - handoff/delivery/tasks/WP5-UX5-T05A-FREEZE.md
  - handoff/delivery/tasks/WP5-UX5-T05B.md
- New (untracked), count 8:
  - handoff/delivery/evidence/WP5-UX5-T05A-FREEZE/checks.txt
  - handoff/delivery/evidence/WP5-UX5-T05A-FREEZE/commit-message.txt
  - handoff/delivery/evidence/WP5-UX5-T05B/u5-23-drawer-square-corners-w1440-synthetic.png
  - handoff/delivery/evidence/WP5-UX5-T05B/u5-25-partial-leave-dialog-w1440-synthetic.png
  - handoff/delivery/evidence/WP5-UX5-T05B/u5-26-phone-sheet-390x844-synthetic.png
  - handoff/delivery/evidence/WP5-UX5-T05B/u5-26-phone-sheet-scrolled-390x844-synthetic.png
  - handoff/delivery/tasks/WP5-UX5-T05B-PATHS.md
  - handoff/delivery/tasks/WP5-UX5-T06.md
- Deleted, count 0.

### Checks

- Paths outside `src/client/`, `tests/client/`, `tests/e2e/`, the two `docs/04_UX_AND_SETTINGS` files and `handoff/`: none.
- Non-text files outside `handoff/`: none.
- `zz-*` files under `tests/` or `src/`: none.
- Git was read with `--no-optional-locks`; the index and history were not changed.
- Note: the start-of-session snapshot listed the evidence folders only; the current status lists their files individually.

Status: done
