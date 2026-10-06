# WP4-DEPCLEAN dispatch brief

- Mission/task: timesheet-software-readiness / WP4-DEPCLEAN; package WP4; kind implement;
  attempt 1; depends on WP4-FIXB2.
  - WP4-FIXB2 is done but not committed, so its changes are already in the working
    tree. Keep them, and do not edit those files.
- Title: remove the now-unused `fast-xml-parser` dependency.
  - WP4-FIXB2 replaced that parser with a bounded streaming scanner.
  - `fast-xml-parser` was added in WP4-T08, and only `package.json` still names it
    outside handoff/.
- Profile/routing: timesheet-worker, requested sonnet, no override. Effort stays at the
  profile's level, medium. Routing: size S, risk L, not novel. Records in English.
- Read AGENTS.md from disk first, rule 11 in particular. Then read the results of
  [WP4-FIXB2](WP4-FIXB2.md) and [WP4-T08](WP4-T08.md).
- Baseline: main at 0f7fba2ee6bc2a7affcd1a3bf800e085351c7b65, plus the uncommitted
  WP4-FIXB2 changes.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, or any interactive shell. Never
  feed scripts to python or node through stdin.
- Put Node 24 and its npm first on PATH, using the full portable path. Make the first
  shell call a trivial `node --version`. Keep shell calls in the foreground.
- Use `D:\.claude-tmp\timesheet\WP4-DEPCLEAN` for TEMP/TMP, the npm cache if you need
  one, a scratch clone and all raw output.
- Set `DATA_DIR` and `DATABASE_PATH` explicitly there for any CLI or server run.
- Never kill processes by PID, never redirect to /dev/null or nul, and never remove
  folders recursively.
- If a permission check denies a call, stop and report.
- Write records with the Edit tool. Do not commit.

## Required changes

1. Confirm that no source, test or script imports `fast-xml-parser`. Use the Grep tool.
2. Remove it with `npm uninstall fast-xml-parser`. This updates `package.json` and
   `package-lock.json` only.
   - The lock may drop its transitive packages, such as `strnum`. Record which ones.
   - No other dependency version may change. Compare the lock diff by package name and
     version, and record it.
3. On a scratch clone of the result, run `npm ci`. It must print no deprecation line.
   Then run `npm audit --omit=dev` and record the result.

## Owned (writable) paths

- `package.json` and `package-lock.json`.
- This report and `handoff/delivery/evidence/WP4-DEPCLEAN/`.

## Checks

Run these last, after the final change:
1. `npm run verify` with `--trace-deprecation --pending-deprecation`. It must exit 0
   with the same test count as WP4-FIXB2 (1,750) and no deprecation line.
2. `npm run digest`.

Write masked, LF `.txt` evidence, and run the precommit check over it on a temporary
index.

Return at most 100 words, beginning with your self-reported model:
- the removed packages;
- any other lock changes (there should be none);
- the `npm ci` and audit results;
- the verify exit code and test count;
- the digest.

## Results

Self-reported model: claude-sonnet-5-5. Status: done, not committed.

- Grep: no source/test/script imports fast-xml-parser; only package.json and the lock named it.
- `npm uninstall fast-xml-parser`: removed 8 packages; changed only package.json (1 line) and
  package-lock.json (121 deletions, 0 additions). Removed: fast-xml-parser 5.11.2,
  fast-xml-builder 1.3.1, strnum 2.4.2, @nodable/entities 3.1.0, anynum 1.0.1,
  is-unsafe 2.0.2, path-expression-matcher 1.6.2, xml-naming 0.3.0. Name/version compare:
  no added or changed package.
- Scratch export (tree 155347580807a4bd37420aaa64ca5f9c8528aa4f): `npm ci` exit 0, no
  deprecation line; `npm audit --omit=dev` exit 0, found 0 vulnerabilities (ci summary shows
  1 high, dev-only).
- `npm run verify` with --trace-deprecation --pending-deprecation: exit 0, 76 files,
  1750 tests passed, 0 deprecation lines.
- `npm run digest` (real repo): 96445de4ad266f0fa70f78c0c72b03625775d170e8841c757c39b2b5cae7d503 (775 files).
- Precommit check on temporary index: PASS, 8 files, 0 findings.
- Evidence: handoff/delivery/evidence/WP4-DEPCLEAN/*.txt.
- Commit description: Remove unused fast-xml-parser dependency and its 7 transitive packages.
