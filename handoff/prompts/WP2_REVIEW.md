# WP2 independent review — Personal workspace and OT ledger

Operator: **ChatGPT Work/Codex, GPT-6.1 Sol, Medium, Standard speed**, Business subscription. Check actual availability/usage and document 08's fallback. Supply complete source, baseline/commit, HANDOFF, test evidence and these docs.

Independently review **WP2** under [AGENTS](../../AGENTS.md). Communicate in Vietnamese; produce English REVIEW with a Vietnamese translation. Do not trust claimed passes without evidence, rebuild the package or reopen accepted architecture.

Read:
- [02_TIME_AND_OT_RULES](../../docs/02_TIME_AND_OT_RULES.md)
- [03_ARCHITECTURE_AND_DATA](../../docs/03_ARCHITECTURE_AND_DATA.md)
- [04_UX_AND_SETTINGS](../../docs/04_UX_AND_SETTINGS.md)
- [06_TEST_AND_ACCEPTANCE](../../docs/06_TEST_AND_ACCEPTANCE.md)
- [09_IMPLEMENTATION_ROADMAP](../../docs/09_IMPLEMENTATION_ROADMAP.md)

Focus: Trace raw/provisional/posted/reserved/available amounts. Verify 480-minute leave conversion, no label-triggered spend, no double reservation/consumption, correction differences, reasons and preserved manual holiday overrides.

Required gate: Core browser flows; AC-01/03/04/05 for implemented services; concurrent reservations; partial leave; correction deltas; safe evidence export; admin is not blanket private-data access.

Inspect repository state/handoff, trace critical behavior through actual production code and persistence, and run meaningful available checks using synthetic data/local capture. Record commands, exit status, observed outcome and blocked/unrun cases. Missing source/base or execution access means NOT VERIFIED, not a pass.

Return [REVIEW](../templates/REVIEW.md): PASS / FIX REQUIRED / NOT VERIFIED, exact reviewed baseline, prioritized findings, file/function, reproduction, expected/actual result, rule/AC ID and bounded fix. Separate observed defects from risks and optional improvements. Do not invent findings to fill a quota.

Do not modify production data, send email, change billing or implement the next package. Findings go to Claude via [FIX_FINDINGS](FIX_FINDINGS.md); otherwise identify the next roadmap action. For final acceptance distinguish software readiness, owner permission and real pilot outcome.
