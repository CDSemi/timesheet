# WP4 handoff — Deployment, recovery and workbook import

Completed from [HANDOFF](../templates/HANDOFF.md) with actual evidence. Translation: [WP4_HANDOFF.vi.md](WP4_HANDOFF.vi.md). Every number below is copied from a task record in `handoff/delivery/tasks/` or an evidence folder named next to it; nothing was re-run to produce a figure. A figure that was not run or not verified is labelled as such. This is the WP4-T13 package freeze: it states what the implementers reported and what the gate and the audits must still judge. A reported result is not independent proof.

## Handoff record

- **Package/scope, date and author:** WP4 only, per [WP4-PLAN](tasks/WP4-PLAN.md), [WP4_IMPLEMENT](../prompts/WP4_IMPLEMENT.md) and [09 Roadmap](../../docs/09_IMPLEMENTATION_ROADMAP.md): container-ready configuration, a pinned non-root image, production bootstrap, consistent backup and restore with the outbound pause, reconciliation, upgrade and rollback, an owner-only workbook import with an explicit opening OT balance, the administrator operations status, the operations drill and the runbook. Written 2026-10-06 by the WP4-T13 worker.
- **Actual model/effort/speed, or not observable:** self-reported by the task records. T05, T06 (both attempts), T09 and T10 ran on `claude-opus-5-5` (profile `timesheet-worker-high`, override `opus`, reason `novelty`); T01 to T04, T05B, T07, T07B, T08, T09B, T11, T12, T12A and WP4-DEC ran on `claude-sonnet-5-5`, as does this task. Effort and speed are not observable.
- **Commit SHA, source digest and unpushed commits, or complete source archive:** the last implementation freeze is WP4-T12-FREEZE, commit `0f6abdf77c313f2dcb45bf624ee56294e5976c78`, source digest `de0e215be7594852bf0c26b22438ead5afcacb529187100549047b1ab408f41b` over 772 files (`handoff/` excluded). WP4-T13 changes only documentation (`docs/11_OPERATIONS_RUNBOOK`, `docs/03` one sentence, `DEVELOPMENT`, `README`, this handoff), so its digest differs; the digest of record is the one the gate computes on a clean export of WP4-T13-FREEZE. Unpushed commits: none known at the baseline.
- **Implementation status; independent review status:** all WP4 implementation tasks (T01 to T12, with T05B, T07B, T09B and T12A, and WP4-DEC) are implemented and frozen by the board; T13 (this task) is the package-final documentation task. Independent review of the software: **not yet run** (WP4-GATE, then AUDIT-A and AUDIT-B). No WP4 task has an independent audit; each task record is the implementer's own evidence.
- **Implemented behavior and changed files:** see "Scope delivered by task" below.
- **Migrations/schema compatibility:** seven migrations, 0007 to 0013, all checksum-guarded (see "Migrations 0007 to 0013"). The latest schema is 13; an older build refuses a database from a newer schema.
- **Changed canonical contracts and reason, or none:** yes, recorded in English and Vietnamese by WP4-DEC (`e5576de`) for the owner decisions F-1 to F-6 of 2026-10-05: `docs/03` (a new section on imports, the opening balance and retention; the API route list), `docs/07` (no session secret, 7/4/6 retention, held sends and `JOB_RUNNER=off`, import rules) and `docs/10` (the decisions). WP4-T13 adds one sentence to `docs/03` (and its translation) naming the import and opening-balance routes; this is a documentation sync, not a rule change. The calculation rules and the fixtures are unchanged. No governance path (`.claude/`, `AGENTS.md`, `handoff/prompts/`) was changed by WP4.
- **Verification table:** below.
- **AC IDs covered; genuinely unrun/blocked paths:** below.
- **Synthetic screenshots/PDF/mail-capture evidence:** screenshots `*-synthetic.png` are in the evidence folders of T03 (`setup`), T07 (`admin-status`), T07B (`admin-users-not-set-up`) and T11 (`import-preview`, `opening-balance`). Mail capture is exercised by the drill (stage 3 and 5) and the integration tests; no `.eml`, PDF, workbook or backup is stored in the repository.
- **Findings resolved, remaining defects and optional backlog:** below ("Known limits" and "Items the audits must judge").
- **Owner setup inputs needed, excluding secrets:** the NAS model, DSM version and `uname -m`; a host-local data path and a separate backup path; the UID/GID and folder permissions; the reverse-proxy host name, HTTPS certificate and the proxy address for `TRUSTED_PROXY_ADDRESSES`; NTP; a separate device for the backup copy; running the runbook on the NAS. No secret is requested in chat; SMTP credentials stay unused in WP4 and belong to the WP5 pilot packet.
- **Production actions and explicit authorization, normally none:** none. No deployment, no host exposure (loopback only), no real email, no real data. `PRODUCTION_SENDING_ENABLED` is never set; outbound mode is capture throughout; the activation instant is empty.
- **Usage/credits only if actually observable:** not observable in these sessions.
- **One next action and matching prompt:** run WP4-GATE (verifier) on the WP4-T13-FREEZE commit as in WP4-PLAN section E, then the two fresh independent audits ([WP4_REVIEW](../prompts/WP4_REVIEW.md)); do not begin WP5 before they pass.

## Orchestration provenance

- **Mission/task IDs and board/checkpoint:** mission `timesheet-software-readiness`, package WP4, tasks WP4-PLAN, WP4-T01 to WP4-T13 (with WP4-T05B, WP4-T07B, WP4-T09B and WP4-T12A), WP4-DEC and one FREEZE per implementation task. Board: [ORCHESTRATION.json](ORCHESTRATION.json); briefs and results: `handoff/delivery/tasks/WP4-*.md`; evidence: `handoff/delivery/evidence/WP4-*/`.
- **Implementer and independent auditor identities; separate contexts:** every task ran in its own subagent context. No WP4 package audit exists yet; the gate and the audits must use fresh contexts that did not author any WP4 change.
- **Current verified/reviewed digest; review report and decision:** none yet. The gate computes the digest of record on a clean export of WP4-T13-FREEZE.
- **Remaining tasks/dependencies; one next coordinator action:** WP4-T13-FREEZE, WP4-GATE, AUDIT-A, AUDIT-B, WP4-ACCREC, WP4-ACCEPT. Next coordinator action: dispatch WP4-T13-FREEZE after this task's checks, then WP4-GATE.
- **Software readiness and pending owner pilot authorization separately:** software readiness of WP4: implemented, not yet gated or audited, and the NAS target is NOT VERIFIED. Owner pilot authorization: not requested and not given; nothing is deployed and no real mail has been sent.

## Owner and coordinator decisions

Sources: [docs/10](../../docs/10_DECISIONS_AND_SOURCES.md), the board `owner_decisions` and `coordinator_decisions`, and [WP4-DEC](tasks/WP4-DEC.md).

| Decision | What it records | Delivered by |
|---|---|---|
| F-1 (a) | Each person imports only their own workbook; an administrator cannot import for anyone else | T09 (owner-only routes, another user and an administrator get 404), T11 |
| F-2 (a) | An imported period posts no ledger events, cannot be signed or submitted (409 `imported_period`) and is read-only history | T09, T10 (OT leave use refused), T11 |
| F-3 (a) | The opening balance is signed non-zero minutes, one per user, changed only by a reasoned correction, a new ledger entry type; a never-configured account gets an administrator "not set up" flag | T10, T07B, T11 |
| F-4 (a) | Only succeeded `deadline_scan` and `reminder_scan` rows older than 30 days are deleted, through a migration-scoped trigger exception | T07B (migration 0011) |
| F-5 | Backup pruning keeps 7 daily, 4 weekly and 6 monthly backups on tool-created folders only; the separate-device copy is an owner step | T05B, runbook sections 4 and 5 |
| F-6 | docs/07 says there is no application session secret; SMTP credentials only | WP4-DEC |
| Held sends after a restore (coordinator, 2026-10-05) | Every queued or leased send and reminder job of the backup is held; an audited release or drop decides; nothing from the backup goes out automatically | T06 attempt 2 |
| Rollback restore and `JOB_RUNNER=off` (coordinator, 2026-10-05) | A restore that keeps the older schema holds the backed-up sends and the older build runs with its runner off until reconciliation | T12A, docs/07 |
| T12 split (coordinator, 2026-10-05) | T12A ran the upgrade and rollback stages early; T12 added stage 6 and re-ran all stages | T12A, T12 |

## Open owner questions (I-1 to I-4)

Asked on 2026-10-06 from the T09 and T10 results. Nothing is blocked: the safe default stands, each is reversible, and an answer other than the default becomes a small follow-up before WP4-GATE.

| Question | Options | Safe default now |
|---|---|---|
| I-1 May a draft period of the application receive imported days? | (a) never; (b) merge only into days without application rows, the period stays signable and unflagged; (c) flag the whole draft period `imported_unverified` and read-only | (a), recommended and current |
| I-2 How is "Off day (overtime used)" imported? | (a) skip only; (b) import as Off, the label kept in the private source and the audit, no ledger effect; (c) Worked with OT-kind leave minutes | (a) is current; (b) is recommended |
| I-3 May a period that has not ended be imported? | (a) no; (b) yes | (a), recommended and current |
| I-4 May a mistaken opening balance be corrected to a net zero? | (a) yes, by a reasoned correction with evidence that offsets it (the original entry stays); (b) no, a correction must leave a non-zero balance | (b) is current; (a) is recommended |

## Scope delivered by task

Each row names the board freeze commit (abbreviated SHA) and the test files and tests of `npm run verify` that the task record reports.

| Task | Freeze | Behavior | Verify (files / tests) |
|---|---|---|---|
| WP4-T01 | `a1dc01b` | Production configuration (absolute `DATA_DIR` and `DATABASE_PATH`), `TRUSTED_PROXY_ADDRESSES` for the sign-in limiter, `GET /api/ready` with an exact key allowlist, `.env.example` | 63 / 1449 |
| WP4-T02 | `37f1be2` | Migration 0007: recorded `via_share_id` on audit rows; History and the Review hint read the marker; a `HEAD` on the shared PDF writes no audit | 64 / 1469 |
| WP4-T03 | `199e792` | Migration 0008; `bootstrap --config` and `--new-token`; `POST /api/auth/bootstrap` with a 60-minute single-use token; the Setup screen | 65 / 1494 |
| WP4-T04 | `3b2ddf2` | Pinned multi-stage `Dockerfile` (non-root UID/GID 10001, `/data` volume, health check), `.dockerignore`, `compose.example.yaml`, drill stage 1 | 65 / 1494 |
| WP4-T05 | `0c58130` | Migration 0009; `backup --to <dir>` (online backup, hashed manifest, no pause needed), backup status | 66 / 1503 |
| WP4-T06 | `72ab2ed` | Migration 0010; the outbound pause, isolated `restore`, held sends, `outbound resume|release|drop` (attempt 2 implements the coordinator decision) | 67 / 1525 |
| WP4-T07 | `e1d97bd` | Administrator status: backup, disk and outbound blocks and the banner; the daily orphan-file sweep | 68 / 1545 |
| WP4-T08 | `dd1422f` | Safe workbook reader, template mapping v1, the synthetic workbook generator; dependencies `fflate` 0.8.3 and `fast-xml-parser` 5.11.2 | 69 / 1573 |
| WP4-T12A | `0f989e4` | Drill stages 4 and 5 (upgrade, rollback), `restore --keep-schema [--confirm]`, the upgrade test | 70 / 1589 |
| WP4-DEC | `e5576de` | The owner's decisions F-1 to F-6 written into docs 03, 07 and 10 (EN and VI) | not applicable |
| WP4-T07B | `641ca10` | Administrator "not set up" flag; migration 0011 and the 30-day job-row retention | 71 / 1613 |
| WP4-T05B | `6fecd88` | `backup --prune` (7/4/6) and `backup prune --in <dir> --dry-run` | 72 / 1625 |
| WP4-T09 | `a679787` | Migration 0012; owner-only `/api/imports` preview and idempotent commit with explicit conflict decisions; the F-2 guards | 73 / 1646 |
| WP4-T09B | `1b4d817` | Import sources in backup and restore with hash checks | 73 / 1655 |
| WP4-T10 | `aff904a` | Migration 0013 (the `ot_ledger` rebuild); `/api/ot/opening-balance`; OT leave use refused in an imported period | 74 / 1673 |
| WP4-T11 | `61bf524` | Import and opening-balance screens; the "Imported, unverified" status; `imported_unverified` in the timesheet read model | 75 / 1707 |
| WP4-T12 | `0f6abdf` | Drill stage 6 (import no-op, opening balance once, 409 `imported_period`, 404 for another user) and the extended stages; the full drill green | 75 / 1710 |
| WP4-T13 | not yet frozen | Runbook, developer docs, README, this handoff | not applicable (documentation only) |

Container drill, last full run (WP4-T12, `npm run drill:container -- --work ... --project ts-wp4-t12 --wp3 ...`): exit 0, `DRILL STAGES 1-6 PASSED`, stage 1: 31, stage 2: 31, stage 3: 56, stage 4: 35, stage 5: 27, stage 6: 23, total 205 PASS and 0 FAIL (`handoff/delivery/evidence/WP4-T12/02-drill-green.txt`). Docker Desktop, linux/amd64, capture mode, synthetic data. The last end-to-end run (WP4-T11): exit 0, 145 passed, 5 skipped.

Migrations 0007 to 0013: `0007_audit_access` (a nullable marker column and one trigger; no rewrite of immutable rows), `0008_bootstrap`, `0009_operations_backup`, `0010_outbound_pause`, `0011_job_retention`, `0012_imports` and `0013_ot_opening_balance` (rebuilds `ot_ledger` with the documented 12-step procedure). A fresh run and an upgrade from a populated older schema are tested for each; the drill upgrades a real schema-6 database from the accepted WP3 build to 13.

## Verification

| Command | Environment | Exit status | Observed result | Evidence path |
|---|---|---|---|---|
| `npm run verify` (with `--trace-deprecation --pending-deprecation`) | Node 24.21.0, WP4-T12 | 0 | 75 test files, 1710 tests, build and smoke passed, no deprecation line | `evidence/WP4-T12/04-verify.txt` |
| `npm run drill:container -- --work ... --wp3 ...` | Docker Desktop 28.5.1, amd64 | 0 | stages 1 to 6, 205 PASS, 0 FAIL | `evidence/WP4-T12/02-drill-green.txt` |
| `npm run test:e2e` | installed Edge, desktop and mobile, WP4-T11 | 0 | 145 passed, 5 skipped | `evidence/WP4-T11/08-test-e2e-final.txt` |
| `npm run digest` | Node 24.21.0, WP4-T12 | 0 | `de0e215b…b41b`, 772 files | `evidence/WP4-T12/05-digest.txt` |
| `validate_package.py --preflight`, EN/VI parity, `precommit-check.mjs` | this task | see `evidence/WP4-T13/` | recorded there | `evidence/WP4-T13/` |

Not run by this task: tests, the drill and the end-to-end suite (documentation only). The gate must run them on a clean export.

## Coverage

Implementer evidence, not independent proof.

| ID | Covered by |
|---|---|
| FR-15 | T01, T04, T05, T05B, T06, T09B, T12A, T12; the runbook |
| FR-16 | T08, T09, T09B, T10, T11, T12 |
| AC-11 | Drill stage 1 (clean install and restart), stage 2 (backup under writes, hashes), stage 3 (isolated restore with hashes and balances), stage 4 (upgrade); `backup.test.ts`, `restore.test.ts`, `upgrade.test.ts` |
| AC-12 | T08 (the preview flags the template's defects), T09 and T12 stage 6 (an identical re-import adds no timesheet, day entry, session, ledger entry, revision, sign-off, job or attempt); `workbook-reader.test.ts`, `workbook-import.test.ts` |
| AC-15 | T01 (`/api/ready`, safe health), T05 and T07 (backup status), T06 (restored instance paused), T12A and drill stage 5 (rollback) |
| AC-01 (regression) | `operations-status.test.ts` exact key allowlists; imports are owner only (404 for another user and for an administrator); drill stage 6 |
| AC-03 (regression) | `opening-balance.test.ts` and drill stage 6 (the opening balance posts once; a re-import posts no ledger entry) |
| AC-08 (regression) | T06 (held sends, release blockers, `jobs-restart.test.ts`), drill stage 3 and stage 5 (nothing from a backup is sent unreconciled) |
| AC-16 (regression) | T02 (the recorded marker, `sharing-matrix.test.ts`); the import and opening-balance routes are not in any share |

Genuinely unrun or blocked: the NAS target (see below); a native arm64 run (the arm64 image was built only under emulation); WP4-GATE and both audits.

## Known limits

- **NAS NOT VERIFIED.** Everything ran on a developer workstation (Docker Desktop on WSL2, linux/amd64). The NAS file system, the reverse proxy, `TRUSTED_PROXY_ADDRESSES`, Task Scheduler, Hyper Backup or USB, and NTP are unverified; the [runbook](../../docs/11_OPERATIONS_RUNBOOK.md) lists the owner steps and a checklist. Backup consistency was proven on Docker Desktop, not on the NAS file system.
- **The rollback limit.** A restore that keeps an older schema has no outbound pause, so jobs created after the rollback are not held. The previous build must run with `JOB_RUNNER=off` until reconciliation is done; that is a documented rule, not a drill step. The previous build has no `outbound` command, so reconciliation needs a second upgrade. Changes made after the paired backup are not in the restored copy.
- **The prune status is not recorded.** `backup --prune` prints counts, but the last prune result is not stored in `operations_state` or shown in the administrator status; that needs new columns and a migration, which WP4-T05B did not add.
- **The npm advisory.** `npm audit` reports one high finding in `source-map-js` (WP4-T08 record). It is not one of the packages WP4 added (`fflate`, `fast-xml-parser` and their dependencies). It has not been triaged or fixed.
- **Not WP4 scope, carried to WP5:** temporary passwords with no change-password route, at-most-once reminders and TLS certificate errors on real SMTP, the pilot packet, and the WP3 backlog items in the WP3 handoff.
- **Smaller notes:** the held send jobs can be released but not dropped (only reminders can be dropped); the retention status is in the JSON but not on the administrator screen; the opening balance form is on the Import screen, which the OT screen links to; the pruning windows are calendar windows from the clock.

## Items the audits must judge

- **The `migrate()` foreign-key change (WP4-T10).** `defer_foreign_keys` alone could not carry the `ot_ledger` rebuild, because the implicit delete of DROP TABLE counts deferred violations. `migrate()` now turns `foreign_keys` off before `BEGIN EXCLUSIVE`, restores it in `finally`, and runs `foreign_key_check` before COMMIT whenever it applied something. This changes the path of every migration and every upgrade; judge that it is safe and that a violation really rolls back.
- **The relaxed job-count pins.** Adding the daily sweep (T07) and the daily retention job (T07B) raised the counts of claimed and succeeded jobs. The pins in `tests/e2e/automation.spec.ts` (caps from 1 to 2, and 2 to 4), `tests/integration/delivery.test.ts` and `tests/integration/jobs-restart.test.ts` were relaxed by hand. Judge that they still prove that an inactive instance sends and queues nothing.
- **The client components touched outside the owned lists.** WP4-T11 edited `ReviewScreen.tsx`, `BatchBar.tsx`, `TimesheetGrid.tsx`, `DayList.tsx`, `OtScreen.tsx`, `SharingOt.tsx`, `PeriodHeader.tsx`, `TimesheetScreen.tsx` and `otModel.ts` (the imported-period lock, ledger labels and operation names); WP4-T07 and WP4-T07B edited `api.ts`, and `adminModel.ts` lives in `src/client/components/`. Other edits outside the owned lists are in the task records: `http/auth.ts` and `routes/api.ts` (T02), `sweepJob.ts` and `timesheetCommands.ts` (T09), `timesheets.ts` (T11) and `automation.ts` (T07B).
- **The 767px breakpoint literal.** `styles.css` gained rules under a `767px` media query, the same literal as the existing media queries, while the UI standard asks for tokens only (E-8). Judge whether the literal is acceptable or needs a custom property.

## Remaining scope

- WP4-T13-FREEZE, then WP4-GATE (verifier) on a clean export outside Dropbox: `npm ci`, `npm run verify`, `npm run test:e2e`, the drill with `--wp3`, the workbook gate, the upgrade and rollback runbook check, `precommit-check`, the validators and `npm run digest` last.
- AUDIT-A (operations: T01, T03 to T07, T12) and AUDIT-B (data: T02, T08 to T11), fresh and independent, then WP4-ACCREC and WP4-ACCEPT.
- Answers to I-1 to I-4 (a small follow-up if an answer differs from the default), and the owner's NAS steps. WP5 starts only after WP4 is accepted.

## Next action

Run WP4-GATE on the WP4-T13-FREEZE commit as in [WP4-PLAN](tasks/WP4-PLAN.md) section E, then the two fresh independent audits.

## Acceptance record (WP4-ACCEPT)

Prepared by WP4-ACCREC (records only, no source edit). The sections above are the WP4-T13 snapshot and are superseded by this record where they differ (for example the test counts, the digest, "no independent review yet" and the open question list). Sources: the board tasks WP4-GATE to WP4-RECHECK-B4 (`decision`, `findings`, `notes`, `gate_notes`, `history`), the board `owner_decisions` and `coordinator_decisions` of 2026-10-05 and 2026-10-06, `pending_owner_question` and `runtime_observations`, and the reports [WP4_REVIEW_A](WP4_REVIEW_A.md), [WP4_REVIEW_B](WP4_REVIEW_B.md), [WP4_RECHECK_A](WP4_RECHECK_A.md), [WP4_RECHECK_B](WP4_RECHECK_B.md), [WP4_RECHECK_A2](WP4_RECHECK_A2.md), [WP4_RECHECK_A3](WP4_RECHECK_A3.md), [WP4_RECHECK_A4](WP4_RECHECK_A4.md), [WP4_RECHECK_B2](WP4_RECHECK_B2.md), [WP4_RECHECK_B3](WP4_RECHECK_B3.md) and [WP4_RECHECK_B4](WP4_RECHECK_B4.md) (each with a `.vi.md`). Every figure is copied from those records; nothing was re-run. The board acceptance step belongs to the coordinator. Index of sources: [evidence/WP4-ACCREC/01-sources.txt](evidence/WP4-ACCREC/01-sources.txt).

- **Accepted source:** commit `546cddaf6747aef85e8b6d9b7712de9e28f138bf` (WP4-FIXB4-FREEZE, pushed), source digest `26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081` over 775 files (WP4-REGATE4 PASS; the repository, the `git ls-tree` form and the clean export agree). Final figures from WP4-REGATE4:
  - 76 files and 1,758 tests; smoke 41 `PASS`, no deprecation line;
  - e2e 145 passed and 5 skipped;
  - drill stages 1 to 6 with `--wp3`, 208 `PASS` and 0 `FAIL`;
  - migrations and upgrade, 61 passed;
  - races 60/60 (10 of 10 fresh processes for each of 6 suites);
  - NAS NOT VERIFIED.
- **Import resource bound** (derived first, then measured). The parse cost class was closed by derivation and realistic ceilings, not by searching shapes (coordinator decision 2026-10-06):
  - derived bound over XML bytes X and markup openings O: time t ≤ 40 ms + 14.8 ns·X + 339 ns·O, memory m ≤ 15 MiB + 13.3 B·X + 428 B·O (61 unit kinds measured; attributes add no measurable cost);
  - ceilings: 2 MiB upload, 1 MiB per part, 3 MiB per package and 100,000 openings; the bound at the ceilings is about 121 ms and +95 MiB (margins 76% and 37%). A 64-sheet workbook is 0.33 MB and a 61-sheet one 318 KB; exactly 2 MiB reaches the reader (422), 2 MiB + 1, 3 MiB and 8 MiB answer 413;
  - measured against the 500 ms / +150 MiB budget: WP4-FIXB4 reports at most 114 ms and +72 MiB for its worst constructions (one 149 ms outlier run); WP4-REGATE4 measured 23 worst constructions at the ceilings, worst 107 ms and +70 MiB, whole-service worst 104 ms and +46 MiB, `/api/health` worst 113 ms under load, no 5xx; WP4-RECHECK-B4 recomputed the bound from an independent re-measurement of the 61 families at 105.5 ms and +90.8 MiB (stated 121 ms and +95 MiB) and measured worst 89 ms and +71 MiB for a preview, 90 ms and +46 MiB for the full service;
  - the earlier RB3-01 shapes (611 ms before) are refused in 0 to 3 ms, HTTP 413 in 3 ms. The figures were measured on a developer workstation only; at the code comment's own 3-4x NAS factor the worst preview is roughly 0.3 to 0.4 s on the NAS (R-B4-2).
- **Gate chain** (verifier, clean export outside Dropbox, Node 24.21.0, capture only):
  - WP4-GATE PASS on `13a258d` (`1ed67f55`);
  - WP4-REGATE PASS on `0f7fba2` (`dfe4541d`);
  - WP4-REGATE2 PASS on `cc34e7f` (`96445de4`);
  - WP4-REGATE3 PASS on `972ccda` (`635f909d`);
  - WP4-REGATE4 PASS on `546cdda` (`26fcc969`).
- **Audit chain:**
  - WP4-AUDIT-A on `13a258d`: FIX REQUIRED (A-01 source maps in the image, A-02 `JOB_RUNNER` wording, A-03 runbook accuracy, A-04 smoke inherits `DATA_DIR`);
  - WP4-AUDIT-B on `13a258d`: FIX REQUIRED (B-01 workbook parse cost, B-02 holiday overflow);
  - WP4-RECHECK-A: attempts 1 to 3 PASS on `0f7fba2`, `cc34e7f` and `972ccda`, each superseded for digest binding by a later fix round; attempt 4 PASS on `546cdda`, digest `26fcc969`, no finding, is the final area-A result;
  - WP4-RECHECK-B on `0f7fba2`: FIX REQUIRED (RB-01, reopened B-01);
  - WP4-RECHECK-B2 on `cc34e7f`: FIX REQUIRED (RB2-01);
  - WP4-RECHECK-B3 on `972ccda`: FIX REQUIRED (RB3-01);
  - WP4-RECHECK-B4 on `546cdda`: PASS, digest `26fcc969`, no finding, the final area-B result.
- **Fix rounds** (profile as recorded on the board; model and effort self-reported or requested):
  - round 1: WP4-FIXB and WP4-FIXA, both `timesheet-worker-high` (`claude-sonnet-5-5`), one freeze (`0f7fba2`);
  - round 2: WP4-FIXB2, escalated to `timesheet-expert` (`claude-opus-5-5`, requested xhigh) because RB-01 recurred on B-01, and WP4-DEPCLEAN, `timesheet-worker` (`claude-sonnet-5-5`), which removed the unused `fast-xml-parser` and its seven transitive packages; freeze `cc34e7f`;
  - round 3: WP4-FIXB3, `timesheet-expert` (`claude-opus-5-5`); freeze `972ccda`;
  - round 4: WP4-FIXB4, `timesheet-expert` (`claude-opus-5-5`), and WP4-DEPCLEAN2, `timesheet-worker` (`claude-sonnet-5-5`), which moved `fflate` 0.8.3 to `devDependencies` (no other package changed); freeze `546cdda`.
- **Owner decisions:**
  - F-1 to F-6 (2026-10-05, all as recommended in WP4-PLAN section F): own-workbook import only; imported periods read-only with no ledger events; a signed opening balance with a "not set up" flag; 30-day job-row retention; backup pruning 7/4/6; docs/07 states no application session secret;
  - option B (2026-10-05, reverses H-Q3 (a)): the skill `.claude/skills/readme-md/` was removed instead of fixed, with GOV-SKILL-REMOVE PASS;
  - open questions I-1 to I-5 (asked 2026-10-06; nothing blocks, each is reversible and the safe default stands): I-1 draft app period never receives imported days (a); I-2 "Off day (overtime used)" is skipped (a is current, b recommended); I-3 an unended period is not imported, and since WP4-FIXB an ended period whose payroll due instant has not passed is also skip-only (a); I-4 a mistaken opening balance cannot be corrected to a net zero (b is current, a recommended); I-5 uncommitted previews are kept with no quota (a limit of 20 per person is recommended). An answer other than the default becomes a small follow-up.
- **Coordinator decisions:**
  - held sends after a restore (2026-10-05): every queued or leased send and reminder job of the backup is held; an audited release or drop decides;
  - the rollback restore mode and `JOB_RUNNER=off` until reconciliation (2026-10-05);
  - the T07 split (the F-independent part first, the "not set up" flag and retention as T07B) and the T12 split (T12A first, then stage 6) (2026-10-05);
  - the `not_due` conservative default for a period not yet payable (WP4-FIXB, inside the I-3 canon);
  - 2026-10-06: close the parse-cost class by derivation and realistic ceilings, not by search; the 500 ms / +150 MiB target stays.
- **Non-blocking items carried forward** (none blocks acceptance):
  - NAS NOT VERIFIED;
  - R-A2 (retry the WAL switch for concurrent openers of a new database file), R-A3 (the rollback residual limit; an owner choice before the WP5 pilot: the `JOB_RUNNER=off` rule or clearing the activation instant), R-A6 (assert automation job counts by kind) and R-A8 (CLI maintenance commands default to the dev database without `DATABASE_PATH`);
  - R-RA1 to R-RA4 from RECHECK-A: R-RA1 same-second prune tie (Info), R-RA2 a later `--prune` the same UTC day removes the paired pre-upgrade backup (Low), R-RA3 third-party source maps under `node_modules`, never served (Info), R-RA4 a far-future backup blocks every prune until moved (Info); also R-RA5 to R-RA7 (Info);
  - from RECHECK-A attempt 4: R-RA8 (Info) early 413 answers and connection reuse on the raw upload routes (pre-existing, not seen in a browser) and R-RA9 (Low) a restore onto a dangling junction answers `write_failed` instead of `target_inside_data_dir` and wrote nothing in the live instance (pre-existing, optional `lstat` refusal);
  - B-R2 (mark imported dates in planBatch) and B-R4, which is I-5 (no preview quota);
  - the npm dev-only advisory (`source-map-js`, high; `npm audit --omit=dev` finds 0);
  - from RECHECK-B4: R-B4-1 (lenient encoding declarations), R-B4-2 (no preview quota and NAS NOT VERIFIED), R-B4-3 (more than 64 sheets is refused by the existing `maxSheets` cap) and R-B4-4 (the bound covers the 61 measured unit families only).
- **Runtime incidents** (one line each):
  - WP4-GATE: a first migrate probe ran without `DATABASE_PATH` and migrated the owner's local development database (outside the repository, dev data only) from schema 1 to 13; later checks used task-local paths and briefs now require both paths;
  - WP4-AUDIT-B: a heredoc fed to `python` opened a REPL that looped in a background task and wrote a very large output file outside the repository; the coordinator stopped it, and the file is left for the owner to delete;
  - WP4-REGATE4: a probe piped into `head` left one Node 24 server child running; the coordinator stopped the agent, and the later RECHECK-A attempt 4 process listing shows no portable Node 24 process left.
- **Separation of three outcomes:**
  - software readiness of WP4: implemented, gated (WP4-REGATE4 PASS) and independently audited (RECHECK-A attempt 4 and RECHECK-B4 PASS on the same freeze `546cdda`, digest `26fcc969`), with the NAS target NOT VERIFIED; the coordinator records WP4-ACCEPT;
  - owner permission: not requested and not given; no deployment, no real email, no real data, `PRODUCTION_SENDING_ENABLED` never set;
  - pilot result: none; no pilot has run.
