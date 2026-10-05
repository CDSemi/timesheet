# Next action: start or resume the coordinator

**Application status:**
- WP1 accepted (68bbb31, digest c6e24381).
- WP2 accepted (5fafeae, digest e61fa914).
- WP3 accepted: WP3-REGATE3 PASS and final independent rechecks WP3-RECHECK-A
  attempt 3 and WP3-RECHECK-BC3 PASS at 49651c8, digest c31c300c.
- Next: the GOV-SKILL cycle for the owner's `readme-md` skill, then WP4.

**Workflow: revision v2 accepted (independent GOV audit PASS at 6578df8; see [workflow handoff](delivery/WORKFLOW_HANDOFF.md)). Governance tasks use board package GOV.**
See [STATE](delivery/STATE.json), [task board](delivery/ORCHESTRATION.json),
[checkpoint](delivery/WORKFLOW_REVISION_CHECKPOINT.md), [WP3 handoff](delivery/WP3_HANDOFF.md),
[WP3 recheck A3](delivery/WP3_RECHECK_A3.md) and [WP3 recheck BC3](delivery/WP3_RECHECK_BC3.md).

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

Current route:
1. **GOV-SKILL cycle.** After the WP3 accept commit, the owner's skill
   `.claude/skills/readme-md/` goes through freeze, verifier gate and a fresh audit
   (owner decision H-Q3 (a)).
2. **WP4 planning.** The board then switches to WP4. An Opus planner decomposes WP4 from
   the [roadmap](../docs/09_IMPLEMENTATION_ROADMAP.md) and
   [WP4_IMPLEMENT](prompts/WP4_IMPLEMENT.md) into bounded tasks. These include the
   carry-forward items in [WP3_HANDOFF](delivery/WP3_HANDOFF.md), in particular the
   recorded "through a share" marker that is needed before any import writes another
   person's rows.
3. **WP4 delivery.** Workers implement, the committer freezes each task, a verifier
   runs the package-final WP4 gate, and fresh auditors run
   [WP4_REVIEW](prompts/WP4_REVIEW.md).
4. **WP5.** WP5 starts with independent acceptance. The real pilot remains
   owner-controlled.

After usage reset: Resume/Continue the existing session, for example
`claude --continue` here or `claude --resume 44e3451e-da20-4a12-94bb-6b94fc5f531e`.
If unavailable, open a new session and reuse the same entry prompt. [RESUME](prompts/RESUME.md)
recovers from the board, checkpoint, task reports and git; no need to resend the business brief.

No automatic quota-reset wake-up is configured. Briefs are saved before dispatch, results
after coherent steps, and commits/pushes happen at freeze/accept points, because a hard
stop may prevent a final checkpoint. Native rewind is not the recovery plan.
