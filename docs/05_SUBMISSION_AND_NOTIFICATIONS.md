# Submission and notifications

## Independent state

Track revision (draft/finalized), employee review (pending/signed), finalization origin (employee/deadline), PDF (pending/ready/failed), and delivery (queued/preparing/sending/accepted/failed/uncertain) separately. Manager timesheet approval is future functionality; recorded OT-leave permission is not that approval. Provider acceptance does not prove receipt/read. A signature image is not a review event.

## Manual path

Prepare an exact review payload: attendance, OT evidence/movements, unresolved inputs, deficit decisions, recipients, email and the signature image when one is saved. A preview is not a final submission PDF. Manual sign-off is the signed-in owner's act: it records the account's display name (no typed name) and, when one is saved, the signature image; without a saved image it carries the name alone (owner decision F-5 b, 2026-10-21). The reviewed payload binds the image state, so an image saved or replaced after the review makes the request a stale-review conflict. Explicit sign-off carries expected draft version and reviewed payload hash.

Sign off and send are separate acts (owner decisions F-2 a, F-3 b and F-4, 2026-10-21; WP5-UX5-T01b). Sign-off validates ownership/version, finalizes the snapshot, records the real sign-off, posts ledger events and enqueues the PDF in one transaction; it sends nothing. Stale content returns a conflict. The owner then sends the signed revision: the To, Cc, subject and body and the two PDF row switches ("Time rows on the PDF", "OT rows on the PDF") are chosen for that send, with the current Settings as defaults. Each send is its own immutable record. Render each PDF variant once from the snapshot, persist/hash it, then send that exact file with the send's own email content. Delivery status remains independent of sign-off.

Incomplete optional clock evidence may remain pending after explicit acknowledgement; never invent hours. Correct invalid data or exclude it with audit.

## Deadline and recovery

Persist due_at UTC from the reporting-zone due rule. The runner operates without a browser.

A period counts as submitted once any of its revisions has a send (owner decisions F-2 a of 2026-10-21 and H-1 a of 2026-10-22). At the deadline the system submits what is not yet submitted:

- Unsigned draft + enabled switch: finalize valid saved attendance—or the default labels when the period has no saved entries—as **automatic** (the record keeps employee review pending); post only computable credits/authorized deficits (days without records post no OT and no deficit); enqueue the PDF and send it through a send record with origin `deadline`, the Settings envelope and switches and no reason, presented as document 04 describes.
- Signed revision never sent + enabled switch: send the signed revision as signed (a `deadline` send with the Settings envelope and switches, no reason; audit `deadline.send_signed`). No new revision and no ledger change.
- Switch off (a draft, or a signed revision never sent): keep it, mark overdue and notify; no automatic export/send.
- Already submitted (any revision has a send): continue its existing jobs, never finalize, post or send again. A later correction or late review is therefore never sent by the deadline scan; the owner sends it.
- Manual/deadline race: one transaction wins; the other reloads. No duplicate revision, ledger posting or send.

Automatic image inclusion is a separate explicit, audited authorization of one stored signature image, asked for at signature upload with the option pre-selected; a user who unticks it gets no image on automatic submissions until they authorize it later in Settings. Outgoing automatic PDF/email follow document 04 (no automatic indicator, optional note line). signed_at stays empty and no sign-off is recorded; the employee's own screens and the outcome notice always show that review is pending.

Record one system-wide automation_active_from at the owner's activation (empty until then, so nothing is finalized automatically before it). A period is eligible only when its due_at is on/after both that instant and the user's auto-submit effective instant; imported history is excluded. Recover missed eligible deadlines chronologically in bounded batches after downtime. Changes default to future periods; applying them to already-overdue drafts requires an explicit choice. Missing sender/recipient blocks delivery and shows a fault, never “sent.”

Account bounds on automatic submission (both only narrow what is submitted; neither changes the manual path):

- Account creation (WP3-B-01; source: the coordinator decision of 2026-10-05, finding WP3-B-01, reversible by the owner): automatic submission never finalizes a period whose deadline passed before the account existed (`users.created_at`). The bound also clamps the explicit apply-to-overdue choice below. The period in which the account was created is still submitted at its deadline.
- Saved settings (owner decision H-Q1 (a), 2026-10-05, document 10): automatic submission applies only to an account that has saved its submission settings with auto-submit on. An account that never saved them is never finalized automatically, records no overdue state and has no delivery attempted. By default a period whose deadline passed before the settings were saved is not submitted automatically; the user's explicit apply-to-overdue choice when saving (still clamped by the account creation) is the only way to include such periods. Turning auto-submit off keeps the draft as the switch-off rule above describes.

## Reminders and review links

Default reminders: 24h and 2h before due, an overdue warning when auto-submit is off, and an outcome notice after automatic submission. Deduplicate by user/period/reminder occurrence; stop normal reminders once the period is submitted, at its first send (owner decisions F-2 a of 2026-10-21 and H-1 a of 2026-10-22): a signed period that was not sent keeps its reminders, worded "signed, not sent yet". Collapse missed pre-deadline notices into one useful current notice.

Reminders are at-least-once (owner decision D-7 a, 2026-10-20). A reminder job that runs again after a crash finds its message already captured and counts as sent; on real SMTP no such record exists, so if the process stops after the mail server accepted the message and before the job is recorded as sent, the reminder may arrive twice. This is accepted: reminders are advisory, and a lost reminder could cause a missed deadline. Submission deliveries are not reminders and keep the uncertain-outcome rule of the delivery table below.

Email is mandatory; protected ntfy is optional; SMS deferred. Channel retries do not imply employee review. Login-required deep links are sufficient initially.

If implementing magic links: random short-lived action-scoped tokens stored hashed, bound to user/period/revision, atomic single use. GET—including scanners—never signs/submits/consumes. Explicit POST requires origin/CSRF protection. No general account access, reusable credential or private data in URLs/logs. Expired/stale links lead to fresh review/login.

## Durable delivery

Persist jobs, unique business keys, attempts, lease/renewal, retry times and redacted provider responses. Suggested delays: 1, 5, 15, 60 minutes, then visible intervention. Target discovery within one minute on a healthy host; do not promise exact wall-clock send time.

Each send is an immutable record with exactly one send job (WP5-UX5-T01b). The send job builds the message from that record only (its envelope, subject, bodies and PDF variant), never from the snapshot's envelope or the current settings. It waits until the PDF of its variant is ready. Each attempt freezes the envelope, the body digest and the PDF hash. A send request carries the owner's idempotency key: the same request replays, and another body under the key is refused.

| Failure point | Action |
|---|---|
| PDF before send | Retry same snapshot, no ledger posting |
| Definitely before message transfer | Retry transient failure; expose permanent configuration errors |
| Explicit rejection | Classify temporary/permanent |
| Acknowledged acceptance | Record acknowledgment/provider ID/time |
| Process/connection lost after possible acceptance | Mark uncertain; query supported provider status or require explicit resend decision |

SMTP is not exactly-once delivery. Stable Message-ID helps correlation but cannot guarantee deduplication. A lease-expired sending attempt with unknown outcome must not be blindly resent. Finalization/ledger remain idempotent even when external delivery is uncertain.

## Corrections and resends

Old/finalized edits require a reason and correction draft, preserving original snapshots/PDF/sign-off/attempts. Finalize a new revision and post only ledger differences. Editing does not silently resend: corrections and late reviews sign the same way as a sign-off and never send by themselves.

Late review of an automatic revision creates a new genuinely signed revision; unchanged calculation posts zero delta. The employee explicitly chooses whether to send that reviewed revision. A send of the same revision creates another send record and attempt and no ledger movement; `/resend` is that send with the previous send's values. Changed report content needs a new immutable reviewed revision; the envelope, subject, body and PDF row switches are chosen for each send (owner decision F-4). After an automatic submission the employee may add records for days that credited no OT and finalize a reasoned correction; a day without an earlier credit posts a first credit, any other day only the difference.

Another copy needs a confirmation and a typed reason (owner decision F-4, 2026-10-21; plan B-A2):
- A copy of the period counts as sent once any delivery attempt of any of its revisions was `accepted` or `uncertain`, whatever was decided later (the mail may have arrived). A send whose attempts all ended `failed_permanent` does not count, so retrying a failed first send needs no reason.
- When a copy counts, a send needs a reason: 2-500 characters after trimming, NFC, no control characters except line feeds. Otherwise the send is refused (422 `reason_required`) and nothing is written. The explicit "resend" decision on an uncertain attempt needs the reason too.
- The reason is stored on the send and in its audit event. It is never added to the email.
- The check runs inside the send transaction, so two concurrent sends cannot both skip it. A send still in progress, or a send job of any revision of the period that still waits, blocks another one (409), so an older revision's copy cannot arrive after the correction's. A send job that a restore holds follows the same rule when the operator releases it: the release is refused (`superseded_by_later_send`) while any later send of the period exists, whatever state it is in or ended in (a cancelled one excepted) ([11 Operations runbook](11_OPERATIONS_RUNBOOK.md) section 7).
- The automatic paths never need a reason: they run only for a period that has no send.

Archived downloads require ownership or a share whose PDF item is on (the PDF may contain the signature image); signature image files are never shared. Separate OT evidence export includes raw intervals, breaks, policies, daily eligible/credited amounts, adjustments and leave permission; it is not automatically attached to payroll email.
