# WP5-UX5-RECHECK-A dispatch brief (fresh recheck of area A after FIX8, FIX9 and FIX10)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-RECHECK-A, package WP5, kind
  audit, attempt 1.
  - It depends on WP5-UX5-REGATE6 (PASS on a5533b5 / 41477510).
  - It rechecks WP5-UX5-AUDIT-A (FIX REQUIRED on f4049aa). Read
    `handoff/delivery/WP5_UX5_REVIEW_A.md` for its findings F-UX5A-1..4 and risks R1-R8.
  - Run in a fresh context. It runs in parallel with WP5-UX5-RECHECK-B, which uses other
    ports and folders.
- **Profile and routing.** timesheet-auditor, requested opus/xhigh, no override.
  - Routing: size M, risk H, novelty no.
  - Write the task record in English.
  - The review pair is `handoff/delivery/WP5_UX5_RECHECK_A.md` and `.vi.md`. Use the
    REVIEW template in `handoff/templates/`.
- **Author separation.** You wrote no WP5-UX4 or WP5-UX5 task; their agent IDs are on the
  board. Treat every planner, worker, committer and verifier report as a claim.
- **Target.**
  - `reviewed_commit` = TARGET_SHA = a5533b57daa81a340c0ad9dfe5f5feac4e6ce1f5 (pushed).
    HEAD may be a later commit that changes only `handoff/`.
  - TARGET_DIGEST = 4147751090b5511ea56225bb7bf9a33225602cc705eb906a13477cec9101869f
    (882 files).
  - Record HEAD, the digest before and after (three forms) and `reviewed_commit`.
  - Work on a clean export or a scratch clone at TARGET_SHA. Any change outside
    `handoff/` invalidates the recheck.
- **AGENTS.md on disk wins.** Its UI section is "Frontend and UI/UX standards".
- Never touch `.claude/worktrees/` or its branch.

## Read

- The plan and fix records:
  - `handoff/delivery/tasks/WP5-UX5-PLAN-FIX7A.md` and `WP5-UX5-FIX8.md` (area A
    findings);
  - `WP5-UX5-FIX9.md` (keyboard access to read-only week cards);
  - `WP5-UX5-DIAG4.md` and `WP5-UX5-FIX10.md` (cheaper e2e tests);
  - the gates `WP5-UX5-REGATE5.md` and `WP5-UX5-REGATE6.md`;
  - their evidence.
- The owner's words on the board (`owner_decisions` of 2026-10-21 and 2026-10-22: B7/B9,
  Addendum 3b, F-7 a), the plan `WP5-UX5-PLAN.md` and the mockup, as in the AUDIT-A brief.
- docs/04 and docs/12, EN and VI.

## Scope

1. **Dispositions of F-UX5A-1..4.** For each: fixed, partly fixed, or still open, with
   your own reproduction at the reported widths. Use a classic scrollbar and touch
   emulation where they apply.
   - **F-UX5A-1:** the signed and reloaded Review at 1440, 1200, 1100, 900, 768, 600, 480,
     390 and 320 px, light and dark. Check that:
     - nothing overlaps;
     - the name, image and "Signed" are readable;
     - the four lines are aligned;
     - the button sits 8 px inside the end of the line;
     - the PDF geometry is unchanged.

     Judge the design against the owner's words: below about 1150 px, the correction
     button drops under the signed content.
   - **F-UX5A-2:** the name follows the shown words at every width, and the short form is
     now real text (FIX8's deviation). Check SC 2.5.3 and that screen-reader names do not
     double.
   - **F-UX5A-3:**
     - touch swipes and taps;
     - presses on a week card's own scrollbar;
     - mouse and pen behaviour unchanged;
     - the full outside-press matrix of U5-23..U5-26: the discard guard, focus return and
       the phone backdrop.

     State the residual risk on real iOS and Android (only Chromium emulation exists here).
   - **F-UX5A-4:** every replaced line of docs/04 and docs/12, EN and VI, against the
     build.
2. **FIX9.** Read-only Review week cards take focus only while they overflow
   (`useScrollsSideways` in `TimesheetSheet.tsx`). Check:
   - the name;
   - arrow-key scrolling;
   - the inset focus ring's contrast in both themes and both manual overrides;
   - no extra tab stop where nothing overflows;
   - `revealFocused`;
   - the resize behaviour while a card has focus;
   - the editable cards unchanged.
3. **Regressions from FIX8 and FIX9** anywhere in area A. Run your own keyboard walks on
   desktop and phone, in light and dark. Run a real axe scan (engine from a temporary
   folder; add no dependency) of the Timesheet, the Review (unsigned, signed, signed and
   reloaded) and the Sign off dialog at 1440, 900, 768, 480, 390 and 320 px. Check that no
   page scrolls sideways from 320 to 1440 px.
4. **The FIX10 test changes** (`logo.spec.ts`, `timesheet.spec.ts`, `contrast.ts`,
   `day-editor.spec.ts`). Do they prove exactly what the old tests proved?
   - **Logo:** four browser contexts, and the split shared-view test.
   - **The decoded screenshot surface:** `paintedSurface`, including its PNG decoder's
     handling of the formats Playwright produces.
   - **The batched contrast evaluate.**

   Write at least one mutant of your own per changed file, and say whether the suite
   catches it. REGATE6 measured the logo sweep at up to 204 s of 240 s under 10-worker
   stress: judge whether that margin is acceptable for the gate's sweep (6 workers).
5. **The recorded risks R1-R8** of AUDIT-A, and the backlog items:
   - the 23 px Sign off image shift;
   - `useBlockSize`;
   - the reason dialog's date format;
   - the Resend reason string "this revision" (`deliveryModel.ts:251`).

   Say whether any has become a defect.
6. **Test strength.** Write at least eight mutants of your own on the area-A changes of
   FIX8 to FIX10, and say whether the suite catches each.
7. **Mandatory checks yourself:**
   - typecheck, lint, `npm test` once, build (no chunk advisory);
   - the real-clock FULL e2e on both projects;
   - AC-13 once.

   Another auditor runs at the same time. A failure whose trace shows a network or buffer
   error, or a test timeout, may be rerun once; record both runs.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-RECHECK-A`. Ports 49860-49889.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every server or CLI run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash. Use PowerShell only as inline read-only `-NoProfile -Command` queries, and
  never with `-ExecutionPolicy` or `-File`.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `node -e`, NO
  `python -c`, NO `node -` OR `python -`, NO `| node`, NO `| python`. NEVER PIPE INTO
  `head`, `tail` OR `cat`. NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout`,
  `/dev/stdin`, `/dev/zero` OR `nul`, ALSO NOT IN `2>`. NO `rm -r`, NO `sed -i`, NO FIFO
  WAITER SCRIPTS, NO `git init`.**
  - Write probes as files in the task folder and run them.
  - Read outputs with the Read tool.
- **Git.** Never change any git configuration. For git in a scratch clone, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Never kill processes by PID, and never use `Stop-Process`. Leave nothing running.
- Put Node 24 first on PATH for every node or npm call. Do not run `npm ci` or
  `npm install` in the repository.
- Create files only in the task folder, the evidence folder and the review pair.
- **Data.**
  - Use synthetic data only.
  - Screenshots end in `-synthetic.png`, at most 16.
  - No email address except the full synthetic `@example.invalid` form.
  - No password literal.
  - Write `<user>` for profile paths.
- If a permission check denies a call, stop and report.

## Output

- The review pair.
- Results in this file.
- Evidence in `handoff/delivery/evidence/WP5-UX5-RECHECK-A/`: masked LF `.txt` and
  `-synthetic.png`.
- **Decision:** PASS, FIX REQUIRED or NOT VERIFIED.
  - Number each new finding (F-UX5A2-n), with its severity, file:line, reproduction and
    expected result.
  - Give each old finding's disposition.
  - List optional risks separately.
- Return at most 250 words, beginning with your self-reported model.

## Results

Self-reported model: claude-opus-5-5 (timesheet-auditor). Attempt 1, 2026-10-27 16:18Z-17:3xZ. Review pair
`handoff/delivery/WP5_UX5_RECHECK_A.md` (+ `.vi.md`); evidence `handoff/delivery/evidence/WP5-UX5-RECHECK-A/` (116 masked LF `.txt` and
9 `-synthetic.png`, index `00-README.txt`).

**Decision: FIX REQUIRED** (one new Low finding; every old finding fixed).

- **Target and digest.** HEAD = local origin/main = `a5533b57daa81a340c0ad9dfe5f5feac4e6ce1f5` before and after; no status line outside
  `handoff/`. Digest `4147751090b5511ea56225bb7bf9a33225602cc705eb906a13477cec9101869f`, 882 files, equal in three forms (export
  hash-object, `git ls-tree`, `npm run digest`) at 16:18:19Z and 17:24:40Z.
- **Mandatory checks (clean export, Node 24.21.0):** typecheck 0, lint 0 (no deprecation), `npm test` 0 (101 files, 2384 tests), build 0
  (main 491.83 kB, no chunk advisory, asset names as FIX10/REGATE6), AC-13 1/1; real-clock FULL e2e 2 workers exit 0: 871 passed, 131
  skipped, 0 failed (desktop 466/35, mobile 405/96), 28.8 min, no rerun.
- **Old findings:** F-UX5A-1 fixed (36 measurements at 1440-320px, both themes and projects: no overlap, button 8.00px inside and on the
  line, rows and columns aligned 0.00px, B11/PDF fractions from 768px, image >= 135px, drops under the content at <= 1149px (1164px with a
  classic scrollbar); PDF geometry untouched). F-UX5A-2 fixed (Chromium AX name = shown words at every width 320-1440; no doubling).
  F-UX5A-3 fixed in Chromium (swipes cancelled, taps close with focus, Keep editing/Discard, classic thumb/track/arrows/window scrollbar
  ignored, pen/mouse unchanged, phone backdrop test passes). F-UX5A-4 fixed (each replaced line checked against the build).
- **New finding F-UX5A2-1 (Low):** FIX9's read-only week-card focus outline (`styles.css:2962-2967`) is covered by the
  `position: relative` day columns on the right and bottom edges (coverage right 8.5%, bottom 0-13%; left too once scrolled); not the shared
  ring; docs/04:50 / vi:51 and comments (`TimesheetSheet.tsx:154-158`, `styles.css:2962`) claim the shared ring; no test checks it (my
  mutant MA8 survives). WCAG 2.2 AA itself is met (top edge always visible, >= 4.80:1).
- **FIX9 otherwise:** stop exactly while overflowing (1px sweeps, overlay and classic scrollbars), name, ArrowRight, `revealFocused`, no extra
  stop at 1280/1440, editable cards unchanged.
- **Regressions:** none; axe-core 4.14.0 104 scans 0 violations; 12 keyboard walks 1,558 stops, a ring on each, 0 wholly hidden once settled;
  no sideways page scroll 320-1440.
- **FIX10:** proves what the old tests proved; PNG decoder equals the browser's decoder (0 of 65,600 pixels differ); own mutants MF1, MF1b,
  MF2, MF4, MF5 caught; MF3 equivalent, MF3b within tolerance. Logo margin acceptable for the 6-worker sweep (about 35%), load-sensitive.
- **Own mutants:** 17, 11 caught; not caught MA1, MA5 (a touch-end listener that is never removed: every later tap dead), MA8, MA9.
- **Risks R1-R8 and backlog:** none became a defect; `deliveryModel.ts:251` still accurate (an area-B nuance noted).
- **Optional risks:** real iOS/Android event order (R-A2-1), overlay scrollbars unverified (R-A2-2), focus to `body` on widening (R-A2-3),
  test gaps (R-A2-4), logo load sensitivity (R-A2-5); dev-only npm advisories for area B (`--omit=dev` 0).
- **Slips and incidents:** `99-slips.txt` (one read-only `| head`, one blocked `sleep`, and a probe of mine, `zz-ra-surface2.spec.ts`,
  that made a million expect steps and kept its own worker busy; see the review's "Required gates unrun or blocked"). An editor temp
  file `WP5_UX5_RECHECK_A.md.tmp.*` appeared beside the review (Dropbox and the Edit tool) and was removed with a single-file `rm -f`.
- **Next action:** a fix task for F-UX5A2-1, then a scoped regate and a recheck of area A.

Status: done
