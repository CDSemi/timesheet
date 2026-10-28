# WP5-UX5-AUDIT-INT dispatch brief (integration audit of UI change rounds 4 and 5)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-AUDIT-INT, package WP5, kind
  audit, attempt 1.
  - It depends on WP5-UX5-REGATE11 (PASS required) and WP5-UX5-RECHECK-B3 (PASS required).
  - Its PASS re-accepts WP5 after UI change rounds 4 and 5. It supersedes
    WP5-UX5-RECHECK-A2 (PASS on be2afa2 / ff73565b) as the current acceptance of area A.
  - Run in a fresh context.
- **Profile and routing.** timesheet-auditor, requested opus/xhigh, no override.
  - Routing: size L, risk H, novelty no. docs/08 "WP5 as 2-3 area audits plus one
    integration pass".
  - Write the task record in English.
  - The review pair is `handoff/delivery/WP5_UX5_REVIEW_INT.md` and `.vi.md`. Use the
    REVIEW template in `handoff/templates/`.
- **Author separation.** You wrote no WP5-UX4 or WP5-UX5 task, and none of their audits; the
  agent IDs are on the board. Treat every report and earlier verdict as a claim.
- **Target.**
  - `reviewed_commit` = TARGET_SHA = the `freeze_commit` of WP5-UX5-REGATE11 on the board.
    It is the WP5-UX5-FIX16-FREEZE commit, pushed. HEAD may be a later commit that changes
    only `handoff/`.
  - TARGET_DIGEST = 18aa0ad0f99fbab18ae535d8b36375b756469a717e08b675a1e5d93d7459267c (882
    files). If the board records a later accepted fix before your dispatch, the coordinator
    states the new target in an addendum.
  - The last accepted snapshot is 8e557100d16b6b6eb86a48e00276835761aabfdf (digest
    507de97c).
  - Record HEAD, the digest before and after (three forms) and `reviewed_commit`.
  - Work on a clean `git archive` export or a scratch clone at TARGET_SHA.
- **AGENTS.md on disk wins.** Its UI section is "Frontend and UI/UX standards".
- Never touch `.claude/worktrees/` or its branch.

## Read

- AGENTS.md from disk; docs/08 "Gates and independent audit".
- **The owner's words**, verbatim on the board (`owner_decisions`):
  - the round-4 requests and answers;
  - the round-5 request, the answers F-1..F-10 and the mockup notes and adjustments;
  - "1 a, 2 a", "A.a, B.A, C.b" and "D.a, E.a";
  - the `coordinator_decisions` of rounds 4 and 5.
- The plans `handoff/delivery/tasks/WP5-UX4-PLAN*.md` and `WP5-UX5-PLAN*.md`, and the mockup
  `handoff/delivery/design/WP5-UX5/mockup.html`.
- **Every review of the rounds:**
  - `WP5_UX4_*` reviews;
  - `WP5_UX5_REVIEW_A.md` and `_B.md`;
  - `WP5_UX5_RECHECK_A.md`, `_B.md`, `_A2.md`, `_B2.md` and `_B3.md`.
- **Every gate record:** WP5-UX5-GATE, and REGATE to REGATE11.
- **Every diagnosis and fix record:** DIAG1..DIAG9, FIX1..FIX16, with their evidence.
- docs/04, 05, 10, 11 and 12, EN and VI, as frozen.

## Scope

1. **Integration of the rounds' records.**
   - Every finding of every review is closed, or accepted as an optional risk with a
     reason.
   - Earlier verdicts are carried forward only where the later diffs leave them valid.
     Name the diffs you checked: `git diff <reviewed_commit>..TARGET` for each earlier PASS
     area.
   - Map every owner item of rounds 4 and 5 (U4-xx, U5-xx), and every answer, to the
     review that judged it. No item may be left unjudged.
   - Every gate FAIL reason has a verdict. The REGATE5 to REGATE9 failures were:
     - the logo timeout;
     - the measuring races;
     - the starved tab;
     - the range ladder;
     - the midnight date reads.
   - Every recorded risk has a current status.
2. **Changes since the area rechecks.**
   - **Area A:** confirm that RECHECK-A2's PASS (on ff73565b) still holds at the target.
     FIX16 should touch no client file.
   - **Area B:** confirm RECHECK-B3's verdict on the target.
3. **Cross-area behaviour, by your own probes:**
   - a period signed and sent, then corrected and resent, with a backup, restore, resume
     and release in between. Watch what the Review page and the history show at each step.
   - the Day editor's unsaved-changes guard with a check-in running across the local
     midnight;
   - the theme followed across two tabs while the Day editor and the account menu are open;
   - a shared view (view only and edit) with the round-5 header, sheet and dialogs.
4. **Test design.** Judge the suite as it now stands. The e2e suite holds tests off the
   reporting-zone midnight (FIX15). Is the midnight behaviour covered enough by:
   - the crossing test;
   - the integration boundary tests;
   - DIAG9's product probe?
   Also check that the simulated-clock sweeps still test what FIX10 designed them for.
5. **AC-13** under the America/Los_Angeles, Asia/Tokyo and America/New_York device zones.
6. **Docs.** Check docs/04, 05, 10, 11 and 12, EN and VI, against the frozen behaviour for
   the points above. Check that the EN and VI files keep structural parity.
7. **Mandatory checks:**
   - typecheck, lint, `npm test`, build (no advisory);
   - the FULL e2e on both projects on the real clock;
   - one seven-file sweep run at 2026-10-27T06:58:30Z through the FIX10 wrapper.

   A run that fails only with a network or buffer error is rerun once, and both runs are
   recorded.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-AUDIT-INT`. Ports 51450-51489.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every server or CLI run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash. Use PowerShell only as inline read-only `-NoProfile -Command` queries, and
  never with `-ExecutionPolicy` or `-File`.
- **This is a public repository.** Evidence may hold process names, IDs, counts and CPU
  times only. Never write the command line of a process the mission did not start.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY ONES),
  NO `node -e` OR `node -p` (NOT EVEN `node -e 0`), NO `python -c`, NO `node -` OR
  `python -`, NO `| node`, NO `| python`. NEVER PIPE INTO `head`, `tail` OR `cat`. NEVER
  REDIRECT TO OR FROM `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul`, ALSO
  NOT IN `2>`. NO `rm -r` OR `rm -rf`, NO `sed -i`, NO FIFO WAITER SCRIPTS, NO `git init`, NO
  `sleep`, `ping` OR `tail -F` USED AS WAITS, NO DETACHED SHELLS.**
  - Write probes as files in the task folder and run them by path.
  - Read outputs with the Read tool.
  - To wait for a long command, use the Bash tool's own background run and its exit notice.
- **Git.** Never change any git configuration. For git in a scratch clone, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH for every node or npm call. Do not run `npm ci` or
  `npm install` in the repository.
- axe-core 4.14.0, if used, goes in the task folder only.
- Never kill processes by PID. Leave nothing running.
- Create files only in the task folder, the evidence folder and the review pair. Every file
  ends with exactly one newline. Evidence names end in `.txt` or `-synthetic.png` only, with
  at most 12 screenshots.
- Use synthetic data and local mail capture only. No email address except the full
  synthetic `@example.invalid` form. No password literal. Write `<user>` for profile paths.
- If a permission check denies a call, stop and report.

## Output

- The review pair.
- Results in this file.
- Evidence in `handoff/delivery/evidence/WP5-UX5-AUDIT-INT/`.
- **Decision:** PASS, FIX REQUIRED or NOT VERIFIED.
  - Number each new finding (F-UX5I-n), with its severity, file:line, reproduction and
    expected result.
  - List the optional backlog for the WP5 handoff separately.
- Return at most 250 words, beginning with your self-reported model.

## Results
