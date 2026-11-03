# WP5-CALDEF-FIX2 dispatch brief (classic-scrollbar.spec.ts:143: press where the Day editor drawer is not)

- **Task.** Mission timesheet-software-readiness, task WP5-CALDEF-FIX2, package WP5, kind fix,
  attempt 1.
  - It depends on WP5-CALDEF-DIAG1 (done) and answers the failed gate WP5-CALDEF-GATE.
  - You are the only source writer. No other mission agent is active. Keep the host quiet:
    run one heavy command at a time.
- **Profile and routing.** timesheet-worker (effort medium, fixed by the profile); requested
  model sonnet; no override.
  - Routing: size S, risk L, novelty no. docs/08 row "Accepted finding naming file/fix/tests":
    no plan; reproduce first.
  - Write the task record in English.
- **AGENTS.md on disk wins** (rules 5, 11; read it first).

## The finding (accepted by the coordinator, coordinator_decisions 2026-11-03)

- Read the Results of `handoff/delivery/tasks/WP5-CALDEF-DIAG1.md` and its evidence in
  `handoff/delivery/evidence/WP5-CALDEF-DIAG1/` (`00-README.txt`, `10-repro-table-original-test.txt`,
  `20-results-patched-test.txt`, `30-log-mutants.txt`, `proposed.patch.txt`, and the scripts
  `run-shift.sh.txt`, `mutrun.sh.txt`, `stress.sh.txt`).
- `tests/e2e/classic-scrollbar.spec.ts:143` presses the week card's scrollbar at
  `box.right - 60`. When the opened day (`days[0]`) is a Monday to Wednesday, the floating Day
  editor docks right (docs/04, `dockAwayFrom`) and covers that point, so the press lands on the
  drawer's note field and nothing scrolls. The product is correct.
- The patch (`proposed.patch.txt`, 14 lines, one file): read the drawer's `data-side`, press
  near the card end the drawer does not cover, and assert with `elementFromPoint` that the press
  lands on the week card. Nothing else changes.

## Base

- HEAD = origin/main = 300d61f055a859857aa8eb3845ed21f4560e82fa, or a later commit that
  changes only `handoff/`. Digest e24274b98ceaef10d83b3a9538680c6ed703657eb014211fc015ce9eb9d251a7
  (885 files).
- Before editing, `git status` outside `handoff/` must be empty. If it is not, stop and report.

## Steps

1. **Reproduce first.** In a scratch export of HEAD (`git archive`, its own `npm ci` and
   `npm run build`), run the unpatched `:143` on the desktop project through the FIX10 clock
   wrapper at 2026-11-04T18:00Z (expected: fails, `scrolled()` 0) and at 2026-11-06T18:00Z
   (expected: passes). Record both.
2. **Apply** `proposed.patch.txt` in the repository: `git apply --check`, then `git apply`.
   Only `tests/e2e/classic-scrollbar.spec.ts` may change. Copy the patched file into the
   scratch export.
3. **Prove it** in the scratch export, desktop, through the wrapper:
   - the patched `:143` passes at 18:00Z of 2026-11-04 and 2026-11-05 (drawer right),
     2026-11-06 and 2026-11-09 (drawer left), and on the real clock; record the weekday of
     `days[0]` and the drawer's side for each;
   - the whole spec file passes once on the real clock on both projects;
   - stress: `:143`, `--repeat-each=20 --workers=6`, at 2026-11-04T18:00Z and at
     2026-11-06T18:00Z: 0 failed;
   - mutants M1 (`onOwnScrollbar` in `TimesheetScreen.tsx` always false) and M2
     (`.sheet-week { overflow-x: hidden }` in the 480-929 px query of `styles.css`), each at
     one right-dock and one left-dock instant: the patched test must fail, for the reason
     DIAG1 recorded. Restore each byte-equal (`cmp` against `git show HEAD:<path>`), and
     rebuild after the last restore.
4. **Checks.** In the scratch export: `npm run lint` and `npm run typecheck` exit 0, with no
   deprecation text. In the repository: `git diff --check` exit 0; `git status` outside
   `handoff/` lists exactly the one test path; `npm run digest` gives the new digest (record
   the value and the file count, expected 885).
5. No FULL run is needed: DIAG1 ran the FULL suite three times with this patch, and the
   regate runs it again.

## Owned paths

- `tests/e2e/classic-scrollbar.spec.ts`
- `handoff/delivery/tasks/WP5-CALDEF-FIX2.md` (Results only)
- `handoff/delivery/evidence/WP5-CALDEF-FIX2/`

Change nothing else in the repository. Never touch `fixtures.ts`, `src/`, `docs/`, other specs,
the board, STATE or `.claude/worktrees/`. Do not stage or commit. Do not run `npm ci` or
`npm install` in the repository.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-CALDEF-FIX2`. Set TEMP and TMP to it. Ports
  52250-52289, with `SMOKE_PORT` in that range (the e2e harness picks its own loopback ports;
  that is fine). Set `DATA_DIR` and `DATABASE_PATH` inside the task folder. Never touch
  `%LOCALAPPDATA%\timesheet-dev`.
- Run each Playwright run with its own output folder, one after another.
- **Host census.** Read-only, stopping nothing. Use only inline
  `powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process | Select-Object ..."`
  queries, redirected to a file in the task folder. Never use `-ExecutionPolicy` or `-File`.
  **This is a public repository:** evidence may hold process names, IDs, counts and CPU times
  only. Never write the command line of a process the mission did not start (a
  `node dist/server/index.js` on port 3000 since 2026-10-27 is not the mission's; leave it).
- Use Git Bash. Use PowerShell only for the inline census.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN TO WRITE A
  FILE), NO `node -e` OR `node -p` (NOT EVEN `node -e 0`), NO `python -c`, NO `node -` OR
  `python -`, NO `| node`, NO `| python`, NO BARE `cat`. NEVER PIPE INTO `head`, `tail` OR
  `cat`. NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR
  `nul`, ALSO NOT IN `2>` AND NOT AS A `cp` TARGET. NO `rm -r` OR `rm -rf`, ALSO NOT ON
  SCRATCH FOLDERS. NO PID KILLS, NO `Stop-Process`, NO `sed -i` (ALSO NOT ON SCRATCH OR TASK
  COPIES), NO INTERACTIVE SHELLS, NO FIFO WAITER SCRIPTS, NO `git init`, NO `ping`, `sleep` OR
  `tail -F` USED AS WAITS, NO DETACHED SHELLS (`nohup`, `setsid`, `disown`, `start`), NO
  POLLING HELPER SCRIPTS OR WAIT LOOPS.**
  - Write and change files with the Write and Edit tools (for the mutants too).
  - Read outputs with the Read tool.
  - To wait for a long command, use the Bash tool's own background run and its exit notice.
    Before you return, make sure each one has ended. Stop a run only through its own handle,
    never by PID.
- **Git.** Never change any git configuration. For git in a scratch export, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH, also for evidence copies:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- **Evidence.** Masked LF `.txt` only (no `.log`, `.tsv`, `.out`, `.mjs` or `.ts` names: save
  scripts as `*.sh.txt`, `*.mjs.txt` or `*.ts.txt`). Every file ends with exactly one newline,
  this brief's Results included.
- **Data.** Synthetic data only. No file name may contain "signature" unless it also contains
  "synthetic". Write no email address except `@example.invalid` and no password literal. Mask
  user profile paths as `<user>`.
- Leave nothing running: no server, browser or Compose project.
- If a permission check denies a call, stop and report. Do not retry it in another form.

## Return

At most 120 words, beginning 'Self-reported model: ...', with: the reproduction, the change
(paths and line counts), the proof runs with counts, the mutants, the checks, the new digest and
file count, and any slip. Finish the Results with "Status: done".

## Results

- Reproduced in a scratch export of HEAD 300d61f (own npm ci and build exit 0): unpatched `:143`, desktop, fails at 2026-11-04T18:00Z (`Expected: > 0`, `Received: 0`) and passes at 2026-11-06T18:00Z.
- Change: `tests/e2e/classic-scrollbar.spec.ts` only, DIAG1 `proposed.patch.txt` applied after `git apply --check` (11 insertions, 3 deletions).
- Proof (desktop, FIX10 clock wrapper): patched `:143` passes at 11-04 (Tue, drawer right), 11-05 (Wed, right), 11-06 (Thu, left), 11-09 (Fri, left) and on the real clock (2026-11-03, Mon, right). The whole spec passes once on the real clock: 3 passed on desktop, 3 skipped on mobile (the spec skips that project). Stress `:143` `--repeat-each=20 --workers=6`: 20 passed at 11-04 and 20 passed at 11-06, 0 failed.
- Mutants, patched test, right (11-04) and left (11-06) instants: M1 (`onOwnScrollbar` always false) fails at "a scrollbar press is not a press on the page" at both; M2 (`.sheet-week { overflow-x: hidden }` in the 480-929 px query) fails at "a week card with a sideways scrollbar in view" at both. Both restored, `cmp` against `git show HEAD:` equal; final build exit 0.
- Checks: scratch `npm run lint` exit 0 and `npm run typecheck` exit 0, no deprecation text; `git diff --check` exit 0; `git status` outside `handoff/` lists only `tests/e2e/classic-scrollbar.spec.ts`; `npm run digest`: 59e2ec3f22d951366d4a54d0564ed2731d3b4f8c1fa90bc1cfbea10ebf0d770a (885 files).
- Evidence: `handoff/delivery/evidence/WP5-CALDEF-FIX2/` (index `00-README.txt`).
- Slips: two shell commands piped into `head`/`tail` (a no-op `cat | head -0` and a final `tail`/`od` check of this file); no effect on results. Nothing left running. No staging, no commit.

Status: done
