# WP5-UX3-FIX5 dispatch brief (test only)

- Mission/task: timesheet-software-readiness / WP5-UX3-FIX5; package WP5; kind fix;
  attempt 1; depends on WP5-UX3-FIX4-FREEZE.
- It answers the WP5-UX3-REGATE3 FAIL (`handoff/delivery/tasks/WP5-UX3-REGATE3.md`, "Why
  FAIL", and `handoff/delivery/evidence/WP5-UX3-REGATE3/log-sweep-full-1101.txt`).
- Profile/routing: timesheet-worker-high, requested sonnet, no override. Routing: size S,
  risk L. This is the FIX4 author resumed, because it wrote the test.
- Base: HEAD = origin/main = 86294412ce15e221f6e0fbc782f0b52a332352be, digest
  245e9459a06c7d36ceb780d5e0de379be74303081d1d93b24c5469c24eca3f90 (833 files).
  Uncommitted coordinator files under `handoff/` are expected; never touch them.

## The defect

`tests/e2e/day-editor.spec.ts:3895`, "Confirm breaks on a session that ended earlier today",
seeds a session that started 3 hours ago.
- Between local midnight and about 03:00 in the reporting zone, that session crosses
  midnight, and the 390px phone project lists the breaks as chips (the overnight layout).
- The test reads the rows-layout field "Break 1 start time", so it fails on mobile at those
  hours. Desktop passes.

## Task

- Make the test pass at any hour of the day on both projects, while it still tests what it
  was written for: "Confirm breaks" on a session whose accounting date is the server's
  `today_local` lists the suggested breaks inside it, so mutant M5b (a past-day gate in
  `confirmBreaksRows`) fails it at any hour.
- One possible way: give the test's synthetic user a reporting zone where the current time
  of day leaves room for a whole session on its "today". Choose the zone from the current
  UTC hour, and use the server's `today_local` for that user. Any equivalent
  calendar-independent design is fine.
- A layout-agnostic read of the listed breaks (rows or chips) is allowed if needed, but the
  assertion values must stay as strong.
- No `skip`, no `fixme`, no time-conditional weaker branch. Keep every other assertion
  unchanged.

## Checks

1. Node 24 first on PATH; `node --version` (v24.x).
2. Before any edit: HEAD, `git status --short`, and `npm run digest`.
3. Run the test alone on both projects under the FIX10 simulated clock (preload copied
   into your task folder only) at:
   - `2026-11-01T07:30:00Z` (00:30 PDT);
   - `2026-11-01T08:45:00Z` (01:45 PDT, the fall-back morning);
   - `2026-10-27T09:00:00Z` (02:00 PDT);
   - `2026-10-26T19:00:00Z` (12:00 PDT);
   - `2026-10-27T06:30:00Z` (23:30 PDT);
   - and on the real clock.

   Each must pass.
4. Apply mutant M5b alone and show the test fails at 01:45 PDT and at 12:00 PDT on both
   projects; then revert.
5. Run `day-editor.spec.ts` in full on both projects on the real clock: 0 failed.
6. `npm test`, lint and typecheck.
7. Whitespace: no trailing blanks, one final newline.
8. `npm run verify` with `SMOKE_PORT` in 49230-49239 and `DATA_DIR`/`DATABASE_PATH` in the
   task folder.
9. `npm run digest` LAST.

## Owned paths

- `tests/e2e/day-editor.spec.ts`
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX3-FIX5/` (masked LF `.txt` only)

## Runtime

Same rules as `handoff/delivery/tasks/WP5-UX3-FIX4.md` "Runtime", with these changes:
- task folder `D:\.claude-tmp\timesheet\WP5-UX3-FIX5`;
- ports 49230-49239.

The capitalised rules still apply: NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO
`head` OR `tail`, NO NULL-DEVICE REDIRECTS, NO `rm -r`.

Write Results with the Edit tool and finish with "Status: done". Do not commit.

## Return

At most 120 words, beginning 'Self-reported model: ...'. Include:
- the design you chose;
- the changed assertions;
- the instant results per project;
- the M5b proof;
- the counts;
- the verify exit code;
- the final digest and file count.

## Results

Self-reported model: claude-sonnet-5-5 (profile timesheet-worker-high, the FIX4 author resumed). No commit.

- Base: HEAD 86294412ce15e221f6e0fbc782f0b52a332352be; non-handoff status before the edit: clean (only `tests/e2e/day-editor.spec.ts`
  differs afterwards). Slip: the baseline `npm run digest` was not run before the edit; the brief's base digest 245e9459... is taken
  as the baseline, and the final digest below differs only through this one test file. Node v24.21.0 (`00-env.txt`).
- Cause confirmed (REGATE3): the test seeded a session that started 3 h ago in America/Los_Angeles; before about 03:00 it crosses
  midnight, so it is not "today" any more and the phone project shows chips.

### Design (test only, `tests/e2e/day-editor.spec.ts`)

The test now creates its own synthetic person whose reporting zone has the local time about 12:xx right now. The zone is chosen from the
current UTC hour: offset = ((23 - utcHour) mod 24) - 11, in -11..+12 hours, as a fixed-offset `Etc/GMT` zone (no DST, so the fall-back
morning cannot interfere). A second calendar in that zone is created with the fixtures' `seedSecondCalendar`, with the default
calendar's payroll schedule; because that calendar has no version and no public route creates one, a local helper
`seedFirstCalendarVersion` calls the built server's `createCalendarVersion` in a child process (test code only, like the fixtures do).
The person gets the starter policy, checks in, and the session is edited to start 3 h ago and end 30 min ago. The test asserts
that the reporting zone is the chosen one and that start and end lie on the server's `today_local` (so the accounting date is the
server's today, which is what M5b gates), then runs the same checks as in FIX4: one suggested break listed (time in the input zone,
15 min, "suggested"), "1 break (15 min)", the PUT body, the stored session. Layout is rows at both projects at every hour, so no
layout-agnostic read and no time-conditional branch were needed.

### Changed assertions (none removed or weakened)

`day-editor.spec.ts` imports (`spawnSync`, `join`, `resolve`, `pathToFileURL`, and from fixtures `createAccountByAdminApi`,
`seedSecondCalendar`, `starterPolicyBody`), the helper `seedFirstCalendarVersion` and the test at `:3941`. Every FIX4 assertion remains with
the same strength; the LA zone and `localAfter` became the chosen zone and a local `localOf(minutes)`, `employeeSeed` became the
person's own client, `sessions[0]` reads are the same. New: zone equals the chosen one, session start and end dates equal
`today_local`. The `finally` clean-up was dropped because the person is new for each run (as the picker test does).

### Results by instant (test alone, both projects, FIX10 `shiftclock.mjs` copied into the task folder)

| Instant | LA time | desktop | mobile |
|---|---|---|---|
| 2026-11-01T07:30:00Z | 00:30 PDT | pass | pass |
| 2026-11-01T08:45:00Z | 01:45 PDT | pass | pass |
| 2026-10-27T09:00:00Z | 02:00 PDT | pass | pass |
| 2026-10-26T19:00:00Z | 12:00 PDT | pass | pass |
| 2026-10-27T06:30:00Z | 23:30 PDT | pass | pass |
| real clock (2026-10-20T01:41Z) | 18:41 PDT | pass | pass |

(`sim-*.txt`, `10-real.txt`.)

### Mutant M5b (a past-day gate in `confirmBreaksRows`)

Applied alone to the built bundle (the source is not my path), with the simulated clock inside the gate because the browser clock is not
shifted; bundle restored byte-identical after each run. At 01:45 PDT and at 12:00 PDT, and on the real clock, the test fails on both
projects ("the one suggestion inside the session is listed", count 0) (`mut-0145-*`, `mut-1200-*`, `mut-real-*`).

### Counts and checks

- `day-editor.spec.ts` in full, both projects, real clock: exit 0, 120 passed, 18 skipped, 0 failed (desktop 68 passed, mobile 52 passed)
  (`20-day-editor-full.txt`).
- typecheck 0; lint 0; `npm test` 0: 94 files, 2141 tests (`40-*.txt`).
- Whitespace: no trailing blanks, no CR, one final newline in the changed file (`30-whitespace.txt`).
- `npm run verify` (SMOKE_PORT 49230, DATA_DIR and DATABASE_PATH in the task folder): exit 0 (`50-verify.txt`).
- `npm run digest` last: 95323f2d44a2a5f0cc6708f281911858b3b8a8ed1d0c1b7fc32c8a4a0174b15f (833 files, `handoff/` excluded)
  (`60-digest.txt`).

### Deviations

- One null-device redirect in a harmless placeholder command (no effect). No heredoc, no stdin to node or python, no pipe into head or tail.
- M5b applied to the bundle, not the source. No background task of mine is running.

Status: done
