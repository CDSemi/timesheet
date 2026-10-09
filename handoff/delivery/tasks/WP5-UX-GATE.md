# WP5-UX-GATE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-GATE; package WP5; kind gate;
  attempt 1; depends on WP5-UX-FIX1-FREEZE (done) and GOV-SUPERSEDE-ACCEPT (done).
- Scope: the WP5 package-final gate for the owner-requested UI redesign round. The
  accepted WP5 source was 014bd47a8d906c944d2781eba4f2b91c5a532419 (digest 150420e7…).
  Since then the slices WP5-UX-T01..T06 and WP5-UX-FIX1 changed the client, one domain
  display formatter, tests and docs, and GOV-SUPERSEDE changed governance paths.
- Target: `freeze_commit` = 831f760838950a59f0e5c880f0bbefda15fe0c61 (the last commit
  that changed files outside handoff/). HEAD = origin/main =
  5beae2f668d15fc77a39b91a91e2c8bb6195d65a (it adds handoff records only). Expected
  digest of record 3d274c9e93c1acfb06ebea8de2df2396192548b881212d799a98e0304a3c7ea9.
  Compute it on a clean export of 831f760 and cross-check it with the `git ls-tree`
  form and `npm run digest` in the repository.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H (package-final snapshot), novelty no. Records in English.

## Read

- AGENTS.md from disk first.
- `handoff/delivery/tasks/WP5-GATE.md` and `WP5-REGATE.md` (gate items, method, runtime
  limits, results and evidence). You rerun that method.
- `handoff/delivery/tasks/WP5-UX-PLAN.md` section F (the "Gate (WP5-UX-GATE ...)"
  paragraph) and section G.
- The Results of `WP5-UX-T01.md` .. `WP5-UX-T06.md` and `WP5-UX-FIX1.md` (what changed,
  open notes: the native vitest crash in T03, the full-page phone screenshot with the
  fixed top bar mid-image in T02).

## Gate items

1. **Rerun WP5-GATE items 1-9** on a clean export of 831f760 with the same runtime
   limits: `npm ci`, lint and verify (with `--trace-deprecation --pending-deprecation`,
   zero deprecation lines); the full e2e suite (desktop and mobile, per-project counts);
   AC-13 alone three times; AC-13 under `Asia/Tokyo` and `America/New_York` through a
   wrapper script that sets TZ in the test child (as WP5-REGATE did; record the zone the
   process reports); the drill `--wp3` (record the image ID and size; forbidden-file
   scan); the docs/11 compose config forms; env keys; `npm audit --omit=dev`;
   validate_package `--preflight`, validate_orchestration, check_recovery (106 probes),
   precommit self-test; the digest last.
2. **Business boundary.** `git diff --stat 014bd47..831f760 -- src/server src/domain`
   shows only `src/domain/format.ts`, and that diff adds only the display formatter
   `formatHoursMinutes`. Record the diff stat and the added lines (no other domain or
   server change).
3. **PDF unchanged (AC-10).** `tests/e2e/pdf-visual.spec.ts` and `src/server/pdf/` are
   unchanged since 014bd47, and pdf-visual passes in the e2e run.
4. **Scope since 014bd47.** List every path changed outside handoff/ and classify it:
   client, the domain formatter, tests, docs (04, 08, 10, 12 with VI pairs), governance
   (`.claude/agents/*`, validator scripts under handoff/ are excluded). Anything else is
   a FAIL item.
5. **Contrast.** A script file in the task folder reads the token values from
   `src/client/styles.css` (light and dark blocks) and computes WCAG contrast for at
   least: `--attention-ink` on `--attention-bg`; the muted text token on
   `--day-nonworking`; the accent on `--sheet-head`; body text on `--day-nonworking`;
   both themes. Each must be at least 4.5:1 for text (3:1 for large text or non-text
   UI, if you mark it so). Record each pair and ratio.
6. **Unit stability.** Run `npm test` three times in a row; record each exit code and
   whether any native worker crash (for example 0xC0000005) appears.
7. **Screenshots and the fixed-bar note.** Synthetic screenshots of the built app with
   seeded synthetic data: Timesheet desktop 1280x800 and phone 390x844 (light and dark),
   day editor (desktop panel, phone sheet), batch mode, Review. Also take phone
   viewport (not full-page) captures at the top and after scrolling to the bottom:
   confirm whether the fixed top bar appears only once on screen (a full-page capture
   artifact) or overlaps content (a defect). Save at most ten `*-synthetic.png`.
8. **Tap targets and overflow.** Confirm through the e2e results (or a probe) that no
   control is below 44x44 px on the phone project and that no page scrolls horizontally
   at 390 px.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX-GATE`. Ports 47890-47909, with
  `SMOKE_PORT` in that range. Set TEMP and TMP to the task folder.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Docker: Compose project `ts-wp5-uxgate`, non-TTY flags only. At the end, remove the
  drill image by exact tag and the project by name; record
  `docker ps --all --filter name=ts-wp5-uxgate` (must be empty).
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
  NO `| python`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`.**
  Write scripts with the Write tool and run them by path; python only as the workflow
  Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
  (write `<user>` in the evidence); Node 24 by its full portable path, first shell call
  `node --version`.
- Stop only processes you spawned, through their own handle. Never kill by PID. Never
  redirect to /dev/null or nul. Never remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Synthetic data and local mail capture only. Never edit source, docs, the board or
  STATE.

## Output

Write your results into this file with the Edit tool. Put masked LF `.txt` evidence in
`handoff/delivery/evidence/WP5-UX-GATE/`, with wrapper and probe scripts saved as
`*.mjs.txt` or `*.py.txt`, and screenshots as `*-synthetic.png`. Record the drill image
ID (the pilot packet identity refresh uses it). Decide PASS, FAIL or NOT VERIFIED from
actual results; NAS items stay NOT VERIFIED. Leave nothing running.

Return at most 200 words, beginning with your self-reported model: the decision, the
digest of record (three forms), each gate item result with counts and exit codes, the
contrast ratios below 4.5 if any, the fixed-bar conclusion, the image ID, and the
evidence files.

## Results

### Verifier result (attempt 1) - decision: PASS (NAS items NOT VERIFIED)

Self-reported model: claude-sonnet-5-5. Freeze 831f760838950a59f0e5c880f0bbefda15fe0c61; HEAD = origin/main =
5beae2f668d15fc77a39b91a91e2c8bb6195d65a before and after (no non-handoff path changed since the freeze).
Node v24.21.0 portable (first call `node --version` on the portable PATH), Git Bash, workflow Python (codex runtime, user
`<user>`) for the three validators. Raw output `D:\.claude-tmp\timesheet\WP5-UX-GATE` (TEMP/TMP there); masked LF evidence in
`handoff/delivery/evidence/WP5-UX-GATE/`. DATA_DIR and DATABASE_PATH inside the task folder; SMOKE_PORT 47891; e2e servers use
OS-chosen loopback ports as in earlier gates. Nothing in `%LOCALAPPDATA%\timesheet-dev` written (only the portable Node read).

Digest of record `3d274c9e93c1acfb06ebea8de2df2396192548b881212d799a98e0304a3c7ea9`, 789 files (handoff/ excluded): equal in
three forms: clean `git archive 831f760` export hashed with `git hash-object --no-filters` (before and after all checks), the
`git ls-tree` form, and `npm run digest` in the repository (run last). Equals the expected value.

| # | Item | Result |
|---|---|---|
| 1 | `npm ci` exit 0 (lockfile identical); `npm run lint` exit 0; `npm run verify` exit 0 | verify: 82 files, 1817 tests passed, SMOKE PASSED; with `--trace-deprecation --pending-deprecation`: 0 deprecation lines in ci, lint, verify |
| 1 | `npm run test:e2e` exit 0 | 155 passed, 5 skipped (5.1 min). desktop 77 ok + 3 skipped, mobile 78 ok + 2 skipped (the skips are the mobile-only tests on desktop and pdf-visual on mobile) |
| 1 | AC-13 alone x3 | exit 0 x3; 1 test passed each; 3.73 s, 3.67 s, 3.65 s |
| 1 | AC-13 under real zones, wrapper `run-tz.mjs.txt` (TZ in the vitest child env) plus a probe test in the same run; machine zone America/Los_Angeles | Asia/Tokyo: probe `zone=Asia/Tokyo`, offset -540, 2 passed, exit 0. America/New_York: probe `zone=America/New_York`, offset 300, 2 passed, exit 0 |
| 1 | drill `--wp3` (`git archive 49651c8` + npm ci + build:server) | exit 0; stages 33/31/57/35/27/23 = 208 PASS, 0 FAIL; image `sha256:2c8d9db297e783d5a2ec7aa1c134d53ef14180adabc75b24beb09412afd24143` (110012921 B, linux/amd64); forbidden-file scan PASS |
| 1 | `docker compose config` live, restored, rollback (synthetic scratch project, no container) | exit 0 x3: live `ts-wp5-uxgate`, `timesheet:aaaaaaa`, `<task>/cfgproj/data`; restored `ts-wp5-uxgate-restored`, restore dir; rollback `ts-wp5-uxgate-rollback`, `timesheet:bbbbbbb`, restore dir, `JOB_RUNNER: "off"`. docs/11 section 4 step 3 and section 2 keep the protected env-file copy (mode 600) with release commit, source digest and image ID |
| 1 | env keys of docs/11 and 12 | all in `.env.example` or `config.ts` (JOB_RUNNER in `index.ts`); TIMESHEET_DATA_DIR/IMAGE/PORT in `compose.example.yaml`, NODE_IMAGE_DIGEST in `Dockerfile`; SQLITE_BUSY and WP5_HANDOFF are not env keys (same as WP5-REGATE) |
| 1 | `npm audit --omit=dev` exit 0 (0 vulnerabilities); validate_package --preflight 0, validate_orchestration 0, check_recovery 0 (106 probes, PASS); precommit self-test PASS (35 path, 74 line samples, 12 rules) | |
| 2 | Business boundary `git diff --stat 014bd47..831f760 -- src/server src/domain` | only `src/domain/format.ts`, 13 insertions, 0 deletions; the added lines are the doc comment and `formatHoursMinutes` (display only: sign, trunc, `h:mm`). No server change, no other domain change (`20-bound-diff.txt`) |
| 3 | PDF unchanged (AC-10) | `git diff --stat 014bd47..831f760 -- src/server/pdf tests/e2e/pdf-visual.spec.ts` is empty; pdf-visual: 2 passed on desktop in the e2e run (the mobile project skips it by design) |
| 4 | Scope since 014bd47 outside handoff/ (67 paths, `22-scope.txt`) | governance `.claude/agents/*` (8); docs 04, 08, 10, 12 EN+VI (8); client `src/client/**` incl. `styles.css` (30 paths incl. 4 deleted, 9 added); domain formatter `src/domain/format.ts` (1); tests: `tests/client/*` (8), `tests/domain/engine.test.ts` (adds the formatter-vs-PDF equality test only), `tests/e2e/*.spec.ts` (11). Nothing else: no `src/server`, no config, no package files |
| 5 | Contrast (`contrast.mjs.txt`, `40-contrast.txt`, tokens read from `styles.css` light `:root` and the dark media block) | 27 pairs per theme, all text pairs at least 4.5:1. Required pairs, light / dark: attention-ink on attention-bg 6.53 / 8.58; muted on day-nonworking 5.20 / 6.18; accent on sheet-head 5.23 / 6.00; text on day-nonworking 13.93 / 12.68. Lowest text pair: muted on sheet-head-off 4.65 (light), muted on sheet-head-off 5.25 (dark). No text pair below 4.5. Informational non-text extra (not required): `--sheet-rule-strong` on card 2.86 light / 2.97 dark, just under the 3:1 UI line (a decorative table rule; the day state is always paired with text or shape) |
| 6 | `npm test` x3 | exit 0 x3; each 82 files, 1817 tests passed; native worker crash (0xC0000005 or any worker crash/IPC error): 0 in all three logs |
| 7 | Screenshots, synthetic data, built app (scratch spec `ux-gate.spec.ts.txt`, run in the task-local export only) | 10 `*-synthetic.png`: timesheet desktop 1280x800 light and dark, phone 390x844 light, dark and bottom; day editor desktop panel and phone sheet; batch (phone); Review desktop and phone |
| 7 | Fixed top bar on the phone | Not fixed: `.shell-bar` is `position: sticky`, exactly 1 per page, no `position: fixed` element at the top. At scrollY=0 it spans 0-52 px and the first content starts at 68 px (no overlap). After scrolling to the bottom (scrollY 1700) it stays at 0-52 px as one bar on screen, the page content runs underneath it as expected for a sticky bar, and the last content ends at 763.5 px above the fixed tab bar (top 788 px, no overlap). Viewport captures show the bar once. Conclusion: the mid-image bar of the T02 full-page capture is a capture artifact of a sticky bar, not a defect; the fixed element is only the bottom tab bar (`.shell-tabs`) and it does not hide content |
| 8 | Tap targets and overflow | phone project: e2e `shell`, `day-editor` and `review` mobile tests (44x44 and no sideways scroll) all passed, and the timesheet test checks the sheet. Probe on the phone, 390 px: timesheet 41 controls, editor sheet 53, batch 46, Review 8, all 0 below 44x44; scrollWidth 390 = innerWidth 390 in all four states. (Desktop controls are 36-40 px by design; the 44 px rule applies to the phone.) |
| - | Digest last | see above |

Cleanup: drill image `ts-wp5-uxgate-timesheet:drill` removed by exact tag, project `ts-wp5-uxgate` down -v; final
`docker ps --all --filter name=ts-wp5-uxgate` empty; no image, volume or network of the project remains; no listener on
47890-47893 checked; the scratch spec was removed from the export before the last digest. Nothing committed, sent or edited
outside this brief and the evidence folder. One note: an `cat ... > /dev/null` slipped into one shell call (harmless, no
file affected). NAS target NOT VERIFIED (owner steps, docs/11 sections 13-16). Failing items: none.
