WP5-UX-FIX10 evidence index (masked LF text; <task> = the task folder, <user> = the profile name, <repo> = the repository)

Base: HEAD = dc70ba65eb6c93925b3abe821829b76fc7e1f9da, digest 58b0deee5d0169f0211740de34953517500576baa2fd914d5a26059d5ba1dffd (795 files, recorded before the first edit: 01-digest-before.txt).
After: digest 57e2974c35cc104f3c2cb5d930c24d9bb15b89661be395d16a827e64ee4b761d (795 files), the last command (90-digest-after.txt). Only tests/ changed (git-diffstat.txt, git-status-code.txt).
Node v24.21.0 (00-node-head.txt), Git Bash, Playwright 1.63.0 on installed Microsoft Edge, Vitest 5.0.2. Times are UTC unless stated; America/Los_Angeles is UTC-7 until 2026-11-01, then UTC-8.

Simulated clock (test tool, not product; copied unchanged from the WP5-UX-AUDIT-AB8 evidence and kept in <task>, not in the repository):
  shiftclock.mjs.txt  probe-now.mjs.txt  run-shift.sh.txt (wrapper without the step reporter)  env.sh.txt  sweep.sh.txt  sweep-extra.sh.txt  repro-rest.sh.txt

Reproductions on the base (before any edit), 4 findings:
  repro-ab01.txt   automation.spec.ts + pdf-visual.spec.ts at 2026-10-27 18:00 PDT (P-3 after the due time): 3 failed (automation:118 on both projects "the displayed period is not due yet"; pdf-visual:187 desktop, revision null)
  repro-ab02.txt   shell + timesheet, one worker, 2026-11-28 10:00 PST: timesheet:403 fails on both projects, "past free workdays in the displayed period: expected >= 1, received 0"
  repro-ab03.txt   admin-status + admin, one worker, 2026-12-26 10:00 PST: admin:281 fails on both projects, [data-preview-can-commit="true"] not found
  repro-ab04.txt   admin.spec.ts at 2027-01-11 10:00 PST: admin:281 fails on both projects, "Year of the dates" expected 2028, received 2027
After the fix (targeted):
  fix-ab01.txt     a first approach that was discarded (run the scenario on the period in progress): 2 failed at the History "Signed" fact, because the page's history window ends at the displayed period
  fix-ab01b.txt    the final fix, same instant as repro-ab01: 6 passed, 2 skipped, exit 0
  fix-ab02.txt     25 passed, 7 skipped, exit 0      fix-ab03.txt  16 passed, exit 0      fix-ab04.txt  10 passed, exit 0

Checks: typecheck.txt (exit 0), lint.txt (exit 0), unit.txt (npm test: 83 files, 1831 tests, exit 0), unit-seed.txt (the seed-selection unit file: 8 tests),
        preflight.txt (validate_package.py --preflight with the workflow Python at C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe: PASS, exit 0),
        verify.txt (npm run verify with SMOKE_PORT 48521, DATA_DIR and DATABASE_PATH in <task>: exit 0; test count 1831, SMOKE PASSED).

Full e2e, both projects (236 tests each run, 2 workers unless "w1"), sequential, each with its own output folder:
  instant (simulated, America/Los_Angeles)             log                                   desktop pass/fail/skip   mobile pass/fail/skip   exit
  real clock (2026-10-13 about 20:40 PDT, after the due) sweep-real.txt                         103/0/15                 107/0/11                0
  P-4   Mon 2026-10-26 10:00                           sweep-p4-1026-1000.txt                103/0/15                 107/0/11                0
  P-3   Tue 2026-10-27 13:00                           sweep-p3-1027-1300.txt                103/0/15                 107/0/11                0
  P-3   Tue 2026-10-27 18:00 (after the due time)      sweep-p3-1027-1800.txt                103/0/15                 107/0/11                0
  P     Fri 2026-10-30 10:00 (payroll date)            sweep-p-1030-1000.txt                 103/0/15                 107/0/11                0
  P+1   Sat 2026-10-31 10:00                           sweep-p1-1031-1000.txt                103/0/15                 107/0/11                0
  Sat 2026-11-28 10:00                                 sweep-d-1128-1000.txt                 103/0/15                 107/0/11                0
  Sat 2026-11-28 10:00, --workers=1 (worst case pool)  sweep-d-1128-1000-w1.txt              103/0/15                 107/0/11                0
  Sat 2026-12-26 10:00                                 sweep-d-1226-1000.txt                 103/0/15                 107/0/11                0
  Mon 2027-01-11 10:00                                 sweep-d-2027-0111-1000.txt            103/0/15                 107/0/11                0
  Tue 2027-01-19 18:00 (a 2027 due Tuesday, 1st run)   sweep-d-2027-0119-1800.txt            102/1/15                 107/0/11                1
  Tue 2027-01-19 18:00 (same instant, rerun)           sweep-d-2027-0119-1800-rerun.txt      103/0/15                 107/0/11                0
  extra: Sat 2027-01-02 10:00 (period spans New Year)  sweep-x-2027-0102-1000.txt            103/0/15                 107/0/11                0
  extra: Mon 2026-11-30 10:00, --workers=1             sweep-x-1130-1000-w1.txt              103/0/15                 107/0/11                0
  (the same table: sweep-table.txt)
  The one failure of the first 2027-01-19 run is ot-leave.spec.ts:195 on desktop: the page logged "net::ERR_NO_BUFFER_SPACE" (a transient Windows socket-buffer error of the browser;
  the spec and its calendar are untouched). The rerun of the same instant passed all 236 tests (210 passed, 26 skipped, 0 failed), as did every other run.
  26 skipped = the tests that skip on purpose by project (mobile-only on desktop and desktop-only on mobile).

Notes (honest):
  - One empty heredoc (cat >> file with nothing appended) was run once by mistake against a test file; it appended nothing and the file was unchanged. No stdin-fed node/python, no pipe into head/tail, no null-device redirect, no sed, no Docker, no cmd.exe.
  - A first attempt at AB8-01 ran the scenario on the period in progress; it failed at the History "Signed" fact (fix-ab01.txt), so the final fix records a later deadline for the displayed period instead.
  - The repository was edited only under tests/ and this evidence folder and the brief's Results. dist/ was rebuilt by npm run verify (ignored by git).
