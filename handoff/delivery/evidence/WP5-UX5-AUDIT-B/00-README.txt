WP5-UX5-AUDIT-B evidence (area B audit of f4049aa7905e22f1467dfcae4208675cb2fc8e80, digest 26b163a6...5336, 882 files)

All files are masked LF text: ANSI codes removed, profile paths written <user>, the task folder <task>, the clean export
<export>, trailing whitespace stripped (so git diff --check stays clean). No .json, no image, no password, hash or
token; addresses only on example.invalid (Message-IDs on timesheet.invalid). Probe scripts are stored as *.ts.txt,
*.mjs.txt, *.py.txt and *.sh.txt (never as code files, so lint does not parse them). Raw logs stay in the task folder
D:\.claude-tmp\timesheet\WP5-UX5-AUDIT-B.

00  digest before and after (three forms), work tree after the mutants
01  author models of WP5-UX4 and WP5-UX5 from the board
10  core checks: typecheck, lint, build, npm test x2, 30 integration files (exit codes and counts)
11  npm ci, npm audit --omit=dev, full npm audit, npm ls, and the base's npm ci for comparison
12  nodemailer 10.0.14 vs 10.1.4 and zod 4.6.5 vs 4.6.6 on app-shaped inputs
13  FIX4-FIX6 diff of package.json, the two scripts, fixtures.ts and vitest.config.ts
14  fetch call sites of the smoke script, the drill and the e2e fixtures
20  the font and OFL.txt against the upstream Google Fonts copies, README facts
21  Dockerfile, .dockerignore and every font reference
22  tracked raster/PDF/font/signature files of the target tree
30  a REAL schema-13 database built by the base build 8e55710 (build log)
31  its upgrade by the target CLI and the checks (31b: first run with a probe defect; 31c: folded Subject headers)
32  the base build against schema 15 (refused)
33  backup and isolated restore of four variants and nine sends
34  sign-off image guards after migration 0014
35  17 own mutants on targeted test files; 36 survivors against the full suite (and M12b); 37/38 details of M2 and M11
40  PDF content probe (8 renders); 41 the holiday-name length that hides "Leave h:mm"
50  HTTP area-B probe run 1 (8 FAILs from my own wrong expectations); 51 run 2 (89 PASS)
52  cross-revision in-flight sends; 53 the T06 sample generator re-run on the target; 54 sample hashes in the packet
55  owner decision H-1 a probe; 56 the same probe under mutant M6
60  AC-13 under Asia/Tokyo; 61/62 full e2e summary and test list
70-78  docs diffs, greps, parity, Ingat non-interference, change scope, base in-flight checks
90-99  probe and helper scripts
