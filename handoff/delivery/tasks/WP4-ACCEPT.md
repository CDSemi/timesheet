# WP4-ACCEPT dispatch brief

- Mission/task: timesheet-software-readiness / WP4-ACCEPT; package WP4; kind commit;
  attempt 1; depends on WP4-ACCREC.
- This commit records the WP4 acceptance and changes no source. The accepted source is
  546cddaf6747aef85e8b6d9b7712de9e28f138bf, digest
  26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081 (775 files). It was
  accepted on:
  - WP4-REGATE4 PASS;
  - the final audits WP4-RECHECK-A attempt 4 and WP4-RECHECK-B4, both PASS.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M (many evidence files and probe sources), novelty no. Records in
  English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  546cddaf6747aef85e8b6d9b7712de9e28f138bf. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **Never feed anything to python or node through stdin.** Never pipe into head or
    tail.
  - Call Node 24 by its full portable path; make the first shell call a trivial
    `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP4-ACCEPT` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set (handoff/ only)

Nothing outside handoff/ may be changed, staged or untracked. Any such path stops the
commit; report it.

Digest: `node scripts/source-digest.mjs` (Node 24) on the working tree must equal
26fcc969… (775 files), because handoff/ is excluded. Also record the `git ls-tree` form
of HEAD; it must match too.

## Handoff files to stage

Stage these paths explicitly. Each may be new or modified; report which.
- `handoff/delivery/WP4_RECHECK_A4.md` and `.vi.md`;
- `handoff/delivery/WP4_RECHECK_B4.md` and `.vi.md`;
- `handoff/delivery/WP4_HANDOFF.md` and `.vi.md`;
- `handoff/delivery/STATE.json` and `handoff/delivery/ORCHESTRATION.json`;
- `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
- `handoff/NEXT_ACTION.md` and `.vi.md`;
- `handoff/delivery/tasks/`: `WP4-FIXB4-FREEZE.md`, `WP4-REGATE4.md`,
  `WP4-RECHECK-A.md`, `WP4-RECHECK-B4.md`, `WP4-ACCREC.md`, and this brief as it
  stands before you append results;
- every file in these folders under `handoff/delivery/evidence/`: `WP4-FIXB4-FREEZE/`,
  `WP4-REGATE4/`, `WP4-RECHECK-A4/`, `WP4-RECHECK-B4/` and `WP4-ACCREC/`.

Your appended results and your evidence in `handoff/delivery/evidence/WP4-ACCEPT/` stay
unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any `.md` or binary file under `evidence/`;
- `mail-capture` or `private-data` content.

## Checks before committing

Run one command per step and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP4-ACCEPT/checks.txt`.
1. `node --version`.
2. The working-tree digest and the `git ls-tree` digest of HEAD. Both must be
   26fcc969….
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check.
5. `git diff --cached --check`.
6. JSON parse of STATE.json and ORCHESTRATION.json.
7. The orchestration validator.
8. `check_recovery.py`.
9. `validate_package.py --preflight` with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.

Also use the Grep tool to confirm that no `.claude/` path and no path outside handoff/
is staged.

Allowed fixes:
- If `git diff --cached --check` flags only a blank line at EOF in a task record outside
  `evidence/`, remove exactly that line, re-stage it and record the file name.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log under the listed folders, replace each such token with `<email>` or `<user>` in
  that evidence file only, re-stage it and rerun. Count the tokens with the Grep tool
  and never print them.

When to stop:
- If any other check fails, do not commit; report the file, line and rule.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs, probe sources, names or addresses through the shell. Keep evidence
LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Record WP4 acceptance: final gate and independent rechecks pass at 546cdda

- docs(handoff): WP4-REGATE4 PASS on 546cdda (1758 tests, smoke 41, e2e 145 passed /
  5 skipped, drill 208 PASS, migrations 61, races 60/60), digest 26fcc969; the parse
  bound holds at the 2 MiB ceiling (worst 107 ms / +70 MiB)
- docs(handoff): final independent rechecks WP4_RECHECK_A4 and WP4_RECHECK_B4, both
  PASS with no findings, with evidence (+ vi)
- docs(handoff): WP4_HANDOFF acceptance record (+ vi); STATE marks WP4 passed with
  carried risks; NEXT_ACTION and checkpoint point to WP5

Task: WP4-ACCEPT (WP4 acceptance record; no source change)

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- both digest values and the staged count;
- new versus modified paths;
- check exit codes;
- any blockers.

Return at most 150 words, beginning with your self-reported model.

## Attempt 2 (coordinator note)

Attempt 1 stopped correctly. The validator reported "Unfinished dependency:
WP4-RECHECK-A" because the coordinator had recorded the results of WP4-REGATE4 and
WP4-RECHECK-B4 but left both tasks at status `running`. Both are now `done`; the board
has no other change apart from this task's attempt record.

For attempt 2:
1. Confirm HEAD and origin/main are still 546cdda, and the digest is still 26fcc969….
2. Re-stage these by explicit path in one `git add`, and keep the 163 staged paths:
   - `handoff/delivery/ORCHESTRATION.json`;
   - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
   - this brief, before you append results.
3. Rerun checks 4 to 9, one command each, then commit and push.

## Results

Committer (claude-sonnet-5-5), attempt 1: NO COMMIT, stopped on a failed check.
- Node v24.21.0; HEAD = origin/main = 546cdda (pre; post unchanged); branch main.
- Working-tree digest and ls-tree digest both 26fcc969 (775 files).
- Staged 163 paths (150 new, 13 modified), all under handoff/; precommit exit 0;
  `git diff --cached --check` exit 0; JSON parse exit 0.
- validate_orchestration.py exit 1: ValueError "Unfinished dependency: WP4-RECHECK-A"
  (validate_orchestration.py line 309; a dependency task is not status done on the board).
- check_recovery.py and validate_package.py --preflight not run (stopped).
- Blocker: coordinator must fix the board status of WP4-RECHECK-A, then redispatch.
