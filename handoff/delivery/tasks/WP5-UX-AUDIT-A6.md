# WP5-UX-AUDIT-A6 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-AUDIT-A6; package WP5; kind audit;
  attempt 1; depends on WP5-UX-REGATE5 (must be PASS before dispatch).
- Area A recheck of WP5 on the final snapshot: **business integrity, zones, edit paths,
  sharing, isolation and privacy**. Area A passed on 5e104e1 (WP5-UX-AUDIT-A5, digest
  07c3ca00). Since then WP5-UX-FIX7 (owner choice WP5-UX-Q2, option a) changed 29
  client, test and docs paths to fix WCAG 2.2 AA issues AX-01..AX-10. Several touch area
  A surfaces:
  - the "Shared with me" switcher now navigates only on Open (`SharingSwitcher.tsx`);
  - focus returns and step headings in `BatchDialog.tsx`, `SharingRows.tsx`,
    `ImportCommit.tsx`, `OpeningBalanceForm.tsx`, `OpeningBalancePanel.tsx`,
    `TimesheetScreen.tsx`;
  - day-button names and `focusDay()` selection by `data-day` (`sheetModel.ts`,
    `TimesheetSheet.tsx`, `SheetWeekTable.tsx`);
  - sticky-bar sizes through a new `useBlockSize` hook (`AppShell.tsx`, `SharingBar.tsx`,
    `DayEditor.tsx`);
  - alert/status roles (`App.tsx`, `SettingsScreen.tsx`, `AdminUsers.tsx`,
    `SharingGrantForm.tsx`).
  The owner's commit 5b349f8 is handoff-only. This recheck makes area A current on the
  new digest. Area B is rechecked in parallel (WP5-UX-AUDIT-B6) in a separate context; do
  not coordinate with it. WP5 is re-accepted only if both PASS.
- `reviewed_commit` = bf954c0b371ad9a5fe461a603c5d476ea210e66c (the WP5-UX-REGATE5
  `freeze_commit`; HEAD = origin/main unless only handoff/ changed since); digest of
  record b7c011d2f47b6cf45ec085064f6c8e5da1847f8ffdd3ba54ac77dc995a02d563 (793 files).
  Audit a clean export (or a scratch clone) at bf954c0; record the digest FIRST and again
  at the end.
- This audit will supersede WP5-UX-AUDIT-A5 (and, through it, A2, A3, A4 and WP5-RECHECK)
  on the board (`superseded_by`); its PASS is what accepts area A of WP5.
- Profile/routing: timesheet-auditor (xhigh), model opus (never weaker than the
  strongest author; FIX7 ran on opus). Routing: size M, risk H, novelty no.
- Fresh context: you authored nothing in this round and ran no gate, sweep or earlier
  audit of it. Do not rely on authors', the verifier's or earlier auditors' summaries as
  proof.
- Language: the task record is English; `handoff/delivery/WP5_UX_REVIEW_A6.md` and its
  `.vi.md` follow the REVIEW form in `handoff/templates/`.

## Read

- AGENTS.md from disk; the reading list of `handoff/delivery/tasks/WP5-UX-AUDIT-A.md`.
- `handoff/delivery/WP5_UX_REVIEW_A5.md` (probes and method) and its evidence.
- The Results of WP5-UX-FIX7 and WP5-UX-REGATE5, with their evidence.
- The diff `5e104e1..bf954c0` and the whole round `014bd47..bf954c0`.

## Scope

1. **Delta proof.** From the diff `5e104e1..bf954c0`, show that FIX7 changes no area-A
   behaviour:
   - no request, endpoint, body, `expected_version`, reason prompt, confirmation step,
     calculation or saved value changes in any dialog or edit path whose focus handling
     changed; Cancel and Escape still cancel without a write;
   - the switcher reaches exactly the same routes as before (own timesheet and each
     shared owner), shared views stay read-only where AC-16 requires, owner-only
     controls stay hidden, and isolation holds (no other owner's data reachable);
   - selecting days by `data-day` opens the same accounting date as before in every
     reporting zone, including around a DST change and with a device zone different
     from the saved reporting zone (R-07); the new accessible names show the same
     accounting date as the cell;
   - the sticky-size hook and scroll padding cannot hide or block an edit, clock, reason
     or confirmation control;
   - no area-A assertion removed or weakened (FIX7 renamed day-button names in specs;
     every replaced assertion must still test the same thing).
2. **Area A mandatory checks rerun on bf954c0** (items 1-7 of `WP5-UX-AUDIT-A.md`,
   reusing A5's probes as a method): endpoints and bodies versus 014bd47 for every edit
   path (side panel, modal editor below 1200px, phone sheet, in-cell picker with its
   review, batch, clock, review, sign-off, import commit, opening balance, sharing
   change/end); the client computes no business minutes; A-01 still closed; R-07 with a
   device-zone probe and the zone-note due time; AC-04; AC-16 and AC-01; privacy
   (signature image only on the Review); PDF/AC-06/07/10 unchanged; server and domain
   unchanged since 014bd47 except `src/domain/format.ts`; `npm test`; e2e specs
   day-editor, sharing, isolation, review, submission, timesheet, import, pdf-visual,
   focus-ring and the new keyboard-access spec on both projects; AC-13 once.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-A6` (set TEMP and TMP to it).
  Ports 48320-48339 for anything you start. Set `DATA_DIR` and `DATABASE_PATH` inside the
  task folder for every CLI or server run; never touch `%LOCALAPPDATA%\timesheet-dev`.
  No Docker. Give each Playwright run its own output folder; give probe actions a short
  timeout.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES), NO `| node`, NO `| python`, NO `node -e`, NO `node -` OR `python -`. NEVER PIPE
  OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`.** Write
  scripts with the Write tool and run them by path; python only as the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`;
  put Node 24 first on PATH (with `cygpath -u`) before any node call; first shell call
  `node --version`.
- **Create files ONLY inside the task folder or the evidence folder** (never on `D:\`
  or in the repository root).
- Stop only processes you spawned, through their own handle. Never kill by PID. Never
  remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Never edit source, tests, docs, the board or STATE. Synthetic data and local capture
  only. Leave nothing running.
- In the review, Results and evidence never write an email address other than the full
  synthetic `@example.invalid` form, and never a real profile path (use `<user>`); mask
  probe-truncated addresses as `<email>`.

## Output

- `handoff/delivery/WP5_UX_REVIEW_A6.md` and `handoff/delivery/WP5_UX_REVIEW_A6.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence (scripts as `*.mjs.txt` / `*.py.txt` / `*.ts.txt`,
  screenshots `*-synthetic.png`) in `handoff/delivery/evidence/WP5-UX-AUDIT-A6/`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED, with findings listed separately
  (ID, severity, file:line, evidence, required fix).

Return at most 160 words, beginning with your self-reported model: the decision, the
delta proof result, any findings, the mandatory check counts, the digests and the
evidence files.

## Results

(auditor appends here)

### Attempt 1 (2026-10-09 Los Angeles, self-reported model claude-opus-5-5): PASS

- Decision: **PASS**; findings: none. Review: `handoff/delivery/WP5_UX_REVIEW_A6.md` (+ `.vi.md`); evidence:
  `handoff/delivery/evidence/WP5-UX-AUDIT-A6/` (index `00-README.txt`, 159 masked LF files, `38-evidence-check.txt`:
  0 CR bytes, 0 profile paths, 0 user-name hits, 0 addresses outside the full synthetic form).
- Model check: the strongest author of the snapshot is claude-opus-5-5 (WP5-UX-PLAN, T02, T04, FIX5; FIX7 agent
  ac4684761796f0e78); this auditor (board agent ae28cb6041639f3c1) is claude-opus-5-5, so not weaker. Fresh context;
  authored nothing in this round and ran no gate, sweep or earlier audit of it.
- Digest of record b7c011d2f47b6cf45ec085064f6c8e5da1847f8ffdd3ba54ac77dc995a02d563 (793 files) first and at the end:
  ls-tree of bf954c0 and of HEAD (= origin/main = bf954c0), `npm run digest`, and a clean `git archive` export hashed
  with `git hash-object --no-filters` before and after all checks (unchanged); nothing outside `handoff/` changed
  (`00-digest.txt`, `00-digest-after.txt`).
- Delta proof 5e104e1..bf954c0 (29 FIX7 paths; d3935e7 and 5b349f8 handoff-only): no area-A behaviour change.
  Static: no server/domain/`api.ts`/`fixtures.ts` diff, 0 write call texts changed, 12/12 body builders identical,
  `dist/server` and `dist/domain` byte-identical to 5e104e1, CSS touches no visibility/hit-test property. Run time
  (same steps on a bf954c0 and a 5e104e1 build, 1280/1024/390): every Cancel, Escape, Back and step change of the batch
  review, label-pick review, editor delete, clock out, sharing change/end/leave, import confirmation and opening
  balance writes nothing on both, and every commit sends the same body (Settings/Import also equal to 014bd47); the
  switcher reaches the same 6 routes with the same share bar, owner-only controls, sessions and requests, and the same
  isolation (404/403); day selection by `data-day` in 8 device zones x 4 periods around 5 DST changes: 448 rows per
  layout identical, 112 clicks per layout each opening its own date with focus back on its own button; name sweep
  87600 checks x 8 device zones, 0 failures; sticky sizes: bf954c0 516/516 focus checks at 1280/768/1024/390 and 215/215
  trial clicks pass, the 2 off rows at 320 are a programmatic focus of the date field (identical on 5e104e1) and real
  Tab/Shift+Tab reach it fully visible on bf954c0 in 20/20 rows; 5e104e1 is off in 70 of 645. No area-A assertion
  removed or weakened (15 removed lines, each replaced by the same check). `36-compare.txt`: missing=0 mismatches=0.
- Mandatory checks on the bf954c0 export: `npm ci` 0; `npm test` 0 (82 files, 1823 passed); typecheck 0, lint 0, build 0
  (no deprecation line); e2e day-editor, sharing, isolation, review, submission, timesheet, import, pdf-visual,
  focus-ring, keyboard-access on both projects exit 0: 155 passed, 23 skipped by project conditions, 0 failed, 0 flaky
  (desktop 77 + 12, mobile 78 + 11); AC-13 once 1/1; `npm audit --omit=dev` 0 vulnerabilities (all: one dev-only high,
  R1). Area A items 1-7 (A5 probes adapted, 18 passed + bodies rerun 3): bodies equal 014bd47 in all layouts, client
  computes no business minutes, A-01 closed (36 refusals, 0 PUT), R-07 and the zone-note due time, AC-04, AC-16/AC-01,
  privacy, PDF/AC-06/07/10 unchanged; boundary since 014bd47 only `src/domain/format.ts`.
- Risks (Info, no fix needed): R1 dev-only advisory; R5 phone first-screen as at 5e104e1; N5 programmatic focus does not
  scroll a date input (probe method); N6 the share change step ignores Escape (unchanged); N7 `sheetModel.ts:111`
  spacing.
- Runtime: Git Bash only; no pipe into head/tail, no stdin-fed script, no null-device redirect; files only in the task
  folder, the evidence folder and the review pair; sequential runs, separate Playwright output folders; e2e fixtures
  chose their own loopback ports, no server of my own; nothing left running. Probe-design slips corrected before the
  recorded runs (missing module package file; disabled Save focused; an unscoped selector list in the 5e104e1 phone
  day probe, rerun `32b-…`; notes text and key order in the first comparison, kept as `36a-…` and fixed by `30b-…` and
  sorted keys).
- Next action: the coordinator records this PASS with WP5-UX-AUDIT-B6 and, if both pass, re-accepts WP5 at bf954c0
  through the committer; WP5-UX-AUDIT-A6 supersedes WP5-UX-AUDIT-A5 (and A2-A4, WP5-RECHECK) for area A.

Status: done
