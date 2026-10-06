# WP4-DEPCLEAN2 dispatch brief

- Mission/task: timesheet-software-readiness / WP4-DEPCLEAN2; package WP4; kind
  implement; attempt 1; depends on WP4-FIXB4. WP4-FIXB4 is done but not committed;
  keep its working-tree changes and do not edit those files.
- Title: move `fflate` from `dependencies` to `devDependencies`. After WP4-FIXB4 the
  reader uses Node's native zlib, so no file under `src/` imports `fflate`. Only
  `tests/support/syntheticWorkbook.ts` and `tests/integration/workbook-reader.test.ts`
  still import it, plus the drill, which runs on the host through the test helper.
- Profile/routing: timesheet-worker, requested sonnet, no override. Effort stays at the
  profile's level, medium. Routing: size S, risk L, not novel. Records in English.
- Read AGENTS.md from disk first, in particular rule 11. Then read the
  [WP4-FIXB4](WP4-FIXB4.md) results and [WP4-DEPCLEAN](WP4-DEPCLEAN.md) as the pattern
  to follow.
- Baseline: main at 972ccda6409a7521a008c55c35a5b5cf416daf1e, plus the uncommitted
  WP4-FIXB4 changes.

## Runtime

Use the WP4-DEPCLEAN rules, with the task folder
`D:\.claude-tmp\timesheet\WP4-DEPCLEAN2`:
- Use Git Bash only. Never use `cmd.exe` in any form.
- **NEVER feed anything to python or node through stdin.**
- Put Node 24 and its npm first on PATH.
- Set `DATA_DIR` and `DATABASE_PATH` explicitly for any CLI run.
- Never redirect to /dev/null or nul. Never remove folders recursively.
- If a permission check denies a call, stop and report.
- Do not commit.

## Required changes

1. Use the Grep tool to confirm that nothing under `src/` or `scripts/` imports
   `fflate`, except through `tests/support/`.
2. Move `fflate` to `devDependencies` at the same exact version, 0.8.3. Use npm itself,
   for example `npm install --save-dev --save-exact fflate@0.8.3`. The change touches
   only `package.json` and `package-lock.json`, and no other package version may change.
   Compare the lock by package name and version, and record the result.
3. Confirm that the image build still works without `fflate` at runtime. Check the
   runtime stage's install command in the Dockerfile and report whether it omits dev
   dependencies. Run no docker command here; WP4-REGATE4 runs the drill.
4. On a scratch clone of the result, run `npm ci`. It must print no deprecation line.
   Then run `npm audit --omit=dev`.

## Owned (writable) paths

- `package.json` and `package-lock.json`.
- This report and `handoff/delivery/evidence/WP4-DEPCLEAN2/`.

## Checks

Run these last, after the final change:
1. `npm run verify`, with deprecation tracing. It must show the same test count as
   WP4-FIXB4 (1,758) and 0 deprecation lines.
2. `npm run digest`.

Write evidence as masked LF `.txt` files. Run the precommit check over it on a temporary
index.

Return at most 100 words, beginning with your self-reported model.

## Results

Self-reported model: claude-sonnet-5-5. Status: done, not committed.

- Grep: no import of fflate under src/ or scripts/ (only a comment in xlsxReader.ts); only tests/support/syntheticWorkbook.ts imports it.
- `npm install --save-dev --save-exact fflate@0.8.3`: exit 0. package.json: fflate moved to devDependencies (same 0.8.3); package-lock.json: 3 lines. Name/version lock compare: no added/removed/changed package.
- Dockerfile runtime stage (line 29): `npm ci --omit=dev --ignore-scripts`, so dev dependencies (fflate) are omitted. Docker not run.
- Scratch export (tree 4a09cf7da6971f457bfc507f64e57abb8d717611): `npm ci` exit 0, 0 deprecation lines; `npm audit --omit=dev` exit 0, 0 vulnerabilities.
- `npm run verify` (--trace-deprecation --pending-deprecation): exit 0, 76 files, 1758 tests, 0 deprecation lines, smoke ok.
- `npm run digest`: 26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081 (775 files).
- Precommit check on temporary index: PASS, 7 files, 0 findings.
- Evidence: handoff/delivery/evidence/WP4-DEPCLEAN2/*.txt.
- Commit description: Move fflate to devDependencies now that only tests use it.
