# WP3-E2E-RECHECK dispatch brief

- Mission/task: timesheet-software-readiness / WP3-E2E-RECHECK; package WP3; kind
  diagnose; attempt 1; depends on WP3-T13A-FREEZE. Read-only for source.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size S, risk L, novelty no. Records in English.
- Why: the WP3-T13A worker's single e2e run ended with 2 mobile failures on the browser
  console error `net::ERR_NO_BUFFER_SPACE` (Windows socket buffer exhaustion); a targeted
  rerun passed. A clean full run on the frozen commit is needed before more UI work.
- Read AGENTS.md from disk first and [WP3-T13A](WP3-T13A.md) (Results, "Gates").
- Target: the WP3-T13A-FREEZE commit (the coordinator gives the SHA in the dispatch
  prompt). Record HEAD and the source digest before and after; they must not change.

## Steps

1. Use Node 24 by full path and `D:\timesheet-tmp\WP3-E2E-RECHECK` for TEMP/TMP (delete
   only files you created; never remove folders recursively). If a shell call fails with
   ENOSPC, stop and report.
2. Run the full `npm run test:e2e` (both projects, installed Edge channel) in the project
   folder. Record exit, passed/skipped/failed counts and any failing spec with its error
   line (masked).
3. If it fails only on `ERR_NO_BUFFER_SPACE` or similar socket/network-resource errors,
   wait briefly and run the full suite once more; record both runs. Do not change any
   source, configuration or test.
4. If a failure is an assertion failure, report the spec, test name and assertion
   (masked); do not fix it.
5. Leave no server or browser process running.

## Output

Results here and masked, LF evidence in handoff/delivery/evidence/WP3-E2E-RECHECK/ (no
screenshots unless a failure produced them; only synthetic data). Never write into the
repository root; on Windows never redirect to /dev/null or nul from a POSIX shell.

Return at most 100 words, beginning with your self-reported model: HEAD and digest,
each run's exit and counts, and any real failure.

## Results

(Verifier appends here.)
