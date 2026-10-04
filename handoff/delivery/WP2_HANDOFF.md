# WP2 handoff — Workspace, OT ledger and administration

Completed from [HANDOFF](../templates/HANDOFF.md) with actual evidence. Translation: [WP2_HANDOFF.vi.md](WP2_HANDOFF.vi.md). Every number below is copied from a task record or an evidence file named next to it. A figure that was not run or not verified is labelled as such. This handoff is not a review and not an acceptance: the package-final gate and the two independent audits are still open.

- **Package/scope, date and author:** WP2 only, per [WP2-PLAN](tasks/WP2-PLAN.md), [WP2_IMPLEMENT](../prompts/WP2_IMPLEMENT.md) and [09 Roadmap](../../docs/09_IMPLEMENTATION_ROADMAP.md): mobile and two-week views, actual/manual/break editing, partial leave and batch categories, settings, holiday CSV import, user administration, history and audit, OT evidence CSV, the transactional OT ledger with leave reservations, and the browser tests. 2026-10-03 → 2026-10-04 (evidence timestamps are UTC). Authors: Claude Code subagents of the timesheet orchestration mission (one source writer at a time); this handoff and the T13 changes were written by a `timesheet-worker` (sonnet). No WP3 work was started: no finalization, revision, PDF or email exists.
- **Actual model/effort/speed, or not observable:** self-reported by the task records. T02 and T03 ran on `claude-opus-5-5` (override reason `novelty`, docs/08); T01, T05–T13 and the CALFIX/ADVFIX tasks ran on `claude-sonnet-5-5`; the plan, the advisory review and the coordinator ran on `claude-opus-5-5`. Effort and speed are not observable from inside the sessions; confirm them in the client.
- **Commit SHA, source digest and unpushed commits, or complete source archive:** the T13 changes are **not committed** at the time of writing (the T13 freeze is made by `timesheet-committer`). Baseline of this task: `da0ffc492b608f1108e3c455e55aa01cca118b45` (WP2-T12-FREEZE), pushed. Source digest of the working tree with the T13 changes: `8ebce5fe790870e0d52015fde658cfef0ee60929d6dcdafd80f563725f8524a2` over 611 files (`handoff/` excluded), from [evidence/WP2-T13/digest.txt](evidence/WP2-T13/digest.txt). The package-final identity is the T13-FREEZE commit and its digest, recorded by the freeze and the gate. Freeze history is in the table below.
- **Implementation status; independent review status:** all thirteen implementation tasks (T01–T13, with T09 split in two) are implemented and were verified by their authors. Independent review: **not started**. The advisory ledger review (WP2-ADV-REVIEW) covered the T04 freeze only and is not a package decision. WP2-GATE, WP2-AUDIT-A and WP2-AUDIT-B (document 08, plan section D) are pending.
- **Implemented behavior and changed files:** see "Scope delivered" and "Changed files by area" below.
- **Migrations/schema compatibility:** three migrations, all append-only and checksum-guarded; migration 0001 was never edited (a test pins its checksum). `0002_ot_ledger` adds `ot_ledger` (append-only, signed integer deltas, per-user unique `source_key`, opaque `source_ref`, self-FK `corrects_entry_id`) and `ot_leave_requests` (versioned counters, forward-only, immutable permission facts). `0003_day_entry_source` adds `day_entries.category_source` (default | explicit; WP1 rows backfilled `explicit`) and `day_entries.leave_kind` (NULL | vacation | sick | ot) with triggers, by `ALTER TABLE ADD COLUMN` (no table rebuild). The plan named `0004` for the second one; the registry requires contiguous versions, so it is `0003` (T05 deviation 1). Upgrades from a populated WP1 database and from a v2 database with ledger rows keep every row (`integrity_check` ok, `foreign_key_check` empty): tests in `tests/integration/migrations.test.ts` (T02, T05) and the advisory reviewer's own probe on the `f32978f` code (WP2-ADV-REVIEW, 12 WP1 tables byte-identical).
- **Changed canonical contracts and reason, or none:** yes, all recorded in English and Vietnamese. See "Decisions" below: owner decisions E-2, E-3 and E-8 changed docs 02, 03, 04, 10 and the LG-10 fixture field (WP2-DEC); the coordinator's ADV-A-02 application of R-05 changed one sentence each in docs 02 R-05/R-06 and docs 10 (WP2-ADVFIX); the CALFIX refusal added one sentence to docs 03 and an entry in docs 10 (WP2-CALFIX). The calculation rules R-01…R-04 and the fixture numbers are unchanged. `.gitattributes` gained `handoff/delivery/evidence/** -whitespace` (WP2-INFRA1, coordinator decision, outside the docs/08 governance list; the package audit should review it).
- **Verification table:** below. All commands ran with the Node 24 portable runtime (`v24.21.0`) called by full path or first on `PATH` for every evidence run. Early exploratory runs on a wrong `PATH` (Node 26) in T01 and WP2-ADV-GATE were discarded and redone, as those records state.
- **AC IDs covered; genuinely unrun/blocked paths:** below.
- **Synthetic screenshots/PDF/mail-capture evidence:** screenshots `*-synthetic.png` of the browser flows are in the T09A, T09B, T10, T11 and T12 evidence folders (index below); the sample evidence CSV is `evidence/WP2-T04/evidence-export-synthetic.csv.txt` and `evidence/WP2-T11/ot-evidence-desktop-synthetic.csv.txt`. The gate's own screenshot set (`evidence/WP2-GATE/`) does not exist yet. No PDF and no mail: WP3.
- **Findings resolved, remaining defects and optional backlog:** below ("Findings", "Known limitations and carry-forward notes").
- **Owner setup inputs needed, excluding secrets:** none for WP2. Optional: veto or change any reversible coordinator decision below; decide the owner options listed under "Carry-forward notes". WP3 will need the SMTP and signature inputs of the roadmap.
- **Production actions and explicit authorization, normally none:** none. No deployment, no host exposure (loopback only), no email, no real data. All data are synthetic `example.invalid` accounts.
- **Usage/credits only if actually observable:** not observable in these sessions.
- **One next action and matching prompt:** run the WP2 package-final gate (timesheet-verifier) on the T13-FREEZE commit, then the two independent audits per [WP2_REVIEW](../prompts/WP2_REVIEW.md) and plan section D; see the coordinator action below.

## Orchestration provenance

- **Mission/task IDs and board/checkpoint:** mission `timesheet-software-readiness`, package WP2, tasks WP2-PLAN, WP2-T01 … WP2-T13 (T09 split into WP2-T09A and WP2-T09B after WP2-T09-PREP), WP2-ADV-GATE, WP2-ADV-REVIEW, WP2-ADVFIX, WP2-CALFIX, WP2-DEC, WP2-INFRA1 and one FREEZE per implementation task. Board: [ORCHESTRATION.json](ORCHESTRATION.json); briefs and results: `handoff/delivery/tasks/`; checkpoint: [WORKFLOW_REVISION_CHECKPOINT.md](WORKFLOW_REVISION_CHECKPOINT.md).
- **Implementer and independent auditor identities; separate contexts:** every task ran in its own subagent context; one source writer at a time. The only review so far is the advisory WP2-ADV-REVIEW (fresh `claude-opus-5-5` auditor that authored nothing in the snapshot, T04 freeze only). The package audits must use fresh auditors that are not any T01–T13 worker.
- **Current verified/reviewed digest; review report and decision:** working-tree digest `8ebce5fe…24a2` (above); implementer-verified, not reviewed. Advisory report: [WP2_ADV_LEDGER_REVIEW.md](WP2_ADV_LEDGER_REVIEW.md), verdict FINDINGS (no package decision), all four actionable findings fixed in WP2-ADVFIX.
- **Remaining tasks/dependencies; one next coordinator action:** WP2-T13-FREEZE, then WP2-GATE, then WP2-AUDIT-A and WP2-AUDIT-B on the same commit, then WP2-ACCEPT. Next coordinator action: dispatch `timesheet-committer` for WP2-T13-FREEZE.
- **Software readiness and pending owner pilot authorization separately:** software readiness of WP2: implemented, not accepted. Owner pilot authorization: not requested and not given; nothing is deployed.

## Scope delivered against the plan IDs

Plan IDs are those of [WP2-PLAN](tasks/WP2-PLAN.md) section A. "Task" is the implementing task; tests are named in the task record.

| ID | Delivered by | Behavior |
|---|---|---|
| FR-01 user admin, deactivation | T07 (API), T12 (UI) | Admin-only router: list accounts (account fields only), create with an admin-set password that is never echoed (E-11), edit name/role/calendar, deactivate/reactivate. Deactivation revokes all sessions; the last active admin and self-deactivation are refused; every change is audited. CALFIX refuses a calendar change for a user who already has data. |
| FR-03, FR-04 categories, batch, WFH | T05, T09A/B | `category_source` default/explicit, read-time default label, `POST /api/days/batch` preview/commit with per-date `expected_version`, conflict confirmation, reason for old periods, one transaction, one audit event per changed entry; grid, mobile list, batch dialog in the UI. |
| FR-05 settings and breaks | T01, T06, T10, T12 | Break contract E-1; policy preview `POST /api/policies/preview` (no write); settings UI with preview then create. |
| FR-06 editing | T01, T10 | Clock out requires `expected_version`; day editor with explicit input zone, DST fold/gap handling, overnight end date, break outcomes, reason prompt, stale-version reload. |
| FR-08 insufficient balance service | T02, T03, ADVFIX | `postDeficitDebit` and the correction increase return a pending result when the available balance is short (R-05); reservation returns 409 `insufficient_balance` (E-5). Posting finalized deficits is WP3. |
| FR-09 OT ledger, leave | T02, T03, T04, T11 | Append-only ledger, idempotent postings, recorded permission, reserve, record use (partial), cancel, reverse, 1:1 minutes, balances traced raw/provisional/posted/reserved/available. |
| FR-13 holiday import | T08, T12 | CSV preview (issues, diff, affected days, preserved overrides), commit with preview hash, immutable version, idempotent re-commit; payroll exceptions; next-year warning (E-12). |
| FR-14 history, evidence | T04, T11 | `GET /api/history` (own audit events plus own policy and calendar versions, per-user cursor), `GET /api/ot/evidence.csv` (sectioned, neutralized, owner-only). |
| R-01, R-02 breaks | T01, T10 | Replace-set semantics, unconfirmed stays pending, future-break rejection (+5 min), typed legacy-row outcome `saved_break_after_clock_out`. |
| R-03 holiday work keeps classification | T08 | Import changes only prospective versions; the full-year classification of past dates is identical before and after commit (test). |
| R-05 leave minutes L, debit outcome | T02, T05, ADVFIX | L = the day's leave minutes entered by the employee (E-2); debit service with pending outcome; applied to corrections (ADV-A-02). |
| R-06 ledger, reservations, corrections | T02, T03 | Corrections post the difference linked to the original; a negative balance is kept and flagged (LG-08); no label spend. |
| R-07 prospective versions, reasons, audit, zones | T05, T06, T08, T10, T12 | Reasons for old periods, audit before/after, prospective boundary for policy/calendar versions and exceptions, accounting dates never regrouped by device zone. |
| AC-01 ownership | T04, T07, T12 | ID-swap 404 on every personal route (employee vs employee, admin vs employee), no admin route returns another user's private data, route inventory tests. |
| AC-03 posting and leave idempotency, concurrency | T02, T03 | Same key → one entry; multi-connection `worker_threads` races on one WAL file (LG-07). |
| AC-04 (WP2 part) reasons, audit, history | T04, T05 | Reason enforcement, audit, per-user history. PDF retention is WP3. |
| AC-05 holiday import | T08, T12 | Duplicates, dates, formula cells, preserved explicit and manual overrides, unchanged past classification, idempotent commit. |
| LG-01…LG-08, LG-10; LG-09 zero delta | T02 (LG-01, 02, 08, 09), T03 (LG-03…07, 10), T05 (LG-10 with `leave_kind`) | On production services and real SQLite. LG-09 only as "unchanged correction posts zero delta"; late review and resend are WP3. |
| DF-01…DF-16 | WP1 | Unchanged and green (`tests/domain/deficit.fixtures.test.ts`, 17/17). |

### Changed files by area

- Domain (pure, one engine): `src/domain/ledger.ts` (new), `src/domain/holidayCsv.ts` (new), `src/domain/attendance.ts`, `src/domain/index.ts`.
- Migrations: `src/server/db/migrations/0002_ot_ledger.ts`, `0003_day_entry_source.ts`, `src/server/db/migrations.ts`.
- Services: `ledger.ts`, `otLeave.ts`, `otEvidence.ts`, `history.ts`, `dayEntries.ts`, `holidayImport.ts` (new); `timesheetCommands.ts`, `timesheets.ts`, `policies.ts`, `calendars.ts`, `periods.ts`, `users.ts` (edited).
- HTTP: routers `ot.ts`, `history.ts`, `admin.ts` (new); `api.ts`, `app.ts`, `schemas.ts`, `auth.ts` (`requireAdmin`), `auth/sessions.ts` (edited).
- Client: shell, grid, list, batch dialog, day editor, OT, history, settings and admin screens, `components/`, `styles.css` tokens (E-8).
- Tests: `tests/domain/`, `tests/integration/`, `tests/client/` (new), `tests/e2e/` (new Playwright harness and specs), `tests/support/concurrency.ts`.
- T13: `src/server/seed.ts`, `src/server/cli.ts`, `scripts/smoke-built-server.mjs`, `DEVELOPMENT(.vi).md`, `README(.vi).md`, `package.json` (description), this handoff.

### Routes added in WP2 (all under `/api`)

`GET /ot/summary`, `GET /ot/ledger`, `GET|POST /ot/leave`, `POST /ot/leave/{id}/consume|cancel|reverse` (each with `expected_version`), `GET /ot/evidence.csv?from&to`, `GET /history`, `POST /days/batch`, `POST /policies/preview`, `GET|POST /admin/users`, `PATCH /admin/users/{id}`, `POST /admin/users/{id}/deactivate|reactivate`, `POST /admin/calendar/import/preview|commit`, `POST /admin/payroll-exceptions`; `GET /calendar` gained `warnings`; `POST /clock/out` requires `expected_version`. No route posts a credit or debit; a route-inventory test enumerates every mutating route and scans the routers for the posting functions.

## T13: synthetic seed, smoke and documentation

- **Seed** (`npm run seed`, `src/server/seed.ts`, `src/server/cli.ts`): three accounts `admin@example.invalid`, `employee@example.invalid` and `employee2@example.invalid`; passwords from `SEED_ADMIN_PASSWORD`, `SEED_EMPLOYEE_PASSWORD`, `SEED_EMPLOYEE2_PASSWORD`, or generated at run time and printed once; no literal password in the source. `employee2` gets sample data only through the production services: three recent weekday sessions (09:00–17:30, 08:30–19:00 and 09:00–17:30 with a confirmed 30-minute break, dates relative to the clock), one OT leave request (240 minutes, recorded permission by "Example Manager", reserved) and one setup credit of 600 minutes posted by `postCredit` with the explicit setup key `seed-setup-credit-employee2`, origin `system` and a written reason. No opening balance is inferred from any timesheet. The second account and its data are created only when the CLI asks for the development dataset (`sampleData`), so `createTestContext` and the integration tests still see two accounts, and `employee@example.invalid` stays empty, which the e2e specs need.
- **Smoke** (`scripts/smoke-built-server.mjs`, 28 checks, was 13): adds the CLI seed output for employee2 and its sample data; employee 403 on the admin area (GET and POST) and anonymous 401; admin lists the three accounts with account fields only; employee2 signs in; OT summary for employee2 (posted 600, reserved 240, available 360, not negative) and the separate summary for employee (0/0); one seeded leave request for employee2, none visible to the admin; another employee and the admin get 404 on the employee2 leave request by id and the refused cancels change nothing; evidence CSV headers (content type `text/csv`, `no-store`, safe attachment filename, `from,to,reporting_zone,generated_at_utc,days`, the seven sections in order, the seeded credit key and permission present for employee2 only, absent from the employee's CSV, three sample sessions listed); an employee gets 404 on an employee2 session by id. Result: [evidence/WP2-T13/verify.txt](evidence/WP2-T13/verify.txt).
- **Docs:** DEVELOPMENT and its translation (Node 24 requirement, `npm run test:e2e`, `E2E_CHANNEL`, seed accounts, layout rows, status line); README and its translation (status lines and the two start steps that named the superseded F-01 next action); `package.json` description only.
- **Not covered by a dedicated unit test:** the seed's sample data is checked by the smoke and by the e2e run (which seeds through the CLI) only; there is no integration test for `seedSampleData` itself.

## Freeze history (T01 to T13)

All on `main`, pushed unless stated. Freezes by `timesheet-committer` unless stated. SHAs are those recorded by the freeze task records and the board.

| Task | Freeze commit | Note |
|---|---|---|
| WP2-T01 | `396b399b2d58ccc7ea90dc78be9e7c2f9a832be2` | |
| WP2-T02 | `8930efee064ac84256b3f82b87005717a489d1b7` | |
| (records) | `f7b9f8e3f07b68e636da54ba589b286fa59561b8` | WP2-CKPT1 checkpoint before the owner decisions; `393779d` encodes E-2/E-3/E-8 (WP2-DEC); `30be0b1` accepts governance change E-8 (GOV-E8). Not WP2 source. |
| WP2-T03 | `67c7e7a6e10779163647f88b84ebd91fcea390d6` | Attempt 1 blocked by trailing whitespace in an evidence log; attempt 2 committed. |
| WP2-T04 | `e92add0b4c26e203dc5b06841f5a3f5a6bf9eb96` | Same whitespace block, then WP2-INFRA1 (`.gitattributes`). |
| WP2-ADVFIX and WP2-T05 | `e768b71c2a5e522bdfece8617599992f8f4a0abc` plus `a8a5890a75361c44ff7730d54bbaadab56c40f3a` | **Committed manually by the owner** after two classifier denials; `e768b71` is the owner's commit and it holds the modified files, `a8a5890` adds the new files (verified by WP2-T05-RECON and WP2-T05-RECON2). WP2-ADVFIX had no separate freeze; its changes are inside these two commits. |
| WP2-T06 | `197053699d9b5c125fa0c3e8ccb8acf0f421011f` | |
| WP2-T07 | `a0f06f5a3c9c6639bcd1ec79519d9bfc139bf8a6` | |
| WP2-T08 | `869bc8e5786e827144ef1d2d806725576351c720` | |
| WP2-CALFIX | `24f192dddbe658246dab020c5bc87c74a02a4310` | |
| WP2-T09A | `717db3ee30057089298a8852438f16d46aa4dc89` | |
| WP2-T09B | `9c36a7ec7e9355afbd7bb9161e24ceed4f99ab8d` | |
| WP2-T10 | `26fa7c9f5a2dda1c2b9ab73122934ede04cf186f` | |
| WP2-T11 | `55d3bb808836a0217de45470f5b743f9e5b9a667` | **Committed manually by the owner** from the IDE after a classifier denial (verified by WP2-T11-RECON). |
| WP2-T12 | `da0ffc492b608f1108e3c455e55aa01cca118b45` | Baseline of T13. |
| WP2-T13 | not yet committed | The package-final freeze, made by `timesheet-committer`; the gate and audits review that commit. |

Three freeze commits were made by the owner (T05 as `e768b71` plus `a8a5890`, T11 as `55d3bb8`) after classifier denials of the committer; the rest were committed by `timesheet-committer`.

## Verification

### T13 commands (clean export outside Dropbox)

"Clean export" = the working-tree files from `git ls-files -co --exclude-standard` copied to a directory under the OS temp folder outside Dropbox, then `npm ci`. Node `v24.21.0`, npm 11.18.0, Windows 11 x64, installed Microsoft Edge through Playwright 1.63.0.

| Command | Environment | Exit | Observed result | Evidence |
|---|---|---:|---|---|
| `npm ci --no-audit --no-fund` | clean export | 0 | 144 packages added | [npm-ci.txt](evidence/WP2-T13/npm-ci.txt) |
| `npm run verify` with `NODE_OPTIONS=--trace-deprecation --pending-deprecation` | clean export | 0 | typecheck and lint (`no-deprecated`) clean; 31 files, **599/599 tests**; build; smoke **SMOKE PASSED, 28 PASS lines, no FAIL**; no deprecation output | [verify.txt](evidence/WP2-T13/verify.txt) |
| `vitest run --reporter=json` (per-file counts) | clean export | 0 | 31 files, 599 passed, 0 failed | [vitest-per-file.txt](evidence/WP2-T13/vitest-per-file.txt) |
| `npm run test:e2e` (build, then Playwright, projects `desktop` 1280x800 and `mobile` 390x844) | clean export | 0 | **66 passed, 2 skipped** (the two mobile-only tests on the desktop project) | [e2e.txt](evidence/WP2-T13/e2e.txt) |
| `npm run digest` | project folder | 0 | `8ebce5fe790870e0d52015fde658cfef0ee60929d6dcdafd80f563725f8524a2` (611 files, `handoff/` excluded) | [digest.txt](evidence/WP2-T13/digest.txt) |
| `validate_package.py --preflight` (workflow Python) | project folder | 0 | PASS: 50 translation pairs, 874 local links, 91 reference scenarios (33 OT, 32 time, 16 deficit, 10 ledger); application tests not executed by this validator | [preflight.txt](evidence/WP2-T13/preflight.txt) |

A first clean-export `npm run verify` during this task failed 2 tests (`tests/integration/user-admin.test.ts`: user count 2 expected, 3 found) because employee2 was created by default; the seed now creates it only for the CLI development dataset. That run was discarded and is not in the evidence; the logs above are the reruns on the final source.

### Task evidence by step (author-run, not independently reproduced)

Test counts are the full-suite counts of each task's `npm run verify` (typecheck, lint with `no-deprecated`, vitest, build, smoke). Smoke was 13 checks until T13. E2E counts are Playwright passed/skipped over both projects.

| Task | Unit tests (files) | E2E | Digest (files) | Evidence |
|---|---|---|---|---|
| T01 | 194 (12) | n/a | `b25a4ab7…fcfa` (534) | [WP2-T01](evidence/WP2-T01/verify.txt) |
| T02 | 229 (14) | n/a | `56ee04d5…b358` (539) | [WP2-T02](evidence/WP2-T02/verify.txt) |
| T03 | 281 (16) | n/a | `1bd57c51…df6b` (543) | [WP2-T03](evidence/WP2-T03/05-verify.log) |
| T04 | 335 (19) | n/a | `05f9486f…f565` (550) | [WP2-T04](evidence/WP2-T04/04-verify.log) |
| ADVFIX | 344 (19) | n/a | `fac640f1…db2ec` (550) | [WP2-ADVFIX](evidence/WP2-ADVFIX/02-verify.txt) |
| T05 | 387 (21) | n/a | `80921558…4ac0` (554) | [WP2-T05](evidence/WP2-T05/02-verify.txt) |
| T06 | 414 (22) | n/a | `155bafeb…2b84a` (555) | [WP2-T06](evidence/WP2-T06/03-verify.txt) |
| T07 | 448 (23) | n/a | `705d78fd…f954c5` (557) | [WP2-T07](evidence/WP2-T07/04-verify.log) |
| T08 | 514 (26) | n/a | `95b5291b…b061` (562) | [WP2-T08](evidence/WP2-T08/05-verify.log) |
| CALFIX | 524 (26) | n/a | `b18c6768…baf3` (562) | [WP2-CALFIX](evidence/WP2-CALFIX/04-verify.log) |
| T09A | 524 (26) | 7 passed, 1 skipped | `6c1947e3…4133` (566) | [WP2-T09A](evidence/WP2-T09A/commands.txt) |
| T09B | 541 (27) | 15 passed, 1 skipped | `4d242ea9…159b` (577) | [WP2-T09B](evidence/WP2-T09B/commands.txt) |
| T10 | 571 (28) | 42 passed, 2 skipped | `84355bd3…155e` (590) | [WP2-T10](evidence/WP2-T10/verify.txt) |
| T11 | 582 (29) | 50 passed, 2 skipped | `afe8e004…e8ba` (598) | [WP2-T11](evidence/WP2-T11/verify.log.txt) |
| T12 | 599 (31) | 66 passed, 2 skipped | `321d2a53…e54` (611) | [WP2-T12](evidence/WP2-T12/verify.log.txt) |
| T13 (clean export) | 599 (31) | 66 passed, 2 skipped | `8ebce5fe…24a2` (611) | [WP2-T13](evidence/WP2-T13/verify.txt) |

Full digests are in the task records. The WP2-DEC documentation task ran `npm run verify` and `validate_package.py --preflight` (both exit 0, 91 reference scenarios; `evidence/WP2-DEC/`), WP2-ADVFIX ran preflight (exit 0, [04-preflight.txt](evidence/WP2-ADVFIX/04-preflight.txt)), and WP2-CALFIX recorded preflight exit 1 from a link in `tasks/WP2-T08.md` that points to a directory (not caused by the change; [06-preflight.log](evidence/WP2-CALFIX/06-preflight.log)); the result for this task is in the table above.

Red-first and mutation evidence (author-run): T01 red 18 failed/2 passed, then 20/20 green, with a mutation that removes the zero-row guard failing exactly the zero-row regression; T02 red 35 failed/10 passed then 45/45 on the three targeted files, two mutations killed; T03 red 13 failed/11 passed then 63 passed, one mutation killed, concurrency harness self-check double-books 5/5 without the transaction; T04 red 34 failed/8 passed then 62 passed, three mutations killed; T07 red 32 failed/38 passed then 70 passed, five mutations killed; T08 red 37 of 40 failed then 107 passed, 11 mutations killed; CALFIX red 7 failed/32 passed then 39 passed, three of five mutations killed (the other two are defence in depth behind schema foreign keys, recorded in the task).

### Concurrency and migrations (author-run; the gate repeats them)

- LG-07 and the other races run on separate `worker_threads` connections to one WAL file through the production services (`tests/integration/ot-leave-concurrency.test.ts`, 8 tests inside `npm test`). One recorded run: LG-07 25/25 rounds with exactly one winner and one 409 `insufficient_balance`; four racers of 80 at balance 200: 20/20 exactly two winners; same request key 20/20 one `reserved` plus one `duplicate`; use 80 vs 80 of 120: 20/20; same use key 20/20 one posting; cancel vs use 20/20; reverse vs reverse 20/20 ([03-concurrency-verbose.log](evidence/WP2-T03/03-concurrency-verbose.log)). Five more runs passed ([06-concurrency-repeat-5-runs.log](evidence/WP2-T03/06-concurrency-repeat-5-runs.log)); the advisory verifier ran it five times on the T04 freeze, all 8/8 (`evidence/WP2-ADV-GATE/`). The advisory auditor ran its own separate-process races (LG-07 30/30 and 20/20, four racers 20/20, double use/reverse and cancel versus use 20/20; the unsafe control double-booked 10/10).
- The gate's step "repeat at least 20 times in one run" and "upgrade a database created at `f32978f` through all WP2 migrations" (plan section D steps 3 and 4) have **not** been run by a gate on the final freeze. The upgrade was probed by the advisory reviewer on the T04 freeze (before migration 0003) and is covered by the migration tests, which include 0003.

## AC IDs covered; genuinely unrun/blocked paths

- Covered by tests and browser flows (author-run): AC-01 for the WP2 ledger, leave, export, history and admin areas; AC-03 posting and leave idempotency and concurrency; the WP2 part of AC-04; AC-05; the ledger fixtures named above; the core browser flows of plan section D step 5 as far as the specs listed in the task records: sign-in and two-week view, manual entry with breaks (R 480 / credit 0), Clock in and out with version, batch category with conflict, partial leave 240 and WFH, permission, reserve 480, partial use, cancel and reverse, insufficient balance, evidence CSV download, holiday CSV preview with error rows and commit, user deactivation revoking the session, second employee ID/URL swap, admin cannot open employee data.
- **Not run by a separate gate or audit:** everything is author-run. WP2-GATE (clean export on the freeze, 20-fold concurrency, WP1→WP2 upgrade, the gate screenshot set), WP2-AUDIT-A and WP2-AUDIT-B are pending.
- **Not run by design:** finalization, revisions, snapshots, PDF, signatures, email, late review and resend (LG-09 beyond the zero-delta check): WP3; Docker, Linux/NAS, backup/restore, workbook import: WP4; the real pilot: WP5. The test databases run on Windows only; Linux x64/arm64 prebuilds are shipped but not exercised. The e2e run uses installed Edge; Chrome and Chromium paths (`E2E_CHANNEL`) were not exercised by these tasks.
- Mobile layout is asserted by overflow and 44 px target checks; the screenshots were viewed by the author and committer, not by an independent reviewer.

## Decisions

All decisions below are encoded in the canonical documents (English and Vietnamese) or the board.

### Owner decisions (2026-10-03, reply "dùng đề xuất"; encoded by WP2-DEC)

- **E-2:** OT-funded leave is not a day category. Day entries carry leave minutes with a `leave_kind` (vacation | sick | ot); L for deficits (R-05) is the leave minutes the employee entered; the UI warns when the day's OT-kind minutes differ from the request's consumed minutes (informational, in T10/T11); nothing is ever spent automatically. Docs 02, 03, 04, 10; the LG-10 fixture field was renamed (`change_category` → `change_leave_label`, category → `leave_kind` `ot`), with no change to IDs, count or expected numbers.
- **E-3:** OT leave is consumed only by an explicit, idempotent employee "record use" action on or after the leave date (partial use allowed); an unconsumed reservation stays reserved until used or cancelled, and WP3 review flags it. WP2 has no job runner.
- **E-8:** the visual standard is plain CSS custom properties in `src/client/styles.css`, 4 px radius, 300 ms ease-out transitions through one custom property, high-density mobile-first layout. docs/04 records it (WP2-DEC). The AGENTS.md UI section was changed by the separate governance task GOV-E8 (accepted at `30be0b1`).

### Coordinator decisions (routine, within contracts; all reversible by the owner)

- **E-1** break list at Clock out: omitted keeps the saved rows (unconfirmed clock-out only); a present list is the complete set and replaces the saved rows, confirmed or not (T01; omitted plus confirmed is 422 `breaks_required`).
- **E-4** holiday import preserves personal explicit labels and manually added calendar dates; a date is removed only when selected in the preview (T08).
- **E-5** insufficient balance at reservation: 409 `insufficient_balance`, no reservation created (T03).
- **E-6** provisional credits: credited minutes of complete days in unfinalized periods, shown per period (T04).
- **E-7** permission evidence is a text reference in WP2; file attachments wait for the WP3 private file store (T02, T03).
- **E-9** `@playwright/test` 1.63.0 exact devDependency, separate `test:e2e` script, not part of `verify`; installed Edge by default (T09A).
- **E-10** a payroll exception refreshes the stored unfinalized period row in the same transaction and is refused (409 `period_finalized`) if a finalized timesheet references it (T08).
- **E-11** admin-created users get an admin-set temporary password out of band; there is no reset route and no email in WP2 (T07).
- **E-12** warn from 1 October when the effective calendar has no dates for the next year (T08).
- **E-13** WP2 history = the user's own audit trail plus policy and calendar versions (T04, T11).
- **ADV-A-02, R-05 applied to corrections** (2026-10-03, WP2-ADVFIX): the increase of a deficit-debit correction is checked with `canDebit` and becomes `pending` when the available balance is insufficient; a correction that lowers a spent credit may still go negative and is flagged (LG-08). Recorded in docs 02 and 10. ADV-A-01, A-03 and A-04 were fixed; ADV-A-05 (duplicate append path) is backlog.
- **CALFIX refusal** (2026-10-03, WP2-CALFIX): a user's calendar cannot be changed once the user has any timesheet, day entry, session, ledger entry or leave request (409), because reassignment would regroup draft days, relabel and recalculate them, and orphan existing timesheets (T08 probe: `calendar-reassignment-probe*.txt`). Recorded in docs 03 and 10. Prospective, effective-dated reassignment is recorded as an owner option.
- **T09 split** (2026-10-03, WP2-T09-PREP): T09 became T09A (harness, E-8 tokens, shell, `api.ts` types) and T09B (grid, mobile list, batch edit), each with its own freeze; `tsconfig.test.json` and a `tests/client/` unit file joined the owned paths. The client maps server fields to display states only and computes no business minutes.
- **WP2-INFRA1:** `.gitattributes` line `handoff/delivery/evidence/** -whitespace`, because verbatim logs of failing `git diff --check` blocked four commits; the privacy scan still covers evidence; the package audit reviews it.

### T13 implementation choices (this task)

- Employee2 and the sample data are created only through the CLI development dataset, so existing integration tests keep two accounts.
- `src/server/cli.ts` was touched to pass `SEED_EMPLOYEE2_PASSWORD` and enable the dataset (deviation below).
- The smoke's evidence range runs 30 days back to 30 days ahead so that the seeded leave date (about two weeks ahead) is inside it.

## Findings

- **Resolved in WP2 (author-reported):** ADV-A-01 (correction retry with a different value now 409 `source_key_conflict`), ADV-A-02 (see above), ADV-A-03 (stale `expected_version` on cancel is 409 even when nothing is reserved), ADV-A-04 (history cursor is a per-user ordinal, no global audit rowid leak) — each with a regression test and the reviewer's probes rerun ([05-reviewer-probes-rerun.txt](evidence/WP2-ADVFIX/05-reviewer-probes-rerun.txt)); the T08 calendar-reassignment defect (CALFIX); the WP1 carried risks (break list semantics, future break rows, Clock out without `expected_version`, rollback after the delete and the zero-row branch: T01; payroll exceptions versus stored rows: T08).
- **Defects found and fixed during work:** the e2e suite caught a hash-route normalisation defect (T09A); a zero-length session when Clock out follows Clock in within a second (specs wait 1.5 s; the server answers `end_not_after_start`, T10).
- **No independent finding exists yet.** The package audits may add findings.

## Known limitations and carry-forward notes

1. **WP3 must handle the `CorrectionResult` pending variant** (`status: pending`, `reason: insufficient_balance`, `entry: null`, `deltaMinutes: 0`, `debitIncreaseMinutes`, `availableMinutes`). Callers that only expect `posted | duplicate` will break (ADVFIX). Likewise a pending deficit debit is returned but **not persisted** (T02 note 2): WP3 must store the proposal in the revision. The reconciliation flag is computed from the balance and has no acknowledge/clear workflow; `postCredit` rejects 0 minutes, so callers skip zero-credit days.
2. **Provisional figures must drop at finalization.** The summary skips finalized periods, but nothing finalizes yet, so WP3 must finalize the period when it posts credits; otherwise provisional minutes would double count (T04 note). Provisional periods are derived from days that have sessions; periods holding only day entries are not listed.
3. **Prospective calendar reassignment is an owner option.** Today a user's calendar cannot change once data exist (CALFIX). Changing it prospectively with an effective date, a documented migration of draft periods and the reporting zone, is not designed or built; ask the owner if it is needed.
4. **Display-only domain functions in the client.** The day editor calls the shared pure domain functions `suggestBreaks`, `expectedFinishUtc` and `resolveLocalDateTimeCompatible` for prefill, expected finish and the DST gap shortcut, with the policy from `GET /api/policies` (T10 gap 1). The server still validates every body and computes every minute. If the owner wants a strictly server-provided expected finish, a day-view field is needed (WP3 or a later fix). The client also computes completeness states from server fields (`dayModel.ts`) and no business minutes.
5. **Import cycle between `policies.ts` and `timesheets.ts`** (T06): function-level only (`listPolicyVersions` one way; `calculateDay` and the loaders the other). It works under Node 24 ESM; a later refactor could move the shared helpers into a third module.
6. **Future days and attendance-expected status.** The server reports `attendance_expected` and `no_records` for future days; the client maps an expected day with no session after `today_local` (from `/api/periods/current`, never the device clock) to `upcoming`, and a past day to `missing record` (T09B observation, T10). A server field with the per-day relation to today would be cleaner (WP3 or T10-style fix). Review/delivery status (docs/04) has no source until WP3; the grid shows only `Draft` from `timesheet.finalized`.
7. **Other limits recorded by the tasks:** no `GET /api/ot/leave/{id}` (the ID-swap 404 contract is tested on the three POST actions); reserve idempotency compares date, minutes and permission facts, not the free-text note; the service does not require actor = owner (the router passes the session user for both); the holiday CSV travels as a JSON string within the 64 KB body limit (500 rows maximum); a retried identical holiday commit after the prospective boundary moved gets `retroactive_change` rather than a no-op (T08); a payroll exception without a stored period row is only recorded; a calendar with no version is refused; the seed's sample data have no dedicated unit test; ADV-A-05 (one internal append function) is backlog.
8. **Inherited from WP1:** the login limiter is per process and keyed by socket address; sessions have a 7-day absolute lifetime without idle timeout; users are created only by seed/CLI and by the new admin route; `npm ci` inside the Dropbox folder can fail with `EBUSY`. The package validator stops on a directory link such as the one in `tasks/WP2-T08.md` (a link to a directory fails it; the links in this handoff point to files only, and the preflight above passes); that is a record fix outside the source digest.
9. **Environment:** the e2e harness needs Node 24 first on `PATH`, installed Edge (or Chrome with `E2E_CHANNEL=chrome`) and free space in the OS temp folder; on this machine the `B:` temp drive filled up once during T13 and the clean export was moved to the user temp folder on `C:`.

## Evidence index

All folders are under `handoff/delivery/evidence/`. Logs are masked, LF, without trailing whitespace; screenshots are synthetic (`*-synthetic.png`); CSV samples are `*-synthetic.csv.txt`.

| Folder | Content |
|---|---|
| `WP2-PLAN/` | Baseline of the plan |
| `WP2-T01/` … `WP2-T08/` | Per task: red and green runs, mutation checks, `verify`, `digest`; T03 also the concurrency runs; T04 the evidence CSV sample; T08 the calendar-reassignment probe source and output |
| `WP2-ADV-GATE/`, `WP2-ADV-REVIEW/` | Advisory verifier run and advisory auditor probes on the T04 freeze (00-commands.txt indexes every command and exit) |
| `WP2-ADVFIX/`, `WP2-CALFIX/`, `WP2-DEC/`, `WP2-INFRA1/` | Fix, decision and infrastructure tasks |
| `WP2-T05-PRIVSCAN/`, `WP2-T05-RECON/`, `WP2-T05-RECON2/`, `WP2-T11-RECON/` | Privacy scan and reconciliation of the manual freezes |
| `WP2-T09-PREP/` | Read-only probes for the browser harness and the T09 split |
| `WP2-T09A/`, `WP2-T09B/`, `WP2-T10/`, `WP2-T11/`, `WP2-T12/` | Browser evidence: logs and synthetic screenshots (4, 6, 19, 4 and 14 images) |
| `WP2-T01-FREEZE/` … `WP2-T12-FREEZE/`, `WP2-CALFIX-FREEZE/`, `WP2-CKPT1/` | Committer checks, commit messages and logs |
| `WP2-T13/` | This task: `npm-ci.txt`, `verify.txt`, `vitest-per-file.txt`, `e2e.txt`, `digest.txt`, `preflight.txt`, `commands.txt` |
| `WP2-GATE/` | **Does not exist yet** (the gate creates it, with the screenshot set and `evidence-export-synthetic.csv.txt`) |

Task records: `handoff/delivery/tasks/` (`WP2-PLAN.md`, `WP2-T01.md` … `WP2-T13.md`, the FREEZE, FIX and decision records). Advisory review: [WP2_ADV_LEDGER_REVIEW.md](WP2_ADV_LEDGER_REVIEW.md).

## Deviations (T13)

Outside the owned paths of the brief: `src/server/cli.ts` (twelve lines: pass `SEED_EMPLOYEE2_PASSWORD`, enable the development dataset, print the sample-data line). README step 3 and step 4 and the closing paragraph were updated together with the status line, because the old text named the superseded F-01 next action. `tests/e2e/fixtures.ts` was not edited. No other deviation.

## Acceptance record (WP2-ACCEPT)

**PLACEHOLDER: to be completed by WP2-ACCEPT after WP2-GATE and both independent audits pass on the same commit. Do not fill in before then.**
