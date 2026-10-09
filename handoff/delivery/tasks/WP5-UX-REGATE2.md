# WP5-UX-REGATE2 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-REGATE2; package WP5; kind gate;
  attempt 1; depends on WP5-UX-FIX4-FREEZE (done).
- Scope: rerun the WP5 package-final gate after WP5-UX-FIX4, which answered
  WP5-UX-AUDIT-B2 finding B2-01 (the phone "Open a day" field clipped the date at 360
  and 320px) and folded in O-1..O-3. The previous gate WP5-UX-REGATE passed on 589bcff
  (digest 8c07aac5).
- Target: `freeze_commit` = a2ea7a48ca7dbb275f5d1f7c3a3003b1658080cb (HEAD =
  origin/main). Expected digest of record
  0b8428fdbfc40598ba0c468486b4aa62367434727709ce62461a8984f130b77d: compute it on a clean
  export of a2ea7a4 and cross-check with the `git ls-tree` form and `npm run digest`.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H (package-final snapshot), novelty no. Records in English.

## Read

- AGENTS.md from disk first.
- `handoff/delivery/tasks/WP5-UX-REGATE.md` (gate items, method, results and evidence).
  You rerun that method on the new freeze.
- The Results of `WP5-UX-FIX4.md` and finding B2-01 in `WP5_UX_REVIEW_B2.md`.

## Gate items

1. **Rerun WP5-UX-REGATE item 1** on a clean export of a2ea7a4 with the same method and
   limits (the full WP5-UX-GATE items 1-8: npm ci, lint, verify with deprecation tracing,
   full e2e both projects with per-project counts, AC-13 three times and under
   `Asia/Tokyo` and `America/New_York` through a wrapper, drill `--wp3` with image ID and
   size and forbidden-file scan, compose config forms, env keys, `npm audit --omit=dev`,
   validators incl. check_recovery 106 probes, precommit self-test, business boundary
   since 014bd47, PDF unchanged and pdf-visual passing, scope since 014bd47, contrast in
   both themes, `npm test` three times, synthetic screenshots, 44px and no horizontal
   scroll at 390, 360 and 320px).
2. **Fix scope.** `git diff --stat 589bcff..a2ea7a4` outside handoff/: only
   `src/client/styles.css`, a comment in `src/client/DayEditor.tsx`,
   `tests/e2e/timesheet.spec.ts` and docs/04 (EN and VI). Record the DayEditor diff to
   show it is comment-only.
3. **Observed in the built app:** B2-01 closed (at 390, 360 and 320px the "Open a day"
   field shows the full date; record each width); B-01 still holds at 390x844 (first
   `[data-day]` bottom at or above the tab bar top; record both values, also with the
   zone note); the earlier fixed items still hold (A-01 refusal with no PUT, B-02 modal
   editor below 1200px with Escape and focus return, tab order).
4. Screenshots: at most ten `*-synthetic.png`, including the "Open a day" row at 360 and
   320px and the phone first screen.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX-REGATE2`. Ports 48040-48059, with
  `SMOKE_PORT` in that range. Set TEMP and TMP to the task folder.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Docker: Compose project `ts-wp5-uxregate2`, non-TTY flags only. At the end, remove the
  drill image by exact tag and the project by name; record
  `docker ps --all --filter name=ts-wp5-uxregate2` (must be empty).
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
  NO `| python`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`.
  NEVER REDIRECT TO `/dev/null` OR `nul`, AND NEVER REDIRECT STDIN FROM `/dev/null`.**
  Write scripts with the Write tool and run them by path; python only as the workflow
  Python
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
`handoff/delivery/evidence/WP5-UX-REGATE2/`, with scripts saved as `*.mjs.txt`,
`*.py.txt` or `*.ts.txt`, and screenshots as `*-synthetic.png`. Record the drill image
ID (the pilot packet identity refresh uses it). Decide PASS, FAIL or NOT VERIFIED from
actual results; NAS items stay NOT VERIFIED.

Return at most 200 words, beginning with your self-reported model: the decision, the
digest of record (three forms), each gate item result with counts and exit codes, the
observations, the image ID, and the evidence files.

## Results

### Verifier result (attempt 1) - decision: PASS (NAS items NOT VERIFIED)

Self-reported model: claude-sonnet-5-5. Freeze a2ea7a48ca7dbb275f5d1f7c3a3003b1658080cb; HEAD = origin/main = the same before and
after (no non-handoff path changed since the freeze). Node v24.21.0 portable, Git Bash, workflow Python for the validators. Raw
output `D:\.claude-tmp\timesheet\WP5-UX-REGATE2` (TEMP/TMP there); masked LF evidence in
`handoff/delivery/evidence/WP5-UX-REGATE2/` (index `00-README.txt`). DATA_DIR/DATABASE_PATH in the task folder; SMOKE_PORT 48041;
e2e servers and the drill use OS-chosen loopback ports as in earlier gates. `%LOCALAPPDATA%\timesheet-dev` not written (portable
Node read only).

Digest of record `0b8428fdbfc40598ba0c468486b4aa62367434727709ce62461a8984f130b77d`, 789 files (handoff/ excluded): equal in three
forms: clean `git archive a2ea7a4` export hashed with `git hash-object --no-filters` (before and after all checks, scratch specs
and tz probe removed, same file list), the `git ls-tree` form, and `npm run digest` in the repository (run last). Equals the
expected value.

| # | Item | Result |
|---|---|---|
| 1 | `npm ci` exit 0; `npm run lint` exit 0; `npm run verify` exit 0 | verify: 82 files, 1820 tests passed, SMOKE PASSED; with `--trace-deprecation --pending-deprecation`: 0 deprecation lines in ci, lint, verify |
| 1 | `npm run test:e2e` exit 0 | 167 passed, 13 skipped (4.6 min). desktop 82 ok + 8 skipped (mobile-only tests), mobile 85 ok + 5 skipped (desktop-only B-02 tests and pdf-visual); 0 deprecation lines |
| 1 | AC-13 alone x3 | exit 0 x3; 1 test passed each; 3.80 s, 3.80 s, 3.94 s |
| 1 | AC-13 under real zones (wrapper `run-tz.mjs.txt` plus probe test; machine zone America/Los_Angeles) | Asia/Tokyo: probe `zone=Asia/Tokyo`, offset -540, 2 passed, exit 0. America/New_York: probe `zone=America/New_York`, offset 300, 2 passed, exit 0 |
| 1 | drill `--wp3` (`git archive 49651c8` + npm ci + build:server, both exit 0), project `ts-wp5-uxregate2` | exit 0; stages 33/31/57/35/27/23 = 208 PASS, 0 FAIL; image `sha256:410209b0d74225b7e20337279bccd6ab4bb0173a7437fa2e879344e2fac4ac9e` (110013545 B, linux/amd64); forbidden-file scan PASS |
| 1 | `docker compose config` live, restored, rollback (synthetic scratch project, no container) | exit 0 x3: live `ts-wp5-uxregate2`, `timesheet:aaaaaaa`, `<task>/cfgproj/data`; restored `ts-wp5-uxregate2-restored`, restore dir; rollback `ts-wp5-uxregate2-rollback`, `timesheet:bbbbbbb`, restore dir, `JOB_RUNNER: "off"` |
| 1 | env keys of docs/11 and 12 | 21 keys; only SQLITE_BUSY and WP5_HANDOFF map to none (not env keys, same as earlier gates) |
| 1 | `npm audit --omit=dev` exit 0 (0 vulnerabilities); validate_package --preflight 0 PASS, validate_orchestration 0 PASS, check_recovery 0 PASS (106 probes); precommit self-test exit 0 PASS (35 path, 74 line samples, 12 rules) | validators run in the clean export (committed board and docs at a2ea7a4) |
| 1 | Business boundary `git diff --stat 014bd47..a2ea7a4 -- src/server src/domain` | only `src/domain/format.ts`, 13 insertions (display formatter); no server change (`20-bound-stat.txt`, `20-bound-diff.txt`) |
| 1 | PDF unchanged (AC-10) | `git diff --stat 014bd47..a2ea7a4 -- src/server/pdf tests/e2e/pdf-visual.spec.ts` empty (0 bytes); pdf-visual passed in the e2e run (desktop; mobile skips it by design) |
| 1 | Scope since 014bd47 outside handoff/ (67 paths: 14 A, 49 M, 4 D; `22-scope.txt`) | byte-identical to the WP5-UX-REGATE scope list; an automated filter finds no path outside governance `.claude/agents`, docs 04/08/10/12, `src/client`, `src/domain/format.ts`, `tests/client`, `tests/domain/engine.test.ts`, `tests/e2e` |
| 1 | Contrast (`contrast.mjs.txt`, `40-contrast.txt`) | 27 pairs per theme, all text pairs at least 4.5:1 (lowest 4.65, muted on sheet-head-off, light); same as before: only the non-text `--sheet-rule-strong` on card (2.86 light / 2.97 dark) is under 3:1 (decorative table rule, informational) |
| 1 | `npm test` x3 | exit 0 x3; each 82 files, 1820 tests passed; native worker crash lines: 0 in all three |
| 1 | 44px and overflow at 390/360/320 (`obs-targets.txt`, e2e mobile loops passed) | timesheet 41, batch 46, editor 53, Review 8 controls; 0 below 44x44 and scrollWidth = innerWidth at all three widths (12 states) |
| 2 | Fix scope `git diff --stat 589bcff..a2ea7a4` outside handoff/ (`22a-fixround.txt`) | 5 files, 39 insertions, 12 deletions: `src/client/styles.css` (18), `src/client/DayEditor.tsx` (1 line), `tests/e2e/timesheet.spec.ts` (+27), `docs/04_UX_AND_SETTINGS.md` and `.vi.md` (1 line each). DayEditor diff (`23-fix-src-diff.txt`) is comment-only: one comment line "(the window crossed 768px)" became "(the window crossed 1200px)"; no code token changed. CSS: two new tokens `--date-field-min: 9.5rem`, `--open-day-label-min: 15.25rem` and the phone `.open-day` rule (wrap) |
| 3 | B2-01 closed (`obs-b2.txt`, scratch spec run in both projects; mobile ran) | value "2026-10-09" typed; field width, clip test (scrollWidth vs clientWidth) and page overflow: 390px: 146.2 px, 144/144, no clip, row one line (button beside); 360px: 220.0 px, 218/218, no clip; 320px: 180.0 px, 178/178, no clip (button wraps below at 360 and 320); `--date-field-min` 142.5 px; page scrollWidth equals width at all three. Screenshots show "10/09/2026" in full |
| 3 | B-01 at 390x844, scrollY 0 | zone equal (no note): first `[data-day]` bottom 659.02, tab bar top 788 (659.02 <= 788). Zone note shown: bottom 757.97, tab bar top 788 (757.97 <= 788). Also passed after the field was filled at 390. Informational: at 360 and 320 (height 844) with the note, the first row bottom is 827.36 and 924.92, below the tab bar top 788; B-01 is specified for 390x844 only (not asserted, not a gate claim) |
| 3 | A-01 (`obs-phone.txt`, `obs-desktop.txt`) | hours "2-" with minutes 30 and hours 4 with minutes "3-": visible `role=alert` "Enter leave as whole hours (0 to 24) and minutes (0 to 59), at most 24h 00m.", `aria-invalid=true` on the offending field only, 0 PUT sent, stored `leave_minutes` 0 (both projects). Valid 2 h 30 m: one PUT with `leave_minutes:150`, stored 150. Empty fields: PUT `leave_minutes:0`, stored 0 |
| 3 | B-02 (desktop, 800 px high) | 1024 and 768: panel `:modal` true, 140 Tab/Shift+Tab presses each: focus entirely under panel 0, outside panel 0; Escape closes, focus returns to the day's button. 1280: not modal, panel at x=824 beside the sheet, focus left the panel 89 times, none under it; Escape closes, focus returns to the opened day's button |
| 3 | Tab order of the period card | Previous -> Next -> Review in both projects. Phone positions previous (28, 84), next (318, 84), review (28, 192); desktop previous x=72, next x=612, review x=660 on one row: visual order equals Tab order |
| 4 | Screenshots | 10 `*-synthetic.png` kept: "Open a day" row at 360 and 320px, phone first screen with the zone note, phone light and dark first screens, desktop light and dark, editor panel at 1024, editor phone sheet, Review phone |

Cleanup: drill image `ts-wp5-uxregate2-timesheet:drill` removed by exact tag (untagged and deleted), project `ts-wp5-uxregate2` down -v
(exit 0); final `docker ps --all --filter name=ts-wp5-uxregate2` empty; no image, volume or network of the project remains. No process left
running. Nothing committed, sent or edited outside this brief and the evidence folder. Slips (no file written to the target):
one command with `> /dev/null 2>&1` and one with a stray `tail -0 /dev/stdin 2>/dev/null` on the background e2e command, both
against the /dev/null rule. NAS target NOT VERIFIED (owner steps, docs/11 sections 13-16). Failing items: none.

Status: done
