# WP5-UX3-AUDIT-B dispatch brief (area B: break entry integrity and dialogs)

- Mission/task: timesheet-software-readiness / WP5-UX3-AUDIT-B; package WP5; kind audit;
  attempt 1; depends on WP5-UX3-REGATE (PASS required; WP5-UX3-GATE attempt 1 on cecfceb
  failed and was fixed by WP5-UX3-FIX1 and WP5-UX3-FIX2); fresh context. Runs in parallel
  with the read-only WP5-UX3-AUDIT-A (other ports, other folders).
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size L,
  risk H (break entry feeds worked minutes and OT credit), novelty yes. Task record in
  English; review pair `handoff/delivery/WP5_UX3_REVIEW_B.md` and `.vi.md` (REVIEW template
  in `handoff/templates/`).
- Author separation: you did not write any WP5-UX3 task (their agent IDs are on the board).
  Treat every worker, planner and verifier report as a claim.
- Target: `reviewed_commit` = TARGET_SHA = 7ce4e95a0c4477374e981132d93b11aedab2e384 (the
  WP5-UX3-FIX2-FREEZE commit) with the regate digest TARGET_DIGEST =
  262138e0c94c90dc0287e6de87e69f2aabfa68d3bd7bdb6262322c1e2b8f0191 (833 files). Record HEAD,
  the digest before and after (three forms as the gate did) and `reviewed_commit`. Any change outside `handoff/` invalidates the audit; run on a clean
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
  the slice records T06, T07, T08, T08B, T09 and T10, the failed gate record
  `WP5-UX3-GATE.md`, the fix-round records `WP5-UX3-FIX1.md`, `WP5-UX3-SWEEP.md` (a planner's
  read-only sweep: a claim, not an audit) and `WP5-UX3-FIX2.md` (with Addendum 1), and the
  regate record `WP5-UX3-REGATE.md` with their evidence.

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
9. **Fix round, area B** (your own probes; each a verdict):
   - FIX1: the batch stale-version test seeds with the current version (no 409 flake) and
     still proves the stale-version refusal.
   - FIX2 item 2: the new past-day test fixes the browser clock away from the server's
     `today_local` and catches a device-clock rule (re-run mutant M18 yourself).
   - FIX2 item 8: the Check out dialog asks "Discard your changes?" only after a change to
     its rows or box (on Cancel, Escape and the browser close request), Keep editing keeps
     the rows and returns focus, Discard sends nothing, an undone change counts as no
     change, and Check out still sends at once with no notice and no final confirmation;
     the docs/04 line 70 and docs/10 line 238 wording (EN and VI).
   - FIX2 item 10: `quickBreaksRequest` and `confirmBreaksDraft` removed with five unit
     tests; the moved oracles in `tests/client/breakRowsModel.test.ts:179-221`. Say for each
     removed test whether its proof is still held (moved test or e2e) and whether anything
     was weakened.
   - FIX2 item 5: docs/12 line 71 (EN and VI) on the refused Check out remedy.
   - Sweep finding 12, accepted by the coordinator as documented E-1 behaviour and not
     changed: Check out on a running session with saved unconfirmed rows, removing every
     row omits the list, so the server keeps the rows. Judge whether this matches E-1 and
     the owner's words, and whether the UI says what will happen; a finding if it misleads.
10. **Mandatory checks yourself**: typecheck, lint, `npm test` twice, build, the full e2e on
    both projects on the real clock, `day-editor.spec.ts` under the FIX10 simulated clock at
    two DST instants, AC-13 once.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX3-AUDIT-B`; ports 48970-48999; `DATA_DIR` and
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

### Auditor result (attempt 1) - decision: FIX REQUIRED

Self-reported model: claude-opus-5-5 (timesheet-auditor; the strongest author model of the snapshot is also
claude-opus-5-5). Fresh context; no WP5-UX3 change authored. 2026-10-16 18:15Z to about 20:05Z (a window day), in parallel with
the area-A auditor. Review pair: `handoff/delivery/WP5_UX3_REVIEW_B.md` and `.vi.md`. Evidence:
`handoff/delivery/evidence/WP5-UX3-AUDIT-B/` (masked LF `.txt`, 6 `-synthetic.png`, index `00-README.txt`).

- **Target and digest.** `reviewed_commit` 7ce4e95a0c4477374e981132d93b11aedab2e384; HEAD the same before and after; nothing
  outside `handoff/` changed. Digest 262138e0c94c90dc0287e6de87e69f2aabfa68d3bd7bdb6262322c1e2b8f0191 (833 files) before and
  after in three equal forms (clean export with `git hash-object --no-filters`, `git ls-tree`, `npm run digest`).
- **Findings.** F-UX3B-1 Low (sweep finding 12): with saved unconfirmed rows on a running session (API-only), removing every row
  in the Check out dialog shows "No breaks listed" and "Check out, breaks unconfirmed", the list is omitted and the server keeps
  the rows (or answers 422 `saved_break_after_clock_out` when a row ends after now); the dialog never says so
  (`breakRowsModel.ts:389-391`, `ClockOutDialog.tsx:103`, `BreakRows.tsx:289-292`). F-UX3B-2 Low: "Confirm breaks" lists no
  suggestion unless every one fits (`SessionDialog.tsx:243-247`, `dayEditorModel.ts:73`), while docs/04 line 65 (EN and VI)
  says it lists those that lie inside the session; 09:00-12:00 and 09:00-14:00 open with 0 rows.
- **Request integrity:** PASS, 25 cases captured from both UIs (same day, overnight, a break across midnight, Sydney fold
  earlier and later, Los Angeles gap and across it, Ho Chi Minh and New York input zones, edits untouched, end only, date change,
  zone change and round trip, fold-day untouched edit, Confirm breaks x3, Check out x4): stored instants equal in all 25; every
  untouched case byte-identical; the only shape change is the documented explicit end offset.
- **Confirmation semantics:** R-02, D-02, E-1 (API) and the G-4 notice PASS; the summary matches the body; Cancel, Discard,
  Go back, Back and the sub-dialog's Done send nothing.
- **Pre-fill:** PASS (server `today_local` only; two device zones; across the reporting-zone midnight; docs rule = PLAN C).
- **Figures:** PASS (`dist/server`, `dist/domain` byte-identical; 20 bodies x 2 servers x 2 sources identical).
- **Dialogs, phone:** PASS (stack, Escape, focus, B3-01, view-only, reason; rows/chips by width, 24-hour chips, 44px, no sideways
  scroll); audit-focus 8 PASS; 9: N-2 holds (297/259px scroll, head and footer in view).
- **Fix round:** FIX1 seed PASS (no 409 with the precondition; reverted seed gives 409; server mutant caught); FIX2 item 2 PASS
  (M18 fails `:710` and `:593` on both projects); item 5 PASS; item 8 PASS; item 10 PASS (all five proofs held).
- **Mutants:** 13 of 13 caught (A06 by the unit suite only; its request-level twin A13 by unit and e2e).
- **Mandatory checks:** typecheck 0, lint 0, `npm test` x2 0 (94 files, 2131 tests), build 0 (487.17 kB, no advisory), AC-13 1/1,
  FULL e2e real clock 627 passed / 67 skipped / 0 failed (desktop 317/30, mobile 310/37), `day-editor.spec.ts` under FIX10 at
  2026-11-01T08:45Z and 2027-03-14T10:30Z 112 passed / 18 skipped / 0 failed each. No timeout in these; five integration-test
  timeouts inside two mutant unit runs under load (R-UX3B-6).
- **Risks:** R-UX3B-1..7 in the review (focus after the deferred 1360px switch; midnight without a re-read; docs/12 first
  sentence; `dayModel.ts:143` "labels" for area A; pinned pre-fill start; load timeouts; minutes field label).
- **Slips (read-only, no effect):** a listing piped into `head`; a progress read and an `od -c` read piped into `tail`; one wait
  loop with `2>/dev/null`; one `python -c "print(1)"` no-op. No stdin script or heredoc, no recursive delete, no PID kill. All six
  background commands finished; nothing of mine is running.

Status: done (decision FIX REQUIRED)
