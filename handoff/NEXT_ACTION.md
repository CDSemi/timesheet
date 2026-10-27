# Next action: start or resume the coordinator

**Application status:**
- WP1 accepted (68bbb31, digest c6e24381).
- WP2 accepted (5fafeae, digest e61fa914).
- WP3 accepted: WP3-REGATE3 PASS and final independent rechecks WP3-RECHECK-A
  attempt 3 and WP3-RECHECK-BC3 PASS at 49651c8, digest c31c300c.
- WP4 accepted: WP4-REGATE4 PASS and final independent rechecks WP4-RECHECK-A
  attempt 4 and WP4-RECHECK-B4 PASS at 546cdda, digest 26fcc969.
- WP5 accepted (software readiness), re-accepted after the owner-requested UI change
  round 3: WP5-UX3-REGATE5 PASS and the final independent audit WP5-UX3-AUDIT-INT PASS at
  8e55710, digest 507de97c. Earlier acceptances: a643794 / 229df806 after round 2,
  90b98ef / 57e2974c after round 1, and 014bd47 / 150420e7.
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
  texts; no business change. Optional backlog: see the
  [WP5 handoff](delivery/WP5_HANDOFF.md). The optional question WP5-UX2-Q3 is superseded by
  the round-3 answer G-5 (b).
- UI change round 3 (owner requests 2026-10-15, done 2026-10-19):
  - What changed:
    - a modern style instead of the industrial one;
    - a top-bar identity menu (Profile, Settings with Administration, Sign out);
    - header and period-bar layout with old/current/in-progress/future pills;
    - lifted sheet selections;
    - a floating Day editor below 1360px;
    - a separate session dialog with break rows, or chips on phones;
    - pre-filled defaults and suggested breaks for past days;
    - the no-breaks notice and a final save confirmation.
  - Owner answers: G-1..G-5, N-1, N-2, Q6 (b), 24-hour chips, and Q7 (a, the owner's
    AGENTS.md header).
  - Work done: the plans WP5-UX3-PLAN and PLAN2; slices T01..T10 with T05B, T06 and T08B;
    fix rounds FIX1..FIX6; and the governance changes GOV (79b9a53) and GOV2 (ceb86b6).
  - Scope: client UI, tests and docs. dist/server and dist/domain are byte-identical to
    a643794; no business change.
  - Final review: [WP5 UX3 integration review](delivery/WP5_UX3_REVIEW_INT.md).
  - Optional backlog: see the [WP5 handoff](delivery/WP5_HANDOFF.md).
- Pilot: the concrete [pilot packet](delivery/WP5_PILOT_PACKET.md) is ready for owner
  review (release identity 8e55710 / 507de97c). Owner permission has not been requested,
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
0. **In progress (resumed 2026-10-26 after the 2026-10-23 usage pause): UI change rounds 4
   and 5.**
   - The last pushed commit is 5b8b718 (digest edcca194). FIX1, FIX2 and FIX3 are frozen,
     and the owner's Ingat track was merged in (b8bae50).
   - WP5-UX5-REGATE3 (attempt 2) failed:
     - two sweep assertion failures: Today at the LA midnight crossing, and a review row
       alignment;
     - recurring ECONNRESET;
     - two new npm audit advisories (nodemailer, zod).
   - The diagnoses are done:
     - the two sweep failures are test defects;
     - the resets are a harness defect;
     - no product fault was found.
   - WP5-UX5-FIX4 pinned nodemailer 10.1.4 and zod 4.6.6. It is not committed yet.
   - WP5-UX5-FIX5 (tests and harness only) is done and not committed yet.
   - WP5-UX5-DIAG3 is done. Under host load, too many parallel test workers cause the
     timeouts; the smoke reset is the same keep-alive defect. No product fault.
   - WP5-UX5-FIX6 (harness and test configuration only) is done and not committed yet.
   - Running now: WP5-UX5-FIX6-FREEZE, one commit of FIX4 to FIX6 and the records, then a
     push.
   - Then REGATE4, audits A and B, the integration audit, ACCEPT-DOCS and the WP5
     re-accept.
   - Details: the checkpoint, section "REGATE3 failed; two diagnoses run (2026-10-26)".
   - Earlier the same day it was paused twice for machine restarts.
   - Every slice of both rounds is frozen. The last commit is 2bce0ab (digest 70975091).
   - The round-5 gate failed and FIX1 fixed it. The regate then failed on one test race;
     WP5-UX5-DIAG1 classified it as a test defect.
   - WP5-UX5-FIX2 (tests only) was interrupted.
   - Resume with the entry prompt below. The coordinator continues at the board's
     `next_task_id` (WP5-UX5-FIX2, attempt 2). Then come its freeze, WP5-UX5-REGATE2,
     audits A and B, the integration audit, ACCEPT-DOCS and the WP5 re-accept.
   - Details: the [checkpoint](delivery/WORKFLOW_REVISION_CHECKPOINT.md), section
     "Paused for restart (2026-10-22)".
   - Until the re-accept, the last accepted snapshot stays 8e55710 / 507de97c.
1. **Done: WP5 accepted, then re-accepted after each UI change round.** The first
   acceptance record was committed at dd0c7d1. The re-acceptances are in the
   [WP5 handoff](delivery/WP5_HANDOFF.md):
   - 90b98ef / 57e2974c (WP5-UX-AUDIT-AB9);
   - a643794 / 229df806 (WP5-UX2-AUDIT2);
   - 8e55710 / 507de97c (WP5-UX3-AUDIT-INT).
2. **Done: GOV-RECOVERY.** `check_recovery.py` no longer inherits the live mission
   status (fix frozen at 7f750e9, gate PASS,
   [GOV recovery review](delivery/GOV_RECOVERY_REVIEW.md) PASS). The board records the
   mission as `software_ready`.
3. **Done: UI change rounds 2 and 3.**
   - WP5-UX2: re-accepted on a643794 / 229df806.
   - WP5-UX3: re-accepted on 8e55710 / 507de97c (gate WP5-UX3-REGATE5, audit
     WP5-UX3-AUDIT-INT PASS). The pilot packet identity is refreshed.
4. **Next, owner: review the pilot.** Read the
   [pilot packet](delivery/WP5_PILOT_PACKET.md) and answer D-1..D-15.
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
