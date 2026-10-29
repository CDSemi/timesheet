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

Auditor: timesheet-auditor, self-reported model claude-opus-5-5 (the strongest author model of the snapshot is the same), agent
a7f3e75ac74c56f38, fresh context, attempt 1. Review pair: `handoff/delivery/WP5_UX5_RECHECK_B3.md` and `.vi.md`. Evidence:
`handoff/delivery/evidence/WP5-UX5-RECHECK-B3/` (masked LF text; index `00-README.txt`).

- **Decision: PASS.** No new finding (no F-UX5B4-n).
- **Target.** `reviewed_commit` a5cbc91e6965633a0f9d1dd7e912577321cc71e3 = HEAD = local `origin/main` (no fetch); digest
  69c6daff305dca839a7128e7b7509f3063c165fe5653d1c73159ea41c003e6bf, 882 files, equal in every form: `npm run digest` and `git
  ls-tree` of HEAD and of the SHA before; the same plus three clean exports after. Delta be2afa2..a5cbc91 outside `handoff/`: `restore.ts` (one
  predicate and its comment), `restore.test.ts`, `timesheet-api.test.ts`, docs/05 EN and VI, and FIX17's two e2e files.
- **F-UX5B3-1: closed.** RECHECK-B2's in-process probe, unmodified, 12 of 12 pass (F1, U1, U2, U4, R1 and D1 now refused
  `superseded_by_later_send`, revision 1 never sent); its HTTP and CLI probe, unmodified, sections A to D 13 PASS, 0 failures. Every
  `intervention` form is refused by id and in bulk; the same-revision repeat is refused, and `superseded_by_later_send` is the right
  code (a later send of the period, the code the suite already pins for a queued or succeeded repeat; `delivery_attempt_open` wins
  while the repeat's attempt is undecided). Own probe X1 to X6 (run 1 X1-X5 5/5; run 2 X1-X6 6/6): retry-ladder exhaustion and a
  failed resend refused; no over-blocking by an earlier failed or decided job of the period; another period unaffected; the
  release audit event holds the job id, kind, attempts and states only; X6 see R-UX5B4-5.
- **The cancelled exception.** Each claim holds in the code: the only writer of `cancelled` is `dropHeldReminder`, which refuses
  every kind but `send_reminder`, and has since 72ab2ed1, the only commit that ever added a cancel writer; docs/12:114 and docs/11:185
  say a send job cannot be cancelled or dropped; the `jobs_closed` trigger freezes a cancelled job. The exception is right and
  unreachable for send jobs. docs/05:72 (EN and VI) states the build exactly; docs/11:178 needs no change and is still true, but
  its reasons do not name one conservative edge (R-UX5B4-5).
- **E1 and the midnight second are real pins.** My precise order mutant N5 (`j.rowid <> ?`) fails E1 at `restore.test.ts:938`
  (blocker `superseded_by_later_send` instead of `null`); FIX16's K2 also fails it but blocks every held send itself. FIX16's T4
  fails only `timesheet-api.test.ts:148`, the new assertion. RECHECK-B2's midnight and DST probe passes 11 of 11 on the target.
- **Regressions:** none in restore, hold, resume, release, `releaseAllHeldJobs`, other periods or owners, or audit events. The
  drill's restore stage carries forward from REGATE11 (209 PASS; `src/` and `scripts/` unchanged since 1fe5ad3, `dist/` identical
  per REGATE12).
- **Mutants:** 11 own (N1 to N10, T6; N5, N10 and T6 also run against the probes) plus FIX16's K2, T4, M1, C1: 9 of my 11
  killed by the suite at the assertion that names the rule (N6 incidentally, by the cancelled case); N10 and T6 survive all 2,397
  tests and are caught by the probes. All restored byte-identical.
- **Mandatory checks** (clean export, Node 24.21.0): typecheck, lint, build 0; `npm test` 101 files / 2,397 tests; 21 area-B
  integration files 503 tests; AC-13 under Asia/Tokyo 1/1; real-clock FULL e2e (07:28Z to 07:49Z) exit 0, desktop 469 ok /
  35 skipped / 0 failed, mobile 407 / 97 / 0, 20.3 min. No rerun was needed. No deprecation line anywhere.
- **Dispositions:** F-UX5B3-1 closed; R-UX5B3-1 closed (the 07:00:00Z check-in is pinned); R-UX5B3-2 closed (E1 pins the order).
- **Optional risks (no fix needed):** R-UX5B4-1 retry-ladder exhaustion not named by the suite (N10); R-UX5B4-2 the second
  before the midnight not pinned (T6; the test comment claims it); R-UX5B4-3 the cancelled exception rests on "no path cancels a
  send job" and the code comment's "it never ran" is imprecise; R-UX5B4-4 stale comment at `restore.test.ts:616`; R-UX5B4-5
  docs/11:178 does not explain the refusal when the only later send is the owner's same-revision repeat that delivered nothing
  (conservative: the copy stays held, the owner can send again; probe X6). R-UX5B2-1 and R-UX5B2-2 unchanged; R-UX5B2-3
  documented.
- **Process notes.** No rule slip that I know of: no heredoc, no stdin to node or python, no pipe into head, tail or cat, no
  /dev/null, no sleep, no PID kill, no git configuration change, nothing staged or committed. Honest record: (a) my first docs
  parity run named a missing file (`02_REQUIREMENTS`) and exited 1; it was rerun with the right names and the file overwritten;
  (b) while the mutants and the e2e ran I checked progress with many read-only `grep -c` counts of my own logs; (c) a trial evidence
  collect ran before the e2e and the final collect overwrote it; (d) X6 was added to my probe after run 1 (R-UX5B4-5), so run 2
  repeats X1 to X5 unchanged and adds X6; the N5p and N10p mutant runs used the run-1 source; T6p ran in a second, separate
  invocation of the mutant script; (e) the e2e log's only warnings are Node's `NO_COLOR`/`FORCE_COLOR` notice from my own
  environment. Host load: about 5 busy cores at the start, 3 to 4 during the e2e, 2 at the end. Nothing of this task is left
  running (no process, no listening socket in 51420-51449).
- **Next action:** WP5-UX5-AUDIT-INT on a5cbc91 / 69c6daff.

Status: done
