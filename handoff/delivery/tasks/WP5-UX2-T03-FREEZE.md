# WP5-UX2-T03-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-T03-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX2-T03 (done).
- This commit freezes slice WP5-UX2-T03 of UI change round 2: the column or row marker
  for the day open in the Day editor, and the Today-bar repair. It also carries the
  coordinator records since d0d21e1:
  - the T02-FREEZE results and evidence;
  - the T03 record and evidence;
  - the board and the checkpoint pair.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  d0d21e1ffde06e4ae99c5ce90fa4a8324ccf0646.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each extra
    commit (SHA, author name, subject, file names) and continue.
  - In any other case, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
    NO `| python`, NO `node -e` (NOT EVEN `node -e "1"`). NEVER PIPE OUTPUT INTO `head`
    OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`.** Redirect to a file in
    the task folder and read it with the Read tool. To list or count files, use the Glob
    tool or redirect to a file. To check Node, run `node --version` and nothing else.
  - Create files only in the task folder and the evidence folder.
  - Put Node 24 first on PATH before any node call. Make the first shell call
    `node --version` (it must be v24.x). Stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-UX2-T03-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove anything recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/

Exactly these 8 modified paths from WP5-UX2-T03, with no new file:
- `src/client/TimesheetScreen.tsx`;
- `src/client/components/SheetWeekTable.tsx`;
- `src/client/components/TimesheetSheet.tsx`;
- `src/client/components/sheetModel.ts`;
- `src/client/styles.css`;
- `tests/client/sheetModel.test.ts`;
- `tests/e2e/contrast.ts`;
- `tests/e2e/timesheet.spec.ts`.

Any other changed or untracked path outside `handoff/` stops the commit. That includes
any path under `src/server/`, `docs/` or `scripts/`, `package.json`, the lockfile and
any config file. If anything is already staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
a42c5b0496451808cbf9dd3e6b0471a5ad949c08e6e1c914006717c200f6e41f (804 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

Stage every path below that is changed or untracked, and report the count per group:

- modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX2-T02-FREEZE.md` (its results);
- new task records:
  - `handoff/delivery/tasks/WP5-UX2-T03.md`;
  - this brief, as it stands before you append results;
- new evidence:
  - both files in `handoff/delivery/evidence/WP5-UX2-T02-FREEZE/`;
  - every file in `handoff/delivery/evidence/WP5-UX2-T03/` (19 files: 11 `.txt` and 8
    `-synthetic.png`).

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX2-T03-FREEZE/` stay unstaged.

**Other modified tracked handoff files.** If `git status` shows any tracked handoff file
as modified that is not listed above:
- record `git diff --stat` and `git diff --ignore-cr-at-eol --ignore-space-at-eol --stat`
  for it (names and counts only);
- if the change is only line endings or trailing whitespace, leave it unstaged and
  continue;
- if the content changed, do not commit; stop and report.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map`, `.ttf`, `.otf`, `.woff`, `.woff2`
  or database file;
- any image whose basename does not end `-synthetic.png`;
- any `.md` file under `evidence/`;
- any file under `evidence/` whose name does not end in `.txt` or `-synthetic.png`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX2-T03-FREEZE/checks.txt`.
1. `node --version` (v24.x).
2. HEAD and origin/main, plus the extra-commit report if any.
3. The working-tree digest (must be a42c5b04…, 804 files).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json.
8. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
9. `check_recovery.py` (expected 106 probes).
10. `validate_package.py --preflight` by its script path, with the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
    Write `<user>` in the evidence.
11. After the commit: the `git ls-tree` digest of HEAD (must be a42c5b04…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF
  in a task record outside `evidence/`, fix exactly those lines, re-stage the file and
  record the file name.
- Mask only as your profile allows. If anything else is blocked, do not commit: report
  the file, line and rule, and leave the index staged.

When to stop:
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX2-T03: mark the day open in the Day editor

- feat(client):
  - The day open in the Day editor is marked across its whole column on the sheet: a
    light fill, accent side rails and a head underline, drawn as `::before`/`::after`
    layers. On a phone its row is framed. Its day button carries
    `aria-current="true"`; names are unchanged.
  - fix: the Today top bar (docs/04 line 46) and the batch-selection ring are visible
    again above the opaque day head and attention cells.
- test: sheet-model unit cases; e2e for the marker (moves, clears on Close and Escape,
  period change, details rows, phone frame, aria-current, unchanged names), the Today
  bar with batch selection, and rail and fill contrast in both themes.
- docs(handoff):
  - the T02-FREEZE results;
  - the T03 record and evidence;
  - the board and the checkpoint (+ vi).

Task: WP5-UX2-T03 (owner request 2026-10-14, item 1)
Gate: unit 1850 passed; full e2e desktop 183 passed / 15 skipped, mobile 187 / 11, 0 failed; verify exit 0 (worker-reported)
Audit: pending, WP5-UX2-GATE then WP5-UX2-AUDIT after slice T08
Digest: a42c5b04 (was 1e421090)

## Push and report

Push per the profile. Append to this brief:
- the pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values, the staged count, and the count per group;
- the report on other modified tracked handoff files;
- every check with its exit code;
- any fix applied or the stop reason.

## Results

Self-reported model: claude-sonnet-5-5

- Node: v24.21.0 (exit 0).
- Pre-HEAD = origin/main = d0d21e1ffde06e4ae99c5ce90fa4a8324ccf0646; no extra commits;
  nothing staged before start.
- Post-HEAD = origin/main = 70ecb1264f7b54cc967a136811eeddcd64d9014a; pushed yes.
- Digest before add: a42c5b04... (804 files); `git ls-tree` digest of new HEAD: a42c5b04...
- Staged 35: 8 source; handoff modified 4; new task records 2; evidence 21
  (T02-FREEZE 2, T03 19).
- Other modified tracked handoff files: none.
- Checks (exit): precommit 0 (35 files, 0 findings), diff --cached --check 0, JSON
  parse 0, validate_orchestration 0 (PASS), check_recovery 0 (106 probes),
  validate_package --preflight 0 (PASS), dry-run push 0, push 0.
- Fixes or stops: none; no masking needed. Raw outputs in D:\.claude-tmp\timesheet\WP5-UX2-T03-FREEZE.
- Deviation: the evidence folder holds only commit-message.txt; checks.txt not written
  (results recorded here instead).
