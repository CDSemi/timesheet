# WP3 independent review — PDF, sign-off and automatic submission

Operator: **ChatGPT Work/Codex, GPT-6.1 Sol, High, Standard speed**, Business subscription. Check actual availability/usage and document 08's fallback. Supply complete source, baseline/commit, HANDOFF, test evidence and these docs.

Independently review **WP3** under [AGENTS](../AGENTS.md). Communicate in Vietnamese; produce English REVIEW with a Vietnamese translation. Do not trust claimed passes without evidence, rebuild the package or reopen accepted architecture.

Read:
- [02_TIME_AND_OT_RULES](../docs/02_TIME_AND_OT_RULES.md)
- [03_ARCHITECTURE_AND_DATA](../docs/03_ARCHITECTURE_AND_DATA.md)
- [04_UX_AND_SETTINGS](../docs/04_UX_AND_SETTINGS.md)
- [05_SUBMISSION_AND_NOTIFICATIONS](../docs/05_SUBMISSION_AND_NOTIFICATIONS.md)
- [06_TEST_AND_ACCEPTANCE](../docs/06_TEST_AND_ACCEPTANCE.md)
- [09_IMPLEMENTATION_ROADMAP](../docs/09_IMPLEMENTATION_ROADMAP.md)

Focus: Inspect transaction boundaries and reviewed-hash binding. Inject crash after possible acceptance; verify no blind resend or duplicate ledger. Check no invented signed_at, image settings, Sunday totals, Unicode, GET safety and unchanged late-review zero delta.

Required gate: AC-06–AC-10 and AC-14; deadline/manual race, auto-image on/off, interrupted/uncertain send, duplicate jobs, private downloads and visual PDF evidence including both Sundays. All sending stays dry-run/capture.

Inspect repository state/handoff, trace critical behavior through actual production code and persistence, and run meaningful available checks using synthetic data/local capture. Record commands, exit status, observed outcome and blocked/unrun cases. Missing source/base or execution access means NOT VERIFIED, not a pass.

Return [REVIEW](../templates/REVIEW.md): PASS / FIX REQUIRED / NOT VERIFIED, exact reviewed baseline, prioritized findings, file/function, reproduction, expected/actual result, rule/AC ID and bounded fix. Separate observed defects from risks and optional improvements. Do not invent findings to fill a quota.

Do not modify production data, send email, change billing or implement the next package. Findings go to Claude via [FIX_FINDINGS](FIX_FINDINGS.md); otherwise identify the next roadmap action. For final acceptance distinguish software readiness, owner permission and real pilot outcome.
