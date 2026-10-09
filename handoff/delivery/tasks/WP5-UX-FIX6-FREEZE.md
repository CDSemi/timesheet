# WP5-UX-FIX6-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-FIX6-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX-FIX6 (done).
- This commit freezes the fix for WP5-UX-B4-01 (focus ring) and B4-02 (due-date format)
  chosen by the owner (WP5-UX-Q1, option a). It also carries the coordinator records
  since 49a3ff0 (owner answer, FIX6 record and evidence, reconciliation, board,
  checkpoint pair).
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  49a3ff04a9cb68d8a5f565b43fa52129bca0fd6c (the owner's handoff-only checkpoint commit
  after c24d634, reconciled by WP5-UX-RECON1). If either differs, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
    NO `| python`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM
    `/dev/null` OR `nul`.** Redirect to a file in the task folder and read it with the
    Read tool.
  - Create files only in the task folder and the evidence folder.
  - Put Node 24 first on PATH before any node call; make the first shell call a trivial
    `node --version` (must be v24.x), and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-UX-FIX6-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the only changed paths may be these 8 (from WP5-UX-FIX6):
- Modified: `src/client/styles.css`, `src/client/components/PeriodBar.tsx`,
  `src/client/components/periodBarModel.ts`, `tests/client/periodBarModel.test.ts`,
  `tests/e2e/timesheet.spec.ts`, `docs/04_UX_AND_SETTINGS.md`,
  `docs/04_UX_AND_SETTINGS.vi.md`.
- New: `tests/e2e/focus-ring.spec.ts`.

Report which are actually changed. Any other changed or untracked path outside handoff/
stops the commit. If anything is already staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
07c3ca00b3408af0c6337e5159635675cead86fbdc1c63f2454c2346a27ce635. After the commit, the
`git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

New files:
- this brief, as it stands before you append results;
- every file in `handoff/delivery/evidence/WP5-UX-FIX6/` (nineteen files: thirteen `.txt`
  and exactly six synthetic screenshots `fix6-focus-button-light-synthetic.png`,
  `fix6-focus-button-dark-synthetic.png`, `fix6-focus-phone-tab-light-synthetic.png`,
  `fix6-focus-phone-tab-dark-synthetic.png`, `fix6-focus-sheet-date-light-synthetic.png`,
  `fix6-focus-sheet-date-dark-synthetic.png`).

Modified files:
- `handoff/delivery/tasks/WP5-UX-FIX6.md` (status line and results);
- `handoff/delivery/ORCHESTRATION.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX-FIX6-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any `.png` other than the six listed, or any image whose basename lacks `synthetic`;
- any `.md` file under `evidence/`;
- any `.js`, `.mjs`, `.ts`, `.sh` or `.py` file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX-FIX6-FREEZE/checks.txt`.
1. `node --version` (v24.x).
2. The working-tree digest (must be 07c3ca00…).
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
8. `check_recovery.py` (expected 106 probes).
9. `validate_package.py --preflight` by its script path, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.
10. After the commit: the `git ls-tree` digest of HEAD (must be 07c3ca00…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF in
  a task record outside `evidence/`, fix exactly those lines, re-stage the file and
  record the file name.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log under `evidence/WP5-UX-FIX6/`, replace each such token with `<email>` or `<user>`
  in that evidence file only, re-stage it and rerun the check.

When to stop:
- If any other check fails, do not commit; report the file, line and rule. Never edit
  source, test or docs files.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX-FIX6: visible focus ring and US due date (B4-01, B4-02)

- fix(client):
  - the shared focus indicator is a solid 2px accent ring with a 1px card-coloured gap
    (WCAG technique C40), plus an inset variant for the phone tabs; it measures 5.2 to
    7.5:1 against every adjacent surface in both themes (was 1.72:1 / 2.46:1) (B4-01);
  - the period-bar zone note shows the display-zone due time in the US format of the bar
    ("Wed 10/14/2026, 07:00") (B4-02); display only.
- test: new focus-ring e2e contrast check (fails on the old tokens); zone-note assertion
  and periodBarModel cases.
- docs: docs/04 (+ vi) focus description.
- docs(handoff): owner answer WP5-UX-Q1 (a); WP5-UX-FIX6 record and evidence;
  reconciliation of the owner's commit 49a3ff0; board and checkpoint (+ vi).

Task: WP5-UX-FIX6 (addresses WP5-UX-AUDIT-B4 B4-01, B4-02; owner answer WP5-UX-Q1 a)
Gate: unit 1821 passed; full e2e 174/0/16; preflight and verify exit 0
Audit: WP5-UX-AUDIT-A4 PASS; rechecks B5 and A5 after WP5-UX-REGATE4
Digest: 07c3ca00 (was b7bbcbc0)

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values and the staged count;
- every check with its exit code;
- any fix applied or stop reason.

## Results

(committer appends here)
