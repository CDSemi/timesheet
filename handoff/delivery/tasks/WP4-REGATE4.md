# WP4-REGATE4 dispatch brief

- Mission/task: timesheet-software-readiness / WP4-REGATE4; package WP4; kind gate;
  attempt 1; depends on WP4-FIXB4-FREEZE.
- Scope: rerun the WP4 package-final gate on the round-4 fix freeze. WP4-FIXB4 made the
  inflate step linear, derived the cost bound from the limits, and set ceilings where
  needed.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H, novelty no.
- Target: `freeze_commit` is the WP4-FIXB4-FREEZE commit, given in the dispatch prompt.
  The digest of record is computed on the clean export and cross-checked with the
  `git ls-tree` form.
- Read [WP4-REGATE3](WP4-REGATE3.md), [WP4_RECHECK_B3](../WP4_RECHECK_B3.md) and the
  [WP4-FIXB4](WP4-FIXB4.md) results.

## Runtime

Follow the WP4-REGATE3 rules, with the task folder `D:\.claude-tmp\timesheet\WP4-REGATE4`
and the Compose project `ts-wp4-regate4`.

**Never feed anything to python or node through stdin.** Write probe files and run them.
Set `DATA_DIR` and `DATABASE_PATH` explicitly for every run. Never use `cmd.exe`. If a
permission check denies a call, stop and report. Leave nothing running.

## Gate items

1. Run the WP4-REGATE3 gate again on the new freeze:
   - all 13 items;
   - the round-1, RB-01 and RB2-01 checks.
2. RB3-01 checks:
   - Rebuild the WP4-RECHECK-B3 incompressible shapes from
     `handoff/delivery/evidence/WP4-RECHECK-B3/probe-rcb3-cases*.mjs.txt`.
   - Run the WP4-FIXB4 bound confirmation.
   - Each case is refused fast, or stays within the stated derived bound and the
     500 ms / +150 MiB budget. `/api/health` must stay responsive and no request may
     answer 500.
   - Record the worst time and memory measured.
3. If the upload ceiling changed:
   - the route answers 413 just above it, and accepts the template and a realistic
     workbook;
   - the client message and the docs (EN and VI) match the new ceiling.
4. The benign differential against WP4-T09 is identical after dropping `sourceCount`.
5. Diff scope since 972ccda: only WP4-FIXB4 paths and handoff records.

## Output

Write your results into this file. Write masked LF evidence to
`handoff/delivery/evidence/WP4-REGATE4/`. Decide PASS or FAIL.

Return at most 200 words, beginning with your self-reported model.

## Results

### Verifier result (attempt 1) - decision: PASS

Self-reported model: claude-sonnet-5-5. Freeze 546cddaf6747aef85e8b6d9b7712de9e28f138bf. Node v24.21.0 portable, Git Bash,
workflow Python for the validators. Raw output `D:\.claude-tmp\timesheet\WP4-REGATE4`; masked LF evidence
`handoff/delivery/evidence/WP4-REGATE4/` (00-README maps the files). DATA_DIR and DATABASE_PATH were set under the task
folder for every CLI/server run; Compose project `ts-wp4-regate4`.

**Digest.** HEAD 546cdda before and after. Digest of record `26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081`
(775 files, handoff/ excluded): equal in three forms (`npm run digest`, the `git ls-tree` form, and the clean `git archive`
export hashed with `git hash-object --no-filters`). Equals the committer's claim. Unchanged after the checks (all three
re-computed; the export from the tar listing, so build output is not counted).

| # | Item | Command / exit | Result |
|---|---|---|---|
| 1 | Export, install | `npm ci` exit 0 | No deprecation line. fflate is in devDependencies only. |
| 2 | Verify | `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify` exit 0 | 76 files, 1758 tests passed; no deprecation line; SMOKE PASSED, 41 PASS, 0 FAIL. |
| 3 | E2E | `npm run test:e2e` exit 0 | 145 passed, 5 skipped. |
| 4 | Drill | `drill:container --project ts-wp4-regate4 --wp3` exit 0 | DRILL STAGES 1-6 PASSED, 208 PASS (33/31/57/35/27/23), 0 FAIL. Image `ts-wp4-regate4-timesheet:drill` removed by name; no container, network or volume remains. WP3 build copied from the REGATE3 task folder. |
| 5-6 | Workbook, runbook | in the 1758 run and the drill | Pass. |
| 7 | Migrations | probe exit 0; `vitest run migrations upgrade`: 61 passed | Fresh 1..13 and WP3 (schema 6) upgrade 7..13: integrity ok, fk 0, rerun applied nothing. |
| 8 | Races, 10 fresh processes each | `races.sh` exit 0 | ot-leave, finalization, deadline, sharing revocation, import concurrent commit, opening-balance: 10/10 each. |
| 9 | Privacy, admin boundary | in the 1758 run | Pass. |
| 10 | NAS target | none | NOT VERIFIED (no owner access). Budget measured on this workstation only. |
| 11 | Validators | `validate_package.py --preflight`, `validate_orchestration.py`, `check_recovery.py` exit 0, 0, 0 | All PASS. `precommit-check.mjs --self-test` PASS; precommit over this evidence folder (temporary git dir outside the repository): PASS, 50 files, 0 findings. |
| 12 | Diff scope since 972ccda | `git diff --name-status 972ccda 546cdda` | Non-handoff paths: docs/07 and docs/11 (EN, VI), package.json and package-lock.json (WP4-DEPCLEAN2), `src/client/importModel.ts`, `src/server/app.ts`, `xlsxReader.ts`, `routes/imports.ts`, the client importModel test, the e2e import spec, the two workbook integration tests. All are WP4-FIXB4 or WP4-DEPCLEAN2 paths; the rest are handoff records. |
| 13 | Mapping | unchanged | Every gate line maps to a test, a drill step or a NOT VERIFIED label. |

**Round-1, RB-01, RB2-01 checks.** a03 (7 invalid files, all exit 1, no SECRET-LIKE marker) and R-A1 (prune with a future
backup exits 2 `clock_behind_backups`, 3 folders before and after) pass; targeted run (migrations, upgrade, ops, backup,
prune, bootstrap, config) 6 files, 170 passed. Probes r1 (39 cases), r3, P1b, P7: exit 0, no OVER-BUDGET, no THROWN; refused
in 0-11 ms or accepted well inside the budget. HTTP r2, P6, B02: only 201/422, health 2-5 ms during uploads, no error line.
FIXB3 + RB2 catalogue and search (`cost.mjs`, 210 shapes, 2 runs each): exit 0, no OVER flag; worst 86 ms, +46 MiB.

**RB3-01 checks.**
- The WP4-RECHECK-B3 catalogues (`probe-rcb3-cases` 67 cases, `probe-rcb3-cases2` 37), rebuilt at their old sizes: every
  case refused (`part_too_large`, `total_xml_too_large`, `too_many_elements`, `package_too_large`), one accepted; worst 89 ms,
  +52 MiB. Their incompressible packages over 2 MiB (up to 5.4 MB) answer HTTP 413 in 3 ms.
- FIXB4 bound confirmation (`probe-worst`, 23 constructions at the ceilings, 3 runs each, fresh process per run): all
  accepted, none over budget; worst 107 ms and +70 MiB. Whole `previewImport` service call on the same 23: worst 104 ms,
  +46 MiB, all 201. The formula (40 ms + 14.8 ns X + 339 ns O; 15 MiB + 13.3 B X + 428 B O at X = 3 MiB, O = 100 000)
  evaluates to about 120 ms and +96 MiB; the measured worst is under it (107 ms, +70 MiB; 21 % and 47 % of the budget).
- HTTP, 4 over-ceiling and 23 at-ceiling packages plus 3 catalogue shapes: 413 x4, 201 x23, 422 x3, no 5xx and no transport
  error; worst `/api/health` during an upload 113 ms (idle 2 ms); server stderr no error line.
- Worst time and memory seen in the whole gate: 113 ms (health under load; 107 ms preview) and +70 MiB.

**413 ceiling (item 3).** Route: exactly 2 MiB reaches the reader (422 `not_a_zip`); 2 MiB + 1 byte, 3 MiB and 8 MiB answer
413 `payload_too_large` in 2 ms. The tracked template (25 878 B) answers 201 in 28 ms; a realistic 61-dated-sheet workbook
(318 122 B) 201 in 74 ms. Client text `2 MiB` (`importModel.ts`; unit and e2e tests in the green runs), docs/07 and docs/11 EN
and VI say 2 MiB; `git grep '8 MiB'` finds no stale upload limit in docs or src.

**Benign differential (item 4).** Template and 12-dated-sheet workbook against the accepted WP4-T09 reader (13a258d,
fast-xml-parser): whole JSON equal after dropping `sourceCount` (2 916 and 63 254 chars); new JSON hashes `2285f7ee...` and
`b830fb06...` equal to the REGATE2/3 hashes; structured probe: reader cells 0 differences, every preview section EQUAL,
findings 60/60, floating flags 10 of 168 with 0 differences. New 6-14 ms against old 22-58 ms.

**Flakes, incidents.** (1) `p6` and `b02` first runs returned 401 (my path-quoting run in a fresh folder; the probe's login
did not succeed); rerun in fresh work folders both gave the expected 422/201 (b02: 422, 201, template 201). First-run logs are
kept as `12-*-run1-401.txt`. (2) The shared `http.mjs` copy had a masked `<email>` placeholder; I fixed the copy and reran. (3)
Rule slips: I piped one probe into `head -3`, which killed the parent and left its server child running (a Node 24.21 process
started 12:27, task folder `work/b02d`); I may not kill by PID, the coordinator should end it. (4) I ran one stray
`rm -rf /dev/null` (no effect, the device is intact). No other process, server or container is left.

**Limits.** NAS NOT VERIFIED. The bound's coefficient measurement (`probe-coeff`, 61 families) was not repeated; I confirmed the
formula by evaluating it and by the measured worst constructions. Nothing was committed, pushed or sent. Failing items: none.
