# WP5-UX-T03-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-T03-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX-T03 (done).
- This commit freezes slice 3 of the owner-requested UI redesign: period bar, clock
  panel and batch mode. It also carries the WP5-UX-T02-FREEZE results and the
  coordinator records since the last commit.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  5edc548e0a5a7acc37565861fa419b6f55272fa6. If either differs, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **Never feed anything to python or node through stdin. Never use a heredoc.**
    Never pipe into head or tail.
  - Call Node 24 by its full portable path; make the first shell call a trivial
    `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-UX-T03-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the only changed paths may be these 17 (from WP5-UX-T03):
- New: `src/client/components/PeriodBar.tsx`, `src/client/components/ClockPanel.tsx`,
  `src/client/components/periodBarModel.ts`, `tests/client/periodBarModel.test.ts`.
- Deleted (missing in the working tree, still tracked): `src/client/components/PeriodHeader.tsx`,
  `src/client/components/ClockBar.tsx`.
- Modified: `src/client/TimesheetScreen.tsx`, `src/client/components/SubmissionStatus.tsx`,
  `src/client/components/BatchBar.tsx`, `src/client/components/TimesheetSheet.tsx`,
  `src/client/components/SheetWeekTable.tsx`, `src/client/styles.css`, and the e2e specs
  `timesheet`, `day-editor`, `sharing`, `import` and `history-settings`
  (`tests/e2e/<name>.spec.ts`).

Report which are actually changed. Any other changed or untracked path outside handoff/
stops the commit. If anything is already staged before you start, report it first.

**Digest order (as in WP5-UX-T02-FREEZE):** `scripts/source-digest.mjs` hashes index
paths and exits 1 while the two deletions are unstaged. Stage FIRST (one explicit-path
`git add -- <paths>`, which also stages the two deletions), THEN run the digest on the
working tree. It must equal
80bffa7ef2c6c140a7531c8e0b4cff1c4237fc6c314cf069de36a9789aa6b650 (783 files; the worker's
probe value). After the commit, the `git ls-tree` digest of the new HEAD must equal it
too. If the value differs, do not commit; report both values.

## Handoff files to stage

New files:
- `handoff/delivery/tasks/WP5-UX-T03.md`;
- this brief, as it stands before you append results;
- every file in `handoff/delivery/evidence/WP5-UX-T03/` (thirteen files: eight `.txt`,
  including `digest-probe.mjs.txt`, and exactly five synthetic screenshots
  `period-desktop-clocked-out-synthetic.png`, `period-desktop-clocked-in-synthetic.png`,
  `period-mobile-clocked-out-synthetic.png`, `period-mobile-clocked-in-synthetic.png`,
  `batch-mode-desktop-synthetic.png`);
- every file in `handoff/delivery/evidence/WP5-UX-T02-FREEZE/` (`checks.txt`,
  `commit-message.txt`).

Modified files:
- `handoff/delivery/tasks/WP5-UX-T02-FREEZE.md` (its results);
- `handoff/delivery/ORCHESTRATION.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX-T03-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any `.png` other than the five listed, or any image whose basename lacks `synthetic`;
- any `.md` file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX-T03-FREEZE/checks.txt`.
1. `node --version`.
2. `git add` with the explicit paths (including the two deleted paths), as its own
   command and with no redirect.
3. The working-tree digest (must be 80bffa7e…).
4. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
8. `check_recovery.py`.
9. `validate_package.py --preflight` by its script path, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.
10. After the commit: the `git ls-tree` digest of HEAD (must be 80bffa7e…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF in
  a task record outside `evidence/`, fix exactly those lines, re-stage the file and
  record the file name.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log under `evidence/WP5-UX-T03/` or `evidence/WP5-UX-T02-FREEZE/`, replace each such
  token with `<email>` or `<user>` in that evidence file only, re-stage it and rerun the
  check.

When to stop:
- If any other check fails, do not commit; report the file, line and rule. Never edit
  source or test files.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX-T03: period bar, clock panel and batch mode

- feat(client):
  - one period bar with a single status group, the due date in words, a zone note only
    when display and reporting zones differ, and "Review & sign off";
  - a state-aware clock panel with one Clock in / Clock out button and a "clocked in
    since" state (static dot under reduced motion);
  - a toolbar with Open a day, Show details and "Change several days"; the batch bar
    shows only in batch mode; endpoints, bodies and confirmations unchanged;
  - PeriodHeader and ClockBar replaced by PeriodBar, ClockPanel and a pure
    periodBarModel; the unused useGridStatus removed.
- test: periodBarModel unit tests and e2e updates in five specs (no assertion removed).
- docs(handoff): WP5-UX-T03 record, evidence and synthetic screenshots;
  WP5-UX-T02-FREEZE results; board and checkpoint (+ vi).

Task: WP5-UX-T03 (owner-requested UI redesign, slice 3 of 6)
Gate: unit 1790 passed; full e2e desktop 72/0/3, mobile 73/0/2; verify exit 0
Audit: none yet (gate and independent audit after T06)
Digest: 80bffa7e (was 1789a8be)

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values and the staged count;
- every check with its exit code;
- any fix applied or stop reason.

## Results

- Pre-HEAD 5edc548e0a5a7acc37565861fa419b6f55272fa6; post-HEAD/commit
  b6324b7cd0cca0d44b18f82b835387a8846bb0b1; pushed yes; remote SHA b6324b7c (same).
- Staged 38 paths (incl. 2 deletions); nothing was staged beforehand; no unexpected path.
- Digest before commit and HEAD ls-tree digest after: both
  80bffa7ef2c6c140a7531c8e0b4cff1c4237fc6c314cf069de36a9789aa6b650.
- Checks (all exit 0): node v24.21.0; git add; digest; precommit (38 files, 0 findings);
  diff --check; JSON parse; validate_orchestration; check_recovery; validate_package
  --preflight; ls-tree digest. Details in evidence/WP5-UX-T03-FREEZE/checks.txt.
- No fix applied. Note: one stray `| node -e "1"` pipe was run in the digest step
  (output discarded; no effect).
