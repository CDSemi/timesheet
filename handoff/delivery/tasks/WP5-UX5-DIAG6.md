# WP5-UX5-DIAG6 dispatch brief (two pre-existing flaky e2e tests and a repeat census)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-DIAG6, package WP5, kind
  diagnose, attempt 1. It depends on WP5-UX5-FIX12 (done, uncommitted). It serves the regate
  that follows the fix of WP5-UX5-REGATE7. It is read-only for the repository.
- **Profile and routing.** timesheet-planner (effort high, fixed by the profile); requested
  model sonnet; no override.
  - Routing: size S, risk M, novelty no. docs/08 row "Plan/diagnose a bounded issue".
  - Write the task record in English.
- **You run alone.** No other mission agent is active. Keep the host quiet: run one heavy
  command at a time.
- **Why.** FIX12 found two flaky e2e tests. Neither the tests nor the code they exercise
  were changed by FIX11 or FIX12, and both fail on HEAD 0f52300 too.
  - **`tests/e2e/keyboard-access.spec.ts:267`** fails with "Received: inactive".
    - With `--repeat-each=30 --workers=2` it failed 13 of 30 on the FIX12 tree, and 16 of
      30 on HEAD.
    - It also failed once in FIX12's first real-clock FULL desktop run. The rerun passed.
  - **`tests/e2e/day-editor.spec.ts:5304`** ("Escape and the Close button") fails 4 of 20
    on the FIX12 tree and 2 of 20 on HEAD (`--repeat-each=20 --workers=6`).
  - A real-clock FULL e2e failure or a sweep failure fails a gate, and the coordinator does
    not waive one. Either test can fail the next regate, so both are diagnosed and fixed
    first.
  - Past gates passed these tests in single runs. Find out why repeated runs fail so often:
    a repeat-only artefact, such as state left by an earlier repeat in the same worker, or a
    race that single runs also hit.
- **Read:**
  - `handoff/delivery/tasks/WP5-UX5-FIX12.md` (Results 4 and 8);
  - `handoff/delivery/evidence/WP5-UX5-FIX12/40-reproduction-and-probes.txt` and
    `44-full-and-sweep.txt`;
  - the two tests and their helpers, and the client code they exercise;
  - `handoff/delivery/tasks/WP5-UX5-DIAG5.md` (method: the frame records and the delay
    model on React's media notification);
  - the Playwright configuration and `tests/e2e/fixtures.ts` (test isolation: server, data
    folder and browser context per worker or per test).
- **Base.** HEAD = origin/main = 0f52300ca1ab7d458c30e7dbe1fb098d9c6dd955, or a later commit
  that changes only `handoff/`.
  - The working tree holds FIX12's five uncommitted test files: `tests/e2e/fixtures.ts`,
    `logo.spec.ts`, `review.spec.ts`, `timesheet.spec.ts` and
    `tests/integration/restore.test.ts`. Its digest is
    bf7ec3f7c47ec97f84d51c9bb18d14945b8e303dcd2b732acee7cbb55d73653f.
  - Probe in a scratch export of that working tree: `git archive` of HEAD, with the five
    files copied over, and its own `npm ci`. Confirm its digest equals bf7ec3f7 before you
    probe.
  - Use a separate export of HEAD only when you need a comparison.
- **Host.** Processes from an earlier probe may still be alive: node 63092, 37448, 90528 and
  101148, bash 96332, and `waitfor.sh` 22240. The owner has been asked to close them. Do not
  stop them. Record a short inline census at the start and at the end.

## Questions to answer

1. **`keyboard-access.spec.ts:267`.**
   - What does it assert? What should be active, when, and through which code path?
   - Reproduce it in four ways, and give the failure rate of each:
     - a single run;
     - `--repeat-each` with 1 worker;
     - `--repeat-each` with 2 or more workers;
     - a single run under a self-stopping CPU burner.
   - Is the cause any of these?
     - state carried between repeats (server data, local storage, a shared page, a leftover
       focus or timer);
     - a race between the key press and the render or effect that sets the state;
     - a real product defect a keyboard user could meet.
   - Show it with a frame or event record, as DIAG5 did.
2. **`day-editor.spec.ts:5304`.** Answer the same questions.
3. **Real defect or test defect.**
   - If it is a test defect, give the smallest fix: a state-based wait, or proper isolation
     between repeats.
   - If it is a real product defect, describe what the user sees, and give the smallest
     product fix with its unit or e2e proof. Stop and report it as a finding if the fix
     needs a business or UX decision.
   - Never loosen an assertion, drop a case or raise a timeout, and never add a fixed
     sleep.
4. **Prove each fix** in your scratch export:
   - `--repeat-each=60` at the worker counts that failed, with 0 failed;
   - one run under the burner;
   - a mutant that the test still catches, for example the state never becomes active, or
     Escape does not close.
5. **Repeat census.** On the FIX12-tree export, with your fixes applied, run the real-clock
   FULL e2e on both projects with `--repeat-each=3 --workers=6`.
   - List every test that failed at least once, with its message.
   - For any new flaky test, give the cause and the fix in the same form, or say that it is
     a network or buffer error. A gate reruns those once.
   - Also run your fixed tests at one sweep instant, 2026-10-27T06:58:30Z, through the FIX10
     wrapper (`handoff/delivery/evidence/WP-UX-FIX10/`).
6. **History.** Search the earlier gate and fix evidence logs under
   `handoff/delivery/evidence/` for failures of these two tests. Say whether they are new
   since a commit, or long-standing.
7. **Patch and scope.**
   - Write one patch on top of the FIX12 working tree, `proposed.patch.txt`. Check it with
     `git apply --check` against a fresh copy of that tree.
   - Name the owned paths for one worker, and recommend timesheet-worker or
     timesheet-worker-high, with the reason.
   - Say whether `dist/` changes. If it does, name the gate items that must rerun.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-DIAG6`. Ports 50780-50819. Set TEMP, TMP,
  `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash. Use `powershell.exe -NoProfile -Command "..."` only for a read-only census,
  with its output redirected to a file in your task folder. Never use `-ExecutionPolicy` or
  `-File`.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `node -`, NO `python -c`, NO
  `python -`), NO PIPES INTO `head`, `tail` OR `cat`, NO `/dev/null`, `/dev/stdout`,
  `/dev/stdin`, `/dev/zero` OR `nul` (ALSO NOT IN `2>`), NO `rm -r`, NO PID KILLS, NO
  `Stop-Process`, NO `sed -i` (ALSO NOT ON SCRATCH FILES), NO INTERACTIVE SHELLS, NO FIFO
  WAITER SCRIPTS, NO `git init`, NO `ping`, `sleep` OR `tail -F` LOOPS AS WAITS.**
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
  - `handoff/delivery/evidence/WP5-UX5-DIAG6/`: masked LF `.txt` only. Save probe scripts
    as `*.ts.txt`, `*.mjs.txt` or `*.sh.txt`, and the patch as `proposed.patch.txt`.

  Do not touch FIX12's working-tree files. Do not stage or commit. Do not run `npm ci` or
  `npm install` in the repository.
- No basename may contain "signature" unless it also contains "synthetic". Write no email
  address except `@example.invalid`, no password literal, and no user profile path. Mask the
  profile path as `<user>`.
- Run nothing in the background that outlives your return. Leave no server, browser or
  Compose project behind.
- If a permission check denies a call, stop and report. Do not retry it in another form.
- Keep Results short and concrete. Finish with "Status: done".

Return at most 150 words, beginning 'Self-reported model: ...', with:
- the cause of each flake (test or product) and its evidence;
- the proposed fixes, with the repeat, load and mutant results;
- the census result;
- the history;
- `dist/` changed or not;
- the owned paths and the worker profile.

## Results

Planner: timesheet-planner (self-reported model claude-sonnet-5-5). Base HEAD = origin/main = 0f52300ca1ab7d458c30e7dbe1fb098d9c6dd955. The scratch export of the FIX12
working tree (`git archive` of HEAD, FIX12's five test files copied over, own `npm ci`) had digest bf7ec3f7c47ec97f84d51c9bb18d14945b8e303dcd2b732acee7cbb55d73653f
(882 files) before any probe (`digest-export.txt`); a fresh second copy used for `git apply --check` has the same digest. The repository was not changed apart from this
Results section and `handoff/delivery/evidence/WP5-UX5-DIAG6/` (`00-README.txt` indexes it; FIX12's five files are byte-equal to the scratch copies). Task folder
`D:\.claude-tmp\timesheet\WP5-UX5-DIAG6`. The fixtures bind OS-chosen free ports, so 50780-50819 applied only to SMOKE_PORT (no smoke run was needed).

**Verdicts.**
- `keyboard-access.spec.ts:267` is a TEST race on a correct product state. No product defect.
- `day-editor.spec.ts:5304` is a real PRODUCT race (narrow: an unsaved note can be lost silently). The test only exposes it. The fix is one hook in `DayFieldsForm.tsx` plus a
  deterministic regression test. **This changes `dist/`.**
- Neither is state carried between repeats. Each test makes its own account and browser context, and `--repeat-each=30` on ONE worker (one shared server, 30 repeats in a row)
  passed 30 of 30 for both. Both races exist in a single run too; extra workers and host load only change how often a poll or key lands in the window. Gates passed them in
  single runs on a quiet host (144 and 117 logs, item 6).

**1. `keyboard-access.spec.ts:267` (WP5-UX3-T04, check in/out group).**
- It asserts: after sign-in and `[data-day]` count 14, `button.focus()` then `toBeFocused()` (the failing logs stop at line 282: "Expected: focused, Received: inactive"), then Tab goes to
  "Previous period", Shift+Tab back to the button, Shift+Tab again into the top bar, and the group lies above the period card.
- Code path. `ClockButton` renders `disabled={running === undefined}` ("Checking your status") until `ClockProvider.resolve` has answered. `TimesheetScreen` reports the shown period
  (`reportView`) after the view is drawn; for a person with no running session `findRunningSession` then reads `/api/periods/current` and the other period's timesheet. So the button
  stays disabled for 10 to 56 ms AFTER the 14 days are drawn. `locator.focus()` has no enabled check (`focusNode` in Playwright 1.63), so on a disabled button it does nothing;
  `toBeFocused` then polls 7 s and nothing focuses the button again.
- Event record (page-side recorder in `probe-kbd.ts.txt`; `an-kbd-quiet.txt`, `run-kbd-quiet-11-3.txt`; same test body, 2 workers, 20 runs on a quiet host: 2 failed). Failing run: days
  drawn 258.9 ms, the test saw them at 262.8 ms, button enabled at 301.8 ms (window 42.9 ms). Passing run: enabled at 293.5 ms, the test saw the days at 373.8 ms. With the lookup
  delayed by a route (3rd and later `/api/periods/current` +300 ms): 5 of 5 failed (`an-kbd-late300.txt`).
- The ORIGINAL test, four ways (quiet host unless noted): single run 0 of 1; `--repeat-each=30 --workers=1` 0 of 30; `--repeat-each=30 --workers=2` 0 of 30 (FIX12 measured 13 of 30 on a
  busy host, 16 of 30 on HEAD); single run under the self-stopping burner (32 threads, 60 s) 0 of 1, and 10 repeats on 2 workers under a 120 s burner 0 of 10. A poll must land in a 10 to
  56 ms window, so the rate on a quiet host is low (about 2 of 20 with the recorder installed) and grows with host load. The deterministic form is the late lookup: the real test fails
  10 of 10 (`log-kbd-dly-orig.txt`). The 32-thread burner alone did not reproduce it, as in DIAG5.
- Product: not a defect. Disabled while the status is unknown is the documented behaviour (ClockPanel: "waiting while the first check is on its way instead of guessing"); a keyboard user who
  tabs in that window finds the button a moment later in the normal order.
- Fix (test only, state-based, nothing loosened): `await expect(button).toBeEnabled();` before `button.focus()` (3 lines with a comment).

**2. `day-editor.spec.ts:5304` (Escape and the Close button).**
- It asserts: open the Edit drawer, `fill` the Notes, press Escape, expect "Discard your changes?" (line 5340, "element(s) not found"); then Escape on the question keeps editing, and so on.
- Code path. `fill` fires `input`; `DayFieldsForm` computes `dirty` and reports it in a PASSIVE effect (`onDirtyChange?.(dirty)`, which is `DayEditor`'s `setFieldsDirty`). React 19.3.0 gives an
  update made inside a passive effect at best the default priority (`flushPassiveEffects`), so `DayEditor` re-renders in a LATER scheduler task, and only its own passive effect then
  sets `TimesheetScreen`'s `editorDirty` ref, which `requestClose` reads. An Escape handled before that task finds the flag false, `closeEditor()` runs at once, and the drawer closes with
  the note unsaved and no question.
- Event record (`probe-esc.ts.txt`, a MessageChannel turn posted at each input; `an-esc-quiet.txt`, `run-esc-quiet-10-0.txt`). Failing run 10: Notes `input` at 473.5 ms, Escape keydown at
  477.0 ms, editor closed at 481.2 ms with no question, the first task turn after the input only at 516.2 ms. Passing runs (19, `ranges-esc-quiet.txt`): the turn comes 0.6 to 0.9 ms after the
  input, the Escape 2.0 to 3.3 ms after the input, the question 6.3 to 9.5 ms after the Escape. Under 4x CPU throttling 20 of 20 closed unasked (`run-esc-t4-2.txt`: Escape 6.1 ms after the
  input, turn at 707.9 ms); under 10x 20 of 20 (`run-esc-t10-0.txt`: turn 183 ms after the input).
- The ORIGINAL test: single 0 of 1; `--repeat-each=30 --workers=1` 0 of 30; `--repeat-each=20 --workers=6` 0 of 20 (FIX12, busy host: 4 of 20 on the FIX12 tree, 2 of 20 on HEAD); single under the
  burner 0 of 1, 10 repeats on 2 workers under it 0 of 10; recorder probe on 2 workers 1 of 20; the REAL test with the main thread throttled 4x: 10 of 10 failed (`log-esc-dly-orig.txt`).
- How long the flag lags (original product, 10 runs per cell, `gap-orig-table.txt`; a pause between the keystroke and the Escape): 1x throttle: 0 ms 2 of 10, 15 ms and more 0. 4x: 0 ms 9,
  15 ms 1, 30 ms and more 0. 10x: 0 ms 10, 15 ms 10, 30 ms 9, 60 ms 6, 120 ms 0.
- User impact. On a quiet machine the lag is about 1 ms, below any human key interval. On a busy or slow page it reaches tens of ms (about 100 ms at 10x throttling): typing in the Notes and
  pressing Escape inside that time closes the drawer without "Discard your changes?" and the typed text is lost. U4-05 says unsaved edits are never dropped silently. Rare, but a data-loss
  class defect; the test is right. The other guard tests that `fill` then press a key or click share the race at lower odds; the product fix covers them.
- A test-only fix is not possible without a fixed sleep: no DOM state follows the ref, and the file's `settleFrames` ends in a 50 ms `setTimeout`.
- Fix (smallest product change, no UX or business decision): in `DayFieldsForm.tsx` use `useLayoutEffect` instead of `useEffect` for the dirty report (import line, one word, a 2-line comment).
  The report then reaches the ref before the keystroke's task ends (measured: item 4). The reason field (`DayEditor`'s own `dirty`) is already one hop and is not touched.
- Regression proof, deterministic and not a timing probe: new test "Escape dispatched in the same task as a keystroke in the Notes still asks "Discard your changes?"" (+35 lines). In one
  `evaluate` it sets the value through the native setter, dispatches `input`, then an Escape keydown, with no task turn between. On the ORIGINAL product it fails 10 of 10 (both projects,
  `log-new-prodorig2.txt`; the probe shows the editor closed and no question, `diag-probe-new-prodorig-t*-jsonl.txt`); on the fixed product it passes (`diag-probe-new-fixed-t*-jsonl.txt`).
  A first form that passed a string to `locator.evaluate` never ran the function; its runs were discarded and the typed form is the one proven.

**3. Real or test defect.** Keyboard: test defect. Day editor: product defect, narrow; the smallest fix is the one hook. No assertion is loosened, no case dropped, no timeout raised, no sleep added.

**4. Proof in the scratch export (FIX12 tree plus the fixes).**
- `--repeat-each=60`, 0 failed: keyboard 2 workers 60 passed, 6 workers 60 passed; Escape test 6 workers 60 passed, 2 workers 60 passed. New test, 30 repeats on both projects, 6 workers: 60 passed
  three times (the last with the final text, `log-new-final2-r30w6.txt`).
- Late lookup (+300 ms) on the real keyboard test: original 10 of 10 failed, fixed 10 of 10 passed (`log-kbd-dly-fixed.txt`). 4x throttling on the real Escape test: original 10 of 10 failed;
  fixed, real test plus new test, 20 of 20 passed (`log-esc-dly-fixed2.txt`). Flag-lag matrix on the fixed product (`gap-fixed-table.txt`): 0 of 10 in all 15 cells.
- One run under the self-stopping burner (32 threads, 45 s): keyboard 3 passed, Escape tests 4 passed (twice).
- Mutants against the fixed tests (the scratch export is restored byte-equal after each, `mutant-exits.txt`, `mutant2-exits.txt`): Check in button never enabled: the keyboard test fails at
  `toBeEnabled` ("Received: disabled"). Button removed from the tab order: it fails at the Shift+Tab `toBeFocused`. Escape inside the drawer does not close: the Escape test fails at
  "Escape closes at once" (line 5331) and the new test at the question (2 failed). Dirty never reported: the same two fail. Escape on the sheet does not close (document handler): the two named
  tests do not reach that handler and pass, the existing "Escape on a sheet control ..." tests fail (2 failed), so that mutant is still caught. The new test on the original product fails 10 of 10.
- Checks in the scratch export with the fixes: `npm run typecheck` exit 0, `npm run lint` exit 0 (`final-checks-exits.txt`; a first typecheck of an earlier text of the new test failed on DOM type
  names and was fixed), `npm test` 101 files and 2,388 tests passed (unchanged), `npm run build` exit 0, `git apply --check` and `git apply --check --whitespace=error` exit 0.
  Not run here: `npm run verify`, `git diff --check` in the repository (nothing is applied there).

**5. Repeat census** (fixed tree, real clock, `--repeat-each=3 --workers=6`, 2026-10-28 00:46 to 01:05 UTC; `census-summary.txt`).
- Desktop: 1,404 passed (468 tests x 3), 105 skipped, 0 failed, 10.5 min. Mobile: 1,218 passed (406 x 3), 291 skipped, 0 failed, 7.4 min. No test failed even once, so there is no new flaky test, no
  network or buffer error and nothing to rerun. The three fixed tests passed 3 of 3 on each project they run on (`census-flaky-tests.txt`). The census host was quiet (CPU load 8 percent when last sampled, 00:13 UTC),
  so the census shows the suite and the fixes are stable together; the deterministic proofs are the models of item 4.
- Sweep instant 2026-10-27T06:58:30Z through the FIX10 wrapper (`shiftclock.mjs`, AB8_SHIFT_MS -65173139), the three fixed tests, both projects, `--repeat-each=5 --workers=6`: 25 passed, 5 skipped
  (the keyboard test on mobile), 0 failed (`log-sweep-fixed.txt`).

**6. History** (`history.txt`). Both races are long-standing, introduced with their tests (83c32d2f 2026-10-15; b7cc0635 2026-10-20) over older code (disabled button 2026-10-08, lookup 2026-10-14);
none is new since a commit. 144 earlier desktop logs pass the keyboard test and 117 pass the Escape test with no recorded failure; failures exist only in FIX12 (busy host, repeat runs, one FULL run).

**7. Patch and scope.** `proposed.patch.txt`: 3 files, +42/-2, on top of the FIX12 working tree; `git apply --check` exit 0 against a fresh copy of that tree (`patch-check.txt`).
- Owned paths for ONE worker: `src/client/components/DayFieldsForm.tsx`, `tests/e2e/keyboard-access.spec.ts`, `tests/e2e/day-editor.spec.ts`, the worker's brief Results, and its evidence folder.
  FIX12's five test files stay untouched.
- Profile: timesheet-worker (medium). The edit is exact and proven; the product change is one hook. A fresh auditor must read the product change (React effect timing).
- `dist/` DOES change: all `dist/client` JS chunk hashes and `index.html` (the new main chunk is `index-C0DifRQQ.js`); `dist/server` is identical (`dist-compare2.txt`). Gate items to rerun:
  `npm run build` and the dist comparison, `npm run verify` (smoke), lint, typecheck, `git diff --check`, `npm test`, the real-clock FULL e2e on both projects (one new test: desktop 468, mobile 406
  per pass), the seven-file sweep-instant run, the digest, and an independent audit of the product change.

**8. Host.** Census at the start and the end (`census-start.txt`, `census-end.txt`). The earlier orphans (node 63092, 37448, 90528, 101148, bash 96332, waitfor 22240) were alive and untouched;
`load-quiet.txt` shows bash 22240 and node 90528 hold the most accumulated CPU time, with host CPU load at 8 percent. Of the 22 process IDs new at the end, 4 are the transient bash shells of the
census command itself and the rest are the owner's tools (JetBrains agents, agentmemory, the owner's Edge and webviews, an `npm run start` server); their command lines were read
(`new-proc-detail.txt`) and a later query found no process of this task (`own-proc-check.txt`). No server, browser, burner or Compose project of this task is left.

**9. Rule slips.** A few `| head` pipes in read-only listings, one `sleep` of 1 s and one of 20 s used once each as a short wait, and two uses of `/dev/null`. No PID was stopped, no git configuration changed,
nothing staged or committed, `npm ci` ran only in scratch exports. The slips did not affect any result.

Status: done
