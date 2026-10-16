# WP5-UX3-FIX1-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-FIX1-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX3-FIX1 (done).
- This commit freezes WP5-UX3-FIX1 (the fixes for the WP5-UX3-GATE FAIL: the Tuesday-proof
  lifted-column test, the seed flake, week-card focus at 768-899px, the two accessible-name
  fixes, a notch-free run shadow). It also carries the coordinator records since cecfceb: the
  T10 freeze results, the failed gate's record and evidence, the read-only sweep's record and
  evidence, the FIX1 record and evidence, the FIX2 brief, the updated audit briefs, the board
  and the checkpoint pair.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk L (large evidence set), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes".
- Branch: main. Expected HEAD = origin/main = cecfceb61c7f15216c8f188e8b7059c9f075247d. If
  HEAD is a descendant whose extra commits touch only `handoff/`, report each and continue;
  otherwise stop and report. Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
    ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -e` (NOT EVEN
    `node -e "1"`). NEVER PIPE OUTPUT INTO `head` OR `tail` (NOT EVEN `head -0`). NEVER
    REDIRECT TO OR FROM `/dev/null`, `/dev/stdout` OR `nul` (NOT EVEN FOR A `--help`
    PROBE).** Redirect to a file in the task folder and read it with the Read tool. To check
    Node, run `node --version` and nothing else.
  - Put Node 24 first on PATH exactly as
    `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
    (no glob) in the same shell call as your first `node --version`, which must print v24.x.
    Stop on ENOSPC.
  - The workflow Python is
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  - Create files only in the task folder and the evidence folder.
  - Use `D:\.claude-tmp\timesheet\WP5-UX3-FIX1-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (11 modified paths)

`src/client/styles.css`, `src/client/components/TimesheetSheet.tsx`,
`src/client/components/SheetWeekTable.tsx`, `src/client/components/sheetModel.ts`,
`src/client/components/labelPickerModel.ts`, `src/client/components/BreakChip.tsx`,
`src/client/components/breakChipModel.ts`, `tests/e2e/timesheet.spec.ts`,
`tests/e2e/day-editor.spec.ts`, `tests/client/sheetModel.test.ts`,
`tests/client/labelPickerModel.test.ts`.

If the working tree differs from this set, do not commit: report the exact difference and
stop. Any path under `src/server/`, `src/domain/`, `docs/`, `scripts/`, AGENTS/CLAUDE,
`.claude/`, `package.json`, the lockfile or `vite.config.ts` always stops the commit. If
anything is already staged, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`: it must equal
e4659145c15f07915d05d831df0478b3026bbedb0d3ec5dc8382b3db03bfd833 (833 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- modified (8): `handoff/delivery/ORCHESTRATION.json`,
  `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`,
  `handoff/delivery/tasks/WP5-UX3-T10-FREEZE.md`, `handoff/delivery/tasks/WP5-UX3-GATE.md`,
  `handoff/delivery/tasks/WP5-UX3-AUDIT-A.md`, `handoff/delivery/tasks/WP5-UX3-AUDIT-B.md`,
  `handoff/delivery/tasks/WP5-UX3-AUDIT-INT.md`;
- new task records (4): `handoff/delivery/tasks/WP5-UX3-SWEEP.md`,
  `handoff/delivery/tasks/WP5-UX3-FIX1.md`, `handoff/delivery/tasks/WP5-UX3-FIX2.md` and
  this brief as it stands before you append results;
- new evidence: `handoff/delivery/evidence/WP5-UX3-T10-FREEZE/checks.txt` and
  `commit-message.txt`, and every file in `handoff/delivery/evidence/WP5-UX3-GATE/`,
  `handoff/delivery/evidence/WP5-UX3-SWEEP/` and `handoff/delivery/evidence/WP5-UX3-FIX1/`.
  Count each folder with the Glob tool first and report the counts; stage a folder only if
  every name ends `.txt` or `-synthetic.png` (probe copies such as `zz-*.ts.txt` or
  `*.sh.txt` are text evidence and allowed).

Report the staged total per group. Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX3-FIX1-FREEZE/` stay unstaged.

**Privacy for the large evidence set.** The precommit check scans every staged file. A
`profile-path` finding in an evidence log may be masked as your profile allows (replace only
the account segment with `<user>`, re-stage, record each file); any other finding (an email
address that is not the full synthetic example.invalid form, a secret-like value, a
non-synthetic image) stops the commit: report file, line and rule, and leave the index
staged.

Other modified tracked handoff files: record `git diff --stat` and the
`--ignore-cr-at-eol --ignore-space-at-eol` stat (names and counts only); leave a
line-ending-only change unstaged and continue; stop on a content change. Any other changed or
untracked path stops the commit (a file named `nul`; any `.raw`, `.xlsx`, `.pdf`, `.eml`,
`.csv`, `.map`, `.ttf` or database file; any image not ending `-synthetic.png`; any `.md`
under `evidence/`).

## Checks before committing

One command per step, each exit code recorded; save the masked output of every step in
`handoff/delivery/evidence/WP5-UX3-FIX1-FREEZE/checks.txt` (required).
1. `node --version` (v24.x).
2. HEAD and origin/main.
3. The working-tree digest (e4659145…, 833 files).
4. `git add` with the explicit paths (folders may be given as explicit folder paths), as its
   own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`); record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json and STATE.json (a script file in the task folder).
8. `handoff/delivery/validate_orchestration.py`.
9. `check_recovery.py` (106 probes).
10. `validate_package.py --preflight` with the workflow Python (`<user>` in the evidence).
11. After the commit: the `git ls-tree` digest of HEAD (e4659145…).

Allowed fixes: trailing whitespace or a blank line at EOF in a task record outside
`evidence/` (fix exactly those lines, re-stage, record the file). A whitespace finding in a
source or test file: do not fix; stop and report the file and line, leaving the index staged.
If a permission check denies a call, stop at once. Do not print diffs, file bodies or
matches.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX3-FIX1: fixes for the round-3 package gate

- fix(client): keyboard focus inside the week card is always scrolled fully into view at
  768-899px; the category picker and break chip names contain their visible text; lifted
  runs cast one continuous shadow without a notch at the joins.
- test: the lifted-column test keeps its neighbour inside the open day's week (passes on
  Tuesdays); the batch stale-version test seeds with the current version (no 409 flake); a
  keyboard walk at 768-899px; run-shadow and name checks.
- docs(handoff): the failed gate WP5-UX3-GATE and its evidence; the read-only sweep
  WP5-UX3-SWEEP; the FIX1 record and evidence; the FIX2 brief; audit brief targets; board and
  checkpoint (+ vi).

Task: WP5-UX3-FIX1 (WP5-UX3-GATE FAIL items)
Gate: WP5-UX3-GATE FAIL on cecfceb; regate pending after FIX2
Audit: pending, WP5-UX3-AUDIT-A, -B, -INT
Digest: e4659145 (was 29ac2594)

## Push and report

Append to this brief: pre- and post-HEAD; commit SHA, pushed, remote SHA; both digests;
staged count per group; other modified handoff files; every check with its exit code; any
fix, masking or stop reason.

## Results

- Self-reported model: claude-sonnet-5-5. Node v24.21.0.
- Pre-HEAD cecfceb61c7f15216c8f188e8b7059c9f075247d (= origin/main); nothing pre-staged.
- Post-HEAD / commit SHA 9187f31bee9c092041887d3ab034c492e33da0b5; pushed yes; remote SHA
  9187f31bee9c092041887d3ab034c492e33da0b5 (branch main, dry-run and push exit 0). No tag.
- Digest before add and on the new HEAD via ls-tree: e4659145c15f07915d05d831df0478b3026bbedb0d3ec5dc8382b3db03bfd833
  (833 files) both times.
- Staged 348: source/test 11; modified handoff 8; new task records 4; evidence T10-FREEZE 2,
  GATE 217, SWEEP 31, FIX1 75 (all names end .txt or -synthetic.png).
- Other modified handoff files: none beyond the listed 8; diff stat and whitespace-ignoring
  stat identical (19 files, 934 insertions, 60 deletions), so no line-ending-only changes.
- Checks and exit codes: node version 0; digest 0; git add 0; precommit-check 0 (348 files,
  0 findings); diff --cached --check 0; JSON parse 0; validate_orchestration 0;
  check_recovery 0 (106 probes); validate_package --preflight 0 (PASS); commit 0.
- No fixes, no masking, no stop reason. Evidence in evidence/WP5-UX3-FIX1-FREEZE/ (unstaged).
- Note: one empty scratch file was created with a shell redirect from an empty here-document by
  mistake (nothing fed to an interpreter); it lives in the temp folder only.
