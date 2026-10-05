# WP3 handoff — Submission, PDF, delivery, automation and sharing

Completed from [HANDOFF](../templates/HANDOFF.md) with actual evidence. Translation: [WP3_HANDOFF.vi.md](WP3_HANDOFF.vi.md). Every number below is copied from a task record or an evidence file named next to it; nothing was re-run to produce a figure except where a row says so. A figure that was not run or not verified is labelled as such. The package-final gate (WP3-GATE) and the fresh independent audits have not run: the acceptance record at the end is empty on purpose and is the authority for the package identity and the gate and audit verdicts once the accept step fills it.

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
| `npm run smoke` | built server over HTTP with a throwaway database | T14 evidence `07-verify.txt`: SMOKE PASSED, 40 `PASS` lines (the T14 record says "46 checks"; the log shows 40 `PASS` lines, a recording discrepancy for the gate to settle) |
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
14. **Tooling record:** the T14 record counts 46 smoke checks while its own verify log shows 40 `PASS` lines (see Commands).

## Deferrals

Magic links (login-required deep links suffice, docs/05), the optional ntfy adapter and SMS are not implemented ([WP3-PLAN](tasks/WP3-PLAN.md) optional scope, docs/01, docs/05, D-10). E-7 permission evidence stays a text reference. The Docker container, backup/restore and the pilot packet belong to WP4 and WP5.

## Governance change: GOV-WP3P

The scope and required-gate sentences in `handoff/prompts/WP3_IMPLEMENT.md` and `WP3_REVIEW.md` (and their `.vi.md`) were extended to mirror docs/09: owner-granted sharing with per-item toggles, the admin status boundary, AC-16, the automatic note line and image options, no automatic indicator on outgoing submissions and empty-period automatic submission. Frozen as `da6d0cd` (GOV-WP3P-FREEZE); the independent GOV-WP3P-AUDIT returned PASS on that commit with no proven defect and optional risks R1–R5 ([GOV_WP3P_REVIEW](GOV_WP3P_REVIEW.md)): R1 (AGENTS rule 4 could name "or an owner-granted share item"), R2 (docs/09 does not name F-2, F-4 and the G-Q2 rendering, which the WP3 gate must still test), R3 (a Vietnamese phrase could read as the admin's own status). They stay in the governance backlog.

## Next action

Dispatch WP3-T15-FREEZE (commit and push through `timesheet-committer` after the checks), then WP3-GATE on that commit, then the two fresh independent audits. Do not begin WP4, and do not set `PRODUCTION_SENDING_ENABLED`, until the gate and both audits pass and the owner has authorized the pilot packet.

## Acceptance record (WP3-ACCEPT)

(Empty. The accept step records the freeze commit, digest, gate and audit verdicts here.)
