# WP5-UX-FIX8-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-FIX8-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX-FIX8 (done).
- This commit freezes the fix for WP5-UX-B6-01 (phone first screen with a received
  share and the zone note). It also carries the coordinator records since bf954c0:
  - the FIX7 freeze results and evidence;
  - the REGATE5 gate;
  - the B6 and A6 audits and reviews;
  - the FIX8 record and evidence;
  - the board, the checkpoint pair and NEXT_ACTION.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  bf954c0b371ad9a5fe461a603c5d476ea210e66c. If either differs, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
    NO `| python`, NO `node -e`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT
    TO OR FROM `/dev/null` OR `nul`.** Redirect to a file in the task folder and read it
    with the Read tool. To list or count files, use the Glob tool or redirect to a file.
  - Create files only in the task folder and the evidence folder.
  - Put Node 24 first on PATH before any node call; make the first shell call a trivial
    `node --version` (must be v24.x), and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-UX-FIX8-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    (an email address other than the full synthetic `@example.invalid` form, or a
    profile path) verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/

Exactly these 2 modified paths from WP5-UX-FIX8: `src/client/styles.css` and
`tests/e2e/sharing.spec.ts`. Any other changed or untracked path outside handoff/ stops
the commit. If anything is already staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
b07727b2f95b4e202e9e0dc391512b051b288218ceb3e2ffe93f0f1c14a95abe. After the commit, the
`git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

Stage every path below that is changed or untracked, and report the count per group:

- modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/NEXT_ACTION.md` and `handoff/NEXT_ACTION.vi.md`;
  - `handoff/delivery/tasks/WP5-UX-FIX7-FREEZE.md` (attempt 3 results);
- new: every file in `handoff/delivery/evidence/WP5-UX-FIX7-FREEZE/`;
- new: `handoff/delivery/tasks/WP5-UX-REGATE5.md` and every file in
  `handoff/delivery/evidence/WP5-UX-REGATE5/`;
- new: `handoff/delivery/tasks/WP5-UX-AUDIT-B6.md`, `handoff/delivery/WP5_UX_REVIEW_B6.md`,
  `handoff/delivery/WP5_UX_REVIEW_B6.vi.md` and every file in
  `handoff/delivery/evidence/WP5-UX-AUDIT-B6/`;
- new: `handoff/delivery/tasks/WP5-UX-AUDIT-A6.md`, `handoff/delivery/WP5_UX_REVIEW_A6.md`,
  `handoff/delivery/WP5_UX_REVIEW_A6.vi.md` and every file in
  `handoff/delivery/evidence/WP5-UX-AUDIT-A6/`;
- new: `handoff/delivery/tasks/WP5-UX-FIX8.md` and every file in
  `handoff/delivery/evidence/WP5-UX-FIX8/` (12 files: 11 `.txt` and
  `first-share-note-390-synthetic.png`);
- new: this brief, as it stands before you append results.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX-FIX8-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any image whose basename does not end `-synthetic.png`;
- any `.md` file under `evidence/`;
- any file under `evidence/` whose name does not end in `.txt` or `-synthetic.png`
  (scripts are stored as `*.ts.txt`, `*.mjs.txt`, `*.sh.txt` or `*.py.txt`, which is
  allowed).

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX-FIX8-FREEZE/checks.txt`.
1. `node --version` (v24.x).
2. HEAD and origin/main (both bf954c0).
3. The working-tree digest (must be b07727b2…).
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
11. After the commit: the `git ls-tree` digest of HEAD (must be b07727b2…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF in
  a task record outside `evidence/`, fix exactly those lines, re-stage the file and
  record the file name.
- Masking only as your profile allows. If the precommit check blocks anything else (for
  example an email token), do not commit; stop and report the file, line and rule, and
  leave the index staged.

When to stop:
- If any other check fails, do not commit; report the file, line and rule. Never edit
  source, test or docs files.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX-FIX8: phone first screen with a received share (B6-01)

- fix(client): below 768px the shell bar stays one row when "Shared with me" is shown:
  - a smaller visible switcher label, a tighter gap and no label block padding;
  - a new `--switcher-basis` token;
  - the select and Open keep 44px.
  The first day row now stays above the tab bar at 390x844 in all four share and
  zone-note states (WP5-UX-B6-01; docs/04 line 48).
- test: two mobile e2e checks for a person with a received share, with and without the
  zone note (fail on bf954c0).
- docs(handoff):
  - the FIX7 freeze results;
  - WP5-UX-REGATE5 PASS;
  - WP5-UX-AUDIT-A6 PASS (supersedes A5 and its chain);
  - WP5-UX-AUDIT-B6 FIX REQUIRED (B6-01; every accessibility item closed);
  - the WP5-UX-FIX8 record and evidence;
  - the coordinator decisions;
  - board, checkpoint (+ vi) and NEXT_ACTION (+ vi).

Task: WP5-UX-FIX8 (addresses WP5-UX-AUDIT-B6 B6-01)
Gate: unit 1823 passed; full e2e 210 passed / 26 skipped / 0 failed; preflight and verify exit 0
Audit: pending, WP5-UX-REGATE6 then delta rechecks B7 and A7
Digest: b07727b2 (was b7c011d2)

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values, the staged count and the count per group;
- every check with its exit code;
- any fix applied or stop reason.

## Addendum for attempt 2 (coordinator, 2026-10-09)

Attempt 1 stopped because the board listed two FIX7-FREEZE evidence files that were never
written. The coordinator corrected the board's evidence list and updated the checkpoint
pair. Attempt 2:
- confirm that HEAD = origin/main is still bf954c0, and record the staged list before
  any `git add` (it must be the 393 paths of attempt 1);
- recompute the working-tree digest (b07727b2…);
- re-add `handoff/delivery/ORCHESTRATION.json`, both checkpoint files and this brief
  (as it stands before you append attempt 2 results); expected staged count is still
  393;
- rerun every check (precommit, diff check, JSON parse, validator, check_recovery,
  preflight), saving the output as
  `handoff/delivery/evidence/WP5-UX-FIX8-FREEZE/checks-attempt2.txt`;
- commit, push, and check the HEAD ls-tree digest.

## Addendum for attempt 3 (coordinator, 2026-10-09)

Attempt 2 stopped on the validator: WP5-UX-FIX8 listed the FIX REQUIRED audit
WP5-UX-AUDIT-B6 in `depends_on`. The coordinator removed it; `addresses_audit` keeps
the link. Attempt 3 repeats the attempt 2 steps. Re-add the board, both checkpoint files
and this brief; the expected count is 393. Save the output as
`handoff/delivery/evidence/WP5-UX-FIX8-FREEZE/checks-attempt3.txt`. Then commit, push and
check the HEAD digest.

## Results

Attempt 1: STOPPED, no commit. Index left staged (393 paths).

- Pre-HEAD = origin/main = bf954c0b371ad9a5fe461a603c5d476ea210e66c; post-HEAD unchanged; no commit, no push.
- Working-tree digest b07727b2f95b4e202e9e0dc391512b051b288218ceb3e2ffe93f0f1c14a95abe (matches). Post-commit digest not run.
- Staged 393: 2 source (styles.css, sharing.spec.ts), 391 under handoff/ (includes this brief).
- Checks: node v24.21.0 exit 0; precommit exit 0 (393 files, 0 findings); diff --cached --check exit 0; JSON parse exit 0; preflight exit 0;
  validate_orchestration.py exit 1; check_recovery.py exit 1.
- Stop reason: both fail with ValueError "Evidence file missing: WP5-UX-FIX7-FREEZE:
  handoff/delivery/evidence/WP5-UX-FIX7-FREEZE/checks.txt" (validate_orchestration.py line 298). The board points to checks.txt,
  but that folder holds only checks-attempt3.txt and commit-message.txt. Not an allowed fix. Coordinator must either correct the
  board path to checks-attempt3.txt or add checks.txt, then redispatch.
- Evidence: handoff/delivery/evidence/WP5-UX-FIX8-FREEZE/checks.txt (unstaged).

Attempt 2: STOPPED, no commit, no push. Index left staged (393 paths).

- HEAD = origin/main = bf954c0b371ad9a5fe461a603c5d476ea210e66c. Staged before re-add 393, after 393. Digest b07727b2f95b4e202e9e0dc391512b051b288218ceb3e2ffe93f0f1c14a95abe (matches).
- Exit codes: precommit 0; diff --cached --check 0; JSON parse 0; preflight 0; validate_orchestration.py 1; check_recovery.py 1.
- Stop reason: ValueError "Dependency audit not PASS: WP5-UX-FIX8" (validate_orchestration.py line 334). The board's WP5-UX-FIX8 dependency
  audit does not have decision PASS (the B6 audit is FIX REQUIRED per the commit message; the validator wants a PASS audit for the dependency).
  Not an allowed fix; coordinator must correct the board.
- Evidence: handoff/delivery/evidence/WP5-UX-FIX8-FREEZE/checks-attempt2.txt (unstaged).
