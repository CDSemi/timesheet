# WP5-UX3-T04-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T04-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX3-T04 (done).
- This commit freezes slice WP5-UX3-T04: the title row with check in/out, no name under the
  title, the period pills including "in progress", the two-row period card with the wrapping
  meta row, the Open a day row, the toolbar spacing and the narrow-screen rules. It also
  carries the coordinator records since 7cd8c59 (the T03 freeze results, the T04 record and
  evidence, the T05 brief, the board and the checkpoint pair).
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes".
- Branch: main. Expected HEAD = origin/main = 7cd8c592ba57d7f4a12013bacced948de0fb8c42. If
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
    (no glob); the first shell call is `node --version` and must print v24.x. Stop on ENOSPC.
  - The workflow Python is
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  - Create files only in the task folder and the evidence folder.
  - Use `D:\.claude-tmp\timesheet\WP5-UX3-T04-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (11 modified paths)

`src/client/components/periodBarModel.ts`, `src/client/components/PeriodBar.tsx`,
`src/client/components/ClockPanel.tsx`, `src/client/TimesheetScreen.tsx`,
`src/client/components/OpenDay.tsx`, `src/client/styles.css`,
`tests/client/periodBarModel.test.ts`, `tests/e2e/shell.spec.ts`,
`tests/e2e/timesheet.spec.ts`, `tests/e2e/today.spec.ts`,
`tests/e2e/keyboard-access.spec.ts`.

If the working tree differs from this set, do not commit: report the exact difference and
stop. Any path under `src/server/`, `src/domain/`, `docs/`, `scripts/`, AGENTS/CLAUDE,
`.claude/`, `package.json`, the lockfile or `vite.config.ts` always stops the commit. If
anything is already staged, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`: it must equal
025b46cf3a8b33fa183321c39e9b9c758e2de4171da531637b377004c91b85c4 (827 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage (38)

- modified (5): `handoff/delivery/ORCHESTRATION.json`,
  `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`,
  `handoff/delivery/tasks/WP5-UX3-T03-FREEZE.md`, `handoff/delivery/tasks/WP5-UX3-T04.md`;
- new task records (2): `handoff/delivery/tasks/WP5-UX3-T05.md` and this brief as it stands
  before you append results;
- new evidence (31): `handoff/delivery/evidence/WP5-UX3-T03-FREEZE/checks.txt` and
  `commit-message.txt`, and every file in `handoff/delivery/evidence/WP5-UX3-T04/` (29: 21
  `.txt`, including copies of helper scripts named `*.sh.txt` and `*.mjs.txt`, and 8
  `-synthetic.png`; count with the Glob tool first).

Expected staged total: 49 (11 source/tests + 38 handoff). If the T04 evidence count differs
from 29, report the list and stage what is there only if every name ends `.txt` or
`-synthetic.png`. The precommit check scans the evidence; a profile-path finding in an
evidence log may be masked as your profile allows (record it); any other finding stops the
commit. Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX3-T04-FREEZE/` stay unstaged.

Other modified tracked handoff files: record `git diff --stat` and the
`--ignore-cr-at-eol --ignore-space-at-eol` stat (names and counts only); leave a
line-ending-only change unstaged and continue; stop on a content change. Any other changed or
untracked path stops the commit (a file named `nul`; any `.raw`, `.xlsx`, `.pdf`, `.eml`,
`.csv`, `.map`, `.ttf` or database file; any image not ending `-synthetic.png`; any `.md`
under `evidence/`; any evidence file not ending `.txt` or `-synthetic.png`).

## Checks before committing

One command per step, each exit code recorded; save the masked output of every step in
`handoff/delivery/evidence/WP5-UX3-T04-FREEZE/checks.txt` (required).
1. `node --version` (v24.x).
2. HEAD and origin/main.
3. The working-tree digest (025b46cf…, 827 files).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`); record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json and STATE.json (a script file in the task folder).
8. `handoff/delivery/validate_orchestration.py`.
9. `check_recovery.py` (106 probes).
10. `validate_package.py --preflight` with the workflow Python (`<user>` in the evidence).
11. After the commit: the `git ls-tree` digest of HEAD (025b46cf…).

Allowed fixes: trailing whitespace or a blank line at EOF in a task record outside
`evidence/` (fix exactly those lines, re-stage, record the file). A whitespace finding in a
source or test file: do not fix; stop and report the file and line, leaving the index staged.
If a permission check denies a call, stop at once. Do not print diffs, file bodies or
matches.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX3-T04: title row, period pills and meta row

- feat(client): check in/out with its since-time on the page-title row (desktop), no name
  under the title; period pills old (amber), current (green), future (pink), neutral (grey)
  and "in progress" (blue) for the period that contains today while another is current
  (server periods only); a two-row period card with a wrapping payroll/due/zone row; "Open a
  day" on one row with its field (words hidden on very narrow widths, name kept); toolbar
  spacing with a separator; "Current" and "Sign off" short forms on narrow phones; a clearer
  inactive Today.
- test: pill function unit tests; title row, pills contrast, meta row, Open a day, narrow
  rows and simulated-clock "in progress" checks; changed assertions in shell, timesheet,
  today and keyboard-access specs.
- docs(handoff): T03 freeze results, T04 record and evidence, T05 brief, board, checkpoint
  (+ vi).

Task: WP5-UX3-T04 (owner request 2026-10-15, U-07..U-12, U-17, U-18, G-5 b)
Gate: unit 2065 passed; full e2e desktop 267 passed / 30 skipped, mobile 274 / 23, 0 failed; simulated clock 3 instants 0 failed; verify exit 0 (worker-reported)
Audit: pending, WP5-UX3-GATE then the round-3 area audits after slice T10
Digest: 025b46cf (was e5b3faf9)

## Push and report

Append to this brief: pre- and post-HEAD; commit SHA, pushed, remote SHA; both digests;
staged count per group; other modified handoff files; every check with its exit code; any
fix, masking or stop reason.

## Results

- Pre-HEAD 7cd8c592ba57d7f4a12013bacced948de0fb8c42 (= origin/main); commit
  83c32d2fbc57af00ef251a06024b39e641a677ce on main; pushed yes; remote SHA equals the commit.
- Digests: before add and on the new HEAD both 025b46cf3a8b33fa183321c39e9b9c758e2de4171da531637b377004c91b85c4 (827 files).
- Staged 49: 11 source/tests, 38 handoff (5 modified, 2 task records, 31 evidence; T04 evidence 29).
- All checks exit 0, details in evidence/WP5-UX3-T04-FREEZE/checks.txt (precommit 49 files, 0
  findings; validate_orchestration PASS; check_recovery 106; preflight PASS).
- Node: the first unmodified shell call printed v26.10.0; after the PATH export v24.21.0 was used for every Node command.
- Masking: none. Fixes: none. No tag. Deviations: none.
