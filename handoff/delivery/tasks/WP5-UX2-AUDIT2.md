# WP5-UX2-AUDIT2 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-AUDIT2; package WP5; kind audit;
  attempt 1; depends on WP5-UX2-REGATE2 (PASS on a643794).
- Scope: the fresh, independent recheck of UI change round 2 after its fix round, on
  `reviewed_commit` a6437943403fc416240fd13a787a8c4748af3e84 with source digest
  229df806aeaaa886ab11ee83556746ee65eda6c81a596dcd180d80d5d0b04db3 (815 files).
  - The previous audit WP5-UX2-AUDIT judged the whole round on d1a20a7 / 20e7a7c8 as FIX
    REQUIRED, with three Low findings (01, 02, 03) and risks R-UX2A-1..5.
  - Since then:
    - WP5-UX2-FIX1 changed `TimesheetScreen.tsx`, `PeriodBar.tsx`, `styles.css`, tests,
      docs/04 and docs/10 (EN and VI);
    - WP5-UX2-FIX2 changed one e2e test.
  - A PASS here re-accepts WP5 on a643794. It supersedes WP5-UX-AUDIT-AB9 and the audits
    that pointed to it.
  - You did not author any change of this round. Do not trust the slice records, the
    fix records or the gates as proof; verify independently. You are not the auditor
    of WP5-UX2-AUDIT either: read its review as input, not as proof.
- Profile/routing: timesheet-auditor (effort xhigh, fixed by the profile); requested
  model opus; no override. Routing: size M, risk M, novelty no. Records in English; the
  review pair is EN plus VI.

## Read

- AGENTS.md from disk first; docs/08 (audit rules).
- `handoff/delivery/WP5_UX2_REVIEW.md` (the first audit: method, findings, risks,
  conclusions for the unchanged areas).
- `handoff/delivery/tasks/WP5-UX2-FIX1.md`, `WP5-UX2-FIX2.md`, `WP5-UX2-REGATE.md` (FAIL)
  and `WP5-UX2-REGATE2.md` (PASS), with their evidence.
- The board `owner_decisions` and `coordinator_decisions` of 2026-10-14 and 2026-10-15.

## Audit questions

1. **Findings closed.**
   - WP5-UX2-AUDIT-01: reproduce the auditor's midnight case with your own simulated
     clock (a page left open across the reporting-zone midnight, then a press on
     Today) and also the focus or visibility re-read. Confirm a press while not away
     changes nothing.
   - WP5-UX2-AUDIT-02: docs/04 lines 48, 54 and 56 and docs/10 (EN and VI) match the
     product at 320px and the inactive-Today press.
   - WP5-UX2-AUDIT-03: the inactive Today's painted focus ring in light, dark and both
     overrides, on both projects. Check that no other element still dims a focus ring
     with opacity.
   - R-UX2A-2: the wording test catches a reverted string.
2. **No regression from the fix.**
   - The diff d1a20a7..a643794 outside `handoff/`: read every changed line.
   - Today and Current period semantics stay as before (AGENTS rule 7: server dates
     only; window days; device zone far from the reporting zone; shared views use the
     owner's dates).
   - The new focus and visibility re-reads issue no requests in states where the
     earlier design forbade them, for example the check-in provider in shared views.
     They also must not loop or flood the server: count the requests on focus changes.
   - Accessibility of the period bar and the inactive button: WCAG 2.2 AA, axe and a
     keyboard walk at 1440, 390 and 320 in both themes.
3. **Unchanged areas carry forward.**
   - Confirm by diff that nothing else of the round changed since d1a20a7.
   - Confirm that `dist/server` still differs from 90b98ef only in the three message
     literals.
   - State that the first audit's PASS-level conclusions for owner fidelity, sharing,
     brand and privacy, server delta and docs carry forward, or name what does not.
4. **Test strength of the fix.** Mutation-test at least these, each in a scratch copy:
   - the inactive-press re-read removed;
   - the visibility or focus re-read removed;
   - the opacity rule restored;
   - one renamed string reverted.
   - Each must be caught, or be recorded as a finding or risk.
   - Confirm that the FIX2 focus-ring tests are not vacuous on days inside and outside
     the window.
5. **Risks.** Re-judge R-UX2A-1..5 briefly. R-UX2A-5 (the "future" badge on the period
   Today opens) has an open, optional owner question WP5-UX2-Q3; do not decide it.

## Method and limits

- Work on a clean export or scratch clone of a643794 in
  `D:\.claude-tmp\timesheet\WP5-UX2-AUDIT2\` (create it first). Record the digest in three
  forms first and last.
- Run the mandatory checks yourself:
  - typecheck, lint and `npm test`;
  - the full e2e on both projects on the real clock;
  - AC-13 once;
  - your simulated-clock probes (method:
    `handoff/delivery/evidence/WP5-UX-FIX10/shiftclock.mjs.txt`, copied into your task
    folder), at least one full-suite run outside the five-day window.
  - The drill is not required (REGATE2 ran it).
- Ports 48870-48899; set `DATA_DIR` and `DATABASE_PATH` inside your task folder for every
  server or CLI run.
- You may not fix audited source. Findings go to the review.

## Output

- `handoff/delivery/WP5_UX2_REVIEW2.md` (English) and
  `handoff/delivery/WP5_UX2_REVIEW2.vi.md` (Vietnamese translation, same structure),
  from the REVIEW template, with:
  - the decision PASS, FIX REQUIRED or NOT VERIFIED;
  - the reviewed commit and digest (before and after);
  - the author separation statement and your self-reported model;
  - the disposition of findings 01-03 and R-UX2A-2;
  - new findings (ID, severity, file:line, evidence, fix);
  - risks;
  - the evidence index.
- Your Results in this brief, and masked LF `.txt` evidence plus `-synthetic.png`
  screenshots in `handoff/delivery/evidence/WP5-UX2-AUDIT2/`.
- No markdown link to a file that does not exist.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell. Never create links or junctions.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES), NO `| node`, NO `| python`, NO `node -e`, NO `node -` OR `python -`. NEVER PIPE
  OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`. NEVER
  `rm -r` OR `rm -rf`.** Write scripts with the Write tool and run them by path. Run
  python only as the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
  (write `<user>` in the evidence).
- Put Node 24 first on PATH with `cygpath -u` before any node call; the first shell call
  is `node --version` (v24.x).
- **Create files only inside your task folder, the evidence folder and your owned
  paths.**
- Never stop a process you did not start, and never kill by PID. Leave nothing running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Synthetic data and local mail capture only. Write no email address except the full
  synthetic `@example.invalid` form, and no real profile path (use `<user>`).

## Owned paths

- `handoff/delivery/tasks/WP5-UX2-AUDIT2.md` (Results only)
- `handoff/delivery/WP5_UX2_REVIEW2.md`, `handoff/delivery/WP5_UX2_REVIEW2.vi.md`
- `handoff/delivery/evidence/WP5-UX2-AUDIT2/`

## Return

At most 220 words, beginning with 'Self-reported model: ...'. Include:
- the decision;
- the digest before and after;
- the dispositions of 01-03 and R-UX2A-2;
- new findings with severities;
- the risks;
- the mandatory-check results with counts;
- the mutation summary;
- the carry-forward statement;
- the evidence files;
- confirmation that nothing is left running.

## Results

(The auditor appends results here.)

### Checkpoint 1 (2026-10-15 12:50Z): setup, digest before, static checks

- Self-reported model `claude-opus-5-5` (profile timesheet-auditor). Board authors of the round (PLAN to PLAN4, T01 to T10,
  FIX1, FIX2, the freezes and the gates) all self-report `claude-sonnet-5-5`, so the auditor is not weaker than the strongest
  author. I authored none of the reviewed changes and did not run WP5-UX2-AUDIT.
- Node v24.21.0 (portable), Git Bash. Task folder `D:\.claude-tmp\timesheet\WP5-UX2-AUDIT2` (clean `git archive` export of
  a643794 in `export/`; probe and mutation copies in `px/` and `mut/`; 90b98ef in `old/`).
- Digest before (12:42Z), three forms equal: `229df806aeaaa886ab11ee83556746ee65eda6c81a596dcd180d80d5d0b04db3`, 815 files
  (export with `git hash-object --no-filters`; `git ls-tree a643794`, sorted list byte-identical; `npm run digest`). HEAD =
  origin/main = a643794; no non-handoff change.
- Clean export: `npm ci` 0, typecheck 0, lint 0, `npm test` 0 (89 files, 1882 tests), build 0, smoke 0 (SMOKE PASSED),
  second `npm test` 0 (89 / 1882); 0 deprecation lines in every log.
- Scope: `git diff --stat d1a20a7 a643794` outside `handoff/` = exactly 11 paths (415+/19-); the only removed test line is
  the `today.spec.ts` import line (gains `newPerson`); no skip, only, fixme, fail, slow or soft added.
- Running: the FULL e2e on both projects on the real clock (a window day).

### Checkpoint 2 (2026-10-15 13:02Z): real-clock e2e, AC-13, boundary

- FULL e2e, both projects, real clock 2026-10-15 12:48-12:59Z (05:48-05:59 America/Los_Angeles, window day P-1), clean
  export: exit 0, 448 passed, 0 failed, 42 skipped (desktop 216 ok / 29 skipped; mobile 232 ok / 13 skipped). The 8
  inactive-Today ring tests painted 6.11 / 6.40 (desktop light / dark) and 6.09 / 6.79 (mobile), opacity 1; the midnight
  test (real-clock branch) and both refresh-trigger tests passed on both projects.
- AC-13 (`tests/integration/ac13-two-week.test.ts`) once: exit 0, 1 passed.
- Own clean builds of 90b98ef and a643794: `dist/domain` identical (46 files); `dist/server` 180 files each, only
  `services/timesheetCommands.js` differs, in 4 lines (the three message literals and one comment). `git diff --stat
  d1a20a7 a643794` of server, domain, scripts, package files, configs, `src/client/public` and `index.html`: empty.
- Headers on the built server (fixture): CSP unchanged; `/`, `/theme-init.js`, `/cd-logo.svg` still without
  `Cache-Control` and `ETag` (R-UX2A-1 unchanged).
- Running: the simulated-clock sweep (control, four midnight probes, the repository midnight e2e, the FULL suite at
  2026-11-04 15:00 PST outside the window).

### Checkpoint 3 (2026-10-15 13:05Z): control, first midnight probes, wording mutations

- Control (FIX10 `shiftclock.mjs`, byte-identical copy): at simulated 2026-11-04 15:00 PST the built server reports
  `today_local` 2026-11-04 (current = in_progress = 10/26-11/08, outside the window) while the browser reports the real
  2026-10-15; exit 0 on both projects.
- Own midnight probe `zz-audit2-midnight.spec.ts` (device zone Pacific/Kiritimati, so the device date is 2026-10-16), both
  projects, exit 0 each:
  - 2026-10-25 23:58:30 PDT (period end): a press on the inactive Today before midnight made exactly one
    `GET /api/periods/current` and changed nothing; no request at all while three tabs sat untouched across midnight; the
    untouched page stayed stale (Today `aria-disabled`, tag 10/25); the press then jumped to 10/26-11/08 with the tag on
    10/26, the live text "Showing today, Mon 10/26/2026, in the period 10/26/2026 to 11/08/2026" and Current period shown;
    a second tab's window focus made one read and turned Today active on 10/12-10/25 (no navigation); a third tab's
    visibility event did the same (3 periods reads and 2 timesheet reads, the T09 lookups included).
  - 2026-10-30 23:58:30 PDT (payroll Friday, the window ends): the press left the sheet and the live region as they were,
    moved the tag to 10/31 and removed Current period (current = in_progress again); focus and visibility did the same.
- Wording test (R-UX2A-2), two reverts no earlier run used (`ClockOutDialog.tsx:74` "clock-out time", `ClockPanel.tsx:20`
  "Checking the clock"): each fails 1 of 3 tests naming the line; restored byte-identical to the export.

### Checkpoint 4 (2026-10-15 13:08Z): the remaining midnight probes

- 2026-10-31 23:58:30 PDT (mid-period, the night before the DST change), own view, both projects, exit 0: the press made one
  read, left the sheet on 10/26-11/08 and moved the tag to 11/01; window focus did the same with one read.
- Shared view, owner on a second calendar in Pacific/Kiritimati, grantee device Pacific/Pago_Pago, start 2026-10-25
  23:58:00 Kiritimati (02:58 PDT), both projects, exit 0: control press = one read of
  `/api/shared/{owner}/periods/current`, nothing changed; no request while idle across the owner's midnight; the press
  jumped to the owner's 10/26-11/08 with the owner's tag and the live text, Current period shown; focus and visibility
  each made exactly one share read and turned Today active; no request to `/api/periods/current`, `/api/clock*` or the
  grantee's own timesheets in the whole test; the grantee's own date stayed 2026-10-25.

### Checkpoint 5 (2026-10-15 13:22Z): repository midnight test, FULL suite outside the window

- The repository's midnight test (`today.spec.ts:538`) under the preload at 2026-10-25 23:59:20 PDT: exit 0, 2 passed
  (38 s each, its crossing branch).
- FULL e2e, both projects, simulated 2026-11-04 15:00 PST (outside the window; current = in_progress), clean export,
  13:08-13:21Z: exit 0, 448 passed, 0 failed, 42 skipped (desktop 216 / 29, mobile 232 / 13). The 8 inactive-Today ring
  tests painted 6.09 (light) and 6.79 (dark) on both projects, opacity 1.
- Running: the request, phone-row and a11y probes (real clock and outside the window), then the mutation runs.

### Checkpoint 6 (2026-10-15 13:24Z): phone row, first request probe

- Phone Review row (`zz-audit2-row.spec.ts`, real clock, window day, after Today so Current period shows, 316 to 400px in
  2px steps): the Review link takes its own row with the full label at 330px and below, shares the row as "Sign off" from
  332 to 396px and shows the full label from 398px; always 44px high, no sideways scroll. The docs clause "below about
  330px" matches.
- First request probe (`66-requests-real-v1.txt`, exit 1 by my own expectation): 60 Tab and 20 Shift+Tab presses made two
  periods reads (own and shared view alike). The walk passes the last stop, so focus leaves the document and comes back,
  which is a real window focus. The probe was rewritten to count window focus and blur events and to separate a walk inside
  the page from a wrapping walk; it is rerun after the chain. My a11y probe's ring sampler was also corrected (the 1x1 clip
  snaps outward on the right and bottom edges, so those samples fell just outside the 2px band) and is rerun too.

### Checkpoint 7 (2026-10-15 13:28Z): a11y and requests outside the window, edge probe

- a11y probe at simulated 2026-11-04 15:00 PST (outside the window; Today inactive on landing), both projects, four theme
  situations, 1440 / 390 / 320, landing, Next and Next twice (`68-a11y-1104-1500.txt`): exit 0; 36 walks, 1,512 stops,
  0 without a ring, 0 hidden, 0 under 24px, 0 period-bar controls under 44px on the phone, 0 stops under an opacity below 1,
  no sideways scroll; the inactive Today's ring is the full accent on all four sides (6.09 light, 6.79 dark; one
  anti-aliased 6.70), opacity chain 1, muted text 5.83 / 6.56. axe: desktop 8 of 12 scans clean; the other 4 (Next twice,
  the period with 11/26-11/27) and every phone scan report only `label-content-name-mismatch` (phone: the 14 day buttons,
  R-UX2A-4; desktop: the label-picker trigger of the two holiday days, whose name "Label for {date}: {holiday}" lacks the
  visible "Holiday" line; the trigger code is unchanged since 90b98ef, so this predates the round).
- First a11y run on the real clock (`68-a11y-real-v1.txt`, before the sampler fix): exit 0; desktop axe 12 of 12 clean,
  phone only R-UX2A-4; walks clean apart from the theme radio, whose transparent forced-colors outline the first
  sampler counted as a ring under opacity 0 (fixed: the label paints the ring).
- Request probe outside the window (`66-requests-1104-1500.txt`), both projects, own and shared: exit 0. 20 Tab presses
  inside the page: no window focus, no request; 80 presses that wrap: 2-3 window focus events and the same number of
  reads, nothing else; scripted focus of 8 (own) / 4 (shared) bar and toolbar controls: no request; one dispatched focus:
  one read and nothing for 3 s; ten focus events in one task: one read; ten 50 ms apart: ten reads; visible: own 3
  periods reads + 1 timesheet read, shared 1 read; hidden: none; `bringToFront` fired no window focus (headless); an
  inactive press: one read; in the shared view no request left the share (23-24 requests).
- Edge probe (`62-midnight-edge-1025.txt`): Next to 10/26-11/08 before midnight, then a press on the active-looking
  Today after midnight: one read, the sheet stays, Today turns inactive, the tag appears on 10/26, Current period shows,
  no announcement; today's row is in view. Both projects exit 0.
- Running: the mutation runs in `mut/`.

### Checkpoint 8 (2026-10-15 13:44Z): mutations

- 11 mutants in 15 runs (plus 2 baselines) in `mut/`, each applied by `mutate.py`, rebuilt, run alone, restored
  byte-identical and rebuilt (`73-mutation-summary.txt`); the `mut/` digest equals `229df806…` at the end.
  - MA (inactive-press re-read removed): caught on the real clock (2 failed, the read never comes) and under the
    preload at 2026-10-25 23:59:20 PDT (2 failed, the original symptom).
  - MF (press decides from the stale periods): survives on the real clock, caught under the preload (new risk
    R-UX2A2-4: the midnight decision is guarded only by the preload run, which is not a documented script or gate step).
  - MB1 (focus re-read removed), MB2 (visibility re-read removed), MB4 (one-read guard removed): 4 failed each; MB3
    (both removed) under the preload: 2 failed; MG (own route in a shared view): 2 failed.
  - MC (opacity rule restored) and ME (inactive Today ring removed): 8 failed each on the real clock (window) and at
    2026-11-04 (outside the window), so the FIX2 focus-ring tests are not vacuous on either branch.
  - MD and MD2 (wording reverts): caught (checkpoint 3). Baselines: 8 of 8 and 6 of 6 pass.
- Running: reruns of the corrected request and a11y probes on the real clock.

### Final result (attempt 1, 2026-10-15 13:50Z) - decision: PASS

Self-reported model: claude-opus-5-5.

- Review pair: `handoff/delivery/WP5_UX2_REVIEW2.md` and `handoff/delivery/WP5_UX2_REVIEW2.vi.md` (new; every earlier review
  untouched). Evidence: `handoff/delivery/evidence/WP5-UX2-AUDIT2/` (index `00-README.txt`; masked LF text and four
  `-synthetic.png` screenshots). `validate_package.py --preflight` (workflow Python, `C:\Users\<user>\...`) with the pair in
  place: exit 0, PASS (`42-preflight.txt`).
- Digest `229df806aeaaa886ab11ee83556746ee65eda6c81a596dcd180d80d5d0b04db3` (815 files) before (12:42Z) and after (13:46Z),
  each time in three equal forms; HEAD = origin/main = a643794; no non-handoff change before or after.
- Dispositions: WP5-UX2-AUDIT-01, 02, 03 and R-UX2A-2 closed. No new finding. Risks: R-UX2A-1, -3, -4, -5 carried; new
  optional R-UX2A2-1 (the inactive Today differs mainly by hue), R-UX2A2-2 (one more periods read on an own visible tab),
  R-UX2A2-3 (pre-existing: the desktop label picker's name on two-line days such as holidays), R-UX2A2-4 (the midnight
  decision is guarded only by the simulated-clock run).
- Mandatory checks: typecheck 0, lint 0, `npm test` 0 (89 files, 1882 tests, twice), build 0, smoke PASSED, 0 deprecation
  lines; FULL e2e real clock 448 passed / 0 failed / 42 skipped (desktop 216/29, mobile 232/13); FULL e2e outside the
  window (simulated 2026-11-04 15:00 PST) 448 / 0 / 42 (same split); AC-13 1/1; own simulated-clock probes 10 of 10; the
  repository midnight test under the preload 2 of 2.
- Reruns on the real clock with the corrected probes: requests 4 of 4 (`66-requests-real.txt`); a11y 8 of 8
  (`68-a11y-real.txt`). Combined a11y: 72 axe scans (desktop 20 clean, 4 with only R-UX2A2-3; phone 48 with only
  R-UX2A-4), 72 walks with 3,048 stops and no stop without a ring, hidden, under 24px or under an opacity below 1; the
  inactive Today's ring is the full accent on all four sides (6.09 light, 6.79 dark, lowest 6.70).
- Mutations: 11 mutants in 15 runs plus 2 baselines; 14 caught, 1 survivor by design (MF on the real clock, caught under
  the preload); every mutant the brief lists is caught; the FIX2 ring tests are not vacuous inside or outside the window.
- Carry-forward: nothing else changed since d1a20a7; `dist/server` still differs from 90b98ef only in the three message
  literals and one comment; the first audit's PASS-level conclusions (owner fidelity, sharing, brand and privacy, server
  delta, docs) carry forward.
- Process notes: one foreground `sleep 1`, one `tail -c` file read and one status line piped into `tail -n 0` (against the
  rule; no effect); two probe defects of my own were rerun after the fix, both first logs kept.
- Nothing is left running: every Playwright run, fixture server and probe ended (the three background chains reported
  completion); no server was started outside the fixtures and the smoke script; no Docker.

Status: done (decision PASS)
