# Historical r1.1 documentation release validation

**Historical scope:** the counts, hashes and no-application statement below describe the original r1.1 documentation package, not the current repository. WP1 is implemented and awaiting independent review; see [STATE](STATE.json), the [WP1 handoff](WP1_HANDOFF.md) and [DEVELOPMENT](../DEVELOPMENT.md). WP1 logs are implementer evidence, not independent review results.

**Current repository:** the r1.1 manifests list 75 files and 33 translation pairs; they omit DEVELOPMENT, the WP1 handoff and the application source, and many documents have changed since (for example AGENTS, README, NEXT_ACTION, STATE and the input notes). The workbook is now the sanitized public template, so its hash differs from the snapshot. Use `python delivery/validate_package.py --preflight` for the current repository: it skips tooling, dependency, build and agent-skill folders (`.git`, `node_modules`, `dist`, `coverage`, `.agents`, `.claude`, `.idea`, `docs/agents`) and checks translation pairs, local links, JSON, the tracked template hash and all fixture arithmetic. Normal mode still compares the historical manifests and is expected to fail until a new manifest scope is defined; do not regenerate historical hashes to hide differences.

Release: 2026-09-30-r1.1. English governs; translations are paired by path and SHA-256 in [translation-map.json](translation-map.json).

Revision r1.1 expands the startup walkthrough and records confirmed Claude Max 20x. Business rules and reference fixtures are unchanged.

Content checks cover:
- 33 English/Vietnamese Markdown pairs with matching stable requirement/package/scenario IDs.
- Existing local document links and valid JSON; external sources retain their preparation date.
- 91 unique reference scenarios: 33 OT, 32 time, 16 deficit and 10 ledger-accounting cases.
- Independently recomputed threshold/rounding, elapsed-time/calendar/DST and deficit expectations.
- Ledger expected-balance/delta arithmetic; this does not test real transaction concurrency.
- Original workbook size and SHA-256 preserved exactly.

Run from the extracted package root:

```sh
python3 delivery/validate_package.py
```

Requires Python 3.9+ and an IANA time-zone database. The checker is read-only. Normal mode validates document/translation hashes against [package-manifest.json](package-manifest.json), which lists every file except itself. --preflight skips the manifest comparison; use it for the current repository (see above).

Release packaging also checks ZIP CRC, member paths and exact extracted bytes against the source tree. If you intentionally update canonical docs, translate matching files and regenerate manifests; do not edit hashes merely to hide a mismatch.

## What is not certified

No application has been built, deployed or tested by this documentation package. Database isolation/concurrency, actual PDF rendering, email/retry behavior, NAS compatibility and live backup/restore must be demonstrated during the roadmap gates. No real messages were sent and no production activation occurred. Model availability/account quotas remain client-specific; workload estimates are not quota guarantees.
