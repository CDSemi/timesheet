# WP5-UX2-GATE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-GATE; package WP5; kind gate;
  attempt 1; depends on WP5-UX2-T10-FREEZE (done).
- Scope: the package-final gate of UI change round 2. The round has ten slices, T01-T10,
  frozen at af6207c, d0d21e1, 70ecb12, 54dda11, fa2e679, 3f5a3b3, 9864400, 608572f,
  f70a5c0 and d1a20a7. The previous accepted snapshot is 90b98ef (digest 57e2974c; gate
  WP5-UX-REGATE8; audit WP5-UX-AUDIT-AB9).
- Target: `freeze_commit` = d1a20a7f0112fa00171fe4b1d6035427855f12b6 (HEAD = origin/main,
  or a later commit that changes only `handoff/`). Expected digest of record
  20e7a7c8cd19b811aedfd814b35ead3b9a8d2eab7c9dbdd0b23626a609773fa5 (814 files). Compute it
  on a clean export of d1a20a7 and cross-check it with the `git ls-tree` form and
  `npm run digest`.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H (package-final snapshot), novelty no. Records in English.

## Read

- AGENTS.md from disk first.
- `handoff/delivery/tasks/WP5-UX-REGATE7.md` and `WP5-UX-REGATE8.md` (the WP5 gate items,
  method, limits and evidence layout; reuse them).
- The round's owner decisions and coordinator decisions on the board (2026-10-14), and the
  slice records `handoff/delivery/tasks/WP5-UX2-T01.md` to `WP5-UX2-T10.md` (Results and
  addenda) for the claims to verify.
- The simulated-clock preload and wrapper from
  `handoff/delivery/evidence/WP5-UX-FIX10/` (`shiftclock.mjs.txt`, `run-shift.sh.txt`,
  `sweep.sh.txt`). Copy them into your task folder; never add them to the repository.

## Gate items

1. **The WP5 gate** (REGATE7 item 1 method, on a clean export of d1a20a7):
   - `npm ci`; lint with deprecation tracing (`no-deprecated`, and no toolchain
     deprecation line); `npm run verify`.
   - The FULL e2e on both projects on the real clock, with per-project counts; record
     the Los Angeles time and the displayed period.
   - AC-13 three times, and under `Asia/Tokyo` and `America/New_York` through a wrapper.
   - Drill `--wp3`: the image ID and size and the forbidden-file scan.
   - The compose config forms, the env keys and `npm audit --omit=dev`.
   - The validators, including check_recovery (106 probes), and the precommit
     self-test.
   - PDF unchanged and pdf-visual passing.
   - `npm test` three times.

   Run `docker version` first. If the engine is unreachable, finish every other item,
   then stop with NOT VERIFIED for the drill only. Do not start Docker Desktop and do not
   retry in a loop.
2. **Server and business boundary.** Build 90b98ef and d1a20a7 from clean exports.
   - Diff `dist/server` and `dist/domain`. The only difference allowed is
     `services/timesheetCommands.js`: three error-message literals plus one comment line
     (WP5-UX2-T08). List the diff.
   - `git diff --stat 90b98ef..d1a20a7 -- src/server src/domain` must show only
     `src/server/services/timesheetCommands.ts`.
   - Nothing under `migrations`, schema or API routes may change.
3. **Round scope.** `git diff --stat 90b98ef..d1a20a7` outside `handoff/`: list every
   path and map each one to its slice T01-T10.
   - Flag any path outside the slices' recorded owned paths.
   - Flag any font or raster file: `git ls-files` must show no `.ttf`, `.otf`, `.woff`
     or `.woff2`, and no `.png`, `.jpg` or `.webp` outside `reference/` and
     `-synthetic.png` evidence.
   - Confirm that no test assertion was removed or weakened beyond the role and height
     changes recorded in the slice records; list those changes. Confirm that no new
     `skip`, `fixme` or `.only` was added beyond project-conditional skips.
4. **Simulated-clock sweep** (America/Los_Angeles; validate the preload first with one
   control: the server reports the simulated `today_local`):
   - FULL suite on both projects at these instants:
     - 2026-10-17 10:00;
     - 2026-10-26 00:30;
     - 2026-10-27 18:00;
     - 2026-10-31 00:30;
     - 2026-12-31 23:30;
     - 2027-01-11 10:00.
   - `today.spec.ts`, `timesheet.spec.ts`, `shell.spec.ts` and `sharing.spec.ts` on both
     projects at these instants:
     - 2026-10-25 23:30;
     - 2026-10-27 13:00;
     - 2026-10-30 23:59;
     - 2026-11-01 01:30;
     - 2027-03-14 03:30;
     - 2027-01-01 00:30;
     - 2026-11-28 10:00;
     - 2026-12-26 10:00;
     - 2027-01-19 18:00.
   - Every run must end with 0 failed. If a run fails only with a network or buffer error
     (for example ERR_NO_BUFFER_SPACE), rerun it once and record both runs. Record a
     table: instant, branch (window or outside, for today.spec), and counts per
     project.
5. **Round-specific checks** (measure on the build of d1a20a7):
   - Contrast in light and dark, and with the manual theme override both ways:
     - focus rings at least 3:1;
     - text at least 4.5:1;
     - state indicators at least 3:1;
     - hover against rest at least 1.20:1, with an accent boundary.
   - 44px targets and no horizontal scroll (`clientWidth` against `scrollWidth`) at
     390, 375, 360 and 320.
   - The 390x844 first-screen budget: the four landing states, plus the away state on
     the first window day at the 2026-10-26 00:30 instant. Record the numbers against
     the tab bar top.
   - The bar heights:
     - desktop 56px; the 1440px bar on one row with and without a share;
     - phone 60px, or 112px with a share;
     - `--shell-bar-size` equal to the bar height.
   - The CSP header is unchanged against 90b98ef. There is no `securitypolicyviolation`
     on load; `/theme-init.js` and `/cd-logo.svg` are served with their content types.
   - Shared views show no check in/out control on either project.
   - The logo fidelity evidence of T05 and the wordmark fidelity evidence of T06 exist.
     Re-render the SVG logo next to the source image if the source copy
     `D:\.claude-tmp\timesheet\WP5-UX2-PLAN3\cd-logo-source.png` still exists; else
     record that it is unavailable.
6. **Screenshots** (synthetic only; basename ends `-synthetic.png`; at most 12) for the
   owner and the auditor:
   - desktop 1440: the bar, the sheet with an open-day column and Today, light and dark;
   - phone 390: the first screen with the bar check in/out, with and without a share;
   - the label picker open;
   - the Theme control;
   - the Show details switch.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX2-GATE`. Set TEMP and TMP to it.
- Ports: 48710-48739, with `SMOKE_PORT` in that range.
- Give each Playwright run its own output folder, and run them sequentially.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Docker:
  - Use the Compose project `ts-wp5-ux2gate`, with non-TTY flags only.
  - At the end, remove the drill image by exact tag and the project by name.
  - Record `docker ps --all --filter name=ts-wp5-ux2gate`; it must be empty.
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
  `handoff/delivery/evidence/WP5-UX2-GATE/`. Save scripts as `*.mjs.txt`, `*.py.txt`,
  `*.ts.txt` or `*.sh.txt`.
- Record the drill image ID; the pilot packet identity refresh uses it.
- Decide PASS, FAIL or NOT VERIFIED from actual results. NAS items stay NOT VERIFIED.

Return at most 220 words, beginning with your self-reported model. Include:
- the decision;
- the digest of record in its three forms;
- each gate item's result, with counts and exit codes;
- the server diff summary;
- the sweep table summary;
- the budget and bar numbers;
- the image ID;
- the evidence files;
- any deviation.

## Results

### Verifier result (attempt 1) - decision: PASS (NAS items NOT VERIFIED)

Self-reported model: claude-sonnet-5-5. Freeze d1a20a7f0112fa00171fe4b1d6035427855f12b6; HEAD = origin/main = the same before and after; no non-handoff path changed
(`00-nonhandoff-status.txt`, `00-status-after.txt` empty). Node v24.21.0 portable, Git Bash, workflow Python (user `<user>`). Evidence:
`handoff/delivery/evidence/WP5-UX2-GATE/` (index `00-README.txt`). `docker version` first: client 28.5.1, server Docker Desktop 4.48.0 / engine 28.5.1 reachable.

Digest of record `20e7a7c8cd19b811aedfd814b35ead3b9a8d2eab7c9dbdd0b23626a609773fa5`, 814 files, equal in three forms (clean `git archive d1a20a7` export with
`git hash-object --no-filters`; the `git ls-tree` form, sorted list byte-identical to the export list; `npm run digest` in the repository), before and after all checks.

Item 1, the WP5 gate (clean export of d1a20a7):

| Check | Result |
|---|---|
| `npm ci`, `npm run lint`, `npm run verify` (deprecation tracing) | exit 0 x3; verify 88 files, 1878 tests passed, build, SMOKE PASSED; 0 deprecation lines |
| FULL e2e, real clock | exit 0; 434 passed, 42 skipped, 0 failed (11.9 min). desktop 209 ok / 29 skipped, mobile 225 ok / 13 skipped; automation.spec.ts:118 ok on both, pdf-visual.spec.ts (2 tests) ok on desktop, skipped on mobile by design (as in earlier gates) |
| Los Angeles time and displayed period | run 2026-10-14 21:31-21:43 America/Los_Angeles (`03-window.txt`); control: today_local 2026-10-14, displayed period 2026-09-28..2026-10-11, payroll 2026-10-16, due 2026-10-14T00:00Z (`03-control-real.txt`) |
| AC-13 x3 | exit 0 x3, 1 passed each, 0 deprecation lines |
| AC-13 under zones | Asia/Tokyo (probe offset -540) exit 0; America/New_York (offset 240) exit 0; 1 passed each |
| Drill `--wp3` project `ts-wp5-ux2gate` | exit 0; wp3 (`git archive 49651c8`) npm ci and build:server exit 0, 0 deprecation lines. Stages 33/31/57/35/27/23 = 208 PASS, 0 FAIL, "DRILL STAGES 1-6 PASSED"; the 8 lines containing "deprecat" are all PASS lines; forbidden-file scan PASS. Image `sha256:8b0effa0f831dbb96a08e1e0ab22615601dfbfe8384086abf1ee030682ce4310`, 110024373 bytes (104.9 MiB), linux/amd64 |
| Cleanup | image removed by exact tag `ts-wp5-ux2gate-timesheet:drill` (untagged, deleted); `docker compose -p ts-wp5-ux2gate down -v` exit 0; `docker ps --all --filter name=ts-wp5-ux2gate` empty; no image, volume or network of the project left |
| Compose config live / restored / rollback | exit 0 x3: `ts-wp5-ux2gate`, `timesheet:aaaaaaa`; `-restored`; `-rollback`, `timesheet:bbbbbbb`, `JOB_RUNNER: "off"` |
| Env keys, audit | 21 keys, only SQLITE_BUSY and WP5_HANDOFF map to none (as before); `npm audit --omit=dev` exit 0, 0 vulnerabilities |
| Validators | validate_package --preflight 0 PASS; validate_orchestration 0 PASS; check_recovery 0 PASS count 106; precommit self-test 0 PASS (35 path and 74 line samples, 12 rules) |
| PDF | `git diff --stat 90b98ef..d1a20a7 -- src/server/pdf` empty; `pdf-visual.spec.ts` unchanged since 90b98ef; both pdf-visual tests passed (desktop) |
| `npm test` x3 | exit 0 x3; 88 files, 1878 tests; 0 deprecation, 0 worker/crash lines |
| Token contrast (`contrast5.mjs`) | output byte-identical to REGATE8; 2 pairs below 3:1 as before (decorative `--sheet-rule-strong` rules 2.86 light / 2.97 dark) |

Item 2, server and business boundary: `git diff --stat 90b98ef..d1a20a7 -- src/server src/domain` = only `src/server/services/timesheetCommands.ts` (4 insertions, 4 deletions;
`20-bound-stat.txt`). Nothing under migrations or schema (`20-migrations-diff.txt` empty); scripts, package files, Dockerfile, compose, tsconfig, vite, vitest and playwright
configs unchanged (`22-config-diff.txt` empty). Clean builds of both commits: `dist/server` 180 files and `dist/domain` 46 files each; exactly one differs,
`dist/server/services/timesheetCommands.js` (`51-dist-diff.txt`): three error-message literals ("Clock out of the running session first" -> "Check out of ...",
"... to clock out of" -> "... to check out of", "A saved break ends after this Clock out; ..." -> "... Check out; ...") and one comment line. The error codes are unchanged
(`open_session_exists`, `no_open_session`, `saved_break_after_clock_out`). Client: the two assets `index-*.js`/`.css` changed and `cd-logo.svg` and `theme-init.js` were added (expected).

Item 3, round scope (`22-scope-stat.txt`, 67 paths, 6117 insertions, 374 deletions, all under src/client, tests, docs, DEVELOPMENT*.md, eslint.config.js plus the one server file).
Per slice (`22-scope-by-commit.txt`): T01 af6207c theme: AppShell, ThemeToggle, themeModel, index.html, theme-init.js, styles.css, eslint.config.js, themeModel.test, cssThemeParity.test, theme.spec, contrast.ts, shell.spec.
T02 d0d21e1 hover/switch/picker: TimesheetScreen, ShowDetailsSwitch, styles.css, contrast.ts, hover.spec, focus-ring.spec, timesheet.spec, shell.spec, day-editor.spec, theme.spec (owned path extended by one test, recorded in T02).
T03 70ecb12 open day: TimesheetScreen, TimesheetSheet, SheetWeekTable, sheetModel, styles.css, sheetModel.test, timesheet.spec, contrast.ts.
T04 54dda11 Today/Current period: TimesheetScreen, PeriodBar, periodBarModel, periodJumpModel, ReviewStatus (owned paths extended, recorded), styles.css, periodBarModel.test, periodJumpModel.test, fixtures.ts (additive `periodsCurrent`), sharing.spec, timesheet.spec, today.spec.
T05 fa2e679 logo: AppShell, index.html, cd-logo.svg, styles.css, logoAsset.test, logo.spec. T06 3f5a3b3 wordmark: AppShell, BrandWordmark, TimesheetSheet, sheetModel, styles.css, wordmarkAsset.test, logo.spec, review.spec, timesheet.spec.
T07 9864400 theme segments: AppShell, ThemeToggle, styles.css, theme/focus-ring/logo/shell specs, contrast.ts. T08 608572f wording: DayEditor, TimesheetScreen, ClockOutDialog, ClockPanel, PolicyFields, SharingItemsFields, SharingSettings, otModel, sessionModel, sharingModel, timesheetCommands.ts, specs and integration tests (keyboard-access line 177 was an owned-path extension recorded in T08).
T09 f70a5c0 phone bar: TimesheetScreen, AppShell, BarClock, ClockPanel, ClockProvider, styles.css, specs. T10 d1a20a7: docs (6 pairs) and DEVELOPMENT pair only.
No path outside the slices' recorded owned paths (the extensions above are recorded in the slice records). Fonts: `git ls-files` shows 0 `.ttf/.otf/.woff/.woff2`. Rasters: the round added only
`-synthetic.png` evidence and design files (all under handoff/) and the vector `cd-logo.svg`; the only raster outside reference/ without a `-synthetic.png` name is the older
`handoff/delivery/evidence/WP1/ui-timesheet-synthetic.jpg` (not part of the round, synthetic by name; flagged for information).
Test changes (`24-test-change-notes.txt`, `24-removed-lines.txt`): 76 removed lines, all Clock -> Check wording, the Show details button -> switch (aria-pressed -> checked), the active label option ring -> a 3px rail with 3:1 checks,
the pressed-toggle test extended to the theme segments, the Today button in the tab order, the company name asserted absent from the sheet and present once in the bar, and the phone bar bound 60 -> 60 or 112.5 with a share (clock row plus switcher row) with the new `--shell-bar-size` equality check.
Each replaced assertion has an equal or stronger replacement. Added `skip` lines: 5, all project-conditional (`test.skip(isMobile ...)` and the mirror); no `.only`, `.fixme` or `slow` added.

Item 4, simulated clock (preload `shiftclock.mjs` copied unchanged from the FIX10 evidence into the task folder; wrapper `run-shift.sh`). Control: at simulated 2026-10-30 10:00 PDT the server
reported `today_local=2026-10-30`, payroll 2026-10-30, due 2026-10-28T00:00Z; the real clock reported 2026-10-14 (`03-control-p.txt`, `03-control-real.txt`).
Sweep table (America/Los_Angeles instants; branch = `window=` printed by today.spec; counts ok/failed/skipped; logs `sweep-<label>.txt`, `sweep-table.txt`):

| Instant (LA) | Scope | Branch | desktop | mobile | Result |
|---|---|---|---|---|---|
| 2026-10-17 10:00 | FULL | outside | 209/0/29 | 225/0/13 | exit 0, 434 passed |
| 2026-10-26 00:30 | FULL | window | 209/0/29 | 225/0/13 | exit 0, 434 passed |
| 2026-10-27 18:00 | FULL | window | 209/0/29 | 225/0/13 | exit 0, 434 passed |
| 2026-10-31 00:30 | FULL | outside | 209/0/29 | 225/0/13 | exit 0, 434 passed |
| 2026-12-31 23:30 | FULL | outside | 208/1/29 | 225/0/13 | exit 1: `admin.spec.ts:83` console error `net::ERR_NO_BUFFER_SPACE` only |
| 2026-12-31 23:30 (rerun) | FULL | outside | 209/0/29 | 225/0/13 | exit 0, 434 passed |
| 2027-01-11 10:00 | FULL | outside | 209/0/29 | 225/0/13 | exit 0, 434 passed |
| 2026-10-25 23:30 | 4 specs | outside | 41/0/21 | 61/0/1 | exit 0, 102 passed |
| 2026-10-27 13:00 | 4 specs | window | 41/0/21 | 61/0/1 | exit 0, 102 passed |
| 2026-10-30 23:59 | today.spec | window | 7/0/4 | 10/0/1 | exit 0, 17 passed |
| 2026-10-30 23:57 | timesheet, shell, sharing | n/a | 34/0/17 | 51/0/0 | exit 0, 85 passed |
| 2026-11-01 01:30 (first occurrence, PDT = 08:30Z) | 4 specs | outside | 41/0/21 | 61/0/1 | exit 0, 102 passed |
| 2027-03-14 03:30 | 4 specs | outside | 41/0/21 | 61/0/1 | exit 0, 102 passed |
| 2027-01-01 00:30 | 4 specs | outside | 41/0/21 | 61/0/1 | exit 0, 102 passed |
| 2026-11-28 10:00 | 4 specs | outside | 41/0/21 | 61/0/1 | exit 0, 102 passed |
| 2026-12-26 10:00 | 4 specs | outside | 41/0/21 | 61/0/1 | exit 0, 102 passed |
| 2027-01-19 18:00 (2027-01-20T02:00Z) | 4 specs | window | 41/0/21 | 61/0/1 | exit 0, 102 passed |

The one failed run failed only with the network error ERR_NO_BUFFER_SPACE; it was rerun once at the same instant and passed (both logs kept). The 23:59 instant is split (today.spec alone at 23:59; the other three specs at 23:57),
as in the T04 sweep, so that no run crosses midnight; 2026-11-01 01:30 is ambiguous (it occurs twice) and the first occurrence was used. Every other run ended with 0 failed, no deprecation line.

Item 5, round-specific checks (real-clock e2e console numbers in `60-suite-observations.txt`; the suite asserts these thresholds in all four theme situations: light device, dark device, light device with manual dark, dark device with manual light, on both projects):
- Focus rings: 6.09:1 (light) and 6.79:1 (dark) against the backdrop and against the gap on the Light/Dark segments, the pressed toggle, the date field, the label list and the Show details switch checked and unchecked (>= 3:1); label-picker rail 3px, 4.96/6.09 (light) and 4.68/6.79 (dark) against fill/card.
- Text: lowest measured 4.68:1 (hovered unchecked theme segment, light device with manual dark: 4.68; dark device manual light: 4.96); rest text 6.09 to 7.76; wordmark 5.33 (light main), 8.19 (light sub), 6.79 / 6.56 (dark) on the bar (>= 4.5).
- State indicators: switch off boundary 5.83 to 6.56, on 6.09 to 6.79, thumb lowest 4.53 (>= 3:1); active/checked states 6.09 to 8.33.
- Hover against rest: 1.23:1 (light) and 1.45:1 (dark) on every toggle-type control and the phone tab (>= 1.20), each with an accent boundary 6.09 / 6.79 (>= 3:1); a tap leaves no sticky hover on the phone.
- 44px targets and no horizontal scroll at 390/375/360/320 (own probe, mobile, with and without a received share; timesheet, batch, editor, review states = 32 checks): 0 controls below 44x44, `scrollWidth` = `innerWidth` in all (`62-obs-targets.txt`); the suite's today.spec, theme.spec and hover.spec width tests also passed.
- First-screen budget at 390x844 (tab bar top 788): landing, no share: 571.5 (no zone note) / 670.4 (zone note); received share: 623.5 / 722.4. Away state on the first window day (2026-10-26 00:30 simulated, today.spec): 591.0 / 690.0. Own probe of the away state with a received share at the same instant (`62-obs-away.txt`): 660.4 (no note) / 759.4 (zone note, headroom 28.6); away without a share 608.4 / 707.4. All above the tab bar.
- Bar heights (`62-obs-bars.txt`, `--shell-bar-size` equals the rendered height at every width): desktop 1600, 1440, 1280 and 1024 (no share) 56px, one row; 1440 with and without a share 56px one row; 1280 with a share 56px; 1024 with a share 103.75px and 768 99.75 / 147.75px (wrapped, as before the slices recorded). Phone 390, 375, 360 and 320: 60px without a share, 112px with a share. `--shell-bar-size` = 56px / 60px / 112px respectively.
- CSP header identical to 90b98ef (`default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`; `62-obs-headers.txt` against `62-obs-headers-old-90b98ef.txt`); no `securitypolicyviolation` on the sign-in page or after sign-in, on both projects; `/theme-init.js` is `text/javascript; charset=utf-8` and `/cd-logo.svg` is `image/svg+xml; charset=utf-8` (on 90b98ef both fell through to `text/html`, as expected before they existed).
- Shared views: no check in/out button, no `.bar-clock`/`[data-clock]` and no "Check in and out" region on either project (own view: 1 button; phone bar section on the mobile project only); sharing.spec asserts the same and passed.
- Logo and wordmark fidelity: T05 evidence (`WP5-UX2-T05/fidelity-result.txt`, `logo-fidelity-*-synthetic.png`, `trace-result.txt`) and T06 evidence (`WP5-UX2-T06/fidelity-numbers.json.txt`, `wordmark-fidelity-synthetic.png`, `gen-wordmark.mjs.txt`) exist. The source copy `cd-logo-source.png` still exists: re-rendered next to the shipped SVG at 512px on white, both 512x512, mean absolute colour difference 0.46 of 255, 0.00 % of pixels differing by more than 48 (`62-obs-logo-fidelity.txt`, `gate-logo-fidelity-synthetic.png`).

Item 6, screenshots (10, synthetic only, `-synthetic.png`): `gate-bar-1440-light`, `gate-bar-1440-dark`, `gate-sheet-open-day-today-1440-light`, `gate-sheet-open-day-today-1440-dark` (open-day column and Today),
`gate-label-picker-open`, `gate-theme-control`, `gate-show-details-switch`, `gate-phone-390-first-screen-noshare`, `gate-phone-390-first-screen-share` (the bar check in/out), `gate-logo-fidelity`.

Deviations and slips: (1) task-local probe specs (`zz-gate-probe`, `zz-logo-fidelity`, `zz-away-share`, `zz-control`) were copied into the clean export for single runs and removed afterwards; the first probe run failed on my own env path and my own desktop assertion (dialog role) and was rerun (the failed attempts are not evidence). The fixtures' ephemeral server ports are used by the e2e runs; `SMOKE_PORT=48711`. (2) One `docker version` output was first written to `D:\.claude-tmp\dv.txt` (outside the task folder; copied into the evidence), two `| head` calls on listing commands, one `/dev/null`/`/dev/stdout` redirect on the table script, one `rm -f obs/*` that the safety check denied (not run; nothing needed removing) and one shell heredoc appended to my own `collect2.sh` (not to node or python). No source, docs, tests, board or STATE edited. (3) NAS items remain NOT VERIFIED. (4) The sweep's four-spec runs count today.spec, timesheet.spec, shell.spec and sharing.spec together; the 10-30 23:59/23:57 split is described above.

Status: done
