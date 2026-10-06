# Architecture and data contract

## Components and choice

One repository, one Node.js application, one local SQLite DB. Hono serves the API and built React/Vite assets on the same origin. A background module claims persisted jobs; it can be separated later without requiring Redis now. Use a pure calculation engine shared by API, UI results, reports and ledger.

| Option | Assessment |
|---|---|
| Hono + React/Vite | Selected: explicit small API/static UI, one TypeScript stack; auth/jobs must be implemented deliberately |
| Next.js | Viable when its full-stack conventions are useful; this private tool needs no public SEO/server-rendering requirement |
| ASP.NET Core/C# | Also suitable for Docker and strong domain modeling; no business rule rules it out |
| FastAPI/Python | Viable, but adds another language to a TypeScript UI |

These are project-fit judgments, not a claim that C# or Next.js cannot be lightweight. Use TypeScript strict mode, schema validation, versioned migrations and a lockfile. Pin a supported Node LTS and maintained SQLite binding during WP1; Drizzle is optional. PDF baseline is pdf-lib with embedded Unicode fonts, avoiding a browser service for a fixed form.

## Records

| Group | Contract |
|---|---|
| users/sessions | Stable IDs, display name/email, role/status, secure password hash, revocable server sessions |
| calendars/versions/holidays | Reporting IANA zone, weekdays, holiday/closure dates/names, effective versions |
| work_policies | User, effective date, B/N/M, breaks, deficit mode; immutable referenced versions |
| pay_periods | Calendar, start/end, payroll date, due rule and resolved UTC; unique calendar/payroll |
| timesheets/day_entries | User+period and user+work_date uniqueness; attendance/leave minutes with `leave_kind` (vacation, sick or ot; no OT-leave day category), notes, confirmation, optimistic version |
| work_sessions/breaks | Ownership, UTC start/end, originating zone, source, confirmed breaks; no overlapping user intervals |
| timesheet_revisions/signoffs | Immutable canonical payload/hash; real actor/time/hash-bound sign-off, absent on unsigned automation |
| ot_ledger | Integer signed delta, type, source event, revision/correction links, actor/reason; unique event key |
| ot_leave_requests | Requested/approved/reserved/consumed minutes, date, evidence, approval origin, reversals; consumption only through an explicit idempotent record-use action on or after the leave date (partial allowed); no WP2 job runner consumes or expires reservations |
| jobs/delivery_attempts | Owner/revision/channel, due/retry time, state, attempts, lease, correlation/provider identifiers |
| attachments/audit_events | Private opaque keys/hash/type/size; actor, UTC, operation, before/after, reason |
| timesheet_shares | Owner, grantee, items (timesheets none/view/edit, OT read-only, final PDF download), created by/at, revoked by/at; one active share per owner and grantee; a change of items revokes and replaces the row; never transitive |
| imports | Source SHA-256, mapping version, owner, preview/commit batch; idempotency key |

Shared pay periods do not contain a single user's signed/sent flag. Names/emails/paths are not identity keys. Admin manages accounts/configuration and sees operational information: accounts, calendars, sharing grants, each person's timesheet lifecycle, revision origin and review state, PDF and delivery states with recipient addresses, redacted fault codes, settings flags and job/runner health. Timesheet details stay private: day entries, sessions and breaks, leave, notes, calculations, personal policies, OT ledger and balances, leave requests and permission evidence, evidence exports, review payloads and snapshots, PDFs, signature images, email templates, rendered email content and the audit payloads of personal records. Access to them requires the owner's explicit grant, also for an administrator. An admin edit may change a user's display name and role at any time, but the user's calendar only while the user has no timesheet, day entry, session, ledger entry or leave request (otherwise 409 `calendar_in_use`, nothing written). Future manager access uses employee assignments.

## Atomicity and snapshots

Enable foreign keys, WAL, busy timeout and short transactions. Validate ownership or an active grant of sufficient scope, and the version, on each action; the session user is the actor and the timesheet owner is the subject. Reserve/consume balances atomically. Claim jobs with an atomic update and renewable lease. No network call inside a DB write transaction.

Finalization atomically creates the immutable revision, real sign-off if any, ledger events and outbox job. PDF/network work follows. Use temporary files plus atomic rename, recorded hashes and recovery of orphan files; never remove referenced archived files.

Canonical serialization uses stable object keys/array order, integer minutes, ISO dates and UTC strings. Snapshot calculations, policy/calendar IDs, employee/report data, recipients, subject/body, signature authorization and template version. Referenced signature/file content must be immutable; later profile edits cannot alter archived reports. Do not snapshot credentials.

## Imports, opening balance and retention (owner decisions 2026-10-05, requirements)

- Who imports (F-1): each person previews and commits only their own workbook, so the actor is the owner. An administrator cannot import, preview or read an import for another person; another user's batch answers 404.
- Imported periods (F-2): an imported period (`imported_unverified`) posts no ledger events, cannot be signed or submitted (409 `imported_period`) and is read-only history. The explicit opening balance is the only OT carry-in, so nothing is counted twice.
- Opening balance (F-3): signed, non-zero minutes with an as-of date, reason and evidence; one per user; changed only by a reasoned correction; stored as a new ledger entry type.
- Never-configured accounts (F-3): an account that never saved its submission settings shows an administrator a "not set up" flag in the operational status, and the employee gets no overdue warning. This matches the H-Q1 (a) rule in document 05 (no automation before setup).
- Job-row retention (F-4): only succeeded `deadline_scan` and `reminder_scan` job rows older than 30 days may be deleted, through a migration-scoped exception to the job-delete trigger. Delivery, PDF and send rows are never deleted.

## API and hosting boundary

Group routes under /api for auth, personal settings, calendars, periods/day edits, OT/leave, review/finalize/status, correction/resend, private files, sharing (grants and delegated access under an explicit owner path), users (administration), the owner's own workbook import and health. Distinguish validation, auth, ownership, stale version and delivery errors. Review/finalize requires expected_version and reviewed hash; conflicts require fresh review. The workbook import routes are `/api/imports` and the explicit opening balance is `/api/ot/opening-balance`; both are owner only and are not part of any share.

Use secure cookie sessions, CSRF/origin protection, login/token rate limits, validated upload types/sizes and private file retrieval. Do not serve PDFs/signatures from public static paths. Health contains no personal data.

Run one instance with host-local storage. A NAS folder mounted into a container on that same NAS is local; remote SMB/NFS is not a SQLite WAL deployment target. PostgreSQL is a later measured need for multiple instances/write contention. OIDC can be added later; never trust arbitrary client-supplied proxy identity headers.
