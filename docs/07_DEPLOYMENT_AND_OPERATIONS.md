# Deployment and operations

## Initial deployment

Synology reverse proxy → one app container → host-local persistent /data. SMTP and optional ntfy are adapters. Initially no Redis, database server or browser-rendering service.

Verify actual NAS CPU architecture and Docker/Container Manager support; do not assume every NAS supports containers. Test native SQLite dependency and fonts on the selected target. WP4 supplies a pinned multi-stage Dockerfile, Compose example, secret-free .env.example, migrations, expiring one-time admin bootstrap, synthetic seed, health, backup/restore scripts and bilingual runbook.

Run non-root. Persist DB, PDFs, signatures and evidence privately. Keep the workbook, developer files and secrets out of the image. Configure public HTTPS URL, trusted proxy, data path, session/token secrets, reporting zone, outbound mode and SMTP TLS/credentials. Per-user recipients/templates belong in user settings, not one shared environment recipient.

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

Initial targets: nightly backups, 24-hour recovery point and one-hour restore after prerequisites are available. They are targets to test, not measured guarantees. Suggested retention: 7 daily, 4 weekly, 6 monthly, with protected separate-device copy.

Do not just copy a live SQLite main file while ignoring WAL. Use the online backup API or another documented consistent method. Briefly pause finalization/file writes, capture DB and referenced immutable-file manifest, copy referenced files, resume. Include app/schema version, timestamp, integrity check and hashes; retain needed secret configuration securely without printing it.

Restore into an isolated directory with sending paused. Verify integrity/schema, users, representative balances, revisions, files/hashes and PDF. Reconcile pending/uncertain jobs before enabling delivery. Never run the old and restored production queues simultaneously.

Before upgrade, verify a backup and apply versioned migrations once. Downgrade binaries only with compatible schema; otherwise restore the paired DB/files. Reconcile external deliveries after restore—accepted mail must not be automatically sent again.

## Maintenance

Health/readiness expose no private data. An authenticated status view shows runner heartbeat, backup success, disk capacity, delivery backlog/faults/uncertainty and sender setup. Use an independent host alert where available; broken SMTP cannot reliably report itself over that same SMTP.

Review next year's company holidays before the first affected period; preview/validate and publish a new effective version. Preserve overrides/history. Do not blindly substitute US federal holidays. Review certificates, dependencies, retention and available disk.

## Workbook import

Use explicit preview/commit, never startup auto-import. Read cells as data, without executing macros/external links/formulas. Map dated sheets and labels; report source cells, unknown labels, dates, duplicates and conflicts. Require explicit conflict decisions; preserve unmapped information in the source/report.

The original source had 11 sheets (8 dated periods plus 3 support/template sheets); the tracked template keeps the 3 support/template sheets with floating holidays, an 8.5-hour formula, a missing Sunday subtotal and a TODAY signature date. Clock cells inspected in the original were blank. No sent status, true signature date or zero opening OT can be inferred. Import as imported_unverified with source SHA-256/mapping version and an idempotent batch key.

Opening balance requires explicit minutes, date, reason and evidence; do not infer it from defective formulas. Repeating the same source/opening event cannot post again. Imported history never starts reminders/automatic sends. WP4 previews the tracked template filled with synthetic dated sheets; no personal history workbook is retained, and routine tests use synthetic copies.
