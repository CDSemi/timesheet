# WP5-UX-T04-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-T04-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX-T04 (done).
- This commit freezes slice 4 of the owner-requested UI redesign: the day editor (side
  panel, bottom sheet, hours + minutes leave, one-tap break confirmation, in-cell label
  picker). It also carries the WP5-UX-T03-FREEZE results and the coordinator records
  since the last commit.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  b6324b7cd0cca0d44b18f82b835387a8846bb0b1. If either differs, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
    NO `| python`.** Never pipe into head or tail.
  - Call Node 24 by its full portable path; make the first shell call a trivial
    `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-UX-T04-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the only changed paths may be these 20 (from WP5-UX-T04; nothing
deleted):
- New: `src/client/components/leaveInputModel.ts`,
  `src/client/components/dayEditorModel.ts`, `src/client/components/labelPickerModel.ts`,
  `tests/client/leaveInputModel.test.ts`, `tests/client/dayEditorModel.test.ts`,
  `tests/client/labelPickerModel.test.ts`.
- Modified: `src/client/DayEditor.tsx`, `src/client/TimesheetScreen.tsx`,
  `src/client/components/BatchDialog.tsx`, `src/client/components/DayFieldsForm.tsx`,
  `src/client/components/DayFigures.tsx`, `src/client/components/SheetWeekTable.tsx`,
  `src/client/components/TimesheetSheet.tsx`, `src/client/components/sessionModel.ts`,
  `src/client/styles.css`, `tests/client/sessionModel.test.ts`, and the e2e specs
  `day-editor`, `import` and `sharing` (`tests/e2e/<name>.spec.ts`).

Report which are actually changed. Any other changed or untracked path outside handoff/
stops the commit. If anything is already staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
6f362af9f9a2d09995d2c3f48d732abfce43772ae352efa40c00bf7825ffa538 (789 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

New files:
- `handoff/delivery/tasks/WP5-UX-T04.md`;
- this brief, as it stands before you append results;
- every file in `handoff/delivery/evidence/WP5-UX-T04/` (ten files: six `.txt` and
  exactly four synthetic screenshots `editor-panel-desktop-synthetic.png`,
  `editor-label-picker-desktop-synthetic.png`, `editor-label-picker-mobile-synthetic.png`,
  `editor-sheet-mobile-synthetic.png`);
- every file in `handoff/delivery/evidence/WP5-UX-T03-FREEZE/` (`checks.txt`,
  `commit-message.txt`).

Modified files:
- `handoff/delivery/tasks/WP5-UX-T03-FREEZE.md` (its results);
- `handoff/delivery/ORCHESTRATION.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX-T04-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any `.png` other than the four listed, or any image whose basename lacks `synthetic`;
- any `.md` file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX-T04-FREEZE/checks.txt`.
1. `node --version`.
2. The working-tree digest (must be 6f362af9…).
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
8. `check_recovery.py`.
9. `validate_package.py --preflight` by its script path, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.
10. After the commit: the `git ls-tree` digest of HEAD (must be 6f362af9…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF in
  a task record outside `evidence/`, fix exactly those lines, re-stage the file and
  record the file name.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log under `evidence/WP5-UX-T04/` or `evidence/WP5-UX-T03-FREEZE/`, replace each such
  token with `<email>` or `<user>` in that evidence file only, re-stage it and rerun the
  check.

When to stop:
- If any other check fails, do not commit; report the file, line and rule. Never edit
  source or test files.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX-T04: side-panel and bottom-sheet day editor

- feat(client):
  - the day editor opens as a non-modal side panel on desktop (focus to its heading,
    Escape closes, focus returns to the day) and as a modal bottom sheet on phones;
  - leave is typed as hours + minutes and converted to the same integer leave_minutes;
  - one-tap "Confirm suggested breaks" uses the existing suggestBreaks and session PUT;
  - an in-cell label picker runs a one-entry batch preview then commit, so conflict
    confirmation and the reason rule still apply;
  - pure leaveInputModel, dayEditorModel and labelPickerModel; endpoints and bodies
    unchanged.
- test: unit tests for the three models and sessionModel; e2e updates in the
  day-editor, import and sharing specs (new focus and editor checks; no assertion
  removed).
- docs(handoff): WP5-UX-T04 record, evidence and synthetic screenshots;
  WP5-UX-T03-FREEZE results; board and checkpoint (+ vi).

Task: WP5-UX-T04 (owner-requested UI redesign, slice 4 of 6)
Gate: unit 1808 passed; full e2e desktop 76/0/3, mobile 77/0/2; verify exit 0
Audit: none yet (gate and independent audit after T06)
Digest: 6f362af9 (was 80bffa7e)

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values and the staged count;
- every check with its exit code;
- any fix applied or stop reason.

## Results

- Pre-HEAD b6324b7cd0cca0d44b18f82b835387a8846bb0b1 (= origin/main); post-HEAD and
  commit SHA 118a104a0e271a2fb2b8916a2cb1bf85244147bf; pushed yes; remote SHA same.
- Digest before add and ls-tree digest of HEAD: both 6f362af9f9a2d09995d2c3f48d732abfce43772ae352efa40c00bf7825ffa538 (789 files). Staged: 37 files.
- Checks: node 24.21.0 (0); digest (0); git add (0); precommit PASS 37 files (0);
  diff --check (0); JSON parse (0); validate_orchestration (0); check_recovery (0);
  validate_package --preflight (0). Details: evidence/WP5-UX-T04-FREEZE/checks.txt.
- Fixes: none. Stop reason: none.
