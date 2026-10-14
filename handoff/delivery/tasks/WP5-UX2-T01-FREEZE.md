# WP5-UX2-T01-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-T01-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX2-T01 (done).
- This commit freezes slice WP5-UX2-T01: the owner-requested Dark mode toggle in the
  main navigation (UI change round 2). It also carries the coordinator records since
  834b9fc:
  - the round-2 plan and its two addenda, with the mockup and its synthetic renders;
  - the T01 record and evidence;
  - the board, STATE.json, the checkpoint pair and NEXT_ACTION.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  834b9fcc62d55501371030dea966547d3dc53902.
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
  - Use `D:\.claude-tmp\timesheet\WP5-UX2-T01-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/

Exactly these 12 paths from WP5-UX2-T01:
- modified (5):
  - `eslint.config.js`;
  - `src/client/components/AppShell.tsx`;
  - `src/client/index.html`;
  - `src/client/styles.css`;
  - `tests/e2e/shell.spec.ts`;
- new (7):
  - `src/client/components/ThemeToggle.tsx`;
  - `src/client/components/themeModel.ts`;
  - `src/client/public/theme-init.js` (the only file in `src/client/public/`);
  - `tests/client/cssThemeParity.test.ts`;
  - `tests/client/themeModel.test.ts`;
  - `tests/e2e/contrast.ts`;
  - `tests/e2e/theme.spec.ts`.

Any other changed or untracked path outside `handoff/` stops the commit. That includes
any path under `src/server/`, `docs/` or `scripts/`, `package.json`, the lockfile,
`vite.config.ts`, and any other file in `src/client/public/`. If anything is already
staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
44f5b6ccb1569f11d0a966a54ecfbd90d151f2e7b8a958ccdbd8ce03108b5c07 (802 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

Stage every path below that is changed or untracked, and report the count per group:

- modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/STATE.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/NEXT_ACTION.md` and `handoff/NEXT_ACTION.vi.md`;
- new task records:
  - `handoff/delivery/tasks/WP5-UX2-PLAN.md`;
  - `handoff/delivery/tasks/WP5-UX2-PLAN2.md`;
  - `handoff/delivery/tasks/WP5-UX2-PLAN3.md`;
  - `handoff/delivery/tasks/WP5-UX2-T01.md`;
  - this brief, as it stands before you append results;
- new design files in `handoff/delivery/design/WP5-UX2/`: `mockup.html`,
  `mockup-1-desktop-sheet-synthetic.png`, `mockup-2-controls-synthetic.png` and
  `mockup-3-phone-synthetic.png`;
- new evidence: every file in `handoff/delivery/evidence/WP5-UX2-T01/` (19 files: 15
  `.txt` and 4 `-synthetic.png`).

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX2-T01-FREEZE/` stay unstaged.

**Other modified tracked handoff files.** If `git status` shows any tracked handoff file
as modified that is not listed above:
- record `git diff --stat` and `git diff --ignore-cr-at-eol --ignore-space-at-eol --stat`
  for it (names and counts only);
- if the change is only line endings or trailing whitespace, leave it unstaged and
  continue;
- if the content changed, do not commit; stop and report.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any image whose basename does not end `-synthetic.png`;
- any `.md` file under `evidence/`;
- any file under `evidence/` whose name does not end in `.txt` or `-synthetic.png`;
- any other file in `handoff/delivery/design/WP5-UX2/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX2-T01-FREEZE/checks.txt`.
1. `node --version` (v24.x).
2. HEAD and origin/main, plus the extra-commit report if any.
3. The working-tree digest (must be 44f5b6cc…, 802 files).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json and STATE.json.
8. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
9. `check_recovery.py` (expected 106 probes).
10. `validate_package.py --preflight` by its script path, with the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
    Write `<user>` in the evidence.
11. After the commit: the `git ls-tree` digest of HEAD (must be 44f5b6cc…).

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

Subject: Freeze WP5-UX2-T01: Dark mode toggle in the main navigation

- feat(client):
  - A "Dark mode" toggle (`aria-pressed`) sits in the desktop top bar and in the phone
    More panel.
  - The app follows the device until the first press. The choice is stored per device
    in `localStorage`.
  - `/theme-init.js` applies the stored theme before first paint. The CSP is unchanged.
  - The dark token set also applies under `[data-theme='dark']`. A light override sets
    `color-scheme: light`.
- test: theme model and CSS dark-set parity unit tests; `theme.spec` e2e (media
  following, override, persistence, pre-paint, CSP, blocked storage, a second tab); a
  shared contrast helper; shell checks.
- docs(handoff):
  - the UI change round 2 plan with addenda PLAN2 and PLAN3, the mockup and synthetic
    renders;
  - the T01 record and evidence;
  - the owner and coordinator decisions on the board;
  - STATE, the checkpoint (+ vi) and NEXT_ACTION (+ vi).

Task: WP5-UX2-T01 (owner request 2026-10-14, item 3)
Gate: unit 1848 passed; full e2e desktop 138 passed / 15 skipped, mobile 142 / 11, 0 failed; verify exit 0 (worker-reported)
Audit: pending, WP5-UX2-GATE then WP5-UX2-AUDIT after slice T08
Digest: 44f5b6cc (was 57e2974c)

## Push and report

Push per the profile. Append to this brief:
- the pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values, the staged count, and the count per group;
- the report on other modified tracked handoff files;
- every check with its exit code;
- any fix applied or the stop reason.

## Results

- Pre-HEAD 834b9fcc62d55501371030dea966547d3dc53902 (= origin/main, no extra commits).
- Commit af6207c281badc27192d1d420de8ace5a73c8296, pushed yes; remote SHA is the same.
- Digest before add and ls-tree digest of the new HEAD: both 44f5b6cc... (802 files).
- Staged 46: 12 source, 6 modified handoff, 5 task records, 4 design, 19 evidence.
- No other modified tracked handoff files; nothing was staged beforehand.
- Checks, all exit 0: node v24.21.0, precommit (46 files, 0 findings), diff --check
  (empty), JSON parse, validate_orchestration, check_recovery (106 probes),
  validate_package --preflight. Details in evidence/WP5-UX2-T01-FREEZE/checks.txt.
- No fixes, no masking. Deviation: my first call redirected a command's output to
  /dev/null by mistake (harmless).
