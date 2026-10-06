# WP4-AUDIT-A dispatch brief

- Mission/task: timesheet-software-readiness / WP4-AUDIT-A; package WP4; kind audit;
  attempt 1; depends on WP4-GATE (PASS).
- Scope: the package-final independent audit of area A, **operations**. Area A covers
  configuration, proxy, bootstrap, the image boundary, the WAL-consistent backup, the
  restore and its isolation, pause and reconciliation, upgrade and rollback, retention,
  admin status privacy and the runbook. The work comes from WP4-T01, T03–T07, T07B, T05B,
  T09B, T12A, T12 and T13.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size L,
  risk H, novelty no.
  - Use fresh context.
  - Write the task record in English. `WP4_REVIEW_A.md` and its `.vi.md` are bilingual
    and follow `handoff/templates/REVIEW.md`.
- Author separation: you authored nothing in WP4.
  - The author agent IDs are on the board: every WP4 task other than gates, audits and
    commits.
  - The strongest author model in WP4 is opus (T05, T06, T09 and T10), so this audit
    runs at opus.
  - Treat every report, HANDOFF line and gate result as a claim.
- Target: `reviewed_commit` is the WP4-GATE `freeze_commit`. The coordinator gives that
  SHA and the gate digest in the dispatch prompt. Record HEAD and the source digest
  before and after; the digest must equal the gate digest.
- WP4-AUDIT-B may run at the same time in its own scratch folder. Do not share files
  with it.

## Runtime

- Use your own scratch clone or export under `D:\.claude-tmp\timesheet\WP4-AUDIT-A`,
  outside Dropbox. Use it for TEMP/TMP.
- Use Git Bash only. Never use `cmd.exe` in any form, PowerShell without `-Command`, or
  any interactive shell. Keep shell calls in the foreground.
- Make the first shell call a trivial `node --version`, with Node 24 by full path;
  plain `node` resolves v26. Stop on ENOSPC.
- Docker, if you run any container probe:
  - use the Compose project name `ts-wp4-aud-a`, and remove only it, by name;
  - never push, log in or prune.
- Whenever you run the CLI or the server, set both `DATA_DIR` and `DATABASE_PATH`
  explicitly under your task folder. Never rely on their defaults: the WP4-GATE
  verifier once migrated the owner's local development database that way.
- Do not edit source. Use capture mode only; never send real mail.
- Never kill processes by PID. Never write into the repository root. Never redirect to
  /dev/null or nul.
- If a permission check denies a call, stop and report. Do not retry or rephrase it.
- Write records with the Edit or Write tools.

## Read first

- AGENTS.md, from disk.
- [WP4_REVIEW](../../prompts/WP4_REVIEW.md) (your review prompt) and
  `handoff/prompts/WP4_IMPLEMENT.md`.
- docs/03, docs/05, docs/06 (AC-11, AC-15, plus the AC-01 and AC-08 regressions),
  docs/07, docs/10 and the new docs/11.
- `handoff/delivery/WP4_HANDOFF.md`, the WP4-GATE results, and [WP4-PLAN](WP4-PLAN.md).
- The board `owner_decisions` and `coordinator_decisions`.

## Scope

1. **Configuration and proxy (T01).**
   - Configuration fails fast.
   - `TRUSTED_PROXY_ADDRESSES`: a client cannot spoof `X-Forwarded-For` unless the
     proxy is trusted; the login limiter keys on the real client.
   - `/api/ready` carries no personal data.
2. **Bootstrap (T03).**
   - The one-time setup token is stored hashed, expires after 60 minutes and is single
     use. `--new-token` behaves as documented.
   - Nothing secret appears in logs or responses.
3. **Image boundary (T04).**
   - The pinned base digest.
   - The non-root UID 10001 and the read-only root.
   - No source maps, tests, `reference/` or secrets in the image.
   - Persistence only under `/data`.
4. **Backup (T05, T09B, T05B).**
   - The online backup is WAL-consistent under writes.
   - The manifest holds hashes and sizes only.
   - Import sources are included.
   - Pruning selects only tool folders with a matching manifest, always keeps the
     newest, refuses any target escape, and the dry run removes nothing.
   - Probe a symlink or junction escape on Windows if you can.
5. **Restore, pause and reconciliation (T06).**
   - The restore never writes into the live `DATA_DIR`.
   - After a restore, held queued and leased sends are never sent automatically after
     `resume`. Uncertain attempts are never resent (AC-08).
   - `release` and `drop` require `--confirm` and are audited.
   - Jobs created after the restore are not held.
6. **Upgrade and rollback (T12A).**
   - Migrations apply once, under an exclusive lock.
   - The old binary refuses the upgraded database.
   - `restore --keep-schema --confirm` holds the sends from the backup. Judge the
     residual limit and the `JOB_RUNNER=off` rule.
   - **Migration runner (T10):** `migrate()` now sets `foreign_keys` OFF around the
     exclusive transaction and runs `foreign_key_check` before COMMIT. Probe these:
     - a failing migration rolls back cleanly;
     - `foreign_keys` is restored on every path;
     - no FK violation can be committed;
     - concurrent openers are safe.
7. **Retention (T07B, F-4).**
   - The `jobs_no_delete` trigger exception deletes only succeeded scan rows older than
     30 days. It works only inside the retention window, and never for referenced,
     delivery, PDF or send rows.
   - Try to abuse the window table from the application path.
8. **Admin status and privacy (T07, T07B).**
   - The exact allowlists, including `not_set_up` and `retention`.
   - No employee-derived data beyond docs/03:34. Note the wording question: docs/03:49
     says "operational status", while the flag sits in the user list.
   - No secret anywhere in responses, logs, the manifest or evidence.
9. **Daily jobs.**
   - The orphan sweep never removes a referenced file, including import sources.
   - Neither the sweep nor retention is held by the outbound pause.
   - Judge the relaxed job-count pins in `delivery.test.ts`, `jobs-restart.test.ts`
     and `automation.spec.ts`: are they weakened assertions or legitimate?
10. **Runbook (docs/11).**
    - Each command exists and behaves as written.
    - Each is mapped to a drill step or labelled an owner NAS step.
    - No real hostname, credential or personal data appears.
11. **Gate re-execution.** Independently rerun at least:
    - `npm ci` and `npm run verify` on your export;
    - drill stages 2, 3 and 5, or the full drill if time allows;
    - one backup-under-writes restore with hash and balance comparison.
12. **Carry items in your area**, from the HANDOFF: judge each one blocking or
    acceptable backlog.

## Output

- `handoff/delivery/WP4_REVIEW_A.md` and `.vi.md`.
- Your results, appended to this file.
- Evidence and probe sources in `handoff/delivery/evidence/WP4-AUDIT-A/`:
  - masked, LF, with no trailing whitespace;
  - probe scripts stored as `*.mjs.txt` or `*.py.txt`;
  - every email address masked as `<email>`.
- Decision: exactly one of PASS, FIX REQUIRED or NOT VERIFIED. List the findings
  separately, with severity, file and function, reproduction, expected and actual
  result, rule or AC, and a bounded fix.
- Leave no process or container running.

Return at most 200 words, beginning with your self-reported model.

## Results

(Auditor appends here.)

### Auditor result (attempt 1) - decision: FIX REQUIRED

Self-reported model: claude-opus-5-5 (equal to the strongest WP4 author model; fresh context; authored nothing in WP4).
Report: [WP4_REVIEW_A](../WP4_REVIEW_A.md) and its `.vi.md`. Evidence: `handoff/delivery/evidence/WP4-AUDIT-A/` (masked,
LF; index `00-README.txt`; probes as `*.mjs.txt`). Raw output stays in `D:\.claude-tmp\timesheet\WP4-AUDIT-A`.

**Target and digest.** Reviewed commit `13a258db86b2f0b6388830e584e2cca5303f1f6c`. The digest
`1ed67f55fb20c5bed64926c54ce635211f09c44ce33d50a2f88c8354577addfe` (774 files) was the same at every point:

- in the repository, before (10:44 UTC) and after (11:18 UTC);
- in the `git ls-tree` form;
- on the export after npm ci, verify, the drill and every probe.

It equals the gate digest. HEAD did not move; `main` was level with `origin/main`. No source was edited.

**Checks rerun.** Node 24.21.0 portable, Git Bash, Docker 28.5.1. Compose project `ts-wp4-aud-a`. Capture mode and
synthetic data only. DATABASE_PATH and DATA_DIR were set explicitly under the task folder for every CLI and server run.

| Item | Command / exit | Result |
|---|---|---|
| Install | `npm ci` on a `git archive` export: exit 0 | 169 packages, no deprecation line |
| Verify | `npm run verify`: exit 1 with DATA_DIR exported; exit 0 without it | 75 files / 1710 tests both times. The smoke fails only when DATA_DIR is inherited (WP4-A-04). Clean run: SMOKE PASSED. |
| Drill | `container-drill.mjs --project ts-wp4-aud-a --wp3 <wp3 build>`: exit 0 | stages 1-6, 31/31/56/35/27/23 PASS, 0 FAIL (205) |
| Migration runner | P1, P1b | Rollback, FK violation refused, `foreign_keys` restored on every path, older binary refused. Concurrent upgrades and restarts are clean. A brand-new file opened by several processes at once can give SQLITE_BUSY in `openDatabase` (R-A2, fail-safe). |
| Backup under writes and restore | P2: exit 0 | Point in time, ledger plus audit atomic, hashes equal, live tree untouched by the restore, balances equal through SQL and API |
| Prune | P3: exit 0 | Junction escapes not followed; dry run and refusals remove nothing. Backward clock keeps 1 of 180 (R-A1). |
| Target boundaries | P4: exit 0 | Junctions into DATA_DIR, the live folder and a folder in the backup are refused (2); tampered backups fail (1) and leave nothing |
| Bootstrap | P5: exit 0 | Hash only, 60 minutes, single use, `--new-token` rules, no leak |
| Proxy and configuration | P6: exit 0 | No XFF spoofing without a trusted peer; right-most untrusted hop; fail-fast without values; client source map served (WP4-A-01) |
| Retention and sweep | P7: exit 0 | Window abuse refused; only eligible scan rows deleted; both jobs run while paused; referenced files kept |
| Admin privacy | P8: exit 0 | Exact allowlists incl. `not_set_up` and `retention` |
| Outbound CLI | P9 | `--confirm` rules, exit codes, audited resume |

**Findings.**

- WP4-A-01 (Low, required). The image ships 114 `*.map` files, and production serves the client map with its full
  source text. Locations: `Dockerfile:42`, `tsconfig.server.json:9`, `vite.config.ts:12`; the drill scan has no
  `*.map` rule. Rule: docs/07:9; scope item 3.
- WP4-A-02 (Low, same round). `.env.example:60` limits `JOB_RUNNER=off` to tests and drills, which contradicts the
  rollback rule in docs/07:32 and docs/11:194.
- WP4-A-03 (Low, same round). docs/11 says the screen shows the retention result, but it is JSON only. docs/11 and a
  `bootstrap.ts` comment say refusals quote no file value, but dates and policy numbers are quoted.
- WP4-A-04 (Info, optional). The smoke inherits the caller's DATA_DIR.

Risks R-A1 to R-A9 are in the report.

**Scope 1-12.** All behaviour checks hold; scope item 3 fails only on WP4-A-01. Item 9: the relaxed pins in
`delivery.test.ts` and `jobs-restart.test.ts` stay exact and are legitimate. The `automation.spec.ts` bounds are weaker
but acceptable, because integration tests pin "no scan job without activation" exactly. Item 8: `not_set_up` in the
account list is consistent with docs/03:34. Item 12: the HANDOFF carry items of area A are acceptable backlog or owner
steps; the decisions are in the report.

**Not run.** NAS and native arm64: NOT VERIFIED. `npm run test:e2e`: not rerun; it is not required for area A.

**Notes.**

- `handoff/delivery/translation-map.json` and the board were not edited. If the package validator needs the new
  EN/VI pair, the coordinator or committer adds `WP4_REVIEW_A` there.
- Probe reruns caused by probe defects are disclosed at the top of each log.

**Next action.** A bounded fix task (FIX_FINDINGS) for WP4-A-01, with WP4-A-02 and WP4-A-03, and optionally WP4-A-04.
Then a freeze, the gate and a fresh area-A recheck.
