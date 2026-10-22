# WP5-UX5-T06-PATHS lookup brief (path list for the T06 freeze)

- **Task.** Mission timesheet-software-readiness, auxiliary lookup WP5-UX5-T06-PATHS,
  read-only. It feeds the brief of WP5-UX5-T06-FREEZE.
- **Profile and routing.** timesheet-light (effort low); requested model haiku (a pure
  listing; docs/08 "haiku only for pure listing/probes").
- **Write only** this brief's Results section and files in the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-T06-PATHS`. Change nothing in the repository, its
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
6. Use Glob to look for any `zz-*` file anywhere under `tests/`, `src/` or `docs/`
   (expected none).

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
- Every path outside `docs/` and `handoff/`, named separately (expected: none).
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

Self-reported model: claude-haiku-5-5. Evidence folder: `D:\.claude-tmp\timesheet\WP5-UX5-T06-PATHS` (files 01 to 10, plus 04b).

- HEAD: `69d63400486a977f10e022deea85026c6751b687`
- origin/main: `69d63400486a977f10e022deea85026c6751b687` (equal to HEAD)
- Staged (`git diff --cached --name-status`): none (empty).
- Outside `handoff/`:
  - modified (unstaged), count 6: `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md`, `docs/11_OPERATIONS_RUNBOOK.md`, `docs/11_OPERATIONS_RUNBOOK.vi.md`, `docs/12_RELEASE_NOTES.md`, `docs/12_RELEASE_NOTES.vi.md`
  - new (untracked), count 0
  - deleted, count 0
- Under `handoff/`:
  - modified (unstaged), count 7: `handoff/delivery/ORCHESTRATION.json`, `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md`, `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.vi.md`, `handoff/delivery/WP5_PILOT_PACKET.md`, `handoff/delivery/WP5_PILOT_PACKET.vi.md`, `handoff/delivery/tasks/WP5-UX5-T05B-FREEZE.md`, `handoff/delivery/tasks/WP5-UX5-T06.md`
  - new (untracked), count 41, each named:
    1. `handoff/delivery/evidence/WP5-UX5-T05B-FREEZE/checks.txt`
    2. `handoff/delivery/evidence/WP5-UX5-T05B-FREEZE/commit-message.txt`
    3. `handoff/delivery/evidence/WP5-UX5-T06/00-base.txt`
    4. `handoff/delivery/evidence/WP5-UX5-T06/01-commands.txt`
    5. `handoff/delivery/evidence/WP5-UX5-T06/04-make-samples.txt`
    6. `handoff/delivery/evidence/WP5-UX5-T06/05-extract.txt`
    7. `handoff/delivery/evidence/WP5-UX5-T06/06-ready-check.txt`
    8. `handoff/delivery/evidence/WP5-UX5-T06/07-parity.txt`
    9. `handoff/delivery/evidence/WP5-UX5-T06/08-preflight.txt`
    10. `handoff/delivery/evidence/WP5-UX5-T06/09-precommit-selftest.txt`
    11. `handoff/delivery/evidence/WP5-UX5-T06/10-diff-check.txt`
    12. `handoff/delivery/evidence/WP5-UX5-T06/extract.mjs.txt`
    13. `handoff/delivery/evidence/WP5-UX5-T06/make-samples.mjs.txt`
    14. `handoff/delivery/evidence/WP5-UX5-T06/msg-01-notice-sample.signed-1.txt`
    15. `handoff/delivery/evidence/WP5-UX5-T06/msg-02-notice-sample.auto.on-2.txt`
    16. `handoff/delivery/evidence/WP5-UX5-T06/msg-03-notice-sample.auto.off-3.txt`
    17. `handoff/delivery/evidence/WP5-UX5-T06/msg-04-submission-payroll-norows-rev1.txt`
    18. `handoff/delivery/evidence/WP5-UX5-T06/msg-05-submission-payroll-manual-rev1.txt`
    19. `handoff/delivery/evidence/WP5-UX5-T06/msg-06-notice-sample.auto.on-6.txt`
    20. `handoff/delivery/evidence/WP5-UX5-T06/msg-07-submission-payroll-auto-on-rev1.txt`
    21. `handoff/delivery/evidence/WP5-UX5-T06/msg-08-submission-payroll-auto-off-rev1.txt`
    22. `handoff/delivery/evidence/WP5-UX5-T06/msg-09-notice-sample.auto.off-9.txt`
    23. `handoff/delivery/evidence/WP5-UX5-T06/msg-10-submission-payroll-signed-rev1.txt`
    24. `handoff/delivery/evidence/WP5-UX5-T06/msg-11-submission-payroll-manual-rev2.txt`
    25. `handoff/delivery/evidence/WP5-UX5-T06/parity.mjs.txt`
    26. `handoff/delivery/evidence/WP5-UX5-T06/pdf-text-04-submission-payroll-norows-rev1.txt`
    27. `handoff/delivery/evidence/WP5-UX5-T06/pdf-text-05-submission-payroll-manual-rev1.txt`
    28. `handoff/delivery/evidence/WP5-UX5-T06/pdf-text-07-submission-payroll-auto-on-rev1.txt`
    29. `handoff/delivery/evidence/WP5-UX5-T06/pdf-text-08-submission-payroll-auto-off-rev1.txt`
    30. `handoff/delivery/evidence/WP5-UX5-T06/pdf-text-10-submission-payroll-signed-rev1.txt`
    31. `handoff/delivery/evidence/WP5-UX5-T06/pdf-text-11-submission-payroll-manual-rev2.txt`
    32. `handoff/delivery/evidence/WP5-UX5-T06/pilot-04-submission-payroll-norows-rev1-p1-synthetic.png`
    33. `handoff/delivery/evidence/WP5-UX5-T06/pilot-05-submission-payroll-manual-rev1-p1-synthetic.png`
    34. `handoff/delivery/evidence/WP5-UX5-T06/pilot-07-submission-payroll-auto-on-rev1-p1-synthetic.png`
    35. `handoff/delivery/evidence/WP5-UX5-T06/pilot-08-submission-payroll-auto-off-rev1-p1-synthetic.png`
    36. `handoff/delivery/evidence/WP5-UX5-T06/pilot-10-submission-payroll-signed-rev1-p1-synthetic.png`
    37. `handoff/delivery/evidence/WP5-UX5-T06/pilot-11-submission-payroll-manual-rev2-p1-synthetic.png`
    38. `handoff/delivery/evidence/WP5-UX5-T06/ready-check.mjs.txt`
    39. `handoff/delivery/evidence/WP5-UX5-T06/sample-index.txt`
    40. `handoff/delivery/tasks/WP5-UX5-GATE.md`
    41. `handoff/delivery/tasks/WP5-UX5-T06-PATHS.md`
  - deleted, count 0
- Anything staged: none.
- Paths outside `docs/` and `handoff/`: none.
- Non-text files outside `handoff/`: none (all six modified docs are ASCII/UTF-8 text).
- Non-text files under `handoff/` not ending `-synthetic.png`: none. The six PNGs (items 32 to 37) are the only binary files and all end in `-synthetic.png`.
- `zz-*` files under `tests/`, `src/`, `docs/`: none (Glob, no matches).
- Status: done
