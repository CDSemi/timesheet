# WP5-UX2-FIX2-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-FIX2-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX2-FIX2 (done).
- This commit freezes the tests-only fix WP5-UX2-FIX2: the inactive-Today focus step in
  `tests/e2e/focus-ring.spec.ts` no longer depends on the calendar. This is the new
  package-final snapshot of UI change round 2. It also carries the coordinator records
  since b1b725b:
  - the FIX1-FREEZE results and evidence;
  - the WP5-UX2-REGATE record and evidence (FAIL on b1b725b);
  - the FIX2 record and evidence;
  - the board and the checkpoint pair.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  b1b725b7361d55e7aed70656051359153e457b5c.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each extra
    commit (SHA, author name, subject, file names) and continue.
  - In any other case, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
    NO `| python`, NO `node -e` (NOT EVEN `node -e "1"`). NEVER PIPE OUTPUT INTO `head`
    OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`.** Redirect to a file in
    the task folder and read it with the Read tool. To list or count files, use the Glob
    tool or redirect to a file. To check Node, run `node --version` and nothing else.
  - Create the task folder `D:\.claude-tmp\timesheet\WP5-UX2-FIX2-FREEZE` first and use it
    for TEMP/TMP and raw output. Only masked, final `.txt` files go to the evidence
    folder.
  - Create files only in the task folder and the evidence folder. Never create links or
    junctions.
  - Put Node 24 first on PATH before any node call. Make the first shell call
    `node --version` (it must be v24.x). Stop on ENOSPC.
  - Never kill processes by PID. Never remove anything recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/

Exactly one modified path: `tests/e2e/focus-ring.spec.ts`. Any other changed or
untracked path outside `handoff/` stops the commit. If anything is already staged
before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
229df806aeaaa886ab11ee83556746ee65eda6c81a596dcd180d80d5d0b04db3 (815 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

Stage every path below that is changed or untracked, and report the count per group:

- modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX2-FIX1-FREEZE.md` (its results);
- new records:
  - `handoff/delivery/tasks/WP5-UX2-REGATE.md`;
  - `handoff/delivery/tasks/WP5-UX2-FIX2.md`;
  - this brief, as it stands before you append results;
- new evidence:
  - both files in `handoff/delivery/evidence/WP5-UX2-FIX1-FREEZE/`;
  - every file in `handoff/delivery/evidence/WP5-UX2-REGATE/` (about 158: `.txt` and 6
    `-synthetic.png`);
  - every file in `handoff/delivery/evidence/WP5-UX2-FIX2/` (22 `.txt`).
  - Report the exact count of each kind per folder. All names must end in `.txt` or
    `-synthetic.png`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX2-FIX2-FREEZE/` stay unstaged. Write BOTH `checks.txt`
and `commit-message.txt` there.

**Other modified tracked handoff files.** If `git status` shows any tracked handoff file
as modified that is not listed above:
- record `git diff --stat` and `git diff --ignore-cr-at-eol --ignore-space-at-eol --stat`
  for it (names and counts only);
- if the change is only line endings or trailing whitespace, leave it unstaged and
  continue;
- if the content changed, do not commit; stop and report.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map`, `.diff`, `.ttf`, `.otf`,
  `.woff`, `.woff2` or database file;
- any image whose basename does not end `-synthetic.png`;
- any `.md` file under `evidence/`;
- any file under `evidence/` whose name does not end in `.txt` or `-synthetic.png`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX2-FIX2-FREEZE/checks.txt`.
1. `node --version` (v24.x).
2. HEAD and origin/main, plus the extra-commit report if any.
3. The working-tree digest (must be 229df806…, 815 files).
4. `git add` with the explicit paths (folder paths for the three evidence folders), as
   its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json.
8. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
9. `check_recovery.py` (expected 106 probes).
10. `validate_package.py --preflight` by its script path, with the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
    Write `<user>` in the evidence.
11. After the commit: the `git ls-tree` digest of HEAD (must be 229df806…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF
  in a task record outside `evidence/`, fix exactly those lines, re-stage the file and
  record the file name.
- Mask only as your profile allows. If anything else is blocked, do not commit: report
  the file, line and rule, and leave the index staged.

When to stop:
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX2-FIX2: calendar-independent inactive-Today focus test

- test(e2e): the inactive-Today focus-ring tests focus the button, step away with
  Shift+Tab and come back with Tab on every day. They no longer depend on the five-day
  Current-period window. All assertions are kept. They pass at 2026-10-17, 2026-12-31,
  2026-10-26, 2026-10-27 and on the real clock; the full suite passes on the real clock
  and at 2026-10-17.
- docs(handoff):
  - the FIX1-FREEZE results;
  - WP5-UX2-REGATE FAIL on b1b725b (calendar-dependent test only) and its evidence;
  - the FIX2 record and evidence;
  - the board and the checkpoint (+ vi).

Task: WP5-UX2-FIX2 (answers the WP5-UX2-REGATE FAIL)
Gate: unit 1882 passed; full e2e desktop 216 passed / 29 skipped, mobile 232 / 13, 0 failed on the real clock and at 2026-10-17; verify exit 0 (worker-reported)
Audit: pending, WP5-UX2-REGATE2 then WP5-UX2-AUDIT2
Digest: 229df806 (was ac1895d9)

## Push and report

Push per the profile. Append to this brief:
- the pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values, the staged count, and the count per group;
- the report on other modified tracked handoff files;
- every check with its exit code;
- any fix applied or the stop reason.

## Results

Self-reported model: claude-sonnet-5-5

- Pre-HEAD = origin/main = b1b725b7361d55e7aed70656051359153e457b5c; no extra commits; nothing pre-staged.
- Commit a6437943403fc416240fd13a787a8c4748af3e84 on main; pushed yes; remote SHA the same.
- Digest before add and ls-tree digest of new HEAD: both 229df806aeaaa886ab11ee83556746ee65eda6c81a596dcd180d80d5d0b04db3 (815 files).
- Staged 190: 1 source (tests/e2e/focus-ring.spec.ts); 189 handoff: 4 modified (board, checkpoint pair, FIX1-FREEZE record), 3 task records (REGATE, FIX2, this brief), evidence FIX1-FREEZE 2 txt, REGATE 152 txt + 6 synthetic png, FIX2 22 txt.
- Other modified tracked handoff files: none.
- Checks (all exit 0): node v24.21.0; precommit 190 files, 0 findings; diff --cached --check; JSON parse; validate_orchestration PASS; check_recovery 106 probes; validate_package --preflight PASS.
- No fix, mask or stop. Evidence: handoff/delivery/evidence/WP5-UX2-FIX2-FREEZE/ (checks.txt, commit-message.txt), unstaged. Deviation: none material (an empty heredoc was fed to cat while creating a helper file, not to node or python).
