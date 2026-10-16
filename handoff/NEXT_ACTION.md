# Next action: start or resume the coordinator

**Application status:**
- WP1 accepted (68bbb31, digest c6e24381).
- WP2 accepted (5fafeae, digest e61fa914).
- WP3 accepted: WP3-REGATE3 PASS and final independent rechecks WP3-RECHECK-A
  attempt 3 and WP3-RECHECK-BC3 PASS at 49651c8, digest c31c300c.
- WP4 accepted: WP4-REGATE4 PASS and final independent rechecks WP4-RECHECK-A
  attempt 4 and WP4-RECHECK-B4 PASS at 546cdda, digest 26fcc969.
- WP5 accepted (software readiness), re-accepted after the owner-requested UI change
  round 2: WP5-UX2-REGATE2 PASS and the final independent recheck WP5-UX2-AUDIT2 PASS at
  a643794, digest 229df806 (earlier acceptances: 90b98ef / 57e2974c after round 1, and
  014bd47 / 150420e7).
- UI change round (owner request 2026-10-08, done): the Timesheet page now follows the
  sample Excel timesheet layout, with a friendlier shell, on desktop and phone (plan and
  mockup: task WP5-UX-PLAN, `handoff/delivery/design/WP5-UX/mockup.html`). The owner
  accepted E-1..E-7 as recommended and answered WP5-UX-Q1 and WP5-UX-Q2 with (a). Slices
  T01..T06 and fix rounds FIX1..FIX10 (accessibility WCAG 2.2 AA, phone layout, and
  calendar-independent e2e tests) changed the client UI and tests only; no server or
  business change. Optional backlog for the pilot fix round: see the
  [WP5 handoff](delivery/WP5_HANDOFF.md).
- UI change round 2 (owner requests 2026-10-14, done): the day open in the Day editor is
  highlighted; the Label picker selection is lighter; a Light/Dark theme control; clearer
  hover and pressed looks; Today and Current period buttons; Show details as a switch; the
  C&D logo and two-line wordmark; check in/out in the phone top bar; one-row phone period
  buttons ("Sign off" when narrow); "Check in/out" wording; "Due" as a label; an arrow in
  period ranges; no company line on the on-screen sheet (the PDF keeps it). Slices T01..T10
  and fix rounds FIX1..FIX2; client UI, tests and docs, plus three server error-message
  texts; no business change. Optional owner question WP5-UX2-Q3 (the "future" badge on the
  period Today opens in the five window days; default: keep) and optional backlog: see the
  [WP5 handoff](delivery/WP5_HANDOFF.md).
- UI change round 3 (owner requests 2026-10-15, running): a modern style instead of the
  industrial one, a top-bar identity menu, header and period-bar layout, lifted sheet
  selections, and a Day editor with a separate session dialog and a simpler break area
  (27 items, verbatim on the board). The plan WP5-UX3-PLAN is done (mockup
  `handoff/delivery/design/WP5-UX3/mockup.html`); slice T06 (break-row model) is frozen at
  5c8355d. The owner answered G-1..G-5 (G-1 b with changes); the addendum WP5-UX3-PLAN2
  updated the mockup (floating editor below 1360px, square week sheets, phone break chips,
  the "in progress" pill). The governance change of the AGENTS.md UI section is accepted
  (WP5-UX3-GOV-AUDIT PASS at 79b9a53, [GOV UX3 review](delivery/GOV_UX3_REVIEW.md)). Next:
  slices T01..T10, each with a freeze, then the gate and independent audits. Optional owner question WP5-UX3-Q6
  (phone break rows or chips; board `pending_owner_question_4`) blocks only T08B.
- Pilot: the concrete [pilot packet](delivery/WP5_PILOT_PACKET.md) is ready for owner
  review (release identity a643794 / 229df806). Owner permission has not been requested,
  there is no pilot result, and the NAS is NOT VERIFIED.

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
1. **Done: WP5 accepted, then re-accepted after each UI change round.** The first
   acceptance record was committed at dd0c7d1; the re-acceptances on 90b98ef / 57e2974c
   (WP5-UX-AUDIT-AB9) and on a643794 / 229df806 (WP5-UX2-AUDIT2) are in the
   [WP5 handoff](delivery/WP5_HANDOFF.md).
2. **Done: GOV-RECOVERY.** `check_recovery.py` no longer inherits the live mission
   status (fix frozen at 7f750e9, gate PASS,
   [GOV recovery review](delivery/GOV_RECOVERY_REVIEW.md) PASS). The board records the
   mission as `software_ready`.
3. **Done: UI change round 2 (WP5-UX2).** Re-accepted on a643794 / 229df806 (gate
   WP5-UX2-REGATE2, audit WP5-UX2-AUDIT2 PASS); the pilot packet identity is refreshed.
4. **Next, owner: review the pilot.** Read the
   [pilot packet](delivery/WP5_PILOT_PACKET.md) and answer D-1..D-15 (and, optionally,
   WP5-UX2-Q3).
   - D-1, D-7, D-8 and D-13 are needed before activation.
   - An answer that differs from the current default causes a fix round (fix, freeze,
     gate, independent audit) before activation.
   - Run the owner NAS steps in docs/11 and the target restore form.
   - Real sending, deployment and activation happen only after the owner's explicit
     authorization. Then resume the coordinator with the entry prompt above.

After usage reset: Resume/Continue the existing session, for example
`claude --continue` here or `claude --resume b5de56d1-fb31-4dc5-b74f-70e9473e1a0a`.
If unavailable, open a new session and reuse the same entry prompt. [RESUME](prompts/RESUME.md)
recovers from the board, checkpoint, task reports and git; no need to resend the business brief.

No automatic quota-reset wake-up is configured. Briefs are saved before dispatch, results
after coherent steps, and commits/pushes happen at freeze/accept points, because a hard
stop may prevent a final checkpoint. Native rewind is not the recovery plan.
