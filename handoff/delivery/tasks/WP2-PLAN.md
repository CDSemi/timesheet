# WP2-PLAN dispatch brief

- Mission/task: timesheet-software-readiness / WP2-PLAN; package WP2; kind plan; attempt 1;
  depends on WP1-F01-ACCEPT (WP1 accepted, commit f32978fcc7dec9429f0aa544c4ee4ee26c14f798).
- Profile/routing: timesheet-planner with model override opus, reason `size_risk`
  (package decomposition, docs/08 rubric); effort stays the profile's high. Routing:
  size L, risk H, novelty yes. Record in English; read-only planning, no source edits.
- Read AGENTS.md from disk first, then docs/08 (routing rubric, commit points,
  package-final gate), docs/09 (WP2 section), handoff/prompts/WP2_IMPLEMENT.md and
  WP2_REVIEW.md, the canonical documents they name (01–07), handoff/delivery/WP1_HANDOFF.md
  (including the acceptance record) and WP1_RECHECK.md (three carried risks). Inspect the
  current source tree, migrations and tests read-only to find existing patterns.

## Required output (append under Results)

A. WP2 scope summary with the requirement, rule and acceptance IDs it must satisfy.
B. Ordered task list of bounded slices (prefer S/M; L only when unavoidable). For each
   task give:
   - ID (WP2-T01…) and title;
   - size, risk and novelty;
   - profile and model per the docs/08 rubric, with an override reason if any;
   - exact owned paths;
   - dependencies;
   - covered IDs;
   - required tests and checks, and the freeze-commit point.

   Keep a single writer at a time. Mark which tasks can run their planning or read-only
   analysis in parallel.
C. Carried WP1 risks: say which task addresses each, or record an explicit deferral with
   its rationale. The risks are unconfirmed partial break-list semantics, future break
   rows on open sessions, and Clock out without expected_version.
D. Package-final gate: commands, browser-flow and visual evidence as WP2_REVIEW requires,
   and the synthetic data setup. Audit scope: a fresh opus auditor, plus area audits if
   the package is too large for one context. Accept commit.
E. Contradictions or ambiguities in canonical documents that need an owner decision.
   Flag them and do not resolve them silently. Give the exact file:line and the decision
   needed.
F. Risks, the expected number of dispatches, and the critical path. Give no token or
   time estimates.

- Writable: this file and handoff/delivery/evidence/WP2-PLAN/ (read-only command outputs,
  masked, LF, single final newline). Everything else read-only. No commits.
- Return at most 400 words, beginning with your self-reported model: task list summary,
  owner decisions needed, critical path.

## Results

(Planner appends here.)

### Planner result — WP2-PLAN attempt 1

- Self-reported model: `claude-opus-5-5` (requested opus, profile timesheet-planner, effort
  not observable from inside the session).
- Baseline inspected: HEAD `f32978fcc7dec9429f0aa544c4ee4ee26c14f798`, source digest
  `c6e24381253c02ac74d1690b7b15aa7e6ac5b31bcd7ee8b8b8d19ca7d7d29c59` (533 files, equal to
  the accepted WP1 digest); working-tree changes only under `handoff/`. Evidence:
  [baseline.txt](../evidence/WP2-PLAN/baseline.txt).
- Read from disk: AGENTS.md, this brief, docs 01–09 (English), 10 (decisions), prompts
  WP2_IMPLEMENT/WP2_REVIEW, WP1_HANDOFF (with acceptance record), WP1_RECHECK, the fixture
  guide and `ledger_cases.json`, and read-only source: migration 0001 and registry, routes,
  schemas, `timesheetCommands.ts`, `timesheets.ts`, `calendars.ts`, `users.ts`, `audit.ts`,
  `periods.ts`, auth/session, `app.ts`, the client, the test harness, `vitest`/eslint/tsconfig
  and `scripts/precommit-check.mjs`. No source, configuration or shared state was edited.

#### Observations from the source that shape the plan (facts, not assumptions)

1. One migration (`0001_initial.ts`); the registry `MIGRATIONS` is append-only and
   checksum-guarded, so every WP2 schema change is a new migration (0002, 0003…), never an
   edit to a committed one.
2. `ensureDayEntry` persists the calendar default label when a session is created
   (`timesheetCommands.ts:132-157`). A later holiday import therefore cannot tell a
   persisted default from an explicit user override. AC-05 "preserves overrides" needs a
   `category_source` (default|explicit) column, and default rows should take their label
   from the calendar at read time so that an admin import never writes employee rows.
3. No ledger, leave, revision or attachment tables exist. `timesheets.finalized_revision_no`
   is reserved for WP3. The pure `decideDeficit` (with `insufficient_balance`) exists, but
   nothing posts.
4. Calendars are shared (`users.calendar_id`). `createCalendarVersion` and the prospective
   boundary (`calendars.ts:127-189`) exist without an HTTP route. Payroll exceptions exist
   in the domain and schema without an API, and stored `pay_periods` rows are never
   refreshed (the WP1 limitation).
5. There are no admin routes. `requireUser` is the only middleware, and users are created
   only by seed/CLI.
6. The state-changing API is JSON-only with a 64 KB body limit (`app.ts:35-44`). A holiday
   CSV must travel as a JSON string field within that limit, or the route needs a
   deliberate limit change.
7. `better-sqlite3` is synchronous. Two in-process requests serialize trivially, so a
   meaningful AC-03 concurrency proof needs separate connections in separate
   processes or worker threads against one file database.
8. There is no browser-automation dependency (`package.json`, 0 matches for playwright).
   WP1 browser evidence was a manual screenshot.
9. The client is a WP1 skeleton: `App.tsx`, `TimesheetScreen.tsx` and plain CSS custom
   properties with 8px/6px radii, with no router, Tailwind or brandkit.
10. Privacy hook constraints (governance file, not editable by WP2): images/PDFs need
    `synthetic` in the basename. `.csv`/`.xls*` files are blocked outside `reference/fixtures/`,
    `reference/examples/` and the template. Emails must use reserved domains such as
    `example.invalid`. Holiday-CSV test inputs must be inline strings, and exported CSV
    evidence must be saved as `*-synthetic.csv.txt`. Do not add files under `reference/`,
    because the package validator counts the 91 fixtures.

#### A. WP2 scope and IDs

Scope (docs/09:17-27, WP2_IMPLEMENT:16): mobile and two-week views; actual clock, manual and
break editing; partial leave, batch categories and WFH; settings; holiday CSV preview/import;
user administration; history/audit; OT evidence CSV/report; transactional ledger, delta and
reservation services; recorded permission; partial consume, cancel and reverse; and
insufficient-balance behaviour. No finalization, revisions, PDF or email (WP3), and no public
endpoint that creates credits.

| Kind | IDs WP2 must satisfy (WP2 part) |
|---|---|
| Requirements | FR-01 (user admin, deactivation), FR-03, FR-04, FR-05 (settings/breaks), FR-06 (editing), FR-08 (settings plus insufficient-balance service; posting is WP3), FR-09, FR-13, FR-14 |
| Rules | R-01 and R-02 (break editing/confirmation, carried risks), R-03 (holiday work keeps classification), R-05 (leave minutes L as an input; debit service with insufficient-balance outcome), R-06 (ledger, reservations, corrections, 1:1, no label spend), R-07 (prospective versions, reasons, audit, zones) |
| Acceptance | AC-01 (ledger, leave, export, history, admin; PDFs, signatures and tokens stay WP3), AC-03 (posting and leave idempotency and concurrency), AC-04 (WP2 part: reasons, audit/history, policies; PDF retention WP3), AC-05 (holiday import) |
| Fixtures | LG-01…LG-08 and LG-10 against production services; LG-09 only as "unchanged correction posts zero delta" (late review and resend are WP3); DF-01…DF-16 already pass (WP1) |
| Gate | docs/09:25 and WP2_REVIEW:16: core browser flows; AC-01/03/04/05; concurrent reservations; partial leave; correction deltas; safe evidence export; admin is not blanket private-data access |
| Review focus | WP2_REVIEW:14: raw, provisional, posted, reserved and available traced; 480-minute conversion; no label-triggered spend; no double reservation or consumption; correction differences; reasons; preserved manual holiday overrides |

#### B. Ordered tasks (single writer at a time; each implementation task ends with its freeze commit)

Conventions for every task:
- Each task writes `handoff/delivery/tasks/WP2-Txx.md` and `handoff/delivery/evidence/WP2-Txx/`.
- Each task runs the Node 24 runtime and reproduces or writes tests red-first where a
  behaviour changes.
- The minimum check is `npm run verify` (typecheck, lint with `no-deprecated`, vitest,
  build, smoke) plus the task's targeted vitest files, with the outputs saved masked.
- Commit point: `WP2-Txx-FREEZE` (timesheet-committer, sonnet, alone, explicit paths).
- New HTTP areas get their own router module, so the shared `routes/api.ts` and
  `http/schemas.ts` change minimally.
- No task edits a committed migration, `reference/`, or governance paths
  (`scripts/precommit-check.mjs`, `.claude/`, AGENTS/CLAUDE, docs/08, prompts and templates).

**WP2-T01 — Break and Clock-out contract hardening (carried WP1 risks 1–3)**
- Routing: S / risk H (OT input, concurrency) / novelty no. Profile timesheet-worker-high,
  model sonnet, no override.
- Owned paths: `src/server/services/timesheetCommands.ts`, `src/server/http/schemas.ts`,
  `src/client/TimesheetScreen.tsx`, `src/client/api.ts`,
  `tests/integration/clock-out-breaks.test.ts`, `tests/integration/break-contract.test.ts`
  (new), `scripts/smoke-built-server.mjs` (only if the Clock out body changes).
- Depends on: WP2-PLAN accepted; decision E-1 (the coordinator may adopt the recommended
  default).
- Content:
  - `expected_version` is required on Clock out (409 `stale_version`).
  - Break-list semantics follow E-1.
  - Break end must be ≤ now + 5-minute allowance on open sessions (create, update and
    Clock out), with a typed 422 error.
  - A defined, typed outcome for legacy future break rows at Clock out.
  - Regressions: fault injection after the DELETE (rollback restores rows) and the
    zero-row UPDATE branch (409).
  - The client sends the version at Clock out.
- Covers: R-01, R-02, FR-06, docs/03:37 ("validate ownership/version"), docs/04:38,
  WP1_RECHECK risks 1–4.
- Checks: red-first new tests; the existing 6 F-01 regressions stay green; `npm run verify`.
- Freeze: WP2-T01-FREEZE.

**WP2-T02 — OT ledger core: schema, pure balance, idempotent posting, corrections, debit outcome**
- Routing: M (borderline L) / H (ledger/balance, immutable history) / novelty yes.
  Profile timesheet-worker-high, model opus, override reason `novelty` (docs/08 row "Novel
  high-risk L slice (ledger…)").
- Owned paths: `src/server/db/migrations/0002_ot_ledger.ts` (new), `src/server/db/migrations.ts`,
  `src/domain/ledger.ts` (new, pure), `src/domain/index.ts`, `src/server/services/ledger.ts`
  (new, internal service API only), `tests/domain/ledger.fixtures.test.ts` (new),
  `tests/integration/ledger.test.ts` (new), `tests/integration/migrations.test.ts`,
  `tests/support/fixtures.ts`.
- Depends on: T01 freeze.
- Content:
  - Tables `ot_ledger` and `ot_leave_requests`, both append-only or versioned with triggers.
  - `ot_ledger` holds an integer signed delta, a type, a per-user unique source-event key,
    an opaque `source_ref` for WP3 revision IDs, a self-FK `corrects_entry_id`, a leave
    request FK, the work date, actor, reason and origin.
  - `ot_leave_requests` holds requested, approved, reserved, consumed, released and
    reversed minutes, the leave date, permission fields, approval origin and version.
  - Pure functions: posted = sum(deltas); available = posted − active reservations;
    correction delta = new − old.
  - Internal services: `postCredit` (a duplicate key returns the existing entry and never
    appends); `postCorrection` (difference linked to the original; a negative balance is
    kept and flagged for reconciliation, LG-08); `postDeficitDebit` (insufficient
    available → pending result, no silent overdraft, R-05); `getBalance`.
  - No HTTP route.
- Covers: R-06, R-05 (debit outcome), FR-09, AC-03 (posting idempotency), LG-01, LG-02,
  LG-08, LG-09 (zero-delta part), docs/03:27-28,37.
- Checks:
  - All ledger fixtures run on real SQLite.
  - Trigger tests (UPDATE/DELETE rejected).
  - Fresh migration and upgrade migration from a database populated by the WP1 schema.
- Freeze: WP2-T02-FREEZE.

**WP2-T03 — OT leave lifecycle: recorded permission, reserve, partial consume, cancel, reverse, concurrency**
- Routing: M / H (balance, concurrency) / novelty yes (first multi-connection concurrency
  harness). Profile timesheet-worker-high, model opus, override `novelty`.
- Owned paths: `src/server/services/otLeave.ts` (new), `src/domain/ledger.ts`,
  `src/server/db/migrations/0003_ot_leave.ts` (new, only if T02's schema needs an addition),
  `src/server/db/migrations.ts` (only with 0003), `tests/integration/ot-leave.test.ts` (new),
  `tests/integration/ot-leave-concurrency.test.ts` (new), `tests/support/concurrency.ts`
  (new), `tests/domain/ledger.fixtures.test.ts`.
- Depends on: T02 freeze; owner decisions E-2(b) and E-3; coordinator decision E-5.
- Content:
  - Record the manager permission (name/identity, date, evidence per E-7, origin
    `self_recorded`) and reserve atomically under BEGIN IMMEDIATE with an available check.
  - Insufficient balance follows E-5.
  - Consume X ≤ reserved, per E-3, with idempotent keys; partial use releases or keeps
    the remainder explicitly.
  - Cancel releases unused minutes; reversing used minutes posts a linked compensating +delta.
  - Retries never append. 1:1 minutes (480 for eight hours, not 510).
  - A day-label change never reserves or spends (LG-10).
- Covers: R-06, FR-09, AC-03, LG-03…LG-07, LG-10, docs/04:10.
- Checks:
  - Concurrency test with N ≥ 2 OS processes or worker threads, each with its own
    connection on one WAL file. Exactly one of two 80-minute reservations wins at
    opening balance 100 (LG-07).
  - Repeat the test at least 20 times in one run to show stability.
  - Run consume/cancel/reverse races too.
- Freeze: WP2-T03-FREEZE.

**WP2-T04 — OT, leave, history and evidence-export HTTP API**
- Routing: M / H (privacy, ownership) / novelty no (router plus isolation-test pattern).
  Profile timesheet-worker-high, model sonnet.
- Owned paths: `src/server/routes/ot.ts` (new), `src/server/routes/history.ts` (new),
  `src/server/services/otEvidence.ts` (new), `src/server/services/history.ts` (new),
  `src/server/app.ts` (route registration only), `src/server/http/schemas.ts`,
  `tests/integration/ot-api.test.ts`, `tests/integration/evidence-export.test.ts`,
  `tests/integration/history.test.ts`, `tests/integration/isolation.test.ts` (extend).
- Depends on: T03 freeze; coordinator decisions E-6 and E-13.
- Endpoints:
  - `GET /api/ot/summary`: posted, provisional, reserved, available and the negative flag.
  - `GET /api/ot/ledger`.
  - `GET|POST /api/ot/leave`.
  - `POST /api/ot/leave/:id/{consume,cancel,reverse}` with `expected_version`.
  - `GET /api/ot/evidence.csv?from&to`.
  - `GET /api/history`: the user's own audit events plus policy and calendar versions.
- No route posts a credit or debit; the route inventory test asserts it.
- Evidence CSV:
  - Content: raw intervals, breaks, policy versions, daily raw/eligible/credited minutes,
    ledger adjustments and leave permission.
  - Cells starting with `= + - @` or a tab/CR are neutralized.
  - Sanitized `Content-Disposition` filename, `no-store`, owner-only.
- Covers: FR-09, FR-14, AC-01, AC-04 (history), docs/05:56, docs/04:10-11,50, "safe
  evidence export", "no arbitrary public credit endpoint".
- Checks:
  - Two-user ID-swap tests (404) on every new route.
  - Admin gets no access to employee data.
  - CSV injection cases.
  - CSRF/origin on POST.
- Freeze: WP2-T04-FREEZE.
- Optional advisory ledger audit: the coordinator may run a verifier gate and a fresh opus
  area audit on the T04 freeze, in a scratch clone and read-only, in parallel with T05.
  It catches ledger defects before UI work builds on them. It does not accept the package,
  because the final audit must still cover the final freeze.

**WP2-T05 — Day-entry workspace service: category source, partial leave, WFH, batch edits**
- Routing: M / H (reasons/audit, attendance input to deficits, ownership) / novelty no.
  Profile timesheet-worker-high, model sonnet.
- Owned paths: `src/server/db/migrations/0004_day_entry_source.ts` (new; the number follows
  the last committed migration), `src/server/db/migrations.ts`,
  `src/server/services/dayEntries.ts` (new; batch and preview),
  `src/server/services/timesheetCommands.ts` (`upsertDayEntry` and `ensureDayEntry` only),
  `src/server/services/timesheets.ts` (read-time default label, view fields),
  `src/server/services/otEvidence.ts` (only to add leave-kind columns if E-2 adds them),
  `src/domain/attendance.ts`, `src/server/http/schemas.ts`, `src/server/routes/api.ts`,
  `tests/domain/attendance.test.ts` (new), `tests/integration/day-entries-batch.test.ts`
  (new), `tests/integration/migrations.test.ts`.
- Depends on: T04 freeze; owner decision E-2(a)(c).
- Content:
  - `category_source` default|explicit, with a WP1-data backfill to `explicit`
    (conservative). Default rows show the calendar default label at read time.
  - Partial leave minutes are validated against the effective B, plus a leave kind if E-2
    requires it.
  - WFH.
  - `POST /api/days/batch`: preview, then commit with per-date `expected_version`.
    - It reports conflicts (dates with sessions or clock evidence) and requires explicit
      confirmation; it never deletes sessions.
    - A reason is required if any date is old.
    - One transaction, one audit event per changed entry.
- Covers: FR-03, FR-04, FR-14, R-05 (L), R-07, docs/01:32, docs/04:38, AC-04, AC-01.
- Checks: partial leave (240 work + 240 leave → no deficit, no OT); batch across old and
  current periods; conflicts; isolation; stale version; upgrade migration with WP1 rows.
- Freeze: WP2-T05-FREEZE.

**WP2-T06 — Personal policy settings preview**
- Routing: S / H (policy is an OT input) / novelty no. Profile timesheet-worker-high, model
  sonnet.
- Owned paths: `src/server/services/policies.ts`, `src/server/routes/api.ts`,
  `src/server/http/schemas.ts`, `tests/integration/policy-preview.test.ts` (new).
- Depends on: T05 freeze.
- Content: `POST /api/policies/preview` (no write). It lists current and future draft days
  whose provisional raw/eligible/credited minutes would change under the proposed
  effective-dated version. It validates reference duration = B + excluded breaks (R-02).
  Existing prospective-boundary rules are unchanged.
- Covers: FR-05, R-02, R-07, docs/04:34.
- Checks: preview equals the post-creation day views; no writes or audit on preview.
- Freeze: WP2-T06-FREEZE.

**WP2-T07 — User administration and admin router**
- Routing: S/M / H (authorization) / novelty no. Profile timesheet-worker-high, model sonnet.
- Owned paths: `src/server/routes/admin.ts` (new), `src/server/http/auth.ts`
  (add `requireAdmin`), `src/server/services/users.ts`, `src/server/auth/sessions.ts`,
  `src/server/app.ts` (registration only), `src/server/http/schemas.ts`,
  `tests/integration/user-admin.test.ts` (new), `tests/integration/isolation.test.ts`.
- Depends on: T06 freeze; coordinator decision E-11.
- Content:
  - List users with account fields only.
  - Create with an admin-set initial password; the password is never echoed back.
  - Edit display name, role and calendar.
  - Deactivate and reactivate; deactivation revokes all sessions. The last active admin
    and self-deactivation are refused.
  - Audit every change. Employees get 403 on `/api/admin/*`.
  - No admin route returns timesheets, ledger, leave, history or exports of another user.
- Covers: FR-01, AC-01, docs/01:36, docs/03:20,33.
- Checks: deactivated user's existing cookie → 401; admin ID-swap on personal routes → 404;
  audit before/after.
- Freeze: WP2-T07-FREEZE.

**WP2-T08 — Calendar administration: holiday CSV preview/commit, payroll exceptions, missing next-year warning**
- Routing: M / H (immutable versions, authorization) / novelty no
  (`createCalendarVersion` pattern). Profile timesheet-worker-high, model sonnet.
- Owned paths: `src/domain/holidayCsv.ts` (new, pure parser), `src/server/services/holidayImport.ts`
  (new), `src/server/services/calendars.ts`, `src/server/services/periods.ts`,
  `src/server/routes/admin.ts`, `src/server/routes/api.ts` (calendar warning field only),
  `src/server/http/schemas.ts`, `tests/domain/holiday-csv.test.ts` (new),
  `tests/integration/holiday-import.test.ts` (new),
  `tests/integration/payroll-exceptions.test.ts` (new).
- Depends on: T07 freeze; coordinator decisions E-4, E-10 and E-12.
- Holiday CSV:
  - Format `date,name[,kind]` in a JSON field within the body limit.
  - Preview reports invalid dates, duplicates, empty names, out-of-year rows and
    formula-leading cells.
  - The preview diff against the effective version shows added, removed and renamed dates
    and keeps manually added dates unless they are removed explicitly. It also lists the
    affected default-labelled draft days and the preserved explicit overrides.
  - Commit carries the preview hash and an `effective_from` ≥ the prospective boundary.
    It creates a new immutable version and an audit event. An identical re-commit is a
    no-op.
  - Finalized or old periods are never rewritten.
- Payroll exceptions: admin create with a reason. Refresh the stored `pay_periods` row in
  the same transaction when no finalized timesheet references it; otherwise refuse.
- Warning when next year's company calendar is missing.
- Covers: FR-13, FR-01 (admin scope), AC-05, R-07, docs/04:34, docs/07:38, docs/01:28,
  WP1 limitation (exceptions versus stored rows), WP1_RECHECK risk 6.
- Checks: AC-05 cases; the classification of past dates is unchanged after commit;
  explicit overrides preserved; employee 403; repeat commit adds no version.
- Freeze: WP2-T08-FREEZE.

**WP2-T09 — UI shell, two-week desktop view, mobile day list, batch edit UI, browser-test harness**
- Routing: M / risk M / novelty yes (first browser harness). Profile timesheet-worker, model
  sonnet. The AGENTS design skills apply.
- Owned paths: `src/client/App.tsx`, `src/client/TimesheetScreen.tsx`, `src/client/api.ts`,
  `src/client/styles.css`, `src/client/components/` (new), `package.json` and
  `package-lock.json` (devDependency and `test:e2e` script only), `playwright.config.ts`
  (new), `tests/e2e/` (new: harness and the timesheet/batch spec).
- Depends on: T08 freeze; owner decision E-8; coordinator decision E-9.
- Content:
  - Navigation shell.
  - Desktop two-week grid: category, time, due date, completeness and pending OT.
  - Mobile day list.
  - Batch category edit with a conflict dialog and reason prompt.
  - Hours and minutes only. Display zone and accounting date both visible.
  - The e2e harness starts the built server on a fresh temporary database with a synthetic
    seed and dates relative to the current day. Production code gets no clock override.
- Covers: FR-03, FR-04, docs/04:7,14,38, gate "core browser flows".
- Checks: `npm run verify`; `npm run test:e2e` at desktop and 390×844 mobile viewports;
  screenshots `*-synthetic.png`.
- Freeze: WP2-T09-FREEZE.

**WP2-T10 — Day editor UI**
- Routing: M / risk M / novelty no. Profile timesheet-worker, model sonnet.
- Owned paths: `src/client/DayEditor.tsx` (new), `src/client/components/`,
  `src/client/api.ts`, `src/client/styles.css`, `src/client/TimesheetScreen.tsx`,
  `tests/e2e/day-editor.spec.ts` (new).
- Depends on: T09 freeze.
- Content:
  - Manual sessions with an explicit input zone, a DST fold/offset choice and an explicit
    end date for overnight work.
  - Break suggestions shifted by arrival, with confirm, edit and none actions; unknown
    stays pending.
  - Clock in and out with break confirmation and version.
  - Category, partial leave and WFH.
  - Expected finish, and raw/eligible/credited minutes from the server.
  - Reason prompt for old periods; stale-version conflict reload.
- Covers: FR-05, FR-06, R-01, R-02, R-07, docs/04:8,38.
- Checks: e2e for 09:00–18:00 with shifted breaks (R 480 / credit 0) and for overnight
  entry; `npm run verify`.
- Freeze: WP2-T10-FREEZE.

**WP2-T11 — OT ledger/leave, history and evidence export UI**
- Routing: M / risk M / novelty no. Profile timesheet-worker, model sonnet.
- Owned paths: `src/client/OtScreen.tsx` (new), `src/client/HistoryScreen.tsx` (new),
  `src/client/components/`, `src/client/api.ts`, `src/client/styles.css`,
  `tests/e2e/ot-leave.spec.ts` (new).
- Depends on: T10 freeze.
- Content:
  - Posted, provisional, reserved and available balances, with negative or reconciliation
    flags.
  - Daily evidence; record permission and reserve; partial use, cancel and reverse.
  - Insufficient-balance message.
  - History list with before/after and reasons.
  - Evidence CSV download.
- Covers: FR-09, FR-14, docs/04:10-11,50, AC-04.
- Checks: e2e reserve 480, then use 240 partially, cancel and reverse; balances match the
  API; downloaded CSV content asserted.
- Freeze: WP2-T11-FREEZE.

**WP2-T12 — Settings and admin UI**
- Routing: M / risk M / novelty no. Profile timesheet-worker, model sonnet.
- Owned paths: `src/client/SettingsScreen.tsx` (new), `src/client/AdminScreen.tsx` (new),
  `src/client/components/`, `src/client/api.ts`, `src/client/styles.css`,
  `tests/e2e/admin.spec.ts` (new), `tests/e2e/isolation.spec.ts` (new).
- Depends on: T11 freeze.
- Content:
  - Policy version form with effective date and preview.
  - Users list, create and deactivate.
  - Holiday CSV paste or upload → preview (errors and diff) → commit.
  - Payroll exceptions.
  - Missing-calendar warning.
  - Admin screens scoped to account and configuration data.
- Covers: FR-01, FR-05, FR-13, AC-05, AC-01, docs/04:12,34.
- Checks: e2e admin flows; a second employee cannot see the first user's data by URL
  swap; admin cannot open employee data.
- Freeze: WP2-T12-FREEZE.

**WP2-T13 — Integration, synthetic seed, smoke, docs and WP2 HANDOFF (package-final source)**
- Routing: M / risk M / novelty no. Profile timesheet-worker, model sonnet.
- Owned paths: `src/server/seed.ts`, `scripts/smoke-built-server.mjs`, `DEVELOPMENT.md`,
  `DEVELOPMENT.vi.md`, `README.md`, `README.vi.md` (status lines only), `package.json`
  (description only), `handoff/delivery/WP2_HANDOFF.md`, `handoff/delivery/WP2_HANDOFF.vi.md`.
- Depends on: T12 freeze.
- Content:
  - The synthetic seed adds a second employee `employee2@example.invalid`, sample sessions
    and a leave request. Any seeded ledger entry is posted through the internal service
    with an explicit synthetic setup key and reason; there is no opening-balance inference.
  - Smoke covers 403 for admin and employee on each other's areas, the OT summary, and the
    evidence CSV headers.
  - Bilingual docs and HANDOFF with all commands and results.
- Covers: all of the above as integration; HANDOFF per template.
- Checks: `npm run verify` and `npm run test:e2e` in a clean export outside Dropbox;
  digest recorded.
- Freeze: WP2-T13-FREEZE, the package-final freeze commit.

Parallel read-only work (max two active subagents, one writer):
- While T03 or T04 writes, a light or planner read-only UI inventory and design-skill
  pre-flight for T09–T12 may run.
- The optional advisory ledger gate and audit (on the T04 freeze, scratch clone) may run
  while T05 writes.
- The final AUDIT-A and AUDIT-B may run in parallel, each in its own scratch clone of the
  same freeze.
- Planning or design for T07/T08 may be prepared read-only during T05/T06.

No other source writes overlap.

#### C. Carried WP1 risks

| Risk (WP1_RECHECK:75-78) | Disposition |
|---|---|
| 1. Semantics of a partial unconfirmed break list | T01, contract per E-1. Tests cover the unconfirmed list, the omitted list, and an echo of saved breaks, matching the replace semantics of session edit. |
| 2. Future break rows on open sessions | T01: reject a break end > now + allowance on create, update and Clock out; define a typed outcome for legacy rows at Clock out. |
| 3. Clock out has no `expected_version` | T01: required field, 409 on mismatch; client updated in the same task. |
| Optional regressions (rollback after the DELETE, zero-row branch) | T01, both added. |
| Risk 6 (payroll exceptions and stored periods) | T08. |
| Risk 5 (validator stops on a directory link in WORKFLOW_HANDOFF.md:65) | Not WP2 source. Deferred to the coordinator as a record fix outside the digest. |

No risk is deferred out of WP2.

#### D. Package-final gate, audits and acceptance

Gate WP2-GATE (timesheet-verifier, sonnet). It runs on the WP2-T13-FREEZE commit in a
`git archive` clean export outside Dropbox, with Node 24 first on PATH and `node --version`
recorded:
1. `npm ci`; then `NODE_OPTIONS=--trace-deprecation --pending-deprecation npm run verify`.
   Expected exit 0 with no deprecation warning.
2. `npm test -- --reporter=verbose`: counts per file, including LG-01…LG-08, LG-10, the
   LG-09 zero-delta check and DF-01…DF-16.
3. `ot-leave-concurrency` repeated at least 20 times (LG-07: exactly one winner each run;
   consume/cancel/reverse races leave no duplicate deltas).
4. Migrations: fresh database, plus an upgrade of a database created and populated at
   `f32978f` (WP1 schema) through all WP2 migrations, with integrity check and preserved rows.
5. `npm run test:e2e` at desktop 1280×800 and mobile 390×844 against the built server,
   fresh temporary DB and synthetic seed. Flows:
   - sign in and two-week view;
   - manual entry with break confirmation (09:00–18:00 → R 480, credit 0);
   - Clock in and out with version;
   - batch category with conflict;
   - partial leave 240/240;
   - permission, reserve 480, partial use and cancel/reverse;
   - insufficient balance;
   - evidence CSV download;
   - holiday CSV preview with error rows and commit;
   - user deactivation revokes the session;
   - second employee ID/URL swap → 404;
   - admin cannot open employee data.
6. Screenshots of each flow as `handoff/delivery/evidence/WP2-GATE/*-synthetic.png`. The
   exported CSV is saved as `evidence-export-synthetic.csv.txt`. Only reserved-domain
   emails appear.
7. `npm run digest` and `git ls-tree` cross-check; the digest is recorded as the WP2 identity.

Audits. Two fresh area audits (timesheet-auditor, opus, effort xhigh) run on the same
reviewed commit, equal to the gate's `freeze_commit`. Neither auditor may be any T01–T13
worker. Audit strength is opus, the strongest author model (T02/T03 used opus). The audits
use WP2_REVIEW and independent probes, and record the digest before and after.
- **WP2-AUDIT-A, ledger and privacy:**
  - trace raw → provisional → posted → reserved → available;
  - 480-minute conversion;
  - no label-triggered spend;
  - its own multi-process double-reservation and double-consumption probe;
  - correction differences, including a negative balance retained;
  - append-only triggers;
  - a route inventory showing no public credit endpoint;
  - evidence CSV injection and ownership;
  - AC-01 on ledger, leave, export and history; AC-03.
  - Reports: `handoff/delivery/WP2_REVIEW_A.md` and `.vi.md`.
- **WP2-AUDIT-B, workspace, admin, UI and integration:**
  - T01 break contract;
  - batch conflicts and partial leave;
  - AC-04 reasons and audit;
  - AC-05: duplicates and dates, preserved explicit and manual overrides, unchanged past
    classification, idempotent commit;
  - user admin and admin non-access;
  - payroll exceptions;
  - rerun the browser flows and visually inspect the screenshots, not only DOM assertions;
  - the WP1 → WP2 upgrade migration;
  - cross-area checks (leave label versus ledger, export completeness).
  - Reports: `handoff/delivery/WP2_REVIEW_B.md` and `.vi.md`.

A FIX REQUIRED or NOT VERIFIED result creates bounded fix tasks, each with
`addresses_audit`. Each fix is followed by a freeze commit, a new gate and recheck audits
of the affected areas at the new commit.

Accept. After both audits PASS on the same commit, WP2-ACCEPT (timesheet-committer) commits
the reviews, evidence, the HANDOFF acceptance record, STATE and NEXT_ACTION, then pushes.

#### E. Ambiguities and contradictions needing a decision (not resolved here)

Owner decisions required (business behaviour or governance):
- **E-2 Partial and OT-funded leave versus day labels.**
  - Sources:
    - `reference/fixtures/ledger_cases.json:445` uses the category "OT-funded leave".
      That category is absent from `src/domain/attendance.ts:87` and migration
      `0001_initial.ts:148`.
    - docs/01_PRODUCT_REQUIREMENTS.md:32 says leave is minutes.
    - docs/02_TIME_AND_OT_RULES.md:54 says R-05 uses "attendance-fulfilling leave L".
    - docs/02_TIME_AND_OT_RULES.md:62 says label changes never spend.
  - Decide:
    - (a) whether OT-funded leave is a day category or only a leave request linked to a date;
    - (b) whether consumed OT leave counts automatically as L for deficits, or the employee
      sets the day's leave minutes;
    - (c) whether partial leave minutes record a kind (vacation, sick or OT).
  - Recommended: no new category; a `leave_kind` on the day entry; L = the day's leave
    minutes; the UI warns when the day's OT-kind minutes and the request's consumed
    minutes differ; never auto-spend.
- **E-3 "Consume on the leave date" without a WP2 job runner.**
  - Sources: docs/02_TIME_AND_OT_RULES.md:62, docs/03_ARCHITECTURE_AND_DATA.md:28,
    docs/09_IMPLEMENTATION_ROADMAP.md:21.
  - Decide whether consumption happens:
    - automatically for the full reservation on the date (WP3 runner);
    - by an explicit employee "record use" on or after the date (partial allowed);
    - or at period finalization.
  - Recommended: the explicit, idempotent consume service in WP2. An unconsumed reservation
    stays reserved until used or cancelled, and WP3 review flags it.
- **E-8 UI standards in AGENTS conflict with the repository.**
  - Sources:
    - AGENTS.md:34 references `tailwind.config.js`.
    - AGENTS.md:37 asks for a 4px `brandkit` radius.
    - AGENTS.md:38-39 refers to P8000/P9000 product cards and Tailwind classes.
    - The repository has no Tailwind or brandkit and uses 8px/6px radii
      (`src/client/styles.css:53,78,86`).
  - Decide: keep plain CSS and adopt 4px radius and 300 ms ease-out transitions through CSS
    variables (recommended), or add Tailwind. Amending AGENTS is a GOV change.

Coordinator-routine (within contracts; recommended default, record in HANDOFF):
- **E-1 Break-list contract** (WP1_RECHECK.md:75; docs/02:15; docs/04:38): `breaks` is
  optional at Clock out. Omitted keeps saved rows (unconfirmed only). A present list is the
  complete set and replaces the saved rows whether confirmed or not.
- **E-4 "Overrides" in AC-05** (docs/06:13; docs/04:34; docs/07:38; WP2_REVIEW.md:14
  "manual holiday overrides"): preserve both personal explicit labels and manually added
  calendar dates (removal only when explicitly selected in the preview).
- **E-5 Insufficient balance at reservation** (fixtures README:20 "rejected_or_pending";
  docs/02:56 uses pending for deficits): reject with 409 `insufficient_balance` and create no
  reservation.
- **E-6 Provisional scope** (docs/04:10; docs/02:60): credited minutes of complete days in
  unfinalized periods, shown per period. Imported history is excluded once WP4 exists.
- **E-7 Permission evidence form** (docs/02:62; docs/03:28,30): text reference in WP2; file
  attachments wait for the WP3 private file store.
- **E-9 Browser tooling** (docs/06:27; docs/09:25): add `@playwright/test`. Browsers
  download outside the repository, or the installed Edge channel is used. Not part of
  `verify`; it gets a separate `test:e2e` script.
- **E-10 Payroll exception after rows exist** (WP1_HANDOFF.md:65; docs/03:24): refresh
  unfinalized rows and refuse finalized ones.
- **E-11 Initial password for admin-created users**: no rule exists. The admin sets a
  temporary password out of band; no email in WP2.
- **E-12 Next-year calendar warning threshold** (docs/04:34): warn from 1 October when the
  effective calendar has no dates for the next year.
- **E-13 WP2 "history"** (docs/04:11 lists revisions, PDFs and delivery, which are WP3):
  WP2 history means the audit trail plus policy and calendar versions.

#### F. Risks, dispatch count, critical path

Risks:
- An AC-03 proof that uses one in-process connection would be meaningless (T03 must use
  multiple processes).
- WP3 revision links cannot be retro-fitted as SQLite foreign keys without a table rebuild,
  so ledger links stay opaque until then (`source_ref` plus a self-FK).
- A WP1 → WP2 upgrade migration can lose data if it is not tested (T02, T05, gate step 4).
- An admin import that writes employee rows would breach privacy; read-time default labels
  avoid it.
- Scope creep into WP3: no revisions, PDF or finalization. Corrections are tested at
  service level only.
- Body limit for the CSV.
- Browser tooling download and flakiness on Windows, and Dropbox `EBUSY`: gates run in an
  export outside Dropbox.
- Privacy-hook traps: CSV, image and email naming.
- Churn on shared files (`schemas.ts`, `api.ts`, client `api.ts`) under serialized writers.
- Opus usage: T02, T03 and two audits. At low-usage warnings, drop worker overrides to
  sonnet but never the auditors.

Expected dispatches:
- Baseline: 13 implementation + 13 freeze commits + 1 gate + 2 audits + 1 accept = **30**.
- The optional advisory ledger gate and audit add 2.
- Each FIX REQUIRED cycle adds about 4–5 (fix, freeze, gate, recheck or rechecks).
- Realistic range 30–40.

Critical path:
1. T01 → T02 → T03 (owner E-2b/E-3 needed before T03) → T04.
2. T05 (owner E-2a/c needed) → T06 → T07 → T08.
3. T09 (owner E-8 needed) → T10 → T11 → T12 → T13.
4. Gate → AUDIT-A and AUDIT-B → accept.

Owner questions E-2, E-3 and E-8 should be asked now, so that T01 and T02 can proceed
while they are answered.
