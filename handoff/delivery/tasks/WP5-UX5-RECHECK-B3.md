# WP5-UX5-RECHECK-B3 dispatch brief (fresh recheck of area B after FIX16)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-RECHECK-B3, package WP5, kind
  audit, attempt 1.
  - It depends on WP5-UX5-REGATE12 (PASS required). REGATE11 on 1fe5ad3 failed on one
    e2e timeout under a saturated host. DIAG10 and FIX17 fixed that in two e2e files
    (`import.spec.ts`, `today.spec.ts`); no source changed after FIX16.
  - It rechecks WP5-UX5-RECHECK-B2 (FIX REQUIRED on be2afa2): finding F-UX5B3-1 and the
    optional risks R-UX5B3-1 and R-UX5B3-2. Read `handoff/delivery/WP5_UX5_RECHECK_B2.md`.
  - Run in a fresh context.
- **Profile and routing.** timesheet-auditor, requested opus/xhigh, no override.
  - Routing: size S, risk H (the restore release rule for held sends), novelty no.
  - Write the task record in English.
  - The review pair is `handoff/delivery/WP5_UX5_RECHECK_B3.md` and `.vi.md`. Use the
    REVIEW template in `handoff/templates/`.
- **Author separation.** You wrote no WP5-UX4 or WP5-UX5 task; their agent IDs are on the
  board. Treat every planner, expert, worker, committer and verifier report as a claim.
- **Target.**
  - `reviewed_commit` = TARGET_SHA = the `freeze_commit` of WP5-UX5-REGATE12 on the board.
    It is the WP5-UX5-FIX17-FREEZE commit, pushed. HEAD may be a later commit that changes
    only `handoff/`.
  - TARGET_DIGEST = 69c6daff305dca839a7128e7b7509f3063c165fe5653d1c73159ea41c003e6bf (882
    files).
  - The base for this recheck is be2afa2e3c43514581ed62fd145c15eeef13b534.
  - Record HEAD, the digest before and after (three forms) and `reviewed_commit`.
  - Work on a clean export or a scratch clone at TARGET_SHA.
- **AGENTS.md on disk wins.** Rules 4, 6, 7 and 8 matter here.
- Never touch `.claude/worktrees/` or its branch.

## Read

- `handoff/delivery/tasks/WP5-UX5-FIX16.md` and its evidence;
- `handoff/delivery/tasks/WP5-UX5-REGATE11.md`, `WP5-UX5-DIAG10.md`, `WP5-UX5-FIX17.md` and
  `WP5-UX5-REGATE12.md`, with their evidence;
- RECHECK-B2's review and evidence, including its probes `40-restore-probe.ts.txt` and
  `50-http-restore.mjs.txt`;
- docs/05, docs/11 and docs/12, EN and VI.

## Scope

1. **F-UX5B3-1.** Rerun RECHECK-B2's in-process probe and its HTTP and CLI probe on the
   target. Then check:
   - Is a held superseded send refused for a later send of the period in every
     `intervention` form? The forms are: failed permanently; uncertain; uncertain and
     marked delivered; uncertain after a runner died in `sending`; held by a second
     restore.
   - Is the owner's same-revision repeat refused?
   - Is `superseded_by_later_send` the right code for that repeat?
2. **The cancelled exception.** FIX16 lets a cancelled later send not block. Its reasoning:
   - no product path cancels a send job;
   - docs/12 says a send job cannot be cancelled;
   - `cancelled` is reached only for reminders;
   - a cancelled job is frozen and delivers nothing.

   Check each claim in the code. Judge whether the exception is right, and whether
   docs/05:72 (EN and VI) now states the rule exactly. Check that docs/11:178 is still exact
   without a change.
3. **The later order and the midnight second.** Is case E1 a real pin (mutant K2)? Is the
   new midnight-second check-in a real pin (mutant T4)?
4. **Regressions** since be2afa2, which may touch only `restore.ts` on the server side:
   - restore, outbound hold, resume and release;
   - `releaseAllHeldJobs`;
   - other periods and other owners;
   - audit events;
   - the drill's restore stage, per REGATE11 (209 PASS on the FIX16 build, which
     REGATE12 shows is unchanged).
5. **Test strength.** Write at least six mutants of your own on FIX16's change, and say
   whether the suite catches each, and for the right reason.
6. **Mandatory checks yourself:**
   - typecheck, lint, `npm test` once (expect 2,397), build;
   - the integration files for restore, sends, jobs, delivery and the timesheet API, each
     once;
   - the real-clock FULL e2e on both projects;
   - AC-13 once.

   A failure whose trace shows a network or buffer error, or a test timeout, may be rerun
   once; record both runs.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-RECHECK-B3`. Ports 51420-51449.
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
  - Write probes as files in the task folder and run them.
  - Read outputs with the Read tool.
  - To wait for a long command, use the Bash tool's own background run and its exit notice.
- **Git.** Never change any git configuration. For git in a scratch clone, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Never kill processes by PID, and never use `Stop-Process`. Leave nothing running.
- Put Node 24 first on PATH for every node or npm call. Do not run `npm ci` or
  `npm install` in the repository.
- Create files only in the task folder, the evidence folder and the review pair. Every file
  ends with exactly one newline.
- **Data and mail.**
  - Use synthetic data and local mail capture only. `PRODUCTION_SENDING_ENABLED` is never
    set.
  - Screenshots end in `-synthetic.png`, at most 8.
  - No email address except the full synthetic `@example.invalid` form.
  - **No password literal in any evidence file, probe scripts included.**
  - Write `<user>` for profile paths.
- If a permission check denies a call, stop and report.

## Output

- The review pair.
- Results in this file.
- Evidence in `handoff/delivery/evidence/WP5-UX5-RECHECK-B3/`: masked LF `.txt` and
  `-synthetic.png`.
- **Decision:** PASS, FIX REQUIRED or NOT VERIFIED.
  - Number each new finding (F-UX5B4-n), with its severity, file:line, reproduction and
    expected result.
  - Give F-UX5B3-1's disposition, and the dispositions of R-UX5B3-1 and R-UX5B3-2.
  - List optional risks separately.
- Return at most 200 words, beginning with your self-reported model.

## Results
