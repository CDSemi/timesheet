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
| timesheets/day_entries | User+period and user+work_date uniqueness; attendance/leave, notes, confirmation, optimistic version |
| work_sessions/breaks | Ownership, UTC start/end, originating zone, source, confirmed breaks; no overlapping user intervals |
| timesheet_revisions/signoffs | Immutable canonical payload/hash; real actor/time/hash-bound sign-off, absent on unsigned automation |
| ot_ledger | Integer signed delta, type, source event, revision/correction links, actor/reason; unique event key |
| ot_leave_requests | Requested/approved/reserved/consumed minutes, date, evidence, approval origin, reversals |
| jobs/delivery_attempts | Owner/revision/channel, due/retry time, state, attempts, lease, correlation/provider identifiers |
| attachments/audit_events | Private opaque keys/hash/type/size; actor, UTC, operation, before/after, reason |
| imports | Source SHA-256, mapping version, owner, preview/commit batch; idempotency key |

Shared pay periods do not contain a single user's signed/sent flag. Names/emails/paths are not identity keys. Admin manages accounts/configuration; access to private employee data requires a separate explicit permission. Future manager access uses employee assignments.

## Atomicity and snapshots

Enable foreign keys, WAL, busy timeout and short transactions. Validate ownership/version on each action. Reserve/consume balances atomically. Claim jobs with an atomic update and renewable lease. No network call inside a DB write transaction.

Finalization atomically creates the immutable revision, real sign-off if any, ledger events and outbox job. PDF/network work follows. Use temporary files plus atomic rename, recorded hashes and recovery of orphan files; never remove referenced archived files.

Canonical serialization uses stable object keys/array order, integer minutes, ISO dates and UTC strings. Snapshot calculations, policy/calendar IDs, employee/report data, recipients, subject/body, signature authorization and template version. Referenced signature/file content must be immutable; later profile edits cannot alter archived reports. Do not snapshot credentials.

## API and hosting boundary

Group routes under /api for auth, personal settings, calendars, periods/day edits, OT/leave, review/finalize/status, correction/resend, private files, users/import and health. Distinguish validation, auth, ownership, stale version and delivery errors. Review/finalize requires expected_version and reviewed hash; conflicts require fresh review.

Use secure cookie sessions, CSRF/origin protection, login/token rate limits, validated upload types/sizes and private file retrieval. Do not serve PDFs/signatures from public static paths. Health contains no personal data.

Run one instance with host-local storage. A NAS folder mounted into a container on that same NAS is local; remote SMB/NFS is not a SQLite WAL deployment target. PostgreSQL is a later measured need for multiple instances/write contention. OIDC can be added later; never trust arbitrary client-supplied proxy identity headers.
