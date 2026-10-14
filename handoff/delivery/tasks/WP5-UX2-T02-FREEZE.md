# WP5-UX2-T02-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-T02-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX2-T02 (done).
- This commit freezes slice WP5-UX2-T02 of UI change round 2: hover and pressed system,
  Show details switch, label-picker selection. It also carries the coordinator records
  since af6207c:
  - the T01-FREEZE results and evidence;
  - the PLAN4 addendum and the mockup update;
  - the T02 record and evidence;
  - the board and the checkpoint pair.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  af6207c281badc27192d1d420de8ace5a73c8296.
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
  - Use `D:\.claude-tmp\timesheet\WP5-UX2-T02-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/

Exactly these 10 paths from WP5-UX2-T02:
- modified (8):
  - `src/client/styles.css`;
  - `src/client/TimesheetScreen.tsx`;
  - `tests/e2e/contrast.ts`;
  - `tests/e2e/focus-ring.spec.ts`;
  - `tests/e2e/timesheet.spec.ts`;
  - `tests/e2e/shell.spec.ts`;
  - `tests/e2e/day-editor.spec.ts`;
  - `tests/e2e/theme.spec.ts`;
- new (2):
  - `src/client/components/ShowDetailsSwitch.tsx`;
  - `tests/e2e/hover.spec.ts`.

Any other changed or untracked path outside `handoff/` stops the commit. That includes
any path under `src/server/`, `docs/` or `scripts/`, `package.json`, the lockfile and
any config file. If anything is already staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
1e421090db42b29359948de3b4773d438eebe343b47a3e9ce9a2f240b06604c3 (804 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

Stage every path below that is changed or untracked, and report the count per group:

- modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX2-T01-FREEZE.md` (its results);
  - `handoff/delivery/design/WP5-UX2/mockup.html` (the PLAN4 update);
- new task records:
  - `handoff/delivery/tasks/WP5-UX2-PLAN4.md`;
  - `handoff/delivery/tasks/WP5-UX2-T02.md`;
  - this brief, as it stands before you append results;
- new evidence:
  - both files in `handoff/delivery/evidence/WP5-UX2-T01-FREEZE/`;
  - every file in `handoff/delivery/evidence/WP5-UX2-T02/` (22 files: 16 `.txt` and 6
    `-synthetic.png`).

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX2-T02-FREEZE/` stay unstaged.

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
step in `handoff/delivery/evidence/WP5-UX2-T02-FREEZE/checks.txt`.
1. `node --version` (v24.x).
2. HEAD and origin/main, plus the extra-commit report if any.
3. The working-tree digest (must be 1e421090…, 804 files).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json.
8. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
9. `check_recovery.py` (expected 106 probes).
10. `validate_package.py --preflight` by its script path, with the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
    Write `<user>` in the evidence.
11. After the commit: the `git ls-tree` digest of HEAD (must be 1e421090…).

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

Subject: Freeze WP5-UX2-T02: clearer hover, switch and label-picker selection

- feat(client):
  - Hover: secondary and quiet buttons, navigation links, phone tabs and More entries
    use the new `--hover-fill` token with an accent boundary. All hover rules sit inside
    `@media (hover: hover)`.
  - Pressed toggles are a solid accent fill that hover can no longer erase. The AX-04
    special case is removed; the shared focus ring stays visible on the fill.
  - "Show details" is a native `role="switch"` checkbox with a 44x24 track.
  - Label picker: a 1px open trigger line, a fill plus a 3px rail on the active option,
    and a check shape on the current value (CSS only).
- test: new `hover.spec.ts` (hover criterion, pressed kept under hover, no sticky hover on
  touch); the six planned assertion updates (switch role, `check()`, focus targets, AX-04,
  AX-02 rail); `theme.spec.ts` hover check branched on `(hover: hover)`; contrast helper
  extended additively.
- docs(handoff):
  - the T01-FREEZE results;
  - the PLAN4 wordmark addendum and the mockup update;
  - the T02 record and evidence;
  - the owner answers WP5-UX2-Q1 and WP5-UX2-Q2 and the coordinator decisions on the
    board;
  - the checkpoint (+ vi).

Task: WP5-UX2-T02 (owner request 2026-10-14, items 2, 4 and 6)
Gate: unit 1848 passed; full e2e desktop 171 passed / 15 skipped, mobile 175 / 11, 0 failed; verify exit 0 (worker-reported)
Audit: pending, WP5-UX2-GATE then WP5-UX2-AUDIT after slice T08
Digest: 1e421090 (was 44f5b6cc)

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
