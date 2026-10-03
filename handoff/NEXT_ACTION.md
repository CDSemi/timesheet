# Next action: start or resume the coordinator

**Application: WP1 accepted (independent recheck PASS at 68bbb31, digest c6e24381); WP2 next.**
**Workflow: revision v2 accepted (independent GOV audit PASS at 6578df8; see [workflow handoff](delivery/WORKFLOW_HANDOFF.md)). Governance tasks use board package GOV.**
See [STATE](delivery/STATE.json), [task board](delivery/ORCHESTRATION.json),
[checkpoint](delivery/WORKFLOW_REVISION_CHECKPOINT.md), [WP1 handoff](delivery/WP1_HANDOFF.md)
and [WP1 recheck](delivery/WP1_RECHECK.md).

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

Current route: after the WP1 accept commit, an Opus planner decomposes WP2 from the
[roadmap](../docs/09_IMPLEMENTATION_ROADMAP.md) and [WP2_IMPLEMENT](prompts/WP2_IMPLEMENT.md)
into bounded tasks (including the risks carried from [WP1_RECHECK](delivery/WP1_RECHECK.md)).
Workers implement them, the committer freezes each, a verifier runs the package-final
WP2 gate, and a fresh auditor runs [WP2_REVIEW](prompts/WP2_REVIEW.md). Only PASS
allows WP3. WP5 starts with independent acceptance; the real pilot remains
owner-controlled.

After usage reset: Resume/Continue the existing session, for example
`claude --continue` here or `claude --resume 44e3451e-da20-4a12-94bb-6b94fc5f531e`.
If unavailable, open a new session and reuse the same entry prompt. [RESUME](prompts/RESUME.md)
recovers from the board, checkpoint, task reports and git; no need to resend the business brief.

No automatic quota-reset wake-up is configured. Briefs are saved before dispatch, results
after coherent steps, and commits/pushes happen at freeze/accept points, because a hard
stop may prevent a final checkpoint. Native rewind is not the recovery plan.
