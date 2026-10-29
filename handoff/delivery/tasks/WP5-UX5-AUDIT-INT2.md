# WP5-UX5-AUDIT-INT2 dispatch brief (integration recheck after FIX18)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-AUDIT-INT2, package WP5, kind
  audit, attempt 1.
  - It depends on WP5-UX5-REGATE13 (PASS required).
  - It rechecks WP5-UX5-AUDIT-INT (FIX REQUIRED on a5cbc91 / 69c6daff, finding F-UX5I-1).
  - Its PASS re-accepts WP5 after UI change rounds 4 and 5. It supersedes RECHECK-A2
    (PASS on ff73565b) and RECHECK-B3 (PASS on 69c6daff) as the current acceptance.
  - Run in a fresh context.
- **Profile and routing.** timesheet-auditor, requested opus/xhigh, no override.
  - Routing: size M, risk H, novelty no.
  - Write the task record in English.
  - The review pair is `handoff/delivery/WP5_UX5_REVIEW_INT2.md` and `.vi.md`. Use the
    REVIEW template in `handoff/templates/`.
- **Author separation.** You wrote no WP5-UX4 or WP5-UX5 task, and none of their audits; the
  agent IDs are on the board. Treat every report and earlier verdict as a claim.
- **Target.**
  - `reviewed_commit` = TARGET_SHA = the `freeze_commit` of WP5-UX5-REGATE13 on the board.
    It is the WP5-UX5-FIX18-FREEZE commit, pushed.
  - TARGET_DIGEST = REGATE13's `source_digest` on the board.
  - HEAD may be a later commit that changes only `handoff/`.
  - The last accepted snapshot is 8e557100d16b6b6eb86a48e00276835761aabfdf (digest
    507de97c).
  - Record HEAD, the digest before and after (three forms) and `reviewed_commit`.
  - Work on a clean `git archive` export or a scratch clone at TARGET_SHA.
- **AGENTS.md on disk wins.** Its UI section is "Frontend and UI/UX standards".
- Never touch `.claude/worktrees/` or its branch.

## Read

- `handoff/delivery/WP5_UX5_REVIEW_INT.md` (+ `.vi.md`): its integration of the rounds, its
  finding F-UX5I-1, its optional risks R-UX5I-1..4 and its optional backlog.
- `handoff/delivery/tasks/WP5-UX5-FIX18.md` and `WP5-UX5-REGATE13.md`, with their evidence.
- `handoff/delivery/WP5_UX5_RECHECK_A2.md` and `WP5_UX5_RECHECK_B3.md`.
- docs/04 and docs/12, EN and VI.

## Scope

1. **F-UX5I-1.** On desktop, at 1440 px (beside) and 1280 px (floating):
   - Does the open Day editor now follow the page's Check in and Check out?
   - Does it keep an unsaved note, and does "Save day fields" then save it?

   Use your own probe, and the AUDIT-INT probe
   (`handoff/delivery/evidence/WP5-UX5-AUDIT-INT/90-zz-int-clock-editor.spec.ts.txt`).
2. **The version check.** Is a change made elsewhere still refused? Check:
   - another tab;
   - another device or session;
   - an administrator's change.

   Can a save after the refresh overwrite a server value that the clock action changed?
   Try it.

   Also judge FIX18's design choices:
   - The editor takes the fresh day only when the day fields equal what it holds
     (`sameDayFields`).
   - It skips the read while a session dialog is open.
   - It also reads the day when the tab returns into view. The clock context uses one
     counter for both events, so FIX18's mutant M6 survives.

   Is it right that, after a tab return, sessions changed elsewhere are shown, and a save of
   unchanged day fields then succeeds? Or should that case still be refused? Say which
   documented rule decides it.
3. **Regressions of the client change.** Check:
   - the unsaved-changes guard (U4-05): Escape, outside press, close, and changing day or
     period;
   - the same-task Escape test;
   - the label and batch refresh path;
   - the phone bottom sheet;
   - shared views;
   - the cross-tab theme while the editor is open;
   - keyboard focus, and the screen-reader announcements of the editor after the refresh.

   Run a real axe scan of the Timesheet with the editor open, before and after a Check in.
4. **Carry-forward of AUDIT-INT.** AUDIT-INT's integration verdicts were made on a5cbc91.
   Confirm that the FIX18 diff leaves them valid:
   - every finding closed;
   - every owner item and gate failure mapped;
   - the load rule;
   - RECHECK-A2 and RECHECK-B3.

   Name the diff you checked.
5. **Test strength.** Write at least six mutants of your own on FIX18's change. Say whether
   the suite catches each, and for the right reason.
6. **Mandatory checks yourself:**
   - typecheck, lint, `npm test` (2,397), build (no advisory);
   - the real-clock FULL e2e on both projects;
   - AC-13 under one zone;
   - one seven-file sweep run at 2026-10-27T06:58:30Z through the FIX10 wrapper.

   A run that fails only with a network or buffer error is rerun once, and both runs are
   recorded. A timeout is classified from its trace, as in REGATE12's load rule.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-AUDIT-INT2`. Ports 51690-51729.
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
- Evidence in `handoff/delivery/evidence/WP5-UX5-AUDIT-INT2/`.
- **Decision:** PASS, FIX REQUIRED or NOT VERIFIED.
  - Number each new finding (F-UX5I2-n), with its severity, file:line, reproduction and
    expected result.
  - Give F-UX5I-1's disposition.
  - Carry AUDIT-INT's optional risks and backlog forward, updated, for the WP5 handoff.
- Return at most 250 words, beginning with your self-reported model.

## Results
