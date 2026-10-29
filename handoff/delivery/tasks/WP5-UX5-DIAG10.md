# WP5-UX5-DIAG10 dispatch brief (the import commit timeout under host load)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-DIAG10, package WP5, kind
  diagnose, attempt 1.
  - It answers the failed gate WP5-UX5-REGATE11, and depends on the last freeze,
    WP5-UX5-FIX16-FREEZE (1fe5ad3).
  - It is read-only for the repository.
- **Profile and routing.** timesheet-planner (effort high, fixed by the profile); requested
  model sonnet; no override.
  - Routing: size S, risk M, novelty no. docs/08 row "Plan/diagnose a bounded issue".
  - Write the task record in English.
- **You run alone.** No other mission agent is active. Run one heavy command at a time.

## The failure

- **What failed.** REGATE11 ran on 1fe5ad3 / 18aa0ad0 and failed on one criterion only, in
  the FULL sweep at 2026-11-01T08:45Z with `--workers=6`.
  - The test was the desktop `tests/e2e/import.spec.ts:102`, "upload, preview with source
    cells, decide, confirm and commit; the same workbook is already imported".
  - The error was "Test timeout of 30000ms exceeded", while waiting for
    `[data-import-notice="committed"]` after Confirm import. The test ran 38.0 s.
  - On mobile, in the same run, the test passed in 6.5 s. It also passed in the real-clock
    FULL run.
  - FIX16 did not touch the import code.
- **The host.** The census at the start of REGATE11 showed 6.4 and 5.98 busy cores of
  non-mission load, above the gate's 4-core limit; the owner's own compute processes took
  about 2 cores each. The census right after the failing run showed 6.71.

  The gate's rule was to proceed only under about 4 busy cores. The verifier went on after
  a short sample. Read `handoff/delivery/evidence/WP5-UX5-REGATE11/10-census-calc-*.txt`.
- **History.** REGATE5 failed on a slow logo test under load. DIAG4 and FIX10 made the
  slowest tests cheaper. Read `handoff/delivery/tasks/WP5-UX5-DIAG4.md`.

## Read

- `handoff/delivery/tasks/WP5-UX5-REGATE11.md`, Results item 5. In its evidence folder:
  - `log-sweep-full-1101.txt`;
  - the census files;
  - the trace path in that log. The trace itself is in
    `D:\.claude-tmp\timesheet\WP5-UX5-REGATE11\`. Read it there; do not copy it.
- `tests/e2e/import.spec.ts` around line 102, and its helpers.
- The import path: the commit endpoint, its transaction, any job it starts, and the notice
  the page shows.
- The FULL and sweep logs of REGATE5 to REGATE11, in their evidence folders.
- `handoff/delivery/tasks/WP5-UX5-DIAG4.md` and `WP5-UX5-FIX10.md`.

## Base

- HEAD = origin/main = 1fe5ad3075fd4d1b94abe5b8be04ed05729b05c2, or a later commit that changes
  only `handoff/`. The digest is
  18aa0ad0f99fbab18ae535d8b36375b756469a717e08b675a1e5d93d7459267c.
- Probe in a scratch export of HEAD made with `git archive`, with its own `npm ci`.

## Questions to answer

1. **The margin.**
   - Collect the duration of `import.spec.ts:102` on both projects from every gate log you
     can find: the real-clock FULL runs and the sweeps of REGATE5 to REGATE11.
   - Give the median, the 95th percentile and the maximum, against the 30 s limit.
   - Do the same for the other tests of `import.spec.ts`.
2. **Where the 38 s went.** Use the failed run's trace. Split the time between:
   - the upload;
   - the preview;
   - the decisions;
   - the Confirm request and its server answer;
   - the wait for the notice.
   Say whether the server was slow (a lock, a long transaction, a job), whether the browser
   was starved, or whether something hung.
3. **Reproduce under controlled load.** Use a self-stopping CPU burner sized to:
   - about 4 busy cores, the gate's limit;
   - about 7 busy cores, as observed.

   Run the test on desktop at the 2026-11-01T08:45Z instant and on the real clock, with
   `--workers=6` and enough repeats for a rate. Does it time out at 4 cores, or only at
   about 7?
4. **Verdict.** Classify the failure as one of:
   - **a real product slowness or hang** in the import commit that a user could meet. Give
     the evidence and the smallest product fix. If it needs a business decision, stop at the
     description and report it as a finding;
   - **a test that waits for the wrong thing**, or does needless work. Give the smallest
     test fix, with no raised timeout, no sleep and no loosened assertion;
   - **an over-loaded host only.** The test is fine within the gate's 4-core limit. Then no
     fix is needed.
5. **Other tests near their limit.** From the same logs, list every e2e test whose 95th
   percentile is above about one third of its timeout. Say which of them time out in your
   4-core load run. Recommend fixes only for those that do.
6. **The gate procedure.** The brief's rule was "wait 10 minutes", which the no-sleep rule
   forbids. Say whether "stop and report when the non-mission load is above 4 cores, and let
   the coordinator retry later" is enough. Say whether 4 cores is the right limit, given
   your load runs.
7. **Fix and regate scope.**
   - If a fix is needed, give the file, the line and the exact edit as
     `proposed.patch.txt`. Prove it under the load that reproduces the failure, and add a
     mutant.
   - Give the regate scope.
   - Give the owned paths and the worker profile.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-DIAG10`. Set TEMP and TMP to it. Ports
  51490-51529, with `SMOKE_PORT` in that range. Set `DATA_DIR` and `DATABASE_PATH` inside the
  task folder. Never touch `%LOCALAPPDATA%\timesheet-dev` or `.claude/worktrees/`.
- Run each Playwright run with its own output folder, one after another.
- **Host census.** Read-only, stopping nothing.
  - Use only inline `powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process |
    Select-Object ..."` queries, redirected to a file in the task folder. Never use
    `-ExecutionPolicy` or `-File`.
  - **This is a public repository.** Evidence may hold process names, IDs, counts and CPU
    times only. Never write the command line of a process the mission did not start.
  - Take the census before each load run. Your controlled load must be added to a known
    baseline. If the non-mission load is above about 2 busy cores before a run, record it
    and judge that run with care.
- Use Git Bash. Use PowerShell only for the inline census.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY ONES),
  NO `node -e` OR `node -p` (NOT EVEN `node -e 1`), NO `python -c`, NO `node -` OR
  `python -`. NEVER PIPE INTO `head`, `tail` OR `cat`. NEVER REDIRECT TO OR FROM
  `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul`, ALSO NOT IN `2>` AND NOT AS
  A `cp` TARGET. NO `rm -r` OR `rm -rf`, ALSO NOT ON SCRATCH FOLDERS. NO PID KILLS, NO
  `Stop-Process`, NO `sed -i`, NO INTERACTIVE SHELLS, NO FIFO WAITER SCRIPTS, NO `git init`,
  NO `ping`, `sleep` OR `tail -F` USED AS WAITS, NO DETACHED SHELLS (`nohup`, `setsid`,
  `disown`, `start`), NO POLLING HELPER SCRIPTS. NO TRAILING `&` INSIDE A BACKGROUND RUN.**
  - Write scripts and files with the Write and Edit tools.
  - Read outputs with the Read tool.
  - To wait for a long command, use the Bash tool's own background run and its exit notice.
    Before you return, make sure each one has ended. Stop a run only through its own handle,
    never by PID.
- **Git.** Never change any git configuration. For git in a scratch export, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH, also for evidence copies:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- Any CPU burner must stop by itself after a fixed duration.
- **Repository writes.** Change nothing in the repository except:
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-DIAG10/`: masked LF `.txt` only. Save probe scripts
    as `*.ts.txt`, `*.mjs.txt` or `*.sh.txt`, and any patch as `proposed.patch.txt`.

  Do not stage or commit. Do not run `npm ci` or `npm install` in the repository. Every file
  you write ends with exactly one newline.
- **Data.**
  - Use synthetic data only.
  - No file name may contain "signature" unless it also contains "synthetic".
  - Write no email address except `@example.invalid` and no password literal.
  - Mask user profile paths as `<user>`.
- Leave nothing running: no server, browser or Compose project.
- If a permission check denies a call, stop and report. Do not retry it in another form.
- Keep Results short and concrete. Finish with "Status: done".

## Return

At most 150 words, beginning 'Self-reported model: ...', with:

- the margin figures;
- where the 38 s went;
- the load results at about 4 and about 7 cores;
- the verdict;
- other tests near their limit;
- the gate-procedure answer;
- any fix, with its proof;
- the regate scope;
- the owned paths and the worker profile.

## Addendum 1 (coordinator, 2026-10-28, after the first result)

- **Accepted:**
  - The verdict is accepted: a test that drives a tab Chromium has put behind, exposed by
    a saturated host. It is not a product slowness.
  - `proposed.patch.txt` for `import.spec.ts` is accepted, with its proof.
  - Your gate-procedure answer is accepted. Future gates stop and report at the entry
    census. They also classify a timeout from its trace.
- **Why one more step.** This is the second time the "tab behind" class has failed a gate:
  first `theme.spec.ts` (DIAG8), now `import.spec.ts`. The owner's host reaches saturation
  on its own. Prove the class closed rather than sampling it.
- **The three other two-tab tests:**
  - `today.spec.ts:641`;
  - `logo.spec.ts:489`;
  - `controls.spec.ts:699`.

  For each of them:
  1. Say whether a step drives or reads a page that is not in front.
  2. Run it under the same self-stopping 48-thread burner, 12 repeats, on each project
     where it runs. For `today.spec.ts:641`, run it at an instant where it takes its normal
     branch, and also once where it crosses the midnight.
  3. If it fails, or slows to more than half of its limit, extend `proposed.patch.txt` with
     the same pattern: `bringToFront` before each step on a page that may be behind. Prove
     the extended patch under the same load, with a mutant.
  4. If it neither fails nor slows like that, record why it is safe. For example, it does
     not act on the tab behind, or it waits only on the tab in front.
- **Also check** `git grep` for every `newPage(` and `context().newPage` in `tests/e2e/`. Say
  whether any other test drives two pages.
- **Outputs.**
  - Update `proposed.patch.txt` if it changes. Run `git apply --check` in a fresh export.
  - Add an "Addendum 1 results" part at the end of Results.
  - Update the owned paths and the regate scope if they change.
  - Keep this within about 90 minutes of runs.
- The same runtime rules apply: no `sleep`, no `rm -r`, no `/dev/null`, no pipes into
  `head`. Every file ends with exactly one newline. Return at most 100 words, beginning
  'Self-reported model: ...'.

## Results

Expert: timesheet-planner, self-reported model claude-sonnet-5-5. Base: HEAD = origin/main = 1fe5ad3075fd4d1b94abe5b8be04ed05729b05c2; nothing outside `handoff/` was changed. Every probe ran in a scratch `git archive` export with its own `npm ci` (Node 24.21.0); its 250 `dist/` files equal the REGATE11 target build (`12-scratch-build.txt`). The failed run's trace was read in place and not copied. Evidence: `handoff/delivery/evidence/WP5-UX5-DIAG10/` (index `00-README.txt`, masked LF `.txt`).

**Verdict: a test defect that a saturated host exposes (class 2). Not a product slowness or hang. A one-file test fix is needed and proven: `proposed.patch.txt`, 9 lines added to `tests/e2e/import.spec.ts`.**

- The test opens a second tab and then goes on driving the first one while it is behind. Chromium runs the renderer of a tab behind at Windows idle priority (base priority 4; the tab in front 8; `40-tab-priority.txt`). When the host is nearly saturated that renderer starves for seconds, while the tab in front answers at once.
- At the gate's 4-core limit, and at 7, nothing fails (item 3). The failure needs a nearly saturated host. The owner's compute jobs produce one at times: in this session the host went from 3 to 27 busy cores within 25 minutes with nothing started by me. A gate cannot promise a calm host, so the test should not need one.

### 1 The margin (`10-margin-gates-5-to-11.txt`, `11-margin-gates-6-to-11.txt`, `13-margin-all-evidence-logs.txt`)

REGATE5 to REGATE11: the real-clock FULL run of each project, the full sweeps and the seven-spec sweeps (58 logs; the seven-spec sweeps do not contain this file). Limit 30 s; nearest-rank percentiles.
- `import.spec.ts:102`, desktop, 29 samples (7 real-clock, 22 sweeps): median 2.6 s, p95 3.8 s, max 38.0 s (the failure; the next largest is 3.8 s). Real-clock runs 1.8 to 2.4 s; sweeps median 2.7 s. The margin is 11.5 times the median and 7.9 times the p95; the failed sample is 14.6 times the median.
- Mobile, 29 samples: median 3.3 s, p95 6.3 s, max 6.5 s (that max is in the failing sweep).
- Other tests of the file, desktop, median / p95 / max: 21st preview 1.7 / 2.3 / 3.1; imported period 1.9 / 2.5 / 3.8; another user 1.3 / 1.9 / 2.2; wrong file 1.4 / 1.7 / 2.1; Import entry 1.0 / 1.7 / 1.7; opening balance without evidence 1.6 / 2.4 / 2.5; **opening balance (the other two-tab test) 2.9 / 4.3 / 14.7**. Mobile: all max 6.5 s or less.
- The 14.7 s sample and the 6.5 s mobile sample are in the same sweep as the failure (REGATE11 at 2026-11-01T08:45Z): the second two-tab test of the file was slow in the same minutes.
- All 295 evidence logs of the repository that hold the test: desktop 282 samples, median 1.9 s, p95 3.7 s, one failure (this one); the four other samples over 10 s are three DIAG7 delay-model runs and one older real-clock FULL (10.9 s).

### 2 Where the 38.0 s went (the failed run's trace: `20-` to `24-failed-test-*.txt`)

| phase | from (ms) | length (ms) |
|---|---|---|
| fixtures, sign-in, open Import | 0 | 1,747 |
| upload (set file, click, "created" notice) | 1,747 | 174 |
| preview checks, defaults of the decisions, screenshot | 1,922 | 436 (screenshot 256) |
| a second tab built for the replay: create, load, upload, decision, Review (5 actions) | 2,367 | 653 |
| decision on the first tab: `Check` import for the cache day (line 163) | 3,024 | 3,978 |
| `Click Review and commit` (line 164) | 7,002 | 10,019 |
| confirmation summary, Back, focus, Review again (lines 167 to 173) | 17,023 | 1,612 |
| `Click Confirm import` (line 174): the request is never sent, the notice is never reached | 18,635 | 11,376, to the 30.0 s limit |
| teardown: closing the context | 30,011 | 7,974 |

- The test used its 30.0 s limit plus 8.0 s of teardown for the context with the starved tab: that is the 38.0 s.
- **Server: not slow.** The browser sent 36 requests, the last at 2.9 s; the slowest took 245 ms (`24-`). **No commit request was ever sent.** In the one 32-thread trace where it was sent, `POST /commit` took 3 ms (`34-`). The commit is one synchronous SQLite transaction and starts no job.
- **Browser: starved, not hung.** Every action on the tab in front took under 0.2 s. On the tab behind, the snapshot before `Check` came after 1.5 s and the Review click spent 8.8 s in `performing click action` before the browser answered. After Review the page drew again and the next steps ran at normal speed until the next click.
- Same signature in 23 of 23 failed runs under 32 and 48 burner threads: second-tab steps 0.3 to 0.8 s in all, first-tab steps 20 to 40 s (`31-`, `33-`).

### 3 Controlled load (the original file; the commit test; desktop; `--workers=6`; `60-dose-table.txt`)

| run | clock | burner threads | busy cores before the run: total (all but the burner + burner) | runs | failed | median / max (s) |
|---|---|---|---|---|---|---|
| e0 | sim | 0 | 3.1 (3.1 + 0) | 24 | 0 | 3.4 / 3.8 |
| c4r | real | 1 | 3.1 (2.2 + 1.0) | 24 | 0 | 4.0 / 4.3 |
| c4nr | real | 2 | 4.8 (3.0 + 1.9) | 24 | 0 | 3.4 / 3.8 |
| c7r | real | 4 | 5.8 (2.2 + 3.6) | 24 | 0 | 3.6 / 3.8 |
| c7s | sim | 4 | 6.4 (2.5 + 3.9) | 24 | 0 | 3.7 / 4.1 |
| e4 | sim | 1 | 6.6 (5.7 + 1.0) | 30 | 0 | 3.4 / 3.5 |
| c4s | sim | 1 | 7.5 (6.4 + 1.1) | 24 | 0 | 4.3 / 4.7 |
| c4n | sim | 2 | 8.0 (5.9 + 2.1) | 24 | 0 | 3.3 / 3.9 |
| m4o, whole suite | sim | 2 | 4.6 at the start; 22.5 to 27.3 in total mid-run | 13 desktop, 13 mobile | 0 | 3.5 / 3.8, 3.9 / 4.5 |
| d16 | sim | 16 | 25.6 (7.2 + 18.4) | 24 | 0 | 4.9 / 5.7 |
| d24 | sim | 24 | 24.0 (7.2 + 16.9, burner still ramping) | 24 | 0 | 11.2 / 23.5 |
| d32 | sim | 32 | 22.8 (1.4 + 21.4, burner still ramping) | 24 | 11 | 21.9 / 37.9 |
| e48o | sim | 48 | not taken | 24 | 12 | 22.2 / 46.3 |

- **About 4 busy cores: 0 failures. About 7 busy cores: 0 failures.** Clean runs: 3.1 (c4r), 4.8 (c4nr), 5.8 (c7r), 6.4 (c7s) busy cores in total before the run; the owner's jobs added up to 6 more cores to e4, c4s and c4n (6.6, 7.5, 8.0). The mixed run (the whole suite on both projects plus 12 copies of the import spec) started at 4.6; the owner's jobs (`real8*.exe`, 7 to 12 cores) then raised the non-mission load to about 10 to 14 cores (22.5 to 27.3 busy cores in total with the six workers and my two burner threads): 1,068 passed, 0 failed, 10.6 min (`50-`).
- Failures begin at saturation: 16 burner threads 5 s; 24 threads 3.6 to 23.5 s, all pass; 32 threads 11 of 24 fail; 48 threads 12 of 24 fail (all of the first window). The slowdown is a curve, then a cliff, and it is the curve of a tab behind.
- I could not reproduce the REGATE11 failure at its own measured load (1.8 to 6.7 busy cores in that session). Its cause is shown by the trace (item 2), by the same signature under saturation, and by the fix (item 7), not by a rate at 7 cores. A transient spike on that host is the likely trigger.

### 4 Verdict

Class 2: the test waits on a tab that Chromium has put behind; the host overload is the trigger and the test turns 3 s into a timeout. It is not class 1: the server and the product were never slow and no commit request was sent. It is not class 3 alone: two tests of this file (and `theme.spec.ts` in DIAG8) share the defect, the owner's host regularly carries 10 or more cores of its own work, and the fix is 9 lines.

### 5 Other tests near their limit (`10-`, `11-`)

REGATE6 to REGATE11 (the code after DIAG4 and FIX10; 28,259 timed samples; limits from `test.setTimeout` in the HEAD source, else 30 s). Four tests have a p95 above one third of their own timeout; none is close to its limit:
- desktop `classic-scrollbar.spec.ts` "one window size gives one layout": p95 45.4 s of 120 s, max 45.7 s;
- desktop `timesheet.spec.ts` "a batch-selected column is lifted": p95 32.5 s of 90 s, max 35.7 s;
- desktop `review.spec.ts` "the review shows the server content for all 14 days": p95 10.3 s of 30 s, max 10.6 s (mobile p95 8.3 s);
- mobile `day-editor.spec.ts` "U4-15 at 390": p95 10.1 s of 30 s, max 10.9 s.

Eighteen tests had one sample above one third of their timeout, nearly all in the loaded REGATE11 sweeps; the largest are desktop `settings-transfer.spec.ts` "the preview dialog is accessible in both themes" 20.1 s, mobile `day-editor.spec.ts` "U4-15 at 1440" 17.5 s, desktop `day-editor.spec.ts` "changing the input zone of a saved session" 15.5 s, `import.spec.ts:291` 14.7 s, `hover.spec.ts` 13.2 s, `review.spec.ts` "the Preview week cards" 12.7 s. With REGATE5 added (`10-`) the older heavy tests show too (day-editor U4-12 and U4-13, logo); DIAG4 and FIX10 made them cheaper.
- **None of them timed out in my loaded runs.** In the mixed run only `classic-scrollbar` (41.6 s of 120 s) was above one third of its limit; 1,068 passed, 0 failed (`50-`). **No fix is recommended for any other test.**
- The other tests that open a second tab: `theme.spec.ts` (fixed in DIAG8), `today.spec.ts:641` (only in the run that crosses the midnight; limit 240 s), `logo.spec.ts:489` and `controls.spec.ts:699` (a separate page). None has a sample near its limit.

### 6 The gate procedure

- **"Stop and report when the non-mission load is above 4 cores, and let the coordinator retry later" is enough as the entry rule.** It needs no wait and no sleep. It is not enough as the only guard:
  - The load moves in minutes. REGATE11 measured 1.6 to 6.7 busy cores in one session; mine moved between 3 and 27 within 25 minutes. A sample at the start says nothing about a 12-minute sweep.
  - 4 is not where tests begin to fail. There were 0 failures at 3 to 8 non-mission busy cores (the owner's jobs plus my burner, measured before each run) in 198 runs of the commit test, and none in the mixed run at about 10 to 14 non-mission cores. The commit test is 1.4 times slower with 16 burner threads. Failures begin when the total demand passes the 32 logical cores (24 burner threads pass, 32 fail).
- **Is 4 the right limit?** It is safe and conservative; about 8 is as safe on this host with 6 workers. Do not let the figure decide a verdict afterwards: record the census at the start, at the end and right after any failure (REGATE11 did the last), and classify a timeout from its trace. Fast steps on the tab in front and no request sent mean host starvation of a tab behind; a slow server answer would be a product matter.

### 7 Fix and regate scope

- **Fix** (`proposed.patch.txt`; `tests/e2e/import.spec.ts`; 9 lines added, none removed). A step that drives a tab brings it to the front first, as `theme.spec.ts` has done since DIAG8:
  - the commit test: `await page.bringToFront()` before the first action on the first tab after the second tab was used (line 163); `await second.bringToFront()` before the replay's Confirm import; `await page.bringToFront()` before the replay's upload;
  - the opening-balance test: `await page.bringToFront()` before `review.click()`; `await second.bringToFront()` before the second tab's Confirm and post; `await page.bringToFront()` after `second.close()`;
  - two short comments. Steps, assertions, budgets and polls are unchanged; no timeout is raised; no sleep.
- Not chosen: a longer timeout (excluded; it only lengthens the stall); a second browser context (DIAG4: contexts scale) instead of a second tab, which changes what the test holds and is a larger edit.
- **Proof under the reproducing load** (48-thread self-stopping burner, `--workers=6`, preload 2026-11-01T08:45Z, 12 repeats of each of the two tests; `70-fix-proof-by-test.txt`, `70-fix-proof-summary.txt`, `log-run-*`):

  | project | original (commit test / opening balance) | with the fix (commit test / opening balance) |
  |---|---|---|
  | desktop | 7 of 12 fail (median 30.3 s) / 6 of 12 fail | 0 of 12 / 0 of 12 (median 5.2 s, max 16.1 s / 4.0 s, 13.4 s) |
  | mobile | 6 of 12 fail (median 14.5 s) / 5 of 12 fail | 0 of 12 / 0 of 12 (max 9.9 s / 6.9 s) |

  With traces kept for the fix, all 12 commit requests were sent and answered in 3 to 6 ms (`71-`).
- **Mutants** (`70-fix-proof-by-test.txt`): the fix with its first `bringToFront` removed (`mutant-n1.patch.txt`), same load: the commit test fails 8 of 12 (median 35.6 s), the opening-balance test stays at 0 of 12. The fix without the two `bringToFront` of the replay (`mutant-n2.patch.txt`): the commit test fails 2 of 12 and its median doubles to 11.5 s (fix 5.2 s), so each group is needed. The product mutant (`show(answer.import, null)`: no committed notice, `mutant-product-m1.patch.txt`) is rebuilt and run against the fixed test: 6 of 6 fail on the missing `[data-import-notice="committed"]`; after restoring the source and rebuilding, `src/` is byte-equal and the 250 `dist/` files equal the base (`cmp` exit 0).
- **Calm host** (no burner; 6 to 10 busy cores of the owner's work and tools before each run): real clock, 24 of 24 pass on desktop (3.6 s median) and 24 of 24 on mobile (3.9 s); every test of the fixed file, 5 repeats on each project at the sweep instant: 40 of 40 and 40 of 40 pass.
- **Lint and typecheck:** `eslint` on both files and `tsc -p tsconfig.test.json` exit 0 (`72-`). `git apply --check` and `--whitespace=error` exit 0 on a fresh export; the applied file equals the tested one apart from this machine's CRLF checkout setting (`73-`).
- **Regate scope.** `src/` is unchanged, so `dist/` is byte-equal to the REGATE11 build and the container drill, `npm audit`, `npm test` and axe carry forward from REGATE11. Rerun: the digest in three forms and the scope diff (exactly `tests/e2e/import.spec.ts`); lint, typecheck and build with the `dist/` comparison; `npm run verify`; the validators; the real-clock FULL run on both projects; the three full sweeps (1026, 1101, 0314; the seven-spec sweeps do not contain this file and carry forward); and the stress and mutants below. Take the census at the start, at the end and after any failure, and read a failure from its trace first.
  - Stress: `import.spec.ts` on both projects, `--repeat-each=20 --workers=6`, real clock and 2026-11-01T08:45Z; the two two-tab tests under the self-stopping 48-thread burner, 12 repeats on each project (the original fails there).
  - Mutants: the fix with its first `bringToFront` removed (`mutant-n1.patch.txt`) and the product mutant (`mutant-product-m1.patch.txt`).
- **Owned paths:** `tests/e2e/import.spec.ts` and `tests/e2e/today.spec.ts` (Addendum 1 results), and the worker's own task Results and evidence folder. **Profile:** timesheet-worker (medium, sonnet); size S, risk low, novelty no (the DIAG8 pattern). The edits and their proof are given; nothing is left to design. The regate scope is extended in Addendum 1 results: the seven-spec sweeps contain `today.spec.ts` and are rerun too.

### Host and rule record

- Host: 32 logical cores. The owner's compute jobs (`real8*.exe`, `sim3.exe`) started and stopped by themselves during the task, so the loads in item 3 are measured (`61-census-*`, two samples each, a gap of 1 to 10 s), not set. Heavy runs went one at a time. A self-stopping burner (`burn.mjs`, 1 to 48 threads, 90 to 1,100 s) ran beside them; every burner ended at its deadline. Final check: no process of this task is left (`74-final-census.txt`).
- Rule slips, none fed a script or touched the repository: pipes into `head` (six) and `tail` (two), three of them with `/dev/null` as source or redirect target; one `sleep 1`; one `rm -rf` of a folder that did not exist; `rm -f` of two of my own evidence copies. No heredoc, no stdin to node or python, no PID kill, no `git config`, no `npm` in the repository.
- Notes: the first `npm ci` ran with the system Node 26 and stopped at once (EBADENGINE, nothing installed); I reran it with the portable Node 24 npm CLI. The first mixed-run burner exited at once on a limit of my own script (raised, then rerun). The first version of the priority probe ordered the renderers by age; it was replaced by a CPU-time mapping (`probe-tab-priority.mjs.txt`).

### Addendum 1 results

**The class is closed with one more fix. The midnight-crossing branch of `today.spec.ts:641` drives a page that is behind and failed under the burner (5 of 6 on each project); it is fixed in `tests/e2e/today.spec.ts` and proven. `logo.spec.ts:489` and `controls.spec.ts:699` never act on a page that is not in front and did not fail. No other test drives two pages.** `proposed.patch.txt` now holds both files (`import.spec.ts` as before, `today.spec.ts` +16 -2; `proposed-import.patch.txt` and `proposed-today.patch.txt` are its two halves). `git apply --check --whitespace=error` exits 0 on a fresh export; both applied files equal the tested ones apart from the CRLF checkout setting (`84-`). Evidence: `80-` to `86-`, `82-addendum1-summary.txt`, `82-addendum1-by-test.txt`, `log-run-*`.

**Every way to open a second page** (`git grep` at HEAD, `83-grep-newpage.txt`): `controls.spec.ts:689/699`, `import.spec.ts:154/326` (fixed above), `logo.spec.ts:482/489`, `theme.spec.ts:381/413` (fixed in DIAG8), `today.spec.ts:641`, and `day-editor.spec.ts:6640` (a CDP session on the same page, not a second page). No `popup`, `pages()` or `window.open` in `tests/`; the only `target="_blank"` link of the client (PDF Preview in `SendCard.tsx`) is never clicked, only its `href` is read. Under the same 48-thread burner and `--workers=6`:

| test | page behind? | runs | result |
|---|---|---|---|
| `today.spec.ts:641`, normal branch (preload 2026-11-01T08:45Z) | No: `other` is `undefined`, one page | 12 desktop, 12 mobile | 24 of 24 pass (median 3.2 s) |
| `today.spec.ts:641`, midnight crossing (preload 2026-10-27T06:58:30Z), original | **Yes:** `context.newPage()` opens the second tab last; the first page is behind for the wait and for every step on it afterwards (lines 662 to 678) | 6 desktop, 6 mobile | **5 of 6 fail on each** (median 108 s and 120 s of 240 s); the failing steps are 7 s expectations on the page (period name, `toBeInViewport`); one such `toHaveText` took 23 s (`81-`) |
| same, with the fix (the second page in a browser context of its own) | No: each page is in front in its own context | 6 + 6 under the burner; 3 + 6 on a calm host | 12 of 12 pass (median 78 s, max 84 s); calm 3 of 3 crossing and 6 of 6 normal |
| `logo.spec.ts:489` (three more windows per sweep) | No: every sweep window is the only page of a browser context of its own; 4 contexts of one browser all run at priority 8 (`80-contexts4-priority.txt`) | the light variant of each of the 3 sweep tests, 12 each, desktop (they skip on mobile) | 36 of 36 pass; but 168 to 192 s median (70 to 80 % of the 240 s limit; calm 37 to 49 s), max 228 s |
| `controls.spec.ts:699` (a context per device pixel ratio) | No: the new page is alone in its context; the test's own page is not used after `storageState()` | 12 repeats of the 2 themes, each project | 24 of 24 on each project (median 11.4 s and 12.1 s, max 17.8 s and 18.5 s of 120 s) |

- **`today.spec.ts` fix** (`proposed-today.patch.txt`): `other` is opened with `browser.newContext({ baseURL, storageState, viewport, locale, timezoneId, isMobile, hasTouch, deviceScaleFactor })` instead of `context.newPage()`, as `logo.spec.ts` and `controls.spec.ts` do (DIAG4: contexts scale where a second tab does not); the context is closed at the end. Nothing else changes: no step, no assertion, no timeout.
  - Why not `bringToFront` here: it works (my first version, 6 of 6 and 6 of 6 under the burner; with one `bringToFront` removed the mutants fail 4 of 6 and 2 of 6, `mutant-t1.patch.txt`, `mutant-t2.patch.txt`; `rejected-today-bringtofront.patch.txt`), but the product refreshes the periods on window focus and on a tab becoming visible (`TimesheetScreen.tsx:254`), this test is about those events, and hiding and showing tabs adds visibility changes the test did not have. A window of its own changes none of them.
  - The mutant of the fix is the original (the second tab instead of a window of its own): 5 of 6 fail on each project under the same load.
  - Product mutant (the window `focus` listener removed): the original, the first fix and the fix all pass 3 of 3 on a calm host (`pm2o`, `pm2`, `pm2g`). The test cannot see that mutant before or after the fix (another refresh path keeps the Today tag current); this is a blindness the test already had, not one the fix adds. The source was restored and rebuilt after each build (`dist/` equal to the base, `cmp` exit 0, `86-`).
  - `eslint` and `tsc -p tsconfig.test.json` exit 0 on the final file (`85-`). The last edit after the runs was to a comment only.
- **`logo.spec.ts` finding (not a fix):** it does not drive a page that is behind, so `bringToFront` has nothing to act on. Under a saturated host its sweep takes 4 times as long (CPU: 1,121 widths in four windows) and uses 70 to 80 % of its limit, with a worst run at 228 s of 240 s. It passed 36 of 36, so the "slows past half" rule is met without a failure. A remedy would be a change of design (fewer widths per window or more windows, the DIAG4 kind), which is the coordinator's decision; the gate rule of item 6 (no sweep at saturation) already keeps it away from this load.
- **Regate scope, extended.** `today.spec.ts` is in the seven-spec sweeps as well, so the three seven-spec sweeps are rerun too (all six sweeps); the stress adds `today.spec.ts` on both projects: the crossing branch at 2026-10-27T06:58:30Z (6 repeats, `--workers=6`) and the normal branch at 2026-11-01T08:45Z (12 repeats). The mutant list adds the original `context.newPage()` for `today.spec.ts` (it fails under the 48-thread burner). The owned paths become `tests/e2e/import.spec.ts` and `tests/e2e/today.spec.ts`; the profile does not change.
- Time: about 100 minutes of runs (01:48Z to 03:27Z), a little over the 90 asked, because the logo run (36 runs of 3 minutes) and the crossing runs (up to 5 minutes each) are long. Slips of this part: one `ls | head -3` (nothing fed to a script); no `sleep`, no `rm -r`, no `/dev/null`; one `rm -f` of a temporary patch file of mine.

Status: done
