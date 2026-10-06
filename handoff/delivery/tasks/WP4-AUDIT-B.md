# WP4-AUDIT-B dispatch brief

- Mission/task: timesheet-software-readiness / WP4-AUDIT-B; package WP4; kind audit;
  attempt 1; depends on WP4-GATE (PASS).
- Scope: the package-final independent audit of area B, **data**. This covers:
  - the "through a share" marker;
  - untrusted workbook parsing;
  - import idempotency and conflicts;
  - the opening-balance ledger;
  - that imported history is never automated;
  - the client screens.

  The work comes from WP4-T02, T08, T09, T10 and T11, and the WP4-DEC rules.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size L,
  risk H, novelty no. Use fresh context. Write the task record in English.
  `WP4_REVIEW_B.md` and its `.vi.md` are bilingual and follow
  `handoff/templates/REVIEW.md`.
- Author separation:
  - You authored nothing in WP4. The author agent IDs are on the board.
  - The strongest WP4 author model is opus, so this audit runs at opus.
  - Treat every report, HANDOFF line and gate result as a claim.
- Target: `reviewed_commit` is the WP4-GATE `freeze_commit`. The coordinator gives that
  SHA and the gate digest in the dispatch prompt. Record HEAD and the source digest
  before and after; the digest must equal the gate digest.
- WP4-AUDIT-A may run at the same time in its own scratch folder. Do not share files
  with it.

## Runtime

- Use your own scratch clone or export under `D:\.claude-tmp\timesheet\WP4-AUDIT-B`,
  outside Dropbox. Use it for TEMP/TMP, and for every generated workbook. Never write a
  workbook into the repository.
- Use Git Bash only. Never use `cmd.exe` in any form, PowerShell without `-Command`, or
  any interactive shell. Keep shell calls in the foreground.
- Make the first shell call a trivial `node --version`, with Node 24 by full path. Stop
  on ENOSPC.
- Run no docker command unless a finding needs one. If you do, use the Compose project
  name `ts-wp4-aud-b` and remove it by name.
- Whenever you run the CLI or the server, set both `DATA_DIR` and `DATABASE_PATH`
  explicitly under your task folder. Never rely on their defaults: the WP4-GATE
  verifier once migrated the owner's local development database that way.
- Do not edit source. Use capture mode only.
- Never kill processes by PID. Never write into the repository root. Never redirect to
  /dev/null or nul.
- If a permission check denies a call, stop and report. Do not retry or rephrase it.
- Write records with the Edit or Write tools.

## Read first

- AGENTS.md from disk.
- [WP4_REVIEW](../../prompts/WP4_REVIEW.md) and `handoff/prompts/WP4_IMPLEMENT.md`.
- docs/01:41, docs/02 R-06, docs/03, docs/05:26, docs/06 (AC-12, AC-16, and the AC-01
  and AC-03 regressions), docs/07:40–46 and docs/10.
- `reference/inputs/README.md`.
- `handoff/delivery/WP4_HANDOFF.md`, the WP4-GATE results and [WP4-PLAN](WP4-PLAN.md).
- The board `owner_decisions`, `coordinator_decisions` and `pending_owner_question`
  (I-1..I-4).

## Scope

1. **Share marker (T02).** Writes made through a share carry `via_share_id`. A `HEAD`
   request writes no download audit. Legacy rows keep the inference.
2. **Untrusted workbook parsing (T08).** Craft hostile synthetic packages in your scratch
   folder and check how each is handled:
   - a zip bomb (size cap on real inflated output);
   - an entry count overflow;
   - a CRC or declared-size mismatch;
   - DOCTYPE/ENTITY (XXE and billion laughs);
   - `vbaProject.bin` or a macro content type;
   - external links;
   - formulas, which must never be evaluated; cached values must be labelled.

   Also confirm:
   - path traversal in entry names is harmless;
   - sheet and cell limits hold;
   - the template is never re-saved, and its hash stays unchanged.
3. **Import service and API (T09).**
   - Owner only: other users, administrators and share grantees get 404.
   - The idempotency key holds under concurrency.
   - Every conflict needs a decision, and a finalized period is never overwritten.
   - The conflict semantics are the conservative rules stored in the report.
   - A commit writes no ledger event, session, revision, sign-off, job or attempt.
   - Imported periods return 409 `imported_period` on every write path, including
     shared edits and OT leave use.
   - Imported history is never automated across deadlines.
   - The private source is never served.
   - Check the route-scoped upload limit and the content-type gate.
4. **Opening balance (T10).**
   - The 12-step rebuild of `ot_ledger` kept every row, rowid, FK, index and trigger.
     Probe the immutability.
   - One opening balance per user.
   - A same-content repeat is a no-op, a different value answers 409, and a correction
     needs a reason, evidence and the expected version.
   - The balance equals the sum of the deltas (R-06).
   - Owner only.
   - R4: posting makes open reviews stale.
   - The export labels the new entry type.
   - Judge the refusal of a correction to 0 against the rules (owner question I-4).
5. **Client screens (T11).**
   - Decisions offer only the allowed actions, with skip as the default.
   - Imported periods are read-only in every view.
   - The confirmation steps exist.
   - No other user's data, and nothing in the admin views.
   - The UI standards: E-8 tokens only, plus the 767px breakpoint literal.
   - Judge the client components that were touched outside the owned lists.
6. **Formula and blank-history safety (WP4_REVIEW focus).** None of these may become an
   authoritative balance, sign-off or sent state:
   - formula values;
   - `TODAY()`;
   - blank history.
7. **Gate re-execution.** Independently rerun at least:
   - `npm ci` and `npm run verify` on your export;
   - the workbook-import, opening-balance, ledger and sharing-matrix suites;
   - one hostile-package probe through the HTTP route.
8. **Carry items and open owner questions in your area.** For each, judge whether it is
   blocking or acceptable backlog. Say whether the current safe defaults of I-1..I-4
   satisfy the canonical rules.

## Output

- `handoff/delivery/WP4_REVIEW_B.md` and `.vi.md`.
- Results appended to this file.
- Evidence and probe sources in `handoff/delivery/evidence/WP4-AUDIT-B/`:
  - masked, LF, with no trailing whitespace;
  - probes stored as `*.mjs.txt` or `*.py.txt`;
  - no workbook or binary;
  - emails masked as `<email>`.
- Decision: exactly one of PASS, FIX REQUIRED or NOT VERIFIED. List the findings
  separately, each with:
  - severity;
  - file and function;
  - reproduction;
  - expected and actual result;
  - the rule or AC;
  - a bounded fix.
- Leave no process running.

Return at most 200 words, beginning with your self-reported model.

## Results

(Auditor appends here.)

### Auditor result (attempt 1) - decision: FIX REQUIRED

Self-reported model: claude-opus-5-5 (fresh context; authored nothing in WP4). Report pair:
`handoff/delivery/WP4_REVIEW_B.md` and `.vi.md`. Evidence: `handoff/delivery/evidence/WP4-AUDIT-B/` (masked, LF; probes as
`probe-*.mjs.txt`; no workbook or binary). Raw output: `D:\.claude-tmp\timesheet\WP4-AUDIT-B`.

**Target and digest.** reviewed_commit `13a258db86b2f0b6388830e584e2cca5303f1f6c`. HEAD unchanged. Source digest
`1ed67f55fb20c5bed64926c54ce635211f09c44ce33d50a2f88c8354577addfe` (774 files) before and after, by
`scripts/source-digest.mjs` and the `git ls-tree` form; equal to the gate digest. Template SHA-256 unchanged (`47ef42d5...`).

**Runtime.** Git Bash; Node 24.21.0 by full path; npm script shell set to Git Bash (no cmd.exe); TEMP/TMP and every
database, data folder and generated workbook under the task folder; `DATA_DIR` and `DATABASE_PATH` explicit for every CLI
and server run (`npm run verify`'s smoke sets its own `DATABASE_PATH` in its temp work dir under TMP); capture mode; no
docker command; the probe servers were stopped through their child handles.

| # | Scope item | Commands / evidence | Result |
|---|---|---|---|
| 1 | Share marker (T02) | P2 (built server), audit-access, pdf-download, sharing-matrix suites; mutations M6, M7 | PASS: shared edit records `via_share_id`, owner edit NULL; HEAD 200 with no audit, GET one marked audit; legacy inference only for NULL rows before migration 7 |
| 2 | Untrusted parsing (T08) | P1 (35 cases), P1b, P2 HTTP, P6, P7; workbook-reader suite; mutations M8, M9 | Every hostile package refused (zip bomb on real output, entries, CRC/size, DOCTYPE/XXE/laughs incl. UTF-16, macros, external links ignored, traversal, sheet/cell/string limits); formulas never evaluated, caches labelled; template unchanged. FINDINGS WP4-B-01 (Medium, unbounded parse cost and report size inside the limits) and WP4-B-02 (Low, 500 from a stack overflow in `readHolidays`) |
| 3 | Import service and API (T09) | P2, P3 (2 connections, 10 rounds x 3 import scenarios), workbook-import suite; mutations M1b, M2, M3, M5 | PASS: 404 for other users, admin and grantees; 401/403/415/413 gates; idempotent preview and commit under races; decisions skip-only except the two importable reasons; rules stored; commit writes only timesheets, day entries and audit; 409 `imported_period` on every write path incl. shared edits and OT leave use; no automation across deadlines; source never served |
| 4 | Opening balance (T10) | P4 (own populated v12, mutation control), P2, P3 (2 x 10 rounds), opening-balance, ledger, migrations, evidence-export, ot-api suites; mutation M10 | PASS: rebuild keeps rows, rowids, FKs, indexes, triggers; immutability; FK violation rolls back; one per user; duplicate / 409 / reasoned correction with evidence and version; balance = sum of deltas; owner only; export label. R4 holds as defined (deficit proposals/reservations) |
| 5 | Client screens (T11) | source reading, CSS literal grep (`13-client-review.txt`), importModel suite | PASS: allowed actions only, skip default, confirmation steps, imported periods read-only in own and shared views, nothing in admin views; tokens only plus the acceptable 767px media-query literal |
| 6 | Formula/TODAY/blank safety | P1, P2, code paths | PASS: none can become an authoritative balance, sign-off or sent state |
| 7 | Gate re-execution | `npm ci` (exit 0), `npm run verify` (exit 0: 75 files / 1710 tests, SMOKE PASSED), 11 suites (276 tests, exit 0), HTTP hostile probe | PASS; `validate_package.py --preflight` (workflow Python): PASS |
| 8 | Carry items, I-1..I-4 | review "Disposition of previous findings" | All acceptable backlog; the I-1..I-4 safe defaults satisfy the canonical rules; `migrate()` FK change judged safe |

**Findings (details, reproduction and bounded fixes in the report).**
- WP4-B-01, Medium, `xlsxReader.ts` (`parseXml`/`readWorksheet`/shared strings), `templateMapping.ts`
  (`detectFormulaDefects`), `workbookImport.ts` (`previewImport`): a 65 KB upload inside every limit blocks the server
  for 8.8 s (a concurrent health check waits 8.5 s) and grows RSS by ~730 MiB; a 2.7 MB upload stores 12.2 MiB of findings.
- WP4-B-02, Low, `templateMapping.ts` `readHolidays`: 150 000 Holiday Dates cells (under the 200 000 limit) -> HTTP 500
  `RangeError: Maximum call stack size exceeded` instead of 422.

**Risks (not defects):** R1 OT leave reservation accepted inside an imported period; R2 batch preview says
`can_commit: true` there; R3 an ended-but-not-yet-due period is importable (relevant to I-3); R4 previews kept forever
without quota; R5 R4 staleness only with deficit proposals; R6 BOM-less UTF-16 part harmless; R7 dev-only npm advisory.

**Not rerun:** full e2e and the container drill (gate ran them; outside this brief's minimum). NAS NOT VERIFIED.

**Incidents (see `evidence/WP4-AUDIT-B/14-incidents.txt`).** A command I started with `python - <<'EOF'` opened an
interactive Python REPL with no console, which now loops and writes tracebacks into the harness output file of
background task `b9vel2ldq` (python.exe started 03:58:26 local, about 2.5 MiB/s, 2.5 GB at 04:13, outside Dropbox). I may
not kill by PID and have no tool to stop a background task, so it is STILL RUNNING: the coordinator or owner must stop
task `b9vel2ldq` and may delete its output file. One stray `>/dev/null` redirect on a no-op curl. HTTP probe runs 1-2
failed on probe defects; run 3 is the evidence.

**Next action:** coordinator dispatches one bounded fix for WP4-B-01 and WP4-B-02 (FIX_FINDINGS), then freeze, regate and
a fresh area-B recheck on the new digest.
