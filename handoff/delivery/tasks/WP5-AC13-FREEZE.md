# WP5-AC13-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-AC13-FREEZE; package WP5; kind
  commit; attempt 1; depends on WP5-AC13.
- This commit freezes the integrated AC-13 test. It also carries the WP5-FIXB-FREEZE
  results and the draft WP5-REL brief.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M, novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  85838b515a86b3cca40cfbba189ba290ec06de58. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
    shell.
  - **Never feed anything to python or node through stdin.** Never pipe into head or
    tail.
  - Call Node 24 by its full portable path; make the first shell call a trivial
    `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP5-AC13-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the only changed paths may be these two new files from WP5-AC13:
- `tests/integration/ac13-two-week.test.ts`;
- `tests/integration/ac13-support.ts`.

Any other changed or untracked path outside handoff/ stops the commit. In particular,
nothing under `src/`, `scripts/`, migrations, `docs/`, `.claude/`, `reference/`,
`package.json`, `package-lock.json`, AGENTS.md or CLAUDE.md may change. If anything is
already staged from an earlier tool run, report it before you continue.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
1e59ad31d9af2a3f4a3aa5711647ea8742e1534b3d4f8ba4f2210beee44a3d2c (777 files).

## Handoff files to stage

New files:
- `handoff/delivery/tasks/WP5-AC13.md` and `WP5-REL.md`;
- this brief, as it stands before you append results;
- every file in `handoff/delivery/evidence/WP5-FIXB-FREEZE/` and
  `handoff/delivery/evidence/WP5-AC13/`.

Modified files:
- `handoff/delivery/tasks/WP5-FIXB-FREEZE.md`;
- `handoff/delivery/ORCHESTRATION.json` and `handoff/delivery/STATE.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP5-AC13-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map`, `.png` or database file;
- any `.md` file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP5-AC13-FREEZE/checks.txt`.
1. `node --version`.
2. The digest.
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check.
5. `git diff --cached --check`.
6. JSON parse of STATE.json and ORCHESTRATION.json.
7. The orchestration validator.
8. `check_recovery.py`.
9. `validate_package.py --preflight` with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.

Allowed fixes:
- If `git diff --cached --check` flags only a blank line at EOF in a task record outside
  `evidence/`, remove exactly that line and re-stage it.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log, replace each such token with `<email>` or `<user>` in that file only, then
  re-stage and rerun. Count the tokens with the Grep tool and never print them.

When to stop:
- A block in a test file stops the commit.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs or file bodies. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add the integrated AC-13 two-week scenario test

- test(ac13):
  - one deterministic in-process scenario over 14 fixed dates, with review, sign-off,
    a crash and restart around the send, a correction, partial OT use with a
    double-spend race, second-user isolation and an overdue run;
  - it passes under three time zones;
  - two mutations are caught.
- docs(handoff): WP5-FIXB-FREEZE results, the WP5-AC13 record and evidence, the draft
  WP5-REL brief, and the board, STATE and checkpoint (+ vi).

Task: WP5-AC13-FREEZE

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest and staged count;
- the scope checks;
- check exit codes;
- any blockers.

Return at most 150 words, beginning with your self-reported model.

## Results

(Committer appends here.)
