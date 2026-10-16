# WP5-UX3-T05B-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T05B-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX3-T05B (done).
- This commit freezes slice WP5-UX3-T05B: the floating Day editor below 1360px and the
  108px minimum sheet columns. It also carries the coordinator records since 699b1b3 (the
  T05 freeze results, the T05B record and evidence, the T07 brief, the board and the
  checkpoint pair).
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes".
- Branch: main. Expected HEAD = origin/main = 699b1b304390ae556c89c6d3a9ee652a00da5182. If
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
  - Use `D:\.claude-tmp\timesheet\WP5-UX3-T05B-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (6 modified paths)

`src/client/styles.css`, `src/client/TimesheetScreen.tsx`, `src/client/DayEditor.tsx`,
`tests/e2e/day-editor.spec.ts`, `tests/e2e/timesheet.spec.ts`, `tests/e2e/today.spec.ts`.

If the working tree differs from this set, do not commit: report the exact difference and
stop. Any path under `src/server/`, `src/domain/`, `docs/`, `scripts/`, AGENTS/CLAUDE,
`.claude/`, `package.json`, the lockfile or `vite.config.ts` always stops the commit. If
anything is already staged, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`: it must equal
a17a0ce82faac6f99e3fc0e53bdb02289784776efce6e969966bcf5dcb14aeb9 (827 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage (25)

- modified (5): `handoff/delivery/ORCHESTRATION.json`,
  `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`,
  `handoff/delivery/tasks/WP5-UX3-T05-FREEZE.md`, `handoff/delivery/tasks/WP5-UX3-T05B.md`;
- new task records (2): `handoff/delivery/tasks/WP5-UX3-T07.md` and this brief as it stands
  before you append results;
- new evidence (18): `handoff/delivery/evidence/WP5-UX3-T05-FREEZE/checks.txt` and
  `commit-message.txt`, and every file in `handoff/delivery/evidence/WP5-UX3-T05B/` (16: 10
  `.txt` and 6 `-synthetic.png`; count with the Glob tool first).

Expected staged total: 31 (6 source/tests + 25 handoff). If the T05B evidence count differs
from 16, report the list and stage what is there only if every name ends `.txt` or
`-synthetic.png`. Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX3-T05B-FREEZE/` stay unstaged.

Other modified tracked handoff files: record `git diff --stat` and the
`--ignore-cr-at-eol --ignore-space-at-eol` stat (names and counts only); leave a
line-ending-only change unstaged and continue; stop on a content change. Any other changed or
untracked path stops the commit (a file named `nul`; any `.raw`, `.xlsx`, `.pdf`, `.eml`,
`.csv`, `.map`, `.ttf` or database file; any image not ending `-synthetic.png`; any `.md`
under `evidence/`; any evidence file not ending `.txt` or `-synthetic.png`).

## Checks before committing

One command per step, each exit code recorded; save the masked output of every step in
`handoff/delivery/evidence/WP5-UX3-T05B-FREEZE/checks.txt` (required).
1. `node --version` (v24.x).
2. HEAD and origin/main.
3. The working-tree digest (a17a0ce8…, 827 files).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`); record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json and STATE.json (a script file in the task folder).
8. `handoff/delivery/validate_orchestration.py`.
9. `check_recovery.py` (106 probes).
10. `validate_package.py --preflight` with the workflow Python (`<user>` in the evidence).
11. After the commit: the `git ls-tree` digest of HEAD (a17a0ce8…).

Allowed fixes: trailing whitespace or a blank line at EOF in a task record outside
`evidence/` (fix exactly those lines, re-stage, record the file). A whitespace finding in a
source or test file: do not fix; stop and report the file and line, leaving the index staged.
If a permission check denies a call, stop at once. Do not print diffs, file bodies or
matches.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX3-T05B: floating Day editor below 1360px

- feat(client): sheet day columns never narrower than 108px; the Day editor sits beside the
  sheet only from 1360px (the page widens to 1600px while editing); from 768 to 1359px it
  floats as the modal side panel over a light backdrop, docked away from the edited column,
  which is scrolled into view; the week card scrolls sideways inside itself from 768 to
  899px; Escape, focus return, AX-01 and the deferred mode switch unchanged.
- test: floating versus side-by-side checks at 1280, 1359, 1360, 1366, 1440 and 1920, the
  no-squeeze probe, dock side and the B3-01 crossing at 1360; desktop tests that use the
  sheet with the editor open move to a wide viewport.
- docs(handoff): T05 freeze results, T05B record and evidence, T07 brief, board, checkpoint
  (+ vi).

Task: WP5-UX3-T05B (owner answer G-1 b, floating panel)
Gate: unit 2075 passed; full e2e desktop 281 passed, mobile 280, 0 failed; verify exit 0 (worker-reported)
Audit: pending, WP5-UX3-GATE then the round-3 area audits after slice T10
Digest: a17a0ce8 (was 23b394dd)

## Push and report

Append to this brief: pre- and post-HEAD; commit SHA, pushed, remote SHA; both digests;
staged count per group; other modified handoff files; every check with its exit code; any
fix, masking or stop reason.

## Results

- Pre-HEAD 699b1b304390ae556c89c6d3a9ee652a00da5182 (= origin/main); commit
  5c0dad8e41fddc25306e8f2ff28424f815af32ef on main; pushed yes; remote SHA the same; no tag.
- Digest before add and on the new HEAD (ls-tree): a17a0ce82faac6f99e3fc0e53bdb02289784776efce6e969966bcf5dcb14aeb9
  (827 files) both times.
- Staged 31: 6 source/tests + 25 handoff (5 modified, 2 task records, 18 evidence: 2 T05-FREEZE,
  16 T05B). Other modified handoff files: none beyond the 5 listed; `git diff --stat` and the
  ignore-eol stat were identical (11 files, 713 insertions, 76 deletions), no line-ending-only change.
- Checks 1-11 all exit 0 (details in evidence/WP5-UX3-T05B-FREEZE/checks.txt); precommit 31 files,
  0 findings; validate_orchestration PASS; check_recovery 106; preflight PASS.
- No fix, no masking, no stop. Deviation: one harmless `| head -0` in a grep probe (no output used).
