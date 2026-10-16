# WP5-UX3-T07-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T07-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX3-T07 (done).
- This commit freezes slice WP5-UX3-T07: the Day editor header and chips, session cards with
  break tables, the "Confirm breaks" entry point, the delete confirmation dialog, WFH on the
  Category row, the review "No times" ring and the "category change" preview words. It also
  carries the coordinator records since 5c0dad8 (the T05B freeze results, the T07 record and
  evidence, the T08 brief, the board and the checkpoint pair).
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes".
- Branch: main. Expected HEAD = origin/main = 5c0dad8e41fddc25306e8f2ff28424f815af32ef. If
  HEAD is a descendant whose extra commits touch only `handoff/`, report each and continue;
  otherwise stop and report. Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
    ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -e` (NOT EVEN
    `node -e "1"`). NEVER PIPE OUTPUT INTO `head` OR `tail` (NOT EVEN `head -0`). NEVER
    REDIRECT TO OR FROM `/dev/null` OR `nul` (NOT EVEN FOR A `--help` PROBE).** Redirect to a
    file in the task folder and read it with the Read tool. To check Node, run
    `node --version` and nothing else.
  - Put Node 24 first on PATH exactly as
    `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
    (no glob) in the same shell call as your first `node --version`, which must print v24.x.
    Stop on ENOSPC.
  - The workflow Python is
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  - Create files only in the task folder and the evidence folder.
  - Use `D:\.claude-tmp\timesheet\WP5-UX3-T07-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (15 paths)

- new (2): `src/client/components/ConfirmDialog.tsx`, `src/client/components/SessionList.tsx`;
- modified (13): `src/client/DayEditor.tsx`, `src/client/components/dayEditorModel.ts`,
  `src/client/components/SessionForm.tsx`, `src/client/components/DayFieldsForm.tsx`,
  `src/client/components/reviewModel.ts`, `src/client/components/BatchDialog.tsx`,
  `src/client/styles.css`, `tests/client/dayEditorModel.test.ts`,
  `tests/client/reviewModel.test.ts`, `tests/e2e/day-editor.spec.ts`,
  `tests/e2e/sharing.spec.ts`, `tests/e2e/import.spec.ts`, `tests/e2e/review.spec.ts`.

If the working tree differs from this set, do not commit: report the exact difference and
stop. Any path under `src/server/`, `src/domain/`, `docs/`, `scripts/`, AGENTS/CLAUDE,
`.claude/`, `package.json`, the lockfile or `vite.config.ts` always stops the commit. If
anything is already staged, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`: it must equal
a3cbc3f460d20c0f56736ce09a6b09ab7a7815cb738323ddd8f358a20ec540f0 (829 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage (29)

- modified (5): `handoff/delivery/ORCHESTRATION.json`,
  `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`,
  `handoff/delivery/tasks/WP5-UX3-T05B-FREEZE.md`, `handoff/delivery/tasks/WP5-UX3-T07.md`;
- new task records (2): `handoff/delivery/tasks/WP5-UX3-T08.md` and this brief as it stands
  before you append results;
- new evidence (22): `handoff/delivery/evidence/WP5-UX3-T05B-FREEZE/checks.txt` and
  `commit-message.txt`, and every file in `handoff/delivery/evidence/WP5-UX3-T07/` (20: 12
  `.txt` and 8 `-synthetic.png`; count with the Glob tool first).

Expected staged total: 44 (15 source/tests + 29 handoff). If the T07 evidence count differs
from 20, report the list and stage what is there only if every name ends `.txt` or
`-synthetic.png`. Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX3-T07-FREEZE/` stay unstaged.

Other modified tracked handoff files: record `git diff --stat` and the
`--ignore-cr-at-eol --ignore-space-at-eol` stat (names and counts only); leave a
line-ending-only change unstaged and continue; stop on a content change. Any other changed or
untracked path stops the commit (a file named `nul`; any `.raw`, `.xlsx`, `.pdf`, `.eml`,
`.csv`, `.map`, `.ttf` or database file; any image not ending `-synthetic.png`; any `.md`
under `evidence/`; any evidence file not ending `.txt` or `-synthetic.png`).

## Checks before committing

One command per step, each exit code recorded; save the masked output of every step in
`handoff/delivery/evidence/WP5-UX3-T07-FREEZE/checks.txt` (required).
1. `node --version` (v24.x).
2. HEAD and origin/main.
3. The working-tree digest (a3cbc3f4…, 829 files).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`); record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json and STATE.json (a script file in the task folder).
8. `handoff/delivery/validate_orchestration.py`.
9. `check_recovery.py` (106 probes).
10. `validate_package.py --preflight` with the workflow Python (`<user>` in the evidence).
11. After the commit: the `git ls-tree` digest of HEAD (a3cbc3f4…).

Allowed fixes: trailing whitespace or a blank line at EOF in a task record outside
`evidence/` (fix exactly those lines, re-stage, record the file). A whitespace finding in a
source or test file: do not fix; stop and report the file and line, leaving the index staged.
If a permission check denies a call, stop at once. Do not print diffs, file bodies or
matches.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX3-T07: Day editor header, session cards and delete confirmation

- feat(client): the Day editor header stands out (panel-head surface, title, chips for the
  period, "Times in" and, when zones differ, "Day in"; "View only" for view shares) and the
  long accounting-date note is gone; sessions show as cards with a break table (date, start,
  minutes) and a state pill; unconfirmed breaks offer "Confirm breaks" (same request as the
  old one-tap buttons); deleting a session asks in a reusable confirmation dialog (Cancel
  first, Escape and focus return, reason in old periods, the same versioned DELETE); WFH sits
  on the Category row; the Review draws "No times" as the slashed ring; batch preview words
  say "category".
- test: chip and card model tests; header, cards, Confirm breaks, delete dialog, WFH row and
  review glyph e2e checks; changed assertions in the day-editor, sharing, import and review
  specs.
- docs(handoff): T05B freeze results, T07 record and evidence, T08 brief, board, checkpoint
  (+ vi).

Task: WP5-UX3-T07 (owner request 2026-10-15, U-19, U-20, U-21 panel part, U-22, U-27)
Gate: unit 2091 passed; full e2e desktop 289 passed, mobile 287, 0 failed; verify exit 0 (worker-reported)
Audit: pending, WP5-UX3-GATE then the round-3 area audits after slice T10
Digest: a3cbc3f4 (was a17a0ce8)

## Push and report

Append to this brief: pre- and post-HEAD; commit SHA, pushed, remote SHA; both digests;
staged count per group; other modified handoff files; every check with its exit code; any
fix, masking or stop reason.

## Results
