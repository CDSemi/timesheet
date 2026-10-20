WP5-UX3-DIAG1 evidence (read-only diagnosis of the three REGATE4 real-clock failures). Target 5c101c1ca8ba5b9c1ede8b1ac8bad9f3804ab05d.
All files are masked LF text; task folder is <task>, the REGATE4 raw output is <regate4>.

10-repeat-718-desktop-60.txt   hover.spec.ts "keyboard focus ring stays under the pointer on the sheet..." desktop, --repeat-each=30 (2 tests x 30),
                               --workers=2, real clock, idle host: 60 passed (4.5m), exit 0. The failure is not reproduced by plain repeats.
20-full-real-clock.txt         FULL e2e, both projects, real clock (2026-10-19 20:41 to 20:57 PDT): 651 passed, 67 skipped, 0 failed (15.7m), exit 0.
                               0 lines with ERR_NO_BUFFER_SPACE or deprecation.
30-trace-fail1-surfaces-network.txt        run 1 (surfaces.spec.ts:215, mobile): console error and failed request of the trace.
31-trace-fail3-keyboard-access-network.txt run 3 (keyboard-access.spec.ts:444, desktop): the same.
32-trace-fail2-hover-calls.txt run 2 (hover.spec.ts:718): per-call timeline of the trace; the last call is the Page.setViewportSize to 390 at
                               5437 ms, then toBeVisible resolves <button class="sheet-date"> (the DESKTOP sheet button) at 5463 ms.
                               The failing call (test.trace) is hover.spec.ts:681 reached from hover.spec.ts:756 (the phone day button).
40-diag-variant-spec.txt       the instrumented copy of hover.spec.ts:753-756 (only in the task folder; no repository file changed).
41-diag-variant-matrix.txt     every variant run (DIAG_THROTTLE, DIAG_STALL and DIAG_DELAY runs; selector original or fixed).
42-diag-delay30-original-selector-log.txt  the run that reproduces "Element is not attached to the DOM" in scrollIntoViewIfNeeded (2 of 20).

Reading the matrix: with the original selector and NO instrumentation (d0-f0) the stale desktop element is resolved after the resize in 2 of 20 runs
(a natural race). With a 30 ms deferred media-query change event (d30-f0) 17 of 20 resolve it and 2 of 20 fail with the exact REGATE4 error. With the
phone-only class `.sheet-day-button` (f1) the stale element is never resolved (0 of 20 in every f1 run) and no run fails.
CPU throttle (t*) and a main-thread stall before the resize (s*) did not reproduce the race: setViewportSize waits for the renderer, so those delays
land before the layout swap, not between it and the first locator query.
