# WP4 implementation — Docker, import and recovery

Operator: **Claude Code, Sonnet 5.5, Medium**, existing Max sign-in. Verify model/usage and document 08's fallback. This prompt does not configure the client.

Implement **WP4 only**. Follow [AGENTS](../AGENTS.md). Inspect the actual repository and accepted earlier handoffs before editing. Communicate in Vietnamese; code/comments and canonical docs are English with matching human-facing Vietnamese translations.

Read:
- [03_ARCHITECTURE_AND_DATA](../docs/03_ARCHITECTURE_AND_DATA.md)
- [05_SUBMISSION_AND_NOTIFICATIONS](../docs/05_SUBMISSION_AND_NOTIFICATIONS.md)
- [06_TEST_AND_ACCEPTANCE](../docs/06_TEST_AND_ACCEPTANCE.md)
- [07_DEPLOYMENT_AND_OPERATIONS](../docs/07_DEPLOYMENT_AND_OPERATIONS.md)
- [09_IMPLEMENTATION_ROADMAP](../docs/09_IMPLEMENTATION_ROADMAP.md)

Read only additional source/docs needed for a concrete dependency. Use the relevant time/OT fixtures and ledger fixtures; prior handoff; do not load every translation or binary workbook by default.

Scope: Deliver pinned Docker/Compose, safe config examples, non-root persistent runtime, bootstrap/migrations/health, consistent backup/restore and upgrade/rollback runbook. Implement workbook preview/commit with source-cell provenance, source hash, idempotency/conflicts and explicit opening balance. Preview the tracked template workbook with synthetic dated sheets. Verify target architecture when available; otherwise mark NAS tests unverified and provide concrete owner setup steps.

Suggested checkpoints: (1) Image/installation dry-run and restore; (2) workbook preview and operational handoff if needed.

Required gate: AC-11/12/15: clean install, migrations, restart persistence, backup under writes, isolated restore with file hashes/balances, identical re-import no-op and outbound paused after restore.

Do the implementation, not just a proposal. Keep local sending in dry-run/capture. Do not change billing, buy usage, start parallel agents, expose a host or send real messages. Resolve routine choices within the contracts; flag actual contradictory requirements.

Deliver complete changed source/migrations/tests, exact commands/results and [HANDOFF](../templates/HANDOFF.md) with a .vi.md translation. Record baseline/commit, actual model/effort if observable, evidence paths, limitations and one next action for independent review. Unrun checks are not passed. If interrupted, save [CHECKPOINT](../templates/CHECKPOINT.md) and resume this package. Do not start WP5.
