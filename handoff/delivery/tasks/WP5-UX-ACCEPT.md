# WP5-UX-ACCEPT dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-ACCEPT; package WP5; kind commit;
  attempt 1; depends on WP5-UX-ACCEPT-DOCS (done) and WP5-UX-AUDIT-AB9 (PASS).
- Purpose: the handoff-only accept commit for the re-acceptance of WP5 after the
  owner-requested UI change round. It changes no source: the digest stays
  57e2974c35cc104f3c2cb5d930c24d9bb15b89661be395d16a827e64ee4b761d.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  90b98efc395c3894a21a909b6d361eadc6fc2bd9.
  - If HEAD is a descendant whose extra commits touch only handoff/, report each extra
    commit (SHA, author name, subject, file names) and continue.
  - In any other case, stop and report.
- Push after the commit. Create no tag.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
    NO `| python`, NO `node -e` (NOT EVEN `node -e "1"`). NEVER PIPE OUTPUT INTO `head`
    OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`.**
    - Redirect output to a file in the task folder and read it with the Read tool.
    - To list or count files, use the Glob tool or redirect to a file.
    - To check Node, run `node --version` only.
  - Create files only in the task folder and the evidence folder.
  - Put Node 24 first on PATH before any node call. The first shell call is
    `node --version` (it must be v24.x). Stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-UX-ACCEPT` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never remove folders recursively.
  - Write your results into this brief with the Edit tool. Never write a blocked token
    verbatim in your Results; describe it instead.
- The coordinator writes no file while you run.

## Expected working-tree set

- Nothing outside handoff/ may be changed or untracked. If anything is, stop and
  report.
- Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) before
  `git add`. It must equal 57e2974c…. After the commit, the `git ls-tree` digest of the
  new HEAD must equal it too.

## Handoff files to stage

Stage every path below that is changed or untracked, and report the count per group:

- modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - `handoff/delivery/STATE.json`;
  - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
  - `handoff/NEXT_ACTION.md` and `handoff/NEXT_ACTION.vi.md`;
  - `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`;
  - `handoff/delivery/WP5_HANDOFF.md` and `.vi.md`;
  - `handoff/delivery/tasks/WP5-UX-FIX10-FREEZE.md` (its results);
- new: every file in `handoff/delivery/evidence/WP5-UX-FIX10-FREEZE/`;
- new: `handoff/delivery/tasks/WP5-UX-REGATE8.md` and every file in
  `handoff/delivery/evidence/WP5-UX-REGATE8/`;
- new: `handoff/delivery/tasks/WP5-UX-AUDIT-AB9.md`, `handoff/delivery/WP5_UX_REVIEW_AB9.md`,
  `handoff/delivery/WP5_UX_REVIEW_AB9.vi.md` and every file in
  `handoff/delivery/evidence/WP5-UX-AUDIT-AB9/`;
- new: `handoff/delivery/tasks/WP5-UX-ACCEPT-DOCS.md` and every file in
  `handoff/delivery/evidence/WP5-UX-ACCEPT-DOCS/`;
- new: this brief, as it stands before you append results.

Your appended results and your evidence in `handoff/delivery/evidence/WP5-UX-ACCEPT/`
stay unstaged.

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
- any file under `evidence/` whose name does not end in `.txt` or `-synthetic.png`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-UX-ACCEPT/checks.txt`.
1. `node --version` (v24.x).
2. HEAD and origin/main, plus the extra-commit report if any.
3. The working-tree digest (must be 57e2974c…).
4. `git add` with the explicit paths, as its own command and with no redirect.
5. The precommit check (`node scripts/precommit-check.mjs`). Record its file count.
6. `git diff --cached --check`.
7. JSON parse of ORCHESTRATION.json and STATE.json.
8. The orchestration validator (`handoff/delivery/validate_orchestration.py`).
9. `check_recovery.py` (expected 106 probes).
10. `validate_package.py --preflight` by its script path, with the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
    Write `<user>` in the evidence.
11. After the commit: the `git ls-tree` digest of HEAD (must be 57e2974c…).

Allowed fixes:
- If `git diff --cached --check` flags only trailing whitespace or a blank line at EOF
  in a task record outside `evidence/`, fix exactly those lines, re-stage the file and
  record the file name.
- Masking is allowed only as your profile permits. If anything else is blocked, do not
  commit; report the file, line and rule, and leave the index staged.

When to stop:
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, file bodies or matches. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Accept WP5 after the UI change round (90b98ef)

- docs(handoff): WP5 re-accepted on 90b98ef, digest 57e2974c (795 files):
  - WP5-UX-REGATE8 PASS: real-clock e2e 210/0/26, a 7-instant simulated-clock sweep
    and drill 208 PASS, with image dec7b485….
  - WP5-UX-AUDIT-AB9 PASS: a combined, independent recheck of areas A and B. It
    supersedes WP5-UX-AUDIT-A6 and the audits before it.
- docs(handoff): the pilot packet (+ vi) release identity, rollback card and
  provenance are refreshed. dist/server is byte-identical since 74d5bfe; only the
  client changed.
- docs(handoff): the WP5 handoff (+ vi) gets a re-acceptance section: owner request
  2026-10-08, E-1..E-7, WP5-UX-Q1 and Q2 (a), T01..T06, FIX1..FIX10, the carried
  backlog, and docs/10 carried forward.
- docs(handoff): STATE, the board, the checkpoint (+ vi) and NEXT_ACTION (+ vi).

Task: WP5-UX-ACCEPT (handoff only)
Gate: WP5-UX-REGATE8 PASS (NAS NOT VERIFIED)
Audit: WP5-UX-AUDIT-AB9 PASS
Digest: 57e2974c (unchanged)

## Push and report

Push per the profile. Append to this brief:
- the pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- both digest values, the staged count and the count per group;
- the report on other modified tracked handoff files;
- every check with its exit code;
- any fix applied or stop reason.

## Results

(committer appends here)
