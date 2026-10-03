# WP5 independent review — Independent acceptance and pilot

Operator: fresh independent audit subagent under the coordinator; profile/model/effort by document 08. Optional ChatGPT/Codex review is equally valid. Supply complete current source, baseline/digest, HANDOFF and evidence. The auditor must not have authored the reviewed change.

Independently review **WP5** under [AGENTS](../../AGENTS.md). Communicate in Vietnamese; produce English REVIEW with a Vietnamese translation. Do not trust claimed passes without evidence, rebuild the package or reopen accepted architecture.

Read:
- [02_TIME_AND_OT_RULES](../../docs/02_TIME_AND_OT_RULES.md)
- [05_SUBMISSION_AND_NOTIFICATIONS](../../docs/05_SUBMISSION_AND_NOTIFICATIONS.md)
- [06_TEST_AND_ACCEPTANCE](../../docs/06_TEST_AND_ACCEPTANCE.md)
- [07_DEPLOYMENT_AND_OPERATIONS](../../docs/07_DEPLOYMENT_AND_OPERATIONS.md)
- [09_IMPLEMENTATION_ROADMAP](../../docs/09_IMPLEMENTATION_ROADMAP.md)

Focus: Run the integrated two-week workflow, correction, partial approved OT use, second-user isolation and overdue/restart path. Inspect prior evidence rather than trusting summaries. Produce prioritized findings and concrete pilot readiness; do not redesign or claim real receipt without evidence.

Required gate: AC-13 plus every unresolved required gate; complete reproducible release, verified restore, no blocking integrity/privacy/submission defect. Separate software readiness from owner authorization and actual production pilot outcome.

Inspect repository state/handoff, trace critical behavior through actual production code and persistence, and run meaningful available checks using synthetic data/local capture. Record commands, exit status, observed outcome and blocked/unrun cases. Missing source/base or execution access means NOT VERIFIED, not a pass.

Return [REVIEW](../templates/REVIEW.md): PASS / FIX REQUIRED / NOT VERIFIED, exact reviewed baseline, prioritized findings, file/function, reproduction, expected/actual result, rule/AC ID and bounded fix. Separate observed defects from risks and optional improvements. Do not invent findings to fill a quota.

Do not modify production data, send email, change billing or implement the next package. Findings go to the coordinator for bounded worker fixes via [FIX_FINDINGS](FIX_FINDINGS.md); otherwise identify the next roadmap action. For final acceptance distinguish software readiness, owner permission and real pilot outcome.

Audit boundary: freeze source; record digest before/after and reviewer/author separation. Independently execute mandatory gates. Write only assigned new review/evidence paths; preserve earlier reports and never fix audited source.
