# WP5-UX3-AUDIT-B dispatch brief (area B: break entry integrity and dialogs)

- Mission/task: timesheet-software-readiness / WP5-UX3-AUDIT-B; package WP5; kind audit;
  attempt 1; depends on WP5-UX3-GATE (PASS required); fresh context. Runs in parallel with
  the read-only WP5-UX3-AUDIT-A (other ports, other folders).
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size L,
  risk H (break entry feeds worked minutes and OT credit), novelty yes. Task record in
  English; review pair `handoff/delivery/WP5_UX3_REVIEW_B.md` and `.vi.md` (REVIEW template
  in `handoff/templates/`).
- Author separation: you did not write any WP5-UX3 task (their agent IDs are on the board).
  Treat every worker, planner and verifier report as a claim.
- Target: `reviewed_commit` = TARGET_SHA = cecfceb61c7f15216c8f188e8b7059c9f075247d (the
  WP5-UX3-T10-FREEZE commit) with the gate digest TARGET_DIGEST =
  29ac25945fbefa0c86f28aa9c8537e6d2ccd341a161ab70bc7bfc0acf3ff15e7 (833 files). Record HEAD, the digest before and after (three forms as the gate did) and
  `reviewed_commit`. Any change outside `handoff/` invalidates the audit; run on a clean
  export or a scratch clone at TARGET_SHA if the working tree is not clean outside
  `handoff/`.
- **AGENTS.md on disk wins** (rule 7: UTC instants, accounting dates and the saved reporting
  zone are different values; rule 8: user-confirmed requirements outrank inherited rules,
  but the canonical rule must be updated, not ignored).

## Read

- AGENTS.md (from disk), docs/08 "Gates and independent audit".
- The owner's words: board `owner_decisions` of 2026-10-15/16 (U-21..U-26, N-1, N-2, G-3 a,
  G-4 owner variant, Q6 b, 24-hour chips) and `coordinator_decisions` (G-4 trigger, the
  audit-focus list items 8 and 9).
- docs/02 (R-01, R-02, R-07), docs/04 (lines about sessions, breaks, confirmation, pre-fill,
  the U-23 rule as rewritten), docs/10 (D-02, E-1, the round-3 entries), docs/12
  ("Unconfirmed breaks"), docs/03 (sessions and breaks) as frozen, EN and VI.
- `handoff/delivery/tasks/WP5-UX3-PLAN.md` sections B8 and C, `WP5-UX3-PLAN2.md` items 4-6,
  the slice records T06, T07, T08, T08B, T09 and T10, the gate record and its evidence.

## Scope (area B)

1. **Request integrity**: for the same typed values, the session dialog and the Check out
   dialog send the same request shapes as a643794 did through the old forms (compare request
   bodies captured on both builds for a matrix of cases: same-day, overnight, DST fall-back
   fold, spring-forward gap, a break across midnight, two input zones, edits that leave rows
   untouched); untouched rows resend their saved instants byte for byte; the end is start +
   minutes as elapsed UTC time; hidden row dates follow the session date (Q6 b) also after a
   session date or zone change.
2. **Confirmation semantics**: `breaks_confirmed` for listed rows, the ticked box, the G-4
   choices (confirm none, leave unconfirmed, go back) and Check out (E-1: omitted list stays
   unconfirmed); the final "Save this session?" summary matches what is sent; Cancel and
   Discard send nothing; the sub-dialog's Done sends nothing; against R-02 and D-02.
3. **Pre-fill (G-3 a)**: reference hours on new sessions only; suggested breaks only for an
   accounting date before the server's `today_local`, never the device clock (device zones
   Asia/Ho_Chi_Minh and America/New_York against reporting zone America/Los_Angeles; the
   reporting-zone midnight); the rewritten docs/04 rule (EN and VI) matches PLAN section C and
   the behaviour; the docs/10 line-178 clause replaced.
4. **Figures unchanged**: the server is byte-identical to a643794 (gate item 2); verify on
   your own build that for equivalent requests the worked minutes, OT credit, review
   warnings and sign-off state are identical between a643794 and the target.
5. **Dialogs**: the stack (editor bottom sheet or side panel, session dialog, sub-dialog,
   notice or confirmation), one modal on top, Escape closes only the top, focus returns to
   the opener; B3-01 across 1360px; view-only shares cannot open editing dialogs; the reason
   field in old periods.
6. **Phone (N-1, N-2)**: rows versus chips at 430/390/375/360/320 for same-day and overnight
   sessions; chip text 24-hour; the 390x844 dialog scroll (audit-focus item 9): judge whether
   N-2 holds; 44px targets; no sideways scroll.
7. **Test strength**: at least eight mutants of your own on area-B behaviour
   (`breaks_confirmed` per path, the past-day comparison, the end computation, the hidden
   row date, the G-4 trigger, the Check out omission, the sub-dialog Done, nested Escape)
   and whether the suite catches each.
8. **Audit-focus item 8** ("Confirm breaks" with no fitting suggestion asks through the
   notice): verdict.
9. **Mandatory checks yourself**: typecheck, lint, `npm test` twice, build, the full e2e on
   both projects on the real clock, `day-editor.spec.ts` under the FIX10 simulated clock at
   two DST instants, AC-13 once.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX3-AUDIT-B`; ports 48890-48919; `DATA_DIR` and
  `DATABASE_PATH` inside the task folder for every server or CLI run (a643794 and the target
  in separate folders); never touch `%LOCALAPPDATA%\timesheet-dev`.
- Git Bash only; never cmd.exe or an interactive shell. **NEVER FEED ANYTHING TO PYTHON OR
  NODE THROUGH STDIN (NO HEREDOCS, NO `node -e`, NO `| node`, NO `| python`). NEVER PIPE INTO
  `head` OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout` OR `nul`. NEVER `rm
  -rf`.** Write probes as files in the task folder and run them; read outputs with the Read
  tool. Copy the FIX10 preload into the task folder only. Never kill processes by PID; leave
  nothing running. Run the digest before any long probe. Create files only in the task
  folder, the evidence folder and the review pair.
- Synthetic data only; screenshots end `-synthetic.png` (at most 12); no email address
  except the full synthetic `@example.invalid` form; `<user>` for profile paths.
- If a permission check denies a call, stop and report.

## Output

The review pair, Results in this file, evidence in
`handoff/delivery/evidence/WP5-UX3-AUDIT-B/` (masked LF `.txt` and `-synthetic.png`).
Decision PASS / FIX REQUIRED / NOT VERIFIED with numbered findings (severity, file:line,
reproduction, expected) and optional risks. Return at most 250 words, beginning with your
self-reported model.

## Results
