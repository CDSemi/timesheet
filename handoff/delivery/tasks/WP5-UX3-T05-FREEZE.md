# WP5-UX3-T05-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T05-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX3-T05 (done).
- This commit freezes slice WP5-UX3-T05: lifted columns in runs, the editor column's inset
  frame and Day-cell fill, the "Category" and "Status" names and the slashed "No times". It
  also carries the coordinator records since 83c32d2 (the T04 freeze results, the T05 record
  and evidence, the T05B brief, the board and the checkpoint pair).
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes".
- Branch: main. Expected HEAD = origin/main = 83c32d2fbc57af00ef251a06024b39e641a677ce. If
  HEAD is a descendant whose extra commits touch only `handoff/`, report each and continue;
  otherwise stop and report. Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
    ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -e` (NOT EVEN
    `node -e "1"`). NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM
    `/dev/null` OR `nul` (NOT EVEN FOR A `--help` PROBE).** Redirect to a file in the task
    folder and read it with the Read tool. To check Node, run `node --version` and nothing
    else.
  - Put Node 24 first on PATH exactly as
    `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
    (no glob) in the same shell call as your first `node --version`, which must print v24.x.
    Stop on ENOSPC.
  - The workflow Python is
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  - Create files only in the task folder and the evidence folder.
  - Use `D:\.claude-tmp\timesheet\WP5-UX3-T05-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (15 modified paths)

`src/client/components/sheetModel.ts`, `src/client/components/labelPickerModel.ts`,
`src/client/components/TimesheetSheet.tsx`, `src/client/components/SheetWeekTable.tsx`,
`src/client/components/DayStatus.tsx`, `src/client/components/DayFieldsForm.tsx`,
`src/client/DayEditor.tsx`, `src/client/styles.css`, `tests/client/sheetModel.test.ts`,
`tests/client/labelPickerModel.test.ts`, `tests/e2e/timesheet.spec.ts`,
`tests/e2e/day-editor.spec.ts`, `tests/e2e/sharing.spec.ts`, `tests/e2e/hover.spec.ts`,
`tests/e2e/keyboard-access.spec.ts`.

If the working tree differs from this set, do not commit: report the exact difference and
stop. Any path under `src/server/`, `src/domain/`, `docs/`, `scripts/`, AGENTS/CLAUDE,
`.claude/`, `package.json`, the lockfile or `vite.config.ts` always stops the commit. If
anything is already staged, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`: it must equal
23b394dd4450fe9365865ca08a127f7d2d874b6a0c767ccc04a2e523e7306b7a (827 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage (30)

- modified (5): `handoff/delivery/ORCHESTRATION.json`,
  `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`,
  `handoff/delivery/tasks/WP5-UX3-T04-FREEZE.md`, `handoff/delivery/tasks/WP5-UX3-T05.md`;
- new task records (2): `handoff/delivery/tasks/WP5-UX3-T05B.md` and this brief as it stands
  before you append results;
- new evidence (23): `handoff/delivery/evidence/WP5-UX3-T04-FREEZE/checks.txt` and
  `commit-message.txt`, and every file in `handoff/delivery/evidence/WP5-UX3-T05/` (21: 13
  `.txt` and 8 `-synthetic.png`; count with the Glob tool first).

Expected staged total: 45 (15 source/tests + 30 handoff). If the T05 evidence count differs
from 21, report the list and stage what is there only if every name ends `.txt` or
`-synthetic.png`. Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX3-T05-FREEZE/` stay unstaged.

Other modified tracked handoff files: record `git diff --stat` and the
`--ignore-cr-at-eol --ignore-space-at-eol` stat (names and counts only); leave a
line-ending-only change unstaged and continue; stop on a content change. Any other changed or
untracked path stops the commit (a file named `nul`; any `.raw`, `.xlsx`, `.pdf`, `.eml`,
`.csv`, `.map`, `.ttf` or database file; any image not ending `-synthetic.png`; any `.md`
under `evidence/`; any evidence file not ending `.txt` or `-synthetic.png`).

## Checks before committing

One command per step, each exit code recorded; save the masked output of every step in
`handoff/delivery/evidence/WP5-UX3-T05-FREEZE/checks.txt` (required).
1. `node --version` (v24.x).
2. HEAD and origin/main.
3. The working-tree digest (23b394dd…, 827 files).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`); record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json and STATE.json (a script file in the task folder).
8. `handoff/delivery/validate_orchestration.py`.
9. `check_recovery.py` (106 probes).
10. `validate_package.py --preflight` with the workflow Python (`<user>` in the evidence).
11. After the commit: the `git ls-tree` digest of HEAD (23b394dd…).

Allowed fixes: trailing whitespace or a blank line at EOF in a task record outside
`evidence/` (fix exactly those lines, re-stage, record the file). A whitespace finding in a
source or test file: do not fix; stop and report the file and line, leaving the index staged.
If a permission check denies a call, stop at once. Do not print diffs, file bodies or
matches.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX3-T05: lifted column runs, editor frame, Category and Status

- feat(client): batch-selected and editor columns lift with a soft shadow; adjacent lifted
  days form one run with one outer shadow and 4px outer corners (pure run function, clipped
  inner edges); the editor column gets an inset 1px accent frame and a filled Day cell (the
  underline and rails are gone); phone rows use tint and frame; the sheet, phone header,
  Day editor and picker say "Category" instead of "Label" and "Status" instead of "Check";
  "No times" is a slashed ring.
- test: run-function and picker-name unit tests; marker, run, frame, rename and phone-name
  e2e checks; value-only "Category for" renames in day-editor, sharing and hover specs.
- docs(handoff): T04 freeze results, T05 record and evidence, T05B brief, board, checkpoint
  (+ vi).

Task: WP5-UX3-T05 (owner request 2026-10-15, U-13..U-16, G-1 b, G-2 a)
Gate: unit 2075 passed; full e2e desktop 275 passed, mobile 280, 0 failed; verify exit 0 (worker-reported)
Audit: pending, WP5-UX3-GATE then the round-3 area audits after slice T10
Digest: 23b394dd (was 025b46cf)

## Push and report

Append to this brief: pre- and post-HEAD; commit SHA, pushed, remote SHA; both digests;
staged count per group; other modified handoff files; every check with its exit code; any
fix, masking or stop reason.

## Results
