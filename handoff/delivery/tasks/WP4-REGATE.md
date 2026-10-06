# WP4-REGATE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-REGATE; package WP4; kind gate;
  attempt 1; depends on WP4-FIX-FREEZE.
- The package-final gate, rerun on the fixed freeze. The fixes are WP4-FIXB (WP4-B-01,
  B-02, R1, R3) and WP4-FIXA (WP4-A-01 to A-04, R-A1, R-A5, R-A7).
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H, novelty no. Records in English.
- Target: `freeze_commit` = the WP4-FIX-FREEZE commit; the coordinator gives the SHA in
  the dispatch prompt.
  - Record HEAD and the source digest before and after. They must not change.
  - The digest of record is computed on the clean export and cross-checked with the
    `git ls-tree` form.
- Read AGENTS.md from disk first. Then read:
  - [WP4-GATE](WP4-GATE.md): all 13 items and their earlier results;
  - [WP4_REVIEW_A](../WP4_REVIEW_A.md) and [WP4_REVIEW_B](../WP4_REVIEW_B.md);
  - the results of [WP4-FIXB](WP4-FIXB.md) and [WP4-FIXA](WP4-FIXA.md).

## Runtime

Use the WP4-GATE runtime rules, with these changes:
- the task folder is `D:\.claude-tmp\timesheet\WP4-REGATE`;
- the Compose project is `ts-wp4-regate`.

In addition:
- Never feed scripts to python or node through stdin; write probe files.
- For every CLI or server run, set `DATA_DIR` and `DATABASE_PATH` explicitly under the
  task folder.
- Never use `cmd.exe` in any form.
- If a permission check denies a call, stop and report.
- Leave nothing running.

## Gate items

1. Rerun all 13 WP4-GATE items on a clean export of the new freeze, and record each
   result.
   - The expected counts change: verify at about 1730 tests or more, plus the FIXA
     tests.
   - The drill adds the `.map` checks and the two-job release.
2. Finding checks, each with its command, exit code and result:
   - **B-01:** rebuild the audit probes P1b, P6 and P7 from
     `handoff/delivery/evidence/WP4-AUDIT-B/probe-*.mjs.txt`.
     - The 65 KB package is refused quickly with 422.
     - `/api/health` stays responsive while the refusal happens.
     - The formula-heavy package is refused, or its report stays bounded.
     - The tracked template still previews.
   - **B-02:** 150,000 Holiday Dates cells give 422 or a preview, never 500.
   - **R3:** a not-yet-due period is skip-only (`not_due`). **R1:** an OT leave
     reservation inside an imported period answers 409.
   - **A-01:**
     - The image holds no `.map` file and no `sourceMappingURL`.
     - `/assets/*.map` answers 404.
     - The drill's forbidden-file scan includes `*.map`.
   - **A-02:** the `.env.example` wording. **A-03:** the runbook statements are true:
     the retention wording, and what bootstrap refusals print.
   - **A-04:** `npm run verify` passes with `DATA_DIR` exported to a task folder.
   - **R-A1:** prune with a candidate dated after the clock exits 2 and removes
     nothing.
3. Diff scope since the first gate's freeze 13a258d: list the paths. Only the FIXB and
   FIXA paths and handoff records may appear.

## Output

- Write the results in this file, with masked LF evidence in
  `handoff/delivery/evidence/WP4-REGATE/`.
- Decide PASS or FAIL, naming every failing item.
- Rerun an environmental flake once and record it.

Return at most 200 words, beginning with your self-reported model.

## Results

### Verifier result (attempt 1) - decision: PASS

Self-reported model: claude-sonnet-5-5. Freeze 0f7fba2ee6bc2a7affcd1a3bf800e085351c7b65. Node v24.21.0 portable, Git Bash,
workflow Python. Raw output `D:\.claude-tmp\timesheet\WP4-REGATE`; masked LF evidence `handoff/delivery/evidence/WP4-REGATE/`
(numbered by item; probes stored as `probe-*.mjs.txt`). DATA_DIR and DATABASE_PATH were set under the task folder for every run.

**Digest.** HEAD 0f7fba2 before and after; no non-handoff file changed. Digest of record, computed on the clean export (every
non-handoff blob of the export equals the freeze tree, checked with `git hash-object`) and by `npm run digest` and the
`git ls-tree` form: all `dfe4541d2c6c908a00782ed9fbe2fb7a3be48ea18aa9fc23ae1ced9085b86742` (775 files). Equals the committer claim.

| # | Item | Command / exit | Result |
|---|---|---|---|
| 1 | Export, install | `git archive 0f7fba2`, `npm ci`: exit 0 | No deprecation line. `npm audit` (info): exit 1, 1 high (source-map-js), as in the first gate. |
| 2 | Verify | `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify`, DATA_DIR exported: exit 0 | 76 files, 1734 tests passed (1730 + FIXA 4); typecheck, lint, build clean; no deprecation line; SMOKE PASSED, 42 PASS lines. |
| 3 | E2E | `npm run test:e2e`: exit 0 | 145 passed, 5 skipped. |
| 4 | Drill | `drill:container --project ts-wp4-regate --wp3`: exit 0 | `DRILL STAGES 1-6 PASSED`: 33, 31, 57, 35, 27, 23 PASS (208, 0 FAIL). Stage 1: forbidden-file scan (now with `*.map` under /app/dist) PASS, `User=10001:10001`, no `sourceMappingURL`, `/assets/<bundle>.map` 404. Stage 3: restored instance paused, nothing captured or sent, release by id then `--all` (two jobs), each job one attempt. Stage 5: old build refuses the upgraded database (exit 1), restore needs `--confirm`, schema 6 restored. Stage 6: replay no-op, one opening balance, 404 for others. WP3 export needed `npm ci` and `build:server` first (exit 0). Project removed by the drill; I removed the image `ts-wp4-regate-timesheet:drill` by name; no container, network or volume remains. |
| 5 | Workbook | tests (`05-targeted-verbose.txt`, the full 1734 run) | Same tests as the first gate pass (template hash, source SHA, mapping version 1, three README defects, unknown/duplicate/conflict, decisions, idempotent commit, opening balance, imported periods inert). Targeted run of 7 files: 142 passed. |
| 6 | Runbook | drill stages 4-5 PASS | docs/11 command map unchanged in structure; FIXA only changed wording and added the clock refusal. No unmapped, unlabelled command found. |
| 7 | Migrations | probe `07-migrations.txt`; `vitest run migrations upgrade` 61 passed | Fresh 1..13 and WP3 49651c8 (schema 6) upgrade 7..13: integrity ok, fk 0 rows, rerun applied nothing. Populated v12: tests. |
| 8 | Races, 10 fresh processes each | `vitest run` x10 per suite (`08-races-summary.txt`) | ot-leave-concurrency, finalization-concurrency, deadline-race, sharing revocation race, workbook-import concurrent commit, opening-balance concurrent post: 10/10 exit 0 each (60 runs). |
| 9 | Privacy, admin boundary | tests in the 1734 run | Pass (operations-status, user-admin, health, backup manifest, import and opening-balance ownership 404s, source never served, drill stage 6). |
| 10 | NAS target | none | NOT VERIFIED (no owner access). Owner steps are those listed in docs/11. |
| 11 | Validators | see Digest | `validate_package.py --preflight` exit 0; `validate_orchestration.py` exit 0; `check_recovery.py` exit 0 (workflow Python, `C:\Users\<user>\...`); `precommit-check.mjs --self-test` PASS (12 rules); precommit on the 149 added or modified files since 13a258d (temporary git dir outside the repository): exit 0, 0 blocking findings. `npm run digest` last, with the ls-tree form: see Digest. |
| 12 | Diff scope since 13a258d | `git diff --name-only 13a258d 0f7fba2` | 149 paths: 29 non-handoff (`16-diff-scope-nonhandoff.txt`) and 120 handoff records; none outside the FIXB, FIXA and handoff areas (below). |
| 13 | Mapping | unchanged | Every gate line maps to a test, a drill step or a NOT VERIFIED label, as in the first gate. |

**Finding checks.**

| Finding | Command / exit | Result |
|---|---|---|
| B-01 | P1b, P7 and P6 rebuilt from `probe-*.mjs.txt` (`12-p1b.txt`, `12-p7.txt`, `12-p6.txt`): exit 0 each | 65 KB (3 x 15.8 MiB `<c/>`): refused `part_too_large` in 4 ms, 167 to 169 MiB; over HTTP 422 in 5 ms. `GET /api/health` 300 ms into the upload: 200 after 2 ms (also for the 37 KB package). Formula-heavy 3 x 199 000 cells: refused (`part_too_large`) in 9 ms; 7 sheets `total_too_large`. Tracked template previews: 201 in 17 ms (`12-b02.txt`). |
| B-02 | HTTP probe `probe-b02` : exit 0 | 150 000 Holiday Dates cells: 422 `workbook_rejected` (`part_too_large`) in 16 ms, never 500; 20 000 cells: 201 preview. Tests: 4 B-02 tests pass (150 000 cells previewed with raised limits, 422 under defaults). |
| R3 | test `workbook-import ... red-first (R3)`; drill stage 6 | A period ended but not yet due is skip-only (`not_due`): passes. |
| R1 | tests `ot-leave R1`, `opening-balance ... imported_period` | Reservation inside an imported period answers 409 `imported_period`: pass. |
| A-01 | drill stage 1 (lines 14, 19, 20 of `04-drill.txt`); test `static-assets` (2 pass) | Image scan includes `*.map` under /app/dist: PASS; bundle has no `sourceMappingURL`; `/assets/*.map` 404. Dockerfile builds with `--sourceMap false` and `BUILD_SOURCEMAPS=off`. |
| A-02 | read `.env.example:60-62` | States JOB_RUNNER=off is required after a `restore --keep-schema --confirm` rollback until reconciliation, otherwise unset. Matches the drill's stderr warning. |
| A-03 | `probe-a03` (`13-a03.txt`) : exit 0; read docs/11 lines 73, 116, 247-253 | Seven invalid files with SECRET-LIKE markers in name, zone and unknown fields: all exit 1, no marker printed; refusals quote only a date or policy numbers, as stated. Retention appears only in the `GET /api/admin/operations` JSON, as stated. |
| A-04 | `npm run verify` with DATA_DIR exported: exit 0 | Smoke passes with the variable set (item 2). |
| R-A1 | `probe-ra1` (`14-ra1b.txt`) : exit 0; test `backup-prune ... (R-A1)` x2 | Candidate dated 2099 with the clock at today: `backup prune --dry-run` exits 2, `clock_behind_backups`, stdout empty, no path or folder name, 3 folders before and after. |

**Diff scope since 13a258d (29 non-handoff paths).** FIXB: `src/server/import/xlsxReader.ts`, `templateMapping.ts`,
`src/server/services/workbookImport.ts`, `otLeave.ts`, `tests/integration/workbook-reader.test.ts`, `workbook-import.test.ts`,
`ot-leave.test.ts`, plus the declared minimal extras `src/client/api.ts`, `src/client/importModel.ts`, `tests/client/importModel.test.ts`,
`tests/integration/opening-balance.test.ts`. FIXA: `Dockerfile`, `.env.example`, `vite.config.ts`, `scripts/container-drill.mjs`,
`scripts/smoke-built-server.mjs`, `src/server/ops/prune.ts`, `src/server/services/bootstrap.ts`,
`tests/integration/backup-prune.test.ts`, docs 03, 07, 10, 11 (EN and VI), and the declared extras `src/server/app.ts` and the new
`tests/integration/static-assets.test.ts`. No governance path (AGENTS, CLAUDE, `.agents`, `.claude`, skills-lock, docs 06/08/09,
prompts, templates). All 120 handoff paths are task, review and evidence records.

**Flakes and reruns.** None; no run failed.

**Observations (not failures).** (1) Two backups taken in the same UTC second collide on the day's "newest" choice: in my ad-hoc
CLI run (`14-ra1.txt`) the tie-break by name kept the older folder and pruned the just-created one. It needs two backups within
one second, so it is not a real schedule risk; the coordinator may note it. (2) In the ad-hoc run copied folders with a
mismatched manifest name were ignored (counted `ignored`), as designed; I then built valid synthetic folders for R-A1.
(3) Two of my commands wrote to `/dev/null` (a stray `cp` destination typo and one `>/dev/null` in a read-only check), against the
runtime rule; nothing was written to the repository root and no data was affected.

**Limits.** NAS NOT VERIFIED (item 10); no arm64 run. Nothing was committed, pushed or sent. No server, browser, container,
runner or background process is left. The exports, `pcgit` and raw output remain under the task folder (not removed recursively).
