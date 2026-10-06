# Next action: start or resume the coordinator

**Application status:**
- WP1 accepted (68bbb31, digest c6e24381).
- WP2 accepted (5fafeae, digest e61fa914).
- WP3 accepted: WP3-REGATE3 PASS and final independent rechecks WP3-RECHECK-A
  attempt 3 and WP3-RECHECK-BC3 PASS at 49651c8, digest c31c300c.
- WP4 accepted: WP4-REGATE4 PASS and final independent rechecks WP4-RECHECK-A
  attempt 4 and WP4-RECHECK-B4 PASS at 546cdda, digest 26fcc969.
- WP5 accepted (software readiness): WP5-REGATE and WP5-REGATE2 PASS, and the closing
  independent recheck WP5-RECHECK PASS at 014bd47, digest 150420e7.
- Pilot: the concrete [pilot packet](delivery/WP5_PILOT_PACKET.md) is ready for owner
  review. Owner permission has not been requested, there is no pilot result, and the
  NAS is NOT VERIFIED.

**Workflow: revision v2 accepted (independent GOV audit PASS at 6578df8; see [workflow handoff](delivery/WORKFLOW_HANDOFF.md)). Governance tasks use board package GOV.**
See [STATE](delivery/STATE.json), [task board](delivery/ORCHESTRATION.json),
[checkpoint](delivery/WORKFLOW_REVISION_CHECKPOINT.md), [WP5 handoff](delivery/WP5_HANDOFF.md),
[WP5 recheck](delivery/WP5_RECHECK.md) and [pilot packet](delivery/WP5_PILOT_PACKET.md).

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
1. **WP5 acceptance record and commit.** WP5-ACCREC fills the
   [WP5 handoff](delivery/WP5_HANDOFF.md), and WP5-ACCEPT commits it with no source
   change.
2. **GOV-RECOVERY.** This governance fix makes the `check_recovery.py` synthetic
   boards independent of the live mission status. It is needed before the board
   records the mission as `software_ready`. It goes through fix, freeze, gate and a
   fresh GOV audit.
3. **Owner review of the pilot.** The owner reads the pilot packet and answers
   D-1..D-15. D-1, D-7, D-8 and D-13 are needed before activation. An answer that
   differs from the current default causes a fix round before activation. Real
   sending, deployment and activation happen only after the owner's explicit
   authorization.

After usage reset: Resume/Continue the existing session, for example
`claude --continue` here or `claude --resume 44e3451e-da20-4a12-94bb-6b94fc5f531e`.
If unavailable, open a new session and reuse the same entry prompt. [RESUME](prompts/RESUME.md)
recovers from the board, checkpoint, task reports and git; no need to resend the business brief.

No automatic quota-reset wake-up is configured. Briefs are saved before dispatch, results
after coherent steps, and commits/pushes happen at freeze/accept points, because a hard
stop may prevent a final checkpoint. Native rewind is not the recovery plan.
