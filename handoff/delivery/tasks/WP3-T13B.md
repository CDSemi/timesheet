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

### Worker result (attempt 1, 2026-10-05)

- Self-reported model: claude-opus-5-5 (profile timesheet-worker-high, override opus; effort not observable).
- Baseline: main at `5b90d30d7e4b5410770b01d04bd9ff8ee2663149` (digest `7b04f0b1...f7301`); working tree differed only in
  handoff/. Node 24.21.0 portable by full path; TEMP/TMP `D:\timesheet-tmp\WP3-T13B`. Synthetic data only; not committed;
  no shared workflow state touched; no background process left running.
- Evidence (`handoff/delivery/evidence/WP3-T13B/`, masked, LF): 01 baseline suite, 02 red, 03 green, 04 mutations,
  05 route inventory before/after/compare, 06 e2e, 07 verify, 08 digest, `mutations.py.txt`, `mask.py.txt`. The route
  probe is the unchanged WP3-T13A `route-inventory.mjs.txt`.

#### What changed

1. **Migration 0006** (`db/migrations/0006_timesheet_shares.ts`, registered in `migrations.ts`): STRICT
   `timesheet_shares` (owner, grantee, `timesheets_scope` none|view|edit, `ot_read`, `pdf_download`, created by/at, revoked
   by/at, optional `revoke_reason` 1-500). CHECKs: owner <> grantee, `created_by = owner` (an administrator can never
   create one), at least one item, revocation pair, reason only when revoked, `revoked_at >= created_at`, UTC format.
   Partial UNIQUE `timesheet_shares_one_active (owner, grantee) WHERE revoked_at IS NULL`; index on the grantee; triggers
   `timesheet_shares_fixed` (identity, items and creation fixed; revocation set once) and `timesheet_shares_no_delete`
   (`immutable_timesheet_share`, mapped to 409). 0001-0005 untouched (checksums pinned, 0005 newly pinned).
2. **Shares service** (`services/shares.ts`): `resolveActiveShare` (live, both accounts active), `requireShareAccess`
   (404 `not_found` "Shared timesheet" / 403 `grant_scope`), `grantShare` (exact normalized email; unknown or inactive ->
   identical 422 `grantee_not_found`; own address 422 `self_share`; empty items 422 `no_share_items`; active pair 409
   `share_exists`), `changeShare` (revoke + insert in one IMMEDIATE transaction; equal items -> `changed: false`, no audit),
   `revokeOwnShare` (owner revokes or grantee leaves; anyone else 404), `listGivenShares`, `listReceivedShares`,
   `listAllShares`/`adminRevokeShare`, `recordSharedPdfDownload`. Audit `share.grant`, `share.change` (before/after
   items with share ids), `share.revoke` (`revoked_by_role`), `share.pdf_download` (owner = owner, actor = grantee,
   payroll date and revision number): ids and items only, no address, name or timesheet content.
   `services/users.ts` gains `getActiveAccount` and `findActiveAccountByEmail`.
3. **Routes** (`routes/shares.ts`, mounted in `app.ts`):
   - `/api/shares` (session user's own): `GET` -> `{ given, received }`; `POST {grantee_email, items:{timesheets, ot_read,
     pdf_download}}` -> 201 `{share}`; `PUT /:id {items}` -> `{share, changed}`; `POST /:id/revoke {reason?}` ->
     `{revoked:{id, role, revoked_at}}`. Ten `grantee_not_found` answers per account per 15 minutes, then 429
     `rate_limited` with Retry-After (also for an existing address).
   - `/api/shared/:ownerId` built from the T13A factories behind `requireShare(deps, item)`, reduced to the explicit
     `SHARED_ROUTES` allowlist (17 routes: 7 timesheet reads incl. `GET /policies`; 5 manual writes with edit; OT
     summary/ledger and pending lines with `ot_read`; `GET /revisions` with timesheets or PDF; `GET /revisions/:id/pdf`
     with `pdf_download`). A startup error is thrown if a factory stops registering an allowlisted route. Nothing else is
     mounted (Clock in/out, policy writes, review, sign-off, corrections, late review, finalization detail, resend,
     deliveries/decision, settings, auto-image, signatures, leave, evidence export, history, shares).
4. **Access resolution** (`http/auth.ts`): `requireShare` resolves the share from the DB on every request (401 anonymous;
   404 no/revoked share, inactive account, wrong or own owner; 403 `grant_scope` without the item), sets actor = session
   user and subject = the owner principal built from the owner's account (never the session), and runs the request in an
   `AsyncLocalStorage` share scope. `shareCheckedDb` gives the shared routers a database whose every transaction first
   re-checks that share inside the same IMMEDIATE transaction (revocation race), failing closed outside a scope. Object
   ids stay subject-scoped by the existing services. The existing `/api/...` routes are unchanged (`requireUser`).
5. **Revision list (T13 carry item)** (`routes/submission.ts`): owner-only, write-free `GET /api/revisions` ->
   `{revisions:[{id, payroll_date, revision_no, revision_kind, origin, review_state, supersedes_revision_id, finalized_at,
   pdf_state, delivery_state}]}` (latest attempt state; no payload, hash, envelope, recipient or signature). The
   submission factory gains `beforePdfSend`, used only by the shared mount to audit (and re-check) each grantee download.
6. **History** (`services/history.ts`): events gain `via_share` and `actor_display_name`. An event is "performed under a
   share" when its actor held an active share of the owner at that instant (grant up to and including revocation) and it
   is not account administration (`user.*`); then the grantee's display name is shown, never the id. Everything else is
   unchanged (`history.test.ts` first test updated deliberately).
7. **Admin** (`routes/admin.ts`): `GET /api/admin/shares` (owner/grantee id and name, items, created/revoked instants,
   `revoked_by_role`; no address) and `POST /api/admin/shares/:id/revoke {reason?}` (audited, actor = admin). No create
   or use route; `admin.ts` still contains no `timesheet_` or timesheet module.

#### Checks

- Red first (`02`): the new/changed tests against the unchanged source: 68 failed, 55 passed. One of the 68 (the 0004
  STRICT-table count) failed only from my own `EXPECTED_TABLES` edit and was rescoped to the pre-0006 tables before any
  source edit.
- Green: targeted 8 files / 172 tests (`03`); full suite in verify 59 files / 1356 tests (baseline 57 / 1292; +64:
  sharing 29, sharing-matrix 25, history +2, isolation +2, migrations +6).
- Matrix test (`sharing-matrix.test.ts`, own literal matrix): enumerates every registered `/api/shared` route and fails
  on one without an entry (and on a missing one); for each of the 11 item sets probes all 17 routes as grantee
  (allowed 200/422, refused 403 `grant_scope`), non-grantee 404, admin without share 404, anonymous 401, and 31 never-shared
  paths 404 for grantee, stranger and admin; pins the full non-shared inventory (64 baseline routes + 7 sharing routes).
- Revocation/race (`sharing.test.ts`): owner revoke, grantee leave, admin revoke, owner deactivation (suspends, not
  revokes; reactivation restores) and grantee deactivation all apply on the next request; a revocation, a drop to view or
  an owner deactivation between the guard and the write transaction refuses all five write routes (404 / 403) with nothing
  written. Clock in/out for a full grantee 404; foreign and own session ids 404; PDF downloads audited, owner downloads not.
- Mutations (`04`): 10 of 10 caught, all restored byte-identical (SHA-256): M1 item check removed at the door, M2 no
  in-transaction re-check, M3 subject from the session, M4 owner status not live, M5 PDF download not audited, M6 Clock in
  allowlisted, M7 history window dropped, M8 anyone may revoke, M9 revision list unscoped, M10 view admits writes.
- Route inventory (`05`): all 64 baseline lines (method, path, handler count, anonymous/employee/admin status)
  identical; 24 new lines (17 shared, 4 shares API, 2 admin, `GET /api/revisions`).
- `npm run test:e2e` once (`06`): exit 0, 111 passed, 3 skipped.
- `NODE_OPTIONS='--trace-deprecation --pending-deprecation' npm run verify` (`07`): exit 0, 0 deprecation lines, SMOKE
  PASSED (schema v6). `npm run digest` last (`08`): `f3df3b86f5d0008f838f593aafd26631e93b3a476831744e3f9fad56809548ab`
  (701 files, handoff/ excluded). Only handoff/ files (this report, evidence) were written after it.

#### Deviations and notes

1. `tests/integration/ot-api.test.ts` (not owned): the mutating-route allowlist gains the 9 sharing write routes and the
   ledger-route pin gains `GET /api/shared/:ownerId/ot/ledger` (the brief's example deviation).
2. `routes/api.ts` and `routes/ot.ts` needed no edit: the allowlist picks the registered guard+handler pairs from the
   factory output in `routes/shares.ts`.
3. History attribution uses the share's validity window, not a per-event marker, because the audit writers
   (`timesheetCommands.ts`, `audit.ts`) are not owned; an event by a grantee outside every share window stays
   unattributed (tested).
4. API contract for T13C as listed above; `GET /api/shares` `received[].owner.id` is the `:ownerId` of the shared path.
5. Scratch files I created remain under `D:\timesheet-tmp\WP3-T13B` (no recursive removal done).
