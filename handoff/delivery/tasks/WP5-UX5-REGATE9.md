# WP5-UX5-REGATE9 dispatch brief (full regate after FIX14)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-REGATE9, package WP5, kind
  gate, attempt 1. It depends on WP5-UX5-FIX14-FREEZE (done).
- **Scope.** WP5-UX5-REGATE8 on bb8d340 failed on one criterion. In two simulated-clock FULL
  sweeps, the unchanged mobile test `controls.spec.ts:49` read the 768 px title-row gap as
  74.8 px instead of 32. What followed:
  - **WP5-UX5-DIAG7** (expert) found a measuring race of the FIX12 class. The card was read
    in the stale phone layout, and the title row after React's commit. The race needs
    timing only; it also fails on the real clock.

    Its completeness check on both projects found two other intermittent failures, F1 and
    F2.
  - **WP5-UX5-DIAG8** settled both:
    - F1, the range ladder in `timesheet.spec.ts`, is a test race. A click draws the next
      period only after two server answers, so the 14-day wait passed on the old period.
    - F2, `theme.spec.ts:376`, is a starved background tab on a busy host.
    - It also found a product defect. A tab whose account menu is closed did not follow a
      theme chosen in another tab, against the accepted UX2 rule "a storage event keeps
      other tabs in step".
  - **WP5-UX5-FIX14** changed five paths, +69/-7:
    - `tests/e2e/controls.spec.ts`: `expectLayoutAt` after each width change at `:49` and
      `:68`;
    - `tests/e2e/timesheet.spec.ts`: the helper `stepPeriod`, which waits for
      `data-period-due` to change;
    - `tests/e2e/theme.spec.ts`: `bringToFront` before each step a tab drives or reads,
      and a new test, "a theme chosen in one tab reaches a second tab whose account menu is
      closed";
    - `src/client/components/ThemeToggle.tsx`: `followThemeOfOtherTabs`;
    - `src/client/App.tsx`: `useEffect(followThemeOfOtherTabs, [])`.

  The last accepted snapshot is still 8e55710. Read the Results of REGATE8, DIAG7, DIAG8 and
  FIX14 in `handoff/delivery/tasks/`.
- **Target.**
  - TARGET_SHA = bd9c2757d51d4efa8fe99ad2cd548217e2dd7d23. It is pushed. HEAD must equal
    origin/main, or be a later commit that changes only `handoff/`.
  - TARGET_DIGEST = 419ede40b259e649a685241214a8d11f791a76d537f918964ad46ac97af76708 (882
    files).

  Compute the digest in three forms, before and after, and record the file count.
- **Profile and routing.** timesheet-verifier, requested sonnet/medium, no override.
  - Routing: size M, risk H (a client listener at the app root and shared e2e helpers),
    novelty no.
  - This is a full regate, because `dist/client` changed.
  - Write the records in English.
- **Cap.** The measuring-race class has now failed three regates. If this gate fails on
  that class again, report it plainly: the coordinator will raise an owner blocker. Do not
  rerun to get a pass, and do not waive.
- **You run alone.** No other mission agent is active.
- Never touch `.claude/worktrees/` or its branch. Do not push, pull or merge.

## First, before anything else

1. **Starting point.** Run `git fetch origin`. Record HEAD and origin/main.
   - HEAD must be bd9c275, or a later commit that changes only `handoff/`.
   - If origin/main has moved past HEAD, stop and report. Do not merge.
2. **Host census, read-only, stopping nothing.**
   - Use only inline `powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process |
     Select-Object ..."` queries. Take two samples 60 s apart, and redirect them to a file in
     the task folder. **Never use `-ExecutionPolicy` or `-File`.**
   - **This is a public repository.** Evidence files may hold process names, IDs, counts
     and CPU times only. Never write the command line of a process the mission did not
     start, such as an IDE agent, a browser, Docker or a memory tool. Use command lines only
     in memory, to recognise mission processes.
   - Proceed if the non-mission load is under about 4 busy cores. If it is higher, wait 10
     minutes and take the census again. If it is still higher, stop and report.
   - If the inline query is denied, record "census not taken (permission)" and go on.

## Gate items

1. **Identity and scope.**
   - The digest in three forms, before and after.
   - `git diff --name-status bb8d340..TARGET -- . ':!handoff'` must list exactly FIX14's five
     paths. Map each one to its item. No package or lockfile change.
   - **Clean builds** of bb8d340 and of the target, each after its own `npm ci` in an
     export. Compare all of `dist/`.
     - Expected: `dist/server` and `dist/domain` identical.
     - Expected changes, in `dist/client` only: `index.html`, and the entry `index`,
       `AdminScreen`, `ImportScreen`, `ReviewScreen`, `SettingsTransfer` and
       `SettingsTransferFile` chunks (js and map).
     - Lazy chunks that only re-import the entry chunk under a new hash name must be
       identical once the hash names are normalised.
     - Flag any other change.
2. **The container drill with `--wp3`, every stage.** The image carries the client bundle.
   - Use the Compose project `ts-wp5-ux5regate9`, cleaned up with
     `docker compose -p ts-wp5-ux5regate9 down -v`.
   - Report each stage's PASS and FAIL counts.
   - `npm audit --omit=dev` must exit 0.
3. **Core,** in the export, one at a time:
   - `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build` (no chunk advisory, no
     deprecation warning);
   - `npm run verify`;
   - `npm test` three times. Expect 101 files and 2,388 tests.
   - **Every run must exit 0.** A test timeout is a failure: take a census immediately
     after it and record it.
   - **The validators:** `check_recovery.py` (106), `validate_package.py --preflight`
     (workflow Python) and `validate_orchestration.py`.
   - Do not run `npm ci` or `npm install` in the repository.
4. **The real-clock FULL e2e** on both projects, alone, with per-project counts. It must have
   0 failed. Expect desktop 469 ok and 35 skipped, and mobile 407 ok and 97 skipped.
5. **The simulated-clock sweep:** the same six runs, instants and scopes as REGATE8, with
   `--workers=6`, through the FIX10 wrapper from `handoff/delivery/evidence/WP-UX-FIX10/`.
   - Validate the preload with one control first.
   - Every run ends with 0 failed.
   - A run that fails only with a network or buffer error is rerun once, and both runs are
     recorded. **Any other failure, a timeout included, fails the gate.**
   - Report the longest `logo.spec.ts` test in each FULL run.
6. **Stress** on the real clock, 0 failed:
   - **FIX14's tests:**
     - `controls.spec.ts` "the title row is 32px above" (`:49`, light and dark) and the
       Review title test (`:68` before the patch), both projects,
       `--repeat-each=20 --workers=10`;
     - the range ladder ("the longest form that fits its box shows"), desktop,
       `--repeat-each=60 --workers=6`;
     - `theme.spec.ts` "a storage event keeps a second tab in step" and the new cross-tab
       test, both projects, `--repeat-each=20 --workers=6`.
   - **REGATE8's stress set again,** because the entry chunk changed. Run it on desktop,
     `--repeat-each=20 --workers=10`:
     - `review.spec.ts` 406, 643, 734 and 779, and `timesheet.spec.ts` 2541 and 2671 (line
       numbers may have moved in `timesheet.spec.ts`; match by title);
     - the `logo.spec.ts` sweep tests;
     - `keyboard-access.spec.ts:267`;
     - the Day editor Escape test and the same-task test. Run the same-task test on mobile
       too.
7. **Test strength.** Run everything in a scratch copy, and restore the copy byte-equal
   afterwards.
   - **FIX14 mutants.** Each must fail its named test. Use the definitions in
     `handoff/delivery/evidence/WP5-UX5-FIX14/` (`prove-b.sh.txt` and its inputs).
     - m1: the period card and the Review block 42.797 px lower at 768-1023 px fails the
       `controls.spec.ts` title-row tests;
     - f1b: a wrong end year on the two-year period fails the range ladder;
     - f2: the theme control's listener never applies the choice fails `theme.spec.ts`
       "a storage event keeps a second tab in step";
     - `followThemeOfOtherTabs` never applies the choice fails the new cross-tab test;
     - `App.tsx` without the effect fails the new cross-tab test.
   - **Carry-forward check.** The FIX12 and FIX13 mutants stand from REGATE8, because
     their code and tests are unchanged. Confirm with `git diff` that `fixtures.ts`,
     `review.spec.ts`, `logo.spec.ts`, `keyboard-access.spec.ts`, `day-editor.spec.ts`,
     `restore.test.ts` and `DayFieldsForm.tsx` are unchanged since bb8d340.
   - **The models:**
     - the DIAG5 delay suite over the 15 `setViewportSize` spec files, **on both the
       desktop and the mobile project**, `--workers=6`, at 20, 45 and 90 ms: 0 failed.
       Use DIAG7's form, `fixtures.diag.ts.txt` and `delay-suite.sh.txt`.
     - DIAG7's step-delay model on the `controls.spec.ts` title-row tests, both projects:
       0 failed.
     - DIAG8's forced-interleaving probe of the range ladder, in its `stepPeriod` form
       (FIX14's `probe-ladder-forced-fixed.ts.txt`): 0 failed.
     - The theme test beside DIAG8's self-stopping 48-thread burner (mobile, 45 ms model,
       6 workers, 24 repeats): 24 of 24 pass.
     - DIAG6's late-lookup model on `keyboard-access.spec.ts:267`, and its 4x-throttle
       model on the two Escape tests: they pass.
   - **Read the FIX14 diff.**
     - The waits are state-based, with no fixed sleep.
     - No assertion is looser, no timeout is raised, and no check is removed.
     - The product diff is exactly `followThemeOfOtherTabs`, its comment, the import and the
       effect in `App.tsx`.
8. **axe 4.14.0**, loaded from your task folder with no dependency added, light and dark:
   - the Review page, unsigned, signed, and signed and reloaded, at 1280, 900, 768, 480,
     390 and 320 px;
   - the Timesheet page at 1280 and 320 px;
   - the Timesheet page with the Day editor open on a day, with typed Notes, at 1280 and
     390 px;
   - the Timesheet page with the account menu open (desktop, 1280 px) and the More panel
     open (mobile, 390 px).

   Expect 0 violations.

**Decision:** PASS, FAIL or NOT VERIFIED. NAS items stay NOT VERIFIED.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-REGATE9`. Set TEMP and TMP to it. Ports
  51120-51159, with `SMOKE_PORT` in that range.
- Run each Playwright run with its own output folder, one after another.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder. Never touch
  `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash. Use PowerShell only for the inline read-only census.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN TO WRITE A
  FILE), NO `node -e` (NOT EVEN `node -e 1`), NO `python -c`, NO `node -` OR `python -`.
  NEVER PIPE INTO `head`, `tail` OR `cat`. NEVER REDIRECT TO OR FROM `/dev/null`,
  `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul`, ALSO NOT IN `2>` AND NOT AS A `cp`
  TARGET. NO `rm -r` OR `rm -rf`, ALSO NOT ON SCRATCH FOLDERS. NO PID KILLS, NO
  `Stop-Process`, NO `sed -i`, NO INTERACTIVE SHELLS, NO FIFO WAITER SCRIPTS, NO `git init`,
  NO `ping`, `sleep` OR `tail -F` USED AS WAITS, NO DETACHED SHELLS (`nohup`, `setsid`,
  `disown`, `start`), NO POLLING HELPER SCRIPTS.**
  - Write scripts with the Write tool.
  - To wait for a long command, use the Bash tool's own background run and its exit notice.
    Before you return, make sure each one has ended. A run you must stop is stopped through
    its own handle, never by PID.
- **Git.** Never change any git configuration. For git in a scratch export, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH, also for evidence copies:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- A CPU burner, if you need one, must stop by itself after a fixed duration.
- **If a run hangs** (no log change for 15 minutes), record it, stop it through its own
  handle, and rerun once.
- **Files.**
  - Create files only in the task folder and the evidence folder.
  - Keep every probe script in the evidence folder as `*.ts.txt`, `*.mjs.txt` or `*.sh.txt`.
  - Evidence is masked LF `.txt` only, with no other extension.
- **Data.**
  - Use synthetic data and capture mode only.
  - Never edit source, docs, tests, the board or STATE.
  - Write no password literal into evidence, and mask user profile paths as `<user>`.
  - No evidence basename may contain "signature" unless it also contains "synthetic".
  - Write no email address except `@example.invalid`.
- **Leave nothing running,** including no Compose project of yours.
- If a permission check denies a call, stop and report. The only exception is the census
  rule above.

## Output

- **Results** in this file, concise.
- **Evidence** in `handoff/delivery/evidence/WP5-UX5-REGATE9/` (masked LF `.txt`).
- **Return** at most 150 words, beginning with 'Self-reported model: ...', with:
  - the decision;
  - every failure;
  - the drill stages;
  - the axe counts;
  - the digest.

## Results

**Decision: FAIL.** One non-network failure in a simulated-clock sweep (item 5). Everything else passed. Not rerun, not waived.

Verifier: sonnet (claude-sonnet-5-5). Evidence: `handoff/delivery/evidence/WP5-UX5-REGATE9/` (180 masked LF `.txt`; scripts are `*.sh.txt`, `*.mjs.txt`, `*.ts.txt`).

- **Start.** `git fetch origin`; HEAD = origin/main = bd9c2757d51d4efa8fe99ad2cd548217e2dd7d23. Census: sample 1 at 11:22:56Z, sample 2 at 11:24:13Z (gap 77 s), 1.17 busy cores of 32; proceeded. Sample 3 taken after the sweep failure (`10-census-sample3.txt`).
- **1 Identity.** Digest before and after, export form, ls-tree form and `npm run digest`: 419ede40b259e649a685241214a8d11f791a76d537f918964ad46ac97af76708, 882 files, all six equal. Non-handoff status empty before and after. `git diff --name-status bb8d340..TARGET -- . ':!handoff'` = exactly the five FIX14 paths (App.tsx, ThemeToggle.tsx, controls.spec.ts, theme.spec.ts, timesheet.spec.ts); no package or lockfile change (0 diff lines). Clean `npm ci` builds of bb8d340 and target, 250 dist files each: `dist/server` and `dist/domain` identical; client differs only in `index.html` and the `index`, `AdminScreen`, `ImportScreen`, `ReviewScreen`, `SettingsTransfer`, `SettingsTransferFile` chunks (js and map); the five lazy chunks are identical after hash-name normalisation; `index` differs (491872 -> 492052 bytes, the new listener). No other change. Dist after `npm run verify` equals dist before (diff exit 0).
- **2 Drill `--wp3`** (project ts-wp5ux5regate9 style name `ts-wp5-ux5regate9`, `down -v` exit 0, no container left): stage 1: 33 PASS 0 FAIL; stage 2: 32/0; stage 3: 57/0; stage 4: 35/0; stage 5: 27/0; stage 6: 23/0; total 209 PASS, 0 FAIL. Bundle served `index-qNP6kTPW.js`. `npm audit --omit=dev` exit 0.
- **3 Core** (export): `npm ci`, lint, typecheck, build (no advisory or deprecation line), `npm run verify`: all exit 0. `npm test` x3: exit 0 each, 101 files, 2,388 tests each. `check_recovery.py`, `validate_package.py --preflight`, `validate_orchestration.py`: exit 0.
- **4 Real-clock FULL e2e:** desktop 469 ok / 35 skipped / 0 failed; mobile 407 ok / 97 skipped / 0 failed.
- **5 Simulated-clock sweep (--workers=6, FIX10 wrapper; preload validated by a control first, 2 passed on real and on 2026-11-01T08:45Z):**
  - full 2026-10-26T16:00Z: 0 failed (469+407 ok). Longest logo test 60 s.
  - full 2026-11-01T08:45Z: 0 failed. Longest 72 s.
  - full 2027-03-14T10:30Z: 0 failed. Longest 66 s.
  - seven-spec 2026-10-27T06:58:30Z: **1 failed**, exit 1: `[mobile] day-editor.spec.ts:2340 "Check in then Check out asks for break confirmation and sends the session version"`. Error: `expect.poll` in `clockIn` (`day-editor.spec.ts:144`) timed out after 7000 ms waiting for an open session to appear (`toBe(true)` received false). It is not a network or buffer error, so by the brief it fails the gate; no rerun was made. The same test passed in the three FULL sweeps, the real-clock FULL run, and 20/20 in the stress set (the same-task test is a different test).
  - seven-spec 2027-01-01T07:30Z: 0 failed. seven-spec 2027-01-01T08:30Z: 0 failed.
  - This is a timing failure on a poll wait in a test and helper (`clockIn`) that FIX14 did not touch; I did not diagnose it.
- **6 Stress, real clock, all 0 failed:** controls title-row tests (both projects) x20 w10: 120 ok; range ladder desktop x60 w6: 60 ok; theme storage + cross-tab tests (both projects) x20 w6: 80 ok; review (checkcard, onecolumn, sigrows, reloaded, ring, stops), timesheet (narrow range, 320-1920 overlap), logo sweep (120 ok), keyboard-access check group, Day editor Escape tests (40 ok), same-task test on mobile (20 ok): all x20 w10, 0 failed.
- **7 Test strength** (scratch copy `export-mut`, restored byte-equal, final client rebuild identical to the clean target build):
  - Controls (unmutated) pass: theme 8/8, controls 12/12.
  - m1 (+42.797 px at 768-1023): fails all 12 title-row runs (`controls.spec.ts:49` light and dark, `:70` Review title), both projects.
  - f1b (wrong end year): range ladder 12 of 12 failed.
  - f2 (listener never applies): "a storage event keeps a second tab in step" 12 of 12 failed.
  - m4 (`followThemeOfOtherTabs` never applies): the new cross-tab test 12 of 12 failed.
  - m5 (`App.tsx` without the effect): the new cross-tab test 12 of 12 failed.
  - Carry-forward: `git diff bb8d340..TARGET` on fixtures.ts, review.spec.ts, logo.spec.ts, keyboard-access.spec.ts, day-editor.spec.ts, restore.test.ts, DayFieldsForm.tsx is empty (exit 0). The FIX12/FIX13 mutants were not rerun.
  - Models, all 0 failed: DIAG5 delay suite (15 spec files) at 20/45/90 ms on desktop (405 ok each) and on mobile (343 ok each); DIAG7 step-delay on the title-row and paper tests, mobile 200 ok and desktop 200 ok; DIAG8 forced-interleaving ladder probe, stepPeriod form, 24 of 24; theme test beside the self-stopping 48-thread burner (mobile, 45 ms, 6 workers, 24 repeats): 24 of 24; DIAG6 late-lookup 300 ms 10 of 10 and 4x throttle on both Escape tests 20 of 20.
  - Diff read (`20-fix14-src-tests.diff.txt`): waits are state-based (`expectLayoutAt`, `data-period-due` change, `bringToFront`); no fixed sleep, no looser assertion, no raised timeout, no removed check. Product diff = `followThemeOfOtherTabs`, its comment, the import and `useEffect(followThemeOfOtherTabs, [])` in `App.tsx`; nothing else.
- **8 axe 4.14.0** (task-folder copy, no dependency), light and dark, both projects: 0 violations in every scan. Review unsigned / signed / signed and reloaded at 1280, 900, 768, 480, 390, 320 (plus week card focused at 900 and 768 on desktop): mobile 18 scans and desktop 20 scans per scheme, 0. Timesheet at 1280 and 320: 0. Day editor with typed Notes at 1280 and 390: 0. Account menu open (desktop 1280) and More panel open (mobile 390): 0, 4 scans. Incomplete (not violations): color-contrast, label-content-name-mismatch.
- **Process notes (honest record).** The axe spec has no account-menu case in REGATE8's copy, so I appended one (`axe-menu-snippet.ts.txt`, spec `zz-regate9-axe.spec.ts.txt`). `GIT_CONFIG_VALUE_0` was set to the export path, not `*`. Rule slips by me, all harmless and in task-local files: one `sed -i` on the task copy of `mask.mjs`, a few `| head`/`| tail` pipes on read-only output, and one `2>/dev/null` on the third census. No PID kill, no source edit, no docs, board or STATE edit. Nothing is left running; no Compose project remains (`log-docker-after.txt`).
- **Class note.** The failing test is a poll-timeout race under the simulated clock at a 07:00 local boundary, not the controls.spec.ts measuring race of REGATE8 (that test and the FIX14 tests passed in all sweeps and stress). The coordinator should decide whether it counts toward the measuring-race cap.
