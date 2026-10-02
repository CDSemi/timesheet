# WP5 implementation — Independent acceptance and pilot

Operator: **Claude Code, Sonnet 5.5, Medium**, existing Max sign-in. Verify model/usage and document 08's fallback. This prompt does not configure the client.

Implement **WP5 only**. Follow [AGENTS](../../AGENTS.md). Inspect the actual repository and accepted earlier handoffs before editing. Communicate in Vietnamese; code/comments and canonical docs are English with matching human-facing Vietnamese translations.

Read:
- [02_TIME_AND_OT_RULES](../../docs/02_TIME_AND_OT_RULES.md)
- [05_SUBMISSION_AND_NOTIFICATIONS](../../docs/05_SUBMISSION_AND_NOTIFICATIONS.md)
- [06_TEST_AND_ACCEPTANCE](../../docs/06_TEST_AND_ACCEPTANCE.md)
- [07_DEPLOYMENT_AND_OPERATIONS](../../docs/07_DEPLOYMENT_AND_OPERATIONS.md)
- [09_IMPLEMENTATION_ROADMAP](../../docs/09_IMPLEMENTATION_ROADMAP.md)

Read only additional source/docs needed for a concrete dependency. Use the relevant time/OT fixtures and ledger fixtures; prior handoff; do not load every translation or binary workbook by default.

Scope: Start from the accepted WP1–WP4 release candidate and WP5 independent findings. Reproduce/fix accepted defects with bounded regression tests; preserve accepted scope and history. Prepare bilingual release/setup notes and the exact pilot packet (URL, sender/recipients, email/PDF, settings, restore proof and rollback). If no independent assessment exists, identify it as pending, never fabricate a pass. Do not perform real deployment/sending without owner authorization.

Suggested checkpoints: ChatGPT assesses first; Claude fixes; ChatGPT rechecks; owner reviews the concrete pilot.

Required gate: AC-13 plus every unresolved required gate; complete reproducible release, verified restore, no blocking integrity/privacy/submission defect. Separate software readiness from owner authorization and actual production pilot outcome.

Do the implementation, not just a proposal. Keep local sending in dry-run/capture. Do not change billing, buy usage, start parallel agents, expose a host or send real messages. Resolve routine choices within the contracts; flag actual contradictory requirements.

Deliver complete changed source/migrations/tests, exact commands/results and [HANDOFF](../templates/HANDOFF.md) with a .vi.md translation. Record baseline/commit, actual model/effort if observable, evidence paths, limitations and one next action for independent review. Unrun checks are not passed. If interrupted, save [CHECKPOINT](../templates/CHECKPOINT.md) and resume this package. After acceptance, hand over the concrete pilot packet for owner authorization.
