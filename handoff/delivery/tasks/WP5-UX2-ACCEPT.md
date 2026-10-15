# WP5-UX2-ACCEPT dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-ACCEPT; package WP5; kind commit;
  attempt 1; depends on WP5-UX2-ACCEPT-DOCS (done) and WP5-UX2-AUDIT2 (PASS).
- This is the accept commit of UI change round 2: WP5 is re-accepted on a643794 /
  229df806 (gate WP5-UX2-REGATE2 PASS, audit WP5-UX2-AUDIT2 PASS). It is handoff-only:
  no file outside `handoff/` changes.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  a6437943403fc416240fd13a787a8c4748af3e84.
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
  - Create the task folder `D:\.claude-tmp\timesheet\WP5-UX2-ACCEPT` first and use it for
    TEMP/TMP and raw output. Only masked, final `.txt` files go to the evidence folder.
  - Create files only in the task folder and the evidence folder. Never create links or
    junctions.
  - Put Node 24 first on PATH before any node call. Make the first shell call
    `node --version` (it must be v24.x). Stop on ENOSPC.
  - Never kill processes by PID. Never remove anything recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set

Nothing outside `handoff/` may be changed or untracked. If anything is, stop and report.
If anything is already staged before you start, report it first.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) before `git add`.
It must equal
229df806aeaaa886ab11ee83556746ee65eda6c81a596dcd180d80d5d0b04db3 (815 files). After the
commit, the `git ls-tree` digest of the new HEAD must equal it too.

## Handoff files to stage

Stage every path below that is changed or untracked, and report the count per group:

- modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/STATE.json`;
  - `handoff/NEXT_ACTION.md` and `handoff/NEXT_ACTION.vi.md`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`;
  - `handoff/delivery/WP5_HANDOFF.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX2-FIX2-FREEZE.md` (its results);
- new records:
  - `handoff/delivery/tasks/WP5-UX2-REGATE2.md`;
  - `handoff/delivery/tasks/WP5-UX2-AUDIT2.md`;
  - `handoff/delivery/tasks/WP5-UX2-ACCEPT-DOCS.md`;
  - `handoff/delivery/WP5_UX2_REVIEW2.md` and `handoff/delivery/WP5_UX2_REVIEW2.vi.md`;
  - this brief, as it stands before you append results;
- new evidence (report the exact count of each kind per folder; all names must end in
  `.txt` or `-synthetic.png`):
  - both files in `handoff/delivery/evidence/WP5-UX2-FIX2-FREEZE/`;
  - every file in `handoff/delivery/evidence/WP5-UX2-REGATE2/` (about 105 `.txt`);
  - every file in `handoff/delivery/evidence/WP5-UX2-AUDIT2/` (`.txt` and 4
    `-synthetic.png`);
  - the file in `handoff/delivery/evidence/WP5-UX2-ACCEPT-DOCS/`.

Your appended results and your evidence in `handoff/delivery/evidence/WP5-UX2-ACCEPT/`
stay unstaged. Write BOTH `checks.txt` and `commit-message.txt` there.

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
step in `handoff/delivery/evidence/WP5-UX2-ACCEPT/checks.txt`.
1. `node --version` (v24.x).
2. HEAD and origin/main, plus the extra-commit report if any.
3. The working-tree digest (must be 229df806…, 815 files).
4. `git add` with the explicit paths (folder paths for the four evidence folders), as
   its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json and STATE.json.
8. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
9. `check_recovery.py` (expected 106 probes).
10. `validate_package.py --preflight` by its script path, with the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
    Write `<user>` in the evidence.
11. After the commit: the `git ls-tree` digest of HEAD (must be 229df806…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF
  in a task record or review outside `evidence/`, fix exactly those lines, re-stage the
  file and record the file name.
- Mask only as your profile allows. If anything else is blocked, do not commit: report
  the file, line and rule, and leave the index staged.

When to stop:
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Accept WP5 after UI change round 2 (a643794)

- docs(handoff):
  - WP5-UX2-REGATE2 PASS on a643794 (drill image 6d184442…) and its evidence;
  - WP5-UX2-AUDIT2 PASS, its review pair and evidence (WP5-UX2-AUDIT-01..03 closed);
  - the pilot packet identity refreshed to a643794 / 229df806 with corrected server
    provenance (three message texts);
  - the WP5 handoff section "Re-acceptance after UI change round 2 (WP5-UX2)";
  - STATE, NEXT_ACTION (+ vi), the board and the checkpoint (+ vi).
- WP5 is re-accepted on a643794 / 229df806. UI change round 2 is closed. The NAS is NOT
  VERIFIED; the pilot is not authorized.

Task: WP5-UX2-ACCEPT (re-accept after UI change round 2)
Gate: WP5-UX2-REGATE2 PASS on a643794 (NAS NOT VERIFIED)
Audit: WP5-UX2-AUDIT2 PASS on a643794 / 229df806
Digest: 229df806 (unchanged)

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
