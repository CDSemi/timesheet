# WP5-CALDEF-DIAG1 dispatch brief (classic-scrollbar.spec.ts:143 on the real clock, and the sign-in 401 of one stress run)

- **Task.** Mission timesheet-software-readiness, task WP5-CALDEF-DIAG1, package WP5, kind
  diagnose, attempt 1.
  - It answers the failed gate WP5-CALDEF-GATE and depends on the last freeze,
    WP5-CALDEF-FREEZE (300d61f).
  - It is read-only for the repository.
- **Profile and routing.** timesheet-planner (effort high, fixed by the profile); requested
  model sonnet; no override.
  - Routing: size S, risk M, novelty no. docs/08 row "Plan/diagnose a bounded issue". This
    is the first attempt at this issue.
  - Write the task record in English.
- **You run alone.** No other mission agent is active. Keep the host quiet: run one heavy
  command at a time.
- **AGENTS.md on disk wins.** Rule 7 applies: UTC instants, accounting dates and saved IANA
  reporting zones are different values.

## The failure

- **What failed.** WP5-CALDEF-GATE ran on 300d61f / e24274b9 on 2026-11-03 and failed on one
  item only, the real-clock FULL e2e run.
  - One test failed: `[desktop] tests/e2e/classic-scrollbar.spec.ts:143`, the press-drag on
    a week card's own scrollbar. Assertion `scrolled() > 0`, received 0. Shard 2 of the
    desktop run; census 2.06 busy cores, so not host load.
  - Diagnostics by the verifier on the same host and the same real clock: 20 of 20 failed on
    the target and 3 of 3 on the accepted a54061f.
  - The spec file is not among the round's 34 changed paths.
- **Where it passed.**
  - WP5-CALDEF-FIX's real-clock FULL run on 2026-11-02 (937 passed, 0 failed).
  - The gate's three simulated-clock FULL sweeps: 2026-10-26T16:00Z, 2026-11-01T08:45Z and
    2027-03-14T10:30Z, desktop 508 / 37 / 0 each.
- **Leading reading, not proven.** The week card's content or width depends on the date, so
  on some dates the card does not overflow and has no scrollbar to drag, or the drag lands on
  something else. The alternative to rule out is a real product defect: a week card that
  overflows but cannot be scrolled through its own scrollbar on some dates.

## Read

- `handoff/delivery/tasks/WP5-CALDEF-GATE.md`, Results (failures F1 and F2, item 4, item 6).
- In `handoff/delivery/evidence/WP5-CALDEF-GATE/`: `96-failures-and-decision.txt`,
  `log-run-full-desktop-s2.txt` (and its trace path), `log-run-diag-scrollbar-target.txt`,
  `log-run-diag-scrollbar-prev.txt`, `17-run-counts.txt` and `run-shift.sh.txt`.
- The clock wrapper `handoff/delivery/evidence/WP5-UX-FIX10/shiftclock.mjs.txt` and its notes
  in the same folder.
- `tests/e2e/classic-scrollbar.spec.ts` (all of it), the helpers it uses, and the week card
  markup and styles it measures (`src/client/`, `src/client/styles.css`).
- docs/04, the rules on week cards, classic scrollbars and element scrollbars (round 5,
  F-UX5A-3 "element scrollbars ignored").

## Base

- HEAD = origin/main = 300d61f055a859857aa8eb3845ed21f4560e82fa, or a later commit that
  changes only `handoff/`. The digest is
  e24274b98ceaef10d83b3a9538680c6ed703657eb014211fc015ce9eb9d251a7 (885 files).
- Probe in a scratch export of HEAD made with `git archive`, with its own `npm ci`. Use a
  second export of a54061f only to confirm a result there.

## Questions to answer

1. **What the test does.** Describe how the test finds the week card, what makes the card
   overflow (its rows, columns or width at the viewport the test uses), where the press-drag
   lands, and what `scrolled()` reads.
2. **The cause.**
   - Reproduce it deterministically through the FIX10 wrapper. Run the test at a fixed
     working-hours instant on every date from 2026-10-26 through 2026-11-15, plus the gate's
     three FULL sweep instants and the real clock.
   - Give each date's result with what you measured: the card's scroll width and client
     width, and the element under the drag start point.
   - Name the property of the date that decides the result (for example the weekday, the
     week's position in the pay period, a DST week, or a day that turns into the future).
3. **Test assumption or product defect?**
   - **Test assumption:** the card is correct for that date under docs/04, and the test
     assumes an overflow or a layout that only some dates give.
   - **Product defect:** the card overflows but its own scrollbar does not scroll it, or the
     card should overflow under the documented rules and does not. Then describe what a user
     would see and which canonical rule it breaks.

     If the correct behaviour is a design decision that the docs do not settle, stop at the
     description and report it as a finding. Do not plan the change.
4. **The smallest fix that keeps what the test proves.**
   - Never loosen an assertion. Never drop a step or a case. Never add a fixed sleep or raise
     a timeout. Do not skip dates.
   - Prefer a date-independent form, for example a fixed simulated date for this test or
     content that makes the card overflow on every date, whichever keeps the test's purpose.
   - Give the file, the line and the exact edit.
   - Prove it: at every date from question 2 the original fails or passes as predicted and
     the patched test passes; a mutant is still caught (for example the week card's own
     scrollbar ignored by the drag handling, or the card made not scrollable).
5. **Completeness census.** The regate and the audit run on later real dates, so this should
   be the last date failure of this kind.
   - In the patched export, find the other tests in the e2e suite that depend on the real
     date in the same way (the week's content, a day turning into the future, the number of
     rows). Classify each: safe, at risk, or fixed by your patch. Fix those at risk in the
     same patch, with proof.
   - Run the FULL suite, both projects, `--workers=6`, through the wrapper at a
     working-hours instant on 2026-11-04, 2026-11-05 and 2026-11-09 (the dates the regate
     and audit are likely to run on). 0 failed is expected.
   - Report every failure with its cause. A test assumption: fix it in the same patch, with
     proof. A product defect: report it as a finding, with no plan.
   - Keep the whole campaign within about four hours of runs. If it cannot fit, say which
     runs you dropped and why.
6. **F2, short assessment only.** The gate recorded one `seed sign-in` 401 at the
   administrator sign-in of a test's private server in a stress run of
   `calendar-default.spec.ts` (desktop, real clock, shard 1, repeat 7); the repeat passed.
   The verifier inferred a port race: the fixture releases a probed port before the server
   starts. From the code only (file:line), say whether that reading holds, whether an
   earlier record names the same risk, and whether a small deterministic fix exists.
   Recommend fixing it in this patch or leaving it in the backlog. No load campaign.
7. **Regate scope.**
   - If the fix touches only `tests/`, `dist/` is unchanged. Say which WP5-CALDEF-GATE items
     carry forward and which must rerun. The real-clock FULL run, the six sweeps and stress
     of the changed tests rerun in any case.
   - If it touches the product, the regate is full.
8. **Owned paths** for one worker. Recommend timesheet-worker or timesheet-worker-high, and
   give the reason.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-CALDEF-DIAG1`. Set TEMP and TMP to it. Ports
  52210-52249, with `SMOKE_PORT` in that range. Set `DATA_DIR` and `DATABASE_PATH` inside the
  task folder. Never touch `%LOCALAPPDATA%\timesheet-dev` or `.claude/worktrees/`.
- Run each Playwright run with its own output folder, one after another.
- **Host census.** Read-only, stopping nothing.
  - Use only inline `powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process |
    Select-Object ..."` queries, redirected to a file in the task folder. Never use
    `-ExecutionPolicy` or `-File`.
  - **This is a public repository.** Evidence may hold process names, IDs, counts and CPU
    times only. Never write the command line of a process the mission did not start (a
    `node dist/server/index.js` on port 3000 since 2026-10-27 is not the mission's; leave
    it).
- Use Git Bash. Use PowerShell only for the inline census.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN TO WRITE A
  FILE), NO `node -e` OR `node -p` (NOT EVEN `node -e 0`), NO `python -c`, NO `node -` OR
  `python -`, NO `| node`, NO `| python`, NO BARE `cat`. NEVER PIPE INTO `head`, `tail` OR
  `cat`. NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR
  `nul`, ALSO NOT IN `2>` AND NOT AS A `cp` TARGET. NO `rm -r` OR `rm -rf`, ALSO NOT ON
  SCRATCH FOLDERS. NO PID KILLS, NO `Stop-Process`, NO `sed -i` (ALSO NOT ON SCRATCH OR TASK
  COPIES), NO INTERACTIVE SHELLS, NO FIFO WAITER SCRIPTS, NO `git init`, NO `ping`, `sleep` OR
  `tail -F` USED AS WAITS, NO DETACHED SHELLS (`nohup`, `setsid`, `disown`, `start`), NO
  POLLING HELPER SCRIPTS.**
  - Write and change scripts and files with the Write and Edit tools.
  - Read outputs with the Read tool.
  - To wait for a long command, use the Bash tool's own background run and its exit notice.
    Before you return, make sure each one has ended. Stop a run only through its own handle,
    never by PID.
- **Git.** Never change any git configuration. For git in a scratch export, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH, also for evidence copies:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- **Repository writes.** Change nothing in the repository except:
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-CALDEF-DIAG1/`: masked LF `.txt` only (or
    `-synthetic.png`, at most six). Save probe scripts as `*.ts.txt`, `*.mjs.txt` or
    `*.sh.txt`, and the proposed patch as `proposed.patch.txt`. Check the patch with
    `git apply --check` in a fresh export.

  Do not stage or commit. Do not run `npm ci` or `npm install` in the repository.
- **Data.**
  - Use synthetic data only.
  - No file name may contain "signature" unless it also contains "synthetic".
  - Write no email address except `@example.invalid` and no password literal.
  - Mask user profile paths as `<user>`.
- Leave nothing running: no server, browser or Compose project.
- If a permission check denies a call, stop and report. Do not retry it in another form.
- Keep Results short and concrete. Every file ends with exactly one newline. Finish with
  "Status: done".

## Return

At most 150 words, beginning 'Self-reported model: ...', with:

- the cause and the dates that prove it;
- the verdict: test assumption or product defect;
- the proposed fix, with its proof and the mutant;
- the completeness census results;
- the F2 assessment and recommendation;
- any finding;
- the regate scope;
- the owned paths and the worker profile.

## Results

Planner: self-reported model claude-sonnet-5-5 (timesheet-planner, 2026-11-03). Evidence: `handoff/delivery/evidence/WP5-CALDEF-DIAG1/` (index `00-README.txt`).
Nothing staged or committed; the repository changed only in this Results section and that evidence folder. Base: HEAD = origin/main = 300d61f0 (`git archive` export, own
`npm ci` exit 0, own `npm run build` exit 0, Node 24.21.0, Edge). Observations and assumptions are marked.

**Verdict: a test assumption, not a product defect.** The press-drag lands under the floating Day editor drawer on three weekdays; the card overflows and scrolls on every date.
One test-only patch fixes it (`tests/e2e/classic-scrollbar.spec.ts`, 14 lines); `dist/` stays unchanged.

### 1. What the test does (`classic-scrollbar.spec.ts:143-180`)

- Window 900x900, the classic scrollbar drawn (`--hide-scrollbars` dropped). Signs in as the seeded employee; 14 `[data-day]`; opens the Day editor for `days[0]`, the newest
  past normal workday without a session in the displayed period (`displayedPeriodFreeWorkdays()`, newest first, `fixtures.ts:456`).
- Finds the week card: the first `.sheet-week` with `scrollWidth > clientWidth`, a track (`offsetHeight - clientHeight` > 0), `top > 0` and the track inside the window. The drag starts at
  `(box.right - 60, middle of the track)`, then moves 120 px to the right in 5 steps. `scrolled()` is the sum of `scrollLeft` of all `.sheet-week`.
- Why the card overflows (observation, constant): from 480 to 929 px `.sheet-week` is `overflow-x: auto` with a grid of at least 850 px (`styles.css:2976-3003`). At 900 px the card
  measures `scrollWidth 850 / clientWidth 821` with a 15 px track, on all 25 instants below. The overflow does not depend on the date (2 week cards, 14 days, fixed minimum width).
- The drawer: from 768 px and below 1345 px the Day editor floats, 400 px wide, flush with one window edge. It docks away from the edited column: left when the column centre lies right of
  the window centre, else right (`dockAwayFrom`, `TimesheetScreen.tsx:95-101`; `.day-panel-side[data-side]`, `styles.css:4179-4191`; docs/04 "Beside or floating" bullet). The test never
  looks at the side when it picks the press point, though its last step does (`data-side`, line 178).

### 2. The cause (reproduced through the FIX10 wrapper)

Probe `zz-probe.spec.ts.txt` repeats the test's steps and measures; the original test:143 ran in the same runs. Instant = 18:00Z of each date (America/Los_Angeles 10:00 or 11:00), desktop,
one run per instant (`10-repro-table-original-test.txt`, `13-log-sweep1-original-test.txt`). Opened day = `days[0]`.

| instants | opened day | dock side, drawer x range | element at the drag start (x=793) | scrolled | original :143 |
|---|---|---|---|---|---|
| 2026-10-26 to 10-30 (Mon-Fri) | Fri 10-23 | left, 0-400 | the week card (`section.sheet-week`) | 29 | pass |
| 2026-10-31, 11-01, 11-02 (Sat, Sun, Mon) | Fri 10-30 | left, 0-400 | the week card | 29 | pass |
| **2026-11-03 (Tue), and the real clock of 11-03** | **Mon 11-02** | **right, 485-885** | **a `textarea` inside the drawer** | **0** | **FAIL** |
| **2026-11-04 (Wed)** | **Tue 11-03** | **right, 485-885** | **the drawer's textarea** | **0** | **FAIL** |
| **2026-11-05 (Thu)** | **Wed 11-04** | **right, 485-885** | **the drawer's textarea** | **0** | **FAIL** |
| 2026-11-06 (Fri) | Thu 11-05 | left, 0-400 | the week card | 29 | pass |
| 2026-11-07 to 11-13 (Sat-Fri) | Fri 11-06 | left, 0-400 | the week card | 29 | pass |
| 2026-11-14, 11-15 | Fri 11-13 | left, 0-400 | the week card | 29 | pass |
| gate sweep instants 2026-10-26T16:00Z, 2026-11-01T08:45Z, 2027-03-14T10:30Z | Fri | left | the week card | 29 | pass |

- Property of the date (observation): the weekday of `days[0]`, the newest past free workday of the displayed period, which on a normal week is the day before today. A Monday, Tuesday or
  Wednesday column lies left of the window centre (the Thursday column does not), so the drawer docks on the right and covers x 485-885; the press point x=793 is then on the drawer's
  note field, not on the card's track. The click goes to a textarea, nothing scrolls, `scrolled()` = 0. On a Thursday or Friday `days[0]` the drawer is on the left and the same point
  is on the card's thumb: the drag scrolls to the end (29 px = 850 - 821).
- So the test fails when `days[0]` is a Monday, Tuesday or Wednesday (observed on 11-03, 11-04, 11-05; by extension, assumption: every Tuesday to Thursday on which the displayed period holds
  the previous day as a free workday) and passes when it is a Thursday or Friday (observed on 21 instants). That is why it passed in
  WP5-CALDEF-FIX's real-clock run (Monday 2026-11-02, `days[0]` = Fri 10-30) and at the three gate sweep instants (a Monday and two Sundays, each with a Friday as `days[0]`), and fails on 2026-11-03.
  Regate and audit dates: 11-04 and 11-05 fail with the unpatched test, 11-09 passes.
- Ruled out: the card has no scrollbar on some dates (it has one on all 25 instants, 850/821, track 15); host load (it reproduces at a fixed instant, 1 worker, one test, alone).
- The leading reading in the brief (the card's content or width depends on the date) is false; the drawer position depends on the date. A prior record: the gate saw the same on a54061f (3 of 3).

### 3. Test assumption or product defect

Test assumption. docs/04 ("Beside or floating"): the floating drawer is "docked at the left edge instead of the right when the edited column lies in the right half of the screen". On a
Monday-Wednesday column the drawer is correctly on the right and lies over the right end of the card; a press there is a press on the drawer's field, which must not scroll the card.
The card is scrollable by its own scrollbar on the uncovered part (the patched test scrolls it by 29 px on both docks, and M1 below proves the drawer stays open). No canonical rule is
broken and no design decision is open, so there is no finding.

### 4. The smallest fix

Choose the press point at the end of the card the drawer does not cover. File `tests/e2e/classic-scrollbar.spec.ts`, the block at original lines 155-167 (full diff `proposed.patch.txt`,
`git apply --check` exit 0 in a fresh export of HEAD, `31-apply-check.txt`):

1. After `const editor = ...` add `const pressNearLeft = (await editor.getAttribute('data-side')) === 'right';` (with a 3-line comment: Monday-Wednesday the drawer covers the right end,
   Thursday-Friday the left end; at scroll 0 the thumb spans the track but for its arrows).
2. The `page.evaluate` script becomes `((nearLeft) => { ... })(${pressNearLeft})` and returns `x: nearLeft ? box.left + 60 : box.right - 60` (unchanged for the left dock).
3. After `const at = ...` add one assertion: `document.elementFromPoint(at.x, at.y)?.closest('.sheet-week') != null` is true ("the press lands on the week card, not under the drawer").

Nothing is loosened: the drag, the `scrolled() > 0`, the `toBeVisible()` of the drawer, the plain-page close and the `bar` check are unchanged; one precondition is added; no sleep, no
timeout, no date skipped, no clock shift added to the spec. Same mechanism as `pageEdgeX` in `day-editor.spec.ts:6941`.

Proof (`20-results-patched-test.txt`, `21-log-sweep2-patched-test.txt`, `30-log-mutants.txt`):

- The original fails on exactly the predicted instants (11-03, 11-04, 11-05 at 18:00Z and the real clock: 4 of 25) and passes the other 21; the patched test passes all 25 (21 dates, 3 gate
  instants, real clock), among them the two right-dock instants 11-04 and 11-05 and the left-dock 11-06.
- Mutant M1 (product, `TimesheetScreen.tsx` `onOwnScrollbar` always false: a scrollbar press counts as a press on the page): the patched test fails at `a scrollbar press is not a press on the
  page` (the drawer closes) at the right-dock instant 2026-11-03T18:00Z and at the left-dock instant 2026-11-06T18:00Z, after `scrolled() > 0` passed.
- Mutant M2 (product CSS, `.sheet-week { overflow-x: hidden }` in the 480-929 px query: the card is not scrollable): fails at `a week card with a sideways scrollbar in view` (`bar` null) at both instants.
- Stress of the patched test (`44-log-stress-changed-test.txt`): `:143`, desktop, `--repeat-each=20 --workers=6` at 2026-11-04T18:00Z (right dock) 20 passed and at 2026-11-06T18:00Z
  (left dock) 20 passed; the whole spec file (3 tests) at the real clock 3 passed.
- Both mutants restored: `cmp` of `TimesheetScreen.tsx` and `styles.css` against `git show 300d61f:` is identical; a restore build gives `dist/client/assets` names identical to the gate
  export's (`32-dist-assets-after-restore.txt`).

### 5. Completeness census

Static (code read, `rg`): what in the e2e suite depends on where the drawer is or on the week card's scroll, and on the real date.

| group | where | class |
|---|---|---|
| Pointer coordinates into the sheet | only `classic-scrollbar.spec.ts:143` uses a computed press point on the sheet; every other `mouse.move` is `move(0, 0)` (a hover reset) or `click(4, 4)` | **fixed by the patch** |
| Press on plain page away from the drawer | `day-editor.spec.ts:6941` `pageEdgeX` and the last step of `classic-scrollbar.spec.ts` read `data-side` | safe (side-aware already) |
| Reads of `data-side` | `day-editor.spec.ts` 3988-4363, 5395-5418, 5561, 5595, 6955-7032 branch on or report the side | safe |
| Specs that open the editor on `days[0]` without geometry (about 90 uses of `displayedPeriodFreeWorkdays()`) | `day-editor`, `timesheet`, `calendar-default`, `today`, `controls` and others | safe: they assert on content, not on where the drawer lies; the FULL runs below cover Tue, Wed and Mon |
| Number of days or rows | `toHaveCount(14)` (two weeks, constant), `need(free, n)` guards | safe: the displayed period always has 14 days; a short free list fails with a message (`need`), not silently |
| Day turning into the future | `fixtures.ts` `displayedPeriodFreeWorkdays` filters `work_date < today_local` | safe: the specs that need 2-3 free days call `need(..., n)`; the FIX10 sweeps (14 dates) and this task's 25 instants gave none short |

Dynamic: the patched export, FULL suite, both projects, `--workers=6`, through the FIX10 wrapper at 18:00Z of 2026-11-04 (Wednesday, right dock), 2026-11-05 (Thursday, right dock) and
2026-11-09 (Monday, left dock), 1,090 tests each: **937 passed, 153 skipped, 0 failed, 0 flaky, exit 0 on all three** (desktop 508 ok / 37 skipped, mobile 429 ok / 116 skipped, the same as the gate's
simulated sweeps; `20-results-patched-test.txt` has the one-spec sweep, `40-log-full-*.txt` the three full logs, `43-results-full.txt` the counts). Host: about 30 percent total CPU during a run
(`41-census-during-full-run.txt`); no failure, so no load classification was needed. The second run overlapped my lint and typecheck (see §7).

No other test fails on a date or weekday; nothing else needed fixing in the patch. Limits (assumption): the FULL runs cover the drawer docked right (opened day Tuesday on 11-04, Wednesday on 11-05) and docked left (Friday on 11-09); the opened days Monday (11-03)
and Thursday (11-06) are covered for this spec only, not for the full suite. The suite's other geometry tests measure the drawer rather than assume a side (table above), so I rate that risk
low. Campaign: about 1 h 15 min of runs (25 + 25 spec runs, 2 mutants x 2 instants, 3 FULL runs, the stress below); nothing dropped.

### 6. F2 (the `seed sign-in` 401), from the code only

- The reading holds as the most consistent mechanism, not proven. `fixtures.ts:60-69` `freePort()` binds port 0, reads the number and closes the probe; `:100` takes it; then `:131-132` runs
  `migrate` and `seed` through `spawnSync` (hundreds of ms to seconds) before `:133` starts the server on that number. In that window another worker's `freePort()` can be given the same
  number. `:76-88` `waitUntilHealthy` accepts any `/api/health` that answers ok on the origin and only checks the child's exit before each attempt, so a test can accept the other test's
  server as its own. `:102-105` give every server its own random admin password and `:376-380` `signIn` posts that password: the other server answers 401 (a refused connection or a
  reset would be a different error). Only the harness's own servers share that port range; the server on port 3000 is outside it.
- An earlier record names the same risk: `handoff/delivery/evidence/WP5-UX5-DIAG2/30-C-econnreset.txt` lines 32-34 ("freePort() probes a port and closes it ... waitUntilHealthy accepts the
  other worker's server. The one 401 on the admin seed sign-in at 14 workers ... is consistent with this, but it was not reproduced"; no fix proposed). So 401s were seen twice, both under
  6-14 parallel workers, never reproduced.
- A small deterministic fix exists: a cross-process claim of the port number in `freePort()`: `openSync(join(tmpdir(), 'timesheet-e2e-port-<port>.lock'), 'wx')`, retry another port on `EEXIST`, delete the
  lock in `stop()` (about 12 lines in the shared `fixtures.ts`). It closes the collision between the suite's own servers only.
- **Recommendation: leave it in the backlog, not in this patch.** Two sightings in thousands of server starts; each repeat passed; no product effect; the fix edits the fixture every one of the
  1,090 e2e tests uses and needs its own proof (a forced-collision test and a mutant), which this one-file patch should not carry. If a regate stress shows another 401, the gate's own rule (network-class, repeat
  once, record both) applies; if the owner wants it gone, make it a separate small task with the lock-file design above.

### 7. Regate scope

The patch touches only `tests/e2e/classic-scrollbar.spec.ts`. No `src/`, `scripts/`, `docs/`, package, lockfile or migration path changes, so `dist/` is unchanged (this task's build
after the mutant restores has the same `dist/client` asset names as the gate's export; a test file is not part of the build).

- **Carry forward** from WP5-CALDEF-GATE (the product, the drill, the scripts and the documents are byte-identical): item 1 the dist comparison and the clean builds (state "dist unchanged: the
  new target differs from 300d61f in one test path"), item 2 the container drill and `npm audit`, item 7 the 36 mutants (checked: `classic-scrollbar` appears in neither `mut-00-summary.tsv.txt` nor
  `caldef-mutate.mjs.txt` of the gate), item 8 the INT3 probe, item 9 the smoke proof, item 10 axe, item 11 documents. Stress of calendar-default, FIX18, FIX19 and the unsaved-changes tests (item 6) carry
  as well: their specs are unchanged.
- **Rerun:** item 1 identity only (new HEAD, new digest in the three forms; the diff against 300d61f outside `handoff/` = the one test path; `git diff --check`);
  item 3 `npm run lint`, `npm run typecheck` (they cover `tests/`), `npm test` once (103 files, 2,425 tests; the unit tests do not include this file, so one run is enough), the validators;
  item 4 the real-clock FULL e2e on both projects (alone, `--workers=6`); item 5 the six simulated sweeps; and the stress of the changed test (`classic-scrollbar.spec.ts:143`,
  `--repeat-each=20 --workers=6`, desktop, at one right-dock and one left-dock instant) plus the whole spec file once. The verifier should also run the FULL desktop at the real date it is
  run on and record the weekday of `days[0]`.
- Lint and typecheck of the patch, run by me in the patched export (after the mutant restores): `npm run lint` exit 0 and `npm run typecheck` exit 0 (`50-lint.txt`, `51-typecheck.txt`). They
  ran while the second FULL run was going (a slip against "one heavy command at a time"; that run had no failure).

### 8. Owned paths and worker

- Worker: **timesheet-worker** (not -high). One test file, a 14-line change already built and proven in a scratch export, no product code, no design choice; risk is low and the proof is a list
  of runs. The worker applies `proposed.patch.txt`, runs `npm run lint`, `npm run typecheck` and the patched test at the five instants (right dock 11-04, 11-05; left dock 11-06; real clock; one
  Friday), and the mutants M1 and M2, restoring byte-equal.
- Owned paths: `tests/e2e/classic-scrollbar.spec.ts`; its own task record `handoff/delivery/tasks/WP5-CALDEF-FIX2.md` (name as the coordinator assigns it) and evidence folder
  `handoff/delivery/evidence/WP5-CALDEF-FIX2/`. Not owned: `fixtures.ts`, `src/`, `docs/`, other specs.

### Process notes

- Runs used ports chosen by the harness (OS-assigned loopback ports, not 52210-52249; `SMOKE_PORT=52210` set but the e2e fixture picks its own), TEMP/TMP/DATA_DIR/DATABASE_PATH in the task folder;
  nothing touched `%LOCALAPPDATA%\timesheet-dev` except the read-only Node 24 path, nor `.claude/worktrees/`. Host census (inline, counts only): during a 6-worker FULL run 29.7 percent total CPU,
  33 `node.exe` and 102 `msedge.exe` processes (most of them the owner's own browser, which I did not start).
- Slips: twice I piped a command into `head` (a `head -0` after `ls`, and `head -1` after `git status`) and once into `tail` (`cat ... | tail -n 3`); no file or setting was affected.
- The probe spec lives only in the scratch export (moved out before the FULL runs); `proposed.patch.txt` is the only proposed change.

Status: done
