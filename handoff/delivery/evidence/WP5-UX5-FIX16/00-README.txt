WP5-UX5-FIX16 evidence (timesheet-worker-high, self-reported model claude-sonnet-5-5), masked LF text.
Base be2afa2e3c43514581ed62fd145c15eeef13b534, start digest ff73565b48f1101cd8038d08eb24270970e58b0ef1c02378be431cc7134c686f (882 files).
Final digest of the changed working tree 18aa0ad0f99fbab18ae535d8b36375b756469a717e08b675a1e5d93d7459267c (882 files).
Paths are masked: <task> = the task folder outside the repository, <repo> = the repository, <user> = a profile path.
All data is synthetic; mail is capture only; passwords are random per run and never printed.
Export A = scratch export of be2afa2 (reproduction, new tests on the original and the fixed restore.ts, mutants).
Export B = scratch export of the working tree (be2afa2 plus the five changed files outside handoff/), used for npm test, the
integration files, the HTTP and CLI probe after the fix and the real-clock FULL e2e.

00-start-state, 00-census-start, 00-setupA/B, 00-changed-files   start state, host census, scratch setups, the changed paths
10-*, 11-*                                     reproduction on be2afa2 (auditor's in-process probe: 6 of 12 fail; HTTP and CLI probe B, C, D fail)
20-*, 21-*                                     the new cases on the original restore.ts (6 fail) and on the fixed one (all pass)
30-*, 31-*                                     after the fix: in-process probe 12 of 12, HTTP and CLI probe failures 0
40-*                                           dist/ comparison against the build of be2afa2 (only restore.js and its map differ)
41-*                                           lint, typecheck, build, git diff --check and verify in the repository
50-*, 51-*, 52-*                                export B: typecheck, lint, build, npm test, five integration files
60-*, 61-*                                     mutants (summary and the failing tests of each) and the byte-equal restore check
70-*                                           real-clock FULL e2e, both projects
80-*                                           digest before the final check and the final digest (export form and npm run digest agree)
90-*                                           scripts (env, setup, checks, mutants, mask, digest); the two probes are the auditor's,
                                               unmodified, in the RECHECK-B2 evidence folder (40-restore-probe.ts.txt, 50-http-restore.mjs.txt)
99-*                                           host census at the end and the leftover check
