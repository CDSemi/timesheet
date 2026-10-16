# WP5-UX3-AUDIT-A dispatch brief (area A: visual, shell, settings, sheet, accessibility)

- Mission/task: timesheet-software-readiness / WP5-UX3-AUDIT-A; package WP5; kind audit;
  attempt 1; depends on WP5-UX3-REGATE (PASS required; WP5-UX3-GATE attempt 1 on cecfceb
  failed and was fixed by WP5-UX3-FIX1 and WP5-UX3-FIX2); fresh context. Runs in parallel
  with the read-only WP5-UX3-AUDIT-B (other ports, other folders).
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size L,
  risk M, novelty yes. Task record in English; review pair
  `handoff/delivery/WP5_UX3_REVIEW_A.md` and `.vi.md` (REVIEW template in
  `handoff/templates/`).
- Author separation: you did not write any WP5-UX3 task (their agent IDs are on the board).
  Treat every worker, planner and verifier report as a claim.
- Target: `reviewed_commit` = TARGET_SHA = 7ce4e95a0c4477374e981132d93b11aedab2e384 (the
  WP5-UX3-FIX2-FREEZE commit) with the regate digest TARGET_DIGEST =
  262138e0c94c90dc0287e6de87e69f2aabfa68d3bd7bdb6262322c1e2b8f0191 (833 files). Record HEAD,
  the digest before and after (three forms as the gate did) and `reviewed_commit`. Any change outside `handoff/` invalidates the audit; run on a clean
  export or a scratch clone at TARGET_SHA if the working tree is not clean outside
  `handoff/`.
- **AGENTS.md on disk wins** (its UI section is "Frontend and UI/UX standards").

## Read

- AGENTS.md (from disk), docs/08 "Gates and independent audit".
- The owner's words: board `owner_decisions` of 2026-10-15/16 (verbatim request and answers)
  and `coordinator_decisions` (including the audit-focus list and its addendum).
- `handoff/delivery/tasks/WP5-UX3-PLAN.md` and `WP5-UX3-PLAN2.md` (Results), the mockup
  `handoff/delivery/design/WP5-UX3/mockup.html`, the slice records T01-T05, T05B, T07 and
  T10, `WP5-UX3-GOV.md`, the failed gate record `WP5-UX3-GATE.md`, the fix-round records
  `WP5-UX3-FIX1.md`, `WP5-UX3-SWEEP.md` (a planner's read-only sweep: a claim, not an audit)
  and `WP5-UX3-FIX2.md` (with Addendum 1), and the regate record `WP5-UX3-REGATE.md` with
  their evidence.
- docs/04, docs/10, docs/12 (EN and VI) as frozen.

## Scope (area A)

1. **Owner fidelity** for U-01..U-20 and U-27 against the owner's own words, with G-1 (b)
   conditions (square week sheets, 4px lifted columns, no shadow over a neighbour, no
   squeezed or overlapping column content, the floating panel), G-2 (a), G-5 (b) and the
   wordmark question U-06. One verdict per item with evidence (screenshot or measurement).
2. **Style system**: tokens in the light set and both dark sets (parity), the transition
   rule (one `--transition`, local durations, never `all`, reduced motion), the AGENTS UI
   section followed in practice, docs/04 "Visual standard" accurate.
3. **Shell and settings**: identity block and account menu (keyboard, Escape, focus return,
   outside click, hash change), phone More, the wordmark rule at the stated widths, Settings
   sub-pages and redirects, the read-only Profile, lazy chunks and their error state; the
   server-side admin authorization unchanged (an employee sees no Administration and makes
   no `/api/admin/` request; the 403 integration tests pass).
4. **Period bar and header**: title row with check in/out, no name line, pills and the "in
   progress" rule from server periods only (own and shared views), meta row, Open a day row,
   narrow "Sign off"/"Current", toolbar spacing.
5. **Sheet**: lifted runs (one outer shadow; check fractional widths such as 1440 for seams,
   gaps or overlap), the editor frame and Day-cell fill (contrast >= 3:1 on every surface),
   Category/Status names, the "No times" ring, the 108px minimum, the 1360px rule, the
   floating modal panel's dock side, the 768-899px inner scroll.
6. **Editor panel** (area A part): header and chips, session cards, the delete
   confirmation's focus rules, WFH on the Category row.
7. **WCAG 2.2 AA**: no regression of AX-01..AX-10, R-12, B-02, B3-01 and the round-2 items;
   your own keyboard walks (desktop and phone, light and dark); a real axe scan of the main
   screens (engine from a temporary folder, no dependency added); the accessible name of the
   Day editor dialog with CSS-generated brackets in Chromium and one other engine available
   locally (Firefox or WebKit through Playwright, if installed; otherwise say so).
8. **Test strength**: at least eight mutants of your own on area-A behaviour (lift run
   positions, the editor frame layer, the wordmark breakpoint, the menu's Escape focus
   return, the 1360px breakpoint, the pill function, the Settings role check, the Category
   rename) and whether the suite catches each.
9. **Audit-focus items** 1-7 of the board list: a verdict each.
10. **Fix round, area A** (your own probes; each a verdict):
    - FIX1: keyboard focus inside the week card fully visible at 768-899px; the Category
      trigger and break-chip accessible names contain their visible text; the run-level
      shadow layer (no notch at inner joins, no shadow over an adjacent selected column); the
      lifted-column test now independent of the weekday; the account-menu `target-size`
      justification in `WP5-UX3-FIX1.md` (accept or reject it, with your measurement).
    - FIX2 items 1 (focus after an account-menu or More entry: the new page's `h1`, or the
      opener when the page does not change; `tabindex="-1"` headings show no ring after a
      pointer press; `AppShell.tsx` `useRouteHeadingFocus`, including the lazy screens and
      its 5 s wait), 3 (the editor chip by the day's own period), 4 (category wording), 7
      (the Profile test under another device zone), 11 (hover gating, including the two
      extra rules FIX2 gated) and 13 (the Category hint description); the docs/04 line 7
      focus rule (EN and VI).
11. **The regate's two timeouts** (board `coordinator_decisions` 2026-10-16, "regate
    timeouts").
    - In WP5-UX3-REGATE, the first FULL run at the simulated instant
      `2026-12-31T23:30:00-08:00` failed two mobile tests by timeout:
      - `tests/e2e/theme.spec.ts:413` ("computed color is settled", 7 s);
      - `tests/e2e/timesheet.spec.ts:1799` (30 s test timeout).
    - The whole-suite rerun passed, and both tests passed 15 of 15 alone
      (`handoff/delivery/evidence/WP5-UX3-REGATE/log-sweep-full-1231.txt` and
      `log-sweep-rep-1231.txt`).
    - Judge both tests by your own runs and reading:
      - repeat each under full-suite load on the mobile project, at that instant (FIX10
        preload) and on the real clock (for example the full suite with `--repeat-each` on
        those two files, or several full runs);
      - state what each waits for: a fixed wait shorter than a transition, a race, or a
        slow product path.
    - Verdict:
      - a test that can fail at realistic load with no product defect is a FIX REQUIRED
        finding, and so is a product delay behind the failure;
      - load noise with a stated reason is an optional risk.
12. **DPR 2 seams**: repeat the attempt-1 seam crops of a lifted run at DPR 2 (1440 and two
    fractional widths). The regate did not repeat them.
13. **Mandatory checks yourself**: typecheck, lint, `npm test` twice, build (no chunk
    advisory), the full e2e on both projects on the real clock, AC-13 once.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX3-AUDIT-A`; ports 48940-48969; `DATA_DIR` and
  `DATABASE_PATH` inside the task folder for every server or CLI run; never touch
  `%LOCALAPPDATA%\timesheet-dev`.
- Git Bash only; never cmd.exe or an interactive shell. **NEVER FEED ANYTHING TO PYTHON OR
  NODE THROUGH STDIN (NO HEREDOCS, NO `node -e`, NO `| node`, NO `| python`). NEVER PIPE INTO
  `head` OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout` OR `nul`. NEVER `rm
  -rf`.** Write probes as files in the task folder and run them; read outputs with the Read
  tool. Never kill processes by PID; leave nothing running. Run the digest before any long
  probe. Create files only in the task folder, the evidence folder and the review pair.
- Synthetic data only; screenshots end `-synthetic.png` (at most 16); no email address
  except the full synthetic `@example.invalid` form; `<user>` for profile paths.
- If a permission check denies a call, stop and report.

## Output

The review pair, Results in this file, evidence in
`handoff/delivery/evidence/WP5-UX3-AUDIT-A/` (masked LF `.txt` and `-synthetic.png`).
Decision PASS / FIX REQUIRED / NOT VERIFIED with numbered findings (severity, file:line,
reproduction, expected) and optional risks. Return at most 250 words, beginning with your
self-reported model.

## Results

### Checkpoint 1 (2026-10-16, about 18:47Z; auditor, attempt 1)

- Self-reported model claude-opus-5-5 (the strongest author model of the reviewed snapshot is claude-opus-5-5 on the
  board: PLAN, PLAN2, T06, T08, FIX1, SWEEP; so the auditor is not weaker). Fresh context; no WP5-UX3 change authored.
- HEAD 7ce4e95a0c4477374e981132d93b11aedab2e384; working tree clean outside `handoff/`. Digest before, three forms, all
  `262138e0c94c90dc0287e6de87e69f2aabfa68d3bd7bdb6262322c1e2b8f0191`, 833 files (clean `git archive` export hashed with
  `git hash-object --no-filters`; `git ls-tree` form, lists byte-identical; `npm run digest`).
- Task folder `D:\.claude-tmp\timesheet\WP5-UX3-AUDIT-A` with three scratch exports of the target: `export` (pristine, the
  mandatory checks), `export-p` (probes; e2e servers on 48950-48969) and `export-m` (mutants; 48940-48949).
- Done: `npm ci` 0; typecheck 0; lint 0; `npm test` twice 0 (94 files, 2131 tests each); build 0 (main chunk
  `index-4YHzamSq.js` 487.17 kB, no chunk advisory); AC-13 1/1. FULL e2e on the real clock running (area-B auditor active
  at the same time). Regate failure traces read: both failures sit in one ~21 s stall that froze both workers' browsers at
  the same moment.
- Next: probes (DPR 2 seams, shell, sheet, axe, touch, screenshots) beside 11 mutants; then item 11 runs (single suite at
  the 12-31 instant, single on the real clock, two suites at once).

### Checkpoint 2 (about 19:33Z)

- FULL e2e real clock 18:30:07-18:47:25Z: exit 0, 627 passed, 67 skipped, 0 failed (desktop 317/30/0, mobile 310/37/0).
- Probes done: DPR 2 seams clean (light <= 3.0/255 under joins; dark ring-row dip 8.4-9.5/255); shell, settings, sheet,
  dock side, 768-899px card walk, axe (43 scans, only the accepted account-menu target-size), dialog name (Chromium only).
- Five findings drafted: focus ring hidden under the pointer on the sheet date button and Category picker (Medium); an
  ungated sheet hover rule (Low); identity button 38px with a coarse pointer (Low); Sign out icon spacing (Low); mutant A4
  (phone More Escape focus return) survives (Low). Mutants: 10 of 11 caught.
- Review pair being written (`handoff/delivery/WP5_UX3_REVIEW_A.md`); item 11 runs in progress (single suite at the
  2026-12-31 23:30 LA instant started 19:28:40Z).

### Auditor result (attempt 1, done 2026-10-16 about 20:55Z) - decision: FIX REQUIRED

Self-reported model: claude-opus-5-5 (timesheet-auditor, fresh context; equal to the strongest author model of the
snapshot). `reviewed_commit` 7ce4e95a0c4477374e981132d93b11aedab2e384; HEAD the same before and after; nothing outside
`handoff/` changed. Digest `262138e0c94c90dc0287e6de87e69f2aabfa68d3bd7bdb6262322c1e2b8f0191`, 833 files, in three equal
forms (export `git hash-object --no-filters`, `git ls-tree`, `npm run digest`) at 18:26Z and 20:42Z. Review pair
`handoff/delivery/WP5_UX3_REVIEW_A.md` / `.vi.md`; evidence `handoff/delivery/evidence/WP5-UX3-AUDIT-A/` (index
`00-README.txt`, masked LF text, 16 `-synthetic.png`).

Findings (details, file:line and reproduction in the review):
1. Medium: keyboard focus ring removed under the mouse pointer on the sheet date button (`styles.css:2638-2650`) and
   reduced to a ~2:1 line on the Category picker (`styles.css:4320-4333`), also after Escape returns focus to the date
   button from the Day editor at 1440; pre-existing since a643794.
2. Low: `.sheet .label-trigger:hover` (`styles.css:4320`) and three older hover rules (`:1176`, `:1457`, `:4538`) are not
   under `@media (hover: hover)`; a tap leaves the hover look on phones (docs/04 line 92, AGENTS UI rule 3; FIX2 item 11
   partly done).
3. Low: identity button 296x38 with a coarse pointer at 1024 (`styles.css:663-673` outranks `:1330-1339`).
4. Low: Sign out entry icon 0px from its words (others 12px), `button.account-action` is `display: block`
   (`styles.css:864-887`, `AccountMenu.tsx:128-133`).
5. Low (test strength): mutant A4 (`AppShell.tsx:161`, phone More Escape focus return removed) survives.
6. Low (pre-existing): phone Administration "Submissions and delivery" table scrolls sideways with a long delivery badge
   (`styles.css:4881-4884`, `OperationsStatus.tsx:329`); axe `scrollable-region-focusable` (serious).

Checks: `npm ci` 0 (three exports); typecheck 0; lint 0; `npm test` 0 twice (94 files, 2131 tests); build 0, main
`index-4YHzamSq.js` 487.17 kB, no advisory; AC-13 1/1; FULL e2e real clock exit 0, 627 passed, 67 skipped, 0 failed
(desktop 317/30/0, mobile 310/37/0), 0 deprecation lines.

Item 11: load noise with a stated reason for both tests (one ~21 s host stall froze both workers' browsers at once:
`newPage` 21.8 s, a 400 ms wait 21.0 s); no wait shorter than a transition, no race, no product delay. Four more full
suites with 20 repetitions each (2026-12-31 23:30 LA preload, real clock, then two suites at once): with the mandatory run,
125 of 125 runs of the two tests passed (theme phone 15.0-21.4 s, desktop 20.8-25.2 s of 30 s; Open a day 0.8-3.9 s).
Risk R8: `theme.spec.ts:413` budget (up to 84% of 30 s).

Item 12: DPR 2 at 1440, 1445, 1367, 1601, light and dark: no seam, gap or shadow on a lifted neighbour; light <= 3.0/255
under inner joins (attempt 1: 22.5-28.5); dark one-device-pixel dip 8.4-9.5/255 in the ring row (risk R3).

Mutants: 11 own, 10 caught, A4 survives. axe 4.14.0: 43 first-run scans clean except the accepted account-menu
`target-size` (FIX1 justification accepted, R2); dialog name with CSS brackets verified in Chromium only (no second engine
installed).

Slips: two read-only `| head -n 0` pipes and one `2>/dev/null` in a wait loop (`slips.txt`), no effect. Ports: pristine
export used the harness's OS-assigned ports; probe and mutant exports 48950-48969 / 48940-48949. Nothing of mine is
running (no listener on 48940-48969, all background tasks finished).

Status: done (decision FIX REQUIRED)
