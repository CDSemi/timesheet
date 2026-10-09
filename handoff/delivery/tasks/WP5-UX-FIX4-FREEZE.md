# WP5-UX-FIX4-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-FIX4-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX-FIX4 (done).
- This commit freezes the B2-01 fix (the phone "Open a day" field shows the full date at
  360 and 320px) with O-1..O-3. It also carries every coordinator record written since
  589bcff: the WP5-UX-REGATE results and evidence, the WP5-UX-AUDIT-A2 (PASS) and
  WP5-UX-AUDIT-B2 (FIX REQUIRED) reviews and evidence, the WP5-UX-FIX3-FREEZE results,
  the board and the checkpoint pair.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M (many evidence files), risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  589bcff5541a603abad696a3303dbea11cccb4a7. If either differs, stop and report.
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
  - Use `D:\.claude-tmp\timesheet\WP5-UX-FIX4-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the only changed paths may be these 5 (from WP5-UX-FIX4; all
modified):
- `src/client/styles.css`, `src/client/DayEditor.tsx`
- `tests/e2e/timesheet.spec.ts`
- `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md`

Report which are actually changed. Any other changed or untracked path outside handoff/
stops the commit. If anything is already staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
0b8428fdbfc40598ba0c468486b4aa62367434727709ce62461a8984f130b77d. After the commit, the
`git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

New files:
- `handoff/delivery/WP5_UX_REVIEW_A2.md`, `handoff/delivery/WP5_UX_REVIEW_A2.vi.md`,
  `handoff/delivery/WP5_UX_REVIEW_B2.md`, `handoff/delivery/WP5_UX_REVIEW_B2.vi.md`;
- `handoff/delivery/tasks/WP5-UX-REGATE.md`, `WP5-UX-AUDIT-A2.md`, `WP5-UX-AUDIT-B2.md`,
  `WP5-UX-FIX4.md` (all under `handoff/delivery/tasks/`);
- this brief, as it stands before you append results;
- every file in these evidence folders under `handoff/delivery/evidence/`:
  `WP5-UX-REGATE/`, `WP5-UX-AUDIT-A2/`, `WP5-UX-AUDIT-B2/`, `WP5-UX-FIX4/`,
  `WP5-UX-FIX3-FREEZE/`. Report the file count per folder and list every `.png` by name.

Modified files:
- `handoff/delivery/tasks/WP5-UX-FIX3-FREEZE.md` (its results);
- `handoff/delivery/ORCHESTRATION.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX-FIX4-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any image whose basename lacks `synthetic`;
- any `.md` file under `evidence/`;
- any `.js`, `.mjs`, `.ts` or `.py` file under `evidence/` (scripts must end in `.txt`).

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX-FIX4-FREEZE/checks.txt`.
1. `node --version` (v24.x).
2. The working-tree digest (must be 0b8428fd…).
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
8. `check_recovery.py` (expected 106 probes).
9. `validate_package.py --preflight` by its script path, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.
10. After the commit: the `git ls-tree` digest of HEAD (must be 0b8428fd…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF in
  a task record or review outside `evidence/`, fix exactly those lines, re-stage the file
  and record the file name.
- If the precommit check blocks an email address or the Windows user name in an evidence
  file under the listed evidence folders, replace each such token with `<email>` or
  `<user>` in that evidence file only, re-stage it and rerun the check.

When to stop:
- If any other check fails, do not commit; report the file, line and rule. Never edit
  source, test or docs files.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX-FIX4: full date in the phone "Open a day" field (B2-01)

- fix(client): tokens `--date-field-min` and `--open-day-label-min`; the phone "Open a
  day" row wraps when it does not fit, so the field shows the full date at 360 and 320px
  (220 and 180px wide); the 390x844 layout is unchanged; duplicated phone rule merged.
- test: phone assertion for the field width and full value at 390, 360 and 320px.
- docs: docs/04 (+ vi) line 9 describes the side panel from 1200px and the modal panel
  below; DayEditor comment says 1200px.
- docs(handoff): WP5-UX-REGATE PASS results and evidence; WP5-UX-AUDIT-A2 (PASS) and
  WP5-UX-AUDIT-B2 (FIX REQUIRED, B2-01) reviews (+ vi) and evidence; WP5-UX-FIX4 record
  and evidence; WP5-UX-FIX3-FREEZE results; board and checkpoint (+ vi).

Task: WP5-UX-FIX4 (addresses WP5-UX-AUDIT-B2 B2-01)
Gate: unit 1820 passed; full e2e 167/0/13; preflight and verify exit 0
Audit: WP5-UX-AUDIT-A2 PASS; rechecks B3 and A3 after WP5-UX-REGATE2
Digest: 0b8428fd (was 8c07aac5)

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values and the staged count (per folder);
- every check with its exit code;
- any fix applied or stop reason.

## Results

- Pre-HEAD 589bcff5541a603abad696a3303dbea11cccb4a7 (= origin/main); post-HEAD and commit
  a2ea7a48ca7dbb275f5d1f7c3a3003b1658080cb; pushed yes; remote SHA the same.
- Digests: working tree and HEAD ls-tree both 0b8428fdbfc40598ba0c468486b4aa62367434727709ce62461a8984f130b77d.
- Nothing was staged beforehand. All 5 non-handoff paths were changed (modified).
- Staged 246 files; evidence counts: REGATE 65, AUDIT-A2 73, AUDIT-B2 75, FIX4 13,
  FIX3-FREEZE 2. PNGs (all synthetic): REGATE 10, AUDIT-A2 2, AUDIT-B2 8, FIX4 3.
- Checks (exit): node v24.21.0 (0); digest (0); git add (0); precommit PASS 246 files (0);
  diff --cached --check (0); JSON parse (0); validate_orchestration PASS (0);
  check_recovery PASS 106 probes (0); validate_package --preflight PASS (0).
- No fix applied; no stop. Evidence: evidence/WP5-UX-FIX4-FREEZE/checks.txt.
