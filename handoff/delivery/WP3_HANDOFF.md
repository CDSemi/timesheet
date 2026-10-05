# WP3 handoff — Submission, PDF, delivery, automation and sharing

Completed from [HANDOFF](../templates/HANDOFF.md) with actual evidence. Translation: [WP3_HANDOFF.vi.md](WP3_HANDOFF.vi.md). Every number below is copied from a task record or an evidence file named next to it; nothing was re-run to produce a figure except where a row says so. A figure that was not run or not verified is labelled as such. The sections before "Next action" are the T15 state as written then (the fix-round sections keep their own dates); the gate and the fresh audits have since run, and the acceptance record at the end is the authority for the package identity and the gate and audit verdicts. Where a figure below differs from the acceptance record, the record wins.

- **Package/scope, date and author:** WP3 only, per [WP3-PLAN](tasks/WP3-PLAN.md), [WP3-REQ](tasks/WP3-REQ.md), [WP3-REQ2](tasks/WP3-REQ2.md), [WP3_IMPLEMENT](../prompts/WP3_IMPLEMENT.md) and [09 Roadmap](../../docs/09_IMPLEMENTATION_ROADMAP.md): review and sign-off, finalization with revisions and corrections, the PDF, the private file store, capture and SMTP delivery, the durable job runner, deadline automation, reminders, owner-granted sharing, the admin status view and the end-to-end evidence. 2026-10-04 → 2026-10-05 (evidence timestamps are UTC). Authors: Claude Code subagents of the timesheet orchestration mission (one source writer at a time); this handoff and the developer-doc changes were written by a `timesheet-worker` (WP3-T15).
- **Actual model/effort/speed, or not observable:** self-reported by the task records. T01, T05, T08, T09 and T13B ran on `claude-opus-5-5` (profile `timesheet-worker-high`, override `opus`); T00, T02, T03, T04, T06, T07, T07B, T10, T11, T12, T13, T13A, T13C, T13D, T14, WP3-DOC and this task ran on `claude-sonnet-5-5`; the GOV-WP3P audit ran on `claude-opus-5-5`. Effort and speed are not observable from inside the sessions; confirm them in the client.
- **Commit SHA, source digest and unpushed commits, or complete source archive:** the last implementation freeze is WP3-T14-FREEZE, commit `b083739bb8f1d7e8b932c8d5463bfb271ac5b1e5` (pushed, [WP3-T14-FREEZE](tasks/WP3-T14-FREEZE.md)), source digest `677b914268406543b542a5bbb2491e46266ae1bf5e2d950239a259778329b20c` over 717 files (`handoff/` excluded). WP3-T15 changed only developer docs and `package.json` description on top of it: source digest after this task `96870f7eaf5a0e892a9682e28931b3c46cf2888a4bfae3abd242b541e6a6e729` over 717 files (T15 run, `evidence/WP3-T15/`). The T15 changes are uncommitted until WP3-T15-FREEZE; the package-final freeze SHA and digest are written by the gate and the acceptance record, never by hand here. No unpushed commit existed at the T15 baseline.
- **Implementation status; independent review status:** all WP3 implementation tasks (T00–T14 with T07B and T13A–T13D) are implemented and frozen by the board; T15 (this handoff) is the package-final documentation task. Independent review of the software: **not yet run** (WP3-GATE, then the fresh audits). The only independent review so far is the governance audit GOV-WP3P-AUDIT (PASS on `da6d0cd`, [GOV_WP3P_REVIEW](GOV_WP3P_REVIEW.md)), which covers the prompt scope and gate sentences only.
- **Implemented behavior and changed files:** see "Scope delivered by task" below.
- **Migrations/schema compatibility:** three migrations, all append-only and checksum-guarded (see "Migrations 0004–0006").
- **Changed canonical contracts and reason, or none:** yes, all recorded in English and Vietnamese by WP3-DOC (cb9800e): docs 01, 02, 03, 04, 05, 06, 07, 09 and 10, the WP3 prompts and `reference/examples/policy.example.json`, for the owner decisions of 2026-10-04 (see "Owner decisions implemented"). The calculation rules R-01…R-07 and the fixture numbers are unchanged. One governance change: GOV-WP3P (see below).
- **Verification table:** below. All commands ran with the Node 24 portable runtime (`v24.21.0`) called by full path.
- **AC IDs covered; genuinely unrun/blocked paths:** below.
- **Synthetic screenshots/PDF/mail-capture evidence:** screenshots `*-synthetic.png` are in the T12, T13, T13C, T13D and T14 evidence folders; the five PDF page renders (`pdf-*-synthetic.png`) are in `evidence/WP3-T14/`. Mail capture was inspected in the smoke script and `tests/e2e/submission.spec.ts`; no `.eml`, PDF or CSV is stored in the repository.
- **Findings resolved, remaining defects and optional backlog:** below ("Limitations and carry items").
- **Owner setup inputs needed, excluding secrets:** none for software readiness. For the pilot packet: the SMTP host, port and security mode, a sender address, the payroll recipients, the public HTTPS base URL, the data directory and the activation instant. Values are supplied by the owner outside the repository; no secret is requested in chat. Open owner question: F-Q6 (the WP2-A-01 holiday-preview privacy rule is kept as is and the question is re-asked).
- **Production actions and explicit authorization, normally none:** none. No deployment, no host exposure (loopback only), no real email, no real data. `PRODUCTION_SENDING_ENABLED` is never set; outbound mode is capture throughout. The activation instant is empty.
- **Usage/credits only if actually observable:** not observable in these sessions.
- **One next action and matching prompt:** run WP3-GATE ([WP3-GATE](tasks/WP3-GATE.md)) on the WP3-T15-FREEZE commit, then the fresh independent audits ([WP3_REVIEW](../prompts/WP3_REVIEW.md)); do not begin WP4 before they pass.

## Orchestration provenance

- **Mission/task IDs and board/checkpoint:** mission `timesheet-software-readiness`, package WP3, tasks WP3-PLAN, WP3-REQ, WP3-REQ2, WP3-T00 … WP3-T15 (with WP3-T07B, WP3-T13A–WP3-T13D, WP3-T07-RECON, WP3-E2E-RECHECK, WP3-REC1, WP3-TMPCLEAN, WP3-DOC), GOV-WP3P (FREEZE, GATE, AUDIT) and one FREEZE per implementation task. Board: [ORCHESTRATION.json](ORCHESTRATION.json); briefs and results: `handoff/delivery/tasks/`; checkpoint: [WORKFLOW_REVISION_CHECKPOINT.md](WORKFLOW_REVISION_CHECKPOINT.md).
- **Implementer and independent auditor identities; separate contexts:** every task ran in its own subagent context. No WP3 package audit exists yet; the gate and audits must use fresh contexts that did not author any WP3 change.
- **Current verified/reviewed digest; review report and decision:** the digest of record will be the one the gate computes on a clean export of the WP3-T15-FREEZE commit. No review report or decision exists yet.
- **Remaining tasks/dependencies; one next coordinator action:** WP3-T15-FREEZE, WP3-GATE, the two fresh audits, then the board accept step. Next coordinator action: dispatch WP3-T15-FREEZE after this task's checks, then WP3-GATE.
- **Software readiness and pending owner pilot authorization separately:** software readiness of WP3: implemented, not yet gated or audited. Owner pilot authorization: not requested and not given; nothing is deployed and no real mail has been sent.

## Owner decisions implemented

Source: [docs/10, "Owner decisions — 2026-10-04"](../../docs/10_DECISIONS_AND_SOURCES.md), the board `owner_decisions` and [WP3-REQ2](tasks/WP3-REQ2.md).

| Decision | What it implements | Delivered by |
|---|---|---|
| F-1 | A period with no saved entries is still submitted automatically with default labels, zero OT and no deficit | T10 (empty-period test), T14 e2e |
| F-Q1, F-Q2 | No automatic indicator on outgoing PDF and email; the signature block prints the name and the automatic submission date; the image only with the explicit authorization; optional user note line (default "Automatic submission", off); the system keeps origin deadline, review pending, empty `signed_at`, no sign-off | T07B (schema 0005, renderer, snapshot v2), T13 (settings), T14 (renders) |
| G-Q1 (b) | The signature upload asks for the automatic-image authorization, pre-selected; one explicit audited act; unticked means no image until authorized in Settings | T07B (`?authorize_auto_image=`), T13 (upload consent UI) |
| G-Q2 (a) | `{SignOffStatus}` renders "Submitted" for manual and automatic, or the note text for an automatic submission with the note on | T07B |
| F-2 | A pending deficit debit stays an immutable line of its revision, shown on the review and OT screens, re-evaluated only by a later finalized revision; no background posting | T05, T06, T12 |
| F-3, F-Q3 | Administrators see everything except timesheet details, including recipient addresses but not templates or message content | T13D |
| F-3, F-Q4, F-Q5 | Item-by-item owner-granted sharing (view, edit, OT read, PDF download), revocable, audited, never transitive; admins list and revoke only | T13A, T13B, T13C |
| F-4 | One system-wide activation instant (empty until the pilot) combined with each user's auto-submit effective instant | T03 (per-user instant), T10 (activation, scan) |
| F-5 | The PDF total is the credited OT total in h:mm over all 14 days, hidden when "Show OT on PDF" is off | T07 |
| F-Q6 | **Open.** WP2-A-01 (no employee-derived holiday-preview counts) is kept unchanged and the question stays open for the owner | not changed |

## Scope delivered by task

Each row names the board freeze commit (`git` abbreviated SHA) and the verify result the task record reports: test files / tests of `npm run verify` at that task. The T14 freeze record is the last figure.

| Task | Freeze | Behavior | Verify (files / tests) |
|---|---|---|---|
| WP3-T00 | `db75346` | Evidence-CSV formula guard on the first non-whitespace trigger (WP2 R2); smoke picks a free port and fails with a visible line (WP2-A4-01) | 32 / 619 |
| WP3-T01 | `ac5d0ba` | Migration 0004 `submission` (attachments, submission settings versions, revisions, sign-offs, revision ledger lines, revision files, jobs, delivery attempts, reminder occurrences, operations state); `loadDeliveryConfig` (data dir, public base URL, sender, outbound mode, redacted SMTP secrets) | 33 / 674 |
| WP3-T02 | `b060d33` | Private file store (atomic put, opaque keys, orphan sweep), PNG/JPEG signature check, `POST /api/signatures` (256 KiB limit), owner-only signature download, audit | 35 / 711 |
| WP3-T03 | `79862bb` | Submission settings (append-only versions, validated recipients, safe template engine, auto-image authorization, write-free preview), `/api/settings/submission*` | 37 / 821 |
| WP3-T04 | `b89f8a8` | Canonical JSON and SHA-256 snapshot, the review payload built only from the engine, read-only `GET /api/timesheets/:payrollDate/review` | 39 / 878 |
| WP3-T07 | `c289375` | Deterministic pdf-lib renderer with embedded DejaVu fonts, bounded signature image, both Sundays in the OT total | 40 / 906 |
| WP3-T05 | `72f1920` | `POST .../signoff` in one IMMEDIATE transaction: revision 1, sign-off, debits then credits through the one ledger, pending debit lines (F-2), two jobs; idempotent replay; stale review 409 | 42 / 930 |
| WP3-T06 | `2f8011a` | Corrections with a required reason (differences only, revision-specific keys), late review (zero delta, LG-09), explicit resend with a frozen envelope; ledger R1 (`sourceRef` compared) | 43 / 959 |
| WP3-T08 | `3d7a17c` | Durable job store (leases, retry 1/5/15/60 min, redacted codes), runner, PDF job, `run-jobs` CLI, server runner (`JOB_RUNNER`) | 45 / 980 |
| WP3-T09 | `0a26afa` | Message builder, capture and SMTP adapters with outcome classification, send job with crash recovery, delivery history and decision routes | 47 / 1005 |
| WP3-T10 | `0321be6` | Deadline automation: activation instant, automatic finalization (origin deadline), overdue records, chronological recovery, manual/deadline race tests | 49 / 1038 |
| WP3-T11 | `c3d32b9` | Reminders (24 h, 2 h, overdue, outcome notice), dedupe, collapse, login-required deep links, employee-only email | 51 / 1095 |
| WP3-T12 | `8e2c2bf` | Review and sign-off screen, stale handling, deep link, review and delivery status in the header | 52 / 1135 |
| WP3-T13D | `19723b6` | Admin operations and submissions status with a key allowlist (F-3, F-Q3 (b)) | 53 / 1150 |
| WP3-T13A | `c1e4bb2` | Actor/subject seam in the router factories and audit; delivery configuration injected into the app (no behavior change; route inventory identical) | 54 / 1164 |
| WP3-REC1, WP3-DOC | `632092d`, `cb9800e` | REC1: a records-only commit of the E2E recheck evidence; DOC: canonical docs, prompts and policy example updated for the 2026-10-04 decisions | 54 / 1164 (DOC) |
| GOV-WP3P | `da6d0cd` | Governance change: the WP3 scope and gate sentences in the four WP3 prompts (see below) | not applicable |
| WP3-T07B | `943027b` | Migration 0005; note line and image option; snapshot v2; one `SignOffStatus` text; renderer without an automatic indicator; manual image required | 54 / 1232 |
| WP3-T13 | `5b90d30` | Owner-only PDF download (`GET /api/revisions/:id/pdf`), history and delivery screens, submission settings UI, signature upload consent, grid status | 57 / 1292 |
| WP3-T13B | `c3c35de` | Migration 0006 `timesheet_shares`; shares service and routes; `/api/shared/:ownerId` allowlist (17 routes) with in-transaction re-check; owner-only revision list; history attribution; admin share list and revoke | 59 / 1356 |
| WP3-T13C | `8ad2e4f` | Sharing settings, "Shared with me" switcher and bar, shared views, history from the revision list; `GET /api/signatures/current` answers 200 `{signature: null}` | 60 / 1383 |
| WP3-T14 | `b083739` | End-to-end flows (sign-off and conflict, automatic submission matrix, resend and uncertain decision, admin boundary), smoke checks, visual PDF renders, capture fix (no `attachment.pdf` for attachment-less messages), seed and `MAIL_FROM` | 60 / 1384 |

WP3-E2E-RECHECK (verifier, HEAD `c1e4bb2`, digest `0edefc94…03299`) re-ran `npm run test:e2e` after the T13A run hit a socket-buffer error: exit 0, 97 passed, 3 skipped, no `ERR_*` line ([WP3-E2E-RECHECK](tasks/WP3-E2E-RECHECK.md)). WP3-T07-RECON (verifier) explained a T07 digest mismatch (the worker edited a test after digesting) and re-verified: 40 files / 906 tests, exit 0 ([WP3-T07-RECON](tasks/WP3-T07-RECON.md)).

Routes added in WP3 (all under `/api`; the task records hold the contracts): `POST /signatures`, `GET /signatures/current`, `GET /signatures/:id`; `/settings/submission*` (read, versions, save, preview, auto-image authorize and revoke); `GET /timesheets/:payrollDate/review`, `POST .../signoff`, `GET .../finalization`, `POST .../revisions`, `POST .../late-review`; `GET /revisions`, `GET /revisions/pending-lines`, `POST /revisions/:id/resend`, `GET /revisions/:id/pdf`; `GET /deliveries`, `POST /deliveries/:id/decision`; `GET|POST /shares`, `PUT /shares/:id`, `POST /shares/:id/revoke`, the `/shared/:ownerId` allowlist; `GET /admin/operations`, `GET /admin/submissions`, `GET|PUT /admin/automation*`, `GET /admin/shares`, `POST /admin/shares/:id/revoke`. No route posts a credit or debit directly; the route-inventory tests enumerate every mutating route.

## Migrations 0004–0006

- `0004_submission` (T01): the tables listed above plus `timesheets.imported_unverified`; STRICT, composite `(id, user_id)` keys, immutability and one-open-attempt triggers; no column stores a secret, credential, token or file body. Upgrade from a v3 database created by the `5fafeae` code applied only 0004 and kept every v3 row (`evidence/WP3-T01/04-upgrade-5fafeae.txt`: `integrity_check` ok, `foreign_key_check` empty).
- `0005_automatic_presentation` (T07B): `submission_settings.auto_note_enabled` and `auto_note_text` by `ALTER TABLE ADD COLUMN`; existing versions read as "off, default text"; the 0004 checksum is pinned in a test.
- `0006_timesheet_shares` (T13B): `timesheet_shares` (owner, grantee, items, revocation fields, one active share per pair, no delete); 0001–0005 checksums pinned.
- The WP3-GATE brief item 11 repeats the upgrade from the accepted WP2 source `5fafeaee72509c6110a907458643bf7582dad81a` through 0004–0006; that gate run has not happened.

## Dependencies added

Exact pins in `package.json` and `package-lock.json`. Runtime: `pdf-lib` 1.17.1, `@pdf-lib/fontkit` 1.1.1, `dejavu-fonts-ttf` 2.37.3 (T07), `nodemailer` 10.0.14 (T09). Dev: `pdfjs-dist` 6.4.299 (T07; pulls optional `@napi-rs/canvas` platform packages, no install script), `smtp-server` 3.19.17 and `@types/smtp-server` 3.5.13 (T09). The task records state that `npm view` reports no `deprecated` field and that the verify logs show no deprecation line (T07: +20 packages, T09: +6, none removed).

## Commands

| Command | Purpose | Last recorded result |
|---|---|---|
| `npm run verify` | typecheck, lint, test, build, smoke | T14 record: exit 0, 60 files / 1384 tests, no deprecation line; T15 run below |
| `npm run test:e2e` | build, then Playwright desktop and mobile on the installed Edge channel | T14 record: 127 passed, 5 skipped (132 across both projects, `evidence/WP3-T14/06-e2e.txt`) |
| `npm run digest` | source digest, `handoff/` excluded | T14: `677b9142…9b20c`; T15: `96870f7e…6e729` |
| `npm run smoke` | built server over HTTP with a throwaway database | T14 evidence `07-verify.txt`: SMOKE PASSED, 40 `PASS` lines (the T14 record's "46 checks" was wrong: the log shows 40 `PASS` lines, and every gate run confirms 40; see the acceptance record) |
| `node dist/server/cli.js run-jobs --once --now <UTC instant>` | one deterministic job pass; refused in production | covered by `tests/integration/jobs-restart.test.ts` and the smoke script |
| `node scripts/precommit-check.mjs` | privacy gate on a temporary index | run by every freeze task, 0 findings |

## Verification

All figures are the task records' own unless the row says "T15". No independent reproduction exists yet; WP3-GATE repeats them on a clean export.

| Check | Environment | Exit | Observed result | Evidence |
|---|---|---:|---|---|
| T14 `npm run verify` with `--trace-deprecation --pending-deprecation` | Node 24.21.0 | 0 | 60 files / 1384 tests, no deprecation line | `evidence/WP3-T14/07-verify.txt` |
| T14 `npm run test:e2e` | Edge, desktop 1280x800 and mobile 390x844 | 0 | 127 passed, 5 skipped | `evidence/WP3-T14/06-e2e.txt` |
| T14 `npm run digest` | Node 24.21.0 | 0 | `677b9142…9b20c` (717 files) | `evidence/WP3-T14/08-digest.txt` |
| T15 `npm run verify` with `--trace-deprecation --pending-deprecation` | Node 24.21.0, Windows, run in place | 0 | 60 files / 1384 tests; no deprecation line; SMOKE PASSED | `evidence/WP3-T15/` |
| T15 `npm run digest` | Node 24.21.0 | 0 | `96870f7e…6e729` (717 files) | `evidence/WP3-T15/` |
| Race and fault-injection tests | worker threads, killed child processes | 0 within each task's verify | T05: two different sign-offs 20 rounds, identical 10, sign-off vs edit 10; T10: manual vs deadline 20 rounds (sign-off won 3, deadline 17) and scan vs scan 10; T08: three runner processes claim 40 jobs once; T08/T09: kill before write, between write and rename, after rename, after the sink received the message, before and after `sending` | `evidence/WP3-T05/`, `WP3-T08/`, `WP3-T09/`, `WP3-T10/` |
| Mutation checks (author-run) | per task | n/a | every task reports its mutations as all caught (T00 one guard mutation reverted and restored, T01 6, T02 14, T03 18, T04 16, T05 13, T06 19, T07 14, T07B 19, T08 13, T09 4, T10 12, T11 16, T12 8, T13 16, T13A 6, T13B 10, T13C 11, T13D 8) | each task's `03`/`04` mutation log |

AC mapping: the WP3-T14 gate mapping (`evidence/WP3-T14/10-gate-mapping.txt`) lists, per gate item, the spec, test or render; it states that the four races, fault injection, migration upgrade and LG/DF items are covered by earlier task suites and the package-final gate.

**AC IDs covered (author evidence, not independent):** AC-01 (ID-swap 404, route inventory, sharing matrix), AC-03 (job and posting idempotency, concurrency), AC-04 (reasons, audit, revisions), AC-06–AC-10 (sign-off, automatic submission, delivery states, reminders, PDF), AC-14 (private files and downloads), AC-16 (sharing). **Genuinely unrun:** WP3-GATE and the independent audits; the clean-export `npm ci`; the WP2-source upgrade through 0004–0006 beyond the T01 v3 upgrade probe; any real SMTP send (forbidden before the owner's pilot authorization); PDF-to-image rendering is available only through the T14 Edge page render.

## Evidence index

All under `handoff/delivery/evidence/` (logs masked, LF; images synthetic; scripts stored as `*.txt`):

- `WP3-T00/` … `WP3-T13D/`: red, green, mutation, verify and digest logs per task; `WP3-T12/`, `WP3-T13/`, `WP3-T13C/`, `WP3-T13D/` also hold synthetic screenshots.
- `WP3-T14/`: capture red/green, e2e, verify, digest, `10-gate-mapping.txt`, five `pdf-*-synthetic.png` renders and the e2e screenshots.
- `*-FREEZE/`: the committer check logs for each freeze (digest, staged count, check exits).
- `WP3-DOC/`: parity and preflight logs; `WP3-E2E-RECHECK/`, `WP3-T07-RECON/`, `WP3-TMPCLEAN/`; `GOV-WP3P-GATE/`, `GOV-WP3P-AUDIT/`.
- `WP3-T15/`: the T15 parity note, preflight, verify and digest logs.

## Limitations and carry items

Open at this handoff, from the task records (none was judged blocking by its author; the gate and audits decide):

1. **Reminder may repeat once after a crash on real SMTP** (T11 note 4): a crash between provider acceptance and `completeJob` can send one advisory reminder twice; capture mode is protected by its folder. Revisit if the owner wants at-most-once reminders.
2. **TLS certificate verification failure is classified temporary** (T09): it reaches the adapter as `ESOCKET`, so it retries and ends in intervention after the retries rather than at once.
3. **A send claimed before its PDF consumes one job attempt** (T09, T10): it fails `pdf_not_ready` and is retried after one minute; the job store has no defer without an attempt.
4. **Job-row retention** (T10, T11): one `deadline_scan` row per minute and one `reminder_scan` row per five minutes after activation; jobs are never deleted. A retention decision belongs to the owner before long production runs. The file-store orphan sweep is implemented but not scheduled (T08).
5. **T11 attachment note:** reminders pass an empty PDF; the T14 capture fix removes `attachment.pdf` for attachment-less messages. Whether reminder captures are covered should be confirmed by gate item 9.
6. **A period that ended before an account existed** is still submitted empty once its deadline passes (T10); the activation instant is the protection.
7. **T13 carry items:** the revision-list gap is closed by `GET /api/revisions` (T13B, T13C); the signature-404 console line is closed (T13C); the harness without `MAIL_FROM` is closed (T14). Still open: the History still shows raw operation names such as `day_entry.update` for unknown operations (T13C note 3); the delivery badge is read at load, with no polling (T12).
8. **T13A/T13B:** `CommandContext.actor` and `AppDeps.delivery` are optional so unowned callers keep working (T13A deviation 2); history attribution under a share uses the share's validity window, so an event by a grantee outside every window is unattributed (T13B note 3).
9. **Sign-off rules recorded as interpretations:** a sign-off of a not-yet-ended period is not refused (T05); a retry of a revision with choose-mode deficits is not a replay (409 `stale_version`, never a second revision, T06); a late review whose content changed is refused with `content_changed` and needs a correction (T06); the automatic origin is stored as `deadline` (T10).
10. **Upload consent needs settings:** `POST /api/signatures?authorize_auto_image=true` is refused (422 `submission_settings_required`, nothing stored) when no settings exist yet; the UI waits and shows the step order (T07B, T13).
11. **Admin view:** drafts are not listed, because a draft row would reveal that the person has entries (T13D). The E2E admin spec accepts either final delivery state when the fixture has no sender; T14 now sets `MAIL_FROM` for the fixture.
12. **E2E environment:** one T13A full run failed two mobile specs on a Windows `net::ERR_NO_BUFFER_SPACE` console error; a re-run by WP3-E2E-RECHECK was clean (97 passed, 3 skipped at that commit). Treat a recurrence as environmental, rerun once and record it.
13. **WP2 items still open:** **ADV-A-05** (duplicate internal append path in `otLeave.ts` and `ledger.ts`, Info, backlog) and the **B4 optional items** ([WP2_HANDOFF](WP2_HANDOFF.md) acceptance record: unused `--space-6`, equal-valued tokens, the 767 px query comment, the ±1 day oracle assumption, `legacyPdtWallTime` export and the unpinned computed style). WP2 R1, R2, R4 and A4-01 were closed by T06, T00 and T05; A3-01 is respected by the T13D allowlist, which never reads audit payloads.
14. **Tooling record:** the T14 record counts 46 smoke checks while its own verify log shows 40 `PASS` lines (see Commands). Settled by the gates: 40 is the count (WP3-GATE gate_notes on the board).
15. **A recorded "through a share" marker is required before WP4** (WP3-FIX2; [WP3_RECHECK_BC](WP3_RECHECK_BC.md) item 6, [WP3_RECHECK_A](WP3_RECHECK_A.md) R7): audit rows do not record the request path, so `SHARED_ACT_OPERATIONS` infers "performed through a grant" from the actor and the operation code. That is enough while only `/api/shared` writes `day_entry.*`, `work_session.*` and `share.pdf_download` for another person. Before WP4 lets any non-shared route (an import or an administrator correction, for example) write day or session rows for another person, audit rows must carry a recorded marker for access through a share (a field, and its migration), and the attribution and the Review hint must read it.

## Deferrals

Magic links (login-required deep links suffice, docs/05), the optional ntfy adapter and SMS are not implemented ([WP3-PLAN](tasks/WP3-PLAN.md) optional scope, docs/01, docs/05, D-10). E-7 permission evidence stays a text reference. The Docker container, backup/restore and the pilot packet belong to WP4 and WP5.

## Governance change: GOV-WP3P

The scope and required-gate sentences in `handoff/prompts/WP3_IMPLEMENT.md` and `WP3_REVIEW.md` (and their `.vi.md`) were extended to mirror docs/09: owner-granted sharing with per-item toggles, the admin status boundary, AC-16, the automatic note line and image options, no automatic indicator on outgoing submissions and empty-period automatic submission. Frozen as `da6d0cd` (GOV-WP3P-FREEZE); the independent GOV-WP3P-AUDIT returned PASS on that commit with no proven defect and optional risks R1–R5 ([GOV_WP3P_REVIEW](GOV_WP3P_REVIEW.md)): R1 (AGENTS rule 4 could name "or an owner-granted share item"), R2 (docs/09 does not name F-2, F-4 and the G-Q2 rendering, which the WP3 gate must still test), R3 (a Vietnamese phrase could read as the admin's own status). They stay in the governance backlog.

## Next action

Superseded by the acceptance record below: the owner's `.claude/skills/readme-md` skill goes through a GOV-SKILL cycle, with WP4 planning (WP4-PLAN) in parallel where the single-writer rule allows. Do not set `PRODUCTION_SENDING_ENABLED` until the owner has authorized the pilot packet.

## Acceptance record (WP3-ACCEPT)

Prepared by WP3-ACCREC (records only, no source edit). Sources: the board tasks WP3-GATE to WP3-RECFIX (`decision`, `findings`, `gate_notes`, `history`), the board `owner_decisions` of 2026-10-04 and 2026-10-05, and the reports [WP3_REVIEW_A](WP3_REVIEW_A.md), [WP3_REVIEW_B](WP3_REVIEW_B.md), [WP3_REVIEW_C](WP3_REVIEW_C.md), [WP3_RECHECK_A](WP3_RECHECK_A.md), [WP3_RECHECK_BC](WP3_RECHECK_BC.md), [WP3_RECHECK_A2](WP3_RECHECK_A2.md), [WP3_RECHECK_BC2](WP3_RECHECK_BC2.md), [WP3_RECHECK_A3](WP3_RECHECK_A3.md) and [WP3_RECHECK_BC3](WP3_RECHECK_BC3.md) (each with a `.vi.md`). The board acceptance step belongs to the coordinator.

- **Accepted source:** commit `49651c8bb91d56bf6c6966405257537ec7ca474b` (WP3-FIX3-FREEZE, pushed), source digest `c31c300c06ae4c750bf0080f304d3f87eae0a00280110d1a8eb6eb37ecf4ec72` in the `git ls-tree` form (WP3-REGATE3 PASS; the export blobs and the committer's digest agree). Final figures: 62 files and 1420 tests; smoke 40 `PASS`; e2e 127 passed and 5 skipped ([verify](evidence/WP3-REGATE3/02-verify.txt), [e2e](evidence/WP3-REGATE3/03-e2e.txt), [digest](evidence/WP3-REGATE3/digest-lstree-after.txt)).
- **Freeze list and figures corrected by this record:**

| Freeze | Commit | Digest of record | Verify (files / tests) | Smoke `PASS` lines | E2E |
|---|---|---|---|---:|---|
| Package freeze (T15) | `a1cd566` | `96870f7e…6e729` | 60 / 1384 | 40 | 127 passed, 5 skipped |
| Fix round 1 | `2f2520e` | `eeb417d3…48410` | 62 / 1407 | 40 | 127 passed, 5 skipped |
| Fix round 2 | `2d72d35` | `0d513fca…7ea92` | 62 / 1416 | 40 | 127 passed, 5 skipped |
| Fix round 3 (accepted) | `49651c8` | `c31c300c…4ec72` | 62 / 1420 | 40 | 127 passed, 5 skipped |

  Source: the gate_notes of WP3-GATE, WP3-REGATE, WP3-REGATE2 and WP3-REGATE3. Corrections: the smoke count is 40 `PASS` lines (the T14 record's "46 checks" was wrong, as the WP3-GATE gate_notes state); the test counts are those of the gates (the figure 60 / 1384 in the earlier sections is the state at `a1cd566` only); e2e is 127 passed and 5 skipped by design at every freeze. The earlier T14 digest `677b9142…` belongs to `b083739`.
- **Gate chain** (verifier, clean export outside Dropbox, Node 24.21.0, Edge, capture only):
  - WP3-GATE PASS on `a1cd566` (`96870f7e`);
  - WP3-REGATE PASS on `2f2520e` (`eeb417d3`);
  - WP3-REGATE2 PASS on `2d72d35` (`0d513fca`);
  - WP3-REGATE3 PASS on `49651c8` (`c31c300c`). Attempt 1 passed every source item. Item 12 failed only on the live tree, because an untracked evidence `.md` (`evidence/WP3-FIX3-FREEZE/result.md`) had no `.vi.md` pair. WP3-RECFIX renamed it to `result.txt` (one literal-path rename, nothing deleted). Attempt 2 reran item 12: `validate_orchestration`, `check_recovery` and `validate_package.py --preflight` all exited 0. Caveat from the gate: `npm run digest` in the working tree prints a different value over 724 files, because it also counts three untracked files under `.claude/skills/readme-md/`; they are not in the freeze (see H-Q3).
- **Audit chain:**

| Task | Commit | Verdict | Findings |
|---|---|---|---|
| WP3-AUDIT-A | `a1cd566` | NOT VERIFIED | Procedural only, no finding: the digest was not recorded after a permission refusal; the functional checks passed. Area A was rechecked by a fresh auditor. |
| WP3-AUDIT-B | `a1cd566` | FIX REQUIRED | WP3-B-01, B-02, B-03 |
| WP3-AUDIT-C | `a1cd566` | FIX REQUIRED | WP3-C-01, C-02, C-03 |
| WP3-RECHECK-A attempt 1 | `2f2520e` | PASS | No finding |
| WP3-RECHECK-BC | `2f2520e` | FIX REQUIRED | WP3-RBC-01, WP3-RBC-02; B-03 partly fixed |
| WP3-RECHECK-A attempt 2 | `2d72d35` | PASS | No finding |
| WP3-RECHECK-BC2 | `2d72d35` | FIX REQUIRED | WP3-RBC2-01 (test coverage only) |
| WP3-RECHECK-A attempt 3 (final) | `49651c8` | **PASS** | No finding |
| WP3-RECHECK-BC3 (final) | `49651c8` | **PASS** | No finding; WP3-RBC2-01 fixed |

  The final two rechecks were done by one fresh auditor that authored nothing in WP3, on `49651c8` (HEAD and digest unchanged at start and end). Attempts 1 and 2 of area A were PASS at their own digests; later changes made only attempt 3 binding.
- **Fix rounds and what each closed:**
  - **Round 1:** WP3-LINKFIX (record links), WP3-FIXB (B-01 account-creation bound, B-02 final-attempt crash recovery, B-03 operation names), WP3-FIXC (C-01 grantee-change hint, C-02 attribution, C-03 comment).
  - **Round 2:** WP3-FIX2: RBC-01 (every event without an actor is a system event), RBC-02 (grantee changes made before the period started are listed), the direct test of the `sending` branch, and the owner decision H-Q1 (a) with docs/05 and docs/10 in EN and VI.
  - **Round 3:** WP3-FIX3, test-only: RBC2-01, with the guard sweep (the "Fix round 3" section above).
- **Owner decisions** (board `owner_decisions`):
  - 2026-10-04: F-1 to F-5, F-Q1 to F-Q5, G-Q1 (b) and G-Q2 (a) (see "Owner decisions implemented"); F-Q6 stays open.
  - 2026-10-05, **H-Q1 (a):** automatic submission applies only to accounts that saved their submission settings with auto-submit on; the explicit apply-to-overdue choice stays as implemented (still clamped by the account creation), as the coordinator read it on the board.
  - 2026-10-05, **H-Q2 (a):** masked `.txt` copies of exactly the six named `.raw` logs of `evidence/WP3-FIX2/`, then the deletion of those six files.
  - 2026-10-05, the temporary-folder move: from `D:\timesheet-tmp\<task>` to `D:\.claude-tmp\timesheet\<task>`.
  - 2026-10-05, **H-Q3 (a):** the owner's `.claude/skills/readme-md` skill stays in the repository and goes through a GOV-SKILL cycle (freeze, verifier gate, fresh audit) after the WP3 accept commit. It is not part of the WP3 source.
- **Non-blocking items carried forward** (none blocks acceptance):
  - **R1–R9 of [WP3_RECHECK_A](WP3_RECHECK_A.md) and [WP3_RECHECK_A2](WP3_RECHECK_A2.md):** R1 a long holiday label is ellipsized in the PDF; R2 the 50-signature bound is counted outside the transaction; R3 closed by H-Q1 (a); R4 the reviewed hash includes the available balance, so an OT movement elsewhere makes a review stale; R5 a sign-off before the period ends is accepted; R6 the hint and the payload are read in two transactions (integrity is unaffected); R7 attribution rests on operation codes (see the marker item below); R8 never-configured accounts still get before-due reminders to their own address; R9 seed events without an actor show as automatic in History.
  - **A recorded "through a share" marker** is required before WP4 lets any non-shared route write day or session rows for another person (carry item 15).
  - The hint shows a count, not dates.
  - A `HEAD` request on the shared PDF route writes a download audit ([WP3_REVIEW_C](WP3_REVIEW_C.md) R1).
  - The reminder repeat on real SMTP, the TLS failure classified temporary, and the send-before-PDF attempt (carry items 1 to 3).
  - **F-Q6** stays open (WP2-A-01 kept).
  - **ADV-A-05** and the WP2 B4 optional items (carry item 13).
  - **Final-recheck risks** ([WP3_RECHECK_BC3](WP3_RECHECK_BC3.md), [WP3_RECHECK_BC2](WP3_RECHECK_BC2.md)):
    - no test covers the activation instant being cleared mid-scan (probe H3 shows how);
    - the `not_active` guard (`automation.ts:191`) has no single test of its own;
    - `before_account` is covered only as a pair (M6b);
    - the hint read has no time bound (it grows with the owner's audit history; RBC2 R1);
    - never-configured accounts get no overdue warning, and the admin status does not show "not set up" (RBC2 R2);
    - the deadline scan re-checks their periods on every pass (RBC2 R3).
- **WP4 carry-forward** (WP4 planning must address):
  - the recorded "through a share" marker (a field and its migration) before any non-shared route writes day or session rows for another person, with the attribution and the Review hint reading it;
  - whether never-configured accounts get an overdue warning or an admin "not set up" status, stated in the pilot packet either way;
  - the job-row retention decision and the unscheduled file-store orphan sweep (carry item 4);
  - the real-SMTP items: the reminder repeat, TLS-as-temporary and send-before-PDF (carry items 1 to 3);
  - an optional owner-scoped or work-date-bounded read for the hint;
  - the three test-coverage gaps above, if the owner wants them closed;
  - F-Q6, ADV-A-05 and the WP2 B4 optional items;
  - the Docker container, backup/restore and the pilot packet (Deferrals).
- **Verification of this record:** `validate_package.py --preflight` and the EN/VI parity check are in [preflight.txt](evidence/WP3-ACCREC/preflight.txt) and [parity.txt](evidence/WP3-ACCREC/parity.txt).
- **Status:** WP3 implemented, gated (WP3-REGATE3 PASS) and independently audited (WP3-RECHECK-A attempt 3 PASS, WP3-RECHECK-BC3 PASS) on `49651c8`. No production action and no owner pilot authorization is involved; nothing is deployed and no real mail was sent. **Next action:** the GOV-SKILL cycle for the owner's `.claude/skills/readme-md` skill (H-Q3 (a)), with WP4 planning (WP4-PLAN) in parallel where the single-writer rule allows.

## Fix round 1 — WP3-FIXB (area B findings)

Task [WP3-FIXB](tasks/WP3-FIXB.md) attempt 1 on baseline `a1cd566e59253d19f53cfd5b3a81fd27a7e9a056`, for [WP3_REVIEW_B](WP3_REVIEW_B.md). Not independently accepted until the fresh area-B recheck. Evidence: `evidence/WP3-FIXB/` (masked, LF).

| Finding | Disposition | Fix | Regression tests (red before, green after) |
|---|---|---|---|
| WP3-B-01 (Medium; docs/05 "Deadline and recovery", AC-07, F-4) | Fixed | `src/server/services/automation.ts`: an account's `users.created_at` is the earliest instant automation can reach for it. `assessPeriod` skips a period whose `due_at` precedes it (`before_account`) and `listCandidates` starts at the later of the activation instant and the account creation. A deadline on or after the creation (including the period in which the account was created) is still automated at the deadline (F-1). The bound also holds for saved settings, including the explicit "apply to overdue drafts" choice, whose stored effective instant is a very early constant. The auto-submit default is unchanged. | `tests/integration/deadline.test.ts`, describe "account creation bound": no submission of the periods overdue at creation (no saved settings), first deadline after creation automated with default labels, period containing the creation automated, saved settings and the explicit overdue choice never reach back (ordinary saves take effect at or after the creation). Probe p2 now 95 PASS. |
| WP3-B-02 (Low; docs/05 failure table, AC-08) | Fixed | `src/server/jobs/runner.ts`: every `runJobsOnce` pass that owns the send handler calls `recoverInterruptedSends` before its first claim, so the attempt of a send whose runner died is `uncertain` (with the owner decision prompt) before the claim sweep ends the job of the last attempt. Never resent automatically; one explicit decision resends once; no 409 `delivery_in_progress` dead end. | `tests/integration/delivery.test.ts` "a process lost during the LAST permitted attempt…" (four temporary failures, crash after `sending` on attempt 5, one pass after the lease expiry, the owner decision resends exactly once). `delivery-crash.test.ts`: the pass summary of the restarted runner changed from claimed 1/intervention 1 to claimed 0 (recovery runs before the claim); its outcome assertions are unchanged. Probe p4 now 16 PASS. |
| WP3-B-03 (Low; docs/04 Screens, F-Q2) | Fixed | `otModel.ts` `operationText` names every operation code the server writes (WP2 and WP3, for example `timesheet.auto_finalize` = "Submitted automatically") and falls back to the plain "Other change"; `sharingModel.ts` `historyActorBadge` labels the actor-less system events (`timesheet.auto_finalize`, `deadline.overdue`, `deadline.finalize_failed`) "automatic" instead of "by someone else" (new `isSystemOperation`); `HistoryScreen.tsx` marks them `data-history-actor="system"`. Grantee attribution is unchanged. | `tests/client/otModel.test.ts`, `tests/client/sharingModel.test.ts`. |

Auto-submit default (audit A risk R3): docs/04 (settings table) says "Enabled preference after sender setup; real sending remains disabled until activation", docs/10 D-09 says "enabled after setup" and docs/05 says "Unsigned draft + enabled switch". No document says what an account that never saved settings has; the implementation treats it as on, and this fix does not change that.

Doc follow-up (not edited, outside the owned paths): docs/05 "Deadline and recovery" could add that, for a user with no saved settings, the account's creation is the start of automation.

Commands and results: `evidence/WP3-FIXB/00-commands.txt`. After the last edit: `npm run test:e2e` exit 0 (127 passed, 5 skipped), `npm run verify` exit 0 (60 files / 1391 tests, SMOKE PASSED with 40 `PASS` lines), `npm run digest` exit 0: `d9fa55bda1c637b1e58f2b5de005941b3767d8ca6d676e8b4e89fce2c6004582` (717 files, `handoff/` excluded).

Remaining: one residual edge in B-02 (a lease that expires between the start-of-pass recovery and the claim sweep of the same pass is recovered at the start of the next pass, within one runner interval, and is never resent); the three area-B carry items stay backlog. Next action: freeze, gate, then a fresh area-B recheck at the new digest.

## Fix round 1 — WP3-FIXC (area C findings)

Task [WP3-FIXC](tasks/WP3-FIXC.md) attempt 1 on baseline `a1cd566e59253d19f53cfd5b3a81fd27a7e9a056` plus the uncommitted WP3-FIXB changes (kept unchanged), for [WP3_REVIEW_C](WP3_REVIEW_C.md). Not independently accepted until the fresh area-C recheck. Evidence: `evidence/WP3-FIXC/` (masked, LF).

| Finding | Disposition | Fix | Regression tests (red before, green after) |
|---|---|---|---|
| WP3-C-01 (Medium; WP3-REQ C/E/G, FR-17, AC-16) | Fixed (the planned hint is implemented, per the coordinator decision of 2026-10-05) | New `src/server/services/sharedActs.ts` `granteeChangesForReview`: from the audit, the days of the reviewed period whose last `day_entry.*`/`work_session.*` event was written through a grant, grouped by the grantee's display name, since the owner's latest own finalization of the period (`timesheet.signoff`, `timesheet.correction`, `timesheet.late_review`; the automatic submission is not the owner's) or, with none, since the start of the period in the reporting zone. A later change by the owner or another grantee takes the day over. `routes/submission.ts` returns it as `grantee_changes` next to the payload, never inside it, and only when the actor is the subject; the review route is not on the shared allowlist, so a grantee, a shared view and an administrator never receive it. `ReviewScreen.tsx` shows "N day(s) last changed by <name>" (`granteeChangesModel.ts`) above the day table, before Sign off; `styles.css` adds one rule with E-8 tokens only; `api.ts` types. The payload, its hash, the stored revision and the PDF are untouched. | `tests/integration/review-grantee-changes.test.ts` (11): hint for grantee edits (day and session), absent for owner-only edits, a later owner edit clears the day, grouping by grantee, other period ignored, only since the previous finalization, kept after revocation, an administrator revocation does not count, a grantee/shared view/admin response never carries it (shared review route 404), the payload and the stored revision hold no hint and the reviewed hash equals the canonical hash of the payload and is signed as is, reading writes nothing. `tests/client/granteeChangesModel.test.ts`; `tests/e2e/sharing.spec.ts` (hint on desktop and mobile, absent on the shared view, cleared by an owner edit). Red: 10 of the 11 failed before. |
| WP3-C-02 (Low; AC-16 attribution, history contract) | Fixed | `history.ts` no longer decides attribution from the time window of a share. An event counts as performed through `/api/shared` only when its actor is not the owner and its operation is one a shared route writes (`SHARED_ACT_OPERATIONS` in `sharedActs.ts`: the day and session create/update/delete and `share.pdf_download`); the same condition feeds the Review hint. An administrator-route revocation by an administrator who also holds a share, an act in the same second as a later grant, `user.*` and a grantee leaving a share stay unattributed. Wording: `historyActorBadge` says "Downloaded by <name> (shared access)" for a PDF download and keeps "Changed by" for edits. | `tests/integration/history.test.ts`: admin-route revocation by a sharing administrator; same-second act before a later grant; a grantee leaving; all five shared write routes attributed (drift guard); `tests/client/sharingModel.test.ts` (download wording). The old test that inserted a synthetic row after a share ended was replaced by the leave test (no route can write such a row). Red: 3 of 4 integration tests and the wording test failed before. |
| WP3-C-03 (Info) | Fixed | `src/server/types.ts` `AppEnv` comment now describes `requireShare` (user and actor = grantee, subject = the owner named in the path). | Comment only. |

No field and no migration were added. The audit rows do not record the request path or a flag, so the decision was met without relying on one: an event is "through a grant" when its actor is not the owner and its operation is one only a shared route writes. This rests on two facts: the access guard sets `actor` apart from `subject` only under `/api/shared`, and the other routes that write another person's owner id use other operation codes (`user.*`, `share.revoke`). Deviation for coordinator review: if a future non-shared route writes one of the listed operation codes for another actor, it would be attributed wrongly; the drift-guard test covers the shared routes only. A recorded marker (a migration) is the robust alternative if the coordinator wants it.

Behaviour change to note: a grantee leaving a share (`share.revoke` with `revoked_by_role: grantee`, made through `/api/shares`, not `/api/shared`) is no longer named in the owner's History; it reads "Share ended" by someone else, as the decision requires.

Commands and results: `evidence/WP3-FIXC/00-commands.txt`. After the last source edit: `npm run test:e2e` exit 0 (127 passed, 5 skipped), `npm run verify` exit 0 (62 files / 1407 tests, SMOKE PASSED with 40 `PASS` lines), `npm run digest` exit 0: `eeb417d3b903b30f1c21fa0a855424da02ab1d6e1d525f2509130f3933a48410` (721 files, `handoff/` excluded). Screenshots `sharing-review-hint-desktop-synthetic.png` and `sharing-review-hint-mobile-synthetic.png`.

Remaining: the Review hint lists whole days, not what changed (the History shows the field changes). Next action: freeze, gate, then a fresh area-C recheck at the new digest.

## Fix round 2 — WP3-FIX2 (findings WP3-RBC-01 and WP3-RBC-02, owner decision H-Q1)

Task [WP3-FIX2](tasks/WP3-FIX2.md) attempt 1 on baseline `2f2520e1ab80ff55938b70cd469f0bfe888e04a2`, for [WP3_RECHECK_BC](WP3_RECHECK_BC.md) (area A had passed in [WP3_RECHECK_A](WP3_RECHECK_A.md)). Not independently accepted until the fresh B/C recheck. Evidence: `evidence/WP3-FIX2/` (masked, LF); start at `00-commands.txt`.

| Item | Disposition | Fix | Tests (red before, green after) |
|---|---|---|---|
| WP3-RBC-01 (Low) | Fixed (coordinator decision of 2026-10-05: every event without an actor is a system event) | `history.ts` sends `actor_is_system` (`actor_user_id IS NULL`; no identifier leaves the server). `sharingModel.ts` `historyActorBadge` and `HistoryScreen.tsx` read it; the hand-listed `SYSTEM_OPERATIONS` and `isSystemOperation` are gone. The B-03 operation-name map (`operationText`) and the C-02 grantee attribution are unchanged. | `history.test.ts` (an automatic submission with an OT credit: the credit and `timesheet.auto_finalize` are system events, every actor event is not, no other id leaves) and `sharingModel.test.ts` (any flagged operation reads "automatic", a person's event never does). Red against the baseline source in `01-red-baseline-source.txt`. `automation.spec.ts` also checks the badge on the real History screen. |
| WP3-RBC-02 (Low) | Fixed (coordinator decision of 2026-10-05) | `sharedActs.ts` `granteeChangesForReview`: with no previous owner finalization there is no time bound, so a grantee change made before the period started (planned leave) is listed; the period's work dates still bound the days. With a previous owner finalization only later events count, as before. | `review-grantee-changes.test.ts`: a grantee edit made before the period start is listed; after the owner's sign-off it is not, and a later one is. Red in `01-red-baseline-source.txt`. |
| Missing direct test (RECHECK-BC item 5, R3) | Restored | No source change. `delivery.test.ts`: a job reclaimed while its attempt is still `sending` is stopped by the send handler's own `sending` branch (attempt `uncertain` with `lease_expired_while_sending`, job in intervention `delivery_uncertain`, nothing sent). | Mutation check: with the branch disabled the test fails (`02-mutation-sending-branch-red.txt`); the source was restored byte for byte. |
| H-Q1 (a) (owner decision of 2026-10-05) | Implemented | `automation.ts`: a user with no saved submission settings has no governing switch, so a period is skipped (`not_configured`): no automatic finalization, no overdue record, no job, no delivery. Saved settings behave as before: a period due before the first save is not reached unless the user chose "apply to overdue drafts" when saving (still clamped by the account creation); auto-submit off keeps its overdue record. | `deadline.test.ts` "setup bound": a never-configured account at and after every deadline and through the runner; a mid-period save; the overdue choice (with and without an account created later); a plain first save with overdue periods; auto-submit off. 5 red before, green after (`01-red-baseline-source.txt`). |
| Canonical rules (AGENTS rule 8) | Done, EN and VI in step | [docs/05](../../docs/05_SUBMISSION_AND_NOTIFICATIONS.md) "Deadline and recovery": the account-creation bound (source: the coordinator decision of 2026-10-05, WP3-B-01) and the saved-settings rule (H-Q1) side by side. [docs/10](../../docs/10_DECISIONS_AND_SOURCES.md): new "Owner decisions — 2026-10-05". The D-09 row and every other rule are unchanged. | `validate_package.py --preflight` exit 0 (65 translation pairs). |

Tests, seed fixtures and e2e scenarios changed because of H-Q1:

- `tests/integration/deadline.test.ts`: 14 tests relied on automating an account that never saved its settings. A helper `configuredUser` saves the settings at the account's creation instant, and 15 call sites use it (finalize at the deadline in daylight and standard time, exception deadline, activation boundary and exact instant, creation-bound F-1 and mid-period cases, choose, auto-deduct, insufficient balance and incomplete-day finalizations, the deactivated-user test, bounded batches, owner ordering, rollback). The first account-creation test now submits with the explicit overdue choice, so the creation bound is still tested on its own. All assertions about outcomes are unchanged.
- `tests/e2e/automation.spec.ts`: the seeded admin and employee never saved settings, so their two sends no longer need intervention (the assertion goes from 2 to 0) and the administrator list of revisions is empty (asserted). The History assertions now include the automatic badge from the server flag.
- No seed fixture changed: `seed.ts` sample data already saves settings with auto-submit off, and the seed accounts without sample data are the never-configured ones the decision describes.
- Wording: `settingsModel.ts` `autoSubmitRule` said "Automatic submission is on by default and applies to periods that fall due after you save"; it now says "Nothing is submitted for you until you save these settings with automatic submission on. It then applies to periods that fall due after you save." (`settingsModel.test.ts` checks it). The admin operations status makes no claim about automation before setup.
- Carry item 6 (a period that ended before an account existed) was already closed by WP3-B-01; with H-Q1 the empty submission of a never-configured account no longer happens at all. Audit risk R4 (never-configured accounts submitted and failing `recipient_missing`) and the open owner question are closed by H-Q1.

Commands and results (`evidence/WP3-FIX2/00-commands.txt`): preflight exit 0; after the last source edit `npm run test:e2e` exit 0 (127 passed, 5 skipped); `npm run verify` exit 0 (62 files / 1416 tests, SMOKE PASSED with 40 `PASS` lines, no deprecation line); `npm run digest` exit 0: `0d513fcadb386706d21127a7c77c512a5c6e94f8f69917f7e2c6972b3127ea92` (721 files, `handoff/` excluded).

Remaining: nothing new. Next action: freeze, gate, then a fresh B/C recheck at the new digest.

## Fix round 3 — WP3-FIX3 (finding WP3-RBC2-01, test-only)

Evidence: `evidence/WP3-FIX3/`. Only `tests/integration/deadline.test.ts` changed; no file under `src/`, `docs/`, `scripts/` or configuration.

- WP3-RBC2-01 fixed. The F-4 activation test and the imported-period test now use accounts that saved auto-submit on (`configuredUser`), so each again exercises the guard it was written for. The imported test gained an "off" half whose switch is saved off before the deadline; it asserts no revision, no job and no overdue record.
- Guard sweep (a gap that already existed at `2f2520e`): three direct tests in a new `describe` re-assess a period after the state changed during the scan (a temporary trigger deactivates the account or moves the activation instant after the first revision; a clock that goes back covers `not_due`). Removing the `inactive_user`, `before_activation` or `not_due` skip now fails a test.
- Mutation proof in a scratch clone of `2d72d35` (the suite file copied in; the repository source was never mutated): clean 44/44 pass; M4, M5, M5b, and the removal of each of the three guards fail exactly the intended tests; removing `finalized` (control) still fails.
- Checks: `npm run verify` and `npm run digest` as the last commands (results in the brief). No e2e run: only an integration test file changed.
