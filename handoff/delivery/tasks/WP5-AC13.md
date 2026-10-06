# WP5-AC13 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-AC13; package WP5; kind implement
  (tests only); attempt 1; depends on WP5-FIXB-FREEZE.
- Scope: turn the AC-13 integrated two-week scenario into a committed, repeatable
  automated test. WP5-ASSESS-A ran this scenario as an auditor's probe and it passed.
  WP5-GATE, and every later upgrade, can then rerun AC-13 without that probe. This
  task changes tests only.
- Profile/routing: timesheet-worker-high, requested sonnet, no override. Routing:
  size M, risk H (time, ledger, sign-off and recovery rules in one scenario), novelty
  no. The task record is in English.
- Base: HEAD = origin/main = 85838b515a86b3cca40cfbba189ba290ec06de58. The source
  digest is ed604d0c33b144e7fb214d05d4060494542fb21a9e69cd5b61c40097685f692a. Record
  HEAD and the digest before you start.

## Read

- AGENTS.md from disk first.
- docs/02, docs/05 and docs/06 (AC-13; also AC-03, AC-04, AC-07, AC-08, AC-14 and
  AC-16 as they apply).
- [WP5-PLAN](WP5-PLAN.md), section B, item list for WP5-ASSESS-A.
- [WP5_REVIEW_A](../WP5_REVIEW_A.md), and the probe sources in
  `handoff/delivery/evidence/WP5-ASSESS-A/`: `ac13.mjs.txt`, `lib.mjs.txt` and
  `faults.mjs.txt`. Use them as a scenario specification, not as code to copy blindly.
- The existing integration and e2e test helpers and fixtures. Reuse the established
  patterns for app setup, temporary data folders, clocks, capture mail and job runs.

## Required work

1. Add one integrated test file. Prefer `tests/integration/ac13-two-week.test.ts`
   (vitest, in-process, the existing helpers). If the scenario truly needs the browser,
   add `tests/e2e/ac13-two-week.spec.ts` instead, and explain why.
2. Cover, in one scenario over fixed synthetic dates:
   - two synthetic users (`example.invalid`), saved settings, a payroll calendar and a
     policy (B=480, N=30, M=30);
   - 14 dates with:
     - clock and manual entries;
     - confirmed and unknown breaks, and a flexible start;
     - weekday excess at 30, 31, 45 and 46 minutes;
     - work on both Sundays, and an overnight from Friday into Saturday;
     - a holiday, 4 h of work plus 4 h of leave, and a deficit day;
   - review and sign-off. Assert:
     - the credited OT total in h:mm;
     - that the ledger posts exactly once;
     - the revision;
     - the captured PDF's presence and recipients;
   - a historical correction. Assert:
     - a reason is required;
     - a new revision is created, and only the difference posts;
     - the original is kept;
     - an edit sends nothing;
   - approved partial OT use, with a concurrent double spend refused;
   - second-user isolation: swapped IDs are refused;
   - the overdue path, with a deadline run at a recorded instant: an overdue warning
     with auto-submit off, and no send;
   - one restart around the send, with no blind resend.
3. The test must be deterministic and independent of the season. It must not depend on
   the wall clock, the machine time zone or network ports outside its own fixture, and
   it must have no sleeps. Use neutral synthetic paths built at run time; never
   user-profile path literals or password-like literals.
4. Do not change application source. If the scenario exposes a product defect, do not
   work around it in the test and do not fix it. Stop, record a minimal reproduction in
   the results, and report it.
5. Mutation check: temporarily break one asserted rule in a scratch copy of the code,
   never in the repository. For example, post the ledger twice, or skip the N
   threshold. Show that the test fails. Record the command and the result.

## Checks

- Run the new test alone three times. All three must pass; record the durations.
- `npm run lint` and `npm run verify`, with `SMOKE_PORT` in 47790–47799 and `DATA_DIR`
  and `DATABASE_PATH` set inside the task folder. Record the new test count.
- `npm run test:e2e` only if you added an e2e spec.
- The precommit check, then `npm run digest` last. Rerun the digest if anything
  changes afterwards.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER feed anything to python or node through stdin.** Never pipe into head or
  tail.
- Call Node 24.21.0 by its full path; make the first shell call a trivial
  `node --version`.
- Use the task folder `D:\.claude-tmp\timesheet\WP5-AC13` for TEMP/TMP, the mutation
  scratch copy and raw output. Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Stop only processes you spawned, through their own handle. Never kill processes by
  PID. Never redirect to /dev/null or nul. Never remove anything recursively. Never
  write into the repository root.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Owned paths:
  - `tests/integration/ac13-two-week.test.ts`, or `tests/e2e/ac13-two-week.spec.ts`;
  - at most one new helper file, `tests/integration/ac13-support.ts`;
  - this brief's Results section;
  - `handoff/delivery/evidence/WP5-AC13/`, with masked LF `.txt` only.

  Do not edit existing helpers. Do not commit.

Return at most 150 words, beginning with your self-reported model: the test file, the
scenario coverage, the three run results, the mutation result, verify and lint exit
codes with the test count, and the final digest.

## Results

Self-reported model: claude-sonnet-5-5 (timesheet-worker-high). Attempt 1. No application source
changed; no existing helper edited; nothing committed; no product defect found.

Base recorded before the work: HEAD = origin/main = 85838b515a86b3cca40cfbba189ba290ec06de58;
source digest at dispatch ed604d0c33b144e7fb214d05d4060494542fb21a9e69cd5b61c40097685f692a.

### Files

- `tests/integration/ac13-two-week.test.ts`: one vitest test, in process (`app.request`, the production job
  runner, capture mail). It stays integration, not e2e: the scenario needs no browser.
- `tests/integration/ac13-support.ts`: the one allowed helper (h:mm formatter, capture reader, crash runner).
- Evidence (masked LF .txt): `handoff/delivery/evidence/WP5-AC13/`.

### Scenario coverage (one `it`, fixed dates, injected clock 2026-10-06T21:30:00Z)

- Setup through the production services and routes: payroll calendar (anchor 2026-10-09, 14-day cycle, due
  17:00 America/Los_Angeles, holiday 2026-09-30), two `example.invalid` users with run-time random credentials,
  policy B=480 N=30 M=30 (Alice choose-at-sign-off, Bob ignore), saved submission settings (To/Cc, auto-submit
  off), a synthetic signature and a 90-minute opening balance.
- 14 dates 2026-09-23 .. 2026-10-06: manual and clock sessions; confirmed breaks and unknown breaks
  (2026-10-06, incomplete not zero); flexible start 09:00; weekday excess 30/31/45/46 -> credits 0/30/30/60;
  Sundays 09-27 (120) and 10-04 (16 -> 30); overnight Friday 22:00-02:00 (R=600 stays on Friday, credit 240);
  holiday (non-working); 4 h work + 4 h leave (no deficit); deficit day 10-05 (60).
- Review and sign-off: credited total 510 = `8:30` (review, captured PDF text), refusals write nothing, two
  simultaneous sign-offs give one revision (revision 1, `signed_at` = the injected instant), identical retry
  replays, ledger posts once (six credits + one -60 debit, opening 90, posted 540, 8 rows, unchanged by every
  later step), PDF and send jobs queued.
- Restart around the send: a separate runner process commits `sending` and exits (code 86) before the mail is
  handed over; the restarted production runner marks the attempt uncertain (`lease_expired_while_sending`) and
  sends nothing, then or later; an explicit resend is refused (409) until the owner's decision; the decision
  creates exactly one new attempt which is accepted. Exactly one capture exists: the frozen To/Cc, the sender, no
  Bcc, the PDF equal to the stored attachment (SHA-256) and showing `8:30` and the signer name.
- Historical correction: an edit of a finalized period needs a reason (422 without), an edit sends nothing (no
  job, attempt or capture), the correction revision needs a reason (422 for blank), then revision 2 supersedes
  revision 1, only +30 posts (one entry correcting the 10-04 credit, posted 570), the original payload row,
  PDF attempt and sign-off are kept (two sign-offs), and `send_email: false` sends nothing; revision 2's PDF
  shows `9:00`.
- Approved partial OT use: reserve 240 with recorded permission (replay of the same key is a no-op), use 180
  (replay of the same use key spends once), cancel releases 60; a second 100 reservation is raced by two
  separate database connections (worker threads, 2 x 80): exactly one `used`, the other `409 exceeds_reserved`;
  posted 310, reserved 20, available 290; negative ledger deltas are exactly -180, -80 and -60.
- Second-user isolation: Bob gets 403/404 on 11 swapped identifiers of Alice (session read/update/delete, PDF,
  resend, delivery decision, signature, leave cancel/consume, shared routes without a share); every table row
  count and the capture folder are unchanged; Bob sees no delivery, revision, ledger entry or finalization of
  Alice.
- Overdue path: activation 2026-10-07T00:00:00Z, deadline run at the recorded instant 2026-10-09T00:05:00Z
  (period due 2026-10-09T00:00:00Z, asserted against the production zone functions): one overdue record for Bob
  (auto-submit off), none for Alice (finalized), no automatic revision, no PDF/send job or attempt for Bob, and
  exactly one new capture: Bob's own overdue warning (no PDF); a later pass adds nothing.
- Independence: no wall clock, no sleeps, no ports, run-time temporary folders, no user-profile paths. The
  test also passes with `TZ=Asia/Tokyo` and `TZ=America/New_York`.

### Commands and results

Environment: Git Bash, Node v24.21.0 by full path first on PATH; TEMP/TMP/TMPDIR, `DATA_DIR`,
`DATABASE_PATH` inside the task folder; `SMOKE_PORT=47791`. `<R>` is
`node node_modules/vitest/vitest.mjs run tests/integration/ac13-two-week.test.ts`.

| Check | Command | Result |
| --- | --- | --- |
| Run 1 | `<R> --reporter=verbose` | exit 0, 1 test passed, test 1705 ms, total 3.61 s (run1.txt) |
| Run 2 | same | exit 0, 1 test passed, test 1739 ms, total 3.70 s (run2.txt) |
| Run 3 | same | exit 0, 1 test passed, test 1754 ms, total 3.69 s (run3.txt) |
| Other zones | `TZ=Asia/Tokyo <R>`; `TZ=America/New_York <R>` | both exit 0 |
| Mutation 1 | scratch copy (`git archive HEAD` export + the two test files, `node_modules` junction): `src/domain/overtime.ts:48` `normalExcessMinutes > rule.thresholdMinutes` changed to `> 0`; `<R>` | exit 1: `AssertionError: credit 2026-09-24: expected 30 to be +0` (mutation1.txt); mutation reverted |
| Mutation 2 | scratch copy: `src/server/services/finalization.ts` `postCredits` posts every credit a second time under a `:dup` source key; `<R>` | exit 1: `AssertionError: expected [ [ '2026-09-25', 30 ], …(11) ] to deeply equal [ [ '2026-09-25', 30 ], …(5) ]` (mutation2.txt); file restored and diffed equal to HEAD. A first insertion at the wrong line failed for a different reason (reference error) and is not counted. |
| Lint | `npm run lint` | exit 0 (lint.txt) |
| Verify | `npm run verify` (typecheck, lint, test, build, smoke) | exit 0: 77 test files, 1759 tests passed (the new file adds 1 file and 1 test), smoke passed on port 47791 (verify.txt) |
| Precommit | `npm run precommit-check` with nothing staged: PASS, 0 files. Re-run on the two new files through a temporary index (`GIT_INDEX_FILE` in the task folder; the real index untouched) | exit 0: PASS, 2 staged files, 0 blocking, 0 warnings |
| Digest (last) | `npm run digest` | `1e59ad31d9af2a3f4a3aa5711647ea8742e1534b3d4f8ba4f2210beee44a3d2c  (777 files, handoff/ excluded)` (digest.txt) |

`npm run test:e2e` was not run: no e2e spec was added.

### Notes for the reviewer

- The restart is a real runner process (a file run by path, written next to the test database at run time, exit
  inside the `beforeSend` test hook of the production send handler), not a mocked state.
- The in-process "simultaneous sign-offs" call is one event loop over one connection, so it checks idempotence
  only; true multi-connection contention is covered by the worker-thread race for the OT double spend and by the
  existing `finalization-concurrency` and `ot-leave-concurrency` tests.
- The digest covers the two new untracked test files; the base tree digest was `ed604d0c...` (dispatch).
- Temporary output stayed in the task folder `D:\.claude-tmp\timesheet\WP5-AC13`; nothing was removed.
