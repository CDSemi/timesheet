# WP5-UX-FIX3-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-FIX3-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX-FIX3 (done).
- This commit freezes the fixes for WP5-UX-B-01..B-04 plus the phone tab-order addendum.
  It is the last source change of the fix round before WP5-UX-REGATE. It also carries
  the WP5-UX-FIX2-FREEZE results and the coordinator records since aebc06f.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  aebc06f85a945b988f0254e2406e30eb4ef244e5. If either differs, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
    NO `| python`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO
    `/dev/null` OR `nul`.** Redirect to a file in the task folder and read it with the
    Read tool.
  - Create files only in the task folder and the evidence folder.
  - Put Node 24 first on PATH before any node call; make the first shell call a trivial
    `node --version` (must be v24.x), and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-UX-FIX3-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the only changed paths may be these 9 (from WP5-UX-FIX3; all
modified, none new or deleted):
- `src/client/DayEditor.tsx`, `src/client/TimesheetScreen.tsx`,
  `src/client/components/PeriodBar.tsx`, `src/client/styles.css`
- `tests/e2e/day-editor.spec.ts`, `tests/e2e/import.spec.ts`, `tests/e2e/timesheet.spec.ts`
- `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md`

Report which are actually changed. Any other changed or untracked path outside handoff/
stops the commit. If anything is already staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
8c07aac5fbd539b2f43ae8a21fb456f2be950d628f7eb9ca647430c7469f0a2e. After the commit, the
`git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

New files:
- `handoff/delivery/tasks/WP5-UX-FIX3.md`;
- this brief, as it stands before you append results;
- every file in `handoff/delivery/evidence/WP5-UX-FIX3/` (twenty-one files: eighteen
  `.txt` and exactly three synthetic screenshots
  `fix3-phone-390x844-first-screen-synthetic.png`,
  `fix3-desktop-1024x800-panel-open-synthetic.png`,
  `fix3-desktop-1280x800-panel-open-synthetic.png`);
- every file in `handoff/delivery/evidence/WP5-UX-FIX2-FREEZE/` (`checks.txt`,
  `commit-message.txt`).

Modified files:
- `handoff/delivery/tasks/WP5-UX-FIX2-FREEZE.md` (its results);
- `handoff/delivery/ORCHESTRATION.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX-FIX3-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any `.png` other than the three listed, or any image whose basename lacks `synthetic`;
- any `.md` file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX-FIX3-FREEZE/checks.txt`.
1. `node --version` (v24.x).
2. The working-tree digest (must be 8c07aac5…).
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
8. `check_recovery.py` (expected 106 probes).
9. `validate_package.py --preflight` by its script path, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.
10. After the commit: the `git ls-tree` digest of HEAD (must be 8c07aac5…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF in
  a task record outside `evidence/`, fix exactly those lines, re-stage the file and
  record the file name.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log under `evidence/WP5-UX-FIX3/` or `evidence/WP5-UX-FIX2-FREEZE/`, replace each such
  token with `<email>` or `<user>` in that evidence file only, re-stage it and rerun the
  check.

When to stop:
- If any other check fails, do not commit; report the file, line and rule. Never edit
  source, test or docs files.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX-FIX3: phone first screen, modal editor below 1200px

- fix(client):
  - phone: compact period card (< > beside the title), one-row clock and tools,
    screen-reader-only page heading and form title; the first day row is above the tab
    bar at 390x844 (B-01);
  - below 1200px the day editor is modal (inert page, focus trap) so no focused sheet
    control is hidden; non-modal from 1200px; Escape closes it from anywhere unless a
    nested dialog or picker handles it (B-02);
  - period-card tab order follows the visual order (previous, next, review).
- test: first-row position, panel-at-1024 focus, Escape-from-sheet and tab-order
  assertions; import admin absence checks restored in both projects (B-03).
- docs: docs/04 (+ vi) label picker wording, "Missing record", panel behaviour (B-02,
  B-04).
- docs(handoff): WP5-UX-FIX3 record, evidence and synthetic screenshots;
  WP5-UX-FIX2-FREEZE results; board and checkpoint (+ vi).

Task: WP5-UX-FIX3 (addresses WP5-UX-AUDIT-B B-01..B-04)
Gate: unit 1820 passed; full e2e desktop 82, mobile 82, 10 skipped, 0 failed; preflight and verify exit 0
Audit: re-audits A2 and B2 after WP5-UX-REGATE
Digest: 8c07aac5 (was 574bbc02)

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values and the staged count;
- every check with its exit code;
- any fix applied or stop reason.

## Results

- Pre-HEAD aebc06f85a945b988f0254e2406e30eb4ef244e5 (= origin/main); post-HEAD and
  commit SHA 589bcff5541a603abad696a3303dbea11cccb4a7; pushed yes; remote SHA the same.
- Digest before add 8c07aac5fbd539b2f43ae8a21fb456f2be950d628f7eb9ca647430c7469f0a2e;
  HEAD ls-tree digest identical. Staged count 38; all 9 source/test/docs paths changed.
- Checks (all exit 0): node v24.21.0; digest; git add; precommit (38 files, 0 findings);
  diff --cached --check; JSON parse; validate_orchestration; check_recovery (106 probes);
  validate_package --preflight.
- No fix applied, nothing unstaged, no stop. Evidence: evidence/WP5-UX-FIX3-FREEZE/.
