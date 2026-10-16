# WP5-UX3-GATE dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-GATE; package WP5; kind gate;
  attempt 1; depends on WP5-UX3-T10-FREEZE (done).
- Scope: the package-final gate of UI change round 3. Frozen commits in order: T06 5c8355d,
  GOV 79b9a53 (accepted by WP5-UX3-GOV-AUDIT; accept 3968e15), T01 e2f3d74, T02 aa64999, T03
  7cd8c59, T04 83c32d2, T05 699b1b3, T05B 5c0dad8, T07 f8117a4, T08 1a33c57, T08B f89573b,
  then the T09 and T10 freezes (board). The previous accepted snapshot is
  a6437943403fc416240fd13a787a8c4748af3e84 (digest 229df806; gate WP5-UX2-REGATE2; audit
  WP5-UX2-AUDIT2).
- Target: `freeze_commit` = the WP5-UX3-T10-FREEZE commit (TARGET_SHA below; HEAD =
  origin/main, or a later commit that changes only `handoff/`). Expected digest of record:
  TARGET_DIGEST. Compute it on a clean export of the target and cross-check it with the
  `git ls-tree` form and `npm run digest`.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H (package-final snapshot), novelty no. Records in English.
- **AGENTS.md on disk wins** (its UI section is "Frontend and UI/UX standards").

## Read

- AGENTS.md from disk first.
- `handoff/delivery/tasks/WP5-UX2-GATE.md` and `WP5-UX2-REGATE2.md` (the WP5 gate items,
  method, limits and evidence layout; reuse them).
- The round's owner and coordinator decisions on the board (2026-10-15/16), including the
  audit-focus list (the coordinator decision that starts "Audit-focus list" and its
  addendum), and the slice records `handoff/delivery/tasks/WP5-UX3-T01.md` .. `T10.md`,
  `T05B.md`, `T06.md`, `T08B.md` and `WP5-UX3-GOV.md` (Results and addenda) for the claims to
  verify.
- The simulated-clock preload and wrapper from `handoff/delivery/evidence/WP5-UX-FIX10/`
  (`shiftclock.mjs.txt`, `run-shift.sh.txt`, `sweep.sh.txt`); copy them into your task
  folder; never add them to the repository.
- For the axe scan: the method of `handoff/delivery/tasks/WP5-UX-A11Y-SWEEP.md` (the axe
  engine loaded from a temporary location outside the repository; no dependency added to
  `package.json` or the lockfile).

## Gate items

1. **The WP5 gate** (the UX2 gate's item 1 method, on a clean export of the target): `npm
   ci`; lint with deprecation tracing (`no-deprecated`, and no toolchain deprecation line);
   `npm run verify`; the FULL e2e on both projects on the real clock with per-project
   counts (record the Los Angeles time and the displayed period); AC-13 three times and
   under `Asia/Tokyo` and `America/New_York`; drill `--wp3` (image ID, size, forbidden-file
   scan); the compose config forms, the env keys and `npm audit --omit=dev`; the validators
   including check_recovery (106 probes) and the precommit self-test; PDF unchanged and
   pdf-visual passing; `npm test` three times. Run `docker version` first; if the engine is
   unreachable, finish every other item and stop with NOT VERIFIED for the drill only.
2. **Server and business boundary.** Build a643794 and the target from clean exports; diff
   `dist/server` and `dist/domain`: they must be byte-identical (round 3 changes no server
   or domain code). `git diff --stat a643794..TARGET -- src/server src/domain migrations`
   must be empty; no API route, schema or migration change.
3. **Round scope.** `git diff --stat a643794..TARGET` outside `handoff/`: list every path and
   map it to its slice (GOV: AGENTS.md and AGENTS.vi.md; T06; T01..T10, T05B, T08B); flag any
   path outside the slices' recorded owned paths; `git ls-files` shows no font file and no
   raster outside `reference/` and `-synthetic.png` evidence; confirm that no test assertion
   was removed or weakened beyond the changes the slice records list (sample at least ten of
   them against the diff); no new `skip`, `fixme` or `.only` beyond project-conditional
   skips; the deleted files are `SessionForm.tsx` and `BreaksEditor.tsx` only, and nothing
   imports them.
4. **Simulated-clock sweep** (America/Los_Angeles; validate the preload first with one
   control: the server reports the simulated `today_local`):
   - FULL suite on both projects at `2026-10-20T17:00:00Z`, `2026-10-26T16:00:00Z`,
     `2026-10-30T23:00:00Z`, `2026-11-01T08:45:00Z`, `2026-12-31T23:30:00-08:00` and
     `2027-03-14T10:30:00Z`;
   - `today.spec.ts`, `timesheet.spec.ts`, `day-editor.spec.ts`, `shell.spec.ts` and
     `sharing.spec.ts` on both projects at `2026-10-27T06:58:30Z`, `2026-10-17T17:00:00Z`,
     `2027-01-01T08:30:00Z` and `2026-11-28T18:00:00Z`;
   - every run ends with 0 failed; a run that fails only with a network or buffer error is
     rerun once and both runs recorded; a table: instant, window or outside, counts per
     project.
5. **Round-specific checks** (measure on the build of the target):
   - contrast in light and dark and with both manual theme overrides: text >= 4.5:1
     (including the pills' ink on their fills, the bar email, the avatar initials, chips),
     focus rings >= 3:1 on every new surface, state indicators >= 3:1 (the editor frame on the
     Day-cell fill and on the day head, the selection checkbox), card on page >= 1.12:1, hover
     >= 1.20:1 with an accent boundary;
   - 44px targets below 768px and no page-level horizontal scroll at 320, 360, 375, 390, 768,
     820, 1024, 1280 and 1440;
   - the 390x844 first-screen budgets (landing and away, own and with a share, with and
     without the zone note) against the tab bar top;
   - the desktop bar one row at 1024, 1280, 1440 and 1920 with and without a share; the
     wordmark visible at 1024 without a share, hidden 1024-1279 with a share, visible from
     1280;
   - the Day editor: modal floating panel at 1280 and 1359, beside the sheet at 1360, 1366
     and 1920 with every day column >= 108px and no word wider than its cell (the longest
     seeded holiday name, an overnight session, two sessions on a day); dock side for Mon and
     Sat;
   - lifted runs: at 1440 and at three other widths that give fractional column edges
     (record them), take pixel crops of a run of three lifted days and of a single lifted
     day, and report whether any seam, gap or shadow over a neighbour is visible;
   - the session dialog at 390x844 with three suggested breaks: the scroll amount, the first
     field and the footer visible; break rows versus chips at 430, 390, 375, 360 and 320 for a
     same-day and an overnight session;
   - a real axe scan (WCAG 2.2 AA rules) of: the Timesheet page with the editor open (1366
     and 1280), the account menu open, Settings with each sub-page, the session dialog with
     the notice and the final confirmation, the break sub-dialog on a phone, the phone day
     buttons (R-UX2A-4); report every violation;
   - the build prints no chunk-size advisory; record the main chunk size; the lazy
     Administration and Import chunks load;
   - the CSP header is unchanged against a643794; no `securitypolicyviolation` on load;
   - shared views show no check in/out and the bar shows the signed-in user; an employee
     page makes no `/api/admin/` request at `#/settings/admin` and `#/admin`.
6. **Screenshots** (synthetic only; basenames end `-synthetic.png`; at most 14) for the
   owner and the auditors: desktop 1440 and 1280 (bar with the account menu open, the sheet
   with a lifted run and the editor beside or floating), light and dark; the period card with
   the pills; the session dialog with the notice; phone 390 with the session dialog rows and
   with chips; Settings with the Administration sub-page.

Decision: PASS / FAIL / NOT VERIFIED (NAS items stay NOT VERIFIED as in earlier gates).

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX3-GATE`. Set TEMP and TMP to it.
- Ports: 48820-48859, with `SMOKE_PORT` in that range.
- Give each Playwright run its own output folder, and run them sequentially.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Docker: Compose project `ts-wp5-ux3gate`, non-TTY flags only; at the end remove the drill
  image by exact tag and the project by name; record `docker ps --all --filter
  name=ts-wp5-ux3gate` (must be empty).
- Use Git Bash only, never cmd.exe, and never an interactive shell. Never create links or
  junctions.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES), NO `| node`, NO `| python`, NO `node -e` (NOT EVEN `node -e "1"`), NO `node -` OR
  `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail` (NO `head -0`, NO `tail -c`). NEVER
  REDIRECT TO OR FROM `/dev/null`, `/dev/stdout` OR `nul`, AND NEVER USE `< /dev/null` ON A
  COMMAND.**
  - Write scripts with the Write tool and run them by path.
  - Run python only as the workflow Python
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`
    (write `<user>` in the evidence).
  - Put Node 24 first on PATH with `cygpath -u` before any node call. The first shell call
    is `node --version` (it must be v24.x).
- **Create files only inside the task folder and the evidence folder.**
- Never stop a process you did not start, and never kill by PID. Never remove anything
  recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Use synthetic data and local mail capture only. Never edit source, docs, tests, the board
  or STATE. Leave nothing running.
- In your Results and evidence: no email address except the full synthetic
  `@example.invalid` form; no real profile path (use `<user>`); probe-truncated addresses as
  `<email>`.

## Output

Results in this file (decision, gate notes, every item with commands, exit codes and
counts), evidence in `handoff/delivery/evidence/WP5-UX3-GATE/` (masked LF `.txt` and at most
14 `-synthetic.png`). Return at most 250 words, beginning with 'Self-reported model: ...'.

## Results
