# WP5-UX-REGATE8 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-REGATE8; package WP5; kind gate;
  attempt 1; depends on WP5-UX-FIX10-FREEZE (done).
- Scope: rerun the WP5 package-final gate after WP5-UX-FIX10. FIX10 is a tests-only fix
  for WP5-UX-AB8-01..AB8-04, which made the e2e suite depend on the calendar:
  - deadline tests that ran after the due time;
  - a free-day pool that ran out;
  - a holiday import across New Year;
  - a default import year.

  The previous gate, WP5-UX-REGATE7, passed on 3670a6c (digest 58b0deee; drill image
  52b45ad9…).
- Target: `freeze_commit` = 90b98efc395c3894a21a909b6d361eadc6fc2bd9 (HEAD =
  origin/main, or a later commit that changes only handoff/). Expected digest of record
  57e2974c35cc104f3c2cb5d930c24d9bb15b89661be395d16a827e64ee4b761d (795 files). Compute it
  on a clean export of 90b98ef and cross-check with the `git ls-tree` form and
  `npm run digest`.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H (package-final snapshot), novelty no. Records in English.

## Read

- AGENTS.md from disk first.
- `handoff/delivery/tasks/WP5-UX-REGATE7.md` (gate items, method, results and
  evidence; attempt 1 for every item, attempt 3 for the drill).
- The Results of `handoff/delivery/tasks/WP5-UX-FIX10.md` and its sweep evidence
  (`handoff/delivery/evidence/WP5-UX-FIX10/sweep-table.txt` and the scripts
  `shiftclock.mjs.txt`, `run-shift.sh.txt`, `sweep.sh.txt`).
- The findings table in `handoff/delivery/WP5_UX_REVIEW_AB8.md`, including how the
  auditor validated the simulated clock.

## Gate items

1. **Rerun WP5-UX-REGATE7 item 1** on a clean export of 90b98ef with the same method and
   limits:
   - `npm ci`, lint, and verify with deprecation tracing;
   - the full e2e on both projects on the real clock, with per-project counts; record the
     Los Angeles time and the displayed period;
   - AC-13 three times, and under `Asia/Tokyo` and `America/New_York` through a
     wrapper;
   - drill `--wp3`, with the image ID and size and the forbidden-file scan;
   - the compose config forms, the env keys and `npm audit --omit=dev`;
   - the validators, including check_recovery (106 probes), and the precommit
     self-test;
   - the business boundary since 014bd47, PDF unchanged and pdf-visual passing, and
     the scope since 014bd47;
   - contrast in both themes;
   - `npm test` three times;
   - 44px and no horizontal scroll at 390, 375, 360 and 320px.

   Run `docker version` first. If the engine is unreachable, finish every other item
   and then stop with NOT VERIFIED for the drill only. Do not start Docker Desktop and do
   not retry in a loop.
2. **Fix scope.** `git diff --stat 3670a6c..90b98ef` outside handoff/ must show exactly
   these 8 modified test paths:
   - `tests/e2e/displayedSeed.ts`, `fixtures.ts`, `automation.spec.ts`,
     `pdf-visual.spec.ts`, `shell.spec.ts`, `timesheet.spec.ts`, `admin.spec.ts`;
   - `tests/domain/e2eSeedSelection.test.ts`.

   Nothing may change under `src/`, `docs/`, `scripts/` or config. In `fixtures.ts`,
   changes must be additive; widening an import line is allowed. List every removed or
   changed line in the specs and confirm that:
   - no assertion was removed or weakened;
   - no test passes vacuously;
   - no `skip`, `fixme` or `.only` was added.
3. **Simulated-clock sweep.**
   - Copy FIX10's preload and wrapper from its evidence into your task folder; do not
     add them to the repository.
   - Validate the preload with one control, as the AB8 auditor did: the server reports
     the simulated `today_local`.
   - Run the FULL suite on both projects at these instants (America/Los_Angeles):
     - the next due Tuesday at 13:00 and at 18:00;
     - its payroll date (P) at 10:00, and P+1;
     - 2026-11-28 10:00;
     - 2026-12-26 10:00;
     - 2027-01-11 10:00.
   - Every run must end with 0 failed. If a run fails only with a network or buffer
     error (for example ERR_NO_BUFFER_SPACE), rerun that run once and record both runs.
4. **Product unchanged.** Build 3670a6c and 90b98ef from clean exports and compare the
   client bundle and `dist/server` byte for byte. If they are identical, the product
   observations of REGATE6 and REGATE7 carry forward; state this. If they differ, stop
   and report.
5. Screenshots: none required.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX-REGATE8`. Set TEMP and TMP to it.
- Ports: 48540-48559, with `SMOKE_PORT` in that range.
- Give each Playwright run its own output folder, and run them sequentially.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Docker:
  - Use the Compose project `ts-wp5-uxregate8`, with non-TTY flags only.
  - At the end, remove the drill image by exact tag and the project by name.
  - Record `docker ps --all --filter name=ts-wp5-uxregate8`; it must be empty.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
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

- Write your results into this file with the Edit tool.
- Put masked LF `.txt` evidence in `handoff/delivery/evidence/WP5-UX-REGATE8/`. Save
  scripts as `*.mjs.txt`, `*.py.txt`, `*.ts.txt` or `*.sh.txt`.
- Include a sweep table: instant, then the desktop and mobile pass/fail/skip counts.
- Record the drill image ID; the pilot packet identity refresh uses it.
- Decide PASS, FAIL or NOT VERIFIED from actual results. NAS items stay NOT VERIFIED.

Return at most 200 words, beginning with your self-reported model. Include:
- the decision;
- the digest of record in its three forms;
- each gate item's result, with counts and exit codes;
- the sweep table summary;
- the bundle comparison;
- the image ID;
- the evidence files.

## Results

### Verifier result (attempt 1) - decision: PASS (NAS items NOT VERIFIED)

Self-reported model: claude-sonnet-5-5. Freeze 90b98efc395c3894a21a909b6d361eadc6fc2bd9; HEAD = origin/main = the same before and after; no non-handoff path changed
(`00-nonhandoff-status.txt`, `00-status-after.txt` empty). Node v24.21.0 portable, Git Bash, workflow Python (user `<user>`). Evidence: `handoff/delivery/evidence/WP5-UX-REGATE8/`
(index `00-README.txt`). `docker version` first: client 28.5.1, server Docker Desktop 4.48.0 / engine 28.5.1 reachable.

Digest of record `57e2974c35cc104f3c2cb5d930c24d9bb15b89661be395d16a827e64ee4b761d`, 795 files, equal in three forms, before and after all checks: clean `git archive 90b98ef`
export with `git hash-object --no-filters`; the `git ls-tree` form (sorted list byte-identical to the export list); `npm run digest` in the repository.

| # | Item | Result |
|---|---|---|
| 1 | `npm ci`, `npm run lint`, `npm run verify` (deprecation tracing) | exit 0 x3; verify 83 files, 1831 tests passed, build, SMOKE PASSED; 0 deprecation lines |
| 1 | `npm run test:e2e`, real clock | exit 0; 210 passed, 26 skipped, 0 failed (4.8 min). desktop 103 ok / 15 skipped, mobile 107 ok / 11 skipped; automation.spec.ts:118 and pdf-visual.spec.ts:187 ok on desktop, automation ok on mobile (pdf-visual mobile skips by design); 0 deprecation lines |
| 1 | real-clock time and displayed period | run 2026-10-13 22:20-22:25 America/Los_Angeles (`03-window.txt`): after the due Tuesday 17:00 of the displayed period (payroll 2026-10-16, period 2026-09-28..2026-10-11, due 2026-10-14T00:00Z), i.e. inside the window that failed before FIX10; control `03-control-real.txt` |
| 1 | AC-13 x3 | exit 0 x3, 1 passed each, 0 deprecation lines |
| 1 | AC-13 under zones | Asia/Tokyo (probe offset -540) exit 0; America/New_York (offset 240, DST) exit 0; 1 passed each |
| 1 | drill `--wp3` project `ts-wp5-uxregate8` | exit 0; wp3 (`git archive 49651c8`) npm ci and build:server exit 0, 0 deprecation lines. Stages 33/31/57/35/27/23 = 208 PASS, 0 FAIL, "DRILL STAGES 1-6 PASSED"; the 8 lines containing "deprecat" are all PASS lines, 0 warnings; forbidden-file scan PASS. Image `sha256:dec7b4856a8220743c513a955a840d399e4be0d74970a89801ea39b6d7898327`, 110014793 bytes (104.9 MiB), linux/amd64 |
| 1 | cleanup | image removed by exact tag `ts-wp5-uxregate8-timesheet:drill` (untagged, deleted); `docker compose -p ts-wp5-uxregate8 down -v` exit 0; `docker ps --all --filter name=ts-wp5-uxregate8` empty; no image, volume or network of the project left |
| 1 | compose config live / restored / rollback | exit 0 x3: `ts-wp5-uxregate8`, `timesheet:aaaaaaa`; `-restored`; `-rollback`, `timesheet:bbbbbbb`, `JOB_RUNNER: "off"` |
| 1 | env keys, audit | 21 keys, only SQLITE_BUSY and WP5_HANDOFF map to none (as before); `npm audit --omit=dev` exit 0, 0 vulnerabilities |
| 1 | validators | validate_package --preflight 0 PASS; validate_orchestration 0 PASS; check_recovery 0 PASS count 106; precommit self-test 0 PASS |
| 1 | business boundary since 014bd47 | `src/domain/format.ts` +13 only outside the client; no `src/server` change. PDF: `git diff --stat 014bd47..90b98ef -- src/server/pdf` empty; the only pdf-visual change is the FIX10 spec seed edit (+5/-3); pdf-visual passed (desktop) |
| 1 | scope since 014bd47 outside handoff/ | 85 paths = the REGATE7 83 plus exactly `tests/e2e/automation.spec.ts` and `tests/e2e/pdf-visual.spec.ts` (admin, shell, timesheet specs, fixtures, displayedSeed and the domain test were already listed) |
| 1 | contrast both themes | output byte-identical to REGATE7 `40-contrast.txt` |
| 1 | `npm test` x3 | exit 0 x3; 83 files, 1831 tests; 0 deprecation, 0 worker/crash lines |
| 1 | 44px and no horizontal scroll at 390/375/360/320 | REGATE6 probe rerun (mobile), 4 passed; per width: timesheet 41, batch 46, editor 53, review 8 controls, 0 below 44x44, scrollWidth = innerWidth in all 16 checks (identical to REGATE7 `obs-targets`) |
| 2 | fix scope `git diff --stat 3670a6c..90b98ef` outside handoff/ | exactly the 8 test paths: e2eSeedSelection.test.ts (+101/-2), admin.spec.ts (+15/-9), automation.spec.ts (+4/-0), displayedSeed.ts (+47/-0), fixtures.ts (+35/-1), pdf-visual.spec.ts (+5/-3), shell.spec.ts (+16/-11), timesheet.spec.ts (+11/-0); 234 insertions, 26 deletions; nothing under src/, docs/, scripts/ or config (`22-fixscope-forbidden.txt` empty) |
| 2 | removed or changed lines | fixtures.ts: only the import line widened (`type DeadlinePeriodFacts`, `laterDeadlineFor` added), the rest additive (`ensureDeadlineAhead`). e2eSeedSelection.test.ts: import widened, 2 describe blocks added. admin.spec.ts: two interface fields widened; `year` now from the client's `defaultImportYear`; `newYear`/`midYear`/`${year}-03-03` become `importDatesAfter(...)` values with a new `expect` that all stay inside the year; the `arrayContaining` and `data-kept-date` assertions keep the same strength with `extraDate`. pdf-visual.spec.ts: `periods` read replaced by `admin.ensureDeadlineAhead(120_000)`, `due_at_utc` taken from its result. shell.spec.ts: the body wrapped in `try`/`finally` (clearSessions), re-indented, every assertion kept. timesheet.spec.ts and automation.spec.ts: additions only (afterEach release; ensureDeadlineAhead call). `24-spec-diff.txt` |
| 2 | no assertion removed or weakened; no vacuous pass; no skip | confirmed from the diff: no `expect` deleted; `ensureDeadlineAhead` ends with two strict `expect`s (due after margin, payroll date unchanged) and throws on failure; added `.skip`/`fixme`/`.only`/`slow`: 0 (`24-skipcheck.txt`) |
| 3 | preload control | `shiftclock.mjs` copied unchanged from FIX10 evidence (cmp equal) into the task folder, not the repository. Scratch control spec (task-local, copied into the export and removed): at simulated 2026-10-30 10:00 PDT the server reported `today_local=2026-10-30`, period 2026-10-12..2026-10-25, payroll 2026-10-30, due 2026-10-28T00:00Z (i.e. the due Tuesday is 2026-10-27 and P is 2026-10-30); real clock reported `today_local=2026-10-13`. `03-control-p.txt`, `03-control-real.txt` |
| 3 | simulated-clock sweep | 7 full-suite runs, both projects, all 0 failed, no network or buffer error, no rerun needed; table below |
| 4 | product unchanged | `npm ci` + `npm run build` from clean exports of 3670a6c and 90b98ef: `git diff 3670a6c..90b98ef -- src` empty; `dist/` 230 files each (4 client, 180 server), sha256 per file identical (`cmp` equal); client bundle `index-ZRY_mcb_.js` 74d87ee4..., css `index-B6Rp4E3V.css` 17b217c2.... The REGATE6 and REGATE7 product observations carry forward unchanged |
| 5 | screenshots | none taken |

Sweep table (full e2e, America/Los_Angeles instants, real start 2026-10-14 05:4x-06:1x UTC; each log in `sweep-<label>.txt`, summary `sweep-table.txt`). All exit 0, 0 deprecation lines:

| Instant (LA) | Label | desktop ok/fail/skip | mobile ok/fail/skip | Total |
|---|---|---|---|---|
| Tue 2026-10-27 13:00 (due Tuesday) | due-1027-1300 | 103/0/15 | 107/0/11 | 210 passed, 26 skipped |
| Tue 2026-10-27 18:00 (after due 17:00) | due-1027-1800 | 103/0/15 | 107/0/11 | 210 passed, 26 skipped |
| Fri 2026-10-30 10:00 (P) | p-1030-1000 | 103/0/15 | 107/0/11 | 210 passed, 26 skipped |
| Sat 2026-10-31 10:00 (P+1) | p1-1031-1000 | 103/0/15 | 107/0/11 | 210 passed, 26 skipped |
| Sat 2026-11-28 10:00 | d-1128-1000 | 103/0/15 | 107/0/11 | 210 passed, 26 skipped |
| Sat 2026-12-26 10:00 | d-1226-1000 | 103/0/15 | 107/0/11 | 210 passed, 26 skipped |
| Mon 2027-01-11 10:00 | d-2027-0111-1000 | 103/0/15 | 107/0/11 | 210 passed, 26 skipped |

Process notes: nothing left running by me; e2e servers use ephemeral ports from the fixtures (as in earlier gates), the drill picks its own free loopback port; `SMOKE_PORT=48541`.
Slips against the runtime rules: one `bash --version | head -1` call (output discarded, no file touched) and one `cp ... /dev/stdout` no-op call; no `/dev/null`, no stdin to node or python. Source, docs, tests, board and STATE were not edited; the scratch specs ran only in the task-local export and were removed. NAS items remain NOT VERIFIED.

Status: done
