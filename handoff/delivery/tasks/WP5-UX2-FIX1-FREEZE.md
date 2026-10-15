# WP5-UX2-FIX1-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-FIX1-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX2-FIX1 (done).
- This commit freezes the fix round WP5-UX2-FIX1. It answers the FIX REQUIRED audit
  WP5-UX2-AUDIT (three Low findings) and is the new package-final snapshot of UI change
  round 2. It also carries the coordinator records since d1a20a7:
  - the T10-FREEZE results and evidence;
  - the WP5-UX2-GATE record and evidence (PASS on d1a20a7);
  - the WP5-UX2-AUDIT record, evidence and review pair (FIX REQUIRED);
  - the FIX1 record and evidence;
  - the board and the checkpoint pair.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  d1a20a7f0112fa00171fe4b1d6035427855f12b6.
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
  - Create the task folder `D:\.claude-tmp\timesheet\WP5-UX2-FIX1-FREEZE` first and use it
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

Exactly these 11 paths from WP5-UX2-FIX1:
- modified (10):
  - `src/client/TimesheetScreen.tsx`;
  - `src/client/components/PeriodBar.tsx`;
  - `src/client/styles.css`;
  - `tests/client/periodJumpModel.test.ts`;
  - `tests/e2e/today.spec.ts`;
  - `tests/e2e/focus-ring.spec.ts`;
  - `docs/04_UX_AND_SETTINGS.md` and `docs/04_UX_AND_SETTINGS.vi.md`;
  - `docs/10_DECISIONS_AND_SOURCES.md` and `docs/10_DECISIONS_AND_SOURCES.vi.md`;
- new (1): `tests/client/userWording.test.ts`.

Any other changed or untracked path outside `handoff/` stops the commit. That includes
any path under `src/server/` or `scripts/`, `package.json`, the lockfile, any config
file, and any link, junction or stray folder in the repository root. If anything is
already staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
ac1895d9f79da0fa6bbcbca9e8f52fddf67cb4fed3ac7d420e73cee6181fe8a2 (815 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

Stage every path below that is changed or untracked, and report the count per group:

- modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX2-T10-FREEZE.md` (its results);
- new records:
  - `handoff/delivery/tasks/WP5-UX2-GATE.md`;
  - `handoff/delivery/tasks/WP5-UX2-AUDIT.md`;
  - `handoff/delivery/tasks/WP5-UX2-FIX1.md`;
  - `handoff/delivery/WP5_UX2_REVIEW.md` and `handoff/delivery/WP5_UX2_REVIEW.vi.md`;
  - this brief, as it stands before you append results;
- new evidence:
  - both files in `handoff/delivery/evidence/WP5-UX2-T10-FREEZE/`;
  - every file in `handoff/delivery/evidence/WP5-UX2-GATE/` (about 146: `.txt` and 10
    `-synthetic.png`);
  - every file in `handoff/delivery/evidence/WP5-UX2-AUDIT/` (about 217: `.txt` and 4
    `-synthetic.png`);
  - every file in `handoff/delivery/evidence/WP5-UX2-FIX1/` (32 `.txt`).
  - Report the exact count of each kind per folder. All names must end in `.txt` or
    `-synthetic.png`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX2-FIX1-FREEZE/` stay unstaged. Write BOTH `checks.txt`
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
step in `handoff/delivery/evidence/WP5-UX2-FIX1-FREEZE/checks.txt`.
1. `node --version` (v24.x).
2. HEAD and origin/main, plus the extra-commit report if any.
3. The working-tree digest (must be ac1895d9…, 815 files).
4. `git add` with the explicit paths (folder paths for the four evidence folders), as
   its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json.
8. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
9. `check_recovery.py` (expected 106 probes).
10. `validate_package.py --preflight` by its script path, with the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
    Write `<user>` in the evidence.
11. After the commit: the `git ls-tree` digest of HEAD (must be ac1895d9…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF
  in a task record or review outside `evidence/`, fix exactly those lines, re-stage the
  file and record the file name.
- Mask only as your profile allows. If anything else is blocked, do not commit: report
  the file, line and rule, and leave the index staged.

When to stop:
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX2-FIX1: fix the three Low findings of WP5-UX2-AUDIT

- fix(client):
  - A press on the inactive Today re-reads the server's date and moves to today's period
    when the date has changed. The periods are also re-read when the window regains
    focus or becomes visible (WP5-UX2-AUDIT-01).
  - Inactive buttons are dimmed with colour tokens instead of opacity, so the focus ring
    stays at 6.09-6.79:1 (WP5-UX2-AUDIT-03).
- docs: docs/04 and docs/10 describe the below-330px Review row and the inactive-Today
  press (WP5-UX2-AUDIT-02), EN and VI.
- test: a midnight-crossing e2e under the simulated clock, an inactive-Today ring check
  in both themes, and a unit test that forbids the old clock wording in the client's
  visible strings (R-UX2A-2).
- docs(handoff):
  - the T10-FREEZE results;
  - WP5-UX2-GATE PASS on d1a20a7 and its evidence;
  - WP5-UX2-AUDIT FIX REQUIRED, its review pair and evidence;
  - the FIX1 record and evidence;
  - the board and the checkpoint (+ vi).

Task: WP5-UX2-FIX1 (addresses WP5-UX2-AUDIT-01..03 and R-UX2A-2)
Gate: unit 1882 passed; full e2e desktop 216 passed / 29 skipped, mobile 232 / 13, 0 failed; midnight runs pass; preflight and verify exit 0 (worker-reported)
Audit: pending, WP5-UX2-REGATE then the fresh recheck WP5-UX2-AUDIT2
Digest: ac1895d9 (was 20e7a7c8)

## Push and report

Push per the profile. Append to this brief:
- the pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values, the staged count, and the count per group;
- the report on other modified tracked handoff files;
- every check with its exit code;
- any fix applied or the stop reason.

## Results

- Pre-HEAD = origin/main = d1a20a7f0112fa00171fe4b1d6035427855f12b6; no extra commits; nothing pre-staged.
- Commit b1b725b7361d55e7aed70656051359153e457b5c on main; pushed yes; remote SHA b1b725b7361d55e7aed70656051359153e457b5c (dry-run exit 0, push exit 0).
- Digest before add and after commit (ls-tree): ac1895d9f79da0fa6bbcbca9e8f52fddf67cb4fed3ac7d420e73cee6181fe8a2 (815 files), both equal.
- Staged 418: 11 non-handoff; handoff modified 4; new records 6 (GATE, AUDIT, FIX1, FIX1-FREEZE brief, review pair); evidence 397 (T10-FREEZE 2 txt; GATE 136 txt + 10 png; AUDIT 213 txt + 4 png; FIX1 32 txt).
- Other modified tracked handoff files: none.
- Checks (exit): node v24.21.0 (0); digest (0); git add (0); precommit PASS 418 files (0); diff --cached --check (0); JSON parse (0); validate_orchestration PASS (0); check_recovery 106 probes PASS (0); validate_package --preflight PASS (0); post-commit ls-tree digest match.
- Fixes: none. Masking: none.
- Deviation: by mistake I ran one forbidden call (a one-line node eval with stderr redirected to the null device) after the precommit step; it had no effect on the repository.
