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
- UI change round (owner request 2026-10-08): the plan and a static mockup are ready
  (task WP5-UX-PLAN; `handoff/delivery/design/WP5-UX/mockup.html`). The owner accepted
  E-1..E-7 as recommended (2026-10-08) and answered WP5-UX-Q1 with (a) (2026-10-09).
  Implementation T01..T06 and fixes FIX1..FIX6 are frozen (last source commit 5e104e1,
  digest 07c3ca00); WP5-UX-REGATE4 PASS; area A re-audit PASS (WP5-UX-AUDIT-A5). Area B
  (WP5-UX-AUDIT-B5) reports three keyboard-accessibility items: B5-01 sticky bars hide
  the focused control on Shift+Tab, B5-02 the label-picker keyboard position is a 1.14:1
  tint, B5-03 the editor dialog is a focus stop without indicator. **Owner question
  WP5-UX-Q2** (board `pending_owner_question_2`): (a, recommended) one complete
  accessibility sweep, then one fix round for everything, then regate and recheck;
  (b) fix only B5-01..B5-03; (c) pilot on this UI with the items as recorded backlog
  (no formal WP5 re-acceptance yet); (d) pilot on the last accepted snapshot 014bd47.

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
1. **Done: WP5 accepted.** The [WP5 handoff](delivery/WP5_HANDOFF.md) acceptance
   record was committed at dd0c7d1, with no source change.
2. **Done: GOV-RECOVERY.** `check_recovery.py` no longer inherits the live mission
   status (fix frozen at 7f750e9, gate PASS,
   [GOV recovery review](delivery/GOV_RECOVERY_REVIEW.md) PASS). The board records the
   mission as `software_ready`.
3. **Next, owner: review the pilot.** Read the
   [pilot packet](delivery/WP5_PILOT_PACKET.md) and answer D-1..D-15.
   - D-1, D-7, D-8 and D-13 are needed before activation.
   - An answer that differs from the current default causes a fix round (fix, freeze,
     gate, independent audit) before activation.
   - Run the owner NAS steps in docs/11 and the target restore form.
   - Real sending, deployment and activation happen only after the owner's explicit
     authorization. Then resume the coordinator with the entry prompt above.

After usage reset: Resume/Continue the existing session, for example
`claude --continue` here or `claude --resume 44e3451e-da20-4a12-94bb-6b94fc5f531e`.
If unavailable, open a new session and reuse the same entry prompt. [RESUME](prompts/RESUME.md)
recovers from the board, checkpoint, task reports and git; no need to resend the business brief.

No automatic quota-reset wake-up is configured. Briefs are saved before dispatch, results
after coherent steps, and commits/pushes happen at freeze/accept points, because a hard
stop may prevent a final checkpoint. Native rewind is not the recovery plan.
