# WP3-T13C dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T13C; package WP3; kind implement;
  attempt 1; depends on WP3-T13B-FREEZE. The client side of timesheet sharing, plus the
  history list from the new revision route.
- Profile/routing: timesheet-worker-high, requested sonnet/high, no override. Routing:
  size M, risk H (who sees and edits whose timesheets; disallowed actions must be
  absent), novelty no.
- Read AGENTS.md from disk first, including the whole UI standards section. Load the
  design skills `stitch-design-taste`, `design-taste-frontend` and
  `high-end-visual-design` with the Skill tool before any UI or CSS edit; AGENTS.md and
  the E-8 tokens win. Then read:
  - the canonical documents as updated in cb9800e (docs/04 "Shared timesheets", AC-16)
    and [WP3-REQ](WP3-REQ.md) section C ("UI", recommended defaults) as amended by
    [WP3-REQ2](WP3-REQ2.md) item 4 (T13C row: per-item switches, the PDF warning);
  - the WP3-T13B result (routes, item model, error codes, the revision-list route) and
    the WP3-T13 result (history, settings, carry items).
- Baseline: main at the WP3-T13B-FREEZE commit (the coordinator gives the SHA in the
  dispatch prompt). The working tree differs only in handoff/.
- Runtime: call the Node 24 portable binary by its full path. Use
  `D:\timesheet-tmp\WP3-T13C` for TEMP/TMP; delete only files you created; never remove
  folders recursively. If a shell call fails with ENOSPC, stop and report. Never write
  into the repository root. On Windows, never redirect to /dev/null or nul from a POSIX
  shell. Evidence scripts are stored as `*.mjs.txt` or `*.py.txt`. No user-profile path
  literals in source or tests.
- Synthetic data only; the e2e runs on the installed Edge channel. Do not commit.

## Required changes (binding)

1. **Settings → Sharing**: grant by exact account email; per-item switches (timesheets
   none/view/edit, OT read-only, final PDF download) with the form default "timesheets
   view on, OT off, PDF off" and the note "PDFs contain your signature image" beside the
   PDF switch; list given shares (items, since) with change and revoke (with
   confirmation); list received shares with "leave".
2. **Shared with me**: an AppShell switcher to open another person's timesheets; a
   persistent bar "Viewing <owner>'s timesheets — view only | can edit" listing the
   shared items; every view uses `/api/shared/:ownerId/...`; actions the share does not
   allow are absent (not merely disabled); deep links `#/shared/{ownerId}/...` require
   login; a revoked share on the next request shows a clear message and returns to the
   user's own view.
3. **Shared views**: timesheet view (and edit with an edit share, without Clock in/out),
   read-only OT summary/ledger with the OT item, the revision status list and final PDF
   download with the PDF item.
4. **History (T13 carry item)**: the owner's history lists every revision from
   `GET /api/revisions` (T13B) instead of reconstructing them from deliveries.
5. **Signature current (T13 carry item, optional)**: if `GET /api/signatures/current`
   still answers 404 without a signature, change it to a 200 with an empty value and
   adapt the client and its tests, so no console resource error appears; report it.
6. **UI standard:** token-only CSS (only `@media` conditions literal), the 4px radius
   token, the shared `--transition`, accessible labels and focus order, mobile-first at
   390×844 and 1280×800.

## Owned (writable) paths

- src/client/SettingsScreen.tsx, src/client/HistoryScreen.tsx, src/client/App.tsx,
  src/client/api.ts, src/client/styles.css, src/client/components/AppShell.tsx,
  src/client/components/Sharing*.tsx and src/client/components/sharingModel.ts (new),
  src/client/components/deliveryModel.ts, src/client/SharedTimesheetScreen.tsx (new),
  and the existing timesheet view components only where a shared mode is needed.
- src/server/routes/signatures.ts and tests/integration/signatures.test.ts (item 5 only).
- tests/client/sharingModel.test.ts (new), tests/client/deliveryModel.test.ts,
  tests/e2e/sharing.spec.ts (new).
- This report and handoff/delivery/evidence/WP3-T13C/.

List any other minimal edit as a deviation.

## Checks

- Red-first unit tests (sharing model: item combinations, defaults, allowed actions per
  item; history mapping from the revision list) and at least three mutation checks, each
  caught (compute the mutation before opening a file for writing; restore
  byte-identical).
- `tests/e2e/sharing.spec.ts` on both projects: grant view only → the grantee sees but
  cannot edit (no edit controls) → change to edit → the edit is attributed in the
  owner's history → OT and PDF items on/off → revoke takes effect on the next request →
  the admin sees no timesheet details; synthetic screenshots `sharing-*-synthetic.png`
  viewed and recorded. A literal scan of styles.css against the T13B baseline: zero new
  raw literals.
- Run `npm run test:e2e`, then `npm run verify` with
  `NODE_OPTIONS=--trace-deprecation --pending-deprecation` (exit 0, no deprecation line)
  and `npm run digest` as the **last** commands, after the final edit; rerun verify and
  digest if any file changes afterwards.
- Evidence masked, LF, free of trailing whitespace, single final newline. Mask every
  email address in evidence logs as `<email>` and run `node scripts/precommit-check.mjs`
  over your evidence on a temporary index (not the real index) before hand-back; it must
  report no finding.

Return at most 170 words, beginning with your self-reported model: the sharing settings,
the shared-with-me flow, absent actions, history from the revision list, the signature
carry item, e2e and screenshots, the literal scan, red/green and mutation counts, verify
exit and test count, digest, and deviations.

## Results

(Worker appends here.)

### Worker result (attempt 1, 2026-10-05)

- Self-reported model: claude-sonnet-5-5 (profile timesheet-worker-high; effort not observable).
- Baseline: main at `c3c35de41ee5c1afff0e602601bdb27bb0a19bc1`, source digest `f3df3b86...48ab`; the working tree differed
  only in handoff/. Node 24.21.0 portable by full path; TEMP/TMP `D:\timesheet-tmp\WP3-T13C`. Synthetic data only; not
  committed; no shared workflow state touched; no background process left running. Design skills loaded before any UI edit
  (reading: internal B2B instrument, existing E-8 tokens win; no new colour, font or radius).
- Evidence: `handoff/delivery/evidence/WP3-T13C/` (01 red unit, 02 red current-image route, 03 literal scan, 04 green, 05
  mutations, 06 e2e, 07 verify, 08 digest, `mutations.py.txt`, `mask.py.txt`, `literal-inventory.mjs.txt`, 18
  `sharing-*-synthetic.png`). Masked, LF, one final newline; every address is `<email>`.

#### What changed

1. **Settings, Sharing** (`SharingSettings.tsx`, `SharingGrantForm.tsx`, `SharingItemsFields.tsx`, `SharingRows.tsx`): grant by
   exact account email; per-item controls (timesheets none/view/edit radios, OT and PDF switches); form default "view on, OT
   off, PDF off"; the note "PDFs contain your signature image" beside the PDF switch and as its accessible description. Given
   shares list items and "since", with Change (items editor) and End share (inline confirmation); received shares list items,
   Open and Leave (inline confirmation). Refusals are worded (`grantFailureText`); an empty item set is refused before asking.
2. **Shared with me**: `SharingSwitcher` in `AppShell` (a labelled select, absent without shares); `#/shared/{ownerId}[/view]`
   deep links survive sign-in; `SharingBar` is the persistent bar "Viewing <owner>'s timesheets - view only | can edit" (a
   hyphen, no em dash), the item badges, the views the share holds and "Back to my timesheets" (sticky from 768px). The received
   list is re-read on every screen change. A refused shared request (404/403) makes the client re-read `GET /api/shares`:
   owner gone -> flash message "Access to <owner>'s timesheets has ended. You are back in your own timesheets." and the hash
   `#/timesheet`; a deep link without a share gives "That shared view is not available..."; a 403 `grant_scope` only refreshes.
3. **Shared views**: `SharedTimesheetScreen` mounts `TimesheetScreen` with a `shared` mode (every read/write through a
   `Requester` below `/api/shared/:ownerId`), `SharingOt` (balances and ledger, read only) and `SharingRevisions` (status
   list, PDF download only with the PDF item and a ready PDF). Absent, not disabled: Clock in/out and the owner's review
   link/status (always), batch bar, selection boxes, Edit/Add/Delete and the day-fields form (view only), the OT view without
   the OT item, the Download button without the PDF item. A view-only day opens read only (`DayEditor readOnly`). An address of
   a view the share does not hold is rewritten to the first view it does hold.
4. **History from the revision list**: `GET /api/revisions` supplies every revision (`buildRevisionRows(periods, deliveries,
   revisions)`); the current revision of a period is still enriched from its finalization (jobs, sign-off, reason), every
   other revision takes origin, review state, PDF state and the superseded flag from the list; delivery attempts attach by id
   and no longer create rows. Events performed under a share show "Changed by <grantee> (shared access)"; share operations
   have labels.
5. **Signature current (done)**: `GET /api/signatures/current` now answers 200 `{ "signature": null }` without a signature
   (`routes/signatures.ts`); `SubmissionSettings.tsx` reads the null (the 404 branch is gone), so no failed-resource line
   appears. The integration test and the e2e pin of the old 404 were changed accordingly.
6. **UI standard**: one new custom property (`--layer-sticky`), no new literal, the 4px `--radius`, the shared `--transition`
   (inherited from the existing button/link/select rules), 44px tap targets on mobile via the existing rules, labelled
   controls, focus moves to each confirmation panel.

#### Checks

- Red first (`01`, `02`): the new `sharingModel` test (module missing, file failed to load) and the changed `deliveryModel`
  test (5 failed, 23 passed) before any source edit; the changed signatures test failed 1 (34 passed) before the route edit.
- Green (`04`): `tests/client` plus signatures: 11 files, 239 tests passed. New unit tests: `sharingModel.test.ts` 23 tests (the
  11 valid item sets, defaults, allowed actions per item, deep links, bar text, failure classification, history attribution,
  revision rows); `deliveryModel.test.ts` +5 revision-list tests.
- Mutations (`05`): 11 of 11 caught, each restored byte-identical (SHA-256): S1 edit read as view, S2 PDF switch defaults on,
  S3 any 404 counts as ended, S4 PDF button without the item, S5 grantee attribution dropped, S6 PDF-only share without the
  list, D1 window start, D2 superseded flag, D3 rows only with a delivery attempt, G1 signature 404 again, E1 Clock in/out
  shown in a shared view (caught by the browser test).
- E2E (`06`): new `tests/e2e/sharing.spec.ts`, 4 tests on both projects: grant view-only (defaults, PDF note, unknown address,
  empty set) -> grantee sees but has no edit control, every request is `/api/shared/:ownerId` or `/api/shares`, server
  refuses edit/clock/OT/settings -> leaves; change to edit -> the grantee edits a day, the owner's History names the grantee;
  OT and PDF on (OT view, revision list, PDF download) -> off (links, button and server 403 gone) -> PDF only; revoke ->
  the grantee's next request shows the message and the own view; the administrator's deep link and API probes give nothing
  and the admin share list names no note. `npm run test:e2e`: exit 0, 119 passed, 3 skipped (baseline 111/3).
- Screenshots `sharing-*-synthetic.png` (settings, view-only, view-only-day, edit, edit-day, history, ot, revisions, revoked;
  desktop and mobile): viewed. Two fixes came from viewing: the read-only day dialog text said "typed in an input zone" (now
  neutral), and the revisions shot caught a nav transition mid-way (screenshots now use `animations: 'disabled'`).
- Literal scan (`03`): 0 declarations with literals, 0 new occurrences against the T13B baseline; added custom property
  `--layer-sticky`; no new `@media` condition.
- `NODE_OPTIONS='--trace-deprecation --pending-deprecation' npm run verify` (`07`): exit 0, 60 files / 1383 tests (baseline
  59 / 1356), 0 deprecation lines, SMOKE PASSED. `npm run digest` last (`08`):
  `9b8d6b26dd05436f3aca8546520087e4af095950efc6741cddb54fa2a187240a` (713 files, handoff/ excluded).
- `node scripts/precommit-check.mjs` on a temporary index (my evidence, src and tests added; the real index untouched): PASS,
  63 files, 0 findings (a first run blocked the file name `02-red-signatures.txt`; it was renamed `02-red-current-image.txt`).

#### Deviations and notes

1. Beyond the listed paths (all minimal, each needed): `DeliveryHistory.tsx` and `DeliveryRevision.tsx` (item 4 lives there;
   `downloadRevisionPdf` gained a `base` so the shared list reuses it), `SubmissionSettings.tsx` (item 5 client), and the
   shared-mode touches in `ReviewStatus.tsx`, `PeriodHeader.tsx`, `TimesheetGrid.tsx`, `DayList.tsx`, `DayEditor.tsx`,
   `SessionForm.tsx`, `DayFieldsForm.tsx` (all optional props with the old behaviour as default).
2. `tests/e2e/history-settings.spec.ts` (not owned): one line, the pin `GET /api/signatures/current` = 404 became "the value is
   null" (item 5).
3. The History still shows raw operation names such as `day_entry.update` for unknown operations (`otModel.ts` is not owned);
   only the share operations got labels.
4. A change of items replaces the share row (T13B), so the screen and the test read the share id again after a change.
5. Scratch files I created remain under `D:\timesheet-tmp\WP3-T13C` (no recursive removal); two unnamed temp folders there were
   created by the tooling, not by me.
