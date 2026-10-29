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
   - The last pushed commit is 94accda (digest 462a1cd7).
   - What happened since 5b8b718:
     - WP5-UX5-REGATE3 failed on test and harness defects and two npm audit advisories.
     - FIX4 to FIX6 fixed them (dependency pins, tests, harness); they are frozen in
       f4049aa.
     - WP5-UX5-REGATE4 passed on f4049aa.
     - The independent audits A and B returned FIX REQUIRED:
       - one Medium: the signed footer on a narrow Review page;
       - Low findings: docs, a PDF leave line, accessibility, Day editor touch, and weak
         tests.
     - FIX7 to FIX9 fixed them, and a pre-existing keyboard gap on read-only week cards;
       they are frozen in 94accda.
   - WP5-UX5-REGATE5 failed on one criterion only: under host load, an unchanged and slow
     logo test hit its 4-minute limit in one sweep run. Everything else passed.
   - WP5-UX5-DIAG4 found why four e2e tests are slow, and proved a tests-only patch.
   - WP5-UX5-FIX10 applied that patch; the logo test now takes about 31 s instead of 2 min.
   - FIX10 is frozen in a5533b5 (digest 41477510) and pushed.
   - The scoped regate WP5-UX5-REGATE6 passed on a5533b5.
   - The area B recheck found one Low gap: after a restore, releasing a held send can still
     deliver an older copy after the correction. The old area B findings are fixed.
   - The area A recheck found one Low gap: the focus ring of a read-only week card is
     partly hidden. The old area A findings are fixed.
   - WP5-UX5-FIX11 fixed both gaps and added the missing tests; it is frozen in 0f52300
     (digest 20709d60) and pushed.
   - WP5-UX5-REGATE7 failed on one criterion only: in one sweep run, the unchanged test
     `review.spec.ts:406` read the check-card text 8 px off centre at 767 px. Alone and on
     rerun it passed. Everything else passed. It also found a missing restore test (mutant
     R3).
   - WP5-UX5-DIAG5 found a measuring race on a one-frame layout change, not a product
     fault. It proposed layout waits and the missing restore test, in five test files.
   - WP5-UX5-FIX12 applied it; it is not committed yet (digest bf7ec3f7). It found two
     older flaky tests that would fail the next regate.
   - WP5-UX5-DIAG6 found one test race and one narrow product race: a fast Escape after
     typing in the Day editor's Notes could drop the note without asking. The fix is one
     client hook and a new test.
   - WP5-UX5-FIX13 applied it. FIX12 and FIX13 are frozen in bb8d340 (digest c1691aed)
     and pushed.
   - WP5-UX5-REGATE8, a full regate on bb8d340, failed on one criterion only. In two
     simulated-clock sweeps, the unchanged mobile test `controls.spec.ts:49` read the
     768 px title-row gap as 74.8 px instead of 32. Everything else passed.
   - The same class of failure came back after DIAG5's check, which covered desktop only, so
     the diagnosis was escalated.
   - WP5-UX5-DIAG7 (timesheet-expert) found the same measuring race, which also occurs on the
     real clock. It proved a one-file test fix. Its check on both projects found two other
     older intermittent failures: the range-ladder test and the cross-tab theme test.
   - WP5-UX5-DIAG8 found both are test races, and proved test fixes. It also found that a
     tab with its menu closed no longer follows a theme chosen in another tab. That breaks a
     rule accepted in UI round 2, and a small, proven product fix restores it.
   - WP5-UX5-FIX14 applied all three fixes and passed its checks. They are frozen in bd9c275
     (digest 419ede40) and pushed.
   - WP5-UX5-REGATE9, a full regate on bd9c275, failed on one criterion only. In the sweep
     that crosses local midnight, the mobile Check in test did not see its open session.
     Everything else passed, including every earlier fix.
   - WP5-UX5-DIAG9 found the product correct: an overnight session belongs to the day it
     started. The test had read the date before midnight. 31 tests share that assumption.
     A tests-only patch fixes the check-in helper, holds each test off the local midnight
     without touching the system, and adds an integration test at the boundary.
   - WP5-UX5-FIX15 applied that patch and passed its checks. It is frozen in be2afa2 (digest
     ff73565b) and pushed.
   - WP5-UX5-REGATE10, a scoped regate on be2afa2, passed.
   - The fresh recheck of area A (WP5-UX5-RECHECK-A2) passed.
   - The fresh recheck of area B (WP5-UX5-RECHECK-B2) found one Low gap. After a restore, a
     held older send can still be released if the correction's send ended failed or
     uncertain.
   - WP5-UX5-FIX16 fixed it: a held older send now stays held for every later send of the
     period, except a cancelled one. Digest 18aa0ad0.
   - It is frozen in 1fe5ad3 (digest 18aa0ad0) and pushed.
   - WP5-UX5-REGATE11, a scoped regate on 1fe5ad3, failed on one criterion only: an import
     test timed out in one sweep while the machine was busy with about 6-7 cores of other
     work. Everything else passed.
   - WP5-UX5-DIAG10 found that the import is not slow. The test kept driving a browser tab
     that was behind, and that tab starves on a saturated machine. One other test had the
     same pattern. A tests-only fix covers both.
   - WP5-UX5-FIX17 applied it and passed its checks (digest 69c6daff).
   - It is frozen in a5cbc91 (digest 69c6daff) and pushed.
   - WP5-UX5-REGATE12, a scoped regate on a5cbc91, passed.
   - The fresh area-B recheck WP5-UX5-RECHECK-B3 passed, with no new finding.
   - The integration audit WP5-UX5-AUDIT-INT found one Low gap. On desktop, an open Day
     editor does not refresh after Check in or Check out on the page, so a note typed first
     is refused on save and has to be typed again. Everything else passed.
   - WP5-UX5-FIX18 fixed it: the editor now follows, and keeps what was typed. Digest
     6937d79c.
   - It is frozen in d96df5d (digest 6937d79c) and pushed.
   - WP5-UX5-REGATE13, a regate on d96df5d, passed.
   - The integration recheck WP5-UX5-AUDIT-INT2 closed that gap and found two more.
     - Medium, and older than these rounds: saving or deleting a session in the open Day
       editor can let a later "Save day fields" silently overwrite a change made on another
       device.
     - Low: the release digest command fails.
   - WP5-UX5-FIX19 fixed both (digest 67aa715c).
   - It is frozen in 0b45781 (digest 67aa715c) and pushed.
   - WP5-UX5-REGATE14, a regate on 0b45781, passed.
   - The integration recheck WP5-UX5-AUDIT-INT3 passed on 0b45781 / 67aa715c. Both findings
     are closed and there is no new finding. WP5 is re-accepted after rounds 4 and 5 on the
     board.
   - Optional risks were recorded for the WP5 handoff. One of them is for the owner to
     decide, best before the pilot (R-UX5I2-3): a calendar default has no version, so a
     holiday imported while a Day editor is open can be saved as "Worked".
   - The release notes (docs/12) and the README still describe rounds 4 and 5, and even
     WP4, as not accepted. Both files count in the digest.
   - WP5-UX5-RELNOTES refreshed those two files and their translations (digest 2072e3f2).
     It also found that the PDF code and the mail library changed after the pilot samples
     were made.
   - Running now: its freeze, WP5-UX5-RELNOTES-FREEZE.
   - Then:
     - a scoped regate (WP5-UX5-REGATE15), which also makes the pilot samples again from
       the release;
     - a fresh audit (WP5-UX5-AUDIT-RN);
     - ACCEPT-DOCS, which puts the new identity in the pilot packet and the WP5 handoff;
     - the WP5-UX5-ACCEPT commit.
   - To resume after an interruption, use the entry prompt above. The coordinator continues
     at the board's `next_task_id`.
   - Details: the [checkpoint](delivery/WORKFLOW_REVISION_CHECKPOINT.md), section
     "REGATE3 failed; two diagnoses run (2026-10-26)" and the sections after it.
   - Until the accept commit, the pilot packet still names 8e55710 / 507de97c. Do not use
     that identity for the pilot.
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
