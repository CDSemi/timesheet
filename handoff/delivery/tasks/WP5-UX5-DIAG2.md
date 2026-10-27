# WP5-UX5-DIAG2 dispatch brief (diagnose the REGATE3 sweep failures)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-DIAG2, package WP5, kind
  diagnose, attempt 1. It depends on WP5-UX5-FIX3-FREEZE (done, 5b8b718), and addresses
  WP5-UX5-REGATE3 (FAIL).
- **Profile and routing.** timesheet-planner (effort high, fixed by the profile); requested
  model sonnet; no override.
  - Routing: size M, risk M, novelty no. docs/08 row "Plan/diagnose a bounded issue".
  - Read-only for the repository. Write the task record in English.
  - WP5-UX5-DEPS1 (the npm audit advisories) runs in parallel in another task folder; do
    not touch its folder or ports.
- **Why.** REGATE3 on 5b8b718 failed its simulated-clock sweep (`--workers=6`) with two
  non-network assertion failures and recurring network resets:
  - **A. `tests/e2e/timesheet.spec.ts:1216`**, mobile, the seven-spec run starting at
    `2026-10-27T06:58:30Z` (LA 2026-10-26 23:58:30 PDT). The verifier says the run crossed
    LA midnight and Today stayed 2026-10-26. Its rerun at the same instant had only
    network errors.
  - **B. `tests/e2e/review.spec.ts:616`**, "row 1 lines align at 1440px", off by 23.25,
    in the rerun of the seven-spec run starting at `2026-12-31T23:30:00-08:00`. The first
    run at that instant did not fail it.
  - **C. ECONNRESET**, repeated: `submission.spec.ts:67` and automation specs, in FULL
    `2027-03-14T10:30:00Z` (and its rerun) and in both seven-spec runs above. The rerun
    rule (one rerun for a network-only failure) did not clear it. `submission.spec.ts:67`
    passes alone (3/3 per project) and as a whole file at 6 workers (1/1). The real-clock
    FULL e2e had 0 failed.

  A flaky test, or a product state that goes stale, cannot be passed over: either the
  test or the product must be fixed, or the gate method must be corrected with a reason.
- **Read:**
  - `handoff/delivery/tasks/WP5-UX5-REGATE3.md` (brief and Results);
  - its evidence in `handoff/delivery/evidence/WP5-UX5-REGATE3/`: `17-sweep-counts.txt`,
    `log-sweep-seven-1026.txt`, `log-sweep-seven-1026-rerun.txt`, `log-sweep-seven-1231.txt`,
    `log-sweep-seven-1231-rerun.txt`, `log-sweep-full-0314.txt`,
    `log-sweep-full-0314-rerun.txt`, `18-info-submission-alone.txt`, `log-info-sub*.txt`,
    `sweep.sh.txt`, `run-shift.sh.txt`;
  - the sweep records of `WP5-UX5-REGATE2.md` (instants, scopes, workers) and the FIX10
    preload in `handoff/delivery/evidence/WP5-UX-FIX10/` (why each instant was chosen);
  - the tests named above and the client code that decides "today" and lays out the
    review rows.
- **Base.** HEAD = origin/main = 5b8b7184692fff683c4083c9fc5610acd47bece1, or a later commit
  that changes only `handoff/`. The digest is
  edcca1949c429251b1476c3e32e1485507ef488264429c6afe318a7fccc041ce (882 files).

## Questions to answer

1. **A, the midnight crossing.**
   - What does `timesheet.spec.ts:1216` assert, and where does its expected date come from?
   - Where does the app take "today" from (client clock at mount, a timer, the server), and
     does it move to the new day when an open page crosses the user's midnight?
   - Do the canonical docs (03, 04 or the UX records) require the open app to roll over at
     midnight? Quote the line, or say there is none.
   - Classify: **test defect** (the test compares against its own clock, read at another
     moment than the app's), **product defect** (an open page shows a stale Today that a
     user would act on), or **both**.
2. **B, the row alignment.**
   - What does `review.spec.ts:616` measure? What is 23.25 px (one wrapped line?)?
   - Is it date-dependent (did the failing case run after LA midnight into 2027-01-01, with
     a longer label such as a year or a period that spans two years), or load-dependent
     (fonts or layout not settled)? Use the logs' timestamps and reproduce.
   - Classify as in item 1.
3. **C, ECONNRESET.**
   - Which request is reset (page navigation, API request context, an in-page fetch), and
     by which side?
   - Is the FIX10 preload involved? It shifts the server's clock too: check whether any
     server or Node timer (keep-alive, headers or request timeouts, session expiry, rate
     limits) reads the shifted wall clock.
   - Is it host load (6 workers, plus browsers) only, or a product fault that a real user
     under concurrent requests could meet?
   - Why did REGATE2's sweep show fewer resets? Compare workers and scopes.
   - Classify: product, test, harness or gate method.
4. **Reproduce** each of A, B and C at its instant with the FIX10 wrapper (copied into
   your task folder), with `--repeat-each` and load as needed. Give the rate before any
   change.
5. **Propose the minimal fix** for each, with file:line and the test or run that proves it.
   - For a test defect: an event-based wait or a date read from the app, never a fixed
     sleep or a looser assertion.
   - For a product defect: the smallest change that matches the documented behaviour.
   - For a gate-method problem: the exact change to the sweep (workers, scopes, or the
     rerun rule), with its reason. It must still catch real faults.
   - Name the owned paths a worker would need.
6. **Also, from the logs only:** the repository `npm run verify` run 1 had
   `backup.test.ts` and `jobs-restart.test.ts` timeouts. Did it run at the same time as
   another heavy run? Say whether a fix is needed.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-DIAG2`. Ports 50120-50139. Probes run in a
  scratch `git archive` export of the base in your task folder, never in the repository.
- Set TEMP, TMP, `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `node -`, NO `python -`), NO
  PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR
  `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS.**
  - Use the Write tool to create files; never write a file through the shell.
  - Read outputs with the Read tool.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- Never touch `%LOCALAPPDATA%\timesheet-dev`. Synthetic data and capture mode only.
- Change nothing in the repository except this brief's Results and
  `handoff/delivery/evidence/WP5-UX5-DIAG2/` (masked LF `.txt` only). Do not stage or
  commit. Never touch `.claude/worktrees/`.
- Name no evidence file with "signature" in its basename unless it also contains
  "synthetic". Write no email address except `@example.invalid`.
- **Run nothing in the background that outlives your return.** Before returning, check
  that each background command you started has ended, or stop it through its own handle.
- If a permission check denies a call, stop and report.
- Keep Results short and concrete. Finish with "Status: done".

Return at most 150 words, beginning 'Self-reported model: ...', with the classification and the
proposed fix for A, B and C.

## Results

Planner: claude-sonnet-5-5. Base 5b8b718 (HEAD = origin/main; no non-handoff change). Evidence: `handoff/delivery/evidence/WP5-UX5-DIAG2/` (00-README, 10-A, 20-B, 30-C,
40-patches, 50-verify-timeouts). Probes in the scratch export `D:\.claude-tmp\timesheet\WP5-UX5-DIAG2` with the FIX10 wrapper; the repository is unchanged. All three were
reproduced; each fix was proven in the scratch copy only.

**A. `timesheet.spec.ts:1216`: test defect (the product is as documented).**
- The test asserts `[data-day="<todayLocal>"].today` (line 533) where `showToday` (527-536) read `todayLocal` from the server once (line 528).
- Trace of the failure: the server read was at 06:59:59.97Z, the "Next period" click at 07:00:00.17Z. The click makes the page re-read `/periods/current` (`TimesheetScreen.tsx:205-216`),
  so the Today tag moved to 10-27. The test body began 0.47 s before LA midnight.
- "Today" comes from the server: on mount, on every load, on focus and visibility (`:218-242`), on the Today press. No timer.
  Document 04 line 58 requires exactly those re-reads and no timer rollover, so an open page is allowed to show the old Today until an event.
- Reproduced deterministically (probe `old` fails with the REGATE3 message; `fixed` passes). The natural window is about 0.2 s; blind scans of 23 starts did not hit it.
- Fix (`tests/e2e/timesheet.spec.ts:533-535`, used by `:1225` and `:2288`): drop the line-533 assertion on the early date; after `.today-tag` count 1, poll until the Today tag's
  `data-day` equals a fresh `employeeSeed.today()`, sending the page's `focus` event (the documented refresh) in each poll, and return the app's date. Real clock 12/12 and 06:59:40 20/20 pass.

**B. `review.spec.ts:616`: test defect plus a small product layout shift.**
- The failure is in the Sign off dialog's preview (`:641-645`), not the page footer. The 23.25 px is one text line: when the saved signature image arrives
  (`SignoffDialog.tsx:168`) the employee line grows from 52 to 75.25 px (the name wraps under the image). `expectSignatureGeometry` (`:568-614`) reads the four lines one `boundingBox()` at a time.
- Not date-dependent (the failing instant played no part) and not font-dependent: load-dependent, the image landing between two reads. Unmodified test with only the image delayed: 8 of 24 failed at 50-200 ms (up to 3 of 6), 0 at 0, 25, 150 and 300 ms.
- Fix (`review.spec.ts` after `:569`): wait with `expect.poll` until every `img` in the rows is `complete` with `naturalWidth > 0`; the same test then passes 50/50 across the delays. Optional hardening (not needed for the gate): reserve the image box so the dialog does not jump 23 px.

**C. ECONNRESET: harness defect (`tests/e2e/fixtures.ts`), not the product and not the clock preload.**
- A Node `fetch` of the test runner (`SeedClient.raw`, `fixtures.ts:371-376`) to the built server, reset on a reused keep-alive socket. Tests: `submission.spec.ts:67`, `automation.spec.ts:118,283`;
  all call `drainJobsFrom` (`fixtures.ts:150-168`, six `spawnSync` runs) and fetch again in the same tick.
- `spawnSync` blocks the runner while the server (Node default `keepAliveTimeout` 5 s; `src/server/index.ts:59`; no other timeout in `src/`) closes the idle socket. Probe: a blocked loop of 7 s fails with
  `read ECONNRESET` (real clock and 2027-03-14T10:30Z alike); up to 5.5 s passes. Timers are monotonic, the shifted `Date` is not involved; the preload only slows each spawned CLI (3.6 s idle, 4.9 s with the preload, more under load).
- REGATE2 ran the sweep at the default 2 workers (resets in 2 of 8 runs); REGATE3 at 6 (resets in 5 of 9); the real-clock FULL (2 workers) had none.
- Before: `submission.spec.ts:67` at 2027-03-14T10:30Z failed 12 of 12 at 6 workers and 20 of 20 at 10 workers. Fix (`fixtures.ts:372` and `:383`): send `connection: close` from `SeedClient`. After: 12/12, 20/20, and 12/12 for automation + submission at 8 workers.

**Gate method.** Keep `--workers=6` and the rerun rule. After the fixes a non-network failure at 06:58:30Z is a real finding, but any spec that reads a server date and asserts it later can straddle 07:00:00Z
(GATE had three such failures). The crossing coverage belongs to `today.spec.ts:626` alone; if more straddle failures appear, run that spec alone at 06:59:20Z and the other six specs at 06:50:00Z instead of removing the instant.

**Q6.** Repository verify run 1 took 110.7 s against 52-61 s for every other run of the same tests (run 2 passed in 60.9 s). Its own task folder shows no overlapping heavy command (mutants ended 13:51:46, run 1 ran 13:53:39-13:55:31);
other agents' load or scanning cannot be seen in the logs. No fix needed: run `verify` alone and rerun once on a timeout, recording both.

**Owned paths for one worker (WP5-UX5-FIX4).** `tests/e2e/timesheet.spec.ts`, `tests/e2e/review.spec.ts`, `tests/e2e/fixtures.ts`; then the proofs: `--repeat-each` runs above (A at 06:59:35Z with a rollover probe or the existing
`today.spec.ts:626` pattern, B with a delayed image route, C at 2027-03-14T10:30Z at 6 and 10 workers), `npm run lint`, `npm run typecheck`, `npm run verify`. Optional separate item: `src/client/styles.css:5746` or `SignoffDialog.tsx:168` to stop the 23 px shift (needs a decision, not required).
Dependencies: none; DEPS1 is independent.

Nothing is left running (every command was foreground). Slips: none of the forbidden shell forms; one rewritten script had a `rm` and `/dev/null` line that I removed before running it.

Status: done
