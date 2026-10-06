# Deployment and operations

## Initial deployment

Synology reverse proxy → one app container → host-local persistent /data. SMTP and optional ntfy are adapters. Initially no Redis, database server or browser-rendering service.

Verify actual NAS CPU architecture and Docker/Container Manager support; do not assume every NAS supports containers. Test native SQLite dependency and fonts on the selected target. WP4 supplies a pinned multi-stage Dockerfile, Compose example, secret-free .env.example, migrations, expiring one-time admin bootstrap, synthetic seed, health, backup/restore scripts and bilingual runbook.

Run non-root. Persist DB, PDFs, signatures and evidence privately. Keep the workbook, developer files and secrets out of the image. Configure public HTTPS URL, trusted proxy, data path, reporting zone, outbound mode and SMTP TLS/credentials. There is no application session secret; SMTP credentials only. Per-user recipients/templates belong in user settings, not one shared environment recipient.

Use protected host secret/env files; never put credentials in git, chat, screenshots or logs. Use HTTPS, secure cookies, restricted internal access and host time synchronization.

## Setup sequence

1. Verify architecture/storage and record real host paths.
2. Start in dry-run, migrate once under an exclusive lock, complete admin bootstrap and disable it.
3. Create two synthetic accounts; verify isolation.
4. Configure payroll/holiday/policy/recipient/template settings and review the summary.
5. Capture a synthetic submission locally, inspect PDF, back up and restore in isolation.
6. Prepare WP5's exact pilot packet. After owner authorization, enable sending and record automation activation. Inspect the approved pilot's result and monitor the first period.

Preparing an installation is not a real deployment or an email send. Missing credentials/hardware are later setup inputs, not reasons to stop authorized local work.

## Backup, restore and upgrades

Initial targets: nightly backups, 24-hour recovery point and one-hour restore after prerequisites are available. They are targets to test, not measured guarantees. Retention (owner decision F-5, 2026-10-05): pruning keeps 7 daily, 4 weekly and 6 monthly backups and acts only on folders the backup tool created. The protected copy on a separate device is an owner setup step (Synology Hyper Backup or USB), not application code.

Do not just copy a live SQLite main file while ignoring WAL. Use the online backup API or another documented consistent method. Briefly pause finalization/file writes, capture DB and referenced immutable-file manifest, copy referenced files, resume. Include app/schema version, timestamp, integrity check and hashes; retain needed secret configuration securely without printing it.

Restore into an isolated directory with sending paused. Verify integrity/schema, users, representative balances, revisions, files/hashes and PDF. Reconcile pending/uncertain jobs before enabling delivery. Never run the old and restored production queues simultaneously.

Before upgrade, verify a backup and apply versioned migrations once. Downgrade binaries only with compatible schema; otherwise restore the paired DB/files. Reconcile external deliveries after restore—accepted mail must not be automatically sent again. A restore holds every queued or leased send and reminder job from the backup until an audited release or drop. When a rollback restores a backup whose schema has no outbound pause, the older build must run with its job runner off (`JOB_RUNNER=off`) until reconciliation is done.

## Maintenance

Health/readiness expose no private data. An administrator status view shows runner heartbeat, backup success, disk capacity, sender setup and delivery backlog/faults/uncertainty per person and period, including recipient addresses, without timesheet details or message content. Use an independent host alert where available; broken SMTP cannot reliably report itself over that same SMTP.

Review next year's company holidays before the first affected period; preview/validate and publish a new effective version. Preserve overrides/history. Do not blindly substitute US federal holidays. Review certificates, dependencies, retention and available disk.

## Workbook import

Use explicit preview/commit, never startup auto-import. Read cells as data, without executing macros/external links/formulas. Map dated sheets and labels; report source cells, unknown labels, dates, duplicates and conflicts. Require explicit conflict decisions; preserve unmapped information in the source/report.

The original source had 11 sheets (8 dated periods plus 3 support/template sheets); the tracked template keeps the 3 support/template sheets with floating holidays, an 8.5-hour formula, a missing Sunday subtotal and a TODAY signature date. Clock cells inspected in the original were blank. No sent status, true signature date or zero opening OT can be inferred. Import as imported_unverified with source SHA-256/mapping version and an idempotent batch key.

Each person imports only their own workbook (owner decision F-1, 2026-10-05); administrators cannot import for anyone else. An imported period posts no ledger events, cannot be signed or submitted (409 `imported_period`) and is read-only history (F-2). Opening balance requires explicit signed, non-zero minutes, date, reason and evidence, one per user, changed only by a reasoned correction and stored as a new ledger entry type (F-3); it is the only OT carry-in. Do not infer it from defective formulas. Repeating the same source/opening event cannot post again. Imported history never starts reminders/automatic sends. WP4 previews the tracked template filled with synthetic dated sheets; no personal history workbook is retained, and routine tests use synthetic copies. Safe default for I-3 (coordinator decision, reversible, document 10): a period is imported only after it has ended and its payroll due instant has passed; an ended period that is not yet due is also skip-only (`not_due`). The import route takes an upload of at most 2 MiB, the reader's own package limit (413 `payload_too_large` above it). The reader refuses a package over 1 MiB of XML in one part or 3 MiB in all, over its caps on markup openings of any kind (100,000 a part and a package), attributes (64 an element, 200,000 a part, 500,000 a package), start-tag length (64 KiB), kept attribute values (255 characters), nesting depth (40), cells, rows, shared strings and sheet-name length (100), with a tag name that is not an XML name, with a declared encoding other than UTF-8 or UTF-16, or with more than 2,000 holiday rows (422 `workbook_rejected`). These limits keep one preview within 500 ms of event-loop time and 150 MiB of added memory on the reference host (Node 24.21 on a Windows 11 x64 workstation). The bound is derived from the limits (WP4-FIXB4): with per-unit costs measured on that host for 61 kinds of content (compressible and incompressible, one-byte and two-byte), a package of X bytes of XML and O markup openings costs at most 40 ms + 14.8 ns × X + 339 ns × O of time and 15 MiB + 13.3 B × X + 428 B × O of memory (attributes add nothing beyond their bytes), about 121 ms and +95 MiB at these ceilings, 24 % and 63 % of the budget. The worst constructions measured at the ceilings (incompressible content at each limit, the bound's own worst mixes and the earlier probe and recheck shapes) stayed at or under 108 ms and +63 MiB in the medians and 114 ms and +72 MiB in single runs, bar one outlier run of 149 ms. The earlier ceilings (8 MiB upload and XML, 150,000 openings) had a memory bound over the budget, so they were lowered. A realistic workbook stays well inside: 61 dated sheets (the 64-sheet limit) are a 0.33 MB upload, 1.4 MB of XML and 53,400 openings, and preview in about 55 ms and +24 MiB. The report keeps at most 200 characters of any workbook text (flagged `truncated`), its findings are capped, and a report over 2 MiB, or one that cannot be built, is also 422 `workbook_rejected` and nothing is stored.
