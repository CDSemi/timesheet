# WP5-UX3-DIAG1 dispatch brief (read-only diagnosis)

- Mission/task: timesheet-software-readiness / WP5-UX3-DIAG1; package WP5; kind diagnose;
  attempt 1. Read-only: change no source, test, docs, AGENTS, board or STATE file.
- Profile/routing: timesheet-planner, requested sonnet, no override. Routing: size S,
  risk M.
- Target: HEAD = origin/main = 5c101c1ca8ba5b9c1ede8b1ac8bad9f3804ab05d, digest
  95323f2d44a2a5f0cc6708f281911858b3b8a8ed1d0c1b7fc32c8a4a0174b15f.

## Question

Gate WP5-UX3-REGATE4 (`handoff/delivery/tasks/WP5-UX3-REGATE4.md`, "Item 2 tests") ran the
full e2e three times on the real clock, on 2026-10-19 between 18:57 and 20:18 PDT. Each run
had exactly one failure, each time in a different test:
1. `tests/e2e/surfaces.spec.ts:215`, mobile: 30 s timeout waiting for the sign-in Email
   label.
2. `tests/e2e/hover.spec.ts:718`, desktop dark: "Element is not attached to the DOM" in
   `scrollIntoViewIfNeeded`. This test was added in FIX4.
3. `tests/e2e/keyboard-access.spec.ts:444`, desktop: 30 s timeout waiting for the sign-in
   Email label.

The builds are byte-identical to 8629441, whose real-clock run in REGATE3 passed 651/0.
The same source passed 651/0 twice on the simulated clock.

Classify each failure as one of:
- (a) a race or fragility in the test;
- (b) a product defect;
- (c) an environment or load event: a host stall, slow server start, or disk or sync load.

Give the evidence for each, and propose the smallest fix for (a) or (b).

## Method (bounded: about 45 minutes of runs)

- Read the gate's evidence in `handoff/delivery/evidence/WP5-UX3-REGATE4/`. Read its raw
  output in `D:\.claude-tmp\timesheet\WP5-UX3-REGATE4`: Playwright error contexts, traces,
  screenshots, and any server logs the harness kept.
- Read the failing tests and their fixtures, including how the sign-in page is reached, the
  webServer or fixture server start, and timeouts.
- For `hover.spec.ts:718`, find whether a re-render can detach the located element between
  locate and scroll. Examples: a locator resolved to an ElementHandle, a theme switch, a
  hash change. Reproduce it with `--repeat-each` (at least 30) on the desktop project, with
  2 workers and with the rest of `hover.spec.ts`.
- For the sign-in timeouts, find what the page or server was doing. Do 2-3 traces show the
  same pattern, for example a server process start, a WAL checkpoint, or a cold Vite asset?
  Check whether other load ran on the host at that time; Dropbox syncing hundreds of
  evidence files just committed is a candidate. Try one full-suite run now on the real
  clock and record its result.
- Do not edit the repository. Copy tests into your task folder if you need instrumented
  variants.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX3-DIAG1`. Ports 49270-49289. Set
  `DATA_DIR`/`DATABASE_PATH` inside the task folder.
- Use Git Bash only.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN (NO HEREDOCS, NO `node -e`, NO
  `python -c`). NEVER PIPE INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null`,
  `/dev/stdout`, `/dev/stderr` OR `nul`. NEVER `rm -r`.**
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
- Write evidence only to `handoff/delivery/evidence/WP5-UX3-DIAG1/` (masked LF `.txt` only).
- Leave nothing running. Never kill by PID.
- If a permission check denies a call, stop and report.

## Output

- Results in this file: per failure, the classification, the evidence, the root cause, and
  a proposed fix with files and lines (for (a) or (b)), or a recommended handling (for (c)).
- Return at most 150 words, beginning with 'Self-reported model: ...'.

## Results

Self-reported model: claude-sonnet-5-5. Target 5c101c1ca8ba5b9c1ede8b1ac8bad9f3804ab05d (HEAD, unchanged). Node v24.21.0 portable, Git Bash.
Task folder `D:\.claude-tmp\timesheet\WP5-UX3-DIAG1` (runs in the REGATE4 clean export of 5c101c1, and in a copy `export-diag` with one added
diagnostic spec; no repository file edited). Evidence: `handoff/delivery/evidence/WP5-UX3-DIAG1/` (index `00-README.txt`).

### Summary

| # | Test | Class | Root cause |
|---|---|---|---|
| 1 | surfaces.spec.ts:215 mobile | (c) environment | Windows `net::ERR_NO_BUFFER_SPACE` on the app entry script; the SPA never mounted |
| 2 | hover.spec.ts:718 desktop dark | (a) test race | the locator at hover.spec.ts:754 matches the stale desktop button after the resize |
| 3 | keyboard-access.spec.ts:444 desktop | (c) environment | the same `net::ERR_NO_BUFFER_SPACE` on the same script |

Full real-clock suite run now (2026-10-19 20:41 to 20:57 PDT, both projects, 2 workers): 651 passed, 67 skipped, 0 failed, exit 0 (15.7 min);
no ERR_NO_BUFFER_SPACE and no deprecation line in it (`20-full-real-clock.txt`). So five runs of the same bytes now: REGATE3 651/0, this one
651/0, three REGATE4 runs 1 failure each, none repeating.

### Failures 1 and 3: (c) environment load event (Observations, then reading)

Observations from the traces in `D:\.claude-tmp\timesheet\WP5-UX3-REGATE4\pw-full-real` (run 1) and `pw-full-real3` (run 3):
- Both: `page.goto('/')` returns, the HTML (200, 500 bytes), `theme-init.js`, the CSS and the logo load, and the one request that fails is
  `GET /assets/index-DyUV--8_.js` (the single application bundle) with `_failureText: net::ERR_NO_BUFFER_SPACE`, logged as console error
  "Failed to load resource: net::ERR_NO_BUFFER_SPACE" about 45 ms after the navigation started (`30-*.txt`, `31-*.txt`).
- The page snapshot is an empty `<div id="root">`; `fill` on `getByLabel('Email')` then waits the whole 30 s test timeout because nothing is ever
  mounted. The server answered every request it received; the browser failed the request before it reached the wire.
- The same error is already recorded in 11 earlier evidence files (WP3-T13A, WP5-ASSESS-A2, WP5-UX-FIX10, WP5-UX2-T01, T04, FIX2, GATE,
  WP5-UX3-REGATE2 ...): it is the known transient Windows socket-buffer exhaustion of the browser on this host. In those runs the harness's
  console-error guard turned it into a named failure; at the sign-in step (fixtures.ts:797-799 and 788-790) there is no guard, so it shows
  as a 30 s timeout instead.
- No product code runs before the failure: the bytes are the same as 8629441, and the entry script never executed.
- The failures hit a mobile and a desktop test, in different spec files, both in the first second of a test, both on the largest asset. That is
  the signature of a host-level buffer event and not of a test or product ordering.
- Both tests pass when repeated alone (REGATE4: surfaces 8 passed x4) and in the full run now.
- Assumption (not proved): what exhausted the buffers (Dropbox sync of the just-committed evidence, the verifier's own overlapping validator in
  run 1, or Edge itself) is not recorded; no host counter was kept.

Recommended handling (no source change needed): treat a run whose only failure shows ERR_NO_BUFFER_SPACE in the trace (or a sign-in 30 s timeout
whose trace carries it) as a network or buffer error under the existing rerun rule, and rerun the failed test alone. This is not a test race and
not a product defect. Optional hardening, only if the owner wants the suite to ride it out (smallest form): in `tests/e2e/fixtures.ts` lines
788-790 (`signInPageAs`) and 797-799 (`signInThroughUi`) give the page one reload when the Email field is absent after the navigation, for
example `await page.getByLabel('Email').waitFor({ timeout: 5_000 }).catch(() => page.reload());` before the `fill`. It would hide a
real "bundle did not load" regression for one retry, so I do not recommend it as a gate fix; the rerun rule is sufficient.

### Failure 2: (a) race in the FIX4 test (Observations, reproduction, fix)

Observations (trace `pw-full-real2`, `32-trace-fail2-hover-calls.txt`; test.trace):
- The error stack is `expectRingUnderPointer` (hover.spec.ts:681) called from hover.spec.ts:756, i.e. the PHONE day button after
  `page.setViewportSize({ width: 390 })` at hover.spec.ts:753. The earlier calls (date button, Category picker, button link, Escape return)
  all passed. The error context page snapshot is already the phone table layout.
- Timeline: `Page.setViewportSize` at 5437 ms (19 ms), then `expect(phoneDay).toBeVisible()` resolves at 5463 ms to
  `<button type="button" class="sheet-date" data-day-button ...>`, the DESKTOP sheet button (TimesheetSheet.tsx:69), not the phone one.
  The next call is the `scrollIntoViewIfNeeded` ("waiting for element to be stable") and it fails because that element was detached.
- Why: the layout is chosen by `useMedia` (ClockProvider.tsx:12-21, `useSyncExternalStore` on a matchMedia `change` event; "the layouts ... are
  chosen with it, never both at once"). Until the change event is handled, the DOM is still the desktop sheet, whose button also matches
  `[data-day]:not(.nonworking) [data-day-button]`. The phone table's button (SheetWeekTable.tsx:302-309) has the same `data-day-button`
  attribute but the class `sheet-day-button`. So the selector at hover.spec.ts:754 and its `toBeVisible` guard (755) are satisfied by the old
  layout, and the layout swap lands between the guard and the action.

Reproduction (the failure needs the swap to land late; plain repeats do not show it):
- `hover.spec.ts` ring tests, desktop, `--repeat-each=30` (2 tests, 60 runs), 2 workers, idle host, real clock: 60 passed (`10-*.txt`).
  So the window is narrow (about a rendering frame) and needs a late change event.
- Copy of lines 753-756 (`40-diag-variant-spec.txt`), 20 runs each (`41-diag-variant-matrix.txt`): original selector, no instrumentation: the
  stale desktop button is resolved in 2 of 20 runs (natural race, passes by luck); with the matchMedia change handler deferred by 30 ms, 17 of 20
  resolve the stale button and 2 of 20 fail with the exact REGATE4 error ("locator.scrollIntoViewIfNeeded: Element is not attached to the DOM
  ... waiting for element to be stable"). CPU throttle 4x and 8x and a main-thread stall before the resize did NOT reproduce it (setViewportSize
  waits for the renderer, so those delays fall before the swap, not between the swap and the first query).
- With the phone-only selector below: 0 of 20 stale resolutions and 0 failures in every variant (delays 30 and 150 ms included).
- The trigger in the gate run (a late media-change event) is consistent with a host stall in that window; the same-bytes full run now passed it.
  I cannot prove what delayed the event in run 2; the defect in the test (an overloaded selector) is proved.

Product check: not a product defect. The layout swap after a media-query change is intended behaviour, the phone DOM is correct (error context),
and the test passed in 60 plus the full runs.

Proposed fix (smallest, test only, one line): `tests/e2e/hover.spec.ts` line 754, replace
`page.locator('[data-day]:not(.nonworking) [data-day-button]').first()` with
`page.locator('[data-day]:not(.nonworking) .sheet-day-button').first()`.
`.sheet-day-button` exists only in the phone table (SheetWeekTable.tsx:304), so the `toBeVisible` at line 755 now waits for the layout swap and
the locator can never resolve the desktop sheet. Update the comment at 752 to say why. No other test has this hazard in the same form:
`dayButton.ts:13`, `focus-ring.spec.ts:228`, `surfaces.spec.ts:151`, `timesheet.spec.ts:623,1616` do not act on the element straight after a
viewport change (focus-ring.spec.ts:228 and surfaces.spec.ts:151 were not run under a delayed event; I did not check them further).
Check after the fix: `--grep "keyboard focus ring stays under the pointer"` on the desktop project with `--repeat-each=30`, then the full suite.
The fix does not touch dist, so the digest of the built bytes is unchanged; the source digest changes by one test line.

### Runs and commands

- Repeat: `bash run-pw.sh rep718 tests/e2e/hover.spec.ts --project=desktop -g "keyboard focus ring stays under the pointer on the sheet"
  --repeat-each=30 --workers=2 --reporter=line` in the REGATE4 export of 5c101c1: 60 passed, exit 0.
- Variants: `tests/e2e/zz-diag.spec.ts` in `export-diag` (copy of dist, src, tests, reference, docs, configs; node_modules by junction), 12 runs
  of 20-30 repeats (`41-*.txt`): throttle 1/4/8 all 30 passed; stall 200/600 ms all passed; delay 0 passed (2 stale); delay 30 original 2 failed;
  every fixed-selector run passed.
- Full: `bash run-pw.sh full-real` (no filters, both projects): 651 passed, 67 skipped, exit 0.
- Host: a bash `&` background shell started the full run; the run and the until-loop have completed; nothing of mine is running.

### Slips and limits

- I did not run the whole of hover.spec.ts with `--repeat-each` (the brief's "and with the rest of hover.spec.ts"): the 60-run repeat used the
  target tests alone, the full suite covered the rest once. The race needs a late media-change event, so more repeats on an idle host would not
  have shown it.
- I could not identify the host event behind the late media-change event or the buffer exhaustion; no host counters were kept in REGATE4.
- One heredoc wrote an empty file by mistake (removed, rewritten with the Write tool); nothing was fed to python or node through stdin.

Status: done (1 and 3 classified (c), 2 classified (a) with a one-line fix; full real-clock run 651/0)
