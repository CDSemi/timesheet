# WP5-UX5-AUDIT-B dispatch brief (area B: sign-off and send, data, migrations, PDF, privacy, docs)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-AUDIT-B, package WP5, kind
  audit, attempt 1.
  - It depends on WP5-UX5-REGATE4 (PASS on f4049aa / 26b163a6). The gate history:
    - WP5-UX5-GATE on e2bf1aa failed; FIX1 fixed it.
    - WP5-UX5-REGATE on 2bce0ab failed on one test race; FIX2 fixed it.
    - WP5-UX5-REGATE2 on 7aafa21 failed on two load flakes; FIX3 fixed them in tests.
    - WP5-UX5-REGATE3 on 5b8b718 failed on:
      - two sweep test defects;
      - a keep-alive harness defect;
      - two new `npm audit` advisories.

      DIAG2, DEPS1 and DIAG3 diagnosed them. FIX4 pinned nodemailer 10.1.4 and zod 4.6.6,
      FIX5 fixed the tests, and FIX6 fixed the harness and the vitest worker cap.
    - WP5-UX5-REGATE4 passed.
  - **Owner decisions of 2026-10-22** ("A.a, B.A, C.b"):
    - the target includes the owner's Ingat commits:
      - 6173f07 and 70dce2a (`ingat.toml`, the GHCR workflows, docs 07 and 11, ADR 0002);
      - 782cdda, through the owner's merge b8bae50 (GHCR cleanup: `scripts/ghcr-cleanup.ts`,
        its tests, the tsconfig files, docs 07 and 11, ADR 0002 and 0003).
    - Check them only for non-interference with rounds 4 and 5: no conflicting statement in
      docs 07 or 11 about sign-off, sending or the PDF. Do not review their deployment
      content;
    - never touch `.claude/worktrees/`.
  - The owner allows pushes to main; the target is pushed.
  - Run in a fresh context. It runs in parallel with WP5-UX5-AUDIT-A, which uses other
    ports and other folders.
- **Profile and routing.** timesheet-auditor, requested opus/xhigh, no override.
  - Routing: size L, risk H, novelty no. The scope covers:
    - the sign-off/send split;
    - the reason rule and its counting;
    - two migrations with a backfill;
    - per-send privacy;
    - the signed PDF and a third-party font;
    - round-4 authentication.
  - Write the task record in English.
  - The review pair is `handoff/delivery/WP5_UX5_REVIEW_B.md` and `.vi.md`. Use the REVIEW
    template in `handoff/templates/`.
- **Author separation.** You wrote no WP5-UX4 or WP5-UX5 task; their agent IDs are on the
  board. Treat every planner, worker, committer and verifier report as a claim.
- **Target.**
  - `reviewed_commit` = TARGET_SHA = f4049aa7905e22f1467dfcae4208675cb2fc8e80 (the
    WP5-UX5-FIX6-FREEZE commit, pushed, on top of the owner's Ingat merge b8bae50).
  - TARGET_DIGEST = 26b163a62b7d85dbf6b6146c73f98593ad6bcae7eeb8fb1dc7fd9d4dc8305336
    (882 files).
  - HEAD may be a later commit that changes only `handoff/`.
  - The base is the last accepted snapshot, 8e557100d16b6b6eb86a48e00276835761aabfdf.
  - Record HEAD, the digest before and after (three forms) and `reviewed_commit`.
  - Work on a clean export or a scratch clone at TARGET_SHA.
- **AGENTS.md on disk wins.** Rules 4, 6, 7 and 8 matter here.

## Read

- AGENTS.md from disk; docs/08 "Gates and independent audit".
- **The owner's words**, verbatim on the board (`owner_decisions`):
  - 2026-10-21: the round-5 request; F-1..F-10 with F-3 b, the F-4 reason rule and F-5 b;
    Q0 a; Q2; the font approval G-1;
  - 2026-10-22: "1 a, 2 a" (H-1 a);
  - the round-4 answers;
  - the `coordinator_decisions` of 2026-10-21 and 2026-10-22.
- The plan `handoff/delivery/tasks/WP5-UX5-PLAN.md`: sections B and C, and Addendum 1
  (B-A1..B-A4, C revised), Addendum 2 (C revised).
- The slice records `WP5-UX5-T01a.md`, `T01B.md`, `T02.md`, `T03.md` (the client side of
  sends) and `T06.md`; the gate `WP5-UX5-GATE.md`, `WP5-UX5-FIX1.md` (the drill's
  sign-off body for the previous build) and `WP5-UX5-REGATE.md`; and their evidence.
- **The fix rounds after REGATE:** `WP5-UX5-REGATE3.md`, `WP5-UX5-DEPS1.md`,
  `WP5-UX5-FIX4.md`, `WP5-UX5-DIAG3.md`, `WP5-UX5-FIX6.md` and `WP5-UX5-REGATE4.md`, with
  their evidence.
- **The round-4 finding** you recheck: `WP5-UX4-AUDIT-B.md` (F-UX4B-1) and its fix in
  `WP5-UX4-FIX2.md`.
- docs/01, 02, 03, 05, 06, 07, 10, 11 and 12, EN and VI; `docs/adr/0001-*` EN and VI;
  `assets/pdf-fonts/README.md` and `.vi.md`; the pilot packet
  `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`.

## Scope (area B)

1. **Sign-off without sending (T01A, T01B).**
   - Sign-off binds the reviewed payload, records the signed-in owner's display name, and
     records the image when one is saved (F-5 b). There is no typed name.
   - It posts OT credits once, enqueues no send, and refuses stale reviews.
   - The automatic-image authorization still governs only automatic submissions.
   - `signoffs` rebuild: the image is nullable, and the image-kind trigger still refuses a
     foreign or wrong-kind attachment.
2. **Sends (B-A1, B-A2).** Check `revision_sends`, the send route and the send job against
   the plan and docs/05:
   - ownership: only the owner; nothing on the shared allowlist;
   - validation: address rules, subject and body limits, the reason length and characters;
   - idempotency by request key: a replay returns the same send; another body gives 409;
   - two concurrent sends;
   - 409 while an attempt is open or uncertain, or a job is waiting;
   - **the counting rule.** `accepted` and `uncertain` count; `failed_permanent` does not.
     It is checked inside the transaction;
   - the resend decision on an uncertain attempt needs the reason;
   - the reason is stored, audited (`revision.send`), shown in the owner's History, and kept
     out of the email;
   - the job builds the message from its own row, and each attempt freezes its envelope and
     body hash;
   - no network inside a write transaction;
   - **per-send privacy.** The envelope and body are owner-only; administrators see
     recipient addresses of attempts only (F-Q3 b).
3. **Deadline and reminders (F-2 a, H-1 a):**
   - an unfinalized eligible draft is finalized and sent at the deadline;
   - a signed-not-sent revision is sent at the deadline with auto-submit on (origin
     `deadline`, the Settings envelope and switches, no reason), and warned with it off;
   - the N5 signed-not-sent reminder;
   - once any revision of the period has a send, the period counts as submitted: reminders
     stop and no correction is sent automatically. Judge T01B's deviation here against the
     owner's H-1 a.
4. **Migrations 0014 and 0015.**
   - Upgrade a schema-13 database holding signed, automatic, corrected, sent, uncertain and
     failed revisions. Check:
     - copies are complete;
     - variants are derived (`t1o1`, or `t1o0` when the snapshot had OT rows off);
     - one backfilled send per existing send job, with its envelope and bodies;
     - triggers are recreated;
     - foreign keys and integrity are OK.
   - The rollback position: an older build against schema 15 (docs/11 and the drill).
   - Backup and restore of variants and send rows.
5. **PDF variants and the routes.**
   - At most four PDFs per revision, each rendered once, hashed and never deleted.
   - The variant route renders on request with an atomic write.
   - The shared mount ignores the query and never renders.
   - The unsigned `pdf-preview` writes nothing.
   - Save PDF serves the stored variant.
   - The bytes are deterministic.
   - The signature image is embedded only in the owner's own PDF, and is never served on a
     public path or stored in the repository (AGENTS rule 4).
6. **The PDF content (T02).** Check against the plan's Addendum 2 table and mockup B11:
   - one page for all four variants, with four sessions a day and long holiday labels;
   - fields, footer texts and the year from the payroll date;
   - "Revision n" and the submission id (AC-10);
   - name only, versus image and name;
   - partial leave printed;
   - the holiday-label shrink and wrap.

   Judge T06's two corrected known limits against the code.
7. **The font asset (ADR 0001).**
   - Licence: SIL OFL 1.1 with its `OFL.txt`; embedding is allowed. The trailing-whitespace
     trim of `OFL.txt` keeps the licence text otherwise verbatim.
   - The file size and SHA-256 equal the README.
   - Only the PDF renderer uses it; it is not served over HTTP; the UI has no `@font-face`.
   - The Dockerfile and `.dockerignore` copy only that folder.
   - The per-cell fallback to DejaVu Serif Italic.
   - `wordmarkAsset.test.ts` pins exactly one tracked font.
8. **Settings (`show_time_on_pdf`).**
   - The Settings default reaches the send draft and deadline sends, not the sign-off's
     own PDF.
   - The settings-file key is optional on import, refused when it is not a boolean, and
     allowlisted.
   - Versions stay append-only.
9. **Round-4 recheck: F-UX4B-1** (the sign-in limiter lock-out). Is it fixed, still open,
   or regressed? Also check that round 5 left the round-4 server changes intact:
   - the password route;
   - `shared_clock_action`;
   - the preview limit;
   - the holiday preview counts;
   - the opening balance.
10. **Docs truth under AGENTS rule 8.** Each canonical rule changed in round 5 must match
    the code, with its `.vi.md`:
    - docs/01 FR-11;
    - docs/03 records and API;
    - docs/05 Manual path, Deadline, Reminders, Corrections and resends, Durable delivery;
    - docs/06 AC-06, AC-07, AC-10, AC-14;
    - docs/10;
    - docs/11 section 13;
    - docs/12.

    **The pilot packet:** do section 2, the samples S1-S6 and N1-N5 with their hashes, and
    section 8 tell the truth? Check that the release identity is marked for refresh.
11. **Dependencies and harness (FIX4, FIX6).**
    - **The pins.**
      - nodemailer 10.1.4 and zod 4.6.6 are exact, and the advisories are resolved:
        `npm audit --omit=dev` exits 0.
      - REGATE4 flagged a new nested, dev-only `smtp-server/node_modules/nodemailer`
        10.0.14. Run the full `npm audit` and judge whether that copy is an acceptable
        dev-only risk.
    - **Behaviour unchanged.** In capture mode, check against docs/05 and the tests:
      - the mail the app builds: envelope, headers, Message-ID `@timesheet.invalid`, body;
      - the zod 400 answers and messages.

      No deprecated nodemailer or zod API is used.
    - **The harness.** Review:
      - `scripts/smoke-built-server.mjs`: `connection: close`, and the monitor closed in the
        `finally` so the failure line is kept;
      - `scripts/container-drill.mjs`;
      - `vitest.config.ts` (`maxWorkers: '50%'`).

      The worker cap rests on DIAG3's controlled runs. FIX6's own before and after runs did
      not discriminate, and REGATE4's run at 4 logical CPUs passed. Judge whether the
      evidence is adequate.
    - **The deferred lazy PDF import.** DIAG3's FIX6b, `src/server/jobs/pdfJob.ts`, was
      deferred to the optional backlog. Say whether it should stay optional.
12. **Test strength.** Write at least ten mutants of your own on area-B behaviour, for
    example:
    - sign-off enqueues a send;
    - `failed_permanent` counts;
    - the reason is checked outside the transaction;
    - the same request key with another body is accepted;
    - the shared PDF route renders;
    - the deadline sends a correction after a sent copy;
    - the migration derives `t1o1` for an OT-off snapshot;
    - the fallback is removed;
    - the time rows are always printed;
    - the image is required again.

    Say whether the suite catches each.
13. **Mandatory checks yourself:**
    - typecheck, lint, `npm test` twice, build;
    - the integration files for submission, sends, jobs, the migrations and the PDF, each
      once;
    - the full e2e on both projects on the real clock;
    - AC-13 once.

    Another auditor runs at the same time. A failure whose trace shows a network or buffer
    error, or a test timeout, may be rerun once; record both runs.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-AUDIT-B`. Ports 49890-49919.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every server or CLI run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash only, never cmd.exe or an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `node -e`, NO
  `node -` OR `python -`, NO `| node`, NO `| python`. NEVER PIPE INTO `head` OR `tail`.
  NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul`,
  ALSO NOT IN `2>`. NEVER `rm -r`.**
  - Write probes as files in the task folder and run them.
  - Read outputs with the Read tool.
- Never kill processes by PID, and never use `Stop-Process`. Leave nothing running. Before
  returning, make sure none of your background commands is still running.
- No FIFO waiter scripts such as `waitfor.sh`. To wait for a long command, use the Bash
  tool's own background run and its exit notice.
- **Never change any git configuration,** including `safe.directory`. For a scratch clone,
  use a per-process override:
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH for every node or npm call.
- Run the digest before any long probe.
- Create files only in the task folder, the evidence folder and the review pair.
- Use synthetic data and local mail capture only. `PRODUCTION_SENDING_ENABLED` is never
  set.
  - Screenshots end in `-synthetic.png`, at most 12.
  - No email address except the full synthetic `@example.invalid` form.
  - Write `<user>` for profile paths.
- If a permission check denies a call, stop and report.

## Output

- The review pair.
- Results in this file.
- Evidence in `handoff/delivery/evidence/WP5-UX5-AUDIT-B/`: masked LF `.txt` and
  `-synthetic.png`.
- The decision: PASS, FIX REQUIRED or NOT VERIFIED.
  - Number each finding (F-UX5B-n), with its severity, file:line, reproduction and expected
    result.
  - List optional risks separately.
- Return at most 250 words, beginning with your self-reported model.

## Results

Self-reported model: claude-opus-5-5 (equal to the strongest author model of the snapshot: UX4-PLAN, UX4-T04, UX5-PLAN,
UX5-T01B). Fresh context; I authored no WP5-UX4 or WP5-UX5 task. 2026-10-27, 03:25Z to about 04:25Z. Review pair:
`handoff/delivery/WP5_UX5_REVIEW_B.md` and `.vi.md`; evidence: `handoff/delivery/evidence/WP5-UX5-AUDIT-B/` (76 masked LF
`.txt`, no PNG); raw logs in `D:\.claude-tmp\timesheet\WP5-UX5-AUDIT-B`.

- **Target.** `reviewed_commit` f4049aa7905e22f1467dfcae4208675cb2fc8e80 = HEAD = origin/main before and after; working tree
  clean outside `handoff/` before and after. Digest 26b163a62b7d85dbf6b6146c73f98593ad6bcae7eeb8fb1dc7fd9d4dc8305336 (882
  files) before and after in three equal forms (`npm run digest`, `git ls-tree`, clean `git archive` export hashed as raw
  blobs). Work in a clean export; base 8e55710 exported beside it.
- **Decision: FIX REQUIRED.** Five Low findings, no product defect:
  - F-UX5B-1: `docs/05_SUBMISSION_AND_NOTIFICATIONS.md:11` (+ `.vi.md:11`) still says the Review page sends right after
    sign-off "until the Send card (WP5-UX5-T03)"; the release never sends at sign-off.
  - F-UX5B-2: `docs/12_RELEASE_NOTES.md:54` (+ VI) and `docs/04_UX_AND_SETTINGS.md:124` (+ VI :125) quote "Signed with your
    name only." / "You sign as", which the UI no longer shows.
  - F-UX5B-3: `src/server/pdf/timesheetPdf.ts:336-342`: a day with leave and a holiday label of about 35 characters or more
    loses "Leave h:mm" to the ellipsis ("(company closure) Leave…"); `docs/12_RELEASE_NOTES.md:86` (+ VI) says leave is
    always printed.
  - F-UX5B-4: `docs/10_DECISIONS_AND_SOURCES.md` (+ VI) has no record of the owner's H-1 a (2026-10-22); the any-revision
    rule is attributed to F-2 a only (also `docs/05:19`).
  - F-UX5B-5 (tests): mutant M12b (the sign-off's own PDF follows `show_time_on_pdf`) passes all 2,374 tests;
    `sends.test.ts:300` ("reason never in the email") cannot fail because quoted-printable breaks the searched phrase.
- **Risks** R-UX5B-1..7 in the review: cross-revision in-flight sends (pre-existing; a superseded copy can arrive after the
  correction); 6 dev-only `npm audit` advisories (acceptable; `--omit=dev` exit 0); drill fetch sites without
  `connection: close`; the worker cap (adequate) and the lazy PDF import (stay optional); M3 not observable; format
  characters in reason/body; a GET that renders.
- **Checks run.** typecheck 0, lint 0, build 0; `npm test` x2: 101 files / 2,374 each; 30 area-B integration files: 725
  passed; full e2e both projects real clock: 863 passed / 125 skipped / 0 failed (desktop 459/35, mobile 404/90), no rerun;
  AC-13 under Asia/Tokyo (TZPROBE -540) 1/1; `npm audit --omit=dev` 0. Probes: real schema-13 DB built by the base and
  upgraded by the target CLI (91 PASS), old build refuses schema 15, backup/restore with variants and sends (10 PASS), HTTP
  area B with two server processes (89 PASS), PDF content (193 PASS, 8 FAIL = F-UX5B-3), H-1 a (4 PASS; fails under M6),
  font identical to upstream, nodemailer/zod pins byte-identical behaviour, F-UX4B-1 fixed. Own mutants: 14 of 17 killed
  (M3 near-equivalent, M16 equivalent, M12 real gap); all restored, work tree equal to the target list.
- **Slips.** One status listing first written to the shared parent folder (moved into my task folder), and my mutant
  runner's first version used `shell: true` (a DEP0190 warning from my script, not the product; replaced). No heredoc,
  no stdin to node or python, no pipe into head/tail/cat, no null-device redirect, no `rm -r`, no PID kill, no git
  configuration change. Nothing of mine is left running (no listener in 49890-49919; all background runs ended).
- **Next action.** One bounded fix task (`addresses_audit` WP5-UX5-AUDIT-B): docs EN/VI for F-UX5B-1..4 (owner picks code or
  doc for F-UX5B-3) and the two tests of F-UX5B-5; its freeze, a regate of the changed tests plus the docs delta, and a fresh
  area-B recheck.

Status: done (decision FIX REQUIRED)
