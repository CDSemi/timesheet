# WP3-T13B dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T13B; package WP3; kind implement;
  attempt 1; depends on WP3-T13-FREEZE. The server side of the timesheet-sharing feature
  (owner decisions F-3, F-Q4 (b) with per-item toggles, F-Q5 (a)).
- Profile/routing: timesheet-worker-high with model override opus, reason `size_risk`
  (a new authorization surface across every personal route). Routing: size L, risk H,
  novelty yes.
- Read AGENTS.md from disk first (rule 4: ownership on all data/file actions). Then read:
  - the canonical documents as updated in commit cb9800e: FR-17 (docs/01), the
    `timesheet_shares` record and the admin boundary (docs/03), the "Shared timesheets"
    settings row (docs/04), AC-01 and AC-16 (docs/06), docs/10 (owner decisions
    2026-10-04);
  - [WP3-REQ](WP3-REQ.md) section C (specification, access resolution, matrix, revocation,
    audit attribution) as amended by [WP3-REQ2](WP3-REQ2.md) item 4 (per-item grant model,
    changed matrix rows, T13B scope) — binding;
  - the results of WP3-T13A (actor/subject seam, router factories, optional actor), T13D
    (admin status) and T13 (PDF download route);
  - `src/server/http/auth.ts`, `routes/api.ts`, `routes/ot.ts`, `routes/submission.ts`,
    `services/history.ts`, `services/users.ts`, `routes/admin.ts`,
    `tests/integration/isolation.test.ts` and `history.test.ts`.
- Baseline: main at the WP3-T13-FREEZE commit (the coordinator gives the SHA in the
  dispatch prompt). The working tree differs only in handoff/.
- Runtime: call the Node 24 portable binary by its full path. Use
  `D:\timesheet-tmp\WP3-T13B` for TEMP/TMP; delete only files you created; never remove
  folders recursively. If a shell call fails with ENOSPC, stop and report. Never write
  into the repository root. On Windows, never redirect to /dev/null or nul from a POSIX
  shell. Evidence scripts are stored as `*.mjs.txt` or `*.py.txt`. No user-profile path
  literals in source or tests.
- Synthetic data only. Do not commit.

## Required changes (binding; details in WP3-REQ C and WP3-REQ2 item 4)

1. **Migration 0006** (`0006_timesheet_shares.ts`): `timesheet_shares` with owner,
   grantee, `timesheets_scope` none|view|edit, `ot_read` 0/1, `pdf_download` 0/1, created
   by/at, revoked by/at, optional reason; CHECK owner ≠ grantee; CHECK at least one item;
   one active share per pair (partial UNIQUE); no DELETE; identity and item fields
   immutable; revocation set once; a change of items = revoke + insert in one transaction.
2. **Shares service and routes** (`services/shares.ts`, `routes/shares.ts`): the owner
   lists given shares, grants by exact account email (unknown or inactive → 422
   `grantee_not_found`, generic, rate-limited), changes items, revokes; the grantee lists
   received shares and can leave; re-sharing is never possible; audit `share.grant`,
   `share.change`, `share.revoke` with actor and owner, no personal content.
3. **Access resolution** (`http/auth.ts`, `app.ts`): an allowlisted mount
   `/api/shared/:ownerId/...` built from the T13A router factories for exactly the
   matrix rows that a share item allows (timesheet reads; timesheet writes with edit
   except Clock in/out; OT summary/ledger and pending lines read-only with `ot_read`;
   revision status list; final PDF download with `pdf_download`, each download audited
   `share.pdf_download` with owner = owner). The grant is resolved live from the DB on
   every request, both accounts must be active; no grant, revoked, inactive or wrong
   owner → 404; a write without edit → 403 `grant_scope`; writes re-check the grant
   inside the same IMMEDIATE transaction; object IDs must belong to the subject. The
   existing `/api/...` routes stay self-only and unchanged. Everything else (signatures,
   review payload, sign-off, corrections, late review, resend, delivery decisions and
   attempts, submission settings, auto-image, evidence export, history, leave requests,
   finalization detail) is never mounted under `/api/shared`.
4. **History attribution** (`services/history.ts`): events performed under a share show
   the grantee's display name in the owner's history; other events stay as today;
   `history.test.ts:65-72` changes deliberately.
5. **Admin** (`routes/admin.ts`): list shares (owner and grantee names, items, instants)
   and revoke; never create or use a share.
6. **Revision list (T13 carry item):** add an owner-only, write-free
   `GET /api/revisions` (status metadata only: id, payroll date, revision number, origin
   as recorded, review state, supersedes link, PDF state, latest delivery state; no
   payload, envelope or signature) through the `submission.ts` factory, so the history
   can list every revision; mount it under `/api/shared` for shares with
   `timesheets_scope` ≠ none or `pdf_download` (matrix row "Revision list/status
   metadata"). Tests: owner list, foreign 404/empty, anonymous 401, writes nothing.

## Owned (writable) paths

- src/server/db/migrations/0006_timesheet_shares.ts (new), src/server/db/migrations.ts.
- src/server/services/shares.ts and src/server/routes/shares.ts (new).
- src/server/app.ts, src/server/http/auth.ts, src/server/services/history.ts,
  src/server/services/users.ts, src/server/routes/admin.ts, src/server/routes/api.ts,
  src/server/routes/ot.ts and src/server/routes/submission.ts (mount/allowlist wiring
  only).
- tests/integration/sharing.test.ts and tests/integration/sharing-matrix.test.ts (new),
  tests/integration/history.test.ts, tests/integration/isolation.test.ts and
  tests/integration/migrations.test.ts.
- This report and handoff/delivery/evidence/WP3-T13B/.

List any other minimal edit as a deviation (for example an ot-api route-inventory line).

## Checks

- A route-inventory matrix test: it enumerates every registered route under
  `/api/shared` and fails if a route appears without a matrix entry; for each of the 11
  valid item sets it asserts allowed and refused routes for the grantee, a non-grantee
  (404), anonymous (401) and the admin without a share (404).
- Red-first tests for: grant/change/revoke/leave and their audit; no re-share; revocation
  and deactivation effective on the next request; the write re-check inside the
  transaction (revocation race); object ownership (a session ID of another owner 404);
  Clock in/out refused for an edit grantee; PDF download audited; history attribution;
  admin list/revoke but not create; the 0006 upgrade from a v5 database with rows,
  triggers and unique keys; self-only `/api/...` routes unchanged (the T13A route
  inventory still identical for them). At least five mutation checks, each caught
  (compute the mutation before opening a file for writing; restore byte-identical).
- Run `npm run test:e2e` once (no UI change; all pass), then `npm run verify` with
  `NODE_OPTIONS=--trace-deprecation --pending-deprecation` (exit 0, no deprecation line)
  and `npm run digest` as the **last** commands, after the final edit; rerun verify and
  digest if any file changes afterwards.
- Evidence masked, LF, free of trailing whitespace, single final newline.

Return at most 180 words, beginning with your self-reported model: the schema, the
service and routes, the shared mount and its allowlist, the matrix test result,
revocation and race results, history and admin changes, red/green and mutation counts,
verify and e2e exits, test count, digest, and deviations.

## Results

(Worker appends here.)
