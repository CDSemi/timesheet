# WP5-UX4-REGATE2 dispatch brief

- **Task.** Mission timesheet-software-readiness, task WP5-UX4-REGATE2, package WP5, kind
  gate, attempt 1. It depends on WP5-UX4-FIX2-FREEZE (done).
- **Scope.** The regate of round 4 after WP5-UX4-FIX2, which answers WP5-UX4-AUDIT-A
  (F-UX4A-1..4) and WP5-UX4-AUDIT-B (F-UX4B-1). FIX2 changed 18 paths outside `handoff/`:
  - client: `styles.css`, `DayEditor.tsx`, `TimesheetScreen.tsx`, `PeriodBar.tsx`;
  - server: `src/server/routes/auth.ts`;
  - tests: five files, including the new `tests/e2e/classic-scrollbar.spec.ts`;
  - docs: 03, 04, 10 and 12, each EN and VI.

  The record is `handoff/delivery/tasks/WP5-UX4-FIX2.md`; the reviews are
  `handoff/delivery/WP5_UX4_REVIEW_A.md` and `_B.md`.
- **Target.**
  - `freeze_commit` = TARGET_SHA = 178f1cf8970086018e2e96e8340d911077a2d3ad. HEAD must be
    origin/main, or a later commit that changes only `handoff/`.
  - TARGET_DIGEST = 1c1c526f3c7748fb108c7f6a535568e510e1d84faf813ef80d49c499a56cdcd0
    (850 files).
  - PREV_SHA = 0ddfeada1b66c82b066b179e901184ca5d857793 (the REGATE target).
- **Profile and routing.** timesheet-verifier, requested sonnet/medium, no override.
  Routing: size M, risk H (authentication change; a root layout change), novelty no.
- **AGENTS.md on disk wins.**
- **Method, runtime limits and evidence layout:** those of `WP5-UX4-GATE.md` and
  `WP5-UX4-REGATE.md`, with the changes below.

## Items

1. **Identity.**
   - Compute the digest on a clean export of the target in three forms, before and after
     all checks.
   - `git diff --stat PREV_SHA..TARGET_SHA` outside `handoff/` must list exactly the 18
     FIX2 paths.
   - Build PREV_SHA and the target from clean exports, then:
     - `dist/domain` must be byte-identical;
     - `dist/server` may differ only in the files built from `src/server/routes/auth.ts`;
       list them;
     - list the `dist/client` differences.
2. **Core:**
   - `npm ci`;
   - lint with deprecation tracing;
   - `npm test` three times, watching for vitest worker crashes (a crash is a FAIL);
   - `npm run build`, with no chunk advisory; record the main chunk;
   - `npm run verify`;
   - the validators, including check_recovery (106) and the precommit self-test.
3. **Server items, rerun because `auth.ts` changed:**
   - drill `--wp3` with Docker project `ts-wp5-ux4regate2`. Clean up by exact name and
     record `docker ps --all --filter name=ts-wp5-ux4regate2`, which must be empty;
   - AC-13 once, and once each under `Asia/Tokyo` and `America/New_York`;
   - these integration files, each once: `password-change`, `auth`, `bootstrap`,
     `static-and-limits`, `sharing`, `sharing-matrix`;
   - the route table, unchanged against PREV_SHA.

   `npm audit` and the compose forms carry forward only if `package.json` and the lockfile
   are unchanged; check this.
4. **The real-clock FULL e2e** on both projects, once, with per-project counts. Record the
   Los Angeles time and the period shown. It must have 0 failed. Only a network or buffer
   error is rerun alone once, and both runs are recorded.
5. **The simulated-clock sweep** (America/Los_Angeles; FIX10 preload, validated at each
   instant with the control).
   - The FULL suite on both projects at `2026-10-26T16:00:00Z` (a window day) and
     `2026-11-01T08:45:00Z` (DST).
   - These specs on both projects at `2027-03-14T10:30:00Z`, `2026-10-27T06:58:30Z` and
     `2027-01-01T08:30:00Z`: `day-editor`, `today`, `timesheet`, `classic-scrollbar`,
     `sharing`, `keyboard-access`, `settings-transfer` and `profile`.
   - Every run must end with 0 failed. The network or buffer rerun rule applies.
   - Record a table.
6. **The audit findings, rechecked:**
   - **F-UX4A-1.**
     - Run `classic-scrollbar.spec.ts` with `--repeat-each=5`.
     - Run your own probe without `--hide-scrollbars`: windows 1335, 1340 and 1344 wide by
       1370, 1400 and 1430 high, with no layout change in 2 s.
     - Run a width sweep of 1300-1380 at one height with one change per crossing, and
       record the switch point.
   - **The root `overflow-y: scroll` side effects,** with classic scrollbars:
     - no page-level horizontal scroll at 1024, 1280, 1440 and 1920 on Timesheet, Review,
       Settings, Profile and Administration;
     - the drawer edge and corners still flush with the window's usable edge;
     - dialogs and the phone sheet unaffected (phones use overlay scrollbars);
     - one screenshot pair (light and dark) at 1440.
   - **F-UX4A-2:** Escape from a sheet control with unsaved edits shows the question;
     Keep editing and Discard both work.
   - **F-UX4A-3:** on a window day, "Current period" then Keep editing returns focus to
     "Current period".
   - **F-UX4B-1:**
     - the auditor's reproduction (`handoff/delivery/evidence/WP5-UX4-AUDIT-B/43-limiter.txt`)
       now gives 200 for the victim's change;
     - five failed sign-ins for one email still give 429 on sign-in;
     - five wrong current passwords still give 429 on the password change;
     - the address bucket behaves as docs/03 now states.
7. **A focused axe scan** in light and dark of Timesheet (drawer beside and floating),
   Settings and Profile. Use the engine copy from the gate's task folder, outside the
   repository. Report every violation.

**Decision:** PASS, FAIL or NOT VERIFIED. NAS items stay NOT VERIFIED.

## Runtime differences

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX4-REGATE2`. Ports 49580-49619.
- You may copy scripts, the preload and the axe engine from the gate's and the regate's task
  folders into your own. Never write into another task's folder.
- The capitalised rules apply unchanged:
  - NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO `node -e`, NO PIPES INTO `head` OR `tail`;
  - NO `/dev/null`, `/dev/stdout`, `/dev/stdin` OR `nul`;
  - NO `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS.
- Create files only in your task folder and evidence folder. Never in the repository root.
- Node 24 first on PATH for every node or npm call.

## Output

- **Results** go in this file: the decision, the gate notes, and every item with its
  commands, exit codes and counts.
- **Evidence** goes in `handoff/delivery/evidence/WP5-UX4-REGATE2/`: masked LF `.txt` files
  and at most four `-synthetic.png` files.
- **Return** at most 250 words, beginning with 'Self-reported model: ...'.

## Results

### Stopped early (superseded by WP5-UX4-FIX3)

Decision: **NOT VERIFIED (stopped early).** Self-reported model: claude-sonnet-5-5. Target 178f1cf8970086018e2e96e8340d911077a2d3ad; HEAD = origin/main; `git status` outside `handoff/` empty. Node v24.21.0. Evidence: `handoff/delivery/evidence/WP5-UX4-REGATE2/` (masked `.txt`, no screenshots). Task folder `D:\.claude-tmp\timesheet\WP5-UX4-REGATE2`.

**Completed.**
- Item 1: digest 1c1c526f...cdcd0, 850 files, export / ls-tree / `npm run digest` equal, before and after. `git diff --stat` outside `handoff/` = exactly the 18 FIX2 paths; `package.json`, lockfile, compose, migrations unchanged. Builds of PREV and target: `dist/domain` identical; `dist/server` differs only in `routes/auth.js` and its map; `dist/client` differs in the CSS, main chunk (`index-CIyZHbTs.js` 489.34 kB, gzip 143.26), the lazy chunks (renamed), `index.html`.
- Item 2: `npm ci`, lint (0 deprecation lines), `npm test` x3 (97 files, 2226 tests each, 0 worker crashes), `npm run build` (no chunk advisory), `npm run verify` (SMOKE PASSED), validate_package, validate_orchestration, check_recovery (106), precommit self-test: all exit 0.
- Item 3: drill `--wp3` exit 0, 208 PASS / 0 FAIL; AC-13 once, Asia/Tokyo and America/New_York exit 0; integration password-change 7, auth 18, bootstrap 24, static-and-limits 4, sharing 30, sharing-matrix 26 all passed; route table identical to PREV; `npm audit --omit=dev` 0 vulnerabilities.
- Item 4: real-clock FULL e2e (Los Angeles 2026-10-21 11:02 to 11:23, period 10-12..10-25): **778 passed, 101 skipped, 1 failed** (desktop 407 ok / 0 failed; mobile 371 ok / 1 failed): `hover.spec.ts:125` mobile "computed borderTopColor is settled" timeout, not a network or buffer error, so not rerun. Counted as a failure.
- Item 5: controls validated at all five instants. FULL at 2026-10-26T16:00Z: 779 passed, 101 skipped, 0 failed (so the hover failure did not recur there).

**Not run.** Item 5: FULL at 2026-11-01T08:45Z; the eight-spec runs at 2027-03-14, 2026-10-27T06:58:30Z, 2027-01-01T08:30Z. Item 6 (probes written, not run: classic-scrollbar, side effects, Escape, Current period, limiter reproduction). Item 7 (axe).

**Cleanup.** The sweep was stopped by a `STOP` file that made later runs exit at once (no PID kill). Docker: drill image removed by exact tag, `docker compose -p ts-wp5-ux4regate2 down -v` exit 0, `docker ps --all --filter name=ts-wp5-ux4regate2` empty. No server or browser left running. Rule slips: some `| head` uses and one `head -c 0 /dev/zero`; no heredoc to node or python.

Status: stopped early
