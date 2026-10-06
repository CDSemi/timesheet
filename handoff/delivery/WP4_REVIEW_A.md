# WP4 independent review — area A (operations)

Form: [REVIEW](../templates/REVIEW.md). Translation: [WP4_REVIEW_A.vi.md](WP4_REVIEW_A.vi.md). Review prompt: [WP4_REVIEW](../prompts/WP4_REVIEW.md); dispatch brief and task record: [WP4-AUDIT-A](tasks/WP4-AUDIT-A.md). Evidence: `handoff/delivery/evidence/WP4-AUDIT-A/` (index in `00-README.txt`).

- **Package/date/reviewer and observable model/effort:** WP4, area A (operations: configuration and proxy, bootstrap, image boundary, WAL-consistent backup and pruning, isolated restore, outbound pause and reconciliation, upgrade and rollback with the migration runner, job-row retention, daily jobs, administrator status privacy, runbook). 2026-10-06. Reviewer: the WP4-AUDIT-A subagent (profile timesheet-auditor), self-reported model `claude-opus-5-5`; effort and speed are not observable.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** `13a258db86b2f0b6388830e584e2cca5303f1f6c` (the WP4-GATE freeze commit). Source digest `1ed67f55fb20c5bed64926c54ce635211f09c44ce33d50a2f88c8354577addfe` over 774 files (`handoff/` excluded), equal to the gate digest of record. Recorded before (10:44 UTC) and after (11:18 UTC) in the repository with `scripts/source-digest.mjs` and the `git ls-tree` form, and on the clean export after every check (`00`, `99`). HEAD did not move. `main` was level with `origin/main`: no unpushed commit. Complete source: a `git archive` export of the commit.
- **Decision: PASS / FIX REQUIRED / NOT VERIFIED:** **FIX REQUIRED.** One required fix: WP4-A-01 (Low). The image ships 114 source maps, and the production server serves the client source map with its full source text. This fails the image-boundary check of this audit (scope item 3) and docs/07:9. Two Low documentation defects should be fixed in the same round: WP4-A-02 and WP4-A-03. WP4-A-04 (Info, tooling) is optional. No defect was found in behaviour: consistency, isolation, privacy, secret handling, AC-08 and the migration runner all hold.
- **Scope actually inspected/executed:**
  - Read: AGENTS.md (from disk), the brief, WP4_REVIEW, WP4_IMPLEMENT, docs 03, 05, 06, 07, 10 and 11, the WP4 HANDOFF, the WP4-GATE results and the board decisions.
  - Code traced: `config.ts`, `http/clientAddress.ts`, `routes/auth.ts`, `auth/rateLimit.ts`, `services/bootstrap.ts`, `cli.ts`, `index.ts`, `app.ts` (`/api/ready`), `ops/backup.ts`, `ops/manifest.ts`, `ops/prune.ts`, `ops/restore.ts`, `db/migrations.ts`, `db/database.ts`, migrations 0008 to 0011, `jobs/jobStore.ts`, `jobs/runner.ts`, `jobs/retentionJob.ts`, `jobs/sweepJob.ts`, `files/fileStore.ts` (`sweep`), `services/operationsStatus.ts`, `routes/admin.ts`, `Dockerfile`, `.dockerignore`, `compose.example.yaml`, `.env.example`, `scripts/container-drill.mjs`, `scripts/smoke-built-server.mjs`, `tests/integration/restore.test.ts`, and the three relaxed job-count pins.
  - Executed: a clean export with `npm ci` and `npm run verify`; the full container drill, stages 1 to 6, with the WP3 build; nine probes (P1 to P9). The probes covered the migration runner, concurrent openers, a backup under writes with an isolated restore, pruning with NTFS junctions, target boundaries and tampered backups, bootstrap, proxy and configuration, retention and the sweep, admin privacy, and the outbound CLI.
- **Evidence table:**

| Command | Result / exit | Evidence |
|---|---|---|
| `git archive 13a258d` then `npm ci` (Node 24.21.0) | exit 0, 169 packages, no deprecation line | `01` |
| `npm run verify` with `DATA_DIR` exported | exit 1: typecheck, lint and build clean; 75 files / 1710 tests pass; smoke capture check FAIL (WP4-A-04) | `02`, `02b` |
| `npm run verify` with `DATA_DIR` unset (the smoke uses its own temp folder) | exit 0: 75 files / 1710 tests, SMOKE PASSED, no deprecation line | `03` |
| `node scripts/container-drill.mjs --work <work>\drill --project ts-wp4-aud-a --wp3 <work>\wp3` | exit 0, `DRILL STAGES 1-6 PASSED`; per stage 31/31/56/35/27/23 PASS, 0 FAIL (205), equal to WP4-T12 and the gate | `04`, `05` |
| P1 migration runner (after one rerun for a probe defect) | exit 1: 25 PASS, 1 FAIL. The one failure is a fresh-file concurrent opener that hit SQLITE_BUSY in `openDatabase`, characterised by P1b (R-A2). | `10` |
| P1b concurrent openers (10 rounds × 6 processes × 3 states) | exit 0, 4 PASS, 1 FAIL (the fresh-file case). Upgrade 10/10 and restart 10/10 clean; fresh file: 13 of 60 openers got SQLITE_BUSY at open; never a double application. | `11` |
| P2 backup under writes, isolated restore, hashes and balances | exit 0; 31 PASS | `12` |
| P3 pruning and junction escapes | exit 0; 9 checks PASS, plus the recorded backward-clock measurement (R-A1) | `13` |
| P4 target boundaries and tampered backups | exit 0; 16 PASS | `14` |
| P5 bootstrap (production) | exit 0; 21 PASS | `15` |
| P6 proxy, limiter, fail-fast, health, served source map | exit 0; 20 PASS; map served (WP4-A-01) | `16` |
| P7 retention window abuse, runner pass while paused | exit 0; 23 PASS | `17` |
| P8 admin status and account list allowlists | exit 0; 8 PASS | `18` |
| P9 `outbound` confirmation rules and audit rows | expected exit codes 2/2/2/1/1/2/2/0/0/2; audited resume | `19` |
| Image file list, build settings | 114 `*.map` under `/app/dist`; the drill scan has no `*.map` rule | `20` |
| Bootstrap refusal messages | dates and policy numbers quoted (WP4-A-03) | `21` |
| `npm audit`, `npm audit --omit=dev` | 1 high (source-map-js, dev only) / 0 | `22` |

- **Findings:**
  - **WP4-A-01 | Low | required (fails scope item 3, image boundary) | `Dockerfile:42` (runtime `COPY --from=build /app/dist ./dist`), `tsconfig.server.json:9` (`"sourceMap": true`), `vite.config.ts:12` (`sourcemap: true`), `scripts/container-drill.mjs:213-226` (`forbiddenPaths` has no `*.map` rule).**
    - Reproduction: the drill image file list has 114 `*.map` paths under `/app/dist` (`20`). One of them is `/app/dist/client/assets/index-UbxC4j68.js.map`. The built server answers `GET /assets/index-UbxC4j68.js.map` with 200 and 1,887,573 bytes including `sourcesContent`, and the bundle carries a `sourceMappingURL` (`16`).
    - Expected: no developer files in the image (docs/07:9 "Keep the workbook, developer files and secrets out of the image"; scope item 3 "no source maps"). Actual: every server and client map is in the image, and production serves the whole client source to anyone.
    - Impact: no secret and no personal data (maps hold code; the repository is public by design). It is a boundary and hygiene defect, not a privacy leak.
    - Rule: docs/07:9; AC-11 (clean image).
    - Bounded fix: build the image without maps. Either pass `--sourceMap false` to tsc and `--sourcemap false` to vite in the Dockerfile build stage, or delete `dist/**/*.map` and the `sourceMappingURL` comments before the runtime copy. Add `*.map` to the drill's forbidden-file scan and check that `/assets/*.map` answers 404. Local development may keep maps.
  - **WP4-A-02 | Low | fix in the same round | `.env.example:60`.**
    - Expected: the template names the one production use of `JOB_RUNNER=off`. A rollback to a build whose schema has no outbound pause must run with the runner off until reconciliation (docs/07:32, docs/11:194, coordinator decision docs/10:159).
    - Actual: "JOB_RUNNER=off disables the in-process job runner (tests and drills only; leave unset)." The template contradicts the rule that makes the accepted rollback residual limit safe.
    - Fix: reword the comment: off is required after a `restore --keep-schema --confirm` rollback until reconciliation; otherwise leave it unset.
  - **WP4-A-03 | Low (documentation accuracy) | fix in the same round | `docs/11_OPERATIONS_RUNBOOK.md:73,116,247-253` and the `.vi.md`; `src/server/services/bootstrap.ts:123` (comment).**
    - (a) The runbook says the administrator status shows the retention run, and section 12 says "The screen reads GET /api/admin/operations" and lists retention. The screen does not show it: only the JSON has `operations.retention` (`18`; HANDOFF:124 says so too).
    - (b) The runbook and the bootstrap comment say that a refusal quotes no value from the file. Refusals quote dates and policy numbers, for example "Invalid holiday/closure date 2026-02-30" and "Reference 08:00–17:00 (540 min) must equal required 480 min plus excluded breaks 15 min" (`21`). Free text (names, the zone) is not quoted, and nothing secret is printed.
    - Rule: AGENTS.md rule 5; scope item 10 (runbook statements behave as written).
    - Fix: correct the wording (EN and VI), or add the retention line to the screen.
  - **WP4-A-04 | Info (tooling, optional) | `scripts/smoke-built-server.mjs:43-58`.**
    - Problem: the smoke env spreads `process.env` and overrides `DATABASE_PATH`, but not `DATA_DIR`.
    - Reproduction (`02`, `02b`): with `DATA_DIR` exported, as the WP4 runtime rules require for every CLI and server run, `npm run verify` fails the smoke capture check (exit 1). The smoke also writes synthetic signature, PDF and capture files into the caller's `DATA_DIR`.
    - Expected: the smoke keeps all its storage in its own temp folder.
    - Fix: set `DATA_DIR: join(work, 'private-data')` in the smoke env.
- **Risks and optional improvements, separate from proven defects:**
  - R-A1, backward clock and pruning (`ops/prune.ts:100-124`).
    - Measured on 180 nightly backups (`13`): the correct clock keeps 13. A clock set back to 2025-01-01 keeps only the newest; a real `--prune` would also keep the new, mis-dated backup and remove the rest.
    - Mitigated by the NTP owner step and the separate-device copy.
    - Improvement: refuse the prune (exit 2) when any candidate is dated after the clock.
  - R-A2, concurrent openers of a brand-new database file (`db/database.ts:11-18`, from WP1).
    - The WAL switch returns SQLITE_BUSY at once for some openers (`11`). The process fails visibly; data is never damaged.
    - `migrate()` itself is safe under concurrency: upgrades and restarts were clean, and no migration was applied twice.
    - The runbook order (server first, then the CLI) avoids it. Improvement: retry the journal-mode switch.
  - R-A3, the rollback residual limit (keep-schema restore of a schema without the pause). Acceptable for WP4: there is no activation instant, mail is capture only, and backed-up sends are held (drill stage 5). Before the WP5 pilot the owner should choose: the `JOB_RUNNER=off` rule (with WP4-A-02), or clearing the activation instant on `--confirm` (docs/10:159).
  - R-A4, the retention window instant comes from the caller (`jobs/retentionJob.ts`).
    - Direct SQL that sets the window to 2099 could delete a 29-day-old succeeded scan row (`17`, rolled back). Delivery, PDF, send, sweep and retention rows stay refused at any instant.
    - Only `retentionJob.ts` writes the window, and production refuses `run-jobs --now`. Acceptable.
  - R-A5, a drill check overstates its result. "outbound release --all --confirm releases the remaining held send job" passes with `released: 0` (`05`; the condition is `released === releasable - 1`). A real bulk release is covered by `restore.test.ts:488` (released 1). Improvement: hold two jobs in the drill.
  - R-A6, the relaxed job-count pins.
    - `delivery.test.ts:284` (3/3) and `jobs-restart.test.ts:289` (4 claimed / 3 succeeded) stay exact and explained. Legitimate.
    - `automation.spec.ts:156,273` became upper bounds (≤2, ≤4) and are weaker. The business assertions stay (no revision, no finalization, activation null), and `deadline.test.ts:961` and `reminders.test.ts:218` pin "no scan job without activation" exactly. Acceptable; improvement: assert by job kind.
  - R-A7, `not_set_up` sits in the account list while docs/03:49 says "operational status". docs/03:34 counts accounts and "settings flags" as operational information, and runbook section 12 names the account list. Consistent; optional wording "in the administrator's account list".
  - R-A8, the CLI default database in development. Without `DATABASE_PATH`, `cli.js migrate`, or any unknown command, opens `%LOCALAPPDATA%\timesheet-dev\timesheet.db` (`config.ts:28-31`, `cli.ts:433-434`; the WP4-GATE incident). Improvement: maintenance commands require an explicit `DATABASE_PATH`. Pre-existing.
  - R-A9, `npm audit` high in `source-map-js`. It is dev only (vite > postcss), not in the image, and `npm audit --omit=dev` finds 0 (`22`). Acceptable backlog.
- **Verified behaviour (no defect):**
  1. Configuration fails fast with the variable name and no value (8 cases, `16`). With no trusted proxy, or a trusted proxy that is not the socket peer, a rotating `X-Forwarded-For` shares one bucket (31st failure 429). With the peer trusted, the right-most untrusted hop is the client: prepended hops, an IPv4-mapped spelling and a malformed header cannot split buckets, and the account bucket keys on the real client. `/api/health` is `{"status":"ok"}`; `/api/ready` has exactly `status`, `schema{expected,actual}` and `data_dir_writable`.
  2. Bootstrap stores only the SHA-256 of the normalized token. The token expires 60 minutes after issue and works once. Superseded, wrong, expired and replayed tokens get one identical 403. `--new-token` replaces the token and is refused once an administrator exists. No token or hash appears in responses, logs or audit rows; the audit rows are system events (`15`).
  3. The image (drill stage 1): base pinned by digest, numeric `User=10001:10001`, running UID 10001, read-only root with a `/tmp` tmpfs, no tests, `reference/`, `handoff/`, `.env` or workbook files, production dependencies only, no secret in the image environment, persistence only under `/data`. Exception: the source maps (WP4-A-01).
  4. The backup is WAL-consistent under writes.
     - Three writers ran: 56 sessions and 16 signatures finished inside the backup window, and 5 of 8 opening balances landed in the snapshot.
     - Each opening balance in the copy has its audit row, and no audit row lacks its ledger row.
     - Every session committed before the backup started is in the copy; the copy is a subset of the live data.
     - The manifest has the exact keys and only hashes and sizes; every file equals its manifest entry and the live file (`12`). Import sources are included (drill stage 2).
  5. Pruning:
     - It selects only real folders with the tool's name and a manifest whose instant equals the name, and always keeps the newest. A backup-named junction is ignored.
     - A junction as `files/`, or inside `files/`, is unlinked, never followed: the victim folders are byte-identical.
     - The dry run removes nothing. A missing new backup and an escape found at removal time each refuse the whole run before any removal (`13`).
  6. Restore never writes the live `DATABASE_PATH` or `DATA_DIR` (tree identical before and after, `12`). Junctions into `DATA_DIR`, the live instance folder and a folder inside the backup are refused with exit 2. Tampered backups fail with exit 1 and leave nothing behind (`14`). Restored balances equal the backup through SQL and through the restored API, and the restored instance logs the pause.
  7. Held sends and AC-08:
     - Every queued or leased send and reminder of the backup is held.
     - Uncertain attempts are never released or resent; resume is refused while an attempt awaits a decision.
     - Release and drop need `--confirm`, refusals exit 1, and successful steps are audited system events.
     - Jobs created after the restore are not held; they wait for the resume only.
     - Evidence: drill stage 3, the `restore.test.ts` scenarios read in full, and `19`.
  8. Upgrade and rollback:
     - The migrations apply once in one exclusive transaction; a restart applies nothing.
     - The previous build refuses the upgraded database, and the refusal changes nothing.
     - `--keep-schema` is refused without `--confirm`; with it, the backed-up send jobs are held and the WP3 runner sends nothing (drill stages 4 and 5).
  9. The migration runner (WP4-T10 change):
     - A failing migration rolls back its DDL and rows.
     - An FK violation, against a new or an existing table, is refused before COMMIT.
     - `foreign_keys` returns to its previous value on every path (success, SQL error, FK violation, busy lock, nested call, older-binary refusal).
     - Concurrent openers on existing databases are clean (`10`, `11`).
  10. Retention (F-4): with the window closed nothing is deleted, even by a bulk `DELETE`. With it open, only succeeded `deadline_scan`/`reminder_scan` rows older than 30 days go. The window row cannot be deleted, duplicated or malformed. A succeeded row cannot be back-dated. The run closes the window and records an instant and a count (`17`).
  11. Daily jobs: while outbound is paused, the retention job and the orphan sweep both run. The sweep removes only the old unreferenced file and keeps referenced signatures and an import source older than the grace. The queued send stays unclaimed, with no attempt and no capture (`17`).
  12. Admin privacy: the operations status and the account list match the exact allowlists (`not_set_up` and `retention` included). No storage key, hash, host path, ledger minutes, balance or session field appears, and server logs hold no email address (`18`).
  13. Runbook: each CLI command exists with the documented arguments and exit codes (`19`, `cli.ts` parsers). Each command maps to a drill stage or carries an owner NAS label (the gate's cross-check holds). No real host, credential or personal data appears.
- **Required gates unrun/blocked and why:**
  - The NAS target is NOT VERIFIED: no owner access. A native arm64 run is NOT VERIFIED; the image exists only as a WP4-T04 emulation build.
  - `npm run test:e2e` was not rerun. It is not required for area A; the gate reported 145 passed and 5 skipped.
  - No real SMTP (out of scope).
- **Disposition of previous findings and HANDOFF carry items (area A):**
  - NAS not verified: acceptable; owner steps are in docs/11.
  - Rollback limit: acceptable with the documented rule (R-A3; WP4-A-02 fixes the template).
  - Prune status not recorded: acceptable backlog (the host alert in docs/11 section 11 covers backup age).
  - npm advisory: acceptable backlog (R-A9).
  - Held sends can be released, not dropped: acceptable (coordinator decision).
  - Retention status JSON only: acceptable, but the runbook wording must match (WP4-A-03).
  - Calendar prune windows: R-A1.
  - The `migrate()` foreign-key change: safe (verified behaviour 9).
  - Relaxed pins: R-A6.
  - The client components and the 767px literal belong to area B and are not judged here.
  - WP3 carry 4 (orphan sweep scheduling): closed; the sweep runs daily (`17`).
- **Software readiness, owner permission and pilot result separately:**
  - Software readiness of area A: not yet accepted, because WP4-A-01 needs a fix. Behaviour is otherwise verified on a workstation (Docker Desktop, amd64).
  - Owner permission: none requested or given; nothing deployed and nothing sent.
  - Pilot result: none (WP5).
- **One next action/prompt:** the coordinator dispatches a bounded fix through [FIX_FINDINGS](../prompts/FIX_FINDINGS.md) for WP4-A-01, with WP4-A-02 and WP4-A-03 and optionally WP4-A-04. Then come a freeze, the verifier gate and a fresh area-A recheck at the new digest. The recheck covers the drill stage 1 image scan with `*.map` added and a 404 for `/assets/*.map`.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:** WP4-AUDIT-A, attempt 1. The reviewer is a fresh timesheet-auditor subagent (`claude-opus-5-5`). The authors are the WP4 implementation tasks on the board: T05, T06, T09 and T10 on `claude-opus-5-5`; T01 to T04, T05B, T07, T07B, T08, T09B, T11, T12, T12A, T13 and WP4-DEC on `claude-sonnet-5-5`. The reviewer is not weaker than the strongest author model.
- **Fresh context; confirm reviewer did not author changes:** fresh context. This reviewer authored nothing in WP4 and wrote only this report, its translation, the task-record results and `evidence/WP4-AUDIT-A/`. No source was edited. Probes ran in a scratch export outside Dropbox.
- **Source digest before/after; gate evidence for that snapshot:** `1ed67f55…addfe` before and after (repository and export), equal to WP4-GATE (`handoff/delivery/evidence/WP4-GATE/`).
- **New report path preserving previous review history:** `handoff/delivery/WP4_REVIEW_A.md` (new file); no earlier WP4 review was changed.
- **Finding dispositions and next coordinator fix/recheck task:** WP4-A-01 required; WP4-A-02 and WP4-A-03 in the same round; WP4-A-04 optional; R-A1 to R-A9 backlog or owner choices. Next: the fix task, freeze, gate, then a fresh WP4-AUDIT-A recheck.
