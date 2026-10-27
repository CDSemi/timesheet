# WP5-UX5-AUDIT-A dispatch brief (area A: visual, shell, Timesheet, Day editor, Review UI, accessibility)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-AUDIT-A, package WP5, kind
  audit, attempt 1.
  - It depends on WP5-UX5-REGATE4 (PASS on f4049aa / 26b163a6). The gate history:
    - WP5-UX5-GATE on e2bf1aa failed; FIX1 fixed it.
    - WP5-UX5-REGATE on 2bce0ab failed on one test race; DIAG1 diagnosed it and FIX2 fixed
      it.
    - WP5-UX5-REGATE2 on 7aafa21 failed on two load flakes; FIX3 fixed them in tests.
    - WP5-UX5-REGATE3 on 5b8b718 failed on:
      - two sweep test defects;
      - a keep-alive harness defect;
      - two new `npm audit` advisories.

      DIAG2, DEPS1 and DIAG3 diagnosed them. FIX4 pinned the dependencies, FIX5 fixed the
      tests and FIX6 fixed the harness and the vitest worker cap.
    - WP5-UX5-REGATE4 passed.
  - **Owner decisions of 2026-10-22** ("A.a, B.A, C.b"):
    - the target includes the owner's Ingat commits 6173f07, 70dce2a and 782cdda (the
      latter through the owner's merge b8bae50). They are outside your scope;
    - the font-scan test skips `.claude/`. Never touch `.claude/worktrees/`.
  - The owner allows pushes to main; the target is pushed.
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
  - `reviewed_commit` = TARGET_SHA = f4049aa7905e22f1467dfcae4208675cb2fc8e80. It is the
    WP5-UX5-FIX6-FREEZE commit, pushed, and the package-final snapshot of rounds 4 and 5,
    on top of the owner's Ingat merge b8bae50.
  - TARGET_DIGEST = 26b163a62b7d85dbf6b6146c73f98593ad6bcae7eeb8fb1dc7fd9d4dc8305336
    (882 files).
  - HEAD may be a later commit that changes only `handoff/`.
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
- **The fix rounds after REGATE:** `WP5-UX5-DIAG1.md`, `WP5-UX5-FIX2.md`,
  `WP5-UX5-REGATE2.md`, `WP5-UX5-FIX3.md`, `WP5-UX5-REGATE3.md`, `WP5-UX5-DIAG2.md`,
  `WP5-UX5-FIX5.md`, `WP5-UX5-DIAG3.md`, `WP5-UX5-FIX6.md` and `WP5-UX5-REGATE4.md`, with
  their evidence.
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
10. **The e2e test changes of the fix rounds** (FIX2, FIX3, FIX5, and the FIX6 health
    poll in `tests/e2e/fixtures.ts`):
    - waits are state-based, with no fixed sleep;
    - no assertion is looser, and no check is removed;
    - each test still proves the owner-visible behaviour it names.

    **Today across midnight (FIX5 A).** FIX5's mutant M1 was caught by the earlier
    pre-click count check, not by the new poll. The poll's date compare is proven only by
    DIAG2's old/fixed probe, which REGATE4 reran.
    - Write your own mutant that only that date compare can catch. For example, the app
      stops refreshing Today on focus once the date has changed.
    - Run it at the LA midnight crossing with the FIX10 simulated-clock wrapper
      (`handoff/delivery/evidence/WP5-UX-FIX10/`).
    - Say whether the suite catches it.

    **The Sign off dialog layout shift (DIAG2 B).** The employee line grows by about 23 px
    when the saved signature image loads late (`SignoffDialog.tsx:168`, `styles.css:5746`).
    The coordinator deferred reserving the image box to the WP5 optional backlog. Judge
    whether that is acceptable, or a defect under document 04 and WCAG 2.2 AA.
11. **Mandatory checks yourself:**
    - typecheck, lint, `npm test` twice, build (no chunk advisory);
    - the full e2e on both projects on the real clock;
    - AC-13 once.

    Another auditor runs at the same time. A failure whose trace shows a network or buffer
    error, or a test timeout, may be rerun once; record both runs.

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
- Never kill processes by PID, and never use `Stop-Process`. Leave nothing running. Before
  returning, make sure none of your background commands is still running.
- No FIFO waiter scripts such as `waitfor.sh`. To wait for a long command, use the Bash
  tool's own background run and its exit notice.
- **Never change any git configuration,** including `safe.directory`. For a scratch clone,
  use a per-process override:
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
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

### Auditor result (attempt 1) - decision: FIX REQUIRED

Self-reported model: claude-opus-5-5 (timesheet-auditor; not weaker than the strongest author model, claude-opus-5-5). Fresh context;
I authored no WP5-UX4 or WP5-UX5 task. Review pair: `handoff/delivery/WP5_UX5_REVIEW_A.md` and `.vi.md`. Evidence:
`handoff/delivery/evidence/WP5-UX5-AUDIT-A/` (masked LF `.txt`, 10 `-synthetic.png`, index `00-README.txt`). Task folder
`D:\.claude-tmp\timesheet\WP5-UX5-AUDIT-A`.

**Identity.** `reviewed_commit` f4049aa7905e22f1467dfcae4208675cb2fc8e80 = HEAD before and after; no status line outside `handoff/`.
Digest 26b163a62b7d85dbf6b6146c73f98593ad6bcae7eeb8fb1dc7fd9d4dc8305336, 882 files, equal in three forms at 03:26:44Z and 04:12:21Z.

**Mandatory checks** (clean export, Node v24.21.0): `npm ci` 0; typecheck 0; lint 0; `npm test` 0 and 0 (101 files, 2374 tests each);
build 0 (main 490.79 kB, no chunk advisory); AC-13 0 (1/1). FULL e2e, real clock, both projects, 03:29:54-03:53:37Z: 863 passed, 125
skipped, 0 failed, exit 0; no rerun.

**Findings:**
1. F-UX5A-1 Medium: a signed period's Review page (any revisit) puts the signed mark and "Sign correction" in the employee line; at
   480/390/320px the content is 21px, the name breaks by letters, the button covers "Signed", the lines lose alignment
   (`ReviewScreen.tsx:242`, `ReviewDays.tsx:68-81`, `TimesheetSheet.tsx:453-469`, `styles.css:5714-5762`).
2. F-UX5A-2 Low: SC 2.5.3: visible "Change days" (below about 344px) vs name "Change several days" (`TimesheetScreen.tsx:687-703`).
3. F-UX5A-3 Low: a touch swipe from outside a day column (1024 touch) or a press on a week card's scrollbar (900, classic) closes the
   drawer (`TimesheetScreen.tsx:596-609`).
4. F-UX5A-4 Low: docs/04 :49, :103, :105, :111, :124, docs/12 :54, :116 (EN and VI) and `styles.css:154-156`, `:345`, `:2826` are stale.

**Passed with my own measurements:** U5-01..U5-29, U5-31, U5-32 (U5-17b except its name, U5-24 except F-3); the recorded deviations are
acceptable; useBlockSize hardening is a recorded risk, not needed now; DIAG2 B shift acceptable as backlog. Fractional widths 479.333
and 767.333 reached in Edge at 150% (window through CDP; about:blank frame): one layout per width. F-UX4A-1..4 fixed. axe 4.14.0: 108
scans, 0 violations; text contrast min 4.59/4.65; keyboard walks 1,440 stops, 0 wholly hidden; targets 44px or hit areas. Mutants 17:
15 caught; M2 (ladder end-day step) not caught; M13 (focus refresh keeps the old date) caught at the LA crossing only by
`today.spec.ts:626`, not by the `showToday` poll (control 18 passed). Fix-round e2e changes: state-based waits, nothing loosened.

**Slips.** One `node.exe -e "1" 2>/dev/null` no-op typed before a grep; one `sleep 1`; `sed -i` on task-folder files. No heredoc, no
stdin to node or python, no head/tail pipe, no PID kill, no rm -r, no git config change. Nothing left running; no source, test, doc, board
or STATE edited.

Status: done (decision FIX REQUIRED)
