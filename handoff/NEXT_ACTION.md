# Next action: start or resume the coordinator

**Application: WP1 FIX REQUIRED; F-01 unresolved; WP2 not started.**
This workflow redesign does not fix the application. See [STATE](delivery/STATE.json),
[task board](delivery/ORCHESTRATION.json), [WP1 handoff](delivery/WP1_HANDOFF.md),
[WP1 review](delivery/WP1_REVIEW.md) and [workflow handoff](delivery/ORCHESTRATION_HANDOFF.md).

Open this repository in Claude Code with subscription sign-in. Project configuration
selects coordinator/task profiles; [document 08](../docs/08_AI_WORKFLOW_AND_BUDGET.md)
defines supported fallbacks. Restart an old session if the new agents directory is not loaded.

Paste once:

~~~text
Read CLAUDE.md, AGENTS.md and handoff/prompts/ORCHESTRATE.md.
Coordinate the saved Timesheet mission through WP1–WP5 software readiness
and a concrete pilot packet. Delegate planning, diagnosis, implementation,
fixes, verification and independent audit to subagents; choose supported
model/effort by task complexity. The main agent only coordinates and saves
durable progress. Resume incomplete tasks without restarting accepted work.
Communicate in Vietnamese. Preserve unrelated work, use synthetic data and
dry-run, and leave changes uncommitted. Stop before real sending/deployment;
request owner authorization only after preparing the concrete pilot packet.
Do not change billing.
~~~

Current route: planner confirms the bounded F-01 fix, worker runs
[FIX_FINDINGS](prompts/FIX_FINDINGS.md), verifier runs the WP1 gate, fresh auditor runs
[WP1_REVIEW](prompts/WP1_REVIEW.md) on new source. Only PASS allows WP2. Coordinator
then advances through the [roadmap](../docs/09_IMPLEMENTATION_ROADMAP.md) without manual
vendor handoffs. WP5 starts with independent acceptance; real pilot remains owner-controlled.

After usage reset: Resume/Continue the existing session, for example
`claude --continue` here or `claude --resume <session-id>` for the recorded session.
If unavailable, open a new session and reuse the same entry prompt. [RESUME](prompts/RESUME.md)
recovers from saved state/task reports/checkout; no need to resend the business brief.

No automatic quota-reset wake-up is configured. Save briefs before dispatch and results
after coherent steps because a hard stop may prevent a final checkpoint. Native rewind
is not the recovery plan. Preserve source/evidence; never re-extract the old package.
