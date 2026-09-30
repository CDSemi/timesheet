# Submission and notifications

## Independent state

Track revision (draft/finalized), employee review (pending/signed), finalization origin (employee/deadline), PDF (pending/ready/failed), and delivery (queued/preparing/sending/accepted/failed/uncertain) separately. Manager timesheet approval is future functionality; recorded OT-leave permission is not that approval. Provider acceptance does not prove receipt/read. A signature image is not a review event.

## Manual path

Prepare an exact review payload: attendance, OT evidence/movements, unresolved inputs, deficit decisions, recipients, email and signature image. A preview is not a final submission PDF. Manual sign-off requires employee name and an uploaded signature image. Explicit Sign off & Submit carries expected draft version and reviewed payload hash.

Validate ownership/version, finalize snapshot, record real sign-off, post ledger events and enqueue work in one transaction. Stale content returns a conflict. Render the final private PDF from the snapshot, persist/hash it, then send that exact file and frozen email content. Delivery status remains independent of sign-off.

Incomplete optional clock evidence may remain pending after explicit acknowledgement; never invent hours. Correct invalid data or exclude it with audit.

## Deadline and recovery

Persist due_at UTC from the reporting-zone due rule. The runner operates without a browser.

- Unsigned draft + enabled switch: finalize valid attendance as **automatic; employee review pending**; post only computable credits/authorized deficits; enqueue PDF/email.
- Switch off: keep draft, mark overdue and notify; no automatic export/send.
- Already finalized: continue its existing job, never finalize/post again.
- Manual/deadline race: one transaction wins; the other reloads. No duplicate revision, ledger posting or send.

Automatic image inclusion is separately off by default. Explicit prior authorization may enable it, but signed_at stays empty and pending review remains visible.

Record automation_active_from. By default only periods with due_at on/after activation are eligible; imported history is excluded. Recover missed eligible deadlines chronologically in bounded batches after downtime. Changes default to future periods; applying them to already-overdue drafts requires an explicit choice. Missing sender/recipient blocks delivery and shows a fault, never “sent.”

## Reminders and review links

Default reminders: 24h and 2h before due, an overdue warning when auto-submit is off, and an outcome notice after automatic submission. Deduplicate by user/period/reminder occurrence; stop normal reminders after finalization. Collapse missed pre-deadline notices into one useful current notice.

Email is mandatory; protected ntfy is optional; SMS deferred. Channel retries do not imply employee review. Login-required deep links are sufficient initially.

If implementing magic links: random short-lived action-scoped tokens stored hashed, bound to user/period/revision, atomic single use. GET—including scanners—never signs/submits/consumes. Explicit POST requires origin/CSRF protection. No general account access, reusable credential or private data in URLs/logs. Expired/stale links lead to fresh review/login.

## Durable delivery

Persist jobs, unique business keys, attempts, lease/renewal, retry times and redacted provider responses. Suggested delays: 1, 5, 15, 60 minutes, then visible intervention. Target discovery within one minute on a healthy host; do not promise exact wall-clock send time.

| Failure point | Action |
|---|---|
| PDF before send | Retry same snapshot, no ledger posting |
| Definitely before message transfer | Retry transient failure; expose permanent configuration errors |
| Explicit rejection | Classify temporary/permanent |
| Acknowledged acceptance | Record acknowledgment/provider ID/time |
| Process/connection lost after possible acceptance | Mark uncertain; query supported provider status or require explicit resend decision |

SMTP is not exactly-once delivery. Stable Message-ID helps correlation but cannot guarantee deduplication. A lease-expired sending attempt with unknown outcome must not be blindly resent. Finalization/ledger remain idempotent even when external delivery is uncertain.

## Corrections and resends

Old/finalized edits require a reason and correction draft, preserving original snapshots/PDF/sign-off/attempts. Finalize a new revision and post only ledger differences. Editing does not silently resend.

Late review of an automatic revision creates a new genuinely signed revision; unchanged calculation posts zero delta. Let the employee explicitly choose whether to email that reviewed revision. Unchanged-PDF resend creates another attempt on the same revision and no ledger movement. Changed report content or recipient envelope needs a new immutable reviewed revision.

Archived downloads require ownership. Separate OT evidence export includes raw intervals, breaks, policies, daily eligible/credited amounts, adjustments and leave permission; it is not automatically attached to payroll email.
