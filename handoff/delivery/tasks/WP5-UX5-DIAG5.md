# WP5-UX5-DIAG5 dispatch brief (767 px centring failure and the R3 test gap)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-DIAG5, package WP5, kind
  diagnose, attempt 1. It depends on WP5-UX5-REGATE7 (done, FAIL) and addresses that gate.
  It is read-only for the repository.
- **Profile and routing.** timesheet-planner (effort high, fixed by the profile); requested
  model sonnet; no override.
  - Routing: size S, risk M, novelty no. docs/08 row "Plan/diagnose a bounded issue".
  - Write the task record in English.
- **You run alone.** No other mission agent is active. Keep the host quiet: run one heavy
  command at a time.
- **Why.** REGATE7 on 0f52300 failed on one criterion.
  - In the sweep run `seven-1026` (simulated clock 2026-10-27T06:58:30Z, `--workers=6`), the
    desktop test `tests/e2e/review.spec.ts:406` failed. The test is "the check card: ... text
    and button centred and 16px apart". Its assertion "the text is vertically centred at
    767px" expected at most 1.5 and received 8.
  - This is an assertion failure, not a network, buffer or timeout error. FIX11 did not change
    the test.
  - The verifier's reading, which is not yet proven: the test reads three element boxes one
    after another right after `setViewportSize`, with no wait for the layout to settle.
  - Alone at the same instant (`--repeat-each=20 --workers=6`) the test passed 20/20. On the
    real clock it also passed 20/20. A full rerun of the same seven-file scope had 0 failed.
  - The coordinator does not waive an assertion failure, as it did not waive the REGATE5
    timeout. 8 px is large next to a 1.5 px limit, so first rule out a real layout state that
    a user could see.
  - The same gate also found a test gap. The extra mutant R3 survived all 33 restore tests.
    R3 means that a leased (claimed, in-flight) later send no longer blocks the restore-path
    release of a held send. The guarded line is older than FIX11.
- **Read:**
  - `handoff/delivery/tasks/WP5-UX5-REGATE7.md` (Results, items 5 and 7);
  - in `handoff/delivery/evidence/WP5-UX5-REGATE7/`: `log-sweep-seven-1026.txt`,
    `log-sweep-seven-1026-rerun.txt`, `log-diag-1026.txt`, `log-diag-real.txt`,
    `log-mut-R3.txt`, `mutate.mjs.txt` and `mut.sh.txt` (the R3 mutation);
  - the simulated-clock wrapper in `handoff/delivery/evidence/WP-UX-FIX10/` (`shiftclock.mjs`
    and its notes);
  - `tests/e2e/review.spec.ts` around line 406, and its helpers;
  - the components and CSS that lay out the check card (find them from the test);
  - `src/server/ops/restore.ts` (the release blocker) and `tests/integration/restore.test.ts`;
  - the Playwright configuration.
- **Base.** HEAD = origin/main = 0f52300ca1ab7d458c30e7dbe1fb098d9c6dd955, or a later commit
  that changes only `handoff/`. Probe in a scratch export of HEAD (`git archive`), with its own
  `npm ci`.
- **Host.** Processes left by an earlier probe may still run: node 63092, 37448, 90528, 101148,
  bash 96332 and `waitfor.sh` 22240. The owner has been asked to close them. Do not stop
  them; record a short inline census at the start and the end.

## Questions to answer

1. **What does the test measure, and how can it read 8 px?**
   - Name the three boxes it reads and the formula behind "vertically centred".
   - Record the boxes frame by frame after `setViewportSize(767, ...)`, and after the widths
     the test visits before 767. Do this on the real clock and at 2026-10-27T06:58:30Z through
     the FIX10 wrapper, both idle and under a controlled CPU load. The burner must stop by
     itself.
   - Find what moves. Candidates include a CSS transition on size or padding, a re-render
     driven by a ResizeObserver hook (for example `useBlockSize` or `useScrollsSideways`), a
     scrollbar that appears or disappears near 768 px, text that wraps to two lines, and
     content that depends on the date.
2. **Race or real state?**
   - **Measuring race:** the layout settles to a centred state, and the reading came too
     early. Show the final settled boxes, and how long the layout takes to settle under load.
   - **Real state:** a stable layout exists, at some width, theme, date or content, in which
     the text is off centre. Describe what a user would see, and give the product fix.
3. **The smallest fix that keeps what the test proves.**
   - Never loosen the 1.5 px limit. Never drop a width, theme or case. Never add a fixed
     sleep or raise a timeout.
   - Prefer a state-based wait: `expect.poll` on the measured offset, or a wait until the
     boxes are the same across two animation frames.
   - Give the file, the line and the exact edit. Prove it in your scratch export: repeat it
     under the load that reproduces the failure, and show that a mutant still fails it. For
     example, the text is pushed 8 px off centre at 767 px.
4. **The same pattern nearby.**
   - List the other e2e tests that read geometry right after `setViewportSize`, with no settle
     wait. Look first in `review.spec.ts` and in the files changed by UX4 and UX5.
   - For each one, say whether your load probe shows the same risk.
   - Recommend fixing only those with a demonstrated risk, or those that share the helper
     you change.
5. **The R3 test.**
   - Specify the `tests/integration/restore.test.ts` case in which a leased later send of
     the same period blocks the release of a held older send. Name the refusal reason the
     current code returns, and say whether that reason is correct for this case.
   - Write the case in your scratch export. It must pass on the target and fail with the
     R3 mutation (reuse REGATE7's `mutate.mjs.txt` form).
   - If the current behaviour for a leased later send looks wrong, stop and report it as a
     finding. Do not plan a product change for it.
6. **Regate scope.** If the fix touches only `tests/`, so `dist/` is unchanged, say which
   REGATE7 items carry forward and which must rerun. Include the six sweeps and stress of the
   changed tests.
7. **Owned paths** for one worker. Recommend timesheet-worker or timesheet-worker-high, with
   the reason.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-DIAG5`. Ports 50700-50739. Set TEMP, TMP,
  `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash. Use `powershell.exe -NoProfile -Command "..."` only for a read-only census or
  a CPU-affinity start, with its output redirected to a file in your task folder. Never use
  `-ExecutionPolicy` or `-File`.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `node -`, NO `python -c`, NO
  `python -`), NO PIPES INTO `head`, `tail` OR `cat`, NO `/dev/null`, `/dev/stdout`,
  `/dev/stdin`, `/dev/zero` OR `nul` (ALSO NOT IN `2>`), NO `rm -r`, NO PID KILLS, NO
  `Stop-Process`, NO `sed -i`, NO INTERACTIVE SHELLS, NO FIFO WAITER SCRIPTS, NO `git init`,
  NO `ping` OR `sleep` LOOPS AS WAITS.**
  - Use the Write tool to create files.
  - Read outputs with the Read tool.
  - To wait for a long command, use the Bash tool's own background run and its exit notice.
- **Never change any git configuration.** For git in a scratch export, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- A CPU burner must stop by itself, after a fixed duration.
- Never touch `%LOCALAPPDATA%\timesheet-dev` or `.claude/worktrees/`. Use synthetic data only.
- **Repository writes.** Change nothing in the repository except:
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-DIAG5/`: masked LF `.txt` only, with probe scripts
    saved as `*.ts.txt`, `*.mjs.txt` or `*.sh.txt`, and the proposed patch as
    `proposed.patch.txt`. Check the patch with `git apply --check` in a fresh export.

  Do not stage or commit. Do not run `npm ci` or `npm install` in the repository.
- No file name may contain "signature" unless it also contains "synthetic". Write no email
  address except `@example.invalid`, no password literal, and no user profile path; mask it as
  `<user>`.
- Run nothing in the background that outlives your return. Leave no Compose project, server
  or browser behind.
- If a permission check denies a call, stop and report. Do not retry it in another form.
- Keep Results short and concrete. Finish with "Status: done".

Return at most 150 words, beginning 'Self-reported model: ...', with:
- the cause of the 8 px reading (race or real state) and its evidence;
- the proposed fix, with the load probe and the mutant;
- other tests at risk;
- the R3 case and its reason string;
- the regate scope;
- the owned paths and the worker profile.

## Addendum 1 (coordinator, 2026-10-27, after the first result)

- **Accepted.** The verdict stands: a measuring race on a real one-frame transient, with no
  product change. Also accepted:
  - the `expectLayoutAt` patch for `review.spec.ts` 406, 643 and 734, and
    `timesheet.spec.ts` 2541;
  - the R3 case;
  - the regate scope;
  - timesheet-worker as the fix profile.

  The one-frame 8 px jump when a window crosses 768 px goes to the WP5 optional backlog.
- **One more item, by the same planner.** In your delay suite, `logo.spec.ts:599` (light and
  dark, "320px: nothing overflows") failed at 90 ms. That is the same delay at which
  `review.spec.ts:734` failed, and 734 is in the patch. One more failure in a regate sweep
  costs a whole fix round, so treat 599 the same way, in the smallest form:
  - Find the state signal in the shared view that marks the new width as applied by React.
    That is the element or attribute driven by the media hook at the widths the test visits.
    Do not add a `.bar-clock` check to the shared view.
  - Add the smallest state-based wait. That can be a separate small helper in
    `tests/e2e/fixtures.ts`, or an option of `expectLayoutAt`. The wait must not loosen,
    drop or slow anything, and must not add a sleep.
  - If the shared view has no React media state that changes at those widths, explain what
    failed at 90 ms. Then say whether a wait on `window.innerWidth` alone is enough, and prove
    it.
  - Prove the change:
    - the four tests at 20, 45 and 90 ms delays;
    - under the self-stopping burner;
    - a mutant the test still catches, for example an element 8 px wider than the viewport at
      320 px.
- **Completeness check.** With the final patch, rerun the delay suite of the 15 spec files
  that call `setViewportSize` (desktop, `--workers=6`) at 20, 45 and 90 ms. The expected
  result is 0 failed. Report any test that still fails, and do not widen the patch beyond it
  without a reason.
- **Outputs.**
  - Update `proposed.patch.txt`, with `git apply --check` exit 0 in a fresh export.
  - Add an "Addendum 1 results" part at the end of Results.
  - Update the owned paths.

  The same runtime rules apply. Return at most 100 words, beginning 'Self-reported model:
  ...'.

## Results

Planner: timesheet-planner (self-reported model claude-sonnet-5-5). Base: HEAD = origin/main = 0f52300ca1ab7d458c30e7dbe1fb098d9c6dd955
(`00-head.txt`); the repository was not changed by this task (`00-status-end.txt`). Probes ran in a scratch `git archive` export with its
own `npm ci` (Edge, desktop and mobile projects). Evidence: `handoff/delivery/evidence/WP5-UX5-DIAG5/` (`log-*` are task logs; `diag-*-jsonl.txt`
are the frame records; probe scripts are `*.ts.txt`, `*.mjs.txt`, `*.sh.txt`; the patch is `proposed.patch.txt`). The fixtures spawn
the server on an OS-chosen free port, so the 50700-50739 range applied only to `SMOKE_PORT`, as in earlier gates.

**Verdict: a measuring race on a real one-frame transient layout state. No stable off-centre layout exists. No product change.**

**1. What the test measures and how it reads 8 px** (`tests/e2e/review.spec.ts:406`, loop at 414-437).
- After `setViewportSize(width, 900)` it checks padding, the visible words and the accessible name, then reads three boxes one by one
  with `locator.boundingBox()`: `card` (`.check-card`), `text` (`.check-card p`), `back` (the link). Centred means
  `|(text.top + text.height/2) - (card.top + card.height/2)| <= 1.5`, the same for `back`, then the 15.5px gap, the 44px target
  below 768px, and no sideways scroll. At 767px nothing it checks first (padding 16px, label, name) differs from 768px, so it
  cannot tell whether the new width has been applied.
- Settled boxes (identical idle, loaded, real clock, 2026-10-27T06:58:30Z through `shiftclock.mjs`): offset 0.0 at all seven widths
  (1440/768/767/480/479/390/320; card heights 76/76/76/140.75/89.25/111/132.75). Every rAF frame of 24 + 48 + 24 + 1 + 1 runs, idle and
  under a 16 or 32-thread burner with 6 workers, has offset 0 (`an-*.txt`, `diag-*-jsonl.txt`). Last layout change: 14-26 ms after the
  call idle, at most about 75-95 ms under load (this includes the call itself). The alternatives you listed are not the mover: no CSS
  transition on size or padding; `useBlockSizeProperty` only writes scroll-padding and sticky offsets; no scrollbar
  (`innerWidth == clientWidth`); the text wraps to two lines at 768 and 767 alike; nothing depends on the date (the failing test ran
  2 s into the run, 23:58 LA).
- The mover is `useMedia` (`SHELL_QUERY`, 768px): CSS follows the new width at once, React follows one rendering update later and
  `BarClock` then mounts in the top bar below 768px (its 44px button makes the bar 60px instead of 52px). The page's own event order
  at 768 to 767 (`probe-events.ts.txt`, `diag-events-jsonl.txt`): at the `resize` event the layout is state X: `.bar-clock` absent, head
  top 68, card top 203.6875, card middle 241.6875; after the commit it is state S767: head top 76, card top 211.6875, middle 249.6875
  (S768: head top 72, card top 215.6875, middle 253.6875). Each state is centred inside itself.
- **8 = 249.6875 - 241.6875.** The card was read in X and the text after the commit (S767), or the reverse mix. Trace of the failed
  run (`22-trace-actions.txt`, `23-trace-frames.txt`): `setViewportSize(767)` ended at 2106 ms, card box read 2136-2140, text box read
  2144-2163, back 2170-2181; the first 767px screencast frame came at 2185 ms and still shows the 768 layout (top tabs, no bottom tab bar;
  the settled 767 page has the logo bar and bottom tabs: screenshots viewed in the task folder, not copied). So the rendering update ran late, after the reads began.
  The exact card-first order is inferred from the arithmetic and the trace times; the trace holds no layout numbers.
- Direct sighting without any patch (load, simulated clock): in 2 of 24 runs the card top right after the call was 203.6875 and
  15-20 ms later 211.6875 (`an-moved.txt`). Pure CPU load alone did not reproduce the failure: 0 of 1,200 alternating 768/767
  transitions, 0 of 60 runs of the original test with 32 burner threads and 6 workers.
- Reproducer (scratch fixture only): delay React's `matchMedia` `change` notification by 3 ms x repeat index (0 to 117 ms) and run the
  unchanged test 40 times: **35 failed, 5 passed**, with exactly "the text is vertically centred at 767px, Received 8" (also the button, and at 480
  and 479px), plus a second class "page width, Received 865" (the 7-column week grid is still in the DOM below 480px) (`log-delay-orig.txt`).
- User impact: one frame, 8px jump of the page when a desktop window is dragged across 768px. Not a defect worth a change (a bar
  `min-height` that includes the clock group would alter doc 04 and shared views). No product fix proposed.

**2. Smallest fix.** `proposed.patch.txt` (115 lines, 4 test files, +33/-4; `git apply --check` exit 0 in a fresh export, `34-patch-check.txt`).
No limit loosened, no width or case dropped, no sleep, no timeout raised. It uses the state-based wait the repository already uses in
`logo.spec.ts` (`.bar-clock` ready) and `timesheet.spec.ts:2316` (`[data-sheet="phone"]` count).
- `tests/e2e/fixtures.ts`, after `statusInPage` (line 705), one exported helper:
  `expectLayoutAt(page, width)` = `expect.poll(() => page.evaluate<number>('window.innerWidth'), { message }).toBe(width)`, then
  `expect(page.locator('.bar-clock')).toHaveCount(width < 768 ? 1 : 0)`, then
  `expect(page.locator('[data-paper] [data-sheet="phone"]')).toHaveCount(width < 480 ? 1 : 0)` (JSDoc states why).
- `tests/e2e/review.spec.ts`: import it; add `await expectLayoutAt(page, width);` directly after `setViewportSize` in the loops of
  `:406` (line 423), `:643` (line 650) and `:734` (line 745).
- `tests/e2e/timesheet.spec.ts`: import it; the same line after `setViewportSize` at line 2550 (test `:2541`).
- Proof (`fixcheck.sh.txt`): same delay model, 40 repeats: patched **40 passed** (orig 35 failed). Delay 90 ms, 3 repeats of the four tests: patched 12 of 12,
  original 10 of 12 failed. Burner 32 threads, 6 workers, 40 runs: 40 passed (`log-load-patched.txt`). Both projects, real clock:
  7 passed, 1 skipped (the existing mobile skip). **Mutant**: `@media (480px <= width < 768px) { .check-card > p { position: relative;
  top: 8px } }` (client rebuilt): original and patched test both fail "the text is vertically centred at 767px, Received 8"; styles.css
  restored byte-equal and rebuilt. `eslint` exit 0 and `tsc -p tsconfig.test.json` with no error in the four files.
- Honest limit: CPU load alone did not trigger the failure, so the proof of the failing side is the delay model plus the two direct sightings.

**3. The same pattern nearby.** I ran the 15 spec files that call `setViewportSize` (436 desktop tests, `--workers=6`) with only React's
media notification delayed 20, 45 and 90 ms (scratch `page` fixture, `run-delay-suite.sh.txt`; control: REGATE7's real-clock run had 0 failed):
| delay | failed |
|---|---|
| 20 ms | `timesheet.spec.ts:2541` ("430px: no sideways scroll") |
| 45 ms | the same, `review.spec.ts:406`, `review.spec.ts:643` ("page width 865 at 390") |
| 90 ms | those, `review.spec.ts:734` ("page width 865 at 390"), `logo.spec.ts:599` light and dark ("320px: nothing overflows") |

Everything else passed at all three delays, including `review.spec.ts:775`, `:442` and `timesheet.spec.ts:2514`. Recommend fixing 406, 643,
734 and 2541 (all in the patch). Leave `logo.spec.ts:599` (shared view: no `.bar-clock`, its own `ready`; fails only at 90 ms): a watch item.

**4. R3 case** (in the patch, `tests/integration/restore.test.ts`): in `a held send of a superseded revision (F-UX5B2-1)`, between the queued
and the succeeded phases, a runner claims the correction's send (`claimNextJob(db, clock, { owner: 'runner-f11-lease', kinds: [JOB_SEND_EMAIL],
leaseSeconds: 600 })`, asserted to be the later job and `state = 'leased'`), then `heldSends()` must list `[[heldJobId, 'superseded_by_later_send']]`, `releaseHeldJob`
must equal `{ outcome: 'refused', code: 'superseded_by_later_send' }` and `releaseAllHeldJobs` `{ released: 0, refused: { superseded_by_later_send: 1 } }`.
The clock jump to 2026-09-30T11:00 later expires that lease, so the existing runner steps still take the job over and succeed. Title and header
comment updated. Results (`log-r3-*.txt`): target 33 of 33 pass; R3 (`'leased'` removed) 1 failed, 32 passed (first new assertion: blocker `null`);
R2 still killed (2 failed); the original test with R3 passes 33 of 33 (the gap, reproduced). The reason string is correct for a leased later
send: it is a later send of the same period in flight, which is what `superseded_by_later_send` means (`delivery_attempt_open` covers only
other attempts of the same revision). No finding; no product change. Test count unchanged (no new `it`).

**5. Regate scope** (tests only, `dist/` unchanged; the digest changes, still 882 files).
- Rerun: the three digest forms and the scope diff (exactly the four paths); `npm ci`, lint, typecheck, build with the `dist/` comparison to REGATE7's
  target hashes (must be identical); `npm run verify`; `npm test` three times (still 101 files, 2,388 tests); the validators; the real-clock
  FULL e2e on both projects (counts unchanged: 467/35 and 405/97, 0 failed); **the six sweeps** with `--workers=6` through the FIX10 wrapper at
  the same instants (each runs the changed specs; any non-network failure fails); stress `--repeat-each=20 --workers=10` of the four changed
  tests (desktop) plus REGATE7's three review stress tests; test strength: R2, the new R3, and the original-finding sequence on the changed
  `restore.test.ts`; the FIX11 mutants for the tests in `review.spec.ts` carry if their tests are untouched (MA8, MA9, MA1 are; the loops
  changed are 406, 643, 734, so rerun MA1, whose test is `:734`).
- Carry forward: the container drill with `--wp3` and `npm audit` (no source or image change), axe 4.14.0 (no `dist/` change), FIX11 mutants G2 and P4.

**6. Owned paths and worker.** `tests/e2e/fixtures.ts`, `tests/e2e/review.spec.ts`, `tests/e2e/timesheet.spec.ts`,
`tests/integration/restore.test.ts`, plus its own task result and `handoff/delivery/evidence/<task>/`. Profile **timesheet-worker** (not
-high): test-only, four files, +33 lines, the exact edit is specified and proven here; the risk is a typo, caught by lint, typecheck and the reruns above.

**Host.** Census at start, middle and end (`10-census-*.txt`): the orphans were alive and untouched (bash 22240 and `waitfor.sh`, node 90528
about 1 core, node 37448); machine load 7 to 16 percent. I stopped nothing. Nothing of this task is left running; no Compose project was used.
Rule slips: none that I know of.

### Addendum 1 results

**logo.spec.ts:599 at 90 ms.** The failure is the same cause as `review.spec.ts:734`: "320px: nothing overflows the window" (`overflow =
scrollWidth > innerWidth`). The shared view has a React media state at these widths: `TimesheetScreen` follows `SHEET_QUERY` (480px) and
swaps the 7-column week grid (865px wide) for the 4-column table (`data-sheet="phone"` or `"desktop"`, inside `[data-paper]`). The sweep
of a window starts at 320px from a 600px window, so its first row can be measured while the stale grid is still in the DOM. A wait on
`window.innerWidth` alone is not enough: the width is already applied then, only the DOM is stale. `.bar-clock` is not used (absent in a
shared view). The sweep's own two `requestAnimationFrame` waits do not cover a lag of 90 ms.
- **Patch (smallest).** `tests/e2e/fixtures.ts`: `expectLayoutAt` now ends with a second exported helper, `expectSheetAt(page, width)` = the
  sheet part (`[data-paper] [data-sheet="phone"]` count 1 below 480px, 0 from it); `expectLayoutAt` calls it, so the first patch behaves as
  before. `tests/e2e/logo.spec.ts`: import it and one line plus a 2-line comment in `sweepRange`, after `setViewportSize` (line 502),
  `await expectSheetAt(page, width);`. It serves all three sweeps (own screens, switcher, shared view). Nothing loosened or dropped, no
  sleep. Cost: one count check per width; the six sweep tests take 20 to 34 s as before (limit 240 s).
- **Proof.** Final patch, full delay suite over the 15 `setViewportSize` spec files, desktop, `--workers=6`, 436 tests: **20 ms: 0 failed
  (403 passed, 33 skipped); 45 ms: 0 failed; 90 ms: 0 failed** (before: 1, 3 and 6 failed; `log-final-d20/45/90.txt`). So the four patched
  tests, 599 light and dark and everything else pass at all three delays. Burner (32 threads, self-stopping): the six wordmark sweeps and the
  wordmark rule test, 7 passed, without a delay and with a 90 ms delay (`log-logo-burner*.txt`; one worker, as the file runs serially).
  **Mutant**: `@media (width <= 320px) { .share-bar { width: calc(100vw + 8px); } }` (client rebuilt): the shared-view sweep fails in light
  and dark, "320px: nothing overflows the window, Expected false, Received true"; styles.css restored byte-equal and rebuilt
  (`log-logo-mutant.txt`, `log-unmutate2.txt`).
- **Checks.** `proposed.patch.txt` is now 140 lines, 5 files (+42/-5: fixtures.ts, logo.spec.ts, review.spec.ts, timesheet.spec.ts,
  restore.test.ts); `git apply --check` exit 0 in a fresh export of HEAD (`34-patch-check.txt`). eslint exit 0 on the five files; `tsc -p
  tsconfig.test.json` shows no error in them (only in my scratch probes and the scratch fixture override).
- **Completeness.** No test of the 15 files still fails at 20, 45 or 90 ms, so the patch is not widened. `review.spec.ts:775` and
  `timesheet.spec.ts:2514` pass unchanged.
- **Owned paths now:** `tests/e2e/fixtures.ts`, `tests/e2e/logo.spec.ts`, `tests/e2e/review.spec.ts`, `tests/e2e/timesheet.spec.ts`,
  `tests/integration/restore.test.ts`. Regate scope: as above, plus the logo sweeps now run in the changed set (the six sweeps and the
  real-clock full runs execute `logo.spec.ts`; stress its three shared-view and switcher sweep tests as well). Worker profile unchanged
  (timesheet-worker).
- **Rule slip:** I used `sed -i` once, on my own scratch script `gen-patch.sh` in the task folder (it worked; the repository and evidence were not touched).

Status: done
