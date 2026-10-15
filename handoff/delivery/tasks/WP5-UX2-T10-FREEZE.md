# WP5-UX2-T10-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-T10-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX2-T10 (done).
- This is the package-final freeze of UI change round 2: it freezes the docs slice
  WP5-UX2-T10. The package-final gate WP5-UX2-GATE and the fresh audit WP5-UX2-AUDIT run
  on this commit. It also carries the coordinator records since f70a5c0:
  - the T09-FREEZE results and evidence;
  - the T10 record and evidence;
  - the board and the checkpoint pair.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  f70a5c0479b6cc1a0dd10d29f7791157ff29c43d.
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
  - Create the task folder `D:\.claude-tmp\timesheet\WP5-UX2-T10-FREEZE` first and use it
    for TEMP/TMP and raw output. Only masked, final `.txt` files go to the evidence
    folder.
  - Create files only in the task folder and the evidence folder. Never create links or
    junctions.
  - Put Node 24 first on PATH before any node call. Make the first shell call
    `node --version` (it must be v24.x). Stop on ENOSPC.
  - Never kill processes by PID. Never remove anything recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/

Exactly these 12 modified docs paths from WP5-UX2-T10, with no new file:
- `DEVELOPMENT.md`, `DEVELOPMENT.vi.md`;
- `docs/01_PRODUCT_REQUIREMENTS.md`, `docs/01_PRODUCT_REQUIREMENTS.vi.md`;
- `docs/02_TIME_AND_OT_RULES.md`, `docs/02_TIME_AND_OT_RULES.vi.md`;
- `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md`;
- `docs/10_DECISIONS_AND_SOURCES.md`, `docs/10_DECISIONS_AND_SOURCES.vi.md`;
- `docs/12_RELEASE_NOTES.md`, `docs/12_RELEASE_NOTES.vi.md`.

Any other changed or untracked path outside `handoff/` stops the commit. That includes
any path under `src/`, `tests/` or `scripts/`, `docs/08` (a governance path), AGENTS.md,
CLAUDE.md, `package.json`, the lockfile and any config file. If anything is already
staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
20e7a7c8cd19b811aedfd814b35ead3b9a8d2eab7c9dbdd0b23626a609773fa5 (814 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

Stage every path below that is changed or untracked, and report the count per group:

- modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX2-T09-FREEZE.md` (its results);
- new task records:
  - `handoff/delivery/tasks/WP5-UX2-T10.md`;
  - this brief, as it stands before you append results;
- new evidence:
  - both files in `handoff/delivery/evidence/WP5-UX2-T09-FREEZE/`;
  - every file in `handoff/delivery/evidence/WP5-UX2-T10/` (7 `.txt` files).

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-UX2-T10-FREEZE/` stay unstaged. Write BOTH `checks.txt`
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
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map`, `.diff`, `.ttf`, `.otf`,
  `.woff`, `.woff2` or database file;
- any image whose basename does not end `-synthetic.png`;
- any `.md` file under `evidence/`;
- any file under `evidence/` whose name does not end in `.txt` or `-synthetic.png`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX2-T10-FREEZE/checks.txt`.
1. `node --version` (v24.x).
2. HEAD and origin/main, plus the extra-commit report if any.
3. The working-tree digest (must be 20e7a7c8…, 814 files).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json.
8. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
9. `check_recovery.py` (expected 106 probes).
10. `validate_package.py --preflight` by its script path, with the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
    Write `<user>` in the evidence.
11. After the commit: the `git ls-tree` digest of HEAD (must be 20e7a7c8…).

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

Subject: Freeze WP5-UX2-T10: document UI change round 2

- docs:
  - docs/04 describes the round as built:
    - logo and wordmark from 1440px; the Theme control;
    - the hover and pressed rule; the Show details switch;
    - the open-day column and row marker; the label picker;
    - Today and Current period; the one-line phone Review link;
    - "Due" as a label; the range arrow;
    - check in/out in the phone top bar (none in shared views);
    - no company line on screen (the PDF keeps it).
  - docs/10 records the owner requests and answers of 2026-10-14, the round's
    coordinator decisions and the carried WP5-UX-Q1/Q2 decisions.
  - docs/12 adds the round's release notes.
  - docs/01, docs/02 and DEVELOPMENT use "Check in/out"; API identifiers keep "clock".
  - EN and VI in parity.
- docs(handoff):
  - the T09-FREEZE results;
  - the T10 record and evidence;
  - the board and the checkpoint (+ vi).

Task: WP5-UX2-T10 (UI change round 2 documentation)
Gate: preflight 0; verify exit 0 (worker-reported); package-final gate WP5-UX2-GATE next
Audit: pending, WP5-UX2-AUDIT after the gate
Digest: 20e7a7c8 (was 29ea76df)

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
