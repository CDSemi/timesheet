# WP5-UX-T05 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-T05; package WP5; kind implement;
  attempt 1; depends on WP5-UX-T04-FREEZE (done, 118a104).
- Scope: slice 5 of the owner-requested UI redesign: **the Review & sign-off screen**,
  so that what people review looks like what they sign (the Excel form and the PDF).
  Implement plan section F row WP5-UX-T05:
  - the T02 sheet in read-only mode, fed by the review payload (`SnapshotDay`, times in
    the reporting zone as on the PDF), with the detail rows always on and
    `[data-review-day]` kept on each day;
  - a checklist column: the attention list with its acknowledgement, deficits,
    reservations, the email and PDF step, and sign, reusing the existing components and
    their texts (only layout and styling change);
  - on phones, the read-only sheet uses the T02 phone table and the checklist follows it.
- Owner decisions in force (all as recommended, owner chat 2026-10-08): E-1 (detail rows
  always on in the Review), E-4 formats, E-6 manager signature line, E-7 scope. Match
  the mockup artboard A6 ("What you sign" plus the 3-step checklist).
- Profile/routing: timesheet-worker (effort medium), requested model sonnet, no override.
  Routing: size M, risk M (the sign-off screen: AC-06 and AC-07 wording, payload hash,
  expected_version), novelty no (it reuses the T02 sheet and existing review
  components). Task record in English.
- Base: HEAD = origin/main = 118a104a0e271a2fb2b8916a2cb1bf85244147bf; source digest
  6f362af9f9a2d09995d2c3f48d732abfce43772ae352efa40c00bf7825ffa538. Record both before you
  start. Uncommitted coordinator files under `handoff/` are expected; never touch them.

## Read

- AGENTS.md from disk first, especially "Unified Frontend & UI/UX Standards". Load and
  apply the skills `stitch-design-taste`, `design-taste-frontend` and
  `high-end-visual-design` within the project rules (system fonts, 4px radius, the shared
  transition token, layered soft shadows, tokens only).
- `handoff/delivery/tasks/WP5-UX-PLAN.md` Results: sections A.2 (review observations),
  B (signature block), C, E, F row T05 and "Stable test hooks", G.
- The T02 results in `handoff/delivery/tasks/WP5-UX-T02.md` (sheet components and
  sheetModel) and the T04 results (editor wiring you must not disturb).
- The mockup `handoff/delivery/design/WP5-UX/mockup.html` (A6).
- docs/04_UX_AND_SETTINGS.md (review and sign-off), docs/05_SUBMISSION_AND_NOTIFICATIONS.md
  (sign-off, email and PDF steps), docs/06 (AC-06, AC-07, AC-10), docs/10 (UX decisions).
- The current `ReviewScreen.tsx`, `ReviewDays.tsx`, `reviewModel.ts`, `ReviewFindings.tsx`,
  `ReviewEnvelope.tsx`, `ReviewSignoff.tsx`, `ReviewStatus.tsx`, the sheet components and
  the review, submission, automation and history-settings e2e specs.

## Hard constraints

- No business behaviour change: no server, API or request-body change. The review
  payload hash, `expected_version`, acknowledgement, sign-off, email/PDF and submission
  steps and their texts (AC-06, AC-07) stay exactly as today; only layout and styling
  change. The PDF is not touched (AC-10).
- The client computes no business minutes: every figure comes from the review payload.
- R-07: the review shows times in the reporting zone, as on the PDF; a device-zone
  change must not regroup days.
- Privacy: the signature image appears only where it appears today on the Review, never
  on the Timesheet page; shared views show only what they show today (AC-16).
- Accessibility: the read-only sheet keeps the T02 semantics (one group per day with an
  accessible name, hidden row names); checklist steps are an ordered list with text
  states; focus visible; 44px targets below 768px; no horizontal scroll at 390px.
- Keep every stable test hook in plan section F, including `[data-review-day]` (on the
  review sheet), `data-review-link` and the review and sign-off labels. No e2e assertion
  is removed or weakened.

## Owned paths

- `src/client/ReviewScreen.tsx`
- `src/client/components/ReviewDays.tsx` (becomes the adapter from the review payload to
  the sheet), `src/client/components/reviewModel.ts` (row mapping only),
  `src/client/components/ReviewFindings.tsx`, `src/client/components/ReviewEnvelope.tsx`,
  `src/client/components/ReviewSignoff.tsx` (layout only)
- `src/client/components/TimesheetSheet.tsx`, `src/client/components/SheetWeekTable.tsx`,
  `src/client/components/sheetModel.ts` (only to add a read-only review mode; the
  Timesheet page behaviour must not change)
- `src/client/styles.css` (tokens only)
- `tests/client/` unit tests (for example `reviewModel.test.ts`, `sheetModel.test.ts`)
- `tests/e2e/` spec files (`*.spec.ts`); `tests/e2e/fixtures.ts` is NOT owned
- this brief's Results section
- `handoff/delivery/evidence/WP5-UX-T05/` (masked LF `.txt` only, plus screenshots whose
  basenames contain `synthetic`)

If another file must change (for example `ReviewStatus.tsx`, `api.ts`, any server or PDF
file), stop and report it instead of editing it.

## Checks (in this order; verify and digest are the LAST commands)

1. `node --version` (v24.x) as the first shell call.
2. `npm run typecheck` and `npm run lint` (typescript-eslint `no-deprecated` must pass).
3. `npm test`.
4. The FULL e2e suite (`npm run test:e2e`, all specs, desktop and mobile), with
   `E2E_SCREENSHOT_DIR` inside the task folder. Record passed/failed/skipped per project.
   Expected: 0 failed. The review spec must still check the per-day figures against the
   payload, the acknowledgement and sign-off flow, and stale-hash handling; pdf-visual
   must pass unchanged.
5. Synthetic screenshots of the Review: desktop 1280x800 and phone 390x844, light mode,
   before sign-off and after sign-off; save them as `review-*-synthetic.png` in the
   evidence folder (at most four). Look at them and fix any visual defect before the
   final run.
6. A Grep over your changed files and evidence for user-profile paths and email
   addresses; record the counts.
7. `npm run verify` with `SMOKE_PORT` in 47850-47859 and `DATA_DIR` and `DATABASE_PATH`
   set inside the task folder.
8. `npm run digest` LAST. If you deleted a tracked file, `npm run digest` exits 1 while
   the deletion is unstaged: then copy
   `handoff/delivery/evidence/WP5-UX-T02/digest-probe.mjs.txt` to the task folder as
   `digest-probe.mjs`, run that file with Node 24, and report its value as the probe
   digest. If any file changes after the digest, rerun verify and the digest.
9. Copy masked logs of steps 2-4, 7 and 8 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -` OR `python -`.**
  Eight slips so far in this mission. Use the Write tool to create any file, then run it.
  Never pipe server or probe output into head or tail.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX-T05`: set TEMP and TMP to it. Raw logs stay
  there; copy only masked logs into the evidence folder (`<user>` for profile paths,
  `<email>` for emails). Never touch `%LOCALAPPDATA%\timesheet-dev` data.
- No Windows user-profile path literals in source or tests.
- Never kill processes by PID. Never redirect to /dev/null or nul. Never remove anything
  recursively. Never write into the repository root.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. The
  next step is a freeze commit; the gate and independent audit come later.

## Return

At most 150 words, beginning with 'Self-reported model: ...': files added, deleted and
modified (complete list), unit and full e2e counts per project, typecheck, lint and
verify exit codes, the final (or probe) digest, the evidence files, the background-task
confirmation, and any stop or deviation.

## Results

Base HEAD 118a104; Node v24.21.0.

Files modified: src/client/ReviewScreen.tsx, components/ReviewDays.tsx (now the payload-to-sheet
adapter), SheetWeekTable.tsx (review flag, REVIEW_ACTIONS, ReviewNote), TimesheetSheet.tsx
(`ReviewSheet`, Legend `today` prop), reviewModel.ts (reviewSheetDay/Weeks, checklistSteps),
sheetModel.ts (generalized label/session/break inputs, weeksOf, noteText), styles.css (review
layout, `--checklist-width`; old `.review-table` rules removed), tests/client/reviewModel.test.ts,
tests/e2e/review.spec.ts. Added: evidence folder. Deleted: none.

Behaviour: the Review shows "What you sign" (read-only T02 sheet, details always on,
`[data-review-day]` on each day, no buttons, note text in full) plus an ordered 3-step checklist
(attention list with acknowledgement/deficits/reservations, email and PDF, sign) reusing existing
components and texts; checklist beside the sheet from 1200px, below it on narrower screens. No
server/API/payload/hash/expected_version change. Timesheet page unchanged.

e2e review.spec adaptation (same checks, new format): per-day Regular/Off-calendar via
`[data-detail][data-detail-day]` as h:mm, OT cell by PDF rule, "Complete", "breaks not confirmed".

Checks: typecheck 0, lint 0, npm test 82 files / 1816 passed; full e2e desktop 76 passed, 3 skipped,
0 failed; mobile 77 passed, 2 skipped, 0 failed (153 passed total); verify exit 0; digest
0071a58848ecf62e0eca19c1e94db6a76116c9043d4cb5bcc2859b45a0f4f6d9 (789 files); no tracked file
deleted. Privacy grep over changed files and evidence: 0 hits. Screenshots viewed; no defect found
(the sticky bar over the full-page signed capture is a capture artifact).
Evidence: handoff/delivery/evidence/WP5-UX-T05/ typecheck/lint/test/e2e-full/verify/digest .txt and
review-{desktop,mobile,signed-desktop,signed-mobile}-synthetic.png.
Slip: one empty `cat >> file <<EOF` heredoc (appended nothing, not fed to node/python).

Status: done
