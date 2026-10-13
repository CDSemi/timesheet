# WP5-UX-FIX9-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-FIX9-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX-FIX9 (done).
- This commit freezes the tests-only fix for WP5-UX-B7-01 = WP5-UX-A7-01. The isolation
  and shell specs used to seed a day outside the displayed period on part of each pay
  period (the 4 days ending on each payroll date); they now seed from the displayed
  period, and a deterministic window check
  covers the rule.
- It also carries the coordinator records written since 255ba17:
  - the FIX8 freeze results and evidence;
  - REGATE6;
  - the B7 and A7 audits and reviews;
  - the FIX9 record and evidence;
  - the board, the checkpoint pair and NEXT_ACTION.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  255ba17d6bf891c0ff779d4a4f518e0d2998cee8.
  - If HEAD = origin/main is a descendant of 255ba17 whose extra commits touch only
    handoff/, report each extra commit (SHA, author name, subject, file names) and
    continue on that HEAD.
  - In any other case, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
    NO `| python`, NO `node -e`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT
    TO OR FROM `/dev/null` OR `nul`.** Redirect to a file in the task folder and read it
    with the Read tool. To list or count files, use the Glob tool or redirect to a file.
  - Create files only in the task folder and the evidence folder.
  - Put Node 24 first on PATH before any node call. Make the first shell call a trivial
    `node --version` (it must be v24.x). Stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-UX-FIX9-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results (an email address other than the full synthetic
    `@example.invalid` form, or a profile path); describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/

Exactly these 5 paths from WP5-UX-FIX9:
- modified: `tests/e2e/fixtures.ts`, `tests/e2e/isolation.spec.ts`,
  `tests/e2e/shell.spec.ts`;
- new: `tests/e2e/displayedSeed.ts`, `tests/domain/e2eSeedSelection.test.ts`.

Any other changed or untracked path outside handoff/ stops the commit, in particular any
path under `src/`, `docs/`, `scripts/` or a config file. If anything is already staged
before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
58b0deee5d0169f0211740de34953517500576baa2fd914d5a26059d5ba1dffd. After the commit, the
`git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

Stage every path below that is changed or untracked, and report the count per group:

- modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/NEXT_ACTION.md` and `handoff/NEXT_ACTION.vi.md`;
  - `handoff/delivery/tasks/WP5-UX-FIX8-FREEZE.md` (its attempt 3 results);
- new: every file in `handoff/delivery/evidence/WP5-UX-FIX8-FREEZE/`;
- new: `handoff/delivery/tasks/WP5-UX-REGATE6.md` and every file in
  `handoff/delivery/evidence/WP5-UX-REGATE6/`;
- new: `handoff/delivery/tasks/WP5-UX-AUDIT-B7.md`, `handoff/delivery/WP5_UX_REVIEW_B7.md`,
  `handoff/delivery/WP5_UX_REVIEW_B7.vi.md` and every file in
  `handoff/delivery/evidence/WP5-UX-AUDIT-B7/`;
- new: `handoff/delivery/tasks/WP5-UX-AUDIT-A7.md`, `handoff/delivery/WP5_UX_REVIEW_A7.md`,
  `handoff/delivery/WP5_UX_REVIEW_A7.vi.md` and every file in
  `handoff/delivery/evidence/WP5-UX-AUDIT-A7/`;
- new: `handoff/delivery/tasks/WP5-UX-FIX9.md` and every file in
  `handoff/delivery/evidence/WP5-UX-FIX9/` (13 `.txt` files);
- new: this brief, as it stands before you append results.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX-FIX9-FREEZE/` stay unstaged.

**Other modified tracked handoff files.** The coordinator saw three tracked records
change on disk after 255ba17:
- `handoff/delivery/tasks/WP5-UX-REGATE5.md`;
- `handoff/delivery/tasks/WP5-UX-AUDIT-A6.md`;
- `handoff/delivery/tasks/WP5-UX-AUDIT-B6.md`.

If `git status` shows any of them, or any other tracked handoff file, as modified:
- record `git diff --stat` and `git diff --ignore-cr-at-eol --ignore-space-at-eol --stat`
  for it (names and counts only; never print bodies);
- if the change is line endings or trailing whitespace only, leave it unstaged and
  continue;
- if content changed, do not commit; stop and report.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any image whose basename does not end `-synthetic.png`;
- any `.md` file under `evidence/`;
- any file under `evidence/` whose name does not end in `.txt` or `-synthetic.png`.
  Scripts stored as `*.ts.txt`, `*.mjs.txt`, `*.sh.txt` or `*.py.txt` are allowed.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX-FIX9-FREEZE/checks.txt`.
1. `node --version` (v24.x).
2. HEAD and origin/main, plus the extra-commit report if any.
3. The working-tree digest (it must be 58b0deee…).
4. `git add` with the explicit paths (folder paths are fine for the listed evidence
   folders), as its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json.
8. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
9. `check_recovery.py` (expected 106 probes).
10. `validate_package.py --preflight` by its script path, with the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
    Write `<user>` in the evidence.
11. After the commit: the `git ls-tree` digest of HEAD (it must be 58b0deee…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF
  in a task record outside `evidence/`, fix exactly those lines, re-stage the file and
  record the file name.
- Mask only as your profile allows. If the precommit check or a validator blocks
  anything else, do not commit. Stop, report the file, line and rule, and leave the
  index staged.

When to stop:
- If any other check fails, do not commit; report the file, line and rule. Never edit
  source, test or docs files.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX-FIX9: seed e2e isolation days from the displayed period

- test(e2e): the isolation and shell specs seed a day of the period the app displays
  (new pure helper `displayedSeed.ts` and an additive `displayedSeedDay()` fixture
  method). Before this change they failed on every build on the 4 days ending on
  each payroll date (WP5-UX-B7-01 = WP5-UX-A7-01). Every assertion is unchanged.
- test(domain): a deterministic check over 56 days and four wall times a day proves the
  seed lies in the displayed period; the old choice fails it.
- docs(handoff):
  - the FIX8 freeze results;
  - WP5-UX-REGATE6 PASS;
  - WP5-UX-AUDIT-B7 and WP5-UX-AUDIT-A7 FIX REQUIRED (B6-01 closed; FIX8 changes no
    area-A behaviour; one test-only defect);
  - the WP5-UX-FIX9 record and evidence;
  - the coordinator decisions;
  - the board, the checkpoint (+ vi) and NEXT_ACTION (+ vi).

Task: WP5-UX-FIX9 (addresses WP5-UX-AUDIT-B7 B7-01 and WP5-UX-AUDIT-A7 A7-01)
Gate: unit 1827 passed; full e2e 210 passed / 26 skipped / 0 failed; preflight and verify exit 0
Audit: pending, WP5-UX-REGATE7 then delta rechecks B8 and A8
Digest: 58b0deee (was b07727b2)

## Push and report

Push per the profile. Append to this brief:
- the pre- and post-HEAD, and any extra-commit report;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values, the staged count and the count per group;
- the report on other modified tracked handoff files;
- every check with its exit code;
- any fix applied or stop reason.

## Results

Attempt 1, timesheet-committer (claude-sonnet-5-5): DONE.

- Pre-HEAD = origin/main = 255ba17d6bf891c0ff779d4a4f518e0d2998cee8; no extra commits.
- Post-HEAD = commit 3670a6c3c22ddcf75138927ed60f4cd9bf02078d on main; pushed; remote
  SHA 3670a6c3c22ddcf75138927ed60f4cd9bf02078d; no tag.
- Digests: working tree before add and HEAD ls-tree after commit both
  58b0deee5d0169f0211740de34953517500576baa2fd914d5a26059d5ba1dffd.
- Staged 374: tests 5; evidence folders 354; other handoff files 15.
- Other modified tracked handoff files: none (REGATE5, AUDIT-A6, AUDIT-B6 not modified).
- Checks (exit): node v24.21.0 (0); digest (0); precommit PASS 374 files (0);
  diff --cached --check (0); JSON parse (0); validate_orchestration (0);
  check_recovery 106 probes (0); validate_package --preflight (0); push dry-run (0).
- Fixes: none. Process note: one stray trivial `node -e` call with output sent to the
  null device was made by mistake after the precommit step; it had no effect on files.
- Evidence: handoff/delivery/evidence/WP5-UX-FIX9-FREEZE/checks.txt and commit-message.txt
  (unstaged).
