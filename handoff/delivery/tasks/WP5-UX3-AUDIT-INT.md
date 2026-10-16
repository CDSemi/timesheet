# WP5-UX3-AUDIT-INT dispatch brief (integration pass)

- Mission/task: timesheet-software-readiness / WP5-UX3-AUDIT-INT; package WP5; kind audit;
  attempt 1; depends on WP5-UX3-GATE (PASS) and on WP5-UX3-AUDIT-A and WP5-UX3-AUDIT-B (both
  PASS); fresh context; this is the audit whose PASS re-accepts WP5 after UI change round 3.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size M,
  risk M, novelty no. Task record in English; review pair
  `handoff/delivery/WP5_UX3_REVIEW_INT.md` and `.vi.md`.
- Author separation: you did not write any WP5-UX3 task and you are neither the area A nor
  the area B auditor.
- Target: `reviewed_commit` = TARGET_SHA with the gate digest TARGET_DIGEST (the same as both
  area audits). Record HEAD, the digest before and after and `reviewed_commit`.

## Scope

1. Both area reviews and the gate record: the same commit and digest; every finding closed
   or accepted as an optional risk with a reason; no area left unaudited (map every owner item
   U-01..U-27, N-1, N-2 and every answer G-1..G-5, Q6 to the area that judged it).
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
`D:\.claude-tmp\timesheet\WP5-UX3-AUDIT-INT` and ports 48920-48939.

## Output

The review pair, Results in this file, evidence in
`handoff/delivery/evidence/WP5-UX3-AUDIT-INT/`. Decision PASS / FIX REQUIRED / NOT VERIFIED
with findings. Return at most 200 words, beginning with your self-reported model.

## Results
