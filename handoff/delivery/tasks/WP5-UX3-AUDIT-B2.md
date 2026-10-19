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
- Target: `reviewed_commit` = TARGET_SHA = a78ada5edbf5339d4502df57e9f195d11c0b5d28 (the
  WP5-UX3-FIX3-FREEZE commit), with the regate digest TARGET_DIGEST =
  d1d903cfb148d1bcc74131af3e1aeebed0f1892143e0ede3950ddee335b839ca (833 files).
  - Record HEAD, the digest before and after (three forms) and `reviewed_commit`.
  - Any change outside `handoff/` invalidates the audit.
  - Work on a clean `git archive` export with no `.git` folder (never `git init` it).
- **AGENTS.md on disk wins.**
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
