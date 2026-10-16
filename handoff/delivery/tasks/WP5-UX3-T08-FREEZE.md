# WP5-UX3-T08-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T08-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX3-T08 (done).
- This commit freezes slice WP5-UX3-T08: the session dialog with break rows, automatic
  pre-fill, the "No breaks listed" notice, the save and discard confirmations and the
  nested-dialog rules; the old inline session form is deleted. It also carries the
  coordinator records since f8117a4 (the T07 freeze results, the T08 record and evidence, the
  owner's Q6 answer, the T08B brief, the board, the checkpoint pair and NEXT_ACTION pair).
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes".
- Branch: main. Expected HEAD = origin/main = f8117a48cd856ee09494e54c64d6f09dbc20b234. If
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
  - Use `D:\.claude-tmp\timesheet\WP5-UX3-T08-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (10 paths)

- new (2): `src/client/components/SessionDialog.tsx`, `src/client/components/BreakRows.tsx`;
- deleted (1, unstaged deletion in the working tree): `src/client/components/SessionForm.tsx`;
- modified (7): `src/client/DayEditor.tsx`, `src/client/components/SessionList.tsx`,
  `src/client/components/TimeProblemPrompt.tsx`, `src/client/TimesheetScreen.tsx`,
  `src/client/styles.css`, `tests/e2e/day-editor.spec.ts`, `tests/e2e/today.spec.ts`.

If the working tree differs from this set, do not commit: report the exact difference and
stop. `src/client/components/BreaksEditor.tsx` must still exist (the Check out dialog uses it
until T09). Any path under `src/server/`, `src/domain/`, `docs/`, `scripts/`, AGENTS/CLAUDE,
`.claude/`, `package.json`, the lockfile or `vite.config.ts` always stops the commit. If
anything is already staged, report it first.

**Digest with a deletion.** `node scripts/source-digest.mjs` exits 1 while a tracked file's
deletion is unstaged. So: run `git add` with every explicit path first (the deleted path
included, with `git add -- src/client/components/SessionForm.tsx`, which stages its
removal; never `git rm`), then run `node scripts/source-digest.mjs`: it must equal the
worker's probe digest da580f1ec4df94fc438fc3594892657d41ded922e978519b7b9a4471e83f31d4 (830
files). If it differs, do not commit; report both values and leave the index staged. After
the commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage (35)

- modified (7): `handoff/delivery/ORCHESTRATION.json`,
  `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`,
  `handoff/NEXT_ACTION.md` and `handoff/NEXT_ACTION.vi.md`,
  `handoff/delivery/tasks/WP5-UX3-T07-FREEZE.md`, `handoff/delivery/tasks/WP5-UX3-T08.md`;
- new task records (2): `handoff/delivery/tasks/WP5-UX3-T08B.md` and this brief as it stands
  before you append results;
- new evidence (26): `handoff/delivery/evidence/WP5-UX3-T07-FREEZE/checks.txt` and
  `commit-message.txt`, and every file in `handoff/delivery/evidence/WP5-UX3-T08/` (24: 16
  `.txt` and 8 `-synthetic.png`; count with the Glob tool first).

Expected staged total: 45 (10 source/tests including the deletion + 35 handoff). If the T08
evidence count differs from 24, report the list and stage what is there only if every name
ends `.txt` or `-synthetic.png`. Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX3-T08-FREEZE/` stay unstaged.

Other modified tracked handoff files: record `git diff --stat` and the
`--ignore-cr-at-eol --ignore-space-at-eol` stat (names and counts only); leave a
line-ending-only change unstaged and continue; stop on a content change. Any other changed or
untracked path stops the commit (a file named `nul`; any `.raw`, `.xlsx`, `.pdf`, `.eml`,
`.csv`, `.map`, `.ttf` or database file; any image not ending `-synthetic.png`; any `.md`
under `evidence/`; any evidence file not ending `.txt` or `-synthetic.png`).

## Checks

One command per step, each exit code recorded; save the masked output of every step in
`handoff/delivery/evidence/WP5-UX3-T08-FREEZE/checks.txt` (required).
1. `node --version` (v24.x).
2. HEAD and origin/main.
3. `git status --porcelain=v1` (the set check above, names only).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The digest after staging (`node scripts/source-digest.mjs`; da580f1e…, 830 files).
6. The precommit check (`node scripts/precommit-check.mjs`); record its file count.
7. `git diff --cached --check`.
8. JSON parse of ORCHESTRATION.json and STATE.json (a script file in the task folder).
9. `handoff/delivery/validate_orchestration.py`.
10. `check_recovery.py` (106 probes).
11. `validate_package.py --preflight` with the workflow Python (`<user>` in the evidence).
12. After the commit: the `git ls-tree` digest of HEAD (da580f1e…).

Allowed fixes: trailing whitespace or a blank line at EOF in a task record outside
`evidence/` (fix exactly those lines, re-stage, record the file). A whitespace finding in a
source or test file: do not fix; stop and report the file and line, leaving the index staged.
If a permission check denies a call, stop at once. Do not print diffs, file bodies or
matches.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX3-T08: session dialog with break rows and confirmations

- feat(client): new and edited sessions open a separate dialog (time section with the input
  zone; breaks as rows of start and minutes with a "Confirm no breaks taken" box, "Suggest
  breaks" and "Add break"); a new session is pre-filled with the reference hours and, for a
  day before the server's today, the suggested breaks, marked as such; Save asks "No breaks
  listed" (confirm none, leave unconfirmed, go back) when no break is listed and the box is
  unticked, and always ends in "Save this session?"; a changed Cancel asks "Discard your
  changes?"; one modal on top with its own Escape and focus return; the editor's period chip
  reads "in progress" in the window days; the old inline session form is removed. Same
  request shapes; no server change.
- test: dialog flows, pre-fill, the notice and its three outcomes, confirmations, break fold
  and gap prompts, row layouts, nested Escape at 1366 and 1280 and across 1360px, the editor
  chip; simulated-clock runs at the fall-back fold, the spring-forward gap and just before
  midnight.
- docs(handoff): T07 freeze results, T08 record and evidence, the owner's Q6 answer, T08B
  brief, board, checkpoint (+ vi), NEXT_ACTION (+ vi).

Task: WP5-UX3-T08 (owner request 2026-10-15, U-21, U-23..U-26; G-3 a, G-4 owner variant)
Gate: unit 2091 passed; full e2e desktop 298 passed, mobile 292, 0 failed; simulated clock 3 instants 0 failed; verify exit 0 (worker-reported)
Audit: pending, WP5-UX3-GATE then the round-3 area audits after slice T10
Digest: da580f1e (was a3cbc3f4)

## Push and report

Append to this brief: pre- and post-HEAD; commit SHA, pushed, remote SHA; the digest after
staging and on HEAD; staged count per group; other modified handoff files; every check with
its exit code; any fix, masking or stop reason.

## Results
