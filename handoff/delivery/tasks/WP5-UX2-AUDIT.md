# WP5-UX2-AUDIT dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-AUDIT; package WP5; kind audit;
  attempt 1; depends on WP5-UX2-GATE (PASS on d1a20a7).
- Scope: the fresh, independent audit of UI change round 2 (areas A and B combined), on
  `reviewed_commit` d1a20a7f0112fa00171fe4b1d6035427855f12b6 with source digest
  20e7a7c8cd19b811aedfd814b35ead3b9a8d2eab7c9dbdd0b23626a609773fa5 (814 files).
  - A PASS re-accepts WP5 on this snapshot. It supersedes WP5-UX-AUDIT-AB9 (90b98ef /
    57e2974c) and the audits that pointed to AB9.
  - You did not author any change of this round. Do not trust the slice records or the
    gate as proof; verify independently.
- Profile/routing: timesheet-auditor (effort xhigh, fixed by the profile); requested model
  opus (the profile's model); no override. Routing: size L, risk M (client UI round with
  accounting-date semantics, sharing context and three server message literals),
  novelty no. Records in English; the review pair is EN plus VI.

## Read

- AGENTS.md from disk first. docs/08 (audit rules). docs/04, docs/10 (the round-2
  section), docs/12, as committed.
- The owner's requests and answers of 2026-10-14 in the board `owner_decisions`, read
  verbatim, and the round's `coordinator_decisions` on the board.
- The plans `handoff/delivery/tasks/WP5-UX2-PLAN.md`, `-PLAN2.md`, `-PLAN3.md`,
  `-PLAN4.md` and the mockup `handoff/delivery/design/WP5-UX2/mockup.html` (the design
  intent).
- The slice records `WP5-UX2-T01.md` to `WP5-UX2-T10.md` (claims to verify, not proof)
  and the gate record `WP5-UX2-GATE.md` with its evidence (the screenshots under
  `handoff/delivery/evidence/WP5-UX2-GATE/`).
- The previous accepted review `handoff/delivery/WP5_UX_REVIEW_AB9.md` and the
  accessibility sweep `handoff/delivery/tasks/WP5-UX-A11Y-SWEEP.md` (AX-01..AX-10, which
  must not regress).

## Audit questions

1. **Owner fidelity.** For each owner request of 2026-10-14 (six items, the Q1 answer,
   three items, two items, five items, and the Q2 answer), say whether the product does
   what the owner asked. Where the coordinator chose among options or deviated (for
   example the wordmark from 1440 instead of 1280, "Review" as the short form of the
   other review labels, the arrow separator, the app-wide hover token, the 112px phone
   bar with a share, the reworded docs/10 entries E-1 and F-Q5), judge whether the choice
   respects the request and is documented. Check the visual evidence (screenshots,
   mockup) and run the app yourself.
2. **Accounting date and zones** (AGENTS rule 7).
   - Today and Current period use only the server's `today_local`, `current` and
     `in_progress`, never the device clock or the display zone.
   - Probe a device zone far from the reporting zone, the window days P-4..P, midnight
     and the DST days with your own simulated clock.
   - In shared views, both buttons use the owner's dates.
3. **Ownership and sharing.**
   - No check in/out control or clock request in any shared view, on any width (F-Q5,
     AC-16).
   - The `ClockProvider` never acts on another person's timesheet.
   - The grantee's allowed actions are unchanged.
4. **Server delta.** Only the three message literals and one comment changed in
   `timesheetCommands.ts`: no code path, status, error code, API path or event type.
   Confirm with your own build diff against 90b98ef.
5. **Accessibility (WCAG 2.2 AA), no regression.**
   - AX-01..AX-10 and the B5 items still hold.
   - The new controls (Theme radio group, Show details switch, Today and Current period
     with `aria-disabled` and the live region, the label picker rail and check, the
     `aria-current` day, the phone Review short label with its full accessible name, the
     bar check in/out) meet SC 1.3.1, 1.4.1, 1.4.3, 1.4.11, 2.1.1, 2.4.3, 2.4.7, 2.4.11,
     2.5.3, 2.5.8 and 4.1.3 in light, dark and both manual overrides, at 1440, 1280,
     1024, 768, 390, 375, 360 and 320.
   - Run an axe scan and a keyboard walk yourself.
6. **Brand and privacy.**
   - No font file and no raster other than `-synthetic.png` evidence in the
     repository.
   - The logo SVG is pure vector and safe (no script, no external reference).
   - The wordmark is outlines only (no `<text>`, no `@font-face`).
   - Fidelity to the owner's images: re-render if the source copies in
     `D:\.claude-tmp\timesheet\WP5-UX2-PLAN3\` and `\WP5-UX2-PLAN4\` still exist.
   - The PDF keeps its company line; the on-screen sheet does not show it.
   - The CSP is unchanged.
   - Judge the recorded risk R-UX2-1: `/theme-init.js` is served without
     `Cache-Control`, so its caching is heuristic.
7. **Test strength.**
   - Mutation-test at least:
     - Today reading the device date;
     - Today targeting `current`;
     - `aria-current` removed;
     - the editing fill or rail dropped;
     - hover contrast below 1.20;
     - the switch role reverted;
     - `data-theme` not applied before first paint;
     - the clock rendered in a shared view;
     - the logo `<img>` removed;
     - the rename reverted in one place;
     - the one-line Review rule removed.
   - Each must be caught. Record survivors as findings or risks.
   - Confirm that no assertion was weakened beyond the recorded role and height changes.
8. **Docs.** docs/04, docs/10, docs/12 and the renamed lines in docs/01, docs/02 and
   DEVELOPMENT describe the product as built, EN and VI in parity. Report any
   contradiction with a canonical rule (AGENTS rule 8).

## Method and limits

- Work on a clean export or scratch clone of d1a20a7 in
  `D:\.claude-tmp\timesheet\WP5-UX2-AUDIT\` (create it first). Record the digest in three
  forms first and last.
- Run the mandatory checks yourself:
  - typecheck, lint and `npm test`;
  - the full e2e on both projects on the real clock;
  - AC-13 once;
  - your own simulated-clock probes (method:
    `handoff/delivery/evidence/WP5-UX-FIX10/shiftclock.mjs.txt`, copied into your task
    folder).
  - The drill is not required (the gate ran it).
- Ports 48740-48769; set `DATA_DIR` and `DATABASE_PATH` inside your task folder for every
  server or CLI run.
- You may not fix audited source. Findings go to the review.

## Output

- `handoff/delivery/WP5_UX2_REVIEW.md` (English) and `handoff/delivery/WP5_UX2_REVIEW.vi.md`
  (Vietnamese translation, same structure), using the REVIEW template in
  `handoff/templates/`, with:
  - the decision PASS, FIX REQUIRED or NOT VERIFIED;
  - the reviewed commit and digest (before and after);
  - the author separation statement and your self-reported model;
  - findings (ID, severity, file:line, evidence, recommended fix);
  - optional risks;
  - the evidence index.
- Your Results in this brief (English), and masked LF `.txt` evidence plus
  `-synthetic.png` screenshots in `handoff/delivery/evidence/WP5-UX2-AUDIT/`.
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
  paths.** Never write into the repository root or a drive root.
- Never stop a process you did not start, and never kill by PID. Leave nothing running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Synthetic data and local mail capture only. Write no email address except the full
  synthetic `@example.invalid` form, and no real profile path (use `<user>`).

## Owned paths

- `handoff/delivery/tasks/WP5-UX2-AUDIT.md` (Results only)
- `handoff/delivery/WP5_UX2_REVIEW.md`, `handoff/delivery/WP5_UX2_REVIEW.vi.md`
- `handoff/delivery/evidence/WP5-UX2-AUDIT/`

## Return

At most 250 words, beginning with 'Self-reported model: ...'. Include:
- the decision;
- the digest before and after;
- the findings with their severities;
- the risks;
- the mandatory-check results with counts;
- the mutation summary;
- the owner-fidelity summary per request;
- the evidence files;
- confirmation that nothing is left running.

## Results

(The auditor appends results here.)

### Progress checkpoint 1 (auditor, 2026-10-15 ~07:00Z)

- Self-reported model: claude-opus-5-5. Authors of the round (board): every implement/plan task self-reported
  claude-sonnet-5-5, so the audit-strength rule holds. I authored no change of the round.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX2-AUDIT\`; clean `git archive` export of d1a20a7 (`export/`), a second scratch export
  for probes and mutations (`mut/`), and a clean export of 90b98ef (`old/`) for the build diff. Node v24.21.0.
- Digest before (06:41Z), three forms equal: export form, `git ls-tree d1a20a7` form and `npm run digest`:
  20e7a7c8cd19b811aedfd814b35ead3b9a8d2eab7c9dbdd0b23626a609773fa5, 814 files; HEAD = origin/main = d1a20a7; no non-handoff change.
- Mandatory checks so far (clean export): typecheck 0, lint 0, `npm test` 0 (88 files, 1878 tests), build 0, smoke 0 (SMOKE PASSED),
  0 deprecation lines; FULL e2e on the real clock (2026-10-14 23:44-23:54 PDT, window day) exit 0: 434 passed, 42 skipped, 0 failed
  (desktop 209/29, mobile 225/13); AC-13 exit 0 (1/1).
- Server delta: own clean builds of 90b98ef and d1a20a7: `dist/domain` identical (46 files); `dist/server` 180 files, only
  `services/timesheetCommands.js` differs, 4 lines (3 message literals, 1 comment); codes unchanged.
- Own simulated-clock probes (task-local spec, Kiritimati and Pago Pago devices, shared owner in Kiritimati): 11 instants all pass
  (8 passed, 2 skipped by design each). Midnight probe (2026-10-25 23:59:20 PDT, page left open): FAILS: after the server date
  changed to 10-26 the page keeps Today aria-disabled, the Today tag on 10-25, and pressing Today does nothing (candidate finding).
- Running next: axe-core 4.14.0 scan (installed in the task folder only), keyboard walks, inactive-Today ring, mutations.

### Progress checkpoint 2 (auditor, 2026-10-15 ~07:22Z)

- Unit-level mutations (scratch export `mut2/`, restored): Today targets `current` caught (3 failed), Current period always shown caught
  (2 failed), one server literal reverted caught (1 failed); the History/OT label and the policy legend reverted survive the unit tests.
- Brand fidelity re-rendered against the owner's source copies: logo mean channel difference 0.456/0.437/0.424 at 512/64/32 px; wordmark
  luminance difference 30.8/255, ink IoU 0.655 after ink-box registration. Header probe: CSP identical on 90b98ef and d1a20a7; no
  `Cache-Control` on any static file of either build.
- axe (first pass, landing and away states): desktop 0 violations; phone only `label-content-name-mismatch` on the day buttons
  (pre-existing AX-05 markup; a 90b98ef baseline is queued). The first a11y run hangs on my own probe step (it clicks an aria-disabled
  Today; each such test times out after 10 min); a corrected probe is queued after it.
- Candidate findings: 01 Today stale across midnight (reproduced); 02 docs/04 and docs/10 omit the 320px phone row; 03 the inactive Today's
  focus ring dimmed by `opacity: 0.6` (computed 2.70:1 light, 3.33:1 dark; to be measured in the browser).
- Process slips so far (no effect on files or processes): three pipes into `head`/`tail` on listing or grep commands.

### Progress checkpoint 3 (auditor, 2026-10-15 ~07:42Z)

- The first a11y run ended (40.7 min; 8 walk tests timed out on my own aria-disabled click, as expected). Its ring tests measured the inactive
  Today's painted focus ring: 2.70:1 on the white card in the light theme (light device and manual light), 3.34:1 in the dark theme, against
  6.09 / 6.79 when active, on both projects: finding WP5-UX2-AUDIT-03 confirmed (Low; the owner-decided 3:1 ring rule, WP5-UX-Q1 (a)).
- Review pair drafted in place with the findings so far; the corrected a11y probe, the axe baselines, two suite sweeps and the e2e
  mutations now run in sequence (`chain.sh`).
- Process slips now five pipes into `head`/`tail` (listing and grep commands only).

### Progress checkpoint 4 (auditor, 2026-10-15 ~07:47Z)

- Corrected a11y run: 144 axe scans (desktop 64/64 clean; phone only the pre-existing day-button name mismatch, also on 90b98ef, plus a
  scroll-position `target-size` overlap at 375px under the 112px bar with an overlay open, not seen without the share on either build);
  32 keyboard walks, 2,784 stops, all with a ring, none hidden, none under 24px, no sideways scroll; the review link never overflows with
  the system font, Arial or Verdana from 320 to 767px.
- Suite sweeps: today/timesheet at 2026-10-26 00:30 PDT 59 passed / 0 failed (away budget 690.0 / 591.0 of 788); today at 2026-10-30 23:45
  17 passed / 0 failed. The e2e mutations are running.

### Auditor result (attempt 1) - decision: FIX REQUIRED

Self-reported model: claude-opus-5-5 (profile timesheet-auditor; effort not observable). Every author of the round self-reported
claude-sonnet-5-5, so the audit-strength rule holds; I authored no change of the round. Review pair: `handoff/delivery/WP5_UX2_REVIEW.md` and
`.vi.md`; evidence: `handoff/delivery/evidence/WP5-UX2-AUDIT/` (index `00-README.txt`, 213 masked LF `.txt` files and 4 `-synthetic.png`).

- Reviewed commit d1a20a7f0112fa00171fe4b1d6035427855f12b6; digest 20e7a7c8cd19b811aedfd814b35ead3b9a8d2eab7c9dbdd0b23626a609773fa5 (814
  files) before (06:41Z) and after (08:30Z), three equal forms each time (clean export, `git ls-tree`, `npm run digest`); HEAD =
  origin/main = d1a20a7; no non-handoff change.
- Mandatory checks (clean export): typecheck 0, lint 0, `npm test` 0 (88 files, 1878 tests; a second run the same), build 0, smoke PASSED,
  0 deprecation lines; FULL e2e real clock (2026-10-14 23:44-23:54 PDT) exit 0, 434 passed / 0 failed / 42 skipped (desktop 209/29,
  mobile 225/13); AC-13 exit 0 (1/1).
- Server delta (own builds of 90b98ef and d1a20a7): `dist/domain` identical; `dist/server` only `services/timesheetCommands.js`, 3 message
  literals and 1 comment; codes, routes and events unchanged; CSP identical.
- Simulated-clock probes (FIX10 preload, validated): 11 instants (window days, DST, year turn, devices in Kiritimati and Pago Pago, a shared
  owner in Kiritimati) all pass, 8 passed / 2 skipped each; the suite's today/timesheet at 2026-10-26 00:30 pass 59/0/11 (away budget 690.0
  / 591.0 of 788) and today at 2026-10-30 23:45 17/0/5. The midnight probe fails (finding 01).
- Accessibility: 144 axe-core 4.14.0 scans (desktop 64/64 clean; phone only the day-button name mismatch that 90b98ef shows too, and a
  scroll-position `target-size` overlap under the 112px bar at 375px with an overlay open); 32 keyboard walks, 2,784 stops, all with a ring,
  none hidden, none under 24px, no sideways scroll; the inactive Today's painted ring 2.70:1 light / 3.34:1 dark (finding 03); AX-01..AX-10
  hold in the suite.
- Mutations: 20 mutants in 24 runs; 16 caught, including every one the brief lists (device date, Today to `current`, `aria-current`, rails,
  phone fill, hover below 1.20, switch role, pre-paint, clock in a shared view, logo, the rename on the button and a server literal, the
  short-form one-line rule); survivors: the rename in three untested places (R-UX2A-2) and `nowrap` alone (equivalent). The scratch export's
  digest equalled the reviewed digest after every restore.
- Findings: WP5-UX2-AUDIT-01 Low (Today stays inactive and does nothing after the reporting-zone midnight while the page is open);
  WP5-UX2-AUDIT-02 Low docs (the 320px phone row is not described in docs/04 lines 48/56 and the docs/10 bullet); WP5-UX2-AUDIT-03 Low
  (the inactive Today's focus ring dimmed by `opacity: 0.6` to 2.70:1 in the light theme, below the owner-decided 3:1). Risks: R-UX2A-1 (no
  Cache-Control on /theme-init.js and the other static files; acceptable), R-UX2A-2 (rename survivors), R-UX2A-3 (font-dependent review-link
  thresholds; no overflow with Arial or Verdana, but with a share the first-window-day away state keeps only 28.6px of headroom, less than a
  second button row), R-UX2A-4 (axe name mismatch on
  the phone day buttons, pre-existing), R-UX2A-5 ("future" badge on the period Today opens).
- Owner fidelity: all 16 items and both answers done; the coordinator's deviations respect the requests and are documented.
- Docs preflight (`validate_package.py --preflight`) PASS with the review pair in place (110 pairs, 2215 links).
- Process notes: seven pipes into `head`/`tail` on listing or grep commands (no file or process effect); my first a11y probe run waited on
  an aria-disabled click of my own and its walk tests timed out (only its first axe lines and its ring lines are used); axe-core 4.14.0
  downloaded with `--ignore-scripts` into the task folder only. Nothing is left running.
- Next: coordinator records FIX REQUIRED and dispatches one bounded fix task for findings 01-03, then a regate and a fresh recheck audit.

Status: done
