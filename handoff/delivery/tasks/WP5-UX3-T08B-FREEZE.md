# WP5-UX3-T08B-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T08B-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX3-T08B (done).
- This commit freezes slice WP5-UX3-T08B: the overnight-only break date field (owner answer
  Q6 b), break chips with the "Break n" sub-dialog below the measured width, the phone
  spacing of the session dialog and the model helper `suggestionRows`. It also carries the
  coordinator records since 1a33c57 (the T08 freeze results, the T08B record and evidence,
  the T09 brief, the board and the checkpoint pair).
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes".
- Branch: main. Expected HEAD = origin/main = 1a33c574ee6f5ec5d02008e6077eb4e8b2ce3415. If
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
  - Use `D:\.claude-tmp\timesheet\WP5-UX3-T08B-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (10 paths)

- new (4): `src/client/components/BreakChip.tsx`, `src/client/components/BreakSubDialog.tsx`,
  `src/client/components/breakChipModel.ts`, `tests/client/breakChipModel.test.ts`;
- modified (6): `src/client/components/BreakRows.tsx`,
  `src/client/components/SessionDialog.tsx`, `src/client/components/breakRowsModel.ts`,
  `src/client/styles.css`, `tests/client/breakRowsModel.test.ts`,
  `tests/e2e/day-editor.spec.ts`.

If the working tree differs from this set, do not commit: report the exact difference and
stop. Any path under `src/server/`, `src/domain/`, `docs/`, `scripts/`, AGENTS/CLAUDE,
`.claude/`, `package.json`, the lockfile or `vite.config.ts` always stops the commit. If
anything is already staged, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`: it must equal
dd620f70e47c55a0b2fb1dcce215d390bb5156bf47da8a470f22a19d8ed21355 (834 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage (31)

- modified (5): `handoff/delivery/ORCHESTRATION.json`,
  `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`,
  `handoff/delivery/tasks/WP5-UX3-T08-FREEZE.md`, `handoff/delivery/tasks/WP5-UX3-T08B.md`;
- new task records (2): `handoff/delivery/tasks/WP5-UX3-T09.md` and this brief as it stands
  before you append results;
- new evidence (24): `handoff/delivery/evidence/WP5-UX3-T08-FREEZE/checks.txt` and
  `commit-message.txt`, and every file in `handoff/delivery/evidence/WP5-UX3-T08B/` (22: 14
  `.txt` and 8 `-synthetic.png`; count with the Glob tool first).

Expected staged total: 41 (10 source/tests + 31 handoff). If the T08B evidence count differs
from 22, report the list and stage what is there only if every name ends `.txt` or
`-synthetic.png`. Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX3-T08B-FREEZE/` stay unstaged.

Other modified tracked handoff files: record `git diff --stat` and the
`--ignore-cr-at-eol --ignore-space-at-eol` stat (names and counts only); leave a
line-ending-only change unstaged and continue; stop on a content change. Any other changed or
untracked path stops the commit (a file named `nul`; any `.raw`, `.xlsx`, `.pdf`, `.eml`,
`.csv`, `.map`, `.ttf` or database file; any image not ending `-synthetic.png`; any `.md`
under `evidence/`; any evidence file not ending `.txt` or `-synthetic.png`).

## Checks before committing

One command per step, each exit code recorded; save the masked output of every step in
`handoff/delivery/evidence/WP5-UX3-T08B-FREEZE/checks.txt` (required).
1. `node --version` (v24.x).
2. HEAD and origin/main.
3. The working-tree digest (dd620f70…, 834 files).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`); record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json and STATE.json (a script file in the task folder).
8. `handoff/delivery/validate_orchestration.py`.
9. `check_recovery.py` (106 probes).
10. `validate_package.py --preflight` with the workflow Python (`<user>` in the evidence).
11. After the commit: the `git ls-tree` digest of HEAD (dd620f70…).

Allowed fixes: trailing whitespace or a blank line at EOF in a task record outside
`evidence/` (fix exactly those lines, re-stage, record the file). A whitespace finding in a
source or test file: do not fix; stop and report the file and line, leaving the index staged.
If a permission check denies a call, stop at once. Do not print diffs, file bodies or
matches.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX3-T08B: overnight-only break dates, break chips and sub-dialog

- feat(client): a break's date field appears only for a session that crosses midnight or has
  no end; otherwise breaks follow the session date; same-day breaks stay one row on every
  phone; below the measured width each break becomes a chip ("Break 1 · 10:00 → 10:15",
  24-hour) that opens a "Break n" sub-dialog (Done keeps the edit in the draft until Save;
  Remove; Cancel; errors marked on the chip); tidier phone spacing in the session dialog;
  `suggestionRows` moves into the break-row model with unit tests.
- test: chip-text and suggestion-row unit tests; date rule, layouts, chips, sub-dialog focus
  and Escape, errors on chips and unchanged request bodies in day-editor e2e; simulated-clock
  runs at the fall-back fold and the spring-forward gap.
- docs(handoff): T08 freeze results, T08B record and evidence, T09 brief, board, checkpoint
  (+ vi).

Task: WP5-UX3-T08B (owner requests N-1, N-2; answers Q6 b and 24-hour chip times)
Gate: unit 2126 passed; full e2e desktop 305 passed, mobile 299, 0 failed; simulated clock 2 instants 0 failed; verify exit 0 (worker-reported)
Audit: pending, WP5-UX3-GATE then the round-3 area audits after slice T10
Digest: dd620f70 (was da580f1e)

## Push and report

Append to this brief: pre- and post-HEAD; commit SHA, pushed, remote SHA; both digests;
staged count per group; other modified handoff files; every check with its exit code; any
fix, masking or stop reason.

## Results
