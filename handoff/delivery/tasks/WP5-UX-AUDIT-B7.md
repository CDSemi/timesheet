# WP5-UX-AUDIT-B7 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-AUDIT-B7; package WP5; kind
  audit; attempt 1; depends on WP5-UX-REGATE6 (must be PASS before dispatch).
- Area B recheck of WP5 on the final snapshot, limited to the delta. The area covers
  **UX fidelity, accessibility, test strength, UI standards and documentation**.
- Background: WP5-UX-AUDIT-B6 (FIX REQUIRED on bf954c0, digest b7c011d2) checked area B
  on the whole snapshot.
  - It closed every accessibility item of the fix round.
  - It found one Low defect, WP5-UX-B6-01: at 390x844 a person with a received share
    and the zone note gets a two-row shell bar, so the first day row ends below the tab
    bar (docs/04 line 48).
  - WP5-UX-FIX8 fixed it in CSS only: a one-row compact bar below 768px. It also added
    two mobile e2e checks.
- Area A is rechecked in parallel (WP5-UX-AUDIT-A7) in a separate context; do not
  coordinate with it. WP5 is re-accepted only if both PASS.
- `reviewed_commit` = 255ba17d6bf891c0ff779d4a4f518e0d2998cee8, the WP5-UX-REGATE6
  `freeze_commit`. HEAD = origin/main, unless only handoff/ changed since. Digest of
  record: b07727b2f95b4e202e9e0dc391512b051b288218ceb3e2ffe93f0f1c14a95abe (793 files).
  Audit a clean export (or a scratch clone) at 255ba17. Record the digest FIRST and again
  at the end.
- Delta basis: B6's whole-snapshot conclusions carry forward only if you prove from the
  diff `bf954c0..255ba17` that the source change is limited to the compact shell bar
  below 768px and the sharing spec. You must:
  - recheck every area-B item that this change can affect;
  - rerun the mandatory checks at 255ba17.
- Severity rule (unchanged from B6): a finding blocks only if it is a defect against the
  owner's request, the approved direction, docs/04 as shipped, AGENTS.md rules or WCAG 2.2
  AA. Put polish under "Risks and optional improvements". Report every blocking defect in
  this pass.
- Profile/routing: timesheet-auditor (xhigh), model opus. It must never be weaker than
  the strongest author of the snapshot (claude-opus-5-5). Routing: size S, risk M,
  novelty no.
- Fresh context: you authored nothing in this round and ran no gate or earlier audit of
  it. Do not treat authors', the verifier's or earlier auditors' summaries as proof.
- Language: the task record is English. `handoff/delivery/WP5_UX_REVIEW_B7.md` and its
  `.vi.md` follow the REVIEW form in `handoff/templates/`.

## Read

- AGENTS.md from disk.
- `handoff/delivery/WP5_UX_REVIEW_B6.md`: B6-01, the dispositions and the risks.
- The Results of WP5-UX-FIX8 and WP5-UX-REGATE6, with their evidence.
- The diff `bf954c0..255ba17` outside handoff/.

## Scope

1. **Delta proof.** Show from the diff that the change outside handoff/ is
   `src/client/styles.css` (the compact bar below 768px, the switcher label and spacing,
   the new `--switcher-basis` token) and `tests/e2e/sharing.spec.ts` (two new tests).
   Show that no e2e assertion was removed or weakened. Check that the new tests fail on
   bf954c0, using a scratch copy only.
2. **B6-01 disposition.** At 390x844 on the mobile project, light and dark, check four
   states: no received share / received share, each with the zone note shown and hidden.
   In each state, the first day row must be fully visible above the tab bar, as docs/04
   line 48 (EN and VI) promises. Record 375, 360 and 320 for information.
3. **Area-B items the bar change can affect**, at 767, 390 and 320, light and dark, both
   with and without a received share:
   - the switcher's visible label (SC 3.3.2) and an accessible name that contains it
     (SC 2.5.3);
   - AX-06: changing the choice does not navigate; Open does;
   - 44x44 targets;
   - text contrast of the smaller label (SC 1.4.3) and resize-text behaviour (SC 1.4.4)
     at 200% zoom;
   - reflow at 320 (SC 1.4.10);
   - focus not obscured (SC 2.4.11) on a Shift+Tab and Tab walk over Timesheet, the day
     editor and the shared view;
   - visible focus rings;
   - tokens only, the 4px radius and the shared transition;
   - no change at 768px and wider (compare screenshots or computed styles with
     bf954c0).
4. **Gate observations to judge** (WP5-UX-REGATE6, informational, not proof). At 320,
   the switcher wraps and the select's text is clipped. At 375, 360 and 320, a received
   share plus the zone note still puts the first day row below the tab bar. docs/04
   line 48 promises the first-screen budget only at 390x844. Judge both under the
   severity rule:
   - whether the clipped select text hides the chosen owner or fails a WCAG 2.2 AA
     criterion (for example 1.4.10 or 1.3.1);
   - whether anything in docs/04 or the approved direction promises the budget at
     smaller widths.
5. **Mandatory checks at 255ba17:** typecheck, lint, `npm test`, and the FULL e2e on both
   projects. If `automation.spec.ts:118` fails with ECONNRESET, rerun only that test
   three times and record it.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-B7`. Set TEMP and TMP to it.
- Ports: 48380-48399 for anything you start.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- No Docker.
- Give each Playwright run its own output folder, and give probe actions a short
  timeout.
- Use Git Bash only. Never use cmd.exe, and never open an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES), NO `| node`, NO `| python`, NO `node -e`, NO `node -` OR `python -`. NEVER PIPE
  OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`.**
  - Write scripts with the Write tool and run them by path.
  - Run python only as the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
  - Put Node 24 first on PATH (with `cygpath -u`) before any node call. Make the first
    shell call `node --version`.
- **Create files ONLY inside the task folder or the evidence folder.** Never write on
  `D:\` or in the repository root.
- Stop only processes you spawned, through their own handle. Never kill by PID. Never
  remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Never edit source, tests, docs, the board or STATE. Use synthetic data and local
  capture only. Leave nothing running.
- In the review, Results and evidence:
  - write no email address except the full synthetic `@example.invalid` form;
  - write no real profile path (use `<user>`);
  - mask probe-truncated addresses as `<email>`.

## Output

- `handoff/delivery/WP5_UX_REVIEW_B7.md` and `handoff/delivery/WP5_UX_REVIEW_B7.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence in `handoff/delivery/evidence/WP5-UX-AUDIT-B7/`. Save
  scripts as `*.mjs.txt`, `*.py.txt` or `*.ts.txt`, and screenshots as
  `*-synthetic.png`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED. List findings separately (ID,
  severity, file:line, evidence, required fix) and give the disposition of B6-01.

Return at most 160 words, beginning with your self-reported model. Include:
- the decision;
- the delta proof;
- the B6-01 disposition and the four-state numbers;
- any new findings;
- the weakened-assertion result;
- the mandatory check counts;
- the digests;
- the evidence files.

## Addendum for attempt 2 (coordinator, 2026-10-13)

Attempt 1 (2026-10-09) stopped early when the subscription's weekly usage limit was
reached. It wrote no record in the repository. Its background processes may still have
held its ports or task folder. For attempt 2:
- use the task folder `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-B7-2` and ports 48420-48439,
  instead of the ones named above;
- if a port you need is busy, pick another one in that range and record it; never stop a
  process you did not start;
- ignore anything left in the attempt 1 task folder;
- HEAD may have moved past 255ba17 through handoff-only commits. Record HEAD and
  origin/main, and confirm that nothing outside handoff/ differs from 255ba17.

## Results

(auditor appends here)

### Auditor result (attempt 2) - decision: FIX REQUIRED

Self-reported model: claude-opus-5-5 (equals the strongest author model of the snapshot). Fresh context; I authored nothing and ran no
gate or earlier audit of this round. Task folder `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-B7-2`, ports 48420-48423; the attempt 1 folder
was ignored. Git Bash, portable Node v24.21.0, Edge. Review: `handoff/delivery/WP5_UX_REVIEW_B7.md` and `.vi.md`. Evidence:
`handoff/delivery/evidence/WP5-UX-AUDIT-B7/` (82 files, index `00-README.txt`).

- **Identity.** HEAD = origin/main = 255ba17d6bf891c0ff779d4a4f518e0d2998cee8 before and after; nothing outside `handoff/` differs.
  Digest `b07727b2f95b4e202e9e0dc391512b051b288218ceb3e2ffe93f0f1c14a95abe` (793 files), recorded first (18:57:10Z) and last
  (19:36:18Z), equal in three forms (`00-…`, `90-…`).
- **Delta proof.** `bf954c0..255ba17` outside `handoff/` is one commit with two files and 76 insertions, 0 deletions:
  - `src/client/styles.css` +25: the new `--switcher-basis: 16rem` token, plus a `max-width: 767px` block that sets the bar
    column-gap to `--space-3`, the switcher flex basis, label padding-block 0 and label text `--font-size-xs`;
  - `tests/e2e/sharing.spec.ts` +51: one describe with two mobile tests.

  0 test lines were removed, so no assertion was removed or weakened. On the bf954c0 build the new tests fail for their own
  reasons: 812.8 > 788.5, and 106.8 > 60 (`30-…`).
- **B6-01: closed.** First row bottom at 390x844 against a tab bar top of 788, identical light and dark (`50-…`):

  | State | 255ba17 | bf954c0 |
  |---|---|---|
  | no share, note | 757.97 | 757.97 |
  | no share, no note | 659.02 | 659.02 |
  | share, note | 765.97 | 812.8 (below the tab bar) |
  | share, no note | 667.02 | 713.84 |

  The bar is 52 without a share and 60 with one. 375/360/320 were recorded for information.
- **Area-B items at 767/390/320, light and dark, with and without a share: all hold.**
  - Visible label and name: `combobox "Shared with me"`.
  - AX-06: 7 keys keep `#/timesheet` with 0 non-GET requests; Open navigates by Enter, by touch and by click.
  - Targets of 44 and more; label contrast 5.83 / 6.56.
  - Desktop browser zoom 200%: one-row bar, no sideways scroll.
  - Reflow at 320: none sideways.
  - 128 walks and 2928 stops: 0 hidden, 0 partly covered, every stop with a ring.
  - Rendered rings 6.09 / 6.79 on 4 sides.
  - Tokens only.
  - At 768px and wider: 8696 computed-style comparisons with 0 differing, and byte-identical bar screenshots.
- **Gate observations.**
  - The clipped select text fails no WCAG 2.2 AA criterion: the native list, the accessible value and the share bar give the full
    name. But FIX8 widened it, at 355-420 px, to "My timesheets" and to every owner name of about 160 px, so it is recorded as a
    non-blocking risk, R-B7-1.
  - The budget below 390 is promised nowhere (docs/04 line 48 says 390x844 only), so it is not a defect.
- **Mandatory checks.**
  - typecheck, lint and `npm test` exit 0 (82 files, 1823 tests).
  - The full e2e exits **1: 204 passed, 6 failed, 26 skipped** (desktop 100/3/15, mobile 104/3/11). `automation.spec.ts:118`
    passed on both projects. There are no deprecation lines.
- **New finding WP5-UX-B7-01 (Low, blocking).** `shell.spec.ts:67` and `isolation.spec.ts:94` and `:145` fail on both projects on
  the due Tuesday, from 00:00 to 17:00 America/Los_Angeles. `pastFreeWorkdays()` returns a day of the in-progress period, which the
  app does not display.
  - Reproduced at 255ba17 and at bf954c0.
  - Scratch copies that use `displayedPeriodFreeWorkdays()` pass 6/6 in the same window (`04b-…` to `04f-…`).
- **Risks.** R-B7-1 (the select clipping above); R-B7-2 (the e2e innerWidth sideways checks are vacuous on the mobile project, P7);
  R-B7-3 (the label wraps); R-B7-4 (200% text-only on a phone, which predates FIX8).
- **Hygiene.** No process left running: every probe server was stopped through its handle (`41-…`). No source, test, doc, board or
  STATE edit. Process notes: a first listing file landed beside the task folder and was moved into it; there were two probe-side
  artefacts (`00-README.txt`).

Status: done
