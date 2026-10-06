# WP4-PLAN dispatch brief

- Mission/task: timesheet-software-readiness / WP4-PLAN; package WP4; kind plan; attempt
  1; depends on WP3-ACCEPT (WP3 accepted).
  - The WP3 accept commit is b103923d7f412860b189f692cf23c11ee2915e86.
  - The accepted WP3 source is 49651c8bb91d56bf6c6966405257537ec7ca474b, digest
    c31c300c06ae4c750bf0080f304d3f87eae0a00280110d1a8eb6eb37ecf4ec72.
  - The expected HEAD is 3bdffbec685599b02c41c0a1f85931c8d90242f2. It adds the owner's
    `.claude/skills/readme-md` skill under GOV review, and its digest is aab8b32c….
  - Record the HEAD and digest you observe.
  - GOV-SKILL-GATE runs at the same time. Do not touch its files.
- Profile/routing: timesheet-planner with model override opus, reason `size_risk`
  (package decomposition across deployment, recovery and import; docs/08 rubric).
  Effort stays at the profile's high. Routing: size L, risk H, novelty yes.
  - Record in English.
  - This is read-only planning: no source edits.
- Read AGENTS.md from disk first, including the UI standards section. Then read:
  - docs/08 (routing rubric, commit points, package-final gate) and docs/09 (WP4
    section);
  - handoff/prompts/WP4_IMPLEMENT.md and WP4_REVIEW.md, and the canonical documents they
    name (docs/03, docs/06 and docs/07 at least; others where a dependency needs them);
  - reference/inputs/README.md (the sanitized template workbook rule);
  - handoff/delivery/WP3_HANDOFF.md, including the acceptance record and WP4
    carry-forward;
  - the final WP3 rechecks (WP3_RECHECK_A2.md, WP3_RECHECK_BC2.md);
  - the WP3 carried risks in handoff/delivery/STATE.json (read-only).
- Inspect the current source tree, configuration, scripts, migrations and tests
  read-only. Look for existing patterns:
  - configuration and environment loading;
  - DATA_DIR and private storage;
  - migrations and integrity checks;
  - the job runner;
  - health endpoints, if any;
  - smoke scripts;
  - the e2e fixture;
  - any workbook or spreadsheet parsing.
- Check read-only whether Docker or Podman is available on this machine (version only).
  Never pull or build images in this task.

## Required output (append under Results)

A. **WP4 scope summary.** List the requirement, rule and acceptance IDs it must satisfy
   (from WP4_IMPLEMENT, docs/06 and docs/07).
B. **Ordered task list** of bounded slices; prefer S/M and use L only when unavoidable.
   For each task give:
   - ID (WP4-T01…) and title;
   - size, risk and novelty;
   - profile and model per the docs/08 rubric, with an override reason if any;
   - exact owned paths;
   - dependencies;
   - covered IDs;
   - required tests and checks;
   - the freeze-commit point.

   Keep a single writer at a time. Name each new runtime or build dependency with its
   current non-deprecated version and the reason it is needed. Name pinned base images
   by digest strategy, never `latest`.
C. **WP3 carry-forward.** Say which task addresses each item, or record an explicit
   deferral with its rationale:
   - the recorded "through a share" marker on audit rows. It is required before any
     non-shared route writes day or session rows for another person; an import that
     writes another person's rows counts;
   - risks R1–R7 from the WP3 rechecks;
   - the hint shows a count, not dates;
   - a HEAD request on the shared PDF writes a download audit;
   - the reminder-repeat, TLS-as-temporary and send-before-PDF items;
   - F-Q6 open;
   - ADV-A-05;
   - any other item in the WP3 acceptance record.
D. **Lessons from WP2/WP3, built into acceptance checks:**
   - E-8 CSS tokens only for any UI;
   - season-independent tests;
   - no employee-derived data in admin or job responses;
   - red-first regression tests and mutation checks for integrity rules;
   - synthetic screenshots `*-synthetic.png` on the installed Edge channel;
   - raw logs only under `D:\.claude-tmp\timesheet\<task>`, masked copies in evidence;
   - no deletion inside the repository;
   - no interactive shells;
   - verify and digest run last;
   - each freeze brief stages its own brief.
E. **Package-final gate.** Cover:
   - commands for the image/installation dry-run and the restore;
   - the workbook preview/commit gate (source-cell provenance, source hash, idempotency
     and conflicts, explicit opening balance, the tracked template workbook with
     synthetic dated sheets);
   - the upgrade/rollback runbook check;
   - NAS target verification when available. Otherwise mark it unverified and give
     concrete owner setup steps.

   Audit scope: fresh opus auditors, with area audits if one context is not enough.
   Then the accept commit.
F. **Owner decisions needed.** List contradictions or ambiguities in canonical documents
   that need an owner decision. Give the exact file:line, the decision needed and a
   recommended option. Do not resolve them silently. Also list anything that needs the
   owner's machine, NAS or credentials. Never request credentials.
G. **Risks**, the expected number of dispatches and the critical path. Give no token or
   time estimates.

- Writable: this file and handoff/delivery/evidence/WP4-PLAN/ (read-only command
  outputs, masked, LF, single final newline). Everything else is read-only. No commits.
- Call Node 24 by its full path if you run anything. Use
  `D:\.claude-tmp\timesheet\WP4-PLAN` for temporary output.
- Never open an interactive shell. Never write into the repository root. Never redirect
  to /dev/null or nul.
- If a permission check denies a call, stop and report.
- Return at most 400 words, beginning with your self-reported model: a summary of the
  task list, the owner decisions needed, and the critical path.

## Results

(Planner appends here.)

### Run record (WP4-PLAN attempt 1)

- Self-reported model: claude-opus-5-5 (profile timesheet-planner, model override opus,
  reason size_risk; effort as configured by the profile, not observable here).
- Observed baseline: HEAD `3bdffbec685599b02c41c0a1f85931c8d90242f2` (as expected); `npm run
  digest` equivalent (`node scripts/source-digest.mjs`, Node v24.21.0) =
  `aab8b32cd69a8ba598dc91929290ec198107664e5bc42fb2616c7eb6da0a705d` over 724 files
  (as expected; it includes the three `.claude/skills/readme-md` files under GOV review).
  Working tree: only `handoff/` changes (board, checkpoint, GOV-SKILL briefs/evidence and
  this brief). Evidence: `evidence/WP4-PLAN/01-baseline.txt`.
- Container tooling on this machine (version queries only, nothing pulled or built):
  Docker 28.5.1 client and engine (Docker Desktop, WSL2), engine `linux/amd64`, Compose
  v2.40.2, buildx 0.29.1; Podman not installed (`02-container-tools.txt`).
- Registry reads (no install): `fflate` 0.8.3, `fast-xml-parser` 5.11.2, `yauzl` 3.4.0,
  `saxes` 6.0.0, `exceljs` 4.4.0, `xlsx` 0.18.5; none printed a `deprecated` field
  (`03-npm-view.txt`).
- Tracked template: SHA-256
  `47ef42d5e4a9b7aea0be545ed563d3d22987609b59bd846c1c08dec2d29c6331`, equal to the README
  value; sheets "Working
  Infos", "Holiday Dates", "Timesheet"; contains `calcChain.xml`, four tables, customXml,
  no `vbaProject.bin` (`04-template-workbook.txt`).
- Files written: this Results section and `handoff/delivery/evidence/WP4-PLAN/01..04-*.txt`
  (LF, masked; no profile path present). Raw outputs: `D:\.claude-tmp\timesheet\WP4-PLAN`.

### Observations from the source (read-only, at 3bdffbe)

Facts the plan depends on; each task below cites them.

- O1 Startup always migrates (`src/server/index.ts:27`); `migrate()` already uses `BEGIN
  EXCLUSIVE`, checksums and refuses a newer schema (`src/server/db/migrations.ts:43-90`).
  This is the rollback guard: an older binary refuses a newer DB. Six migrations exist.
- O2 `HOST` defaults to `127.0.0.1` (`config.ts:53`); there is no trusted-proxy setting and
  the login limiter keys on the socket address (`routes/auth.ts:17`). Behind the Synology
  reverse proxy every client would share one address bucket (30 failures per window).
- O3 Sessions are random 256-bit tokens stored hashed (`auth/sessions.ts:24-40`); the app has
  no session or token signing secret, although docs/07:9 lists "session/token secrets".
- O4 `/api/health` returns `{status:'ok'}` after `SELECT 1` (`app.ts:85-88`); no readiness
  (schema version, data directory writable) and no container health command.
- O5 No production bootstrap exists: users need a `calendar_id` (`0001_initial.ts:38`), and
  calendars/policies are created only by the development seed (`seed.ts`, refused in
  production by `cli.ts:78`). There is no password-change route (`admin.ts:78-79`, E-11).
- O6 `operations_state` (`0004_submission.ts:369-381`) has activation and heartbeat only: no
  backup status, disk capacity or outbound-pause state. The runner claims only the kinds it has
  handlers for (`runner.ts:96-108`), a natural seam for pausing send kinds without spending
  attempts.
- O7 Files: `FileStore` writes temp + fsync + rename before any DB row refers to the key;
  `sweep()` never removes a referenced key (`fileStore.ts:16-140`); the sweep is not scheduled.
- O8 `jobs` rows cannot be deleted (`jobs_no_delete`, `0004_submission.ts:283`), so any
  retention policy needs a migration.
- O9 `timesheets.imported_unverified` exists (`0004_submission.ts:383`) and automation and
  reminders skip such periods (`automation.ts:204`, `notifications.ts:159,195,310,391`), but
  finalization/sign-off does not check it.
- O10 `ot_ledger.entry_type` allows only credit, deficit_debit, correction, leave_consumption,
  leave_reversal (`0002_ot_ledger.ts:84`); credit/debit need a `work_date` and a sign. An
  opening balance has no representation; adding a type means a table rebuild of an immutable,
  FK-referenced table (`revision_ledger_lines`, self-reference).
- O11 Audit rows carry actor and owner only (`0001_initial.ts:236-253`, `audit.ts`); the
  "through a share" attribution is inferred from operation codes (`sharedActs.ts:26-40`). The
  shared PDF download audit is written in `services/shares.ts:385`; Hono serves `HEAD` through
  the `GET` handler, so a `HEAD` writes `share.pdf_download`.
- O12 `work_sessions.source` allows only manual/clock (`0001_initial.ts:167`); an imported
  session would need a schema change. The template's clock cells were blank in the original.
- O13 Build: Node 24.21.0 (`.nvmrc`), `better-sqlite3` 13.0.3 ships N-API prebuilds for
  linux glibc/musl x64/arm64 and install scripts are denied (`package.json` `allowScripts`,
  DEVELOPMENT.md:10); fonts come from the `dejavu-fonts-ttf` package, not the OS. No
  Dockerfile, `.dockerignore`, Compose file or `.env.example` exists.
- O14 The seed reads `reference/examples/*.json` at run time (`seed.ts:30-31`).

### A. WP4 scope summary

- Requirements: FR-15 (Docker, persistence, backup/restore, recovery), FR-16 (controlled
  Excel import, evidenced opening OT balance), FR-01/FR-14 regressions (ownership, audit).
- Acceptance: AC-11 (clean Docker install/restart/upgrade; consistent backup under writes
  restores DB/files/hashes in isolated dry-run), AC-12 (template with synthetic dated sheets
  flags defects; identical re-import adds no records, OT, sign-offs or sends), AC-15 (safe
  health/backup status, compatible rollback, restored instance outbound paused). Regression
  guards: AC-01 (isolation, admin sees no details), AC-03 (no duplicate ledger events),
  AC-08 (jobs survive restart, uncertain never blindly retried), AC-16 (share boundary).
- Rules: docs/03 "Records" `imports` row, "Atomicity" (short transactions, no network inside,
  atomic rename), "API and hosting boundary" (health has no personal data; one instance;
  host-local storage; never trust client proxy headers); docs/07 all sections (pinned
  multi-stage image, non-root, private persistence, secret-free examples, one-time expiring
  admin bootstrap, migrate once under exclusive lock, WAL-consistent backup with manifest,
  isolated restore with sending paused, reconciliation, versioned migrations/rollback,
  status view fields, workbook preview/commit rules); docs/05:26 (imported history never
  automated); docs/01:41 and reference/inputs/README.md (template only, no inferred sign-off,
  sending or zero OT; template never re-saved and never in the image); docs/02 R-06 (ledger
  invariants for the opening balance); docs/06 "Layers" and "Operations evidence".
- WP3 carry-forward the plan must address: section C.

### B. Ordered task list

Single writer throughout; every task ends with its own freeze commit by
`timesheet-committer` (docs/08 "Commit points"); the next task starts from that freeze.
Migration numbers are fixed by this order. Every task inherits the standard checks of
section D. "Profile/model" follows docs/08; "override" is the `model_override_reason`.

Checkpoint 1 (docs/09: image/installation dry-run and restore) = T01–T07.
Checkpoint 2 (workbook preview and operational handoff) = WP4-DEC, T08–T13.

**WP4-T01 Container-ready configuration, readiness and trusted proxy** — M / H / partial
novelty. worker-high, sonnet (no override).
- Owned: `src/server/config.ts`, `src/server/app.ts`, `src/server/index.ts`,
  `src/server/routes/auth.ts`, new `src/server/http/clientAddress.ts`, new `.env.example`,
  `scripts/smoke-built-server.mjs`, `tests/integration/config.test.ts`,
  `tests/integration/auth.test.ts`, new `tests/integration/health.test.ts`.
- Depends: WP3-ACCEPT (and GOV-SKILL accepted or its files untouched).
- Content: production requires an explicit absolute `DATA_DIR` and `DATABASE_PATH`;
  `HOST` documented for containers (`0.0.0.0` only inside the container network);
  `TRUSTED_PROXY_ADDRESSES` (exact list, default none) — only when the socket peer is in the
  list is the right-most untrusted `X-Forwarded-For` hop used for the login limiter; otherwise
  headers are ignored (O2). `/api/health` stays liveness; new `/api/ready` returns only
  `{status, schema:{expected, actual}}` style booleans/ints (no paths, names, counts of
  people), 503 when the schema or the data directory is not usable. `.env.example` lists every
  variable with safe placeholders, capture mode, no secret values, and states that no session
  secret is needed (O3, see F-6).
- Covers: AC-15 (safe health), docs/03 hosting boundary, docs/07:9-11.
- Tests: red-first spoofed `X-Forwarded-For` from an untrusted peer is ignored; trusted peer
  uses the forwarded hop; readiness reveals no data (assert exact key allowlist); production
  config refuses a relative or missing `DATA_DIR`; smoke checks `/api/ready`.
- Freeze: WP4-T01-FREEZE.

**WP4-T02 Recorded "through a share" marker and HEAD download audit** — M / H / existing
pattern. worker-high, sonnet.
- Owned: new `src/server/db/migrations/0007_audit_access.ts`, `src/server/db/migrations.ts`,
  `src/server/services/audit.ts`, `src/server/services/sharedActs.ts`,
  `src/server/services/shares.ts`, `src/server/services/history.ts`,
  `src/server/services/timesheetCommands.ts`, `src/server/services/dayEntries.ts`,
  `src/server/routes/shares.ts`, `src/server/types.ts` (only the command-context field),
  `tests/integration/{migrations,sharing-matrix,history,review-grantee-changes,actor-subject,pdf-download}.test.ts`.
- Content: nullable `audit_events.via_share_id` (FK to `timesheet_shares`) added with `ALTER
  TABLE ADD COLUMN` (no rewrite of immutable rows); every write through `/api/shared/:ownerId`
  records it; `sharedActCondition` reads the marker, with the operation-code inference kept
  only for legacy rows whose marker column is NULL and `occurred_at` precedes the migration
  (recorded in `schema_migrations.applied_at`). The Review hint and History attribution read
  the same condition. A `HEAD` on the shared PDF route returns headers but writes no
  `share.pdf_download` audit (O11). Optional, only if the hint query is rewritten anyway: bound
  it by the period's work dates (RBC2 R1); otherwise leave it.
- Covers: WP3 carry item 15 / R7, WP3_REVIEW_C R1, AC-16, FR-14.
- Tests: red-first — an audit row written by a non-shared route with actor ≠ owner and a
  day/session operation code must not be attributed as shared (fails at 3bdffbe); every
  shared write route records the marker (extend the drift test); `HEAD` writes no audit;
  migration on a populated v6 DB keeps legacy attribution identical. Mutation: drop the marker
  write in one shared route → a test fails.
- Freeze: WP4-T02-FREEZE.

**WP4-T03 Production bootstrap: company calendar and expiring one-time admin setup** — M / H
/ novel (auth). worker-high, sonnet; escalate to opus (`escalation`) under the docs/08 caps.
- Owned: new `src/server/db/migrations/0008_bootstrap.ts`, `src/server/db/migrations.ts`, new
  `src/server/services/bootstrap.ts`, `src/server/cli.ts`, `src/server/routes/auth.ts`,
  `src/server/http/schemas.ts`, new `src/client/SetupScreen.tsx`, `src/client/App.tsx`,
  `src/client/api.ts`, `src/client/styles.css` (tokens only), new
  `tests/integration/bootstrap.test.ts`, new `tests/e2e/setup.spec.ts`.
- Content (routine design within docs/07:7,16): `cli.js bootstrap --config <file>` validates
  an owner-supplied calendar/policy/payroll JSON (shape of `reference/examples/*.json`, no
  personal data) and creates the company calendar and default policy once; then issues a
  single-use setup token (only its hash stored, 60-minute expiry, printed once to the
  operator's terminal, never to the server log). `POST /api/auth/bootstrap {token, email,
  display_name, password}` creates the first admin; GET never consumes it (AC-09 pattern);
  refused permanently once any admin exists; audited (actor NULL = system event, per RBC-01).
- Covers: docs/07:7,16 (bootstrap, disable), FR-01, AC-09 pattern, O5.
- Tests: red-first expired/replayed/wrong token, second bootstrap after an admin exists, token
  never in logs or responses; e2e setup flow on Edge with a `setup-synthetic.png` screenshot.
- Freeze: WP4-T03-FREEZE.

**WP4-T04 Pinned image, Compose example and container smoke** — M / H (image privacy
boundary) / novel. worker-high, sonnet.
- Owned: new `Dockerfile`, `.dockerignore`, `compose.example.yaml`, new
  `scripts/container-drill.mjs`, `package.json` (scripts only), `.gitignore` (drill output
  only if needed).
- Content: multi-stage build — `FROM node:24.21.0-trixie-slim@sha256:<multi-arch index
  digest>` for build and runtime (digest recorded by the worker with `docker buildx imagetools
  inspect` and stored as an `ARG` plus a comment naming the tag; never `latest`; fallback
  `bookworm-slim` only if the prebuilt binding fails, recorded). `npm ci` then `npm run build`
  in the build stage; runtime stage gets `dist/`, production `node_modules` (`npm ci --omit=dev
  --ignore-scripts` is valid because better-sqlite3 ships prebuilds, O13) and `package.json`
  only — no `reference/inputs`, `handoff/`, `tests/`, `.claude/`, `.env*`, docs. Runs as a
  fixed non-root UID/GID, `/data` volume (DB, private files, capture), read-only root
  filesystem plus `/tmp` tmpfs, `HEALTHCHECK` via a Node one-liner against `/api/ready` (slim
  has no curl), `NODE_ENV=production`, `OUTBOUND_MODE=capture`. Compose example: one service,
  bind-mounted host-local `/data`, `env_file` with mode 600 note, no published port by
  default except loopback, `restart: unless-stopped`, stop grace for the runner.
  `container-drill.mjs` stage 1: build (amd64), start on a fresh volume, wait healthy, record
  schema version, restart, check persistence (synthetic data via the API), inspect the image
  for forbidden files and the runtime user.
- Covers: AC-11 (clean install, restart), docs/07:7-11, docs/03:50.
- Tests/checks: drill stage 1 green on Docker Desktop; `docker image inspect` user ≠ 0;
  forbidden-file scan of the image file list (`*.xlsx`, `.env`, `handoff`, `tests`); optional
  `--platform linux/arm64` build under emulation recorded as emulation only.
- Freeze: WP4-T04-FREEZE.

**WP4-T05 Consistent backup under writes and backup status** — L / H / novel. worker-high,
opus, override `novelty` (docs/08 row "restore under writes").
- Owned: new `src/server/ops/backup.ts`, new `src/server/ops/manifest.ts`, `src/server/cli.ts`,
  new `src/server/db/migrations/0009_operations_backup.ts`, `src/server/db/migrations.ts`,
  `src/server/services/operationsStatus.ts` (data only, no UI), new
  `tests/integration/backup.test.ts`, `tests/support/concurrency.ts`,
  `scripts/container-drill.mjs` (stage 2).
- Content: `cli.js backup --to <dir>` (allowed in production; target outside `DATA_DIR`) uses
  the better-sqlite3 online backup API from its own connection, then runs `PRAGMA
  integrity_check` and `foreign_key_check` on the copy, reads the referenced storage keys from
  the copy (attachments), copies those files, hashes them and compares with the recorded
  SHA-256, writes `manifest.json` (app version, schema version, UTC instant, integrity result,
  per-file hash/size, DB hash; no names, emails or paths of people), writes atomically
  (temp dir + rename), records success/failure and time in `operations_state`. Consistency
  argument to be proven by test, not asserted: files are immutable and renamed into place
  before their row commits (O7), so every key in the snapshot exists; if the worker chooses
  docs/07:28's brief pause instead, it must be a DB-level write lock with a bounded timeout.
  Optional `--prune` with the docs/07:26 7/4/6 policy, applied only to backup folders the tool
  created (F-5).
- Covers: AC-11 (backup under writes), docs/07:26-28, FR-15.
- Tests: red-first backup during a concurrent writer loop (finalizations producing PDFs and
  signatures, day edits, ledger posts) — restored copy passes integrity, FK check, every
  referenced file present with matching hash, ledger sum equals the source at the snapshot;
  mutation: copying the live main file without WAL (or skipping file hashing) must fail a test.
- Freeze: WP4-T05-FREEZE.

**WP4-T06 Outbound pause, isolated restore and reconciliation** — L / H / novel. worker-high,
opus, override `novelty`.
- Owned: new `src/server/ops/restore.ts`, `src/server/cli.ts`, new
  `src/server/db/migrations/0010_outbound_pause.ts`, `src/server/db/migrations.ts`,
  `src/server/jobs/runner.ts`, `src/server/jobs/jobStore.ts`, `src/server/index.ts`,
  `src/server/services/operationsStatus.ts`, new `tests/integration/restore.test.ts`,
  `tests/integration/jobs-restart.test.ts`, `scripts/container-drill.mjs` (stage 3).
- Content: persisted `operations_state.outbound_paused_at/_reason`; while set, the runner does
  not claim `send_email`/`send_reminder` (no attempt spent, nothing sent, capture included);
  PDF rendering and scans may run. `cli.js restore --from <backup> --to <empty dir>` verifies
  manifest hashes, integrity and schema (refuses a newer schema; never writes into the live
  `DATA_DIR`; refuses a non-empty target), copies DB and files, sets the pause with reason
  `restored`, marks any `leased` send job and `sending`/`preparing` attempt for explicit
  reconciliation (uncertain, never resent, consistent with AC-08), and prints counts and the
  manifest check only. `cli.js outbound resume --confirm` clears the pause only when no
  attempt awaits reconciliation; audited. Startup logs the pause state. Never run two queues
  on the same data (runbook).
- Covers: AC-15 (restored instance outbound paused), AC-11 (isolated restore with hashes and
  balances), AC-08 regression, docs/07:30-32.
- Tests: red-first restored DB with queued send jobs → a runner pass sends nothing and spends
  no attempt; resume refused while uncertain attempts remain; restore refuses a mismatched
  file hash and a newer schema; balances and revision counts of the restored copy equal the
  source. Mutation: remove the kind filter → a test fails.
- Freeze: WP4-T06-FREEZE.

**WP4-T07 Administrator operations status and maintenance jobs** — M / H (admin privacy) /
existing pattern. worker-high, sonnet.
- Owned: `src/server/services/operationsStatus.ts`, `src/server/routes/admin.ts`,
  `src/server/jobs/runner.ts`, new `src/server/jobs/sweepJob.ts`, optional new migration
  `0011_job_retention.ts` (only if F-4 is answered (a)), `src/client/components/OperationsStatus.tsx`,
  `src/client/components/AdminUsers.tsx` (only for F-3), `src/client/styles.css` (tokens
  only), `src/client/adminModel.ts`, `tests/integration/operations-status.test.ts`,
  `tests/client/adminModel.test.ts`, `tests/e2e/admin-status.spec.ts`.
- Content: status adds last backup result/time and age, data-volume free space
  (`fs.statfs`), outbound mode and pause state; per person a "not set up" flag if F-3 (a);
  daily scheduled orphan sweep (WP3 carry item 4) with the existing grace; job retention only
  per F-4.
- Covers: docs/07:36, AC-15 (backup status), AC-01 (admin boundary), WP3 carry items 4 and
  RBC2 R2.
- Tests: exact key allowlist of the admin JSON (no employee-derived data beyond docs/03:34);
  sweep never removes a referenced file (mutation: drop the reference check → fails);
  `admin-status-synthetic.png` desktop and mobile.
- Freeze: WP4-T07-FREEZE.

**WP4-DEC Record the owner's WP4 decisions in canonical documents** — S / L / docs. worker,
sonnet. Runs as soon as the owner answers F-1..F-4 (may run before T05 if answers arrive; it
only blocks T08).
- Owned: `docs/03_ARCHITECTURE_AND_DATA.md`, `docs/07_DEPLOYMENT_AND_OPERATIONS.md`,
  `docs/10_DECISIONS_AND_SOURCES.md` and their `.vi.md` pairs.
- Checks: parity, `validate_package.py --preflight`. Freeze: WP4-DEC-FREEZE.

**WP4-T08 Safe workbook reader and synthetic dated-sheet generator** — M / H (untrusted
input) / novel. worker-high, sonnet.
- Owned: new `src/server/import/xlsxReader.ts`, new `src/server/import/templateMapping.ts`
  (mapping version 1), new `tests/support/syntheticWorkbook.ts`, new
  `tests/integration/workbook-reader.test.ts`, `package.json`, `package-lock.json`.
- New runtime dependencies: `fflate` 0.8.3 (zero-dependency ZIP inflate with per-entry size
  control; also builds synthetic copies by ZIP-level cloning, so the tracked template is never
  re-saved by a spreadsheet library) and `fast-xml-parser` 5.11.2 (XML to objects with entity
  processing and DOCTYPE disabled). Rejected: `exceljs` 4.4.0 (pulls old `unzipper`/`archiver`
  chains likely to print install deprecation warnings; rewrites workbooks), registry `xlsx`
  0.18.5 (stale registry build). The worker re-runs `npm view <pkg> deprecated` and records
  that `npm ci` prints no deprecation line.
- Content: limits (compressed size, entry count, per-entry and total inflated size, no
  `vbaProject.bin`/macro content types accepted as code, external links ignored, formulas
  never evaluated; cached formula values reported as "formula cache, not authoritative");
  cell-level provenance (`sheet!A1`); detection of the README defects (8.5-hour formula, X24
  omitting Sunday Z16/Z23, `TODAY()` in W26), floating holidays, unknown labels, duplicate
  dates, sheets whose name is not a payroll date. The generator copies the template bytes in
  memory and adds synthetic dated sheets (synthetic names, `example.invalid`, dates in a
  test range); the tracked file's hash is asserted unchanged.
- Covers: AC-12 (preview flags defects), docs/07:42-44, reference/inputs/README.md.
- Tests: zip bomb, oversized entry, DOCTYPE/entity payload, macro-bearing package, unknown
  label, duplicate date — each red-first; season-independent (no wall clock).
- Freeze: WP4-T08-FREEZE.

**WP4-T09 Import preview and commit service and API** — L / H / novel. worker-high, opus,
override `novelty`.
- Owned: new `src/server/db/migrations/0012_imports.ts` (number shifts to 0011 if T07 adds
  none), `src/server/db/migrations.ts`, new `src/server/services/workbookImport.ts`, new
  `src/server/routes/imports.ts`, `src/server/app.ts` (route mount and a route-scoped upload
  limit like the signature exception), `src/server/http/schemas.ts`,
  `src/server/services/finalization.ts` (only the F-2 guard), new
  `tests/integration/workbook-import.test.ts`.
- Content: `imports` table per docs/03:32 (owner, source SHA-256, mapping version, state
  preview/committed, idempotency key = owner + source hash + mapping version, private stored
  source via the file store, report JSON). Preview stores a report: mapped days with
  source cells, unknown labels, duplicates, conflicts with existing app rows. Commit requires a
  decision per conflict (never overwrite a finalized period; default nothing) and writes, in
  one short transaction, `timesheets.imported_unverified = 1`, day entries
  (`category_source='explicit'`), no sessions (O12), no ledger events, no revisions,
  sign-offs, jobs or attempts (per F-2), audit rows with actor = owner. A repeated identical
  commit is a no-op returning the first batch. Who may import follows F-1 (recommended: the
  owner only, under `/api/imports`, never an admin for another person).
- Covers: AC-12, FR-16, docs/07:42-46, docs/05:26, AC-01, AC-03.
- Tests: red-first identical re-import changes no row count in timesheets, day_entries,
  work_sessions, ot_ledger, timesheet_revisions, signoffs, jobs, delivery_attempts; another
  user cannot read or commit someone's preview (404); admin gets 403/404; imported periods
  get no reminder, overdue, deadline finalization or send across simulated deadlines; a
  conflicting day without a decision refuses the commit. Mutation: remove the idempotency
  check → a test fails.
- Freeze: WP4-T09-FREEZE.

**WP4-T10 Explicit opening OT balance** — M / H (ledger) / novel. worker-high, opus, override
`novelty` (ledger; docs/08 names ledger slices for opus).
- Owned: new `src/server/db/migrations/00NN_ot_opening_balance.ts` (next free number),
  `src/server/db/migrations.ts`, `src/server/services/ledger.ts`, `src/server/services/otLeave.ts`
  (only if the append path must learn the new type), `src/server/routes/ot.ts`,
  `src/server/http/schemas.ts`, `src/server/services/otEvidence.ts` (export label),
  `tests/integration/{ledger,migrations,ot-api,evidence-export}.test.ts`.
- Content: per F-3, an `opening_balance` entry: explicit signed non-zero minutes, as-of date,
  reason and evidence reference, owner only, unique source key per user (a repeat is a
  no-op; a change is a reasoned correction). Preferred schema: rebuild `ot_ledger` with the
  extra type following SQLite's documented 12-step procedure inside the exclusive migration
  (`defer_foreign_keys`, recreate indexes and triggers, `foreign_key_check` before commit),
  tested on a fully populated DB at the previous schema version; the worker records why if it chooses another representation.
- Covers: FR-16, docs/07:46, docs/02 R-06 (docs/02:66), AC-03.
- Tests: red-first double submission posts once; concurrent posts post once; balance equals
  sum of deltas; migration keeps every existing row, FK and trigger (mutation: drop a trigger
  in the rebuilt table → the immutability test fails).
- Freeze: WP4-T10-FREEZE.

**WP4-T11 Import and opening-balance screens** — M / M / existing UI pattern. worker-high,
sonnet.
- Owned: new `src/client/ImportScreen.tsx` (or a Settings panel), new
  `src/client/components/ImportPreview.tsx`, new `src/client/components/OpeningBalanceForm.tsx`,
  new `src/client/importModel.ts`, `src/client/App.tsx`, `src/client/api.ts`,
  `src/client/components/AppShell.tsx`, `src/client/styles.css` (tokens only), new
  `tests/client/importModel.test.ts`, new `tests/e2e/import.spec.ts`.
- Content: upload → preview table with source cells and flags → per-conflict decision →
  commit; imported periods show an "Imported, unverified" status; opening-balance form with
  minutes, date, reason, evidence and a confirmation step.
- Tests: e2e on Edge desktop and mobile with a generated synthetic workbook,
  `import-preview-synthetic.png`, `opening-balance-synthetic.png`; second commit shows "already
  imported".
- Freeze: WP4-T11-FREEZE.

**WP4-T12 Full operations drill: upgrade, rollback and import no-op** — M / H / builds on
T04–T06. worker-high, sonnet.
- Owned: `scripts/container-drill.mjs`, `package.json` (script `drill:container`), new
  `tests/integration/upgrade.test.ts`.
- Content: drill stages 4–6 — upgrade: a v6 database produced by the accepted WP3 build
  (`git archive 49651c8` into the task temp folder, `npm ci`, `cli.js seed` with synthetic
  data) is mounted into the new image and migrates once; rollback: the WP3 build's
  `cli.js migrate` against the upgraded DB must refuse (O1), then the paired pre-upgrade backup
  is restored and the WP3 build starts on it; import: the synthetic workbook is imported twice
  through the API in the container and table counts are unchanged after the second commit;
  outbound paused after restore is read from `/api/admin/operations`.
- Tests: `npm run drill:container` exits 0 and prints per-stage PASS lines and counts only.
- Freeze: WP4-T12-FREEZE.

**WP4-T13 Runbook, developer docs and WP4 HANDOFF** — M / L / docs. worker, sonnet.
- Owned: new `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md` (install on Synology, NAS
  verification checklist, bootstrap, backup schedule via the host Task Scheduler, isolated
  restore, reconciliation, resume, upgrade/rollback, image digest refresh, retention,
  independent host alert), `DEVELOPMENT.md`/`.vi.md`, `README.md`/`.vi.md`,
  `handoff/delivery/WP4_HANDOFF.md`/`.vi.md`.
- Checks: EN/VI parity, `validate_package.py --preflight`, link check, every command in the
  runbook executed by T12's drill or marked "owner NAS step, unverified".
- Freeze: WP4-T13-FREEZE (package freeze for the gate).

### C. WP3 carry-forward disposition

| Item | Disposition |
|---|---|
| Recorded "through a share" marker (carry 15, R7) | WP4-T02, before any import code (T09). Even with F-1 (a) the marker removes the inference for every later route. |
| HEAD on shared PDF writes a download audit (REVIEW_C R1) | WP4-T02 (same audit path). |
| Hint shows a count, not dates | Deferred to WP5 backlog: presentation only; no WP4 rule or AC; T02 does not change the hint's output. |
| Hint read has no time bound (RBC2 R1, A R6 part) | Optional inside T02 only if the query is rewritten; otherwise WP5 backlog (35.5 ms at 50 000 rows). |
| R1 long holiday label ellipsized | Deferred to WP5 (PDF presentation, owner preference). |
| R2 signature count outside the transaction | Deferred to WP5 backlog (no rule ID; bounded overshoot). |
| R3 | Closed by H-Q1 (a). |
| R4 reviewed hash includes balance; R5 sign-off before period end | Deferred: accepted interpretations, no rule violated; WP5 UX review. T10 must keep R4 behaviour unchanged (opening balance makes open reviews stale, expected). |
| R6 hint and payload in two transactions | Deferred to WP5 backlog (integrity unaffected). |
| R8 / RBC2 R2 never-configured accounts | Owner decision F-3; if (a), WP4-T07 adds the admin "not set up" flag; the pilot packet (WP5) states the behaviour either way. |
| R9 / RBC2 R6 seed events show as automatic | Accepted; T03's bootstrap events are system events by the same rule; noted in the runbook. |
| RBC2 R3 deadline scan rechecks never-configured periods | Deferred (cost fine at this scale); revisit with F-4 retention. |
| Reminder repeat, TLS-as-temporary, send-before-PDF (carry 1–3) | Deferred to WP5 pilot preparation: they only matter with real SMTP, which stays off in WP4; T06's pause must cover reminders. WP5 pilot packet must state them; F-7 asks the owner about at-most-once reminders. |
| Job-row retention and unscheduled orphan sweep (carry 4) | Sweep scheduled in WP4-T07; retention per owner decision F-4. |
| Carry 5 (reminder capture coverage), 7 (raw History operation names, badge no polling), 8, 9, 10, 11, 12, 14 | Not WP4 scope; carried unchanged to WP5 backlog. |
| Test gaps: activation cleared mid-scan, `not_active` guard alone, `before_account` alone | Deferred to WP5 unless the owner asks; T06 adds a restore-with-activation test, which exercises the guard path once. |
| F-Q6 | Stays open; WP4 changes no holiday-preview behaviour. |
| ADV-A-05 (duplicate append path) | Deferred; T10 must add the new type to the single shared append path if it touches `otLeave.ts`, and must not create a third path. |
| WP2 B4 optional items | Deferred to WP5 polish. |
| Docker, backup/restore (Deferrals) | WP4-T04..T07, T12; pilot packet stays WP5. |

### D. Lessons built into every task's acceptance

- UI (T03, T07, T11): AGENTS.md UI section and E-8 — read `src/client/styles.css` first; new
  values only as custom properties; `--radius` 4px, `--transition` on interactive states,
  `--shadow-panel` for panels; no hard-coded colours/spacing (grep the diff).
- Season independence: deterministic clocks and fixed synthetic dates; no test reads the
  wall clock or depends on today's period.
- No employee-derived data in admin, health, readiness, CLI or job output: exact key
  allowlists in tests; CLI prints counts only.
- Integrity rules (marker, pause, idempotent import, opening balance, backup hashes, bootstrap
  single use): red-first test recorded failing on the pre-change source, plus one mutation
  check with the source restored byte for byte.
- Screenshots: `*-synthetic.png`, installed Edge channel (`E2E_CHANNEL`), desktop and mobile.
- Logs: raw only under `D:\.claude-tmp\timesheet\<task>`; masked `.txt` copies in
  `handoff/delivery/evidence/<task>/` (profile segment replaced by `<user>`).
- No deletion inside the repository (temp dirs only outside it); no interactive shells
  (`docker compose run` only with explicit non-TTY flags; no `cmd.exe /c`); never kill
  unrelated processes; drill containers and volumes use a task-unique project name and are
  removed only by name.
- Order inside every task: edits → tests → `npm run verify` → e2e if UI → precommit-check →
  `npm run digest` last; each freeze brief stages its own brief path.
- Lint `no-deprecated` and no runtime/toolchain deprecation line (including `npm ci` and
  `docker build` output).

### E. Package-final gate (WP4-GATE, verifier, sonnet) and audits

Clean export of the freeze commit outside Dropbox (`D:\.claude-tmp\timesheet\WP4-GATE\src`),
Node 24.21.0 first on PATH, Docker Desktop, capture only.

1. `npm ci` (no deprecation line); `npm run verify` (typecheck, lint, tests, build, smoke
   incl. `/api/ready`); `npm run test:e2e` (Edge; expect WP3's 127/5 baseline plus new specs).
2. Image/installation dry-run and restore: `npm run drill:container -- --work
   D:\.claude-tmp\timesheet\WP4-GATE\drill` → stages: build with the pinned digest; clean
   volume start; migrations once (log); `/api/ready`; bootstrap (calendar + token + admin);
   two synthetic accounts and isolation probe; capture a synthetic submission and inspect the
   PDF; restart persistence; backup while a writer loop runs; isolated restore with manifest
   and file hashes, representative balances and revision counts equal; outbound paused and no
   send attempt after a runner pass; resume refused while reconciliation is pending; image
   forbidden-file scan and non-root user.
3. Workbook gate: generated synthetic dated sheets on the tracked template; preview lists
   source cells, source SHA-256 equals `sha256` of the uploaded bytes, mapping version 1, the
   three README defects flagged, unknown labels/duplicates/conflicts reported; commit with
   explicit conflict decisions; second identical commit adds nothing (table counts); opening
   balance requires minutes, date, reason, evidence and posts once; imported periods get no
   reminders, deadlines or sends across a simulated deadline; the tracked template hash is
   still `47ef42d5e4a9b7aea0be545ed563d3d22987609b59bd846c1c08dec2d29c6331`.
4. Upgrade/rollback runbook check: drill stages 4–5 (v6 DB from `49651c8` upgraded; old binary
   refuses; paired backup restored and old binary starts); each runbook command maps to a
   drill step or is labelled an owner NAS step.
5. NAS target: NOT VERIFIED unless the owner supplies access; record the owner steps in F
   below. An arm64 emulated build, if run, is labelled emulation, not target evidence.
6. `node scripts/precommit-check.mjs`; `python handoff/delivery/validate_package.py
   --preflight`; `python handoff/delivery/validate_orchestration.py`; `python
   handoff/delivery/check_recovery.py`; then `npm run digest` last (and the `git ls-tree`
   digest form, as WP3-REGATE3).

Audits (fresh, opus, xhigh, no WP4 author, digest before/after, WP4_REVIEW): AUDIT-A
operations (T01, T03–T07, T12: config, proxy, bootstrap, image boundary, WAL-consistent
backup, restore isolation, pause/reconciliation, rollback, admin status privacy; AC-11, AC-15,
AC-08/AC-01 regressions); AUDIT-B data (T02, T08–T11: marker, untrusted workbook parsing,
idempotency/conflicts, opening balance ledger, imported history never automated, UI; AC-12,
AC-16, AC-03, AC-01, FR-16). The two may run in parallel (read-only). Then WP4-ACCREC and the
accept commit (WP4-ACCEPT).

### F. Owner decisions needed (recommendations; nothing resolved silently)

- **F-1 Who imports whose workbook.** docs/03:46 lists "users/import" with administration,
  while docs/03:34 forbids administrators from seeing timesheet details, which an import
  preview shows. Recommend (a): the owner imports only their own workbook (actor = owner);
  administrators cannot import for others. (b) operator/admin import for another person needs
  the T02 marker plus a privacy exception. Blocks T09.
- **F-2 What an imported period is.** docs/07:44-46 and docs/01:41 say import as
  `imported_unverified` and never automate, but say nothing about OT credits or a later
  sign-off; finalization does not check the flag (O9). Recommend (a): imported periods post no
  ledger events, cannot be signed or submitted (409 `imported_period`), and are read-only
  history; the explicit opening balance is the only OT carry-in, so nothing is counted twice.
  Blocks T09.
- **F-3 Opening balance shape.** docs/07:46 requires minutes, date, reason and evidence but not
  sign, uniqueness or schema; docs/02:66 allows truthful negative balances. Recommend (a):
  signed non-zero minutes, one per user, changed only by a reasoned correction, stored as a new
  ledger entry type (table rebuild, O10). Blocks T10. Also: never-configured accounts — show an
  admin "not set up" flag (docs/03:34 allows settings flags) and no employee overdue warning
  (recommend (a)); affects T07.
- **F-4 Job-row retention** (WP3 carry 4; `jobs_no_delete`, O8). Recommend (a): delete only
  succeeded `deadline_scan`/`reminder_scan` rows older than 30 days through a migration-scoped
  trigger exception; never delivery, PDF or send rows. (b) keep everything and monitor disk.
- **F-5 Backup retention and destination** (docs/07:26). Recommend: implement the suggested
  7/4/6 pruning limited to tool-created folders; the separate-device copy is an owner setup
  step (Synology Hyper Backup or USB), not app code.
- **F-6 docs/07:9 "session/token secrets"**: the app needs none (O3). Recommend: amend the
  sentence (EN/VI) in WP4-DEC to "no application session secret; SMTP credentials only".
- **F-7 (WP5, for awareness)**: at-most-once reminders on real SMTP and TLS certificate errors
  as permanent; E-11 temporary passwords with no change route (docs/10:108, O5). Not WP4
  blockers.

Needs the owner's machine, NAS or credentials (never requested in chat):
1. NAS model, DSM version, `uname -m` (x86_64 vs aarch64), Container Manager availability.
2. A host-local volume path for `/data` (not SMB/NFS, docs/03:50) and a separate backup path;
   the UID/GID the container should run as and folder permissions.
3. Reverse-proxy hostname, HTTPS certificate, the proxy's internal address for
   `TRUSTED_PROXY_ADDRESSES`, NTP enabled.
4. Running the runbook's install, drill and restore on the NAS (image pulled or built there);
   until then NAS results are NOT VERIFIED.
5. SMTP credentials stay unused in WP4 (capture only); they belong to the WP5 pilot packet.

### G. Risks, dispatches and critical path

Risks: (1) the `ot_ledger` rebuild (T10) on an immutable, FK-referenced table — mitigated by
a populated-DB migration test and opus; (2) backup consistency proven only on Docker
Desktop/NTFS-backed WSL, not on Btrfs/ext4 of the NAS; (3) arm64 untestable natively here;
(4) untrusted XLSX parsing (zip bombs, entities); (5) owner answers F-1..F-3 gate the import
chain; (6) e2e environmental `ERR_NO_BUFFER_SPACE` recurrence (rerun once, record);
(7) Dropbox locks during `npm ci` in the checkout — gate uses a clean export; (8) the drill
uses `git archive 49651c8`, which must not touch the checkout.

Dispatches (base, without fix rounds): 14 implementation/doc tasks (T01–T13 and DEC) + 14
freezes + 1 gate + 2 audits + 1 acceptance record + 1 accept commit = 33. WP3 needed three
fix rounds; budget 1–2 rounds of (fix, freeze, regate, recheck) ≈ 4–8 more, so 37–41 expected.

Critical path (single writer): WP4-T01 → T02 → T03 → T04 → T05 → T06 → T07 → [WP4-DEC after
owner answers F-1..F-3] → T08 → T09 → T10 → T11 → T12 → T13 → WP4-GATE → AUDIT-A ∥ AUDIT-B
→ ACCREC → ACCEPT. Owner answers are off the critical path only if they arrive before T07
finishes; ask them now.
