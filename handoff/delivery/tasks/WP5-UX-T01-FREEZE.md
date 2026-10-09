# WP5-UX-T01-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-T01-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX-T01 (done).
- This commit freezes the first slice of the owner-requested UI redesign (tokens, button
  variants, new app shell, Settings import link, e2e updates). It also carries the
  coordinator records since the last commit and the WP5-UX-CKPT results.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  5faa0b6f046568dae300331790a9dd168685427b. If either differs, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **Never feed anything to python or node through stdin. Never use a heredoc.**
    Never pipe into head or tail.
  - Call Node 24 by its full portable path; make the first shell call a trivial
    `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-UX-T01-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the only changed paths may be these (from WP5-UX-T01; each is
modified, none new; `src/client/App.tsx` was not changed and must not appear):
- `src/client/styles.css`
- `src/client/components/AppShell.tsx`
- `src/client/SettingsScreen.tsx`
- `tests/e2e/shell.spec.ts`, `tests/e2e/admin.spec.ts`, `tests/e2e/import.spec.ts`,
  `tests/e2e/ot-leave.spec.ts`, `tests/e2e/sharing.spec.ts`,
  `tests/e2e/isolation.spec.ts`, `tests/e2e/setup.spec.ts`, `tests/e2e/review.spec.ts`,
  `tests/e2e/timesheet.spec.ts`

Report which of them are actually changed. Any other changed or untracked path outside
handoff/ stops the commit. If anything is already staged before you start, report it
first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
b5cdb2d469506b978847eadf41815b8b9fe72c0e585602b99f81d350cc96a41b (the WP5-UX-T01 final
digest). After the commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

New files:
- `handoff/delivery/tasks/WP5-UX-T01.md`;
- this brief, as it stands before you append results;
- every file in `handoff/delivery/evidence/WP5-UX-T01/` (four `.txt` files) and in
  `handoff/delivery/evidence/WP5-UX-CKPT/` (`checks.txt`, `commit-message.txt`).

Modified files:
- `handoff/delivery/tasks/WP5-UX-CKPT.md` (its attempt-2 results);
- `handoff/delivery/ORCHESTRATION.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
- `handoff/NEXT_ACTION.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX-T01-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map`, `.png` or database file;
- any `.md` file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX-T01-FREEZE/checks.txt`.
1. `node --version`.
2. The working-tree digest (must be b5cdb2d4…).
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
8. `check_recovery.py`.
9. `validate_package.py --preflight` by its script path, with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.
10. After the commit: the `git ls-tree` digest of HEAD (must be b5cdb2d4…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF in
  a task record outside `evidence/`, fix exactly those lines, re-stage the file and
  record the file name.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log under `evidence/WP5-UX-T01/` or `evidence/WP5-UX-CKPT/`, replace each such token
  with `<email>` or `<user>` in that evidence file only, re-stage it and rerun the check.

When to stop:
- If any other check fails, do not commit; report the file, line and rule. Never edit
  source or test files.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Freeze WP5-UX-T01: design tokens and new app shell

- feat(client):
  - new design tokens (light and dark) and primary, secondary and quiet button variants
    using the shared transition, press offset and focus ring;
  - app shell: desktop top navigation Timesheet, Overtime, History, Settings (+ Admin);
    below 768px a compact top bar and a bottom tab bar with More (Settings, Import,
    Admin, Sign out); "OT" renamed "Overtime";
  - Settings links to "Import from Excel"; the #/import route is unchanged.
- test(e2e): navigation and mobile More flows in the shell, admin, import, ot-leave,
  sharing, isolation, setup, review and timesheet specs; tap-target loops check every
  visible control with their previous lower bounds.
- docs(handoff): WP5-UX-T01 record and evidence, WP5-UX-CKPT results, owner answers
  E-1..E-7, board, checkpoint (+ vi) and NEXT_ACTION (+ vi).

Task: WP5-UX-T01 (owner-requested UI redesign, slice 1 of 6)
Gate: full e2e desktop 72/0/3, mobile 73/0/2; typecheck, lint, verify exit 0
Digest: b5cdb2d4 (was 150420e7)

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values and the staged count;
- every check with its exit code;
- any fix applied or stop reason.

## Results

- Pre-HEAD 5faa0b6f046568dae300331790a9dd168685427b; post-HEAD and commit
  32244744ff37835603a1c2685ef2eb4e4d78861f; pushed yes; remote SHA the same.
- Digest before staging and on new HEAD: b5cdb2d469506b978847eadf41815b8b9fe72c0e585602b99f81d350cc96a41b
  (both). Staged count 26. All 12 listed non-handoff paths were changed.
- Checks (all exit 0): node --version v24.21.0; digest; git add; precommit (26 files, 0
  findings); diff --check; ORCHESTRATION.json parse; validate_orchestration; check_recovery;
  validate_package --preflight; HEAD ls-tree digest.
- Fixes: none. Evidence: evidence/WP5-UX-T01-FREEZE/checks.txt, commit-message.txt (unstaged).
- Model: claude-sonnet-5-5.
