# WP5-UX3-AUDIT-INT dispatch brief (integration pass)

- Mission/task: timesheet-software-readiness / WP5-UX3-AUDIT-INT; package WP5; kind audit;
  attempt 1; depends on WP5-UX3-REGATE2 (PASS) and on WP5-UX3-AUDIT-A2 and
  WP5-UX3-AUDIT-B2 (both PASS); fresh context; this is the audit whose PASS re-accepts WP5
  after UI change round 3. History you integrate: WP5-UX3-GATE attempt 1 on cecfceb failed;
  WP5-UX3-FIX1, WP5-UX3-SWEEP and WP5-UX3-FIX2; WP5-UX3-REGATE PASS on 7ce4e95 (one recorded
  timeout deviation); the first area audits WP5-UX3-AUDIT-A and -B (FIX REQUIRED on
  7ce4e95); WP5-UX3-FIX3; WP5-UX3-REGATE2 and the rechecks AUDIT-A2 and AUDIT-B2 on
  a78ada5.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size M,
  risk M, novelty no. Task record in English; review pair
  `handoff/delivery/WP5_UX3_REVIEW_INT.md` and `.vi.md`.
- Author separation: you did not write any WP5-UX3 task and you are neither the area A nor
  the area B auditor.
- Target: `reviewed_commit` = ceb86b6b18bd0e8fabd93f47672cd87f3899b92f (the
  WP5-UX3-GOV2-FREEZE commit: FIX3's source plus the owner's AGENTS pair) with the regate
  digest b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48 (833 files; the
  same as both rechecks). Record HEAD, the digest before and after and `reviewed_commit`;
  work on a clean `git archive` export with no `.git` folder.
- Author separation: you are none of the round-3 workers, planners, verifiers or auditors
  (A, B, A2, B2); agent IDs are on the board.
- AGENTS.md on disk at ceb86b6 (accepted by WP5-UX3-GOV2-AUDIT) wins over any injected copy.
  Include the GOV2 change (`handoff/delivery/GOV_UX3_REVIEW2.md`) in the history you
  integrate.

## Scope

1. The four area reviews (A, B on 7ce4e95; A2, B2 on a78ada5) and the gate records
   (REGATE, REGATE2): the rechecks and REGATE2 name the same commit and digest as you;
   every finding closed or accepted as an optional risk with a reason; first-pass verdicts
   carried forward only where FIX3's diff (`git diff 7ce4e95..a78ada5`) leaves them valid;
   no area left unaudited (map every owner item U-01..U-27, N-1, N-2, every answer
   G-1..G-5, Q6 and the 24-hour chip answer to the area that judged it); every attempt-1
   gate FAIL reason, every sweep finding 1-13 (12 now fixed as F-UX3B-1) and every finding
   F-UX3A-01..06, F-UX3B-1..2 closed, justified (the account-menu target-size item) or
   accepted, with an area verdict; the REGATE timeout deviation and its AUDIT-A verdict.
2. Cross-area behaviour, by your own probes: the floating editor at 1280 with the session
   dialog, a sub-dialog and a confirmation stacked (Escape order, focus returns, inert page);
   the account menu while the editor is open (1366, non-modal) and on a phone; a shared view
   (view only and edit) with the new header, chips, session cards and dialogs; the "in
   progress" pill in the period bar and the editor chip on a window day under the simulated
   clock; Settings and Administration reachable for an admin in every layout.
3. AC-13 under America/Los_Angeles, Asia/Tokyo and America/New_York device zones.
4. The docs (docs/04, 10, 12, EN and VI) against the frozen behaviour for the cross-area
   points above.
5. Mandatory: typecheck, lint, `npm test`, build, the e2e specs `today`, `timesheet`,
   `day-editor`, `sharing`, `shell` on both projects.

## Runtime

Same rules as `handoff/delivery/tasks/WP5-UX3-AUDIT-A.md` "Runtime", with the task folder
`D:\.claude-tmp\timesheet\WP5-UX3-AUDIT-INT` and ports 49140-49159 (evidence names end
`.txt` or `-synthetic.png` only).

## Output

The review pair, Results in this file, evidence in
`handoff/delivery/evidence/WP5-UX3-AUDIT-INT/`. Decision PASS / FIX REQUIRED / NOT VERIFIED
with findings. Return at most 200 words, beginning with your self-reported model.

## Results
