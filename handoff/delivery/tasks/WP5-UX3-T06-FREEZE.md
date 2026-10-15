# WP5-UX3-T06-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T06-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-UX3-T06 (done).
- This commit freezes slice WP5-UX3-T06: the pure break-row model for the session and
  Check out dialogs (UI change round 3; no UI change yet). It also carries the coordinator
  records since b4d9dd8:
  - the round-3 plan with its mockup and synthetic renders;
  - the T06 record and evidence;
  - the board, STATE.json, the checkpoint pair and NEXT_ACTION pair.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  b4d9dd87fd47531ff84eba40189153ab83562677.
  - If HEAD is a descendant whose extra commits touch only `handoff/`, report each extra
    commit (SHA, author name, subject, file names) and continue.
  - In any other case, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
    ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -e` (NOT EVEN
    `node -e "1"`). NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM
    `/dev/null` OR `nul`.** Redirect to a file in the task folder and read it with the Read
    tool. To list or count files, use the Glob tool or redirect to a file. To check Node,
    run `node --version` and nothing else.
  - Create files only in the task folder and the evidence folder.
  - Put Node 24 first on PATH before any node call. Make the first shell call
    `node --version` (it must be v24.x). Stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-UX3-T06-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set outside handoff/

Exactly these 2 new paths from WP5-UX3-T06:
- `src/client/components/breakRowsModel.ts`;
- `tests/client/breakRowsModel.test.ts`.

Any other changed or untracked path outside `handoff/` stops the commit. That includes
any path under `src/server/`, `src/domain/`, `docs/` or `scripts/`, every other file under
`src/client/` or `tests/`, `package.json`, the lockfile, AGENTS.md, CLAUDE.md and
`.claude/`. If anything is already staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
0ef75a1533d9831057f42f3a7b45e0a9386792caa47b4f2c98e091d1040b7499 (817 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

Stage every path below that is changed or untracked, and report the count per group:

- modified (6):
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/STATE.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/NEXT_ACTION.md` and `handoff/NEXT_ACTION.vi.md`;
- new task records (3):
  - `handoff/delivery/tasks/WP5-UX3-PLAN.md`;
  - `handoff/delivery/tasks/WP5-UX3-T06.md`;
  - this brief, as it stands before you append results;
- new design files (11) in `handoff/delivery/design/WP5-UX3/`: `mockup.html` and the ten
  renders whose basenames start with `mockup-a` and end with `-synthetic.png`;
- new evidence (13): every file in `handoff/delivery/evidence/WP5-UX3-T06/` (13 `.txt`).

Expected staged total: 35 (2 source + 33 handoff). Your appended results and your evidence
in `handoff/delivery/evidence/WP5-UX3-T06-FREEZE/` stay unstaged.

**Other modified tracked handoff files.** If `git status` shows any tracked handoff file
as modified that is not listed above:
- record `git diff --stat` and `git diff --ignore-cr-at-eol --ignore-space-at-eol --stat`
  for it (names and counts only);
- if the change is only line endings or trailing whitespace, leave it unstaged and
  continue;
- if the content changed, do not commit; stop and report.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map`, `.ttf` or database file;
- any image whose basename does not end `-synthetic.png`;
- any `.md` file under `evidence/`;
- any file under `evidence/` whose name does not end in `.txt` or `-synthetic.png`;
- any other file in `handoff/delivery/design/WP5-UX3/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX3-T06-FREEZE/checks.txt`.
1. `node --version` (v24.x).
2. HEAD and origin/main, plus the extra-commit report if any.
3. The working-tree digest (must be 0ef75a15…, 817 files).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json and STATE.json.
8. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
9. `check_recovery.py` (expected 106 probes).
10. `validate_package.py --preflight` by its script path, with the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
    Write `<user>` in the evidence.
11. After the commit: the `git ls-tree` digest of HEAD (must be 0ef75a15…).

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

Subject: Freeze WP5-UX3-T06: pure break-row model for the session and Check out dialogs

- feat(client): `breakRowsModel.ts`:
  - break rows as start date, start time and minutes; untouched saved or suggested rows
    resend their saved instants unchanged; otherwise the end is start + minutes in UTC,
    sent with an explicit offset (no DST gap or fold on the end);
  - row checks (whole minutes 1-720, before start, after end, overlap), DST gap and fold
    named "Break n", server `break_index` mapped to its row;
  - `breaks_confirmed`: listed rows or "Confirm no breaks taken" confirm; an empty
    unticked list follows one parameter (unconfirmed or blocked); Check out keeps E-1;
  - reference-hour pre-fill and past-day suggested breaks (server `today_local` only);
    summary text and dirty check for the confirmations. No UI change yet.
- test: `breakRowsModel.test.ts` (68 tests, passing under three device zones; three
  mutations caught).
- docs(handoff):
  - the UI change round 3 plan (owner items U-01..U-27), the mockup and ten synthetic
    renders;
  - the T06 record and evidence;
  - the owner request and coordinator decisions on the board, owner questions G-1..G-5;
  - STATE, the checkpoint (+ vi) and NEXT_ACTION (+ vi).

Task: WP5-UX3-T06 (owner request 2026-10-15, items U-21 and U-23..U-26)
Gate: unit 1950 passed; day-editor and shell e2e desktop 38 passed / 10 skipped, mobile 43 / 5, 0 failed; verify exit 0 (worker-reported)
Audit: pending, WP5-UX3-GATE then the round-3 area audits after slice T10
Digest: 0ef75a15 (was 229df806)

## Push and report

Push per the profile. Append to this brief:
- the pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values, the staged count, and the count per group;
- the report on other modified tracked handoff files;
- every check with its exit code;
- any fix applied or the stop reason.

## Results

- Pre-HEAD b4d9dd87fd47531ff84eba40189153ab83562677 (= origin/main); post-HEAD and
  commit 5c8355df8d60fdeb85b551eb0e5a09e8f18a6334; pushed yes; remote SHA the same.
- Digest before add and on new HEAD: 0ef75a1533d9831057f42f3a7b45e0a9386792caa47b4f2c98e091d1040b7499
  (817 files) both times.
- Staged 35: 2 source, 6 modified handoff, 3 task records, 11 design, 13 evidence.
- No other modified tracked handoff files; nothing pre-staged; no extra commits.
- Checks (all exit 0): node v24.21.0; digest; git add; precommit-check (35 files, 0
  findings); diff --cached --check; JSON parse; validate_orchestration PASS; check_recovery
  106 probes; validate_package --preflight; fetch, push dry-run, push.
- Deviation: none. No fixes, no masking. Details in evidence/WP5-UX3-T06-FREEZE/checks.txt.
