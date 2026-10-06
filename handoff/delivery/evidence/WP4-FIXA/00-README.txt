WP4-FIXA evidence (masked: <work> task folder, <repo> repository, <user>, <email>; LF; synthetic data only)
Node 24.21.0 portable; TEMP/TMP, DATA_DIR and DATABASE_PATH set to the task folder for every run.

01 red   R-A1 prune with a mis-set clock (npx vitest run tests/integration/backup-prune.test.ts): exit 1, 2 failed, 13 passed.
02 green same file after the change: exit 0, 15 passed.
03 red   WP4-A-04 node scripts/smoke-built-server.mjs with DATA_DIR exported: exit 1 (capture check FAIL).
04 green same command after the change: exit 0, SMOKE PASSED, the exported DATA_DIR stayed empty.
05 red   WP4-A-01 full drill (no --wp3) on the OLD image with the new checks: exit 1, stage 1 has 3 FAIL
         (source maps under /app/dist, bundle carries sourceMappingURL, /assets/<bundle>.map answers 200).
         Its 3 stage 3 FAIL lines come from a wrong payroll date (2026-04-24) in the new second sign-off, fixed
         afterwards to 2026-05-15 (04-24 is not a payroll date of the synthetic calendar).
06 red   static asset test before the app.ts change: exit 1 (a missing /assets/*.map answered 200 with index.html).
07 green same test after the change: exit 0, 2 passed.
08       full drill attempt 1 on the NEW image: exit 1, 206 PASS 2 FAIL (the scan flagged dependency .d.ts.map files
         under /app/node_modules, and /assets/<bundle>.map still answered 200 through the SPA fallback). Fixed by scoping
         the scan to /app/dist and by the 404 for /assets/* in app.ts.
09 green full drill, --project ts-wp4-fixa --wp3: exit 0, DRILL STAGES 1-6 PASSED, 208 PASS 0 FAIL
         (stage 1: 33, stage 2: 31, stage 3: 57, stage 4: 35, stage 5: 27, stage 6: 23).
10       validate_package.py --preflight: exit 0 (75 translation pairs).
11       npm run test:e2e: exit 0, 145 passed, 5 skipped.
12       npm run verify (NODE_OPTIONS=--trace-deprecation --pending-deprecation, DATA_DIR exported): exit 0,
         76 files / 1734 tests, SMOKE PASSED, no deprecation line.
13       npm run digest.
