# WP4-RECHECK-B4 evidence (fresh independent auditor; recheck of WP4-FIXB4 / finding WP4-RB3-01; reviewed 546cdda)

Host: Windows 11 x64 developer workstation (the budget's reference host), Node v24.21.0 portable (by full path), Git
Bash. Synthetic data only. Every hostile workbook, database and raw log lived under the task folder
D:\.claude-tmp\timesheet\WP4-RECHECK-B4 (masked <task>); DATA_DIR and DATABASE_PATH were set there for every CLI/server
run; %LOCALAPPDATA%\timesheet-dev was never touched. Paths masked (<project>, <task>, <user>); e-mail masked (<email>);
LF; .txt only. No workbook or binary is in this folder.

The reviewed source is the git-archive export of 546cdda under <task>\export; its src/server/import/xlsxReader.ts,
templateMapping.ts, services/workbookImport.ts, routes/imports.ts and src/client/importModel.ts hash-equal the committed
blobs (git hash-object --no-filters; recorded in the review). The WP4-T09 reader was exported from 13a258d into <task>\t09.

Files:
00-README.txt        this index
01-baseline.txt      HEAD, source digest (both forms) and git status before the checks
02-npm-ci.txt        npm ci on the clean export of 546cdda (exit 0; 1 high dev-only advisory)
03-t09-npm-ci.txt    npm ci on the WP4-T09 export 13a258d (for the differential)
04-verify.txt        npm run verify with --trace-deprecation --pending-deprecation (76 files, 1758 tests, SMOKE, no deprecation)
05-suites.txt        vitest workbook-reader, workbook-import, opening-balance, sharing-matrix (4 files, 131 tests)
14-worst-run.txt     the 23 FIXB4 worst constructions at the ceilings, preview (reader+mapping), 3 runs each
15-rcb3.txt          the WP4-RECHECK-B3 incompressible catalogues at their old sizes vs the new-ceiling reader (refused)
16-worst-full.txt    the 23 worst constructions through the whole previewImport service path, 2 runs each
17-differential.txt  benign differential against WP4-T09 (cells, preview, stored report)
18-correct.txt       decode-once, the caps, R-B2-1 and R-B2-2 correctness probe (75 PASS, 0 FAIL; 3 LENIENT = R-B3-1)
19-http.txt          the built server over HTTP: 413 above the ceiling, 201 for template/realistic/worst, /api/health polled
20-coeff.txt         independent re-measurement of the 61 per-unit cost families (chosen env)
21-bound.txt         the bound recomputed by LP duality from 20-coeff.txt at the chosen ceilings
99-digest-after.txt  source digest after (unchanged) and no non-handoff working-tree change
probe-*.mjs.txt      the probes used (masked; .txt so lint does not parse them). run-cost/worst/coeff/bound/rcb3-cases/
                     rcb3-cases2/correct/diff-* are verbatim copies of the WP4-FIXB4 probes; http is that probe with the
                     seeded login e-mail restored; mask is this auditor's masking script.

Decision: PASS. WP4-RB3-01 is closed (the budget is derived from the limits and holds; the incompressible shapes are
refused by the lowered 2 MiB upload ceiling). Area B still holds. See WP4_RECHECK_B4.md.
