# Development guide

Status: **WP1, WP2 and WP3 independently accepted; WP4 implemented (T01–T12 and the documentation task T13), awaiting the package-final gate WP4-GATE and independent audits; not accepted.** See the [WP4 handoff](handoff/delivery/WP4_HANDOFF.md), the [operations runbook](docs/11_OPERATIONS_RUNBOOK.md), the [WP3 handoff](handoff/delivery/WP3_HANDOFF.md), the [WP2 handoff](handoff/delivery/WP2_HANDOFF.md) and [next action](handoff/NEXT_ACTION.md). English is authoritative; [DEVELOPMENT.vi.md](DEVELOPMENT.vi.md) is the translation. Business rules live in [02 Time and OT](docs/02_TIME_AND_OT_RULES.md) and [03 Architecture](docs/03_ARCHITECTURE_AND_DATA.md); this guide only explains how to run the code.

## Prerequisites

- **Node.js 24 LTS is required.** Pinned by `.nvmrc` (24.21.0) and `engines` (`^24.11.0`); `.npmrc` sets `engine-strict`, so npm refuses other majors such as Node 25 or 26. Put Node 24 first on `PATH` (check `node --version`): the build, the smoke script, the e2e harness and every child process use that runtime.
- **Browser for the e2e tests:** the installed Microsoft Edge (`channel: msedge`, the default). `E2E_CHANNEL=chrome` uses installed Chrome; `E2E_CHANNEL=chromium` needs `npx playwright install chromium` (downloaded outside the repository). Nothing is downloaded by default.
- **TypeScript 6.0.3**, not 7: the type-aware lint that enforces the no-deprecated rule (typescript-eslint) does not support TypeScript 7's native compiler yet. Both versions check the same language.
- npm 11. `allowScripts` denies the `node-gyp` fallback of `better-sqlite3`, whose package already ships N-API binaries for Windows, Linux (glibc/musl) and macOS on x64/arm64.
- No database server: one local SQLite file. Keep the live database **outside Dropbox** (see [07 Operations](docs/07_DEPLOYMENT_AND_OPERATIONS.md)); the default path is `%LOCALAPPDATA%\timesheet-dev\timesheet.db` (or `~/.local/share/timesheet-dev/` elsewhere).
- Recommended when the project folder is synchronized: exclude `node_modules/` and `dist/` from Dropbox, because sync locks can make `npm ci` fail with `EBUSY`.

## Commands

~~~bash
npm ci                 # exact dependencies from package-lock.json
npm run typecheck      # strict tsc for server, client and tests
npm run lint           # ESLint + typescript-eslint: no deprecated APIs (AGENTS.md item 11)
npm test               # all Vitest suites (fixtures, engine, SQLite/HTTP integration)
npm run test:fixtures  # domain and fixture tests only
npm run test:e2e       # build, then Playwright browser flows (desktop 1280x800 and mobile 390x844); not part of verify; capture sender only
npm run build          # tsc → dist/domain + dist/server; Vite → dist/client
npm run smoke          # built server over real HTTP with a throwaway database (GET safety, 409s, private-download 404/401, capture check)
npm run verify         # typecheck, lint, test, build and smoke in one run
npm run digest         # platform-independent source digest (handoff/ excluded) for handoffs
npm run migrate        # apply pending migrations to DATABASE_PATH
npm run seed           # synthetic example.invalid users and sample data; refused when NODE_ENV=production
npm start              # built app (API + client) on http://127.0.0.1:3000; also starts the job runner unless JOB_RUNNER=off
node dist/server/cli.js run-jobs --once --now 2026-10-05T12:00:00Z   # one deterministic job pass (after npm run build); refused when NODE_ENV=production
npm run drill:container -- --work <empty folder outside the repository> --project <name> --wp3 <previous build folder>   # WP4 operations drill (needs Docker)
~~~

Development servers: `npm run dev:server` (API on port 3000, Node type stripping) and `npm run dev:client` (Vite on port 5173, proxying `/api`).

The seed (`npm run seed`) creates three accounts: `admin@example.invalid`, `employee@example.invalid` and `employee2@example.invalid`. Supply `SEED_ADMIN_PASSWORD`, `SEED_EMPLOYEE_PASSWORD` and `SEED_EMPLOYEE2_PASSWORD` (12+ characters each) or let it print one-time random development passwords; no password is stored in the source. `employee2` also gets sample data, all written through the production services: three recent weekday sessions, one OT leave request (240 minutes, recorded permission) and one setup credit of 600 minutes posted through the internal ledger service with the explicit setup key `seed-setup-credit-employee2` and a reason. The seed never infers an opening balance from timesheets. `employee2` also gets synthetic submission settings (recipients on `example.invalid`, auto-submit off) and a generated signature image, so the review and sign-off flow works at once. `employee@example.invalid` stays empty, which the e2e tests rely on. The seed prints a hint: set `MAIL_FROM` to an `example.invalid` address (with `OUTBOUND_MODE` left at `capture`) so first delivery attempts are captured; without a sender they end `failed_permanent` with the visible code `sender_missing`. The admin role manages accounts and configuration only: it has no access to another user's timesheet, ledger, leave, history or export.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `HOST` | `127.0.0.1` | Bind address; loopback only, nothing is exposed on the network |
| `PORT` | `3000` | HTTP port |
| `DATABASE_PATH` | local app-data path above | SQLite file (WAL, foreign keys, busy timeout, synchronous FULL) |
| `APP_ORIGINS` | localhost/127.0.0.1 on `PORT` and 5173 | Exact origins allowed to change data; **required** when `NODE_ENV=production` |
| `COOKIE_SECURE` | `true` in production | Adds `Secure` to the session cookie and sends HSTS |
| `TRUSTED_PROXY_ADDRESSES` | empty | Exact IP addresses (no CIDR) of the reverse proxies whose `X-Forwarded-For` is believed for the sign-in rate limit; empty ignores every forwarded header. In a container set `HOST=0.0.0.0` (the image does) and publish the port to loopback only; production also requires absolute `DATA_DIR` and `DATABASE_PATH` |
| `SESSION_TTL_HOURS` | `168` | Absolute server-session lifetime |
| `STATIC_DIR` | `dist/client` beside the built server | Built client directory |
| `DATA_DIR` | `private-data` beside the database | Absolute path of the private file store (signatures, PDFs, mail captures); refused inside a Dropbox folder or the static root; never commit it |
| `PUBLIC_BASE_URL` | `http://localhost:<PORT>` | Base of the login-required review link in notices; plain http(s), no credentials, query or fragment; **required** and https in production |
| `MAIL_FROM` | unset | Sender address of every message, for the capture sender as well; use an `example.invalid` address in development; with none, sends fail visibly (`sender_missing`) |
| `OUTBOUND_MODE` | `capture` | `capture` writes messages to disk; `smtp` is refused unless `PRODUCTION_SENDING_ENABLED` is exactly `true` |
| `PRODUCTION_SENDING_ENABLED` | unset | **Owner-only production flag; never set in development, tests or CI.** Together with `OUTBOUND_MODE=smtp` it is the only way real mail can leave |
| `SMTP_HOST`, `SMTP_PORT` (587), `SMTP_SECURITY` (`starttls` or `tls`), `SMTP_USER`, `SMTP_PASSWORD` | unset | Read only in smtp mode; the owner supplies the values at the pilot; credentials are held redacted and never logged or stored; do not put values in the repository |
| `JOB_RUNNER` | on | `off` stops the in-process job runner (the CLI `run-jobs` then drives jobs) |

## Jobs, capture outbox and delivery

- **Runner.** `npm start` runs due jobs in the server process (a pass at start and every 15 seconds, durable leases, retries after 1, 5, 15 and 60 minutes, then visible intervention). `JOB_RUNNER=off` disables it. For deterministic local runs build first and call `node dist/server/cli.js run-jobs --once --now <UTC instant>`: it migrates, runs one pass on that fixed clock and prints counts only. It exits 1 when `NODE_ENV=production`.
- **Capture outbox.** The default `OUTBOUND_MODE=capture` writes each message to `<DATA_DIR>/mail-capture/<attempt id>/` (reminders: the job id) as `message.eml`, `attachment.pdf` (only when the message has an attachment) and `metadata.json` (Message-ID, envelope, sizes and SHA-256; no credential, no body). Captures and the private store hold personal data: keep them outside Dropbox and out of git. Nothing is sent to any network in capture mode.
- **Production sending flag.** Real SMTP exists only when `OUTBOUND_MODE=smtp` and `PRODUCTION_SENDING_ENABLED=true` are both set. The flag belongs to the owner for the authorized pilot; no script, seed or configuration file in the repository sets it, and the tests only pass explicit configuration objects (a delivery test asserts the test process environment never carries it).
- **Activation instant.** One system-wide instant (empty until the owner's pilot) controls deadline automation and reminders: with it empty nothing is auto-submitted, recorded or queued. An administrator records it with `PUT /api/admin/automation/activation` (`{active_from, reason}`; a past instant is refused; audited). Each user's auto-submit effective instant is separate and set by the settings screen.
- **Admin status.** `GET /api/admin/operations` and `GET /api/admin/submissions` (read only) show the sender flag and mode, runner heartbeat, activation, job and delivery totals, and per person only periods that have a revision with recipients and redacted fault codes; no timesheet content.

## Sharing

An individual can share their own timesheets with another account from Settings, item by item: timesheets none, view or edit, read-only OT summary and ledger, and final PDF downloads (a PDF contains the signature image). The grant names the account by its exact email. Edit covers manual day, session, break and batch edits; never Clock in/out, sign-off, corrections or sending. Shares are revocable by the owner or the grantee, effective on the next request, never transitive, and audited; administrators can list and revoke them but not create or use them. API: `GET|POST /api/shares`, `PUT /api/shares/{id}`, `POST /api/shares/{id}/revoke`; shared reads and writes go through the explicit allowlist under `/api/shared/{ownerId}`.

## Operations, the drill and import fixtures (WP4)

- **Operations commands.** `node dist/server/cli.js` accepts `migrate`, `seed`, `run-jobs`, `bootstrap --config <file>` / `--new-token`, `backup --to <dir> [--prune]`, `backup prune --in <dir> --dry-run`, `restore --from <backup> --to <empty dir> [--keep-schema [--confirm]]` and `outbound resume|release|drop`. Every one prints counts only. The [operations runbook](docs/11_OPERATIONS_RUNBOOK.md) explains how to use them on the NAS and which drill stage verified each.
- **Container drill.** `npm run drill:container -- --work <dir> [--project <name>] [--wp3 <dir>] [--keep]` builds the pinned image for linux/amd64, runs it through `compose.example.yaml` on a fresh host folder and checks stages 1 to 6: install and restart, backup under writes, isolated restore with the outbound pause and reconciliation, upgrade, rollback, and workbook import with the opening balance. It needs Docker and a free loopback port, uses synthetic data only, and prints per-stage PASS lines, a `STAGE n` tally and `DRILL STAGES 1-6 PASSED` (exit 0).
- **Drill flags.** `--work` is the host folder for the drill data, the env file and the raw logs (outside the repository; nothing in it is deleted). `--project` names the Compose project (default `timesheet-drill`); every container, volume and network of the drill carries it and is removed by that name at the end unless `--keep`. `--wp3` is the previous build for stages 4 and 5, prepared outside the repository (`git archive 49651c8` extracted into a folder, then `npm ci` and `npm run build:server` there); without it the drill runs stages 1 to 3 and 6 and says so.
- **Synthetic workbook generator.** `tests/support/syntheticWorkbook.ts` (`buildSyntheticWorkbook`, `readTemplateBytes`) clones the tracked template's bytes in memory at the ZIP level and adds dated period sheets (payroll date, synthetic names on `example.invalid`, per-day overrides, optional corrected formulas). It reads no clock and writes no file; the tracked template is never re-saved and its SHA-256 is asserted before every use.
- **New test files in WP4.** Integration: `health`, `audit-access`, `bootstrap`, `backup`, `backup-prune`, `restore`, `jobs-sweep`, `job-retention`, `operations-status`, `workbook-reader`, `workbook-import`, `opening-balance` and `upgrade` (in `tests/integration/`). Client: `importModel` (in `tests/client/`). End to end: `setup`, `admin-status`, `admin-users` and `import` (in `tests/e2e/`). Helpers in `tests/support/`: `concurrency` (a writer worker for backup tests), `schemaV6` (the accepted WP3 schema fixture) and `syntheticWorkbook`.
- **Migrations up to 0013.** `0007_audit_access` (the recorded share marker on audit rows), `0008_bootstrap`, `0009_operations_backup`, `0010_outbound_pause`, `0011_job_retention`, `0012_imports` and `0013_ot_opening_balance` (rebuilds `ot_ledger`). `migrate()` turns `foreign_keys` off before its exclusive transaction and runs `foreign_key_check` before COMMIT whenever it applied something, so a table rebuild is safe; an older build refuses a database from a newer schema.
- **New routes.** `GET /api/ready` (readiness without personal data), `GET /api/auth/setup` and `POST /api/auth/bootstrap` (the one-time setup), `/api/imports` (the owner's own workbook import) and `/api/ot/opening-balance` (owner only), and `GET /api/admin/operations` with its backup, disk, outbound and retention blocks.

## Layout

| Path | Responsibility |
|---|---|
| `src/domain/` | Pure engine shared by API and UI: dates, UTC instants, IANA zones/DST, intervals, calendar, policies, R-04 overtime, R-05 deficits, periods, edit reasons |
| `src/server/db/` | SQLite connection and versioned, checksummed migrations (`STRICT` tables, ownership keys, immutability and overlap triggers) |
| `src/server/auth/` | scrypt passwords, hashed revocable sessions, login rate limit |
| `src/server/services/` | Calendars, policies, periods, timesheet queries and commands, audit |
| `src/server/routes/`, `http/` | Hono routes, schemas, origin/CSRF and error handling; `shares.ts` and the allowlisted `/api/shared` mount |
| `src/server/pdf/`, `files/`, `mail/`, `jobs/` | Deterministic PDF renderer (pdf-lib, embedded DejaVu fonts), private file store, capture and SMTP adapters with outcome classification, durable job store, runner and the PDF, send, deadline and reminder handlers |
| `src/client/` | React client: shell, two-week grid and mobile day list, day editor, OT, history, settings and admin screens |
| `tests/domain/` | Every scenario of `reference/fixtures/overtime_cases.json`, `time_cases.json` and the deficit cases of `ledger_cases.json`, plus engine edge cases |
| `tests/integration/` | Fresh and upgrade migrations, schema invariants, auth, two-user isolation, API rules, ledger and leave services, multi-connection concurrency |
| `tests/client/`, `tests/e2e/` | Pure display-logic unit tests; Playwright browser flows against the built server, a temporary database and the synthetic seed |
| `reference/` | Reference data: fixtures read by `tests/domain/`, examples read by the synthetic seed, sanitized workbook template |
| `handoff/` | Agent workflow (status, prompts, templates, handoffs, reviews, evidence); excluded from `npm run digest` |
| `scripts/smoke-built-server.mjs` | End-to-end check of the built server, including cross-area 403/404, the OT summary and the evidence CSV headers |
| `src/server/ops/`, `src/server/import/` | Consistent backup, manifest, prune and isolated restore with the outbound pause; the safe workbook reader and template mapping version 1 |
| `Dockerfile`, `compose.example.yaml`, `.env.example`, `scripts/container-drill.mjs` | Pinned non-root image, Compose example, secret-free configuration example and the operations drill |
| `scripts/source-digest.mjs` | Source digest recorded in handoffs |
| `eslint.config.js` | Lint gate: `@typescript-eslint/no-deprecated` |
| `.editorconfig`, `.gitattributes` | UTF-8, LF, 2-space indentation (Python 4); CRLF only for Windows `.bat`/`.cmd`/`.ps1`; binary assets |
| `.idea/inspectionProfiles/` | Shared JetBrains inspection profile (the rest of `.idea/` stays local): turns off "Import can be shortened", whose directory-import fix fails NodeNext type checking (TS2834) |

## API (WP1 core)

All routes are under `/api`, return JSON and take the owner from the session cookie only; request objects are strict, so fields such as `user_id` are rejected. State-changing requests need an allowed `Origin` and JSON bodies.

| Method and path | Purpose |
|---|---|
| `GET /health` | Liveness without personal data |
| `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` | Local sign-in and session |
| `GET /calendar` | The caller's company calendar, versions and payroll rules |
| `GET /periods/current`, `GET /periods?from=&to=` | Current (due) period, period in progress, period list |
| `GET /timesheets/{payrollDate}` | Fourteen days with classification, sessions and provisional calculations |
| `GET /days/{date}`, `PUT /days/{date}` | Day view; label, partial leave minutes, WFH and notes |
| `POST /days/{date}/sessions` | Manual session: UTC `…Z` strings or `{local, zone, fold?, offset?}` |
| `GET`, `PUT`, `DELETE /sessions/{id}` | Own session; updates and deletes need `expected_version` |
| `POST /clock/in`, `POST /clock/out` | Live clock at server time (seconds kept); clock-out confirms breaks or leaves them unknown |
| `GET /policies`, `POST /policies` | Own effective-dated policy versions (append-only, prospective) |

Errors use `{ "error": { "code", "message", "details?" } }`: 401 authentication, 403 origin, 404 not found (also another user's record), 409 `stale_version`/immutable/conflict, 415 media type, 422 validation (domain codes such as `overlapping_user_intervals`, `nonexistent_local_time`, `reason_required`, `retroactive_change`), 429 rate limit.

The WP2 areas (`/api/ot/*`, `/api/history`, `/api/days/batch`, `/api/policies/preview`, `/api/admin/*`) and their contracts are listed in the [WP2 handoff](handoff/delivery/WP2_HANDOFF.md); the WP3 routes (signatures, submission settings, review, sign-off, revisions, resend, deliveries, PDF download, shares, admin operations and activation) are listed in the [WP3 handoff](handoff/delivery/WP3_HANDOFF.md). No public route posts a credit or debit: credits and debits post only inside sign-off, correction and deadline finalization through the one ledger service; credits in responses are provisional until a period is finalized.
