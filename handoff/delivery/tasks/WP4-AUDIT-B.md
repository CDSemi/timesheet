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
