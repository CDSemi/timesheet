# WP5-UX3-AUDIT-B2 dispatch brief (area B recheck)

- Mission/task: timesheet-software-readiness / WP5-UX3-AUDIT-B2; package WP5; kind audit;
  attempt 1; depends on WP5-UX3-REGATE2 (PASS required).
- Fresh context. This is the recheck of WP5-UX3-AUDIT-B (FIX REQUIRED on 7ce4e95 /
  262138e0) after WP5-UX3-FIX3.
- Runs in parallel with the read-only WP5-UX3-AUDIT-A2, which uses other ports and other
  folders and may run full e2e suites at the same time.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size M,
  risk H (break entry feeds worked minutes and OT credit), novelty no.
- Records:
  - task record in English;
  - review pair `handoff/delivery/WP5_UX3_REVIEW_B2.md` and `.vi.md`, from the REVIEW
    template in `handoff/templates/`.
- Author separation: you did not write any WP5-UX3 task and you are not the area-B auditor
  of the first pass (agent IDs are on the board). Treat every worker, planner, verifier and
  auditor report as a claim.
- Target: `reviewed_commit` = TARGET_SHA = ceb86b6b18bd0e8fabd93f47672cd87f3899b92f (the
  WP5-UX3-GOV2-FREEZE commit; the source of the FIX3 freeze a78ada5 plus the owner's
  AGENTS.md text and its AGENTS.vi.md translation, accepted through the GOV chain), with the
  regate digest TARGET_DIGEST =
  b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48 (833 files).
  - Record HEAD, the digest before and after (three forms) and `reviewed_commit`.
  - Any change outside `handoff/` invalidates the audit.
  - Work on a clean `git archive` export with no `.git` folder (never `git init` it).
- **AGENTS.md on disk wins.** The text at ceb86b6, accepted by WP5-UX3-GOV2-AUDIT, replaces
  any injected copy. An injected copy may still show the owner's unedited text.
  - Rule 7: UTC instants, accounting dates and the saved reporting zone are different
    values.
  - Rule 8: user-confirmed requirements outrank inherited rules, and the canonical rule is
    updated.

## Read

- AGENTS.md (from disk), and the docs/08 section "Gates and independent audit".
- The first area-B review `handoff/delivery/WP5_UX3_REVIEW_B.md` (findings F-UX3B-1 and
  F-UX3B-2, risks R-UX3B-1..7, the request matrix) and its evidence.
- `handoff/delivery/tasks/WP5-UX3-FIX3.md` (Results) and `WP5-UX3-REGATE2.md` (Results).
- The owner's words: the board's `owner_decisions` of 2026-10-15/16 (U-21..U-26, G-3 a,
  the G-4 owner variant, Q6 b).
- The board's `coordinator_decisions` of 2026-10-16, starting "WP5-UX3-AUDIT-A FIX
  REQUIRED". It holds the two behaviour choices of F-UX3B-1 and F-UX3B-2.
- docs/02 (R-02), docs/04 (lines 65 and 70), docs/10 (E-1, D-02, lines 238 and 245) and
  docs/12 (line 71), EN and VI, as frozen.

## Scope

1. **F-UX3B-1 closed, and the behaviour choice judged.**
   - Seed through the API a running session with saved unconfirmed rows, one of them
     ending after now. Then, at Check out:
     - remove some rows;
     - remove all rows, unticked;
     - remove all, then tick the box;
     - add a row;
     - start with no saved rows.
   - For each case, capture the request body and the stored result.
   - Expected:
     - the empty unconfirmed list replaces the saved rows only when the dialog opened with
       saved rows and all were removed, unticked;
     - with no saved rows at the start, the list is omitted (E-1);
     - no 422;
     - the note text matches what is recorded.
   - Judge the choice against U-24..U-26, E-1, R-02 and D-02. Check docs/04 line 70 and
     docs/10 line 238, EN and VI.
2. **F-UX3B-2 closed.** "Confirm breaks" lists the suggestions inside the session:
   - 09:00-12:00, 09:00-14:00 and 09:00-18:00 list 1, 2 and 3 rows;
   - 09:00-10:30 lists none, and Save asks through the G-4 notice;
   - check the edges (a break ending exactly at the end fits; one minute later does not);
   - check an overnight session and a DST day;
   - check the input zone differing from the reporting zone.

   The rows must be pinned like the new-session pre-fill. When suggestions appear (the
   past-day rule, ended sessions only) is unchanged. Check docs/04 line 65 and docs/10
   line 245, EN and VI.
3. **Regression from FIX3's diff in area B.** `git diff 7ce4e95..a78ada5 -- src tests docs`
   is the whole change; read it.
   - Compare request bodies between the 7ce4e95 build and the target for every
     session-dialog and Check out case of the first-pass matrix that FIX3 did not intend
     to change. They must be byte-identical.
   - The server must be unchanged: `git diff a643794..a78ada5 -- src/server src/domain` is
     empty, so figures are unchanged.
   - Judge the removal of the four `quickBreaksOf` unit tests against the mapping in
     `WP5-UX3-FIX3.md`.
4. **Test strength.** At least six mutants of your own on FIX3's area-B changes:
   - `hadSavedRows` ignored;
   - `hadSavedRows` always true;
   - the confirmed flag on the empty list;
   - the inside filter's end comparison (`<` versus `<=`);
   - the past-day gate of `confirmBreaksRows`;
   - the note's condition.

   Say whether the suite catches each.
5. **Risks.** Re-judge R-UX3B-1, -2, -5, -6 and -7, and R-UX3B-3 (docs/12 line 71 now
   rewritten).
6. **Mandatory checks yourself:**
   - typecheck, lint, `npm test` twice, build;
   - the full e2e on both projects on the real clock;
   - `day-editor.spec.ts` under the FIX10 simulated clock at `2026-11-01T08:45:00Z` and
     `2027-03-14T10:30:00Z`;
   - AC-13 once.

   If a run fails by timeout under the parallel load, rerun it once and record both runs
   with the load context.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX3-AUDIT-B2`. Ports 49110-49139.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every server or CLI run.
  Use separate folders for the 7ce4e95 build and the target.
- Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash only; never cmd.exe or an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN (NO HEREDOCS, NOT EVEN EMPTY
  ONES; NO `node -e`, `python -c`, `| node`, `| python`). NEVER PIPE INTO `head` OR `tail`
  (NOT EVEN `head -0` OR `head -n 0`). NEVER REDIRECT TO OR FROM `/dev/null`,
  `/dev/stdout`, `/dev/zero` OR `nul`. NEVER `rm -r` OR `rm -rf`.**
  - Write probes as files in the task folder and run them.
  - Read outputs with the Read tool.
- Copy the FIX10 preload into the task folder only.
- Never kill processes by PID; leave nothing running.
- Run the digest before any long probe.
- Create files only in the task folder, the evidence folder and the review pair. Evidence
  names end in `.txt` or `-synthetic.png` only.
- Synthetic data only. Screenshots end in `-synthetic.png`, at most 8. No email address
  except the full synthetic `@example.invalid` form; write `<user>` for profile paths.
- If a permission check denies a call, stop and report.

## Output

- The review pair.
- Results in this file.
- Evidence in `handoff/delivery/evidence/WP5-UX3-AUDIT-B2/`.
- A decision of PASS / FIX REQUIRED / NOT VERIFIED, with numbered findings (severity,
  file:line, reproduction, expected) and optional risks.
- Return at most 250 words, beginning with your self-reported model.

## Results

Checkpoint 1 (in progress, 2026-10-19 22:06Z; auditor timesheet-auditor, self-reported model claude-opus-5-5):
- HEAD = origin/main = `ceb86b6b18bd0e8fabd93f47672cd87f3899b92f`; nothing modified outside `handoff/`.
- Digest before, three forms equal: `b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48`, 833 files (clean `git archive`
  export without `.git` hashed with `git hash-object --no-filters`; `git ls-tree` form, sorted list byte-identical; `npm run digest`).
- Exports created in the task folder (target `export`, `probe-target`, `mut`; 7ce4e95 `probe-base`); `npm ci` and builds exit 0.
- `git diff a643794..a78ada5 -- src/server src/domain` and `git diff 7ce4e95..ceb86b6 -- src/server src/domain src/client/api.ts`: empty.
- Mandatory checks running (typecheck, lint, `npm test` x2, build, AC-13 exit 0; full e2e running).

Checkpoint 2 (22:15Z): probes done on both builds (task-local, evidence to follow).
- Request matrix of the first pass (25 cases) on 7ce4e95 and the target: 24 unchanged cases byte-identical (raw body, status, stored);
  C23 differs as intended (`{"breaks":[],...}` replaces the removed row).
- F-UX3B-1, 12 starting cases on both projects: the four "every saved row removed, box unticked" cases send `breaks: []` unconfirmed,
  200, no rows, `incomplete_breaks`, with the note; the other eight are byte-identical to 7ce4e95.
- F-UX3B-2, 16 cases plus pinning and gate checks: 1/2/3/0 rows, edges, overnight, DST (Sydney fall-back, LA spring-forward), Ho Chi
  Minh input zone, today's ended session; rows pinned exactly like the new-session pre-fill. Probe correction: run 1 on 7ce4e95 used
  2025-11-02, which has no calendar version (`calendar_missing`); replaced by Sydney 2026-04-05 and rerun on both builds.
- dist/server and dist/domain of 7ce4e95 and the target byte-identical; EN/VI parity of the area-B docs lines equal.

Checkpoint 3 (22:31Z): mandatory checks so far all pass: typecheck 0, lint 0, `npm test` x2 (94 files, 2141 tests), build 486.81 kB
without advisory, AC-13 1/1, FULL e2e real clock exit 0 (645 passed, 67 skipped, 0 failed; desktop 326/30, mobile 319/37). Mutants
M1-M4 caught (M4 by the unit suite only); M5a-M6b running; the two DST runs follow.

Checkpoint 4 (22:48Z): mutants done: M1, M2, M3, M4, M5a, M6b caught; M5b (a past-day gate in `confirmBreaksRows`) and M6a (the
removal note's condition without the saved rows) survive the unit suite and `day-editor.spec.ts` desktop; their broader runs on both
projects are running. DST runs under the FIX10 clock: 2026-11-01T08:45Z and 2027-03-14T10:30Z both exit 0, 118 passed, 18 skipped,
0 failed each (desktop 67/1, mobile 51/17).

### Result - auditor - decision: FIX REQUIRED

Self-reported model: claude-opus-5-5 (profile timesheet-auditor; the strongest author model of the snapshot is also claude-opus-5-5).
Fresh context; no change of the snapshot authored; not the first-pass area-B auditor. Review pair `handoff/delivery/WP5_UX3_REVIEW_B2.md`
and `.vi.md`; evidence `handoff/delivery/evidence/WP5-UX3-AUDIT-B2/` (index `00-README.txt`; masked LF `.txt` and 8 `-synthetic.png`).

- Target `ceb86b6b18bd0e8fabd93f47672cd87f3899b92f`; HEAD = origin/main before and after; nothing modified outside `handoff/`. Digest
  `b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48`, 833 files, before (21:53Z) and after (23:02Z), three forms equal
  each time (clean `git archive` export without `.git`, `git ls-tree`, `npm run digest`).
- F-UX3B-1 closed (12 Check out starting cases, both projects, both builds; `44-checkout-*-compare.txt`): removing every saved row with the
  box unticked (B2, B6, B7, B9) sends `{"breaks":[],"breaks_confirmed":false,"expected_version":1}`, 200, no rows, `incomplete_breaks`, with
  the note "The saved breaks you removed are deleted at Check out. Breaks stay unconfirmed and OT for the day stays pending." (7ce4e95:
  omitted list, 422 `saved_break_after_clock_out` when a row ends after now). Some removed (B1), all removed then ticked (B3), a row added
  (B4, B4b), no saved rows at the start (B5, B5b: the list omitted, E-1), Cancel then Discard (B8): byte-identical to 7ce4e95. No 422 in the
  brief's cases; the only 422 (B4c, the late row kept in the list: `break_outside_session`) is identical on 7ce4e95.
- Behaviour choice judged sound against U-24/U-25 (what the dialog shows is what is recorded), the G-4 "Leave breaks unconfirmed for now"
  body, R-02 and D-02 (unknown stays pending; no future break kept), E-1 (API unchanged; the dialog uses the present-list branch only when
  there is something to replace); docs/04 line 70, docs/10 lines 101 and 238 (VI 102, 239) and docs/12 line 71 match the code, EN and VI.
- F-UX3B-2 closed (16 cases plus pinning and gating, both builds; `45-confirm-compare.txt`): 09:00-12:00, -14:00 and -18:00 list 1, 2 and 3
  rows; 09:00-10:30 lists none and Save asks through the notice; a break ending exactly at the end fits, one minute later does not (first
  and third break); overnight 22:00-03:00+1 lists 2 rows with dates, 22:00-06:00+1 lists 3; Sydney fall-back 00:00-05:45 lists 3 and Los
  Angeles spring-forward 00:00-07:44 lists 2 (elapsed time, not wall time); a Ho Chi Minh input zone pins the rows at +07:00; today's ended
  session lists 2 (no past-day rule for "Confirm breaks", unchanged). The rows' `breaks` body is byte-identical to the new-session
  pre-fill's for the same session (P01). No "Confirm breaks" for confirmed or running sessions (G01). docs/04 line 65 and docs/10 line 245
  (VI 246) match, EN and VI.
- Regression: the 24 first-pass matrix cases FIX3 did not intend to change are byte-identical between 7ce4e95 and the target (raw body,
  status, stored session); C23 differs as intended (`43-req-compare.txt`). Server unchanged: `git diff a643794..a78ada5 -- src/server
  src/domain` is empty; `dist/server` (180 files) and `dist/domain` (46) of own 7ce4e95 and target builds are byte-identical. The four
  removed `quickBreaksOf` unit tests: only `.kind` was used in production; their behaviours are covered by
  `breakRowsModel.test.ts:886-931`; not a weakening.
- Mutants (8; `60-mutants.txt`, `61-survivors.txt`): M1 `hadSavedRows` ignored, M2 `hadSavedRows` always true, M3 the confirmed flag on the
  empty list, M4 the inside filter's `<=` to `<`, M5a the `breaks_confirmed` gate of `confirmBreaksRows`, M6b the note ignoring the box:
  caught (M4 and M5a by the unit suite only). M5b (a past-day gate added to `confirmBreaksRows`) and M6a (the removal note's
  condition without the saved rows) survive the unit suite and the six specs that open the Check out or session dialog on both projects
  (342 passed, 60 skipped, 0 failed each); both are live (`46-M6a-live-compare.txt`, `47-M5b-live-compare.txt`). M6a is the finding
  below; M5b is R-B2-1.
- Finding F-UX3B2-1, Low (test strength): `ClockOutDialog.tsx:106`; the note's condition is not pinned when the dialog opens without saved
  rows (`day-editor.spec.ts:1866` checks the body, not the note); reproduction mutant M6a; expected: one assertion that the note is absent
  there (test only). Risks R-B2-1..5 in the review (today's "Confirm breaks" unpinned; "stay unconfirmed" wording for an API-only confirmed
  running session; a kept late row gives a general `break_outside_session` alert; `suggestedRows` now test-only without a comment; the
  note's muted style). R-UX3B-3 closed; R-UX3B-1, -2, -5, -7 stay; R-UX3B-6 not seen.
- Mandatory checks (clean export of the target): typecheck 0, lint 0, `npm test` x2 exit 0 (94 files, 2141 tests, 0 timeouts), build 0 (main
  chunk 486.81 kB, no advisory), AC-13 1/1, FULL e2e real clock exit 0 (645 passed, 67 skipped, 0 failed; desktop 326/30, mobile 319/37;
  18.0 min); `day-editor.spec.ts` under the FIX10 clock at 2026-11-01T08:45:00Z and 2027-03-14T10:30:00Z: exit 0, 118 passed,
  18 skipped, 0 failed each (desktop 67/1, mobile 51/17); no run failed by timeout, none repeated.
- Package check: `validate_package.py --preflight` stops at the parallel area-A draft `WP5_UX3_REVIEW_A2.md` (not this pair); the same
  checks applied to this pair pass (`97-preflight-final.txt`, `97-pair-check.txt`); hygiene of evidence, pair and brief in
  `98-check-evidence.txt` (0 bad).
- Slips (read-only, no effect): one pipe into `head`, two `tail` reads of a file, one stray `python -I -c "print(1)"` no-op (`96-slips.txt`).
  Probe correction: the first 7ce4e95 "Confirm breaks" run used 2025-11-02 (`calendar_missing`), replaced by Sydney 2026-04-05 on both
  builds. Nothing of mine is left running.

Status: done (decision FIX REQUIRED)
