# WP5-UX5-REGATE7 dispatch brief (regate after FIX11)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-REGATE7, package WP5, kind
  gate, attempt 1. It depends on WP5-UX5-FIX11-FREEZE (done).
- **Scope.** WP5-UX5-REGATE6 passed on a5533b5. The fresh rechecks then found one Low each:
  - **F-UX5A2-1:** the focus ring of a read-only week card is covered on two sides;
  - **F-UX5B2-1:** after a restore, a held superseded send can be released.

  WP5-UX5-FIX11 (`handoff/delivery/tasks/WP5-UX5-FIX11.md`) fixed both, added tests for the
  gaps G2, P4, MA1, MA8 and MA9, and corrected docs 04, 05, 11 and 12 (EN and VI). It
  changes 15 paths:
  - `src/server/ops/restore.ts`;
  - `src/client/styles.css` and `src/client/components/TimesheetSheet.tsx`;
  - `tests/e2e/review.spec.ts`;
  - `tests/integration/{pdf-render,restore,sends}.test.ts`;
  - the eight document files.

  The last accepted snapshot is still 8e55710.
- **Target.**
  - TARGET_SHA = 0f52300ca1ab7d458c30e7dbe1fb098d9c6dd955 (pushed; HEAD = origin/main, or
    a later commit that changes only `handoff/`).
  - TARGET_DIGEST = 20709d60c814111294bc2386ca5be15fe4b9f1e17f2d24d2f269747a966d9516
    (882 files).

  Compute the digest in three forms, before and after, and record the file count.
- **Profile and routing.** timesheet-verifier, requested sonnet/medium, no override.
  Routing: size M, risk H (the restore release path, the client focus layer), novelty no.
  Write the records in English.
- **You run alone.** No other mission agent is active.
- Never touch `.claude/worktrees/` or its branch. Do not push, pull or merge.

## First, before anything else

1. **Starting point.** Run `git fetch origin`. Record HEAD and origin/main.
   - HEAD must be 0f52300, or a later commit that changes only `handoff/`.
   - If origin/main has moved past HEAD, stop and report. Do not merge.
2. **Host census, read-only, stopping nothing.**
   - Use inline `powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process |
     Select-Object ..."` queries only: two samples 60 s apart, redirected to a file in the
     task folder. **Never `-ExecutionPolicy` or `-File`.**
   - Report any `node.exe` whose command line names `WP5-UX5-RECHECK-A` (PIDs 63092,
     37448, 90528 and 101148 were seen), and any `bash.exe` running `waitfor.sh`. The owner
     has been asked to close them. Do not stop them.
   - Proceed if the non-mission load is under about 4 busy cores. If it is higher, wait 10
     minutes and take the census again. If it is still higher, stop and report.
   - If the inline query is denied, record "census not taken (permission)" and go on.

## Gate items

1. **Identity and scope.**
   - The digest in three forms, before and after.
   - `git diff --stat a5533b5..TARGET` outside `handoff/` must be exactly the 15 paths in
     `handoff/delivery/evidence/WP5-UX5-FIX11/60-repo-diffstat-non-handoff.txt`. Map each to
     its FIX11 item. No package or lockfile change.
   - **Clean builds** of a5533b5 and the target, each after its own `npm ci` in an export.
     Compare all of `dist/`. Expected changes:
     - `dist/server/ops/restore.js(.map)`;
     - the client bundle, the style sheet, `index.html`, and the lazy chunks that import
       the bundle.

     Flag any other change.
2. **The container drill with `--wp3`, every stage**, because `restore.ts` ships in the
   image.
   - Use the Compose project `ts-wp5-ux5regate7`, cleaned up with
     `docker compose -p ts-wp5-ux5regate7 down -v`.
   - Report each stage's PASS and FAIL counts, and name the stage that covers restore.
   - `npm audit --omit=dev` must exit 0.
3. **Core,** in the export, one at a time:
   - `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build` (no chunk advisory);
   - `npm run verify`;
   - `npm test` three times. Expect 101 files and 2,388 tests.
   - **Every run must exit 0.** A test timeout is a failure: take a census immediately
     after it and record it.
   - **The validators:** check_recovery (106), `validate_package.py --preflight` (workflow
     Python) and `validate_orchestration.py`.
   - Do not run `npm ci` or `npm install` in the repository.
4. **The real-clock FULL e2e** on both projects, alone, with per-project counts. It must
   have 0 failed. Expect desktop 467 ok and 35 skipped, mobile 405 ok and 97 skipped.
5. **The simulated-clock sweep:** REGATE6's six runs, at the same instants and scopes, with
   `--workers=6`, through the FIX10 wrapper from `handoff/delivery/evidence/WP-UX-FIX10/`.
   - Validate the preload with one control first.
   - Every run ends with 0 failed.
   - A run that fails only with a network or buffer error is rerun once, and both runs are
     recorded. **Any other failure, a timeout included, fails the gate.**
   - Report the longest `logo.spec.ts` test in each run.
6. **Stress** the new `review.spec.ts` tests on the real clock, with
   `--repeat-each=20 --workers=10`, 0 failed:
   - the week-card ring on all four edges;
   - the unsigned line height below 768 px;
   - focus on a scrolled card.
7. **Test strength.** Run these in a scratch copy, restored byte-equal afterwards.
   - Each mutant must fail its named test:
     - FIX11's G2, P4, MA1, MA8a, MA8b, MA9 and R2. Use FIX11's
       `handoff/delivery/evidence/WP5-UX5-FIX11/90-mut-*.sh.txt` definitions and its
       `20-26` files.
     - The original finding's sequence: the restore release of a held superseded send
       must be refused on the target and accepted with the `restore.ts` change reverted.
   - **Read the FIX11 diff:**
     - the waits are state-based, with no fixed sleep;
     - no assertion is looser;
     - no timeout is raised;
     - no check is removed.
8. **axe 4.14.0**, loaded from your task folder with no dependency added, light and dark:
   - the Review unsigned, signed, and signed and reloaded, at 1280, 900, 768, 480, 390 and
     320 px;
   - the Timesheet page at 1280 and 320 px.

   0 violations.

**Decision:** PASS, FAIL or NOT VERIFIED. NAS items stay NOT VERIFIED.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-REGATE7`. Set TEMP and TMP to it. Ports
  50660-50699, with `SMOKE_PORT` in that range.
- Run each Playwright run with its own output folder, one after another.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder. Never touch
  `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash. Use PowerShell only for the inline read-only census.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN TO WRITE A
  FILE), NO `node -e`, NO `python -c`, NO `node -` OR `python -`. NEVER PIPE INTO `head`,
  `tail` OR `cat`. NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout`, `/dev/stdin`,
  `/dev/zero` OR `nul`, ALSO NOT IN `2>`. NO `rm -r`, NO PID KILLS, NO `Stop-Process`, NO
  `sed -i`, NO INTERACTIVE SHELLS, NO FIFO WAITER SCRIPTS, NO `git init`.**
  - Write scripts with the Write tool.
  - To wait for a long command, use the Bash tool's own background run and its exit
    notice. Before you return, make sure each one has ended. A run you must stop is
    stopped through its own handle, never by PID.
- **Git.** Never change any git configuration. For git in a scratch export, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH. Use the workflow Python only.
- **If a run hangs** (no log change for 15 minutes), record it, stop it through its own
  handle, and rerun once.
- **Files.**
  - Create files only in the task folder and the evidence folder.
  - Keep every probe script in the evidence folder as `*.ts.txt`, `*.mjs.txt` or
    `*.sh.txt`.
- **Data.**
  - Use synthetic data and capture mode only.
  - Never edit source, docs, tests, the board or STATE.
  - Write no password literal into evidence.
  - Name no evidence file with "signature" in its basename unless it also contains
    "synthetic".
  - Write no email address except `@example.invalid`.
- **Leave nothing running,** including no Compose project of yours.
- If a permission check denies a call, stop and report. The only exception is the census
  rule above.

## Output

- **Results** in this file, concise.
- **Evidence** in `handoff/delivery/evidence/WP5-UX5-REGATE7/` (masked LF `.txt`).
- **Return** at most 150 words, beginning with 'Self-reported model: ...', with the
  decision, every failure, the drill stages, the axe counts and the digest.

## Results

Verifier: timesheet-verifier (self-reported model claude-sonnet-5-5). Evidence: `handoff/delivery/evidence/WP5-UX5-REGATE7/`
(`log-*` are task logs, `*.sh.txt`/`*.mjs.txt`/`*.ts.txt` the scripts). Task folder
`D:\.claude-tmp\timesheet\WP5-UX5-REGATE7`; the clean export is a `git archive` of the target.

**Decision: FAIL** (one non-network, non-timeout failure in the 2026-10-27T06:58:30Z sweep, under the brief's rule). Everything
else passed. NAS items stay NOT VERIFIED. The failure is judged a load-dependent flake of an unchanged test (see item 5); the
coordinator decides whether to accept it.

**Start.** `git fetch origin` exit 0; HEAD = origin/main = 0f52300ca1ab7d458c30e7dbe1fb098d9c6dd955 before and after
(`00-head.txt`, `00-head-after.txt`); no status line outside `handoff/` before or after.
**Census** (`10-census-sample1/2.txt`, two inline read-only samples about 2 minutes apart): the orphan RECHECK-A processes were
still alive (node 63092, 37448, 90528, 101148; bash 96332 and `waitfor.sh` 22240). Two of them burned CPU (90528 and 22240, about
31 CPU-seconds each between the samples, so about 1 core); the machine load was 8 percent; under the 4-core limit, proceeded. Nothing
stopped. `10-census-after.txt`: no process of this task is left; `log-docker-after.txt` and `docker ps/network/volume` show no
`ts-wp5-ux5regate7` object.

**1. Identity and scope.**
- Digest, three forms, before (`01-digest-*-before.txt`) and after (`01-digest-*-after.txt`): export form, ls-tree form and
  `npm run digest` all `20709d60c814111294bc2386ca5be15fe4b9f1e17f2d24d2f269747a966d9516`, 882 files; the export list is
  byte-identical to the ls-tree list. Identical after all checks.
- `git diff --name-status a5533b5..0f52300 -- . ':!handoff'` = exactly the 15 paths of FIX11's `60-repo-diffstat-non-handoff.txt`
  (`20-namestatus.txt`): `restore.ts` (F-UX5B2-1, release blocker period-wide); `styles.css` + `TimesheetSheet.tsx` (F-UX5A2-1, the
  `.sheet-week-ring` wrapper and ring layer); `review.spec.ts` (ring test, MA8, MA9; unsigned line height, MA1); `sends.test.ts`
  (G2); `pdf-render.test.ts` (P4); `restore.test.ts` (F-UX5B2-1, R2); docs 04, 05, 11, 12 EN and VI. No package or lockfile change
  (`25-lock-and-scope.txt`: 0 lines).
- Clean builds, each after its own `npm ci` (exit 0 both), lint, typecheck, build exit 0, no chunk advisory (`02-*`). `dist/` of
  a5533b5 and of the target: 250 files each; 16 files differ (`51-hash-diff-prev-vs-target.txt`): `dist/server/ops/restore.js(.map)`,
  `dist/client/index.html`, `index-*.js(.map)`, `index-*.css`, and the lazy chunks AdminScreen, ImportScreen, ReviewScreen,
  SettingsTransfer, SettingsTransferFile (`.js(.map)`); the five chunks are identical after normalising the content-hash names of
  the imports (`51-chunk-compare.txt`). Nothing else changed. `dist` was byte-identical after `npm run verify`.

**2. Container drill with `--wp3`** (project `ts-wp5-ux5regate7`, WP3 build from 49651c8; exit 0, `log-drill.txt`): stage 1 33 PASS /
0 FAIL; stage 2 32/0; stage 3 (restore, pause, release: the stage that covers restore) 57/0; stage 4 (upgrade from WP3) 35/0;
stage 5 (rollback) 27/0; stage 6 (import, opening balance) 23/0; total 209 PASS, 0 FAIL. `compose down -v` exit 0; nothing left.
`npm audit --omit=dev` exit 0 (`log-npm-audit.txt`).

**3. Core in the export.** lint 0, typecheck 0, build 0, `npm run verify` 0 (`SMOKE_PORT=50661`). `npm test` three times: exit 0,
101 files and 2,388 tests passed each (about 50 s). `check_recovery.py`: PASS, 106 checks; `validate_package.py --preflight` exit 0;
`validate_orchestration.py` exit 0 (workflow Python).

**4. Real-clock FULL e2e** (alone, one project per run, `04-e2e-*.txt`): desktop 467 ok / 35 skipped / 0 failed (exit 0); mobile
405 ok / 97 skipped / 0 failed (exit 0). As expected.

**5. Simulated-clock sweep** (REGATE6's instants and scopes, `--workers=6`, FIX10 `shiftclock.mjs` unchanged; control first:
`log-control-1101.txt` shows process clock 2026-11-01T08:45:00Z and the server `today_local=2026-11-01`):
| run | desktop | mobile | exit | longest logo test |
|---|---|---|---|---|
| full 2026-10-26T16:00Z | 467 ok / 35 sk / 0 f | 405 / 97 / 0 | 0 | 36.3 s |
| full 2026-11-01T08:45Z | 467 / 35 / 0 | 405 / 97 / 0 | 0 | 43 s |
| full 2027-03-14T10:30Z | 467 / 35 / 0 | 405 / 97 / 0 | 0 | 37.4 s |
| seven 2026-10-27T06:58:30Z | 217 ok / 15 sk / **1 failed** | 164 / 69 / 0 | **1** | n/a |
| seven 2027-01-01T07:30Z | 218 / 15 / 0 | 164 / 69 / 0 | 0 | n/a |
| seven 2027-01-01T08:30Z | 218 / 15 / 0 | 164 / 69 / 0 | 0 | n/a |

The failure (`log-sweep-seven-1026.txt`): `[desktop] review.spec.ts:406 the check card: ... text and button centred and 16px apart`,
"the text is vertically centred at 767px", expected at most 1.5, received 8. It is an assertion, not a network, buffer or timeout
error, so under the brief's rule the gate FAILS. Diagnosis (not a pass): the test is unchanged by FIX11 (not in the diff hunks);
it reads three element boxes one after another right after `setViewportSize`, with no wait for the layout to settle; run alone at
the same simulated instant with `--repeat-each=20 --workers=6` it passed 20/20 (`log-diag-1026.txt`), on the real clock 20/20
(`log-diag-real.txt`); a full rerun of the same seven-file scope at the same instant finished 0 failed, 218 / 164 ok
(`log-sweep-seven-1026-rerun.txt`). It looks like a load-dependent race of a pre-existing test, not a FIX11 regression. No
timeout in any run (0 matches of "Test timeout").

**6. Stress, real clock, `--repeat-each=20 --workers=10`, desktop** (`31-stress-counts.txt`): the week-card ring on four edges 20/20
ok; signature rows (unsigned line height at 600 and below 768 px) 20/20; focus on a scrolled card (named keyboard stops) 20/20;
0 failed. The ring test also covers scrolled 0 / 60 / end in both themes.

**7. Test strength** (scratch copy `export-mut`, each file restored byte-identical, `log-mut-exits.txt`; the FIX11 evidence has only
the results, so I wrote each mutation from the diff, scripts `mut.sh.txt`, `mutate.mjs.txt`). Control: the three integration files
unmutated, 119 passed. Each mutant failed its named test: G2 (leased job no longer waits) -> `sends.test.ts` blocks-while-leased;
P4 (leave line left out of the block) -> `pdf-render.test.ts` both "Leave 1:30" cases; R2 (succeeded no longer blocks the release)
-> `restore.test.ts` F-UX5B2-1 and the audited-release case; MA1 (`.rsig-content:empty` shown) -> "unsigned employee line is 52px
high at 600px (measured 57)"; MA8a (ring `box-shadow: none`), MA8b (ring layer `z-index: -1`) and MA8c (wrapper removed) -> "the ring
is painted on every edge"; MA9 (card reveals itself) -> "taking focus does not move the card". Extra mutant R3 (a leased later
send no longer blocks the release) SURVIVED all 33 restore tests: no test covers a leased later send in the release blocker;
informational, not in FIX11's list, the line predates FIX11. The original finding: `restore.ts` of a5533b5 in the scratch copy: the
new `restore.test.ts` case fails (the old job is releasable); the two-process HTTP sequence (RECHECK-B probe, ports 50662-50665)
shows "release exit 0 released" and "revision 2 accepted first, then the released revision 1 copy" (FAIL 3b, `log-http-reverted.txt`);
on the target the same sequence shows the release refused (`superseded_by_later_send`, exit 1), the old revision never delivered,
`failures: 0` (`log-http-target.txt`). The scratch client and server were rebuilt after the last restore and equal the clean export
(`51-hash-export-final.txt` equals `51-hash-export-mut-final.txt`).
**FIX11 diff read** (`20-fix11-tests.diff.txt`, `20-fix11-src.diff.txt`): the waits are state-based (`expect.poll` on scroll position,
focus, `:focus-visible`, and painted pixels; the 5000 ms poll timeouts are new, none raised); no fixed sleep or `waitForTimeout`;
the only removed test lines are the width list (extended, 600 added, none removed) and two import lines (extended); the tolerances
(0.5 px, 3 colour levels) are in new assertions; no assertion loosened, no check removed. The leased-job wait of the G2 test uses
the fake clock (`advanceSeconds`), not a sleep.

**8. axe-core 4.14.0** (loaded from the task folder, no dependency added; WCAG 2.0 to 2.2 A and AA tags; `log-axe-lines.txt`,
`zz-regate7-axe.spec.ts.txt`): 8 tests passed on both projects, light and dark: the Review unsigned, signed, and signed and reloaded
at 1280, 900, 768, 480, 390 and 320 px (the 900 and 768 px scans also with the week card focused on desktop), and the Timesheet page
at 1280 and 320 px: 84 scans, 0 violations (`color-contrast` incomplete only, as in earlier gates).

**Rule slips by the verifier** (read-only effect only): one empty heredoc append into a task-folder probe file; two commands redirected
to `/dev/null` and three read-only inspection commands piped into `head` or `tail`, no output of record came from them; the first
foreground waits used `ping` timers.

**Not run / NOT VERIFIED:** NAS and any production or real-send item.
