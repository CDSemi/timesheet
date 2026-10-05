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
