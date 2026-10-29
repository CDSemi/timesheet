# WP5-UX5-REGATE14 dispatch brief (regate after FIX19, client change and digest script)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-REGATE14, package WP5, kind
  gate, attempt 1. It depends on WP5-UX5-FIX19-FREEZE.
- **Scope.**
  - **WP5-UX5-AUDIT-INT2** (FIX REQUIRED on d96df5d) closed F-UX5I-1 and found two new
    findings:
    - **F-UX5I2-1 (Medium, pre-existing).** A session write in the open Day editor let the
      next "Save day fields" silently overwrite day fields changed elsewhere.
    - **F-UX5I2-2 (Low).** `npm run digest` failed with ENOBUFS in every checkout.
  - **WP5-UX5-FIX19** fixed both:
    - `DayEditor.tsx`, and possibly `DayFieldsForm.tsx`;
    - new cases in `day-editor.spec.ts`;
    - `scripts/source-digest.mjs` (`maxBuffer`);
    - possibly one docs/04 clause, in EN and VI.

  Read `handoff/delivery/WP5_UX5_REVIEW_INT2.md`, and the Results of FIX19 in
  `handoff/delivery/tasks/`. The last gate, REGATE13 on d96df5d, passed.
- **Target.**
  - TARGET_SHA = the `commit_sha` of WP5-UX5-FIX19-FREEZE on the board. TARGET_DIGEST = the
    digest of FIX19 on the board. The coordinator confirms both, FIX19's paths and its FULL
    counts in the line below before dispatch. HEAD must equal origin/main, or be a later
    commit that changes only `handoff/`.
  - Target confirmation:
    - TARGET_SHA = 0b457817ed29806a36fdd78cc22ac84a0cc2db9d, the FIX19-FREEZE commit,
      pushed as a fast-forward from d96df5d.
    - TARGET_DIGEST = 67aa715c4cf600624b835a27c568f9225e471e43d819894fbeb8b4da6a89c42b
      (882 files).
    - FIX19's paths: `docs/04_UX_AND_SETTINGS.md` and `.vi.md`,
      `scripts/source-digest.mjs`, `src/client/DayEditor.tsx` and
      `tests/e2e/day-editor.spec.ts`. `DayFieldsForm.tsx` is unchanged.
    - FIX19's FULL counts: desktop 484 ok / 36 skipped, mobile 408 ok / 112 skipped.

  Compute the digest in three forms, before and after, and record the file count.
  `npm run digest` must now work, both in the repository and in a clean clone. That is part
  of item 1.
- **Profile and routing.** timesheet-verifier, requested sonnet/medium, no override.
  - Routing: size M, risk H (the Day editor's day-fields version path), novelty no.
  - `dist/client` changes. If `dist/server`, `dist/domain`, `package.json` and the lockfile
    are unchanged, the container drill and `npm audit` carry forward from REGATE11. axe is
    rerun on the screens the change touches.
  - Write the records in English.
- **You run alone.** No other mission agent is active.
- Never touch `.claude/worktrees/` or its branch. Do not push, pull or merge.

## The load rule (as in REGATE12 and REGATE13)

1. **Entry census.** Take two inline samples, a few seconds to a minute apart.
   - If the non-mission load is above about 8 busy cores, stop and report "host busy" with
     the figures. Do not wait, do not sleep, and do not proceed.
   - If the inline query is denied, record "census not taken (permission)" and go on.
2. Take a census at the end of each sweep, and right after any failure.
3. **Classify every failure from its trace.**
   - **A timeout whose trace shows host starvation, while the census right after is over
     the limit.** Starvation means fast server answers, and a browser step that is slow or
     never completes. That run is NOT VERIFIED. Repeat it once after the load is back
     within the limit, and record both runs. The repeat must pass.
   - **A network or buffer error:** repeat once.
   - **Every other failure fails the gate.**
4. Never rerun a run to turn an assertion failure into a pass.

**Public repository:** evidence may hold process names, IDs, counts and CPU times only.
Never write the command line of a process the mission did not start. Use only inline
`powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process | Select-Object ..."`
queries. Never use `-ExecutionPolicy` or `-File`.

## Gate items

1. **Identity and scope.**
   - The digest in three forms, before and after: the export form, `git ls-tree`, and
     `npm run digest`. Also run `npm run digest` in a clean clone of TARGET_SHA; it must
     work.
   - `git diff --name-status d96df5d..TARGET -- . ':!handoff'` must list exactly FIX19's
     paths. No package or lockfile change.
   - **Clean builds** of d96df5d and of the target, each after its own `npm ci` in an export.
     Compare all of `dist/`:
     - `dist/server` and `dist/domain` must be identical;
     - only `dist/client` may differ. Name the changed files, and normalise hash names for
       lazy chunks.
     - If `dist/server` differs, the drill and `npm audit` must run; report it.
   - If docs/04 changed, check that EN and VI say the same, and that they match the build.
2. **Core,** in the export, one at a time:
   - `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build` (no chunk advisory, no
     deprecation warning);
   - `npm run verify`;
   - `npm test` three times. Expect 101 files and 2,397 tests.
   - **The validators:** `check_recovery.py` (106), `validate_package.py --preflight`
     (workflow Python) and `validate_orchestration.py`.
   - Do not run `npm ci` or `npm install` in the repository.
3. **The real-clock FULL e2e** on both projects, alone, with per-project counts: 0 failed.
   The expected counts are FIX19's, confirmed above.
4. **The simulated-clock sweep:** all six runs, at the same instants and scopes as
   REGATE13, with `--workers=6`, through the FIX10 wrapper. Validate the preload with one
   control first. Every run ends with 0 failed, under the load rule.
5. **Stress,** 0 failed:
   - FIX19's new tests, desktop, `--repeat-each=20 --workers=10`, on the real clock and at
     2026-10-27T06:58:30Z;
   - FIX18's tests;
   - the Day editor's unsaved-changes tests (the Escape test and the same-task test), both
     projects, `--repeat-each=20 --workers=10`.
6. **Test strength.** Use FIX19's mutant definitions in its evidence. Run them in a scratch
   copy, and restore it byte-equal afterwards. Each mutant must fail its named test, as
   FIX19 recorded:
   - `saved()` without the guard;
   - the unsaved-edit branch removed;
   - each of FIX18's guards removed in turn;
   - the digest fix reverted.

   If FIX19 recorded a mutant as indistinguishable with a reason, report it the same way;
   it is not a gate failure. Also read the FIX19 diff:
   - no loosened assertion;
   - no dropped check;
   - no raised timeout;
   - no sleep;
   - the version check kept for changes from elsewhere;
   - no new state or message.
7. **axe 4.14.0**, loaded from your task folder with no dependency added, light and dark: the
   Timesheet with the Day editor open on a past workday with a session:
   - at 1440 px;
   - at 1280 px;
   - at 390 px;
   - before and after a session save;
   - with the stale notice shown.

   Expect 0 violations.

**Decision:** PASS, FAIL or NOT VERIFIED. NAS items stay NOT VERIFIED.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-REGATE14`. Set TEMP and TMP to it. Ports
  51770-51809, with `SMOKE_PORT` in that range.
- Run each Playwright run with its own output folder, one after another.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder. Never touch
  `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash. Use PowerShell only for the inline read-only census.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY ONES,
  NOT EVEN TO WRITE A FILE), NO `node -e` OR `node -p` (NOT EVEN `node -e 1`), NO
  `python -c`, NO `node -` OR `python -`. NEVER PIPE INTO `head`, `tail` OR `cat`. NEVER
  REDIRECT TO OR FROM `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul`, ALSO
  NOT IN `2>` AND NOT AS A `cp` TARGET. NO `rm -r` OR `rm -rf`, ALSO NOT ON SCRATCH FOLDERS.
  NO PID KILLS, NO `Stop-Process`, NO `sed -i`, NO INTERACTIVE SHELLS, NO FIFO WAITER
  SCRIPTS, NO `git init`, NO `ping`, `sleep` OR `tail -F` USED AS WAITS, NO DETACHED SHELLS
  (`nohup`, `setsid`, `disown`, `start`), NO POLLING HELPER SCRIPTS OR WAIT LOOPS, NO
  TRAILING `&` INSIDE A BACKGROUND RUN.**
  - Write and change scripts with the Write and Edit tools.
  - To wait for a long command, use the Bash tool's own background run and its exit notice.
    Before you return, make sure each one has ended. A run you must stop is stopped through
    its own handle, never by PID.
- **Git.** Never change any git configuration. For git in a scratch export or clone, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH, also for evidence copies:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- **If a run hangs** (no log change for 15 minutes), record it, stop it through its own
  handle, and rerun once.
- **Files.**
  - Create files only in the task folder and the evidence folder.
  - Keep every probe script in the evidence folder as `*.ts.txt`, `*.mjs.txt` or `*.sh.txt`.
  - Evidence is masked LF `.txt` only. Every file ends with exactly one newline, this
    brief's Results included.
- **Data.**
  - Use synthetic data and local mail capture only.
  - Never edit source, docs, tests, the board or STATE.
  - Write no password literal, and mask user profile paths as `<user>`.
  - No evidence basename may contain "signature" unless it also contains "synthetic".
  - Write no email address except `@example.invalid`.
- **Leave nothing running.**
- If a permission check denies a call, stop and report. The only exception is the census
  rule above.

## Output

- **Results** in this file, concise.
- **Evidence** in `handoff/delivery/evidence/WP5-UX5-REGATE14/` (masked LF `.txt`).
- **Return** at most 150 words, beginning with 'Self-reported model: ...', with:
  - the decision;
  - every failure, with its class and the census beside it;
  - the `dist/` comparison;
  - `npm run digest` in a clean clone;
  - the sweep counts;
  - the axe counts;
  - the digest.

## Results

Self-reported model: claude-sonnet-5-5. Evidence: `handoff/delivery/evidence/WP5-UX5-REGATE14/` (index `00-README.txt`). **Decision: PASS.** NAS items stay NOT VERIFIED.

- **Load.** Entry census 0.63 and 0.91 busy cores (limit about 8); the highest in-run census was 1.86. No test failed anywhere, so no failure class and no repeat.
- **1 Identity.** HEAD = origin/main = 0b457817 before and after; nothing changed outside `handoff/`. Digest 67aa715c4cf600624b835a27c568f9225e471e43d819894fbeb8b4da6a89c42b, 882 files,
  equal in the export form, `git ls-tree` and `npm run digest`, before and after. `npm run digest` in a clean clone of the target: exit 0, same digest. Reverting the `maxBuffer` line
  in that clone: exit 1, `spawnSync git ENOBUFS`; restored byte-equal, exit 0. `git diff --name-status d96df5d..target -- . ':!handoff'` lists exactly the five FIX19 paths; no package or lockfile change;
  `git diff --check` 0. dist/: clean builds of both (250 files each, own `npm ci`): 26 differing lines, all under `dist/client`; `dist/server` and `dist/domain` identical, so the drill and
  `npm audit` carry forward. Changed: `index.html`, the entry chunk `index-D6YCEv6o.js(.map)` to `index-PcdqNPHg.js(.map)`, and the five lazy chunks (AdminScreen, ImportScreen,
  ReviewScreen, SettingsTransfer, SettingsTransferFile) by name only (equal once names are normalised); the CSS file is the same. docs/04 EN and VI carry the same added clause.
- **2 Core.** `npm ci`, lint, typecheck, build (entry chunk 493 kB, no advisory, no deprecation line), `npm run verify` (smoke PASS) all exit 0; `npm test` 3 times: 101 files, 2,397 tests each.
  `check_recovery.py` PASS (106), `validate_package.py --preflight` 0, `validate_orchestration.py` 0.
- **3 Real-clock FULL e2e.** Desktop 484 ok / 36 skipped / 0 failed; mobile 408 ok / 112 skipped / 0 failed.
- **4 Sweeps** (FIX10 wrapper, `--workers=6`, preload validated by controls): full 2026-10-26T16:00Z, 2026-11-01T08:45Z, 2027-03-14T10:30Z each desktop 484/36, mobile 408/112; seven-file
  2026-10-27T06:58:30Z, 2027-01-01T07:30Z, 2027-01-01T08:30Z each desktop 234/16, mobile 166/84. All 0 failed.
- **5 Stress** (`--repeat-each=20 --workers=10`): FIX19 tests desktop real 220 and at 2026-10-27T06:58:30Z 220; FIX18 desktop real 80 (20 skipped), crossing 80, mobile 20; unsaved-changes tests desktop 40, mobile 40. 0 failed.
- **6 Test strength.** In `export-mut`, each restored byte-equal: PA fails 3 (G1, G2, G3), PB G3, PE N, PF O, PS O, ND B(leave minutes), ND2 B(leave kind), NG FIX18 T3 + B(notes), NH B(category), NC B(WFH); the unmutated build passes 15 of 15. As FIX19 recorded; none indistinguishable. Diff read: tests purely additive (no removed line), no loosened or dropped assertion, no sleep, no raised timeout (the only timeouts are new 7 s bounds on the new tests' own `waitForResponse`), the follow-read version check kept, no new state or message (two refs and one helper, no state, no text).
- **7 axe 4.14.0** (task-local, no dependency), light and dark, Day editor on a past workday with a session, as opened / after a session save / with the stale notice: 1440, 1280 (desktop) and 390 (mobile) all 0 violations (18 scans per scheme-set: desktop 6 + 6, mobile 3 + 3 = 36 scans, 0 violations; incomplete items color-contrast and label-content-name-mismatch only, as before).
- Slips: a few read-only pipes (`99-slips.txt`), nothing written by them. Nothing left running.
