# WP5-UX-FIX6 dispatch brief

- Status: dispatched 2026-10-09 after the owner answered WP5-UX-Q1 with option (a)
  (fix both findings; board `owner_decisions`).
- Mission/task: timesheet-software-readiness / WP5-UX-FIX6; package WP5; kind fix;
  attempt 1; addresses audit WP5-UX-AUDIT-B4 (FIX REQUIRED); depends on WP5-UX-REGATE3
  (PASS).
- Findings in `handoff/delivery/WP5_UX_REVIEW_B4.md` (section "Findings"; evidence in
  `handoff/delivery/evidence/WP5-UX-AUDIT-B4/`, especially the `44-…`, `49c-…`, `49d-…`
  and `50-…` files and the `q6-focus-ring-*` screenshots):
  - **WP5-UX-B4-01 (Medium):** `src/client/styles.css` line 37 (`--focus-ring: 0 0 0 3px
    rgb(31 95 191 / 0.35)`) and line 178 (dark, 0.45), used by the `:focus-visible` rule
    (transparent outline) around 215-219, the phone tabs (328-330), buttons (501-503) and
    the sheet "Edit {date}" buttons (1331-1333). Blended over the adjacent background the
    ring measures 1.72:1 (light) and 2.46:1 (dark); it is the only focus cue. WCAG 2.2 SC
    1.4.11 with 2.4.7 needs at least 3:1. Required: a token-only change that gives the
    shared focus indicator at least 3:1 against every surface it sits on (card, page,
    sheet head, non-working tint, tab bar, attention background; light and dark), for
    example a solid accent ring or a two-colour ring (WCAG technique C40: a card-coloured
    gap inside an accent ring); keep the shared transition token and the 4px radius
    language. Add an automated check (an e2e or a contrast probe in the test suite) that
    the composited ring colour reaches 3:1 against the adjacent background for a button,
    a link, a phone tab and a sheet date, in both themes.
  - **WP5-UX-B4-02 (Low):** `src/client/components/PeriodBar.tsx` around lines 71-74
    (`instantText(period.due_at_utc, zone)`, `format.ts` 38-40): the zone note shows the
    due time as "2026-10-14 07:00" while docs/04 line 45 (EN and VI) promises US dates in
    the header and period bar. Format it like the bar ("Wed 10/14/2026, 07:00") through
    the existing client formatter and assert it in the zone-note test in
    `tests/e2e/timesheet.spec.ts`. Display only: no change to the instant, the zone or
    any value.
- Profile/routing: timesheet-worker (effort medium), requested model sonnet, no
  override. Routing: size S, risk L (tokens and one display string), novelty no. Task
  record in English.
- Base: HEAD = origin/main (record it) with source digest
  b7bbcbc0a5bbb097a5547b441d1228f20963445e86b0429169cb7ab47980a873 (frozen at edaaa85).
  Record both before you start. Uncommitted coordinator files under `handoff/` are
  expected; never touch them.

## Read

- AGENTS.md from disk first ("Unified Frontend & UI/UX Standards": tokens only).
- `handoff/delivery/WP5_UX_REVIEW_B4.md` (findings and risks) and its evidence.
- `src/client/styles.css` (token blocks, focus rules), `src/client/components/PeriodBar.tsx`,
  `src/client/components/format.ts` (read; change only if a formatter must be added),
  `tests/e2e/timesheet.spec.ts` (zone-note test).

## Hard constraints

- Tokens only for the focus ring (no per-component hard-coded colours); every existing
  focus behaviour keeps working (side panel, modal editor, label picker, phone tabs).
- No server, API, request-body or calculation change; no change to which zone or
  instant is shown, only its text format.
- No e2e assertion removed or weakened; the new contrast check must fail on the
  edaaa85 token values (show it).

## Owned paths

- `src/client/styles.css`
- `src/client/components/PeriodBar.tsx`, `src/client/components/periodBarModel.ts`,
  `src/client/components/format.ts`
- `tests/e2e/` spec files (`*.spec.ts`); `tests/e2e/fixtures.ts` is NOT owned
- `tests/client/` unit tests
- `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md` (only if the focus
  description or line 45 needs a precise update)
- this brief's Results section
- `handoff/delivery/evidence/WP5-UX-FIX6/` (masked LF `.txt` only, plus screenshots whose
  basenames contain `synthetic`)

If another file must change, stop and report it instead of editing it.

## Checks (in this order; verify and digest are the LAST commands)

1. Put Node 24 first on PATH, then `node --version` (v24.x).
2. Reproduce both findings at the base with the new checks failing; record the runs.
3. Fix; `npm run typecheck`, `npm run lint`, `npm test`.
4. The FULL e2e suite on both projects (with `E2E_SCREENSHOT_DIR` inside the task
   folder). Record counts and the measured ring contrast per surface and theme.
5. Synthetic screenshots of the focus ring on a button, a sheet date and a phone tab,
   light and dark (at most six), named `fix6-*-synthetic.png`.
6. `validate_package.py --preflight` by its script path with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
   (write `<user>` in the evidence).
7. A Grep over your changed files and evidence for user-profile paths and email
   addresses; record the counts.
8. `npm run verify` with `SMOKE_PORT` in 48170-48179 and `DATA_DIR` and `DATABASE_PATH`
   set inside the task folder.
9. `npm run digest` LAST. If any file changes after it, rerun verify and the digest.
10. Copy masked logs of steps 2-4, 6, 8 and 9 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -e`, NO `node -` OR
  `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM
  `/dev/null` OR `nul`.** Redirect to a file in the task folder and read it with the
  Read tool. Use the Write and Edit tools for files.
- **Create files only inside the task folder, the evidence folder or your owned paths.**
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX-FIX6`: set TEMP and TMP to it. Never touch
  `%LOCALAPPDATA%\timesheet-dev` data.
- Never kill processes by PID. Never remove anything recursively. Never write into the
  repository root.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool and finish with "Status: done". Do not commit or
  push.

## Return

At most 140 words, beginning with 'Self-reported model: ...': the reproductions, the fix,
the ring contrast per surface and theme, files changed, unit and full e2e counts per
project, preflight and verify exit codes, the final full 64-hex digest, the evidence
files, the background-task confirmation, and any stop or deviation.

## Results

Model: claude-sonnet-5-5. Base: HEAD = origin/main = 49a3ff0 (the brief said c24d634; 49a3ff0 only
adds handoff checkpoint files, src/tests unchanged since edaaa85). `git status --short` at start: only
the four expected handoff/ files (ORCHESTRATION.json, WORKFLOW_REVISION_CHECKPOINT(.vi).md, this brief).

Reproductions at base (evidence `03-repro-base.txt`, Node v24.21.0):
- B4-01: new `tests/e2e/focus-ring.spec.ts` failed on all four runs: `--focus-ring rgba(31,95,191,0.35)`
  against `--card` = 1.72:1 (light), `rgba(110,168,255,0.45)` = 2.46:1 (dark).
- B4-02: `timesheet.spec.ts` zone-note assertion failed on both projects: expected
  "Wed 10/14/2026, 07:00", received "2026-10-14 07:00".

Fix:
- `src/client/styles.css`: `--focus-ring: 0 0 0 1px var(--card), 0 0 0 3px var(--accent)` (C40 two-colour
  ring, same 3px extent) and new `--focus-ring-inset` for the phone tab; dark override removed (accent
  and card already switch). Shared `--transition` unchanged.
- `periodBarModel.ts` `dueInZoneText`, used by `PeriodBar.tsx` (display only; unit test added).
- `docs/04_UX_AND_SETTINGS.md` and `.vi.md` line 79: focus ring description.

Ring contrast (outer accent ring vs surface, light / dark): card 6.09 / 6.79, page 5.68 / 7.52,
sheet head 5.23 / 6.00, sheet head off 4.86 / 5.43, non-working 5.43 / 6.40, off (tab hover)
5.38 / 6.22, attention 5.58 / 5.94. Real controls (button, link, phone tab, sheet date) measured
6.09 light and 6.79 dark. Phone tab bar is the card surface.

Checks: typecheck 0, lint 0, `npm test` 82 files / 1821 tests passed; build 0; full e2e both projects:
174 passed, 16 skipped, 0 failed (87 desktop and 88 mobile ok lines, includes 4 new focus-ring tests);
`validate_package.py --preflight` exit 0 (python under C:\Users\<user>\.cache\codex-runtimes\...);
`npm run verify` exit 0 (SMOKE_PORT 48171, DATA_DIR and DATABASE_PATH in the task folder).
Privacy grep over evidence and changed files: 0 profile paths, 0 real emails (2 synthetic
example.invalid lines in the verify log). Screenshots: six `fix6-focus-*-synthetic.png`.

Files changed: src/client/styles.css, src/client/components/PeriodBar.tsx, periodBarModel.ts,
tests/e2e/focus-ring.spec.ts (new), tests/e2e/timesheet.spec.ts, tests/client/periodBarModel.test.ts,
docs/04_UX_AND_SETTINGS.md, docs/04_UX_AND_SETTINGS.vi.md, this brief, evidence folder
`handoff/delivery/evidence/WP5-UX-FIX6/`.

Digest: see the return message (final value recorded there).

Status: done
