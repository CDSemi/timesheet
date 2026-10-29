# WP5-UX5-REGATE15 dispatch brief (scoped regate after the release-notes refresh, and the pilot samples from the release)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-REGATE15, package WP5, kind
  gate, attempt 1. It depends on WP5-UX5-RELNOTES-FREEZE.
- **Scope.**
  - WP5 was re-accepted after UI change rounds 4 and 5 on 0b45781 / 67aa715c, by
    WP5-UX5-REGATE14 (PASS) and WP5-UX5-AUDIT-INT3 (PASS).
  - **WP5-UX5-RELNOTES** then changed four documentation files: `README.md`,
    `README.vi.md`, `docs/12_RELEASE_NOTES.md` and `docs/12_RELEASE_NOTES.vi.md`. The
    freeze commit of that change is the release candidate.
  - This gate proves three things:
    - nothing else changed;
    - the builds are identical, so REGATE14's runtime items carry forward;
    - the documentation change is sound as a document.
  - It also regenerates the pilot samples from the release. The pilot packet promised this
    after the round-5 gate (`handoff/delivery/WP5_PILOT_PACKET.md` section 3). RELNOTES
    found that `src/server/pdf/timesheetPdf.ts` (94accda) and the nodemailer pin (f4049aa)
    changed after the sample commit 69d6340.
  - Read the Results of `handoff/delivery/tasks/WP5-UX5-RELNOTES.md` and of
    `WP5-UX5-REGATE14.md`.
- **Target.**
  - TARGET_SHA = the `commit_sha` of WP5-UX5-RELNOTES-FREEZE on the board. TARGET_DIGEST =
    the `source_digest` of WP5-UX5-RELNOTES on the board. The coordinator confirms both in
    the line below before dispatch. HEAD must equal origin/main, or be a later commit that
    changes only `handoff/`.
  - Target confirmation: (filled in at dispatch)
- **Profile and routing.** timesheet-verifier, requested sonnet/medium, no override.
  - Routing: size S, risk M (the release identity and the pilot samples), novelty no.
  - Write the records in English.
- **You run alone.** No other mission agent is active.
- Never touch `.claude/worktrees/` or its branch. Do not push, pull or merge.

## Gate items

1. **Identity and scope.**
   - Compute the digest in three forms, before and after, and record the file count: the
     export form, `git ls-tree`, and `npm run digest`. Also run `npm run digest` in a clean
     clone of TARGET_SHA.
   - `git diff --name-status 0b45781..TARGET -- . ':!handoff'` must list exactly the four
     documentation files. No package or lockfile change.
   - Run `git diff --check` on that range.
2. **Builds.**
   - Make clean builds of 0b45781 and of the target, each after its own `npm ci` in an
     export.
   - All of `dist/` must be identical: count the files and compare their hashes.
   - If `dist/` is identical, REGATE14's runtime items carry forward. These are the
     real-clock FULL e2e, the six sweeps, stress, the mutants and axe. The drill and
     `npm audit` carry forward from REGATE11. Say so.
   - If any `dist/` file differs, report it as FAIL.
3. **Core,** in the target export, one at a time:
   - `npm run lint`, `npm run typecheck` and `npm run build` (no chunk advisory, no
     deprecation warning);
   - `npm test` once. Expect 101 files and 2,397 tests.
   - **The validators:** `check_recovery.py` (106), `validate_package.py --preflight`
     (workflow Python) and `validate_orchestration.py`.
   - Do not run `npm ci` or `npm install` in the repository.
4. **The documents.**
   - Every markdown link in the four files resolves to an existing file.
   - EN/VI parity of both pairs: heading counts, and identical IDs, SHAs and links.
   - No line of the four files states a digest of the target tree.
   - Do not judge the wording; the audit does.
5. **Pilot samples from the release.** Regenerate them with the WP5-UX5-T06 recipe, on a
   clean `git archive` export of TARGET_SHA.
   - The recipe, as T06 recorded it: `npm ci` (Node 24), `npm run build:server`,
     `make-samples.mjs`, `extract.mjs` and the ready check. The scripts and commands are in
     `handoff/delivery/evidence/WP5-UX5-T06/`: `make-samples.mjs.txt`, `extract.mjs.txt`,
     `ready-check.mjs.txt` and `01-commands.txt`.
   - **Copies of the scripts.**
     - Copy the scripts into your task folder.
     - Change only ports (to your range), paths and the commit label.
     - Record the diff of each copy against the T06 text.
     - Use the same fixed clocks, the same synthetic people, capture mode only, and
       `PRODUCTION_SENDING_ENABLED` never set.
   - **Write the outputs** to `handoff/delivery/evidence/WP5-UX5-REGATE15/samples/`, with
     T06's file names:
     - `msg-*.txt`;
     - `pdf-text-*.txt`;
     - `sample-index.txt`;
     - the six `pilot-*-p1-synthetic.png` renders, at most 12 images.

     View every render after you make it.
   - **Compare with T06,** sample by sample. Record the comparison in `samples-compare.txt`:
     - the PDF SHA-256, and whether it equals T06's;
     - the PDF text, and whether it is identical;
     - the message subject, headers and decoded body. Boundaries, Message-IDs and the
       transport's own headers are excluded; name what you excluded.
   - **Explain every difference** by a commit between 69d6340 and the target, or report it
     as unexplained. An unexplained difference in content, people, dates or figures fails
     this item.
   - The run must capture 11 messages and 6 PDFs, with `pdf_hash_ok` true for all six and no
     job in intervention.

**Decision:** PASS, FAIL or NOT VERIFIED. NAS items stay NOT VERIFIED.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-REGATE15`. Set TEMP and TMP to it. Ports
  51850-51889.
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
  - Evidence is masked LF `.txt`, plus the six `-synthetic.png` renders. Every file ends
    with exactly one newline, this brief's Results included.
- **Data.**
  - Use synthetic data and local mail capture only.
  - Never edit source, docs, tests, the board, STATE or the pilot packet.
  - Write no password literal, and mask user profile paths as `<user>`.
  - No evidence basename may contain "signature" unless it also contains "synthetic".
  - Write no email address except `@example.invalid`, and no Message-ID except
    `@timesheet.invalid`.
- **Leave nothing running.**
- If a permission check denies a call, stop and report.

## Output

- **Results** in this file, concise.
- **Evidence** in `handoff/delivery/evidence/WP5-UX5-REGATE15/`, with an index
  `00-README.txt`.
- **Return** at most 150 words, beginning with 'Self-reported model: ...', with:
  - the decision;
  - the diff scope;
  - the `dist/` comparison;
  - the test count;
  - the document checks;
  - the sample comparison: hash equality per sample, each difference and its cause;
  - the digest.

## Results
