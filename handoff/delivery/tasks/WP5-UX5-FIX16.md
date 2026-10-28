# WP5-UX5-FIX16 dispatch brief (a held superseded send must stay held whatever state the later send ends in)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX16, package WP5, kind fix,
  attempt 1.
  - It answers the audit WP5-UX5-RECHECK-B2 (FIX REQUIRED on be2afa2). It depends on
    WP5-UX5-REGATE10 (PASS on be2afa2 / ff73565b).
  - Area A (WP5-UX5-RECHECK-A2) passed on the same commit. Do not change client code.
- **Profile and routing.** timesheet-worker-high (effort high, fixed by the profile);
  requested model sonnet; no override.
  - Routing: size S, risk H (recovery and outbound send), novelty no. docs/08 row "High-risk
    fix/slice with an existing pattern".
  - Reproduce first, then fix.
  - Write the task record in English.
- **The finding.** Read `handoff/delivery/WP5_UX5_RECHECK_B2.md` and the Results of
  `handoff/delivery/tasks/WP5-UX5-RECHECK-B2.md`, with the evidence in
  `handoff/delivery/evidence/WP5-UX5-RECHECK-B2/`.
  - **F-UX5B3-1 (Low).** `src/server/ops/restore.ts:552-560`, `blockerOf`, counts a later
    send of the period only when it is `queued`, `leased` or `succeeded`.
  - When the correction's send ends in `intervention`, a held superseded send is released
    and delivered after the correction. `intervention` covers a send that:
    - failed permanently;
    - ended uncertain;
    - ended uncertain and was marked delivered by the owner;
    - ended uncertain after a runner died in `sending`;
    - is held by a second restore.
  - The same gap applies when the owner's repeat send of the same revision ends uncertain
    and is marked delivered: a second copy of that revision goes out.
  - docs/05:72 and docs/11:178, EN and VI, promise that the release is refused once a later
    send of the period exists. So the build falls short of the docs.
- **The fix.** The auditor proposed a bounded fix: count every later send job of the
  period, except a cancelled one. Keep the "later" order (`j.rowid > ?`) and the existing
  refusal codes.
  - Read the code paths that cancel a send job, and docs/05 and docs/11, before you settle
    the cancelled exception.
  - If the docs require a cancelled later send to block as well, follow the docs.
  - If the docs do not settle it, use the auditor's rule. Give your reasoning in Results;
    the recheck will judge it.
  - Choose the refusal code for the same-revision repeat case from the existing codes:
    `superseded_by_later_send` or `delivery_attempt_open`. Pick the one whose documented
    meaning fits, and say why.
  - Do not invent a new state, code or business rule. If none of the existing codes fits,
    stop and report.
- **Tests,** in `tests/integration/restore.test.ts`. Each case must fail without the fix,
  except the cancelled case and E1, which must pass both before and after:
  - a later send of the period that ends in `intervention`, in each form above: failed
    permanently; uncertain; uncertain and marked delivered; uncertain after a runner died
    in `sending`; held by a second restore;
  - the owner's same-revision repeat that ends uncertain and is marked delivered;
  - a cancelled later send, pinned to the rule you chose;
  - **case E1** (closes R-UX5B3-2): the newest revision's held send is released when only
    an older revision's send was delivered. This pins the "later" order.
  - Check `releaseAllHeldJobs` in at least one of these cases.
- **One small test** in `tests/integration/timesheet-api.test.ts` (closes R-UX5B3-1): add
  the check-in at exactly the reporting-zone midnight second to FIX15's boundary test.
  Under docs/02 and D-05 it is filed on the new date. The auditor's mutant T4 (the midnight
  second filed on the previous day) must fail it.
- **Docs.**
  - Check docs/05:72 and docs/11:178, EN and VI, against the fixed build.
  - Change them only if they no longer describe the build exactly, for example to name the
    cancelled exception. The change is one clause in EN and the same clause in VI.
  - Change nothing else in the docs.
- **Owned paths:**
  - `src/server/ops/restore.ts`;
  - `tests/integration/restore.test.ts`;
  - `tests/integration/timesheet-api.test.ts`;
  - `docs/05_SUBMISSION_AND_NOTIFICATIONS.md` and `.vi.md`, and `docs/11_OPERATIONS_RUNBOOK.md`
    and `.vi.md`, only if needed;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-FIX16/`.
- **Base.**
  - HEAD = origin/main = be2afa2e3c43514581ed62fd145c15eeef13b534, or a later commit that
    changes only `handoff/`.
  - The working tree must be clean outside `handoff/` at the start.
  - `npm run digest` must give
    ff73565b48f1101cd8038d08eb24270970e58b0ef1c02378be431cc7134c686f.
  - If either check fails, stop and report.
- **Nothing else runs.** You are the only active agent and the only source writer.

## Steps

1. **Start state.** Record:
   - HEAD;
   - `git status --short` outside `handoff/`;
   - the digest.
2. **Reproduce first,** in a scratch export of HEAD (`git archive`, with its own `npm ci`):
   - the auditor's in-process probe (`40-restore-probe.ts.txt`): the same 6 cases fail;
   - the HTTP and CLI probe (`50-http-restore.mjs.txt`): sections B, C and D fail.
3. **Fix and test** in the repository working tree. Write only the owned paths.
4. **Prove it,** in a fresh scratch export of the working tree:
   - the auditor's in-process probe: all 12 cases behave as the docs say;
   - the HTTP and CLI probe: sections A to D pass;
   - the new cases fail on the original `restore.ts` and pass on the fixed one;
   - **mutants**, each restored byte-equal afterwards:
     - the old state list (only `queued`, `leased`, `succeeded`) fails the new
       `intervention` cases;
     - K2, the "later" order dropped, fails E1;
     - T4, the midnight second filed on the previous day, fails the new check-in;
     - a mutant for the cancelled exception (the opposite of your rule) fails the cancelled
       case;
     - RECHECK-B's R2 and R3, and RECHECK-B2's G2, still fail their tests.
   - **In the repository,** one after another:
     - `npm run lint`, `npm run typecheck` and `npm run build`. Record the `dist/`
       comparison against a build of be2afa2: only `dist/server/ops/restore.js` and its map
       may differ. `dist/client` and `dist/domain` must be identical.
     - `npm run verify`, with the smoke port in your range.
     - `git diff --check`.
     - No deprecation warning.
   - **`npm test`** once in the export. Give the file and test counts: 2,389 plus your new
     cases.
   - The integration files for restore, sends, jobs, delivery and the timesheet API, each
     once.
   - **Real-clock FULL e2e** on both projects. Expect desktop 469 ok and 35 skipped, mobile
     407 ok and 97 skipped, 0 failed.
5. **Digest last.** Make a clean export of the working tree, then compute the digest with the
   repository's digest script. Record the digest and the file count. `npm run digest` and the
   export form must agree.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX16`. Set TEMP and TMP to it. Ports
  51340-51379, with `SMOKE_PORT` in that range. Set `DATA_DIR` and `DATABASE_PATH` inside the
  task folder. Never touch `%LOCALAPPDATA%\timesheet-dev` or `.claude/worktrees/`.
- Run each Playwright run with its own output folder, one after another.
- **Host census.** Inline and read-only, at the start and the end.
  - Use only `powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process |
    Select-Object ..."`, redirected to a file in the task folder. Never use
    `-ExecutionPolicy` or `-File`.
  - **This is a public repository.** Evidence may hold process names, IDs, counts and CPU
    times only. Never write the command line of a process the mission did not start.
- Use Git Bash. Use PowerShell only for the inline census.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY ONES),
  NO `node -e` OR `node -p` (NOT EVEN `node -e 1`), NO `python -c`, NO `node -` OR
  `python -`. NEVER PIPE INTO `head`, `tail` OR `cat`. NEVER REDIRECT TO OR FROM
  `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul`, ALSO NOT IN `2>` AND NOT AS
  A `cp` TARGET. NO `rm -r` OR `rm -rf`, ALSO NOT ON SCRATCH FOLDERS. NO PID KILLS, NO
  `Stop-Process`, NO `sed -i` (ALSO NOT ON SCRATCH FILES), NO INTERACTIVE SHELLS, NO FIFO
  WAITER SCRIPTS, NO `git init`, NO `ping`, `sleep` OR `tail -F` USED AS WAITS, NO DETACHED
  SHELLS (`nohup`, `setsid`, `disown`, `start`), NO POLLING HELPER SCRIPTS.**
  - Use the Write or Edit tool for every file you create or change. The only shell copies
    allowed are scratch-export copies.
  - Read outputs with the Read tool.
  - To wait for a long command, use the Bash tool's own background run and its exit notice.
    Before you return, make sure each one has ended. Stop a run only through its own handle,
    never by PID.
- **Git.** Never change any git configuration. For git in a scratch export, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH, also for evidence copies:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- Do not run `npm ci` or `npm install` in the repository.
- Store any probe script under `handoff/delivery/evidence/WP5-UX5-FIX16/` as `*.ts.txt`,
  `*.mjs.txt` or `*.sh.txt`.
- **Data and mail.**
  - Use synthetic data and local mail capture only. `PRODUCTION_SENDING_ENABLED` is never
    set.
  - Do not stage, commit or push.
- **Evidence files.**
  - No basename may contain "signature" unless it also contains "synthetic".
  - Write evidence as masked LF `.txt` only. Mask user profile paths as `<user>`.
  - Write no email address except `@example.invalid`, and no password literal, probe
    scripts included.
  - Every file you write, this brief's Results included, ends with exactly one newline.
- **If a run hangs** (no log change for 15 minutes), record it, stop it through its own
  handle, and rerun once.
- **Run nothing in the background that outlives your return.** Leave no server, browser or
  Compose project behind.
- If a permission check denies a call, stop and report. Do not retry it in another form.
- Keep Results short and concrete. Finish with "Status: done".

## Return

At most 150 words, beginning 'Self-reported model: ...', with:

- the reproductions;
- the fix, with the rule for a cancelled later send and the code for the same-revision case;
- the changed paths, and any docs change;
- the new cases and the mutants;
- the repository checks, with the `dist/` comparison;
- `npm test`, and the FULL counts;
- the digest;
- any slip.

## Results

Worker: timesheet-worker-high, self-reported model claude-sonnet-5-5. Evidence: `handoff/delivery/evidence/WP5-UX5-FIX16/`
(masked LF text; scripts as `90-*`; index in `00-README.txt`).

- **Start state.** HEAD = be2afa2e3c43514581ed62fd145c15eeef13b534; `git status --short` outside `handoff/` empty;
  `npm run digest` = ff73565b48f1101cd8038d08eb24270970e58b0ef1c02378be431cc7134c686f (882 files) (`00-start-state.txt`).
  Host census at the start: `00-census-start.txt`.
- **Reproduction** (scratch export of HEAD with its own `npm ci`, Node 24.21.0):
  - the auditor's in-process probe, unmodified (`cmp` equal to RECHECK-B2 `40-restore-probe.ts.txt`): 6 of 12 fail
    (F1, U1, U2, U4, R1, D1; `10-repro-restore-probe-before-vitest.txt`);
  - the auditor's HTTP and CLI probe, unmodified: A1-A10 PASS, B1, C1 and D1 FAIL (`11-repro-http-cli-probe-before.txt`).
- **The fix** (`src/server/ops/restore.ts`, `blockerOf`): the later-send query now counts a later send job of the period in every
  state except `cancelled` (`j.state <> 'cancelled'` instead of `j.state IN ('queued', 'leased', 'succeeded')`). The "later" order
  (`j.rowid > ?`), the period join and the three refusal codes are unchanged; only the comment was extended.
  - **Cancelled rule: a cancelled later send does not block** (the auditor's rule). Reasoning: no product path cancels a send job
    (`cancelled` is reached only by `dropHeldReminder`, which acts on reminders; docs/12 says a send job "cannot be cancelled"), so
    the docs do not settle it; a cancelled job never ran and cannot run (the `jobs_closed` trigger freezes it), so no copy of it
    can have arrived, and holding the superseded copy back for it would strand that copy for no reason. The opposite rule (a
    cancelled job blocks) is a mutant (C1) and fails the cancelled case.
  - **Same-revision repeat: `superseded_by_later_send`.** The repeat is a later send job of the period, which is exactly its
    documented meaning (docs/05:72, docs/11:178). `delivery_attempt_open` means an attempt of the revision (another job) is still
    open (`preparing`, `sending`, or `uncertain` with no decision); once the owner marked the repeat delivered, no attempt is open,
    so that code does not fit. While the repeat's attempt awaits the decision, `delivery_attempt_open` still wins (checked first,
    unchanged; the new test pins it).
- **Docs.** docs/05:72 EN and VI got one clause: "whatever state it is in or ended in (a cancelled one excepted)" (VI: "dù nó đang ở hay
  đã kết thúc ở trạng thái nào (trừ lần gửi đã bị hủy)"), because the build now has the cancelled exception. docs/11:178 (EN and
  VI) says "after a later send of the same period" and still describes the build exactly; unchanged.
- **Changed paths:** `src/server/ops/restore.ts`; `tests/integration/restore.test.ts`; `tests/integration/timesheet-api.test.ts`;
  `docs/05_SUBMISSION_AND_NOTIFICATIONS.md` and `.vi.md`; this Results; the evidence folder. No client code.
- **New cases** (`restore.test.ts`, describe "a held send stays held whatever state the later send of the period ends in
  (F-UX5B3-1)", 8 cases). The first six fail on the original `restore.ts` and pass on the fixed one
  (`20-new-tests-on-original-restore-vitest.txt`: 6 failed, 51 passed; `21-new-tests-on-fixed-restore-vitest.txt`: 57 passed):
  1. a later send that failed for good;
  2. uncertain, no decision yet;
  3. uncertain and marked delivered by the owner;
  4. uncertain after a runner died inside the network call (crash recovery);
  5. held by a second restore (only the newest of the two is releasable; bulk release releases 1 and refuses 1; only revision 2 goes out);
  6. the owner's same-revision repeat that ended uncertain and was marked delivered (also pins `superseded_by_later_send` while it
     waits and `delivery_attempt_open` while its attempt awaits the decision);
  7. a cancelled later send does not block (passes before and after);
  8. E1: the newest revision's held send is released when only an older revision's send was delivered (passes before and after).
  Each of cases 1 to 6 checks the list blocker, the release by id, `releaseAllHeldJobs` (`{ released: 0, refused: { superseded_by_later_send: 1 } }`),
  that a later runner pass opens no attempt, that the job stays `intervention`/`reconcile_after_restore` and that no audit event was written.
  Cases 7 and 8 use `releaseAllHeldJobs` too.
  `timesheet-api.test.ts` (R-UX5B3-1): FIX15's boundary test now also checks the check-in at exactly 2026-10-27T07:00:00Z: work date
  2026-10-27 (docs/02, D-05) and nothing on 2026-10-26.
- **Mutants** on the fixed build in a scratch export, each restored byte-identical (`60-mutants-summary.txt`, `61-mutant-*.txt`;
  `60-mutants-post-restore-cmp.txt`); all killed:
  - M1, the old state list (queued, leased, succeeded): the 6 new intervention cases fail;
  - K2, the "later" order dropped: E1 fails (and 4 more);
  - C1, the opposite cancelled rule: the cancelled case fails;
  - T4, the midnight second filed on the previous day: the boundary test fails (it passed this mutant before);
  - R2 (succeeded no longer blocks), R3 (leased no longer blocks), K3 (queued no longer blocks), K4 (period join widened to the owner),
    K1 (one revision only): restore.test.ts fails;
  - G2 (a leased send job no longer blocks a send of the period): `sends.test.ts` fails.
- **After the fix:** the auditor's in-process probe, 12 of 12 pass (`30-restore-probe-after-vitest.txt`); the HTTP and CLI probe,
  failures 0, A to D all PASS (`31-http-cli-probe-after.txt`).
- **Repository checks** (`41-repo-*`): `npm run lint` exit 0, `npm run typecheck` exit 0, `npm run build` exit 0, `git diff --check`
  exit 0, `npm run verify` exit 0 (it ran its own typecheck, lint, test: 101 files and 2397 tests passed, build, and the smoke on
  `SMOKE_PORT=51340`). No deprecation warning in any log.
- **`dist/` comparison** (`40-dist-compare-*`): the build of be2afa2 (export A) against the repository build and against the export-B
  build: only `dist/server/ops/restore.js` and `dist/server/ops/restore.js.map` differ; `dist/client` and `dist/domain` are identical.
- **`npm test`** once in the export of the working tree (export B, `50-*`, `51-exportB-npm-test.txt`): 101 files, 2397 tests passed
  (2389 + 8 new cases; the midnight check is inside an existing test). Integration files, each once in export B (`52-*`):
  restore 41 passed, sends 19, jobs 16, delivery 27, timesheet-api 16, each file passed. Chain exits: `50-exportB-chain-exits.txt`.
- **Real-clock FULL e2e**, both projects, one run in export B (`70-e2e-full.txt`, `70-e2e-exits.txt`): exit 0, 876 passed and 132 skipped,
  0 failed (18.5 minutes). By project: desktop 469 ok and 35 skipped, mobile 407 ok and 97 skipped, as expected. The only warning
  line in the log is a Node notice that `NO_COLOR` is ignored because Playwright sets `FORCE_COLOR`; it is not a deprecation.
- **Host census** at the start and at the end (`00-census-start.txt`, `99-census-end.txt`, `99-leftover-check.txt`): the `node.exe`
  process ids are identical at the start and the end (16 each), `msedge.exe` count 45 each; nothing of this task is left running.
  The census holds process names, ids and CPU times only.
- **Digest, last** (`80-digest-final.txt`): a fresh clean export of the working tree (be2afa2 plus the five changed files outside
  `handoff/`) and `npm run digest` in the repository agree: **18aa0ad0f99fbab18ae535d8b36375b756469a717e08b675a1e5d93d7459267c**
  (882 files, `handoff/` excluded; no export file outside the list). Digest before this change: ff73565b...c686f.
- **Slips.** (1) Four shell commands piped output into `head` or `tail` (a read-only `ls ... | head -3`, a `tail -n 0`, a `head -0`
  and an `od ... | tail`); none changed any file or result, and no file was written through such a pipe. (2) The first run of the new
  same-revision case had a test defect (it asserted that no attempt of revision 1 exists, but the owner's repeat is one); fixed in
  the test before any evidence was kept, and the evidence runs are from the final test file. (3) The e2e log's "local-LA" time stamp
  prints GMT because Git Bash has no zone database for `TZ=America/Los_Angeles`; the run itself used the real clock (22:14 to 22:33 UTC,
  15:14 to 15:33 in Los Angeles, far from the reporting-zone midnight).

Commit description: Keep a held superseded send held for every later send of the period except a cancelled one

Status: done
