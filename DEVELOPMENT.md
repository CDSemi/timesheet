# Development guide

Status: **WP1 foundation — implemented, independent review pending.** English is authoritative; [DEVELOPMENT.vi.md](DEVELOPMENT.vi.md) is the translation. Business rules live in [02 Time and OT](docs/02_TIME_AND_OT_RULES.md) and [03 Architecture](docs/03_ARCHITECTURE_AND_DATA.md); this guide only explains how to run the code.

## Prerequisites

- **Node.js 24 LTS.** Pinned by `.nvmrc` (24.21.0) and `engines` (`^24.11.0`); `.npmrc` sets `engine-strict`, so npm refuses other majors such as Node 25.
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
npm run build          # tsc → dist/domain + dist/server; Vite → dist/client
npm run smoke          # built server over real HTTP with a throwaway database
npm run verify         # typecheck, lint, test, build and smoke in one run
npm run digest         # platform-independent source digest (delivery/ excluded) for handoffs
npm run migrate        # apply pending migrations to DATABASE_PATH
npm run seed           # synthetic example.invalid users; refused when NODE_ENV=production
npm start              # built app (API + client) on http://127.0.0.1:3000
~~~

Development servers: `npm run dev:server` (API on port 3000, Node type stripping) and `npm run dev:client` (Vite on port 5173, proxying `/api`).

The seed creates `admin@example.invalid` and `employee@example.invalid`. Supply `SEED_ADMIN_PASSWORD` / `SEED_EMPLOYEE_PASSWORD` (12+ characters) or let it print one-time random development passwords. The admin role manages nothing private: it has no access to another user's timesheet.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `HOST` | `127.0.0.1` | Bind address; loopback only, nothing is exposed on the network |
| `PORT` | `3000` | HTTP port |
| `DATABASE_PATH` | local app-data path above | SQLite file (WAL, foreign keys, busy timeout, synchronous FULL) |
| `APP_ORIGINS` | localhost/127.0.0.1 on `PORT` and 5173 | Exact origins allowed to change data; **required** when `NODE_ENV=production` |
| `COOKIE_SECURE` | `true` in production | Adds `Secure` to the session cookie and sends HSTS |
| `SESSION_TTL_HOURS` | `168` | Absolute server-session lifetime |
| `STATIC_DIR` | `dist/client` beside the built server | Built client directory |

## Layout

| Path | Responsibility |
|---|---|
| `src/domain/` | Pure engine shared by API and UI: dates, UTC instants, IANA zones/DST, intervals, calendar, policies, R-04 overtime, R-05 deficits, periods, edit reasons |
| `src/server/db/` | SQLite connection and versioned, checksummed migrations (`STRICT` tables, ownership keys, immutability and overlap triggers) |
| `src/server/auth/` | scrypt passwords, hashed revocable sessions, login rate limit |
| `src/server/services/` | Calendars, policies, periods, timesheet queries and commands, audit |
| `src/server/routes/`, `http/` | Hono routes, schemas, origin/CSRF and error handling |
| `src/client/` | React skeleton (sign-in, two-week view, clock in/out) |
| `tests/domain/` | Every scenario of `fixtures/overtime_cases.json`, `time_cases.json` and the deficit cases of `ledger_cases.json`, plus engine edge cases |
| `tests/integration/` | Fresh migrations, schema invariants, auth, two-user isolation, API rules |
| `scripts/smoke-built-server.mjs` | End-to-end check of the built server |
| `scripts/source-digest.mjs` | Source digest recorded in handoffs |
| `eslint.config.js` | Lint gate: `@typescript-eslint/no-deprecated` |
| `.editorconfig`, `.gitattributes` | UTF-8, LF, 2-space indentation (Python 4); CRLF only for Windows `.bat`/`.cmd`/`.ps1`; binary assets |

## API (WP1)

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

WP1 has no ledger postings, finalization, PDF or email; credits in responses are provisional (WP2/WP3).
