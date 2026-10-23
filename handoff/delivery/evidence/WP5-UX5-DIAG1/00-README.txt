WP5-UX5-DIAG1 evidence index (masked LF text; <user> = the profile name)

Base: HEAD = 2bce0ab5842b80c710f23496d5173c122319e5c7, scratch `git archive` export in the task folder (setup-log.txt: npm ci exit 0, build exit 0).
Node v24.21.0, Playwright on installed Microsoft Edge, simulated clock 2026-11-01T08:45:00Z through the FIX10 preload (shiftclock.mjs, probe-now.mjs copied unchanged;
the preload shifts Date in the Node processes only, the browser clock is not shifted). Wrapper: run-shift.sh.txt, env: env.sh.txt, setup: setup.sh.txt.
The scratch export got the probe specs (zz-diag*.spec.ts.txt); the repository was not touched except this folder and the brief's Results.

Leftover regate processes:
  procs-raw.txt     the listing the brief names; the only matches are this command's own bash and powershell processes (all started 15:53:03 local, 2026-10-22).
                    No Playwright/Node tree and no chain2.sh / chain3.sh of the regate is alive.
  ports-raw.txt     the first port query failed (Get-NetTCPConnection does not take a range); the second used `netstat -ano -p tcp` and a grep for :49940-:49979
                    (and :49980-:49999): no line, so no process holds a port in 49940-49979.
  procs-final.txt   empty: no process of this task is left at the end.

Reproduction (the failing assertion needs a read inside the lag window; it was not reproduced):
  log-base1.txt     the real test, mobile, "a received share", --repeat-each=40 --workers=6: 80 passed
  log-base2.txt     the real test, both projects, --repeat-each=60 --workers=14: 240 passed
  log-diag-r1/r6/r20.txt   reload probe at CDP CPU throttle 1, 6, 20 (30/40/40 loads): 0 stored-vs-bar mismatches at combobox-visible, +1 frame, +2 frames, +1 s
  log-diag3c-r1/r4/r10.txt, log-diag3d-r1/r10.txt   sign-in probe (the shell mounts in the same document), with a MutationObserver timeline
                    (time:bar/stored): in EVERY sign-in (12+20+20+40+40) the bar goes 60 -> 112 first and the stored value follows later;
                    gap-stats.txt: 1.0 to 34.6 ms at rate 1, up to 66.7 ms at rate 10; 0 of 132 test-style reads landed inside the gap
  log-diag2-height.txt / log-diag2-padding-only.txt   by construction: a height change read in the same task gives bar 92 / stored 60 and two frames later 92 / 92;
                    a padding-only change on the bar is never reported (ResizeObserver watches the content box): stored 60 stays while the bar is 92, then 52
Failing run (from the regate evidence, not re-run): trace-fields.txt / trace-net-fields.txt: sign-in response about 1060726, bar boxes read at 1060812..1060849,
  the one evaluate at 1060853 (monotonic ms of the trace); the received value was 60, the expected 112.
