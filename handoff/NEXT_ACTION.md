# Next action: start or resume the coordinator

**Application: WP1 accepted (68bbb31, digest c6e24381). WP2 accepted (WP2-GATE4 PASS and final independent audits WP2-AUDIT-A2 attempt 3 and WP2-AUDIT-B4 PASS at 5fafeae, digest e61fa914); WP3 next.**
**Workflow: revision v2 accepted (independent GOV audit PASS at 6578df8; see [workflow handoff](delivery/WORKFLOW_HANDOFF.md)). Governance tasks use board package GOV.**
See [STATE](delivery/STATE.json), [task board](delivery/ORCHESTRATION.json),
[checkpoint](delivery/WORKFLOW_REVISION_CHECKPOINT.md), [WP2 handoff](delivery/WP2_HANDOFF.md),
[WP2 recheck A4](delivery/WP2_RECHECK_A4.md) and [WP2 recheck B4](delivery/WP2_RECHECK_B4.md).

Open this repository in Claude Code with subscription sign-in. Project configuration
selects the coordinator; [document 08](../docs/08_AI_WORKFLOW_AND_BUDGET.md) defines
routing (profile = role + effort, model chosen per dispatch) and the commit/push policy.
Restart only if a new or edited profile is not recognized.

Paste once:

~~~text
Read CLAUDE.md, AGENTS.md and handoff/prompts/ORCHESTRATE.md.
Coordinate the saved Timesheet mission through WP1–WP5 software readiness
and a concrete pilot packet. Delegate planning, diagnosis, implementation,
fixes, verification, independent audit and commits to subagents; route
model/effort by the document 08 rubric. The main agent only coordinates and
saves durable progress. Resume incomplete tasks without restarting accepted
work. Communicate in Vietnamese. Preserve unrelated work, use synthetic data
and dry-run. Commit and push only through timesheet-committer per document 08
(directly on main until the first release). Stop before real sending/deployment;
request owner authorization only after preparing the concrete pilot packet.
Do not change billing or permission settings.
~~~

Current route: after the WP2 accept commit, an Opus planner decomposes WP3 from the
[roadmap](../docs/09_IMPLEMENTATION_ROADMAP.md) and [WP3_IMPLEMENT](prompts/WP3_IMPLEMENT.md)
into bounded tasks, including the carry-forward items in [WP2_HANDOFF](delivery/WP2_HANDOFF.md)
(the pending CorrectionResult/DeficitDebitResult variant, dropping provisional minutes at
finalization, revision-specific correction keys). Workers implement them, the committer
freezes each, a verifier runs the package-final WP3 gate, and fresh auditors run
[WP3_REVIEW](prompts/WP3_REVIEW.md). Only PASS allows WP4. WP5 starts with independent
acceptance; the real pilot remains owner-controlled.

After usage reset: Resume/Continue the existing session, for example
`claude --continue` here or `claude --resume 44e3451e-da20-4a12-94bb-6b94fc5f531e`.
If unavailable, open a new session and reuse the same entry prompt. [RESUME](prompts/RESUME.md)
recovers from the board, checkpoint, task reports and git; no need to resend the business brief.

No automatic quota-reset wake-up is configured. Briefs are saved before dispatch, results
after coherent steps, and commits/pushes happen at freeze/accept points, because a hard
stop may prevent a final checkpoint. Native rewind is not the recovery plan.
