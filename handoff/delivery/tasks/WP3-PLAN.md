# WP3-PLAN dispatch brief

- Mission/task: timesheet-software-readiness / WP3-PLAN; package WP3; kind plan; attempt 1;
  depends on WP2-ACCEPT (WP2 accepted; accept commit
  3ead61edb1316fe926fe969988f595792590cd41 = expected HEAD; accepted source
  5fafeaee72509c6110a907458643bf7582dad81a, digest
  e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df). Record HEAD and the
  digest you observe.
- Profile/routing: timesheet-planner with model override opus, reason `size_risk`
  (package decomposition, docs/08 rubric); effort stays the profile's high. Routing:
  size L, risk H, novelty yes. Record in English; read-only planning, no source edits.
- Read AGENTS.md from disk first, including the UI standards section. Then read:
  - docs/08 (routing rubric, commit points, package-final gate) and docs/09 (WP3 section);
  - handoff/prompts/WP3_IMPLEMENT.md and WP3_REVIEW.md, and the canonical documents they
    name (02–06; 01 and 07 only where a dependency needs them);
  - handoff/delivery/WP2_HANDOFF.md (including the acceptance record and carry-forward),
    WP2_RECHECK_A4.md and WP2_RECHECK_B4.md;
  - the WP2 carried risks in handoff/delivery/STATE.json (read-only).
  Inspect the current source tree, migrations and tests read-only to find existing
  patterns (ledger, corrections, outbox or job tables if any, audit, privacy guards,
  zone handling, client tokens, e2e fixture).

## Required output (append under Results)

A. WP3 scope summary with the requirement, rule and acceptance IDs it must satisfy
   (at least AC-06–AC-10 and AC-14 and the WP3_IMPLEMENT gate items).
B. Ordered task list of bounded slices (prefer S/M; L only when unavoidable). For each
   task give:
   - ID (WP3-T01…) and title;
   - size, risk and novelty;
   - profile and model per the docs/08 rubric, with an override reason if any;
   - exact owned paths;
   - dependencies;
   - covered IDs;
   - required tests and checks, and the freeze-commit point.

   Keep a single writer at a time. Mark which tasks can run their planning or read-only
   analysis in parallel. Name any new runtime dependency (for example pdf-lib), its
   current non-deprecated version and why it is needed.
C. WP2 carry-forward: say which task addresses each item, or record an explicit deferral
   with its rationale:
   - R4: handle and persist the `CorrectionResult`/`DeficitDebitResult` pending variant;
     drop provisional minutes at finalization;
   - R1: revision-specific correction keys (the duplicate check ignores `sourceRef`);
   - R2: a policy note with a leading space before '=' is exported raw;
   - A3-01: the payroll_exception audit record keeps `refreshed_pay_period`;
   - A4-01: the smoke exits without a FAIL line on a port conflict;
   - ADV-A-05 and the B4 optional items (optional);
   - the owner option of prospective calendar reassignment (owner decision; do not plan
     it as work unless a canonical text requires it).
D. Lessons from the WP2 audit rounds, built into each task's acceptance checks so that
   they do not recur:
   - every new UI value is a CSS custom property per the AGENTS UI standards (no raw
     lengths, colours, weights, durations or shadow parts);
   - e2e and unit tests are season-independent (no hard-coded DST offsets; use the
     existing zone oracle or equivalent);
   - admin and job responses carry no employee-derived counts or data beyond the
     canonical privacy boundary;
   - red-first regression tests and mutation checks for integrity rules;
   - synthetic screenshots `*-synthetic.png` at 1280×800 and 390×844 on the installed
     Edge channel; no browser download.
E. Package-final gate: commands, the WP3_IMPLEMENT gate items (deadline/manual race,
   auto-image on/off, interrupted and uncertain send, duplicate jobs, private downloads,
   visual PDF evidence including both Sundays), dry-run/capture mail only, and the
   synthetic data setup. Audit scope: fresh opus auditors with area audits if one context
   is not enough. Accept commit.
F. Contradictions or ambiguities in canonical documents that need an owner decision.
   Flag them and do not resolve them silently. Give the exact file:line and the decision
   needed, with a recommended option.
G. Risks, the expected number of dispatches, and the critical path. Give no token or
   time estimates.

- Writable: this file and handoff/delivery/evidence/WP3-PLAN/ (read-only command outputs,
  masked, LF, single final newline). Everything else read-only. No commits.
- Call Node 24 by its full path if you run anything. Never write into the repository
  root. On Windows, never redirect to /dev/null or nul from a POSIX shell.
- Return at most 400 words, beginning with your self-reported model: task list summary,
  owner decisions needed, critical path.

## Results

(Planner appends here.)

### Planner result (attempt 1, 2026-10-04)

- Self-reported model: claude-opus-5-5 (profile timesheet-planner; effort not observable).
- Observed baseline: HEAD = origin/main = `3ead61edb1316fe926fe969988f595792590cd41`; source digest
  `e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df` (613 files, `handoff/` excluded),
  equal to the accepted WP2 digest. Working-tree changes are coordinator records under `handoff/` only.
- Read-only. Evidence: [00-commands.txt](../evidence/WP3-PLAN/00-commands.txt) (HEAD, Node 24 digest,
  npm registry versions), [01-template-form-cells.txt](../evidence/WP3-PLAN/01-template-form-cells.txt)
  (form labels of the public template). No source, board or state file was written.

#### Observations from the source (facts, not assumptions)

- No WP3 table exists. Migrations 0001–0003 provide `timesheets.finalized_revision_no` (nullable, "set by
  finalization (WP3)"), `timesheets.version` (bumped by every day/session edit), `pay_periods.due_at_utc`,
  immutable `audit_events`, append-only `ot_ledger` with per-user unique `source_key`, and `ot_leave_requests`.
- `src/server/services/ledger.ts` exposes `postCredit`, `postCorrection` and `postDeficitDebit` (a savepoint
  when nested, so they can run inside a finalization transaction). `CorrectionResult` and `DeficitDebitResult`
  have a `pending` variant (`insufficient_balance`) that appends nothing and is persisted nowhere (R4). The
  `postCorrection` duplicate branch ignores `sourceRef` (R1).
- Provisional minutes (`otEvidence.ts:52-69`) skip periods whose timesheet is finalized, so setting
  `finalized_revision_no` in the finalization transaction is what removes them.
- `app.ts` applies a 64 KiB body limit and `requireJsonContentType` to all of `/api/*`; a signature upload
  therefore needs a deliberate route-scoped exception (security-relevant change, planned in T02).
- `index.ts` starts only the HTTP server; there is no job runner, mail code, file store or PDF code.
  `config.ts` has no data/file directory, public URL or outbound setting.
- `reference/examples/policy.example.json:65,81-83` already models the controls: per-user
  `auto_submit_unsigned: true`; system `outbound_mode: dry_run`, `automation_active_from: null`,
  `production_sending_enabled: false`.
- The template form (evidence 01): header "C&D Semiconductor Services, Inc.", title "TIME SHEET FOR SALARIED
  EXEMPT EMPLOYEES", two Monday–Sunday blocks with a WEEK label row and an OT row each, "Overtime Total : X24
  hours" where `X24 = SUM(B16:Y16)+SUM(B23:Y23)` omits Sunday Z16/Z23, and `W26 = TODAY()` as the signature
  date. docs/04:52 and AC-10 replace both defects.
- Registry (evidence 00): `pdf-lib` 1.17.1 and `@pdf-lib/fontkit` 1.1.1 are the latest releases (2022) and not
  deprecated; `nodemailer` 10.0.14 ships its own types; `smtp-server` 3.19.17; `pdfjs-dist` 6.4.299;
  `dejavu-fonts-ttf` 2.37.3 (permissive Bitstream Vera/DejaVu licence). None reports `deprecated`.

#### A. WP3 scope and IDs

Requirements FR-10, FR-11, FR-12; the WP3 parts of FR-08 (deficit choice at sign-off), FR-09 (finalization
posts the ledger) and FR-14 (reasons for corrections). Rules R-05 (deficit modes, pending debit, choose mode
pending on automatic submission), R-06 (finalization posts once, automatic origin unconfirmed, retries post
nothing, corrections by difference, E-3 review flags unconsumed reservations, no job-driven consumption), R-07
(actual `signed_at`, PDF/deadline in the saved reporting zone, reasons for old/finalized revisions). Contracts:
docs/03 (records, atomicity and snapshots, API/hosting boundary), docs/04 (Review, History, Settings, Email and
PDF, visual standard), docs/05 (all sections). Acceptance: AC-06, AC-07, AC-08, AC-09, AC-10 and AC-14 (WP3
part); the WP3 parts of AC-01 (PDFs, signatures, tokens), AC-03 (finalization posting under concurrency) and
AC-04 (original PDF and revisions retained); LG-09 in full (late review zero delta, resend posts nothing).
WP3_IMPLEMENT gate items: deadline/manual race, auto-image on/off, interrupted and uncertain send, duplicate
jobs, private downloads, visual PDF evidence including both Sundays, dry-run/capture only.

#### B. Ordered tasks

Checkpoint 1 = T00–T07 (snapshot/review/PDF/ledger transaction); checkpoint 2 = T08–T11 (jobs, reminders,
adapters, recovery); checkpoint 3 = T12–T15 (UI, integration, visual evidence, handoff). One source writer at a
time; every task ends with a freeze commit by `timesheet-committer` before the next writer starts (docs/08
"Commits and pushes"). Each task records red-first evidence, `npm run verify` with
`NODE_OPTIONS=--trace-deprecation --pending-deprecation` (Node 24 by full path) and `npm run digest`, and
appends its result to its own task file.

Common checks (lessons D, part of every task's acceptance):
1. Red-first: each integrity or privacy rule gets a failing test before the fix, plus at least one mutation
   check (revert the guard, see the test fail, restore) recorded in evidence.
2. Season independence: no hard-coded UTC offsets or DST assumptions; derive instants with the production zone
   functions or `tests/client/zoneOracle.ts`; use the injectable `Clock`.
3. Privacy boundary: admin, job, status and error responses carry no employee-derived counts, identities,
   periods, recipients or content (WP2-A-01 and A2-02 precedent); employee routes are owner-scoped with 404 on
   ID swap; no personal data or secrets in logs, provider responses (redacted) or URLs.
4. UI tasks (T12, T13): follow the AGENTS UI section with the three named skills; every new length, colour,
   weight, duration, letter-spacing or shadow part is a custom property in `src/client/styles.css` (only
   `@media` conditions stay literal); the 4px radius token; `--transition` on hover/active/focus; a literal
   scan like WP2-FIXB3's (0 declarations with literals).
5. Screenshots: synthetic data only, files `*-synthetic.png`, desktop 1280×800 and mobile 390×844 on the
   installed Edge channel (`E2E_CHANNEL` default); no browser download.
6. No deprecated API; `npm run lint` clean; no new INSERT into `ot_ledger` outside `ledger.ts`/`otLeave.ts`
   (grep check); no job or route consumes or expires `ot_leave_requests` reservations.
7. No network call inside `writeTransaction`; outbound stays capture/dry-run; real SMTP sending refuses to
   start unless an explicit owner-only flag is set, and no task sets it.

| ID | Title | Size/Risk/Novel | Profile / model (override) | Depends |
|---|---|---|---|---|
| T00 | Carry-forward hygiene (R2, A4-01) | S/M/no | worker / sonnet | — |
| T01 | Migration 0004 and configuration | M/H/yes | worker-high / opus (novelty: foundation schema) | T00 |
| T02 | Private file store and signature images | M/H/yes | worker-high / sonnet | T01 |
| T03 | Submission settings, recipients, templates | M/H/no | worker-high / sonnet | T01 (after T02, single writer) |
| T04 | Canonical snapshot, review payload and hash | M/H/yes | worker-high / sonnet | T02, T03 |
| T05 | Manual sign-off finalization transaction | L/H/yes | worker-high / opus (size_risk) | T04 |
| T06 | Corrections, late review, same-revision resend | M/H/no | worker-high / sonnet | T05 |
| T07 | PDF renderer (pdf-lib) | M/H/yes | worker-high / sonnet | T04 (code); probe in parallel |
| T08 | Durable job store, runner and PDF job | M/H/yes | worker-high / opus (novelty: outbox) | T05, T07 |
| T09 | Mail adapters, send job, uncertain outcome | L/H/yes | worker-high / opus (size_risk) | T06, T08 |
| T10 | Deadline automation and activation boundary | M/H/no | worker-high / sonnet | T09 |
| T11 | Reminders and outcome notices | M/H/no | worker-high / sonnet | T10 |
| T12 | Review and sign-off UI, deep links, status | M/H/no | worker-high / sonnet | T06, T09 |
| T13 | History/delivery UI, submission settings UI, admin operations status | M/H/no | worker-high / sonnet | T11, T12 |
| T14 | Seed, smoke, e2e flows and PDF visual harness | M/M/yes | worker / sonnet | T13 |
| T15 | WP3 HANDOFF and developer docs (EN+VI) | S/L/no | worker / sonnet | T14 |

Escalation follows the docs/08 caps: one retry at the starting tier, one at expert/opus, then an owner blocker.

**T00 — Carry-forward hygiene.** Owned: `src/server/services/otEvidence.ts`,
`tests/integration/evidence-export.test.ts`, `scripts/smoke-built-server.mjs`. R2: neutralize a cell whose first
non-whitespace character is `=`, `+`, `-` or `@` (and a leading tab/CR), red-first. A4-01: the smoke picks a free
loopback port when `SMOKE_PORT` is unset (or fails fast) and prints a `FAIL` line before any non-zero exit;
verified by occupying port 3100 in a probe. Covered: R2, A4-01. Freeze after verify.

**T01 — Migration 0004 and configuration.** Owned: `src/server/db/migrations/0004_submission.ts`,
`src/server/db/migrations.ts`, `src/server/config.ts`, `src/server/types.ts`,
`tests/integration/migrations.test.ts`, `tests/integration/config.test.ts` (new). Tables (append-only with
no-update/no-delete triggers where immutable; owner FKs `(id, user_id)` as in WP2): `attachments` (opaque key,
kind signature|pdf, sha256, mime, size, width/height; immutable); `submission_settings` (per-user versions:
to/cc JSON, subject/body template, template version, auto-submit flag and its effective instant, auto-image
authorization fields, show-OT flag, reminder offsets); `timesheet_revisions` (timesheet, revision_no unique per
timesheet, origin employee|deadline, review pending|signed, supersedes link, correction reason, canonical payload,
payload SHA-256, reviewed SHA-256, actor/time; immutable); `signoffs` (one per revision: signer name, real
`signed_at`, reviewed hash, signature attachment; immutable; absent for automatic revisions);
`revision_ledger_lines` (per revision and work date: credit/debit/correction proposal, minutes, outcome
posted|unchanged|pending_insufficient_balance|pending_choice|waived, ledger entry link) for R4; `revision_files`
(revision, PDF attachment, state pending|ready|failed); `jobs` (owner, revision, kind, unique business key,
state, attempts, next_run_at, lease owner/expiry, redacted last error); `delivery_attempts` (job, attempt number,
frozen envelope, Message-ID, provider id, state preparing|sending|accepted|failed_temporary|failed_permanent|uncertain,
redacted response, decision actor/time); `reminder_occurrences` (unique user/period/kind/occurrence key);
`operations_state` (single row: `automation_active_from`, runner heartbeat); `timesheets.imported_unverified`
(0/1, default 0, for the WP4 exclusion). Config: a private data directory outside Dropbox (default beside the DB
under `LOCALAPPDATA`), the public base URL for deep links, `OUTBOUND_MODE` capture|smtp (default capture), SMTP
settings from env only and never logged. Tests: fresh migrate; upgrade a database created at `5fafeae` (v3 with
ledger rows) through 0004 with unchanged row counts, `integrity_check` ok, `foreign_key_check` empty; trigger
refusals; the 0001 checksum stays pinned. Covered: docs/03 Records, AC-04 (retention), AC-08 (persistence).
Freeze after verify.

**T02 — Private file store and signature images.** Owned: `src/server/files/fileStore.ts`,
`src/server/files/imageCheck.ts`, `src/server/services/signatures.ts`, `src/server/routes/signatures.ts`,
`src/server/app.ts`, `src/server/http/security.ts`, `tests/integration/file-store.test.ts`,
`tests/integration/signatures.test.ts`. Temp file plus atomic rename, recorded SHA-256, opaque keys, an orphan
temp sweep that never removes referenced files; `POST /api/signatures` with a route-scoped limit (default
256 KiB) accepting an `image/png` or `image/jpeg` raw body (magic bytes and declared type must agree; bounded
pixel dimensions; origin/CSRF unchanged); owner-only `GET` with `no-store` and attachment disposition, never a
static path. Tests: ID swap 404, anonymous 401, oversize 413, wrong type 415, truncated/polyglot image 422, file
never under the static root, a profile replacement leaves earlier attachment bytes and hash unchanged.
Synthetic images are generated at test time (no committed signature image). Covered: AC-01 (signatures), docs/03
attachments and atomic rename, docs/04:54. Freeze after verify.

**T03 — Submission settings, recipients, templates.** Owned: `src/domain/emailTemplate.ts`,
`src/server/services/submissionSettings.ts`, `src/server/routes/settings.ts`, `src/server/http/schemas.ts`,
`src/server/app.ts`, `tests/domain/email-template.test.ts`, `tests/integration/submission-settings.test.ts`.
Variables exactly `{EmployeeName}`, `{PeriodStart}`, `{PeriodEnd}`, `{PayrollDate}`, `{SignOffStatus}`,
`{SubmissionId}`, `{Revision}`; unknown variable 422; HTML-escaped values; validated recipients (to required,
cc optional, de-duplicated, header-injection safe); the preview route writes nothing; versions append-only with
audit; an auto-submit change records its effective instant (docs/05:26, changes default to future periods); the
auto-image authorization is an explicit audited act referencing one immutable signature attachment, default off.
Covered: FR-12, docs/04 Email, docs/05:24-26, AC-07 (settings part). Freeze after verify.

**T04 — Canonical snapshot, review payload and hash.** Owned: `src/domain/canonical.ts`,
`src/domain/snapshot.ts`, `src/server/services/reviewPayload.ts`, `src/server/routes/submission.ts` (new, GET
only), `src/server/app.ts`, `tests/domain/canonical.test.ts`, `tests/integration/review-payload.test.ts`.
Stable-key canonical JSON (integer minutes, ISO dates, UTC strings) and SHA-256. Payload: 14 days (category,
leave minutes and kind, sessions/breaks, raw/eligible/credited, completeness), policy and calendar version IDs,
reporting zone, employee name, OT proposals per day, deficit proposals with the policy mode, unresolved inputs,
unconsumed OT-leave reservations (E-3 flag), recipients and rendered subject/body, signature reference (hash),
template version, show-OT flag; no credentials. `GET /api/timesheets/:payrollDate/review` returns payload, hash
and `expected_version` and writes nothing. Calculations come only from the existing engine. Tests: key order and
Unicode stability; the hash changes on any day edit and on a recipient, template or signature change; the GET
writes zero rows (`total_changes` and audit count unchanged); another user gets 404. Covered: AC-06 (binding
input), docs/03 Atomicity and snapshots, docs/05:9. Freeze after verify.

**T05 — Manual sign-off finalization transaction.** Owned: `src/server/services/finalization.ts`,
`src/server/services/revisionLedger.ts`, `src/server/routes/submission.ts`, `src/server/http/schemas.ts`,
`tests/integration/finalization.test.ts`, `tests/integration/finalization-concurrency.test.ts`,
`tests/support/concurrency.ts`. `POST /api/timesheets/:payrollDate/signoff` with `expected_version`,
`reviewed_hash`, `signer_name`, per-day deficit choices and the incomplete-evidence acknowledgement. One
IMMEDIATE transaction: recompute the payload, compare hash and version (409 with a fresh-review hint), require the
name and a current signature attachment (422 otherwise), create the revision and the real sign-off (`signed_at`
from the clock), post credits and authorized debits through `ledger.ts` with revision-independent original keys
per day, persist every proposal outcome in `revision_ledger_lines` including the `pending` variants (R4), set
`finalized_revision_no`, enqueue the PDF and send jobs with unique business keys, audit. Provisional minutes
disappear for that period (test: posted plus provisional never double count). Tests: missing name/image, stale
version, stale hash after a concurrent edit, choose mode with debit chosen and waived, insufficient balance kept
pending and persisted, an identical retry is idempotent, a multi-connection race of two sign-offs
(worker_threads, 20 rounds: one winner, one 409, one revision, one set of ledger rows, one job set). Covered:
AC-06, AC-03 (WP3), R-05, R-06, FR-10, R4. Freeze after verify.

**T06 — Corrections, late review, same-revision resend.** Owned: `src/server/services/finalization.ts`,
`src/server/services/revisionLedger.ts`, `src/server/services/ledger.ts` (R1 only),
`src/server/routes/submission.ts`, `tests/integration/corrections.test.ts`, `tests/integration/ledger.test.ts`.
A correction revision requires a reason and posts only differences through `postCorrection` with
revision-specific keys (`rev:{revisionId}:day:{date}:correction`), handling `unchanged` and `pending`; R1 adds
`sourceRef` to the duplicate comparison (red-first). Late review of an automatic revision creates a signed
revision with zero delta (LG-09) and an explicit `send_email` choice (no job when false).
`POST /api/revisions/:id/resend` creates a new attempt on the same revision with no ledger movement, refused while
an attempt is `sending` or `uncertain` without an explicit decision; a changed envelope requires a new revision.
Original revisions, PDFs and sign-offs stay untouched. Covered: LG-09, R-06 corrections, docs/05 Corrections and
resends, AC-04 (WP3), R1, R4 (correction pending). Freeze after verify.

**T07 — PDF renderer.** Owned: `package.json`, `package-lock.json`, `src/server/pdf/timesheetPdf.ts`,
`src/server/pdf/layout.ts`, `src/server/pdf/fonts.ts`, `tests/integration/pdf-render.test.ts`,
`tests/support/pdfText.ts`. New runtime dependencies: `pdf-lib` 1.17.1 (docs/03:14, D-01 baseline),
`@pdf-lib/fontkit` 1.1.1 (needed to embed custom Unicode fonts), `dejavu-fonts-ttf` 2.37.3 (Unicode TTF covering
Vietnamese, loaded from `node_modules`, no committed font binary). New dev dependency: `pdfjs-dist` 6.4.299 (text
extraction in tests, page rendering in the visual harness). Pure render from the snapshot: US Letter portrait,
header, title, employee, payroll date, two Monday–Sunday blocks with 14 dates and categories, optional time and OT
rows in h:mm (never decimal hours), OT total including both Sundays, long labels wrapped or shrunk within bounds,
bounded signature image (aspect kept), name and real sign date, blank manager signature/date, an "Employee review
pending" banner on automatic revisions, submission and revision IDs, deterministic metadata (no current-time
creation date), sanitized filename. Tests: 14 dates; total equals the credited minutes of all 14 days with OT on
both Sundays; Vietnamese text extracted intact; no date when unsigned; image box within bounds for tall and wide
images; identical bytes for the same snapshot. The read-only font and render probe may run in parallel with
T05/T06 in a scratch folder. Covered: AC-10, FR-11, docs/04:52-56. Freeze after verify.

**T08 — Durable job store, runner and PDF job.** Owned: `src/server/jobs/jobStore.ts`,
`src/server/jobs/runner.ts`, `src/server/jobs/pdfJob.ts`, `src/server/index.ts`, `src/server/cli.ts`,
`tests/integration/jobs.test.ts`, `tests/integration/jobs-restart.test.ts`. Atomic claim (`UPDATE ... RETURNING`
with a lease), lease renewal, retry delays 1/5/15/60 minutes then intervention, heartbeat in `operations_state`,
an in-process loop started by `index.ts` (off in tests unless requested), and a CLI `run-jobs --once --now <ISO>`
refused in production, for deterministic e2e. The PDF job renders from the stored snapshot only, writes temp plus
rename, records the hash and `revision_files` state, retries the same snapshot and posts nothing. Tests: a
duplicate business key enqueues once; two runners claim a job once; a crash before and after the PDF write (child
process killed) resumes without duplicate files or ledger rows; an expired lease is reclaimed. Covered: AC-08,
docs/03:37-39, docs/05 Durable delivery. Freeze after verify.

**T09 — Mail adapters, send job, uncertain outcome.** Owned: `package.json`, `package-lock.json`,
`src/server/mail/outbound.ts`, `src/server/mail/message.ts`, `src/server/mail/captureAdapter.ts`,
`src/server/mail/smtpAdapter.ts`, `src/server/jobs/sendJob.ts`, `src/server/services/deliveries.ts`,
`src/server/routes/submission.ts`, `tests/integration/delivery.test.ts`, `tests/integration/delivery-crash.test.ts`,
`tests/support/smtpSink.ts`. Dependencies: `nodemailer` 10.0.14 (runtime: SMTP transport and MIME, own types);
dev `smtp-server` 3.19.17 with `@types/smtp-server` 3.5.13 (loopback SMTP sink for failure injection). The message
is built only from frozen snapshot content and the stored PDF bytes (hash re-checked) with a stable Message-ID;
attempt state `sending` is committed before the network call; outcomes are classified as pre-transfer failure,
temporary/permanent rejection, acknowledged acceptance (provider id and time) or uncertain (connection lost after
DATA, lease expired while `sending`); uncertain is never retried automatically and needs an explicit decision
(`POST /api/deliveries/:id/decision`); a missing sender or recipient blocks with a visible fault, never "sent";
responses are redacted (no credentials, no body). The capture adapter writes the exact .eml and PDF under the
private data directory. Tests: each failure point of the docs/05 table; process killed during send; restart
leaves `uncertain` and sends nothing; an explicit resend creates a new attempt; captured recipients, body and PDF
bytes equal the snapshot; secrets absent from DB rows, logs and responses. Covered: AC-08, AC-14, docs/05:36-48.
Freeze after verify.

**T10 — Deadline automation and activation boundary.** Owned: `src/server/services/automation.ts`,
`src/server/jobs/deadlineJob.ts`, `src/server/services/finalization.ts` (automatic entry point only),
`src/server/routes/admin.ts` (record activation, audited), `tests/integration/deadline.test.ts`,
`tests/integration/deadline-race.test.ts`. Eligible = unsigned, unfinalized, not imported, `due_at` on or after
the activation instant and the user's auto-submit effective instant (F-4). Switch on: automatic finalization with
origin deadline, no sign-off, choose-mode debits pending, auto image only when authorized, `signed_at` null, PDF
and send enqueued. Switch off: overdue state and notice, no export. Already finalized: continue the existing job
only. Chronological bounded-batch recovery after downtime. Manual/deadline race in one transaction (20 rounds:
one revision, one ledger set, one send). Covered: AC-07, docs/05 Deadline and recovery, R-05 choose mode, R-06
automatic origin. Freeze after verify.

**T11 — Reminders and outcome notices.** Owned: `src/domain/reminders.ts`, `src/server/services/notifications.ts`,
`src/server/jobs/reminderJob.ts`, `tests/domain/reminders.test.ts`, `tests/integration/reminders.test.ts`. 24 h and
2 h reminders, an overdue warning when auto-submit is off, an outcome notice after automatic submission; dedupe by
user/period/occurrence; stop after finalization; collapse missed pre-deadline notices into one current notice;
login-required deep link only; email through the same adapters. Tests use simulated deadlines across a DST-change
week computed with the zone functions. Covered: docs/05 Reminders, AC-09 (links carry no token or private data).
Freeze after verify.

**T12 — Review and sign-off UI, deep links, status.** Owned: `src/client/ReviewScreen.tsx`,
`src/client/components/Review*.tsx`, `src/client/components/reviewModel.ts`, `src/client/App.tsx`,
`src/client/api.ts`, `src/client/styles.css`, `src/client/components/AppShell.tsx`,
`src/client/components/PeriodHeader.tsx`, `src/client/components/TimesheetGrid.tsx`,
`tests/client/reviewModel.test.ts`. Exact content, OT proposals, missing evidence, deficit choices, unconsumed
reservations, recipients and email preview, signature preview, Sign off & Submit with the name; a 409 leads to a
fresh review; the deep link `#/review/{payrollDate}` survives login; review/delivery status in the grid. Covered:
docs/04 Review, AC-06, AC-09 (deep links). Freeze after verify.

**T13 — History/delivery UI, submission settings UI, admin operations status.** Owned:
`src/client/HistoryScreen.tsx`, `src/client/SettingsScreen.tsx`, `src/client/AdminScreen.tsx`,
`src/client/components/Delivery*.tsx`, `src/client/components/Submission*.tsx`,
`src/client/components/SignatureUpload.tsx`, `src/client/components/OperationsStatus.tsx`, `src/client/api.ts`,
`src/client/styles.css`, `src/server/services/operationsStatus.ts`, `src/server/routes/admin.ts`,
`tests/integration/operations-status.test.ts`, `tests/client/deliveryModel.test.ts`. Revisions with origin, PDF
download, attempts, reasoned correction, explicit resend and the uncertain decision; settings with template
preview, signature upload, auto-submit switch and auto-image authorization; admin status per F-3 (sender
configured, outbound mode, runner heartbeat, activation; no audit payloads, so A3-01 cannot leak: a test asserts
`refreshed_pay_period` never appears in admin responses). Covered: docs/04 History and Settings, AC-14 (faults
visible), A3-01. Freeze after verify.

**T14 — Seed, smoke, e2e and PDF visual harness.** Owned: `src/server/seed.ts`, `src/server/cli.ts`,
`scripts/smoke-built-server.mjs`, `playwright.config.ts`, `tests/e2e/fixtures.ts`, `tests/e2e/review.spec.ts`,
`tests/e2e/submission.spec.ts`, `tests/e2e/pdf-visual.spec.ts`, `tests/e2e/assets/pdf-view.html`. The seed adds
synthetic submission settings (`example.invalid`) and a generated synthetic signature; the smoke adds review GET
safety, the sign-off conflict, the private PDF 404 for another user and the capture check. E2E: sign-off happy
path and stale conflict, automatic submission on/off through `run-jobs --once --now`, auto-image on/off, history
resend, uncertain decision; PDF pages rendered with `pdfjs-dist` in Edge to `pdf-*-synthetic.png` (both Sundays
visible in the total) plus UI screenshots at both viewports. Optional F1 screenshot. Covered: AC-07, AC-10
(visual), AC-14 (capture). Freeze after verify and `npm run test:e2e`.

**T15 — WP3 HANDOFF and developer docs.** Owned: `handoff/delivery/WP3_HANDOFF.md`,
`handoff/delivery/WP3_HANDOFF.vi.md`, `DEVELOPMENT.md`, `DEVELOPMENT.vi.md`, `README.md`, `README.vi.md`,
`package.json` (description only). HANDOFF template with commands, evidence index, limitations, deferrals and one
next action. Package-final freeze.

Parallel read-only work (max two agents, one writer): the T07 font/render probe beside T05/T06; the T12 UI
pre-flight inventory of `styles.css` and components beside T10/T11; the two package audits beside each other.

#### C. WP2 carry-forward

| Item | Disposition |
|---|---|
| R4 pending variant and provisional drop | T05 (pending debit persisted in `revision_ledger_lines`; `finalized_revision_no` set in the same transaction; no-double-count test); T06 (correction `pending`) |
| R1 revision-specific correction keys | T06 (keys include the revision ID; `sourceRef` added to the duplicate check, red-first) |
| R2 leading space before `=` | T00 |
| A3-01 payroll audit payload | T13 (admin status exposes no audit events; regression assertion); no admin audit view is planned |
| A4-01 smoke port | T00 |
| ADV-A-05 duplicate append path | Deferred: changing accepted ledger integrity code has no WP3 need; T05/T06 add no new append path (common check 6) |
| B4 optional items | Deferred (cosmetic); T12/T13 add no new instances; item 4 (oracle ±1 day) has no 2026–2027 case |
| F1 screenshot | Optional in T14 |
| R3 | Accepted decision; no work |
| Prospective calendar reassignment | Not planned; no canonical text requires it (owner option only) |
| Optional scope | Magic links not implemented (deep links suffice, docs/05:32); ntfy deferred (optional, docs/01:38); SMS deferred; E-7 permission evidence stays a text reference |

#### E. Package-final gate (WP3-GATE, verifier sonnet, on the T15 freeze)

1. Clean `git archive` export outside Dropbox; Node 24 by full path; `npm ci`.
2. `npm run verify` with `NODE_OPTIONS=--trace-deprecation --pending-deprecation`: exit 0, no deprecation line.
3. `npm run test:e2e` (desktop and mobile, installed Edge): all pass; screenshots and PDF page renders collected.
4. Race files 20 times each: `ot-leave-concurrency`, `finalization-concurrency`, `deadline-race` (each round: one
   winner, one revision, one ledger set, one send).
5. Fault injection: restart before the PDF, after the PDF and before send, kill during send → `uncertain`; restart
   sends nothing; an explicit decision resends once; duplicate job keys enqueue once; two runners claim once.
6. Auto-submit on/off and auto-image on/off matrix: pending disclosure in PDF and email, `signed_at` null on
   automatic revisions, image only when authorized.
7. Private downloads: PDF and signature ID swap 404, anonymous 401, no static path, `no-store`.
8. GET safety: every GET route runs with zero DB changes; deep links require login.
9. Capture inspection: recipients, subject, body and PDF SHA-256 equal the snapshot; no secrets in DB, logs or
   capture metadata; outbound mode capture throughout.
10. Visual PDF evidence: rendered pages show 14 dates, OT on both Sundays included in the total, Vietnamese and
    long labels, a bounded synthetic signature, the real sign date (manual) and the pending banner (automatic).
11. Migration upgrade from a `5fafeae` database and a fresh database; `integrity_check`, `foreign_key_check`.
12. LG-01…LG-10 and DF-01…DF-16 present and passing; `npm run digest`; `validate_orchestration.py`,
    `check_recovery.py` and `validate_package.py --preflight` with the workflow Python.

Synthetic setup: seed accounts on `example.invalid`, a generated synthetic signature, capture mode, a synthetic
activation instant in test databases only. Audits: two fresh `timesheet-auditor` opus (xhigh) area audits in
parallel on the freeze commit: A = finalization, ledger, revisions, ownership, files, PDF content and privacy;
B = jobs, delivery, uncertain send, deadline, reminders, GET/deep links, UI standard and visual evidence; an
integration pass only if both pass with open cross-area questions. Then the accept commit with STATE, board and
the bilingual HANDOFF acceptance record.

#### F. Canonical ambiguities needing an owner decision (not resolved here)

- **F-1 Automatic submission of a period with no saved entries.** docs/05_SUBMISSION_AND_NOTIFICATIONS.md:19
  ("Unsigned draft") and docs/04_UX_AND_SETTINGS.md:40 ("valid saved attendance") versus
  docs/01_PRODUCT_REQUIREMENTS.md:32 (planned labels are not attestations) and FR-03 (docs/01:11, default labels).
  Decision: does the deadline finalize a period where the user saved nothing (default Worked labels, no clock
  data)? Recommended: yes, with the FR-03 default labels, OT pending for days without records, "employee review
  pending" visible and no deficit (missing records stay incomplete); otherwise the deadline email silently does
  not go out.
- **F-2 Lifecycle of a pending deficit debit.** docs/02_TIME_AND_OT_RULES.md:56 says insufficient balance "leaves
  the proposed debit pending" but not how it resolves. Recommended: it stays a recorded pending line of the
  revision, is shown on the review and OT screens, and is re-evaluated only by a later finalized revision
  (correction or late review); no background posting.
- **F-3 Admin operational status versus the privacy boundary.** docs/07_DEPLOYMENT_AND_OPERATIONS.md:36 (the status
  view shows "delivery backlog/faults/uncertainty") versus docs/03_ARCHITECTURE_AND_DATA.md:33 and docs/01:36
  (admin is not private-data access; WP2-A-01 precedent). Recommended: the admin sees sender configured, outbound
  mode, runner heartbeat, activation and only system-wide totals by job state, without user, period or recipient;
  each employee sees their own delivery details.
- **F-4 Scope of `automation_active_from`.** docs/05:26 and docs/07:20 (recorded at owner activation) with
  `reference/examples/policy.example.json:82` (system `operations`) versus the per-user auto-submit preference
  (`:65`). Recommended: one system activation instant (null until the owner pilot, so no real deadline
  finalization happens before activation) combined with each user's auto-submit effective instant; tests set a
  synthetic activation in test databases only.
- **F-5 (clarification; proceed unless the owner objects) "Total" on the PDF.** docs/04:52 and AC-10
  (docs/06_TEST_AND_ACCEPTANCE.md:18) say "total including both Sundays"; the template total is the Overtime Total
  (evidence 01). Recommended: the credited OT total in h:mm over all 14 days; when "Show OT on PDF" is off
  (docs/04:31) the OT rows and total are hidden; AC-10 evidence uses the default On.

Routine defaults proposed within the contracts (no owner decision needed): signature upload as a raw image body
with a route-scoped limit; a private data directory outside Dropbox; the capture adapter as the WP3 default; the
SMTP adapter built and tested only against a loopback sink; the CLI `run-jobs --once --now` for deterministic e2e
(refused in production); h:mm on the PDF; a per-day deficit choice deduct|waive.

#### G. Risks, dispatches, critical path

Risks: pdf-lib and fontkit are unmaintained since 2022 (mandated by docs/03:14; not deprecated), so font
subsetting must be verified visually or fonts embedded without subsetting; the upload exception to the JSON-only
body rule is security-sensitive; Windows process-kill and atomic-rename behaviour in crash tests (data directory
outside Dropbox, EBUSY); the in-process runner leaking into unit tests; rendering PDFs in Edge through pdfjs-dist;
the T01 schema must cover T05–T11 (later additions go in 0005, a frozen migration is never edited); privacy of
captured mail and PDF evidence (synthetic names, `*-synthetic` file names, the precommit scan); WP2 needed four
audit rounds, so plan for at least one fix round.

Expected dispatches: 16 implementation tasks and 16 freezes, one gate, one handoff/acceptance-record task, two area
audits and one accept commit, about 37; with one or two fix rounds (fix, freeze, gate, rechecks) about 45–55.

Critical path: T00 → T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08 → T09 → T10 → T11 → T12 → T13 → T14 → T15 →
WP3-GATE → audits A and B → fix rounds if any → accept. Owner decisions are needed before T05 (F-2), T10 (F-1,
F-4) and T13 (F-3); T00–T04 can start without them.
