# WP5-UX5-REGATE16 dispatch brief (scoped regate after FIX20, documentation only)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-REGATE16, package WP5, kind
  gate, attempt 1. It depends on WP5-UX5-FIX20-FREEZE.
- **Scope.**
  - WP5-UX5-AUDIT-RN (FIX REQUIRED on dc487c6 / 2072e3f2) found F-UX5RN-1: `DEVELOPMENT.md:3`
    (EN/VI) still said WP4 was not accepted.
  - **WP5-UX5-FIX20** fixed it, and changed in the same files:
    - DEVELOPMENT line 3, EN/VI;
    - docs/12:7 EN/VI, one release rule;
    - the optional wording items R-UX5RN-2, -3 and -5.
  - This gate proves three things:
    - nothing else changed;
    - the builds are identical to dc487c6, so REGATE15's and REGATE14's items carry forward,
      and REGATE15's samples still represent the release;
    - the documents are sound as documents.
  - Read the Results of `handoff/delivery/tasks/WP5-UX5-FIX20.md` and `WP5-UX5-REGATE15.md`,
    and `handoff/delivery/WP5_UX5_REVIEW_RN.md`.
- **Target.**
  - TARGET_SHA = the `commit_sha` of WP5-UX5-FIX20-FREEZE on the board.
  - TARGET_DIGEST = the `source_digest` of WP5-UX5-FIX20.
  - The coordinator confirms both, and FIX20's paths, in the line below before dispatch.
  - HEAD must equal origin/main, or be a later commit that changes only `handoff/`.
  - Target confirmation: (filled in at dispatch)
- **Profile and routing.** timesheet-verifier, requested sonnet/medium, no override.
  - Routing: size S, risk L (documentation only), novelty no.
  - Write the records in English.
- **You run alone.** No other mission agent is active.
- Never touch `.claude/worktrees/` or its branch. Do not push, pull or merge.

## Gate items

1. **Identity and scope.**
   - Compute the digest in three forms, before and after, and record the file count: the
     export form, `git ls-tree`, and `npm run digest`. Also run `npm run digest` in a clean
     clone of TARGET_SHA.
   - `git diff --name-status dc487c6..TARGET -- . ':!handoff'` must list exactly FIX20's
     paths. No package or lockfile change.
   - Run `git diff --check` on that range.
2. **Builds.**
   - Make clean builds of dc487c6 and of the target, each after its own `npm ci` in an
     export.
   - All of `dist/` must be identical: count the files and compare their hashes.
   - If it is identical, REGATE15's items carry forward, including its samples, and so do
     REGATE14's runtime items and REGATE11's drill and `npm audit`. Say so.
   - If any `dist/` file differs, report it as FAIL.
3. **Core,** in the target export, one at a time:
   - `npm run lint`, `npm run typecheck` and `npm run build` (no chunk advisory, no
     deprecation warning);
   - `npm test` once. Expect 101 files and 2,397 tests.
   - **The validators:** `check_recovery.py` (106), `validate_package.py --preflight`
     (workflow Python) and `validate_orchestration.py`.
   - Do not run `npm ci` or `npm install` in the repository.
4. **The documents.**
   - Every markdown link in the changed files resolves to an existing file.
   - EN/VI parity of each changed pair: heading counts, and identical IDs, SHAs and links.
   - No line of the changed files states a digest of the target tree.
   - Search tracked markdown outside `handoff/`, `node_modules/` and `.claude/worktrees/` for
     any statement that a work package or UI round is still awaiting its gate or audit, or
     is not accepted. Record the hits.
   - Do not judge the wording; the recheck does.

**Decision:** PASS, FAIL or NOT VERIFIED. NAS items stay NOT VERIFIED.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-REGATE16`. Set TEMP and TMP to it. Ports
  51930-51969, if any are needed.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder. Never touch
  `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash. Use PowerShell only for inline read-only queries (`-NoProfile -Command`),
  never with `-ExecutionPolicy` or `-File`.
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
- **Files.**
  - Create files only in the task folder and the evidence folder.
  - Keep every probe script in the evidence folder as `*.mjs.txt` or `*.sh.txt`.
  - Evidence is masked LF `.txt` only. Every file ends with exactly one newline, this
    brief's Results included.
- **Data.**
  - Never edit source, docs, tests, the board or STATE.
  - Write no password literal, and mask user profile paths as `<user>`.
  - Write no email address except `@example.invalid`.
- **Leave nothing running.**
- If a permission check denies a call, stop and report.

## Output

- **Results** in this file, concise.
- **Evidence** in `handoff/delivery/evidence/WP5-UX5-REGATE16/`, with an index
  `00-README.txt`.
- **Return** at most 120 words, beginning with 'Self-reported model: ...', with:
  - the decision;
  - the diff scope;
  - the `dist/` comparison;
  - the test count;
  - the document checks and the search hits;
  - the digest.

## Results
