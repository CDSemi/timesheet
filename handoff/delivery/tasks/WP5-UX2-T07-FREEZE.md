# WP5-UX2-T07-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-T07-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX2-T07 (done).
- This commit freezes slice WP5-UX2-T07 of UI change round 2: the Light/Dark theme
  toggle with icons. It also carries the coordinator records since 3f5a3b3:
  - the T06-FREEZE results and evidence;
  - the T07 record and evidence;
  - the board and the checkpoint pair.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  3f5a3b333dede51043000e7123960ac05d26a76b.
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
  - Create the task folder `D:\.claude-tmp\timesheet\WP5-UX2-T07-FREEZE` first and use it
    for TEMP/TMP and raw output. Only masked, final `.txt` files go to the evidence
    folder.
  - Create files only in the task folder and the evidence folder.
  - Put Node 24 first on PATH before any node call. Make the first shell call
    `node --version` (it must be v24.x). Stop on ENOSPC.
  - Never kill processes by PID. Never remove anything recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/

Exactly these 8 modified paths from WP5-UX2-T07, with no new file:
- `src/client/components/ThemeToggle.tsx`;
- `src/client/components/AppShell.tsx`;
- `src/client/styles.css`;
- `tests/e2e/theme.spec.ts`;
- `tests/e2e/shell.spec.ts`;
- `tests/e2e/focus-ring.spec.ts`;
- `tests/e2e/logo.spec.ts`;
- `tests/e2e/contrast.ts`.

Any other changed or untracked path outside `handoff/` stops the commit. That includes
any path under `src/server/`, `docs/` or `scripts/`, `package.json`, the lockfile, any
config file, and any font or raster file. If anything is already staged before you
start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
3416cf04012f3da4a44b3968d384200e108301741ee599f37fdfe61b388975e8 (812 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

Stage every path below that is changed or untracked, and report the count per group:

- modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX2-T06-FREEZE.md` (its results);
- new task records:
  - `handoff/delivery/tasks/WP5-UX2-T07.md`;
  - this brief, as it stands before you append results;
- new evidence:
  - both files in `handoff/delivery/evidence/WP5-UX2-T06-FREEZE/`;
  - every file in `handoff/delivery/evidence/WP5-UX2-T07/` (18 files: 10 `.txt` and 8
    `-synthetic.png`).

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX2-T07-FREEZE/` stay unstaged. Write BOTH `checks.txt`
and `commit-message.txt` there.

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
step in `handoff/delivery/evidence/WP5-UX2-T07-FREEZE/checks.txt`.
1. `node --version` (v24.x).
2. HEAD and origin/main, plus the extra-commit report if any.
3. The working-tree digest (must be 3416cf04…, 812 files).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json.
8. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
9. `check_recovery.py` (expected 106 probes).
10. `validate_package.py --preflight` by its script path, with the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
    Write `<user>` in the evidence.
11. After the commit: the `git ls-tree` digest of HEAD (must be 3416cf04…).

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

Subject: Freeze WP5-UX2-T07: Light/Dark theme toggle with icons

- feat(client):
  - The "Dark mode" on/off button becomes a compact "Theme" control: a radio group with
    "Light" (sun icon) and "Dark" (moon icon). It is in the desktop top bar and the
    phone More panel.
  - The checked segment is a solid accent fill; arrow keys switch the theme.
  - The device default, the per-device storage and the pre-paint script are unchanged.
- test: theme, shell, focus-ring and logo specs move from the pressed button to the radio
  checked state (same facts); new keyboard, contrast, More-panel and one-row-bar checks.
- docs(handoff):
  - the T06-FREEZE results;
  - the T07 record and evidence;
  - the board and the checkpoint (+ vi).

Task: WP5-UX2-T07 (owner request 2026-10-14, Light/Dark toggle)
Gate: unit 1877 passed; full e2e desktop 204, mobile 210 passed, 32 skipped, 0 failed; verify exit 0 (worker-reported)
Audit: pending, WP5-UX2-GATE then WP5-UX2-AUDIT after slice T10
Digest: 3416cf04 (was 3407f8f7)

## Push and report

Push per the profile. Append to this brief:
- the pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values, the staged count, and the count per group;
- the report on other modified tracked handoff files;
- every check with its exit code;
- any fix applied or the stop reason.

## Results

(The committer appends results here.)
