# WP5-UX-FIX5-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-FIX5-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX-FIX5 (done).
- This commit freezes the B3-01/B3-02 fix with O-5 and R-7. It also carries every
  coordinator record written since a2ea7a4: the WP5-UX-REGATE2 results and evidence, the
  WP5-UX-AUDIT-A3 (PASS) and WP5-UX-AUDIT-B3 (FIX REQUIRED) reviews and evidence, the
  WP5-UX-FIX4-FREEZE results, the board and the checkpoint pair.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M (many evidence files), risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  a2ea7a48ca7dbb275f5d1f7c3a3003b1658080cb. If either differs, stop and report.
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
  - Use `D:\.claude-tmp\timesheet\WP5-UX-FIX5-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the only changed paths may be these 6 (from WP5-UX-FIX5; all
modified):
- `src/client/DayEditor.tsx`, `src/client/styles.css`
- `tests/e2e/day-editor.spec.ts`, `tests/e2e/timesheet.spec.ts`
- `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md`

`tests/e2e/fix5-probe.spec.ts` must NOT exist (the worker deleted it); if it exists,
stop and report. Report which paths are actually changed. Any other changed or untracked
path outside handoff/ stops the commit. If anything is already staged before you start,
report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
b7bbcbc0a5bbb097a5547b441d1228f20963445e86b0429169cb7ab47980a873. After the commit, the
`git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

New files:
- `handoff/delivery/WP5_UX_REVIEW_A3.md`, `handoff/delivery/WP5_UX_REVIEW_A3.vi.md`,
  `handoff/delivery/WP5_UX_REVIEW_B3.md`, `handoff/delivery/WP5_UX_REVIEW_B3.vi.md`;
- `handoff/delivery/tasks/WP5-UX-REGATE2.md`, `WP5-UX-AUDIT-A3.md`, `WP5-UX-AUDIT-B3.md`,
  `WP5-UX-FIX5.md` (all under `handoff/delivery/tasks/`);
- this brief, as it stands before you append results;
- every file in these evidence folders under `handoff/delivery/evidence/`:
  `WP5-UX-REGATE2/`, `WP5-UX-AUDIT-A3/`, `WP5-UX-AUDIT-B3/`, `WP5-UX-FIX5/`,
  `WP5-UX-FIX4-FREEZE/`. Report the file count per folder and list every `.png` by name.

Modified files:
- `handoff/delivery/tasks/WP5-UX-FIX4-FREEZE.md` (its results);
- `handoff/delivery/ORCHESTRATION.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX-FIX5-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any image whose basename lacks `synthetic`;
- any `.md` file under `evidence/`;
- any `.js`, `.mjs`, `.ts`, `.sh` or `.py` file under `evidence/` (scripts must end in
  `.txt`).

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX-FIX5-FREEZE/checks.txt`.
1. `node --version` (v24.x).
2. The working-tree digest (must be b7bbcbc0…).
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
8. `check_recovery.py` (expected 106 probes).
9. `validate_package.py --preflight` by its script path, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.
10. After the commit: the `git ls-tree` digest of HEAD (must be b7bbcbc0…).

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

Subject: Freeze WP5-UX-FIX5: review dialog stays on top across the 1200px switch

- fix(client): the day editor defers its modal/non-modal switch until no other modal
  dialog is open, so the label-change review keeps the top layer, focus and Escape when
  the window crosses 1200px (B3-01); "Open a day" tokens tuned (8.5rem / 14.25rem) so the
  first row is above the tab bar at 375px too, 390px unchanged (R-7).
- test: desktop e2e for 1280→1024 and 1024→1280 with the review open; the FIX4
  sub-assertion now compares with the measured needed width and fails on a clipping
  mutation (O-5).
- docs: docs/04 (+ vi) line 55: "Open a day" opens any date (B3-02).
- docs(handoff): WP5-UX-REGATE2 PASS records; WP5-UX-AUDIT-A3 (PASS) and
  WP5-UX-AUDIT-B3 (FIX REQUIRED) reviews (+ vi) and evidence; WP5-UX-FIX5 record and
  evidence; FIX4-FREEZE results; board and checkpoint (+ vi).

Task: WP5-UX-FIX5 (addresses WP5-UX-AUDIT-B3 B3-01, B3-02)
Gate: unit 1820 passed; full e2e desktop 84/0/9, mobile 86/0/7; preflight and verify exit 0
Audit: WP5-UX-AUDIT-A3 PASS; rechecks B4 and A4 after WP5-UX-REGATE3
Digest: b7bbcbc0 (was 0b8428fd)

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values and the staged count (per folder);
- every check with its exit code;
- any fix applied or stop reason.

## Results

(committer appends here)
