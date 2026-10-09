# WP5-UX-FIX1-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-FIX1-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX-FIX1 (done).
- This commit freezes the viewing-zone fix (the period bar always names the current
  viewing zone; docs/04 period bar section aligned). It is the last source change of the
  UI redesign round before the gate. It also carries the WP5-UX-T06-FREEZE results and the
  coordinator records since the last commit.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  abe68025af4b0fdbc0d73731d9eda04c729e4c18. If either differs, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
    NO `| python`. NEVER PIPE OUTPUT INTO `head` OR `tail`** (the previous committer did;
    redirect to a file in the task folder and read it with the Read tool).
  - Call Node 24 by its full portable path; make the first shell call a trivial
    `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-UX-FIX1-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the only changed paths may be these 6 (from WP5-UX-FIX1; all
modified):
- `src/client/components/PeriodBar.tsx`, `src/client/components/periodBarModel.ts`
- `tests/client/periodBarModel.test.ts`, `tests/e2e/timesheet.spec.ts`
- `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md`

Report which are actually changed. Any other changed or untracked path outside handoff/
stops the commit. If anything is already staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
2565b1e82d4aa5f8d55f71feb45b7180b35e169ea3f4376a2a96db8271f63444. After the commit, the
`git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

New files:
- `handoff/delivery/tasks/WP5-UX-FIX1.md`;
- this brief, as it stands before you append results;
- every file in `handoff/delivery/evidence/WP5-UX-FIX1/` (nine files: seven `.txt` and
  exactly two synthetic screenshots `zone-desktop-synthetic.png` and
  `zone-mobile-synthetic.png`);
- every file in `handoff/delivery/evidence/WP5-UX-T06-FREEZE/` (`checks.txt`,
  `commit-message.txt`).

Modified files:
- `handoff/delivery/tasks/WP5-UX-T06-FREEZE.md` (its results);
- `handoff/delivery/ORCHESTRATION.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX-FIX1-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any `.png` other than the two listed, or any image whose basename lacks `synthetic`;
- any `.md` file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX-FIX1-FREEZE/checks.txt`.
1. `node --version`.
2. The working-tree digest (must be 2565b1e8…).
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
8. `check_recovery.py`.
9. `validate_package.py --preflight` by its script path, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.
10. After the commit: the `git ls-tree` digest of HEAD (must be 2565b1e8…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF in
  a task record outside `evidence/`, fix exactly those lines, re-stage the file and
  record the file name.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log under `evidence/WP5-UX-FIX1/` or `evidence/WP5-UX-T06-FREEZE/`, replace each such
  token with `<email>` or `<user>` in that evidence file only, re-stage it and rerun the
  check.

When to stop:
- If any other check fails, do not commit; report the file, line and rule. Never edit
  source, test or docs files.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX-FIX1: period bar always names the viewing zone

- fix(client): the period bar always shows "Times in <zone>" for the current viewing
  zone (docs/04 "Display current viewing zone and saved accounting date"); when it
  differs from the reporting zone the existing note is added; display only, no grouping
  or calculation change.
- test: periodBarModel cases and a timesheet e2e check for both zone cases.
- docs: docs/04 (+ vi) period bar section aligned.
- docs(handoff): WP5-UX-FIX1 record, evidence and synthetic screenshots;
  WP5-UX-T06-FREEZE results; board and checkpoint (+ vi).

Task: WP5-UX-FIX1 (finding from WP5-UX-T06; coordinator decision 2026-10-08)
Gate: unit 1817 passed; full e2e desktop 77/0/3, mobile 78/0/2; preflight and verify exit 0
Audit: none yet (gate and independent audit after GOV-SUPERSEDE)
Digest: 2565b1e8 (was 46a3a0c6)

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values and the staged count;
- every check with its exit code;
- any fix applied or stop reason.

## Results

- Pre-HEAD abe68025af4b0fdbc0d73731d9eda04c729e4c18; commit and post-HEAD
  4def605d6bffd71b789214a03202a3122939406e; pushed to origin main; remote SHA same.
- Digests: working tree and HEAD ls-tree both 2565b1e82d4aa5f8d55f71feb45b7180b35e169ea3f4376a2a96db8271f63444.
- Staged: 23 files. All 6 source/test/docs paths were changed. Nothing was staged beforehand.
- Checks, all exit 0: node v24.21.0; digest; git add; precommit (23 files, 0 findings);
  diff --cached --check; JSON parse; validate_orchestration; check_recovery;
  validate_package --preflight; post-commit ls-tree digest.
- No fix applied. No stop. Evidence: evidence/WP5-UX-FIX1-FREEZE/checks.txt.
