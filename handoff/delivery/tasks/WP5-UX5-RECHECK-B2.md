# WP5-UX5-RECHECK-B2 dispatch brief (fresh recheck of area B after FIX11 to FIX15)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-RECHECK-B2, package WP5, kind
  audit, attempt 1.
  - It depends on WP5-UX5-REGATE10 (PASS on be2afa2 / ff73565b).
  - It rechecks WP5-UX5-RECHECK-B (FIX REQUIRED on a5533b5): finding F-UX5B2-1 and risks
    R-UX5B2-1..4. Read `handoff/delivery/WP5_UX5_RECHECK_B.md`.
  - Run in a fresh context. It runs in parallel with WP5-UX5-RECHECK-A2, which uses other
    ports and folders.
- **Profile and routing.** timesheet-auditor, requested opus/xhigh, no override.
  - Routing: size M, risk H (the restore release blocker for held sends, and check-in
    dates at the day boundary), novelty no.
  - Write the task record in English.
  - The review pair is `handoff/delivery/WP5_UX5_RECHECK_B2.md` and `.vi.md`. Use the
    REVIEW template in `handoff/templates/`.
- **Author separation.** You wrote no WP5-UX4 or WP5-UX5 task; their agent IDs are on the
  board. Treat every planner, expert, worker, committer and verifier report as a claim.
- **Target.**
  - `reviewed_commit` = TARGET_SHA = be2afa2e3c43514581ed62fd145c15eeef13b534 (pushed).
    HEAD may be a later commit that changes only `handoff/`.
  - TARGET_DIGEST = ff73565b48f1101cd8038d08eb24270970e58b0ef1c02378be431cc7134c686f
    (882 files).
  - The base for this recheck is a5533b57daa81a340c0ad9dfe5f5feac4e6ce1f5, the commit that
    RECHECK-B reviewed. The last accepted snapshot is 8e557100d16b6b6eb86a48e00276835761aabfdf.
  - Record HEAD, the digest before and after (three forms) and `reviewed_commit`.
  - Work on a clean export or a scratch clone at TARGET_SHA.
- **AGENTS.md on disk wins.** Rules 4, 6, 7 and 8 matter here.
- Never touch `.claude/worktrees/` or its branch.

## Read

- The fix and diagnosis records since a5533b5, in `handoff/delivery/tasks/`, with their
  evidence:
  - `WP5-UX5-FIX11.md`: the restore release blocker by period, its tests, and the docs;
  - `WP5-UX5-REGATE7.md`, `WP5-UX5-DIAG5.md` and `WP5-UX5-FIX12.md`: the R3 case, where a
    leased later send blocks the release;
  - `WP5-UX5-REGATE9.md`, `WP5-UX5-DIAG9.md` and `WP5-UX5-FIX15.md`: the product probe of
    check-ins at midnight, and the boundary integration test in
    `tests/integration/timesheet-api.test.ts`;
  - the gates `WP5-UX5-REGATE8.md`, `WP5-UX5-REGATE9.md` and `WP5-UX5-REGATE10.md`.
- docs/02 (time rules; line 21 on overnight sessions), D-05, and docs/03, 05, 11 and 12, EN
  and VI.

## Scope

1. **F-UX5B2-1.** Reproduce RECHECK-B's sequence with real HTTP and the CLI:
   1. sign and send revision 1, so its job waits;
   2. `backup`, then an isolated `restore`, so the job is held;
   3. `outbound resume --confirm`;
   4. correct and send revision 2;
   5. `run-jobs`;
   6. `outbound release --job <id> --confirm`;
   7. `run-jobs`.

   Then check:
   - Is the release now refused (`superseded_by_later_send`), and is no older copy
     delivered after the correction?
   - Is the guard right for the other cases: a later send that is queued, leased,
     succeeded, failed or uncertain; other periods; other owners; `releaseAllHeldJobs`?
   - Do docs/05:72 and docs/11:178 (EN and VI) now describe exactly what the build does?
2. **R-UX5B2-4, the suite gaps G2 and P4.** Run RECHECK-B's mutants G2 (a leased older job
   no longer blocks) and P4 (the leave line left out of the block height) again. Are they
   now caught, and for the right reason? If either still survives, say whether that is a
   finding or an accepted risk.
3. **The R3 case** (`restore.test.ts`). Does it pin "a leased later send of the same period
   blocks the release"? Does the lease expiry later in the same test hide anything?
4. **Check-in dates at the day boundary** (FIX15's integration test, and DIAG9's product
   verdict).
   - Confirm, with your own probe, that a check-in is filed under the date of its own start
     in the saved reporting zone. Use a check-in one second before and one second after the
     reporting-zone midnight.
   - Confirm that an overnight session stays open on its starting date, can be checked out
     after the midnight, and shows correctly. Rule 7 applies: the UTC instant, the
     accounting date and the zone are three values.
   - Does the new test pin it, and does it fail for the UTC-date mutant and for a
     next-date mutant?
   - Check one DST-change night as well (2026-11-01 and 2027-03-14 in Los Angeles). Report
     any defect as a finding; do not plan a fix.
5. **Regressions** in area B since a5533b5:
   - restore and outbound hold and release;
   - sends and idempotency;
   - sign-off;
   - the deadline and reminders;
   - check-in and check-out;
   - privacy;
   - the docs changed by FIX11, EN and VI.

   Also confirm that `src/server` changed only in `restore.ts` since a5533b5.
6. **The recorded risks.** Say whether any has become a defect:
   - R-UX5B2-1, the retry minute when a send's PDF is not stored yet;
   - R-UX5B2-2, the Resend button seeing only the current revision;
   - R-UX5B2-3, option A blocking a correction up to about 81 minutes.
7. **Test strength.** Write at least eight mutants of your own on `restore.ts` since
   a5533b5, the restore tests and the boundary test. Say whether the suite catches each, and
   for the right reason.
8. **Mandatory checks yourself:**
   - typecheck, lint, `npm test` once (expect 2,389), build;
   - the integration files for restore, sends, jobs, timesheet API and submission, each
     once;
   - the real-clock FULL e2e on both projects;
   - AC-13 once.

   Another auditor runs at the same time. A failure whose trace shows a network or buffer
   error, or a test timeout, may be rerun once; record both runs.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-RECHECK-B2`. Ports 51310-51339.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every server or CLI run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash. Use PowerShell only as inline read-only `-NoProfile -Command` queries, and
  never with `-ExecutionPolicy` or `-File`.
- **This is a public repository.** Evidence may hold process names, IDs, counts and CPU
  times only. Never write the command line of a process the mission did not start.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY ONES),
  NO `node -e` (NOT EVEN `node -e 1` OR `node -p`), NO `python -c`, NO `node -` OR
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
  - Screenshots end in `-synthetic.png`, at most 12.
  - No email address except the full synthetic `@example.invalid` form.
  - **No password literal in any evidence file, probe scripts included.** Read it from an
    environment variable, or write `'<synthetic-password>'` in the stored copy.
  - Write `<user>` for profile paths.
- If a permission check denies a call, stop and report.

## Output

- The review pair.
- Results in this file.
- Evidence in `handoff/delivery/evidence/WP5-UX5-RECHECK-B2/`: masked LF `.txt` and
  `-synthetic.png`.
- **Decision:** PASS, FIX REQUIRED or NOT VERIFIED.
  - Number each new finding (F-UX5B3-n), with its severity, file:line, reproduction and
    expected result.
  - Give F-UX5B2-1's disposition, and the dispositions of G2 and P4.
  - List optional risks separately.
- Return at most 250 words, beginning with your self-reported model.

## Results

Auditor: timesheet-auditor, agent ae3c9c12ecb779996, fresh context, self-reported model claude-opus-5-5 (equal to the
strongest author model of the snapshot). I authored no WP5-UX4 or WP5-UX5 task. Review pair:
`handoff/delivery/WP5_UX5_RECHECK_B2.md` and `.vi.md`. Evidence: `handoff/delivery/evidence/WP5-UX5-RECHECK-B2/` (index
`00-README.txt`). Task folder `D:\.claude-tmp\timesheet\WP5-UX5-RECHECK-B2`; ports 51311-51318.

**Decision: FIX REQUIRED** (one new Low finding, F-UX5B3-1).

- **Target.** HEAD = local origin/main = `reviewed_commit` be2afa2e3c43514581ed62fd145c15eeef13b534 (no fetch); digest
  ff73565b48f1101cd8038d08eb24270970e58b0ef1c02378be431cc7134c686f, 882 files, equal before and after in three forms
  (`npm run digest`, `git ls-tree` of HEAD and of the SHA, three clean exports). `src/server` changed only in `restore.ts`
  since a5533b5.
- **Mandatory checks** (clean export, one run each, no rerun): typecheck 0, lint 0, build 0 (no advisory); `npm test` 0, 101
  files, 2,389 tests; 21 area-B integration files 0, 495 tests; AC-13 under Asia/Tokyo 0; real-clock FULL e2e 0, desktop 469
  passed / 35 skipped, mobile 407 / 97, 0 failed, 22.3 min.
- **F-UX5B2-1: fixed on its reproduced path, not closed in full.** RECHECK-B's sequence over real HTTP and the CLI (sign and
  send revision 1, backup, isolated restore, resume, correct and send revision 2, run-jobs, release --job --confirm,
  run-jobs): refused `superseded_by_later_send` (exit 1), revision 1 never delivered; queued, leased and succeeded later sends
  block; other owners and other periods are released; the bulk release keeps the superseded job held.
- **F-UX5B3-1 (Low, new).** `restore.ts:552-560` `blockerOf` counts a later send only in `queued`, `leased` or `succeeded`.
  When the correction's send ends in `intervention` (failed permanently, uncertain, uncertain and marked delivered, uncertain
  after a runner died in `sending`, or held by a second restore), or the owner's repeat of the same revision ends uncertain and
  is marked delivered, the held superseded send is released and delivered after it. Reproduced in process (6 cases) and over
  real HTTP and the CLI (sections B, C, D). docs/05:72 and docs/11:178, EN and VI, therefore overstate the build. Bounded fix:
  count any later send job of the period except a cancelled one, plus `restore.test.ts` cases.
- **G2 and P4: caught for the right reason** (`sends.test.ts:336`, `pdf-render.test.ts:881`). **R3** fails
  `restore.test.ts:620`, the leased step; the later lease expiry only hands the job to a second runner, so the case never meets
  a leased send that ends uncertain (F-UX5B3-1).
- **Check-ins at the day boundary: correct.** -1 s, 0 s and +1 s around the Los Angeles midnight file on 10-26, 10-27, 10-27;
  an overnight session stays open on its start date, is found by the page's lookup, shows its start in the device zone and
  checks out after the midnight on its start date; the same at a period boundary and on 2026-11-01 and 2027-03-14 (elapsed UTC
  durations 5 h and 4 h). FIX15's boundary test fails for the UTC-date and next-date mutants.
- **Mutants:** 12 own (K1-K7, T1-T5b): 10 killed by the suite; K2 (the "later" order) and T4 (the midnight second) survive the
  full suite and are caught by my probes (risks R-UX5B3-2 and R-UX5B3-1); T5b is refused by a schema trigger.
- **Risks:** R-UX5B2-1 and R-UX5B2-2 unchanged; R-UX5B2-3 now a documented known limit; R-UX5B2-4 closed; R-UX5B3-1 and
  R-UX5B3-2 optional tests.
- **Slips:** three probe defects, kept and labelled (midnight run 1, restore run 2 twice); the e2e exit log's "local-LA" label
  printed GMT (Git Bash `date` ignores TZ); one leftover check counted its own shell and was rerun with that excluded. No
  heredoc, no stdin to node or python, no pipe into head, tail or cat, no /dev/null, no rm -r, no sed -i, no PID kill, no git
  configuration change, nothing staged or committed. Nothing is left running (`99-leftover-check.txt`).

Status: done
