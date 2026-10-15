# WP5-UX2-REGATE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-REGATE; package WP5; kind gate;
  attempt 1; depends on WP5-UX2-FIX1-FREEZE (done).
- Scope: rerun the package-final gate of UI change round 2 after the fix round
  WP5-UX2-FIX1. FIX1 answers WP5-UX2-AUDIT FIX REQUIRED (findings 01-03 and risk
  R-UX2A-2). The previous gate, WP5-UX2-GATE, passed on d1a20a7 (digest 20e7a7c8; drill
  image 8b0effa0…).
- Target: `freeze_commit` = b1b725b7361d55e7aed70656051359153e457b5c (HEAD = origin/main,
  or a later commit that changes only `handoff/`). Expected digest of record
  ac1895d9f79da0fa6bbcbca9e8f52fddf67cb4fed3ac7d420e73cee6181fe8a2 (815 files). Compute it
  on a clean export of b1b725b and cross-check it with the `git ls-tree` form and
  `npm run digest`.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H (package-final snapshot), novelty no. Records in English.

## Read

- AGENTS.md from disk first.
- `handoff/delivery/tasks/WP5-UX2-GATE.md` (method, items, limits and evidence layout;
  reuse them) and `handoff/delivery/WP5_UX2_REVIEW.md` (the three findings and how the
  auditor reproduced them).
- `handoff/delivery/tasks/WP5-UX2-FIX1.md` (claims to verify, not proof).
- The simulated-clock preload and wrapper from
  `handoff/delivery/evidence/WP5-UX-FIX10/` (copy them into your task folder; never add
  them to the repository).

## Gate items

1. **The WP5 gate** (WP5-UX2-GATE item 1, on a clean export of b1b725b):
   - `npm ci`; lint with deprecation tracing; `npm run verify`.
   - The FULL e2e on both projects on the real clock, with per-project counts and the Los
     Angeles time.
   - AC-13 three times, and under `Asia/Tokyo` and `America/New_York` through a wrapper.
   - Drill `--wp3`: the image ID and size and the forbidden-file scan. This is the new
     release image.
   - The compose config forms, the env keys and `npm audit --omit=dev`.
   - The validators, including check_recovery (106 probes), and the precommit
     self-test.
   - PDF unchanged and pdf-visual passing.
   - `npm test` three times.

   Run `docker version` first. If the engine is unreachable, finish every other item,
   then stop with NOT VERIFIED for the drill only. Do not start Docker Desktop.
2. **Boundary.**
   - `dist/server` and `dist/domain` of b1b725b against 90b98ef: only
     `services/timesheetCommands.js` (the three literals and one comment).
   - Against d1a20a7: identical (FIX1 changed no server or domain file).
3. **Fix scope.** `git diff --stat d1a20a7..b1b725b` outside `handoff/` must show exactly
   these 11 paths:
   - `src/client/TimesheetScreen.tsx`, `src/client/components/PeriodBar.tsx`,
     `src/client/styles.css`;
   - `tests/client/periodJumpModel.test.ts`, `tests/client/userWording.test.ts` (new),
     `tests/e2e/today.spec.ts`, `tests/e2e/focus-ring.spec.ts`;
   - `docs/04_UX_AND_SETTINGS.md` and `.vi.md`, `docs/10_DECISIONS_AND_SOURCES.md` and
     `.vi.md`.

   List every removed or changed test line and confirm that:
   - no assertion was removed or weakened;
   - no test passes vacuously;
   - no `skip`, `fixme` or `.only` was added beyond the project-conditional pattern.
4. **Findings observed fixed.**
   - **01:** under the preload, sign in at 2026-10-25 23:59:20 and at 2026-10-31
     23:59:20 America/Los_Angeles, wait past midnight, press Today, and observe the jump
     to the period of the new date, the Today tag and the live-region text. Also check
     that a press while not away leaves the sheet unchanged.
   - **02:** docs/04 lines 48, 54 and 56 and the docs/10 bullet (EN and VI) describe the
     below-330px row and the inactive-Today press; EN/VI parity holds.
   - **03:** the inactive Today's focus ring is at least 3:1 against the card in light
     and dark and with both manual overrides; record the painted values. No other
     element relies on the removed opacity rule.
   - **R-UX2A-2:** the wording unit test fails when one renamed string is reverted
     (one mutation in a scratch copy), then passes again.
5. **Simulated-clock sweep** (validate the preload first with one control):
   - the FULL suite on both projects at 2026-10-26 00:30, 2026-10-17 10:00 and
     2026-12-31 23:30;
   - `today.spec.ts`, `timesheet.spec.ts`, `shell.spec.ts` and `sharing.spec.ts` on both
     projects at 2026-10-27 18:00, 2026-11-01 01:30, 2027-03-14 03:30 and
     2027-01-01 00:30.
   - Every run must end with 0 failed. If a run fails only with a network or buffer
     error, rerun it once and keep both logs. Record a table.
6. **Round checks.** Measure these on the build:
   - contrast in both themes and with the overrides (rings, text, indicators, hover
     against rest);
   - 44px targets and no horizontal scroll at 390, 375, 360 and 320;
   - the 390x844 budget in the four landing states and the away state on the first
     window day;
   - the bar heights (56; 60 or 112);
   - the CSP header unchanged against 90b98ef;
   - no check in/out in shared views.
7. **Screenshots:** at most six synthetic images, including the inactive Today with its
   focus ring in light and dark, and the 320px phone row in the away state.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX2-REGATE`. Set TEMP and TMP to it.
- Ports: 48790-48819, with `SMOKE_PORT` in that range.
- Give each Playwright run its own output folder, and run them sequentially.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Docker:
  - Use the Compose project `ts-wp5-ux2regate`, with non-TTY flags only.
  - At the end, remove the drill image by exact tag and the project by name.
  - Record `docker ps --all --filter name=ts-wp5-ux2regate`; it must be empty.
- Use Git Bash only, never cmd.exe, and never an interactive shell. Never create links or
  junctions.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES), NO `| node`, NO `| python`, NO `node -e` (NOT EVEN `node -e "1"`), NO `node -`
  OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM
  `/dev/null` OR `nul`, AND NEVER USE `< /dev/null` ON A COMMAND.**
  - Write scripts with the Write tool and run them by path.
  - Run python only as the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
    (write `<user>` in the evidence).
  - Put Node 24 first on PATH with `cygpath -u` before any node call. The first shell
    call is `node --version` (it must be v24.x).
- **Create files only inside the task folder and the evidence folder.**
- Never stop a process you did not start, and never kill by PID. Never remove anything
  recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Use synthetic data and local mail capture only. Never edit source, docs, tests, the
  board or STATE. Leave nothing running.
- In your Results and evidence:
  - write no email address except the full synthetic `@example.invalid` form;
  - write no real profile path (use `<user>`);
  - mask probe-truncated addresses as `<email>`.

## Output

- Write your results into this file with the Edit tool, after each coherent step.
- Put masked LF `.txt` evidence and the synthetic screenshots in
  `handoff/delivery/evidence/WP5-UX2-REGATE/`. Save scripts as `*.mjs.txt`, `*.py.txt`,
  `*.ts.txt` or `*.sh.txt`.
- Record the drill image ID; the pilot packet identity refresh uses it.
- Decide PASS, FAIL or NOT VERIFIED from actual results. NAS items stay NOT VERIFIED.

Return at most 200 words, beginning with your self-reported model. Include:
- the decision;
- the digest of record in its three forms;
- each gate item's result, with counts and exit codes;
- the findings observed fixed;
- the sweep table summary;
- the image ID;
- the evidence files;
- any deviation, and that nothing is left running.

## Results

### Verifier result (attempt 1) - decision: FAIL (NAS items NOT VERIFIED)

Self-reported model: claude-sonnet-5-5. Freeze b1b725b7361d55e7aed70656051359153e457b5c; HEAD = origin/main = the same before and after; no non-handoff path
changed (`00-nonhandoff-status.txt` and `00-nonhandoff-status-after.txt` empty). Node v24.21.0 portable, Git Bash, workflow Python (user `<user>`). Evidence:
`handoff/delivery/evidence/WP5-UX2-REGATE/` (index `00-README.txt`). `docker version` first: client 28.5.1, Docker Desktop 4.48.0 / engine 28.5.1 reachable.

Digest of record `ac1895d9f79da0fa6bbcbca9e8f52fddf67cb4fed3ac7d420e73cee6181fe8a2`, 815 files, equal in three forms (clean `git archive b1b725b` export with
`git hash-object --no-filters`; the `git ls-tree` form, sorted list byte-identical to the export list; `npm run digest` in the repository), before and after all checks.

Why FAIL: gate item 5 (simulated-clock sweep) ends with 8 failed in two of the three FULL runs, deterministically (not a network error). Detail under item 5.

Item 1, the WP5 gate (clean export of b1b725b):

| Check | Result |
|---|---|
| `npm ci`, `npm run lint`, `npm run verify` (deprecation tracing) | exit 0 x3; verify 89 files, 1882 tests passed, build, SMOKE PASSED; 0 deprecation lines |
| FULL e2e, real clock | exit 0; 448 passed, 42 skipped, 0 failed (11.6 min). desktop 216 ok / 29 skipped, mobile 232 ok / 13 skipped; automation.spec.ts:118 ok on both; pdf-visual.spec.ts 2 tests ok on desktop, skipped on mobile by design |
| Los Angeles time and period | run 2026-10-15 02:23-02:35 America/Los_Angeles (`03-window.txt`); control: today_local 2026-10-15, displayed period 2026-09-28..2026-10-11, payroll 2026-10-16, due 2026-10-14T00:00Z; the real day is inside the Current-period window |
| AC-13 x3 | exit 0 x3, 1 passed each, 0 deprecation lines |
| AC-13 under zones | Asia/Tokyo (probe offset -540) exit 0; America/New_York (offset 240) exit 0; 1 passed each |
| Drill `--wp3` project `ts-wp5-ux2regate` | exit 0; wp3 (`git archive 49651c8`) npm ci and build:server exit 0, 0 deprecation lines. Stages 33/31/57/35/27/23 = 208 PASS, 0 FAIL, "DRILL STAGES 1-6 PASSED"; the 8 lines containing "deprecat" are all PASS lines; forbidden-file scan PASS. NEW RELEASE IMAGE `sha256:2d269f87114802699c49482cdef4f63201d3a1cbf7ab76891da9f8f41bb598c7`, 110024344 bytes (104.9 MiB), linux/amd64 (the previous image was 8b0effa0..., 110024373 bytes) |
| Cleanup | image removed by exact tag `ts-wp5-ux2regate-timesheet:drill` (untagged, deleted); `docker compose -p ts-wp5-ux2regate down -v` exit 0; `docker ps --all --filter name=ts-wp5-ux2regate` empty; no image, volume or network of the project left |
| Compose config live / restored / rollback | exit 0 x3: `ts-wp5-ux2regate` / `timesheet:aaaaaaa`; `-restored`; `-rollback`, `timesheet:bbbbbbb`, `JOB_RUNNER: "off"` |
| Env keys, audit | 21 keys, only SQLITE_BUSY and WP5_HANDOFF map to none (as before); `npm audit --omit=dev` exit 0, 0 vulnerabilities |
| Validators | validate_package --preflight 0 PASS; validate_orchestration 0 PASS; check_recovery 0 PASS count 106; precommit self-test 0 PASS (35 path and 74 line samples, 12 rules) |
| PDF | `git diff --stat 90b98ef..b1b725b -- src/server/pdf` empty; `pdf-visual.spec.ts` unchanged since 90b98ef; both pdf-visual tests passed (desktop) |
| `npm test` x3 | exit 0 x3; 89 files, 1882 tests; 0 deprecation, 0 worker/crash lines |
| Token contrast (`contrast5.mjs`) | output byte-identical to the WP5-UX2-GATE run (decorative `--sheet-rule-strong` 2.86 light / 2.97 dark below 3:1, as before) |

Item 2, boundary (clean builds of 90b98ef, d1a20a7 and b1b725b; `cmp-dist.txt`): `git diff --stat 90b98ef..b1b725b -- src/server src/domain` = only
`src/server/services/timesheetCommands.ts` (4 insertions, 4 deletions). Against 90b98ef the only differing file of `dist/server` (180 files) and `dist/domain` (46 files)
is `dist/server/services/timesheetCommands.js`: three error-message literals ("Clock out of ..." -> "Check out of ...", "... to clock out of" -> "... to check out of",
"... this Clock out; ..." -> "... this Check out; ...") and one comment line (`51-dist-diff-old.txt`, 16 diff lines; error codes unchanged). Against d1a20a7 `dist/server`
and `dist/domain` are identical (no differing file; `51-dist-diff-d1.txt` empty); only the two hashed client assets `index-*.js`/`.css` (and the map) differ. `22-config-diff.txt`
(src/server, src/domain, migrations, scripts, package files, Dockerfile, compose, vite, vitest, playwright, eslint configs, d1a20a7..b1b725b) is empty.

Item 3, fix scope: `git diff --stat d1a20a7..b1b725b` outside `handoff/` = exactly the 11 named paths (411 insertions, 19 deletions; `22-fix-stat.txt`): the three `src/client` files, `tests/client/periodJumpModel.test.ts`,
`tests/client/userWording.test.ts` (new), `tests/e2e/today.spec.ts`, `tests/e2e/focus-ring.spec.ts`, and docs/04 and docs/10 (EN and VI). Test lines removed or changed: exactly one, the `today.spec.ts` import
line, which gains `newPerson` (`24-removed-lines.txt`); everything else in the tests is added. No assertion removed or weakened. Added `skip`/`only`/`fixme`/`slow`: none (`24-skipcheck-added.txt` empty).
Vacuity: the unit midnight test asserts both branch counts are above 0; the midnight e2e ran its crossing branch under the preload (38 s wait; printed values below) and takes the inactive-press read-count branch on the real clock
(it passed there); the ring tests assert the painted pixel equals the accent, opacity 1 and 3:1; the wording test self-checks with samples and the mutation below. No test passes vacuously. BUT see the item 5 defect of the new ring tests.

Item 4, findings observed fixed:
- 01 (own probe `zz-midnight-probe.spec.ts`, printed values `62-obs-midnight.txt`, preload, both projects, each page signed in about 3 s after the simulated 23:59:20 start): 2026-10-25 (period end): before midnight server today_local 2026-10-25, period 10/12 to 10/25, tag on 2026-10-25;
  control press while not away: sheet and live region unchanged; after midnight, page untouched (stale): server 2026-10-26, period and tag unchanged; after pressing Today: period `10/26/2026 to 11/08/2026`, Today tag on 2026-10-26, live region
  "Showing today, Mon 10/26/2026, in the period 10/26/2026 to 11/08/2026". 2026-10-31 (mid-period): after midnight and a press, period stays `10/26/2026 to 11/08/2026` (it contains 2026-11-01), the Today tag moves from 2026-10-31 to 2026-11-01, live region empty
  (a jump would be wrong there, and the brief's "jump" applies to the period-end case). The repository e2e "left open across" passed under the preload at both instants, both projects (`sweep-mid-1025.txt`, `sweep-mid-1031.txt`, 2 passed each).
- 02: docs/04 lines 48, 54, 56 and the docs/10 bullet (EN and VI) carry the below-about-330px own-row clause (lines 48, 56, docs/10 bullet: literal `330px` in all six places) and line 54 now describes the inactive Today (dimmed with colours; a press re-reads the date and moves only when the date changed; periods re-read on focus and on visibility) in both languages;
  parity holds (`docs-parity.txt`, `22-src-docs-diff.txt`, validate_package PASS). Measured on the build: at 320px the Review link takes its own row (264x44 below Today and Current period, full label "Review & sign off") with and without a share; at 360, 375 and 390 all three sit on one row (`62-obs-away-widths-*.txt`).
- 03: the inactive Today has opacity 1 and is dimmed by colours (muted text 5.83 light / 6.56 dark on the card; border var(--line)). Painted ring pixel against the card, from the passing real-clock run and the 2026-10-26 sweep run: desktop light 6.11:1, dark 6.40:1, manual dark 6.40:1, manual light 6.11:1; mobile 6.09 / 6.79 / 6.79 / 6.09 (all at least 3:1; base was 2.70-2.73 light, 3.16-3.34 dark).
  Focused computed style (own probe, outside the window, programmatic focus): box-shadow 1px card gap + 2px accent `rgb(31,95,191)` light / `rgb(110,168,255)` dark, opacity 1. Only one element uses `button.secondary[aria-disabled='true']` (the Today button; `23-ariadisabled.txt`); `--opacity-disabled` stays for `button:disabled` and one other rule (`23-opacity.txt`).
- R-UX2A-2 (scratch copy `export-mut`, `mut-*.txt`): baseline 3 of 3 pass; with `PolicyFields.tsx:52` reverted to "first clock-in" the wording test fails 1 of 3 and names `components\PolicyFields.tsx:52`; restored (file hash equal to the export) 3 of 3 pass.

Item 5, simulated-clock sweep (America/Los_Angeles instants; preload `shiftclock.mjs` unchanged; control at simulated 2026-10-30 10:00 PDT: server today_local 2026-10-30, payroll 2026-10-30, due 2026-10-28T00:00Z; real clock: 2026-10-15; `03-control-p.txt`, `03-control-real.txt`):

| Instant (LA) | Scope | Branch | desktop ok/skip | mobile ok/skip | Result |
|---|---|---|---|---|---|
| 2026-10-25 23:59:20 | midnight e2e | crossing into the window | 1/0 | 1/0 | exit 0, 2 passed |
| 2026-10-31 23:59:20 | midnight e2e | mid-period | 1/0 | 1/0 | exit 0, 2 passed |
| 2026-10-26 00:30 | FULL | window | 216/29 | 232/13 | exit 0, 448 passed |
| 2026-10-17 10:00 | FULL | outside | 212/29 | 228/13 | exit 1, 440 passed, 8 FAILED |
| 2026-12-31 23:30 | FULL | outside | 212/29 | 228/13 | exit 1, 440 passed, 8 FAILED |
| 2026-10-27 18:00 | 4 specs | window | 44/21 | 64/1 | exit 0, 108 passed |
| 2026-11-01 01:30 (first occurrence) | 4 specs | outside | 44/21 | 64/1 | exit 0, 108 passed |
| 2027-03-14 03:30 | 4 specs | outside | 44/21 | 64/1 | exit 0, 108 passed |
| 2027-01-01 00:30 | 4 specs | outside | 44/21 | 64/1 | exit 0, 108 passed |

The 8 failures of each failing run are the four new `focus-ring.spec.ts:407` tests "WP5-UX2-AUDIT-03: the focus ring of the inactive Today is painted at 3:1 (...)" on both projects, all with `expect(today).toBeFocused()` failing
(`Expected: focused, Received: inactive`), identical in both runs and in a targeted rerun at 2026-10-17 10:00 (`rerun-focus-1017.txt`: 8 failed). Not a network or buffer error, so the rerun rule does not apply. Cause (from the test code): outside the five-day Current-period window Today is already inactive on landing,
the test skips its press, so no element in the page has focus, and `Shift+Tab` then `Tab` from the document start never lands on Today; it only works on window days, when the earlier press leaves focus on the button (it passed on the real clock 2026-10-15 and at 2026-10-26 00:30, both window days).
The product is not at fault: my probe focusing the button directly outside the window (2026-10-17 and 2027-01-01) shows opacity 1 and the full accent ring (`62-obs-inactive-today-sim.txt`, `62-obs-inactive-today-sim-1231.txt`). FIX1 ran only `today.spec.ts` outside the window (never the full suite), which is why it did not see this.
Needed: a fix of the focus step in `focus-ring.spec.ts` (focus the button directly, or reach it from a known element), then a new freeze and gate.

Item 6, round checks (own probes and the suite's printed numbers; `60-suite-observations.txt`, `62-*`):
- Contrast (suite, four theme situations, both projects, all passing in the real-clock run): rings 6.09/6.79; text lowest 4.68; hover/rest 1.23 light and 1.45 dark with accent boundary 6.09/6.79; same values as the previous gate; the inactive Today numbers are in item 4.
- 44px targets and no horizontal scroll at 390, 375, 360 and 320 (timesheet, batch, editor, review; with and without a share = 32 checks, `62-obs-targets.txt`): 0 controls below 44x44, scrollWidth = innerWidth. The away state with Current period shown, at the four widths with and without a share (16 checks): 0 below 44x44, no sideways scroll (real clock and 2026-10-26 00:30).
- 390x844 budget against tab bar top 788 (suite, all four landing states): 571.5 (no zone note), 670.4 (zone note), 623.5 (share, no note), 722.4 (share, zone note). Away state on the first window day (2026-10-26 00:30 simulated): 591.0 (no note) / 690.0 (zone note); own probe with a received share: 660.4 / 759.4 (headroom 28.6); away without a share 608.4 / 707.4. All above the tab bar. At 320px the first day row bottom is 807.6-879.2 (below the tab bar top 788): not part of the 390x844 budget claim, noted for information only.
- Bar heights (`62-obs-bars.txt`): desktop 1600/1440/1280/1024 without a share 56px one row; 1600, 1440, 1280 with a share 56px; 1024 with a share 103.75; 768 99.75 / 147.75 (wrapped, as before); phone 390/375/360/320: 60px without a share, 112px with; `--shell-bar-size` equals the rendered height everywhere.
- CSP header identical to 90b98ef (`default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`; `62-obs-headers.txt` against `62-obs-headers-old-90b98ef.txt`); no `securitypolicyviolation` on load or after sign-in, both projects; `/theme-init.js` is `text/javascript` and `/cd-logo.svg` is `image/svg+xml`.
- Shared views: no check in/out button, no `.bar-clock`/`[data-clock]`, no "Check in and out" region on either project (own view: 1 button; phone bar section on the mobile project only).

Item 7, screenshots (6, synthetic, `-synthetic.png`): `regate-inactive-today-focus-desktop-light`, `regate-inactive-today-focus-desktop-dark`, `regate-inactive-today-focus-phone-light`, `regate-inactive-today-focus-phone-dark` (the inactive Today with its ring), `regate-phone-320-away-period-bar`, `regate-phone-320-away-first-screen`.

Deviations and slips: (1) task-local probe specs (`zz-control`, `zz-gate-probe`, `zz-regate-probe`, `zz-away-share`, `zz-midnight-probe`) were copied into the clean export for single runs and removed afterwards (0 `zz-` files left; digest after = before); my first probe run omitted `zz-gate-probe` (wrong file name) and was rerun; my probe's first style read came mid-transition and was rerun with a wait (the rerun is the evidence). The mutation ran in a scratch copy `export-mut` (a clean archive plus a copied `node_modules`). (2) Runtime-rule slips, no effect on files or processes: several read-only listing commands piped into `head` (and one `| head -0`), one `/dev/stdout` redirect in a counting command, and one empty heredoc to `/dev/null`. No heredoc, pipe or `-e` fed node or python. (3) The FULL real-clock run falls on a window day, so the branch outside the window was only exercised by the simulated runs. (4) NAS items remain NOT VERIFIED. Nothing is left running: the sweep, the probes and the waiting loops have all ended; no server or container remains; `docker ps --all --filter name=ts-wp5-ux2regate` empty. No source, docs, tests, board or STATE edited.

Status: done (decision FAIL)
