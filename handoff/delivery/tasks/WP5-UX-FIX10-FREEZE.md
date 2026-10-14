# WP5-UX-FIX10-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-FIX10-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX-FIX10 (done).
- This commit freezes the tests-only fix for WP5-UX-AB8-01..AB8-04, the calendar
  dependence of the e2e suite. It also carries the coordinator records since dc70ba6:
  - the CKPT4 results and evidence;
  - REGATE7 attempts 2 and 3, with the drill evidence;
  - the AB8 audit and review;
  - the FIX10 record and evidence;
  - the board, the checkpoint pair and NEXT_ACTION.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  dc70ba65eb6c93925b3abe821829b76fc7e1f9da.
  - If HEAD is a descendant whose extra commits touch only handoff/, report each extra
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
  - Create files only in the task folder and the evidence folder.
  - Put Node 24 first on PATH before any node call. Make the first shell call
    `node --version` (it must be v24.x). Stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-UX-FIX10-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/

Exactly these 8 modified paths from WP5-UX-FIX10, with no new file:
- `tests/e2e/displayedSeed.ts`;
- `tests/e2e/fixtures.ts`;
- `tests/e2e/automation.spec.ts`;
- `tests/e2e/pdf-visual.spec.ts`;
- `tests/e2e/shell.spec.ts`;
- `tests/e2e/timesheet.spec.ts`;
- `tests/e2e/admin.spec.ts`;
- `tests/domain/e2eSeedSelection.test.ts`.

Any other changed or untracked path outside handoff/ stops the commit, in particular any
path under `src/`, `docs/` or `scripts/`, or a config file. If anything is already staged
before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
57e2974c35cc104f3c2cb5d930c24d9bb15b89661be395d16a827e64ee4b761d. After the commit, the
`git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

Stage every path below that is changed or untracked, and report the count per group:

- modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/NEXT_ACTION.md` and `handoff/NEXT_ACTION.vi.md`;
  - `handoff/delivery/tasks/WP5-UX-CKPT4.md` (its results);
  - `handoff/delivery/tasks/WP5-UX-REGATE7.md` (the attempt 3 note and results);
  - `handoff/delivery/tasks/WP5-UX-AUDIT-AB8.md` (its results);
- new: every file in `handoff/delivery/evidence/WP5-UX-CKPT4/`;
- new: the new `a3-*` files in `handoff/delivery/evidence/WP5-UX-REGATE7/`, and any
  other new file in that folder;
- new: `handoff/delivery/WP5_UX_REVIEW_AB8.md`, `handoff/delivery/WP5_UX_REVIEW_AB8.vi.md`
  and every file in `handoff/delivery/evidence/WP5-UX-AUDIT-AB8/`;
- new: `handoff/delivery/tasks/WP5-UX-FIX10.md` and every file in
  `handoff/delivery/evidence/WP5-UX-FIX10/`;
- new: this brief, as it stands before you append results.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX-FIX10-FREEZE/` stay unstaged.

**Other modified tracked handoff files.** If `git status` shows any tracked handoff file
as modified that is not listed above:
- record `git diff --stat` and `git diff --ignore-cr-at-eol --ignore-space-at-eol --stat`
  for it (names and counts only);
- if the change is only line endings or trailing whitespace, leave it unstaged and
  continue;
- if the content changed, do not commit; stop and report.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any image whose basename does not end `-synthetic.png`;
- any `.md` file under `evidence/`;
- any file under `evidence/` whose name does not end in `.txt` or `-synthetic.png`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX-FIX10-FREEZE/checks.txt`.
1. `node --version` (v24.x).
2. HEAD and origin/main, plus the extra-commit report if any.
3. The working-tree digest (must be 57e2974c…).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json.
8. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
9. `check_recovery.py` (expected 106 probes).
10. `validate_package.py --preflight` by its script path, with the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
    Write `<user>` in the evidence.
11. After the commit: the `git ls-tree` digest of HEAD (must be 57e2974c…).

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

Subject: Freeze WP5-UX-FIX10: make the e2e suite independent of the calendar

- test(e2e):
  - When the displayed period's due has passed, the deadline tests record a later
    deadline through the payroll-exception path (AB8-01).
  - The worker-shared seeded days are released (AB8-02).
  - Holiday-import dates fall after the displayed period (AB8-03).
  - The expected import year follows the client's default rule (AB8-04).
  - Every assertion is kept.
- test(domain): new unit cases for the later-deadline and import-date helpers.
- The simulated-clock sweep (14 runs, both projects) ends with 0 failures.
- docs(handoff):
  - the CKPT4 results;
  - WP5-UX-REGATE7 PASS (drill after Docker start; image 52b45ad9…);
  - WP5-UX-AUDIT-AB8 FIX REQUIRED (product unchanged; B7-01 closed; AB8-01..04);
  - the WP5-UX-FIX10 record and evidence;
  - the coordinator decisions;
  - the board, the checkpoint (+ vi) and NEXT_ACTION (+ vi).

Task: WP5-UX-FIX10 (addresses WP5-UX-AUDIT-AB8 AB8-01..AB8-04)
Gate: unit 1831 passed; full e2e 210 passed / 26 skipped / 0 failed on the real clock and at 13 simulated instants; preflight and verify exit 0
Audit: pending, WP5-UX-REGATE8 then combined recheck AB9
Digest: 57e2974c (was 58b0deee)

## Push and report

Push per the profile. Append to this brief:
- the pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values, the staged count, and the count per group;
- the report on other modified tracked handoff files;
- every check with its exit code;
- any fix applied or the stop reason.

## Results

(committer appends here)
