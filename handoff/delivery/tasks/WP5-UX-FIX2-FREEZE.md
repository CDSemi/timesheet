# WP5-UX-FIX2-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-FIX2-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX-FIX2 (done).
- This commit freezes the A-01 fix (malformed leave input is refused with an accessible
  error and nothing is sent). It also carries every coordinator record written since
  5beae2f: the WP5-UX-GATE results and evidence, the WP5-UX-AUDIT-A and WP5-UX-AUDIT-B
  results, reviews and evidence, the GOV-SUPERSEDE-ACCEPT results, the board and the
  checkpoint pair.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M (many evidence files), risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  5beae2f668d15fc77a39b91a91e2c8bb6195d65a. If either differs, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
    NO `| python`. NEVER PIPE OUTPUT INTO `head` OR `tail`** (redirect to a file in the
    task folder and read it with the Read tool).
  - Create files only in the task folder and the evidence folder.
  - Call Node 24 by its full portable path; make the first shell call a trivial
    `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-UX-FIX2-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the only changed paths may be these 4 (from WP5-UX-FIX2; all
modified):
- `src/client/components/DayFieldsForm.tsx`, `src/client/components/leaveInputModel.ts`
- `tests/client/leaveInputModel.test.ts`, `tests/e2e/day-editor.spec.ts`

Report which are actually changed. Any other changed or untracked path outside handoff/
stops the commit. If anything is already staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
574bbc022ba2a8391e914e351979c60909d76ff6099d249ce23730f2a2c525d8. After the commit, the
`git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

New files:
- `handoff/delivery/WP5_UX_REVIEW_A.md`, `handoff/delivery/WP5_UX_REVIEW_A.vi.md`,
  `handoff/delivery/WP5_UX_REVIEW_B.md`, `handoff/delivery/WP5_UX_REVIEW_B.vi.md`;
- `handoff/delivery/tasks/WP5-UX-GATE.md`, `WP5-UX-AUDIT-A.md`, `WP5-UX-AUDIT-B.md`,
  `WP5-UX-FIX2.md` (all under `handoff/delivery/tasks/`);
- this brief, as it stands before you append results;
- every file in these evidence folders under `handoff/delivery/evidence/`:
  `WP5-UX-GATE/`, `WP5-UX-AUDIT-A/`, `WP5-UX-AUDIT-B/`, `WP5-UX-FIX2/`,
  `GOV-SUPERSEDE-ACCEPT/`. Report the file count per folder and list every `.png` by
  name.

Modified files:
- `handoff/delivery/tasks/GOV-SUPERSEDE-ACCEPT.md` (its results);
- `handoff/delivery/ORCHESTRATION.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX-FIX2-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any image whose basename lacks `synthetic`;
- any `.md` file under `evidence/`;
- any `.js`, `.mjs`, `.ts` or `.py` file under `evidence/` (scripts must end in `.txt`).

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX-FIX2-FREEZE/checks.txt`.
1. `node --version`.
2. The working-tree digest (must be 574bbc02…).
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
8. `check_recovery.py` (expected 106 probes).
9. `validate_package.py --preflight` by its script path, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.
10. After the commit: the `git ls-tree` digest of HEAD (must be 574bbc02…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF in
  a task record or review outside `evidence/`, fix exactly those lines, re-stage the file
  and record the file name.
- If the precommit check blocks an email address or the Windows user name in an evidence
  file under the listed evidence folders, replace each such token with `<email>` or
  `<user>` in that evidence file only, re-stage it and rerun the check.

When to stop:
- If any other check fails, do not commit; report the file, line and rule. Never edit
  source or test files.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX-FIX2: refuse malformed leave input (A-01)

- fix(client): a malformed hours or minutes part of the leave input (badInput,
  non-numeric, negative, out of range) blocks the save, sends nothing and shows an
  accessible alert with aria-invalid; valid input and empty fields behave as before.
- test: leaveInputModel cases and a day-editor e2e case for the auditor's input; a
  pre-existing racy wait in the "future days" case fixed without weakening it.
- docs(handoff): WP5-UX-GATE PASS results and evidence; WP5-UX-AUDIT-A (FIX REQUIRED,
  A-01) and WP5-UX-AUDIT-B (FIX REQUIRED, B-01..B-04) reviews (+ vi) and evidence;
  WP5-UX-FIX2 record and evidence; GOV-SUPERSEDE-ACCEPT results; board and checkpoint
  (+ vi).

Task: WP5-UX-FIX2 (addresses WP5-UX-AUDIT-A A-01)
Gate: unit 1820 passed; full e2e desktop 78/0/3, mobile 79/0/2; verify exit 0
Audit: WP5-UX-AUDIT-A and -B FIX REQUIRED; re-audits after WP5-UX-FIX3 and the regate
Digest: 574bbc02 (was 3d274c9e)

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values and the staged count (per folder);
- every check with its exit code;
- any fix applied or stop reason.

## Results

- Model: claude-sonnet-5-5. Node v24.21.0 (portable).
- Pre-HEAD 5beae2f668d15fc77a39b91a91e2c8bb6195d65a; commit and post-HEAD
  aebc06f85a945b988f0254e2406e30eb4ef244e5; pushed yes; remote SHA the same.
- Digests: working tree before add 574bbc02...c525d8; HEAD ls-tree after commit equal.
- Staged 185: GATE 72 (5 png... 10 png across folders), AUDIT-A 33, AUDIT-B 50, FIX2 11,
  GOV-SUPERSEDE-ACCEPT 2; plus 4 source/test files and handoff records.
- Checks all exit 0: precommit PASS (185), diff --check, JSON, validate_orchestration,
  check_recovery (106), validate_package --preflight. No fixes applied; nothing was
  pre-staged. Details in evidence/WP5-UX-FIX2-FREEZE/checks.txt.
