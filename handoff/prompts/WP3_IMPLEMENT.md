# WP3 implementation — PDF, sign-off and automatic submission

Operator: assigned implementation/fix subagent under the coordinator; profile/model/effort selected by task complexity under document 08. ChatGPT/Codex may also execute this role. Use existing subscription sign-in.

Implement **WP3 only**. Follow [AGENTS](../../AGENTS.md). Inspect the actual repository and accepted earlier handoffs before editing. Communicate in Vietnamese; code/comments and canonical docs are English with matching human-facing Vietnamese translations.

Read:
- [02_TIME_AND_OT_RULES](../../docs/02_TIME_AND_OT_RULES.md)
- [03_ARCHITECTURE_AND_DATA](../../docs/03_ARCHITECTURE_AND_DATA.md)
- [04_UX_AND_SETTINGS](../../docs/04_UX_AND_SETTINGS.md)
- [05_SUBMISSION_AND_NOTIFICATIONS](../../docs/05_SUBMISSION_AND_NOTIFICATIONS.md)
- [06_TEST_AND_ACCEPTANCE](../../docs/06_TEST_AND_ACCEPTANCE.md)
- [09_IMPLEMENTATION_ROADMAP](../../docs/09_IMPLEMENTATION_ROADMAP.md)

Read only additional source/docs needed for a concrete dependency. Use the relevant time/OT fixtures and ledger fixtures; prior handoff; do not load every translation or binary workbook by default.

Scope: Implement immutable snapshots/hashes, explicit review/sign-off, atomic ledger/outbox finalization, pdf-lib report and private signature files, templates/recipients, durable jobs/reminders, deadline automation, capture/provider adapters and delivery history. Cover incomplete OT, deficit choices, activation boundary, late review/corrections/resend and uncertain SMTP outcomes. Authenticated deep links are required; restricted magic links are optional and must meet full safeguards if added. Add owner-granted timesheet sharing with per-item toggles and the admin status boundary.

Suggested checkpoints: (1) Snapshot/review/PDF/ledger transaction; (2) jobs/reminders/adapters/failure recovery; (3) remaining integration/visual checks only if needed.

Required gate: AC-06–AC-10 and AC-14; deadline/manual race, auto-image on/off, interrupted/uncertain send, duplicate jobs, private downloads and visual PDF evidence including both Sundays; AC-16, the automatic note line and image options, outgoing automatic submissions without an automatic indicator, empty-period automatic submission and admin status without timesheet details. All sending stays dry-run/capture.

Do the implementation, not just a proposal. Keep local sending in dry-run/capture. Do not change billing, buy usage, expose a host or send real messages. Resolve routine choices within the contracts; flag actual contradictory requirements.

Deliver complete changed source/migrations/tests, exact commands/results and [HANDOFF](../templates/HANDOFF.md) with a .vi.md translation. Record baseline/commit, actual model/effort if observable, evidence paths, limitations and one next action for independent review. Unrun checks are not passed. If interrupted, save [CHECKPOINT](../templates/CHECKPOINT.md) and resume this package. Do not start WP4.

Task boundary: only the coordinator delegates and advances packages. Save assigned task results/checkpoints after each coherent step; do not write shared workflow state or audit your own changes.
