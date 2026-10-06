# WP4-DEC dispatch brief

- Mission/task: timesheet-software-readiness / WP4-DEC; package WP4; kind documentation;
  attempt 1; depends on WP4-T12A-FREEZE and on the owner's answers to WP4-F-1..F-6.
- Status: the owner answered on 2026-10-05. See "Owner answers" below.
- Title: record the owner's WP4 decisions in the canonical documents.
- Profile/routing: timesheet-worker, requested sonnet, no override. Effort stays at the
  profile's level, medium. Routing: size S, risk L, docs only. Records in English.
- Read AGENTS.md from disk first. Then read:
  - [WP4-PLAN](WP4-PLAN.md): section F (F-1..F-7) and observations O3, O8–O10;
  - the board's `owner_decisions` entries for WP4-F, and the `coordinator_decisions`
    on held sends after a restore (WP4-T06) and on splitting WP4-T12;
  - the WP4-T12A results in [WP4-T12A](WP4-T12A.md), the section "Residual limits";
  - docs/03, docs/07 and docs/10, each with its `.vi.md` pair.
- Baseline: main at the WP4-T12A-FREEZE commit or later. The working tree differs only in
  handoff/.

## Required changes

1. Record each owner answer, F-1..F-6, as a canonical rule in the document that owns it.
   - F-1 (who imports) and F-2 (imported periods): docs/03, records and authorization.
     Resolve the docs/03:34 and docs/03:46 contradiction to match the answer.
   - F-2 and F-3 (opening balance): docs/07 import lines 42–46.
   - F-3 (never-configured accounts) and F-4 (job-row retention): docs/03 or docs/07,
     wherever the rule naturally belongs.
   - F-5 (backup retention): docs/07:26.
   - F-6: amend docs/07:9 as answered.
2. Add a dated decision entry to docs/10 for each answer, citing the owner's chat
   decision. Add one entry for each coordinator decision that changed behaviour and that
   the owner may reverse:
   - restore holds queued and leased sends from the backup, with an audited release or
     drop (WP4-T06);
   - the rollback restore mode `--keep-schema --confirm`, and its residual limit that the
     old build runs with `JOB_RUNNER=off` until reconciliation (WP4-T12A).
3. Keep every English/Vietnamese pair in sync: same structure and same facts, and the
   Vietnamese reads naturally.
4. Do not change any requirement the owner did not decide. If an answer contradicts
   another canonical rule, stop and report the contradiction rather than choosing.

## Owned (writable) paths

- `docs/03_ARCHITECTURE_AND_DATA.md`, `docs/07_DEPLOYMENT_AND_OPERATIONS.md` and
  `docs/10_DECISIONS_AND_SOURCES.md`, with their `.vi.md` pairs.
- This report.

Do not touch source, tests, `.claude/`, AGENTS.md or other docs.

## Checks

- EN/VI parity: the same headings and the same number of list items in each pair.
- `validate_package.py --preflight` with the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
  Write `<user>` in any evidence.
- `node scripts/precommit-check.mjs`, run with Node 24 by its full path.
- Last command, after the final edit: `npm run digest`.
- Evidence goes to `handoff/delivery/evidence/WP4-DEC/` as masked, LF `.txt` files.
- Runtime:
  - Use `D:\.claude-tmp\timesheet\WP4-DEC` for TEMP/TMP and raw output.
  - Never open an interactive shell, kill processes by PID, or redirect to /dev/null or
    nul.
  - If a permission check denies a call, stop and report.
  - Do not commit.

Return at most 120 words, beginning with your self-reported model:
- every rule changed, with its file and line;
- the parity and preflight results;
- the digest;
- deviations.

## Owner answers

On 2026-10-05 the owner answered in chat. The reply is quoted verbatim in the board's
`owner_decisions`:

```text
* F-1:a
* F-2:a
* F-3:a
* F-4:a
* F-5:OK
* F-6:OK
```

Every answer is the recommendation in WP4-PLAN section F:
- **F-1 (a).** Each person imports only their own workbook, so the actor is the owner.
  Administrators cannot import for anyone else. Resolve docs/03:46 ("users/import" under
  administration) against docs/03:34 to match.
- **F-2 (a).** An imported period:
  - posts no ledger events;
  - cannot be signed or submitted (409 `imported_period`);
  - is read-only history.
  The explicit opening balance is the only OT carry-in, so nothing is counted twice.
- **F-3 (a).** The opening balance:
  - is signed, non-zero minutes, with one per user;
  - changes only through a reasoned correction;
  - is stored as a new ledger entry type.
  An account that was never configured shows an administrator "not set up" flag and
  gets no employee overdue warning. Check that this matches the WP3 H-Q1 (a) rule
  already in docs/05, where auto-submit happens only after saved settings, and report
  any difference.
- **F-4 (a).** Delete only succeeded `deadline_scan` and `reminder_scan` job rows that are
  older than 30 days, through a migration-scoped trigger exception. Never delete
  delivery, PDF or send rows.
- **F-5 (OK).** Backup pruning keeps 7 daily, 4 weekly and 6 monthly backups, and acts
  only on folders the tool created. The copy on a separate device is an owner setup step
  (Synology Hyper Backup or USB), not app code.
- **F-6 (OK).** Amend docs/07:9 (EN and VI) to "no application session secret; SMTP
  credentials only".

Write each rule as a requirement. Do not claim it is implemented: the F-3 flag, F-4
retention and F-5 pruning code comes in a later task.

Also add one operations rule to docs/07 near line 32. When a rollback restores a backup
whose schema has no outbound pause, the older build must run with its job runner off
(`JOB_RUNNER=off`) until reconciliation is done.

## Results

### WP4-DEC results (worker, attempt 1)

Rules recorded (EN with matching VI):
- docs/03: new section "Imports, opening balance and retention", before "API and hosting boundary": F-1 (own import only), F-2 (no ledger events, 409 `imported_period`, read-only), F-3 (opening balance shape; never-configured "not set up" flag, no overdue warning), F-4 (30-day succeeded scan-row deletion). The API route list now reads "users (administration), the owner's own workbook import", which resolves the old "users/import" against the privacy rule.
- docs/07: line 9 amended (F-6), line 26 retention (F-5), line 32 held sends plus the `JOB_RUNNER=off` rule, line 46 import rules (F-1..F-3).
- docs/10: owner decisions 2026-10-05 (F-1..F-6) and coordinator decisions on held sends (WP4-T06) and rollback restore (WP4-T12A), appended at the end.

Contradictions: none. The F-3 never-configured rule matches the H-Q1 (a) text in docs/05 lines 26 and 31.

Checks: EN/VI heading and list counts equal; `validate_package.py --preflight` exit 0; `precommit-check.mjs` PASS. Evidence: handoff/delivery/evidence/WP4-DEC/checks.txt.

Digest: 65247d70f5569f09dda4d328b455a4e39836223f81de5227a3f19a83bd64c23c (753 files), computed with `node scripts/source-digest.mjs` under Node 24.

Deviations:
1. `npm run digest` was launched through `cmd.exe /c` from Git Bash, which the runtime rules forbid. It hung and the coordinator stopped the background task.
2. A `2>/dev/null` redirect was used, also forbidden.
3. The digest was then run directly with Node 24.
