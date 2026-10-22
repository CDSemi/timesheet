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
| timesheet_revisions/signoffs | Immutable canonical payload/hash; real actor/time/hash-bound sign-off, absent on unsigned automation. A sign-off records the account's display name and, when one was saved, the signature image; the image reference is nullable (owner decision F-5 b, 2026-10-21; migration 0014) |
| ot_ledger | Integer signed delta, type, source event, revision/correction links, actor/reason; unique event key |
| ot_leave_requests | Requested/approved/reserved/consumed minutes, date, evidence, approval origin, reversals; consumption only through an explicit idempotent record-use action on or after the leave date (partial allowed); no WP2 job runner consumes or expires reservations |
| jobs/delivery_attempts | Owner/revision/channel, due/retry time, state, attempts, lease, correlation/provider identifiers |
| attachments/audit_events | Private opaque keys/hash/type/size; actor, UTC, operation, before/after, reason |
| timesheet_shares | Owner, grantee, items (timesheets none/view/edit, OT read-only, final PDF download), created by/at, revoked by/at; one active share per owner and grantee; a change of items revokes and replaces the row; never transitive |
| imports | Source SHA-256, mapping version, owner, preview/commit batch; idempotency key |

Shared pay periods do not contain a single user's signed/sent flag. Names/emails/paths are not identity keys. Admin manages accounts/configuration and sees operational information: accounts, calendars, sharing grants, each person's timesheet lifecycle, revision origin and review state, PDF and delivery states with recipient addresses, redacted fault codes, settings flags and job/runner health. Timesheet details stay private: day entries, sessions and breaks, leave, notes, calculations, personal policies, OT ledger and balances, leave requests and permission evidence, evidence exports, review payloads and snapshots, PDFs, signature images, email templates, rendered email content and the audit payloads of personal records. Access to them requires the owner's explicit grant, also for an administrator. One explicit exception (owner decision F-2 (b), 2026-10-20, reversing the WP2-A-01 removal): the administrator's holiday-import preview shows, per changed date, the exact number of employees' day entries in open timesheets that follow the default label, of explicit labels the import keeps, and of finalized timesheets, without any identity; in a small team such a count can point to a named colleague's recorded days, so every preview writes one `calendar.holiday_preview` audit event (actor, calendar, date range, number of dates with counts; no names). An admin edit may change a user's display name and role at any time, but the user's calendar only while the user has no timesheet, day entry, session, ledger entry or leave request (otherwise 409 `calendar_in_use`, nothing written). Future manager access uses employee assignments.

## Atomicity and snapshots

Enable foreign keys, WAL, busy timeout and short transactions. Validate ownership or an active grant of sufficient scope, and the version, on each action; the session user is the actor and the timesheet owner is the subject. Reserve/consume balances atomically. Claim jobs with an atomic update and renewable lease. No network call inside a DB write transaction.

Finalization atomically creates the immutable revision, real sign-off if any, ledger events and outbox job. PDF/network work follows. Use temporary files plus atomic rename, recorded hashes and recovery of orphan files; never remove referenced archived files.

Canonical serialization uses stable object keys/array order, integer minutes, ISO dates and UTC strings. Snapshot calculations, policy/calendar IDs, employee/report data, recipients, subject/body, signature authorization and template version. Referenced signature/file content must be immutable; later profile edits cannot alter archived reports. Do not snapshot credentials.

## Imports, opening balance and retention (owner decisions 2026-10-05, requirements)

- Who imports (F-1): each person previews and commits only their own workbook, so the actor is the owner. An administrator cannot import, preview or read an import for another person; another user's batch answers 404.
- Imported periods (F-2): an imported period (`imported_unverified`) posts no ledger events, cannot be signed or submitted (409 `imported_period`) and is read-only history. The explicit opening balance is the only OT carry-in, so nothing is counted twice.
- Opening balance (F-3, revised by owner decisions F-1 (i) and D-5 a of 2026-10-20): it is 0 with no entry until the owner sets it, and only the owner sets or changes it, at any time. The first value is signed, non-zero minutes with an as-of date (by default the day it is set) and a short reason; the evidence reference is optional, and a blank one is stored on the opening entry as the fixed text "not provided" (the schema is unchanged, no migration). One opening entry per user, stored as a ledger entry type; every later change is a reasoned correction (one ledger entry, evidence optional and stored as null when blank), which may return the value to 0 by posting minus the current value; a correction to the current value posts nothing.
- Never-configured accounts (F-3): an account that never saved its submission settings shows an administrator a "not set up" flag in the administrator's account list, and the employee gets no overdue warning. This matches the H-Q1 (a) rule in document 05 (no automation before setup).
- Job-row retention (F-4): only succeeded `deadline_scan` and `reminder_scan` job rows older than 30 days may be deleted, through a migration-scoped exception to the job-delete trigger. Delivery, PDF and send rows are never deleted.

## API and hosting boundary

Group routes under /api for auth, personal settings, calendars, periods/day edits, OT/leave, review/finalize/status, correction/resend, private files, sharing (grants and delegated access under an explicit owner path), users (administration), the owner's own workbook import and health. Distinguish validation, auth, ownership, stale version and delivery errors. Review/finalize requires expected_version and reviewed hash; conflicts require fresh review. The signer of a sign-off, a correction and a late review is the signed-in person (owner decision F-5 b, 2026-10-21): the server records the session user's display name and never a name from the request. The `signer_name` key that older callers still send is accepted and ignored (it changes neither the stored name nor whether a retry is an identical replay). The saved signature image is optional: with one, the sign-off records it and a review payload whose `signature` differs from the image saved now is a 409 `stale_review`; without one, the sign-off records no image and the PDF prints the name alone. The workbook import routes are `/api/imports` and the explicit opening balance is `/api/ot/opening-balance`; both are owner only and are not part of any share.

The signed-in user changes their own password with `POST /api/auth/password` (owner decision D-9 b, 2026-10-20). It is for the session user only and is not a shared route. The body carries the current and the new password; a wrong current password is 403 `current_password_incorrect` (the session stays valid) and counts per user and client address against the sign-in limiter under its own key `password:<user id>` (5 wrong current passwords in 15 minutes, then 429 with `Retry-After`). Sign-in keys carry a `login:` prefix, so no sign-in input can address that bucket and lock the user out of the change (F-UX4B-1); the per-client-address bucket (30 failures in 15 minutes) is still shared with sign-in. A new password outside 12–256 characters is 422 `weak_password`, and one equal to the current password is 422 `password_unchanged`. In one transaction the hash is replaced, every other session of the user is revoked (this one stays signed in) and one `auth.password_change` audit event is written without any password or hash. The administrator's temporary password for another account is a separate path and is unchanged.

The shared clock guard (F-Q5, extended by owner decision R2 a, 2026-10-21): through a share, a grantee never starts or ends the owner's running session by any route. `createSession` and `updateSession` refuse a change of the running state, and `DELETE /api/shared/:ownerId/sessions/:id` on a session with no end is refused too, all with 409 `shared_clock_action` before anything is written (the check runs inside the write transaction, before the version check, so nothing is written and no audit event is recorded). A shared delete of an ended session and every action of the owner are unchanged, and the route inventory is unchanged.

Settings export and import add no record and no route. A settings file is created and read only in the browser and applies through the existing policy, submission-settings and calendar routes; the file never leaves the person's device through the server.

Use secure cookie sessions, CSRF/origin protection, login/token rate limits, validated upload types/sizes and private file retrieval. Do not serve PDFs/signatures from public static paths. Health contains no personal data.

Run one instance with host-local storage. A NAS folder mounted into a container on that same NAS is local; remote SMB/NFS is not a SQLite WAL deployment target. PostgreSQL is a later measured need for multiple instances/write contention. OIDC can be added later; never trust arbitrary client-supplied proxy identity headers.
