# WP5-UX-FIX4 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-FIX4; package WP5; kind fix;
  attempt 1; addresses audit WP5-UX-AUDIT-B2 (FIX REQUIRED); depends on WP5-UX-REGATE
  (PASS).
- Finding **WP5-UX-B2-01 (Low)** in `handoff/delivery/WP5_UX_REVIEW_B2.md` (section
  "Findings"; evidence `handoff/delivery/evidence/WP5-UX-AUDIT-B2/43b-PB3b-open-day-field.txt`,
  `pb3b-open-day-w360-synthetic.png`, `pb3b-open-day-w320-synthetic.png` and the 831f760
  comparison files): the phone block added by WP5-UX-FIX3 in `src/client/styles.css`
  around lines 1081-1103 (`.tools .open-day { flex-wrap: nowrap }`, a no-wrap label row,
  the input `flex: 1; min-width: 0`) shrinks the "Open a day" date field to 116.2px at
  360px and 76.2px at 320px, so "2026-10-09" shows as "10/09/202" and "10/0". At 831f760
  the field had its own row (153px) and showed the full date. WCAG 2.2 SC 1.4.10.
- Required fix: keep the date field at least the width of a full date (a new token, for
  example `--date-field-min`) and let the "Open a day" row wrap (label above the field,
  or the button below) when that does not fit, for example below 375px, WITHOUT breaking
  the 390x844 first-screen budget (B-01: the first day row bottom must stay at or above
  the tab bar top; the review notes the budget is tight, so do not make the 390px layout
  taller). Add a phone e2e assertion at 360 and 320px that the field is at least that
  width and shows the full value; keep every B-01 assertion passing.
- Also fold in the review's optional items, all small and in the same area:
  - O-1: docs/04 line 9 (EN and VI) still says the editor is "a side panel beside the
    sheet on desktop"; say that it is a side panel from 1200px and a modal panel below.
  - O-2: the comment in `src/client/DayEditor.tsx` around lines 83-84 says the mode
    switch happens at 768px; it is 1200px (comment only, no code change).
  - O-3: `.tools .open-day` is declared twice in the same phone block; merge it.
- Profile/routing: timesheet-worker (effort medium), requested model sonnet, no
  override. Routing: size S, risk L (layout of one phone row, docs and a comment),
  novelty no. Task record in English.
- Base: HEAD = origin/main (record it; the coordinator may have committed records since
  589bcff) with source digest
  8c07aac5fbd539b2f43ae8a21fb456f2be950d628f7eb9ca647430c7469f0a2e (frozen at 589bcff).
  Record both before you start. Uncommitted coordinator files under `handoff/` are
  expected; never touch them.

## Read

- AGENTS.md from disk first ("Unified Frontend & UI/UX Standards": tokens only).
- `handoff/delivery/WP5_UX_REVIEW_B2.md` (finding B2-01 and items O-1..O-4).
- `handoff/delivery/tasks/WP5-UX-FIX3.md` (how the compact phone layout was built).
- `src/client/styles.css` (phone block), `src/client/components/OpenDay.tsx` (read only),
  `tests/e2e/timesheet.spec.ts` (B-01 assertions).

## Hard constraints

- CSS, one comment, docs and one e2e assertion only: no TSX logic change, no server, API
  or request-body change; the field keeps its accessible name "Open a day".
- The 390x844 first-screen B-01 assertion keeps passing; no horizontal scroll at 390,
  360 or 320px; 44px targets; no e2e assertion removed or weakened.

## Owned paths

- `src/client/styles.css`
- `src/client/DayEditor.tsx` (the comment around lines 83-84 only)
- `tests/e2e/timesheet.spec.ts`
- `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md` (line 9 only)
- this brief's Results section
- `handoff/delivery/evidence/WP5-UX-FIX4/` (masked LF `.txt` only, plus screenshots whose
  basenames contain `synthetic`)

If another file must change, stop and report it instead of editing it.

## Checks (in this order; verify and digest are the LAST commands)

1. Put Node 24 first on PATH, then `node --version` (v24.x) as the first node call.
2. Reproduce B2-01 at the base with the new assertion failing at 360 and 320px; record
   the failing run.
3. Fix; `npm run typecheck`, `npm run lint`, `npm test`.
4. The FULL e2e suite on both projects (with `E2E_SCREENSHOT_DIR` inside the task
   folder). Record counts and the B-01 first-row bottom at 390x844.
5. Synthetic screenshots of the "Open a day" row at 390, 360 and 320px, saved as
   `fix4-open-day-w<width>-synthetic.png`.
6. EN/VI parity of the docs/04 change; `validate_package.py --preflight` by its script
   path with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
   (write `<user>` in the evidence).
7. A Grep over your changed files and evidence for user-profile paths and email
   addresses; record the counts.
8. `npm run verify` with `SMOKE_PORT` in 48030-48039 and `DATA_DIR` and `DATABASE_PATH`
   set inside the task folder.
9. `npm run digest` LAST. If any file changes after it, rerun verify and the digest.
10. Copy masked logs of steps 2-4, 6, 8 and 9 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -e` OR `node -` OR
  `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO `/dev/null`
  OR `nul`.** Redirect to a file in the task folder and read it with the Read tool. Use
  the Write and Edit tools for files.
- **Create files only inside the task folder, the evidence folder or your owned paths.**
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX-FIX4`: set TEMP and TMP to it. Never touch
  `%LOCALAPPDATA%\timesheet-dev` data.
- Never kill processes by PID. Never remove anything recursively. Never write into the
  repository root.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool and finish with "Status: done". Do not commit or
  push.

## Return

At most 130 words, beginning with 'Self-reported model: ...': the reproduction, the fix,
the field widths at 390/360/320 and the B-01 first-row bottom, files changed, unit and
full e2e counts per project, preflight and verify exit codes, the final full 64-hex
digest, the evidence files, the background-task confirmation, and any stop or deviation.

## Results

Base: HEAD = origin/main = 589bcff5541a603abad696a3303dbea11cccb4a7 (evidence/base.txt); frozen
digest 8c07aac5...0a2e. Node v24.21.0 first on PATH.

- Reproduction (repro.txt): new phone assertion at the base (token absent) failed at 390, 360
  and 320px; the date field measured 146.2px, 116.2px and 76.2px (B2-01 confirmed).
- Fix: `src/client/styles.css` tokens `--date-field-min: 9.5rem` and `--open-day-label-min:
  15.25rem`; the phone `.tools .open-day` rule is merged (O-3), wraps, and the label/input keep
  a full date (the button wraps below when the row does not fit). `DayEditor.tsx` comment now
  says 1200px (O-2). docs/04 line 9 EN and VI: side panel from 1200px, modal panel below (O-1).
  e2e: three assertions (390, 360, 320px) that the field is at least the token wide, value
  shown, no horizontal scroll, plus synthetic screenshots.
- Field widths: 390px 146.2px (row bottom 487.3, unchanged); 360px 220.0px; 320px 180.0px. B-01
  first-row assertions pass at 390x844 (fix3.txt, e2e.txt).
- Results: typecheck/lint exit 0; unit 82 files, 1820 tests passed; full e2e 167 passed, 13
  skipped (desktop 82 passed, mobile 85 passed); preflight PASS, exit 0 (workflow Python under
  C:\Users\<user>\.cache\...); verify exit 0; digest
  0b8428fdbfc40598ba0c468486b4aa62367434727709ce62461a8984f130b77d (789 files).
- Profile-path/email Grep over changed files and evidence: 0 matches.
- Evidence: handoff/delivery/evidence/WP5-UX-FIX4/ (txt logs, three fix4-open-day-w*-synthetic.png).
- Deviation: one early `ls | head` in a listing (harmless, no data written).

Status: done
