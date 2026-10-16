# WP5-UX3-T02-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T02-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX3-T02 (done).
- This commit freezes slice WP5-UX3-T02: the identity block, the account menu, the phone
  More content, the desktop navigation with Timesheet, Overtime and History, and the
  wordmark rule. It also carries the coordinator records since e2f3d74 (the T01 freeze
  results, the T02 record and evidence, the T03 brief, the board and the checkpoint pair).
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes".
- Branch: main. Expected HEAD = origin/main = e2f3d7492160d389c18903285994bedec56df51e. If
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
    `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`;
    the first shell call is `node --version` and must print v24.x. Stop on ENOSPC.
  - Create files only in the task folder and the evidence folder.
  - Use `D:\.claude-tmp\timesheet\WP5-UX3-T02-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/ (19 paths)

- new (3): `src/client/components/AccountMenu.tsx`, `src/client/components/accountModel.ts`,
  `tests/client/accountModel.test.ts`;
- modified (16): `src/client/components/AppShell.tsx`, `src/client/components/ThemeToggle.tsx`,
  `src/client/styles.css`, `tests/e2e/fixtures.ts`, `tests/e2e/shell.spec.ts`,
  `tests/e2e/hover.spec.ts`, `tests/e2e/logo.spec.ts`, `tests/e2e/theme.spec.ts`,
  `tests/e2e/focus-ring.spec.ts`, `tests/e2e/admin.spec.ts`, `tests/e2e/admin-status.spec.ts`,
  `tests/e2e/isolation.spec.ts`, `tests/e2e/import.spec.ts`, `tests/e2e/sharing.spec.ts`,
  `tests/e2e/setup.spec.ts`, `tests/e2e/keyboard-access.spec.ts`.

Any other changed or untracked path outside `handoff/` stops the commit (including
`src/server/`, `src/domain/`, `docs/`, `scripts/`, AGENTS/CLAUDE, `.claude/`, `package.json`,
the lockfile, `vite.config.ts`). If one of the 19 is missing, report it and stop. If anything
is already staged, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`: it must equal
c938aa6fcd55a15f1edd6fc28462981b33188de9462d6d60f9a8fcde19a7b72c (822 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage (26)

- modified (5): `handoff/delivery/ORCHESTRATION.json`,
  `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`,
  `handoff/delivery/tasks/WP5-UX3-T01-FREEZE.md`, `handoff/delivery/tasks/WP5-UX3-T02.md`;
- new task records (2): `handoff/delivery/tasks/WP5-UX3-T03.md` and this brief as it stands
  before you append results;
- new evidence (19): `handoff/delivery/evidence/WP5-UX3-T01-FREEZE/checks.txt` and
  `commit-message.txt`, and every file in `handoff/delivery/evidence/WP5-UX3-T02/` (17: 9
  `.txt` and 8 `-synthetic.png`; count with the Glob tool first).

Expected staged total: 45 (19 source/tests + 26 handoff). Your appended results and your
evidence in `handoff/delivery/evidence/WP5-UX3-T02-FREEZE/` stay unstaged.

Other modified tracked handoff files: record `git diff --stat` and the
`--ignore-cr-at-eol --ignore-space-at-eol` stat (names and counts only); leave a
line-ending-only change unstaged and continue; stop on a content change. Any other changed or
untracked path stops the commit (a file named `nul`; any `.raw`, `.xlsx`, `.pdf`, `.eml`,
`.csv`, `.map`, `.ttf` or database file; any image not ending `-synthetic.png`; any `.md`
under `evidence/`; any evidence file not ending `.txt` or `-synthetic.png`).

## Checks before committing

One command per step, each exit code recorded; save the masked output of every step in
`handoff/delivery/evidence/WP5-UX3-T02-FREEZE/checks.txt` (required).
1. `node --version` (v24.x).
2. HEAD and origin/main.
3. The working-tree digest (c938aa6f…, 822 files).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`); record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json and STATE.json (a script file in the task folder).
8. `handoff/delivery/validate_orchestration.py`.
9. `check_recovery.py` (106 probes).
10. `validate_package.py --preflight` with the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
    (`<user>` in the evidence).
11. After the commit: the `git ls-tree` digest of HEAD (c938aa6f…).

Allowed fixes: trailing whitespace or a blank line at EOF in a task record outside
`evidence/` (fix exactly those lines, re-stage, record the file). A whitespace finding in a
source or test file: do not fix; stop and report the file and line, leaving the index staged.
Mask only as your profile allows; otherwise do not commit and report. If a permission check
denies a call, stop at once. Do not print diffs, file bodies or matches.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX3-T02: account menu, identity block and wordmark rule

- feat(client): the top bar shows the signed-in user's display name (bold) over the email,
  right-aligned before an initials avatar; the identity button opens a non-modal account
  menu (Profile, Settings, Administration for admins, Theme, Sign out) with keyboard
  opening, Escape and focus return; the desktop navigation keeps Timesheet, Overtime and
  History; the phone More panel shows the same account content; the wordmark shows from
  1024px (from 1280px with the share switcher).
- test: account model unit tests; account menu, More panel, reachability, contrast and
  wordmark e2e checks; navigation steps in the admin, import, isolation, sharing, setup,
  keyboard, theme, hover, focus-ring and logo specs go through the menu (`openAccount`).
- docs(handoff): T01 freeze results, T02 record and evidence, T03 brief, board, checkpoint
  (+ vi).

Task: WP5-UX3-T02 (owner request 2026-10-15, U-03, U-04, U-05 navigation part, U-06)
Gate: unit 2045 passed; full e2e desktop 246 passed / 30 skipped, mobile 257 / 19, 0 failed; verify exit 0 (worker-reported)
Audit: pending, WP5-UX3-GATE then the round-3 area audits after slice T10
Digest: c938aa6f (was a4f127cc)

## Push and report

Append to this brief: pre- and post-HEAD; commit SHA, pushed, remote SHA; both digests;
staged count per group; other modified handoff files; every check with its exit code; any
fix or stop reason.

## Results

- Pre-HEAD e2f3d7492160d389c18903285994bedec56df51e; commit
  aa64999240ab0d5822ca371a0c8e24436d27f30a; pushed yes; remote SHA the same. No tag.
- Digest before add and on new HEAD: c938aa6fcd55a15f1edd6fc28462981b33188de9462d6d60f9a8fcde19a7b72c (822 files).
- Staged 45 = 19 source/tests + 26 handoff (T02 evidence folder: 17 files).
- No other modified handoff files; no fixes; no stops.
- Checks all exit 0 (details in evidence/WP5-UX3-T02-FREEZE/checks.txt); precommit 45 files,
  validate_orchestration PASS, check_recovery 106 probes PASS, validate_package preflight PASS.
- Deviation: none (first PATH glob attempt printed v26, redone with the brief's exact PATH, v24.21.0).
