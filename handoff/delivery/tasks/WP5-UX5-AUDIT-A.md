# WP5-UX5-AUDIT-A dispatch brief (area A: visual, shell, Timesheet, Day editor, Review UI, accessibility)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-AUDIT-A, package WP5, kind
  audit, attempt 1.
  - It depends on WP5-UX5-REGATE2 (PASS required).
    - WP5-UX5-GATE on e2bf1aa failed, and FIX1 fixed it.
    - WP5-UX5-REGATE on 2bce0ab failed on one test race; DIAG1 diagnosed it and FIX2 fixed
      it.
  - **Owner decisions of 2026-10-22** ("A.a, B.A, C.b"):
    - the target is a local commit, not pushed;
    - it includes the owner's Ingat commits 6173f07 and 70dce2a, which are outside your
      scope;
    - the font-scan test skips `.claude/`. Never touch `.claude/worktrees/`.
  - Run in a fresh context. It runs in parallel with WP5-UX5-AUDIT-B, which uses other
    ports and other folders.
- **Profile and routing.** timesheet-auditor, requested opus/xhigh, no override. Routing:
  size L, risk H, novelty no.
  - Write the task record in English.
  - The review pair is `handoff/delivery/WP5_UX5_REVIEW_A.md` and `.vi.md`. Use the REVIEW
    template in `handoff/templates/`.
- **Author separation.** You wrote no WP5-UX4 or WP5-UX5 task; their agent IDs are on the
  board. Treat every planner, worker, committer and verifier report as a claim.
- **Target.**
  - `reviewed_commit` = TARGET_SHA = 7aafa21bc1c6efc70c0fa8691c3a1165841aeb45 (the
    WP5-UX5-FIX2-FREEZE commit, local and not pushed; the package-final snapshot of rounds
    4 and 5).
  - TARGET_DIGEST = 59516a2d0abe1294aa3aebbbc88dd2327dc2980dd139d6f3591054b95c25f0ad.
  - Record HEAD, the digest before and after (three forms, as the gate did) and
    `reviewed_commit`.
  - Any change outside `handoff/` invalidates the audit. Work on a clean export or a
    scratch clone at TARGET_SHA.
- **AGENTS.md on disk wins.** Its UI section is "Frontend and UI/UX standards".

## Read

- AGENTS.md from disk; docs/08 "Gates and independent audit".
- **The owner's words**, verbatim on the board (`owner_decisions`):
  - 2026-10-21: the round-5 request; the answers F-1..F-10 and the mockup adjustments; the
    mockup notes 2; mockup adjustment 3 and its correction;
  - 2026-10-22: "1 a, 2 a";
  - 2026-10-20 / 2026-10-21: the round-4 answers (R2 a, R3 b dropped, R4 a, R5 b);
  - the `coordinator_decisions` of 2026-10-20 to 2026-10-22.
- The plan `handoff/delivery/tasks/WP5-UX5-PLAN.md` (sections A, B3, D, E and every
  addendum) and the mockup `handoff/delivery/design/WP5-UX5/mockup.html` with its renders.
- The round-5 slice records `WP5-UX5-T03.md`, `T04.md`, `T05A.md`, `T05B.md` and
  `T06.md`; the gate `WP5-UX5-GATE.md`, `WP5-UX5-FIX1.md` (including `TableWrap.tsx`) and
  `WP5-UX5-REGATE.md`; and their evidence.
- **The round-4 findings** you recheck: `WP5-UX4-AUDIT-A.md` (F-UX4A-1..4),
  `WP5-UX4-FIX2.md` and `WP5-UX4-FIX3.md` (R5 b replaced FIX2's `html{overflow-y:scroll}`
  with a probe-measured scrollbar width).
- docs/04, docs/10 and docs/12, EN and VI, as frozen.

## Scope (area A)

1. **Owner fidelity, round 5.** For each UI item U5-01..U5-32, check the build against the
   owner's own words, the answers and the mockup notes. Give one verdict per item, with
   evidence (a screenshot or a measurement). The owner's corrections win over plan text:
   - F-1 a: 36px sub-buttons with 44px hit areas;
   - F-6 a: only the sheet's compact form moves to 480px;
   - F-7 a: an outside press keeps control actions;
   - B1, B2 and the Change-days ladder;
   - B5: Notes stay;
   - B7/B9 and Addendum 3b: two signature rows with the B11 insets, and Sign off at the
     line end inset 8px;
   - F-3 b and F-4: the Send card is edited per send, with the reason dialog;
   - F-5 b: the image is optional.

   Judge the recorded deviations:
   - T03: "From" before a revision exists, and "PDF Preview" in a new tab;
   - T04: the shared-view wordmark from 492px, and the measured period-card thresholds;
   - T05A: the re-measured toolbar thresholds, the late "+1" wrap fallback, and the Review
     header `nowrap` against U5-16;
   - T05B: `LeaveRow.tsx` not reused; `preventDefault` on the outside press; the "saved"
     status out of view after a foot save; a bare top-bar press closing the drawer.

   Say for each whether it is acceptable or a defect.

   Also judge one optional risk passed on by the coordinator (WP5-UX5-DIAG1):
   - `useBlockSize.ts` observes the content box while it writes the border-box height, so
     a padding- or border-only change of the shell bar would leave `--shell-bar-size`
     stale;
   - no current style does that;
   - the proposed one-line hardening is `observer.observe(node, { box: 'border-box' })`.

   Is it needed now, or is it a recorded risk?
2. **The style system:**
   - new tokens (`--sig-*`, `--compact-edge`, `--period-step-gap`, `--subbtn-h`,
     `--theme-seg-h`, `--worked-line`, `--select-arrow-*`, the Send card and dialog widths)
     in the light set and both dark sets where they are colours;
   - one `--transition`, never `all`; reduced motion;
   - forced colours (the one-layer chevron);
   - docs/04 "Visual standard" accurate.
3. **Breakpoints (U5-01, U5-15).** Do every CSS rule and `matchMedia` switch together at
   480 and 768? Is there a width with no layout, including fractional widths? Try your own
   method to reach 479.33 and 767.33 CSS px, for example a zoom factor or CDP emulation, and
   say whether it works.
4. **Timesheet:**
   - the top bar and wordmark (U5-02);
   - the period card wide and narrow, the range ladder and its accessible text, U5-14 with
     H-1 a, and Current period;
   - the header wrap order;
   - the toolbar rows;
   - ranges spaced and tight;
   - worked lines;
   - the WEEK bar;
   - Today spacing;
   - compact margins.
5. **Day editor (U5-23..U5-26):**
   - the outside-press matrix and the discard guard on every route;
   - the phone backdrop;
   - focus return;
   - the Partial leave dialog: Done, Cancel, Escape, Remove, the reason field, and the
     dirty guard seeing the draft;
   - the phone foot Save and no Figures;
   - the square drawer.
6. **Review UI (U5-27..U5-32):**
   - title and chips;
   - the check card;
   - the Preview card (hide not wrap; word wrap);
   - signature geometry against the PDF;
   - the Sign off dialog content, errors, focus and the signed footer;
   - Send card fields, field errors, switches, PDF Preview / Save PDF, the state chip, and
     the reason dialog flow on the client;
   - grantees see none of it.
7. **Round-4 rechecks.** For F-UX4A-1 (the classic-scrollbar flap), F-UX4A-2 (Escape),
   F-UX4A-3 (Current-period focus) and F-UX4A-4 (docs), give: fixed, still open, or
   regressed by round 5. Use your own reproduction at the reported widths, with a classic
   scrollbar.
8. **WCAG 2.2 AA:**
   - your own keyboard walks, desktop and phone, light and dark (SC 2.4.11 with the drawer);
   - a real axe scan of the round-5 screens. Load the engine from a temporary folder; add
     no dependency;
   - contrast of every new surface and state, in light, dark and both manual overrides;
   - 44px targets, or hit areas, below 768px and with a coarse pointer;
   - SC 2.5.3 for the shortened labels ("Back", "Open", "Change days", "Send");
   - no page-level horizontal scroll at 320 to 1440.
9. **Test strength.** Write at least ten mutants of your own on area-A behaviour, for
   example:
   - one media rule back to `max-width`;
   - the ladder;
   - U5-14 for an in-progress period;
   - the Change-days right alignment;
   - the hit area;
   - the outside press on Today;
   - Done saving;
   - the phone foot;
   - the company line wrapping;
   - the Sign off inset;
   - Send enabled before sign-off;
   - the reason dialog skipped.

   Say whether the suite catches each.
10. **Mandatory checks yourself:**
    - typecheck, lint, `npm test` twice, build (no chunk advisory);
    - the full e2e on both projects on the real clock;
    - AC-13 once.

    Another auditor runs at the same time. A failure whose trace shows a network or buffer
    error may be rerun once; record both runs.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-AUDIT-A`. Ports 49860-49889.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every server or CLI run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash only, never cmd.exe or an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `node -e`, NO
  `node -` OR `python -`, NO `| node`, NO `| python`. NEVER PIPE INTO `head` OR `tail`.
  NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul`,
  ALSO NOT IN `2>`. NEVER `rm -r`.**
  - Write probes as files in the task folder and run them.
  - Read outputs with the Read tool.
- Never kill processes by PID, and leave nothing running. Before returning, make sure none
  of your background commands is still running.
- Put Node 24 first on PATH for every node or npm call.
- Run the digest before any long probe.
- Create files only in the task folder, the evidence folder and the review pair.
- Use synthetic data only.
  - Screenshots end in `-synthetic.png`, at most 16.
  - No email address except the full synthetic `@example.invalid` form.
  - Write `<user>` for profile paths.
- If a permission check denies a call, stop and report.

## Output

- The review pair.
- Results in this file.
- Evidence in `handoff/delivery/evidence/WP5-UX5-AUDIT-A/`: masked LF `.txt` and
  `-synthetic.png`.
- The decision: PASS, FIX REQUIRED or NOT VERIFIED.
  - Number each finding (F-UX5A-n), with its severity, file:line, reproduction and expected
    result.
  - List optional risks separately.
- Return at most 250 words, beginning with your self-reported model.

## Results
