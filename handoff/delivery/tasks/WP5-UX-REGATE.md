# WP5-UX-REGATE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-REGATE; package WP5; kind gate;
  attempt 1; depends on WP5-UX-FIX3-FREEZE (done).
- Scope: rerun the WP5 package-final gate after the fix round that answered
  WP5-UX-AUDIT-A (A-01, fixed by WP5-UX-FIX2) and WP5-UX-AUDIT-B (B-01..B-04, fixed by
  WP5-UX-FIX3). The previous package-final gate WP5-UX-GATE passed on 831f760 (digest
  3d274c9e).
- Target: `freeze_commit` = 589bcff5541a603abad696a3303dbea11cccb4a7 (HEAD =
  origin/main). Expected digest of record
  8c07aac5fbd539b2f43ae8a21fb456f2be950d628f7eb9ca647430c7469f0a2e: compute it on a clean
  export of 589bcff and cross-check with the `git ls-tree` form and `npm run digest`.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H (package-final snapshot), novelty no. Records in English.

## Read

- AGENTS.md from disk first.
- `handoff/delivery/tasks/WP5-UX-GATE.md` (gate items 1-8, method, results and
  evidence). You rerun that method on the new freeze.
- The Results of `WP5-UX-FIX2.md` and `WP5-UX-FIX3.md`, and the findings in
  `WP5_UX_REVIEW_A.md` and `WP5_UX_REVIEW_B.md`.

## Gate items

1. **Rerun WP5-UX-GATE items 1-8** on a clean export of 589bcff with the same method and
   limits: `npm ci`, lint, verify with deprecation tracing; the full e2e suite on both
   projects with per-project counts; AC-13 three times and under `Asia/Tokyo` and
   `America/New_York` through a wrapper (record the zone reported); the drill `--wp3`
   (record the image ID and size; forbidden-file scan); the docs/11 compose config forms;
   env keys; `npm audit --omit=dev`; validate_package `--preflight`,
   validate_orchestration, check_recovery (106 probes), precommit self-test; business
   boundary since 014bd47 (`src/server` and `src/domain`: only the `formatHoursMinutes`
   display formatter in `src/domain/format.ts`); PDF unchanged and pdf-visual passing;
   scope classification since 014bd47; contrast of the token pairs in both themes;
   `npm test` three times (watch for native worker crashes); synthetic screenshots;
   44px targets and no horizontal scroll at 390px.
2. **Fix-round scope.** `git diff --stat 831f760..589bcff` outside handoff/: only client
   files, client/e2e tests and docs/04 (EN and VI). List them.
3. **Fixed findings, observed directly in the built app:**
   - A-01: in the day editor, hours "2-" with 30 minutes, and hours 4 with minutes "3-",
     are refused with a visible, announced error and no `PUT /api/days/:date` is sent;
     valid input saves the same `leave_minutes` as before; empty fields save 0.
   - B-01: at 390x844 the bottom of the first `[data-day]` row is at or above the top of
     the bottom tab bar (record both values).
   - B-02: at 1024x800 and 768x800 with the day editor open, no focusable sheet control
     is entirely covered by the panel (or the page behind is inert); Escape with focus on
     the sheet closes the panel and focus returns to the day's button; at 1280x800 the
     panel is beside the sheet.
   - B-03: `tests/e2e/import.spec.ts` asserts the absence checks on `#/admin` in both
     projects (read the test and its result).
   - B-04: docs/04 lines about the category choice and the Check words (EN and VI) match
     the UI.
   - Phone period card: Tab order previous, next, review matches the visual order.
4. Screenshots: at most ten `*-synthetic.png`, including the phone first screen, the
   1024px panel and the Review.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX-REGATE`. Ports 47970-47989, with
  `SMOKE_PORT` in that range. Set TEMP and TMP to the task folder.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Docker: Compose project `ts-wp5-uxregate`, non-TTY flags only. At the end, remove the
  drill image by exact tag and the project by name; record
  `docker ps --all --filter name=ts-wp5-uxregate` (must be empty).
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
  NO `| python`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`.
  NEVER REDIRECT TO `/dev/null` OR `nul`.** Write scripts with the Write tool and run
  them by path; python only as the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
  (write `<user>` in the evidence); put Node 24 first on PATH before any node call; first
  shell call `node --version` (v24.x).
- Create files only inside the task folder and the evidence folder.
- Stop only processes you spawned, through their own handle. Never kill by PID. Never
  remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Synthetic data and local mail capture only. Never edit source, docs, tests, the board
  or STATE. Leave nothing running.

## Output

Write your results into this file with the Edit tool. Put masked LF `.txt` evidence in
`handoff/delivery/evidence/WP5-UX-REGATE/`, with scripts saved as `*.mjs.txt`,
`*.py.txt` or `*.ts.txt`, and screenshots as `*-synthetic.png`. Record the drill image
ID (the pilot packet identity refresh uses it). Decide PASS, FAIL or NOT VERIFIED from
actual results; NAS items stay NOT VERIFIED.

Return at most 200 words, beginning with your self-reported model: the decision, the
digest of record (three forms), each gate item result with counts and exit codes, each
fixed-finding observation, the image ID, and the evidence files.

## Results

### Verifier result (attempt 1) - decision: PASS (NAS items NOT VERIFIED)

Self-reported model: claude-sonnet-5-5. Freeze 589bcff5541a603abad696a3303dbea11cccb4a7; HEAD = origin/main = the same before
and after (no non-handoff path changed since the freeze). Node v24.21.0 portable (first call on the portable PATH),
Git Bash, workflow Python (codex runtime, user `<user>`) for the validators. Raw output `D:\.claude-tmp\timesheet\WP5-UX-REGATE`
(TEMP/TMP there); masked LF evidence in `handoff/delivery/evidence/WP5-UX-REGATE/`. DATA_DIR/DATABASE_PATH in the task
folder; SMOKE_PORT 47971; e2e servers and the drill use OS-chosen loopback ports as in earlier gates. Nothing in
`%LOCALAPPDATA%\timesheet-dev` written (only the portable Node read).

Digest of record `8c07aac5fbd539b2f43ae8a21fb456f2be950d628f7eb9ca647430c7469f0a2e`, 789 files (handoff/ excluded): equal in
three forms: clean `git archive 589bcff` export hashed with `git hash-object --no-filters` (before and after all checks,
scratch spec and tz probe removed, same file list), the `git ls-tree` form, and `npm run digest` in the repository (run last).
Equals the expected value.

| # | Item | Result |
|---|---|---|
| 1 | `npm ci` exit 0; `npm run lint` exit 0; `npm run verify` exit 0 | verify: 82 files, 1820 tests passed, SMOKE PASSED; with `--trace-deprecation --pending-deprecation`: 0 deprecation lines in ci, lint, verify |
| 1 | `npm run test:e2e` exit 0 | 164 passed, 10 skipped (5.1 min). desktop 82 ok + 5 skipped, mobile 82 ok + 5 skipped (skips: mobile-only tests on desktop, desktop-only B-02 tests and pdf-visual on mobile) |
| 1 | AC-13 alone x3 | exit 0 x3; 1 test passed each; 3.78 s, 3.63 s, 3.66 s |
| 1 | AC-13 under real zones (wrapper `run-tz.mjs.txt`, TZ in the vitest child, plus a probe test in the same run; machine zone America/Los_Angeles) | Asia/Tokyo: probe `zone=Asia/Tokyo`, offset -540, 2 passed, exit 0. America/New_York: probe `zone=America/New_York`, offset 300, 2 passed, exit 0 |
| 1 | drill `--wp3` (`git archive 49651c8` + npm ci + build:server, both exit 0) | exit 0; stages 33/31/57/35/27/23 = 208 PASS, 0 FAIL; image `sha256:6ab12fdf7889467842a044430dee0386d9f8755897ff2d4681421f558080cf72` (110013600 B, linux/amd64); forbidden-file scan PASS |
| 1 | `docker compose config` live, restored, rollback (synthetic scratch project, no container) | exit 0 x3: live `ts-wp5-uxregate`, `timesheet:aaaaaaa`, `<task>/cfgproj/data`; restored `ts-wp5-uxregate-restored`, restore dir; rollback `ts-wp5-uxregate-rollback`, `timesheet:bbbbbbb`, restore dir, `JOB_RUNNER: "off"`. docs/11 sections 2 and 4 keep the protected env-file copy, release commit, source digest and image ID |
| 1 | env keys of docs/11 and 12 | 21 keys; all in `.env.example`, `config.ts`, `index.ts`, `compose.example.yaml` or `Dockerfile`; only SQLITE_BUSY and WP5_HANDOFF map to none (not env keys, same as WP5-REGATE and WP5-UX-GATE) |
| 1 | `npm audit --omit=dev` exit 0 (0 vulnerabilities); validate_package --preflight 0 PASS, validate_orchestration 0 PASS, check_recovery 0 PASS (106 probes); precommit self-test exit 0 PASS (35 path, 74 line samples, 12 rules) | validators run in the clean export (committed board and docs at 589bcff) |
| 1 | Business boundary `git diff --stat 014bd47..589bcff -- src/server src/domain` | only `src/domain/format.ts`, 13 insertions, 0 deletions: the doc comment and `formatHoursMinutes` (display only). No server change, no other domain change (`20-bound-stat.txt`, `20-bound-diff.txt`) |
| 1 | PDF unchanged (AC-10) | `git diff --stat 014bd47..589bcff -- src/server/pdf tests/e2e/pdf-visual.spec.ts` empty (0 bytes); pdf-visual 2 passed on desktop in the e2e run (mobile skips it by design) |
| 1 | Scope since 014bd47 outside handoff/ (67 paths: 14 A, 49 M, 4 D; `22-scope.txt`) | identical set to the WP5-UX-GATE scope: governance `.claude/agents/*` (8); docs 04, 08, 10, 12 EN+VI (8); `src/client/**`; `src/domain/format.ts`; `tests/client/*`, `tests/domain/engine.test.ts`, `tests/e2e/*`. An automated filter finds no path outside those classes. No `src/server`, no config, no package file |
| 1 | Contrast (`contrast.mjs.txt`, `40-contrast.txt`; tokens read from `styles.css`) | 27 pairs per theme, all text pairs at least 4.5:1. Required, light / dark: attention-ink on attention-bg 6.53 / 8.58; muted on day-nonworking 5.20 / 6.18; accent on sheet-head 5.23 / 6.00; text on day-nonworking 13.93 / 12.68. Lowest text pair 4.65 (muted on sheet-head-off, light). Same as WP5-UX-GATE: the non-text `--sheet-rule-strong` on card 2.86 light / 2.97 dark is under the 3:1 UI line (decorative table rule, informational, not a required pair) |
| 1 | `npm test` x3 | exit 0 x3; each 82 files, 1820 tests passed; native worker crash lines (0xC0000005, worker crash, IPC): 0 in all three |
| 1 | Screenshots | 10 `*-synthetic.png` of the built app: timesheet desktop light and dark, phone light (first screen, scrollY 0) and dark, editor desktop panel at 1280, editor panel at 1024, editor phone sheet, batch (phone), Review desktop and phone |
| 1 | 44px targets and overflow at 390 px | phone e2e shell/day-editor/review tests passed; probe: timesheet 41 controls, editor sheet 49, batch 46, Review 8, all 0 below 44x44; scrollWidth 390 = innerWidth 390 in all four states (desktop controls are 36-40 px by design) |
| 2 | Fix-round scope `git diff --stat 831f760..589bcff` outside handoff/ (`22a-fixround.txt`) | 12 files, 555 insertions, 58 deletions: client `src/client/DayEditor.tsx`, `TimesheetScreen.tsx`, `components/DayFieldsForm.tsx`, `components/PeriodBar.tsx`, `components/leaveInputModel.ts`, `styles.css`; client test `tests/client/leaveInputModel.test.ts`; e2e `tests/e2e/day-editor.spec.ts`, `import.spec.ts`, `timesheet.spec.ts`; docs `docs/04_UX_AND_SETTINGS.md` and `.vi.md`. Nothing else (no server, domain, config, other docs) |

Fixed findings, observed in the built app (scratch spec `ux-regate.spec.ts.txt`, run in the task-local export only, removed
before the final digest; passed in both projects; `obs-desktop.txt`, `obs-phone.txt`, `60-uxregate-run.txt`):

- A-01: hours "2-" with minutes 30 and hours 4 with minutes "3-" (typed with keystrokes) are each refused with a visible
  `role=alert` message "Enter leave as whole hours (0 to 24) and minutes (0 to 59), at most 24h 00m.", `aria-invalid=true`
  on the offending field only, 0 PUT `/api/days/:date` sent, stored `leave_minutes` 0 (both projects). Valid 2 h 30 m sent one PUT
  with `leave_minutes: 150` and stored 150; empty fields sent `leave_minutes: 0` and stored 0. The e2e test for the same cases
  also passed in both projects (7 malformed forms).
- B-01: phone 390x844, scrollY 0: first `[data-day]` row top 585.44, bottom 659.02; bottom tab bar top 788; 659.02 <= 788.
  The e2e tests (zone equal and zone note shown) passed on mobile.
- B-02 (desktop project, 800 px high): at 1024 and 768 the panel is modal (`:modal` true), 140 Tab/Shift+Tab presses each:
  focus entirely under the panel 0, focus outside the panel 0 (focus stays inside the panel); `focus()` on a sheet day
  button leaves the focus on the dialog; Escape closes the panel and focus returns to the day's button. At 1280 the panel is not
  modal (`:modal` false), sits at x=824 right of the sheet columns, focus left the panel 89 times (sheet usable), none
  entirely under it; with focus on another day's button Escape closes the panel and focus returns to the opened day's button.
- B-03: `tests/e2e/import.spec.ts:382` ("the Import entry is for the signed-in person and is not part of the administrator
  views") now asserts on `#/admin` the heading "Administration", no heading "Import a workbook" (count 0) and `main` not
  containing "Opening OT balance"; passed in desktop (test 45) and mobile (test 132).
- B-04: docs/04 EN lists the Check words Complete, Running, Open session, Confirm breaks, No times, Missing record, Upcoming,
  Calculation problem, which equal the `text:` values in `sheetModel.ts` (Missing record is shown when a day has sessions but
  no record; the seeded run showed "No times" for unseeded workdays and "Complete"/"Confirm breaks" for the seeded ones). The
  batch line names "Category for selected days" and "Preview changes": the built app shows one control with that label and
  one "Preview changes" button. The VI file carries the same words (Missing record present, "Category for selected days"
  present).
- Phone period card tab order: Previous focused, Tab goes to Next, Tab goes to Review (both projects); phone positions
  previous (28, 84), next (318, 84), review (28, 192): visual reading order equals Tab order. Desktop previous x=72, next
  x=612, review x=660 on one row.

Cleanup: drill image `ts-wp5-uxregate-timesheet:drill` removed by exact tag (untagged and deleted), project `ts-wp5-uxregate`
down -v (exit 0); final `docker ps --all --filter name=ts-wp5-uxregate` empty; no image, volume or network of the project
remains. No process left running. Nothing committed, sent or edited outside this brief and the evidence folder. One slip:
the drill command was started with stdin redirected from /dev/null (`< /dev/null`, no file written). NAS target NOT VERIFIED
(owner steps, docs/11 sections 13-16). Failing items: none.
