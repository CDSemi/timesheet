# WP2 implementation — Personal workspace and OT ledger

Operator: **Claude Code, Sonnet 5.5, Medium**, existing Max sign-in. Verify model/usage and document 08's fallback. This prompt does not configure the client.

Implement **WP2 only**. Follow [AGENTS](../AGENTS.md). Inspect the actual repository and accepted earlier handoffs before editing. Communicate in Vietnamese; code/comments and canonical docs are English with matching human-facing Vietnamese translations.

Read:
- [02_TIME_AND_OT_RULES](../docs/02_TIME_AND_OT_RULES.md)
- [03_ARCHITECTURE_AND_DATA](../docs/03_ARCHITECTURE_AND_DATA.md)
- [04_UX_AND_SETTINGS](../docs/04_UX_AND_SETTINGS.md)
- [06_TEST_AND_ACCEPTANCE](../docs/06_TEST_AND_ACCEPTANCE.md)
- [09_IMPLEMENTATION_ROADMAP](../docs/09_IMPLEMENTATION_ROADMAP.md)

Read only additional source/docs needed for a concrete dependency. Use the relevant time/OT fixtures and ledger fixtures; prior handoff; do not load every translation or binary workbook by default.

Scope: Implement mobile/two-week views, actual clock/manual/break editing, partial leave/batch categories/WFH, settings, holiday CSV preview/import, user administration, history/audit and OT evidence CSV/report. Implement transactional ledger/delta/reservation services, recorded permission, partial consume/cancel/reverse and insufficient-balance behavior. WP3 wires finalization; expose no arbitrary public credit endpoint.

Suggested checkpoints: (1) Editor/settings/calendar; (2) ledger/leave/history/integration; a third session only for concrete remaining work.

Required gate: Core browser flows; AC-01/03/04/05 for implemented services; concurrent reservations; partial leave; correction deltas; safe evidence export; admin is not blanket private-data access.

Do the implementation, not just a proposal. Keep local sending in dry-run/capture. Do not change billing, buy usage, start parallel agents, expose a host or send real messages. Resolve routine choices within the contracts; flag actual contradictory requirements.

Deliver complete changed source/migrations/tests, exact commands/results and [HANDOFF](../templates/HANDOFF.md) with a .vi.md translation. Record baseline/commit, actual model/effort if observable, evidence paths, limitations and one next action for independent review. Unrun checks are not passed. If interrupted, save [CHECKPOINT](../templates/CHECKPOINT.md) and resume this package. Do not start WP3.
