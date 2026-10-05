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
