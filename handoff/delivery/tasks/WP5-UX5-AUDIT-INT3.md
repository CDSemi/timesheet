# WP5-UX5-AUDIT-INT3 dispatch brief (integration recheck after FIX19)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-AUDIT-INT3, package WP5, kind
  audit, attempt 1.
  - It depends on WP5-UX5-REGATE14 (PASS required).
  - It rechecks WP5-UX5-AUDIT-INT2 (FIX REQUIRED on d96df5d / 6937d79c, with findings
    F-UX5I2-1 and F-UX5I2-2).
  - Its PASS re-accepts WP5 after UI change rounds 4 and 5. It supersedes RECHECK-A2 (PASS
    on ff73565b) and RECHECK-B3 (PASS on 69c6daff) as the current acceptance.
  - Run in a fresh context.
- **Profile and routing.** timesheet-auditor, requested opus/xhigh, no override.
  - Routing: size M, risk H, novelty no.
  - Write the task record in English.
  - The review pair is `handoff/delivery/WP5_UX5_REVIEW_INT3.md` and `.vi.md`. Use the
    REVIEW template in `handoff/templates/`.
- **Author separation.** You wrote no WP5-UX4 or WP5-UX5 task, and none of their audits; the
  agent IDs are on the board. Treat every report and earlier verdict as a claim.
- **Target.**
  - `reviewed_commit` = TARGET_SHA = the `freeze_commit` of WP5-UX5-REGATE14 on the board.
    It is the WP5-UX5-FIX19-FREEZE commit, pushed.
  - TARGET_DIGEST = REGATE14's `source_digest` on the board.
  - HEAD may be a later commit that changes only `handoff/`.
  - The last accepted snapshot is 8e557100d16b6b6eb86a48e00276835761aabfdf (digest
    507de97c).
  - Record HEAD, the digest before and after (three forms, including `npm run digest`, which
    FIX19 repaired) and `reviewed_commit`.
  - Work on a clean `git archive` export or a scratch clone at TARGET_SHA.
- **AGENTS.md on disk wins.** Its UI section is "Frontend and UI/UX standards".
- Never touch `.claude/worktrees/` or its branch.

## Read

- `handoff/delivery/WP5_UX5_REVIEW_INT.md` and `handoff/delivery/WP5_UX5_REVIEW_INT2.md`
  (+ `.vi.md`): the integration of the rounds, the findings, the optional risks and the
  backlog.
- `handoff/delivery/tasks/WP5-UX5-FIX19.md` and `WP5-UX5-REGATE14.md`, with their evidence.
- `handoff/delivery/WP5_UX5_RECHECK_A2.md` and `WP5_UX5_RECHECK_B3.md`.
- docs/03, docs/04 and docs/12, EN and VI.

## Scope

1. **F-UX5I2-1.** Using AUDIT-INT2's probes G1 and G2 (in
   `handoff/delivery/evidence/WP5-UX5-AUDIT-INT2/90-zz-int2-follow.spec.ts.txt`) and your
   own, check what happens when a session save, a "Confirm breaks" or a delete in the open
   editor follows a change of the day fields made elsewhere. The later "Save day fields"
   must never overwrite that change silently. Check both branches:
   - no unsaved edit: the form shows the server's fields;
   - an unsaved edit: the save is refused, and "Reload day" reads the change.

   Check the stale notice and the focus.
2. **F-UX5I2-2.** `npm run digest` works in a clean clone and in the repository, and matches
   the export and `git ls-tree` forms.
3. **FIX18 and FIX19 together.** Check the follow on the page's Check in and Check out, and
   on a tab return. Check the field guard, the session-dialog guard, the delete
   confirmation, the overtaken read and the phone sheet. Check that a change made elsewhere
   is refused in every path. Try to make the two paths disagree.
4. **Regressions of the change.** Check:
   - the unsaved-changes guard (U4-05);
   - the same-task Escape test;
   - the label and batch refresh;
   - sessions and breaks;
   - shared views;
   - keyboard focus and announcements.

   Run a real axe scan of the Timesheet with the editor open, before and after a session
   save, with the stale notice shown.
5. **Carry-forward of AUDIT-INT and AUDIT-INT2.** Confirm that the FIX19 diff leaves their
   integration verdicts valid:
   - every finding closed;
   - every owner item and gate failure mapped;
   - the load rule;
   - RECHECK-A2 and RECHECK-B3;
   - the tab-return judgement.

   Name the diff you checked.
6. **Test strength.** Write at least six mutants of your own on FIX19's change. Say whether
   the suite catches each, and for the right reason.
7. **Mandatory checks yourself:**
   - typecheck, lint, `npm test` (2,397), build (no advisory);
   - the real-clock FULL e2e on both projects;
   - AC-13 under one zone;
   - one seven-file sweep run at 2026-10-27T06:58:30Z through the FIX10 wrapper.

   A run that fails only with a network or buffer error is rerun once, and both runs are
   recorded. A timeout is classified from its trace, as in REGATE12's load rule.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-AUDIT-INT3`. Ports 51810-51849.
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
- Evidence in `handoff/delivery/evidence/WP5-UX5-AUDIT-INT3/`.
- **Decision:** PASS, FIX REQUIRED or NOT VERIFIED.
  - Number each new finding (F-UX5I3-n), with its severity, file:line, reproduction and
    expected result.
  - Give the dispositions of F-UX5I2-1 and F-UX5I2-2.
  - Carry the optional risks and the backlog of AUDIT-INT and AUDIT-INT2 forward, updated,
    for the WP5 handoff.
- Return at most 250 words, beginning with your self-reported model.

## Results
