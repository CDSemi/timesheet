# WP3-T13A dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T13A; package WP3; kind implement;
  attempt 1; depends on WP3-T13D-FREEZE. A preparatory seam for the sharing feature
  (T13B): separate the acting user (actor) from the timesheet owner (subject) without
  any behaviour change. Runs before WP3-DOC/T07B by coordinator decision (independent of
  the pending G-Q1/G-Q2).
- Profile/routing: timesheet-worker-high, requested sonnet/high, no override. Routing:
  size M, risk H (touches ownership plumbing on every personal route; must not change
  behaviour), novelty no.
- Read AGENTS.md from disk first (rule 4: ownership on all data/file actions). Then read:
  - [WP3-REQ](WP3-REQ.md) observations O1–O3, section C (access resolution) and the E
    row for T13A; [WP3-REQ2](WP3-REQ2.md) item 4 (T13A also parameterizes
    `routes/ot.ts` and the revision status/PDF read routes) — binding;
  - the board `owner_decisions` of 2026-10-04 (F-3 sharing; F-Q4 (b) per-item toggles;
    F-Q5 (a) edit limits) for context only: no grant logic in this task;
  - the WP3-T13D result (carry item: the admin status reads the sender flag and mode from
    `process.env` because `AppDeps` has no delivery config).
- Baseline: main at the WP3-T13D-FREEZE commit (the coordinator gives the SHA in the
  dispatch prompt). The working tree differs only in handoff/.
- Runtime: call the Node 24 portable binary by its full path. Use
  `D:\timesheet-tmp\WP3-T13A` for TEMP/TMP; delete only files you created; never remove
  folders recursively. If a shell call fails with ENOSPC, stop and report. Never write
  into the repository root. On Windows, never redirect to /dev/null or nul from a POSIX
  shell. Evidence scripts are stored as `*.mjs.txt` or `*.py.txt`. No user-profile path
  literals in source or tests.
- Synthetic data only. Do not commit.

## Required changes (binding)

1. **Actor and subject in the request context** (`src/server/types.ts`,
   `src/server/http/auth.ts`): `AppEnv` gains `actor` (the session user) and `subject`
   (the owner principal). For every existing route, subject = actor = the session user
   (no grants yet). Services receive the subject as the owner and the actor for audit.
2. **Commands and audit** (`services/timesheetCommands.ts`, `services/dayEntries.ts`):
   `CommandContext` gains `actor`; audit events record `actor_user_id` = actor and
   `owner_user_id` = subject (identical today, so no observable change).
3. **Router factories** (`routes/api.ts`, `routes/ot.ts`, and the revision status/PDF
   read routes wherever T05/T06/T08/T09 placed them): each personal router is built by a
   factory that takes its subject from the context (not from `c.get('user')` directly), so
   T13B can mount an allowlisted subset under `/api/shared/:ownerId`. Mount the factories
   exactly where the routes are mounted today; no new mount, no new path.
4. **Delivery config carry item:** pass the loaded delivery configuration through
   `AppDeps` (`app.ts`, `index.ts`, and `cli.ts` if it builds the app) and make
   `services/operationsStatus.ts` read it instead of `process.env`, with an unchanged
   admin response.

## Owned (writable) paths

- src/server/types.ts, src/server/http/auth.ts, src/server/app.ts, src/server/index.ts,
  src/server/cli.ts.
- src/server/services/timesheetCommands.ts, src/server/services/dayEntries.ts,
  src/server/services/operationsStatus.ts.
- src/server/routes/api.ts, src/server/routes/ot.ts, src/server/routes/submission.ts
  (router factory only).
- tests/integration/edit-rules.test.ts, tests/integration/day-entries-batch.test.ts,
  tests/integration/actor-subject.test.ts (new) and tests/integration/operations-status.test.ts.
- This report and handoff/delivery/evidence/WP3-T13A/.

List any other minimal edit as a deviation.

## Checks

- **No behaviour change:** the full existing suite passes unchanged except the owned
  tests; record the before/after test counts and confirm no existing assertion was
  weakened. An HTTP route inventory (method, path, auth) before and after is identical
  (evidence).
- New red-first tests (`actor-subject.test.ts`): the context sets actor = subject = session
  user on every personal route; an audit event written by a command records both ids;
  services never read the session user directly (a source scan that fails if a personal
  route or service uses `c.get('user')` for ownership after the change); the admin status
  reads the injected delivery config (a test with env unset and config set). At least two
  mutation checks, each caught (compute the mutation before opening a file for writing;
  restore byte-identical).
- Run `npm run verify` with `NODE_OPTIONS=--trace-deprecation --pending-deprecation`
  (exit 0, no deprecation line) and `npm run digest` as the **last** commands, after the
  final edit; if any file changes afterwards, run both again. Run `npm run test:e2e`
  once before them (no UI change expected; all pass).
- Evidence masked, LF, free of trailing whitespace, single final newline.

Return at most 150 words, beginning with your self-reported model: the seam, the router
factories, the audit change, the config carry item, the route-inventory comparison,
red/green and mutation counts, verify and e2e exits, test count, digest, and deviations.

## Results

(Worker appends here.)

### Worker result (attempt 1, 2026-10-04)

- Self-reported model: claude-sonnet-5-5 (profile timesheet-worker-high; effort not observable).
- Baseline: main at `19723b6e77b75c972cf416229d05b3b5203c8480`; baseline source digest
  `321cc6a04ec23a92e6aa7e30c153d12db870002bf053cf3fc2b5655d3d0ae862`. Node 24.21.0 portable by full path;
  TEMP/TMP under `D:\timesheet-tmp\WP3-T13A`. No commit, no shared state touched.
- Evidence: `handoff/delivery/evidence/WP3-T13A/` (01 baseline, 02 red, 03 green, 04 mutations, 05 after,
  06 route inventory before/after/compare, 07 e2e, 08 verify, 09 digest, `mutations.py.txt`,
  `route-inventory.mjs.txt`).

#### What changed (no behaviour change)

1. **Actor and subject in the context** (`types.ts`, `http/auth.ts`): `AppEnv.Variables` gains `actor` and
   `subject` (both `SessionUser`). `requireUser` sets `user`, `actor` and `subject` to the session user on every
   route. `PersonalRouterOptions { access? }` is the guard a router factory applies to its routes; the default is
   `requireUser(deps)`.
2. **Commands and audit** (`services/timesheetCommands.ts`): `CommandContext` gains an optional `actor`; `user`
   stays the subject/owner (documented). The audit event writes `actor_user_id = (ctx.actor ?? ctx.user).id` and
   `owner_user_id = ctx.user.id`. `actor` is optional because `seed.ts` and five test files plus `tests/support/concurrency.ts` (not owned)
   build `{ db, clock, user }`; absent means the owner acts, so their behaviour is unchanged. `dayEntries.ts` needed
   only a comment edit (the batch passes the context through `applyDayEntryChange`).
3. **Router factories** (`routes/api.ts`, `routes/ot.ts`, `routes/submission.ts`): `apiRoutes`, `otRoutes` and
   `submissionRoutes` take `(deps, options?: PersonalRouterOptions)`, apply `options.access ?? requireUser(deps)`
   per route exactly as before, and read the owner from `c.get('subject')` and the attribution from `c.get('actor')`
   (`ot.ts` passes `actorUserId` from the actor; the policy creator id is the actor). No `c.get('user')` remains in
   the three files. Mounts in `app.ts` are unchanged (`/api/ot`, `/api`, `/api`); `app.ts` needed no edit.
   Observation for T13B: there is no PDF download route yet. The revision status reads are
   `GET /timesheets/:payrollDate/finalization` and `GET /revisions/pending-lines` in `submission.ts`. The sign-off,
   revision, late-review, resend and delivery-decision POSTs in `submission.ts` pass the subject as owner; T13B must
   exclude them (and review, deliveries, settings, signatures, history) from the allowlisted shared mount, and
   `signoff`/finalization contexts have no actor yet.
4. **Delivery configuration carry item**: `AppDeps.delivery?: DeliveryConfig`; `index.ts` passes the
   `loadDeliveryConfig` result it already has; `cli.ts` builds no app (no edit). `operationsStatus.ts` drops
   `deliverySetupFromEnv` (the only `process.env` reader) for `deliverySetupOf(delivery)`; `routes/admin.ts` passes
   `deps.delivery`. The response shape and values are unchanged for a configured server. `delivery` is optional
   because five non-owned test files build `AppDeps` without it (`tests/support/testApp.ts`, `isolation`, `ot-api`,
   `signatures`, `static-and-limits`); without it the admin status reports `{ configured: null, outbound_mode:
   'unknown' }`. A misconfigured environment (the old `unknown` case) now stops the server at startup in
   `loadDeliveryConfig` (covered by `config.test.ts`), so it never reaches the status route.

#### Tests

- New `tests/integration/actor-subject.test.ts` (14 tests): actor = subject = session user on every route of the
  three factories (every route in the three routers' `.routes`, each probed through a recording guard);
  seam behaviour with a test-only guard whose subject differs from the actor (api, ot, submission); audit records
  both ids for single commands and the day batch (preview writes nothing); the actor defaults to the owner; source
  scans (no `get('user')` in the three routers and in any service; no hono import in services); the admin status
  reads the injected configuration with `MAIL_FROM`/`OUTBOUND_MODE` unset or contradicting, never echoes the address
  or SMTP host, and `process.env` is absent from `operationsStatus.ts` and `admin.ts`.
- Red first: against the HEAD versions of the ten changed source files, 11 of 14 failed and 3 passed by design
  (production-mount compatibility, actor defaults to the owner, services free of context reads); files restored
  byte-identical (`02-red.txt`). Green: 14/14 (`03-green.txt`).
- Mutation checks (`04-mutations.txt`), six, all caught, all restored byte-identical (sha256 equal and `cmp`):
  M1 audit actor written as the owner (3 failures); M2 api command context owner taken from the actor (1); M3 `ot.ts`
  summary reads the session user (2: behaviour and scan); M4 operations status reads the environment (4, two files);
  M5 guard stops setting the actor (1); M6 `submission.ts` status reads the session user (1, scan only).
- `operations-status.test.ts` (owned) changed in three places only because the environment is no longer read: the
  "empty system" test now builds the app with a capture/no-sender configuration (same expected object); the sender
  test builds apps with injected configurations (configured true/capture and smtp mode, address and SMTP host not
  echoed) and checks that an app without a configuration reports `unknown` even with `MAIL_FROM` set. The old
  `OUTBOUND_MODE=smtp` without the owner flag to `unknown` assertion is replaced, not weakened: that environment now
  refuses to start (`config.test.ts` line 156 pins it). `edit-rules.test.ts` and `day-entries-batch.test.ts` needed
  no change and pass unchanged.
- Counts: before 53 files / 1150 tests; after 54 files / 1164 tests (+14, all new; no existing assertion removed
  except the replaced one above).

#### Route inventory

`06-route-inventory-*.txt`: 63 (method, path) entries with handler count and the status answered to an anonymous
caller, the synthetic employee and the synthetic admin; before and after are byte-identical
(`06-route-inventory-compare.txt`: IDENTICAL).

#### Gates

- `npm run test:e2e` (once): exit 1, 95 passed, 3 skipped, 2 failed. Both failures are `[mobile]` specs
  (`ot-leave.spec.ts` evidence CSV, `review.spec.ts` finalized in another window) that failed on the browser
  console error `net::ERR_NO_BUFFER_SPACE` (Windows socket buffer exhaustion), not on an assertion about the
  change; a supplementary targeted run of those two spec files on the mobile project passed 27, skipped 1
  (exit 0). Not a second full run; the coordinator may re-run the full suite if it wants a clean exit 0.
- Final, after the last source edit: `NODE_OPTIONS=--trace-deprecation --pending-deprecation npm run verify` exit 0
  (typecheck, lint, 54 files / 1164 tests, build, smoke), no deprecation line; then `npm run digest` exit 0:
  `0edefc94a01eef88b0c7df32d7c71f328703ee08f58876a2c9297d6b8ed03299` (679 files, handoff/ excluded).

#### Deviations

1. `src/server/routes/admin.ts` (not owned): two lines (import and the call) so the admin status uses
   `deliverySetupOf(deps.delivery)`; unavoidable because that route passed `process.env`.
2. `CommandContext.actor` and `AppDeps.delivery` are optional (reasons above) to avoid edits to non-owned
   `seed.ts`, `tests/support/*` and five other tests; T13B may make `actor` required when it owns those callers.
3. `src/server/services/dayEntries.ts`: comment only.
4. Scratch files remain under `D:\timesheet-tmp\WP3-T13A` (created by me; no recursive removal done).
