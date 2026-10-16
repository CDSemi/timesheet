# WP5-UX3-T09-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T09-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX3-T09 (done).
- This commit freezes slice WP5-UX3-T09: the Check out dialog on the new break rows and
  chips (E-1 unchanged), the "category" batch-review wording and the "Checking out" hint; the
  old break editor `BreaksEditor.tsx` is deleted. It also carries the coordinator records
  since f89573b (the T08B freeze results, the T09 record and evidence, the T10 and gate
  briefs, the board and the checkpoint pair).
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes".
- Branch: main. Expected HEAD = origin/main = f89573b89435b651f5d7cdca7811b972a82087bc. If
  HEAD is a descendant whose extra commits touch only `handoff/`, report each and continue;
  otherwise stop and report. Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
    ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -e` (NOT EVEN
    `node -e "1"`). NEVER PIPE OUTPUT INTO `head` OR `tail` (NOT EVEN `head -0`). NEVER
    REDIRECT TO OR FROM `/dev/null`, `/dev/stdout` OR `nul` (NOT EVEN FOR A `--help`
    PROBE).** Redirect to a file in the task folder and read it with the Read tool. To check
    Node, run `node --version` and nothing else.
  - Put Node 24 first on PATH exactly as
    `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
    (no glob) in the same shell call as your first `node --version`, which must print v24.x.
    Stop on ENOSPC.
  - The workflow Python is
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  - Create files only in the task folder and the evidence folder.
  - Use `D:\.claude-tmp\timesheet\WP5-UX3-T09-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (9 paths)

- deleted (1, unstaged deletion in the working tree): `src/client/components/BreaksEditor.tsx`;
- modified (8): `src/client/components/ClockOutDialog.tsx`, `src/client/TimesheetScreen.tsx`,
  `src/client/components/BatchDialog.tsx`, `src/client/components/BreakRows.tsx`,
  `tests/e2e/day-editor.spec.ts`, `tests/e2e/shell.spec.ts`, `tests/e2e/timesheet.spec.ts`,
  `tests/e2e/keyboard-access.spec.ts`.

If the working tree differs from this set, do not commit: report the exact difference and
stop. Any path under `src/server/`, `src/domain/`, `docs/`, `scripts/`, AGENTS/CLAUDE,
`.claude/`, `package.json`, the lockfile or `vite.config.ts` always stops the commit. If
anything is already staged, report it first.

**Digest with a deletion.** `node scripts/source-digest.mjs` exits 1 while a tracked file's
deletion is unstaged. So: run `git add` with every explicit path first (stage the deletion
with `git add -- src/client/components/BreaksEditor.tsx`; never `git rm`), then run
`node scripts/source-digest.mjs`: it must equal the worker's probe digest
1fc57bce41b5be16ff4e3e364f1c6496bf237af87e1dc996e5effb520beacb46 (833 files). If it differs,
do not commit; report both values and leave the index staged. After the commit, the
`git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage (29)

- modified (5): `handoff/delivery/ORCHESTRATION.json`,
  `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`,
  `handoff/delivery/tasks/WP5-UX3-T08B-FREEZE.md`, `handoff/delivery/tasks/WP5-UX3-T09.md`;
- new task records (3): `handoff/delivery/tasks/WP5-UX3-T10.md`,
  `handoff/delivery/tasks/WP5-UX3-GATE.md` and this brief as it stands before you append
  results;
- new evidence (21): `handoff/delivery/evidence/WP5-UX3-T08B-FREEZE/checks.txt` and
  `commit-message.txt`, and every file in `handoff/delivery/evidence/WP5-UX3-T09/` (19: 15
  `.txt` and 4 `-synthetic.png`; count with the Glob tool first).

Expected staged total: 38 (9 source/tests including the deletion + 29 handoff). If the T09
evidence count differs from 19, report the list and stage what is there only if every name
ends `.txt` or `-synthetic.png`. Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX3-T09-FREEZE/` stay unstaged.

Other modified tracked handoff files: record `git diff --stat` and the
`--ignore-cr-at-eol --ignore-space-at-eol` stat (names and counts only); leave a
line-ending-only change unstaged and continue; stop on a content change. Any other changed or
untracked path stops the commit (a file named `nul`; any `.raw`, `.xlsx`, `.pdf`, `.eml`,
`.csv`, `.map`, `.ttf` or database file; any image not ending `-synthetic.png`; any `.md`
under `evidence/`; any evidence file not ending `.txt` or `-synthetic.png`).

## Checks

One command per step, each exit code recorded; save the masked output of every step in
`handoff/delivery/evidence/WP5-UX3-T09-FREEZE/checks.txt` (required).
1. `node --version` (v24.x).
2. HEAD and origin/main.
3. `git status --porcelain=v1` (the set check above, names only).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The digest after staging (`node scripts/source-digest.mjs`; 1fc57bce…, 833 files).
6. The precommit check (`node scripts/precommit-check.mjs`); record its file count.
7. `git diff --cached --check`.
8. JSON parse of ORCHESTRATION.json and STATE.json (a script file in the task folder).
9. `handoff/delivery/validate_orchestration.py`.
10. `check_recovery.py` (106 probes).
11. `validate_package.py --preflight` with the workflow Python (`<user>` in the evidence).
12. After the commit: the `git ls-tree` digest of HEAD (1fc57bce…).

Allowed fixes: trailing whitespace or a blank line at EOF in a task record outside
`evidence/` (fix exactly those lines, re-stage, record the file). A whitespace finding in a
source or test file: do not fix; stop and report the file and line, leaving the index staged.
If a permission check denies a call, stop at once. Do not print diffs, file bodies or
matches.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX3-T09: Check out dialog on the new break rows

- feat(client): the Check out dialog uses the same break rows, chips and "Break n"
  sub-dialog as the session dialog, with its E-1 rules (the ticked box confirms none; listed
  rows confirm and replace; an empty unticked list checks out with breaks not confirmed) and
  its hint "Checking out confirms the breaks listed here."; the batch review says "category"
  everywhere; the old break editor is deleted.
- test: Check out flows with rows, the ticked box and an empty list, a stale version and a
  refused future break; string assertions in the shell, keyboard, timesheet and day-editor
  specs.
- docs(handoff): T08B freeze results, T09 record and evidence, T10 and gate briefs, board,
  checkpoint (+ vi).

Task: WP5-UX3-T09 (owner request 2026-10-15, U-24; G-2 a)
Gate: unit 2126 passed; full e2e desktop 310 passed, mobile 304, 0 failed; verify exit 0 (worker-reported)
Audit: pending, WP5-UX3-GATE then the round-3 area audits after slice T10
Digest: 1fc57bce (was dd620f70)

## Push and report

Append to this brief: pre- and post-HEAD; commit SHA, pushed, remote SHA; the digest after
staging and on HEAD; staged count per group; other modified handoff files; every check with
its exit code; any fix, masking or stop reason.

## Results
