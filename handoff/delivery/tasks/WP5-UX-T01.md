# WP5-UX-T01 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-T01; package WP5; kind implement;
  attempt 1; depends on WP5-UX-PLAN (done) and the owner's answers E-1..E-7 (all as
  recommended, owner chat 2026-10-08, recorded in the board `owner_decisions`).
- Scope: the first slice of the owner-requested UI redesign: **design tokens and the app
  shell**. New CSS custom properties and button variants in `styles.css`; desktop top
  navigation and the mobile bottom tab bar with "More"; nav item "OT" renamed
  "Overtime"; Import reached from Settings ("Import from Excel" section link) and from
  More, while the `#/import` route keeps working. No other screen is redesigned in this
  task.
- Profile/routing: timesheet-worker (effort medium), requested model sonnet, no override.
  Routing: size M, risk M (the shell is on every page), novelty no (the plan and the
  mockup give the exact tokens and layout). Task record in English.
- Base: HEAD = origin/main = 5faa0b6f046568dae300331790a9dd168685427b; source digest
  150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61. Record both before you
  start. Uncommitted coordinator files under `handoff/` (board, checkpoints, WP5-UX-CKPT
  results/evidence, this brief) are expected; never touch them.

## Read

- AGENTS.md from disk first, especially "Unified Frontend & UI/UX Standards". Load and
  apply the skills `stitch-design-taste`, `design-taste-frontend` and
  `high-end-visual-design`, within the project rules (system fonts only because of the
  CSP, `--radius: 4px`, the shared 300ms ease-out `--transition`, layered soft shadows).
- `handoff/delivery/tasks/WP5-UX-PLAN.md` Results: section C (design direction: the
  "Information architecture and navigation" and "Visual system" lists are your spec),
  section D, section E (answers: all recommended), section F row WP5-UX-T01 and the
  "Stable test hooks" paragraph, section G.
- The mockup `handoff/delivery/design/WP5-UX/mockup.html` (artboards A1 shell, A2 phone
  tab bar, A7 tokens and button states). Reuse its CSS values; do not copy its synthetic
  data or Vietnamese captions into the app.
- docs/04_UX_AND_SETTINGS.md (screens, wording rules, touch targets), and the current
  `src/client/styles.css`, `src/client/components/AppShell.tsx`, `src/client/App.tsx`,
  `src/client/SettingsScreen.tsx`.

## Required work

1. Tokens: add the new custom properties from plan section C "Visual system" (light and
   dark) to `styles.css`. Existing tokens keep their names and values. No hard-coded
   colour, radius, shadow or duration outside the token block (the WP2-B-02 rule).
2. Buttons: primary, secondary and quiet variants, all with `var(--transition)`, the
   press offset on `:active` and `--focus-ring` on `:focus-visible`; reduced-motion rules
   kept.
3. Shell: desktop top bar (brand, Timesheet, Overtime, History, Settings, plus Admin for
   administrators only, user and Sign out); below 768px a compact top bar and a bottom
   tab bar Timesheet, Overtime, History, More (Settings, Import, Admin for
   administrators, Sign out), each tab at least 56x44px; current route marked with
   `aria-current="page"` and not by colour alone.
4. Import: a section link "Import from Excel" in Settings; the route and the Import
   screen itself are unchanged.
5. Shared view (`SharedTimesheetScreen`) and the setup screen must keep working; owner-only
   controls stay absent for grantees (AC-16).
6. Update the e2e specs the plan names for this slice (shell, admin nav lists, import nav,
   ot-leave nav) to the new names. Do not weaken any assertion: a changed label is
   replaced by the new label, never removed. Keep every stable test hook listed in plan
   section F.
7. No business behaviour change: no server, domain, API or request-body change, and the
   client computes no business minutes.

## Owned paths

- `src/client/styles.css`
- `src/client/components/AppShell.tsx`
- `src/client/App.tsx`
- `src/client/SettingsScreen.tsx` (the Import section link only)
- `tests/e2e/shell.spec.ts`, `tests/e2e/admin.spec.ts`, `tests/e2e/import.spec.ts`,
  `tests/e2e/ot-leave.spec.ts`
- this brief's Results section
- `handoff/delivery/evidence/WP5-UX-T01/` (masked LF `.txt` only, plus optional
  screenshots whose basenames contain `synthetic`)

If you find that another file must change, stop and report it instead of editing it.

## Checks (in this order; verify and digest are the LAST commands)

1. `node --version` (v24.x) as the first shell call.
2. `npm run typecheck` and `npm run lint` (typescript-eslint `no-deprecated` must pass;
   a deprecation warning is a defect to fix, not to suppress).
3. `npm test`.
4. `npm run test:e2e -- tests/e2e/shell.spec.ts tests/e2e/admin.spec.ts
   tests/e2e/import.spec.ts tests/e2e/ot-leave.spec.ts tests/e2e/sharing.spec.ts`
   (both projects, desktop and mobile). Record passed/failed/skipped counts per project.
5. Optional: synthetic screenshots of the new shell at 1280x800 and 390x844, light and
   dark, saved as `shell-*-synthetic.png` in the evidence folder.
6. `node scripts/precommit-check.mjs` over your changes and evidence.
7. `npm run verify` with `SMOKE_PORT` in 47810-47819 and `DATA_DIR` and `DATABASE_PATH`
   set inside the task folder.
8. `npm run digest` LAST. If any file changes after it, rerun verify and the digest.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN. NEVER USE A HEREDOC.** Earlier
  agents left looping background tasks this way. Write any probe to a file in the task
  folder and run that file. Never pipe server or probe output into head or tail.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX-T01`: set TEMP and TMP to it (e2e output
  and temporary databases go there). Raw logs stay there; copy only masked logs into the
  evidence folder (`<user>` for profile paths, `<email>` for emails). Never touch
  `%LOCALAPPDATA%\timesheet-dev` data.
- No Windows user-profile path literals in source or tests (the precommit blocks them).
- Never kill processes by PID. Never redirect to /dev/null or nul. Never remove anything
  recursively. Never write into the repository root.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write the Results section with the Edit tool. Do not commit or push; do not install or
  change dependencies.

## Return

At most 150 words, beginning with 'Self-reported model: ...': files changed, e2e counts
per project, verify/lint/precommit exit codes, the final digest, and any stop or
deviation.

## Addendum 1 (coordinator, 2026-10-08): extended owned paths

The first hand-back reported mobile-only e2e failures because Sign out and Settings now
sit under More on a phone. Add these owned paths, for test updates only:
- `tests/e2e/sharing.spec.ts` (sign-out helper, Settings link: open More first on
  mobile);
- `tests/e2e/isolation.spec.ts` (2 tests);
- `tests/e2e/setup.spec.ts` (1 test);
- `tests/e2e/review.spec.ts` (the tap-target loop).

Rules for these edits:
- Prefer one shared helper (for example in an already-owned spec or a helper inside
  each spec) that opens More only when the viewport is mobile. Do not touch
  `tests/e2e/fixtures.ts` or any other unlisted file; if you need it, stop and report.
- No assertion is removed or weakened. For the review tap-target loop, a
  `visible: true` filter is acceptable only if the loop still checks every visible
  control and asserts that the number of checked controls is greater than zero; say in
  Results which hidden controls are now excluded and why they are not tap targets.
- Then run the FULL e2e suite (`npm run test:e2e`, all specs, desktop and mobile), not
  only the touched specs, because the navigation change reaches every page. Record
  passed/failed/skipped per project. Any failure that needs another unlisted file:
  stop and report.
- The precommit check reads only staged files and you may not stage: instead record
  your Grep results for profile paths and emails over changed files and evidence (as
  you did). The freeze committer runs the precommit on the staged set.
- Finish with `npm run verify` and `npm run digest` as the LAST commands.

## Addendum 2 (coordinator, 2026-10-08): one more owned path

- Add `tests/e2e/timesheet.spec.ts`, ONLY for the tap-target loop at about line 93 (hidden
  desktop nav links have no bounding box on mobile). Apply the same rule as the review
  loop: filter visible controls, keep checking every visible control, and assert the
  checked count stays above the same lower bound as before (or above 0 if there was
  none). Change nothing else in that file (T02 owns it next).
- Then run the FULL e2e suite again (all specs, desktop and mobile) after the final
  edit, and record passed/failed/skipped per project. Expected: 0 failed in both.
- Before returning, confirm that none of your background tasks or shells is still
  running (the stray empty heredoc reported in the second hand-back must not have left a
  task waiting on stdin). If one is, report its task ID; do not kill by PID.
- `npm run verify` then `npm run digest` LAST.

## Results

Self-reported model: claude-sonnet-5-5. Base HEAD 5faa0b6f046568dae300331790a9dd168685427b, start digest
150420e7... (as briefed).

Files changed (owned paths only): `src/client/styles.css` (new tokens light+dark, button
primary/secondary/quiet, shell: sticky top bar, mobile-first tab bar and More panel),
`src/client/components/AppShell.tsx` (desktop nav Timesheet/Overtime/History/Settings/Admin,
phone tab bar Timesheet/Overtime/History/More; More = Settings, Import, Admin, Sign out;
Escape, outside tap and route change close it; Import marked under Settings on desktop),
`src/client/SettingsScreen.tsx` ("Import from Excel" section link), `tests/e2e/shell.spec.ts`,
`admin.spec.ts`, `import.spec.ts`, `ot-leave.spec.ts`. `App.tsx` needed no change. No server,
domain, API or request-body change.

Checks: typecheck exit 0; lint exit 0; `npm test` exit 0.
e2e (shell, admin, import, ot-leave, sharing): desktop 22 passed / 0 failed / 1 skipped;
mobile 20 passed / 3 failed / 0 skipped. The 3 mobile failures are in `sharing.spec.ts`
(not owned): its `switchUser` clicks "Sign out" and line 270 clicks the "Settings" link
directly, but on a phone both now sit under More.

BLOCKER / required follow-up (other files must change, not edited by this task): non-owned
specs that assume the desktop bar on the phone project (checked mobile only):
`sharing.spec.ts` (switchUser Sign out; Settings link at 270), `isolation.spec.ts`
(lines 142 Admin click and 190 Settings visible via nav Main), `setup.spec.ts` (160/163
banner Sign out), `review.spec.ts` (~line 489 tap-target loop needs `.filter({ visible: true })`
like shell.spec). Each needs "open More first on a phone" (or the visible filter); no
assertion needs weakening. Other checked mobile specs (admin-status, history-settings,
automation) pass.

Addendum 1 work: opened More first on a phone in `sharing.spec.ts` (sign-out helper, Settings
link), `isolation.spec.ts` (Admin click, Settings visible; helper waits for the nav), and
`setup.spec.ts` (Sign out via More); `review.spec.ts` tap-target loop now filters
`visible: true` (still asserts count > 5 and checks every visible control; excluded: the
desktop nav links and desktop Sign out, which are display:none below 768px and not tap
targets). Full e2e suite (`npm run test:e2e`): desktop 72 passed / 0 failed / 3 skipped;
mobile 70 passed / 3 failed / 2 skipped; 2 isolation failures fixed afterwards (isolation rerun
6 passed). REMAINING STOP: `tests/e2e/timesheet.spec.ts:93` (mobile tap-target loop, count > 20)
fails on the hidden desktop nav links (boundingBox null); it is not an owned path and needs the
same `.filter({ visible: true })`. Grep for profile paths/emails over changed files and
evidence: no hits. A stray empty heredoc was run once by mistake (no effect, empty file).

Addendum 2: `tests/e2e/timesheet.spec.ts` tap-target loop now filters `visible: true` (same
count > 20 bound, every visible control still checked; excluded: hidden desktop nav). Final
full e2e suite after the last edit, exit 0: desktop 72 passed / 0 failed / 3 skipped; mobile
73 passed / 0 failed / 2 skipped. No background task or shell of mine is running (all
background commands completed; the stray empty heredoc ended immediately). Closing
verify/digest below are from the final run.

FINAL: lint 0, verify 0, digest 0: b5cdb2d469506b978847eadf41815b8b9fe72c0e585602b99f81d350cc96a41b (779 files).

Closing run after Addendum 1 edits (superseded): typecheck 0, lint 0 (before the last isolation edit; verify
re-runs lint), `npm run verify` exit 0, `npm run digest` exit 0:
38d5ed8d65748b9aba5e386963d976433f93e16f33400bf833a717d2db619a95 (779 files).

Earlier run: `npm run verify` exit 0 (SMOKE PASSED, SMOKE_PORT 47811); `npm run digest` exit 0:
6989da268086be9a495a3803986836f22348353dee3cdf8869226d1e01b79634 (779 files).

Notes: precommit-check inspects only staged files and nothing is staged (no git add by
workers), so it was PASS with 0 files; a manual grep of changed files for profile paths and
emails found none. Optional screenshots skipped; the shell spec writes
`shell-more-mobile-synthetic.png` through `screenshotPath`. Evidence:
`handoff/delivery/evidence/WP5-UX-T01/*.txt`.
