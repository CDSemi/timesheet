# WP4 independent review — Docker, import and recovery

Operator: **ChatGPT Work/Codex, GPT-6.1 Sol, High, Standard speed**, Business subscription. Check actual availability/usage and document 08's fallback. Supply complete source, baseline/commit, HANDOFF, test evidence and these docs.

Independently review **WP4** under [AGENTS](../../AGENTS.md). Communicate in Vietnamese; produce English REVIEW with a Vietnamese translation. Do not trust claimed passes without evidence, rebuild the package or reopen accepted architecture.

Read:
- [03_ARCHITECTURE_AND_DATA](../../docs/03_ARCHITECTURE_AND_DATA.md)
- [05_SUBMISSION_AND_NOTIFICATIONS](../../docs/05_SUBMISSION_AND_NOTIFICATIONS.md)
- [06_TEST_AND_ACCEPTANCE](../../docs/06_TEST_AND_ACCEPTANCE.md)
- [07_DEPLOYMENT_AND_OPERATIONS](../../docs/07_DEPLOYMENT_AND_OPERATIONS.md)
- [09_IMPLEMENTATION_ROADMAP](../../docs/09_IMPLEMENTATION_ROADMAP.md)

Focus: Inspect actual volume/permission/secret boundaries, WAL-consistent backup, migration compatibility and restore isolation. Verify formula/TODAY/blank history does not become authoritative balance/sign-off/sent state; imported periods never auto-send.

Required gate: AC-11/12/15: clean install, migrations, restart persistence, backup under writes, isolated restore with file hashes/balances, identical re-import no-op and outbound paused after restore.

Inspect repository state/handoff, trace critical behavior through actual production code and persistence, and run meaningful available checks using synthetic data/local capture. Record commands, exit status, observed outcome and blocked/unrun cases. Missing source/base or execution access means NOT VERIFIED, not a pass.

Return [REVIEW](../templates/REVIEW.md): PASS / FIX REQUIRED / NOT VERIFIED, exact reviewed baseline, prioritized findings, file/function, reproduction, expected/actual result, rule/AC ID and bounded fix. Separate observed defects from risks and optional improvements. Do not invent findings to fill a quota.

Do not modify production data, send email, change billing or implement the next package. Findings go to Claude via [FIX_FINDINGS](FIX_FINDINGS.md); otherwise identify the next roadmap action. For final acceptance distinguish software readiness, owner permission and real pilot outcome.
