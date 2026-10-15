# WP5-UX2-T04-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-T04-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX2-T04 (done).
- This commit freezes slice WP5-UX2-T04 of UI change round 2:
  - the Today and Current period buttons;
  - the one-line phone Review link with "Sign off" and "Review" short forms;
  - "Due" in label style;
  - the arrow separator in the period range.
- It also carries the coordinator records since 70ecb12:
  - the T03-FREEZE results and evidence;
  - the T04 record and evidence;
  - the board and the checkpoint pair.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  70ecb1264f7b54cc967a136811eeddcd64d9014a.
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
  - Create files only in the task folder and the evidence folder.
  - Put Node 24 first on PATH before any node call. Make the first shell call
    `node --version` (it must be v24.x). Stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-UX2-T04-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove anything recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/

Exactly these 12 paths from WP5-UX2-T04:
- modified (9):
  - `src/client/TimesheetScreen.tsx`;
  - `src/client/components/PeriodBar.tsx`;
  - `src/client/components/ReviewStatus.tsx`;
  - `src/client/components/periodBarModel.ts`;
  - `src/client/styles.css`;
  - `tests/client/periodBarModel.test.ts`;
  - `tests/e2e/fixtures.ts`;
  - `tests/e2e/sharing.spec.ts`;
  - `tests/e2e/timesheet.spec.ts`;
- new (3):
  - `src/client/components/periodJumpModel.ts`;
  - `tests/client/periodJumpModel.test.ts`;
  - `tests/e2e/today.spec.ts`.

Any other changed or untracked path outside `handoff/` stops the commit. That includes
any path under `src/server/`, `docs/` or `scripts/`, `package.json`, the lockfile and
any config file. If anything is already staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
9c76a1ec5e04b14b000d00d3bdc70c08215936cd76123e4dd7b6cc836c97e369 (807 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

Stage every path below that is changed or untracked, and report the count per group:

- modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX2-T03-FREEZE.md` (its results);
- new task records:
  - `handoff/delivery/tasks/WP5-UX2-T04.md`;
  - this brief, as it stands before you append results;
- new evidence:
  - the file in `handoff/delivery/evidence/WP5-UX2-T03-FREEZE/` (commit-message.txt);
  - every file in `handoff/delivery/evidence/WP5-UX2-T04/` (about 82 files). All names
    must end in `.txt` or `-synthetic.png`; report the exact count of each kind.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX2-T04-FREEZE/` stay unstaged. Write BOTH `checks.txt`
and `commit-message.txt` there (the previous committer skipped `checks.txt`).

**Other modified tracked handoff files.** If `git status` shows any tracked handoff file
as modified that is not listed above:
- record `git diff --stat` and `git diff --ignore-cr-at-eol --ignore-space-at-eol --stat`
  for it (names and counts only);
- if the change is only line endings or trailing whitespace, leave it unstaged and
  continue;
- if the content changed, do not commit; stop and report.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map`, `.ttf`, `.otf`, `.woff`, `.woff2`
  or database file;
- any image whose basename does not end `-synthetic.png`;
- any `.md` file under `evidence/`;
- any file under `evidence/` whose name does not end in `.txt` or `-synthetic.png`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX2-T04-FREEZE/checks.txt`.
1. `node --version` (v24.x).
2. HEAD and origin/main, plus the extra-commit report if any.
3. The working-tree digest (must be 9c76a1ec…, 807 files).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json.
8. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
9. `check_recovery.py` (expected 106 probes).
10. `validate_package.py --preflight` by its script path, with the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
    Write `<user>` in the evidence.
11. After the commit: the `git ls-tree` digest of HEAD (must be 9c76a1ec…).

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

Subject: Freeze WP5-UX2-T04: Today and Current period buttons

- feat(client):
  - "Today" opens the period that contains the server's `today_local` in the saved
    reporting zone, never the device clock. It moves an open Day editor to today and
    stays focusable with `aria-disabled` when already there.
  - "Current period" returns to the R-07 period the page opens on. It is shown only in
    the five days from the Monday after a period ends to its payroll Friday, away from
    that period, and it only navigates.
  - Jumps are announced in a persistent `aria-live` region.
  - On phones the Review link stays on one line: the full label when it fits, otherwise
    "Sign off" or "Review". The accessible name stays the full label.
  - "Due" uses the label style. Period ranges show an arrow with a hidden "to".
- test: a pure jump model stepped through every day of four periods and the DST ranges,
  with a negative control; `today.spec` in both branches (window and outside), the
  editor, a device zone far from the reporting zone, a shared view, the phone row and
  the first-window-day budget; an eleven-instant simulated-clock sweep passes.
- docs(handoff):
  - the T03-FREEZE results;
  - the T04 record, its two addenda and the evidence;
  - the owner requests and coordinator decisions on the board;
  - the checkpoint (+ vi).

Task: WP5-UX2-T04 (owner request 2026-10-14, item 5 with WP5-UX2-Q1; period-bar items of the later request)
Gate: unit 1865 passed; full e2e desktop 191 passed / 19 skipped, mobile 198 / 12, 0 failed; sweep 11 instants 0 failed; verify exit 0 (worker-reported)
Audit: pending, WP5-UX2-GATE then WP5-UX2-AUDIT after slice T09
Digest: 9c76a1ec (was a42c5b04)

## Push and report

Push per the profile. Append to this brief:
- the pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values, the staged count, and the count per group;
- the report on other modified tracked handoff files;
- every check with its exit code;
- any fix applied or the stop reason.

## Results

(The committer appends results here.)
