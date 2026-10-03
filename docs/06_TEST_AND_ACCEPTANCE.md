# Test and acceptance plan

This package contains specifications, not a running app. Package checks do not certify application behavior. Turn the [91 fixtures](../reference/fixtures/README.md) into tests of production code with independently specified expectations.

## Required gates

| ID | Required evidence | Package |
|---|---|---|
| AC-01 | Two users cannot read/edit each other's times, ledger, PDFs, signatures or tokens by swapping IDs | WP1–WP3 |
| AC-02 | Time/OT fixtures pass: N/M boundaries, off days, flexible arrival, overnight, seconds aggregation, DST, invalid intervals | WP1 |
| AC-03 | Repeated/concurrent posting and leave consumption cannot duplicate events or double-spend reservations | WP2/WP3 |
| AC-04 | Current draft no reason; old/finalized reason required; audit/history/policies and original PDF retained | WP2/WP3 |
| AC-05 | Holiday import previews/validates duplicates/dates, preserves overrides and finalized history | WP2 |
| AC-06 | Sign-off requires name/image and binds reviewed payload; concurrent edit causes conflict | WP3 |
| AC-07 | Auto-submit on/off, pending-review disclosure and image settings behave correctly | WP3 |
| AC-08 | Restart before/after PDF and around sending preserves jobs; uncertain acceptance is not blindly retried | WP3 |
| AC-09 | GET/scanners never sign; auth links and any implemented tokens reject stale/replayed/wrong-user access | WP3 |
| AC-10 | PDF has 14 dates, both Sundays in total, real sign date, Unicode, long labels, bounded image and revision IDs | WP3 |
| AC-11 | Clean Docker install/restart/upgrade; consistent backup under writes restores DB/files/hashes in isolated dry-run | WP4 |
| AC-12 | Workbook import preview (the tracked template with synthetic dated sheets) flags defects; repeated identical import adds no records, OT, sign-offs or sends | WP4 |
| AC-13 | End-to-end two-week scenario, historical correction, approved partial OT leave and overdue case | WP5 |
| AC-14 | Sender/channel faults visible, no leaked secrets, exact local-captured recipients/body/PDF | WP3/WP5 |
| AC-15 | Safe health/backup status and compatible rollback; restored instance has outbound paused | WP4/WP5 |

## Layers

Use pure domain tests, real SQLite integration tests, HTTP auth/version/CSRF checks, and a small set of meaningful browser flows. Test ledger transactions against the chosen binding, not only mocked repositories. Include exact eight-hour conversion (480), missing versus zero records, unknown breaks, history corrections and daily +20/+20 remaining zero.

Use deterministic clocks/zones and local mail capture/failure injection. Separate rejection, pre-transfer failure, acknowledged acceptance and unknown outcome. Simulate deadlines instead of waiting days. Visual PDF review requires rendering and inspecting pages; extracted text alone is insufficient. Synthetic examples must cover names/holiday labels/signature bounds.

Operations evidence includes real clean container start, migrations, backup while writes occur, isolated restore and representative file hashes/balances. Record unavailable NAS-specific tests as unverified.

## Review and release

Each handoff includes baseline/commit, commands, exit status, observed outcomes, evidence paths and untested cases. A fresh independent auditor (any supported vendor, separate from authors) returns PASS / FIX REQUIRED / NOT VERIFIED with specific reproduction and rule/AC IDs. Block progression for incorrect OT, privacy leaks, duplicate/lost ledger events, fabricated sign-off, lost revisions, blind resend after uncertainty or failed restore. Recheck affected paths and the required gate; do not add redundant broad testing without a concrete risk.

WP5 prepares a concrete pilot packet: actual URL/sender/recipients, exact email/PDF preview, settings, backup/restore result and rollback point. Owner authorization is needed for real pilot delivery/activation. Software readiness, owner permission, provider acceptance and recipient receipt are separate facts. If hardware access is absent, report software ready/pilot pending. After the pilot, observe one real period with Excel available for comparison.
