# WP5-UX5-DIAG3 dispatch brief (integration-test timeouts, the smoke reset, host load)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-DIAG3, package WP5, kind
  diagnose, attempt 1. It depends on WP5-UX5-FIX5 (done), and addresses WP5-UX5-REGATE3
  (FAIL).
- **Profile and routing.** timesheet-planner (effort high, fixed by the profile); requested
  model sonnet; no override.
  - Routing: size M, risk M, novelty no. docs/08 row "Plan/diagnose a bounded issue".
  - Read-only for the repository. Write the task record in English.
- **You run alone.** No other mission agent is active. Keep the host quiet: run one heavy
  command at a time.
- **Why.** The next gate runs `npm test` three times and `npm run verify`. A timeout or a
  smoke failure fails it. Three symptoms have now been seen:
  1. **Integration-test 30 s timeouts.**
     - REGATE3's repository `npm run verify` run 1 timed out in `backup.test.ts` and
       `jobs-restart.test.ts`, and took 110.7 s against 52-61 s for every other run.
     - FIX5's `npm test` failed twice. Different tests timed out each run, in `backup`,
       `backup-prune`, `deadline-race`, `delivery-crash`, `jobs-restart`, `bootstrap` and
       `restore`.
     - Later runs passed. Export runs in REGATE3 passed three times.
  2. **A smoke failure.** FIX5's `npm run verify` run 1 failed late in smoke with "fetch
     failed" after `run-jobs --once`, in `scripts/smoke-built-server.mjs`. FIX5 suspects
     the same mechanism as DIAG2's C: a keep-alive socket reused after a blocking
     `spawnSync` that outlasts the server's 5 s keep-alive. Smoke alone passed twice.
  3. **Host load.** FIX5 saw 46 `msedge` processes that it had not started. DIAG2 measured
     one spawned CLI at 3.6 s on an idle host.
- **Read:**
  - `handoff/delivery/tasks/WP5-UX5-FIX5.md` (Results) and
    `handoff/delivery/evidence/WP5-UX5-FIX5/00-fix5-evidence.txt`; the raw logs are in
    `D:\.claude-tmp\timesheet\WP5-UX5-FIX5\logs\`;
  - `handoff/delivery/tasks/WP5-UX5-DIAG2.md` (C and Q6) and its `30-C-econnreset.txt`,
    `50-verify-timeouts.txt`;
  - REGATE3's `21-repo-verify-run1.txt`;
  - the vitest configuration, the named test files, their helpers, and
    `scripts/smoke-built-server.mjs`.
- **Base.**
  - HEAD = origin/main = 5b8b7184692fff683c4083c9fc5610acd47bece1.
  - The working tree holds the uncommitted FIX4 files (`package.json`,
    `package-lock.json`) and FIX5 files (`tests/e2e/timesheet.spec.ts`, `review.spec.ts`,
    `fixtures.ts`). The digest of HEAD plus these files is
    4e93f7663fdea86d5c80cf6ff086786aeb7414449872248238586bb35aef4519 (882 files).
  - Probe in a scratch export of that state: `git archive` HEAD, then copy in those five
    files.

## Questions to answer

1. **Host census, read-only.**
   - List the `msedge.exe`, `chrome.exe`, `chromium`, `node.exe`, `bash.exe`, `docker` and
     `vitest` / Playwright processes, with name, PID, creation time, and CPU seconds
     sampled twice 60 s apart.
   - Classify each one as:
     - **launched by a mission task:** its command line names a `D:\.claude-tmp\timesheet\`
       task folder or a `playwright_*` profile; name the task;
     - **the owner's own browser or apps;**
     - **unknown.**
   - Mask profile paths as `<user>`. Do not record the owner's browser command lines beyond
     the classification.
   - **Stop nothing.** Say how much CPU each group uses, and whether mission leftovers
     exist. The owner decides what to close.
2. **The integration-test timeouts.**
   - For each named file, give its tests' durations on an idle host and under a controlled
     CPU load (for example, a burner with half or all of the logical cores), against the
     configured timeout.
   - Say what dominates the time: CLI spawns (how many per test, and how long each), the
     database, or file I/O.
   - Why does one spawned CLI take about 3.6 s idle? Consider TypeScript loading,
     module-graph size, antivirus scanning, and Dropbox for the repository path.
   - Does running from the Dropbox repository rather than an export change the timings?
3. **The smoke failure.** Confirm or reject the keep-alive mechanism in
   `scripts/smoke-built-server.mjs`, with a probe. List every other place in `scripts/`
   and `tests/` that fetches after a blocking `spawnSync` or `execSync` on a reused
   connection.
4. **Propose the minimal robust fix**, with file:line and the proof:
   - **for the timeouts:** prefer removing the cost or the contention, for example
     cheaper spawns, or running spawn-heavy files without parallel contention. Do not just
     raise a timeout. If a timeout change is truly the right fix, justify it with measured
     worst-case times and margins.
   - **for the smoke failure:** the same approach as DIAG2's C;
   - **if host leftovers cause the load:** say so, and what the owner should close. Our
     tasks never kill by PID.

   Name the owned paths a worker would need. Never loosen an assertion.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-DIAG3`. Ports 50220-50239. Set TEMP, TMP,
  `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash, and `powershell.exe -NoProfile -Command "..."` only for the read-only process
  census, with its output redirected to a file in your task folder.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `node -`, NO `python -`), NO
  PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR
  `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`, NO PID KILLS, NO `Stop-Process`, NO
  INTERACTIVE SHELLS.**
  - Use the Write tool to create files.
  - Read outputs with the Read tool.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- A CPU burner must stop by itself, after a fixed duration. Never leave one running.
- Never touch `%LOCALAPPDATA%\timesheet-dev` or `.claude/worktrees/`. Use synthetic data
  only.
- Change nothing in the repository except this brief's Results and
  `handoff/delivery/evidence/WP5-UX5-DIAG3/` (masked LF `.txt` only). Do not stage or
  commit. Do not run `npm ci` or `npm install` in the repository.
- Write no email address except `@example.invalid`.
- **Run nothing in the background that outlives your return.** Before returning, check
  that each background command you started has ended, or stop it through its own handle.
- If a permission check denies a call, stop and report.
- Keep Results short and concrete. Finish with "Status: done".

Return at most 150 words, beginning 'Self-reported model: ...', with the census summary, the
timeout cause, the smoke cause and the proposed fixes.

## Results

Planner: claude-sonnet-5-5. Evidence: `handoff/delivery/evidence/WP5-UX5-DIAG3/` (00 index, 10 census, 20 CLI cost, 30 timeouts, 40 smoke, 50 fix probes). Probed in a scratch export of 5b8b718 plus the five uncommitted files; the repository holds no change except this section and the evidence folder; nothing staged or committed. Observations are measured; assumptions are marked.

**1. Host census (read-only, two samples 60 s apart, twice).** No chrome, chromium, docker.exe, vitest or Playwright process runs. The 45 `msedge.exe` (FIX5 saw 46) are all children of the owner's Edge (parent PID 49984, started 2026-10-22): 0.07 core at 16:09, 2.0 cores at 17:08 (three tabs). Other load is the owner's: Claude desktop 0.2-0.5 core, Docker/WSL 0.14-0.16, Dropbox 0.06, Defender 0.06-0.2, four idle `@agentmemory/mcp` node pairs. **One mission leftover:** `bash.exe waitfor.sh out/sweep.done 590` (PID 22240 at census time, created 2026-10-26 12:29:55, parent gone), from WP5-UX5-REGATE3-a2 (fifo created 12:29:55; `sweep.done` written 12:41). It should have ended by 12:40; 4.6 h later it still spins one full core (9.9 ks CPU). The owner can close it; this task did not. Total visible load is 1.5-4 of 32 cores, which does not explain FIX5's 3-14x slowdown.

**2. Timeouts.**
- *Idle:* all seven files are far below 30 s alone (slowest test 1.1-4.1 s). In the full parallel run the suite slows itself (deadline-race 4.1 s alone, 12.6-15.8 s in the full run; backup-prune 6-12 s; restore 5.5-11.6 s; jobs-restart 6.2 s). The margin to 30 s is 2x for deadline-race.
- *What dominates:* CLI spawns for backup, backup-prune, bootstrap and restore (sync spawns are 55-100% of their time: 6, 13, 12 and 21 spawns of about 0.4 s). jobs-restart and delivery-crash use runner children plus mark waits with a 20 s limit. deadline-race has no spawn (worker-thread races, CPU bound). Database and file I/O: tens of ms per command, not a factor (1 M churned files changed nothing).
- *"3.6 s per CLI" is a misreading of DIAG2:* 3594 ms was six `run-jobs` runs (0.6 s each). One CLI is 0.25-0.7 s idle: node 46 ms, module graph 310-373 ms, of which the PDF library (pdfJob.ts:9 -> pdf-lib + fontkit) is 180 ms and type stripping 60 ms. The Dropbox path adds 25-45% per spawn (570 vs 390 ms), +10% on the full suite (53 s vs 48-49 s). Defender is on; its exclusions need administrator rights, so antivirus cost is not isolated. A CLI takes 3 s and more only on a loaded host.
- *Cause of the timeouts:* the suite runs 31 forks (vitest default) that each spawn CLI children, on 32 logical cores. CPU burners on all 32 cores (55 s) or file churn (62 s) did **not** fail. Giving the suite fewer logical CPUs while it still runs 31 forks **did**: 8 CPUs -> 3 failures; 4 CPUs -> 6; 2 CPUs -> FIX5's exact set (backup, backup-prune, jobs-restart, restore, deadline-race; FIX5's runs took 272 s and 115 s against 48 s). So FIX5's host offered the suite about 2-4 CPUs for a few minutes. What took them was not running at either census; unidentified (assumption: bursty owner or session load).
- *What helps:* 4 CPUs, 31 workers: 139 s, 6 failed; 16 workers: 130 s, 0 failed; 8 workers: 126 s, 0 failed. On the idle host 16 workers cost nothing (53 s). Cheaper spawns (lazy PDF import) take 37% off each CLI and a further 25-60% off the CLI files (4 CPUs, 16 workers: deadline-race 15.6 -> 10.6 s, backup-prune 14.9 -> 8.8 s, bootstrap 5.9 -> 2.4 s, restore 8.1 -> 5.3 s). Limit: at 2 CPUs even both fail (slowest 39.8 s); no setting survives a host that gives away 94% of its CPU.

**3. Smoke failure: confirmed.** `scripts/smoke-built-server.mjs:410-413` runs three blocking `spawnSync` CLI runs, then `:415` fetches on the pooled keep-alive socket that the server (`src/server/index.ts:59`, default 5 s) has already closed. Idle host, 8 s wait added: BLOCKED 9162 ms -> "fetch failed / ECONNRESET", exit 1. With `connection: close` the same block (9260 ms) and a loaded block of 73 s pass; without it a loaded block of 39 s fails. A second defect: after any failure `monitor` (opened at :316, closed only at :484) keeps the database open, `rmSync` at :496 throws EPERM and the "SMOKE FAILED (n)" line is lost and a `timesheet-smoke-*` folder remains. Other fetch-after-spawnSync sites: `tests/e2e/fixtures.ts` (fixed by FIX5; health poll at :69 is a weak point, not reproduced) and `scripts/container-drill.mjs:174` against `docker exec` (same pattern, not run). The integration tests, the other e2e helpers and the other scripts have no such site (list in 40).

**4. Proposed minimal fixes (FIX6; no assertion or timeout changed).**
- *FIX6a (S, low risk):* `vitest.config.ts` add `maxWorkers: '50%'` after line 8; `scripts/smoke-built-server.mjs` add `connection: 'close'` at :76 (call) and :415, and close `monitor` in the `finally` (declare at :114) before `rmSync`. Owned: those two files. Proof in 30 and 40.
- *FIX6b (S, low-medium, optional because it touches src/):* `src/server/jobs/pdfJob.ts` line 9 `import type { PdfOrigin, TimesheetPdfInput }`, line 244 `deps.render ?? (await import('../pdf/timesheetPdf.ts')).renderTimesheetPdf`. typecheck and emit passed; lint, e2e and the first real PDF not yet run. Gives 37% cheaper CLIs for tests, smoke and e2e drains.
- *FIX6c (XS, optional):* the same header in `tests/e2e/fixtures.ts:69`, `tests/e2e/setup.spec.ts:98`, `scripts/container-drill.mjs:174`.
- *Gate procedure (no code):* start the REGATE only after a 60 s census shows no leftover and under ~4 busy cores; run `npm test` and `npm run verify` one after another; a timeout run is repeated once and both are recorded (the 2-CPU failure regime is not fixable by settings).
- *Owner:* close `bash.exe waitfor.sh out/sweep.done 590` (one core since 12:29); the Edge tabs with high CPU (three renderer processes) are the owner's call. Our tasks never kill by PID.
- Spare waiters: `waitfor.sh` (read -t on a FIFO) can hang and spin; prefer the Bash tool's background run with its exit notice.

Slips: about a dozen `| head`/`| tail`/`| cat` pipes in my Bash lines (listings only; see 00-README). No heredoc, stdin to node/python, `node -e`, /dev/null, rm -r, PID kill or Stop-Process.

Status: done
