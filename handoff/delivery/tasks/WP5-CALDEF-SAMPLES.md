# WP5-CALDEF-SAMPLES dispatch brief (pilot samples and ready check regenerated from the accepted b810ba9)

- **Task.** Mission timesheet-software-readiness, task WP5-CALDEF-SAMPLES, package WP5, kind
  gate, attempt 1. It depends on WP5-CALDEF-AUDIT (PASS).
- **Why.**
  - The pilot packet's samples (eleven captured messages, six PDFs) and its ready check come
    from WP5-UX5-REGATE15 on dc487c6.
  - The packet worker (WP5-CALDEF-ACCEPT-PACKET) found that the sample generator runs through
    two modules the R-UX5I2-3 round changed:
    - it imports `timesheetCommands` and calls `createSession` and `updateSession`;
    - the sign-offs pass through `effectiveCategory` in `timesheets`, which the round
      refactored.

    See `evidence/WP5-CALDEF-ACCEPT-PACKET/10-*` and `11-*`.
  - The audit found the PDF, mail and send-job modules byte-identical. That does not prove
    the sample content.
  - The owner reviews these samples before the pilot. They must come from the accepted
    release, or be shown equal to it. WP5-UX5-REGATE15 set this precedent when the PDF code
    changed.
- **Scope.** This task only reproduces evidence. It changes no file outside `handoff/` and
  is not a regate of the source; WP5-CALDEF-REGATE and WP5-CALDEF-AUDIT already accepted
  b810ba9.
- **Profile and routing.** timesheet-verifier, requested sonnet/medium, no override.
  Routing: size S, risk M (what the owner reviews), novelty no. It runs alone.
- **AGENTS.md on disk wins.** Read it first.
- **Target.**
  - TARGET_SHA = b810ba942c608e058bd8c146de6f076734c48bf2.
  - TARGET_DIGEST = 59e2ec3f22d951366d4a54d0564ed2731d3b4f8c1fa90bc1cfbea10ebf0d770a
    (885 files).
  - HEAD is b810ba9. The working tree has uncommitted documentation changes outside
    `handoff/` (WP5-CALDEF-DOCFIX), so work only on a clean `git archive` export of
    TARGET_SHA.
  - Record the export's digest with `scripts/source-digest.mjs` run on the export. It must
    equal TARGET_DIGEST.

## Steps

1. **Identity.**
   - Record `git rev-parse HEAD origin/main` (both b810ba9).
   - Make the clean export of TARGET_SHA and record its digest.
   - Record `git status --short -- . ':!handoff'`. Expect the eight uncommitted documentation
     files and nothing else; record them, do not touch them.
2. **Pilot samples from the release.** Follow item 5 of
   `handoff/delivery/tasks/WP5-UX5-REGATE15.md` exactly (the WP5-UX5-T06 recipe), on the
   export:
   - `npm ci` (Node 24), `npm run build:server`, `make-samples.mjs`, `extract.mjs` and the
     ready check;
   - script copies in your task folder: change only ports, paths and the commit label, and
     record the diff of each copy against REGATE15's copies;
   - the same fixed clocks, the same synthetic people, capture mode only,
     `PRODUCTION_SENDING_ENABLED` never set;
   - outputs in `handoff/delivery/evidence/WP5-CALDEF-SAMPLES/samples/` with the same file
     names: `msg-*.txt`, `pdf-text-*.txt`, `sample-index.txt` and the six
     `pilot-*-p1-synthetic.png` renders (at most 12 images). View every render after you make
     it.
   - The run must capture 11 messages and 6 PDFs, with `pdf_hash_ok` true for all six and no
     job in intervention.
3. **Compare with WP5-UX5-REGATE15** (`evidence/WP5-UX5-REGATE15/samples/`), sample by
   sample, in `samples-compare.txt`:
   - the PDF SHA-256, and whether it equals REGATE15's;
   - the PDF text, and whether it is identical;
   - the message subject, headers and decoded body. Exclude boundaries, Message-IDs and the
     transport's own headers, and name what you excluded.
   - Pair the samples by recipients, Subject and Date if file numbers differ.
   - Explain every difference by a commit between dc487c6 and b810ba9, or by a per-run value
     REGATE15 already named (the submission ID, a send time). Otherwise report it as
     unexplained.
4. **The ready check:** compare its output with REGATE15's `44-ready-check.txt` and explain
   every difference.

**Decision.** PASS when the run is complete and every difference is explained. FAIL on any
unexplained difference in content, people, dates or figures. NOT VERIFIED if the recipe
cannot run. Write no recommendation about the product; report facts.

## Runtime

- **Task folder** `D:\.claude-tmp\timesheet\WP5-CALDEF-SAMPLES`. Set TEMP and TMP to it.
- **Ports** 52330-52369.
- **Data.** Set `DATA_DIR` and `DATABASE_PATH` inside the task folder. Never touch
  `%LOCALAPPDATA%\timesheet-dev`.
- **Shells.** Use Git Bash. Use PowerShell only for inline read-only queries
  (`-NoProfile -Command`), never with `-ExecutionPolicy` or `-File`.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY ONES), NO
  `node -e` OR `node -p` (NOT EVEN `node -e 1`), NO `python -c`, NO `node -` OR `python -`.
  NEVER PIPE INTO `head`, `tail` OR `cat`. NEVER REDIRECT TO OR FROM `/dev/null`,
  `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul`, ALSO NOT IN `2>`. NO `rm -r` OR `rm -rf`,
  NO PID KILLS, NO `sed -i`, NO DETACHED SHELLS, NO `sleep`, `ping` OR `tail -F` USED AS
  WAITS, NO GIT CONFIGURATION CHANGES.**
  - Write scripts as files in the task folder and run them by path.
  - Read outputs with the Read tool.
  - To wait for a long command, use the Bash tool's own background run and its exit notice.
- **Node and npm.** Put Node 24 first on PATH for every node or npm call. Do not run `npm ci`
  or `npm install` in the repository.
- **Git.** For git in a scratch clone, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- **Public repository.** Evidence may hold process names, IDs, counts and CPU times only.
  Never write the command line of a process the mission did not start.
- **Private data.** Use synthetic data and local mail capture only. No email address except
  the full synthetic `@example.invalid` form. Write `<user>` for profile paths.
- **Files.** Create files only in the task folder and
  `handoff/delivery/evidence/WP5-CALDEF-SAMPLES/`, plus this brief's Results.
  - Every file ends with exactly one newline.
  - Evidence names end in `.txt` or `-synthetic.png` only; keep scripts as `*.mjs.txt`.
- **Processes.** Never kill processes by PID. Leave nothing running.
- **Permissions.** If a permission check denies a call, stop and report.

## Output

- Evidence in `handoff/delivery/evidence/WP5-CALDEF-SAMPLES/`, with an index
  `00-README.txt`.
- Results in this file, ending with "Status: done".
- Return at most 150 words, beginning with "Self-reported model: ...". Include:
  - the decision;
  - the identity;
  - the counts (messages, PDFs, `pdf_hash_ok`);
  - the comparison result per group;
  - every difference and its cause;
  - the ready-check result.

## Results

Self-reported model: claude-sonnet-5-5. Evidence: `handoff/delivery/evidence/WP5-CALDEF-SAMPLES/` (index `00-README.txt`).

**Decision: PASS.** Every difference is explained; none is in content, people, dates of the timesheet or figures.

- **Identity.** HEAD = origin/main = b810ba9. Clean `git archive` export; `scripts/source-digest.mjs` on it = 59e2ec3f...0d770a (885 files), the same before and after. Status outside `handoff/`: the eight uncommitted documentation files, untouched.
- **Run.** Node v24.21.0; `npm ci` exit 0; `build:server` exit 0; make-samples, extract, ready check exit 0. 11 messages, 6 PDFs, `pdf_hash_ok` true for all six, no job in intervention or failed. Six renders made and viewed.
- **Scripts.** `make-samples` differs from REGATE15's copy in the two label comment lines; `extract` is identical; `ready-check` differs in the port (52330) only.
- **Comparison (`samples/samples-compare.txt`).** 11 of 11 paired, 0 unmatched.
  - Subjects, recipients, decoded bodies and PDF text: identical in all 11 once the run-specific submission ID `TS-<date>-<10 hex>` is normalised. The submission ID comes from the random user id of each run, so it differs in every run. Rendered pages show the same names, dates, hours and totals (16:30 for revision 1, 17:00 for revision 2).
  - PDF SHA-256 and size: differ for all 6 PDFs. Cause: the submission ID, plus byte-level variance between runs of identical source. REGATE15's own control run (`45-control-run1-vs-run2.txt`) shows the same variance with identical sources (for example 42,661 against 42,651 bytes).
  - Split: 3 messages fully identical (the two "due in about 18 hours" notices and the signed notice); 3 differ only by the submission ID; 5 differ by the Date header as well (the comparison tool labels these "beyond the submission ID").
  - Date header differences (5): norows, manual rev1 and auto-off submissions are at 06:30 here against 06:32 in REGATE15; the two "submitted automatically" notices are at 06:36 against 06:30. Cause: the send time of a same-instant job. REGATE15 named this class (job retries and same-instant job order; its control run shows the same). In this run no job was retried (every pass line shows `retried` 0). No commit explains it: dc487c6..b810ba9 changes only `src/server/http/errors.ts`, `http/schemas.ts`, `services/dayEntries.ts`, `services/timesheetCommands.ts` and `services/timesheets.ts` (R-UX5I2-3) in the server; the pdf, mail, jobs, reviewPayload and deliveries paths are unchanged. The 06:36 notice time is one pass later than any REGATE15 or control notice; it is the same class (the reminder scan decides notices when it runs) but no control run here proves it. Reported as explained by send time, with this caveat.
- **Ready check.** `/api/health` 200, `/api/ready` 200 (schema 15 of 15, `data_dir_writable` true), server stopped through its handle (SIGTERM). Differs from REGATE15's `44-ready-check.txt` in the port (52330) and one trailing blank line only.
- **Not run.** Nothing in the brief was skipped. Nothing is left running.

Status: done
