# WP1 independent review — Foundation and time calculation

Operator: fresh independent audit subagent under the coordinator; profile/model/effort by document 08. Optional ChatGPT/Codex review is equally valid. Supply complete current source, baseline/digest, HANDOFF and evidence. The auditor must not have authored the reviewed change.

Independently review **WP1** under [AGENTS](../../AGENTS.md). Communicate in Vietnamese; produce English REVIEW with a Vietnamese translation. Do not trust claimed passes without evidence, rebuild the package or reopen accepted architecture.

Read:
- [01_PRODUCT_REQUIREMENTS](../../docs/01_PRODUCT_REQUIREMENTS.md)
- [02_TIME_AND_OT_RULES](../../docs/02_TIME_AND_OT_RULES.md)
- [03_ARCHITECTURE_AND_DATA](../../docs/03_ARCHITECTURE_AND_DATA.md)
- [06_TEST_AND_ACCEPTANCE](../../docs/06_TEST_AND_ACCEPTANCE.md)
- [09_IMPLEMENTATION_ROADMAP](../../docs/09_IMPLEMENTATION_ROADMAP.md)

Focus: Independently recompute excess 30/31, 45/46, 75/76; off-day 15/16; flexible arrival; multiple sessions; midnight/DST. Trace production engine calls, ownership, versioning and reason enforcement.

Required gate: Type check/build, fresh SQLite migration tests, all time/OT fixtures, two-user isolation on implemented endpoints. Explicitly verify 09:00–18:00, N/M boundaries, off-day minutes, DST, seconds aggregation and mixed overnight shifts.

Inspect repository state/handoff, trace critical behavior through actual production code and persistence, and run meaningful available checks using synthetic data/local capture. Record commands, exit status, observed outcome and blocked/unrun cases. Missing source/base or execution access means NOT VERIFIED, not a pass.

Return [REVIEW](../templates/REVIEW.md): PASS / FIX REQUIRED / NOT VERIFIED, exact reviewed baseline, prioritized findings, file/function, reproduction, expected/actual result, rule/AC ID and bounded fix. Separate observed defects from risks and optional improvements. Do not invent findings to fill a quota.

Do not modify production data, send email, change billing or implement the next package. Findings go to the coordinator for bounded worker fixes via [FIX_FINDINGS](FIX_FINDINGS.md); otherwise identify the next roadmap action. For final acceptance distinguish software readiness, owner permission and real pilot outcome.

Audit boundary: freeze source; record digest before/after and reviewer/author separation. Independently execute mandatory gates. Write only assigned new review/evidence paths; preserve earlier reports and never fix audited source.
