# WP5-UX4-AUDIT-A dispatch brief (area A: visual, shell, Day editor, dialogs, accessibility)

- **Task.** Mission timesheet-software-readiness, task WP5-UX4-AUDIT-A, package WP5, kind
  audit, attempt 1.
  - It depends on WP5-UX4-REGATE (PASS). WP5-UX4-GATE on a3042dd failed, and
    WP5-UX4-FIX1 fixed it.
  - Run in a fresh context. It runs in parallel with WP5-UX4-AUDIT-B, which uses other ports
    and other folders.
- **Profile and routing.** timesheet-auditor, requested opus/xhigh, no override. Routing:
  size L, risk M, novelty no.
  - Write the task record in English.
  - The review pair is `handoff/delivery/WP5_UX4_REVIEW_A.md` and `.vi.md`. Use the REVIEW
    template in `handoff/templates/`.
- **Author separation.** You wrote no WP5-UX4 task; their agent IDs are on the board. Treat
  every worker, planner, committer and verifier report as a claim.
- **Target.**
  - `reviewed_commit` = TARGET_SHA = 0ddfeada1b66c82b066b179e901184ca5d857793 (the
    WP5-UX4-FIX1-FREEZE commit).
  - TARGET_DIGEST = b3e9c9626aeed74443d8cffd867cf8f88f06d4487d0d25986fe62dcd071a1fda
    (849 files).
  - Record HEAD, the digest before and after (three forms, as the gate did) and
    `reviewed_commit`.
  - Any change outside `handoff/` invalidates the audit. Work on a clean export or a
    scratch clone at TARGET_SHA.
- **AGENTS.md on disk wins.** Its UI section is "Frontend and UI/UX standards".

## Read

- AGENTS.md from disk; docs/08 "Gates and independent audit".
- The owner's words: board `owner_decisions` of 2026-10-20, the round-4 request and the
  F-1..F-5 answers, verbatim. Also `coordinator_decisions` of 2026-10-20.
- The plan `handoff/delivery/tasks/WP5-UX4-PLAN.md` (Results A, D and E) and the mockup
  `handoff/delivery/design/WP5-UX4/mockup.html` with its renders.
- The slice records `WP5-UX4-T01.md`, `T02.md` (with Addendum 1), `T03.md` and `T05.md`;
  the gate `WP5-UX4-GATE.md`; `WP5-UX4-FIX1.md`; `WP5-UX4-REGATE.md`; and their evidence.
- docs/04, docs/10 and docs/12, EN and VI, as frozen.

## Scope (area A)

1. **Owner fidelity.** For U4-02, U4-03, U4-04, U4-05, U4-06, U4-07, U4-08, U4-09, U4-10,
   U4-12, U4-13, U4-14 and U4-15, check the build against the owner's own words, including
   the F-5 changes:
   - a 32px title gap;
   - the toolbar, weeks and footer unchanged inside one paper sheet;
   - signatures and dates in two rows;
   - a free paper style;
   - Today/Now right-aligned to their inputs;
   - a stronger week header row and first column with readable text.

   Give one verdict per item, with evidence (a screenshot or a measurement). Also give
   mockup fidelity where the owner did not override it.
2. **The style system:**
   - the new tokens (`--paper-*`, `--sheet-head-strong`, `--page-head-gap`,
     `--sheet-min-width`, `--break-time-slot-w`, the transfer styles) in the light set and
     both dark sets;
   - the transition rule: one `--transition`, never `all`, reduced motion;
   - forced colours (the select chevron);
   - the AGENTS UI section in practice;
   - docs/04 "Visual standard" accurate.
3. **Day editor (U4-05, U4-06, U4-07):**
   - non-modal from 768px;
   - switch and unselect;
   - focus order sheet to panel; Escape;
   - the phone bottom sheet;
   - the discard guard on every route in the T02 Addendum 1 inventory, with Keep editing
     restoring everything, including the period shown;
   - corners and the push geometry;
   - the 1330/1345px rule: check the classic-scrollbar reasoning and the one change per
     crossing;
   - SC 2.4.11, with your own walks at several widths from 768 to 1329, other seeds, both
     dock sides and DPR 2.

   Judge the two routes left unguarded by design: leaving the page through a link, and the
   reload after a label or batch commit changed the open day. Is each acceptable under the
   owner's request and docs/04, or a defect?
4. **Session and Check out dialogs, UI part:**
   - the zone first;
   - Today/Now: right-aligned, accessible names containing the visible word, 44px on touch;
   - aligned break rows in the rows, two-line and chip layouts;
   - the alert dialog: initial focus, Escape = OK, focus return, in view at 1440 and 390;
   - no `p.error` left;
   - the running-session edit dialog layout.
5. **Review:**
   - the paper;
   - the two-column switch moved from 1200 to 1330px (T01 deviation): is it justified, and
     does Review at 1280 work as one column?
   - the footer without its own shadow. The owner was offered a hairline option; give your
     view.
6. **Settings, Administration and Profile UI:**
   - the export and import card and preview dialog: labels, a real comparison table, focus;
   - the company card;
   - Profile Change password: labels, autocomplete, errors announced.
   - **The lazy card layout shift** found by FIX1 item 5: the card arrives after its chunk
     loads and can push a focused link out of view. Is a product mitigation needed, such as
     reserving the card's height, or is the test-side wait acceptable? Give a verdict.
7. **WCAG 2.2 AA:**
   - your own keyboard walks, desktop and phone, light and dark;
   - a real axe scan of the round-4 screens. Load the engine from a temporary folder; add no
     dependency;
   - contrast of every new surface and state, in light, dark and both manual overrides;
   - 44px targets below 768px;
   - no page-level horizontal scroll at 320 to 1440.
8. **Test strength.** Write at least eight mutants of your own on area-A behaviour, for
   example:
   - the paper wrapper;
   - the title gap;
   - the chevron;
   - the re-dock tolerance;
   - the unselect toggle;
   - the discard guard on Today;
   - the corner side;
   - the zone order;
   - the alert focus return;
   - the break slot width.

   Say whether the suite catches each.
9. **Mandatory checks yourself:**
   - typecheck, lint, `npm test` twice, build (no chunk advisory);
   - the full e2e on both projects on the real clock;
   - AC-13 once.

   Another auditor runs at the same time. A failure whose trace shows a network or buffer
   error may be rerun once; record both runs.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX4-AUDIT-A`. Ports 49500-49529.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every server or CLI run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash only, never cmd.exe or an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `node -e`, NO
  `| node`, NO `| python`. NEVER PIPE INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM
  `/dev/null`, `/dev/stdout`, `/dev/stdin` OR `nul`. NEVER `rm -r`.**
  - Write probes as files in the task folder and run them.
  - Read outputs with the Read tool.
- Never kill processes by PID, and leave nothing running.
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
- Evidence in `handoff/delivery/evidence/WP5-UX4-AUDIT-A/`: masked LF `.txt` and
  `-synthetic.png`.
- The decision: PASS, FIX REQUIRED or NOT VERIFIED.
  - Number each finding, with its severity, file:line, reproduction and expected result.
  - List optional risks separately.
- Return at most 250 words, beginning with your self-reported model.

## Results

### Checkpoint 1 (2026-10-21T15:55Z, in progress; superseded by the final result below when present)

Self-reported model: claude-opus-5-5. Task folder `D:\.claude-tmp\timesheet\WP5-UX4-AUDIT-A`. HEAD = origin/main = target
0ddfeada; digest before b3e9c962 (849 files) in three equal forms. Core checks done (typecheck, lint, `npm test` x2, build,
AC-13: exit 0). Full e2e real clock: 773 passed, 96 skipped, 1 failed (mobile `day-editor.spec.ts:4022`, console
`net::ERR_NO_BUFFER_SPACE`), rerun alone passed. Probes so far reproduce three findings: a layout flap with a classic
scrollbar (U4-07), Escape from a sheet control with unsaved edits does nothing (U4-05 guard), and "Current period" Keep
editing returns focus to Today. Remaining: axe scan, SC 2.4.11 walks, mutants, digest after, review pair.

### Auditor result (attempt 1) - decision: FIX REQUIRED

Self-reported model: claude-opus-5-5 (timesheet-auditor; not weaker than the strongest author model, claude-opus-5-5). Fresh
context; I authored no WP5-UX4 task. Review pair: `handoff/delivery/WP5_UX4_REVIEW_A.md` and `.vi.md`. Evidence:
`handoff/delivery/evidence/WP5-UX4-AUDIT-A/` (146 masked LF `.txt`, 13 `-synthetic.png`; probe and script sources as
`zz-src-*.txt`). Task folder `D:\.claude-tmp\timesheet\WP5-UX4-AUDIT-A`.

**Identity.** `reviewed_commit` 0ddfeada1b66c82b066b179e901184ca5d857793; HEAD = origin/main = target before and after; no
status line outside `handoff/` before or after. Digest b3e9c9626aeed74443d8cffd867cf8f88f06d4487d0d25986fe62dcd071a1fda, 849
files, equal in three forms (export hashed with `git hash-object --no-filters`, `git ls-tree`, `npm run digest`) at 15:01:20Z
and at 16:51:39Z (`01-*-before.txt`, `01-*-after.txt`).

**Mandatory checks** (clean export, Node v24.21.0, `--trace-deprecation --pending-deprecation`): `npm ci` 0; typecheck 0; lint
0 (no deprecation line); `npm test` twice 0 and 0 (97 files, 2226 tests each, no worker crash); build 0 (main
`index-DURkl3lw.js` 489.31 kB, no chunk advisory); AC-13 0 (1/1). FULL e2e on the real clock, both projects, 15:06-15:30Z
(08:06-08:30 PDT, period 10/12-10/25): exit 1, 773 passed, 96 skipped, 1 failed (mobile `day-editor.spec.ts:4022`, console
`net::ERR_NO_BUFFER_SPACE` at sign-in); desktop 402/33/0, mobile 371/63/1; that test rerun alone once: passed.

**Findings** (details, reproductions and bounded fixes in the review):
1. Medium, `src/client/components/useEditorLayout.ts:28, 38-43` (+ `styles.css:3753-3761`): with a classic 15px scrollbar the
   drawer flips beside/floating at about 60 changes per second at window 1330-1344 wide when the window height lies between the
   floating (1369px) and beside (1442px) page heights (180-182 changes in 1.5 s at 1335/1340/1344x1370; 600 in 10 s at
   1340x1400). Contradicts docs/04 line 66 ("cannot flap") and the U4-07 "one change per crossing"; no test uses a classic
   scrollbar.
2. Low, `src/client/DayEditor.tsx:155-164`: Escape on a sheet control with unsaved edits opens the discard question, which the
   same unprevented key press cancels at once; nothing visible happens (docs/04 line 67, T02 Addendum 1 route "Escape").
3. Low, `src/client/components/PeriodBar.tsx:147-151`: "Current period" then Keep editing leaves focus on "Today" (window day
   2026-10-26 under the simulated clock).
4. Low, docs/04 lines 67 and 108 (EN and VI): the hover-tint rule does not describe the link buttons' transparent hover; the guard
   sentence does not name the two unguarded routes that docs/10:277 and docs/12:95 list.

**Passed with my own measurements:** U4-02 (32.00px, 768-1920, four theme situations, Review too), U4-03 (one paper, two
signature rows, base-vs-target style snapshot equal except the intended changes), F-5 fill (1.27/1.36:1 from white cells,
1.09/1.20:1 from the Mon/Tue cells; text 12.30/9.91 and 4.59/4.83:1), U4-04, U4-05 (non-modal, switch, unselect, focus order,
Escape inside the drawer, every other guard route with Keep editing and Discard, phone sheet), U4-06 (corners, gaps, 32px
clearance), U4-07 with overlay scrollbars (1329/1330, one change per crossing), U4-08, U4-09 (0.00px), U4-10, U4-12, U4-13
(right edges 0.00px; names contain the word; 44x44 on touch), U4-14, U4-15 (in view at 1440/768/390, OK focus, Escape = OK,
focus return, no `p.error`), running edit layout, Review (1330 switch justified; 1280 one column works), Settings card and
preview table, company card, Change password. axe-core 4.14.0 0 violations in 102 scans (text min 4.59/4.83:1). SC 2.4.11: 96
walks (768-1329, both sides, batch on/off, DPR 1 and 2), 0 controls wholly hidden after the frame. No page horizontal scroll at
320-1440. Unguarded routes judged acceptable (docs/04 to mention them). Lazy card shift: test-side wait acceptable; no product
mitigation required (optional).

**Mutants:** 14 of my own (paper, title gap, chevron, re-dock tolerance, unselect, Today guard, corner side, zone order, alert
focus, break slot, header fill, Today/Now alignment, period step order, document Escape); all caught by assertions; M4 only by
the unit test. Sources byte-identical afterwards.

**Slips and notes.** Several first probe runs failed on my own locators and were rerun (kept as `*-run*.txt`). One read-only
`tail -n 3` on a file (not a pipe). The Playwright harness picks its own free loopback ports; `SMOKE_PORT` 49501 was set but the smoke script was not run (not required). No heredoc, no stdin
to node or python, no PID kill, no recursive delete. Nothing left running. No source, test, doc, board or STATE edited.

Status: done (decision FIX REQUIRED)
