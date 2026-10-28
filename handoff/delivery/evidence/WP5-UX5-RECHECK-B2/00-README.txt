WP5-UX5-RECHECK-B2 evidence (auditor agent ae3c9c12ecb779996, self-reported model claude-opus-5-5), masked LF text.
Target be2afa2e3c43514581ed62fd145c15eeef13b534, digest ff73565b48f1101cd8038d08eb24270970e58b0ef1c02378be431cc7134c686f (882 files).
Paths are masked: <task> = the task folder outside the repository, <repo> = the repository, <user> = a profile path,
<work> = a probe's work folder inside <task>. All data is synthetic; mail is capture only; passwords are random per run and
never printed. Probe scripts are stored as *.ts.txt, *.mjs.txt and *.sh.txt.

00-digest-before.txt, 00-digest-after.txt  digest in three forms (npm run digest, git ls-tree of HEAD and of the SHA, clean exports)
01-author-models.txt                        board tasks WP5-UX4-* and WP5-UX5-* with kind, status, model and agent id
02-change-scope.txt                         git diff --stat a5533b5..be2afa2 outside handoff/, and the src/server name-status
02-diff-areaB.txt                           the diff of restore.ts and of the four area-B test files
02-diff-docs.txt                            the diff of docs/04, 05, 11, 12 (EN and VI)
10-*                                        mandatory checks in the clean export (setup, exits, summaries, build, test, integration, AC-13)
11-*                                        the real-clock FULL e2e, both projects (exits, summary, full log)
20-docs-*                                   EN/VI parity of seven doc pairs and the greps of the release rule
40-restore-probe*                           in-process restore release probe: the source is the final version (12 cases); run 1 had
                                            the first 11 cases; run 2 added E1 with two probe defects (no cookie, one runner pass);
                                            run 3 is the corrected final run
41-midnight-probe*                          in-process check-in boundary and DST probe (source = final version; run 1 had a probe
                                            defect in M2's expectation, run 2 fixed it, run 3 added M5)
50-http-restore*                            real HTTP and CLI restore probe (source, result, stdout)
60-mutants*, 61-mut-*                       mutant runner, summary, the failing assertions, and every run log
90-*                                        helper scripts (environment, setup, chain, e2e, digest, mask, parity, board, TZ runner)
99-leftover-check.txt                       final check that nothing of this task listens or runs
