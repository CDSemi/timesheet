# WP4-REGATE2 dispatch brief

- Mission/task: timesheet-software-readiness / WP4-REGATE2; package WP4; kind gate;
  attempt 1; depends on WP4-FIXB2-FREEZE.
- This reruns the WP4 package-final gate on the round-2 fix freeze:
  - WP4-FIXB2 replaced fast-xml-parser with a bounded streaming scanner and capped the
    report (WP4-RB-01).
  - WP4-DEPCLEAN removed the unused dependency.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H, novelty no. Records in English.
- Target: `freeze_commit` is the WP4-FIXB2-FREEZE commit. The coordinator gives the SHA
  in the dispatch prompt.
  - Record HEAD and the source digest before and after; they must not change.
  - The digest of record is the one computed on the clean export, cross-checked with
    the `git ls-tree` form.
- Read AGENTS.md from disk first. Then read:
  - [WP4-GATE](WP4-GATE.md) and [WP4-REGATE](WP4-REGATE.md): the items and their
    earlier results;
  - [WP4_RECHECK_B](../WP4_RECHECK_B.md): WP4-RB-01 and its probes r1–r3;
  - the [WP4-FIXB2](WP4-FIXB2.md) and [WP4-DEPCLEAN](WP4-DEPCLEAN.md) results.

## Runtime

Follow the WP4-GATE rules, with these settings:
- task folder `D:\.claude-tmp\timesheet\WP4-REGATE2`;
- Compose project `ts-wp4-regate2`.

Never feed scripts to python or node through stdin; write probe files and run them.
Set `DATA_DIR` and `DATABASE_PATH` explicitly under the task folder for every CLI or
server run. Never use `cmd.exe` in any form. If a permission check denies a call, stop
and report. Leave nothing running.

## Gate items

1. Rerun all 13 WP4-GATE items on a clean export of the new freeze.
   - `npm ci` must print no deprecation line. Confirm that `fast-xml-parser` is gone
     from `package.json`, from the lock and from `node_modules`.
   - Run verify (expect about 1,750 tests), e2e and the full drill with `--wp3`.
2. Run the WP4-REGATE finding checks again: B-01, B-02, R3, R1, A-01..A-04 and R-A1.
3. Run the RB-01 checks:
   - rebuild probes r1, r2 and r3 from
     `handoff/delivery/evidence/WP4-RECHECK-B/probe-*.mjs.txt`, and the first-audit
     probes P1b, P6 and P7;
   - each must be refused fast or stay within the stated budget (500 ms and +150 MiB
     per preview, report at most 2 MiB);
   - `/api/health` must stay responsive;
   - no request may answer 500;
   - the tracked template must still preview;
   - a realistic 12-dated-sheet synthetic workbook must preview, and its report must
     match the pre-FIXB2 report for the same input in its mapped days, labels and
     source cells. This checks that the new scanner reads benign workbooks the same
     way.
4. Diff scope since 0f7fba2: only WP4-FIXB2, WP4-DEPCLEAN and handoff records.

## Output

- Write the results in this file, and masked LF evidence in
  `handoff/delivery/evidence/WP4-REGATE2/`.
- Decide PASS or FAIL, naming every failing item.
- Rerun an environmental flake once and record it.

Return at most 200 words, beginning with your self-reported model.

## Results

### Verifier result (attempt 1) - decision: PASS

Self-reported model: claude-sonnet-5-5. Freeze cc34e7ff11e6c27f23fd2bf1b86f77159f95eb8d. Node v24.21.0 portable, Git Bash,
workflow Python. Raw output `D:\.claude-tmp\timesheet\WP4-REGATE2`; masked LF evidence
`handoff/delivery/evidence/WP4-REGATE2/` (numbered by item; probes as `probe-*.txt`; the earlier probes r1-r3, P1b, P6,
P7, B-02 were rebuilt unchanged from the RECHECK-B, AUDIT-B and REGATE evidence). DATA_DIR and DATABASE_PATH were set
under the task folder for every run.

**Digest.** HEAD cc34e7f before and after. Digest of record `96445de4ad266f0fa70f78c0c72b03625775d170e8841c757c39b2b5cae7d503`
(775 files): `npm run digest` in the repository, the `git ls-tree` form, and the clean export (all 775 non-handoff blobs
of the export hash-equal the tree, `git hash-object`; sha256 of that list). Equals the committer claim. Unchanged after the
checks; repository status is the same handoff-only set as at the start.

| # | Item | Command / exit | Result |
|---|---|---|---|
| 1 | Export, install | `git archive cc34e7f`, `npm ci`: exit 0 | 161 packages (was 169), no deprecation line. `fast-xml-parser` absent from package.json, package-lock.json and node_modules (0 matches; its 7 transitive packages absent too). `npm audit` (info): exit 1, 1 high (source-map-js, dev only). |
| 2 | Verify | `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify`: exit 0 | 76 files, 1750 tests; typecheck, lint, build clean; no deprecation line; SMOKE PASSED, 41 PASS lines, 0 FAIL. |
| 3 | E2E | `npm run test:e2e`: exit 0 | 145 passed, 5 skipped. |
| 4 | Drill | `drill:container --project ts-wp4-regate2 --wp3`: exit 0 | `DRILL STAGES 1-6 PASSED`: 33, 31, 57, 35, 27, 23 PASS (208, 0 FAIL). Stage 1: forbidden-file scan incl. `*.map` PASS, `User=10001:10001`, no `sourceMappingURL`, `/assets/<bundle>.map` 404. Stage 3: paused restore, nothing captured or sent, no job leased. Stage 5: old build refuses the upgraded DB, restore schema 6. Stage 6: replay no-op, one opening balance. WP3 export needed `npm ci` and `build:server` first (exit 0). Project removed by the drill; I removed image `ts-wp4-regate2-timesheet:drill` by name; no container, network or volume remains. |
| 5 | Workbook | tests in the 1750 run | Pass (template hash, source SHA, mapping version 1, README defects, unknown/duplicate/conflict, decisions, idempotent commit, opening balance, imported periods inert). |
| 6 | Runbook | drill stages 4-5 PASS | docs/11 unchanged since REGATE (diff touches only docs/07). No unmapped, unlabelled command. |
| 7 | Migrations | `cli.js migrate` probe exit 0; `vitest run migrations upgrade` 61 passed | Fresh 1..13 and WP3 49651c8 (schema 6) upgrade 7..13: integrity ok, fk 0, rerun applied nothing. Populated v12: tests. |
| 8 | Races, 10 fresh processes each | `vitest run` x10 per suite | ot-leave-concurrency, finalization-concurrency, deadline-race, sharing revocation race, workbook-import concurrent commit, opening-balance concurrent post: 10/10 exit 0 each (60 runs). |
| 9 | Privacy, admin boundary | tests in the 1750 run | Pass (unchanged areas; drill stage 6 404s). |
| 10 | NAS target | none | NOT VERIFIED (no owner access). The RB-01 time and memory budget is measured on this workstation only. |
| 11 | Validators | workflow Python, `C:\Users\<user>\...` | `validate_package.py --preflight`, `validate_orchestration.py`, `check_recovery.py`: exit 0, status PASS. `precommit-check.mjs --self-test` PASS (12 rules). Precommit on the 9 changed non-handoff files (temporary git dir outside the repository): exit 0, 0 findings. `npm run digest` last: see Digest. |
| 12 | Diff scope since 0f7fba2 | `git diff --name-status 0f7fba2 cc34e7f` | 127 paths: 118 handoff records and 9 non-handoff: `src/server/import/xlsxReader.ts`, `templateMapping.ts`, `src/server/services/workbookImport.ts`, `tests/integration/workbook-reader.test.ts`, `workbook-import.test.ts`, `docs/07` EN and VI (FIXB2), `package.json` and `package-lock.json` (DEPCLEAN). No governance path. |
| 13 | Mapping | unchanged | Every gate line maps to a test, a drill step or a NOT VERIFIED label. |

**Round-1 finding checks.** B-01 and B-02: probes below. R3 and R1: tests `workbook-import ... red-first (R3)` and
`ot-leave R1 ... 409 imported_period` pass (also in the 1750 run). A-01: drill stage 1 lines above. A-02: `.env.example:59-61`
states JOB_RUNNER=off after a `restore --keep-schema --confirm` rollback until reconciliation, otherwise unset (unchanged).
A-03: probe, 7 invalid files with SECRET-LIKE markers: all exit 1, no marker printed. A-04: verify ran with DATA_DIR exported:
exit 0. R-A1: prune with a 2099 candidate and the clock at today exits 2 `clock_behind_backups`, stdout empty, 3 folders
before and after. Targeted run of those suites: 48 passed.

**RB-01 checks** (budget 500 ms and +150 MiB per preview, report at most 2 MiB; fresh child per case, in memory unless HTTP).
- r1 (`12-r1-cost.txt`, 39 cases), exit 0: every hostile shape is refused fast or bounded. Digit, blank, punctuation tag
  names H2a/b/c/e: `malformed_xml` in 25 ms, +20 MiB. H1b/H1c: `too_many_elements` in 15-27 ms. H4a/b/c: `too_many_attributes` in
  54-62 ms (worst +73 MiB). H1d 57 ms, +65 MiB (worst memory), `total_xml_too_large`. H5b (4 MiB string x 2000 names): accepted,
  41 ms, preview 0.57 MiB. H5d 0.03 MiB. H5e/f 82-84 ms, 0.39 MiB. H6a/b 55-58 ms, 0.02 MiB. H7 34 ms. Largest preview: 60 dated
  sheets, 68 ms, 0.25 MiB. No case above 90 ms or +73 MiB; no THROWN.
- r3 (`12-r3-bypass.txt`) exit 0: `<1/>`, `<9/>`, `< />`, `<.a/>` refused `malformed_xml` in 16-27 ms, +6-10 MiB; `<c/>` and `<row/>` refused
  (`too_many_cells`, `too_many_elements`); a 3.8 MiB-attribute `<c>`: `too_many_attributes`, 64 ms.
- r2 over HTTP (`12-r2-http.txt`) exit 0: every request answered 201 or 422, never 500; `/api/health` 300 ms into each upload
  answered 200 in 1-3 ms (H2a 422 in 10 ms, H4b 422 in 54 ms, H5b 201 in 37 ms with a stored report of 0.57 MiB at most, the
  largest `report_json` 0.57 MiB); server stderr: no error line; tracked template 201; 60 dated sheets 201 in 77 ms.
- P1b (`12-p1b.txt`): 37 KB and 65 KB `<c/>` packages and the 113 KB valued one, and the 150 000-cell holiday sheet: `part_too_large`
  in 2-6 ms. P7: 1 and 3 sheets `part_too_large`, 7 sheets `total_too_large`, 0-7 ms. P6 (HTTP): 37 KB and 65 KB: 422 in 10 and
  4 ms, health 2 ms. B-02 (HTTP): 150 000 cells 422 in 10 ms; 20 000 cells 201; tracked template 201 in 10 ms.
- **Benign-workbook differential** (`probe-diff-*.txt`, `12-differential-hashes.txt`): the tracked template (26 KB) and a synthetic
  12-dated-sheet workbook (84 KB: 12 periods x 14 days, mixed clocks, holidays, a formula label, an unknown label, a blank
  date, a Sunday with clocks, clean and inherited formulas) were built once and previewed by the pre-FIXB2 reader (export of
  0f7fba2 with `npm ci`) and by the new one. The full preview JSON is byte-identical for both (sha256 `2285f7ee...` and
  `b830fb06...`; 3 742 and 91 385 bytes), so mapped days, labels and source cells match, and nothing is truncated. New 11 and
  17 ms against 19 and 42 ms before.

**Flakes and reruns.** None; no run failed.

**Observations.** (1) My p7 in-process summary line shows 154-307 MiB maxRSS because it builds the package in the same
process; r1 (fresh child) shows +7-10 MiB for the same cases. (2) Rule slip: one `cp ... /dev/null` (a stray command with a
discarded copy), nothing written or read from it. (3) The 12-sheet workbook was previewed in memory, not over HTTP; HTTP
previews were the template and 60 dated sheets (both 201). (4) A pre-FIXB2 export remains under `<task>\pre` for the
differential (not recursive-removed).

**Limits.** NAS NOT VERIFIED; the budget is a workstation measurement. Nothing was committed, pushed or sent. No server, browser,
container, runner or background process is left; the exports, `pcgit2` and raw output remain under the task folder. Failing items:
none.
