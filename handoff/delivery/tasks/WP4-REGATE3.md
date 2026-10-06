# WP4-REGATE3 dispatch brief

- Mission/task: timesheet-software-readiness / WP4-REGATE3; package WP4; kind gate;
  attempt 1; depends on WP4-FIXB3-FREEZE.
- Scope: rerun the WP4 package-final gate on the round-3 fix freeze. In that round,
  WP4-FIXB3 met the parse budget with margin and fixed R-B2-1 and R-B2-2.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H, novelty no. Records in English.
- Target: `freeze_commit` = the WP4-FIXB3-FREEZE commit, as given in the dispatch
  prompt.
  - Record HEAD and the source digest before and after.
  - The digest of record is computed on the clean export and cross-checked with the
    `git ls-tree` form.
- Read AGENTS.md from disk first. Then read:
  - [WP4-REGATE2](WP4-REGATE2.md), for the items and earlier results;
  - [WP4_RECHECK_B2](../WP4_RECHECK_B2.md), for WP4-RB2-01 and the shapes E7 and Y7;
  - the [WP4-FIXB3](WP4-FIXB3.md) results.

## Runtime

Follow the WP4-GATE rules, with these settings:
- task folder `D:\.claude-tmp\timesheet\WP4-REGATE3`;
- Compose project `ts-wp4-regate3`.

Also:
- Never feed scripts to python or node through stdin; write probe files.
- For every CLI or server run, set `DATA_DIR` and `DATABASE_PATH` explicitly under the
  task folder.
- Never use `cmd.exe` in any form.
- If a permission check denies a call, stop and report.
- Leave nothing running.

## Gate items

1. **The WP4-REGATE2 run, repeated on the new freeze.**
   - All 13 WP4-GATE items: install, verify (about 1,755 tests), e2e, the full drill
     with `--wp3`, migrations, races, privacy, validators and the mapping.
   - The round-1 finding checks.
   - The RB-01 probes: r1–r3, P1b, P6 and P7.
2. **RB2-01 checks.** Rebuild E7 and Y7 from
   `handoff/delivery/evidence/WP4-RECHECK-B2/probe-b2-cost.mjs.txt`, and the expert's
   worst-case search from `handoff/delivery/evidence/WP4-FIXB3/probe-search.mjs.txt`.
   - Each case is refused fast, or stays under 500 ms and +150 MiB, with
     `/api/health` responsive and no 500.
   - Record the worst time and memory you see.
3. **R-B2-1 and R-B2-2.**
   - The floating flag follows the matched holiday.
   - A declared non-UTF encoding is refused.
4. **The benign differential.** Run it for the template and a 12-dated-sheet workbook
   against the accepted WP4-T09 reader. It must still be byte-identical.
5. **Diff scope since cc34e7f.** Only the WP4-FIXB3 paths and handoff records may
   appear.

## Output

- Write the results into this file, and masked LF evidence into
  `handoff/delivery/evidence/WP4-REGATE3/`.
- Decide PASS or FAIL, naming every failing item.
- Rerun an environmental flake once and record it.

Return at most 200 words, beginning with your self-reported model.

## Results

### Verifier result (attempt 1) - decision: PASS

Self-reported model: claude-sonnet-5-5. Freeze 972ccda6409a7521a008c55c35a5b5cf416daf1e. Node v24.21.0 portable, Git Bash,
Python from the codex runtime (has tzdata) for the validators. Raw output `D:\.claude-tmp\timesheet\WP4-REGATE3`; masked LF
evidence `handoff/delivery/evidence/WP4-REGATE3/` (numbered by item, probes as `*.mjs.txt`). DATA_DIR and DATABASE_PATH were
set under the task folder for every CLI/server run.

**Digest.** HEAD 972ccda before and after. Digest of record `635f909da72873548d93407fb3d250806a7e1c29f101cb32e91234c2c9ec3f7b`
(775 files): equal in three forms (`npm run digest` in the repository, `git ls-tree` form, and the clean export, hashing all
775 non-handoff files with `git hash-object --no-filters`). Equals the committer claim. Unchanged after the checks (all three
re-computed; the export too). Repository status is the same handoff-only set as at the start plus this evidence folder.

| # | Item | Command / exit | Result |
|---|---|---|---|
| 1 | Export, install | `git archive 972ccda`, `npm ci`: exit 0 | No deprecation line. `fast-xml-parser` absent from package.json, lock and node_modules. `npm audit` (info): 1 high (dev only, as before). |
| 2 | Verify | `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify`: exit 0 | 76 files, 1755 tests passed; no deprecation line; SMOKE PASSED, 41 PASS, 0 FAIL. |
| 3 | E2E | `npm run test:e2e`: exit 0 | 145 passed, 5 skipped. |
| 4 | Drill | `drill:container --project ts-wp4-regate3 --wp3`: exit 0 | DRILL STAGES 1-6 PASSED, 208 PASS (33/31/57/35/27/23), 0 FAIL. WP3 export `npm ci` + `build:server` first (exit 0). I removed image `ts-wp4-regate3-timesheet:drill` by name; no container, network or volume remains. |
| 5 | Workbook | tests in the 1755 run | Pass. |
| 6 | Runbook | drill stages 4-5 | Pass. |
| 7 | Migrations | `cli.js migrate` probe exit 0; `vitest run migrations upgrade`: 61 passed | Fresh 1..13 and WP3 (schema 6) upgrade 7..13: integrity ok, fk 0, rerun applied nothing. |
| 8 | Races, 10 fresh processes each | `races.sh` | ot-leave, finalization, deadline, sharing revocation, workbook-import concurrent commit, opening-balance concurrent post: 10/10 exit 0 each. |
| 9 | Privacy, admin boundary | tests in the 1755 run | Pass. |
| 10 | NAS target | none | NOT VERIFIED (no owner access). Time/memory budget measured on this workstation only. |
| 11 | Validators | `validate_package.py --preflight`, `validate_orchestration.py`, `check_recovery.py`: exit 0, 0, 0 | All status PASS. `precommit-check.mjs --self-test` PASS (12 rules). Precommit over the evidence folder (60 files, temporary git dir outside the repository): exit 0, 0 findings. |
| 12 | Diff scope since cc34e7f | `git diff --name-status cc34e7f 972ccda` | Non-handoff paths: `src/server/import/xlsxReader.ts`, `templateMapping.ts`, `src/server/services/workbookImport.ts`, `tests/integration/workbook-import.test.ts`, `workbook-reader.test.ts`, `docs/07` EN and VI. The rest are handoff records. No package.json, lock, config or governance path. |
| 13 | Mapping | unchanged | Every gate line maps to a test, a drill step or a NOT VERIFIED label. |

**Round-1 finding checks.** B-01/B-02: probes below. R3, R1: tests in the 1755 run. A-01: drill stage 1. A-03: probe, 7 invalid
files, all exit 1, no SECRET-LIKE marker printed. R-A1: prune with a 2099 backup exits 2 `clock_behind_backups`, stdout empty,
3 folders before and after. A-04 and A-02 as in REGATE2 (verify ran with DATA_DIR set; `.env.example` unchanged). Targeted run
(migrations, upgrade, ops, backup, prune, bootstrap, config): 6 files, 170 passed.

**RB-01 probes** (budget 500 ms and +150 MiB; fresh child per case; HTTP for r2/p6/b02). r1 (39 cases) exit 0: no OVER-BUDGET,
no THROWN; worst +77 MiB (H4a) and 110 ms (H5e); r3 (7 cases) exit 0: all refused, worst 82 ms; P1b and P7: `part_too_large` or
`total_too_large` in 0-11 ms; r2 over HTTP: only 201/422, health 2-5 ms 300 ms into each upload, no stderr error line; p6
(422 in 12 and 5 ms, health 3 ms); b02 (150 000 cells 422 in 14 ms; 20 000 cells 201 in 64 ms; template 201 in 10 ms).

**RB2-01 checks.**
- RB2 catalogue (`probe-b2-cost`, 77 cases incl. E1-E11, T, A, D, X, K, M, S, L, Y, Z): exit 0, no OVER-BUDGET, no THROWN.
  E7, E7b-d and E8: `attribute_too_large` in 20-26 ms, +19-22 MiB. Y7 76 MiB / 150 ms (repeats 143-145 MiB high-water, +76 to
  +78; 137-149 ms), Y8 +73 / 160 ms, Y9 +71 / 140 ms. The worst of this catalogue: Y8 160 ms and Y6 +86 MiB (156 MiB, 149 ms).
- Over HTTP (`probe-b2-http`, whole catalogue): 422 or 201 for every case, no 5xx or transport error, `/api/health` worst
  during an upload 102 ms, idle 1 ms, server stderr no error line; largest stored report_json 1.608 MiB (cap 2 MiB); the V1-V3
  report/decision checks and cross-user 404s passed.
- FIXB3 search (`S3 *`, 66 shapes): exit 0, no OVER-TARGET/OVER-BUDGET. Worst memory +85 MiB (`cells one-wide mapped pinned`,
  repeats +82 to +85, 145-150 ms), 57 percent of the budget; worst time 160 ms in one repeat (`cells one-wide generic pinned`),
  32 percent. FIXB3's own claim (+89 MiB, 289 ms single run) is consistent; this host measured a little lower.
- Worst time and memory I saw in the whole gate: 160 ms and +86 MiB.

**R-B2-1 / R-B2-2.** R-B2-1: test `red-first (R-B2-1)` passes (days 0 and 1 share a 300-char stem; floating flag follows the
matched holiday); the differential's report flags (10 of 168 days floating) equal T09's. R-B2-2: test passes; my own probe
(`rb2.mjs`) shows 36 of 36 combinations refused `unsupported_encoding` (ISO-8859-1, latin1, windows-1252, GBK, EUC-JP, ASCII,
UTF-32, UTF-7 in double quotes, plus single-quoted ISO-8859-1, in workbook.xml, a worksheet, sharedStrings and the rels part);
UTF-8 and no-encoding controls accepted.

**Benign differential.** (a) Structured probe against T09 (13a258d, `npm ci` exit 0; both `probe-b2-diff` and the FIXB3 `diff`):
template and 12-dated-sheet workbook: reader cells identical (0 differences), every preview section EQUAL, findings 6/6 and
60/60 with problems none, floating flags 0 of 0 and 10 of 168 with 0 differences; new 9-13 ms against old 19-52 ms.
(b) Whole-JSON compare (my own workbooks, `diff-build`/`diff-run`): the new JSON hashes are byte-identical to the REGATE2
hashes (`2285f7ee...` template, `b830fb06...` twelve), but they are not byte-identical to T09's raw JSON. The only difference
is the additive finding field `"sourceCount"` (introduced in 0f7fba2, WP4-FIXB, accepted at WP4-REGATE and expected by both
differential probes); after dropping it both files are equal (`20-strip.txt`). I read "byte-identical" as per the accepted
probe's rule, and flag this nuance for the coordinator.

**Flakes and reruns.** None; no check failed.

**Incidents.** (1) Rule slips: I fed an empty heredoc to `python -` twice, which hangs waiting on stdin, and wrote one
`2>/dev/null` and one `rm -f /dev/null`-style no-op; the `/dev/null` device is intact, nothing was read or written there.
(2) Two `python.exe` processes from those stdin slips are still running (PIDs 23164 and 62100 in tasklist; they are not from
the probes). I may not kill by PID; the coordinator or user should end them. Each was started by a Bash call that the harness
moved to background (IDs bryvytfht, b4ii7m674). No other process, server, container or browser is left.

**Limits.** NAS NOT VERIFIED. Nothing was committed, pushed or sent. Failing items: none.
