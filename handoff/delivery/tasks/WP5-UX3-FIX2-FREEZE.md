# WP5-UX3-FIX2-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-FIX2-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX3-FIX2 (done).
- This commit freezes WP5-UX3-FIX2 with Addendum 1. FIX2 fixed the read-only sweep's
  findings 1-11 and 13; Addendum 1 updated the docs/04 pair.
- It also carries the coordinator records since 9187f31:
  - the FIX1-FREEZE results and evidence;
  - the FIX2 record and evidence;
  - the draft regate brief;
  - the board and the checkpoint pair.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes".
- Branch: main.
  - Expected HEAD = origin/main = 9187f31bee9c092041887d3ab034c492e33da0b5.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each and
    continue; otherwise stop and report.
  - Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
    ONES, NOT EVEN WITH `cat`, NOT EVEN INTO A SCRATCH FILE), NO `| node`, NO `| python`, NO
    `node -e` (NOT EVEN `node -e "1"`). NEVER PIPE OUTPUT INTO `head` OR `tail` (NOT EVEN
    `head -0` OR `head -c`). NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout` OR `nul`
    (NOT EVEN FOR A `--help` PROBE). NEVER `rm -r` OR `rm -rf`.**
  - Redirect output to a file in the task folder and read it with the Read tool; write
    files with the Write tool. To check Node, run `node --version` and nothing else.
  - Put Node 24 first on PATH exactly as
    `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
    (no glob), in the same shell call as your first `node --version`. That call must print
    v24.x.
  - Stop on ENOSPC.
  - The workflow Python is
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  - Create files only in the task folder and the evidence folder.
  - Use `D:\.claude-tmp\timesheet\WP5-UX3-FIX2-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (27 modified paths)

- `src/client/` (6): `AdminScreen.tsx`, `OtScreen.tsx`, `ProfileScreen.tsx`,
  `SettingsScreen.tsx`, `TimesheetScreen.tsx`, `styles.css`.
- `src/client/components/` (7): `AccountMenu.tsx`, `AppShell.tsx`, `BatchDialog.tsx`,
  `ClockOutDialog.tsx`, `DayFieldsForm.tsx`, `HolidayImport.tsx`, `dayEditorModel.ts`.
- `tests/client/` (2): `breakRowsModel.test.ts`, `dayEditorModel.test.ts`.
- `tests/e2e/` (6): `day-editor.spec.ts`, `hover.spec.ts`, `ot-leave.spec.ts`,
  `settings-routes.spec.ts`, `shell.spec.ts`, `today.spec.ts`.
- `docs/` (6): `04_UX_AND_SETTINGS.md` and `.vi.md`, `10_DECISIONS_AND_SOURCES.md` and
  `.vi.md`, `12_RELEASE_NOTES.md` and `.vi.md`.

If the working tree differs from this set, do not commit: report the exact difference and
stop.

These always stop the commit:
- any path under `src/server/`, `src/domain/` or `scripts/`;
- any `docs/` file other than the six above;
- AGENTS/CLAUDE files, `.claude/`, `package.json`, the lockfile or `vite.config.ts`;
- any deleted or untracked path outside `handoff/`.

If anything is already staged, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
262138e0c94c90dc0287e6de87e69f2aabfa68d3bd7bdb6262322c1e2b8f0191 (833 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

- **Modified (5):**
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX3-FIX1-FREEZE.md`;
  - `handoff/delivery/tasks/WP5-UX3-FIX2.md`.
- **New task records (2):**
  - `handoff/delivery/tasks/WP5-UX3-REGATE.md` (a draft with placeholders, staged as is);
  - this brief, as it stands before you append results.
- **New evidence:**
  - the folder `handoff/delivery/evidence/WP5-UX3-FIX1-FREEZE/` (2 files:
    `checks.txt`, `commit-message.txt`);
  - the folder `handoff/delivery/evidence/WP5-UX3-FIX2/` (30 files).

Count each folder with the Glob tool first and report the counts. Stage a folder only if
every name ends in `.txt`.

Report the staged total per group. Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX3-FIX2-FREEZE/` stay unstaged.

**Privacy.** The precommit check scans every staged file.
- A `profile-path` finding in an evidence log may be masked as your profile allows:
  replace only the account segment with `<user>`, re-stage, and record each file.
- Any other finding stops the commit: an email address that is not the full synthetic
  example.invalid form, a secret-like value, or a non-synthetic image. Report the file,
  line and rule, and leave the index staged.

**Other modified tracked handoff files.**
- Record `git diff --stat` and the `--ignore-cr-at-eol --ignore-space-at-eol` stat (names
  and counts only).
- A line-ending-only change: leave it unstaged and continue.
- A content change: stop.

**Any other changed or untracked path stops the commit**, for example:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map`, `.ttf` or database file;
- any image;
- any `.md` under `evidence/`.

## Checks before committing

Run one command per step and record each exit code. Save the masked output of every step
in `handoff/delivery/evidence/WP5-UX3-FIX2-FREEZE/checks.txt` (required).

1. `node --version` (v24.x).
2. HEAD and origin/main.
3. The working-tree digest (262138e0…, 833 files).
4. `git add` with the explicit paths, as its own command and with no redirect. Folders may
   be given as explicit folder paths.
5. The precommit check (`node scripts/precommit-check.mjs`); record its file count.
6. `git diff --cached --check`.
7. A JSON parse of ORCHESTRATION.json and STATE.json, by a script file in the task folder.
8. `handoff/delivery/validate_orchestration.py`.
9. `check_recovery.py` (106 probes).
10. `validate_package.py --preflight` with the workflow Python (`<user>` in the evidence).
11. After the commit: the `git ls-tree` digest of HEAD (262138e0…).

**Allowed fixes:**
- Trailing whitespace or a blank line at EOF in a task record outside `evidence/`: fix
  exactly those lines, re-stage, and record the file.
- A whitespace finding in a source, test or docs file: do not fix it. Stop and report the
  file and line, leaving the index staged.

If a permission check denies a call, stop at once. Do not print diffs, file bodies or
matches.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX3-FIX2: sweep findings of round 3

- fix(client):
  - choosing an account-menu or More entry moves focus to the new page's heading, or back
    to the opener when the page does not change;
  - the Day editor chip says "in progress" for a day of the in-progress period however it
    was opened;
  - the Check out dialog asks "Discard your changes?" when its rows or box changed;
  - "category" wording in the batch dialog, Overtime and the holiday import;
  - day-column hover rules are gated by `(hover: hover)`;
  - the Category select is described by its default hint;
  - two unused day-editor helpers are removed.
- test:
  - the past-day pre-fill test fixes the browser clock away from the server date (mutant
    M18 caught);
  - the Profile test runs in another device zone (mutant M21 caught);
  - keyboard focus after account entries, desktop and phone;
  - the Check out discard question;
  - the editor chip through Open a day;
  - hover gating;
  - the helper oracles moved to the break-rows model tests.
- docs:
  - docs/04 (Check out discard, account-menu focus rule);
  - docs/10 (chunk figure, section reference, discard decision);
  - docs/12 (refused Check out remedy) (+ vi).
- docs(handoff):
  - the FIX1 freeze results;
  - the FIX2 record and evidence;
  - the draft regate brief;
  - board and checkpoint (+ vi).

Task: WP5-UX3-FIX2 (WP5-UX3-SWEEP findings 1-11, 13)
Gate: WP5-UX3-GATE FAIL on cecfceb; WP5-UX3-REGATE next
Audit: pending, WP5-UX3-AUDIT-A, -B, -INT
Digest: 262138e0 (was e4659145)

## Push and report

Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digests;
- the staged count per group;
- other modified handoff files;
- every check with its exit code;
- any fix, masking or stop reason.

## Results

- Pre-HEAD 9187f31bee9c092041887d3ab034c492e33da0b5; post-HEAD and commit
  7ce4e95a0c4477374e981132d93b11aedab2e384; pushed yes; remote main equals the commit.
- Digest before add and on the new HEAD (ls-tree): 262138e0c94c90dc0287e6de87e69f2aabfa68d3bd7bdb6262322c1e2b8f0191
  (833 files) both times.
- Staged 66: 27 non-handoff paths, 5 modified handoff records, 2 new task records,
  2 FIX1-FREEZE evidence files, 30 FIX2 evidence files. Nothing was pre-staged.
- Other modified handoff files: none (unstaged diff empty).
- Checks, all exit 0: Node v24.21.0; HEAD check; digest; add; precommit (66 files, 0
  findings); diff check; JSON parse; validate_orchestration; check_recovery (106);
  validate_package preflight; post-commit digest. Push dry-run and push exit 0.
- No masking, no fixes, no stop. Evidence: evidence/WP5-UX3-FIX2-FREEZE/checks.txt and
  commit-message.txt (unstaged).
