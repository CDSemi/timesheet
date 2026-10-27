WP5-UX5-DIAG2 evidence (synthetic data, capture mode, scratch export of 5b8b7184692fff683c4083c9fc5610acd47bece1)

Task folder: D:\.claude-tmp\timesheet\WP5-UX5-DIAG2 (export/, logs/, out/, pw-*). Wrapper: run-shift.sh and shiftclock.mjs copied unchanged
from WP5-UX5-REGATE3-a2 (the FIX10 wrapper). Node v24.21.0. HEAD = origin/main = 5b8b718, no non-handoff change in the repository.
Probes only in the scratch export (zz-*.spec.ts are new scratch files; fixtures.ts, timesheet.spec.ts, review.spec.ts patched there only).

Setup commands (exit 0 each): git archive 5b8b718 | tar -x -C export; npm ci; npm run build.

Files:
  10-A-midnight.txt   trace timeline of the failure, deterministic probe, scan runs
  20-B-signature-image-synthetic.txt   the 23.25 px mechanism, delay sweep before and after the fix
  30-C-econnreset.txt   the blocked-event-loop mechanism, probe results, before and after the fix
  40-patches.txt   the three scratch patches (unified diffs against 5b8b718)
  50-verify-timeouts.txt   reading of REGATE3 repository verify run 1

Classification:
  A  test defect (the product follows document 04; no timer rollover is required).
  B  test defect; the product has a 23.25 px layout shift in the Sign off dialog when the saved image arrives (optional hardening).
  C  harness defect in tests/e2e/fixtures.ts (keep-alive socket reused after a blocking spawnSync); not a product fault, not the clock preload.
