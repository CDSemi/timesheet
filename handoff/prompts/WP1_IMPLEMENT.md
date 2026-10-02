# WP1 implementation — Foundation and time calculation

Operator: **Claude Code, Sonnet 5.5, High**, existing Max sign-in. Verify model/usage and document 08's fallback. This prompt does not configure the client.

Implement **WP1 only**. Follow [AGENTS](../../AGENTS.md). Inspect the actual repository and preserve existing unrelated files before editing. Communicate in Vietnamese; code/comments and canonical docs are English with matching human-facing Vietnamese translations.

Read:
- [01_PRODUCT_REQUIREMENTS](../../docs/01_PRODUCT_REQUIREMENTS.md)
- [02_TIME_AND_OT_RULES](../../docs/02_TIME_AND_OT_RULES.md)
- [03_ARCHITECTURE_AND_DATA](../../docs/03_ARCHITECTURE_AND_DATA.md)
- [06_TEST_AND_ACCEPTANCE](../../docs/06_TEST_AND_ACCEPTANCE.md)
- [09_IMPLEMENTATION_ROADMAP](../../docs/09_IMPLEMENTATION_ROADMAP.md)

Read only additional source/docs needed for a concrete dependency. Use the relevant time/OT fixtures and prior handoff; do not load every translation or binary workbook by default.

Scope: Build the strict TypeScript/Hono/React skeleton, SQLite migrations, secure local login/session ownership, versioned calendar/policy records, period generator and pure production time/OT engine. Implement interval validation, historical policy references and old/current edit-reason enforcement. Supply synthetic seeds and runnable tests; no final PDF/email workflow yet.

Suggested checkpoints: (1) Repository/schema/auth and daily engine; (2) intervals/zones, integration and evidence.

Required gate: Type check/build, fresh SQLite migration tests, all time/OT fixtures, two-user isolation on implemented endpoints. Explicitly verify 09:00–18:00, N/M boundaries, off-day minutes, DST, seconds aggregation and mixed overnight shifts.

Do the implementation, not just a proposal. Keep local sending in dry-run/capture. Do not change billing, buy usage, start parallel agents, expose a host or send real messages. Resolve routine choices within the contracts; flag actual contradictory requirements.

Deliver complete changed source/migrations/tests, exact commands/results and [HANDOFF](../templates/HANDOFF.md) with a .vi.md translation. Record baseline/commit, actual model/effort if observable, evidence paths, limitations and one next action for independent review. Unrun checks are not passed. If interrupted, save [CHECKPOINT](../templates/CHECKPOINT.md) and resume this package. Do not start WP2.
