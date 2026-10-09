# WP5-UX-T05-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-T05-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX-T05 (done).
- This commit freezes slice 5 of the owner-requested UI redesign: the Review screen as
  the read-only Excel-style sheet plus a checklist. It also carries the
  WP5-UX-T04-FREEZE results and the coordinator records since the last commit.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  118a104a0e271a2fb2b8916a2cb1bf85244147bf. If either differs, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
    NO `| python`.** Never pipe into head or tail.
  - Call Node 24 by its full portable path; make the first shell call a trivial
    `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-UX-T05-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the only changed paths may be these 9 (from WP5-UX-T05; all
modified, none new or deleted):
- `src/client/ReviewScreen.tsx`
- `src/client/components/ReviewDays.tsx`, `src/client/components/SheetWeekTable.tsx`,
  `src/client/components/TimesheetSheet.tsx`, `src/client/components/reviewModel.ts`,
  `src/client/components/sheetModel.ts`
- `src/client/styles.css`
- `tests/client/reviewModel.test.ts`
- `tests/e2e/review.spec.ts`

Report which are actually changed. Any other changed or untracked path outside handoff/
stops the commit. If anything is already staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
0071a58848ecf62e0eca19c1e94db6a76116c9043d4cb5bcc2859b45a0f4f6d9. After the commit, the
`git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

New files:
- `handoff/delivery/tasks/WP5-UX-T05.md`;
- this brief, as it stands before you append results;
- every file in `handoff/delivery/evidence/WP5-UX-T05/` (ten files: six `.txt` and
  exactly four synthetic screenshots `review-desktop-synthetic.png`,
  `review-mobile-synthetic.png`, `review-signed-desktop-synthetic.png`,
  `review-signed-mobile-synthetic.png`);
- every file in `handoff/delivery/evidence/WP5-UX-T04-FREEZE/` (`checks.txt`,
  `commit-message.txt`).

Modified files:
- `handoff/delivery/tasks/WP5-UX-T04-FREEZE.md` (its results);
- `handoff/delivery/ORCHESTRATION.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX-T05-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any `.png` other than the four listed, or any image whose basename lacks `synthetic`;
- any `.md` file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX-T05-FREEZE/checks.txt`.
1. `node --version`.
2. The working-tree digest (must be 0071a588…).
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
8. `check_recovery.py`.
9. `validate_package.py --preflight` by its script path, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.
10. After the commit: the `git ls-tree` digest of HEAD (must be 0071a588…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF in
  a task record outside `evidence/`, fix exactly those lines, re-stage the file and
  record the file name.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log under `evidence/WP5-UX-T05/` or `evidence/WP5-UX-T04-FREEZE/`, replace each such
  token with `<email>` or `<user>` in that evidence file only, re-stage it and rerun the
  check.

When to stop:
- If any other check fails, do not commit; report the file, line and rule. Never edit
  source or test files.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX-T05: Review shows the sheet people sign

- feat(client):
  - the Review shows the Excel-style sheet in a read-only review mode, fed by the review
    payload with times in the reporting zone as on the PDF and detail rows always on;
  - a checklist column (attention items and acknowledgement, deficits, reservations,
    email and PDF, sign) reuses the existing review components and texts;
  - sign-off logic, payload hash, expected_version and the PDF are unchanged.
- test: reviewModel unit tests; review.spec per-day checks follow the sheet format.
- docs(handoff): WP5-UX-T05 record, evidence and synthetic screenshots;
  WP5-UX-T04-FREEZE results; board and checkpoint (+ vi).

Task: WP5-UX-T05 (owner-requested UI redesign, slice 5 of 6)
Gate: unit 1816 passed; full e2e desktop 76/0/3, mobile 77/0/2; verify exit 0
Audit: none yet (gate and independent audit after T06)
Digest: 0071a588 (was 6f362af9)

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values and the staged count;
- every check with its exit code;
- any fix applied or stop reason.

## Results

(committer appends here)
