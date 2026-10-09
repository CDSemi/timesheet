# WP5-UX-T02-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-T02-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX-T02 (done).
- This commit freezes slice 2 of the owner-requested UI redesign: the Excel-style
  timesheet sheet. It also carries the WP5-UX-T01-FREEZE results and the coordinator
  records since the last commit.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  32244744ff37835603a1c2685ef2eb4e4d78861f. If either differs, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **Never feed anything to python or node through stdin. Never use a heredoc.**
    Never pipe into head or tail.
  - Call Node 24 by its full portable path; make the first shell call a trivial
    `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-UX-T02-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the only changed paths may be these 21 (from WP5-UX-T02):
- New: `src/client/components/TimesheetSheet.tsx`,
  `src/client/components/SheetWeekTable.tsx`, `src/client/components/sheetModel.ts`,
  `tests/client/sheetModel.test.ts`.
- Deleted (missing in the working tree, still tracked): `src/client/components/TimesheetGrid.tsx`,
  `src/client/components/DayList.tsx`.
- Modified: `src/client/TimesheetScreen.tsx`, `src/client/components/DayStatus.tsx`,
  `src/client/components/dayModel.ts`, `src/client/components/format.ts`,
  `src/client/styles.css`, `src/domain/format.ts`, `tests/client/dayModel.test.ts`,
  `tests/domain/engine.test.ts`, and the e2e specs `day-editor`, `history-settings`,
  `import`, `isolation`, `sharing`, `shell` and `timesheet` (`tests/e2e/<name>.spec.ts`).

Report which are actually changed. Any other changed or untracked path outside handoff/
stops the commit. If anything is already staged before you start, report it first.

**Digest order differs from earlier freezes:** `scripts/source-digest.mjs` hashes the
paths in the index, so it exits 1 while the two deletions are unstaged. Stage first
(`git add -- <explicit paths>`, which also stages the two deletions), THEN run the digest
on the working tree. It must equal
1789a8be51e0339ecc96ddc26d3e59c0eabfa8a5ae362feb3144bdbbdd43b434 (781 files; the worker's
probe value). After the commit, the `git ls-tree` digest of the new HEAD must equal it
too. If the value differs, do not commit; report both values.

## Handoff files to stage

New files:
- `handoff/delivery/tasks/WP5-UX-T02.md`;
- this brief, as it stands before you append results;
- every file in `handoff/delivery/evidence/WP5-UX-T02/` (twelve files: eight `.txt`,
  including `digest-probe.mjs.txt`, and exactly four synthetic screenshots
  `sheet-desktop-light-synthetic.png`, `sheet-desktop-dark-synthetic.png`,
  `sheet-phone-light-synthetic.png`, `sheet-phone-dark-synthetic.png`);
- every file in `handoff/delivery/evidence/WP5-UX-T01-FREEZE/` (`checks.txt`,
  `commit-message.txt`).

Modified files:
- `handoff/delivery/tasks/WP5-UX-T01-FREEZE.md` (its results);
- `handoff/delivery/ORCHESTRATION.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX-T02-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any `.png` other than the four listed, or any image whose basename lacks `synthetic`;
- any `.md` file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX-T02-FREEZE/checks.txt`.
1. `node --version`.
2. `git add` with the explicit paths (including the two deleted paths), as its own
   command and with no redirect.
3. The working-tree digest (must be 1789a8be…).
4. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
8. `check_recovery.py`.
9. `validate_package.py --preflight` by its script path, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.
10. After the commit: the `git ls-tree` digest of HEAD (must be 1789a8be…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF in
  a task record outside `evidence/`, fix exactly those lines, re-stage the file and
  record the file name.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log under `evidence/WP5-UX-T02/` or `evidence/WP5-UX-T01-FREEZE/`, replace each such
  token with `<email>` or `<user>` in that evidence file only, re-stage it and rerun the
  check.

When to stop:
- If any other check fails, do not commit; report the file, line and rule. Never edit
  source or test files.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX-T02: Excel-style timesheet sheet

- feat(client):
  - the Timesheet page shows the Excel form: header block, two Monday-Sunday week bands
    with the rows Day, Date, Label, Time, OT and Check, "Overtime Total :" and the
    signature lines (labels only, no image); "Show details" rows;
  - phones show each week as a Day | Label | Time | OT table;
  - one hatched tint for non-working days with the holiday name in the label cell; US
    dates, h:mm and 24-hour times as on the PDF;
  - a pure sheetModel maps server values to cells; the client computes no business
    minutes; TimesheetGrid and DayList removed.
- feat(domain): display-only formatHoursMinutes, equal to the PDF formatter.
- test: sheetModel unit tests, formatter equality with the PDF for 0..3000 minutes, and
  e2e updates in seven specs (no assertion removed; zone, "none", signature and shared
  view checks added).
- docs(handoff): WP5-UX-T02 record, evidence and synthetic sheet screenshots;
  WP5-UX-T01-FREEZE results; board and checkpoint (+ vi).

Task: WP5-UX-T02 (owner-requested UI redesign, slice 2 of 6)
Gate: unit 1783 passed; full e2e desktop 72/0/3, mobile 73/0/2; typecheck, lint, verify exit 0
Digest: 1789a8be (was b5cdb2d4)

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values and the staged count;
- every check with its exit code;
- any fix applied or stop reason.

## Results

(committer appends here)
